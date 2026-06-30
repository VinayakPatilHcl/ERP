package com.hospital.erp.consultation;

import com.hospital.erp.common.exception.ResourceNotFoundException;
import com.hospital.erp.doctor.Doctor;
import com.hospital.erp.doctor.DoctorRepository;
import com.hospital.erp.patient.Patient;
import com.hospital.erp.patient.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository repo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;

    @Transactional(readOnly = true)
    public ConsultationDtos.ConsultationResponse get(Long id) {
        return toResponse(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation", id)));
    }

    @Transactional(readOnly = true)
    public List<ConsultationDtos.ConsultationResponse> byPatient(Long patientId) {
        return repo.findByPatientIdOrderByConsultationDateDesc(patientId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ConsultationDtos.ConsultationResponse create(ConsultationDtos.ConsultationRequest req) {
        Patient patient = patientRepo.findById(req.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", req.patientId()));
        Doctor doctor = doctorRepo.findById(req.doctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", req.doctorId()));

        Consultation c = Consultation.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentId(req.appointmentId())
                .consultationDate(req.consultationDate() == null ? LocalDate.now() : req.consultationDate())
                .vitals(toVitals(req.vitals()))
                .symptoms(req.symptoms())
                .diagnosis(req.diagnosis())
                .notes(req.notes())
                .dietRecommendation(req.dietRecommendation())
                .panchakarmaRecommendation(req.panchakarmaRecommendation())
                .followUpNotes(req.followUpNotes())
                .followUpDate(req.followUpDate())
                .build();

        if (req.prescription() != null) {
            for (ConsultationDtos.PrescriptionItemDto p : req.prescription()) {
                c.getPrescriptionItems().add(PrescriptionItem.builder()
                        .consultation(c)
                        .medicineName(p.medicineName())
                        .dosage(p.dosage())
                        .frequency(p.frequency())
                        .duration(p.duration())
                        .timing(p.timing())
                        .instructions(p.instructions())
                        .build());
            }
        }
        return toResponse(repo.save(c));
    }

    @Transactional
    public ConsultationDtos.ConsultationResponse update(Long id, ConsultationDtos.ConsultationRequest req) {
        Consultation c = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Consultation", id));
        c.setVitals(toVitals(req.vitals()));
        c.setSymptoms(req.symptoms());
        c.setDiagnosis(req.diagnosis());
        c.setNotes(req.notes());
        c.setDietRecommendation(req.dietRecommendation());
        c.setPanchakarmaRecommendation(req.panchakarmaRecommendation());
        c.setFollowUpNotes(req.followUpNotes());
        c.setFollowUpDate(req.followUpDate());
        c.getPrescriptionItems().clear();
        if (req.prescription() != null) {
            for (ConsultationDtos.PrescriptionItemDto p : req.prescription()) {
                c.getPrescriptionItems().add(PrescriptionItem.builder()
                        .consultation(c)
                        .medicineName(p.medicineName())
                        .dosage(p.dosage())
                        .frequency(p.frequency())
                        .duration(p.duration())
                        .timing(p.timing())
                        .instructions(p.instructions())
                        .build());
            }
        }
        return toResponse(c);
    }

    private Vitals toVitals(ConsultationDtos.VitalsDto v) {
        if (v == null) return null;
        return Vitals.builder()
                .bpSystolic(v.bpSystolic()).bpDiastolic(v.bpDiastolic())
                .pulse(v.pulse()).temperatureC(v.temperatureC())
                .respiratoryRate(v.respiratoryRate()).spo2(v.spo2())
                .weightKg(v.weightKg()).heightCm(v.heightCm())
                .build();
    }

    private ConsultationDtos.VitalsDto toVitalsDto(Vitals v) {
        if (v == null) return null;
        return new ConsultationDtos.VitalsDto(
                v.getBpSystolic(), v.getBpDiastolic(), v.getPulse(), v.getTemperatureC(),
                v.getRespiratoryRate(), v.getSpo2(), v.getWeightKg(), v.getHeightCm());
    }

    ConsultationDtos.ConsultationResponse toResponse(Consultation c) {
        Patient p = c.getPatient();
        String patientName = (p.getFirstName() + " " + (p.getLastName() == null ? "" : p.getLastName())).trim();
        List<ConsultationDtos.PrescriptionItemDto> rx = c.getPrescriptionItems().stream()
                .map(i -> new ConsultationDtos.PrescriptionItemDto(
                        i.getId(), i.getMedicineName(), i.getDosage(),
                        i.getFrequency(), i.getDuration(), i.getTiming(), i.getInstructions()))
                .toList();
        return new ConsultationDtos.ConsultationResponse(
                c.getId(),
                p.getId(), patientName, p.getMrn(),
                c.getDoctor().getId(), c.getDoctor().getName(),
                c.getAppointmentId(),
                c.getConsultationDate(),
                toVitalsDto(c.getVitals()),
                c.getSymptoms(), c.getDiagnosis(), c.getNotes(),
                c.getDietRecommendation(), c.getPanchakarmaRecommendation(),
                c.getFollowUpNotes(), c.getFollowUpDate(),
                rx);
    }
}
