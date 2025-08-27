"use client";

import { useState, useEffect } from 'react';
import { ScoreboardAPI } from '@/lib/api';
import { ScoreboardData } from "@/lib/api/types";
import { Player, Primary, Secondary, GameState } from './types';
import Navigation from '@/components/Navigation';

// Component imports
import { LoadingIndicator } from './components/LoadingIndicator';
import { PlayerInfoPhase } from './components/PlayerInfoPhase';
import { MissionSelectPhase } from './components/MissionSelectPhase';
import { GamePhase } from './components/GamePhase';
import { SummaryPhase } from './components/SummaryPhase';

// For development fallback - will be removed in production
import { mockScoreboardData } from '@/lib/api/mockData';

export default function Scoreboard() {
  // API data state
  const [apiData, setApiData] = useState<ScoreboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Players state
  const [players, setPlayers] = useState<Player[]>([
    {
      id: '1',
      name: '',
      faction: '',
      points: [0, 0, 0, 0, 0],
      primaryPoints: [0, 0, 0, 0, 0],
      secondaryPoints: [0, 0, 0, 0, 0],
      totalPoints: 0,
      secondaries: [],
      primary: null,
      secondaryDeck: [],
      discardPile: []
    },
    {
      id: '2',
      name: '',
      faction: '',
      points: [0, 0, 0, 0, 0],
      primaryPoints: [0, 0, 0, 0, 0],
      secondaryPoints: [0, 0, 0, 0, 0],
      totalPoints: 0,
      secondaries: [],
      primary: null,
      secondaryDeck: [],
      discardPile: []
    }
  ]);

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    currentTurn: 1,
    totalTurns: 5,
    mission: null,
    missionName: null,
    terrainLayout: null,
    gamePhase: 'player-info',
    firstPlayerIndex: null,
    deploysFirstIndex: null
  });
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await ScoreboardAPI.getScoreboardData();
        
        if (response.success) {
          setApiData(response.data);
        } else {
          console.error("API error:", response.error);
          setError(response.error || "Failed to fetch data");
          // Fallback to mock data in development
          setApiData(mockScoreboardData);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("An unexpected error occurred");
        // Fallback to mock data in development
        setApiData(mockScoreboardData);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to get superfaction for a faction name
  const getSuperfactionForFaction = (factionName: string): string | null => {
    if (!apiData) return null;
    
    const faction = apiData.factions.find(f => f.name === factionName);
    return faction ? faction.superfaction : null;
  };
  
  // Get faction color class based on superfaction
  const getFactionColorClass = (factionName: string): string => {
    if (!apiData) return '';
    
    const superfaction = getSuperfactionForFaction(factionName);
    
    switch (superfaction) {
      case 'imperium':
        return 'bg-blue-100 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900';
      case 'chaos':
        return 'bg-red-100 border-red-200 dark:bg-red-900/20 dark:border-red-900';
      case 'xenos':
        return 'bg-green-100 border-green-200 dark:bg-green-900/20 dark:border-green-900';
      default:
        return 'bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  // Update player information
  const updatePlayerInfo = (playerId: string, field: 'name' | 'faction', value: string) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId 
          ? { ...player, [field]: value } 
          : player
      )
    );
  };
  
  // Go to mission select phase
  const goToMissionSelect = () => {
    setGameState({ ...gameState, gamePhase: 'mission-select' });
  };

  // Select a mission
  const selectMission = (missionId: string, missionName: string, terrainLayout: string) => {
    setGameState({
      ...gameState,
      mission: missionId,
      missionName,
      terrainLayout
    });
  };

  // Randomize first player
  const randomizeFirstPlayer = () => {
    const randomIndex = Math.floor(Math.random() * 2);
    setGameState({
      ...gameState,
      firstPlayerIndex: randomIndex
    });
  };

  // Randomize who deploys first
  const randomizeDeploysFirst = () => {
    const randomIndex = Math.floor(Math.random() * 2);
    setGameState({
      ...gameState,
      deploysFirstIndex: randomIndex
    });
  };
  
  // Start the game
  const startGame = (firstPlayerIndex: number, deploysFirstIndex: number) => {
    if (!apiData) return;
    
    // Set up primary objectives for both players
    const primaryObjective = apiData.secondaries.find(
      sec => sec.id === 'primary'
    );
    
    // Set up secondary deck for both players
    const secondaryDeck = apiData.secondaries
      // Shuffle the deck
      .sort(() => Math.random() - 0.5);
    
    // Create primary objective
    const primary: Primary = {
      id: primaryObjective?.id || 'primary-1',
      name: primaryObjective?.name || 'Take and Hold',
      description: primaryObjective?.description || 'Control objectives to score points',
      pointsPerTurn: [5, 5, 5, 5, 5], // Default points per turn
      score: [0, 0, 0, 0, 0]
    };
    
    // Update players with decks and primary
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        primary,
        // Each player gets their own shuffled deck
        secondaryDeck: [...secondaryDeck].map(sec => ({
          ...sec,
          active: true,
          score: 0,
          completionsIndex: undefined,
        })),
        secondaries: []
      }))
    );
    
    setGameState({
      ...gameState,
      gamePhase: 'game',
      firstPlayerIndex,
      deploysFirstIndex
    });
  };
  
  // Draw a random secondary objective
  const drawSecondary = (playerId: string) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id !== playerId) return player;
        
        // If no cards left in deck, return unchanged
        if (player.secondaryDeck.length === 0) return player;
        
        const [drawnCard, ...remainingDeck] = player.secondaryDeck;
        
        // Mark the card as drawn in this turn and initialize for checkbox-based scoring
        const drawnSecondary: Secondary = {
          ...drawnCard,
          drawnAtTurn: gameState.currentTurn,
          completionsIndex: undefined,
          score: 0
        };
        
        return {
          ...player,
          secondaries: [...player.secondaries, drawnSecondary],
          secondaryDeck: remainingDeck
        };
      })
    );
  };
  
  // Draw specific secondary objectives
  const drawSpecificSecondaries = (playerId: string, secondaryIds: string[]) => {
    if (secondaryIds.length === 0) return;
    
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id !== playerId) return player;
        
        // Find the selected secondaries from the player's deck
        const selectedSecondaries: Secondary[] = [];
        const remainingDeck: Secondary[] = [];
        
        // Separate selected secondaries from the remaining deck
        player.secondaryDeck.forEach(sec => {
          if (secondaryIds.includes(sec.id)) {
            // Mark the card as drawn in this turn and initialize for checkbox-based scoring
            selectedSecondaries.push({
              ...sec,
              drawnAtTurn: gameState.currentTurn,
              completionsIndex: undefined,
              score: 0
            });
          } else {
            remainingDeck.push(sec);
          }
        });
        
        return {
          ...player,
          secondaries: [...player.secondaries, ...selectedSecondaries],
          secondaryDeck: remainingDeck
        };
      })
    );
  };
  
  // Discard a secondary objective
  const discardSecondary = (playerId: string, secondaryId: string) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id !== playerId) return player;
        
        // Update the secondary as discarded
        const updatedSecondaries = player.secondaries.map(sec => 
          sec.id === secondaryId
            ? { ...sec, isDiscarded: true, discardedAtTurn: gameState.currentTurn }
            : sec
        );
        
        // Find the discarded secondary
        const discardedSecondary = player.secondaries.find(sec => sec.id === secondaryId);
        
        return {
          ...player,
          secondaries: updatedSecondaries,
          discardPile: discardedSecondary 
            ? [...player.discardPile, discardedSecondary] 
            : player.discardPile
        };
      })
    );
    
    // Recalculate points after discarding
    recalculatePlayerPoints();
  };
  
  // Shuffle a secondary objective back into the player's deck
  const shuffleSecondary = (playerId: string, secondaryId: string) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id !== playerId) return player;
        
        // Find the secondary to shuffle
        const secondaryToShuffle = player.secondaries.find(sec => sec.id === secondaryId);
        
        if (!secondaryToShuffle) return player;
        
        // Reset the secondary to its original state before adding back to deck
        const resetSecondary: Secondary = {
          ...secondaryToShuffle,
          active: true,
          score: 0,
          completionsIndex: undefined,
          drawnAtTurn: undefined,
          completedAtTurn: undefined,
          discardedAtTurn: undefined,
          isDiscarded: false,
          isCompleted: false,
          isInactive: false
        };
        
        // Create a copy of the deck and shuffle the secondary back in randomly
        const updatedDeck = [...player.secondaryDeck];
        const randomPosition = Math.floor(Math.random() * (updatedDeck.length + 1));
        updatedDeck.splice(randomPosition, 0, resetSecondary);
        
        return {
          ...player,
          // Remove the secondary from the active secondaries
          secondaries: player.secondaries.filter(sec => sec.id !== secondaryId),
          // Add it back to the deck in a random position
          secondaryDeck: updatedDeck
        };
      })
    );
    
    // Recalculate points after shuffling
    recalculatePlayerPoints();
  };
  
  // Update a secondary objective
  const updateSecondary = (
    playerId: string,
    secondaryId: string,
    field: 'score' | 'completions',
    value: number
  ) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id !== playerId) return player;
        
        const updatedSecondaries = player.secondaries.map(sec => {
          if (sec.id !== secondaryId) return sec;
          
          // Don't update if discarded
          if (sec.isDiscarded) return sec;
          
          // For checkbox-based completions
          if (field === 'completions') {
            // Check if this secondary has completion options
            if (sec.completions && sec.completions[value]) {
              // If clicking the same checkbox that's already checked, uncheck it
              if (sec.completionsIndex === value) {
                return {
                  ...sec,
                  completionsIndex: undefined,
                  score: 0,
                  isCompleted: false
                };
              }
              
              // Otherwise, check the new box and uncheck others
              const selectedCompletion = sec.completions[value];
              return {
                ...sec,
                completionsIndex: value,
                score: selectedCompletion.points,
                isCompleted: true,
                completedAtTurn: gameState.currentTurn // Track which turn it was completed in
              };
            }
            return sec;
          } else {
            // Direct score update (shouldn't be used with new UI, but keeping for compatibility)
            return {
              ...sec,
              score: value
            };
          }
        });
        
        return {
          ...player,
          secondaries: updatedSecondaries
        };
      })
    );
    
    // Recalculate total points
    recalculatePlayerPoints();
  };
  
  // Update a primary objective
  const updatePrimary = (playerId: string, turn: number, value: number) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id !== playerId) return player;
        if (!player.primary) return player;
        
        const updatedScore = [...player.primary.score];
        updatedScore[turn] = value;
        
        return {
          ...player,
          primary: {
            ...player.primary,
            score: updatedScore
          }
        };
      })
    );
    
    // Recalculate total points
    recalculatePlayerPoints();
  };
  
  // Recalculate player points
  const recalculatePlayerPoints = () => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        // Calculate primary points per turn
        const primaryPoints = player.primary 
          ? player.primary.score
          : [0, 0, 0, 0, 0];
        
        // Calculate secondary points per turn
        const secondaryPointsByTurn = [0, 0, 0, 0, 0];
        
        player.secondaries.forEach(secondary => {
          // Skip if discarded
          if (secondary.isDiscarded) return;
          
          // Get the turn the secondary was drawn in
          const drawnTurn = secondary.drawnAtTurn || 1;
          
          // Apply the score to this turn
          secondaryPointsByTurn[drawnTurn - 1] += secondary.score;
        });
        
        // Calculate total points per turn (primary + secondary)
        const totalPointsByTurn = primaryPoints.map(
          (pp, i) => pp + (secondaryPointsByTurn[i] || 0)
        );
        
        // Calculate total points
        const totalPoints = totalPointsByTurn.reduce((sum, points) => sum + points, 0);
        
        return {
          ...player,
          primaryPoints,
          secondaryPoints: secondaryPointsByTurn,
          points: totalPointsByTurn,
          totalPoints
        };
      })
    );
  };
  
  // Navigate to a specific turn
  const navigateToTurn = (turnNumber: number) => {
    if (turnNumber < 1 || turnNumber > gameState.totalTurns) {
      return; // Don't navigate outside valid turns
    }

    // If navigating forward or backward, update the secondary statuses
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        const updatedSecondaries = player.secondaries.map(sec => {
          // We'll now handle secondary status based on turn navigation
          // When going forward, we need to mark completed/discarded secondaries as inactive
          
          // Skip if this secondary was drawn in the turn we're navigating to
          if (sec.drawnAtTurn === turnNumber) {
            return { ...sec, isInactive: false };
          }
          
          // If secondary was scored or discarded in current turn or earlier
          // and we're navigating forward, mark it inactive
          if ((sec.isCompleted || sec.isDiscarded) && 
              sec.drawnAtTurn !== undefined && 
              sec.drawnAtTurn <= gameState.currentTurn && 
              turnNumber > gameState.currentTurn) {
            return { ...sec, isInactive: true };
          }
          
          // When going backward, we need to re-activate secondaries that would have been active
          if (turnNumber < gameState.currentTurn) {
            if (sec.drawnAtTurn !== undefined && sec.drawnAtTurn <= turnNumber) {
              // If the secondary was drawn in or before the turn we're going back to
              // It should be active if it wasn't completed or discarded by that turn
              const wasCompletedBeforeTargetTurn = sec.completionsIndex !== undefined && 
                                                  sec.drawnAtTurn < turnNumber;
              const wasDiscardedBeforeTargetTurn = sec.isDiscarded && sec.drawnAtTurn < turnNumber;
              
              if (!wasCompletedBeforeTargetTurn && !wasDiscardedBeforeTargetTurn) {
                return { ...sec, isInactive: false };
              }
            }
          }
          
          // Keep current status for other cases
          return sec;
        });
        
        return {
          ...player,
          secondaries: updatedSecondaries
        };
      })
    );

    // Update the turn number
    setGameState(prev => ({
      ...prev,
      currentTurn: turnNumber
    }));
  };
  
  // End the current turn (move to next turn)
  const endTurn = () => {
    navigateToTurn(gameState.currentTurn + 1);
  };
  
  // End the game and show summary
  const endGame = () => {
    setGameState({ ...gameState, gamePhase: 'summary' });
  };
  
  // Reset the game
  const resetGame = () => {
    setGameState({
      currentTurn: 1,
      totalTurns: 5,
      mission: null,
      missionName: null,
      terrainLayout: null,
      gamePhase: 'player-info',
      firstPlayerIndex: null,
      deploysFirstIndex: null
    });
    
    setPlayers([
      {
        id: '1',
        name: '',
        faction: '',
        points: [0, 0, 0, 0, 0],
        primaryPoints: [0, 0, 0, 0, 0],
        secondaryPoints: [0, 0, 0, 0, 0],
        totalPoints: 0,
        secondaries: [],
        primary: null,
        secondaryDeck: [],
        discardPile: []
      },
      {
        id: '2',
        name: '',
        faction: '',
        points: [0, 0, 0, 0, 0],
        primaryPoints: [0, 0, 0, 0, 0],
        secondaryPoints: [0, 0, 0, 0, 0],
        totalPoints: 0,
        secondaries: [],
        primary: null,
        secondaryDeck: [],
        discardPile: []
      }
    ]);
  };

  // Render player info phase
  const renderPlayerInfoPhase = () => {
    return (
      <PlayerInfoPhase
        players={players}
        apiData={apiData!}
        error={error}
        updatePlayerInfo={updatePlayerInfo}
        goToMissionSelect={goToMissionSelect}
      />
    );
  };
  
  // Render mission select phase
  const renderMissionSelectPhase = () => {
    if (!apiData) return null;
    
    // Create a mission data object for the selected mission
    const selectedMission = gameState.mission 
      ? apiData.missions.find(m => m.id === gameState.mission) || null
      : null;
    
    return (
      <MissionSelectPhase
        gameState={{
          ...gameState,
          players,
          selectedMission
        }}
        apiData={apiData}
        selectMission={(missionId) => selectMission(
          missionId, 
          apiData.missions.find(m => m.id === missionId)?.name || '', 
          apiData.missions.find(m => m.id === missionId)?.terrainLayout || ''
        )}
        setFirstPlayerIndex={(index) => setGameState({...gameState, firstPlayerIndex: index})}
        setDeploysFirstIndex={(index) => setGameState({...gameState, deploysFirstIndex: index})}
        randomizeFirstPlayer={randomizeFirstPlayer}
        randomizeDeploysFirst={randomizeDeploysFirst}
        startGame={() => startGame(
          gameState.firstPlayerIndex !== null ? gameState.firstPlayerIndex : 0,
          gameState.deploysFirstIndex !== null ? gameState.deploysFirstIndex : 0
        )}
      />
    );
  };
  
  // Render game phase
  // Hook up event listener for turn navigation from GamePhase
  useEffect(() => {
    const handleNavigateToTurn = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.turnNumber === 'number') {
        navigateToTurn(customEvent.detail.turnNumber);
      }
    };
    
    document.addEventListener('navigateToTurn', handleNavigateToTurn);
    
    return () => {
      document.removeEventListener('navigateToTurn', handleNavigateToTurn);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentTurn]); // Re-add when current turn changes, navigateToTurn is intentionally omitted
  
  const renderGamePhase = () => {
    return (
      <GamePhase
        gameState={{
          ...gameState,
          players,
          mission: gameState.mission || '',
          missionName: gameState.missionName || 'Unknown Mission'
        }}
        apiData={apiData!}
        updateSecondary={updateSecondary}
        drawSecondary={drawSecondary}
        drawSpecificSecondaries={drawSpecificSecondaries}
        discardSecondary={discardSecondary}
        shuffleSecondary={shuffleSecondary}
        updatePrimary={updatePrimary}
        endTurn={endTurn}
        endGame={endGame}
      />
    );
  };
  
  // Render summary phase
  const renderSummaryPhase = () => {
    return (
      <SummaryPhase 
        gameState={{
          ...gameState,
          players,
          missionName: gameState.missionName || 'Unknown Mission'
        }}
        resetGame={resetGame}
      />
    );
  };

  return (
    <div className="min-h-screen p-4 pb-20 sm:p-6">
      <Navigation />
      
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-3">Warhammer 40k Scoreboard</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mb-8">
          Track your Warhammer 40k 10th Edition battles with this scoreboard tool.
        </p>
      </div>

      {isLoading && <LoadingIndicator />}

      {!isLoading && apiData && (
        <>
          {/* Render different content based on game phase */}
          {gameState.gamePhase === 'player-info' && renderPlayerInfoPhase()}
          {gameState.gamePhase === 'mission-select' && renderMissionSelectPhase()}
          {gameState.gamePhase === 'game' && renderGamePhase()}
          {gameState.gamePhase === 'summary' && renderSummaryPhase()}
        </>
      )}
    </div>
  );
}
