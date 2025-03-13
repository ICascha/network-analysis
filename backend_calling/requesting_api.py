from __future__ import annotations

import json
from enum import Enum
from typing import Dict, List, Optional

import pandas as pd
import requests


class JobPriority(str, Enum):
    """Available job priority categories."""
    STANDARD = "standard"
    DEFENSE = "defense"
    HEALTHCARE = "healthcare"
    INFRASTRUCTURE = "infrastructure"


class NonSourceJobs(str, Enum):
    """Available non-source jobs categories."""
    STANDARD = "standard"
    AMBITIOUS_AND_EDUCATION = "ambitious-and-education"
    AMBITIOUS_ONLY = "ambitious-only"


class HoursWorked(str, Enum):
    """Available hours worked categories."""
    NOONE = "noone"
    EVERYONE = "everyone"
    PART_TIME = "part-time"
    HEALTHCARE = "healthcare"


class BackendRequest:
    """
    A class to handle workforce optimization API requests.
    
    This class manages the construction and execution of requests to the workforce
    optimization API, handling various parameters and data processing requirements.
    
    Attributes:
        BASE_URL: The base URL for the workforce optimization API
        headers: HTTP headers for the API request
        params: Parameters for the optimization request
    """
    
    BASE_URL = "https://workforce-optimizer-backend-production.up.railway.app/optimize/"
    
    def __init__(
        self,
        government_steering: bool,
        productivity_increase: float,
        hours_worked: HoursWorked,
        job_priority: JobPriority,
        non_source_jobs: NonSourceJobs
    ) -> None:
        """
        Initialize the BackendRequest with the specified parameters.
        
        Args:
            government_steering: Whether to use government steering in optimization
            productivity_increase: Productivity increase factor
            hours_worked: Category of hours worked
            job_priority: Category of job priorities
            non_source_jobs: Category of non-source jobs
        """
        self.headers = self._get_headers()
        self.params = self._get_base_params(productivity_increase)
        self.government_steering = government_steering
        self._load_scenario_data(government_steering)
        self._priority_override(job_priority)
        self._non_source_jobs_override(non_source_jobs)
        self._set_additional_hours(hours_worked)

    
    def _get_headers(self) -> Dict[str, str]:
        """Return the HTTP request headers."""
        return {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "origin": "https://workforce-optimizer-dev.up.railway.app",
            "referer": "https://workforce-optimizer-dev.up.railway.app/",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent": (
                "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/131.0.0.0 Mobile Safari/537.36"
            )
        }
    
    def _get_base_params(self, productivity_increase: float) -> Dict:
        """
        Return the base optimization parameters.
        
        Args:
            productivity_increase: The productivity increase factor
        
        Returns:
            Dictionary of base parameters for the optimization
        """
        return {
            "automation_level": 0,
            "productivity_increase": 0.002 * productivity_increase,
            "easy_cutoff": 0.45,
            "medium_cutoff": 0.3,
            "difficult_cutoff": 0.15,
            "disable_double_hop": True,
            "income_cutoff": 0.1,
            "optimize_excess": False,
            "weight_ability": 0.33,
            "weight_skill": 0.67,
            "men_15_25": 76,
            "men_25_55": 88.5,
            "men_55_75": 51,
            "women_15_25": 76,
            "women_25_55": 83.6,
            "women_55_75": 40.9,
            "fraction_55_more_years": 0.1,
            "additional_hours_worked": "{}"
        }
    
    def _get_scenario_file(self, government_steering: bool) -> str:
        """
        Return the appropriate scenario file path.
        
        Args:
            government_steering: Whether to use government steering
        
        Returns:
            Path to the scenario file
        """
        suffix = "met" if government_steering else "zonder"
        return f"data/Scenario - {suffix} overheidssturing.xlsx"
    
    def _read_excel_data(
        self,
        file_path: str,
        sheet_name: str,
        index_col: str,
        value_col: str
    ) -> Dict:
        """
        Read and process Excel data into a dictionary.
        
        Args:
            file_path: Path to the Excel file
            sheet_name: Name of the sheet to read
            index_col: Column to use as dictionary keys
            value_col: Column to use as dictionary values
        
        Returns:
            Dictionary of non-zero values from the Excel data
        """
        try:
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            data = df.set_index(index_col)[value_col].dropna().to_dict()
            return {k: v for k, v in data.items() if v != 0}
        except Exception as e:
            raise ValueError(f"Error reading Excel file {file_path}: {str(e)}")
    
    def _read_excel_list(
        self,
        file_path: str,
        sheet_name: str,
        column: str
    ) -> List[str]:
        """
        Read and process Excel data into a list.
        
        Args:
            file_path: Path to the Excel file
            sheet_name: Name of the sheet to read
            column: Column to extract values from
        
        Returns:
            List of non-null values from the specified column
        """
        try:
            return pd.read_excel(file_path, sheet_name=sheet_name)[column].dropna().tolist()
        except Exception as e:
            raise ValueError(f"Error reading Excel file {file_path}: {str(e)}")
    
    def _process_productivity_changes(self, data: Dict) -> Dict:
        """
        Convert productivity percentage strings to decimal values.
        
        Args:
            data: Dictionary of productivity changes as percentage strings
        
        Returns:
            Dictionary of productivity changes as decimal values
        """
        try:
            return {
                job: float(str(prod).replace("%", "")) / 100
                for job, prod in data.items()
            }
        except ValueError as e:
            raise ValueError(f"Error processing productivity changes: {str(e)}")
    
    def _load_scenario_data(self, government_steering: bool) -> None:
        """
        Load all scenario data from Excel file.
        
        Args:
            government_steering: Whether to use government steering
        """
        file_path = self._get_scenario_file(government_steering)
        
        try:
            # Load change dictionary
            self.params["change_dict"] = json.dumps(
                self._read_excel_data(file_path, "Labor Demand", "Job", "Demand Change")
            )
            
            # Load priority and non-source jobs
            self.params["priority_jobs"] = json.dumps(
                self._read_excel_list(file_path, "Constraints", "Priority Jobs")
            )
            self.params["non_source_jobs"] = json.dumps(
                self._read_excel_list(file_path, "Constraints", "Non-Source Jobs")
            )
            
            # Load and process productivity increases
            productivity_data = self._read_excel_data(
                file_path,
                "Constraints",
                "Job (Productivity)",
                "Productivity Change"
            )
            
            self.params["productivity_increase_per_job"] = json.dumps(
                self._process_productivity_changes(productivity_data)
            )
        except Exception as e:
            raise ValueError(f"Error loading scenario data: {str(e)}")
    
    def _priority_override(self, job_priority: JobPriority) -> None:
        """
        Override the job priority parameter.
        
        Args:
            job_priority: Category of job priorities to use
        """
        try:
            priority_df = pd.read_excel(
                "data/Priority and non-source jobs (categories).xlsx",
                skiprows=1
            )
            
            priority_mapping = {
                JobPriority.STANDARD: "Standaard (mix)",
                JobPriority.DEFENSE: "Defensie",
                JobPriority.HEALTHCARE: "Gezondheids- en welzijnszorg",
                JobPriority.INFRASTRUCTURE: (
                    "Woningbouw, infrastructuur en voorbereiden op en "
                    "aanpakken van klimaatverandering "
                )
            }
            
            column = priority_mapping[job_priority]
            self.params["priority_jobs"] = json.dumps(
                priority_df[column].dropna().tolist()
            )
        except Exception as e:
            raise ValueError(f"Error overriding job priorities: {str(e)}")
    
    def _non_source_jobs_override(self, non_source_jobs: NonSourceJobs) -> None:
        """
        Override the non-source jobs parameter.
        
        Args:
            non_source_jobs: Category of non-source jobs to use
        """
        try:
            non_source_df = pd.read_excel(
                "data/Priority and non-source jobs (categories).xlsx",
                skiprows=1,
                sheet_name="Non-source jobs"
            )
            
            mapping = {
                NonSourceJobs.STANDARD: "i. Standaard",
                NonSourceJobs.AMBITIOUS_AND_EDUCATION: "ii. banen in ambitiesectoren + onderwijs",
                NonSourceJobs.AMBITIOUS_ONLY: "iii. Alleen banen in ambitiesectoren"
            }
            
            column = mapping[non_source_jobs]
            self.params["non_source_jobs"] = json.dumps(
                non_source_df[column].dropna().tolist()
            )
        except Exception as e:
            raise ValueError(f"Error overriding non-source jobs: {str(e)}")
        
    def _get_all_jobs(self, file_path: str) -> List[str]:
        """
        Get a complete list of all jobs from the Excel file.
        
        Args:
            file_path: Path to the scenario Excel file
            
        Returns:
            List of all job names
        """
        try:
            df = pd.read_excel(file_path, sheet_name="Labor Demand")
            return df["Job"].dropna().unique().tolist()
        except Exception as e:
            raise ValueError(f"Error reading jobs from Excel file: {str(e)}")
    
    def _get_part_time_names(self) -> List[str]:
        """
        TODO: This method should return a list of job names that are considered part-time.
        Currently returns an empty list as a placeholder.
        
        Returns:
            List of job names for part-time workers
        """
        df = pd.read_excel("data/deeltijdfactor.xlsx")
        df.columns = ['Job Name', 'Part Time Factor']
        part_time_jobs = df[df['Part Time Factor'] < 0.801]['Job Name'].tolist()
        return part_time_jobs
    
    def _get_healthcare_names(self) -> List[str]:
        """
        Returns list of healthcare job names that should receive additional hours.
        
        Returns:
            List of healthcare job names
        """
        return [
            'Verzorgenden en verleners van overige persoonlijke diensten',
            'Sociaal werkers, groeps- en woonbegeleiders',
            'Gespecialiseerd verpleegkundigen',
            'Medisch vakspecialisten',
            'Medisch praktijkassistenten',
            'Fysiotherapeuten',
            'Psychologen en sociologen',
            'Verpleegkundigen (mbo)'
        ]
    
    def _set_additional_hours(self, hours_worked: HoursWorked) -> None:
        """
        Set the additional hours worked parameter based on the selected category.
        
        Args:
            hours_worked: Category of hours worked to apply
        """
        hours_dict = {}
        extra_hours = 2/40  # 2 hours extra as a fraction of 40-hour work week
        
        if hours_worked == HoursWorked.NOONE:
            hours_dict = {}
        elif hours_worked == HoursWorked.EVERYONE:
            # Get all jobs from the scenario file
            file_path = self._get_scenario_file(self.government_steering)
            all_jobs = self._get_all_jobs(file_path)
            hours_dict = {job: extra_hours for job in all_jobs}
        elif hours_worked == HoursWorked.HEALTHCARE:
            healthcare_jobs = self._get_healthcare_names()
            hours_dict = {job: extra_hours for job in healthcare_jobs}
        elif hours_worked == HoursWorked.PART_TIME:
            part_time_jobs = self._get_part_time_names()
            hours_dict = {job: extra_hours for job in part_time_jobs}
        
        self.params["additional_hours_worked"] = json.dumps(hours_dict)
    
    def make_request(self) -> Dict:
        """
        Make the API request and return the response.
        
        Returns:
            JSON response from the API
        
        Raises:
            requests.RequestException: If the API request fails
        """
        try:
            response = requests.get(
                self.BASE_URL,
                headers=self.headers,
                params=self.params
            )
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise requests.RequestException(
                f"API request failed with status {response.status_code}: {str(e)}"
            )


if __name__ == "__main__":
    try:
        request = BackendRequest(
            government_steering=True,
            productivity_increase=1,
            hours_worked=HoursWorked.EVERYONE,
            job_priority=JobPriority.STANDARD,
            non_source_jobs=NonSourceJobs.STANDARD
        )
        response = request.make_request()
        print(json.dumps(response, indent=2)[:100])
    except Exception as e:
        print(f"Error: {str(e)}")