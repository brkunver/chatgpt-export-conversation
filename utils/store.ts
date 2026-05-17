import { storage } from "#imports"

export type ExportPreferences = {
  includeUser: boolean
  includeRoleNames: boolean
  includeImages: boolean
}

export const defaultExportPreferences: ExportPreferences = {
  includeUser: true,
  includeRoleNames: true,
  includeImages: true,
}

export const exportPreferencesStorage = storage.defineItem<ExportPreferences>("local:exportPreferences", {
  fallback: defaultExportPreferences,
})
