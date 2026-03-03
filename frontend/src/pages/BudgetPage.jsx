import { useState, useEffect } from 'react';
import { budgetAPI } from '../services/api';
import { Grid, Typography, Box, TextField, Button, MenuItem, 
         CircularProgress, Table, TableBody, TableCell, TableContainer, 
         TableHead, TableRow, IconButton, LinearProgress, Paper } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import SectionCard from '../components/SectionCard';

// Predefined categories
const CATEGORIES = [
  'Food',
  'Travel',
  'Bills',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Groceries',
  'Transport',
  'Other'
];

const BudgetPage = () => {
  const [loading, setLoading] = useState(false);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [category, setCategory] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [month, setMonth] = useState('');
  
  // Data state
  const [budgets, setBudgets] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');

  // Get current month in YYYY-MM format
  useEffect(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMonth(currentMonth);
    setSelectedMonth(currentMonth);
  }, []);

  // Fetch budgets when selectedMonth changes
  useEffect(() => {
    if (selectedMonth) {
      fetchBudgets();
    }
  }, [selectedMonth]);

  const fetchBudgets = async () => {
    try {
      setBudgetLoading(true);
      const response = await budgetAPI.getBudgetsByMonth(selectedMonth);
      setBudgets(response.data || []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setBudgets([]);
    } finally {
      setBudgetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!category || !monthlyLimit || !month) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(monthlyLimit) <= 0) {
      setError('Monthly limit must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      await budgetAPI.setBudget({
        category,
        monthlyLimit: parseFloat(monthlyLimit),
        month
      });
      setSuccess('Budget saved successfully!');
      setCategory('');
      setMonthlyLimit('');
      fetchBudgets();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      await budgetAPI.deleteBudget(budgetId);
      fetchBudgets();
    } catch (err) {
      setError('Failed to delete budget');
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 80) return '#10b981'; // green
    if (percentage <= 100) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Monthly Budget
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set and track your spending limits by category
        </Typography>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: (theme) => alpha(theme.palette.error.main, 0.1) }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      
      {success && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: (theme) => alpha(theme.palette.success.main, 0.1) }}>
          <Typography color="success.main">{success}</Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Budget Form */}
        <Grid item xs={12} lg={5}>
          <SectionCard title="Set New Budget" subtitle="Create a monthly spending limit">
            <form onSubmit={handleSubmit}>
              <TextField
                select
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                margin="normal"
                required
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Monthly Limit (₹)"
                type="number"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                margin="normal"
                required
                inputProps={{ min: "0", step: "0.01" }}
                placeholder="Enter amount in INR"
              />

              <TextField
                fullWidth
                label="Month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: "2020-01",
                  max: "2030-12"
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ mt: 3, py: 1.5 }}
                startIcon={<AddIcon />}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Budget'}
              </Button>
            </form>
          </SectionCard>
        </Grid>

        {/* Budget List */}
        <Grid item xs={12} lg={7}>
          <SectionCard 
            title="Budget Status" 
            subtitle={`For ${selectedMonth || 'this month'}`}
            action={
              <TextField
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: "2020-01",
                  max: "2030-12"
                }}
                sx={{ width: 150 }}
              />
            }
          >
            {budgetLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : budgets.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Budget</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Spent</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Progress</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {budgets.map((budget) => {
                      const percentage = budget.percentageUsed || 0;
                      const progressColor = getProgressColor(percentage);
                      
                      return (
                        <TableRow key={budget.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {budget.category}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatCurrency(budget.monthlyLimit || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              color={budget.exceeded ? 'error.main' : 'text.primary'}
                            >
                              {formatCurrency(budget.totalSpent || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: 180 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(percentage, 100)}
                                sx={{
                                  flexGrow: 1,
                                  height: 10,
                                  borderRadius: 5,
                                  bgcolor: '#e2e8f0',
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: progressColor,
                                    borderRadius: 5,
                                  }
                                }}
                              />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  minWidth: 45, 
                                  fontWeight: 600,
                                  color: progressColor 
                                }}
                              >
                                {percentage.toFixed(0)}%
                              </Typography>
                            </Box>
                            {budget.exceeded && (
                              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                                ⚠️ Exceeded by ₹{(budget.totalSpent - budget.monthlyLimit).toFixed(2)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteBudget(budget.id)}
                              size="small"
                              sx={{
                                '&:hover': {
                                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No budgets set
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a budget using the form on the left
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BudgetPage;
