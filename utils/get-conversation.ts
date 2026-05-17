import devlog from "@/utils/dev-log"
import { htmlToMarkdown } from "@/utils/html-to-markdown"
import { ConversationExportError } from "@/utils/export-flow"

export type ConversationExportFormat = "txt" | "markdown"

type MessageRole = "user" | "assistant"

const MESSAGE_SELECTOR = "[data-message-author-role='assistant'], [data-message-author-role='user']"
const IMAGE_SELECTOR = "img[src]"

type ImageReference = {
  alt: string
  src: string
}

export function getConversation(
  includeUser = false,
  includeRoleNames = false,
  exportFormat: ConversationExportFormat = "txt",
  includeImages = true,
) {
  devlog("get conversation called")

  const messageElements = Array.from(document.querySelectorAll<HTMLElement>(MESSAGE_SELECTOR)).filter(element => {
    const role = getMessageRole(element)

    return includeUser || role === "assistant"
  })
  devlog("message Elements : ", messageElements)

  const content = messageElements
    .map(element => {
      const role = getMessageRole(element)
      const messageContent = getMessageContent(element, role, exportFormat, includeImages)

      return formatMessage(messageContent, role, includeRoleNames, exportFormat)
    })
    .filter(Boolean)
    .join("\n\n")

  devlog("content : ", content)
  const cleanedContent = cleanExportContent(content, exportFormat)

  if (!cleanedContent) {
    throw new ConversationExportError("no_messages_found")
  }

  return cleanedContent
}

function getMessageRole(element: HTMLElement): MessageRole {
  return element.dataset.messageAuthorRole === "user" ? "user" : "assistant"
}

function getMessageContent(
  element: HTMLElement,
  role: MessageRole,
  exportFormat: ConversationExportFormat,
  includeImages: boolean,
) {
  const contentElement = getMessageContentElement(element, role)
  const contentAlreadyIncludesImages = exportFormat === "markdown" && role === "assistant"
  const imageReferences = includeImages
    ? getMessageImageReferences(element, contentElement, contentAlreadyIncludesImages)
    : []
  const imageContent = formatImageReferences(imageReferences, exportFormat)
  const textContent =
    exportFormat === "markdown" && role === "assistant"
      ? htmlToMarkdownForExport(contentElement, includeImages)
      : getPlainText(contentElement)

  return [textContent, imageContent].filter(Boolean).join("\n\n")
}

function getMessageContentElement(element: HTMLElement, role: MessageRole) {
  if (role === "user") {
    return element.querySelector<HTMLElement>("[data-testid='collapsible-user-message-content']") ?? element
  }

  return element.querySelector<HTMLElement>(".markdown") ?? element
}

function getPlainText(element: HTMLElement) {
  const text = element.innerText || element.textContent || ""

  return normalizePlainText(text)
}

function htmlToMarkdownForExport(element: HTMLElement, includeImages: boolean) {
  if (includeImages) {
    return htmlToMarkdown(element)
  }

  const clone = element.cloneNode(true) as HTMLElement
  clone.querySelectorAll(IMAGE_SELECTOR).forEach(image => image.remove())

  return htmlToMarkdown(clone)
}

function getMessageImageReferences(
  messageElement: HTMLElement,
  contentElement: HTMLElement,
  contentAlreadyIncludesImages: boolean,
) {
  const seenSources = new Set<string>()

  return Array.from(messageElement.querySelectorAll<HTMLImageElement>(IMAGE_SELECTOR))
    .filter(image => !(contentAlreadyIncludesImages && contentElement.contains(image)))
    .map(getImageReference)
    .filter((reference): reference is ImageReference => {
      if (!reference || seenSources.has(reference.src)) {
        return false
      }

      seenSources.add(reference.src)
      return true
    })
}

function getImageReference(image: HTMLImageElement): ImageReference | undefined {
  const src = image.currentSrc || image.src || image.getAttribute("src") || ""

  if (!src) {
    return
  }

  return {
    alt: getImageAltText(image),
    src,
  }
}

function getImageAltText(image: HTMLImageElement) {
  const alt = image.getAttribute("alt")?.trim()

  if (alt) {
    return alt
  }

  const labelledElement = image.closest<HTMLElement>("[aria-label]")
  const label = labelledElement
    ?.getAttribute("aria-label")
    ?.replace(/^open image:\s*/i, "")
    .trim()

  return label || "Image"
}

function formatImageReferences(references: ImageReference[], exportFormat: ConversationExportFormat) {
  if (references.length === 0) {
    return ""
  }

  if (exportFormat === "markdown") {
    return references
      .map(reference => `![${escapeMarkdownLinkText(reference.alt)}](${escapeMarkdownUrl(reference.src)})`)
      .join("\n\n")
  }

  return references.map(reference => `Image: ${reference.alt}\nURL: ${reference.src}`).join("\n\n")
}

function formatMessage(
  content: string,
  role: MessageRole,
  includeRoleNames: boolean,
  exportFormat: ConversationExportFormat,
) {
  if (!content) {
    return ""
  }

  if (!includeRoleNames) {
    return content
  }

  const roleLabel = role === "user" ? "User" : "Assistant"

  if (exportFormat === "markdown") {
    return `## ${roleLabel}\n\n${content}`
  }

  return `${roleLabel} :\n${content}`
}

function normalizePlainText(content: string) {
  return content
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function escapeMarkdownLinkText(text: string) {
  return text.replace(/([\]\\])/g, "\\$1")
}

function escapeMarkdownUrl(url: string) {
  return url.replace(/\)/g, "%29")
}

function cleanExportContent(content: string, exportFormat: ConversationExportFormat) {
  const contentWithoutLegacyLabels = content.replace(/CopyEdit/g, " ")

  if (exportFormat === "markdown") {
    return contentWithoutLegacyLabels.replace(/\r\n/g, "\n").trim()
  }

  return normalizePlainText(contentWithoutLegacyLabels)
}
