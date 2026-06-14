package com.pharmawatch.service;

import com.pharmawatch.dto.DashboardDTO;
import com.pharmawatch.entity.Alert;
import com.pharmawatch.entity.Company;
import com.pharmawatch.entity.User;
import com.pharmawatch.entity.WatchlistDrug;
import com.pharmawatch.repository.AlertRepository;
import com.pharmawatch.repository.UserRepository;
import com.pharmawatch.repository.WatchlistDrugRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final AlertRepository alertRepository;
    private final WatchlistDrugRepository watchlistDrugRepository;
    private final UserRepository userRepository;
    private final DataSeederService dataSeederService;

    @Transactional(readOnly = true)
    public DashboardDTO getDashboardData(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Company company = user.getCompany();

        dataSeederService.seedDemoDataIfEmpty(company);

        long totalDrugs = watchlistDrugRepository.countByCompanyAndActiveTrue(company);

        // MULTI-TENANCY: Only count and fetch alerts for actively watchlisted drugs
        List<Alert> watchlistedAlerts = 
            alertRepository.findByCompanyAndWatchlistedDrugsOrderByCreatedAtDesc(company);

        long unreadAlerts = watchlistedAlerts.stream().filter(a -> !a.isRead()).count();
        long criticalAlerts = watchlistedAlerts.stream()
            .filter(a -> a.getSeverity() == Alert.Severity.CRITICAL && !a.isRead()).count();

        List<WatchlistDrug> drugs = watchlistDrugRepository.findByCompanyAndActiveTrue(company);
        long papersScanedToday = drugs.stream()
                .mapToLong(WatchlistDrug::getPapersScannedToday)
                .sum();

        DashboardDTO.MetricCards metrics = DashboardDTO.MetricCards.builder()
                .totalDrugsTracked(totalDrugs)
                .papersScanedToday(papersScanedToday)
                .criticalAlerts(criticalAlerts)
                .newAlertsToday(unreadAlerts)
                .unreadAlerts(unreadAlerts)
                .build();

        List<DashboardDTO.AlertDTO> alertDTOs = watchlistedAlerts.stream()
                .map(this::toAlertDTO)
                .collect(Collectors.toList());

        return DashboardDTO.builder()
                .metrics(metrics)
                .alertFeed(alertDTOs)
                .build();
    }

    @Transactional(readOnly = true)
    public DashboardDTO.AlertDTO getAlertDetail(Long alertId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        if (!alert.getCompany().getId().equals(user.getCompany().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        return toAlertDTO(alert);
    }

    @Transactional(readOnly = true)
    public List<DashboardDTO.DrugHistoryDTO> getDrugHistory(String drugName, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Company company = user.getCompany();

        List<Alert> drugAlerts = 
            alertRepository.findByCompanyAndDrugNameOrderByCreatedAtDesc(company, drugName);

        // Aggregate: group by sideEffect, count occurrences, avg spike
        return drugAlerts.stream()
            .collect(Collectors.groupingBy(Alert::getSideEffect))
            .entrySet().stream()
            .map(e -> DashboardDTO.DrugHistoryDTO.builder()
                .sideEffect(e.getKey())
                .count(e.getValue().size())
                .avgSpike(e.getValue().stream().mapToDouble(Alert::getSpikePercentage).average().orElse(0))
                .build())
            .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
            .collect(Collectors.toList());
    }

    @Transactional
    public void markAlertAsRead(Long alertId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found"));

        if (!alert.getCompany().getId().equals(user.getCompany().getId())) {
            throw new RuntimeException("Unauthorized");
        }

        alert.setRead(true);
        alertRepository.save(alert);
    }

    private DashboardDTO.AlertDTO toAlertDTO(Alert alert) {
        List<DashboardDTO.PaperDTO> papers = null;
        if (alert.getPapers() != null) {
            papers = alert.getPapers().stream()
                .map(p -> DashboardDTO.PaperDTO.builder()
                    .pmid(p.getPmid())
                    .title(p.getTitle())
                    .authors(p.getAuthors())
                    .journal(p.getJournal())
                    .pubYear(p.getPubYear())
                    .pubmedUrl(p.getPubmedUrl())
                    .abstractSnippet(p.getAbstractSnippet())
                    .build())
                .collect(Collectors.toList());
        }

        return DashboardDTO.AlertDTO.builder()
                .id(alert.getId())
                .drugName(alert.getDrugName())
                .sideEffect(alert.getSideEffect())
                .summary(alert.getSummary())
                .paperCount(alert.getPaperCount())
                .spikePercentage(alert.getSpikePercentage())
                .severity(alert.getSeverity().name())
                .read(alert.isRead())
                .createdAt(alert.getCreatedAt())
                .papers(papers)
                .build();
    }
}