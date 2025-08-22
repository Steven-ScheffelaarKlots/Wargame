"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ScoreboardAPI } from '@/lib/api';
import { 
  FactionData, 
  MissionData, 
  SecondaryObjectiveData,
  ScoreboardData
} from '@/lib/api/types';

// For development fallback - will be removed in production
import { mockScoreboardData } from '@/lib/api/mockData';

// INTERFACES
interface Secondary {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category?: string;
  pointsPerCompletion: number;
  maxCompletions?: number;
  active: boolean;
  score: number;
  completions: number;
}

interface Primary {
  id: string;
  name: string;
  description: string;
  pointsPerTurn: number[];
  score: number[];
}

interface Player {
  id: string;
  name: string;
  faction: string;
  points: number[];  // Array of points per turn
  primaryPoints: number[];  // Points from primary objectives
  secondaryPoints: number[];  // Points from secondary objectives
  totalPoints: number;
  secondaries: Secondary[];
  primary: Primary | null;
}

interface GameState {
  currentTurn: number;
  totalTurns: number;
  mission: string | null;
  terrainLayout: string | null;
  gamePhase: 'setup' | 'player-info' | 'mission-select' | 'game' | 'summary';
  firstPlayerIndex: number | null;
}

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
      primary: null
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
      primary: null
    }
  ]);

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    currentTurn: 1,
    totalTurns: 5,
    mission: null,
    terrainLayout: null,
    gamePhase: 'player-info',
    firstPlayerIndex: null
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
    if (!superfaction) return '';
    
    switch (superfaction) {
      case 'imperium':
        return 'text-blue-600 dark:text-blue-400';
      case 'chaos':
        return 'text-red-600 dark:text-red-400';
      case 'xenos':
        return 'text-green-600 dark:text-green-400';
      default:
        return '';
    }
  };

  // Update player information
  const updatePlayerInfo = (playerId: string, field: 'name' | 'faction', value: string) => {
    setPlayers(players.map(player => 
      player.id === playerId ? { ...player, [field]: value } : player
    ));
  };

  // Move to mission selection phase
  const goToMissionSelect = () => {
    if (players.every(p => p.name && p.faction)) {
      setGameState({ ...gameState, gamePhase: 'mission-select' });
    }
  };

  // Select a mission
  const selectMission = (missionId: string) => {
    if (!apiData) return;
    
    const mission = apiData.missions.find(m => m.id === missionId);
    if (mission) {
      setGameState({ 
        ...gameState, 
        mission: mission.name, 
        terrainLayout: mission.terrainLayout
      });
    }
  };

  // Start the game
  const startGame = (firstPlayerIndex: number) => {
    if (!apiData) return;
    
    // Randomly select a primary objective
    const randomPrimaryIndex = Math.floor(Math.random() * apiData.primaryObjectives.length);
    const selectedPrimary = apiData.primaryObjectives[randomPrimaryIndex];
    
    // Generate random secondaries for each player
    const updatedPlayers = players.map(player => {
      // Randomly select 2 secondaries
      const shuffled = [...apiData.secondaries].sort(() => 0.5 - Math.random());
      const selectedSecondaries = shuffled.slice(0, 2).map(sec => ({
        ...sec,
        active: true,
        score: 0,
        completions: 0
      }));

      // Create primary objective for player
      const primary: Primary = {
        id: selectedPrimary.id,
        name: selectedPrimary.name,
        description: selectedPrimary.description,
        pointsPerTurn: [...selectedPrimary.pointsPerTurn],
        score: [0, 0, 0, 0, 0]
      };

      return {
        ...player,
        primaryPoints: [0, 0, 0, 0, 0],
        secondaryPoints: [0, 0, 0, 0, 0],
        secondaries: selectedSecondaries,
        primary
      };
    });

    setPlayers(updatedPlayers);
    setGameState({ 
      ...gameState, 
      gamePhase: 'game', 
      firstPlayerIndex
    });
  };

  // Update primary objective points for a specific turn
  const updatePrimaryPoints = (playerId: string, turnIndex: number, points: number) => {
    setPlayers(players.map(player => {
      if (player.id === playerId && player.primary) {
        // Update primary points for the turn
        const updatedPrimaryPoints = [...player.primaryPoints];
        updatedPrimaryPoints[turnIndex] = Math.max(0, points);
        
        // Update primary score for the turn
        const updatedPrimaryScore = [...player.primary.score];
        updatedPrimaryScore[turnIndex] = Math.max(0, points);
        
        // Calculate total points
        const totalPrimaryPoints = updatedPrimaryPoints.reduce((sum, p) => sum + p, 0);
        const totalSecondaryPoints = player.secondaryPoints.reduce((sum, p) => sum + p, 0);
        
        // Calculate combined points per turn
        const updatedPoints = player.primaryPoints.map((p, i) => 
          player.primaryPoints[i] + player.secondaryPoints[i]
        );
        
        return { 
          ...player, 
          primaryPoints: updatedPrimaryPoints,
          points: updatedPoints,
          totalPoints: totalPrimaryPoints + totalSecondaryPoints,
          primary: { ...player.primary, score: updatedPrimaryScore }
        };
      }
      return player;
    }));
  };

  // Update secondary objective points
  const updateSecondary = (playerId: string, secondaryId: string, action: 'score' | 'remove') => {
    setPlayers(players.map(player => {
      if (player.id === playerId) {
        // Get the current turn index
        const turnIndex = gameState.currentTurn - 1;
        
        // Update the secondary
        const updatedSecondaries = player.secondaries.map(sec => {
          if (sec.id === secondaryId) {
            if (action === 'score') {
              // Increment completions and score based on pointsPerCompletion
              const newCompletions = sec.maxCompletions 
                ? Math.min(sec.completions + 1, sec.maxCompletions)
                : sec.completions + 1;
                
              return { 
                ...sec, 
                score: sec.score + sec.pointsPerCompletion,
                completions: newCompletions
              };
            } else if (action === 'remove') {
              return { ...sec, active: false };
            }
          }
          return sec;
        });
        
        // Calculate total secondary points from all secondaries
        const totalSecondaryPoints = updatedSecondaries.reduce((sum, sec) => sum + sec.score, 0);
        
        // Update secondary points for the current turn
        const updatedSecondaryPoints = [...player.secondaryPoints];
        // Assign all secondary points to the current turn for simplicity
        updatedSecondaryPoints[turnIndex] = totalSecondaryPoints;
        
        // Calculate combined points per turn
        const updatedPoints = updatedSecondaryPoints.map((sp, i) => 
          (player.primaryPoints[i] || 0) + sp
        );
        
        // Calculate total points
        const totalPoints = player.primaryPoints.reduce((sum, p) => sum + p, 0) + totalSecondaryPoints;
        
        return { 
          ...player, 
          secondaries: updatedSecondaries,
          secondaryPoints: updatedSecondaryPoints,
          points: updatedPoints,
          totalPoints
        };
      }
      return player;
    }));
  };

  // Next turn
  const nextTurn = () => {
    if (gameState.currentTurn < gameState.totalTurns) {
      setGameState({
        ...gameState,
        currentTurn: gameState.currentTurn + 1
      });
    } else {
      // End game
      setGameState({
        ...gameState,
        gamePhase: 'summary'
      });
    }
  };
  
  // Previous turn
  const previousTurn = () => {
    if (gameState.currentTurn > 1) {
      setGameState({
        ...gameState,
        currentTurn: gameState.currentTurn - 1
      });
    }
  };

  // Reset game
  const resetGame = () => {
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
        primary: null
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
        primary: null
      }
    ]);
    
    setGameState({
      currentTurn: 1,
      totalTurns: 5,
      mission: null,
      terrainLayout: null,
      gamePhase: 'player-info',
      firstPlayerIndex: null
    });
  };

  // RENDER COMPONENTS BASED ON GAME PHASE
  
  // Player Info Phase
  const renderPlayerInfoPhase = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
          <h3 className="text-lg font-bold mb-2">Error Loading Data</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Retry
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
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Mission Selection
          </button>
        </div>
      </div>
    );
  };

  // Mission Selection Phase
  const renderMissionSelectPhase = () => {
    if (!apiData) return null;
    
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold">Mission Selection</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apiData.missions.map((mission) => (
            <div 
              key={mission.id}
              onClick={() => selectMission(mission.id)}
              className={`p-4 border rounded-lg cursor-pointer ${
                gameState.mission === mission.name
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:bg-black/[.03] dark:hover:bg-white/[.03]'
              }`}
            >
              <h3 className="font-bold text-lg">{mission.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{mission.description}</p>
              <p className="text-xs text-amber-600 mt-2">
                Terrain: {mission.terrainLayout}
              </p>
            </div>
          ))}
        </div>
        
        {gameState.mission && gameState.terrainLayout && (
          <div className="border dark:border-gray-700 rounded-lg p-4 bg-black/[.03] dark:bg-white/[.03]">
            <h3 className="font-bold">Terrain Layout: {gameState.terrainLayout}</h3>
            <p className="text-sm mt-1">
              {apiData.terrainLayouts[gameState.terrainLayout as keyof typeof apiData.terrainLayouts] || 
               "Terrain layout details not available"}
            </p>
          </div>
        )}
        
        <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
          <h3 className="font-bold text-lg mb-3">Who goes first?</h3>
          <div className="flex gap-4">
            <button
              onClick={() => startGame(0)}
              className="px-4 py-2 border border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md flex-1"
            >
              {players[0].name} (<span className={getFactionColorClass(players[0].faction)}>{players[0].faction}</span>)
            </button>
            <button
              onClick={() => startGame(1)}
              className="px-4 py-2 border border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-md flex-1"
            >
              {players[1].name} (<span className={getFactionColorClass(players[1].faction)}>{players[1].faction}</span>)
            </button>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setGameState({ ...gameState, gamePhase: 'player-info' })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-black/[.03] dark:hover:bg-white/[.03] rounded-md"
          >
            Back
          </button>
          <button
            onClick={() => startGame(Math.floor(Math.random() * 2))}
            disabled={!gameState.mission}
            className={`px-6 py-2 rounded-md font-medium ${
              gameState.mission
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Random First Player
          </button>
        </div>
      </div>
    );
  };

  // Game Phase
  const renderGamePhase = () => {
    // Determine player order based on first player
    const orderedPlayers = gameState.firstPlayerIndex !== null 
      ? [players[gameState.firstPlayerIndex], players[gameState.firstPlayerIndex === 0 ? 1 : 0]]
      : players;
      
    return (
      <div className="space-y-8">
        {/* Turn progress indicator */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
          <div 
            className="bg-amber-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${(gameState.currentTurn / gameState.totalTurns) * 100}%` }}
          ></div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold">
            Turn {gameState.currentTurn} of {gameState.totalTurns}
          </h2>
          
          <div className="flex flex-col w-full md:w-auto gap-3">
            {/* Turn navigation buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={previousTurn}
                disabled={gameState.currentTurn === 1}
                className={`px-4 py-2 rounded-md ${
                  gameState.currentTurn === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-slate-600 hover:bg-slate-700 text-white'
                }`}
              >
                Previous Turn
              </button>
              <button
                onClick={nextTurn}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
              >
                {gameState.currentTurn === gameState.totalTurns ? 'End Game' : 'Next Turn'}
              </button>
            </div>
            
            {/* Turn selector */}
            <div className="flex justify-center gap-2 mt-2">
              {Array.from({ length: gameState.totalTurns }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setGameState({ ...gameState, currentTurn: index + 1 })}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    gameState.currentTurn === index + 1
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-amber-200 dark:hover:bg-amber-800'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {orderedPlayers.map((player, idx) => (
            <div key={player.id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
              <div 
                className={`p-4 ${idx === 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-800/30'}`}
              >
                <h3 className="font-bold text-lg flex justify-between">
                  <span>
                    {player.name} (<span className={getFactionColorClass(player.faction)}>{player.faction}</span>)
                    {getSuperfactionForFaction(player.faction) && 
                      <span className="text-xs ml-1 opacity-75">[{getSuperfactionForFaction(player.faction)}]</span>
                    }
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-xl">{player.totalPoints} pts</span>
                    <span className="text-xs text-gray-500">
                      Primary: {player.primaryPoints.reduce((a, b) => a + b, 0)} | 
                      Secondary: {player.secondaryPoints.reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </h3>
              </div>
              
              <div className="p-4 space-y-6">
                {/* Primary Objective */}
                {player.primary && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Primary Objective: {player.primary.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{player.primary.description}</p>
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Turn {gameState.currentTurn} Primary Points</span>
                        <span className="text-sm font-medium">Max: {player.primary.pointsPerTurn[gameState.currentTurn - 1]} pts</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updatePrimaryPoints(
                            player.id, 
                            gameState.currentTurn - 1, 
                            (player.primaryPoints[gameState.currentTurn - 1] || 0) - 1
                          )}
                          className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={player.primaryPoints[gameState.currentTurn - 1] || 0}
                          onChange={(e) => updatePrimaryPoints(
                            player.id, 
                            gameState.currentTurn - 1, 
                            parseInt(e.target.value) || 0
                          )}
                          min="0"
                          max={player.primary.pointsPerTurn[gameState.currentTurn - 1]}
                          className="w-16 text-center px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
                        />
                        <button
                          onClick={() => updatePrimaryPoints(
                            player.id, 
                            gameState.currentTurn - 1, 
                            (player.primaryPoints[gameState.currentTurn - 1] || 0) + 1
                          )}
                          className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Secondaries */}
                <div>
                  <h4 className="font-medium mb-2">Secondary Objectives</h4>
                  <div className="space-y-3">
                    {player.secondaries.filter(sec => sec.active).map((secondary) => (
                      <div 
                        key={secondary.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-md p-3"
                      >
                        <div className="flex justify-between mb-1">
                          <h5 className="font-medium">{secondary.name}</h5>
                          <span className="text-amber-600 font-mono">{secondary.score} pts</span>
                        </div>
                        
                        {secondary.category && (
                          <div className="text-xs text-gray-500 mb-1">Category: {secondary.category}</div>
                        )}
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {secondary.shortDescription}
                        </p>
                        
                        <details className="text-xs mb-3">
                          <summary className="cursor-pointer text-blue-600">Full rules</summary>
                          <p className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            {secondary.description}
                          </p>
                        </details>
                        
                        {/* Progress bar for completion if max exists */}
                        {secondary.maxCompletions && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Completions: {secondary.completions}/{secondary.maxCompletions}</span>
                              <span>{secondary.pointsPerCompletion} pts each</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-amber-600 h-1.5 rounded-full" 
                                style={{ width: `${(secondary.completions / secondary.maxCompletions) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateSecondary(player.id, secondary.id, 'score')}
                            className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                            disabled={secondary.maxCompletions !== undefined && secondary.completions >= secondary.maxCompletions}
                          >
                            Score +{secondary.pointsPerCompletion}
                          </button>
                          <button
                            onClick={() => updateSecondary(player.id, secondary.id, 'remove')}
                            className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {player.secondaries.filter(sec => sec.active).length === 0 && (
                      <p className="text-sm italic text-gray-500">No active secondaries</p>
                    )}
                  </div>
                </div>
                
                {/* Points summary */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-2">Points Summary</h4>
                  
                  <div className="grid grid-cols-6 gap-1 text-center text-sm">
                    <div className="p-1"></div>
                    {[1, 2, 3, 4, 5].map(turn => (
                      <div key={turn} className="p-1">
                        <div className="text-xs text-gray-500">Turn {turn}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1 text-center text-sm border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                    <div className="p-1 text-left font-medium text-xs">Primary</div>
                    {player.primaryPoints.map((points, i) => (
                      <button 
                        key={i}
                        onClick={() => setGameState({ ...gameState, currentTurn: i+1 })}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          i === gameState.currentTurn - 1 
                            ? 'bg-amber-100 dark:bg-amber-900/30' 
                            : i < gameState.currentTurn - 1
                              ? 'bg-slate-100 dark:bg-slate-800/30 hover:bg-amber-50 dark:hover:bg-amber-900/10' 
                              : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800/30'
                        }`}
                      >
                        <div>{points}</div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1 text-center text-sm border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
                    <div className="p-1 text-left font-medium text-xs">Secondary</div>
                    {player.secondaryPoints.map((points, i) => (
                      <button 
                        key={i}
                        onClick={() => setGameState({ ...gameState, currentTurn: i+1 })}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          i === gameState.currentTurn - 1 
                            ? 'bg-amber-100 dark:bg-amber-900/30' 
                            : i < gameState.currentTurn - 1
                              ? 'bg-slate-100 dark:bg-slate-800/30 hover:bg-amber-50 dark:hover:bg-amber-900/10' 
                              : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800/30'
                        }`}
                      >
                        <div>{points}</div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1 text-center text-sm font-semibold">
                    <div className="p-1 text-left">Total</div>
                    {player.points.map((points, i) => (
                      <button 
                        key={i}
                        onClick={() => setGameState({ ...gameState, currentTurn: i+1 })}
                        className={`p-1 rounded cursor-pointer transition-colors ${
                          i === gameState.currentTurn - 1 
                            ? 'bg-amber-100 dark:bg-amber-900/30 font-bold' 
                            : i < gameState.currentTurn - 1
                              ? 'bg-slate-100 dark:bg-slate-800/30 hover:bg-amber-50 dark:hover:bg-amber-900/10' 
                              : 'text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800/30'
                        }`}
                      >
                        <div>{points}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Summary Phase
  const renderSummaryPhase = () => {
    // Determine the winner
    const winner = players[0].totalPoints > players[1].totalPoints ? players[0] : 
                   players[1].totalPoints > players[0].totalPoints ? players[1] : null;
    
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold">Game Summary</h2>
        
        <div className="border dark:border-gray-700 rounded-lg p-6 text-center bg-black/[.03] dark:bg-white/[.03]">
          {winner ? (
            <>
              <h3 className="text-xl font-bold mb-2">Winner: {winner.name}</h3>
              <p className="text-3xl font-bold text-amber-600">
                {winner.totalPoints} <span className="text-base">points</span>
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-2">It&apos;s a Draw!</h3>
              <p className="text-3xl font-bold text-amber-600">
                {players[0].totalPoints} <span className="text-base">points each</span>
              </p>
            </>
          )}
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            {players.map(player => (
              <div 
                key={player.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-md p-4"
              >
                <h4 className="font-bold">{player.name}</h4>
                <p>
                  <span className={`text-sm ${getFactionColorClass(player.faction)}`}>
                    {player.faction}
                  </span>
                  {getSuperfactionForFaction(player.faction) && 
                    <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">
                      {getSuperfactionForFaction(player.faction)}
                    </span>
                  }
                </p>
                <p className="text-2xl font-bold mt-2">{player.totalPoints} pts</p>
                
                <div className="mt-4 text-left">
                  <h5 className="text-sm font-medium border-b pb-1 mb-2">Points by Turn</h5>
                  
                  <div className="grid grid-cols-6 gap-1 text-center text-xs mb-1">
                    <div className="p-1"></div>
                    {[1, 2, 3, 4, 5].map(turn => (
                      <div key={turn} className="p-1">
                        <div className="text-gray-500">Turn {turn}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1 text-center text-xs">
                    <div className="p-1 text-left">Primary</div>
                    {player.primaryPoints.map((points, i) => (
                      <div key={i} className="p-1">
                        <div>{points}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1 text-center text-xs border-b border-gray-200 dark:border-gray-700 pb-1 mb-1">
                    <div className="p-1 text-left">Secondary</div>
                    {player.secondaryPoints.map((points, i) => (
                      <div key={i} className="p-1">
                        <div>{points}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-6 gap-1 text-center text-xs font-medium">
                    <div className="p-1 text-left">Total</div>
                    {player.points.map((points, i) => (
                      <div key={i} className="p-1">
                        <div>{points}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center pt-4">
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
          >
            New Game
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 sm:p-8">
      <header className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Warhammer 40k Scoreboard</h1>
          <Link 
            href="/"
            className="text-amber-600 hover:underline"
          >
            Return Home
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
          Track your Warhammer 40k 10th Edition battles with this scoreboard tool.
        </p>
      </header>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading game data...</p>
        </div>
      )}

      {!isLoading && (
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
