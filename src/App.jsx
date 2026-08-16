import React, { useState, useEffect, useRef, createContext, useContext } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://bfbrleoqsdnqtbutlcha.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmYnJsZW9xc2RucXRidXRsY2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MzM1NDksImV4cCI6MjA5NTAwOTU0OX0.MKqr1cNZRKB4ANNJbT2QML_Xb2xpK8wmi_5xRYuxE3o";
// SHA-256 password hashing via Web Crypto API (secure, no library needed)
async function hashPasswordAsync(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "abhr-salt-2025"); // salted
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
// Sync fallback for demo data only
const hashPassword = (p) => btoa(p);
const ADMIN_UUID = "cea1d64e-ed41-4493-816b-99500b9b39a6";

const GREEN="#1a6b4a", GREEN_DARK="#0a2540", GREEN_MID="#0d3d45", GREEN_LIGHT="#e8f5ee";
const GREEN_ACCENT="#2ecc8a", RED="#c0392b", RED_LIGHT="#fdf0ee";
const PURE_GREEN_DARK="#0d3d28", PURE_GREEN_MID="#155c3e";

const LangContext = createContext();
const useLang = () => useContext(LangContext);
const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// ─── DB ───────────────────────────────────────────────────────────────────────
const DEMO_MEMBERS = [
  { id:"m1", card_number:"ABHR-001", name:"Maria Ionescu", email:"maria@example.com", join_date:"2022-03-15", password_hash:btoa("demo123") },
  { id:"m2", card_number:"ABHR-002", name:"Ion Popescu", email:"ion@example.com", join_date:"2021-07-20", password_hash:btoa("demo456") },
];
const svgImg = (bg,fg,icon,label) => { const s=`<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'><rect width='800' height='400' fill='${bg}'/><text x='400' y='190' text-anchor='middle' font-size='72' fill='${fg}'>${icon}</text><text x='400' y='260' text-anchor='middle' font-size='28' fill='${fg}' font-family='Georgia,serif'>${label}</text></svg>`; return "data:image/svg+xml;base64,"+btoa(unescape(encodeURIComponent(s))); };
const IMG = { news1:svgImg("#0d3d45","#2ecc8a","📰","Știri ABHR"), news2:svgImg("#0a2540","#2ecc8a","🏥","Conferință"), event1:svgImg("#0d3d28","#2ecc8a","🎙","Conferința 2025"), research:svgImg("#0d3d45","#2ecc8a","🔬","Cercetare"), education:svgImg("#0a2540","#2ecc8a","📚","Educație"), cert:svgImg("#0d3d28","#2ecc8a","🏅","Certificat"), album1:svgImg("#0a2540","#2ecc8a","📷","Galerie"), photo1:svgImg("#0d3d45","#2ecc8a","📸","Foto 1"), photo2:svgImg("#0d3d28","#2ecc8a","📸","Foto 2") };
const DEMO_DATA = {
  news:[
    {id:"n1",title_ro:"ABHR lansează programul de suport 2025",title_en:"ABHR launches 2025 support program",body_ro:"Suntem încântați să anunțăm lansarea noului nostru program de suport pentru pacienți și familiile acestora în anul 2025. Programul include sesiuni de consiliere, grupuri de suport și resurse educaționale comprehensive.",body_en:"We are excited to announce the launch of our new support program for patients and their families in 2025. The program includes counseling sessions, support groups and comprehensive educational resources.",image_url:IMG.news1,date:"2025-01-15",created_at:"2025-01-15"},
    {id:"n2",title_ro:"Conferință națională privind bolile hepatice rare",title_en:"National conference on rare liver diseases",body_ro:"ABHR organizează prima conferință națională dedicată bolilor hepatice rare, cu participarea specialiștilor de top din Republica Moldova. Evenimentul va reuni medici, pacienți și cercetători.",body_en:"ABHR is organizing the first national conference dedicated to rare liver diseases, with top specialists from Moldova. The event will bring together doctors, patients and researchers.",image_url:IMG.news2,date:"2025-02-10",created_at:"2025-02-10"},
  ],
  events:[
    {id:"e1",title_ro:"Conferința Anuală ABHR 2025",title_en:"ABHR Annual Conference 2025",date:"2025-05-20",location_ro:"Chișinău, Hotel Național, Sala Mare",location_en:"Chisinau, Hotel National, Main Hall",desc_ro:"Conferința anuală a membrilor ABHR pentru a discuta progresele și planurile viitoare în domeniul bolilor hepatice rare.",desc_en:"Annual ABHR conference to discuss progress and future plans in rare liver diseases.",status:"ongoing",agenda_url:"",speakers_image_url:IMG.event1,album_id:"a1",created_at:"2025-01-01"},
    {id:"e2",title_ro:"Webinar: Noutăți în tratamentul hepatic",title_en:"Webinar: Latest in liver treatment",date:"2025-07-20",location_ro:"Online (Zoom)",location_en:"Online (Zoom)",desc_ro:"Webinar cu experți în boli hepatice rare despre cele mai recente tratamente disponibile.",desc_en:"Webinar with rare liver disease experts on the latest available treatments.",status:"upcoming",agenda_url:"",speakers_image_url:IMG.event1,album_id:"a1",created_at:"2025-01-02"},
    {id:"e3",title_ro:"Întâlnire Membri 2024",title_en:"Members Meeting 2024",date:"2024-11-10",location_ro:"Chișinău, Centrul de Conferințe",location_en:"Chisinau, Conference Center",desc_ro:"Întâlnirea anuală din 2024 a membrilor ABHR.",desc_en:"2024 annual meeting of ABHR members.",status:"past",agenda_url:"",speakers_image_url:"",album_id:"",created_at:"2024-01-01"},
  ],
  albums:[{id:"a1",name_ro:"Conferința 2025",name_en:"2025 Conference",cover_url:IMG.album1,created_at:"",photos:[{id:"p1",album_id:"a1",url:IMG.photo1,caption_ro:"Deschiderea conferinței",caption_en:"Conference opening"},{id:"p2",album_id:"a1",url:IMG.photo2,caption_ro:"Sesiune medicală",caption_en:"Medical session"}]}],
  members:DEMO_MEMBERS,
  research:[{id:"r1",title_ro:"Hepatita autoimună — ce trebuie să știți",title_en:"Autoimmune hepatitis — what you need to know",body_ro:"Hepatita autoimună este o boală cronică în care sistemul imunitar atacă celulele hepatice. Articolul prezintă simptomele, diagnosticul și opțiunile de tratament.",body_en:"Autoimmune hepatitis is a chronic disease in which the immune system attacks liver cells. This article presents symptoms, diagnosis and treatment options.",image_url:IMG.research,date:"2025-01-10",created_at:"2025-01-10"}],
  education:[{id:"ed1",title_ro:"Ghid pentru pacienți: Trăind cu o boală hepatică rară",title_en:"Patient guide: Living with a rare liver disease",body_ro:"Acest ghid oferă informații practice pentru pacienții diagnosticați cu boli hepatice rare, inclusiv sfaturi privind alimentația, stilul de viață și gestionarea medicației.",body_en:"This guide provides practical information for patients diagnosed with rare liver diseases, including advice on diet, lifestyle and medication management.",image_url:IMG.education,date:"2025-02-01",created_at:"2025-02-01"}],
  certificates:[{id:"c1",member_id:"m1",event_id:"e3",image_url:IMG.cert,created_at:"2024-11-15"}],
  photos:[{id:"p1",album_id:"a1",url:IMG.photo1,caption_ro:"Deschiderea conferinței",caption_en:"Conference opening"},{id:"p2",album_id:"a1",url:IMG.photo2,caption_ro:"Sesiune medicală",caption_en:"Medical session"}],
};

const db = {
  async get(table,extra=""){
    try{const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc${extra}`,{headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`},signal:AbortSignal.timeout(5000)});if(!r.ok)throw new Error();return r.json();}catch{return DEMO_DATA[table]||[];}
  },
  async insert(table,data){
    try{const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}`,{method:"POST",headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(data)});return r.json();}catch{return[{...data,id:Date.now().toString(),created_at:new Date().toISOString()}];}
  },
  async update(table,id,data){
    try{const r=await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,{method:"PATCH",headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify(data)});return r.json();}catch{return[data];}
  },
  async delete(table,id){
    try{await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`,{method:"DELETE",headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`}});}catch{}
  }
};

// ─── SUPABASE AUTH ───────────────────────────────────────────────────────────
const auth = {
  async signIn(email, password) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.error) return null;
      return data; // contains access_token and user
    } catch { return null; }
  },
  async signOut(accessToken) {
    try {
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${accessToken}` },
      });
    } catch {}
  }
};

// ─── STORAGE UPLOAD ───────────────────────────────────────────────────────────
const storage = {
  async upload(bucket, file) {
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
    } catch (e) {
      console.error("Storage upload error:", e);
      return null;
    }
  },
  async remove(bucket, url) {
    try {
      const path = url.split(`/object/public/${bucket}/`)[1];
      if (!path) return;
      await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
        method: "DELETE",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      });
    } catch (e) { console.error("Storage delete error:", e); }
  }
};

// ─── FILE UPLOAD FIELD COMPONENT ──────────────────────────────────────────────
function FileUploadField({ label, value, onChange, accept, bucket, optional, multiple=false, onMultiple }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [preview, setPreview] = useState(value || "");
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);

    if (multiple && onMultiple) {
      // Upload all files and return array of URLs
      const urls = [];
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`Se încarcă ${i+1} din ${files.length}...`);
        const url = await storage.upload(bucket, files[i]);
        if (url) urls.push({ url, name: files[i].name });
      }
      setUploading(false);
      setUploadProgress("");
      if (urls.length > 0) onMultiple(urls);
    } else {
      const file = files[0];
      const url = await storage.upload(bucket, file);
      setUploading(false);
      if (url) { setPreview(url); onChange(url); }
      else alert("Upload failed. Please try again.");
    }
  };

  const handleClear = () => { setPreview(""); onChange(null); if (inputRef.current) inputRef.current.value = ""; };

  const isImage = accept === "image/*";
  const isPdf = accept === ".pdf,application/pdf";

  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 5 }}>
        {label} {optional && <span style={{ color: "#aaa", fontWeight: 400 }}>(opțional)</span>}
      </label>
      {preview && !multiple ? (
        <div style={{ border: "1.5px solid #ddd", borderRadius: 8, padding: 10, background: "white" }}>
          {isImage && <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 6, marginBottom: 8 }} />}
          {isPdf && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ fontSize: 24 }}>📄</span><a href={preview} target="_blank" rel="noreferrer" style={{ color: "#1a6b4a", fontSize: 13, fontWeight: 600 }}>Vezi PDF</a></div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => inputRef.current?.click()} style={{ background: "#f0f0f0", border: "1px solid #ccc", color: "#333", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Înlocuiește</button>
            <button type="button" onClick={handleClear} style={{ background: "#fdf0ee", border: "1px solid #c0392b", color: "#c0392b", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>Șterge</button>
          </div>
        </div>
      ) : (
        <div onClick={() => !uploading && inputRef.current?.click()} style={{ border: "1.5px dashed #ccc", borderRadius: 8, padding: "20px 14px", background: "#fafafa", cursor: uploading ? "wait" : "pointer", textAlign: "center", transition: "border 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "#1a6b4a"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#ccc"}
        >
          {uploading
            ? <div style={{ color: "#888", fontSize: 13 }}>⏳ {uploadProgress || "Se încarcă..."}</div>
            : <div>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{isImage ? "🖼" : "📄"}</div>
                <div style={{ fontSize: 13, color: "#888" }}>Click pentru a încărca {isImage ? (multiple ? "imagini" : "imagine") : "PDF"}</div>
                <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>{isImage ? (multiple ? "JPG, PNG, WEBP — selectați mai multe" : "JPG, PNG, WEBP") : "PDF"}</div>
              </div>
          }
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  ro:{
    orgName:"Alianța pentru Boli Hepatice Rare",
    nav:{home:"Acasă",about:"Despre Noi",activitati:"Activități",events:"Evenimente",gallery:"Galerie",resurse:"Resurse",news:"Știri",research:"Cercetare",education:"Educație",contact:"Contact",profile:"Profilul Meu",login:"Autentificare",logout:"Deconectare",admin:"Admin",member:"Devino Membru"},
    home:{hero:"Împreună pentru sănătate hepatică",sub:"Susținem pacienții și familiile afectate de boli hepatice rare din Republica Moldova prin educație, cercetare și comunitate.",cta:"Despre Noi",member:"Devino Membru",recentNews:"Ultimele Știri",newsSubtitle:"Rămâneți la curent cu noutățile ABHR",allNews:"Toate Știrile ↗",upcomingEvents:"Evenimente",eventsSubtitle:"Evenimente și activități ABHR",allEvents:"Toate Evenimentele ↗"},
    news:{title:"Știri",subtitle:"Noutăți și anunțuri de la ABHR",noNews:"Nu există știri disponibile.",readMore:"Citește mai mult ↗",back:"← Înapoi la Știri"},
    events:{title:"Evenimente",subtitle:"Evenimente și activități organizate de ABHR",noEvents:"Nu există evenimente.",back:"← Înapoi la Evenimente",ongoing:"În desfășurare",upcoming:"Urmează",past:"Trecut",location:"Locație",agenda:"Agendă (PDF)",speakers:"Vorbitori",gallery:"Galerie Foto",viewGallery:"Vezi galeria ↗",details:"Detalii"},
    gallery:{title:"Galerie",subtitle:"Fotografii din evenimentele ABHR",noPhotos:"Nu există fotografii.",back:"← Înapoi la albume"},
    research:{title:"Cercetare",subtitle:"Articole și studii despre bolile hepatice rare",noPosts:"Nu există articole.",back:"← Înapoi la Cercetare"},
    education:{title:"Educație",subtitle:"Resurse educaționale pentru pacienți și familii",noPosts:"Nu există materiale.",back:"← Înapoi la Educație"},
    profile:{title:"Profilul Meu",name:"Nume",memberId:"Număr Membru",joinDate:"Data Înscrierii",email:"Email",certs:"Certificate de Participare",noCerts:"Nu există certificate.",download:"Descarcă PDF",view:"Vezi"},
    login:{title:"Autentificare Membri",cardLabel:"Număr Card Membru / Email Admin",passLabel:"Parolă",btn:"Autentificare",error:"Date incorecte.",forgot:"Ați uitat parola? Contactați administratorul."},
    member:{title:"Solicită Cardul de Membru",subtitle:"Completați formularul și administratorul vă va contacta.",name:"Nume complet *",email:"Adresă email *",phone:"Număr de telefon",city:"Oraș / Localitate",message:"Mesaj sau informații suplimentare...",submit:"Trimite Cererea ↗",sent:"Cerere trimisă!",sentDesc:"Administratorul ABHR va procesa cererea și vă va contacta în curând.",again:"Trimite altă cerere",benefits:["Certificate de participare","Resurse educaționale exclusive","Comunitate de suport","Invitații la conferințe"],join:"Alătură-te Nouă",required:"* Câmpuri obligatorii."},
    faq:{title:"Întrebări Frecvente",subtitle:"Aveți întrebări despre ABHR?",desc:"Găsiți răspunsuri la cele mai frecvente întrebări despre organizația noastră.",notFound:"Nu găsiți răspunsul?",notFoundDesc:"Contactați-ne direct și vă vom răspunde în cel mai scurt timp.",contact:"Contactați-ne ↗",
      items:[
        {q:"Cine poate deveni membru ABHR?",a:"Orice persoană diagnosticată cu o boală hepatică rară sau aparținătorul acesteia poate deveni membru ABHR. Acceptăm și profesioniști medicali și cercetători interesați de domeniu."},
        {q:"Ce beneficii am ca membru?",a:"Membrii ABHR beneficiază de acces la resurse educaționale, certificate de participare la evenimente, invitații prioritare la conferințe și suport din partea comunității noastre."},
        {q:"Cum pot obține cardul de membru?",a:"După completarea formularului de înscriere, administratorul va procesa cererea și vă va contacta cu detaliile cardului de membru în termen de 7-14 zile lucrătoare."},
        {q:"Sunt activitățile ABHR gratuite?",a:"Majoritatea activităților și resurselor ABHR sunt gratuite pentru membri. Unele evenimente speciale pot implica o taxă simbolică pentru acoperirea costurilor de organizare."},
        {q:"Cum pot accesa profilul meu de membru?",a:"Vă puteți autentifica pe site folosind numărul cardului de membru și parola setată la înregistrare. Din profilul personal puteți vedea certificatele de participare."},
      ]
    },
    stats:[{v:"120+",l:"Membri Activi",i:"👥",t:120},{v:"24",l:"Evenimente Organizate",i:"📅",t:24},{v:"48",l:"Articole Publicate",i:"📰",t:48},{v:"6+",l:"Ani de Activitate",i:"🏆",t:6}],
    about:{label:"Despre Noi",title:"Împreună pentru sănătate hepatică în Moldova",body:"ABHR este o organizație dedicată sprijinirii pacienților cu boli hepatice rare și familiilor acestora. Ne angajăm să oferim informații, resurse și suport comunității noastre.",cta:"Citește Mai Mult ↗",features:[{icon:"🔬",t:"Cercetare Medicală",d:"Susținem cercetarea în domeniul bolilor hepatice rare din Moldova."},{icon:"🤝",t:"Suport Comunitar",d:"Oferim sprijin emoțional și practic pacienților și familiilor lor."},{icon:"📚",t:"Educație & Informare",d:"Publicăm resurse educaționale pentru pacienți și profesioniști."},{icon:"🌍",t:"Advocacy",d:"Reprezentăm interesele pacienților la nivel național."}]},
    footer:"© 2025 Alianța pentru Boli Hepatice Rare. Toate drepturile rezervate.",
    contact:{
      title:"Contact",
      subtitle:"Luați legătura cu noi",
      email:"Email",
      phone:"Telefon",
      social:"Rețele Sociale",
      emailVal:"contact@abhr.md",
      phoneVal:"+373 79682161",
      facebookLabel:"Alianța pentru Boli Hepatice Rare din Moldova",
      address:"Republica Moldova",
      writeUs:"Scrieți-ne",
      writeUsDesc:"Aveti întrebări sau doriți să aflați mai multe despre activitățile noastre? Nu ezitați să ne contactați.",
      followUs:"Urmăriți-ne",
    },
    loading:"Se încarcă...",
    admin:{title:"Panou Administrare",tabs:{members:"Membri",news:"Știri",events:"Evenimente",gallery:"Galerie",research:"Cercetare",education:"Educație"},addMember:"Adaugă Membru",addNews:"Adaugă Știre",addEvent:"Adaugă Eveniment",addAlbum:"Adaugă Album",addPost:"Adaugă Articol",save:"Salvează",cancel:"Anulează",delete:"Șterge",edit:"Editează",managePhotos:"Fotografii",manageCerts:"Certificate",addCert:"Adaugă Certificat",fields:{name:"Nume",card_number:"Număr Card",email:"Email",join_date:"Data Înscrierii",password:"Parolă",title_ro:"Titlu (RO) *",title_en:"Titlu (EN) *",body_ro:"Conținut (RO)",body_en:"Conținut (EN)",image_url:"URL Imagine",date:"Data",location_ro:"Locație (RO)",location_en:"Locație (EN)",desc_ro:"Descriere (RO)",desc_en:"Descriere (EN)",status:"Status *",agenda_url:"URL Agendă PDF (opțional)",speakers_image_url:"URL Imagine Vorbitori (opțional)",album_id:"ID Album Galerie (opțional)",albumNameRo:"Nume Album (RO)",albumNameEn:"Nume Album (EN)",coverUrl:"URL Copertă",photoUrl:"URL Fotografie",captionRo:"Legendă (RO)",captionEn:"Legendă (EN)",cert_image_url:"URL Certificat",event_id:"Eveniment"}},
  },
  en:{
    orgName:"Alliance for Rare Hepatic Diseases",
    nav:{home:"Home",about:"About Us",activitati:"Activities",events:"Events",gallery:"Gallery",resurse:"Resources",news:"News",research:"Research",education:"Education",contact:"Contact",profile:"My Profile",login:"Login",logout:"Logout",admin:"Admin",member:"Become a Member"},
    home:{hero:"Together for Hepatic Health",sub:"We support patients and families affected by rare liver diseases in the Republic of Moldova through education, research and community.",cta:"About Us",member:"Become a Member",recentNews:"Latest News",newsSubtitle:"Stay up to date with ABHR news",allNews:"All News ↗",upcomingEvents:"Events",eventsSubtitle:"Events and activities organized by ABHR",allEvents:"All Events ↗"},
    news:{title:"News",subtitle:"News and announcements from ABHR",noNews:"No news available.",readMore:"Read more ↗",back:"← Back to News"},
    events:{title:"Events",subtitle:"Events and activities organized by ABHR",noEvents:"No events available.",back:"← Back to Events",ongoing:"Ongoing",upcoming:"Upcoming",past:"Past",location:"Location",agenda:"Agenda (PDF)",speakers:"Speakers",gallery:"Photo Gallery",viewGallery:"View gallery ↗",details:"Details"},
    gallery:{title:"Gallery",subtitle:"Photos from ABHR events",noPhotos:"No photos available.",back:"← Back to albums"},
    research:{title:"Research",subtitle:"Articles and studies on rare liver diseases",noPosts:"No articles available.",back:"← Back to Research"},
    education:{title:"Education",subtitle:"Educational resources for patients and families",noPosts:"No materials available.",back:"← Back to Education"},
    profile:{title:"My Profile",name:"Name",memberId:"Member Number",joinDate:"Join Date",email:"Email",certs:"Participation Certificates",noCerts:"No certificates available.",download:"Download PDF",view:"View"},
    login:{title:"Member Login",cardLabel:"Member Card Number / Admin Email",passLabel:"Password",btn:"Login",error:"Incorrect credentials.",forgot:"Forgot your password? Contact the administrator."},
    member:{title:"Request Member Card",subtitle:"Fill the form and the administrator will contact you.",name:"Full name *",email:"Email address *",phone:"Phone number",city:"City / Locality",message:"Message or additional information...",submit:"Send Request ↗",sent:"Request sent!",sentDesc:"The ABHR administrator will process your request and contact you soon.",again:"Send another request",benefits:["Participation certificates","Exclusive educational resources","Support community","Conference invitations"],join:"Join Us",required:"* Required fields."},
    faq:{title:"FAQ",subtitle:"Do you have questions about ABHR?",desc:"Find answers to the most frequently asked questions about our organization.",notFound:"Can't find the answer?",notFoundDesc:"Contact us directly and we will respond as soon as possible.",contact:"Contact us ↗",
      items:[
        {q:"Who can become an ABHR member?",a:"Any person diagnosed with a rare liver disease or their caregiver can become an ABHR member. We also accept medical professionals and researchers interested in the field."},
        {q:"What benefits do I get as a member?",a:"ABHR members benefit from access to educational resources, participation certificates at events, priority invitations to conferences and support from our community."},
        {q:"How can I get a member card?",a:"After completing the registration form, the administrator will process your request and contact you with member card details within 7-14 working days."},
        {q:"Are ABHR activities free?",a:"Most ABHR activities and resources are free for members. Some special events may involve a symbolic fee to cover organization costs."},
        {q:"How can I access my member profile?",a:"You can log in to the website using your member card number and the password set at registration. From your personal profile you can view participation certificates."},
      ]
    },
    stats:[{v:"120+",l:"Active Members",i:"👥",t:120},{v:"24",l:"Events Organized",i:"📅",t:24},{v:"48",l:"Articles Published",i:"📰",t:48},{v:"6+",l:"Years of Activity",i:"🏆",t:6}],
    about:{label:"About Us",title:"Together for hepatic health in Moldova",body:"ABHR is an organization dedicated to supporting patients with rare liver diseases and their families. We are committed to providing information, resources and support to our community.",cta:"Read More ↗",features:[{icon:"🔬",t:"Medical Research",d:"We support research in rare liver diseases in Moldova."},{icon:"🤝",t:"Community Support",d:"We provide emotional and practical support to patients and families."},{icon:"📚",t:"Education & Information",d:"We publish educational resources for patients and professionals."},{icon:"🌍",t:"Advocacy",d:"We represent patient interests at the national level."}]},
    footer:"© 2025 Alliance for Rare Hepatic Diseases. All rights reserved.",
    contact:{
      title:"Contact",
      subtitle:"Get in touch with us",
      email:"Email",
      phone:"Phone",
      social:"Social Media",
      emailVal:"contact@abhr.md",
      phoneVal:"+373 79682161",
      facebookLabel:"Alliance for Rare Hepatic Diseases from Moldova",
      address:"Republic of Moldova",
      writeUs:"Write to us",
      writeUsDesc:"Do you have questions or want to learn more about our activities? Don't hesitate to contact us.",
      followUs:"Follow us",
    },
    loading:"Loading...",
    admin:{title:"Admin Panel",tabs:{members:"Members",news:"News",events:"Events",gallery:"Gallery",research:"Research",education:"Education"},addMember:"Add Member",addNews:"Add News",addEvent:"Add Event",addAlbum:"Add Album",addPost:"Add Article",save:"Save",cancel:"Cancel",delete:"Delete",edit:"Edit",managePhotos:"Photos",manageCerts:"Certificates",addCert:"Add Certificate",fields:{name:"Name",card_number:"Card Number",email:"Email",join_date:"Join Date",password:"Password",title_ro:"Title (RO) *",title_en:"Title (EN) *",body_ro:"Content (RO)",body_en:"Content (EN)",image_url:"Image URL",date:"Date",location_ro:"Location (RO)",location_en:"Location (EN)",desc_ro:"Description (RO)",desc_en:"Description (EN)",status:"Status *",agenda_url:"Agenda PDF URL (optional)",speakers_image_url:"Speakers Image URL (optional)",album_id:"Gallery Album ID (optional)",albumNameRo:"Album Name (RO)",albumNameEn:"Album Name (EN)",coverUrl:"Cover URL",photoUrl:"Photo URL",captionRo:"Caption (RO)",captionEn:"Caption (EN)",cert_image_url:"Certificate Image URL",event_id:"Event"}},
  }
};

// ─── SHARED DESIGN COMPONENTS ─────────────────────────────────────────────────
function WavyBg({color="rgba(255,255,255,0.06)"}) {
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.5,pointerEvents:"none"}} viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,150 C200,50 400,250 600,150 C800,50 1000,250 1200,150 C1350,80 1420,120 1440,100 L1440,0 L0,0 Z" fill={color}/>
      <path d="M0,300 C180,200 360,400 540,300 C720,200 900,400 1080,300 C1260,200 1380,350 1440,280 L1440,600 L0,600 Z" fill={color}/>
      <circle cx="100" cy="100" r="60" fill={color} opacity="0.3"/>
      <circle cx="1300" cy="500" r="80" fill={color} opacity="0.2"/>
    </svg>
  );
}

function PageHero({title, subtitle, dark=false}) {
  return (
    <section style={{background:dark?`linear-gradient(145deg,${PURE_GREEN_DARK},${PURE_GREEN_MID})`:`linear-gradient(145deg,${GREEN_DARK},${GREEN_MID})`,padding:"120px 32px 80px",position:"relative",overflow:"hidden",marginTop:0}}>
      <WavyBg/>
      <div style={{maxWidth:1200,margin:"0 auto",position:"relative",zIndex:2}}>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(32px,5vw,60px)",color:"white",margin:"0 0 16px",fontWeight:700,lineHeight:1.1}}>{title}</h1>
        {subtitle && <p style={{color:"rgba(255,255,255,0.7)",fontSize:18,maxWidth:600,lineHeight:1.7,margin:0}}>{subtitle}</p>}
      </div>
      <div style={{position:"absolute",bottom:-2,left:0,right:0}}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{display:"block",width:"100%",height:60}}>
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8f9fa"/>
        </svg>
      </div>
    </section>
  );
}

function SectionLabel({children}) {
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:8,marginBottom:16}}>
      <span style={{color:GREEN_ACCENT,fontSize:16}}>✦</span>
      <span style={{color:GREEN,fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}>{children}</span>
    </div>
  );
}

