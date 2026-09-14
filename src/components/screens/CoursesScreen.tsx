import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import {
  Search,
  X,
  BookOpen,
  GraduationCap,
  Download,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

interface FolderCourse {
  id: string;
  name: string;
  shortCode: string;
  overview: string;
  eligibility: string[];
  fees: {
    perYear: string;
    total: string;
    note: string;
  };
  duration: string;
}

const COURSES_GRID_DATA: FolderCourse[] = [
  {
    id: 'bca',
    name: 'Bachelor in Computer Application (BCA)',
    shortCode: 'BCA',
    overview: 'BCA is a 3-year undergraduate course focused on computer science, software engineering, database systems, and modern IT applications.',
    eligibility: [
      '12th pass (any stream, but Maths/Computer preferred)',
      'Minimum 45-50% aggregate score (depends on college criteria)',
    ],
    fees: {
      perYear: '₹50,000 – ₹2,00,000 per year',
      total: '₹1.5 Lakh – ₹6.0 Lakh (3 years)',
      note: 'State-of-the-art AI labs, campus cloud servers & 100% placement assistance included.',
    },
    duration: '3 Years (6 Semesters)',
  },
  {
    id: 'data-science',
    name: 'B.Sc / M.Sc Data Science',
    shortCode: 'Data Science',
    overview: 'Specialized program covering Machine Learning, Big Data pipelines, Python analytics, Deep Learning, and statistical predictive modeling.',
    eligibility: [
      '10+2 with Mathematics/Statistics as compulsory subject',
      'Minimum 55% aggregate marks from recognized board',
    ],
    fees: {
      perYear: '₹75,000 – ₹2,20,000 per year',
      total: '₹2.2 Lakh – ₹6.6 Lakh',
      note: 'Includes NVIDIA GPU Lab access & Industry Capstone projects.',
    },
    duration: '3 / 4 Years',
  },
  {
    id: 'bsc',
    name: 'B.Sc (Computer Science / IT)',
    shortCode: 'Bs.c',
    overview: 'In-depth scientific curriculum exploring algorithmic theory, mathematics, systems programming, and computer hardware architectures.',
    eligibility: [
      '12th Science Stream with Physics, Chemistry & Maths',
      'Minimum 50% marks',
    ],
    fees: {
      perYear: '₹40,000 – ₹1,50,000 per year',
      total: '₹1.2 Lakh – ₹4.5 Lakh',
      note: 'Merit-based scholarships available for top 10 percentile students.',
    },
    duration: '3 Years',
  },
  {
    id: 'bcom',
    name: 'Bachelor of Commerce (B.Com)',
    shortCode: 'B.COM',
    overview: 'Foundations in financial accounting, corporate auditing, commercial law, taxation, and contemporary banking practices.',
    eligibility: ['12th pass in Commerce or Arts/Science with 45%+'],
    fees: {
      perYear: '₹35,000 – ₹1,20,000 per year',
      total: '₹1.0 Lakh – ₹3.6 Lakh',
      note: 'Includes Tally ERP and GST certified training modules.',
    },
    duration: '3 Years',
  },
  {
    id: 'mcom',
    name: 'Master of Commerce (M.Com)',
    shortCode: 'M.COM',
    overview: 'Advanced postgraduate curriculum in corporate financial reporting, investment analysis, business analytics, and global trade.',
    eligibility: ['B.Com / BBA graduate with minimum 50% marks'],
    fees: {
      perYear: '₹45,000 – ₹1,40,000 per year',
      total: '₹90,000 – ₹2.8 Lakh (2 years)',
      note: 'Evening batch options available for working professionals.',
    },
    duration: '2 Years',
  },
  {
    id: 'btech',
    name: 'B.Tech (Computer Science & Engg)',
    shortCode: 'B.tech',
    overview: 'Comprehensive 4-year engineering program in cloud architectures, AI, cyber-security, distributed systems, and modern full-stack development.',
    eligibility: [
      '12th Science (PCM) with minimum 60% marks',
      'Valid state or national engineering entrance rank (JEE/State CET)',
    ],
    fees: {
      perYear: '₹90,000 – ₹2,50,000 per year',
      total: '₹3.6 Lakh – ₹10 Lakh (4 years)',
      note: 'Top tech tier-1 recruiter tie-ups with average CTC 8.5 LPA.',
    },
    duration: '4 Years (8 Semesters)',
  },
  {
    id: 'mca',
    name: 'Master of Computer Applications (MCA)',
    shortCode: 'MCA',
    overview: 'High-level professional degree emphasizing enterprise software development, cloud infrastructure, AI models, and software testing.',
    eligibility: ['BCA or B.Sc (CS/IT) or any graduate with Maths in 10+2'],
    fees: {
      perYear: '₹60,000 – ₹1,80,000 per year',
      total: '₹1.2 Lakh – ₹3.6 Lakh (2 years)',
      note: 'Mandatory 6-month industrial internship semester.',
    },
    duration: '2 Years',
  },
  {
    id: 'bba',
    name: 'Bachelor of Business Administration (BBA)',
    shortCode: 'BBA',
    overview: 'Core training in strategic leadership, marketing management, human resources, startup entrepreneurship, and financial analytics.',
    eligibility: ['12th pass in any discipline with 50%+'],
    fees: {
      perYear: '₹55,000 – ₹1,80,000 per year',
      total: '₹1.65 Lakh – ₹5.4 Lakh',
      note: 'Incubation cell support with seed funding access.',
    },
    duration: '3 Years',
  },
  {
    id: 'ai-robotics',
    name: 'Artificial Intelligence & Robotics',
    shortCode: 'AI & ML',
    overview: 'Specialized futuristic program focusing on neural networks, computer vision, natural language processing, and autonomous robotic control.',
    eligibility: ['10+2 with PCM and interest in computing'],
    fees: {
      perYear: '₹85,000 – ₹2,40,000 per year',
      total: '₹2.5 Lakh – ₹7.2 Lakh',
      note: 'Robotics lab equipped with ARM robotic kits and ROS simulation.',
    },
    duration: '3 / 4 Years',
  },
  {
    id: 'mdes',
    name: 'Master of Design (M.Des)',
    shortCode: 'M.des',
    overview: 'Postgraduate focus on UI/UX product design, interaction systems, human factors, digital prototyping, and visual brand identity.',
    eligibility: ['Bachelor degree in Design, Architecture, Engineering or Fine Arts'],
    fees: {
      perYear: '₹80,000 – ₹2,10,000 per year',
      total: '₹1.6 Lakh – ₹4.2 Lakh',
      note: 'Design studio access with Wacom Cintiq tablets & VR headsets.',
    },
    duration: '2 Years',
  },
  {
    id: 'bdes',
    name: 'Bachelor of Design (B.Des)',
    shortCode: 'B.des',
    overview: 'Foundational degree in communication design, user research, industrial styling, motion design, and spatial experience crafting.',
    eligibility: ['10+2 with design portfolio evaluation'],
    fees: {
      perYear: '₹75,000 – ₹2,00,000 per year',
      total: '₹3.0 Lakh – ₹8.0 Lakh (4 years)',
      note: 'Annual graduation design showcase with top agency jurors.',
    },
    duration: '4 Years',
  },
  {
    id: 'ba',
    name: 'Bachelor of Arts (B.A)',
    shortCode: 'B.A',
    overview: 'Broad liberal arts education in literature, journalism, psychology, political sciences, and sociology with research methodology.',
    eligibility: ['12th pass (any stream) with 45%+'],
    fees: {
      perYear: '₹25,000 – ₹80,000 per year',
      total: '₹75,000 – ₹2.4 Lakh',
      note: 'Language lab and media studio access.',
    },
    duration: '3 Years',
  },
  {
    id: 'be',
    name: 'Bachelor of Engineering (B.E)',
    shortCode: 'B.E',
    overview: 'Applied engineering courses in Mechanical, Civil, Electrical, and Electronics & Communications disciplines.',
    eligibility: ['10+2 Science (PCM) with 50%+ and state entrance'],
    fees: {
      perYear: '₹70,000 – ₹1,90,000 per year',
      total: '₹2.8 Lakh – ₹7.6 Lakh (4 years)',
      note: 'Modern CAD/CAM and heavy machinery laboratories.',
    },
    duration: '4 Years',
  },
  {
    id: 'cyber',
    name: 'Cyber Security & Ethical Hacking',
    shortCode: 'Cyber Security',
    overview: 'Specialized training in penetration testing, network defense, digital forensics, ISO security compliance, and cryptographic protocols.',
    eligibility: ['10+2 with Computer Science or Mathematics'],
    fees: {
      perYear: '₹70,000 – ₹2,00,000 per year',
      total: '₹2.1 Lakh – ₹6.0 Lakh',
      note: 'Includes certified ethical hacker (CEH) certification roadmap.',
    },
    duration: '3 Years',
  },
  {
    id: 'web-dev',
    name: 'Full-Stack Web Development',
    shortCode: 'Web Development',
    overview: 'Intensive curriculum covering React, Node.js, Next.js, PostgreSQL, Docker, CI/CD pipelines, and cloud native architectures.',
    eligibility: ['10+2 in any stream with basic algorithmic aptitude'],
    fees: {
      perYear: '₹50,000 – ₹1,60,000 per year',
      total: '₹1.5 Lakh – ₹4.8 Lakh',
      note: 'Build 10+ production web apps in team sprints.',
    },
    duration: '3 Years',
  },
  {
    id: 'ca',
    name: 'Chartered Accountancy (CA Prep)',
    shortCode: 'CA',
    overview: 'Integrated coaching for ICAI Foundation, Intermediate, and Final examinations alongside academic degree curriculum.',
    eligibility: ['12th pass with Commerce or Science'],
    fees: {
      perYear: '₹40,000 – ₹1,30,000 per year',
      total: '₹1.2 Lakh – ₹3.9 Lakh',
      note: 'Lectures led by practicing Chartered Accountants and auditors.',
    },
    duration: '3 - 5 Years',
  },
  {
    id: 'cs',
    name: 'Company Secretary (CS Prep)',
    shortCode: 'CS',
    overview: 'Coaching and academic alignment for ICSI Executive and Professional exams focusing on corporate governance and securities laws.',
    eligibility: ['12th pass (any stream except fine arts)'],
    fees: {
      perYear: '₹35,000 – ₹1,10,000 per year',
      total: '₹1.0 Lakh – ₹3.3 Lakh',
      note: 'Moot courts and corporate compliance workshops.',
    },
    duration: '3 Years',
  },
  {
    id: 'cma',
    name: 'Cost & Management Accountancy',
    shortCode: 'CMA',
    overview: 'Rigorous training in industrial cost accounting, corporate budgeting, supply chain finance, and regulatory valuations.',
    eligibility: ['12th pass with 50%+'],
    fees: {
      perYear: '₹40,000 – ₹1,20,000 per year',
      total: '₹1.2 Lakh – ₹3.6 Lakh',
      note: 'Factory site audits and cost management case studies.',
    },
    duration: '3 Years',
  },
  {
    id: 'mbbs',
    name: 'Bachelor of Medicine (MBBS)',
    shortCode: 'MBBS',
    overview: 'Premier clinical degree with campus teaching hospital rotations, human anatomy labs, pharmacology, and surgical residencies.',
    eligibility: [
      '12th Science (PCB) with 50%+ marks',
      'Valid qualified NEET-UG score & state counselling allotment',
    ],
    fees: {
      perYear: '₹1,50,000 – ₹8,00,000 per year (Govt / Semi-Govt)',
      total: '₹7.5 Lakh – ₹40 Lakh (5.5 years)',
      note: '1000-bed attached multi-speciality teaching hospital on campus.',
    },
    duration: '5.5 Years (Includes 1-Yr Internship)',
  },
  {
    id: 'pharmacy',
    name: 'Bachelor of Pharmacy (B.Pharm)',
    shortCode: 'Pharmacy',
    overview: 'Pharmaceutical chemistry, drug formulation, clinical pharmacology, medicinal toxicology, and biotech therapeutics.',
    eligibility: ['12th Science (PCB/PCM) with 50%+ marks'],
    fees: {
      perYear: '₹60,000 – ₹1,80,000 per year',
      total: '₹2.4 Lakh – ₹7.2 Lakh (4 years)',
      note: 'PCI recognized drug discovery pilot laboratory.',
    },
    duration: '4 Years',
  },
  {
    id: 'nursing',
    name: 'B.Sc Nursing',
    shortCode: 'Nursing',
    overview: 'Comprehensive healthcare education in critical care, pediatrics, community medicine, obstetrics, and emergency trauma nursing.',
    eligibility: ['10+2 with Physics, Chemistry, Biology & English (45%+)'],
    fees: {
      perYear: '₹50,000 – ₹1,50,000 per year',
      total: '₹2.0 Lakh – ₹6.0 Lakh (4 years)',
      note: '100% placement across premier hospital networks.',
    },
    duration: '4 Years',
  },
];

interface CoursesScreenProps {
  onBack?: () => void;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({ onBack }) => {
  const { showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCourse, setActiveCourse] = useState<FolderCourse | null>(null);
  const [isAnimatingFolder, setIsAnimatingFolder] = useState<boolean>(false);

  const filteredCourses = COURSES_GRID_DATA.filter((course) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      course.name.toLowerCase().includes(q) ||
      course.shortCode.toLowerCase().includes(q) ||
      course.overview.toLowerCase().includes(q)
    );
  });

  const handleOpenCourse = (course: FolderCourse) => {
    setIsAnimatingFolder(true);
    setTimeout(() => {
      setIsAnimatingFolder(false);
      setActiveCourse(course);
    }, 280);
  };

  return (
    <div id="courses-screen-page" className="bg-[#F4F7FB] min-h-screen pb-24 font-['Poppins',sans-serif]">
      {/* Figma Page 76: Header with circular Back button and centered Title "Courses" */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3.5 border-b border-slate-100 shadow-2xs flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#0C3558] hover:bg-[#12426c] text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs cursor-pointer"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-bold text-[#0C3558] tracking-tight">Courses</h1>

        <div className="w-10 h-10 flex items-center justify-center text-slate-300">
          <GraduationCap className="w-5 h-5 text-[#0C3558]" />
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-md mx-auto sm:max-w-xl md:max-w-2xl">
        {/* Figma Page 76: Search Bar "Finding building,lab and classroom" */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Finding building,lab and classroom"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0C3558] text-[#101214] placeholder:text-slate-400 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Figma Page 76: 3-Column Folder Grid with Blue Folder Icons */}
        <div className="grid grid-cols-3 gap-3.5 pt-1">
          {filteredCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => handleOpenCourse(course)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-transparent hover:bg-white/80 transition-all group cursor-pointer focus:outline-none"
            >
              {/* Folder Icon Illustration with Tab matching Page 76 */}
              <div className="relative w-16 h-14 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                {/* Folder Back Tab */}
                <div className="absolute top-0 left-1 w-6 h-3 bg-[#0C3558] rounded-t-md" />
                {/* Main Folder Body */}
                <div className="absolute top-2 inset-x-0 bottom-0 bg-[#0C3558] rounded-xl shadow-md border-t border-sky-400/40 flex items-center justify-center">
                  <div className="w-4 h-1 rounded-full bg-sky-200/50" />
                </div>
              </div>

              {/* Course Title underneath Folder */}
              <span className="text-[11px] font-bold text-[#0C3558] text-center leading-tight mt-1 line-clamp-2">
                {course.shortCode}
              </span>
            </button>
          ))}
        </div>
      </main>

      {/* Figma Page 77-78: Folder Opening Animation Overlay */}
      {isAnimatingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative flex flex-col items-center">
            {/* 3 Golden/Red Books popping out */}
            <div className="relative w-32 h-28 flex items-center justify-center animate-bounce">
              <div className="absolute -top-3 left-4 w-7 h-10 bg-amber-400 rounded-md shadow-lg rotate-[-12deg] border border-amber-300" />
              <div className="absolute -top-5 left-12 w-8 h-11 bg-rose-500 rounded-md shadow-lg rotate-[4deg] border border-rose-400" />
              <div className="absolute -top-2 right-4 w-7 h-10 bg-emerald-500 rounded-md shadow-lg rotate-[15deg] border border-emerald-400" />
              <div className="w-28 h-18 bg-[#0C3558] rounded-2xl shadow-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-xs font-bold text-white mt-3 drop-shadow">Opening course syllabus...</p>
          </div>
        </div>
      )}

      {/* Figma Page 79, 85, 91: Detailed Course Overview Card Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto border border-slate-100 font-['Poppins',sans-serif]">
            {/* Header: Title & Close */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0C3558]/10 text-[#0C3558] uppercase">
                  {activeCourse.duration}
                </span>
                <h2 className="text-base font-bold text-[#0C3558] mt-1 tracking-tight">
                  {activeCourse.name}
                </h2>
              </div>
              <button
                onClick={() => setActiveCourse(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview / Bullet Point Description */}
            <div className="space-y-1">
              <p className="text-xs text-slate-600 leading-relaxed">
                • {activeCourse.overview}
              </p>
            </div>

            {/* Eligibility Section (Figma Page 79, 85, 91) */}
            <div className="bg-[#F4F7FB] p-3.5 rounded-2xl space-y-2 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C3558]">
                <Sparkles className="w-3.5 h-3.5 text-[#53AADF]" />
                <span>Eligibility:</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1 pl-1">
                {activeCourse.eligibility.map((req, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#0C3558] font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fees Section (Figma Page 79, 85, 91) */}
            <div className="bg-[#0C3558]/5 p-3.5 rounded-2xl space-y-2 border border-[#0C3558]/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0C3558]">Fees:</span>
                <span className="text-xs font-bold text-emerald-700">{activeCourse.fees.perYear}</span>
              </div>
              <p className="text-[11px] text-slate-700 font-semibold">
                Total ({activeCourse.duration}): {activeCourse.fees.total}
              </p>
              <p className="text-[10px] text-slate-500 italic">
                {activeCourse.fees.note}
              </p>
            </div>

            {/* Actions: Download Syllabus Brochure */}
            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={() => {
                  showToast(`Brochure for ${activeCourse.name} downloaded successfully!`);
                  setActiveCourse(null);
                }}
                className="flex-1 py-3 rounded-2xl bg-[#0C3558] hover:bg-[#12426c] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-[#53AADF]" />
                <span>Download Brochure</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
