export function getConversation(includeUser = false, includeRoleNames = false) {
  let content: string = ""
  let userElements
  let assistantElements

  assistantElements = document.querySelectorAll("[data-message-author-role='assistant']")

  if (includeUser) {
    userElements = document.querySelectorAll("[data-message-author-role='user']")
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

  return content.replace(/CopyEdit/g, " ")
}
