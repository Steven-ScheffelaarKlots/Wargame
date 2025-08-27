"use client";

import { useState, useEffect } from 'react';
import { ScoreboardAPI } from '@/lib/api';
import { ScoreboardData, PrimaryMissionData } from '@/lib/api/types';
import { Player, Primary, Secondary, GameState, PrimaryObjective } from './types';
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
    deploysFirstIndex: null,
    selectedPrimaryMission: undefined,
    selectedTerrainLayout: undefined,
    missionSelectionMode: 'preset'
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

  // Player and game state management functions  // Update player information
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
  const selectMission = (missionId: string, missionName: string, terrainLayout: string, primaryMissionId?: string) => {
    console.log("Selecting mission:", { missionId, missionName, terrainLayout, primaryMissionId });
    
    const updates: Partial<GameState> = {
      mission: missionId,
      missionName,
      terrainLayout
    };
    
    // If a primary mission is specified, also set that
    if (primaryMissionId) {
      updates.selectedPrimaryMission = primaryMissionId;
    }
    
    // Also set the terrain layout in the selectedTerrainLayout field
    updates.selectedTerrainLayout = terrainLayout;
    
    setGameState(prevState => ({
      ...prevState,
      ...updates
    }));
  };
  
  // Select a primary mission
  const selectPrimaryMission = (missionId: string) => {
    setGameState({
      ...gameState,
      selectedPrimaryMission: missionId
    });
  };
  
  // Select a terrain layout
  const selectTerrainLayout = (layoutId: string) => {
    setGameState({
      ...gameState,
      selectedTerrainLayout: layoutId
    });
  };
  
  // Set mission selection mode
  const setMissionSelectionMode = (mode: 'preset' | 'custom') => {
    // Clear previous selections when switching modes
    setGameState({
      ...gameState,
      missionSelectionMode: mode,
      mission: null,
      missionName: null,
      selectedPrimaryMission: undefined,
      selectedTerrainLayout: undefined
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
    
    // Debug log to help diagnose issues
    console.log("Starting game with state:", {
      mission: gameState.mission,
      missionName: gameState.missionName,
      terrainLayout: gameState.terrainLayout,
      selectedPrimaryMission: gameState.selectedPrimaryMission,
      selectedTerrainLayout: gameState.selectedTerrainLayout,
      firstPlayerIndex,
      deploysFirstIndex
    });
    
    // Get the primary mission from state
    const selectedPrimaryMissionId = gameState.selectedPrimaryMission;
    
    // Set up secondary deck for both players
    const secondaryDeck = apiData.secondaries
      // Shuffle the deck
      .sort(() => Math.random() - 0.5);
    
    // Find the primary mission data for the selected primary mission
    const primaryMissionData = apiData.primaryMissions?.find(
      (mission: PrimaryMissionData) => mission.id === selectedPrimaryMissionId
    );
    
    // Create primary objective
    let primary: Primary;
    
    if (primaryMissionData) {
      // Initialize objectives for each turn
      const objectives: PrimaryObjective[][] = Array(5).fill([]).map((_, turnIndex) => {
        const turnNumber = turnIndex + 1;
        return primaryMissionData.objectives
          .filter((obj) => obj.availableInTurns.includes(turnNumber))
          .map((obj) => ({
            id: obj.id,
            description: obj.description,
            points: obj.points,
            availableInTurns: obj.availableInTurns,
            scored: false
          }));
      });
      
      primary = {
        id: primaryMissionData.id,
        name: primaryMissionData.name,
        description: primaryMissionData.description,
        pointsPerTurn: primaryMissionData.maxPointsPerTurn,
        maxPointsPerTurn: primaryMissionData.maxPointsPerTurn,
        score: [0, 0, 0, 0, 0],
        objectives: objectives
      };
    } else {
      // Fallback to legacy format if no primary mission data found
      const primaryObjective = apiData.primaryObjectives?.find(
        (obj) => obj.id === 'take-and-hold'
      ) || {
        id: 'take-and-hold',
        name: 'Take and Hold',
        description: 'Control objectives to score points',
        pointsPerTurn: [5, 5, 5, 5, 5]
      };
      
      primary = {
        id: primaryObjective.id,
        name: primaryObjective.name,
        description: primaryObjective.description,
        pointsPerTurn: primaryObjective.pointsPerTurn,
        maxPointsPerTurn: primaryObjective.pointsPerTurn,
        score: [0, 0, 0, 0, 0],
        objectives: []
      };
    }
    
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
          scoringType: sec.scoringType || 'exclusive', // Default to exclusive if not specified
          completionsIndex: undefined,
          selectedConditions: [], // Initialize for multiple scoring type
          conditionCounts: {}, // Initialize empty counts for counter scoring type
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
        
        // Mark the card as drawn in this turn and initialize for scoring
        const drawnSecondary: Secondary = {
          ...drawnCard,
          drawnAtTurn: gameState.currentTurn,
          completionsIndex: undefined,
          selectedConditions: [], // Initialize empty array for multiple scoring
          conditionCounts: {}, // Initialize empty counts for counter scoring type
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
            // Mark the card as drawn in this turn and initialize for scoring
            selectedSecondaries.push({
              ...sec,
              drawnAtTurn: gameState.currentTurn,
              completionsIndex: undefined,
              selectedConditions: [], // Initialize empty array for multiple scoring
              conditionCounts: {}, // Initialize empty counts for counter scoring type
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
          selectedConditions: [], // Reset for multiple scoring type
          conditionCounts: {}, // Reset for counter scoring type
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
  
  // Update a primary objective (legacy)
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
  
  // Update a specific primary objective checkbox
  const updatePrimaryObjective = (playerId: string, turn: number, objectiveId: string, scored: boolean) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id !== playerId) return player;
        if (!player.primary || !player.primary.objectives || !player.primary.objectives[turn]) return player;
        
        // Update the specific objective
        const updatedObjectives = [...player.primary.objectives];
        const turnObjectives = [...updatedObjectives[turn]];
        
        const updatedTurnObjectives = turnObjectives.map(obj => 
          obj.id === objectiveId ? { ...obj, scored } : obj
        );
        
        updatedObjectives[turn] = updatedTurnObjectives;
        
        // Calculate new score based on checked objectives
        const newTurnScore = updatedTurnObjectives
          .filter(obj => obj.scored)
          .reduce((sum, obj) => sum + obj.points, 0);
        
        // Cap at max points for the turn
        const cappedScore = Math.min(
          newTurnScore, 
          player.primary.maxPointsPerTurn[turn] || Number.MAX_SAFE_INTEGER
        );
        
        // Update score for this turn
        const updatedScore = [...player.primary.score];
        updatedScore[turn] = cappedScore;
        
        return {
          ...player,
          primary: {
            ...player.primary,
            objectives: updatedObjectives,
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
  
  // Update a secondary condition (for multiple scoring type)
  const updateSecondaryCondition = (
    playerId: string,
    secondaryId: string,
    conditionId: string,
    checked: boolean
  ) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id !== playerId) return player;
        
        const updatedSecondaries = player.secondaries.map(sec => {
          if (sec.id !== secondaryId) return sec;
          
          // Don't update if discarded
          if (sec.isDiscarded) return sec;
          
          // Skip if this isn't a multiple-condition secondary
          if (sec.scoringType !== 'multiple' || !sec.conditions) return sec;
          
          // Get the condition that was checked/unchecked
          const condition = sec.conditions.find(c => c.id === conditionId);
          if (!condition) return sec;
          
          // Get the current selected conditions
          const selectedConditions = sec.selectedConditions || [];
          
          let updatedSelectedConditions: string[];
          let newScore = sec.score;
          
          if (checked) {
            // Add this condition if it doesn't exist
            if (!selectedConditions.includes(conditionId)) {
              updatedSelectedConditions = [...selectedConditions, conditionId];
              // Update score (ensure it doesn't exceed maxPoints)
              newScore = Math.min(
                (sec.score || 0) + condition.points,
                sec.maxPoints || Number.MAX_SAFE_INTEGER
              );
            } else {
              // No change needed
              return sec;
            }
          } else {
            // Remove this condition if it exists
            if (selectedConditions.includes(conditionId)) {
              updatedSelectedConditions = selectedConditions.filter(id => id !== conditionId);
              // Update score
              newScore = Math.max(0, (sec.score || 0) - condition.points);
            } else {
              // No change needed
              return sec;
            }
          }
          
          return {
            ...sec,
            selectedConditions: updatedSelectedConditions,
            score: newScore,
            // Mark as completed if we reach max points
            isCompleted: newScore >= (sec.maxPoints || Number.MAX_SAFE_INTEGER),
            // Update completedAtTurn if newly completed
            ...(newScore >= (sec.maxPoints || Number.MAX_SAFE_INTEGER) && !sec.isCompleted 
                ? { completedAtTurn: gameState.currentTurn } 
                : {})
          };
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
  
  // Update counter for counter-based secondary
  const updateSecondaryCounter = (
    playerId: string,
    secondaryId: string,
    conditionId: string,
    increment: boolean // true to increment, false to decrement
  ) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => {
        if (player.id !== playerId) return player;
        
        const updatedSecondaries = player.secondaries.map(sec => {
          if (sec.id !== secondaryId) return sec;
          
          // Don't update if discarded
          if (sec.isDiscarded) return sec;
          
          // Skip if this isn't a counter-based secondary
          if (sec.scoringType !== 'counter' || !sec.conditions) return sec;
          
          // Get the condition to update
          const condition = sec.conditions.find(c => c.id === conditionId);
          if (!condition) return sec;
          
          // Get the current counts
          const conditionCounts = sec.conditionCounts || {};
          const currentCount = conditionCounts[conditionId] || 0;
          
          // Calculate new count
          let newCount;
          if (increment) {
            // Allow unlimited counting - points will be capped at maxPoints later
            newCount = currentCount + 1;
          } else {
            // Don't go below zero
            newCount = Math.max(0, currentCount - 1);
          }
          
          // Only update if count changed
          if (newCount === currentCount) return sec;
          
          // Calculate score difference
          const countDifference = newCount - currentCount;
          const scoreDifference = countDifference * condition.points;
          
          // Calculate new score (capped at maxPoints)
          const newScore = Math.min(
            Math.max(0, sec.score + scoreDifference),
            sec.maxPoints || Number.MAX_SAFE_INTEGER
          );
          
          return {
            ...sec,
            conditionCounts: {
              ...conditionCounts,
              [conditionId]: newCount
            },
            score: newScore,
            // Mark as completed if we reach max points
            isCompleted: newScore >= (sec.maxPoints || Number.MAX_SAFE_INTEGER),
            // Update completedAtTurn if newly completed
            ...(newScore >= (sec.maxPoints || Number.MAX_SAFE_INTEGER) && !sec.isCompleted 
                ? { completedAtTurn: gameState.currentTurn } 
                : {})
          };
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
      ? apiData.missions.find((m) => m.id === gameState.mission) || null
      : null;
    
    return (
      <MissionSelectPhase
        gameState={{
          ...gameState,
          players,
          selectedMission
        }}
        apiData={apiData}
        selectMission={(missionId, missionName, terrainLayout, primaryMissionId) => selectMission(
          missionId, 
          missionName,
          terrainLayout,
          primaryMissionId
        )}
        selectPrimaryMission={selectPrimaryMission}
        selectTerrainLayout={selectTerrainLayout}
        setMissionSelectionMode={setMissionSelectionMode}
        setFirstPlayerIndex={(index) => setGameState({...gameState, firstPlayerIndex: index})}
        setDeploysFirstIndex={(index) => setGameState({...gameState, deploysFirstIndex: index})}
        randomizeFirstPlayer={randomizeFirstPlayer}
        randomizeDeploysFirst={randomizeDeploysFirst}
        startGame={(firstPlayerIndex, deploysFirstIndex) => startGame(
          firstPlayerIndex,
          deploysFirstIndex
        )}
      />
    );
  };
  
  // Render game phase
  // Hook up event listeners for turn navigation and secondary condition updates
  useEffect(() => {
    const handleNavigateToTurn = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && typeof customEvent.detail.turnNumber === 'number') {
        navigateToTurn(customEvent.detail.turnNumber);
      }
    };
    
    const handleUpdateSecondaryCondition = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { playerId, secondaryId, conditionId, checked } = customEvent.detail || {};
      if (playerId && secondaryId && conditionId !== undefined && checked !== undefined) {
        updateSecondaryCondition(playerId, secondaryId, conditionId, checked);
      }
    };
    
    const handleUpdateSecondaryCounter = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { playerId, secondaryId, conditionId, increment } = customEvent.detail || {};
      if (playerId && secondaryId && conditionId !== undefined && increment !== undefined) {
        updateSecondaryCounter(playerId, secondaryId, conditionId, increment);
      }
    };
    
    document.addEventListener('navigateToTurn', handleNavigateToTurn);
    document.addEventListener('updateSecondaryCondition', handleUpdateSecondaryCondition);
    document.addEventListener('updateSecondaryCounter', handleUpdateSecondaryCounter);
    
    return () => {
      document.removeEventListener('navigateToTurn', handleNavigateToTurn);
      document.removeEventListener('updateSecondaryCondition', handleUpdateSecondaryCondition);
      document.removeEventListener('updateSecondaryCounter', handleUpdateSecondaryCounter);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentTurn]); // Re-add when current turn changes, navigateToTurn and updateSecondaryCondition are intentionally omitted
  
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
        updatePrimaryObjective={updatePrimaryObjective}
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
