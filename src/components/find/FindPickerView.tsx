import { useCallback, useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { FindTable, FindEntry } from '../../utils/find.utils'
import { TagBadge } from './TagBadge'
import { IconArrowRight } from '../shared/icons'
import { resolveUrl } from '../../utils/url.utils'
import { interpolateParams } from '../../utils/go.utils'

type Props = {
  table: FindTable
  entries: FindEntry[]
  tags: string[]
  params?: Record<string, string>
}

export const FindPickerView = ({ table, entries, tags, params = {} }: Props) => {
  const [focusedIndex, setFocusedIndex] = useState(0)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])

  const navigate = useCallback((index: number) => {
    const entry = entries[index]
    if (entry) {
      window.location.href = resolveUrl(interpolateParams(entry.url, params))
    }
  }, [entries, params])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) => (prev + 1) % entries.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) => (prev - 1 + entries.length) % entries.length)
          break
        case 'Enter':
          e.preventDefault()
          navigate(focusedIndex)
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [entries.length, focusedIndex, navigate])

  useEffect(() => {
    itemRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [focusedIndex])

  return (
    <div className="find-picker-page module-find">
      <div className="find-picker-header">
        <div className="page-hero-eyebrow">
          <span className="page-hero-line" />
          {table.key}
          <span className="page-hero-line" />
        </div>
        <h1 className="page-hero-title">
          {table.name || table.key}
        </h1>
        <div className="find-picker-tags">
          {tags.map((t) => <TagBadge key={t} tag={t} />)}
        </div>
      </div>

      <div className="find-picker-list">
        {entries.map((entry, i) => (
          <a
            key={entry.id}
            ref={(el) => { itemRefs.current[i] = el }}
            href={resolveUrl(interpolateParams(entry.url, params))}
            className={`find-picker-item${i === focusedIndex ? ' find-picker-item-focused' : ''}`}
            style={{ animationDelay: `${i * 0.06}s` }}
            onMouseEnter={() => setFocusedIndex(i)}
          >
            <div className="find-picker-item-main">
              <div className="find-picker-item-desc">{entry.description}</div>
              <div className="find-picker-item-tags">
                {entry.tags.map((t) => <TagBadge key={t} tag={t} />)}
              </div>
            </div>
            <div className="find-picker-item-url">{entry.url}</div>
            <div className="find-picker-item-arrow"><IconArrowRight /></div>
          </a>
        ))}
      </div>

      <NavLink to="/find/" className="find-picker-back">
        ← Manage tables
      </NavLink>
    </div>
  )
}
