import { useState, useEffect, useCallback } from 'react';
import { expenseAPI } from '../services/api';
import { 
  Grid, Typography, Box, Button, Table, 
  TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Chip, FormControl, InputLabel, Select, 
  MenuItem, TextField, IconButton, Paper
} from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import SectionCard from '../components/SectionCard';

const categories = ['All', 'Food', 'Travel', 'Clothes', 'Entertainment', 'Bills', 'Others'];

const ViewExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  
  // Filter info from backend
  const [filterInfo, setFilterInfo] = useState({ count: 0, totalAmount: 0, message: '' });

  // Fetch expenses with filters
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {
        category: selectedCategory,
        startDate: startDate || null,
        endDate: endDate || null,
        minAmount: minAmount ? parseFloat(minAmount) : null,
        maxAmount: maxAmount ? parseFloat(maxAmount) : null,
      };
      
      const response = await expenseAPI.getExpensesWithFilters(filters);
      
      setExpenses(response.data.expenses || []);
      setFilterInfo({
        count: response.data.count || 0,
        totalAmount: response.data.totalAmount || 0,
        message: response.data.message || ''
      });
    } catch (err) {
      setError('Failed to load expenses. Please try again.');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, startDate, endDate, minAmount, maxAmount]);

  // Fetch on filter change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchExpenses();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      await expenseAPI.deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      setError('Failed to delete expense');
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const hasActiveFilters = () => {
    return selectedCategory !== 'All' || startDate || endDate || minAmount || maxAmount;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Food': '#10b981',
      'Travel': '#3b82f6',
      'Clothes': '#8b5cf6',
      'Entertainment': '#f59e0b',
      'Bills': '#ef4444',
      'Others': '#64748b',
    };
    return colors[category] || '#64748b';
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading && expenses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          View Expenses
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage and filter your expense records
        </Typography>
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Filters Card */}
      <SectionCard sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <SearchIcon color="action" />
          <Typography variant="h6" fontWeight={600}>Filters</Typography>
          {hasActiveFilters() && (
            <Chip 
              label="Active filters" 
              color="primary" 
              size="small" 
              sx={{ ml: 'auto' }}
            />
          )}
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="To Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today, min: startDate }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Min Amount"
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              inputProps={{ min: 0 }}
              placeholder="0"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Max Amount"
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              inputProps={{ min: 0 }}
              placeholder="No limit"
            />
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={!hasActiveFilters()}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Filter Summary */}
        {filterInfo.message && (
          <Box sx={{ mt: 2, p: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
            <Typography variant="body2" color="primary">
              {filterInfo.message}
              {selectedCategory !== 'All' && ` for category "${selectedCategory}"`}
            </Typography>
          </Box>
        )}
      </SectionCard>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Amount
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary">
              ₹{Number(filterInfo.totalAmount).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.05) }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Records
            </Typography>
            <Typography variant="h4" fontWeight={700} color="secondary">
              {filterInfo.count}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Expenses Table */}
      <SectionCard title={`Expenses (${expenses.length})`} sx={{ p: 0, '& .MuiCardContent-root': { p: 0 } }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Waste</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.length > 0 ? (
                expenses.map((expense, index) => (
                  <TableRow 
                    key={expense.id}
                    sx={{
                      bgcolor: index % 2 === 0 ? 'transparent' : (theme) => alpha(theme.palette.primary.main, 0.02),
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {expense.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        ₹{Number(expense.amount).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.category} 
                        size="small" 
                        sx={{ 
                          bgcolor: getCategoryColor(expense.category),
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {expense.date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {expense.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {expense.isWaste ? (
                        <Chip label="Yes" color="error" size="small" variant="soft" />
                      ) : (
                        <Chip label="No" color="success" size="small" variant="soft" />
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(expense.id)}
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
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Data Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters or add some expenses.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SectionCard>
    </Box>
  );
};

export default ViewExpenses;
