import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

/* ─── IMAGES ─────────────────────────────────────────────────────────── */
import buildingImg from "./assets/building.webp";
import logoImg     from "./assets/logo.webp";
import chairmanImg from "./assets/chairman.png";
import founderImg  from "./assets/founder.jpg";

/* ─── FONTS ──────────────────────────────────────────────────────────── */
const FL = document.createElement("link");
FL.rel = "stylesheet";
FL.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@300;400;500;600;700&display=swap";
document.head.appendChild(FL);

/* ─── API ─────────────────────────────────────────────────────────────── */
const API_BASE = (process.env.REACT_APP_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

/* ─── CONSTANTS ──────────────────────────────────────────────────────── */
const N_Q = 30;
const PASSWORDS = { staff:"staff123", principal:"principal123", admin:"admin123" };
const C = {
  navy:   "#0d2137",
  navy2:  "#163352",
  gold:   "#b8860b",
  gold2:  "#e6a817",
  bgPage: "#f0f4f9",
  white:  "#ffffff",
  border: "#d8e2ef",
  gray:   "#64748b",
  danger: "#c0392b",
};

const SAMPLE_KEYS = {
  // Official Answer Keys — East West Polytechnic Entrance Exam 2026
  A:["D","B","C","A","C","A","B","C","B","A","B","B","A","A","D","C","A","B","C","A","B","A","D","C","D","A","A","D","B","A"],
  B:["C","B","B","C","A","A","C","A","C","A","C","B","C","C","B","B","C","A","C","C","D","B","C","C","B","A","C","B","C","C"],
  C:["B","C","C","D","C","B","A","D","A","B","C","C","B","A","C","D","B","C","C","C","C","B","C","A","C","D","B","B","A","C"],
  D:["D","B","A","D","A","B","B","A","A","B","B","A","C","B","B","B","B","B","C","C","C","B","C","C","C","D","B","A","C","C"],
};

function makeAnswers(key, correct) {
  const wrong = { A:"B", B:"C", C:"D", D:"A" };
  return key.map((k, i) => (i < correct ? k : wrong[k]));
}

const STUDENTS = [];


function calcScore(s) {
  const key = SAMPLE_KEYS[s.version];
  return s.answers.reduce((acc, a, i) => acc + (a === key[i] ? 1 : 0), 0);
}
function processStudents() {
  const ws = STUDENTS.map(s => ({ ...s, score: calcScore(s) }));
  ws.sort((a, b) => b.score - a.score);
  return ws.map((s, i) => ({ ...s, rank: i + 1 }));
}
function grade(pct) {
  if (pct >= 90) return { label:"A+", color:"#15803d" };
  if (pct >= 80) return { label:"A",  color:"#16a34a" };
  if (pct >= 70) return { label:"B",  color:"#2563eb" };
  if (pct >= 60) return { label:"C",  color:"#d97706" };
  if (pct >= 50) return { label:"D",  color:"#ea580c" };
  return              { label:"F",  color:"#b91c1c" };
}

/* ─── STYLE TOKENS ───────────────────────────────────────────────────── */
const font = { display:"Playfair Display, Georgia, serif", body:"Inter, sans-serif" };

const card = {
  background: C.white, borderRadius:14, padding:"28px",
  boxShadow:"0 2px 8px rgba(13,33,55,.06), 0 8px 24px rgba(13,33,55,.07)",
  border:`1px solid ${C.border}`,
};

const inp = {
  width:"100%", border:`1.5px solid ${C.border}`, borderRadius:8,
  padding:"11px 14px", fontSize:14, fontFamily:font.body,
  outline:"none", boxSizing:"border-box", color:"#1e293b", background:C.white,
  transition:"border-color .15s",
};

const lbl = { display:"block", fontWeight:600, marginBottom:6, color:C.navy, fontSize:13, fontFamily:font.body };

function Btn({ variant="primary", size="md", onClick, children, style={} }) {
  const [hov, setHov] = useState(false);
  const bg = { primary:C.navy, gold:C.gold, ghost:"transparent", danger:C.danger }[variant];
  const pad = { sm:"7px 16px", md:"11px 24px", lg:"14px 36px" }[size];
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: bg, color: variant==="ghost" ? C.navy : "#fff",
        border: variant==="ghost" ? `1.5px solid ${C.border}` : "none",
        borderRadius:8, padding:pad, fontFamily:font.body,
        fontWeight:600, fontSize: size==="sm" ? 13 : 14,
        cursor:"pointer", letterSpacing:".02em",
        opacity: hov ? .85 : 1, transition:"opacity .15s",
        ...style,
      }}>
      {children}
    </button>
  );
}

function Tag({ color, children }) {
  const m = {
    blue:{ bg:"#dbeafe", fg:"#1e40af" }, gold:{ bg:"#fef3c7", fg:"#92400e" },
    green:{ bg:"#dcfce7", fg:"#166534" }, red:{ bg:"#fee2e2", fg:"#991b1b" },
  }[color] || { bg:"#f1f5f9", fg:"#334155" };
  return <span style={{ display:"inline-block", padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:600, background:m.bg, color:m.fg, fontFamily:font.body }}>{children}</span>;
}

/* ─── HEADER ─────────────────────────────────────────────────────────── */
function Header({ subtitle, onBack }) {
  return (
    <header style={{
      background: C.white,
      borderBottom: `3px solid ${C.navy}`,
      boxShadow: "0 2px 10px rgba(13,33,55,.10)",
      position:"sticky", top:0, zIndex:100,
    }}>
      <div style={{ display:"flex", alignItems:"center", padding:"8px 28px", gap:16 }}>
        {onBack && (
          <Btn variant="ghost" size="sm" onClick={onBack}>← Back</Btn>
        )}
        {/* Chairman photo */}
        <img src={chairmanImg} alt="Chairman"
          style={{ width:60, height:60, objectFit:"cover", borderRadius:8, flexShrink:0, border:`2px solid ${C.border}` }} />
        {/* Title block */}
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:font.display, fontSize:24, fontWeight:800, color:C.navy, lineHeight:1.15, letterSpacing:".01em" }}>
            Sri C.M Nagaraj Polytechnic
          </div>
          <div style={{ fontSize:11, color:C.gray, fontFamily:font.body, letterSpacing:".08em", textTransform:"uppercase", marginTop:2 }}>
            {subtitle || "Diploma Entrance Examination Portal · 2026"}
          </div>
        </div>
        {/* Logo */}
        <img src={logoImg} alt="logo"
          style={{ height:72, objectFit:"contain", marginRight:16, flexShrink:0 }} />
      </div>
    </header>
  );
}

/* ─── LOGIN ──────────────────────────────────────────────────────────── */
function Login({ role, onLogin }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const meta = {
    staff:     { label:"Staff",         icon:"📋", accent:"#7c3aed" },
    principal: { label:"Principal",     icon:"🏫", accent:"#0891b2" },
    admin:     { label:"Administrator", icon:"⚙️", accent:C.gold },
  }[role];

  function handleLogin() {
    if (pwd === PASSWORDS[role]) onLogin();
    else setErr("Incorrect password. Please try again.");
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bgPage, fontFamily:font.body }}>
      <Header />
      <div style={{ maxWidth:400, margin:"60px auto", padding:"0 20px" }}>
        <div style={{ ...card, borderTop:`4px solid ${meta.accent}` }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:48, marginBottom:8 }}>{meta.icon}</div>
            <div style={{ fontFamily:font.display, fontSize:24, color:C.navy }}>{meta.label} Login</div>
            <div style={{ color:C.gray, fontSize:13, marginTop:4 }}>Enter your credentials to continue</div>
          </div>
          <label style={lbl}>Password</label>
          <input type="password" style={inp} value={pwd}
            onChange={e => { setPwd(e.target.value); setErr(""); }}
            onKeyDown={e => e.key==="Enter" && handleLogin()}
            placeholder="Enter password" />
          {err && <div style={{ color:C.danger, fontSize:13, marginTop:8 }}>{err}</div>}
          <Btn variant="primary" size="lg" onClick={handleLogin} style={{ width:"100%", marginTop:18, fontFamily:font.display }}>
            Login →
          </Btn>
          <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:C.gray }}>Demo password: {role}123</div>
        </div>
      </div>
    </div>
  );
}

/* ─── ROLE CARD ──────────────────────────────────────────────────────── */
function RoleCard({ icon, label, desc, color, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: C.white, borderRadius:14, padding:"28px 20px",
        border: hov ? `1.5px solid ${color}` : `1.5px solid ${C.border}`,
        boxShadow: hov ? `0 8px 28px rgba(13,33,55,.13)` : "0 2px 8px rgba(13,33,55,.05)",
        cursor:"pointer", textAlign:"center",
        transform: hov ? "translateY(-4px)" : "none",
        transition:"all .2s ease",
        borderTop: `4px solid ${color}`,
      }}>
      <div style={{ width:56, height:56, borderRadius:14, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 14px" }}>
        {icon}
      </div>
      <div style={{ fontFamily:font.display, fontSize:17, fontWeight:700, color:C.navy, marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:13, color:C.gray, lineHeight:1.55, marginBottom:14 }}>{desc}</div>
      <div style={{ fontSize:13, color, fontWeight:600, letterSpacing:".02em" }}>Enter Portal →</div>
    </div>
  );
}

/* ─── LANDING ────────────────────────────────────────────────────────── */
function LandingPage({ onRole }) {
  const roles = [
    { id:"student",   icon:"🎓", label:"Student",   desc:"Check your result and view the merit list",   color:"#2563eb" },
    { id:"staff",     icon:"📋", label:"Staff",      desc:"Upload OMR sheets and manage question papers", color:"#7c3aed" },
    { id:"principal", icon:"🏫", label:"Principal",  desc:"View all results, analytics and reports",     color:"#0891b2" },
    { id:"admin",     icon:"⚙️", label:"Admin",      desc:"Full system control and configuration",       color:C.gold },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bgPage, fontFamily:font.body }}>
      <Header />

      {/* ── Hero ── */}
      <div style={{ position:"relative", height:440, overflow:"hidden" }}>
        <img src={buildingImg} alt="campus"
          style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top", display:"block" }} />
        {/* two-tone overlay: darker at bottom for text legibility */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg, rgba(13,33,55,.38) 0%, rgba(13,33,55,.72) 100%)" }} />

        <div style={{
          position:"absolute", inset:0,
          display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
          color:"#fff", textAlign:"center", padding:"0 24px", gap:0,
        }}>
          {/* pill badge */}
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:"rgba(184,134,11,.22)", border:"1px solid rgba(230,168,23,.5)",
            borderRadius:30, padding:"6px 22px", fontSize:12, color:"#fcd34d",
            letterSpacing:".12em", textTransform:"uppercase", marginBottom:20,
            backdropFilter:"blur(4px)",
          }}>
            ✦ 2026 Entrance Examination ✦
          </div>

          <h1 style={{
            fontFamily:font.display, fontSize:40, fontWeight:800, margin:"0 0 14px",
            lineHeight:1.15, textShadow:"0 3px 16px rgba(0,0,0,.45)", letterSpacing:".01em",
          }}>
            Diploma Entrance Exam Portal
          </h1>

          <p style={{ fontSize:16, opacity:.88, margin:"0 0 6px", fontWeight:500, textShadow:"0 1px 8px rgba(0,0,0,.3)" }}>
            Sri C.M Nagaraj Foundation Trust
          </p>
          <p style={{ fontSize:13, opacity:.55, margin:0 }}>For 10th Standard Passed-Out Students</p>

          {/* divider line */}
          <div style={{ width:60, height:2, background:`rgba(230,168,23,.7)`, borderRadius:2, marginTop:22 }} />
        </div>
      </div>

      {/* ── Role selection ── */}
      <div style={{ maxWidth:960, margin:"0 auto", padding:"52px 24px 24px" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontFamily:font.display, fontSize:26, color:C.navy, fontWeight:700 }}>Select Your Role</div>
          <div style={{ color:C.gray, fontSize:14, marginTop:6 }}>Choose the portal that applies to you</div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:22 }}>
          {roles.map(r => <RoleCard key={r.id} {...r} onClick={() => onRole(r.id)} />)}
        </div>

        {/* info strip */}
        <div style={{
          marginTop:44, padding:"16px 24px", background:C.white,
          borderRadius:12, border:`1px solid ${C.border}`,
          display:"flex", alignItems:"center", gap:12,
          boxShadow:"0 1px 4px rgba(13,33,55,.05)",
        }}>
          <span style={{ fontSize:20 }}>ℹ️</span>
          <span style={{ fontSize:13, color:C.gray, fontFamily:font.body }}>
            For technical support or result-related queries, please contact the Examination Cell at the institution.
          </span>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        background: C.navy, color:"rgba(255,255,255,.75)",
        textAlign:"center", padding:"18px 24px", fontFamily:font.body, fontSize:13, marginTop:48,
        borderTop:`3px solid ${C.gold}`,
      }}>
        © 2026 Sri C.M Nagaraj Foundation Trust &nbsp;·&nbsp; Diploma Entrance Portal &nbsp;·&nbsp; All rights reserved
      </footer>
    </div>
  );
}

