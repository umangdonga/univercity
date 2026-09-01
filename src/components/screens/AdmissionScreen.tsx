import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  UserCheck,
} from 'lucide-react';

interface AdmissionScreenProps {
  onBack?: () => void;
}

export const AdmissionScreen: React.FC<AdmissionScreenProps> = ({ onBack }) => {
  const { user, bookAppointment, startNavigationTo, showToast } = useApp();

  const [fullName, setFullName] = useState<string>(user.name || 'Rohit Sharma');
  const [department, setDepartment] = useState<string>('M.Des (Master of Design)');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-26');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30 AM');
  const [purpose, setPurpose] = useState<string>('Campus Visit & Admission Counseling');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const departmentsList = [
    'M.Des (Master of Design)',
    'BCA (Bachelor of Computer Applications)',
    'B.Tech Computer Science & Engineering',
    'B.Des User Experience Design',
    'MBA (Master of Business Administration)',
    'MCA (Master of Computer Applications)',
    'BBA (Bachelor of Business Administration)',
  ];

  const timeSlots = ['09:30 AM', '10:30 AM', '11:45 AM', '02:00 PM', '03:30 PM', '04:30 PM'];

  const admissionFaqs = [
    {
      question: 'What documents are required for admission inquiry verification?',
      answer: 'Please bring your 10th & 12th original mark sheets, government ID (Aadhaar / Passport), transfer certificate, and 4 passport size photographs.',
    },
    {
      question: 'What are the admission counseling office timings?',
      answer: 'The University Admission Office (Room A102, Main Academic Building) is open Monday through Saturday from 9:00 AM to 5:30 PM.',
    },
    {
      question: 'Is there direct entry or entrance examination for M.Des & B.Tech?',
      answer: 'B.Tech requires JEE Main or University Entrance Exam scores. M.Des requires a relevant undergraduate degree and portfolio presentation.',
    },
    {
      question: 'Can parents accompany students during the campus tour?',
      answer: 'Yes, parents and guardians are welcome! The Visitor Inquiry Pass issued through this app grants campus-wide access for your booked slot.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookAppointment({
      fullName,
      department,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      purpose,
    });
  };

  const handleNavigate = () => {
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'admin-office') || CAMPUS_LOCATIONS[6];
    startNavigationTo(loc);
  };

  return (
    <div className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-[#101214] tracking-tight">University Admission Cell</h1>
            <p className="text-[11px] text-slate-400">Inquiry pass, appointment booking & help desk</p>
          </div>
        </div>

        <button
          onClick={handleNavigate}
          className="py-1.5 px-3 rounded-xl bg-[#263D88] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1E2F6B] shadow-sm transition-all"
        >
          <Navigation className="w-3.5 h-3.5 text-[#53AADF]" />
          <span>Navigate</span>
        </button>
      </div>

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* Office Location Spotlight */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#263D88] uppercase tracking-wider">
              Main Building Block A (Room A102)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Open 9:00 AM - 5:30 PM
            </span>
          </div>

          <p className="text-xs text-slate-600">
            For academic inquiries, document verification, campus tours, and admission counseling.
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#263D88]" />
              <span>Monday - Saturday</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#53AADF]" />
              <span>Ground Floor • Gate 1 Entry</span>
            </div>
          </div>
        </div>

        {/* Visitor Inquiry Pass Appointment Form */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#BADDF2]/40 text-[#263D88]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
                Book Admission Appointment
              </h2>
              <p className="text-[11px] text-slate-400">Generate your official Visitor Inquiry Pass</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applicant / Visitor Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] text-[#101214]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Department / Course
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] text-[#101214] bg-white"
              >
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] text-[#101214]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot</label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] text-[#101214] bg-white"
                >
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose of Visit</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] text-[#101214]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-[#263D88] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/20 transition-all active:scale-[0.98]"
            >
              <UserCheck className="w-4 h-4 text-[#53AADF]" />
              <span>Confirm Appointment & Generate Pass</span>
            </button>
          </form>
        </section>

        {/* Admission FAQ Accordion */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#263D88]" />
            <span>Admission FAQs & Information</span>
          </h3>

          <div className="space-y-2">
            {admissionFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-100 rounded-2xl overflow-hidden bg-[#F4F7FB]/60"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3 text-left text-xs font-bold text-[#101214] flex items-center justify-between gap-2"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#263D88]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100/60 pt-2">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
