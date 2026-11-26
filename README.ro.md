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
- **Desenarea unui segment nou.** Cât desenezi un drum nou, o pastilă lângă cursor arată lungimea de până atunci, în timp real.

### Deschide un link (🔗 lângă căutare)
Lipești (sau iei din clipboard cu **📋 Lipește**) un permalink WME (www sau beta, orice limbă), un link Google Maps (și linkuri scurte `maps.app.goo.gl`), un link din aplicația Waze / Live Map sau coordonate GPS și mergi acolo **fără reîncărcarea paginii**.
- Fereastra arată ce conține linkul și cât de departe e de vizualizarea ta.
- Pentru un permalink: **▶ Deschide tot** (ca și cum l-ai deschide în browser: locația, obiectele selectate, UR-ul / problema deschisă), **Doar locația**, **Selectează segmentele / nodurile / locul / JB-ul…** (cu zoom cât să se vadă toate) și **Deschide UR-ul / problema**. Obiectele selectate sunt evidențiate cu mov, ca să le vezi și după ce UR-ul deschis le deselectează. Un permalink doar cu coordonate are un singur buton, **📍 Deschide locația**.
- Punctul exact al coordonatelor e marcat pe hartă cu un cerc roșu, care rămâne pe loc când faci zoom.
- Setările straturilor din permalink (`s=…`) și orice alt parametru sunt ignorate.
- Locul de unde ai plecat e memorat pe durata sesiunii: **↩ Înapoi** te duce înapoi acolo.

### Drumuri închise
Ții mouse-ul o clipă pe simbolul roșu al unei închideri (trecerea rapidă peste el nu deschide nimic) și vezi detaliile ei: starea (activă / programată / încheiată / încheiată mai devreme), descrierea, intervalul și durata, sensul (A → B, B → A sau ambele), nodul de început și dacă e închis, detectarea traficului, cine a creat-o și ultima actualizare. Butoane: **✏️ Editează** (selectează segmentul și deschide direct formularul închiderii), **⧉ Duplicat** (începe de acum, cu aceeași oră de sfârșit), **↻ Ziua următoare** și **🗑 Șterge** (două click-uri; se aplică la Salvează).

Dacă aceeași închidere e pusă și pe alte segmente, fereastra o spune („🔗 Aceeași închidere e și pe alte segmente”), iar **Editează**, **Duplicat**, **Ziua următoare** și **Șterge** întreabă întâi unde se aplică: **doar segmentul acesta**, **pe toată strada**, **toate cu aceeași închidere** (aceeași descriere, același interval, același eveniment) sau **tot evenimentul**. Pentru mai multe segmente se folosește fișa comună a WME din tabul „Drumuri închise”; **Șterge** le șterge pe toate deodată, după confirmare (nesalvat, Ctrl+Z anulează). Se iau în calcul doar închiderile din zona încărcată pe hartă.

### Insigna de drum din numele străzii
La un segment selectat a cărui stradă nu are insignă, dar numele începe cu codul drumului, sus în panou apare butonul **🛡 Setează insigna**: DC300 → Drum Comunal „300”, DJ / DN → Drum Județean / Național cu doar numărul, A1 → Autostradă, E60 → Drum European, DEX… → Drum Expres. Se iau în calcul și numele alternative. Ca în dialogul WME, insigna se aplică străzii, deci tuturor segmentelor care o au; e o modificare nesalvată (merge Undo).

### Note de hartă (Map Comments)
- **Titlul pe hartă.** Titlul (subiectul) fiecărei note de hartă apare scris în mijlocul ei, ca numele locurilor. Dacă nota e mai mare decât ecranul, titlul rămâne în partea ei vizibilă. Nu prinde clicul, deci nota rămâne selectabilă.
- **Card la hover.** Ții mouse-ul o clipă pe o notă și un card arată titlul, textul, numărul de comentarii, nivelul de blocare, data expirării și cine a creat sau actualizat nota și când.

Ambele se pot opri din setări.

### Indicator segmente blocate la nivelul 1
O pastilă portocalie mică (lacăt + 1) lângă fiecare segment vizibil blocat la nivelul 1. Ții mouse-ul o clipă pe ea (trecerea rapidă peste ea nu deschide nimic) și se deschide un card în care blochezi segmentul la un nivel mai mare dintr-un click (doar nivelurile până la al tău).

