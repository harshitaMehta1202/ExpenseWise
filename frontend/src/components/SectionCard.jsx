import { Box, Paper, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

const SectionCard = ({ 
  title, 
  subtitle, 
  children, 
  action,
  sx = {},
  ...props 
}) => {
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        transition: 'all 0.3s ease',
        ...sx,
      }}
      {...props}
    >
      {(title || action) && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            {title && (
              <Typography 
                variant="h6" 
                fontWeight={600}
                sx={{ color: 'text.primary' }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && (
            <Box sx={{ flexShrink: 0 }}>
              {action}
            </Box>
          )}
        </Box>
      )}
      {children}
    </Paper>
  );
};

export default SectionCard;
