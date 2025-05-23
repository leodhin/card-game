import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // optional if you need params here
import PageContainer from '../../../containers/PageContainer';
import { getProfile } from '../../../services/user-service';
import { Container, Typography, Box, List, ListItem, ListItemText, Paper, Divider } from '@mui/material';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetching profile when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Error fetching profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const { matchHistory, user: { aiUsageRemaining, friends, nickname, _id, email, role } = {} } = profile;

  return (
    <PageContainer isLoading={loading} error={error}>
      <Container maxWidth="md">
        <Box sx={{ my: 6, px: 2 }}>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              mb: 4,
            }}
          >
            <img
              src="https://picsum.photos/150"
              alt="Profile"
              className="profile-picture"
              style={{ borderRadius: '50%', marginBottom: '16px' }}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              {nickname || 'Unknown'}
            </Typography>
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant="body1"><strong>User ID:</strong> {_id}</Typography>
              <Typography variant="body1"><strong>Email:</strong> {email}</Typography>
              <Typography variant="body1"><strong>Role:</strong> {role}</Typography>
              <Typography variant="body1"><strong>AI Usage Remaining:</strong> {aiUsageRemaining}</Typography>
              <Typography variant="body1">
                <strong>Friends:</strong> {friends && friends.length > 0 ? friends.join(', ') : 'No friends yet'}
              </Typography>
            </Box>
          </Paper>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: 'background.default',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Match History ({matchHistory ? matchHistory.length : 0})
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {matchHistory && matchHistory.length > 0 ? (
              <List>
                {matchHistory.map((match, index) => (
                  <ListItem key={index} divider sx={{ py: 1 }}>
                    <ListItemText
                      primary={`Match ${index + 1}`}
                      secondary={
                        <>
                          <Typography variant="caption" component="span">
                            Match ID: {match._id}
                          </Typography>
                          <br />
                          <Typography variant="caption" component="span">
                            Status: {match.status}
                          </Typography>
                          <br />
                          <Typography variant="caption" component="span">
                            Deck: {match.deck && match.deck.length > 0 ? match.deck.join(', ') : 'N/A'}
                          </Typography>
                          <br />
                          <Typography variant="caption" component="span">
                            Created: {new Date(match.createdAt).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body1">No match history available.</Typography>
            )}
          </Paper>
        </Box>
      </Container>
    </PageContainer>
  );
};

export default ProfilePage;