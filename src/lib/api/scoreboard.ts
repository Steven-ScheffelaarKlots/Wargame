'use client';

import { 
  ApiResponse, 
  ScoreboardData, 
  FactionData, 
  MissionData, 
  SecondaryObjectiveData 
} from './types';

const API_BASE_URL = '/api';

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API request error: ${error instanceof Error ? error.message : String(error)}`);
    return { 
      success: false, 
      data: {} as T, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * Scoreboard API functions
 */
export const ScoreboardAPI = {
  /**
   * Get all scoreboard data in a single request
   */
  getScoreboardData: async (): Promise<ApiResponse<ScoreboardData>> => {
    return apiRequest<ScoreboardData>('/scoreboard/data');
  },
  
  /**
   * Get only factions data
   */
  getFactions: async (): Promise<ApiResponse<FactionData[]>> => {
    return apiRequest<FactionData[]>('/scoreboard/factions');
  },
  
  /**
   * Get only missions data
   */
  getMissions: async (): Promise<ApiResponse<MissionData[]>> => {
    return apiRequest<MissionData[]>('/scoreboard/missions');
  },
  
  /**
   * Get only secondary objectives data
   */
  getSecondaries: async (): Promise<ApiResponse<SecondaryObjectiveData[]>> => {
    return apiRequest<SecondaryObjectiveData[]>('/scoreboard/secondaries');
  }
};
