import React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link, IconButton, Input, InputAdornment } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import useRegistration from '../../hooks/useRegistration'; // Adjust the path as necessary
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function CompanyRegistration() {
  const {
    name,
    email,
    address,
    message,
    error,
    companyCode,
    isSubmitted,
    setName,
    setEmail,
    setAddress,
    handleSubmit
  } = useRegistration();

  const handleCopy = () => {
    navigator.clipboard.writeText(companyCode);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%', // Ensure the Box takes full width of the Container
            display: isSubmitted ? 'none' : 'flex', // Hide if submitted
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Register Company
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              name="name"
              required
              fullWidth
              id="name"
              label="Company Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <TextField
              required
              fullWidth
              id="email"
              label="Company Email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mt: 3 }}
            />
            <TextField
              required
              fullWidth
              id="address"
              label="Company Address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              multiline
              rows={4}
              sx={{ mt: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Register
            </Button>
            {message && <Typography variant="body2" color="success.main">{message}</Typography>}
            {error && <Typography variant="body2" color="error.main">{error}</Typography>}
          </Box>
        </Box>

        {/* Display only after successful registration */}
        {isSubmitted && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              paddingTop: '100px',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Register Company
            </Typography>
            <Typography variant="body1" color="success.main" sx={{ mt: 3 }}>
              {message}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mt: 2,
                width: '100%',
                maxWidth: 400,
              }}
            >
              <Input
                fullWidth
                value={companyCode}
                readOnly
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleCopy}>
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </Box>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8, mb: 4 }}>
          {'Copyright © '}
          <Link component={RouterLink} to="/">
                  {"SyncStock"}
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Container>
    </ThemeProvider>
  );
}
