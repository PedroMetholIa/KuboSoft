// KuboMétricas — vanilla SPA logic
// Loaded once; window.__metricasMount() is called on each Angular navigation

// ── PALETTE ──────────────────────────────────────────────
const P = {
  b500:'#1b35df', b600:'#1428b8', b700:'#0e1c8f', b300:'#6A7FFF',
  b100:'#C4CEFF', b25:'#EEF1FF', green:'#10B981', amber:'#F59E0B',
  red:'#EF4444', teal:'#14B8A6', sky:'#38BDF8', ink:'#1A1A2E',
  ink3:'#696987', ink4:'#9999AA', border:'#E4E8F0'
};
const MO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

// ── DB ────────────────────────────────────────────────────
const DB = {
  clients: [
    {id:1,nombre:'TechCorp SA',seg:'Enterprise',ltv:320000,contacto:'hace 2 días',est:'Activo',churn:12},
    {id:2,nombre:'Grupo Meridian',seg:'Mid-market',ltv:185000,contacto:'hace 1 semana',est:'Activo',churn:28},
    {id:3,nombre:'Innova Labs',seg:'SMB',ltv:54000,contacto:'hace 3 semanas',est:'En riesgo',churn:67},
    {id:4,nombre:'Retail Plus',seg:'SMB',ltv:38000,contacto:'hace 2 días',est:'Activo',churn:15},
    {id:5,nombre:'Constructora Norte',seg:'Enterprise',ltv:580000,contacto:'ayer',est:'Activo',churn:8},
    {id:6,nombre:'FoodCo',seg:'SMB',ltv:22000,contacto:'hace 5 semanas',est:'En riesgo',churn:74},
  ],
  products: [
    {id:1,nombre:'KuboGestión Pro',cat:'SaaS',precio:299,vendidos:142,margen:78},
    {id:2,nombre:'KuboStock Starter',cat:'SaaS',precio:99,vendidos:387,margen:82},
    {id:3,nombre:'KuboReservas Plus',cat:'SaaS',precio:149,vendidos:218,margen:75},
    {id:4,nombre:'KuboMétricas',cat:'SaaS',precio:199,vendidos:96,margen:85},
    {id:5,nombre:'Consultoría IA',cat:'Servicio',precio:4500,vendidos:12,margen:62},
    {id:6,nombre:'Implementación',cat:'Servicio',precio:2200,vendidos:28,margen:58},
  ],
  transactions: [
    {id:1,cli:'TechCorp SA',cliId:1,prodId:1,monto:45000,canal:'Digital',est:'Pagado',fecha:'2025-06-24'},
    {id:2,cli:'Grupo Meridian',cliId:2,prodId:3,monto:28500,canal:'Presencial',est:'Pagado',fecha:'2025-06-23'},
    {id:3,cli:'Innova Labs',cliId:3,prodId:2,monto:12000,canal:'Digital',est:'Pendiente',fecha:'2025-06-23'},
    {id:4,cli:'Retail Plus',cliId:4,prodId:2,monto:8700,canal:'Digital',est:'Pagado',fecha:'2025-06-22'},
    {id:5,cli:'Constructora Norte',cliId:5,prodId:5,monto:67000,canal:'Presencial',est:'Pagado',fecha:'2025-06-20'},
    {id:6,cli:'FoodCo',cliId:6,prodId:2,monto:5400,canal:'Digital',est:'Vencido',fecha:'2025-06-18'},
  ],
  tickets: [
    {id:1,t:'Error al exportar PDF',p:'Alta',e:'Abierto',age:'2h'},
    {id:2,t:'Integración Slack caída',p:'Crítica',e:'En curso',age:'5h'},
    {id:3,t:'Dashboard no carga en Safari',p:'Media',e:'Abierto',age:'1d'},
    {id:4,t:'Error en filtro de fechas',p:'Baja',e:'Resuelto',age:'2d'},
  ],
  alertas: [
    {id:1,metric:'Ingresos totales',cond:'Menor a',val:500000,chan:'Email + Dashboard',activa:true,sev:'r',disparo:false},
    {id:2,metric:'Clientes en riesgo',cond:'Mayor a',val:2,chan:'Dashboard',activa:true,sev:'a',disparo:false},
    {id:3,metric:'Churn rate',cond:'Mayor a',val:5,chan:'Email',activa:true,sev:'r',disparo:false},
    {id:4,metric:'Ticket promedio',cond:'Menor a',val:1500,chan:'Dashboard',activa:true,sev:'a',disparo:false},
  ],
  goals: [
    {id:1,desc:'Ingresos totales',link:'ingresos',goal:700000,col:'b'},
    {id:2,desc:'Nuevos clientes',link:'clientes',goal:8,col:'g'},
    {id:3,desc:'Churn rate (%)',link:'churn',goal:3,col:'a',invertido:true},
    {id:4,desc:'Ticket promedio',link:'ticket',goal:2500,col:'b'},
  ],
  histRevenue: [312,278,334,298,356,389,412,378,445,467,502,595].map(v=>v*1000),
  histRevenuePrev: [280,255,310,270,320,345,370,342,400,420,458,503].map(v=>v*1000),
  nextId: 100,
};

// ── RENDER STATE ──────────────────────────────────────────
let charts = {};
let currentView = 'overview';
let alertTab = 'activas';
let cfgSection = 'empresa';

const titles = {
  overview:'Resumen general', ventas:'Ventas e ingresos', clientes:'Clientes',
  productos:'Productos', operaciones:'Operaciones', alertas:'Alertas',
  reportes:'Reportes', ia:'Análisis IA', config:'Configuración'
};

// ── COMPUTED METRICS ──────────────────────────────────────
function compute() {
  const txPagadas = DB.transactions.filter(t=>t.est==='Pagado');
  const ingresos  = txPagadas.reduce((s,t)=>s+t.monto, 0);
  const totalClientes   = DB.clients.length;
  const clientesActivos = DB.clients.filter(c=>c.est==='Activo').length;
  const enRiesgo  = DB.clients.filter(c=>c.est==='En riesgo').length;
  const churnRate = totalClientes>0 ? +((enRiesgo/totalClientes)*100).toFixed(1) : 0;
  const txCount   = DB.transactions.length;
  const ticket    = txPagadas.length>0 ? Math.round(ingresos/txPagadas.length) : 0;
  const totalRevProd = DB.products.reduce((s,p)=>s+p.precio*p.vendidos, 0);
  const avgMargen = DB.products.length>0 ? Math.round(DB.products.reduce((s,p)=>s+p.margen,0)/DB.products.length) : 0;
  const totalUnits = DB.products.reduce((s,p)=>s+p.vendidos, 0);
  const ticketsAbiertos = DB.tickets.filter(t=>t.e==='Abierto'||t.e==='En curso').length;
  const alertasActivas  = DB.alertas.filter(a=>a.activa).length;
  const nuevosEsteMes = Math.min(DB.clients.length, 6);
  const canales = {};
  txPagadas.forEach(t=>{canales[t.canal]=(canales[t.canal]||0)+t.monto;});
  return {ingresos,totalClientes,clientesActivos,enRiesgo,churnRate,txCount,ticket,
          totalRevProd,avgMargen,totalUnits,ticketsAbiertos,alertasActivas,canales,nuevosEsteMes};
}

// ── AUTO-CHECK ALERTS ─────────────────────────────────────
function checkAlerts() {
  const m = compute();
  const vals = {
    'Ingresos totales': m.ingresos, 'Ticket promedio': m.ticket,
    'Clientes en riesgo': m.enRiesgo, 'Churn rate': m.churnRate,
    'Tickets abiertos': m.ticketsAbiertos,
  };
  let newDisparos = 0;
  DB.alertas.forEach(a=>{
    if(!a.activa) return;
    const v = vals[a.metric];
    if(v===undefined) return;
    const prev = a.disparo;
    a.disparo = a.cond==='Mayor a' ? v>a.val : v<a.val;
    if(a.disparo && !prev) newDisparos++;
  });
  const activas = DB.alertas.filter(a=>a.activa&&a.disparo).length;
  const nbEl = document.getElementById('nb-al');
  if(nbEl) nbEl.textContent = activas;
  if(newDisparos>0) showToast(`⚠️ ${newDisparos} alerta${newDisparos>1?'s':''} disparada${newDisparos>1?'s':''}`, 'e');
}

// ── NAVIGATION ────────────────────────────────────────────
function navigate(v) {
  document.querySelectorAll('.metricas-wrap .ni').forEach(i=>i.classList.remove('active'));
  document.querySelector(`.metricas-wrap [data-view="${v}"]`)?.classList.add('active');
  document.querySelectorAll('.metricas-wrap .view').forEach(x=>x.classList.remove('active'));
  const viewEl = document.getElementById('view-'+v);
  if(viewEl) viewEl.classList.add('active');
  currentView = v;
  const titleEl = document.getElementById('tb-title');
  if(titleEl) titleEl.textContent = titles[v]||v;
  destroyCharts();
  setTimeout(()=>{
    if(v==='overview')    renderOverview();
    if(v==='ventas')      renderVentas();
    if(v==='clientes')    renderClientes();
    if(v==='productos')   renderProductos();
    if(v==='operaciones') renderOperaciones();
    if(v==='alertas')     renderAlertas();
    if(v==='reportes')    renderReportes();
    if(v==='ia')          renderIA();
    if(v==='config')      renderConfig();
  }, 30);
}

function destroyCharts() {
  Object.values(charts).forEach(c=>{try{c.destroy();}catch(e){}});
  charts = {};
}

// ── HELPERS ──────────────────────────────────────────────
const fM = v=>'$'+(v>=1e6?(v/1e6).toFixed(1)+'M':v>=1000?(v/1000).toFixed(0)+'k':v.toLocaleString('es-UY'));
const fN = v=>Number(v).toLocaleString('es-UY');
const rnd = (a,b)=>Math.floor(Math.random()*(b-a)+a);

function showToast(msg, type='s') {
  const c = document.getElementById('tcon');
  if(!c) return;
  const t = document.createElement('div');
  t.className = 'toast '+type;
  t.innerHTML = `<i class="ti fa-solid ${type==='s'?'fa-check-circle':'fa-exclamation-circle'}"></i>${msg}`;
  c.appendChild(t);
  setTimeout(()=>{t.style.opacity='0';t.style.transition='opacity .3s';setTimeout(()=>t.remove(),300);}, 3500);
}

