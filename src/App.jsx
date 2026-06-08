import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════
const OWNER = { login: "boris", password: "glosspoint2026", name: "Boris" };

// ═══════════════════════════════════════════════════════
// CITIES WITH COORDINATES (for proximity-based impact)
// ═══════════════════════════════════════════════════════
const OC_CITIES = {
  "Newport Beach":    { lat: 33.6189, lng: -117.9289, zone: "Coastal OC" },
  "Dana Point":       { lat: 33.4669, lng: -117.6981, zone: "South OC" },
  "Laguna Beach":     { lat: 33.5427, lng: -117.7854, zone: "Coastal OC" },
  "Huntington Beach": { lat: 33.6595, lng: -117.9988, zone: "North OC" },
  "San Clemente":     { lat: 33.4270, lng: -117.6120, zone: "South OC" },
  "Irvine":           { lat: 33.6846, lng: -117.8265, zone: "Inland OC" },
  "Anaheim":          { lat: 33.8366, lng: -117.9143, zone: "North OC" },
  "San Juan Capistrano": { lat: 33.5017, lng: -117.6623, zone: "South OC" },
};
const LA_CITIES = {
  "Santa Monica":    { lat: 34.0195, lng: -118.4912, zone: "Westside" },
  "Venice":          { lat: 33.9850, lng: -118.4695, zone: "Westside" },
  "Malibu":          { lat: 34.0259, lng: -118.7798, zone: "Coast" },
  "Marina del Rey":  { lat: 33.9802, lng: -118.4517, zone: "Westside" },
  "Hollywood":       { lat: 34.0928, lng: -118.3287, zone: "Central" },
  "Downtown LA":     { lat: 34.0522, lng: -118.2437, zone: "Central" },
  "Long Beach":      { lat: 33.7701, lng: -118.1937, zone: "South Bay" },
  "Manhattan Beach": { lat: 33.8847, lng: -118.4109, zone: "South Bay" },
  "Seal Beach":      { lat: 33.7414, lng: -118.1048, zone: "South Bay" },
};

const SD_CITIES = {
  "La Jolla":        { lat: 32.8328, lng: -117.2713, zone: "North Coastal" },
  "Coronado":        { lat: 32.6859, lng: -117.1831, zone: "Bay" },
  "Pacific Beach":   { lat: 32.7998, lng: -117.2382, zone: "Beach" },
  "Mission Bay":     { lat: 32.7765, lng: -117.2287, zone: "Beach" },
  "Del Mar":         { lat: 32.9595, lng: -117.2653, zone: "North Coastal" },
  "Downtown SD":     { lat: 32.7157, lng: -117.1611, zone: "Downtown" },
  "Chula Vista":     { lat: 32.6401, lng: -117.0842, zone: "South Bay" },
  "Encinitas":       { lat: 33.0370, lng: -117.2920, zone: "North County" },
};

const REGION_CITIES = {
  "Orange County": OC_CITIES,
  "Los Angeles":   LA_CITIES,
  "San Diego":     SD_CITIES,
};


// Distance in miles between two coords
function distMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Impact decays with distance: full impact within 9mi, fades to 20% at 37mi
function proximityFactor(distMi) {
  if (distMi <= 9)  return 1.0;
  if (distMi >= 37) return 0.2;
  return 1.0 - (0.8 * (distMi - 9) / 28);
}