function SectionTitle({children}) {
  return <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(26px,3.5vw,40px)",color:"#1a1a1a",margin:"0 0 48px",lineHeight:1.2}}>{children}</h2>;
}

function BackBtn({onClick,label}) {
  return (
    <button onClick={onClick} style={{background:"transparent",border:"none",color:GREEN,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:"0 0 32px",display:"flex",alignItems:"center",gap:8,transition:"gap 0.2s"}}
      onMouseEnter={e=>e.currentTarget.style.gap="12px"}
      onMouseLeave={e=>e.currentTarget.style.gap="8px"}
    >{label}</button>
  );
}

function PillBtn({children, onClick, variant="primary", small=false}) {
  const styles = {
    primary:{background:GREEN_ACCENT,color:"white",border:"none",boxShadow:"0 4px 16px rgba(46,204,138,0.35)"},
    outline:{background:"transparent",color:GREEN,border:`2px solid ${GREEN}`},
    ghost:{background:"rgba(255,255,255,0.1)",color:"white",border:"1px solid rgba(255,255,255,0.25)"},
    dark:{background:GREEN,color:"white",border:"none",boxShadow:`0 4px 16px rgba(26,107,74,0.3)`},
  };
  const s = styles[variant]||styles.primary;
  return (
    <button onClick={onClick} style={{...s,padding:small?"8px 20px":"14px 32px",borderRadius:50,fontSize:small?13:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:8,transition:"all 0.25s",whiteSpace:"nowrap"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.opacity="0.92";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.opacity="1";}}
    >{children}</button>
  );
}

function StatusBadge({status}) {
  const {lang} = useLang();
  const t = T[lang].events;
  const styles = {ongoing:{bg:"#fff8e1",color:"#f59e0b",border:"#fcd34d"},upcoming:{bg:GREEN_LIGHT,color:GREEN,border:GREEN_ACCENT},past:{bg:"#f0f0f0",color:"#666",border:"#ccc"}};
  const s = styles[status]||styles.past;
  const label = t[status]||status;
  return <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:20,padding:"4px 14px",fontSize:11,fontWeight:700,letterSpacing:0.5}}>{label}</span>;
}

