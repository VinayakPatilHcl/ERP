package com.hospital.erp.billing;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/billing")
@RequiredArgsConstructor
public class BillingController {

    private final InvoiceService service;

    @GetMapping("/invoices/{id}")
    public BillingDtos.InvoiceResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/invoices")
    public List<BillingDtos.InvoiceResponse> byDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.byDate(date);
    }

    @GetMapping("/invoices/patient/{patientId}")
    public List<BillingDtos.InvoiceResponse> byPatient(@PathVariable Long patientId) {
        return service.byPatient(patientId);
    }

    @PostMapping("/invoices")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public BillingDtos.InvoiceResponse create(@Valid @RequestBody BillingDtos.InvoiceRequest req) {
        return service.create(req);
    }

    @PostMapping("/invoices/{id}/payments")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public BillingDtos.InvoiceResponse addPayment(@PathVariable Long id,
                                                   @Valid @RequestBody BillingDtos.PaymentRequest req) {
        return service.addPayment(id, req);
    }

    @DeleteMapping("/invoices/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reports/daily-collection")
    public BillingDtos.DailyCollectionReport dailyCollection(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.dailyCollection(date == null ? LocalDate.now() : date);
    }
}
