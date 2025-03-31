import React from 'react';
import { CircularProgress, Alert, Box } from '@mui/material';

const withLoadingErrorContent = (WrappedComponent) => {
  return (props) => {
    const { isLoading, error, ...rest } = props;

    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress color="primary" />
        </Box>
      );
    }

    if (error) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Alert severity="error">{error.message || 'An error occurred'}</Alert>
        </Box>
      );
    }

    return <WrappedComponent {...rest} />;
  };
};

export default withLoadingErrorContent;