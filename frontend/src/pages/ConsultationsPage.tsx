import { Link } from 'react-router-dom';

export default function ConsultationsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Consultations</h1>
        <Link to="/consultations/new"><button>+ New Consultation</button></Link>
      </div>
      <div className="card">
        <p style={{ color: '#6b7280' }}>
          Open a patient profile to see and create their consultations, or click "New Consultation" above.
        </p>
        <p>Quick links:</p>
        <ul>
          <li><Link to="/patients">Browse Patients</Link></li>
          <li><Link to="/appointments">Today's Appointments</Link></li>
        </ul>
      </div>
    </div>
  );
}
