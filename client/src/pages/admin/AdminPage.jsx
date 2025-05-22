import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

import { getActiveGames } from '../../services/admin-service';
import { getAllUsers } from '../../services/user-service';
import PageContainer from '../../containers/PageContainer';

const AdminPage = () => {
  const [activeGames, setActiveGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveGames = async () => {
    try {
      const response = await getActiveGames();
      setActiveGames(response);
    } catch (err) {
      setError('Failed to fetch active games');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response);
    } catch (err) {
      setError('Failed to fetch user statistics');
    }
  };

  useEffect(() => {
    Promise.all([fetchActiveGames(), fetchUsers()])
      .then(() => setLoading(false))
      .catch((err) => {
        setLoading(false);
      });
  }, []);


  return (
    <PageContainer loading={loading} error={error}>
      <Box sx={{ my: 4 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Active Games Section */}
        <Paper sx={{ my: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Active Games
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Game ID</TableCell>
                <TableCell>Phase</TableCell>
                <TableCell>Current Turn</TableCell>
                <TableCell>Players</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeGames?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No active games
                  </TableCell>
                </TableRow>
              ) : (
                activeGames?.map((game) => (
                  <TableRow key={game.gameId}>
                    <TableCell>{game.gameId}</TableCell>
                    <TableCell>{game.phase}</TableCell>
                    <TableCell>{game.currentTurn}</TableCell>
                    <TableCell>
                      {game.players ? game.players.join(', ') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={fetchActiveGames}
          >
            Refresh Games
          </Button>
        </Paper>

        {/* User Statistics Section */}
        <Paper sx={{ my: 2, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            User Statistics
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>Nickname</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id || user._id}>
                    <TableCell>{user.id || user._id}</TableCell>
                    <TableCell>{user.nickname}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={fetchUsers}
          >
            Refresh Users
          </Button>
        </Paper>

        {/* Additional panels (e.g., server logs, analytics, etc.) can be added here */}
      </Box>
    </PageContainer>
  );
};

export default AdminPage;