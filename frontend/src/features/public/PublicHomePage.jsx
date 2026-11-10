import React, { useEffect } from "react";
import { useLocation } from "react-router";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import HomeContent from "./HomeContent.jsx";
import PwaStatus from "../../PwaStatus.jsx";
import { pagePath } from "../../app/route-config.js";
import { useLanguage } from "./language.js";
import "./public-home.css";

// Uses the application's existing router, session and language provider.
export default function PublicHomePage({ user }) {
  const { hash } = useLocation();
  const { language } = useLanguage();
  const marketplacePath = user ? pagePath(user.role, "auctions") : "/login";
  useEffect(() => {
    const previous = document.title;
    document.title = "HarborX — From our harbors, to new horizons";
    return () => {
      document.title = previous;
    };
  }, []);
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <>
      <div className="hx-public">
        <a href="#public-main" className="skip-link" tabIndex={0}>
          Skip to homepage content
        </a>
        <Navbar />
        {language !== "en" && (
          <div className="translation-note">
            Navigation and the introduction are translated. Other homepage
            content is in English.
          </div>
        )}
        <main id="public-main" tabIndex={-1}>
          <HomeContent marketplacePath={marketplacePath} />
        </main>
        <Footer marketplacePath={marketplacePath} />
      </div>
      <PwaStatus />
    </>
  );
}
