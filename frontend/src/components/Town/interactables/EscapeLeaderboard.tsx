import { Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import { GameResult } from '../../../types/CoveyTownSocket';

/**
 * A component that renders a list of GameResult's as a leaderboard, formatted as a table with the following columns:
 * - Player: the name of the player
 * - Wins: the number of games the player has won
 * - Losses: the number of games the player has lost
 * - Ties: the number of games the player has tied
 * Each column has a header (a table header `th` element) with the name of the column.
 *
 *
 * The table is sorted by the number of wins, with the player with the most wins at the top.
 *
 * @returns
 */
export default function EscapeLeaderboard({ results }: { results: GameResult[] }): JSX.Element {
  const timeByPlayer: Record<string, { player: string; time: number }> = {};
  results.forEach(result => {
    const players = Object.keys(result.scores);
    const p1 = players[0];
    timeByPlayer[p1] = {
      player: p1,
      time: result.time ? result.time : 0,
    };
  });
  const rows = Object.keys(timeByPlayer).map(player => timeByPlayer[player]);
  rows.sort((a, b) => a.time - b.time);
  return (
    <Table>
      <Thead>
        <Tr>
          <th>Player</th>
          <th>Time</th>
        </Tr>
      </Thead>
      <Tbody>
        {rows.map(record => {
          return (
            <Tr key={record.player}>
              <Td>{record.player}</Td>
              <Td>{record.time}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
