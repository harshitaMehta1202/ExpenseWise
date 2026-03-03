package com.expensewise.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "budget", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "category", "month"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Budget {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal monthlyLimit;

    @Column(nullable = false, length = 7)
    private String month; // Format: YYYY-MM

    public Budget(User user, String category, BigDecimal monthlyLimit, String month) {
        this.user = user;
        this.category = category;
        this.monthlyLimit = monthlyLimit;
        this.month = month;
    }
}
