// src/pages/PageNotFound.jsx
import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const ErrorImage = styled('img')({
  width: '300px',
  height: 'auto',
  display: 'block',
  margin: '0 auto',
});

const PageNotFound = () => {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        p: 4,
      }}
    >
      <ErrorImage src="/Lost.png" alt="404 Error" />
      <Typography variant="h2" component="h1" sx={{ mt: 4, mb: 2 }}>
        Oops! Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Sorry, the page you’re looking for doesn’t exist. It might have been moved or deleted.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        color="primary"
        sx={{ borderRadius: '20px', padding: '10px 20px' }}
      >
        Go to Home
      </Button>
    </Container>
  );
};

export default PageNotFound;
