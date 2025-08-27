"use client";

import { useState } from 'react';
import { Player, GameState } from "../types";
import { ScoreboardData } from "@/lib/api/types";
import { SelectSecondaryModal } from './SelectSecondaryModal';

interface ExtendedGameState extends GameState {
  players: Player[];
  mission: string;
  missionName: string;
}

interface GamePhaseProps {
  gameState: ExtendedGameState;
  apiData: ScoreboardData;
  updateSecondary: (playerId: string, secondaryId: string, field: 'score' | 'completions', value: number) => void;
  drawSecondary: (playerId: string) => void;
  drawSpecificSecondaries: (playerId: string, secondaryIds: string[]) => void;
  discardSecondary: (playerId: string, secondaryId: string) => void;
  shuffleSecondary: (playerId: string, secondaryId: string) => void;
  updatePrimary: (playerId: string, turn: number, value: number) => void;
  endTurn: () => void;
  endGame: () => void;
  // The actual navigation happens through a custom event that's handled in the page component
}

interface NavigationButtonProps {
  onClick: () => void;
  disabled?: boolean;
  direction: 'prev' | 'next';
  label: string;
}

// Navigation button component for moving between turns
const NavigationButton = ({ onClick, disabled = false, direction, label }: NavigationButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center px-3 py-2 rounded-md ${
      disabled 
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    }`}
  >
    {direction === 'prev' && (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )}
    {label}
    {direction === 'next' && (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    )}
  </button>
);

export const GamePhase = ({
  gameState,
  apiData,
  updateSecondary,
  drawSecondary,
  drawSpecificSecondaries,
  discardSecondary,
  shuffleSecondary,
  updatePrimary,
  endTurn,
  endGame
}: GamePhaseProps) => {
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  
  const isFirstTurn = gameState.currentTurn === 1;
  const isLastTurn = gameState.currentTurn === gameState.totalTurns;
  const firstPlayerIndex = gameState.firstPlayerIndex !== null ? gameState.firstPlayerIndex : 0;
  const deploysFirstIndex = gameState.deploysFirstIndex !== null ? gameState.deploysFirstIndex : 0;
  
  // Function to navigate to a specific turn
  const navigateToTurn = (turnNumber: number) => {
    // This uses the same endTurn function but makes it work for any turn change
    if (turnNumber > 0 && turnNumber <= gameState.totalTurns) {
      // Create a simulated event to navigate to the specific turn
      // The actual implementation will need to be added to the page component
      const event = new CustomEvent('navigateToTurn', { 
        detail: { turnNumber } 
      });
      document.dispatchEvent(event);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <NavigationButton 
            onClick={() => navigateToTurn(gameState.currentTurn - 1)} 
            disabled={isFirstTurn}
            direction="prev"
            label="Previous Turn"
          />
          <h2 className="text-2xl font-bold">
            Turn {gameState.currentTurn}/{gameState.totalTurns}
          </h2>
          <NavigationButton 
            onClick={() => navigateToTurn(gameState.currentTurn + 1)} 
            disabled={isLastTurn}
            direction="next"
            label="Next Turn"
          />
        </div>
        <div className="text-right">
          <h3 className="text-xl font-bold">{gameState.missionName}</h3>
          <div className="text-sm opacity-75 space-x-2">
            <span>First turn: {gameState.players[firstPlayerIndex]?.name || 'Player 1'}</span>
            <span>•</span>
            <span>First deploy: {gameState.players[deploysFirstIndex]?.name || 'Player 1'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {gameState.players.map((player) => (
          <div 
            key={player.id}
            className="border dark:border-gray-700 rounded-lg p-6 bg-black/[.03] dark:bg-white/[.03]"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{player.name}</h3>
              <span className="font-bold text-2xl">
                {player.totalPoints} pts
              </span>
            </div>

            <div className="text-sm opacity-75 mb-6">
              {player.faction}
            </div>

            {/* Primary Objective */}
            {player.primary && (
              <div className="mb-6">
                <h4 className="font-bold mb-2">{player.primary.name}</h4>
                <p className="text-sm opacity-75 mb-4">{player.primary.description}</p>
                
                <div className="flex items-center">
                  <span className="mr-2">Score:</span>
                  <input
                    type="number"
                    min="0"
                    max={player.primary.pointsPerTurn[gameState.currentTurn - 1] || 0}
                    value={player.primary?.score[gameState.currentTurn - 1] || 0}
                    onChange={(e) => updatePrimary(
                      player.id, 
                      gameState.currentTurn - 1, 
                      Math.min(
                        parseInt(e.target.value) || 0,
                        player.primary?.pointsPerTurn[gameState.currentTurn - 1] || 0
                      )
                    )}
                    className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
                  />
                  <span className="ml-2">/ {player.primary?.pointsPerTurn[gameState.currentTurn - 1]}</span>
                </div>
              </div>
            )}

            {/* Secondary Objectives */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold">Secondary Objectives</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setActivePlayerId(player.id);
                      setSelectModalOpen(true);
                    }}
                    disabled={player.secondaryDeck.length === 0}
                    className={`px-3 py-1 text-sm rounded-md ${
                      player.secondaryDeck.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Choose Secondary
                  </button>
                  <button
                    onClick={() => drawSecondary(player.id)}
                    disabled={player.secondaryDeck.length === 0}
                    className={`px-3 py-1 text-sm rounded-md ${
                      player.secondaryDeck.length > 0
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Draw Random ({player.secondaryDeck.length})
                  </button>
                </div>
              </div>

              {player.secondaries
                .filter(secondary => {
                  // A secondary is active if:
                  // 1. It was drawn in the current turn
                  const drawnThisTurn = secondary.drawnAtTurn === gameState.currentTurn;
                  
                  // 2. It was drawn in a previous turn, hasn't been completed or discarded,
                  //    or was completed/discarded in the current turn
                  const drawnInPreviousTurn = secondary.drawnAtTurn && secondary.drawnAtTurn < gameState.currentTurn;
                  
                  // Check if it was completed or discarded in the current turn
                  const completedThisTurn = secondary.isCompleted && 
                                           secondary.completedAtTurn === gameState.currentTurn;
                  const discardedThisTurn = secondary.isDiscarded && 
                                           secondary.discardedAtTurn === gameState.currentTurn;
                  
                  // Check if it wasn't completed or discarded yet
                  const notYetCompleted = !secondary.isCompleted;
                  const notYetDiscarded = !secondary.isDiscarded;
                  
                  // Show if:
                  return drawnThisTurn || // Just drawn
                         discardedThisTurn || // Discarded this turn (still show)
                         completedThisTurn || // Completed this turn (still show)
                         (drawnInPreviousTurn && notYetCompleted && notYetDiscarded); // Carried over
                })
                .map((secondary) => {
                  const isDiscarded = secondary.isDiscarded;
                  const isCompleted = secondary.isCompleted;
                  
                  return (
                    <div 
                      key={secondary.id}
                      className={`p-4 border mb-4 rounded-md ${
                        isDiscarded 
                          ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-900' 
                          : isCompleted
                            ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-900'
                            : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold">
                            {secondary.name}
                            {secondary.category && (
                              <span className="ml-2 font-normal text-sm opacity-75">
                                ({secondary.category})
                              </span>
                            )}
                          </h5>
                          <p className="text-sm opacity-75 mb-2">
                            {secondary.shortDescription}
                          </p>
                        </div>
                        <span className="font-bold text-lg">
                          {secondary.score} pts
                        </span>
                      </div>

                      <div className="flex flex-col mt-2 space-y-2">
                        <div className="flex flex-col space-y-1">
                          {secondary.completions && secondary.completions.map((completion, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`${player.id}-${secondary.id}-completion-${index}`}
                                checked={secondary.completionsIndex === index}
                                onChange={() => updateSecondary(
                                  player.id,
                                  secondary.id,
                                  'completions',
                                  index
                                )}
                                className="mr-2 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                                disabled={isDiscarded}
                              />
                              <label 
                                htmlFor={`${player.id}-${secondary.id}-completion-${index}`}
                                className="flex justify-between w-full cursor-pointer"
                              >
                                <span className="text-sm">{completion.description}</span>
                                <span className="font-medium">{completion.points} pts</span>
                              </label>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          {!isDiscarded && !isCompleted && (
                            <>
                              <button
                                onClick={() => shuffleSecondary(player.id, secondary.id)}
                                className="text-sm px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                                title="Shuffle this secondary back into your deck"
                              >
                                Shuffle
                              </button>
                              <button
                                onClick={() => discardSecondary(player.id, secondary.id)}
                                className="text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
                              >
                                Discard
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {player.secondaries.filter(s => s.active && !s.isInactive).length === 0 && (
                  <p className="text-sm opacity-75 text-center py-4">
                    No active secondaries. Draw a secondary objective.
                  </p>
                )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {!isFirstTurn && (
            <NavigationButton 
              onClick={() => navigateToTurn(gameState.currentTurn - 1)}
              direction="prev"
              label="Previous Turn" 
            />
          )}
        </div>
        
        <div className="flex space-x-4">
          {isLastTurn ? (
            <button
              onClick={endGame}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium"
            >
              End Game
            </button>
          ) : (
            <>
              <button
                onClick={endTurn}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium"
              >
                End Turn
              </button>
              {gameState.currentTurn < gameState.totalTurns && (
                <NavigationButton 
                  onClick={() => navigateToTurn(gameState.currentTurn + 1)}
                  direction="next"
                  label="Next Turn (Skip)" 
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Modal for selecting specific secondaries */}
      {activePlayerId && (
        <SelectSecondaryModal
          isOpen={selectModalOpen}
          onClose={() => {
            setSelectModalOpen(false);
            setActivePlayerId(null);
          }}
          secondaryDeck={gameState.players.find(p => p.id === activePlayerId)?.secondaryDeck || []}
          onSelectSecondaries={(selectedIds) => {
            drawSpecificSecondaries(activePlayerId, selectedIds);
          }}
        />
      )}
    </div>
  );
};
