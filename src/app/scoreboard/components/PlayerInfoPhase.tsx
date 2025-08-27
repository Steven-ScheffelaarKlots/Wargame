"use client";

import { Player } from "../types";
import { ScoreboardData } from "@/lib/api/types";

interface PlayerInfoPhaseProps {
  players: Player[];
  apiData: ScoreboardData;
  error: string | null;
  updatePlayerInfo: (playerId: string, field: 'name' | 'faction', value: string) => void;
  goToMissionSelect: () => void;
}

export const PlayerInfoPhase = ({ 
  players, 
  apiData, 
  error, 
  updatePlayerInfo, 
  goToMissionSelect 
}: PlayerInfoPhaseProps) => {
  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!apiData) {
    return (
      <div className="text-center p-8">
        <p>No data available. Please refresh the page.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">Player Information</h2>
      
      {players.map((player, index) => (
        <div key={player.id} className="border dark:border-gray-700 rounded-lg p-6 bg-black/[.03] dark:bg-white/[.03]">
          <h3 className="text-xl font-bold mb-4">Player {index + 1}</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor={`name-${player.id}`} className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                id={`name-${player.id}`}
                type="text"
                value={player.name}
                onChange={(e) => updatePlayerInfo(player.id, 'name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
                placeholder="Enter name"
              />
            </div>
            
            <div>
              <label htmlFor={`faction-${player.id}`} className="block text-sm font-medium mb-1">
                Faction
              </label>
              <select
                id={`faction-${player.id}`}
                value={player.faction}
                onChange={(e) => updatePlayerInfo(player.id, 'faction', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
              >
                <option value="">Select a faction</option>
                
                {/* Imperium Factions */}
                <optgroup label="Imperium">
                  {apiData.factions
                    .filter(faction => faction.superfaction === 'imperium')
                    .map(faction => (
                      <option key={faction.id} value={faction.name}>{faction.name}</option>
                    ))
                  }
                </optgroup>
                
                {/* Chaos Factions */}
                <optgroup label="Chaos">
                  {apiData.factions
                    .filter(faction => faction.superfaction === 'chaos')
                    .map(faction => (
                      <option key={faction.id} value={faction.name}>{faction.name}</option>
                    ))
                  }
                </optgroup>
                
                {/* Xenos Factions */}
                <optgroup label="Xenos">
                  {apiData.factions
                    .filter(faction => faction.superfaction === 'xenos')
                    .map(faction => (
                      <option key={faction.id} value={faction.name}>{faction.name}</option>
                    ))
                  }
                </optgroup>
              </select>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex justify-end">
        <button
          onClick={goToMissionSelect}
          disabled={!players.every(p => p.name && p.faction)}
          className={`px-6 py-2 rounded-md font-medium ${
            players.every(p => p.name && p.faction)
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Mission Selection
        </button>
      </div>
    </div>
  );
};
