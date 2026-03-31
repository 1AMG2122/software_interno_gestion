import { useEffect, useMemo, useState, useRef } from "react";

type Priority = "baja" | "media" | "alta";
type Status = "abierta" | "en progreso" | "en espera" | "resuelta" | "cerrada";
type Role = "empleado" | "responsable" | "administrador";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatar: string;
  createdAt: string;
}

interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

interface HistoryEvent {
  id: string;
  type: "creada" | "estado" | "asignacion" | "comentario" | "edicion";
  actorId: string;
  at: string;
  meta?: Record<string, any>;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  category?: string;
  priority: Priority;
  status: Status;
  reporterId: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  history: HistoryEvent[];
}

type FilterState = {
  q: string;
  status: Status | "todas";
  priority: Priority | "todas";
  assignee: string | "todos";
  reporter: string | "todos";
  from?: string;
  to?: string;
};

const STORAGE_KEY = "gius-data-v1";

const defaultUsers: User[] = [
  {
    id: "u-admin",
    name: "Ana admin",
    email: "admin@gius.test",
    password: "admin123",
    role: "administrador",
    avatar: "A",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u-tech",
    name: "Carlos técnico",
    email: "tecnico@gius.test",
    password: "tec123",
    role: "responsable",
    avatar: "C",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u-emp",
    name: "Lucía empleado",
    email: "empleado@gius.test",
    password: "emp123",
    role: "empleado",
    avatar: "L",
    createdAt: new Date().toISOString(),
  },
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" });
}

function relativeTime(iso: string) {
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const divisions: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let duration = Math.abs(diff);
  let unit: Intl.RelativeTimeFormatUnit = "second";
  for (let i = 0; i < divisions.length; i++) {
    const [amount, nextUnit] = divisions[i];
    if (duration < amount) {
      unit = nextUnit;
      break;
    }
    duration = duration / amount;
  }
  const value = Math.round(diff / (duration === 0 ? 1 : duration));
  return rtf.format(value, unit);
}

function clsx(...xs: (string | false | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

function PriorityPill({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    alta: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    media: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    baja: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  };
  const label = priority.charAt(0).toUpperCase() + priority.slice(1);
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", map[priority])}>
      <span className="mr-1 h-1.5 w-1.5 rounded-full" style={{background:"currentColor",opacity:0.8}}/>
      {label}
    </span>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    abierta: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200",
    "en progreso": "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
    "en espera": "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    resuelta: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    cerrada: "bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-200",
  };
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", map[status])}>
      {status}
    </span>
  );
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map(s => s[0]?.toUpperCase() ?? "")
    .slice(0,2)
    .join("");
  return (
    <div
      className="grid place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-medium shadow-sm"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {initials || "?"}
    </div>
  );
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.users && parsed.incidents) return parsed;
    }
  } catch {}
  // seed demo incidents
  const now = Date.now();
  const demo: Incident[] = [
    {
      id: "inc-1",
      title: "Impresora 2ª planta no imprime",
      description: "Desde esta mañana la impresora láser de la segunda planta muestra error 49.4C02 y no responde.",
      category: "Hardware",
      priority: "alta",
      status: "abierta",
      reporterId: "u-emp",
      assigneeId: "u-tech",
      createdAt: new Date(now - 1000 * 60 * 60 * 26).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      comments: [
        { id: "c1", authorId: "u-tech", text: "Paso a recogerla esta tarde.", createdAt: new Date(now - 1000 * 60 * 60 * 3).toISOString() },
      ],
      history: [
        { id: "h1", type: "creada", actorId: "u-emp", at: new Date(now - 1000 * 60 * 60 * 26).toISOString() },
        { id: "h2", type: "asignacion", actorId: "u-admin", at: new Date(now - 1000 * 60 * 60 * 24).toISOString(), meta: { to: "u-tech" } },
      ],
    },
    {
      id: "inc-2",
      title: "Solicitud acceso a carpeta Marketing",
      description: "Necesito acceso de lectura a \\Servidor\Marketing\Campañas Q2. Gracias.",
      category: "Accesos",
      priority: "media",
      status: "en progreso",
      reporterId: "u-emp",
      assigneeId: "u-tech",
      createdAt: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 10).toISOString(),
      comments: [],
      history: [
        { id: "h3", type: "creada", actorId: "u-emp", at: new Date(now - 1000 * 60 * 60 * 8).toISOString() },
        { id: "h4", type: "estado", actorId: "u-tech", at: new Date(now - 1000 * 60 * 60 * 1).toISOString(), meta: { from: "abierta", to: "en progreso" } },
      ],
    },
    {
      id: "inc-3",
      title: "Error en aplicación interna al generar PDF",
      description: "Al exportar informe en PDF aparece 'null reference' y se cierra.",
      category: "Software",
      priority: "alta",
      status: "en espera",
      reporterId: "u-emp",
      assigneeId: "u-tech",
      createdAt: new Date(now - 1000 * 60 * 60 * 40).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      comments: [
        { id: "c2", authorId: "u-emp", text: "Adjunto pantallazo al correo.", createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString() },
      ],
      history: [
        { id: "h5", type: "creada", actorId: "u-emp", at: new Date(now - 1000 * 60 * 60 * 40).toISOString() },
        { id: "h6", type: "estado", actorId: "u-tech", at: new Date(now - 1000 * 60 * 60 * 6).toISOString(), meta: { from: "en progreso", to: "en espera" } },
      ],
    },
    {
      id: "inc-4",
      title: "Petición de ratón inalámbrico",
      description: "Ratón actual se desconecta continuamente.",
      category: "Material",
      priority: "baja",
      status: "resuelta",
      reporterId: "u-emp",
      assigneeId: "u-admin",
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      comments: [],
      history: [
        { id: "h7", type: "creada", actorId: "u-emp", at: new Date(now - 1000 * 60 * 60 * 72).toISOString() },
        { id: "h8", type: "estado", actorId: "u-admin", at: new Date(now - 1000 * 60 * 60 * 48).toISOString(), meta: { from: "abierta", to: "resuelta" } },
      ],
    },
  ];
  return { users: defaultUsers, incidents: demo, currentUserId: null as string | null };
}

