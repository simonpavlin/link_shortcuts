import { DataPorter } from '../shared/DataPorter'

export const ImportExport = ({ shortcuts, onImport }) => (
  <DataPorter
    data={shortcuts}
    dataKey="shortcuts"
    filename="linker-shortcuts.json"
    onImport={onImport}
  />
)
