import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import MenuIcon from '@mui/icons-material/Menu';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BarChartIcon from '@mui/icons-material/BarChart';
import BookIcon from '@mui/icons-material/Book';
import LogoutIcon from '@mui/icons-material/Logout'; // Add LogoutIcon import
import SettingsIcon from '@mui/icons-material/Settings'; // Add SettingsIcon import
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider'; // Import the Auth context
import useLogout from '../../hooks/useLogout'; 
import { Outlet } from 'react-router-dom';
import ProfilePicture from '../generallyshared/ProfilePicture';
import useFetchUserDetails from '../../hooks/useFetchUserDetails';



const drawerWidth = 240;

// Styled components
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...theme.mixins.toolbar,
}));

const defaultTheme = createTheme();

const StyledListItem = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: 'rgba(0, 0, 0, 0.08)', // Adjust hover color
  },
}));

// Create a styled container for ListItems
const ListItemContainer = styled('div')(({ theme }) => ({
  '& .MuiListItem-root': {
    '&:hover': {
      cursor: 'pointer',
      backgroundColor: 'rgba(0, 0, 0, 0.08)', // Adjust as needed
    },
  },
}));

export default function Dashboard() {

  const { userDetails, setUserDetails, error } = useFetchUserDetails();
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => setOpen(!open);

  const navigate = useNavigate();
  const handleLogout = useLogout(); // Get the logout function from the custom hook

  const { isAuthenticated } = useAuth(); // Get authentication state from context

  // Redirect to sign-in page if not authenticated
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (!isAuthenticated && !token) {
      navigate('/sign-in');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Or a loading spinner, or some placeholder content
  }

  return (
    <ThemeProvider theme={defaultTheme} >
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: '24px',
              alignItems: 'center',
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Dashboard
            </Typography>
            {/* Add the ProfilePicture component aligned to the right */}
            <Typography 
              component="h2"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ mr: 2 }}>{userDetails.username}</Typography>
            <ProfilePicture />
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={toggleDrawer}>
              <h6 style={{ color: 'blue', padding: 0, margin: 0 }}>SyncStock</h6>
            </IconButton>
          </DrawerHeader>
          <Divider />
          <ListItemContainer>
            <List component="nav">
              <NavLink to="/dashboard/inventory" style={{ textDecoration: 'none' }}>
                <ListItem button:true="true">
                  <ListItemIcon>
                    <InventoryIcon sx={{ color: location.pathname === '/dashboard/inventory' ? 'blue' : 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Inventory" sx={{ color: location.pathname === '/dashboard/inventory' ? 'blue' : '#808080' }} />
                </ListItem>
              </NavLink>
              <NavLink to="/dashboard/current-inventory" style={{ textDecoration: 'none' }}>
                <ListItem button:true="true">
                  <ListItemIcon>
                    <BookIcon sx={{ color: location.pathname === '/dashboard/current-inventory' ? 'blue' : 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Current Inventory" sx={{ color: location.pathname === '/dashboard/current-inventory' ? 'blue' : '#808080' }} />
                </ListItem>
              </NavLink>
              <NavLink to="/dashboard/adjustments" style={{ textDecoration: 'none' }}>
                <ListItem button:true="true">
                  <ListItemIcon>
                    <TransferWithinAStationIcon sx={{ color: location.pathname === '/dashboard/adjustments' ? 'blue' : 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Adjustments" sx={{ color: location.pathname === '/dashboard/adjustments' ? 'blue' : '#808080' }} />
                </ListItem>
              </NavLink>
              <NavLink to="/dashboard/transfer" style={{ textDecoration: 'none' }}>
                <ListItem button:true="true">
                  <ListItemIcon>
                    <LocalShippingIcon sx={{ color: location.pathname === '/dashboard/transfer' ? 'blue' : 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Transfer" sx={{ color: location.pathname === '/dashboard/transfer' ? 'blue' : '#808080' }} />
                </ListItem>
              </NavLink>
              <NavLink to="/dashboard/analytics" style={{ textDecoration: 'none' }}>
                <ListItem button:true="true">
                  <ListItemIcon>
                    <BarChartIcon sx={{ color: location.pathname === '/dashboard/analytics' ? 'blue' : 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Analytics" sx={{ color: location.pathname === '/dashboard/analytics' ? 'blue' : '#808080' }} />
                </ListItem>
              </NavLink>
              <NavLink to="/dashboard/category" style={{ textDecoration: 'none' }}>
                <ListItem button:true="true">
                  <ListItemIcon>
                    <CategoryIcon sx={{ color: location.pathname === '/dashboard/category' ? 'blue' : 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Category" sx={{ color: location.pathname === '/dashboard/category' ? 'blue' : '#808080' }} />
                </ListItem>
              </NavLink>
              <NavLink to="/dashboard/location" style={{ textDecoration: 'none' }}>
                <ListItem button:true="true">
                  <ListItemIcon>
                    <LocationOnIcon sx={{ color: location.pathname === '/dashboard/location' ? 'blue' : 'inherit' }} />
                  </ListItemIcon>
                  <ListItemText primary="Location" sx={{ color: location.pathname === '/dashboard/location' ? 'blue' : '#808080' }} />
                </ListItem>
              </NavLink>
              <Divider sx={{ my: 2 }} /> {/* Divider separating main navigation from settings and logout */}

              <List component="nav">
                <NavLink to="/dashboard/settings" style={{ textDecoration: 'none' }}>
                  <ListItem button:true="true">
                    <ListItemIcon>
                      <SettingsIcon sx={{ color: location.pathname === '/dashboard/settings' ? 'blue' : '#808080' }} />
                    </ListItemIcon>
                    <ListItemText primary="Settings" sx={{ color: location.pathname === '/dashboard/settings' ? 'blue' : '#808080' }} />
                  </ListItem>
                </NavLink>
                <StyledListItem button:true="true" onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon sx={{ color: location.pathname === '/logout' ? 'blue' : '#808080' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Logout"
                    sx={{ color: location.pathname === '/logout' ? 'blue' : '#808080' }}
                  />
                </StyledListItem>
              </List>
            </List>
          </ListItemContainer>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Outlet /> {/* Render nested routes here */}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
