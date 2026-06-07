import { useState, useEffect, useRef, useCallback } from "react";

// ════════════════════════════════════════════════════════════════
// OWNER CREDENTIALS — only you have access
// ════════════════════════════════════════════════════════════════
const OWNER = { login: "boris", password: "glosspoint2026", name: "Boris" };

// ════════════════════════════════════════════════════════════════
// CALIFORNIA REGIONS & EVENTS DATABASE
// ════════════════════════════════════════════════════════════════
const REGIONS = {
  "Orange County": {
    color: "#FF6B6B",
    icon: "🏖️",
    cities: ["Newport Beach", "Dana Point", "Laguna Beach", "Huntington Beach", "San Clemente"],
    baseMultiplier: 1.0,
  },
  "Los Angeles": {
    color: "#FFD97D",
    icon: "🌆",
    cities: ["Santa Monica", "Venice", "Malibu", "Marina del Rey", "Long Beach"],
    baseMultiplier: 1.05,
  },
  "San Diego": {
    color: "#7EB8FF",
    icon: "⛵",
    cities: ["La Jolla", "Coronado", "Pacific Beach", "Mission Bay", "Del Mar"],
    baseMultiplier: 0.95,
  },
  "Palm Springs": {
    color: "#B8FF7E",
    icon: "🌴",
    cities: ["Palm Springs", "Palm Desert", "Rancho Mirage", "Indian Wells", "Coachella"],
    baseMultiplier: 0.85,
  },
  "Big Bear / Mammoth": {
    color: "#FF9F7E",
    icon: "⛷️",
    cities: ["Big Bear Lake", "Mammoth Lakes", "Lake Arrowhead", "Running Springs"],
    baseMultiplier: 0.9,
  },
};

