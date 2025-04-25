import devlog from "@/utils/dev-log"

export function getConversation(includeUser = false, includeRoleNames = false) {
  devlog("get conversation called")

  let content: string = ""
  let userElements
  let assistantElements

  assistantElements = document.querySelectorAll("[data-message-author-role='assistant']")
  devlog("assistant Elements : ", assistantElements)

  if (includeUser) {
    userElements = document.querySelectorAll("[data-message-author-role='user']")

    devlog("user Elements : ", userElements)
    for (let i = 0; i < userElements.length; i++) {
      if (includeRoleNames) {
        content += "User :\n"
      }
      content += userElements[i].textContent + "\n\n"
      if (includeRoleNames) {
        content += "Assistant :\n"
      }
      content += assistantElements[i].textContent + "\n\n"
    }
  } else {
    for (let i = 0; i < assistantElements.length; i++) {
      if (includeRoleNames) {
        content += "Assistant :\n"
      }
      content += assistantElements[i].textContent + "\n\n"
    }
  }
  devlog("content : ", content)
  return content.replace(/CopyEdit/g, " ")
}
