const markdownFiles = import.meta.glob('./documents/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

function parseFrontmatter(markdown) {
  const normalized = markdown.replace(/\r\n/g, '\n')

  if (!normalized.startsWith('---\n')) {
    return { attributes: {}, body: normalized }
  }

  const endIndex = normalized.indexOf('\n---\n', 4)
  if (endIndex === -1) {
    return { attributes: {}, body: normalized }
  }

  const attributes = {}
  const rawAttributes = normalized.slice(4, endIndex).trim()
  const body = normalized.slice(endIndex + 5)

  for (const line of rawAttributes.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/)
    if (!match) {
      continue
    }

    const key = match[1]
    const value = match[2].trim().replace(/^["']|["']$/g, '')
    attributes[key] = value
  }

  return { attributes, body }
}

function slugToTitle(slug) {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function parseMarkdownBlocks(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let paragraph = []
  let list = null

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim()
    if (text) {
      blocks.push({ type: 'paragraph', text })
    }
    paragraph = []
  }

  const flushList = () => {
    if (list && list.items.length > 0) {
      blocks.push(list)
    }
    list = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      flushList()
      continue
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      flushParagraph()
      flushList()
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      })
      continue
    }

    const orderedListMatch = line.match(/^\d+\.\s+(.+)$/)
    if (orderedListMatch) {
      flushParagraph()
      if (!list || !list.ordered) {
        flushList()
        list = { type: 'list', ordered: true, items: [] }
      }
      list.items.push(orderedListMatch[1].trim())
      continue
    }

    const unorderedListMatch = line.match(/^[-*]\s+(.+)$/)
    if (unorderedListMatch) {
      flushParagraph()
      if (!list || list.ordered) {
        flushList()
        list = { type: 'list', ordered: false, items: [] }
      }
      list.items.push(unorderedListMatch[1].trim())
      continue
    }

    flushList()
    paragraph.push(line)
  }

  flushParagraph()
  flushList()

  return blocks
}

const loadedDocuments = Object.entries(markdownFiles)
  .map(([filePath, markdown]) => {
    const fileName = filePath.split('/').pop() || ''
    const slug = fileName.replace(/\.md$/i, '')
    const { attributes, body } = parseFrontmatter(markdown)
    const parsedBlocks = parseMarkdownBlocks(body)

    let title = slugToTitle(slug)
    let blocks = parsedBlocks

    // Treat the first H1 as the document title and keep the rest as content sections.
    if (parsedBlocks[0] && parsedBlocks[0].type === 'heading' && parsedBlocks[0].level === 1) {
      title = parsedBlocks[0].text
      blocks = parsedBlocks.slice(1)
    }

    if (attributes.title) {
      title = attributes.title
    }

    return {
      slug,
      title,
      lastEdited: attributes.lastEdited || null,
      blocks,
    }
  })
  .filter((doc) => doc.slug !== 'msa')

const displayOrder = ['terms-of-service', 'privacy-policy', 'dpa', 'security-policy']

export const legalDocuments = loadedDocuments.sort((a, b) => {
  const ai = displayOrder.indexOf(a.slug)
  const bi = displayOrder.indexOf(b.slug)
  return (ai === -1 ? displayOrder.length : ai) - (bi === -1 ? displayOrder.length : bi)
})

export function getLegalDocumentBySlug(slug) {
  return legalDocuments.find((document) => document.slug === slug)
}
