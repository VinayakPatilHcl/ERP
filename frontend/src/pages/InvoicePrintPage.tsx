import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import api from '../api/client';

interface InvoiceItem {
  id?: number;
  type?: string;
  description?: string;
  hsnSac?: string;
  quantity?: number;
  unitPrice?: number;
  discountPercent?: number;
  gstPercent?: number;
  lineTotal?: number;
}

interface Payment {
  id: number;
  paymentDate?: string;
  amount?: number;
  method?: string;
  referenceNo?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  patientName: string;
  patientMrn: string;
  invoiceDate?: string;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  paidAmount?: number;
  balance?: number;
  status?: string;
  notes?: string;
  items: InvoiceItem[];
  payments?: Payment[];
}

interface ClinicSettings {
  clinicName: string;
  address?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  registration?: string;
  currency?: string;
  invoiceFooter?: string;
  letterheadTagline?: string;
  logoUrl?: string;
}

function initials(s?: string) {
  if (!s) return 'HX';
  return s.split(/\s+/).map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

function formatDate(d?: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return d;
  }
}

function money(n?: number, currency = 'INR') {
  const v = typeof n === 'number' ? n : Number(n || 0);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency', currency, maximumFractionDigits: 2,
    }).format(v);
  } catch {
    return `₹${v.toFixed(2)}`;
  }
}

