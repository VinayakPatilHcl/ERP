package com.hospital.erp.consultation;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService service;

    @GetMapping("/{id}")
    public ConsultationDtos.ConsultationResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/patient/{patientId}")
    public List<ConsultationDtos.ConsultationResponse> byPatient(@PathVariable Long patientId) {
        return service.byPatient(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ConsultationDtos.ConsultationResponse create(@Valid @RequestBody ConsultationDtos.ConsultationRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DOCTOR')")
    public ConsultationDtos.ConsultationResponse update(@PathVariable Long id,
                                                         @Valid @RequestBody ConsultationDtos.ConsultationRequest req) {
        return service.update(id, req);
    }
}
