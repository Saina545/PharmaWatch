package com.pharmawatch.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDTO {

    private MetricCards metrics;
    private List<AlertDTO> alertFeed;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MetricCards {
        private long totalDrugsTracked;
        private long papersScanedToday;
        private long criticalAlerts;
        private long newAlertsToday;
        private long unreadAlerts;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AlertDTO {
        private Long id;
        private String drugName;
        private String sideEffect;
        private String summary;
        private int paperCount;
        private double spikePercentage;
        private String severity;
        private boolean read;
        private LocalDateTime createdAt;
        private List<PaperDTO> papers;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PaperDTO {
        private String pmid;
        private String title;
        private String authors;
        private String journal;
        private int pubYear;
        private String pubmedUrl;
        private String abstractSnippet;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DrugHistoryDTO {
        private String sideEffect;
        private long count;
        private double avgSpike;
    }
}