package com.hospital.erp.consultation;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class ConsultationDtos {

    public record VitalsDto(
            Integer bpSystolic, Integer bpDiastolic,
            Integer pulse, Double temperatureC,
            Integer respiratoryRate, Integer spo2,
            Double weightKg, Double heightCm) {}

    public record PrescriptionItemDto(
            Long id,
            String medicineName,
            String dosage,
            String frequency,
            String duration,
            String timing,
            String instructions) {}

    public record ConsultationRequest(
            @NotNull Long patientId,
            @NotNull Long doctorId,
            Long appointmentId,
            LocalDate consultationDate,
            VitalsDto vitals,
            String symptoms,
            String diagnosis,
            String notes,
            String dietRecommendation,
            String panchakarmaRecommendation,
            String followUpNotes,
            LocalDate followUpDate,
            List<PrescriptionItemDto> prescription) {}

    public record ConsultationResponse(
            Long id,
            Long patientId,
            String patientName,
            String patientMrn,
            Long doctorId,
            String doctorName,
            Long appointmentId,
            LocalDate consultationDate,
            VitalsDto vitals,
            String symptoms,
            String diagnosis,
            String notes,
            String dietRecommendation,
            String panchakarmaRecommendation,
            String followUpNotes,
            LocalDate followUpDate,
            List<PrescriptionItemDto> prescription) {}
}
