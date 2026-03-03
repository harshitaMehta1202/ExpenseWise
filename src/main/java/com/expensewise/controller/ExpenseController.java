package com.expensewise.controller;

import com.expensewise.dto.DashboardResponse;
import com.expensewise.dto.ExpenseFilterResponse;
import com.expensewise.dto.ExpenseRequest;
import com.expensewise.dto.ExpenseResponse;
import com.expensewise.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> addExpense(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.addExpense(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(expenseService.getExpensesByUser(userId));
    }

    /**
     * Unified filter endpoint with optional parameters:
     * - category: Case-insensitive category filter
     * - startDate: Filter expenses from this date
     * - endDate: Filter expenses until this date
     * - minAmount: Filter expenses with amount >= minAmount
     * - maxAmount: Filter expenses with amount <= maxAmount
     * 
     * Examples:
     * /api/expenses/filter?category=Food
     * /api/expenses/filter?category=Food&startDate=2026-01-01&endDate=2026-01-31
     * /api/expenses/filter?minAmount=100&maxAmount=500
     * /api/expenses/filter?category=TRAVEL&startDate=2026-01-01&endDate=2026-01-31&minAmount=50&maxAmount=1000
     */
    @GetMapping("/filter")
    public ResponseEntity<ExpenseFilterResponse> getExpensesWithFilters(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount) {
        
        ExpenseFilterResponse response = expenseService.getExpensesWithFilters(
                userId, category, startDate, endDate, minAmount, maxAmount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(expenseService.getDashboardData(userId));
    }

    // Legacy endpoint - kept for backward compatibility
    @GetMapping("/filter/date")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByDateRange(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(expenseService.getExpensesByDateRange(userId, startDate, endDate));
    }

    // Legacy endpoint - kept for backward compatibility
    @GetMapping("/category/{category}")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByCategory(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String category) {
        return ResponseEntity.ok(expenseService.getExpensesByCategory(userId, category));
    }

    // Legacy endpoint - kept for backward compatibility
    @GetMapping("/category/{category}/filter")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByCategoryAndDateRange(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String category,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(expenseService.getExpensesByCategoryAndDateRange(userId, category, startDate, endDate));
    }

    @GetMapping("/sort")
    public ResponseEntity<List<ExpenseResponse>> getExpensesSorted(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam boolean ascending) {
        return ResponseEntity.ok(expenseService.getExpensesSortedByAmount(userId, ascending));
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(expenseService.updateExpense(userId, expenseId, request));
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long expenseId) {
        expenseService.deleteExpense(userId, expenseId);
        return ResponseEntity.ok().build();
    }
}
