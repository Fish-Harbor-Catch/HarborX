import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Anchor,
  LayoutDashboard,
  Gavel,
  Fish,
  Wallet,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  MapPin,
  Clock,
  Ship,
  Scale,
  CheckCircle2,
  X,
  Menu,
  ArrowRight,
  Activity,
  Download,
  ShieldCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  Eye,
  Mail,
  LockKeyhole,
  UserRound,
  Check,
  AlertCircle,
  Filter,
  SlidersHorizontal,
  FileText,
  ChevronDown,
  Layers,
  TrendingUp,
  ArrowLeft,
  LifeBuoy,
} from "lucide-react";
import { api, money, date, initials, createId } from "./api.js";
import { useDraftVault } from "./useDraftVault.js";
import { DraftPanel, OfflineWorkspace } from "./DraftPanel.jsx";
import {
  activeOfflineOwner,
  verifyDraftOwner,
  revokeOfflineAccess,
  announceAccountChange,
  listenAccountChanges,
} from "./draft-store.js";

const NAV = {
  overview: ["Overview", LayoutDashboard],
  auctions: ["Auctions", Gavel],
  catches: ["My catches", Fish],
  bids: ["My bids", Layers],
  won: ["Won lots", ShieldCheck],
  payments: ["Payments", Wallet],
  users: ["User management", Users],
  reports: ["Reports", BarChart3],
  activity: ["Activity log", Activity],
  settings: ["Settings", Settings],
};
const rolesLabel = {
  admin: "Auction Manager",
  seller: "Seller",
  buyer: "Buyer",
};
function Logo({ light = false }) {
  return (
    <div className={`logo ${light ? "light" : ""}`}>
      <span className="logo-icon">
        <Anchor size={24} />
      </span>
      <span>
        Harbor<span className="logo-x">X</span>
        <small>CATCH. CONNECT. TRADE.</small>
      </span>
    </div>
  );
}
function Badge({ status, children }) {
  return (
    <span
      className={`badge ${String(status).toLowerCase().replaceAll(" ", "-")}`}
    >
      <i />
      {children || status}
    </span>
  );
}
function Empty({
  icon: Icon = Fish,
  title = "Nothing here yet",
  text = "New records will appear here.",
}) {
  return (
    <div className="empty">
      <span>
        <Icon size={30} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Timer({ until }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const seconds = Math.max(0, Math.floor((new Date(until) - now) / 1000));
  return (
    <span>
      {seconds
        ? `${Math.floor(seconds / 3600) ? `${Math.floor(seconds / 3600)}h ` : ""}${Math.floor((seconds % 3600) / 60)}m ${String(seconds % 60).padStart(2, "0")}s`
        : "Round ended"}
    </span>
  );
}
function FishArt({ type = "tuna", large = false }) {
  const shrimp = type === "prawns";
  return (
    <svg
      className={`fish-art ${large ? "large" : ""}`}
      viewBox="0 0 320 144"
      role="img"
      aria-label={shrimp ? "Prawns illustration" : "Fresh fish illustration"}
    >
      <defs>
        <linearGradient id={`sea-${type}`} x2="1" y2="1">
          <stop stopColor="#dcefed" />
          <stop offset="1" stopColor="#eff7f7" />
        </linearGradient>
        <linearGradient id={`fish-${type}`} x2="0.1" y2="1">
          <stop stopColor="#547e91" />
          <stop offset=".55" stopColor="#a7c0c9" />
          <stop offset="1" stopColor="#e8f0ef" />
        </linearGradient>
      </defs>
      <rect width="320" height="144" rx="14" fill={`url(#sea-${type})`} />
      <circle cx="257" cy="28" r="47" fill="#fff" opacity=".28" />
      <path
        d="M0 114 Q80 90 160 115T320 110"
        fill="none"
        stroke="#b9dcdb"
        strokeWidth="1"
      />
      <path
        d="M0 130 Q80 106 160 131T320 126"
        fill="none"
        stroke="#c5e2df"
        strokeWidth="1"
      />
      {shrimp ? (
        <g
          transform="translate(96 18)"
          fill="#d39880"
          stroke="#a96e58"
          strokeWidth="1.5"
        >
          <path d="M101 36C70 1 15 12 20 61s56 56 76 21C66 102 42 82 47 58s35-26 54-22Z" />
          <path
            d="m95 33 26-9-13 25-18-4M93 38q29-29 48-17M92 40q41-5 49 12M33 34l18 8m-26 8 23 6m-24 8 24 4m-19 9 25-2m-13 17 22-11m1 16 12-18m-32-6-7 22m21-16 5 24"
            fill="none"
          />
        </g>
      ) : (
        <g transform="translate(16 6) rotate(-8 145 65)">
          <path d="M93 66 39 30 48 70 32 105 91 83" fill="#63899b" />
          <path
            d="M80 75C121 19 226 22 272 70c-45 53-151 59-192 5Z"
            fill={`url(#fish-${type})`}
            stroke="#718f9c"
            strokeWidth="1"
          />
          <path d="m144 37 39-21 6 22m-45 67 35 17 6-18" fill="#67899a" />
          <path
            d="M216 42q-20 28 4 58"
            fill="none"
            stroke="#6c8d9a"
            strokeWidth="2"
          />
          <circle cx="245" cy="61" r="5" fill="#163e54" />
          <circle cx="247" cy="59" r="1.5" fill="white" />
          <path
            d="m266 79-15 1M132 77l35-9-12 22"
            stroke="#708f9c"
            fill="none"
          />
          <path
            d="m112 58 17 4m-4-12 16 4m-1 33 19 3m-38-18 14 3"
            stroke="#b9d1d4"
            strokeWidth="1.5"
          />
        </g>
      )}
    </svg>
  );
}
function HarborArt() {
  return (
    <svg viewBox="0 0 480 190" className="harbor-art" aria-hidden="true">
      <circle cx="352" cy="61" r="38" fill="#7dd8d1" opacity=".26" />
      <path
        d="M0 161Q60 142 120 160T240 160T360 160T480 160V190H0Z"
        fill="#3ca7ac"
        opacity=".22"
      />
      <path
        d="M0 177Q60 158 120 176T240 176T360 176T480 176"
        fill="none"
        stroke="#74d4cf"
        opacity=".45"
      />
      <g transform="translate(130 30)">
        <path d="m22 101 29 38h162l32-38Z" fill="#d6efed" />
        <path d="M33 105h199l-9 12H42Z" fill="#23a3a6" />
        <path d="M84 100V62h88v38" fill="#fff" />
        <path d="M95 73h20v15H95Zm31 0h20v15h-20Z" fill="#458697" />
        <path
          d="M87 61V49h91l10 14"
          stroke="#cde7e8"
          strokeWidth="7"
          fill="none"
        />
        <path
          d="M153 48V9m-24 12h50M190 101V33l28 6"
          stroke="#b5d9dd"
          strokeWidth="3"
          fill="none"
        />
        <path d="m155 11 26 11-26 10" fill="#24b8ae" />
        <circle
          cx="77"
          cy="119"
          r="10"
          fill="none"
          stroke="#0d3558"
          strokeWidth="4"
        />
        <circle
          cx="197"
          cy="119"
          r="10"
          fill="none"
          stroke="#0d3558"
          strokeWidth="4"
        />
      </g>
      <path
        d="M390 141V55h13v86m-16-87h19l-9-13Zm-5 91h33"
        fill="#9bc8cc"
        opacity=".45"
      />
      <path
        d="m27 44 12-5 12 5m18-15 10-4 10 4"
        fill="none"
        stroke="#b0dddd"
        strokeWidth="2"
      />
    </svg>
  );
}

function Auth({ onLogin, toast, demo }) {
  const [register, setRegister] = useState(false),
    [busy, setBusy] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [role, setRole] = useState("buyer");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const f = new FormData(e.currentTarget);
      const data = await api(`/auth/${register ? "register" : "login"}`, {
        method: "POST",
        body: register
          ? {
              name: f.get("name"),
              email,
              password,
              role,
              phone: f.get("phone") || "",
              boat_name: f.get("boat_name") || "",
            }
          : { email, password },
      });
      await onLogin(data.user);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  }
  function fill(r) {
    setEmail(`${r}@harborx.demo`);
    setPassword("HarborXDemo2026!");
    setRegister(false);
  }
  return (
    <div className="auth-page">
      <section className="auth-story">
        <Logo light />
        <div className="auth-story-body">
          <span className="eyebrow light-text">A BETTER DAY AT THE HARBOR</span>
          <h1>
            Fresh catch.
            <br />
            Fair bids.
            <br />
            <em>Connected harbors.</em>
          </h1>
          <p>
            From the first catch to the final bid. One place for Sri Lanka’s
            fishing community to trade with confidence.
          </p>
          <HarborArt />
          <div className="auth-feature">
            <ShieldCheck size={22} />
            <div>
              <strong>Every bid. Every catch. Accounted for.</strong>
              <span>Transparent auctions, from boat to buyer.</span>
            </div>
          </div>
        </div>
        <small>Built for our coast. Made for our community.</small>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-top">
          <span>New to HarborX?</span>
          <button className="text-btn" onClick={() => setRegister(!register)}>
            {register ? "Sign in" : "Create an account"}{" "}
            <ArrowUpRight size={15} />
          </button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <span className="auth-anchor">
            <Anchor size={27} />
          </span>
          <span className="eyebrow">WELCOME TO HARBORX</span>
          <h2>{register ? "Join the harbor community" : "Welcome back."}</h2>
          <p>
            {register
              ? "Create your Seller or Buyer account to get started."
              : "Sign in to manage your next catch, bid, or auction."}
          </p>
          {register && (
            <>
              <label>
                Full name
                <input
                  name="name"
                  required
                  minLength={2}
                  placeholder="Your full name"
                />
              </label>
              <label>
                I am a
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="buyer">Buyer — buy fresh catches</option>
                  <option value="seller">
                    Seller — register and sell catches
                  </option>
                </select>
              </label>
              {role === "seller" && (
                <label>
                  Boat name
                  <input
                    name="boat_name"
                    placeholder="e.g. Ocean Pearl LK-2048"
                  />
                </label>
              )}
              <label>
                Phone number
                <input name="phone" type="tel" placeholder="+94 77 123 4567" />
              </label>
            </>
          )}
          <label>
            Email address
            <div className="input-icon">
              <Mail size={17} />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </label>
          <label>
            Password
            <div className="input-icon">
              <LockKeyhole size={17} />
              <input
                type="password"
                required
                minLength={register ? 12 : 1}
                maxLength={128}
                autoComplete={register ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  register ? "At least 12 characters" : "Enter your password"
                }
              />
            </div>
          </label>
          {register && (
            <small className="muted">
              Buyers need manager verification before placing bids. Admin
              accounts are created separately.
            </small>
          )}
          <button className="btn primary full" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
            <ArrowRight size={17} />
          </button>
          {demo && (
            <div className="demo-box">
              <div>
                <span className="badge scheduled">LOCAL DEMO</span>
                <small>Choose a role to fill the sign-in details</small>
              </div>
              <div className="demo-roles">
                {["seller", "buyer", "admin"].map((r) => (
                  <button key={r} type="button" onClick={() => fill(r)}>
                    {r === "admin"
                      ? "Manager"
                      : r[0].toUpperCase() + r.slice(1)}
                    <ArrowUpRight size={13} />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="auth-foot">
            <ShieldCheck size={14} /> Secure access for your harbor community
          </div>
        </form>
        <footer>
          © {new Date().getFullYear()} HarborX · Fish Harbor Management
        </footer>
      </section>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false),
    [demo, setDemo] = useState(false),
    [page, setPage] = useState("overview"),
    [lots, setLots] = useState([]),
    [invoices, setInvoices] = useState([]),
    [users, setUsers] = useState([]),
    [bids, setBids] = useState([]),
    [events, setEvents] = useState([]),
    [notice, setNotice] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState(null),
    [catchForm, setCatchForm] = useState(null),
    [search, setSearch] = useState(""),
    [sidebar, setSidebar] = useState(false),
    [online, setOnline] = useState(navigator.onLine),
    [offlineOwner, setOfflineOwner] = useState(null),
    [localMode, setLocalMode] = useState(false),
    [synced, setSynced] = useState(null);
  const draftStore = useDraftVault(user);
  const pendingDrafts = draftStore.drafts.filter(
    (draft) => draft.state !== "synced",
  );
  const sessionGeneration = useRef(0);
  function clearPrivateView() {
    sessionGeneration.current++;
    setSelected(null);
    setCatchForm(null);
    setLots([]);
    setInvoices([]);
    setEvents([]);
    setUsers([]);
    setBids([]);
    setSearch("");
    setSynced(null);
    setPage("overview");
  }
  const toast = useCallback(
    (message, type = "success") => setNotice({ message, type, id: Date.now() }),
    [],
  );
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(
    () =>
      listenAccountChanges(() => {
        clearPrivateView();
        setUser(null);
        setOfflineOwner(null);
        setLocalMode(false);
        setSelected(null);
        setCatchForm(null);
        setLots([]);
        setInvoices([]);
        setEvents([]);
        setUsers([]);
        setBids([]);
        setError("Account changed in another window. Sign in again.");
      }),
    [],
  );
  useEffect(() => {
    // Keep the local workspace open on reconnect, including any unsaved form.
    // Returning to the server session is an explicit action.
    if (!online && offlineOwner && !user) setLocalMode(true);
  }, [online, offlineOwner, user]);
  useEffect(() => {
    activeOfflineOwner()
      .then(setOfflineOwner)
      .catch(() => {});
    api("/health")
      .then((x) => setDemo(x.demo))
      .catch(() => {});
    api("/auth/me")
      .then(async (x) => {
        await verifyDraftOwner(x.user).catch(() => {});
        setUser(x.user);
      })
      .catch(async (e) => {
        if (e.status === 401) {
          await revokeOfflineAccess().catch(() => {});
          setOfflineOwner(null);
        }
        if (e.status !== 401) setError(e.message);
      })
      .finally(() => setReady(true));
    const yes = () => setOnline(true),
      no = () => setOnline(false);
    window.addEventListener("online", yes);
    window.addEventListener("offline", no);
    return () => {
      window.removeEventListener("online", yes);
      window.removeEventListener("offline", no);
    };
  }, []);
  const refresh = useCallback(async () => {
    if (!user) return;
    const generation = sessionGeneration.current;
    try {
      const results = await Promise.all([
        api("/lots"),
        api("/payments"),
        api("/activity"),
        user.role === "admin" ? api("/users") : Promise.resolve({ users: [] }),
        user.role === "buyer" ? api("/my-bids") : Promise.resolve({ bids: [] }),
      ]);
      if (generation !== sessionGeneration.current) return;
      setLots(results[0].lots);
      setInvoices(results[1].invoices);
      setEvents(results[2].events);
      setUsers(results[3].users);
      setBids(results[4].bids);
      setError("");
      setSynced(new Date());
    } catch (e) {
      if (generation !== sessionGeneration.current) return;
      if (e.status === 401) {
        clearPrivateView();
        await revokeOfflineAccess().catch(() => {});
        setUser(null);
        setOfflineOwner(null);
        setSelected(null);
        setCatchForm(null);
        setPage("overview");
      } else setError(e.message);
    }
  }, [user]);
  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      if (!document.hidden && navigator.onLine) refresh();
    }, 8000);
    return () => clearInterval(timer);
  }, [refresh]);
  async function syncDrafts() {
    if (!online || busy || draftStore.busy) {
      toast("Reconnect before syncing your catches.", "error");
      return;
    }
    setBusy(true);
    try {
      const count = await draftStore.sync(
        (draft) => api("/lots", { method: "POST", body: draft }),
        async () => {
          const { user: current } = await api("/auth/me");
          await verifyDraftOwner(current);
          return current;
        },
      );
      toast(`${count} catches synced for manager review.`);
      await refresh();
    } catch (e) {
      toast(`Drafts are retained. ${e.message}`, "error");
      if (e.status === 401) {
        clearPrivateView();
        await revokeOfflineAccess().catch(() => {});
        setUser(null);
        setOfflineOwner(null);
      }
    } finally {
      setBusy(false);
    }
  }
  async function run(fn, message) {
    setBusy(true);
    try {
      await fn();
      if (message) toast(message);
      await refresh();
      return true;
    } catch (e) {
      toast(e.message, "error");
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (await run(() => api("/auth/logout", { method: "POST" }))) {
      await revokeOfflineAccess().catch(() => {});
      announceAccountChange();
      clearPrivateView();
      setUser(null);
      setOfflineOwner(null);
      setSelected(null);
      setPage("overview");
      setLots([]);
      setSearch("");
    }
  }
  function go(p) {
    setPage(p);
    setSearch("");
    setSidebar(false);
  }
  if (!ready)
    return (
      <div className="loading">
        <Logo />
        <span className="spinner" />
        <p>Opening your harbor…</p>
      </div>
    );
  const toastEl = notice && (
    <div key={notice.id} role="status" className={`toast ${notice.type}`}>
      {notice.type === "error" ? (
        <AlertCircle size={20} />
      ) : (
        <CheckCircle2 size={20} />
      )}
      <span>{notice.message}</span>
      <button onClick={() => setNotice(null)} aria-label="Dismiss notification">
        <X size={17} />
      </button>
    </div>
  );
  if (!user && offlineOwner && (localMode || !online)) {
    return (
      <OfflineWorkspace
        owner={offlineOwner}
        renderForm={(props) => <CatchForm {...props} />}
        onReturn={() => {
          setLocalMode(false);
          setOfflineOwner(null);
          window.location.reload();
        }}
      />
    );
  }
  if (!user)
    return (
      <>
        {error && (
          <div className="server-error">
            {error}
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}
        <Auth
          onLogin={async (u) => {
            await verifyDraftOwner(u).catch(() =>
              toast("Signed in. Local storage is unavailable.", "error"),
            );
            announceAccountChange();
            clearPrivateView();
            setUser(u);
            setError("");
          }}
          toast={toast}
          demo={demo}
        />
        {offlineOwner && (
          <div className="local-entry">
            <button
              className="btn secondary"
              onClick={() => setLocalMode(true)}
            >
              Open saved local drafts
            </button>
          </div>
        )}
        {toastEl}
      </>
    );
  const role = user.role,
    own = lots.filter((l) => l.seller_id === user.id),
    visible = role === "seller" ? own : lots,
    live = lots.filter(
      (l) => l.status === "live" && new Date(l.round_ends_at) > new Date(),
    ),
    won = lots.filter((l) => l.winner_id === user.id),
    relevant = role === "buyer" ? won : visible;
  const nav =
    role === "admin"
      ? ["overview", "auctions", "users", "payments", "reports"]
      : role === "seller"
        ? ["overview", "catches", "auctions", "payments"]
        : ["overview", "auctions", "bids", "won", "payments"];
  const outstanding = invoices.reduce((n, l) => n + Number(l.balance), 0),
    sales = relevant.reduce((n, l) => n + Number(l.final_price || 0), 0);
  const stats =
    role === "admin"
      ? [
          {
            label: "Total auction value",
            value: `LKR ${money(lots.reduce((n, l) => n + Number(l.final_price || 0), 0))}`,
            sub: "Across completed auctions",
            icon: TrendingUp,
            color: "teal",
          },
          {
            label: "Live auctions",
            value: live.length,
            sub: `${lots.filter((l) => l.status === "scheduled").length} ready to start`,
            icon: Gavel,
            color: "blue",
          },
          {
            label: "Registered users",
            value: users.length,
            sub: `${users.filter((u) => u.role === "buyer" && !u.verified).length} buyers awaiting verification`,
            icon: Users,
            color: "purple",
          },
          {
            label: "Outstanding payments",
            value: `LKR ${money(outstanding)}`,
            sub: `${invoices.filter((l) => l.payment_status === "Overdue").length} overdue invoices`,
            icon: Wallet,
            color: "amber",
          },
        ]
      : role === "seller"
        ? [
            {
              label: "Total sales",
              value: `LKR ${money(sales)}`,
              sub: "Gross completed auction sales",
              icon: TrendingUp,
              color: "teal",
            },
            {
              label: "My catches",
              value: own.length,
              sub: `${own.filter((l) => l.status === "pending").length} awaiting review`,
              icon: Fish,
              color: "blue",
            },
            {
              label: "Active auctions",
              value: own.filter((l) => l.status === "live").length,
              sub: "Monitor your latest bids",
              icon: Gavel,
              color: "purple",
            },
            {
              label: "Payments pending",
              value: `LKR ${money(outstanding)}`,
              sub: "Outstanding buyer payments",
              icon: Wallet,
              color: "amber",
            },
          ]
        : [
            {
              label: "Live auctions",
              value: live.length,
              sub: "Fresh opportunities at the harbor",
              icon: Gavel,
              color: "teal",
            },
            {
              label: "Bids placed",
              value: bids.length,
              sub: `${new Set(bids.map((b) => b.lot_id)).size} auctions participated`,
              icon: Layers,
              color: "blue",
            },
            {
              label: "Won lots",
              value: won.length,
              sub: "Your successful auctions",
              icon: ShieldCheck,
              color: "purple",
            },
            {
              label: "Payments pending",
              value: `LKR ${money(outstanding)}`,
              sub: "Your outstanding balance",
              icon: Wallet,
              color: "amber",
            },
          ];
  return (
    <div className="app-shell">
      <div
        className={`sidebar-scrim ${sidebar ? "show" : ""}`}
        onClick={() => setSidebar(false)}
      />
      <aside
        id="harbor-navigation"
        className={`sidebar ${sidebar ? "open" : ""}`}
      >
        <Logo light />
        <div className="workspace-label">HARBOR WORKSPACE</div>
        <nav>
          {nav.map((key) => {
            const [label, Icon] = NAV[key];
            return (
              <button
                key={key}
                className={page === key ? "active" : ""}
                onClick={() => go(key)}
              >
                <Icon size={19} />
                {label}
                {key === "auctions" && live.length > 0 && (
                  <span>{live.length}</span>
                )}
                {key === "users" &&
                  users.some((u) => u.role === "buyer" && !u.verified) && (
                    <i className="nav-dot" />
                  )}
              </button>
            );
          })}
        </nav>
        <div className="workspace-label second">WORKSPACE</div>
        <nav>
          {["activity", "settings"].map((key) => {
            const [label, Icon] = NAV[key];
            return (
              <button
                key={key}
                className={page === key ? "active" : ""}
                onClick={() => go(key)}
              >
                <Icon size={19} />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="harbor-help">
            <LifeBuoy size={22} />
            <strong>Your harbor, connected.</strong>
            <p>Clear records. Confident trading.</p>
            <button onClick={() => go("settings")}>
              Auction rules <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="sidebar-user" onClick={() => go("settings")}>
            <span className="avatar">{initials(user.name)}</span>
            <span>
              <strong>{user.name}</strong>
              <small>{rolesLabel[role]}</small>
            </span>
            <Settings size={16} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu"
              onClick={() => setSidebar(true)}
              aria-label="Open menu"
              aria-expanded={sidebar}
              aria-controls="harbor-navigation"
            >
              <Menu />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{NAV[page]?.[0]}</strong>
          </div>
          <div className="topbar-actions">
            <span className={`connection ${online ? "" : "offline"}`}>
              {online ? <Wifi size={13} /> : <WifiOff size={13} />}
              <span>{online ? "Connected" : "Offline"}</span>
            </span>
            <span className="top-divider" />
            <button
              className="icon-btn"
              onClick={() => go("activity")}
              aria-label="View recent activity"
            >
              <Bell size={19} />
              {events.length > 0 && <i />}
            </button>
            <span className="avatar small">{initials(user.name)}</span>
            <button
              className="icon-btn"
              onClick={logout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main>
          {demo && (
            <div className="demo-ribbon">
              <span>DEMO WORKSPACE</span> Sample records · {rolesLabel[role]}{" "}
              view{" "}
              <button onClick={logout}>
                Switch role <ArrowRight size={13} />
              </button>
            </div>
          )}
          {!online && (
            <div className="alert warning">
              <WifiOff size={18} /> You’re offline. Sellers can save catch
              drafts here. Bidding requires a live server connection.
            </div>
          )}
          {error && (
            <div className="alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={refresh}>Retry</button>
            </div>
          )}
          {role === "buyer" && !user.verified && (
            <div className="alert warning">
              <ShieldCheck size={18} />
              Your buyer account is awaiting manager verification. You can
              browse auctions while you wait.
            </div>
          )}
          {pendingDrafts.length > 0 && (
            <div className="alert">
              <RefreshCw size={18} />
              <span>
                {pendingDrafts.length} catch draft
                {pendingDrafts.length > 1 ? "s" : ""} saved on this device.
              </span>
              <button
                disabled={busy || draftStore.busy || !online}
                onClick={syncDrafts}
              >
                Sync now
              </button>
              <button onClick={() => go("catches")}>View drafts</button>
            </div>
          )}
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {role === "admin"
                  ? "HARBOR OPERATIONS"
                  : role === "seller"
                    ? "FROM YOUR BOAT TO THE MARKET"
                    : "FRESH OPPORTUNITIES, FAIR PRICES"}
              </div>
              <h1>
                {page === "overview"
                  ? `Welcome back, ${user.name.split(" ")[0]}.`
                  : NAV[page]?.[0]}
              </h1>
              <p>
                {page === "overview"
                  ? "Here’s what’s happening at your harbor today."
                  : {
                      auctions:
                        "Explore fresh catches and follow the latest auction activity.",
                      catches:
                        "Manage your catch, from registration to the final sale.",
                      bids: "Keep an eye on every bid you place.",
                      won: "Your successful bids, ready for the next step.",
                      payments:
                        "A clear view of invoices, payments, and outstanding balances.",
                      users: "Manage access and verify your harbor community.",
                      reports:
                        "Turn your auction records into useful insights.",
                      activity:
                        "A traceable record of activity across your workspace.",
                      settings:
                        "Your account and the rules that keep trading fair.",
                    }[page]}
              </p>
            </div>
            <div className="heading-actions">
              {role === "seller" ? (
                <button
                  className="btn primary"
                  onClick={() => setCatchForm({})}
                >
                  <Plus size={17} />
                  Register catch
                </button>
              ) : page === "reports" ? (
                <a className="btn primary" href="/api/reports/export">
                  <Download size={17} />
                  Export CSV
                </a>
              ) : (
                <span className="date-pill">
                  <Clock size={15} />
                  {new Date().toLocaleDateString("en-GB", {
                    timeZone: "Asia/Colombo",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          {page === "overview" && (
            <>
              <section className="hero-banner">
                <div>
                  <div className="hero-kicker">
                    <span /> YOUR HARBOR. IN SYNC.
                  </div>
                  <h2>
                    {role === "seller"
                      ? "A good catch deserves a fair price."
                      : role === "buyer"
                        ? "Your next fresh catch starts here."
                        : "A clearer view of every catch."}
                  </h2>
                  <p>
                    {role === "admin"
                      ? "Connect your fishing community with transparent, well-managed auctions."
                      : "Discover the difference a connected harbor makes."}
                  </p>
                  <button
                    className="btn white"
                    onClick={() =>
                      go(role === "seller" ? "catches" : "auctions")
                    }
                  >
                    {role === "seller" ? "View my catches" : "Explore auctions"}
                    <ArrowRight size={16} />
                  </button>
                </div>
                <HarborArt />
              </section>
              <section className="stats-grid">
                {stats.map(({ label, value, sub, icon: Icon, color }) => (
                  <article className="stat-card" key={label}>
                    <div className="stat-top">
                      <span>{label}</span>
                      <div className={`stat-icon ${color}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <strong>{value}</strong>
                    <small>{sub}</small>
                  </article>
                ))}
              </section>
              <div className="overview-grid">
                <section className="panel auctions-panel">
                  <div className="section-heading">
                    <div>
                      <h2>
                        {role === "seller"
                          ? "Your latest catches"
                          : "Live at the harbor"}
                        <span className="count">
                          {(role === "seller" ? own : live).length}
                        </span>
                      </h2>
                      <p>
                        {role === "seller"
                          ? "Follow your catch through every stage."
                          : "Fresh catches. Open bidding. Real opportunities."}
                      </p>
                    </div>
                    <button
                      className="text-btn"
                      onClick={() =>
                        go(role === "seller" ? "catches" : "auctions")
                      }
                    >
                      View all
                      <ArrowRight size={15} />
                    </button>
                  </div>
                  {(role === "seller" ? own : live).length ? (
                    <div className="lot-grid compact">
                      {(role === "seller" ? own : live).slice(0, 2).map((l) => (
                        <LotCard
                          key={l.id}
                          lot={l}
                          onOpen={() => setSelected(l.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <Empty
                      title="No active catches yet"
                      text="Published catches will appear here."
                    />
                  )}
                </section>
                <section className="panel activity-panel">
                  <div className="section-heading">
                    <div>
                      <h2>Recent activity</h2>
                      <p>Your harbor, at a glance.</p>
                    </div>
                    <Activity size={18} />
                  </div>
                  <ActivityList events={events.slice(0, 4)} />
                  <button
                    className="text-btn activity-link"
                    onClick={() => go("activity")}
                  >
                    View activity log
                    <ArrowRight size={15} />
                  </button>
                </section>
              </div>
              <section className="panel">
                <div className="section-heading">
                  <div>
                    <h2>
                      {role === "admin"
                        ? "Auction pipeline"
                        : "Your trading summary"}
                    </h2>
                    <p>From registered catch to completed sale.</p>
                  </div>
                  <span className="muted small-text">LKR · Sri Lanka</span>
                </div>
                <div className="pipeline">
                  {[
                    ["pending", "Awaiting review"],
                    ["scheduled", "Scheduled"],
                    ["live", "In auction"],
                    ["closed", "Completed"],
                  ].map(([s, label], i) => (
                    <div key={s}>
                      <span className={`pipeline-number p${i}`}>
                        {visible.filter((l) => l.status === s).length}
                      </span>
                      <div>
                        <strong>{label}</strong>
                        <small>
                          {s === "closed" ? "Sales recorded" : "Auction lots"}
                        </small>
                      </div>
                      {i < 3 && <ChevronRight size={20} />}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
          {(page === "auctions" || page === "catches" || page === "won") && (
            <>
              <AuctionList
                lots={
                  page === "catches"
                    ? own
                    : page === "won"
                      ? won
                      : lots.filter(
                          (l) =>
                            role === "admin" ||
                            !["pending", "cancelled"].includes(l.status),
                        )
                }
                search={search}
                setSearch={setSearch}
                onOpen={setSelected}
                role={role}
                type={page}
              />
              {page === "catches" && role === "seller" && (
                <DraftPanel
                  store={draftStore}
                  online={online}
                  allowSetup={online}
                  authorize={async () => {
                    const { user: current } = await api("/auth/me");
                    if (current.id !== user.id || current.role !== "seller")
                      throw new Error("Sign in again as this seller.");
                    await verifyDraftOwner(current);
                  }}
                  onSync={syncDrafts}
                  onEdit={setCatchForm}
                />
              )}
            </>
          )}
          {page === "bids" && (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>
                    Your bid history{" "}
                    <span className="count">{bids.length}</span>
                  </h2>
                  <p>Accepted bids are binding and cannot be withdrawn.</p>
                </div>
              </div>
              {bids.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Auction lot</th>
                        <th>Round</th>
                        <th>Your bid / kg</th>
                        <th>Highest / kg</th>
                        <th>Position</th>
                        <th>Placed at</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {bids.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <strong>{b.species}</strong>
                            <small>{b.code}</small>
                          </td>
                          <td>Round {b.round}</td>
                          <td>LKR {money(b.amount)}</td>
                          <td>LKR {money(b.highest_bid)}</td>
                          <td>
                            <Badge
                              status={
                                b.status === "closed"
                                  ? b.winner_id === user.id
                                    ? "won"
                                    : "closed"
                                  : b.highest_buyer_id === user.id
                                    ? "leading"
                                    : "outbid"
                              }
                            >
                              {b.status === "closed"
                                ? b.winner_id === user.id
                                  ? "Won"
                                  : "Closed"
                                : b.highest_buyer_id === user.id
                                  ? "Leading"
                                  : "Outbid"}
                            </Badge>
                          </td>
                          <td>{date(b.created_at)}</td>
                          <td>
                            <button
                              className="icon-btn"
                              aria-label={`View ${b.code}`}
                              onClick={() => setSelected(b.lot_id)}
                            >
                              <ArrowUpRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  icon={Gavel}
                  title="Your first bid is waiting"
                  text="Explore auctions and place a bid to get started."
                />
              )}
            </section>
          )}
          {page === "payments" && (
            <Payments invoices={invoices} role={role} onOpen={setSelected} />
          )}
          {page === "users" && (
            <UserManagement users={users} run={run} busy={busy} />
          )}
          {page === "reports" && <Reports lots={lots} invoices={invoices} />}
          {page === "activity" && (
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>Workspace activity</h2>
                  <p>Latest 25 events · timestamps shown in Sri Lanka time.</p>
                </div>
                <button className="btn secondary" onClick={refresh}>
                  <RefreshCw size={15} />
                  Refresh
                </button>
              </div>
              <ActivityList events={events} />
            </section>
          )}
          {page === "settings" && (
            <SettingsPage user={user} onUser={setUser} run={run} busy={busy} />
          )}
          <footer className="app-footer">
            <span>
              © {new Date().getFullYear()} HarborX · Connected by the coast.
            </span>
            <span>
              <i className={error ? "warning-dot" : ""} />
              {synced
                ? `Updated ${synced.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
                : "Connecting…"}
            </span>
          </footer>
        </main>
      </div>
      {selected && (
        <LotModal
          id={selected}
          user={user}
          close={() => setSelected(null)}
          run={run}
          busy={busy}
          onEdit={(l) => {
            setSelected(null);
            setCatchForm(l);
          }}
          toast={toast}
          online={online}
        />
      )}{" "}
      {catchForm && (
        <CatchForm
          value={catchForm}
          user={user}
          busy={busy}
          run={run}
          onClose={() => setCatchForm(null)}
          onDraft={async (d) => {
            try {
              await draftStore.save(d);
              setCatchForm(null);
              toast("Catch draft saved securely on this device.");
            } catch (error) {
              toast(`Draft not saved: ${error.message}`, "error");
            }
          }}
          online={online}
        />
      )}{" "}
      {toastEl}
    </div>
  );
}

function LotCard({ lot: l, onOpen }) {
  const active = l.status === "live" && new Date(l.round_ends_at) > new Date();
  return (
    <article className="lot-card">
      <button
        className="lot-art"
        onClick={onOpen}
        aria-label={`View ${l.species} ${l.code}`}
      >
        <FishArt type={l.image_key} />
        <span className="lot-grade">Grade {l.grade}</span>
        <span className="lot-status">
          <Badge
            status={
              active ? "live" : l.status === "live" ? "scheduled" : l.status
            }
          >
            {l.status === "live"
              ? active
                ? "Live auction"
                : "Round ended"
              : l.status === "pending"
                ? "Awaiting review"
                : l.status}
          </Badge>
        </span>
      </button>
      <div className="lot-body">
        <div className="lot-title">
          <div>
            <small>{l.code}</small>
            <h3>{l.species}</h3>
          </div>
          <span className="weight-chip">{money(l.weight)} kg</span>
        </div>
        <div className="lot-meta">
          <span>
            <Ship size={13} />
            {l.boat_name}
          </span>
          <span>
            <MapPin size={13} />
            {l.harbor} harbor
          </span>
        </div>
        <div className="lot-price">
          <div>
            <small>{l.highest_bid ? "Highest bid" : "Base price"}</small>
            <strong>
              LKR {money(l.highest_bid || l.base_price)}
              <span>/ kg</span>
            </strong>
          </div>
          <small>
            {l.bid_count} bids
            <br />
            {l.round ? `Round ${l.round} of 3` : "Not started"}
          </small>
        </div>
        <div className="lot-bottom">
          <span>
            <Clock size={13} />
            {l.status === "live" ? (
              <Timer until={l.round_ends_at} />
            ) : l.status === "closed" ? (
              "Auction completed"
            ) : (
              `ETA ${date(l.arrival_at, { day: undefined, month: undefined })}`
            )}
          </span>
          <button className="text-btn" onClick={onOpen}>
            View lot
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
function AuctionList({ lots, search, setSearch, onOpen, role, type }) {
  const [status, setStatus] = useState("all"),
    [harbor, setHarbor] = useState("all"),
    [sort, setSort] = useState("newest");
  const filtered = lots
    .filter(
      (l) =>
        (status === "all" || l.status === status) &&
        (harbor === "all" || l.harbor === harbor) &&
        `${l.species} ${l.code} ${l.boat_name} ${l.seller_name}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "price"
        ? Number(a.highest_bid || a.base_price) -
          Number(b.highest_bid || b.base_price)
        : new Date(b.created_at) - new Date(a.created_at),
    );
  return (
    <>
      <div className="filters-bar">
        <div className="search-box">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fish, lot ID or boat…"
            aria-label="Search auction lots"
          />
        </div>
        <div className="filter-controls">
          <div className="select-icon">
            <MapPin size={15} />
            <select
              aria-label="Filter by harbor"
              value={harbor}
              onChange={(e) => setHarbor(e.target.value)}
            >
              <option value="all">All harbors</option>
              {[...new Set(lots.map((l) => l.harbor))].sort().map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </div>
          <select
            aria-label="Sort auctions"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="price">Price: low to high</option>
          </select>
        </div>
      </div>
      <div className="status-tabs">
        {[
          "all",
          ...(role === "admin" || type === "catches" ? ["pending"] : []),
          "live",
          "scheduled",
          "closed",
          ...(type === "catches" || role === "admin"
            ? ["unsold", "cancelled"]
            : []),
        ].map((s) => (
          <button
            className={status === s ? "selected" : ""}
            key={s}
            onClick={() => setStatus(s)}
          >
            {s === "all"
              ? "All lots"
              : s === "pending"
                ? "Awaiting review"
                : s[0].toUpperCase() + s.slice(1)}
            <span>
              {s === "all"
                ? lots.length
                : lots.filter((l) => l.status === s).length}
            </span>
          </button>
        ))}
      </div>
      {filtered.length ? (
        <div className="lot-grid">
          {filtered.map((l) => (
            <LotCard key={l.id} lot={l} onOpen={() => onOpen(l.id)} />
          ))}
        </div>
      ) : (
        <section className="panel">
          <Empty
            title="No catches found"
            text="Try another filter, or check back when new catches arrive."
          />
        </section>
      )}
    </>
  );
}
function ActivityList({ events }) {
  return events.length ? (
    <div className="activity-list">
      {events.map((e, i) => (
        <div className="activity-item" key={`${e.created_at}-${i}`}>
          <span
            className={`activity-icon ${e.action.includes("Payment") ? "teal" : e.action.includes("closed") ? "blue" : ""}`}
          >
            {e.action.includes("Payment") ? (
              <Wallet size={16} />
            ) : e.action.includes("Round") ? (
              <Gavel size={16} />
            ) : e.action.includes("closed") ? (
              <CheckCircle2 size={16} />
            ) : (
              <Fish size={16} />
            )}
          </span>
          <div>
            <strong>{e.action}</strong>
            <p>
              {e.code && <span>{e.code} · </span>}
              {e.detail}
            </p>
            <small>{date(e.created_at)}</small>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <Empty
      icon={Activity}
      title="A fresh start"
      text="Your workspace activity will appear here."
    />
  );
}

function Payments({ invoices, role, onOpen }) {
  const [filter, setFilter] = useState("all");
  const shown = invoices.filter(
    (l) => filter === "all" || l.payment_status === filter,
  );
  return (
    <>
      <div className="stats-grid three">
        <div className="stat-card">
          <span className="muted">Total invoice value</span>
          <strong>
            LKR {money(invoices.reduce((n, l) => n + Number(l.final_price), 0))}
          </strong>
          <small>Recorded auction sales</small>
        </div>
        <div className="stat-card">
          <span className="muted">Payments recorded</span>
          <strong>
            LKR {money(invoices.reduce((n, l) => n + Number(l.paid_amount), 0))}
          </strong>
          <small>Cash and bank references</small>
        </div>
        <div className="stat-card">
          <span className="muted">Outstanding balance</span>
          <strong>
            LKR {money(invoices.reduce((n, l) => n + Number(l.balance), 0))}
          </strong>
          <small>Awaiting buyer payment</small>
        </div>
      </div>
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Auction invoices</h2>
            <p>
              {role === "admin"
                ? "Select an invoice to record a received payment."
                : "Payments are confirmed and recorded by the auction manager."}
            </p>
          </div>
          <select
            aria-label="Filter invoices"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["all", "Pending", "Partially Paid", "Paid", "Overdue"].map(
              (s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All payments" : s}
                </option>
              ),
            )}
          </select>
        </div>
        {shown.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice / lot</th>
                  <th>Buyer</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <strong>{l.code}</strong>
                      <small>{l.species}</small>
                    </td>
                    <td>{l.winner_name}</td>
                    <td>
                      LKR {money(l.final_price)}
                      <small>Commission: {money(l.commission)}</small>
                    </td>
                    <td>{money(l.paid_amount)}</td>
                    <td>{money(l.balance)}</td>
                    <td>
                      <Badge status={l.payment_status} />
                    </td>
                    <td>
                      <button className="text-btn" onClick={() => onOpen(l.id)}>
                        Details
                        <ArrowUpRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            icon={Wallet}
            title="No matching invoices"
            text="Completed sales and their payment records will appear here."
          />
        )}
      </section>
    </>
  );
}
function UserManagement({ users, run, busy }) {
  const [search, setSearch] = useState("");
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>
            Your harbor community <span className="count">{users.length}</span>
          </h2>
          <p>Only verified Buyers can participate in bidding.</p>
        </div>
        <div className="search-box">
          <Search size={16} />
          <input
            aria-label="Search users"
            placeholder="Find a user…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Verification</th>
              <th>Account</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((u) =>
                `${u.name} ${u.email}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <span className="avatar small">{initials(u.name)}</span>
                      <div>
                        <strong>{u.name}</strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td className="capitalize">{rolesLabel[u.role]}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <Badge status={u.verified ? "verified" : "pending"}>
                      {u.verified ? "Verified" : "Unverified"}
                    </Badge>
                  </td>
                  <td>
                    <Badge status={u.active ? "active" : "cancelled"}>
                      {u.active ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      {u.role === "buyer" && !u.verified && (
                        <button
                          className="btn tiny primary"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () =>
                                api(`/users/${u.id}`, {
                                  method: "PATCH",
                                  body: { verified: true },
                                }),
                              "Buyer verified.",
                            )
                          }
                        >
                          Verify
                        </button>
                      )}
                      {u.role !== "admin" && (
                        <button
                          className={`btn tiny ${u.active ? "secondary" : "primary"}`}
                          disabled={busy}
                          onClick={() =>
                            run(
                              () =>
                                api(`/users/${u.id}`, {
                                  method: "PATCH",
                                  body: { active: !u.active },
                                }),
                              `Account ${u.active ? "disabled" : "enabled"}.`,
                            )
                          }
                        >
                          {u.active ? "Disable" : "Enable"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function Reports({ lots, invoices }) {
  const completed = lots.filter((l) => l.status === "closed"),
    total = completed.reduce((n, l) => n + Number(l.final_price), 0),
    species = [...new Set(lots.map((l) => l.species))],
    harbors = [...new Set(lots.map((l) => l.harbor))];
  return (
    <>
      <div className="stats-grid three">
        {[
          ["Auction turnover", total, "LKR"],
          [
            "Harbor commission",
            completed.reduce((n, l) => n + Number(l.commission), 0),
            "LKR",
          ],
          [
            "Fish sold",
            completed.reduce((n, l) => n + Number(l.actual_weight), 0),
            "kg",
          ],
        ].map(([name, value, unit]) => (
          <div className="stat-card" key={name}>
            <span className="muted">{name}</span>
            <strong>
              {unit === "LKR" ? "LKR " : ""}
              {money(value)}
              {unit === "kg" ? " kg" : ""}
            </strong>
            <small>Across {completed.length} completed auctions</small>
          </div>
        ))}
      </div>
      <div className="reports-grid">
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Catch volume by species</h2>
              <p>All registered catches · kilograms</p>
            </div>
            <Fish size={20} />
          </div>
          <div className="bar-chart">
            {species.map((s) => {
              const weight = lots
                  .filter((l) => l.species === s)
                  .reduce((n, l) => n + Number(l.weight), 0),
                max = Math.max(
                  ...species.map((s) =>
                    lots
                      .filter((l) => l.species === s)
                      .reduce((n, l) => n + Number(l.weight), 0),
                  ),
                  1,
                );
              return (
                <div className="bar-row" key={s}>
                  <div>
                    <span>{s}</span>
                    <strong>{money(weight)} kg</strong>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${(weight / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel">
          <div className="section-heading">
            <div>
              <h2>Harbor summary</h2>
              <p>Recorded sales across locations</p>
            </div>
            <MapPin size={20} />
          </div>
          {harbors.map((h) => (
            <div className="harbor-row" key={h}>
              <span className="stat-icon teal">
                <Anchor size={18} />
              </span>
              <div>
                <strong>{h}</strong>
                <small>
                  {lots.filter((l) => l.harbor === h).length} lots registered
                </small>
              </div>
              <strong>
                LKR{" "}
                {money(
                  lots
                    .filter((l) => l.harbor === h)
                    .reduce((n, l) => n + Number(l.final_price || 0), 0),
                )}
              </strong>
            </div>
          ))}
        </section>
      </div>
      <div className="alert">
        <FileText size={20} />
        <span>
          Export includes catch weights, harbor, sale price, commission, payment
          status, and winners. Confirm the Fisheries Department’s required
          format before official submission.
        </span>
        <a href="/api/reports/export" className="text-btn">
          Download CSV
          <Download size={15} />
        </a>
      </div>
    </>
  );
}
function SettingsPage({ user, onUser, run, busy }) {
  return (
    <div className="settings-grid">
      <form
        className="panel form-panel"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          await run(async () => {
            const d = await api("/auth/profile", {
              method: "PATCH",
              body: {
                name: f.get("name"),
                phone: f.get("phone"),
                boat_name: f.get("boat_name") || "",
              },
            });
            onUser(d.user);
          }, "Your profile was updated.");
        }}
      >
        <div className="section-heading">
          <div>
            <h2>Account profile</h2>
            <p>Your details in the harbor community.</p>
          </div>
          <UserRound size={20} />
        </div>
        <div className="profile-summary">
          <span className="avatar big">{initials(user.name)}</span>
          <div>
            <strong>{user.name}</strong>
            <small>
              {rolesLabel[user.role]} ·{" "}
              {user.verified ? "Verified" : "Awaiting verification"}
            </small>
          </div>
        </div>
        <label>
          Full name
          <input name="name" defaultValue={user.name} required minLength={2} />
        </label>
        <label>
          Email address
          <input value={user.email} disabled />
          <small>Email changes require manager assistance.</small>
        </label>
        <label>
          Phone number
          <input
            name="phone"
            defaultValue={user.phone}
            type="tel"
            maxLength={30}
          />
        </label>
        {user.role === "seller" && (
          <label>
            Boat name
            <input
              name="boat_name"
              defaultValue={user.boat_name}
              maxLength={100}
            />
          </label>
        )}
        <button className="btn primary" disabled={busy}>
          Save changes
          <Check size={15} />
        </button>
      </form>
      <section className="panel rules-panel">
        <div className="section-heading">
          <div>
            <h2>Auction rules</h2>
            <p>A clear process. A fair outcome.</p>
          </div>
          <ShieldCheck size={20} />
        </div>
        {[
          [
            "Prices are per kilogram",
            "The first bid must meet the base price. Later bids must meet the highest bid plus the lot’s minimum increment.",
          ],
          [
            "Up to three rounds",
            "Verified Buyers may join any active round. Only the Auction Manager can start, end, or close auctions.",
          ],
          [
            "Server order decides equal bids",
            "The first valid bid committed by the server is accepted. Equal subsequent bids are rejected. Device clocks are not used.",
          ],
          [
            "Verify the catch before final sale",
            "The manager confirms arrival and inspected weight. A weight different from the advertised catch requires cancellation and relisting.",
          ],
          [
            "Offline drafts, online bidding",
            "Catch drafts can be saved on this device. Bids require a connection and server confirmation; they are never queued offline.",
          ],
          [
            "Payments and commission",
            "The manager records received payments and references. The configured harbor commission is deducted from seller proceeds. No online payment gateway is included.",
          ],
        ].map(([title, text], i) => (
          <div className="rule" key={title}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <strong>{title}</strong>
              <p>{text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function Modal({ title, subtitle, close, children, wide = false }) {
  const dialog = useRef(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const original = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector("button")?.focus();
    const key = (e) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const controls = [
          ...dialog.current.querySelectorAll(
            "button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled)",
          ),
        ].filter((el) => el.getClientRects().length);
        const first = controls[0],
          last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", key);
      previousFocus?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        ref={dialog}
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="icon-btn"
            onClick={close}
            aria-label="Close dialog"
          >
            <X size={21} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
function CatchForm({ value, user, onClose, run, busy, onDraft, online }) {
  const edit = Boolean(value.id);
  const initialArrival = new Date(value.arrival_at || Date.now() + 2 * 3600000);
  const localArrival = new Date(
    initialArrival.getTime() - initialArrival.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);
  const [species, setSpecies] = useState(value.species || "Yellowfin Tuna");
  const [clientId] = useState(() => value.client_id || createId());
  function data(form) {
    const f = new FormData(form),
      keys = {};
    for (const [k, v] of f) keys[k] = v;
    return {
      ...keys,
      weight: Number(keys.weight),
      base_price: Number(keys.base_price),
      min_increment: Number(keys.min_increment),
      arrival_at: new Date(keys.arrival_at).toISOString(),
      image_key:
        species === "Prawns"
          ? "prawns"
          : species === "Sardine"
            ? "sardine"
            : species === "Seer Fish"
              ? "seer"
              : species === "Mackerel"
                ? "mackerel"
                : "tuna",
      client_id: clientId,
    };
  }
  async function submit(e) {
    e.preventDefault();
    if (!online && !edit) {
      onDraft(data(e.currentTarget));
      return;
    }
    const d = data(e.currentTarget);
    if (
      await run(
        () =>
          api(edit ? `/lots/${value.id}` : "/lots", {
            method: edit ? "PATCH" : "POST",
            body: d,
          }),
        edit
          ? "Catch updated."
          : "Catch registered. The auction manager will review it.",
      )
    )
      onClose();
  }
  return (
    <Modal
      title={edit ? "Edit catch" : "Register a new catch"}
      subtitle="Good records start on the boat. Prices are in LKR per kg."
      close={onClose}
    >
      <form className="modal-body catch-form" onSubmit={submit}>
        <div className="form-grid">
          <label>
            Fish species
            <select
              name="species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            >
              {[
                "Yellowfin Tuna",
                "Skipjack Tuna",
                "Sardine",
                "Seer Fish",
                "Prawns",
                "Mackerel",
                "Other",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Quality grade
            <select name="grade" defaultValue={value.grade || "A"}>
              {["A", "B", "C"].map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </label>
          <label>
            Catch weight (kg)
            <input
              name="weight"
              type="number"
              min="0.01"
              max="50000"
              step="0.01"
              defaultValue={value.weight}
              required
              placeholder="120"
            />
          </label>
          <label>
            Base price (LKR / kg)
            <input
              name="base_price"
              type="number"
              min="0.01"
              step="0.01"
              max="10000000"
              defaultValue={value.base_price}
              required
              placeholder="1800"
            />
          </label>
          <label>
            Minimum bid increment (LKR)
            <input
              name="min_increment"
              type="number"
              min="0.01"
              step="0.01"
              max="10000000"
              defaultValue={value.min_increment || 50}
              required
            />
          </label>
          <label>
            Arrival harbor
            <select name="harbor" defaultValue={value.harbor || "Dikkowita"}>
              {[
                "Dikkowita",
                "Negombo",
                "Galle",
                "Mirissa",
                "Trincomalee",
                "Beruwala",
                "Other",
              ].map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
          </label>
          <label>
            Boat name / registration
            <input
              name="boat_name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={value.boat_name || user.boat_name}
              placeholder="Ocean Pearl LK-2048"
            />
          </label>
          <label>
            Estimated arrival (device local time)
            <input
              name="arrival_at"
              type="datetime-local"
              defaultValue={localArrival}
              required
            />
          </label>
        </div>
        <label>
          Catch notes
          <textarea
            name="notes"
            rows={3}
            maxLength={1000}
            defaultValue={value.notes}
            placeholder="Storage, catch condition, or collection details…"
          />
        </label>
        <div className="alert">
          <ShieldCheck size={18} />
          <span>
            The manager reviews your catch before publishing. You can edit or
            withdraw while it awaits review.
          </span>
        </div>
        <div className="form-footer">
          {!edit && (
            <button
              className="btn secondary"
              type="button"
              disabled={busy}
              onClick={(e) => {
                const form = e.currentTarget.form;
                if (form.reportValidity()) onDraft(data(form));
              }}
            >
              <WifiOff size={16} />
              Save on device
            </button>
          )}
          <button className="btn primary" disabled={busy}>
            {busy
              ? "Saving…"
              : edit
                ? "Save changes"
                : online
                  ? "Submit catch"
                  : "Save offline draft"}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

function LotModal({ id, user, close, run, busy, onEdit, toast, online }) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [tab, setTab] = useState("details"),
    [amount, setAmount] = useState(""),
    [payments, setPayments] = useState([]),
    [weight, setWeight] = useState(""),
    [minutes, setMinutes] = useState(10),
    [action, setAction] = useState(""),
    [reason, setReason] = useState("");
  const load = useCallback(async () => {
    try {
      const d = await api(`/lots/${id}`);
      setData(d);
      setError("");
      if (d.lot.status === "closed") {
        const p = await api(`/lots/${id}/payments`).catch(() => ({
          payments: [],
        }));
        setPayments(p.payments);
      }
    } catch (e) {
      setError(e.message);
    }
  }, [id]);
  useEffect(() => {
    load();
    const t = setInterval(() => {
      if (!document.hidden && navigator.onLine) load();
    }, 5000);
    return () => clearInterval(t);
  }, [load]);
  async function mutate(endpoint, body = {}, message = "Auction updated.") {
    if (endpoint === "bids" && (!online || !navigator.onLine)) {
      toast(
        "Bids require a live server connection and are never queued.",
        "error",
      );
      return false;
    }
    const ok = await run(
      () => api(`/lots/${id}/${endpoint}`, { method: "POST", body }),
      message,
    );
    if (ok) {
      setAction("");
      await load();
    }
    return ok;
  }
  const l = data?.lot,
    owner = l?.seller_id === user.id,
    admin = user.role === "admin",
    active = l?.status === "live" && new Date(l.round_ends_at) > new Date(),
    ended = l?.status === "live" && !active,
    minimum = l
      ? Number(
          l.highest_bid === null
            ? l.base_price
            : (Math.round(Number(l.highest_bid) * 100) +
                Math.round(Number(l.min_increment) * 100)) /
                100,
        )
      : 0;
  return (
    <Modal
      title={l?.species || "Auction details"}
      subtitle={
        l ? `${l.code} · ${l.harbor} harbor` : "Loading the latest auction…"
      }
      close={close}
      wide
    >
      {error && (
        <div className="alert error">
          {error}
          <button onClick={load}>Retry</button>
        </div>
      )}
      {!data ? (
        <div className="empty">
          <span className="spinner" />
        </div>
      ) : (
        <>
          <div className="detail-top">
            <div className="detail-art">
              <FishArt type={l.image_key} large />
              <div>
                <Badge status={active ? "live" : l.status} />
                <span>
                  Grade {l.grade} · {money(l.weight)} kg
                </span>
              </div>
            </div>
            <div className="detail-price">
              <span className="eyebrow">
                {l.highest_bid ? "CURRENT HIGHEST BID" : "BASE PRICE"}
              </span>
              <h2>
                LKR {money(l.highest_bid || l.base_price)}
                <small>/ kg</small>
              </h2>
              <p>Minimum increment: LKR {money(l.min_increment)} / kg</p>
              <div className="detail-chips">
                <span>
                  <Gavel size={15} />
                  {l.bid_count} accepted bids
                </span>
                <span>
                  <Layers size={15} />
                  {l.round ? `Round ${l.round} of 3` : "Not started"}
                </span>
              </div>
              {l.status === "live" && (
                <div className={`round-timer ${active ? "" : "finished"}`}>
                  <Clock size={18} />
                  <Timer until={l.round_ends_at} />
                </div>
              )}
              {user.role === "buyer" && active && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (
                      await mutate(
                        "bids",
                        {
                          amount: Number(amount),
                          request_key: createId(),
                        },
                        "Your bid was accepted.",
                      )
                    )
                      setAmount("");
                  }}
                  className="bid-form"
                >
                  <label>
                    Your bid (LKR / kg)
                    <input
                      aria-label="Your bid amount"
                      type="number"
                      min={minimum}
                      step="0.01"
                      max="10000000"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Minimum ${money(minimum)}`}
                    />
                  </label>
                  <small>
                    Estimated total: LKR{" "}
                    {money((Number(amount) || minimum) * Number(l.weight))}.
                    Accepted bids cannot be withdrawn.
                  </small>
                  <button
                    className="btn primary full"
                    disabled={busy || !user.verified || !online}
                  >
                    <Gavel size={17} />
                    {busy
                      ? "Submitting…"
                      : user.verified
                        ? "Place bid"
                        : "Verification required"}
                  </button>
                </form>
              )}
              {l.status === "closed" && (
                <div className="sale-summary">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>
                      {l.winner_id === user.id
                        ? "You won this auction"
                        : `Won by ${l.winner_name}`}
                    </strong>
                    <span>Total sale: LKR {money(l.final_price)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="detail-tabs">
            {[
              "details",
              "bids",
              "timeline",
              ...(l.status === "closed" &&
              (admin || owner || l.winner_id === user.id)
                ? ["payments"]
                : []),
            ].map((t) => (
              <button
                key={t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {t[0].toUpperCase() + t.slice(1)}
                {t === "bids" && <span>{data.bids.length}</span>}
              </button>
            ))}
          </div>
          <div className="modal-body">
            {tab === "details" && (
              <>
                <div className="detail-grid">
                  {[
                    ["Seller", l.seller_name],
                    ["Boat", l.boat_name],
                    ["Harbor", l.harbor],
                    ["Estimated arrival", date(l.arrival_at)],
                    ["Declared weight", `${money(l.weight)} kg`],
                    [
                      "Inspected weight",
                      l.arrived
                        ? `${money(l.actual_weight)} kg`
                        : "Awaiting arrival",
                    ],
                    ["Base price", `LKR ${money(l.base_price)} / kg`],
                    [
                      "Bid visibility",
                      "Open amounts · buyer identities private",
                    ],
                  ].map(([name, value]) => (
                    <div key={name}>
                      <small>{name}</small>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
                {l.notes && (
                  <div className="detail-notes">
                    <strong>Catch notes</strong>
                    <p>{l.notes}</p>
                  </div>
                )}
                {l.cancel_reason && (
                  <div className="alert warning">
                    Cancellation reason: {l.cancel_reason}
                  </div>
                )}
                {owner && l.status === "pending" && (
                  <div className="manager-actions">
                    <button className="btn secondary" onClick={() => onEdit(l)}>
                      Edit catch
                    </button>
                    <button
                      className="btn danger-outline"
                      onClick={() => setAction("cancel")}
                    >
                      Withdraw catch
                    </button>
                  </div>
                )}
                {admin &&
                  !["closed", "unsold", "cancelled"].includes(l.status) && (
                    <section className="manager-panel">
                      <div className="section-heading">
                        <div>
                          <h3>Auction manager controls</h3>
                          <p>All changes are recorded in the audit trail.</p>
                        </div>
                        <ShieldCheck size={20} />
                      </div>
                      <div className="manager-actions">
                        {l.status === "pending" && (
                          <button
                            className="btn primary"
                            disabled={busy}
                            onClick={() =>
                              mutate(
                                "publish",
                                {},
                                "Catch approved and published.",
                              )
                            }
                          >
                            <Check size={16} />
                            Approve & publish
                          </button>
                        )}
                        {(l.status === "scheduled" || ended) && l.round < 3 && (
                          <div className="inline-control">
                            <input
                              aria-label="Round duration in minutes"
                              type="number"
                              min="1"
                              max="120"
                              value={minutes}
                              onChange={(e) => setMinutes(e.target.value)}
                            />
                            <span>min</span>
                            <button
                              className="btn primary"
                              disabled={busy}
                              onClick={() =>
                                mutate(
                                  "start-round",
                                  { minutes: Number(minutes) },
                                  "Bidding round started.",
                                )
                              }
                            >
                              <Gavel size={15} />
                              Start round {l.round + 1}
                            </button>
                          </div>
                        )}
                        {active && (
                          <button
                            className="btn secondary"
                            disabled={busy}
                            onClick={() => setAction("end-round")}
                          >
                            End current round
                          </button>
                        )}
                        {["scheduled", "live"].includes(l.status) &&
                          !l.arrived && (
                            <button
                              className="btn secondary"
                              disabled={busy}
                              onClick={() => {
                                setAction("arrival");
                                setWeight(l.weight);
                              }}
                            >
                              <Ship size={16} />
                              Verify arrival
                            </button>
                          )}
                        {l.arrived && !active && (
                          <button
                            className="btn primary"
                            disabled={busy}
                            onClick={() => setAction("close")}
                          >
                            <CheckCircle2 size={16} />
                            Finalize auction
                          </button>
                        )}
                        <button
                          className="btn danger-outline"
                          disabled={busy}
                          onClick={() => setAction("cancel")}
                        >
                          Cancel lot
                        </button>
                      </div>
                      {active && (
                        <p className="muted small-text">
                          End the round before finalizing the auction. Confirm
                          arrival and the catch weight first.
                        </p>
                      )}
                    </section>
                  )}
              </>
            )}
            {tab === "bids" &&
              (data.bids.length ? (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Buyer</th>
                        <th>Bid / kg</th>
                        <th>Round</th>
                        <th>Accepted at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bids.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <strong>{b.is_mine ? "You" : b.buyer_name}</strong>
                          </td>
                          <td>LKR {money(b.amount)}</td>
                          <td>{b.round}</td>
                          <td>{date(b.created_at, { second: "2-digit" })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty
                  icon={Gavel}
                  title="No bids yet"
                  text="The first valid bid must meet the base price."
                />
              ))}
            {tab === "timeline" && <ActivityList events={data.events} />}
            {tab === "payments" && (
              <>
                <div className="invoice-summary">
                  <div>
                    <small>Sale total</small>
                    <strong>LKR {money(l.final_price)}</strong>
                  </div>
                  <div>
                    <small>Commission ({l.commission_rate}%)</small>
                    <strong>LKR {money(l.commission)}</strong>
                  </div>
                  <div>
                    <small>Seller proceeds</small>
                    <strong>
                      LKR {money(Number(l.final_price) - Number(l.commission))}
                    </strong>
                  </div>
                  <div>
                    <small>Balance · due {date(l.payment_due_at)}</small>
                    <strong>LKR {money(l.balance)}</strong>
                    <Badge status={l.payment_status} />
                  </div>
                </div>
                {admin && l.balance > 0 && (
                  <form
                    className="payment-form"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget,
                        f = new FormData(form);
                      if (
                        await mutate(
                          "payments",
                          {
                            amount: Number(f.get("amount")),
                            reference: f.get("reference"),
                          },
                          "Payment recorded.",
                        )
                      )
                        form.reset();
                    }}
                  >
                    <h3>Record a received payment</h3>
                    <p>
                      Confirm receipt before recording. This records a payment;
                      it does not transfer money.
                    </p>
                    <div className="form-grid">
                      <label>
                        Amount (LKR)
                        <input
                          name="amount"
                          type="number"
                          required
                          min="0.01"
                          max={l.balance}
                          step="0.01"
                          placeholder={money(l.balance)}
                        />
                      </label>
                      <label>
                        Receipt / bank reference
                        <input
                          name="reference"
                          required
                          minLength={3}
                          maxLength={100}
                          placeholder="BANK-001"
                        />
                      </label>
                    </div>
                    <button className="btn primary" disabled={busy}>
                      <Plus size={15} />
                      Record payment
                    </button>
                  </form>
                )}
                {payments.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Reference</th>
                          <th>Amount (LKR)</th>
                          <th>Recorded by</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((p) => (
                          <tr key={p.id}>
                            <td>{p.reference}</td>
                            <td>{money(p.amount)}</td>
                            <td>{p.recorded_by}</td>
                            <td>{date(p.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="muted">No payment receipts recorded yet.</p>
                )}
              </>
            )}
            {action && (
              <form
                className="confirmation-panel"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const body =
                    action === "arrival"
                      ? { actual_weight: Number(weight) }
                      : action === "cancel"
                        ? { reason }
                        : {};
                  await mutate(
                    action,
                    body,
                    action === "arrival"
                      ? "Arrival and weight verified."
                      : action === "cancel"
                        ? "Lot cancelled."
                        : action === "close"
                          ? "Auction finalized."
                          : "Round ended.",
                  );
                }}
              >
                <div className="section-heading">
                  <h3>
                    {
                      {
                        arrival: "Confirm catch arrival",
                        cancel: "Cancel this lot",
                        "end-round": "End the current round?",
                        close: "Finalize this auction?",
                      }[action]
                    }
                  </h3>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setAction("")}
                    aria-label="Dismiss action"
                  >
                    <X size={17} />
                  </button>
                </div>
                {action === "arrival" && (
                  <>
                    <p>
                      Inspect the catch at the harbor. A weight different from
                      the advertised catch requires cancellation and relisting.
                    </p>
                    <label>
                      Inspected weight (kg)
                      <input
                        type="number"
                        min="0.01"
                        max="50000"
                        step="0.01"
                        required
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </label>
                  </>
                )}
                {action === "cancel" && (
                  <label>
                    Reason for cancellation
                    <textarea
                      required
                      minLength={5}
                      maxLength={500}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain withdrawal, weight mismatch, or non-arrival…"
                    />
                  </label>
                )}
                {action === "close" && (
                  <p>
                    {l.highest_bid
                      ? `Award this lot to ${l.winner_name || "the highest valid bidder"} at LKR ${money(l.highest_bid)}/kg. The sale total will be LKR ${money(Number(l.highest_bid) * Number(l.actual_weight))}.`
                      : "This lot has no accepted bids. It will be marked unsold."}
                  </p>
                )}
                {action === "end-round" && (
                  <p>
                    New bids will stop immediately. You can then verify arrival,
                    finalize, or start the next available round.
                  </p>
                )}
                <button
                  className={`btn ${action === "cancel" ? "danger-solid" : "primary"}`}
                  disabled={busy}
                >
                  {busy ? "Saving…" : "Confirm"}
                  <Check size={16} />
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
