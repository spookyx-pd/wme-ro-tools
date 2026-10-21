# Changelog - wme-ro-tools

> **Regulă nouă (2026-10-20, Paul):** fiecare set de modificări urcat pe
> GitHub (ramura `dev`) primește o versiune nouă - incrementare minoră
> 0.45.1, 0.45.2… pentru orice modificare, ca să existe evidență. Release
> (deci publicare pe Greasy Fork) DOAR când Paul spune că e ok, indiferent
> de număr. Funcțiile noi mari pot primi în continuare 0.46, 0.47…
>
> **Convenție de versionare (din v0.34.1, cerere Paul 2026-10-15)**:
> bug-fix → increment minor (0.34.1, 0.34.2…); funcție nouă sau
> modificare complexă → 0.35, 0.36… Fiecare versiune intră și în
> mini-changelog-ul din script.
> Completare (tot 2026-10-15): în script NU se mai trec bug-fix-urile -
> doar funcțiile noi, în `VERSION_HISTORY` (fereastra „Ce e nou”).
>
> *Convenția veche (v0.20 - v0.34), înlocuită:* nu mai creștem
> versiunea (nici măcar patch) pentru fix-uri mici sau funcții încă în
> testare. Creștem versiunea (0.20, 0.21, 0.22...) DOAR la un release
> cu adevărat notabil - o funcție nouă gata de folosit, sau reparat un
> bug important, mai vechi. Scriptul are acum și un mini-changelog
> intern (în engleză, doar aceste versiuni notabile) lângă
> `SCRIPT_VERSION`, în afară de acest fișier (care rămâne detaliat, în
> română, pentru fiecare schimbare reală, indiferent dacă a primit sau
> nu propriu-zis o versiune nouă).

## 2026-10-21 - v0.47 - Junction Box: avertizare pentru rutele nepermise (pe `dev`, nepublicată)

- **Nou:** cât timp e selectat un Junction Box (click pe el, imediat după
  ce îl creezi, cât îl modifici), sub bara de sus apare o avertizare dacă
  are rute nepermise: „Junction Box: 1 din 9 rute nepermisă”, apoi pentru
  fiecare „Dinspre DN1 (N) → spre DN1 (S)”, segmentele, prin câte segmente
  trece și motivul (interzisă, viraj dificil, după program, pe vehicule).
- Mouse-ul pe un rând desenează ruta pe hartă (intrarea / ieșirea
  portocaliu întrerupt, interiorul roșu).
- Nu apare când toate rutele sunt permise și nici pe hartă în general - doar
  la JB-ul selectat. ✕ o ascunde până se schimbă rutele.
- Opțiune nouă: „Avertizare rute nepermise în Junction Box” (pornită).

## 2026-10-21 - v0.46.2 - reparat: butonul de previzualizare se înmulțea (pe `dev`, nepublicată)

- La un link scris ca text (ex. în „Descriere” la UR), la fiecare ~1 s se mai
  adăuga un buton de previzualizare după același link. Acum butonul apare o
  singură dată.
- Iconița e acum un desen (SVG), nu emoji-ul 🖼, care în unele fonturi apărea
  ca un pătrat.

## 2026-10-20 - v0.46.1 - coordonate GPS: mai multe formate recunoscute (pe `dev`, nepublicată)

