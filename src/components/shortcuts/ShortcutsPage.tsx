import { useSearchParams } from 'react-router-dom'
import { AdminView } from './AdminView'

export const ShortcutsPage = () => {
  const [searchParams] = useSearchParams()
  const prefillCommand = searchParams.get('key') ?? ''
  return <AdminView prefillCommand={prefillCommand} prefillParam="" />
}
