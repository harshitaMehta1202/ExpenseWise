import { useState, useEffect } from 'react';
import { recurringExpenseAPI } from '../services/api';
import { 
  Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Switch, IconButton, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, Grid, Paper
} from '@mui/material';
import { Delete as DeleteIcon, Refresh as RefreshIcon, Add as AddIcon } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import SectionCard from '../components/SectionCard';

const CATEGORIES = [
  'Rent', 'Groceries', 'Transportation', 'Utilities', 'Entertainment',
  'Dining Out', 'Healthcare', 'Insurance', 'Shopping', 'Education',
  'Subscriptions', 'Travel', 'Salary', 'Investment', 'Other'
];

const RecurringExpenses = () => {
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    amount: '',
    frequency: 'MONTHLY',
    startDate: '',
    endDate: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRecurringExpenses();
  }, []);

  const fetchRecurringExpenses = async () => {
    try {
      setLoading(true);
      const response = await recurringExpenseAPI.getAllRecurringExpenses();
      setRecurringExpenses(response.data);
    } catch (err) {
      setError('Failed to fetch recurring expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await recurringExpenseAPI.toggleRecurringExpense(id);
      setSuccess('Status updated successfully');
      fetchRecurringExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recurring expense?')) {
      return;
    }
    try {
      await recurringExpenseAPI.deleteRecurringExpense(id);
      setSuccess('Recurring expense deleted successfully');
      fetchRecurringExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete recurring expense');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      category: '',
      amount: '',
      frequency: 'MONTHLY',
      startDate: '',
      endDate: ''
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await recurringExpenseAPI.createRecurringExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setSuccess('Recurring expense created successfully');
      handleCloseDialog();
      fetchRecurringExpenses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create recurring expense');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const getFrequencyLabel = (frequency) => {
    return frequency === 'MONTHLY' ? 'Monthly' : 'Weekly';
  };

  const getFrequencyColor = (frequency) => {
    return frequency === 'MONTHLY' ? 'primary' : 'secondary';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
            Recurring Expenses
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your recurring transactions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Add Recurring
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchRecurringExpenses}
          >
            Refresh
          </Button>
        </Box>
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

      {loading ? (
        <Typography>Loading...</Typography>
      ) : recurringExpenses.length === 0 ? (
        <SectionCard>
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No recurring expenses found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Click "Add Recurring" to create your first recurring expense
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
            >
              Add Recurring
            </Button>
          </Box>
        </SectionCard>
      ) : (
        <SectionCard sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recurringExpenses.map((expense) => (
                  <TableRow 
                    key={expense.id}
                    sx={{
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {expense.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={expense.category} 
                        size="small" 
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary.main">
                        {formatCurrency(expense.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getFrequencyLabel(expense.frequency)} 
                        color={getFrequencyColor(expense.frequency)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {expense.startDate}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {expense.endDate || 'No end date'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={expense.active}
                          onChange={() => handleToggle(expense.id)}
                          color="success"
                          size="small"
                        />
                        <Typography 
                          variant="body2" 
                          color={expense.active ? 'success.main' : 'text.secondary'}
                        >
                          {expense.active ? 'Active' : 'Paused'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(expense.id)}
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      )}

      {/* Add Recurring Expense Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Recurring Expense</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                >
                  {CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Frequency"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                >
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="End Date (Optional)"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default RecurringExpenses;