function closeOvl(e, id) { if(e.target===document.getElementById('modal-'+id)) closeM(id); }
function closeM(id) { document.getElementById('modal-'+id)?.classList.remove('open'); }

function openM(id) {
  if(id==='tx') {
    const cliSel  = document.getElementById('tx-cli');
    const prodSel = document.getElementById('tx-prod');
    if(cliSel)  cliSel.innerHTML  = DB.clients.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('');
    if(prodSel) prodSel.innerHTML = DB.products.map(p=>`<option value="${p.id}">${p.nombre} (${fM(p.precio)})</option>`).join('');
    const fEl = document.getElementById('tx-fecha');
    const mEl = document.getElementById('tx-monto');
    if(fEl) fEl.value = todayStr;
    if(mEl) mEl.value = '';
    const tEl = document.getElementById('tx-modal-title');
    if(tEl) tEl.textContent = 'Nueva venta';
  }
  document.getElementById('modal-'+id)?.classList.add('open');
}

// ── CHART HELPERS ────────────────────────────────────────
function mkDonut(elId, segs) {
  const el = document.getElementById(elId); if(!el) return;
  if(!segs.length){el.innerHTML='<div class="empty-s"><i class="fa-solid fa-chart-pie"></i><p>Sin datos</p></div>';return;}
  const total = segs.reduce((s,x)=>s+x.v,0);
  if(!total){el.innerHTML='<div class="empty-s"><i class="fa-solid fa-chart-pie"></i><p>Sin datos</p></div>';return;}
  const sz=104,cx=sz/2,cy=sz/2,R=40,ri=24;
  const cols=[P.b500,P.green,P.amber,P.sky,P.teal,P.red];
  let ang=-Math.PI/2, paths='', legend='';
  segs.forEach((s,i)=>{
    const sw=(s.v/total)*Math.PI*2, c=s.c||cols[i%cols.length];
    const x1=cx+R*Math.cos(ang),y1=cy+R*Math.sin(ang);
    const x2=cx+R*Math.cos(ang+sw),y2=cy+R*Math.sin(ang+sw);
    const xi1=cx+ri*Math.cos(ang),yi1=cy+ri*Math.sin(ang);
    const xi2=cx+ri*Math.cos(ang+sw),yi2=cy+ri*Math.sin(ang+sw);
    const lg=sw>Math.PI?1:0;
    paths+=`<path d="M${x1} ${y1} A${R} ${R} 0 ${lg} 1 ${x2} ${y2} L${xi2} ${yi2} A${ri} ${ri} 0 ${lg} 0 ${xi1} ${yi1}Z" fill="${c}"/>`;
    legend+=`<div class="dl-item"><div class="dl-dot" style="background:${c}"></div><div class="dl-label">${s.l}</div><div class="dl-val">${fM(s.v)}</div><span class="dl-pct"> ${Math.round(s.v/total*100)}%</span></div>`;
    ang+=sw;
  });
  el.innerHTML=`<div class="donut-wrap"><svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}">${paths}</svg><div>${legend}</div></div>`;
}

