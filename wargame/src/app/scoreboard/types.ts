export interface Secondary {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category?: string;
  completions: {
    points: number;
    description: string;
  }[];
  active: boolean;
  score: number;
  completionsIndex?: number;
  drawnAtTurn?: number; // Track which turn the secondary was drawn
  completedAtTurn?: number; // Track which turn the secondary was completed
  discardedAtTurn?: number; // Track which turn the secondary was discarded
  isDiscarded?: boolean; // Track if a secondary is discarded but still displayed
  isCompleted?: boolean; // Track if a secondary has been fully completed
  isInactive?: boolean; // Track if a secondary is no longer active (completed or discarded in previous turn)
}

export interface Primary {
  id: string;
  name: string;
  description: string;
  pointsPerTurn: number[];
  score: number[];
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
}
