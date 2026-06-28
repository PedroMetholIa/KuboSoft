(function () {
  // ── CONSTANTS ───────────────────────────────────────────
  const AVC = ['av-a','av-b','av-c','av-d','av-e','av-f','av-g','av-h'];
  const DCOL = {
    Comercial: '#FBBF24', Tecnología: '#3B82F6', Operaciones: '#10B981',
    Marketing: '#8B5CF6', Administración: '#F87171'
  };
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const SHORT_MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  // ── DATA ────────────────────────────────────────────────
  let employees = [
    {id:1,nombre:'Laura',apellido:'Gómez',email:'lgomez@empresa.com',telefono:'+598 99 111 222',dept:'Comercial',cargo:'Gerente de ventas',ingreso:'2022-03-15',contrato:'Tiempo completo',salario:95000,estado:'Activo',notas:'',av:'av-a'},
    {id:2,nombre:'Martín',apellido:'Rodríguez',email:'mrodriguez@empresa.com',telefono:'+598 99 333 444',dept:'Tecnología',cargo:'Desarrollador senior',ingreso:'2021-06-01',contrato:'Tiempo completo',salario:110000,estado:'Activo',notas:'',av:'av-b'},
    {id:3,nombre:'Sofía',apellido:'Fernández',email:'sfernandez@empresa.com',telefono:'+598 99 555 666',dept:'Administración',cargo:'Contadora',ingreso:'2020-01-10',contrato:'Tiempo completo',salario:85000,estado:'Licencia',notas:'',av:'av-c'},
    {id:4,nombre:'Diego',apellido:'Pérez',email:'dperez@empresa.com',telefono:'+598 99 777 888',dept:'Operaciones',cargo:'Coordinador logístico',ingreso:'2023-09-01',contrato:'Tiempo completo',salario:78000,estado:'Activo',notas:'',av:'av-d'},
    {id:5,nombre:'Ana',apellido:'Méndez',email:'amendez@empresa.com',telefono:'+598 99 999 000',dept:'Marketing',cargo:'Diseñadora UX',ingreso:'2025-06-10',contrato:'Tiempo completo',salario:82000,estado:'Onboarding',notas:'',av:'av-e'},
    {id:6,nombre:'Carlos',apellido:'Brum',email:'cbrum@empresa.com',telefono:'+598 99 121 212',dept:'Comercial',cargo:'Ejecutivo de cuentas',ingreso:'2022-11-01',contrato:'Tiempo completo',salario:72000,estado:'Activo',notas:'',av:'av-f'},
    {id:7,nombre:'Valentina',apellido:'Castro',email:'vcastro@empresa.com',telefono:'+598 99 343 434',dept:'Tecnología',cargo:'QA Engineer',ingreso:'2023-02-15',contrato:'Tiempo parcial',salario:60000,estado:'Activo',notas:'',av:'av-g'},
    {id:8,nombre:'Rodrigo',apellido:'Silva',email:'rsilva@empresa.com',telefono:'+598 99 565 656',dept:'Comercial',cargo:'Representante comercial',ingreso:'2024-08-01',contrato:'Tiempo completo',salario:65000,estado:'Onboarding',notas:'',av:'av-h'},
  ];
  let nextId = 9;

  let asistencias = [];
  (function seedAttendance() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const activos = employees.filter(e => e.estado === 'Activo' || e.estado === 'Licencia');
    for (let d = 1; d < today.getDate(); d++) {
      const dt = new Date(year, month, d);
      if (dt.getDay() === 0 || dt.getDay() === 6) continue;
      activos.forEach(emp => {
        const rand = Math.random();
        let estado = 'Presente';
        if (emp.estado === 'Licencia') estado = 'Licencia';
        else if (rand < 0.08) estado = 'Ausente';
        asistencias.push({
          id: asistencias.length + 1, empId: emp.id,
          fecha: `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`,
          estado, entrada: '09:00', salida: '18:00', obs: ''
        });
      });
    }
  })();

  let licencias = [
    {id:1,empId:3,tipo:'Médica',desde:'2025-06-05',hasta:'2025-07-05',motivo:'Recuperación post-cirugía',estado:'Aprobada'},
    {id:2,empId:4,tipo:'Vacaciones',desde:'2025-07-01',hasta:'2025-07-03',motivo:'',estado:'Pendiente'},
    {id:3,empId:2,tipo:'Estudio',desde:'2025-07-15',hasta:'2025-07-31',motivo:'Exámenes universitarios',estado:'Pendiente'},
    {id:4,empId:1,tipo:'Vacaciones',desde:'2025-08-01',hasta:'2025-08-15',motivo:'',estado:'Pendiente'},
  ];
  let nextLicId = 5;

  let evaluaciones = [
    {id:1,empId:1,periodo:'Q2 2025',evaluador:'Pedro Methol',score:4,desempeno:'Destacado',estado:'Pendiente',comments:'Excelente gestión del equipo.'},
    {id:2,empId:2,periodo:'Q2 2025',evaluador:'Pedro Methol',score:5,desempeno:'Destacado',estado:'Pendiente',comments:''},
    {id:3,empId:4,periodo:'Q2 2025',evaluador:'Pedro Methol',score:3,desempeno:'Cumple expectativas',estado:'Pendiente',comments:''},
    {id:4,empId:6,periodo:'Q2 2025',evaluador:'Pedro Methol',score:3,desempeno:'Cumple expectativas',estado:'Completada',comments:'Buen desempeño en general.'},
    {id:5,empId:7,periodo:'Q2 2025',evaluador:'Pedro Methol',score:4,desempeno:'Destacado',estado:'Pendiente',comments:''},
    {id:6,empId:3,periodo:'Q1 2025',evaluador:'Pedro Methol',score:4,desempeno:'Destacado',estado:'Completada',comments:''},
  ];
  let nextEvalId = 7;

  let activities = [
    {color:'ag',text:'<strong>Ana Méndez</strong> completó su onboarding inicial.',time:'Hace 12 min'},
    {color:'ay',text:'<strong>Diego Pérez</strong> solicitó 3 días de licencia.',time:'Hace 1 hora'},
    {color:'ab',text:'Evaluación de <strong>Laura Gómez</strong> enviada para revisión.',time:'Hace 2 horas'},
    {color:'ar',text:'<strong>Martín Rodríguez</strong> marcó asistencia tardía.',time:'Hoy 08:47'},
    {color:'ag',text:'<strong>Carlos Brum</strong> agregado al sistema.',time:'Ayer 17:23'},
  ];
  let pendingReqs = [
    {id:'r1',empId:4,tipo:'Licencia · 3 días · 1–3 Jul'},
    {id:'r2',empId:2,tipo:'Home office · Jul completo'},
    {id:'r3',empId:1,tipo:'Ajuste salarial · +15%'},
  ];

  let currentDetailId = null;
  let currentView = 'dashboard';
  let currentLicTab = 'pendientes';
  let currentEvalTab = 'pendientes';
  let pendingEmpFilter = null;

  let departments = [
    {id:1,nombre:'Comercial',color:'#FBBF24',descripcion:'Ventas y relaciones con clientes',jefe:1},
    {id:2,nombre:'Tecnología',color:'#3B82F6',descripcion:'Desarrollo de software y sistemas',jefe:2},
    {id:3,nombre:'Operaciones',color:'#10B981',descripcion:'Logística y procesos internos',jefe:4},
    {id:4,nombre:'Marketing',color:'#8B5CF6',descripcion:'Comunicación y marca',jefe:5},
    {id:5,nombre:'Administración',color:'#F87171',descripcion:'Finanzas y gestión interna',jefe:3},
  ];
  let nextDeptId = 6;
  let positions = [
    {id:1,nombre:'Gerente de ventas',dept:'Comercial',nivel:'Senior'},
    {id:2,nombre:'Ejecutivo de cuentas',dept:'Comercial',nivel:'Semi-senior'},
    {id:3,nombre:'Desarrollador senior',dept:'Tecnología',nivel:'Senior'},
    {id:4,nombre:'QA Engineer',dept:'Tecnología',nivel:'Semi-senior'},
    {id:5,nombre:'Coordinador logístico',dept:'Operaciones',nivel:'Senior'},
    {id:6,nombre:'Diseñadora UX',dept:'Marketing',nivel:'Semi-senior'},
    {id:7,nombre:'Contadora',dept:'Administración',nivel:'Senior'},
    {id:8,nombre:'Representante comercial',dept:'Comercial',nivel:'Junior'},
  ];
  let nextPosId = 9;

  let documents = [
    {id:1,nombre:'Contrato Laura Gómez.pdf',empId:1,categoria:'Contrato',fecha:'2022-03-15',size:'245 KB',estado:'Vigente'},
    {id:2,nombre:'Contrato Martín Rodríguez.pdf',empId:2,categoria:'Contrato',fecha:'2021-06-01',size:'238 KB',estado:'Vigente'},
    {id:3,nombre:'Certificado médico Sofía.pdf',empId:3,categoria:'Certificado',fecha:'2025-06-05',size:'120 KB',estado:'Vigente'},
    {id:4,nombre:'Evaluación Q1 Carlos Brum.pdf',empId:6,categoria:'Evaluación',fecha:'2025-03-31',size:'98 KB',estado:'Archivado'},
    {id:5,nombre:'Recibo Mayo - Diego Pérez.pdf',empId:4,categoria:'Recibo',fecha:'2025-05-31',size:'76 KB',estado:'Vigente'},
    {id:6,nombre:'Solicitud licencia Sofía.pdf',empId:3,categoria:'Licencia',fecha:'2025-06-04',size:'54 KB',estado:'Vigente'},
    {id:7,nombre:'Contrato Valentina Castro.pdf',empId:7,categoria:'Contrato',fecha:'2023-02-15',size:'241 KB',estado:'Vigente'},
  ];
  let nextDocId = 8;

  let cfgSection = 'empresa';
  const cfgSections = [
    {id:'empresa',icon:'fa-building',label:'Empresa'},
    {id:'notificaciones',icon:'fa-bell',label:'Notificaciones'},
    {id:'usuarios',icon:'fa-user-shield',label:'Usuarios y roles'},
    {id:'liquidacion',icon:'fa-calculator',label:'Liquidación'},
    {id:'integraciones',icon:'fa-plug',label:'Integraciones'},
    {id:'seguridad',icon:'fa-lock',label:'Seguridad'},
  ];
  let cfgData = {
    empresa: {razon:'KuboSoft S.A.',rut:'21.234.567-8',rubro:'Tecnología',pais:'Uruguay',ciudad:'Montevideo',email:'rrhh@kubosoft.com',telefono:'+598 2 123 4567'},
    notif: {nuevos:true,licencias:true,evaluaciones:true,asistencia:false,liquidacion:true,email:true,browser:false},
    liq: {ips:15,irpf:10,diasMes:22,moneda:'UYU'},
    seg: {password2fa:false,sessionTimeout:60,auditLog:true},
  };

  // ── HELPERS ─────────────────────────────────────────────
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const ini = (e) => (e.nombre[0] + (e.apellido[0] || '')).toUpperCase();
  const avCls = (e) => e.av || AVC[(e.id - 1) % AVC.length];
  const pbGrad = col => ({'var(--y400)':'linear-gradient(90deg,var(--y100),var(--y400))','var(--green)':'linear-gradient(90deg,#6EE7B7,var(--green))','var(--red)':'linear-gradient(90deg,#FCA5A5,var(--red))','var(--blue)':'linear-gradient(90deg,#93C5FD,var(--blue))','var(--purple)':'linear-gradient(90deg,#C4B5FD,var(--purple))'}[col] || col);
  const fmtDate = (d) => {
    if (!d) return '—';
    const dt = new Date(d + 'T12:00:00');
    return SHORT_MONTHS[dt.getMonth()] + ' ' + dt.getFullYear();
  };
  const fmtFull = (d) => {
    if (!d) return '—';
    const dt = new Date(d + 'T12:00:00');
    return `${dt.getDate()} ${SHORT_MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
  };
  const fmtSal = (s) => s ? '$' + Number(s).toLocaleString('es-UY') : '—';
  const sbadge = (e) => {
    const m = {Activo:'bg',Licencia:'by',Onboarding:'bb'};
    return `<span class="badge ${m[e]||'bgr'}">${e}</span>`;
  };
  const drow = (k, v) => `<div class="drow"><div class="dkey">${k}</div><div class="dval">${v}</div></div>`;
  const diffDays = (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000) + 1);
  const calcAntig = (ingreso) => {
    if (!ingreso) return '—';
    const ms = Date.now() - new Date(ingreso + 'T12:00:00').getTime();
    const y = Math.floor(ms / (1000 * 60 * 60 * 24 * 365));
    const m = Math.floor((ms % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    return y > 0 ? y + 'a ' + m + 'm' : m + 'm';
  };

  function addAct(color, text, time = 'Ahora mismo') {
    activities.unshift({color, text, time});
    if (activities.length > 20) activities.pop();
  }

  function showToast(msg, type = 's') {
    const c = document.getElementById('tcon');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = `<i class="ticon fa-solid ${type === 's' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>${msg}`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3000);
  }

  function populateSel(id, includeAll = false) {
    const s = document.getElementById(id); if (!s) return;
    const prev = s.value;
    s.innerHTML = (includeAll ? '<option value="">Todos...</option>' : '') +
      employees.map(e => `<option value="${e.id}">${e.nombre} ${e.apellido}</option>`).join('');
    if (prev) s.value = prev;
  }

  function populateMonths(id) {
    const s = document.getElementById(id); if (!s) return;
    s.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}`;
      s.innerHTML += `<option value="${val}">${MONTHS[d.getMonth()]} ${d.getFullYear()}</option>`;
    }
  }

  // ── NAVIGATION ──────────────────────────────────────────
  function filterAndNavigate(status) {
    pendingEmpFilter = status;
    navigate('empleados');
  }

  function navigate(view) {
    document.querySelectorAll('.ni').forEach(i => i.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const tv = !document.getElementById('view-' + view) ? 'soon' : view;
    document.getElementById('view-' + tv)?.classList.add('active');
    currentView = view;
    const titles = {
      dashboard:'Panel general',empleados:'Empleados',onboarding:'Onboarding',
      asistencia:'Asistencia',licencias:'Licencias',liquidacion:'Liquidación',
      evaluaciones:'Evaluaciones',estructura:'Estructura organizacional',
      documentos:'Documentos',reportes:'Reportes',configuracion:'Configuración',
      soon:'Próximamente'
    };
    const el = document.getElementById('tb-title');
    if (el) el.textContent = titles[view] || titles.soon;
    closeDetail();
    if (view === 'dashboard') renderDashboard();
    if (view === 'empleados') renderEmpleados();
    if (view === 'onboarding') renderOnboarding();
    if (view === 'asistencia') { populateSel('a-emp-sel'); populateMonths('a-month-sel'); renderAsistencia(); }
    if (view === 'licencias') renderLicencias();
    if (view === 'liquidacion') { populateSel('liq-emp', true); populateMonths('liq-month'); runLiquidacion(); }
    if (view === 'evaluaciones') renderEvaluaciones();
    if (view === 'estructura') renderEstructura();
    if (view === 'documentos') { populateSel('doc-emp-filt', true); renderDocumentos(); }
    if (view === 'reportes') { populateMonths('rep-month'); renderReportes(); }
    if (view === 'configuracion') renderConfiguracion();
  }

  // ── DASHBOARD ───────────────────────────────────────────
  function renderDashboard() {
    const total = employees.length;
    const act = employees.filter(e => e.estado === 'Activo').length;
    const lic = employees.filter(e => e.estado === 'Licencia').length;
    const onb = employees.filter(e => e.estado === 'Onboarding').length;
    const pendEval = evaluaciones.filter(e => e.estado === 'Pendiente').length;
    const pendLic = licencias.filter(l => l.estado === 'Pendiente').length;
    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setT('d-total', total); setT('d-act', act); setT('d-lic', lic); setT('d-onb', onb);
    const newThisMonth = employees.filter(e => {
      const d = new Date(e.ingreso); return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;
    const delta = document.getElementById('d-delta');
    if (delta) delta.innerHTML = `<i class="fa-solid fa-arrow-up"></i> +${newThisMonth} este mes`;
    const pct = document.getElementById('d-pct');
    if (pct) pct.innerHTML = `<i class="fa-solid fa-arrow-up du"></i> ${Math.round(act / total * 100)}% asistencia`;
    setT('strip-eval-count', pendEval); setT('nb-emp', total); setT('nb-onb', onb);
    setT('nb-lic', pendLic); setT('nb-eval', pendEval);

    const empBody = document.getElementById('d-emp-body');
    if (empBody) {
      const recent = [...employees].slice(-5).reverse();
      empBody.innerHTML = recent.map(e => `<tr onclick="openDetail(${e.id})" style="cursor:pointer">
        <td><div class="einfo"><div class="eavatar ${avCls(e)}">${ini(e)}</div>
          <div><div class="ename">${e.nombre} ${e.apellido}</div><div class="edept">${e.dept}</div></div></div></td>
        <td>${e.cargo}</td><td>${sbadge(e.estado)}</td><td>${fmtDate(e.ingreso)}</td></tr>`).join('');
    }

    const actEl = document.getElementById('d-activity');
    if (actEl) {
      actEl.innerHTML = activities.slice(0, 7).map(a =>
        `<div class="aitem"><div class="adot ${a.color}"></div>
          <div><div class="atext">${a.text}</div><div class="atime">${a.time}</div></div></div>`).join('');
    }

    const dm = {};
    employees.forEach(e => { dm[e.dept] = (dm[e.dept] || 0) + 1; });
    const maxD = Math.max(...Object.values(dm), 1);
    const deptsEl = document.getElementById('d-depts');
    if (deptsEl) {
      deptsEl.innerHTML = Object.entries(dm).sort((a, b) => b[1] - a[1]).map(([d, c]) =>
        `<div class="di"><div class="dc" style="background:${DCOL[d]||'#888'}"></div>
          <div class="dn">${d}</div>
          <div class="dbw"><div class="db" style="width:${Math.round(c/maxD*100)}%;background:${DCOL[d]||'#888'}"></div></div>
          <div class="dct">${c}</div></div>`).join('');
    }
    renderDashRequests();
  }

  function renderDashRequests() {
    const badge = document.getElementById('req-badge');
    const list = document.getElementById('d-requests');
    if (!list) return;
    if (pendingReqs.length === 0) {
      list.innerHTML = '<div class="empty" style="padding:20px;"><i class="fa-solid fa-check-circle" style="color:var(--green);font-size:20px;margin-bottom:6px;"></i><p>Sin solicitudes pendientes</p></div>';
      if (badge) badge.style.display = 'none'; return;
    }
    if (badge) { badge.textContent = pendingReqs.length; badge.style.display = ''; }
    list.innerHTML = pendingReqs.map(r => {
      const emp = employees.find(e => e.id === r.empId); if (!emp) return '';
      return `<div class="ri" id="req-${r.id}">
        <div class="eavatar ${avCls(emp)}" style="width:30px;height:30px;font-size:11px;">${ini(emp)}</div>
        <div class="rinfo"><div class="rname">${emp.nombre} ${emp.apellido}</div><div class="rtype">${r.tipo}</div></div>
        <div class="racts">
          <button class="rappr" onclick="handleReq('${r.id}',true)"><i class="fa-solid fa-check"></i></button>
          <button class="rrej" onclick="handleReq('${r.id}',false)"><i class="fa-solid fa-xmark"></i></button>
        </div></div>`;
    }).join('');
  }

  function handleReq(rid, approve) {
    const req = pendingReqs.find(r => r.id === rid); if (!req) return;
    const emp = employees.find(e => e.id === req.empId);
    const row = document.getElementById('req-' + rid);
    if (row) { row.style.opacity = '0'; row.style.transition = 'opacity .3s'; setTimeout(() => row.remove(), 300); }
    pendingReqs = pendingReqs.filter(r => r.id !== rid);
    addAct(approve ? 'ag' : 'ar', `Solicitud de <strong>${emp?.nombre} ${emp?.apellido}</strong> ${approve ? 'aprobada' : 'rechazada'}.`);
    showToast(approve ? 'Solicitud aprobada' : 'Solicitud rechazada', approve ? 's' : 'e');
    setTimeout(() => { renderDashRequests(); renderDashboard(); }, 350);
  }

  // ── EMPLEADOS ───────────────────────────────────────────
  function renderEmpleados() {
    if (pendingEmpFilter !== null) {
      const fsel = document.getElementById('f-status');
      if (fsel) fsel.value = pendingEmpFilter;
      pendingEmpFilter = null;
    }
    let list = [...employees];
    const s = (document.getElementById('emp-search')?.value || '').toLowerCase();
    const d = document.getElementById('f-dept')?.value || '';
    const st = document.getElementById('f-status')?.value || '';
    if (s) list = list.filter(e => (e.nombre + ' ' + e.apellido + ' ' + e.cargo + ' ' + e.dept).toLowerCase().includes(s));
    if (d) list = list.filter(e => e.dept === d);
    if (st) list = list.filter(e => e.estado === st);
    const cnt = document.getElementById('emp-count');
    if (cnt) cnt.textContent = list.length;
    const tbody = document.getElementById('emp-body');
    if (!tbody) return;
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty"><i class="fa-solid fa-user-slash"></i><p>Sin resultados.</p></div></td></tr>`; return; }
    tbody.innerHTML = list.map(e => `<tr onclick="openDetail(${e.id})" style="cursor:pointer">
      <td><div class="einfo"><div class="eavatar ${avCls(e)}">${ini(e)}</div>
        <div><div class="ename">${e.nombre} ${e.apellido}</div><div class="edept">${e.email}</div></div></div></td>
      <td>${e.cargo}</td><td>${e.dept}</td><td>${fmtDate(e.ingreso)}</td>
      <td>${fmtSal(e.salario)}</td><td>${sbadge(e.estado)}</td>
      <td><div class="ra" onclick="event.stopPropagation()">
        <button class="rb" onclick="openDetail(${e.id})" data-tip="Ver perfil"><i class="fa-solid fa-eye"></i></button>
        <button class="rb" onclick="openEditEmp(${e.id})" data-tip="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="rb danger" onclick="deleteEmp(${e.id})" data-tip="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </div></td></tr>`).join('');
  }

  // ── ONBOARDING ──────────────────────────────────────────
  function renderOnboarding() {
    const list = employees.filter(e => e.estado === 'Onboarding');
    const tbody = document.getElementById('onb-body');
    if (!tbody) return;
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="5"><div class="empty"><i class="fa-solid fa-user-plus"></i><p>No hay empleados en onboarding.</p></div></td></tr>`; return; }
    tbody.innerHTML = list.map(e => {
      const ms = Date.now() - new Date(e.ingreso + 'T12:00:00').getTime();
      const days = Math.floor(ms / 86400000);
      const pct = Math.min(100, Math.round(days / 30 * 100));
      return `<tr>
        <td><div class="einfo"><div class="eavatar ${avCls(e)}">${ini(e)}</div>
          <div><div class="ename">${e.nombre} ${e.apellido}</div><div class="edept">${e.dept}</div></div></div></td>
        <td>${e.cargo}</td><td>${fmtFull(e.ingreso)}</td>
        <td><div style="display:flex;align-items:center;gap:8px;">
          <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${pbGrad('var(--y400)')};border-radius:3px;"></div>
          </div><span style="font-size:12px;color:var(--ink3);min-width:30px;">${pct}%</span></div></td>
        <td><button class="btn btn-g btn-sm" onclick="completeOnb(${e.id})">Completar</button></td></tr>`;
    }).join('');
  }

  function completeOnb(id) {
    const emp = employees.find(e => e.id === id); if (!emp) return;
    emp.estado = 'Activo';
    addAct('ag', `<strong>${emp.nombre} ${emp.apellido}</strong> completó el onboarding y está ahora activo.`);
    showToast(`${emp.nombre} ahora está activo`, 's');
    renderOnboarding(); renderDashboard();
  }

  // ── ASISTENCIA ──────────────────────────────────────────
  function renderAsistencia() {
    const empId = parseInt(document.getElementById('a-emp-sel')?.value) || null;
    const month = document.getElementById('a-month-sel')?.value || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}`;
    const [yr, mo] = month.split('-').map(Number);
    const emp = employees.find(e => e.id === empId);
    const titleEl = document.getElementById('a-cal-title');
    if (titleEl) titleEl.textContent = emp ? `${emp.nombre} ${emp.apellido} · ${MONTHS[mo - 1]} ${yr}` : `${MONTHS[mo - 1]} ${yr}`;

    const firstDay = new Date(yr, mo - 1, 1);
    const lastDay = new Date(yr, mo, 0);
    let startDow = firstDay.getDay(); if (startDow === 0) startDow = 7;
    const cells = [];
    for (let i = 1; i < startDow; i++) { const d = new Date(yr, mo - 1, 1 - (startDow - i)); cells.push({date: d, other: true}); }
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push({date: new Date(yr, mo - 1, d), other: false});
    while (cells.length % 7 !== 0) { const last = cells[cells.length - 1].date; const d = new Date(last); d.setDate(d.getDate() + 1); cells.push({date: d, other: true}); }

    const asMap = {};
    asistencias.filter(a => (!empId || a.empId === empId) && a.fecha.startsWith(month)).forEach(a => {
      asMap[a.empId + '_' + a.fecha] = a;
    });

    const todayD = today.getDate(), todayM = today.getMonth(), todayY = today.getFullYear();
    const grid = document.getElementById('a-cal-grid');
    if (grid) {
      grid.innerHTML = cells.map(cell => {
        const isToday = cell.date.getDate() === todayD && cell.date.getMonth() === todayM && cell.date.getFullYear() === todayY;
        const dow = cell.date.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const ds = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2,'0')}-${String(cell.date.getDate()).padStart(2,'0')}`;
        let cls = 'cal-day' + (cell.other ? ' other-month' : '') + (isToday ? ' today' : '');
        let dot = '';
        if (empId && !isWeekend && !cell.other) {
          const rec = asMap[empId + '_' + ds];
          if (rec) {
            if (rec.estado === 'Presente') { cls += ' present'; dot = '<div class="cal-dot" style="background:var(--green);"></div>'; }
            else if (rec.estado === 'Ausente') { cls += ' absent'; dot = '<div class="cal-dot" style="background:var(--red);"></div>'; }
            else if (rec.estado === 'Licencia') { cls += ' license'; dot = '<div class="cal-dot" style="background:var(--y500);"></div>'; }
            else if (rec.estado === 'Feriado') { cls += ' holiday'; dot = '<div class="cal-dot" style="background:var(--purple);"></div>'; }
          }
        }
        return `<div class="${cls}"><span class="cal-num">${cell.date.getDate()}</span>${dot}</div>`;
      }).join('');
    }

    const monthAs = asistencias.filter(a => (!empId || a.empId === empId) && a.fecha.startsWith(month));
    const pres = monthAs.filter(a => a.estado === 'Presente').length;
    const aus = monthAs.filter(a => a.estado === 'Ausente').length;
    const licD = monthAs.filter(a => a.estado === 'Licencia').length;
    const total = pres + aus + licD || 1;
    const sumEl = document.getElementById('a-summary');
    if (sumEl) {
      sumEl.innerHTML = `<div style="padding:16px 20px;display:flex;flex-direction:column;gap:12px;">
        <div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:13px;color:var(--ink3);">Presentes</span><strong>${pres}</strong></div>
          <div class="pbar"><div class="pbar-fill" style="width:${Math.round(pres/total*100)}%;background:${pbGrad('var(--green)')};"></div></div></div>
        <div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:13px;color:var(--ink3);">Ausentes</span><strong>${aus}</strong></div>
          <div class="pbar"><div class="pbar-fill" style="width:${Math.round(aus/total*100)}%;background:${pbGrad('var(--red)')};"></div></div></div>
        <div><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:13px;color:var(--ink3);">Licencias</span><strong>${licD}</strong></div>
          <div class="pbar"><div class="pbar-fill" style="width:${Math.round(licD/total*100)}%;background:${pbGrad('var(--y400)')};"></div></div></div>
        <div style="border-top:1px solid var(--border);padding-top:10px;font-size:13px;color:var(--ink3);">% asistencia: <strong style="color:var(--ink)">${pres+licD > 0 ? Math.round(pres/(pres+aus||1)*100) : 0}%</strong></div></div>`;
    }

    let recs = asistencias.filter(a => (!empId || a.empId === empId) && a.fecha.startsWith(month)).sort((a, b) => b.fecha.localeCompare(a.fecha));
    const tbody = document.getElementById('a-body');
    if (!tbody) return;
    if (!recs.length) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty"><i class="fa-regular fa-calendar"></i><p>Sin registros para este período.</p></div></td></tr>`; return; }
    tbody.innerHTML = recs.map(a => {
      const e = employees.find(x => x.id === a.empId); if (!e) return '';
      const sc = {Presente:'bg',Ausente:'br',Licencia:'by',Feriado:'bpur'}[a.estado] || 'bgr';
      return `<tr>
        <td><div class="einfo"><div class="eavatar ${avCls(e)}" style="width:28px;height:28px;font-size:10px;">${ini(e)}</div>
          <div class="ename">${e.nombre} ${e.apellido}</div></div></td>
        <td>${fmtFull(a.fecha)}</td><td><span class="badge ${sc}">${a.estado}</span></td>
        <td>${a.estado === 'Presente' ? a.entrada : '—'}</td><td>${a.estado === 'Presente' ? a.salida : '—'}</td>
        <td>${a.obs || '—'}</td>
        <td><div class="ra"><button class="rb danger" onclick="deleteAs(${a.id})" data-tip="Eliminar"><i class="fa-solid fa-trash"></i></button></div></td></tr>`;
    }).join('');
  }

  function saveAsistencia() {
    const empId = parseInt(document.getElementById('a-emp-modal')?.value);
    const fecha = document.getElementById('a-fecha')?.value;
    const estado = document.getElementById('a-estado')?.value;
    const entrada = document.getElementById('a-entrada')?.value;
    const salida = document.getElementById('a-salida')?.value;
    const obs = document.getElementById('a-obs')?.value.trim() || '';
    if (!empId || !fecha) { showToast('Completá los campos requeridos', 'e'); return; }
    asistencias = asistencias.filter(a => !(a.empId === empId && a.fecha === fecha));
    asistencias.push({id: Date.now(), empId, fecha, estado, entrada, salida, obs});
    const emp = employees.find(e => e.id === empId);
    addAct('ag', `Asistencia de <strong>${emp?.nombre} ${emp?.apellido}</strong> registrada: ${estado}.`);
    showToast('Asistencia registrada', 's');
    closeModal('asistencia'); renderAsistencia(); renderDashboard();
  }

  function deleteAs(id) {
    asistencias = asistencias.filter(a => a.id !== id);
    showToast('Registro eliminado', 'e'); renderAsistencia(); renderDashboard();
  }

  // ── LICENCIAS ───────────────────────────────────────────
  function renderLicencias() {
    const lp = licencias.filter(l => l.estado === 'Pendiente').length;
    const lpEl = document.getElementById('lp-count');
    if (lpEl) lpEl.textContent = lp;
    const nbLic = document.getElementById('nb-lic');
    if (nbLic) nbLic.textContent = lp;
    let list = licencias;
    if (currentLicTab === 'pendientes') list = licencias.filter(l => l.estado === 'Pendiente');
    else if (currentLicTab === 'aprobadas') list = licencias.filter(l => l.estado === 'Aprobada');
    const titleEl = document.getElementById('lic-panel-title');
    if (titleEl) titleEl.textContent = currentLicTab === 'pendientes' ? 'Solicitudes pendientes' : currentLicTab === 'aprobadas' ? 'Licencias aprobadas' : 'Historial completo';
    const tbody = document.getElementById('lic-body');
    if (!tbody) return;
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty"><i class="fa-solid fa-umbrella-beach"></i><p>Sin registros.</p></div></td></tr>`; return; }
    tbody.innerHTML = list.map(l => {
      const emp = employees.find(e => e.id === l.empId); if (!emp) return '';
      const dias = diffDays(l.desde, l.hasta);
      const sc = {Pendiente:'by',Aprobada:'bg',Rechazada:'br'}[l.estado] || 'bgr';
      const acts = l.estado === 'Pendiente'
        ? `<button class="rappr" onclick="approveLic(${l.id})" data-tip="Aprobar"><i class="fa-solid fa-check"></i></button><button class="rrej" onclick="rejectLic(${l.id})" data-tip="Rechazar"><i class="fa-solid fa-xmark"></i></button>`
        : `<span style="font-size:12px;color:var(--ink4);">${l.estado}</span>`;
      return `<tr>
        <td><div class="einfo"><div class="eavatar ${avCls(emp)}" style="width:28px;height:28px;font-size:10px;">${ini(emp)}</div>
          <div class="ename">${emp.nombre} ${emp.apellido}</div></div></td>
        <td>${l.tipo}</td><td>${fmtFull(l.desde)}</td><td>${fmtFull(l.hasta)}</td><td>${dias}</td>
        <td><span class="badge ${sc}">${l.estado}</span></td>
        <td><div class="ra">${acts}<button class="rb danger" onclick="deleteLic(${l.id})" data-tip="Eliminar"><i class="fa-solid fa-trash"></i></button></div></td></tr>`;
    }).join('');
  }

  function approveLic(id) {
    const l = licencias.find(x => x.id === id); if (!l) return;
    l.estado = 'Aprobada';
    const emp = employees.find(e => e.id === l.empId);
    if (emp && l.tipo !== 'Vacaciones') emp.estado = 'Licencia';
    addAct('ag', `Licencia de <strong>${emp?.nombre} ${emp?.apellido}</strong> aprobada.`);
    showToast('Licencia aprobada', 's'); renderLicencias(); renderDashboard();
  }

  function rejectLic(id) {
    const l = licencias.find(x => x.id === id); if (!l) return;
    l.estado = 'Rechazada';
    const emp = employees.find(e => e.id === l.empId);
    addAct('ar', `Licencia de <strong>${emp?.nombre} ${emp?.apellido}</strong> rechazada.`);
    showToast('Licencia rechazada', 'e'); renderLicencias(); renderDashboard();
  }

  function deleteLic(id) { licencias = licencias.filter(l => l.id !== id); showToast('Solicitud eliminada', 'e'); renderLicencias(); }

  function saveLicencia() {
    const empId = parseInt(document.getElementById('l-emp')?.value);
    const tipo = document.getElementById('l-tipo')?.value;
    const desde = document.getElementById('l-desde')?.value;
    const hasta = document.getElementById('l-hasta')?.value;
    const motivo = document.getElementById('l-motivo')?.value.trim() || '';
    if (!empId || !desde || !hasta) { showToast('Completá los campos requeridos', 'e'); return; }
    if (desde > hasta) { showToast('La fecha de inicio debe ser anterior al fin', 'e'); return; }
    licencias.push({id: nextLicId++, empId, tipo, desde, hasta, motivo, estado: 'Pendiente'});
    const emp = employees.find(e => e.id === empId);
    addAct('ay', `<strong>${emp?.nombre} ${emp?.apellido}</strong> solicitó licencia por ${tipo}.`);
    pendingReqs.push({id: 'r' + Date.now(), empId, tipo: `${tipo} · ${diffDays(desde, hasta)} días`});
    showToast('Solicitud creada', 's'); closeModal('licencia'); renderLicencias(); renderDashboard();
  }

  // ── LIQUIDACION ─────────────────────────────────────────
  function getWorkingDays(yr, mo) {
    const last = new Date(yr, mo, 0).getDate(); let wd = 0;
    for (let d = 1; d <= last; d++) { const dow = new Date(yr, mo - 1, d).getDay(); if (dow !== 0 && dow !== 6) wd++; }
    return wd;
  }

  function runLiquidacion() {
    const monthVal = document.getElementById('liq-month')?.value;
    const empFilt = parseInt(document.getElementById('liq-emp')?.value) || null;
    if (!monthVal) return;
    const [yr, mo] = monthVal.split('-').map(Number);
    const wd = getWorkingDays(yr, mo);
    let list = employees.filter(e => e.estado !== 'Onboarding');
    if (empFilt) list = list.filter(e => e.id === empFilt);

    let totalBruto = 0, totalLiq = 0;
    const rows = list.map(emp => {
      const monthAs = asistencias.filter(a => a.empId === emp.id && a.fecha.startsWith(monthVal));
      const pres = monthAs.filter(a => a.estado === 'Presente').length;
      const aus = monthAs.filter(a => a.estado === 'Ausente').length;
      const licD = monthAs.filter(a => a.estado === 'Licencia').length;
      const bruto = emp.salario || 0;
      const descuento = aus > 0 ? Math.round(bruto / wd * aus) : 0;
      const liquido = bruto - descuento;
      totalBruto += bruto; totalLiq += liquido;
      return {emp, pres, aus, licD, wd, bruto, liquido, descuento};
    });

    const metricsEl = document.getElementById('liq-metrics');
    if (metricsEl) {
      metricsEl.innerHTML = `
        <div class="mc acc"><div class="mt"><div class="mlbl">Total bruto</div><div class="mi"><i class="fa-solid fa-money-bill-wave"></i></div></div><div class="mv">${fmtSal(totalBruto)}</div><div class="mdelta">${list.length} empleados</div></div>
        <div class="mc"><div class="mt"><div class="mlbl">Total líquido</div><div class="mi mi-g"><i class="fa-solid fa-circle-check"></i></div></div><div class="mv">${fmtSal(totalLiq)}</div><div class="mdelta du"><i class="fa-solid fa-arrow-up"></i> A pagar</div></div>
        <div class="mc"><div class="mt"><div class="mlbl">Descuentos</div><div class="mi mi-r"><i class="fa-solid fa-arrow-down"></i></div></div><div class="mv">${fmtSal(totalBruto - totalLiq)}</div><div class="mdelta dd">Por ausencias</div></div>
        <div class="mc"><div class="mt"><div class="mlbl">Días hábiles</div><div class="mi mi-b"><i class="fa-solid fa-calendar"></i></div></div><div class="mv">${wd}</div><div class="mdelta">${MONTHS[mo - 1]} ${yr}</div></div>`;
    }

    const tbody = document.getElementById('liq-body');
    if (!tbody) return;
    if (!rows.length) { tbody.innerHTML = `<tr><td colspan="8"><div class="empty"><i class="fa-solid fa-calculator"></i><p>Sin empleados para liquidar.</p></div></td></tr>`; return; }
    tbody.innerHTML = rows.map(r => `<tr>
      <td><div class="einfo"><div class="eavatar ${avCls(r.emp)}">${ini(r.emp)}</div>
        <div><div class="ename">${r.emp.nombre} ${r.emp.apellido}</div></div></div></td>
      <td>${r.emp.dept}</td><td>${fmtSal(r.bruto)}</td>
      <td><span style="font-weight:500;color:var(--green);">${r.pres}</span>/${r.wd}</td>
      <td>${r.aus > 0 ? `<span style="color:var(--red);font-weight:600;">${r.aus}</span>` : '0'}</td>
      <td>${r.licD}</td>
      <td><strong>${fmtSal(r.liquido)}</strong>${r.descuento > 0 ? `<span style="font-size:11px;color:var(--red);margin-left:6px;">-${fmtSal(r.descuento)}</span>` : ''}</td>
      <td><button class="btn btn-g btn-sm" onclick="showRecibo(${r.emp.id},'${monthVal}')"><i class="fa-solid fa-file-lines"></i> Recibo</button></td></tr>`).join('');
  }

  function showRecibo(empId, month) {
    const emp = employees.find(e => e.id === empId); if (!emp) return;
    const [yr, mo] = month.split('-').map(Number);
    const wd = getWorkingDays(yr, mo);
    const monthAs = asistencias.filter(a => a.empId === empId && a.fecha.startsWith(month));
    const pres = monthAs.filter(a => a.estado === 'Presente').length;
    const aus = monthAs.filter(a => a.estado === 'Ausente').length;
    const bruto = emp.salario || 0;
    const descAus = aus > 0 ? Math.round(bruto / wd * aus) : 0;
    const liquido = bruto - descAus;
    const ips = Math.round(bruto * 0.15);
    const irpf = Math.round(bruto * 0.10);
    const neto = liquido - ips - irpf;
    const titleEl = document.getElementById('rec-title');
    if (titleEl) titleEl.textContent = `Recibo · ${emp.nombre} ${emp.apellido} · ${MONTHS[mo - 1]} ${yr}`;
    const bodyEl = document.getElementById('rec-body');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
          <div class="eavatar ${avCls(emp)}" style="width:44px;height:44px;font-size:15px;">${ini(emp)}</div>
          <div><div style="font-family:var(--fd);font-size:16px;font-weight:700;">${emp.nombre} ${emp.apellido}</div>
          <div style="font-size:13px;color:var(--ink3);">${emp.cargo} · ${emp.dept}</div></div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
          <div style="font-size:12px;color:var(--ink3);">Período: <strong style="color:var(--ink);">${MONTHS[mo - 1]} ${yr}</strong></div>
          <div style="font-size:12px;color:var(--ink3);">Contrato: <strong style="color:var(--ink);">${emp.contrato || '—'}</strong></div>
          <div style="font-size:12px;color:var(--ink3);">Días hábiles: <strong style="color:var(--ink);">${wd}</strong></div>
          <div style="font-size:12px;color:var(--ink3);">Días trabajados: <strong style="color:var(--ink);">${pres}</strong></div></div>
        <div class="payslip">
          <div class="pay-row"><span class="pay-lbl">Salario base</span><span class="pay-val">${fmtSal(bruto)}</span></div>
          ${descAus > 0 ? `<div class="pay-row"><span class="pay-lbl" style="color:var(--red);">Descuento por ausencias (${aus} día${aus > 1 ? 's' : ''})</span><span class="pay-val" style="color:var(--red);">-${fmtSal(descAus)}</span></div>` : ''}
          <div class="pay-row"><span class="pay-lbl">Subtotal</span><span class="pay-val">${fmtSal(liquido)}</span></div>
          <div class="pay-row"><span class="pay-lbl">BPS / IPS (15%)</span><span class="pay-val" style="color:var(--red);">-${fmtSal(ips)}</span></div>
          <div class="pay-row"><span class="pay-lbl">IRPF estimado (10%)</span><span class="pay-val" style="color:var(--red);">-${fmtSal(irpf)}</span></div>
          <div class="pay-row pay-total"><span>Total neto a cobrar</span><span style="color:var(--green);">${fmtSal(neto)}</span></div></div>`;
    }
    document.getElementById('modal-recibo')?.classList.add('open');
  }

  function exportLiq() { showToast('Exportación lista (simulada)', 's'); }

  // ── EVALUACIONES ────────────────────────────────────────
  function renderEvaluaciones() {
    const pend = evaluaciones.filter(e => e.estado === 'Pendiente').length;
    const epEl = document.getElementById('ep-count'); if (epEl) epEl.textContent = pend;
    const nbEl = document.getElementById('nb-eval'); if (nbEl) nbEl.textContent = pend;
    const stripEl = document.getElementById('strip-eval-count'); if (stripEl) stripEl.textContent = pend;
    let list = evaluaciones;
    if (currentEvalTab === 'pendientes') list = evaluaciones.filter(e => e.estado === 'Pendiente');
    else list = evaluaciones.filter(e => e.estado === 'Completada');
    const titleEl = document.getElementById('eval-panel-title');
    if (titleEl) titleEl.textContent = currentEvalTab === 'pendientes' ? 'Evaluaciones pendientes' : 'Evaluaciones completadas';
    const tbody = document.getElementById('eval-body');
    if (!tbody) return;
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="6"><div class="empty"><i class="fa-solid fa-star"></i><p>Sin evaluaciones en esta categoría.</p></div></td></tr>`; return; }
    tbody.innerHTML = list.map(ev => {
      const emp = employees.find(e => e.id === ev.empId); if (!emp) return '';
      const stars = '★'.repeat(ev.score) + '★'.repeat(5 - ev.score);
      const dc = {Destacado:'bg','Cumple expectativas':'by','A mejorar':'br'}[ev.desempeno] || 'bgr';
      const acts = ev.estado === 'Pendiente'
        ? `<button class="btn btn-p btn-sm" onclick="completeEval(${ev.id})"><i class="fa-solid fa-check"></i> Completar</button><button class="rb" onclick="openEditEval(${ev.id})" style="margin-left:4px;" data-tip="Editar"><i class="fa-solid fa-pen"></i></button>`
        : `<button class="rb" onclick="openEditEval(${ev.id})" data-tip="Editar"><i class="fa-solid fa-pen"></i></button>`;
      return `<tr>
        <td><div class="einfo"><div class="eavatar ${avCls(emp)}" style="width:30px;height:30px;font-size:11px;">${ini(emp)}</div>
          <div><div class="ename">${emp.nombre} ${emp.apellido}</div><div class="edept">${emp.dept}</div></div></div></td>
        <td>${ev.periodo}</td><td>${ev.evaluador}</td>
        <td><span style="color:var(--y500);letter-spacing:1px;">${stars}</span></td>
        <td><span class="badge ${dc}">${ev.desempeno}</span></td>
        <td><div class="ra">${acts}<button class="rb danger" onclick="deleteEval(${ev.id})" data-tip="Eliminar" style="margin-left:2px;"><i class="fa-solid fa-trash"></i></button></div></td></tr>`;
    }).join('');
  }

  function completeEval(id) {
    const ev = evaluaciones.find(e => e.id === id); if (!ev) return;
    ev.estado = 'Completada';
    const emp = employees.find(e => e.id === ev.empId);
    addAct('ag', `Evaluación de <strong>${emp?.nombre} ${emp?.apellido}</strong> completada.`);
    showToast('Evaluación completada', 's'); renderEvaluaciones(); renderDashboard();
  }

  function deleteEval(id) { evaluaciones = evaluaciones.filter(e => e.id !== id); showToast('Evaluación eliminada', 'e'); renderEvaluaciones(); renderDashboard(); }

  function openEditEval(id) {
    const ev = evaluaciones.find(e => e.id === id); if (!ev) return;
    populateSel('ev-emp');
    document.getElementById('meval-id').value = id;
    const titleEl = document.getElementById('meval-title'); if (titleEl) titleEl.textContent = 'Editar evaluación';
    document.getElementById('ev-emp').value = ev.empId;
    document.getElementById('ev-periodo').value = ev.periodo;
    document.getElementById('ev-eval').value = ev.evaluador;
    document.getElementById('ev-score').value = ev.score;
    document.getElementById('ev-des').value = ev.desempeno;
    document.getElementById('ev-status').value = ev.estado;
    document.getElementById('ev-comments').value = ev.comments || '';
    updateStars(ev.score);
    document.getElementById('modal-eval')?.classList.add('open');
  }

  function saveEval() {
    const empId = parseInt(document.getElementById('ev-emp')?.value);
    const periodo = document.getElementById('ev-periodo')?.value.trim();
    const evaluador = document.getElementById('ev-eval')?.value.trim();
    const score = parseInt(document.getElementById('ev-score')?.value) || 3;
    const desempeno = document.getElementById('ev-des')?.value;
    const estado = document.getElementById('ev-status')?.value;
    const comments = document.getElementById('ev-comments')?.value.trim() || '';
    if (!empId || !periodo) { showToast('Completá los campos requeridos', 'e'); return; }
    const editId = parseInt(document.getElementById('meval-id')?.value) || null;
    const emp = employees.find(e => e.id === empId);
    if (editId) {
      const ev = evaluaciones.find(e => e.id === editId); if (ev) Object.assign(ev, {empId, periodo, evaluador, score, desempeno, estado, comments});
      addAct('ab', `Evaluación de <strong>${emp?.nombre} ${emp?.apellido}</strong> actualizada.`); showToast('Evaluación actualizada', 's');
    } else {
      evaluaciones.push({id: nextEvalId++, empId, periodo, evaluador, score, desempeno, estado, comments});
      addAct('ab', `Nueva evaluación creada para <strong>${emp?.nombre} ${emp?.apellido}</strong>.`); showToast('Evaluación creada', 's');
    }
    closeModal('eval'); renderEvaluaciones(); renderDashboard();
  }

  function updateStars(val) {
    document.querySelectorAll('#ev-stars .star').forEach(s => {
      s.classList.toggle('on', parseInt(s.dataset.v) <= val);
    });
  }

  // ── EMPLOYEE CRUD ────────────────────────────────────────
  function openModal(type) {
    if (type === 'dept') {
      document.getElementById('md-id').value = '';
      document.getElementById('md-nombre').value = '';
      document.getElementById('md-desc').value = '';
      document.getElementById('md-color').value = '#FBBF24';
      populateSel('md-jefe', true);
      document.getElementById('modal-dept')?.classList.add('open'); return;
    }
    if (type === 'position') {
      document.getElementById('mp-nombre').value = '';
      document.getElementById('mp-dept').value = '';
      document.getElementById('modal-position')?.classList.add('open'); return;
    }
    if (type === 'doc') {
      populateSel('doc-emp');
      document.getElementById('doc-nombre').value = '';
      document.getElementById('doc-fecha').value = todayStr;
      document.getElementById('modal-doc')?.classList.add('open'); return;
    }
    if (type === 'emp') {
      document.getElementById('memp-id').value = '';
      const titleEl = document.getElementById('memp-title'); if (titleEl) titleEl.textContent = 'Agregar empleado';
      const btnEl = document.getElementById('memp-btn-lbl'); if (btnEl) btnEl.textContent = 'Guardar';
      ['e-nom','e-ape','e-email','e-tel','e-cargo','e-notas'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      ['e-dept','e-contrato'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
      const ei = document.getElementById('e-ingreso'); if (ei) ei.value = todayStr;
      const ee = document.getElementById('e-estado'); if (ee) ee.value = 'Onboarding';
      const es = document.getElementById('e-salario'); if (es) es.value = '';
      document.getElementById('modal-emp')?.classList.add('open');
    }
    if (type === 'asistencia') {
      populateSel('a-emp-modal');
      const af = document.getElementById('a-fecha'); if (af) af.value = todayStr;
      document.getElementById('modal-asistencia')?.classList.add('open');
    }
    if (type === 'licencia') {
      populateSel('l-emp');
      const ld = document.getElementById('l-desde'); if (ld) ld.value = todayStr;
      document.getElementById('modal-licencia')?.classList.add('open');
    }
    if (type === 'eval') {
      populateSel('ev-emp');
      document.getElementById('meval-id').value = '';
      const titleEl = document.getElementById('meval-title'); if (titleEl) titleEl.textContent = 'Nueva evaluación';
      document.getElementById('ev-periodo').value = `Q${Math.ceil((today.getMonth() + 1) / 3)} ${today.getFullYear()}`;
      document.getElementById('ev-eval').value = 'Pedro Methol';
      document.getElementById('ev-score').value = 3; updateStars(3);
      document.getElementById('ev-des').value = 'Cumple expectativas';
      document.getElementById('ev-status').value = 'Pendiente';
      document.getElementById('ev-comments').value = '';
      document.getElementById('modal-eval')?.classList.add('open');
    }
  }

  function closeModal(type) { document.getElementById('modal-' + type)?.classList.remove('open'); }
  function closeOnOverlay(e, id) { if (e.target === document.getElementById(id)) closeModal(id.replace('modal-','')); }

  function openEditEmp(id) {
    const emp = employees.find(e => e.id === id); if (!emp) return;
    document.getElementById('memp-id').value = id;
    const titleEl = document.getElementById('memp-title'); if (titleEl) titleEl.textContent = 'Editar empleado';
    const btnEl = document.getElementById('memp-btn-lbl'); if (btnEl) btnEl.textContent = 'Guardar cambios';
    document.getElementById('e-nom').value = emp.nombre;
    document.getElementById('e-ape').value = emp.apellido;
    document.getElementById('e-email').value = emp.email;
    document.getElementById('e-tel').value = emp.telefono || '';
    document.getElementById('e-dept').value = emp.dept;
    document.getElementById('e-cargo').value = emp.cargo;
    document.getElementById('e-ingreso').value = emp.ingreso || '';
    document.getElementById('e-contrato').value = emp.contrato || '';
    document.getElementById('e-estado').value = emp.estado;
    document.getElementById('e-salario').value = emp.salario || '';
    document.getElementById('e-notas').value = emp.notas || '';
    document.getElementById('modal-emp')?.classList.add('open');
  }

  function saveEmp() {
    const id = document.getElementById('memp-id')?.value;
    const nombre = document.getElementById('e-nom')?.value.trim();
    const apellido = document.getElementById('e-ape')?.value.trim();
    const dept = document.getElementById('e-dept')?.value;
    const cargo = document.getElementById('e-cargo')?.value.trim();
    if (!nombre || !apellido || !dept || !cargo) { showToast('Completá los campos requeridos', 'e'); return; }
    const data = {
      nombre, apellido, email: document.getElementById('e-email')?.value.trim() || '',
      telefono: document.getElementById('e-tel')?.value.trim() || '', dept, cargo,
      ingreso: document.getElementById('e-ingreso')?.value || '',
      contrato: document.getElementById('e-contrato')?.value || '',
      estado: document.getElementById('e-estado')?.value || 'Activo',
      salario: Number(document.getElementById('e-salario')?.value) || 0,
      notas: document.getElementById('e-notas')?.value.trim() || ''
    };
    if (id) {
      const idx = employees.findIndex(e => e.id === Number(id));
      if (idx > -1) employees[idx] = {...employees[idx], ...data};
      addAct('ay', `Perfil de <strong>${nombre} ${apellido}</strong> actualizado.`); showToast('Empleado actualizado', 's');
    } else {
      employees.push({id: nextId++, av: AVC[(nextId - 2) % AVC.length], ...data});
      addAct('ag', `<strong>${nombre} ${apellido}</strong> agregado al sistema.`); showToast('Empleado agregado', 's');
    }
    closeModal('emp'); closeDetail();
    renderDashboard();
    if (currentView === 'empleados') renderEmpleados();
    if (currentView === 'onboarding') renderOnboarding();
    if (currentView === 'liquidacion') runLiquidacion();
  }

  function deleteEmp(id) {
    const emp = employees.find(e => e.id === id); if (!emp) return;
    if (!confirm(`¿Eliminar a ${emp.nombre} ${emp.apellido}? Esta acción es irreversible.`)) return;
    employees = employees.filter(e => e.id !== id);
    asistencias = asistencias.filter(a => a.empId !== id);
    licencias = licencias.filter(l => l.empId !== id);
    evaluaciones = evaluaciones.filter(e => e.empId !== id);
    addAct('ar', `<strong>${emp.nombre} ${emp.apellido}</strong> eliminado del sistema.`);
    showToast('Empleado eliminado', 'e'); closeDetail();
    renderDashboard(); if (currentView === 'empleados') renderEmpleados();
  }

  // ── DETAIL PANEL ────────────────────────────────────────
  function openDetail(id) {
    const emp = employees.find(e => e.id === id); if (!emp) return;
    currentDetailId = id;
    const av = document.getElementById('dp-av');
    if (av) { av.className = 'eavatar ' + avCls(emp); av.style.cssText = 'width:42px;height:42px;font-size:14px;'; av.textContent = ini(emp); }
    const nameEl = document.getElementById('dp-name'); if (nameEl) nameEl.textContent = emp.nombre + ' ' + emp.apellido;
    const subEl = document.getElementById('dp-sub'); if (subEl) subEl.textContent = emp.cargo + ' · ' + emp.dept;
    const badgeEl = document.getElementById('dp-badge'); if (badgeEl) badgeEl.innerHTML = sbadge(emp.estado);
    const chipsEl = document.getElementById('dp-chips');
    if (chipsEl) chipsEl.innerHTML = `<div class="chip"><div class="chipl">Salario</div><div class="chipv">${fmtSal(emp.salario)}</div></div><div class="chip"><div class="chipl">Antigüedad</div><div class="chipv">${calcAntig(emp.ingreso)}</div></div>`;
    const infoEl = document.getElementById('dp-info');
    if (infoEl) infoEl.innerHTML = drow('Email', emp.email) + drow('Teléfono', emp.telefono || '—') + drow('Notas', emp.notas || '—');
    const contEl = document.getElementById('dp-contract');
    if (contEl) contEl.innerHTML = drow('Tipo', emp.contrato || '—') + drow('Ingreso', fmtFull(emp.ingreso)) + drow('Estado', emp.estado);
    const mStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}`;
    const mAs = asistencias.filter(a => a.empId === id && a.fecha.startsWith(mStr));
    const attEl = document.getElementById('dp-attendance');
    if (attEl) attEl.innerHTML = drow('Presentes', mAs.filter(a => a.estado === 'Presente').length) + drow('Ausentes', mAs.filter(a => a.estado === 'Ausente').length) + drow('Licencia', mAs.filter(a => a.estado === 'Licencia').length);
    const delBtn = document.getElementById('dp-del'); if (delBtn) delBtn.onclick = () => deleteEmp(id);
    document.getElementById('detail-panel')?.classList.add('open');
  }

  function closeDetail() { document.getElementById('detail-panel')?.classList.remove('open'); currentDetailId = null; }
  function openEditFromDetail() { if (currentDetailId) openEditEmp(currentDetailId); }

  // ── ESTRUCTURA ──────────────────────────────────────────
  function renderEstructura() {
    const deptCountEl = document.getElementById('dept-count-lbl'); if (deptCountEl) deptCountEl.textContent = departments.length;
    const deptListEl = document.getElementById('dept-list-full');
    if (deptListEl) {
      deptListEl.innerHTML = departments.map(d => {
        const members = employees.filter(e => e.dept === d.nombre);
        const jefe = employees.find(e => e.id === d.jefe);
        return `<div class="di" style="flex-direction:column;align-items:flex-start;gap:6px;padding:14px 20px;">
          <div style="display:flex;align-items:center;gap:10px;width:100%;">
            <div style="width:12px;height:12px;border-radius:3px;background:${d.color};flex-shrink:0;"></div>
            <div style="font-size:13px;font-weight:600;color:var(--ink);flex:1;">${d.nombre}</div>
            <span class="badge bgr">${members.length} personas</span>
            <div class="ra">
              <button class="rb" onclick="editDept(${d.id})" data-tip="Editar"><i class="fa-solid fa-pen"></i></button>
              <button class="rb danger" onclick="deleteDept(${d.id})" data-tip="Eliminar"><i class="fa-solid fa-trash"></i></button>
            </div></div>
          <div style="font-size:12px;color:var(--ink3);padding-left:22px;">${d.descripcion}</div>
          ${jefe ? `<div style="font-size:12px;color:var(--ink4);padding-left:22px;"><i class="fa-solid fa-user-tie" style="margin-right:4px;"></i>Jefe: ${jefe.nombre} ${jefe.apellido}</div>` : ''}</div>`;
      }).join('');
    }

    const posCountEl = document.getElementById('pos-count-lbl'); if (posCountEl) posCountEl.textContent = positions.length;
    const posListEl = document.getElementById('pos-list');
    if (posListEl) {
      posListEl.innerHTML = positions.map(p => {
        const count = employees.filter(e => e.cargo === p.nombre).length;
        const lvlColor = {Senior:'bg','Semi-senior':'by',Junior:'bb'}[p.nivel] || 'bgr';
        return `<div class="di">
          <div style="flex:1;"><div style="font-size:13px;font-weight:500;color:var(--ink);">${p.nombre}</div><div style="font-size:12px;color:var(--ink3);">${p.dept}</div></div>
          <span class="badge ${lvlColor}" style="margin-right:8px;">${p.nivel}</span>
          <span style="font-size:12px;color:var(--ink4);">${count} emp.</span>
          <div class="ra" style="margin-left:8px;"><button class="rb danger" onclick="deletePos(${p.id})" data-tip="Eliminar"><i class="fa-solid fa-trash"></i></button></div></div>`;
      }).join('');
    }

    const deptMap = {};
    employees.forEach(e => { deptMap[e.dept] = deptMap[e.dept] || []; deptMap[e.dept].push(e); });
    const orgEl = document.getElementById('org-chart');
    if (orgEl) {
      orgEl.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:16px;">
        ${departments.map(d => {
          const members = deptMap[d.nombre] || [];
          const jefe = employees.find(e => e.id === d.jefe);
          return `<div style="border:1px solid var(--border);border-radius:12px;overflow:hidden;min-width:180px;flex:1;">
            <div style="background:${d.color}22;border-bottom:2px solid ${d.color};padding:10px 14px;">
              <div style="font-size:13px;font-weight:700;color:var(--ink);">${d.nombre}</div>
              ${jefe ? `<div style="font-size:11px;color:var(--ink3);">Jefe: ${jefe.nombre} ${jefe.apellido}</div>` : ''}
            </div>
            <div style="padding:8px;">
              ${members.length === 0 ? '<div style="font-size:12px;color:var(--ink4);padding:6px;">Sin empleados</div>' :
                members.map(m => `<div style="display:flex;align-items:center;gap:8px;padding:5px 4px;border-radius:6px;" onmouseover="this.style.background='var(--y50)'" onmouseout="this.style.background=''">
                  <div class="eavatar ${avCls(m)}" style="width:24px;height:24px;font-size:9px;flex-shrink:0;">${ini(m)}</div>
                  <div><div style="font-size:12px;font-weight:500;color:var(--ink);">${m.nombre} ${m.apellido}</div><div style="font-size:10px;color:var(--ink3);">${m.cargo}</div></div></div>`).join('')}
            </div></div>`;
        }).join('')}
      </div>`;
    }
  }

  function deleteDept(id) {
    const d = departments.find(x => x.id === id); if (!d) return;
    if (!confirm(`¿Eliminar departamento "${d.nombre}"?`)) return;
    departments = departments.filter(x => x.id !== id);
    showToast('Departamento eliminado', 'e'); renderEstructura();
  }

  function editDept(id) {
    const d = departments.find(x => x.id === id); if (!d) return;
    document.getElementById('md-id').value = id;
    document.getElementById('md-nombre').value = d.nombre;
    document.getElementById('md-desc').value = d.descripcion;
    document.getElementById('md-color').value = d.color;
    populateSel('md-jefe', true);
    document.getElementById('md-jefe').value = d.jefe || '';
    document.getElementById('modal-dept')?.classList.add('open');
  }

  function deletePos(id) { positions = positions.filter(p => p.id !== id); showToast('Cargo eliminado', 'e'); renderEstructura(); }

  function saveDept() {
    const id = parseInt(document.getElementById('md-id')?.value) || null;
    const nombre = document.getElementById('md-nombre')?.value.trim();
    const desc = document.getElementById('md-desc')?.value.trim() || '';
    const color = document.getElementById('md-color')?.value || '#FBBF24';
    const jefe = parseInt(document.getElementById('md-jefe')?.value) || null;
    if (!nombre) { showToast('El nombre es requerido', 'e'); return; }
    if (id) { const d = departments.find(x => x.id === id); if (d) Object.assign(d, {nombre, descripcion: desc, color, jefe}); showToast('Departamento actualizado', 's'); }
    else { departments.push({id: nextDeptId++, nombre, descripcion: desc, color, jefe}); showToast('Departamento creado', 's'); }
    closeModal('dept'); renderEstructura();
  }

  function savePos() {
    const nombre = document.getElementById('mp-nombre')?.value.trim();
    const dept = document.getElementById('mp-dept')?.value;
    const nivel = document.getElementById('mp-nivel')?.value;
    if (!nombre || !dept) { showToast('Completá los campos requeridos', 'e'); return; }
    positions.push({id: nextPosId++, nombre, dept, nivel});
    showToast('Cargo creado', 's'); closeModal('position'); renderEstructura();
  }

  // ── DOCUMENTOS ──────────────────────────────────────────
  function renderDocumentos() {
    const search = (document.getElementById('doc-search')?.value || '').toLowerCase();
    const cat = document.getElementById('doc-cat')?.value || '';
    const empF = parseInt(document.getElementById('doc-emp-filt')?.value) || null;
    let list = [...documents];
    if (search) list = list.filter(d => d.nombre.toLowerCase().includes(search));
    if (cat) list = list.filter(d => d.categoria === cat);
    if (empF) list = list.filter(d => d.empId === empF);
    const cntEl = document.getElementById('doc-count'); if (cntEl) cntEl.textContent = list.length;
    const tbody = document.getElementById('doc-body');
    if (!tbody) return;
    if (!list.length) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty"><i class="fa-solid fa-folder-open"></i><p>Sin documentos.</p></div></td></tr>`; return; }
    const catIcon = {Contrato:'fa-file-contract',Certificado:'fa-certificate','Evaluación':'fa-star',Licencia:'fa-umbrella-beach',Recibo:'fa-receipt',Otro:'fa-file'};
    tbody.innerHTML = list.map(d => {
      const emp = employees.find(e => e.id === d.empId);
      const ic = catIcon[d.categoria] || 'fa-file';
      const sc = d.estado === 'Vigente' ? 'bg' : 'bgr';
      return `<tr>
        <td><div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;border-radius:8px;background:var(--y100);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid ${ic}" style="font-size:13px;color:var(--y700);"></i></div>
          <div style="font-size:13px;font-weight:500;color:var(--ink);">${d.nombre}</div></div></td>
        <td>${emp ? `<div class="einfo"><div class="eavatar ${avCls(emp)}" style="width:24px;height:24px;font-size:9px;">${ini(emp)}</div><span style="font-size:13px;">${emp.nombre} ${emp.apellido}</span></div>` : '—'}</td>
        <td><span class="badge bb">${d.categoria}</span></td>
        <td>${fmtFull(d.fecha)}</td><td style="color:var(--ink3);font-size:12px;">${d.size}</td>
        <td><span class="badge ${sc}">${d.estado}</span></td>
        <td><div class="ra">
          <button class="rb" onclick="showToast('Descargando...','s')" data-tip="Descargar"><i class="fa-solid fa-download"></i></button>
          <button class="rb" onclick="archiveDoc(${d.id})" data-tip="Archivar"><i class="fa-solid fa-box-archive"></i></button>
          <button class="rb danger" onclick="deleteDoc(${d.id})" data-tip="Eliminar"><i class="fa-solid fa-trash"></i></button>
        </div></td></tr>`;
    }).join('');
  }

  function archiveDoc(id) {
    const d = documents.find(x => x.id === id); if (!d) return;
    d.estado = d.estado === 'Archivado' ? 'Vigente' : 'Archivado';
    showToast(d.estado === 'Archivado' ? 'Documento archivado' : 'Documento restaurado', 's'); renderDocumentos();
  }

  function deleteDoc(id) { documents = documents.filter(d => d.id !== id); showToast('Documento eliminado', 'e'); renderDocumentos(); }

  function saveDoc() {
    const nombre = document.getElementById('doc-nombre')?.value.trim();
    const empId = parseInt(document.getElementById('doc-emp')?.value);
    const categoria = document.getElementById('doc-categoria')?.value;
    const fecha = document.getElementById('doc-fecha')?.value;
    if (!nombre || !empId || !categoria || !fecha) { showToast('Completá los campos requeridos', 'e'); return; }
    documents.push({id: nextDocId++, nombre, empId, categoria, fecha, size: '—', estado: 'Vigente'});
    const emp = employees.find(e => e.id === empId);
    addAct('ab', `Documento <strong>${nombre}</strong> subido para ${emp?.nombre} ${emp?.apellido}.`);
    showToast('Documento registrado', 's'); closeModal('doc'); renderDocumentos();
  }

  // ── REPORTES ────────────────────────────────────────────
  function renderReportes() {
    const monthVal = document.getElementById('rep-month')?.value;
    if (!monthVal) return;
    const [yr, mo] = monthVal.split('-').map(Number);
    const total = employees.length;
    const act = employees.filter(e => e.estado === 'Activo').length;
    const lic = employees.filter(e => e.estado === 'Licencia').length;
    const masa = employees.reduce((s, e) => s + (e.salario || 0), 0);
    const pendEv = evaluaciones.filter(e => e.estado === 'Pendiente').length;

    const repMEl = document.getElementById('rep-metrics');
    if (repMEl) {
      repMEl.innerHTML = `
        <div class="mc acc"><div class="mt"><div class="mlbl">Total empleados</div><div class="mi"><i class="fa-solid fa-users"></i></div></div><div class="mv">${total}</div><div class="mdelta">${act} activos · ${lic} licencias</div></div>
        <div class="mc"><div class="mt"><div class="mlbl">Masa salarial</div><div class="mi mi-g"><i class="fa-solid fa-money-bill-wave"></i></div></div><div class="mv" style="font-size:20px;">${fmtSal(masa)}</div><div class="mdelta du">Bruto mensual</div></div>
        <div class="mc"><div class="mt"><div class="mlbl">Docs activos</div><div class="mi mi-b"><i class="fa-solid fa-file-lines"></i></div></div><div class="mv">${documents.filter(d => d.estado === 'Vigente').length}</div><div class="mdelta" style="color:var(--ink3);">${documents.length} en total</div></div>
        <div class="mc"><div class="mt"><div class="mlbl">Eval. pendientes</div><div class="mi mi-r"><i class="fa-solid fa-star"></i></div></div><div class="mv">${pendEv}</div><div class="mdelta dd">${pendEv > 0 ? 'Requieren atención' : 'Al día'}</div></div>`;
    }

    const monthAs = asistencias.filter(a => a.fecha.startsWith(monthVal));
    const deptAs = {};
    departments.forEach(d => { deptAs[d.nombre] = {p: 0, a: 0, total: 0}; });
    monthAs.forEach(a => {
      const emp = employees.find(e => e.id === a.empId);
      if (!emp || !deptAs[emp.dept]) return;
      if (a.estado === 'Presente') deptAs[emp.dept].p++;
      else if (a.estado === 'Ausente') deptAs[emp.dept].a++;
      deptAs[emp.dept].total++;
    });
    const deptBarsEl = document.getElementById('rep-dept-bars');
    if (deptBarsEl) {
      deptBarsEl.innerHTML = departments.map(d => {
        const s = deptAs[d.nombre]; const pct = s.total > 0 ? Math.round(s.p / s.total * 100) : 0;
        return `<div>
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span style="font-size:13px;font-weight:500;color:var(--ink);">${d.nombre}</span><span style="font-size:12px;color:var(--ink3);">${pct}% asistencia</span></div>
          <div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:${d.color};"></div></div>
          <div style="font-size:11px;color:var(--ink4);margin-top:3px;">${s.p} presentes · ${s.a} ausentes</div></div>`;
      }).join('');
    }

    const onb = employees.filter(e => e.estado === 'Onboarding').length;
    const statusEl = document.getElementById('rep-status-chart');
    if (statusEl) {
      const estados = [{lbl:'Activos',v:act,col:'var(--green)'},{lbl:'Licencia',v:lic,col:'var(--y400)'},{lbl:'Onboarding',v:onb,col:'var(--blue)'}];
      statusEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:14px;">
        ${estados.map(e => `<div>
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span style="font-size:13px;font-weight:500;">${e.lbl}</span><span style="font-size:13px;font-weight:700;color:var(--ink);">${e.v} <span style="font-weight:400;color:var(--ink3);">(${total > 0 ? Math.round(e.v/total*100) : 0}%)</span></span></div>
          <div class="pbar" style="height:12px;"><div class="pbar-fill" style="width:${total > 0 ? Math.round(e.v/total*100) : 0}%;background:${e.col};"></div></div></div>`).join('')}
      </div>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--ink4);margin-bottom:10px;">Por departamento</div>
        ${departments.map(d => {
          const cnt = employees.filter(e => e.dept === d.nombre).length;
          return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${d.color};flex-shrink:0;"></div>
            <span style="font-size:12px;flex:1;">${d.nombre}</span>
            <span style="font-size:12px;font-weight:600;">${cnt}</span></div>`;
        }).join('')}
      </div>`;
    }

    const deptSal = {};
    employees.forEach(e => { deptSal[e.dept] = (deptSal[e.dept] || 0) + (e.salario || 0); });
    const maxSal = Math.max(...Object.values(deptSal), 1);
    const salBarsEl = document.getElementById('rep-salary-bars');
    if (salBarsEl) {
      salBarsEl.innerHTML = Object.entries(deptSal).sort((a, b) => b[1] - a[1]).map(([dept, sal]) => {
        const d = departments.find(x => x.nombre === dept);
        const col = d ? d.color : '#888';
        return `<div>
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span style="font-size:13px;font-weight:500;">${dept}</span><span style="font-size:12px;font-weight:600;">${fmtSal(sal)}</span></div>
          <div class="pbar"><div class="pbar-fill" style="width:${Math.round(sal/maxSal*100)}%;background:${col};"></div></div></div>`;
      }).join('');
    }

    const evTot = evaluaciones.length;
    const evComp = evaluaciones.filter(e => e.estado === 'Completada').length;
    const evPend = evaluaciones.filter(e => e.estado === 'Pendiente').length;
    const avgScore = evTot > 0 ? (evaluaciones.reduce((s, e) => s + e.score, 0) / evTot).toFixed(1) : '—';
    const evalSumEl = document.getElementById('rep-eval-summary');
    if (evalSumEl) {
      evalSumEl.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        <div class="chip"><div class="chipl">Total evaluaciones</div><div class="chipv">${evTot}</div></div>
        <div class="chip"><div class="chipl">Puntaje promedio</div><div class="chipv">${avgScore} ★</div></div>
        <div class="chip"><div class="chipl">Completadas</div><div class="chipv" style="color:var(--green);">${evComp}</div></div>
        <div class="chip"><div class="chipl">Pendientes</div><div class="chipv" style="color:var(--red);">${evPend}</div></div></div>
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--ink4);margin-bottom:10px;">Distribución por desempeño</div>
      ${['Destacado','Cumple expectativas','A mejorar'].map(lbl => {
        const cnt = evaluaciones.filter(e => e.desempeno === lbl).length;
        const pct = evTot > 0 ? Math.round(cnt / evTot * 100) : 0;
        const col = {Destacado:'var(--green)','Cumple expectativas':'var(--y400)','A mejorar':'var(--red)'}[lbl];
        return `<div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:12px;">${lbl}</span><span style="font-size:12px;font-weight:600;">${cnt}</span></div>
          <div class="pbar"><div class="pbar-fill" style="width:${pct}%;background:${col};"></div></div></div>`;
      }).join('')}`;
    }
  }

  // ── CONFIGURACION ───────────────────────────────────────
  function renderConfiguracion() {
    const menuEl = document.getElementById('cfg-menu');
    if (menuEl) {
      menuEl.innerHTML = cfgSections.map(s =>
        `<div class="ni ${cfgSection === s.id ? 'active' : ''}" style="margin:4px 8px;border-radius:6px;" onclick="setCfgSection('${s.id}')">
          <i class="nic fa-solid ${s.icon}"></i> ${s.label}</div>`).join('');
    }
    renderCfgContent();
  }

  function setCfgSection(id) { cfgSection = id; renderConfiguracion(); }

  function renderCfgContent() {
    const el = document.getElementById('cfg-content'); if (!el) return;
    if (cfgSection === 'empresa') {
      el.innerHTML = `<div class="panel"><div class="ph"><div class="ptitle">Datos de la empresa</div><button class="btn btn-p btn-sm" onclick="saveCfgEmpresa()"><i class="fa-solid fa-check"></i> Guardar</button></div>
        <div class="mbody"><div class="fgrid">
          <div class="fg"><label class="fl">Razón social</label><input class="fi" id="cfg-razon" value="${cfgData.empresa.razon}"></div>
          <div class="fg"><label class="fl">RUT</label><input class="fi" id="cfg-rut" value="${cfgData.empresa.rut}"></div>
          <div class="fg"><label class="fl">Rubro</label><input class="fi" id="cfg-rubro" value="${cfgData.empresa.rubro}"></div>
          <div class="fg"><label class="fl">País</label><input class="fi" id="cfg-pais" value="${cfgData.empresa.pais}"></div>
          <div class="fg"><label class="fl">Ciudad</label><input class="fi" id="cfg-ciudad" value="${cfgData.empresa.ciudad}"></div>
          <div class="fg"><label class="fl">Email RRHH</label><input class="fi" id="cfg-email" value="${cfgData.empresa.email}"></div>
          <div class="fg ffull"><label class="fl">Teléfono</label><input class="fi" id="cfg-tel" value="${cfgData.empresa.telefono}"></div>
        </div></div></div>`;
    } else if (cfgSection === 'notificaciones') {
      const n = cfgData.notif;
      const tog = (id, val, lbl) => `<div class="drow" style="padding:14px 20px;">
        <div><div style="font-size:13px;font-weight:500;">${lbl}</div></div>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
          <div onclick="toggleNotif('${id}')" style="width:40px;height:22px;border-radius:11px;background:${val ? 'var(--y400)' : 'var(--border2)'};position:relative;transition:background .2s;cursor:pointer;">
            <div style="position:absolute;top:3px;left:${val ? '20' : '3'}px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s;"></div>
          </div>
          <span style="font-size:12px;color:var(--ink3);">${val ? 'Activado' : 'Desactivado'}</span></label></div>`;
      el.innerHTML = `<div class="panel"><div class="ph"><div class="ptitle">Notificaciones</div></div>
        ${tog('nuevos',n.nuevos,'Nuevos empleados')}
        ${tog('licencias',n.licencias,'Solicitudes de licencia')}
        ${tog('evaluaciones',n.evaluaciones,'Evaluaciones pendientes')}
        ${tog('asistencia',n.asistencia,'Alertas de asistencia')}
        ${tog('liquidacion',n.liquidacion,'Liquidación mensual')}
        <div style="padding:12px 20px;background:var(--y50);border-top:1px solid var(--border);">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--ink4);margin-bottom:10px;">Canal</div>
          ${tog('email',n.email,'Notificaciones por email')}
          ${tog('browser',n.browser,'Notificaciones del navegador')}</div></div>`;
    } else if (cfgSection === 'usuarios') {
      const roles = [
        {nombre:'Pedro Methol',email:'pedro@kubosoft.com',rol:'Administrador',ultimo:'Hoy 09:12'},
        {nombre:'Laura Gómez',email:'lgomez@empresa.com',rol:'Manager',ultimo:'Hace 2h'},
        {nombre:'Sofía Fernández',email:'sfernandez@empresa.com',rol:'Visualizador',ultimo:'Ayer'},
      ];
      el.innerHTML = `<div class="panel"><div class="ph"><div class="ptitle">Usuarios con acceso</div><button class="btn btn-p btn-sm" onclick="showToast('Invitación enviada','s')"><i class="fa-solid fa-user-plus"></i> Invitar usuario</button></div>
        <table class="et"><thead><tr><th>Usuario</th><th>Rol</th><th>Último acceso</th><th></th></tr></thead><tbody>
        ${roles.map(r => `<tr>
          <td><div class="einfo"><div style="width:32px;height:32px;border-radius:50%;background:var(--y100);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--y700);">${r.nombre.split(' ').map(x => x[0]).join('')}</div>
            <div><div class="ename">${r.nombre}</div><div class="edept">${r.email}</div></div></div></td>
          <td><span class="badge ${r.rol === 'Administrador' ? 'bpur' : r.rol === 'Manager' ? 'bb' : 'bgr'}">${r.rol}</span></td>
          <td style="font-size:12px;color:var(--ink3);">${r.ultimo}</td>
          <td><button class="rb" onclick="showToast('Rol actualizado','s')" data-tip="Cambiar rol"><i class="fa-solid fa-pen"></i></button></td></tr>`).join('')}
        </tbody></table></div>`;
    } else if (cfgSection === 'liquidacion') {
      const l = cfgData.liq;
      el.innerHTML = `<div class="panel"><div class="ph"><div class="ptitle">Parámetros de liquidación</div><button class="btn btn-p btn-sm" onclick="saveCfgLiq()"><i class="fa-solid fa-check"></i> Guardar</button></div>
        <div class="mbody"><div class="fgrid">
          <div class="fg"><label class="fl">BPS / IPS (%)</label><input class="fi" id="cfg-ips" type="number" value="${l.ips}"></div>
          <div class="fg"><label class="fl">IRPF estimado (%)</label><input class="fi" id="cfg-irpf" type="number" value="${l.irpf}"></div>
          <div class="fg"><label class="fl">Días hábiles por defecto</label><input class="fi" id="cfg-dias" type="number" value="${l.diasMes}"></div>
          <div class="fg"><label class="fl">Moneda</label><select class="fi" id="cfg-moneda"><option ${l.moneda === 'UYU' ? 'selected' : ''}>UYU</option><option ${l.moneda === 'USD' ? 'selected' : ''}>USD</option></select></div>
        </div>
        <div style="margin-top:16px;padding:12px 0;border-top:1px solid var(--border);">
          <div style="font-size:12px;color:var(--ink3);">Vista previa: Salario $80.000 → BPS -$${Math.round(80000 * l.ips / 100).toLocaleString('es-UY')} → IRPF -$${Math.round(80000 * l.irpf / 100).toLocaleString('es-UY')} → Neto <strong>$${(80000 - Math.round(80000 * l.ips / 100) - Math.round(80000 * l.irpf / 100)).toLocaleString('es-UY')}</strong></div>
        </div></div></div>`;
    } else if (cfgSection === 'integraciones') {
      const ints = [
        {nombre:'Google Workspace',desc:'Sincronización de calendario y email',icon:'fa-google',conn:true},
        {nombre:'Slack',desc:'Notificaciones de RRHH en canales',icon:'fa-slack',conn:false},
        {nombre:'Zapier',desc:'Automatizaciones con apps externas',icon:'fa-bolt',conn:false},
        {nombre:'DGI Uruguay',desc:'Exportación de datos fiscales',icon:'fa-landmark',conn:false},
      ];
      el.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px;">
        ${ints.map(i => `<div class="panel"><div style="display:flex;align-items:center;gap:14px;padding:16px 20px;">
          <div style="width:40px;height:40px;border-radius:10px;background:var(--y100);display:flex;align-items:center;justify-content:center;">
            <i class="fa-brands ${i.icon}" style="font-size:18px;color:var(--y700);"></i></div>
          <div style="flex:1;"><div style="font-size:14px;font-weight:600;">${i.nombre}</div><div style="font-size:12px;color:var(--ink3);">${i.desc}</div></div>
          <button class="btn ${i.conn ? 'btn-d' : 'btn-p'} btn-sm" onclick="showToast('${i.conn ? 'Desconectado' : 'Conectado'}: ${i.nombre}','s')">
            ${i.conn ? '<i class="fa-solid fa-unlink"></i> Desconectar' : '<i class="fa-solid fa-link"></i> Conectar'}
          </button></div></div>`).join('')}</div>`;
    } else if (cfgSection === 'seguridad') {
      el.innerHTML = `<div class="panel"><div class="ph"><div class="ptitle">Seguridad</div></div>
        <div class="drow" style="padding:16px 20px;"><div><div style="font-size:13px;font-weight:500;">Autenticación en dos pasos</div><div style="font-size:12px;color:var(--ink3);">Requiere código de verificación al ingresar</div></div>
          <button class="btn btn-g btn-sm" onclick="showToast('2FA configurado','s')">Configurar</button></div>
        <div class="drow" style="padding:16px 20px;"><div><div style="font-size:13px;font-weight:500;">Tiempo de sesión</div><div style="font-size:12px;color:var(--ink3);">Cerrar sesión automáticamente después de inactividad</div></div>
          <select class="fsel" style="padding:5px 10px;"><option>30 min</option><option selected>60 min</option><option>2 horas</option><option>8 horas</option></select></div>
        <div class="drow" style="padding:16px 20px;"><div><div style="font-size:13px;font-weight:500;">Registro de auditoría</div><div style="font-size:12px;color:var(--ink3);">Registrar todas las acciones del sistema</div></div>
          <span class="badge bg">Activo</span></div>
        <div style="padding:16px 20px;border-top:1px solid var(--border);">
          <button class="btn btn-d btn-sm" onclick="showToast('Contraseña actualizada','s')"><i class="fa-solid fa-key"></i> Cambiar contraseña</button></div></div>`;
    }
  }

  function toggleNotif(id) { cfgData.notif[id] = !cfgData.notif[id]; renderCfgContent(); }

  function saveCfgEmpresa() {
    cfgData.empresa.razon = document.getElementById('cfg-razon')?.value || '';
    cfgData.empresa.rut = document.getElementById('cfg-rut')?.value || '';
    cfgData.empresa.rubro = document.getElementById('cfg-rubro')?.value || '';
    cfgData.empresa.pais = document.getElementById('cfg-pais')?.value || '';
    cfgData.empresa.ciudad = document.getElementById('cfg-ciudad')?.value || '';
    cfgData.empresa.email = document.getElementById('cfg-email')?.value || '';
    cfgData.empresa.telefono = document.getElementById('cfg-tel')?.value || '';
    showToast('Datos de empresa actualizados', 's');
  }

  function saveCfgLiq() {
    cfgData.liq.ips = parseFloat(document.getElementById('cfg-ips')?.value) || 15;
    cfgData.liq.irpf = parseFloat(document.getElementById('cfg-irpf')?.value) || 10;
    cfgData.liq.diasMes = parseInt(document.getElementById('cfg-dias')?.value) || 22;
    cfgData.liq.moneda = document.getElementById('cfg-moneda')?.value || 'UYU';
    showToast('Parámetros de liquidación guardados', 's'); renderCfgContent();
  }

  // ── MOUNT ───────────────────────────────────────────────
  function __rrhhMount() {
    document.querySelectorAll('.ni').forEach(item => item.addEventListener('click', () => navigate(item.dataset.view)));
    document.getElementById('emp-search')?.addEventListener('input', renderEmpleados);
    document.getElementById('f-dept')?.addEventListener('change', renderEmpleados);
    document.getElementById('f-status')?.addEventListener('change', renderEmpleados);
    document.getElementById('a-emp-sel')?.addEventListener('change', renderAsistencia);
    document.getElementById('a-month-sel')?.addEventListener('change', renderAsistencia);
    document.querySelectorAll('[data-ltab]').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('[data-ltab]').forEach(x => x.classList.remove('active'));
      t.classList.add('active'); currentLicTab = t.dataset.ltab; renderLicencias();
    }));
    document.querySelectorAll('[data-etab]').forEach(t => t.addEventListener('click', () => {
      document.querySelectorAll('[data-etab]').forEach(x => x.classList.remove('active'));
      t.classList.add('active'); currentEvalTab = t.dataset.etab; renderEvaluaciones();
    }));
    document.querySelectorAll('#ev-stars .star').forEach(s => {
      s.addEventListener('click', () => {
        const v = parseInt(s.dataset.v);
        const scoreEl = document.getElementById('ev-score'); if (scoreEl) scoreEl.value = v;
        updateStars(v);
      });
    });
    document.getElementById('liq-month')?.addEventListener('change', runLiquidacion);
    document.getElementById('liq-emp')?.addEventListener('change', runLiquidacion);
    document.getElementById('doc-search')?.addEventListener('input', renderDocumentos);
    document.getElementById('doc-cat')?.addEventListener('change', renderDocumentos);
    document.getElementById('doc-emp-filt')?.addEventListener('change', renderDocumentos);
    document.getElementById('rep-month')?.addEventListener('change', renderReportes);
    renderDashboard();
  }

  // ── EXPOSE TO WINDOW ────────────────────────────────────
  Object.assign(window, {
    navigate, filterAndNavigate, openModal, closeModal, closeOnOverlay,
    openDetail, closeDetail, openEditFromDetail, openEditEmp, saveEmp, deleteEmp,
    completeOnb, saveAsistencia, deleteAs,
    approveLic, rejectLic, deleteLic, saveLicencia,
    completeEval, deleteEval, openEditEval, saveEval,
    handleReq, runLiquidacion, showRecibo, exportLiq,
    editDept, deleteDept, deletePos, saveDept, savePos,
    archiveDoc, deleteDoc, saveDoc, renderReportes,
    setCfgSection, toggleNotif, saveCfgEmpresa, saveCfgLiq, showToast,
    __rrhhMount,
  });

  __rrhhMount();
})();
