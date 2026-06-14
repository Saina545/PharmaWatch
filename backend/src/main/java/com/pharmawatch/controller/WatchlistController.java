package com.pharmawatch.controller;

import com.pharmawatch.dto.WatchlistDTO;
import com.pharmawatch.service.WatchlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public ResponseEntity<List<WatchlistDTO.DrugDTO>> getWatchlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(watchlistService.getWatchlist(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<?> addDrug(
            @Valid @RequestBody WatchlistDTO.AddDrugRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            WatchlistDTO.DrugDTO drug = watchlistService.addDrug(request, userDetails.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(drug);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{drugId}")
    public ResponseEntity<?> removeDrug(
            @PathVariable Long drugId,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            watchlistService.removeDrug(drugId, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("success", true, "message", "Drug removed from watchlist"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}