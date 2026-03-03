package com.expensewise.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AlertResponse {
    private AlertType type;
    private String category;
    private String message;
    private Double percentageUsed;
    
    public AlertResponse(AlertType type, String category, String message) {
        this.type = type;
        this.category = category;
        this.message = message;
    }
    
    public AlertResponse(AlertType type, String category, String message, Double percentageUsed) {
        this.type = type;
        this.category = category;
        this.message = message;
        this.percentageUsed = percentageUsed;
    }
}
