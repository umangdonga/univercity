import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LifeBuoy,
  PhoneCall,
  ShieldAlert,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileQuestion,
  Headphones,
} from 'lucide-react';

interface SupportScreenProps {
  onBack?: () => void;
}

export const SupportScreen: React.FC<SupportScreenProps> = ({ onBack }) => {
  const { user, showToast } = useApp();
  const [ticketCategory, setTicketCategory] = useState<string>('Academic');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submittedTickets, setSubmittedTickets] = useState<
    { id: string; subject: string; category: string; status: string; date: string }[]
  >([
    {
      id: 'TKT-8901',
      subject: 'Wi-Fi connection drop in Knowledge Tower 3rd Floor',
      category: 'Technical',
      status: 'Resolved',
      date: 'Yesterday',
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      showToast('Please enter subject and description.');
      return;
    }

    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject,
      category: ticketCategory,
      status: 'Under Review',
      date: 'Just now',
    };

    setSubmittedTickets([newTicket, ...submittedTickets]);
    setSubject('');
    setDescription('');
    showToast(`Support Ticket #${newTicket.id} created! Response within 2 hours.`);
  };

  return (
    <div className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Header */}
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
            <h1 className="text-base font-bold text-[#101214] tracking-tight">Campus Help & Support</h1>
            <p className="text-[11px] text-slate-400">Emergency SOS, helpdesk & student services</p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-red-50 text-[#FF0000]">
          <ShieldAlert className="w-4 h-4" />
        </div>
      </div>

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* Emergency SOS Banner */}
        <div className="bg-gradient-to-r from-[#FF0000] to-rose-700 text-white rounded-3xl p-5 shadow-lg shadow-red-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 uppercase tracking-wider">
              24/7 Rapid Response
            </span>
            <span className="text-xs font-bold">Campus Security</span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Emergency SOS Helpline</h2>
            <p className="text-xs text-red-100">Medical emergency, security escort, or campus distress</p>
          </div>

          <a
            href="tel:+919876543210"
            className="w-full py-3 px-4 rounded-xl bg-white text-[#FF0000] font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-50 transition-all shadow-md active:scale-98"
          >
            <PhoneCall className="w-4 h-4 fill-red-600" />
            <span>Call Security Control Room (+91 98765 43210)</span>
          </a>
        </div>

        {/* Submit Help Ticket */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-[#BADDF2]/40 text-[#263D88]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
                Create Support Ticket
              </h3>
              <p className="text-[11px] text-slate-400">Directly routed to the responsible department</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] bg-white text-[#101214]"
              >
                <option>Academic & Courses</option>
                <option>Hostel & Living</option>
                <option>Campus Transit & Bus</option>
                <option>Library & Fine Waiver</option>
                <option>Canteen & Food Quality</option>
                <option>Technical / Wi-Fi / Labs</option>
                <option>Other Grievance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                placeholder="Brief summary of the issue..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] text-[#101214]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Details & Location</label>
              <textarea
                rows={3}
                placeholder="Provide details, room number, or specific time..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] text-[#101214]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#263D88] text-white font-bold text-xs hover:bg-[#1E2F6B] shadow-md shadow-[#263D88]/20 transition-all active:scale-98"
            >
              Submit Ticket
            </button>
          </form>
        </section>

        {/* My Tickets History */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
            Your Tickets ({submittedTickets.length})
          </h3>

          <div className="space-y-2.5">
            {submittedTickets.map((t) => (
              <div key={t.id} className="p-3 rounded-2xl bg-[#F4F7FB] border border-slate-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#263D88]">{t.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#101214]">{t.subject}</h4>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Category: {t.category}</span>
                  <span>{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
