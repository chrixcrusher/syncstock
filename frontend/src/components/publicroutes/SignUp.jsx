import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import { Link as RouterLink, useNavigate } from 'react-router-dom'; // Import useNavigate

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function SignUp() {
  const [formData, setFormData] = React.useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    company_code: ''
  });
  const [errors, setErrors] = React.useState({});
  const [successMessage, setSuccessMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false); // Added for loading state

  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.company_code) newErrors.company_code = 'Company code is required';
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setSuccessMessage('');
    setIsLoading(true); // Set loading state

    try {
      const response = await axios.post('http://localhost:8000/api/register/', formData);
      setSuccessMessage('Sign up successfully! Please sign in.'); // Set success message

      // Show the success message for a short period and then redirect
      setTimeout(() => {
        navigate('/sign-in'); // Redirect after delay
      }, 3000); // 3000ms = 3 seconds

      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password: '',
        company_code: ''
      });
    } catch (error) {
      if (error.response && error.response.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ non_field_errors: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsLoading(false); // Reset loading state
    }
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
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          {successMessage && (
            <Typography color="success.main">{successMessage}</Typography>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="first_name"
              label="First Name"
              name="first_name"
              autoComplete="given-name"
              autoFocus
              value={formData.first_name}
              onChange={handleChange}
              error={Boolean(errors.first_name)}
              helperText={errors.first_name}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="last_name"
              label="Last Name"
              name="last_name"
              autoComplete="family-name"
              value={formData.last_name}
              onChange={handleChange}
              error={Boolean(errors.last_name)}
              helperText={errors.last_name}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              error={Boolean(errors.username)}
              helperText={errors.username}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(errors.password)}
              helperText={errors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="company_code"
              label="Company Code"
              name="company_code"
              autoComplete="company-code"
              value={formData.company_code}
              onChange={handleChange}
              error={Boolean(errors.company_code)}
              helperText={errors.company_code}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading} // Disable button while loading
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'} {/* Show loading text */}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link component={RouterLink} to="/sign-in" variant="body2">
                  {"Already have an account? Sign in"}
                </Link>
              </Grid>
              <Grid item>
                <Link href="#" variant="body2">
                  {"Forgot password?"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        {errors.non_field_errors && (
          <Typography color="error.main" mt={2} justifyContent="center">
            {errors.non_field_errors}
          </Typography>
        )}
        <Copyright sx={{ mt: 8, mb: 4 }} /> {/* Keep the Copyright section */}
      </Container>
    </ThemeProvider>
  );
}
