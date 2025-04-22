import { getConversation } from "@/utils/get-conversation"
import { downloadTxtFile } from "@/utils/download-helper"

export default defineContentScript({
  matches: ["*://*.chatgpt.com/*"],
  main() {
    browser.runtime.onMessage.addListener((req, sender, response) => {
      if (req.action == "log") {
        let content = getConversation(req.includeUser, req.includeRoleNames)
        downloadTxtFile(content)
      }
    })
  },
})
