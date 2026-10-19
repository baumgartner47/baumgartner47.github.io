const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let KL={};
Promise.all([fetch("schueler.csv").then(r=>r.text()),fetch("klassen.csv").then(r=>r.text())]).then(([s,k])=>{
 document.getElementById("csv").value=s.trim();
 k.trim().split(/\r?\n/).slice(1).forEach(l=>{const [c,t]=l.split(";");KL[c]=t.split(",")})});
function name(v,n){let s=(v+"."+n).toLowerCase();for(const [a,b] of [["ä","ae"],["ö","oe"],["ü","ue"],["ß","ss"],[" ",""]])s=s.split(a).join(b);
 return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9.\-]/g,"")}
function pw(){const z="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789",a=new Uint32Array(10);crypto.getRandomValues(a);return [...a].map(x=>z[x%z.length]).join("")+"!"}
document.getElementById("go").onclick=()=>{
 const zeilen=document.getElementById("csv").value.trim().split(/\r?\n/),kopf=zeilen.shift().split(";"),dom=document.getElementById("dom").value.trim();
 const S=zeilen.filter(Boolean).map(l=>{const v=l.split(";"),o={};kopf.forEach((k,i)=>o[k.trim()]=(v[i]||"").trim());return o});
 const klassen=[...new Set(S.map(s=>s.Klasse))],total=S.length+klassen.length,erg=[],verg={};let i=0;
 const prog=document.getElementById("prog"),pt=document.getElementById("pt"),pb=document.getElementById("pb");prog.style.display="block";document.getElementById("out").innerHTML="";
 const tick=()=>{if(i<S.length){const s=S[i],b=name(s.Vorname,s.Nachname);let n=b,k=2;while(verg[n])n=b+(k++);verg[n]=1;
   erg.push({Klasse:s.Klasse,Name:s.Nachname+", "+s.Vorname,Benutzername:n+"@"+dom,Aktion:"würde angelegt",Startkennwort:pw()});pt.textContent=`Schülerkonten: ${s.Klasse} ${s.Nachname}`}
  else{const c=klassen[i-S.length],m=S.filter(s=>s.Klasse==c).length;erg.push({Klasse:c,Name:`Team "Klasse ${c} 2026/27" (Vorlage Kurs)`,Benutzername:(KL[c]||["keine Lehrkraft hinterlegt"]).join(", "),Aktion:`würde mit ${m} Schülern angelegt`,Startkennwort:""});pt.textContent=`Klassenteams: ${c}`}
  i++;const p=Math.round(i/total*100);pb.style.width=p+"%";pt.textContent+=` (${p} %)`;
  if(i<total)setTimeout(tick,180);else zeigen(erg,S.length,klassen.length)};tick()};
function zeigen(erg,ns,nk){window.ERG=erg;document.getElementById("pt").textContent="Testlauf abgeschlossen (100 %). Es wurde nichts verändert.";
 document.getElementById("out").innerHTML=`<div class="box"><h2>Ergebnis</h2><p>${ns} Konten und ${nk} Klassenteams würden angelegt.</p>
 <table><tr><th>Klasse</th><th>Name</th><th>Benutzername / Lehrkräfte</th><th>Aktion</th><th>Startkennwort</th></tr>${erg.map(e=>`<tr><td>${esc(e.Klasse)}</td><td>${esc(e.Name)}</td><td>${esc(e.Benutzername)}</td><td class="neu">${esc(e.Aktion)}</td><td><code>${e.Startkennwort}</code></td></tr>`).join("")}</table>
 <button class="btn" onclick="csv()">Bericht als CSV herunterladen</button></div>`}
function csv(){const k=["Klasse","Name","Benutzername","Aktion","Startkennwort"],t=[k.join(";"),...ERG.map(e=>k.map(x=>e[x]).join(";"))].join("\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+t],{type:"text/csv"}));a.download="bericht_testlauf.csv";a.click()}
