import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import ChangeProfilePic from './ChangeProfilePic';
import ChangePassword from './ChangePassword';
import ChangeInformation from './ChangeInformation';
import userAuthAxios from '../../../hooks/useAuthAxios';

const Settings = () => {


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Box>
          <ChangeProfilePic/>
        <ChangeInformation />
      </Box>

    </Box>
  );
};

export default Settings;
