package com.pharmawatch.service;

import com.pharmawatch.dto.WatchlistDTO;
import com.pharmawatch.entity.Company;
import com.pharmawatch.entity.User;
import com.pharmawatch.entity.WatchlistDrug;
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
public class WatchlistService {

    private final WatchlistDrugRepository watchlistDrugRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WatchlistDTO.DrugDTO> getWatchlist(String userEmail) {
        Company company = getCompany(userEmail);
        return watchlistDrugRepository.findByCompanyOrderByCreatedAtDesc(company)
            .stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public WatchlistDTO.DrugDTO addDrug(WatchlistDTO.AddDrugRequest request, String userEmail) {
        Company company = getCompany(userEmail);

        // Check if drug already tracked (even if inactive)
        watchlistDrugRepository.findByCompanyAndDrugNameIgnoreCase(company, request.getDrugName())
            .ifPresent(existing -> {
                if (existing.isActive()) {
                    throw new RuntimeException("'" + request.getDrugName() + "' is already on your watchlist.");
                }
                // Re-activate if previously removed
                existing.setActive(true);
                existing.setGenericName(request.getGenericName());
                existing.setTherapeuticArea(request.getTherapeuticArea());
                watchlistDrugRepository.save(existing);
            });

        // Check again in case we just re-activated
        boolean exists = watchlistDrugRepository
            .findByCompanyAndDrugNameIgnoreCase(company, request.getDrugName())
            .isPresent();

        if (exists) {
            return watchlistDrugRepository
                .findByCompanyAndDrugNameIgnoreCase(company, request.getDrugName())
                .map(this::toDTO)
                .orElseThrow();
        }

        WatchlistDrug drug = WatchlistDrug.builder()
            .drugName(request.getDrugName().trim())
            .genericName(request.getGenericName() != null ? request.getGenericName().trim() : null)
            .therapeuticArea(request.getTherapeuticArea() != null ? request.getTherapeuticArea().trim() : null)
            .company(company)
            .active(true)
            .papersScannedToday(0)
            .totalAlerts(0)
            .build();

        WatchlistDrug saved = watchlistDrugRepository.save(drug);
        log.info("Added drug '{}' to watchlist for company '{}'", saved.getDrugName(), company.getName());
        return toDTO(saved);
    }

    @Transactional
    public void removeDrug(Long drugId, String userEmail) {
        Company company = getCompany(userEmail);

        WatchlistDrug drug = watchlistDrugRepository.findById(drugId)
            .orElseThrow(() -> new RuntimeException("Drug not found"));

        if (!drug.getCompany().getId().equals(company.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        // Soft delete
        drug.setActive(false);
        watchlistDrugRepository.save(drug);
        log.info("Removed drug '{}' from watchlist for company '{}'", drug.getDrugName(), company.getName());
    }

    private Company getCompany(String userEmail) {
        return userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"))
            .getCompany();
    }

    private WatchlistDTO.DrugDTO toDTO(WatchlistDrug d) {
        return WatchlistDTO.DrugDTO.builder()
            .id(d.getId())
            .drugName(d.getDrugName())
            .genericName(d.getGenericName())
            .therapeuticArea(d.getTherapeuticArea())
            .active(d.isActive())
            .papersScannedToday(d.getPapersScannedToday())
            .totalAlerts(d.getTotalAlerts())
            .createdAt(d.getCreatedAt())
            .build();
    }
}