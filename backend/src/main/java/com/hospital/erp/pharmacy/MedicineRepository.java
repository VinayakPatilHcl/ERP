package com.hospital.erp.pharmacy;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    @Query("""
            SELECT m FROM Medicine m
            WHERE m.active = true
              AND (:q IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(m.sku)  LIKE LOWER(CONCAT('%', :q, '%')))
            """)
    Page<Medicine> search(@Param("q") String q, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE m.active = true AND m.stockQuantity <= COALESCE(m.reorderLevel, 0)")
    List<Medicine> findLowStock();
}
