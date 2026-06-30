package com.hospital.erp.settings;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final ClinicSettingsRepository repo;

    public record SettingsDto(
            Long id,
            @NotBlank String clinicName,
            String address,
            String phone,
            String email,
            String gstin,
            BigDecimal defaultGstPercent,
            String currency,
            String invoicePrefix,
            String prescriptionFooter,
            String registration,
            String logoUrl,
            String letterheadTagline,
            String invoiceFooter) {}

    @GetMapping("/clinic")
    public SettingsDto get() {
        ClinicSettings s = repo.findAll().stream().findFirst()
                .orElseGet(() -> repo.save(ClinicSettings.builder().clinicName("My Clinic").build()));
        return toDto(s);
    }

    @PutMapping("/clinic")
    @PreAuthorize("hasRole('ADMIN')")
    public SettingsDto update(@Valid @RequestBody SettingsDto dto) {
        ClinicSettings s = repo.findAll().stream().findFirst()
                .orElseGet(() -> ClinicSettings.builder().clinicName(dto.clinicName()).build());
        s.setClinicName(dto.clinicName());
        s.setAddress(dto.address());
        s.setPhone(dto.phone());
        s.setEmail(dto.email());
        s.setGstin(dto.gstin());
        s.setDefaultGstPercent(dto.defaultGstPercent() == null ? BigDecimal.ZERO : dto.defaultGstPercent());
        s.setCurrency(dto.currency() == null ? "INR" : dto.currency());
        s.setInvoicePrefix(dto.invoicePrefix() == null ? "INV" : dto.invoicePrefix());
        s.setPrescriptionFooter(dto.prescriptionFooter());
        s.setRegistration(dto.registration());
        s.setLogoUrl(dto.logoUrl());
        s.setLetterheadTagline(dto.letterheadTagline());
        s.setInvoiceFooter(dto.invoiceFooter());
        return toDto(repo.save(s));
    }

    private SettingsDto toDto(ClinicSettings s) {
        return new SettingsDto(s.getId(), s.getClinicName(), s.getAddress(), s.getPhone(),
                s.getEmail(), s.getGstin(), s.getDefaultGstPercent(), s.getCurrency(),
                s.getInvoicePrefix(), s.getPrescriptionFooter(),
                s.getRegistration(), s.getLogoUrl(), s.getLetterheadTagline(), s.getInvoiceFooter());
    }
}
