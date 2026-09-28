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
        <span className="section-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Our Specialists</span>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 900, color: '#f1f5f9', marginBottom: '0.75rem' }}>
          Clinical Specialists Directory
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b', maxWidth: '560px', lineHeight: 1.7 }}>
          Search and schedule consultations with board-certified physicians across specialized departments.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        className="animate-fade-up-1 glass-card"
        style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            color: searchFocused ? '#818cf8' : '#475569', transition: 'color 200ms ease', pointerEvents: 'none',
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
              background: 'rgba(255,255,255,0.07)',
              border: `1px solid ${searchFocused ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.12)'}`,
              boxShadow: searchFocused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
              borderRadius: '0.75rem',
              color: '#f1f5f9',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'all 200ms ease',
            }}
          />
        </div>

        {/* Specialty Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569' }}>
            <Filter size={13} /> Filter:
          </span>
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                transition: 'all 200ms ease',
                background: selectedSpecialty === spec
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(255,255,255,0.06)',
                color: selectedSpecialty === spec ? '#ffffff' : '#94a3b8',
                boxShadow: selectedSpecialty === spec ? '0 4px 15px rgba(99,102,241,0.35)' : 'none',
                border: selectedSpecialty === spec ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => { if (selectedSpecialty !== spec) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#f1f5f9'; }}}
              onMouseLeave={e => { if (selectedSpecialty !== spec) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94a3b8'; }}}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Result Count */}
        <p style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
          Showing{' '}
          <span style={{ color: '#818cf8' }}>{filteredDoctors.length}</span>
          {' '}of {doctors.length} specialists
          {selectedSpecialty !== 'All' && (
            <> in <span style={{ color: '#818cf8' }}>{selectedSpecialty}</span></>
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
              className="glass-card"
              style={{
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
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
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
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.25rem' }}>
                      {doc.name}
                    </h3>
                    <span style={{
                      display: 'inline-block', fontSize: '0.68rem', fontWeight: 700,
                      padding: '0.2rem 0.625rem', borderRadius: '999px',
                      background: specStyle.bg, color: specStyle.color, border: `1px solid ${specStyle.border}`,
                    }}>
                      {doc.specialty}
                    </span>
                    <p style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.25rem' }}>{doc.department}</p>
                  </div>
                </div>

                {/* Bio */}
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {doc.bio}
                </p>

                {/* Qualification & Location */}
                <div style={{
                  padding: '0.875rem', borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', flexDirection: 'column', gap: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: '#94a3b8' }}>
                    <Award size={14} style={{ color: specStyle.color, flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{doc.qualification}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: '#64748b' }}>
                    <MapPin size={14} style={{ color: '#475569', flexShrink: 0 }} />
                    {doc.location}
                  </div>
                </div>

                {/* Available Days */}
                <div>
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '0.5rem' }}>
                    Available Days
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {doc.availableDays.map((day) => (
                      <span
                        key={day}
                        style={{
                          padding: '0.2rem 0.5rem', borderRadius: '0.375rem',
                          fontSize: '0.65rem', fontWeight: 700,
                          background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {day.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer: Fee, Rating, Book */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consultation Fee</p>
                    <p style={{ fontSize: '1.15rem', fontWeight: 900, color: '#f1f5f9' }}>${doc.consultationFee}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: 'flex-end' }}>
                      <Star size={14} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#fbbf24' }}>{doc.rating}</span>
                    </div>
                    <p style={{ fontSize: '0.65rem', color: '#475569' }}>{doc.reviewsCount} reviews</p>
                  </div>
                </div>

                <Link
                  to={`/patient/book?doctor=${doc.id}`}
                  className="btn btn-primary w-full"
                  style={{ fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  <Calendar size={14} />
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
          className="glass-card"
          style={{ padding: '4rem 2rem', textAlign: 'center' }}
        >
          <Stethoscope size={40} style={{ color: '#334155', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem' }}>
            No doctors match your search
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#475569' }}>
            Try adjusting your specialty filter or keyword search query.
          </p>
          <button
            onClick={() => { setSearch(''); setSelectedSpecialty('All'); }}
            className="btn btn-soft"
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