function ContentCard({item, onClick, type="news"}) {
  const {lang} = useLang();
  const title = lang==="ro"?item.title_ro:item.title_en;
  const body = lang==="ro"?(item.body_ro||item.desc_ro):(item.body_en||item.desc_en);
  const t = T[lang];
  return (
    <div onClick={onClick} style={{background:"white",borderRadius:20,overflow:"hidden",cursor:"pointer",transition:"all 0.3s",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow="0 20px 60px rgba(0,0,0,0.1)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.06)";}}
    >
      {item.image_url
        ? <img src={item.image_url} alt={title} style={{width:"100%",height:200,objectFit:"cover"}}/>
        : <div style={{height:8,background:`linear-gradient(90deg,${GREEN_DARK},${GREEN_MID})`}}/>
      }
      <div style={{padding:28}}>
        <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14}}>
          {item.date&&<span style={{fontSize:12,color:"#999",fontWeight:600}}>{item.date}</span>}
          {type==="event"&&<StatusBadge status={item.status}/>}
        </div>
        <h3 style={{fontFamily:"Georgia,serif",fontSize:19,color:"#1a1a1a",margin:"0 0 12px",lineHeight:1.3}}>{title}</h3>
        {body&&<p style={{color:"#666",fontSize:14,lineHeight:1.7,margin:"0 0 20px"}}>{body.split("\n").join(" ").slice(0,120)}{body.length>120?"…":""}</p>}
        {type==="event"&&item.location_ro&&<div style={{fontSize:13,color:"#888",marginBottom:16}}>📍 {lang==="ro"?item.location_ro:item.location_en}</div>}
        <span style={{color:GREEN,fontSize:13,fontWeight:700}}>{type==="event"?t.events.details+" ↗":t.news.readMore}</span>
      </div>
    </div>
  );
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
const LOGO_HORIZ_WHITE = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MjAgMjQwIj4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiAjZTIyMzFkOwogICAgICB9CgogICAgICAuY2xzLTEsIC5jbHMtMiwgLmNscy0zIHsKICAgICAgICBzdHJva2Utd2lkdGg6IDBweDsKICAgICAgfQoKICAgICAgLmNscy0yIHsKICAgICAgICBmaWxsOiAjZmZmOwogICAgICB9CgogICAgICAuY2xzLTMgewogICAgICAgIGZpbGw6ICMwNDY3NDg7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxnPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtMzA2LjkxLDEwMC44NmM5Ljc3LDAsMTQuNDEsNC41NywxNC40MSwxMS4yOCwwLDQuOTUtMi41Nyw4LjcxLTcuMjcsMTAuNHYuMTNjNC45NSwxLjI1LDguMjEsNS4yLDguMjEsMTAuNTMsMCw3LjQ2LTUuMjYsMTIuMjgtMTQuMzUsMTIuMjhoLTE0Ljg1di00NC42MWgxMy44NVptLTkuNzcsMjAuMDVoOS4yMWM3LjgzLDAsMTAuODQtMy4zOCwxMC44NC04LjIxLDAtNS4yLTMuMTMtOC4yNy0xMC42NS04LjI3aC05LjR2MTYuNDhabTAsMjAuOTloMTAuMjhjNy4wMiwwLDEwLjU5LTMuMDcsMTAuNTktOC43NywwLTUuMjYtMy4zOC04LjY1LTExLjY1LTguNjVoLTkuMjF2MTcuNDJaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im0zNTcuNDEsMTI5LjU2YzAsMTAuNC01LjUxLDE2LjczLTE0LjU0LDE2Ljczcy0xNC41NC02LjMzLTE0LjU0LTE2LjczLDUuNTEtMTYuNzMsMTQuNTQtMTYuNzMsMTQuNTQsNi4zMywxNC41NCwxNi43M1ptLTI1LDBjMCw4LjI3LDMuODgsMTMuMzUsMTAuNDYsMTMuMzVzMTAuNTMtNS4wOCwxMC41My0xMy4zNS0zLjk1LTEzLjM0LTEwLjUzLTEzLjM0LTEwLjQ2LDUuMDctMTAuNDYsMTMuMzRaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im0zNjUuMzEsMTQ1LjQ3di00NC42MWgzLjg4djQ0LjYxaC0zLjg4WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtMzc4Ljg0LDEwNi4zOHYtNS41MWgzLjg4djUuNTFoLTMuODhabTAsMzkuMXYtMzEuODNoMy44OHYzMS44M2gtMy44OFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTQzOC45MywxNDUuNDd2LTIxLjNoLTI1djIxLjNoLTQuMDd2LTQ0LjYxaDQuMDd2MTkuNjFoMjV2LTE5LjYxaDQuMDd2NDQuNjFoLTQuMDdaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im00NzUuNzEsMTM2LjAxaDQuMDFjLTEsNS40NS01LjQ1LDEwLjI4LTEzLjQ3LDEwLjI4LTkuMDksMC0xNC41NC02Ljc3LTE0LjU0LTE3LjI5LDAtOS40LDUuMzMtMTYuMTYsMTQuMjktMTYuMTYsNy4xNCwwLDEyLjA5LDQuMzIsMTMuNDcsMTEuMzQuMzgsMS42OS41LDMuODIuNSw2LjE0aC0yNC4zMWMuMTksOC40Niw0LjcsMTIuNjYsMTAuNTksMTIuNjYsNS4yLDAsOC41Mi0yLjg4LDkuNDYtNi45NlptLTE5Ljk5LTguOWgyMC40OWMtLjQ0LTcuMDgtNC41MS0xMC45Ny0xMC4yMS0xMC45N3MtOS45LDQuMTQtMTAuMjgsMTAuOTdaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im01MTUuMjUsMTI5LjQ5YzAsMTAuMTUtNS4yLDE2LjY3LTEzLjQxLDE2LjY3LTQuNTcsMC04LjM5LTIuMTktMTAuMDMtNS41MWgtLjEydjE2LjQxaC0zLjg4di00My40MmgzLjg4djQuN2guMTJjMS42My0zLjI2LDUuNDUtNS41MSwxMC4wMy01LjUxLDguMjEsMCwxMy40MSw2LjUyLDEzLjQxLDE2LjY3Wm0tMjMuNzUsMGMwLDguMTQsMy44MiwxMy40MSw5LjcxLDEzLjQxczkuOTYtNS4yNiw5Ljk2LTEzLjQxLTMuODgtMTMuNDEtOS45Ni0xMy40MS05LjcxLDUuMjYtOS43MSwxMy40MVoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTU0Ni4yNywxMjUuMDV2MTIuNTljMCwzLjI2LjMxLDYuMDIuNjksNy44M2gtMy42M2MtLjMxLTEuNS0uNDQtMy4zOC0uNDQtNC44MmgtLjEzYy0yLjA3LDMuNDUtNS43Niw1LjQ1LTExLjM0LDUuNDUtNi41MiwwLTEwLjc4LTMuODItMTAuNzgtOS4xNXMyLjk1LTguMzMsMTIuMDktOS43N2MyLjk1LS41LDYuOTYtLjk0LDkuNzctMS4xM3YtMS41YzAtNS45NS0zLjM4LTguNC04LjE0LTguNC01LjM5LDAtOC4wOCwyLjk1LTguMzMsNy4wOGgtNC4wN2MuMzctNS45NSw0LjctMTAuNCwxMi40LTEwLjQsNy4xNCwwLDExLjksMy44MiwxMS45LDEyLjIyWm0tMy43Niw0LjI2Yy0yLjY5LjE5LTYuNTguNjktOS4yNywxLjEzLTYuMzkuOTQtOC40NiwyLjc2LTguNDYsNi4yNywwLDMuNywyLjc2LDYuMTQsNy40Niw2LjE0LDIuOTUsMCw1LjU4LTEsNy4zMy0yLjgyLDIuMTMtMi4yNiwyLjk1LTQuMDEsMi45NS04LjI3di0yLjQ0WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNTY3LjgyLDE0Mi4wM3YzLjMyYy0uODEuMTktMS45NC4zMS0yLjg4LjMxLTUuNDUsMC03Ljc3LTIuNDQtNy43Ny04LjU4di0yMC4xOGgtNS43di0zLjI2aDUuN3YtNy4zOWgzLjg4djcuMzloNi40NXYzLjI2aC02LjQ1djIwLjExYzAsMy43NiwxLjI1LDUuMjYsNC41Nyw1LjI2LjgxLDAsMS42OS0uMTIsMi4xOS0uMjVaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im01NzQuNCwxMDYuMzh2LTUuNTFoMy44OHY1LjUxaC0zLjg4Wm0wLDM5LjF2LTMxLjgzaDMuODh2MzEuODNoLTMuODhaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im02MTMuMzcsMTI0LjYxaC00LjA3Yy0uMzctNC44OS0zLjk1LTguMzktOC44My04LjM5LTYuMzksMC0xMC4yMSw1LjA3LTEwLjIxLDEzLjM0czMuODIsMTMuMzUsMTAuMjEsMTMuMzVjNC44OSwwLDguNC00LjAxLDguODMtOC43N2g0LjA3Yy0uNTYsNi44OS01LjUxLDEyLjE1LTEyLjkxLDEyLjE1LTguOSwwLTE0LjQxLTYuMzMtMTQuNDEtMTYuNzNzNS41MS0xNi43MywxNC40MS0xNi43M2M3LjIxLDAsMTIuMzQsNC44MiwxMi45MSwxMS43OFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTY0My4wMSwxMzYuMDFoNC4wMWMtMSw1LjQ1LTUuNDUsMTAuMjgtMTMuNDcsMTAuMjgtOS4wOSwwLTE0LjU0LTYuNzctMTQuNTQtMTcuMjksMC05LjQsNS4zMy0xNi4xNiwxNC4yOS0xNi4xNiw3LjE0LDAsMTIuMDksNC4zMiwxMy40NywxMS4zNC4zOCwxLjY5LjUsMy44Mi41LDYuMTRoLTI0LjMxYy4xOSw4LjQ2LDQuNywxMi42NiwxMC41OSwxMi42Niw1LjIsMCw4LjUyLTIuODgsOS40Ni02Ljk2Wm0tMTkuOTktOC45aDIwLjQ5Yy0uNDQtNy4wOC00LjUxLTEwLjk3LTEwLjIxLTEwLjk3cy05LjksNC4xNC0xMC4yOCwxMC45N1oiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTY4NS4wNSwxMDAuODZjMTAuNTMsMCwxNS4yOSw0LjQ1LDE1LjI5LDExLjksMCw1Ljc2LTMuNDUsMTAuMTUtOC42NCwxMS4yMnYuMTJjMy4zMiwxLDQuNywyLjg4LDYuNjQsOC4zM2w0LjcsMTMuMDNoLTQuNDVsLTQuMjYtMTIuNGMtMS45NC01LjU4LTQuMTMtNy4yNy05LjA5LTcuMjdoLTkuMjF2MTkuNjdoLTQuMDd2LTQ0LjYxaDEzLjA5Wm0tOS4wMiwyMS4yNGg5LjI3YzcuNTgsMCwxMC45LTQuMDEsMTAuODQtOS4yNywwLTUuNjQtNC4wMS04LjI3LTExLjE1LTguMjdoLTguOTZ2MTcuNTRaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im03MzIuOTMsMTI1LjA1djEyLjU5YzAsMy4yNi4zMSw2LjAyLjY5LDcuODNoLTMuNjNjLS4zMS0xLjUtLjQ0LTMuMzgtLjQ0LTQuODJoLS4xM2MtMi4wNywzLjQ1LTUuNzYsNS40NS0xMS4zNCw1LjQ1LTYuNTIsMC0xMC43OC0zLjgyLTEwLjc4LTkuMTVzMi45NS04LjMzLDEyLjA5LTkuNzdjMi45NS0uNSw2Ljk2LS45NCw5Ljc3LTEuMTN2LTEuNWMwLTUuOTUtMy4zOC04LjQtOC4xNC04LjQtNS4zOSwwLTguMDgsMi45NS04LjMzLDcuMDhoLTQuMDdjLjM3LTUuOTUsNC43LTEwLjQsMTIuNC0xMC40LDcuMTQsMCwxMS45LDMuODIsMTEuOSwxMi4yMlptLTMuNzYsNC4yNmMtMi42OS4xOS02LjU4LjY5LTkuMjcsMS4xMy02LjM5Ljk0LTguNDYsMi43Ni04LjQ2LDYuMjcsMCwzLjcsMi43Niw2LjE0LDcuNDYsNi4xNCwyLjk1LDAsNS41OC0xLDcuMzMtMi44MiwyLjEzLTIuMjYsMi45NS00LjAxLDIuOTUtOC4yN3YtMi40NFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTc1OC4xOCwxMTMuNTh2My43Yy0uNS0uMDYtMS4zMS0uMTItMi0uMTItNi4zMywwLTkuOSw0LjEzLTkuOSwxMS41M3YxNi43OWgtMy44OHYtMzEuODNoMy44MnY1LjAxaC4xMmMyLjEzLTMuNDUsNS41MS01LjI2LDkuNzEtNS4yNi42OSwwLDEuNS4wNiwyLjEzLjE5WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNzg1LjQ5LDEzNi4wMWg0LjAxYy0xLDUuNDUtNS40NSwxMC4yOC0xMy40NywxMC4yOC05LjA5LDAtMTQuNTQtNi43Ny0xNC41NC0xNy4yOSwwLTkuNCw1LjMzLTE2LjE2LDE0LjI5LTE2LjE2LDcuMTQsMCwxMi4wOSw0LjMyLDEzLjQ3LDExLjM0LjM4LDEuNjkuNSwzLjgyLjUsNi4xNGgtMjQuMzFjLjE5LDguNDYsNC43LDEyLjY2LDEwLjU5LDEyLjY2LDUuMiwwLDguNTItMi44OCw5LjQ2LTYuOTZabS0xOS45OS04LjloMjAuNDljLS40NC03LjA4LTQuNTEtMTAuOTctMTAuMjEtMTAuOTdzLTkuOSw0LjE0LTEwLjI4LDEwLjk3WiIvPgogIDwvZz4KICA8Zz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTMxNC44NywyMTMuNDZ2LTQuODJoLS4xMmMtMS42MywzLjMyLTUuNDUsNS41MS0xMC4wMyw1LjUxLTguMjEsMC0xMy40MS02LjUyLTEzLjQxLTE2LjY3czUuMi0xNi42NywxMy40MS0xNi42N2M0LjU3LDAsOC40LDIuMTksMTAuMDMsNS41MWguMTJ2LTE3LjQ4aDMuODh2NDQuNjFoLTMuODhabS0xOS40OC0xNS45OGMwLDguMTQsMy44OCwxMy40MSw5Ljk2LDEzLjQxczkuNzEtNS4yNiw5LjcxLTEzLjQxLTMuODItMTMuNDEtOS43MS0xMy40MS05Ljk2LDUuMjYtOS45NiwxMy40MVoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTMyOC40NywxNzQuMzZ2LTUuNTFoMy44OHY1LjUxaC0zLjg4Wm0wLDM5LjF2LTMxLjgzaDMuODh2MzEuODNoLTMuODhaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im0zNjcuMTksMTk0LjF2MTkuMzZoLTMuODh2LTE5LjE3YzAtNy41Mi0zLjA3LTkuOTYtOC4xNC05Ljk2cy05LjI3LDMuNTctOS4yNywxMC4yN3YxOC44NmgtMy44OHYtMzEuODNoMy44MnY0LjMyaC4xMmMxLjk0LTMuMDEsNS41MS01LjAxLDkuOS01LjAxLDcuMzMsMCwxMS4zNCw0LjM5LDExLjM0LDEzLjE2WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNDM0LjIzLDIxMy40NnYtMjIuODdjMC01Ljc2LDAtMTEuNTMuMDYtMTcuMjloLS4xMmMtMi4zMiw1Ljg5LTQuNTEsMTEuNTktNi43NywxNy40MmwtOC45LDIyLjc0aC00Ljc2bC04Ljg0LTIyLjc0Yy0yLjI1LTUuODMtNC41MS0xMS41My02Ljc3LTE3LjQyaC0uMTJjLjA2LDUuNzYuMDYsMTEuNTMuMDYsMTcuMjl2MjIuODdoLTQuMDd2LTQ0LjYxaDYuNThsOC44MywyMi44MSw2LjY0LDE3LjQyaC4xM2MyLjE5LTUuNzcsNC41MS0xMS43Miw2LjctMTcuNDJsOC44My0yMi44MWg2LjU4djQ0LjYxaC00LjA3WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNDc2LjE1LDE5Ny41NGMwLDEwLjQtNS41MSwxNi43My0xNC41NCwxNi43M3MtMTQuNTQtNi4zMy0xNC41NC0xNi43Myw1LjUxLTE2LjczLDE0LjU0LTE2LjczLDE0LjU0LDYuMzMsMTQuNTQsMTYuNzNabS0yNSwwYzAsOC4yNywzLjg4LDEzLjM1LDEwLjQ2LDEzLjM1czEwLjUzLTUuMDgsMTAuNTMtMTMuMzUtMy45NS0xMy4zNC0xMC41My0xMy4zNC0xMC40Niw1LjA3LTEwLjQ2LDEzLjM0WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNDg0LjA1LDIxMy40NnYtNDQuNjFoMy44OHY0NC42MWgtMy44OFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTUxOS4zOSwyMTMuNDZ2LTQuODJoLS4xMmMtMS42MywzLjMyLTUuNDUsNS41MS0xMC4wMyw1LjUxLTguMjEsMC0xMy40MS02LjUyLTEzLjQxLTE2LjY3czUuMi0xNi42NywxMy40MS0xNi42N2M0LjU3LDAsOC40LDIuMTksMTAuMDMsNS41MWguMTJ2LTE3LjQ4aDMuODh2NDQuNjFoLTMuODhabS0xOS40OC0xNS45OGMwLDguMTQsMy44OCwxMy40MSw5Ljk2LDEzLjQxczkuNzEtNS4yNiw5LjcxLTEzLjQxLTMuODItMTMuNDEtOS43MS0xMy40MS05Ljk2LDUuMjYtOS45NiwxMy40MVoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTU2MC4xOCwxOTcuNTRjMCwxMC40LTUuNTEsMTYuNzMtMTQuNTQsMTYuNzNzLTE0LjU0LTYuMzMtMTQuNTQtMTYuNzMsNS41MS0xNi43MywxNC41NC0xNi43MywxNC41NCw2LjMzLDE0LjU0LDE2LjczWm0tMjUsMGMwLDguMjcsMy44OCwxMy4zNSwxMC40NiwxMy4zNXMxMC41My01LjA4LDEwLjUzLTEzLjM1LTMuOTUtMTMuMzQtMTAuNTMtMTMuMzQtMTAuNDYsNS4wNy0xMC40NiwxMy4zNFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTU3NC41MywyMTMuNDZsLTExLjktMzEuODNoNC4ybDUuMDEsMTMuNzljMS43NSw0Ljg5LDMuMzgsOS4zMyw1LjE0LDE0LjI4aC4xMmMxLjc1LTQuOTUsMy4zOC05LjQsNS4xNC0xNC4yOGw1LjAxLTEzLjc5aDQuMmwtMTEuOSwzMS44M2gtNS4wMVoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTYxOS4yNywxOTMuMDN2MTIuNTljMCwzLjI2LjMxLDYuMDIuNjksNy44M2gtMy42M2MtLjMxLTEuNS0uNDQtMy4zOC0uNDQtNC44MmgtLjEzYy0yLjA3LDMuNDUtNS43Niw1LjQ1LTExLjM0LDUuNDUtNi41MiwwLTEwLjc4LTMuODItMTAuNzgtOS4xNXMyLjk1LTguMzMsMTIuMDktOS43N2MyLjk1LS41LDYuOTYtLjk0LDkuNzctMS4xM3YtMS41YzAtNS45NS0zLjM4LTguNC04LjE0LTguNC01LjM5LDAtOC4wOCwyLjk1LTguMzMsNy4wOGgtNC4wN2MuMzctNS45NSw0LjctMTAuNCwxMi40LTEwLjQsNy4xNCwwLDExLjksMy44MiwxMS45LDEyLjIyWm0tMy43Niw0LjI2Yy0yLjY5LjE5LTYuNTguNjktOS4yNywxLjEzLTYuMzkuOTQtOC40NiwyLjc2LTguNDYsNi4yNywwLDMuNywyLjc2LDYuMTQsNy40Niw2LjE0LDIuOTUsMCw1LjU4LTEsNy4zMy0yLjgyLDIuMTMtMi4yNiwyLjk1LTQuMDEsMi45NS04LjI3di0yLjQ0WiIvPgogIDwvZz4KICA8Zz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTI5Ni43LDY0LjJsLTUuNTgsMTQuNDFoLTQuMzlsMTcuNjctNDQuNjFoNS41OGwxNy42MSw0NC42MWgtNC4zOGwtNS41OC0xNC40MWgtMjAuOTNabTE3LjY3LTguMzljLTIuNDQtNi4zMy00LjctMTIuMDktNy4xNC0xOC40OGgtLjEyYy0yLjQ0LDYuMzktNC42NCwxMi4xNS03LjE0LDE4LjQ4bC0xLjgyLDQuNjNoMTcuOThsLTEuNzUtNC42M1oiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTMzMy41NCw3OC42MXYtNDQuNjFoMy44OHY0NC42MWgtMy44OFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTM0Ny4wOCwzOS41MnYtNS41MWgzLjg4djUuNTFoLTMuODhabTAsMzkuMXYtMzEuODNoMy44OHYzMS44M2gtMy44OFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTM4My45OCw1OC4xOXYxMi41OWMwLDMuMjYuMzEsNi4wMi42OSw3LjgzaC0zLjYzYy0uMzEtMS41LS40NC0zLjM4LS40NC00LjgyaC0uMTNjLTIuMDcsMy40NS01Ljc2LDUuNDUtMTEuMzQsNS40NS02LjUyLDAtMTAuNzgtMy44Mi0xMC43OC05LjE1czIuOTUtOC4zMywxMi4wOS05Ljc3YzIuOTUtLjUsNi45Ni0uOTQsOS43Ny0xLjEzdi0xLjVjMC01Ljk1LTMuMzgtOC40LTguMTQtOC40LTUuMzksMC04LjA4LDIuOTUtOC4zMyw3LjA4aC00LjA3Yy4zNy01Ljk1LDQuNy0xMC40LDEyLjQtMTAuNCw3LjE0LDAsMTEuOSwzLjgyLDExLjksMTIuMjJabS0zLjc2LDQuMjZjLTIuNjkuMTktNi41OC42OS05LjI3LDEuMTMtNi4zOS45NC04LjQ2LDIuNzYtOC40Niw2LjI3LDAsMy43LDIuNzYsNi4xNCw3LjQ2LDYuMTQsMi45NSwwLDUuNTgtMSw3LjMzLTIuODIsMi4xMy0yLjI2LDIuOTUtNC4wMSwyLjk1LTguMjd2LTIuNDRaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im00MTguNjMsNTkuMjV2MTkuMzZoLTMuODh2LTE5LjE3YzAtNy41Mi0zLjA3LTkuOTYtOC4xNC05Ljk2cy05LjI3LDMuNTctOS4yNywxMC4yN3YxOC44NmgtMy44OHYtMzEuODNoMy44MnY0LjMyaC4xMmMxLjk0LTMuMDEsNS41MS01LjAxLDkuOS01LjAxLDcuMzMsMCwxMS4zNCw0LjM5LDExLjM0LDEzLjE2WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNDQwLjEyLDc1LjE3djMuMzJjLS44MS4xOS0xLjk0LjMxLTIuODguMzEtNS40NSwwLTcuNzctMi40NC03Ljc3LTguNTh2LTIwLjE4aC01Ljd2LTMuMjZoNS43di03LjM5aDMuODh2Ny4zOWg2LjQ1djMuMjZoLTYuNDV2MjAuMTFjMCwzLjc2LDEuMjUsNS4yNiw0LjU3LDUuMjYuODEsMCwxLjY5LS4xMiwyLjE5LS4yNVptLTQuMjYsNy43MXY1LjA4bC0zLjA3LDYuMzloLTEuODJsMi4xOS02LjM5aC0xLjc2di01LjA4aDQuNDVaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im00NzAuMzksNTguMTl2MTIuNTljMCwzLjI2LjMxLDYuMDIuNjksNy44M2gtMy42M2MtLjMxLTEuNS0uNDQtMy4zOC0uNDQtNC44MmgtLjEzYy0yLjA3LDMuNDUtNS43Niw1LjQ1LTExLjM0LDUuNDUtNi41MiwwLTEwLjc4LTMuODItMTAuNzgtOS4xNXMyLjk1LTguMzMsMTIuMDktOS43N2MyLjk1LS41LDYuOTYtLjk0LDkuNzctMS4xM3YtMS41YzAtNS45NS0zLjM4LTguNC04LjE0LTguNC01LjM5LDAtOC4wOCwyLjk1LTguMzMsNy4wOGgtNC4wN2MuMzctNS45NSw0LjctMTAuNCwxMi40LTEwLjQsNy4xNCwwLDExLjksMy44MiwxMS45LDEyLjIyWm0tMy43Niw0LjI2Yy0yLjY5LjE5LTYuNTguNjktOS4yNywxLjEzLTYuMzkuOTQtOC40NiwyLjc2LTguNDYsNi4yNywwLDMuNywyLjc2LDYuMTQsNy40Niw2LjE0LDIuOTUsMCw1LjU4LTEsNy4zMy0yLjgyLDIuMTMtMi4yNiwyLjk1LTQuMDEsMi45NS04LjI3di0yLjQ0WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNTIzLjUyLDYyLjY0YzAsMTAuMTUtNS4yLDE2LjY3LTEzLjQxLDE2LjY3LTQuNTcsMC04LjM5LTIuMTktMTAuMDMtNS41MWgtLjEydjE2LjQxaC0zLjg4di00My40MmgzLjg4djQuN2guMTJjMS42My0zLjI2LDUuNDUtNS41MSwxMC4wMy01LjUxLDguMjEsMCwxMy40MSw2LjUyLDEzLjQxLDE2LjY3Wm0tMjMuNzUsMGMwLDguMTQsMy44MiwxMy40MSw5LjcxLDEzLjQxczkuOTYtNS4yNiw5Ljk2LTEzLjQxLTMuODgtMTMuNDEtOS45Ni0xMy40MS05LjcxLDUuMjYtOS43MSwxMy40MVoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTU1My40MSw2OS4xNWg0LjAxYy0xLDUuNDUtNS40NSwxMC4yOC0xMy40NywxMC4yOC05LjA5LDAtMTQuNTQtNi43Ny0xNC41NC0xNy4yOSwwLTkuNCw1LjMzLTE2LjE2LDE0LjI5LTE2LjE2LDcuMTQsMCwxMi4wOSw0LjMyLDEzLjQ3LDExLjM0LjM4LDEuNjkuNSwzLjgyLjUsNi4xNGgtMjQuMzFjLjE5LDguNDYsNC43LDEyLjY2LDEwLjU5LDEyLjY2LDUuMiwwLDguNTItMi44OCw5LjQ2LTYuOTZabS0xOS45OS04LjloMjAuNDljLS40NC03LjA4LTQuNTEtMTAuOTctMTAuMjEtMTAuOTdzLTkuOSw0LjE0LTEwLjI4LDEwLjk3WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNTkwLjY5LDU5LjI1djE5LjM2aC0zLjg4di0xOS4xN2MwLTcuNTItMy4wNy05Ljk2LTguMTQtOS45NnMtOS4yNywzLjU3LTkuMjcsMTAuMjd2MTguODZoLTMuODh2LTMxLjgzaDMuODJ2NC4zMmguMTJjMS45NC0zLjAxLDUuNTEtNS4wMSw5LjktNS4wMSw3LjMzLDAsMTEuMzQsNC4zOSwxMS4zNCwxMy4xNloiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTYxMi4xOCw3NS4xN3YzLjMyYy0uODEuMTktMS45NC4zMS0yLjg4LjMxLTUuNDUsMC03Ljc3LTIuNDQtNy43Ny04LjU4di0yMC4xOGgtNS43di0zLjI2aDUuN3YtNy4zOWgzLjg4djcuMzloNi40NXYzLjI2aC02LjQ1djIwLjExYzAsMy43NiwxLjI1LDUuMjYsNC41Nyw1LjI2LjgxLDAsMS42OS0uMTIsMi4xOS0uMjVaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im02MzQuNTUsNDYuNzJ2My43Yy0uNS0uMDYtMS4zMS0uMTItMi0uMTItNi4zMywwLTkuOSw0LjEzLTkuOSwxMS41M3YxNi43OWgtMy44OHYtMzEuODNoMy44MnY1LjAxaC4xMmMyLjEzLTMuNDUsNS41MS01LjI2LDkuNzEtNS4yNi42OSwwLDEuNS4wNiwyLjEzLjE5WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNjQwLjQ0LDY2LjE0di0xOS4zNmgzLjg4djE5LjE3YzAsNy41MiwzLjA3LDkuOTYsOC4xNCw5Ljk2czkuMjctMy41Nyw5LjI3LTEwLjI4di0xOC44NmgzLjg4djMxLjgzaC0zLjgydi00LjMyaC0uMTJjLTEuODgsMy4wMS01LjUxLDUuMDEtOS45LDUuMDEtNy4yNywwLTExLjM0LTQuMzktMTEuMzQtMTMuMTZaIi8+CiAgPC9nPgogIDxyZWN0IGNsYXNzPSJjbHMtMyIgeD0iMzAuMjQiIHk9IjIzLjQzIiB3aWR0aD0iOTEuMDkiIGhlaWdodD0iOTEuMDkiLz4KICA8cmVjdCBjbGFzcz0iY2xzLTMiIHg9IjEzMy41NiIgeT0iMjMuNDMiIHdpZHRoPSI5MS4wOSIgaGVpZ2h0PSI5MS4wOSIvPgogIDxyZWN0IGNsYXNzPSJjbHMtMyIgeD0iMzAuMjQiIHk9IjEyNS40OSIgd2lkdGg9IjkxLjA5IiBoZWlnaHQ9IjkxLjA5Ii8+CiAgPHJlY3QgY2xhc3M9ImNscy0xIiB4PSIxMzMuNTYiIHk9IjEyNS40OSIgd2lkdGg9IjkxLjA5IiBoZWlnaHQ9IjkxLjA5Ii8+CiAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNDUuMzgsMTAxLjk3bDI1LjU5LTY2aDkuNzNsMjUuNDksNjZoLTkuNTVsLTE1Ljg1LTQ0LjEzYy0uNzctMi4xNS0xLjQ5LTQuMTktMi4xNi02LjE0LS42Ni0xLjk0LTEuMy0zLjg2LTEuOTEtNS43NS0uNjEtMS44OS0xLjIzLTMuODYtMS44Ny01LjkxaDEuOTVjLS41NiwxLjkxLTEuMTQsMy44LTEuNzUsNS42Ny0uNjEsMS44Ni0xLjI4LDMuODItMi4wMiw1Ljg3LS43MywyLjA1LTEuNDksNC4xNC0yLjI2LDYuMjZsLTE2LjIyLDQ0LjEzaC05LjE4Wm0xMi4zMy0xOS4zN2wyLjc4LTcuNTFoMzEuMTVsMi42LDcuNTFoLTM2LjUyWiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTE1NC45LDEwMS45N1YzNS45N2gyOS43NmM0LDAsNy40Ni42NCwxMC4zNiwxLjkxLDIuOTEsMS4yOCw1LjE0LDMuMTIsNi42OSw1LjU0LDEuNTUsMi40MiwyLjMzLDUuMzEsMi4zMyw4LjY4cy0uNzYsNi4xMy0yLjI3LDguNTItMy43Miw0LjI1LTYuNjIsNS41N2MtMi45LDEuMzMtNi4zOSwyLjA3LTEwLjQ5LDIuMjJ2LTMuNTJjNS4xMS4zNCw5LjMyLDEuMjEsMTIuNjMsMi42MSwzLjMsMS40LDUuNzcsMy4zNiw3LjM4LDUuODcsMS42MSwyLjUyLDIuNDIsNS42NiwyLjQyLDkuNDEsMCwzLjk3LS44Niw3LjQtMi41OSwxMC4yOC0xLjcyLDIuODgtNC4yMiw1LjA5LTcuNDgsNi42MS0zLjI3LDEuNTMtNy4xNywyLjMtMTEuNzIsMi4zaC0zMC40Wm04LjYyLTQuNzNsLS43NC0yLjc4aDIxLjg4YzMsMCw1LjUxLS40NCw3LjUzLTEuMzIsMi4wMi0uODgsMy41NS0yLjE5LDQuNTctMy45MiwxLjAyLTEuNzMsMS41My0zLjg4LDEuNTMtNi40NHMtLjUyLTQuNjYtMS41NS02LjM5Yy0xLjAzLTEuNzItMi41Ni0zLjAyLTQuNTktMy44OS0yLjAzLS44Ny00LjUyLTEuMzEtNy40OS0xLjMxaC0yMi4yNXYtNy4yM2gyMC40YzIuNjcsMCw0Ljk0LS40Miw2Ljc5LTEuMjUsMS44NS0uODMsMy4yNi0yLjA1LDQuMjEtMy42NC45NS0xLjU5LDEuNDItMy41MSwxLjQyLTUuNzdzLS40NC00LTEuMzMtNS40NmMtLjg5LTEuNDYtMi4xOS0yLjU1LTMuOS0zLjI4LTEuNzItLjczLTMuODMtMS4wOS02LjM1LTEuMDloLTIxLjZsMS40OC0zLjg5djU3LjY2WiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTQ5LjY5LDIwNC4wM3YtNjZoOC42MnY2NmgtOC42MlptNC4zNS0zMS4zM3YtNy41MWg0My41N3Y3LjUxaC00My41N1ptMzkuMjEsMzEuMzN2LTY2aDguNjJ2NjZoLTguNjJaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtMTU0LjksMjA0LjAzdi02NmgyOGM0LjcxLDAsOC43NC44NiwxMi4wOSwyLjU3LDMuMzQsMS43MSw1Ljg4LDQuMDcsNy41OSw3LjA3LDEuNzEsMywyLjU3LDYuNCwyLjU3LDEwLjJzLS44Niw3LjItMi41NywxMC4yYy0xLjcxLDMtNC4yNSw1LjM1LTcuNTksNy4wNy0zLjM1LDEuNzEtNy4zNywyLjU3LTEyLjA5LDIuNTdsLTMuMjQuMTloLTE5LjQ3di03Ljg4aDIyLjUzYzIuODQsMCw1LjI1LS41MSw3LjIyLTEuNTIsMS45Ny0xLjAxLDMuNDUtMi40Myw0LjQ1LTQuMjQsMS0xLjgyLDEuNDktMy45MSwxLjQ5LTYuMjlzLS41LTQuNDgtMS40OS02LjI5Yy0xLTEuODItMi40OC0zLjIzLTQuNDUtNC4yNC0xLjk3LTEuMDEtNC4zOC0xLjUyLTcuMjItMS41MmgtMjIuNTNsMy44LTMuODl2NjIuMDJoLTkuMDhabTQxLjYyLDBsLTE5LjEtMjcuMDd2LTQuMTdoNy42bDIyLjA2LDMxLjI0aC0xMC41N1oiLz4KPC9zdmc+";
const LOGO_ICON_WHITE = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIj4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiAjZTIyMzFkOwogICAgICB9CgogICAgICAuY2xzLTEsIC5jbHMtMiwgLmNscy0zIHsKICAgICAgICBzdHJva2Utd2lkdGg6IDBweDsKICAgICAgfQoKICAgICAgLmNscy0yIHsKICAgICAgICBmaWxsOiAjZmZmOwogICAgICB9CgogICAgICAuY2xzLTMgewogICAgICAgIGZpbGw6ICMwNDY3NDg7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxyZWN0IGNsYXNzPSJjbHMtMyIgeD0iODAiIHk9IjgwLjc4IiB3aWR0aD0iMTEyLjQ1IiBoZWlnaHQ9IjExMi40NSIvPgogIDxyZWN0IGNsYXNzPSJjbHMtMyIgeD0iMjA3LjU1IiB5PSI4MC43OCIgd2lkdGg9IjExMi40NSIgaGVpZ2h0PSIxMTIuNDUiLz4KICA8cmVjdCBjbGFzcz0iY2xzLTMiIHg9IjgwIiB5PSIyMDYuNzgiIHdpZHRoPSIxMTIuNDUiIGhlaWdodD0iMTEyLjQ1Ii8+CiAgPHJlY3QgY2xhc3M9ImNscy0xIiB4PSIyMDcuNTUiIHk9IjIwNi43OCIgd2lkdGg9IjExMi40NSIgaGVpZ2h0PSIxMTIuNDUiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im05OC42OSwxNzcuNzRsMzEuNTktODEuNDhoMTIuMDFsMzEuNDcsODEuNDhoLTExLjc5bC0xOS41Ny01NC40OGMtLjk1LTIuNjUtMS44NC01LjE4LTIuNjYtNy41OC0uODItMi40LTEuNjEtNC43Ny0yLjM2LTcuMDktLjc1LTIuMzMtMS41Mi00Ljc2LTIuMy03LjNoMi40Yy0uNjksMi4zNi0xLjQxLDQuNjktMi4xNiw3LS43NiwyLjMtMS41OCw0LjcyLTIuNDksNy4yNS0uOSwyLjU0LTEuODQsNS4xMS0yLjc5LDcuNzJsLTIwLjAzLDU0LjQ4aC0xMS4zM1ptMTUuMjItMjMuOTJsMy40My05LjI3aDM4LjQ1bDMuMiw5LjI3aC00NS4wOVoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im0yMzMuODksMTc3Ljc0di04MS40OGgzNi43M2M0Ljk0LDAsOS4yLjc5LDEyLjc5LDIuMzYsMy41OSwxLjU4LDYuMzQsMy44NSw4LjI1LDYuODQsMS45MiwyLjk4LDIuODgsNi41NiwyLjg4LDEwLjcxcy0uOTQsNy41Ny0yLjgxLDEwLjUyLTQuNTksNS4yNC04LjE3LDYuODhjLTMuNTcsMS42NC03Ljg5LDIuNTYtMTIuOTUsMi43NXYtNC4zNWM2LjMxLjQyLDExLjUxLDEuNDksMTUuNTksMy4yMiw0LjA4LDEuNzMsNy4xMiw0LjE1LDkuMTEsNy4yNSwxLjk5LDMuMTEsMi45OSw2Ljk4LDIuOTksMTEuNjIsMCw0LjktMS4wNiw5LjEzLTMuMTksMTIuNjktMi4xMiwzLjU2LTUuMjEsNi4yOC05LjI0LDguMTctNC4wNCwxLjg5LTguODYsMi44My0xNC40NiwyLjgzaC0zNy41M1ptMTAuNjQtNS44NGwtLjkyLTMuNDNoMjcuMDFjMy43LDAsNi44LS41NCw5LjMtMS42MywyLjUtMS4wOSw0LjM4LTIuNyw1LjY0LTQuODQsMS4yNi0yLjE0LDEuODktNC43OSwxLjg5LTcuOTVzLS42NC01Ljc2LTEuOTItNy44OGMtMS4yOC0yLjEzLTMuMTctMy43My01LjY2LTQuODEtMi41LTEuMDgtNS41OC0xLjYyLTkuMjQtMS42MmgtMjcuNDd2LTguOTNoMjUuMThjMy4zLDAsNi4wOS0uNTEsOC4zOC0xLjU0czQuMDItMi41Myw1LjE5LTQuNDljMS4xNy0xLjk2LDEuNzYtNC4zNCwxLjc2LTcuMTJzLS41NS00LjkzLTEuNjQtNi43NGMtMS4xLTEuOC0yLjctMy4xNS00LjgyLTQuMDUtMi4xMi0uOS00LjczLTEuMzUtNy44NC0xLjM1aC0yNi42N2wxLjgzLTQuODF2NzEuMThaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtMTA0LjAxLDMwMy43NHYtODEuNDhoMTAuNjR2ODEuNDhoLTEwLjY0Wm01LjM4LTM4LjY4di05LjI3aDUzLjc5djkuMjdoLTUzLjc5Wm00OC40MSwzOC42OHYtODEuNDhoMTAuNjR2ODEuNDhoLTEwLjY0WiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTIzMy44OSwzMDMuNzR2LTgxLjQ4aDM0LjU2YzUuODIsMCwxMC43OSwxLjA2LDE0LjkyLDMuMTgsNC4xMywyLjEyLDcuMjUsNS4wMyw5LjM3LDguNzMsMi4xMiwzLjcsMy4xOCw3LjksMy4xOCwxMi41OXMtMS4wNiw4Ljg5LTMuMTgsMTIuNTljLTIuMTIsMy43LTUuMjQsNi42MS05LjM3LDguNzMtNC4xMywyLjEyLTkuMSwzLjE4LTE0LjkyLDMuMThsLTQuMDEuMjNoLTI0LjAzdi05LjczaDI3LjgxYzMuNTEsMCw2LjQ4LS42Miw4LjkxLTEuODcsMi40My0xLjI1LDQuMjYtMi45OSw1LjQ5LTUuMjQsMS4yMy0yLjI0LDEuODUtNC44MywxLjg1LTcuNzdzLS42Mi01LjUzLTEuODUtNy43N2MtMS4yMy0yLjI0LTMuMDYtMy45OS01LjQ5LTUuMjQtMi40My0xLjI1LTUuNC0xLjg3LTguOTEtMS44N2gtMjcuODFsNC42OS00Ljgxdjc2LjU2aC0xMS4yMlptNTEuMzksMGwtMjMuNTgtMzMuNDJ2LTUuMTVoOS4zOGwyNy4yNCwzOC41N2gtMTMuMDVaIi8+Cjwvc3ZnPg==";
const LOGO_HORIZ_DARK = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MjAgMjQwIj4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiAjZTIyMzFkOwogICAgICB9CgogICAgICAuY2xzLTEsIC5jbHMtMiwgLmNscy0zIHsKICAgICAgICBzdHJva2Utd2lkdGg6IDBweDsKICAgICAgfQoKICAgICAgLmNscy0yIHsKICAgICAgICBmaWxsOiAjZmZmOwogICAgICB9CgogICAgICAuY2xzLTMgewogICAgICAgIGZpbGw6ICMwNDY3NDg7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIAogIDxnPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtMzA2LjkxLDEwMC44NmM5Ljc3LDAsMTQuNDEsNC41NywxNC40MSwxMS4yOCwwLDQuOTUtMi41Nyw4LjcxLTcuMjcsMTAuNHYuMTNjNC45NSwxLjI1LDguMjEsNS4yLDguMjEsMTAuNTMsMCw3LjQ2LTUuMjYsMTIuMjgtMTQuMzUsMTIuMjhoLTE0Ljg1di00NC42MWgxMy44NVptLTkuNzcsMjAuMDVoOS4yMWM3LjgzLDAsMTAuODQtMy4zOCwxMC44NC04LjIxLDAtNS4yLTMuMTMtOC4yNy0xMC42NS04LjI3aC05LjR2MTYuNDhabTAsMjAuOTloMTAuMjhjNy4wMiwwLDEwLjU5LTMuMDcsMTAuNTktOC43NywwLTUuMjYtMy4zOC04LjY1LTExLjY1LTguNjVoLTkuMjF2MTcuNDJaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im0zNTcuNDEsMTI5LjU2YzAsMTAuNC01LjUxLDE2LjczLTE0LjU0LDE2Ljczcy0xNC41NC02LjMzLTE0LjU0LTE2LjczLDUuNTEtMTYuNzMsMTQuNTQtMTYuNzMsMTQuNTQsNi4zMywxNC41NCwxNi43M1ptLTI1LDBjMCw4LjI3LDMuODgsMTMuMzUsMTAuNDYsMTMuMzVzMTAuNTMtNS4wOCwxMC41My0xMy4zNS0zLjk1LTEzLjM0LTEwLjUzLTEzLjM0LTEwLjQ2LDUuMDctMTAuNDYsMTMuMzRaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im0zNjUuMzEsMTQ1LjQ3di00NC42MWgzLjg4djQ0LjYxaC0zLjg4WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtMzc4Ljg0LDEwNi4zOHYtNS41MWgzLjg4djUuNTFoLTMuODhabTAsMzkuMXYtMzEuODNoMy44OHYzMS44M2gtMy44OFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTQzOC45MywxNDUuNDd2LTIxLjNoLTI1djIxLjNoLTQuMDd2LTQ0LjYxaDQuMDd2MTkuNjFoMjV2LTE5LjYxaDQuMDd2NDQuNjFoLTQuMDdaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im00NzUuNzEsMTM2LjAxaDQuMDFjLTEsNS40NS01LjQ1LDEwLjI4LTEzLjQ3LDEwLjI4LTkuMDksMC0xNC41NC02Ljc3LTE0LjU0LTE3LjI5LDAtOS40LDUuMzMtMTYuMTYsMTQuMjktMTYuMTYsNy4xNCwwLDEyLjA5LDQuMzIsMTMuNDcsMTEuMzQuMzgsMS42OS41LDMuODIuNSw2LjE0aC0yNC4zMWMuMTksOC40Niw0LjcsMTIuNjYsMTAuNTksMTIuNjYsNS4yLDAsOC41Mi0yLjg4LDkuNDYtNi45NlptLTE5Ljk5LTguOWgyMC40OWMtLjQ0LTcuMDgtNC41MS0xMC45Ny0xMC4yMS0xMC45N3MtOS45LDQuMTQtMTAuMjgsMTAuOTdaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im01MTUuMjUsMTI5LjQ5YzAsMTAuMTUtNS4yLDE2LjY3LTEzLjQxLDE2LjY3LTQuNTcsMC04LjM5LTIuMTktMTAuMDMtNS41MWgtLjEydjE2LjQxaC0zLjg4di00My40MmgzLjg4djQuN2guMTJjMS42My0zLjI2LDUuNDUtNS41MSwxMC4wMy01LjUxLDguMjEsMCwxMy40MSw2LjUyLDEzLjQxLDE2LjY3Wm0tMjMuNzUsMGMwLDguMTQsMy44MiwxMy40MSw5LjcxLDEzLjQxczkuOTYtNS4yNiw5Ljk2LTEzLjQxLTMuODgtMTMuNDEtOS45Ni0xMy40MS05LjcxLDUuMjYtOS43MSwxMy40MVoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTU0Ni4yNywxMjUuMDV2MTIuNTljMCwzLjI2LjMxLDYuMDIuNjksNy44M2gtMy42M2MtLjMxLTEuNS0uNDQtMy4zOC0uNDQtNC44MmgtLjEzYy0yLjA3LDMuNDUtNS43Niw1LjQ1LTExLjM0LDUuNDUtNi41MiwwLTEwLjc4LTMuODItMTAuNzgtOS4xNXMyLjk1LTguMzMsMTIuMDktOS43N2MyLjk1LS41LDYuOTYtLjk0LDkuNzctMS4xM3YtMS41YzAtNS45NS0zLjM4LTguNC04LjE0LTguNC01LjM5LDAtOC4wOCwyLjk1LTguMzMsNy4wOGgtNC4wN2MuMzctNS45NSw0LjctMTAuNCwxMi40LTEwLjQsNy4xNCwwLDExLjksMy44MiwxMS45LDEyLjIyWm0tMy43Niw0LjI2Yy0yLjY5LjE5LTYuNTguNjktOS4yNywxLjEzLTYuMzkuOTQtOC40NiwyLjc2LTguNDYsNi4yNywwLDMuNywyLjc2LDYuMTQsNy40Niw2LjE0LDIuOTUsMCw1LjU4LTEsNy4zMy0yLjgyLDIuMTMtMi4yNiwyLjk1LTQuMDEsMi45NS04LjI3di0yLjQ0WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNTY3LjgyLDE0Mi4wM3YzLjMyYy0uODEuMTktMS45NC4zMS0yLjg4LjMxLTUuNDUsMC03Ljc3LTIuNDQtNy43Ny04LjU4di0yMC4xOGgtNS43di0zLjI2aDUuN3YtNy4zOWgzLjg4djcuMzloNi40NXYzLjI2aC02LjQ1djIwLjExYzAsMy43NiwxLjI1LDUuMjYsNC41Nyw1LjI2LjgxLDAsMS42OS0uMTIsMi4xOS0uMjVaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im01NzQuNCwxMDYuMzh2LTUuNTFoMy44OHY1LjUxaC0zLjg4Wm0wLDM5LjF2LTMxLjgzaDMuODh2MzEuODNoLTMuODhaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im02MTMuMzcsMTI0LjYxaC00LjA3Yy0uMzctNC44OS0zLjk1LTguMzktOC44My04LjM5LTYuMzksMC0xMC4yMSw1LjA3LTEwLjIxLDEzLjM0czMuODIsMTMuMzUsMTAuMjEsMTMuMzVjNC44OSwwLDguNC00LjAxLDguODMtOC43N2g0LjA3Yy0uNTYsNi44OS01LjUxLDEyLjE1LTEyLjkxLDEyLjE1LTguOSwwLTE0LjQxLTYuMzMtMTQuNDEtMTYuNzNzNS41MS0xNi43MywxNC40MS0xNi43M2M3LjIxLDAsMTIuMzQsNC44MiwxMi45MSwxMS43OFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTY0My4wMSwxMzYuMDFoNC4wMWMtMSw1LjQ1LTUuNDUsMTAuMjgtMTMuNDcsMTAuMjgtOS4wOSwwLTE0LjU0LTYuNzctMTQuNTQtMTcuMjksMC05LjQsNS4zMy0xNi4xNiwxNC4yOS0xNi4xNiw3LjE0LDAsMTIuMDksNC4zMiwxMy40NywxMS4zNC4zOCwxLjY5LjUsMy44Mi41LDYuMTRoLTI0LjMxYy4xOSw4LjQ2LDQuNywxMi42NiwxMC41OSwxMi42Niw1LjIsMCw4LjUyLTIuODgsOS40Ni02Ljk2Wm0tMTkuOTktOC45aDIwLjQ5Yy0uNDQtNy4wOC00LjUxLTEwLjk3LTEwLjIxLTEwLjk3cy05LjksNC4xNC0xMC4yOCwxMC45N1oiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTY4NS4wNSwxMDAuODZjMTAuNTMsMCwxNS4yOSw0LjQ1LDE1LjI5LDExLjksMCw1Ljc2LTMuNDUsMTAuMTUtOC42NCwxMS4yMnYuMTJjMy4zMiwxLDQuNywyLjg4LDYuNjQsOC4zM2w0LjcsMTMuMDNoLTQuNDVsLTQuMjYtMTIuNGMtMS45NC01LjU4LTQuMTMtNy4yNy05LjA5LTcuMjdoLTkuMjF2MTkuNjdoLTQuMDd2LTQ0LjYxaDEzLjA5Wm0tOS4wMiwyMS4yNGg5LjI3YzcuNTgsMCwxMC45LTQuMDEsMTAuODQtOS4yNywwLTUuNjQtNC4wMS04LjI3LTExLjE1LTguMjdoLTguOTZ2MTcuNTRaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im03MzIuOTMsMTI1LjA1djEyLjU5YzAsMy4yNi4zMSw2LjAyLjY5LDcuODNoLTMuNjNjLS4zMS0xLjUtLjQ0LTMuMzgtLjQ0LTQuODJoLS4xM2MtMi4wNywzLjQ1LTUuNzYsNS40NS0xMS4zNCw1LjQ1LTYuNTIsMC0xMC43OC0zLjgyLTEwLjc4LTkuMTVzMi45NS04LjMzLDEyLjA5LTkuNzdjMi45NS0uNSw2Ljk2LS45NCw5Ljc3LTEuMTN2LTEuNWMwLTUuOTUtMy4zOC04LjQtOC4xNC04LjQtNS4zOSwwLTguMDgsMi45NS04LjMzLDcuMDhoLTQuMDdjLjM3LTUuOTUsNC43LTEwLjQsMTIuNC0xMC40LDcuMTQsMCwxMS45LDMuODIsMTEuOSwxMi4yMlptLTMuNzYsNC4yNmMtMi42OS4xOS02LjU4LjY5LTkuMjcsMS4xMy02LjM5Ljk0LTguNDYsMi43Ni04LjQ2LDYuMjcsMCwzLjcsMi43Niw2LjE0LDcuNDYsNi4xNCwyLjk1LDAsNS41OC0xLDcuMzMtMi44MiwyLjEzLTIuMjYsMi45NS00LjAxLDIuOTUtOC4yN3YtMi40NFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTc1OC4xOCwxMTMuNTh2My43Yy0uNS0uMDYtMS4zMS0uMTItMi0uMTItNi4zMywwLTkuOSw0LjEzLTkuOSwxMS41M3YxNi43OWgtMy44OHYtMzEuODNoMy44MnY1LjAxaC4xMmMyLjEzLTMuNDUsNS41MS01LjI2LDkuNzEtNS4yNi42OSwwLDEuNS4wNiwyLjEzLjE5WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNzg1LjQ5LDEzNi4wMWg0LjAxYy0xLDUuNDUtNS40NSwxMC4yOC0xMy40NywxMC4yOC05LjA5LDAtMTQuNTQtNi43Ny0xNC41NC0xNy4yOSwwLTkuNCw1LjMzLTE2LjE2LDE0LjI5LTE2LjE2LDcuMTQsMCwxMi4wOSw0LjMyLDEzLjQ3LDExLjM0LjM4LDEuNjkuNSwzLjgyLjUsNi4xNGgtMjQuMzFjLjE5LDguNDYsNC43LDEyLjY2LDEwLjU5LDEyLjY2LDUuMiwwLDguNTItMi44OCw5LjQ2LTYuOTZabS0xOS45OS04LjloMjAuNDljLS40NC03LjA4LTQuNTEtMTAuOTctMTAuMjEtMTAuOTdzLTkuOSw0LjE0LTEwLjI4LDEwLjk3WiIvPgogIDwvZz4KICA8Zz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTMxNC44NywyMTMuNDZ2LTQuODJoLS4xMmMtMS42MywzLjMyLTUuNDUsNS41MS0xMC4wMyw1LjUxLTguMjEsMC0xMy40MS02LjUyLTEzLjQxLTE2LjY3czUuMi0xNi42NywxMy40MS0xNi42N2M0LjU3LDAsOC40LDIuMTksMTAuMDMsNS41MWguMTJ2LTE3LjQ4aDMuODh2NDQuNjFoLTMuODhabS0xOS40OC0xNS45OGMwLDguMTQsMy44OCwxMy40MSw5Ljk2LDEzLjQxczkuNzEtNS4yNiw5LjcxLTEzLjQxLTMuODItMTMuNDEtOS43MS0xMy40MS05Ljk2LDUuMjYtOS45NiwxMy40MVoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTMyOC40NywxNzQuMzZ2LTUuNTFoMy44OHY1LjUxaC0zLjg4Wm0wLDM5LjF2LTMxLjgzaDMuODh2MzEuODNoLTMuODhaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im0zNjcuMTksMTk0LjF2MTkuMzZoLTMuODh2LTE5LjE3YzAtNy41Mi0zLjA3LTkuOTYtOC4xNC05Ljk2cy05LjI3LDMuNTctOS4yNywxMC4yN3YxOC44NmgtMy44OHYtMzEuODNoMy44MnY0LjMyaC4xMmMxLjk0LTMuMDEsNS41MS01LjAxLDkuOS01LjAxLDcuMzMsMCwxMS4zNCw0LjM5LDExLjM0LDEzLjE2WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNDM0LjIzLDIxMy40NnYtMjIuODdjMC01Ljc2LDAtMTEuNTMuMDYtMTcuMjloLS4xMmMtMi4zMiw1Ljg5LTQuNTEsMTEuNTktNi43NywxNy40MmwtOC45LDIyLjc0aC00Ljc2bC04Ljg0LTIyLjc0Yy0yLjI1LTUuODMtNC41MS0xMS41My02Ljc3LTE3LjQyaC0uMTJjLjA2LDUuNzYuMDYsMTEuNTMuMDYsMTcuMjl2MjIuODdoLTQuMDd2LTQ0LjYxaDYuNThsOC44MywyMi44MSw2LjY0LDE3LjQyaC4xM2MyLjE5LTUuNzcsNC41MS0xMS43Miw2LjctMTcuNDJsOC44My0yMi44MWg2LjU4djQ0LjYxaC00LjA3WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNDc2LjE1LDE5Ny41NGMwLDEwLjQtNS41MSwxNi43My0xNC41NCwxNi43M3MtMTQuNTQtNi4zMy0xNC41NC0xNi43Myw1LjUxLTE2LjczLDE0LjU0LTE2LjczLDE0LjU0LDYuMzMsMTQuNTQsMTYuNzNabS0yNSwwYzAsOC4yNywzLjg4LDEzLjM1LDEwLjQ2LDEzLjM1czEwLjUzLTUuMDgsMTAuNTMtMTMuMzUtMy45NS0xMy4zNC0xMC41My0xMy4zNC0xMC40Niw1LjA3LTEwLjQ2LDEzLjM0WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNDg0LjA1LDIxMy40NnYtNDQuNjFoMy44OHY0NC42MWgtMy44OFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTUxOS4zOSwyMTMuNDZ2LTQuODJoLS4xMmMtMS42MywzLjMyLTUuNDUsNS41MS0xMC4wMyw1LjUxLTguMjEsMC0xMy40MS02LjUyLTEzLjQxLTE2LjY3czUuMi0xNi42NywxMy40MS0xNi42N2M0LjU3LDAsOC40LDIuMTksMTAuMDMsNS41MWguMTJ2LTE3LjQ4aDMuODh2NDQuNjFoLTMuODhabS0xOS40OC0xNS45OGMwLDguMTQsMy44OCwxMy40MSw5Ljk2LDEzLjQxczkuNzEtNS4yNiw5LjcxLTEzLjQxLTMuODItMTMuNDEtOS43MS0xMy40MS05Ljk2LDUuMjYtOS45NiwxMy40MVoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTU2MC4xOCwxOTcuNTRjMCwxMC40LTUuNTEsMTYuNzMtMTQuNTQsMTYuNzNzLTE0LjU0LTYuMzMtMTQuNTQtMTYuNzMsNS41MS0xNi43MywxNC41NC0xNi43MywxNC41NCw2LjMzLDE0LjU0LDE2LjczWm0tMjUsMGMwLDguMjcsMy44OCwxMy4zNSwxMC40NiwxMy4zNXMxMC41My01LjA4LDEwLjUzLTEzLjM1LTMuOTUtMTMuMzQtMTAuNTMtMTMuMzQtMTAuNDYsNS4wNy0xMC40NiwxMy4zNFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTU3NC41MywyMTMuNDZsLTExLjktMzEuODNoNC4ybDUuMDEsMTMuNzljMS43NSw0Ljg5LDMuMzgsOS4zMyw1LjE0LDE0LjI4aC4xMmMxLjc1LTQuOTUsMy4zOC05LjQsNS4xNC0xNC4yOGw1LjAxLTEzLjc5aDQuMmwtMTEuOSwzMS44M2gtNS4wMVoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTYxOS4yNywxOTMuMDN2MTIuNTljMCwzLjI2LjMxLDYuMDIuNjksNy44M2gtMy42M2MtLjMxLTEuNS0uNDQtMy4zOC0uNDQtNC44MmgtLjEzYy0yLjA3LDMuNDUtNS43Niw1LjQ1LTExLjM0LDUuNDUtNi41MiwwLTEwLjc4LTMuODItMTAuNzgtOS4xNXMyLjk1LTguMzMsMTIuMDktOS43N2MyLjk1LS41LDYuOTYtLjk0LDkuNzctMS4xM3YtMS41YzAtNS45NS0zLjM4LTguNC04LjE0LTguNC01LjM5LDAtOC4wOCwyLjk1LTguMzMsNy4wOGgtNC4wN2MuMzctNS45NSw0LjctMTAuNCwxMi40LTEwLjQsNy4xNCwwLDExLjksMy44MiwxMS45LDEyLjIyWm0tMy43Niw0LjI2Yy0yLjY5LjE5LTYuNTguNjktOS4yNywxLjEzLTYuMzkuOTQtOC40NiwyLjc2LTguNDYsNi4yNywwLDMuNywyLjc2LDYuMTQsNy40Niw2LjE0LDIuOTUsMCw1LjU4LTEsNy4zMy0yLjgyLDIuMTMtMi4yNiwyLjk1LTQuMDEsMi45NS04LjI3di0yLjQ0WiIvPgogIDwvZz4KICA8Zz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTI5Ni43LDY0LjJsLTUuNTgsMTQuNDFoLTQuMzlsMTcuNjctNDQuNjFoNS41OGwxNy42MSw0NC42MWgtNC4zOGwtNS41OC0xNC40MWgtMjAuOTNabTE3LjY3LTguMzljLTIuNDQtNi4zMy00LjctMTIuMDktNy4xNC0xOC40OGgtLjEyYy0yLjQ0LDYuMzktNC42NCwxMi4xNS03LjE0LDE4LjQ4bC0xLjgyLDQuNjNoMTcuOThsLTEuNzUtNC42M1oiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTMzMy41NCw3OC42MXYtNDQuNjFoMy44OHY0NC42MWgtMy44OFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTM0Ny4wOCwzOS41MnYtNS41MWgzLjg4djUuNTFoLTMuODhabTAsMzkuMXYtMzEuODNoMy44OHYzMS44M2gtMy44OFoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTM4My45OCw1OC4xOXYxMi41OWMwLDMuMjYuMzEsNi4wMi42OSw3LjgzaC0zLjYzYy0uMzEtMS41LS40NC0zLjM4LS40NC00LjgyaC0uMTNjLTIuMDcsMy40NS01Ljc2LDUuNDUtMTEuMzQsNS40NS02LjUyLDAtMTAuNzgtMy44Mi0xMC43OC05LjE1czIuOTUtOC4zMywxMi4wOS05Ljc3YzIuOTUtLjUsNi45Ni0uOTQsOS43Ny0xLjEzdi0xLjVjMC01Ljk1LTMuMzgtOC40LTguMTQtOC40LTUuMzksMC04LjA4LDIuOTUtOC4zMyw3LjA4aC00LjA3Yy4zNy01Ljk1LDQuNy0xMC40LDEyLjQtMTAuNCw3LjE0LDAsMTEuOSwzLjgyLDExLjksMTIuMjJabS0zLjc2LDQuMjZjLTIuNjkuMTktNi41OC42OS05LjI3LDEuMTMtNi4zOS45NC04LjQ2LDIuNzYtOC40Niw2LjI3LDAsMy43LDIuNzYsNi4xNCw3LjQ2LDYuMTQsMi45NSwwLDUuNTgtMSw3LjMzLTIuODIsMi4xMy0yLjI2LDIuOTUtNC4wMSwyLjk1LTguMjd2LTIuNDRaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im00MTguNjMsNTkuMjV2MTkuMzZoLTMuODh2LTE5LjE3YzAtNy41Mi0zLjA3LTkuOTYtOC4xNC05Ljk2cy05LjI3LDMuNTctOS4yNywxMC4yN3YxOC44NmgtMy44OHYtMzEuODNoMy44MnY0LjMyaC4xMmMxLjk0LTMuMDEsNS41MS01LjAxLDkuOS01LjAxLDcuMzMsMCwxMS4zNCw0LjM5LDExLjM0LDEzLjE2WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNDQwLjEyLDc1LjE3djMuMzJjLS44MS4xOS0xLjk0LjMxLTIuODguMzEtNS40NSwwLTcuNzctMi40NC03Ljc3LTguNTh2LTIwLjE4aC01Ljd2LTMuMjZoNS43di03LjM5aDMuODh2Ny4zOWg2LjQ1djMuMjZoLTYuNDV2MjAuMTFjMCwzLjc2LDEuMjUsNS4yNiw0LjU3LDUuMjYuODEsMCwxLjY5LS4xMiwyLjE5LS4yNVptLTQuMjYsNy43MXY1LjA4bC0zLjA3LDYuMzloLTEuODJsMi4xOS02LjM5aC0xLjc2di01LjA4aDQuNDVaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im00NzAuMzksNTguMTl2MTIuNTljMCwzLjI2LjMxLDYuMDIuNjksNy44M2gtMy42M2MtLjMxLTEuNS0uNDQtMy4zOC0uNDQtNC44MmgtLjEzYy0yLjA3LDMuNDUtNS43Niw1LjQ1LTExLjM0LDUuNDUtNi41MiwwLTEwLjc4LTMuODItMTAuNzgtOS4xNXMyLjk1LTguMzMsMTIuMDktOS43N2MyLjk1LS41LDYuOTYtLjk0LDkuNzctMS4xM3YtMS41YzAtNS45NS0zLjM4LTguNC04LjE0LTguNC01LjM5LDAtOC4wOCwyLjk1LTguMzMsNy4wOGgtNC4wN2MuMzctNS45NSw0LjctMTAuNCwxMi40LTEwLjQsNy4xNCwwLDExLjksMy44MiwxMS45LDEyLjIyWm0tMy43Niw0LjI2Yy0yLjY5LjE5LTYuNTguNjktOS4yNywxLjEzLTYuMzkuOTQtOC40NiwyLjc2LTguNDYsNi4yNywwLDMuNywyLjc2LDYuMTQsNy40Niw2LjE0LDIuOTUsMCw1LjU4LTEsNy4zMy0yLjgyLDIuMTMtMi4yNiwyLjk1LTQuMDEsMi45NS04LjI3di0yLjQ0WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNTIzLjUyLDYyLjY0YzAsMTAuMTUtNS4yLDE2LjY3LTEzLjQxLDE2LjY3LTQuNTcsMC04LjM5LTIuMTktMTAuMDMtNS41MWgtLjEydjE2LjQxaC0zLjg4di00My40MmgzLjg4djQuN2guMTJjMS42My0zLjI2LDUuNDUtNS41MSwxMC4wMy01LjUxLDguMjEsMCwxMy40MSw2LjUyLDEzLjQxLDE2LjY3Wm0tMjMuNzUsMGMwLDguMTQsMy44MiwxMy40MSw5LjcxLDEzLjQxczkuOTYtNS4yNiw5Ljk2LTEzLjQxLTMuODgtMTMuNDEtOS45Ni0xMy40MS05LjcxLDUuMjYtOS43MSwxMy40MVoiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTU1My40MSw2OS4xNWg0LjAxYy0xLDUuNDUtNS40NSwxMC4yOC0xMy40NywxMC4yOC05LjA5LDAtMTQuNTQtNi43Ny0xNC41NC0xNy4yOSwwLTkuNCw1LjMzLTE2LjE2LDE0LjI5LTE2LjE2LDcuMTQsMCwxMi4wOSw0LjMyLDEzLjQ3LDExLjM0LjM4LDEuNjkuNSwzLjgyLjUsNi4xNGgtMjQuMzFjLjE5LDguNDYsNC43LDEyLjY2LDEwLjU5LDEyLjY2LDUuMiwwLDguNTItMi44OCw5LjQ2LTYuOTZabS0xOS45OS04LjloMjAuNDljLS40NC03LjA4LTQuNTEtMTAuOTctMTAuMjEtMTAuOTdzLTkuOSw0LjE0LTEwLjI4LDEwLjk3WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNTkwLjY5LDU5LjI1djE5LjM2aC0zLjg4di0xOS4xN2MwLTcuNTItMy4wNy05Ljk2LTguMTQtOS45NnMtOS4yNywzLjU3LTkuMjcsMTAuMjd2MTguODZoLTMuODh2LTMxLjgzaDMuODJ2NC4zMmguMTJjMS45NC0zLjAxLDUuNTEtNS4wMSw5LjktNS4wMSw3LjMzLDAsMTEuMzQsNC4zOSwxMS4zNCwxMy4xNloiLz4KICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTYxMi4xOCw3NS4xN3YzLjMyYy0uODEuMTktMS45NC4zMS0yLjg4LjMxLTUuNDUsMC03Ljc3LTIuNDQtNy43Ny04LjU4di0yMC4xOGgtNS43di0zLjI2aDUuN3YtNy4zOWgzLjg4djcuMzloNi40NXYzLjI2aC02LjQ1djIwLjExYzAsMy43NiwxLjI1LDUuMjYsNC41Nyw1LjI2LjgxLDAsMS42OS0uMTIsMi4xOS0uMjVaIi8+CiAgICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im02MzQuNTUsNDYuNzJ2My43Yy0uNS0uMDYtMS4zMS0uMTItMi0uMTItNi4zMywwLTkuOSw0LjEzLTkuOSwxMS41M3YxNi43OWgtMy44OHYtMzEuODNoMy44MnY1LjAxaC4xMmMyLjEzLTMuNDUsNS41MS01LjI2LDkuNzEtNS4yNi42OSwwLDEuNS4wNiwyLjEzLjE5WiIvPgogICAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtNjQwLjQ0LDY2LjE0di0xOS4zNmgzLjg4djE5LjE3YzAsNy41MiwzLjA3LDkuOTYsOC4xNCw5Ljk2czkuMjctMy41Nyw5LjI3LTEwLjI4di0xOC44NmgzLjg4djMxLjgzaC0zLjgydi00LjMyaC0uMTJjLTEuODgsMy4wMS01LjUxLDUuMDEtOS45LDUuMDEtNy4yNywwLTExLjM0LTQuMzktMTEuMzQtMTMuMTZaIi8+CiAgPC9nPgogIDxyZWN0IGNsYXNzPSJjbHMtMiIgeD0iMzAuMjQiIHk9IjIzLjQzIiB3aWR0aD0iOTEuMDkiIGhlaWdodD0iOTEuMDkiLz4KICA8cmVjdCBjbGFzcz0iY2xzLTIiIHg9IjEzMy41NiIgeT0iMjMuNDMiIHdpZHRoPSI5MS4wOSIgaGVpZ2h0PSI5MS4wOSIvPgogIDxyZWN0IGNsYXNzPSJjbHMtMiIgeD0iMzAuMjQiIHk9IjEyNS40OSIgd2lkdGg9IjkxLjA5IiBoZWlnaHQ9IjkxLjA5Ii8+CiAgPHJlY3QgY2xhc3M9ImNscy0xIiB4PSIxMzMuNTYiIHk9IjEyNS40OSIgd2lkdGg9IjkxLjA5IiBoZWlnaHQ9IjkxLjA5Ii8+CiAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNDUuMzgsMTAxLjk3bDI1LjU5LTY2aDkuNzNsMjUuNDksNjZoLTkuNTVsLTE1Ljg1LTQ0LjEzYy0uNzctMi4xNS0xLjQ5LTQuMTktMi4xNi02LjE0LS42Ni0xLjk0LTEuMy0zLjg2LTEuOTEtNS43NS0uNjEtMS44OS0xLjIzLTMuODYtMS44Ny01LjkxaDEuOTVjLS41NiwxLjkxLTEuMTQsMy44LTEuNzUsNS42Ny0uNjEsMS44Ni0xLjI4LDMuODItMi4wMiw1Ljg3LS43MywyLjA1LTEuNDksNC4xNC0yLjI2LDYuMjZsLTE2LjIyLDQ0LjEzaC05LjE4Wm0xMi4zMy0xOS4zN2wyLjc4LTcuNTFoMzEuMTVsMi42LDcuNTFoLTM2LjUyWiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTE1NC45LDEwMS45N1YzNS45N2gyOS43NmM0LDAsNy40Ni42NCwxMC4zNiwxLjkxLDIuOTEsMS4yOCw1LjE0LDMuMTIsNi42OSw1LjU0LDEuNTUsMi40MiwyLjMzLDUuMzEsMi4zMyw4LjY4cy0uNzYsNi4xMy0yLjI3LDguNTItMy43Miw0LjI1LTYuNjIsNS41N2MtMi45LDEuMzMtNi4zOSwyLjA3LTEwLjQ5LDIuMjJ2LTMuNTJjNS4xMS4zNCw5LjMyLDEuMjEsMTIuNjMsMi42MSwzLjMsMS40LDUuNzcsMy4zNiw3LjM4LDUuODcsMS42MSwyLjUyLDIuNDIsNS42NiwyLjQyLDkuNDEsMCwzLjk3LS44Niw3LjQtMi41OSwxMC4yOC0xLjcyLDIuODgtNC4yMiw1LjA5LTcuNDgsNi42MS0zLjI3LDEuNTMtNy4xNywyLjMtMTEuNzIsMi4zaC0zMC40Wm04LjYyLTQuNzNsLS43NC0yLjc4aDIxLjg4YzMsMCw1LjUxLS40NCw3LjUzLTEuMzIsMi4wMi0uODgsMy41NS0yLjE5LDQuNTctMy45MiwxLjAyLTEuNzMsMS41My0zLjg4LDEuNTMtNi40NHMtLjUyLTQuNjYtMS41NS02LjM5Yy0xLjAzLTEuNzItMi41Ni0zLjAyLTQuNTktMy44OS0yLjAzLS44Ny00LjUyLTEuMzEtNy40OS0xLjMxaC0yMi4yNXYtNy4yM2gyMC40YzIuNjcsMCw0Ljk0LS40Miw2Ljc5LTEuMjUsMS44NS0uODMsMy4yNi0yLjA1LDQuMjEtMy42NC45NS0xLjU5LDEuNDItMy41MSwxLjQyLTUuNzdzLS40NC00LTEuMzMtNS40NmMtLjg5LTEuNDYtMi4xOS0yLjU1LTMuOS0zLjI4LTEuNzItLjczLTMuODMtMS4wOS02LjM1LTEuMDloLTIxLjZsMS40OC0zLjg5djU3LjY2WiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMyIgZD0ibTQ5LjY5LDIwNC4wM3YtNjZoOC42MnY2NmgtOC42MlptNC4zNS0zMS4zM3YtNy41MWg0My41N3Y3LjUxaC00My41N1ptMzkuMjEsMzEuMzN2LTY2aDguNjJ2NjZoLTguNjJaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtMTU0LjksMjA0LjAzdi02NmgyOGM0LjcxLDAsOC43NC44NiwxMi4wOSwyLjU3LDMuMzQsMS43MSw1Ljg4LDQuMDcsNy41OSw3LjA3LDEuNzEsMywyLjU3LDYuNCwyLjU3LDEwLjJzLS44Niw3LjItMi41NywxMC4yYy0xLjcxLDMtNC4yNSw1LjM1LTcuNTksNy4wNy0zLjM1LDEuNzEtNy4zNywyLjU3LTEyLjA5LDIuNTdsLTMuMjQuMTloLTE5LjQ3di03Ljg4aDIyLjUzYzIuODQsMCw1LjI1LS41MSw3LjIyLTEuNTIsMS45Ny0xLjAxLDMuNDUtMi40Myw0LjQ1LTQuMjQsMS0xLjgyLDEuNDktMy45MSwxLjQ5LTYuMjlzLS41LTQuNDgtMS40OS02LjI5Yy0xLTEuODItMi40OC0zLjIzLTQuNDUtNC4yNC0xLjk3LTEuMDEtNC4zOC0xLjUyLTcuMjItMS41MmgtMjIuNTNsMy44LTMuODl2NjIuMDJoLTkuMDhabTQxLjYyLDBsLTE5LjEtMjcuMDd2LTQuMTdoNy42bDIyLjA2LDMxLjI0aC0xMC41N1oiLz4KPC9zdmc+";
const LOGO_ICON_DARK = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIj4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiAjZTIyMzFkOwogICAgICB9CgogICAgICAuY2xzLTEsIC5jbHMtMiwgLmNscy0zIHsKICAgICAgICBzdHJva2Utd2lkdGg6IDBweDsKICAgICAgfQoKICAgICAgLmNscy0yIHsKICAgICAgICBmaWxsOiAjMDQ2NzQ4OwogICAgICB9CgogICAgICAuY2xzLTMgewogICAgICAgIGZpbGw6ICNmZmZmZmY7CiAgICAgIH0KICAgIDwvc3R5bGU+CiAgPC9kZWZzPgogIDxyZWN0IGNsYXNzPSJjbHMtMyIgeD0iODAiIHk9IjgwLjc4IiB3aWR0aD0iMTEyLjQ1IiBoZWlnaHQ9IjExMi40NSIvPgogIDxyZWN0IGNsYXNzPSJjbHMtMyIgeD0iMjA3LjU1IiB5PSI4MC43OCIgd2lkdGg9IjExMi40NSIgaGVpZ2h0PSIxMTIuNDUiLz4KICA8cmVjdCBjbGFzcz0iY2xzLTMiIHg9IjgwIiB5PSIyMDYuNzgiIHdpZHRoPSIxMTIuNDUiIGhlaWdodD0iMTEyLjQ1Ii8+CiAgPHJlY3QgY2xhc3M9ImNscy0xIiB4PSIyMDcuNTUiIHk9IjIwNi43OCIgd2lkdGg9IjExMi40NSIgaGVpZ2h0PSIxMTIuNDUiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im05OC42OSwxNzcuNzRsMzEuNTktODEuNDhoMTIuMDFsMzEuNDcsODEuNDhoLTExLjc5bC0xOS41Ny01NC40OGMtLjk1LTIuNjUtMS44NC01LjE4LTIuNjYtNy41OC0uODItMi40LTEuNjEtNC43Ny0yLjM2LTcuMDktLjc1LTIuMzMtMS41Mi00Ljc2LTIuMy03LjNoMi40Yy0uNjksMi4zNi0xLjQxLDQuNjktMi4xNiw3LS43NiwyLjMtMS41OCw0LjcyLTIuNDksNy4yNS0uOSwyLjU0LTEuODQsNS4xMS0yLjc5LDcuNzJsLTIwLjAzLDU0LjQ4aC0xMS4zM1ptMTUuMjItMjMuOTJsMy40My05LjI3aDM4LjQ1bDMuMiw5LjI3aC00NS4wOVoiLz4KICA8cGF0aCBjbGFzcz0iY2xzLTIiIGQ9Im0yMzMuODksMTc3Ljc0di04MS40OGgzNi43M2M0Ljk0LDAsOS4yLjc5LDEyLjc5LDIuMzYsMy41OSwxLjU4LDYuMzQsMy44NSw4LjI1LDYuODQsMS45MiwyLjk4LDIuODgsNi41NiwyLjg4LDEwLjcxcy0uOTQsNy41Ny0yLjgxLDEwLjUyLTQuNTksNS4yNC04LjE3LDYuODhjLTMuNTcsMS42NC03Ljg5LDIuNTYtMTIuOTUsMi43NXYtNC4zNWM2LjMxLjQyLDExLjUxLDEuNDksMTUuNTksMy4yMiw0LjA4LDEuNzMsNy4xMiw0LjE1LDkuMTEsNy4yNSwxLjk5LDMuMTEsMi45OSw2Ljk4LDIuOTksMTEuNjIsMCw0LjktMS4wNiw5LjEzLTMuMTksMTIuNjktMi4xMiwzLjU2LTUuMjEsNi4yOC05LjI0LDguMTctNC4wNCwxLjg5LTguODYsMi44My0xNC40NiwyLjgzaC0zNy41M1ptMTAuNjQtNS44NGwtLjkyLTMuNDNoMjcuMDFjMy43LDAsNi44LS41NCw5LjMtMS42MywyLjUtMS4wOSw0LjM4LTIuNyw1LjY0LTQuODQsMS4yNi0yLjE0LDEuODktNC43OSwxLjg5LTcuOTVzLS42NC01Ljc2LTEuOTItNy44OGMtMS4yOC0yLjEzLTMuMTctMy43My01LjY2LTQuODEtMi41LTEuMDgtNS41OC0xLjYyLTkuMjQtMS42MmgtMjcuNDd2LTguOTNoMjUuMThjMy4zLDAsNi4wOS0uNTEsOC4zOC0xLjU0czQuMDItMi41Myw1LjE5LTQuNDljMS4xNy0xLjk2LDEuNzYtNC4zNCwxLjc2LTcuMTJzLS41NS00LjkzLTEuNjQtNi43NGMtMS4xLTEuOC0yLjctMy4xNS00LjgyLTQuMDUtMi4xMi0uOS00LjczLTEuMzUtNy44NC0xLjM1aC0yNi42N2wxLjgzLTQuODF2NzEuMThaIi8+CiAgPHBhdGggY2xhc3M9ImNscy0yIiBkPSJtMTA0LjAxLDMwMy43NHYtODEuNDhoMTAuNjR2ODEuNDhoLTEwLjY0Wm01LjM4LTM4LjY4di05LjI3aDUzLjc5djkuMjdoLTUzLjc5Wm00OC40MSwzOC42OHYtODEuNDhoMTAuNjR2ODEuNDhoLTEwLjY0WiIvPgogIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTIzMy44OSwzMDMuNzR2LTgxLjQ4aDM0LjU2YzUuODIsMCwxMC43OSwxLjA2LDE0LjkyLDMuMTgsNC4xMywyLjEyLDcuMjUsNS4wMyw5LjM3LDguNzMsMi4xMiwzLjcsMy4xOCw3LjksMy4xOCwxMi41OXMtMS4wNiw4Ljg5LTMuMTgsMTIuNTljLTIuMTIsMy43LTUuMjQsNi42MS05LjM3LDguNzMtNC4xMywyLjEyLTkuMSwzLjE4LTE0LjkyLDMuMThsLTQuMDEuMjNoLTI0LjAzdi05LjczaDI3LjgxYzMuNTEsMCw2LjQ4LS42Miw4LjkxLTEuODcsMi40My0xLjI1LDQuMjYtMi45OSw1LjQ5LTUuMjQsMS4yMy0yLjI0LDEuODUtNC44MywxLjg1LTcuNzdzLS42Mi01LjUzLTEuODUtNy43N2MtMS4yMy0yLjI0LTMuMDYtMy45OS01LjQ5LTUuMjQtMi40My0xLjI1LTUuNC0xLjg3LTguOTEtMS44N2gtMjcuODFsNC42OS00Ljgxdjc2LjU2aC0xMS4yMlptNTEuMzksMGwtMjMuNTgtMzMuNDJ2LTUuMTVoOS4zOGwyNy4yNCwzOC41N2gtMTMuMDVaIi8+Cjwvc3ZnPg==";
function ABHRLogo({size=48,white=false,horizontal=false}) {
  const src = horizontal?(white?LOGO_HORIZ_DARK:LOGO_HORIZ_WHITE):(white?LOGO_ICON_DARK:LOGO_ICON_WHITE);
  return <img src={src} alt="ABHR" style={{height:size+"px",width:horizontal?"auto":size+"px",maxWidth:horizontal?"240px":undefined,display:"block",flexShrink:0}}/>;
}

