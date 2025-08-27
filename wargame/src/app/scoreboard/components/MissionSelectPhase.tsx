"use client";

import { GameState, Player } from "../types";
import { MissionData, ScoreboardData } from "@/lib/api/types";

interface ExtendedGameState extends GameState {
  players: Player[];
  selectedMission: MissionData | null;
}

interface MissionSelectPhaseProps {
  gameState: ExtendedGameState;
  apiData: ScoreboardData;
  selectMission: (missionId: string) => void;
  setFirstPlayerIndex: (index: number) => void;
  setDeploysFirstIndex: (index: number) => void;
  randomizeFirstPlayer: () => void;
  randomizeDeploysFirst: () => void;
  startGame: () => void;
}

export const MissionSelectPhase = ({
  gameState,
  apiData,
  selectMission,
  setFirstPlayerIndex,
  setDeploysFirstIndex,
  randomizeFirstPlayer,
  randomizeDeploysFirst,
  startGame
}: MissionSelectPhaseProps) => {
  const selectedMission = gameState.selectedMission 
    ? apiData.missions.find((m: MissionData) => m.id === gameState.selectedMission?.id) 
    : null;

  // Function to select a random mission
  const selectRandomMission = () => {
    if (apiData.missions.length > 0) {
      const randomIndex = Math.floor(Math.random() * apiData.missions.length);
      const randomMission = apiData.missions[randomIndex];
      selectMission(randomMission.id);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Mission Selection</h2>
        <button
          onClick={selectRandomMission}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zM3 10a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" />
            <path d="M10.293 5.293a1 1 0 011.414 0l2 2a1 1 0 010 1.414l-2 2a1 1 0 01-1.414-1.414L10.586 9H7a1 1 0 010-2h3.586l-.293-.293a1 1 0 010-1.414z" />
          </svg>
          Random Mission
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apiData.missions.map((mission: MissionData) => (
          <div 
            key={mission.id}
            className={`border rounded-lg p-6 cursor-pointer ${
              selectedMission?.id === mission.id
                ? 'border-amber-600 bg-amber-600/10'
                : 'dark:border-gray-700 bg-black/[.03] dark:bg-white/[.03]'
            }`}
            onClick={() => selectMission(mission.id)}
          >
            <h3 className="text-xl font-bold mb-2">{mission.name}</h3>
            <p className="text-sm opacity-75 mb-4">{mission.description}</p>
          </div>
        ))}
      </div>

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

      <div className="flex justify-end">
        <button
          onClick={startGame}
          disabled={!selectedMission || gameState.firstPlayerIndex === -1 || gameState.deploysFirstIndex === -1}
          className={`px-6 py-2 rounded-md font-medium ${
            selectedMission && gameState.firstPlayerIndex !== -1 && gameState.deploysFirstIndex !== -1
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};
