package com.hospital.erp.appointment;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService service;

    @GetMapping("/today")
    public List<AppointmentDtos.AppointmentResponse> today() {
        return service.today();
    }

    @GetMapping
    public List<AppointmentDtos.AppointmentResponse> list(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId) {
        return service.byDate(date, doctorId);
    }

    @GetMapping("/calendar")
    public List<AppointmentDtos.AppointmentResponse> calendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.calendar(from, to);
    }

    @GetMapping("/patient/{patientId}")
    public List<AppointmentDtos.AppointmentResponse> byPatient(@PathVariable Long patientId) {
        return service.byPatient(patientId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public AppointmentDtos.AppointmentResponse book(@Valid @RequestBody AppointmentDtos.AppointmentRequest req) {
        return service.book(req);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR')")
    public AppointmentDtos.AppointmentResponse updateStatus(@PathVariable Long id,
                                                            @Valid @RequestBody AppointmentDtos.AppointmentStatusRequest req) {
        return service.updateStatus(id, req.status());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST')")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
