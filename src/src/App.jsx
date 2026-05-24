import { useState, useEffect, createContext, useContext } from "react";

const SUPABASE_URL = "https://bfbrleoqsdnqtbutlcha.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmYnJsZW9xc2RucXRidXRsY2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzM1NDksImV4cCI6MjA5NTAwOTU0OX0.MKqr1cNZRKB4ANNJbT2QML_Xb2xpK8wmi_5xRYuxE3o";

const hashPassword = (p) => btoa(p);

// Inline SVG placeholders — work in sandbox without any network requests
const svgImg = (bg, fg, icon, label) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'><rect width='800' height='400' fill='${bg}'/><text x='400' y='190' text-anchor='middle' font-size='72' fill='${fg}'>${icon}</text><text x='400' y='260' text-anchor='middle' font-size='28' fill='${fg}' font-family='Georgia,serif'>${label}</text></svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
};

const IMG = {
  news1:    svgImg("#e8f5ee","#1a6b4a","📰","Program de Suport 2025"),
  news2:    svgImg("#e8f0ff","#3a3a8c","🏥","Conferință Națională"),
  event1:   svgImg("#fff3cd","#856404","🎙","Conferința ABHR 2025"),
  speakers: svgImg("#fdf0ee","#c0392b","👥","Vorbitori Invitați"),
  research: svgImg("#e8f5ee","#1a6b4a","🔬","Cercetare Medicală"),
  education:svgImg("#e8f0ff","#3a3a8c","📚","Ghid pentru Pacienți"),
  cert:     svgImg("#fffbe6","#856404","🏅","Certificat de Participare"),
  album1:   svgImg("#f5f5f5","#444","📷","Conferința 2025"),
  photo1:   svgImg("#e8f5ee","#1a6b4a","📸","Deschiderea conferinței"),
  photo2:   svgImg("#fdf0ee","#c0392b","📸","Sesiune medicală"),
};

const DEMO_NEWS = [
  { id:"n1", title_ro:"ABHR lansează programul de suport 2025", title_en:"ABHR launches 2025 support program", body_ro:"Suntem încântați să anunțăm lansarea noului nostru program de suport pentru pacienți și familiile acestora în anul 2025. Programul include sesiuni de consiliere, grupuri de suport și resurse educaționale.", body_en:"We are excited to announce the launch of our new support program for patients and their families in 2025. The program includes counseling sessions, support groups and educational resources.", image_url:IMG.news1, date:"2025-01-15", created_at:"2025-01-15" },
  { id:"n2", title_ro:"Conferință națională privind bolile hepatice rare", title_en:"National conference on rare liver diseases", body_ro:"ABHR organizează prima conferință națională dedicată bolilor hepatice rare, cu participarea specialiștilor de top din Republica Moldova. Evenimentul va reuni medici, pacienți și cercetători.", body_en:"ABHR is organizing the first national conference dedicated to rare liver diseases, with top specialists from Moldova. The event will bring together doctors, patients and researchers.", image_url:IMG.news2, date:"2025-02-10", created_at:"2025-02-10" },
];

const DEMO_EVENTS = [
  { id:"e1", title_ro:"Conferința Anuală ABHR 2025", title_en:"ABHR Annual Conference 2025", date:"2025-05-20", location_ro:"Chișinău, Hotel Național, Sala Mare", location_en:"Chisinau, Hotel National, Main Hall", desc_ro:"Conferința anuală a membrilor ABHR pentru a discuta progresele și planurile viitoare în domeniul bolilor hepatice rare.", desc_en:"Annual ABHR conference to discuss progress and future plans in rare liver diseases.", status:"ongoing", agenda_url:"", speakers_image_url:IMG.speakers, album_id:"a1", created_at:"2025-01-01" },
  { id:"e2", title_ro:"Webinar: Noutăți în tratamentul hepatic", title_en:"Webinar: Latest in liver treatment", date:"2025-07-20", location_ro:"Online (Zoom)", location_en:"Online (Zoom)", desc_ro:"Webinar cu experți în boli hepatice rare despre cele mai recente tratamente disponibile.", desc_en:"Webinar with rare liver disease experts on the latest available treatments.", status:"upcoming", agenda_url:"", speakers_image_url:"", album_id:"", created_at:"2025-01-02" },
  { id:"e3", title_ro:"Întâlnire Membri 2024", title_en:"Members Meeting 2024", date:"2024-11-10", location_ro:"Chișinău, Centrul de Conferințe", location_en:"Chisinau, Conference Center", desc_ro:"Întâlnirea anuală din 2024 a membrilor ABHR.", desc_en:"2024 annual meeting of ABHR members.", status:"past", agenda_url:"", speakers_image_url:"", album_id:"", created_at:"2024-01-01" },
];

const DEMO_ALBUMS = [
  { id:"a1", name_ro:"Conferința 2025", name_en:"2025 Conference", cover_url:IMG.album1, created_at:"", photos:[
    { id:"p1", album_id:"a1", url:IMG.photo1, caption_ro:"Deschiderea conferinței", caption_en:"Conference opening" },
    { id:"p2", album_id:"a1", url:IMG.photo2, caption_ro:"Sesiune medicală", caption_en:"Medical session" },
  ]},
];

const DEMO_MEMBERS = [
  { id:"m1", card_number:"ABHR-001", name:"Maria Ionescu", email:"maria@example.com", join_date:"2022-03-15", password_hash:btoa("demo123") },
  { id:"m2", card_number:"ABHR-002", name:"Ion Popescu", email:"ion@example.com", join_date:"2021-07-20", password_hash:btoa("demo456") },
];

const DEMO_RESEARCH = [
  { id:"r1", title_ro:"Hepatita autoimună — ce trebuie să știți", title_en:"Autoimmune hepatitis — what you need to know", body_ro:"Hepatita autoimună este o boală cronică în care sistemul imunitar atacă celulele hepatice. Articolul prezintă simptomele, diagnosticul și opțiunile de tratament disponibile în Republica Moldova.", body_en:"Autoimmune hepatitis is a chronic disease in which the immune system attacks liver cells. This article presents symptoms, diagnosis and treatment options available in Moldova.", image_url:IMG.research, date:"2025-01-10", created_at:"2025-01-10" },
];

const DEMO_EDUCATION = [
  { id:"ed1", title_ro:"Ghid pentru pacienți: Trăind cu o boală hepatică rară", title_en:"Patient guide: Living with a rare liver disease", body_ro:"Acest ghid oferă informații practice pentru pacienții diagnosticați cu boli hepatice rare, inclusiv sfaturi privind alimentația, stilul de viață și gestionarea medicației.", body_en:"This guide provides practical information for patients diagnosed with rare liver diseases, including advice on diet, lifestyle and medication management.", image_url:IMG.education, date:"2025-02-01", created_at:"2025-02-01" },
];

const DEMO_CERTIFICATES = [
  { id:"c1", member_id:"m1", event_id:"e3", image_url:IMG.cert, created_at:"2024-11-15" },
];

const DEMO_DATA = { news: DEMO_NEWS, events: DEMO_EVENTS, albums: DEMO_ALBUMS, members: DEMO_MEMBERS, research: DEMO_RESEARCH, education: DEMO_EDUCATION, certificates: DEMO_CERTIFICATES, photos: DEMO_ALBUMS.flatMap(a => a.photos) };

