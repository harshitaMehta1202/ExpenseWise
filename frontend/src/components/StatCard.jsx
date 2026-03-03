import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'primary', 
  trend = null,
  subtitle = '',
  sx = {} 
}) => {
  const colorMap = {
    primary: {
      bg: '#6366f1',
      light: '#818cf8',
      bgLight: alpha('#6366f1', 0.1),
    },
    secondary: {
      bg: '#10b981',
      light: '#34d399',
      bgLight: alpha('#10b981', 0.1),
    },
    error: {
      bg: '#ef4444',
      light: '#f87171',
      bgLight: alpha('#ef4444', 0.1),
    },
    warning: {
      bg: '#f59e0b',
      light: '#fbbf24',
      bgLight: alpha('#f59e0b', 0.1),
    },
    info: {
      bg: '#3b82f6',
      light: '#60a5fa',
      bgLight: alpha('#3b82f6', 0.1),
    },
  };

  const colors = colorMap[color] || colorMap.primary;

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 20px 25px -5px ${alpha(colors.bg, 0.2)}, 0 8px 10px -6px ${alpha(colors.bg, 0.1)}`,
        },
        ...sx,
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: colors.bgLight,
          opacity: 0.5,
        }}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.light} 100%)`,
            boxShadow: `0 4px 14px ${alpha(colors.bg, 0.4)}`,
          }}
        >
          {Icon && <Icon sx={{ color: '#fff', fontSize: 24 }} />}
        </Box>
        
        {trend !== null && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: trend >= 0 ? 'success.main' : 'error.main',
              bgcolor: trend >= 0 ? alpha('#10b981', 0.1) : alpha('#ef4444', 0.1),
              px: 1,
              py: 0.5,
              borderRadius: 2,
            }}
          >
            {trend >= 0 ? (
              <TrendingUpIcon sx={{ fontSize: 16 }} />
            ) : (
              <TrendingDownIcon sx={{ fontSize: 16 }} />
            )}
            <Typography variant="body2" fontWeight={600}>
              {Math.abs(trend)}%
            </Typography>
          </Box>
        )}
      </Box>

      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ mb: 0.5, fontWeight: 500 }}
      >
        {title}
      </Typography>
      
      <Typography 
        variant="h4" 
        fontWeight={700}
        sx={{ 
          background: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.light} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {value}
      </Typography>
      
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

export default StatCard;