// ═══════════════════════════════════════════════════════
// EVENTS DATABASE — each event has exact city location
// ═══════════════════════════════════════════════════════
const EVENTS_DB = [
  // ORANGE COUNTY — city-specific
  { id:1,  region:"Orange County", city:"Laguna Beach",    lat:33.5427, lng:-117.7854, date:"2026-06-14", name:"Pageant of the Masters",       type:"festival", impact:1.9, icon:"🎭" },
  { id:2,  region:"Orange County", city:"Newport Beach",   lat:33.6189, lng:-117.9289, date:"2026-06-20", name:"Newport Beach Jazz Festival",   type:"festival", impact:1.7, icon:"🎵" },
  { id:3,  region:"Orange County", city:"Dana Point",      lat:33.4669, lng:-117.6981, date:"2026-06-28", name:"Dana Point Ocean Festival",     type:"event",    impact:1.6, icon:"🐋" },
  { id:4,  region:"Orange County", city:"Laguna Beach",    lat:33.5427, lng:-117.7854, date:"2026-07-18", name:"Sawdust Art Festival",          type:"festival", impact:1.5, icon:"🎨" },
  { id:5,  region:"Orange County", city:"Newport Beach",   lat:33.6189, lng:-117.9289, date:"2026-08-15", name:"Newport Seafood & Wine Fest",   type:"festival", impact:1.6, icon:"🍷" },
  { id:6,  region:"Orange County", city:"Huntington Beach",lat:33.6595, lng:-117.9988, date:"2026-07-26", name:"US Open of Surfing",            type:"sport",    impact:2.1, icon:"🏄" },
  { id:7,  region:"Orange County", city:"Anaheim",         lat:33.8366, lng:-117.9143, date:"2026-09-12", name:"Disneyland Anniversary Event",  type:"event",    impact:1.4, icon:"🏰" },
  { id:8,  region:"Orange County", city:"Dana Point",      lat:33.4669, lng:-117.6981, date:"2026-10-10", name:"Tall Ships Festival",           type:"event",    impact:1.5, icon:"⛵" },
  // All-OC holidays (affect entire region, centered at OC midpoint)
  { id:9,  region:"Orange County", city:"Orange County",   lat:33.6595, lng:-117.8988, date:"2026-07-04", name:"Independence Day 🎆",           type:"holiday",  impact:2.8, icon:"🎆" },
  { id:10, region:"Orange County", city:"Orange County",   lat:33.6595, lng:-117.8988, date:"2026-07-03", name:"Pre-July 4th Rush",             type:"holiday",  impact:2.1, icon:"🎆" },
  { id:11, region:"Orange County", city:"Orange County",   lat:33.6595, lng:-117.8988, date:"2026-09-06", name:"Labor Day Weekend",             type:"holiday",  impact:2.0, icon:"🇺🇸" },
  { id:12, region:"Orange County", city:"Orange County",   lat:33.6595, lng:-117.8988, date:"2026-12-31", name:"New Year's Eve",                type:"holiday",  impact:2.9, icon:"🥂" },
  { id:13, region:"Orange County", city:"Orange County",   lat:33.6595, lng:-117.8988, date:"2026-12-25", name:"Christmas",                     type:"holiday",  impact:2.4, icon:"🎄" },
  { id:14, region:"Orange County", city:"Orange County",   lat:33.6595, lng:-117.8988, date:"2026-11-26", name:"Thanksgiving",                  type:"holiday",  impact:1.9, icon:"🦃" },
  // LOS ANGELES
  { id:15, region:"Los Angeles",   city:"Hollywood",       lat:34.0928, lng:-118.3287, date:"2026-07-10", name:"Hollywood Bowl Peak Season",    type:"event",    impact:1.7, icon:"🎶" },
  { id:16, region:"Los Angeles",   city:"Santa Monica",    lat:34.0195, lng:-118.4912, date:"2026-08-22", name:"Malibu Chili Cook-Off",         type:"event",    impact:1.4, icon:"🌶️" },
  { id:17, region:"Los Angeles",   city:"Los Angeles",     lat:34.0522, lng:-118.2437, date:"2026-10-15", name:"LA Marathon Weekend",           type:"sport",    impact:1.8, icon:"🏃" },
  { id:18, region:"Los Angeles",   city:"Los Angeles",     lat:34.0522, lng:-118.2437, date:"2026-07-04", name:"Independence Day - LA",         type:"holiday",  impact:2.6, icon:"🎆" },
  { id:19, region:"Los Angeles",   city:"Los Angeles",     lat:34.0522, lng:-118.2437, date:"2026-12-31", name:"New Year's Eve - LA",           type:"holiday",  impact:3.0, icon:"🥂" },
  { id:20, region:"Los Angeles",   city:"Los Angeles",     lat:34.0522, lng:-118.2437, date:"2026-09-20", name:"LA Fleet Week",                 type:"event",    impact:1.5, icon:"⚓" },
  // SAN DIEGO
  { id:21, region:"San Diego",     city:"San Diego",       lat:32.7157, lng:-117.1611, date:"2026-07-11", name:"ComicCon International Day 1",  type:"event",    impact:3.5, icon:"🦸" },
  { id:22, region:"San Diego",     city:"San Diego",       lat:32.7157, lng:-117.1611, date:"2026-07-12", name:"ComicCon International Day 2",  type:"event",    impact:3.4, icon:"🦸" },
  { id:23, region:"San Diego",     city:"San Diego",       lat:32.7157, lng:-117.1611, date:"2026-07-13", name:"ComicCon International Day 3",  type:"event",    impact:3.2, icon:"🦸" },
  { id:24, region:"San Diego",     city:"San Diego",       lat:32.7157, lng:-117.1611, date:"2026-07-04", name:"Big Bay Boom Fireworks",        type:"holiday",  impact:2.9, icon:"🎆" },
  { id:25, region:"San Diego",     city:"La Jolla",        lat:32.8328, lng:-117.2713, date:"2026-08-08", name:"SD Craft Beer Week",            type:"festival", impact:1.5, icon:"🍺" },
  { id:26, region:"San Diego",     city:"San Diego",       lat:32.7157, lng:-117.1611, date:"2026-09-19", name:"Fleet Week San Diego",          type:"event",    impact:1.7, icon:"⚓" },
  { id:27, region:"San Diego",     city:"San Diego",       lat:32.7157, lng:-117.1611, date:"2026-12-31", name:"New Year's Eve - SD",           type:"holiday",  impact:2.8, icon:"🥂" },
  // PALM SPRINGS
  { id:28, region:"Palm Springs",  city:"Indio",           lat:33.7206, lng:-116.2156, date:"2026-04-10", name:"Coachella Weekend 1 Day 1",     type:"festival", impact:4.2, icon:"🎪" },
  { id:29, region:"Palm Springs",  city:"Indio",           lat:33.7206, lng:-116.2156, date:"2026-04-11", name:"Coachella Weekend 1 Day 2",     type:"festival", impact:4.0, icon:"🎪" },
  { id:30, region:"Palm Springs",  city:"Indio",           lat:33.7206, lng:-116.2156, date:"2026-04-17", name:"Coachella Weekend 2 Day 1",     type:"festival", impact:3.9, icon:"🎪" },
  { id:31, region:"Palm Springs",  city:"Palm Springs",    lat:33.8303, lng:-116.5453, date:"2026-11-07", name:"Palm Springs Film Festival",    type:"event",    impact:2.0, icon:"🎬" },
  { id:32, region:"Palm Springs",  city:"Palm Springs",    lat:33.8303, lng:-116.5453, date:"2026-03-15", name:"Palm Springs Pride",            type:"event",    impact:2.3, icon:"🌈" },
  { id:33, region:"Palm Springs",  city:"Palm Springs",    lat:33.8303, lng:-116.5453, date:"2026-02-14", name:"Valentine's Day Desert",        type:"holiday",  impact:2.2, icon:"❤️" },
  // BIG BEAR
  { id:34, region:"Big Bear / Mammoth", city:"Big Bear Lake", lat:34.2439, lng:-116.9114, date:"2026-02-14", name:"Valentine's Day Snow",      type:"holiday",  impact:2.4, icon:"❤️" },
  { id:35, region:"Big Bear / Mammoth", city:"Big Bear Lake", lat:34.2439, lng:-116.9114, date:"2026-02-16", name:"Presidents Day Ski Weekend", type:"holiday",  impact:2.6, icon:"🎿" },
  { id:36, region:"Big Bear / Mammoth", city:"Big Bear Lake", lat:34.2439, lng:-116.9114, date:"2026-12-25", name:"Christmas Ski Peak",         type:"holiday",  impact:3.0, icon:"🎄" },
  { id:37, region:"Big Bear / Mammoth", city:"Mammoth Lakes", lat:37.6485, lng:-118.9721, date:"2026-03-07", name:"Spring Ski Break Peak",      type:"seasonal", impact:2.0, icon:"⛷️" },
  { id:38, region:"Big Bear / Mammoth", city:"Big Bear Lake", lat:34.2439, lng:-116.9114, date:"2026-12-31", name:"New Year's Eve Snow",        type:"holiday",  impact:3.1, icon:"🥂" },
];

