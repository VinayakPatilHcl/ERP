package com.hospital.erp.patient;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByMrn(String mrn);

    boolean existsByMrn(String mrn);

    @Query("""
            SELECT p FROM Patient p
            WHERE p.active = true
              AND (LOWER(p.firstName) LIKE LOWER(CONCAT('%', :q, '%'))
                OR LOWER(p.lastName)  LIKE LOWER(CONCAT('%', :q, '%'))
                OR p.phone LIKE CONCAT('%', :q, '%')
                OR LOWER(p.mrn) LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Patient> search(@Param("q") String q, Pageable pageable);

    Page<Patient> findByActiveTrue(Pageable pageable);
}
