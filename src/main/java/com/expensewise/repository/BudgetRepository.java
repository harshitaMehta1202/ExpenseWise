package com.expensewise.repository;

import com.expensewise.entity.Budget;
import com.expensewise.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    
    List<Budget> findByUserAndMonth(User user, String month);
    
    Optional<Budget> findByUserAndCategoryAndMonth(User user, String category, String month);
    
    @Query("SELECT b FROM Budget b WHERE b.user = :user AND b.category = :category AND b.month = :month")
    Optional<Budget> findByUserCategoryAndMonth(
            @Param("user") User user, 
            @Param("category") String category, 
            @Param("month") String month);
    
    boolean existsByUserAndCategoryAndMonth(User user, String category, String month);
}
