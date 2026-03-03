package com.expensewise.dto;

import com.expensewise.entity.Frequency;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecurringExpenseResponse {
    
    private Long id;
    private String title;
    private String category;
    private BigDecimal amount;
    private Frequency frequency;
    private LocalDate startDate;
    private LocalDate nextExecutionDate;
    private LocalDate endDate;
    private Boolean active;
    private Long userId;
}
