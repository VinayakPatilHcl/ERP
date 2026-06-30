package com.hospital.erp.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByAppointmentDateOrderByTokenNumberAsc(LocalDate date);

    List<Appointment> findByDoctorIdAndAppointmentDateOrderByTokenNumberAsc(Long doctorId, LocalDate date);

    List<Appointment> findByAppointmentDateBetweenOrderByAppointmentDateAscAppointmentTimeAsc(
            LocalDate from, LocalDate to);

    List<Appointment> findByPatientIdOrderByAppointmentDateDescAppointmentTimeDesc(Long patientId);

    @Query("SELECT COALESCE(MAX(a.tokenNumber), 0) FROM Appointment a " +
            "WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date")
    Integer findMaxToken(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);
}
