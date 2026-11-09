import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

/**
 * Slide 1 Isometric Illustration:
 * Candidate at an isometric desk browsing Govt, Bank & NGO Job Circulars on a monitor
 * with a document printer/folder stack and graphic tablet (matching reference style).
 */
function JobPortalIllustration() {
  return (
    <svg
      width="270"
      height="225"
      viewBox="0 0 320 265"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      {/* Soft Ground Shadow under Desk & Chair */}
      <ellipse cx="160" cy="232" rx="124" ry="22" fill="#e2e8f0" opacity="0.65" />
      <ellipse cx="152" cy="228" rx="95" ry="15" fill="#cbd5e1" opacity="0.45" />

      {/* Isometric Desk Back & Left Legs */}
      <path d="M52 146V218" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
      <path d="M118 186V248" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
      <path d="M186 84V156" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
      <path d="M254 122V194" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

      {/* Isometric Desk Surface (Warm Cream / Soft Yellow 3D Slab) */}
      {/* Desk Side Thickness */}
      <path
        d="M38 140L118 188L266 116L266 125L118 197L38 149Z"
        fill="#d97706"
        opacity="0.35"
      />
      {/* Desk Top Face */}
      <path
        d="M38 140L186 68L266 116L118 188L38 140Z"
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M44 140L186 71L260 116L118 184L44 140Z"
        fill="#fffbeb"
      />

      {/* Isometric Monitor Stand */}
      <path d="M142 114L162 126L148 134L128 122Z" fill="#cbd5e1" />
      <path d="M142 98V122L152 127V103Z" fill="#94a3b8" />

      {/* Isometric Monitor Frame (3D Angled) */}
      <path
        d="M100 54L184 13L190 16L190 88L106 129L100 126Z"
        fill="#1e293b"
      />
      {/* Monitor Front Bezel */}
      <path
        d="M104 56L188 15L188 86L104 127Z"
        fill="#0f172a"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Monitor Screen */}
      <path
        d="M108 60L184 23L184 78L108 115Z"
        fill="#1e3a8a"
      />
      {/* Monitor Bottom Chin Bar */}
      <path
        d="M104 117L188 76L188 86L104 127Z"
        fill="#f8fafc"
      />
      <circle cx="146" cy="101" r="2.2" fill="#334155" />

      {/* Sidebar UI inside Monitor */}
      <path d="M111 62L128 54L128 101L111 109Z" fill="#1d4ed8" />
      <path d="M114 66L125 61" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
      <path d="M114 72L123 68" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
      <path d="M114 78L124 73" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />

      {/* Main Grid Lines inside Monitor */}
      <path d="M132 52L156 40L156 86L132 98Z" fill="#2563eb" opacity="0.45" />

      {/* Floating Pop-out Job Circular Window on Right of Monitor */}
      <path
        d="M150 44L198 20L198 62L150 86Z"
        fill="#ffffff"
        stroke="#fde68a"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* Golden Graphic/Banner inside Floating Window */}
      <path
        d="M154 47L194 27L194 55L154 75Z"
        fill="#fef3c7"
      />
      <circle cx="184" cy="39" r="3.5" fill="#f59e0b" />
      <path
        d="M154 75L166 56L176 61L185 47L194 55L154 75Z"
        fill="#f59e0b"
      />

      {/* Circular Printer / Gazette Box on Left of Desk */}
      <path
        d="M52 128L82 113L104 126L74 141Z"
        fill="#d97706"
      />
      <path
        d="M52 128L74 141V155L52 142Z"
        fill="#92400e"
      />
      <path
        d="M74 141L104 126V140L74 155Z"
        fill="#78350f"
      />
      <path
        d="M58 127L80 116L96 125L74 136Z"
        fill="#fbbf24"
      />
      <circle cx="77" cy="126" r="3.2" fill="#ffffff" />
      {/* Printed Circular Sheet coming out */}
      <path
        d="M78 148L96 139L108 146L90 155Z"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="1"
      />

      {/* Isometric Keyboard on Desk */}
      <path
        d="M126 146L166 126L176 132L136 152Z"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M132 146L164 130" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M136 149L168 133" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />

      {/* Small Note / Circular Sheet on Front Left of Desk */}
      <path
        d="M94 158L114 148L128 156L108 166Z"
        fill="#ffffff"
        stroke="#e2e8f0"
        strokeWidth="1.2"
      />
      <path d="M102 157L113 152" stroke="#64748b" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M106 161L118 155" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" />

      {/* Drawing / Study Tablet on Right Side of Desk */}
      <path
        d="M172 118L198 105L214 114L188 127Z"
        fill="#d97706"
        stroke="#92400e"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M177 118L197 108L208 114L188 124Z"
        fill="#334155"
      />

      {/* Color Swatches / Reference Cards near Top of Desk */}
      <path d="M182 94L204 88L206 93L184 99Z" fill="#1e293b" />
      <path d="M184 97L208 94L209 99L185 102Z" fill="#64748b" />
      <path d="M185 100L209 101L208 106L184 105Z" fill="#cbd5e1" />

      {/* Candidate Character Sitting in Chair */}
      {/* Chair Legs */}
      <path d="M216 184L198 218" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M226 186L224 228" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M236 182L254 216" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M220 184L208 208" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />

      {/* Candidate Legs & Shoes */}
      {/* Back Leg */}
      <path d="M214 156L194 166L196 192" stroke="#334155" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="190" cy="196" rx="10" ry="5" fill="#78350f" />
      <path d="M181 196C181 193 185 192 188 194" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />

      {/* Front Leg */}
      <path d="M224 164L184 176L182 206" stroke="#1e293b" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="166" y="202" width="22" height="9" rx="4.5" fill="#78350f" />
      <rect x="166" y="203" width="7" height="7" rx="3.5" fill="#ffffff" />

      {/* Ergonomic Yellow Chair Seat & Backrest */}
      <path
        d="M196 164C196 156 226 152 242 162C248 166 254 132 260 134C268 136 268 176 248 184C228 192 196 174 196 164Z"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="2"
      />
      <path
        d="M236 178C252 174 262 152 260 134C266 136 267 174 248 184Z"
        fill="#fbbf24"
      />

      {/* Candidate Torso (White T-shirt with Dark Navy Raglan Sleeves) */}
      <path
        d="M214 118C222 114 238 115 244 122L240 166C228 170 214 166 210 158L214 118Z"
        fill="#f8fafc"
      />
      {/* Left Sleeve & Raised Arm Holding Stylus Pen */}
      <path
        d="M216 120L202 128L194 110"
        stroke="#fda4af"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M218 119L205 127"
        stroke="#1e293b"
        strokeWidth="11"
        strokeLinecap="round"
      />
      {/* Stylus Pen in Hand */}
      <path d="M185 108L201 100" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />

      {/* Right Sleeve & Arm Resting by Chair */}
      <path
        d="M242 122L252 142L246 164"
        stroke="#fda4af"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M241 121L250 138"
        stroke="#1e293b"
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* Candidate Head, Glasses & Hair */}
      {/* Neck */}
      <rect x="223" y="108" width="11" height="10" rx="4" fill="#fb7185" />
      {/* Face */}
      <rect x="214" y="84" width="26" height="27" rx="11" fill="#fda4af" />
      {/* Ear */}
      <circle cx="241" cy="98" r="4" fill="#fda4af" />
      {/* Hair */}
      <path
        d="M213 91C212 81 220 76 230 77C238 77 244 82 243 92C240 87 235 85 227 85C220 85 216 88 213 91Z"
        fill="#92400e"
      />
      {/* Glasses */}
      <circle cx="221" cy="96" r="4.2" stroke="#475569" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.35" />
      <circle cx="232" cy="96" r="4.2" stroke="#475569" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.35" />
      <path d="M225 96H228" stroke="#475569" strokeWidth="1.5" />
      {/* Eyes & Smile */}
      <circle cx="221" cy="96" r="1.3" fill="#0f172a" />
      <circle cx="232" cy="96" r="1.3" fill="#0f172a" />
      <path d="M224 104C226 105.5 229 105.5 231 104" stroke="#be123c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Slide 2 Isometric Illustration:
 * Exam Preparation, Admit Card & Live MCQ Result Architecture Desk.
 */
