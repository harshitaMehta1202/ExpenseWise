import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import MenuIcon from '@mui/icons-material/Menu';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, name } = useAuth();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={handleSidebarToggle}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          minHeight: '100vh',
        }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <AppBar
            position="sticky"
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleSidebarToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={700}>
                {name}
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Routed Pages Render Here */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            maxWidth: '1600px',
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;