package com.pharmawatch.repository;

import com.pharmawatch.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByName(String name);
    Optional<Company> findByDomain(String domain);
    boolean existsByName(String name);
    boolean existsByDomain(String domain);
}
