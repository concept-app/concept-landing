import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);

    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="app">
      {/* Animated gradient background */}
      <div className="gradient-bg"></div>

      {/* Grain texture overlay */}
      <div className="grain"></div>

      {/* Floating geometric shapes */}
      <div className="shapes-container">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>

      {/* Glowing orb that follows mouse */}
      <div
        className="cursor-glow"
        style={{
          transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 30}px)`
        }}
      ></div>

      {/* Main content */}
      <div className={`content ${isLoaded ? 'loaded' : ''}`}>
        <div className="concept-container">
          <h1 className="concept-text" data-text="CONCEPT">
            <span className="letter">C</span>
            <span className="letter">O</span>
            <span className="letter">N</span>
            <span className="letter">C</span>
            <span className="letter">E</span>
            <span className="letter">P</span>
            <span className="letter">T</span>
          </h1>
          <div className="tagline">Enterprise AI for fast-growing companies</div>
        </div>

        <div className="links-container">
          <a href="https://x.com/conceptdotdev" className="link" target="_blank" rel="noopener noreferrer">
            <span className="link-text">X</span>
            <span className="link-line"></span>
          </a>
          <a href="https://linkedin.com/company/concept-dev" className="link" target="_blank" rel="noopener noreferrer">
            <span className="link-text">LinkedIn</span>
            <span className="link-line"></span>
          </a>
          <a href="mailto:hello@concept.dev" className="link">
            <span className="link-text">Contact</span>
            <span className="link-line"></span>
          </a>
        </div>
      </div>

      {/* Corner accents */}
      <div className="corner corner-tl"></div>
      <div className="corner corner-tr"></div>
      <div className="corner corner-bl"></div>
      <div className="corner corner-br"></div>
    </div>
  )
}

export default App
