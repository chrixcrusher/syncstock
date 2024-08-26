import React, { useState } from 'react';
import {
  Paper, Typography, Button, Box,
  Dialog, DialogActions, DialogContent, DialogTitle, TextField
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ChangePassword from './ChangePassword';
import useFetchUserDetails from '../../../hooks/useFetchUserDetails';
import userAuthAxios from '../../../hooks/useAuthAxios';

const ChangeInformation = () => {
  const { userDetails, setUserDetails, error } = useFetchUserDetails();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const api = userAuthAxios();

  const handleSave = () => {
    api.put('user-details/', userDetails)
      .then(response => {
        setUserDetails(response.data);
        setDialogOpen(false);
        setSnackbarMessage('Profile updated successfully.');
        setSnackbarOpen(true);
        // Add a 2-second delay before refreshing the page
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch(error => console.error('Error saving profile changes:', error));
  };

  if (error) {
    return <Typography color="error">Error fetching user details.</Typography>;
  }

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <Paper sx={{ p: 3, width: '100%', maxWidth: 500 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>User Information</Typography>
          <Typography variant="body1"><strong>First Name:</strong> {userDetails.first_name}</Typography>
          <Typography variant="body1"><strong>Last Name:</strong> {userDetails.last_name}</Typography>
          <Typography variant="body1"><strong>Username:</strong> {userDetails.username}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {userDetails.email}</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>      
            <Button
              sx={{ mt: 2 }}
              variant="contained"
              color="primary"
              onClick={() => setDialogOpen(true)}
            >
              Change Information
            </Button>
            <Button 
              onClick={() => setPasswordDialogOpen(true)}
              variant="contained"
              sx={{ mt: 2 }}
              color="primary"
            >
              Change Password
            </Button>
            <ChangePassword
              open={passwordDialogOpen}
              onClose={() => setPasswordDialogOpen(false)}
            />
          </Box>
        </Paper>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogContent>
            <TextField
              label="First Name"
              fullWidth
              margin="dense"
              value={userDetails.first_name}
              onChange={(e) => setUserDetails({ ...userDetails, first_name: e.target.value })}
            />
            <TextField
              label="Last Name"
              fullWidth
              margin="dense"
              value={userDetails.last_name}
              onChange={(e) => setUserDetails({ ...userDetails, last_name: e.target.value })}
            />
            <TextField
              label="Username"
              fullWidth
              margin="dense"
              value={userDetails.username}
              onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              margin="dense"
              value={userDetails.email}
              onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="secondary">Cancel</Button>
            <Button onClick={handleSave} color="primary">Save Changes</Button>
          </DialogActions>
        </Dialog>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ChangeInformation;
