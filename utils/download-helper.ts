import type { ConversationExportFormat } from "@/utils/get-conversation"

const FILE_CONFIG: Record<ConversationExportFormat, { fileName: string; extension: string; mimeType: string }> = {
  markdown: {
    fileName: "conversation.md",
    extension: "md",
    mimeType: "text/markdown",
  },
  txt: {
    fileName: "conversation.txt",
    extension: "txt",
    mimeType: "text/plain",
  },
}

export function downloadConversationFile(
  content: string,
  exportFormat: ConversationExportFormat = "txt",
  preferredFileName?: string,
) {
  const fileConfig = FILE_CONFIG[exportFormat]
  const fileName = getDownloadFileName(preferredFileName, fileConfig)

  downloadFile(content, fileName, fileConfig.mimeType)
}

export function downloadTxtFile(content: string, fileName: string = "conversation.txt") {
  downloadFile(content, fileName, "text/plain")
}

function getDownloadFileName(
  preferredFileName: string | undefined,
  fileConfig: { fileName: string; extension: string },
) {
  const safeFileName = sanitizeFileName(preferredFileName)

  if (!safeFileName) {
    return fileConfig.fileName
  }

  return `${safeFileName}.${fileConfig.extension}`
}

function sanitizeFileName(fileName?: string) {
  return (fileName ?? "")
    .replace(/[\u0000-\u001f\u0080-\u009f]/g, "")
    .replace(/[<>:"/\\|?*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 120)
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
