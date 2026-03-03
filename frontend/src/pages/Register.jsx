import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { 
  TextField, Button, Typography, Box, Paper, InputAdornment, IconButton, Divider 
} from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon, Person as PersonIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authAPI.register(formData);
      setSuccess('Registration successful! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
          opacity: 0.1,
          zIndex: 0,
        },
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: (theme) => alpha(theme.palette.secondary.main, 0.08),
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-30%',
          right: '-20%',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: (theme) => alpha(theme.palette.secondary.light, 0.05),
          zIndex: 0,
        }}
      />

      <Paper
        elevation={0}
        sx={{
          p: 5,
          width: '100%',
          maxWidth: 440,
          borderRadius: 4,
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 25px 50px -12px rgba(16, 185, 129, 0.15)',
        }}
      >
        {/* Logo/Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
              mb: 2,
            }}
          >
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
              E
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start tracking your expenses today
          </Typography>
        </Box>

        {error && (
          <Paper
            sx={{ p: 2, mb: 3, bgcolor: (theme) => alpha(theme.palette.error.main, 0.1) }}
          >
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Paper>
        )}

        {success && (
          <Paper
            sx={{ p: 2, mb: 3, bgcolor: (theme) => alpha(theme.palette.success.main, 0.1) }}
          >
            <Typography color="success.main" variant="body2">
              {success}
            </Typography>
          </Paper>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            margin="normal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            required
            margin="normal"
            helperText="Password must be at least 6 characters"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="secondary"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Typography variant="body2" align="center" color="text.secondary">
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#10b981',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Sign In
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Register;