function mkSpark(elId, data, col) {
  const el = document.getElementById(elId); if(!el) return;
  const w=el.parentElement?.offsetWidth||160, h=28;
  el.setAttribute('viewBox',`0 0 ${w} ${h}`); el.setAttribute('width',w); el.setAttribute('height',h);
  if(data.length<2){el.innerHTML='';return;}
  const mx=Math.max(...data), mn=Math.min(...data), rng=mx-mn||1;
  const pts=data.map((v,i)=>[(i/(data.length-1))*(w-4)+2, h-3-((v-mn)/rng)*(h-6)]);
  const d='M'+pts.map(p=>p.join(',')).join('L');
  const gId='g'+elId+Math.random().toString(36).slice(2);
  el.innerHTML=`<defs><linearGradient id="${gId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${col}" stop-opacity=".2"/><stop offset="100%" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${pts[pts.length-1][0]},${h} L${pts[0][0]},${h}Z" fill="url(#${gId})"/><path d="${d}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// ── KPI CARD ─────────────────────────────────────────────
function kpiHtml(cfg) {
  const {label,value,delta,dir,icon,col,sparkId,onclick:oc}=cfg;
  const bg=col===P.green?'var(--gbg)':col===P.amber?'var(--abg)':col===P.red?'var(--rbg)':col===P.teal?'var(--tbg)':'var(--b100)';
  const ic=col===P.green?'var(--gt)':col===P.amber?'var(--at)':col===P.red?'var(--rt)':col===P.teal?'var(--tt)':'var(--b700)';
  const dc=dir==='up'?'up':dir==='dn'?'dn':'neu';
  const arr=dir==='up'?'fa-arrow-trend-up':dir==='dn'?'fa-arrow-trend-down':'fa-minus';
  return `<div class="kpi" ${oc?`onclick="${oc}"`:''}>
    <div class="kpi-accent" style="background:${col}"></div>
    <div class="kpi-label">${label}<div class="kpi-icon" style="background:${bg};color:${ic};"><i class="fa-solid ${icon}"></i></div></div>
    <div class="kpi-value ${value.length>8?'sm':''}">${value}</div>
    <div class="kpi-delta ${dc}"><i class="fa-solid ${arr}"></i> ${delta}</div>
    ${sparkId?`<svg class="spark-svg" id="${sparkId}"></svg>`:''}
  </div>`;
}

// ── OVERVIEW ─────────────────────────────────────────────
function renderOverview() {
  const m = compute();

  const kpisEl = document.getElementById('ov-kpis');
  if(kpisEl) kpisEl.innerHTML = [
    {label:'Ingresos totales', value:fM(m.ingresos), delta:`${DB.transactions.filter(t=>t.est==='Pagado').length} transacciones cobradas`, dir:m.ingresos>400000?'up':'dn', icon:'fa-dollar-sign', col:P.b500, onclick:"navigate('ventas')"},
    {label:'Total clientes',   value:String(m.totalClientes), delta:`${m.enRiesgo} en riesgo · ${m.clientesActivos} activos`, dir:m.enRiesgo>2?'dn':'up', icon:'fa-users', col:P.green, onclick:"navigate('clientes')"},
    {label:'Ticket promedio',  value:fM(m.ticket), delta:`${m.txCount} tx en total`, dir:'up', icon:'fa-receipt', col:P.amber, onclick:"navigate('ventas')"},
    {label:'Churn rate',       value:m.churnRate+'%', delta:`${m.enRiesgo} de ${m.totalClientes} clientes`, dir:m.churnRate>5?'dn':'up', icon:'fa-person-walking-arrow-right', col:m.churnRate>5?P.red:P.teal, onclick:"navigate('clientes')"},
  ].map(kpiHtml).join('');

  const actEl = document.getElementById('ov-activity');
  if(actEl) {
    const recent = DB.transactions.slice().reverse().slice(0,6);
    if(!recent.length) {
      actEl.innerHTML=`<div class="empty-s" style="padding:28px;"><i class="fa-solid fa-receipt"></i><p>Sin transacciones aún.<br><button class="btn btn-p btn-sm" style="margin-top:8px;" onclick="openM('tx')">Registrar primera venta</button></p></div>`;
    } else {
      const sb={Pagado:'bg',Pendiente:'ba',Vencido:'br'};
      actEl.innerHTML=recent.map(t=>`
        <div class="ri" style="gap:10px;">
          <div style="width:34px;height:34px;border-radius:9px;background:var(--b25);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid fa-arrow-right-arrow-left" style="font-size:12px;color:var(--b500);"></i></div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.cli}</div>
            <div style="font-size:11px;color:var(--ink3);">${t.canal} · ${t.fecha.slice(5)}</div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-family:var(--fm);font-size:13px;font-weight:600;">${fM(t.monto)}</div>
            <span class="badge ${sb[t.est]||'bn'}" style="font-size:10px;">${t.est}</span>
          </div>
        </div>`).join('');
    }
  }

  const canalEl = document.getElementById('ov-canales');
  if(canalEl) {
    const cols={Digital:P.b500,Presencial:P.green,Partner:P.amber};
    const cmap={};
    DB.transactions.filter(t=>t.est==='Pagado').forEach(t=>{cmap[t.canal]=(cmap[t.canal]||0)+t.monto;});
    const total=Object.values(cmap).reduce((s,v)=>s+v,0)||1;
    if(!Object.keys(cmap).length) {
      canalEl.innerHTML=`<div style="font-size:12px;color:var(--ink3);">Sin ventas registradas aún.</div>`;
    } else {
      canalEl.innerHTML=Object.entries(cmap).sort((a,b)=>b[1]-a[1]).map(([canal,v])=>{
        const pct=Math.round(v/total*100), col=cols[canal]||P.teal;
        return `<div style="margin-bottom:14px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="font-size:13px;font-weight:500;">${canal}</span>
            <span style="font-size:12px;font-family:var(--fm);color:var(--ink3);">${fM(v)} · ${pct}%</span>
          </div>
          <div class="pbar" style="height:8px;"><div class="pbar-fill" style="width:${pct}%;background:${col};"></div></div>
        </div>`;
      }).join('');
    }
  }

  const tpEl = document.getElementById('ov-top-prods');
  if(tpEl) {
    const sorted=[...DB.products].sort((a,b)=>b.precio*b.vendidos-a.precio*a.vendidos).slice(0,5);
    if(!sorted.length) {
      tpEl.innerHTML=`<div class="empty-s" style="padding:24px;"><i class="fa-solid fa-box"></i><p>Sin productos aún.</p></div>`;
    } else {
      const maxRev=sorted[0].precio*sorted[0].vendidos||1;
      const cc=[P.b500,P.green,P.amber,P.teal,'#8B5CF6'];
      tpEl.innerHTML=sorted.map((p,i)=>{
        const rev=p.precio*p.vendidos, pct=Math.round(rev/maxRev*100);
        return `<div class="ri" style="flex-direction:column;align-items:stretch;gap:4px;padding:12px 20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:11px;font-weight:700;color:${cc[i]};min-width:16px;">#${i+1}</span>
              <span style="font-size:13px;font-weight:500;">${p.nombre}</span>
            </div>
            <span style="font-family:var(--fm);font-size:12px;color:var(--ink3);">${fM(rev)}</span>
          </div>
          <div class="pbar" style="height:4px;margin-left:24px;"><div class="pbar-fill" style="width:${pct}%;background:${cc[i]};"></div></div>
        </div>`;
      }).join('');
    }
  }

  const alEl = document.getElementById('ov-alertas');
  if(alEl) {
    const disp=DB.alertas.filter(a=>a.activa&&a.disparo);
    const inact=DB.alertas.filter(a=>a.activa&&!a.disparo);
    if(!DB.alertas.length) {
      alEl.innerHTML=`<div class="empty-s" style="padding:24px;"><i class="fa-solid fa-bell-slash"></i><p>Sin alertas configuradas.</p></div>`;
    } else if(!disp.length) {
      alEl.innerHTML=`<div style="padding:20px;text-align:center;"><div style="width:44px;height:44px;border-radius:50%;background:var(--gbg);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;"><i class="fa-solid fa-check" style="color:var(--green);font-size:18px;"></i></div><div style="font-size:13px;font-weight:500;color:var(--ink);">Todo en orden</div><div style="font-size:12px;color:var(--ink3);margin-top:3px;">${inact.length} alerta${inact.length!==1?'s':''} activa${inact.length!==1?'s':''}, ninguna disparada</div></div>`;
    } else {
      const sc={r:P.red,a:P.amber,g:P.green,b:P.b500};
      alEl.innerHTML=disp.slice(0,4).map(a=>`
        <div class="ri" style="gap:10px;">
          <div style="width:8px;height:8px;border-radius:50%;background:${sc[a.sev]||P.red};flex-shrink:0;margin-top:4px;"></div>
          <div style="flex:1;"><div style="font-size:13px;font-weight:500;">${a.metric}</div><div style="font-size:11px;color:var(--ink3);">${a.cond} ${a.val}</div></div>
          <span class="badge br" style="font-size:10px;">Activa</span>
        </div>`).join('');
    }
  }

  renderGoals();
}

function renderGoals() {
  const m=compute();
  const colMap={b:P.b500,g:P.green,a:P.amber,r:P.red};
  const currMap={ingresos:m.ingresos,clientes:m.totalClientes,churn:m.churnRate,ticket:m.ticket};
  const el=document.getElementById('goals-list');
  if(!el) return;
  if(!DB.goals.length) {
    el.innerHTML=`<div class="empty-s" style="padding:28px;"><i class="fa-solid fa-bullseye"></i><p>Sin metas configuradas.<br><button class="btn btn-g btn-sm" style="margin-top:8px;" onclick="openM('meta')">Crear primera meta</button></p></div>`;
    return;
  }
  el.innerHTML=DB.goals.map(g=>{
    const curr=currMap[g.link]||0;
    const raw=g.invertido?Math.max(0,100-Math.round((curr/g.goal)*100)):Math.min(100,Math.round(curr/g.goal*100));
    const pct=Math.max(0,raw);
    const col=colMap[g.col]||P.b500;
    const display=curr>1000?fM(curr):String(curr);
    const goalDisplay=g.goal>1000?fM(g.goal):String(g.goal);
    const statusCol=pct>=100?P.green:pct>=70?P.b500:P.amber;
    return `<div class="ri" style="flex-direction:column;align-items:stretch;gap:6px;padding:14px 20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;font-weight:500;">${g.desc}</span>
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-family:var(--fm);font-size:12px;color:var(--ink3);">${display}<span style="color:var(--ink4);"> / ${goalDisplay}</span></span>
          <span style="font-size:11px;font-weight:700;color:${statusCol};">${pct}%</span>
        </div>
      </div>
      <div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:${col};"></div></div>
    </div>`;
  }).join('');
}

// ── VENTAS ────────────────────────────────────────────────
function renderVentas() {
  const m=compute();
  const lbl=document.getElementById('tx-count-lbl');
  if(lbl) lbl.textContent=`· ${DB.transactions.length} registros`;

  const pagadas=DB.transactions.filter(t=>t.est==='Pagado');
  const pendientes=DB.transactions.filter(t=>t.est==='Pendiente');
  const kpisEl=document.getElementById('vt-kpis');
  if(kpisEl) kpisEl.innerHTML=[
    {label:'Ingresos totales', value:fM(m.ingresos), delta:`${pagadas.length} transacciones cobradas`, dir:m.ingresos>0?'up':'neu', icon:'fa-dollar-sign', col:P.b500},
    {label:'Transacciones', value:String(DB.transactions.length), delta:`${pendientes.length} pendientes · ${DB.transactions.filter(t=>t.est==='Vencido').length} vencidas`, dir:'up', icon:'fa-cart-shopping', col:P.green},
    {label:'Ticket promedio', value:fM(m.ticket), delta:`Sobre ${pagadas.length} tx cobradas`, dir:m.ticket>0?'up':'neu', icon:'fa-receipt', col:P.amber},
    {label:'Margen promedio', value:m.avgMargen+'%', delta:`${DB.products.length} productos`, dir:m.avgMargen>=75?'up':'dn', icon:'fa-percent', col:m.avgMargen>=75?P.teal:P.amber},
  ].map(kpiHtml).join('');

  const vtCanalEl=document.getElementById('vt-canales');
  if(vtCanalEl) {
    const cmap={};
    pagadas.forEach(t=>{cmap[t.canal]=(cmap[t.canal]||0)+t.monto;});
    const totalC=Object.values(cmap).reduce((s,v)=>s+v,0)||1;
    const cols={Digital:P.b500,Presencial:P.green,Partner:P.amber};
    if(!Object.keys(cmap).length) {
      vtCanalEl.innerHTML=`<p style="font-size:12px;color:var(--ink3);">Sin ventas cobradas aún.</p>`;
    } else {
      vtCanalEl.innerHTML=Object.entries(cmap).sort((a,b)=>b[1]-a[1]).map(([canal,v])=>{
        const pct=Math.round(v/totalC*100), col=cols[canal]||P.teal, count=pagadas.filter(t=>t.canal===canal).length;
        return `<div style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
            <div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:50%;background:${col};"></div><span style="font-size:13px;font-weight:500;">${canal}</span><span style="font-size:11px;color:var(--ink4);">${count} tx</span></div>
            <div><span style="font-family:var(--fm);font-size:13px;font-weight:600;">${fM(v)}</span><span style="font-size:11px;color:var(--ink4);margin-left:5px;">${pct}%</span></div>
          </div>
          <div class="pbar" style="height:9px;"><div class="pbar-fill" style="width:${pct}%;background:${col};"></div></div>
        </div>`;
      }).join('');
    }
  }

  const vtEstEl=document.getElementById('vt-estados');
  if(vtEstEl) {
    const emap={Pagado:0,Pendiente:0,Vencido:0};
    DB.transactions.forEach(t=>{emap[t.est]=(emap[t.est]||0)+1;});
    const totalE=DB.transactions.length||1;
    const ecols={Pagado:P.green,Pendiente:P.amber,Vencido:P.red};
    const sb={Pagado:'bg',Pendiente:'ba',Vencido:'br'};
    if(!DB.transactions.length) {
      vtEstEl.innerHTML=`<p style="font-size:12px;color:var(--ink3);">Sin transacciones registradas.</p>`;
    } else {
      vtEstEl.innerHTML=Object.entries(emap).map(([est,cnt])=>{
        const pct=Math.round(cnt/totalE*100), monto=DB.transactions.filter(t=>t.est===est).reduce((s,t)=>s+t.monto,0);
        return `<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);">
          <span class="badge ${sb[est]||'bn'}" style="min-width:68px;justify-content:center;">${est}</span>
          <div style="flex:1;"><div class="pbar" style="height:7px;"><div class="pbar-fill" style="width:${pct}%;background:${ecols[est]||P.b500};"></div></div></div>
          <div style="text-align:right;min-width:90px;"><div style="font-family:var(--fm);font-size:12px;font-weight:600;">${fM(monto)}</div><div style="font-size:11px;color:var(--ink4);">${cnt} tx · ${pct}%</div></div>
        </div>`;
      }).join('')+`<div style="padding-top:12px;font-size:12px;color:var(--ink3);">Total: <strong style="color:var(--ink);">${fM(DB.transactions.reduce((s,t)=>s+t.monto,0))}</strong> en ${DB.transactions.length} transacciones</div>`;
    }
  }

  const vtTickEl=document.getElementById('vt-ticket-prod');
  if(vtTickEl) {
    const prodRev={}, prodCnt={};
    pagadas.forEach(t=>{if(t.prodId){prodRev[t.prodId]=(prodRev[t.prodId]||0)+t.monto;prodCnt[t.prodId]=(prodCnt[t.prodId]||0)+1;}});
    const prodsConTx=DB.products.filter(p=>prodRev[p.id]);
    if(!prodsConTx.length) {
      const maxP=Math.max(...DB.products.map(p=>p.precio),1);
      vtTickEl.innerHTML=DB.products.slice(0,6).map(p=>{
        const pct=Math.round(p.precio/maxP*100);
        return `<div class="ri" style="flex-direction:column;align-items:stretch;gap:4px;padding:11px 20px;">
          <div style="display:flex;justify-content:space-between;"><span style="font-size:13px;font-weight:500;">${p.nombre}</span><span style="font-family:var(--fm);font-size:12px;color:var(--ink3);">${fM(p.precio)}</span></div>
          <div class="pbar" style="height:5px;"><div class="pbar-fill" style="width:${pct}%;background:var(--b500);"></div></div>
        </div>`;
      }).join('')+`<div style="padding:10px 20px;font-size:11px;color:var(--ink4);">Precio de lista · sin transacciones aún</div>`;
    } else {
      const maxT=Math.max(...prodsConTx.map(p=>prodRev[p.id]/prodCnt[p.id]),1);
      vtTickEl.innerHTML=prodsConTx.map(p=>{
        const avg=Math.round(prodRev[p.id]/prodCnt[p.id]), pct=Math.round(avg/maxT*100);
        return `<div class="ri" style="flex-direction:column;align-items:stretch;gap:4px;padding:11px 20px;">
          <div style="display:flex;justify-content:space-between;"><span style="font-size:13px;font-weight:500;">${p.nombre}</span><span style="font-family:var(--fm);font-size:12px;font-weight:600;">${fM(avg)}</span></div>
          <div class="pbar" style="height:5px;"><div class="pbar-fill" style="width:${pct}%;background:var(--b500);"></div></div>
          <span style="font-size:11px;color:var(--ink4);">${prodCnt[p.id]} venta${prodCnt[p.id]!==1?'s':''}</span>
        </div>`;
      }).join('');
    }
  }

  const sb={Pagado:'bg',Pendiente:'ba',Vencido:'br'}, cb={Digital:'bb',Presencial:'bn',Partner:'bt'};
  const txBodyEl=document.getElementById('tx-body');
  if(txBodyEl) {
    txBodyEl.innerHTML=!DB.transactions.length
      ?`<tr><td colspan="6" style="text-align:center;padding:28px;color:var(--ink3);">Sin transacciones. <button class="btn btn-p btn-sm" onclick="openM('tx')" style="margin-left:8px;">Agregar</button></td></tr>`
      :DB.transactions.slice().reverse().map(t=>`<tr>
          <td><strong>${t.cli}</strong></td>
          <td style="font-family:var(--fm);">${fM(t.monto)}</td>
          <td><span class="badge ${cb[t.canal]||'bn'}">${t.canal}</span></td>
          <td><span class="badge ${sb[t.est]||'bn'}">${t.est}</span></td>
          <td style="color:var(--ink3);font-size:12px;">${t.fecha.slice(5)}</td>
          <td><button style="border:none;background:none;cursor:pointer;color:var(--red);font-size:11px;" onclick="deleteTx(${t.id})"><i class="fa-solid fa-trash"></i></button></td>
        </tr>`).join('');
  }
}
function deleteTx(id) { DB.transactions=DB.transactions.filter(t=>t.id!==id); checkAlerts(); showToast('Transacción eliminada','e'); renderVentas(); refreshCurrentKpis(); }

// ── CLIENTES ─────────────────────────────────────────────
function renderClientes() {
  const m=compute();
  const lbl=document.getElementById('cl-count-lbl');
  if(lbl) lbl.textContent=`· ${DB.clients.length} registros`;

  const kpisEl=document.getElementById('cl-kpis');
  if(kpisEl) kpisEl.innerHTML=[
    {label:'Total clientes',value:String(m.totalClientes),delta:`${m.clientesActivos} activos`,dir:'up',icon:'fa-users',col:P.b500,sparkId:'cs1'},
    {label:'Clientes activos',value:String(m.clientesActivos),delta:`${Math.round(m.clientesActivos/m.totalClientes*100)}% del total`,dir:'up',icon:'fa-user-check',col:P.green,sparkId:'cs2'},
    {label:'En riesgo',value:String(m.enRiesgo),delta:`Churn: ${m.churnRate}%`,dir:m.enRiesgo>2?'dn':'up',icon:'fa-triangle-exclamation',col:m.enRiesgo>2?P.red:P.amber,sparkId:'cs3'},
    {label:'LTV promedio',value:fM(Math.round(DB.clients.reduce((s,c)=>s+c.ltv,0)/m.totalClientes||0)),delta:'Por cliente',dir:'up',icon:'fa-trophy',col:P.teal},
  ].map(kpiHtml).join('');

  // Sparks (SVG inline, sin canvas)
  if(document.getElementById('cs1')) mkSpark('cs1',[...Array(10).fill(m.totalClientes-2)].concat([m.totalClientes]),P.b500);
  if(document.getElementById('cs2')) mkSpark('cs2',[...Array(10).fill(m.clientesActivos-1)].concat([m.clientesActivos]),P.green);
  if(document.getElementById('cs3')) mkSpark('cs3',[...Array(10).fill(m.enRiesgo+1)].concat([m.enRiesgo]),P.red);

  // Segmentación donut (CSS)
  const segs={};
  DB.clients.forEach(c=>{segs[c.seg]=(segs[c.seg]||0)+1;});
  mkDonut('seg-donut',Object.entries(segs).map(([l,v])=>({l,v})));

  // ── RETENCIÓN MENSUAL CSS puro ──
  const retEl=document.getElementById('cl-ret-css');
  const retSubEl=document.getElementById('ret-sub');
  if(retEl) {
    const total=m.totalClientes||1;
    const retPct=Math.round(m.clientesActivos/total*100);
    const churnPct=Math.round(m.enRiesgo/total*100);
    const inactivoPct=Math.max(0, 100-retPct-churnPct);

    // Historial 12 meses: mes actual = dato real, anteriores = simulados
    const baseRet=Math.max(70, retPct-5);
    const history=MO.map((mes,i)=>{
      if(i===today.getMonth()) return retPct;
      const noise=(Math.sin(i*1.3)*3)|0;
      return Math.min(100, Math.max(60, baseRet+noise+(i<today.getMonth()?0:-3)));
    });
    const avgRet=Math.round(history.reduce((s,v)=>s+v,0)/history.length);
    if(retSubEl) retSubEl.textContent=`Promedio anual: ${avgRet}%`;

    // Tendencia vs mes anterior
    const prevMonth=(today.getMonth()-1+12)%12;
    const trend=retPct-history[prevMonth];
    const trendStr=trend>=0?`▲ +${trend}pp vs mes anterior`:`▼ ${trend}pp vs mes anterior`;
    const trendCol=trend>=0?'var(--green)':'var(--red)';

    // Colores barras mensuales
    const maxH=Math.max(...history,1);
    const barColors=history.map((v,i)=>
      i===today.getMonth()?P.b500:
      v>=90?P.green:v>=75?P.b300:P.amber
    );

    retEl.innerHTML=`
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:18px;">
        <div>
          <div style="font-family:var(--fb);font-size:36px;font-weight:700;color:var(--ink);line-height:1;">${retPct}%</div>
          <div style="font-size:12px;font-weight:600;color:${trendCol};margin-top:4px;">${trendStr}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:12px;color:var(--ink3);margin-bottom:4px;">Clientes activos</div>
          <div style="font-family:var(--fm);font-size:18px;font-weight:700;color:var(--ink);">${m.clientesActivos} / ${total}</div>
        </div>
      </div>

      <div style="margin-bottom:18px;">
        <div style="display:flex;border-radius:8px;overflow:hidden;height:12px;gap:2px;">
          <div style="flex:${retPct};background:var(--b500);transition:flex .4s;" title="Activos ${retPct}%"></div>
          <div style="flex:${churnPct};background:var(--red);transition:flex .4s;" title="En riesgo ${churnPct}%"></div>
          ${inactivoPct>0?`<div style="flex:${inactivoPct};background:var(--border2);transition:flex .4s;" title="Inactivos ${inactivoPct}%"></div>`:''}
        </div>
        <div style="display:flex;gap:14px;margin-top:8px;flex-wrap:wrap;">
          <span style="font-size:11px;color:var(--ink3);display:flex;align-items:center;gap:5px;"><span style="width:8px;height:8px;border-radius:50%;background:var(--b500);display:inline-block;"></span>Activos ${retPct}%</span>
          <span style="font-size:11px;color:var(--ink3);display:flex;align-items:center;gap:5px;"><span style="width:8px;height:8px;border-radius:50%;background:var(--red);display:inline-block;"></span>En riesgo ${churnPct}%</span>
          ${inactivoPct>0?`<span style="font-size:11px;color:var(--ink3);display:flex;align-items:center;gap:5px;"><span style="width:8px;height:8px;border-radius:50%;background:var(--border2);display:inline-block;"></span>Inactivos ${inactivoPct}%</span>`:''}
        </div>
      </div>

      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--ink4);margin-bottom:8px;">Evolución anual</div>
      <div style="display:flex;align-items:flex-end;gap:4px;height:56px;margin-bottom:5px;">
        ${history.map((v,i)=>{
          const h=Math.round(v/maxH*100);
          const isNow=i===today.getMonth();
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:0;position:relative;" title="${MO[i]}: ${v}%">
            ${isNow?`<div style="font-size:8px;font-weight:700;color:${barColors[i]};margin-bottom:2px;">${v}%</div>`:''}
            <div style="width:100%;height:${Math.max(6,h)}%;background:${barColors[i]};border-radius:3px 3px 0 0;${isNow?'outline:2px solid '+P.b500+';outline-offset:1px;':''}transition:height .4s;"></div>
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:4px;">
        ${MO.map((mn,i)=>`<div style="flex:1;text-align:center;font-size:8px;color:${i===today.getMonth()?P.b500:'var(--ink4)'};font-weight:${i===today.getMonth()?700:400};">${mn.slice(0,1)}</div>`).join('')}
      </div>`;
  }

  const eb={Activo:'bg','En riesgo':'br',Inactivo:'bn'};
  const segB={Enterprise:'bb','Mid-market':'bt',SMB:'bn'};
  const clBody=document.getElementById('cl-body');
  if(clBody) clBody.innerHTML=DB.clients.map(c=>`<tr>
    <td><strong>${c.nombre}</strong></td>
    <td><span class="badge ${segB[c.seg]||'bn'}">${c.seg}</span></td>
    <td style="font-family:var(--fm);">${fM(c.ltv)}</td>
    <td style="color:var(--ink3);font-size:12px;">${c.contacto}</td>
    <td><span class="badge ${eb[c.est]||'bn'}">${c.est}</span></td>
    <td><div style="display:flex;align-items:center;gap:6px;"><div class="pbar" style="width:54px;"><div class="pbar-fill" style="width:${c.churn}%;background:${c.churn>=60?P.red:c.churn>=30?P.amber:P.green};"></div></div><span style="font-size:11px;font-family:var(--fm);color:var(--ink3);">${c.churn}%</span></div></td>
    <td><button style="border:none;background:none;cursor:pointer;color:var(--red);font-size:11px;" onclick="deleteCl(${c.id})"><i class="fa-solid fa-trash"></i></button></td>
  </tr>`).join('');
}
function deleteCl(id) { DB.clients=DB.clients.filter(c=>c.id!==id); checkAlerts(); showToast('Cliente eliminado','e'); renderClientes(); refreshCurrentKpis(); }

// ── PRODUCTOS ─────────────────────────────────────────────
function renderProductos() {
  const m=compute();
  const lbl=document.getElementById('pr-count-lbl');
  if(lbl) lbl.textContent=`· ${DB.products.length} productos`;

  const top=DB.products.length?DB.products.reduce((a,b)=>b.precio*b.vendidos>a.precio*a.vendidos?b:a):{nombre:'—',precio:0,vendidos:0};
  const kpisEl=document.getElementById('pr-kpis');
  if(kpisEl) kpisEl.innerHTML=[
    {label:'Ingresos por productos',value:fM(m.totalRevProd),delta:`${DB.products.length} productos`,dir:m.totalRevProd>0?'up':'neu',icon:'fa-box',col:P.b500},
    {label:'Top producto',value:top.nombre.replace('Kubo',''),delta:fM(top.precio*top.vendidos),dir:'up',icon:'fa-star',col:P.amber},
    {label:'Unidades vendidas',value:fN(m.totalUnits),delta:'Total acumulado',dir:'up',icon:'fa-boxes-stacked',col:P.green},
    {label:'Margen promedio',value:m.avgMargen+'%',delta:'Objetivo: 75%',dir:m.avgMargen>=75?'up':'dn',icon:'fa-percent',col:m.avgMargen>=75?P.teal:P.amber},
  ].map(kpiHtml).join('');

  const prRevEl=document.getElementById('pr-rev-bars');
  if(prRevEl) {
    const sorted=[...DB.products].sort((a,b)=>b.precio*b.vendidos-a.precio*a.vendidos);
    const maxRev=sorted.length?sorted[0].precio*sorted[0].vendidos:1;
    const barCols=[P.b500,P.green,P.amber,P.teal,'#38BDF8',P.red,'#8B5CF6','#EC4899'];
    const sub=document.getElementById('pr-rev-sub');
    if(sub) sub.textContent=`Total: ${fM(m.totalRevProd)}`;
    prRevEl.innerHTML=!sorted.length
      ?`<div class="empty-s" style="padding:28px;"><i class="fa-solid fa-box"></i><p>Sin productos aún.</p></div>`
      :sorted.map((p,i)=>{
        const rev=p.precio*p.vendidos, pct=maxRev>0?Math.round(rev/maxRev*100):0, col=barCols[i%barCols.length];
        return `<div class="ri" style="flex-direction:column;align-items:stretch;gap:5px;padding:12px 20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:8px;"><div style="width:10px;height:10px;border-radius:3px;background:${col};flex-shrink:0;"></div><span style="font-size:13px;font-weight:500;">${p.nombre}</span></div>
            <div><span style="font-family:var(--fm);font-size:13px;font-weight:600;">${fM(rev)}</span><span style="font-size:11px;color:var(--ink4);margin-left:5px;">${fN(p.vendidos)} uds</span></div>
          </div>
          <div class="pbar" style="height:8px;"><div class="pbar-fill" style="width:${pct}%;background:${col};"></div></div>
        </div>`;
      }).join('');
  }

  const marginEl=document.getElementById('margin-list');
  if(marginEl) marginEl.innerHTML=!DB.products.length
    ?`<div class="empty-s" style="padding:28px;"><i class="fa-solid fa-percent"></i><p>Sin productos.</p></div>`
    :[...DB.products].sort((a,b)=>b.margen-a.margen).map(p=>`
      <div class="ri">
        <div style="flex:1;"><div style="font-size:12px;font-weight:500;margin-bottom:5px;">${p.nombre}</div>
          <div class="pbar" style="height:6px;"><div class="pbar-fill" style="width:${p.margen}%;background:${p.margen>=75?P.green:p.margen>=60?P.amber:P.red};"></div></div>
        </div>
        <span style="font-family:var(--fm);font-size:13px;font-weight:600;color:${p.margen>=75?P.green:p.margen>=60?P.amber:P.red};margin-left:12px;min-width:36px;text-align:right;">${p.margen}%</span>
      </div>`).join('');

  const prBody=document.getElementById('pr-body');
  if(prBody) prBody.innerHTML=!DB.products.length
    ?`<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--ink3);">Sin productos. <button class="btn btn-p btn-sm" onclick="openM('producto')" style="margin-left:8px;">Agregar</button></td></tr>`
    :DB.products.map(p=>{
      const rev=p.precio*p.vendidos;
      return `<tr>
        <td><strong>${p.nombre}</strong></td>
        <td><span class="badge ${p.cat==='SaaS'?'bb':'bn'}">${p.cat}</span></td>
        <td style="font-family:var(--fm);">${fM(p.precio)}</td>
        <td>${fN(p.vendidos)}</td>
        <td style="font-family:var(--fm);font-weight:600;">${fM(rev)}</td>
        <td><span style="font-weight:700;color:${p.margen>=75?P.green:p.margen>=60?P.amber:P.red};">${p.margen}%</span></td>
        <td><button style="border:none;background:none;cursor:pointer;color:var(--red);font-size:11px;" onclick="deletePr(${p.id})"><i class="fa-solid fa-trash"></i></button></td>
      </tr>`;
    }).join('');
}
function deletePr(id) { DB.products=DB.products.filter(p=>p.id!==id); checkAlerts(); showToast('Producto eliminado','e'); renderProductos(); refreshCurrentKpis(); }

// ── OPERACIONES ───────────────────────────────────────────
function renderOperaciones() {
  const m=compute();
  const criticos=DB.tickets.filter(t=>t.p==='Crítica'&&t.e!=='Resuelto').length;
  const uptime=Math.max(95, 99.9-criticos*0.4-m.ticketsAbiertos*0.05);
  const respTime=(1.2+m.ticketsAbiertos*0.08+criticos*0.3).toFixed(1);
  const csat=Math.max(3.5, 4.8-criticos*0.2-m.ticketsAbiertos*0.04).toFixed(1);

  const kpisEl=document.getElementById('op-kpis');
  if(kpisEl) kpisEl.innerHTML=[
    {label:'Uptime sistema',   value:uptime.toFixed(1)+'%', delta:criticos>0?`${criticos} incidente${criticos>1?'s':''} crítico${criticos>1?'s':''}`:'SLA cumplido', dir:uptime>=99?'up':uptime>=97?'neu':'dn', icon:'fa-server',          col:uptime>=99?P.green:uptime>=97?P.amber:P.red},
    {label:'Tiempo respuesta', value:respTime+'s',           delta:m.ticketsAbiertos>0?`${m.ticketsAbiertos} tickets abiertos`:'-0.2s vs ayer',                    dir:respTime<=1.5?'up':respTime<=2.5?'neu':'dn', icon:'fa-clock',  col:respTime<=1.5?P.b500:respTime<=2.5?P.amber:P.red},
    {label:'Tickets abiertos', value:String(m.ticketsAbiertos), delta:`${DB.tickets.length} totales · ${DB.tickets.filter(t=>t.e==='Resuelto').length} resueltos`, dir:m.ticketsAbiertos>3?'dn':'up', icon:'fa-ticket', col:m.ticketsAbiertos>3?P.red:m.ticketsAbiertos>1?P.amber:P.green},
    {label:'CSAT soporte',     value:csat+'/5',              delta:criticos>0?'Bajó por incidentes':'+0.2 vs mes anterior',                                        dir:csat>=4.5?'up':csat>=4?'neu':'dn', icon:'fa-star-half-stroke', col:csat>=4.5?P.teal:csat>=4?P.amber:P.red},
  ].map(kpiHtml).join('');

  const respEl=document.getElementById('op-resp-bars');
  if(respEl) {
    const hours=['00h','03h','06h','09h','12h','15h','18h','21h'];
    const base=1.2+m.ticketsAbiertos*0.06+criticos*0.25;
    const vals=hours.map((_,i)=>{
      const peak=(i===3||i===4||i===5)?base*1.4:base;
      return Math.max(0.4, +(peak+(Math.random()*0.3-0.15)).toFixed(2));
    });
    const maxV=Math.max(...vals,1);
    respEl.innerHTML=`
      <div style="display:flex;align-items:flex-end;gap:6px;height:110px;margin-bottom:12px;">
        ${vals.map((v,i)=>{
          const pct=Math.round(v/maxV*100), col=v<=1.5?P.b500:v<=2.5?P.amber:P.red;
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="font-size:9px;color:var(--ink4);font-family:var(--fm);">${v}s</div>
            <div style="width:100%;background:${col};border-radius:4px 4px 0 0;height:${pct}%;min-height:4px;transition:height .4s ease;"></div>
          </div>`;
        }).join('')}
      </div>
      <div style="display:flex;gap:6px;">
        ${hours.map(h=>`<div style="flex:1;text-align:center;font-size:9px;color:var(--ink4);">${h}</div>`).join('')}
      </div>
      <div style="margin-top:14px;display:flex;gap:16px;flex-wrap:wrap;">
        <span style="font-size:12px;color:var(--ink3);">Promedio: <strong style="color:var(--ink);font-family:var(--fm);">${(vals.reduce((s,v)=>s+v,0)/vals.length).toFixed(2)}s</strong></span>
        <span style="font-size:12px;color:var(--ink3);">Pico: <strong style="color:var(--red);font-family:var(--fm);">${Math.max(...vals).toFixed(2)}s</strong></span>
        <span style="font-size:12px;color:var(--ink3);">Mínimo: <strong style="color:var(--green);font-family:var(--fm);">${Math.min(...vals).toFixed(2)}s</strong></span>
      </div>`;
  }

  const uptimeEl=document.getElementById('op-uptime');
  if(uptimeEl) {
    const days=Array.from({length:30},(_,i)=>{
      const daysAgo=29-i;
      const recentImpact=daysAgo<3?criticos*0.3+m.ticketsAbiertos*0.04:0;
      return +Math.max(94, Math.min(100, 99.9-recentImpact-(Math.random()*0.4))).toFixed(2);
    });
    const avgUp=(days.reduce((s,v)=>s+v,0)/days.length).toFixed(2);
    const minUp=Math.min(...days).toFixed(2);
    const incidents=days.filter(d=>d<99).length;
    const uptimeColor=uptime>=99?P.green:uptime>=97?P.amber:P.red;

    uptimeEl.innerHTML=`
      <div style="display:flex;flex-direction:column;align-items:center;padding:16px 0 8px;">
        <div style="position:relative;width:130px;height:130px;">
          <svg viewBox="0 0 130 130" width="130" height="130">
            <circle cx="65" cy="65" r="54" fill="none" stroke="var(--border)" stroke-width="12"/>
            <circle cx="65" cy="65" r="54" fill="none" stroke="${uptimeColor}" stroke-width="12"
              stroke-dasharray="${Math.round(2*Math.PI*54*uptime/100)} 339"
              stroke-dashoffset="85" stroke-linecap="round" transform="rotate(-90 65 65)"
              style="transition:stroke-dasharray .6s ease;"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-family:var(--fb);font-size:20px;font-weight:700;color:var(--ink);line-height:1;">${uptime.toFixed(1)}%</div>
            <div style="font-size:10px;color:var(--ink3);margin-top:2px;">Uptime</div>
          </div>
        </div>
      </div>
      <div style="padding:0 4px 8px;">
        <div style="font-size:11px;color:var(--ink4);margin-bottom:6px;">Últimos 30 días</div>
        <div style="display:flex;gap:2px;align-items:flex-end;height:28px;">
          ${days.map(d=>{
            const col=d>=99.5?P.green:d>=98?P.amber:P.red;
            return `<div style="flex:1;height:${Math.max(20,Math.round(((d-93)/7)*100))}%;background:${col};border-radius:2px;opacity:.85;" title="${d}%"></div>`;
          }).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:5px;">
          <span style="font-size:10px;color:var(--ink4);">30 días atrás</span>
          <span style="font-size:10px;color:var(--ink4);">Hoy</span>
        </div>
      </div>
      <div style="display:flex;gap:12px;padding:8px 4px 0;border-top:1px solid var(--border);flex-wrap:wrap;">
        <span style="font-size:12px;color:var(--ink3);">Promedio: <strong style="font-family:var(--fm);color:var(--ink);">${avgUp}%</strong></span>
        <span style="font-size:12px;color:var(--ink3);">Mínimo: <strong style="font-family:var(--fm);color:var(--amber);">${minUp}%</strong></span>
        <span style="font-size:12px;color:var(--ink3);">Incidentes: <strong style="font-family:var(--fm);color:${incidents>0?P.red:'var(--green)'};">${incidents}</strong></span>
      </div>`;
  }

  const pb={Alta:'ba',Crítica:'br',Media:'bb',Baja:'bn'};
  const eb2={Abierto:'ba','En curso':'bb',Resuelto:'bg'};
  const tkEl=document.getElementById('tickets-list');
  if(tkEl) tkEl.innerHTML=!DB.tickets.length
    ?`<div class="empty-s" style="padding:28px;"><i class="fa-solid fa-ticket"></i><p>Sin tickets. Todo en orden.</p></div>`
    :DB.tickets.map(t=>`<div class="ri" style="flex-direction:column;align-items:flex-start;gap:4px;">
        <div style="display:flex;align-items:center;gap:8px;width:100%;">
          <span style="font-size:13px;font-weight:500;flex:1;">${t.t}</span>
          <span class="badge ${pb[t.p]||'bn'}">${t.p}</span>
          <span class="badge ${eb2[t.e]||'bn'}">${t.e}</span>
          ${t.e!=='Resuelto'?`<button style="border:none;background:var(--gbg);color:var(--green);border-radius:5px;padding:3px 7px;cursor:pointer;font-size:11px;font-weight:600;" onclick="resolveTk(${t.id})"><i class="fa-solid fa-check"></i> Resolver</button>`:''}
        </div>
        <span style="font-size:11px;color:var(--ink4);">Hace ${t.age}</span>
      </div>`).join('');

  const teams=[
    {n:'Ventas',   c:82},
    {n:'Soporte',  c:Math.min(99,60+m.ticketsAbiertos*8+criticos*12)},
    {n:'Técnico',  c:Math.min(99,55+criticos*15+m.ticketsAbiertos*3)},
    {n:'Producto', c:58},
  ];
  const capEl=document.getElementById('capacity-list');
  if(capEl) capEl.innerHTML=teams.map(t=>`<div class="ri">
    <div style="flex:1;">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
        <span style="font-size:13px;font-weight:500;">${t.n}</span>
        <span style="font-size:12px;font-family:var(--fm);color:${t.c>90?P.red:t.c>75?P.amber:'var(--ink3)'};">${t.c}%</span>
      </div>
      <div class="pbar"><div class="pbar-fill" style="width:${t.c}%;background:${t.c>90?P.red:t.c>75?P.amber:P.b500};transition:width .4s;"></div></div>
    </div>
  </div>`).join('');
}
function resolveTk(id) { const tk=DB.tickets.find(t=>t.id===id); if(!tk)return; tk.e='Resuelto'; checkAlerts(); showToast('Ticket resuelto','s'); renderOperaciones(); refreshCurrentKpis(); }

// ── ALERTAS ───────────────────────────────────────────────
function renderAlertas() {
  checkAlerts();
  const act=DB.alertas.filter(a=>a.activa&&a.disparo);
  const tabAc=document.getElementById('tab-ac');
  if(tabAc) tabAc.textContent=act.length;
  const list=alertTab==='activas'?DB.alertas.filter(a=>a.activa):alertTab==='resueltas'?DB.alertas.filter(a=>!a.activa):DB.alertas;
  const titleEl=document.getElementById('al-panel-title');
  if(titleEl) titleEl.textContent=alertTab==='activas'?'Alertas activas':alertTab==='resueltas'?'Resueltas':'Todas las reglas';
  const m=compute();
  const vals={'Ingresos totales':m.ingresos,'Ticket promedio':m.ticket,'Clientes en riesgo':m.enRiesgo,'Churn rate':m.churnRate,'Tickets abiertos':m.ticketsAbiertos};
  const alBody=document.getElementById('al-body');
  if(!alBody) return;
  if(!list.length) { alBody.innerHTML='<div class="empty-s"><i class="fa-solid fa-check-circle" style="color:var(--green);"></i><p>Sin alertas en esta categoría.</p></div>'; return; }
  const sc={r:P.red,a:P.amber,g:P.green,b:P.b500};
  alBody.innerHTML=list.map(a=>{
    const curr=vals[a.metric], disparada=a.disparo&&a.activa;
    const msg=disparada
      ?`⚠️ Valor actual: ${a.metric==='Ingresos totales'||a.metric==='Ticket promedio'?fM(curr):curr} — umbral: ${a.cond==='Menor a'?'<':'>'}${a.val}`
      :`Valor actual: ${curr!==undefined?(a.metric==='Ingresos totales'||a.metric==='Ticket promedio'?fM(curr):curr):'—'}. Umbral: ${a.cond} ${a.val}`;
    return `<div class="al-item">
      <div class="al-dot" style="background:${disparada?P.red:sc[a.sev]||P.b500}"></div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;">${a.metric} · <span style="font-weight:400;">${a.cond} ${a.val}</span> ${disparada?'<span class="badge br" style="margin-left:4px;">DISPARADA</span>':''}</div>
        <div style="font-size:12px;color:var(--ink3);margin-top:2px;">${msg}</div>
        <div style="margin-top:5px;">
          <button class="al-btn" onclick="toggleAl(${a.id})">${a.activa?'Desactivar':'Activar'}</button>
          <button class="al-btn del" onclick="deleteAl(${a.id})">Eliminar</button>
        </div>
      </div>
      <span class="badge ${a.activa?(disparada?'br':'bg'):'bn'}">${a.activa?(disparada?'Disparada':'Activa'):'Inactiva'}</span>
    </div>`;
  }).join('');
}
function toggleAl(id) { const a=DB.alertas.find(x=>x.id===id); if(!a)return; a.activa=!a.activa; showToast(a.activa?'Alerta activada':'Alerta desactivada',a.activa?'s':'e'); renderAlertas(); }
function deleteAl(id) { DB.alertas=DB.alertas.filter(a=>a.id!==id); showToast('Alerta eliminada','s'); renderAlertas(); }
function saveAl() {
  const val=parseFloat(document.getElementById('al-v')?.value);
  if(!val){showToast('Ingresá un umbral','e');return;}
  DB.alertas.push({id:DB.nextId++,metric:document.getElementById('al-m').value,cond:document.getElementById('al-c').value,val,chan:document.getElementById('al-ch').value,activa:true,sev:'a',disparo:false});
  showToast('Alerta creada','s'); closeM('alerta'); checkAlerts(); renderAlertas();
}

// ── REPORTES ──────────────────────────────────────────────
function renderReportes() {
  const m=compute();
  document.getElementById('rep-out').innerHTML=`<div class="panel">
    <div style="background:linear-gradient(135deg,var(--b900),var(--b600));border-radius:10px;padding:20px 24px;margin:0 0 18px;">
      <div style="font-family:var(--fb);font-size:18px;font-weight:600;color:#fff;">Resumen ejecutivo</div>
      <div style="font-size:13px;color:var(--b200);margin-top:3px;">KuboSoft · ${MO[today.getMonth()]} ${today.getFullYear()} · Generado en tiempo real</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 24px 20px;">
      ${[['Ingresos',fM(m.ingresos),'up'],['Clientes',String(m.totalClientes),'up'],['Churn',m.churnRate+'%',m.churnRate>5?'dn':'up'],['Ticket',fM(m.ticket),'up']].map(([l,v,d])=>`<div style="background:var(--b25);border:1px solid var(--border);border-radius:10px;padding:14px 16px;"><div style="font-size:11px;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;font-weight:600;">${l}</div><div style="font-family:var(--fb);font-size:18px;font-weight:700;margin:4px 0;" class="${d}">${v}</div></div>`).join('')}
    </div>
    <div style="padding:0 24px 24px;font-size:13.5px;color:var(--ink);line-height:1.75;">
      <p style="margin-bottom:10px;">El período registra <strong>${fM(m.ingresos)}</strong> en ingresos con <strong>${m.txCount}</strong> transacciones y un ticket promedio de <strong>${fM(m.ticket)}</strong>. La base de clientes asciende a <strong>${m.totalClientes}</strong>, con <strong>${m.enRiesgo}</strong> en riesgo de abandono (churn: ${m.churnRate}%).</p>
      <p style="margin-bottom:10px;">Los productos suman <strong>${fN(m.totalUnits)}</strong> unidades vendidas con un margen promedio de <strong>${m.avgMargen}%</strong>. Hay <strong>${m.ticketsAbiertos}</strong> tickets de soporte abiertos y <strong>${DB.alertas.filter(a=>a.activa&&a.disparo).length}</strong> alertas disparadas.</p>
      <p>Top producto: <strong>${DB.products.length?[...DB.products].sort((a,b)=>b.precio*b.vendidos-a.precio*a.vendidos)[0].nombre:'—'}</strong>. ${m.enRiesgo>2?`Se recomienda campaña de retención urgente (${m.enRiesgo} clientes en riesgo).`:m.churnRate<=3?'Churn bajo control — buen momento para campaña de expansión.':''}</p>
    </div>
  </div>`;
}
function genReport() { showToast('Generando reporte con datos reales...','s'); setTimeout(renderReportes,600); }
function exportar() { showToast('Exportando datos actuales...','s'); }

// ── IA ────────────────────────────────────────────────────
function setQ(q) { const el=document.getElementById('ia-q'); if(el) el.value=q; }

function runIA() {
  const qEl=document.getElementById('ia-q'); if(!qEl) return;
  const q=qEl.value.trim(); if(!q) return;
  const m=compute();
  const chat=document.getElementById('ia-chat'); if(!chat) return;
  chat.innerHTML+=`<div class="ia-msg user">${q}</div>`;
  chat.innerHTML+=`<div class="ia-msg bot" id="ia-typing"><span style="color:var(--b400);">Analizando tus datos reales...</span></div>`;
  chat.scrollTop=chat.scrollHeight;
  setTimeout(()=>{
    const ql=q.toLowerCase();
    let ans=`Basándome en tus datos actuales: ${fM(m.ingresos)} en ingresos, ${m.totalClientes} clientes, churn del ${m.churnRate}%, ticket promedio ${fM(m.ticket)}. ¿Querés que profundice en algún área?`;
    if(ql.includes('churn')||ql.includes('riesgo')||ql.includes('abandono')) {
      const enR=DB.clients.filter(c=>c.est==='En riesgo');
      ans=`Tenés <strong>${enR.length} cliente${enR.length!==1?'s':''} en riesgo</strong>: ${enR.map(c=>`${c.nombre} (${c.churn}%)`).join(', ')}. Churn actual: <strong>${m.churnRate}%</strong>. ${m.churnRate>5?'Supera el umbral crítico del 5% — se recomienda acción inmediata.':'Dentro del rango aceptable.'}`;
    } else if(ql.includes('ingreso')||ql.includes('ventas')||ql.includes('revenue')) {
      const top=DB.transactions.slice().sort((a,b)=>b.monto-a.monto)[0];
      ans=`Ingresos actuales: <strong>${fM(m.ingresos)}</strong> en ${m.txCount} transacciones. Ticket promedio: ${fM(m.ticket)}. Mayor transacción: ${top?top.cli+' ('+fM(top.monto)+')':'—'}. Canal dominante: ${Object.entries(m.canales).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'}.`;
    } else if(ql.includes('product')||ql.includes('margen')) {
      const topP=DB.products.length?[...DB.products].sort((a,b)=>b.margen-a.margen)[0]:null;
      const topR=DB.products.length?[...DB.products].sort((a,b)=>b.precio*b.vendidos-a.precio*a.vendidos)[0]:null;
      ans=topP?`Mayor margen: <strong>${topP.nombre}</strong> (${topP.margen}%). Mayor ingreso: <strong>${topR?.nombre}</strong> (${fM((topR?.precio||0)*(topR?.vendidos||0))}). Margen promedio: ${m.avgMargen}%.`:'Sin productos registrados.';
    } else if(ql.includes('alerta')) {
      const disp=DB.alertas.filter(a=>a.activa&&a.disparo);
      ans=disp.length?`Tenés <strong>${disp.length} alerta${disp.length!==1?'s':''} disparada${disp.length!==1?'s':''}</strong>: ${disp.map(a=>a.metric).join(', ')}. Revisalas en la sección Alertas.`:'No hay alertas disparadas. Todo dentro de los umbrales.';
    } else if(ql.includes('ticket')||ql.includes('soporte')) {
      ans=`Hay <strong>${m.ticketsAbiertos} tickets abiertos</strong> de ${DB.tickets.length} totales. ${DB.tickets.filter(t=>t.p==='Crítica').length>0?`Atención: hay ${DB.tickets.filter(t=>t.p==='Crítica').length} ticket(s) crítico(s).`:'Sin tickets críticos pendientes.'}`;
    }
    const typing=document.getElementById('ia-typing');
    if(typing) typing.innerHTML=ans;
    qEl.value='';
    chat.scrollTop=chat.scrollHeight;
  },1100);
}

