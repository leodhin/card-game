import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import MuiAppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';  // Import Badge for notifications
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';

import useSessionStore from '../../stores/sessionStore';
import logoIMG from '../../assets/logo.png';

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
  width: '100%',
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
  const { user, logout, hasPendingNotifications } = useSessionStore();

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
    logout();
    navigate('/login');
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
      {!props.hideHeader && (
        <>
          {/* HEADER */}
          <AppBar position="absolute" open={open}>
            <Toolbar sx={{ pr: '24px', backgroundColor: '#121212' }}>

              <Typography component="h1" variant="h6" color="inherit" noWrap width="150px" style={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  component="img"
                  src={logoIMG}
                  alt="Logo"
                  sx={{ width: '80%', objectFit: 'contain' }}
                />
              </Typography>

              {/* Navigation Links */}
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}>
                  <Typography variant="button" color="inherit">
                    Home
                  </Typography>
                </Link>
                <Link to="/card-list" style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}>
                  <Typography variant="button" color="inherit">
                    Cards
                  </Typography>
                </Link>
                <Link to="/decks" style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}>
                  <Typography variant="button" color="inherit">
                    Decks
                  </Typography>
                </Link>
                <Link to="/friends" style={{ textDecoration: 'none', color: 'inherit', marginRight: '20px' }}>
                  <Typography variant="button" color="inherit">
                    Friends
                  </Typography>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      marginRight: '20px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="button" color="inherit">
                      Admin Dashboard
                    </Typography>
                  </Link>
                )}
              </Box>


              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                <IconButton
                  size="large"
                  aria-label="show notifications"
                  color="inherit"
                  onClick={() => navigate('/notifications')}
                >
                  {hasPendingNotifications ? (
                    <Badge variant="dot" color="error">
                      <NotificationsIcon />
                    </Badge>
                  ) : (
                    <NotificationsIcon />
                  )}
                </IconButton>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-haspopup="true"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  {user?.profilePicture ? (
                    <Box
                      component="img"
                      src={`${user.profilePicture}?t=${new Date().getTime()}`}
                      alt="Profile"
                      sx={{ width: 32, height: 32, borderRadius: '50%' }}
                    />
                  ) : (
                    <AccountCircle />
                  )}
                </IconButton>
              </Box>
            </Toolbar>
            <CssBaseline />
            {/* MAIN CONTENT when header is NOT hidden */}
            <Box
              component="main"
              sx={{
                background: "#1E1E1E",
                flexGrow: 1,
                overflowX: 'hidden',
              }}
            >
              {props.children}
            </Box>
          </AppBar>
          {renderMenu}
        </>
      )}

      <Box
        component="main"
        sx={{
          background: "#1E1E1E",
          flexGrow: 1,
        }}
      >
        {props.children}
      </Box>
    </>
  );
};

export default HeaderElementLayout;