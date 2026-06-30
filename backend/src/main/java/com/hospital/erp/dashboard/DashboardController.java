package com.hospital.erp.dashboard;

import com.hospital.erp.appointment.AppointmentRepository;
import com.hospital.erp.billing.InvoiceRepository;
import com.hospital.erp.patient.PatientRepository;
import com.hospital.erp.pharmacy.MedicineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final PatientRepository patientRepo;
    private final AppointmentRepository appointmentRepo;
    private final InvoiceRepository invoiceRepo;
    private final MedicineRepository medicineRepo;

    public record DashboardSummary(
            long totalPatients,
            long todayAppointments,
            BigDecimal todayCollection,
            BigDecimal todayBilled,
            long lowStockMedicines) {}

    @GetMapping("/summary")
    public DashboardSummary summary() {
        LocalDate today = LocalDate.now();
        long totalPatients = patientRepo.count();
        long todayAppts = appointmentRepo.findByAppointmentDateOrderByTokenNumberAsc(today).size();
        BigDecimal billed = nz(invoiceRepo.sumTotalsByDate(today));
        BigDecimal collected = nz(invoiceRepo.sumPaymentsByDate(today));
        long lowStock = medicineRepo.findLowStock().size();
        return new DashboardSummary(totalPatients, todayAppts, collected, billed, lowStock);
    }

    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
}
