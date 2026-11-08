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
  Phone,
  Info,
} from "lucide-react";
import { api, money, date, initials, createId } from "./api.js";
import { LanguageProvider, useLanguage, LanguageSwitcher } from "./i18n.jsx";
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
  const { lang, t } = useLanguage();
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
          <span className="eyebrow light-text">{t("auth_eyebrow", "WELCOME TO HARBORX")}</span>
          <h1>
            Fresh catch.
            <br />
            Fair bids.
            <br />
            <em>Connected harbors.</em>
          </h1>
          <p>
            {t("auth_story_desc", "From the first catch to the final bid. One simple digital harbor for Sri Lanka’s fishing communities to trade with confidence.")}
          </p>
          <HarborArt />
          <div className="auth-feature">
            <ShieldCheck size={22} />
            <div>
              <strong>{t("auth_feature_trace_title", "Every bid. Every catch. Accounted for.")}</strong>
              <span>{t("auth_feature_trace_desc", "Transparent auctions, from boat to buyer.")}</span>
            </div>
          </div>
        </div>
        <small>{t("auth_community_tagline", "Built for our coast. Made for our community.")}</small>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-top">
          <LanguageSwitcher />
          <span>{register ? t("auth_already_prompt", "Already have an account?") : t("auth_new_prompt", "New to HarborX?")}</span>
          <button className="text-btn" onClick={() => setRegister(!register)}>
            {register ? t("action_sign_in", "Sign in") : t("action_create_account", "Create an account")}{" "}
            <ArrowUpRight size={15} />
          </button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <span className="auth-anchor">
            <Anchor size={27} />
          </span>
          <span className="eyebrow">{t("auth_eyebrow", "WELCOME TO HARBORX")}</span>
          <h2>{register ? t("auth_join", "Join the harbor community") : t("auth_welcome_back", "Welcome back.")}</h2>
          <p>
            {register
              ? t("auth_join_sub", "Create your Seller or Buyer account to get started.")
              : t("auth_welcome_back_sub", "Sign in to manage your next catch, bid, or auction.")}
          </p>
          {register && (
            <>
              <label>
                {t("auth_name_label", "Full name")}
                <div className="input-icon">
                  <UserRound size={17} />
                  <input
                    name="name"
                    required
                    minLength={2}
                    placeholder={t("auth_name_placeholder", "Your full name")}
                  />
                </div>
              </label>

              <div className="role-selector-field">
                <span className="field-label-text">
                  {t("auth_role_prompt", "Choose your harbor role:")}
                </span>
                <input type="hidden" name="role" value={role} />
                <div className="role-cards" role="radiogroup" aria-label="Harbor role">
                  <button
                    type="button"
                    role="radio"
                    aria-checked={role === "seller"}
                    className={`role-card ${role === "seller" ? "selected" : ""}`}
                    onClick={() => setRole("seller")}
                  >
                    <div className="role-card-icon seller">
                      <Ship size={24} aria-hidden="true" />
                    </div>
                    <div className="role-card-content">
                      <strong>{t("auth_role_seller", "Seller / Fisherman")}</strong>
                      <span>{t("auth_role_seller_desc", "I catch fish or sell my boat's harvest")}</span>
                    </div>
                    {role === "seller" && <Check size={18} className="role-card-check" aria-hidden="true" />}
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={role === "buyer"}
                    className={`role-card ${role === "buyer" ? "selected" : ""}`}
                    onClick={() => setRole("buyer")}
                  >
                    <div className="role-card-icon buyer">
                      <Fish size={24} aria-hidden="true" />
                    </div>
                    <div className="role-card-content">
                      <strong>{t("auth_role_buyer", "Buyer / Trader")}</strong>
                      <span>{t("auth_role_buyer_desc", "I bid on catches and buy seafood")}</span>
                    </div>
                    {role === "buyer" && <Check size={18} className="role-card-check" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {role === "seller" && (
                <label>
                  {t("auth_boat_label", "Boat name / registration")}
                  <div className="input-icon">
                    <Ship size={17} />
                    <input
                      name="boat_name"
                      placeholder={t("auth_boat_placeholder", "e.g. Ocean Pearl LK-2048")}
                    />
                  </div>
                </label>
              )}
              <label>
                {t("auth_phone_label", "Phone number")}
                <div className="input-icon">
                  <Phone size={17} />
                  <input name="phone" type="tel" placeholder={t("auth_phone_placeholder", "+94 77 123 4567")} />
                </div>
              </label>
            </>
          )}
          <label>
            {t("auth_email_label", "Email address")}
            <div className="input-icon">
              <Mail size={17} />
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth_email_placeholder", "you@example.com")}
              />
            </div>
          </label>
          <label>
            {t("auth_pass_label", "Password")}
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
                  register ? t("auth_pass_new_placeholder", "At least 12 characters") : t("auth_pass_cur_placeholder", "Enter your password")
                }
              />
            </div>
          </label>
          {register && (
            <small className="muted">
              {t("auth_buyer_verification_notice", "Buyers need manager verification before placing bids. Admin accounts are created separately.")}
            </small>
          )}
          <button className="btn primary full" disabled={busy}>
            {busy ? t("action_please_wait", "Please wait…") : register ? t("action_create_account", "Create account") : t("action_sign_in", "Sign in")}
            <ArrowRight size={17} />
          </button>
          {demo && (
            <div className="demo-box" role="region" aria-label={t("auth_demo_title", "Explore demo")}>
              <div className="demo-header">
                <strong className="demo-title">{t("auth_demo_title", "Explore demo")}</strong>
                <span className="demo-subtitle">{t("auth_demo_subtitle", "Choose a role")}</span>
              </div>

              <div className="demo-roles" role="radiogroup" aria-label={t("auth_demo_title", "Explore demo")}>
                {[
                  {
                    id: "seller",
                    icon: Ship,
                    titleKey: "auth_demo_seller",
                    fallbackTitle: "Seller",
                    descKey: "auth_demo_seller_desc",
                    fallbackDesc: "Sell your fish",
                  },
                  {
                    id: "buyer",
                    icon: Fish,
                    titleKey: "auth_demo_buyer",
                    fallbackTitle: "Buyer",
                    descKey: "auth_demo_buyer_desc",
                    fallbackDesc: "Buy fish at auction",
                  },
                  {
                    id: "admin",
                    icon: Gavel,
                    titleKey: "auth_demo_admin",
                    fallbackTitle: "Auction Manager",
                    descKey: "auth_demo_admin_desc",
                    fallbackDesc: "Manage fish auctions",
                  },
                ].map(({ id, icon: RoleIcon, titleKey, fallbackTitle, descKey, fallbackDesc }) => {
                  const isSelected = email === `${id}@harborx.demo`;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      className={`demo-role-card ${isSelected ? "selected" : ""}`}
                      onClick={() => fill(id)}
                      aria-checked={isSelected}
                    >
                      <div className={`demo-role-icon ${id}`}>
                        <RoleIcon size={22} aria-hidden="true" />
                      </div>
                      <div className="demo-role-text">
                        <strong className="demo-role-title">{t(titleKey, fallbackTitle)}</strong>
                        <span className="demo-role-desc">{t(descKey, fallbackDesc)}</span>
                      </div>
                      {isSelected && (
                        <span className="demo-role-check" aria-hidden="true">
                          <Check size={11} strokeWidth={2.5} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="auth-foot">
            <ShieldCheck size={14} /> {t("auth_secure_access", "Secure access for your harbor community")}
          </div>
        </form>
        <footer>
          © {new Date().getFullYear()} HarborX · {t("auth_footer_tag", "Fish Harbor Management")}
        </footer>
      </section>
    </div>
  );
}

function HarborApp() {
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
  const { lang, t } = useLanguage();
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
            label: t("overview_stat_total_value", "Total auction value"),
            value: `LKR ${money(lots.reduce((n, l) => n + Number(l.final_price || 0), 0))}`,
            sub: t("overview_stat_total_value_sub", "Across completed auctions"),
            icon: TrendingUp,
            color: "teal",
          },
          {
            label: t("overview_stat_live_auctions", "Live auctions"),
            value: live.length,
            sub: `${lots.filter((l) => l.status === "scheduled").length} ${t("overview_stat_live_auctions_sub", "{count} ready to start").replace("{count}", "").trim()}`,
            icon: Gavel,
            color: "blue",
          },
          {
            label: t("overview_stat_registered_users", "Registered users"),
            value: users.length,
            sub: `${users.filter((u) => u.role === "buyer" && !u.verified).length} ${t("overview_stat_registered_users_sub", "{count} buyers awaiting verification").replace("{count}", "").trim()}`,
            icon: Users,
            color: "purple",
          },
          {
            label: t("overview_stat_outstanding_payments", "Outstanding payments"),
            value: `LKR ${money(outstanding)}`,
            sub: `${invoices.filter((l) => l.payment_status === "Overdue").length} ${t("overview_stat_outstanding_payments_sub", "{count} overdue invoices").replace("{count}", "").trim()}`,
            icon: Wallet,
            color: "amber",
          },
        ]
      : role === "seller"
        ? [
            {
              label: t("overview_stat_total_sales", "Total sales"),
              value: `LKR ${money(sales)}`,
              sub: t("overview_stat_total_sales_sub", "Gross completed auction sales"),
              icon: TrendingUp,
              color: "teal",
            },
            {
              label: t("overview_stat_my_catches", "My catches"),
              value: own.length,
              sub: `${own.filter((l) => l.status === "pending").length} ${t("overview_stat_my_catches_sub", "{count} awaiting review").replace("{count}", "").trim()}`,
              icon: Fish,
              color: "blue",
            },
            {
              label: t("overview_stat_active_auctions", "Active auctions"),
              value: own.filter((l) => l.status === "live").length,
              sub: t("overview_stat_active_auctions_sub", "Monitor your latest bids"),
              icon: Gavel,
              color: "purple",
            },
            {
              label: t("overview_stat_payments_pending", "Payments pending"),
              value: `LKR ${money(outstanding)}`,
              sub: t("overview_stat_payments_pending_sub", "Outstanding buyer payments"),
              icon: Wallet,
              color: "amber",
            },
          ]
        : [
            {
              label: t("overview_stat_buyer_live", "Live auctions"),
              value: live.length,
              sub: t("overview_stat_buyer_live_sub", "Fresh opportunities at the harbor"),
              icon: Gavel,
              color: "teal",
            },
            {
              label: t("overview_stat_bids_placed", "Bids placed"),
              value: bids.length,
              sub: `${new Set(bids.map((b) => b.lot_id)).size} ${t("overview_stat_bids_placed_sub", "{count} active bids leading").replace("{count}", "").trim()}`,
              icon: Layers,
              color: "blue",
            },
            {
              label: t("overview_stat_won_lots", "Won lots"),
              value: won.length,
              sub: t("overview_stat_won_lots_sub", "Your successful auctions"),
              icon: ShieldCheck,
              color: "purple",
            },
            {
              label: t("overview_stat_payments_pending", "Payments pending"),
              value: `LKR ${money(outstanding)}`,
              sub: t("overview_stat_payments_pending_sub", "Your outstanding balance"),
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
              <WifiOff size={18} /> {t("helper_offline_banner", "You’re offline. Sellers can save catch drafts here. Bidding requires a live server connection.")}
            </div>
          )}
          {error && (
            <div className="alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={refresh}>{t("action_retry", "Retry")}</button>
            </div>
          )}
          {role === "buyer" && !user.verified && (
            <div className="alert warning">
              <ShieldCheck size={18} />
              {t("helper_buyer_unverified", "Your buyer account is awaiting manager verification. You can browse auctions while you wait.")}
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
                {pendingDrafts.length} {t("helper_sync_ready", "catch drafts saved on this device.")}
              </span>
              <button
                disabled={busy || draftStore.busy || !online}
                onClick={syncDrafts}
              >
                {t("action_sync_now", "Sync now")}
              </button>
              <button onClick={() => go("catches")}>{t("action_view_all", "View drafts")}</button>
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

export default function App() {
  return (
    <LanguageProvider>
      <HarborApp />
    </LanguageProvider>
  );
}

function CatchForm({ value, user, onClose, run, busy, onDraft, online }) {
  const { lang, t } = useLanguage();
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
      title={edit ? t("catch_edit_title", "Edit catch") : t("catch_register_title", "Register a new catch")}
      subtitle={t("catch_subtitle", "Good records start on the boat. Prices are in LKR per kg.")}
      close={onClose}
    >
      <form className="modal-body catch-form" onSubmit={submit}>
        <div className="workflow-steps" aria-label="Catch registration stages">
          <div className="workflow-step active">
            <span className="step-badge">1</span>
            <div>
              <strong>{t("catch_step1_title", "Boat Declaration")}</strong>
              <small>{t("catch_step1_sub", "Captain records")}</small>
            </div>
          </div>
          <span className="step-separator">➔</span>
          <div className="workflow-step">
            <span className="step-badge">2</span>
            <div>
              <strong>{t("catch_step2_title", "Scale Inspection")}</strong>
              <small>{t("catch_step2_sub", "Harbor verified")}</small>
            </div>
          </div>
          <span className="step-separator">➔</span>
          <div className="workflow-step">
            <span className="step-badge">3</span>
            <div>
              <strong>{t("catch_step3_title", "Auction Bidding")}</strong>
              <small>{t("catch_step3_sub", "Live market")}</small>
            </div>
          </div>
        </div>

        <div className="form-grid">
          <label>
            {t("catch_field_species", "Fish species")}
            <select
              name="species"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            >
              {[
                ["Yellowfin Tuna", `${t("species_yellowfin", "Yellowfin Tuna")} — கெளவல் சுறா (Kelawalla)`],
                ["Skipjack Tuna", `${t("species_skipjack", "Skipjack Tuna")} — பலயா மீன் (Balaya)`],
                ["Seer Fish", `${t("species_seer", "Seer Fish")} — தோரா / நெய்மீன் (Thora)`],
                ["Prawns", `${t("species_prawns", "Prawns")} — இறால் (Isso)`],
                ["Sardine", `${t("species_sardine", "Sardine")} — சாலை மீன் (Salaya)`],
                ["Mackerel", `${t("species_mackerel", "Mackerel")} — கானாங்கெளுத்தி (Kumbalawa)`],
                ["Other", `${t("species_other", "Other fish")} — பிற மீன்கள்`],
              ].map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            {t("catch_field_grade", "Quality grade")}
            <select name="grade" defaultValue={value.grade || "A"}>
              <option value="A">{t("catch_grade_a", "Grade A — Export / Premium Quality")}</option>
              <option value="B">{t("catch_grade_b", "Grade B — Fresh Local Market")}</option>
              <option value="C">{t("catch_grade_c", "Grade C — Processing / Drying")}</option>
            </select>
          </label>
          <label>
            {t("catch_field_weight", "Catch weight (kg)")}
            <div className="unit-input-group">
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
              <span className="unit-badge">kg</span>
            </div>
          </label>
          <label>
            {t("catch_field_base_price", "Base price (LKR / kg)")}
            <div className="unit-input-group">
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
              <span className="unit-badge">LKR / kg</span>
            </div>
          </label>
          <label>
            {t("catch_field_min_increment", "Minimum bid increment (LKR)")}
            <div className="unit-input-group">
              <input
                name="min_increment"
                type="number"
                min="0.01"
                step="0.01"
                max="10000000"
                defaultValue={value.min_increment || 50}
                required
                placeholder="50"
              />
              <span className="unit-badge">LKR</span>
            </div>
          </label>
          <label>
            {t("catch_field_harbor", "Arrival harbor")}
            <select name="harbor" defaultValue={value.harbor || "Dikkowita"}>
              {[
                ["Dikkowita", `${t("harbor_dikkowita", "Dikkowita")} — திக்கோவிற்ற`],
                ["Negombo", `${t("harbor_negombo", "Negombo")} — நீர்கொழும்பு`],
                ["Galle", `${t("harbor_galle", "Galle")} — காலி`],
                ["Mirissa", `${t("harbor_mirissa", "Mirissa")} — மிரிஸ்ஸ`],
                ["Trincomalee", `${t("harbor_trincomalee", "Trincomalee")} — திருகோணமலை`],
                ["Beruwala", `${t("harbor_beruwala", "Beruwala")} — பேருவளை`],
                ["Other", `${t("harbor_other", "Other harbor")} — பிற துறைமுகம்`],
              ].map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </label>
          <label>
            {t("catch_field_boat", "Boat name / registration")}
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
            {t("catch_field_arrival", "Estimated arrival (device local time)")}
            <input
              name="arrival_at"
              type="datetime-local"
              defaultValue={localArrival}
              required
            />
          </label>
        </div>
        <label>
          {t("catch_field_notes", "Catch notes")}
          <textarea
            name="notes"
            rows={3}
            maxLength={1000}
            defaultValue={value.notes}
            placeholder={t("catch_notes_placeholder", "Storage, catch condition, or collection details…")}
          />
        </label>
        <div className="alert">
          <ShieldCheck size={18} />
          <span>
            {t("catch_manager_review_notice", "The manager reviews your catch before publishing. You can edit or withdraw while it awaits review.")}
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
              {t("catch_save_on_device", "Save on device")}
            </button>
          )}
          <button className="btn primary" disabled={busy}>
            {busy
              ? t("action_saving", "Saving…")
              : edit
                ? t("action_save_changes", "Save changes")
                : online
                  ? t("catch_submit_catch", "Submit catch")
                  : t("catch_save_offline_draft", "Save offline draft")}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

function LotModal({ id, user, close, run, busy, onEdit, toast, online }) {
  const { lang, t } = useLanguage();
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
      title={l?.species ? t("species_" + l.species.toLowerCase().replace(/\s+/g, ""), l.species) : t("lot_modal_tab_details", "Auction details")}
      subtitle={
        l ? `${l.code} · ${t("harbor_suffix", "{harbor} harbor").replace("{harbor}", t("harbor_" + (l.harbor || "").toLowerCase(), l.harbor))}` : t("action_please_wait", "Loading the latest auction…")
      }
      close={close}
      wide
    >
      {error && (
        <div className="alert error">
          {error}
          <button onClick={load}>{t("action_retry", "Retry")}</button>
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
                  {t("lot_card_grade", "Grade {grade}", { grade: l.grade })} · {money(l.weight)} kg
                </span>
              </div>
            </div>
            <div className="detail-price">
              <span className="eyebrow">
                {l.highest_bid ? t("lot_modal_highest_bid", "CURRENT HIGHEST BID") : t("lot_modal_base_price", "BASE PRICE")}
              </span>
              <h2>
                LKR {money(l.highest_bid || l.base_price)}
                <small>{t("lot_card_per_kg", "/ kg")}</small>
              </h2>
              <p>{t("lot_modal_min_increment", "Minimum increment: LKR {increment} / kg", { increment: money(l.min_increment) })}</p>
              <div className="detail-chips">
                <span>
                  <Gavel size={15} />
                  {t("lot_modal_accepted_bids", "{count} accepted bids", { count: l.bid_count })}
                </span>
                <span>
                  <Layers size={15} />
                  {l.round ? t("lot_modal_round", "Round {round} of 3", { round: l.round }) : t("lot_modal_not_started", "Not started")}
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
                    {t("lot_modal_your_bid_label", "Your bid (LKR / kg)")}
                    <input
                      aria-label="Your bid amount"
                      type="number"
                      min={minimum}
                      step="0.01"
                      max="10000000"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={t("lot_modal_min_placeholder", "Minimum {min}", { min: money(minimum) })}
                    />
                  </label>
                  <div className="quick-bids" aria-label="Quick bid increments">
                    <span className="quick-bid-label">{t("lot_modal_quick_raise", "Quick raise:")}</span>
                    {[50, 100, 250, 500].map((step) => (
                      <button
                        key={step}
                        type="button"
                        className="quick-bid-pill"
                        onClick={() => {
                          const currentBase = Number(amount) > minimum ? Number(amount) : minimum;
                          setAmount(String(currentBase + step));
                        }}
                      >
                        +{step} LKR
                      </button>
                    ))}
                  </div>
                  <div className="est-total-box">
                    <div className="est-total-calc">
                      <small>{t("lot_modal_calc_label", "Calculation")}</small>
                      <span>
                        {money(l.weight)} kg × LKR {money(Number(amount) || minimum)} / kg
                      </span>
                    </div>
                    <div className="est-total-res">
                      <small>{t("lot_modal_est_total_label", "Estimated total")}</small>
                      <strong>LKR {money((Number(amount) || minimum) * Number(l.weight))}</strong>
                    </div>
                  </div>
                  <small className="bid-commit-note">
                    {t("lot_modal_bid_commit_note", "Accepted bids are final and cannot be withdrawn.")}
                  </small>
                  {!user.verified && (
                    <div className="alert warning" style={{ margin: "8px 0" }}>
                      <ShieldCheck size={18} />
                      <span>
                        <strong>{t("lot_modal_awaiting_verification_title", "Awaiting Verification:")}</strong> {t("lot_modal_awaiting_verification_desc", "The harbor manager reviews all new buyers before bidding is unlocked.")}
                      </span>
                    </div>
                  )}
                  <button
                    className="btn primary full"
                    disabled={busy || !user.verified || !online}
                  >
                    <Gavel size={17} />
                    {busy
                      ? t("action_submitting", "Submitting…")
                      : user.verified
                        ? t("action_place_bid", "Place bid")
                        : t("lot_modal_verification_required", "Verification required")}
                  </button>
                </form>
              )}
              {l.status === "closed" && (
                <div className="sale-summary">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>
                      {l.winner_id === user.id
                        ? t("lot_modal_you_won", "You won this auction")
                        : t("lot_modal_won_by", "Won by {winner}", { winner: l.winner_name })}
                    </strong>
                    <span>{t("lot_modal_total_sale", "Total sale: LKR {total}", { total: money(l.final_price) })}</span>
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
            ].map((tabKey) => {
              const tabName = {
                details: t("lot_modal_tab_details", "Details"),
                bids: t("lot_modal_tab_bids", "Bids"),
                timeline: t("lot_modal_tab_timeline", "Timeline"),
                payments: t("lot_modal_tab_payments", "Payments"),
              }[tabKey] || tabKey;
              return (
                <button
                  key={tabKey}
                  className={tab === tabKey ? "selected" : ""}
                  onClick={() => setTab(tabKey)}
                >
                  {tabName}
                  {tabKey === "bids" && <span>{data.bids.length}</span>}
                </button>
              );
            })}
          </div>
          <div className="modal-body">
            {tab === "details" && (
              <>
                <div className="detail-grid">
                  {[
                    [t("lot_modal_seller", "Seller"), l.seller_name],
                    [t("lot_modal_boat", "Boat"), l.boat_name],
                    [t("lot_modal_harbor", "Harbor"), t("harbor_" + (l.harbor || "").toLowerCase(), l.harbor)],
                    [t("lot_modal_est_arrival", "Estimated arrival"), date(l.arrival_at)],
                    [t("lot_modal_declared_weight", "Declared weight"), `${money(l.weight)} kg`],
                    [
                      t("lot_modal_inspected_weight", "Inspected weight"),
                      l.arrived
                        ? `${money(l.actual_weight)} kg`
                        : t("lot_modal_awaiting_arrival", "Awaiting arrival"),
                    ],
                    [t("lot_modal_base_price", "Base price"), `LKR ${money(l.base_price)} / kg`],
                    [
                      t("lot_modal_bid_visibility", "Bid visibility"),
                      t("lot_modal_bid_visibility_desc", "Open amounts · buyer identities private"),
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
                    <strong>{t("catch_field_notes", "Catch notes")}</strong>
                    <p>{l.notes}</p>
                  </div>
                )}
                {l.cancel_reason && (
                  <div className="alert warning">
                    {t("lot_modal_cancellation_reason", "Cancellation reason: {reason}", { reason: l.cancel_reason })}
                  </div>
                )}
                {owner && l.status === "pending" && (
                  <div className="manager-actions">
                    <button className="btn secondary" onClick={() => onEdit(l)}>
                      {t("action_edit_catch", "Edit catch")}
                    </button>
                    <button
                      className="btn danger-outline"
                      onClick={() => setAction("cancel")}
                    >
                      {t("action_withdraw_catch", "Withdraw catch")}
                    </button>
                  </div>
                )}
                {admin &&
                  !["closed", "unsold", "cancelled"].includes(l.status) && (
                    <section className="manager-panel">
                      <div className="section-heading">
                        <div>
                          <h3>{t("lot_modal_manager_controls", "Auction manager controls")}</h3>
                          <p>{t("lot_modal_audit_trail_notice", "All changes are recorded in the audit trail.")}</p>
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
                            {t("action_approve_publish", "Approve & publish")}
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
                            <span>{t("lot_modal_min_unit", "min")}</span>
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
                              {t("action_start_round", "Start round {round}", { round: l.round + 1 })}
                            </button>
                          </div>
                        )}
                        {active && (
                          <button
                            className="btn secondary"
                            disabled={busy}
                            onClick={() => setAction("end-round")}
                          >
                            {t("action_end_round", "End current round")}
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
                              {t("action_verify_arrival", "Verify arrival")}
                            </button>
                          )}
                        {l.arrived && !active && (
                          <button
                            className="btn primary"
                            disabled={busy}
                            onClick={() => setAction("close")}
                          >
                            <CheckCircle2 size={16} />
                            {t("action_finalize_auction", "Finalize auction")}
                          </button>
                        )}
                        <button
                          className="btn danger-outline"
                          disabled={busy}
                          onClick={() => setAction("cancel")}
                        >
                          {t("action_cancel_lot", "Cancel lot")}
                        </button>
                      </div>
                      {active && (
                        <p className="muted small-text">
                          {t("lot_modal_manager_end_notice", "End the round before finalizing the auction. Confirm arrival and the catch weight first.")}
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
                        <th>{t("lot_modal_th_buyer", "Buyer")}</th>
                        <th>{t("lot_modal_th_bid_per_kg", "Bid / kg")}</th>
                        <th>{t("lot_modal_th_round", "Round")}</th>
                        <th>{t("lot_modal_th_accepted_at", "Accepted at")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bids.map((b) => (
                        <tr key={b.id}>
                          <td>
                            <strong>{b.is_mine ? t("lot_modal_you", "You") : b.buyer_name}</strong>
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
                  title={t("lot_modal_no_bids_title", "No bids yet")}
                  text={t("lot_modal_no_bids_text", "The first valid bid must meet the base price.")}
                />
              ))}
            {tab === "timeline" && <ActivityList events={data.events} />}
            {tab === "payments" && (
              <>
                <div className="invoice-summary">
                  <div>
                    <small>{t("payments_stat_turnover", "Sale total")}</small>
                    <strong>LKR {money(l.final_price)}</strong>
                  </div>
                  <div>
                    <small>{t("lot_modal_commission", "Commission ({rate}%)", { rate: l.commission_rate })}</small>
                    <strong>LKR {money(l.commission)}</strong>
                  </div>
                  <div>
                    <small>{t("lot_modal_seller_proceeds", "Seller proceeds")}</small>
                    <strong>
                      LKR {money(Number(l.final_price) - Number(l.commission))}
                    </strong>
                  </div>
                  <div>
                    <small>{t("lot_modal_balance_due", "Balance · due {date}", { date: date(l.payment_due_at) })}</small>
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
                    <h3>{t("lot_modal_record_payment_title", "Record a received payment")}</h3>
                    <p>
                      {t("lot_modal_record_payment_desc", "Confirm receipt before recording. This records a payment; it does not transfer money.")}
                    </p>
                    <div className="form-grid">
                      <label>
                        {t("lot_modal_amount_label", "Amount (LKR)")}
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
                        {t("lot_modal_receipt_label", "Receipt / bank reference")}
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
                      {t("action_record_payment", "Record payment")}
                    </button>
                  </form>
                )}
                {payments.length ? (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{t("lot_modal_th_reference", "Reference")}</th>
                          <th>{t("lot_modal_th_amount", "Amount (LKR)")}</th>
                          <th>{t("lot_modal_th_recorded_by", "Recorded by")}</th>
                          <th>{t("lot_modal_th_date", "Date")}</th>
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
                  <p className="muted">{t("lot_modal_no_payments", "No payment receipts recorded yet.")}</p>
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
                        arrival: t("lot_modal_action_arrival", "Confirm catch arrival"),
                        cancel: t("lot_modal_action_cancel", "Cancel this lot"),
                        "end-round": t("lot_modal_action_end_round", "End the current round?"),
                        close: t("lot_modal_action_close", "Finalize this auction?"),
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
                      {t("lot_modal_arrival_desc", "Inspect the catch at the harbor. A weight different from the advertised catch requires cancellation and relisting.")}
                    </p>
                    <label>
                      {t("lot_modal_inspected_weight", "Inspected weight")} (kg)
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
                    {t("lot_modal_cancel_reason_label", "Reason for cancellation")}
                    <textarea
                      required
                      minLength={5}
                      maxLength={500}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t("lot_modal_cancel_placeholder", "Explain withdrawal, weight mismatch, or non-arrival…")}
                    />
                  </label>
                )}
                {action === "close" && (
                  <p>
                    {l.highest_bid
                      ? t("lot_modal_close_desc_bids", "Award this lot to {winner} at LKR {price}/kg. The sale total will be LKR {total}.", {
                          winner: l.winner_name || "the highest valid bidder",
                          price: money(l.highest_bid),
                          total: money(Number(l.highest_bid) * Number(l.actual_weight)),
                        })
                      : t("lot_modal_close_desc_nobids", "This lot has no accepted bids. It will be marked unsold.")}
                  </p>
                )}
                {action === "end-round" && (
                  <p>
                    {t("lot_modal_end_round_desc", "New bids will stop immediately. You can then verify arrival, finalize, or start the next available round.")}
                  </p>
                )}
                <button
                  className={`btn ${action === "cancel" ? "danger-solid" : "primary"}`}
                  disabled={busy}
                >
                  {busy ? t("action_saving", "Saving…") : t("action_confirm", "Confirm")}
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
