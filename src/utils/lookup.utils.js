import { v4 as uuidv4 } from 'uuid'

// --- CRUD for tables ---

export const createTable = ({ key = '', name = '' } = {}) => ({
  id: uuidv4(),
  key: key.trim(),
  name: name.trim(),
  entries: [],
})

export const createEntry = ({ description = '', tags = [], url = '' } = {}) => ({
  id: uuidv4(),
  description: description.trim(),
  tags,
  url: url.trim(),
})

export const addTable = (tables, data) => {
  const table = createTable(data)
  return { tables: [...tables, table], newId: table.id }
}

export const updateTable = (tables, id, data) =>
  tables.map((t) => (t.id === id ? { ...t, ...data } : t))

export const deleteTable = (tables, id) =>
  tables.filter((t) => t.id !== id)

// --- CRUD for entries ---

export const addEntry = (tables, tableId, data) =>
  tables.map((t) =>
    t.id !== tableId ? t : { ...t, entries: [...t.entries, createEntry(data)] }
  )

export const updateEntry = (tables, tableId, entryId, data) =>
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

export const deleteEntry = (tables, tableId, entryId) =>
  tables.map((t) =>
    t.id !== tableId ? t : { ...t, entries: t.entries.filter((e) => e.id !== entryId) }
  )

// --- Search ---

export const findTable = (tables, key) =>
  tables.find((t) => t.key === key) ?? null

/**
 * Returns entries from table where every searched tag is present in the entry's tags.
 * @param {{ entries: Array }} table
 * @param {string[]} tags
 */
export const searchEntries = (table, tags) => {
  if (!tags.length) return table.entries
  return table.entries.filter((e) => tags.every((tag) => e.tags.includes(tag)))
}

// --- Tag helpers ---

/** Returns all unique tags used across a table's entries, sorted. */
export const getAllTagsForTable = (table) => {
  const set = new Set()
  for (const e of table.entries) {
    for (const tag of e.tags) set.add(tag)
  }
  return [...set].sort()
}

export const duplicateTable = (tables, id) => {
  const src = tables.find((t) => t.id === id)
  if (!src) return tables
  const copy = {
    ...createTable({ key: `${src.key}-copy`, name: src.name ? `${src.name} (copy)` : '' }),
    entries: src.entries.map((e) => ({ ...e, id: uuidv4() })),
  }
  const idx = tables.findIndex((t) => t.id === id)
  const result = [...tables]
  result.splice(idx + 1, 0, copy)
  return result
}
