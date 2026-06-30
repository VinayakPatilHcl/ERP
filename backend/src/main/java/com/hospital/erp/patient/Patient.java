package com.hospital.erp.patient;

import com.hospital.erp.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "patients", indexes = {
        @Index(name = "idx_patients_mrn", columnList = "mrn", unique = true),
        @Index(name = "idx_patients_phone", columnList = "phone"),
        @Index(name = "idx_patients_name", columnList = "first_name,last_name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient extends BaseEntity {

    @Column(nullable = false, length = 32)
    private String mrn; // Medical Record Number

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(length = 16)
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 20)
    private String phone;

    @Column(length = 200)
    private String email;

    @Column(length = 500)
    private String address;

    @Column(name = "blood_group", length = 8)
    private String bloodGroup;

    @Column(length = 1000)
    private String allergies;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
