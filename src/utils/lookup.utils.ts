import { v4 as uuidv4 } from 'uuid'

// ── Types ────────────────────────────────────────────────────────────────────

export type LookupEntry = {
  id: string
  description: string
  tags: string[]
  url: string
  lastUsedAt?: string | null
}

export type LookupTable = {
  id: string
  key: string
  name: string
  selectionMode?: 'first' | 'picker' | 'last-used'
  entries: LookupEntry[]
}

// ── CRUD for tables ──────────────────────────────────────────────────────────

export const createTable = ({ key = '', name = '' } = {}): LookupTable => ({
  id: uuidv4(),
  key: key.trim(),
  name: name.trim(),
  entries: [],
})

export const createEntry = ({ description = '', tags = [] as string[], url = '' } = {}): LookupEntry => ({
  id: uuidv4(),
  description: description.trim(),
  tags,
  url: url.trim(),
})

export const addTable = (tables: LookupTable[], data: { key?: string; name?: string }) => {
  const table = createTable(data)
  return { tables: [...tables, table], newId: table.id }
}

export const updateTable = (tables: LookupTable[], id: string, data: Partial<LookupTable>): LookupTable[] =>
  tables.map((t) => (t.id === id ? { ...t, ...data } : t))

export const deleteTable = (tables: LookupTable[], id: string): LookupTable[] =>
  tables.filter((t) => t.id !== id)

// ── CRUD for entries ─────────────────────────────────────────────────────────

export const addEntry = (tables: LookupTable[], tableId: string, data: Partial<LookupEntry>): LookupTable[] =>
  tables.map((t) =>
    t.id !== tableId ? t : { ...t, entries: [...t.entries, createEntry(data)] }
  )

export const updateEntry = (tables: LookupTable[], tableId: string, entryId: string, data: Partial<LookupEntry>): LookupTable[] =>
  tables.map((t) =>
    t.id !== tableId
      ? t
      : {
          ...t,
          entries: t.entries.map((e) =>
            e.id === entryId
              ? { ...e, description: (data.description ?? e.description).trim(), tags: data.tags ?? e.tags, url: (data.url ?? e.url).trim() }
              : e
          ),
        }
  )

export const deleteEntry = (tables: LookupTable[], tableId: string, entryId: string): LookupTable[] =>
  tables.map((t) =>
    t.id !== tableId ? t : { ...t, entries: t.entries.filter((e) => e.id !== entryId) }
  )

// ── Search ───────────────────────────────────────────────────────────────────

export const findTable = (tables: LookupTable[], key: string): LookupTable | null =>
  tables.find((t) => t.key === key) ?? null

export const searchEntries = (table: LookupTable, tags: string[]): LookupEntry[] => {
  if (!tags.length) return table.entries
  return table.entries.filter((e) => tags.every((tag) => e.tags.includes(tag)))
}

// ── Tag helpers ──────────────────────────────────────────────────────────────

export const getAllTagsForTable = (table: LookupTable): string[] => {
  const set = new Set<string>()
  for (const e of table.entries) {
    for (const tag of e.tags) set.add(tag)
  }
  return [...set].sort()
}

export const duplicateTable = (tables: LookupTable[], id: string): LookupTable[] => {
  const src = tables.find((t) => t.id === id)
  if (!src) return tables
  const copy: LookupTable = {
    ...createTable({ key: `${src.key}-copy`, name: src.name ? `${src.name} (copy)` : '' }),
    entries: src.entries.map((e) => ({ ...e, id: uuidv4() })),
  }
  const idx = tables.findIndex((t) => t.id === id)
  const result = [...tables]
  result.splice(idx + 1, 0, copy)
  return result
}
