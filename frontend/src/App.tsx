import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import AppointmentsPage from './pages/AppointmentsPage';
import ConsultationsPage from './pages/ConsultationsPage';
import ConsultationFormPage from './pages/ConsultationFormPage';
import PrescriptionPrintPage from './pages/PrescriptionPrintPage';
import BillingPage from './pages/BillingPage';
import InvoiceFormPage from './pages/InvoiceFormPage';
import InvoicePrintPage from './pages/InvoicePrintPage';
import PharmacyPage from './pages/PharmacyPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/print/prescription/:id" element={<ProtectedRoute><PrescriptionPrintPage /></ProtectedRoute>} />
      <Route path="/print/invoice/:id" element={<ProtectedRoute><InvoicePrintPage /></ProtectedRoute>} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:id" element={<PatientDetailPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/consultations" element={<ConsultationsPage />} />
        <Route path="/consultations/new" element={<ConsultationFormPage />} />
        <Route path="/consultations/:id" element={<ConsultationFormPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/billing/new" element={<InvoiceFormPage />} />
        <Route path="/pharmacy" element={<PharmacyPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