function saveData(data: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function App() {
  const [data, setData] = useState(loadData);
  const [currentUserId, setCurrentUserId] = useState<string | null>(data.currentUserId);
  const [view, setView] = useState<"login" | "dashboard" | "list" | "detail" | "users">("login");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    status: "todas",
    priority: "todas",
    assignee: "todos",
    reporter: "todos",
  });
  const [showNew, setShowNew] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const currentUser = useMemo(() => data.users.find((u: User) => u.id === currentUserId) || null, [data.users, currentUserId]);
  const incidents = data.incidents;

  // persist
  useEffect(() => {
    saveData({ ...data, currentUserId });
  }, [data, currentUserId]);

  // Auto-login if remembered
  useEffect(() => {
    if (currentUserId) setView("dashboard");
  }, []);

  const login = (email: string, password: string) => {
    const user = data.users.find((u: User) => u.email === email && u.password === password);
    if (user) {
      setCurrentUserId(user.id);
      setView("dashboard");
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUserId(null);
    setView("login");
  };

  const addIncident = (payload: Pick<Incident, "title" | "description" | "priority" | "category"> & { assigneeId?: string }) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const inc: Incident = {
      id: "inc-" + uid(),
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: payload.category?.trim() || undefined,
      priority: payload.priority,
      status: "abierta",
      reporterId: currentUser.id,
      assigneeId: payload.assigneeId || undefined,
      createdAt: now,
      updatedAt: now,
      comments: [],
      history: [
        { id: "h-" + uid(), type: "creada", actorId: currentUser.id, at: now },
        ...(payload.assigneeId ? [{ id: "h-" + uid(), type: "asignacion" as const, actorId: currentUser.id, at: now, meta: { to: payload.assigneeId } }] : []),
      ],
    };
    setData((d: any) => ({ ...d, incidents: [inc, ...d.incidents] }));
    setShowNew(false);
    setSelectedId(inc.id);
    setView("detail");
  };

  const updateStatus = (id: string, status: Status) => {
    if (!currentUser) return;
    setData((d: any) => ({
      ...d,
      incidents: d.incidents.map((inc: Incident) => {
        if (inc.id !== id) return inc;
        if (inc.status === status) return inc;
        const now = new Date().toISOString();
        return {
          ...inc,
          status,
          updatedAt: now,
          history: [
            ...inc.history,
            { id: "h-" + uid(), type: "estado", actorId: currentUser.id, at: now, meta: { from: inc.status, to: status } },
          ],
        };
      }),
    }));
  };

  const assign = (id: string, assigneeId?: string) => {
    if (!currentUser) return;
    setData((d: any) => ({
      ...d,
      incidents: d.incidents.map((inc: Incident) => {
        if (inc.id !== id) return inc;
        if (inc.assigneeId === assigneeId) return inc;
        const now = new Date().toISOString();
        return {
          ...inc,
          assigneeId,
          updatedAt: now,
          history: [
            ...inc.history,
            { id: "h-" + uid(), type: "asignacion", actorId: currentUser.id, at: now, meta: { from: inc.assigneeId, to: assigneeId } },
          ],
        };
      }),
    }));
  };

  const addComment = (id: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const now = new Date().toISOString();
    setData((d: any) => ({
      ...d,
      incidents: d.incidents.map((inc: Incident) => inc.id !== id ? inc : ({
        ...inc,
        updatedAt: now,
        comments: [...inc.comments, { id: "c-" + uid(), authorId: currentUser.id, text: text.trim(), createdAt: now }],
        history: [...inc.history, { id: "h-" + uid(), type: "comentario", actorId: currentUser.id, at: now }],
      })),
    }));
  };

  const editIncident = (id: string, changes: Partial<Pick<Incident, "title" | "description" | "category" | "priority">>) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    setData((d: any) => ({
      ...d,
      incidents: d.incidents.map((inc: Incident) => {
        if (inc.id !== id) return inc;
        const updated = { ...inc, ...changes, updatedAt: now };
        return {
          ...updated,
          history: [
            ...inc.history,
            { id: "h-" + uid(), type: "edicion", actorId: currentUser.id, at: now, meta: { changes } },
          ],
        };
      }),
    }));
  };

  const addUser = (user: Omit<User, "id" | "createdAt" | "avatar">) => {
    const newUser: User = {
      id: "u-" + uid(),
      createdAt: new Date().toISOString(),
      avatar: user.name[0]?.toUpperCase() || "?",
      ...user,
    };
    setData((d: any) => ({ ...d, users: [newUser, ...d.users] }));
  };

  const removeUser = (id: string) => {
    if (!currentUser || currentUser.role !== "administrador") return;
    setData((d: any) => ({ ...d, users: d.users.filter((u: User) => u.id !== id) }));
  };

  const filtered = useMemo(() => {
    return incidents
      .filter((inc: Incident) => {
        if (filters.q) {
          const q = filters.q.toLowerCase();
          const hay = [inc.title, inc.description, inc.category || ""].join(" ").toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (filters.status !== "todas" && inc.status !== filters.status) return false;
        if (filters.priority !== "todas" && inc.priority !== filters.priority) return false;
        if (filters.assignee !== "todos" && (inc.assigneeId || "") !== filters.assignee) return false;
        if (filters.reporter !== "todos" && inc.reporterId !== filters.reporter) return false;
        if (filters.from && new Date(inc.createdAt) < new Date(filters.from)) return false;
        if (filters.to && new Date(inc.createdAt) > new Date(filters.to + "T23:59:59")) return false;
        return true;
      })
      .sort((a: Incident, b: Incident) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [incidents, filters]);

  const myIncidents = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "empleado") {
      return incidents.filter((i: Incident) => i.reporterId === currentUser.id);
    }
    if (currentUser.role === "responsable") {
      return incidents.filter((i: Incident) => i.assigneeId === currentUser.id);
    }
    return incidents;
  }, [incidents, currentUser]);

  const openCount = incidents.filter((i: Incident) => i.status === "abierta" || i.status === "en progreso").length;
  const urgentCount = incidents.filter((i: Incident) => i.priority === "alta" && i.status !== "cerrada" && i.status !== "resuelta").length;
  const assignedToMe = currentUser ? incidents.filter((i: Incident) => i.assigneeId === currentUser.id && i.status !== "cerrada").length : 0;

  const selected = useMemo(() => incidents.find((i: Incident) => i.id === selectedId) || null, [incidents, selectedId]);

  const canChangeStatus = (inc: Incident) => {
    if (!currentUser) return false;
    if (currentUser.role === "administrador") return true;
    if (currentUser.role === "responsable" && inc.assigneeId === currentUser.id) return true;
    return false;
  };
  const canAssign = currentUser?.role === "administrador";

  // Close modal on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowNew(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Login demo helper
  const quickLogin = (role: Role) => {
    const u = data.users.find((x: User) => x.role === role);
    if (u) { setCurrentUserId(u.id); setView("dashboard"); }
  };

  if (!currentUser || view === "login") {
    return <LoginScreen onLogin={login} quickLogin={quickLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900 antialiased">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-3 sm:px-4">
          <div className="flex items-center gap-3">
            <button
              className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white shadow-sm sm:hidden"
              onClick={() => setMobileMenu(v => !v)}
              aria-label="Abrir menú"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4-6.5 4 2-7L2 9h7z" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="text-[15px] font-semibold tracking-tight">GIUS</div>
                <div className="text-[11px] text-zinc-500 -mt-0.5">Gestor de incidencias ultra simple</div>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <NavButton active={view === "dashboard"} onClick={() => setView("dashboard")} icon="grid">Dashboard</NavButton>
            <NavButton active={view === "list"} onClick={() => setView("list")} icon="list">Incidencias</NavButton>
            {currentUser.role === "administrador" && (
              <NavButton active={view === "users"} onClick={() => setView("users")} icon="users">Usuarios</NavButton>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowNew(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-indigo-600/10 hover:bg-indigo-500 active:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              <span className="hidden sm:inline">Nueva incidencia</span>
              <span className="sm:hidden">Nueva</span>
            </button>

            <div className="relative">
              <button
                className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-2.5 py-1.5 shadow-sm hover:bg-zinc-50"
                onClick={() => dialogRef.current?.showModal()}
                aria-label="Perfil"
              >
                <Avatar name={currentUser.name} size={28}/>
                <div className="hidden text-left sm:block">
                  <div className="text-sm font-medium leading-4">{currentUser.name}</div>
                  <div className="text-xs text-zinc-500 -mt-0.5 capitalize">{currentUser.role}</div>
                </div>
                <svg className="hidden h-4 w-4 text-zinc-500 sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              <dialog ref={dialogRef} className="rounded-2xl border border-zinc-200 p-0 shadow-2xl backdrop:bg-black/30">
                <div className="w-[min(92vw,360px)] overflow-hidden rounded-2xl bg-white">
                  <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
                    <Avatar name={currentUser.name} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{currentUser.name}</div>
                      <div className="truncate text-xs text-zinc-500">{currentUser.email}</div>
                    </div>
                    <button onClick={() => dialogRef.current?.close()} className="ml-auto grid h-8 w-8 place-items-center rounded-lg hover:bg-zinc-100">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                  <div className="grid">
                    <button
                      onClick={() => { dialogRef.current?.close(); logout(); }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-zinc-50"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </dialog>
            </div>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className={clsx("border-t border-zinc-200 bg-white/90 px-3 py-2 sm:hidden", mobileMenu ? "block" : "hidden")}>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <button onClick={() => {setView("dashboard"); setMobileMenu(false);}} className={clsx("rounded-xl px-3 py-2", view==="dashboard" ? "bg-zinc-900 text-white" : "bg-zinc-100")}>Dashboard</button>
            <button onClick={() => {setView("list"); setMobileMenu(false);}} className={clsx("rounded-xl px-3 py-2", view==="list" ? "bg-zinc-900 text-white" : "bg-zinc-100")}>Lista</button>
            {currentUser.role === "administrador" ? (
              <button onClick={() => {setView("users"); setMobileMenu(false);}} className={clsx("rounded-xl px-3 py-2", view==="users" ? "bg-zinc-900 text-white" : "bg-zinc-100")}>Usuarios</button>
            ) : <div/>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 pb-24 pt-5 sm:px-4 sm:pt-8">
        {view === "dashboard" && (
          <Dashboard
            openCount={openCount}
            urgentCount={urgentCount}
            assignedToMe={assignedToMe}
            incidents={myIncidents}
            users={data.users}
            currentUser={currentUser}
            onOpen={id => { setSelectedId(id); setView("detail"); }}
            onNew={() => setShowNew(true)}
          />
        )}

        {view === "list" && (
          <ListView
            incidents={filtered}
            users={data.users}
            filters={filters}
            setFilters={setFilters}
            onOpen={id => { setSelectedId(id); setView("detail"); }}
            canAssign={canAssign}
            onAssign={assign}
            canChangeStatus={canChangeStatus}
            onStatus={updateStatus}
          />
        )}

        {view === "detail" && selected && (
          <DetailView
            incident={selected}
            users={data.users}
            onBack={() => setView("list")}
            onAssign={assign}
            onStatus={updateStatus}
            onComment={addComment}
            onEdit={editIncident}
            canAssign={canAssign}
            canChangeStatus={canChangeStatus(selected)}
          />
        )}

        {view === "users" && currentUser.role === "administrador" && (
          <UsersView
            users={data.users}
            onAdd={addUser}
            onRemove={removeUser}
            currentUserId={currentUser.id}
          />
        )}
      </main>

      {/* New incident modal */}
      {showNew && (
        <Modal onClose={() => setShowNew(false)} title="Nueva incidencia">
          <NewIncidentForm
            users={data.users}
            currentUser={currentUser}
            onCancel={() => setShowNew(false)}
            onCreate={addIncident}
          />
        </Modal>
      )}

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
        GIUS — simple, rápido, sin ruido. Hecho para equipos que solo quieren resolver.
      </footer>
    </div>
  );
}

function LoginScreen({ onLogin, quickLogin }: { onLogin: (e: string, p: string) => boolean; quickLogin: (r: Role) => void }) {
  const [email, setEmail] = useState("admin@gius.test");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4-6.5 4 2-7L2 9h7z" />
            </svg>
          </div>
          <div>
            <div className="text-xl font-semibold tracking-tight">GIUS</div>
            <div className="text-xs text-zinc-500 -mt-1">Gestor de incidencias ultra simple</div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-200/60">
          <h1 className="text-lg font-semibold">Entrar</h1>
          <p className="mt-1 text-sm text-zinc-600">Usa las cuentas demo o crea la tuya desde el administrador.</p>

          <form
            className="mt-5 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const ok = onLogin(email.trim(), password);
              setError(ok ? null : "Credenciales incorrectas");
            }}
          >
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Email</span>
              <input
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium">Contraseña</span>
              <input
                type="password"
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"> {error} </div>}
            <button className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 active:bg-zinc-900">
              Entrar
            </button>
          </form>

          <div className="mt-6 grid gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Accesos rápidos</div>
            <div className="grid grid-cols-3 gap-2">
              {(["administrador","responsable","empleado"] as Role[]).map(r => (
                <button key={r} onClick={() => quickLogin(r)} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium capitalize hover:bg-zinc-100">
                  {r}
                </button>
              ))}
            </div>
            <div className="mt-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600">
              Demo: admin@gius.test / admin123 — tecnico@gius.test / tec123 — empleado@gius.test / emp123
            </div>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-sm text-center text-xs text-zinc-500">
          Sin prisas, sin sprints, sin macros. Solo problemas y soluciones.
        </p>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, children, icon }: { active?: boolean; onClick: () => void; children: React.ReactNode; icon?: "grid" | "list" | "users" }) {
  const icons: Record<string, React.ReactElement> = {
    grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></svg>,
    list: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1.5"/><circle cx="3.5" cy="12" r="1.5"/><circle cx="3.5" cy="18" r="1.5"/></svg>,
    users: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  };
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
        active ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-700 hover:bg-zinc-100"
      )}
    >
      {icon && <span className="opacity-80">{icons[icon]}</span>}
      {children}
    </button>
  );
}

