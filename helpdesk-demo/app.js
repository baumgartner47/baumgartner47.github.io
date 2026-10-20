const KAT=["Untis","Schulportal","Teams / M365","Tafel","Gerät","Sonstiges"],ST=["neu","in Bearbeitung","wartet auf Rückmeldung","gelöst"],PR=["niedrig","normal","hoch"];
const SEED=[
{id:1,erstellt:"2026-10-12 08:05",name:"M. Beispiel",raum:"204",kategorie:"Tafel",titel:"Tafel zeigt kein Bild",prio:"hoch",status:"gelöst",bearbeiter:"Selbsthilfe"},
{id:2,erstellt:"2026-10-13 10:40",name:"K. Muster",raum:"Lehrerzimmer",kategorie:"Gerät",titel:"Drucker druckt nicht",prio:"normal",status:"in Bearbeitung",bearbeiter:"IT-Team"},
{id:3,erstellt:"2026-10-14 07:55",name:"S. Probe",raum:"112",kategorie:"Teams / M365",titel:"Neues Handy, Authenticator geht nicht",prio:"hoch",status:"neu",bearbeiter:""},
{id:4,erstellt:"2026-10-15 13:20",name:"T. Demo",raum:"Sekretariat",kategorie:"Schulportal",titel:"Eltern können sich nicht registrieren",prio:"normal",status:"wartet auf Rückmeldung",bearbeiter:"Verwaltung"},
{id:5,erstellt:"2026-10-16 09:10",name:"L. Beispiel",raum:"015",kategorie:"Untis",titel:"Vertretungsplan zeigt alte Daten",prio:"niedrig",status:"gelöst",bearbeiter:"Selbsthilfe"}];
let W=[],T=JSON.parse(localStorage.getItem("hddemo")||"null")||SEED;const save=()=>localStorage.setItem("hddemo",JSON.stringify(T));
const app=document.getElementById("app"),esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const worte=t=>new Set(t.toLowerCase().match(/[a-zäöüß0-9]+/g)||[]);
function suche(t){const w=worte(t);return W.map(a=>[a.stichworte.filter(k=>w.has(k)).length*3+[...worte(a.titel)].filter(x=>w.has(x)).length,a]).filter(x=>x[0]).sort((a,b)=>b[0]-a[0]).slice(0,2).map(x=>x[1])}
const fmt=d=>{const m=String(d).match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/);return m?`${m[3]}.${m[2]}.${m[1]} ${m[4]}`:d};
const jetzt=()=>{const d=new Date(),z=n=>String(n).padStart(2,"0");return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`};
const opts=(l,s)=>l.map(x=>`<option ${x==s?"selected":""}>${x}</option>`).join("");
function melden(){app.innerHTML=`<div class="box"><h1>Problem melden</h1>
<label>Name</label><input id="n" value="A. Beispiel"><label>Raum</label><input id="r" value="208">
<label>Bereich</label><select id="k">${opts(KAT,"Tafel")}</select><label>Betreff</label><input id="t" value="Tafel bleibt schwarz">
<label>Was ist passiert?</label><textarea id="x">Laptop ist per HDMI angeschlossen, die Tafel zeigt aber kein Bild.</textarea>
<label>Dringlichkeit</label><select id="p">${opts(PR,"normal")}</select><button class="btn" id="go">Absenden</button>
<p><small>Beispiele zum Ausprobieren: "WLAN geht nicht", "Passwort Untis vergessen", "Schüler sehen das Team nicht".</small></p></div><div id="out"></div>`;
document.getElementById("go").onclick=senden}
function senden(){const g=id=>document.getElementById(id).value.trim(),titel=g("t"),text=g("x");if(!titel||!text)return alert("Bitte Betreff und Beschreibung ausfüllen.");
const id=Math.max(0,...T.map(t=>t.id))+1;T.push({id,erstellt:jetzt(),name:g("n"),raum:g("r"),kategorie:g("k"),titel,prio:g("p"),status:"neu",bearbeiter:""});save();
const out=document.getElementById("out");let p=0;const schritte=["Ticket anlegen","Wissensdatenbank durchsuchen","Lösung formulieren"];
const iv=setInterval(()=>{p+=4;out.innerHTML=`<div class="box">${schritte[Math.min(2,Math.floor(p/34))]} ... ${p} %<div class="bar"><span style="width:${p}%"></span></div></div>`;
if(p>=100){clearInterval(iv);antwort(id,suche(titel+" "+text))}},40)}
function antwort(id,tr){const out=document.getElementById("out");
let h=`<div class="box"><h2>Ticket Nr. ${id} ist angelegt</h2>`;
if(tr.length){h+=`<div class="ki"><b>Vorschlag des Helpdesk-Assistenten</b><p>Das klingt nach "${esc(tr[0].titel)}". Probieren Sie bitte diese Schritte:</p><ol>${tr[0].loesung.map(s=>`<li>${esc(s)}</li>`).join("")}</ol>${tr[1]?`<p>Weitere passende Anleitung: <span class="chip">${esc(tr[1].titel)}</span></p>`:""}</div>
<button class="btn" onclick="selbst(${id})">Hat geholfen, Ticket schließen</button><button class="btn l" onclick="ansicht('liste')">Nein, die IT soll sich melden</button>`}
else h+=`<p>Keine passende Anleitung gefunden. Die IT meldet sich.</p>`;out.innerHTML=h+"</div>"}
function selbst(id){const t=T.find(x=>x.id==id);t.status="gelöst";t.bearbeiter="Selbsthilfe";save();ansicht("statistik")}
function liste(){app.innerHTML=`<h1>Tickets</h1><table><tr><th>Nr.</th><th>Erstellt</th><th>Bereich</th><th>Betreff</th><th>Priorität</th><th>Status</th><th>Bearbeiter</th></tr>${
[...T].sort((a,b)=>PR.indexOf(b.prio)-PR.indexOf(a.prio)||b.id-a.id).map(t=>`<tr><td>${t.id}</td><td>${fmt(t.erstellt)}</td><td>${t.kategorie}</td><td>${esc(t.titel)}</td><td class="${t.prio}">${t.prio}</td>
<td><select onchange="upd(${t.id},'status',this.value)">${opts(ST,t.status)}</select></td><td><select onchange="upd(${t.id},'bearbeiter',this.value)">${opts(["","IT-Team","Verwaltung","Selbsthilfe"],t.bearbeiter)}</select></td></tr>`).join("")}</table>`}
function upd(id,k,v){T.find(t=>t.id==id)[k]=v;save()}
function statistik(){const n=T.length,g=T.filter(t=>t.status=="gelöst").length,s=T.filter(t=>t.bearbeiter=="Selbsthilfe").length,q=n?Math.round(g/n*100):0;
const kat={};T.forEach(t=>kat[t.kategorie]=(kat[t.kategorie]||0)+1);const m=Math.max(...Object.values(kat));
app.innerHTML=`<h1>Statistik</h1><div class="kpi"><div><b>${n}</b>Tickets</div><div><b>${g}</b>gelöst</div><div><b>${s}</b>per Selbsthilfe</div><div><b>${q} %</b>Lösungsquote</div></div>
<div class="box" style="margin-top:16px"><h3>Lösungsquote</h3><div class="bar"><span style="width:${q}%"></span></div><h3>Tickets nach Bereich</h3>${
Object.entries(kat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div>${k}: ${v}<div class="bar"><span style="width:${v/m*100}%"></span></div></div>`).join("")}</div>`}
function ansicht(v){if(v=="reset"){localStorage.removeItem("hddemo");T=JSON.parse(JSON.stringify(SEED));v="melden"}
document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.v==v));({melden,liste,statistik})[v]()}
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>ansicht(b.dataset.v));
fetch("wissen.json").then(r=>r.json()).then(j=>{W=j;melden()});
