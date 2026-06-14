package com.pharmawatch.controller;

import com.pharmawatch.dto.DashboardDTO;
import com.pharmawatch.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getDashboardData(userDetails.getUsername()));
    }

    @GetMapping("/alerts/{alertId}")
    public ResponseEntity<?> getAlertDetail(
            @PathVariable Long alertId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            DashboardDTO.AlertDTO alert = dashboardService.getAlertDetail(alertId, userDetails.getUsername());
            return ResponseEntity.ok(alert);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/drugs/{drugName}/history")
    public ResponseEntity<?> getDrugHistory(
            @PathVariable String drugName,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<DashboardDTO.DrugHistoryDTO> history = 
                dashboardService.getDrugHistory(drugName, userDetails.getUsername());
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/alerts/{alertId}/read")
    public ResponseEntity<?> markAlertAsRead(
            @PathVariable Long alertId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            dashboardService.markAlertAsRead(alertId, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}