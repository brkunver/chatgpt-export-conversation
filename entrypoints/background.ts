export default defineBackground(() => {
  browser.runtime.onMessage.addListener((req, sender, response) => {
    if (req.action == "logContent") {
      browser.tabs.query({ active: true, currentWindow: true }, tabs => {
        const tabId = tabs[0]?.id
        if (tabId) {
          browser.tabs.sendMessage(tabId, { action: "log", includeUser: req.includeUser })
        }
      })
    }
  })
})
