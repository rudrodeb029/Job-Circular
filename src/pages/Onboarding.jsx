import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from '../components/Icons';
import { useAppContext } from '../context/AppContext';

/**
 * Shared Isometric Candidate Character:
 * Properly proportioned 3/4 isometric seated character matching the reference illustration
 * (natural warm skin tone, swept-up hair, sleek glasses, raglan T-shirt, raised stylus hand,
 * relaxed side arm, ergonomic yellow shell chair, and both seated legs with sneakers).
 */
function IsometricCandidateCharacter({ sleeveColor = '#1e293b' }) {
  return (
    <g>
      {/* Chair Metal Legs & Cross-Braces */}
      <path d="M222 182L204 216" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M205 214L204 216" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M232 184L226 226" stroke="#334155" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M226 224L226 226" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M242 181L258 214" stroke="#475569" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M257 212L258 214" stroke="#f59e0b" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M236 182L242 208" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round" />
      {/* Thin Wire Crossbars on Chair Base */}
      <path d="M214 198L244 196" stroke="#64748b" strokeWidth="1.3" />
      <path d="M222 186L248 200" stroke="#64748b" strokeWidth="1.2" />
      <path d="M240 185L212 199" stroke="#64748b" strokeWidth="1.2" />

      {/* Ergonomic Yellow Shell Chair (Backrest & Seat Base) */}
      <path
        d="M200 163C200 155 226 151 244 159C250 162 254 131 261 132C269 134 269 175 250 183C231 191 200 173 200 163Z"
        fill="#f59e0b"
        stroke="#d97706"
        strokeWidth="1.8"
      />
      {/* Chair Inner Shadow Cushion */}
      <path
        d="M204 163C206 157 227 154 243 161C247 163 251 144 256 138C257 152 254 171 243 177C229 183 204 170 204 163Z"
        fill="#d97706"
        opacity="0.55"
      />
      {/* Chair Outer Highlight */}
      <path
        d="M240 179C254 175 263 152 261 132C267 134 268 173 250 183Z"
        fill="#fbbf24"
      />

      {/* Candidate Seated Legs & Sneakers (Both legs clearly visible in 3/4 isometric view) */}
      {/* Right Leg (Far / Left in view) */}
      <path
        d="M223 156L197 166L197 192"
        stroke="#334155"
        strokeWidth="10.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right Sock */}
      <rect x="193" y="190" width="8" height="6" rx="2" fill="#f8fafc" />
      {/* Right Sneaker */}
      <path
        d="M180 198C180 194.5 185 193 192 193H201C202.5 193 203.5 194.5 203.5 196.5V199.5C203.5 200.8 202.5 201.5 201 201.5H182C180.8 201.5 180 200 180 198Z"
        fill="#854d0e"
      />
      {/* Right Sneaker White Toe & Sole */}
      <path d="M180 198C180 195.2 183 194 186 194.2V201H182C180.8 201 180 200 180 198Z" fill="#ffffff" />
      <rect x="180" y="199.8" width="23.5" height="2.2" rx="1.1" fill="#ffffff" />
      <path d="M189 194.5L191 197" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M192.5 194.2L194.5 196.8" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />

      {/* Left Leg (Near / Right in view) */}
      <path
        d="M235 161L209 172L209 199"
        stroke="#1e293b"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Left Sock */}
      <rect x="205" y="197" width="8" height="6" rx="2" fill="#f8fafc" />
      {/* Left Sneaker */}
      <path
        d="M192 205C192 201.5 197 200 204 200H213C214.5 200 215.5 201.5 215.5 203.5V206.5C215.5 207.8 214.5 208.5 213 208.5H194C192.8 208.5 192 207 192 205Z"
        fill="#78350f"
      />
      {/* Left Sneaker White Toe & Sole */}
      <path d="M192 205C192 202.2 195 201 198 201.2V208H194C192.8 208 192 207 192 205Z" fill="#ffffff" />
      <rect x="192" y="206.8" width="23.5" height="2.2" rx="1.1" fill="#ffffff" />
      <path d="M201 201.5L203 204" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M204.5 201.2L206.5 203.8" stroke="#ffffff" strokeWidth="1.3" strokeLinecap="round" />

      {/* Candidate Torso (White Raglan T-Shirt with Subtle Side Shading) */}
      <path
        d="M216 116C222 113 236 113 242 118L244 159C235 165 220 164 214 156L216 116Z"
        fill="#ffffff"
      />
      {/* Torso Right-Side Subtle Shadow */}
      <path
        d="M235 115L242 118L244 159C240 162 236 163 232 163L235 115Z"
        fill="#e2e8f0"
        opacity="0.6"
      />
      {/* Crew-Neck Collar */}
      <path
        d="M222 115C225 118.5 232 118.5 235 115"
        stroke="#cbd5e1"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Right Arm (Viewer's Left — Directed Downward Following Marked Path) */}
      {/* Continuous Bare Skin Arm & Hand */}
      <path
        d="M207 131L202 144L199 156"
        stroke="#f4a594"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="199" cy="158" r="3.8" fill="#f4a594" />
      {/* Raglan Right Short Sleeve */}
      <path
        d="M222 115C214 116 207 122 203 133L211 137C214 129 217 124 222 121Z"
        fill={sleeveColor}
      />

      {/* Left Arm (Viewer's Right — Relaxed Along Chair Backrest) */}
      {/* Continuous Bare Skin Arm & Hand */}
      <path
        d="M245 130L251 144L249 158"
        stroke="#f4a594"
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="249" cy="159.5" r="3.8" fill="#f4a594" />
      {/* Raglan Left Short Sleeve */}
      <path
        d="M235 116C242 117 248 123 252 133L244 137C241 129 238 124 234 121Z"
        fill={sleeveColor}
      />

      {/* Neck & Head (3/4 Isometric Turn Looking Slightly Left-Forward) */}
      {/* Neck with Chin Shadow */}
      <rect x="224" y="106" width="9.5" height="11" rx="4" fill="#e58e7e" />
      {/* Right Ear */}
      <circle cx="242" cy="96" r="3.6" fill="#f4a594" />
      <circle cx="242" cy="96" r="1.6" fill="#e58e7e" />
      {/* Sculpted 3/4 Face */}
      <path
        d="M215 92C215 83.5 220.5 79 228.5 79C236.5 79 242 84 242 93C242 101.5 237 108.5 228 108.5C220 108.5 215 102.5 215 92Z"
        fill="#f4a594"
      />
      {/* Subtle Cheek Warmth */}
      <circle cx="219.5" cy="99" r="2.6" fill="#eb9080" opacity="0.55" />
      <circle cx="234.5" cy="99" r="2.8" fill="#eb9080" opacity="0.55" />

      {/* Eyebrows */}
      <path d="M217 89.8C218.5 89 221.5 89 223 89.8" stroke="#6b3e1b" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M227.5 89.8C229 89 232 89 233.5 89.8" stroke="#6b3e1b" strokeWidth="1.3" strokeLinecap="round" />

      {/* Eyes */}
      <circle cx="220" cy="94.8" r="1.2" fill="#1e293b" />
      <circle cx="230.5" cy="94.8" r="1.2" fill="#1e293b" />

      {/* Sleek Rectangular-Rounded Eyeglasses */}
      <rect x="215.8" y="91.8" width="8.4" height="6" rx="2" stroke="#334155" strokeWidth="1.35" fill="#ffffff" fillOpacity="0.28" />
      <rect x="226.4" y="91.8" width="8.4" height="6" rx="2" stroke="#334155" strokeWidth="1.35" fill="#ffffff" fillOpacity="0.28" />
      <path d="M224.2 94.4H226.4" stroke="#334155" strokeWidth="1.35" />
      <path d="M234.8 94.2L241.2 94.8" stroke="#334155" strokeWidth="1.25" />

      {/* Subtle Nose Bridge & Calm Focused Mouth */}
      <path d="M224.5 95.5L223 99.5L225 100" stroke="#d47666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M223.8 103.3C225.5 104.3 228 104.3 229.8 103.1" stroke="#a84a3e" strokeWidth="1.35" strokeLinecap="round" />

      {/* Swept-Up Modern Brown Hairstyle with Temple Taper */}
      <path
        d="M214.5 90.5C212.5 83.5 215.5 76.5 224.5 75C231.5 73.8 239.5 76 243 82C244.8 85.5 244 91.5 242 94.5L239.2 93.8C239.5 89 237.8 85 233.5 84C227.5 82.8 219.5 83.8 216.2 89Z"
        fill="#854d0e"
      />
      {/* Top Hair Volume Highlight */}
      <path
        d="M216.5 82C219.5 77.5 226.5 75.5 234.5 77C238 77.8 240.5 79.8 241.5 82.5C237.5 80.2 230.5 79.5 223.5 80.8C220 81.4 218 82 216.5 82Z"
        fill="#a16207"
      />
    </g>
  );
}

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
        d="M164 123L190 110L206 119L180 132Z"
        fill="#d97706"
        stroke="#92400e"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M169 123L189 113L200 119L180 129Z"
        fill="#334155"
      />

      {/* Color Swatches / Reference Cards near Top of Desk */}
      <path d="M176 86L198 80L200 85L178 91Z" fill="#1e293b" />
      <path d="M178 89L202 86L203 91L179 94Z" fill="#64748b" />
      <path d="M179 92L203 93L202 98L178 97Z" fill="#cbd5e1" />

      {/* Candidate Character Sitting in Chair */}
      <IsometricCandidateCharacter sleeveColor="#1e293b" />
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

      {/* Open Exam Answer Sheet on Desk */}
      <path
        d="M114 150L150 132L166 141L130 159Z"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M122 150L146 138" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <path d="M126 153L150 141" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      <path d="M130 156L154 144" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

      {/* Study Tablet Under Stylus Hand */}
      <path
        d="M164 123L190 110L206 119L180 132Z"
        fill="#d97706"
        stroke="#92400e"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M169 123L189 113L200 119L180 129Z"
        fill="#312e81"
      />

      {/* Isometric Graduation Cap on Top Right of Desk */}
      <path d="M172 86L192 76L212 86L192 96Z" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.2" />
      <path d="M181 91V98C181 101 203 101 203 98V91" fill="#334155" />
      <path d="M207 89L210 99" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

      {/* Candidate Character at Desk */}
      <IsometricCandidateCharacter sleeveColor="#312e81" />
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

      {/* Keyboard & Bookmarked Circular Tablet on Desk */}
      <path
        d="M120 148L158 129L168 135L130 154Z"
        fill="#ffffff"
        stroke="#cbd5e1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M126 148L156 133" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
      <path
        d="M164 123L190 110L206 119L180 132Z"
        fill="#f59e0b"
        stroke="#b45309"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M169 123L189 113L200 119L180 129Z" fill="#ffffff" />

      {/* Candidate Character at Desk */}
      <IsometricCandidateCharacter sleeveColor="#065f46" />
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