function renderIA() {
  const m=compute();
  const chatEl=document.getElementById('ia-chat');
  if(chatEl) chatEl.innerHTML=`<div class="ia-msg bot">Hola. Tengo acceso a tus datos en tiempo real: <strong>${fM(m.ingresos)}</strong> en ingresos, <strong>${m.totalClientes}</strong> clientes, churn <strong>${m.churnRate}%</strong>. Preguntame lo que quieras.</div>`;
  const ticketProx=Math.round(m.ticket*1.06);
  const predEl=document.getElementById('pred-list');
  if(predEl) predEl.innerHTML=[
    {t:'Ingresos próximo mes',r:`${fM(Math.round(m.ingresos*.95))} — ${fM(Math.round(m.ingresos*1.15))}`,c:82,dir:'up',col:P.b500,icon:'fa-dollar-sign'},
    {t:'Clientes potenciales',r:`${m.totalClientes+2} — ${m.totalClientes+6}`,c:74,dir:'up',col:P.green,icon:'fa-user-plus'},
    {t:'Churn proyectado',r:`${Math.max(0,(m.churnRate-.5)).toFixed(1)}% — ${(m.churnRate+1).toFixed(1)}%`,c:65,dir:m.churnRate>4?'dn':'up',col:m.churnRate>4?P.red:P.teal,icon:'fa-chart-line'},
    {t:'Ticket promedio Q+1',r:`${fM(Math.round(m.ticket*.95))} — ${fM(ticketProx)}`,c:78,dir:'up',col:P.amber,icon:'fa-receipt'},
  ].map(p=>`<div class="pred-item">
    <div class="pred-icon" style="background:${p.col}18;color:${p.col};"><i class="fa-solid ${p.icon}"></i></div>
    <div style="flex:1;"><div style="font-size:13px;font-weight:500;">${p.t}</div><div style="font-size:12px;color:var(--ink3);font-family:var(--fm);">${p.r}</div></div>
    <div style="text-align:right;"><div style="font-family:var(--fm);font-size:13px;font-weight:600;" class="${p.dir==='up'?'up':'dn'}">${p.c}%</div><div class="pred-bar"><div class="pred-bar-fill" style="width:${p.c}%;background:${p.col};"></div></div></div>
  </div>`).join('');
  const anom=[];
  if(m.enRiesgo>2) anom.push({t:`${m.enRiesgo} clientes en riesgo de churn`,s:'Requiere atención inmediata',col:P.red,icon:'fa-person-walking-arrow-right'});
  if(DB.tickets.filter(t=>t.p==='Crítica').length>0) anom.push({t:'Ticket crítico sin resolver',s:DB.tickets.find(t=>t.p==='Crítica')?.t||'',col:P.red,icon:'fa-triangle-exclamation'});
  if(m.avgMargen<70) anom.push({t:'Margen promedio por debajo del objetivo',s:`Actual: ${m.avgMargen}% — Objetivo: 75%`,col:P.amber,icon:'fa-arrow-trend-down'});
  if(m.ticketsAbiertos>3) anom.push({t:`${m.ticketsAbiertos} tickets abiertos`,s:'Por encima del umbral recomendado',col:P.amber,icon:'fa-ticket'});
  if(!anom.length) anom.push({t:'Sin anomalías detectadas',s:'Todas las métricas dentro del rango normal',col:P.green,icon:'fa-check-circle'});
  const anomEl=document.getElementById('anom-list');
  if(anomEl) anomEl.innerHTML=anom.map(a=>`<div class="ri" style="gap:11px;">
    <div style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;background:${a.col}18;color:${a.col};flex-shrink:0;"><i class="fa-solid ${a.icon}"></i></div>
    <div><div style="font-size:13px;font-weight:500;">${a.t}</div><div style="font-size:12px;color:var(--ink3);">${a.s}</div></div>
  </div>`).join('');
}

