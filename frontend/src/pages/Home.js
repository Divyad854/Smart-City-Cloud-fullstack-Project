import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("vis")),
      { threshold: 0.10 }
    );
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const goto = (id) => {
    setMenuOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --font-display: 'Outfit', sans-serif;
          --font-body: 'DM Sans', sans-serif;
          --navy:      #0f1e38;
          --navy-d:    #0a1628;
          --navy-m:    #172542;
          --blue:      #2f6fe8;
          --blue-lt:   #5a9bec;
          --blue-pale: #e8f0fd;
          --green:     #00d084;
          --amber:     #f5a623;
          --bg:        #f0f4fb;
          --surface:   #ffffff;
          --border:    #dde6f5;
          --text:      #0f1e38;
          --soft:      #5a7090;
        }

        html { scroll-behavior: smooth; }
        body { font-family: var(--font-body); background: var(--bg); color: var(--text); line-height: 1.6; overflow-x: hidden; }

        /* ─── NAV ─── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 9999;
          height: 80px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          padding: 0 52px;
          transition: background 0.3s ease, box-shadow 0.3s ease, height 0.3s ease;
        }
        .nav.stuck {
          background: rgba(10, 22, 40, 0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4);
          height: 72px;
        }

        .nav-brand { display: flex; align-items: center; gap: 12px; text-decoration: none; cursor: pointer; }
        .nav-logo {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #1a56db 0%, #5a9bec 100%);
          font-size: 22px;
          box-shadow: 0 4px 14px rgba(47,111,232,0.45);
        }
        .nav-wordmark { font-family: var(--font-display); font-weight: 800; font-size: 19px; color: #fff; letter-spacing: -0.5px; }
        .nav-wordmark b { color: #60a5fa; }
        .nav-pill {
          font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
          color: #60a5fa; background: rgba(90,155,236,0.15); border: 1px solid rgba(90,155,236,0.3);
          padding: 4px 10px; border-radius: 6px;
        }

        .nav-links { display: flex; align-items: center; gap: 4px; justify-content: center; }
        .nl {
          padding: 9px 18px; border-radius: 10px; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.65); background: none; border: none; cursor: pointer;
          transition: all 0.2s; font-family: var(--font-body); text-decoration: none; letter-spacing: -0.1px;
        }
        .nl:hover { color: #fff; background: rgba(255,255,255,0.08); }

        .nav-right { display: flex; align-items: center; gap: 10px; justify-content: flex-end; }
        .nav-login {
          padding: 9px 18px; border-radius: 10px; font-size: 14px; font-weight: 600;
          color: rgba(255,255,255,0.65); text-decoration: none; transition: all 0.2s;
        }
        .nav-login:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .nav-cta {
          padding: 10px 24px; border-radius: 10px; background: var(--blue); color: #fff;
          font-size: 14px; font-weight: 700; text-decoration: none; transition: all 0.22s;
          box-shadow: 0 4px 16px rgba(47,111,232,0.45); font-family: var(--font-body); letter-spacing: -0.2px;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .nav-cta:hover { background: #2460d0; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(47,111,232,0.55); }

        .nav-ham { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 8px; background: none; border: none; }
        .nav-ham span { width: 24px; height: 2px; background: #fff; border-radius: 2px; transition: all 0.3s; display: block; }
        .nav-mob {
          display: none; position: fixed; top: 72px; left: 0; right: 0;
          background: rgba(10, 22, 40, 0.98); backdrop-filter: blur(20px);
          padding: 20px 24px 28px; flex-direction: column; gap: 4px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 9998;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-mob.open { display: flex; }
        .nm {
          padding: 12px 16px; border-radius: 10px; font-size: 15px; font-weight: 600;
          color: rgba(255,255,255,0.72); background: none; border: none; cursor: pointer;
          text-align: left; font-family: var(--font-body); transition: all 0.2s;
        }
        .nm:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .nm-cta { background: var(--blue) !important; color: #fff !important; margin-top: 8px; border-radius: 10px; }

        @media (max-width: 900px) {
          .nav { padding: 0 24px; grid-template-columns: 1fr auto; }
          .nav-links, .nav-right { display: none; }
          .nav-ham { display: flex; }
        }

        /* ─── HERO ─── */
        .hero { min-height: 100vh; background: linear-gradient(155deg, var(--navy-d) 0%, var(--navy) 50%, var(--navy-m) 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 100px 24px 64px; }
        .hero::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(90,155,236,0.10) 1px, transparent 1px); background-size: 30px 30px; mask-image: radial-gradient(ellipse 85% 75% at 50% 45%, black 30%, transparent 100%); }
        .h-orb1 { position: absolute; top: -100px; right: -100px; width: 560px; height: 560px; border-radius: 50%; background: radial-gradient(circle, rgba(47,111,232,0.20) 0%, transparent 65%); pointer-events: none; }
        .h-orb2 { position: absolute; bottom: -80px; left: -80px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(0,208,132,0.09) 0%, transparent 65%); pointer-events: none; }
        .hero-inner { position: relative; z-index: 1; max-width: 800px; text-align: center; }
        .hero-chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 100px; background: rgba(90,155,236,0.11); border: 1px solid rgba(90,155,236,0.26); color: #93c5fd; font-size: 12.5px; font-weight: 600; margin-bottom: 30px; }
        .chip-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); animation: blink 2.2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
        .hero-title { font-family: var(--font-display); font-size: clamp(42px, 7.5vw, 86px); font-weight: 800; color: #fff; line-height: 1.0; letter-spacing: -2px; margin-bottom: 26px; }
        .hero-title em { font-style: normal; color: #60a5fa; }
        .hero-sub { font-size: 16.5px; font-weight: 400; color: rgba(255,255,255,0.48); max-width: 490px; margin: 0 auto 46px; line-height: 1.8; }
        .hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn-p { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 10px; background: var(--blue); color: #fff; font-size: 14.5px; font-weight: 700; text-decoration: none; transition: all 0.25s; box-shadow: 0 5px 20px rgba(47,111,232,0.42); font-family: var(--font-body); }
        .btn-p:hover { background: #2460d0; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(47,111,232,0.52); }
        .btn-g { display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; border-radius: 10px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.80); font-size: 14.5px; font-weight: 600; text-decoration: none; transition: all 0.25s; font-family: var(--font-body); }
        .btn-g:hover { background: rgba(255,255,255,0.12); color: #fff; transform: translateY(-2px); }
        .hero-stats { display: flex; justify-content: center; flex-wrap: wrap; margin-top: 72px; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.07); }
        .hs { padding: 0 40px; text-align: center; border-right: 1px solid rgba(255,255,255,0.07); }
        .hs:last-child { border: none; }
        .hs-n { font-family: var(--font-display); font-size: 36px; color: #fff; line-height: 1; font-weight: 800; }
        .hs-n span { color: #60a5fa; }
        .hs-l { font-size: 11.5px; color: rgba(255,255,255,0.36); margin-top: 6px; font-weight: 600; letter-spacing: 0.4px; }

        /* ─── SECTION COMMONS ─── */
        .sec { padding: 104px 24px; }
        .sec-dark { background: var(--navy); }
        .sec-light { background: var(--bg); }
        .sec-white { background: var(--surface); }
        .eyebrow { text-align: center; font-size: 10.5px; font-weight: 800; letter-spacing: 3.5px; text-transform: uppercase; color: var(--blue); margin-bottom: 14px; }
        .eyebrow-lt { color: #60a5fa; }
        .stitle { font-family: var(--font-display); text-align: center; font-size: clamp(30px, 4vw, 52px); font-weight: 800; color: var(--navy); letter-spacing: -1.8px; margin-bottom: 14px; line-height: 1.1; }
        .stitle-lt { color: #fff; }
        .ssub { text-align: center; color: var(--soft); font-size: 15px; max-width: 460px; margin: 0 auto 64px; line-height: 1.8; font-weight: 400; }
        .ssub-lt { color: rgba(255,255,255,0.40); }

        /* ─── SERVICES — always 2×2 grid ─── */
        .srv-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        @media (max-width: 640px) { .srv-grid { grid-template-columns: 1fr; } }

        .srv-card {
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 22px;
          padding: 40px 36px;
          transition: all 0.32s;
          position: relative;
          overflow: hidden;
        }
        .srv-card::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 22px 22px 0 0;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .srv-card.c1::after { background: linear-gradient(90deg, #2f6fe8, #60a5fa); }
        .srv-card.c2::after { background: linear-gradient(90deg, #00d084, #34d578); }
        .srv-card.c3::after { background: linear-gradient(90deg, #f5a623, #fbbf24); }
        .srv-card.c4::after { background: linear-gradient(90deg, #a855f7, #c084fc); }
        .srv-card:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(26,43,74,0.13); border-color: rgba(47,111,232,0.22); }
        .srv-card:hover::after { opacity: 1; }

        .srv-head { display: flex; align-items: flex-start; gap: 18px; margin-bottom: 18px; }
        .srv-ico { width: 58px; height: 58px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0; }
        .si1 { background: linear-gradient(135deg, #dbeafe, #eff6ff); }
        .si2 { background: linear-gradient(135deg, #d1fae5, #ecfdf5); }
        .si3 { background: linear-gradient(135deg, #fef3c7, #fffbeb); }
        .si4 { background: linear-gradient(135deg, #ede9fe, #f5f3ff); }
        .srv-tag { margin-top: 6px; display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 3px 9px; border-radius: 5px; }
        .st1 { color: #2f6fe8; background: rgba(47,111,232,0.09); }
        .st2 { color: #059669; background: rgba(5,150,105,0.09); }
        .st3 { color: #d97706; background: rgba(217,119,6,0.09); }
        .st4 { color: #7c3aed; background: rgba(124,58,237,0.09); }
        .srv-card h3 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--navy); margin-bottom: 10px; letter-spacing: -0.5px; }
        .srv-card p { font-size: 14px; color: var(--soft); line-height: 1.85; }

        /* ─── WHY ─── */
        .why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px; max-width: 1080px; margin: 0 auto;
        }
        @media (max-width: 860px) { .why-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .why-grid { grid-template-columns: 1fr; } }

        .why-card { background: rgba(255,255,255,0.055); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 34px 28px 32px; transition: all 0.35s; position: relative; overflow: hidden; }
        .why-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 20px 20px 0 0; opacity: 0; transition: opacity 0.3s; }
        .why-card.wc1::after { background: linear-gradient(90deg,#2f6fe8,#5a9bec); }
        .why-card.wc2::after { background: linear-gradient(90deg,#00d084,#34d578); }
        .why-card.wc3::after { background: linear-gradient(90deg,#7c3aed,#a78bfa); }
        .why-card.wc4::after { background: linear-gradient(90deg,#f5a623,#fbbf24); }
        .why-card.wc5::after { background: linear-gradient(90deg,#0d9488,#2dd4bf); }
        .why-card.wc6::after { background: linear-gradient(90deg,#e11d48,#fb7185); }
        .why-card:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.15); transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.25); }
        .why-card:hover::after { opacity: 1; }
        .why-ico { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 20px; }
        .wi1 { background: rgba(47,111,232,0.18); } .wi2 { background: rgba(0,208,132,0.18); } .wi3 { background: rgba(124,58,237,0.18); }
        .wi4 { background: rgba(245,166,35,0.18); } .wi5 { background: rgba(13,148,136,0.18); } .wi6 { background: rgba(225,29,72,0.18); }
        .why-card h4 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 10px; letter-spacing: -0.4px; }
        .why-card p { font-size: 13.5px; color: rgba(255,255,255,0.44); line-height: 1.8; }

        /* ─── HOW IT WORKS ─── */
        .hiw-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px; max-width: 1080px; margin: 0 auto;
          position: relative;
        }
        .hiw-connector {
          display: none;
        }
        @media (min-width: 861px) {
          .hiw-connector { display: block; }
        }
        @media (max-width: 860px) { .hiw-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .hiw-grid { grid-template-columns: 1fr; } }

        .hiw-step {
          border-radius: 24px; padding: 36px 28px 40px;
          transition: all 0.35s; position: relative; overflow: hidden;
          min-height: 260px;
        }
        .hiw-step.h1 { background: linear-gradient(160deg,#1a3a6b,#0f2347); border: 1px solid rgba(47,111,232,0.35); }
        .hiw-step.h2 { background: linear-gradient(160deg,#0a3d25,#062a18); border: 1px solid rgba(0,208,132,0.3); }
        .hiw-step.h3 { background: linear-gradient(160deg,#2d1a5c,#1e1040); border: 1px solid rgba(124,58,237,0.35); }
        .hiw-step.h4 { background: linear-gradient(160deg,#3d2800,#261a00); border: 1px solid rgba(245,166,35,0.3); }

        /* glow orb */
        .hiw-step::before { content: ''; position: absolute; top: -60px; right: -60px; width: 180px; height: 180px; border-radius: 50%; opacity: 0.12; pointer-events: none; transition: opacity 0.35s; }
        .hiw-step.h1::before { background: #2f6fe8; }
        .hiw-step.h2::before { background: #00d084; }
        .hiw-step.h3::before { background: #7c3aed; }
        .hiw-step.h4::before { background: #f5a623; }
        .hiw-step:hover::before { opacity: 0.22; }
        .hiw-step:hover { transform: translateY(-8px); box-shadow: 0 32px 64px rgba(0,0,0,0.28); }

        .hiw-num-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .hiw-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 48px; height: 48px; border-radius: 14px;
          font-family: var(--font-display); font-size: 16px; font-weight: 800;
          position: relative; z-index: 1;
        }
        .hb1 { background: rgba(47,111,232,0.22); color: #7ab8f5; border: 1px solid rgba(47,111,232,0.3); }
        .hb2 { background: rgba(0,208,132,0.22); color: #4de890; border: 1px solid rgba(0,208,132,0.3); }
        .hb3 { background: rgba(124,58,237,0.22); color: #b89cf7; border: 1px solid rgba(124,58,237,0.3); }
        .hb4 { background: rgba(245,166,35,0.22); color: #fdd068; border: 1px solid rgba(245,166,35,0.3); }

        .hiw-arrow-icon {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; position: relative; z-index: 1;
          transition: transform 0.3s;
        }
        .hiw-step.h1 .hiw-arrow-icon { background: rgba(47,111,232,0.18); color: #7ab8f5; }
        .hiw-step.h2 .hiw-arrow-icon { background: rgba(0,208,132,0.18); color: #4de890; }
        .hiw-step.h3 .hiw-arrow-icon { background: rgba(124,58,237,0.18); color: #b89cf7; }
        .hiw-step.h4 .hiw-arrow-icon { background: rgba(245,166,35,0.18); color: #fdd068; }
        .hiw-step:hover .hiw-arrow-icon { transform: translate(3px,-3px); }

        .hiw-step h4 { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 12px; letter-spacing: -0.5px; position: relative; z-index: 1; }
        .hiw-step p { font-size: 13.5px; line-height: 1.85; position: relative; z-index: 1; }
        .hiw-step.h1 p { color: rgba(120,180,245,0.65); }
        .hiw-step.h2 p { color: rgba(0,208,132,0.60); }
        .hiw-step.h3 p { color: rgba(184,156,247,0.65); }
        .hiw-step.h4 p { color: rgba(253,208,104,0.60); }

        /* ─── CONTACT — redesigned ─── */
        .contact-outer {
          max-width: 1040px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 0;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(26,43,74,0.10);
        }
        @media (max-width: 780px) {
          .contact-outer { grid-template-columns: 1fr; }
          .contact-left { padding: 40px 32px; }
        }

        .contact-left {
          background: linear-gradient(160deg, var(--navy-d) 0%, var(--navy-m) 100%);
          padding: 56px 44px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .contact-left::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(47,111,232,0.2), transparent 70%);
          pointer-events: none;
        }
        .contact-left::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 250px; height: 250px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,208,132,0.12), transparent 70%);
          pointer-events: none;
        }
        .cl-top { position: relative; z-index: 1; }
        .cl-badge {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          color: #60a5fa; background: rgba(96,165,250,0.12); border: 1px solid rgba(96,165,250,0.2);
          padding: 5px 12px; border-radius: 8px; margin-bottom: 24px;
        }
        .cl-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #00d084; box-shadow: 0 0 8px #00d084; animation: blink 2.2s infinite; }
        .contact-left h3 { font-family: var(--font-display); font-size: 30px; font-weight: 800; color: #fff; letter-spacing: -1px; line-height: 1.2; margin-bottom: 16px; }
        .contact-left .cl-sub { font-size: 14px; color: rgba(255,255,255,0.44); line-height: 1.8; }

        .cl-info { position: relative; z-index: 1; margin-top: 40px; display: flex; flex-direction: column; gap: 16px; }
        .cl-info-item { display: flex; align-items: center; gap: 14px; }
        .cl-info-icon { width: 40px; height: 40px; border-radius: 11px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.10); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .cl-info-text { font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.5; }
        .cl-info-text strong { display: block; color: rgba(255,255,255,0.85); font-size: 13.5px; font-weight: 600; margin-bottom: 1px; }

        .contact-right { padding: 52px 48px; }
        @media (max-width: 640px) { .contact-right { padding: 36px 24px; } }
        .contact-right h4 { font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--navy); letter-spacing: -0.8px; margin-bottom: 6px; }
        .contact-right .cr-sub { font-size: 14px; color: var(--soft); margin-bottom: 36px; }

        .cf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 0; }
        @media (max-width: 500px) { .cf-row { grid-template-columns: 1fr; } }
        .cf-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; }
        .cf-field label { font-size: 11.5px; font-weight: 700; color: var(--navy); letter-spacing: 0.6px; text-transform: uppercase; }
        .cf-field input, .cf-field textarea {
          padding: 13px 16px; background: var(--bg); border: 1.5px solid var(--border);
          border-radius: 12px; font-size: 14px; font-family: var(--font-body); color: var(--text);
          outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; resize: none;
        }
        .cf-field input:focus, .cf-field textarea:focus {
          border-color: var(--blue); background: #fff;
          box-shadow: 0 0 0 4px rgba(47,111,232,0.10);
        }
        .cf-btn {
          width: 100%; padding: 15px; background: var(--blue); color: #fff;
          font-size: 15px; font-weight: 700; font-family: var(--font-body);
          border: none; border-radius: 12px; cursor: pointer; transition: all 0.25s;
          margin-top: 4px; box-shadow: 0 5px 18px rgba(47,111,232,0.38);
          letter-spacing: -0.2px;
        }
        .cf-btn:hover { background: #2460d0; transform: translateY(-2px); box-shadow: 0 10px 28px rgba(47,111,232,0.48); }
        .cf-success { text-align: center; padding: 48px 0; }
        .cf-success .tick { font-size: 52px; margin-bottom: 16px; }
        .cf-success h4 { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--navy); margin-bottom: 10px; }
        .cf-success p { font-size: 14px; color: var(--soft); }

        /* ─── CTA ─── */
        .cta-sec { padding: 100px 24px; background: var(--bg); }
        .cta-box { max-width: 700px; margin: 0 auto; background: linear-gradient(135deg, var(--navy-d) 0%, var(--navy-m) 100%); border-radius: 28px; padding: 72px 52px; text-align: center; position: relative; overflow: hidden; }
        .cta-box::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 55% at 50% 0%, rgba(47,111,232,0.28), transparent); pointer-events: none; }
        .cta-box h2 { font-family: var(--font-display); font-size: clamp(26px, 4vw, 44px); font-weight: 800; color: #fff; letter-spacing: -1.5px; margin-bottom: 14px; position: relative; line-height: 1.1; }
        .cta-box p { color: rgba(255,255,255,0.42); font-size: 15px; margin-bottom: 40px; line-height: 1.8; position: relative; }
        .cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; position: relative; }

        /* ─── FOOTER ─── */
        .footer { background: var(--navy-d); border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 52px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
        .footer-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .footer-logo { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, #1a56db, #60a5fa); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .footer-name { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
        .footer-links { display: flex; gap: 20px; }
        .footer-links button { font-size: 13px; color: rgba(255,255,255,0.38); font-weight: 500; background: none; border: none; cursor: pointer; font-family: var(--font-body); transition: color 0.2s; }
        .footer-links button:hover { color: rgba(255,255,255,0.72); }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.28); }

        /* ─── REVEAL ─── */
        .rv { opacity: 0; transform: translateY(22px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .rv.vis { opacity: 1; transform: none; }
        .d1 { transition-delay: .07s; } .d2 { transition-delay: .14s; } .d3 { transition-delay: .21s; } .d4 { transition-delay: .28s; }

        @media (max-width: 640px) {
          .hs { padding: 0 22px; }
          .cta-box { padding: 48px 28px; }
          .footer { flex-direction: column; text-align: center; padding: 24px; }
          .footer-links { justify-content: center; flex-wrap: wrap; }
        }
      `}</style>

      {/* ── STICKY NAV ── */}
      <nav className={`nav${scrolled ? " stuck" : ""}`}>
        <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="nav-logo">🏙️</div>
          <span className="nav-wordmark">Smart<b>City</b></span>
          <span className="nav-pill">PLATFORM</span>
        </div>

        <div className="nav-links">
          <button className="nl" onClick={() => goto("services")}>Services</button>
          <button className="nl" onClick={() => goto("why")}>Why Us</button>
          <button className="nl" onClick={() => goto("how")}>How It Works</button>
          <button className="nl" onClick={() => goto("contact")}>Contact Us</button>
        </div>

        <div className="nav-right">
          <Link to="/login"    className="nav-login">Login</Link>
          <Link to="/register" className="nav-cta">Get Started →</Link>
        </div>

        <button className="nav-ham" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span style={menuOpen ? { transform: "rotate(45deg) translate(5px,5px)" } : {}} />
          <span style={menuOpen ? { opacity: 0 } : {}} />
          <span style={menuOpen ? { transform: "rotate(-45deg) translate(5px,-5px)" } : {}} />
        </button>
      </nav>

      <div className={`nav-mob${menuOpen ? " open" : ""}`}>
        <button className="nm" onClick={() => goto("services")}>Services</button>
        <button className="nm" onClick={() => goto("why")}>Why Us</button>
        <button className="nm" onClick={() => goto("how")}>How It Works</button>
        <button className="nm" onClick={() => goto("contact")}>Contact Us</button>
        <Link to="/login"    className="nm" onClick={() => setMenuOpen(false)}>Login</Link>
        <Link to="/register" className="nm nm-cta" onClick={() => setMenuOpen(false)}>Get Started →</Link>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="h-orb1" /><div className="h-orb2" />
        <div className="hero-inner">
          <div className="hero-chip"><span className="chip-dot" />AI-Powered · Real-time Tracking · AWS Infrastructure</div>
          <h1 className="hero-title">Report Issues.<br /><em>Track Progress.</em><br />Build Better Cities.</h1>
          <p className="hero-sub">A smarter way for citizens to report civic problems and see them resolved — faster, transparently, and powered by AI.</p>
          <div className="hero-btns">
            <Link to="/register" className="btn-p">📢 Report an Issue</Link>
            <Link to="/login"    className="btn-g">Sign In →</Link>
          </div>
          <div className="hero-stats">
            {[{ n:"12k",s:"+",l:"Issues Resolved"},{ n:"98",s:"%",l:"Satisfaction Rate"},{ n:"48",s:"h",l:"Avg. Response Time"},{ n:"24",s:"/7",l:"Always Available"}].map((st,i)=>(
              <div className="hs" key={i}><div className="hs-n">{st.n}<span>{st.s}</span></div><div className="hs-l">{st.l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES — 2×2 grid ── */}
      <section className="sec sec-light" id="services">
        <p className="eyebrow rv">Our Services</p>
        <h2 className="stitle rv d1">Everything a citizen needs</h2>
        <p className="ssub rv d2">From reporting to resolution — we handle the full journey end to end.</p>
        <div className="srv-grid">
          {[
            { cls:"c1", ic:"si1", icon:"📋", tag:"st1", tagLabel:"Core Feature", title:"Complaint Filing", desc:"Submit any civic issue — roads, water, electricity, sanitation — with photos and GPS location in under a minute." },
            { cls:"c2", ic:"si2", icon:"📍", tag:"st2", tagLabel:"Real-time",     title:"Live Status Tracking", desc:"Follow your complaint in real time. See when it's received, assigned, in progress, and finally resolved." },
            { cls:"c3", ic:"si3", icon:"🤖", tag:"st3", tagLabel:"AI Powered",    title:"AI Severity Analysis", desc:"Our AI automatically analyses your submission, classifies the severity, and ensures urgent issues jump to the top." },
            { cls:"c4", ic:"si4", icon:"🔔", tag:"st4", tagLabel:"Alerts",        title:"Instant Notifications", desc:"Get notified at every step. Email and in-app alerts keep you informed without having to log in and check manually." },
          ].map((c,i)=>(
            <div className={`srv-card ${c.cls} rv`} key={c.title} style={{ transitionDelay:`${i*0.08}s` }}>
              <div className="srv-head">
                <div className={`srv-ico ${c.ic}`}>{c.icon}</div>
                <span className={`srv-tag ${c.tag}`}>{c.tagLabel}</span>
              </div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY ── */}
      <section className="sec sec-dark" id="why">
        <p className="eyebrow eyebrow-lt rv">Why Smart City</p>
        <h2 className="stitle stitle-lt rv d1">Why citizens choose us</h2>
        <p className="ssub ssub-lt rv d2">Designed with real people in mind — not bureaucracy.</p>
        <div className="why-grid">
          {[
            { cls:"wc1",ic:"wi1",icon:"⚡",title:"Fast & Simple",     desc:"Report an issue in 60 seconds flat. No complex forms, no waiting on hold, no confusion." },
            { cls:"wc2",ic:"wi2",icon:"🔍",title:"Full Transparency", desc:"You always know the status of your complaint. No more wondering if anyone saw your report." },
            { cls:"wc3",ic:"wi3",icon:"🤖",title:"AI-Powered",        desc:"Every report is analysed automatically, ensuring nothing gets lost and urgent issues are prioritised." },
            { cls:"wc4",ic:"wi4",icon:"🔒",title:"Secure & Private",  desc:"Built on AWS Cognito with role-based access. Your data stays safe and only reaches the right people." },
            { cls:"wc5",ic:"wi5",icon:"🌐",title:"Always Available",  desc:"Report issues 24/7 from any device. The platform never sleeps so your city never has to wait." },
            { cls:"wc6",ic:"wi6",icon:"📸",title:"Photo Evidence",    desc:"Attach photos to your complaint. Visual evidence makes it easier for teams to understand and act faster." },
          ].map((w,i)=>(
            <div className={`why-card ${w.cls} rv`} key={w.title} style={{ transitionDelay:`${i*0.07}s` }}>
              <div className={`why-ico ${w.ic}`}>{w.icon}</div>
              <h4>{w.title}</h4><p>{w.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="sec sec-white" id="how">
        <p className="eyebrow rv">The Process</p>
        <h2 className="stitle rv d1">How it works</h2>
        <p className="ssub rv d2">Four simple steps from issue spotted to issue solved.</p>
        <div className="hiw-grid rv d2">
          {[
            { cls:"h1", badge:"hb1", n:"01", title:"You Report",      desc:"Open the app, describe the problem, attach a photo, and confirm your location. Done in under 60 seconds." },
            { cls:"h2", badge:"hb2", n:"02", title:"AI Analyses",     desc:"Our AI reviews your submission, assigns a severity score, and routes it to the correct department instantly." },
            { cls:"h3", badge:"hb3", n:"03", title:"Team Acts",       desc:"A service team is dispatched, given full details of your complaint, and begins work on the ground." },
            { cls:"h4", badge:"hb4", n:"04", title:"You're Notified", desc:"Once the issue is marked resolved, you receive an instant notification. You can rate the resolution too." },
          ].map((s)=>(
            <div className={`hiw-step ${s.cls}`} key={s.n}>
              <div className="hiw-num-row">
                <div className={`hiw-badge ${s.badge}`}>{s.n}</div>
                <div className="hiw-arrow-icon">→</div>
              </div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CONTACT — split layout ── */}
      <section className="sec sec-light" id="contact">
        <p className="eyebrow rv">Get In Touch</p>
        <h2 className="stitle rv d1">Contact Us</h2>
        <p className="ssub rv d2">Have a question or need help? We'd love to hear from you.</p>
        <div className="contact-outer rv d2">

          {/* Left panel */}
          <div className="contact-left">
            <div className="cl-top">
              <div className="cl-badge"><span className="cl-badge-dot" />We're here to help</div>
              <h3>Let's talk about your city</h3>
              <p className="cl-sub">Reach out for support, partnerships, or to share feedback about the platform.</p>
            </div>
            <div className="cl-info">
              {[
                { icon:"📧", label:"Email Us",       val:"hello@smartcity.in" },
                { icon:"📞", label:"Call Support",   val:"+91 79 4000 0000" },
                { icon:"⏰", label:"Response Time",  val:"Within 24 hours" },
              ].map((item) => (
                <div className="cl-info-item" key={item.label}>
                  <div className="cl-info-icon">{item.icon}</div>
                  <div className="cl-info-text">
                    <strong>{item.label}</strong>
                    {item.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right form */}
          <div className="contact-right">
            {sent ? (
              <div className="cf-success">
                <div className="tick">✅</div>
                <h4>Message Sent!</h4>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h4>Send us a message</h4>
                <p className="cr-sub">Fill in the form and our team will respond promptly.</p>
                <form onSubmit={handleSend}>
                  <div className="cf-row">
                    <div className="cf-field">
                      <label>Your Name</label>
                      <input type="text" placeholder="e.g. Rahul Patel" required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
                    </div>
                    <div className="cf-field">
                      <label>Email Address</label>
                      <input type="email" placeholder="you@example.com" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
                    </div>
                  </div>
                  <div className="cf-field">
                    <label>Message</label>
                    <textarea rows={5} placeholder="How can we help you?" required value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})} />
                  </div>
                  <button type="submit" className="cf-btn">Send Message →</button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-sec">
        <div className="cta-box rv">
          <h2>Your city needs your voice.</h2>
          <p>Join thousands of citizens already making their neighbourhoods better — one report at a time.</p>
          <div className="cta-row">
            <Link to="/register" className="btn-p">Create Free Account →</Link>
            <Link to="/login"    className="btn-g" style={{ color:"rgba(255,255,255,0.75)" }}>Sign In</Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-brand"><div className="footer-logo">🏙️</div><span className="footer-name">SmartCity</span></div>
        <div className="footer-links">
          <button onClick={()=>goto("services")}>Services</button>
          <button onClick={()=>goto("why")}>Why Us</button>
          <button onClick={()=>goto("how")}>How It Works</button>
          <button onClick={()=>goto("contact")}>Contact</button>
        </div>
        <span className="footer-copy">© {new Date().getFullYear()} Smart City Platform</span>
      </footer>
    </>
  );
}
