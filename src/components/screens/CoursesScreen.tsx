import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COURSE_BRANCHES_DATA } from '../../data/mockCampusData';
import { Course } from '../../types';
import {
  GraduationCap,
  Search,
  BookOpen,
  Calendar,
  Layers,
  ArrowLeft,
  CheckCircle,
  Briefcase,
  Download,
} from 'lucide-react';

interface CoursesScreenProps {
  onBack?: () => void;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({ onBack }) => {
  const { showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  // Flatten all courses across branches
  const allCourses = COURSE_BRANCHES_DATA.flatMap((b) => b.courses);

  const filteredCourses = allCourses.filter((c) => {
    const matchesBranch =
      selectedBranchId === 'all' ||
      COURSE_BRANCHES_DATA.find((b) => b.id === selectedBranchId)?.courses.some((item) => item.id === c.id);
    const matchesSearch =
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesBranch && matchesSearch;
  });

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
            <h1 className="text-base font-bold text-[#101214] tracking-tight">Academic Courses & Branches</h1>
            <p className="text-[11px] text-slate-400">BCA, B.Tech, M.Des, BBA, MCA & Medical programs</p>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-indigo-50 text-[#263D88]">
          <GraduationCap className="w-4 h-4" />
        </div>
      </div>

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* Search & Branch Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search BCA, B.Tech, M.Des, MBA, Data Science..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-[#263D88] text-[#101214]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedBranchId('all')}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedBranchId === 'all'
                  ? 'bg-[#263D88] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Branches
            </button>
            {COURSE_BRANCHES_DATA.map((branch) => (
              <button
                key={branch.id}
                onClick={() => setSelectedBranchId(branch.id)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedBranchId === branch.id
                    ? 'bg-[#263D88] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {branch.name}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Cards List */}
        <div className="space-y-3">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => setActiveCourse(course)}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs hover:border-[#53AADF] hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#BADDF2]/50 text-[#263D88]">
                      {course.level} • {course.shortCode}
                    </span>
                    <span className="text-xs text-slate-400 truncate max-w-[160px]">{course.branch}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#101214]">{course.name}</h3>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[#263D88]">
                    ₹{course.semesterFees.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-slate-400">per semester</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">{course.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>{course.duration}</span>
                  <span>•</span>
                  <span>{course.totalSemesters} Semesters</span>
                </div>
                <span className="text-xs font-bold text-[#263D88]">View Syllabus →</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Course Detail Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#263D88] uppercase">{activeCourse.level} Program</span>
                <h3 className="text-base font-bold text-[#101214]">{activeCourse.name}</h3>
              </div>
              <button
                onClick={() => setActiveCourse(null)}
                className="p-1 rounded-full bg-slate-100 text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{activeCourse.description}</p>

            <div className="bg-[#F4F7FB] p-3.5 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <strong className="text-slate-800">{activeCourse.duration}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Semester Tuition Fee:</span>
                <strong className="text-[#263D88]">₹{activeCourse.semesterFees.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Eligibility:</span>
                <strong className="text-emerald-700 truncate max-w-[180px]">{activeCourse.eligibility}</strong>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-1.5">Key Focus Highlights</h4>
              <div className="flex flex-wrap gap-1.5">
                {activeCourse.highlights.map((item, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-[#BADDF2]/40 text-[11px] text-[#263D88] font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                showToast(`Brochure for ${activeCourse.name} downloaded!`);
                setActiveCourse(null);
              }}
              className="w-full py-3 rounded-xl bg-[#263D88] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#1E2F6B]"
            >
              <Download className="w-3.5 h-3.5 text-[#53AADF]" />
              <span>Download Syllabus Brochure</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