const EVENTS_DB = [
  // ── ORANGE COUNTY
  { region: "Orange County", date: "2026-07-04", name: "Independence Day Fireworks", type: "holiday", impact: 2.8, icon: "🎆" },
  { region: "Orange County", date: "2026-07-03", name: "Pre-July 4th Rush", type: "holiday", impact: 2.1, icon: "🎆" },
  { region: "Orange County", date: "2026-06-14", name: "Pageant of the Masters", type: "festival", impact: 1.9, icon: "🎭" },
  { region: "Orange County", date: "2026-06-20", name: "Newport Beach Jazz Festival", type: "festival", impact: 1.7, icon: "🎵" },
  { region: "Orange County", date: "2026-06-28", name: "Dana Point Ocean Festival", type: "event", impact: 1.6, icon: "🐋" },
  { region: "Orange County", date: "2026-07-18", name: "Sawdust Art Festival Opens", type: "festival", impact: 1.5, icon: "🎨" },
  { region: "Orange County", date: "2026-08-15", name: "Newport Seafood & Wine Fest", type: "festival", impact: 1.6, icon: "🍷" },
  { region: "Orange County", date: "2026-09-06", name: "Labor Day Weekend", type: "holiday", impact: 2.0, icon: "🇺🇸" },
  { region: "Orange County", date: "2026-10-31", name: "Halloween - OC", type: "holiday", impact: 1.6, icon: "🎃" },
  { region: "Orange County", date: "2026-12-31", name: "New Year's Eve - OC", type: "holiday", impact: 2.9, icon: "🥂" },
  { region: "Orange County", date: "2026-12-25", name: "Christmas - OC", type: "holiday", impact: 2.4, icon: "🎄" },
  { region: "Orange County", date: "2026-11-26", name: "Thanksgiving - OC", type: "holiday", impact: 1.9, icon: "🦃" },
  // ── LOS ANGELES
  { region: "Los Angeles", date: "2026-07-04", name: "Independence Day - LA", type: "holiday", impact: 2.6, icon: "🎆" },
  { region: "Los Angeles", date: "2026-07-10", name: "Hollywood Bowl Season Peak", type: "event", impact: 1.7, icon: "🎶" },
  { region: "Los Angeles", date: "2026-08-01", name: "LA County Fair Opens", type: "festival", impact: 1.5, icon: "🎡" },
  { region: "Los Angeles", date: "2026-08-22", name: "Malibu Chili Cook-Off", type: "event", impact: 1.4, icon: "🌶️" },
  { region: "Los Angeles", date: "2026-09-06", name: "Labor Day - LA", type: "holiday", impact: 2.0, icon: "🇺🇸" },
  { region: "Los Angeles", date: "2026-09-20", name: "LA Fleet Week", type: "event", impact: 1.5, icon: "⚓" },
  { region: "Los Angeles", date: "2026-10-15", name: "LA Marathon Weekend", type: "sport", impact: 1.8, icon: "🏃" },
  { region: "Los Angeles", date: "2026-12-31", name: "New Year's Eve - LA", type: "holiday", impact: 3.0, icon: "🥂" },
  { region: "Los Angeles", date: "2026-12-25", name: "Christmas - LA", type: "holiday", impact: 2.3, icon: "🎄" },
  { region: "Los Angeles", date: "2026-02-14", name: "Valentine's Day - LA", type: "holiday", impact: 1.8, icon: "❤️" },
  // ── SAN DIEGO
  { region: "San Diego", date: "2026-07-04", name: "Big Bay Boom Fireworks", type: "holiday", impact: 2.9, icon: "🎆" },
  { region: "San Diego", date: "2026-07-11", name: "ComicCon International", type: "event", impact: 3.5, icon: "🦸" },
  { region: "San Diego", date: "2026-07-12", name: "ComicCon Day 2", type: "event", impact: 3.4, icon: "🦸" },
  { region: "San Diego", date: "2026-07-13", name: "ComicCon Day 3", type: "event", impact: 3.2, icon: "🦸" },
  { region: "San Diego", date: "2026-08-08", name: "San Diego Craft Beer Week", type: "festival", impact: 1.5, icon: "🍺" },
  { region: "San Diego", date: "2026-09-06", name: "Labor Day - SD", type: "holiday", impact: 2.1, icon: "🇺🇸" },
  { region: "San Diego", date: "2026-09-19", name: "Fleet Week San Diego", type: "event", impact: 1.7, icon: "⚓" },
  { region: "San Diego", date: "2026-10-03", name: "San Diego Restaurant Week", type: "event", impact: 1.3, icon: "🍽️" },
  { region: "San Diego", date: "2026-12-31", name: "New Year's Eve - SD", type: "holiday", impact: 2.8, icon: "🥂" },
  { region: "San Diego", date: "2026-12-25", name: "Christmas - SD", type: "holiday", impact: 2.2, icon: "🎄" },
  // ── PALM SPRINGS
  { region: "Palm Springs", date: "2026-04-10", name: "Coachella Music Festival", type: "festival", impact: 4.2, icon: "🎪" },
  { region: "Palm Springs", date: "2026-04-11", name: "Coachella Weekend 1 - Day 2", type: "festival", impact: 4.0, icon: "🎪" },
  { region: "Palm Springs", date: "2026-04-12", name: "Coachella Weekend 1 - Day 3", type: "festival", impact: 3.8, icon: "🎪" },
  { region: "Palm Springs", date: "2026-04-17", name: "Coachella Weekend 2", type: "festival", impact: 3.9, icon: "🎪" },
  { region: "Palm Springs", date: "2026-04-18", name: "Coachella Weekend 2 - Day 2", type: "festival", impact: 3.7, icon: "🎪" },
  { region: "Palm Springs", date: "2026-11-07", name: "Palm Springs Film Festival", type: "event", impact: 2.0, icon: "🎬" },
  { region: "Palm Springs", date: "2026-01-02", name: "Palm Springs Int'l Film Fest", type: "event", impact: 1.9, icon: "🎬" },
  { region: "Palm Springs", date: "2026-02-14", name: "Valentine's Day Desert", type: "holiday", impact: 2.2, icon: "❤️" },
  { region: "Palm Springs", date: "2026-03-15", name: "Palm Springs Pride", type: "event", impact: 2.3, icon: "🌈" },
  // ── BIG BEAR / MAMMOTH
  { region: "Big Bear / Mammoth", date: "2026-01-17", name: "MLK Weekend - Peak Ski", type: "holiday", impact: 2.5, icon: "🎿" },
  { region: "Big Bear / Mammoth", date: "2026-02-14", name: "Valentine's Day Snow", type: "holiday", impact: 2.4, icon: "❤️" },
  { region: "Big Bear / Mammoth", date: "2026-02-16", name: "Presidents Day Ski Weekend", type: "holiday", impact: 2.6, icon: "🎿" },
  { region: "Big Bear / Mammoth", date: "2026-03-07", name: "Spring Ski Break Peak", type: "seasonal", impact: 2.0, icon: "⛷️" },
  { region: "Big Bear / Mammoth", date: "2026-07-04", name: "Independence Day Mountains", type: "holiday", impact: 2.1, icon: "🎆" },
  { region: "Big Bear / Mammoth", date: "2026-09-06", name: "Labor Day Hiking Peak", type: "holiday", impact: 1.9, icon: "🥾" },
  { region: "Big Bear / Mammoth", date: "2026-12-25", name: "Christmas Ski Peak", type: "holiday", impact: 3.0, icon: "🎄" },
  { region: "Big Bear / Mammoth", date: "2026-12-31", name: "New Year's Eve Snow", type: "holiday", impact: 3.1, icon: "🥂" },
];

// Monthly seasonality per region
const SEASONALITY = {
  "Orange County":     [1.1, 1.0, 1.1, 1.2, 1.35, 1.55, 1.9, 1.8, 1.4, 1.2, 1.0, 1.3],
  "Los Angeles":       [1.0, 1.0, 1.1, 1.2, 1.3,  1.5,  1.8, 1.7, 1.4, 1.2, 1.0, 1.2],
  "San Diego":         [1.1, 1.0, 1.1, 1.2, 1.4,  1.6,  2.0, 1.9, 1.5, 1.2, 1.0, 1.3],
  "Palm Springs":      [1.3, 1.4, 1.8, 2.2, 1.2,  0.8,  0.7, 0.7, 0.9, 1.4, 1.5, 1.3],
  "Big Bear / Mammoth":[1.9, 2.0, 1.8, 1.2, 0.8,  0.9,  1.5, 1.4, 1.0, 0.9, 1.0, 2.1],
};

const DOW_M = { 0: 1.25, 1: 0.82, 2: 0.80, 3: 0.83, 4: 0.95, 5: 1.38, 6: 1.30 };

