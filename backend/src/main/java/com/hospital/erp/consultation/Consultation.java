package com.hospital.erp.consultation;

import com.hospital.erp.common.BaseEntity;
import com.hospital.erp.doctor.Doctor;
import com.hospital.erp.patient.Patient;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "consultations", indexes = {
        @Index(name = "idx_cons_patient", columnList = "patient_id"),
        @Index(name = "idx_cons_date", columnList = "consultation_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "consultation_date", nullable = false)
    private LocalDate consultationDate;

    @Embedded
    private Vitals vitals;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "diet_recommendation", columnDefinition = "TEXT")
    private String dietRecommendation;

    @Column(name = "panchakarma_recommendation", columnDefinition = "TEXT")
    private String panchakarmaRecommendation;

    @Column(name = "follow_up_notes", columnDefinition = "TEXT")
    private String followUpNotes;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @OneToMany(mappedBy = "consultation", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PrescriptionItem> prescriptionItems = new ArrayList<>();
}
