// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Scoreboard Types
export interface FactionData {
  id: string;
  name: string;
  description?: string;
  superfaction: 'imperium' | 'chaos' | 'xenos';
}

export interface TerrainLayoutData {
  id: string;
  name: string;
  description: string;
}

export interface MissionData {
  id: string;
  name: string;
  description: string;
  terrainLayout: string;
  primaryMissionId?: string; // Reference to a primary mission
  isPreset?: boolean; // Whether this is a preset mission or custom
}

export interface SecondaryConditionData {
  id: string;
  description: string;
  points: number;
  // maxCount removed - no limit on how many times a condition can be scored
}

export interface SecondaryObjectiveData {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  scoringType?: 'exclusive' | 'multiple' | 'counter'; // Default is 'exclusive' if not provided
  maxPoints?: number; // For multiple and counter scoring types
  completions: {
    description: string;
    points: number;
  }[];
  conditions?: SecondaryConditionData[]; // For multiple or counter scoring type
}

export interface PrimaryObjectiveData {
  id: string;
  description: string;
  points: number;
  availableInTurns: number[]; // Array of turn numbers (1-based) when this objective is available
}

export interface PrimaryMissionData {
  id: string;
  name: string;
  description: string;
  objectives: PrimaryObjectiveData[]; // All objectives available for this mission
  maxPointsPerTurn: number[]; // Maximum points possible for each turn (array of 5 values)
}

// Legacy format, kept for backward compatibility
export interface LegacyPrimaryObjectiveData {
  id: string;
  name: string;
  description: string;
  pointsPerTurn: number[];
}

export interface ScoreboardData {
  factions: {
    id: string;
    name: string;
    superfaction?: string;
  }[];
  missions: MissionData[];
  terrainLayouts: TerrainLayoutData[];
  secondaries: SecondaryObjectiveData[];
  primaryMissions: PrimaryMissionData[];
  primaryObjectives: LegacyPrimaryObjectiveData[]; // Legacy format, kept for backward compatibility
}
