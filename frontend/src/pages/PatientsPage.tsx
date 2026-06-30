import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

interface Patient {
  id: number;
  mrn: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number;
  phone: string;
}

interface PatientForm {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  bloodGroup: string;
  allergies: string;
  medicalHistory: string;
}

const emptyForm: PatientForm = {
  firstName: '', lastName: '', gender: 'MALE', dateOfBirth: '',
  phone: '', email: '', address: '', bloodGroup: '',
  allergies: '', medicalHistory: '',
};

export default function PatientsPage() {
  const [items, setItems] = useState<Patient[]>([]);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PatientForm>(emptyForm);

  const load = () => {
    api.get('/patients', { params: { q, size: 50 } }).then((r) => setItems(r.data.content));
  };

  useEffect(load, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    load();
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/patients', { ...form, dateOfBirth: form.dateOfBirth || null });
    setShowForm(false);
    setForm(emptyForm);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Patients</h1>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : '+ Add Patient'}</button>
      </div>

      {showForm && (
        <form className="card" onSubmit={onCreate}>
          <div className="grid grid-3">
            <div><label>First Name *</label><input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
            <div><label>Last Name</label><input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
            <div><label>Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option>MALE</option><option>FEMALE</option><option>OTHER</option>
              </select>
            </div>
            <div><label>Date of Birth</label><input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
            <div><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label>Blood Group</label><input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} /></div>
            <div style={{ gridColumn: 'span 2' }}><label>Address</label><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div style={{ gridColumn: 'span 3' }}><label>Allergies</label><input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} /></div>
            <div style={{ gridColumn: 'span 3' }}><label>Medical History</label><textarea rows={3} value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} /></div>
          </div>
          <div style={{ marginTop: 12 }}><button type="submit">Save Patient</button></div>
        </form>
      )}

      <form className="card" onSubmit={onSearch} style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Search name, MRN, phone..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button>Search</button>
      </form>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>MRN</th><th>Name</th><th>Gender</th><th>Age</th><th>Phone</th><th></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.mrn}</td>
                <td>{p.firstName} {p.lastName}</td>
                <td>{p.gender}</td>
                <td>{p.age ?? '-'}</td>
                <td>{p.phone}</td>
                <td><Link to={`/patients/${p.id}`}>View</Link></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>No patients</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
