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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Identity & Access Management</h1>
          <p className="text-sm text-slate-600">
            Control Role-Based Access (RBAC), provision medical credentials, and govern active accounts.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto text-xs">
            {['all', 'patient', 'doctor', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition ${
                  roleFilter === role
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {role === 'all' ? 'All Roles' : `${role}s`}
              </button>
            ))}
          </div>

          <div className="w-full md:w-80 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Assigned Role (RBAC)</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs uppercase border border-slate-200">
                        {u.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                        <div className="text-slate-400 text-[11px]">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                    >
                      <option value="patient">Patient</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={u.status} />
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {u.joinedDate || '2026-01-01'}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.status)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                        u.status === 'active'
                          ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                          : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
