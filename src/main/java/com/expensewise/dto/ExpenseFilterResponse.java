package com.expensewise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseFilterResponse {
    private List<ExpenseResponse> expenses;
    private int count;
    private BigDecimal totalAmount;
    private String message;
    
    public ExpenseFilterResponse(List<ExpenseResponse> expenses) {
        this.expenses = expenses;
        this.count = expenses != null ? expenses.size() : 0;
        this.totalAmount = expenses != null ? expenses.stream()
                .map(ExpenseResponse::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add) : BigDecimal.ZERO;
        
        if (expenses != null && !expenses.isEmpty()) {
            String categoryMsg = "";
            this.message = "Showing " + count + " expense" + (count != 1 ? "s" : "");
        } else {
            this.message = "No expenses found";
        }
    }
}
