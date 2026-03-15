export type ImportedBrowserFile = {
  name: string
  rawContent: string
}

export async function readBrowserFile(file: File): Promise<ImportedBrowserFile> {
  const rawContent = await file.text()

  return {
    name: file.name,
    rawContent,
  }
}
