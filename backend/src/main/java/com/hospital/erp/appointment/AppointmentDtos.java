package com.hospital.erp.appointment;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public class AppointmentDtos {

    public record AppointmentRequest(
            @NotNull Long patientId,
            @NotNull Long doctorId,
            @NotNull LocalDate appointmentDate,
            @NotNull LocalTime appointmentTime,
            String reason,
            boolean followUp,
            Long parentAppointmentId) {}

    public record AppointmentStatusRequest(@NotNull AppointmentStatus status) {}

    public record AppointmentResponse(
            Long id,
            Long patientId,
            String patientName,
            String patientMrn,
            Long doctorId,
            String doctorName,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            Integer tokenNumber,
            AppointmentStatus status,
            String reason,
            boolean followUp,
            Long parentAppointmentId) {}
}
