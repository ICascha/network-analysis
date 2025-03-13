export type ProductivityRate = 0.5 | 1.0 | 1.5;

export type GovernmentSteering = 'with' | 'without';

export type WorkHoursTarget = 'noone' | 'everyone' | 'part-time' | 'healthcare';

export type JobPriority = 'standard' | 'defense' | 'healthcare' | 'infrastructure';

export type NonSourceJobs = 'standard' | 'ambitious-and-education' | 'ambitious-only';

export interface ModelSettings {
  productivity: ProductivityRate;
  steering: GovernmentSteering;
  workHours: WorkHoursTarget;
  jobPriority: JobPriority;
  nonSourceJobs: NonSourceJobs;
}

// Helper objects for UI labels and descriptions
export const SETTING_OPTIONS = {
  productivity: [
    { value: 0.5, label: "0.5%" },
    { value: 1.0, label: "1.0%" },
    { value: 1.5, label: "1.5%" }
  ],
  steering: [
    { value: 'with', label: "Met overheidssturing" },
    { value: 'without', label: "Zonder overheidssturing" }
  ],
  workHours: [
    {value: 'noone', label: "Niemand"},
    { value: 'everyone', label: "Iedereen" },
    { value: 'part-time', label: "Deeltijdwerkers (≤ 0.8 deeltijdfactor)" },
    { value: 'healthcare', label: "Zorg" }
  ],
  jobPriority: [
    { value: 'standard', label: "Standaard (mix)" },
    { value: 'defense', label: "Defensie" },
    { value: 'healthcare', label: "Gezondheids- en welzijnszorg" },
    { value: 'infrastructure', label: "Woningbouw, infrastructuur en klimaat" }
  ],
  nonSourceJobs: [
    { value: 'standard', label: "Standaard (mix)" },
    { value: 'ambitious-and-education', label: "Banen in ambitiesectoren + onderwijs" },
    { value: 'ambitious-only', label: "Alleen banen in ambitiesectoren" }
  ]
} as const;
