function childrenToMarkdown(element: Element) {
  return Array.from(element.childNodes).map(nodeToMarkdown).join("")
}

function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return normalizeTextNode(node.textContent ?? "")
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return ""
  }

  return elementToMarkdown(node as Element)
}

function elementToMarkdown(element: Element): string {
  const tagName = element.tagName.toLowerCase()

  switch (tagName) {
    case "a":
      return linkToMarkdown(element)
    case "blockquote":
      return blockquoteToMarkdown(element)
    case "br":
      return "\n"
    case "code":
      if (element.parentElement?.tagName.toLowerCase() === "pre") {
        return element.textContent ?? ""
      }
      return inlineCodeToMarkdown(element.textContent ?? "")
    case "del":
    case "s":
      return wrapInline("~~", childrenToMarkdown(element))
    case "em":
    case "i":
      return wrapInline("*", childrenToMarkdown(element))
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return headingToMarkdown(element, Number(tagName.slice(1)))
    case "hr":
      return "\n\n---\n\n"
    case "img":
      return imageToMarkdown(element)
    case "li":
      return childrenToMarkdown(element)
    case "ol":
      return listToMarkdown(element, true)
    case "p":
      return block(childrenToMarkdown(element))
    case "pre":
      return codeBlockToMarkdown(element)
    case "strong":
    case "b":
      return wrapInline("**", childrenToMarkdown(element))
    case "table":
      return tableToMarkdown(element)
    case "ul":
      return listToMarkdown(element, false)
    default:
      return childrenToMarkdown(element)
  }
}

function block(content: string) {
  const normalized = normalizeInline(content).trim()

  if (!normalized) {
    return ""
  }

  return `${normalized}\n\n`
}

function headingToMarkdown(element: Element, level: number) {
  const content = normalizeInline(childrenToMarkdown(element)).trim()

  if (!content) {
    return ""
  }

  return `${"#".repeat(level)} ${content}\n\n`
}

function listToMarkdown(element: Element, ordered: boolean) {
  const items = Array.from(element.children).filter(child => child.tagName.toLowerCase() === "li")
  const start = ordered ? Number(element.getAttribute("start") ?? "1") || 1 : 1

  const content = items
    .map((item, index) => {
      const marker = ordered ? `${start + index}. ` : "- "
      const itemContent = normalizeMarkdown(childrenToMarkdown(item)).replace(/\n/g, "\n  ")

      return itemContent ? `${marker}${itemContent}` : marker.trimEnd()
    })
    .join("\n")

  return content ? `${content}\n\n` : ""
}

function blockquoteToMarkdown(element: Element) {
  const content = normalizeMarkdown(childrenToMarkdown(element))

  if (!content) {
    return ""
  }

  return `${content
    .split("\n")
    .map(line => `> ${line}`)
    .join("\n")}\n\n`
}

function codeBlockToMarkdown(element: Element) {
  const codeElement = element.querySelector("code")
  const code = (codeElement ?? element).textContent?.replace(/\n$/, "") ?? ""
  const language = getCodeLanguage(codeElement)
  const fence = getCodeFence(code)

  return `\n\n${fence}${language}\n${code.trimEnd()}\n${fence}\n\n`
}

function inlineCodeToMarkdown(content: string) {
  const normalized = content.replace(/\s+/g, " ")
  const fence = getInlineCodeFence(normalized)
  const padding = normalized.startsWith(" ") || normalized.endsWith(" ") || normalized.includes("`") ? " " : ""

  return `${fence}${padding}${normalized}${padding}${fence}`
}

function linkToMarkdown(element: Element) {
  const href = element.getAttribute("href")
  const text = normalizeInline(childrenToMarkdown(element)).trim()

  if (!href || !text) {
    return text
  }

  return `[${escapeMarkdownLinkText(text)}](${escapeMarkdownUrl(href)})`
}

function imageToMarkdown(element: Element) {
  const src = element.getAttribute("src")
  const alt = element.getAttribute("alt") ?? ""

  if (!src) {
    return alt
  }

  return `![${escapeMarkdownLinkText(alt)}](${escapeMarkdownUrl(src)})`
}

function tableToMarkdown(element: Element) {
  const rows = Array.from(element.querySelectorAll("tr"))
    .map(row =>
      Array.from(row.children)
        .filter(cell => ["td", "th"].includes(cell.tagName.toLowerCase()))
        .map(cell => (cell.textContent ?? "").replace(/\s+/g, " ").trim().replace(/\|/g, "\\|")),
    )
    .filter(row => row.length > 0)

  if (rows.length === 0) {
    return ""
  }

  const [header, ...body] = rows
  const separator = header.map(() => "---")
  const tableRows = [header, separator, ...body].map(row => `| ${row.join(" | ")} |`).join("\n")

  return `${tableRows}\n\n`
}

function wrapInline(marker: string, content: string) {
  const normalized = normalizeInline(content).trim()

  return normalized ? `${marker}${normalized}${marker}` : ""
}

function getCodeLanguage(codeElement: Element | null) {
  const className = codeElement?.getAttribute("class") ?? ""
  const match = className.match(/(?:language|lang)-([^\s]+)/)

  return match?.[1] ?? ""
}

function getCodeFence(content: string) {
  const matches = content.match(/`+/g) ?? []
  const longestFenceLength = matches.reduce((longest, match) => Math.max(longest, match.length), 0)

  return "`".repeat(Math.max(3, longestFenceLength + 1))
}

function getInlineCodeFence(content: string) {
  const matches = content.match(/`+/g) ?? []
  const longestFenceLength = matches.reduce((longest, match) => Math.max(longest, match.length), 0)

  return "`".repeat(longestFenceLength + 1)
}

function normalizeTextNode(text: string) {
  return text.replace(/\s+/g, " ")
}

function normalizeInline(content: string) {
  return content
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
}

function normalizeMarkdown(content: string) {
  const codeBlocks: string[] = []
  const placeholderPrefix = "\u0000CODE_BLOCK_"
  const contentWithoutCodeBlocks = content.replace(/`{3,}[^\n]*\n[\s\S]*?\n`{3,}/g, match => {
    const index = codeBlocks.push(match) - 1

    return `${placeholderPrefix}${index}\u0000`
  })

  return normalizeInline(contentWithoutCodeBlocks)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .replace(new RegExp(`${placeholderPrefix}(\\d+)\u0000`, "g"), (_, index: string) => codeBlocks[Number(index)] ?? "")
}

function escapeMarkdownLinkText(text: string) {
  return text.replace(/([\]\\])/g, "\\$1")
}

function escapeMarkdownUrl(url: string) {
  return url.replace(/\)/g, "%29")
}

export function htmlToMarkdown(element: Element) {
  return normalizeMarkdown(childrenToMarkdown(element))
}
