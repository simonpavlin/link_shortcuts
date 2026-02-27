import { NavLink } from 'react-router-dom'
import { TagBadge } from './TagBadge'
import { IconArrowRight } from '../shared/icons'
import { resolveUrl } from '../../utils/url.utils'

export const LookupPickerView = ({ table, entries, tags }) => (
  <div className="lookup-picker-page module-find">
    <div className="lookup-picker-header">
      <div className="page-hero-eyebrow">
        <span className="page-hero-line" />
        {table.key}
        <span className="page-hero-line" />
      </div>
      <h1 className="page-hero-title">
        {table.name || table.key}
      </h1>
      <div className="lookup-picker-tags">
        {tags.map((t) => <TagBadge key={t} tag={t} />)}
      </div>
    </div>

    <div className="lookup-picker-list">
      {entries.map((entry, i) => (
        <a
          key={entry.id}
          href={resolveUrl(entry.url)}
          className="lookup-picker-item"
          style={{ animationDelay: `${i * 0.06}s` }}
        >
          <div className="lookup-picker-item-main">
            <div className="lookup-picker-item-desc">{entry.description}</div>
            <div className="lookup-picker-item-tags">
              {entry.tags.map((t) => <TagBadge key={t} tag={t} />)}
            </div>
          </div>
          <div className="lookup-picker-item-url">{entry.url}</div>
          <div className="lookup-picker-item-arrow"><IconArrowRight /></div>
        </a>
      ))}
    </div>

    <NavLink to="/find/" className="lookup-picker-back">
      ← Manage tables
    </NavLink>
  </div>
)
