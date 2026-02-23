# Linker

Chytrý custom search engine pro prohlížeč. Místo přesměrování na jednu pevnou URL umožňuje definovat pravidla, která rozhodují kam přesměrovat na základě vstupu.

**Příklad použití:**
Nastavíš v prohlížeči custom search engine s URL:
```
https://linker.pavlin.dev/shortcuts/?command=mr&param=%s
```
Pak stačí zadat `mr 1234` → Linker vyhodnotí pravidla a přesměruje na
`https://github.com/org/repo/merge_requests/1234`.

Zadáním `mr ?` se rovnou otevře admin pro daný shortcut.

## Sub-aplikace

| Sub-app | Cesta | Popis |
|---|---|---|
| **Regex Shortcuts** | `/shortcuts/` | Pravidla na základě regexů |
| **URL Transformer** | `/transform/` | Transformace části URL (např. github → gitlab) |
| **Lookup Table** | `/lookup/` | Přesná shoda klíče → URL |

## Dokumentace

- [`docs/concept.md`](docs/concept.md) – koncept aplikace, datový model, režimy, dev konvence
- [`docs/architecture.md`](docs/architecture.md) – technická architektura, příkazy, deployment
