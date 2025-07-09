// src/components/DropdownItem.js
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./DropdownItem.css"; // required for submenu styling

function DropdownItem({ label, to, onClick, submenu = [] }) {
  const [open, setOpen] = useState(false);
  const hasSubmenu = submenu.length > 0;

  if (hasSubmenu) {
    return (
      <div
        className="dropdown-submenu-wrapper"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="dropdown-item dropdown-submenu-label">
          <Link
            to={to}
            className="dropdown-item dropdown-submenu-label"
            onClick={onClick}
          >
            {label}
          </Link>
        </div>
        {open && (
          <ul className="dropdown-menu submenu-right show">
            {submenu.map((item, idx) => (
              <li key={idx}>
                <Link className="dropdown-item" to={item.to} onClick={onClick}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <Link className="dropdown-item" to={to} onClick={onClick}>
      {label}
    </Link>
  );
}

export default DropdownItem;
