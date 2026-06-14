package com.pharmawatch.repository;

import com.pharmawatch.entity.WatchlistDrug;
import com.pharmawatch.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchlistDrugRepository extends JpaRepository<WatchlistDrug, Long> {
    
    List<WatchlistDrug> findByCompanyAndActiveTrue(Company company);
    
    List<WatchlistDrug> findByCompanyOrderByCreatedAtDesc(Company company);
    
    long countByCompanyAndActiveTrue(Company company);
    
    Optional<WatchlistDrug> findByCompanyAndDrugNameIgnoreCase(Company company, String drugName);
}