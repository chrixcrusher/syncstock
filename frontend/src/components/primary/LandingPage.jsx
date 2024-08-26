import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const LandingPage = () => {
  const navigate = useNavigate(); // Initialize navigate

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gridTemplateRows: 'auto 1fr',
        height: '100vh',
        backgroundColor: 'white',
        padding: '20px',
      }}
    >
      {/* Upper Left - Logo and App Name */}
      <Box
        sx={{
          gridColumn: '1 / 2',
          gridRow: '1 / 2',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img src="./public/syncstock.png" alt="SyncStock Logo" height={50} width={50} />
        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold', marginLeft: '10px' }}>
          SyncStock
        </Typography>
      </Box>

      {/* Upper Right - Navigation Buttons */}
      <Box
        sx={{
          gridColumn: '2 / 3',
          gridRow: '1 / 2',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Button color="primary" onClick={() => navigate('/register-company')}>
          Register Company
        </Button>
        <Button color="primary" onClick={() => navigate('/sign-up')}>
          Register User
        </Button>
        <Button color="primary" onClick={() => navigate('/sign-in')}>
          Sign In
        </Button>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          gridColumn: '1 / 2',
          gridRow: '2 / 3',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: '10%',
        }}
      >
        <Typography variant="h1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          REINVENT
        </Typography>
        <Typography variant="h1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          YOUR
        </Typography>
        <Typography variant="h1" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          INVENTORY SYSTEM
        </Typography>
      </Box>

      {/* Right Side - Image with Fading Edges */}
      <Box
        sx={{
          gridColumn: '2 / 3',
          gridRow: '2 / 3',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        <Box
          component="img"
          src="./public/inventory.jpg"
          alt="Inventory"
          sx={{
            width: '50%',
            height: 'auto',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(transparent 80%, white)',
              borderRadius: '10px',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default LandingPage;
