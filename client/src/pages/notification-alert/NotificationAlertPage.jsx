import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Collapse
} from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import PageContainer from '../../containers/PageContainer';
import { getNotifications } from '../../services/user-service';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotifications();
        setNotifications(response);
      } catch (err) {
        setError(err.response?.data?.error || 'Error fetching notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <PageContainer isLoading={loading} error={error}>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          {notifications.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center' }}>
              No notifications available.
            </Typography>
          ) : (
            <List>
              <TransitionGroup>
                {notifications.map((notif) => (
                  <Collapse key={notif._id}>
                    <ListItem divider sx={{ px: 2, py: 1 }}>
                      <Paper
                        elevation={3}
                        sx={{
                          width: '100%',
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: 'background.paper',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {notif.message}
                            </Typography>
                          }
                          secondary={new Date(notif.createdAt).toLocaleString()}
                        />
                      </Paper>
                    </ListItem>
                  </Collapse>
                ))}
              </TransitionGroup>
            </List>
          )}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default NotificationsPage;