import React, { useState, useEffect } from "react";

/**
 * Auction countdown timer component.
 * Displays hours, minutes, and seconds until `until` timestamp.
 */
export function Timer({ until }) {
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
        : "Round ended"}
    </span>
  );
}
