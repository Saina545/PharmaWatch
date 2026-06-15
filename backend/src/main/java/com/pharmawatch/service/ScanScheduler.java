package com.pharmawatch.service;

import com.pharmawatch.repository.WatchlistDrugRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScanScheduler {

    private final WatchlistDrugRepository watchlistDrugRepository;
    private final PubMedService pubMedService;

    // Runs at 2:00 AM every day
    @Scheduled(cron = "0 0 2 * * *") 
    @Transactional
    public void performNightlyScan() {
        log.info("Starting automated nightly PubMed scan...");
        
        watchlistDrugRepository.findAll().forEach(drug -> {
            // This works perfectly because of your @Data and boolean active field
            if (drug.isActive()) {
                log.info("Scanning for drug: {}", drug.getDrugName());
                pubMedService.fetchExternalData(drug.getDrugName());
            }
        });
        
        log.info("Nightly scan completed.");
    }
}