// ─── MEMBER SIDE PANEL ────────────────────────────────────────────────────────
function MemberPanel({open,onClose}) {
  const {lang} = useLang();
  const t = T[lang].member;
  const [form,setForm] = useState({name:"",email:"",phone:"",city:"",message:""});
  const [submitted,setSubmitted] = useState(false);
  const [errors,setErrors] = useState({});
  const validate=()=>{
    const e={};
    if(!form.name.trim()) e.name="Numele este obligatoriu.";
    else if(form.name.trim().length<3) e.name="Numele trebuie să aibă cel puțin 3 caractere.";
    if(!form.email.trim()) e.email="Email-ul este obligatoriu.";
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email="Adresă de email invalidă.";
    if(form.phone && !/^[+\d\s\-()]{7,}$/.test(form.phone)) e.phone="Număr de telefon invalid.";
    return e;
  };
  const handleSubmit = async () => {
    const e=validate();
    setErrors(e);
    if(Object.keys(e).length>0) return;
    try { await db.insert("membership_requests", form); } catch {}
    // Send email notification to admin
    try {
      await fetch("/api/notify-membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {}
    setSubmitted(true);
  };
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:998,opacity:open?1:0,pointerEvents:open?"all":"none",transition:"opacity 0.35s ease",backdropFilter:open?"blur(3px)":"none"}}/>
      <div style={{position:"fixed",top:0,right:0,bottom:0,width:"min(480px,95vw)",background:GREEN_DARK,zIndex:999,transform:open?"translateX(0)":"translateX(100%)",transition:"transform 0.4s cubic-bezier(0.4,0,0.2,1)",overflowY:"auto",boxShadow:"-8px 0 40px rgba(0,0,0,0.3)"}}>
        <WavyBg color="rgba(255,255,255,0.04)"/>
        <div style={{position:"relative",zIndex:2,padding:40}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
            <ABHRLogo size={40} white horizontal/>
            <button onClick={onClose} style={{background:"rgba(255,255,255,0.1)",border:"none",color:"white",width:40,height:40,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
          <SectionLabel>{t.join}</SectionLabel>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:28,color:"white",margin:"0 0 12px",lineHeight:1.2}}>{t.title}</h2>
          <p style={{color:"rgba(255,255,255,0.65)",fontSize:14,lineHeight:1.7,margin:"0 0 28px"}}>{t.subtitle}</p>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
            {t.benefits.map((b,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"10px 16px",border:"1px solid rgba(255,255,255,0.08)"}}>
                <span style={{fontSize:18}}>{["🏅","📚","👥","📅"][i]}</span>
                <span style={{color:"rgba(255,255,255,0.8)",fontSize:13}}>{b}</span>
              </div>
            ))}
          </div>
          {submitted?(
            <div style={{textAlign:"center",padding:"32px 20px",background:"rgba(255,255,255,0.06)",borderRadius:20,border:`1px solid rgba(46,204,138,0.3)`}}>
              <div style={{fontSize:56,marginBottom:16}}>✅</div>
              <h3 style={{color:"white",fontFamily:"Georgia,serif",fontSize:22,marginBottom:10}}>{t.sent}</h3>
              <p style={{color:"rgba(255,255,255,0.65)",fontSize:14,lineHeight:1.7,marginBottom:20}}>{t.sentDesc}</p>
              <PillBtn onClick={()=>{setSubmitted(false);setForm({name:"",email:"",phone:"",city:"",message:""});}}>{t.again}</PillBtn>
            </div>
          ):(
            <div style={{background:"rgba(255,255,255,0.06)",borderRadius:20,padding:28,border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[["name",t.name,"text"],["email",t.email,"email"],["phone",t.phone,"tel"],["city",t.city,"text"]].map(([f,label,type])=>(
                  <input key={f} value={form[f]} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} type={type} placeholder={label}
                    style={{width:"100%",padding:"13px 16px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,color:"white",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",transition:"border 0.2s"}}
                    onFocus={e=>e.target.style.border=`1px solid ${GREEN_ACCENT}`}
                    onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.12)"}
                  />
                ))}
                <textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} placeholder={t.message} rows={3}
                  style={{width:"100%",padding:"13px 16px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,color:"white",fontSize:14,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box",transition:"border 0.2s"}}
                  onFocus={e=>e.target.style.border=`1px solid ${GREEN_ACCENT}`}
                  onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.12)"}
                />
                <PillBtn onClick={handleSubmit}>{t.submit}</PillBtn>
                <p style={{color:"rgba(255,255,255,0.35)",fontSize:11,textAlign:"center"}}>{t.required}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({page,setPage,onMemberClick}) {
  const {lang,setLang} = useLang();
  const {user,logout} = useAuth();
  const t = T[lang].nav;
  const [scrolled,setScrolled] = useState(false);
  const [dropdown,setDropdown] = useState(null);
  const [menuOpen,setMenuOpen] = useState(false);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>40);
    window.addEventListener("scroll",fn);
    fn(); // check immediately on mount
    return()=>window.removeEventListener("scroll",fn);
  },[]);
  // Force scrolled=true on pages without dark hero
  const noHeroPages=["admin","profile","newsDetail","eventDetail","researchDetail","educationDetail","contact"];
  const effectiveScrolled = scrolled || noHeroPages.includes(page);
  const go=(key)=>{setPage(key);setMenuOpen(false);setDropdown(null);};
  const btnColor = effectiveScrolled?"#333":"white";
  const hoverBg = effectiveScrolled?GREEN_LIGHT:"rgba(255,255,255,0.15)";
  const navGroups = [
    {label:t.home,key:"home"},
    {label:t.about,key:"about"},
    {label:t.activitati+" ▾",key:"activitati",children:[{label:t.events,key:"events"},{label:t.gallery,key:"gallery"}]},
    {label:t.resurse+" ▾",key:"resurse",children:[{label:t.news,key:"news"},{label:t.research,key:"research"},{label:t.education,key:"education"}]},
    {label:t.contact,key:"contact"},
    ...(user&&!user.isAdmin?[{label:t.profile,key:"profile"}]:[]),
    ...(user?.isAdmin?[{label:t.admin,key:"admin"}]:[]),
  ];
  return (
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,background:effectiveScrolled?"rgba(255,255,255,0.97)":"transparent",backdropFilter:effectiveScrolled?"blur(12px)":"none",boxShadow:effectiveScrolled?"0 2px 24px rgba(0,0,0,0.08)":"none",transition:"all 0.35s ease",borderBottom:effectiveScrolled?"1px solid rgba(0,0,0,0.06)":"none"}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:72}}>
        <div style={{cursor:"pointer"}} onClick={()=>go("home")}><ABHRLogo size={40} white={!effectiveScrolled} horizontal/></div>
        <div style={{display:"flex",alignItems:"center",gap:2}} className="desktop-nav">
          {navGroups.map(group=>(
            <div key={group.key} style={{position:"relative"}} onMouseEnter={()=>group.children&&setDropdown(group.key)} onMouseLeave={()=>setDropdown(null)}>
              <button style={{background:"transparent",border:"none",color:btnColor,padding:"8px 12px",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit",borderRadius:6,transition:"all 0.2s"}}
                onClick={()=>!group.children&&go(group.key)}
                onMouseEnter={e=>e.currentTarget.style.background=hoverBg}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}
              >{group.label}</button>
              {group.children&&dropdown===group.key&&(
                <div style={{position:"absolute",top:"100%",left:0,background:"white",borderRadius:12,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",padding:"8px 0",minWidth:160,border:"1px solid rgba(0,0,0,0.06)",zIndex:300}}>
                  {group.children.map(child=>(
                    <button key={child.key} onClick={()=>go(child.key)} style={{display:"block",width:"100%",textAlign:"left",background:"transparent",border:"none",padding:"10px 20px",fontSize:13,color:"#333",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background=GREEN_LIGHT;e.currentTarget.style.color=GREEN;}}
                      onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#333";}}
                    >{child.label}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div style={{display:"flex",background:effectiveScrolled?"rgba(0,0,0,0.06)":"rgba(255,255,255,0.15)",borderRadius:20,overflow:"hidden",marginLeft:4}}>
            {["ro","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{background:lang===l?(effectiveScrolled?"white":"rgba(255,255,255,0.3)"):"transparent",color:effectiveScrolled?(lang===l?GREEN:"#555"):"white",border:"none",padding:"5px 10px",cursor:"pointer",fontWeight:700,fontSize:11,fontFamily:"inherit",transition:"all 0.2s"}}>{l.toUpperCase()}</button>)}
          </div>
          {!user&&<button onClick={onMemberClick} style={{background:"transparent",border:`1.5px solid ${scrolled?GREEN:"rgba(255,255,255,0.5)"}`,color:effectiveScrolled?GREEN:"white",padding:"8px 16px",borderRadius:50,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",marginLeft:4,transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=GREEN;e.currentTarget.style.color="white";e.currentTarget.style.borderColor=GREEN;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=effectiveScrolled?GREEN:"white";e.currentTarget.style.borderColor=effectiveScrolled?GREEN:"rgba(255,255,255,0.5)";}}
          >{t.member}</button>}
          {user
            ?<button onClick={logout} style={{background:RED,border:"none",color:"white",padding:"8px 16px",borderRadius:50,cursor:"pointer",fontSize:12,fontWeight:600,marginLeft:4,fontFamily:"inherit"}}>{t.logout}</button>
            :<button onClick={()=>go("login")} style={{background:GREEN_ACCENT,border:"none",color:"white",padding:"10px 18px",borderRadius:50,cursor:"pointer",fontSize:12,fontWeight:700,marginLeft:4,fontFamily:"inherit",boxShadow:"0 4px 16px rgba(46,204,138,0.35)"}}>{t.login} ↗</button>
          }
        </div>
        <button onClick={()=>setMenuOpen(!menuOpen)} className="hamburger" style={{display:"none",background:"transparent",border:"none",color:scrolled?"#333":"white",fontSize:24,cursor:"pointer"}}>☰</button>
      </div>
      {menuOpen&&(
        <div style={{background:GREEN_DARK,padding:"12px 20px",display:"flex",flexDirection:"column",gap:4}}>
          {navGroups.map(g=>(
            g.children
              ?g.children.map(c=><button key={c.key} onClick={()=>go(c.key)} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.8)",padding:"10px 12px 10px 24px",borderRadius:6,cursor:"pointer",fontSize:13,textAlign:"left",fontFamily:"inherit"}}>{c.label}</button>)
              :<button key={g.key} onClick={()=>go(g.key)} style={{background:page===g.key?"rgba(255,255,255,0.15)":"transparent",border:"none",color:"white",padding:"10px 12px",borderRadius:6,cursor:"pointer",fontSize:14,textAlign:"left",fontFamily:"inherit"}}>{g.label}</button>
          ))}
          <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap",alignItems:"center"}}>
            {["ro","en"].map(l=><button key={l} onClick={()=>setLang(l)} style={{background:lang===l?"white":"rgba(255,255,255,0.2)",color:lang===l?GREEN:"white",border:"none",padding:"6px 14px",borderRadius:20,cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"inherit"}}>{l.toUpperCase()}</button>)}
            {!user&&<button onClick={()=>{onMemberClick();setMenuOpen(false);}} style={{background:"transparent",border:"1.5px solid rgba(255,255,255,0.4)",color:"white",padding:"6px 14px",borderRadius:50,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"}}>{t.member}</button>}
            {user?<button onClick={()=>{logout();setMenuOpen(false);}} style={{background:RED,border:"none",color:"white",padding:"6px 14px",borderRadius:6,cursor:"pointer",fontFamily:"inherit"}}>{t.logout}</button>
              :<button onClick={()=>go("login")} style={{background:GREEN_ACCENT,border:"none",color:"white",padding:"6px 14px",borderRadius:50,cursor:"pointer",fontWeight:700,fontFamily:"inherit"}}>{t.login}</button>}
          </div>
        </div>
      )}
      <style>{`@media(max-width:900px){.desktop-nav{display:none!important}.hamburger{display:block!important}}`}</style>
    </nav>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({setPage}) {
  const {lang} = useLang();
  const t = T[lang];
  return (
    <footer style={{background:GREEN_DARK,padding:"64px 32px 32px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)`,backgroundSize:"40px 40px",pointerEvents:"none"}}/>
      <div style={{maxWidth:1200,margin:"0 auto",position:"relative",zIndex:2}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:48,marginBottom:48}}>
          <div>
            <div style={{marginBottom:20}}><ABHRLogo size={48} white horizontal/></div>
            <p style={{color:"rgba(255,255,255,0.55)",fontSize:14,lineHeight:1.8,maxWidth:280}}>{t.home.sub}</p>
          </div>
          {[
            {title:t.nav.activitati,links:[{l:t.nav.events,k:"events"},{l:t.nav.gallery,k:"gallery"}]},
            {title:t.nav.resurse,links:[{l:t.nav.news,k:"news"},{l:t.nav.research,k:"research"},{l:t.nav.education,k:"education"}]},
            {title:t.nav.contact,links:[{l:t.contact.emailVal,k:"contact"},{l:t.contact.phoneVal,k:null},{l:"Facebook",k:null}]},
            {title:"Contact",links:[{l:"contact@abhr.md",k:null},{l:"Chișinău, Moldova",k:null},{l:"Facebook ABHR",k:null}]},
          ].map(col=>(
            <div key={col.title}>
              <div style={{color:"white",fontWeight:700,marginBottom:20,fontSize:14,letterSpacing:0.5}}>{col.title}</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {col.links.map(item=><span key={item.l} onClick={item.k?()=>setPage(item.k):undefined} style={{color:"rgba(255,255,255,0.5)",fontSize:13,cursor:item.k?"pointer":"default",transition:"color 0.2s"}} onMouseEnter={e=>item.k&&(e.target.style.color=GREEN_ACCENT)} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.5)"}>{item.l}</span>)}
              </div>
            </div>
          ))}
        </div>
        <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <span style={{color:"rgba(255,255,255,0.4)",fontSize:13}}>{t.footer}</span>
        </div>
      </div>
    </footer>
  );
}


// ─── COUNT-UP HOOK ────────────────────────────────────────────────────────────
function useCountUp(target,duration=1800,started=false) {
  const [count,setCount] = useState(0);
  useEffect(()=>{
    if(!started) return;
    let start=null;
    const step=(ts)=>{if(!start)start=ts;const p=Math.min((ts-start)/duration,1);const e=1-Math.pow(1-p,4);setCount(Math.floor(e*target));if(p<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  },[started,target,duration]);
  return count;
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({setPage,news,events,onMemberClick}) {
  const {lang} = useLang();
  const {user} = useAuth();
  const t = T[lang];
  const [visible,setVisible] = useState(false);
  const statsRef = useRef(null);
  const [statsStarted,setStatsStarted] = useState(false);
  useEffect(()=>{setTimeout(()=>setVisible(true),100);},[]);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setStatsStarted(true);obs.disconnect();}},{threshold:0.4});
    if(statsRef.current)obs.observe(statsRef.current);
    return()=>obs.disconnect();
  },[]);
  const counts = [useCountUp(120,1800,statsStarted),useCountUp(24,1600,statsStarted),useCountUp(48,2000,statsStarted),useCountUp(6,1200,statsStarted)];
  const homeEvents=(()=>{
    const on=events.filter(e=>e.status==="ongoing");
    const up=events.filter(e=>e.status==="upcoming").sort((a,b)=>new Date(a.date)-new Date(b.date));
    const past=events.filter(e=>e.status==="past").sort((a,b)=>new Date(b.date)-new Date(a.date));
    if(on.length>0) return [on[0],...up.slice(0,1)].slice(0,2);
    if(up.length>0) return up.slice(0,2);
    return past.slice(0,2);
  })();

  return (
    <div>
      {/* Hero */}
      <section style={{position:"relative",minHeight:"100vh",background:`linear-gradient(145deg,${GREEN_DARK} 0%,${GREEN_MID} 50%,#0d4a52 100%)`,display:"flex",alignItems:"center",overflow:"hidden"}}>
        <WavyBg/>
        <div style={{position:"absolute",top:"10%",right:"8%",width:320,height:320,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.08)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",top:"15%",right:"12%",width:200,height:200,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.06)",pointerEvents:"none"}}/>
        {[[80,20],[90,60],[15,75]].map(([top,left],i)=><div key={i} style={{position:"absolute",top:`${top}%`,left:`${left}%`,color:"rgba(255,255,255,0.12)",fontSize:28,pointerEvents:"none"}}>✦</div>)}
        <div style={{maxWidth:1200,margin:"0 auto",padding:"120px 32px 80px",position:"relative",zIndex:2,width:"100%"}}>
          <div style={{maxWidth:680}}>

            <h1 style={{margin:"0 0 28px",lineHeight:1.1,fontFamily:"Georgia,serif"}}>
              {(lang==="ro"?["Cercetăm.","Susținem.","Ne implicăm."]:["We Research.","We Support.","We Engage."]).map((w,i)=>(
                <span key={w} style={{display:"block",fontSize:"clamp(42px,6vw,80px)",fontWeight:700,color:i===2?GREEN_ACCENT:"white",opacity:visible?1:0,transform:visible?"translateX(0)":"translateX(-40px)",transition:`all 0.7s ease ${0.2+i*0.15}s`}}>{w}</span>
              ))}
            </h1>
            <p style={{fontSize:18,color:"rgba(255,255,255,0.75)",lineHeight:1.8,margin:"0 0 44px",maxWidth:520,opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(20px)",transition:"all 0.7s ease 0.65s"}}>{t.home.sub}</p>
            <div style={{display:"flex",gap:16,flexWrap:"wrap",opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(20px)",transition:"all 0.7s ease 0.8s"}}>
              <PillBtn onClick={()=>setPage("about")}>{t.home.cta} ↗</PillBtn>
              {!user&&<PillBtn onClick={onMemberClick} variant="ghost">{t.home.member}</PillBtn>}
            </div>
          </div>
        </div>
        <div style={{position:"absolute",bottom:-2,left:0,right:0}}>
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{display:"block",width:"100%",height:80}}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f8f9fa"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} style={{background:`linear-gradient(90deg,${GREEN_DARK},${GREEN_MID},#0d4a52)`,padding:"56px 32px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 20% 50%,rgba(255,255,255,0.05) 0%,transparent 60%),radial-gradient(circle at 80% 50%,rgba(255,255,255,0.05) 0%,transparent 60%)",pointerEvents:"none"}}/>
        <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,position:"relative",zIndex:2}}>
          {t.stats.map((s,i)=>(
            <div key={s.l} style={{textAlign:"center",padding:"16px 24px",borderRight:i<3?"1px solid rgba(255,255,255,0.15)":"none"}}>
              <div style={{fontSize:36,marginBottom:8}}>{s.i}</div>
              <div style={{fontSize:"clamp(36px,4vw,56px)",fontWeight:800,color:"white",fontFamily:"Georgia,serif",lineHeight:1}}>{counts[i]}{s.v.includes("+")?"+":" "}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginTop:10,fontWeight:500,letterSpacing:0.5}}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section style={{background:"#f8f9fa",padding:"100px 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:80,alignItems:"center"}}>
            <div>
              <SectionLabel>{t.about.label}</SectionLabel>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,4vw,44px)",color:"#1a1a1a",margin:"0 0 24px",lineHeight:1.2}}>{t.about.title}</h2>
              <p style={{color:"#555",fontSize:16,lineHeight:1.9,margin:"0 0 32px"}}>{t.about.body}</p>
              <PillBtn variant="dark" onClick={()=>setPage("about")}>{t.about.cta}</PillBtn>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {t.about.features.map(f=>(
                <div key={f.t} style={{background:"white",borderRadius:16,padding:28,boxShadow:"0 4px 24px rgba(0,0,0,0.06)",transition:"all 0.3s",borderTop:"3px solid transparent"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.1)";e.currentTarget.style.borderTopColor=GREEN;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.06)";e.currentTarget.style.borderTopColor="transparent";}}
                >
                  <div style={{fontSize:32,marginBottom:14}}>{f.icon}</div>
                  <div style={{fontWeight:700,fontSize:15,color:"#1a1a1a",marginBottom:8,fontFamily:"Georgia,serif"}}>{f.t}</div>
                  <div style={{fontSize:13,color:"#666",lineHeight:1.6}}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* News */}
      <section style={{background:"white",padding:"100px 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:48,flexWrap:"wrap",gap:20}}>
            <div><SectionLabel>{t.home.recentNews}</SectionLabel><h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(26px,3.5vw,40px)",color:"#1a1a1a",margin:0,lineHeight:1.2}}>{t.home.newsSubtitle}</h2></div>
            <PillBtn variant="outline" small onClick={()=>setPage("news")}>{t.home.allNews}</PillBtn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:28}}>
            {news.slice(0,2).map(n=><ContentCard key={n.id} item={n} onClick={()=>{}} type="news"/>)}
          </div>
        </div>
      </section>

      {/* Events */}
      <section style={{background:"#f8f9fa",padding:"100px 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:48,flexWrap:"wrap",gap:20}}>
            <div><SectionLabel>{t.home.upcomingEvents}</SectionLabel><h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(26px,3.5vw,40px)",color:"#1a1a1a",margin:0,lineHeight:1.2}}>{t.home.eventsSubtitle}</h2></div>
            <PillBtn variant="outline" small onClick={()=>setPage("events")}>{t.home.allEvents}</PillBtn>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:28}}>
            {homeEvents.map(e=><ContentCard key={e.id} item={e} onClick={()=>setPage("events")} type="event"/>)}
            {homeEvents.length===0&&<p style={{color:"#888"}}>{t.events.noEvents}</p>}
          </div>
        </div>
      </section>

      {/* Member Banner */}
      <section style={{padding:"100px 32px",background:"white"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{background:`linear-gradient(135deg,${GREEN_DARK},${GREEN_MID},#0d4a52)`,borderRadius:28,overflow:"hidden",position:"relative",display:"grid",gridTemplateColumns:"1fr 1fr",minHeight:340}}>
            <WavyBg/>
            <div style={{position:"absolute",top:24,right:24,color:"rgba(255,255,255,0.12)",fontSize:48}}>✦</div>
            <div style={{padding:"64px 56px",position:"relative",zIndex:2,display:"flex",flexDirection:"column",justifyContent:"center"}}>
              <SectionLabel>{T[lang].member.join}</SectionLabel>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(24px,3vw,38px)",color:"white",margin:"0 0 20px",lineHeight:1.2}}>{T[lang].nav.member}</h2>
              <p style={{color:"rgba(255,255,255,0.75)",fontSize:15,lineHeight:1.8,margin:"0 0 32px"}}>{T[lang].member.subtitle}</p>
              {!user&&<div style={{alignSelf:"flex-start"}}><PillBtn onClick={onMemberClick}>{T[lang].nav.member} ↗</PillBtn></div>}
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:48,position:"relative",zIndex:2}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,width:"100%"}}>
                {T[lang].member.benefits.map((b,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"16px 18px",border:"1px solid rgba(255,255,255,0.15)",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:22}}>{["🏅","📚","👥","📅"][i]}</span>
                    <span style={{color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:500}}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection/>
    </div>
  );
}

function FAQSection() {
  const {lang} = useLang();
  const t = T[lang].faq;
  const [open,setOpen] = useState(0);
  return (
    <section style={{background:`linear-gradient(145deg,${PURE_GREEN_DARK},${PURE_GREEN_MID},#1e7a52)`,padding:"100px 32px",position:"relative",overflow:"hidden"}}>
      <WavyBg color="rgba(255,255,255,0.04)"/>
      <div style={{position:"absolute",inset:0,backgroundImage:`linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)`,backgroundSize:"60px 60px",pointerEvents:"none"}}/>
      <div style={{maxWidth:1200,margin:"0 auto",position:"relative",zIndex:2}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.4fr",gap:80,alignItems:"start"}}>
          <div>
            <SectionLabel>{t.title}</SectionLabel>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,3.5vw,44px)",color:"white",margin:"0 0 24px",lineHeight:1.2}}>{t.subtitle}</h2>
            <p style={{color:"rgba(255,255,255,0.6)",fontSize:15,lineHeight:1.8}}>{t.desc}</p>
            <div style={{marginTop:40,padding:28,background:"rgba(255,255,255,0.06)",borderRadius:20,border:"1px solid rgba(255,255,255,0.1)"}}>
              <div style={{fontSize:28,marginBottom:12}}>💬</div>
              <div style={{color:"white",fontWeight:700,marginBottom:8}}>{t.notFound}</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:13,marginBottom:16}}>{t.notFoundDesc}</div>
              <a href="mailto:contact@abhr.md" style={{display:"inline-flex",alignItems:"center",gap:8,color:GREEN_ACCENT,fontSize:14,fontWeight:700,textDecoration:"none",background:"rgba(46,204,138,0.12)",border:"1px solid rgba(46,204,138,0.3)",padding:"10px 20px",borderRadius:50,transition:"all 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(46,204,138,0.22)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(46,204,138,0.12)"}
              >✉ contact@abhr.md</a>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {t.items.map((faq,i)=>(
              <div key={i} style={{background:open===i?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.05)",borderRadius:16,border:`1px solid ${open===i?"rgba(46,204,138,0.4)":"rgba(255,255,255,0.08)"}`,overflow:"hidden",transition:"all 0.3s",cursor:"pointer"}} onClick={()=>setOpen(open===i?-1:i)}>
                <div style={{padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
                  <div style={{display:"flex",alignItems:"center",gap:16}}>
                    <span style={{background:open===i?GREEN_ACCENT:"rgba(255,255,255,0.1)",color:"white",width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0,transition:"all 0.3s"}}>{String(i+1).padStart(2,"0")}</span>
                    <span style={{color:"white",fontWeight:600,fontSize:15}}>{faq.q}</span>
                  </div>
                  <span style={{color:open===i?GREEN_ACCENT:"rgba(255,255,255,0.4)",fontSize:20,transition:"all 0.3s",transform:open===i?"rotate(45deg)":"none",flexShrink:0}}>+</span>
                </div>
                {open===i&&<div style={{padding:"0 24px 20px 72px"}}><p style={{color:"rgba(255,255,255,0.7)",fontSize:14,lineHeight:1.8,margin:0}}>{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage({onMemberClick}) {
  const {lang} = useLang();
  const {user} = useAuth();
  const t = T[lang];
  return (
    <div>
      <PageHero title={t.about.label} subtitle={t.about.body}/>
      <section style={{background:"#f8f9fa",padding:"80px 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:24}}>
            {t.about.features.map(f=>(
              <div key={f.t} style={{background:"white",borderRadius:16,padding:32,boxShadow:"0 4px 24px rgba(0,0,0,0.06)",borderTop:`4px solid ${GREEN}`,transition:"all 0.3s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.1)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.06)";}}
              >
                <div style={{fontSize:36,marginBottom:16}}>{f.icon}</div>
                <h3 style={{fontFamily:"Georgia,serif",fontSize:18,color:"#1a1a1a",margin:"0 0 12px"}}>{f.t}</h3>
                <p style={{color:"#666",fontSize:14,lineHeight:1.7,margin:0}}>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{background:"white",padding:"80px 32px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <SectionLabel>{t.member.join}</SectionLabel>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(26px,4vw,40px)",color:"#1a1a1a",margin:"0 0 20px"}}>{t.nav.member}</h2>
          <p style={{color:"#555",fontSize:16,lineHeight:1.8,margin:"0 0 32px"}}>{t.member.subtitle}</p>
          <PillBtn onClick={onMemberClick}>{t.nav.member} ↗</PillBtn>
        </div>
      </section>
      <FAQSection/>
    </div>
  );
}

// ─── NEWS PAGE ────────────────────────────────────────────────────────────────
function NewsListPage({news,setSelectedNews,setPage}) {
  const {lang} = useLang();
  const t = T[lang].news;
  return (
    <div>
      <PageHero title={t.title} subtitle={t.subtitle}/>
      <section style={{background:"#f8f9fa",padding:"80px 32px",minHeight:400}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          {news.length===0&&<p style={{color:"#888",textAlign:"center",padding:60}}>{t.noNews}</p>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:28}}>
            {news.map(n=><ContentCard key={n.id} item={n} onClick={()=>{setSelectedNews(n);setPage("newsDetail");}} type="news"/>)}
          </div>
        </div>
      </section>
    </div>
  );
}

function NewsDetailPage({item,setPage}) {
  const {lang} = useLang();
  const t = T[lang].news;
  if(!item){setPage("news");return null;}
  const title=lang==="ro"?item.title_ro:item.title_en;
  const body=lang==="ro"?item.body_ro:item.body_en;
  return (
    <div style={{paddingTop:72}}>
      {item.image_url&&<div style={{width:"100%",maxHeight:480,overflow:"hidden"}}><img src={item.image_url} alt={title} style={{width:"100%",height:480,objectFit:"cover"}}/></div>}
      <div style={{maxWidth:800,margin:"0 auto",padding:"60px 32px"}}>
        <BackBtn onClick={()=>setPage("news")} label={t.back}/>
        <div style={{fontSize:12,color:"#999",marginBottom:12,fontWeight:600,letterSpacing:1}}>{item.date}</div>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(24px,4vw,40px)",color:"#1a1a1a",margin:"0 0 32px",lineHeight:1.2}}>{title}</h1>
        <div style={{fontSize:17,lineHeight:1.9,color:"#333",whiteSpace:"pre-wrap"}}>{body}</div>
      </div>
    </div>
  );
}

// ─── EVENTS PAGE ──────────────────────────────────────────────────────────────
function EventsListPage({events,setSelectedEvent,setPage}) {
  const {lang} = useLang();
  const t = T[lang].events;
  const ordered=[...events.filter(e=>e.status==="ongoing"),...events.filter(e=>e.status==="upcoming").sort((a,b)=>new Date(a.date)-new Date(b.date)),...events.filter(e=>e.status==="past").sort((a,b)=>new Date(b.date)-new Date(a.date))];
  return (
    <div>
      <PageHero title={t.title} subtitle={t.subtitle} dark/>
      <section style={{background:"#f8f9fa",padding:"80px 32px",minHeight:400}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          {ordered.length===0&&<p style={{color:"#888",textAlign:"center",padding:60}}>{t.noEvents}</p>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:28}}>
            {ordered.map(e=>(
              <div key={e.id} onClick={()=>{setSelectedEvent(e);setPage("eventDetail");}} style={{background:"white",borderRadius:20,overflow:"hidden",cursor:"pointer",transition:"all 0.3s",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",position:"relative"}}
                onMouseEnter={ev=>{ev.currentTarget.style.transform="translateY(-6px)";ev.currentTarget.style.boxShadow="0 20px 60px rgba(0,0,0,0.1)";}}
                onMouseLeave={ev=>{ev.currentTarget.style.transform="";ev.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.06)";}}
              >
                <div style={{background:e.status==="ongoing"?"#ffc107":e.status==="upcoming"?GREEN:RED,height:6}}/>
                <div style={{position:"absolute",top:18,right:16}}><StatusBadge status={e.status}/></div>
                <div style={{padding:"32px 28px 28px"}}>
                  <div style={{display:"flex",gap:16,alignItems:"flex-start",marginBottom:20}}>
                    <div style={{background:RED_LIGHT,borderRadius:12,padding:"12px 16px",textAlign:"center",minWidth:60,flexShrink:0}}>
                      <div style={{fontSize:26,fontWeight:800,color:RED,lineHeight:1}}>{e.date?.split("-")[2]}</div>
                      <div style={{fontSize:10,color:RED,fontWeight:700,letterSpacing:1}}>{e.date?.split("-")[1]}/{e.date?.split("-")[0]?.slice(2)}</div>
                    </div>
                    <h3 style={{fontFamily:"Georgia,serif",fontSize:18,color:"#1a1a1a",margin:0,lineHeight:1.3,paddingTop:4}}>{lang==="ro"?e.title_ro:e.title_en}</h3>
                  </div>
                  <div style={{fontSize:13,color:"#888",marginBottom:20}}>📍 {lang==="ro"?e.location_ro:e.location_en}</div>
                  <span style={{color:GREEN,fontSize:13,fontWeight:700}}>{t.details} ↗</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function EventDetailPage({item,setPage,albums,setSelectedGalleryAlbum}) {
  const {lang} = useLang();
  const t = T[lang].events;
  if(!item){setPage("events");return null;}
  const title=lang==="ro"?item.title_ro:item.title_en;
  const desc=lang==="ro"?item.desc_ro:item.desc_en;
  const location=lang==="ro"?item.location_ro:item.location_en;
  const linkedAlbum=albums.find(a=>a.id===item.album_id);
  return (
    <div style={{paddingTop:72}}>
      <div style={{background:`linear-gradient(135deg,${GREEN_DARK},${GREEN_MID})`,padding:"60px 32px 80px",position:"relative",overflow:"hidden"}}>
        <WavyBg/>
        <div style={{maxWidth:1200,margin:"0 auto",position:"relative",zIndex:2}}>
          <BackBtn onClick={()=>setPage("events")} label={t.back}/>
          <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:16}}>
            <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(24px,4vw,44px)",color:"white",margin:0,lineHeight:1.2}}>{title}</h1>
            <StatusBadge status={item.status}/>
          </div>
          <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
            <span style={{color:"rgba(255,255,255,0.75)",fontSize:14}}>📅 {item.date}</span>
            <span style={{color:"rgba(255,255,255,0.75)",fontSize:14}}>📍 {location}</span>
          </div>
        </div>
        <div style={{position:"absolute",bottom:-2,left:0,right:0}}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{display:"block",width:"100%",height:60}}><path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8f9fa"/></svg>
        </div>
      </div>
      <div style={{background:"#f8f9fa",padding:"60px 32px"}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"flex",flexDirection:"column",gap:24}}>
          {desc&&<div style={{background:"white",borderRadius:16,padding:36,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}><p style={{fontSize:16,lineHeight:1.9,color:"#333",margin:0,whiteSpace:"pre-wrap"}}>{desc}</p></div>}
          {item.agenda_url&&(
            <div style={{background:"white",borderRadius:16,padding:28,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}><span style={{fontSize:32}}>📄</span><div style={{fontWeight:700,color:"#1a1a1a",fontSize:16}}>{t.agenda}</div></div>
                <a href={item.agenda_url} target="_blank" rel="noreferrer"><PillBtn small variant="dark">↓ Download</PillBtn></a>
              </div>
              <iframe
                src={`https://docs.google.com/gview?url=${encodeURIComponent(item.agenda_url)}&embedded=true`}
                style={{width:"100%",height:500,border:"none",borderRadius:10,background:"#f5f5f5"}}
                title="Agenda"
              />
            </div>
          )}
          {item.speakers_image_url&&(
            <div style={{background:"white",borderRadius:16,padding:28,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <h3 style={{fontFamily:"Georgia,serif",color:"#1a1a1a",marginBottom:16,margin:"0 0 16px"}}>{t.speakers}</h3>
              <img src={item.speakers_image_url} alt="speakers" style={{width:"100%",borderRadius:12}}/>
            </div>
          )}
          {linkedAlbum&&(
            <div style={{background:"white",borderRadius:16,padding:24,boxShadow:"0 4px 20px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                {linkedAlbum.cover_url&&<img src={linkedAlbum.cover_url} alt="" style={{width:72,height:52,objectFit:"cover",borderRadius:8}}/>}
                <div><div style={{fontSize:12,color:"#888",marginBottom:4}}>{t.gallery}</div><div style={{fontWeight:700,color:"#1a1a1a"}}>{lang==="ro"?linkedAlbum.name_ro:linkedAlbum.name_en}</div></div>
              </div>
              <PillBtn small variant="dark" onClick={()=>{ if(setSelectedGalleryAlbum) setSelectedGalleryAlbum(linkedAlbum); setPage("gallery"); }}>{t.viewGallery}</PillBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GALLERY PAGE ─────────────────────────────────────────────────────────────
function GalleryPage({albums, initialAlbum=null, onAlbumOpen}) {
  const {lang} = useLang();
  const t = T[lang].gallery;
  const [selectedAlbum,setSelectedAlbum] = useState(initialAlbum);
  const [lightbox,setLightbox] = useState(null);
  useEffect(()=>{
    if(initialAlbum){ setSelectedAlbum(initialAlbum); if(onAlbumOpen) onAlbumOpen(); }
  },[initialAlbum]);

  if(lightbox!==null&&selectedAlbum) {
    const photos=selectedAlbum.photos||[];
    const photo=photos[lightbox];
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}} onClick={()=>setLightbox(null)}>
        <button onClick={()=>setLightbox(null)} style={{position:"absolute",top:20,right:24,background:"transparent",border:"none",color:"white",fontSize:32,cursor:"pointer"}}>✕</button>
        <img src={photo.url} alt="" style={{maxWidth:"90vw",maxHeight:"80vh",borderRadius:8,objectFit:"contain"}} onClick={e=>e.stopPropagation()}/>
        {(photo.caption_ro||photo.caption_en)&&<p style={{color:"rgba(255,255,255,0.8)",marginTop:16,fontSize:14}}>{lang==="ro"?photo.caption_ro:photo.caption_en}</p>}
        <div style={{display:"flex",gap:12,marginTop:16}} onClick={e=>e.stopPropagation()}>
          <button onClick={()=>setLightbox(i=>Math.max(0,i-1))} disabled={lightbox===0} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",padding:"8px 20px",borderRadius:6,cursor:"pointer",fontSize:18}}>‹</button>
          <span style={{color:"rgba(255,255,255,0.6)",fontSize:13,alignSelf:"center"}}>{lightbox+1}/{photos.length}</span>
          <button onClick={()=>setLightbox(i=>Math.min(photos.length-1,i+1))} disabled={lightbox===photos.length-1} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"white",padding:"8px 20px",borderRadius:6,cursor:"pointer",fontSize:18}}>›</button>
        </div>
      </div>
    );
  }

  if(selectedAlbum) {
    const photos=selectedAlbum.photos||[];
    return (
      <div>
        <PageHero title={lang==="ro"?selectedAlbum.name_ro:selectedAlbum.name_en} subtitle=""/>
        <section style={{background:"#f8f9fa",padding:"60px 32px"}}>
          <div style={{maxWidth:1200,margin:"0 auto"}}>
            <BackBtn onClick={()=>setSelectedAlbum(null)} label={t.back}/>
            {photos.length===0&&<p style={{color:"#888"}}>{t.noPhotos}</p>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
              {photos.map((photo,idx)=>(
                <div key={photo.id} onClick={()=>setLightbox(idx)} style={{cursor:"pointer",borderRadius:12,overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.1)",aspectRatio:"4/3",position:"relative",background:"#000"}}
                  onMouseEnter={e=>{e.currentTarget.querySelector("img").style.transform="scale(1.05)";e.currentTarget.querySelector("img").style.opacity="0.85";}}
                  onMouseLeave={e=>{e.currentTarget.querySelector("img").style.transform="scale(1)";e.currentTarget.querySelector("img").style.opacity="1";}}
                >
                  <img src={photo.url} alt="" style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s,opacity 0.3s"}}/>
                  {(photo.caption_ro||photo.caption_en)&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(0,0,0,0.7))",color:"white",fontSize:12,padding:"20px 12px 10px"}}>{lang==="ro"?photo.caption_ro:photo.caption_en}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero title={t.title} subtitle={t.subtitle}/>
      <section style={{background:"#f8f9fa",padding:"80px 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          {albums.length===0&&<p style={{color:"#888",textAlign:"center",padding:60}}>{t.noPhotos}</p>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:28}}>
            {albums.map(album=>(
              <div key={album.id} onClick={()=>setSelectedAlbum(album)} style={{cursor:"pointer",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.08)",background:"white",transition:"all 0.3s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-6px)";e.currentTarget.style.boxShadow="0 20px 60px rgba(0,0,0,0.12)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.08)";}}
              >
                <div style={{height:220,overflow:"hidden",background:GREEN_DARK,position:"relative"}}>
                  {album.cover_url?<img src={album.cover_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>🖼</div>}
                  <div style={{position:"absolute",top:12,right:12,background:"rgba(0,0,0,0.55)",color:"white",fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600}}>{album.photos?.length||0} foto</div>
                </div>
                <div style={{padding:"20px 24px"}}>
                  <h3 style={{fontFamily:"Georgia,serif",fontSize:18,color:"#1a1a1a",margin:0}}>{lang==="ro"?album.name_ro:album.name_en}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── ARTICLE LIST (Research / Education) ─────────────────────────────────────
function ArticleListPage({items,type,setSelectedArticle,setPage}) {
  const {lang} = useLang();
  const t = T[lang][type];
  return (
    <div>
      <PageHero title={t.title} subtitle={t.subtitle} dark={type==="research"}/>
      <section style={{background:"#f8f9fa",padding:"80px 32px",minHeight:400}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          {items.length===0&&<p style={{color:"#888",textAlign:"center",padding:60}}>{t.noPosts}</p>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:28}}>
            {items.map(item=><ContentCard key={item.id} item={item} onClick={()=>{setSelectedArticle(item);setPage(type+"Detail");}} type="news"/>)}
          </div>
        </div>
      </section>
    </div>
  );
}

function ArticleDetailPage({item,type,setPage}) {
  const {lang} = useLang();
  const t = T[lang][type];
  if(!item){setPage(type);return null;}
  const title=lang==="ro"?item.title_ro:item.title_en;
  const body=lang==="ro"?item.body_ro:item.body_en;
  return (
    <div style={{paddingTop:72}}>
      {item.image_url&&<div style={{width:"100%",maxHeight:480,overflow:"hidden"}}><img src={item.image_url} alt={title} style={{width:"100%",height:480,objectFit:"cover"}}/></div>}
      <div style={{maxWidth:800,margin:"0 auto",padding:"60px 32px"}}>
        <BackBtn onClick={()=>setPage(type)} label={t.back}/>
        <div style={{fontSize:12,color:"#999",marginBottom:12,fontWeight:600,letterSpacing:1}}>{item.date}</div>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(24px,4vw,40px)",color:"#1a1a1a",margin:"0 0 32px",lineHeight:1.2}}>{title}</h1>
        <div style={{fontSize:17,lineHeight:1.9,color:"#333",whiteSpace:"pre-wrap"}}>{body}</div>
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({setPage}) {
  const {lang} = useLang();
  const {login} = useAuth();
  const t = T[lang].login;
  const [card,setCard] = useState("");
  const [pass,setPass] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);setError("");
    const r = await login(card.trim(),pass);
    setLoading(false);
    if(r) setPage(r.isAdmin?"admin":"profile");
    else setError(t.error);
  };
  return (
    <div style={{minHeight:"100vh",background:`linear-gradient(145deg,${GREEN_DARK},${GREEN_MID})`,display:"flex",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <WavyBg/>
      <div style={{background:"rgba(255,255,255,0.07)",borderRadius:24,backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",padding:"52px 44px",width:"100%",maxWidth:440,position:"relative",zIndex:2}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <ABHRLogo size={60} white horizontal/>
          <h2 style={{margin:"24px 0 8px",fontFamily:"Georgia,serif",color:"white",fontSize:26}}>{t.title}</h2>
        </div>
        <div style={{marginBottom:18}}>
          <label style={{display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.75)"}}>{t.cardLabel}</label>
          <input value={card} onChange={e=>setCard(e.target.value)} placeholder={lang==="ro"?"Nr. card sau email admin":"Card number or admin email"}
            style={{width:"100%",padding:"13px 16px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,color:"white",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
            onFocus={e=>e.target.style.border=`1px solid ${GREEN_ACCENT}`} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.15)"}
          />
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:"block",marginBottom:6,fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.75)"}}>{t.passLabel}</label>
          <input value={pass} onChange={e=>setPass(e.target.value)} type="password"
            style={{width:"100%",padding:"13px 16px",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,color:"white",fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}
            onFocus={e=>e.target.style.border=`1px solid ${GREEN_ACCENT}`} onBlur={e=>e.target.style.border="1px solid rgba(255,255,255,0.15)"}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
          />
        </div>
        {error&&<div style={{background:"rgba(192,57,43,0.2)",color:"#ff8a8a",border:"1px solid rgba(192,57,43,0.4)",padding:"10px 14px",borderRadius:10,fontSize:13,marginBottom:16}}>{error}</div>}
        <button onClick={handleLogin} disabled={loading} style={{width:"100%",background:GREEN_ACCENT,border:"none",color:"white",padding:14,borderRadius:50,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 28px rgba(46,204,138,0.4)",opacity:loading?0.7:1}}>
          {loading?"...":t.btn+" ↗"}
        </button>
        <p style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:20}}>{t.forgot}</p>
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({certificates,events}) {
  const {lang} = useLang();
  const {user} = useAuth();
  const t = T[lang].profile;
  const [viewingCert,setViewingCert] = useState(null);
  const userCerts = certificates.filter(c=>c.member_id===user?.id);
  const downloadCert = (cert,evTitle) => {
    const img=new Image();img.crossOrigin="anonymous";
    img.onload=()=>{const c=document.createElement("canvas");c.width=img.width;c.height=img.height;c.getContext("2d").drawImage(img,0,0);const a=document.createElement("a");a.download=`certificat-${evTitle||"participare"}.png`;a.href=c.toDataURL("image/png");a.click();};
    img.src=cert.image_url;
  };
  const getEventTitle=(eventId)=>{const ev=events.find(e=>e.id===eventId);if(!ev)return eventId;return lang==="ro"?ev.title_ro:ev.title_en;};
  return (
    <div>
      <div style={{background:`linear-gradient(145deg,${GREEN_DARK},${GREEN_MID})`,padding:"120px 32px 80px",position:"relative",overflow:"hidden"}}>
        <WavyBg/>
        <div style={{maxWidth:800,margin:"0 auto",position:"relative",zIndex:2,display:"flex",alignItems:"center",gap:28}}>
          <div style={{width:88,height:88,borderRadius:"50%",background:"rgba(255,255,255,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,color:"white",fontWeight:700,border:"3px solid rgba(255,255,255,0.3)",flexShrink:0}}>{user?.name?.[0]||"M"}</div>
          <div>
            <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(24px,4vw,40px)",color:"white",margin:"0 0 8px"}}>{user?.name}</h1>
            <span style={{background:"rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.9)",fontSize:13,padding:"4px 14px",borderRadius:20,fontWeight:600}}>{user?.card_number}</span>
          </div>
        </div>
        <div style={{position:"absolute",bottom:-2,left:0,right:0}}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{display:"block",width:"100%",height:60}}><path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8f9fa"/></svg>
        </div>
      </div>
      <div style={{background:"#f8f9fa",padding:"60px 32px"}}>
        <div style={{maxWidth:800,margin:"0 auto",display:"flex",flexDirection:"column",gap:32}}>
          <div style={{background:"white",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.07)"}}>
            <div style={{padding:"28px 32px",borderBottom:"1px solid #f0f0f0"}}>
              <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1a1a1a",margin:0}}>{t.title}</h2>
            </div>
            <div style={{padding:"8px 32px 24px"}}>
              {[{label:t.name,value:user?.name},{label:t.memberId,value:user?.card_number},{label:t.joinDate,value:user?.join_date},{label:t.email,value:user?.email}].map(row=>(
                <div key={row.label} style={{display:"flex",justifyContent:"space-between",padding:"16px 0",borderBottom:"1px solid #f8f8f8"}}>
                  <span style={{color:"#888",fontSize:14}}>{row.label}</span>
                  <span style={{fontWeight:700,color:"#1a1a1a",fontSize:14}}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:22,color:"#1a1a1a",margin:"0 0 20px"}}>{t.certs}</h2>
            {userCerts.length===0?<p style={{color:"#888"}}>{t.noCerts}</p>:(
              <div style={{display:"flex",flexDirection:"column",gap:16}}>
                {userCerts.map(cert=>{
                  const evTitle=getEventTitle(cert.event_id);
                  return (
                    <div key={cert.id} style={{background:"white",borderRadius:16,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.07)"}}>
                      <div style={{background:`linear-gradient(90deg,${GREEN_DARK},${GREEN_MID})`,height:4}}/>
                      <div style={{padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:14}}>
                          <img src={cert.image_url} alt="" style={{width:80,height:56,objectFit:"cover",borderRadius:8}}/>
                          <div>
                            <div style={{fontWeight:700,fontSize:15,color:"#1a1a1a"}}>🏅 {t.view}</div>
                            <div style={{fontSize:13,color:"#888",marginTop:3}}>{evTitle}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",gap:10}}>
                          <PillBtn small variant="outline" onClick={()=>setViewingCert(cert)}>{t.view}</PillBtn>
                          <PillBtn small variant="dark" onClick={()=>downloadCert(cert,evTitle)}>⬇ {t.download}</PillBtn>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {viewingCert&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}} onClick={()=>setViewingCert(null)}>
          <button onClick={()=>setViewingCert(null)} style={{position:"absolute",top:20,right:24,background:"transparent",border:"none",color:"white",fontSize:32,cursor:"pointer"}}>✕</button>
          <img src={viewingCert.image_url} alt="Certificate" style={{maxWidth:"90vw",maxHeight:"85vh",borderRadius:8,objectFit:"contain"}} onClick={e=>e.stopPropagation()}/>
        </div>
      )}
    </div>
  );
}


// ─── ADMIN PANEL (unchanged functional style) ─────────────────────────────────
function AdminPage({members,setMembers,news,setNews,events,setEvents,albums,setAlbums,research,setResearch,education,setEducation,certificates,setCertificates}) {
  const {lang} = useLang();
  const t = T[lang].admin;
  const GREEN_A="#1a6b4a",RED_A="#c0392b",GREEN_LIGHT_A="#e8f5ee",RED_LIGHT_A="#fdf0ee";
  const inputStyleA={width:"100%",padding:"10px 14px",border:"1.5px solid #ddd",borderRadius:8,fontSize:14,fontFamily:"inherit",outline:"none",boxSizing:"border-box",background:"white"};
  const [tab,setTab] = useState("members");
  const [editItem,setEditItem] = useState(null);
  const [showForm,setShowForm] = useState(false);
  const [form,setForm] = useState({});
  const [saving,setSaving] = useState(false);
  const [photoAlbum,setPhotoAlbum] = useState(null);
  const [photoForm,setPhotoForm] = useState({});
  const [showPhotoForm,setShowPhotoForm] = useState(false);
  const [certMember,setCertMember] = useState(null);
  const [certForm,setCertForm] = useState({});
  const [showCertForm,setShowCertForm] = useState(false);

  const tabs=[{key:"members",label:t.tabs.members},{key:"news",label:t.tabs.news},{key:"events",label:t.tabs.events},{key:"gallery",label:t.tabs.gallery},{key:"research",label:t.tabs.research},{key:"education",label:t.tabs.education}];
  const openAdd=()=>{setEditItem(null);setForm({});setShowForm(true);};
  const openEdit=(item)=>{setEditItem(item);setForm({...item});setShowForm(true);};
  const closeForm=()=>{setShowForm(false);setEditItem(null);setForm({});};

  const getData=()=>{
    if(tab==="members")return[members,setMembers,"members"];
    if(tab==="news")return[news,setNews,"news"];
    if(tab==="events")return[events,setEvents,"events"];
    if(tab==="gallery")return[albums,setAlbums,"albums"];
    if(tab==="research")return[research,setResearch,"research"];
    return[education,setEducation,"education"];
  };

  const buildPayload=()=>{
    if(tab==="members"){
      let password_hash = form.password_hash;
      if(form.password) {
        // We'll hash async before save - store temporarily
        password_hash = "__PENDING__" + form.password;
      }
      return{card_number:form.card_number,name:form.name,email:form.email,join_date:form.join_date||null,password_hash};
    }
    if(tab==="news"||tab==="research"||tab==="education")return{title_ro:form.title_ro,title_en:form.title_en,body_ro:form.body_ro,body_en:form.body_en,image_url:form.image_url||null,date:form.date||new Date().toISOString().slice(0,10)};
    if(tab==="events")return{title_ro:form.title_ro,title_en:form.title_en,date:form.date,location_ro:form.location_ro,location_en:form.location_en,desc_ro:form.desc_ro,desc_en:form.desc_en,status:form.status||"upcoming",agenda_url:form.agenda_url||null,speakers_image_url:form.speakers_image_url||null,album_id:form.album_id||null};
    return{name_ro:form.albumNameRo||"",name_en:form.albumNameEn||"",cover_url:form.coverUrl||null};
  };

  const [formError, setFormError] = useState("");
  const handleSave=async()=>{
    setFormError("");
    // Validate required fields per tab
    if(tab==="events"){
      if(!form.title_ro?.trim()||!form.title_en?.trim()){setFormError(lang==="ro"?"Titlul evenimentului (RO și EN) este obligatoriu.":"Event title (RO and EN) is required.");return;}
      if(!form.status){setFormError(lang==="ro"?"Statusul este obligatoriu.":"Status is required.");return;}
    }
    if(tab==="news"||tab==="research"||tab==="education"){
      if(!form.title_ro?.trim()||!form.title_en?.trim()){setFormError(lang==="ro"?"Titlul (RO și EN) este obligatoriu.":"Title (RO and EN) is required.");return;}
    }
    if(tab==="members"){
      if(!form.name?.trim()||!form.card_number?.trim()){setFormError(lang==="ro"?"Numele și numărul de card sunt obligatorii.":"Name and card number are required.");return;}
    }
    if(tab==="gallery"){
      if(!form.albumNameRo?.trim()||!form.albumNameEn?.trim()){setFormError(lang==="ro"?"Numele albumului (RO și EN) este obligatoriu.":"Album name (RO and EN) is required.");return;}
    }
    setSaving(true);
    const[data,setter,tableName]=getData();
    let payload=buildPayload();
    // Resolve async password hash for members
    if(tab==="members"&&payload.password_hash?.startsWith("__PENDING__")){
      const plainPw = payload.password_hash.replace("__PENDING__","");
      payload.password_hash = await hashPasswordAsync(plainPw);
    }
    const tname=tableName==="gallery"?"albums":tableName;
    try{
      if(editItem){await db.update(tname,editItem.id,payload);setter(arr=>arr.map(x=>x.id===editItem.id?{...x,...payload}:x));}
      else{const res=await db.insert(tname,payload);const ni=res[0]||{...payload,id:Date.now().toString(),created_at:new Date().toISOString()};if(tab==="gallery")setter(arr=>[{...ni,photos:[],...arr}]);else setter(arr=>[ni,...arr]);}
    }catch(e){console.error(e);}
    setSaving(false);closeForm();
  };

  const handleDelete=async(id)=>{
    const[,setter,tableName]=getData();const tname=tableName==="gallery"?"albums":tableName;
    await db.delete(tname,id);setter(arr=>arr.filter(x=>x.id!==id));
  };

  // Drag-and-drop album reordering
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
  const handleDrop = async (idx) => {
    if(dragIdx===null||dragIdx===idx){ setDragIdx(null);setDragOverIdx(null);return; }
    const reordered = [...albums];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(idx, 0, moved);
    // Update sort_order for all albums
    const updated = reordered.map((a,i) => ({...a, sort_order:i+1}));
    setAlbums(updated);
    setDragIdx(null); setDragOverIdx(null);
    // Persist to Supabase
    for(const a of updated){
      await db.update("albums", a.id, {sort_order: a.sort_order});
    }
  };

  const handleAddPhoto=async()=>{
    if(!photoForm.photoUrl)return;
    const payload={album_id:photoAlbum.id,url:photoForm.photoUrl,caption_ro:photoForm.captionRo||"",caption_en:photoForm.captionEn||""};
    const res=await db.insert("photos",payload);const np=res[0]||{...payload,id:Date.now().toString()};
    setAlbums(as=>as.map(a=>a.id===photoAlbum.id?{...a,photos:[...(a.photos||[]),np]}:a));
    setPhotoAlbum(prev=>({...prev,photos:[...(prev.photos||[]),np]}));
    setPhotoForm({});setShowPhotoForm(false);
  };

  const handleDeletePhoto=async(photoId)=>{
    await db.delete("photos",photoId);
    setAlbums(as=>as.map(a=>a.id===photoAlbum.id?{...a,photos:a.photos.filter(p=>p.id!==photoId)}:a));
    setPhotoAlbum(prev=>({...prev,photos:prev.photos.filter(p=>p.id!==photoId)}));
  };

  const handleAddCert=async()=>{
    if(!certForm.event_id||!certForm.cert_image_url)return;
    const payload={member_id:certMember.id,event_id:certForm.event_id,image_url:certForm.cert_image_url};
    const res=await db.insert("certificates",payload);const nc=res[0]||{...payload,id:Date.now().toString()};
    setCertificates(cs=>[nc,...cs]);setCertForm({});setShowCertForm(false);
  };

  const handleDeleteCert=async(id)=>{await db.delete("certificates",id);setCertificates(cs=>cs.filter(c=>c.id!==id));};
  const downloadCert=(cert)=>{const img=new Image();img.crossOrigin="anonymous";img.onload=()=>{const c=document.createElement("canvas");c.width=img.width;c.height=img.height;c.getContext("2d").drawImage(img,0,0);const a=document.createElement("a");a.download=`cert-${cert.member_id}.png`;a.href=c.toDataURL("image/png");a.click();};img.src=cert.image_url;};

  const FIELDS={members:["name","card_number","email","join_date","password"],news:["title_ro","title_en","body_ro","body_en","image_url","date"],events:["title_ro","title_en","date","location_ro","location_en","desc_ro","desc_en","status","agenda_url","speakers_image_url","album_id"],gallery:["albumNameRo","albumNameEn","coverUrl"],research:["title_ro","title_en","body_ro","body_en","image_url","date"],education:["title_ro","title_en","body_ro","body_en","image_url","date"]};
  const fieldLabel=(f)=>t.fields[f]||f;
  const[currentData]=getData();
  const currentFields=FIELDS[tab]||[];
  const addLabel=tab==="members"?t.addMember:tab==="gallery"?t.addAlbum:t.addPost;
  const getItemTitle=(item)=>{if(tab==="members")return item.name;if(tab==="gallery")return lang==="ro"?item.name_ro:item.name_en;return lang==="ro"?item.title_ro:item.title_en;};

  if(tab==="members"&&certMember){
    const memberCerts=certificates.filter(c=>c.member_id===certMember.id);
    return(
      <div style={{maxWidth:1000,margin:"80px auto",padding:"40px 24px"}}>
        <button onClick={()=>setCertMember(null)} style={{background:"transparent",border:"none",color:GREEN_A,fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:24,padding:0,fontFamily:"inherit"}}>← {t.tabs.members}</button>
        <h2 style={{margin:"0 0 24px",fontFamily:"Georgia,serif"}}>{certMember.name} — {t.tabs.certificates||"Certificate"}</h2>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
          <button onClick={()=>setShowCertForm(true)} style={{background:GREEN_A,color:"white",border:"none",padding:"10px 22px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:14,fontFamily:"inherit"}}>+ {t.addCert}</button>
        </div>
        {showCertForm&&(
          <div style={{background:GREEN_LIGHT_A,borderRadius:12,padding:24,marginBottom:24}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16}}>
              <div>
                <label style={{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:5}}>{t.fields.event_id}</label>
                <select value={certForm.event_id||""} onChange={e=>setCertForm(p=>({...p,event_id:e.target.value}))} style={inputStyleA}>
                  <option value="">— selectează —</option>
                  {events.map(ev=><option key={ev.id} value={ev.id}>{lang==="ro"?ev.title_ro:ev.title_en}</option>)}
                </select>
              </div>
              <FileUploadField label={t.fields.cert_image_url||"Certificat"} value={certForm.cert_image_url||""} onChange={v=>setCertForm(p=>({...p,cert_image_url:v}))} accept="image/*" bucket="images"/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={handleAddCert} style={{background:GREEN_A,color:"white",border:"none",padding:"10px 24px",borderRadius:8,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>{t.save}</button>
              <button onClick={()=>setShowCertForm(false)} style={{background:"white",color:"#555",border:"1px solid #ccc",padding:"10px 24px",borderRadius:8,cursor:"pointer",fontFamily:"inherit"}}>{t.cancel}</button>
            </div>
          </div>
        )}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {memberCerts.map(cert=>{
            const ev=events.find(e=>e.id===cert.event_id);
            return(
              <div key={cert.id} style={{background:"white",borderRadius:10,padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <img src={cert.image_url} alt="" style={{width:80,height:56,objectFit:"cover",borderRadius:6}}/>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{ev?(lang==="ro"?ev.title_ro:ev.title_en):cert.event_id}</div>
                    <div style={{fontSize:12,color:"#888"}}>{cert.created_at?.slice(0,10)}</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>downloadCert(cert)} style={{background:GREEN_LIGHT_A,color:GREEN_A,border:`1px solid ${GREEN_A}`,padding:"7px 14px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>⬇ PDF</button>
                  <button onClick={()=>handleDeleteCert(cert.id)} style={{background:RED_LIGHT_A,color:RED_A,border:`1px solid ${RED_A}`,padding:"7px 14px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>{t.delete}</button>
                </div>
              </div>
            );
          })}
          {memberCerts.length===0&&<p style={{color:"#aaa",textAlign:"center",padding:40}}>—</p>}
        </div>
      </div>
    );
  }

  if(photoAlbum){
    return(
      <div style={{maxWidth:1000,margin:"80px auto",padding:"40px 24px"}}>
        <button onClick={()=>setPhotoAlbum(null)} style={{background:"transparent",border:"none",color:GREEN_A,fontSize:14,fontWeight:600,cursor:"pointer",marginBottom:24,padding:0,fontFamily:"inherit"}}>← {t.tabs.gallery}</button>
        <h2 style={{margin:"0 0 24px",fontFamily:"Georgia,serif"}}>{lang==="ro"?photoAlbum.name_ro:photoAlbum.name_en}</h2>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:20}}>
          <button onClick={()=>setShowPhotoForm(true)} style={{background:GREEN_A,color:"white",border:"none",padding:"10px 22px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:14,fontFamily:"inherit"}}>+ {t.fields.photoUrl||"Foto"}</button>
        </div>
        {showPhotoForm&&(
          <div style={{background:GREEN_LIGHT_A,borderRadius:12,padding:24,marginBottom:24}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16}}>
              <FileUploadField
                label={t.fields["photoUrl"]||"Fotografii"}
                value=""
                onChange={()=>{}}
                accept="image/*"
                bucket="images"
                multiple={true}
                onMultiple={async(files)=>{
                  for(const f of files){
                    const payload={album_id:photoAlbum.id,url:f.url,caption_ro:"",caption_en:""};
                    const res=await db.insert("photos",payload);
                    const np=res[0]||{...payload,id:Date.now().toString()+Math.random()};
                    setAlbums(as=>as.map(a=>a.id===photoAlbum.id?{...a,photos:[...(a.photos||[]),np]}:a));
                    setPhotoAlbum(prev=>({...prev,photos:[...(prev.photos||[]),np]}));
                  }
                  setShowPhotoForm(false);
                }}
              />
              <div style={{gridColumn:"span 2"}}><p style={{fontSize:12,color:"#888",margin:"4px 0 0"}}>💡 Puteți adăuga legende fotografiilor după încărcare.</p></div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:16}}>
              <button onClick={handleAddPhoto} style={{background:GREEN_A,color:"white",border:"none",padding:"10px 24px",borderRadius:8,cursor:"pointer",fontWeight:600,fontFamily:"inherit"}}>{t.save}</button>
              <button onClick={()=>setShowPhotoForm(false)} style={{background:"white",color:"#555",border:"1px solid #ccc",padding:"10px 24px",borderRadius:8,cursor:"pointer",fontFamily:"inherit"}}>{t.cancel}</button>
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16}}>
          {(photoAlbum.photos||[]).map(photo=>(
            <div key={photo.id} style={{borderRadius:10,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.1)",background:"white"}}>
              <img src={photo.url} alt="" style={{width:"100%",height:150,objectFit:"cover"}}/>
              <div style={{padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:12,color:"#555",flex:1,marginRight:8}}>{lang==="ro"?photo.caption_ro:photo.caption_en}</span>
                <button onClick={()=>handleDeletePhoto(photo.id)} style={{background:RED_LIGHT_A,color:RED_A,border:`1px solid ${RED_A}`,padding:"4px 10px",borderRadius:5,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>{t.delete}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return(
    <div style={{maxWidth:1000,margin:"80px auto",padding:"40px 24px"}}>
      <h2 style={{fontFamily:"Georgia,serif",margin:"0 0 32px"}}>{t.title}</h2>
      <div style={{display:"flex",gap:6,marginBottom:28,borderBottom:`2px solid ${GREEN_LIGHT_A}`,flexWrap:"wrap"}}>
        {tabs.map(tb=><button key={tb.key} onClick={()=>{setTab(tb.key);closeForm();setFormError("");}} style={{background:tab===tb.key?GREEN_A:"transparent",color:tab===tb.key?"white":GREEN_A,border:`2px solid ${GREEN_A}`,padding:"8px 16px",borderRadius:"6px 6px 0 0",cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit",borderBottom:"none",marginBottom:-2}}>{tb.label}</button>)}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <span style={{fontSize:12,color:"#999"}}>
          {tab==="gallery"
            ? (lang==="ro"?"⠿ Trage albumele pentru a le reordona":"⠿ Drag albums to reorder")
            : `* ${lang==="ro"?"câmp obligatoriu":"required field"}`
          }
        </span>
        <button onClick={()=>{openAdd();setFormError("");}} style={{background:GREEN_A,color:"white",border:"none",padding:"10px 22px",borderRadius:8,cursor:"pointer",fontWeight:600,fontSize:14,fontFamily:"inherit"}}>+ {addLabel}</button>
      </div>
      {showForm&&(
        <div style={{background:GREEN_LIGHT_A,borderRadius:12,padding:28,marginBottom:28}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16}}>
            {currentFields.map(f=>{
              const isImageField = f==="image_url"||f==="speakers_image_url"||f==="coverUrl"||f==="cert_image_url";
              const isPdfField = f==="agenda_url";
              const isOptional = f==="image_url"||f==="speakers_image_url"||f==="coverUrl"||f==="agenda_url"||f==="album_id"||f==="location_ro"||f==="location_en"||f==="desc_ro"||f==="desc_en"||f==="body_ro"||f==="body_en"||f==="email"||f==="join_date";
              if(isImageField) return(
                <FileUploadField key={f} label={fieldLabel(f)} value={form[f]||""} onChange={v=>setForm(p=>({...p,[f]:v}))} accept="image/*" bucket="images" optional={isOptional}/>
              );
              if(isPdfField) return(
                <FileUploadField key={f} label={fieldLabel(f)} value={form[f]||""} onChange={v=>setForm(p=>({...p,[f]:v}))} accept=".pdf,application/pdf" bucket="documents" optional={true}/>
              );
              return(
                <div key={f}>
                  <label style={{display:"block",fontSize:12,fontWeight:600,color:"#555",marginBottom:5}}>{fieldLabel(f)}{isOptional&&<span style={{color:"#aaa",fontWeight:400}}> (opțional)</span>}</label>
                  {f==="status"
                    ?<select value={form[f]||"upcoming"} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} style={inputStyleA}>
                      <option value="upcoming">{lang==="ro"?"Urmează":"Upcoming"}</option>
                      <option value="ongoing">{lang==="ro"?"În desfășurare":"Ongoing"}</option>
                      <option value="past">{lang==="ro"?"Trecut":"Past"}</option>
                    </select>
                  :f==="album_id"
                    ?<select value={form[f]||""} onChange={e=>setForm(p=>({...p,[f]:e.target.value||null}))} style={inputStyleA}>
                      <option value="">{lang==="ro"?"— Niciun album —":"— No album —"}</option>
                      {albums.map(a=><option key={a.id} value={a.id}>{lang==="ro"?a.name_ro:a.name_en}</option>)}
                    </select>
                  :(f.includes("body")||f.includes("desc"))
                    ?<textarea value={form[f]||""} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} rows={3} style={{...inputStyleA,resize:"vertical"}}/>
                  :<input value={form[f]||""} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))} type={f==="password"?"password":f==="date"||f==="join_date"?"date":"text"} style={inputStyleA}/>}
                </div>
              );
            })}
          </div>
          {formError&&<div style={{background:"#fdf0ee",color:"#c0392b",border:"1px solid #f5c6c0",borderRadius:8,padding:"10px 14px",fontSize:13,marginTop:16}}>{formError}</div>}
          <div style={{display:"flex",gap:10,marginTop:12}}>
            <button onClick={handleSave} disabled={saving} style={{background:GREEN_A,color:"white",border:"none",padding:"10px 24px",borderRadius:8,cursor:"pointer",fontWeight:600,fontFamily:"inherit",opacity:saving?0.7:1}}>{saving?"...":t.save}</button>
            <button onClick={()=>{closeForm();setFormError("");}} style={{background:"white",color:"#555",border:"1px solid #ccc",padding:"10px 24px",borderRadius:8,cursor:"pointer",fontFamily:"inherit"}}>{t.cancel}</button>
          </div>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {currentData.map((item,idx)=>(
          <div key={item.id}
            draggable={tab==="gallery"}
            onDragStart={tab==="gallery"?()=>handleDragStart(idx):undefined}
            onDragOver={tab==="gallery"?(e)=>handleDragOver(e,idx):undefined}
            onDrop={tab==="gallery"?()=>handleDrop(idx):undefined}
            onDragEnd={()=>{setDragIdx(null);setDragOverIdx(null);}}
            style={{background:"white",borderRadius:10,padding:"16px 20px",boxShadow:"0 2px 8px rgba(0,0,0,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,
              cursor:tab==="gallery"?"grab":"default",
              opacity:dragIdx===idx?0.4:1,
              border:dragOverIdx===idx&&dragIdx!==idx?`2px dashed ${GREEN_A}`:"2px solid transparent",
              transition:"opacity 0.2s,border 0.15s"
            }}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              {tab==="gallery"&&<span style={{fontSize:18,color:"#ccc",cursor:"grab",marginRight:4}} title="Trage pentru a reordona">⠿</span>}
              {tab==="gallery"&&item.cover_url&&<img src={item.cover_url} alt="" style={{width:56,height:40,objectFit:"cover",borderRadius:6}}/>}
              {(tab==="news"||tab==="research"||tab==="education")&&item.image_url&&<img src={item.image_url} alt="" style={{width:56,height:40,objectFit:"cover",borderRadius:6}}/>}
              <div>
                <div style={{fontWeight:700,fontSize:15,color:"#222"}}>{getItemTitle(item)}</div>
                {tab==="members"&&<div style={{fontSize:12,color:"#888",marginTop:3}}>{item.card_number} · {item.email}</div>}
                {(tab==="news"||tab==="research"||tab==="education")&&<div style={{fontSize:12,color:"#888",marginTop:3}}>{item.date}</div>}
                {tab==="events"&&<div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}><span style={{background:item.status==="ongoing"?"#fff8e1":item.status==="past"?"#f0f0f0":GREEN_LIGHT_A,color:item.status==="ongoing"?"#f59e0b":item.status==="past"?"#666":GREEN_A,border:"1px solid",borderColor:item.status==="ongoing"?"#fcd34d":item.status==="past"?"#ccc":GREEN_ACCENT,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{item.status}</span><span style={{fontSize:12,color:"#888"}}>{item.date}</span></div>}
                {tab==="gallery"&&<div style={{fontSize:12,color:"#888",marginTop:3}}>{item.photos?.length||0} foto · #{item.sort_order||idx+1}</div>}
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {tab==="gallery"&&<button onClick={()=>setPhotoAlbum(item)} style={{background:"#f0f0f0",color:"#333",border:"1px solid #ccc",padding:"7px 14px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>🖼 {t.managePhotos}</button>}
              {tab==="members"&&<button onClick={()=>setCertMember(item)} style={{background:"#f0f0f0",color:"#333",border:"1px solid #ccc",padding:"7px 14px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>🏅 {t.manageCerts}</button>}
              <button onClick={()=>openEdit(item)} style={{background:GREEN_LIGHT_A,color:GREEN_A,border:`1px solid ${GREEN_A}`,padding:"7px 14px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>{t.edit}</button>
              <button onClick={()=>handleDelete(item.id)} style={{background:RED_LIGHT_A,color:RED_A,border:`1px solid ${RED_A}`,padding:"7px 14px",borderRadius:6,cursor:"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"}}>{t.delete}</button>
            </div>
          </div>
        ))}
        {currentData.length===0&&<p style={{color:"#aaa",textAlign:"center",padding:40}}>—</p>}
      </div>
    </div>
  );
}


// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
function ContactPage() {
  const {lang} = useLang();
  const t = T[lang].contact;

  const contactItems = [
    { icon:"✉", label:t.email, value:t.emailVal, href:`mailto:${t.emailVal}`, color:GREEN },
    { icon:"📞", label:t.phone, value:t.phoneVal, href:`tel:${t.phoneVal.replace(/\s/g,"")}`, color:GREEN },
  ];

  return (
    <div>
      <PageHero title={t.title} subtitle={t.subtitle}/>
      <section style={{background:"#f8f9fa", padding:"80px 32px"}}>
        <div style={{maxWidth:1000, margin:"0 auto"}}>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:40}}>

            {/* Write to us */}
            <div style={{background:"white", borderRadius:20, padding:40, boxShadow:"0 4px 24px rgba(0,0,0,0.07)"}}>
              <div style={{fontSize:40, marginBottom:20}}>💬</div>
              <h2 style={{fontFamily:"Georgia,serif", fontSize:24, color:"#1a1a1a", margin:"0 0 16px"}}>{t.writeUs}</h2>
              <p style={{color:"#666", fontSize:15, lineHeight:1.8, margin:"0 0 32px"}}>{t.writeUsDesc}</p>
              <div style={{display:"flex", flexDirection:"column", gap:16}}>
                {contactItems.map(item => (
                  <a key={item.label} href={item.href} style={{display:"flex", alignItems:"center", gap:16, padding:"16px 20px", background:"#f8f9fa", borderRadius:12, textDecoration:"none", border:`1px solid #eee`, transition:"all 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.background=GREEN_LIGHT;e.currentTarget.style.borderColor=GREEN;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="#f8f9fa";e.currentTarget.style.borderColor="#eee";}}
                  >
                    <div style={{width:44, height:44, borderRadius:"50%", background:GREEN_LIGHT, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0}}>{item.icon}</div>
                    <div>
                      <div style={{fontSize:12, color:"#999", marginBottom:2, fontWeight:600, letterSpacing:0.5, textTransform:"uppercase"}}>{item.label}</div>
                      <div style={{fontSize:15, color:"#1a1a1a", fontWeight:700}}>{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Follow us */}
            <div style={{display:"flex", flexDirection:"column", gap:24}}>
              <div style={{background:"white", borderRadius:20, padding:40, boxShadow:"0 4px 24px rgba(0,0,0,0.07)"}}>
                <div style={{fontSize:40, marginBottom:20}}>🌐</div>
                <h2 style={{fontFamily:"Georgia,serif", fontSize:24, color:"#1a1a1a", margin:"0 0 16px"}}>{t.followUs}</h2>
                <a href="https://www.facebook.com/people/Alian%C8%9Ba-pentru-Boli-Hepatice-Rare-din-Moldova/61552694548049/" target="_blank" rel="noreferrer"
                  style={{display:"flex", alignItems:"center", gap:16, padding:"20px", background:"#f0f4ff", borderRadius:12, textDecoration:"none", border:"1px solid #d0d9ff", transition:"all 0.2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#e0e8ff";e.currentTarget.style.borderColor="#3b5998";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="#f0f4ff";e.currentTarget.style.borderColor="#d0d9ff";}}
                >
                  <div style={{width:48, height:48, borderRadius:10, background:"#3b5998", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{fontSize:12, color:"#3b5998", marginBottom:2, fontWeight:700, letterSpacing:0.5}}>FACEBOOK</div>
                    <div style={{fontSize:14, color:"#1a1a1a", fontWeight:600, lineHeight:1.3}}>{t.facebookLabel}</div>
                  </div>
                </a>
              </div>

              {/* Location */}
              <div style={{background:`linear-gradient(135deg,${GREEN_DARK},${GREEN_MID})`, borderRadius:20, padding:40, position:"relative", overflow:"hidden"}}>
                <WavyBg color="rgba(255,255,255,0.05)"/>
                <div style={{position:"relative", zIndex:2}}>
                  <div style={{fontSize:40, marginBottom:16}}>📍</div>
                  <h3 style={{fontFamily:"Georgia,serif", fontSize:20, color:"white", margin:"0 0 8px"}}>{t.orgName||"ABHR"}</h3>
                  <p style={{color:"rgba(255,255,255,0.7)", fontSize:15, margin:0}}>{t.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── ERROR BOUNDARY ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={hasError:false,error:null}; }
  static getDerivedStateFromError(error){ return{hasError:true,error}; }
  componentDidCatch(error,info){ console.error("ABHR Error:",error,info); }
  render(){
    if(this.state.hasError){
      return(
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(145deg,${GREEN_DARK},${GREEN_MID})`,flexDirection:"column",gap:20,padding:32,position:"relative",overflow:"hidden"}}>
          <WavyBg/>
          <div style={{position:"relative",zIndex:2,textAlign:"center",maxWidth:500}}>
            <div style={{fontSize:64,marginBottom:16}}>⚠️</div>
            <h2 style={{fontFamily:"Georgia,serif",color:"white",fontSize:28,margin:"0 0 16px"}}>Ceva nu a funcționat</h2>
            <p style={{color:"rgba(255,255,255,0.7)",fontSize:15,lineHeight:1.7,margin:"0 0 32px"}}>A apărut o eroare neașteptată. Vă rugăm să reîncărcați pagina.</p>
            <button onClick={()=>window.location.reload()} style={{background:GREEN_ACCENT,border:"none",color:"white",padding:"14px 32px",borderRadius:50,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 6px 28px rgba(46,204,138,0.4)"}}>
              Reîncarcă pagina
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang,setLang] = useState("ro");
  const [page,setPage] = useState("home");
  const [user,setUser] = useState(null);
  const [panelOpen,setPanelOpen] = useState(false);
  const [news,setNews] = useState([]);
  const [events,setEvents] = useState([]);
  const [albums,setAlbums] = useState([]);
  const [members,setMembers] = useState([]);
  const [research,setResearch] = useState([]);
  const [education,setEducation] = useState([]);
  const [certificates,setCertificates] = useState([]);
  const [loading,setLoading] = useState(true);
  const [selectedNews,setSelectedNews] = useState(null);
  const [selectedEvent,setSelectedEvent] = useState(null);
  const [selectedArticle,setSelectedArticle] = useState(null);
  const [selectedGalleryAlbum,setSelectedGalleryAlbum] = useState(null);

  useEffect(()=>{
    const load=async()=>{
      setLoading(true);
      const[nd,ed,ad,md,pd,rd,edd,cd]=await Promise.all([db.get("news"),db.get("events"),db.get("albums","&order=sort_order.asc"),db.get("members"),db.get("photos"),db.get("research"),db.get("education"),db.get("certificates")]);
      const aw=(ad||[]).map(a=>({...a,photos:(pd||[]).filter(p=>p.album_id===a.id)}));
      setNews(nd||[]);setEvents(ed||[]);setAlbums(aw);setMembers(md||[]);setResearch(rd||[]);setEducation(edd||[]);setCertificates(cd||[]);setLoading(false);
    };
    load();
  },[]);

  const [accessToken, setAccessToken] = useState(null);

  const login=async(cardNumber,password)=>{
    // Check if it looks like an email (admin login via Supabase Auth)
    if(cardNumber.includes("@")) {
      const result = await auth.signIn(cardNumber, password);
      if(result && result.user?.id === ADMIN_UUID) {
        const u={email:cardNumber, name:"Administrator", isAdmin:true};
        setUser(u);
        setAccessToken(result.access_token);
        return u;
      }
      return null;
    }
    // Member login via card number
    const sha256Hash = await hashPasswordAsync(password);
    let member = members.find(m=>m.card_number===cardNumber&&m.password_hash===sha256Hash);
    if(!member) member = members.find(m=>m.card_number===cardNumber&&m.password_hash===hashPassword(password));
    if(member){setUser(member);return member;}
    return null;
  };
  const logout=async()=>{
    if(accessToken) await auth.signOut(accessToken);
    setUser(null);
    setAccessToken(null);
    setPage("home");
  };

  const safePage=()=>{
    if(page==="profile"&&!user)return"login";
    if(page==="admin"&&!user?.isAdmin)return"home";
    return page;
  };
  const cp=safePage();

  // Scroll to top on every page change
  useEffect(()=>{ window.scrollTo({top:0,behavior:"instant"}); },[cp]);

  // SEO: update page title and meta description on page change
  useEffect(()=>{
    const titles = {
      home: lang==="ro"?"Acasă — ABHR":"Home — ABHR",
      about: lang==="ro"?"Despre Noi — ABHR":"About Us — ABHR",
      news: lang==="ro"?"Știri — ABHR":"News — ABHR",
      events: lang==="ro"?"Evenimente — ABHR":"Events — ABHR",
      gallery: lang==="ro"?"Galerie — ABHR":"Gallery — ABHR",
      research: lang==="ro"?"Cercetare — ABHR":"Research — ABHR",
      education: lang==="ro"?"Educație — ABHR":"Education — ABHR",
      contact: "Contact — ABHR",
      profile: lang==="ro"?"Profilul Meu — ABHR":"My Profile — ABHR",
      login: lang==="ro"?"Autentificare — ABHR":"Login — ABHR",
      admin: "Admin — ABHR",
    };
    const descs = {
      home: lang==="ro"?"Alianța pentru Boli Hepatice Rare susține pacienții din Republica Moldova.":"The Alliance for Rare Hepatic Diseases supports patients in the Republic of Moldova.",
      contact: lang==="ro"?"Contactați Alianța pentru Boli Hepatice Rare.":"Contact the Alliance for Rare Hepatic Diseases.",
    };
    document.title = titles[cp] || "ABHR — Alianța pentru Boli Hepatice Rare";
    let metaDesc = document.querySelector("meta[name='description']");
    if(!metaDesc){ metaDesc=document.createElement("meta"); metaDesc.name="description"; document.head.appendChild(metaDesc); }
    metaDesc.content = descs[cp] || (lang==="ro"?"Alianța pentru Boli Hepatice Rare din Republica Moldova.":"Alliance for Rare Hepatic Diseases from the Republic of Moldova.");
    const ogTags = {"og:title":document.title,"og:description":metaDesc.content,"og:type":"website","og:url":window.location.href};
    Object.entries(ogTags).forEach(([prop,val])=>{
      let tag=document.querySelector(`meta[property='${prop}']`);
      if(!tag){tag=document.createElement("meta");tag.setAttribute("property",prop);document.head.appendChild(tag);}
      tag.content=val;
    });
  },[cp,lang]);

  const openPanel=()=>setPanelOpen(true);

  if(loading) return(
    <div style={{minHeight:"100vh",fontFamily:"'Segoe UI',Helvetica,Arial,sans-serif",background:"#f8f9fa"}}>
      <style>{`
        @keyframes shimmer{0%{background-position:-1000px 0}100%{background-position:1000px 0}}
        .sk{background:linear-gradient(90deg,#e8e8e8 25%,#f5f5f5 50%,#e8e8e8 75%);background-size:1000px 100%;animation:shimmer 1.8s infinite linear;border-radius:8px;}
      `}</style>
      {/* Skeleton Navbar */}
      <div style={{height:72,background:"white",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",padding:"0 32px",gap:20}}>
        <div className="sk" style={{width:180,height:36}}/>
        <div style={{flex:1}}/>
        {[80,70,80,70,90].map((w,i)=><div key={i} className="sk" style={{width:w,height:14}}/>)}
        <div className="sk" style={{width:120,height:36,borderRadius:50}}/>
      </div>
      {/* Skeleton Hero */}
      <div style={{background:`linear-gradient(145deg,${GREEN_DARK},${GREEN_MID})`,minHeight:480,padding:"80px 32px",display:"flex",alignItems:"center"}}>
        <div style={{maxWidth:1200,margin:"0 auto",width:"100%"}}>
          <div style={{maxWidth:600,display:"flex",flexDirection:"column",gap:20}}>
            <div style={{width:180,height:14,background:"rgba(255,255,255,0.15)",borderRadius:50}}/>
            {[320,280,220].map((w,i)=><div key={i} style={{width:w,height:i===2?52:64,background:"rgba(255,255,255,0.12)",borderRadius:8,animation:"shimmer 1.8s infinite linear",backgroundSize:"1000px 100%",backgroundImage:"linear-gradient(90deg,rgba(255,255,255,0.08) 25%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0.08) 75%)"}}/>)}
            <div style={{width:380,height:16,background:"rgba(255,255,255,0.1)",borderRadius:6}}/>
            <div style={{display:"flex",gap:16,marginTop:8}}>
              <div style={{width:140,height:48,background:"rgba(46,204,138,0.4)",borderRadius:50}}/>
              <div style={{width:140,height:48,background:"rgba(255,255,255,0.1)",borderRadius:50}}/>
            </div>
          </div>
        </div>
      </div>
      {/* Skeleton Stats */}
      <div style={{background:GREEN,padding:"48px 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>
          {[0,1,2,3].map(i=>(
            <div key={i} style={{textAlign:"center",padding:"16px 24px",borderRight:i<3?"1px solid rgba(255,255,255,0.2)":"none",display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,background:"rgba(255,255,255,0.15)",borderRadius:"50%"}}/>
              <div style={{width:80,height:32,background:"rgba(255,255,255,0.15)",borderRadius:6}}/>
              <div style={{width:100,height:12,background:"rgba(255,255,255,0.1)",borderRadius:6}}/>
            </div>
          ))}
        </div>
      </div>
      {/* Skeleton Cards */}
      <div style={{maxWidth:1200,margin:"60px auto",padding:"0 32px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:24}}>
        {[1,2,3].map(i=>(
          <div key={i} style={{background:"white",borderRadius:20,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
            <div className="sk" style={{height:180,borderRadius:0}}/>
            <div style={{padding:24,display:"flex",flexDirection:"column",gap:12}}>
              <div className="sk" style={{width:80,height:12}}/>
              <div className="sk" style={{width:"90%",height:20}}/>
              <div className="sk" style={{width:"100%",height:12}}/>
              <div className="sk" style={{width:"75%",height:12}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const noFooterPages=["login"];
  const showFooter=!noFooterPages.includes(cp);
  const noNavPages=[];
  const showNav=!noNavPages.includes(cp);

  return(
    <ErrorBoundary>
    <LangContext.Provider value={{lang,setLang}}>
      <AuthContext.Provider value={{user,login,logout}}>
        <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"'Segoe UI',Helvetica,Arial,sans-serif",background:"#f8f9fa"}}>
          <style>{`*{box-sizing:border-box;margin:0;padding:0}body{overflow-x:hidden}::placeholder{color:rgba(255,255,255,0.35)!important}input[type="date"]{color:#333!important}input[type="date"]::placeholder{color:#aaa!important}`}</style>
          <MemberPanel open={panelOpen} onClose={()=>setPanelOpen(false)}/>
          {showNav&&<Navbar page={cp} setPage={setPage} onMemberClick={openPanel}/>}
          <div style={{flex:1}}>
            {cp==="home"&&<HomePage setPage={setPage} news={news} events={events} onMemberClick={openPanel}/>}
            {cp==="about"&&<AboutPage onMemberClick={openPanel}/>}
            {cp==="news"&&<NewsListPage news={news} setSelectedNews={setSelectedNews} setPage={setPage}/>}
            {cp==="newsDetail"&&<NewsDetailPage item={selectedNews} setPage={setPage}/>}
            {cp==="events"&&<EventsListPage events={events} setSelectedEvent={setSelectedEvent} setPage={setPage}/>}
            {cp==="eventDetail"&&<EventDetailPage item={selectedEvent} setPage={setPage} albums={albums} setSelectedGalleryAlbum={setSelectedGalleryAlbum}/>}
            {cp==="gallery"&&<GalleryPage albums={albums} initialAlbum={selectedGalleryAlbum} onAlbumOpen={()=>setSelectedGalleryAlbum(null)}/>}
            {cp==="research"&&<ArticleListPage items={research} type="research" setSelectedArticle={setSelectedArticle} setPage={setPage}/>}
            {cp==="researchDetail"&&<ArticleDetailPage item={selectedArticle} type="research" setPage={setPage}/>}
            {cp==="education"&&<ArticleListPage items={education} type="education" setSelectedArticle={setSelectedArticle} setPage={setPage}/>}
            {cp==="contact"&&<ContactPage/>}
            {cp==="educationDetail"&&<ArticleDetailPage item={selectedArticle} type="education" setPage={setPage}/>}
            {cp==="profile"&&<ProfilePage certificates={certificates} events={events}/>}
            {cp==="login"&&<LoginPage setPage={setPage}/>}
            {cp==="admin"&&<AdminPage members={members} setMembers={setMembers} news={news} setNews={setNews} events={events} setEvents={setEvents} albums={albums} setAlbums={setAlbums} research={research} setResearch={setResearch} education={education} setEducation={setEducation} certificates={certificates} setCertificates={setCertificates}/>}
          </div>
          {showFooter&&<Footer setPage={setPage}/>}
        </div>
      </AuthContext.Provider>
    </LangContext.Provider>
    </ErrorBoundary>
  );
}
