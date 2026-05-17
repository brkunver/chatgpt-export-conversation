import devlog from "@/utils/dev-log"
import { htmlToMarkdown } from "@/utils/html-to-markdown"
import { ConversationExportError } from "./export-flow"

export type ConversationExportFormat = "txt" | "markdown"

type MessageRole = "user" | "assistant"

const MESSAGE_SELECTOR = "[data-message-author-role='assistant'], [data-message-author-role='user']"

export function getConversation(
  includeUser = false,
  includeRoleNames = false,
  exportFormat: ConversationExportFormat = "txt",
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
      const messageContent = getMessageContent(element, role, exportFormat)

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

function getMessageContent(element: HTMLElement, role: MessageRole, exportFormat: ConversationExportFormat) {
  const contentElement = getMessageContentElement(element, role)

  if (exportFormat === "markdown" && role === "assistant") {
    return htmlToMarkdown(contentElement)
  }

  return getPlainText(contentElement)
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

function cleanExportContent(content: string, exportFormat: ConversationExportFormat) {
  const contentWithoutLegacyLabels = content.replace(/CopyEdit/g, " ")

  if (exportFormat === "markdown") {
    return contentWithoutLegacyLabels.replace(/\r\n/g, "\n").trim()
  }

  return normalizePlainText(contentWithoutLegacyLabels)
}
