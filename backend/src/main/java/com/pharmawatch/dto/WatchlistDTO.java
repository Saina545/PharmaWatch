package com.pharmawatch.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class WatchlistDTO {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DrugDTO {
        private Long id;
        private String drugName;
        private String genericName;
        private String therapeuticArea;
        private boolean active;
        private int papersScannedToday;
        private int totalAlerts;
        private LocalDateTime createdAt;
    }

    @Data
    public static class AddDrugRequest {
        @NotBlank(message = "Drug name is required")
        private String drugName;
        private String genericName;
        private String therapeuticArea;
    }
}