const db = {
  async get(table, extra="") {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc${extra}`, { headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` }, signal:AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error();
      return res.json();
    } catch { return DEMO_DATA[table] || []; }
  },
  async insert(table, data) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method:"POST", headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json", Prefer:"return=representation" }, body:JSON.stringify(data) });
      return res.json();
    } catch { return [{ ...data, id: Date.now().toString(), created_at: new Date().toISOString() }]; }
  },
  async update(table, id, data) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method:"PATCH", headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}`, "Content-Type":"application/json", Prefer:"return=representation" }, body:JSON.stringify(data) });
      return res.json();
    } catch { return [data]; }
  },
  async delete(table, id) {
    try { await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method:"DELETE", headers:{ apikey:SUPABASE_KEY, Authorization:`Bearer ${SUPABASE_KEY}` } }); } catch {}
  }
};

const GREEN="#1a6b4a", GREEN_DARK="#144f37", GREEN_LIGHT="#e8f5ee", RED="#c0392b", RED_LIGHT="#fdf0ee";
const LangContext = createContext();
const useLang = () => useContext(LangContext);
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);
const ADMIN_CARD="ADMIN-000", ADMIN_PASS="admin123";

const STATUS_COLORS = { ongoing:{ bg:"#fff3cd", color:"#856404", border:"#ffc107" }, upcoming:{ bg:GREEN_LIGHT, color:GREEN_DARK, border:GREEN }, past:{ bg:"#f0f0f0", color:"#666", border:"#ccc" } };
const STATUS_LABELS = { ro:{ ongoing:"În desfășurare", upcoming:"Urmează", past:"Trecut" }, en:{ ongoing:"Ongoing", upcoming:"Upcoming", past:"Past" } };

const T = {
  ro:{
    orgName:"Alianța pentru Boli Hepatice Rare",
    nav:{ home:"Acasă", mission:"Misiunea Noastră", news:"Știri", events:"Evenimente", gallery:"Galerie", research:"Cercetare", education:"Educație", profile:"Profilul Meu", login:"Autentificare", logout:"Deconectare", admin:"Admin" },
    home:{ hero:"Împreună pentru sănătate hepatică", sub:"Alianța pentru Boli Hepatice Rare susține pacienții și familiile afectate de boli hepatice rare din Republica Moldova.", cta:"Află mai multe", recentNews:"Știri Recente", upcomingEvents:"Evenimente" },
    mission:{ title:"Misiunea Noastră", body:"ABHR este o organizație dedicată sprijinirii pacienților cu boli hepatice rare și familiilor acestora. Ne angajăm să oferim informații, resurse și suport comunității noastre, promovând conștientizarea și cercetarea în domeniul bolilor hepatice rare din Republica Moldova.", values:["Suport","Educație","Cercetare","Comunitate"], valuesDesc:["Oferim sprijin emoțional și practic pacienților și familiilor lor.","Promovăm educația și informarea despre bolile hepatice rare.","Susținem cercetarea medicală în domeniul bolilor hepatice rare.","Construim o comunitate solidară pentru toți cei afectați."] },
    news:{ title:"Știri", noNews:"Nu există știri disponibile momentan.", readMore:"Citește mai mult" },
    events:{ title:"Evenimente", noEvents:"Nu există evenimente.", backToEvents:"← Înapoi la evenimente", agenda:"Agendă (PDF)", speakers:"Vorbitori", location:"Locație", linkedGallery:"Galerie Foto", viewGallery:"Vezi galeria", details:"Detalii eveniment" },
    gallery:{ title:"Galerie", noPhotos:"Nu există fotografii.", back:"← Înapoi la albume" },
    research:{ title:"Cercetare", noPosts:"Nu există articole de cercetare." },
    education:{ title:"Educație", noPosts:"Nu există materiale educaționale." },
    profile:{ title:"Profilul Meu", name:"Nume", memberId:"Număr Membru", joinDate:"Data Înscrierii", email:"Email", certificates:"Certificate de Participare", noCerts:"Nu există certificate disponibile.", downloadPdf:"Descarcă PDF", viewCert:"Certificat" },
    login:{ title:"Autentificare Membri", cardLabel:"Număr Card Membru", passLabel:"Parolă", btn:"Autentificare", error:"Date incorecte.", forgot:"Ați uitat parola? Contactați administratorul." },
    admin:{ title:"Panou Administrare", tabs:{ members:"Membri", news:"Știri", events:"Evenimente", gallery:"Galerie", research:"Cercetare", education:"Educație", certificates:"Certificate" }, addMember:"Adaugă Membru", addNews:"Adaugă Știre", addEvent:"Adaugă Eveniment", addAlbum:"Adaugă Album", addPost:"Adaugă Articol", save:"Salvează", cancel:"Anulează", delete:"Șterge", edit:"Editează", managePhotos:"Fotografii", manageCerts:"Certificate", addCert:"Adaugă Certificat",
      fields:{ name:"Nume", card_number:"Număr Card", email:"Email", join_date:"Data Înscrierii", password:"Parolă", title_ro:"Titlu (RO)", title_en:"Titlu (EN)", body_ro:"Conținut (RO)", body_en:"Conținut (EN)", image_url:"URL Imagine", date:"Data", location_ro:"Locație (RO)", location_en:"Locație (EN)", desc_ro:"Descriere (RO)", desc_en:"Descriere (EN)", status:"Status", agenda_url:"URL Agendă PDF", speakers_image_url:"URL Imagine Vorbitori", album_id:"ID Album Galerie", albumNameRo:"Nume Album (RO)", albumNameEn:"Nume Album (EN)", coverUrl:"URL Copertă", photoUrl:"URL Fotografie", captionRo:"Legendă (RO)", captionEn:"Legendă (EN)", member_id:"ID Membru", event_id:"ID Eveniment", cert_image_url:"URL Imagine Certificat" }
    },
    footer:"© 2025 Alianța pentru Boli Hepatice Rare. Toate drepturile rezervate.",
    loading:"Se încarcă...", readMore:"Citește mai mult", backToNews:"← Înapoi la știri", backToList:"← Înapoi",
  },
  en:{
    orgName:"Alliance for Rare Hepatic Diseases",
    nav:{ home:"Home", mission:"Our Mission", news:"News", events:"Events", gallery:"Gallery", research:"Research", education:"Education", profile:"My Profile", login:"Login", logout:"Logout", admin:"Admin" },
    home:{ hero:"Together for Hepatic Health", sub:"The Alliance for Rare Hepatic Diseases supports patients and families affected by rare liver diseases in the Republic of Moldova.", cta:"Learn More", recentNews:"Recent News", upcomingEvents:"Events" },
    mission:{ title:"Our Mission", body:"ABHR is an organization dedicated to supporting patients with rare liver diseases and their families. We are committed to providing information, resources and support to our community, promoting awareness and research in the field of rare liver diseases in the Republic of Moldova.", values:["Support","Education","Research","Community"], valuesDesc:["We provide emotional and practical support to patients and their families.","We promote education and awareness about rare liver diseases.","We support medical research in the field of rare liver diseases.","We build a supportive community for all those affected."] },
    news:{ title:"News", noNews:"No news available.", readMore:"Read more" },
    events:{ title:"Events", noEvents:"No events available.", backToEvents:"← Back to events", agenda:"Agenda (PDF)", speakers:"Speakers", location:"Location", linkedGallery:"Photo Gallery", viewGallery:"View gallery", details:"Event details" },
    gallery:{ title:"Gallery", noPhotos:"No photos available.", back:"← Back to albums" },
    research:{ title:"Research", noPosts:"No research articles available." },
    education:{ title:"Education", noPosts:"No educational materials available." },
    profile:{ title:"My Profile", name:"Name", memberId:"Member Number", joinDate:"Join Date", email:"Email", certificates:"Participation Certificates", noCerts:"No certificates available.", downloadPdf:"Download PDF", viewCert:"Certificate" },
    login:{ title:"Member Login", cardLabel:"Member Card Number", passLabel:"Password", btn:"Login", error:"Incorrect credentials.", forgot:"Forgot your password? Contact the administrator." },
    admin:{ title:"Admin Panel", tabs:{ members:"Members", news:"News", events:"Events", gallery:"Gallery", research:"Research", education:"Education", certificates:"Certificates" }, addMember:"Add Member", addNews:"Add News", addEvent:"Add Event", addAlbum:"Add Album", addPost:"Add Article", save:"Save", cancel:"Cancel", delete:"Delete", edit:"Edit", managePhotos:"Photos", manageCerts:"Certificates", addCert:"Add Certificate",
      fields:{ name:"Name", card_number:"Card Number", email:"Email", join_date:"Join Date", password:"Password", title_ro:"Title (RO)", title_en:"Title (EN)", body_ro:"Content (RO)", body_en:"Content (EN)", image_url:"Image URL", date:"Date", location_ro:"Location (RO)", location_en:"Location (EN)", desc_ro:"Description (RO)", desc_en:"Description (EN)", status:"Status", agenda_url:"Agenda PDF URL", speakers_image_url:"Speakers Image URL", album_id:"Gallery Album ID", albumNameRo:"Album Name (RO)", albumNameEn:"Album Name (EN)", coverUrl:"Cover URL", photoUrl:"Photo URL", captionRo:"Caption (RO)", captionEn:"Caption (EN)", member_id:"Member ID", event_id:"Event ID", cert_image_url:"Certificate Image URL" }
    },
    footer:"© 2025 Alliance for Rare Hepatic Diseases. All rights reserved.",
    loading:"Loading...", readMore:"Read more", backToNews:"← Back to news", backToList:"← Back",
  }
};

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function ABHRLogo({ size=48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{flexShrink:0}}>
      <rect x="2" y="2" width="45" height="45" fill={GREEN} rx="4"/>
      <rect x="53" y="2" width="45" height="45" fill={GREEN} rx="4"/>
      <rect x="2" y="53" width="45" height="45" fill={GREEN} rx="4"/>
      <rect x="53" y="53" width="45" height="45" fill={RED} rx="4"/>
      <text x="24.5" y="38" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold" fontFamily="serif">A</text>
      <text x="75.5" y="38" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold" fontFamily="serif">B</text>
      <text x="24.5" y="89" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold" fontFamily="serif">H</text>
      <text x="75.5" y="89" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold" fontFamily="serif">R</text>
    </svg>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const { lang, setLang } = useLang();
  const { user, logout } = useAuth();
  const t = T[lang];
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { key:"home", label:t.nav.home },
    { key:"mission", label:t.nav.mission },
    { key:"news", label:t.nav.news },
    { key:"events", label:t.nav.events },
    { key:"gallery", label:t.nav.gallery },
    { key:"research", label:t.nav.research },
    { key:"education", label:t.nav.education },
    ...(user && !user.isAdmin ? [{ key:"profile", label:t.nav.profile }] : []),
    ...(user?.isAdmin ? [{ key:"admin", label:t.nav.admin }] : []),
  ];
  const go = (key) => { setPage(key); setMenuOpen(false); };
  return (
    <nav style={{background:GREEN, boxShadow:"0 2px 12px rgba(0,0,0,0.15)", position:"sticky", top:0, zIndex:100}}>
      <div style={{maxWidth:1200, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64}}>
        <div style={{display:"flex", alignItems:"center", gap:12, cursor:"pointer"}} onClick={() => go("home")}>
          <ABHRLogo size={42}/>
          <div style={{color:"white"}}>
            <div style={{fontFamily:"Georgia,serif", fontSize:14, fontWeight:700, letterSpacing:1}}>ABHR</div>
            <div style={{fontSize:9, opacity:0.85, maxWidth:160, lineHeight:1.2}}>{t.orgName}</div>
          </div>
        </div>
        <div style={{display:"flex", alignItems:"center", gap:1, flexWrap:"wrap"}} className="desktop-nav">
          {navItems.map(item => (
            <button key={item.key} onClick={() => go(item.key)} style={{background:page===item.key?"rgba(255,255,255,0.2)":"transparent", border:"none", color:"white", padding:"7px 10px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:500, fontFamily:"inherit"}}>{item.label}</button>
          ))}
          <div style={{display:"flex", background:"rgba(255,255,255,0.15)", borderRadius:20, overflow:"hidden", marginLeft:6}}>
            {["ro","en"].map(l => <button key={l} onClick={() => setLang(l)} style={{background:lang===l?"white":"transparent", color:lang===l?GREEN:"white", border:"none", padding:"5px 10px", cursor:"pointer", fontWeight:700, fontSize:11, fontFamily:"inherit"}}>{l.toUpperCase()}</button>)}
          </div>
          {user
            ? <button onClick={logout} style={{background:RED, border:"none", color:"white", padding:"7px 12px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:600, marginLeft:4, fontFamily:"inherit"}}>{t.nav.logout}</button>
            : <button onClick={() => go("login")} style={{background:"white", border:"none", color:GREEN, padding:"7px 12px", borderRadius:6, cursor:"pointer", fontSize:12, fontWeight:700, marginLeft:4, fontFamily:"inherit"}}>{t.nav.login}</button>
          }
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger" style={{display:"none", background:"transparent", border:"none", color:"white", fontSize:24, cursor:"pointer"}}>☰</button>
      </div>
      {menuOpen && (
        <div style={{background:GREEN_DARK, padding:"12px 20px", display:"flex", flexDirection:"column", gap:4}}>
          {navItems.map(item => <button key={item.key} onClick={() => go(item.key)} style={{background:page===item.key?"rgba(255,255,255,0.15)":"transparent", border:"none", color:"white", padding:"10px 12px", borderRadius:6, cursor:"pointer", fontSize:14, textAlign:"left", fontFamily:"inherit"}}>{item.label}</button>)}
          <div style={{display:"flex", gap:8, marginTop:8, flexWrap:"wrap"}}>
            {["ro","en"].map(l => <button key={l} onClick={() => setLang(l)} style={{background:lang===l?"white":"rgba(255,255,255,0.2)", color:lang===l?GREEN:"white", border:"none", padding:"6px 14px", borderRadius:20, cursor:"pointer", fontWeight:700, fontSize:12, fontFamily:"inherit"}}>{l.toUpperCase()}</button>)}
            {user
              ? <button onClick={() => { logout(); setMenuOpen(false); }} style={{background:RED, border:"none", color:"white", padding:"6px 14px", borderRadius:6, cursor:"pointer", fontFamily:"inherit"}}>{t.nav.logout}</button>
              : <button onClick={() => go("login")} style={{background:"white", border:"none", color:GREEN, padding:"6px 14px", borderRadius:6, cursor:"pointer", fontWeight:700, fontFamily:"inherit"}}>{t.nav.login}</button>
            }
          </div>
        </div>
      )}
      <style>{`@media(max-width:900px){.desktop-nav{display:none!important}.hamburger{display:block!important}}`}</style>
    </nav>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const { lang } = useLang();
  const c = STATUS_COLORS[status] || STATUS_COLORS.past;
  const label = STATUS_LABELS[lang][status] || status;
  return <span style={{background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, letterSpacing:0.5}}>{label}</span>;
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({ setPage, news, events, setSelectedNews, setSelectedEvent }) {
  const { lang } = useLang();
  const t = T[lang];

  const homeEvents = (() => {
    const ongoing = events.filter(e => e.status === "ongoing");
    const upcoming = events.filter(e => e.status === "upcoming").sort((a,b) => new Date(a.date)-new Date(b.date));
    if (ongoing.length > 0) return [ongoing[0], ...(upcoming.slice(0,1))].slice(0,2);
    return upcoming.slice(0,2);
  })();

  const homeNews = news.slice(0,2);

  return (
    <div>
      <div style={{background:`linear-gradient(135deg,${GREEN_DARK} 0%,${GREEN} 60%,#2d8a5e 100%)`, minHeight:420, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", textAlign:"center", padding:"60px 24px", position:"relative", overflow:"hidden"}}>
        <div style={{position:"absolute", top:-60, right:-60, width:300, height:300, background:"rgba(255,255,255,0.04)", borderRadius:"50%"}}/>
        <ABHRLogo size={80}/>
        <h1 style={{color:"white", fontSize:"clamp(26px,5vw,48px)", fontFamily:"Georgia,serif", margin:"24px 0 16px", fontWeight:700}}>{t.home.hero}</h1>
        <p style={{color:"rgba(255,255,255,0.85)", fontSize:"clamp(14px,2.5vw,18px)", maxWidth:600, lineHeight:1.7, margin:"0 0 32px"}}>{t.home.sub}</p>
        <button onClick={() => setPage("mission")} style={{background:"white", color:GREEN, border:"none", padding:"14px 32px", borderRadius:8, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit"}}>{t.home.cta}</button>
      </div>

      <div style={{maxWidth:1100, margin:"0 auto", padding:"60px 24px"}}>
        <SectionTitle>{t.home.recentNews}</SectionTitle>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:24, marginTop:32}}>
          {homeNews.map(n => <NewsCard key={n.id} item={n} onClick={() => { setSelectedNews(n); setPage("newsDetail"); }}/>)}
          {homeNews.length===0 && <p style={{color:"#888"}}>{t.news.noNews}</p>}
        </div>
      </div>

      <div style={{background:GREEN_LIGHT, padding:"60px 24px"}}>
        <div style={{maxWidth:1100, margin:"0 auto"}}>
          <SectionTitle>{t.home.upcomingEvents}</SectionTitle>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:24, marginTop:32}}>
            {homeEvents.map(e => <EventCard key={e.id} item={e} onClick={() => { setSelectedEvent(e); setPage("eventDetail"); }}/>)}
            {homeEvents.length===0 && <p style={{color:"#888"}}>{t.events.noEvents}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MISSION ──────────────────────────────────────────────────────────────────
function MissionPage() {
  const { lang } = useLang();
  const t = T[lang].mission;
  return (
    <div style={{maxWidth:900, margin:"0 auto", padding:"60px 24px"}}>
      <SectionTitle>{t.title}</SectionTitle>
      <p style={{fontSize:17, lineHeight:1.8, color:"#333", margin:"32px 0 48px", fontFamily:"Georgia,serif"}}>{t.body}</p>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:24}}>
        {t.values.map((v,i) => (
          <div key={v} style={{background:i===0?GREEN:i===2?RED_LIGHT:i===1?GREEN_LIGHT:"#f5f5f5", borderRadius:12, padding:28, borderTop:`4px solid ${i===0?"white":i===2?RED:GREEN}`}}>
            <div style={{fontSize:18, fontWeight:700, color:i===0?"white":i===2?RED:GREEN, marginBottom:12}}>{v}</div>
            <div style={{fontSize:14, lineHeight:1.6, color:i===0?"rgba(255,255,255,0.9)":"#555"}}>{t.valuesDesc[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NEWS LIST ────────────────────────────────────────────────────────────────
function NewsPage({ news, setSelectedNews, setPage }) {
  const { lang } = useLang();
  const t = T[lang].news;
  return (
    <div style={{maxWidth:1100, margin:"0 auto", padding:"60px 24px"}}>
      <SectionTitle>{t.title}</SectionTitle>
      {news.length===0 && <p style={{color:"#888", marginTop:32}}>{t.noNews}</p>}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:28, marginTop:32}}>
        {news.map(n => <NewsCard key={n.id} item={n} onClick={() => { setSelectedNews(n); setPage("newsDetail"); }}/>)}
      </div>
    </div>
  );
}

// ─── NEWS DETAIL ──────────────────────────────────────────────────────────────
function NewsDetailPage({ item, setPage }) {
  const { lang } = useLang();
  const t = T[lang];
  if (!item) { setPage("news"); return null; }
  const title = lang==="ro" ? item.title_ro : item.title_en;
  const body = lang==="ro" ? item.body_ro : item.body_en;
  return (
    <div style={{maxWidth:800, margin:"0 auto", padding:"60px 24px"}}>
      <button onClick={() => setPage("news")} style={{background:"transparent", border:"none", color:GREEN, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:24, padding:0, fontFamily:"inherit"}}>{t.backToNews}</button>
      {item.image_url && <img src={item.image_url} alt={title} style={{width:"100%", maxHeight:400, objectFit:"cover", borderRadius:12, marginBottom:32}}/>}
      <div style={{fontSize:12, color:"#999", marginBottom:12, fontWeight:600, letterSpacing:1}}>{item.date}</div>
      <h1 style={{fontFamily:"Georgia,serif", fontSize:"clamp(22px,4vw,36px)", color:"#1a1a1a", margin:"0 0 24px", lineHeight:1.3}}>{title}</h1>
      <div style={{fontSize:16, lineHeight:1.9, color:"#333", whiteSpace:"pre-wrap"}}>{body}</div>
    </div>
  );
}

// ─── EVENTS LIST ──────────────────────────────────────────────────────────────
function EventsPage({ events, setSelectedEvent, setPage }) {
  const { lang } = useLang();
  const t = T[lang].events;
  const ongoing = events.filter(e => e.status==="ongoing");
  const upcoming = events.filter(e => e.status==="upcoming").sort((a,b) => new Date(a.date)-new Date(b.date));
  const past = events.filter(e => e.status==="past").sort((a,b) => new Date(b.date)-new Date(a.date));
  const ordered = [...ongoing, ...upcoming, ...past];
  return (
    <div style={{maxWidth:1100, margin:"0 auto", padding:"60px 24px"}}>
      <SectionTitle>{t.title}</SectionTitle>
      {ordered.length===0 && <p style={{color:"#888", marginTop:32}}>{t.noEvents}</p>}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:28, marginTop:32}}>
        {ordered.map(e => <EventCard key={e.id} item={e} onClick={() => { setSelectedEvent(e); setPage("eventDetail"); }}/>)}
      </div>
    </div>
  );
}

// ─── EVENT DETAIL ─────────────────────────────────────────────────────────────
function EventDetailPage({ item, setPage, albums }) {
  const { lang } = useLang();
  const t = T[lang].events;
  if (!item) { setPage("events"); return null; }
  const title = lang==="ro" ? item.title_ro : item.title_en;
  const desc = lang==="ro" ? item.desc_ro : item.desc_en;
  const location = lang==="ro" ? item.location_ro : item.location_en;
  const linkedAlbum = albums.find(a => a.id === item.album_id);

  return (
    <div style={{maxWidth:900, margin:"0 auto", padding:"60px 24px"}}>
      <button onClick={() => setPage("events")} style={{background:"transparent", border:"none", color:GREEN, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:24, padding:0, fontFamily:"inherit"}}>{t.backToEvents}</button>
      <div style={{display:"flex", alignItems:"center", gap:14, marginBottom:24, flexWrap:"wrap"}}>
        <SectionTitle>{title}</SectionTitle>
        <StatusBadge status={item.status}/>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:32}}>
        <InfoBox icon="📅" label={t.details} value={item.date}/>
        <InfoBox icon="📍" label={t.location} value={location}/>
      </div>

      {desc && <div style={{background:"white", borderRadius:12, padding:28, boxShadow:"0 2px 12px rgba(0,0,0,0.07)", marginBottom:24}}>
        <p style={{fontSize:16, lineHeight:1.8, color:"#333", margin:0}}>{desc}</p>
      </div>}

      {item.agenda_url && (
        <div style={{background:GREEN_LIGHT, borderRadius:12, padding:20, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between"}}>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <span style={{fontSize:24}}>📄</span>
            <span style={{fontWeight:600, color:GREEN}}>{t.agenda}</span>
          </div>
          <a href={item.agenda_url} target="_blank" rel="noreferrer" style={{background:GREEN, color:"white", padding:"8px 18px", borderRadius:6, textDecoration:"none", fontSize:13, fontWeight:600}}>Download</a>
        </div>
      )}

      {item.speakers_image_url && (
        <div style={{marginBottom:24}}>
          <h3 style={{fontFamily:"Georgia,serif", color:"#1a1a1a", marginBottom:12}}>{t.speakers}</h3>
          <img src={item.speakers_image_url} alt="speakers" style={{width:"100%", borderRadius:12, boxShadow:"0 2px 12px rgba(0,0,0,0.1)"}}/>
        </div>
      )}

      {linkedAlbum && (
        <div style={{background:"white", borderRadius:12, padding:20, boxShadow:"0 2px 12px rgba(0,0,0,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12}}>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            {linkedAlbum.cover_url && <img src={linkedAlbum.cover_url} alt="" style={{width:60, height:44, objectFit:"cover", borderRadius:6}}/>}
            <div>
              <div style={{fontSize:12, color:"#888", marginBottom:2}}>{t.linkedGallery}</div>
              <div style={{fontWeight:700, color:"#1a1a1a"}}>{lang==="ro" ? linkedAlbum.name_ro : linkedAlbum.name_en}</div>
            </div>
          </div>
          <button onClick={() => setPage("gallery")} style={{background:GREEN, color:"white", border:"none", padding:"8px 18px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>{t.viewGallery}</button>
        </div>
      )}
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div style={{background:"white", borderRadius:10, padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
      <div style={{fontSize:11, color:"#999", marginBottom:4, fontWeight:600, letterSpacing:0.5}}>{label}</div>
      <div style={{display:"flex", alignItems:"center", gap:8}}><span>{icon}</span><span style={{fontWeight:600, color:"#1a1a1a", fontSize:15}}>{value}</span></div>
    </div>
  );
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────
function GalleryPage({ albums }) {
  const { lang } = useLang();
  const t = T[lang].gallery;
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  if (lightbox !== null && selectedAlbum) {
    const photos = selectedAlbum.photos||[];
    const photo = photos[lightbox];
    return (
      <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column"}} onClick={() => setLightbox(null)}>
        <button onClick={() => setLightbox(null)} style={{position:"absolute", top:20, right:24, background:"transparent", border:"none", color:"white", fontSize:32, cursor:"pointer"}}>✕</button>
        <img src={photo.url} alt="" style={{maxWidth:"90vw", maxHeight:"80vh", borderRadius:8, objectFit:"contain"}} onClick={e => e.stopPropagation()}/>
        {(photo.caption_ro||photo.caption_en) && <p style={{color:"rgba(255,255,255,0.8)", marginTop:16, fontSize:14}}>{lang==="ro"?photo.caption_ro:photo.caption_en}</p>}
        <div style={{display:"flex", gap:12, marginTop:16}} onClick={e => e.stopPropagation()}>
          <button onClick={() => setLightbox(i => Math.max(0,i-1))} disabled={lightbox===0} style={{background:"rgba(255,255,255,0.15)", border:"none", color:"white", padding:"8px 20px", borderRadius:6, cursor:"pointer", fontSize:18}}>‹</button>
          <span style={{color:"rgba(255,255,255,0.6)", fontSize:13, alignSelf:"center"}}>{lightbox+1} / {photos.length}</span>
          <button onClick={() => setLightbox(i => Math.min(photos.length-1,i+1))} disabled={lightbox===photos.length-1} style={{background:"rgba(255,255,255,0.15)", border:"none", color:"white", padding:"8px 20px", borderRadius:6, cursor:"pointer", fontSize:18}}>›</button>
        </div>
      </div>
    );
  }

  if (selectedAlbum) {
    const photos = selectedAlbum.photos||[];
    return (
      <div style={{maxWidth:1100, margin:"0 auto", padding:"60px 24px"}}>
        <button onClick={() => setSelectedAlbum(null)} style={{background:"transparent", border:"none", color:GREEN, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:24, padding:0, fontFamily:"inherit"}}>{t.back}</button>
        <SectionTitle>{lang==="ro"?selectedAlbum.name_ro:selectedAlbum.name_en}</SectionTitle>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16, marginTop:32}}>
          {photos.map((photo,idx) => (
            <div key={photo.id} onClick={() => setLightbox(idx)} style={{cursor:"pointer", borderRadius:10, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.1)", aspectRatio:"4/3", position:"relative", background:"#000"}}>
              <img src={photo.url} alt="" style={{width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.3s,opacity 0.3s"}} onMouseEnter={e=>{e.target.style.transform="scale(1.05)";e.target.style.opacity="0.85"}} onMouseLeave={e=>{e.target.style.transform="scale(1)";e.target.style.opacity="1"}}/>
              {(photo.caption_ro||photo.caption_en) && <div style={{position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent,rgba(0,0,0,0.7))", color:"white", fontSize:12, padding:"20px 12px 10px"}}>{lang==="ro"?photo.caption_ro:photo.caption_en}</div>}
            </div>
          ))}
        </div>
        {photos.length===0 && <p style={{color:"#888", marginTop:32}}>{t.noPhotos}</p>}
      </div>
    );
  }

  return (
    <div style={{maxWidth:1100, margin:"0 auto", padding:"60px 24px"}}>
      <SectionTitle>{t.title}</SectionTitle>
      {albums.length===0 && <p style={{color:"#888", marginTop:32}}>{t.noPhotos}</p>}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:24, marginTop:32}}>
        {albums.map(album => (
          <div key={album.id} onClick={() => setSelectedAlbum(album)} style={{cursor:"pointer", borderRadius:12, overflow:"hidden", boxShadow:"0 4px 16px rgba(0,0,0,0.1)", background:"white"}}>
            <div style={{height:200, overflow:"hidden", background:"#eee", position:"relative"}}>
              {album.cover_url
                ? <img src={album.cover_url} alt="" style={{width:"100%", height:"100%", objectFit:"cover", transition:"transform 0.3s"}} onMouseEnter={e=>e.target.style.transform="scale(1.05)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
                : <div style={{width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40}}>🖼</div>
              }
              <div style={{position:"absolute", top:10, right:10, background:"rgba(0,0,0,0.55)", color:"white", fontSize:11, padding:"3px 8px", borderRadius:20, fontWeight:600}}>{album.photos?.length||0} foto</div>
            </div>
            <div style={{padding:"16px 20px"}}>
              <div style={{fontWeight:700, fontSize:16, color:"#1a1a1a", fontFamily:"Georgia,serif"}}>{lang==="ro"?album.name_ro:album.name_en}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RESEARCH & EDUCATION (shared) ────────────────────────────────────────────
function ArticleListPage({ items, type, setSelectedArticle, setPage }) {
  const { lang } = useLang();
  const t = T[lang][type];
  return (
    <div style={{maxWidth:1100, margin:"0 auto", padding:"60px 24px"}}>
      <SectionTitle>{t.title}</SectionTitle>
      {items.length===0 && <p style={{color:"#888", marginTop:32}}>{t.noPosts}</p>}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:28, marginTop:32}}>
        {items.map(n => <NewsCard key={n.id} item={n} onClick={() => { setSelectedArticle(n); setPage(type+"Detail"); }}/>)}
      </div>
    </div>
  );
}

function ArticleDetailPage({ item, type, setPage }) {
  const { lang } = useLang();
  const t = T[lang];
  if (!item) { setPage(type); return null; }
  const title = lang==="ro"?item.title_ro:item.title_en;
  const body = lang==="ro"?item.body_ro:item.body_en;
  return (
    <div style={{maxWidth:800, margin:"0 auto", padding:"60px 24px"}}>
      <button onClick={() => setPage(type)} style={{background:"transparent", border:"none", color:GREEN, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:24, padding:0, fontFamily:"inherit"}}>{t.backToList}</button>
      {item.image_url && <img src={item.image_url} alt={title} style={{width:"100%", maxHeight:400, objectFit:"cover", borderRadius:12, marginBottom:32}}/>}
      <div style={{fontSize:12, color:"#999", marginBottom:12, fontWeight:600, letterSpacing:1}}>{item.date}</div>
      <h1 style={{fontFamily:"Georgia,serif", fontSize:"clamp(22px,4vw,36px)", color:"#1a1a1a", margin:"0 0 24px", lineHeight:1.3}}>{title}</h1>
      <div style={{fontSize:16, lineHeight:1.9, color:"#333", whiteSpace:"pre-wrap"}}>{body}</div>
    </div>
  );
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────
function ProfilePage({ certificates, events }) {
  const { lang } = useLang();
  const { user } = useAuth();
  const t = T[lang].profile;
  const [viewingCert, setViewingCert] = useState(null);

  const userCerts = certificates.filter(c => c.member_id === user?.id);

  const downloadAsPdf = (cert, eventTitle) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext("2d").drawImage(img,0,0);
      const link = document.createElement("a");
      link.download = `certificat-${eventTitle||"participare"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = cert.image_url;
  };

  const getEventTitle = (eventId) => {
    const ev = events.find(e => e.id === eventId);
    if (!ev) return eventId;
    return lang==="ro" ? ev.title_ro : ev.title_en;
  };

  return (
    <div style={{maxWidth:700, margin:"60px auto", padding:"0 24px"}}>
      <SectionTitle>{t.title}</SectionTitle>
      <div style={{background:"white", borderRadius:16, boxShadow:"0 4px 24px rgba(0,0,0,0.09)", overflow:"hidden", marginTop:32}}>
        <div style={{background:`linear-gradient(135deg,${GREEN},#2d8a5e)`, padding:"32px 32px 64px", display:"flex", alignItems:"center", gap:20}}>
          <div style={{width:72, height:72, borderRadius:"50%", background:"rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, color:"white", fontWeight:700}}>{user?.name?.[0]||"M"}</div>
          <div>
            <div style={{color:"white", fontSize:22, fontWeight:700, fontFamily:"Georgia,serif"}}>{user?.name}</div>
            <div style={{color:"rgba(255,255,255,0.8)", fontSize:14, marginTop:4}}>{user?.card_number}</div>
          </div>
        </div>
        <div style={{padding:"0 32px 32px", marginTop:-8}}>
          {[{label:t.name,value:user?.name},{label:t.memberId,value:user?.card_number},{label:t.joinDate,value:user?.join_date},{label:t.email,value:user?.email}].map(row => (
            <div key={row.label} style={{display:"flex", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid #f0f0f0"}}>
              <span style={{color:"#888", fontSize:14}}>{row.label}</span>
              <span style={{fontWeight:600, color:"#222", fontSize:14}}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{marginTop:40}}>
        <SectionTitle>{t.certificates}</SectionTitle>
        {userCerts.length===0
          ? <p style={{color:"#888", marginTop:20}}>{t.noCerts}</p>
          : <div style={{display:"flex", flexDirection:"column", gap:16, marginTop:24}}>
              {userCerts.map(cert => {
                const evTitle = getEventTitle(cert.event_id);
                return (
                  <div key={cert.id} style={{background:"white", borderRadius:12, boxShadow:"0 2px 12px rgba(0,0,0,0.08)", overflow:"hidden"}}>
                    <div style={{background:GREEN, height:4}}/>
                    <div style={{padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12}}>
                      <div>
                        <div style={{fontWeight:700, fontSize:15, color:"#1a1a1a"}}>🏅 {t.viewCert}</div>
                        <div style={{fontSize:13, color:"#666", marginTop:3}}>{evTitle}</div>
                      </div>
                      <div style={{display:"flex", gap:8}}>
                        <button onClick={() => setViewingCert(cert)} style={{background:GREEN_LIGHT, color:GREEN, border:`1px solid ${GREEN}`, padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>👁 {t.viewCert}</button>
                        <button onClick={() => downloadAsPdf(cert, evTitle)} style={{background:GREEN, color:"white", border:"none", padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>⬇ {t.downloadPdf}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>

      {viewingCert && (
        <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column"}} onClick={() => setViewingCert(null)}>
          <button onClick={() => setViewingCert(null)} style={{position:"absolute", top:20, right:24, background:"transparent", border:"none", color:"white", fontSize:32, cursor:"pointer"}}>✕</button>
          <img src={viewingCert.image_url} alt="Certificate" style={{maxWidth:"90vw", maxHeight:"85vh", borderRadius:8, objectFit:"contain"}} onClick={e => e.stopPropagation()}/>
        </div>
      )}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({ setPage }) {
  const { lang } = useLang();
  const { login } = useAuth();
  const t = T[lang].login;
  const [card, setCard] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true); setError("");
    const result = await login(card.trim(), pass);
    setLoading(false);
    if (result) setPage(result.isAdmin?"admin":"profile");
    else setError(t.error);
  };
  return (
    <div style={{minHeight:"60vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24}}>
      <div style={{background:"white", borderRadius:16, boxShadow:"0 4px 32px rgba(0,0,0,0.1)", padding:"48px 40px", width:"100%", maxWidth:420}}>
        <div style={{textAlign:"center", marginBottom:32}}><ABHRLogo size={56}/><h2 style={{margin:"16px 0 4px", fontFamily:"Georgia,serif", color:GREEN}}>{t.title}</h2></div>
        <div style={{marginBottom:20}}>
          <label style={{display:"block", marginBottom:6, fontSize:13, fontWeight:600, color:"#555"}}>{t.cardLabel}</label>
          <input value={card} onChange={e=>setCard(e.target.value)} placeholder="ABHR-001" style={inputStyle}/>
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:"block", marginBottom:6, fontSize:13, fontWeight:600, color:"#555"}}>{t.passLabel}</label>
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password" style={inputStyle} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
        </div>
        {error && <div style={{background:RED_LIGHT, color:RED, padding:"10px 14px", borderRadius:8, fontSize:13, marginBottom:16}}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{width:"100%", background:GREEN, color:"white", border:"none", padding:13, borderRadius:8, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", opacity:loading?0.7:1}}>{loading?"...":t.btn}</button>
        <p style={{textAlign:"center", fontSize:12, color:"#999", marginTop:20}}>{t.forgot}</p>
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function AdminPage({ members, setMembers, news, setNews, events, setEvents, albums, setAlbums, research, setResearch, education, setEducation, certificates, setCertificates }) {
  const { lang } = useLang();
  const t = T[lang].admin;
  const [tab, setTab] = useState("members");
  const [editItem, setEditItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [photoAlbum, setPhotoAlbum] = useState(null);
  const [photoForm, setPhotoForm] = useState({});
  const [showPhotoForm, setShowPhotoForm] = useState(false);
  const [certMember, setCertMember] = useState(null);
  const [certForm, setCertForm] = useState({});
  const [showCertForm, setShowCertForm] = useState(false);

  const tabs = [
    {key:"members",label:t.tabs.members},{key:"news",label:t.tabs.news},{key:"events",label:t.tabs.events},
    {key:"gallery",label:t.tabs.gallery},{key:"research",label:t.tabs.research},{key:"education",label:t.tabs.education}
  ];

  const openAdd = () => { setEditItem(null); setForm({}); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setForm({...item}); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditItem(null); setForm({}); };

  const getSetterAndData = () => {
    if (tab==="members") return [members, setMembers, "members"];
    if (tab==="news") return [news, setNews, "news"];
    if (tab==="events") return [events, setEvents, "events"];
    if (tab==="gallery") return [albums, setAlbums, "albums"];
    if (tab==="research") return [research, setResearch, "research"];
    if (tab==="education") return [education, setEducation, "education"];
    return [[], ()=>{}, tab];
  };

  const buildPayload = () => {
    if (tab==="members") return { card_number:form.card_number, name:form.name, email:form.email, join_date:form.join_date||null, password_hash:form.password?hashPassword(form.password):form.password_hash };
    if (tab==="news"||tab==="research"||tab==="education") return { title_ro:form.title_ro, title_en:form.title_en, body_ro:form.body_ro, body_en:form.body_en, image_url:form.image_url||"", date:form.date||new Date().toISOString().slice(0,10) };
    if (tab==="events") return { title_ro:form.title_ro, title_en:form.title_en, date:form.date, location_ro:form.location_ro, location_en:form.location_en, desc_ro:form.desc_ro, desc_en:form.desc_en, status:form.status||"upcoming", agenda_url:form.agenda_url||"", speakers_image_url:form.speakers_image_url||"", album_id:form.album_id||"" };
    if (tab==="gallery") return { name_ro:form.albumNameRo||"", name_en:form.albumNameEn||"", cover_url:form.coverUrl||null };
    return form;
  };

  const handleSave = async () => {
    setSaving(true);
    const [data, setter, tableName] = getSetterAndData();
    const payload = buildPayload();
    try {
      if (editItem) {
        await db.update(tableName==="gallery"?"albums":tableName, editItem.id, payload);
        setter(arr => arr.map(x => x.id===editItem.id ? {...x,...payload} : x));
      } else {
        const res = await db.insert(tableName==="gallery"?"albums":tableName, payload);
        const newItem = res[0] || {...payload, id:Date.now().toString(), created_at:new Date().toISOString()};
        if (tab==="gallery") setter(arr => [{...newItem, photos:[]}, ...arr]);
        else setter(arr => [newItem, ...arr]);
      }
    } catch(e){ console.error(e); }
    setSaving(false); closeForm();
  };

  const handleDelete = async (id) => {
    const [data, setter, tableName] = getSetterAndData();
    await db.delete(tableName==="gallery"?"albums":tableName, id);
    setter(arr => arr.filter(x => x.id!==id));
  };

  const handleAddPhoto = async () => {
    if (!photoForm.photoUrl) return;
    const payload = { album_id:photoAlbum.id, url:photoForm.photoUrl, caption_ro:photoForm.captionRo||"", caption_en:photoForm.captionEn||"" };
    const res = await db.insert("photos", payload);
    const newPhoto = res[0]||{...payload, id:Date.now().toString()};
    setAlbums(as => as.map(a => a.id===photoAlbum.id?{...a,photos:[...(a.photos||[]),newPhoto]}:a));
    setPhotoAlbum(prev => ({...prev, photos:[...(prev.photos||[]),newPhoto]}));
    setPhotoForm({}); setShowPhotoForm(false);
  };

  const handleDeletePhoto = async (photoId) => {
    await db.delete("photos", photoId);
    setAlbums(as => as.map(a => a.id===photoAlbum.id?{...a,photos:a.photos.filter(p=>p.id!==photoId)}:a));
    setPhotoAlbum(prev => ({...prev,photos:prev.photos.filter(p=>p.id!==photoId)}));
  };

  const handleAddCert = async () => {
    if (!certForm.event_id||!certForm.cert_image_url) return;
    const payload = { member_id:certMember.id, event_id:certForm.event_id, image_url:certForm.cert_image_url };
    const res = await db.insert("certificates", payload);
    const newCert = res[0]||{...payload,id:Date.now().toString()};
    setCertificates(cs => [newCert,...cs]);
    setCertForm({}); setShowCertForm(false);
  };

  const handleDeleteCert = async (id) => {
    await db.delete("certificates", id);
    setCertificates(cs => cs.filter(c=>c.id!==id));
  };

  const downloadCert = (cert) => {
    const img = new Image(); img.crossOrigin="anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width=img.width; canvas.height=img.height;
      canvas.getContext("2d").drawImage(img,0,0);
      const link = document.createElement("a");
      link.download=`certificat-${cert.member_id}.png`;
      link.href=canvas.toDataURL("image/png"); link.click();
    };
    img.src=cert.image_url;
  };

  const FIELD_SETS = {
    members:["name","card_number","email","join_date","password"],
    news:["title_ro","title_en","body_ro","body_en","image_url","date"],
    events:["title_ro","title_en","date","location_ro","location_en","desc_ro","desc_en","status","agenda_url","speakers_image_url","album_id"],
    gallery:["albumNameRo","albumNameEn","coverUrl"],
    research:["title_ro","title_en","body_ro","body_en","image_url","date"],
    education:["title_ro","title_en","body_ro","body_en","image_url","date"],
  };

  const [currentData] = getSetterAndData();
  const currentFields = FIELD_SETS[tab]||[];
  const addLabel = tab==="members"?t.addMember:tab==="gallery"?t.addAlbum:tab==="certificates"?"":t.addPost;

  const getItemTitle = (item) => {
    if (tab==="members") return item.name;
    if (tab==="gallery") return lang==="ro"?item.name_ro:item.name_en;
    return lang==="ro"?item.title_ro:item.title_en;
  };

  // ── Certificates tab — all certs overview ──
  if (tab==="certificates" && !certMember) {
    return (
      <div style={{maxWidth:1000, margin:"0 auto", padding:"40px 24px"}}>
        <SectionTitle>{t.tabs.certificates}</SectionTitle>
        <p style={{color:"#888", fontSize:13, marginTop:8, marginBottom:28}}>
          {lang==="ro" ? "Toate certificatele din sistem. Pentru a adăuga un certificat, mergeți la tab-ul Membri → 🏅 Certificate." : "All certificates in the system. To add a certificate, go to Members tab → 🏅 Certificates."}
        </p>
        {certificates.length === 0
          ? <p style={{color:"#aaa", textAlign:"center", padding:40}}>—</p>
          : <div style={{display:"flex", flexDirection:"column", gap:12}}>
              {certificates.map(cert => {
                const ev = events.find(e => e.id===cert.event_id);
                const member = members.find(m => m.id===cert.member_id);
                return (
                  <div key={cert.id} style={{background:"white", borderRadius:10, padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12}}>
                    <div style={{display:"flex", alignItems:"center", gap:14}}>
                      <img src={cert.image_url} alt="" style={{width:80, height:56, objectFit:"cover", borderRadius:6}}/>
                      <div>
                        <div style={{fontWeight:700, fontSize:15, color:"#1a1a1a"}}>{member?.name || cert.member_id}</div>
                        <div style={{fontSize:13, color:"#666", marginTop:2}}>{ev ? (lang==="ro"?ev.title_ro:ev.title_en) : cert.event_id}</div>
                        <div style={{fontSize:11, color:"#aaa", marginTop:2}}>{cert.created_at?.slice(0,10)}</div>
                      </div>
                    </div>
                    <div style={{display:"flex", gap:8}}>
                      <button onClick={() => downloadCert(cert)} style={{background:GREEN_LIGHT, color:GREEN, border:`1px solid ${GREEN}`, padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>⬇ PDF</button>
                      <button onClick={() => handleDeleteCert(cert.id)} style={{background:RED_LIGHT, color:RED, border:`1px solid ${RED}`, padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>{t.delete}</button>
                    </div>
                  </div>
                );
              })}
            </div>
        }
      </div>
    );
  }

  // ── Certificates sub-view (per member) ──
  if (tab==="certificates" && certMember) {
    const memberCerts = certificates.filter(c => c.member_id===certMember.id);
    return (
      <div style={{maxWidth:1000, margin:"0 auto", padding:"40px 24px"}}>
        <button onClick={() => setCertMember(null)} style={{background:"transparent", border:"none", color:GREEN, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:24, padding:0, fontFamily:"inherit"}}>← {t.tabs.members}</button>
        <SectionTitle>{certMember.name} — {t.tabs.certificates}</SectionTitle>
        <div style={{display:"flex", justifyContent:"flex-end", margin:"20px 0"}}>
          <button onClick={() => setShowCertForm(true)} style={{background:GREEN, color:"white", border:"none", padding:"10px 22px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, fontFamily:"inherit"}}>+ {t.addCert}</button>
        </div>
        {showCertForm && (
          <div style={{background:GREEN_LIGHT, borderRadius:12, padding:24, marginBottom:24}}>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16}}>
              <div>
                <label style={{display:"block", fontSize:12, fontWeight:600, color:"#555", marginBottom:5}}>{t.fields.event_id}</label>
                <select value={certForm.event_id||""} onChange={e => setCertForm(p=>({...p,event_id:e.target.value}))} style={{...inputStyle}}>
                  <option value="">— selectează eveniment —</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{lang==="ro"?ev.title_ro:ev.title_en}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block", fontSize:12, fontWeight:600, color:"#555", marginBottom:5}}>{t.fields.cert_image_url}</label>
                <input value={certForm.cert_image_url||""} onChange={e=>setCertForm(p=>({...p,cert_image_url:e.target.value}))} style={inputStyle} placeholder="https://..."/>
              </div>
            </div>
            <div style={{display:"flex", gap:10, marginTop:16}}>
              <button onClick={handleAddCert} style={{background:GREEN, color:"white", border:"none", padding:"10px 24px", borderRadius:8, cursor:"pointer", fontWeight:600, fontFamily:"inherit"}}>{t.save}</button>
              <button onClick={() => setShowCertForm(false)} style={{background:"white", color:"#555", border:"1px solid #ccc", padding:"10px 24px", borderRadius:8, cursor:"pointer", fontFamily:"inherit"}}>{t.cancel}</button>
            </div>
          </div>
        )}
        <div style={{display:"flex", flexDirection:"column", gap:12}}>
          {memberCerts.map(cert => {
            const ev = events.find(e=>e.id===cert.event_id);
            return (
              <div key={cert.id} style={{background:"white", borderRadius:10, padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12}}>
                <div style={{display:"flex", alignItems:"center", gap:14}}>
                  <img src={cert.image_url} alt="" style={{width:80, height:56, objectFit:"cover", borderRadius:6}}/>
                  <div>
                    <div style={{fontWeight:700, fontSize:14}}>{ev?(lang==="ro"?ev.title_ro:ev.title_en):cert.event_id}</div>
                    <div style={{fontSize:12, color:"#888"}}>{cert.created_at?.slice(0,10)}</div>
                  </div>
                </div>
                <div style={{display:"flex", gap:8}}>
                  <button onClick={() => downloadCert(cert)} style={{background:GREEN_LIGHT, color:GREEN, border:`1px solid ${GREEN}`, padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>⬇ PDF</button>
                  <button onClick={() => handleDeleteCert(cert.id)} style={{background:RED_LIGHT, color:RED, border:`1px solid ${RED}`, padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>{t.delete}</button>
                </div>
              </div>
            );
          })}
          {memberCerts.length===0 && <p style={{color:"#aaa", textAlign:"center", padding:40}}>—</p>}
        </div>
      </div>
    );
  }

  // ── Photo sub-view ──
  if (photoAlbum) {
    return (
      <div style={{maxWidth:1000, margin:"0 auto", padding:"40px 24px"}}>
        <button onClick={() => setPhotoAlbum(null)} style={{background:"transparent", border:"none", color:GREEN, fontSize:14, fontWeight:600, cursor:"pointer", marginBottom:24, padding:0, fontFamily:"inherit"}}>← {t.tabs.gallery}</button>
        <SectionTitle>{lang==="ro"?photoAlbum.name_ro:photoAlbum.name_en}</SectionTitle>
        <div style={{display:"flex", justifyContent:"flex-end", margin:"20px 0"}}>
          <button onClick={() => setShowPhotoForm(true)} style={{background:GREEN, color:"white", border:"none", padding:"10px 22px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, fontFamily:"inherit"}}>+ {t.fields.photoUrl}</button>
        </div>
        {showPhotoForm && (
          <div style={{background:GREEN_LIGHT, borderRadius:12, padding:24, marginBottom:24}}>
            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16}}>
              {["photoUrl","captionRo","captionEn"].map(f => (
                <div key={f}>
                  <label style={{display:"block", fontSize:12, fontWeight:600, color:"#555", marginBottom:5}}>{t.fields[f]||f}</label>
                  <input value={photoForm[f]||""} onChange={e=>setPhotoForm(p=>({...p,[f]:e.target.value}))} style={inputStyle} placeholder={f==="photoUrl"?"https://...":""}/>
                </div>
              ))}
            </div>
            <div style={{display:"flex", gap:10, marginTop:16}}>
              <button onClick={handleAddPhoto} style={{background:GREEN, color:"white", border:"none", padding:"10px 24px", borderRadius:8, cursor:"pointer", fontWeight:600, fontFamily:"inherit"}}>{t.save}</button>
              <button onClick={() => setShowPhotoForm(false)} style={{background:"white", color:"#555", border:"1px solid #ccc", padding:"10px 24px", borderRadius:8, cursor:"pointer", fontFamily:"inherit"}}>{t.cancel}</button>
            </div>
          </div>
        )}
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16}}>
          {(photoAlbum.photos||[]).map(photo => (
            <div key={photo.id} style={{borderRadius:10, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.1)", background:"white"}}>
              <img src={photo.url} alt="" style={{width:"100%", height:150, objectFit:"cover"}}/>
              <div style={{padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                <span style={{fontSize:12, color:"#555", flex:1, marginRight:8}}>{lang==="ro"?photo.caption_ro:photo.caption_en}</span>
                <button onClick={() => handleDeletePhoto(photo.id)} style={{background:RED_LIGHT, color:RED, border:`1px solid ${RED}`, padding:"4px 10px", borderRadius:5, cursor:"pointer", fontSize:12, fontFamily:"inherit"}}>{t.delete}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth:1000, margin:"0 auto", padding:"40px 24px"}}>
      <SectionTitle>{t.title}</SectionTitle>
      <div style={{display:"flex", gap:6, marginTop:32, marginBottom:28, borderBottom:`2px solid ${GREEN_LIGHT}`, flexWrap:"wrap"}}>
        {tabs.map(tb => <button key={tb.key} onClick={() => { setTab(tb.key); closeForm(); }} style={{background:tab===tb.key?GREEN:"transparent", color:tab===tb.key?"white":GREEN, border:`2px solid ${GREEN}`, padding:"8px 16px", borderRadius:"6px 6px 0 0", cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit", borderBottom:"none", marginBottom:-2}}>{tb.label}</button>)}
      </div>

      {tab!=="certificates" && (
        <div style={{display:"flex", justifyContent:"flex-end", marginBottom:20}}>
          <button onClick={openAdd} style={{background:GREEN, color:"white", border:"none", padding:"10px 22px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:14, fontFamily:"inherit"}}>+ {addLabel}</button>
        </div>
      )}

      {showForm && tab!=="certificates" && (
        <div style={{background:GREEN_LIGHT, borderRadius:12, padding:28, marginBottom:28}}>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:16}}>
            {currentFields.map(f => (
              <div key={f}>
                <label style={{display:"block", fontSize:12, fontWeight:600, color:"#555", marginBottom:5}}>{t.fields[f]||f}</label>
                {f==="status" ? (
                  <select value={form[f]||"upcoming"} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={inputStyle}>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="past">Past</option>
                  </select>
                ) : (f.includes("body")||f.includes("desc")) ? (
                  <textarea value={form[f]||""} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} rows={3} style={{...inputStyle,resize:"vertical"}}/>
                ) : (
                  <input value={form[f]||""} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} type={f==="password"?"password":f==="date"||f==="join_date"?"date":"text"} style={inputStyle}/>
                )}
              </div>
            ))}
          </div>
          <div style={{display:"flex", gap:10, marginTop:20}}>
            <button onClick={handleSave} disabled={saving} style={{background:GREEN, color:"white", border:"none", padding:"10px 24px", borderRadius:8, cursor:"pointer", fontWeight:600, fontFamily:"inherit", opacity:saving?0.7:1}}>{saving?"...":t.save}</button>
            <button onClick={closeForm} style={{background:"white", color:"#555", border:"1px solid #ccc", padding:"10px 24px", borderRadius:8, cursor:"pointer", fontFamily:"inherit"}}>{t.cancel}</button>
          </div>
        </div>
      )}

      <div style={{display:"flex", flexDirection:"column", gap:12}}>
        {currentData.map(item => (
          <div key={item.id} style={{background:"white", borderRadius:10, padding:"16px 20px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12}}>
            <div style={{display:"flex", alignItems:"center", gap:14}}>
              {tab==="gallery" && item.cover_url && <img src={item.cover_url} alt="" style={{width:56, height:40, objectFit:"cover", borderRadius:6}}/>}
              {(tab==="news"||tab==="research"||tab==="education") && item.image_url && <img src={item.image_url} alt="" style={{width:56, height:40, objectFit:"cover", borderRadius:6}}/>}
              <div>
                <div style={{fontWeight:700, fontSize:15, color:"#222"}}>{getItemTitle(item)}</div>
                {tab==="members" && <div style={{fontSize:12, color:"#888", marginTop:3}}>{item.card_number} · {item.email}</div>}
                {(tab==="news"||tab==="research"||tab==="education") && <div style={{fontSize:12, color:"#888", marginTop:3}}>{item.date}</div>}
                {tab==="events" && <div style={{display:"flex", alignItems:"center", gap:8, marginTop:4}}><StatusBadge status={item.status}/><span style={{fontSize:12, color:"#888"}}>{item.date}</span></div>}
                {tab==="gallery" && <div style={{fontSize:12, color:"#888", marginTop:3}}>{item.photos?.length||0} foto</div>}
              </div>
            </div>
            <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
              {tab==="gallery" && <button onClick={() => setPhotoAlbum(item)} style={{background:"#f0f0f0", color:"#333", border:"1px solid #ccc", padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>🖼 {t.managePhotos}</button>}
              {tab==="members" && <button onClick={() => { setCertMember(item); setTab("certificates"); }} style={{background:"#f0f0f0", color:"#333", border:"1px solid #ccc", padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>🏅 {t.manageCerts}</button>}
              <button onClick={() => openEdit(item)} style={{background:GREEN_LIGHT, color:GREEN, border:`1px solid ${GREEN}`, padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>{t.edit}</button>
              <button onClick={() => handleDelete(item.id)} style={{background:RED_LIGHT, color:RED, border:`1px solid ${RED}`, padding:"7px 14px", borderRadius:6, cursor:"pointer", fontSize:13, fontWeight:600, fontFamily:"inherit"}}>{t.delete}</button>
            </div>
          </div>
        ))}
        {currentData.length===0 && <p style={{color:"#aaa", textAlign:"center", padding:40}}>—</p>}
      </div>
    </div>
  );
}

// ─── SHARED CARDS ─────────────────────────────────────────────────────────────
function NewsCard({ item, onClick }) {
  const { lang } = useLang();
  const title = lang==="ro"?item.title_ro:item.title_en;
  const body = lang==="ro"?item.body_ro:item.body_en;
  return (
    <div onClick={onClick} style={{background:"white", borderRadius:12, boxShadow:"0 2px 12px rgba(0,0,0,0.08)", overflow:"hidden", cursor:"pointer", display:"flex", flexDirection:"column", transition:"transform 0.2s,box-shadow 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)"}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.08)"}}>
      {item.image_url && <img src={item.image_url} alt={title} style={{width:"100%", height:180, objectFit:"cover"}}/>}
      {!item.image_url && <div style={{background:GREEN, height:5}}/>}
      <div style={{padding:24, flex:1}}>
        <div style={{fontSize:11, color:"#999", marginBottom:10, fontWeight:600, letterSpacing:1}}>{item.date}</div>
        <h3 style={{margin:"0 0 12px", fontSize:17, color:"#1a1a1a", fontFamily:"Georgia,serif", lineHeight:1.4}}>{title}</h3>
        <p style={{color:"#555", fontSize:14, lineHeight:1.7, margin:0}}>{body?.slice(0,120)}{body?.length>120?"…":""}</p>
      </div>
    </div>
  );
}

function EventCard({ item, onClick }) {
  const { lang } = useLang();
  const title = lang==="ro"?item.title_ro:item.title_en;
  const location = lang==="ro"?item.location_ro:item.location_en;
  return (
    <div onClick={onClick} style={{background:"white", borderRadius:12, boxShadow:"0 2px 12px rgba(0,0,0,0.08)", overflow:"hidden", cursor:"pointer", position:"relative", transition:"transform 0.2s,box-shadow 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.12)"}} onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.08)"}}>
      <div style={{background:item.status==="ongoing"?"#ffc107":item.status==="upcoming"?GREEN:RED, height:5}}/>
      <div style={{position:"absolute", top:16, right:14}}><StatusBadge status={item.status}/></div>
      <div style={{padding:24, paddingTop:36}}>
        <div style={{display:"flex", gap:10, marginBottom:14, alignItems:"flex-start"}}>
          <div style={{background:RED_LIGHT, borderRadius:8, padding:"8px 12px", textAlign:"center", minWidth:52, flexShrink:0}}>
            <div style={{fontSize:18, fontWeight:800, color:RED, lineHeight:1}}>{item.date?.split("-")[2]}</div>
            <div style={{fontSize:10, color:RED, fontWeight:600}}>{item.date?.split("-")[1]}/{item.date?.split("-")[0]?.slice(2)}</div>
          </div>
          <h3 style={{margin:0, fontSize:16, color:"#1a1a1a", fontFamily:"Georgia,serif", lineHeight:1.4}}>{title}</h3>
        </div>
        <div style={{fontSize:13, color:"#888"}}>📍 {location}</div>
      </div>
    </div>
  );
}

function Footer() {
  const { lang } = useLang();
  return (
    <footer style={{background:GREEN_DARK, color:"rgba(255,255,255,0.75)", textAlign:"center", padding:"28px 24px", fontSize:13, marginTop:60}}>
      <ABHRLogo size={36}/>
      <div style={{marginTop:12}}>{T[lang].footer}</div>
    </footer>
  );
}

function SectionTitle({ children }) {
  return (
    <div>
      <h2 style={{margin:0, fontSize:"clamp(22px,4vw,34px)", fontFamily:"Georgia,serif", color:"#1a1a1a", fontWeight:700}}>{children}</h2>
      <div style={{width:48, height:4, background:GREEN, borderRadius:2, marginTop:10}}/>
    </div>
  );
}

const inputStyle = { width:"100%", padding:"10px 14px", border:"1.5px solid #ddd", borderRadius:8, fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box", background:"white" };

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("ro");
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [members, setMembers] = useState([]);
  const [research, setResearch] = useState([]);
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      const [newsData, eventsData, albumsData, membersData, photosData, researchData, educationData, certsData] = await Promise.all([
        db.get("news"), db.get("events"), db.get("albums"), db.get("members"),
        db.get("photos"), db.get("research"), db.get("education"), db.get("certificates")
      ]);
      const albumsWithPhotos = (albumsData||[]).map(a => ({...a, photos:(photosData||[]).filter(p=>p.album_id===a.id)}));
      setNews(newsData||[]); setEvents(eventsData||[]); setAlbums(albumsWithPhotos);
      setMembers(membersData||[]); setResearch(researchData||[]); setEducation(educationData||[]);
      setCertificates(certsData||[]); setLoading(false);
    };
    loadAll();
  }, []);

  const login = async (cardNumber, password) => {
    if (cardNumber===ADMIN_CARD && password===ADMIN_PASS) {
      const u = { cardNumber:ADMIN_CARD, name:"Administrator", isAdmin:true };
      setUser(u); return u;
    }
    const member = members.find(m => m.card_number===cardNumber && m.password_hash===hashPassword(password));
    if (member) { setUser(member); return member; }
    return null;
  };

  const logout = () => { setUser(null); setPage("home"); };

  const safePage = () => {
    if ((page==="profile"||page==="newsDetail"||page==="eventDetail"||page==="researchDetail"||page==="educationDetail") && page==="profile" && !user) return "login";
    if (page==="admin" && !user?.isAdmin) return "home";
    return page;
  };
  const currentPage = safePage();

  if (loading) return (
    <div style={{minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:20, background:"#fafafa"}}>
      <ABHRLogo size={64}/>
      <div style={{color:GREEN, fontSize:16, fontFamily:"Georgia,serif"}}>{T[lang].loading}</div>
    </div>
  );

  return (
    <LangContext.Provider value={{lang,setLang}}>
      <AuthContext.Provider value={{user,login,logout}}>
        <div style={{minHeight:"100vh", display:"flex", flexDirection:"column", fontFamily:"'Segoe UI',Helvetica,Arial,sans-serif", background:"#fafafa"}}>
          <Navbar page={currentPage} setPage={setPage}/>
          <div style={{flex:1}}>
            {currentPage==="home" && <HomePage setPage={setPage} news={news} events={events} setSelectedNews={setSelectedNews} setSelectedEvent={setSelectedEvent}/>}
            {currentPage==="mission" && <MissionPage/>}
            {currentPage==="news" && <NewsPage news={news} setSelectedNews={setSelectedNews} setPage={setPage}/>}
            {currentPage==="newsDetail" && <NewsDetailPage item={selectedNews} setPage={setPage}/>}
            {currentPage==="events" && <EventsPage events={events} setSelectedEvent={setSelectedEvent} setPage={setPage}/>}
            {currentPage==="eventDetail" && <EventDetailPage item={selectedEvent} setPage={setPage} albums={albums}/>}
            {currentPage==="gallery" && <GalleryPage albums={albums}/>}
            {currentPage==="research" && <ArticleListPage items={research} type="research" setSelectedArticle={setSelectedArticle} setPage={setPage}/>}
            {currentPage==="researchDetail" && <ArticleDetailPage item={selectedArticle} type="research" setPage={setPage}/>}
            {currentPage==="education" && <ArticleListPage items={education} type="education" setSelectedArticle={setSelectedArticle} setPage={setPage}/>}
            {currentPage==="educationDetail" && <ArticleDetailPage item={selectedArticle} type="education" setPage={setPage}/>}
            {currentPage==="profile" && <ProfilePage certificates={certificates} events={events}/>}
            {currentPage==="login" && <LoginPage setPage={setPage}/>}
            {currentPage==="admin" && <AdminPage members={members} setMembers={setMembers} news={news} setNews={setNews} events={events} setEvents={setEvents} albums={albums} setAlbums={setAlbums} research={research} setResearch={setResearch} education={education} setEducation={setEducation} certificates={certificates} setCertificates={setCertificates}/>}
          </div>
          <Footer/>
        </div>
      </AuthContext.Provider>
    </LangContext.Provider>
  );
}
