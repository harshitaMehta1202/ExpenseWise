package com.expensewise.controller;

import com.expensewise.dto.BudgetRequest;
import com.expensewise.dto.BudgetResponse;
import com.expensewise.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budget")
public class BudgetController {
    
    private final BudgetService budgetService;
    
    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }
    
    /**
     * Set a budget for a specific category and month
     * POST /api/budget
     */
    @PostMapping
    public ResponseEntity<BudgetResponse> setBudget(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(budgetService.setBudget(userId, request));
    }
    
    /**
     * Get all budgets for a user for a specific month
     * GET /api/budget/{month}
     */
    @GetMapping("/{month}")
    public ResponseEntity<List<BudgetResponse>> getBudgetsByMonth(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String month) {
        return ResponseEntity.ok(budgetService.getBudgetsByMonth(userId, month));
    }
    
    /**
     * Get budget status with spending info for a month
     * GET /api/budget/status/{month}
     */
    @GetMapping("/status/{month}")
    public ResponseEntity<List<BudgetResponse>> getBudgetStatus(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String month) {
        return ResponseEntity.ok(budgetService.getBudgetStatus(userId, month));
    }
    
    /**
     * Delete a budget
     * DELETE /api/budget/{budgetId}
     */
    @DeleteMapping("/{budgetId}")
    public ResponseEntity<Void> deleteBudget(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long budgetId) {
        budgetService.deleteBudget(userId, budgetId);
        return ResponseEntity.ok().build();
    }
}
