package com.expensewise.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private BigDecimal totalExpenses;
    private BigDecimal monthlyExpenses;
    private BigDecimal totalWaste;
    private String wasteMessage;
    private List<CategorySummary> categorySummary;
    private List<ExpenseResponse> recentExpenses;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategorySummary {
        private String category;
        private BigDecimal amount;
    }
}
