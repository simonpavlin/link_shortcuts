import { useState } from 'react'
import { buildBrowserUrl } from '../../utils/url.utils'
import { Button } from '../shared/Button'

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
      <span className="url-banner-label">Browser URL:</span>
      <code className="url-banner-url">{url}</code>
      <Button variant="secondary" size="sm" onClick={handleCopy}>
        {copied ? '✓ Copied' : 'Copy'}
      </Button>
    </div>
  )
}
