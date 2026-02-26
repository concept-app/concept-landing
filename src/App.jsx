import { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const appRef = useRef(null)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!appRef.current) return
      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100
      appRef.current.style.setProperty('--mouse-x', `${x}%`)
      appRef.current.style.setProperty('--mouse-y', `${y}%`)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="app" ref={appRef}>
      <div className="gradient-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      <div className="noise-overlay"></div>
      <div className="cursor-glow"></div>
      <div className="content">
        <h1 className="concept-text">CONCEPT</h1>
        <p className="tagline">Enterprise AI for fast-growing companies</p>
      </div>
      <div className="links-container">
        <a href="https://x.com/conceptdotdev" className="link" target="_blank" rel="noopener noreferrer">X</a>
        <span className="link-separator"></span>
        <a href="https://linkedin.com/company/concept-dev" className="link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <span className="link-separator"></span>
        <a href="mailto:hello@concept.dev" className="link">Contact</a>
      </div>
    </div>
  )
}

export default App

