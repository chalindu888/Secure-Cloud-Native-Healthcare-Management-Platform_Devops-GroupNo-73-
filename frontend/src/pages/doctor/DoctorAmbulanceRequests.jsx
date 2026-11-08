import React from 'react';
import { Link } from 'react-router-dom';
import { useAmbulanceData } from '../../hooks/useAmbulanceData';
import AmbulanceRequestList from '../../components/AmbulanceRequestList';
import { Ambulance } from 'lucide-react';

const DoctorAmbulanceRequests = () => {
  const { requests, loading, error, refresh } = useAmbulanceData();

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--c-cyan)' }}>Doctor Portal</span>
          <h1 className="page-title">Ambulance Requests</h1>
          <p className="page-subtitle">Ambulances requested for your patients, by you or by the patients themselves.</p>
        </div>
        <Link to="/ambulances" className="btn btn-primary"><Ambulance size={18} /> Request for a patient</Link>
      </div>

      {error && <p role="alert" style={{ marginBottom: '1rem', padding: '0.85rem 1rem', borderRadius: '0.75rem', fontSize: '0.88rem', fontWeight: 600, color: '#b91c1c', background: '#fee2e2' }}>{error}</p>}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--txt-secondary)' }}>Loading...</p>
      ) : (
        <AmbulanceRequestList requests={requests} role="doctor" onChanged={refresh} emptyText="No ambulance has been requested for your patients yet." />
      )}
    </div>
  );
};

export default DoctorAmbulanceRequests;
