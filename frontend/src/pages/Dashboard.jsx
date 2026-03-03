import { useState, useEffect } from 'react';
import { expenseAPI, budgetAPI, alertsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Grid, Typography, Box, CircularProgress, Alert, AlertTitle, LinearProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../components/StatCard';
import SectionCard from '../components/SectionCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningIcon from '@mui/icons-material/Warning';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { alpha } from '@mui/material/styles';

// Color palette for charts
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const Dashboard = () => {
  const { name } = useAuth();
  const [loading, setLoading] = useState(true);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [alertLoading, setAlertLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Get current month in YYYY-MM format
  const currentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  useEffect(() => {
    fetchDashboard();
    fetchBudgetStatus();
    fetchAlerts();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await expenseAPI.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetStatus = async () => {
    try {
      setBudgetLoading(true);
      const response = await budgetAPI.getBudgetStatus(currentMonth());
      setBudgetStatus(response.data || []);
    } catch (err) {
      console.error('Error fetching budget status:', err);
      setBudgetStatus([]);
    } finally {
      setBudgetLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      setAlertLoading(true);
      const response = await alertsAPI.getAlerts();
      setAlerts(response.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setAlerts([]);
    } finally {
      setAlertLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 80) return '#10b981'; // green
    if (percentage <= 100) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getAlertSeverity = (type) => {
    switch (type) {
      case 'INFO': return 'info';
      case 'WARNING': return 'warning';
      case 'DANGER': return 'error';
      default: return 'info';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Process category data
  const categoryData = [];
  if (dashboardData && dashboardData.categorySummary && Array.isArray(dashboardData.categorySummary)) {
    dashboardData.categorySummary.forEach((item) => {
      if (item.category && item.amount !== undefined) {
        categoryData.push({
          name: item.category,
          value: parseFloat(item.amount) || 0
        });
      }
    });
  }

  const hasData = categoryData.length > 0 && categoryData.some(item => item.value > 0);

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
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Welcome back, {name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's an overview of your expenses for {currentMonth()}
        </Typography>
      </Box>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          {alerts.map((alert, index) => (
            <Alert 
              key={index} 
              severity={getAlertSeverity(alert.type)} 
              sx={{ mb: 1 }}
            >
              <AlertTitle>{alert.type}</AlertTitle>
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Expenses"
            value={formatCurrency(dashboardData?.totalExpenses || 0)}
            icon={AccountBalanceWalletIcon}
            color="primary"
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="This Month"
            value={formatCurrency(dashboardData?.monthlyExpenses || 0)}
            icon={TrendingUpIcon}
            color="secondary"
            subtitle={currentMonth()}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Waste Spending"
            value={formatCurrency(dashboardData?.totalWaste || 0)}
            icon={WarningIcon}
            color="error"
            subtitle="Non-essential"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Transactions"
            value={dashboardData?.recentExpenses?.length || 0}
            icon={ReceiptLongIcon}
            color="info"
            subtitle="Recent"
          />
        </Grid>
      </Grid>

      {/* Waste Analysis Alert */}
      {dashboardData?.totalWaste > 0 && (
        <Alert severity="info" sx={{ mb: 4 }}>
          You spent ₹{dashboardData.totalWaste.toFixed(2)} on non-essential items this month. 
          Consider reducing this to save more!
        </Alert>
      )}

      {/* Charts and Recent Expenses */}
      <Grid container spacing={3}>
        {/* Category Pie Chart */}
        <Grid item xs={12} lg={6}>
          <SectionCard title="Expense Breakdown" subtitle="By category">
            <Box sx={{ width: '100%', height: 320, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {hasData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name, props) => [formatCurrency(value), props.payload.name]}
                      contentStyle={{
                        borderRadius: 8,
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No Data Available
                </Typography>
              )}
            </Box>
          </SectionCard>
        </Grid>

        {/* Recent Expenses */}
        <Grid item xs={12} lg={6}>
          <SectionCard title="Recent Expenses" subtitle="Latest transactions">
            {dashboardData?.recentExpenses?.length > 0 ? (
              <Box>
                {dashboardData.recentExpenses.slice(0, 5).map((expense, index) => (
                  <Box 
                    key={expense.id} 
                    sx={{ 
                      py: 2, 
                      borderBottom: index < 4 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                        px: 1,
                        mx: -1,
                        borderRadius: 2,
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {expense.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {expense.category} • {expense.date}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                      ₹{Number(expense.amount).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No Recent Expenses
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* Budget Status */}
        <Grid item xs={12}>
          <SectionCard 
            title="Budget Status" 
            subtitle={`For ${currentMonth()}`}
          >
            {budgetLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : budgetStatus.length > 0 ? (
              <Grid container spacing={3}>
                {budgetStatus.map((budget) => {
                  const percentage = budget.percentageUsed || 0;
                  const progressColor = getProgressColor(percentage);
                  
                  return (
                    <Grid item xs={12} key={budget.id}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {budget.category}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(budget.totalSpent || 0)} / {formatCurrency(budget.monthlyLimit || 0)}
                            <Typography 
                              component="span" 
                              sx={{ 
                                ml: 1, 
                                fontWeight: 600,
                                color: progressColor 
                              }}
                            >
                              ({percentage.toFixed(0)}%)
                            </Typography>
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(percentage, 100)}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: progressColor,
                              borderRadius: 5,
                              transition: 'transform 0.8s ease-out',
                            }
                          }}
                        />
                        {budget.exceeded && (
                          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            ⚠️ Exceeded by ₹{(budget.totalSpent - budget.monthlyLimit).toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No budgets set for this month. Set your budgets to track spending!
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
