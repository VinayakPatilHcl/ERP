package com.hospital.erp.appointment;

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
public class AppointmentService {

    private final AppointmentRepository repo;
    private final PatientRepository patientRepo;
    private final DoctorRepository doctorRepo;

    @Transactional(readOnly = true)
    public List<AppointmentDtos.AppointmentResponse> today() {
        return repo.findByAppointmentDateOrderByTokenNumberAsc(LocalDate.now())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentDtos.AppointmentResponse> byDate(LocalDate date, Long doctorId) {
        List<Appointment> list = (doctorId == null)
                ? repo.findByAppointmentDateOrderByTokenNumberAsc(date)
                : repo.findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(doctorId, date);
        return list.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentDtos.AppointmentResponse> calendar(LocalDate from, LocalDate to) {
        return repo.findByAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(from, to)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<AppointmentDtos.AppointmentResponse> byPatient(Long patientId) {
        return repo.findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(patientId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public AppointmentDtos.AppointmentResponse book(AppointmentDtos.AppointmentRequest req) {
        Patient patient = patientRepo.findById(req.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", req.patientId()));
        Doctor doctor = doctorRepo.findById(req.doctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", req.doctorId()));

        Integer maxToken = repo.findMaxToken(doctor.getId(), req.appointmentDate());
        int token = (maxToken == null ? 0 : maxToken) + 1;

        Appointment a = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(req.appointmentDate())
                .appointmentTime(req.appointmentTime())
                .tokenNumber(token)
                .status(AppointmentStatus.SCHEDULED)
                .reason(req.reason())
                .followUp(req.followUp())
                .parentAppointmentId(req.parentAppointmentId())
                .build();
        return toResponse(repo.save(a));
    }

    @Transactional
    public AppointmentDtos.AppointmentResponse updateStatus(Long id, AppointmentStatus status) {
        Appointment a = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        a.setStatus(status);
        return toResponse(a);
    }

    @Transactional
    public void cancel(Long id) {
        Appointment a = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Appointment", id));
        a.setStatus(AppointmentStatus.CANCELLED);
    }

    AppointmentDtos.AppointmentResponse toResponse(Appointment a) {
        Patient p = a.getPatient();
        Doctor d = a.getDoctor();
        String patientName = (p.getFirstName() + " " + (p.getLastName() == null ? "" : p.getLastName())).trim();
        return new AppointmentDtos.AppointmentResponse(
                a.getId(),
                p.getId(), patientName, p.getMrn(),
                d.getId(), d.getName(),
                a.getAppointmentDate(), a.getAppointmentTime(), a.getTokenNumber(),
                a.getStatus(), a.getReason(), a.isFollowUp(), a.getParentAppointmentId());
    }
}