const REGIONS = {
  "Orange County":      { color:"#E85D26", icon:"🏖️", baseM:1.0 },
  "Los Angeles":        { color:"#D4A017", icon:"🌆", baseM:1.05 },
  "San Diego":          { color:"#1D6FA4", icon:"⛵", baseM:0.95 },
  "Palm Springs":       { color:"#2E9E5B", icon:"🌴", baseM:0.85 },
  "Big Bear / Mammoth": { color:"#7B4FBF", icon:"⛷️", baseM:0.9 },
};

const SEASONALITY = {
  "Orange County":      [1.1,1.0,1.1,1.2,1.35,1.55,1.9,1.8,1.4,1.2,1.0,1.3],
  "Los Angeles":        [1.0,1.0,1.1,1.2,1.3,1.5,1.8,1.7,1.4,1.2,1.0,1.2],
  "San Diego":          [1.1,1.0,1.1,1.2,1.4,1.6,2.0,1.9,1.5,1.2,1.0,1.3],
  "Palm Springs":       [1.3,1.4,1.8,2.2,1.2,0.8,0.7,0.7,0.9,1.4,1.5,1.3],
  "Big Bear / Mammoth": [1.9,2.0,1.8,1.2,0.8,0.9,1.5,1.4,1.0,0.9,1.0,2.1],
};

const DOW_M = {0:1.25,1:0.82,2:0.80,3:0.83,4:0.95,5:1.38,6:1.30};

const TYPE_COLORS = {
  holiday:"#E85D26", festival:"#D4A017", event:"#1D6FA4",
  seasonal:"#2E9E5B", sport:"#7B4FBF",
};

// City-aware price calculation
function calcPrice(base, dateStr, region, cityName) {
  const d = new Date(dateStr + "T12:00:00");
  const m = d.getMonth();
  const dow = d.getDay();
  const cityCoords = (REGION_CITIES[region] || {})[cityName];

  const events = EVENTS_DB.filter(e => {
    if (e.region !== region) return false;
    if (e.date !== dateStr) return false;
    // For OC, use proximity. For other regions, simple match
    if (REGION_CITIES[region] && cityCoords && e.lat && e.lng) {
      const dist = distMiles(cityCoords.lat, cityCoords.lng, e.lat, e.lng);
      e._proximity = proximityFactor(dist);
      e._dist = Math.round(dist);
      return true;
    }
    e._proximity = 1.0;
    return true;
  });

  // Best event impact adjusted by proximity
  let evM = 1.0;
  let bestEvent = null;
  events.forEach(ev => {
    const adjustedImpact = 1 + (ev.impact - 1) * (ev._proximity || 1.0);
    if (adjustedImpact > evM) { evM = adjustedImpact; bestEvent = ev; }
  });

  const seaM = (SEASONALITY[region] || SEASONALITY["Orange County"])[m];
  const dowM = DOW_M[dow];
  const regM = REGIONS[region]?.baseM || 1.0;
  const price = Math.round(base * seaM * dowM * evM * regM);
  return { price, events, evM: parseFloat(evM.toFixed(2)), seaM, dowM, bestEvent };
}

function getDays(startStr, n) {
  return Array.from({length:n},(_,i)=>{
    const d = new Date(startStr+"T12:00:00"); d.setDate(d.getDate()+i);
    return d.toISOString().split("T")[0];
  });
}