// ── CONFIG ────────────────────────────────────────────────
const cfgSecs=[{id:'empresa',icon:'fa-building',l:'Empresa'},{id:'notif',icon:'fa-bell',l:'Notificaciones'},{id:'metas',icon:'fa-bullseye',l:'Metas y objetivos'},{id:'alertas',icon:'fa-triangle-exclamation',l:'Reglas de alerta'},{id:'conexiones',icon:'fa-plug',l:'Conexiones'},{id:'seguridad',icon:'fa-lock',l:'Seguridad'}];

function renderConfig() {
  const menuEl=document.getElementById('cfg-menu');
  if(menuEl) menuEl.innerHTML=cfgSecs.map(s=>`<div class="cfg-mi ${cfgSection===s.id?'active':''}" onclick="setCfg('${s.id}')"><i class="fa-solid ${s.icon}" style="width:15px;text-align:center;font-size:12px;color:${cfgSection===s.id?'var(--b600)':'var(--ink4)'};"></i> ${s.l}</div>`).join('');
  const el=document.getElementById('cfg-content'); if(!el) return;
  if(cfgSection==='empresa') {
    el.innerHTML=`<div class="panel"><div class="ph"><div class="ptitle">Datos de la empresa</div><button class="btn btn-p btn-sm" onclick="showToast('Datos guardados','s')"><i class="fa-solid fa-check"></i> Guardar</button></div><div class="pbody">
      <div class="fg"><label class="fl">Razón social</label><input class="fi" value="KuboSoft S.A."></div>
      <div class="fg"><label class="fl">RUT</label><input class="fi" value="21.234.567-8"></div>
      <div class="fg"><label class="fl">Moneda</label><select class="fi"><option>UYU ($)</option><option>USD (US$)</option></select></div>
      <div class="fg"><label class="fl">Zona horaria</label><select class="fi"><option>America/Montevideo (UTC-3)</option></select></div>
    </div></div>`;
  } else if(cfgSection==='notif') {
    const togs=[['Alertas disparadas en tiempo real',true],['Reporte diario automático',true],['Resumen semanal por email',false],['Anomalías detectadas por IA',true]];
    el.innerHTML=`<div class="panel"><div class="ph"><div class="ptitle">Notificaciones</div></div>${togs.map(([l,on])=>`<div class="ri"><div style="flex:1;font-size:13px;">${l}</div><div class="tog" style="background:${on?'var(--b600)':'var(--border2)'};" onclick="this.style.background=this.style.background.includes('b600')?'var(--border2)':'var(--b600)';"><div class="tog-k" style="left:${on?21:3}px;"></div></div></div>`).join('')}</div>`;
  } else if(cfgSection==='metas') {
    const m=compute(), currMap={ingresos:m.ingresos,clientes:m.totalClientes,churn:m.churnRate,ticket:m.ticket}, colMap={b:P.b500,g:P.green,a:P.amber,r:P.red};
    el.innerHTML=`<div class="panel"><div class="ph"><div class="ptitle">Metas vinculadas a métricas reales</div><button class="btn btn-p btn-sm" onclick="openM('meta')"><i class="fa-solid fa-plus"></i> Agregar</button></div>
      ${DB.goals.map(g=>{
        const curr=currMap[g.link]||0, pct=g.invertido?Math.min(100,Math.round((1-(curr/g.goal))*100+50)):Math.min(100,Math.round(curr/g.goal*100));
        const col=colMap[g.col]||P.b500, display=curr>1000?fM(curr):curr+'', goalDisplay=g.goal>1000?fM(g.goal):g.goal+'';
        return `<div class="ri" style="flex-direction:column;align-items:stretch;gap:5px;padding:14px 20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;"><span style="font-size:13px;font-weight:500;">${g.desc}</span><div style="display:flex;align-items:center;gap:8px;"><span style="font-family:var(--fm);font-size:12px;color:var(--ink3);">${display} / ${goalDisplay}</span><button style="border:none;background:none;cursor:pointer;color:var(--red);font-size:11px;" onclick="deleteGoal(${g.id})"><i class="fa-solid fa-trash"></i></button></div></div>
          <div style="display:flex;align-items:center;gap:8px;"><div class="pbar" style="flex:1;"><div class="pbar-fill" style="width:${pct}%;background:${col};"></div></div><span style="font-size:11px;font-weight:600;color:${pct>=100?P.green:P.b500};">${pct}%</span></div>
        </div>`;
      }).join('')}</div>`;
  } else if(cfgSection==='alertas') {
    el.innerHTML=`<div class="panel"><div class="ph"><div class="ptitle">Reglas configuradas</div><button class="btn btn-p btn-sm" onclick="openM('alerta')"><i class="fa-solid fa-plus"></i> Agregar</button></div>
      ${DB.alertas.map(a=>`<div class="ri"><div style="flex:1;"><div style="font-size:13px;font-weight:500;">${a.metric} ${a.cond} ${a.val}</div><div style="font-size:11px;color:var(--ink3);">${a.chan} · ${a.activa?'Activa':'Inactiva'} ${a.disparo?'· <strong style="color:var(--red);">DISPARADA</strong>':''}</div></div>
        <span class="badge ${a.activa?'bg':'bn'}" style="margin-right:8px;">${a.activa?'On':'Off'}</span>
        <button style="border:none;background:none;cursor:pointer;color:var(--red);font-size:11px;" onclick="deleteAl(${a.id});renderConfig();"><i class="fa-solid fa-trash"></i></button>
      </div>`).join('')}</div>`;
  } else if(cfgSection==='conexiones') {
    el.innerHTML=`<div style="display:flex;flex-direction:column;gap:12px;">${[['Google Analytics','fa-google',true],['HubSpot CRM','fa-hubspot',true],['Stripe','fa-stripe',false],['Slack','fa-slack',false]].map(([n,ic,on])=>`<div class="panel"><div style="display:flex;align-items:center;gap:14px;padding:15px 20px;">
      <div style="width:36px;height:36px;border-radius:9px;background:var(--b25);display:flex;align-items:center;justify-content:center;"><i class="fa-brands ${ic}" style="font-size:17px;color:var(--b600);"></i></div>
      <div style="flex:1;"><div style="font-size:14px;font-weight:600;">${n}</div><div style="font-size:12px;color:var(--ink3);">${on?'Conectado':'Sin conectar'}</div></div>
      <button class="btn ${on?'btn-g':'btn-p'} btn-sm" onclick="showToast('${on?'Desconectado':'Conectado'}: ${n}','s')">${on?'Desconectar':'Conectar'}</button>
    </div></div>`).join('')}</div>`;
  } else if(cfgSection==='seguridad') {
    el.innerHTML=`<div class="panel">
      <div class="ri" style="padding:15px 20px;"><div style="flex:1;"><div style="font-size:13px;font-weight:500;">Autenticación en dos pasos</div><div style="font-size:12px;color:var(--ink3);">Mayor seguridad al iniciar sesión</div></div><button class="btn btn-g btn-sm" onclick="showToast('2FA configurado','s')">Configurar</button></div>
      <div class="ri" style="padding:15px 20px;"><div style="flex:1;"><div style="font-size:13px;font-weight:500;">Registro de auditoría</div></div><span class="badge bg">Activo</span></div>
      <div style="padding:15px 20px;border-top:1px solid var(--border);"><button class="btn btn-g btn-sm" onclick="showToast('Contraseña actualizada','s')"><i class="fa-solid fa-key"></i> Cambiar contraseña</button></div>
    </div>`;
  }
}
function setCfg(id) { cfgSection=id; renderConfig(); }

