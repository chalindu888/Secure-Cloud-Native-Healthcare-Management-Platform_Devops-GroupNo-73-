import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search, MapPin, Award, Calendar, Star, Filter, Stethoscope } from 'lucide-react';

const SPECIALTIES = ['All', 'Cardiology', 'Neurology', 'Dermatology', 'Pediatrics', 'General Medicine'];

const SPECIALTY_COLORS = {
  'Cardiology': { color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  'Neurology': { color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
  'Dermatology': { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  'Pediatrics': { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' },
  'General Medicine': { color: '#67e8f9', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)' },
  'Default': { color: '#a5b4fc', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)' },
};

const getSpecialtyStyle = (spec) => SPECIALTY_COLORS[spec] || SPECIALTY_COLORS['Default'];

const DoctorsDirectory = () => {
  const { doctors } = useData();
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    const matchesSearch = doctor.name.toLowerCase().includes(search.toLowerCase()) ||
                          doctor.specialty.toLowerCase().includes(search.toLowerCase()) ||
                          doctor.department.toLowerCase().includes(search.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '88rem', margin: '0 auto', padding: '2.5rem 1.5rem 5rem', position: 'relative' }}>
      {/* Decorative Orb */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '2.5rem' }}>
        <span className="section-label" style={{ display: 'block', marginBottom: '0.5rem', color: '#000000', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.75rem' }}>
          Our Specialists
        </span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: '#000000', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Clinical Specialists Directory
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#334155', maxWidth: '560px', lineHeight: 1.7 }}>
          Search and schedule consultations with board-certified physicians across specialized departments.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className="animate-fade-up-1"
        style={{
          background: '#ffffff',
          borderRadius: '1.25rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            color: searchFocused ? '#4f46e5' : '#64748b', transition: 'color 200ms ease', pointerEvents: 'none',
          }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search by doctor name, medical department, or specialty..."
            style={{
              width: '100%',
              paddingLeft: '2.875rem',
              paddingRight: '1rem',
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              background: '#f8fafc',
              border: `1.5px solid ${searchFocused ? '#4f46e5' : '#cbd5e1'}`,
              boxShadow: searchFocused ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
              borderRadius: '0.75rem',
              color: '#000000',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 200ms ease',
            }}
          />
        </div>

        {/* Specialty Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>
            <Filter size={13} /> Filter:
          </span>
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 200ms ease',
                background: selectedSpecialty === spec
                  ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                  : '#ffffff',
                color: selectedSpecialty === spec ? '#ffffff' : '#1e293b',
                boxShadow: selectedSpecialty === spec ? '0 4px 14px rgba(79,70,229,0.3)' : '0 1px 3px rgba(0,0,0,0.05)',
                border: selectedSpecialty === spec ? '1.5px solid #4338ca' : '1.5px solid #cbd5e1',
              }}
              onMouseEnter={e => {
                if (selectedSpecialty !== spec) {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                if (selectedSpecialty !== spec) {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Result Count */}
        <p style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700 }}>
          Showing{' '}
          <span style={{ color: '#4f46e5', fontWeight: 800 }}>{filteredDoctors.length}</span>
          {' '}of {doctors.length} specialists
          {selectedSpecialty !== 'All' && (
            <> in <span style={{ color: '#4f46e5', fontWeight: 800 }}>{selectedSpecialty}</span></>
          )}
        </p>
      </div>

      {/* Doctors Grid */}
      <div
        className="animate-fade-up-2"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}
      >
        {filteredDoctors.map((doc, i) => {
          const specStyle = getSpecialtyStyle(doc.specialty);
          return (
            <div
              key={doc.id}
              style={{
                background: '#ffffff',
                borderRadius: '1.25rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.05)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                animationDelay: `${i * 60}ms`,
                animation: 'fade-up 0.5s ease both',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: `linear-gradient(90deg, transparent, ${specStyle.color}, transparent)`,
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Doctor Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '0.875rem', flexShrink: 0,
                    background: specStyle.bg, border: `1px solid ${specStyle.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Stethoscope size={22} style={{ color: specStyle.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#000000', marginBottom: '0.25rem' }}>
                      {doc.name}
                    </h3>
                    <span style={{
                      display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
                      padding: '0.25rem 0.65rem', borderRadius: '999px',
                      background: specStyle.bg, color: specStyle.color, border: `1px solid ${specStyle.border}`,
                    }}>
                      {doc.specialty}
                    </span>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem', fontWeight: 600 }}>{doc.department}</p>
                  </div>
                </div>

                {/* Bio */}
                <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {doc.bio}
                </p>

                {/* Qualification & Location */}
                <div style={{
                  padding: '0.875rem', borderRadius: '0.75rem',
                  background: '#f8fafc', border: '1px solid #f1f5f9',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#1e293b' }}>
                    <Award size={15} style={{ color: specStyle.color, flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 700 }}>{doc.qualification}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b' }}>
                    <MapPin size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                    <span style={{ fontWeight: 500 }}>{doc.location}</span>
                  </div>
                </div>

                {/* Available Days */}
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '0.5rem' }}>
                    Available Days
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {doc.availableDays.map((day) => (
                      <span
                        key={day}
                        style={{
                          padding: '0.25rem 0.55rem', borderRadius: '0.5rem',
                          fontSize: '0.7rem', fontWeight: 700,
                          background: '#f1f5f9', color: '#334155',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer: Fee, Rating, Book */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Consultation Fee</p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#000000', margin: 0 }}>${doc.consultationFee}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      <Star size={15} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#b45309' }}>{doc.rating}</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>{doc.reviewsCount} reviews</p>
                  </div>
                </div>

                <Link
                  to={`/patient/book?doctor=${doc.id}`}
                  className="btn btn-primary w-full"
                  style={{ fontSize: '0.85rem', fontWeight: 700, justifyContent: 'center' }}
                >
                  <Calendar size={15} />
                  Book Appointment
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDoctors.length === 0 && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '1.25rem',
            border: '1px solid #e2e8f0',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}
        >
          <Stethoscope size={40} style={{ color: '#cbd5e1', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#000000', marginBottom: '0.5rem' }}>
            No doctors match your search
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Try adjusting your specialty filter or keyword search query.
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedSpecialty('All'); }}
            className="btn btn-secondary"
            style={{ margin: '1.5rem auto 0', display: 'inline-flex' }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorsDirectory;