### Avertizare rute nepermise în Junction Box
Când selectezi, creezi sau modifici un Junction Box, o avertizare arată rutele **nepermise** (dinspre ce segment, spre ce segment, de ce), cu ruta desenată pe hartă. După salvare, avertizarea rămâne dacă JB-ul salvat mai are astfel de rute.

### Hartă mai aerisită
- **Iconițe mai mici:** problemele de hartă la jumătate, pericolele permanente puțin mai mici, pinii mari în stil vechi ai camerelor și trecerilor CF la mărimea celorlalte pericole.
- **Semafoarele în fundal:** se desenează sub segmente și nu mai prind clicul, așa că poți selecta segmentul, nodul sau problema de lângă ele. Ține apăsat **Alt** ca să le aduci deasupra și să selectezi unul.

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
- **Toată harta vizibilă:** o pastilă rotundă lângă fiecare segment portocaliu, verde sau albastru. Ții mouse-ul o clipă pe ea (trecerea rapidă peste ea nu deschide nimic) și se deschide un card cu starea pe Livemap, editorul (cu link spre profil), data modificării și linia Livemap, plus butonul **📜 Istoric recent**: ultimele modificări ale segmentului (ce s-a schimbat, cine, când, starea pe Livemap), încărcate doar la cerere. Cardul se închide singur când pleci cu mouse-ul sau dai click în altă parte.

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
- **Mesaj lung.** Împarte un răspuns de peste 2.000 de caractere în mai multe bucăți, pe care le trimiți una după alta. Are previzualizare live. Apare doar în ferestrele Solicitărilor de actualizare / Problemelor de hartă, nu și în panoul unei note de hartă.
- **Ciorna răspunsului.** Păstrează răspunsul netrimis pentru fiecare UR/MP, chiar dacă se reîncarcă fereastra sau pagina.
- **Rânduri noi vizibile** (tot doar în ferestrele UR / MP). Aplicația Waze afișează comentariile fără rânduri noi. La trimitere, scriptul poate înlocui paragrafele și rândurile noi cu separatoare vizibile, cu o previzualizare a ce vede utilizatorul în aplicație. Previzualizarea are bifa „Nu mai arăta în această sesiune”.
- **Casetă de răspuns mai mare:** 12 rânduri.
- **Ora în conversație.** Mesajele din conversația unui UR au data cu ora și minutul (ex. „25 Noiembrie 2026, 20:17”), ca să se vadă când a răspuns fiecare.
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
  - confirmare înainte să iei o tastă folosită deja de altă comandă;
  - **🎹 Tastatură:** o tastatură desenată, cu numele comenzii scris pe fiecare tastă alocată (roșu = mai multe comenzi pe aceeași tastă); Ctrl / Shift / Alt rămân apăsate ca să vezi combinațiile lor, iar în dreapta e lista scurtăturilor combinației. Click pe una o găsește în listă, ca s-o schimbi.
- **Tastele afișate.** Tastele alocate apar lângă elementele din *Straturi hartă* și din meniul **+**. Numele lungi de pericole din meniul + nu mai sunt tăiate. Un cerculeț albastru arată comenzile care au scurtătură în WME, dar fără tastă; click pe el o găsește în fereastra scurtăturilor.
- **Butoane rapide pentru straturi.** Butoane rotunde în dreapta hărții pentru Locuri Google, imagini din satelit suplimentare, numere de imobil și pericole.
- **Căutare locație îmbunătățită.** Click-ul în afara casetei nu mai sare la un rezultat; după ce alegi un rezultat, caseta se golește; rezultatele au sursa (Waze / Google) și distanța; primele sunt străzile și locurile deja încărcate pe hartă („🗺 pe hartă”); un număr caută un ID de segment, iar n.n.n un ID de loc; un link sau coordonate dau „🔗 Deschide linkul”; caseta goală arată ultimele 15 căutări.
- **Sigla Google cu trafic.** Click pe sigla Google din dreapta jos deschide Google Maps la centrul hărții, cu stratul de trafic pornit.
- **📊 Monitor resurse** (link în tab-ul de setări). Cât procesor consumă fiecare funcție a scriptului, cât de ocupat e editorul, memoria, elementele din pagină și obiectele încărcate, cadrele care blochează pagina pe fiecare script și „notificările rămase active” (bucle lăsate de alte scripturi, care încarcă procesorul până reîncarci tabul). **🔬 Analiză 5 s** sau **⏺ Analiză continuă** (o oprești tu; dacă închizi monitorul, jos rămâne un indicator cu „⏹ Oprește”) arată ce script încarcă editorul cât lucrezi.
- **Istoricul segmentului.** Eticheta „Included Sugestie de <editor>” nu mai e tăiată: trece pe două rânduri, iar linkul spre profilul editorului și butonul de chat 💬 se văd și se pot apăsa.
- **Carduri de informații.** Ferestrele de informații ale scriptului (note de hartă, drumuri închise, istoric recent, pastilele de pe hartă) au același aspect de card și stau departe de coloana de butoane a WME din dreapta hărții. Pastilele și notele își deschid cardul abia după ce ții mouse-ul o clipă pe ele.
- **Ce e nou.** După o actualizare, o fereastră scurtă arată funcțiile noi. Istoricul complet e în tab-ul de setări.

