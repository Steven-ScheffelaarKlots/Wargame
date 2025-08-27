"use client";

import { GameState, Player } from "../types";
import { MissionData, ScoreboardData, PrimaryMissionData } from "@/lib/api/types";

interface ExtendedGameState extends GameState {
  players: Player[];
  selectedMission: MissionData | null;
  selectedPrimaryMission?: string;
  selectedTerrainLayout?: string;
  missionSelectionMode?: 'preset' | 'custom';
}

interface MissionSelectPhaseProps {
  gameState: ExtendedGameState;
  apiData: ScoreboardData;
  selectMission: (missionId: string, missionName: string, terrainLayout: string, primaryMissionId?: string) => void;
  selectPrimaryMission: (missionId: string) => void;
  selectTerrainLayout: (layoutId: string) => void;
  setMissionSelectionMode: (mode: 'preset' | 'custom') => void;
  setFirstPlayerIndex: (index: number) => void;
  setDeploysFirstIndex: (index: number) => void;
  randomizeFirstPlayer: () => void;
  randomizeDeploysFirst: () => void;
  startGame: (firstPlayerIndex: number, deploysFirstIndex: number) => void;
}

export const MissionSelectPhase = ({
  gameState,
  apiData,
  selectMission,
  selectPrimaryMission,
  selectTerrainLayout,
  setMissionSelectionMode,
  setFirstPlayerIndex,
  setDeploysFirstIndex,
  randomizeFirstPlayer,
  randomizeDeploysFirst,
  startGame
}: MissionSelectPhaseProps) => {
  // For preset missions, find the selected mission in the API data
  // For custom missions, we may not have a mission in apiData, so use missionName from gameState
  const selectedMission = gameState.mission 
    ? (apiData.missions.find((m: MissionData) => m.id === gameState.mission) || 
      (gameState.missionName ? { id: gameState.mission, name: gameState.missionName } as MissionData : null))
    : null;
    
  const selectedPrimaryMissionObj = gameState.selectedPrimaryMission 
    ? apiData.primaryMissions?.find((m) => m.id === gameState.selectedPrimaryMission) 
    : null;
    
  const selectedTerrainLayoutObj = gameState.selectedTerrainLayout
    ? apiData.terrainLayouts.find(layout => layout.id === gameState.selectedTerrainLayout)
    : null;

  // Function to select a random preset mission
  const selectRandomMission = () => {
    const presetMissions = apiData.missions.filter(m => m.isPreset);
    if (presetMissions.length > 0) {
      const randomIndex = Math.floor(Math.random() * presetMissions.length);
      const randomMission = presetMissions[randomIndex];
      
      console.log("Selected random mission:", randomMission);
      
      // First set the mode to preset
      setMissionSelectionMode('preset');
      
      // Then set the primary mission
      if (randomMission.primaryMissionId) {
        selectPrimaryMission(randomMission.primaryMissionId);
      }
      
      // Then set the terrain layout
      selectTerrainLayout(randomMission.terrainLayout);
      
      // Finally select the mission itself
      selectMission(
        randomMission.id, 
        randomMission.name, 
        randomMission.terrainLayout,
        randomMission.primaryMissionId
      );
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mission Selection</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setMissionSelectionMode('preset')}
            className={`px-4 py-2 rounded-md ${
              gameState.missionSelectionMode === 'preset' || !gameState.missionSelectionMode
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Preset Missions
          </button>
          <button
            onClick={() => setMissionSelectionMode('custom')}
            className={`px-4 py-2 rounded-md ${
              gameState.missionSelectionMode === 'custom'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            Custom Mission
          </button>
          <button
            onClick={selectRandomMission}
            className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center"
            title="Select a random preset mission"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
              <path d="M10.293 5.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L10.586 9H7a1 1 0 010-2h3.586l-.293-.293a1 1 0 010-1.414z" />
            </svg>
            Random
          </button>
        </div>
      </div>
      
      {/* Preset Missions UI */}
      {(!gameState.missionSelectionMode || gameState.missionSelectionMode === 'preset') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiData.missions.filter(m => m.isPreset).map((mission: MissionData) => {
            // Find corresponding primary mission
            const primaryMission = mission.primaryMissionId ? 
              apiData.primaryMissions?.find(p => p.id === mission.primaryMissionId) : null;
            
            // Find terrain layout
            const terrainLayout = apiData.terrainLayouts.find(t => t.id === mission.terrainLayout);
              
            return (
              <div 
                key={mission.id}
                className={`border rounded-lg p-6 cursor-pointer ${
                  selectedMission?.id === mission.id
                    ? 'border-amber-600 bg-amber-600/10'
                    : 'dark:border-gray-700 bg-black/[.03] dark:bg-white/[.03]'
                }`}
                onClick={() => {
                  console.log("Clicked preset mission:", mission);
                  // First select the primary mission
                  if (mission.primaryMissionId) {
                    selectPrimaryMission(mission.primaryMissionId);
                  }
                  
                  // Then select the terrain layout
                  selectTerrainLayout(mission.terrainLayout);
                  
                  // Finally select the mission itself
                  selectMission(mission.id, mission.name, mission.terrainLayout, mission.primaryMissionId);
                }}
              >
                <div className="flex justify-between mb-2">
                  <h3 className="text-xl font-bold">{mission.name}</h3>
                  {primaryMission && (
                    <span className="text-sm px-2 py-1 bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200 rounded-full">
                      {primaryMission.name}
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-75 mb-4">{mission.description}</p>
                
                {terrainLayout && (
                  <div className="text-sm">
                    <h4 className="font-medium mb-1">Terrain: {terrainLayout.name}</h4>
                    <p className="opacity-75">{terrainLayout.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Custom Mission UI */}
      {gameState.missionSelectionMode === 'custom' && (
        <div className="space-y-8">
          {/* Primary Mission Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Select Primary Mission</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apiData.primaryMissions.map((mission) => (
                <div 
                  key={mission.id}
                  className={`border rounded-lg p-6 cursor-pointer ${
                    gameState.selectedPrimaryMission === mission.id
                      ? 'border-amber-600 bg-amber-600/10'
                      : 'dark:border-gray-700 bg-black/[.03] dark:bg-white/[.03]'
                  }`}
                  onClick={() => {
                    selectPrimaryMission(mission.id);
                    
                    // If we have a terrain layout and mission name, update the mission
                    if (gameState.selectedTerrainLayout && gameState.missionName) {
                      const customMissionId = gameState.mission || `custom-${Date.now()}`;
                      selectMission(
                        customMissionId,
                        gameState.missionName,
                        gameState.selectedTerrainLayout,
                        mission.id
                      );
                    }
                  }}
                >
                  <h3 className="text-xl font-bold mb-2">{mission.name}</h3>
                  <p className="text-sm opacity-75 mb-4">{mission.description}</p>
                  
                  <div className="text-sm space-y-2">
                    <h4 className="font-medium">Objectives:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {mission.objectives.slice(0, 3).map((obj) => (
                        <li key={obj.id}>{obj.description} ({obj.points} pts)</li>
                      ))}
                      {mission.objectives.length > 3 && (
                        <li>...and {mission.objectives.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Terrain Layout Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Select Terrain Layout</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apiData.terrainLayouts.map((layout) => (
                <div 
                  key={layout.id}
                  className={`border rounded-lg p-6 cursor-pointer ${
                    gameState.selectedTerrainLayout === layout.id
                      ? 'border-amber-600 bg-amber-600/10'
                      : 'dark:border-gray-700 bg-black/[.03] dark:bg-white/[.03]'
                  }`}
                  onClick={() => {
                    selectTerrainLayout(layout.id);
                    
                    // If we have a primary mission and mission name, update the mission
                    if (gameState.selectedPrimaryMission && gameState.missionName) {
                      const customMissionId = gameState.mission || `custom-${Date.now()}`;
                      selectMission(
                        customMissionId,
                        gameState.missionName,
                        layout.id,
                        gameState.selectedPrimaryMission
                      );
                    }
                  }}
                >
                  <h3 className="text-xl font-bold mb-2">{layout.name}</h3>
                  <p className="text-sm opacity-75">{layout.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mission Name Input */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Mission Name</h3>
            <div className="border rounded-lg p-6 dark:border-gray-700 bg-black/[.03] dark:bg-white/[.03]">
              <p className="text-sm opacity-75 mb-4">This will be displayed as your custom mission name.</p>
              <input 
                type="text"
                placeholder="Enter mission name..."
                className="w-full p-3 border rounded-md bg-transparent dark:border-gray-600"
                value={gameState.missionName || ""}
                onChange={(e) => {
                  // Always update the mission with the new name
                  const customMissionId = gameState.mission || `custom-${Date.now()}`;
                  const terrainLayout = gameState.selectedTerrainLayout || '';
                  const primaryMissionId = gameState.selectedPrimaryMission;
                  
                  selectMission(
                    customMissionId,
                    e.target.value, 
                    terrainLayout,
                    primaryMissionId
                  );
                }}
              />
            </div>
          </div>
        </div>
      )}

      {selectedMission && (
        <div className="space-y-6 border dark:border-gray-700 rounded-lg p-6 bg-black/[.03] dark:bg-white/[.03]">
          <div>
            <h3 className="text-xl font-bold mb-4">Who Goes First?</h3>
            <div className="flex flex-wrap gap-3">
              {gameState.players.map((player, index) => (
                <button
                  key={player.id}
                  onClick={() => setFirstPlayerIndex(index)}
                  className={`px-4 py-2 rounded-md ${
                    gameState.firstPlayerIndex === index
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {player.name}
                </button>
              ))}
              <button
                onClick={randomizeFirstPlayer}
                className="px-4 py-2 rounded-md bg-blue-600 text-white"
              >
                Random
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Who Deploys First?</h3>
            <div className="flex flex-wrap gap-3">
              {gameState.players.map((player, index) => (
                <button
                  key={player.id}
                  onClick={() => setDeploysFirstIndex(index)}
                  className={`px-4 py-2 rounded-md ${
                    gameState.deploysFirstIndex === index
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {player.name}
                </button>
              ))}
              <button
                onClick={randomizeDeploysFirst}
                className="px-4 py-2 rounded-md bg-blue-600 text-white"
              >
                Random
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-end">
        {gameState.missionSelectionMode === 'custom' && (
          <div className="mb-2 text-sm">
            {!gameState.selectedPrimaryMission && (
              <p className="text-red-500">• Select a primary mission</p>
            )}
            {!gameState.selectedTerrainLayout && (
              <p className="text-red-500">• Select a terrain layout</p>
            )}
            {!gameState.missionName && (
              <p className="text-red-500">• Enter a mission name</p>
            )}
          </div>
        )}
        
        <div className="flex items-center">
          {(gameState.firstPlayerIndex === null || gameState.deploysFirstIndex === null) && (
            <span className="mr-3 text-sm text-amber-500">Select who goes first and who deploys first</span>
          )}
          <button
            onClick={() => {
              if (gameState.firstPlayerIndex !== null && gameState.deploysFirstIndex !== null) {
                startGame(gameState.firstPlayerIndex, gameState.deploysFirstIndex);
              }
            }}
            disabled={
              // Check mission selection (either the whole mission object or missionName)
              (!gameState.mission && !gameState.missionName) || 
              // Check player selection
              gameState.firstPlayerIndex === null || 
              gameState.deploysFirstIndex === null || 
              // Check required components
              !gameState.selectedPrimaryMission || 
              !gameState.selectedTerrainLayout ||
              // For custom missions, require a name
              (gameState.missionSelectionMode === 'custom' && !gameState.missionName)
            }
            className={`px-6 py-2 rounded-md font-medium ${
              gameState.mission && 
              gameState.missionName && 
              gameState.firstPlayerIndex !== null && 
              gameState.deploysFirstIndex !== null && 
              gameState.selectedPrimaryMission && 
              gameState.selectedTerrainLayout
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
