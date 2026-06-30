import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import api from '../api/client';
import {
  LayoutDashboard, Users, Calendar, Stethoscope, Receipt,
  Pill, Settings, ShieldCheck, LogOut, User as UserIcon, ChevronDown, Hospital,
  Search, Sun, Moon, SunMoon, Sparkles, Leaf,
  PanelLeft, PanelLeftClose, LayoutPanelTop,
  Plus, FilePlus2, UserPlus, CalendarClock,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/appointments', label: 'Appointments', icon: Calendar },
  { to: '/consultations', label: 'Consultations', icon: Stethoscope },
  { to: '/billing', label: 'Billing', icon: Receipt },
  { to: '/pharmacy', label: 'Pharmacy', icon: Pill },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/users', label: 'Users', adminOnly: true, icon: ShieldCheck },
];

interface Clinic {
  clinicName: string;
  address?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  logoUrl?: string;
}

type Theme = 'dark' | 'dim' | 'light' | 'ayurveda';
const THEME_ORDER: Theme[] = ['dark', 'dim', 'light', 'ayurveda'];

type LayoutMode = 'expanded' | 'rail' | 'top';
const LAYOUT_ORDER: LayoutMode[] = ['expanded', 'rail', 'top'];
const LAYOUT_META: Record<LayoutMode, { label: string; next: string; Icon: typeof PanelLeft }> = {
  expanded: { label: 'Expanded sidebar',  next: 'Switch to rail',     Icon: PanelLeft },
  rail:     { label: 'Rail (hover to expand)', next: 'Switch to top bar', Icon: PanelLeftClose },
  top:      { label: 'Top navigation',   next: 'Switch to expanded', Icon: LayoutPanelTop },
};

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dim';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'dim' || stored === 'ayurveda') return stored;
  return 'dim';
}

function getInitialLayout(): LayoutMode {
  if (typeof window === 'undefined') return 'expanded';
  const stored = localStorage.getItem('layout');
  if (stored === 'expanded' || stored === 'rail' || stored === 'top') return stored;
  return 'expanded';
}

