package com.expensewise.repository;

import com.expensewise.entity.Expense;
import com.expensewise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long>, JpaSpecificationExecutor<Expense> {
    
    List<Expense> findByUser(User user);
    
    List<Expense> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    List<Expense> findByUserAndCategory(User user, String category);
    
    List<Expense> findByUserAndCategoryAndDateBetween(User user, String category, LocalDate startDate, LocalDate endDate);
    
    // Case-insensitive category search
    @Query("SELECT e FROM Expense e WHERE e.user = :user AND LOWER(e.category) = LOWER(:category)")
    List<Expense> findByUserAndCategoryIgnoreCase(@Param("user") User user, @Param("category") String category);
    
    // Dynamic filtering with case-insensitive category
    @Query("SELECT e FROM Expense e WHERE e.user = :user " +
           "AND (:category IS NULL OR LOWER(e.category) = LOWER(:category)) " +
           "AND (:startDate IS NULL OR e.date >= :startDate) " +
           "AND (:endDate IS NULL OR e.date <= :endDate) " +
           "AND (:minAmount IS NULL OR e.amount >= :minAmount) " +
           "AND (:maxAmount IS NULL OR e.amount <= :maxAmount)")
    List<Expense> findExpensesWithFilters(
            @Param("user") User user,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount
    );
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user")
    Double findTotalExpensesByUser(@Param("user") User user);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.date BETWEEN :startDate AND :endDate")
    Double findTotalExpensesByUserAndDateBetween(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.isWaste = true AND e.date BETWEEN :startDate AND :endDate")
    Double findTotalWasteByUserAndDateBetween(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user = :user AND e.date BETWEEN :startDate AND :endDate GROUP BY e.category")
    List<Object[]> findCategorySummaryByUserAndDateBetween(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find total by user, category, and date range (for budget calculation)
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user AND LOWER(e.category) = LOWER(:category) AND e.date BETWEEN :startDate AND :endDate")
    Double findTotalByUserAndCategoryAndDateBetween(@Param("user") User user, @Param("category") String category, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
