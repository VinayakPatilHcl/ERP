import { FormEvent, useEffect, useState } from 'react';
import api from '../api/client';

export default function AppointmentsPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientId: '', doctorId: '', appointmentDate: date,
    appointmentTime: '10:00', reason: '', followUp: false,
  });

  const load = () => {
    api.get('/appointments', { params: { date } }).then((r) => setItems(r.data));
  };

  useEffect(load, [date]);
  useEffect(() => {
    api.get('/doctors').then((r) => setDoctors(r.data));
    api.get('/patients', { params: { size: 100 } }).then((r) => setPatients(r.data.content));
  }, []);

  const book = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/appointments', {
      ...form,
      patientId: Number(form.patientId),
      doctorId: Number(form.doctorId),
    });
    setShowForm(false);
    load();
  };

  const updateStatus = async (id: number, status: string) => {
    await api.patch(`/appointments/${id}/status`, { status });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Appointments</h1>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : '+ Book Appointment'}</button>
      </div>

      {showForm && (
        <form className="card" onSubmit={book}>
          <div className="grid grid-3">
            <div><label>Patient</label>
              <select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                <option value="">Select...</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.mrn} - {p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div><label>Doctor</label>
              <select required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
                <option value="">Select...</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
              </select>
            </div>
            <div><label>Date</label><input type="date" required value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} /></div>
            <div><label>Time</label><input type="time" required value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} /></div>
            <div style={{ gridColumn: 'span 2' }}><label>Reason</label><input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
            <div><label><input type="checkbox" checked={form.followUp} onChange={(e) => setForm({ ...form, followUp: e.target.checked })} /> Follow-up</label></div>
          </div>
          <div style={{ marginTop: 12 }}><button type="submit">Book</button></div>
        </form>
      )}

      <div className="card">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 200 }} />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Token</th><th>Time</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>#{a.tokenNumber}</td>
                <td>{a.appointmentTime}</td>
                <td>{a.patientName} ({a.patientMrn})</td>
                <td>{a.doctorName}</td>
                <td><span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span></td>
                <td>
                  <select value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
                    {['SCHEDULED','CHECKED_IN','IN_CONSULTATION','COMPLETED','CANCELLED','NO_SHOW'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>No appointments</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