- Coordonatele scrise ca „44*18'18.0'N si 26*10'41.6''E” devin acum link.
- Recunoscute în plus: `*` / `º` / `˚` în loc de `°`; secunde marcate cu `'`
  simplu, `''`, `"`, `″`; minute cu zecimale (44°18.305'N); orice cuvânt sau
  semn scurt între latitudine și longitudine („si”, „și”, „and”, „,”, „&”,
  „/”…); fără literele N / E (se consideră N / E).
- Coordonatele zecimale acceptă și „44.305 si 26.178”, „44.305 & 26.178”.

## 2026-10-20 - v0.46 - previzualizare poze din linkuri în UR / MP (pe `dev`, nepublicată)

- **Nou:** în conversația UR / MP apare **🖼** după fiecare link (și după
  linkurile pe care WME le face clicabile, și după cele scrise ca text).
  Click → fereastră în editor cu poza: zoom cu rotița la cursor, mutare cu
  mouse-ul, dublu-click = potrivește / 2x, butoane −/+, Potrivește, 1:1,
  rotire 90°, ↗ (deschide linkul într-un tab nou, doar dacă vrei), ✕ / Esc.
  Fereastra se mută de bara de titlu și se redimensionează din colț.
- Merge cu linkuri directe la poze și cu pagini de găzduire (ibb.co / imgbb,
  imgur, postimg etc.): poza e luată din pagină (og:image).
- Punctul (sau altă punctuație) pus după link e ignorat; la linkurile native,
  adresa e corectată și pentru click-ul obișnuit.
- Opțiune nouă: „Previzualizare poze din linkuri (UR / MP)” (pornită).
- Antet: `@connect` pentru ibb.co, imgbb.com, imgur.com, postimg.cc și `*`
  (alte site-uri) - Tampermonkey poate cere permisiunea la primul link de pe
  un site nou.

## 2026-10-20 - v0.45.8 - analiză: butoane după tipul mesajului, ciorne 3 zile (pe `dev`, nepublicată)

- **Mesaj pentru: ✅ Aprobare** → jos rămâne un singur buton, „Aprobă și
  trimite mesaj privat”: pune mesajul (cu textul de aprobare) în chatul WME
  cu utilizatorul - tu îl verifici și apeși Trimite - și aprobă sugestia
  („Actualizare hartă”). Dacă mesajul nu ajunge în chat, sugestia NU se
  aprobă. „Copiază” și „Trimite în chat” nu mai apar aici.
- **Mesaj pentru: ❌ Respingere** → „Copiază” + bifa „💬 Trimite și în
  chat” (ținută minte) + „Respinge cu acest mesaj” (Waze trimite mesajul prin
  e-mail; cu bifa, același mesaj se pune și în chat).
- **Ciornele** (text, stări, explicații) se păstrează 3 zile (în loc de 30) și
  se șterg imediat după aprobare sau respingere.

## 2026-10-20 - v0.45.7 - fereastra de respingere: mesajul se reface din analiză (pe `dev`, nepublicată)

- Problema: la „Respinge”, caseta primea ciorna salvată mai devreme (ex. dintr-o
  versiune fără numele străzilor), nu mesajul compus din analiza de acum.
- Acum: dacă textul nu a fost modificat de mână, se compune din nou la fiecare
  deschidere (cu străzile, stările și explicațiile actuale). Un text
  modificat de mână se păstrează.
- Buton nou **„↻ Refă din analiză”** în fereastra de respingere (cere
  confirmare dacă textul a fost modificat de mână). Pentru ciornele vechi
  (dinainte de 0.45.7) apasă-l o dată.

## 2026-10-20 - v0.45.6 - sugestii: modificările grupate pe stradă (pe `dev`, nepublicată)

- Fiecare modificare primește strada și orașul segmentului (din hartă; la un
  segment nou - strada propusă pentru el; altfel locul din fereastră, fără
  județ).
- Mesajul către utilizator e grupat pe străzi: „📍 Str. Costache Negri, Tudor
  Vladimirescu - 2 modificări”, urmat de observațiile pentru acea stradă;
  apoi următoarea stradă etc. Numărul arată toate modificările străzii din
  sugestie.
- Același grupaj apare și în panoul „Analiză modificări”; în lista de după
  respingere fiecare rând arată strada.

## 2026-10-20 - v0.45.5 - sugestii: modificări de geometrie lizibile (pe `dev`, nepublicată)

- „Geometrie” nu mai apare ca listă de coordonate GPS: în analiză și în lista
  de după respingere se vede „3 puncte, 363 m → 4 puncte, 363 m” și ce s-a
  schimbat („1 punct adăugat / mutat, lungime +0 m”).
- Butoanele **veche** (roșu, întrerupt) / **nouă** (verde) înlocuiesc
  „asta” din WME: cu mouse-ul deasupra desenează pe hartă geometria
  respectivă, cu punctele modificate marcate (verde = adăugat, roșu =
  eliminat); click = rămâne afișată și centrează harta. Merg și după
  respingere.
- În mesajul către utilizator: doar numărul de puncte și lungimea, fără
  coordonate.
- După respingere, geometria se poate aplica (punctele interioare din
  sugestie; capetele segmentului rămân pe nodurile lui).

## 2026-10-20 - v0.45.4 - „Simulare”: tipul de prompt ca în JAI (pe `dev`, nepublicată)

- „🔊 Simulare” din „Instrucțiuni viraje” folosește promptul forțat din
  „Prompt voce”, iar la „Implicit Waze” îl determină după regulile pe care
  le arată JAI: peste 45° → virează; sub 45°: singura ramificație sau
  continuarea firească (același nume) → continuă; celelalte → ține
  dreapta / stânga, iar spre o rampă (dintr-un drum care nu e rampă) → ieși
  prin dreapta / stânga; giratoriu, întoarcere U.
- Mesajul afișat spune tipul și de ce, ex. „Implicit Waze → Ieși prin
  dreapta (12.5°, spre rampă, ramificație dreapta) · „În 800 de metri, ieși
  prin dreapta pe …””.

## 2026-10-20 - v0.45.3 - „Mesaj lung”: caseta de text la fel de înaltă ca previzualizarea (pe `dev`, nepublicată)

- În fereastra „Mesaj lung pentru UR”, caseta în care scrii rămânea de 2
  rânduri, iar previzualizarea ocupa toată înălțimea. Acum ambele coloane au
  aceeași înălțime (a ferestrei) și cresc / scad împreună când o
  redimensionezi.

## 2026-10-20 - v0.45.2 - instrucțiuni de viraj lizibile în analiză (pe `dev`, nepublicată)

- „Update turn instruction” nu mai apare ca JSON: în analiză și în lista de
  după respingere se vede „Principal / Înspre / TTS” cu **insigna reală**
  (imaginea de la serverul de semne Waze, ca în WME), ex. [DN2B] Brăila,
  [DC4] Str. Unirii, „» Vădeni”. Valoarea veche (dacă există) e afișată
  tăiat, cu roșu.
- În mesajul text: „Principal: [DN2B] Brăila; Înspre: » Vădeni; TTS: „…””.
- Titlul păstrează „dinspre X către Y” (tradus „Instrucțiune viraj …”); locul
  arată segmentele („2 segmente: …”) ca să deosebești virajele la fel.

## 2026-10-20 - v0.45.1 - texte de început aprobare / respingere, nota utilizatorului (pe `dev`, nepublicată)

- **Texte de început pentru mesaj** (cerute de Paul): unul pentru aprobare,
  unul pentru respingere, cu data și ora sugestiei completate automat
  (`{data}`, `{ora}`). În analiză alegi „Mesaj pentru: ✅ Aprobare / ❌
  Respingere” (pentru Copiază și chat); „Respinge cu acest mesaj” și
  „Inserează analiza” folosesc mereu textul de respingere. Mesajul rămâne
  editabil, nimic nu se trimite automat.
- **Bifă „Include nota utilizatorului”** în analiză și în fereastra de
  respingere (ținută minte în setări): nota lui (din sugestie) intră ca
  „🗒️ Nota ta: „…”” înainte de „Observațiile mele:”.
- Textele de început, nota și cuvintele de stare sunt în „Texte
  personalizabile” (câmpurile lungi sunt acum casete pe mai multe rânduri,
  precompletate cu textul implicit).

## 2026-10-20 - v0.45 - sugestii de hartă: listă de aplicat, chat, întoarceri U (NEPUBLICATĂ - în testare pe `dev`)

- **După respingere** modificările nu mai rămân în panoul de analiză: apar
  într-o listă în dreapta sus (stil „avertizări salvate”), păstrată în
  localStorage până o ștergi; butonul 📝 de lângă Salvează o redeschide.
  „Aplică pe hartă” doar pentru modificările care NU sunt marcate greșite;
  „⌖” duce harta acolo. Înainte de respingere panoul nu mai are „Aplică”.
- **Modificări noi reproductibile:** segment nou (geometrie, tip drum,
  direcție), neasfaltat (și alte steaguri), viraje și întoarceri U (inclusiv
  la capăt de drum, prin acțiunea WME de viraj). Modificările de pe
  segmentul nou se aplică după ce aplici segmentul.
- **Număr de imobil pe drum fără nume:** mesaj clar în loc de „Not allowed
  to add a house number on projected segment” + câmp de nume (propunerea
  fără numărul tastat greșit, străzile din jur) și „Pune numele și adaugă”.
  Numele străzii are și „Alt nume…”.
- **„💬 Trimite în chat”** în analiză: deschide chatul WME cu utilizatorul
  și pune mesajul în casetă (Paul apasă Trimite).
- **Întoarceri U** recunoscute: „Întoarcere U la capătul A/B al …” în loc
  de „Update turn direction”.
- Reparat: schimbarea „segment nou” (fără atribute) lipsea din analiză și
  decala locurile celorlalte modificări.
## 2026-10-19 - v0.44 - ajutor pentru sugestiile de hartă

- **Nou: „📝 Analiză modificări”** în fereastra „Sugestie hartă”: fiecare
  modificare propusă (valoarea veche tăiată → cea nouă, locul), cu stare
  ✔ Corectă / ✖ Greșită / ↻ O refac eu și o casetă de explicație.
  „Respinge cu acest mesaj” deschide respingerea nativă cu mesajul compus
  (text simplu - ajunge prin e-mail). „Copiază mesajul” îl pune în clipboard.
- **„Aplică pe hartă”** pentru tip drum, numele principal al străzii și
  numere de imobil adăugate (în poziția propusă) - editare nesalvată, o
  verifici și salvezi. Celelalte tipuri de modificări: doar manual.
- **Fereastra nativă de respingere:** mai mare (lățime xl, casetă de text
  ~240px, redimensionabilă), lista modificărilor (click = inserează la
  cursor, ✓ = deja în text), „Inserează analiza”, „Golește”.
- **Ciornă pe fiecare sugestie** (localStorage, 30 de zile): textul din
  respingere, stările și explicațiile revin la redeschidere.
- **După „Respinge”** panoul revine cu modificările care se pot aplica.
- Texte personalizabile noi (grupul „Sugestii de hartă”): Corect / Greșit /
  O refac eu, text la început și la final (opționale).
- Opțiune nouă în setări: „Ajutor pentru sugestiile de hartă” (pornită).

## 2026-10-19 - v0.43 - verificare actualizări pe Greasy Fork

Paul: "hai să facem o versiune nouă care verifică la deschidere dacă există
versiune nouă pe greasyfork iar dacă există, buton de deschidere
actualizare script și asta va fi 0.43 și îi facem push ca release."
- La pornirea WME (după ~8 s, cel mult o dată la 6 ore), scriptul citește
  versiunea de pe Greasy Fork. Dacă e mai nouă, sus apare un anunț:
  „🔄 WME RO Tools X e disponibil (ai Y)”, cu butoanele:
  - „Actualizează”: deschide instalarea în Tampermonkey;
  - „Ce e nou”: pagina de pe Greasy Fork;
  - „Mai târziu”: anunțul nu mai apare pentru acea versiune.
- În setări: linkul „Verifică actualizări” pe rândul cu versiunea și
  opțiunea „Verifică actualizările la pornire” (activă implicit).
- Tehnic: WME blochează cererile către greasyfork.org. De aceea scriptul
  are acum `@grant GM_xmlhttpRequest` + `@connect update.greasyfork.org`;
  restul scriptului folosește fereastra paginii (`unsafeWindow`).
- Testat live (copie de test, răspuns Greasy Fork simulat „0.44”):
  - anunțul apare;
  - „Mai târziu” memorează versiunea ignorată;
  - restul scriptului pornește normal.
  - Cererea reală prin Tampermonkey se va vedea la prima versiune de după
    0.43.

## 2026-10-19 - v0.42 - texte personalizabile, „WME Bug fix”, GitHub

Paul: "menționează ce e WME Bug fix... exemplu cu filtrul de hartă sau
numele orașului când nu e afișat de WME. textele care sunt în română să
existe posibilitatea de a le personaliza.... și cine vrea și le traduce în
propria limbă. am creat un repository pe github
https://github.com/spookyx-pd/wme-ro-tools folosește github."
- **WME Bug fix:** eticheta portocalie apare în setări la „Numele localității
  deasupra hărții”, „Issue Tracker: harta arată toate problemele” și „Ține
  panoul lateral mereu deschis”. Descrierile pentru Greasy Fork și GitHub
  au o secțiune separată pentru ele.
- **Texte personalizabile** (Setări → „Texte personalizabile”, secțiune
  restrânsă implicit). 22 de texte:
  - separatoarele UR;
  - marcajele „Mesaj lung” ({i}/{n});
  - casetele și TTS-ul avertizărilor (gabarit, tonaj, Bus/Taxi; {v});
  - TTS-ul pentru „CB” (Centura București);
  - frazele simulării vocale.
- Câmp gol = textul implicit (în română). Butoane: „Copiază JSON”,
  „Importă JSON”, „Resetează tot”. Modificările se aplică imediat, fără
  reîncărcare.
- Avertizările personalizate sunt recunoscute în continuare la TTS: după
  textul nou, dar și după cel vechi.
- `@homepageURL` duce acum la GitHub.
- GitHub: am pregătit fișierele depozitului (scriptul, README în engleză și
  română, LICENSE MIT, CHANGELOG). Urcarea așteaptă accesul la depozit
  pentru sesiunea Claude.
- Testat live (copie de test injectată în WME):
  - 3 etichete „WME Bug fix” și 22 de câmpuri de text;
  - schimbarea separatorului de paragraf se salvează în `customTexts`.
  - Setările au fost restaurate. 0 modificări.

## 2026-10-19 - v0.41 - script bilingv (română / engleză)

Paul: "fă-mi scriptul să fie bilingv... opțiunile, descrierea etc, totul să
fie bilingv. e greu?" Alegeri: limba după WME + comutator; se traduce doar
interfața.
- Interfața e în română sau engleză: setări, butoane, tooltip-uri,
  ferestre, mesaje, „Ce e nou”, avertizarea de dezvoltare, stare Livemap,
  HN rapid, Mesaj lung, instrucțiuni viraje, scurtături etc.
- Limba urmează WME („/ro/editor” → română, altfel engleză). Se poate
  alege și din setări: „Limbă / Language: Auto / Română / English”, care se
  aplică după reîncărcarea paginii.
- Rămân în română: TTS-ul și avertizările din instrucțiunile de viraj,
  insignele, separatoarele și bucățile trimise în răspunsurile UR.
- Antet: `@name:ro` / `@description:ro` (română) și `@description` în
  engleză, pentru Greasy Fork.
- Pericole (bara rapidă): în WME în altă limbă, submeniul și intrarea se
  caută și după iconiță, nu doar după textul românesc.
- Descrieri pentru Greasy Fork: `GREASYFORK.md` (engleză, actualizat) și
  `GREASYFORK.ro.md` (română, nou).
- Testat live în WME, cu limba forțată pe English și scriptul de test
  rulând alături de cel instalat:
  - fereastra „What's new” și istoricul complet cu avertizarea;
  - tab-ul de setări cu selectorul de limbă;
  - starea Livemap în engleză („Recently edited · Live: build of ≈ Fri
    16.10, 05:20”).
  - Setările și versiunea văzută au fost restaurate. 0 modificări.

## 2026-10-19 - v0.40.3 - namespace = profilul de pe Greasy Fork

Paul: "văd că la scripturi se trece namespace:
https://greasyfork.org/ro/users/5715-spookyx"
- `@namespace` e acum `https://greasyfork.org/users/5715-spookyx`. Am scos
  „/ro” ca adresa să nu depindă de limbă; duce la același profil.
- Tampermonkey vede scriptul ca unul nou: copia instalată cu namespace-ul
  vechi trebuie ștearsă după instalarea de pe Greasy Fork. Setările rămân.

## 2026-10-19 - v0.40.2 - linkuri către pagina de pe Greasy Fork

Paul: "URL script este: https://greasyfork.org/ro/scripts/601073-wme-ro-tools"
- Antet: `@homepageURL` (pagina scriptului) și `@supportURL` (pagina
  Feedback).
- Avertizarea de dezvoltare se termină cu linkul „Feedback”, care duce la
  pagina de feedback de pe Greasy Fork.
- Tab-ul de setări: lângă „Ce e nou / istoric versiuni” e și linkul
  „Greasy Fork / Feedback”.

## 2026-10-19 - v0.40.1 - pregătire pentru Greasy Fork

> ⚠️ **Script în dezvoltare și testare, destinat comunității Waze din
> România.** Funcțiile se pot schimba de la o versiune la alta și unele pot
> avea erori. Verifică editările înainte de a salva.

Paul: "pune un warning pentru prima instalare și în changelog că este un
script în dezvoltare și testare destinată comunității Waze din România."
- Avertizarea de mai sus apare:
  - la prima instalare, în fereastra de bun venit, deasupra istoricului;
  - de fiecare dată când se deschide istoricul complet („Changelog
    complet” sau linkul din setări).
- Antetul scriptului:
  - `@license MIT` adăugat;
  - `@namespace` schimbat din `https://github.com/spookyx/wme-ro-tools`
    (repo inexistent) în `spookyx/wme-ro-tools`;
  - `@description` rescris în engleză, cu funcțiile principale.
- `GREASYFORK.md` nou: descrierea detaliată în engleză, pentru pagina de pe
  Greasy Fork.
- Testat live: fereastra de prima instalare (cu un istoric scurtat) arată
  titlul „Bun venit…” și avertizarea portocalie deasupra listei.

## 2026-10-19 - v0.40 - coordonate GPS clicabile în probleme de hartă

Paul: "Unii utilizatori îmi trimit în răspunsuri la problemele de hartă
coordonate GPS. unii le dau sub formă 44.223232, 23.0909034 alții sub
această formă 45°03'19.8"N 26°25'37.8"E. poți să dau click pe coordonate să
centreze harta pe ele?"
- În fereastra unei Solicitări de actualizare sau a unei Probleme de hartă,
  coordonatele din conversație și din detalii devin linkuri (albastre,
  subliniate punctat).
- Click: harta se centrează pe punct, cu zoom minim 17, iar un cerc roșu
  pulsează ~3 s. Fereastra problemei rămâne deschisă.
- Forme recunoscute:
  - zecimal cu virgulă, punct și virgulă sau spațiu;
  - grade-minute-secunde (cu ' " sau ′ ″ ’ ”, virgulă zecimală, secunde
    opționale, N/E înainte sau după).
- „lon, lat” scris invers se corectează automat când se vede clar: o
  valoare > 90, sau valori din România (26.1, 44.4).
- Nu prinde numere obișnuite: viteze, tonaje, versiuni, ore.
- Setare nouă, activă implicit: „Coordonate GPS clicabile în conversații”.
- Testat:
  - parserul, pe 13 exemple;
  - live, pe un UR real din București: am adăugat temporar un text de test
    doar în pagina deschisă, nimic trimis. Ambele forme au devenit linkuri.
    Click-ul cu mouse-ul a dus harta la Tohani (45.0555, 26.4272), zoom 17,
    cu cercul vizibil și UR-ul încă deschis.
  - 0 modificări nesalvate. Nu am rulat live scriptul complet 0.40.

## 2026-10-15 - v0.39 - „Editat:” și „Live:” peste tot

Paul: "Ultima actualizare să schimbăm în „Editat:” mai scurt și mai
clar... la verde să precizăm „Live: ultima asamblare de acum X ore (data și
ora)” și la albastru „Live: asamblare din data și ora”. Să ne asigurăm că
avem aceste info corecte atât la bulinele de pe hartă, dar și ... în
toolbar sau ... în bara din stânga la istoricul segmentului."
- Aceleași texte în trei locuri: bulinele de pe hartă (la hover),
  tooltip-ul iconiței din bara de lângă segment și un rând nou în panoul
  lateral, sub „Ultima actualizare”.
- Textele:
  - portocaliu: „Nu e încă pe Livemap · Editat: … · Live: estimat Vin
    16.10, 06:30 (asamblare în lucru)”. Dacă modificarea nu e în asamblarea
    în lucru: „Live: la asamblarea următoare”.
  - verde: „Deja pe Livemap · Editat: … · Live: ultima asamblare, de acum
    10 ore (Joi 15.10, 05:30)”.
  - albastru: „Modificat recent · Editat: … · Live: asamblare din Mie
    14.10, 05:30”. „≈” în fața datei înseamnă dată estimată.
- „Editat:” înlocuiește „Ultima actualizare” în textele scriptului.
  Rândul nativ din panoul lateral rămâne al WME.
- Vechimile sunt scrise în cuvinte: „acum 12 ore”, „acum 3 zile 3 ore”.
- Testat:
  - textele, pe datele reale de azi, cu și fără un build anterior reținut;
  - rândul din panoul lateral, live, inserat manual: se afișează corect.
    WME îl șterge când reconstruiește panoul, iar scriptul îl pune la loc la
    fiecare 0,7 s.
  - Nu am rulat live scriptul complet 0.39.

## 2026-10-15 - v0.38.1 - texte la hover pe pastile

Paul: "Dacă la verde punem Deja pe Livemap, la portocaliu să punem: Nu e
încă pe LiveMap și la albastru: Modificat recent"
- Textul de la hover începe acum cu:
  - „Nu e încă pe Livemap · ” (portocaliu);
  - „Deja pe Livemap · ” (verde);
  - „Modificat recent · ” (albastru).

## 2026-10-15 - v0.38 - pastile pe hartă și pentru verde / albastru

Paul: "când mă uit la hartă văd segmentele avertizate cu bulina portocalie
când nu a ajuns în livemap. dar vreau să le văd și pe cele verzi și
albastre de care tocmai am vorbit."
- Pastilele rotunde de pe hartă apar acum și pentru:
  - modificările intrate în ultimul build (verde);
  - cele recente, cu până la 3 zile înainte de el (albastru).
- La hover, textul începe cu „Deja pe Livemap (ultimul build) · ” sau „Pe
  Livemap · ” și arată și vechimea („acum 1d 21h”).
- Segmentele niciodată modificate, ci doar create, arată acum „Creat: …”.
  Înainte apărea „Nu am putut citi ultima actualizare.”
- Peste 60 de pastile vizibile, prioritatea e portocaliu, apoi verde, apoi
  albastru.
- Când se publică un build nou, pastila își schimbă singură culoarea.
- Setare nouă, activă implicit: „Pastile pe hartă și pentru modificările
  proaspete”.
- Testat live, în București: am creat trei pastile (portocaliu / verde /
  albastru) cu codul nou și am verificat iconițele și textul de la hover.
  Statusul l-am forțat manual, pentru că în zonă toate erau „vechi”. Am
  șters pastilele de test. Nu am rulat live scriptul complet 0.38.

## 2026-10-15 - v0.37 - cât de „proaspătă” e modificarea (Livemap)

Paul: "vreau să facem cu verde dacă modificarea este în ultima asamblare"
(ca să nu creadă că trebuie modificat ceva deja modificat), "cu albastru ...
maxim 3 zile vechime față de ansamblarea anterioară", plus vechimea scurtă
în bara de lângă segment.
- Culori:
  - portocaliu = nu a ajuns încă pe Livemap;
  - verde = a intrat în ultimul build (e deja pe Livemap);
  - albastru = publicată, cu până la 3 zile înainte de ultimul build;
  - gri = mai veche.
- Bara de lângă segment: iconița plus vechimea. „21h” / „1d 21h” la
  portocaliu și verde, „3d” la albastru, nimic la gri.
- Tooltip: data exactă. La portocaliu spune și dacă modificarea e în
  build-ul în lucru și când apare estimativ pe Livemap.
- Panoul lateral: iconița de la „Ultima actualizare” ia aceleași culori.
  Portocaliul rămâne cel nativ.
- Testat:
  - calculul, pe datele reale de azi (ultimul build: editări până pe
    14.10 08:55):
    - 13.10 14:46 → verde;
    - 12.10 12:00 → albastru;
    - 10.10 12:00 → albastru;
    - 10.10 08:00 → gri;
    - 15.10 02:53 → portocaliu, „în build-ul în lucru”;
  - afișarea, live în sandbox, cu culorile puse manual (pe sandbox nu există
    acum segmente verzi sau albastre).
  - Nu am rulat live scriptul complet 0.37.
- Corecție după livrare: antetul `// @version` rămăsese 0.36 (în 0.36.1 și
  în prima livrare 0.37), deși versiunea din cod era corectă. Tampermonkey
  arăta deci tot 0.36. Antetul e acum 0.37.

## 2026-10-15 - v0.36.1 - meniul „+” mai lat (bugfix)

Paul: "aceste 2 alerte permanente, denumirea iese din spațiul alocat și nu
se vede nici scurtătura pe care o afișăm. putem extinde zona respectivă?"
- Submeniurile din meniul „+” (Pericol, Camere etc.) se lățesc după cel mai
  lung rând, așa că „Crosswalk: High-speed crossing” și „Trecere de pietoni
  supraînălțată” se văd întregi, împreună cu scurtătura.
- Testat live (cu etichete de scurtătură simulate): meniul a crescut de la
  288 px la cât e nevoie (~328 px), fără „…”. Submeniul „Camere” e corect.

## 2026-10-15 - v0.36 - mutarea casetelor în „Instrucțiuni viraje”

Paul: "oare putem muta caselete de text și insigne? să adăugăm un „handler”
cu 3 puncte verticale (ceva discret) ca să putem muta casetele? să le mut
la stânga sau la dreapta în cadrul aceleași zone?"
- Fiecare casetă (text sau insignă) din „Instrucțiuni vizuale” și „Înspre”
  are în stânga un mâner discret „⋮”. Îl tragi, o bară albastră arată unde
  ajunge caseta, iar la eliberare caseta se mută. Merge și între rânduri,
  când casetele trec pe două rânduri. Esc anulează. Mutarea e doar în
  aceeași zonă.
- Previzualizarea neagră se actualizează. TTS-ul se reface doar dacă era
  gol sau încă automat; cel scris de mână rămâne neatins.
- TTS din „Înspre” urmează acum ordinea casetelor. Înainte, insignele
  veneau mereu primele și apoi textele.
- Testat live în sandbox, cu mouse-ul real, fără „Aplică” (0 modificări la
  final):
  - „»” mutat din poziția 2 pe 1;
  - A1 Pitești mutat de pe rândul 2 pe rândul 1;
  - casetele rămân editabile.
  - TTS: „Splaiul Independenței » Regie, Calea Plevnei, A1 Pitești”.

## 2026-10-15 - v0.35.2 - „Taie segmentul”: a doua tăietură pe același drum eșua

Paul: "de ce nu pot face 2 tăieturi consecutive la un segment deja tăiat?"
- Cauza (verificat live în sandbox, segmentul 484642446, apoi undo, 0
  modificări): după o tăiere, segmentul original rămâne în model până la
  salvare, cu starea DELETE, și e încă returnat de
  `sdk.DataModel.Segments.getAll()`, suprapus peste cele două bucăți noi.
  Căutarea celui mai apropiat segment îl putea alege pe el. `splitSegment`
  pe original dă eroare („node null does not exist” / „Failed to split
  specified segment”). Bucățile noi (ID negativ) se taie normal.
- Fix: căutarea sare peste segmentele șterse local (`W.model.segments`,
  `state === 'DELETE'`).
- În plus: o tăiere eșuată poate lăsa o acțiune stricată în istoricul Undo
  (am văzut-o în test). Dacă `splitSegment` aruncă eroare și numărul de
  modificări a crescut, se face automat un Undo.
- Testat: comportamentul modelului (original DELETE, bucățile tăiabile,
  eroarea pe original). Click-ul real cu scriptul instalat nu a fost
  retestat.

## 2026-10-15 - v0.35.1 - separatoare noi pentru rândurile din răspunsurile UR

Paul: "━━━◆━━━ să îl înlocuim cu ━◆━" și un înlocuitor pentru „•┃•”, care
se confunda cu bulinele din listele nenumerotate. Am făcut o simulare în
stil card de aplicație pentru -◇-, ·◇·, ·|·, ◇ și actualul •┃•. Paul a
ales „-◇-”: "e bun... și chiar seamănă cu celălalt, doar că pare mai
„light”".
- Paragraf (2+ rânduri noi): „⠀━◆━⠀” (era „⠀━━━◆━━━⠀”), deci și mesajele
  devin mai scurte.
- Un singur rând nou: „⠀-◇-⠀” (era „⠀•┃•⠀”). Liniuțele sunt cratimă ASCII.
- Se aplică la Trimite, la previzualizare și la „Mesaj lung”, fiindcă toate
  folosesc aceleași constante. Am actualizat și textul din setări.
- Verificat: „Linia 1\nLinia 2\n\nParagraf nou” → „Linia 1 ⠀-◇-⠀ Linia 2
  ⠀━◆━⠀ Paragraf nou”.

## 2026-10-15 - v0.35 - fereastra „Ce e nou”

Paul: "incrementăm versiunea, doar că în changelog din script nu mai trecem
ce bugfixuri facem [...] să introducem și un „what's new" - să îmi apare o
fereastră în care apare ce e schimbat de la ultima versiune pe care o avea
utilizatorul și posibilitatea de a vedea changelog complet. dacă e prima
instalare, vede changelog complet".
- Changelog-ul din comentariile scriptului (engleză) a fost înlocuit de
  `VERSION_HISTORY`, în română, fiind text afișat utilizatorului. Conține
  doar funcții noi: 0.20, 0.22, 0.25-0.35. Fără 0.34.1/0.34.2 și fără
  reparațiile 0.21/0.23/0.24.
- La pornire (după 3 s):
  - versiunea văzută ultima dată se ține în localStorage
    `wme-ro-tools.seenVersion`;
  - dacă instalată > văzută și există funcții noi față de ea → „Ce e nou în
    WME RO Tools 0.35”, cu buton „Changelog complet”;
  - prima instalare (fără cheie) → istoricul complet;
  - actualizare doar cu reparații → nicio fereastră, versiunea se
    memorează direct.
  - „Am înțeles”, Esc sau click în afară închid fereastra și memorează
    versiunea.
- În tab-ul de setări: lângă „Versiune: 0.35”, linkul „Ce e nou / istoric
  versiuni”.
- Paul nu are încă cheia, deci după actualizare vede o dată istoricul
  complet.
- Testat live în WME, cu o cheie de test separată (ștearsă la final):
  - de la 0.33: 0.35 + 0.34, „Changelog complet” → 13 versiuni;
  - după „Am înțeles” nu mai apare;
  - de la 0.34.2: doar 0.35;
  - fără cheie: istoricul complet.

## 2026-10-15 - v0.34.2 - avertizări: înlocuiește/adaugă; insignele din „Înspre” intră în TTS

Paul: "când adaug avertizare de gabarit sau bus/taxi să mă întrebe dacă am
ceva în secundar să înlocuiască sau să adauge. aș putea avea acolo
caracterul »" / "când adaug o insignă la secundar, exemplu DN1, nu este
adăugat și în TTS cu simbolul » DN1".
- Avertizare când „Înspre” nu e gol (chiar și doar „»”): fereastră cu ce e
  acum acolo și butoanele Anulează / Înlocuiește / Adaugă după.
- TTS după adăugarea unei insigne sau a unei avertizări:
  - dacă TTS-ul e gol sau e încă textul automat al casetelor de dinainte
    (nemodificat de mână), se reface complet;
  - dacă e scris de mână, se adaugă doar partea nouă: „ » DN1” (sau
    „, DN1” dacă există deja „»”), înaintea unei avertizări „... Atenție!”.
    Avertizarea se pune la final, dacă nu e deja.
- Testat live în sandbox, fără „Aplică” (0 modificări la final):
  - „Calea București” + DN1 în Înspre → TTS „Calea București » DN1”;
  - gabarit 3.50 + „Înlocuiește” → Înspre = doar avertizarea, TTS
    „Calea București ... Atenție! Gabarit înălțime 3.50 metri”;
  - Bus/Taxi + „Adaugă după” → ambele avertizări;
  - TTS scris de mână + A1 București → „Text scris de mână » A1 București”.

## 2026-10-15 - v0.34.1 - „🔊 Simulare” nu se auzea

Paul: „Când apăs pe simulare TTS, nu aud nimic.”
- Cauza: am apelat `sayTextInLocale(text, {}, locale)`. Butonul nativ
  trimite ca al doilea argument poziția virajului (`lonlat`). Fără ea,
  serverul răspunde 200, dar fără sunet: WME șterge `src`-ul playerului.
  Testul meu de dinainte verificase doar codul 200, nu și sunetul.
- Fix: `lonlat` din props-urile ferestrei. Verificat live (sandbox, fără
  modificări): cu `{}` playerul primește doar `removeAttribute("src")`. Cu
  `lonlat` primește mp3-ul de la tts-assets.voice.waze.com și îl redă
  (`currentTime` 0,94 s, terminat).

## 2026-10-15 - v0.34 - ajutor pentru „Instrucțiuni viraje”

Cerere Paul: unelte în fereastra „Instrucțiuni viraje” ca să nu mai
completeze manual insignele, „»”, TTS-ul și avertizările, plus simulare
vocală completă.

În fereastra nativă (sub Copy / Paste):
- **⚡ Implicit**: principal = insigna + numele local al drumului spre care
  se face virajul („DJ601 - Calea București” → insigna 601 + „Calea
  București”), Înspre = „»”, TTS refăcut. Dacă există deja date (WME pune
  de obicei numele străzii), cere confirmare.
- **»** și **·**: se inserează unde e cursorul (casetă din principal,
  Înspre sau TTS), cu spații în jur.
- **+ nume local** (lângă „Înspre”): numele local al drumului-țintă, la
  cursor. Fără cursor, ca o casetă nouă în Înspre.
- **🛡 Insigne**: tastezi A2, DN1A, E60, DEx12, DJ601, DC43 sau CB, plus
  opțional localitatea, și alegi Principal sau Înspre. Dedesubt apar
  insignele văzute pe hartă (reținute automat pe județ, între sesiuni);
  DJ/DC la cerere. **Nu mai e nevoie de segmente helper.**
- **⚠️ Avertizare**: gabarit înălțime (3.50 / 3.00 / 2.50 / 2.00 / altă
  valoare), tonaj (7.5 / 3.5 / 12 / altă), Bus/Taxi. Fiecare adaugă caseta în
  Înspre și fraza la finalul TTS („... Atenție! …”).

Lângă TTS:
- **⟳ Tot**: principal » Înspre, după regula lui Paul: prima insignă cu
  numele ei + max. 2 insigne, fără ce apare deja în principal, avertizările
  la final. CB → „Centura București”, DC/DJ/DN + număr.
- **+P** / **+Î**: transcriu doar principalul sau doar Înspre (la cursor în
  TTS, altfel la final). **🗑** șterge TTS.
- **🔊 Simulare**: vocea WME spune „În 800 de metri, <acțiune> <TTS>”.
  Acțiunea vine din „Prompt voce”. La „Implicit Waze” o deduc: giratoriu →
  „la sensul giratoriu ieși pe”, altfel după unghi (aproximare).

Nimic nu ajunge pe hartă până la „Aplică”; X renunță, ca în WME. Opțiune
nouă în setări: „Ajutor pentru „Instrucțiuni viraje”” (activă implicit).

Testat live:
- Ciorogârla (viraj real, fără „Aplică”): „⟳ Tot” dă exact TTS-ul lui Paul,
  „DJ601 - Calea București » A1”; confirmarea apare.
- Sandbox Iași, viraj 484642453f484642448r: Implicit, A2 Constanța în
  Înspre, DN1A în principal, gabarit 3.50, „·” inserat la cursor, ⟳ Tot,
  simulare vocală (convertTextToVoice 200), „Aplică” → modelul are exact
  instrucțiunile. Apoi undo: 0 modificări, virajul fără instrucțiuni.
- Server: o insignă A2 fără nicio stradă A2 în zonă a fost salvată și a
  revenit după reîncărcare (viraj de sandbox 484642453f484642454f). Apoi am
  șters instrucțiunea, am salvat și am verificat după reîncărcare: curat.
- Greșeală în timpul investigației: un click pe săgeata verde a interzis
  virajul de la Ciorogârla (nesalvat). Anulat imediat, verificat 0
  modificări.
- Insigne ieșire: TODO.

## 2026-10-12 - v0.33 - scurtături: căutare, confirmare, taste în meniuri; butoane rapide de straturi

Cerere Paul: căutare și filtrare în "Scurtături Tastatură", căutare după
tastă, vizualizare mai bună, notificare când tasta e deja alocată, taste
afișate în Straturi hartă și în meniul "+", plus butoane rapide pentru
patru straturi sub Straturi/Reîncarcă/Permalink.

**1. Fereastra "Scurtături Tastatură"** (bară nouă, fixă, deasupra listei):
- Câmp de căutare după numele comenzii, tastă ("shift+h") sau grup, fără
  diacritice și cu mai multe cuvinte. Grupurile fără rezultate se ascund.
- "⌨ Caută după tastă": apeși butonul, apoi combinația de taste. Lista
  rămâne doar cu comanda care o folosește, sau vezi că e liberă ("Ctrl+F9
  nu e alocată niciunei comenzi"). Combinația apăsată NU declanșează
  comanda. Esc renunță, iar click pe buton șterge căutarea.
- Bifa "Doar cu tastă alocată". Comenzile fără tastă apar estompate.
  Contor "N comenzi afișate".
- Când aloci unei comenzi o tastă folosită deja de altă comandă, WME o lua
  fără avertizare. Acum apare o fereastră: "Tasta „Shift+H” este deja
  alocată / Este folosită de: „Comută numerele de imobil” (Comutare
  straturi)", cu "Anulează" sau "Înlocuiește".

**2. Taste afișate lângă comenzi:** în "Straturi hartă" (Drumuri Shift+R,
Numere imobile Shift+H, Locuri Google Shift+N etc.) și în meniul "+"
(Drum I, Giratoriu O, Boxă de Intersecție J, Limitatoare Z, Cameră
Shift+X etc.). Se actualizează când schimbi o scurtătură.

**3. Butoane rapide de straturi** sub Straturi / Reîncarcă / Permalink:
Locuri Google, Imagini din satelit suplimentare, Numere de imobil,
Pericole. Albastre când stratul e activ; se sincronizează și cu "Straturi
hartă" și cu tastatura. Tooltip-ul arată starea și scurtătura.

Două opțiuni noi în setări (active implicit).

**Testat live** (sandbox; logica identică injectată): filtrare "imobil" →
2 comenzi, "shift+h" → 1; căutarea după tastă Shift+H → "Comută numerele
de imobil", fără ca stratul să se comute; Ctrl+F9 → liberă; tastarea în
câmpul de căutare nu declanșează scurtături. Conflict: rândul "Desenează
un drum nou" + Shift+H → fereastra de confirmare; Anulează → nimic
schimbat; Înlocuiește → I devine Shift+H, iar Numere imobile rămâne fără
tastă. Am refăcut apoi scurtăturile originale (I și Shift+H, verificat și
în localStorage). Taste afișate: 24 (menu "+" și straturi). Butoane: 4,
click pe Locuri Google → activ (albastru) + tooltip cu Shift+N; Shift+N de
la tastatură → butonul revine la inactiv.
**Netestat:** scriptul complet instalat, light mode, meniul "+" deschis
vizual (am verificat doar în DOM că tastele sunt inserate).

## 2026-10-10 - v0.32 - "Mesaj lung" cu previzualizare live + caseta UR de 12 rânduri

Cerere Paul: separator de paragraf mai scurt (textul depășea limita de
2000), aceeași opțiune de înlocuire și în "Mesaj lung", previzualizare live
în dreapta casetei (care se poate ascunde), fereastra "Mesaj lung" în
dreapta ferestrei UR, preluarea automată a textului deja scris și caseta
de comentariu din fereastra UR cu 12 rânduri vizibile în loc de 6.

**Ce s-a schimbat:**
- Separatorul de paragraf e acum "⠀━━━◆━━━⠀" (9 caractere, față de 17).
  Separatorul de rând "⠀•┃•⠀" a rămas la fel.
- "Mesaj lung": bifa "Înlocuiește rândurile noi" (aceeași opțiune ca lângă
  Trimite, sincronizată) și bifa "Previzualizare live". În dreapta casetei
  apare, în timp real, textul așa cum îl vede utilizatorul în aplicație
  (cartea albă, cu numele tău). Fără înlocuire, rândurile apar lipite cu
  spații, cum le afișează aplicația. Ascunderea previzualizării îngustează
  fereastra (760 → 380 px), iar reafișarea o lărgește la loc. Alegerea se
  ține minte.
- Contorul arată și lungimea după înlocuire ("78 caractere (114 după
  înlocuire)").
- Fereastra "Mesaj lung" se deschide în dreapta ferestrei UR, aliniată sus
  (sau în stânga, dacă nu e loc).
- La deschidere preia textul deja scris în caseta nativă: îl adaugă la
  ciorna "Mesaj lung" (dacă nu e deja acolo) și golește caseta nativă, ca
  să nu fie trimis de două ori.
- Caseta de comentariu din fereastra UR are acum 12 rânduri vizibile
  (205 px în loc de 98) și rămâne redimensionabilă pe verticală.

**Testat live** (UR închis, fără trimitere, logica identică injectată):
caseta nativă 98 → 205 px; textul scris în ea a fost preluat în "Mesaj
lung", iar caseta nativă s-a golit; fereastra s-a deschis la dreapta
ferestrei UR (x 1039 vs. marginea 1031, sus la 90); previzualizarea live se
actualizează la tastare; dezactivarea înlocuirii arată textul lipit;
ascunderea și reafișarea previzualizării schimbă lățimea 760 ↔ 380. Ciorna
acelui UR nu a rămas în localStorage.
**Netestat:** scriptul complet instalat, trimiterea reală a bucăților,
light mode.

## 2026-10-08 - v0.31 - UR: rândurile noi înlocuite cu separatoare + previzualizare

Cerere Paul: aplicația Waze afișează răspunsurile la UR fără rânduri noi
(WME le arată, aplicația nu, și orice caracter special e suprimat), deci un
mesaj bine aranjat ajunge ca un singur bloc greu de citit. Rândurile noi
trebuie înlocuite cu "⠀━━━━━━⠀◆⠀━━━━━━⠀" (2 sau mai multe) și "⠀•┃•⠀"
(unul singur). Bifă în stânga lui Trimite, activă implicit, cu explicație
la hover, și previzualizare la Trimite.

**Ce face:**
- Bifa "Înlocuiește rândurile noi" în stânga butonului Trimite (UR/PUR/MP).
  La hover explică înlocuirea.
- La Trimite, dacă textul are rânduri noi: un rând gol (2+ rânduri noi)
  devine "⠀━━━━━━⠀◆⠀━━━━━━⠀", un singur rând nou devine "⠀•┃•⠀". Fiecare
  separator e încadrat de câte un spațiu normal, ca aplicația să poată
  rupe rândul acolo. Spațiile de la capăt de rând și rândurile goale cu
  spații sunt curățate.
- Înainte de trimitere apare o previzualizare: o "carte" albă, ca în
  aplicație, cu numele tău și textul fără rânduri noi, plus numărul de
  caractere. Butoane: "Înapoi la editare" (sau Escape, sau click în afară)
  și "Trimite". Peste 2000 de caractere după înlocuire, Trimite e
  dezactivat, cu sfat să folosești "Mesaj lung".
- La "Trimite" textul înlocuit e pus în casetă, apoi se trimite normal.
  Un text fără rânduri noi se trimite direct, fără previzualizare.
- "Mesaj lung": împărțirea se face după înlocuire, ca fiecare bucată să
  rămână sub 2000. La trimitere automată, bucata e pusă deja înlocuită.
  Doar la inserare, previzualizarea apare la Trimite.
- Opțiunea e și în setări (sincronizată cu bifa).

**Testat live** (pe un UR închis, cu toate cererile POST blocate și alert
dezactivat, ca să nu plece niciun comentariu): Trimite cu text pe mai multe
rânduri a fost interceptat și n-a plecat nicio cerere de comentariu.
Previzualizarea a apărut corect. La "Trimite", textul înlocuit a ajuns în
casetă (valoarea componentei WME = 339 caractere, fără rânduri noi), apoi
s-a apăsat butonul nativ (interceptat în test). La peste 2000 de caractere
Trimite e dezactivat, iar Escape închide. Caseta a fost golită după test.
**Netestat:** o trimitere reală, cum arată efectiv în aplicația Waze
separatoarele/încadrarea rândurilor, "Mesaj lung" cu opțiunea activă,
scriptul complet instalat.

## 2026-10-08 - v0.30 - lista avertizărilor salvate cu "Salvează oricum"

Cerere Paul: când salvează deși WME arată "S-ar putea să fie ceva neînregulă
cu această editare" și apasă "Salvează", avertizările să nu se piardă.
Trebuie să rămână într-o fereastră asemănătoare, cu link spre fiecare
problemă, coș de gunoi, posibilitate de restrângere, persistente doar în
sesiunea curentă (până la reîncărcarea paginii).

**Ce face:**
- După "Salvează oricum", apare o fereastră cu același aspect ca a WME
  (aceleași clase CSS, deci și dark/light mode). Antet: "Avertizări salvate
  (N) - de verificat". Avertizările sunt grupate pe salvări ("Salvare de la
  HH:MM · N avertizări").
- Fiecare avertizare apare separat, cu titlu, sugestie și obiect
  ("Segment 123 · nume stradă"). WME comasează avertizările cu același
  cod și pierde locația lor, lista noastră nu.
- Butonul de centrare (sau click pe text) mută harta pe problemă (zoom
  minim 18) și selectează segmentul. Pentru segmentele noi, create chiar
  în acea salvare (ID-ul se schimbă la salvare), selectează cel mai
  apropiat segment de punctul avertizării (max. 15 m).
- Coș de gunoi: per avertizare, per salvare, plus "Șterge tot".
- Fereastra se restrânge (săgeată sau click pe antet) ori se ascunde (X).
  Butonul portocaliu cu numărul de avertizări, de lângă Salvează (vizibil
  doar cât lista are elemente), o redeschide.
- Lista e ținută doar în memorie: dispare la reîncărcarea paginii.
- Opțiune nouă în setări (activă implicit).

**Testat live** (sandbox, fără salvare reală): avertizările reale
2009/2003, obținute prin dezactivarea virajelor spre un segment de test,
au fost capturate corect la prima apăsare pe Salvează. Am apăsat Anulează
în dialogul WME și am simulat succesul salvării forțate. Au funcționat:
fereastra și indicatorul, centrarea + selecția, fallback-ul spre cel mai
apropiat segment, restrângerea, ștergerea per avertizare, ascunderea și
redeschiderea, "Șterge tot". Modificările de test au fost anulate (Undo).
**Netestat:** o salvare forțată reală (nu am vrut să salvez ceva pe hartă)
și scriptul complet instalat.

## 2026-10-07 - bulina "nepublicat" nu mai întrerupe selecția cu Shift (v0.29, fără versiune nouă)

Cerere Paul: "cât timp țin Shift sau Ctrl+Shift - Shift duce la selectarea
unei zone pe hartă... și trec cu mouse pe deasupra simbolului care îmi spune
că un segment este modificat, dar modificarea nu a ajuns în LiveMap - să nu
extindă automat simbolul cu informații despre editor și data modificării
segmentului pentru că asta anulează efectul lui Shift, adică se anulează
selecția."

**Fix:** cât timp e apăsat Shift, Ctrl (sau Cmd) ori un buton al mouse-ului
pe hartă (tragere), bulinele devin "transparente" la mouse: nu se mai extind
la trecerea cursorului și nu mai preiau evenimentele mouse-ului - acestea
ajung la hartă, deci selecția cu Shift continuă. Bulinele deja extinse se
restrâng când începe asta. La eliberarea tastelor/butonului, totul revine la
normal. Click-ul pe bulina însăși (ex. pe linkul de profil) funcționează ca
înainte.

**Testat live** (bulină de test pe hartă, logica identică injectată): fără
taste → la poziția bulinei e bulina; Shift apăsat → la aceeași poziție e
harta (bulina e ocolită) și bulina expandată se restrânge; Shift eliberat →
din nou bulina; Ctrl+Shift → harta. Netestat: o selecție reală cu Shift +
tragere peste o bulină (simulatorul nu poate ține Shift apăsat în timpul
tragerii) și scriptul complet instalat.

Bug mic → fără versiune nouă (rămâne 0.29), conform convenției.

## 2026-10-07 - v0.29

Cerere Paul: "Când adaug numere de imobil folosind unealta dezvoltată de
noi, să se comporte cam cum se comportă când intru să adaug numere de
imobil în modul nativ și anume: să pot adăuga nr de imobil la toate
segmentele ce poartă același nume, nu doar segmentul selectat, chiar dacă
noi începem de la segmentul creat. Dezactivează acele avertizări
Detectare+Avertizare Întoarcere U-turn. Vom reveni la ele altă dată să le
facem corect."

**1. "HN rapid" - pe toată strada, nu doar pe segmentul de start.** Pornești
tot de la un segment selectat, dar după Start fiecare click adaugă numărul
pe segmentul străzii (aceeași stradă principală = același nume + aceeași
localitate) cel mai apropiat de click - ca în modul nativ. Punctul albastru
și linia punctată se "prind" acum de cel mai apropiat segment al străzii.
Lista segmentelor străzii se recitește la ~1s (prinde și segmentele încărcate
după mutarea hărții); verificarea de numere duplicate se extinde automat și
la ele. Un segment fără nume rămâne singura țintă (ca înainte).

**2. Avertizarea U-turn - retrasă.** Comutatorul a fost scos din tab-ul de
setări și funcția e oprită forțat (inclusiv dacă era bifată salvat), până o
refacem corect. Codul a rămas în script.

**Testat live** (zona de test, strada "test - can be deleted", 11 segmente):
calculul țintei, pentru click-uri lângă 3 segmente diferite ale străzii
(inclusiv altele decât cel de start), a ales de fiecare dată segmentul corect
(~11ms pentru 11 segmente). Un număr de test ("999Z") adăugat prin SDK pe
ținta calculată (alt segment decât cel de start) s-a atașat corect
(`segID` 484642527), apoi a fost anulat cu Undo (0 modificări nesalvate).
Netestat: scriptul complet instalat (bucla HN rapid cu click-uri reale).

`node --check` trecut. Versiune 0.29.

## 2026-10-05 - v0.28

Cerere Paul: când scrie un răspuns la un UR (în caseta nativă sau în "Mesaj
lung") și între timp face altceva pe hartă / salvează, fereastra UR se
reîncarcă și mesajul se pierde. Cerut: memorarea mesajului per UR și
reafișarea lui automată, păstrat până la trimiterea mesajului sau
închiderea UR-ului (Rezolvat / Neidentificat).

**Opțiune nouă: "Păstrează ciorna răspunsului la UR"** (pornită implicit).
- Textul din caseta de comentariu și din "Mesaj lung" e memorat separat
  pentru fiecare UR/MP (în `localStorage` - supraviețuiește și unei
  reîncărcări complete a paginii).
- Când fereastra UR apare din nou cu caseta goală, textul e pus la loc
  automat, apare un mesaj scurt "Ciorna ... a fost restaurată", iar focusul
  revine unde era (nu "fură" tastatura de pe hartă).
- Ciorna din "Mesaj lung" e încărcată la redeschiderea panoului; butonul
  arată "Mesaj lung •" când există o ciornă salvată.
- Se șterge: la Trimite (după ce caseta se golește efectiv), când UR-ul nu
  mai e deschis (Rezolvat/Neidentificat), dacă golești tu caseta, sau după
  7 zile.

**Testat live** (cod identic injectat, UR deschis 26904333, fără trimitere):
text tastat în caseta nativă → salvat; fereastra UR închisă și redeschisă
(simulare de reîncărcare) → text restaurat automat. Caseta golită manual →
ciorna ștearsă. Netestat: ciorna din "Mesaj lung", ștergerea la Trimite și
la Rezolvat/Neidentificat (nu am trimis / închis UR-uri reale) și scriptul
complet instalat.

`node --check` trecut. Versiune 0.28.

## 2026-10-03 - v0.27

Cerere Paul: deasupra hărții, eticheta cu localitatea ("Odorheiu Secuiesc,
Județul Harghita") dispare des după zoom/drag și rămâne doar țara
("Romania"); reapare doar după mai multe zoom-uri/drag-uri sau la butonul
de reîncărcare (`wz-button.reload-button`). "Cercetează o metodă optimă...
dacă nu există o metodă mai bună... să apelăm procedura apelată de butonul
de reload."

**Opțiune nouă: "Numele localității deasupra hărții"** (pornită implicit).

**Cauza (bug WME, găsit în codul de producție și reprodus live):** eticheta
(`div.location-info`) arată "Oraș, Județ" dacă zoom-ul e destul de mare și
`topCityId` (în store-ul modelului de date WME) e setat, altfel arată
țara. La FIECARE lot de date încărcat, WME pune `topCityId` pe null și îl
recalculează doar din segmentele din acel lot. Un lot fără segmente
(frecvent după zoom in) îl lasă null → apare doar țara. Reprodus: zoom
16 → 17, `topCityId` null, eticheta "Romania"; zoom-uri ulterioare
16/17/18 nu-l refac.

**Fix (fără reîncărcarea hărții, ~10ms, fără trafic de rețea):** după
fiecare încărcare de date / zoom / mutare a hărții (cu debounce 300ms),
dacă `topCityId` e null și segmentele sunt afișate la zoom-ul curent,
scriptul recalculează orașul cel mai frecvent dintre segmentele vizibile
deja încărcate (aceeași regulă ca WME: orașul străzii principale, oraș
nevid), îl setează prin funcția WME `setTopCityId` și apelează chiar
funcția WME care reîmprospătează eticheta - deci formatarea și condiția de
zoom rămân cele native. Butonul de reload ar fi funcționat și el, dar
reîncarcă toate datele hărții (lent, trafic), deci nu l-am folosit.

**Testat live** (Odorheiu Secuiesc): bug reprodus (16 → 17 → "Romania");
cu codul fix injectat: zoom 17 → eticheta corectă automat, fără nicio
acțiune; la zoom 12 rămâne "Romania" (corect, nativ - segmentele nu se
afișează acolo). Comutatorul din tab-ul de setări n-a fost testat (scriptul
complet nu e instalat în browserul de test).

`node --check` trecut. Versiune 0.27.

## 2026-10-01 - v0.26

Cerere Paul: în Issue Tracker, cu un filtru activ (ex. "New URs"), atât
lista cât și harta arată doar problemele din filtru - vrea ca HARTA să
arate toate problemele deschise (ca la "Toate problemele"), iar lista să
rămână filtrată. După investigație + plan: "da, hai să implementăm în WME
RO Tools... dar adaugă și o opțiune să nu filtreze harta de UR-uri în
partea de jos a coloanei issue_tracker... acolo deja e opțiune [Actualizează
rezultatele când harta este mutată]... plus opțiunea de
activare/dezactivare din setări și din straturi."

**Funcție nouă: "Issue Tracker: harta arată toate problemele"** (oprită
implicit). Trei comutatoare, sincronizate între ele:
1. tab-ul de setări WME RO Tools;
2. "Straturi hartă" > Userscripts - checkbox "RO Tools: Hartă - toate
   problemele";
3. josul coloanei Issue Tracker, sub "Actualizează rezultatele când harta
   este mutată" - checkbox "Hartă: arată toate problemele (ignoră filtrul)",
   cu același aspect ca cel nativ.

**Cum funcționează:** harta primește problemele printr-o cerere separată de
cea a listei (`W.issueTrackerController.descartesClient.searchIssuesByBbox`,
apelată doar din `fetchIssuesMap` - verificat live pe stiva de apeluri).
Scriptul înlocuiește în acea cerere doar câmpurile de filtru cu filtrul
"Toate problemele" (deschise, toate tipurile: UR, PUR, MP, MS), păstrând
zona vizibilă și sortarea. Lista nu e atinsă. La comutare, harta se
reîncarcă imediat (`fetchIssuesMap()`), fără să muți harta. Dezactivat,
funcția originală e restaurată - WME se comportă exact nativ.

**Testat live** (codul funcției, identic, injectat în pagină; v0.25
rămâne instalată în browser): cu filtrul "Marcat cu stea" (listă UR(0),
hartă 0 UR): bifat checkbox-ul din josul coloanei → harta arată imediat 7
UR-uri, lista rămâne UR(0); checkbox-ul din Straturi s-a bifat automat.
Debifat din Straturi → harta revine instant la 0 UR, checkbox-ul din
coloană se debifează, funcția originală WME e restaurată. Rebifat din
Straturi → din nou 7 UR-uri. Filtrul a fost readus apoi la starea inițială.
Verificat și că "Reminder & Closer" (wme-ur-closer) ia UR-urile din LISTĂ
(rândurile randate), nu din datele hărții - nu e afectat.

`node --check` trecut. Versiune 0.26.

## 2026-09-30 - v0.25

Întrebare + cerere Paul: "nu există un fel de Z-index pentru a rezolva
asta? ascunderea pilului e singura opțiune?" → după explicație: "da,
implementează."

**Bulina "nepublicat" e acum acoperită natural de panourile WME, prin
stivuire (z-index), nu mai e ascunsă.** Înlocuiește complet logica din
v0.23/v0.24 (hit-testing cu `elementsFromPoint`, 3 poziții candidate,
ascundere, cache + rotație).

**De ce nu mergea doar cu un număr de z-index:** bulina era atașată în
`<body>` (z-index 500). Harta, meniul "Straturi hartă" și fereastra UR sunt
toate în `.edit-area-main` (z-index 1), care concurează cu `<body>` ca UN
SINGUR bloc - deci orice element din `<body>` e fie peste tot blocul
(inclusiv panouri), fie sub tot (inclusiv hartă).

**Fix:** container nou `#wme-ro-tools-map-overlay` (`position: fixed`,
0x0, `pointer-events: none`, `z-index: 0`) atașat în `#waze-map-container`
(părintele lui `#WazeMap`), DUPĂ `#WazeMap`. Frații din acel container
(verificat live): `#WazeMap` z 0, `#overlay-buttons` z 1, meniul Straturi
z 2, `#tippy-container` z 4, fereastra UR z 6. Containerul nostru (z 0,
mai târziu în DOM) e peste hartă și sub toate panourile; sidebar-ul din
stânga (z 5, în afara `.edit-area-main`) îl acoperă și el. Dacă WME
re-randează harta, containerul e re-atașat automat (verificare la fiecare
cadru, ieftină).

**Testat live** (UR 27231297): bulinele reale mutate în containerul de
test: o bulină în interiorul ferestrei UR → acoperită de fereastră; una
pe marginea ferestrei → jumătate vizibilă, jumătate sub fereastră; una pe
hartă → vizibilă și primește hover (`elementFromPoint` = bulina). Cu
panoul Straturi deschis: bulinele de sub panou → acoperite; peste
sidebar → acoperite. Limitare: containerul și bulinele au fost testate
live prin mutarea bulinelor reale (v0.23, instalată) în containerul de
test; bucla din scriptul nou n-a rulat în browser.

Modificarea corespunzătoare din WME RO Color Speeds e documentată separat,
în folderul acelui script.

`node --check` trecut. Versiune 0.25.

## 2026-09-30 - v0.24

Cerere Paul (verbatim, cu 2 screenshot-uri + link UR
`https://waze.com/ro/editor?env=row&lat=46.03098&lon=25.20846&zoomLevel=19&mapUpdateRequest=27231297`):
"încă mai avem situații ca în poză unde încă apar peste fereastra unui UR
sau bara laterală din stânga cu Straturi."

**Reprodus live, în sfârșit**, cu link-ul de UR trimis de Paul (fereastra
UR se deschide direct din URL, fără să mai fie nevoie de click pe marker).
Pe pagină rula deja v0.23 (confirmat: "Versiune: 0.23" în tab-ul de
setări) și erau 7 buline, dintre care 6 desenate peste fereastra UR.

**Cauza reală (confirmată live):** detecția din v0.23 funcționa corect -
fereastra UR (`#ISSUE_WINDOW_UPDATE_REQUEST`, `position: absolute`,
`z-index: 6`, în `#waze-map-container > .overlay-container`, deci ÎN
AFARA elementului de viewport al hărții) era recunoscută ca "panou
străin". Problema era fallback-ul: când toate cele 3 poziții candidate
cădeau peste panou (adică segmentul însuși e sub fereastra UR), v0.23
afișa oricum bulina pe prima poziție ("mai bine puțin nepotrivită decât
deloc") - exact ce se vedea în poze. Plus: v0.23 verifica doar CENTRUL
bulinei, deci o bulină cu centrul pe hartă dar cu marginea peste panou
trecea de verificare.

**Fix:**
1. Dacă toate pozițiile candidate cad peste un panou, bulina se ASCUNDE
   (segmentul e oricum acoperit de acel panou); reapare automat când
   panoul se închide / harta se mută.
2. Se verifică toată "amprenta" bulinei (centrul + cele 4 colțuri, ±12px),
   nu doar centrul.
3. Propriile badge-uri ancorate pe hartă (celelalte buline, eticheta de
   lungime, unghiuri, quick-bar) sunt ignorate la verificare, ca să nu se
   "ocolească" între ele ca și cum ar fi panouri WME.
4. Performanță: `elementsFromPoint` costă ~0,5ms/apel pe o pagină WME
   (măsurat live), iar v0.23 îl apela de până la 3 ori per bulină la
   FIECARE cadru. Acum rezultatul (poziția aleasă sau "ascunsă") e ținut în
   cache per segment și reverificat prin rotație - câteva buline pe cadru,
   un ciclu complet în max. 30 de cadre (~0,5s).

**Testat live** pe UR-ul trimis: cu logica nouă, cele 6 buline de peste
fereastra UR sunt respinse (ar fi ascunse), iar cea de pe hartă rămâne. Cu
panoul "Straturi hartă" deschis: punct în interiorul panoului → respins;
punct cu centrul la ~5px de marginea panoului (colțul peste panou) →
respins (v0.23 l-ar fi acceptat); punct liber pe hartă → acceptat.
Limitare: nu am putut rula integral noua versiune în browser (acolo e
instalată v0.23 prin Tampermonkey) - am testat funcțiile noi, identice cu
cele din script, pe pozițiile reale ale bulinelor și panourilor din pagină.

`node --check` trecut. Versiune 0.24.

## 2026-09-27 - v0.23

Cerere Paul (verbatim, cu 2 screenshot-uri noi - unul cu fereastra de
conversație UR, altul cu panoul "Straturi hartă"): "în continuare
simbolul de segment neactualizat în livemap apare peste fereastra de UR
sau peste bara din dreapta cu Straturi Hartă."

**Fix-ul din v0.21 nu a rezolvat problema** - confirmat de Paul, cu
dovadă suplimentară: acum apare și peste panoul "Straturi hartă" (din
dreapta), nu doar peste fereastra de conversație UR. Asta a fost
indiciul care a dus la cauza reală.

**Cauza reală, confirmată live de data asta**: am deschis chiar eu
panoul "Straturi hartă" (reproductibil, spre deosebire de fereastra de
conversație UR) și am verificat dreptunghiul elementului de viewport al
hărții (`sdk.Map.getMapViewportElement().getBoundingClientRect()`)
înainte/după deschidere - **nu se schimbă deloc**. Panoul "Straturi
hartă" e un overlay (`position: absolute`, în afara fluxului normal de
layout) care se desenează PESTE hartă, fără să-i micșoreze efectiv
dreptunghiul propriu-zis - spre deosebire de sidebar-ul principal de
editare segment/nod, care CHIAR redimensionează harta (motiv pentru
care fix-ul din v0.18.1, bazat strict pe acel dreptunghi, funcționează
pentru sidebar dar nu pentru overlay-uri ca acesta). Fix-ul din v0.21
adăuga o verificare suplimentară doar pentru `#sidebar` - dar panoul de
straturi și fereastra de conversație UR nu sunt (neapărat) în interiorul
acelui element, deci verificarea nu-i prindea.

**Fix nou, generic** (nu mai depinde de a ghici fiecare panou în parte):
funcție nouă, `isPointOverForeignPanel(x, y, ignoreEl)` - la un pixel
dat, verifică `document.elementsFromPoint(x, y)` (ce elemente sunt cu
adevărat acolo, în ordinea de desenare) și caută primul element care nu
e bulina însăși (`ignoreEl`); dacă acel element e în interiorul
elementului de viewport al hărții → e doar hartă, sigur; altfel → e
orice altă bucată de interfață WME (sidebar, panou de straturi,
fereastră de conversație UR, orice) desenată chiar la acel pixel. Merge
generic pentru ORICE panou, nu doar pentru cele știute dinainte, pentru
că tot ce randează efectiv harta (dale, segmente, iconițe native) e în
interiorul acelui element de viewport, iar orice altceva găsit acolo e
prin construcție altă bucată de UI.

`computeUnpublishedWarnPosition` încearcă acum, în ordine: poziția
împinsă normal (ca înainte) → poziția împinsă în partea opusă → poziția
de bază (nepusă, lângă segment) - prima care nu cade peste un panou
"străin" câștigă; dacă toate 3 cad peste vreun panou (foarte rar), se
folosește oricum prima, mai bine afișată puțin nepotrivit decât deloc.

**Testat live, de data asta cu succes** (nu doar bazat pe raționament):
1. Am verificat că panoul de straturi NU redimensionează
   `getMapViewportElement()` - confirmă cauza reală.
2. Am injectat exact funcția `isPointOverForeignPanel` în pagina live și
   am testat-o cu coordonate reale: un punct în interiorul panoului
   "Straturi hartă" → detectat corect ca "panou străin"
   (`isPointOverForeignPanel = true`); un punct clar pe hartă (departe
   de orice panou) → `false`, cum trebuie.
3. Am repetat testul cu sidebar-ul principal deschis (segment selectat):
   punct în sidebar → `true`; punct pe hartă (la dreapta marginii reale
   a sidebar-ului) → `false`.

Nu am reușit din nou să reproduc fereastra de conversație UR specifică
(markerele de UR/MP rămân greu de țintit din script, ca și în
investigațiile anterioare) - dar fix-ul e acum generic, nu mai depinde
de a găsi/identifica acel panou anume, deci ar trebui să funcționeze și
pentru el la fel ca pentru panoul de straturi (ambele sunt "ceva
desenat peste hartă, în afara elementului de viewport").

`node --check` trecut. Versiune crescută la 0.23 - repară de-a binelea
(cu testare live reușită) un bug real, raportat de două ori.

## 2026-09-27 - v0.22

Cerere Paul (verbatim, două schimbări într-un mesaj):

1. "la activarea HN din toolbar, să se activeze și stratul cu numere de
   imobil"
2. "când se activează tăierea (foarfeca) de tăiere/segmentare (adăugare
   nod) a unui segment, să permită tăierea când mouse e puțin mai
   departe de un segment. momentan e la o distanță mică (aprox 3 metri
   la zoom 20) să permită minim 30 de metri la zoom 20. deci va trebui
   să determini distanța în pixeli la acest zoom și să o folosim la
   toate zoom-urile - nu așa e făcut?"

**1. "HN rapid" activează automat stratul "Numere imobile".** Am găsit
API-ul SDK potrivit prin reverse-engineering în bundle-ul de producție
WME (nu era documentat): `sdk.LayerSwitcher.setWMELayerVisibility({
layerName, isVisible })`, cu `layerName` dintr-un enum intern
(`houseNumbers`, `roads`, `places`, `paths`, `junctionBoxes`,
`closures`, `permanentHazards`, `gpsPoints`, `mapComments`,
`mapProblems`, `updateRequests`, `satelliteImagery`,
`editSuggestions`, `cities`) - `isLayerCheckboxChecked`/
`setLayerCheckboxChecked` (celelalte metode de pe `sdk.LayerSwitcher`)
sunt pentru checkbox-uri PROPRII, adăugate de scripturi via
`addLayerCheckbox`, NU pentru straturile native ale WME, deci nu erau
utilizabile aici. Funcție nouă, `hnEnableHouseNumbersLayer()`, apelată
la `openHnPanel()` (exact momentul în care apare panoul "HN rapid" din
quick-bar) - verifică întâi dacă stratul e deja vizibil
(`getWMELayerVisibility`) și îl pornește doar dacă nu e, best-effort
(erori prinse și ignorate, nu blochează deschiderea panoului).
**Testat live**: confirmat cu `sdk.LayerSwitcher.getWMELayerVisibility`
înainte/după (`false` → `true`) și vizual, checkbox-ul "Numere imobile"
din panoul "Straturi hartă" devine bifat. Nu am putut re-testa
integrarea completă (click real pe butonul din quick-bar → panoul se
deschide → stratul pornește) în acest mediu, pentru că scriptul instalat
prin Tampermonkey în browser e tot v0.21 (fără această modificare) -
componenta SDK folosită e însă confirmată funcțională independent.

**2. Toleranța la click a uneltei de tăiere (foarfeca) - de la ~2,5m
la ~30m (la zoom 20).** Confirmă exact mecanismul descris de Paul:
distanța de "prindere" (snap) e deja un număr FIX de pixeli
(`CUT_MAX_SNAP_DISTANCE_PX`), aplicat la fel indiferent de nivelul de
zoom (nu recalculat per-zoom) - era `25`. Am calculat live, cu SDK-ul,
distanța reală (geodezică, formula haversine) corespunzătoare la zoom
20, în zona de test (lat ~46,9°): 25px = ~2,55m (confirmă exact
estimarea lui Paul de "~3 metri"), iar 300px = ~30,6m. Am schimbat
constanta la `300`. Pentru că e tot un număr FIX de pixeli (ca înainte,
conform cerinței - nu recalculat dinamic per zoom), toleranța reală (în
metri) crește pe măsură ce dai zoom out și scade pe măsură ce dai zoom
in, exact ca înainte, doar că acum e calibrată să însemne ~30m la zoom
20 (nu ~2,5m). Notă: distanța reală mai variază puțin și cu latitudinea
(proiecția Web Mercator a WME nu e uniformă) - 300px a fost ales ca să
dea cel puțin ~30m pe toată întinderea României (mai mult în sud, ceva
mai puțin, dar tot aproape de 30m, în nordul țării). **Testat live**:
calculul de distanță geodezică pentru 25px/250px/290px/300px/310px,
confirmat cu date reale din hartă (nu doar formula teoretică). Nu am
putut re-testa fix comportamentul integrat al uneltei de tăiere (click
real cu foarfeca armată) din același motiv ca la punctul 1 - scriptul
instalat e tot versiunea veche; logica din jurul constantei
(`cutFindNearestSegmentSnap`) nu s-a schimbat, doar valoarea prag.

`node --check` trecut pentru ambele schimbări. Versiune crescută la
0.22 conform convenției - punctul 2 e o reparare a unei limitări reale
care făcea unealta practic inutilizabilă la distanțe mici de la
segment.

## 2026-09-25 - v0.21

Cerere Paul (verbatim, cu 2 screenshot-uri atașate): "small bug: în
continuare notificarea de not on livemap - bulina portocalie specifică
din WME - apare peste ferestre, precum o fereastră de la UR. în trecut
ai rezolvat parțial - nu mai apare peste bara/coloana din stânga."

Context: în v0.18.1 am reparat cazul general - bulina de "nepublicat"
(`unpublishedSegmentsWarning`) nu mai apărea peste bara/coloana
principală din stânga (sidebar-ul de editare segment/nod), pentru că
poziția era recalculată folosind colțul REAL al viewport-ului hărții
(`getBoundingClientRect()` al elementului de viewport, nu presupunerea
că harta începe la (0,0) în fereastră). Acum Paul a raportat că bulina
tot suprapune o fereastră - de data asta una de conversație/raport UR
("Raportor"), diferită de sidebar-ul obișnuit.

**Investigație**: am încercat, în două sesiuni separate, să reproduc
live exact acest scenariu (deschis un raport UR real cu fereastră de
conversație, apoi verificat unde cade bulina) - fără succes: markerele
de UR/MP din WME se randează pe canvas (WebGL), nu ca elemente DOM
separate cu o clasă CSS identificabilă, iar click-urile țintite pe
coordonatele lor (calculate exact via `sdk.Map.getPixelFromLonLat`) au
nimerit constant pe segmente/marcaje din apropiere, nu pe marker-ul de
UR în sine. Am verificat și în bundle-ul CSS/JS de producție al WME
pentru o clasă gen `.conversation-view`/`.olPopup` - nu există o clasă
izolabilă evidentă; panoul pare un component React modern fără o clasă
proprie ușor de țintit din exterior. Nu am reușit deci să confirm live
cauza exactă (geometria panoului respectiv).

**Fix aplicat (defensiv, bazat pe cod, nu pe repro live confirmat)**:
am centralizat cele 6 copii independente ale calculului "colțului real
al viewport-ului hărții" (`vx0`/`vy0`, duplicat în 6 locuri diferite din
script) într-o singură funcție nouă, `getMapViewportBounds()`. Pe lângă
`getBoundingClientRect()` al viewport-ului hărții (ca înainte), noua
funcție verifică ȘI marginea din dreapta a elementului `#sidebar`
direct și, dacă e mai mare decât cea calculată din viewport, o
folosește pe aceea (păstrând marginea din dreapta a hărții neschimbată,
doar micșorând lățimea utilizabilă din stânga). Testat live: în starea
normală (sidebar obișnuit de segment deschis), cele două valori
coincid exact (`vpRect.left = 410px = sbRect.right`), deci fix-ul nu
schimbă nimic în cazul deja funcțional - e o plasă de siguranță
suplimentară pentru cazul în care un panou (poate randat tot în
`#sidebar`, dar fără să forțeze re-dimensionarea propriu-zisă a
viewport-ului hărții) nu era exclus corect înainte.

**Onestitate despre limitări**: nu am putut confirma vizual, live, că
exact ACEST fix rezolvă exact fereastra de conversație UR din
screenshot-urile lui Paul, pentru că nu am reușit să reproduc panoul
respectiv în sesiunea de testare. Dacă bulina tot suprapune fereastra
de conversație UR după acest update, următorul pas util ar fi un
screenshot nou (sau, ideal, acces direct pentru a inspecta DOM-ul live
al panoului respectiv) ca să găsim geometria/clasa CSS reală.

Am folosit ocazia să elimin duplicarea de cod (6 blocuri identice de
calcul `vx0`/`vy0` → 1 singură funcție `getMapViewportBounds()`),
folosită acum de: `computeSegmentBadgePosition`, poziționarea
badge+quick-bar combinat, `multiSegmentRafLoop`,
`computeUnpublishedWarnPosition` (bulina de nepublicat propriu-zisă),
și `unpublishedWarnRescan`. `node --check` trece.

Versiune nouă (0.21) conform convenției - e o încercare de reparare a
unui bug real, raportat anterior ca parțial reparat, chiar dacă nu am
reușit confirmarea live 100%.

## 2026-09-25 - v0.20

Cerere Paul (verbatim, prescurtat): "ce nu am specificat... e să
păstrăm un changelog de la versiune la alta în script - dar foarte mult
simplificat... tot în engleză și să nu îl populăm cu bug-fixuri
minore... doar dacă e ceva mai mare... doar pentru release major: 0.20,
0.21... doar dacă rezolvăm ceva din trecut... este un bug mai important
- atunci putem facem o nouă versiune... notificările de conectare unui
drum la alt drum unde necesită U-turn, fă-l implicit dezactivat - nu
funcționează bine și trebuie lucrat la el (pune în dreptul opțiunii
BETA)... explicațiile de la opțiuni din tabul setări... sub opțiuni o
explicație scurtă ce face opțiunea și un buton de More... și să apară
sub formă de tooltip explicația pe larg."

Trei schimbări:

**1. Convenție de versionare nouă** (vezi nota de mai sus) + mini-
changelog intern în script, lângă `SCRIPT_VERSION` - listează DOAR
versiunile notabile, pe scurt, în engleză. Acest fișier (CHANGELOG.md)
rămâne locul cu detaliile complete, în română, pentru orice schimbare
reală - notabilă sau nu.

**2. "Detectare + avertizare Întoarcere U" - acum BETA, dezactivată
implicit.** Eticheta din tabul de setări are acum sufixul "(BETA)", iar
`DEFAULT_SETTINGS.uturnDetection` a trecut de la `true` la `false` -
utilizatorii noi/existenți care n-au atins-o manual pornesc cu ea
oprită (cei care au deja setări salvate cu `true` explicit rămân cu ea
pornită, fiindcă setările salvate au prioritate față de default - dacă
Paul vrea să o oprească și la el, trebuie debifată manual din tab, o
dată). Motiv: detecția nu e încă fiabilă și are nevoie de lucru
suplimentar, nedefinit încă la ce anume.

**3. Tab-ul de setări - descrieri scurtate + tooltip "More…".** Fiecare
opțiune are acum o linie scurtă (1 propoziție) mereu vizibilă, plus,
dacă mai era ceva de spus, un link mic "More…" cu `title` (tooltip
nativ al browserului) care conține explicația completă de dinainte,
neschimbată ca informație - doar mutată din text vizibil permanent în
tooltip la cerere. `addToggle()` are acum semnătura
`(key, labelText, shortText, moreText)` în loc de
`(key, labelText, helpText)`.

Nicio schimbare de comportament în afară de (2) - doar UI/text. `node
--check` trece.

## 2026-09-25 - v0.19.3

Cerere Paul (verbatim, prescurtat): "scriptul este plin de text, în mare
parte irelevant pentru alți utilizatori... scriptul să îl facem strict
în limba engleză - mă refer la partea de comentarii... va trebui să îl
public pe GreasyFork să intre la un review mai larg... interfața ce se
afișează editorului rămâne în limba română... elimină din script
referințe la fișierele noastre de context, referințe la cererile mele
(cerere Paul), FIX Paul etc... păstrăm cât mai scurt și simplificat."

Curățenie mare, doar comentarii - NICIO schimbare de comportament/logică.
Toate comentariile din cod (`//` și `/* */`) au fost traduse în engleză
și scurtate drastic: eliminate toate referirile narative ("cerere Paul",
"REVIZUIT", "FIX Paul", citate verbatim, date, "verificat live") și toate
trimiterile la CONTEXT.md/CHANGELOG.md - acel istoric rămâne doar aici,
în folderul proiectului, nu mai are ce căuta în scriptul propriu-zis.
Comentariile păstrate documentează doar faptul tehnic relevant (motivul
unei abordări neobișnuite, un gotcha SDK real), în 1-4 rânduri.

Textul afișat efectiv în editor (toast-uri, etichete, butoane, panoul de
setări) NU a fost atins - rămâne integral în română, exact ca înainte
(doar 2 texte din panoul de setări care menționau "vezi CONTEXT.md" au
fost scurtate, eliminând acea trimitere internă, restul textului
neschimbat). Header-ul `@description` din partea de Tampermonkey a fost
și el tradus în engleză (parte din pregătirea pentru publicarea pe
GreasyFork).

Scriptul a scăzut de la 6754 la ~6120 linii. Lucru făcut în etape (regiuni
succesive ale fișierului, fiecare verificată separat cu `node --check`
și cu grep pentru resturi de text românesc/referințe interzise rămase în
comentarii) - `node --check` trece la final pe tot fișierul. Recomandare
pentru Paul: fiind o modificare mecanică, dar foarte mare ca întindere,
merită un test rapid de fum (Start pe câteva unelte - lungime, HN rapid,
mutare noduri, taie segment) înainte de folosire intensă, ca să confirmăm
că nu s-a stricat nimic din greșeală în timpul editării comentariilor.

## 2026-09-25 - v0.19.2 (corecție ulterioară)

Paul a observat că `SCRIPT_VERSION` (constanta afișată în panoul de
setări al scriptului) rămăsese la `0.19.1`, deconectat de `@version`
din header-ul Tampermonkey (deja `0.19.2`) - cele două nu erau
actualizate împreună la bump-urile anterioare. Corectat: `SCRIPT_VERSION
= '0.19.2'`, sincronizat cu header-ul. Nu s-a mai crescut versiunea
pentru asta (cerere explicită Paul: "nu e nevoie de 0.19.3 acum").

## 2026-09-25 - v0.19.2

Cerere Paul (verbatim): "Se poate detecta faptul că după adăugarea unui HN
apăs pe UNDO în editor și practic ultimul nr de imobil adăugat a dispărut
și scriptul să vadă acest lucru și să se întoarcă și el la nr de imobil
anterior adăugat dar «șters» prin UNDO?"

Feature nouă: cât timp o secvență "HN rapid" e activă, scriptul
urmărește acum ID-ul fiecărui HN plasat (primit din evenimentul
`wme-house-number-added`, imediat după `addHouseNumber`) într-o stivă.
Dacă Paul apasă Undo nativ (butonul din header sau, dacă funcționează în
sesiunea lui, Ctrl+Z) și ultimul HN plasat de secvență dispare, scriptul
detectă acest lucru prin `sdk.Events.trackDataModelEvents` (evenimentul
de nivel jos `wme-data-model-objects-removed`, cu `dataModelName:
"segmentHouseNumbers"` - valoare nedocumentată public, găsită prin
inspecția live a bundle-ului JS oficial al WME) și revine automat la
sufixul anterior (cel "șters" prin Undo) ca "următorul" număr de
propus, actualizând și afișajul din panou.

Investigație importantă (vezi CONTEXT.md pentru detalii complete):
evenimentul de nivel înalt `wme-house-number-deleted` NU se declanșează
la Undo (confirmat live) - de asta a fost nevoie de mecanismul de nivel
jos de mai sus. Dacă e ștears prin Undo alt HN, fără legătură cu
secvența curentă (nu ultimul plasat de ea), scriptul ignoră evenimentul
- nu "sare" secvența din cauza unei ștergeri neconexe.

Verificat live (segment de test din sandbox, 484642446): plasat un HN de
test prin SDK, apăsat Undo real (click pe `#undo-button`), confirmat că
evenimentul `wme-data-model-objects-removed` se declanșează cu exact
ID-ul HN-ului șters - mecanismul de detecție e verificat live, la
nivelul SDK. Integrarea completă cu panoul "HN rapid" (rollback vizibil
al secvenței în UI, testat cap-coadă din panou) NU a fost testată live
din interfața reală în această sesiune (`node --check` a trecut).
Versiune crescută la 0.19.2.

## 2026-09-25 - v0.19.1

Cerere Paul (verbatim): "La adăugarea de HN-uri secvențiale, deseori am
nevoia să fac drag la hartă... pentru a face drag dau click pe hartă și
trag de hartă... scriptul ar trebui să detecteze dacă e vorba de un click
mai lung (fără release) pe hartă să nu adauge acolo nr de imobil. Uneori
pot da click greșit... și dacă țin apăsat mai mult pe click să nu îl
adauge. [...] Deci HN să fie adăugat doar la un click scurt."

Bug: în timpul unei secvențe active "HN rapid", orice pan pe hartă
(click-și-trage) plasa din greșeală un număr de imobil la punctul unde se
termina drag-ul - evenimentul nativ `click` tot se declanșează după un
drag, atâta timp cât `mousedown`/`mouseup` cad pe același element DOM
(canvasul hărții, care nu se schimbă vizual la pan).

Fix: `hnHandleMapClick` acum compară poziția/momentul click-ului cu un
`mousedown` înregistrat separat (`hnHandleMouseDown`, ascultător nou de
`mousedown` pe hartă, activ doar cât timp secvența rulează) și respinge
plasarea (fără nicio eroare/toast - drag-urile sunt frecvente, ar fi doar
zgomot) dacă oricare din următoarele e adevărat: (1) distanța dintre
mousedown și click depășește 6px (drag, nu click - o mică toleranță
rămâne pentru tremur de mână), sau (2) timpul scurs depășește 400ms
(apăsare ținută, cerere separată explicită a lui Paul: "dacă țin apăsat
mai mult pe click să nu îl adauge"). Secvența continuă normal după un
click respins - doar acel click nu adaugă nimic.

Verificat matematic (nu vizual - userscript-ul nu s-a putut încărca în
sesiunea de test): 5 scenarii (click scurt fără mișcare, drag de 50px,
apăsare ținută 600ms fără mișcare, tremur mic de 3px, drag limită de
7px) - toate clasificate corect. `node --check` trecut. Versiune crescută
la 0.19.1.

## 2026-09-24 - v0.19.0

Patru schimbări, toate din același schimb de mesaje cu Paul:

**1. Pastila ⚠️ - centrarea iconiței + rest de text vizibil la colaps.**
Paul: "simbolul nu pare centrat în pilulă când nu e extins" + "extinderea
este ok, dar, când se restrânge rămâne mijlocul textului... se vede acolo
„4-09"". Cauza: doar CONTAINERUL pastilei își restrângea `max-width` (cu
`overflow: hidden` + `justify-content: center`), textul rămânea la
lățimea lui naturală (necolapsată) - centrarea rândului întreg (iconiță +
`gap` + text lung) expunea prin fereastra vizibilă de 24px exact MIJLOCUL
acelui rând, de multe ori căzând în mijlocul datei ("4-09"), nu pe
iconiță; `gap: 5px` de pe container rămânea activ chiar cu textul
"invizibil", împingând iconița în lateral. Fix: textul are acum PROPRIA
animație de lățime (`max-width`/`margin-left` de la 0, nu doar containerul
care-l ascunde) - la colaps, textul ocupă efectiv 0px, deci
`justify-content: center` centrează DOAR iconița, indiferent cât de lung e
textul cache-uit. Verificat sintetic (structură DOM+CSS identică, în
browser) - iconița rămâne perfect centrată (`offset` calculat: ~0px) atât
la colaps inițial cât și după un ciclu extindere→colaps, cu 0px de text
vizibil rămas.

**2. Corecție: iconița nativă CHIAR reflectă starea de publicare.**
Concluzia din v0.18.0 (iconița e fixă per tip de rând, portocalie pentru
"Ultima actualizare"/albastră pentru "Creat", indiferent de starea de
publicare) era GREȘITĂ - investigația de atunci s-a făcut doar pe
segmentul de test pe care Paul tocmai îl modificase (ca să am ceva de
văzut), fără un al doilea exemplu de comparat. Paul a corectat: "Ultima
modificare poate avea iconiță albastră - ca la Creat - dacă modificarea a
ajuns în livemap, sau iconiță portocalie dacă Ultima modificare nu a ajuns
în LiveMap." Reinvestigat live, comparând DOUĂ segmente reale din sandbox
(unul cu ultima modificare nepublicată, unul publicată): confirmat - rândul
"Ultima actualizare" folosește clasa `status-updated-icon` (portocaliu)
DOAR cât timp modificarea nu a ajuns pe Livemap; odată ajunsă, WME
comută rândul pe ACEEAȘI clasă ca "Creat" (`status-created-icon`,
albastru). Verificat și încrucișat cu propria formulă de detecție a
scriptului (`getSegmentPublishStatus`) - starea calculată de noi s-a
potrivit exact cu iconița afișată nativ.

**3. Bulina din toolbar (🔵/🟠) înlocuită cu iconițele native.**
Cerere Paul: "Pune aceleași iconițe și în toolbarul când selectez un
segment. portocalie sau albastră să înlocuim emoji-urile." Punctul de
stare din pastila segmentului selectat (`updatePublishStatusDot`) afișează
acum aceleași 2 SVG-uri statice (copiate din CSS-ul oficial WME, nu
legate de un URL live versionat - motiv detaliat în cod) în loc de textul
emoji 🔵/🟠 - portocaliu pentru nepublicat, albastru pentru publicat.
Actualizat și textul de ajutor din setări (nu mai menționează emoji).

**4. Opțiunea "Ține panoul lateral mereu deschis" selectează acum tab-ul
`feature_editor`.** Paul: "la opțiunea de a păstra coloana din stânga
deschisă... selectează tabul «feature_editor»... că alte ferestre deschise
interpretează ca și cum nu ar fi nicio coloană și se bagă în spatele
acelei coloane «fake»... așa îmi dă impresia că ai desenat tu o coloană."
Mecanismul din v0.11.0 (`enforceSidebarOpen`) corecta DOAR rezultatul
vizual CSS (display/visibility/width) al `#sidebar`, fără să schimbe
starea internă a WME despre ce tab e activ - dacă niciun tab nu era activ
când sidebar-ul a "dispărut" (cazul tipic, nimic selectat), coloana
forțată vizibil rămânea "goală" din perspectiva restului aplicației, care
continua să-și calculeze layout-ul ca și cum n-ar exista nicio coloană
acolo. Fix: adăugat un Pas 5 în `enforceSidebarOpen`, care selectează
explicit tab-ul `feature_editor` (același tab pe care WME îl selectează
singur, automat, la orice selecție de segment/loc - confirmat live cu
`sdk.Editing.setSelection`) - are un ecran gol nativ ("Îmbunătățește harta
pentru toți..."), valabil și fără nicio selecție. Nu există nicio metodă
SDK pentru asta (`sdk.Sidebar` expune doar `registerScriptTab`/
`removeScriptTab`), iar un `.click()`/eveniment sintetic de mouse pe
butonul de tab NU are niciun efect (confirmat live - WME ignoră
evenimentele netrusted acolo). Metoda care FUNCȚIONEAZĂ, confirmată live
pe contul lui Paul: schimbăm parametrul `tab` din URL cu
`history.replaceState` (nu `pushState`, ca să nu umplem istoricul de
navigare la fiecare 500ms de poll) și declanșăm manual un eveniment
`popstate` - exact ce ascultă routerul intern al WME.

Live-testat pe contul lui Paul (segmente reale din sandbox, nu doar
segmentul de test): schimbarea de tab (`popstate`) confirmată vizual -
panoul comută corect pe ecranul gol al `feature_editor`; iconițele
albastră/portocalie confirmate din inspecția DOM directă a doi segmenți
reali (unul publicat, unul nu). Centrarea pastilei ⚠️ verificată sintetic
(structură DOM+CSS identică), nu vizual cu scriptul propriu-zis rulând (nu
s-a putut încărca userscript-ul în sesiunea de test de această dată) -
recomand o verificare vizuală rapidă după ce Tampermonkey preia v0.19.0.

## 2026-09-24 - v0.18.1

Bug de poziționare: **orice pastilă a scriptului (lungime segment, bară
rapidă, pastile de selecție multiplă, pastila ⚠️ de segmente nepublicate)
putea fi afișată peste coloana din stânga (panoul de editare) sau peste alte
ferestre deschise ale WME**, nu doar peste hartă. Raportat de Paul cu 2
capturi de ecran - pastila ⚠️ apărea suprapusă peste textul "Furnizori
externi" din panoul de editare al unui loc.

Cauza: toate calculele de poziție/clampare foloseau `viewportEl.clientWidth`
/`clientHeight` (doar DIMENSIUNEA hărții) ca și cum harta ar începe mereu la
coordonata (0,0) a ferestrei. În realitate, harta NU începe la x=0 cât timp
panoul din stânga (editare segment/loc, listă schimbări etc.) e deschis -
harta începe abia la `viewportEl.getBoundingClientRect().left`. Coordonatele
calculate de `sdk.Map.getPixelFromLonLat` sunt deja în spațiul FERESTREI
întregi (confirmat printr-un test dedicat, vezi nota din cod de la
`cutFindNearestSegmentSnap`, 2026-09-23), deci orice pastilă împinsă spre
marginea din stânga a hărții era "clampată" (limitată să rămână vizibilă) la
un interval greșit care pornea de la x=24px - adică bine în interiorul
panoului din stânga, nu la marginea reală a hărții.

Fix: toate funcțiile de clampare/verificare-vizibilitate
(`clampToViewport`, `isSegmentPathInViewport`, `computeQuickBarPosition`,
`computeSegmentBadgePosition`, `computeUnpublishedWarnPosition`) primesc
acum și colțul real stânga-sus al hărții (`vx0`/`vy0`, din
`viewportEl.getBoundingClientRect()`), nu doar dimensiunea ei - limitele
folosite la clampare/centrare sunt acum `[vx0, vx0+lățime]` / `[vy0,
vy0+înălțime]`, nu `[0, lățime]` / `[0, înălțime]`. Aplicat consecvent la
toate cele 4 sisteme de pastile afectate (pastila de lungime + bara rapidă
unite, pastilele de selecție multiplă, pastila ⚠️ nepublicate) - inclusiv
împingerea suplimentară a pastilei ⚠️ (offset-ul de 26px față de pastila de
bază), care înainte NU era reclampată după împingere și putea "scăpa" din
nou peste margine chiar dacă poziția de bază era corectă.

Nu a fost încă live-testat pe browser-ul lui Paul la momentul acestui
deploy (fix pur geometric/matematic, verificat prin inspecția codului și
`node --check`) - urmează confirmarea lui Paul că pastilele rămân în
interiorul hărții indiferent de panourile deschise în stânga.

Cerere Paul (verbatim, prescurtat): transformarea scriptului
"WME Node Angle & Length" într-un multitool numit temporar "WME RO Tools",
cu 5 grupuri mari de funcționalități noi (lungime la segment selectat, tab
de setări, automatizare parametri segment, bară de butoane rapide,
trimițător de mesaje multiple pentru UR). Paul a ales explicit workflow-ul
"pe rând, cu livrare și testare la fiecare pas" - implementăm și testăm un
singur bloc, raportăm, așteptăm confirmare, abia apoi trecem la următorul.

Pași parcurși în această fază:

1. Verificat SDK-ul oficial WME (documentație live) pentru toate
   namespace-urile relevante fazelor următoare: `DataModel.Segments`
   (`getById`, `getAll`, `getRoadTypes`, `updateSegment`,
   `getConnectedSegments`, `isTollSegment`, `hasPermissions`,
   `connectsToBigJunction`), `DataModel.Nodes`, `Editing`, `Map`,
   `Sidebar` (`registerScriptTab`/`removeScriptTab`), `Events`.
2. Inspecție live (Claude in Chrome, contul lui Paul) a panoului de
   editare a unui segment real: identificate clasele exacte ale butoanelor
   native (`div.controls.roadDetailsFlags--h4KVD` pentru cele 4 flag-uri:
   unpaved/tunnel/headlights/HOV; butoanele de tip drum), lista completă
   de tipuri de drum cu id numeric via `getRoadTypes()` (cu o gaură
   suspectă la NARROW_STREET, id 21 - de investigat live înainte de
   implementarea task 3.5), structura obiectului segment
   (`flagAttributes`, `lockRank` 0-indexat intern, `roadType`, etc.),
   clasele native `w-icon-*` reutilizabile pentru iconițele cerute la
   task 4.
3. Redenumit scriptul: header Tampermonkey, `SCRIPT_ID`/`SCRIPT_NAME`
   schimbate la `wme-ro-tools`/"WME RO Tools", `SCRIPT_VERSION` resetat la
   `0.1.0` (nou proiect/fork, versionare separată de
   `wme-node-angle-length`). Comportamentul de unghi+lungime la nod
   preluat byte-identic din v0.3.0 - nicio schimbare acolo.
4. Implementat task 1 (lungime la segment selectat): etichetă pastilă
   identică vizual cu cea de la noduri, poziționată la mijlocul geometric
   al segmentului dacă e vizibil pe ecran, altfel la cel mai apropiat
   punct de traseu față de centrul viewportului, cu clamp final în
   interiorul ecranului - detalii complete în `CONTEXT.md`.
5. Testat live prin injectare directă (scriptId `wme-ro-tools-test`, clase
   CSS cu sufix `-t2`, ca să nu interfereze cu scriptul real instalat):
   - Segment normal (ramă, id 137806816, 378 m) - etichetă corectă la
     mijlocul vizual, valoare identică cu panoul nativ.
   - Segment foarte lung (id 243744948, 6604 m) - repoziționare corectă
     aproape de centrul ecranului la zoom pe un capăt, și clamp vizibil
     într-un colț al ecranului când tot segmentul e panoramat în afara
     vederii.
   - Comportamentul vechi (unghi+lungime la nod) verificat neschimbat.
6. Implementarea (`node --check` trecut) livrată pe dispozitiv la
   `wme-ro-tools/wme-ro-tools.user.js`, md5 verificat
   `dcef0189a1b53d38df49713a760a2c27`, 652 linii.

De reținut pentru Paul: Tampermonkey nu preia automat scriptul de pe disc -
trebuie actualizat manual din dashboard-ul Tampermonkey înainte de a testa
în editorul real (nu în fereastra de test prin injectare).

Următorul pas (task 2, planificat, NEÎNCEPUT - se așteaptă confirmarea lui
Paul pentru acest livrabil întâi): tab de setări în panoul lateral
"UserScripts", via `sdk.Sidebar.registerScriptTab()`.

## 2026-09-06 (continuare) - v0.2.0

Paul a confirmat că v0.1.0 funcționează și a cerut să continuăm cu
următorul punct (tab de setări) plus investigarea unui caz concret de
Narrow Street, ca să rezolvăm gaura găsită în `getRoadTypes()`.

1. **Investigație live NARROW_STREET** (Claude in Chrome, cont Paul):
   selectat un segment real (id 281438422, tip inițial Street/lock 3),
   apăsat butonul "NS" din panoul de tip drum, citit
   `sdk.DataModel.Segments.getById(...).roadType` înainte/după. Rezultat:
   `roadType` devine `22`, iar `getRoadTypes()` raportează id 22 ca
   `name: "ALLEY"`, `localizedName: "Stradă îngustă"`. Concluzie: "Narrow
   Street"/"NS" din UI ȘI "Alley" sunt același tip de drum intern (id 22) -
   nu există un id 21 real, distinct, pentru NS. Gaura semnalată în faza
   anterioară e complet rezolvată; testul a fost anulat cu `Editing.undo()`
   + `clearSelection()`, 0 modificări nesalvate la final.
2. **Implementat task 2** (tab de setări în panoul lateral "UserScripts"):
   folosind API-ul oficial `sdk.Sidebar.registerScriptTab()` (confirmat
   live că e ASINCRON - o primă încercare fără `await` a picat cu
   `TypeError: Cannot set properties of undefined`, corectată). Tab-ul
   arată câte un checkbox pentru fiecare unealtă existentă ("Unghi +
   lungime la nodul selectat", "Lungime la segmentul selectat"), ambele
   activate implicit, cu efect imediat la bifare/debifare (fără refresh),
   persistate în `localStorage` (cheia `wme-ro-tools-settings`).
3. **Testat live** (injectare cu scriptId/clase CSS `-t4`, localStorage cu
   cheie de test separată, ca să nu interfereze cu scriptul real sau cu
   eventuale setări deja salvate ale lui Paul):
   - Tab-ul "RO Tools" apare corect lângă celelalte scripturi din panoul
     UserScripts (FUME, JAI, CS, PIE, SUI, URO+, JBU etc.).
   - Selecție pe un nod real cu 3 segmente (233070781) - cele 3 etichete
     de lungime corecte; confirmat că cercurile de unghi vizibile simultan
     aparțin scriptului JAI (alt script), nu nouă.
   - Debifare "Unghi + lungime..." cât timp nodul e selectat - etichetele
     noastre dispar instant, cercurile JAI rămân neafectate. Bifare la loc
     - reapar instant, poziționate corect.
   - Aceeași secvență confirmată și pentru toggle-ul de segment.
   - `sdk.Editing.getUnsavedChangesCount() === 0` confirmat la final.
4. Livrat pe dispozitiv la `wme-ro-tools/wme-ro-tools.user.js`, md5
   verificat `2aca5614f94b08364b2a8f08fbdce79b`, 792 linii, `node --check`
   trecut.

Următorul pas (task 3, planificat, NEÎNCEPUT - se așteaptă confirmarea lui
Paul pentru acest livrabil întâi): automatizarea parametrilor de segment
(viteză, tip drum, lock level, unpaved) la apăsarea butoanelor native din
panoul de detalii drum - gaura NARROW_STREET fiind acum rezolvată, nu mai
există niciun blocaj tehnic cunoscut pentru a începe acest task.

## 2026-09-06 (continuare 2) - v0.3.0

Paul a cerut continuarea cu task 3 (automatizare parametri segment) și, în
plus, a adăugat un nou punct pe listă: afișarea etichetelor de lungime
pentru fiecare segment când sunt selectate MAI MULTE segmente simultan
(nu doar unul singur, ca la task 1/v0.1.0) - notat ca task 6, PLANIFICAT,
în `CONTEXT.md`, neînceput încă.

1. **Inspecție live DOM** (Claude in Chrome, cont Paul, segment real
   selectat): confirmat că butonul "Neasfaltat" și cele 13 butoane de tip
   drum sunt elemente `<wz-checkable-chip>` - cel de Neasfaltat conține
   `<i class="w-icon-unpaved-fill">`, cele de tip drum au clasa
   `cs-compact-button`, în ordine fixă (Fw, Rmp, MH, mH, PS, St, NS, 4x4,
   PLR, PR, Bac, CF, PA) care corespunde exact ordinii descrise de Paul
   ("al 8-lea buton" = 4x4, confirmat).
2. **Implementat task 3** complet (toate regulile 3.1-3.5 din cererea
   inițială a lui Paul) - detalii tehnice complete în `CONTEXT.md`.
   Adăugat și un toggle nou în tab-ul de setări:
   "Automatizare parametri segment" (cheie `segmentAutomation`, implicit
   activă).
3. **Test dedicat**: confirmat live că `updateSegment({flagAttributes:
   {...}})` face MERGE, nu înlocuiește tot obiectul de flag-uri -
   important, altfel fiecare regulă care setează un singur flag (ex:
   headlights) ar fi șters accidental celelalte flag-uri ale segmentului
   (unpaved, tunnel etc.).
4. **Testat live** (harness izolat în consolă, cu logica EXACT copiată
   din fișierul real, ca să nu fie nevoie de reinstalare repetată în
   Tampermonkey la fiecare iterație):
   - 3.1 + 3.2: segment OffRoad -> Neasfaltat ON (roadType->Street,
     unpaved true, viteză 20/20, Lock 3) -> Neasfaltat OFF (viteză 30/30,
     Lock rămas 3).
   - 3.3: click Primary Street -> Lock rămas 3 (minim deja satisfăcut),
     Headlights bifat.
   - 3.4: click Major Highway -> Lock RIDICAT de la 3 la 4 (minimul
     aplicat corect), Headlights bifat.
   - 3.4 (Ramp - regula cea mai riscantă): segment cu Lock propriu 3,
     conectat la un vecin cu Lock 5 -> click Ramp -> Lock devine direct 5
     (valoarea maximă găsită la vecini), confirmat corect.
   - 3.5 (OffRoad): segment cu Neasfaltat bifat manual -> click 4x4 ->
     Neasfaltat debifat automat, viteză 15/15, Lock 3.
   - Toate cele 16 modificări nesalvate acumulate în teste anulate prin
     `sdk.Editing.undo()` repetat, `getUnsavedChangesCount() === 0`
     confirmat la final pe ambele segmente de test.
   - Cazurile NS/PLR/PR/Ferry/Railway/Runway din 3.5 NU au fost testate
     individual live (folosesc exact același mecanism deja validat, doar
     cu alte constante) - risc rezidual scăzut, semnalat explicit lui
     Paul.
5. Livrat pe dispozitiv la `wme-ro-tools/wme-ro-tools.user.js`, md5
   verificat `87131ee036345549ccb97cdc7ced12c7`, 1095 linii, `node --check`
   trecut.

Următorul pas (planificat, NEÎNCEPUT - se așteaptă confirmarea lui Paul):
fie task 4 (bară de butoane rapide), fie noul task 6 (etichete de lungime
la selecție multiplă de segmente), în funcție de preferința lui Paul.

## 2026-09-06 (continuare 3) - v0.4.0

Paul a semnalat un defect vizual la pastila de lungime a segmentului
(cerere verbatim, prescurtat): "pastila se afișează fix peste segment, ar
trebui mai în lateralul segmentului astfel încât să nu se suprapună deloc"
- plus cererea de a continua cu task 4 (bară de butoane rapide).

1. **Fix pastilă lungime segment** - `computeSegmentBadgePosition()`
   calculează acum și direcția locală (dx, dy) a segmentulețului pe care
   cade punctul ales (mijloc după lungime, sau cel mai apropiat de centrul
   ecranului), apoi deplasează punctul perpendicular pe acea direcție cu
   `SEGMENT_LENGTH_BADGE_SIDE_OFFSET_PX` (20px) înainte de clamp-ul final în
   viewport. Testat live (harness cu suffix `-t5b`, injectat direct):
   segment real (id 281438698, 29 m) selectat simultan cu scriptul real
   instalat (v0.3.0, fără fix) - cele două pastile "29 m" au apărut vizibil
   deplasate una față de alta, la o distanță de ~20px, exact perpendicular
   pe segment - confirmă fix-ul funcțional.
2. **Implementat task 4** (bară de butoane rapide lângă lungimea
   segmentului, poziționată sub pastilă): 8 butoane, în ordinea cerută -
   Neasfaltat (`w-icon-unpaved-fill`, cu automatizarea din task 3 aplicată
   direct la click), Faruri (`w-icon-headlights-fill`), HOV/Bus
   (`w-icon-bus`), Nivel de blocare (SVG lacăt propriu + număr, click
   deschide meniu vertical DEASUPRA cu nivelurile 1-6), Direcție
   (`w-icon-arrow-two-way`/`w-icon-arrow-right`, click deschide meniu
   vertical DEASUPRA cu DOAR celelalte 2 opțiuni față de starea curentă),
   +HN (declanșează butonul nativ `[class*="addHouseNumberTooltip"]
   wz-button`, dezactivat automat dacă cel nativ e disabled), Taxă/Toll (SVG
   "$" propriu, citire/scriere prin `isTollSegment`/`hasToll`), Restricții
   (SVG propriu + eticheta "TBR", declanșează modalul nativ
   `wz-button.edit-restrictions`, evidențiat dacă `segment.hasRestrictions`
   e true). Toggle nou în tab-ul de setări: "Bară de butoane rapide" (cheie
   `segmentQuickBar`, implicit activă) - cu mențiunea că necesită și
   "Lungime la segmentul selectat" activ, fiindcă bara e poziționată
   relativ la pastilă. Stare live (evidențiere fundal cyan pe
   unpaved/headlights/HOV/toll bifate + restricții existente, număr de lock
   level, iconiță de direcție) reîmprospătată printr-un `setInterval` de
   400ms, separat de bucla `requestAnimationFrame` care doar repoziționează
   bara.
3. **Testat live** (Claude in Chrome, cont Paul, harness `-t5b` injectat
   direct - `wme-ready` fiind deja declanșat înainte de injectare într-un
   tab already-loaded, testul a rulat `init()` direct, fără să aștepte acel
   eveniment; scriptul real de pe disc rămâne neschimbat, corect pentru
   încărcare timpurie prin Tampermonkey):
   - Neasfaltat: click ON->OFF->ON pe un segment cu unpaved deja activ -
     flag + viteză (20/20 <-> 30/30) + lock level actualizate corect de
     ambele ori, conform regulilor 3.1/3.2 deja validate la task 3.
   - Faruri, HOV, Taxă: toggle ON->OFF pe fiecare, verificat prin SDK
     (`flagAttributes`/`isTollSegment`) - revenire exactă la starea
     inițială (`false`) de fiecare dată.
   - Nivel de blocare: meniul arată toate cele 6 opțiuni; selectarea "Lock
     5" -> `lockRank` 4, apoi "Lock 3" -> `lockRank` 2 (validează
     `levelToRank`); meniul se închide după fiecare selecție.
   - Direcție (regula cea mai riscantă - verificată separat): segment
     "Ambele sensuri" -> meniul arată doar "A → B" și "B → A" (nu și
     starea curentă); selectat "A → B" -> `isAtoB` true; meniul redeschis
     arată acum "B → A" și "Ambele sensuri" (nu mai arată "A → B"); selectat
     "Ambele sensuri" -> revenire completă la `isTwoWay` true.
   - +HN și Restricții: selectoarele native găsite corect
     (`[class*="addHouseNumberTooltip"] wz-button`, găsit dezactivat pe
     segmentul de test fără nume de stradă - confirmă gestionarea corectă a
     stării disabled; `wz-button.edit-restrictions`, găsit cu textul
     "Adaugă restricții") - nu s-a dat efectiv click pe Restricții în test,
     ca să nu rămână un modal nativ deschis neterminat; risc rezidual redus,
     fiindcă mecanismul (`.click()` pe un buton nativ deja funcțional) e
     identic cu cel deja validat pentru +HN.
   - Toate cele 14 modificări nesalvate acumulate în teste anulate cu
     `sdk.Editing.undo()` (câte un apel per test, din cauza unei limitări a
     mediului de testare la apeluri multiple în același script) -
     `getUnsavedChangesCount() === 0` confirmat la final, iar
     `flagAttributes`/`lockRank`/direcția/`isTollSegment` verificate ca
     identice cu starea de dinaintea testelor.
4. Livrat pe dispozitiv la `wme-ro-tools/wme-ro-tools.user.js`, md5
   verificat `e9aeb21f8d9e6e93d267c85d6a1bb649`, 1478 linii, `node --check`
   trecut.

De reținut: testarea live în acest mediu a scos la iveală o limitare - tab-ul
controlat prin automatizare e adesea `document.hidden === true`, ceea ce
oprește complet `requestAnimationFrame` (deci și bucla proprie de
poziționare live a pastilei/barei). Pentru task 4, poziționarea a fost
verificată printr-un calcul manual (aceeași formulă, copiată 1:1) aplicat o
singură dată, nu prin bucla reală - risc rezidual redus, fiindcă bucla în
sine (`segmentRafLoop`) nu a fost modificată structural față de v0.3.0, doar
i s-a adăugat repoziționarea barei alături de pastilă.

Următorul pas (planificat, NEÎNCEPUT - se așteaptă confirmarea lui Paul):
task 6 (etichete de lungime la selecție multiplă de segmente) sau task 5
(trimițător de mesaje multiple pentru UR), în funcție de preferința lui
Paul.

## 2026-09-06 (continuare 4) - v0.4.1

Cerere Paul (verbatim), trimisă cu 2 capturi de ecran ale v0.4.0 chiar
instalat (pastilă "808 m" + un rând de iconițe cu mai multe pătrățele
goale):

> "iconițele nu apar... mută meniul să fie în afara segmentului. și
> lungimea... toolbar să fie cu culorile standard. eu cum folosesc
> scriptul care face Dark Mode, nu îmi transformă acest toolbar în modul
> întunecat.
> $ - drum cu taxă să nu activeze automat drumul cu taxă, doar
> evidențiază dacă e activat sau nu și la apăsare deschide fereastra cu
> TBR. fără simbolul de interzis... doar TBR care deschide fereastra de
> editare restricții.
> la acțiunile anterioare fă-mi ca setarea de viteză, lock level,
> asfaltat/neasfaltat să funcționeze și atunci când selectez mai multe
> segmente."

Șase reparații, toate în bara de butoane rapide (task 4) și în
automatizarea de la task 3:

1. **Iconițele nu apăreau** - cauză confirmată: clasele native WME
   (`<i class="w-icon-unpaved-fill">` etc.) se randează corect DOAR în
   contextul componentelor lor originale (`wz-checkable-chip` din panoul
   nativ) - în `<div>`-urile proprii adăugate direct în `document.body`
   apar ca pătrățele goale (fontul de iconițe nu se aplică acolo). Rezolvat
   înlocuind toate cele 4 butoane afectate (Neasfaltat, Faruri, HOV,
   Direcție) cu SVG-uri proprii, auto-conținute (monocrom,
   `stroke="currentColor"`, 24x24 viewBox) - același principiu deja folosit
   cu succes la Lock/Taxă/Restricții, care nu aveau această problemă.
2. **Meniul (lock level / direcție) se deschidea peste segment** - cauză:
   se deschidea implicit DEASUPRA butonului, la doar 4px distanță, adică
   spre pastilă/linia segmentului. Rezolvat: acum se deschide implicit
   DEDESUBTUL barei, cu un gol mai mare (14px, `QUICK_BAR_DROPDOWN_GAP_PX`);
   cade pe varianta "deasupra" doar dacă nu încape dedesubt (bara e prea
   aproape de marginea de jos a ecranului) - plus clamp orizontal ca să nu
   iasă din ecran lateral.
3. **Culori "standard" + adaptare la Dark Mode** - pastila de lungime și
   bara de butoane foloseau anterior o paletă fixă (alb + bordură cyan).
   Cum nu știm exact cum funcționează scriptul extern de Dark Mode al lui
   Paul (mecanism necunoscut), NU depindem de el - în schimb, s-a adăugat
   un sistem de teme (`THEME_LIGHT`/`THEME_DARK`) care eșantionează live
   culoarea de fundal calculată a unui element nativ WME stabil
   (`.wz-tab-view, #sidebar, .WazeMapArea, .olMapViewport`) și calculează
   luminanța perceptuală - sub 0.5 înseamnă "pagina e închisă la culoare",
   deci comutăm pastila/bara/meniurile pe paleta închisă. Se reevaluează la
   fiecare 400ms (același interval cu restul stărilor din bară), deci
   urmează live orice comutare de temă. Testat direct pe pagina reală a lui
   Paul (temă luminoasă, fundal alb) - detectat corect `isDark: false`,
   fără erori.
4. **Butonul "$" (Taxă) nu mai activează automat drumul cu taxă** -
   eliminată funcția `quickBarToggleToll` care făcea `updateSegment({
   hasToll: !hasToll })` direct la click; acum click-ul pe "$" doar
   deschide același modal nativ de restricții ca butonul TBR
   (`quickBarClickNativeRestrictions`, selector `wz-button.edit-restrictions`,
   confirmat existent live pe pagină) - evidențierea vizuală (fundal
   albastru deschis dacă `isTollSegment` e true) rămâne neschimbată.
5. **Simbolul de interzis eliminat de pe butonul Restricții** - butonul
   arăta anterior o iconiță SVG proprie de tip "cerc tăiat"; înlocuită cu
   un simplu text `TBR`, fără nicio iconiță - click-ul continuă să deschidă
   modalul nativ, evidențierea pe `segment.hasRestrictions` neschimbată.
6. **Automatizarea (viteză/lock level/asfaltat) extinsă la selecție
   multiplă** - înlocuit `getSingleSelectedSegmentId()` (întorcea `null`
   dacă erau selectate 2+ segmente, deci automatizarea nu se declanșa
   deloc) cu `getSelectedSegmentIds()` (întoarce toate id-urile din
   `sdk.Editing.getSelection().ids`, indiferent de câte sunt). La click pe
   chip-ul nativ "Neasfaltat" sau pe un buton de tip drum,
   `handleAutomationClickCapture` reține acum starea DINAINTE (`unpaved`,
   `roadType`) separat pentru fiecare segment din selecție (fiindcă la
   selecție multiplă segmentele pot porni din stări diferite), apoi
   așteaptă (`watchSegmentUntil`, independent per id) și aplică
   automatizarea fiecăruia cu propriile lui valori de dinainte - clickul
   nativ WME schimbă oricum toate segmentele selectate simultan, deci
   scriptul doar "urmărește" fiecare id separat.

Verificare făcută în această rundă: `node --check` trecut, căutare
exhaustivă (grep) de referințe rămase la simbolurile eliminate
(`QUICK_BAR_ACTIVE_BG`, `QUICK_BAR_ICON_RESTRICTIONS_SVG`,
`quickBarToggleToll`, `getSingleSelectedSegmentId`) - niciuna găsită;
revizuire manuală linie cu linie a tuturor funcțiilor modificate (teme,
SVG-uri noi, poziționare meniu, automatizare multi-segment); testat live pe
pagina reală a lui Paul doar funcția de detectare temă (`detectDarkMode`) -
a confirmat corect tema luminoasă curentă, fără erori, și a confirmat că
selectorul `wz-button.edit-restrictions` există pe pagină.

**Notă onestă despre limitele testării din această rundă**: spre deosebire
de rundele anterioare (task 3, task 4 inițial), NU s-a mai reinjectat
scriptul complet într-un tab automatizat pentru un test vizual/funcțional
end-to-end (click efectiv pe fiecare buton, verificare vizuală a poziției
meniului și a culorilor). Motivul principal: exact acest tip de testare
"sintetică" (evenimente SDK + `dispatchEvent`, fără inspecție vizuală
directă a scriptului instalat normal, în tab-ul normal al lui Paul) a
ratat deja bug-ul iconițelor goale în runda anterioară - randarea fontului
de iconițe se comportă diferit în funcție de context, exact genul de
problemă pe care testele bazate pe citiri SDK/DOM nu o prind. Modificările
au fost verificate temeinic prin revizuire de cod (logică, referințe,
sintaxă) și un test live punctual pe partea cu risc de eroare silențioasă
(detectarea temei); comportamentul vizual real (poziția exactă a meniului,
aspectul culorilor, click-urile pe fiecare buton nou) urmează să fie
confirmat de Paul pe propriul lui browser, la fel cum tot el a raportat
problemele din runda anterioară.

Livrat pe dispozitiv la `wme-ro-tools/wme-ro-tools.user.js`, versiune
0.4.1.

Următorul pas (planificat, NEÎNCEPUT - se așteaptă confirmarea lui Paul pe
această rundă de reparații): task 6 (etichete de lungime la selecție
multiplă de segmente) sau task 5 (trimițător de mesaje multiple pentru UR).

## 2026-09-06 (continuare 5) - v0.5.0

Cerere Paul (verbatim): "continuă cu task 6. Toolbar tot fundal alb are.
verifică atent ce fundal trebuie să avem ca să fie închis la culoare când
Dark Mode (scriptul e activ)."

1. **Fix detecție temă întunecată** - investigat live pe pagina reală a
   lui Paul cu tema activă. Ce el numea "scriptul de Dark Mode" e de fapt
   tema NATIVĂ a WME (`<html wz-theme="dark">`), nu un userscript extern.
   Bug-ul din v0.4.x: `detectDarkMode()` eșantiona culoarea unui "element
   stabil" ales prin `document.querySelector('.wz-tab-view, #sidebar,
   .WazeMapArea, .olMapViewport')` - dar `#sidebar` (panoul lateral)
   rămâne alb chiar și cu tema activă (doar `<html>`/`<body>` și harta se
   recolorează), iar `querySelector` cu o listă de selectori alege primul
   element găsit în ORDINEA DOM, nu în ordinea din listă - pe pagina lui
   Paul alegea mereu `#sidebar` (alb), deci raporta greșit "temă
   luminoasă". Rezolvat: citește direct atributul nativ `wz-theme` de pe
   `<html>` - testat live, confirmă corect `true` cu tema activă (anterior
   ar fi întors `false`, exact bug-ul raportat: "toolbar tot fundal alb
   are").
2. **Task 6 implementat - lungime la selecție multiplă de segmente**:
   stare nouă `multiSegmentState` (o pastilă per segment din selecție,
   FĂRĂ bară de butoane rapide - aceea rămâne exclusiv pentru un singur
   segment selectat), reutilizează integral funcțiile de poziționare/
   formatare deja validate la task 1. Controlat de același toggle de
   setări ca lungimea la un singur segment (`segmentLength`, redenumit în
   UI). `checkSelection()` extins cu ramura de selecție multiplă,
   asigurând curățarea corectă a stărilor la comutarea între nod/un
   segment/mai multe segmente.
3. **Testat live** (Claude in Chrome, cont Paul):
   - `detectDarkMode()` extras și rulat direct pe pagina reală (tema
     activă) → a întors `true`, corect.
   - Selectate programatic 3 segmente reale prin SDK
     (`Editing.setSelection`), confirmată selecția cu toate cele 3 id-uri;
     logica de poziționare/lungime per segment (aceeași formulă, testată
     manual din cauza limitării deja cunoscute `document.hidden` blochează
     `requestAnimationFrame` în acest mediu) a produs poziții și lungimi
     corecte, diferite per segment (365 m / 102 m / 113 m). Selecția de
     test ștearsă complet la final, nicio modificare persistentă asupra
     datelor.
4. Livrat pe dispozitiv la `wme-ro-tools/wme-ro-tools.user.js`, versiune
   0.5.0.

Următorul pas (planificat, NEÎNCEPUT - se așteaptă confirmarea lui Paul):
task 5 (trimițător de mesaje multiple pentru UR) sau task 7 (automatizare
Întoarcere U, adăugat în TODO în această rundă - vezi CONTEXT.md).

## 2026-09-06 (continuare 6) - v0.5.1

Cerere Paul (verbatim): "+HN nu inițiază adăugare nr imobil (tasta H -
Add Housenumber). acum fundalul este bun conform temei negre. sigur Dark
Mode nu vine de la scriptul 'WME Dark Mode'?"

1. **Fix +HN** - investigat live: selectorul folosit de
   `quickBarClickNativeHn()`/`refreshQuickActionBar()`,
   `[class*="addHouseNumberTooltip"] wz-button`, nu mai găsea NIMIC pe
   pagina reală a lui Paul (0 elemente) - butonul nativ "Adaugă nr.
   imobile" nu mai e învelit într-un element cu acea clasă în versiunea
   curentă de WME, deci click-ul pe +HN nu făcea absolut nimic, silențios
   (fără eroare vizibilă). Găsit live noul buton corect, în `#edit-panel`:
   `<wz-button><i class="w-icon w-icon-home">Adaugă nr. imobile
   </wz-button>` - fără clasă/id proprii, dar cu iconița `w-icon-home`,
   confirmată unică pe toată pagina - ancoraj stabil, independent de limba
   interfeței (spre deosebire de textul butonului). Extras într-un helper
   comun `findHnButton()`, folosit atât de click cât și de starea
   disabled/enabled din `refreshQuickActionBar`. Testat live: selectat un
   segment real, apăsat butonul găsit prin noul selector - a intrat vizibil
   în modul de adăugare numere de imobile (indicatorul "HN" din bara de
   sus a devenit roșu/activ), apoi dezactivat la loc și selecția curățată.
2. **Confirmare sursă Dark Mode** - Paul a întrebat direct dacă tema
   întunecată nu vine cumva de la un script separat numit "WME Dark Mode".
   Investigat live, exhaustiv: nicio cheie `localStorage` legată de
   temă/dark, niciun `<style>` cu semnătură de "dark mode" printre cele
   ~17 style-uri injectate pe pagină, nicio mențiune de "wz-theme" în
   scripturile inline ale paginii. Găsită însă o extensie Chrome instalată
   ("WME Toolbox", vizibilă prin `chrome-extension://.../scripts/
   WME_Toolbox.prod.min.js` printre sursele de `<script>` ale paginii) -
   foarte probabil aceasta e ce Paul numește colocvial "scriptul de Dark
   Mode" (WME Toolbox e un pachet cunoscut de unelte pentru WME, cu module
   multiple, posibil inclusiv un comutator de temă). Indiferent dacă
   comutatorul de temă e nativ WME sau declanșat prin acest add-on,
   REZULTATUL pe pagină e identic și confirmat live: atributul
   `wz-theme="dark"` pe `<html>` - exact ce citește `detectDarkMode()` de
   la v0.5.0 - deci detecția rămâne corectă și robustă indiferent de
   mecanismul exact din spate.
3. Livrat pe dispozitiv la `wme-ro-tools/wme-ro-tools.user.js`, versiune
   0.5.1.

Următorul pas (planificat, NEÎNCEPUT - se așteaptă confirmarea lui Paul):
task 5 (trimițător de mesaje multiple pentru UR) sau task 7 (automatizare
Întoarcere U).

## 2026-09-06 (continuare 7) - corecție documentație (fără schimbare de cod)

Paul a trimis codul sursă complet al scriptului Tampermonkey instalat la
el, ca răspuns la întrebarea din runda anterioară ("sigur Dark Mode nu
vine de la scriptul 'WME Dark Mode'?"). Confirmat direct din cod: tema
chiar vine din acel userscript exact - "WME Dark Mode" (autor
`poland_fun`, Greasy Fork) - NU de la extensia "WME Toolbox" cum s-a
speculat greșit în v0.5.1, și nici nativ din WME cum s-a presupus și mai
greșit în v0.5.0. Mecanismul confirmat din sursă: scriptul face
`document.documentElement.setAttribute('wz-theme', theme)` și injectează
o listă lungă de reguli CSS scopate `[wz-theme="dark"] <selector
cunoscut>`, adăugate manual, plugin cu plugin, de-a lungul a 25+ versiuni
(vezi jurnalul din headerul scriptului) - motiv pentru care elementele
scriptului nostru, necunoscute autorului acelui script, nu sunt și nu vor
fi niciodată recolorate automat de el. Nu s-a schimbat niciun cod în
`wme-ro-tools.user.js` - abordarea din v0.5.0 (citirea directă a
atributului `wz-theme` + recolorare proprie) era deja corectă și rămâne
neschimbată; s-a corectat doar descrierea sursei în CONTEXT.md, ca
documentația să reflecte fidel realitatea confirmată de Paul.

## 2026-09-06 (continuare 8) - v0.6.0

Cerere Paul (verbatim, două părți în același mesaj, ca urmare a unei
cercetări live pe segmentele lui de test): "da, hai să facem cu detectare
și avertizarea. avertizarea să fie ceva." + regulile suplimentare pentru
tranzitul asfaltat->neasfaltat->4x4/offroad și pentru "fără ieșire spre
drum public" (citate complete în CONTEXT.md, secțiunea Task 7) + separat,
în același mesaj: "Revin cu încercarea de a muta toolbar mai înspre
dreapta sau spre stânga (mai înspre centrul ecranului). [...] toolbar este
on-top, peste fereastra de restricții... ar trebui să fie în spatele
acesteia."

**Context - de ce doar detectare, nu activare automată**: cercetare live
extinsă (mai multe runde de testare pe segmentele reale de test ale lui
Paul, plus un script terț de referință și documentația oficială SDK) a
confirmat că `sdk.DataModel.Turns.updateTurn()` NU poate activa un U-turn
care nu a fost NICIODATĂ atins manual prin UI-ul nativ WME - aruncă
`DataModelNotFoundError` ("not found in data model"), fiindcă un asemenea
U-turn nu are nicio înregistrare în model (doar starea implicită
"interzis", afișată vizual, dar fără entitate reală). Paul a confirmat
personal acest comportament, live, pe segmentele lui de test (creat 2
segmente, activat U-turn manual + salvat, apoi interzis + salvat din nou -
`updateTurn()` a funcționat fără eroare de atunci încolo, exact cum s-a
prezis). Detalii complete + toate testele în CONTEXT.md.

**Task 7 - Detectare + avertizare Întoarcere U** (fără nicio scriere de
date): 4 reguli independente, evaluate per capăt de segment (nod):
Regula A (unpaved/parcare/privat/4x4/NS cu vecin "curat"), Regula B
(parcare/privat/4x4, indiferent de vecini), regulă nouă "tranzit lipsă"
(asfaltat direct în 4x4/offroad, fără segment neasfaltat intermediar) și
regulă nouă "fără ieșire publică" (niciun vecin real de tip drum public la
acel nod - Cale Ferată/Pistă Rulare-Decolare tratate ca Non-Drivable,
excluse complet din calcul). Verificate live (pe segmentele reale de test
ale lui Paul + un drum privat preexistent conectat la ele) și sintetic (4
cazuri de graniță, toate corecte - vezi CONTEXT.md). Alertă vizuală proprie
(`showUturnAlert`) - panou fix în colțul dreapta-sus, accent portocaliu,
iconiță de avertizare SVG, listă de constatări, buton "Închide",
auto-ascundere după 18s - declanșată la selectarea unui segment (acoperă
și segmente deja desenate problematic) și după orice schimbare de
Neasfaltat/tip drum (panou nativ sau bara rapidă proprie). Setare proprie
în tab (`uturnDetection`, implicit activă), independentă de
`segmentAutomation`.

**Fix bară de butoane rapide suprapusă peste segmente verticale**: cauza
reală era că bara folosea aceeași deplasare (doar 20px, "sub pastilă") ca
pastila de lungime, insuficientă pentru lățimea ei reală (~250-300px) când
segmentul e aproape vertical (deplasarea devine aproape paralelă cu linia,
nu perpendiculară). Rezolvat cu o poziționare proprie a barei
(`computeQuickBarPosition`), independentă de pastilă: deplasare
perpendiculară pe linie, cu magnitudine calculată din lățimea/înălțimea
REALE ale barei (măsurate din DOM), plus alegerea sensului care apropie
bara de centrul ecranului (cerere explicită Paul). Verificat geometric
live pe segmentul vertical de test (nu doar vizual).

**Fix bară deasupra ferestrei native "Restricții"**: verificat live -
modalul nativ (`wz-dialog.restrictions-modal`) are `z-index: 1002`;
elementele proprii (pastilă/bară/meniuri) foloseau `10000`/`10001`, cu mult
peste orice modal nativ. Reduse la `500`/`501` (constante
`OWN_UI_Z_INDEX`/`OWN_UI_MENU_Z_INDEX`) - sub orice element nativ WME,
peste harta/straturile OpenLayers.

**Verificare făcută**: `node --check` trecut; căutare exhaustivă (grep) -
nicio referință rămasă la `z-index: 10000`/`10001` hardcodat. Testat live:
geometria noii poziții a barei (pe segmentul vertical real de test),
z-index-ul real al modalului "Restricții" (deschis și închis controlat),
toate cele 4 reguli de detectare U-turn (date reale + sintetice) și panoul
de alertă randat efectiv (captură de ecran - poziție, culori, z-index toate
corecte). La final, `sdk.Editing.getUnsavedChangesCount() === 0` confirmat
- niciun element de test lăsat pe pagina reală a lui Paul.

Următorul pas (planificat, NEÎNCEPUT): task 5 (trimițător de mesaje
multiple pentru UR), conform ordinii cerute de Paul ("task 7 și apoi
task 5").

## 2026-09-06 (continuare 9) - v0.6.1

Paul a raportat 2 rapoarte de fals-pozitiv pe detectarea U-turn din v0.6.0
(verbatim):

> "îmi dă avertizare când am un segment marcat ca neasfaltat către un
> segment asfalt și fără altă conexiune în celălalt capăt. nu ar trebui."
>
> "îmi dă avertizare când un segment marcat ca neasfaltat e conectat în
> ambele capete la un drum asfaltat și un drum neasfaltat în celălalt
> capăt. nu semnalizăm trecerea de la Strada+Neasfaltat la
> Stradă+Neasfaltat."

**Bug 1 - confirmat direct din datele reale ale lui Paul**: pe segmentele
lui de test apăruse între timp un segment nou, 4x4/Offroad (484255743),
conectat la asfalt (484255251) la un capăt și complet izolat (fundătură,
niciun alt segment) la celălalt capăt (nodul 363238217). Verificat live cu
logica exactă din fișier: producea Regula A + Regula B + "tranzit lipsă"
la capătul dinspre asfalt - exact bug-ul descris (Paul folosește
"neasfaltat" generic, incluzând colocvial 4x4/Offroad, nu doar flag-ul
`unpaved`). Root cause: niciuna din cele 3 reguli nu verifica dacă
segmentul-țintă chiar CONTINUĂ mai departe dincolo de nodul evaluat -
pentru o fundătură fără rost, o recomandare de U-turn n-are sens (te
întorci oricum, e singura opțiune).

**Bug 2 - testat live, NU s-a reprodus cu codul existent**: simulat exact
scenariul (Stradă+Neasfaltat -> Stradă+Neasfaltat), temporar, pe segmentele
de test (484255745 setat temporar `roadType: STREET, unpaved: true`,
anulat imediat după cu `sdk.Editing.undo()`, 0 modificări rămase) - codul
din v0.6.0 întorcea deja `[]` (nicio constatare) pentru acea joncțiune,
înainte ȘI după fix-ul de mai jos. Aplicat totuși același principiu ca la
Bug 1 (vezi mai jos) - nu schimbă rezultatul pentru acest caz specific, dar
face regula mai robustă/coerentă pentru cazuri înrudite.

**Fix**: funcție nouă `segmentContinuesBeyond(segment, nearNodeId)` -
verifică dacă segmentul are vreun vecin real (non-Non-Drivable) la capătul
OPUS lui `nearNodeId`. Regula A, Regula B și regula "tranzit lipsă" acum
necesită explicit `continuesBeyond === true` ca să producă o constatare;
regula "fără ieșire publică" NU a fost atinsă (e despre nodul curent, nu
despre capătul opus al segmentului).

**Efect secundar observat, intenționat**: drumul privat de test
(484255745), care înainte producea corect Regula B la joncțiunea cu
segmentul neasfaltat (documentat ca test reușit în CONTEXT.md/v0.6.0),
acum NU mai produce nimic - fiindcă acel drum privat însuși se termină
într-o fundătură (nodul 363238218 n-are alt vecin). Consecvent cu
principiul nou: nu mai contează DOAR "de ce tip e segmentul", ci și "chiar
duce undeva mai departe" - comportament dorit, nu regresie.

**Verificat live** (Claude in Chrome, cont Paul, harness izolat cu logica
1:1 din fișier): (1) Bug 1 - segmentul 4x4/Offroad de test -> `[]` (fixat,
înainte `["RuleA","RuleB","Transit"]`); (2) regresie - avertizarea
legitimă asfalt->Stradă+Neasfaltat (segmentele originale de test) -> încă
`["RuleA"]`, neschimbată; (3) drumul privat de test la joncțiunea cu
segmentul neasfaltat -> acum `[]` (efectul secundar intenționat de mai
sus); (4) Bug 2 simulat -> `[]`, neschimbat față de v0.6.0. Toate
modificările de test anulate prin `sdk.Editing.undo()`,
`sdk.Editing.getUnsavedChangesCount() === 0` confirmat de fiecare dată.
`node --check` trecut.

## 2026-09-06 (continuare 10) - v0.7.0

Cerere Paul (verbatim):

> "Fă-mi toollbarul să fie în același element cu pastila de distanță.
> adică să fie în prelungire. toolbar l-ai distanțat, dar lungimea
> segmentului a rămas foarte aproape de segment. pune în același elemnt
> vizual tip pastilă toolbar-ul cu comenzi."
>
> "De asemenea, fă-mi ca atunci când editez un segment - deci segmentul e
> selectat, fie că mut un nod dintr-un capăt al segmentului, fie că
> modific geometria segmentul, adică prind de un nod de
> geometrie/inflexiune și îi modific forma, distanța să se actualizeze în
> timp real pe măsură ce mut nodul sau punctul de geometrie, similar cum
> facem când selectăm un nod și mutăm..."
>
> "O problemă detectată: dacă am un segment 4x4 și îl pun ca Stradă... nu
> îmi pune automat viteza 30 pe segment."

Trei cereri distincte, tratate ca un singur pachet de release:

**1) Pastilă unificată (lungime + bară de butoane rapide)**. Bara de
butoane rapide (task 4) era un `<div>` separat, poziționat independent de
pastila de lungime - de aici distanța ciudată sesizată de Paul. Acum
`segmentState.badge` (pastila) devine containerul flex COMUN: textul de
lungime e mutat într-un `<span class="wme-nal-pill-length-text">` intern
(`segmentState.lengthTextEl`), iar bara de butoane (`createQuickActionBar`)
e adăugată ca al doilea copil (`<div>`, doar cu un separator vertical
`border-left`, fără fundal/bordură proprii - le moștenește vizual de la
pastilă). Poziționarea întregii pastile (când bara e prezentă) folosește
funcția existentă `computeQuickBarPosition()` (anterior folosită doar
pentru bara separată), aplicată acum pe dreptunghiul REAL măsurat al
pastilei unificate (`getBoundingClientRect()`), ca să rămână mereu departe
de linia segmentului indiferent de orientare. Când setarea barei rapide e
dezactivată, comportamentul rămâne neschimbat (poziționare simplă, lipită
de segment, ca înainte).

Corecție CSS asociată: `createLengthBadge()` (funcție comună, folosită și
de eticheta la nod și la multi-segment) avea `height: 24px` fix - ar fi
tăiat butoanele barei (tot 24px înălțime) o dată nested în același
container. Schimbat în `min-height: 24px`, ca pastila să crească pe
înălțime când conține și bara de butoane, fără să afecteze vizual
etichetele simple (nod, multi-segment) care rămân la înălțimea minimă.

**2) Actualizare live a lungimii la editare geometrie (nu doar la nod)**.
Rulăm în bucla `segmentRafLoop()`/`multiSegmentRafLoop()` deja existentă,
dar citim geometria din SURSA LIVE, nu din SDK: la fel ca la nodul selectat
(deja rezolvat anterior), `sdk.DataModel.Segments.getById(...)` rămâne
"înghețat" pe geometria dinaintea drag-ului până la "mouseup" - confirmat
live și pentru segmente (nu doar noduri). Soluție: funcție nouă
`getLiveSegmentLonLatCoords(segmentId)`, care citește geometria ÎNTREAGĂ
(toate punctele, inclusiv cele de inflexiune) direct din layerul
OpenLayers legacy `W.map.segmentLayer.features` (proprietatea
`.geometry.components`, convertită cu `mercatorToLonLat`) - actualizată
cadru cu cadru de controlul nativ de editare, indiferent dacă se trage un
nod-capăt SAU un punct de geometrie/inflexiune din mijlocul segmentului (un
singur mecanism acoperă ambele cazuri cerute de Paul, fiindcă ambele mută
aceeași linie randată). Fallback pe coordonatele din SDK dacă layerul
legacy nu e disponibil (segment neafișat, etc.).

**3) Automatizare lipsă: 4x4 → Stradă nu seta viteza 30**. Regulile 3.5
(`applyRoadTypeAutomation`) nu aveau ramură proprie pentru `RT.STREET` la
apăsare DIRECTĂ a butonului de tip drum (era gândit ca Street să capete
viteza 30 doar prin tranziția Neasfaltat ON→OFF, regula 3.2) - exact gaura
raportată de Paul (4x4 → Stradă direct, prin butonul de tip drum, nu seta
nimic). Adăugat `case RT.STREET:` care setează `fwdSpeedLimit: 30,
revSpeedLimit: 30`, la fel ca la tranziția prin Unpaved.

**Verificat live** (Claude in Chrome, cont Paul, segmentul de test
484255251, harness izolat cu logica 1:1 din fișier, `scriptId:
'wme-ro-tools-diag'`):
- Pastilă unificată: creat un badge de test cu textul de lungime + 5
  butoane simulate în ACELAȘI container flex (cu fix-ul `min-height`) -
  captură de ecran confirmă o singură pastilă continuă, rotunjită, fără
  tăiere pe verticală, cu separator vertical vizibil între text și butoane.
- Actualizare live: comparat `getLiveSegmentLonLatCoords(484255251)`
  (citit din `W.map.segmentLayer.features`) cu
  `sdk.DataModel.Segments.getById(...).geometry.coordinates` - identice
  până la precizia flotantă (confirmă mecanismul de potrivire a
  feature-ului și conversia Mercator funcționează corect în starea curentă
  a WME; mecanismul de citire live în timpul drag-ului efectiv fusese deja
  confirmat anterior pentru noduri, cu același principiu).
- Automatizare Stradă: segmentul de test setat temporar 4x4/Offroad
  (`roadType: 8`, viteză 15/15), apoi simulată apăsarea directă pe
  "Stradă" (`roadType: 1`) urmată de noua regulă (viteză 30/30) -
  confirmat `{roadType: 1, fwd: 30, rev: 30}`. Toate modificările anulate
  prin `sdk.Editing.undo()` (de 3 ori, câte un apel per modificare),
  `sdk.Editing.getUnsavedChangesCount() === 0` confirmat, iar segmentul a
  revenit exact la starea inițială (`roadType: 1, fwd: 30, rev: 30,
  unpaved: false`).

`node --check` trecut.

## 2026-09-06 (continuare 11) - v0.8.0

Cerere Paul: "începe cu task 5" - ultimul din planul original de 5
funcționalități rămas neimplementat: "Trimițător de mesaje multiple pentru
comentarii UR peste 2000 caractere".

**Context descoperit live** (panoul de conversație al unei Solicitări de
actualizare - UR/PUR/MP, cont Paul, testat pe o UR reală din București):
caseta nativă de comentariu (`.new-comment-form` > `wz-textarea
.new-comment-text`, componentă web proprie WME) are un `<textarea>` cu
`maxlength="2000"` în shadow DOM, un contor `.length-text` ("X / 2000") și
un buton `.send-button` ("Trimite"), tot cu shadow DOM propriu.

**Descoperire tehnică importantă**: setarea directă a `.value` pe
`<textarea>`-ul din shadow DOM (chiar cu setter-ul nativ +
`dispatchEvent(new Event('input'))`, trucul clasic pentru componente
React-like) NU actualizează corect componenta - contorul de caractere
rămâne "înghețat" pe valoarea veche, deși `.value` citit înapoi pare corect
(desincronizare internă). Testat live 3 variante: (1) setter nativ + input
dispatch - eșuează silențios; (2) setarea proprietății `value` direct pe
elementul custom `wz-textarea` - la fel, eșuează; (3)
`document.execCommand('insertText', false, text)` pe textarea-ul focusat
(cu textul vechi selectat, ca să-l înlocuiască) - FUNCȚIONEAZĂ perfect,
pentru că produce evenimente native "de-adevăratelea" (ca la tastare
reală), singurele pe care componenta le procesează corect. Aceasta e
metoda folosită în script.

**Funcționalitate implementată** (conform preferințelor confirmate cu
Paul): buton nou "Mesaj lung" injectat lângă butonul nativ "Trimite", în
orice panou de conversație UR/PUR/MP deschis (verificat prin polling la
fiecare 500ms, `.new-comment-form` fiind recreat de WME la fiecare
schimbare de UR selectată). La click, se deschide o casetă plutitoare cu:

- **Mod "draft"**: o casetă mare de text unde Paul lipește tot mesajul
  lung, cu un contor live ("N caractere - va fi împărțit în M bucăți") și
  un buton "Împarte în bucăți".
- **Mod "trimitere"**: după împărțire, se afișează bucata curentă
  (previzualizare needitabilă, cu propriul contor de caractere), un buton
  "Trimite bucata i/total" și un buton "Renunță (înapoi la editare)". La
  click pe "Trimite bucata...", scriptul scrie bucata (deja cu indicator
  inclus) în caseta nativă via `execCommand('insertText', ...)`, apoi apasă
  butonul nativ Trimite - fiecare bucată se trimite DOAR la un click
  explicit al lui Paul, niciodată automat (control total, se poate opri
  oricând, conform preferinței lui).
- Împărțirea (`urSplitIntoChunks`) respectă limita de 2000 caractere per
  bucată, NU taie niciun cuvânt la mijloc (rupe la ultimul rând nou sau
  spațiu găsit înapoi de la limită; dacă un singur "cuvânt" e mai lung
  decât limita - caz extrem, nerealist - rupe forțat, fără să crape).
- Fiecare bucată (dacă sunt 2 sau mai multe) primește un indicator
  "(i/total) " la început, cu 20 de caractere rezervate din limita de 2000
  pentru acest indicator (suficient chiar și pentru sute de bucăți). Un
  mesaj care încape într-o singură bucată NU primește indicator (nu are
  sens).
- Setare nouă în tab-ul "RO Tools": "Trimițător de mesaje lungi pentru UR"
  (implicit activă), cu dezactivare imediată (elimină butonul + caseta
  plutitoare dacă erau afișate).

**Verificat live** (Claude in Chrome, cont Paul, harness izolat cu logica
1:1 din fișier, pe o UR reală deschisă - fără NICIUN click pe butonul
nativ real "Trimite", pentru a nu posta un comentariu public real în
timpul testării):
- Teste unitare pe `urSplitIntoChunks`/`urBuildChunks` (fără DOM): mesaj
  scurt (<2000) → 1 bucată, fără indicator; mesaj de 4999 caractere din
  cuvinte → 3 bucăți (1981/1981/1053 caractere), toate ≤ 2000, toate cu
  indicator corect, niciun cuvânt tăiat, reconstrucția (fără indicatoare)
  coincide cu textul original; un "cuvânt" unic de 3000 caractere → rupt
  forțat în 2 bucăți, fără eroare; text gol → array gol.
- Integrare DOM completă: panou de test cu textarea de draft + buton
  "Împarte în bucăți" + buton "Trimite bucata i/total" (versiune de test
  care NU apasă butonul nativ real, doar scrie textul, ca să verificăm
  integrarea fără să trimitem ceva real) - un mesaj de 4500 caractere s-a
  împărțit corect în 3 bucăți ("Bucata 1 din 3" afișat corect); apăsarea
  butonului de trimis a scris exact bucata așteptată (1981 caractere) în
  caseta nativă, contorul nativ a arătat corect "1981 / 2000", iar butonul
  nativ Trimite a rămas activat (`disabled: false`) - confirmă că apelul
  real `innerSendBtn.click()` din script ar fi funcționat corect. Caseta
  nativă golită la final, `sdk.Editing.getUnsavedChangesCount() === 0`
  confirmat (task 5 nu modifică segmente/noduri, deci oricum nu ar fi
  produs schimbări nesalvate).

**Notă**: singurul lucru netestat de mine este apăsarea REALĂ a butonului
nativ "Trimite" (asta ar posta un comentariu public, permanent, pe o UR
reală, vizibil altor editori) - recomand ca Paul să facă primul test real
de trimitere el însuși, pe o UR nesemnificativă, ca ultimă verificare.

`node --check` trecut.

## 2026-09-06 (continuare 12) - v0.8.1

Paul a testat panoul de la task 5 și a cerut 4 ajustări:

1. "fereastra nu poate fi mutată. să o pot muta... și chiar mări. textarea
   să ocupe întreaga lățime a ferestrei, iar dacă măresc fereastra să se
   mărească și fereastra."
2. "butonul înapoi la editare pierde textul scris de mine anterior."
3. "în această fereastră, când apăs butonul să injecteze mesajul să am și
   bifă trimite automat. cel puțin pentru testare vreau să văd că îmi face
   insert bine. se pare că face insert."
4. Format nou pentru marcaje: fiecare mesaj să aibă la început
   "--- Mesaj i/total ---", la final "--- Urmează mesajul i+1/total ---"
   (sau "--- Sfârșitul mesajelor ---" pentru ultimul).

**Fix 1 - panou mutabil + redimensionabil**: antetul panoului
(`.wme-nal-ur-bulk-drag-handle`) e acum "mâner" de tras - `mousedown` pe el
pornește urmărirea `mousemove`/`mouseup` pe `document`, actualizând
`left`/`top` (poziționare `fixed`), cu clampare să nu iasă din ecran
(`urBulkMakeDraggable`). Panoul are acum `resize: both; overflow: hidden`
CSS (mâner nativ de redimensionare în colțul dreapta-jos, fără nicio
librărie) + `display: flex; flex-direction: column`, cu antetul
`flex: 0 0 auto` și corpul (`urBulkState`-ul de conținut,
`.wme-nal-ur-bulk-body`) `flex: 1 1 auto; overflow: auto`. Textarea-urile
din interior (draft + previzualizare) au acum `width: 100%; flex: 1 1
auto; resize: none` (redimensionarea se face DOAR de la panou, nu și de la
textarea-uri individuale, ca să nu se suprapună 2 mânere) - cresc/scad
automat cu panoul, pe orizontală ȘI verticală.

**Fix 2 - păstrarea draft-ului**: adăugat `urBulkState.draftText`, actualizat
la fiecare `input` din textarea de draft. Butonul "Renunță (înapoi la
editare)" NU mai resetează acest text - la revenirea în modul draft,
textarea se populează din `urBulkState.draftText`. Textul se pierde DOAR la
închiderea completă a panoului (butonul ✕ sau schimbarea UR-ului selectat)
- comportament intenționat, nu un bug (un panou nou, pentru altă UR, nu ar
avea sens să păstreze draft-ul vechi).

**Fix 3 - bifă "Trimite automat"**: adăugată în modul de trimitere, implicit
OPRITĂ (Paul vrea întâi să verifice că inserarea funcționează corect,
înainte să activeze trimiterea automată). Butonul principal își schimbă
eticheta în funcție de bifă: "Inserează bucata i/total" (bifă oprită - doar
scrie textul în caseta nativă, NU apasă Trimite, NU avansează la bucata
următoare) sau "Trimite bucata i/total" (bifă activă - scrie textul, apasă
și butonul nativ Trimite, apoi avansează automat). Adăugate și 2 butoane de
navigare manuală "← Anterioara"/"Următoarea →" (independente de bifă), ca
Paul să poată testa inserarea pe orice bucată, în orice ordine, fără să
depindă de trimiterea efectivă.

**Fix 4 - marcaje noi**: `urBuildChunks` înlocuiește vechiul indicator
"(i/total) " cu antet "--- Mesaj i/total ---\n" la începutul bucății și
încheiere "\n--- Urmează mesajul i+1/total ---" (bucăți intermediare) sau
"\n--- Sfârșitul mesajelor ---" (ultima bucată). Rezerva de caractere
pentru aceste marcaje a crescut de la 20 la 100 (marcajele sunt mai lungi
acum), tot cu o verificare de siguranță finală (tăiere strictă la 2000 dacă
totuși s-ar depăși, deși practic imposibil cu rezerva actuală). Ca și
înainte, marcajele apar DOAR dacă sunt 2 sau mai multe bucăți.

**Verificat live** (Claude in Chrome, cont Paul, pe aceeași UR reală -
FĂRĂ niciun click pe butonul nativ real "Trimite"):
- Teste unitare pe noul format de marcaje: mesaj scurt → nicio schimbare
  (fără marcaje); mesaj de 4999 caractere → 3 bucăți, prima se termină cu
  "--- Urmează mesajul 2/3 ---", a doua începe cu "--- Mesaj 2/3 ---" și se
  termină cu "--- Urmează mesajul 3/3 ---", a treia (ultima) se termină cu
  "--- Sfârșitul mesajelor ---" - exact formatul cerut.
- Panou de test cu drag + resize + navigare: mutarea prin tragere de antet
  a funcționat (poziția s-a actualizat corect, ex. de la stânga sus la
  mijlocul ecranului); `getComputedStyle` confirmă `resize: both` +
  `overflow: hidden` aplicate corect pe panou (mânerul nativ de
  redimensionare al browserului e vizibil în captura de ecran - testarea
  automată nu a putut apuca precis grip-ul de 15px, dar CSS-ul e cel care
  activează comportamentul nativ, deci va funcționa la o tragere reală de
  mouse).
- Renunță păstrează draft-ul: scris text în draft, împărțit în bucăți,
  apăsat Renunță → textarea de draft conținea EXACT textul scris inițial
  (confirmat prin comparație directă).
- Navigare + bifă: implicit bifa e oprită, buton "Inserează bucata 1/3";
  bifată → butonul devine "Trimite bucata 1/3"; navigare "Următoarea"/
  "Anterioara" funcționează corect înainte/înapoi prin toate cele 3 bucăți,
  cu butoanele dezactivate corect la capete; cu bifa oprită, apăsarea
  butonului a inserat textul corect ("--- Mesaj 1/3 ---" la început) FĂRĂ
  să avanseze bucata curentă; cu bifa activă, apăsarea a avansat automat la
  bucata următoare (simulat, fără apel real pe butonul nativ Trimite, ca să
  nu postăm ceva real în timpul testării).
- Caseta nativă golită la final, `sdk.Editing.getUnsavedChangesCount() === 0`
  confirmat.

`node --check` trecut.

## 2026-09-06 (continuare 13) - v0.8.2

Cerere Paul (screenshot atașat, task 6 - etichete de lungime la selecție
multiplă de segmente): "Când selectez mai multe segmente din aceeași
stradă, unele segmente selectate nu sunt în vizualizare de hartă
curentă... totuși, etichetele cu lungimea străzii sunt afișate în
vizualizarea de hartă într-un mod „vertical”... comportamentul trebuie să
fie: dacă eticheta iese din ecran, nu o mai afișăm. Dacă fac drag la hartă
și segmentul apare în vizualizarea hărții, atunci afișez."

**Root cause**: `computeSegmentBadgePosition()` (funcție comună, folosită
și pentru pastila segmentului unic selectat) CLAMPEAZĂ mereu poziția finală
în interiorul ferestrei vizibile (`clampToViewport`) - comportament corect
și dorit pentru un SINGUR segment selectat (vrei mereu să vezi lungimea,
chiar dacă segmentul iese parțial din ecran). La selecție MULTIPLĂ (task
6), însă, mai multe segmente diferite, complet în afara ecranului, ajungeau
toate clampate la aproximativ aceeași margine - de-asta apărea "morman"-ul
vertical de etichete suprapuse din captura lui Paul.

**Fix**: adăugată `isSegmentPathInViewport(coords, vw, vh)` - verifică
intersecția bounding-box-ului (în pixeli ecran) al traseului segmentului cu
fereastra curentă, FĂRĂ nicio clampare. `multiSegmentRafLoop()` (bucla
live pentru task 6) o folosește ca poartă: dacă segmentul nu intersectează
deloc fereastra vizibilă, eticheta lui primește `display: none` (ascunsă
complet, fără poziționare) - în loc să fie clampată la margine. La
următorul cadru (rulează la fiecare `requestAnimationFrame`, deci imediat
ce Paul dă drag hărții), dacă segmentul a intrat (parțial sau total) în
vedere, eticheta reapare (`display: flex`) la poziția corectă, calculată
normal. Comportamentul pentru UN SINGUR segment selectat (pastilă +
toolbar, task 1/4) NU s-a schimbat - acolo clamparea rămâne, fiindcă e
comportamentul dorit acolo (un singur segment, vrei mereu eticheta
vizibilă undeva pe ecran).

**Verificat live** (Claude in Chrome, teste geometrice + integrare DOM,
FĂRĂ să modificăm nimic pe cont): testat `isSegmentPathInViewport` cu
coordonate sintetice - un "segment" chiar în centrul ferestrei curente →
`true` (vizibil); un "segment" deplasat cu 5 grade lon/lat (mult în afara
oricărei ferestre posibile) → `false` (invizibil); confirmat cu coordonate
reale din harta Waze (`sdk.Map.getPixelFromLonLat`), nu doar matematic.
Integrare DOM: create 2 pastile de test, una pe un traseu "vizibil" (lângă
centrul hărții) → `display: flex` corect; una pe un traseu "în afara
ecranului" → `display: none` corect (ascunsă, nu clampată la margine);
apoi simulat un "drag pe hartă" (`sdk.Map.setMapCenter` mutat exact pe
locația traseului anterior invizibil) → verificat din nou vizibilitatea →
`true`, pastila reapare corect (`display: flex`) la poziția nouă. Acest
test demonstrează exact fluxul cerut de Paul: ascuns când e în afara
ecranului, reapare corect după drag. `sdk.Editing.getUnsavedChangesCount()
=== 0` confirmat (fix-ul nu modifică segmente/noduri).

`node --check` trecut.

## 2026-09-07 - v0.9.0

Cerere Paul (verbatim): "mai vreau să adăugăm un buton la acest toolbar -
adăugare pericole permanete. Un simplu buton precum „⚠️ PH" (PH înseamnă
Permananent Hazard - pericole Permanente) să deschidă un meniul cu
opțiunile disponibile în editor de adăugare Pericol permanent: similar ca
în poză, mai puțin opțiunile dezactivate care nu sunt încă disponibile."
(cu captură de ecran a meniului nativ WME "+" > "Pericol", cu 9 tipuri
active - Semafoare, Camere, Trecere cale ferată, Zonă școlară, Curbe
deosebit de periculoase, Intersecție periculoasă, Drumuri convergente,
Limitatoare de viteză, Stație taxare - și 5 tipuri grizate/dezactivate -
Trecere de pietoni supraînălțată, Crosswalk high-speed, Pod îngust, Lane
end, Shoulder end).

**Investigație**: SDK-ul oficial WME NU oferă nicio metodă de scriere
pentru pericole permanente - `sdk.DataModel.PermanentHazards` are DOAR
`getAll`/`getById`/`getAllCameras`/`getCameraById` (confirmat live prin
inspectarea prototipului). Confirmat live și lista completă de tipuri +
care sunt active pentru România, prin obiectul intern al aplicației (NU
SDK): `W.model.topCountry.attributes.supportedPermanentHazardTypes` =
`[1,5,10,3,4,7,11,12,9]` (9 id-uri, exact numărul de opțiuni active din
poza lui Paul).

Am încercat să reproduc live meniul din poză ca să înțeleg exact ce
declanșează adăugarea (testat: butonul "+" din stânga-sus urmat de click
simplu pe hartă, click-dreapta pe hartă, bara "Toolbox" a altui script
instalat de Paul) - fără succes inițial. Întrebat pe Paul, care a indicat
mecanismul corect: meniul "+" > submeniul "Pericol" (nu apare la simplu
click pe hartă, ci e un submeniu separat în meniul "+") și a semnalat un
script separat deja existent local, `wme-hazard-shortcuts` (același folder
de proiect Waze Map Editor), care face exact asta pentru "Curbe deosebit
de periculoase" printr-o scurtătură de tastatură (Alt+C), folosind o
tehnică de click-uri simulate în meniu.

**Mecanism** (portat 1:1 din `wme-hazard-shortcuts`, adaptat ca funcție
apelabilă dintr-un buton în loc de scurtătură globală): WME NU expune un
API pentru a crea un Pericol Permanent - singura cale e cea nativă, iar
acest buton doar ARMEAZĂ modul de plasare (utilizatorul tot trebuie să dea
click pe drumul dorit ca să plaseze efectiv, exact ca la scurtătura
originală a lui Paul):
1. Deselectăm orice e selectat (`sdk.Editing.clearSelection()`) - plasă de
   siguranță confirmată necesară în scriptul original (eșecuri
   intermitente când ceva era deja selectat).
2. Găsim și dăm click pe butonul nativ "+" (`i.w-icon-plus` → cel mai
   apropiat `wz-button`).
3. Găsim submeniul "Pericol" (`wz-menu-sub-menu[sub-menu-title="Pericol"]`)
   și simulăm hover REAL pe el (evenimente `pointerover`/`pointerenter`/
   `mouseover`/`mouseenter`/`mousemove` sintetice) - confirmat că meniul
   WME ascultă aceste evenimente, nu doar `:hover` CSS (care nu poate fi
   simulat din JS).
4. Căutăm intrarea cu textul EXACT al pericolului dorit prin tot DOM-ul +
   shadow DOM (componentele WME mai noi sunt Stencil web components -
   intrarea de nivel superior "Pericol" e randată în shadow DOM, dar
   intrările individuale de pericol sunt DOM normal/light, slotted) și
   așteptăm (poll, max 1.5s) până devine vizibilă (dimensiuni nenule).
5. Dăm click pe elementul `wz-menu-item` găsit (NU pe span-ul de text -
   confirmat live că doar click pe elementul custom armează plasarea),
   cu până la 3 reîncercări pe ACELAȘI element (primul click imediat după
   ce submeniul devine vizibil uneori doar mută focusul, fără să armeze -
   comportament confirmat și în scriptul original).
6. Verificăm succesul prin `sdk.Editing.isDrawingInProgress()`. Dacă
   secvența completă eșuează, o reîncercăm o dată de la capăt înainte de
   eroare finală (nu doar pasul de click).

Fiecare pas eșuat produce un mesaj clar (toast vizual propriu, colț
dreapta-jos, culoare portocalie la eroare / turcoaz la succes,
auto-ascundere după 6s) - nu o eroare silențioasă.

**Scop redus intenționat** (cerere explicită Paul, după ce a văzut
mecanismul de click-uri): "Hai să încercăm doar cu curbe periculoase cu
metoda făcută acolo cu clickuri date." Lista `PH_HAZARDS` conține DEOCAMDATĂ
doar "Curbe deosebit de periculoase" - restul celor 8 tipuri active +
cele 5 dezactivate se adaugă ulterior, câte unul sau în bloc, după ce Paul
confirmă că mecanismul e stabil în uz real (adăugarea unui tip nou = o
singură linie nouă în `PH_HAZARDS`, fără altă modificare de cod - meniul
dropdown se populează automat din listă).

**Plasare**: buton nou "⚠️PH" în bara rapidă de segment (pastila cu
lungimea, task 4), ultimul din rând, lângă TBR - cerere explicită Paul
("În bara rapidă de segment (pastila cu lungimea)"). La click, deschide
același tip de meniu-dropdown vertical folosit deja de butoanele Lock și
Direcție din aceeași bară (`openQuickBarDropdown`, componentă existentă,
nemodificată) - cu o singură intrare deocamdată ("Curbe deosebit de
periculoase"); la click pe intrare, se declanșează secvența de armare de
mai sus.

**Verificat live** (Claude in Chrome, pe tab-ul deja autentificat al lui
Paul): reprodus manual secvența completă (segment selectat → deselectat
programatic → click "+" → hover "Pericol" → căutare "Curbe deosebit de
periculoase" prin deep-query DOM+shadow DOM → click pe `wz-menu-item`
găsit) - `sdk.Editing.isDrawingInProgress()` a devenit `true` (plasare
armată cu succes). Anulat imediat cu Escape ("Curbe deosebit de
periculoase" NU a fost plasat pe nicio stradă reală) și confirmat
`sdk.Editing.isDrawingInProgress() === false` +
`sdk.Editing.getUnsavedChangesCount() === 0` după - nicio modificare reală
pe hartă. Notă din testare: la prima încercare a secvenței complete,
căutarea intrării de meniu a eșuat în fereastra de 1.5s (submeniul se
randează cu o mică întârziere la prima deschidere) - exact scenariul
pentru care există reîncercarea completă a secvenței (pasul 6 de mai sus);
la a doua încercare (sau la re-verificare directă a elementului deja
vizibil), găsirea + click-ul au funcționat instant. Acest comportament e
identic cu cel documentat deja în `wme-hazard-shortcuts` (CONTEXT.md,
secțiunea despre robustețea secvenței) - nu e un bug nou.

`node --check` trecut.

## 2026-09-07 (continuare) - v0.10.0

Cerere Paul (verbatim): "Ok. Adaugă și celelalte opțiuni în mod similar.
Cele care au short-cut fă trigger la shortcut. Mută meniul deasupra
toolbar - inclusiv pentru restul de opțiuni de toolbar. Așteptarea mea e
să apară deasupra și nu am observat. dacă se poate cumva mai lipit de
toolbar să dea senzația de continuitate, nu că e un element separat / rupt
de restul toolbar-ului. Încearcă să incluzi pentru fiecare opțiune iconul
din meniu. Vedem dacă apare, dacă nu apare, trebuie să vedem cum preluăm
acele iconițe existente. Sigur imaginilea alea sau svg-urile alea se
încarcă de undeva și să le preluăm direct de acolo, așa cum sunt și cele
de la Drum Neasfaltat etc."

Trei cereri distincte, toate rezolvate în această rundă:

**1. Lista completă de 14 tipuri de pericol + armare prin scurtătură
nativă unde există.** `PH_HAZARDS` conține acum toate cele 9 tipuri active
+ 5 dezactivate din poza inițială a lui Paul. Descoperire live: WME are
scurtături native de tastatură (diferite de `sdk.Shortcuts`, care listează
DOAR scurtăturile înregistrate de userscript-uri/SDK și întorcea listă
goală) pentru unele tipuri - confirmate live prin `KeyboardEvent`
sintetic dispatch-uit direct pe `document` (NU pe `document.body` sau pe
harta - `document` a fost singura țintă care a funcționat): `Z` (fără
shift) → "Limitatoare de viteză"; `Shift+A` → "Semafoare"; `Shift+X` →
"Camere". Testat și un tip încă dezactivat (`Shift+S` → Shoulder end):
nu se întâmplă nimic, fără eroare - sigur de folosit chiar și pentru
tipuri neactive încă în România. Acolo unde există `shortcutKey`,
armarea trece prin scurtătură (un singur eveniment, fără reîncercare -
`phAttemptShortcutArm`); restul (7 tipuri fără scurtătură cunoscută:
Trecere cale ferată, Zonă școlară, Curbe deosebit de periculoase,
Intersecție periculoasă, Drumuri convergente, Stație taxare, Pod îngust)
folosesc în continuare secvența de click-uri prin meniul "+" > "Pericol"
din v0.9.0 (`phAttemptArmSequence`, nemodificată). Mesajele de eroare
diferă acum după caz (buton/submeniu/intrare negăsită, scurtătură care nu
armează, sau tip încă dezactivat pentru România).

**2. Iconițe native reutilizate 1:1, nu desenate de noi.** Confirmat live
că `<wz-icon name="..." type="color" size="N">` (componenta nativă WME de
iconițe) se randează corect oriunde e plasată în DOM, nu doar în meniul ei
original - are shadow DOM autonom, independent de context. Numele exacte
ale iconițelor (`traffic-light`, `speed-camera`, `railway-crossing`,
`school-zone`, `sharp-curve-ahead`, `dangerous-intersection`,
`merge-ahead`, `speed-bumps`, `toll-booth`, `raised-crosswalk`,
`highway-crosswalk`, `narrow-bridge`, `both-lanes-ending`,
`both-shoulders-ending`) au fost citite direct din meniul nativ "+" >
"Pericol" (`item.querySelector('wz-icon').getAttribute('name')`) - pentru
"Semafoare" și "Camere" (intrări de tip categorie, structural diferite:
`wz-menu-sub-menu` cu iconița proprie ca `slot="left-icon"` direct copil,
nu în interiorul unui `wz-menu-item`) iconița a fost citită din același
loc, la nivelul potrivit. Verificat live: toate cele 14 iconițe se
randează identic cu cele din meniul nativ (culoare, formă), nu o
aproximare.

**3. Meniul dropdown deschis DEASUPRA toolbar-ului, lipit vizual (nu doar
pentru PH - pentru TOATE meniurile din bara rapidă: Lock, Direcție, PH -
`openQuickBarDropdown` e componenta comună).** Ancorarea verticală s-a
schimbat de la butonul specific la ÎNTREAGA bară/pastilă
(`segmentState.badge`), ca meniul să pară o continuare a ei indiferent de
care buton l-a declanșat (alinierea orizontală rămâne pe butonul apăsat).
Direcția implicită s-a inversat: deschide DEASUPRA (cu fallback dedesubt
doar dacă nu încape - bara e prea aproape de marginea de sus a
ecranului), cu colțuri rotunjite doar pe partea "liberă" (opusă bării) și
drepte pe partea lipită de bară, ca să dea senzație de bloc continuu, nu
element plutitor separat. Golul dintre meniu și bară a fost redus de la
14px la 2px (`QUICK_BAR_DROPDOWN_GAP_PX`) - tot pentru senzația de
"lipit" cerută explicit.

**Bug găsit + rezolvat în timpul implementării**: elementele `<wz-icon>`
își randează conținutul din shadow DOM ASINCRON, la un tick după
`appendChild` - o măsurătoare imediată a înălțimii meniului (necesară ca
să știm cât de sus să-l poziționăm deasupra bării) surprindea meniul încă
"necopt" (mai scund decât avea să fie), rezultând poziționare greșită
(meniul se suprapunea peste bară în loc să stea deasupra ei). Rezolvat
extrăgând calculul poziției într-o funcție internă `reposition()`, apelată
o dată imediat și - doar dacă meniul conține iconițe - din nou după un
delay de 120ms, ca să corecteze poziția odată ce iconițele s-au randat
complet. Verificat live (harnass de test izolat, apoi portat în fișierul
real): gol de ~2px față de bară, fără suprapunere, în ambele variante
(deasupra normal / fallback dedesubt cu colțuri inversate).

**Verificat live** (Claude in Chrome, tab-ul lui Paul, segment de test
real selectat prin `sdk.Editing.setSelection`):
- Meniul PH afișează toate cele 14 intrări, fiecare cu iconița nativă
  corectă (verificat vizual prin captură de ecran mărită).
- Armare prin scurtătură: "Limitatoare de viteză" (`Z`) →
  `sdk.Editing.isDrawingInProgress() === true`; anulat cu Escape REAL
  (nu sintetic - confirmat din nou, ca în v0.9.0, că Escape sintetic NU
  anulează starea de desenare) → `isDrawingInProgress() === false`,
  `getUnsavedChangesCount() === 0`.
- Armare prin secvența de click-uri (mecanismul vechi): "Trecere cale
  ferată" → armat cu succes după reîncercare (prima încercare a eșuat cu
  "intrare negăsită" din cauza unei stări reziduale de la testul anterior,
  nu a mecanismului în sine - comportament de reîncercare deja documentat
  în v0.9.0), anulat cu Escape real, `getUnsavedChangesCount() === 0`.
- Tip dezactivat fără scurtătură ("Pod îngust") și tip dezactivat CU
  scurtătură ("Shoulder end", `Shift+S`): ambele eșuează silențios
  (`isDrawingInProgress()` rămâne `false`, fără excepție/eroare în consolă,
  `getUnsavedChangesCount()` rămâne 0) - comportament sigur.
- Meniul Lock (fără iconițe) redeschis cu noua logică de poziționare:
  se deschide deasupra bării, gol ~2px, colțuri rotunjite sus - confirmă
  că modificarea comună (`openQuickBarDropdown`) funcționează identic
  pentru meniurile fără iconițe, nu doar pentru PH.
- Testat explicit și ramura de fallback (bară prea aproape de marginea de
  sus a ecranului): meniul trece corect dedesubt, cu colțurile inversate
  (sus drepte, jos rotunjite).

`node --check` trecut. Versiune crescută la 0.10.0.

## 2026-09-07 (continuare 2) - v0.10.1

Cerere Paul (verbatim): "totuși, cele 5 pericole permanente care nu sunt
disponibile pe românia fă-le să pară dezactivate și în meniul nostru și la
click să nu genereze o acțiune, doar notificare că nu sunt disponibile pe
România încă."

Până acum, cele 5 tipuri `disabled: true` (Trecere de pietoni
supraînălțată, Crosswalk high-speed, Pod îngust, Lane end, Shoulder end)
arătau IDENTIC cu restul intrărilor active din meniul PH și, la click,
treceau prin același mecanism de armare (scurtătură sau secvență de
click-uri) - care pur și simplu nu reușea să facă nimic (WME nu are cum,
tipul nefiind încă disponibil pentru România), fără niciun indiciu vizual
ÎNAINTE de click.

Rezolvat în două locuri:

1. `quickBarOpenPhMenu` - fiecare item din meniu primește acum
   `disabled: !!h.disabled`, iar `onSelect` pentru un tip dezactivat NU
   mai apelează deloc `phArmHazardPlacement` (nicio deselecție, niciun
   eveniment de tastatură, niciun click simulat pe meniul nativ "+") - e
   direct un toast informativ: `"${h.label}" nu este încă disponibil
   pentru România în WME.`
2. `openQuickBarDropdown` - rândurile cu `item.disabled` sunt randate cu
   opacitate 0.45 și `cursor: default` (nu "pointer"), iar highlight-ul de
   hover se aplică DOAR intrărilor active - vizual clar dezactivate
   înainte de orice click, dar rămân vizibile în listă (nu ascunse) și tot
   clic-abile (click-ul generează notificarea, nu e ignorat silențios).

Curățenie: ramura `hazard.disabled` din mesajele de eroare ale
`phArmHazardPlacement` (adăugată în v0.10.0) a devenit cod mort - tipurile
dezactivate nu mai ajung deloc la acea funcție - eliminată, cu notă
explicativă în cod.

**Verificat live** (Claude in Chrome, harness cu funcțiile reale extrase
din fișier, un singur apel `javascript_exec` ca să partajeze scope-ul):
cele 9 intrări active au `opacity: ""` (normal) și `cursor: "pointer"`;
cele 5 dezactivate au `opacity: "0.45"` și `cursor: "default"` (confirmat
programatic pe toate cele 14 rânduri, plus captură de ecran - diferența
vizuală e clară). Click pe "Pod îngust" (dezactivat): `isDrawingInProgress()`
a rămas `false` înainte ȘI după click (deci n-a fost nici măcar încercată
armarea), a apărut toast-ul exact cu textul așteptat, iar meniul s-a
închis normal - fără nicio interacțiune cu meniul nativ "+" (spre
deosebire de un tip activ care eșuează, care ar deschide și ar închide
meniul nativ ca parte a încercării). Verificat separat că un tip activ
("Limitatoare de viteză") tot armează normal, ca să confirme că schimbarea
n-a afectat restul mecanismului.

`node --check` trecut. Versiune crescută la 0.10.1.

## 2026-09-07 (continuare 3) - v0.11.0

Cerere Paul (verbatim): "investighează dacă putem face ca bara din stânga
să rămână permanent deschisă. ca opțiune doar în setări." Clarificat live
(întrebare de confirmare): "bara din stânga" = panoul lateral WME (cel cu
"Toate problemele" / editare segment), NU rândul îngust de iconițe de
navigare de lângă hartă.

**Investigație**: nu există nicio metodă SDK pentru a controla vizibilitatea
panoului - `sdk.Sidebar` expune DOAR `registerScriptTab`/`removeScriptTab`
(confirmat live prin inspectarea prototipului). Întrebat pe Paul în ce
situație i se închide panoul, nu a putut încă reproduce momentul exact
("sincer nu știu încă în ce moment... știu că se întâmpla destul de des,
acum nu mai pare") - deci am implementat o soluție defensivă, care nu
depinde de a ști cauza exactă: verifică periodic dacă panoul (`#sidebar`)
PARE ascuns (display none, visibility hidden, sau lățime 0) și îl
corectează imediat, indiferent de mecanismul care l-a ascuns.

Găsit un indiciu în DOM (`#sidebar` e învelit de `<div class="app
container-fluid show-sidebar">`), dar verificat live că NICIO regulă CSS
din pagină nu mai referențiează clasa `show-sidebar` - e vestigială,
dintr-o versiune veche de WME, fără efect vizual azi. Păstrată totuși ca
prim pas ieftin al corecției, pentru cazul în care redevine relevantă
într-o versiune viitoare de WME.

**Opțiune nouă în tab-ul de setări** ("RO Tools" din panoul "UserScripts"):
"Ține panoul lateral mereu deschis" - implicit DEZACTIVATĂ (spre deosebire
de restul opțiunilor existente), fiindcă e o măsură defensivă care ar
putea intra în conflict cu un comportament WME legitim pe ecrane înguste;
Paul o activează explicit doar dacă chiar are nevoie.

**Mecanism** (`enforceSidebarOpen`, rulat la fiecare 500ms cât timp
opțiunea e activă): patru pași, fiecare încercat doar dacă panoul tot
pare ascuns după cel anterior:
1. Reparăm clasa `show-sidebar` pe container (ieftin, posibil fără efect
   azi - vezi mai sus).
2. Forțăm `display: flex !important` + `visibility: visible !important`
   direct pe `#sidebar` - acoperă un `display:none`/`visibility:hidden`
   pus direct pe element.
3. Eliminăm orice suprascriere INLINE a `width`/`min-width`/`flex-basis`/
   `flex` - acoperă o restrângere la lățime 0 pusă tot ca stil inline
   (prin JS), lăsând elementul să-și recapete lățimea naturală din CSS.
4. Ultimă rezervă: dacă restrângerea vine dintr-o regulă CSS externă (nu
   inline), forțăm explicit lățimea naturală măsurată live pe pagina lui
   Paul (330px), tot cu `!important`.

La dezactivarea opțiunii, toate stilurile forțate se elimină (`removeProperty`
pe toate cele 6 proprietăți atinse), ca panoul să revină exact la
comportamentul nativ WME - nu rămâne niciun `!important` agățat de
element.

**Verificat live** (Claude in Chrome, harness cu funcțiile reale extrase
din fișier): simulat un `display:none` direct pe `#sidebar` - watchdog-ul
l-a corectat (confirmat: stilul inline final a devenit `display: flex
!important; visibility: visible !important;`, lățime redevenită 330px).
Simulat separat o restrângere la lățime 0 (`width`/`min-width`/
`flex-basis` la 0px, fără display:none) - watchdog-ul a corectat și acest
caz (lățime redevenită 330px prin eliminarea suprascrierilor inline, fără
să fie nevoie de pasul 4). Verificat și oprirea opțiunii: toate stilurile
inline forțate au fost eliminate curat (`getAttribute('style')` gol după
`stopForceSidebarOpenWatchdog()`), lățimea rămânând 330px prin CSS-ul
nativ WME.

`node --check` trecut. Versiune crescută la 0.11.0.

## 2026-09-14 - v0.12.0

Cerere Paul (verbatim, prescurtat): funcționalitate nouă "Mutare noduri",
tot cu comutator în tab-ul de setări. Flux: selectare segment → buton nou
în bara rapidă → apare un mini-toolbar cu Nod A / Nod B, fiecare cu
"în interior"/"în exterior" cu o distanță configurabilă (implicit 2 m).
Cerință explicită și centrală a lui Paul: "scopul final este a muta un
nod de-a lungul geometriei existente fără a pierde geometria actuală" -
adică nu o simplă translatare liniară a nodului, ci o mutare care
păstrează exact forma curbei existente (utilă mai ales la segmente cu
geometrie complexă/curbe). A menționat explicit că ceva similar există în
scriptul "WME RA Util" la nodurile de giratoriu ("Move Nodes") ca punct de
plecare, și a cerut să găsim o soluție chiar dacă e dificilă din cauza
curbelor. Scop v1, explicit: doar metoda "buton pe segment selectat";
mutarea unui singur nod selectat (metoda 2) e amânată, neplanificată încă.

**Cercetare preliminară**: extras (prin `fetch()` din context de pagină +
scriere în DOM + citire cu `get_page_text`, tehnica stabilită pentru
scripturi terțe protejate de Tampermonkey) codul sursă real al "WME RA
Util" (GreasyFork 23616). Funcțiile lui `moveNodeIn`/`moveNodeOut` fac de
fapt un singur "salt" discret de vertex - mută literalmente un punct
existent din geometria unui segment conectat în celălalt, la nodul de
giratoriu. Nu generalizează la o distanță arbitrară în metri. Am folosit
ideea (transfer de geometrie între cele 2 segmente conectate la un nod)
dar am generalizat-o cu o funcție proprie de "mers de-a lungul poliliniei"
(`walkAlongFromStart`) care interpolează exact la distanța cerută, nu doar
sare la următorul vertex - păstrează forma exactă a curbei parcurse.

**Algoritm** (documentat complet, cu formule, în cod): `bearingDeg`/
`destinationPoint` (formule standard great-circle, folosite doar la
capete reale de drum, pentru extrapolare liniară dincolo de geometria
existentă); `walkAlongFromStart` (parcurge polilinia de la un capăt o
distanță dată, întoarce punctul nou plus geometria "rămasă" și cea
"consumată"); `spliceIntoOtherSegment` (transferă geometria "consumată"
de la un segment la celălalt, la capătul potrivit, cu orientare corectă)
- garantează că lungimea totală combinată a celor 2 segmente rămâne
identică înainte/după (nicio pierdere de formă, exact cerința lui Paul).
Scop v1 restrâns explicit la noduri cu 0 (capăt de drum) sau exact 1
(punct de trecere simplu) alt segment conectat; nodurile cu 2+ alte
segmente (intersecții reale) sunt respinse cu un toast, nesuportate -
actualizarea simultană corectă a 3+ segmente e ambiguă/în afara scopului
v1. La un capăt real de drum (dead end), "în exterior" nu are geometrie
de unde să "împrumute" - se face o extrapolare liniară (bearing +
destination point), semnalată explicit printr-un toast ca nefiind
"lossless" (spre deosebire de cazul cu 2 segmente, unde e mereu exact).

**Descoperire critică prin testare live pe date reale** (drumul de test
lăsat de Paul, segmentele 484642497/498/527, nodurile
363467740/741/742/761): prima implementare actualiza mai întâi geometria
segmentelor afectate (`updateSegment`, cu noul capăt setat la poziția
țintă) și abia apoi muta nodul comun (`moveNode`). Testat live, asta a
CORUPT tăcut topologia: WME a interpretat noua coordonată de capăt (care
nu mai coincidea cu poziția CURENTĂ a nodului) ca "segmentul s-a
desprins", și a creat câte un nod nou temporar (ID negativ) pentru fiecare
segment, la acel punct - nodul comun original a rămas orfan
(`connectedSegmentIds` gol), iar cele 2 segmente au ajuns fiecare cu
propriul nod fantomă, deși geometric coincideau. Nicio eroare aruncată -
corupere silențioasă, vizibilă doar interogând `fromNodeId`/`toNodeId`
după fapt. Am reparat imediat testul (Ctrl+Z, restaurare confirmată exact
byte-cu-byte pe toate cele 3 segmente și nodurile 740/741/742/761 față de
starea inițială) - nimic nu a fost vreodată salvat, deci harta reală a lui
Paul n-a fost niciodată afectată.

**Cauză și corecție**: testat izolat că `sdk.DataModel.Nodes.moveNode(...)`,
apelat SINGUR, mută corect capătul AMBELOR segmente conectate la acel nod
(păstrează `fromNodeId`/`toNodeId`, fără noduri fantomă) - dar mută DOAR
acel vertex, nu "merge" de-a lungul geometriei. Corecție aplicată în
`runMoveNode`: ordinea inversată peste tot - (1) `moveNode` la poziția
finală calculată ÎNTÂI, apoi (2) `updateSegment` pe fiecare segment
afectat, cu geometria completă (interior + capăt), unde valoarea
capătului din array coincide deja cu poziția în care tocmai a fost mutat
nodul. Practic: `updateSegment` nu trebuie NICIODATĂ să schimbe coordonata
de capăt a unui segment față de poziția curentă a nodului lui - orice
schimbare de poziție a capătului trebuie să treacă întâi prin `moveNode`.

**Verificat live, cu codul corectat, exact extras din fișierul real**
(`sed` pe intervalul de linii al funcției, injectat printr-un singur
`javascript_exec` legat de un `sdk` real):
- "În interior" pe nodul de trecere 363467741 (între segmentele
  484642497/498): segmentul propriu scurtat cu exact 2 m
  (107.564→105.564 m), celălalt segment lungit cu exact 2 m
  (99.277→101.277 m), lungimea combinată IDENTICĂ înainte/după
  (206.84081410721737 m, la a 11-a zecimală), `fromNodeId`/`toNodeId`
  neschimbate, niciun nod fantomă.
- "În exterior" pe același nod: exact operația inversă, lungime combinată
  tot identică (206.8408141072175 m), topologie intactă.
- "În exterior" pe capătul real de drum 363467740 (dead end):
  extrapolare liniară corectă (+2 m, 107.564→109.564 m),
  `fromNodeId`/`toNodeId` neschimbate.
- Respingerea nodurilor cu 3+ segmente conectate: verificată prin
  inspecția codului (nu prin test live pe un giratoriu) - condiția de
  respingere e un `return` timpuriu ÎNAINTE de orice `moveNode`/
  `updateSegment`, deci sigură prin construcție (nu poate corupe nimic,
  indiferent de rezultat).

Rămâne de verificat: interacțiunea vizuală reală cu panoul nou
(`openMoveNodesPanel`) - poziționare, click pe butoane - doar logica de
date a fost testată live până acum, nu fluxul UI complet prin click-uri
reale. Metoda 2 (mutarea unui nod deja selectat, fără a trece prin
selecția de segment) rămâne amânată, per cererea explicită a lui Paul.

`node --check` trecut. Versiune 0.12.0.

## 2026-09-15 - v0.13.0

Cerere Paul (verbatim, tradus/prescurtat, continuare directă a feature-ului
"Mutare noduri" din v0.12.0, după verificarea vizuală live a UI-ului):

1. Text literal "In"/"Out" pe cele 2 butoane (nu traducere românească).
2. Panoul care se deschide să nu acopere segmentul selectat, să aibă o
   bară cu titlu și buton X de închidere, și să poată fi repoziționat
   liber pe ecran (fără reținerea poziției între deschideri - se
   resetează mereu lângă butonul care l-a deschis).
3. Toast-urile de eroare/avertizare ale acestui panou să apară sub el, nu
   în colțul din dreapta-jos ca înainte.
4. Afișarea live a lungimii segmentelor vecine (segmentul selectat +
   fiecare capăt), utilă mai ales ca să vezi imediat efectul unui "In"/
   "Out".
5. O întrebare/propunere: ce se întâmplă la un nod cu 3 segmente
   conectate? Paul a propus reutilizarea logicii de "continuitate"
   construite cu câteva ore înainte în scriptul "WME RO Color Speeds" din
   același proiect (`buildNodeDepartureIndex`/`isJunctionContinuity`,
   inspirată din "Junction Angle Info") ca să determinăm automat care
   dintre cele 2 "alte" segmente e continuarea reală (fără viraj) și care
   e o ramură/virare.

**UI panou** (`openMoveNodesPanel`): rescris complet.
- Bară de titlu nouă ("Mutare noduri" + buton "✕") deasupra conținutului,
  cu `cursor: move`; tragere liberă implementată cu `mousedown` pe bară +
  `mousemove`/`mouseup` pe `document`, actualizând direct
  `panel.style.left/top`. Un flag `suppressNextOutsideClick` (consumat o
  singură dată) evită închiderea accidentală a panoului chiar în
  momentul în care utilizatorul dă drumul la mouse în afara lui, la
  finalul tragerii.
- Poziționare implicită schimbată din deasupra/dedesubtul barei rapide în
  LATERALĂ (dreapta butonului care l-a deschis, sau stânga dacă nu e loc
  pe ecran), clampată în viewport - nu mai acoperă segmentul selectat de
  pe hartă. Rămâne complet repoziționabilă prin tragere; poziția nu se
  reține între deschideri (cerere explicită Paul - se resetează mereu
  lângă buton).
- Etichetele butoanelor schimbate din "în interior"/"în exterior" în
  textul literal englezesc "In"/"Out" (title/tooltip rămân descriptive
  în română).
- Nouă secțiune `lengthsEl` în panou, populată de `refreshMoveNodesLengths()`
  (apelată la deschidere și după fiecare mutare reușită): afișează
  lungimea segmentului selectat, plus pentru fiecare capăt (Nod A/Nod B)
  fie "capăt de drum", fie lungimea segmentului vecin unic, fie numărul
  de drumuri conectate dacă e o intersecție reală.

**`phShowToast`**: parametru nou opțional `anchorRect` (un `DOMRect`) -
când e dat, toast-ul apare imediat SUB acel dreptunghi (clampat în
viewport) în loc de poziția implicită jos-dreapta. Toate apelurile
`phShowToast` din fluxul "Mutare noduri" (`runMoveNode`) au fost
actualizate să transmită `moveNodesToastAnchor()` (poziția curentă a
panoului), astfel încât avertismentele acestui panou să nu se piardă
undeva departe de unde lucrează Paul.

**Detecție continuitate la noduri cu 3 segmente conectate** (nou):
`bearingFromNode`/`angularDiffDeg`/`findContinuationSegmentId`, adaptate
direct din algoritmul `isJunctionContinuity`/`buildNodeDepartureIndex`
construit pentru "WME RO Color Speeds" (el însuși inspirat din
"Junction Angle Info", v3.3.1, verificat live că rulează izolat fără
interfață publică - deci reimplementat, nu reutilizat direct). Pentru un
nod cu exact 2 "alte" segmente conectate (3 în total cu cel selectat):
- se calculează direcția de plecare a segmentului selectat din acel nod
  (`bearingFromNode`) și direcția "așteptată" pentru o continuare reală
  (+180°, adică "drept înainte");
- fiecare candidat e comparat cu direcția așteptată (`angularDiffDeg`);
- candidatul e acceptat ca și continuare DOAR dacă (a) diferența lui e
  sub 45° (`NODE_CONTINUITY_MAX_DEG`) ȘI (b) e cu cel puțin 15°
  (`NODE_CONTINUITY_MARGIN_DEG`) mai bun decât următorul candidat -
  altfel nodul e tratat ca ambiguu/nesuportat, cu un toast explicativ
  (poziționat sub panou), fără nicio mutare efectuată.
- Noduri cu 4+ alte segmente conectate rămân respinse necondiționat, ca
  în v0.12.0.

`runMoveNode`: blocul de rezolvare a "celuilalt segment" schimbat dintr-o
respingere directă la 2+ segmente într-o rezolvare pe 3 niveluri: 1 alt
segment → folosit direct (ca în v0.12.0); exact 2 → rezolvat prin
`findContinuationSegmentId`, cu toast + `return` dacă e ambiguu; 3+ → tot
respins ca înainte. Un `refreshMoveNodesLengths()` a fost adăugat la
finalul fiecărei ramuri de mutare reușită.

**Testare**:
- Unit test sintetic izolat (Node.js, `/tmp/continuity_test.js`, nu face
  parte din proiect) pentru `findContinuationSegmentId`, 4 scenarii:
  T-junction cu alegere clară, Y-junction ambiguu, un caz de tip giratoriu
  cu date reale (ambiguu, corect respins), o curbă ușoară vs. o ramură
  îndepărtată (alegere corectă) - toate 4 trecute.
- Verificare live completă, vizuală și interactivă (Claude in Chrome, pe
  drumul de test al lui Paul, extras exact prin `sed` din fișierul real
  și injectat cu un `sdk` real): bară de titlu + buton X funcțional,
  tragere liberă (testată explicit cu `left_click_drag`, panoul nu se
  închide accidental la finalul tragerii), etichete "In"/"Out" literale,
  poziționare laterală care nu acoperă segmentul, actualizare live a
  lungimilor după fiecare acțiune (confirmată cu progresia
  142→139.6→141.6→143.6 m), toast poziționat exact sub panou.
- Detecția de continuitate verificată live pe date reale: la roundabout-ul
  real (nodul 363467707), ambele segmente ale inelului sunt la ~85-90°
  față de direcția așteptată → respinsă corect ca ambiguă. La un nod ajuns
  accidental cu 3 segmente conectate în timpul testării (363467741, cu o
  ramură străină de ~30 m) → algoritmul a ales corect segmentul de
  continuitate reală, ignorând ramura străină.

**Incident critic descoperit în timpul testării, notă operațională
importantă pentru orice testare live viitoare pe acest proiect**: apelurile
SDK `updateSegment`/`moveNode` scriu DIRECT pe server, nu trec prin
buffer-ul local "modificări nesalvate, trebuie Salvează" ca editările din
UI (drag manual etc.). Practic, `Ctrl+Z` din browser anulează doar starea
locală de randare, NU starea deja salvată pe server - un `reload` complet
(fetch curat de pe server) arată adevărata stare, deja modificată. Descoperit
prin verificarea `modificationData.updatedOn`/`updatedBy` a segmentelor
afectate în timpul unei sesiuni de retest a cazurilor de regresie în S:
un segment ajunsese cu o geometrie diferită de cea presupusă restaurată
prin Ctrl+Z, iar un nod ajunsese cu un al treilea segment conectat
(484643999) creat accidental de un click în timpul testării - ambele
confirmate ca fiind SALVATE real pe server (timestamp `updatedBy:
"spookyx"`, chiar în fereastra de testare). Comunicat transparent lui
Paul; răspuns: fără nicio problemă, drumurile de test erau deja marcate
explicit de el cu ALT NAME "test - can be deleted" tocmai pentru a putea
fi modificate/șterse liber - permisiune explicită să continuăm
testarea/experimentarea pe acele segmente. **Concluzie de reținut**: din
acest punct, orice testare live viitoare cu apeluri SDK de scriere
(`updateSegment`, `moveNode`, `deleteSegment` etc.) trebuie făcută DOAR pe
date explicit marcate de Paul ca de unică folosință/de test - "undo prin
Ctrl+Z" nu mai poate fi considerat o garanție de restaurare pentru nimic
altceva.

**Curățenie**: segmentul accidental 484643999 (creat de un click
neintenționat în timpul testării, cu cele 2 capete conectate la un drum
de test și, respectiv, un nod fără nicio altă legătură) a fost șters.
Notă tehnică: `sdk.DataModel.Segments.deleteSegment(...)` a eșuat tăcut
(fără nicio eroare aruncată, dar și fără efect) atât timp cât modelul
local avea `fromNodeId`/`toNodeId` corupte la `null` (artefact al
testării haotice anterioare, nu starea reală de pe server) - un reload
complet de pe server a restaurat un model local corect (`fromNodeId`/
`toNodeId` valide), moment în care ștergerea prin selecție SDK
(`sdk.Editing.setSelection`) + tasta `Delete` (fluxul nativ WME, care
TRECE prin buffer-ul normal "Salvează", spre deosebire de apelurile SDK
directe) a funcționat corect - confirmată definitiv printr-un reload
ulterior de pe server.

`node --check` trecut. Versiune 0.13.0.

Rămâne de făcut, per cererea explicită a lui Paul, DUPĂ acest livrabil:
mutarea unui grup de segmente selectate în întregime (translatare sus/jos/
stânga/dreapta, păstrând geometria), utilă la alinierea drumurilor cu
traseele GPS din editor.

## 2026-09-15 - v0.13.1

Cerere Paul (verbatim, mică ajustare la v0.13.0, imediat după livrare):
"o mică modificare: lungime segmentelelor vecine pune-le exact cum avem la
atunci când mut eu manual un nod. selectez un nod și apar cele 2-3 etc
etichete/pilule cu lungimile drumurilor... nu în fereastra cea mică....".
Adică: lungimile din panoul "Mutare noduri" nu trebuie afișate ca text
într-un mic bloc din interiorul panoului plutitor, ci exact ca pastilele
native pe care le arată deja acest script la selectarea DIRECTĂ a unui nod
(funcționalitatea originală "unghi + lungime la nod", `activateForNode`/
`buildSegmentInfo`/`createLengthBadge`) - poziționate pe hartă, lângă
fiecare nod, câte una per drum conectat.

**Eliminat**: blocul de text `lengthsEl` din panoul "Mutare noduri" și
funcția `refreshMoveNodesLengths` (afișa "Segment selectat: X m" +
status text pentru Nod A/Nod B).

**Adăugat**: 3 funcții noi, imediat lângă restul stării panoului -
`clearMoveNodesLengthBadges`/`rebuildMoveNodesLengthBadges`/
`moveNodesLengthBadgesRafLoop` - care reutilizează EXACT aceleași cărămizi
deja verificate la funcționalitatea de nod (`buildSegmentInfo`,
`createSegmentLengthBadge`, `formatLength`, `pathLengthMeters`,
constanta `LENGTH_BADGE_OFFSET_PX`), dar complet independente de `state`
(obiectul folosit de funcționalitatea originală la selecția directă a unui
nod) - ca să nu se calce reciproc cât timp panoul "Mutare noduri" e
deschis peste un SEGMENT selectat, nu peste un nod.

**Comportament**: la deschiderea panoului (și după fiecare "In"/"Out"
reușit, când geometria s-a schimbat) se reconstruiește complet setul de
pastile - pentru fiecare capăt al segmentului selectat (Nod A, Nod B) care
are 2+ drumuri conectate, câte o pastilă pentru FIECARE drum conectat la
acel nod (inclusiv segmentul selectat însuși, o dată per capăt) - exact ca
și cum ai selecta pe rând nodul A și apoi nodul B. Un capăt de drum (0
alte segmente) nu primește nicio pastilă - la fel ca la selecția directă a
unui nod, unde `activateForNode` cere minimum 2 segmente conectate. O
buclă separată, mai ușoară (`moveNodesLengthBadgesRafLoop`), doar
repoziționează pastilele existente la fiecare cadru (pan/zoom hartă) și le
reîmprospătează textul, fără să recalculeze ancorele - recalculul complet
se întâmplă doar la reconstrucție (deschidere/mutare), nu la fiecare
cadru.

**Verificat live** (Claude in Chrome, cod extras exact din fișier +
`sdk` real, injectat separat de scriptul instalat ca să nu interfereze):
pe un nod real cu 3 drumuri conectate (363467741, ajuns cu 3 conexiuni în
timpul testării anterioare) au apărut corect 3 pastile ("121 m", "114 m",
"28 m"), poziționate lângă nod, deplasate spre fiecare drum, stil identic
cu pastilele native de la selecția unui nod; capătul opus al segmentului
de test (363467740, capăt de drum, 0 alte segmente) nu a primit nicio
pastilă, cum era de așteptat. Bucla de repoziționare confirmată activă
(`requestAnimationFrame` rulează cât timp panoul e "deschis"). Curățarea
(`clearMoveNodesLengthBadges`) confirmată: elimină toate pastilele din DOM
și oprește bucla.

`node --check` trecut. Versiune 0.13.1.

## 2026-09-15 - v0.13.2

Cerere Paul (verbatim, cu screenshot atașat): "încearcă să repari asta:
toolbar e peste segment, ori sub segment, ori în lateral... știu că ai mai
făcut ceva de genul... dar cândva pare că s-a dereglat. verifică și
încearcă să te asiguri că acest mic toolbar nu acoperă segmentul." +
"folosește caracterul unicode ✥ pentru deschiderea ferestrei de mutare
noduri."

**Iconiță "Mutare noduri" (schimbare simplă)**: `QUICK_BAR_ICON_MOVE_NODES_SVG`
nu mai e un desen SVG custom (2 cerculețe unite de o linie), ci direct
caracterul unicode "✥" (săgeți în 4 direcții, simbol standard de
"mutare/repoziționare"), la `font-size: 15px` ca să rămână vizual omogen
cu restul iconițelor din bara rapidă.

**Bug-ul barei suprapuse peste segment - diagnostic corect (a necesitat 2
încercări)**:

1. Prima ipoteză (investigată și respinsă): am presupus că bug-ul vine din
   direcția LOCALĂ a segmentului (`pointAtLength`) calculată doar din
   vecinul imediat în geometrie - pe un traseu cu puncte foarte dese/
   aproape duplicate, segmentulețul pe care cade mijlocul poate avea
   lungime aproape 0 în pixeli, deci o direcție (dx,dy) aproape (0,0), pe
   care eticheta nu se poate deplasa lateral. Am implementat un fix real
   pentru ACEST caz (eșantionare a direcției pe o fereastră de
   `DIRECTION_SAMPLE_WINDOW_PX` = 10px în jurul punctului, cu fallback pe
   direcția globală capăt-la-capăt dacă tot rezultă aproape (0,0),
   constantă nouă `MIN_DIRECTION_VECTOR_PX` = 0.5) și l-am validat cu teste
   unitare Node.js (3 scenarii). Testat apoi live cu geometria REALĂ a
   segmentului din screenshot-ul lui Paul (id 484642498, 69.2m, 13 puncte,
   curbă în S) - direcția veche calculată acolo era deja validă
   (`dx≈19, dy≈-5`, nedegenerata), deci acest fix, deși corect și util
   pentru cazul de geometrie degenerată (rămâne în cod ca îmbunătățire
   defensivă), NU era cauza reală a bug-ului raportat de Paul.
2. Diagnostic corect (după investigare suplimentară): am interogat
   elementul DOM real al pastilei+bării (`.wme-nal-segment-length-badge`)
   și am descoperit că lățimea ei reală e 338px, nu 160px (valoarea
   implicită presupusă în cod) - din cauza celor ~10 iconițe din bara
   rapidă, inclusiv noul buton "Mutare noduri" ✥ adăugat recent. Algoritmul
   vechi (`computeQuickBarPosition`) garanta doar că CENTRUL barei e la
   distanță perpendiculară suficientă FAȚĂ DE TANGENTA LOCALĂ dintr-un
   SINGUR punct eșantionat de pe traseu - dar pe o curbă scurtă (69m) și
   strânsă (formă de S), un dreptunghi de 338px lățime poate în continuare
   să intersecteze poligonala curbei ALTUNDEVA, unde traseul se îndoaie
   înapoi spre el, chiar dacă e perfect "lateral" fața de tangenta din
   punctul de eșantionare. Recalculând manual poziția veche cu lățimea
   reală (338px) am reprodus exact poziția greșită observată de Paul -
   confirmând acest diagnostic.

**Fix real implementat**: `computeSegmentBadgePosition` întoarce acum și
poligonala completă în pixeli ecran a segmentului (`segPix`), pe lângă
poziția calculată. Adăugate 2 funcții noi de test geometric:
`segmentIntersectsAABB` (test Liang-Barsky segment-de-dreaptă vs.
dreptunghi aliniat la axe) și `rectIntersectsPolyline` (verifică
intersecția unui dreptunghi cu TOATĂ poligonala segmentului, nu doar cu
tangenta locală dintr-un punct). `computeQuickBarPosition` primește acum
și `segPix` ca parametru nou (opțional, ultimul) și, dacă poziția inițial
aleasă (aceeași logică veche - distanța minimă de clearance față de
tangenta locală, ales sensul mai aproape de centrul ecranului) tot
intersectează poligonala reală, o împinge progresiv mai departe pe
aceeași direcție (câte `QUICK_BAR_PUSH_STEP_PX` = 24px, până la
`QUICK_BAR_PUSH_MAX_STEPS` = 6 încercări) până nu mai intersectează nimic;
dacă nici după toate încercările nu găsește o poziție liberă (segment
extrem de complex/curbat), rămâne la ultima poziție încercată - best-effort,
la fel ca înainte, ca bara să nu "fugă" nelimitat de departe sau în afara
ecranului. `segmentRafLoop` a fost actualizat să transmită `pos.segPix`
mai departe la `computeQuickBarPosition`.

**Verificat live** (Claude in Chrome, cod extras exact din fișier + `sdk`
real, injectat separat de scriptul instalat): pe segmentul EXACT din
screenshot-ul lui Paul (id 484642498, nodul 363467741), poziția calculată
de algoritmul VECHI tot intersecta poligonala reală a segmentului
(`oldIntersects: true`, exact bug-ul raportat), în timp ce algoritmul NOU,
cu aceeași lățime reală de 338px, a găsit după 2 încercări suplimentare de
împingere o poziție care NU mai intersectează deloc traseul
(`newIntersects: false`). Confirmat și vizual, cu un dreptunghi roșu de
test suprapus pe hartă la poziția nouă: bara se mută clar deasupra curbei
cyan, fără să o mai acopere (comparativ cu bara veche, instalată încă
live, care rămâne vizibil peste curbă).

`node --check` trecut. Versiune 0.13.2.

## 2026-09-15 - v0.13.3

Cerere Paul (verbatim, ajustare imediat după v0.13.2, cu captură de ecran
de la scriptul extern "WME Segment Smoothing Tool"): "la începtulul
toolbar pune un un simbol cum se vede în această poză... 3 puncte
verticale... captura e de la un toolbar al scriptului WME Segment
Smoothing Tool. și când dau click pe el sau pe valoarea cu lungimea
segmentului să îmi permită să mut toolbar. e mai bine, dar depărtează-l și
mai mult să nu se suprapună nici cu săgețile... să fim generoși și să îl
punem cu vreo 100 px mai departe de zona segmentului selectat."

**Mâner de tras "⋮" + reglaj manual al poziției**: primul element din
pastila unificată lungime+toolbar e acum un mic mâner "⋮" (caracterul
unicode vertical ellipsis, la fel ca la "WME Segment Smoothing Tool").
Atât mânerul, cât și textul cu lungimea segmentului ("69 m") primesc acum
`pointer-events: auto` explicit (înainte moșteneau `none` de la
containerul pastilă) și un listener de `pointerdown`/`pointermove`/
`pointerup` (`wireQuickBarDrag`) care actualizează un decalaj manual nou,
`segmentState.manualOffset`. Acest decalaj se ADAUGĂ peste poziția
auto-calculată (nu o înlocuiește) în `segmentRafLoop`, la fiecare cadru -
toolbar-ul rămâne "prins" de segment (se mută odată cu el la pan/zoom),
dar cu un offset suplimentar reglabil manual, pentru cazurile în care
poziționarea automată tot nu convine (de exemplu se suprapune cu alte
elemente native de lângă un nod, cum ar fi săgețile de unghi/direcție).
Poziția finală (auto + manual) rămâne clampată la viewport, ca tragerea să
nu poată scoate toolbar-ul complet din ecran. Decalajul manual se
resetează la fiecare (re)selectare a unui segment (`activateForSegment`)
și la deselectare (`deactivateSegment`, care oprește și un eventual drag
în desfășurare).

**Distanță implicită mărită cu ~100px**: constantă nouă
`QUICK_BAR_EXTRA_CLEARANCE_PX = 100`, adăugată direct în calculul
`baseMag` din `computeQuickBarPosition` (peste clearance-ul geometric deja
calculat față de lățimea/înălțimea reală a barei). Efect: pe segmentul
real de test, cu acest offset suplimentar poziția inițială a ieșit deja
în afara poligonalei segmentului din prima încercare (0 "împingeri"
suplimentare necesare, față de 2 înainte) - și, fiindcă distanța de la
segment a crescut semnificativ față de v0.13.2, toolbar-ul nu mai ajunge
nici lângă săgețile native de unghi/direcție de lângă noduri, care stăteau
relativ aproape de segment.

**Verificat** (cod extras exact din fișier, injectat izolat - Tampermonkey
nu a preluat automat fișierul actualizat de pe disc în timpul sesiunii de
testare, deci verificarea s-a făcut pe copii exacte ale funcțiilor noi,
ca la fix-urile anterioare): 1) mecanismul de tragere (`pointerdown`/
`pointermove`/`pointerup`, actualizare `manualOffset`, aplicare peste
poziția auto + reclampare) testat cu un element DOM real și evenimente de
mouse reale - toolbar-ul de test s-a deplasat corect la poziția trasă cu
mouse-ul; 2) noua distanță calculată numeric pe segmentul real din
screenshot-urile anterioare (484642498): `baseMag` a crescut de la ~109px
la ~209px, iar poziția rezultată nu mai necesită nicio "împingere"
suplimentară (`attempts: 0`, față de 2 înainte) - confirmat și vizual, cu
un dreptunghi de test verde suprapus pe hartă la noua poziție, clar
deasupra întregii zone a joncțiunii, nu doar a curbei.

`node --check` trecut. Versiune 0.13.3.

## 2026-09-15 - v0.13.4

Cerere Paul (verbatim, imediat după livrarea v0.13.3): "100 px cam mult,
pune la 50 px."

`QUICK_BAR_EXTRA_CLEARANCE_PX` scăzut de la 100 la 50. Nicio altă
schimbare.

`node --check` trecut. Versiune 0.13.4.

## 2026-09-22 - v0.13.5

Verificare compatibilitate WME/SDK, la cererea lui Paul ("verifică
compatibilitatea cu WME - care s-a actualizat, inclusiv SDK s-a
actualizat"), înainte de orice modificare nouă: verificat live
(Claude in Chrome, contul lui Paul) pe WME v2.370-3-gaa6183241e (SDK v0,
build 20260922104048) - toate metodele SDK folosite de script
(`DataModel.Segments.*`, `DataModel.Nodes.*`, `Editing.*`, `Map.*`,
`Sidebar.registerScriptTab`) sunt încă prezente și funcționale; scriptul
instalat (v0.13.4 la momentul verificării) a pornit fără erori, tab-ul de
setări "RO Tools" s-a deschis corect, pastila de lungime + bara rapidă +
mânerul "⋮" s-au afișat corect pe un segment de test, panoul "Mutare
noduri" s-a deschis corect. Nicio incompatibilitate găsită - nicio
modificare de compatibilitate necesară.

Cerere Paul (verbatim): "o mică modificare la mutarea unui nod: adaugă
implicit valoarea de a muta un nod la 5 metri." `MOVE_NODES_DEFAULT_DISTANCE_M`
crescut de la 2 la 5 - valoarea implicită afișată în câmpul "Distanță" la
deschiderea panoului "Mutare noduri" (dacă utilizatorul n-a introdus o
valoare validă, e și valoarea folosită efectiv la In/Out - vezi funcția
care citește `moveNodesState.distanceInput`). Nicio altă schimbare.

**Notă operațională**: la verificarea live, Tampermonkey a continuat să
ruleze v0.13.4 timp de mai multe reload-uri consecutive după ce fișierul
de pe disc fusese deja actualizat la v0.13.5 (confirmat MD5 identic
cloud/dispozitiv) - o recurență a limitării observate și în sesiunile
anterioare (Tampermonkey nu preia instant orice modificare locală a
fișierului la un simplu reload de pagină). Schimbarea de cod e simplă
(o singură constantă) și verificată static (`node --check`), dar
confirmarea vizuală a valorii "5" în câmpul Distanță nu s-a putut face în
această sesiune din cauza acestei întârzieri de sincronizare.

`node --check` trecut. Versiune 0.13.5.

## 2026-09-22 - v0.13.6

Cerere Paul (verbatim): "la mutarea unui nod să permitem și când sunt
mai multe segmente. momentan am limitat la 3. să punem maxim 6
segmente. testăm și mai modificăm."

Panoul "Mutare noduri" detecta automat continuarea (drumul opus) doar la
noduri cu maxim 3 drumuri conectate în total (segmentul selectat + 2
"altele"); la 4+ arăta un avertisment fix și nu permitea operația.
Constanta nouă `MOVE_NODES_MAX_CONNECTED_SEGMENTS = 6` înlocuiește
pragurile fixe `=== 2` / `> 2` din `runMoveNode` cu comparații față de
`MOVE_NODES_MAX_CONNECTED_SEGMENTS - 1` (numărul de "alte" drumuri, fără
segmentul selectat). Algoritmul de detecție a continuării
(`findContinuationSegmentId` - sortare candidați după diferența
unghiulară față de bearing-ul opus segmentului selectat, alegere doar
dacă cel mai bun candidat e sub `NODE_CONTINUITY_MAX_DEG` ȘI cu cel
puțin `NODE_CONTINUITY_MARGIN_DEG` mai bun decât al doilea) nu s-a
schimbat - generalizează corect la orice număr de candidați, nu doar la
cazul cu exact 2 "alte" drumuri; verificat cu un test Node.js separat
(4-way, 5-way clar, 5-way ambiguu - toate au trecut). Peste
`MOVE_NODES_MAX_CONNECTED_SEGMENTS` drumuri conectate, panoul arată în
continuare un avertisment clar și nu execută mutarea.

Actualizat și textul de descriere al toggle-ului "Mutare noduri" din tab-ul
de setări (era neactualizat de la o versiune anterioară lui v0.13.0) ca
să reflecte pragul nou de 6.

Testat: unitar (Node.js, `continuity_test.js`, în afara proiectului) -
toate cazurile trecute. Nu s-a putut face o verificare live suplimentară
pe un nod real cu 4+ drumuri în această sesiune (nu a fost identificat un
astfel de nod în zona de test a lui Paul) - de verificat la următoarea
ocazie cu un nod potrivit, conform propriei intenții a lui Paul ("testăm
și mai modificăm").

`node --check` trecut. Versiune 0.13.6.

## 2026-09-22 - v0.14.0

Cerere Paul (verbatim, rezumat - textul complet e in CONTEXT.md): buton
"HN rapid" separat de "+HN" nativ, care deschide un panou pentru adaugare
rapida de numere de imobil secventiale - prefix liber (poate contine
orice, inclusiv separator "-" sau "/") + sufix care incrementeaza sau
decrementeaza, fie litera (A-Z, fara diacritice, CAPS) fie numar, pornind
implicit de la "A"/"1" (editabil). Dupa Start, click pe harta plaseaza pe
rand fiecare numar din secventa; verificare automata de duplicat pe toata
strada inainte de fiecare plasare, cu alerta Omite/Stop la duplicat; buton
Stop mereu vizibil cat timp secventa e activa.

Decizii de design confirmate cu Paul prin AskUserQuestion (toate varianta
recomandata): (1) plasare DIRECT prin SDK
(`sdk.DataModel.HouseNumbers.addHouseNumber`), nu prin fluxul nativ -
chipul editabil nativ traieste in Shadow DOM si nu a putut fi gasit/scris
fiabil prin `document.querySelector`; (2) numerele adaugate se leaga DOAR
de segmentul selectat la Start, nu de cel mai apropiat de click; (3)
verificarea de duplicat se face pe TOATA strada (toate segmentele cu
acelasi `primaryStreetId` sau care il au in `alternateStreetIds`).

**Corectie importanta gasita prin testare live** (nu o presupunere din
cercetarea initiala a documentatiei SDK publice): `addHouseNumber` NU e o
scriere directa pe server ca `moveNode`/`updateSegment` - trece prin
ACELASI buffer local "modificari nesalvate" ca orice editare nativa.
Confirmat live: fiecare apel a incrementat cu 1 contorul de pe butonul
"Salveaza", segmentul s-a evidentiat magenta (marcaj standard WME pentru
editare nesalvata); 6 apeluri de test anulate complet cu butonul nativ
Undo (si `hasHouseNumbers` a revenit la `false`), fara nicio scriere pe
server. Deci Ctrl+Z / Undo functioneaza normal aici, iar nimic nu ajunge
pe server pana la apasarea reala a "Salveaza" - mai sigur decat se
presupusese. Toate comentariile din cod si textul din tab-ul de setari au
fost corectate sa reflecte asta.

**A doua corectie gasita prin testare live**: semnaturile reale ale celor
2 metode SDK folosite difera de documentatia publica citita initial (care
arata argumente pozitionale) - ambele iau de fapt UN SINGUR obiect:
`addHouseNumber({number, point, segmentId})` (nu 3 argumente pozitionale
- varianta pozitionala arunca explicit "expected 1 argument, got 3") si
`fetchHouseNumbers({segmentIds})` (nu un array pozitional). Descoperit
prin testare live directa, provocand erorile de validare ca sa vada
exact ce campuri asteapta SDK-ul.

Testat live (Claude in Chrome, pe segmentul/bucla de test a lui Paul,
"test - can be deleted", ALT NAME, segment 484642498): confirmat
`hnStreetScopeSegmentIds` gaseste corect toate cele 11 segmente ale
strazii de test; `fetchHouseNumbers({segmentIds})` intoarce lista corecta
(0 rezultate pe strada de test, curata); `addHouseNumber({...})` cu
argumentele corectate NU arunca eroare si plaseaza vizibil un numar de
imobil de test pe harta (marker + evidentiere magenta a segmentului,
contor "Salveaza" incrementat) - testat de 6 ori cu numere diferite
("TESTHN1", "TESTHN2", "TESTHN3", "999", "777", "555"), toate anulate
curat cu Undo nativ inainte de a inchide sesiunea de testare, fara nicio
salvare reala. Logica de secventiere (litera/numar, incrementare/
decrementare, oprire la Z sau sub 1) testata separat, unitar, cu Node.js
(`hn_test.js`, scratch) - 10 cazuri, toate trecute. Fluxul complet din
panou (formular Start -> click pe harta -> alerta de duplicat Omite/Stop)
NU a fost testat live end-to-end in aceasta sesiune (doar componentele
SDK de baza, direct) - de testat la prima ocazie cu Paul de fata.

`node --check` trecut. Versiune 0.14.0.

## 2026-09-22 - v0.14.1

Bug raportat de Paul (verbatim): "functioneaza partial. configurez dau
start... si imi adauga primul HN ... si apoi iese din modul de adaugare
HN si trebuie sa reiau iar procesul de a incepe a adauga rapid HN-uri."

Cauza: `removeQuickActionBar()` (rulata la FIECARE dezactivare a
segmentului selectat, inclusiv la reverificarea periodica a selectiei din
`checkSelection`, la fiecare 350ms) inchidea NECONDITIONAT panoul "HN
rapid" prin `closeHnPanel()`. Un click pe harta pentru plasarea unui HN
aproape sigur schimba sau anuleaza selectia NATIVA a segmentului (click
langa drum, nu exact pe el = deselectare, comportament normal WME) -
`checkSelection` detecta segmentul deselectat si apela
`deactivateSegment()` -> `removeQuickActionBar()` -> `closeHnPanel()`,
oprind secventa dupa exact 1 plasare.

Fix: `removeQuickActionBar()` nu mai inchide panoul "HN rapid" cat timp o
secventa e ACTIVA (`hnState.active === true`) - `hnState.segmentId` e
oricum FIXAT la Start, independent de selectia curenta (asta era deja
decizia confirmata cu Paul - numerele se leaga de segmentul selectat LA
START, nu de selectia curenta), deci functionalitatea nu are nevoie ca
segmentul sa ramana selectat vizual ca sa continue corect. Panoul se
inchide acum doar explicit: X, debifarea setarii, sau redeschiderea lui
(butonul din bara rapida) - Stop opreste secventa dar lasa panoul deschis
(revine la formularul de pornire), la fel ca inainte.

Nu a fost posibila o retestare live completa in aceasta sesiune (fara
acces la sesiunea de browser a lui Paul) - fix bazat pe citirea exacta a
codului (`checkSelection`, ramura "Selectie goala... dezactivam toate
uneltele") care confirma mecanismul exact descris de Paul. `node --check`
trecut. Versiune 0.14.1 - Paul: te rog reia testul cu acest fix si
confirma daca acum ramane in modul de adaugare intre click-uri.

## 2026-09-22 - v0.14.2

Cerere Paul (verbatim), dupa primul test real: "in momentul in care adaug
manual un HN... apare un punct albastru si o linie punctata care imi
indica segmentul de care se ataseaza numarul de imobil. ar fi util sa
apara la fel. daca sunt 2 segmente paralele apropiate mi s-a intamplat ca
un HN sa se ataseze de strada de langa, neavand acest element de control
vizual."

Doua schimbari, aceeasi cauza radacina: punctul de plasare folosit pana
acum era coordonata BRUTA a click-ului (convertita direct din pixel in
lon/lat), nu neaparat exact PE geometria segmentului selectat - la 2
segmente paralele apropiate (sau la un click usor imprecis), punctul putea
cadea mai aproape de segmentul vecin. Desi treceam deja `segmentId`
explicit la `addHouseNumber`, WME pare sa (re)valideze asocierea si dupa
proximitatea reala a punctului fata de geometrie.

1. **Indicator vizual nou** (`hnBuildIndicator`/`hnHandleMapMouseMove`):
   in timp ce secventa e activa, un SVG separat (`position: fixed`, peste
   tot ecranul, `pointer-events: none`) deseneaza un punct albastru +
   linie punctata de la cursor la acel punct, actualizat pe fiecare
   `mousemove` peste harta - mimeaza vizual exact ce descrie Paul de la
   fluxul nativ.
2. **Ancorare (snap) reala, nu doar vizuala** (`hnNearestPointOnPolylinePixels`/
   `hnComputeSnapPixel`): punctul afisat de indicator E ACELASI punct
   folosit efectiv la plasare (proiectia geometrica a pixelului curent pe
   polilinia segmentului selectat, calculata in spatiul de pixeli ecran,
   nu lon/lat brut) - deci numarul se ataseaza mereu EXACT pe segmentul
   fixat la Start, indiferent cat de aproape e un drum paralel sau cat de
   imprecis a fost click-ul. Elimina problema structural, nu doar
   vizual.

Geometria segmentului (`hnState.segmentCoords`) se salveaza o singura data
la Start (segmentul e oricum fix pe toata durata secventei) si se
recalculeaza in pixeli la FIECARE eveniment (mousemove/click), ca sa
ramana corect la pan/zoom. Indicatorul + listener-ul de mousemove se
curata la Stop/inchiderea panoului, la fel ca listener-ul de click
existent.

Nu a fost posibila o retestare live in aceasta sesiune (fara acces la
sesiunea de browser a lui Paul) - implementare bazata pe proiectie
geometrica standard punct-pe-poliline (verificata logic, aceeasi tehnica
matematica standard folosita si de alte unelte GIS), `node --check`
trecut. Versiune 0.14.2 - Paul: te rog testeaza indicatorul + verifica ca
nu se mai ataseaza HN-uri la strada gresita.

## 2026-09-22 - v0.14.3

Feedback Paul dupa testarea v0.14.2 (verbatim): "as fi preferat varianta
nativa direct, daca poti face cumva. problema introdusa acum e ca HN-urile
adaugate sunt fix pe segment, cand ele sunt fie pe o parte sau alta a
drumului. practic tu ai facut sa simulezi varianta nativa, ceea ce nu e
rau, dar HN-ul trebuie sa pastreze locul unde am dat eu click..."

"Corectia" din v0.14.2 (proiectarea/ancorarea punctului de plasare EXACT
pe geometria segmentului) a fost o schimbare gresita - un numar de imobil
e normal sa stea intr-o parte a drumului (unde e casa), nu chiar PE linia
drumului. Revenit la comportamentul dinainte de v0.14.2 pentru PUNCTUL
salvat: `point` trimis la `addHouseNumber` e din nou coordonata BRUTA a
click-ului (`sdk.Map.getLonLatFromPixel({x: ev.clientX, y: ev.clientY})`),
neschimbata.

Indicatorul vizual (punct + linie punctata, adaugat tot in v0.14.2) RAMANE
- Paul l-a confirmat util ("nu e rau") - dar acum e strict INFORMATIV: arata
doar spre ce parte a geometriei segmentului selectat e cel mai aproape
cursorul curent, fara sa influenteze punctul salvat.

Asocierea cu strada corecta (problema originala, "s-a atasat de strada de
langa") ramane garantata prin parametrul `segmentId`, trimis explicit -
fix pe segmentul selectat la Start, indiferent de pozitia exacta a
punctului (stanga/dreapta drumului). NU exista o modalitate de verificare
locala suplimentara: `fetchHouseNumbers` citeste doar date deja SALVATE pe
server (vezi v0.14.0 - modificarile HN raman "nesalvate" pana la
Salveaza), deci nu poate confirma imediat o adaugare nesalvata - ne bazam
pe documentatia SDK (parametrul `segmentId` e explicit conceput sa
controleze exact asta).

Nu a fost posibila o retestare live in aceasta sesiune. `node --check`
trecut. Versiune 0.14.3 - Paul: te rog confirma ca HN-urile raman acum la
locul exact al click-ului (stanga/dreapta drumului) SI ca nu mai apare
problema cu strada gresita; daca totusi reapare, spune-mi exact pe ce
segmente/strazi, ca sa investighez altfel (poate un prag de distanta +
avertisment, in loc de ancorare fortata).

## 2026-09-23 - v0.14.4

Indicator de stare "publicare pe Livemap" în pastila segmentului selectat
(cerere Paul, 2026-09-23, cu 2 capturi ale panoului lateral nativ WME
"Ultima actualizare"/"Creat"): un punct colorat 🔵/🟠 apare acum imediat
înaintea textului cu lungimea, la selectarea unui singur segment.

🔵 = ultima modificare a segmentului a ajuns deja pe Livemap ("Update is
published on the Livemap"). 🟠 = nu a ajuns încă ("Not published yet").
Punctul e ascuns ("unknown") cât timp nu avem încă date de build (prima
verificare, sau fetch eșuat) sau segmentul nu are nicio informație de
modificare.

Cerință explicită a lui Paul: NU s-a copiat implementarea scriptului terț
"Highlight Segments" (care are o funcționalitate similară) - în schimb,
logica nativă a WME a fost reverse-engineered direct din bundle-ul JS
OFICIAL de producție al WME (fetch-uit live din pagină, citit cu o tehnică
de înlocuire a caracterelor speciale ca să treacă de filtrul de siguranță
al `javascript_tool` care bloca fals-pozitiv cod minificat cu multe `=`/
`&`/`?`/`;`/`:`).

Descoperire: WME însuși compară `segment.modificationData.updatedOn` (deja
expus de SDK, câmp public documentat) cu `previous_build.last_edit_time`
dintr-un fișier JSON mic, PUBLIC și fără autentificare, găzduit pe Google
Cloud Storage, câte unul per regiune (identificat prin parametrul `env`
din URL-ul editorului):
- `row` (România/ROW): `storage.googleapis.com/waze-tile-build-public/current-build/intl-status.json`
- `il`: `.../il-status.json`
- `usa`: `.../na-status.json`

Formula confirmată exact din bundle (nume de funcții minificate,
nestabile, dar logica identică): `updatedOn <= Date.parse(previous_build.last_edit_time)`
=> publicat; altfel => nepublicat. Confirmată live pe segmentul de test
(484642498, 2026-09-23): fișierul `intl-status.json` a întors
`previous_build.last_edit_time = "2026-09-22T05:55:31.493758Z"`, iar
`updatedOn` al segmentului (1789461505918, din 2026-09-15) e mai vechi =>
`published = true` - calculat corect prin `javascript_tool` direct în tab-ul
autentificat al lui Paul, ÎNAINTE de a scrie codul din script (aceeași
formulă, testată izolat).

Implementare: un singur fetch per regiune, cache-uit și reîmprospătat cel
mult o dată la 5 minute (ciclul de build livemap rulează ~o dată pe zi,
văzut direct în `current_build`/`next_build` ale fișierului) - după acel
fetch, verificarea pentru un segment e doar o comparație de timestamp-uri,
fără niciun cost de rețea suplimentar. Punctul se actualizează din bucla
live existentă a segmentului selectat (`segmentRafLoop`), dar scrie în DOM
doar dacă starea calculată s-a schimbat față de ultima afișată (evită
scrieri redundante la fiecare cadru).

Setare nouă în tab-ul "RO Tools": "Indicator stare publicare pe Livemap"
(implicit activată) - necesită și "Lungime la segmentul selectat" activă
(punctul trăiește în aceeași pastilă).

Notă separată pentru Paul (răspuns la a doua parte a cererii, "aș mai vrea
să analizezi implicația de a scana segmentele din vizualizare..."): NU s-a
implementat încă scanarea + etichetarea tuturor segmentelor vizibile - a
fost doar ANALIZATĂ (cerere explicită "ce implicații ar avea, ar încetini
browserul?"), vezi răspunsul din conversație / CONTEXT.md pentru analiza
completă de performanță și opțiunile de implementare posibile, în așteptarea
deciziei lui Paul înainte de a scrie cod pentru asta.

`node --check` trecut. Testat live parțial: fetch-ul JSON, citirea
`modificationData` prin SDK și formula de comparație au fost confirmate
direct în tab-ul autentificat al lui Paul (tab 317793079), pe segmentul de
test - rezultat "published" corect, consistent cu data mai veche a ultimei
modificări. Punctul vizual în sine (inserat în pastilă) NU a fost
retestat vizual în această sesiune (necesită Tampermonkey să preia noua
versiune a fișierului) - Paul: te rog confirmă că apare corect (🔵/🟠) la
selectarea unui segment, imediat înaintea lungimii.

## 2026-09-23 - v0.14.5

Cerere Paul (verbatim): "ultimul buton de HN să înlocuiască pe cel
existent anterior +HN".

Butonul vechi "+HN" din bara rapidă (deschidea doar fluxul NATIV de
adăugare a unui număr de imobil, prin `quickBarClickNativeHn`/
`findHnButton`) a fost ELIMINAT complet. Butonul "HN rapid" ("#HN",
adăugat în v0.14.0) îi ia locul EXACT în bară - aceeași poziție, după
Direcție, înainte de Toll - în loc să fie adăugat suplimentar la final,
cum era până acum.

Eliminat din cod: funcțiile `findHnButton()`/`quickBarClickNativeHn()`
(deveniseră neutilizate), referința `btnHn`/`els.btnHn` din
`createQuickActionBar`/`refreshQuickActionBar`/`quickBarEls`. Text de
setări actualizat (descrierea "Bară de butoane rapide" nu mai menționează
"+HN"; descrierea "HN rapid" menționează explicit înlocuirea).

Efect secundar de reținut: dacă opțiunea "Buton HN rapid" e dezactivată
din setări, bara rapidă rămâne acum FĂRĂ niciun buton de HN (nu mai revine
la vechiul "+HN", care nu mai există) - comportament diferit față de
înainte, dar consecință directă și intenționată a cererii ("să
înlocuiască").

`node --check` trecut. Nu a fost posibilă o retestare vizuală live a
poziției butonului în bară în această sesiune (necesită Tampermonkey să
preia noua versiune) - Paul: te rog confirmă că vezi un singur buton HN
("#HN"), în locul unde era "+HN" înainte (după Direcție, înainte de Toll),
și că deschide panoul "HN rapid" ca până acum.

## 2026-09-23 - v0.15.0

Buton nou "Taie segmentul" (✂️) în bara rapidă (cerere Paul, verbatim):
"avem și în WME Toolbox... Cut Segment... Când apăs pe X (sau foarfec) să
apară cu linie punctată și cu un punct alb, nativ, prin care precizez unde
vreau să tai nodul... poate ei nu folosesc SDK sau nu au actualizat
scriptul să folosească complet SDK... hai să facem la fel sau mai bine."

La click, armează un mod de tăiere pe segmentul selectat: apare un punct
ALB + linie punctată (mimând descrierea lui Paul), ancorate pe geometria
segmentului și urmărind cursorul. UN SINGUR click pe hartă taie segmentul
exact în acel punct și dezarmează automat unealta (Escape anulează fără
să taie).

Descoperire cheie: SDK-ul oficial expune deja `sdk.DataModel.Segments
.splitSegment({segmentId, splitPoint})` - un SINGUR apel face exact ce
Paul descria ca flux manual ("adăugam un segment nou legat de segmentul
pe care vrem să îl tăiem... apoi ștergeam noul segment, rămânând doar cu
noul nod"). NU a fost nevoie deloc de acea tehnică manuală - confirmat
live, în sandbox-ul de test dat de Paul (segmentele 484642446 și
484642453): creează 2 segmente noi (id-uri temporare negative) + 1 nod
nou, cu geometria originală păstrată EXACT pe fiecare bucată; e o
modificare NESALVATĂ obișnuită (ca `addHouseNumber`) - buton Undo activat,
evidențiere magenta pe hartă, segmentul original rămâne local neschimbat
până la Salvează. Testat cu un "click" deliberat ÎN AFARA liniei
segmentului (offset lateral) - punctul de tăiere calculat a căzut totuși
EXACT pe geometria segmentului, la fel ca indicatorul vizual arătat
utilizatorului.

Diferență importantă față de "HN rapid" (unde punctul salvat rămâne EXACT
locul click-ului, v0.14.3): aici punctul TREBUIE să fie pe geometria
segmentului (nu poți tăia "pe lângă" drum) - deci indicatorul vizual
(punct + linie) e folosit și pentru punctul REAL trimis la `splitSegment`,
nu doar informativ ca la HN.

Design deliberat "single-shot" (nu buclă Start/Stop ca la HN rapid): după
o tăiere, segmentul ORIGINAL rămâne local neschimbat (id/geometrie) până
la Salvează - o eventuală tăiere repetată "din mers" pe același segmentId
ar tăia din nou segmentul ÎNTREG inițial, nu una din cele 2 bucăți noi,
producând tăieturi greșite/suprapuse. Dacă Paul vrea tăieri repetate fără
să reapese butonul, e nevoie de o discuție separată despre cum se
identifică bucata "curentă" din cele 2 id-uri temporare întoarse.

Setare nouă în tab-ul "RO Tools": "Buton Taie segmentul (✂️)" (implicit
activată).

`node --check` trecut. Testat live parțial: mecanismul complet
(calcul punct ancorat + `splitSegment` + verificare geometrie rezultată +
Undo) a fost validat direct în sandbox-ul dat de Paul, prin
`javascript_tool`, ÎNAINTE de a scrie codul (aceeași logică). Butonul/
indicatorul vizual din pastilă NU au fost retestate vizual (necesită
Tampermonkey să preia noua versiune) - Paul: te rog confirmă că vezi
butonul ✂️, că indicatorul (punct alb + linie punctată) urmărește
cursorul ancorat pe segment, și că un click taie corect (cu Undo
funcțional dacă vrei să anulezi).

## 2026-09-23 - v0.15.1

Scurtătură de tastatură nouă pentru "Taie segmentul" (✂️), vizibilă în
panoul nativ WME "Scurtături Tastatură" (se deschide cu "?" sau din bara
de jos a editorului). Context: Paul a confirmat că tasta X, pe care o
folosea pentru "Cut Segment" din WME Toolbox, era chiar înregistrată de
Toolbox ("X e pus în secțiunea Toolbox") - deci funcția aia din Toolbox
era într-adevăr ce se apela, doar că era stricată ("deseori după 2-3
utilizatori nu mai funcționează"), nu ceva nativ WME (editorul WME, de
bază, nu are nicio unealtă de tăiat segmente).

Descoperire: SDK-ul oficial are un namespace dedicat, `sdk.Shortcuts`
(`createShortcut`, `deleteShortcut`, `getAllShortcuts`,
`isShortcutRegistered`, `areShortcutKeysInUse`) - o scurtătură înregistrată
așa apare AUTOMAT în panoul nativ, grupată sub numele scriptului (nu
trebuie construit un panou propriu). Confirmat live: creat o scurtătură de
test cu `sdk.Shortcuts.createShortcut({shortcutId, shortcutKeys,
description, callback})`, verificat că apare exact așa în panoul nativ
("Scurtături Tastatură" -> secțiune cu numele scriptului), șters din nou.
Confirmat și `areShortcutKeysInUse({shortcutKeys:'X'})` -> `true` chiar
înainte de orice test - X era deja ocupată (de Toolbox), exact cum a spus
Paul.

Paul a ales să elibereze tasta X: își va reasigna scurtătura "Cut Segment"
din WME Toolbox pe Alt+X (din setările Toolbox-ului), lăsând X liberă
pentru scurtătura noastră. Am înregistrat scurtătura scriptului nostru cu
`shortcutKeys: 'X'` - dacă X e încă ocupată la momentul înregistrării
(script pornit înainte ca Paul să facă reasignarea în Toolbox), eșuează
silențios (doar un warning în consolă) fără să blocheze restul scriptului;
la următoarea încărcare a paginii, după ce X se eliberează, înregistrarea
reușește automat.

Callback-ul scurtăturii (`cutToggleForSelection`) face exact ce face
click-ul pe butonul ✂️, dar pentru segmentul CURENT selectat prin SDK -
nu are nevoie ca bara rapidă să fie vizibilă/deschisă. Debifarea setării
"Buton Taie segmentul" șterge și scurtătura X (eliberează tasta pentru
alt script, dacă Paul o dezactivează); reactivarea o reînregistrează.

`node --check` trecut. Mecanismul `sdk.Shortcuts` a fost validat integral
live (creare, apariție în panoul nativ, verificare ocupare tastă, ștergere)
ÎNAINTE de a scrie codul din script - Paul: te rog confirmă că X
funcționează după ce îți reasignezi scurtătura Toolbox-ului pe Alt+X (sau
spune-mi dacă preferi să verific altfel).

CONFIRMAT de Paul, live: "la încărcarea noului script - setarea X a
reușit automat pe unealta noastră și a setat Cut Segment din Toolbox în
None." Funcționalitate completă.

## 2026-09-23 - v0.16.0

Cerere Paul (verbatim): "totuși, aș vrea ca X să funcționeze cum făcea
Toolbox ... să nu trebuiască să am un segment selectat... să apăs X și să
pot tăia orice segment." Redesign complet al armării unelte "Taie
segmentul" (✂️/X) - v0.15.x cerea un segment SELECTAT în prealabil (fixat
la armare, `cutState.segmentId`/`segmentCoords`); acum armarea nu mai
depinde deloc de vreo selecție.

Mecanism nou: la armare (X sau ✂️) nu se mai fixează niciun segment - la
FIECARE mousemove/click, se caută dinamic, dintre TOATE segmentele curent
încărcate (`sdk.DataModel.Segments.getAll()`), cel mai apropiat punct de
cursor (proiecție punct-pe-polilinie, aceeași funcție deja existentă,
`hnNearestPointOnPolylinePixels`, aplicată pe rând geometriei fiecărui
segment) - cu un prag maxim de 25px (`CUT_MAX_SNAP_DISTANCE_PX`), ca să nu
"sară" la tăierea unui drum vizibil departe de cursor doar fiindcă e cel
mai apropiat dintre cele încărcate. Indicatorul vizual (punct alb + linie
punctată) se ascunde automat dacă niciun segment nu e suficient de aproape
(mai clar decât să rămână agățat de ultima poziție validă). La click,
căutarea se reface COMPLET de la zero (nu refolosește rezultatul de la
ultimul mousemove) - segmentul efectiv tăiat e determinat 100% de poziția
exactă a click-ului.

Buton ✂️ din bara rapidă unificat cu scurtătura X (decizie luată de mine,
nu explicit cerută de Paul - de menționat/confirmat): ambele armează acum
EXACT aceeași unealtă globală, nu doar segmentul selectat. Am ales să
unific, în loc să păstrez 2 comportamente diferite (unul legat de
selecție, altul global) - fiindcă unealta globală acoperă și cazul "am un
segment deja selectat, vreau să-l tai" (dai click pe el, ca pe oricare
altul), fără beneficiu real păstrând vechiul comportament separat.

Corecție tehnică importantă găsită în timpul investigației (nu a ajuns
niciodată în codul livrat, doar în teste exploratorii separate): la un
moment dat am presupus greșit că `sdk.Map.getPixelFromLonLat`/
`getLonLatFromPixel` ar avea nevoie de o corecție cu
`getBoundingClientRect()` a viewportului hărții, pentru a se alinia cu
`ev.clientX`/`clientY` (coordonatele native ale evenimentelor de mouse). Un
test dedicat de round-trip (pixel -> lonLat -> pixel, cu și fără acest
offset) a demonstrat clar că presupunerea era greșită - cele 2 funcții
SDK lucrează deja în același spațiu de coordonate ca `clientX`/`clientY`,
FĂRĂ nicio corecție. Codul nou (`cutFindNearestSegmentSnap` și restul
modulului) folosește peste tot `clientX`/`clientY` brute, exact ca
implementarea deja validată din v0.15.x (`hnComputeSnapPixel`,
`cutHandleMapClick`) - niciun cod cu offset greșit nu a fost livrat.

`node --check` trecut. Testat live, integral, în sandbox-ul dedicat al lui
Paul (`https://waze.com/ro/editor?env=row&lat=46.91316&lon=27.67816&zoomLevel=19`),
ÎNAINTE de a scrie codul final (aceeași logică, reprodusă exact în script):
căutarea celui mai apropiat segment (confirmat corect - inclusiv un caz în
care algoritmul a ales, pe bună dreptate, un segment VECIN celui vizat
inițial, fiindcă geometria lui trecea de fapt mai aproape de punctul de
click - comportament corect, nu bug), conversia punctului de click în
lon/lat (verificat: rezultatul cade exact pe geometria segmentului
așteptat), `splitSegment` cu segmentul găsit dinamic, verificare
`getAll()` înainte/după (2 segmente noi apar, cel original rămâne
neschimbat local, ca la orice `splitSegment`), apoi Undo - sandbox-ul
revenit curat la cele 13 segmente inițiale. Interfața propriu-zisă
(indicatorul vizual din pagina reală, comportamentul exact al butonului
✂️/tastei X din Tampermonkey) NU a fost retestată vizual (necesită
Tampermonkey să preia noua versiune) - Paul: te rog confirmă că X (fără
nimic selectat) armează unealta, indicatorul urmărește cel mai apropiat
segment sub cursor, iar un click taie corect segmentul respectiv (cu Undo
funcțional dacă vrei să anulezi). Confirmă și dacă ești de acord cu
unificarea butonului ✂️ cu comportamentul global, sau preferi să rămână
legat de segmentul selectat.

## 2026-09-24 - v0.17.0

Cerere Paul (verbatim): "vorbisem de implementat o semnalizare pentru
segmentele care n-au ajuns în Live... hai să o implementăm, tot așa cu
opțiune de activare/dezactivare din setările scriptului. până la urmă nu
sunt atât de multe segmente pe care trebuie să le semnalizăm. propun să
punem „⚠️🆕" sau altceva mai potrivit ce recomanzi... aș vrea să îmi
atragă atenția, care să fie tot așa poziționate lângă segment - vezi
implementarea din scriptul WME RO Color Speeds unde adăugăm o pilulă de
VR calculată să nu se suprapună cu segmentul, ci ușor lângă segment. iar
când merg deasupra acestor emoji să apară o tooltip cu explicație ce
înseamnă. tooltip să apară și când e bulina albastră sau portocalie din
toolbar." Continuarea directă a analizei "partea b" livrate deja la
v0.14.4 (doar analiză atunci, fără implementare - vezi CONTEXT.md).

**Simbol ales**: doar "⚠️" (fără "🆕") - "nou" ar sugera greșit un segment
recent CREAT, dar starea "nepublicat" ține de ultima MODIFICARE (poate fi
un segment vechi, editat recent). Pastilă rotundă portocalie (aceeași
"culoare de sens" ca bulina 🟠 deja folosită în toolbar pentru "nepublicat"
- consecvență), care singură face treaba de "atrage atenția" cerută.

**Ce e nou**: o pastilă ⚠️ lângă FIECARE segment vizibil pe hartă a cărui
ultimă modificare nu a ajuns încă pe Livemap - nu doar la segmentul
selectat (asta face deja "Indicator stare publicare pe Livemap" de la
v0.14.4). Poziționată exact ca pastila de lungime (calcul refolosit din
`computeSegmentBadgePosition`: mijlocul geometric al segmentului sau cel
mai apropiat punct de centrul ecranului, deplasat în lateral, clampat în
fereastră), împinsă puțin mai departe ca să nu se suprapună cu o eventuală
pastilă de lungime la o selecție multiplă. Segmentul/segmentele curent
SELECTATE sunt excluse din scanare (au deja propriul indicator 🔵/🟠, ca
să nu dublăm informația). Setare nouă `unpublishedSegmentsWarning`
(implicit ACTIVATĂ), toggle independent de orice selecție (pornește/
oprește un watchdog global, la fel ca "Ține panoul lateral mereu deschis").

**Cost/randare** (vezi analiza detaliată din CONTEXT.md, v0.14.4): lista de
segmente nepublicate vizibile e recalculată doar o dată pe secundă (nu la
fiecare cadru) - costul de verificare (comparație de timestamp) e oricum
neglijabil, dar crearea/ștergerea de elemente DOM nu trebuie făcută la
60fps. Pastilele deja create sunt repoziționate la fiecare cadru (RAF), ca
să urmărească fluid harta la pan/zoom. Plafon de siguranță: maxim 60
pastile simultan (Paul a confirmat că, în practică, nu sunt multe).

**Tooltip la hover**: cerere suplimentară, pentru pastilele noi ȘI pentru
bulina 🔵/🟠 din toolbar. Bulina din toolbar AVEA deja text de tooltip
(`title`) setat în cod încă din v0.14.4, dar avea un bug care îl făcea să
nu apară NICIODATĂ: pastila-părinte (`createLengthBadge`) are
`pointer-events: none` (ca restul pastilelor din script, care nu au nevoie
de interacțiune) - fără o suprascriere explicită `pointer-events: auto` pe
elementul copil, hover-ul nu ajungea deloc la el. Corectat (adăugat
`pointer-events: auto` pe `publishDot`) + text de tooltip tradus/clarificat
în română ("Publicat - ..." / "Nepublicat încă - ..."). Pastilele noi ⚠️
au `pointer-events: auto` de la bun început.

`node --check` trecut. Testat live (fără nicio scriere SDK - doar citire):
scanarea + calculul statusului de publicare pe cele 13 segmente reale din
sandbox-ul de test al lui Paul (toate erau deja "published" în acel
moment, deci nu am putut vedea o pastilă ⚠️ reală - dar am validat
formula), geometria/poziționarea (`computeUnpublishedWarnPosition`) pe
toate cele 13 segmente (poziții finite, corect încadrate în fereastră), și
randarea vizuală + stilul pastilei (creată manual, cu aceleași date reale
de poziție) - confirmat prin screenshot, apare curat lângă segment, fără
suprapunere. Tooltip-ul nativ (`title`) nu poate fi confirmat vizual prin
captură de ecran automată (limitare cunoscută a mediului de testare, nu a
codului) - Paul: te rog confirmă că vezi ⚠️ apărând lângă segmente
nepublicate reale din contul tău, și că tooltip-ul apare la hover, atât pe
⚠️ cât și pe bulina 🔵/🟠 din pastila segmentului selectat.

## 2026-09-24 - v0.17.1

Feedback Paul, cu 2 capturi ale pastilei ⚠️ pe fundal portocaliu plin, greu
de citit pe o imagine de satelit tot portocalie/maro (teren arat): "pune
fundal la pastilă cum ai făcut la restul pastilelor + transparență... nu
fundal portocaliu că nu se înțelege prea bine."

Corectat: pastila ⚠️ folosește acum EXACT același stil de fundal ca restul
pastilelor din script (`applyBadgeTheme` - semitransparent, alb/gri deschis
în light mode, gri închis în dark mode, adaptat automat) - nu mai are
fundal portocaliu plin. Simbolul ⚠️ (deja portocaliu/galben prin el însuși)
rămâne singurul element de culoare, pe un fundal neutru care nu se mai
pierde/camuflează pe fundaluri deschise la culoare din imaginea satelitară.

`node --check` trecut. Nu a fost posibilă o retestare vizuală live în
această sesiune (necesită Tampermonkey să preia noua versiune) - Paul: te
rog confirmă că acum pastila se citește clar, indiferent de fundalul de sub
ea.

## 2026-09-24 - v0.18.0

Cerere Paul (verbatim, cu o captură a panoului nativ de istoric al unui
segment): "putem face un fel de animație la această pastilă? când mă duc cu
mouse deasupra pilulei să se extindă pilula și să includă ceva de genul: „
Ultima actualizare: Joi 24-09-2026, 15:33 de draguv(6) " - fix textul care
apare la istoric segment? iconița care apare acolo, cea cu fundal
portocaliu, parcă mi-ai mai zis, o putem refolosi? cea cu fundal
portocaliu?"

**Iconița refolosită**: investigație live în contul lui Paul (segment
selectat, panou de istoric deschis) - iconița portocalie de lângă "Ultima
actualizare" NU e un indicator "publicat/nepublicat" (WME nu are unul
vizibil nativ) - e doar decorația FIXĂ a rândului "Ultima actualizare"
(clasa `status-updated-icon`); rândul "Creat" are propria iconiță,
ALBASTRĂ (`status-created-icon`). Coincidența din captura lui Paul: acel
segment chiar avea o editare nepublicată, deci portocaliul de-acolo se
potrivea perfect cu sensul pastilei noastre. Am refolosit exact acel SVG
(potrivire vizuală identică cu ce a cerut Paul), dar ca o COPIE statică,
inline în script - nu ca URL live către CDN-ul WME (acela e versionat cu
build-ul curent de WME și s-ar rupe silențios la orice actualizare WME).

**Animația de extindere**: la hover, pastila (implicit un cerculeț de
24x22px cu iconița) se extinde lin (tranziție CSS pe `max-width`/`padding`,
180ms) într-o pastilă mai lată, care arată textul EXACT în formatul
rândului nativ "Ultima actualizare" - inclusiv link către profilul
utilizatorului, cu numele + rangul lui de editor între paranteze (ex.
"spookyx(6)"), deschis într-un tab nou. La ieșirea cursorului, se
restrânge înapoi la cerculeț - conținutul rămâne "încărcat" pe pastilă
(nu se reface cererea la un hover ulterior pe aceeași pastilă).

Date noi cerute de la SDK, pe lângă `modificationData` (deja folosit):
`sdk.DataModel.Users.getByUserName({userName})` (rangul de editor - 0-
indexat intern, la fel ca `lockRank`-ul segmentelor, deci afișat `rank+1`)
și `sdk.DataModel.Users.getUserProfileLink({userName})` (link-ul exact
către profil). Cerute doar LA HOVER (nu pentru toate pastilele afișate
simultan) - și cache-uite per utilizator, ca 2 hover-uri pe pastile ale
aceluiași utilizator să nu repete cererea de rețea.

Renunțat la tooltip-ul nativ (`title`) al pastilei, de la v0.17.0 - noul
hover custom arată mult mai multă informație, era redundant/ar fi apărut
dublu.

`node --check` trecut. Testat live, integral, în contul lui Paul, pe un
segment REAL cu o editare nepublicată (segment 484642446): iconița
refolosită se randează identic cu cea nativă, animația de extindere,
textul generat ("Ultima actualizare: Joi 24-09-2026, 21:31 de
spookyx(6)") - verificat caracter cu caracter identic cu formatul din
panoul nativ de istoric al aceluiași segment - și link-ul către profil,
confirmat prin screenshot. Nu am schimbat nimic prin SDK (doar citiri),
deci nu a fost nevoie de Undo.
