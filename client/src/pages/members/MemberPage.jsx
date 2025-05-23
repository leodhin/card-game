import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageContainer from '../../containers/PageContainer';
import { Container, Typography, Box, List, ListItem, ListItemText, Paper } from '@mui/material';
import { getProfileById } from '../../services/user-service';

const MemberPage = () => {
  const { memberId } = useParams();
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getProfileById(memberId);
        // Expecting a response containing:
        // {
        //   matchHistory: [...],
        //   user: { _id, email, nickname, role, ... },
        //   aiUsageRemaining: number,
        //   email: string
        // }
        setProfile(response.data);
      } catch (err) {
        setError(err.message || 'Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      fetchUser();
    }
  }, [memberId]);

  return (
    <PageContainer isLoading={loading} error={error}>
      <Container maxWidth="md">
        <Box sx={{ my: 6, px: 2 }}>
          {profile && profile.user ? (
            <>
              <Paper
                elevation={4}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                <Typography variant="h4" component="h1" gutterBottom>
                  Member Page: {profile.user.nickname}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Email: {profile.user.email}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  Role: {profile.user.role}
                </Typography>
                <Typography variant="body1">
                  AI Usage Remaining: {profile.aiUsageRemaining}
                </Typography>
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
                  Match History ({profile.matchHistory ? profile.matchHistory.length : 0})
                </Typography>
                {profile.matchHistory && profile.matchHistory.length > 0 ? (
                  <List>
                    {profile.matchHistory.map((match, index) => (
                      <ListItem key={index} divider sx={{ py: 1 }}>
                        <ListItemText
                          primary={`Match ${index + 1}`}
                          secondary={JSON.stringify(match, null, 2)}
                          primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body1">
                    No match history available.
                  </Typography>
                )}
              </Paper>
            </>
          ) : (
            <Typography variant="h5" align="center">
              User data not available.
            </Typography>
          )}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default MemberPage;