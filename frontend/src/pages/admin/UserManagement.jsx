import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import StatusBadge from '../../components/StatusBadge';
import { Search, CheckCircle2 } from 'lucide-react';

const UserManagement = () => {
  const { users, toggleUserStatus, updateUserRole } = useData();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [notification, setNotification] = useState('');

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole);
    setNotification(`User role updated to ${newRole}.`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleToggleStatus = (userId, currentStatus) => {
    toggleUserStatus(userId);
    setNotification(`User account ${currentStatus === 'active' ? 'suspended' : 'reactivated'}.`);
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="page-wrapper">
      <div className="animate-fade-up" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Identity & Access Management</h1>
        <p className="page-subtitle" style={{ maxWidth: '600px' }}>
          Control Role-Based Access (RBAC), provision medical credentials, and govern active accounts securely.
        </p>
      </div>

      {notification && (
        <div className="alert alert-success animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <CheckCircle2 size={18} />
          {notification}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card animate-fade-up-1" style={{ padding: '1rem 1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.35rem', borderRadius: 'var(--r-md)' }}>
            {['all', 'patient', 'doctor', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                style={{
                  padding: '0.4rem 0.875rem', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                  background: roleFilter === role ? 'var(--c-primary-pale)' : 'transparent',
                  color: roleFilter === role ? 'var(--c-primary-light)' : 'var(--txt-secondary)',
                  border: `1px solid ${roleFilter === role ? 'var(--c-primary-border)' : 'transparent'}`,
                  transition: 'all 200ms ease',
                }}
              >
                {role === 'all' ? 'All Roles' : `${role}s`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '250px', maxWidth: '350px' }}>
            <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--txt-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card animate-fade-up-2" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
              <tr>
                <th>User</th>
                <th>Assigned Role (RBAC)</th>
                <th>Account Status</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid var(--bdr-subtle)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.75rem', color: '#f0f6fc', textTransform: 'uppercase'
                      }}>
                        {u.name.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#f0f6fc', fontSize: '0.85rem' }}>{u.name}</div>
                        <div style={{ color: 'var(--txt-muted)', fontSize: '0.7rem' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{
                        padding: '0.35rem 0.75rem', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', fontWeight: 600,
                        background: 'rgba(255,255,255,0.06)', border: '1px solid var(--bdr-default)', color: 'var(--txt-primary)',
                        textTransform: 'capitalize', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>

                  <td>
                    <StatusBadge status={u.status} />
                  </td>

                  <td style={{ fontSize: '0.8rem' }}>
                    {u.joinedDate || '2026-01-01'}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleToggleStatus(u.id, u.status)}
                      className={u.status === 'active' ? 'btn btn-sm btn-danger' : 'btn btn-sm btn-success'}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.7rem' }}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>No users found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