const TYPE_COLORS = {
  holiday: "#FF6B6B", festival: "#FFD97D", event: "#7EB8FF",
  seasonal: "#7EFFA0", sport: "#FF9F7E",
};

function calcPrice(base, dateStr, region) {
  const d = new Date(dateStr + "T12:00:00");
  const m = d.getMonth();
  const dow = d.getDay();
  const regionData = REGIONS[region];
  const events = EVENTS_DB.filter(e => e.region === region && e.date === dateStr);
  const evM = events.length ? Math.max(...events.map(e => e.impact)) : 1.0;
  const seaM = (SEASONALITY[region] || SEASONALITY["Orange County"])[m];
  const dowM = DOW_M[dow];
  const regM = regionData?.baseMultiplier || 1.0;
  const price = Math.round(base * seaM * dowM * evM * regM);
  return { price, events, seaM, dowM, evM };
}

function getDays(startStr, n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(startStr + "T12:00:00");
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

// ════════════════════════════════════════════════════════════════
// SUBCOMPONENTS
// ════════════════════════════════════════════════════════════════

function EventBadge({ type, label }) {
  const c = TYPE_COLORS[type] || "#888";
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      color: c, background: `${c}18`, border: `1px solid ${c}40`,
      padding: "2px 8px", borderRadius: 20,
    }}>{label}</span>
  );
}

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const W = 120, H = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - 2 - ((v - min) / range) * (H - 4);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      {data.map((v, i) => {
        if (i !== data.length - 1) return null;
        const x = (i / (data.length - 1)) * W;
        const y = H - 2 - ((v - min) / range) * (H - 4);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin }) {
  return (
    <div style={{
      minHeight: "100vh", background: "#060709",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Mono', monospace",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@800&display=swap');
        @keyframes pulse { 0%,100%{box-shadow:0 0 20px rgba(99,210,255,0.15)} 50%{box-shadow:0 0 40px rgba(99,210,255,0.35)} }
        .enter-btn { cursor:pointer; transition: all 0.2s; animation: pulse 2.5s ease infinite; }
        .enter-btn:hover { background: #63D2FF !important; color: #060709 !important; transform: scale(1.02); }
      `}</style>
      <div style={{
        width: 360, padding: "48px 40px",
        background: "#0C0E12",
        border: "1px solid #1A1E28",
        borderRadius: 20,
        textAlign: "center",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
          background: "linear-gradient(135deg, #63D2FF22, #63D2FF08)",
          border: "1px solid #63D2FF44",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
        }}>⚡</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#E8EAF0", letterSpacing: "-0.02em", marginBottom: 6 }}>
          Stay<span style={{ color: "#63D2FF" }}>verra</span>
        </div>
        <div style={{ fontSize: 10, color: "#333", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>
          California STR Management Platform
        </div>
        <div style={{ fontSize: 12, color: "#444", marginBottom: 36, lineHeight: 1.6 }}>
          AI-powered property management<br/>for short-term rentals in California
        </div>
        <button className="enter-btn" onClick={onLogin} style={{
          width: "100%", background: "#0C0E12",
          border: "1px solid #63D2FF55",
          borderRadius: 12, padding: "16px",
          color: "#63D2FF", fontFamily: "'DM Mono'", fontSize: 14, fontWeight: 500,
        }}>
          Enter Platform →
        </button>
        <div style={{ marginTop: 20, fontSize: 10, color: "#1A1E28" }}>
          Private · Owner Access
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// CLIENT VIEW — what you show to clients
// ════════════════════════════════════════════════════════════════
function ClientView({ region, basePrice, onBack }) {
  const today = new Date().toISOString().split("T")[0];
  const [days] = useState(30);
  const dateList = getDays(today, days);
  const priceList = dateList.map(d => ({ date: d, ...calcPrice(basePrice, d, region) }));
  const maxP = Math.max(...priceList.map(p => p.price));
  const minP = Math.min(...priceList.map(p => p.price));
  const avgP = Math.round(priceList.reduce((s, p) => s + p.price, 0) / priceList.length);
  const projRevenue = priceList.reduce((s, p) => s + p.price, 0);
  const flatRevenue = basePrice * days;
  const uplift = Math.round(((projRevenue - flatRevenue) / flatRevenue) * 100);

  const regionColor = REGIONS[region]?.color || "#63D2FF";

  const upcomingEvents = EVENTS_DB
    .filter(e => e.region === region && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  // SVG chart
  const W = 600, H = 100;
  const pts = priceList.map((p, i) => {
    const x = (i / (priceList.length - 1)) * W;
    const y = H - 6 - ((p.price - minP) / (maxP - minP + 1)) * (H - 14);
    return { x, y, ...p };
  });

  return (
    <div style={{ minHeight: "100vh", background: "#060709", fontFamily: "'DM Mono', monospace", color: "#D8DAE8" }}>
      <style>{`
        .ev-row { transition: background 0.12s; }
        .ev-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #12151C", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "1px solid #1A1E28", borderRadius: 6, padding: "5px 12px", color: "#555", fontFamily: "'DM Mono'", fontSize: 11, cursor: "pointer" }}>← Back</button>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#E8EAF0" }}>
            Stay<span style={{ color: "#63D2FF" }}>verra</span>
          </span>
          <span style={{ fontSize: 9, color: "#333", letterSpacing: "0.15em", textTransform: "uppercase", paddingLeft: 12, borderLeft: "1px solid #1A1E28" }}>Client Report</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: regionColor, boxShadow: `0 0 8px ${regionColor}` }} />
          <span style={{ fontSize: 12, color: regionColor }}>{REGIONS[region]?.icon} {region}</span>
        </div>
      </div>

      <div style={{ padding: "28px", maxWidth: 900, margin: "0 auto" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { l: "AI Avg Price", v: `$${avgP}/night`, s: `vs $${basePrice} base`, c: regionColor },
            { l: "Peak Price", v: `$${maxP}`, s: "highest demand day", c: "#FF6B6B" },
            { l: "30-Day Revenue", v: `$${projRevenue.toLocaleString()}`, s: `+${uplift}% uplift`, c: "#7EFFA0" },
            { l: "Events Detected", v: upcomingEvents.length, s: "pricing triggers", c: "#FFD97D" },
          ].map((k, i) => (
            <div key={i} style={{ background: "#0C0E12", border: "1px solid #12151C", borderRadius: 14, padding: "18px 16px" }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>{k.l}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24, color: k.c, lineHeight: 1 }}>{k.v}</div>
              <div style={{ fontSize: 10, color: "#444", marginTop: 5 }}>{k.s}</div>
            </div>
          ))}
        </div>

        {/* Price Curve */}
        <div style={{ background: "#0C0E12", border: "1px solid #12151C", borderRadius: 16, padding: "22px", marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase" }}>AI-Optimized Pricing Curve</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#E8EAF0", marginTop: 3 }}>
              30-Day Dynamic Prices — {region}
            </div>
          </div>
          <svg viewBox={`0 0 ${W} ${H + 8}`} style={{ width: "100%" }}>
            <defs>
              <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={regionColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={regionColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={`0,${H} ${pts.map(p => `${p.x},${p.y}`).join(" ")} ${W},${H}`} fill="url(#cg)" />
            <polyline points={pts.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke={regionColor} strokeWidth="2" strokeLinejoin="round" />
            {pts.map((p, i) => p.events.length > 0 ? (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill={TYPE_COLORS[p.events[0].type]} stroke="#060709" strokeWidth="1.5" />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#AAA" fontSize="8">${p.price}</text>
              </g>
            ) : null)}
          </svg>
          <div style={{ display: "flex", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
            {Object.entries(TYPE_COLORS).map(([t, c]) => (
              <span key={t} style={{ fontSize: 10, color: "#555" }}>
                <span style={{ color: c }}>●</span> {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {/* Events */}
        <div style={{ background: "#0C0E12", border: "1px solid #12151C", borderRadius: 16, padding: "22px" }}>
          <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Upcoming Demand Triggers</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#E8EAF0", marginBottom: 16 }}>Events Affecting Your Prices</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingEvents.map((ev, i) => {
              const priceDay = calcPrice(basePrice, ev.date, region).price;
              const daysUntil = Math.round((new Date(ev.date) - new Date(today)) / 86400000);
              return (
                <div key={i} className="ev-row" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "#07080A", border: "1px solid #12151C",
                  borderLeft: `3px solid ${TYPE_COLORS[ev.type]}`,
                  borderRadius: 10, padding: "12px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{ev.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, color: "#D0D2DA", marginBottom: 4 }}>{ev.name}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <EventBadge type={ev.type} label={ev.type} />
                        <span style={{ fontSize: 10, color: "#444" }}>{ev.date}</span>
                        {daysUntil >= 0 && <span style={{ fontSize: 10, color: "#555" }}>in {daysUntil}d</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, color: TYPE_COLORS[ev.type], lineHeight: 1 }}>${priceDay}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>×{ev.impact} demand</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20, padding: "14px 16px", background: "#07080A", borderRadius: 10, border: "1px solid #12151C", fontSize: 11, color: "#555", lineHeight: 1.7 }}>
            ⚡ <span style={{ color: "#63D2FF" }}>Stayverra</span> automatically adjusts your nightly rate based on seasonality, local events, and demand patterns — so you always capture maximum revenue without manual work.
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// MAIN OWNER DASHBOARD
// ════════════════════════════════════════════════════════════════
function OwnerDashboard({ onLogout }) {
  const today = new Date().toISOString().split("T")[0];
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedRegion, setSelectedRegion] = useState("Orange County");
  const [basePrice, setBasePrice] = useState(250);
  const [clientView, setClientView] = useState(null);
  const [aiQ, setAiQ] = useState("");
  const [aiR, setAiR] = useState("");
  const [aiLoad, setAiLoad] = useState(false);

  // Simulated portfolio
  const portfolio = [
    { id: 1, name: "Ocean View Villa", region: "Orange County", city: "Dana Point", base: 280, occupancy: 87 },
    { id: 2, name: "Newport Harbor Suite", region: "Orange County", city: "Newport Beach", base: 250, occupancy: 79 },
    { id: 3, name: "Sunset Loft", region: "Los Angeles", city: "Santa Monica", base: 220, occupancy: 74 },
    { id: 4, name: "La Jolla Cove House", region: "San Diego", city: "La Jolla", base: 310, occupancy: 82 },
    { id: 5, name: "Desert Oasis", region: "Palm Springs", city: "Palm Springs", base: 195, occupancy: 68 },
    { id: 6, name: "Mountain Cabin", region: "Big Bear / Mammoth", city: "Big Bear Lake", base: 175, occupancy: 71 },
  ];

  const previewDays = getDays(today, 30);

  async function askAI() {
    if (!aiQ.trim()) return;
    setAiLoad(true); setAiR("");
    const eventsSummary = EVENTS_DB.filter(e => e.date >= today).slice(0, 20)
      .map(e => `${e.date} ${e.region}: ${e.name} (×${e.impact})`).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are the AI core of Stayverra — a California STR dynamic pricing platform owned by Boris. You cover 5 regions: Orange County, Los Angeles, San Diego, Palm Springs, Big Bear/Mammoth.

Portfolio: ${portfolio.length} properties generating ~$${portfolio.reduce((s, p) => s + p.base * p.occupancy / 100 * 30, 0).toFixed(0)}/month.

Upcoming key events:
${eventsSummary}

Be strategic, specific, and data-driven. Answer in the same language as the question (Russian or English). Max 220 words.`,
          messages: [{ role: "user", content: aiQ }],
        }),
      });
      const data = await res.json();
      setAiR(data.content?.[0]?.text || "Error");
    } catch { setAiR("Connection error."); }
    setAiLoad(false); setAiQ("");
  }

  if (clientView) {
    return <ClientView region={clientView.region} basePrice={clientView.base} onBack={() => setClientView(null)} />;
  }

  const regionColor = REGIONS[selectedRegion]?.color || "#63D2FF";
  const previewPrices = previewDays.map(d => calcPrice(basePrice, d, selectedRegion).price);
  const previewAvg = Math.round(previewPrices.reduce((s, v) => s + v, 0) / previewPrices.length);
  const nextEvents = EVENTS_DB.filter(e => e.region === selectedRegion && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const TABS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "pricing", label: "Pricing Engine" },
    { id: "events", label: "Events DB" },
    { id: "clients", label: "Client Reports" },
    { id: "ai", label: "AI Advisor" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060709", fontFamily: "'DM Mono', monospace", color: "#D8DAE8" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; } ::-webkit-scrollbar-thumb { background:#1A1E28; }
        .tab { cursor:pointer; transition: all 0.15s; }
        .tab:hover { color: #D0D2DA !important; }
        .tab.active { color: #63D2FF !important; border-bottom: 2px solid #63D2FF; }
        .reg-btn { cursor:pointer; transition: all 0.15s; }
        .reg-btn:hover { border-color: #63D2FF88 !important; }
        .prop-row { transition: background 0.12s; cursor:pointer; }
        .prop-row:hover { background: rgba(255,255,255,0.03) !important; }
        input:focus,textarea:focus { outline:none; }
        .ai-btn { cursor:pointer; transition: all 0.2s; }
        .ai-btn:hover:not(:disabled) { background: #63D2FF !important; color: #060709 !important; }
        .quick { cursor:pointer; transition: all 0.15s; }
        .quick:hover { border-color: #63D2FF55 !important; color: #63D2FF !important; }
        .ev-item { transition: background 0.12s; }
        .ev-item:hover { background: rgba(255,255,255,0.03) !important; }
        .client-btn { cursor:pointer; transition: all 0.2s; }
        .client-btn:hover { background: #63D2FF !important; color: #060709 !important; }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #12151C", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 99, background: "#060709" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#E8EAF0", letterSpacing: "-0.02em" }}>
            Stay<span style={{ color: "#63D2FF" }}>verra</span>
          </div>
          <span style={{ fontSize: 9, color: "#252830", letterSpacing: "0.15em", textTransform: "uppercase", borderLeft: "1px solid #12151C", paddingLeft: 14 }}>
            Owner: {OWNER.name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
              style={{ background: "none", border: "none", borderBottom: "2px solid transparent", padding: "17px 0", color: "#444", fontFamily: "'DM Mono'", fontSize: 11 }}>
              {t.label}
            </button>
          ))}
          <button onClick={onLogout} style={{ background: "none", border: "1px solid #1A1E28", borderRadius: 6, padding: "5px 12px", color: "#444", fontFamily: "'DM Mono'", fontSize: 10, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: "28px", maxWidth: 1140, margin: "0 auto" }}>

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.15em", textTransform: "uppercase" }}>Overview</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#E8EAF0", letterSpacing: "-0.02em", marginTop: 4 }}>
                Platform Dashboard
              </div>
            </div>

            {/* KPI Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { l: "Properties", v: portfolio.length, c: "#63D2FF" },
                { l: "Regions", v: Object.keys(REGIONS).length, c: "#FFD97D" },
                { l: "Events in DB", v: EVENTS_DB.length, c: "#FF9F7E" },
                { l: "Avg Occupancy", v: `${Math.round(portfolio.reduce((s, p) => s + p.occupancy, 0) / portfolio.length)}%`, c: "#7EFFA0" },
                { l: "Est. Monthly Rev.", v: `$${(portfolio.reduce((s, p) => s + p.base * (p.occupancy / 100) * 30, 0) / 1000).toFixed(1)}K`, c: "#FF6B6B" },
              ].map((k, i) => (
                <div key={i} style={{ background: "#0C0E12", border: "1px solid #12151C", borderRadius: 14, padding: "18px 16px" }}>
                  <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{k.l}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: k.c, lineHeight: 1 }}>{k.v}</div>
                </div>
              ))}
            </div>

            {/* Portfolio Table */}
            <div style={{ background: "#0C0E12", border: "1px solid #12151C", borderRadius: 16, padding: "22px", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#E8EAF0", marginBottom: 16 }}>Portfolio</div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 1fr auto", gap: 0 }}>
                {["Property", "Region", "Base", "AI Avg", "Occupancy", "Est. Rev/mo", ""].map((h, i) => (
                  <div key={i} style={{ fontSize: 9, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 12px 10px", borderBottom: "1px solid #12151C" }}>{h}</div>
                ))}
                {portfolio.map((p, i) => {
                  const aiAvg = Math.round(getDays(today, 30).reduce((s, d) => s + calcPrice(p.base, d, p.region).price, 0) / 30);
                  const rev = Math.round(aiAvg * (p.occupancy / 100) * 30);
                  const rc = REGIONS[p.region]?.color || "#63D2FF";
                  return [
                    <div key={`n${i}`} className="prop-row" style={{ padding: "14px 12px", borderBottom: "1px solid #0A0C10", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{REGIONS[p.region]?.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, color: "#D0D2DA" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{p.city}</div>
                      </div>
                    </div>,
                    <div key={`r${i}`} style={{ padding: "14px 12px", borderBottom: "1px solid #0A0C10", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: rc, background: `${rc}15`, padding: "2px 8px", borderRadius: 10 }}>{p.region}</span>
                    </div>,
                    <div key={`b${i}`} style={{ padding: "14px 12px", borderBottom: "1px solid #0A0C10", display: "flex", alignItems: "center", fontSize: 13, color: "#666" }}>${p.base}</div>,
                    <div key={`a${i}`} style={{ padding: "14px 12px", borderBottom: "1px solid #0A0C10", display: "flex", alignItems: "center", fontSize: 13, color: "#63D2FF", fontWeight: 500 }}>${aiAvg}</div>,
                    <div key={`o${i}`} style={{ padding: "14px 12px", borderBottom: "1px solid #0A0C10", display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: p.occupancy > 80 ? "#7EFFA0" : "#FFD97D" }}>{p.occupancy}%</span>
                    </div>,
                    <div key={`v${i}`} style={{ padding: "14px 12px", borderBottom: "1px solid #0A0C10", display: "flex", alignItems: "center", fontSize: 13, color: "#7EFFA0" }}>${rev.toLocaleString()}</div>,
                    <div key={`c${i}`} style={{ padding: "14px 12px", borderBottom: "1px solid #0A0C10", display: "flex", alignItems: "center" }}>
                      <button className="client-btn" onClick={() => setClientView(p)} style={{
                        background: "#07080A", border: "1px solid #1A1E28", borderRadius: 6,
                        padding: "5px 10px", color: "#555", fontFamily: "'DM Mono'", fontSize: 10,
                      }}>Client →</button>
                    </div>,
                  ];
                })}
              </div>
            </div>

            {/* Region Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {Object.entries(REGIONS).map(([name, r]) => {
                const evCount = EVENTS_DB.filter(e => e.region === name && e.date >= today).length;
                const avgBase = portfolio.filter(p => p.region === name).reduce((s, p, _, a) => s + p.base / a.length, 0) || 200;
                const samplePrices = getDays(today, 30).map(d => calcPrice(Math.round(avgBase), d, name).price);
                return (
                  <div key={name} style={{ background: "#0C0E12", border: `1px solid ${r.color}22`, borderRadius: 14, padding: "16px 14px" }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontSize: 11, color: "#D0D2DA", fontWeight: 500, marginBottom: 2 }}>{name}</div>
                    <div style={{ fontSize: 10, color: "#444", marginBottom: 10 }}>{evCount} events upcoming</div>
                    <Sparkline data={samplePrices} color={r.color} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PRICING ENGINE TAB ── */}
        {activeTab === "pricing" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#E8EAF0" }}>Pricing Engine</div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>Configure base price and preview AI-optimized rates by region</div>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {Object.entries(REGIONS).map(([name, r]) => (
                <button key={name} className="reg-btn"
                  onClick={() => setSelectedRegion(name)}
                  style={{
                    background: selectedRegion === name ? `${r.color}18` : "#0C0E12",
                    border: `1px solid ${selectedRegion === name ? r.color : "#1A1E28"}`,
                    borderRadius: 10, padding: "10px 16px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                  <span>{r.icon}</span>
                  <span style={{ fontSize: 11, color: selectedRegion === name ? r.color : "#666", fontFamily: "'DM Mono'" }}>{name}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
              <div>
                {/* Base price slider */}
                <div style={{ background: "#0C0E12", border: "1px solid #12151C", borderRadius: 16, padding: "22px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>Base Price</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: regionColor, lineHeight: 1, marginTop: 4 }}>${basePrice}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Avg</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 32, color: "#7EFFA0", lineHeight: 1, marginTop: 4 }}>${previewAvg}</div>
                    </div>
                  </div>
                  <input type="range" min={50} max={1000} value={basePrice} onChange={e => setBasePrice(+e.target.value)}
                    style={{ width: "100%", accentColor: regionColor, cursor: "pointer" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#333", marginTop: 4 }}>
                    <span>$50</span><span>$1,000</span>
                  </div>
                </div>

                {/* 30-day price preview table */}
                <div style={{ background: "#0C0E12", border: "1px solid #12151C", borderRadius: 16, padding: "20px" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#E8EAF0", marginBottom: 14 }}>30-Day Price Preview</div>
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {previewDays.map((d, i) => {
                      const { price, events, seaM, dowM, evM } = calcPrice(basePrice, d, selectedRegion);
                      const hasEv = events.length > 0;
                      const ratio = (price - Math.min(...previewPrices)) / (Math.max(...previewPrices) - Math.min(...previewPrices) + 1);
                      return (
                        <div key={d} style={{
                          display: "grid", gridTemplateColumns: "90px 1fr auto auto",
                          gap: 10, padding: "8px 0",
                          borderBottom: "1px solid #0A0C10",
                          alignItems: "center",
                        }}>
                          <span style={{ fontSize: 11, color: "#555" }}>{d}</span>
                          <div>
                            <div style={{ height: 3, background: "#0A0C10", borderRadius: 2 }}>
                              <div style={{ height: "100%", width: `${ratio * 100}%`, background: hasEv ? TYPE_COLORS[events[0].type] : regionColor, borderRadius: 2 }} />
                            </div>
                            {hasEv && <div style={{ fontSize: 9, color: TYPE_COLORS[events[0].type], marginTop: 3 }}>{events[0].icon} {events[0].name}</div>}
                          </div>
                          <span style={{ fontSize: 10, color: "#444" }}>×{evM.toFixed(1)}</span>
                          <span style={{ fontSize: 13, color: hasEv ? TYPE_COLORS[events[0].type] : regionColor, fontWeight: 500, textAlign: "right" }}>${price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar: next events */}
              <div style={{ background: "#0C0E12", border: "1px solid #12151C", borderRadius: 16, padding: "20px" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#E8EAF0", marginBottom: 14 }}>
                  {REGIONS[selectedRegion]?.icon} {selectedRegion} Events
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {nextEvents.length ? nextEvents.map((ev, i) => {
                    const p = calcPrice(basePrice, ev.date, selectedRegion).price;
                    return (
                      <div key={i} style={{
                        background: "#07080A", border: "1px solid #12151C",
                        borderLeft: `3px solid ${TYPE_COLORS[ev.type]}`,
                        borderRadius: 10, padding: "12px 14px",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#D0D2DA", marginBottom: 4 }}>{ev.icon} {ev.name}</div>
                            <div style={{ fontSize: 9, color: "#444" }}>{ev.date}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 18, color: TYPE_COLORS[ev.type], fontFamily: "'Syne', sans-serif", fontWeight: 800, lineHeight: 1 }}>${p}</div>
                            <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>×{ev.impact}</div>
                          </div>
                        </div>
                      </div>
                    );
                  }) : <div style={{ fontSize: 12, color: "#444" }}>No upcoming events</div>}
                </div>

                {/* Multiplier legend */}
                <div style={{ marginTop: 20, borderTop: "1px solid #12151C", paddingTop: 16 }}>
                  <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Price Factors</div>
                  {[
                    { l: "Seasonality", v: `×${(SEASONALITY[selectedRegion] || [])[new Date().getMonth()]?.toFixed(2) || "1.0"}` },
                    { l: "Weekend Boost", v: "×1.38" },
                    { l: "Region Factor", v: `×${REGIONS[selectedRegion]?.baseMultiplier}` },
                    { l: "Event Max", v: nextEvents.length ? `×${Math.max(...nextEvents.map(e => e.impact))}` : "×1.0" },
                  ].map((f, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "5px 0", borderBottom: "1px solid #0A0C10" }}>
                      <span style={{ color: "#555" }}>{f.l}</span>
                      <span style={{ color: regionColor }}>{f.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── EVENTS DB TAB ── */}
        {activeTab === "events" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#E8EAF0" }}>Events Database</div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>{EVENTS_DB.length} events across {Object.keys(REGIONS).length} California regions</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.keys(REGIONS).map(region => {
                const regionEvents = EVENTS_DB.filter(e => e.region === region).sort((a, b) => a.date.localeCompare(b.date));
                const rc = REGIONS[region].color;
                return (
                  <div key={region}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0 8px" }}>
                      <span style={{ fontSize: 18 }}>{REGIONS[region].icon}</span>
                      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: rc }}>{region}</span>
                      <span style={{ fontSize: 10, color: "#444" }}>{regionEvents.length} events</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginBottom: 10 }}>
                      {regionEvents.map((ev, i) => (
                        <div key={i} className="ev-item" style={{
                          background: "#0C0E12", border: "1px solid #12151C",
                          borderLeft: `3px solid ${TYPE_COLORS[ev.type]}`,
                          borderRadius: 8, padding: "10px 14px",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#D0D2DA" }}>{ev.icon} {ev.name}</div>
                            <div style={{ fontSize: 9, color: "#444", marginTop: 3 }}>{ev.date} · <span style={{ color: TYPE_COLORS[ev.type] }}>{ev.type}</span></div>
                          </div>
                          <div style={{ fontSize: 16, color: TYPE_COLORS[ev.type], fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>×{ev.impact}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CLIENT REPORTS TAB ── */}
        {activeTab === "clients" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#E8EAF0" }}>Client Reports</div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>Generate personalized pricing reports for each property owner</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {portfolio.map((p, i) => {
                const rc = REGIONS[p.region]?.color || "#63D2FF";
                const aiAvg = Math.round(getDays(today, 30).reduce((s, d) => s + calcPrice(p.base, d, p.region).price, 0) / 30);
                const upliftPct = Math.round(((aiAvg - p.base) / p.base) * 100);
                return (
                  <div key={i} style={{ background: "#0C0E12", border: `1px solid ${rc}22`, borderRadius: 16, padding: "20px" }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{REGIONS[p.region]?.icon}</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: "#E8EAF0", marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#444", marginBottom: 14 }}>{p.city}, {p.region}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>Base</div>
                        <div style={{ fontSize: 20, color: "#666", fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>${p.base}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI Avg</div>
                        <div style={{ fontSize: 20, color: rc, fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>${aiAvg}</div>
                      </div>
                    </div>
                    <div style={{ background: "#07080A", borderRadius: 8, padding: "8px 12px", marginBottom: 14, textAlign: "center" }}>
                      <span style={{ fontSize: 12, color: "#7EFFA0" }}>+{upliftPct}% revenue uplift</span>
                    </div>
                    <button className="client-btn" onClick={() => setClientView(p)} style={{
                      width: "100%", background: `${rc}18`, border: `1px solid ${rc}44`,
                      borderRadius: 8, padding: "10px", color: rc,
                      fontFamily: "'DM Mono'", fontSize: 11, cursor: "pointer",
                    }}>
                      Open Client View →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── AI ADVISOR TAB ── */}
        {activeTab === "ai" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 26, color: "#E8EAF0" }}>AI Strategy Advisor</div>
              <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>Ask anything about pricing, strategy, events, or revenue optimization</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20 }}>
              <div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {[
                    "Какой регион сейчас самый выгодный?",
                    "Стратегия на ComicCon San Diego",
                    "Coachella pricing strategy",
                    "Какие события этим летом?",
                    "Как увеличить доход на 30%?",
                    "Best region for July 4th?",
                  ].map((q, i) => (
                    <button key={i} className="quick" onClick={() => setAiQ(q)} style={{
                      background: "#0C0E12", border: "1px solid #1A1E28",
                      borderRadius: 20, padding: "6px 14px",
                      color: "#555", fontFamily: "'DM Mono'", fontSize: 10, cursor: "pointer",
                    }}>{q}</button>
                  ))}
                </div>

                {aiR && (
                  <div style={{
                    background: "#0C0E12", border: "1px solid #1A1E28",
                    borderLeft: "3px solid #63D2FF",
                    borderRadius: 12, padding: "18px 20px",
                    fontSize: 13, color: "#9A9DAA", lineHeight: 1.8,
                    marginBottom: 14, whiteSpace: "pre-wrap",
                  }}>{aiR}</div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <textarea value={aiQ} onChange={e => setAiQ(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askAI(); } }}
                    placeholder="Ask about pricing strategy, events, regions... / Спроси на русском"
                    rows={3}
                    style={{
                      flex: 1, background: "#0C0E12", border: "1px solid #1A1E28",
                      borderRadius: 10, padding: "14px 16px", color: "#D0D2DA",
                      fontFamily: "'DM Mono'", fontSize: 12, resize: "none", lineHeight: 1.6,
                    }} />
                  <button className="ai-btn" onClick={askAI} disabled={aiLoad} style={{
                    background: "#0C0E12", border: "1px solid #63D2FF44",
                    borderRadius: 10, padding: "0 20px",
                    color: aiLoad ? "#444" : "#63D2FF",
                    fontFamily: "'DM Mono'", fontSize: 13,
                    cursor: aiLoad ? "not-allowed" : "pointer", minWidth: 80,
                  }}>{aiLoad ? "···" : "Ask →"}</button>
                </div>
              </div>

              {/* Region quick stats */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 9, color: "#333", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>Region Pulse</div>
                {Object.entries(REGIONS).map(([name, r]) => {
                  const upcoming = EVENTS_DB.filter(e => e.region === name && e.date >= today).length;
                  const maxImpact = EVENTS_DB.filter(e => e.region === name && e.date >= today).reduce((m, e) => Math.max(m, e.impact), 1);
                  return (
                    <div key={name} style={{ background: "#0C0E12", border: `1px solid ${r.color}22`, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#D0D2DA" }}>{r.icon} {name}</span>
                        <span style={{ fontSize: 10, color: r.color }}>{upcoming} events</span>
                      </div>
                      <div style={{ fontSize: 10, color: "#444", marginTop: 4 }}>Peak multiplier: <span style={{ color: r.color }}>×{maxImpact}</span></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// APP ROOT — auth gate
// ════════════════════════════════════════════════════════════════
export default function Stayverra() {
  const [authed, setAuthed] = useState(false);
  return authed
    ? <OwnerDashboard onLogout={() => setAuthed(false)} />
    : <LoginScreen onLogin={() => setAuthed(true)} />;
}