export default function InvoicePrintPage() {
  const { id } = useParams();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [s, setS] = useState<ClinicSettings | null>(null);

  useEffect(() => {
    api.get(`/billing/invoices/${id}`).then((r) => setInv(r.data));
    api.get('/settings/clinic').then((r) => setS(r.data));
  }, [id]);

  useEffect(() => {
    if (inv && s) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [inv, s]);

  if (!inv || !s) {
    return (
      <div className="rx-page">
        <div className="rx-sheet" style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
          Loading invoice…
        </div>
      </div>
    );
  }

  const cur = s.currency || 'INR';
  const items = inv.items || [];
  const statusKey = (inv.status || 'UNPAID').toLowerCase();
  const tagline = s.letterheadTagline || 'Tax Invoice · Original for recipient';

  return (
    <div className="rx-page">
      <div className="rx-sheet">
        {/* Letterhead */}
        <header className="rx-header">
          <div className={`rx-logo ${s.logoUrl ? 'has-img' : ''}`}>
            {s.logoUrl
              ? <img src={s.logoUrl} alt={s.clinicName} />
              : <span>{initials(s.clinicName)}</span>}
          </div>
          <div className="rx-header-text">
            <h1 className="rx-clinic-name">{s.clinicName}</h1>
            <div className="rx-clinic-tag">{tagline}</div>
            <div className="rx-clinic-meta">
              {s.address && <span>{s.address}</span>}
              {s.phone && <><span className="dot-sep">·</span><span><b>Ph</b> {s.phone}</span></>}
              {s.email && <><span className="dot-sep">·</span><span><b>Email</b> {s.email}</span></>}
              {s.registration && <><span className="dot-sep">·</span><span><b>Reg</b> {s.registration}</span></>}
              {s.gstin && <><span className="dot-sep">·</span><span><b>GSTIN</b> {s.gstin}</span></>}
            </div>
          </div>
        </header>

        {/* Title + invoice # pill */}
        <div className="inv-title-row">
          <div className="doc-title">
            <small>Tax invoice</small>
            Invoice
          </div>
          <span className="inv-meta-pill">#{inv.invoiceNumber}</span>
        </div>

        {/* Info strip */}
        <section className="rx-info">
          <div className="field">
            <div className="lbl">Bill to</div>
            <div className="val">{inv.patientName}</div>
            <div className="sub">MRN {inv.patientMrn}</div>
          </div>
          <div className="field">
            <div className="lbl">Issued</div>
            <div className="val">{formatDate(inv.invoiceDate)}</div>
            <div className="sub" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Status</span>
              <span className={`inv-status ${statusKey}`}>{inv.status || 'UNPAID'}</span>
            </div>
          </div>
        </section>

        {/* Items + totals */}
        <section className="rx-body">
          <div className="rx-section">
            <div className="rx-section-title">Line items</div>
            <table className="inv-items">
              <thead>
                <tr>
                  <th style={{ width: 28 }}>#</th>
                  <th>Description</th>
                  <th className="ctr" style={{ width: 70 }}>HSN</th>
                  <th className="ctr" style={{ width: 50 }}>Qty</th>
                  <th className="num" style={{ width: 90 }}>Rate</th>
                  <th className="ctr" style={{ width: 60 }}>Disc%</th>
                  <th className="ctr" style={{ width: 60 }}>GST%</th>
                  <th className="num" style={{ width: 100 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="idx">{String(i + 1).padStart(2, '0')}</td>
                    <td className="desc">
                      {it.description || '—'}
                      {it.type && <small>{it.type}</small>}
                    </td>
                    <td className="ctr">{it.hsnSac || '—'}</td>
                    <td className="ctr">{it.quantity ?? '—'}</td>
                    <td className="num">{money(it.unitPrice, cur)}</td>
                    <td className="ctr">{it.discountPercent ?? 0}%</td>
                    <td className="ctr">{it.gstPercent ?? 0}%</td>
                    <td className="num">{money(it.lineTotal, cur)}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#6b7280', padding: 14 }}>No line items</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="inv-bottom">
            <div className="notes">
              {inv.notes ? (
                <>
                  <b>Notes</b>
                  {inv.notes}
                </>
              ) : (
                <>
                  <b>Payment terms</b>
                  Payable on receipt. Cheques to be drawn in favour of {s.clinicName}. Late payments
                  may attract interest as per applicable law.
                </>
              )}
            </div>

            <div className="inv-totals">
              <div className="row muted"><span>Subtotal</span><span className="v">{money(inv.subtotal, cur)}</span></div>
              <div className="row muted"><span>Discount</span><span className="v">− {money(inv.discountAmount, cur)}</span></div>
              <div className="row muted"><span>Tax (GST)</span><span className="v">{money(inv.taxAmount, cur)}</span></div>
              <div className="divider" />
              <div className="grand">
                <span className="k">Total due</span>
                <span className="v">{money(inv.totalAmount, cur)}</span>
              </div>
              <div className="row" style={{ marginTop: 8 }}>
                <span>Paid</span>
                <span className="v" style={{ color: '#15803d' }}>{money(inv.paidAmount, cur)}</span>
              </div>
              <div className={`row balance ${Number(inv.balance) <= 0 ? 'paid' : ''}`}>
                <span><b>Balance</b></span>
                <span className="v">{money(inv.balance, cur)}</span>
              </div>
            </div>
          </div>

          {inv.payments && inv.payments.length > 0 && (
            <div className="inv-payments">
              <div className="rx-section-title">Payments received</div>
              <table className="inv-payments-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.payments.map((p) => (
                    <tr key={p.id}>
                      <td>{formatDate(p.paymentDate)}</td>
                      <td>{p.method}</td>
                      <td>{p.referenceNo || '—'}</td>
                      <td className="amt">{money(p.amount, cur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Signature */}
        <section className="rx-signature">
          <div className="left">
            This is a computer-generated invoice and does not require a physical signature. Please
            verify all details and contact accounts for any discrepancies within 7 days.
          </div>
          <div className="right">
            <div className="rx-sig-line">For {s.clinicName}</div>
            <div className="rx-sig-sub">Authorised signatory</div>
          </div>
        </section>

        {/* Footer */}
        <footer className="rx-footer">
          <div>
            {s.invoiceFooter || `Thank you for choosing ${s.clinicName}.`}
          </div>
          <div className="brand-credit">Hospital ERP</div>
        </footer>
      </div>

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
