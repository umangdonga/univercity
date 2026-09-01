import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusLocation, LocationCategory } from '../../types';
import { CAMPUS_LOCATIONS } from '../../data/mockCampusData';
import {
  Search,
  X,
  Clock,
  MapPin,
  Navigation,
  ArrowRight,
  GraduationCap,
  Building2,
  Coffee,
  BookOpen,
  Car,
  Home,
  FlaskConical,
  Trophy,
} from 'lucide-react';

interface SearchScreenProps {
  onClose?: () => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onClose }) => {
  const {
    searchQuery,
    setSearchQuery,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    startNavigationTo,
    setIsSearchOpen,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Classroom',
    'Lab',
    'Canteen',
    'Admin',
    'Library',
    'Hostel',
    'Parking',
    'Sports',
    'Facility',
  ];

  const filteredLocations = useMemo(() => {
    return CAMPUS_LOCATIONS.filter((loc) => {
      const matchesCategory =
        selectedCategory === 'All' || loc.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesName = loc.name.toLowerCase().includes(query);
      const matchesBuilding = loc.building.toLowerCase().includes(query);
      const matchesDesc = loc.description.toLowerCase().includes(query);
      const matchesTags = loc.tags.some((t) => t.toLowerCase().includes(query));
      const matchesCode = loc.shortCode?.toLowerCase().includes(query);
      const matchesRoom = loc.roomNumber?.toLowerCase().includes(query);

      return matchesCategory && (matchesName || matchesBuilding || matchesDesc || matchesTags || matchesCode || matchesRoom);
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectLocation = (loc: CampusLocation) => {
    addRecentSearch(loc.name);
    if (onClose) onClose();
    setIsSearchOpen(false);
    startNavigationTo(loc);
  };

  const handleRecentClick = (term: string) => {
    setSearchQuery(term);
    const matched = CAMPUS_LOCATIONS.find(
      (l) => l.name.toLowerCase().includes(term.toLowerCase()) || l.tags.some((t) => t.toLowerCase().includes(term.toLowerCase()))
    );
    if (matched) {
      handleSelectLocation(matched);
    }
  };

  const getCategoryIcon = (category: LocationCategory) => {
    switch (category) {
      case 'Classroom':
        return GraduationCap;
      case 'Lab':
        return FlaskConical;
      case 'Canteen':
        return Coffee;
      case 'Library':
        return BookOpen;
      case 'Parking':
        return Car;
      case 'Hostel':
        return Home;
      case 'Sports':
        return Trophy;
      default:
        return Building2;
    }
  };

  return (
    <div className="bg-[#F4F7FB] min-h-screen p-4 pb-24 font-['Poppins',sans-serif]">
      {/* Search Header Bar */}
      <div className="sticky top-0 z-30 pt-1 pb-3 bg-[#F4F7FB]">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#263D88] absolute left-3.5 top-3.5" />
            <input
              type="text"
              autoFocus
              placeholder="Finding building, lab and classroom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#263D88] focus:border-transparent shadow-xs transition-all text-[#101214] placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 p-0.5 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-[#263D88]"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#263D88] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:border-[#BADDF2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches Section (when search query is empty) */}
      {!searchQuery && recentSearches.length > 0 && (
        <div className="mb-6 bg-white rounded-3xl p-4 border border-slate-100 shadow-xs">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold text-[#101214] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Recent Searches</span>
            </h3>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-[#FF0000] font-semibold hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, i) => (
              <button
                key={i}
                onClick={() => handleRecentClick(term)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F7FB] border border-slate-200/70 text-xs text-slate-700 hover:bg-[#BADDF2]/40 hover:text-[#263D88] transition-colors"
              >
                <MapPin className="w-3 h-3 text-[#53AADF]" />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {searchQuery ? `Results (${filteredLocations.length})` : 'All Campus Locations'}
          </h3>
        </div>

        {filteredLocations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl p-6 border border-slate-100">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No campus location found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try searching for "B304", "Canteen", "Library", "Parking", or "Hostel"
            </p>
          </div>
        ) : (
          filteredLocations.map((loc) => {
            const Icon = getCategoryIcon(loc.category);

            return (
              <div
                key={loc.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-[#53AADF]/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#BADDF2]/40 text-[#263D88] flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#263D88] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#F4F7FB] text-[#263D88] border border-slate-200">
                        {loc.category}
                      </span>
                      {loc.floor && (
                        <span className="text-[10px] font-medium text-slate-400">
                          {loc.floor}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#101214] truncate group-hover:text-[#263D88] transition-colors">
                      {loc.name}
                    </h4>

                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {loc.description}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-medium">
                      <span className="text-[#263D88] font-bold">{loc.distanceMeters}m away</span>
                      <span>•</span>
                      <span>~{loc.walkTimeMin} min walk</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectLocation(loc)}
                  className="shrink-0 py-2 px-3 rounded-xl bg-[#263D88] text-white text-xs font-bold flex items-center gap-1.5 hover:bg-[#1E2F6B] shadow-sm shadow-[#263D88]/20 transition-all active:scale-95"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#53AADF]" />
                  <span>Navigate</span>
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
