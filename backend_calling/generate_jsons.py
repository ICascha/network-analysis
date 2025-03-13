from __future__ import annotations

import json
import gzip
from itertools import product
from typing import Dict, Any, List, Tuple
from pathlib import Path
import logging
from time import sleep

from requesting_api import BackendRequest, JobPriority, NonSourceJobs, HoursWorked
from job_names import job_name_mapping

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def convert_shortage_components_to_workforce_metrics(components: Dict[str, Any]) -> Dict[str, Any]:
    """Convert shortage components data to workforce metrics format."""
    expansion_demand = components["demand_change_2035"]
    return {
        "labor_supply": int(round(components["workforce_2024"])),
        "net_labor_change": int(round(components["net_change_2035"])),
        "transitions_in": int(round(components["transitions_in"])),
        "transitions_out": int(round(components["transitions_out"])),
        "superfluous_workers": int(round(components["excess_workers"])),
        "shortage": int(round(components["shortage"])),
        "productivity": int(round(components["productivity"])),
        "expansion_demand": int(round(max(0, expansion_demand))),  # Positive part
        "reduction_demand": int(round(min(0, expansion_demand))),  # Negative part
        "vacancies": int(round(components["vacancies_labour_friction"]))
    }



def calculate_total_workforce_metrics(workforce_changes: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate totals for all workforce metrics."""
    totals = {
        "labor_supply": 0,
        "net_labor_change": 0,
        "transitions_in": 0,
        "transitions_out": 0,
        "superfluous_workers": 0,
        "shortage": 0,
        "productivity": 0,
        "expansion_demand": 0,
        "reduction_demand": 0,
        "vacancies": 0
    }
    
    for job_metrics in workforce_changes.values():
        for metric, value in job_metrics.items():
            totals[metric] += value
    
    return {k: int(round(v)) for k, v in totals.items()}


def get_top_transitions(
    transitions: Dict[str, Dict[str, float]],
    id_lookup: Dict[str, int],
    top_n: int = 10
) -> List[Dict[str, Any]]:
    """Extract top N transitions, excluding self-transitions."""
    flat_transitions = [
        {
            "sourceJobId": id_lookup[source_job],
            "targetJobId": id_lookup[target_job],
            "amount": int(round(amount))
        }
        for source_job, targets in transitions.items()
        for target_job, amount in targets.items()
        if source_job != target_job and amount > 0
    ]
    
    return sorted(
        flat_transitions,
        key=lambda x: x["amount"],
        reverse=True
    )[:top_n]


def create_job_lookups(
    processed_data: Dict[str, Any]
) -> Tuple[Dict[int, str], Dict[str, int]]:
    """Create bidirectional job ID lookups."""
    unique_jobs = set()
    unique_jobs.update(processed_data["shortages"].keys())
    unique_jobs.update(processed_data["components"].keys())
    unique_jobs.update(
        k for trans in processed_data["transitions"].values()
        for k in trans.keys()
    )
    
    job_list = sorted(list(unique_jobs))
    next_id = len(job_list)
    
    # Create forward lookup (ID -> name)
    job_lookup = {i: name for i, name in enumerate(job_list)}
    job_lookup[next_id] = "Totaal"
    
    # Create reverse lookup (name -> ID)
    id_lookup = {name: i for i, name in job_lookup.items()}
    
    return job_lookup, id_lookup


def process_single_response(
    response_data: Dict[str, Any],
    id_lookup: Dict[str, int],
    next_id: int
) -> Dict[str, Any]:
    """Process a single API response into the required format."""
    # Extract data components
    processed_data = {
        "shortages": response_data["shortages_by_job"],
        "transitions": response_data["transitions"],
        "components": response_data["shortage_components"]
    }
    
    # Process shortages
    shortages = [
        {
            "jobId": id_lookup[job_name],
            "shortage": int(round(shortage_value))
        }
        for job_name, shortage_value in processed_data["shortages"].items()
        if shortage_value > 0
    ]
    
    # Process transitions
    transitions = get_top_transitions(processed_data["transitions"], id_lookup)
    
    # Process workforce changes
    workforce_changes = {}
    for job_name, components in processed_data["components"].items():
        job_id = id_lookup[job_name]
        workforce_changes[str(job_id)] = convert_shortage_components_to_workforce_metrics(components)
    
    # Add totals
    totals = calculate_total_workforce_metrics(workforce_changes)
    workforce_changes[str(next_id)] = totals
    
    return {
        "remainingShortages": shortages,
        "topTransitions": transitions,
        "workforceChanges": workforce_changes
    }


def generate_model_data() -> Tuple[Dict[int, str], Dict[str, Dict[str, Any]]]:
    """Generate model data for all parameter combinations."""
    # Define parameter combinations
    productivity_rates = [0.5, 1.0, 1.5]
    steering_options = [True, False]  # True for 'with', False for 'without'
    work_hours = [
        HoursWorked.EVERYONE,
        HoursWorked.PART_TIME,
        HoursWorked.HEALTHCARE
    ]
    job_priorities = [
        JobPriority.STANDARD,
        JobPriority.DEFENSE,
        JobPriority.HEALTHCARE,
        JobPriority.INFRASTRUCTURE
    ]
    non_source_jobs = [
        NonSourceJobs.STANDARD,
        NonSourceJobs.AMBITIOUS_AND_EDUCATION,
        NonSourceJobs.AMBITIOUS_ONLY
    ]
    
    results = {}
    first_response = None
    job_lookup = None
    id_lookup = None
    next_id = None
    
    # Generate results for all combinations
    total_combinations = (
        len(productivity_rates) *
        len(steering_options) *
        len(work_hours) *
        len(job_priorities) *
        len(non_source_jobs)
    )
    
    current_combination = 0
    
    for prod, steer, hours, priority, non_source in product(
        productivity_rates,
        steering_options,
        work_hours,
        job_priorities,
        non_source_jobs
    ):
        current_combination += 1
        logger.info(
            f"Processing combination {current_combination}/{total_combinations}: "
            f"prod={prod}, steer={'with' if steer else 'without'}, "
            f"hours={hours.value}, priority={priority.value}, "
            f"non_source={non_source.value}"
        )
        
        try:
            # Create request and get response
            request = BackendRequest(
                government_steering=steer,
                productivity_increase=prod,
                hours_worked=hours,
                job_priority=priority,
                non_source_jobs=non_source
            )
            
            response = request.make_request()
            
            # If this is the first response, use it to set up job lookups
            if first_response is None:
                first_response = response
                job_lookup, id_lookup = create_job_lookups({
                    "shortages": response["shortages_by_job"],
                    "transitions": response["transitions"],
                    "components": response["shortage_components"]
                })
                next_id = len(job_lookup) - 1  # ID for "Totaal"
            
            # Create key for this combination
            key = f"{prod}-{'with' if steer else 'without'}-{hours.value}-{priority.value}-{non_source.value}"
            
            # Process response
            results[key] = process_single_response(response, id_lookup, next_id)
            
            # Add small delay to avoid overwhelming the API
            sleep(0.5)
            
        except Exception as e:
            logger.error(f"Error processing combination: {str(e)}")
            continue
    
    # Create final job lookup with mapped names
    final_job_lookup = {
        i: job_name_mapping.get(name, name) if name != "Totaal" else "Totaal"
        for i, name in job_lookup.items()
    }
    
    return final_job_lookup, results


def main():
    """Main execution function."""
    try:
        logger.info("Starting data generation...")
        job_lookup, results = generate_model_data()
        
        # Ensure output directory exists
        output_dir = Path("../public")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save and compress job names
        logger.info("Saving and compressing job names...")
        job_names_path = output_dir / "job-names.json.gz"
        with gzip.open(job_names_path, "wt", encoding="utf-8") as f:
            json.dump(job_lookup, f, ensure_ascii=False, indent=2)
        
        # Save and compress model results
        logger.info("Saving and compressing model results...")
        model_results_path = output_dir / "model-results.json.gz"
        with gzip.open(model_results_path, "wt", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        # Also save uncompressed versions
        logger.info("Saving uncompressed versions...")
        with open(output_dir / "job-names.json", "w", encoding="utf-8") as f:
            json.dump(job_lookup, f, ensure_ascii=False, indent=2)
            
        with open(output_dir / "model-results.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        logger.info("Data generation completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}")
        raise


if __name__ == "__main__":
    main()