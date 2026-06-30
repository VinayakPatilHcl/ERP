package com.hospital.erp.patient;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class PatientDtos {

    public record PatientRequest(
            @NotBlank String firstName,
            String lastName,
            Gender gender,
            LocalDate dateOfBirth,
            String phone,
            String email,
            String address,
            String bloodGroup,
            String allergies,
            String medicalHistory
    ) {}

    public record PatientResponse(
            Long id,
            String mrn,
            String firstName,
            String lastName,
            Gender gender,
            LocalDate dateOfBirth,
            Integer age,
            String phone,
            String email,
            String address,
            String bloodGroup,
            String allergies,
            String medicalHistory,
            boolean active
    ) {}
}
