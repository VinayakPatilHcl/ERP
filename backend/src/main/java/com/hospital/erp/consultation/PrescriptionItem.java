package com.hospital.erp.consultation;

import com.hospital.erp.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "prescription_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;

    @Column(nullable = false, length = 200)
    private String medicineName;

    @Column(length = 100)
    private String dosage; // e.g. "500mg"

    @Column(length = 100)
    private String frequency; // e.g. "1-0-1"

    @Column(length = 100)
    private String duration; // e.g. "5 days"

    @Column(length = 100)
    private String timing; // e.g. "After food"

    @Column(length = 500)
    private String instructions;
}
