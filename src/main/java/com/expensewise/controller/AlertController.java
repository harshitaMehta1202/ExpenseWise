package com.expensewise.controller;

import com.expensewise.dto.AlertResponse;
import com.expensewise.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAlerts(
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(alertService.getAlertsForUser(userId));
    }
}
