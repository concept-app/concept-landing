import './App.css'
import { getLegalDocumentBySlug, legalDocuments } from './legal/documents'

const LEGAL_BASE_PATH = '/legal'

function normalizePathname(pathname) {
  if (!pathname) {
    return '/'
  }

  if (pathname === '/') {
    return pathname
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
}

function renderInlineText(text) {
  const parts = []
  let lastIndex = 0
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(
      <a key={match.index} href={match[2]} className="legal-inline-link">{match[1]}</a>
    )
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

function renderMarkdownBlock(block, index) {
  if (block.type === 'heading') {
    const headingLevel = Math.min(Math.max(block.level, 1), 6)
    const HeadingTag = `h${headingLevel}`

    return (
      <HeadingTag
        key={`heading-${index}-${block.text}`}
        className={`legal-heading legal-heading-${headingLevel}`}
      >
        {block.text}
      </HeadingTag>
    )
  }

  if (block.type === 'list') {
    const ListTag = block.ordered ? 'ol' : 'ul'

    return (
      <ListTag key={`list-${index}`} className="legal-list-block">
        {block.items.map((item, itemIndex) => (
          <li key={`list-item-${index}-${itemIndex}`} className="legal-list-item">
            {renderInlineText(item)}
          </li>
        ))}
      </ListTag>
    )
  }

  return (
    <p key={`paragraph-${index}-${block.text}`} className="legal-paragraph">
      {renderInlineText(block.text)}
    </p>
  )
}

function HomePage() {
  return (
    <div className="app">
      <h1 className="concept-text">CONCEPT</h1>
      <div className="links-container">
        <a href="https://x.com/conceptdotdev" className="link" target="_blank" rel="noopener noreferrer">X</a>
        <a href="https://linkedin.com/company/concept-dev" className="link" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="mailto:hello@concept.dev" className="link">Contact</a>
        <a href="/legal" className="link">Legal</a>
      </div>
    </div>
  )
}

function LegalIndexPage() {
  return (
    <main className="legal-page">
      <div className="legal-shell">
        <a href="/" className="legal-brand">CONCEPT</a>
        <h1 className="legal-title legal-index-title">Legal</h1>
        <ul className="legal-list">
          {legalDocuments.map((document) => (
            <li key={document.slug} className="legal-list-entry">
              <a href={`${LEGAL_BASE_PATH}/${document.slug}`} className="legal-doc-link">
                {document.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

function LegalDocumentPage({ legalDocument }) {
  if (!legalDocument) {
    return (
      <main className="legal-page">
        <div className="legal-shell">
          <a href="/" className="legal-brand">CONCEPT</a>
          <h1 className="legal-title">Document Not Found</h1>
          <p className="legal-intro">
            This legal document does not exist. Check the URL or select a document from the legal index.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="legal-page">
      <div className="legal-shell">
        <a href="/" className="legal-brand">CONCEPT</a>
        <h1 className="legal-title">{legalDocument.title}</h1>
        {legalDocument.lastEdited ? (
          <p className="legal-last-edited">Last updated {legalDocument.lastEdited}</p>
        ) : null}
        <section className="legal-document">
          {legalDocument.blocks.map((block, index) => renderMarkdownBlock(block, index))}
        </section>
        <hr className="legal-divider" />
        <nav className="legal-footer-nav">
          {legalDocuments
            .filter((doc) => doc.slug !== legalDocument.slug)
            .map((doc) => (
              <a key={doc.slug} href={`${LEGAL_BASE_PATH}/${doc.slug}`} className="legal-footer-link">
                {doc.title}
              </a>
            ))}
        </nav>
      </div>
    </main>
  )
}

function App() {
  const path = normalizePathname(window.location.pathname)

  if (path === LEGAL_BASE_PATH) {
    return <LegalIndexPage />
  }

  if (path.startsWith(`${LEGAL_BASE_PATH}/`)) {
    const slug = decodeURIComponent(path.slice(LEGAL_BASE_PATH.length + 1)).toLowerCase()
    const legalDocument = getLegalDocumentBySlug(slug)

    return <LegalDocumentPage legalDocument={legalDocument} />
  }

  return <HomePage />
}

export default App
