# Linker – Koncept aplikace

## Účel

Aplikace funguje jako chytrý custom search engine pro prohlížeč. Místo přímého přesměrování na jednu URL umožňuje definovat pravidla (regex-based), která rozhodují, kam uživatele přesměrovat na základě vstupu.

**Příklad:**
Uživatel si nastaví v prohlížeči custom search engine s URL:
`https://linker.pavlin.dev/shortcuts/?command=mr&param=%s`

Poté stačí zadat `mr 1234` → Linker vyhodnotí pravidla a přesměruje na
`https://github.com/org/repo/merge_requests/1234`.

---

## Architektura – sub-aplikace

Projekt je platforma pro více nezávislých sub-aplikací. Každá řeší jiný způsob přesměrování:

| Sub-app | Cesta | Popis |
|---|---|---|
| **Regex Shortcuts** | `/shortcuts/` | Pravidla na základě regexů |
| **URL Transformer** | `/transform/` | Transformace části vstupní URL (např. github → gitlab) |
| **Lookup Table** | `/lookup/` | Přesná shoda klíče → URL (bez regex logiky) |

---

## Režimy aplikace

URL schema: `https://linker.pavlin.dev/{sub-app}/?command={key}&param={vstup}`

### Redirect mód
- Podmínka: URL obsahuje `command` i `param` (a `param ≠ "?"`)
- Chování: vyhodnotí pravidla → přesměruje

### Admin mód
Otevře se, když:
- chybí `param`
- `param === "?"` ← trik: zadáním `mr ?` v prohlížeči se rovnou otevře admin

**Fallback při žádné shodě:** Otevře admin mód s prefillnutým testem – uživatel hned vidí, proč nic nesedí.

---

## Sub-app: Regex Shortcuts

### Datový model

```json
{
  "shortcuts": [
    {
      "id": "uuid",
      "key": "mr",
      "name": "Merge Requests",
      "rules": [
        {
          "id": "uuid",
          "label": "číslo MR",
          "pattern": "^\\d+$",
          "url": "https://github.com/org/repo/merge_requests/%s"
        },
        {
          "id": "uuid",
          "label": "hledání textu",
          "pattern": ".*",
          "url": "https://github.com/org/repo/merge_requests?search=%s"
        }
      ]
    }
  ]
}
```

### Předdefinované vzory (helpers)
- `is-number` → `^\d+$`
- `is-word` → `^\w+$`
- `is-any` → `.*` (catch-all fallback)
- Custom regex (uživatel zadá vlastní)

### Vyhodnocování pravidel
1. Pravidla se procházejí shora dolů (pořadí = priorita)
2. První shoda vyhrává → redirect
3. Pokud nic nesedí → admin mód s prefillnutým commandem

### Správa pravidel
- Drag & drop reordering
- CRUD pravidel
- Kopírovat browser URL (pro nastavení custom search engine v prohlížeči)
- Test mód: zadat command, vidět krok po kroku výsledek každého pravidla

---

## Datové úložiště

- **localStorage** – JSON, oddělený per sub-app
- **Export** – stáhnout `.json` soubor s celým nastavením
- **Import** – nahrát `.json` soubor (merge nebo přepis)

---

## UI

- Světlý / tmavý mód
- Moderní minimalistický design, web-first, mobile-friendly

---

## Dev konvence

- Každá komponenta = vlastní soubor
- Logika v `.utils.js` souborech; komponenty jen volají funkce/hooky a renderují
- Custom hook `useLocalStorage` pro perzistenci
- Routing: každá sub-app na vlastní cestě (`/shortcuts/`, `/transform/`, `/lookup/`)
- Sdílené komponenty v `src/components/shared/`
