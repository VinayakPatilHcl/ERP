package com.hospital.erp.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    boolean existsByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByInvoiceDateOrderByIdDesc(LocalDate date);

    List<Invoice> findByPatientIdOrderByInvoiceDateDesc(Long patientId);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i " +
            "WHERE i.invoiceDate = :date AND i.status <> com.hospital.erp.billing.InvoiceStatus.CANCELLED")
    BigDecimal sumTotalsByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentDate = :date")
    BigDecimal sumPaymentsByDate(@Param("date") LocalDate date);
}
