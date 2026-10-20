const USERS={ma:{n:"Lena Musterfrau",r:"Mitarbeiterin",s:"Realschule"},sv:{n:"Paul Beispiel",r:"Vorgesetzter",s:"Realschule"},gf:{n:"Dr. Eva Probe",r:"Geschäftsführung"},admin:{n:"Admin Demo",r:"Administrator"}};
const STEPS=["Eingereicht","Vorgesetzter","Geschäftsführung","Entschieden"];
const seed=()=>[
 {id:1,user:"ma",grund:"Fortbildung Microsoft 365",von:"2026-11-12 08:00",bis:"2026-11-12 16:00",status:"offen",stage:"sv",log:["Antrag eingereicht"]},
 {id:2,user:"ma",grund:"Familiärer Anlass",von:"2026-10-02 07:30",bis:"2026-10-02 13:00",status:"genehmigt",stage:"done",log:["Antrag eingereicht","Vorgesetzter: genehmigt","Geschäftsführung: genehmigt"]},
 {id:3,user:"ma",grund:"Arzttermin",von:"2026-11-20 09:00",bis:"2026-11-20 11:00",status:"rueckfrage",stage:"sv",log:["Antrag eingereicht","Vorgesetzter: Rückfrage (Bitte Vertretung angeben)"]}];
let S=JSON.parse(localStorage.getItem("fsdemo")||"null")||{role:"ma",reqs:seed(),mails:[]};
const fmt=d=>{const m=String(d).match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/);return m?`${m[3]}.${m[2]}.${m[1]}, ${m[4]} Uhr`:d};
const save=()=>localStorage.setItem("fsdemo",JSON.stringify(S));
const $=h=>{document.getElementById("app").innerHTML=h};
function mail(to,t){S.mails.unshift({to,t,at:new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})+" Uhr"});}
function stepIdx(r){return r.status==="genehmigt"||r.status==="abgelehnt"?3:r.stage==="gf"?2:1}
function steps(r){const i=stepIdx(r);return `<ul class="steps">${STEPS.map((s,k)=>{let c=k<i?"done":k===i?(r.status==="rueckfrage"?"ask":r.status==="abgelehnt"?"bad":r.status==="genehmigt"?"done":"now"):"todo";return `<li class="${c}">${s}</li>`}).join("")}</ul>
<div class="bar"><span style="width:${Math.round(i/3*100)}%"></span></div><div class="hint" style="font-weight:normal">Fortschritt: ${Math.round(i/3*100)} %</div>`}
const label={offen:"offen",genehmigt:"genehmigt",abgelehnt:"abgelehnt",rueckfrage:"Rückfrage"};
function roles(){document.getElementById("roles").innerHTML="Ansicht als: "+Object.entries(USERS).map(([k,u])=>`<button class="light ${S.role===k?"on":""}" onclick="S.role='${k}';save();render()">${u.r}</button>`).join("")+` <button class="light" onclick="localStorage.removeItem('fsdemo');location.reload()">Zurücksetzen</button>`}
function card(r,actions=""){return `<div class="paper"><div class="hdr"><span>Antrag Nr. ${r.id}</span><span>${USERS[r.user].n}</span></div>
<h3 style="margin-top:12px">${r.grund}</h3><table class="f"><tr><th>Zeitraum von</th><td>${fmt(r.von)}</td></tr><tr><th>Zeitraum bis</th><td>${fmt(r.bis)}</td></tr><tr><th>Status</th><td><b>${label[r.status]}</b></td></tr></table>${steps(r)}
<details><summary>Verlauf</summary><ul>${r.log.map(l=>`<li>${l}</li>`).join("")}</ul></details>${actions}</div>`}
function render(){roles();const u=USERS[S.role];let h=`<h1>Hallo ${u.n}</h1><p>${u.r}${u.s?", "+u.s:""}</p>`;
 if(S.role==="ma"){h+=`<h2>Neuer Antrag auf Freistellung oder Beurlaubung</h2><div class="paper"><table class="f">
 <tr><th>Name, Vorname</th><td>${u.n} (aus dem Konto, schreibgeschützt)</td></tr><tr><th>Schule</th><td>${u.s}</td></tr>
 <tr><th>Grund</th><td><input type="text" id="g" value="Teilnahme an einem Workshop"></td></tr>
 <tr><th>Zeitraum von</th><td><input type="date" id="vd" value="2026-12-03"> <input type="time" id="vt" value="08:00"></td></tr>
 <tr><th>Zeitraum bis</th><td><input type="date" id="bd" value="2026-12-03"> <input type="time" id="bt" value="15:00"></td></tr></table>
 <p><button onclick="neu()">Antrag einreichen</button></p></div><h2>Meine Anträge</h2>`;
 S.reqs.filter(r=>r.user==="ma").slice().reverse().forEach(r=>h+=card(r,r.status==="rueckfrage"?`<p><button onclick="antwort(${r.id})">Rückfrage beantworten</button></p>`:""));}
 if(S.role==="sv"||S.role==="gf"){const open=S.reqs.filter(r=>r.status==="offen"&&r.stage===S.role);h+=`<h2>Zur Freigabe (${open.length})</h2>`;if(!open.length)h+=`<p>Keine offenen Anträge.</p>`;
 open.forEach(r=>h+=card(r,`<p><button onclick="dec(${r.id},'ok')">Genehmigen</button> <button class="light" onclick="dec(${r.id},'ask')">Rückfrage</button> <button class="light" onclick="dec(${r.id},'no')">Ablehnen</button></p>`));}
 if(S.role==="admin"){const n=S.reqs.length,d=S.reqs.filter(r=>r.status==="genehmigt"||r.status==="abgelehnt").length;
 h+=`<h2>Übersicht</h2><div class="paper">Erledigt: ${d} von ${n} Anträgen<div class="bar"><span style="width:${Math.round(d/n*100)}%"></span></div>
 <table class="l"><tr><th>Nr.</th><th>Antragsteller</th><th>Grund</th><th>Status</th></tr>${S.reqs.map(r=>`<tr><td>${r.id}</td><td>${USERS[r.user].n}</td><td>${r.grund}</td><td>${label[r.status]}</td></tr>`).join("")}</table></div>
 <h2>Postausgang (simuliert)</h2>${S.mails.length?S.mails.map(m=>`<div class="mailbox"><b>${m.at}</b> an ${m.to}: ${m.t}</div>`).join(""):"<p>Noch keine Mails. Reichen Sie als Mitarbeiterin einen Antrag ein.</p>"}`;}
 $(h);}
