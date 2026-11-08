import React from "react";
import { Wallet, Gavel, CheckCircle2, Fish, Activity } from "lucide-react";
import { EmptyState } from "../ui/EmptyState.jsx";
import { date } from "../../api.js";

/**
 * Modernized Activity Timeline component.
 * Displays audit log events with contextual maritime status icons and timestamps.
 */
export function ActivityList({ events }) {
  if (!events || events.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="A fresh start"
        text="Your workspace activity will appear here."
      />
    );
  }

  return (
    <div className="activity-list">
      {events.map((e, i) => (
        <div className="activity-item" key={`${e.created_at}-${i}`}>
          <span
            className={`activity-icon ${
              e.action.includes("Payment")
                ? "teal"
                : e.action.includes("closed")
                  ? "blue"
                  : ""
            }`}
          >
            {e.action.includes("Payment") ? (
              <Wallet size={16} aria-hidden="true" />
            ) : e.action.includes("Round") ? (
              <Gavel size={16} aria-hidden="true" />
            ) : e.action.includes("closed") ? (
              <CheckCircle2 size={16} aria-hidden="true" />
            ) : (
              <Fish size={16} aria-hidden="true" />
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
  );
}
