package com.hospital.erp.billing;

import com.hospital.erp.common.exception.BadRequestException;
import com.hospital.erp.common.exception.ResourceNotFoundException;
import com.hospital.erp.patient.Patient;
import com.hospital.erp.patient.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final InvoiceRepository repo;
    private final PatientRepository patientRepo;

    @Transactional(readOnly = true)
    public BillingDtos.InvoiceResponse get(Long id) {
        return toResponse(find(id));
    }

    @Transactional(readOnly = true)
    public List<BillingDtos.InvoiceResponse> byDate(LocalDate date) {
        return repo.findByInvoiceDateOrderByIdDesc(date).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BillingDtos.InvoiceResponse> byPatient(Long patientId) {
        return repo.findByPatientIdOrderByInvoiceDateDesc(patientId).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public BillingDtos.DailyCollectionReport dailyCollection(LocalDate date) {
        BigDecimal billed = nz(repo.sumTotalsByDate(date));
        BigDecimal collected = nz(repo.sumPaymentsByDate(date));
        long invoiceCount = repo.findByInvoiceDateOrderByIdDesc(date).size();
        long paymentCount = repo.findByInvoiceDateOrderByIdDesc(date).stream()
                .mapToLong(i -> i.getPayments().size()).sum();
        return new BillingDtos.DailyCollectionReport(date, billed, collected, invoiceCount, paymentCount);
    }

    @Transactional
    public BillingDtos.InvoiceResponse create(BillingDtos.InvoiceRequest req) {
        if (req.items() == null || req.items().isEmpty()) {
            throw new BadRequestException("Invoice must have at least one item");
        }
        Patient patient = patientRepo.findById(req.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", req.patientId()));

        Invoice inv = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber())
                .patient(patient)
                .consultationId(req.consultationId())
                .invoiceDate(req.invoiceDate() == null ? LocalDate.now() : req.invoiceDate())
                .discountAmount(nz(req.discountAmount()))
                .notes(req.notes())
                .status(InvoiceStatus.UNPAID)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;
        for (BillingDtos.InvoiceItemDto it : req.items()) {
            BigDecimal qty = nz(it.quantity());
            BigDecimal price = nz(it.unitPrice());
            BigDecimal gross = qty.multiply(price);
            BigDecimal disc = nz(it.discountPercent()).divide(HUNDRED, 4, RoundingMode.HALF_UP);
            BigDecimal afterDiscount = gross.subtract(gross.multiply(disc));
            BigDecimal gst = nz(it.gstPercent()).divide(HUNDRED, 4, RoundingMode.HALF_UP);
            BigDecimal tax = afterDiscount.multiply(gst).setScale(2, RoundingMode.HALF_UP);
            BigDecimal lineTotal = afterDiscount.add(tax).setScale(2, RoundingMode.HALF_UP);

            subtotal = subtotal.add(afterDiscount);
            taxTotal = taxTotal.add(tax);

            inv.getItems().add(InvoiceItem.builder()
                    .invoice(inv)
                    .type(it.type())
                    .description(it.description())
                    .hsnSac(it.hsnSac())
                    .quantity(qty)
                    .unitPrice(price)
                    .discountPercent(nz(it.discountPercent()))
                    .gstPercent(nz(it.gstPercent()))
                    .lineTotal(lineTotal)
                    .build());
        }

        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        taxTotal = taxTotal.setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(taxTotal).subtract(nz(req.discountAmount()))
                .setScale(2, RoundingMode.HALF_UP);

        inv.setSubtotal(subtotal);
        inv.setTaxAmount(taxTotal);
        inv.setTotalAmount(total.max(BigDecimal.ZERO));
        inv.setPaidAmount(BigDecimal.ZERO);

        return toResponse(repo.save(inv));
    }

    @Transactional
    public BillingDtos.InvoiceResponse addPayment(Long invoiceId, BillingDtos.PaymentRequest req) {
        Invoice inv = find(invoiceId);
        if (inv.getStatus() == InvoiceStatus.CANCELLED) {
            throw new BadRequestException("Cannot pay a cancelled invoice");
        }
        Payment p = Payment.builder()
                .invoice(inv)
                .amount(req.amount())
                .method(req.method())
                .paymentDate(req.paymentDate() == null ? LocalDate.now() : req.paymentDate())
                .referenceNo(req.referenceNo())
                .notes(req.notes())
                .build();
        inv.getPayments().add(p);
        BigDecimal paid = inv.getPaidAmount().add(req.amount());
        inv.setPaidAmount(paid);
        if (paid.compareTo(inv.getTotalAmount()) >= 0) {
            inv.setStatus(InvoiceStatus.PAID);
        } else if (paid.compareTo(BigDecimal.ZERO) > 0) {
            inv.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }
        return toResponse(inv);
    }

    @Transactional
    public void cancel(Long id) {
        Invoice inv = find(id);
        inv.setStatus(InvoiceStatus.CANCELLED);
    }

    private Invoice find(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
    }

    private String generateInvoiceNumber() {
        String n;
        do {
            n = "INV" + Year.now().getValue() + String.format("%07d", ThreadLocalRandom.current().nextInt(10_000_000));
        } while (repo.existsByInvoiceNumber(n));
        return n;
    }

    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }

    BillingDtos.InvoiceResponse toResponse(Invoice inv) {
        Patient p = inv.getPatient();
        String patientName = (p.getFirstName() + " " + (p.getLastName() == null ? "" : p.getLastName())).trim();
        List<BillingDtos.InvoiceItemDto> items = inv.getItems().stream()
                .map(i -> new BillingDtos.InvoiceItemDto(
                        i.getId(), i.getType(), i.getDescription(), i.getHsnSac(),
                        i.getQuantity(), i.getUnitPrice(), i.getDiscountPercent(),
                        i.getGstPercent(), i.getLineTotal()))
                .toList();
        List<BillingDtos.PaymentDto> payments = inv.getPayments().stream()
                .map(pay -> new BillingDtos.PaymentDto(
                        pay.getId(), pay.getPaymentDate(), pay.getAmount(),
                        pay.getMethod(), pay.getReferenceNo(), pay.getNotes()))
                .toList();
        BigDecimal balance = inv.getTotalAmount().subtract(inv.getPaidAmount());
        return new BillingDtos.InvoiceResponse(
                inv.getId(), inv.getInvoiceNumber(),
                p.getId(), patientName, p.getMrn(),
                inv.getConsultationId(), inv.getInvoiceDate(),
                inv.getSubtotal(), inv.getDiscountAmount(), inv.getTaxAmount(),
                inv.getTotalAmount(), inv.getPaidAmount(), balance,
                inv.getStatus(), inv.getNotes(), items, payments);
    }
}
