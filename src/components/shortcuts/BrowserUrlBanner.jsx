import { useState } from 'react'
import { buildBrowserUrl } from '../../utils/url.utils'

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
    <div className="url-banner">
      <span className="url-banner-label">Browser URL</span>
      <code className="url-banner-url" title={url}>{url}</code>
      <button className="btn btn-ghost btn-sm" onClick={handleCopy}>
        {copied ? '✓ copied' : 'copy'}
      </button>
    </div>
  )
}