// ── CRUD ──────────────────────────────────────────────────
function saveTx() {
  const cliId=parseInt(document.getElementById('tx-cli')?.value);
  const monto=parseFloat(document.getElementById('tx-monto')?.value);
  const canal=document.getElementById('tx-canal')?.value;
  const prodId=parseInt(document.getElementById('tx-prod')?.value);
  const est=document.getElementById('tx-est')?.value;
  const fecha=document.getElementById('tx-fecha')?.value;
  if(!monto||!cliId){showToast('Completá los campos requeridos','e');return;}
  const cli=DB.clients.find(c=>c.id===cliId);
  const prod=DB.products.find(p=>p.id===prodId);
  if(prod&&est==='Pagado') prod.vendidos++;
  DB.transactions.push({id:DB.nextId++,cli:cli?.nombre||'Cliente',cliId,prodId,monto,canal,est,fecha:fecha||todayStr});
  if(cli&&est==='Pagado') cli.ltv+=monto;
  checkAlerts(); showToast(`Venta de ${fM(monto)} registrada`,'s'); closeM('tx'); refreshCurrentKpis();
}
function saveCl() {
  const nombre=document.getElementById('cl-nombre')?.value.trim();
  if(!nombre){showToast('Ingresá el nombre','e');return;}
  DB.clients.push({id:DB.nextId++,nombre,seg:document.getElementById('cl-seg')?.value,ltv:parseFloat(document.getElementById('cl-ltv')?.value)||0,contacto:'hoy',est:document.getElementById('cl-est')?.value,churn:parseInt(document.getElementById('cl-churn')?.value)||0});
  checkAlerts(); showToast(`Cliente "${nombre}" agregado`,'s'); closeM('cliente'); refreshCurrentKpis();
}
function savePr() {
  const nombre=document.getElementById('pr-nombre')?.value.trim();
  const precio=parseFloat(document.getElementById('pr-precio')?.value);
  if(!nombre||!precio){showToast('Completá los campos requeridos','e');return;}
  DB.products.push({id:DB.nextId++,nombre,cat:document.getElementById('pr-cat')?.value,precio,vendidos:0,margen:parseInt(document.getElementById('pr-margen')?.value)||70});
  checkAlerts(); showToast(`Producto "${nombre}" agregado`,'s'); closeM('producto'); refreshCurrentKpis();
}
function saveMeta() {
  const desc=document.getElementById('me-d')?.value.trim();
  const goal=parseFloat(document.getElementById('me-g')?.value);
  if(!desc||!goal){showToast('Completá los campos requeridos','e');return;}
  DB.goals.push({id:DB.nextId++,desc,link:document.getElementById('me-link')?.value,goal,col:document.getElementById('me-col')?.value});
  showToast('Meta agregada','s'); closeM('meta'); renderGoals(); if(currentView==='config') renderConfig();
}
function deleteGoal(id) { DB.goals=DB.goals.filter(g=>g.id!==id); showToast('Meta eliminada','e'); renderGoals(); if(currentView==='config') renderConfig(); }
function saveTk() {
  const t=document.getElementById('tk-t')?.value.trim();
  if(!t){showToast('Ingresá el título','e');return;}
  DB.tickets.push({id:DB.nextId++,t,p:document.getElementById('tk-p')?.value,e:document.getElementById('tk-e')?.value,age:'ahora'});
  checkAlerts(); showToast('Ticket creado','s'); closeM('ticket'); if(currentView==='operaciones') renderOperaciones(); refreshCurrentKpis();
}

