import devlog from "@/utils/dev-log"
import { isChatGptTabUrl, type ExportErrorCode, type ExportResponse } from "../utils/export-flow"

function mapBackgroundError(error: unknown): ExportErrorCode {
  const message = error instanceof Error ? error.message : String(error)

  if (/receiving end does not exist|Could not establish connection|message port closed/i.test(message)) {
    return "content_script_unavailable"
  }

  return "unexpected_error"
}

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (req): Promise<ExportResponse | undefined> => {
    if (req.action != "logContent") {
      return
    }

    devlog("background received logContent request")
    devlog("background => req", req)

    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true })
      const targetTab = tabs.find(tab => isChatGptTabUrl(tab.url))

      if (!targetTab) {
        devlog("No active ChatGPT tab found")
        return { ok: false, errorCode: "no_chatgpt_site" }
      }

      const tabId = targetTab.id

      devlog("Active ChatGPT tab ID: ", tabId)

      if (typeof tabId != "number") {
        return { ok: false, errorCode: "unexpected_error" }
      }

      const response = (await browser.tabs.sendMessage(tabId, {
        action: "log",
        exportFormat: req.exportFormat,
        includeUser: req.includeUser,
        includeRoleNames: req.includeRoleNames,
        includeImages: req.includeImages,
      })) as ExportResponse | undefined

      if (!response) {
        return { ok: false, errorCode: "unexpected_error" }
      }

      if (!response.ok) {
        return response
      }

      devlog("background => logContent done")
      return response
    } catch (error) {
      devlog("background => logContent error", error)
      return { ok: false, errorCode: mapBackgroundError(error) }
    }
  })
})
