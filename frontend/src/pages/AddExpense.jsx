import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseAPI, recurringExpenseAPI } from '../services/api';
import { 
  TextField, Button, Typography, Paper, FormControl, InputLabel, Select, 
  MenuItem, FormControlLabel, Checkbox, Box, Divider, Grid
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SectionCard from '../components/SectionCard';

const categories = ['Food', 'Travel', 'Clothes', 'Entertainment', 'Bills', 'Others'];

const AddExpense = () => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isWaste: false,
  });
  
  // Recurring expense fields
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringData, setRecurringData] = useState({
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleRecurringChange = (e) => {
    const { name, value } = e.target;
    setRecurringData({
      ...recurringData,
      [name]: value,
    });
  };

  const handleRecurringToggle = (e) => {
    setIsRecurring(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };
      await expenseAPI.addExpense(expenseData);

      // If recurring is selected, also create recurring expense
      if (isRecurring) {
        const recurringExpenseData = {
          title: formData.title,
          category: formData.category,
          amount: parseFloat(formData.amount),
          frequency: recurringData.frequency,
          startDate: recurringData.startDate,
          endDate: recurringData.endDate || null,
        };
        await recurringExpenseAPI.createRecurringExpense(recurringExpenseData);
      }

      setSuccess('Expense added successfully!' + (isRecurring ? ' Recurring expense created!' : ''));
      setTimeout(() => navigate('/view-expenses'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Add New Expense
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Record a new expense transaction
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <SectionCard>
            <form onSubmit={handleSubmit}>
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

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount (₹)"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                    placeholder="0.00"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
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
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Optional notes about this expense..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isWaste"
                        checked={formData.isWaste}
                        onChange={handleChange}
                        color="primary"
                      />
                    }
                    label="Mark as Waste (Non-essential expense)"
                  />
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <FormControlLabel
                control={
                  <Checkbox
                    name="isRecurring"
                    checked={isRecurring}
                    onChange={handleRecurringToggle}
                    color="primary"
                  />
                }
                label="Make this a recurring expense"
                sx={{ mb: 2 }}
              />
              
              {isRecurring && (
                <Box sx={{ ml: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Frequency</InputLabel>
                        <Select
                          name="frequency"
                          value={recurringData.frequency}
                          onChange={handleRecurringChange}
                          label="Frequency"
                        >
                          <MenuItem value="MONTHLY">Monthly</MenuItem>
                          <MenuItem value="WEEKLY">Weekly</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        name="startDate"
                        type="date"
                        value={recurringData.startDate}
                        onChange={handleRecurringChange}
                        required
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="End Date (Optional)"
                        name="endDate"
                        type="date"
                        value={recurringData.endDate}
                        onChange={handleRecurringChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 4, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Expense'}
              </Button>
            </form>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddExpense;
