const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ROLLEN={IT:"it",Verwaltung:"vw",Schulleitung:"sl"};
const GRUPPEN=["Lehrkraft","Verwaltung","Sonstiges Personal","Praktikant/in"];
const GERAETE=["Laptop","iPad","Handy"];
// Vorlage: tage = Abstand zum Stichtag (Eintritt bzw. Austritt), g = nur für diese Gruppen, d = nur bei diesem Gerät
const VORLAGE=[
 {a:"on",b:"Konten",t:"M365-Konto beantragen und Lizenz festlegen",r:"Verwaltung",tage:-10},
 {a:"on",b:"Konten",t:"M365-Konto bereitstellen und Startkennwort übergeben",r:"IT",tage:-3},
 {a:"on",b:"Konten",t:"Teams: Kollegiumsteam und passende Fachteams zuordnen",r:"IT",tage:-2,g:["Lehrkraft","Praktikant/in"]},
 {a:"on",b:"Konten",t:"Schulmanager: Zugang mit passender Rolle freischalten",r:"IT",tage:-2},
 {a:"on",b:"Konten",t:"Rechte im Schulmanager freigeben",r:"Schulleitung",tage:-5},
 {a:"on",b:"Geräte",t:"Laptop einrichten und gegen Unterschrift ausgeben",r:"IT",tage:0,d:"Laptop"},
 {a:"on",b:"Geräte",t:"iPad in der Geräteverwaltung registrieren und ausgeben",r:"IT",tage:0,d:"iPad"},
 {a:"on",b:"Geräte",t:"Diensthandy ausgeben und im Inventar eintragen",r:"Verwaltung",tage:0,d:"Handy"},
 {a:"on",b:"Belehrungen",t:"Datenschutzbelehrung durchführen und Unterschrift ablegen",r:"Verwaltung",tage:5},
 {a:"on",b:"Belehrungen",t:"IT-Richtlinie aushändigen und Bestätigung einholen",r:"IT",tage:5},
 {a:"on",b:"Belehrungen",t:"Verpflichtung auf Verschwiegenheit gegenzeichnen",r:"Schulleitung",tage:7},
 {a:"on",b:"Drucker",t:"Drucker- und Kopierer-PIN vergeben",r:"IT",tage:0},
 {a:"off",b:"Konten",t:"Austritt bestätigen und letzten Arbeitstag melden",r:"Schulleitung",tage:-14},
 {a:"off",b:"Konten",t:"Weiterleitung oder Abwesenheitsnotiz für das Postfach festlegen",r:"Verwaltung",tage:-5},
 {a:"off",b:"Konten",t:"Teams: Besitzerrechte übertragen und aus Teams entfernen",r:"IT",tage:0},
 {a:"off",b:"Konten",t:"Schulmanager-Zugang deaktivieren",r:"IT",tage:0},
 {a:"off",b:"Konten",t:"M365-Konto sperren, nach Frist löschen",r:"IT",tage:1},
 {a:"off",b:"Geräte",t:"Laptop zurücknehmen, prüfen und zurücksetzen",r:"IT",tage:0,d:"Laptop"},
 {a:"off",b:"Geräte",t:"iPad zurücknehmen und aus der Geräteverwaltung entfernen",r:"IT",tage:0,d:"iPad"},
 {a:"off",b:"Geräte",t:"Diensthandy zurücknehmen und Inventar austragen",r:"Verwaltung",tage:0,d:"Handy"},
 {a:"off",b:"Belehrungen",t:"Fortgeltung der Verschwiegenheit schriftlich bestätigen",r:"Verwaltung",tage:-1},
 {a:"off",b:"Drucker",t:"Drucker- und Kopierer-PIN sperren",r:"IT",tage:0},
 {a:"off",b:"Konten",t:"Vorgang abschließend prüfen und freigeben",r:"Schulleitung",tage:3}];
