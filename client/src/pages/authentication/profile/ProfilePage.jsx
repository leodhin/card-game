import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, Paper, Divider, Button } from '@mui/material';
import PageContainer from '../../../containers/PageContainer';
import { getProfile, updateProfilePicture } from '../../../services/user-service';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // To store selected file on update
  const fileInputRef = useRef(null);

  // Fetch profile on mount
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

  const { matchHistory, user: { aiUsageRemaining, friends, nickname, _id, email, profilePicture, role } = {} } = profile;

  // Handler to trigger file input click
  const handleUpdatePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection and update profile picture
  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const result = await updateProfilePicture(reader.result);
          setProfile(prev => ({
            ...prev,
            user: {
              ...prev.user,
              profilePicture: result.profilePicture
            }
          }));
        };
      } catch (err) {
        console.error('Error updating profile picture:', err);
      }
    }
  };

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
              src={`${profilePicture}?t=${new Date().getTime()}`}
              alt="Profile"
              className="profile-picture"
              onClick={handleUpdatePictureClick}
              style={{
                borderRadius: '50%',
                marginBottom: '16px',
                cursor: 'pointer', // indicates clickable element
              }}
            />
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Typography variant="h4" component="h1" gutterBottom>
              {nickname || 'Unknown'}
            </Typography>
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant="body1">
                <strong>Email:</strong> {email}
              </Typography>
              <Typography variant="body1">
                <strong>Role:</strong> {role}
              </Typography>
              <Typography variant="body1">
                <strong>AI Usage Remaining:</strong> {aiUsageRemaining}
              </Typography>
              <Typography variant="body1">
                <strong>Friends:</strong>{' '}
                {friends && friends.length > 0 ? friends.join(', ') : 'No friends yet'}
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