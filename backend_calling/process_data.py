from __future__ import annotations

import json
import gzip
import logging
from pathlib import Path
from typing import Dict, Any

from job_names import job_name_mapping

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def validate_data_structure(data: Dict[str, Any]) -> bool:
    """Validate that the input data contains the expected structure with new fields."""
    try:
        # Check a random result entry
        sample_key = next(iter(data.keys()))
        sample_result = data[sample_key]
        
        # Verify new fields exist in workforceChanges
        sample_workforce = next(iter(sample_result["workforceChanges"].values()))
        required_fields = {
            "expansion_demand",
            "reduction_demand",
        }
        
        if not required_fields.issubset(sample_workforce.keys()):
            logger.warning("Missing required workforce metrics fields")
            return False
            
        # Verify addedValueChangePercent exists
        if "addedValueChangePercent" not in sample_result:
            logger.warning("Missing addedValueChangePercent field")
            return False
            
        return True
        
    except (KeyError, StopIteration) as e:
        logger.error(f"Error validating data structure: {str(e)}")
        return False


def process_and_compress_data():
    """Process raw data files, map job names, and create compressed versions."""
    try:
        input_dir = Path("../raw_data")
        output_dir = Path("../public")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Read raw data
        logger.info("Reading raw data files...")
        with open(input_dir / "raw-job-names.json", "r", encoding="utf-8") as f:
            job_lookup = json.load(f)
            
        with open(input_dir / "raw-model-results.json", "r", encoding="utf-8") as f:
            results = json.load(f)
        
        # Validate data structure
        logger.info("Validating data structure...")
        if not validate_data_structure(results):
            raise ValueError("Input data missing required fields")
        
        # Map job names
        logger.info("Mapping job names...")
        final_job_lookup = {
            i: job_name_mapping.get(name, name) if name != "Totaal" else "Totaal"
            for i, name in job_lookup.items()
        }
        
        # Save and compress job names
        logger.info("Saving and compressing job names...")
        job_names_path = output_dir / "job-names.json.gz"
        with gzip.open(job_names_path, "wt", encoding="utf-8") as f:
            json.dump(final_job_lookup, f, ensure_ascii=False, indent=2)
            
        # Save and compress model results
        logger.info("Saving and compressing model results...")
        model_results_path = output_dir / "model-results.json.gz"
        with gzip.open(model_results_path, "wt", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        # Save uncompressed versions
        logger.info("Saving uncompressed versions...")
        with open(output_dir / "job-names.json", "w", encoding="utf-8") as f:
            json.dump(final_job_lookup, f, ensure_ascii=False, indent=2)
            
        with open(output_dir / "model-results.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
            
        logger.info("Data processing and compression completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in data processing: {str(e)}")
        raise


if __name__ == "__main__":
    process_and_compress_data()