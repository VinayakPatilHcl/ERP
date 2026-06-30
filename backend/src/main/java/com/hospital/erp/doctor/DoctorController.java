package com.hospital.erp.doctor;

import com.hospital.erp.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorRepository repo;

    public record DoctorDto(
            Long id,
            @NotBlank String name,
            String specialization,
            String qualification,
            String registrationNumber,
            String phone,
            String email,
            BigDecimal consultationFee,
            boolean active) {}

    @GetMapping
    public List<DoctorDto> list() {
        return repo.findByActiveTrueOrderByNameAsc().stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    public DoctorDto get(@PathVariable Long id) {
        return toDto(find(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public DoctorDto create(@Valid @RequestBody DoctorDto dto) {
        Doctor d = Doctor.builder()
                .name(dto.name())
                .specialization(dto.specialization())
                .qualification(dto.qualification())
                .registrationNumber(dto.registrationNumber())
                .phone(dto.phone())
                .email(dto.email())
                .consultationFee(dto.consultationFee())
                .active(true)
                .build();
        return toDto(repo.save(d));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public DoctorDto update(@PathVariable Long id, @Valid @RequestBody DoctorDto dto) {
        Doctor d = find(id);
        d.setName(dto.name());
        d.setSpecialization(dto.specialization());
        d.setQualification(dto.qualification());
        d.setRegistrationNumber(dto.registrationNumber());
        d.setPhone(dto.phone());
        d.setEmail(dto.email());
        d.setConsultationFee(dto.consultationFee());
        d.setActive(dto.active());
        return toDto(repo.save(d));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Doctor d = find(id);
        d.setActive(false);
        repo.save(d);
        return ResponseEntity.noContent().build();
    }

    private Doctor find(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Doctor", id));
    }

    private DoctorDto toDto(Doctor d) {
        return new DoctorDto(d.getId(), d.getName(), d.getSpecialization(), d.getQualification(),
                d.getRegistrationNumber(), d.getPhone(), d.getEmail(), d.getConsultationFee(), d.isActive());
    }
}