/* ─── STUDENT PORTAL ─────────────────────────────────────────────────── */
function StudentPortal({ students, goBack }) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [result, setResult]   = useState(null);
  const [notFound, setNotFound] = useState(false);
  const top5 = [...students].slice(0, 5);

  const search = () => {
    const found = students.find(s =>
      s.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      s.phone.trim() === phone.trim()
    );
    if (found) { setResult(found); setNotFound(false); }
    else       { setResult(null);  setNotFound(true);  }
  };

  const pct = result ? Math.round((result.score / N_Q) * 100) : 0;
  const g   = result ? grade(pct) : null;

  return (
    <div style={{ minHeight:"100vh", background:C.bgPage, fontFamily:font.body }}>
      <Header subtitle="Student Result Portal" onBack={goBack} />
      <div style={{ maxWidth:780, margin:"36px auto", padding:"0 20px" }}>

        {/* Search */}
        <div style={{ ...card, marginBottom:24 }}>
          <div style={{ fontFamily:font.display, fontSize:21, color:C.navy, marginBottom:4 }}>Check Your Result</div>
          <div style={{ color:C.gray, fontSize:13, marginBottom:22 }}>Enter details exactly as written on your OMR sheet</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:18 }}>
            <div>
              <label style={lbl}>Full Name</label>
              <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="As written in OMR sheet" />
            </div>
            <div>
              <label style={lbl}>Mobile Number</label>
              <input style={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit number" />
            </div>
          </div>
          <Btn variant="primary" size="lg" onClick={search} style={{ fontFamily:font.display }}>View My Result →</Btn>
          {notFound && (
            <div style={{ marginTop:14, padding:"12px 16px", background:"#fef2f2", borderRadius:8, color:C.danger, fontSize:13, borderLeft:`3px solid ${C.danger}` }}>
              No result found. Please verify your name and phone number.
            </div>
          )}
        </div>

        {/* Result card */}
        {result && (
          <div style={{ ...card, marginBottom:24, borderTop:`4px solid ${C.gold}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
              <div>
                <div style={{ fontFamily:font.display, fontSize:26, color:C.navy, marginBottom:4 }}>{result.name}</div>
                <div style={{ color:C.gray, fontSize:14 }}>🏫 {result.school}</div>
                <div style={{ color:C.gray, fontSize:14, marginTop:2 }}>📱 {result.phone}</div>
                <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap" }}>
                  <Tag color="blue">Version {result.version}</Tag>
                  <Tag color="gold">Rank #{result.rank}</Tag>
                </div>
              </div>
              {/* Score box */}
              <div style={{
                background:`linear-gradient(135deg, ${C.navy}, ${C.navy2})`,
                color:"#fff", borderRadius:14, padding:"22px 32px", textAlign:"center", minWidth:130,
              }}>
                <div style={{ fontFamily:font.display, fontSize:52, fontWeight:800, lineHeight:1 }}>{result.score}</div>
                <div style={{ fontSize:13, opacity:.65, marginTop:2 }}>out of {N_Q}</div>
                <div style={{ fontSize:28, fontWeight:800, color:C.gold2, marginTop:8 }}>{pct}%</div>
                <div style={{ fontSize:20, fontWeight:700, color: pct>=50 ? "#4ade80" : "#f87171", marginTop:4 }}>
                  Grade {g.label}
                </div>
              </div>
            </div>

            {/* Answer grid */}
            <div style={{ marginTop:26 }}>
              <div style={{ fontFamily:font.display, fontSize:15, color:C.navy, marginBottom:10 }}>Answer Sheet</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(10, 1fr)", gap:6 }}>
                {result.answers.map((ans, i) => (
                  <div key={i} style={{ textAlign:"center", padding:"7px 4px", background:C.bgPage, borderRadius:8, border:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:9, color:C.gray }}>Q{i+1}</div>
                    <div style={{ fontWeight:700, fontSize:14, color:C.navy }}>{ans||"—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Merit list */}
        <div style={{ ...card }}>
          <div style={{ fontFamily:font.display, fontSize:21, color:C.navy, marginBottom:18 }}>Top 5 Merit List</div>
          {top5.map((s, i) => (
            <div key={s.id} style={{
              display:"flex", alignItems:"center", gap:14, padding:"13px 0",
              borderBottom: i < 4 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{
                width:40, height:40, borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                background: i===0?"#fef3c7":i===1?"#f1f5f9":i===2?"#fdf4e7":C.bgPage,
              }}>
                {i===0?"🥇":i===1?"🥈":i===2?"🥉":<span style={{ fontWeight:700, fontSize:14, color:C.gray }}>#{i+1}</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, color:C.navy, fontSize:15 }}>{s.name}</div>
                <div style={{ fontSize:12, color:C.gray, marginTop:1 }}>{s.school}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:font.display, fontSize:20, color:C.navy, fontWeight:700 }}>{s.score}/{N_Q}</div>
                <div style={{ fontSize:12, color:C.gray }}>{Math.round((s.score/N_Q)*100)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── RESULTS TABLE ──────────────────────────────────────────────────── */
function ResultsTable({ students }) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14, fontFamily:font.body }}>
        <thead>
          <tr style={{ background:C.navy, color:"#fff" }}>
            {["Rank","Name","School","Phone","Version","Score","Grade"].map(h => (
              <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontWeight:600, fontSize:13 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={s.id} style={{ background: i%2===0 ? "#f8fafc" : C.white, borderBottom:`1px solid ${C.border}` }}>
              <td style={{ padding:"10px 14px", fontWeight:700, color:C.gold }}>{s.rank}</td>
              <td style={{ padding:"10px 14px", fontWeight:600, color:C.navy }}>{s.name}</td>
              <td style={{ padding:"10px 14px", color:C.gray, fontSize:13 }}>{s.school}</td>
              <td style={{ padding:"10px 14px", color:C.gray }}>{s.phone}</td>
              <td style={{ padding:"10px 14px" }}><Tag color="blue">Ver {s.version}</Tag></td>
              <td style={{ padding:"10px 14px", fontWeight:700 }}>{s.score}/{N_Q}</td>
              <td style={{ padding:"10px 14px" }}>
                {(() => { const g = grade(Math.round((s.score/N_Q)*100)); return <Tag color={g.label==="F"?"red":g.label.startsWith("A")?"green":"blue"}>{g.label}</Tag>; })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── ANALYTICS ──────────────────────────────────────────────────────── */
function Analytics({ students }) {
  const scoreData = students.map(s => ({ name: s.name.split(" ")[0], score: s.score }));
  const versionCounts = {};
  students.forEach(s => { versionCounts[s.version] = (versionCounts[s.version]||0)+1; });
  const versionData = Object.entries(versionCounts).map(([v,c]) => ({ name:"Ver "+v, count:c }));
  const COLORS = [C.navy, C.gold, "#2563eb", "#7c3aed", "#0891b2", "#15803d"];
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
      <div style={card}>
        <div style={{ fontFamily:font.display, fontSize:18, color:C.navy, marginBottom:16 }}>Score Distribution</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={scoreData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize:11 }} />
            <YAxis domain={[0,N_Q]} tick={{ fontSize:11 }} />
            <Tooltip />
            <Bar dataKey="score" radius={[4,4,0,0]}>
              {scoreData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={card}>
        <div style={{ fontFamily:font.display, fontSize:18, color:C.navy, marginBottom:16 }}>Students per Version</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={versionData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
              {versionData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
            </Pie>
            <Legend /><Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── OMR UPLOAD ─────────────────────────────────────────────────────── */
function BulkUpload({ students, setStudents }) {
  const [file, setFile]       = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [msg, setMsg]         = useState('');
  const fileRef = useRef();

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.name.endsWith('.pdf')) { setMsg('❌ Please upload a PDF file.'); return; }
    setFile(f); setMsg(''); setResults(null);
  };

  const uploadPDF = async () => {
    if (!file) return;
    setUploading(true); setMsg(''); setResults(null);
    try {
      const reader = new FileReader();
      reader.onload = async ev => {
        const b64 = ev.target.result.split(',')[1];
        const resp = await fetch(`${API_BASE}/api/scan-bulk/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pdf_base64: b64 }),
        });
        const data = await resp.json();
        if (data.error) { setMsg('❌ ' + data.error); }
        else {
          setResults(data);
          setMsg(`✅ Done: ${data.saved} saved, ${data.skipped} skipped, ${data.errors} errors`);
          // Refresh students list
          const sResp = await fetch(`${API_BASE}/api/students/`);
          const sData = await sResp.json();
          setStudents(sData.map((s,i) => ({...s, rank: i+1})));
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch(e) {
      setMsg('❌ Upload failed: ' + e.message);
      setUploading(false);
    }
  };

  const statusColor = s => s==='saved' ? '#15803d' : s==='skipped' ? '#d97706' : '#b91c1c';

  return (
    <div style={card}>
      <div style={{ fontFamily:font.display, fontSize:18, color:C.navy, marginBottom:12 }}>Bulk PDF Upload</div>
      <div style={{ color:C.gray, fontSize:13, marginBottom:16 }}>
        Upload a PDF where each page is one student's OMR sheet. All pages will be scanned automatically.
      </div>
      <div onClick={() => fileRef.current?.click()}
        style={{ border:`2px dashed ${C.border}`, borderRadius:10, padding:28, textAlign:'center',
          cursor:'pointer', background:C.bgPage, marginBottom:16 }}>
        {file
          ? <div style={{ color:C.navy, fontWeight:600 }}>📄 {file.name} ({(file.size/1024/1024).toFixed(1)} MB)</div>
          : <div style={{ color:C.gray }}>Click to upload PDF (each page = one OMR sheet)</div>}
      </div>
      <input ref={fileRef} type="file" accept=".pdf" style={{ display:'none' }} onChange={handleFile} />
      {file && (
        <Btn variant="primary" onClick={uploadPDF} style={{ marginBottom:12 }}>
          {uploading ? '⏳ Scanning all pages...' : `Scan & Save All`}
        </Btn>
      )}
      {msg && <div style={{ fontSize:13, fontWeight:600, marginBottom:12,
        color: msg.startsWith('✅') ? '#15803d' : C.danger }}>{msg}</div>}
      {results && (
        <div style={{ marginTop:8 }}>
          <div style={{ fontWeight:700, color:C.navy, marginBottom:8, fontSize:14 }}>
            Results — {results.total} pages processed
          </div>
          <div style={{ maxHeight:320, overflowY:'auto', border:`1px solid ${C.border}`, borderRadius:8 }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:C.navy, color:'#fff' }}>
                  {['Page','Name','Phone','Version','Filled','Status'].map(h => (
                    <th key={h} style={{ padding:'8px 12px', textAlign:'left', fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.results.map((r, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.border}`,
                    background: i%2===0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding:'7px 12px' }}>{r.page}</td>
                    <td style={{ padding:'7px 12px' }}>{r.name || '—'}</td>
                    <td style={{ padding:'7px 12px' }}>{r.phone || '—'}</td>
                    <td style={{ padding:'7px 12px' }}>{r.version || '—'}</td>
                    <td style={{ padding:'7px 12px' }}>{r.filled != null ? `${r.filled}/30` : '—'}</td>
                    <td style={{ padding:'7px 12px', fontWeight:600, color:statusColor(r.status) }}>
                      {r.status === 'saved' ? '✅ Saved'
                        : r.status === 'skipped' ? '⚠️ Skipped'
                        : `❌ ${r.error || 'Error'}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function OMRUpload({ students, setStudents, answerKeys }) {
  const [mode, setMode] = useState("manual");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const [scanned, setScanned] = useState(false);
  const [form, setForm] = useState({ name:"", school:"", phone:"", version:"A", answers:Array(N_Q).fill("A") });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef();

  const handleFile = e => {
    const f = e.target.files[0]; if (!f) return;
    setFile(f); setScanMsg("");
    const r = new FileReader(); r.onload = ev => setPreview(ev.target.result); r.readAsDataURL(f);
  };

  const scanOMR = async () => {
    if (!preview) return;
    setScanning(true); setScanMsg("");
    try {
      const base64 = preview.split(",")[1];
      const resp = await fetch(`${API_BASE}/api/scan-omr/`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ image_base64:base64, media_type:file.type })
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        setScanMsg("❌ " + (data.error || "Scan failed. Please try again."));
      } else {
        const answers = (data.answers || []).map(a => a || null);
        setForm({ name:data.name||"", school:data.school||"", phone:data.phone||"", version:data.version||"A", answers:answers.map(a => a || "A") });
        setScanMsg("✅ Scan complete: " + (data.confidence||"") + (data.warning ? " ⚠️ " + data.warning : ""));
        setScanned(true);
        setMode("manual");
      }
    } catch(e) { setScanMsg("Scan failed. Make sure backend is running."); }
    setScanning(false);
  };

  const saveStudent = async () => {
    if (!form.name?.trim()) {
      setScanMsg("❌ Student name is required.");
      return;
    }
    if (!form.school?.trim()) {
      setScanMsg("❌ School name is required.");
      return;
    }
    if (!form.phone || form.phone.length !== 10) {
      setScanMsg("❌ Phone number must be exactly 10 digits.");
      return;
    }
    const score = (answerKeys[form.version]||[]).reduce((s,k,i) => s+(form.answers[i]===k?1:0), 0);
    const body = { ...form, score, rank:0 };
    try {
      const resp = await fetch(`${API_BASE}/api/add/`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
      });
      const text = await resp.text();
      let data;
      try { data = JSON.parse(text); }
      catch { setScanMsg("❌ Server error (status " + resp.status + "). Make sure Django is running."); return; }
      if (!resp.ok) {
        setScanMsg("❌ " + (data.error || JSON.stringify(data)));
        return;
      }
      const all = [...students, { ...data, score }].sort((a,b)=>b.score-a.score).map((s,i)=>({...s,rank:i+1}));
      setStudents(all);
      setSaved(true);
      setScanned(false);
      setForm({ name:"", school:"", phone:"", version:"A", answers:Array(N_Q).fill("A") });
      setTimeout(() => setSaved(false), 3000);
    } catch(e) { setScanMsg("❌ Save failed: " + e.message); }
  };

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["scan","manual","bulk"].map(m => (
          <Btn key={m} variant={mode===m?"primary":"ghost"} size="sm" onClick={() => setMode(m)}>
            {m==="scan" ? "AI Scan" : m==="manual" ? "Manual Entry" : "Bulk PDF"}
          </Btn>
        ))}
      </div>

      {mode === "scan" && (
        <div style={card}>
          <div style={{ fontFamily:font.display, fontSize:18, color:C.navy, marginBottom:12 }}>Upload OMR Sheet</div>
          <div onClick={() => fileRef.current?.click()} style={{ border:`2px dashed ${C.border}`, borderRadius:10, padding:32, textAlign:"center", cursor:"pointer", background:C.bgPage, marginBottom:16 }}>
            {preview ? <img src={preview} alt="OMR" style={{ maxWidth:"100%", maxHeight:260, borderRadius:8 }} /> : <div style={{ color:C.gray }}>Click to upload OMR image (JPG/PNG)</div>}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile} />
          {file && <Btn variant="primary" onClick={scanOMR} style={{ marginBottom:12 }}>{scanning ? "Scanning..." : "Scan OMR"}</Btn>}
          {scanMsg && <div style={{ color: scanMsg.startsWith("❌") ? C.danger : "#15803d", fontSize:13, marginTop:8, fontWeight:500 }}>{scanMsg}</div>}
        </div>
      )}

      {mode === "bulk" && (
        <BulkUpload students={students} setStudents={setStudents} />
      )}

      {mode === "manual" && (
        <div style={card}>
          <div style={{ fontFamily:font.display, fontSize:18, color:C.navy, marginBottom:16 }}>Student Details</div>

          {scanned && (
            <div style={{ background:"#fffbeb", border:"1.5px solid #f59e0b", borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>✅</span>
              <div>
                <div style={{ fontWeight:700, color:"#92400e", fontSize:14 }}>OMR Scan Complete — Answers auto-filled</div>
                <div style={{ color:"#b45309", fontSize:12, marginTop:2 }}>Please fill in Student Name, Phone Number and School below before saving.</div>
              </div>
            </div>
          )}

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:16 }}>
            {[["name","Full Name"],["school","School"],["phone","Phone Number"]].map(([k,l]) => (
              <div key={k}>
                <label style={lbl}>{l}{scanned && (k==="name"||k==="phone"||k==="school") && <span style={{ color:C.danger, marginLeft:4 }}>*</span>}</label>
                <input
                  style={{ ...inp, borderColor: scanned && (k==="name"||k==="phone"||k==="school") && !form[k] ? C.danger : C.border }}
                  value={form[k]}
                  onChange={e => {
                    const val = k === "phone" ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
                    setForm(p=>({...p,[k]:val}));
                  }}
                  inputMode={k === "phone" ? "numeric" : "text"}
                  maxLength={k === "phone" ? 10 : undefined}
                  placeholder={k === "phone" ? "10-digit number" : l}
                />
                {k === "phone" && form.phone && form.phone.length !== 10 && (
                  <div style={{ color:C.danger, fontSize:11, marginTop:3 }}>Must be exactly 10 digits</div>
                )}
              </div>
            ))}
            <div>
              <label style={lbl}>Paper Version</label>
              <select style={inp} value={form.version} onChange={e => setForm(p=>({...p,version:e.target.value}))}>
                {["A","B","C","D"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <div style={{ fontFamily:font.display, fontSize:15, color:C.navy, marginBottom:10 }}>Answers</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(10, 1fr)", gap:6, marginBottom:20 }}>
            {form.answers.map((a, i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ fontSize:10, color:C.gray, marginBottom:2 }}>Q{i+1}</div>
                <select value={a} onChange={e => { const ans=[...form.answers]; ans[i]=e.target.value; setForm(p=>({...p,answers:ans})); }}
                  style={{ width:"100%", padding:"4px 2px", borderRadius:6, border:`1px solid ${C.border}`, fontSize:12, textAlign:"center" }}>
                  {["A","B","C","D"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Btn variant="primary" onClick={saveStudent}>Save Student</Btn>
            {saved && <span style={{ color:"#15803d", fontSize:13, fontWeight:600 }}>Student saved successfully!</span>}
          </div>
          {scanMsg && <div style={{ color:C.danger, fontSize:13, marginTop:8 }}>{scanMsg}</div>}
        </div>
      )}
    </div>
  );
}

/* ─── REVIEW DASHBOARD ───────────────────────────────────────────────── */
function ReviewDashboard({ students }) {
  const reviewStudents = students.filter(s => s.status === 'REVIEW');
  return (
    <div style={card}>
      <div style={{ fontFamily:font.display, fontSize:20, color:C.navy, marginBottom:4 }}>
        Review Queue
      </div>
      <div style={{ color:C.gray, fontSize:13, marginBottom:16 }}>
        Students flagged for manual review — invalid phone, blank sheet, or OCR uncertainty.
      </div>
      {reviewStudents.length === 0 ? (
        <div style={{ padding:'24px', textAlign:'center', color:'#15803d', fontWeight:600 }}>
          ✅ No students need review
        </div>
      ) : (
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
            <thead>
              <tr style={{ background:'#92400e', color:'#fff' }}>
                {['Rank','Name','Phone','School','Version','Score','Status'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviewStudents.map((s, i) => (
                <tr key={s.id} style={{
                  background: '#fef9c3',
                  borderBottom: `1px solid #fde68a`,
                  borderLeft: '4px solid #f59e0b',
                }}>
                  <td style={{ padding:'10px 14px', fontWeight:700, color:C.gold }}>{s.rank || '—'}</td>
                  <td style={{ padding:'10px 14px', fontWeight:600, color:C.navy }}>{s.name}</td>
                  <td style={{ padding:'10px 14px', color: (!s.phone || s.phone.length !== 10) ? C.danger : C.gray, fontWeight: (!s.phone || s.phone.length !== 10) ? 700 : 400 }}>
                    {s.phone || '❌ Missing'}
                  </td>
                  <td style={{ padding:'10px 14px', color:C.gray, fontSize:13 }}>{s.school || '—'}</td>
                  <td style={{ padding:'10px 14px' }}><Tag color="gold">Ver {s.version}</Tag></td>
                  <td style={{ padding:'10px 14px', fontWeight:700 }}>{s.score}/30</td>
                  <td style={{ padding:'10px 14px' }}>
                    <span style={{ background:'#fef3c7', color:'#92400e', padding:'3px 10px', borderRadius:20, fontSize:12, fontWeight:700 }}>
                      ⚠️ REVIEW
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── BILINGUAL QUESTION PAPERS ──────────────────────────────────────── */
const DEFAULT_PAPERS = {
  A: [
    { id:1,  en:"The number of tangents that can be drawn to a circle at the point on its circumference is", kn:"ವೃತ್ತದ ಸುತ್ತಳತೆಯ ಮೇಲಿನ ಒಂದು ಬಿಂದುವಿನಲ್ಲಿ ಎಳೆಯಬಹುದಾದ ಸ್ಪರ್ಶರೇಖೆಗಳ ಸಂಖ್ಯೆ", opts_en:["many","3","2","1"], opts_kn:["ಅನೇಕ","3","2","1"] },
    { id:2,  en:"If 'a' and 'b' are two positive integers, then the correct relation between HCF(a,b) and LCM(a,b) is", kn:"'a' ಮತ್ತು 'b' ಎರಡು ಧನ ಪೂರ್ಣಾಂಕಗಳಾದರೆ, HCF(a,b) ಮತ್ತು LCM(a,b) ನಡುವಿನ ಸರಿಯಾದ ಸಂಬಂಧ", opts_en:["HCF×LCM = a−b","HCF×LCM = a×b","HCF+LCM = a+b","HCF−LCM = a×b"], opts_kn:["HCF×LCM = a−b","HCF×LCM = a×b","HCF+LCM = a+b","HCF−LCM = a×b"] },
    { id:3,  en:"The nth term of an arithmetic progression is 3n−1. Its 8th term is", kn:"ಅಂಕಗಣಿತ ಶ್ರೇಢಿಯ n ನೇ ಪದ 3n−1 ಆಗಿದ್ದರೆ, 8 ನೇ ಪದ", opts_en:["25","10","23","12"], opts_kn:["25","10","23","12"] },
    { id:4,  en:"The maximum number of zeroes of a polynomial P(x) = x³ − 1 is", kn:"ಬಹುಪದೋಕ್ತಿ P(x) = x³ − 1 ರ ಗರಿಷ್ಠ ಶೂನ್ಯಗಳ ಸಂಖ್ಯೆ", opts_en:["3","0","1","2"], opts_kn:["3","0","1","2"] },
    { id:5,  en:"The volume of a right circular cylinder is 1540 cm³ and its height is 10 cm. The area of its base is", kn:"ಒಂದು ಲಂಬ ವೃತ್ತಾಕಾರ ಸಿಲಿಂಡರ್‌ನ ಘನಫಲ 1540 cm³ ಮತ್ತು ಎತ್ತರ 10 cm. ಅದರ ತಳದ ವಿಸ್ತೀರ್ಣ", opts_en:["15.4 cm","15.4 cm²","154 cm²","154 cm³"], opts_kn:["15.4 cm","15.4 cm²","154 cm²","154 cm³"] },
    { id:6,  en:"The HCF of 5² × 2 and 2⁵ × 5 is", kn:"5² × 2 ಮತ್ತು 2⁵ × 5 ರ HCF", opts_en:["2×5","2⁵×5","5²×2⁶","2⁵×5²"], opts_kn:["2×5","2⁵×5","5²×2⁶","2⁵×5²"] },
    { id:7,  en:"x(x + 2) = 6 is a", kn:"x(x + 2) = 6 ಇದು ಒಂದು", opts_en:["linear equation","quadratic equation","cubic polynomial","quadratic polynomial"], opts_kn:["ರೇಖೀಯ ಸಮೀಕರಣ","ವರ್ಗ ಸಮೀಕರಣ","ಘನ ಬಹುಪದೋಕ್ತಿ","ವರ್ಗ ಬಹುಪದೋಕ್ತಿ"] },
    { id:8,  en:"The sum of the probability of all elementary events of a random experiment is", kn:"ಯಾದೃಚ್ಛಿಕ ಪ್ರಯೋಗದ ಎಲ್ಲಾ ಪ್ರಾಥಮಿಕ ಘಟನೆಗಳ ಸಂಭಾವ್ಯತೆಯ ಮೊತ್ತ", opts_en:["0","½","1","−1"], opts_kn:["0","½","1","−1"] },
    { id:9,  en:"sin²A − cos²A is equal to", kn:"sin²A − cos²A ಸಮಾನ", opts_en:["1","1 − 2cos²A","1 + 2cos²A","−1"], opts_kn:["1","1 − 2cos²A","1 + 2cos²A","−1"] },
    { id:10, en:"In an A.P., if aₙ = 2n − 1 then the common difference is", kn:"ಅಂಕಗಣಿತ ಶ್ರೇಢಿಯಲ್ಲಿ aₙ = 2n − 1 ಆದರೆ ಸಾಮಾನ್ಯ ವ್ಯತ್ಯಾಸ", opts_en:["2","−2","3","−1"], opts_kn:["2","−2","3","−1"] },
    { id:11, en:"The coordinates of the midpoint of the line segment joining (−4, 2) and (−2, 6) are", kn:"(−4, 2) ಮತ್ತು (−2, 6) ಬಿಂದುಗಳನ್ನು ಸೇರಿಸುವ ರೇಖಾಖಂಡದ ಮಧ್ಯಬಿಂದುವಿನ ನಿರ್ದೇಶಾಂಕಗಳು", opts_en:["(3, 2)","(−3, 4)","(−2, 3)","(−4, 1)"], opts_kn:["(3, 2)","(−3, 4)","(−2, 3)","(−4, 1)"] },
    { id:12, en:"If the probability of losing a game of kabaddi is 0.25 then the probability of winning is", kn:"ಕಬಡ್ಡಿ ಆಟದಲ್ಲಿ ಸೋಲುವ ಸಂಭಾವ್ಯತೆ 0.25 ಆದರೆ ಗೆಲ್ಲುವ ಸಂಭಾವ್ಯತೆ", opts_en:["0.95","0.75","9.75","0.70"], opts_kn:["0.95","0.75","9.75","0.70"] },
    { id:13, en:"The pair of linear equations represents parallel lines. If one equation is 2x + 3y − 8 = 0, the other is", kn:"ರೇಖೀಯ ಸಮೀಕರಣಗಳ ಜೋಡಿ ಸಮಾನಾಂತರ ರೇಖೆಗಳನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ. ಒಂದು ಸಮೀಕರಣ 2x + 3y − 8 = 0 ಆದರೆ ಇನ್ನೊಂದು", opts_en:["4x + 6y − 9 = 0","9x + 3y + 12 = 0","18x + 6y + 24 = 0","2x − y + 9 = 0"], opts_kn:["4x + 6y − 9 = 0","9x + 3y + 12 = 0","18x + 6y + 24 = 0","2x − y + 9 = 0"] },
    { id:14, en:"The formula to calculate the nth term of an arithmetic progression is", kn:"ಅಂಕಗಣಿತ ಶ್ರೇಢಿಯ n ನೇ ಪದ ಲೆಕ್ಕಿಸುವ ಸೂತ್ರ", opts_en:["aₙ = a + (n−1)d","aₙ = a − (n−1)d","aₙ = a + (n+1)d","aₙ = a + (n−1)"], opts_kn:["aₙ = a + (n−1)d","aₙ = a − (n−1)d","aₙ = a + (n+1)d","aₙ = a + (n−1)"] },
    { id:15, en:"If a quadratic polynomial passes through (−3,0), (−1,−5), (0,−6) and (2,0), its zeroes are", kn:"ವರ್ಗ ಬಹುಪದೋಕ್ತಿ (−3,0), (−1,−5), (0,−6) ಮತ್ತು (2,0) ಮೂಲಕ ಹಾದರೆ, ಅದರ ಶೂನ್ಯಗಳು", opts_en:["−3 and −6","0 and −3","−1 and −5","−3 and 2"], opts_kn:["−3 ಮತ್ತು −6","0 ಮತ್ತು −3","−1 ಮತ್ತು −5","−3 ಮತ್ತು 2"] },
    { id:16, en:"The S.I. unit of electric current is", kn:"ವಿದ್ಯುತ್ ಪ್ರವಾಹದ SI ಘಟಕ", opts_en:["coulomb","volt","ampere","watt"], opts_kn:["ಕೂಲಂಬ್","ವೋಲ್ಟ್","ಆಂಪಿಯರ್","ವ್ಯಾಟ್"] },
    { id:17, en:"The change in focal length of an eye lens is controlled by", kn:"ಕಣ್ಣಿನ ಮಸೂರದ ಕೇಂದ್ರದೂರದ ಬದಲಾವಣೆ ನಿಯಂತ್ರಿಸುವ ಭಾಗ", opts_en:["Ciliary muscles","Pupil","Retina","Iris"], opts_kn:["ಸಿಲಿಯರಿ ಸ್ನಾಯುಗಳು","ಶಿಷ್ಯ (ಪ್ಯೂಪಿಲ್)","ರೆಟಿನಾ","ಐರಿಸ್"] },
    { id:18, en:"The property of the material which obstructs the flow of current is", kn:"ವಿದ್ಯುತ್ ಪ್ರವಾಹವನ್ನು ತಡೆಯುವ ವಸ್ತುವಿನ ಗುಣ", opts_en:["electric power","resistance","electrical potential","potential difference"], opts_kn:["ವಿದ್ಯುತ್ ಶಕ್ತಿ","ರೋಧ","ವಿದ್ಯುತ್ ವಿಭವ","ವಿಭವಾಂತರ"] },
    { id:19, en:"The property of the fuse wire is", kn:"ಫ್ಯೂಸ್ ತಂತಿಯ ಗುಣ", opts_en:["having low resistance","having high resistance","having high resistance and low melting point","high resistance and high melting point"], opts_kn:["ಕಡಿಮೆ ರೋಧ","ಹೆಚ್ಚು ರೋಧ","ಹೆಚ್ಚು ರೋಧ ಮತ್ತು ಕಡಿಮೆ ಕರಗುವ ಬಿಂದು","ಹೆಚ್ಚು ರೋಧ ಮತ್ತು ಹೆಚ್ಚು ಕರಗುವ ಬಿಂದು"] },
    { id:20, en:"In an electric motor, which one acts as commutator?", kn:"ವಿದ್ಯುತ್ ಮೋಟರ್‌ನಲ್ಲಿ ಕಮ್ಯೂಟೇಟರ್ ಆಗಿ ಕೆಲಸ ಮಾಡುವುದು", opts_en:["split rings","brushes","armature","solenoid"], opts_kn:["ವಿಭಜಿತ ರಿಂಗ್‌ಗಳು","ಬ್ರಷ್‌ಗಳು","ಆರ್ಮೇಚರ್","ಸೋಲೆನಾಯ್ಡ್"] },
    { id:21, en:"Which of the following is a non-renewable source of energy?", kn:"ಕೆಳಕಂಡವುಗಳಲ್ಲಿ ನವೀಕರಿಸಲಾಗದ ಶಕ್ತಿ ಮೂಲ", opts_en:["Solar energy","Fossil fuels","Wind energy","Geothermal energy"], opts_kn:["ಸೌರಶಕ್ತಿ","ಪಳೆಯುಳಿಕೆ ಇಂಧನಗಳು","ಗಾಳಿ ಶಕ್ತಿ","ಭೂತಾಪ ಶಕ್ತಿ"] },
    { id:22, en:"Fuel used in thermal power plant is", kn:"ಉಷ್ಣ ವಿದ್ಯುತ್ ಸ್ಥಾವರದಲ್ಲಿ ಬಳಸುವ ಇಂಧನ", opts_en:["Coal","Uranium","Biomass","Water"], opts_kn:["ಕಲ್ಲಿದ್ದಲು","ಯುರೇನಿಯಂ","ಜೈವಿಕ ದ್ರವ್ಯ","ನೀರು"] },
    { id:23, en:"Among the following, that is NOT a base is", kn:"ಕೆಳಗಿನವುಗಳಲ್ಲಿ ಆಧಾರ (base) ಅಲ್ಲದ್ದು", opts_en:["NaOH","KOH","NH₄OH","C₂H₅OH"], opts_kn:["NaOH","KOH","NH₄OH","C₂H₅OH"] },
    { id:24, en:"An example of metal which is liquid at room temperature is", kn:"ಕೋಣೆಯ ಉಷ್ಣಾಂಶದಲ್ಲಿ ದ್ರವ ರೂಪದಲ್ಲಿರುವ ಲೋಹದ ಉದಾಹರಣೆ", opts_en:["Sodium","Silver","Mercury","Lead"], opts_kn:["ಸೋಡಿಯಂ","ಬೆಳ್ಳಿ","ಪಾದರಸ","ಸೀಸ"] },
    { id:25, en:"The ability of metals to be made into thin sheets is called", kn:"ಲೋಹಗಳನ್ನು ತೆಳ್ಳನೆ ಹಾಳೆಗಳಾಗಿ ಮಾಡಬಹುದಾದ ಗುಣ", opts_en:["Ductility","Conductivity","Sonority","Malleability"], opts_kn:["ತನ್ಯತೆ","ವಿದ್ಯುತ್ ವಾಹಕತೆ","ಶ್ರಾವ್ಯತೆ","ಒತ್ತಡ ಸಾಮರ್ಥ್ಯ"] },
    { id:26, en:"Identify the simplest form of hydrocarbon", kn:"ಹೈಡ್ರೋಕಾರ್ಬನ್‌ನ ಸರಳ ರೂಪವನ್ನು ಗುರುತಿಸಿ", opts_en:["Methane","Ethane","Ethene","Benzene"], opts_kn:["ಮೀಥೇನ್","ಈಥೇನ್","ಈಥೀನ್","ಬೆಂಜೀನ್"] },
    { id:27, en:"The discovery of these elements made Newland's law of octaves irrelevant", kn:"ನ್ಯೂಲ್ಯಾಂಡ್‌ನ ಅಷ್ಟಕ ನಿಯಮವನ್ನು ಅಪ್ರಸ್ತುತಗೊಳಿಸಿದ ಮೂಲಧಾತುಗಳು", opts_en:["Noble gases","Non-metals","Halogens","Metals"], opts_kn:["ನಿಷ್ಕ್ರಿಯ ಅನಿಲಗಳು","ಅಲೋಹಗಳು","ಹ್ಯಾಲೊಜನ್‌ಗಳು","ಲೋಹಗಳು"] },
    { id:28, en:"According to Newland, the number of elements existed in nature were", kn:"ನ್ಯೂಲ್ಯಾಂಡ್ ಪ್ರಕಾರ ಪ್ರಕೃತಿಯಲ್ಲಿ ಅಸ್ತಿತ್ವದಲ್ಲಿದ್ದ ಅಂಶಗಳ ಸಂಖ್ಯೆ", opts_en:["118","94","65","56"], opts_kn:["118","94","65","56"] },
    { id:29, en:"The tissue that transports prepared food to all parts of the plant is", kn:"ಸಸ್ಯದ ಎಲ್ಲಾ ಭಾಗಗಳಿಗೆ ತಯಾರಾದ ಆಹಾರವನ್ನು ಸಾಗಿಸುವ ಅಂಗಾಂಶ", opts_en:["Xylem","Phloem","Stomata","Sieve tube"], opts_kn:["ಜೈಲಂ","ಫ್ಲೋಯಂ","ರಂಧ್ರಗಳು","ಜರಡಿ ನಾಳ"] },
    { id:30, en:"Father of Genetics is", kn:"ಜೀನ್ ಶಾಸ್ತ್ರದ ಪಿತಾಮಹ", opts_en:["Gregor Johann Mendel","Charles Darwin","August Weismann","Lamark"], opts_kn:["ಗ್ರೆಗರ್ ಜೊಹಾನ್ ಮೆಂಡೆಲ್","ಚಾರ್ಲ್ಸ್ ಡಾರ್ವಿನ್","ಆಗಸ್ಟ್ ವೇಸ್‌ಮನ್","ಲಾಮಾರ್ಕ್"] },
  ],
  B: [
    { id:1,  en:"The maximum number of tangents that can be drawn from an external point to a circle is", kn:"ಬಾಹ್ಯ ಬಿಂದುವಿನಿಂದ ವೃತ್ತಕ್ಕೆ ಎಳೆಯಬಹುದಾದ ಗರಿಷ್ಠ ಸ್ಪರ್ಶರೇಖೆಗಳ ಸಂಖ್ಯೆ", opts_en:["1","3","2","0"], opts_kn:["1","3","2","0"] },
    { id:2,  en:"If LCM of two numbers is 120 and their HCF is 6, then their product is", kn:"ಎರಡು ಸಂಖ್ಯೆಗಳ LCM 120 ಮತ್ತು HCF 6 ಆದರೆ, ಅವುಗಳ ಗುಣಲಬ್ಧ", opts_en:["120","720","600","360"], opts_kn:["120","720","600","360"] },
    { id:3,  en:"The nth term of an AP is 5n - 2. Its 6th term is", kn:"AP ನ n ನೇ ಪದ 5n - 2. ಅದರ 6 ನೇ ಪದ", opts_en:["30","28","32","25"], opts_kn:["30","28","32","25"] },
    { id:4,  en:"Number of zeroes of p(x) = x² - 4 is", kn:"p(x) = x² - 4 ರ ಶೂನ್ಯಗಳ ಸಂಖ್ಯೆ", opts_en:["0","1","2","3"], opts_kn:["0","1","2","3"] },
    { id:5,  en:"Volume of a sphere of radius 7 cm is", kn:"7 cm ತ್ರಿಜ್ಯದ ಗೋಳದ ಆಯತನ", opts_en:["1437.3 cm³","154 cm²","616 cm²","308 cm³"], opts_kn:["1437.3 cm³","154 cm²","616 cm²","308 cm³"] },
    { id:6,  en:"The HCF of 18 and 24 is", kn:"18 ಮತ್ತು 24 ರ HCF", opts_en:["6","12","3","72"], opts_kn:["6","12","3","72"] },
    { id:7,  en:"2x² + 3x - 2 = 0 is a", kn:"2x² + 3x - 2 = 0 ಒಂದು", opts_en:["linear equation","cubic equation","quadratic equation","biquadratic equation"], opts_kn:["ರೇಖೀಯ ಸಮೀಕರಣ","ಘನ ಸಮೀಕರಣ","ವರ್ಗ ಸಮೀಕರಣ","ದ್ವಿವರ್ಗ ಸಮೀಕರಣ"] },
    { id:8,  en:"A die is thrown. The probability of getting a number greater than 4 is", kn:"ದಾಳ ಎಸೆದಾಗ 4 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಸಂಖ್ಯೆ ಬರುವ ಸಂಭಾವ್ಯತೆ", opts_en:["1/3","1/2","2/3","1/6"], opts_kn:["1/3","1/2","2/3","1/6"] },
    { id:9,  en:"cos²A + sin²A =", kn:"cos²A + sin²A =", opts_en:["0","2","1","-1"], opts_kn:["0","2","1","-1"] },
    { id:10, en:"The sum of first n natural numbers is", kn:"ಮೊದಲ n ನೈಸರ್ಗಿಕ ಸಂಖ್ಯೆಗಳ ಮೊತ್ತ", opts_en:["n(n+1)/2","n(n-1)/2","n²(n+1)","n/2"], opts_kn:["n(n+1)/2","n(n-1)/2","n²(n+1)","n/2"] },
    { id:11, en:"The distance between the points (1, 3) and (4, 7) is", kn:"(1, 3) ಮತ್ತು (4, 7) ಬಿಂದುಗಳ ನಡುವಿನ ದೂರ", opts_en:["3","4","5","7"], opts_kn:["3","4","5","7"] },
    { id:12, en:"A bag contains 3 red and 5 blue balls. The probability of drawing a red ball is", kn:"ಚೀಲದಲ್ಲಿ 3 ಕೆಂಪು ಮತ್ತು 5 ನೀಲಿ ಚೆಂಡುಗಳಿವೆ. ಕೆಂಪು ಚೆಂಡು ಆಯ್ಕೆ ಸಂಭಾವ್ಯತೆ", opts_en:["5/8","3/8","1/2","3/5"], opts_kn:["5/8","3/8","1/2","3/5"] },
    { id:13, en:"The solution of 2x + y = 7 and x - y = 2 gives the value of x as", kn:"2x + y = 7 ಮತ್ತು x - y = 2 ಸಮೀಕರಣಗಳ ಪರಿಹಾರದಲ್ಲಿ x ಯ ಮೌಲ್ಯ", opts_en:["2","4","3","5"], opts_kn:["2","4","3","5"] },
    { id:14, en:"Which of the following is NOT an Arithmetic Progression?", kn:"ಕೆಳಗಿನವುಗಳಲ್ಲಿ ಅಂಕಗಣಿತ ಶ್ರೇಢಿ ಅಲ್ಲದ್ದು ಯಾವುದು?", opts_en:["2,4,6,8...","1,3,5,7...","1,2,4,8...","10,8,6,4..."], opts_kn:["2,4,6,8...","1,3,5,7...","1,2,4,8...","10,8,6,4..."] },
    { id:15, en:"If one zero of p(x) = x² - 7x + k is 2, then k =", kn:"p(x) = x² - 7x + k ನ ಒಂದು ಶೂನ್ಯ 2 ಆದರೆ k =", opts_en:["5","10","-10","-5"], opts_kn:["5","10","-10","-5"] },
    { id:16, en:"The S.I. unit of electric charge is", kn:"ವಿದ್ಯುತ್ ಆವೇಶದ SI ಘಟಕ", opts_en:["Ampere","Coulomb","Volt","Ohm"], opts_kn:["ಆಂಪಿಯರ್","ಕೂಲಂಬ್","ವೋಲ್ಟ್","ಓಮ್"] },
    { id:17, en:"The part of the eye that controls the amount of light entering it is", kn:"ಕಣ್ಣಿಗೆ ಬೀಳುವ ಬೆಳಕಿನ ಪ್ರಮಾಣ ನಿಯಂತ್ರಿಸುವ ಭಾಗ", opts_en:["Retina","Lens","Pupil","Cornea"], opts_kn:["ರೆಟಿನಾ","ಮಸೂರ","ಶಿಷ್ಯ (ಪ್ಯೂಪಿಲ್)","ಕಾರ್ನಿಯಾ"] },
    { id:18, en:"When resistors are connected in series, the total resistance is", kn:"ರೋಧಕಗಳನ್ನು ಸರಣಿಯಲ್ಲಿ ಜೋಡಿಸಿದಾಗ ಒಟ್ಟು ರೋಧ", opts_en:["sum of all resistances","product of all resistances","less than the smallest resistance","equal to the largest resistance"], opts_kn:["ಎಲ್ಲಾ ರೋಧಗಳ ಮೊತ್ತ","ಎಲ್ಲಾ ರೋಧಗಳ ಗುಣಲಬ್ಧ","ಅತ್ಯಂತ ಚಿಕ್ಕ ರೋಧಕ್ಕಿಂತ ಕಡಿಮೆ","ಅತ್ಯಂತ ದೊಡ್ಡ ರೋಧಕ್ಕೆ ಸಮಾನ"] },
    { id:19, en:"A short circuit is caused when", kn:"ಶಾರ್ಟ್ ಸರ್ಕ್ಯೂಟ್ ಉಂಟಾಗುವ ಕಾರಣ", opts_en:["resistance is very high","current is very low","live and neutral wires touch each other","the fuse melts"], opts_kn:["ರೋಧ ತುಂಬಾ ಹೆಚ್ಚಾಗಿದ್ದಾಗ","ವಿದ್ಯುತ್ ಪ್ರವಾಹ ತುಂಬಾ ಕಡಿಮೆ ಇದ್ದಾಗ","ಲೈವ್ ಮತ್ತು ನ್ಯೂಟ್ರಲ್ ತಂತಿಗಳು ಮುಟ್ಟಿದಾಗ","ಫ್ಯೂಸ್ ಕರಗಿದಾಗ"] },
    { id:20, en:"The device that converts electrical energy into mechanical energy is", kn:"ವಿದ್ಯುತ್ ಶಕ್ತಿಯನ್ನು ಯಾಂತ್ರಿಕ ಶಕ್ತಿಯಾಗಿ ಪರಿವರ್ತಿಸುವ ಸಾಧನ", opts_en:["Generator","Transformer","Electric motor","Battery"], opts_kn:["ಜನರೇಟರ್","ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್","ವಿದ್ಯುತ್ ಮೋಟರ್","ಬ್ಯಾಟರಿ"] },
    { id:21, en:"Which of the following is NOT a fossil fuel?", kn:"ಕೆಳಗಿನವುಗಳಲ್ಲಿ ಪಳೆಯುಳಿಕೆ ಇಂಧನ ಅಲ್ಲದ್ದು", opts_en:["Coal","Petroleum","Natural gas","Biogas"], opts_kn:["ಕಲ್ಲಿದ್ದಲು","ಪೆಟ್ರೋಲಿಯಂ","ನೈಸರ್ಗಿಕ ಅನಿಲ","ಜೈವಿಕ ಅನಿಲ"] },
    { id:22, en:"The energy stored in the nucleus of an atom is called", kn:"ಪರಮಾಣುವಿನ ನ್ಯೂಕ್ಲಿಯಸ್‌ನಲ್ಲಿ ಸಂಗ್ರಹವಾದ ಶಕ್ತಿಯನ್ನು ಕರೆಯಲಾಗುವುದು", opts_en:["Chemical energy","Nuclear energy","Kinetic energy","Potential energy"], opts_kn:["ರಾಸಾಯನಿಕ ಶಕ್ತಿ","ಪರಮಾಣು ಶಕ್ತಿ","ಚಲನ ಶಕ್ತಿ","ಸ್ಥಿತಿಜ ಶಕ್ತಿ"] },
    { id:23, en:"Which of the following is an acid?", kn:"ಕೆಳಗಿನವುಗಳಲ್ಲಿ ಆಮ್ಲ ಯಾವುದು?", opts_en:["NaOH","KOH","HCl","Ca(OH)₂"], opts_kn:["NaOH","KOH","HCl","Ca(OH)₂"] },
    { id:24, en:"The most abundant metal in the Earth's crust is", kn:"ಭೂಮಿಯ ಹೊರಪದರದಲ್ಲಿ ಅತ್ಯಧಿಕ ಪ್ರಮಾಣದಲ್ಲಿರುವ ಲೋಹ", opts_en:["Iron","Copper","Aluminium","Gold"], opts_kn:["ಕಬ್ಬಿಣ","ತಾಮ್ರ","ಅಲ್ಯೂಮಿನಿಯಂ","ಚಿನ್ನ"] },
    { id:25, en:"The ability of metals to be drawn into thin wires is called", kn:"ಲೋಹಗಳನ್ನು ತೆಳ್ಳನೆ ತಂತಿಗಳಾಗಿ ಎಳೆಯಬಹುದಾದ ಗುಣ", opts_en:["Malleability","Ductility","Sonority","Conductivity"], opts_kn:["ಒತ್ತಡ ಸಾಮರ್ಥ್ಯ","ತನ್ಯತೆ","ಶ್ರಾವ್ಯತೆ","ವಾಹಕತೆ"] },
    { id:26, en:"The molecular formula of methane is", kn:"ಮೀಥೇನ್‌ನ ಆಣ್ವಿಕ ಸೂತ್ರ", opts_en:["CH₄","C₂H₆","C₂H₄","C₃H₈"], opts_kn:["CH₄","C₂H₆","C₂H₄","C₃H₈"] },
    { id:27, en:"Dobereiner arranged elements in groups of", kn:"ಡೊಬರೇನರ್ ಮೂಲಧಾತುಗಳನ್ನು ಎಷ್ಟರ ಗುಂಪುಗಳಲ್ಲಿ ಜೋಡಿಸಿದ?", opts_en:["2","4","3","8"], opts_kn:["2","4","3","8"] },
    { id:28, en:"The number of groups in the Modern Periodic Table is", kn:"ಆಧುನಿಕ ಆವರ್ತ ಕೋಷ್ಟಕದಲ್ಲಿ ಗುಂಪುಗಳ ಸಂಖ್ಯೆ", opts_en:["7","18","8","9"], opts_kn:["7","18","8","9"] },
    { id:29, en:"Stomata are mainly found in", kn:"ಸ್ಟೊಮಟಾ ಮುಖ್ಯವಾಗಿ ಎಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ?", opts_en:["Roots","Stems","Leaves","Flowers"], opts_kn:["ಬೇರುಗಳಲ್ಲಿ","ಕಾಂಡದಲ್ಲಿ","ಎಲೆಗಳಲ್ಲಿ","ಹೂಗಳಲ್ಲಿ"] },
    { id:30, en:"DNA is found in", kn:"DNA ಎಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ?", opts_en:["Mitochondria only","Nucleus only","Both nucleus and mitochondria","Ribosomes"], opts_kn:["ಮೈಟೋಕಾಂಡ್ರಿಯಾ ಮಾತ್ರ","ಕೇಂದ್ರಕ ಮಾತ್ರ","ಕೇಂದ್ರಕ ಮತ್ತು ಮೈಟೋಕಾಂಡ್ರಿಯಾ ಎರಡರಲ್ಲೂ","ರೈಬೋಸೋಮ್‌ಗಳಲ್ಲಿ"] },
  ],
  C: [
    { id:1,  en:"A line that intersects a circle at exactly two points is called", kn:"ವೃತ್ತವನ್ನು ನಿಖರವಾಗಿ ಎರಡು ಬಿಂದುಗಳಲ್ಲಿ ಛೇದಿಸುವ ರೇಖೆಯನ್ನು ಕರೆಯುವ ಹೆಸರು", opts_en:["Tangent","Secant","Chord","Diameter"], opts_kn:["ಸ್ಪರ್ಶರೇಖೆ","ಛೇದಕ ರೇಖೆ","ಜೀವಾ","ವ್ಯಾಸ"] },
    { id:2,  en:"The HCF of two consecutive integers is always", kn:"ಯಾವಾಗಲೂ ಎರಡು ಅನುಕ್ರಮ ಪೂರ್ಣಾಂಕಗಳ HCF", opts_en:["2","0","1","the larger number"], opts_kn:["2","0","1","ದೊಡ್ಡ ಸಂಖ್ಯೆ"] },
    { id:3,  en:"In an AP 3, 7, 11, 15 ..., the common difference is", kn:"AP 3, 7, 11, 15 ... ನಲ್ಲಿ ಸಾಮಾನ್ಯ ವ್ಯತ್ಯಾಸ", opts_en:["3","7","4","11"], opts_kn:["3","7","4","11"] },
    { id:4,  en:"A polynomial of degree 2 is called", kn:"2ನೇ ಘಾತದ ಬಹುಪದವನ್ನು ಕರೆಯುವ ಹೆಸರು", opts_en:["Linear","Cubic","Biquadratic","Quadratic"], opts_kn:["ರೇಖೀಯ","ಘನ","ದ್ವಿವರ್ಗ","ವರ್ಗ"] },
    { id:5,  en:"If the radius of a circle is 7 cm, then its area is", kn:"ವೃತ್ತದ ತ್ರಿಜ್ಯ 7 cm ಆದರೆ ಅದರ ವಿಸ್ತೀರ್ಣ", opts_en:["22 cm²","44 cm²","154 cm²","154 cm³"], opts_kn:["22 cm²","44 cm²","154 cm²","154 cm³"] },
    { id:6,  en:"The LCM of 12 and 18 is", kn:"12 ಮತ್ತು 18 ರ LCM", opts_en:["6","36","216","72"], opts_kn:["6","36","216","72"] },
    { id:7,  en:"If p(x) = x² - 1, then p(1) =", kn:"p(x) = x² - 1 ಆದರೆ p(1) =", opts_en:["0","2","-2","1"], opts_kn:["0","2","-2","1"] },
    { id:8,  en:"The probability of a sure event is", kn:"ನಿಶ್ಚಿತ ಘಟನೆಯ ಸಂಭಾವ್ಯತೆ", opts_en:["0","0.5","-1","1"], opts_kn:["0","0.5","-1","1"] },
    { id:9,  en:"tan A is equal to", kn:"tan A ಸಮಾನ", opts_en:["sin A / cos A","cos A / sin A","1 / sin A","1 / cos A"], opts_kn:["sin A / cos A","cos A / sin A","1 / sin A","1 / cos A"] },
    { id:10, en:"The sum of the first 10 natural numbers is", kn:"ಮೊದಲ 10 ನೈಸರ್ಗಿಕ ಸಂಖ್ಯೆಗಳ ಮೊತ್ತ", opts_en:["45","55","50","100"], opts_kn:["45","55","50","100"] },
    { id:11, en:"The midpoint of line segment joining (0, 0) and (4, 6) is", kn:"(0, 0) ಮತ್ತು (4, 6) ಬಿಂದುಗಳನ್ನು ಸೇರಿಸುವ ರೇಖಾಖಂಡದ ಮಧ್ಯಬಿಂದು", opts_en:["(4, 6)","(1, 2)","(2, 3)","(3, 4)"], opts_kn:["(4, 6)","(1, 2)","(2, 3)","(3, 4)"] },
    { id:12, en:"A coin is tossed twice. The probability of getting at least one head is", kn:"ನಾಣ್ಯವನ್ನು ಎರಡು ಬಾರಿ ಎಸೆದಾಗ ಕನಿಷ್ಠ ಒಂದು ಚಿತ್ತ ಬರುವ ಸಂಭಾವ್ಯತೆ", opts_en:["1/4","1/2","3/4","1"], opts_kn:["1/4","1/2","3/4","1"] },
    { id:13, en:"The solution of x + y = 5 and x - y = 1 is", kn:"x + y = 5 ಮತ್ತು x - y = 1 ರ ಪರಿಹಾರ", opts_en:["x=2, y=3","x=3, y=2","x=4, y=1","x=1, y=4"], opts_kn:["x=2, y=3","x=3, y=2","x=4, y=1","x=1, y=4"] },
    { id:14, en:"For an AP with first term 5 and common difference 3, the 4th term is", kn:"ಮೊದಲ ಪದ 5 ಮತ್ತು ಸಾಮಾನ್ಯ ವ್ಯತ್ಯಾಸ 3 ಇರುವ AP ನ 4 ನೇ ಪದ", opts_en:["14","15","17","12"], opts_kn:["14","15","17","12"] },
    { id:15, en:"The sum of zeroes of p(x) = x² - 5x + 6 is", kn:"p(x) = x² - 5x + 6 ರ ಶೂನ್ಯಗಳ ಮೊತ್ತ", opts_en:["6","-5","5","-6"], opts_kn:["6","-5","5","-6"] },
    { id:16, en:"The unit of electrical resistance is", kn:"ವಿದ್ಯುತ್ ರೋಧದ ಘಟಕ", opts_en:["Volt","Ampere","Watt","Ohm"], opts_kn:["ವೋಲ್ಟ್","ಆಂಪಿಯರ್","ವಾಟ್","ಓಮ್"] },
    { id:17, en:"Myopia (short-sightedness) is corrected using", kn:"ಮಯೋಪಿಯಾ (ಕಡಿಮೆ ದೃಷ್ಟಿ) ಸರಿಪಡಿಸಲು ಬಳಸುವ ಮಸೂರ", opts_en:["convex lens","concave lens","bifocal lens","plane mirror"], opts_kn:["ಉಬ್ಬು ಮಸೂರ","ತಗ್ಗು ಮಸೂರ","ದ್ವಿನಾಭಿ ಮಸೂರ","ಸಮತಲ ಕನ್ನಡಿ"] },
    { id:18, en:"The formula for electric power is", kn:"ವಿದ್ಯುತ್ ಶಕ್ತಿಯ ಸೂತ್ರ", opts_en:["P = V/I","P = V + I","P = VI","P = V²/I"], opts_kn:["P = V/I","P = V + I","P = VI","P = V²/I"] },
    { id:19, en:"The material used for making fuse wire has", kn:"ಫ್ಯೂಸ್ ತಂತಿ ತಯಾರಿಸಲು ಬಳಸುವ ವಸ್ತು ಹೊಂದಿರುವ ಗುಣ", opts_en:["low resistance and high melting point","high resistance and high melting point","high resistance and low melting point","low resistance and low melting point"], opts_kn:["ಕಡಿಮೆ ರೋಧ ಮತ್ತು ಹೆಚ್ಚು ಕರಗು ಬಿಂದು","ಹೆಚ್ಚು ರೋಧ ಮತ್ತು ಹೆಚ್ಚು ಕರಗು ಬಿಂದು","ಹೆಚ್ಚು ರೋಧ ಮತ್ತು ಕಡಿಮೆ ಕರಗು ಬಿಂದು","ಕಡಿಮೆ ರೋಧ ಮತ್ತು ಕಡಿಮೆ ಕರಗು ಬಿಂದು"] },
    { id:20, en:"Fleming's right-hand rule is used to find the direction of", kn:"ಫ್ಲೆಮಿಂಗ್‌ನ ಬಲಗೈ ನಿಯಮ ಉಪಯೋಗಿಸುವ ಉದ್ದೇಶ", opts_en:["magnetic force on a conductor","current in a motor","induced current in a generator","electric field"], opts_kn:["ವಾಹಕದ ಮೇಲಿನ ಕಾಂತ ಬಲ","ಮೋಟರ್‌ನಲ್ಲಿ ವಿದ್ಯುತ್ ದಿಕ್ಕು","ಜನರೇಟರ್‌ನಲ್ಲಿ ಪ್ರೇರಿತ ವಿದ್ಯುತ್ ದಿಕ್ಕು","ವಿದ್ಯುತ್ ಕ್ಷೇತ್ರ"] },
    { id:21, en:"Biogas is mainly composed of", kn:"ಜೈವಿಕ ಅನಿಲದ ಮುಖ್ಯ ಘಟಕ", opts_en:["Carbon dioxide","Hydrogen","Methane","Oxygen"], opts_kn:["ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್","ಹೈಡ್ರೋಜನ್","ಮೀಥೇನ್","ಆಮ್ಲಜನಕ"] },
    { id:22, en:"The process of producing electricity using flowing water is called", kn:"ಹರಿಯುವ ನೀರಿನಿಂದ ವಿದ್ಯುತ್ ಉತ್ಪಾದಿಸುವ ಪ್ರಕ್ರಿಯೆ", opts_en:["Thermal power","Hydroelectric power","Solar power","Tidal power"], opts_kn:["ಉಷ್ಣ ವಿದ್ಯುತ್","ಜಲ ವಿದ್ಯುತ್","ಸೌರ ವಿದ್ಯುತ್","ಜ್ವಾರಭಾಟ ವಿದ್ಯುತ್"] },
    { id:23, en:"Litmus paper turns red in", kn:"ಆಮ್ಲೀಯ ದ್ರಾವಣದಲ್ಲಿ ಲಿಟ್ಮಸ್ ಕಾಗದ ತಿರುಗುವ ಬಣ್ಣ", opts_en:["basic solution","neutral solution","acidic solution","salt solution"], opts_kn:["ನೀಲಿ","ತಟಸ್ಥ","ಕೆಂಪು","ಉಪ್ಪಿನ ದ್ರಾವಣ"] },
    { id:24, en:"Steel is an alloy of", kn:"ಉಕ್ಕು ಯಾವ ಮಿಶ್ರ ಲೋಹ?", opts_en:["iron and carbon","copper and zinc","iron and tin","aluminium and copper"], opts_kn:["ಕಬ್ಬಿಣ ಮತ್ತು ಇಂಗಾಲ","ತಾಮ್ರ ಮತ್ತು ಸತು","ಕಬ್ಬಿಣ ಮತ್ತು ತವರ","ಅಲ್ಯೂಮಿನಿಯಂ ಮತ್ತು ತಾಮ್ರ"] },
    { id:25, en:"Which non-metal conducts electricity?", kn:"ವಿದ್ಯುತ್ ವಾಹಕ ಅಲೋಹ ಯಾವುದು?", opts_en:["Sulphur","Phosphorus","Graphite","Nitrogen"], opts_kn:["ಗಂಧಕ","ರಂಜಕ","ಗ್ರ್ಯಾಫೈಟ್","ಸಾರಜನಕ"] },
    { id:26, en:"Ethanol belongs to which homologous series?", kn:"ಈಥನಾಲ್ ಯಾವ ಸಮರೂಪ ಸರಣಿಗೆ ಸೇರಿದೆ?", opts_en:["Alkanes","Alkenes","Alkynes","Alcohols"], opts_kn:["ಆಲ್ಕೇನ್","ಆಲ್ಕೀನ್","ಆಲ್ಕೈನ್","ಆಲ್ಕೋಹಾಲ್"] },
    { id:27, en:"According to Mendeleev's periodic law, properties of elements are periodic functions of their", kn:"ಮೆಂಡಲೀಫ್‌ನ ಆವರ್ತ ನಿಯಮದ ಪ್ರಕಾರ ಧಾತು ಗುಣಗಳು ಯಾವ ಕ್ರಮದಲ್ಲಿ ಪುನರಾವರ್ತನೆಯಾಗುತ್ತವೆ?", opts_en:["atomic number","atomic mass","valency","density"], opts_kn:["ಪರಮಾಣು ಸಂಖ್ಯೆ","ಪರಮಾಣು ದ್ರವ್ಯರಾಶಿ","ಸಂಯೋಜಕತೆ","ಸಾಂದ್ರತೆ"] },
    { id:28, en:"The number of periods in the Modern Periodic Table is", kn:"ಆಧುನಿಕ ಆವರ್ತ ಕೋಷ್ಟಕದಲ್ಲಿ ಆವರ್ತಗಳ ಸಂಖ್ಯೆ", opts_en:["9","7","8","18"], opts_kn:["9","7","8","18"] },
    { id:29, en:"Root hair cells absorb water from the soil by the process of", kn:"ಬೇರಿನ ರೋಮ ಕೋಶಗಳು ಮಣ್ಣಿನಿಂದ ನೀರನ್ನು ಹೀರಿಕೊಳ್ಳುವ ಪ್ರಕ್ರಿಯೆ", opts_en:["Osmosis","Diffusion","Active transport","Transpiration"], opts_kn:["ಅಸ್ಮೋಸಿಸ್","ವ್ಯಾಪನ","ಸಕ್ರಿಯ ಸಾಗಣೆ","ವಾಷ್ಪೋತ್ಸರ್ಜನ"] },
    { id:30, en:"Which of the following is responsible for carrying traits from parents to offspring?", kn:"ಪೋಷಕರ ಗುಣಗಳನ್ನು ಸಂತತಿಗೆ ವರ್ಗಾಯಿಸುವ ಅಣು", opts_en:["RNA","Protein","DNA","Lipid"], opts_kn:["RNA","ಪ್ರೋಟೀನ್","DNA","ಲಿಪಿಡ್"] },
  ],
  D: [
    { id:1,  en:"The maximum number of common tangents to two non-intersecting circles is", kn:"ಪರಸ್ಪರ ಛೇದಿಸದ ಎರಡು ವೃತ್ತಗಳಿಗೆ ಗರಿಷ್ಠ ಸಾಮಾನ್ಯ ಸ್ಪರ್ಶರೇಖೆಗಳ ಸಂಖ್ಯೆ", opts_en:["1","2","3","4"], opts_kn:["1","2","3","4"] },
    { id:2,  en:"The product of HCF and LCM of 4 and 6 is", kn:"4 ಮತ್ತು 6 ರ HCF ಮತ್ತು LCM ಗಳ ಗುಣಲಬ್ಧ", opts_en:["10","24","12","6"], opts_kn:["10","24","12","6"] },
    { id:3,  en:"If the first term of an AP is 7 and common difference is -2, its 4th term is", kn:"AP ನ ಮೊದಲ ಪದ 7 ಮತ್ತು ಸಾಮಾನ್ಯ ವ್ಯತ್ಯಾಸ -2 ಆದರೆ 4 ನೇ ಪದ", opts_en:["1","3","5","13"], opts_kn:["1","3","5","13"] },
    { id:4,  en:"The value of k for which x² - kx + 9 = 0 has equal roots is", kn:"x² - kx + 9 = 0 ಗೆ ಸಮಾನ ಬೇರುಗಳಿರಲು k ಯ ಮೌಲ್ಯ", opts_en:["3","6","9","±6"], opts_kn:["3","6","9","±6"] },
    { id:5,  en:"The curved surface area of a cylinder with radius 7 cm and height 10 cm is", kn:"7 cm ತ್ರಿಜ್ಯ ಮತ್ತು 10 cm ಎತ್ತರದ ಸಿಲಿಂಡರ್‌ನ ವಕ್ರ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ", opts_en:["440 cm²","154 cm²","308 cm²","770 cm²"], opts_kn:["440 cm²","154 cm²","308 cm²","770 cm²"] },
    { id:6,  en:"The HCF of 36 and 48 is", kn:"36 ಮತ್ತು 48 ರ HCF", opts_en:["6","12","144","4"], opts_kn:["6","12","144","4"] },
    { id:7,  en:"The discriminant of 3x² - 2x + 1 = 0 is", kn:"3x² - 2x + 1 = 0 ರ ವಿವೇಚಕ", opts_en:["16","-8","8","-16"], opts_kn:["16","-8","8","-16"] },
    { id:8,  en:"If P(E) = 0.6, then P(not E) =", kn:"P(E) = 0.6 ಆದರೆ P(E ಅಲ್ಲ) =", opts_en:["0.4","0.6","1.6","-0.6"], opts_kn:["0.4","0.6","1.6","-0.6"] },
    { id:9,  en:"If sin A = 3/5, then cos A =", kn:"sin A = 3/5 ಆದರೆ cos A =", opts_en:["4/5","3/4","5/3","5/4"], opts_kn:["4/5","3/4","5/3","5/4"] },
    { id:10, en:"In an AP with a = 2 and d = 3, the 5th term is", kn:"a = 2 ಮತ್ತು d = 3 ಇರುವ AP ನ 5 ನೇ ಪದ", opts_en:["12","14","17","11"], opts_kn:["12","14","17","11"] },
    { id:11, en:"The area of a triangle with vertices (0,0), (4,0) and (0,3) is", kn:"(0,0), (4,0) ಮತ್ತು (0,3) ತ್ರಿಕೋಣದ ವಿಸ್ತೀರ್ಣ", opts_en:["7 sq.units","6 sq.units","12 sq.units","3.5 sq.units"], opts_kn:["7 ಚ.ಏ.","6 ಚ.ಏ.","12 ಚ.ಏ.","3.5 ಚ.ಏ."] },
    { id:12, en:"A bag has 2 red, 3 blue and 5 green balls. The probability of NOT getting a green ball is", kn:"ಚೀಲದಲ್ಲಿ 2 ಕೆಂಪು, 3 ನೀಲಿ ಮತ್ತು 5 ಹಸಿರು ಚೆಂಡುಗಳಿವೆ. ಹಸಿರು ಚೆಂಡು ಸಿಗದ ಸಂಭಾವ್ಯತೆ", opts_en:["1/2","5/10","3/5","2/5"], opts_kn:["1/2","5/10","3/5","2/5"] },
    { id:13, en:"For a consistent and dependent system of linear equations, the lines are", kn:"ಸಮಾನಾಂತರ ಮತ್ತು ಅವಲಂಬಿತ ರೇಖಾ ಸಮೀಕರಣ ವ್ಯವಸ್ಥೆಯಲ್ಲಿ ರೇಖೆಗಳು", opts_en:["intersecting at one point","parallel","coincident","perpendicular"], opts_kn:["ಒಂದು ಬಿಂದುವಿನಲ್ಲಿ ಛೇದಿಸುತ್ತವೆ","ಸಮಾಂತರ","ಹೊಂದಿಕೊಳ್ಳುತ್ತವೆ","ಲಂಬ"] },
    { id:14, en:"The sum of first 5 terms of AP 1, 2, 3, 4, 5 is", kn:"AP 1, 2, 3, 4, 5 ರ ಮೊದಲ 5 ಪದಗಳ ಮೊತ್ತ", opts_en:["10","15","12","20"], opts_kn:["10","15","12","20"] },
    { id:15, en:"If one zero of p(x) = x² + kx - 6 is 2, then k =", kn:"p(x) = x² + kx - 6 ರ ಒಂದು ಶೂನ್ಯ 2 ಆದರೆ k =", opts_en:["-1","1","2","-2"], opts_kn:["-1","1","2","-2"] },
    { id:16, en:"The work done in moving a charge Q through a potential difference V is", kn:"ವಿಭವಾಂತರ V ಮೂಲಕ ಆವೇಶ Q ಚಲಿಸಿದಾಗ ಮಾಡಿದ ಕಾರ್ಯ", opts_en:["Q/V","QV","Q + V","Q - V"], opts_kn:["Q/V","QV","Q + V","Q - V"] },
    { id:17, en:"Hypermetropia (long-sightedness) is corrected using", kn:"ಹೈಪರ್‌ಮೆಟ್ರೋಪಿಯಾ (ದೂರ ದೃಷ್ಟಿ) ಸರಿಪಡಿಸಲು ಬಳಸುವ ಮಸೂರ", opts_en:["concave lens","convex lens","cylindrical lens","plane mirror"], opts_kn:["ತಗ್ಗು ಮಸೂರ","ಉಬ್ಬು ಮಸೂರ","ಸಿಲಿಂಡ್ರಿಕಲ್ ಮಸೂರ","ಸಮತಲ ಕನ್ನಡಿ"] },
    { id:18, en:"Three resistors of 2Ω, 3Ω and 6Ω are connected in parallel. The equivalent resistance is", kn:"2Ω, 3Ω ಮತ್ತು 6Ω ರೋಧಕಗಳನ್ನು ಸಮಾನಾಂತರದಲ್ಲಿ ಜೋಡಿಸಿದ ಸಮತುಲ್ಯ ರೋಧ", opts_en:["11 Ω","1 Ω","6 Ω","3 Ω"], opts_kn:["11 Ω","1 Ω","6 Ω","3 Ω"] },
    { id:19, en:"The function of the earthing wire in domestic circuits is", kn:"ಮನೆ ವಿದ್ಯುತ್ ಸಂಪರ್ಕದಲ್ಲಿ ಭೂಸಂಪರ್ಕ ತಂತಿಯ ಕಾರ್ಯ", opts_en:["to carry current to appliances","to act as a fuse","to provide safety from electric shock","to increase voltage"], opts_kn:["ವಿದ್ಯುತ್ ಉಪಕರಣಗಳಿಗೆ ಪ್ರವಾಹ ತರುವುದು","ಫ್ಯೂಸ್ ಆಗಿ ಕೆಲಸ ಮಾಡುವುದು","ವಿದ್ಯುತ್ ಆಘಾತದಿಂದ ಸುರಕ್ಷತೆ","ವೋಲ್ಟೇಜ್ ಹೆಚ್ಚಿಸುವುದು"] },
    { id:20, en:"A step-up transformer", kn:"ಸ್ಟೆಪ್-ಅಪ್ ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್", opts_en:["increases current","decreases voltage","increases voltage","has more turns in primary"], opts_kn:["ಪ್ರವಾಹ ಹೆಚ್ಚಿಸುತ್ತದೆ","ವೋಲ್ಟೇಜ್ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ","ವೋಲ್ಟೇಜ್ ಹೆಚ್ಚಿಸುತ್ತದೆ","ಪ್ರಾಥಮಿಕದಲ್ಲಿ ಹೆಚ್ಚು ಸುರುಳಿಗಳಿವೆ"] },
    { id:21, en:"Tidal energy is generated due to", kn:"ಜ್ವಾರಭಾಟ ಶಕ್ತಿ ಉತ್ಪತ್ತಿಯ ಕಾರಣ", opts_en:["Solar energy","Wind energy","Gravitational pull of the Moon","Heat from the Earth's interior"], opts_kn:["ಸೌರಶಕ್ತಿ","ಗಾಳಿ ಶಕ್ತಿ","ಚಂದ್ರನ ಗುರುತ್ವಾಕರ್ಷಣೆ","ಭೂಮಿಯ ಒಳಭಾಗದ ಶಾಖ"] },
    { id:22, en:"Which of the following is a conventional source of energy?", kn:"ಕೆಳಕಂಡವುಗಳಲ್ಲಿ ಸಾಂಪ್ರದಾಯಿಕ ಶಕ್ತಿ ಮೂಲ ಯಾವುದು?", opts_en:["Solar energy","Coal","Wind energy","Tidal energy"], opts_kn:["ಸೌರಶಕ್ತಿ","ಕಲ್ಲಿದ್ದಲು","ಗಾಳಿ ಶಕ್ತಿ","ಜ್ವಾರಭಾಟ ಶಕ್ತಿ"] },
    { id:23, en:"The gas evolved when zinc reacts with dilute HCl is", kn:"ತಂಗಟು ಮತ್ತು ಹಳಸಿದ HCl ರ ಪ್ರತಿಕ್ರಿಯೆಯಿಂದ ಉತ್ಪತ್ತಿಯಾಗುವ ಅನಿಲ", opts_en:["Oxygen","Chlorine","Hydrogen","Carbon dioxide"], opts_kn:["ಆಮ್ಲಜನಕ","ಕ್ಲೋರಿನ್","ಹೈಡ್ರೋಜನ್","ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್"] },
    { id:24, en:"A metal which is liquid at room temperature is", kn:"ಕೋಣೆ ಉಷ್ಣಾಂಶದಲ್ಲಿ ದ್ರವ ರೂಪದಲ್ಲಿರುವ ಲೋಹ", opts_en:["Iron","Copper","Mercury","Lead"], opts_kn:["ಕಬ್ಬಿಣ","ತಾಮ್ರ","ಪಾದರಸ","ಸೀಸ"] },
    { id:25, en:"The process of obtaining a metal from its ore is called", kn:"ಅದಿರಿನಿಂದ ಲೋಹ ತೆಗೆಯುವ ಪ್ರಕ್ರಿಯೆ", opts_en:["Corrosion","Refining","Smelting","Galvanisation"], opts_kn:["ತುಕ್ಕು","ಪರಿಷ್ಕರಣ","ಶ್ರಾವಣ","ಗ್ಯಾಲ್ವನೀಕರಣ"] },
    { id:26, en:"Which of the following is a saturated hydrocarbon?", kn:"ಕೆಳಗಿನವುಗಳಲ್ಲಿ ಸ್ಯಾಚುರೇಟೆಡ್ ಹೈಡ್ರೋಕಾರ್ಬನ್ ಯಾವುದು?", opts_en:["Ethene","Ethyne","Propene","Propane"], opts_kn:["ಇಥೀನ್","ಇಥೈನ್","ಪ್ರೊಪೀನ್","ಪ್ರೊಪೇನ್"] },
    { id:27, en:"The element with atomic number 11 (Sodium) belongs to", kn:"ಪರಮಾಣು ಸಂಖ್ಯೆ 11 (ಸೋಡಿಯಂ) ಸೇರಿರುವ ಆವರ್ತ ಮತ್ತು ಗುಂಪು", opts_en:["Period 2, Group 1","Period 3, Group 1","Period 2, Group 17","Period 3, Group 17"], opts_kn:["ಆವರ್ತ 2, ಗುಂಪು 1","ಆವರ್ತ 3, ಗುಂಪು 1","ಆವರ್ತ 2, ಗುಂಪು 17","ಆವರ್ತ 3, ಗುಂಪು 17"] },
    { id:28, en:"Which pair of elements shows similar chemical properties in Dobereiner's Triads?", kn:"ಡೊಬೆರೈನರ್‌ನ ತ್ರಿಕಗಳಲ್ಲಿ ಸಮಾನ ರಾಸಾಯನಿಕ ಗುಣ ತೋರಿಸುವ ಜೋಡಿ", opts_en:["Li, Na, K","H, O, N","Fe, Co, Ni","C, N, O"], opts_kn:["Li, Na, K","H, O, N","Fe, Co, Ni","C, N, O"] },
    { id:29, en:"Transpiration in plants occurs mainly through", kn:"ಸಸ್ಯಗಳಲ್ಲಿ ವಾಷ್ಪೋತ್ಸರ್ಜನ ಮುಖ್ಯವಾಗಿ ಎಲ್ಲಿ ನಡೆಯುತ್ತದೆ?", opts_en:["Roots","Stem","Stomata","Flowers"], opts_kn:["ಬೇರುಗಳಲ್ಲಿ","ಕಾಂಡದಲ್ಲಿ","ಸ್ಟೊಮಟಾದ ಮೂಲಕ","ಹೂಗಳಲ್ಲಿ"] },
    { id:30, en:"The term 'gene' was coined by", kn:"'ಜೀನ್' ಎಂಬ ಪದ ಮೊದಲು ಪ್ರಯೋಗಿಸಿದ ವಿಜ್ಞಾನಿ", opts_en:["Morgan","Mendel","Johanssen","Darwin"], opts_kn:["ಮೋರ್ಗನ್","ಮೆಂಡೆಲ್","ಜೊಹಾನ್ಸೆನ್","ಡಾರ್ವಿನ್"] },
  ],
};

/* ─── PAPER EDITOR ───────────────────────────────────────────────────── */
function PaperEditor() {
  const [ver, setVer] = useState("A");
  const [tab, setTab] = useState("questions");
  const [papers, setPapers] = useState(DEFAULT_PAPERS);
  const [keys, setKeys] = useState({ ...SAMPLE_KEYS });
  const [editIdx, setEditIdx] = useState(null);
  const [editQ, setEditQ] = useState({});
  const [saved, setSaved] = useState(false);

  const paper = papers[ver];

  const startEdit = (i) => { setEditIdx(i); setEditQ({ ...paper[i], opts_en:[...paper[i].opts_en], opts_kn:[...paper[i].opts_kn] }); };
  const saveQ = () => {
    setPapers(p => ({ ...p, [ver]: p[ver].map((q, i) => i === editIdx ? { ...editQ } : q) }));
    setEditIdx(null);
  };
  const setAns = (i, val) => {
    const nk = [...keys[ver]]; nk[i] = val;
    setKeys(p => ({ ...p, [ver]: nk }));
    setSaved(false);
  };

  const printPaper = (v, lang) => {
    const p = papers[v || ver];
    const isKn = lang === "kn";
    const win = window.open("", "_blank");
    const knFont = isKn ? `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;600&display=swap" rel="stylesheet">` : "";
    const bodyFont = isKn ? "'Noto Sans Kannada', sans-serif" : "'Inter', sans-serif";
    const title = isKn
      ? `ಶ್ರೀ ಸಿ.ಎಂ ನಾಗರಾಜ್ ಫೌಂಡೇಶನ್ ಟ್ರಸ್ಟ್`
      : `SRI C.M NAGARAJ FOUNDATION TRUST`;
    const subtitle = isKn
      ? `ಈಸ್ಟ್ ವೆಸ್ಟ್ ಪಾಲಿಟೆಕ್ನಿಕ್ ಡಿಪ್ಲೊಮಾ ಪ್ರವೇಶ ಪರೀಕ್ಷೆ 2026 | ಆವೃತ್ತಿ ${v||ver} | ಒಟ್ಟು: ${N_Q} ಅಂಕಗಳು | ಸಮಯ: 1 ಗಂಟೆ`
      : `East West Polytechnic Diploma Entrance Examination 2026 | Version ${v||ver} | Total: ${N_Q} Marks | Time: 1 Hour`;
    const nameLbl  = isKn ? "ಹೆಸರು" : "Name";
    const phoneLbl = isKn ? "ದೂರವಾಣಿ" : "Phone";
    const schoolLbl = isKn ? "ಶಾಲೆ" : "School";

    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>Version ${v||ver} - ${isKn?"Kannada":"English"}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
${knFont}
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:${bodyFont};padding:24px;max-width:820px;margin:0 auto;font-size:13px}
h1{text-align:center;font-size:16px;margin-bottom:4px}
h2{text-align:center;font-size:12px;font-weight:normal;border-bottom:2px solid #000;padding-bottom:8px;margin-bottom:14px}
.meta{display:flex;gap:24px;margin-bottom:10px;font-size:12px}
.meta u{min-width:160px;border-bottom:1px solid #000;display:inline-block}
.badge{display:inline-block;background:#0d2137;color:#fff;padding:2px 12px;border-radius:4px;font-weight:700;font-size:12px}
.q{margin:8px 0;page-break-inside:avoid;border:1px solid #e5e7eb;border-radius:4px;padding:8px 10px}
.qtxt{font-weight:600;font-size:13px;margin-bottom:6px}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding-left:10px}
.opt{font-size:12px}
@media print{button{display:none}}
</style></head><body>
<h1>${title}</h1>
<h2>${subtitle}</h2>
<div class="meta"><span>${nameLbl}: <u>&nbsp;</u></span><span>${phoneLbl}: <u>&nbsp;</u></span></div>
<div class="meta"><span>${schoolLbl}: <u style="min-width:320px">&nbsp;</u></span></div>
${p.map((q, i) => {
  const qtxt = isKn ? q.kn : q.en;
  const opts = isKn ? q.opts_kn : q.opts_en;
  return `<div class="q">
<div class="qtxt">${i+1}. ${qtxt}</div>
<div class="opts">${["A","B","C","D"].map((o,j)=>`<div class="opt">${o}) ${opts[j]}</div>`).join("")}</div>
</div>`;
}).join("")}
<br/><button onclick="window.print()" style="padding:8px 20px;background:#0d2137;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-top:12px">Print</button>
</body></html>`);
    win.document.close();
  };

  return (
    <div>
      <div style={{ display:"flex", gap:8, marginBottom:20 }}>
        {["A","B","C","D"].map(v => (
          <Btn key={v} variant={ver===v?"primary":"ghost"} size="sm" onClick={() => setVer(v)}>Version {v}</Btn>
        ))}
      </div>
      <div style={{ display:"flex", gap:0, borderBottom:`2px solid ${C.border}`, marginBottom:20 }}>
        {[["questions","Questions (EN+KN)"],["answerkey","Answer Key"],["print","Print Paper"]].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            padding:"9px 20px", border:"none", background:"transparent", cursor:"pointer",
            fontWeight: tab===id?700:400, color: tab===id?C.navy:C.gray,
            borderBottom: tab===id?`3px solid ${C.navy}`:"3px solid transparent",
            fontSize:14, fontFamily:font.body,
          }}>{label}</button>
        ))}
      </div>

      {tab === "questions" && (
        editIdx !== null ? (
          <div style={card}>
            <div style={{ fontFamily:font.display, fontSize:18, color:C.navy, marginBottom:16 }}>Edit Q{editIdx+1} — Version {ver}</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div>
                <label style={lbl}>Question (English)</label>
                <textarea style={{ ...inp, minHeight:70, resize:"vertical" }} value={editQ.en}
                  onChange={e => setEditQ(p => ({ ...p, en: e.target.value }))} />
              </div>
              <div>
                <label style={{ ...lbl, fontFamily:"Noto Sans Kannada, sans-serif" }}>ಪ್ರಶ್ನೆ (Kannada)</label>
                <textarea style={{ ...inp, minHeight:70, resize:"vertical", fontFamily:"Noto Sans Kannada, sans-serif" }}
                  value={editQ.kn} onChange={e => setEditQ(p => ({ ...p, kn: e.target.value }))} />
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginBottom:16 }}>
              {["A","B","C","D"].map((o, j) => (
                <div key={o}>
                  <label style={lbl}>Option {o} (EN)</label>
                  <input style={inp} value={editQ.opts_en[j]}
                    onChange={e => { const n=[...editQ.opts_en]; n[j]=e.target.value; setEditQ(p=>({...p,opts_en:n})); }} />
                  <label style={{ ...lbl, marginTop:6, fontFamily:"Noto Sans Kannada, sans-serif" }}>ಆಯ್ಕೆ {o} (KN)</label>
                  <input style={{ ...inp, fontFamily:"Noto Sans Kannada, sans-serif" }} value={editQ.opts_kn[j]}
                    onChange={e => { const n=[...editQ.opts_kn]; n[j]=e.target.value; setEditQ(p=>({...p,opts_kn:n})); }} />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="primary" onClick={saveQ}>Save Question</Btn>
              <Btn variant="ghost" onClick={() => setEditIdx(null)}>Cancel</Btn>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {paper.map((q, i) => (
              <div key={i} style={{ ...card, padding:"14px 18px", display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:C.bgPage, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, color:C.navy, flexShrink:0 }}>{i+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:C.navy, marginBottom:3 }}>{q.en}</div>
                  <div style={{ fontSize:13, color:C.gray, fontFamily:"Noto Sans Kannada, sans-serif", marginBottom:6 }}>{q.kn}</div>
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                    {["A","B","C","D"].map((o, j) => (
                      <span key={o} style={{ fontSize:12, color:C.gray }}>{o}) {q.opts_en[j]} / {q.opts_kn[j]}</span>
                    ))}
                  </div>
                </div>
                <Btn variant="ghost" size="sm" onClick={() => startEdit(i)}>Edit</Btn>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "answerkey" && (
        <div style={card}>
          <div style={{ fontFamily:font.display, fontSize:18, color:C.navy, marginBottom:6 }}>Answer Key — Version {ver}</div>
          <div style={{ color:C.gray, fontSize:13, marginBottom:16 }}>Select the correct answer for each question.</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:10, marginBottom:20 }}>
            {Array.from({ length: N_Q }, (_, i) => (
              <div key={i} style={{ ...card, padding:"10px" }}>
                <div style={{ fontSize:12, fontWeight:600, color:C.gray, marginBottom:8 }}>Q{i+1}</div>
                <div style={{ display:"flex", gap:4 }}>
                  {["A","B","C","D"].map(o => (
                    <button key={o} onClick={() => setAns(i, o)} style={{
                      flex:1, padding:"6px 0", border:`2px solid ${keys[ver][i]===o?"#15803d":C.border}`,
                      borderRadius:6, background:keys[ver][i]===o?"#dcfce7":C.white,
                      color:keys[ver][i]===o?"#15803d":C.gray, fontWeight:700, fontSize:13, cursor:"pointer",
                    }}>{o}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Btn variant="primary" onClick={() => setSaved(true)}>Save Answer Key</Btn>
            {saved && <span style={{ color:"#15803d", fontSize:13, fontWeight:600 }}>Saved!</span>}
          </div>
          <div style={{ marginTop:12, padding:"10px 14px", background:"#f0fdf4", borderRadius:8, color:"#15803d", fontSize:13 }}>
            {keys[ver].filter(k=>k!==null).length}/{N_Q} answers set for Version {ver}
          </div>
        </div>
      )}

      {tab === "print" && (
        <div style={card}>
          <div style={{ fontFamily:font.display, fontSize:20, color:C.navy, marginBottom:8 }}>Print Question Papers</div>
          <p style={{ color:C.gray, fontSize:14, marginBottom:24, lineHeight:1.6 }}>
            Choose a version and language to print. Each paper opens in a new tab — use Ctrl+P to print or save as PDF.
          </p>

          {["A","B","C","D"].map(v => (
            <div key={v} style={{ ...card, marginBottom:16, padding:"18px 20px", borderLeft:`4px solid ${C.navy}` }}>
              <div style={{ fontFamily:font.display, fontSize:16, color:C.navy, marginBottom:12 }}>
                Version {v} — {keys[v].filter(k=>k!==null).length}/{N_Q} answers set
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <Btn variant="primary" size="md" onClick={() => printPaper(v, "en")}>
                  Print English (Version {v})
                </Btn>
                <Btn variant="ghost" size="md" onClick={() => printPaper(v, "kn")}
                  style={{ border:`1.5px solid ${C.navy}`, color:C.navy }}>
                  ಕನ್ನಡದಲ್ಲಿ ಮುದ್ರಿಸಿ (Version {v})
                </Btn>
              </div>
            </div>
          ))}

          <div style={{ marginTop:8, padding:"14px 16px", background:"#eff6ff", borderRadius:8, borderLeft:`3px solid #2563eb`, fontSize:13, color:"#1e40af" }}>
            Tip: Use Ctrl+P in the print preview to print or save as PDF.
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── STAFF PORTAL ───────────────────────────────────────────────────── */
function StaffPortal({ students, setStudents, goBack }) {
  const [tab, setTab] = useState("upload");
  const tabs = [{ id:"results", label:"Student Results" }, { id:"upload", label:"Upload OMR" }, { id:"papers", label:"Question Papers" }];
  return (
    <div style={{ minHeight:"100vh", background:C.bgPage, fontFamily:font.body }}>
      <Header subtitle="Staff Portal" onBack={goBack} />
      <div style={{ maxWidth:1100, margin:"28px auto", padding:"0 20px" }}>
        <div style={{ display:"flex", gap:8, marginBottom:24 }}>
          {tabs.map(t => <Btn key={t.id} variant={tab===t.id?"primary":"ghost"} size="sm" onClick={() => setTab(t.id)}>{t.label}</Btn>)}
        </div>
        {tab === "results"   && <div style={card}><ResultsTable students={students} /></div>}
        {tab === "upload"    && <OMRUpload students={students} setStudents={setStudents} answerKeys={SAMPLE_KEYS} />}
        {tab === "papers"    && <PaperEditor />}
      </div>
    </div>
  );
}

/* ─── PRINCIPAL PORTAL ───────────────────────────────────────────────── */
function PrincipalPortal({ students, goBack }) {
  const [tab, setTab] = useState("results");
  const tabs = [{ id:"results", label:"All Results" }, { id:"analytics", label:"Analytics" }];
  return (
    <div style={{ minHeight:"100vh", background:C.bgPage, fontFamily:font.body }}>
      <Header subtitle="Principal Portal" onBack={goBack} />
      <div style={{ maxWidth:1100, margin:"28px auto", padding:"0 20px" }}>
        <div style={{ display:"flex", gap:8, marginBottom:24 }}>
          {tabs.map(t => <Btn key={t.id} variant={tab===t.id?"primary":"ghost"} size="sm" onClick={() => setTab(t.id)}>{t.label}</Btn>)}
        </div>
        {tab === "results"   && <div style={card}><ResultsTable students={students} /></div>}
        {tab === "analytics" && <Analytics students={students} />}
      </div>
    </div>
  );
}

/* ─── ADMIN PORTAL ───────────────────────────────────────────────────── */
function AdminPortal({ students, setStudents, goBack }) {
  const [tab, setTab] = useState("results");
  const tabs = [
    { id:"results", label:"All Results" }, { id:"analytics", label:"Analytics" },
    { id:"upload", label:"Upload OMR" }, { id:"papers", label:"Answer Keys" },
    { id:"settings", label:"Settings" },
  ];
  return (
    <div style={{ minHeight:"100vh", background:C.bgPage, fontFamily:font.body }}>
      <Header subtitle="Admin Portal" onBack={goBack} />
      <div style={{ maxWidth:1100, margin:"28px auto", padding:"0 20px" }}>
        <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
          {tabs.map(t => <Btn key={t.id} variant={tab===t.id?"primary":"ghost"} size="sm" onClick={() => setTab(t.id)}>{t.label}</Btn>)}
        </div>
        {tab === "results"   && <div style={card}><ResultsTable students={students} /></div>}
        {tab === "analytics" && <Analytics students={students} />}
        {tab === "upload"    && <OMRUpload students={students} setStudents={setStudents} answerKeys={SAMPLE_KEYS} />}
        {tab === "papers"    && <PaperEditor />}
        {tab === "settings"  && (
          <div style={card}>
            <div style={{ fontFamily:font.display, fontSize:20, color:C.navy, marginBottom:20 }}>System Settings</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[["Institution","Sri C.M Nagaraj Foundation Trust"],["Exam Year","2026"],["Total Questions","30"],["Passing Score","15"]].map(([l,v]) => (
                <div key={l}>
                  <label style={lbl}>{l}</label>
                  <input style={inp} defaultValue={v} />
                </div>
              ))}
            </div>
            <div style={{ marginTop:20, padding:"16px", background:"#fef2f2", borderRadius:8, borderLeft:`3px solid ${C.danger}` }}>
              <div style={{ fontFamily:font.display, fontSize:16, color:C.navy, marginBottom:8 }}>Danger Zone</div>
              <Btn variant="danger" size="sm" onClick={() => { if(window.confirm("Reset all data?")) window.location.reload(); }}>Reset All Data</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────────────── */
export default function App() {
  const [students, setStudents] = useState(processStudents());
  const [view, setView] = useState("landing");

  // Fetch from backend on load
  useEffect(() => {
    fetch(`${API_BASE}/api/students/`)
      .then(r => r.json())
      .then(data => { if (data && data.length > 0) setStudents(data); })
      .catch(() => {});
  }, []);

  if (view === "landing") return (
    <LandingPage onRole={r => setView(r === "student" ? "student" : `login-${r}`)} />
  );
  if (view === "login-staff")     return <Login role="staff"     onLogin={() => setView("staff")} />;
  if (view === "login-principal") return <Login role="principal" onLogin={() => setView("principal")} />;
  if (view === "login-admin")     return <Login role="admin"     onLogin={() => setView("admin")} />;
  if (view === "student")         return <StudentPortal students={students} goBack={() => setView("landing")} />;

  if (view === "staff")     return <StaffPortal     students={students} setStudents={setStudents} goBack={() => setView("landing")} />;
  if (view === "principal") return <PrincipalPortal students={students} goBack={() => setView("landing")} />;
  if (view === "admin")     return <AdminPortal     students={students} setStudents={setStudents} goBack={() => setView("landing")} />;
  return null;
}
