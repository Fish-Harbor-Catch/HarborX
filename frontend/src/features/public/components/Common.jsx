import React from "react";
import { Link } from "react-router";
import {
  Fish,
  Gavel,
  Store,
  ShieldCheck,
  ReceiptText,
  CloudOff,
  UserRoundPlus,
  BadgeCheck,
  Handshake,
  Anchor,
  Smartphone,
  ArrowUpRight,
  Waves,
  Globe2,
  X,
  Menu,
  Phone,
  MapPin,
  Play,
  Pause,
  Files,
  ClipboardList,
} from "lucide-react";
const Icons = {
  Fish,
  Gavel,
  Store,
  ShieldCheck,
  ReceiptText,
  CloudOff,
  UserRoundPlus,
  BadgeCheck,
  Handshake,
  Anchor,
  Smartphone,
  ArrowUpRight,
  Waves,
  Globe2,
  X,
  Menu,
  Phone,
  MapPin,
  Play,
  Pause,
  Files,
  ClipboardList,
};
export function Icon({ name, ...props }) {
  const Glyph = Icons[name] || Icons.Fish;
  return <Glyph size={24} strokeWidth={1.5} aria-hidden="true" {...props} />;
}
export function Brand({ light = false }) {
  return (
    <Link
      to="/"
      aria-label="HarborX home"
      className={`brand ${light ? "brand-light" : ""}`}
    >
      <span className="brand-mark">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <path d="M10 7v26M30 7v26M10 19h20M7 27q6-7 13 0t13 0" />
        </svg>
      </span>
      <span>
        <strong>
          Harbor<span>X</span>
        </strong>
        <small>THE HARBOR. CONNECTED.</small>
      </span>
    </Link>
  );
}
export function SectionHeading({ eyebrow, title, text, children }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        {text && <p>{text}</p>}
      </div>
      {children}
    </div>
  );
}
export function CallToAction() {
  return (
    <section className="cta container">
      <div>
        <span className="eyebrow">A NEW HORIZON STARTS HERE</span>
        <h2>
          Your next connection
          <br />
          is just a catch away.
        </h2>
        <p>
          For the people who bring the catch home.
          <br />
          And the businesses that bring it to the table.
        </p>
      </div>
      <div className="cta-actions">
        <Link to="/register" className="button light">
          Join as a seller <Icon name="ArrowUpRight" size={19} />
        </Link>
        <Link to="/register" className="button outline-light">
          Join as a buyer <Icon name="ArrowUpRight" size={19} />
        </Link>
      </div>
      <Icon name="Waves" className="cta-watermark" size={280} />
    </section>
  );
}
