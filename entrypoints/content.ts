import { getConversation } from "@/utils/get-conversation"
import type { ConversationExportFormat } from "@/utils/get-conversation"
import { downloadConversationFile } from "@/utils/download-helper"
import devlog from "@/utils/dev-log"

export default defineContentScript({
  matches: ["*://chatgpt.com/*", "*://*.chatgpt.com/c/*", "*://*.chatgpt.com/g/*"],
  main() {
    devlog("content script loaded")
    browser.runtime.onMessage.addListener((req, sender, response) => {
      devlog("content message received => req", req)
      if (req.action == "log") {
        const exportFormat: ConversationExportFormat = req.exportFormat === "markdown" ? "markdown" : "txt"
        const content = getConversation(req.includeUser, req.includeRoleNames, exportFormat)
        downloadConversationFile(content, exportFormat)
      }
    })
  },
})
