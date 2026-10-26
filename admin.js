import {initializeApp} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,signOut,onAuthStateChanged,sendPasswordResetEmail,GoogleAuthProvider,signInWithPopup} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const DEFAULT = {
  brand: { name: "Pindrop Miles", tagline: "Every mile, a new discovery", logo: "logo-full.png" },
  socials: [
    { platform: "facebook",  url: "https://facebook.com/pindropmiles/" },
    { platform: "youtube",   url: "https://youtube.com/@pindropmiles/" },
    { platform: "instagram", url: "https://instagram.com/pindropmiles/" },
    { platform: "tiktok",    url: "https://tiktok.com/@pindropmiles/" },
    { platform: "x",         url: "https://x.com/pindropmiles/" },
    { platform: "threads",   url: "https://threads.net/@pindropmiles/" },
    { platform: "linkedin",  url: "https://linkedin.com/company/pindropmiles/" },
    { platform: "pinterest", url: "https://pinterest.com/pindropmiles/" }
  ],
  sections: [
    { title: "Popular videos", type: "videos", items: [
      { label: "Popular video 1", url: "https://youtube.com/", note: "Paste a YouTube link for an automatic thumbnail" },
      { label: "Popular video 2", url: "https://youtube.com/", note: "" },
      { label: "Popular video 3", url: "https://tiktok.com/", note: "" },
      { label: "Popular video 4", url: "https://instagram.com/", note: "" },
      { label: "Popular video 5", url: "https://youtube.com/", note: "" } ] },
    { title: "Latest", type: "links", items: [
      { label: "Newest video title goes here", url: "https://youtube.com/", note: "Added this week" } ] },
    { title: "Trending", type: "links", items: [
      { label: "Trending post title goes here", url: "https://instagram.com/", note: "" } ] },
    { title: "Most liked", type: "links", items: [
      { label: "Most liked video title goes here", url: "https://tiktok.com/", note: "" } ] },
    { title: "Travel guides", type: "links", items: [
      { label: "Lisbon in 3 days: our route", url: "https://example.com/lisbon-guide", note: "Blog or PDF guide" },
      { label: "Where to eat in Lisbon", url: "https://example.com/lisbon-food", note: "" },
      { label: "Our saved places map", url: "https://maps.google.com/", note: "Google Maps list" } ] },
    { title: "Playlists and series", type: "links", items: [
      { label: "Lisbon food series", url: "https://youtube.com/", note: "YouTube playlist" },
      { label: "Hidden corners of Portugal", url: "https://youtube.com/", note: "" } ] },
    { title: "About us", type: "text", text: "We are Pindrop Miles. We explore Lisbon and beyond, one mile at a time, and share the food, hidden corners and honest tips we find along the way.", items: [] },
    { title: "Work with us", type: "links", items: [
      { label: "Brand and tourism collaborations", url: "mailto:hello@example.com", note: "hello@example.com" } ] },
    { title: "Join and support", type: "links", items: [
      { label: "Get new guides by email", url: "https://example.com/newsletter", note: "Newsletter" },
      { label: "Support our trips", url: "https://example.com/support", note: "Buy us a coffee" } ] }
  ]
};

const PLATFORM_NAMES = {facebook:"Facebook",youtube:"YouTube",instagram:"Instagram",tiktok:"TikTok",x:"X",threads:"Threads",linkedin:"LinkedIn",pinterest:"Pinterest"};
const IDLE_KEY = "pm_last";
const $ = id => document.getElementById(id);
const el = (t,p={},kids=[]) => { const e=document.createElement(t);
  for(const k in p){ if(k==="text") e.textContent=p[k]; else if(k.startsWith("on")) e[k]=p[k]; else e.setAttribute(k,p[k]); }
  [].concat(kids).forEach(x=>e.append(x)); return e; };

const cfg = window.PM_FIREBASE;
const IDLE_MS = ((cfg && cfg.idleMinutes) || 240) * 60 * 1000;
if(!cfg || !cfg.apiKey || !cfg.projectId){
  $("gate").replaceChildren(el("h1",{text:"Almost there"}),el("div",{class:"info",text:"Open firebase-config.js and paste in your Firebase project details, then upload it next to this page and reload."}));
} else main();

