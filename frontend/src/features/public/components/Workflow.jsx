import React from "react";
import { workflow } from "../data.js";
import { Icon } from "./Common.jsx";
export default function Workflow() {
  return (
    <ol className="workflow">
      {workflow.map(([icon, title, text], i) => (
        <li key={title}>
          <div className="workflow-top">
            <span className="step-number">0{i + 1}</span>
            <Icon name={icon} size={25} />
          </div>
          <h3>{title}</h3>
          <p>{text}</p>
        </li>
      ))}
    </ol>
  );
}
