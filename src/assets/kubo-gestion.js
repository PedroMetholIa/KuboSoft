(function () {
  // ── CONSTANTS ─────────────────────────────────────────────
  const AVC = ['av-a','av-b','av-c','av-d','av-e','av-f','av-g','av-h'];
  const today = new Date(), todayStr = today.toISOString().split('T')[0];
  const MO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  // ── DB ────────────────────────────────────────────────────
  const DB = {
    nextId: 200,
    clients: [
      {id:1,nom:'TechCorp SA',rubro:'Tecnología',est:'Activo',email:'hola@techcorp.com',tel:'+598 99 111 222',contacto:'Carlos Ruiz',ciudad:'Montevideo',notas:'Cliente estratégico.'},
      {id:2,nom:'Grupo Meridian',rubro:'Retail',est:'Activo',email:'info@meridian.com',tel:'+598 99 333 444',contacto:'Ana Soto',ciudad:'Montevideo',notas:''},
      {id:3,nom:'Innova Labs',rubro:'Salud',est:'Prospecto',email:'contacto@innovalabs.uy',tel:'+598 99 555 666',contacto:'Martín Díaz',ciudad:'Montevideo',notas:'Reunión inicial realizada.'},
      {id:4,nom:'Constructora Norte',rubro:'Construcción',est:'Activo',email:'admin@cnorte.com',tel:'+598 99 777 888',contacto:'Roberto Paz',ciudad:'Rivera',notas:''},
      {id:5,nom:'FoodCo',rubro:'Alimentos',est:'Inactivo',email:'ventas@foodco.uy',tel:'+598 99 999 000',contacto:'Lucía Romero',ciudad:'Canelones',notas:'Contrato pausado.'},
    ],
    projects: [
      {id:1,nom:'Portal web corporativo',cliId:1,est:'En curso',presup:85000,inicio:'2025-04-01',fin:'2025-07-30',prio:'Alta',prog:65,desc:'Rediseño completo con CMS.'},
      {id:2,nom:'App de reservas',cliId:2,est:'Propuesta',presup:45000,inicio:'2025-07-01',fin:'2025-09-30',prio:'Media',prog:0,desc:'Aplicación mobile para turnos.'},
      {id:3,nom:'Sistema historial clínico',cliId:3,est:'En revisión',presup:120000,inicio:'2025-01-15',fin:'2025-06-30',prio:'Alta',prog:90,desc:'EHR para clínica privada.'},
      {id:4,nom:'Plataforma obras',cliId:4,est:'En curso',presup:60000,inicio:'2025-03-01',fin:'2025-08-15',prio:'Alta',prog:40,desc:'Dashboard de monitoreo.'},
      {id:5,nom:'E-commerce B2B',cliId:1,est:'Completado',presup:38000,inicio:'2024-10-01',fin:'2025-02-28',prio:'Media',prog:100,desc:'Tienda online mayorista.'},
    ],
    tasks: [
      {id:1,nom:'Diseñar wireframes',proyId:1,est:'Completada',prio:'Alta',asig:'Laura G.',vence:'2025-06-10',desc:''},
      {id:2,nom:'Integrar API de pagos',proyId:1,est:'En curso',prio:'Alta',asig:'Martín R.',vence:'2025-06-28',desc:''},
      {id:3,nom:'Redactar propuesta técnica',proyId:2,est:'Pendiente',prio:'Media',asig:'Pedro M.',vence:'2025-07-05',desc:''},
      {id:4,nom:'Validar módulo de login',proyId:3,est:'En curso',prio:'Alta',asig:'Sofía F.',vence:'2025-06-25',desc:''},
      {id:5,nom:'Testing de performance',proyId:3,est:'Pendiente',prio:'Alta',asig:'Diego P.',vence:'2025-06-30',desc:''},
      {id:6,nom:'Capacitación al equipo',proyId:4,est:'Pendiente',prio:'Baja',asig:'Pedro M.',vence:'2025-07-20',desc:''},
      {id:7,nom:'Deploy en producción',proyId:1,est:'Pendiente',prio:'Alta',asig:'Martín R.',vence:'2025-07-25',desc:''},
    ],
    invoices: [
      {id:1,num:'KS-001',cliId:1,proyId:5,monto:38000,est:'Pagada',emision:'2025-03-01',vence:'2025-03-31',desc:'E-commerce B2B'},
      {id:2,num:'KS-002',cliId:4,proyId:4,monto:24000,est:'Enviada',emision:'2025-05-01',vence:'2025-06-30',desc:'Plataforma obras – 50%'},
      {id:3,num:'KS-003',cliId:1,proyId:1,monto:42500,est:'Enviada',emision:'2025-06-01',vence:'2025-07-01',desc:'Portal web – primera entrega'},
      {id:4,num:'KS-004',cliId:3,proyId:3,monto:60000,est:'Vencida',emision:'2025-04-01',vence:'2025-05-31',desc:'Historial clínico – etapa 1'},
    ],
    budgets: [
      {id:1,num:'PRE-001',cliId:2,desc:'App de reservas mobile',monto:45000,est:'Enviado',valid:'2025-07-31'},
      {id:2,num:'PRE-002',cliId:3,desc:'Extensión módulo reportes',monto:18000,est:'Aprobado',valid:'2025-06-30'},
    ],
    activity: [],
  };

  // ── STATE ─────────────────────────────────────────────────
  let currentView = 'dashboard';
  let proyView = 'kanban';
  let _initialized = false;

  // ── HELPERS ───────────────────────────────────────────────
  const fM = v => '$' + (v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1000 ? (v/1000).toFixed(0)+'k' : Number(v).toLocaleString('es-UY'));
  const fDate = d => { if (!d) return '—'; const dt = new Date(d+'T12:00:00'); return `${dt.getDate()} ${MO[dt.getMonth()]} ${dt.getFullYear()}`; };
  const fDs = d => { if (!d) return '—'; const dt = new Date(d+'T12:00:00'); return `${dt.getDate()} ${MO[dt.getMonth()]}`; };
  const overdue = d => d && d < todayStr;
  const avC = id => AVC[(id - 1) % AVC.length];
  const ini = n => n.split(' ').slice(0, 2).map(x => x[0]).join('').toUpperCase();
  const accentGrad = col => ({'var(--g600)':'linear-gradient(90deg,var(--g600),var(--g400))','var(--g500)':'linear-gradient(90deg,var(--g500),var(--g300))','var(--g400)':'linear-gradient(90deg,var(--g400),var(--g200))','var(--blue)':'linear-gradient(90deg,var(--blue),#93C5FD)','var(--amber)':'linear-gradient(90deg,var(--amber),#FCD34D)','var(--teal)':'linear-gradient(90deg,var(--teal),#5EEAD4)','var(--red)':'linear-gradient(90deg,var(--red),#FCA5A5)','var(--purple)':'linear-gradient(90deg,var(--purple),#C4B5FD)'}[col] || col);
  const pbGrad = col => ({'var(--g500)':'linear-gradient(90deg,var(--g300),var(--g500))','var(--g600)':'linear-gradient(90deg,var(--g400),var(--g700))','var(--blue)':'linear-gradient(90deg,#93C5FD,var(--blue))','var(--amber)':'linear-gradient(90deg,#FCD34D,var(--amber))','#9CA3AF':'linear-gradient(90deg,#D1D5DB,#9CA3AF)'}[col] || col);
  const getCli = id => DB.clients.find(c => c.id === id);
  const getProy = id => DB.projects.find(p => p.id === id);
  const $ = id => document.getElementById(id);
  const setText = (id, v) => { const el = $(id); if (el) el.textContent = v; };
  const setHTML = (id, v) => { const el = $(id); if (el) el.innerHTML = v; };
  const prioCols = { Alta: 'var(--red)', Media: 'var(--amber)', Baja: 'var(--g500)' };
  const estBadgeCli = { Activo: 'bg', Prospecto: 'bb', Inactivo: 'bn' };
  const estBadgeProy = { Propuesta: 'bb', 'En curso': 'bg', 'En revisión': 'ba', Completado: 'bg', Pausado: 'bn' };
  const estBadgeTar = { Pendiente: 'bn', 'En curso': 'bb', Completada: 'bg' };
  const estBadgeFac = { Pagada: 'bg', Enviada: 'bb', Borrador: 'bn', Vencida: 'br' };
  const estBadgePre = { Borrador: 'bn', Enviado: 'bb', Aprobado: 'bg', Rechazado: 'br' };

  // ── TOAST ─────────────────────────────────────────────────
  function showToast(msg, type = 's') {
    const c = $('g-tcon'); if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `<i class="ti fa-solid ${type === 's' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>${msg}`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3500);
  }

  // ── ACTIVITY & BADGES ────────────────────────────────────
  function addAct(type, msg, icon, col) {
    DB.activity.unshift({ id: DB.nextId++, type, msg, icon, col, time: 'Ahora mismo' });
    if (DB.activity.length > 60) DB.activity.pop();
    updateBadges();
  }

  function updateBadges() {
    const m = compute();
    setText('nb-cli', m.totalCli);
    setText('nb-proy', m.enCurso);
    setText('nb-tar', m.tarPend + m.tarEnCurso);
    const fvEl = $('nb-fac');
    if (fvEl) { fvEl.textContent = m.facVencidas; fvEl.style.display = m.facVencidas ? '' : 'none'; }
    const nd = $('g-notif-dot');
    if (nd) nd.style.display = m.facVencidas ? 'block' : 'none';
  }

  function compute() {
    const totalCli = DB.clients.length;
    const activeCli = DB.clients.filter(c => c.est === 'Activo').length;
    const totalProy = DB.projects.length;
    const enCurso = DB.projects.filter(p => p.est === 'En curso').length;
    const completados = DB.projects.filter(p => p.est === 'Completado').length;
    const tarPend = DB.tasks.filter(t => t.est === 'Pendiente').length;
    const tarEnCurso = DB.tasks.filter(t => t.est === 'En curso').length;
    const tarComp = DB.tasks.filter(t => t.est === 'Completada').length;
    const totalFac = DB.invoices.reduce((s, f) => s + f.monto, 0);
    const facPagadas = DB.invoices.filter(f => f.est === 'Pagada').reduce((s, f) => s + f.monto, 0);
    const facPend = DB.invoices.filter(f => f.est === 'Enviada').reduce((s, f) => s + f.monto, 0);
    const facVencidas = DB.invoices.filter(f => f.est === 'Vencida').length;
    const totalPresup = DB.projects.reduce((s, p) => s + (p.presup || 0), 0);
    return { totalCli, activeCli, totalProy, enCurso, completados, tarPend, tarEnCurso, tarComp, totalFac, facPagadas, facPend, facVencidas, totalPresup };
  }

  // ── NAVIGATION ────────────────────────────────────────────
  const navTitles = {
    dashboard: 'Panel general', clientes: 'Clientes', proyectos: 'Proyectos',
    tareas: 'Tareas', facturas: 'Facturación', presupuestos: 'Presupuestos',
    historial: 'Historial de actividad', config: 'Configuración',
  };
  const navActions = {
    dashboard: 'Nueva acción', clientes: 'Nuevo cliente', proyectos: 'Nuevo proyecto',
    tareas: 'Nueva tarea', facturas: 'Nueva factura', presupuestos: 'Nuevo presupuesto',
  };

  function navigate(v) {
    document.querySelectorAll('.gestion-wrap .ni').forEach(i => i.classList.remove('active'));
    document.querySelector(`.gestion-wrap [data-view="${v}"]`)?.classList.add('active');
    document.querySelectorAll('.gestion-wrap .view').forEach(x => x.classList.remove('active'));
    $('view-g-' + v)?.classList.add('active');
    currentView = v;
    setText('g-tb-title', navTitles[v] || v);
    const lbl = navActions[v] || '';
    const btnTop = $('g-btn-top');
    if (btnTop) btnTop.style.display = lbl ? '' : 'none';
    setText('g-btn-top-lbl', lbl);
    closeDetail();
    const renders = {
      dashboard: renderDashboard, clientes: renderClientes, proyectos: renderProyectos,
      tareas: renderTareas, facturas: renderFacturas, presupuestos: renderPresupuestos,
      historial: renderHistorial, config: renderConfig,
    };
    renders[v]?.();
  }

  function openTopAction() {
    const map = { clientes: 'cliente', proyectos: 'proyecto', tareas: 'tarea', facturas: 'factura', presupuestos: 'presupuesto' };
    const t = map[currentView]; if (t) openM(t);
  }

  function refresh() {
    updateBadges();
    const renders = {
      dashboard: renderDashboard, clientes: renderClientes, proyectos: renderProyectos,
      tareas: renderTareas, facturas: renderFacturas, presupuestos: renderPresupuestos, historial: renderHistorial,
    };
    renders[currentView]?.();
  }

  // ── MODALS ────────────────────────────────────────────────
  const cliOpts = () => DB.clients.map(c => `<option value="${c.id}">${c.nom}</option>`).join('');
  const proyOpts = (none) => (none ? '<option value="">Sin proyecto</option>' : '') + DB.projects.map(p => `<option value="${p.id}">${p.nom}</option>`).join('');

  function openM(id) {
    if (id === 'proyecto') setHTML('g-pf-cli', cliOpts());
    if (id === 'tarea') setHTML('g-tf-proy', proyOpts(false));
    if (id === 'factura') {
      setHTML('g-ff-cli', cliOpts());
      setHTML('g-ff-proy', proyOpts(true));
      const em = $('g-ff-emision'); if (em) em.value = todayStr;
      const mo = $('g-ff-monto'); if (mo) mo.value = '';
      const de = $('g-ff-desc'); if (de) de.value = '';
    }
    if (id === 'presupuesto') {
      setHTML('g-bf-cli', cliOpts());
      const mo = $('g-bf-monto'); if (mo) mo.value = '';
      const de = $('g-bf-desc'); if (de) de.value = '';
    }
    $('gmodal-' + id)?.classList.add('open');
  }

  function closeM(id) { $('gmodal-' + id)?.classList.remove('open'); }

  function closeOvl(e, id) { if (e.target === $('gmodal-' + id)) closeM(id); }

  function resetModal(id, titleEl, btnEl, title, btn) {
    delete $('gmodal-' + id)?.dataset.eid;
    setText(titleEl, title); setText(btnEl, btn);
  }

  // ── DETAIL PANEL ─────────────────────────────────────────
  function dpRow(k, v) { return `<div class="dp-row"><div class="dp-key">${k}</div><div class="dp-val">${v}</div></div>`; }

  function openDetail(html, name, sub, badge, avCls) {
    const av = $('g-dp-av');
    if (av) { av.className = 'av av-lg ' + (avCls || 'av-a'); av.textContent = ini(name); }
    setText('g-dp-name', name);
    setText('g-dp-sub', sub || '');
    setHTML('g-dp-badge', badge || '');
    setHTML('g-dp-body', html);
    $('g-dp-overlay')?.classList.add('open');
    $('g-dp')?.classList.add('open');
  }

  function closeDetail() {
    $('g-dp')?.classList.remove('open');
    $('g-dp-overlay')?.classList.remove('open');
  }

  // ── DASHBOARD ─────────────────────────────────────────────
  function renderDashboard() {
    const m = compute();
    const kpis = [
      { col: 'var(--g600)', icon: 'fa-building', label: 'Clientes activos', val: m.activeCli, delta: `${m.totalCli} en total`, dir: 'up', oc: "navigate('clientes')" },
      { col: 'var(--blue)', icon: 'fa-diagram-project', label: 'Proyectos en curso', val: m.enCurso, delta: `${m.completados} completados`, dir: 'up', oc: "navigate('proyectos')" },
      { col: 'var(--amber)', icon: 'fa-list-check', label: 'Tareas activas', val: m.tarPend + m.tarEnCurso, delta: `${m.tarComp} completadas`, dir: m.tarPend > 5 ? 'dn' : 'neu', oc: "navigate('tareas')" },
      { col: 'var(--teal)', icon: 'fa-file-invoice-dollar', label: 'Facturado total', val: fM(m.totalFac), delta: `${fM(m.facPagadas)} cobrado`, dir: 'up', oc: "navigate('facturas')" },
    ];
    setHTML('dash-kpis', kpis.map(k => `<div class="kpi" onclick="${k.oc}">
      <div class="kpi-accent" style="background:${accentGrad(k.col)}"></div>
      <div class="kpi-lbl">${k.label}<div class="kpi-icon" style="background:${k.col}18;color:${k.col};"><i class="fa-solid ${k.icon}"></i></div></div>
      <div class="kpi-val ${String(k.val).length > 6 ? 'sm' : ''}">${k.val}</div>
      <div class="kpi-delta ${k.dir === 'up' ? 'up' : k.dir === 'dn' ? 'dn' : 'neu'}"><i class="fa-solid ${k.dir === 'up' ? 'fa-arrow-trend-up' : k.dir === 'dn' ? 'fa-arrow-trend-down' : 'fa-minus'}"></i> ${k.delta}</div>
    </div>`).join(''));

    const stages = ['Propuesta','En curso','En revisión','Completado','Pausado'];
    const sCols = { Propuesta: 'var(--blue)', 'En curso': 'var(--g500)', 'En revisión': 'var(--amber)', Completado: 'var(--g600)', Pausado: '#9CA3AF' };
    setHTML('dash-pipeline', `<div style="display:flex;gap:6px;">${stages.map(s => {
      const ps = DB.projects.filter(p => p.est === s);
      return `<div style="flex:1;background:var(--g25);border:1px solid var(--border);border-radius:8px;padding:10px 12px;min-width:0;">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:6px;">
          <div style="width:7px;height:7px;border-radius:50%;background:${pbGrad(sCols[s])};flex-shrink:0;"></div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:${sCols[s]};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s}</div>
        </div>
        <div style="font-family:'Inter',sans-serif;font-size:24px;font-weight:700;color:var(--ink);">${ps.length}</div>
        ${ps.slice(0, 2).map(p => `<div style="font-size:11px;color:var(--ink3);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">• ${p.nom}</div>`).join('')}
        ${ps.length > 2 ? `<div style="font-size:10px;color:var(--ink4);margin-top:2px;">+${ps.length - 2} más</div>` : ''}
      </div>`;
    }).join('')}</div>`);

    const tPend = DB.tasks.filter(t => t.est !== 'Completada').slice(0, 5);
    setHTML('dash-tareas', tPend.length ? tPend.map(t => {
      const pr = getProy(t.proyId);
      return `<div class="ri" style="gap:10px;cursor:pointer;" onclick="openDetail(buildTarDetail(${t.id}),'${t.nom.replace(/'/g,"\\'")}','${(pr?.nom||'').replace(/'/g,"\\'")}','','${pr ? avC(pr.cliId) : 'av-a'}')">
        <div style="width:7px;height:7px;border-radius:50%;background:${prioCols[t.prio]||'var(--border2)'};flex-shrink:0;margin-top:2px;"></div>
        <div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.nom}</div>
        <div style="font-size:11px;color:var(--ink3);">${pr?.nom||'—'} · ${t.asig||'Sin asignar'}</div></div>
        <div style="text-align:right;flex-shrink:0;"><span class="badge ${estBadgeTar[t.est]||'bn'}" style="font-size:10px;">${t.est}</span>
        ${t.vence ? `<div style="font-size:10px;color:${overdue(t.vence)?'var(--red)':'var(--ink4)'};margin-top:2px;">${fDs(t.vence)}</div>` : ''}</div>
      </div>`;
    }).join('') : '<div class="empty" style="padding:24px;"><i class="fa-solid fa-check-circle"></i><p>Todo al día.</p></div>');

    setHTML('dash-facturas', DB.invoices.slice(0, 4).map(f => {
      const cli = getCli(f.cliId);
      const fic = { Pagada: ['var(--g50)','var(--g600)','fa-check-circle'], Enviada: ['#EFF6FF','var(--blue)','fa-paper-plane'], Borrador: ['#F3F4F6','#374151','fa-pencil'], Vencida: ['#FEF2F2','var(--red)','fa-triangle-exclamation'] };
      const [bg, col, ic] = fic[f.est] || ['#F3F4F6','#374151','fa-file'];
      return `<div class="ri" style="gap:12px;cursor:pointer;" onclick="openDetail(buildFacDetail(${f.id}),'${f.num}','${(cli?.nom||'').replace(/'/g,"\\'")}','<span class=\\'badge ${estBadgeFac[f.est]||'bn'}\\'>${f.est}</span>','${cli ? avC(cli.id) : 'av-a'}')">
        <div style="width:34px;height:34px;border-radius:8px;background:${bg};color:${col};display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid ${ic}" style="font-size:13px;"></i></div>
        <div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:500;">${f.num}</div><div style="font-size:11px;color:var(--ink3);">${cli?.nom||'—'}</div></div>
        <div style="text-align:right;"><div style="font-family:var(--fd);font-size:13px;font-weight:600;">${fM(f.monto)}</div>
        <div style="font-size:10px;color:${overdue(f.vence)&&f.est!=='Pagada'?'var(--red)':'var(--ink4)'};">${fDs(f.vence)}</div></div>
      </div>`;
    }).join(''));

    renderActFeed('dash-activity');
  }

  function renderActFeed(elId) {
    const el = $(elId); if (!el) return;
    if (!DB.activity.length) { el.innerHTML = '<div style="text-align:center;color:var(--ink4);font-size:13px;padding:20px 0;">Sin actividad aún.</div>'; return; }
    el.innerHTML = DB.activity.slice(0, 12).map(a => `<div class="tl-item">
      <div class="tl-icon" style="background:${a.col}18;color:${a.col};"><i class="fa-solid ${a.icon}"></i></div>
      <div class="tl-body"><div class="tl-title">${a.msg}</div><div class="tl-time">${a.time}</div></div>
    </div>`).join('');
  }

  // ── CLIENTES ──────────────────────────────────────────────
  function renderClientes() {
    let list = [...DB.clients];
    const s = ($('cli-search')?.value || '').toLowerCase();
    const est = $('cli-fest')?.value || '';
    const rub = $('cli-frub')?.value || '';
    if (s) list = list.filter(c => (c.nom + c.rubro + c.contacto).toLowerCase().includes(s));
    if (est) list = list.filter(c => c.est === est);
    if (rub) list = list.filter(c => c.rubro === rub);
    setText('cli-count', list.length);

    const m = compute();
    const facPorCli = {};
    DB.invoices.forEach(f => { facPorCli[f.cliId] = (facPorCli[f.cliId] || 0) + f.monto; });
    const topCli = DB.clients.length ? DB.clients.reduce((a, b) => (facPorCli[b.id] || 0) > (facPorCli[a.id] || 0) ? b : a, DB.clients[0]) : null;

    setHTML('cli-kpis', [
      { col: 'var(--g600)', icon: 'fa-building', label: 'Total clientes', val: m.totalCli, delta: `${m.activeCli} activos` },
      { col: 'var(--g400)', icon: 'fa-user-check', label: 'Activos', val: m.activeCli, delta: `${Math.round(m.activeCli / m.totalCli * 100) || 0}%` },
      { col: 'var(--blue)', icon: 'fa-user-clock', label: 'Prospectos', val: DB.clients.filter(c => c.est === 'Prospecto').length, delta: 'En seguimiento' },
      { col: 'var(--teal)', icon: 'fa-trophy', label: 'Top cliente', val: topCli?.nom.split(' ')[0] || '—', delta: topCli ? fM(facPorCli[topCli.id] || 0) + ' facturado' : '' },
    ].map(k => `<div class="kpi"><div class="kpi-accent" style="background:${accentGrad(k.col)}"></div>
      <div class="kpi-lbl">${k.label}<div class="kpi-icon" style="background:${k.col}18;color:${k.col};"><i class="fa-solid ${k.icon}"></i></div></div>
      <div class="kpi-val ${String(k.val).length > 7 ? 'sm' : ''}">${k.val}</div>
      <div class="kpi-delta neu">${k.delta}</div></div>`).join(''));

    setHTML('cli-body', list.length ? list.map(c => {
      const pCount = DB.projects.filter(p => p.cliId === c.id).length;
      const facT = DB.invoices.filter(f => f.cliId === c.id).reduce((s, f) => s + f.monto, 0);
      return `<tr onclick="openDetailCli(${c.id})" style="cursor:pointer;">
        <td><div style="display:flex;align-items:center;gap:10px;"><div class="av ${avC(c.id)}">${ini(c.nom)}</div>
          <div><div style="font-weight:500;">${c.nom}</div><div style="font-size:11px;color:var(--ink3);">${c.contacto || '—'}</div></div></div></td>
        <td>${c.rubro}</td>
        <td style="font-size:12px;color:var(--ink3);">${c.email || '—'}</td>
        <td style="text-align:center;font-weight:600;">${pCount}</td>
        <td style="font-family:var(--fd);">${fM(facT)}</td>
        <td><span class="badge ${estBadgeCli[c.est] || 'bn'}">${c.est}</span></td>
        <td onclick="event.stopPropagation()"><div style="display:flex;gap:6px;">
          <button class="btn btn-g btn-sm" onclick="editCli(${c.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-d btn-sm" onclick="delCli(${c.id})"><i class="fa-solid fa-trash"></i></button>
        </div></td></tr>`;
    }).join('') : `<tr><td colspan="7"><div class="empty"><i class="fa-solid fa-building"></i><p>Sin clientes. <button class="btn btn-p btn-sm" onclick="openM('cliente')" style="margin-left:8px;">Agregar</button></p></div></td></tr>`);
  }

  function openDetailCli(id) {
    const c = getCli(id); if (!c) return;
    const proys = DB.projects.filter(p => p.cliId === id);
    const ft = DB.invoices.filter(f => f.cliId === id).reduce((s, f) => s + f.monto, 0);
    const html = `<div class="chips">
      <div class="chip"><div class="chip-lbl">Proyectos</div><div class="chip-val">${proys.length}</div></div>
      <div class="chip"><div class="chip-lbl">Facturado</div><div class="chip-val">${fM(ft)}</div></div>
    </div>
    <div class="dp-sec"><div class="dp-sec-title">Información</div>
      ${dpRow('Rubro', c.rubro)}${dpRow('Email', c.email || '—')}${dpRow('Teléfono', c.tel || '—')}${dpRow('Ciudad', c.ciudad || '—')}${dpRow('Contacto', c.contacto || '—')}
    </div>
    ${c.notas ? `<div class="dp-sec"><div class="dp-sec-title">Notas</div><p style="font-size:13px;color:var(--ink3);">${c.notas}</p></div>` : ''}
    <div class="dp-sec"><div class="dp-sec-title">Proyectos (${proys.length})</div>
      ${proys.map(p => `<div class="ri" style="padding:10px 0;border-bottom:1px solid var(--border);flex-direction:column;align-items:flex-start;gap:5px;">
        <div style="display:flex;align-items:center;gap:8px;width:100%;"><span style="font-size:13px;font-weight:500;flex:1;">${p.nom}</span><span class="badge ${estBadgeProy[p.est] || 'bn'}" style="font-size:10px;">${p.est}</span></div>
        <div class="pbar" style="width:100%;height:4px;"><div class="pbar-fill" style="width:${p.prog}%;background:${pbGrad('var(--g500)')};"></div></div>
      </div>`).join('') || '<p style="font-size:13px;color:var(--ink3);">Sin proyectos asignados.</p>'}
    </div>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button class="btn btn-g btn-sm" onclick="closeDetail();editCli(${id})"><i class="fa-solid fa-pen"></i> Editar</button>
      <button class="btn btn-p btn-sm" onclick="closeDetail();setTimeout(()=>{setHTML('g-pf-cli',cliOpts());openM('proyecto')},50)"><i class="fa-solid fa-plus"></i> Nuevo proyecto</button>
    </div>`;
    openDetail(html, c.nom, c.rubro, `<span class="badge ${estBadgeCli[c.est] || 'bn'}">${c.est}</span>`, avC(c.id));
  }

  function saveCli() {
    const nom = $('cf-nom')?.value.trim();
    if (!nom) { showToast('El nombre es requerido', 'e'); return; }
    const data = { nom, rubro: $('cf-rub')?.value, est: $('cf-est')?.value, email: $('cf-email')?.value, tel: $('cf-tel')?.value, contacto: $('cf-contacto')?.value, ciudad: $('cf-ciudad')?.value, notas: $('cf-notas')?.value };
    const eid = parseInt($('gmodal-cliente')?.dataset.eid || 0);
    if (eid) { const c = getCli(eid); if (c) Object.assign(c, data); addAct('cliente', `Cliente "${nom}" actualizado`, 'fa-building', 'var(--g500)'); showToast('Cliente actualizado', 's'); resetModal('cliente', 'gmcli-t', 'gmcli-btn', 'Nuevo cliente', 'Guardar'); }
    else { DB.clients.push({ id: DB.nextId++, ...data }); addAct('cliente', `Nuevo cliente: "${nom}"`, 'fa-building', 'var(--g500)'); showToast(`"${nom}" agregado`, 's'); }
    closeM('cliente'); refresh();
  }

  function editCli(id) {
    const c = getCli(id); if (!c) return;
    const set = (eid, val) => { const el = $(eid); if (el) el.value = val || ''; };
    set('cf-nom', c.nom); set('cf-rub', c.rubro); set('cf-est', c.est); set('cf-email', c.email);
    set('cf-tel', c.tel); set('cf-contacto', c.contacto); set('cf-ciudad', c.ciudad); set('cf-notas', c.notas);
    const m = $('gmodal-cliente'); if (m) m.dataset.eid = id;
    setText('gmcli-t', 'Editar cliente'); setText('gmcli-btn', 'Guardar cambios');
    m?.classList.add('open');
  }

  function delCli(id) {
    const c = getCli(id); if (!c) return;
    if (!confirm(`¿Eliminar "${c.nom}"? Sus proyectos y facturas también se eliminarán.`)) return;
    DB.clients = DB.clients.filter(x => x.id !== id);
    DB.projects = DB.projects.filter(p => p.cliId !== id);
    DB.invoices = DB.invoices.filter(f => f.cliId !== id);
    addAct('cliente', `Cliente "${c.nom}" eliminado`, 'fa-building', 'var(--red)');
    showToast('Cliente eliminado', 'e'); refresh();
  }

  // ── PROYECTOS ─────────────────────────────────────────────
  function setProyView(v) {
    proyView = v;
    const kEl = $('proy-kanban'), lEl = $('proy-lista');
    if (kEl) kEl.style.display = v === 'kanban' ? '' : 'none';
    if (lEl) lEl.style.display = v === 'lista' ? '' : 'none';
    const vk = $('vk-btn'), vl = $('vl-btn');
    if (vk) vk.className = 'btn ' + (v === 'kanban' ? 'btn-p' : 'btn-g') + ' btn-sm';
    if (vl) vl.className = 'btn ' + (v === 'lista' ? 'btn-p' : 'btn-g') + ' btn-sm';
  }

  function filterProys() {
    let list = [...DB.projects];
    const s = ($('proy-search')?.value || '').toLowerCase();
    const est = $('proy-fest')?.value || '';
    const cid = parseInt($('proy-fcli')?.value) || 0;
    if (s) list = list.filter(p => p.nom.toLowerCase().includes(s));
    if (est) list = list.filter(p => p.est === est);
    if (cid) list = list.filter(p => p.cliId === cid);
    return list;
  }

  function renderProyectos() {
    const cSel = $('proy-fcli');
    if (cSel) { const prev = cSel.value; cSel.innerHTML = '<option value="">Todos los clientes</option>' + DB.clients.map(c => `<option value="${c.id}">${c.nom}</option>`).join(''); cSel.value = prev; }
    const m = compute();
    setHTML('proy-kpis', [
      { col: 'var(--g600)', icon: 'fa-diagram-project', label: 'Total proyectos', val: m.totalProy, delta: `${m.enCurso} en curso` },
      { col: 'var(--g400)', icon: 'fa-check-circle', label: 'Completados', val: m.completados, delta: `${Math.round(m.completados / m.totalProy * 100) || 0}%` },
      { col: 'var(--amber)', icon: 'fa-clock', label: 'En revisión', val: DB.projects.filter(p => p.est === 'En revisión').length, delta: 'Pendientes de aprobación' },
      { col: 'var(--teal)', icon: 'fa-dollar-sign', label: 'Presupuesto total', val: fM(m.totalPresup), delta: `${m.totalProy} proyectos` },
    ].map(k => `<div class="kpi"><div class="kpi-accent" style="background:${accentGrad(k.col)}"></div>
      <div class="kpi-lbl">${k.label}<div class="kpi-icon" style="background:${k.col}18;color:${k.col};"><i class="fa-solid ${k.icon}"></i></div></div>
      <div class="kpi-val ${String(k.val).length > 6 ? 'sm' : ''}">${k.val}</div>
      <div class="kpi-delta neu">${k.delta}</div></div>`).join(''));

    const list = filterProys();
    const stages = ['Propuesta','En curso','En revisión','Completado','Pausado'];
    const sCols = { Propuesta: 'var(--blue)', 'En curso': 'var(--g500)', 'En revisión': 'var(--amber)', Completado: 'var(--g600)', Pausado: '#9CA3AF' };

    setHTML('proy-kanban', `<div class="kanban">${stages.map(s => {
      const ps = list.filter(p => p.est === s);
      return `<div class="k-col">
        <div class="k-head"><div class="k-title"><div class="k-dot" style="background:${pbGrad(sCols[s])};"></div>${s}</div><div class="k-count">${ps.length}</div></div>
        <div class="k-body">${ps.map(p => {
          const cli = getCli(p.cliId);
          const td = DB.tasks.filter(t => t.proyId === p.id).length;
          const tc = DB.tasks.filter(t => t.proyId === p.id && t.est === 'Completada').length;
          return `<div class="k-card" onclick="openDetailProy(${p.id})">
            <div class="k-card-title">${p.nom}</div>
            <div class="k-card-meta"><div class="av av-sm ${avC(p.cliId)}">${ini(cli?.nom || '?')}</div><span>${cli?.nom || 'Sin cliente'}</span></div>
            ${p.presup ? `<div style="font-size:11px;color:var(--ink3);margin-top:4px;">${fM(p.presup)}</div>` : ''}
            <div style="display:flex;align-items:center;gap:6px;margin-top:8px;">
              <div class="pbar" style="flex:1;height:4px;"><div class="pbar-fill" style="width:${p.prog}%;background:${pbGrad(sCols[s])};"></div></div>
              <span style="font-size:10px;color:var(--ink3);">${p.prog}%</span>
              ${td ? `<span style="font-size:10px;color:var(--ink4);">${tc}/${td}</span>` : ''}
            </div></div>`;
        }).join('')}
        <button class="k-add" onclick="openM('proyecto')">+ Agregar proyecto</button>
        </div></div>`;
    }).join('')}</div>`);

    setHTML('proy-body', list.length ? list.map(p => {
      const cli = getCli(p.cliId);
      return `<tr onclick="openDetailProy(${p.id})" style="cursor:pointer;">
        <td><div style="font-weight:500;">${p.nom}</div><div style="font-size:11px;color:var(--ink3);">${p.desc}</div></td>
        <td>${cli ? `<div style="display:flex;align-items:center;gap:7px;"><div class="av av-sm ${avC(p.cliId)}">${ini(cli.nom)}</div>${cli.nom}</div>` : '—'}</td>
        <td><span class="badge ${estBadgeProy[p.est] || 'bn'}">${p.est}</span></td>
        <td style="font-family:var(--fd);">${fM(p.presup || 0)}</td>
        <td><div style="display:flex;align-items:center;gap:8px;"><div class="pbar" style="width:80px;"><div class="pbar-fill" style="width:${p.prog}%;background:${pbGrad('var(--g500)')};"></div></div><span style="font-size:11px;">${p.prog}%</span></div></td>
        <td style="font-size:12px;color:${overdue(p.fin) ? 'var(--red)' : 'var(--ink3)'};">${fDs(p.fin)}</td>
        <td onclick="event.stopPropagation()"><div style="display:flex;gap:6px;">
          <button class="btn btn-g btn-sm" onclick="editProy(${p.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-d btn-sm" onclick="delProy(${p.id})"><i class="fa-solid fa-trash"></i></button>
        </div></td></tr>`;
    }).join('') : `<tr><td colspan="7"><div class="empty"><i class="fa-solid fa-diagram-project"></i><p>Sin proyectos.</p></div></td></tr>`);

    setProyView(proyView);
  }

  function openDetailProy(id) {
    const p = getProy(id); if (!p) return;
    const cli = getCli(p.cliId);
    const tasks = DB.tasks.filter(t => t.proyId === id);
    const tc = tasks.filter(t => t.est === 'Completada').length;
    const html = `<div class="chips">
      <div class="chip"><div class="chip-lbl">Presupuesto</div><div class="chip-val">${fM(p.presup || 0)}</div></div>
      <div class="chip"><div class="chip-lbl">Progreso</div><div class="chip-val">${p.prog}%</div></div>
    </div>
    <div style="margin-bottom:18px;"><div class="pbar" style="height:10px;"><div class="pbar-fill" style="width:${p.prog}%;background:${pbGrad('var(--g500)')};"></div></div></div>
    <div class="dp-sec"><div class="dp-sec-title">Detalles</div>
      ${dpRow('Cliente', cli?.nom || '—')}${dpRow('Estado', `<span class="badge ${estBadgeProy[p.est] || 'bn'}">${p.est}</span>`)}${dpRow('Prioridad', `<span style="font-weight:600;color:${prioCols[p.prio]};">${p.prio}</span>`)}${dpRow('Inicio', fDate(p.inicio))}${dpRow('Fin', fDate(p.fin))}
    </div>
    ${p.desc ? `<div class="dp-sec"><div class="dp-sec-title">Descripción</div><p style="font-size:13px;color:var(--ink3);">${p.desc}</p></div>` : ''}
    <div class="dp-sec"><div class="dp-sec-title">Tareas (${tc}/${tasks.length})</div>
      ${tasks.map(t => `<div class="ri" style="padding:9px 0;border-bottom:1px solid var(--border);">
        <div style="width:7px;height:7px;border-radius:50%;background:${t.est==='Completada'?'var(--g500)':t.est==='En curso'?'var(--blue)':'var(--border2)'};flex-shrink:0;"></div>
        <span style="font-size:13px;flex:1;${t.est==='Completada'?'text-decoration:line-through;color:var(--ink3);':''}font-weight:500;">${t.nom}</span>
        <span style="font-size:11px;color:var(--ink4);">${t.asig || ''}</span>
      </div>`).join('') || '<p style="font-size:13px;color:var(--ink3);">Sin tareas.</p>'}
    </div>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button class="btn btn-g btn-sm" onclick="closeDetail();editProy(${id})"><i class="fa-solid fa-pen"></i> Editar</button>
      <button class="btn btn-p btn-sm" onclick="closeDetail();setTimeout(()=>openM('tarea'),50)"><i class="fa-solid fa-plus"></i> Nueva tarea</button>
    </div>`;
    openDetail(html, p.nom, cli?.nom || 'Sin cliente', `<span class="badge ${estBadgeProy[p.est] || 'bn'}">${p.est}</span>`, p.cliId ? avC(p.cliId) : 'av-a');
  }

  function saveProy() {
    const nom = $('pf-nom')?.value.trim();
    const cliId = parseInt($('g-pf-cli')?.value) || 0;
    if (!nom || !cliId) { showToast('Nombre y cliente son requeridos', 'e'); return; }
    const data = { nom, cliId, est: $('pf-est')?.value, presup: parseFloat($('pf-presup')?.value) || 0, inicio: $('pf-inicio')?.value, fin: $('pf-fin')?.value, prio: $('pf-prio')?.value, prog: parseInt($('pf-prog')?.value) || 0, desc: $('pf-desc')?.value.trim() };
    const eid = parseInt($('gmodal-proyecto')?.dataset.eid || 0);
    if (eid) { const p = getProy(eid); if (p) Object.assign(p, data); addAct('proyecto', `Proyecto "${nom}" actualizado`, 'fa-diagram-project', 'var(--g500)'); showToast('Proyecto actualizado', 's'); resetModal('proyecto', 'gmproy-t', 'gmproy-btn', 'Nuevo proyecto', 'Guardar'); }
    else { DB.projects.push({ id: DB.nextId++, ...data }); addAct('proyecto', `Nuevo proyecto: "${nom}"`, 'fa-diagram-project', 'var(--g500)'); showToast(`"${nom}" creado`, 's'); }
    closeM('proyecto'); refresh();
  }

  function editProy(id) {
    const p = getProy(id); if (!p) return;
    setHTML('g-pf-cli', cliOpts());
    const set = (eid, val) => { const el = $(eid); if (el) el.value = val ?? ''; };
    set('pf-nom', p.nom); set('g-pf-cli', p.cliId); set('pf-est', p.est);
    set('pf-presup', p.presup || ''); set('pf-inicio', p.inicio || ''); set('pf-fin', p.fin || '');
    set('pf-prio', p.prio); set('pf-prog', p.prog || 0); set('pf-desc', p.desc || '');
    const m = $('gmodal-proyecto'); if (m) m.dataset.eid = id;
    setText('gmproy-t', 'Editar proyecto'); setText('gmproy-btn', 'Guardar cambios');
    m?.classList.add('open');
  }

  function delProy(id) {
    const p = getProy(id); if (!p) return;
    if (!confirm(`¿Eliminar "${p.nom}"?`)) return;
    DB.projects = DB.projects.filter(x => x.id !== id);
    DB.tasks = DB.tasks.filter(t => t.proyId !== id);
    addAct('proyecto', `Proyecto "${p.nom}" eliminado`, 'fa-diagram-project', 'var(--red)');
    showToast('Eliminado', 'e'); refresh();
  }

  // ── TAREAS ────────────────────────────────────────────────
  function renderTareas() {
    const pSel = $('tar-fproy');
    if (pSel) { const prev = pSel.value; pSel.innerHTML = '<option value="">Todos los proyectos</option>' + DB.projects.map(p => `<option value="${p.id}">${p.nom}</option>`).join(''); pSel.value = prev; }
    let list = [...DB.tasks];
    const s = ($('tar-search')?.value || '').toLowerCase();
    const est = $('tar-fest')?.value || '';
    const pid = parseInt($('tar-fproy')?.value) || 0;
    const prio = $('tar-fprio')?.value || '';
    if (s) list = list.filter(t => t.nom.toLowerCase().includes(s));
    if (est) list = list.filter(t => t.est === est);
    if (pid) list = list.filter(t => t.proyId === pid);
    if (prio) list = list.filter(t => t.prio === prio);
    setText('tar-count', list.length);
    const m = compute();
    setHTML('tar-kpis', [
      { col: 'var(--g600)', icon: 'fa-list-check', label: 'Total', val: DB.tasks.length, delta: `${m.tarComp} completadas` },
      { col: 'var(--red)', icon: 'fa-circle-exclamation', label: 'Pendientes', val: m.tarPend, delta: 'Sin empezar' },
      { col: 'var(--blue)', icon: 'fa-spinner', label: 'En curso', val: m.tarEnCurso, delta: 'En progreso' },
      { col: 'var(--g400)', icon: 'fa-check-double', label: 'Completadas', val: m.tarComp, delta: `${Math.round(m.tarComp / DB.tasks.length * 100) || 0}%` },
    ].map(k => `<div class="kpi"><div class="kpi-accent" style="background:${accentGrad(k.col)}"></div>
      <div class="kpi-lbl">${k.label}<div class="kpi-icon" style="background:${k.col}18;color:${k.col};"><i class="fa-solid ${k.icon}"></i></div></div>
      <div class="kpi-val">${k.val}</div><div class="kpi-delta neu">${k.delta}</div></div>`).join(''));

    setHTML('tar-body', list.length ? list.map(t => {
      const pr = getProy(t.proyId);
      return `<tr style="cursor:pointer;" onclick="toggleTarea(${t.id})">
        <td><div style="display:flex;align-items:center;gap:9px;">
          <div style="width:16px;height:16px;border-radius:4px;border:2px solid ${t.est==='Completada'?'var(--g500)':'var(--border2)'};background:${t.est==='Completada'?'var(--g500)':'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${t.est === 'Completada' ? '<i class="fa-solid fa-check" style="font-size:9px;color:#fff;"></i>' : ''}</div>
          <span style="${t.est==='Completada'?'text-decoration:line-through;color:var(--ink3);':''}font-weight:500;">${t.nom}</span></div></td>
        <td style="font-size:12px;color:var(--ink3);">${pr?.nom || '—'}</td>
        <td><span style="font-size:12px;font-weight:600;color:${prioCols[t.prio]||'var(--ink3)'};">${t.prio}</span></td>
        <td>${t.asig || '—'}</td>
        <td style="font-size:12px;color:${overdue(t.vence)&&t.est!=='Completada'?'var(--red)':'var(--ink3)'};">${fDs(t.vence) || '—'}</td>
        <td><span class="badge ${estBadgeTar[t.est] || 'bn'}">${t.est}</span></td>
        <td onclick="event.stopPropagation()"><div style="display:flex;gap:6px;">
          <button class="btn btn-g btn-sm" onclick="editTar(${t.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-d btn-sm" onclick="delTar(${t.id})"><i class="fa-solid fa-trash"></i></button>
        </div></td></tr>`;
    }).join('') : `<tr><td colspan="7"><div class="empty"><i class="fa-solid fa-list-check"></i><p>Sin tareas. <button class="btn btn-p btn-sm" onclick="openM('tarea')" style="margin-left:8px;">Agregar</button></p></div></td></tr>`);
  }

  function buildTarDetail(id) {
    const t = DB.tasks.find(x => x.id === id); if (!t) return '';
    const pr = getProy(t.proyId);
    return `<div class="dp-sec"><div class="dp-sec-title">Detalle</div>
      ${dpRow('Proyecto', pr?.nom || '—')}${dpRow('Estado', `<span class="badge ${estBadgeTar[t.est]||'bn'}">${t.est}</span>`)}${dpRow('Prioridad', `<span style="font-weight:600;color:${prioCols[t.prio]};">${t.prio}</span>`)}${dpRow('Asignado', t.asig || '—')}${dpRow('Vence', fDate(t.vence))}</div>
      ${t.desc ? `<div class="dp-sec"><div class="dp-sec-title">Descripción</div><p style="font-size:13px;color:var(--ink3);">${t.desc}</p></div>` : ''}`;
  }

  function toggleTarea(id) {
    const t = DB.tasks.find(x => x.id === id); if (!t) return;
    t.est = t.est === 'Completada' ? 'Pendiente' : 'Completada';
    addAct('tarea', `Tarea "${t.nom}": ${t.est}`, 'fa-list-check', t.est === 'Completada' ? 'var(--g500)' : 'var(--amber)');
    showToast(t.est === 'Completada' ? '✓ Tarea completada' : 'Tarea reabierta', 's'); refresh();
  }

  function saveTar() {
    const nom = $('tf-nom')?.value.trim();
    if (!nom) { showToast('El título es requerido', 'e'); return; }
    const data = { nom, proyId: parseInt($('g-tf-proy')?.value) || 0, est: $('tf-est')?.value, prio: $('tf-prio')?.value, asig: $('tf-asig')?.value.trim(), vence: $('tf-vence')?.value, desc: $('tf-desc')?.value.trim() };
    const eid = parseInt($('gmodal-tarea')?.dataset.eid || 0);
    if (eid) { const t = DB.tasks.find(x => x.id === eid); if (t) Object.assign(t, data); addAct('tarea', `Tarea "${nom}" actualizada`, 'fa-list-check', 'var(--amber)'); showToast('Actualizada', 's'); resetModal('tarea', 'gmtar-t', 'gmtar-btn', 'Nueva tarea', 'Guardar'); }
    else { DB.tasks.push({ id: DB.nextId++, ...data }); addAct('tarea', `Nueva tarea: "${nom}"`, 'fa-list-check', 'var(--amber)'); showToast('Tarea creada', 's'); }
    closeM('tarea'); refresh();
  }

  function editTar(id) {
    const t = DB.tasks.find(x => x.id === id); if (!t) return;
    setHTML('g-tf-proy', proyOpts(false));
    const set = (eid, val) => { const el = $(eid); if (el) el.value = val ?? ''; };
    set('tf-nom', t.nom); set('g-tf-proy', t.proyId || ''); set('tf-est', t.est);
    set('tf-prio', t.prio); set('tf-asig', t.asig || ''); set('tf-vence', t.vence || ''); set('tf-desc', t.desc || '');
    const m = $('gmodal-tarea'); if (m) m.dataset.eid = id;
    setText('gmtar-t', 'Editar tarea'); setText('gmtar-btn', 'Guardar cambios');
    m?.classList.add('open');
  }

  function delTar(id) {
    const t = DB.tasks.find(x => x.id === id); if (!t) return;
    DB.tasks = DB.tasks.filter(x => x.id !== id);
    addAct('tarea', `Tarea "${t.nom}" eliminada`, 'fa-list-check', 'var(--red)');
    showToast('Eliminada', 'e'); refresh();
  }

  // ── FACTURAS ──────────────────────────────────────────────
  function renderFacturas() {
    const cSel = $('fac-fcli');
    if (cSel) { const prev = cSel.value; cSel.innerHTML = '<option value="">Todos</option>' + DB.clients.map(c => `<option value="${c.id}">${c.nom}</option>`).join(''); cSel.value = prev; }
    let list = [...DB.invoices];
    const s = ($('fac-search')?.value || '').toLowerCase();
    const est = $('fac-fest')?.value || '';
    const cid = parseInt($('fac-fcli')?.value) || 0;
    if (s) list = list.filter(f => (f.num + (getCli(f.cliId)?.nom || '') + f.desc).toLowerCase().includes(s));
    if (est) list = list.filter(f => f.est === est);
    if (cid) list = list.filter(f => f.cliId === cid);
    setText('fac-count', list.length);

    const total = DB.invoices.reduce((s, f) => s + f.monto, 0);
    const pagadas = DB.invoices.filter(f => f.est === 'Pagada').reduce((s, f) => s + f.monto, 0);
    const pend = DB.invoices.filter(f => f.est === 'Enviada').reduce((s, f) => s + f.monto, 0);
    const venc = DB.invoices.filter(f => f.est === 'Vencida');
    setHTML('fac-kpis', [
      { col: 'var(--g600)', icon: 'fa-file-invoice-dollar', label: 'Total facturado', val: fM(total), delta: `${DB.invoices.length} facturas` },
      { col: 'var(--g400)', icon: 'fa-circle-check', label: 'Cobrado', val: fM(pagadas), delta: `${DB.invoices.filter(f=>f.est==='Pagada').length} pagadas` },
      { col: 'var(--amber)', icon: 'fa-paper-plane', label: 'Por cobrar', val: fM(pend), delta: `${DB.invoices.filter(f=>f.est==='Enviada').length} enviadas` },
      { col: 'var(--red)', icon: 'fa-triangle-exclamation', label: 'Vencidas', val: String(venc.length), delta: venc.length ? fM(venc.reduce((s,f)=>s+f.monto,0))+' en riesgo' : 'Al día' },
    ].map(k => `<div class="kpi"><div class="kpi-accent" style="background:${accentGrad(k.col)}"></div>
      <div class="kpi-lbl">${k.label}<div class="kpi-icon" style="background:${k.col}18;color:${k.col};"><i class="fa-solid ${k.icon}"></i></div></div>
      <div class="kpi-val ${String(k.val).length>6?'sm':''}">${k.val}</div>
      <div class="kpi-delta ${k.col==='var(--red)'&&venc.length?'dn':'neu'}">${k.delta}</div></div>`).join(''));

    setHTML('fac-body', list.length ? list.map(f => {
      const cli = getCli(f.cliId);
      return `<tr onclick="openDetail(buildFacDetail(${f.id}),'${f.num}','${(cli?.nom||'').replace(/'/g,"\\'")}','<span class=\\'badge ${estBadgeFac[f.est]||'bn'}\\'>${f.est}</span>','${cli?avC(cli.id):'av-a'}')" style="cursor:pointer;">
        <td style="font-family:var(--fd);font-weight:600;color:var(--g600);">${f.num}</td>
        <td>${cli?.nom || '—'}</td>
        <td style="font-family:var(--fd);font-weight:600;">${fM(f.monto)}</td>
        <td><span class="badge ${estBadgeFac[f.est]||'bn'}">${f.est}</span></td>
        <td style="font-size:12px;color:${overdue(f.vence)&&f.est!=='Pagada'?'var(--red)':'var(--ink3)'};">${fDs(f.vence)}</td>
        <td onclick="event.stopPropagation()"><div style="display:flex;gap:6px;">
          ${f.est !== 'Pagada' ? `<button class="btn btn-g btn-sm" onclick="markPagada(${f.id})" title="Marcar pagada"><i class="fa-solid fa-check"></i></button>` : ''}
          <button class="btn btn-d btn-sm" onclick="delFac(${f.id})"><i class="fa-solid fa-trash"></i></button>
        </div></td></tr>`;
    }).join('') : `<tr><td colspan="6"><div class="empty"><i class="fa-solid fa-file-invoice"></i><p>Sin facturas.</p></div></td></tr>`);

    const pct = total > 0 ? Math.round(pagadas / total * 100) : 0;
    setHTML('fac-resumen', `<div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span style="font-size:12px;color:var(--ink3);">Cobrado vs total</span><span style="font-size:12px;font-weight:600;">${pct}%</span></div>
      <div class="pbar" style="height:10px;"><div class="pbar-fill" style="width:${pct}%;background:${pbGrad('var(--g500)')};"></div></div>
    </div>
    ${[['Total emitido',fM(total),'var(--ink)'],['Cobrado',fM(pagadas),'var(--g500)'],['Pendiente',fM(pend),'var(--amber)'],['Vencido',fM(venc.reduce((s,f)=>s+f.monto,0)),'var(--red)']].map(([l,v,c])=>`<div class="dp-row"><div class="dp-key">${l}</div><div class="dp-val" style="color:${c};font-family:var(--fd);font-weight:600;">${v}</div></div>`).join('')}`);

    const porV = DB.invoices.filter(f => f.est === 'Enviada' || f.est === 'Vencida').sort((a, b) => a.vence > b.vence ? 1 : -1);
    setHTML('fac-vencer', porV.length ? porV.map(f => {
      const cli = getCli(f.cliId); const ov = overdue(f.vence);
      return `<div class="ri" style="gap:10px;">
        <div style="width:7px;height:7px;border-radius:50%;background:${ov?'var(--red)':'var(--amber)'};flex-shrink:0;"></div>
        <div style="flex:1;"><div style="font-size:13px;font-weight:500;">${f.num}</div><div style="font-size:11px;color:var(--ink3);">${cli?.nom||'—'}</div></div>
        <div style="text-align:right;"><div style="font-family:var(--fd);font-size:13px;font-weight:600;">${fM(f.monto)}</div>
        <div style="font-size:11px;color:${ov?'var(--red)':'var(--ink3)'};">${ov?'Vencida':fDs(f.vence)}</div></div>
      </div>`;
    }).join('') : '<div class="empty" style="padding:20px;"><i class="fa-solid fa-check-circle"></i><p>Sin cobros pendientes.</p></div>');
  }

  function buildFacDetail(id) {
    const f = DB.invoices.find(x => x.id === id); if (!f) return '';
    const cli = getCli(f.cliId); const pr = getProy(f.proyId);
    return `<div class="chips">
      <div class="chip"><div class="chip-lbl">Monto</div><div class="chip-val">${fM(f.monto)}</div></div>
      <div class="chip"><div class="chip-lbl">Estado</div><div class="chip-val" style="font-size:14px;">${f.est}</div></div>
    </div>
    <div class="dp-sec"><div class="dp-sec-title">Detalle</div>
      ${dpRow('Cliente',cli?.nom||'—')}${dpRow('Proyecto',pr?.nom||'—')}${dpRow('Emisión',fDate(f.emision))}${dpRow('Vencimiento',fDate(f.vence))}${dpRow('Concepto',f.desc||'—')}
    </div>
    ${f.est !== 'Pagada' ? `<button class="btn btn-p btn-sm" style="margin-top:8px;" onclick="markPagada(${id});closeDetail()"><i class="fa-solid fa-check"></i> Marcar como pagada</button>` : ''}`;
  }

  function markPagada(id) {
    const f = DB.invoices.find(x => x.id === id); if (!f) return;
    f.est = 'Pagada';
    addAct('factura', `Factura ${f.num} cobrada – ${fM(f.monto)}`, 'fa-circle-check', 'var(--g500)');
    showToast(`${f.num} marcada como pagada`, 's'); refresh();
  }

  function saveFac() {
    const cliId = parseInt($('g-ff-cli')?.value) || 0;
    const monto = parseFloat($('g-ff-monto')?.value) || 0;
    if (!cliId || !monto) { showToast('Cliente y monto son requeridos', 'e'); return; }
    const num = `KS-${String(DB.invoices.length + 1).padStart(3, '0')}`;
    DB.invoices.push({ id: DB.nextId++, num, cliId, proyId: parseInt($('g-ff-proy')?.value) || 0, monto, est: $('g-ff-est')?.value, emision: $('g-ff-emision')?.value || todayStr, vence: $('g-ff-vence')?.value, desc: $('g-ff-desc')?.value.trim() });
    addAct('factura', `Factura ${num} emitida – ${fM(monto)}`, 'fa-file-invoice-dollar', 'var(--teal)');
    showToast(`Factura ${num} emitida`, 's'); closeM('factura'); refresh();
  }

  function delFac(id) {
    const f = DB.invoices.find(x => x.id === id); if (!f) return;
    if (!confirm(`¿Eliminar ${f.num}?`)) return;
    DB.invoices = DB.invoices.filter(x => x.id !== id);
    addAct('factura', `Factura ${f.num} eliminada`, 'fa-file-invoice-dollar', 'var(--red)');
    showToast('Eliminada', 'e'); refresh();
  }

  // ── PRESUPUESTOS ──────────────────────────────────────────
  function renderPresupuestos() {
    setText('pre-count', DB.budgets.length);
    setHTML('pre-body', DB.budgets.length ? DB.budgets.map(b => {
      const cli = getCli(b.cliId);
      return `<tr>
        <td style="font-family:var(--fd);font-weight:600;color:var(--g600);">${b.num}</td>
        <td>${cli?.nom || '—'}</td>
        <td style="color:var(--ink3);font-size:12px;">${b.desc}</td>
        <td style="font-family:var(--fd);font-weight:600;">${fM(b.monto)}</td>
        <td><span class="badge ${estBadgePre[b.est]||'bn'}">${b.est}</span></td>
        <td style="font-size:12px;color:${overdue(b.valid)?'var(--red)':'var(--ink3)'};">${fDs(b.valid)}</td>
        <td><div style="display:flex;gap:6px;">
          ${b.est === 'Aprobado' ? `<button class="btn btn-g btn-sm" onclick="convertirFac(${b.id})" title="Convertir a factura"><i class="fa-solid fa-file-invoice-dollar"></i></button>` : ''}
          <button class="btn btn-d btn-sm" onclick="delPre(${b.id})"><i class="fa-solid fa-trash"></i></button>
        </div></td></tr>`;
    }).join('') : `<tr><td colspan="7"><div class="empty"><i class="fa-solid fa-file-lines"></i><p>Sin presupuestos. <button class="btn btn-p btn-sm" onclick="openM('presupuesto')" style="margin-left:8px;">Crear</button></p></div></td></tr>`);
  }

  function savePre() {
    const cliId = parseInt($('g-bf-cli')?.value) || 0;
    const monto = parseFloat($('g-bf-monto')?.value) || 0;
    const desc = $('g-bf-desc')?.value.trim();
    if (!cliId || !monto || !desc) { showToast('Completá los campos requeridos', 'e'); return; }
    const num = `PRE-${String(DB.budgets.length + 1).padStart(3, '0')}`;
    DB.budgets.push({ id: DB.nextId++, num, cliId, monto, desc, est: $('g-bf-est')?.value, valid: $('g-bf-valid')?.value });
    addAct('presupuesto', `Presupuesto ${num} creado – ${fM(monto)}`, 'fa-file-lines', 'var(--purple)');
    showToast(`${num} creado`, 's'); closeM('presupuesto'); refresh();
  }

  function delPre(id) {
    DB.budgets = DB.budgets.filter(b => b.id !== id);
    showToast('Eliminado', 'e'); refresh();
  }

  function convertirFac(id) {
    const b = DB.budgets.find(x => x.id === id); if (!b) return;
    const num = `KS-${String(DB.invoices.length + 1).padStart(3, '0')}`;
    DB.invoices.push({ id: DB.nextId++, num, cliId: b.cliId, proyId: 0, monto: b.monto, est: 'Borrador', emision: todayStr, vence: '', desc: b.desc });
    addAct('factura', `Presupuesto ${b.num} → Factura ${num}`, 'fa-file-invoice-dollar', 'var(--teal)');
    showToast(`Convertido a factura ${num}`, 's'); navigate('facturas');
  }

  // ── HISTORIAL ─────────────────────────────────────────────
  function renderHistorial() {
    let list = [...DB.activity];
    const f = $('hist-fil')?.value || '';
    if (f) list = list.filter(a => a.type === f);
    setText('hist-count', DB.activity.length);
    const el = $('hist-body');
    if (!el) return;
    if (!list.length) { el.innerHTML = '<div class="empty" style="padding:40px 0;"><i class="fa-solid fa-clock-rotate-left"></i><p>Sin actividad registrada aún.</p></div>'; return; }
    el.innerHTML = list.map(a => `<div class="tl-item" style="padding:14px 0;">
      <div class="tl-icon" style="background:${a.col}18;color:${a.col};"><i class="fa-solid ${a.icon}"></i></div>
      <div class="tl-body"><div class="tl-title">${a.msg}</div><div class="tl-time">${a.time}</div></div>
    </div>`).join('');
  }

  function clearGestionHistory() {
    DB.activity = []; renderHistorial(); showToast('Historial limpiado', 's');
  }

  // ── CONFIG ────────────────────────────────────────────────
  function renderConfig() {
    const team = [
      { n: 'Pedro Methol', e: 'pedro@kubosoft.com', rol: 'Admin' },
      { n: 'Laura Gómez', e: 'lgomez@kubosoft.com', rol: 'Gestor' },
      { n: 'Martín Rodríguez', e: 'mrodriguez@kubosoft.com', rol: 'Visualizador' },
    ];
    setHTML('cfg-team', team.map((u, i) => `<div class="ri" style="gap:10px;"><div class="av ${AVC[i]}">${ini(u.n)}</div>
      <div style="flex:1;"><div style="font-size:13px;font-weight:500;">${u.n}</div><div style="font-size:11px;color:var(--ink3);">${u.e}</div></div>
      <span class="badge ${u.rol==='Admin'?'bg':u.rol==='Gestor'?'bb':'bn'}">${u.rol}</span></div>`).join(''));
    setHTML('cfg-tags', ['Desarrollo web','App móvil','Consultoría','Diseño UX','Infraestructura','Marketing','Otro'].map(t => `<span class="tag">${t}</span>`).join(''));
  }

  // ── MOUNT ─────────────────────────────────────────────────
  function __gestionMount() {
    document.querySelectorAll('.gestion-wrap .ni').forEach(b => b.addEventListener('click', () => navigate(b.dataset.view)));
    $('cli-search')?.addEventListener('input', () => { if (currentView === 'clientes') renderClientes(); });
    $('cli-fest')?.addEventListener('change', () => { if (currentView === 'clientes') renderClientes(); });
    $('cli-frub')?.addEventListener('change', () => { if (currentView === 'clientes') renderClientes(); });
    $('proy-search')?.addEventListener('input', () => { if (currentView === 'proyectos') renderProyectos(); });
    $('proy-fest')?.addEventListener('change', () => { if (currentView === 'proyectos') renderProyectos(); });
    $('proy-fcli')?.addEventListener('change', () => { if (currentView === 'proyectos') renderProyectos(); });
    $('tar-search')?.addEventListener('input', () => { if (currentView === 'tareas') renderTareas(); });
    $('tar-fest')?.addEventListener('change', () => { if (currentView === 'tareas') renderTareas(); });
    $('tar-fproy')?.addEventListener('change', () => { if (currentView === 'tareas') renderTareas(); });
    $('tar-fprio')?.addEventListener('change', () => { if (currentView === 'tareas') renderTareas(); });
    $('fac-search')?.addEventListener('input', () => { if (currentView === 'facturas') renderFacturas(); });
    $('fac-fest')?.addEventListener('change', () => { if (currentView === 'facturas') renderFacturas(); });
    $('fac-fcli')?.addEventListener('change', () => { if (currentView === 'facturas') renderFacturas(); });
    $('hist-fil')?.addEventListener('change', () => { if (currentView === 'historial') renderHistorial(); });

    if (!_initialized) {
      _initialized = true;
      addAct('sistema', 'KuboGestión iniciado y listo', 'fa-rocket', 'var(--g500)');
      addAct('factura', 'Factura KS-004 vencida sin cobrar', 'fa-triangle-exclamation', 'var(--red)');
      addAct('proyecto', 'Proyecto "E-commerce B2B" completado', 'fa-check-circle', 'var(--g500)');
    }

    currentView = 'dashboard';
    navigate('dashboard');
  }

  // ── EXPOSE ───────────────────────────────────────────────
  Object.assign(window, {
    navigate, openTopAction, openM, closeM, closeOvl,
    openDetail, closeDetail, openDetailCli, openDetailProy,
    saveCli, editCli, delCli,
    saveProy, editProy, delProy, setProyView,
    saveTar, editTar, delTar, toggleTarea, buildTarDetail,
    saveFac, delFac, markPagada, buildFacDetail,
    savePre, delPre, convertirFac,
    clearGestionHistory, showToast, renderHistorial,
    __gestionMount,
  });

  __gestionMount();
})();
