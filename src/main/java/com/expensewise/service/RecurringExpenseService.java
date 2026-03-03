package com.expensewise.service;

import com.expensewise.dto.RecurringExpenseRequest;
import com.expensewise.dto.RecurringExpenseResponse;
import com.expensewise.entity.Expense;
import com.expensewise.entity.Frequency;
import com.expensewise.entity.RecurringExpense;
import com.expensewise.entity.User;
import com.expensewise.exception.ResourceNotFoundException;
import com.expensewise.repository.ExpenseRepository;
import com.expensewise.repository.RecurringExpenseRepository;
import com.expensewise.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecurringExpenseService {

    private static final Logger logger = LoggerFactory.getLogger(RecurringExpenseService.class);

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public RecurringExpenseService(RecurringExpenseRepository recurringExpenseRepository,
                                   ExpenseRepository expenseRepository,
                                   UserRepository userRepository) {
        this.recurringExpenseRepository = recurringExpenseRepository;
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RecurringExpenseResponse createRecurringExpense(Long userId, RecurringExpenseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RecurringExpense recurringExpense = new RecurringExpense();
        recurringExpense.setUser(user);
        recurringExpense.setTitle(request.getTitle());
        recurringExpense.setCategory(request.getCategory());
        recurringExpense.setAmount(request.getAmount());
        recurringExpense.setFrequency(request.getFrequency());
        recurringExpense.setStartDate(request.getStartDate());
        recurringExpense.setEndDate(request.getEndDate());
        recurringExpense.setNextExecutionDate(request.getStartDate());
        recurringExpense.setActive(true);

        RecurringExpense saved = recurringExpenseRepository.save(recurringExpense);
        logger.info("Created recurring expense: {} for user: {}", saved.getId(), userId);
        
        return toResponse(saved);
    }

    public List<RecurringExpenseResponse> getRecurringExpenses(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return recurringExpenseRepository.findByUser(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RecurringExpenseResponse toggleRecurringExpense(Long userId, Long id) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RecurringExpense recurringExpense = recurringExpenseRepository.findByUserAndId(user, id);
        if (recurringExpense == null) {
            throw new ResourceNotFoundException("Recurring expense not found");
        }

        recurringExpense.setActive(!recurringExpense.getActive());
        RecurringExpense saved = recurringExpenseRepository.save(recurringExpense);
        logger.info("Toggled recurring expense: {} to active: {}", id, saved.getActive());
        
        return toResponse(saved);
    }

    @Transactional
    public void deleteRecurringExpense(Long userId, Long id) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        RecurringExpense recurringExpense = recurringExpenseRepository.findByUserAndId(user, id);
        if (recurringExpense == null) {
            throw new ResourceNotFoundException("Recurring expense not found");
        }

        recurringExpenseRepository.delete(recurringExpense);
        logger.info("Deleted recurring expense: {} for user: {}", id, userId);
    }

    /**
     * Scheduled job to process recurring expenses.
     * Runs daily at midnight.
     * 
     * Logic:
     * - For MONTHLY: Run on 1st of every month and create Expense entry for each active monthly recurring expense
     * - For WEEKLY: Run daily and check if 7 days passed since last generation for each active weekly recurring expense
     */
    @Scheduled(cron = "0 0 0 * * ?") // Run at midnight every day
    @Transactional
    public void processRecurringExpenses() {
        logger.info("Starting recurring expense processing job...");
        LocalDate today = LocalDate.now();
        
        // Get all active recurring expenses that are valid today
        List<RecurringExpense> activeRecurringExpenses = recurringExpenseRepository.findActiveRecurringExpenses(today);
        
        int createdCount = 0;
        for (RecurringExpense recurring : activeRecurringExpenses) {
            try {
                boolean shouldCreate = false;
                LocalDate generationDate = null;

                if (recurring.getFrequency() == Frequency.MONTHLY) {
                    // For MONTHLY: Create on the 1st of each month
                    if (today.getDayOfMonth() == 1) {
                        // Check if we haven't already created an expense for this month
                        YearMonth currentMonth = YearMonth.from(today);
                        LocalDate startOfMonth = currentMonth.atDay(1);
                        LocalDate endOfMonth = currentMonth.atEndOfMonth();
                        
                        if (!hasExpenseForPeriod(recurring, startOfMonth, endOfMonth)) {
                            shouldCreate = true;
                            generationDate = today;
                        }
                    }
                } else if (recurring.getFrequency() == Frequency.WEEKLY) {
                    // For WEEKLY: Check if 7 days have passed since last generation
                    // We'll check if an expense was created in the last 7 days
                    LocalDate weekAgo = today.minusDays(7);
                    
                    if (!hasExpenseForPeriod(recurring, weekAgo, today)) {
                        shouldCreate = true;
                        generationDate = today;
                    }
                }

                if (shouldCreate && generationDate != null) {
                    createExpenseFromRecurring(recurring, generationDate);
                    createdCount++;
                }
            } catch (Exception e) {
                logger.error("Error processing recurring expense {}: {}", recurring.getId(), e.getMessage());
            }
        }
        
        logger.info("Completed recurring expense processing job. Created {} new expenses.", createdCount);
    }

    /**
     * Check if an expense already exists for this recurring expense in the given period.
     * This prevents duplicate generation.
     */
    private boolean hasExpenseForPeriod(RecurringExpense recurring, LocalDate startDate, LocalDate endDate) {
        List<Expense> existingExpenses = expenseRepository.findByUserAndDateBetween(
                recurring.getUser(), startDate, endDate);
        
        // Check if any expense matches the recurring expense details
        return existingExpenses.stream()
                .anyMatch(e -> e.getTitle().equals(recurring.getTitle()) 
                           && e.getCategory().equals(recurring.getCategory())
                           && e.getAmount().equals(recurring.getAmount()));
    }

    /**
     * Create a normal Expense entry from a RecurringExpense.
     */
    private void createExpenseFromRecurring(RecurringExpense recurring, LocalDate date) {
        Expense expense = new Expense();
        expense.setUser(recurring.getUser());
        expense.setTitle(recurring.getTitle());
        expense.setCategory(recurring.getCategory());
        expense.setAmount(recurring.getAmount());
        expense.setDate(date);
        expense.setDescription("Auto-generated from recurring expense (ID: " + recurring.getId() + ")");
        expense.setIsWaste(false);

        expenseRepository.save(expense);
        logger.info("Created expense from recurring expense: {} for user: {}", 
                    recurring.getId(), recurring.getUser().getId());
    }

    private RecurringExpenseResponse toResponse(RecurringExpense recurringExpense) {
        return new RecurringExpenseResponse(
                recurringExpense.getId(),
                recurringExpense.getTitle(),
                recurringExpense.getCategory(),
                recurringExpense.getAmount(),
                recurringExpense.getFrequency(),
                recurringExpense.getStartDate(),
                recurringExpense.getNextExecutionDate(),
                recurringExpense.getEndDate(),
                recurringExpense.getActive(),
                recurringExpense.getUser().getId()
        );
    }
}
