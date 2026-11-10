import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Brand, Icon } from "./Common.jsx";
import { useLanguage } from "../language.js";
export const navigation = [
  ["/", 0],
  ["/#services", 1],
  ["/#gallery", 2],
  ["/#about", 3],
  ["/#contact", 4],
  ["/#how-it-works", 5],
];
export default function Navbar() {
  const { language, setLanguage, nav } = useLanguage();
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const { pathname, hash } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);
  useEffect(() => {
    if (!open) return;
    function close(e) {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <div className="nav-brand">
          <Brand />
          <label className="language-select">
            <Icon name="Globe2" size={15} />
            <span className="sr-only">Website language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Website language"
            >
              <option value="en">EN</option>
              <option value="si">සිං</option>
              <option value="ta">தமிழ்</option>
            </select>
          </label>
        </div>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="public-navigation"
          onClick={() => setOpen(!open)}
        >
          <Icon name={open ? "X" : "Menu"} />
        </button>
        <div
          id="public-navigation"
          className={`navigation ${open ? "is-open" : ""}`}
        >
          <nav aria-label="Main navigation">
            {navigation.map(([path, index]) => (
              <Link
                key={path}
                to={path}
                aria-current={pathname + hash === path ? "location" : undefined}
              >
                {nav[index]}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Link className="talk-link" to="/#contact">
              <Icon name="Phone" size={14} />
              {nav[6]}
            </Link>
            <NavLink to="/login" className="login-link">
              {nav[7]}
            </NavLink>
            <NavLink to="/register" className="button small">
              {nav[8]}
              <Icon name="ArrowUpRight" size={16} />
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}
