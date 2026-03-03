package com.expensewise.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    
    private Long id;
    private String category;
    private BigDecimal monthlyLimit;
    private String month;
    private BigDecimal totalSpent;
    private BigDecimal percentageUsed;
    private boolean exceeded;
    private BigDecimal remaining;
    
    // Constructor for setting all fields
    public BudgetResponse(Long id, String category, BigDecimal monthlyLimit, 
                         String month, BigDecimal totalSpent) {
        this.id = id;
        this.category = category;
        this.monthlyLimit = monthlyLimit;
        this.month = month;
        this.totalSpent = totalSpent != null ? totalSpent : BigDecimal.ZERO;
        
        // Calculate percentage used
        if (monthlyLimit != null && monthlyLimit.compareTo(BigDecimal.ZERO) > 0) {
            this.percentageUsed = this.totalSpent
                    .divide(monthlyLimit, 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        } else {
            this.percentageUsed = BigDecimal.ZERO;
        }
        
        // Check if exceeded
        this.exceeded = this.totalSpent.compareTo(monthlyLimit) > 0;
        
        // Calculate remaining
        this.remaining = monthlyLimit.subtract(this.totalSpent);
        if (this.remaining.compareTo(BigDecimal.ZERO) < 0) {
            this.remaining = BigDecimal.ZERO;
        }
    }
}