const heute=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const plus=(s,n)=>{const d=new Date(s+"T00:00");d.setDate(d.getDate()+n);return iso(d)};
function iso(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
const isoH=n=>plus(iso(heute()),n);
const dt=s=>{const [y,m,d]=s.split("-");return d+"."+m+"."+y};
const zeit=()=>new Date().toLocaleString("de-DE",{timeZone:"Europe/Berlin",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})+" Uhr";
const ART={on:"Onboarding",off:"Offboarding"};
let S=JSON.parse(localStorage.getItem("onb-demo")||"null");
function save(){localStorage.setItem("onb-demo",JSON.stringify(S))}
function schritte(v){return VORLAGE.filter(x=>x.a===v.art&&(!x.g||x.g.includes(v.gruppe))&&(!x.d||v.geraete.includes(x.d))).map(x=>({b:x.b,t:x.t,r:x.r,f:plus(v.stichtag,x.tage),ok:null,erin:null}))}
function mail(an,betreff,text){S.post.unshift({an,betreff,text,zeit:zeit()})}
function anlegen(v,still){v.id=S.next++;v.s=schritte(v);S.v.unshift(v);
 const rs=[...new Set(v.s.map(x=>x.r))];
 rs.forEach(r=>{const l=v.s.filter(x=>x.r===r);mail(r,`Neue Aufgaben: ${ART[v.art]} ${v.name}`,`Hallo ${r},\n\nfür ${v.name} (${v.gruppe}, ${ART[v.art]} zum ${dt(v.stichtag)}) sind ${l.length} Aufgaben für euch angelegt:\n`+l.map(x=>`  • ${x.t} (fällig ${dt(x.f)})`).join("\n")+"\n\nBitte im Tool abhaken, sobald erledigt.")});
 if(!still)save();return v}
function seed(){S={v:[],post:[],next:1,lauf:null};
 const a=anlegen({art:"on",name:"Lena Hofbauer",gruppe:"Lehrkraft",stichtag:isoH(2),geraete:["Laptop","iPad"]},1);
 a.s.forEach(x=>{if(x.f<=isoH(-1))x.ok={wer:x.r,am:dt(isoH(-2))}});a.s[1].ok=null;
 const b=anlegen({art:"on",name:"Jonas Pichler",gruppe:"Praktikant/in",stichtag:isoH(14),geraete:["iPad"]},1);
 const c=anlegen({art:"off",name:"Miriam Eder",gruppe:"Verwaltung",stichtag:isoH(-1),geraete:["Laptop","Handy"]},1);
 c.s.forEach((x,i)=>{if(i<5)x.ok={wer:x.r,am:dt(isoH(-1))}});
 const d=anlegen({art:"on",name:"Tobias Reindl",gruppe:"Sonstiges Personal",stichtag:isoH(-20),geraete:[]},1);
 d.s.forEach(x=>x.ok={wer:x.r,am:dt(isoH(-21))});save()}
if(!S)seed();
const pct=v=>Math.round(100*v.s.filter(x=>x.ok).length/v.s.length);
const offen=x=>!x.ok&&x.f<iso(heute());
function bar(p){return `<div class="bar"><span style="width:${p}%"></span></div><small>${p} % erledigt</small>`}
let ansicht="liste",rolle="IT";
function render(){document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.v===ansicht.split(":")[0]));
 const m=document.getElementById("app");
 if(ansicht==="liste"){m.innerHTML=`<div class="box"><h1>Vorgänge</h1><p>Jeder Ein- und Austritt wird als Vorgang mit Checkliste geführt. IT, Verwaltung und Schulleitung haken ihre Schritte ab, das Tool erinnert bei Verzug per E-Mail.</p>
 <div class="tw"><table><tr><th>Person</th><th>Art</th><th class="hide-m">Gruppe</th><th>Stichtag</th><th style="min-width:120px">Fortschritt</th></tr>${S.v.map(v=>{const ü=v.s.filter(offen).length;return `<tr class="vg" data-id="${v.id}"><td><b>${esc(v.name)}</b>${ü?`<br><span class="pill ov">${ü} überfällig</span>`:""}</td><td>${ART[v.art]}</td><td class="hide-m">${esc(v.gruppe)}</td><td>${dt(v.stichtag)}</td><td>${bar(pct(v))}</td></tr>`}).join("")}</table></div>
 <button class="btn l" id="reset">Beispieldaten zurücksetzen</button></div>`;
  m.querySelectorAll(".vg").forEach(r=>r.onclick=()=>{ansicht="v:"+r.dataset.id;render()});document.getElementById("reset").onclick=()=>{seed();render()}}
 else if(ansicht.startsWith("v:")){const v=S.v.find(x=>x.id==ansicht.slice(2));
  const ber=[...new Set(v.s.map(x=>x.b))];
  m.innerHTML=`<div class="box"><h1>${ART[v.art]}: ${esc(v.name)}</h1><p>${esc(v.gruppe)} · Stichtag ${dt(v.stichtag)} · Geräte: ${v.geraete.length?v.geraete.join(", "):"keine"}</p>${bar(pct(v))}
  <label>Ich hake ab als</label><select id="als">${Object.keys(ROLLEN).map(r=>`<option${r===rolle?" selected":""}>${r}</option>`).join("")}</select></div>`+
  ber.map(b=>`<div class="box"><h2>${b==="Drucker"?"Drucker und Kopierer":b}</h2>${v.s.map((x,i)=>x.b!==b?"":`<div class="step${x.ok?" done":""}"><input type="checkbox" data-i="${i}"${x.ok?" checked":""}${x.r!==rolle?" disabled title=\"Nur "+x.r+" kann diesen Schritt abhaken\"":""}><div><div class="t">${esc(x.t)}</div><span class="pill ${ROLLEN[x.r]}">${x.r}</span><small>fällig ${dt(x.f)}</small> ${x.ok?`<span class="pill ok">erledigt am ${x.ok.am}</span>`:offen(x)?'<span class="pill ov">überfällig</span>':""}</div></div>`).join("")}</div>`).join("")+`<button class="btn l" id="zur">Zurück zur Übersicht</button>`;
  document.getElementById("als").onchange=e=>{rolle=e.target.value;render()};document.getElementById("zur").onclick=()=>{ansicht="liste";render()};
  m.querySelectorAll(".step input").forEach(c=>c.onchange=()=>{const x=v.s[c.dataset.i];x.ok=c.checked?{wer:rolle,am:dt(iso(heute()))}:null;
   if(pct(v)===100)mail("Schulleitung",`Abgeschlossen: ${ART[v.art]} ${v.name}`,`Alle ${v.s.length} Schritte für ${v.name} sind erledigt. Der Vorgang ist abgeschlossen.`);save();render()})}
 else if(ansicht==="neu"){m.innerHTML=`<div class="box"><h1>Neuer Vorgang</h1><p>Die Checkliste entsteht aus der Vorlage, passend zu Personalgruppe und Geräten. Jede beteiligte Stelle bekommt sofort eine E-Mail mit ihren Aufgaben.</p>
  <div class="row"><div><label>Art</label><select id="art"><option value="on">Onboarding (Eintritt)</option><option value="off">Offboarding (Austritt)</option></select></div><div><label>Personalgruppe</label><select id="gr">${GRUPPEN.map(g=>`<option>${g}</option>`).join("")}</select></div></div>
  <div class="row"><div><label>Name</label><input id="nm" placeholder="Vorname Nachname"></div><div><label id="stl">Eintrittsdatum</label><input type="date" id="st" value="${isoH(21)}"></div></div>
  <label>Geräte</label><div class="cb">${GERAETE.map(g=>`<label><input type="checkbox" value="${g}"${g!=="Handy"?" checked":""}> ${g}</label>`).join("")}</div>
  <p id="vor"></p><button class="btn" id="go">Vorgang anlegen</button></div>`;
  const art=document.getElementById("art"),gr=document.getElementById("gr"),vor=()=>{const v=werte();document.getElementById("stl").textContent=v.art==="on"?"Eintrittsdatum":"Letzter Arbeitstag";document.getElementById("vor").innerHTML=`<small>${schritte(v).length} Schritte werden angelegt.</small>`};
  const werte=()=>({art:art.value,gruppe:gr.value,name:document.getElementById("nm").value.trim(),stichtag:document.getElementById("st").value,geraete:[...m.querySelectorAll(".cb input:checked")].map(c=>c.value)});
  m.querySelectorAll("select,input").forEach(e=>e.oninput=vor);vor();
  document.getElementById("go").onclick=()=>{const v=werte();if(!v.name||!v.stichtag){alert("Bitte Name und Datum angeben.");return}anlegen(v);ansicht="v:"+v.id;render()}}
 else if(ansicht==="aufgaben"){const l=[];S.v.forEach(v=>v.s.forEach((x,i)=>{if(!x.ok&&x.r===rolle)l.push({v,x,i})}));l.sort((a,b)=>a.x.f<b.x.f?-1:1);
  m.innerHTML=`<div class="box"><h1>Meine Aufgaben</h1><label>Rolle</label><select id="als">${Object.keys(ROLLEN).map(r=>`<option${r===rolle?" selected":""}>${r}</option>`).join("")}</select>
  ${l.length?l.map(o=>`<div class="step"><input type="checkbox" data-id="${o.v.id}" data-i="${o.i}"><div><div class="t">${esc(o.x.t)}</div><small>${esc(o.v.name)} · ${ART[o.v.art]} · fällig ${dt(o.x.f)}</small> ${offen(o.x)?'<span class="pill ov">überfällig</span>':""}</div></div>`).join(""):"<p>Keine offenen Aufgaben.</p>"}</div>`;
  document.getElementById("als").onchange=e=>{rolle=e.target.value;render()};
  m.querySelectorAll(".step input").forEach(c=>c.onchange=()=>{const v=S.v.find(x=>x.id==c.dataset.id);v.s[c.dataset.i].ok={wer:rolle,am:dt(iso(heute()))};save();render()})}
 else if(ansicht==="post"){m.innerHTML=`<div class="box"><h1>Postausgang (simuliert)</h1><p>Im Echtbetrieb verschickt das Tool diese E-Mails per SMTP. Der Erinnerungslauf läuft dort jeden Werktag um 7:00 Uhr automatisch und erinnert höchstens einmal am Tag an jeden überfälligen Schritt.</p>
  <button class="btn" id="lauf">Erinnerungslauf jetzt starten</button>${S.lauf?`<p><small>Letzter Lauf: ${S.lauf}</small></p>`:""}<div id="lp" style="display:none"><div class="bar"><span id="lb" style="width:0"></span></div><small id="lt"></small></div></div>
  <div class="box"><h2>${S.post.length} E-Mails</h2>${S.post.map(p=>`<div class="mail"><b>${esc(p.betreff)}</b><br><small>An: ${esc(p.an)} · ${p.zeit}</small><pre>${esc(p.text)}</pre></div>`).join("")}</div>`;
  document.getElementById("lauf").onclick=()=>{const alle=S.v.flatMap(v=>v.s.map(x=>({v,x}))),n=alle.length;let i=0,neu=0;const h=iso(heute());document.getElementById("lp").style.display="block";
   const tick=()=>{for(let k=0;k<4&&i<n;k++,i++){const {v,x}=alle[i];if(offen(x)&&x.erin!==h){x.erin=h;neu++;mail(x.r,`Erinnerung: überfälliger Schritt bei ${v.name}`,`Hallo ${x.r},\n\nder Schritt „${x.t}“ für ${v.name} (${ART[v.art]}) war am ${dt(x.f)} fällig und ist noch offen. Bitte erledigen oder im Tool abhaken.`)}}
    document.getElementById("lb").style.width=Math.round(100*i/n)+"%";document.getElementById("lt").textContent=`${Math.round(100*i/n)} % geprüft`;
    if(i<n)setTimeout(tick,40);else{S.lauf=zeit()+`, ${neu} Erinnerung${neu===1?"":"en"} verschickt`;save();setTimeout(render,300)}};tick()}}
 else if(ansicht==="vorlage"){m.innerHTML=`<div class="box"><h1>Vorlage</h1><p>Fälligkeit in Tagen relativ zum Eintritt bzw. letzten Arbeitstag. Schritte mit Gerät erscheinen nur, wenn das Gerät ausgegeben wird.</p>`+["on","off"].map(a=>`<h2>${ART[a]}</h2><div class="tw"><table><tr><th>Bereich</th><th>Schritt</th><th>Rolle</th><th>Tage</th></tr>${VORLAGE.filter(x=>x.a===a).map(x=>`<tr><td>${x.b}</td><td>${esc(x.t)}${x.g?`<br><small>nur ${x.g.join(", ")}</small>`:""}</td><td><span class="pill ${ROLLEN[x.r]}">${x.r}</span></td><td>${x.tage>0?"+":""}${x.tage}</td></tr>`).join("")}</table></div>`).join("")+"</div>"}
 window.scrollTo(0,0)}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{ansicht=b.dataset.v;render()});render();
