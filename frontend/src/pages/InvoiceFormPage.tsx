import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Item {
  type: string; description: string; hsnSac: string;
  quantity: number; unitPrice: number; discountPercent: number; gstPercent: number;
}

const blank: Item = { type: 'CONSULTATION', description: '', hsnSac: '', quantity: 1, unitPrice: 0, discountPercent: 0, gstPercent: 0 };

export default function InvoiceFormPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [patientId, setPatientId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Item[]>([{ ...blank }]);

  useEffect(() => {
    api.get('/patients', { params: { size: 200 } }).then((r) => setPatients(r.data.content));
  }, []);

  const update = (i: number, k: keyof Item, v: any) => {
    const list = [...items];
    (list[i] as any)[k] = (k === 'quantity' || k === 'unitPrice' || k === 'discountPercent' || k === 'gstPercent') ? Number(v) : v;
    setItems(list);
  };
  const addRow = () => setItems([...items, { ...blank }]);
  const removeRow = (i: number) => setItems(items.filter((_, j) => j !== i));

  const calcLine = (it: Item) => {
    const gross = it.quantity * it.unitPrice;
    const afterDisc = gross - gross * (it.discountPercent / 100);
    const tax = afterDisc * (it.gstPercent / 100);
    return afterDisc + tax;
  };

  const subtotal = items.reduce((s, it) => s + (it.quantity * it.unitPrice * (1 - it.discountPercent / 100)), 0);
  const tax = items.reduce((s, it) => {
    const after = it.quantity * it.unitPrice * (1 - it.discountPercent / 100);
    return s + after * (it.gstPercent / 100);
  }, 0);
  const total = Math.max(0, subtotal + tax - discount);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = await api.post('/billing/invoices', {
      patientId: Number(patientId),
      discountAmount: discount,
      notes,
      items,
    });
    navigate(`/print/invoice/${r.data.id}`);
  };

  return (
    <div>
      <h1>New Invoice</h1>
      <form onSubmit={submit}>
        <div className="card">
          <div className="grid grid-3">
            <div><label>Patient *</label>
              <select required value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                <option value="">Select...</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.mrn} - {p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div><label>Discount Amount</label><input type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} /></div>
            <div><label>Notes</label><input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Items</h3>
            <button type="button" onClick={addRow}>+ Add Row</button>
          </div>
          <table>
            <thead><tr><th>Type</th><th>Description</th><th>HSN/SAC</th><th>Qty</th><th>Price</th><th>Disc%</th><th>GST%</th><th>Total</th><th></th></tr></thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>
                    <select value={it.type} onChange={(e) => update(i, 'type', e.target.value)}>
                      {['CONSULTATION', 'MEDICINE', 'TREATMENT', 'PROCEDURE', 'OTHER'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </td>
                  <td><input value={it.description} onChange={(e) => update(i, 'description', e.target.value)} /></td>
                  <td><input value={it.hsnSac} onChange={(e) => update(i, 'hsnSac', e.target.value)} /></td>
                  <td style={{ width: 80 }}><input type="number" step="0.01" value={it.quantity} onChange={(e) => update(i, 'quantity', e.target.value)} /></td>
                  <td style={{ width: 100 }}><input type="number" step="0.01" value={it.unitPrice} onChange={(e) => update(i, 'unitPrice', e.target.value)} /></td>
                  <td style={{ width: 80 }}><input type="number" step="0.01" value={it.discountPercent} onChange={(e) => update(i, 'discountPercent', e.target.value)} /></td>
                  <td style={{ width: 80 }}><input type="number" step="0.01" value={it.gstPercent} onChange={(e) => update(i, 'gstPercent', e.target.value)} /></td>
                  <td>₹{calcLine(it).toFixed(2)}</td>
                  <td><button type="button" className="danger" onClick={() => removeRow(i)}>X</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
            <div>Tax: ₹{tax.toFixed(2)}</div>
            <div>Discount: ₹{discount.toFixed(2)}</div>
            <h3>Total: ₹{total.toFixed(2)}</h3>
          </div>
        </div>

        <button type="submit">Create Invoice</button>
      </form>
    </div>
  );
}