function main(){
  const app = initializeApp(cfg), auth = getAuth(app), db = getFirestore(app);
  const ref = doc(db,"site","page");
  let data = null, dirty = false, idle, user = null, notice = "";

  const gate = $("gate"), box = $("app");
  const gateBase = (title,text)=>gate.replaceChildren(el("img",{src:"logo.png",alt:"",onerror:function(){this.remove();}}),el("h1",{text:title}),el("p",{class:"note",text:text}));

  function showLogin(){
    box.hidden = true; box.replaceChildren(); gate.hidden = false;
    gateBase("Admin sign in","Sign in with your admin email and password.");
    const em = el("input",{type:"email",autocomplete:"username","aria-label":"Email",placeholder:"Email"});
    const pw = el("input",{type:"password",autocomplete:"current-password","aria-label":"Password",placeholder:"Password"});
    const msg = el("p",{class:"err",role:"alert",text:notice}); notice = "";
    const btn = el("button",{class:"pri",type:"submit",text:"Sign in"});
    const goog = el("button",{type:"button",text:"Sign in with Google",onclick:async()=>{ msg.className="err"; msg.textContent=""; try{ await signInWithPopup(auth,new GoogleAuthProvider()); }catch(x){ msg.textContent="Google sign-in was cancelled or failed."; } }});
    const forgot = el("button",{class:"lnk",type:"button",text:"Forgot password?",onclick:async()=>{
      if(!em.value){ msg.textContent="Type your email first."; return; }
      try{ await sendPasswordResetEmail(auth,em.value); msg.className="ok"; msg.textContent="If that email has an account, a reset link is on its way."; }catch(e){ msg.className="err"; msg.textContent="Could not send the email."; } }});
    gate.append(el("form",{onsubmit:async e=>{
      e.preventDefault(); btn.disabled=true; msg.className="err"; msg.textContent="";
      try{ await signInWithEmailAndPassword(auth,em.value.trim(),pw.value); }
      catch(x){ msg.textContent = x.code==="auth/too-many-requests" ? "Too many attempts. Wait a few minutes and try again." : "Wrong email or password."; btn.disabled=false; }
    }},[el("div",{class:"row"},[em]),el("div",{class:"row"},[pw]),msg,btn,(cfg.allowGoogle?el("div",{class:"row"},[goog]):""),el("div",{},[forgot])]));
    em.focus();
  }

  async function load(){
    data = JSON.parse(JSON.stringify(DEFAULT));
    try{
      const s = await getDoc(ref);
      if(s.exists() && s.data().json) data = JSON.parse(s.data().json);
      else { const r = await fetch("data.json",{cache:"no-store"}); if(r.ok) data = await r.json(); }
    }catch(e){}
  }
  const stale = ()=>{ try{ const v = +localStorage.getItem(IDLE_KEY); return !!v && Date.now()-v > IDLE_MS; }catch(e){ return false; } };
  const doSignOut = ()=>{ try{ localStorage.removeItem(IDLE_KEY); }catch(e){} return signOut(auth); };
  async function expire(){ notice = "You were signed out after a long time of inactivity."; await doSignOut(); }
  let lastStamp = 0;
  function bump(){ clearTimeout(idle); idle = setTimeout(expire,IDLE_MS);
    const n = Date.now(); if(n-lastStamp>30000){ lastStamp = n; try{ localStorage.setItem(IDLE_KEY,String(n)); }catch(e){} } }
  ["click","keydown","input","touchstart","scroll"].forEach(ev=>addEventListener(ev,()=>{ if(user) bump(); },{passive:true}));
  setInterval(()=>{ if(user && stale()) expire(); },60000);
  addEventListener("beforeunload",e=>{ if(dirty){ e.preventDefault(); e.returnValue=""; } });

  onAuthStateChanged(auth, async u=>{
    user = u;
    if(!u){ data=null; dirty=false; showLogin(); return; }
    if(stale()){ await expire(); return; }
    if(cfg.adminUid && u.uid !== cfg.adminUid){ notice = "This account is not allowed to use the admin."; await signOut(auth); return; }
    await load(); gate.hidden = true; box.hidden = false; dirty = false; render(); bump();
  });

  function render(){
    const a = box; a.replaceChildren();
    const R = ()=>{ dirty=true; render(); };
    const inp = (obj,key,ph) => el("input",{value:obj[key]||"",placeholder:ph,"aria-label":ph,oninput:e=>{obj[key]=e.target.value;dirty=true;}});
    const rm = (arr,i) => el("button",{class:"del",type:"button",text:"Remove",onclick:()=>{arr.splice(i,1);R();}});
    const sel = (opts,cur,fn,label) => el("select",{"aria-label":label,onchange:e=>fn(e.target.value)},
      opts.map(([v,t])=>{const o=el("option",{value:v,text:t}); if(v===cur)o.selected=true; return o;}));

    a.append(el("div",{class:"row",style:"align-items:center;justify-content:space-between"},[el("h1",{text:"Edit your page",style:"margin:0"}),el("button",{type:"button",text:"Sign out",style:"flex:0 0 auto",onclick:doSignOut})]),
      el("p",{class:"note",text:"Signed in as "+(user&&user.email)+". Make your changes, then press Save and publish. They go live straight away."}));
    a.append(el("div",{class:"card"},[el("h2",{text:"Brand"}),
      el("div",{class:"row"},[inp(data.brand,"name","Brand name"),inp(data.brand,"tagline","Tagline")]),
      el("div",{class:"row"},[inp(data.brand,"logo","Header logo file (e.g. logo-full.png)")])]));
    const sc = el("div",{class:"card"},[el("h2",{text:"Social profiles"})]);
    data.socials.forEach((s,i)=>sc.append(el("div",{class:"row"},[
      sel(Object.keys(PLATFORM_NAMES).map(k=>[k,PLATFORM_NAMES[k]]),s.platform,v=>{s.platform=v;dirty=true;},"Platform"),
      inp(s,"url","Profile link"),rm(data.socials,i)])));
    sc.append(el("button",{type:"button",text:"Add profile",onclick:()=>{data.socials.push({platform:"facebook",url:""});R();}}));
    a.append(sc);
    data.sections.forEach((s,si)=>{
      const c = el("div",{class:"card"},[el("div",{class:"row"},[inp(s,"title","Section title"),
        sel([["links","Link list"],["videos","Video cards"],["text","Text block"]],s.type||"links",v=>{s.type=v;R();},"Layout"),rm(data.sections,si)])]);
      (s.type==="text"?[]:s.items).forEach((it,ii)=>c.append(el("div",{class:"row"},[inp(it,"label","Title"),inp(it,"url","Link (YouTube, TikTok, any URL)"),inp(it,"note","Short note (optional)"),rm(s.items,ii)])));
      if(s.type==="text"){ const ta=el("textarea",{rows:"4","aria-label":"Text",placeholder:"Write a short paragraph",oninput:e=>{s.text=e.target.value;dirty=true;}}); ta.value=s.text||""; c.append(ta); }
      else c.append(el("button",{type:"button",text:"Add link",onclick:()=>{s.items.push({label:"",url:"",note:""});R();}}));
      a.append(c);
    });
    a.append(el("button",{type:"button",text:"Add section",onclick:()=>{data.sections.push({title:"New section",type:"links",items:[{label:"",url:"",note:""}]});R();}}));

    a.append(el("div",{class:"card"},[el("h2",{text:"Password"}),
      el("button",{type:"button",text:"Email me a password reset link",onclick:async e=>{
        try{ await sendPasswordResetEmail(auth,user.email); e.target.textContent="Reset link sent"; }catch(x){ e.target.textContent="Could not send"; } }})]));

    const status = el("span",{class:"note",role:"status"});
    const save = el("button",{class:"pri",type:"button",text:"Save and publish",onclick:async()=>{
      save.disabled=true; status.className="note"; status.textContent="Publishing…";
      try{ await setDoc(ref,{json:JSON.stringify(data),updated:serverTimestamp()}); dirty=false; status.className="ok"; status.textContent="Published. Your page is updated."; }
      catch(x){ status.className="err"; status.textContent = x.code==="permission-denied" ? "This account is not allowed to publish. Check the rules and your user ID." : "Could not publish. Check your connection and try again."; }
      save.disabled=false; }});
    a.append(el("div",{class:"bar"},[save,
      el("button",{type:"button",text:"Preview",onclick:()=>{ try{localStorage.setItem("pm_preview",JSON.stringify(data));}catch(e){} open("./#preview","_blank"); }}),
      el("button",{type:"button",text:"Download backup",onclick:()=>{
        const l=el("a",{href:URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"})),download:"data.json"}); document.body.append(l); l.click(); l.remove(); }}),
      el("button",{type:"button",text:"Sign out",onclick:doSignOut}),status]));
  }
}