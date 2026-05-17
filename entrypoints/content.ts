import { getConversation } from "@/utils/get-conversation"
import type { ConversationExportFormat } from "@/utils/get-conversation"
import { downloadConversationFile } from "@/utils/download-helper"
import devlog from "@/utils/dev-log"
import { type ExportErrorCode, type ExportResponse, isConversationExportError } from "../utils/export-flow"

function mapContentError(error: unknown): ExportErrorCode {
  if (isConversationExportError(error)) {
    return error.code
  }

  return "unexpected_error"
}

export default defineContentScript({
  matches: ["*://chatgpt.com/*", "*://*.chatgpt.com/c/*", "*://*.chatgpt.com/g/*"],
  main() {
    devlog("content script loaded")
    browser.runtime.onMessage.addListener((req): ExportResponse | undefined => {
      devlog("content message received => req", req)
      if (req.action != "log") {
        return
      }

      const exportFormat: ConversationExportFormat = req.exportFormat === "markdown" ? "markdown" : "txt"

      try {
        const content = getConversation(req.includeUser, req.includeRoleNames, exportFormat)

        try {
          downloadConversationFile(content, exportFormat)
        } catch (error) {
          devlog("content => download error", error)
          return { ok: false, errorCode: "download_failed" }
        }

        return { ok: true }
      } catch (error) {
        devlog("content => log error", error)
        return { ok: false, errorCode: mapContentError(error) }
      }
    })
  },
})
