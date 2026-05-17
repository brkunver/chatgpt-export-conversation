import type { ConversationExportFormat } from "@/utils/get-conversation"

const FILE_CONFIG: Record<ConversationExportFormat, { fileName: string; mimeType: string }> = {
  markdown: {
    fileName: "conversation.md",
    mimeType: "text/markdown",
  },
  txt: {
    fileName: "conversation.txt",
    mimeType: "text/plain",
  },
}

export function downloadConversationFile(content: string, exportFormat: ConversationExportFormat = "txt") {
  const fileConfig = FILE_CONFIG[exportFormat]

  downloadFile(content, fileConfig.fileName, fileConfig.mimeType)
}

export function downloadTxtFile(content: string, fileName: string = "conversation.txt") {
  downloadFile(content, fileName, "text/plain")
}

function downloadFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")

  a.href = url
  a.download = fileName
  document.body.appendChild(a)

  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
