# WME RO Tools

**Set de unelte pentru Waze Map Editor (WME), făcut pentru comunitatea editorilor Waze din România.**

> ⚠️ **În dezvoltare.** Scriptul e în dezvoltare și testare, destinat comunității Waze din România. Funcțiile se pot schimba de la o versiune la alta și unele pot avea încă erori. Verifică întotdeauna editările înainte de a salva. Problemele și sugestiile sunt binevenite pe [pagina de Feedback de pe Greasy Fork](https://greasyfork.org/ro/scripts/601073-wme-ro-tools/feedback) sau în [GitHub Issues](https://github.com/spookyx-pd/wme-ro-tools/issues).

Interfața e disponibilă în **română și engleză**. Urmează automat limba WME, dar o poți alege și manual (*Auto / Română / English*) din partea de sus a tab-ului de setări. Textele care ajung pe hartă sau în aplicația Waze rămân mereu în română: TTS la viraje, avertizări, insigne românești, separatoarele din răspunsurile UR.

Orice funcție se poate porni sau opri din tab-ul scriptului din panoul **Scripts** al WME. Fiecare opțiune are o descriere scurtă și un link „More…” cu detalii complete.


## Instalare

1. Instalează un manager de userscripturi (de exemplu [Tampermonkey](https://www.tampermonkey.net/)).
2. Instalează scriptul de pe **[Greasy Fork](https://greasyfork.org/ro/scripts/601073-wme-ro-tools)**, care îți dă actualizări automate, sau direct din [`wme-ro-tools.user.js`](https://raw.githubusercontent.com/spookyx-pd/wme-ro-tools/main/wme-ro-tools.user.js).
3. Deschide [Waze Map Editor](https://www.waze.com/ro/editor). Setările sunt în panoul **Scripts**, la tab-ul **RO Tools**.

[English](README.md) · [Changelog](CHANGELOG.md) · [Feedback](https://greasyfork.org/ro/scripts/601073-wme-ro-tools/feedback)

---

## Unelte pentru hartă și segmente

### Lungimi și unghiuri
- **Nod selectat.** Când selectezi un nod cu două sau mai multe segmente, fiecare segment conectat își arată lungimea. Cât timp tragi nodul, unghiurile dintre segmente se văd în timp real.
- **Segment(e) selectat(e).** La un singur segment selectat, lungimea totală apare lângă el și se actualizează în timp real când tragi nodurile sau punctele de geometrie. La mai multe segmente, fiecare își arată lungimea.

### Bara de butoane rapide
Lângă lungimea segmentului selectat apare un rând de iconițe, pe care îl poți muta de mânerul „⋮”. Comută dintr-un click cele mai folosite proprietăți ale segmentului:
- neasfaltat
- faruri obligatorii
- HOV
- nivel de blocare
- direcție
- taxă (toll)
- restricții

Tot aici sunt și uneltele de mai jos.

- **Taie segmentul (✂️, scurtătura `X`).** Armează un mod de tăiere global, fără să fie nevoie de un segment selectat. Un punct și o linie punctată urmăresc mouse-ul și se prind de cel mai apropiat segment încărcat. Un click taie segmentul exact acolo. Tăierea e o modificare nesalvată obișnuită (merge Undo). `Esc` anulează.
- **HN rapid (numere de imobil).** Adaugă numere de imobil secvențiale la fiecare click pe hartă: un prefix liber plus un sufix număr sau literă, crescător sau descrescător. Numărul ajunge pe cel mai apropiat segment al aceleiași străzi. Pornește singur stratul de numere și verifică dublurile pe toată strada înainte de fiecare adăugare.
- **Mutare noduri.** Mută nodul A sau B spre interior sau exterior, de-a lungul geometriei existente, cu o distanță în metri.
- **Automatizare parametri segment.** Când apeși „Neasfaltat” sau un buton de tip de drum, scriptul setează viteza, nivelul de blocare și farurile după regulile comunității.

### Stare publicare pe Livemap
WME îți spune dacă o modificare a ajuns pe Livemap. Scriptul arată în plus cât de *proaspătă* e modificarea, ca să nu „repari” ceva deja reparat, care doar nu ajunsese în aplicație când a raportat utilizatorul. Datele vin din fișierul public de stare a build-urilor Waze, aceeași sursă ca istoricul din WME.

| Culoare | Ce înseamnă |
|---|---|
| 🟠 portocaliu | Nu e încă pe Livemap. Arată dacă modificarea e în build-ul în lucru și când va apărea estimativ. |
| 🟢 verde | Publicată de **ultimul** build. E deja live. |
| 🔵 albastru | Publicată de un build cu până la 3 zile înainte. Modificare recentă. |
| ⚪ gri | Modificare mai veche. |

Starea apare în trei locuri:
- **Segmentul selectat:** o iconiță cu vechimea modificării („21h”, „1d 21h”, „3d”), lângă lungime. Tooltip-ul arată „Editat: …” și „Live: …”, de exemplu „ultima asamblare, de acum 9 ore (Joi 15.10, 05:30)”.
- **Istoricul din panoul lateral:** iconița de la „Ultima actualizare” ia aceeași culoare, iar dedesubt apare un rând cu starea și momentul în care modificarea a ajuns sau va ajunge pe Livemap.
- **Toată harta vizibilă:** o pastilă rotundă lângă fiecare segment portocaliu, verde sau albastru. La hover arată editorul, data modificării și starea pe Livemap.

### Lista avertizărilor salvate oricum
WME spune uneori „S-ar putea să fie ceva în neregulă cu această editare”. Dacă salvezi oricum, avertizările nu se mai pierd. Rămân într-o listă pe sesiune, câte una pe rând, inclusiv cele pe care WME le comasează. Fiecare are un buton „du-mă acolo” care centrează harta pe problemă și selectează segmentul.

---

## Ajutor pentru „Instrucțiuni viraje”
Butoanele apar în fereastra nativă **Instrucțiuni viraje**. Nimic nu ajunge pe hartă până nu apeși **Aplică** din WME.

- **⚡ Implicit** completează insigna și numele local al drumului-țintă ca instrucțiune principală, „»” la *Înspre* și un TTS potrivit. Cere confirmare dacă există deja date.
- **»** și **·** inserează separatorul unde e cursorul. **+ nume local** adaugă numele local al drumului-țintă.
- **🛡 Insigne:** tastezi un cod și primești insigna românească corectă, fără trucul cu segmente „helper”. Coduri: A2, DN1A, E60, DEx12, DJ601, DC43, CB. Poți alege și dintre insignele văzute pe hartă în județul curent.
- **⚠️ Avertizări:** adaugă gabarit înălțime, tonaj maxim sau „doar Bus/Taxi” la *Înspre* și în TTS.
- **Unelte TTS:** refă tot, adaugă principal, adaugă Înspre, șterge, plus **🔊 simulare vocală completă** cu vocea WME („În 800 de metri, virează la dreapta pe …”).
- **Mânere (⋮)** pe fiecare casetă și insignă: le reordonezi în aceeași zonă, iar TTS-ul automat urmează noua ordine.

---

## Unelte pentru Solicitări de actualizare / Probleme de hartă
- **Coordonate GPS clicabile.** Utilizatorii răspund des cu coordonate. Atât forma zecimală (`44.223232, 23.0909034`), cât și grade-minute-secunde (`45°03'19.8"N 26°25'37.8"E`) devin linkuri. Click-ul centrează harta pe punct și afișează un marcaj care pulsează, iar fereastra problemei rămâne deschisă. Pentru România se detectează și coordonatele scrise invers (longitudine întâi).
- **Mesaj lung.** Împarte un răspuns de peste 2.000 de caractere în mai multe bucăți, pe care le trimiți una după alta. Are previzualizare live.
- **Ciorna răspunsului.** Păstrează răspunsul netrimis pentru fiecare UR/MP, chiar dacă se reîncarcă fereastra sau pagina.
- **Rânduri noi vizibile.** Aplicația Waze afișează comentariile fără rânduri noi. La trimitere, scriptul poate înlocui paragrafele și rândurile noi cu separatoare vizibile, cu o previzualizare a ce vede utilizatorul în aplicație.
- **Casetă de răspuns mai mare:** 12 rânduri.
- **Previzualizare poze din linkuri.** Un buton 🖼 după linkurile din conversație deschide poza într-o fereastră în editor (zoom cu rotița, mutare prin tragere, rotire). Merge cu linkuri directe la poze și cu pagini ca imgbb / ibb.co, imgur, postimg. Punctul pus după link e ignorat.

---

## Ajutor pentru sugestiile de hartă
WME permite doar acceptarea sau respingerea unei sugestii în întregime. Scriptul te ajută să răspunzi pe fiecare modificare:
- **📝 Analiză modificări** în fereastra „Sugestie hartă” deschide un panou cu fiecare modificare propusă (valoarea veche tăiată → cea nouă, locul). O marchezi ✔ corectă / ✖ greșită / ↻ o refac eu și scrii explicația.
- **Respinge cu acest mesaj** deschide fereastra de respingere a WME deja completată cu un mesaj simplu, compus din analiză (ajunge la utilizator prin e-mail). Respingerea propriu-zisă e mereu butonul WME.
- **💬 Trimite în chat** deschide chatul WME cu utilizatorul și pune analiza în casetă; tu apeși Trimite. Util și când aprobi sugestia, dar vrei să-i explici ce poate face mai bine.
- **Întoarcerile U** propuse sunt numite clar („Întoarcere U la capătul A/B al …”), nu doar „Update turn direction”.
- **Fereastră de respingere mai mare**, cu lista modificărilor (un click inserează „• etichetă: vechi → nou” la cursor), „Inserează analiza” și „Golește”.
- **Ciornă pe fiecare sugestie.** „Anulează” din WME închide toată fereastra sugestiei; textul, stările și explicațiile revin când o deschizi din nou.
- **Aplică modificările bune.** După respingere, modificările apar într-o listă în dreapta sus (butonul 📝 de lângă Salvează o redeschide). Cele care nu sunt marcate greșite se pot reface cu „Aplică pe hartă”: segment nou, tip drum, nume de stradă (cu nume din jur la alegere), numere de imobil în poziția aleasă de utilizator, neasfaltat, viraje și întoarceri U. Sunt editări nesalvate obișnuite, pe care le verifici și le salvezi. Un număr de imobil pe un drum fără nume îți cere întâi un nume de stradă.

---

## Ajutoare pentru interfață
- **Fereastra „Scurtături Tastatură”:**
  - căutare după numele comenzii sau după tastă;
  - mod „caută după tastă”;
  - filtru pentru comenzile care au tastă;
  - confirmare înainte să iei o tastă folosită deja de altă comandă.
- **Tastele afișate.** Tastele alocate apar lângă elementele din *Straturi hartă* și din meniul **+**. Numele lungi de pericole din meniul + nu mai sunt tăiate.
- **Butoane rapide pentru straturi.** Butoane rotunde în dreapta hărții pentru Locuri Google, imagini din satelit suplimentare, numere de imobil și pericole.
- **Ce e nou.** După o actualizare, o fereastră scurtă arată funcțiile noi. Istoricul complet e în tab-ul de setări.

---

## WME Bug fix (corecturi pentru probleme ale WME)
Unele opțiuni nu adaugă funcții noi, ci ocolesc erori din WME. În tab-ul de setări sunt marcate cu eticheta **„WME Bug fix”**. Pot deveni inutile când Waze repară problema.
- **Numele localității deasupra hărții.** După zoom sau mutarea hărții, WME lasă des doar țara în loc de „Oraș, Județ”. Recalculează localitatea doar din ultimul lot de date, iar dacă lotul nu are segmente, numele se pierde. Scriptul îl reface din segmentele deja încărcate, fără reîncărcarea hărții.
- **Filtrul hărții în Issue Tracker** (oprit implicit). Harta poate arăta toate problemele deschise din zonă (UR, PUR, MP, MS), iar lista din Issue Tracker rămâne filtrată. Se comută din setări, din *Straturi hartă* sau din bifa de sub lista Issue Tracker.
- **Ține panoul lateral deschis** (oprit implicit). Redeschide panoul lateral când se restrânge sau dispare singur.

---

## Texte personalizabile
Textele care ajung pe hartă sau la utilizatorii aplicației Waze sunt implicit în română. Le poți modifica sau traduce în limba ta din **Setări → „Texte personalizabile”**:
- separatoarele din răspunsurile UR;
- marcajele „Mesaj lung”;
- avertizările și TTS-ul de la instrucțiunile de viraj;
- TTS-ul pentru insigna Centurii București;
- frazele din simularea vocală;
- cuvintele de stare și textul opțional de început / sfârșit din mesajul de respingere a sugestiilor.

Câmpul gol păstrează textul implicit. Cu **Copiază JSON / Importă JSON** poți da un set de texte, de exemplu o traducere, altor editori.

---

## Note
- Folosește `GM_xmlhttpRequest` doar ca să verifice pe Greasy Fork dacă există o versiune nouă (politica de securitate a WME blochează cererile directe). Cealaltă cerere externă e către fișierul public de stare a build-urilor Waze (Google Cloud Storage), pentru starea pe Livemap.
- Setările și ciornele stau în `localStorage` al browserului tău.
- Toate modificările trec prin SDK-ul oficial WME și rămân **nesalvate** până apeși Salvează, la fel ca editările manuale.
- Licență: MIT.
