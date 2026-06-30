package com.hospital.erp.billing;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class BillingDtos {

    public record InvoiceItemDto(
            Long id,
            @NotNull InvoiceItemType type,
            String description,
            String hsnSac,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal discountPercent,
            BigDecimal gstPercent,
            BigDecimal lineTotal) {}

    public record InvoiceRequest(
            @NotNull Long patientId,
            Long consultationId,
            LocalDate invoiceDate,
            BigDecimal discountAmount,
            String notes,
            @NotNull List<InvoiceItemDto> items) {}

    public record PaymentRequest(
            @NotNull BigDecimal amount,
            @NotNull PaymentMethod method,
            LocalDate paymentDate,
            String referenceNo,
            String notes) {}

    public record PaymentDto(
            Long id,
            LocalDate paymentDate,
            BigDecimal amount,
            PaymentMethod method,
            String referenceNo,
            String notes) {}

    public record InvoiceResponse(
            Long id,
            String invoiceNumber,
            Long patientId,
            String patientName,
            String patientMrn,
            Long consultationId,
            LocalDate invoiceDate,
            BigDecimal subtotal,
            BigDecimal discountAmount,
            BigDecimal taxAmount,
            BigDecimal totalAmount,
            BigDecimal paidAmount,
            BigDecimal balance,
            InvoiceStatus status,
            String notes,
            List<InvoiceItemDto> items,
            List<PaymentDto> payments) {}

    public record DailyCollectionReport(
            LocalDate date,
            BigDecimal totalBilled,
            BigDecimal totalCollected,
            long invoiceCount,
            long paymentCount) {}
}
