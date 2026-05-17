export type ExportErrorCode =
  | "no_chatgpt_site"
  | "no_messages_found"
  | "content_script_unavailable"
  | "download_failed"
  | "unexpected_error"

export type ExportResponse = { ok: true } | { ok: false; errorCode: ExportErrorCode }

const SUPPORTED_CHATGPT_PATH_PREFIXES = ["/c", "/g", "/gg"]

export class ConversationExportError extends Error {
  constructor(
    public readonly code: ExportErrorCode,
    message?: string,
  ) {
    super(message ?? code)
    this.name = "ConversationExportError"
  }
}

export function isConversationExportError(error: unknown): error is ConversationExportError {
  return error instanceof ConversationExportError
}

export function isChatGptTabUrl(url?: string) {
  if (!url) {
    return false
  }

  try {
    return new URL(url).hostname.endsWith("chatgpt.com")
  } catch {
    return false
  }
}

export function isConversationTabUrl(url?: string) {
  if (!url) {
    return false
  }

  try {
    const pathname = new URL(url).pathname

    return SUPPORTED_CHATGPT_PATH_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
  } catch {
    return false
  }
}
