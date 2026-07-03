import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import CSS, { TAB_CSS, SUBTAB_CSS, PRIVACY_CSS, STATS_PAGE_CSS, ABOUT_CSS, FOOTER_CSS, RECALL_CSS, SANDWICH_CSS } from "./shared/styles";
import NavBar from "./components/NavBar";
import BBNavBar from "./components/BBNavBar";
import Footer from "./components/Footer";
import Ramp from "./components/RAMP";
import Daily from "./pages/Daily";
import Archive from "./pages/Archive";
import Unlimited from "./pages/Unlimited";
import Privacy from "./pages/Privacy";
import About from "./pages/About";
import Stats from "./pages/Stats";
import HowToPlay from "./pages/HowToPlay";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Recall from "./pages/Recall";
import Sandwich from "./pages/Sandwich";
import BB from "./pages/BB";
import BBRecall from "./pages/BBRecall";
import BBSandwich from "./pages/BBSandwich";
import BBHowToPlay from "./pages/BBHowToPlay";
import BBFAQ from "./pages/BBFAQ";
import { AnnouncementModal } from "./components/Modals";

const BANNER_KEY = "survivordle_announcement_sandwich_jun23";
const BANNER_START  = new Date("2026-06-23T14:00:00Z");
const BANNER_EXPIRY = new Date("2026-06-24T14:00:00Z");

const PUB_ID = import.meta.env.VITE_PLAYWIRE_PUB_ID;
const WEBSITE_ID = import.meta.env.VITE_PLAYWIRE_WEBSITE_ID;

export default function App() {
  const [contestants,      setContestants]      = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [lightMode,        setLightMode]        = useState(false);
  const [colorblind,       setColorblind]       = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isBB = location.pathname === "/bb" || location.pathname.startsWith("/bb/");

  useEffect(() => {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "icon");
      document.head.appendChild(link);
    }
    if (isBB) {
      link.setAttribute("type", "image/svg+xml");
      link.setAttribute(
        "href",
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%91%81%3C/text%3E%3C/svg%3E"
      );
    } else {
      link.setAttribute("type", "image/png");
      link.setAttribute("href", "/favicon-32x32.png");
    }
  }, [isBB]);

  useEffect(() => {
    fetch("/contestants.json")
      .then(r => r.json())
      .then(data => { setContestants(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    const now = new Date();
    if (!localStorage.getItem(BANNER_KEY) && now >= BANNER_START && now < BANNER_EXPIRY) {
      const timer = setTimeout(() => setShowAnnouncement(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  function dismissAnnouncement() {
    localStorage.setItem(BANNER_KEY, "1");
    setShowAnnouncement(false);
  }

  function goToSandwich() {
    dismissAnnouncement();
    navigate("/sandwich");
  }

  if (loading) return (
    <>
      <style>{CSS}</style>
      <style>{TAB_CSS}{SUBTAB_CSS}{PRIVACY_CSS}{STATS_PAGE_CSS}{ABOUT_CSS}{FOOTER_CSS}{RECALL_CSS}{SANDWICH_CSS}</style>
      <div className="page"><div className="loading">🔥 Loading the tribe…</div></div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <style>{TAB_CSS}{SUBTAB_CSS}{PRIVACY_CSS}{STATS_PAGE_CSS}{ABOUT_CSS}{FOOTER_CSS}{RECALL_CSS}{SANDWICH_CSS}</style>
      <style>{lightMode ? "body{background:#f5f0e8}" : "body{background:#0a0a0a}"}</style>
      <div className={lightMode ? "light" : ""}>

        <Ramp PUB_ID={PUB_ID} WEBSITE_ID={WEBSITE_ID} />

        {isBB ? (
          <BBNavBar
            lightMode={lightMode}
            onToggleLight={() => setLightMode(m => !m)}
            colorblind={colorblind}
            onToggleColorblind={() => setColorblind(m => !m)}
          />
        ) : (
          <NavBar
            lightMode={lightMode}
            onToggleLight={() => setLightMode(m => !m)}
            colorblind={colorblind}
            onToggleColorblind={() => setColorblind(m => !m)}
          />
        )}

        <div className="page">
          <Routes>
            <Route path="/"            element={<Daily     contestants={contestants} colorblind={colorblind} />} />
            <Route path="/archive"     element={<Archive   contestants={contestants} colorblind={colorblind} />} />
            <Route path="/unlimited"   element={<Unlimited contestants={contestants} colorblind={colorblind} />} />
            <Route path="/stats"       element={<Stats />} />
            <Route path="/privacy"     element={<Privacy />} />
            <Route path="/about"       element={<About />} />
            <Route path="/how-to-play" element={<HowToPlay />} />
            <Route path="/faq"         element={<FAQ />} />
            <Route path="/blog"        element={<Blog />} />
            <Route path="/blog/:slug"  element={<BlogPost />} />
            <Route path="/recall"             element={<Recall contestants={contestants} />} />
            <Route path="/recall/archive"   element={<Recall contestants={contestants} />} />
            <Route path="/recall/unlimited" element={<Recall contestants={contestants} />} />
            <Route path="/recall/stats"     element={<Recall contestants={contestants} />} />
            <Route path="/sandwich"           element={<Sandwich contestants={contestants} colorblind={colorblind} />} />
            <Route path="/sandwich/archive"   element={<Sandwich contestants={contestants} colorblind={colorblind} />} />
            <Route path="/sandwich/unlimited" element={<Sandwich contestants={contestants} colorblind={colorblind} />} />
            <Route path="/sandwich/stats"     element={<Sandwich contestants={contestants} colorblind={colorblind} />} />
            <Route path="/bb"           element={<BB colorblind={colorblind} />} />
            <Route path="/bb/archive"   element={<BB colorblind={colorblind} />} />
            <Route path="/bb/unlimited" element={<BB colorblind={colorblind} />} />
            <Route path="/bb/stats"     element={<BB colorblind={colorblind} />} />
            <Route path="/bb/recall"           element={<BBRecall colorblind={colorblind} />} />
            <Route path="/bb/recall/archive"   element={<BBRecall colorblind={colorblind} />} />
            <Route path="/bb/recall/unlimited" element={<BBRecall colorblind={colorblind} />} />
            <Route path="/bb/recall/stats"     element={<BBRecall colorblind={colorblind} />} />
            <Route path="/bb/sandwich"           element={<BBSandwich colorblind={colorblind} />} />
            <Route path="/bb/sandwich/archive"   element={<BBSandwich colorblind={colorblind} />} />
            <Route path="/bb/sandwich/unlimited" element={<BBSandwich colorblind={colorblind} />} />
            <Route path="/bb/sandwich/stats"     element={<BBSandwich colorblind={colorblind} />} />
            <Route path="/bb/how-to-play" element={<BBHowToPlay />} />
            <Route path="/bb/faq"         element={<BBFAQ />} />
          </Routes>
        </div>

        <Footer isBB={isBB} />

        {showAnnouncement && (
          <AnnouncementModal
            onClose={dismissAnnouncement}
            onPlaySandwich={goToSandwich}
          />
        )}

      </div>
    </>
  );
}