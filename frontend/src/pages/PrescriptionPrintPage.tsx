import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import api from '../api/client';

interface PrescriptionItem {
  medicineName: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  timing?: string;
  notes?: string;
}

interface Vitals {
  bpSystolic?: number;
  bpDiastolic?: number;
  pulse?: number;
  temperatureC?: number;
  spo2?: number;
  weightKg?: number;
  heightCm?: number;
  respiratoryRate?: number;
}

interface Consultation {
  id: number;
  patientName: string;
  patientMrn: string;
  patientGender?: string;
  patientAge?: number | string;
  doctorName: string;
  doctorRegistration?: string;
  consultationDate: string;
  symptoms?: string;
  diagnosis?: string;
  vitals?: Vitals;
  prescription?: PrescriptionItem[];
  dietRecommendation?: string;
  panchakarmaRecommendation?: string;
  followUpDate?: string;
  followUpNotes?: string;
  advice?: string;
}

interface ClinicSettings {
  clinicName: string;
  address?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  registration?: string;
  prescriptionFooter?: string;
  letterheadTagline?: string;
  logoUrl?: string;
}

function initials(s: string) {
  return s
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(d?: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

export default function PrescriptionPrintPage() {
  const { id } = useParams();
  const [c, setC] = useState<Consultation | null>(null);
  const [s, setS] = useState<ClinicSettings | null>(null);

  useEffect(() => {
    api.get(`/consultations/${id}`).then((r) => setC(r.data));
    api.get('/settings/clinic').then((r) => setS(r.data));
  }, [id]);

  useEffect(() => {
    if (c && s) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [c, s]);

  if (!c || !s) {
    return (
      <div className="rx-page">
        <div className="rx-sheet" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
          Loading prescription…
        </div>
      </div>
    );
  }

  const v = c.vitals || {};
  const meds = c.prescription || [];

  return (
    <div className="rx-page">
      <div className="rx-sheet">
        {/* Letterhead */}
        <header className="rx-header">
          <div className={`rx-logo ${s.logoUrl ? 'has-img' : ''}`}>
            {s.logoUrl
              ? <img src={s.logoUrl} alt={s.clinicName} />
              : <span>{initials(s.clinicName || 'HX')}</span>}
          </div>
          <div className="rx-header-text">
            <h1 className="rx-clinic-name">{s.clinicName}</h1>
            <div className="rx-clinic-tag">{s.letterheadTagline || 'Prescription · Confidential'}</div>
            <div className="rx-clinic-meta">
              {s.address && <span>{s.address}</span>}
              {s.phone && <><span className="dot-sep">·</span><span><b>Ph</b> {s.phone}</span></>}
              {s.email && <><span className="dot-sep">·</span><span><b>Email</b> {s.email}</span></>}
              {s.registration && <><span className="dot-sep">·</span><span><b>Reg</b> {s.registration}</span></>}
              {s.gstin && <><span className="dot-sep">·</span><span><b>GSTIN</b> {s.gstin}</span></>}
            </div>
          </div>
          <div className="rx-rx-mark" aria-label="Prescription">℞</div>
        </header>

        {/* Patient / Doctor / Date strip */}
        <section className="rx-info">
          <div className="field">
            <div className="lbl">Patient</div>
            <div className="val">{c.patientName}</div>
            <div className="sub">
              MRN {c.patientMrn}
              {c.patientGender && ` · ${c.patientGender}`}
              {c.patientAge != null && ` · ${c.patientAge} yrs`}
            </div>
          </div>
          <div className="field">
            <div className="lbl">Date</div>
            <div className="val">{formatDate(c.consultationDate)}</div>
            <div className="sub">
              <b>Doctor</b> {c.doctorName}
              {c.doctorRegistration && ` · ${c.doctorRegistration}`}
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="rx-body">
          {/* Vitals */}
          {(v.bpSystolic || v.pulse || v.temperatureC || v.spo2 || v.weightKg || v.heightCm) && (
            <div className="rx-section">
              <div className="rx-section-title">Vitals</div>
              <div className="rx-vitals">
                {v.bpSystolic && (
                  <span className="rx-vital-chip">
                    <span className="k">BP</span>
                    <span className="v">{v.bpSystolic}/{v.bpDiastolic}</span>
                    <span className="k">mmHg</span>
                  </span>
                )}
                {v.pulse && (
                  <span className="rx-vital-chip">
                    <span className="k">Pulse</span>
                    <span className="v">{v.pulse}</span>
                    <span className="k">bpm</span>
                  </span>
                )}
                {v.temperatureC && (
                  <span className="rx-vital-chip">
                    <span className="k">Temp</span>
                    <span className="v">{v.temperatureC}</span>
                    <span className="k">°C</span>
                  </span>
                )}
                {v.spo2 && (
                  <span className="rx-vital-chip">
                    <span className="k">SpO₂</span>
                    <span className="v">{v.spo2}</span>
                    <span className="k">%</span>
                  </span>
                )}
                {v.weightKg && (
                  <span className="rx-vital-chip">
                    <span className="k">Wt</span>
                    <span className="v">{v.weightKg}</span>
                    <span className="k">kg</span>
                  </span>
                )}
                {v.heightCm && (
                  <span className="rx-vital-chip">
                    <span className="k">Ht</span>
                    <span className="v">{v.heightCm}</span>
                    <span className="k">cm</span>
                  </span>
                )}
                {v.respiratoryRate && (
                  <span className="rx-vital-chip">
                    <span className="k">RR</span>
                    <span className="v">{v.respiratoryRate}</span>
                    <span className="k">/min</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {c.symptoms && (
            <div className="rx-section">
              <div className="rx-section-title">Complaints / Symptoms</div>
              <div className="rx-section-body">{c.symptoms}</div>
            </div>
          )}

          {c.diagnosis && (
            <div className="rx-section">
              <div className="rx-section-title">Diagnosis</div>
              <div className="rx-section-body">{c.diagnosis}</div>
            </div>
          )}

          {meds.length > 0 && (
            <div className="rx-section">
              <div className="rx-section-title">Medication</div>
              <table className="rx-meds">
                <thead>
                  <tr>
                    <th style={{ width: 28 }}>#</th>
                    <th>Medicine</th>
                    <th style={{ width: 110 }}>Dosage</th>
                    <th style={{ width: 130 }}>Frequency</th>
                    <th style={{ width: 110 }}>Duration</th>
                    <th style={{ width: 130 }}>Timing</th>
                  </tr>
                </thead>
                <tbody>
                  {meds.map((p, i) => (
                    <tr key={i}>
                      <td className="idx">{String(i + 1).padStart(2, '0')}</td>
                      <td className="med-name">
                        {p.medicineName}
                        {p.notes && <div style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 500, marginTop: 2 }}>{p.notes}</div>}
                      </td>
                      <td>{p.dosage || '—'}</td>
                      <td>{p.frequency || '—'}</td>
                      <td>{p.duration || '—'}</td>
                      <td>{p.timing || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {c.dietRecommendation && (
            <div className="rx-section">
              <div className="rx-section-title">Diet</div>
              <div className="rx-section-body">{c.dietRecommendation}</div>
            </div>
          )}

          {c.panchakarmaRecommendation && (
            <div className="rx-section">
              <div className="rx-section-title">Panchakarma / Therapy</div>
              <div className="rx-section-body">{c.panchakarmaRecommendation}</div>
            </div>
          )}

          {c.advice && (
            <div className="rx-section">
              <div className="rx-section-title">Advice</div>
              <div className="rx-section-body">{c.advice}</div>
            </div>
          )}

          {c.followUpDate && (
            <div className="rx-followup">
              <b>Follow-up:</b> {formatDate(c.followUpDate)}
              {c.followUpNotes && <span style={{ color: '#4b5563' }}>· {c.followUpNotes}</span>}
            </div>
          )}
        </section>

        {/* Signature */}
        <section className="rx-signature">
          <div className="left">
            This prescription is issued for the named patient only. Please complete the full course
            of medication as advised. Contact the clinic for any adverse reactions.
          </div>
          <div className="right">
            <div className="rx-sig-line">{c.doctorName}</div>
            <div className="rx-sig-sub">
              {c.doctorRegistration ? `Reg. ${c.doctorRegistration}` : 'Consulting Physician'}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="rx-footer">
          <div>
            {s.prescriptionFooter || `© ${new Date().getFullYear()} ${s.clinicName}. All rights reserved.`}
          </div>
          <div className="brand-credit">Hospital ERP</div>
        </footer>
      </div>

      {/* On-screen controls (hidden on print) */}
      <div className="rx-actions">
        <button className="secondary" onClick={() => window.history.back()}>
          <ArrowLeft size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Back
        </button>
        <button onClick={() => window.print()}>
          <Printer size={14} style={{ verticalAlign: -2, marginRight: 6 }} />
          Print
        </button>
      </div>
    </div>
  );
}
