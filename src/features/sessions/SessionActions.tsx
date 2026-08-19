import type { Session } from '../../lib/types'
import { saveSessionsToDB } from '../../lib/db/indexedDB'

export async function exportSessions(
  sessions: Session[],
  toast?: (msg: string) => void
): Promise<void> {
  try {
    const data = JSON.stringify(sessions, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cryptotool_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast?.('Sessions exported.')
  } catch (e) {
    toast?.('Failed to export sessions.')
  }
}

export function importSessions(
  onSuccess: (sessions: Session[]) => void,
  toast?: (msg: string) => void
): void {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async e => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      try {
        const text = ev.target?.result as string
        const data = JSON.parse(text)
        if (!Array.isArray(data)) throw new Error('Invalid format')

        if (window.confirm('Import will replace all current sessions. Continue?')) {
          await saveSessionsToDB(data)
          onSuccess(data)
          toast?.(`Imported ${data.length} sessions.`)
        }
      } catch {
        toast?.('Import failed: invalid file.')
      }
    }
    reader.readAsText(file)
  }
  input.click()
}
