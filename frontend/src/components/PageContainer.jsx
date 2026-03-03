import { Box } from '@mui/material';

const PageContainer = ({ children, sx = {} }) => {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: '1600px',
        mx: 'auto',
        animation: 'fadeIn 0.4s ease-out',
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer;
