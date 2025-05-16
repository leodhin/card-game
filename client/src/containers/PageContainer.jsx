import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import errorImage from '../assets/error.png'; // Adjust the path to your error.png file

const PageContainer = ({ isLoading, loadingMessage, error, children }) => {
  if (error) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%">
        <img src={errorImage} alt="Error" style={{ width: '500px', marginBottom: '20px' }} />
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" color="primary" flexDirection="column" gap={2}>
        <CircularProgress />
        <Box ml={2}>
          {loadingMessage || 'Loading...'}
        </Box>
      </Box>
    );
  }


  return <>{children}</>;
};

export default PageContainer;