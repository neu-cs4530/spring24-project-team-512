import { Table, Tbody, Td, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import { getAllRows } from '../EscapeRoomDB';
import { useEffect, useState } from 'react';

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
export default function EscapeLeaderboardComponent(): JSX.Element {
  const [rows, setRows] = useState<
    { completion_time: number | null; covey_name: string | null; created_at: string; id: number }[]
  >([]);
  useEffect(() => {
    async function getData() {
      const data = await getAllRows();
      if (data) {
        if (data.length > 0) {
          setRows(data);
        }
      }
    }
    getData();
  }, []);
  const ourRows = rows.sort(
    (a, b) =>
      (a.completion_time === null ? 0 : a.completion_time) -
      (b.completion_time === null ? 1 : b.completion_time),
  );
  return (
    <Table>
      <Thead>
        <Tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Time</th>
        </Tr>
      </Thead>
      <Tbody>
        {ourRows.map((record, index) => {
          return (
            <Tr key={record.covey_name}>
              <Td>{index + 1}</Td>
              <Td>{record.covey_name}</Td>
              <Td>{record.completion_time?.toFixed(2) + 's'}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
