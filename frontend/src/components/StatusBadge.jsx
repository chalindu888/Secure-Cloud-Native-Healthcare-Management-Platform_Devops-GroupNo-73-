import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'confirmed':
    case 'active':
    case 'success':
    case 'synced':
    case 'passed':
      return (
        <span className="badge badge-success">
          <span className="badge-dot"></span>
          {status}
        </span>
      );
    case 'pending':
    case 'in_progress':
      return (
        <span className="badge badge-warning">
          <span className="badge-dot"></span>
          {status}
        </span>
      );
    case 'completed':
      return (
        <span className="badge badge-primary">
          <span className="badge-dot"></span>
          {status}
        </span>
      );
    case 'cancelled':
    case 'rejected':
    case 'suspended':
    case 'failed':
      return (
        <span className="badge badge-danger">
          <span className="badge-dot"></span>
          {status}
        </span>
      );
    default:
      return (
        <span className="badge badge-muted">
          <span className="badge-dot"></span>
          {status}
        </span>
      );
  }
};

export default StatusBadge;