function neu(){const g=document.getElementById("g").value.trim(),v=vd.value+" "+vt.value,b=bd.value+" "+bt.value;
 if(!g||b<=v){alert("Bitte Grund angeben. Das Ende muss nach dem Beginn liegen.");return}
 const id=Math.max(...S.reqs.map(r=>r.id))+1;S.reqs.push({id,user:"ma",grund:g,von:v,bis:b,status:"offen",stage:"sv",log:["Antrag eingereicht"]});
 mail(USERS.sv.n,`Neuer Antrag Nr. ${id} wartet auf Ihre Freigabe`);save();render();}
function antwort(id){const r=S.reqs.find(x=>x.id===id);r.status="offen";r.log.push("Mitarbeiterin: Rückfrage beantwortet");mail(USERS.sv.n,`Antwort zu Antrag Nr. ${id}`);save();render();}
function dec(id,a){const r=S.reqs.find(x=>x.id===id),who=USERS[S.role].r;
 if(a==="ok"){r.log.push(who+": genehmigt");if(r.stage==="sv"){r.stage="gf";mail(USERS.gf.n,`Antrag Nr. ${id} wartet auf Freigabe`)}else{r.stage="done";r.status="genehmigt";mail(USERS.ma.n,`Ihr Antrag Nr. ${id} wurde genehmigt`)}}
 if(a==="ask"){r.status="rueckfrage";r.log.push(who+": Rückfrage");mail(USERS.ma.n,`Rückfrage zu Antrag Nr. ${id}`)}
 if(a==="no"){r.status="abgelehnt";r.log.push(who+": abgelehnt");mail(USERS.ma.n,`Ihr Antrag Nr. ${id} wurde abgelehnt`)}
 save();render();}
render();
