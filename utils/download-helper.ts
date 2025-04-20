export function downloadTxtFile(content: string, fileName: string = "conversation.txt") {
  const blob = new Blob([content], { type: "text/plain" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")

  a.href = url
  a.download = fileName
  document.body.appendChild(a)

  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
