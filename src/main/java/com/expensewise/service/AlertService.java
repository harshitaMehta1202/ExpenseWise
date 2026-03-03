package com.expensewise.service;

import com.expensewise.dto.AlertResponse;
import com.expensewise.dto.AlertType;
import com.expensewise.entity.Frequency;
import com.expensewise.entity.RecurringExpense;
import com.expensewise.entity.User;
import com.expensewise.exception.ResourceNotFoundException;
import com.expensewise.repository.BudgetRepository;
import com.expensewise.repository.ExpenseRepository;
import com.expensewise.repository.RecurringExpenseRepository;
import com.expensewise.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class AlertService {

    private final BudgetRepository budgetRepository;
    private final RecurringExpenseRepository recurringExpenseRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public AlertService(BudgetRepository budgetRepository,
                        RecurringExpenseRepository recurringExpenseRepository,
                        UserRepository userRepository,
                        ExpenseRepository expenseRepository) {
        this.budgetRepository = budgetRepository;
        this.recurringExpenseRepository = recurringExpenseRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
    }

    /**
     * Get all alerts for a user.
     * Includes:
     * - Budget alerts (WARNING when >80%, DANGER when >=100%)
     * - Recurring expense due alerts (INFO when due within 3 days)
     */
    public List<AlertResponse> getAlertsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<AlertResponse> alerts = new ArrayList<>();

        // Get current month
        String currentMonth = getCurrentMonth();

        // Add budget alerts
        alerts.addAll(getBudgetAlerts(user, currentMonth));

        // Add recurring expense alerts
        alerts.addAll(getRecurringExpenseAlerts(user));

        return alerts;
    }

    /**
     * Generate budget alerts for the current month.
     * - If budget usage > 80% and < 100% → WARNING alert
     * - If budget usage >= 100% → DANGER alert
     */
    private List<AlertResponse> getBudgetAlerts(User user, String month) {
        List<AlertResponse> alerts = new ArrayList<>();

        // Get budgets for the current month
        List<com.expensewise.entity.Budget> budgets = budgetRepository.findByUserAndMonth(user, month);

        for (com.expensewise.entity.Budget budget : budgets) {
            // Calculate spent amount for this category and month
            BigDecimal spent = calculateSpentForCategory(user, budget.getCategory(), month);
            BigDecimal limit = budget.getMonthlyLimit();

            // Calculate percentage
            double percentage = 0;
            if (limit.compareTo(BigDecimal.ZERO) > 0) {
                percentage = spent.divide(limit, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }

            // Add alert based on percentage
            if (percentage >= 100) {
                alerts.add(new AlertResponse(
                        AlertType.DANGER,
                        budget.getCategory(),
                        String.format("You have exceeded your %s budget by ₹%.2f!", 
                                budget.getCategory(), 
                                spent.subtract(limit)),
                        percentage
                ));
            } else if (percentage > 80) {
                alerts.add(new AlertResponse(
                        AlertType.WARNING,
                        budget.getCategory(),
                        String.format("You have used %.0f%% of your %s budget.", 
                                percentage, 
                                budget.getCategory()),
                        percentage
                ));
            }
        }

        return alerts;
    }

    /**
     * Generate alerts for recurring expenses that are due within the next 3 days.
     * - For MONTHLY: Check if today is within 3 days of the start date's day
     * - For WEEKLY: Check if expense is due within next 3 days
     */
    private List<AlertResponse> getRecurringExpenseAlerts(User user) {
        List<AlertResponse> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();

        // Get active recurring expenses
        List<RecurringExpense> activeRecurring = recurringExpenseRepository.findByUserAndActive(user, true);

        for (RecurringExpense recurring : activeRecurring) {
            // Check if start date is in the past or today
            if (recurring.getStartDate().isAfter(today)) {
                continue;
            }

            // Check if end date has passed
            if (recurring.getEndDate() != null && recurring.getEndDate().isBefore(today)) {
                continue;
            }

            // Calculate due date based on frequency
            LocalDate dueDate = calculateNextDueDate(recurring, today);

            // Check if due within next 3 days
            if (dueDate != null) {
                long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);

                if (daysUntilDue >= 0 && daysUntilDue <= 3) {
                    String frequencyLabel = recurring.getFrequency() == Frequency.MONTHLY ? "Monthly" : "Weekly";
                    alerts.add(new AlertResponse(
                            AlertType.INFO,
                            "RECURRING",
                            String.format("Recurring expense '%s' (%s) is due in %d day%s. Amount: ₹%.2f",
                                    recurring.getTitle(),
                                    frequencyLabel,
                                    daysUntilDue,
                                    daysUntilDue == 1 ? "" : "s",
                                    recurring.getAmount())
                    ));
                }
            }
        }

        return alerts;
    }

    /**
     * Calculate the next due date for a recurring expense.
     */
    private LocalDate calculateNextDueDate(RecurringExpense recurring, LocalDate today) {
        LocalDate startDate = recurring.getStartDate();
        LocalDate endDate = recurring.getEndDate();

        if (recurring.getFrequency() == Frequency.MONTHLY) {
            // For monthly: due on the same day as startDate each month
            int dayOfMonth = startDate.getDayOfMonth();
            LocalDate thisMonthDue = LocalDate.of(today.getYear(), today.getMonth(), dayOfMonth);

            // If this month's due date has passed, check next month
            if (thisMonthDue.isBefore(today) || thisMonthDue.isEqual(today)) {
                YearMonth nextMonth = YearMonth.from(today).plusMonths(1);
                LocalDate nextMonthDue = nextMonth.atDay(Math.min(dayOfMonth, nextMonth.lengthOfMonth()));
                
                // Check if within end date
                if (endDate == null || !nextMonthDue.isAfter(endDate)) {
                    return nextMonthDue;
                }
            } else {
                // Check if within end date
                if (endDate == null || !thisMonthDue.isAfter(endDate)) {
                    return thisMonthDue;
                }
            }
        } else if (recurring.getFrequency() == Frequency.WEEKLY) {
            // For weekly: calculate days since start
            long daysSinceStart = ChronoUnit.DAYS.between(startDate, today);
            long daysUntilNext = 7 - (daysSinceStart % 7);

            if (daysUntilNext > 3) {
                // More than 3 days away, not due soon
                return null;
            }

            LocalDate nextDue = today.plusDays(daysUntilNext);

            // Check if within end date
            if (endDate != null && nextDue.isAfter(endDate)) {
                return null;
            }

            return nextDue;
        }

        return null;
    }

    /**
     * Calculate total spent for a category in a given month.
     */
    private BigDecimal calculateSpentForCategory(User user, String category, String month) {
        String[] parts = month.split("-");
        int year = Integer.parseInt(parts[0]);
        int monthNum = Integer.parseInt(parts[1]);

        LocalDate startDate = LocalDate.of(year, monthNum, 1);
        LocalDate endDate = startDate.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());

        Double total = expenseRepository.findTotalByUserAndCategoryAndDateBetween(
                user, category, startDate, endDate);

        return total != null ? BigDecimal.valueOf(total) : BigDecimal.ZERO;
    }

    /**
     * Get current month in YYYY-MM format.
     */
    private String getCurrentMonth() {
        LocalDate now = LocalDate.now();
        return String.format("%d-%02d", now.getYear(), now.getMonthValue());
    }
}
