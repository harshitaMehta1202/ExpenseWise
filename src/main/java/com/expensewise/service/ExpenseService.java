package com.expensewise.service;

import com.expensewise.dto.DashboardResponse;
import com.expensewise.dto.ExpenseFilterResponse;
import com.expensewise.dto.ExpenseRequest;
import com.expensewise.dto.ExpenseResponse;
import com.expensewise.entity.Expense;
import com.expensewise.entity.User;
import com.expensewise.exception.ResourceNotFoundException;
import com.expensewise.repository.ExpenseRepository;
import com.expensewise.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    public ExpenseResponse addExpense(Long userId, ExpenseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Expense expense = new Expense();
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        expense.setIsWaste(request.getIsWaste() != null ? request.getIsWaste() : false);
        expense.setUser(user);

        Expense savedExpense = expenseRepository.save(expense);
        return toResponse(savedExpense);
    }

    public List<ExpenseResponse> getExpensesByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return expenseRepository.findByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get expenses with dynamic filtering (case-insensitive category, date range, amount range)
     */
    public ExpenseFilterResponse getExpensesWithFilters(Long userId, String category, 
            LocalDate startDate, LocalDate endDate, BigDecimal minAmount, BigDecimal maxAmount) {
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // If no filters are provided, return all expenses
        if (category == null && startDate == null && endDate == null && minAmount == null && maxAmount == null) {
            List<ExpenseResponse> expenses = expenseRepository.findByUser(user).stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
            return new ExpenseFilterResponse(expenses);
        }
        
        // Use dynamic query with optional parameters
        List<Expense> expenses = expenseRepository.findExpensesWithFilters(
                user, category, startDate, endDate, minAmount, maxAmount);
        
        List<ExpenseResponse> expenseResponses = expenses.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        
        return new ExpenseFilterResponse(expenseResponses);
    }

    public List<ExpenseResponse> getExpensesByDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return expenseRepository.findByUserAndDateBetween(user, startDate, endDate).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByCategory(Long userId, String category) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Use case-insensitive category search
        return expenseRepository.findByUserAndCategoryIgnoreCase(user, category).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesByCategoryAndDateRange(Long userId, String category, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return expenseRepository.findByUserAndCategoryAndDateBetween(user, category, startDate, endDate).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ExpenseResponse> getExpensesSortedByAmount(Long userId, boolean ascending) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        List<Expense> expenses = expenseRepository.findByUser(user);
        
        if (ascending) {
            return expenses.stream()
                    .sorted((e1, e2) -> e1.getAmount().compareTo(e2.getAmount()))
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } else {
            return expenses.stream()
                    .sorted((e1, e2) -> e2.getAmount().compareTo(e1.getAmount()))
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
    }

    public ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Expense not found for this user");
        }

        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        expense.setIsWaste(request.getIsWaste() != null ? request.getIsWaste() : false);

        Expense savedExpense = expenseRepository.save(expense);
        return toResponse(savedExpense);
    }

    public void deleteExpense(Long userId, Long expenseId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
        
        if (!expense.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Expense not found for this user");
        }
        
        expenseRepository.delete(expense);
    }

    public DashboardResponse getDashboardData(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate startOfYear = now.withDayOfYear(1);

        Double totalExpenses = expenseRepository.findTotalExpensesByUser(user);
        BigDecimal total = totalExpenses != null ? BigDecimal.valueOf(totalExpenses) : BigDecimal.ZERO;

        Double monthlyExpensesVal = expenseRepository.findTotalExpensesByUserAndDateBetween(user, startOfMonth, now);
        BigDecimal monthlyExp = monthlyExpensesVal != null ? BigDecimal.valueOf(monthlyExpensesVal) : BigDecimal.ZERO;

        Double wasteExpensesVal = expenseRepository.findTotalWasteByUserAndDateBetween(user, startOfMonth, now);
        BigDecimal waste = wasteExpensesVal != null ? BigDecimal.valueOf(wasteExpensesVal) : BigDecimal.ZERO;
        
        String wasteMessage = "";
        if (waste.compareTo(BigDecimal.ZERO) > 0) {
            wasteMessage = "You spent ₹" + waste.toString() + " on non-essential items this month";
        }

        List<Object[]> categoryData = expenseRepository.findCategorySummaryByUserAndDateBetween(user, startOfMonth, now);
        List<DashboardResponse.CategorySummary> categorySummary = categoryData.stream()
                .map(row -> new DashboardResponse.CategorySummary(
                        (String) row[0],
                        BigDecimal.valueOf(((Number) row[1]).doubleValue())
                ))
                .collect(Collectors.toList());

        List<Expense> recentExpList = expenseRepository.findByUser(user).stream()
                .sorted((e1, e2) -> e2.getDate().compareTo(e1.getDate()))
                .limit(5)
                .collect(Collectors.toList());
        
        List<ExpenseResponse> recentExpenseResponses = recentExpList.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new DashboardResponse(total, monthlyExp, waste, wasteMessage, categorySummary, recentExpenseResponses);
    }

    private ExpenseResponse toResponse(Expense expense) {
        return new ExpenseResponse(
                expense.getId(),
                expense.getTitle(),
                expense.getAmount(),
                expense.getCategory(),
                expense.getDate(),
                expense.getDescription(),
                expense.getIsWaste(),
                expense.getUser().getId()
        );
    }
}
