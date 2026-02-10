import './App.css'

function App() {
  return (
    <div className="app">
      {/* Abstract floating shapes */}
      <div className="shapes-container">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
        <div className="shape shape-6"></div>
      </div>

      {/* Grain overlay for texture */}
      <div className="grain-overlay"></div>

      {/* Main content */}
      <div className="content">
        <h1 className="concept-text">
          <span className="letter" style={{ animationDelay: '0s' }}>C</span>
          <span className="letter" style={{ animationDelay: '0.1s' }}>O</span>
          <span className="letter" style={{ animationDelay: '0.2s' }}>N</span>
          <span className="letter" style={{ animationDelay: '0.3s' }}>C</span>
          <span className="letter" style={{ animationDelay: '0.4s' }}>E</span>
          <span className="letter" style={{ animationDelay: '0.5s' }}>P</span>
          <span className="letter" style={{ animationDelay: '0.6s' }}>T</span>
        </h1>
        <p className="tagline">Enterprise AI for fast-growing companies</p>
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
  )
}

export default App
