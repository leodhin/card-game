import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import errorImage from '../assets/error.png';
import { Stack, Box } from '@mui/material';

const PageContainer = ({ isLoading, loadingMessage, error, isBackloading, backloadingMessage, children, containerStyle }) => {
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

  return (
    <Stack height="100%" style={containerStyle}>
      {children}
      {isBackloading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          bgcolor="rgba(66, 66, 66, 0.7)"
          zIndex={1}
        >
          <CircularProgress size={40} />
          <Box mt={2}>
            {backloadingMessage || 'Updating...'}
          </Box>
        </Box>
      )}
    </Stack>
  );
};

export default PageContainer;