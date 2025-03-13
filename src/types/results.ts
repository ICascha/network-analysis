import type {
  ModelSettings,
  ProductivityRate,
  GovernmentSteering,
  WorkHoursTarget,
  JobPriority,
  NonSourceJobs
} from './settings';

export interface JobShortage {
  jobId: number;  // Will be mapped to job name using the lookup
  shortage: number; 
}

export interface JobTransition {
  sourceJobId: number;  // Will be mapped to job names
  targetJobId: number;
  amount: number;
}

export interface WorkforceMetrics {
  labor_supply: number;
  net_labor_change: number;
  transitions_in: number;
  transitions_out: number;
  superfluous_workers: number;
  shortage: number;
  productivity: number;
  expansion_demand: number;
  reduction_demand: number;
  vacancies: number;
}

export interface ModelResult {
  remainingShortages: JobShortage[];
  topTransitions: JobTransition[];
  workforceChanges: { [jobId: number]: WorkforceMetrics };
  addedValueChangePercent: number;
}

export interface TransformedWorkforceChanges {
  [jobName: string]: WorkforceMetrics;
}

export interface TransformedResult {
  remainingShortages: Array<{ jobName: string; shortage: number }>;
  topTransitions: Array<{ sourceJob: string; targetJob: string; amount: number }>;
  workforceChanges: TransformedWorkforceChanges;
  addedValueChangePercent: number;
}

// Create a type for our settings key
export type SettingsKey = string; // e.g. "1.0-with-everyone-standard-standard"

// The main results data structure
export interface ModelResults {
  [key: SettingsKey]: ModelResult;
}

// Job name lookup table
export interface JobNameLookup {
  [key: number]: string;
}

// Helper to generate settings key
export function generateSettingsKey(settings: ModelSettings): SettingsKey {
  return `${settings.productivity.toFixed(1)}-${settings.steering}-${settings.workHours}-${settings.jobPriority}-${settings.nonSourceJobs}`;
}

// Helper to decode settings from key
export function decodeSettingsKey(key: SettingsKey): ModelSettings {
  const [productivity, steering, workHours, jobPriority, nonSourceJobs] = key.split('-');
  return {
    productivity: Number(parseFloat(productivity).toFixed(1)) as ProductivityRate, // This ensures consistent decimal places
    steering: steering as GovernmentSteering,
    workHours: workHours as WorkHoursTarget,
    jobPriority: jobPriority as JobPriority,
    nonSourceJobs: nonSourceJobs as NonSourceJobs
  };
}