// ═══════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════
function LoginScreen({onLogin}) {
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState("");
  function go(){
    if(u.toLowerCase()===OWNER.login&&p===OWNER.password) onLogin();
    else setErr("Access denied");
  }
  return (
    <div style={{minHeight:"100vh",background:"#F7F5F2",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input:focus{outline:none;border-color:#E85D26!important}.btn:hover{background:#E85D26!important;color:#fff!important}`}</style>
      <div style={{width:400,background:"#fff",borderRadius:24,padding:"52px 44px",boxShadow:"0 4px 40px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:700,letterSpacing:"-0.02em",marginBottom:6}}>
            Stay<span style={{color:"#E85D26"}}>verra</span>
          </div>
          <div style={{fontSize:13,color:"#999",letterSpacing:"0.06em",textTransform:"uppercase"}}>Property Intelligence Platform</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:"#333",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>Username</div>
            <input value={u} onChange={e=>setU(e.target.value)} placeholder="owner login"
              style={{width:"100%",border:"1.5px solid #E8E4DF",borderRadius:10,padding:"12px 16px",fontSize:14,color:"#111",background:"#FAFAF9"}}/>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:"#333",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>Password</div>
            <input type="password" value={p} onChange={e=>setP(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="••••••••"
              style={{width:"100%",border:"1.5px solid #E8E4DF",borderRadius:10,padding:"12px 16px",fontSize:14,color:"#111",background:"#FAFAF9"}}/>
          </div>
          {err&&<div style={{fontSize:13,color:"#E85D26",textAlign:"center"}}>{err}</div>}
          <button className="btn" onClick={go} style={{marginTop:8,background:"#111",border:"none",borderRadius:10,padding:"14px",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",transition:"all 0.2s"}}>
            Enter Platform →
          </button>
        </div>
        <div style={{marginTop:28,textAlign:"center",fontSize:12,color:"#CCC"}}>California STR Management · Private Access</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CLIENT VIEW
// ═══════════════════════════════════════════════════════
function ClientView({prop, onBack}) {
  const today = new Date().toISOString().split("T")[0];
  const days = getDays(today, 30);
  const city = prop.city || Object.keys(OC_CITIES)[0];
  const priceList = days.map(d=>({date:d,...calcPrice(prop.base,d,prop.region,city)}));
  const maxP=Math.max(...priceList.map(p=>p.price));
  const minP=Math.min(...priceList.map(p=>p.price));
  const avgP=Math.round(priceList.reduce((s,p)=>s+p.price,0)/priceList.length);
  const proj=priceList.reduce((s,p)=>s+p.price,0);
  const uplift=Math.round(((proj-prop.base*30)/(prop.base*30))*100);
  const rc=REGIONS[prop.region]?.color||"#E85D26";
  const upEvents=EVENTS_DB.filter(e=>e.region===prop.region&&e.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6);

  return (
    <div style={{minHeight:"100vh",background:"#F7F5F2",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #EEE",padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <button onClick={onBack} style={{background:"none",border:"1.5px solid #DDD",borderRadius:8,padding:"6px 14px",fontSize:13,cursor:"pointer",color:"#666"}}>← Back</button>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700}}>Stay<span style={{color:"#E85D26"}}>verra</span></div>
          <span style={{fontSize:12,color:"#999",borderLeft:"1px solid #EEE",paddingLeft:14}}>Client Report</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:rc}}/>
          <span style={{fontSize:14,fontWeight:500,color:"#333"}}>{REGIONS[prop.region]?.icon} {prop.region}</span>
        </div>
      </div>
      <div style={{maxWidth:960,margin:"0 auto",padding:"36px 32px"}}>
        <div style={{marginBottom:32}}>
          <div style={{fontSize:13,color:"#999",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>Property Report</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:"#111"}}>{prop.name}</div>
          <div style={{fontSize:15,color:"#888",marginTop:4}}>{prop.city} · {prop.region}</div>
        </div>

        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:32}}>
          {[
            {l:"AI Average Price",v:`$${avgP}`,s:`vs $${prop.base} base`,c:rc},
            {l:"Peak Price",v:`$${maxP}`,s:"highest demand night",c:"#E85D26"},
            {l:"30-Day Revenue",v:`$${proj.toLocaleString()}`,s:`+${uplift}% uplift`,c:"#2E9E5B"},
            {l:"Demand Events",v:upEvents.length,s:"upcoming triggers",c:"#D4A017"},
          ].map((k,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:16,padding:"24px 20px",border:"1px solid #EEEBE6"}}>
              <div style={{fontSize:12,color:"#999",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>{k.l}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,color:k.c,lineHeight:1}}>{k.v}</div>
              <div style={{fontSize:13,color:"#AAA",marginTop:6}}>{k.s}</div>
            </div>
          ))}
        </div>

        {/* Events */}
        <div style={{background:"#fff",borderRadius:20,padding:"28px",border:"1px solid #EEEBE6",marginBottom:24}}>
          <div style={{fontSize:12,color:"#999",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Upcoming Demand Triggers</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#111",marginBottom:20}}>Events Driving Your Prices</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            {upEvents.map((ev,i)=>{
              const cityCoords=(REGION_CITIES[prop.region]||{})[prop.city];
              const dist=cityCoords&&ev.lat?Math.round(distMiles(cityCoords.lat,cityCoords.lng,ev.lat,ev.lng)):0;
              const prox=cityCoords&&ev.lat?proximityFactor(dist):1.0;
              const adjImpact=(1+(ev.impact-1)*prox).toFixed(2);
              const priceDay=calcPrice(prop.base,ev.date,prop.region,prop.city).price;
              const daysUntil=Math.round((new Date(ev.date)-new Date(today))/86400000);
              const tc=TYPE_COLORS[ev.type]||"#999";
              return (
                <div key={i} style={{background:"#FAFAF9",borderRadius:14,padding:"16px 18px",borderLeft:`4px solid ${tc}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:600,color:"#111",marginBottom:6}}>{ev.icon} {ev.name}</div>
                      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                        <span style={{fontSize:11,fontWeight:700,color:tc,background:`${tc}15`,padding:"2px 8px",borderRadius:20,textTransform:"uppercase"}}>{ev.type}</span>
                        <span style={{fontSize:12,color:"#999"}}>{ev.date}</span>
                        {daysUntil>=0&&<span style={{fontSize:12,color:"#BBB"}}>in {daysUntil}d</span>}
                        {ev.city&&ev.city!=="Orange County"&&prop.city&&<span style={{fontSize:12,color:"#BBB"}}>· {dist}mi away</span>}
                      </div>
                      {REGION_CITIES[prop.region]&&prox<1&&(
                        <div style={{marginTop:6,fontSize:12,color:prox>0.7?"#2E9E5B":"#D4A017"}}>
                          {prox>0.7?"Strong":"Moderate"} local impact ({Math.round(prox*100)}%)
                        </div>
                      )}
                    </div>
                    <div style={{textAlign:"right",marginLeft:12}}>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:tc,lineHeight:1}}>${priceDay}</div>
                      <div style={{fontSize:12,color:"#AAA",marginTop:3}}>×{adjImpact} demand</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price table */}
        <div style={{background:"#fff",borderRadius:20,padding:"28px",border:"1px solid #EEEBE6"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#111",marginBottom:20}}>30-Day Price Schedule</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {priceList.map((p,i)=>{
              const hasEv=p.events.length>0;
              const ratio=(p.price-minP)/(maxP-minP+1);
              const bg=hasEv?`${TYPE_COLORS[p.events[0].type]}12`:`rgba(232,93,38,${0.03+ratio*0.08})`;
              const col=hasEv?TYPE_COLORS[p.events[0].type]:p.price>avgP?"#E85D26":"#888";
              return (
                <div key={i} style={{background:bg,borderRadius:10,padding:"12px 14px",border:`1px solid ${hasEv?TYPE_COLORS[p.events[0].type]+"33":"#EEEBE6"}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:12,color:"#999"}}>{p.date}</div>
                      {hasEv&&<div style={{fontSize:11,color:TYPE_COLORS[p.events[0].type],marginTop:2}}>{p.events[0].icon} {p.events[0].name.slice(0,22)}</div>}
                    </div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:col}}>${p.price}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════
function Dashboard({onLogout}) {
  const today=new Date().toISOString().split("T")[0];
  const [tab,setTab]=useState("dashboard");
  const [region,setRegion]=useState("Orange County");
  const [city,setCity]=useState("Newport Beach");
  const [base,setBase]=useState(280);
  const [clientView,setClientView]=useState(null);
  const [aiQ,setAiQ]=useState(""); const [aiR,setAiR]=useState(""); const [aiLoad,setAiLoad]=useState(false);

  const portfolio=[
    {id:1,name:"Ocean View Villa",   region:"Orange County",city:"Dana Point",      base:280,occupancy:87},
    {id:2,name:"Newport Harbor Suite",region:"Orange County",city:"Newport Beach",   base:250,occupancy:79},
    {id:3,name:"Sunset Loft",        region:"Los Angeles",  city:"Santa Monica",    base:220,occupancy:74},
    {id:4,name:"La Jolla Cove House",region:"San Diego",    city:"La Jolla",        base:310,occupancy:82},
    {id:5,name:"Desert Oasis",       region:"Palm Springs", city:"Palm Springs",    base:195,occupancy:68},
    {id:6,name:"Mountain Cabin",     region:"Big Bear / Mammoth",city:"Big Bear Lake",base:175,occupancy:71},
  ];

  const regionCities=Object.keys(REGION_CITIES[region]||{});
  const days30=getDays(today,30);
  const prices30=days30.map(d=>calcPrice(base,d,region,city).price);
  const avg30=Math.round(prices30.reduce((s,v)=>s+v,0)/prices30.length);
  const proj30=prices30.reduce((s,v)=>s+v,0);
  const nextEvents=EVENTS_DB.filter(e=>e.region===region&&e.date>=today).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,6);
  const rc=REGIONS[region]?.color||"#E85D26";

  async function askAI(){
    if(!aiQ.trim())return; setAiLoad(true); setAiR("");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:`You are Stayverra AI — California STR pricing platform. You use city-level event proximity to calculate accurate demand. Platform owned by Boris. Be concise, specific and data-driven.`,messages:[{role:"user",content:aiQ}]})});
      const data=await res.json(); setAiR(data.content?.[0]?.text||"Error");
    }catch{setAiR("Connection error.");}
    setAiLoad(false); setAiQ("");
  }

  if(clientView) return <ClientView prop={clientView} onBack={()=>setClientView(null)}/>;

  const TABS=["dashboard","pricing","events","clients","ai"];

  return (
    <div style={{minHeight:"100vh",background:"#F7F5F2",fontFamily:"'DM Sans',system-ui,sans-serif",color:"#111"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#DDD;border-radius:2px}
        .tab{cursor:pointer;transition:all 0.15s;border-bottom:2px solid transparent;padding:18px 0;font-size:13px;font-weight:500;color:#999;background:none;border-top:none;border-left:none;border-right:none}
        .tab:hover{color:#333}
        .tab.on{color:#E85D26;border-bottom:2px solid #E85D26}
        .card{background:#fff;border-radius:20px;border:1px solid #EEEBE6;padding:24px}
        .reg-btn{cursor:pointer;transition:all 0.15s;border-radius:12px;padding:10px 16px;border:1.5px solid #E8E4DF;background:#fff;display:flex;align-items:center;gap:8px;font-family:inherit}
        .reg-btn:hover{border-color:#E85D26}
        .reg-btn.sel{border-color:#E85D26;background:#FFF5F0}
        .city-btn{cursor:pointer;transition:all 0.12s;border-radius:8px;padding:6px 12px;border:1.5px solid #E8E4DF;background:#fff;font-size:12px;font-family:inherit;font-weight:500}
        .city-btn:hover{border-color:#E85D26}
        .city-btn.sel{border-color:#E85D26;background:#FFF5F0;color:#E85D26}
        .prop-row{cursor:pointer;transition:background 0.1s}
        .prop-row:hover{background:#FAFAF9}
        .ai-btn{cursor:pointer;transition:all 0.2s}
        .ai-btn:hover:not(:disabled){background:#E85D26!important;color:#fff!important}
        .quick{cursor:pointer;transition:all 0.12s;border:1.5px solid #E8E4DF;border-radius:20px;padding:6px 14px;background:#fff;font-size:12px;font-family:inherit}
        .quick:hover{border-color:#E85D26;color:#E85D26}
        .client-btn{cursor:pointer;transition:all 0.15s}
        .client-btn:hover{background:#E85D26!important;color:#fff!important;border-color:#E85D26!important}
        textarea:focus,input:focus{outline:none}
      `}</style>

      {/* HEADER */}
      <div style={{background:"#fff",borderBottom:"1px solid #EEEBE6",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60,position:"sticky",top:0,zIndex:99}}>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700}}>Stay<span style={{color:"#E85D26"}}>verra</span></div>
          <span style={{fontSize:11,color:"#CCC",borderLeft:"1px solid #EEE",paddingLeft:16,letterSpacing:"0.1em",textTransform:"uppercase"}}>Owner · {OWNER.name}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          {TABS.map(t=>(
            <button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}
              style={{marginRight:16,textTransform:"capitalize"}}>{t}</button>
          ))}
          <button onClick={onLogout} style={{background:"none",border:"1.5px solid #E8E4DF",borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer",color:"#999",fontFamily:"inherit",marginLeft:8}}>Logout</button>
        </div>
      </div>

      <div style={{maxWidth:1160,margin:"0 auto",padding:"32px"}}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard"&&(
          <div>
            <div style={{marginBottom:28}}>
              <div style={{fontSize:12,color:"#AAA",textTransform:"uppercase",letterSpacing:"0.1em"}}>Overview</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,marginTop:4}}>Platform Dashboard</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:28}}>
              {[
                {l:"Properties",v:portfolio.length,c:"#E85D26"},
                {l:"Regions",v:5,c:"#D4A017"},
                {l:"Events in DB",v:EVENTS_DB.length,c:"#1D6FA4"},
                {l:"Avg Occupancy",v:`${Math.round(portfolio.reduce((s,p)=>s+p.occupancy,0)/portfolio.length)}%`,c:"#2E9E5B"},
                {l:"Est. Monthly Rev",v:`$${(portfolio.reduce((s,p)=>s+calcPrice(p.base,today,p.region,p.city).price*(p.occupancy/100)*30,0)/1000).toFixed(1)}K`,c:"#7B4FBF"},
              ].map((k,i)=>(
                <div key={i} className="card">
                  <div style={{fontSize:12,color:"#AAA",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{k.l}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:k.c}}>{k.v}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,marginBottom:20}}>Portfolio</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{borderBottom:"2px solid #F0EDE8"}}>
                    {["Property","City","Region","Base","AI Avg","Occupancy","Revenue/mo",""].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"0 12px 12px",fontSize:11,color:"#AAA",textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((p,i)=>{
                    const aiAvg=Math.round(days30.reduce((s,d)=>s+calcPrice(p.base,d,p.region,p.city).price,0)/30);
                    const rev=Math.round(aiAvg*(p.occupancy/100)*30);
                    const prc=REGIONS[p.region]?.color||"#E85D26";
                    return (
                      <tr key={i} className="prop-row" style={{borderBottom:"1px solid #F7F5F2"}}>
                        <td style={{padding:"14px 12px"}}>
                          <div style={{fontWeight:600,fontSize:14,color:"#111"}}>{REGIONS[p.region]?.icon} {p.name}</div>
                        </td>
                        <td style={{padding:"14px 12px",fontSize:13,color:"#666"}}>{p.city}</td>
                        <td style={{padding:"14px 12px"}}>
                          <span style={{fontSize:12,fontWeight:600,color:prc,background:`${prc}12`,padding:"3px 10px",borderRadius:20}}>{p.region}</span>
                        </td>
                        <td style={{padding:"14px 12px",fontSize:14,color:"#888"}}>${p.base}</td>
                        <td style={{padding:"14px 12px",fontSize:14,fontWeight:600,color:"#E85D26"}}>${aiAvg}</td>
                        <td style={{padding:"14px 12px"}}>
                          <span style={{fontSize:13,fontWeight:600,color:p.occupancy>80?"#2E9E5B":"#D4A017"}}>{p.occupancy}%</span>
                        </td>
                        <td style={{padding:"14px 12px",fontSize:14,fontWeight:600,color:"#2E9E5B"}}>${rev.toLocaleString()}</td>
                        <td style={{padding:"14px 12px"}}>
                          <button className="client-btn" onClick={()=>setClientView(p)}
                            style={{background:"#fff",border:"1.5px solid #E8E4DF",borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:600,color:"#666",fontFamily:"inherit",cursor:"pointer"}}>
                            Client View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PRICING ENGINE ── */}
        {tab==="pricing"&&(
          <div>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700}}>Pricing Engine</div>
              <div style={{fontSize:14,color:"#AAA",marginTop:4}}>City-level pricing with proximity-based event impact</div>
            </div>

            {/* Region selector */}
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              {Object.entries(REGIONS).map(([name,r])=>(
                <button key={name} className={`reg-btn ${region===name?"sel":""}`}
                  onClick={()=>{setRegion(name);if(name==="Orange County")setCity("Newport Beach");}}>
                  <span style={{fontSize:18}}>{r.icon}</span>
                  <span style={{fontSize:13,fontWeight:500,color:region===name?r.color:"#555"}}>{name}</span>
                </button>
              ))}
            </div>

            {/* OC City selector */}
            {REGION_CITIES[region]&&(
              <div style={{marginBottom:20}}>
                <div style={{fontSize:12,color:"#AAA",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Select City — pricing impact varies by distance to events (miles)</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {regionCities.map(c=>(
                    <button key={c} className={`city-btn ${city===c?"sel":""}`} onClick={()=>setCity(c)}>
                      {c} <span style={{color:"#BBB",fontSize:10}}>({(REGION_CITIES[region]||{})[c]?.zone})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:20}}>
              <div>
                {/* Base price */}
                <div className="card" style={{marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16}}>
                    <div>
                      <div style={{fontSize:12,color:"#AAA",textTransform:"uppercase",letterSpacing:"0.08em"}}>Base Price / Night</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:700,color:rc,lineHeight:1,marginTop:4}}>${base}</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:12,color:"#AAA",textTransform:"uppercase",letterSpacing:"0.08em"}}>AI Average</div>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:700,color:"#2E9E5B",lineHeight:1,marginTop:4}}>${avg30}</div>
                    </div>
                  </div>
                  <input type="range" min={50} max={1000} value={base} onChange={e=>setBase(+e.target.value)}
                    style={{width:"100%",accentColor:rc,cursor:"pointer",height:4}}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#CCC",marginTop:6}}>
                    <span>$50</span><span>$1,000</span>
                  </div>
                  <div style={{marginTop:16,padding:"12px 16px",background:"#F7F5F2",borderRadius:10,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:13,color:"#666"}}>30-day projected revenue</span>
                    <span style={{fontSize:14,fontWeight:700,color:"#2E9E5B"}}>${proj30.toLocaleString()}</span>
                  </div>
                </div>

                {/* Price table */}
                <div className="card">
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,marginBottom:16}}>
                    30-Day Prices — {REGION_CITIES[region]?city:region}
                  </div>
                  <div style={{maxHeight:360,overflowY:"auto"}}>
                    {days30.map((d,i)=>{
                      const {price,events,evM}=calcPrice(base,d,region,city);
                      const hasEv=events.length>0;
                      const ratio=(price-Math.min(...prices30))/(Math.max(...prices30)-Math.min(...prices30)+1);
                      const tc=hasEv?TYPE_COLORS[events[0].type]:"#E85D26";
                      return (
                        <div key={d} style={{display:"grid",gridTemplateColumns:"100px 1fr 60px 70px",gap:10,padding:"10px 0",borderBottom:"1px solid #F7F5F2",alignItems:"center"}}>
                          <span style={{fontSize:12,color:"#AAA"}}>{d.slice(5)}</span>
                          <div>
                            <div style={{height:4,background:"#F0EDE8",borderRadius:2}}>
                              <div style={{height:"100%",width:`${ratio*100}%`,background:hasEv?tc:rc,borderRadius:2,transition:"width 0.3s"}}/>
                            </div>
                            {hasEv&&<div style={{fontSize:11,color:tc,marginTop:3}}>{events[0].icon} {events[0].name.slice(0,28)}</div>}
                          </div>
                          <span style={{fontSize:11,color:"#CCC",textAlign:"center"}}>×{evM}</span>
                          <span style={{fontSize:15,fontWeight:700,color:hasEv?tc:price>avg30?"#E85D26":"#333",textAlign:"right"}}>${price}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Events sidebar */}
              <div className="card">
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,marginBottom:4}}>
                  {REGION_CITIES[region]?`Events near ${city}`:REGIONS[region]?.icon+" "+region}
                </div>
                {REGION_CITIES[region]&&<div style={{fontSize:12,color:"#AAA",marginBottom:16}}>Impact adjusted by distance from {city} (in miles)</div>}
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {nextEvents.map((ev,i)=>{
                    const cityC=(REGION_CITIES[region]||{})[city];
                    const dist=cityC&&ev.lat?Math.round(distMiles(cityC.lat,cityC.lng,ev.lat,ev.lng)):0;
                    const prox=cityC&&ev.lat?proximityFactor(dist):1.0;
                    const adjImp=(1+(ev.impact-1)*prox).toFixed(1);
                    const priceDay=calcPrice(base,ev.date,region,city).price;
                    const tc=TYPE_COLORS[ev.type];
                    return (
                      <div key={i} style={{background:"#FAFAF9",borderRadius:12,padding:"14px",borderLeft:`3px solid ${tc}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:600,color:"#111",marginBottom:4}}>{ev.icon} {ev.name}</div>
                            <div style={{fontSize:11,color:"#AAA"}}>{ev.date} · {ev.city}</div>
                            {REGION_CITIES[region]&&dist>0&&(
                              <div style={{fontSize:11,marginTop:4,color:prox>0.7?"#2E9E5B":"#D4A017"}}>
                                {dist}mi away · {Math.round(prox*100)}% impact
                              </div>
                            )}
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:tc}}>${priceDay}</div>
                            <div style={{fontSize:11,color:"#AAA"}}>×{adjImp}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── EVENTS DB ── */}
        {tab==="events"&&(
          <div>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700}}>Events Database</div>
              <div style={{fontSize:14,color:"#AAA",marginTop:4}}>{EVENTS_DB.length} events · city-level precision · proximity-based impact</div>
            </div>
            {Object.keys(REGIONS).map(reg=>{
              const evs=EVENTS_DB.filter(e=>e.region===reg).sort((a,b)=>a.date.localeCompare(b.date));
              const rcc=REGIONS[reg].color;
              return (
                <div key={reg} style={{marginBottom:24}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                    <span style={{fontSize:22}}>{REGIONS[reg].icon}</span>
                    <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:rcc}}>{reg}</span>
                    <span style={{fontSize:12,color:"#AAA"}}>{evs.length} events</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {evs.map((ev,i)=>{
                      const tc=TYPE_COLORS[ev.type];
                      return (
                        <div key={i} style={{background:"#fff",borderRadius:12,padding:"14px 16px",border:"1px solid #EEEBE6",borderLeft:`3px solid ${tc}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div>
                            <div style={{fontSize:13,fontWeight:600,color:"#111"}}>{ev.icon} {ev.name}</div>
                            <div style={{fontSize:11,color:"#AAA",marginTop:3}}>{ev.date} · <span style={{color:tc}}>{ev.city}</span></div>
                          </div>
                          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:tc}}>×{ev.impact}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── CLIENTS ── */}
        {tab==="clients"&&(
          <div>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700}}>Client Reports</div>
              <div style={{fontSize:14,color:"#AAA",marginTop:4}}>Personalized pricing reports for each property owner</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {portfolio.map((p,i)=>{
                const aiAvg=Math.round(days30.reduce((s,d)=>s+calcPrice(p.base,d,p.region,p.city).price,0)/30);
                const uplift=Math.round(((aiAvg-p.base)/p.base)*100);
                const prc=REGIONS[p.region]?.color||"#E85D26";
                return (
                  <div key={i} style={{background:"#fff",borderRadius:20,padding:"24px",border:"1px solid #EEEBE6"}}>
                    <div style={{fontSize:26,marginBottom:10}}>{REGIONS[p.region]?.icon}</div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#111",marginBottom:2}}>{p.name}</div>
                    <div style={{fontSize:13,color:"#AAA",marginBottom:16}}>{p.city} · {p.region}</div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                      <div><div style={{fontSize:11,color:"#AAA",textTransform:"uppercase"}}>Base</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:"#CCC"}}>${p.base}</div></div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:11,color:"#AAA",textTransform:"uppercase"}}>AI Avg</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:prc}}>${aiAvg}</div></div>
                    </div>
                    <div style={{background:"#F7F5F2",borderRadius:10,padding:"8px 12px",textAlign:"center",marginBottom:16}}>
                      <span style={{fontSize:13,fontWeight:600,color:"#2E9E5B"}}>+{uplift}% revenue uplift</span>
                    </div>
                    <button className="client-btn" onClick={()=>setClientView(p)}
                      style={{width:"100%",background:`${prc}12`,border:`1.5px solid ${prc}33`,borderRadius:10,padding:"12px",color:prc,fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:"pointer"}}>
                      Open Client View →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── AI ADVISOR ── */}
        {tab==="ai"&&(
          <div>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700}}>AI Strategy Advisor</div>
              <div style={{fontSize:14,color:"#AAA",marginTop:4}}>Ask anything about pricing, events, or revenue optimization</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:20}}>
              <div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
                  {["Which region has highest demand?","Strategy for ComicCon weekend","Best pricing for 4th of July?","How to increase revenue 30%?"].map((q,i)=>(
                    <button key={i} className="quick" onClick={()=>setAiQ(q)} style={{color:"#666",fontFamily:"inherit"}}>{q}</button>
                  ))}
                </div>
                {aiR&&(
                  <div style={{background:"#fff",border:"1px solid #EEEBE6",borderLeft:"4px solid #E85D26",borderRadius:14,padding:"20px 24px",fontSize:14,color:"#444",lineHeight:1.8,marginBottom:16,whiteSpace:"pre-wrap"}}>{aiR}</div>
                )}
                <div style={{display:"flex",gap:10}}>
                  <textarea value={aiQ} onChange={e=>setAiQ(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();askAI();}}}
                    placeholder="Ask about pricing strategy, events, cities, revenue optimization..." rows={3}
                    style={{flex:1,background:"#fff",border:"1.5px solid #E8E4DF",borderRadius:12,padding:"14px 16px",color:"#111",fontFamily:"inherit",fontSize:13,resize:"none",lineHeight:1.6}}/>
                  <button className="ai-btn" onClick={askAI} disabled={aiLoad}
                    style={{background:"#111",border:"none",borderRadius:12,padding:"0 24px",color:"#fff",fontFamily:"inherit",fontSize:13,fontWeight:600,cursor:aiLoad?"not-allowed":"pointer",minWidth:90,opacity:aiLoad?0.5:1}}>
                    {aiLoad?"···":"Ask →"}
                  </button>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                <div style={{fontSize:11,color:"#AAA",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>Region Pulse</div>
                {Object.entries(REGIONS).map(([name,r])=>{
                  const upcoming=EVENTS_DB.filter(e=>e.region===name&&e.date>=today).length;
                  const maxImp=EVENTS_DB.filter(e=>e.region===name&&e.date>=today).reduce((m,e)=>Math.max(m,e.impact),1);
                  return (
                    <div key={name} style={{background:"#fff",borderRadius:12,padding:"14px 16px",border:"1px solid #EEEBE6"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:13,fontWeight:500}}>{r.icon} {name}</span>
                        <span style={{fontSize:12,color:r.color,fontWeight:600}}>{upcoming} events</span>
                      </div>
                      <div style={{fontSize:12,color:"#AAA",marginTop:4}}>Peak: <span style={{color:r.color,fontWeight:600}}>×{maxImp}</span></div>
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

export default function Stayverra() {
  const [auth,setAuth]=useState(false);
  return auth ? <Dashboard onLogout={()=>setAuth(false)}/> : <LoginScreen onLogin={()=>setAuth(true)}/>;
}
