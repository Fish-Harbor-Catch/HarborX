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
import { AppShell } from "./components/layout/index.js";
import { Logo } from "./components/layout/index.js";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState as Empty,
  LoadingIndicator,
  Modal,
} from "./components/ui/index.js";
import {
  FishArt,
  HarborArt,
  Timer,
  LotCard,
  AuctionList,
  ActivityList,
} from "./components/domain/index.js";
import {
  OverviewScreen,
  AuctionsScreen,
  CatchesScreen,
  BidsScreen,
  WonLotsScreen,
  PaymentsScreen,
  UsersScreen,
  ReportsScreen,
  ActivityScreen,
  SettingsScreen,
} from "./screens/index.js";
import PwaStatus from "./PwaStatus.jsx";
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
      <>
        <OfflineWorkspace
          owner={offlineOwner}
          renderForm={(props) => <CatchForm {...props} />}
          onReturn={() => {
            setLocalMode(false);
            setOfflineOwner(null);
            window.location.reload();
          }}
        />
        <PwaStatus />
      </>
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
        <PwaStatus />
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
    <AppShell
      user={user}
      role={role}
      page={page}
      onNavigate={go}
      isSidebarOpen={sidebar}
      onOpenSidebar={() => setSidebar(true)}
      onCloseSidebar={() => setSidebar(false)}
      liveCount={live.length}
      hasUnverifiedBuyers={users.some((u) => u.role === "buyer" && !u.verified)}
      online={online}
      hasUnreadEvents={events.length > 0}
      onLogout={logout}
      onRulesClick={() => go("settings")}
      demo={demo}
      rolesLabel={rolesLabel}
      alerts={
        <>
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
        </>
      }
      modals={
        <>
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
          )}
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
          )}
          {toastEl}
        </>
      }
    >
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
          {page === "overview" && (
            <OverviewScreen
              user={user}
              role={role}
              stats={stats}
              own={own}
              live={live}
              visible={visible}
              events={events}
              onNavigate={go}
              onSelectLot={setSelected}
              onRegisterCatch={() => setCatchForm({})}
            />
          )}
          {page === "auctions" && (
            <AuctionsScreen
              role={role}
              lots={lots}
              search={search}
              setSearch={setSearch}
              onSelectLot={setSelected}
            />
          )}
          {page === "catches" && (
            <CatchesScreen
              user={user}
              role={role}
              own={own}
              search={search}
              setSearch={setSearch}
              onSelectLot={setSelected}
              onRegisterCatch={() => setCatchForm({})}
              draftStore={draftStore}
              online={online}
              verifyDraftOwner={verifyDraftOwner}
              syncDrafts={syncDrafts}
              onEditDraft={setCatchForm}
            />
          )}
          {page === "bids" && (
            <BidsScreen
              bids={bids}
              user={user}
              onSelectLot={setSelected}
            />
          )}
          {page === "won" && (
            <WonLotsScreen
              won={won}
              search={search}
              setSearch={setSearch}
              onSelectLot={setSelected}
              role={role}
            />
          )}
          {page === "payments" && (
            <PaymentsScreen
              invoices={invoices}
              role={role}
              onOpen={setSelected}
            />
          )}
          {page === "users" && (
            <UsersScreen
              users={users}
              run={run}
              busy={busy}
            />
          )}
          {page === "reports" && (
            <ReportsScreen
              lots={lots}
              invoices={invoices}
            />
          )}
          {page === "activity" && (
            <ActivityScreen
              events={events}
              onRefresh={refresh}
              role={role}
            />
          )}
          {page === "settings" && (
            <SettingsScreen
              user={user}
              onUser={setUser}
              run={run}
              busy={busy}
            />
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
    </AppShell>
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
