import React from 'react';
import { Link } from 'react-router-dom';
import { useAmbulanceData } from '../../hooks/useAmbulanceData';
import AmbulanceRequestList from '../../components/AmbulanceRequestList';
import { Ambulance } from 'lucide-react';

const PatientAmbulance = () => {
  const { requests, loading, error, refresh } = useAmbulanceData();

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#dc2626' }}>Patient Portal</span>
          <h1 className="page-title">My Ambulance Requests</h1>
          <p className="page-subtitle">Track the ambulances you have requested, and cancel a request that is not finished yet.</p>
        </div>
        <Link to="/ambulances" className="btn btn-primary"><Ambulance size={18} /> Request an ambulance</Link>
      </div>

      {error && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--txt-secondary)' }}>Loading...</p>
      ) : (
        <AmbulanceRequestList requests={requests} role="patient" onChanged={refresh} emptyText="You have not requested an ambulance yet." />
      )}
    </div>
  );
};

export default PatientAmbulance;
