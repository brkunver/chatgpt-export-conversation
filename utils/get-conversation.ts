export function getConversation(includeUser = false) {
  let content: string = ""
  let markdownElements: NodeListOf<Element>

  if (includeUser) {
    markdownElements = document.querySelectorAll(
      '[data-message-author-role="user"], [data-message-author-role="assistant"]',
    )
  } else {
    markdownElements = document.querySelectorAll("[data-message-author-role='assistant']")
  }

  for (let markdownElement of markdownElements) {
    content += markdownElement.textContent + "\n\n"
  }

  return content
}
