import devlog from "@/utils/dev-log"

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((req, sender, response) => {
    if (req.action == "logContent") {
      devlog("background received logContent request")

      devlog("background => req", req)
      browser.tabs.query({}, tabs => {
        const targetTab = tabs.find(tab => tab.url?.startsWith("https://chatgpt.com/c/"))
        if (!targetTab) {
          devlog("No matching tab found")
          return
        }
        const tabId = targetTab.id
        devlog("Matching tab ID: ", tabId)
        if (tabId) {
          browser.tabs
            .sendMessage(tabId, {
              action: "log",
              includeUser: req.includeUser,
              includeRoleNames: req.includeRoleNames,
            })
            .then(() => {
              devlog("background => logContent done")
            })
            .catch(err => {
              devlog("background => logContent error", err)
            })
        }
      })
    }
  })
})
