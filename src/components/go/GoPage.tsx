import { useSearchParams } from 'react-router-dom'
import { GoAdminView } from './GoAdminView'

export const GoPage = () => {
  const [searchParams] = useSearchParams()
  const prefillCommand = searchParams.get('key') ?? ''
  return <GoAdminView prefillCommand={prefillCommand} prefillParam="" />
}
