import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function BillingPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);

  const load = () => {
    api.get('/billing/invoices', { params: { date } }).then((r) => setItems(r.data));
    api.get('/billing/reports/daily-collection', { params: { date } }).then((r) => setReport(r.data));
  };

  useEffect(load, [date]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Billing</h1>
        <Link to="/billing/new"><button>+ New Invoice</button></Link>
      </div>

      <div className="card">
        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: 200 }} />
      </div>

      {report && (
        <div className="grid grid-4">
          <div className="stat"><div><div className="label">Invoices</div><div className="value">{report.invoiceCount}</div></div></div>
          <div className="stat"><div><div className="label">Payments</div><div className="value">{report.paymentCount}</div></div></div>
          <div className="stat"><div><div className="label">Total Billed</div><div className="value">₹{report.totalBilled}</div></div></div>
          <div className="stat"><div><div className="label">Total Collected</div><div className="value">₹{report.totalCollected}</div></div></div>
        </div>
      )}

      <div className="card" style={{ padding: 0, marginTop: 16 }}>
        <table>
          <thead><tr><th>Invoice #</th><th>Patient</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.invoiceNumber}</td>
                <td>{i.patientName}</td>
                <td>₹{i.totalAmount}</td>
                <td>₹{i.paidAmount}</td>
                <td>₹{i.balance}</td>
                <td>{i.status}</td>
                <td><Link to={`/print/invoice/${i.id}`} target="_blank">Print</Link></td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>No invoices</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
