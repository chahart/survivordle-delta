import { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";

const BB_NAV_CSS = `
  .bb-nav-logo {
    font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px;
    background: linear-gradient(to right, #1a6fbf, #5aaedd, #b8e4f5);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    text-decoration: none; flex-shrink: 0;
  }
  .bb-nav .nav-btn:hover { border-color: #5aaedd; color: #5aaedd; }
  .bb-nav .nav-tab.active { color: #5aaedd; border-bottom-color: #5aaedd; }
  .bb-nav .nav-secondary-link.active { color: #5aaedd; }
  .bb-nav .nav-more-btn:hover, .bb-nav .nav-more-btn.open { color: #5aaedd; }
  .bb-nav .nav-more-item.active { color: #5aaedd; }
`;

export default function BBNavBar({ lightMode, onToggleLight, colorblind, onToggleColorblind }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  // Close dropdown on route change
  useEffect(() => { setMoreOpen(false); }, [location]);

  // Close dropdown on outside tap
  useEffect(() => {
    function handleClick(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [moreOpen]);

  return (
    <nav className="nav bb-nav">
      <style>{BB_NAV_CSS}</style>

      {/* Row 1: logo + utility buttons */}
      <div className="nav-row1">
        <NavLink to="/bb" className="bb-nav-logo">BIG BR👁THERDLE</NavLink>
        <div className="nav-right">
          <NavLink
            to="/bb/how-to-play"
            className={({ isActive }) => `nav-btn how${isActive ? " active" : ""}`}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center" }}
            title="How to Play"
          >
            ?
          </NavLink>
          <NavLink to="/bb/stats"
            className={({ isActive }) => `nav-btn${isActive ? " active" : ""}`}
            style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}
            title="Stats"
          >
            📊
          </NavLink>
          <button
            className="nav-btn"
            onClick={onToggleColorblind}
            title="Colorblind mode"
            style={colorblind ? { borderColor: "#4a8aff", color: "#4a8aff" } : {}}
          >
            👁
          </button>
          <button className="nav-btn" onClick={onToggleLight} title="Toggle theme">
            {lightMode ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Row 2: page tabs + gateway back to Survivordle */}
      <div className="nav-row2">
        <div className="nav-tabs" style={{ flex: 1 }}>
          <NavLink to="/" className="nav-tab nav-tab-gateway gateway-surv" title="Go to Survivordle">
            SURVIVORDLE
          </NavLink>
          <NavLink to="/bb" end className={({ isActive }) => `nav-tab${isActive ? " active" : ""}`}>
            Daily
          </NavLink>
          <NavLink to="/bb/archive" className={({ isActive }) => `nav-tab${isActive ? " active" : ""}`}>
            Archive
          </NavLink>
          <NavLink to="/bb/unlimited" className={({ isActive }) => `nav-tab${isActive ? " active" : ""}`}>
            Unlimited
          </NavLink>
          <NavLink to="/bb/recall" className={() => `nav-tab${location.pathname.startsWith("/bb/recall") ? " active" : ""}`}>
            Recall
          </NavLink>
          <NavLink to="/bb/sandwich" className={() => `nav-tab${location.pathname.startsWith("/bb/sandwich") ? " active" : ""}`}>
            Sandwich
          </NavLink>
        </div>

        {/* Desktop: secondary links */}
        <div className="nav-secondary">
          <NavLink to="/bb/how-to-play" className={({ isActive }) => `nav-secondary-link${isActive ? " active" : ""}`}>
            How to Play
          </NavLink>
          <NavLink to="/bb/faq" className={({ isActive }) => `nav-secondary-link${isActive ? " active" : ""}`}>
            FAQ
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-secondary-link${isActive ? " active" : ""}`}>
            About
          </NavLink>
          <NavLink to="/privacy" className={({ isActive }) => `nav-secondary-link${isActive ? " active" : ""}`}>
            Privacy
          </NavLink>
        </div>

        {/* Mobile only: More dropdown */}
        <div className="nav-more-wrap" ref={moreRef}>
          <button
            className={`nav-more-btn${moreOpen ? " open" : ""}`}
            onClick={() => setMoreOpen(o => !o)}
          >
            More {moreOpen ? "▲" : "▼"}
          </button>
          {moreOpen && (
            <div className="nav-more-dropdown">
              <NavLink to="/bb/how-to-play" className={({ isActive }) => `nav-more-item${isActive ? " active" : ""}`}>
                How to Play
              </NavLink>
              <NavLink to="/bb/faq" className={({ isActive }) => `nav-more-item${isActive ? " active" : ""}`}>
                FAQ
              </NavLink>
              <NavLink to="/about" className={({ isActive }) => `nav-more-item${isActive ? " active" : ""}`}>
                About
              </NavLink>
              <NavLink to="/privacy" className={({ isActive }) => `nav-more-item${isActive ? " active" : ""}`}>
                Privacy
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
