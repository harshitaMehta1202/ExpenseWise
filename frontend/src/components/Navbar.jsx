import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alertsAPI } from '../services/api';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Badge, Menu, MenuItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

const Navbar = () => {
  const { token, logout, name } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [alertLoading, setAlertLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAlertClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (alerts.length === 0) {
      fetchAlerts();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchAlerts = async () => {
    if (!token) return;
    try {
      setAlertLoading(true);
      const response = await alertsAPI.getAlerts();
      setAlerts(response.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setAlertLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'INFO': return <InfoIcon color="info" />;
      case 'WARNING': return <WarningIcon color="warning" />;
      case 'DANGER': return <ErrorIcon color="error" />;
      default: return <InfoIcon />;
    }
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            ExpenseWise
          </Link>
        </Typography>
        {token ? (
          <Box>
            <Button color="inherit" component={Link} to="/dashboard">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/add-expense">
              Add Expense
            </Button>
            <Button color="inherit" component={Link} to="/view-expenses">
              View Expenses
            </Button>
            <Button color="inherit" component={Link} to="/budget">
              Budget
            </Button>
            <Button color="inherit" component={Link} to="/recurring">
              Recurring
            </Button>
            <IconButton 
              color="inherit" 
              onClick={handleAlertClick}
              aria-controls="alert-menu"
              aria-haspopup="true"
            >
              <Badge badgeContent={alerts.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              id="alert-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                style: {
                  maxHeight: 400,
                  width: '360px',
                },
              }}
            >
              <Typography variant="h6" sx={{ px: 2, py: 1, fontWeight: 'bold' }}>
                Notifications
              </Typography>
              <Divider />
              {alertLoading ? (
                <MenuItem disabled>
                  <ListItemText primary="Loading..." />
                </MenuItem>
              ) : alerts.length > 0 ? (
                alerts.map((alert, index) => (
                  <MenuItem key={index} onClick={handleClose}>
                    <ListItemIcon>
                      {getAlertIcon(alert.type)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={alert.message} 
                      secondary={alert.category}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>
                  <ListItemText 
                    primary="No new notifications" 
                    secondary="All budgets are under control 👍"
                  />
                </MenuItem>
              )}
            </Menu>
            <Button color="inherit" onClick={handleLogout}>
              Logout ({name})
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
