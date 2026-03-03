package com.expensewise.repository;

import com.expensewise.entity.RecurringExpense;
import com.expensewise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {
    
    List<RecurringExpense> findByUser(User user);
    
    List<RecurringExpense> findByUserAndActive(User user, Boolean active);
    
    @Query("SELECT r FROM RecurringExpense r WHERE r.active = true " +
           "AND (r.endDate IS NULL OR r.endDate >= :today) " +
           "AND r.startDate <= :today")
    List<RecurringExpense> findActiveRecurringExpenses(@Param("today") LocalDate today);
    
    @Query("SELECT r FROM RecurringExpense r WHERE r.user = :user AND r.id = :id")
    RecurringExpense findByUserAndId(@Param("user") User user, @Param("id") Long id);
}
