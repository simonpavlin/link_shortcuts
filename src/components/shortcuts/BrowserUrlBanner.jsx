import { useState } from 'react'
import { buildBrowserUrl } from '../../utils/url.utils'
import { IconLink, IconCheck } from '../shared/icons'

export const BrowserUrlBanner = ({ shortcutKey }) => {
  const [copied, setCopied] = useState(false)
  const url = buildBrowserUrl(window.location.origin, shortcutKey)

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      className={`url-copy-btn${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      title={url}
    >
      {copied ? <IconCheck /> : <IconLink />}
      {copied ? 'copied' : 'browser url'}
    </button>
  )
}
