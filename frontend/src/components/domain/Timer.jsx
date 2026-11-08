import React, { useState, useEffect } from "react";
import { useLanguage } from "../../i18n.jsx";

/**
 * Auction countdown timer component.
 * Displays hours, minutes, and seconds until `until` timestamp.
 */
export function Timer({ until }) {
  const { t } = useLanguage();
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.floor((new Date(until) - Date.now()) / 1000)),
  );

  useEffect(() => {
    const update = () =>
      setSeconds(Math.max(0, Math.floor((new Date(until) - Date.now()) / 1000)));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [until]);

  return (
    <span>
      {seconds > 0
        ? `${Math.floor(seconds / 3600) ? `${Math.floor(seconds / 3600)}h ` : ""}${Math.floor((seconds % 3600) / 60)}m ${String(seconds % 60).padStart(2, "0")}s`
        : t("helper_round_ended", "Round ended")}
    </span>
  );
}
