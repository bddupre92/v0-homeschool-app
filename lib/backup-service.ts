// This file is now completely bypassed during build
// The mock implementations are directly in the page component
export async function backupAllCollections() {
  console.log("Mock backup initiated")
  return { success: true, timestamp: new Date().toISOString() }
}

export async function listBackups() {
  return [
    {
      name: "backups/backup-2025-04-25.json",
      size: "1024000",
      created: new Date().toISOString(),
    },
    {
      name: "backups/backup-2025-04-24.json",
      size: "985000",
      created: new Date(Date.now() - 86400000).toISOString(),
    },
  ]
}

export async function restoreBackup(fileName: string, options: { dryRun?: boolean } = {}) {
  console.log(`Mock restore of ${fileName}`)
  return { success: true }
}
