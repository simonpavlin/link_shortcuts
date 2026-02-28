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

export const FindPickerView = ({ table, entries, tags, params = {} }: Props) => (
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
          href={resolveUrl(interpolateParams(entry.url, params))}
          className="find-picker-item"
          style={{ animationDelay: `${i * 0.06}s` }}
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
