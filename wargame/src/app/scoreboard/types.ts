export interface SecondaryCondition {
  id: string;
  description: string;
  points: number;
  checked?: boolean;
  count?: number; // For counter scoring type - number of times this condition has been scored
  // maxCount removed - no limit on how many times a condition can be scored
}

export interface Secondary {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category?: string;
  scoringType: 'exclusive' | 'multiple' | 'counter'; // Different scoring types
  maxPoints?: number; // Maximum points that can be scored
  completions: {
    points: number;
    description: string;
  }[];
  conditions?: SecondaryCondition[]; // For multiple or counter scoring type
  active: boolean;
  score: number;
  completionsIndex?: number;
  selectedConditions?: string[]; // IDs of selected conditions for multiple scoring
  conditionCounts?: Record<string, number>; // Counts for counter scoring type, keyed by condition ID
  drawnAtTurn?: number; // Track which turn the secondary was drawn
  completedAtTurn?: number; // Track which turn the secondary was completed
  discardedAtTurn?: number; // Track which turn the secondary was discarded
  isDiscarded?: boolean; // Track if a secondary is discarded but still displayed
  isCompleted?: boolean; // Track if a secondary has been fully completed
  isInactive?: boolean; // Track if a secondary is no longer active (completed or discarded in previous turn)
}

export interface PrimaryObjective {
  id: string;
  description: string;
  points: number;
  availableInTurns: number[]; // Array of turn numbers (1-based) when this objective is available
  scored?: boolean; // Whether this objective has been scored in the current turn
}

export interface Primary {
  id: string;
  name: string;
  description: string;
  pointsPerTurn: number[]; // Max possible points per turn (legacy, kept for backward compatibility)
  score: number[]; // Total score per turn
  objectives: PrimaryObjective[][]; // Array of objectives for each turn
  maxPointsPerTurn: number[]; // Maximum points possible per turn
}

export interface Player {
  id: string;
  name: string;
  faction: string;
  points: number[];  // Array of points per turn
  primaryPoints: number[];  // Points from primary objectives
  secondaryPoints: number[];  // Points from secondary objectives
  totalPoints: number;
  secondaries: Secondary[];
  primary: Primary | null;
  secondaryDeck: Secondary[];  // Player's personal deck of secondaries
  discardPile: Secondary[];    // Player's personal discard pile
}

export interface GameState {
  currentTurn: number;
  totalTurns: number;
  mission: string | null;
  missionName?: string | null; // Store mission name for easy reference
  terrainLayout: string | null;
  gamePhase: 'setup' | 'player-info' | 'mission-select' | 'game' | 'summary';
  firstPlayerIndex: number | null;
  deploysFirstIndex: number | null; // Track which player deploys first
  selectedPrimaryMission?: string; // Store the selected primary mission ID
  selectedTerrainLayout?: string; // Store the selected terrain layout ID
  missionSelectionMode?: 'preset' | 'custom'; // Track whether user is selecting a preset or custom mission
}
