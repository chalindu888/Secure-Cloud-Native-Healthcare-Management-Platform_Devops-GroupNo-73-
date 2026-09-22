import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Search, MapPin, Award, Calendar, Star, Filter, Stethoscope } from 'lucide-react';

const SPECIALTIES = ['All', 'Cardiology', 'Neurology', 'Dermatology', 'Pediatrics', 'General Medicine'];

const DoctorsDirectory = () => {
  const { doctors } = useData();
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSpecialty = selectedSpecialty === 'All' || doctor.specialty === selectedSpecialty;
    const matchesSearch = doctor.name.toLowerCase().includes(search.toLowerCase()) ||
                          doctor.specialty.toLowerCase().includes(search.toLowerCase()) ||
                          doctor.department.toLowerCase().includes(search.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Clinical Specialists Directory</h1>
        <p className="text-sm text-slate-600">
          Search and schedule consultations with board-certified physicians across specialized departments.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by doctor name, medical department, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Specialty Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
            <Filter size={14} /> Specialty:
          </span>
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition ${
                selectedSpecialty === spec
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              {/* Doctor Avatar & Headline */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{doc.name}</h3>
                  <p className="text-xs font-semibold text-blue-600">{doc.specialty}</p>
                  <p className="text-[11px] text-slate-500">{doc.department}</p>
                </div>
              </div>

              {/* Bio & Qualification */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{doc.bio}</p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Award size={14} className="text-blue-500" />
                  <span className="truncate font-medium">{doc.qualification}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{doc.location}</span>
                </div>
              </div>

              {/* Available Days */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Available Days</p>
                <div className="flex flex-wrap gap-1">
                  {doc.availableDays.map((day) => (
                    <span key={day} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {day.slice(0, 3)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Consultation Fee</span>
                  <p className="text-base font-extrabold text-slate-900">${doc.consultationFee}</p>
                </div>
                <div className="text-right">
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {doc.rating}
                  </span>
                  <span className="text-[10px] text-slate-400">{doc.reviewsCount} verified reviews</span>
                </div>
              </div>

              <Link
                to={`/patient/book?doctor=${doc.id}`}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Calendar size={14} />
                <span>Book Appointment</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Stethoscope size={36} className="text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No doctors match your search</h3>
          <p className="text-xs text-slate-500">Try adjusting your specialty filter or keyword search query.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorsDirectory;
