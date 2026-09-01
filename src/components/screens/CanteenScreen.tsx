import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CANTEENS_DATA, CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import { Canteen, MenuItem } from '../../types';
import {
  Coffee,
  Utensils,
  Star,
  Clock,
  MapPin,
  Navigation,
  ArrowLeft,
  Search,
  Plus,
  MessageSquare,
  Flame,
  Check,
} from 'lucide-react';

interface CanteenScreenProps {
  onBack?: () => void;
}

export const CanteenScreen: React.FC<CanteenScreenProps> = ({ onBack }) => {
  const { canteenReviews, addCanteenReview, startNavigationTo, showToast } = useApp();
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>('sy-cafe');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const currentCanteen = CANTEENS_DATA.find((c) => c.id === selectedCanteenId) || CANTEENS_DATA[0];
  const reviews = canteenReviews[currentCanteen.id] || currentCanteen.reviews;

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'beverages', label: 'Beverages' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch / Thali' },
    { id: 'fast-food', label: 'Fast Food' },
    { id: 'healthy', label: 'Healthy Bowls' },
  ];

  const filteredMenu = currentCanteen.menu.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleNavigate = () => {
    const loc = CAMPUS_LOCATIONS.find((l) => l.id === currentCanteen.id) || CAMPUS_LOCATIONS[3];
    startNavigationTo(loc);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      showToast('Please enter your review text.');
      return;
    }
    addCanteenReview(currentCanteen.id, reviewRating, reviewComment);
    setReviewComment('');
    setIsReviewModalOpen(false);
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
            <h1 className="text-base font-bold text-[#101214] tracking-tight">Campus Canteens</h1>
            <p className="text-[11px] text-slate-400">Menus, ratings, reviews & navigation</p>
          </div>
        </div>

        <button
          onClick={handleNavigate}
          className="py-1.5 px-3 rounded-xl bg-[#263D88] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1E2F6B] shadow-sm transition-all active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5 text-[#53AADF]" />
          <span>Navigate</span>
        </button>
      </div>

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* Canteen Selector Tabs (S Y Cafe / UNIQUE Canteen) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          {CANTEENS_DATA.map((canteen) => {
            const isSelected = selectedCanteenId === canteen.id;
            return (
              <button
                key={canteen.id}
                onClick={() => {
                  setSelectedCanteenId(canteen.id);
                  setActiveCategory('all');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isSelected
                    ? 'bg-[#263D88] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {canteen.id === 'sy-cafe' ? <Coffee className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                <span>{canteen.name}</span>
              </button>
            );
          })}
        </div>

        {/* Current Canteen Hero Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xs">
          <div className="relative h-40">
            <img
              src={currentCanteen.image}
              alt={currentCanteen.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#101214] text-xs font-bold flex items-center gap-1 shadow-sm">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{currentCanteen.rating}</span>
              <span className="text-slate-400 font-normal">({reviews.length})</span>
            </div>

            <div className="absolute bottom-3 left-4 right-4 text-white">
              <h2 className="text-lg font-bold">{currentCanteen.name}</h2>
              <p className="text-xs text-blue-100">{currentCanteen.tagline}</p>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between text-xs text-slate-600 border-b border-slate-100 bg-[#F4F7FB]/50">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#263D88]" />
              <span>{currentCanteen.timings}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#53AADF]" />
              <span className="truncate max-w-[160px]">{currentCanteen.location}</span>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
              Food Menu & Specials
            </h3>
            <span className="text-xs text-slate-400">{filteredMenu.length} items</span>
          </div>

          {/* Search menu items */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search dishes, snacks, beverages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F4F7FB] border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88] text-[#101214]"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[#263D88] text-white shadow-xs'
                    : 'bg-[#F4F7FB] text-slate-600 hover:bg-[#BADDF2]/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu Items List */}
          <div className="space-y-2.5">
            {filteredMenu.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-[#F4F7FB] border border-slate-100 flex items-center justify-between gap-3 hover:border-[#BADDF2] transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-sm border border-emerald-600 flex items-center justify-center p-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    </span>
                    <h4 className="text-xs font-bold text-[#101214] truncate">{item.name}</h4>
                    {item.isPopular && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> Popular
                      </span>
                    )}
                  </div>
                  {item.calories && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.calories} kcal</p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[#263D88]">₹{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews Section from Case Study */}
        <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider">
              Student Reviews ({reviews.length})
            </h3>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="text-xs font-bold text-[#263D88] hover:text-[#53AADF] flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Write Review</span>
            </button>
          </div>

          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-3 rounded-2xl bg-[#F4F7FB] border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-xs font-bold text-[#101214]">{rev.userName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{rev.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{rev.comment}</p>
                <span className="text-[10px] text-slate-400 block">{rev.date}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#263D88]">Review {currentCanteen.name}</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= reviewRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your Feedback</label>
              <textarea
                rows={3}
                placeholder="Share your thoughts on food quality, speed, hygiene..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#263D88]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReviewSubmit}
                className="w-1/2 py-2.5 rounded-xl bg-[#263D88] text-white text-xs font-bold"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
