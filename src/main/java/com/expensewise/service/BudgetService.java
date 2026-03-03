package com.expensewise.service;

import com.expensewise.dto.BudgetRequest;
import com.expensewise.dto.BudgetResponse;
import com.expensewise.entity.Budget;
import com.expensewise.entity.User;
import com.expensewise.exception.ResourceNotFoundException;
import com.expensewise.repository.BudgetRepository;
import com.expensewise.repository.ExpenseRepository;
import com.expensewise.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BudgetService {
    
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;
    
    public BudgetService(BudgetRepository budgetRepository, 
                         UserRepository userRepository,
                         ExpenseRepository expenseRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.expenseRepository = expenseRepository;
    }
    
    /**
     * Create or update a budget for a user, category, and month
     */
    @Transactional
    public BudgetResponse setBudget(Long userId, BudgetRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if budget already exists for this user, category, and month
        Optional<Budget> existingBudget = budgetRepository
                .findByUserCategoryAndMonth(user, request.getCategory(), request.getMonth());
        
        Budget budget;
        if (existingBudget.isPresent()) {
            // Update existing budget
            budget = existingBudget.get();
            budget.setMonthlyLimit(request.getMonthlyLimit());
        } else {
            // Create new budget
            budget = new Budget(user, request.getCategory(), 
                              request.getMonthlyLimit(), request.getMonth());
        }
        
        Budget savedBudget = budgetRepository.save(budget);
        
        // Calculate total spent for this category and month
        BigDecimal totalSpent = getTotalSpentByCategoryAndMonth(user, 
                request.getCategory(), request.getMonth());
        
        return new BudgetResponse(
                savedBudget.getId(),
                savedBudget.getCategory(),
                savedBudget.getMonthlyLimit(),
                savedBudget.getMonth(),
                totalSpent
        );
    }
    
    /**
     * Get all budgets for a user for a specific month
     */
    public List<BudgetResponse> getBudgetsByMonth(Long userId, String month) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Budget> budgets = budgetRepository.findByUserAndMonth(user, month);
        
        return budgets.stream()
                .map(budget -> {
                    BigDecimal totalSpent = getTotalSpentByCategoryAndMonth(user,
                            budget.getCategory(), month);
                    return new BudgetResponse(
                            budget.getId(),
                            budget.getCategory(),
                            budget.getMonthlyLimit(),
                            budget.getMonth(),
                            totalSpent
                    );
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get budget status with spending info for a month
     */
    public List<BudgetResponse> getBudgetStatus(Long userId, String month) {
        // Same as getBudgetsByMonth - returns budget with spending info
        return getBudgetsByMonth(userId, month);
    }
    
    /**
     * Delete a budget by ID
     */
    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        
        // Verify the budget belongs to the user
        if (!budget.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Budget not found for this user");
        }
        
        budgetRepository.delete(budget);
    }
    
    /**
     * Calculate total spent by user, category, and month
     */
    private BigDecimal getTotalSpentByCategoryAndMonth(User user, String category, String month) {
        // Parse the month to get start and end dates
        String[] parts = month.split("-");
        int year = Integer.parseInt(parts[0]);
        int monthNum = Integer.parseInt(parts[1]);
        
        java.time.LocalDate startDate = java.time.LocalDate.of(year, monthNum, 1);
        java.time.LocalDate endDate = startDate.with(java.time.temporal.TemporalAdjusters.lastDayOfMonth());
        
        Double total = expenseRepository.findTotalByUserAndCategoryAndDateBetween(
                user, category, startDate, endDate);
        
        return total != null ? BigDecimal.valueOf(total) : BigDecimal.ZERO;
    }
}
