import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LIBRARY_BOOKS_DATA, CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import {
  BookOpen,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ArrowLeft,
  RotateCcw,
  CreditCard,
  Layers,
  Bookmark,
} from 'lucide-react';

interface LibraryScreenProps {
  onBack?: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({ onBack }) => {
  const { issuedBooks, renewBook, payLibraryFine, reserveBook, startNavigationTo, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Computer Science', 'Systems & Hardware', 'Software Engineering', 'Artificial Intelligence', 'Design & UI/UX'];

  const filteredCatalog = LIBRARY_BOOKS_DATA.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleNavigate = () => {
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === 'central-library') || CAMPUS_LOCATIONS[5];
    startNavigationTo(loc);
  };

  const totalFines = issuedBooks.reduce((acc, b) => acc + (b.penaltyAmount || 0), 0);

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
            <h1 className="text-base font-bold text-[#101214] tracking-tight">Central Knowledge Library</h1>
            <p className="text-[11px] text-slate-400">Books, digital catalog & study zones</p>
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
        {/* Library Info Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#263D88] uppercase tracking-wider">
              Knowledge Tower (1st - 3rd Floor)
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Open Now
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#263D88]" />
              <span>8:00 AM - 9:00 PM</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#53AADF]" />
              <span>85,000+ Physical Books</span>
            </div>
          </div>
        </div>

        {/* My Issued Books Section with Fine from Case Study */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#263D88]" />
              <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
                My Issued Books ({issuedBooks.length})
              </h3>
            </div>
            {totalFines > 0 && (
              <span className="text-xs font-bold text-[#FF0000] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                Pending Fine: ${totalFines}.00
              </span>
            )}
          </div>

          <div className="space-y-3">
            {issuedBooks.map((book) => {
              const isOverdue = book.status === 'overdue';

              return (
                <div
                  key={book.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isOverdue
                      ? 'bg-red-50/50 border-red-200'
                      : 'bg-[#F4F7FB] border-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isOverdue
                            ? 'bg-[#FF0000] text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOverdue ? 'Overdue • Penalty Active' : 'Active / Issued'}
                      </span>
                      <h4 className="text-sm font-bold text-[#101214] mt-1.5">{book.title}</h4>
                      <p className="text-xs text-slate-500">{book.author}</p>
                    </div>

                    {isOverdue && (
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-[#FF0000]">
                          +${book.penaltyAmount || 5.0}
                        </span>
                        <p className="text-[10px] text-slate-400">Late Fine</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-500">
                      Due Date: <strong className="text-slate-800">{book.dueDate}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {isOverdue ? (
                        <button
                          onClick={() => payLibraryFine(book.id)}
                          className="py-1.5 px-3 rounded-xl bg-[#FF0000] text-white text-xs font-bold hover:bg-red-700 flex items-center gap-1 shadow-sm transition-all"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay ${book.penaltyAmount || 5} & Clear</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => renewBook(book.id)}
                          className="py-1.5 px-3 rounded-xl bg-[#263D88] text-white text-xs font-bold hover:bg-[#1E2F6B] flex items-center gap-1 shadow-sm transition-all"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Renew +14 Days</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Library Book Catalog Search & Reservation */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
              Search & Reserve Books
            </h3>
            <span className="text-xs text-slate-400">{filteredCatalog.length} titles</span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F4F7FB] border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] text-[#101214]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#263D88] text-white'
                    : 'bg-[#F4F7FB] text-slate-600 hover:bg-[#BADDF2]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredCatalog.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-2xl bg-[#F4F7FB] border border-slate-100 flex items-center justify-between gap-3 hover:border-[#BADDF2] transition-all"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-[#263D88]">{b.category} • Shelf {b.shelf}</span>
                  <h4 className="text-xs font-bold text-[#101214] truncate mt-0.5">{b.title}</h4>
                  <p className="text-[11px] text-slate-500">{b.author}</p>
                </div>

                <button
                  onClick={() => reserveBook(b.id)}
                  className="shrink-0 py-1.5 px-3 rounded-xl bg-[#263D88] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#1E2F6B] transition-all"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Reserve</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
