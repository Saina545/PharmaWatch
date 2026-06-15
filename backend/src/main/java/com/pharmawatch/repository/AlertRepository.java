package com.pharmawatch.repository;

import com.pharmawatch.entity.Alert;
import com.pharmawatch.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    
    List<Alert> findByCompanyOrderByCreatedAtDesc(Company company);
    
    List<Alert> findByCompanyAndReadFalseOrderByCreatedAtDesc(Company company);
    
    long countByCompanyAndReadFalse(Company company);
    
    long countByCompanyAndSeverity(Company company, Alert.Severity severity);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.company = ?1")
    long countByCompany(Company company);

    // MULTI-TENANCY: Only alerts for drugs currently on the company watchlist
    @Query("""
        SELECT a FROM Alert a
        WHERE a.company = ?1
          AND a.drugName IN (
            SELECT w.drugName FROM WatchlistDrug w
            WHERE w.company = ?1 AND w.active = TRUE
          )
        ORDER BY a.createdAt DESC
    """)
    List<Alert> findByCompanyAndWatchlistedDrugsOrderByCreatedAtDesc(Company company);

    // HISTORY: For the deep-dive panel side-effect frequencies
    @Query("""
        SELECT a FROM Alert a
        WHERE a.company = ?1 AND a.drugName = ?2
        ORDER BY a.createdAt DESC
    """)
    List<Alert> findByCompanyAndDrugNameOrderByCreatedAtDesc(Company company, String drugName);

    // GLOBAL SEARCH: Searches across drug names, side effects, and summaries
    @Query("SELECT a FROM Alert a WHERE " +
           "(a.drugName ILIKE %:query% OR a.sideEffect ILIKE %:query% OR a.summary ILIKE %:query%) " +
           "ORDER BY a.createdAt DESC")
    List<Alert> searchGlobalAcrossAllData(@Param("query") String query);
}