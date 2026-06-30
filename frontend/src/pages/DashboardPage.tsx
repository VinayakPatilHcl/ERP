import { useEffect, useState, ReactNode, MouseEvent } from 'react';
import { Users, CalendarCheck, Wallet, Receipt, PackageMinus, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import api from '../api/client';

interface Summary {
  totalPatients: number;
  todayAppointments: number;
  todayCollection: number;
  todayBilled: number;
  lowStockMedicines: number;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [s, setS] = useState<Summary | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    api.get<Summary>('/dashboard/summary').then((r) => setS(r.data));
  }, []);

  const firstName = (user?.fullName || user?.username || '').split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div>
      <div className="page-header fade-up">
        <div>
          <div className="hello-line">{today}</div>
          <h1>
            {greeting()},{' '}
            <span className="gradient-text">{firstName}</span>
          </h1>
        </div>
        <div className="status-pill" style={{ alignSelf: 'center' }}>
          <Sparkles size={13} /> Live overview
        </div>
      </div>

      <div className="grid grid-4">
        <Stat
          delay={1}
          icon={<Users size={20} />}
          label="Total Patients"
          value={s?.totalPatients}
          loading={!s}
          tone="violet"
        />
        <Stat
          delay={2}
          icon={<CalendarCheck size={20} />}
          label="Today's Appointments"
          value={s?.todayAppointments}
          loading={!s}
          tone="blue"
        />
        <Stat
          delay={3}
          icon={<Wallet size={20} />}
          label="Today's Collection"
          value={s ? `₹${s.todayCollection}` : undefined}
          loading={!s}
          tone="green"
        />
        <Stat
          delay={4}
          icon={<Receipt size={20} />}
          label="Today's Billed"
          value={s ? `₹${s.todayBilled}` : undefined}
          loading={!s}
          tone="amber"
        />
      </div>

      <div className="grid grid-4" style={{ marginTop: 18 }}>
        <Stat
          delay={5}
          icon={<PackageMinus size={20} />}
          label="Low Stock Medicines"
          value={s?.lowStockMedicines}
          loading={!s}
          tone="rose"
        />
      </div>
    </div>
  );
}

type Tone = 'violet' | 'amber' | 'blue' | 'rose' | 'cyan' | 'green';

function Stat({
  label, value, icon, loading, tone = 'violet', delay = 1,
}: {
  label: string;
  value?: ReactNode;
  icon: ReactNode;
  loading?: boolean;
  tone?: Tone;
  delay?: 1 | 2 | 3 | 4 | 5;
}) {
  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };
  return (
    <div className={`stat fade-up d${delay}`} onMouseMove={onMove}>
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <div className="label">{label}</div>
        <div className="value">
          {loading ? <span className="skeleton" style={{ width: 70, height: 26 }} /> : value ?? '—'}
        </div>
      </div>
    </div>
  );
}
