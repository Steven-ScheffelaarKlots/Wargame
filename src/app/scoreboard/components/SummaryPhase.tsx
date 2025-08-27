"use client";

import { Player, GameState } from "../types";

interface ExtendedGameState extends GameState {
  players: Player[];
  missionName: string;
}

interface SummaryPhaseProps {
  gameState: ExtendedGameState;
  resetGame: () => void;
}

export const SummaryPhase = ({ gameState, resetGame }: SummaryPhaseProps) => {
  const firstPlayerIndex = gameState.firstPlayerIndex !== null ? gameState.firstPlayerIndex : 0;
  const deploysFirstIndex = gameState.deploysFirstIndex !== null ? gameState.deploysFirstIndex : 0;
  
  // Sort players by total points (highest first)
  const sortedPlayers = [...gameState.players].sort((a, b) => b.totalPoints - a.totalPoints);
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center">Game Summary</h2>
      
      <div className="bg-black/[.03] dark:bg-white/[.03] border dark:border-gray-700 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-2">{gameState.missionName}</h3>
        <div className="text-sm opacity-75 space-x-2">
          <span>First player: {gameState.players[firstPlayerIndex]?.name || 'Player 1'}</span>
          <span>•</span>
          <span>First deploy: {gameState.players[deploysFirstIndex]?.name || 'Player 1'}</span>
        </div>
      </div>
      
      <div className="flex justify-center mb-8">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead>
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-6">Rank</th>
              <th className="py-3.5 px-3 text-left text-sm font-semibold">Player</th>
              <th className="py-3.5 px-3 text-left text-sm font-semibold">Faction</th>
              <th className="py-3.5 px-3 text-right text-sm font-semibold">Primary</th>
              <th className="py-3.5 px-3 text-right text-sm font-semibold">Secondary</th>
              <th className="py-3.5 px-3 text-right text-sm font-semibold">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {sortedPlayers.map((player, index) => {
              const primaryTotal = player.primaryPoints.reduce((a, b) => a + b, 0);
              const secondaryTotal = player.secondaryPoints.reduce((a, b) => a + b, 0);
              
              return (
                <tr key={player.id} className={index === 0 ? "bg-amber-100 dark:bg-amber-900/20" : ""}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap py-4 px-3 text-sm">
                    {player.name}
                  </td>
                  <td className="whitespace-nowrap py-4 px-3 text-sm">
                    {player.faction}
                  </td>
                  <td className="whitespace-nowrap py-4 px-3 text-sm text-right">
                    {primaryTotal}
                  </td>
                  <td className="whitespace-nowrap py-4 px-3 text-sm text-right">
                    {secondaryTotal}
                  </td>
                  <td className="whitespace-nowrap py-4 px-3 text-sm font-bold text-right">
                    {player.totalPoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <h3 className="text-xl font-bold">Turn-by-Turn Breakdown</h3>
      
      {gameState.players.map(player => (
        <div key={player.id} className="border dark:border-gray-700 rounded-lg p-6 mb-6 bg-black/[.03] dark:bg-white/[.03]">
          <h4 className="text-lg font-bold mb-4">{player.name} ({player.faction})</h4>
          
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 text-left text-sm font-semibold">Turn</th>
                <th className="py-2 text-left text-sm font-semibold">Primary</th>
                <th className="py-2 text-left text-sm font-semibold">Secondary</th>
                <th className="py-2 text-right text-sm font-semibold">Points</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: gameState.totalTurns }, (_, i) => i + 1).map(turn => {
                // Find all secondaries relevant for this turn's summary
                const turnSecondaries = player.secondaries.filter(sec => {
                  // Include if it was drawn in this turn
                  const drawnThisTurn = sec.drawnAtTurn === turn;
                  
                  // Include if it was completed in this turn
                  const completedThisTurn = sec.isCompleted && sec.completedAtTurn === turn;
                  
                  // Include if it was discarded in this turn
                  const discardedThisTurn = sec.isDiscarded && sec.discardedAtTurn === turn;
                  
                  // Include if it was active during this turn (drawn earlier and not yet completed/discarded)
                  const wasActiveThisTurn = 
                    sec.drawnAtTurn !== undefined && 
                    sec.drawnAtTurn < turn && 
                    // Not discarded before or during this turn
                    !(sec.isDiscarded && sec.discardedAtTurn !== undefined && sec.discardedAtTurn < turn) &&
                    // Not completed before this turn
                    !(sec.isCompleted && sec.completedAtTurn !== undefined && sec.completedAtTurn < turn);
                  
                  return drawnThisTurn || completedThisTurn || discardedThisTurn || wasActiveThisTurn;
                });
                
                return (
                  <tr key={turn} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="py-3 text-sm">{turn}</td>
                    <td className="py-3 text-sm">
                      {player.primary?.name}: {player.primaryPoints[turn - 1] || 0} pts
                    </td>
                    <td className="py-3 text-sm">
                      <ul>
                        {turnSecondaries.map(sec => (
                          <li key={sec.id} className="mb-1">
                            <span className="font-medium">{sec.name}</span>: {sec.score} pts
                            {sec.isDiscarded && turn === sec.discardedAtTurn && (
                              <span className="ml-2 text-red-500">(Discarded)</span>
                            )}
                            {sec.isCompleted && turn === sec.completedAtTurn && (
                              <span className="ml-2 text-green-500">(Completed)</span>
                            )}
                            {turn === sec.drawnAtTurn && (
                              <span className="ml-2 text-blue-500">(Drawn)</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-3 text-sm text-right font-medium">
                      {(player.primaryPoints[turn - 1] || 0) + (player.secondaryPoints[turn - 1] || 0)}
                    </td>
                  </tr>
                );
              })}
              
              <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                <td className="py-3 text-sm font-bold">Total</td>
                <td className="py-3 text-sm font-bold">
                  {player.primaryPoints.reduce((a, b) => a + b, 0)} pts
                </td>
                <td className="py-3 text-sm font-bold">
                  {player.secondaryPoints.reduce((a, b) => a + b, 0)} pts
                </td>
                <td className="py-3 text-sm text-right font-bold">
                  {player.totalPoints} pts
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}
      
      <div className="flex justify-center mt-8">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium"
        >
          Start New Game
        </button>
      </div>
    </div>
  );
};