function ExamPrepIllustration() {
  return (
    <svg
      width="270"
      height="225"
      viewBox="0 0 320 265"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      {/* Ground Shadow */}
      <ellipse cx="160" cy="232" rx="124" ry="22" fill="#e2e8f0" opacity="0.65" />
      <ellipse cx="152" cy="228" rx="95" ry="15" fill="#cbd5e1" opacity="0.45" />

      {/* Isometric Desk Legs */}
      <path d="M52 146V218" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
      <path d="M118 186V248" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
      <path d="M186 84V156" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
      <path d="M254 122V194" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

      {/* Isometric Desk Surface */}
      <path
        d="M38 140L118 188L266 116L266 125L118 197L38 149Z"
        fill="#d97706"
        opacity="0.35"
      />
      <path
        d="M38 140L186 68L266 116L118 188L38 140Z"
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M44 140L186 71L260 116L118 184L44 140Z"
        fill="#fffbeb"
      />

      {/* Stack of Academic Books on Left Corner of Desk */}
      {/* Bottom Book (Blue) */}
      <path d="M54 132L84 117L104 129L74 144Z" fill="#2563eb" />
      <path d="M54 132L74 144V151L54 139Z" fill="#1d4ed8" />
      <path d="M74 144L104 129V136L74 151Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
      {/* Top Book (Amber/Gold) */}
      <path d="M58 124L86 110L104 121L76 135Z" fill="#f59e0b" />
      <path d="M58 124L76 135V141L58 130Z" fill="#d97706" />
      <path d="M76 135L104 121V127L76 141Z" fill="#fffbeb" stroke="#fde68a" strokeWidth="1" />

      {/* Monitor Stand & Isometric Exam Screen */}
      <path d="M142 114L162 126L148 134L128 122Z" fill="#cbd5e1" />
      <path d="M142 98V122L152 127V103Z" fill="#94a3b8" />
      <path d="M100 54L184 13L190 16L190 88L106 129L100 126Z" fill="#1e293b" />
      <path
        d="M104 56L188 15L188 86L104 127Z"
        fill="#0f172a"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M108 60L184 23L184 78L108 115Z" fill="#312e81" />
      <path d="M104 117L188 76L188 86L104 127Z" fill="#f8fafc" />
      <circle cx="146" cy="101" r="2.2" fill="#334155" />

      {/* MCQ Options & Progress Bars on Monitor */}
      <path d="M114 66L144 51" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
      <path d="M114 75L140 62" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
      <path d="M114 84L142 70" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
      <path d="M114 93L136 82" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />

      {/* Floating Admit Card & Trophy Result Panel */}
      <path
        d="M150 42L200 18L200 60L150 84Z"
        fill="#ffffff"
        stroke="#fde68a"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M155 46L195 26L195 54L155 74Z" fill="#fef3c7" />
      {/* Trophy / Star Badge inside Floating Card */}
      <circle cx="175" cy="48" r="9" fill="#f59e0b" />
      <path d="M171 48L174 51L180 45" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Open Exam Answer Sheet & Pencil on Desk */}
      <path
        d="M116 148L156 128L174 139L134 159Z"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M125 148L152 134" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M130 152L157 138" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      <path d="M135 155L162 141" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

      {/* Isometric Graduation Cap on Top Right of Desk */}
      <path d="M176 96L198 85L220 96L198 107Z" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.2" />
      <path d="M186 101V109C186 112 210 112 210 109V101" fill="#334155" />
      <path d="M214 99L218 111" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

      {/* Candidate Character at Desk */}
      <path d="M216 184L198 218" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M226 186L224 228" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M236 182L254 216" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M214 156L194 166L196 192" stroke="#334155" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="190" cy="196" rx="10" ry="5" fill="#78350f" />
      <path d="M224 164L184 176L182 206" stroke="#1e293b" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="166" y="202" width="22" height="9" rx="4.5" fill="#78350f" />
      <rect x="166" y="203" width="7" height="7" rx="3.5" fill="#ffffff" />

      {/* Chair */}
      <path
        d="M196 164C196 156 226 152 242 162C248 166 254 132 260 134C268 136 268 176 248 184C228 192 196 174 196 164Z"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="2"
      />
      <path d="M236 178C252 174 262 152 260 134C266 136 267 174 248 184Z" fill="#fbbf24" />

      {/* Torso & Arms */}
      <path d="M214 118C222 114 238 115 244 122L240 166C228 170 214 166 210 158L214 118Z" fill="#f8fafc" />
      <path d="M216 120L198 130L184 122" stroke="#fda4af" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M218 119L203 128" stroke="#312e81" strokeWidth="11" strokeLinecap="round" />
      <path d="M176 118L190 125" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
      <path d="M242 122L252 142L246 164" stroke="#fda4af" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M241 121L250 138" stroke="#312e81" strokeWidth="11" strokeLinecap="round" />

      {/* Head */}
      <rect x="223" y="108" width="11" height="10" rx="4" fill="#fb7185" />
      <rect x="214" y="84" width="26" height="27" rx="11" fill="#fda4af" />
      <circle cx="241" cy="98" r="4" fill="#fda4af" />
      <path d="M213 91C212 81 220 76 230 77C238 77 244 82 243 92C240 87 235 85 227 85C220 85 216 88 213 91Z" fill="#78350f" />
      <circle cx="221" cy="96" r="4.2" stroke="#475569" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.35" />
      <circle cx="232" cy="96" r="4.2" stroke="#475569" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.35" />
      <path d="M225 96H228" stroke="#475569" strokeWidth="1.5" />
      <circle cx="221" cy="96" r="1.3" fill="#0f172a" />
      <circle cx="232" cy="96" r="1.3" fill="#0f172a" />
      <path d="M224 104C226 105.5 229 105.5 231 104" stroke="#be123c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Slide 3 Isometric Illustration:
 * Smart Filter (District & Qualification) & Saved Circular Organizer Desk.
 */
function SmartFilterIllustration() {
  return (
    <svg
      width="270"
      height="225"
      viewBox="0 0 320 265"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    >
      {/* Ground Shadow */}
      <ellipse cx="160" cy="232" rx="124" ry="22" fill="#e2e8f0" opacity="0.65" />
      <ellipse cx="152" cy="228" rx="95" ry="15" fill="#cbd5e1" opacity="0.45" />

      {/* Isometric Desk Legs */}
      <path d="M52 146V218" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
      <path d="M118 186V248" stroke="#1e293b" strokeWidth="7" strokeLinecap="round" />
      <path d="M186 84V156" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
      <path d="M254 122V194" stroke="#334155" strokeWidth="6" strokeLinecap="round" />

      {/* Isometric Desk Surface */}
      <path
        d="M38 140L118 188L266 116L266 125L118 197L38 149Z"
        fill="#d97706"
        opacity="0.35"
      />
      <path
        d="M38 140L186 68L266 116L118 188L38 140Z"
        fill="#fef3c7"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M44 140L186 71L260 116L118 184L44 140Z"
        fill="#fffbeb"
      />

      {/* Saved Circular File Organizer Box on Left of Desk */}
      <path d="M56 126L84 112L104 124L76 138Z" fill="#059669" />
      <path d="M56 126L76 138V152L56 140Z" fill="#047857" />
      <path d="M76 138L104 124V138L76 152Z" fill="#065f46" />
      {/* Bookmark File Tabs sticking out */}
      <path d="M64 122L82 113L88 117L70 126Z" fill="#fbbf24" />
      <path d="M72 126L90 117L96 121L78 130Z" fill="#ffffff" />

      {/* Monitor Stand & Isometric Filter Screen */}
      <path d="M142 114L162 126L148 134L128 122Z" fill="#cbd5e1" />
      <path d="M142 98V122L152 127V103Z" fill="#94a3b8" />
      <path d="M100 54L184 13L190 16L190 88L106 129L100 126Z" fill="#1e293b" />
      <path
        d="M104 56L188 15L188 86L104 127Z"
        fill="#0f172a"
        stroke="#fbbf24"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M108 60L184 23L184 78L108 115Z" fill="#064e3b" />
      <path d="M104 117L188 76L188 86L104 127Z" fill="#f8fafc" />
      <circle cx="146" cy="101" r="2.2" fill="#334155" />

      {/* Filter Bars inside Monitor */}
      <path d="M114 66L142 52" stroke="#6ee7b7" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M114 76L138 64" stroke="#fde68a" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M114 86L144 71" stroke="#a7f3d0" strokeWidth="3.5" strokeLinecap="round" />

      {/* Floating Search & Bookmark Card on Monitor */}
      <path
        d="M150 42L200 18L200 60L150 84Z"
        fill="#ffffff"
        stroke="#fde68a"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M155 46L195 26L195 54L155 74Z" fill="#fef3c7" />
      {/* Magnifying Glass Icon inside Floating Card */}
      <circle cx="173" cy="46" r="7" stroke="#d97706" strokeWidth="2.5" fill="#ffffff" />
      <path d="M178 51L184 57" stroke="#d97706" strokeWidth="2.8" strokeLinecap="round" />

      {/* Keyboard & Bookmarked Circular Cards on Desk */}
      <path
        d="M124 146L164 126L174 132L134 152Z"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M130 146L162 130" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
      <path
        d="M174 116L200 103L216 112L190 125Z"
        fill="#f59e0b"
        stroke="#b45309"
        strokeWidth="1.4"
      />
      <path d="M179 116L199 106L210 112L190 122Z" fill="#ffffff" />

      {/* Candidate Character at Desk */}
      <path d="M216 184L198 218" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M226 186L224 228" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M236 182L254 216" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M214 156L194 166L196 192" stroke="#334155" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="190" cy="196" rx="10" ry="5" fill="#78350f" />
      <path d="M224 164L184 176L182 206" stroke="#1e293b" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="166" y="202" width="22" height="9" rx="4.5" fill="#78350f" />
      <rect x="166" y="203" width="7" height="7" rx="3.5" fill="#ffffff" />

      {/* Chair */}
      <path
        d="M196 164C196 156 226 152 242 162C248 166 254 132 260 134C268 136 268 176 248 184C228 192 196 174 196 164Z"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="2"
      />
      <path d="M236 178C252 174 262 152 260 134C266 136 267 174 248 184Z" fill="#fbbf24" />

      {/* Torso & Arms */}
      <path d="M214 118C222 114 238 115 244 122L240 166C228 170 214 166 210 158L214 118Z" fill="#f8fafc" />
      <path d="M216 120L202 128L194 110" stroke="#fda4af" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M218 119L205 127" stroke="#065f46" strokeWidth="11" strokeLinecap="round" />
      <path d="M185 108L201 100" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
      <path d="M242 122L252 142L246 164" stroke="#fda4af" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M241 121L250 138" stroke="#065f46" strokeWidth="11" strokeLinecap="round" />

      {/* Head */}
      <rect x="223" y="108" width="11" height="10" rx="4" fill="#fb7185" />
      <rect x="214" y="84" width="26" height="27" rx="11" fill="#fda4af" />
      <circle cx="241" cy="98" r="4" fill="#fda4af" />
      <path d="M213 91C212 81 220 76 230 77C238 77 244 82 243 92C240 87 235 85 227 85C220 85 216 88 213 91Z" fill="#92400e" />
      <circle cx="221" cy="96" r="4.2" stroke="#475569" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.35" />
      <circle cx="232" cy="96" r="4.2" stroke="#475569" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.35" />
      <path d="M225 96H228" stroke="#475569" strokeWidth="1.5" />
      <circle cx="221" cy="96" r="1.3" fill="#0f172a" />
      <circle cx="232" cy="96" r="1.3" fill="#0f172a" />
      <path d="M224 104C226 105.5 229 105.5 231 104" stroke="#be123c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const slides = [
  {
    id: 1,
    title: 'সব চাকরির খবর এক জায়গায়',
    titleEn: 'All Job Circulars in One Place',
    subtitle: 'শিক্ষা মন্ত্রণালয়, পুলিশ, ব্যাংক, এনজিও ও প্রাইভেট চাকরির নিয়োগ বিজ্ঞপ্তি পান সবার আগে।',
    subtitleEn: 'Get notification of Government, Bank, NGO, and private job circulars first.',
    illustration: <JobPortalIllustration />
  },
  {
    id: 2,
    title: 'পরীক্ষার নোটিশ ও রেজাল্ট',
    titleEn: 'Exam Dates & Results',
    subtitle: 'অ্যাডমিট কার্ড ডাউনলোড, পরীক্ষার সময়সূচি এবং ফলাফলের নোটিফিকেশন পান সাথে সাথে।',
    subtitleEn: 'Download admit cards, get exam schedules, and receive instant result alerts.',
    illustration: <ExamPrepIllustration />
  },
  {
    id: 3,
    title: 'স্মার্ট ফিল্টার ও বুকমার্ক',
    titleEn: 'Smart Filter & Bookmarks',
    subtitle: 'আপনার যোগ্যতা ও জেলা অনুযায়ী চাকরি খুঁজুন এবং প্রয়োজনীয় সার্কুলার বুকমার্ক করে রাখুন।',
    subtitleEn: 'Filter jobs by your educational qualification and district, and bookmark circulars.',
    illustration: <SmartFilterIllustration />
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasAgreedDisclaimer, setHasAgreedDisclaimer] = useState(false);
  const isEn = state.language === 'en';
  const isDark = state.theme === 'dark';

  const finishOnboarding = () => {
    dispatch({ type: 'SET_ONBOARDING_SEEN' });

    try {
      const OneSignal = window.OneSignal || (window.plugins && window.plugins.OneSignal);
      if (OneSignal && OneSignal.Notifications && typeof OneSignal.Notifications.requestPermission === 'function') {
        OneSignal.Notifications.requestPermission(true).catch(err => console.error('Onboarding: Permission error:', err));
      }
    } catch (e) {
      console.error('Onboarding: Push prompt failed:', e);
    }

    navigate('/home', { replace: true });
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const slide = slides[currentSlide];

  if (!hasAgreedDisclaimer) {
    return (
      <div
        className="onboarding-screen disclaimer-screen"
        style={{
          justifyContent: 'space-between',
          background: isDark
            ? 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)'
        }}
      >
        <div style={{ height: '36px', paddingTop: 'var(--safe-area-top)' }} />

        <div className="onboarding-hero" style={{ padding: '0 10px', width: '100%', boxSizing: 'border-box' }}>
          <div
            style={{
              background: 'transparent',
              border: 'none',
              width: '100%',
              maxWidth: '360px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 900,
                color: isDark ? '#f8fafc' : '#0f172a',
                marginBottom: '16px',
                letterSpacing: '-0.5px',
                textAlign: 'center',
                marginTop: 0
              }}
            >
              Disclaimer
            </h2>

            <p
              style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: isDark ? '#cbd5e1' : '#334155',
                textAlign: 'center',
                margin: 0,
                fontWeight: '500'
              }}
            >
              <span style={{ fontWeight: '800', color: isDark ? '#f8fafc' : '#1e293b' }}>Live Circular</span> is an{' '}
              <span style={{ fontWeight: '700', color: '#dc2626' }}>independent platform</span> and has{' '}
              <span style={{ fontWeight: '700', color: '#dc2626' }}>no affiliation</span> with the government of Bangladesh or any government agency. All government job notices are{' '}
              <span style={{ fontWeight: '700', color: isDark ? '#f8fafc' : '#1e293b' }}>aggregated</span> from public official gazettes and portals.
            </p>
          </div>
        </div>

        <div>
          <button
            className="btn btn-block"
            onClick={() => setHasAgreedDisclaimer(true)}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              boxShadow: '0 6px 18px rgba(16, 185, 129, 0.25)',
              height: '46px',
              fontSize: '14px',
              fontWeight: 800,
              borderRadius: '12px'
            }}
          >
            <span>I Understand</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-screen">
      {/* Top Header Controls */}
      <div className="onboarding-top-bar" style={{ paddingTop: 'var(--safe-area-top)' }}>
        <span className="onboarding-step-chip">
          {currentSlide + 1} / {slides.length}
        </span>
        <button
          className="onboarding-skip-btn"
          onClick={finishOnboarding}
        >
          {isEn ? 'Skip' : 'এড়িয়ে যান'}
        </button>
      </div>

      {/* Isometric Educational & Career Workspace Illustration (Static, Smooth & Polished) */}
      <div className="onboarding-hero">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}
        >
          {slide.illustration}
        </div>
      </div>

      {/* Slide Content Box */}
      <div className="onboarding-content-box">
        <h1 className="onboarding-slide-title">{isEn ? slide.titleEn : slide.title}</h1>
        <p className="onboarding-slide-desc">{isEn ? slide.subtitleEn : slide.subtitle}</p>
      </div>

      {/* Bottom Controls Area */}
      <div>
        {/* Pagination Dots */}
        <div className="onboarding-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`onboarding-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          className="btn btn-block"
          onClick={handleNext}
          style={{
            background: currentSlide === slides.length - 1
              ? 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)'
              : 'var(--primary)',
            color: 'white',
            boxShadow: '0 6px 18px rgba(26, 86, 219, 0.25)',
            height: '46px',
            fontSize: '14px',
            fontWeight: 800,
            borderRadius: '12px'
          }}
        >
          <span>
            {currentSlide === slides.length - 1
              ? (isEn ? 'Get Started' : 'শুরু করুন')
              : (isEn ? 'Next' : 'পরবর্তী')}
          </span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
