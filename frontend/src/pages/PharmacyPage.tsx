import { FormEvent, useEffect, useState } from 'react';
import api from '../api/client';

export default function PharmacyPage() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({
    sku: '', name: '', manufacturer: '', category: '', unit: 'tablet',
    unitPrice: 0, gstPercent: 12, stockQuantity: 0, reorderLevel: 10, active: true,
  });

  const load = () => api.get('/pharmacy/medicines', { params: { q, size: 100 } }).then((r) => setItems(r.data.content));
  useEffect(() => { load(); }, []);

  const onSearch = (e: FormEvent) => { e.preventDefault(); load(); };
  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/pharmacy/medicines', form);
    setShowForm(false);
    load();
  };
  const adjust = async (id: number, delta: number) => {
    await api.post(`/pharmacy/medicines/${id}/adjust-stock`, { delta });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Pharmacy</h1>
        <button onClick={() => setShowForm(!showForm)}>{showForm ? 'Close' : '+ Add Medicine'}</button>
      </div>

      {showForm && (
        <form className="card" onSubmit={onSave}>
          <div className="grid grid-3">
            <div><label>SKU *</label><input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            <div><label>Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label>Manufacturer</label><input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></div>
            <div><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div><label>Unit</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            <div><label>Unit Price</label><input type="number" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} /></div>
            <div><label>GST %</label><input type="number" step="0.01" value={form.gstPercent} onChange={(e) => setForm({ ...form, gstPercent: Number(e.target.value) })} /></div>
            <div><label>Stock</label><input type="number" value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: Number(e.target.value) })} /></div>
            <div><label>Reorder Level</label><input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} /></div>
          </div>
          <div style={{ marginTop: 12 }}><button type="submit">Save</button></div>
        </form>
      )}

      <form className="card" onSubmit={onSearch} style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Search by name or SKU..." value={q} onChange={(e) => setQ(e.target.value)} />
        <button>Search</button>
      </form>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>SKU</th><th>Name</th><th>Category</th><th>Stock</th><th>Price</th><th>GST</th><th>Adjust</th></tr></thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id}>
                <td>{m.sku}</td>
                <td>{m.name} <small>({m.manufacturer})</small></td>
                <td>{m.category}</td>
                <td style={{ color: m.stockQuantity <= (m.reorderLevel ?? 0) ? '#dc2626' : undefined }}>{m.stockQuantity} {m.unit}</td>
                <td>₹{m.unitPrice}</td>
                <td>{m.gstPercent}%</td>
                <td>
                  <button className="secondary" onClick={() => adjust(m.id, -1)}>-</button>{' '}
                  <button onClick={() => adjust(m.id, 1)}>+</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>No medicines</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
