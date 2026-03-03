package com.expensewise.controller;

import com.expensewise.dto.RecurringExpenseRequest;
import com.expensewise.dto.RecurringExpenseResponse;
import com.expensewise.service.RecurringExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring")
public class RecurringExpenseController {

    private final RecurringExpenseService recurringExpenseService;

    public RecurringExpenseController(RecurringExpenseService recurringExpenseService) {
        this.recurringExpenseService = recurringExpenseService;
    }

    @PostMapping
    public ResponseEntity<RecurringExpenseResponse> createRecurringExpense(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody RecurringExpenseRequest request) {
        return ResponseEntity.ok(recurringExpenseService.createRecurringExpense(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<RecurringExpenseResponse>> getAllRecurringExpenses(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(recurringExpenseService.getRecurringExpenses(userId));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<RecurringExpenseResponse> toggleRecurringExpense(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(recurringExpenseService.toggleRecurringExpense(userId, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecurringExpense(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        recurringExpenseService.deleteRecurringExpense(userId, id);
        return ResponseEntity.ok().build();
    }
}