export default function Layout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [layout, setLayout] = useState<LayoutMode>(getInitialLayout);
  const menuRef = useRef<HTMLDivElement>(null);
  const topnavRef = useRef<HTMLElement>(null);
  const visibleLinks = links.filter((l) => !l.adminOnly || hasRole('ADMIN'));

  useEffect(() => {
    api.get('/settings/clinic').then((r) => setClinic(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-layout', layout);
    try { localStorage.setItem('layout', layout); } catch { /* ignore */ }
  }, [layout]);

  useEffect(() => {
    if (layout !== 'top' || !topnavRef.current) return;
    const active = topnavRef.current.querySelector('a.active') as HTMLElement | null;
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [layout, location.pathname]);

  const LayoutIcon = LAYOUT_META[layout].Icon;

  const displayRoles = (user?.roles || []).map((r) => r.replace(/^ROLE_/, '')).join(', ');
  const initials = (user?.fullName || user?.username || '?')
    .split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <div className="aurora" aria-hidden="true">
        <div className="blob3" />
      </div>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className={`brand-mark ${clinic?.logoUrl ? 'has-img' : ''}`}>
              {clinic?.logoUrl ? <img src={clinic.logoUrl} alt="" /> : <Hospital size={18} />}
            </div>
            <div className="brand-text">
              <div>{clinic?.clinicName || 'Hospital ERP'}</div>
              <div className="brand-sub">AI-assisted care</div>
            </div>
          </div>
          <div className="nav-section-label">Main</div>
          {visibleLinks.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink key={l.to} to={l.to} end={l.end} title={l.label}>
                <Icon size={17} />
                <span>{l.label}</span>
              </NavLink>
            );
          })}
          <div className="sidebar-foot">
            <div className="ai-hint">
              <Sparkles size={14} />
              <span>Search anywhere</span>
              <span className="kbd" style={{ marginLeft: 'auto' }}>Ctrl K</span>
            </div>
          </div>
        </aside>
        <div className="main">
          <header className="topbar">
            <div className="topbar-left">
              {layout === 'top' && (
                <div className="topbar-brand" title={clinic?.clinicName || 'Hospital ERP'}>
                  <div className={`brand-mark ${clinic?.logoUrl ? 'has-img' : ''}`}>
                    {clinic?.logoUrl ? <img src={clinic.logoUrl} alt="" /> : <Hospital size={16} />}
                  </div>
                </div>
              )}
              <div className="topbar-title">{clinic?.clinicName || 'Hospital ERP'}</div>
            </div>
            <div
              className="topbar-search"
              onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement | null)?.focus()}
            >
              <Search size={15} />
              <input placeholder="Search patients, invoices, prescriptions…" />
              <span className="kbd">Ctrl K</span>
            </div>
            <div className="topbar-right">
              <button
                className="icon-btn"
                onClick={() =>
                  setLayout((l) => LAYOUT_ORDER[(LAYOUT_ORDER.indexOf(l) + 1) % LAYOUT_ORDER.length])
                }
                aria-label="Cycle layout"
                title={`${LAYOUT_META[layout].label} \u2014 ${LAYOUT_META[layout].next}`}
              >
                <LayoutIcon size={16} />
              </button>
              <button
                className="icon-btn"
                onClick={() =>
                  setTheme((t) => THEME_ORDER[(THEME_ORDER.indexOf(t) + 1) % THEME_ORDER.length])
                }
                aria-label="Cycle theme"
                title={`Theme: ${theme} (click to cycle)`}
              >
                {theme === 'dark' ? <Moon size={16} /> : theme === 'dim' ? <SunMoon size={16} /> : theme === 'light' ? <Sun size={16} /> : <Leaf size={16} />}
              </button>
              <div className="topbar-user" ref={menuRef}>
                <button className="user-trigger" onClick={() => setMenuOpen((o) => !o)}>
                  <div className="avatar">{initials}</div>
                  <div className="user-meta">
                    <div className="user-name">{user?.fullName || user?.username}</div>
                  </div>
                  <ChevronDown size={16} />
                </button>
                {menuOpen && (
                  <div className="user-menu">
                    <div className="menu-header">
                      <div className="name">{user?.fullName || user?.username}</div>
                      <div className="sub">{user?.username} · {displayRoles}</div>
                    </div>
                    <button onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
                      <UserIcon size={15} /> Profile & Settings
                    </button>
                    <button className="danger-text" onClick={() => { setMenuOpen(false); logout(); }}>
                      <LogOut size={15} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          {layout === 'top' && (
            <nav className="topnav-row" ref={topnavRef} aria-label="Primary">
              {visibleLinks.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink key={l.to} to={l.to} end={l.end}>
                    <Icon size={14} />
                    <span>{l.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          )}
          {layout === 'top' && (
            <div className="subbar">
              <div className="subbar-crumbs">
                <span>Home</span>
                <span className="sep">›</span>
                <span className="current">
                  {visibleLinks.find((l) => l.end ? location.pathname === l.to : location.pathname.startsWith(l.to))?.label || 'Overview'}
                </span>
              </div>
              <div className="subbar-shortcuts">
                <NavLink to="/appointments" title="Today's appointments">
                  <CalendarClock size={13} /><span>Today</span>
                </NavLink>
                <NavLink to="/patients" title="Patients">
                  <UserPlus size={13} /><span>New Patient</span>
                </NavLink>
                <NavLink to="/billing/new" className="primary" title="Create invoice">
                  <FilePlus2 size={13} /><span>New Invoice</span>
                </NavLink>
              </div>
            </div>
          )}
          <div className="content" key={location.pathname}>
            <Outlet />
          </div>
          <footer className="footer">
            <div>
              <strong>{clinic?.clinicName || 'Hospital ERP'}</strong>
              {clinic?.address && <> · {clinic.address}</>}
            </div>
            <div className="footer-sub">
              {clinic?.phone && <span>Ph: {clinic.phone}</span>}
              {clinic?.email && <span>Email: {clinic.email}</span>}
              {clinic?.gstin && <span>GSTIN: {clinic.gstin}</span>}
              <span>&copy; {new Date().getFullYear()} {clinic?.clinicName || 'Hospital ERP'}</span>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
