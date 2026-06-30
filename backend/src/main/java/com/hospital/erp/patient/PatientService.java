package com.hospital.erp.patient;

import com.hospital.erp.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.time.Year;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repo;

    @Transactional(readOnly = true)
    public Page<PatientDtos.PatientResponse> list(String q, Pageable pageable) {
        Page<Patient> page = (q == null || q.isBlank())
                ? repo.findByActiveTrue(pageable)
                : repo.search(q.trim(), pageable);
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PatientDtos.PatientResponse get(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public PatientDtos.PatientResponse create(PatientDtos.PatientRequest req) {
        Patient p = Patient.builder()
                .mrn(generateMrn())
                .firstName(req.firstName())
                .lastName(req.lastName())
                .gender(req.gender())
                .dateOfBirth(req.dateOfBirth())
                .phone(req.phone())
                .email(req.email())
                .address(req.address())
                .bloodGroup(req.bloodGroup())
                .allergies(req.allergies())
                .medicalHistory(req.medicalHistory())
                .active(true)
                .build();
        return toResponse(repo.save(p));
    }

    @Transactional
    public PatientDtos.PatientResponse update(Long id, PatientDtos.PatientRequest req) {
        Patient p = find(id);
        p.setFirstName(req.firstName());
        p.setLastName(req.lastName());
        p.setGender(req.gender());
        p.setDateOfBirth(req.dateOfBirth());
        p.setPhone(req.phone());
        p.setEmail(req.email());
        p.setAddress(req.address());
        p.setBloodGroup(req.bloodGroup());
        p.setAllergies(req.allergies());
        p.setMedicalHistory(req.medicalHistory());
        return toResponse(p);
    }

    @Transactional
    public void delete(Long id) {
        Patient p = find(id);
        p.setActive(false); // soft delete
    }

    Patient find(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Patient", id));
    }

    private String generateMrn() {
        String mrn;
        do {
            mrn = "P" + Year.now().getValue() + String.format("%06d", ThreadLocalRandom.current().nextInt(1_000_000));
        } while (repo.existsByMrn(mrn));
        return mrn;
    }

    PatientDtos.PatientResponse toResponse(Patient p) {
        Integer age = p.getDateOfBirth() == null ? null
                : Period.between(p.getDateOfBirth(), LocalDate.now()).getYears();
        return new PatientDtos.PatientResponse(
                p.getId(), p.getMrn(), p.getFirstName(), p.getLastName(),
                p.getGender(), p.getDateOfBirth(), age,
                p.getPhone(), p.getEmail(), p.getAddress(),
                p.getBloodGroup(), p.getAllergies(), p.getMedicalHistory(), p.isActive());
    }
}
