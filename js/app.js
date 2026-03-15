

async function loadAppData(){
  const res = await fetch('./js/site_data.json');
  if(!res.ok) throw new Error('site_data.json introuvable');
  const data = await res.json();
  return { points: data.points, needs: data.needs };
}
function todayKey(){ return new Date().toISOString().slice(0,10); }
function lsGet(k,f){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):f; }catch(e){ return f; } }
function lsSet(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function getState(){ return { pseudo: lsGet('reloop_pseudo',''), deposits: lsGet('reloop_deposits',[]), points: lsGet('reloop_points',{}), last: lsGet('reloop_last',{}) }; }
function saveState(s){ lsSet('reloop_pseudo', s.pseudo); lsSet('reloop_deposits', s.deposits); lsSet('reloop_points', s.points); lsSet('reloop_last', s.last); }
function computePoints(needs, needId){
  const n = needs.find(x=>x.id===needId) || needs[0];
  const base = n.base_points||0;
  const bonus = (n.priority==='Urgent') ? (n.bonus_points||0) : 0;
  return {need:n, points: base+bonus};
}
function renderApp(container, data){
  const s = getState();
  container.innerHTML =
    '<div class="grid">'
    +'<div class="card span8">'
      +'<h2 class="sectionTitle" style="margin:0 0 8px;">Valider un dépôt</h2>'
      +'<p class="p">Prototype : dépôt → scan QR → validation → points. (Le poids est validé au ramassage.)</p>'
      +'<div class="grid">'
        +'<div class="card span6" style="padding:14px;"><label>Pseudo</label><input id="pseudo" placeholder="ex: Erdi" value="'+(s.pseudo||'')+'"><div class="small" style="margin-top:8px;">Pas d’email en MVP.</div></div>'
        +'<div class="card span6" style="padding:14px;"><label>Point de collecte</label><select id="point"></select></div>'
        +'<div class="card span12" style="padding:14px;"><label>Besoin industriel associé</label><select id="need"></select><div class="small" style="margin-top:8px;">Bonus si besoin urgent.</div></div>'
        +'<div class="card span12" style="padding:14px;"><div class="notice"><div class="small">Règle anti-triche : 1 dépôt max / jour / utilisateur.</div></div>'
          +'<div class="btnRow" style="margin-top:12px;"><button class="btn" id="validate">Valider le dépôt</button><button class="btn secondary" id="reset">Réinitialiser</button></div></div>'
      +'</div>'
    +'</div>'
    +'<div class="card span4">'
      +'<h2 class="sectionTitle" style="margin:0 0 8px;">Mon statut</h2>'
      +'<div class="pillRow"><div class="pill">Pseudo : <span class="mono">'+(s.pseudo||'—')+'</span></div>'
      +'<div class="pill">Points : <span class="mono">'+(s.pseudo ? (s.points[s.pseudo]||0) : 0)+'</span></div>'
      +'<div class="pill">Dépôts : <span class="mono">'+s.deposits.length+'</span></div></div>'
      +'<div style="margin-top:14px;"><h3 class="sectionTitle" style="margin:0 0 8px;">Classement</h3><div id="board"></div></div>'
    +'</div>'
    +'</div>';

  const pointSel = container.querySelector('#point');
  data.points.forEach(p=>{ const o=document.createElement('option'); o.value=p.id; o.textContent=p.id+' – '+p.name; pointSel.appendChild(o); });
  const needSel = container.querySelector('#need');
  data.needs.forEach(n=>{ const o=document.createElement('option'); o.value=n.id; o.textContent=n.label+' ('+n.priority+')'; needSel.appendChild(o); });

  const q = (location.hash.split('?')[1] || '');
  const params = new URLSearchParams(q);
  const prePoint = params.get('point');
  if(prePoint) pointSel.value = prePoint;

  const board = container.querySelector('#board');
  const entries = Object.entries(s.points).map(([u,pts])=>({u,pts})).sort((a,b)=>b.pts-a.pts).slice(0,10);
  let bhtml = '<table class="table"><thead><tr><th>#</th><th>Utilisateur</th><th>Points</th></tr></thead><tbody>';
  if(!entries.length){ bhtml += '<tr><td colspan="3" class="small">Aucun dépôt</td></tr>'; }
  else { entries.forEach((e,i)=>{ bhtml += '<tr><td class="mono">'+(i+1)+'</td><td><strong>'+e.u+'</strong></td><td class="mono">'+e.pts+'</td></tr>'; }); }
  bhtml += '</tbody></table>';
  board.innerHTML = bhtml;

  container.querySelector('#validate').addEventListener('click', ()=>{
    const pseudo = container.querySelector('#pseudo').value.trim();
    const point = pointSel.value;
    const needId = needSel.value;
    if(!pseudo) return alert('Entre un pseudo.');
    const ns = getState();
    if(ns.last[pseudo] === todayKey()) return alert('Règle MVP : 1 dépôt max / jour / utilisateur.');
    const r = computePoints(data.needs, needId);
    ns.pseudo = pseudo;
    ns.deposits.push({date: todayKey(), ts: new Date().toISOString(), pseudo, point, needId: r.need.id, needLabel: r.need.label, points: r.points});
    ns.points[pseudo] = (ns.points[pseudo] || 0) + r.points;
    ns.last[pseudo] = todayKey();
    saveState(ns);
    alert('Dépôt validé ✅ +' + r.points + ' points (' + r.need.label + ')');
    renderApp(container, data);
  });

  container.querySelector('#reset').addEventListener('click', ()=>{
    if(!confirm('Réinitialiser tes données locales (MVP) ?')) return;
    localStorage.removeItem('reloop_pseudo'); localStorage.removeItem('reloop_deposits'); localStorage.removeItem('reloop_points'); localStorage.removeItem('reloop_last');
    renderApp(container, data);
  });
}
window.addEventListener('DOMContentLoaded', async ()=>{
  const container = document.querySelector('[data-app]');
  if(!container) return;
  const data = await loadAppData();
  renderApp(container, data);
});