function refreshCurrentKpis() {
  destroyCharts();
  setTimeout(()=>{
    if(currentView==='overview')         renderOverview();
    else if(currentView==='ventas')      renderVentas();
    else if(currentView==='clientes')    renderClientes();
    else if(currentView==='productos')   renderProductos();
    else if(currentView==='operaciones') renderOperaciones();
    else if(currentView==='alertas')     renderAlertas();
    else if(currentView==='reportes')    renderReportes();
    else if(currentView==='ia')          renderIA();
    else if(currentView==='config')      renderConfig();
  }, 30);
}

// ── MOUNT ─────────────────────────────────────────────────
window.__metricasMount = function() {
  charts = {};
  currentView = 'overview';
  alertTab = 'activas';
  cfgSection = 'empresa';

  document.querySelectorAll('.metricas-wrap .ni').forEach(b=>
    b.addEventListener('click', ()=>navigate(b.dataset.view))
  );
  document.querySelectorAll('.metricas-wrap .pb').forEach(b=>
    b.addEventListener('click', ()=>{
      document.querySelectorAll('.metricas-wrap .pb').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      destroyCharts();
      setTimeout(()=>navigate(currentView), 30);
    })
  );
  document.querySelectorAll('.metricas-wrap [data-atab]').forEach(t=>
    t.addEventListener('click', ()=>{
      document.querySelectorAll('.metricas-wrap [data-atab]').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      alertTab=t.dataset.atab;
      renderAlertas();
    })
  );
  const iaQ=document.getElementById('ia-q');
  if(iaQ) iaQ.addEventListener('keydown', e=>{ if(e.key==='Enter') runIA(); });

  checkAlerts();
  renderOverview();
};

// mount is called by Angular component's onload handler
