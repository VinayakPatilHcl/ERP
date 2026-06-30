package com.hospital.erp.doctor;

import com.hospital.erp.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 200)
    private String specialization;

    @Column(length = 100)
    private String qualification;

    @Column(length = 50)
    private String registrationNumber;

    @Column(length = 20)
    private String phone;

    @Column(length = 200)
    private String email;

    @Column(name = "consultation_fee", precision = 12, scale = 2)
    private java.math.BigDecimal consultationFee;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