---

## WME Bug fix (corecturi pentru probleme ale WME)
Unele opțiuni nu adaugă funcții noi, ci ocolesc erori din WME. În tab-ul de setări sunt marcate cu eticheta **„WME Bug fix”**. Pot deveni inutile când Waze repară problema.
- **Numele localității deasupra hărții.** După zoom sau mutarea hărții, WME lasă des doar țara în loc de „Oraș, Județ”. Recalculează localitatea doar din ultimul lot de date, iar dacă lotul nu are segmente, numele se pierde. Scriptul îl reface din segmentele deja încărcate, fără reîncărcarea hărții.
- **Ține panoul lateral deschis** (oprit implicit). Redeschide panoul lateral când se restrânge sau dispare singur.
- **Vârfuri duplicate la locuri.** Când modifici geometria unui loc (muți un nod sau tragi un nod nou de pe margine), WME poate crea două vârfuri în exact același loc; geometria devine invalidă și salvarea e refuzată cu „geometrie invalidă”. Scriptul verifică locurile cu modificări nesalvate și, dacă găsește vârfuri consecutive identice, arată un card cu **🧹 Curăță** (șterge vârfurile în plus - modificare nesalvată, merge Undo), **Arată locul** și **Ignoră**. Bifa **Elimină automat (doar în sesiunea curentă)** de pe card șterge singure duplicatele noi până reîncarci pagina. Scriptul nu salvează niciodată nimic.
- **Erori la salvare pe viraje.** Când salvarea e refuzată din cauza unui viraj (ex. „Modifying GuidanceMode is allowed only for CS Lanes”), WME nu spune care e virajul. Sub eroare apar segmentele virajului („de pe … spre …”, cu nodul) și butonul **📍 Arată virajul**. La eroarea GuidanceMode apare și explicația: virajul are la Voce „Afișare doar” / „Afișare și voce”, dar săgeata benzii nu mai e „Drept” (WME o recalculează când muți un nod), iar serverul acceptă vocea doar pe benzile care merg drept. Soluția: săgeata pe „Drept” sau Voce pe „Implicit Waze”.
- **Pericole mutate odată cu drumul.** Când muți un nod sau schimbi forma unui segment, WME mută și semafoarele / camerele / pericolele de pe el, dar nu trimite noua lor poziție la server, iar salvarea e refuzată cu „Permanent hazard location is too far from Segment …”. Scriptul trimite mutarea la salvare (doar poziția finală a fiecărui pericol) și arată un mesaj scurt. Nu salvează nimic singur; Undo merge ca de obicei.

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
- Folosește `GM_xmlhttpRequest` (politica de securitate a WME blochează cererile directe) ca să verifice pe Greasy Fork dacă există o versiune nouă, ca să încarce pozele pentru previzualizarea din linkuri și ca să transforme linkurile scurte Google Maps (`maps.app.goo.gl`) în coordonate. Cealaltă cerere externă e către fișierul public de stare a build-urilor Waze (Google Cloud Storage), pentru starea pe Livemap.
- Setările și ciornele stau în `localStorage` al browserului tău.
- Toate modificările trec prin SDK-ul oficial WME și rămân **nesalvate** până apeși Salvează, la fel ca editările manuale. (Excepție: închiderile create sau modificate în formularul WME de închidere se salvează imediat de WME - scriptul doar deschide formularul.)
- Licență: MIT.
