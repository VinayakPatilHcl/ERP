package com.hospital.erp.consultation;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    List<Consultation> findByPatientIdOrderByConsultationDateDesc(Long patientId);
}
