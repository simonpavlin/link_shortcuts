## 1. Aplikace „Shortcuts“ (chytré přesměrování podle vstupu)


- aplikace má být obdoba vlastních vyhledávačů v prohlížečích - nastaví se název vyhledávače, pak klíčové slovo a pak url na které se to má v tom případě přesměrovat, url obsahuje znak %s, za který se v url doplní to, co uživatel napíše pak v adresní řádce 
- například 
  - key: mr
  - nazev: Merge request
  - link: https://github.com/simonpavlin/link_shortcuts/merge_request/%s
  - uživatel zadá "mr 1234" -> je přesměrován na https://github.com/simonpavlin/link_shortcuts/merge_request/1234
- To popsáno výše je klasické chování v rámci prohlížeče, když si nastaví nějaký takhle custom vyhledávač.
- Já to chci posunout ještě výš a to tím, že si bude moci uživatel psát i pravidla podle kterých se to rozhoduje
  - když je to číslo -> jedna url
  - když to není číslo -> druha url
  - kdy6 je číslo dlouhé x znaku -> ...
  - kdyz je to konkrétní slovo -> 
  - když je to konkrétní regex -> 
- celý toto rozhodování bych postavil na regexech, jen tam bude pár přednastavených už pravidel (regexů, například pro to slovo, číslo a tak)
- Viděl bych to tak, že by uživatel měl rúzné sekce pro rúzné ty zkratky, protože nebude chtít jen jednu zkratku
  - takže bude mít zkratku "mr" s názvem Merge requesty a pro ni bude mít pak několik pravidel ... rule,  link 
  - zároveň u každé sekce bude možnost si zkopírovat nebo náhlednout tu url, kterou si má uživatel v prohlížeči nastavit, třeba https://linker.pavlin.dev/regex/?command=mr&param=%s
  - bude možnost si i testnou konkrétní command, uživatel zadá command (např "mr 12345") a uvidí zpětnou vazbu, jaká sekce to vyhodnotila, jak se postupně zvalidovali nějaké ty pravidla a jaké to finálně vzalo pravidlo
  - pravidla bude moci i přesouvat a měnit tim jejich pořadí / prioritu, přesouvání si představuji pomocí drag and drop

- Pravidla se budou držet v localstorage v nějakém hezké json formátu, zároveň tím chci mít možnost exportovat nastavená pravidla do json souboru a soubor si uložit do počítače, a zároveň mít možnost i nahrát daná pravidla z json souboru.
- přesměrování i vyhodnocování bude probíhát na fe, tzn navštívením například https://linker.pavlin.dev/regex/?command=mr&param=123456 se automaticky přesměruje na daný merge request
- když uživatel navštíví stránku přímo ... např jen https://linker.pavlin.dev/regex nebo https://linker.pavlin.dev/regex/?command=mr tzn nemá to param parameter, tak se otevře admin menu, kde bude moci ty linky zas editovat
- zároveň bych přidal i možnost, že když bude parametr otazník tak se také otevře admin mode, bez redirectu

- uživatelské rozhraní
  - jednoduché, intuitivní
  - mobile friendly, ale web first
  - dva mody - tmavý a světlý
  - moderní, minialistkcý design
  - 
- vyvoj
  - rozděluj komponenty do jednotlivých souborů kvůli přehlednosti
  - pro ukládání do localstorage si udělej pomocný hook
  - rúzné logiky dávej do separe .utils.js souborů, v komponentě by mělo být jen čisté provolání funkcí / hooků  a vyrenderovaní 
  - připrav strukrutu  a tak na to, že bude moci být pak i víc oddělených logik ... tato podapolikace řeší regexy, ale pak mohou být jiné podaplikace ... navrhni to tedy dle toho



**Cíl:**
Rychlé přesměrování na správné URL podle krátkého vstupu z prohlížeče (custom search engine).
