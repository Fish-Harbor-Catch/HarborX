import React from "react";
import { Link } from "react-router";
import { Icon } from "./Common.jsx";
export default function ServiceCard({ service, index }) {
  return (
    <Link className="service-card" to="/#how-it-works">
      <span className="service-icon">
        <Icon name={service.icon} size={27} />
      </span>
      <span className="card-number">0{index + 1}</span>
      <h3>{service.title}</h3>
      <p>{service.text}</p>
      <span className="text-link">
        How it works <Icon name="ArrowUpRight" size={18} />
      </span>
    </Link>
  );
}
