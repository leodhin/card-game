import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
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
          <Typography variant="h4" gutterBottom>
            Notifications
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : notifications.length === 0 ? (
            <Typography variant="body1">No notifications available.</Typography>
          ) : (
            <List>
              {notifications?.map((notif) => (
                <ListItem key={notif._id} divider>
                  <ListItemText
                    primary={notif.message}
                    secondary={new Date(notif.createdAt).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Container>
    </PageContainer>
  );
};

export default NotificationsPage;