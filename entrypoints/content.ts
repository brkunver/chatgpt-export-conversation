import { getConversation } from "@/utils/get-conversation"
import { downloadTxtFile } from "@/utils/download-helper"
import devlog from "@/utils/dev-log"

export default defineContentScript({
  matches: ["*://*.chatgpt.com/c/*"],
  main() {
    devlog("content script loaded")
    browser.runtime.onMessage.addListener((req, sender, response) => {
      devlog("content message received => req", req)
      if (req.action == "log") {
        let content = getConversation(req.includeUser, req.includeRoleNames)
        downloadTxtFile(content)
      }
    })
  },
})
