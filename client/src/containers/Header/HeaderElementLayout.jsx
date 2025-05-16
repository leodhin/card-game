import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
// import { SideBar } from '../SideBar'; // Commented out the SideBar import

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  height: '100%',
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  width: '100%', // Ensure AppBar takes full width when closed
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const HeaderElementLayout = (props) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    alert('You have been logged out.');
    navigate('/login'); // Redirect to login page
    handleMenuClose();
  };

  const handleNavigateProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const isMenuOpen = Boolean(anchorEl);

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleNavigateProfile}>Profile</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  return (
    <>
      {/* SIDEBAR */}
      {/* <SideBar open={open} toggleDrawer={toggleDrawer} /> */}

      {/* HEADER */}
      <AppBar position="absolute" open={open}>
        <Toolbar
          sx={{
            pr: '24px',
            backgroundColor: '#121212',
          }}
        >

          {/*
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={toggleDrawer}
            sx={{
              marginRight: '20px', // Adjusted margin
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          */}
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {props.title}
          </Typography>

          {/* Navigation Links */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                marginRight: '20px',
              }}
            >
              <Typography variant="button" color="inherit">
                Home
              </Typography>
            </Link>
            <Link to="/deck-generator" style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}>
              <Typography variant="button" color="inherit">
                Deck Generator
              </Typography>
            </Link>
            <Link to="/card-generator" style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}>
              <Typography variant="button" color="inherit">
                Card Generator
              </Typography>
            </Link>
            <Link to="/card-list" style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}>
              <Typography variant="button" color="inherit">
                Cards
              </Typography>
            </Link>
            <Link to="/decks" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Typography variant="button" color="inherit">
                Decks
              </Typography>
            </Link>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <IconButton size="large" aria-label="show notifications" color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>

        <CssBaseline />
        {/* MAIN CONTENT */}
        <Box
          component="main"
          sx={{
            background: "#1E1E1E",
            flexGrow: 1,
            overflowX: 'hidden', // Prevent horizontal scrolling
          }}
        >
          <Container maxWidth="lg" sx={{ height: '100%', pt: 4, pb: 4 }}>
            {props.children}
          </Container>
        </Box>
      </AppBar>
      {renderMenu}
    </>
  );
};

export default HeaderElementLayout;