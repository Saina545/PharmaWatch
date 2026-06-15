package com.pharmawatch.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String drugName;

    @Column(nullable = false)
    private String sideEffect;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(name = "paper_count")
    private int paperCount;

    @Column(name = "spike_percentage")
    private double spikePercentage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    // MULTI-TENANCY: Strictly isolates this alert to a specific company
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "is_read")
    private boolean read = false;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Evidence papers stored as an embedded list mapped to this alert
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "alert_papers", joinColumns = @JoinColumn(name = "alert_id"))
    @OrderColumn(name = "paper_order")
    private List<PaperEvidence> papers;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum Severity {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaperEvidence {
        @Column(name = "pmid")
        private String pmid;

        @Column(name = "title", columnDefinition = "TEXT")
        private String title;

        @Column(name = "authors")
        private String authors;

        @Column(name = "journal")
        private String journal;

        @Column(name = "pub_year")
        private int pubYear;

        @Column(name = "pubmed_url")
        private String pubmedUrl;

        @Column(name = "abstract_snippet", columnDefinition = "TEXT")
        private String abstractSnippet;
    }
}