import { useEffect } from 'react';
import './landing.css';
import Nav from './components/Nav';
import Hero from './components/Hero';
import ToolsShowcase from './components/ToolsShowcase';
import Features from './components/Features';
import ComponentTypes from './components/ComponentTypes';
import Templates from './components/Templates';
import Stack from './components/Stack';
import CTA from './components/CTA';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export default function LandingPage() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: '#080c08', color: '#d8e4d8', minHeight: '100vh', lineHeight: 1.6, overflowX: 'hidden' }}>
      <div className="dot-grid" />
      <Nav />
      <main>
        <article>
          <Hero />
          <ToolsShowcase />
          <Features />
          <ComponentTypes />
          <Templates />
          <Stack />
          <FAQ />
          <CTA />
        </article>
      </main>
      <Footer />
    </div>
  );
}
