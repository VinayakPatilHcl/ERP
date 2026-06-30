import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api/client';

interface RxItem {
  medicineName: string; dosage: string; frequency: string;
  duration: string; timing: string; instructions: string;
}

const emptyRx: RxItem = { medicineName: '', dosage: '', frequency: '', duration: '', timing: '', instructions: '' };

export default function ConsultationFormPage() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    patientId: search.get('patientId') || '',
    doctorId: '',
    consultationDate: new Date().toISOString().slice(0, 10),
    vitals: {},
    symptoms: '', diagnosis: '', notes: '',
    dietRecommendation: '', panchakarmaRecommendation: '',
    followUpNotes: '', followUpDate: '',
    prescription: [] as RxItem[],
  });

  useEffect(() => {
    api.get('/patients', { params: { size: 200 } }).then((r) => setPatients(r.data.content));
    api.get('/doctors').then((r) => setDoctors(r.data));
    if (id) {
      api.get(`/consultations/${id}`).then((r) => {
        const c = r.data;
        setForm({
          ...c,
          patientId: String(c.patientId),
          doctorId: String(c.doctorId),
          vitals: c.vitals || {},
          prescription: c.prescription || [],
        });
      });
    }
  }, [id]);

  const setVitals = (k: string, v: any) => setForm({ ...form, vitals: { ...form.vitals, [k]: v === '' ? null : Number(v) } });

  const addRx = () => setForm({ ...form, prescription: [...form.prescription, { ...emptyRx }] });
  const updateRx = (i: number, k: keyof RxItem, v: string) => {
    const list = [...form.prescription];
    list[i] = { ...list[i], [k]: v };
    setForm({ ...form, prescription: list });
  };
  const removeRx = (i: number) => setForm({ ...form, prescription: form.prescription.filter((_: any, j: number) => j !== i) });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      patientId: Number(form.patientId),
      doctorId: Number(form.doctorId),
      followUpDate: form.followUpDate || null,
    };
    const r = isEdit
      ? await api.put(`/consultations/${id}`, payload)
      : await api.post('/consultations', payload);
    navigate(`/consultations/${r.data.id}`);
  };

  return (
    <div>
      <h1>{isEdit ? 'Edit' : 'New'} Consultation</h1>
      <form onSubmit={onSubmit}>
        <div className="card">
          <div className="grid grid-3">
            <div><label>Patient *</label>
              <select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                <option value="">Select...</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.mrn} - {p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div><label>Doctor *</label>
              <select required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
                <option value="">Select...</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><label>Date</label><input type="date" value={form.consultationDate} onChange={(e) => setForm({ ...form, consultationDate: e.target.value })} /></div>
          </div>
        </div>

        <div className="card">
          <h3>Vitals</h3>
          <div className="grid grid-4">
            <div><label>BP Systolic</label><input type="number" value={form.vitals.bpSystolic ?? ''} onChange={(e) => setVitals('bpSystolic', e.target.value)} /></div>
            <div><label>BP Diastolic</label><input type="number" value={form.vitals.bpDiastolic ?? ''} onChange={(e) => setVitals('bpDiastolic', e.target.value)} /></div>
            <div><label>Pulse</label><input type="number" value={form.vitals.pulse ?? ''} onChange={(e) => setVitals('pulse', e.target.value)} /></div>
            <div><label>Temp (°C)</label><input type="number" step="0.1" value={form.vitals.temperatureC ?? ''} onChange={(e) => setVitals('temperatureC', e.target.value)} /></div>
            <div><label>Resp. Rate</label><input type="number" value={form.vitals.respiratoryRate ?? ''} onChange={(e) => setVitals('respiratoryRate', e.target.value)} /></div>
            <div><label>SpO₂ (%)</label><input type="number" value={form.vitals.spo2 ?? ''} onChange={(e) => setVitals('spo2', e.target.value)} /></div>
            <div><label>Weight (kg)</label><input type="number" step="0.1" value={form.vitals.weightKg ?? ''} onChange={(e) => setVitals('weightKg', e.target.value)} /></div>
            <div><label>Height (cm)</label><input type="number" step="0.1" value={form.vitals.heightCm ?? ''} onChange={(e) => setVitals('heightCm', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h3>Clinical Notes</h3>
          <div><label>Symptoms</label><textarea rows={3} value={form.symptoms || ''} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} /></div>
          <div><label>Diagnosis</label><textarea rows={3} value={form.diagnosis || ''} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} /></div>
          <div><label>Notes</label><textarea rows={3} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="grid grid-2">
            <div><label>Diet Recommendation</label><textarea rows={3} value={form.dietRecommendation || ''} onChange={(e) => setForm({ ...form, dietRecommendation: e.target.value })} /></div>
            <div><label>Panchakarma Recommendation</label><textarea rows={3} value={form.panchakarmaRecommendation || ''} onChange={(e) => setForm({ ...form, panchakarmaRecommendation: e.target.value })} /></div>
          </div>
          <div className="grid grid-2">
            <div><label>Follow-up Notes</label><textarea rows={2} value={form.followUpNotes || ''} onChange={(e) => setForm({ ...form, followUpNotes: e.target.value })} /></div>
            <div><label>Follow-up Date</label><input type="date" value={form.followUpDate || ''} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} /></div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Prescription</h3>
            <button type="button" onClick={addRx}>+ Add Medicine</button>
          </div>
          <table>
            <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Timing</th><th>Instructions</th><th></th></tr></thead>
            <tbody>
              {form.prescription.map((p: RxItem, i: number) => (
                <tr key={i}>
                  <td><input value={p.medicineName} onChange={(e) => updateRx(i, 'medicineName', e.target.value)} /></td>
                  <td><input value={p.dosage} onChange={(e) => updateRx(i, 'dosage', e.target.value)} /></td>
                  <td><input value={p.frequency} placeholder="1-0-1" onChange={(e) => updateRx(i, 'frequency', e.target.value)} /></td>
                  <td><input value={p.duration} placeholder="5 days" onChange={(e) => updateRx(i, 'duration', e.target.value)} /></td>
                  <td><input value={p.timing} placeholder="After food" onChange={(e) => updateRx(i, 'timing', e.target.value)} /></td>
                  <td><input value={p.instructions} onChange={(e) => updateRx(i, 'instructions', e.target.value)} /></td>
                  <td><button type="button" className="danger" onClick={() => removeRx(i)}>X</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">{isEdit ? 'Update' : 'Save'} Consultation</button>
          {isEdit && <Link to={`/print/prescription/${id}`} target="_blank"><button type="button" className="secondary">Print Prescription</button></Link>}
        </div>
      </form>
    </div>
  );
}
