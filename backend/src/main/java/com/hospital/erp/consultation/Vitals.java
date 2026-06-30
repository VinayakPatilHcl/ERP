package com.hospital.erp.consultation;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vitals {

    @Column(name = "vitals_bp_systolic")
    private Integer bpSystolic;

    @Column(name = "vitals_bp_diastolic")
    private Integer bpDiastolic;

    @Column(name = "vitals_pulse")
    private Integer pulse;

    @Column(name = "vitals_temp_c")
    private Double temperatureC;

    @Column(name = "vitals_resp_rate")
    private Integer respiratoryRate;

    @Column(name = "vitals_spo2")
    private Integer spo2;

    @Column(name = "vitals_weight_kg")
    private Double weightKg;

    @Column(name = "vitals_height_cm")
    private Double heightCm;
}
