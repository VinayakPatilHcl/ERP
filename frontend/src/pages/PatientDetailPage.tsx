import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [appts, setAppts] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    api.get(`/patients/${id}`).then((r) => setPatient(r.data));
    api.get(`/consultations/patient/${id}`).then((r) => setVisits(r.data));
    api.get(`/appointments/patient/${id}`).then((r) => setAppts(r.data));
  }, [id]);

  if (!patient) return <div>Loading...</div>;

  return (
    <div>
      <h1>{patient.firstName} {patient.lastName}</h1>
      <div className="card">
        <div className="grid grid-3">
          <div><b>MRN:</b> {patient.mrn}</div>
          <div><b>Gender:</b> {patient.gender}</div>
          <div><b>Age:</b> {patient.age ?? '-'}</div>
          <div><b>Phone:</b> {patient.phone}</div>
          <div><b>Email:</b> {patient.email}</div>
          <div><b>Blood:</b> {patient.bloodGroup}</div>
          <div style={{ gridColumn: 'span 3' }}><b>Address:</b> {patient.address}</div>
          <div style={{ gridColumn: 'span 3' }}><b>Allergies:</b> {patient.allergies}</div>
          <div style={{ gridColumn: 'span 3' }}><b>Medical History:</b><br />{patient.medicalHistory}</div>
        </div>
      </div>

      <div className="card">
        <h3>Visit History (Consultations)</h3>
        <table>
          <thead><tr><th>Date</th><th>Doctor</th><th>Diagnosis</th><th></th></tr></thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v.id}>
                <td>{v.consultationDate}</td>
                <td>{v.doctorName}</td>
                <td>{v.diagnosis}</td>
                <td><Link to={`/consultations/${v.id}`}>Open</Link></td>
              </tr>
            ))}
            {visits.length === 0 && <tr><td colSpan={4} style={{ color: '#6b7280' }}>No visits yet</td></tr>}
          </tbody>
        </table>
        <Link to={`/consultations/new?patientId=${patient.id}`}><button style={{ marginTop: 12 }}>+ New Consultation</button></Link>
      </div>

      <div className="card">
        <h3>Appointments</h3>
        <table>
          <thead><tr><th>Date</th><th>Time</th><th>Token</th><th>Doctor</th><th>Status</th></tr></thead>
          <tbody>
            {appts.map((a) => (
              <tr key={a.id}>
                <td>{a.appointmentDate}</td><td>{a.appointmentTime}</td>
                <td>{a.tokenNumber}</td><td>{a.doctorName}</td><td>{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