function Dashboard({
  openCount, urgentCount, assignedToMe, incidents, users, currentUser, onOpen, onNew,
}: {
  openCount: number;
  urgentCount: number;
  assignedToMe: number;
  incidents: Incident[];
  users: User[];
  currentUser: User;
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hola, {currentUser.name.split(" ")[0]} 👋</h1>
          <p className="mt-1 text-sm text-zinc-600">Aquí tienes un vistazo rápido. Todo lo importante a un clic.</p>
        </div>
        <button onClick={onNew} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          Nueva incidencia
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Abiertas" value={openCount} hint="Abiertas o en progreso" color="indigo" icon="activity"/>
        <StatCard title="Urgentes" value={urgentCount} hint="Prioridad alta sin cerrar" color="rose" icon="alert"/>
        <StatCard title="Asignadas a mí" value={assignedToMe} hint="No cerradas" color="emerald" icon="user"/>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="Mis incidencias recientes" action={<span className="text-xs text-zinc-500">Actualizadas recientemente</span>}>
            <div className="grid gap-3">
              {incidents.slice(0, 8).map(inc => (
                <IncidentRowDetailed key={inc.id} incident={inc} users={users} onOpen={() => onOpen(inc.id)} />
              ))}
              {incidents.length === 0 && <Empty text="No tienes incidencias todavía."/>}
            </div>
          </Section>
        </div>
        <div className="grid gap-6">
          <Section title="Consejos rápidos">
            <ul className="list-disc pl-5 text-sm text-zinc-700 space-y-1">
              <li>Usa el filtro de la lista para enfocar: estado, prioridad, fechas.</li>
              <li>Asigna a un responsable para que aparezca en su tablero.</li>
              <li>Los cambios de estado quedan registrados en el historial.</li>
            </ul>
          </Section>
          <Section title="Actividad reciente">
            <ActivityFeed incidents={incidents.slice(0, 12)} users={users} />
          </Section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, hint, color, icon }: { title: string; value: number; hint: string; color: "indigo" | "rose" | "emerald"; icon: "activity" | "alert" | "user" }) {
  const colorMap = {
    indigo: "from-indigo-600 to-violet-600",
    rose: "from-rose-600 to-pink-600",
    emerald: "from-emerald-600 to-teal-600",
  };
  const icons: any = {
    activity: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/></svg>,
    user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className={clsx("absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-20", colorMap[color])} />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-600">{title}</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight">{value}</div>
          <div className="mt-1 text-xs text-zinc-500">{hint}</div>
        </div>
        <div className={clsx("grid h-10 w-10 place-items-center rounded-2xl text-white bg-gradient-to-br shadow-md", colorMap[color])}>
          {icons[icon]}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}

function IncidentRowDetailed({ incident, users, onOpen }: { incident: Incident; users: User[]; onOpen: () => void }) {
  const assignee = users.find(u => u.id === incident.assigneeId);
  const reporter = users.find(u => u.id === incident.reporterId);
  return (
    <button
      onClick={onOpen}
      className="group grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold">{incident.title}</span>
          <StatusPill status={incident.status} />
          <PriorityPill priority={incident.priority} />
          {incident.category && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700">{incident.category}</span>
          )}
        </div>
        <div className="mt-1 line-clamp-1 text-xs text-zinc-600">{incident.description}</div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
          <span>#{incident.id.slice(-6)}</span>
          <span>•</span>
          <span>Creada {relativeTime(incident.createdAt)}</span>
          <span>•</span>
          <span>Actualizada {relativeTime(incident.updatedAt)}</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Reporta: <b className="font-medium text-zinc-700">{reporter?.name}</b></span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-xs text-zinc-500">Asignada a</div>
          <div className="text-sm font-medium">{assignee ? assignee.name : "—"}</div>
        </div>
        <Avatar name={assignee?.name || "?"} />
        <svg className="h-5 w-5 text-zinc-400 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
      </div>
    </button>
  );
}

