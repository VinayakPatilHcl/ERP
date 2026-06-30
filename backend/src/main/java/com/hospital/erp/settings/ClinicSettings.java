package com.hospital.erp.settings;

import com.hospital.erp.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "clinic_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClinicSettings extends BaseEntity {

    @Column(name = "clinic_name", nullable = false, length = 200)
    private String clinicName;

    @Column(length = 500)
    private String address;

    @Column(length = 20)
    private String phone;

    @Column(length = 200)
    private String email;

    @Column(name = "gstin", length = 20)
    private String gstin;

    @Column(name = "default_gst_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal defaultGstPercent = BigDecimal.ZERO;

    @Column(length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "invoice_prefix", length = 16)
    @Builder.Default
    private String invoicePrefix = "INV";

    @Column(name = "rx_footer", columnDefinition = "TEXT")
    private String prescriptionFooter;

    @Column(name = "registration", length = 64)
    private String registration;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "letterhead_tagline", length = 200)
    private String letterheadTagline;

    @Column(name = "invoice_footer", columnDefinition = "TEXT")
    private String invoiceFooter;
}
