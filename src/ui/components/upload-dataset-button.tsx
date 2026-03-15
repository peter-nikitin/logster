import { useState } from 'react'
import type * as React from 'react'
import { FileUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { uiTestIds } from '@/ui/test-ids'

type UploadDatasetButtonProps = {
  isImporting: boolean
  onImportFile: (file: File) => Promise<void>
}

export function UploadDatasetButton({
  isImporting,
  onImportFile,
}: UploadDatasetButtonProps) {
  const [isDragging, setIsDragging] = useState(false)

  async function importSelectedFile(file: File | null) {
    if (!file) {
      return
    }

    await onImportFile(file)
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    await importSelectedFile(event.target.files?.[0] ?? null)
    event.target.value = ''
  }

  function handleDragOver(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault()

    if (!isImporting) {
      setIsDragging(true)
    }
  }

  function handleDragLeave(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
  }

  async function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)

    if (isImporting) {
      return
    }

    await importSelectedFile(event.dataTransfer.files?.[0] ?? null)
  }

  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-4">
      <div className="mb-3 space-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Local upload
        </p>
        <p className="text-sm text-muted-foreground">
          Drop a `.json` log file here or click to choose one from your device.
        </p>
      </div>
      <label
        className={cn(
          'block cursor-pointer rounded-xl border border-dashed px-4 py-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border/80 bg-background/80 hover:bg-accent hover:text-accent-foreground',
          isImporting && 'pointer-events-none opacity-60',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".json,application/json"
          className="sr-only"
          data-testid={uiTestIds.uploadInput}
          onChange={handleFileChange}
        />
        <span className="flex flex-col items-center gap-3">
          <span className="rounded-full border border-border/80 bg-muted/60 p-3 text-muted-foreground">
            <FileUp className="h-5 w-5" />
          </span>
          <span className="space-y-1">
            <span className="block text-sm font-medium text-foreground">
              {isImporting ? 'Importing…' : 'Drop file or click to select'}
            </span>
            <span className="block font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
              JSON only
            </span>
          </span>
        </span>
      </label>
    </div>
  )
}