function ListView({
  incidents, users, filters, setFilters, onOpen, canAssign, onAssign, canChangeStatus, onStatus,
}: {
  incidents: Incident[];
  users: User[];
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  onOpen: (id: string) => void;
  canAssign: boolean;
  onAssign: (id: string, userId?: string) => void;
  canChangeStatus: (inc: Incident) => boolean;
  onStatus: (id: string, status: Status) => void;
}) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Incidencias</h1>
          <p className="mt-1 text-sm text-zinc-600">Filtra, busca y actúa. Todo en dos clics.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
            <button onClick={() => setViewMode("cards")} className={clsx("rounded-lg px-3 py-1.5 text-sm", viewMode==="cards" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100")}>Tarjetas</button>
            <button onClick={() => setViewMode("table")} className={clsx("rounded-lg px-3 py-1.5 text-sm", viewMode==="table" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100")}>Tabla</button>
          </div>
        </div>
      </div>

      <FiltersBar users={users} filters={filters} setFilters={setFilters} />

      {viewMode === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {incidents.map(inc => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              users={users}
              onOpen={() => onOpen(inc.id)}
              canAssign={canAssign}
              onAssign={(uid) => onAssign(inc.id, uid)}
              canChangeStatus={canChangeStatus(inc)}
              onStatus={(s) => onStatus(inc.id, s)}
            />
          ))}
          {incidents.length === 0 && <div className="sm:col-span-2 xl:col-span-3"><Empty text="No hay incidencias con esos filtros."/></div>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Prioridad</th>
                <th className="px-4 py-3 font-medium">Asignada</th>
                <th className="px-4 py-3 font-medium">Actualizada</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {incidents.map(inc => {
                const assignee = users.find(u => u.id === inc.assigneeId);
                return (
                  <tr key={inc.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{inc.title}</div>
                      <div className="line-clamp-1 text-xs text-zinc-500">{inc.description}</div>
                    </td>
                    <td className="px-4 py-3"><StatusPill status={inc.status} /></td>
                    <td className="px-4 py-3"><PriorityPill priority={inc.priority} /></td>
                    <td className="px-4 py-3">
                      {canAssign ? (
                        <select
                          className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                          value={inc.assigneeId || ""}
                          onChange={e => onAssign(inc.id, e.target.value || undefined)}
                        >
                          <option value="">— Sin asignar —</option>
                          {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Avatar name={assignee?.name || "?"} size={24}/>
                          <span className="text-sm">{assignee?.name || "—"}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{fmtDate(inc.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onOpen(inc.id)} className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-100">Abrir</button>
                    </td>
                  </tr>
                );
              })}
              {incidents.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500">Sin resultados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FiltersBar({ users, filters, setFilters }: { users: User[]; filters: FilterState; setFilters: (f: FilterState) => void }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-6">
        <label className="md:col-span-2 grid gap-1.5">
          <span className="text-xs font-medium text-zinc-600">Buscar</span>
          <input
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Texto en título, descripción o categoría"
            value={filters.q}
            onChange={e => setFilters({ ...filters, q: e.target.value })}
          />
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-zinc-600">Estado</span>
          <select
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value as any })}
          >
            <option value="todas">Todos</option>
            {(["abierta","en progreso","en espera","resuelta","cerrada"] as Status[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-zinc-600">Prioridad</span>
          <select
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={filters.priority}
            onChange={e => setFilters({ ...filters, priority: e.target.value as any })}
          >
            <option value="todas">Todas</option>
            {(["alta","media","baja"] as Priority[]).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-zinc-600">Asignada a</span>
          <select
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={filters.assignee}
            onChange={e => setFilters({ ...filters, assignee: e.target.value })}
          >
            <option value="todos">Todos</option>
            <option value="">Sin asignar</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-zinc-600">Reporta</span>
          <select
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
            value={filters.reporter}
            onChange={e => setFilters({ ...filters, reporter: e.target.value })}
          >
            <option value="todos">Todos</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </label>
        <div className="md:col-span-6 grid gap-3 sm:grid-cols-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-zinc-600">Desde</span>
            <input type="date" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" value={filters.from || ""} onChange={e => setFilters({ ...filters, from: e.target.value || undefined })} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-medium text-zinc-600">Hasta</span>
            <input type="date" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" value={filters.to || ""} onChange={e => setFilters({ ...filters, to: e.target.value || undefined })} />
          </label>
          <div className="flex items-end gap-2 sm:col-span-2">
            <button onClick={() => setFilters({ q:"", status:"todas", priority:"todas", assignee:"todos", reporter:"todos", from: undefined, to: undefined })} className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium hover:bg-zinc-100">Limpiar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function IncidentCard({
  incident, users, onOpen, canAssign, onAssign, canChangeStatus, onStatus,
}: {
  incident: Incident;
  users: User[];
  onOpen: () => void;
  canAssign: boolean;
  onAssign: (uid?: string) => void;
  canChangeStatus: boolean;
  onStatus: (s: Status) => void;
}) {
  const assignee = users.find(u => u.id === incident.assigneeId);
  const reporter = users.find(u => u.id === incident.reporterId);
  return (
    <div className="group relative rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{incident.title}</h3>
            <StatusPill status={incident.status} />
            <PriorityPill priority={incident.priority} />
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-zinc-600">{incident.description}</p>
        </div>
        <button onClick={onOpen} className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5">#{incident.id.slice(-6)}</span>
        <span>•</span>
        <span>Creada {relativeTime(incident.createdAt)}</span>
        <span>•</span>
        <span>Act. {relativeTime(incident.updatedAt)}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Avatar name={assignee?.name || "?"} size={28}/>
          <div className="text-xs">
            <div className="font-medium leading-4">{assignee ? assignee.name : "Sin asignar"}</div>
            <div className="text-zinc-500 -mt-0.5">Reporta: {reporter?.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canAssign && (
            <select
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs"
              value={incident.assigneeId || ""}
              onChange={e => onAssign(e.target.value || undefined)}
            >
              <option value="">Asignar…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
          {canChangeStatus ? (
            <select
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-xs"
              value={incident.status}
              onChange={e => onStatus(e.target.value as Status)}
            >
              {(["abierta","en progreso","en espera","resuelta","cerrada"] as Status[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          ) : (
            <span className="text-xs text-zinc-500">Solo lectura</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailView({
  incident, users, onBack, onAssign, onStatus, onComment, onEdit, canAssign, canChangeStatus,
}: {
  incident: Incident;
  users: User[];
  onBack: () => void;
  onAssign: (id: string, uid?: string) => void;
  onStatus: (id: string, s: Status) => void;
  onComment: (id: string, text: string) => void;
  onEdit: (id: string, changes: Partial<Pick<Incident, "title" | "description" | "category" | "priority">>) => void;
  canAssign: boolean;
  canChangeStatus: boolean;
}) {
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: incident.title, description: incident.description, category: incident.category || "", priority: incident.priority });

  const reporter = users.find(u => u.id === incident.reporterId);
  const assignee = users.find(u => u.id === incident.assigneeId);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Volver
          </button>
          <h1 className="text-xl font-semibold tracking-tight">Incidencia #{incident.id.slice(-6)}</h1>
          <StatusPill status={incident.status} />
          <PriorityPill priority={incident.priority} />
        </div>
        <div className="flex items-center gap-2">
          {canAssign && (
            <select
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
              value={incident.assigneeId || ""}
              onChange={e => onAssign(incident.id, e.target.value || undefined)}
            >
              <option value="">Sin asignar</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          )}
          {canChangeStatus && (
            <select
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
              value={incident.status}
              onChange={e => onStatus(incident.id, e.target.value as Status)}
            >
              {(["abierta","en progreso","en espera","resuelta","cerrada"] as Status[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6">
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              {!editing ? (
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">{incident.title}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                    <span>Reporta: <b className="font-medium">{reporter?.name}</b></span>
                    <span>•</span>
                    <span>Creada {fmtDate(incident.createdAt)}</span>
                    <span>•</span>
                    <span>Actualizada {fmtDate(incident.updatedAt)}</span>
                    {incident.category && (
                      <>
                        <span>•</span>
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px]">{incident.category}</span>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid w-full gap-3">
                  <input
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Título"
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:col-span-2"
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      placeholder="Categoría (opcional)"
                    />
                    <select
                      className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm"
                      value={form.priority}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}
                    >
                      {(["baja","media","alta"] as Priority[]).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50">Editar</button>
                ) : (
                  <>
                    <button onClick={() => setEditing(false)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50">Cancelar</button>
                    <button onClick={() => { onEdit(incident.id, { title: form.title, description: form.description, category: form.category || undefined, priority: form.priority }); setEditing(false); }} className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800">Guardar</button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4">
              {!editing ? (
                <p className="whitespace-pre-wrap text-sm text-zinc-800">{incident.description}</p>
              ) : (
                <textarea
                  className="h-36 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción"
                />
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold">Comentarios</h3>
            <div className="mt-3 grid gap-3">
              {incident.comments.length === 0 && <div className="text-sm text-zinc-500">Aún no hay comentarios.</div>}
              {incident.comments
                .slice()
                .sort((a,b) => +new Date(a.createdAt) - +new Date(b.createdAt))
                .map(c => {
                  const author = users.find(u => u.id === c.authorId);
                  return (
                    <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3">
                      <Avatar name={author?.name || "?"} size={32}/>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                          <span className="font-medium text-zinc-800">{author?.name}</span>
                          <span>•</span>
                          <span>{fmtDate(c.createdAt)}</span>
                        </div>
                        <div className="mt-1 whitespace-pre-wrap text-sm">{c.text}</div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <form
              className="mt-4 flex items-end gap-2"
              onSubmit={e => { e.preventDefault(); if (comment.trim()) { onComment(incident.id, comment); setComment(""); } }}
            >
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-zinc-600">Añadir comentario interno</label>
                <textarea
                  className="h-20 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Escribe una nota…"
                />
              </div>
              <button className="mb-0.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50" disabled={!comment.trim()}>Enviar</button>
            </form>
          </section>
        </div>

        <div className="grid gap-6">
          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold">Detalles</h3>
            <div className="mt-3 grid gap-3 text-sm">
              <DetailRow label="Estado"><StatusPill status={incident.status} /></DetailRow>
              <DetailRow label="Prioridad"><PriorityPill priority={incident.priority} /></DetailRow>
              <DetailRow label="Categoría">{incident.category || <span className="text-zinc-500">—</span>}</DetailRow>
              <DetailRow label="Reporta">
                <div className="flex items-center gap-2">
                  <Avatar name={reporter?.name || "?"} size={24}/>
                  <span>{reporter?.name}</span>
                </div>
              </DetailRow>
              <DetailRow label="Asignada a">
                <div className="flex items-center gap-2">
                  <Avatar name={assignee?.name || "?"} size={24}/>
                  <span>{assignee?.name || "—"}</span>
                </div>
              </DetailRow>
              <DetailRow label="Creada">{fmtDate(incident.createdAt)}</DetailRow>
              <DetailRow label="Actualizada">{fmtDate(incident.updatedAt)}</DetailRow>
            </div>
          </section>

          <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold">Historial</h3>
            <ol className="mt-3 relative border-s border-zinc-200 ps-4">
              {incident.history
                .slice()
                .sort((a,b) => +new Date(b.at) - +new Date(a.at))
                .map(ev => {
                  const actor = users.find(u => u.id === ev.actorId);
                  return (
                    <li key={ev.id} className="mb-4 ms-2">
                      <div className="absolute -start-1.5 mt-1 h-3 w-3 rounded-full border border-white bg-zinc-300"></div>
                      <div className="text-xs text-zinc-500">{fmtDate(ev.at)} • {actor?.name}</div>
                      <div className="text-sm">
                        {ev.type === "creada" && "Incidencia creada."}
                        {ev.type === "estado" && <>Estado: <b>{ev.meta?.from}</b> → <b>{ev.meta?.to}</b>.</>}
                        {ev.type === "asignacion" && <>Asignación: <b>{users.find(u => u.id === ev.meta?.from)?.name || "—"}</b> → <b>{users.find(u => u.id === ev.meta?.to)?.name || "—"}</b>.</>}
                        {ev.type === "comentario" && "Comentario añadido."}
                        {ev.type === "edicion" && "Campos editados."}
                      </div>
                    </li>
                  );
                })}
              {incident.history.length === 0 && <div className="text-sm text-zinc-500">Sin eventos.</div>}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 items-center gap-2">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

function UsersView({ users, onAdd, onRemove, currentUserId }: { users: User[]; onAdd: (u: Omit<User, "id" | "createdAt" | "avatar">) => void; onRemove: (id: string) => void; currentUserId: string }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "empleado" as Role });

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
          <p className="mt-1 text-sm text-zinc-600">Gestiona el acceso y los roles. Solo administradores.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold">Equipo</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Usuario</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Rol</th>
                  <th className="px-4 py-3 font-medium">Alta</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-zinc-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={u.name} size={28}/>
                        <div className="font-medium">{u.name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{fmtDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={u.id === currentUserId}
                        onClick={() => onRemove(u.id)}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-40"
                        title={u.id === currentUserId ? "No puedes eliminarte a ti mismo" : "Eliminar"}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold">Añadir usuario</h2>
          <form
            className="mt-3 grid gap-3"
            onSubmit={e => { e.preventDefault(); if (!form.name || !form.email || !form.password) return; onAdd(form); setForm({ name:"", email:"", password:"", role:"empleado" }); }}
          >
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-zinc-600">Nombre</span>
              <input className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre y apellidos" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-zinc-600">Email</span>
              <input type="email" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@empresa.com" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-zinc-600">Contraseña</span>
              <input type="password" className="rounded-xl border border-zinc-300 px-3 py-2 text-sm" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-zinc-600">Rol</span>
              <select className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}>
                <option value="empleado">Empleado</option>
                <option value="responsable">Responsable</option>
                <option value="administrador">Administrador</option>
              </select>
            </label>
            <button className="mt-1 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800">Crear usuario</button>
            <p className="text-xs text-zinc-500">Los usuarios de prueba: admin@gius.test / admin123, tecnico@gius.test / tec123, empleado@gius.test / emp123.</p>
          </form>
        </section>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl" onMouseDown={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-zinc-100" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function NewIncidentForm({
  users, currentUser, onCancel, onCreate,
}: {
  users: User[];
  currentUser: User;
  onCancel: () => void;
  onCreate: (payload: Pick<Incident, "title" | "description" | "priority" | "category"> & { assigneeId?: string }) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [assigneeId, setAssigneeId] = useState<string>("");

  const canAssign = currentUser.role === "administrador";

  return (
    <form
      className="grid gap-4"
      onSubmit={e => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;
        onCreate({ title, description, category, priority, assigneeId: canAssign ? (assigneeId || undefined) : undefined });
      }}
    >
      <div className="grid gap-3">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Título *</span>
          <input
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Resume el problema en una línea"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1.5 sm:col-span-2">
            <span className="text-sm font-medium">Categoría (opcional)</span>
            <input
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Hardware, Software, Accesos…"
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Prioridad</span>
            <select className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm" value={priority} onChange={e => setPriority(e.target.value as Priority)}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Descripción *</span>
          <textarea
            className="h-32 rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Describe el problema con el máximo detalle posible…"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </label>

        {canAssign && (
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Asignar a (opcional)</span>
            <select className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
              <option value="">— Sin asignar —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </label>
        )}
      </div>

      <div className="mt-2 flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-50">Cancelar</button>
        <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700">Crear incidencia</button>
      </div>
      <p className="text-xs text-zinc-500">Se registrará automáticamente la fecha y el usuario que reporta.</p>
    </form>
  );
}

function ActivityFeed({ incidents, users }: { incidents: Incident[]; users: User[] }) {
  const events = incidents.flatMap(inc => inc.history.map(h => ({ ...h, incident: inc }))).sort((a,b) => +new Date(b.at) - +new Date(a.at)).slice(0, 10);
  return (
    <div className="grid gap-3">
      {events.length === 0 && <div className="text-sm text-zinc-500">Sin actividad reciente.</div>}
      {events.map(ev => {
        const actor = users.find(u => u.id === ev.actorId);
        return (
          <div key={ev.id} className="flex gap-3">
            <Avatar name={actor?.name || "?"} size={32}/>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-zinc-500">{fmtDate(ev.at)}</div>
              <div className="text-sm">
                <b className="font-medium">{actor?.name}</b>{" "}
                {ev.type === "creada" && <>creó <span className="font-medium">{ev.incident.title}</span>.</>}
                {ev.type === "estado" && <>cambió el estado de <span className="font-medium">{ev.incident.title}</span> a <b>{ev.meta?.to}</b>.</>}
                {ev.type === "asignacion" && <>asignó <span className="font-medium">{ev.incident.title}</span> a <b>{users.find(u => u.id === ev.meta?.to)?.name || "—"}</b>.</>}
                {ev.type === "comentario" && <>comentó en <span className="font-medium">{ev.incident.title}</span>.</>}
                {ev.type === "edicion" && <>editó <span className="font-medium">{ev.incident.title}</span>.</>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}