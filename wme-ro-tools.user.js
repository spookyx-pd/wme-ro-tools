// ==UserScript==
// @name         WME RO Tools
// @namespace    https://greasyfork.org/users/5715-spookyx
// @version      0.44
// @name:ro      WME RO Tools
// @description:ro  Unelte pentru Waze Map Editor, pentru comunitatea din România (în dezvoltare/testare): lungimi și unghiuri la segmente/noduri, bară de butoane rapide, stare publicare Livemap, tăiere segmente, numere de imobil rapide, ajutor pentru instrucțiuni viraje, unelte pentru răspunsuri UR, coordonate GPS clicabile și altele. Interfață în română și engleză.
// @description  Waze Map Editor toolkit for the Romanian community (in development/testing): segment & node lengths/angles, quick-action toolbar, Livemap publish status, cut tool, quick house numbers, turn-instruction helper, UR reply tools, clickable GPS coordinates and more. UI in Romanian and English.
// @author       Paul (spookyx)
// @license      MIT
// @homepageURL  https://github.com/spookyx-pd/wme-ro-tools
// @supportURL   https://greasyfork.org/ro/scripts/601073-wme-ro-tools/feedback
// @match        https://www.waze.com/*/editor*
// @match        https://www.waze.com/editor*
// @match        https://beta.waze.com/*editor*
// @exclude      https://www.waze.com/*user/editor/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      update.greasyfork.org
// @connect      greasyfork.org
// @run-at       document-idle
// ==/UserScript==

/* global GM_xmlhttpRequest, GM_info, unsafeWindow */

// v0.43: `@grant GM_xmlhttpRequest` (for the Greasy Fork update check - the
// WME page CSP blocks fetch to greasyfork.org). With a grant the userscript
// manager may run us in a sandbox, so `window` is rebound to the PAGE window
// (unsafeWindow) for the whole script; page globals are always read as
// `window.W`, `window.I18n`, `window.getWmeSdk`.
(function (window) {
  'use strict';

  // Renamed from "wme-node-angle-length" to "WME RO Tools" - now a
  // multitool. Node angle/length badges are the original feature; more
  // tools are added on top over time.
  const SCRIPT_ID = 'wme-ro-tools';
  const SCRIPT_NAME = 'WME RO Tools';
  const SCRIPT_VERSION = '0.44';

  // ---------------------------------------------------------------------
  // Language (v0.41, Paul: bilingual RO / EN UI).
  //
  // Only the INTERFACE is translated (buttons, settings, tooltips, windows,
  // messages). Content that ends up on the map or in the Waze app (turn TTS,
  // "Atenție! ..." warnings, Romanian road shields, UR reply separators)
  // stays Romanian - it is meant for Romanian drivers.
  //
  // Chosen once at load: the "language" setting ('auto' | 'ro' | 'en');
  // 'auto' follows the WME language from the URL ("/ro/editor" -> ro,
  // anything else -> en). Changing it needs a page reload.
  // `L(ro, en)` picks the string for the current language.
  // ---------------------------------------------------------------------
  const LANG = (() => {
    let pref = 'auto';
    try {
      const saved = JSON.parse(window.localStorage.getItem('wme-ro-tools-settings') || '{}');
      if (saved && (saved.language === 'ro' || saved.language === 'en')) pref = saved.language;
    } catch (e) {
      // no storage - auto
    }
    if (pref !== 'auto') return pref;
    return /^\/ro(?:[-_/]|$)/i.test(window.location.pathname) ? 'ro' : 'en';
  })();
  const L = (ro, en) => (LANG === 'ro' || en === undefined ? ro : en);

  // ---------------------------------------------------------------------
  // Customizable content texts (v0.42, Paul: the Romanian texts that end up
  // on the map / in UR replies can be personalized - or translated into
  // another language). Defaults are Romanian. Stored in
  // `settings.customTexts` ({ key: text }); an empty value = default.
  // Read through `CT(key)` every time, so changes apply without reload.
  // `{v}` = value, `{i}` / `{n}` = message number / total.
  // ---------------------------------------------------------------------
  const CUSTOM_TEXT_DEFS = [
    { group: 'ur', key: 'ur.paragraph', def: '⠀━◆━⠀', label: L('Separator paragraf (rând gol)', 'Paragraph separator (blank line)') },
    { group: 'ur', key: 'ur.line', def: '⠀-◇-⠀', label: L('Separator rând nou', 'Line break separator') },
    { group: 'ur', key: 'ur.msgHeader', def: '--- Mesaj {i}/{n} ---', label: L('Mesaj lung: antet bucată', 'Long message: part header') },
    { group: 'ur', key: 'ur.msgNext', def: '--- Urmează mesajul {i}/{n} ---', label: L('Mesaj lung: „urmează”', 'Long message: "next part"') },
    { group: 'ur', key: 'ur.msgEnd', def: '--- Sfârșitul mesajelor ---', label: L('Mesaj lung: final', 'Long message: end') },
    { group: 'ti', key: 'ti.height.chip', def: '⚠️H.max. = {v}m⚠️', label: L('Gabarit: caseta din Înspre', 'Height: Towards chip') },
    { group: 'ti', key: 'ti.height.tts', def: '... Atenție! Gabarit înălțime {v} metri', label: L('Gabarit: TTS', 'Height: TTS') },
    { group: 'ti', key: 'ti.weight.chip', def: '🚛⚠️ {v} t max ⚠️🚛', label: L('Tonaj: caseta din Înspre', 'Weight: Towards chip') },
    { group: 'ti', key: 'ti.weight.tts', def: '... Atenție! Maxim {v} tone', label: L('Tonaj: TTS', 'Weight: TTS') },
    { group: 'ti', key: 'ti.busTaxi.chip', def: '⚠️⛔Except.🚌Bus🚕Taxi⚠️', label: L('Bus/Taxi: caseta din Înspre', 'Bus/Taxi: Towards chip') },
    { group: 'ti', key: 'ti.busTaxi.tts', def: '... Atenție! Interzis cu excepția Bus, Taxi', label: L('Bus/Taxi: TTS', 'Bus/Taxi: TTS') },
    { group: 'ti', key: 'ti.ringRoad', def: 'Centura București', label: L('TTS pentru insigna DN „CB”', 'TTS for the DN "CB" shield') },
    { group: 'es', key: 'es.intro', def: '', label: L('Sugestii: text la început (opțional)', 'Suggestions: opening text (optional)') },
    { group: 'es', key: 'es.ok', def: 'Corect', label: L('Sugestii: modificare corectă', 'Suggestions: correct change') },
    { group: 'es', key: 'es.bad', def: 'Greșit', label: L('Sugestii: modificare greșită', 'Suggestions: wrong change') },
    { group: 'es', key: 'es.redo', def: 'O refac eu', label: L('Sugestii: o refac eu', "Suggestions: I'll redo it") },
    { group: 'es', key: 'es.outro', def: '', label: L('Sugestii: text la final (opțional)', 'Suggestions: closing text (optional)') },
    { group: 'voice', key: 'voice.distance', def: 'În 800 de metri,', label: L('Distanță', 'Distance') },
    { group: 'voice', key: 'voice.CONTINUE', def: 'continuă pe', label: L('Continuă', 'Continue') },
    { group: 'voice', key: 'voice.TURN_RIGHT', def: 'virează la dreapta pe', label: L('Virează la dreapta', 'Turn right') },
    { group: 'voice', key: 'voice.TURN_LEFT', def: 'virează la stânga pe', label: L('Virează la stânga', 'Turn left') },
    { group: 'voice', key: 'voice.KEEP_RIGHT', def: 'ține dreapta pe', label: L('Ține dreapta', 'Keep right') },
    { group: 'voice', key: 'voice.KEEP_LEFT', def: 'ține stânga pe', label: L('Ține stânga', 'Keep left') },
    { group: 'voice', key: 'voice.EXIT_RIGHT', def: 'ieși prin dreapta pe', label: L('Ieși prin dreapta', 'Exit right') },
    { group: 'voice', key: 'voice.EXIT_LEFT', def: 'ieși prin stânga pe', label: L('Ieși prin stânga', 'Exit left') },
    { group: 'voice', key: 'voice.UTURN', def: 'întoarce-te pe', label: L('Întoarce-te', 'U-turn') },
    { group: 'voice', key: 'voice.ROUNDABOUT', def: 'la sensul giratoriu ieși pe', label: L('Sens giratoriu', 'Roundabout') },
  ];
  const CUSTOM_TEXT_DEFAULTS = Object.fromEntries(CUSTOM_TEXT_DEFS.map((d) => [d.key, d.def]));
  // `settings` is declared further down; CT is only called at run time.
  function CT(key) {
    const own = settings && settings.customTexts && settings.customTexts[key];
    return typeof own === 'string' && own.trim() !== '' ? own : CUSTOM_TEXT_DEFAULTS[key];
  }

  // Version history shown in the "Ce e nou" window (UI text, Romanian).
  // New features / complex changes only (0.35, 0.36...); bug-fix releases
  // (0.34.1, 0.34.2...) bump the version but are not listed here - the full
  // history is in the project's CHANGELOG.md.
  const VERSION_HISTORY = [
    { v: '0.44', items: [
      L('Sugestii de hartă: „📝 Analiză modificări” - fiecare modificare propusă cu stare (corectă / greșită / o refac eu), explicație și „Aplică pe hartă” pentru tip drum, nume stradă și numere de imobil.', 'Map suggestions: "📝 Review changes" - each proposed change with a status (correct / wrong / I\'ll redo it), an explanation and "Apply on the map" for road type, street name and house numbers.'),
      L('Fereastra de respingere e mai mare, cu lista modificărilor de inserat, „Inserează analiza” și ciornă păstrată pe fiecare sugestie. După respingere poți aplica modificările bune.', 'The rejection dialog is bigger, with the list of changes to insert, "Insert the review" and a draft kept per suggestion. After rejecting you can apply the good changes.'),
    ] },
    { v: '0.43', items: [L(
      'La pornirea WME, scriptul verifică dacă pe Greasy Fork există o versiune nouă și afișează un anunț cu butonul „Actualizează”. Verificare manuală din setări: „Verifică actualizări”.',
      'When WME starts, the script checks Greasy Fork for a new version and shows a notice with an "Update" button. Manual check in the settings: "Check for updates".'
    )] },
    { v: '0.42', items: [
      L('Textele în română care ajung pe hartă sau în răspunsurile UR (separatoare, „Mesaj lung”, avertizări și TTS la viraje, simulare vocală) se pot personaliza sau traduce din setări → „Texte personalizabile”, cu export / import JSON.',
        'The Romanian texts that end up on the map or in UR replies (separators, "Long message", turn warnings and TTS, voice simulation) can be customized or translated in the settings → "Customizable texts", with JSON export / import.'),
      L('Opțiunile care repară probleme ale WME au eticheta „WME Bug fix”.', 'Options that work around WME bugs are marked "WME Bug fix".'),
    ] },
    { v: '0.41', items: [L(
      'Script bilingv: interfața e în română sau engleză, după limba WME (sau aleasă din setări: Auto / Română / English). Textele care ajung pe hartă (TTS, avertizări, insigne) rămân în română.',
      'Bilingual script: the interface is in Romanian or English, following the WME language (or chosen in the settings: Auto / Română / English). Texts that end up on the map (TTS, warnings, road shields) stay in Romanian.'
    )] },
    { v: '0.40', items: [L(
      'Coordonatele GPS din conversațiile problemelor de hartă (44.223232, 23.0909034 sau 45°03\'19.8"N 26°25\'37.8"E) devin clicabile: click centrează harta pe punct, cu un cerc care pulsează.',
      'GPS coordinates in map problem conversations (44.223232, 23.0909034 or 45°03\'19.8"N 26°25\'37.8"E) become clickable: a click centers the map on the point, with a pulsing circle.'
    )] },
    { v: '0.39', items: [L(
      'Stare Livemap mai clară: „Editat: …” (când s-a modificat) și „Live: …” (când a apărut sau va apărea pe Livemap - ultima asamblare de acum X ore / asamblare din data și ora / estimat). Aceleași texte pe bulinele de pe hartă, în tooltip-ul din bara segmentului și într-un rând nou sub „Ultima actualizare” în panoul lateral.',
      'Clearer Livemap status: "Edited: …" (when it was changed) and "Live: …" (when it reached or will reach Livemap - latest build X hours ago / build of date and time / estimated). The same texts on the map pills, in the segment toolbar tooltip and in a new line under "Last update" in the sidebar.'
    )] },
    { v: '0.38', items: [L(
      'Pastilele de pe hartă apar acum și pentru modificările deja pe Livemap din ultimul build (verde) și pentru cele recente (albastru), nu doar pentru cele nepublicate (portocaliu). Se poate opri din setări.',
      'Map pills now also show edits already on Livemap from the latest build (green) and recent ones (blue), not only unpublished ones (orange). Can be turned off in the settings.'
    )] },
    { v: '0.37', items: [L(
      'Stare publicare pe Livemap: verde = modificare intrată în ultimul build (deja pe Livemap), albastru = recentă (până la 3 zile înainte), gri = mai veche, portocaliu = încă nu. Lângă iconiță apare vechimea („1d 21h”, „3d”); aceleași culori și în panoul lateral.',
      'Livemap publish status: green = edit included in the latest build (already on Livemap), blue = recent (up to 3 days before), grey = older, orange = not yet. The edit age is shown next to the icon ("1d 21h", "3d"); same colors in the sidebar.'
    )] },
    { v: '0.36', items: [L(
      '„Instrucțiuni viraje”: casetele de text și insignele au un mâner „⋮” - le tragi la stânga / dreapta în aceeași zonă; TTS-ul automat se reface.',
      '"Turn instructions": text boxes and shields have a "⋮" handle - drag them left / right within the same area; the automatic TTS is rebuilt.'
    )] },
    { v: '0.35', items: [L(
      'Fereastra „Ce e nou”: după o actualizare vezi ce s-a schimbat față de versiunea ta; „Changelog complet” și linkul din setări arată tot istoricul.',
      '"What\'s new" window: after an update you see what changed since your version; "Full changelog" and the settings link show the whole history.'
    )] },
    { v: '0.34', items: [
      L('„Instrucțiuni viraje”: ⚡ Implicit (insigna + numele local al drumului-țintă, „»” în Înspre, TTS), „»” și „·” la cursor, „+ nume local”.',
        '"Turn instructions": ⚡ Default (shield + local name of the target road, "»" in Towards, TTS), "»" and "·" at the cursor, "+ local name".'),
      L('Insigne tastate (A2, DN1A, E60, DEx12, DJ601, DC43, CB) și insignele văzute pe hartă în județ - fără segmente helper.',
        'Typed shields (A2, DN1A, E60, DEx12, DJ601, DC43, CB) and the shields seen on the map in the county - no helper segments needed.'),
      L('Avertizări gabarit / tonaj / Bus-Taxi în Înspre și TTS; unelte TTS (⟳ Tot, +P, +Î, 🗑) și simulare vocală completă.',
        'Height / weight / Bus-Taxi warnings in Towards and TTS; TTS tools (⟳ All, +P, +T, 🗑) and full voice simulation.'),
    ] },
    { v: '0.33', items: [
      L('„Scurtături Tastatură”: căutare, căutare după tastă, confirmare înainte să iei o tastă deja alocată.',
        '"Keyboard shortcuts": search, search by key, confirmation before taking a key that is already assigned.'),
      L('Tastele afișate în Straturi hartă și în meniul „+”; butoane rapide pentru straturi în dreapta hărții.',
        'Keys shown in Map layers and in the "+" menu; quick layer buttons on the right of the map.'),
    ] },
    { v: '0.32', items: [L(
      '„Mesaj lung”: previzualizare live, opțiunea de rânduri noi, se deschide lângă fereastra UR și preia textul scris; caseta UR are 12 rânduri.',
      '"Long message": live preview, line-break option, opens next to the UR window and takes over the text already typed; the UR box has 12 lines.'
    )] },
    { v: '0.31', items: [L(
      'Răspunsuri UR: rândurile noi devin separatoare vizibile (aplicația Waze nu le afișează), cu previzualizare înainte de trimitere.',
      'UR replies: line breaks become visible separators (the Waze app does not show them), with a preview before sending.'
    )] },
    { v: '0.30', items: [L(
      'Avertizările salvate cu „Salvează oricum” rămân într-o listă pe sesiune (fereastră + indicator), cu buton „du-mă acolo”.',
      'Warnings saved with "Save anyway" stay in a per-session list (window + badge), with a "take me there" button.'
    )] },
    { v: '0.29', items: [L('„HN rapid” plasează pe orice segment al aceleiași străzi (cel mai apropiat de click).', '"Quick HN" places numbers on any segment of the same street (the one closest to the click).')] },
    { v: '0.28', items: [L('Ciorna răspunsului la UR (caseta + „Mesaj lung”) se păstrează pe fiecare UR și revine după reîncărcarea ferestrei.', 'The UR reply draft (box + "Long message") is kept per UR and restored after the window reloads.')] },
    { v: '0.27', items: [L('Eticheta „Oraș, Județ” de deasupra hărții se reface singură când WME o lasă doar cu țara.', 'The "City, County" label above the map is restored when WME drops it to just the country.')] },
    { v: '0.26', items: [L('Issue Tracker: harta poate arăta toate problemele deschise, iar lista rămâne filtrată.', 'Issue Tracker: the map can show all open issues while the list stays filtered.')] },
    { v: '0.25', items: [L('Bulinele „nepublicat” stau acum sub panourile WME (fereastra UR, Straturi, panoul lateral).', 'The "unpublished" pills now stay under the WME panels (UR window, Layers, sidebar).')] },
    { v: '0.22', items: [L('„HN rapid” pornește singur stratul Numere imobile; „Taie segmentul” acceptă click-uri mult mai departe de segment.', '"Quick HN" turns on the house numbers layer by itself; "Cut segment" accepts clicks much farther from the segment.')] },
    { v: '0.20', items: [L('Setări cu descriere scurtă + „More…” pentru detalii.', 'Settings with a short description + "More…" for details.')] },
  ];
  const LS_SEEN_VERSION = 'wme-ro-tools.seenVersion';
  // Public page on Greasy Fork (Paul, 2026-10-19).
  const GREASYFORK_URL = 'https://greasyfork.org/ro/scripts/601073-wme-ro-tools';
  const GREASYFORK_FEEDBACK_URL = `${GREASYFORK_URL}/feedback`;
  // Shown on first install and on top of the full changelog (Paul, v0.40.1).
  const DEV_WARNING_TEXT = L(
    'Script în dezvoltare și testare, destinat comunității Waze din România. Funcțiile se pot schimba de la o versiune la alta și unele pot avea erori. Verifică editările înainte de a salva. Problemele și sugestiile le poți trimite pe Greasy Fork, la ',
    'Script in development and testing, intended for the Waze community in Romania. Features may change from one version to another and some may have bugs. Check your edits before saving. Send problems and suggestions on Greasy Fork, in '
  );

  // localStorage key (per-origin, not per-script) for settings saved from
  // the UserScripts panel tab.
  const SETTINGS_STORAGE_KEY = 'wme-ro-tools-settings';

  // ---------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------

  // Selection-change poll interval - no confirmed SDK event for this.
  const SELECTION_POLL_MS = 350;

  // Poll interval for detecting whether the WME sidebar (#sidebar) is
  // hidden/collapsed, used by the "keep sidebar open" option.
  const FORCE_SIDEBAR_OPEN_POLL_MS = 500;

  // Screen-pixel distance from the node for the LENGTH badge, along each
  // segment's direction. Kept clear of WME's native Junction Angle Info
  // circles (~44px from the node).
  const LENGTH_BADGE_OFFSET_PX = 84;

  // Pixel distance for the ANGLE badge, on the bisector between two
  // consecutive segments. Kept close to the node to overlap WME's own
  // Junction Angle Info circles by design.
  const ANGLE_BADGE_OFFSET_PX = 44;

  // Meters above which a node move is considered real drag, not rounding
  // noise between the Mercator conversion and SDK geometry.
  const DRAG_THRESHOLD_M = 0.05;

  const EARTH_RADIUS_M = 6371000;
  const TWO_PI = Math.PI * 2;

  // Viewport-edge margin (px) used when clamping a long segment's length
  // badge to stay on screen (see computeSegmentBadgePosition).
  const VIEWPORT_CLAMP_MARGIN_PX = 24;

  // Sideways offset (px, perpendicular to the segment) for the length
  // badge, so it doesn't sit directly on the segment line.
  const SEGMENT_LENGTH_BADGE_SIDE_OFFSET_PX = 20;

  // Window (px along the path) used to sample a segment's LOCAL direction
  // around a point (see pointAtLength) - on dense geometries the vector
  // between two adjacent vertices can be near (0,0), hence the min-vector
  // fallback below.
  const DIRECTION_SAMPLE_WINDOW_PX = 10;
  const MIN_DIRECTION_VECTOR_PX = 0.5;

  // Pixel gap below the selected segment's length badge for the
  // quick-action toolbar. Only a minimum/visual gap now - actual position
  // is computed separately (see computeQuickBarPosition) to avoid
  // overlapping vertical (N-S) segments.
  const QUICK_BAR_OFFSET_BELOW_BADGE_PX = 18;

  // Extra margin (px) added to half the toolbar's real width/height so it
  // never touches the segment line, regardless of orientation.
  const QUICK_BAR_CLEAR_MARGIN_PX = 12;

  // Extra fixed clearance (px) on top of the geometric clearance above,
  // so the toolbar also clears nearby native angle/direction arrows near
  // nodes without needing an explicit list of them.
  const QUICK_BAR_EXTRA_CLEARANCE_PX = 50;

  // Z-index for own UI elements (badge, bar, menus). Kept below native WME
  // modals (seen starting at z-index 999+, e.g. the restrictions modal at
  // 1002) but above the map layers.
  const OWN_UI_Z_INDEX = 500;
  const OWN_UI_MENU_Z_INDEX = 501;

  // Gap (px) between the quick-action bar and the vertical dropdown menus
  // (lock level / direction) it opens.
  const QUICK_BAR_DROPDOWN_GAP_PX = 2;

  // ---------------------------------------------------------------------
  // Light/dark colors for own UI elements (badge + bar + menus). We don't
  // rely on any specific dark-mode script; native WME dark theme sets
  // `wz-theme="dark"` on <html>, which is what detectDarkMode reads.
  // ---------------------------------------------------------------------

  const THEME_LIGHT = {
    badgeBg: 'rgba(255, 255, 255, 0.92)',
    badgeBorder: 'rgba(0, 0, 0, 0.25)',
    badgeText: '#2a2a2a',
    barBg: 'rgba(255, 255, 255, 0.92)',
    barBorder: 'rgba(0, 0, 0, 0.18)',
    barText: '#2a2a2a',
    menuBg: '#ffffff',
    menuBorder: 'rgba(0, 0, 0, 0.2)',
    menuText: '#2a2a2a',
    menuHoverBg: 'rgba(0, 0, 0, 0.06)',
    activeBg: 'rgba(25, 118, 210, 0.18)',
  };
  const THEME_DARK = {
    badgeBg: 'rgba(45, 45, 48, 0.92)',
    badgeBorder: 'rgba(255, 255, 255, 0.28)',
    badgeText: '#e8e8e8',
    barBg: 'rgba(45, 45, 48, 0.92)',
    barBorder: 'rgba(255, 255, 255, 0.22)',
    barText: '#e8e8e8',
    menuBg: '#2c2c2e',
    menuBorder: 'rgba(255, 255, 255, 0.22)',
    menuText: '#e8e8e8',
    menuHoverBg: 'rgba(255, 255, 255, 0.14)',
    activeBg: 'rgba(90, 170, 255, 0.32)',
  };

  // Reads WME's native `wz-theme` attribute on <html> as the source of
  // truth. Falls back to a background-color sample only if that attribute
  // is ever missing (#sidebar itself stays white even in dark theme, so
  // it's not a reliable primary signal).
  function detectDarkMode() {
    try {
      const theme = document.documentElement.getAttribute('wz-theme');
      if (theme === 'dark') return true;
      if (theme === 'light') return false;
    } catch (e) {
      // fall through to the color-sample fallback below
    }
    try {
      const bg = getComputedStyle(document.body).backgroundColor;
      const nums = bg.match(/[\d.]+/g);
      if (!nums || nums.length < 3) return false;
      const [r, g, b] = nums.map(Number);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    } catch (e) {
      return false;
    }
  }

  function currentTheme() {
    return detectDarkMode() ? THEME_DARK : THEME_LIGHT;
  }

  let sdk = null;

  // State for the NODE tool (angle + length on node): active node,
  // connected segments (with precomputed info), DOM badges, drag state.
  const state = {
    nodeId: null,
    segments: [], // { segmentId, anchorLonLat, fixedRemainderM, lengthBadge, lastBearing, angleBadge }
    rafId: null,
    wasDragging: false,
  };

  // State for the SEGMENT tool (length on selected segment) - independent
  // of `state` (node and segment selection are mutually exclusive in WME).
  const segmentState = {
    segmentId: null,
    badge: null,
    rafId: null,
    quickBar: null, // quick-action toolbar DOM container
    quickBarEls: null, // refs to individual buttons in the bar
    quickBarRefreshId: null, // setInterval id for the bar's state refresh
    openDropdown: null, // currently open vertical menu (lock level / direction), if any
    dragHandle: null, // "⋮" handle for manually dragging the toolbar
    publishDot: null, // "published on Livemap" status dot
    publishDotLastStatus: null, // last shown 'status|age' key - avoids redundant DOM writes
    manualOffset: { dx: 0, dy: 0 }, // manual offset (px) on top of the auto-computed position, while the segment stays selected
    dragCleanup: null, // cleans up active drag listeners if a drag is in progress on deselect
  };

  // State for length badges on a MULTI-segment selection: one badge per
  // segment, no quick-action toolbar (that stays single-segment only).
  // Independent of `state`/`segmentState` - node/single-segment/multi-segment
  // selection are always mutually exclusive.
  const multiSegmentState = {
    segmentIds: [], // current selection's ids, to detect changes
    badges: new Map(), // segmentId -> badge DOM element
    rafId: null,
  };

  // ---------------------------------------------------------------------
  // Settings (own tab in the "UserScripts" sidebar panel)
  // ---------------------------------------------------------------------

  // Defaults - all existing tools on, matching pre-settings-tab behavior.
  const DEFAULT_SETTINGS = {
    // UI language: 'auto' (follows the WME URL locale) | 'ro' | 'en' - see LANG.
    language: 'auto',
    // Customizable content texts (CT, v0.42): { key: text }.
    customTexts: {},
    // v0.43: check Greasy Fork for a newer version when WME opens.
    updateCheck: true,
    // v0.44: helper for map edit suggestions (review, rejection dialog, apply).
    editSuggestionHelper: true,
    nodeAngleLength: true, // angle + length on selected node
    segmentLength: true, // length on selected segment
    segmentAutomation: true, // segment parameter automation (unpaved/road type)
    segmentQuickBar: true, // quick-action toolbar near segment length badge
    uturnDetection: false, // U-turn detection + warning - DISABLED (see UTURN_FEATURE_AVAILABLE)
    urBulkSender: true, // bulk UR message sender
    // v0.40: GPS coordinates in UR/MP texts (decimal or DMS) become
    // clickable - a click centers the map on them.
    urCoordLinks: true,
    // Off by default (unlike the rest) - forces the WME sidebar to stay
    // open, correcting any collapse/hide. Defensive measure, may conflict
    // with legitimate native behavior on narrow screens.
    forceSidebarOpen: false,
    // "Move nodes" button in the segment quick-action bar - opens a panel
    // with Node A/Node B, each "inward"/"outward", moving the node along
    // existing geometry by a configurable distance (meters).
    moveNodesTool: true,
    // "HN rapid" button in the segment quick-action bar - opens a panel
    // for quickly adding sequential house numbers (prefix + incrementing/
    // decrementing letter or number).
    hnRapidTool: true,
    // Status dot in the selected segment's badge, right before the length,
    // showing whether the segment's last edit has reached Livemap yet.
    publishStatusIndicator: true,
    // "Cut segment" (✂️) button in the quick-action bar - arms a cut mode
    // with a visual indicator (white dot + dashed line anchored to the
    // segment geometry); a single map click cuts via
    // `sdk.DataModel.Segments.splitSegment`.
    cutSegmentTool: true,
    // Warning pill (⚠️) next to EVERY visible segment not yet published to
    // Livemap - not just the selected one (that's `publishStatusIndicator`).
    // Selection-independent watchdog, like `forceSidebarOpen`.
    unpublishedSegmentsWarning: true,
    // v0.38: the map pills also show for 'fresh' (green, in the last
    // build) and 'recent' (blue) edits, not only for unpublished ones.
    publishPillsFreshRecent: true,
    // Issue Tracker: the MAP shows all open issues ("Toate problemele"),
    // while the tracker LIST keeps the selected filter. Off by default -
    // changes native WME behavior. Three synced controls: settings tab,
    // "Straturi hartă" > Userscripts, and a checkbox in the tracker footer.
    issueTrackerMapAll: false,
    // Restores the city/county name above the map when WME drops it to
    // just the country (WME bug - see `locationLabelFix`).
    locationLabelFix: true,
    // Keeps the reply being written to a UR/MP (native box + "Mesaj lung"
    // draft) and restores it if WME re-renders the conversation window.
    urDraftSaver: true,
    // After "Salvează oricum" (saving despite WME's validation warnings),
    // keeps those warnings in a session-only list (window + toolbar
    // indicator) with a "go to" button for each - see `initSavedWarnings`.
    savedWarningsList: true,
    // UR/MP replies: new lines are replaced with visible separators on Send
    // (the Waze app drops line breaks), with a preview first. Also the
    // state of the checkbox next to the native Send button.
    urReplaceNewlines: true,
    // "Mesaj lung" window: live preview (as the app shows it) to the right
    // of the draft box. Toggled from the window itself, not the settings tab.
    urLongLivePreview: true,
    // Keyboard shortcuts dialog: search/filter, lookup by key, confirm
    // before taking a key from another command; key hints in "Straturi
    // hartă" and the "+" menu (see `initShortcutsAndLayerButtons`).
    shortcutsHelper: true,
    // Quick toggle buttons under Layers / Reload / Permalink (right side):
    // Google places, extra satellite imagery, house numbers, hazards.
    layerQuickButtons: true,
    // "Instrucțiuni viraje" window: default fill, », ·, local name,
    // typed/seen road shields, warnings, TTS tools and full voice
    // simulation (see `initTurnInstructionsHelper`).
    turnInstructionsHelper: true,
  };

  // U-turn detection/warning is unreliable and withdrawn until reworked:
  // no settings toggle, always off. Code kept for the future rework.
  const UTURN_FEATURE_AVAILABLE = false;

  let settings = { ...DEFAULT_SETTINGS };
  // key -> settings-tab checkbox, for settings changed from elsewhere.
  const settingsToggleEls = {};

  // Options that work around WME bugs (badge "WME Bug fix" in the
  // settings tab, v0.42).
  const WME_BUGFIX_KEYS = ['locationLabelFix', 'issueTrackerMapAll', 'forceSidebarOpen'];

  function loadSettings() {
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      // Feature withdrawn for now - ignore a previously saved `true`.
      if (!UTURN_FEATURE_AVAILABLE) merged.uturnDetection = false;
      return merged;
    } catch (e) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings() {
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      // localStorage unavailable (private mode, quota, etc.) - setting
      // stays valid for this session only.
      console.warn(`${SCRIPT_NAME}: nu am putut salva setările în localStorage.`, e);
    }
  }

  // ---------------------------------------------------------------------
  // "Keep sidebar open" (option, off by default)
  // ---------------------------------------------------------------------
  //
  // No SDK method exists for this - `sdk.Sidebar` only exposes
  // `registerScriptTab`/`removeScriptTab`, nothing about visibility.
  // `#sidebar` is wrapped by `<div class="app container-fluid
  // show-sidebar">`; the `show-sidebar` class is a vestige of an older
  // (Bootstrap) WME version and has no CSS effect today (no stylesheet
  // references it anymore).
  //
  // Since the exact hide mechanism can't be pinned down, we instead poll
  // the visible RESULT - if the sidebar looks hidden/collapsed to zero,
  // for any reason - and correct it immediately. This works regardless of
  // which mechanism actually caused the hide.
  function isSidebarHidden(sidebar) {
    if (!sidebar) return false;
    const style = getComputedStyle(sidebar);
    if (style.display === 'none' || style.visibility === 'hidden') return true;
    const rect = sidebar.getBoundingClientRect();
    if (rect.width === 0) return true;
    return false;
  }

  // Sidebar's natural width when open normally - used only as a last
  // resort (step 4 below) if the collapse comes from an external CSS
  // rule rather than an inline style we can just remove.
  const SIDEBAR_NATURAL_WIDTH_PX = 330;

  function enforceSidebarOpen() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || !isSidebarHidden(sidebar)) return;

    // Step 1: restore the `show-sidebar` class on `.app`, in case a
    // future WME version starts relying on it again (currently inert).
    const appEl = document.querySelector('.app.container-fluid');
    if (appEl && !appEl.classList.contains('show-sidebar')) {
      appEl.classList.add('show-sidebar');
    }

    // Step 2: force `display`/`visibility` directly, covers an inline
    // `display:none`/`visibility:hidden` on `#sidebar`.
    if (isSidebarHidden(sidebar)) {
      sidebar.style.setProperty('display', 'flex', 'important');
      sidebar.style.setProperty('visibility', 'visible', 'important');
    }

    // Step 3: if still hidden, it's likely a WIDTH collapse (width/
    // flex-basis to 0) - clear any inline override of those properties so
    // the element regains its natural CSS width.
    if (isSidebarHidden(sidebar)) {
      ['width', 'min-width', 'flex-basis', 'flex'].forEach((prop) => sidebar.style.removeProperty(prop));
    }

    // Step 4, last resort: if the collapse comes from an external CSS rule
    // (not inline), force the measured natural width explicitly.
    if (isSidebarHidden(sidebar)) {
      sidebar.style.setProperty('width', `${SIDEBAR_NATURAL_WIDTH_PX}px`, 'important');
      sidebar.style.setProperty('min-width', `${SIDEBAR_NATURAL_WIDTH_PX}px`, 'important');
      sidebar.style.setProperty('flex', `0 0 ${SIDEBAR_NATURAL_WIDTH_PX}px`, 'important');
    }

    // Step 5: steps 1-4 only force the visual CSS result, not WME's
    // internal state of which tab is active. If no tab was active when
    // the sidebar got hidden, other native/script panels that position
    // themselves off real state (not our CSS) still behave as if no
    // sidebar column exists and overlap the one we forced visible.
    //
    // Fix: explicitly select the `feature_editor` tab (the same one WME
    // auto-selects on any segment/place selection) - it has an empty
    // native screen, valid even with nothing selected, so the sidebar
    // keeps a REAL active tab recognized by the rest of the app.
    //
    // No SDK method for this. A synthetic click on the tab button
    // (`wz-navigation-item`) has no effect - WME ignores untrusted mouse
    // events there. What works: change the `tab` URL param via
    // `history.replaceState` (not `pushState`, would flood browser
    // history on every poll) and dispatch a `popstate` event manually -
    // the event WME's internal router listens for on URL changes.
    selectFeatureEditorTab();
  }

  function selectFeatureEditorTab() {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('tab') === 'feature_editor') return;
      url.searchParams.set('tab', 'feature_editor');
      history.replaceState(history.state, '', url.toString());
      window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
    } catch (e) {
      // best-effort - if WME's routing ever changes, steps 1-4's CSS fix
      // still applies.
    }
  }

  let forceSidebarOpenIntervalId = null;

  function startForceSidebarOpenWatchdog() {
    if (forceSidebarOpenIntervalId) return;
    enforceSidebarOpen();
    forceSidebarOpenIntervalId = setInterval(enforceSidebarOpen, FORCE_SIDEBAR_OPEN_POLL_MS);
  }

  function stopForceSidebarOpenWatchdog() {
    if (forceSidebarOpenIntervalId) {
      clearInterval(forceSidebarOpenIntervalId);
      forceSidebarOpenIntervalId = null;
    }
    // Clear forced styles so the sidebar reverts to native behavior when
    // the option is turned off.
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      ['display', 'visibility', 'width', 'min-width', 'flex-basis', 'flex'].forEach((prop) =>
        sidebar.style.removeProperty(prop)
      );
    }
  }

  // Builds the settings tab in the "UserScripts" sidebar panel, one
  // checkbox per tool. Toggling takes effect immediately (no page
  // refresh needed).
  async function buildSettingsTab() {
    let tabLabel;
    let tabPane;
    try {
      ({ tabLabel, tabPane } = await sdk.Sidebar.registerScriptTab());
    } catch (e) {
      console.error(`${SCRIPT_NAME}: nu am putut înregistra tab-ul de setări.`, e);
      return;
    }

    tabLabel.innerText = 'RO Tools';
    tabLabel.title = SCRIPT_NAME;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'padding: 10px;';

    const title = document.createElement('h4');
    title.textContent = L(`${SCRIPT_NAME} - setări`, `${SCRIPT_NAME} - settings`);
    title.style.cssText = 'margin: 0 0 4px 0;';
    wrap.appendChild(title);

    const version = document.createElement('div');
    version.textContent = L(`Versiune: ${SCRIPT_VERSION} · `, `Version: ${SCRIPT_VERSION} · `);
    version.style.cssText = 'color: #888; font-size: 11px; margin-bottom: 12px;';
    const historyLink = document.createElement('a');
    historyLink.href = '#';
    historyLink.textContent = L('Ce e nou / istoric versiuni', "What's new / version history");
    historyLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      showWhatsNew(true);
    });
    version.appendChild(historyLink);
    version.append(' · ');
    const gfLink = document.createElement('a');
    gfLink.href = GREASYFORK_URL;
    gfLink.target = '_blank';
    gfLink.rel = 'noopener noreferrer';
    gfLink.textContent = 'Greasy Fork / Feedback';
    gfLink.title = L('Pagina scriptului pe Greasy Fork: actualizări, descriere, raportare probleme', 'Script page on Greasy Fork: updates, description, bug reports');
    version.appendChild(gfLink);
    version.append(' · ');
    const updLink = document.createElement('a');
    updLink.href = '#';
    updLink.textContent = L('Verifică actualizări', 'Check for updates');
    updLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      updLink.textContent = L('Se verifică…', 'Checking…');
      updateCheck(true, (latest) => {
        if (!latest) updLink.textContent = L('Verificare eșuată', 'Check failed');
        else if (compareVersions(latest, SCRIPT_VERSION) > 0) updLink.textContent = L(`Versiune nouă: ${latest}`, `New version: ${latest}`);
        else updLink.textContent = L('Ai ultima versiune ✓', 'You have the latest version ✓');
      });
    });
    version.appendChild(updLink);
    wrap.appendChild(version);

    // Language selector (v0.41). Applied on page reload - LANG is fixed at load.
    const langRow = document.createElement('div');
    langRow.style.cssText = 'display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin:-6px 0 12px; font-size:12px;';
    const langLabel = document.createElement('span');
    langLabel.textContent = 'Limbă / Language:';
    const langSelect = document.createElement('select');
    langSelect.style.cssText = 'font-size:12px;';
    [
      ['auto', L('Auto (după limba WME)', 'Auto (WME language)')],
      ['ro', 'Română'],
      ['en', 'English'],
    ].forEach(([value, text]) => {
      const o = document.createElement('option');
      o.value = value;
      o.textContent = text;
      langSelect.appendChild(o);
    });
    langSelect.value = settings.language || 'auto';
    const langNote = document.createElement('span');
    langNote.style.cssText = 'color:#f18200; display:none;';
    langNote.textContent = 'Reîncarcă pagina pentru a aplica. / Reload the page to apply.';
    langSelect.addEventListener('change', () => {
      settings.language = langSelect.value;
      saveSettings();
      langNote.style.display = 'inline';
    });
    langRow.append(langLabel, langSelect, langNote);
    wrap.appendChild(langRow);

    // `shortText`: one short line, always visible. `moreText`: full
    // explanation (optional) shown as a native tooltip on the "More…"
    // label - keeps the settings list scannable without losing detail.
    function addToggle(key, labelText, shortText, moreText) {
      const row = document.createElement('label');
      row.style.cssText = 'display: flex; align-items: flex-start; gap: 6px; margin-bottom: 10px; cursor: pointer;';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = !!settings[key];
      checkbox.style.cssText = 'margin-top: 2px;';
      settingsToggleEls[key] = checkbox;
      checkbox.addEventListener('change', () => {
        // Synced with 2 other controls - see `setIssueTrackerMapAll`.
        if (key === 'issueTrackerMapAll') {
          setIssueTrackerMapAll(checkbox.checked, 'settings');
          return;
        }
        if (key === 'shortcutsHelper' || key === 'layerQuickButtons') {
          settings[key] = checkbox.checked;
          saveSettings();
          if (key === 'shortcutsHelper' && !checkbox.checked) {
            kbRemoveAllHints();
            const bar = document.getElementById(KB_TOOLBAR_ID);
            if (bar) bar.remove();
          }
          if (key === 'layerQuickButtons') layerBtnsRefresh();
          return;
        }
        if (key === 'turnInstructionsHelper') {
          settings[key] = checkbox.checked;
          saveSettings();
          if (!checkbox.checked) tiRemoveAll();
          return;
        }
        if (key === 'urReplaceNewlines') {
          settings[key] = checkbox.checked;
          saveSettings();
          urNlSyncCheckboxes();
          return;
        }
        if (key === 'savedWarningsList') {
          settings[key] = checkbox.checked;
          saveSettings();
          savedWarnRender();
          return;
        }
        if (key === 'locationLabelFix') {
          settings[key] = checkbox.checked;
          saveSettings();
          if (checkbox.checked) locationLabelSchedule();
          return;
        }
        settings[key] = checkbox.checked;
        saveSettings();
        // "Keep sidebar open" is unrelated to any active selection -
        // starts/stops its watchdog directly and returns early.
        if (key === 'forceSidebarOpen') {
          if (checkbox.checked) {
            startForceSidebarOpenWatchdog();
          } else {
            stopForceSidebarOpenWatchdog();
          }
          return;
        }
        // Same pattern as "Keep sidebar open" - selection-independent
        // watchdog, started/stopped directly.
        if (key === 'unpublishedSegmentsWarning') {
          if (checkbox.checked) {
            startUnpublishedWarnWatchdog();
          } else {
            stopUnpublishedWarnWatchdog();
          }
          return;
        }
        // Immediate effect: if the tool was just unchecked and was active
        // on the current selection, deactivate it now.
        if (!checkbox.checked) {
          if (key === 'nodeAngleLength' && state.nodeId) deactivate();
          if (key === 'segmentLength' && segmentState.segmentId) deactivateSegment();
          if (key === 'segmentLength' && multiSegmentState.badges.size) deactivateMultiSegment();
          if (key === 'segmentQuickBar' && segmentState.quickBar) removeQuickActionBar();
          if (key === 'moveNodesTool') {
            closeMoveNodesPanel();
            if (segmentState.quickBar && segmentState.segmentId) {
              removeQuickActionBar();
              createQuickActionBar(segmentState.segmentId);
            }
          }
          if (key === 'uturnDetection') removeUturnAlert();
          if (key === 'hnRapidTool') {
            closeHnPanel();
            if (segmentState.quickBar && segmentState.segmentId) {
              removeQuickActionBar();
              createQuickActionBar(segmentState.segmentId);
            }
          }
          if (key === 'publishStatusIndicator' && segmentState.publishDot) {
            segmentState.publishDot.style.display = 'none';
          }
          if (key === 'cutSegmentTool') {
            if (cutState.active) cutDisarm();
            if (segmentState.quickBar && segmentState.segmentId) {
              removeQuickActionBar();
              createQuickActionBar(segmentState.segmentId);
            }
            // Release the X shortcut too, if registered, so it's not left
            // reserved for a now-hidden button.
            try {
              sdk.Shortcuts.deleteShortcut({ shortcutId: `${SCRIPT_ID}-cut-segment` });
            } catch (e) {
              // ignore - probably wasn't registered
            }
          }
          if (key === 'urCoordLinks' && !checkbox.checked) coordUnlinkAll();
          if (key === 'urBulkSender') {
            urBulkClosePanel();
            if (urBulkState.triggerBtn) {
              urBulkState.triggerBtn.remove();
              urBulkState.triggerBtn = null;
            }
            urBulkState.formEl = null;
          }
          // segmentAutomation has no per-selection "active" state - it's
          // just a flag read in the click handlers.
        } else if (key === 'segmentQuickBar' && segmentState.segmentId && !segmentState.quickBar) {
          // Special case: segment already active (badge shown), only the
          // bar was missing - checkSelection() wouldn't re-trigger
          // (segmentId unchanged), so create the bar directly.
          createQuickActionBar(segmentState.segmentId);
        } else if (key === 'moveNodesTool' && segmentState.quickBar && segmentState.segmentId) {
          // Re-enable: bar already exists (another setting created it) -
          // rebuild it so the "Move nodes" button appears too.
          removeQuickActionBar();
          createQuickActionBar(segmentState.segmentId);
        } else if (key === 'hnRapidTool' && segmentState.quickBar && segmentState.segmentId) {
          // Re-enable: bar already exists - rebuild it so the "HN rapid"
          // button appears too.
          removeQuickActionBar();
          createQuickActionBar(segmentState.segmentId);
        } else if (key === 'cutSegmentTool') {
          // Re-enable: re-register the X shortcut + rebuild the bar if it
          // already exists.
          registerCutShortcut();
          if (segmentState.quickBar && segmentState.segmentId) {
            removeQuickActionBar();
            createQuickActionBar(segmentState.segmentId);
          }
        } else {
          // Re-enabled - force an immediate selection recheck instead of
          // waiting up to SELECTION_POLL_MS.
          checkSelection();
        }
      });

      const textWrap = document.createElement('div');
      const strong = document.createElement('div');
      strong.textContent = labelText;
      strong.style.cssText = 'font-weight: 600;';
      if (WME_BUGFIX_KEYS.includes(key)) {
        // v0.42 (Paul): mark the options that work around WME bugs.
        const chip = document.createElement('span');
        chip.textContent = 'WME Bug fix';
        chip.title = L(
          'Corectează un comportament greșit al WME. Poate deveni inutilă când Waze repară problema.',
          'Works around a WME bug. May become unnecessary once Waze fixes the problem.'
        );
        chip.style.cssText =
          'display:inline-block; margin-left:6px; padding:0 5px; border-radius:8px; background:#f18200; color:#fff; font:600 10px/16px Arial, sans-serif; vertical-align:1px; white-space:nowrap;';
        strong.appendChild(chip);
      }
      textWrap.appendChild(strong);
      if (shortText) {
        const small = document.createElement('div');
        small.style.cssText = 'color: #888; font-size: 11px;';
        small.textContent = shortText;
        if (moreText) {
          small.textContent = `${shortText} `;
          const more = document.createElement('span');
          more.textContent = 'More…';
          more.title = moreText;
          more.style.cssText = 'text-decoration: underline dotted; cursor: help; white-space: nowrap;';
          small.appendChild(more);
        }
        textWrap.appendChild(small);
      }

      row.appendChild(checkbox);
      row.appendChild(textWrap);
      wrap.appendChild(row);
    }

    addToggle(
      'nodeAngleLength',
      L('Unghi + lungime la nodul selectat', 'Angle + length on selected node'),
      L('Etichete de lungime + unghi la selectarea unui nod cu 2+ segmente.', 'Length + angle labels when selecting a node with 2+ segments.'),
      L('Etichete cu lungimea fiecărui segment + unghiuri (cât timp tragi nodul), la selectarea unui nod cu 2+ segmente conectate.', 'Labels with the length of each segment + angles (while dragging the node), when selecting a node with 2+ connected segments.')
    );
    addToggle(
      'segmentLength',
      L('Lungime la segmentul (segmentele) selectat(e)', 'Length on selected segment(s)'),
      L('Etichetă de lungime la selectarea unui segment sau mai multe.', 'Length label when selecting one or more segments.'),
      L('Etichetă cu lungimea totală la selectarea unui singur segment (+ bara de butoane rapide, dacă e activă) sau câte o etichetă per segment la selecția mai multor segmente deodată.', 'Total length label when selecting a single segment (+ the quick-action bar, if enabled), or one label per segment when selecting several segments at once.')
    );
    addToggle(
      'segmentAutomation',
      L('Automatizare parametri segment', 'Segment parameter automation'),
      L('Setează automat viteză/lock level/headlights la Neasfaltat/tip drum.', 'Auto-sets speed/lock level/headlights on Unpaved/road type.'),
      L('La apăsarea butonului Neasfaltat sau a unui buton de tip drum din panoul de detalii, setează automat viteză/lock level/headlights conform regulilor stabilite.', 'When clicking the Unpaved button or a road type button in the details panel, automatically sets speed/lock level/headlights according to the set rules.')
    );
    addToggle(
      'segmentQuickBar',
      L('Bară de butoane rapide', 'Quick-action bar'),
      L('Rând de iconițe rapide sub eticheta de lungime a segmentului.', 'Row of quick icons under the segment length label.'),
      L('Rând de iconițe sub eticheta de lungime a segmentului selectat: neasfaltat, faruri, HOV, nivel de blocare, direcție, HN rapid, taxă (toll), restricții. Necesită și "Lungime la segmentul selectat" activ (bara e poziționată relativ la etichetă).', 'Row of icons under the selected segment\'s length label: unpaved, headlights, HOV, lock level, direction, HN rapid, toll, restrictions. Also requires "Length on selected segment" enabled (the bar is positioned relative to the label).')
    );
    // 'uturnDetection' toggle hidden - feature withdrawn (UTURN_FEATURE_AVAILABLE).
    addToggle(
      'urBulkSender',
      L('Trimițător de mesaje lungi pentru UR', 'Long message sender for URs'),
      L('Împarte automat un mesaj lung în bucăți, la o Solicitare de actualizare.', 'Automatically splits a long message into parts, in an Update Request.'),
      L('Buton "Mesaj lung" lângă Trimite, în conversația unei Solicitări de actualizare (UR/PUR/MP): împarte automat un text de peste 2000 caractere în mai multe bucăți, trimise manual, una câte una.', '"Long message" button next to Send, in an Update Request conversation (UR/PUR/MP): automatically splits a text over 2000 characters into several parts, sent manually, one by one.')
    );
    addToggle(
      'updateCheck',
      L('Verifică actualizările la pornire', 'Check for updates on startup'),
      L('Anunță când pe Greasy Fork e o versiune nouă, cu buton de actualizare.', 'Tells you when Greasy Fork has a new version, with an update button.'),
      L('La deschiderea WME (cel mult o dată la 6 ore), scriptul citește versiunea de pe Greasy Fork. Dacă e mai nouă, apare sus un anunț cu „Actualizează” (deschide instalarea în Tampermonkey; apoi reîncarci WME), „Ce e nou” și „Mai târziu” (nu mai apare pentru acea versiune). Verificarea manuală: linkul „Verifică actualizări” de mai sus.', 'When WME opens (at most every 6 hours), the script reads the version on Greasy Fork. If it is newer, a notice appears at the top with "Update" (opens the install in Tampermonkey; then reload WME), "What\'s new" and "Later" (not shown again for that version). Manual check: the "Check for updates" link above.')
    );
    addToggle(
      'editSuggestionHelper',
      L('Ajutor pentru sugestiile de hartă', 'Map edit suggestions helper'),
      L('Analiză pe fiecare modificare propusă, respingere cu mesaj detaliat, aplicare a modificărilor bune.', 'Review each proposed change, reject with a detailed message, apply the good changes.'),
      L('În fereastra „Sugestie hartă”: butonul „📝 Analiză modificări” deschide un panou cu fiecare modificare propusă (valoarea veche tăiată, cea nouă, locul), cu stare (✔ corectă / ✖ greșită / ↻ o refac eu), explicație și - pentru tip drum, numele străzii și numere de imobil adăugate - „Aplică pe hartă” (editare nesalvată, o verifici și salvezi). „Respinge cu acest mesaj” deschide respingerea cu mesajul compus. Fereastra nativă de respingere devine mai mare, are lista modificărilor (click = inserează la cursor) și „Inserează analiza”; textul se păstrează pe fiecare sugestie (anularea nativă închide toată fereastra). După respingere, panoul revine ca să aplici modificările bune. Textele de stare se pot personaliza din „Texte personalizabile”.', 'In the "Map suggestion" window: the "📝 Review changes" button opens a panel with each proposed change (old value struck out, new value, location), a status (✔ correct / ✖ wrong / ↻ I\'ll redo it), an explanation and - for road type, street name and added house numbers - "Apply on the map" (unsaved edit, check it and save). "Reject with this message" opens the rejection with the composed message. The native rejection dialog gets bigger, with the list of changes (click = insert at the cursor) and "Insert the review"; the text is kept per suggestion (the native cancel closes the whole window). After rejecting, the panel comes back so you can apply the good changes. The status texts can be customized in "Customizable texts".')
    );
    addToggle(
      'urCoordLinks',
      L('Coordonate GPS clicabile în conversații', 'Clickable GPS coordinates in conversations'),
      L('Click pe coordonatele dintr-o problemă de hartă centrează harta pe ele.', 'Clicking coordinates in a map issue centers the map on them.'),
      L('În conversația și detaliile unei Solicitări de actualizare / Probleme de hartă, coordonatele scrise de utilizatori devin linkuri (subliniate punctat): atât forma zecimală (44.223232, 23.0909034) cât și grade-minute-secunde (45°03\'19.8"N 26°25\'37.8"E). Click: harta se centrează pe punct (zoom minim 17) și un cerc pulsează câteva secunde acolo. Fereastra problemei rămâne deschisă.', 'In the conversation and details of an Update Request / Map Problem, coordinates written by users become links (dotted underline): both decimal (44.223232, 23.0909034) and degrees-minutes-seconds (45°03\'19.8"N 26°25\'37.8"E). Click: the map centers on the point (min. zoom 17) and a circle pulses there for a few seconds. The issue window stays open.')
    );
    addToggle(
      'urDraftSaver',
      L('Păstrează ciorna răspunsului la UR', 'Keep UR reply draft'),
      L('Mesajul început la un UR nu se mai pierde la reîncărcarea ferestrei.', 'A reply started on a UR is no longer lost when the window reloads.'),
      L('Memorează, pentru fiecare UR/MP în parte, textul scris în caseta de comentariu și în "Mesaj lung". Dacă fereastra UR se reîncarcă (după o salvare, o altă modificare pe hartă sau chiar după reîncărcarea paginii), textul e pus la loc automat. Ciorna se șterge când trimiți mesajul, când închizi UR-ul (Rezolvat/Neidentificat) sau după 7 zile.', 'Remembers, for each UR/MP, the text written in the comment box and in "Long message". If the UR window reloads (after a save, another map change or even a page reload), the text is restored automatically. The draft is cleared when you send the message, when you close the UR (Solved/Not identified) or after 7 days.')
    );
    addToggle(
      'urReplaceNewlines',
      L('UR: înlocuiește rândurile noi la trimitere', 'UR: replace line breaks on send'),
      L('Aplicația Waze nu afișează rândurile noi - le înlocuim cu separatoare vizibile.', 'The Waze app doesn\'t show new lines - we replace them with visible separators.'),
      L('Aplicația Waze afișează comentariile la UR/MP fără rânduri noi (WME le arată, aplicația nu), deci un răspuns bine aranjat ajunge la utilizator ca un singur bloc de text. Când e activă, la Trimite: un rând gol (2 sau mai multe rânduri noi) devine „⠀━◆━⠀”, iar un singur rând nou devine „⠀-◇-⠀”. Înainte de trimitere apare o previzualizare - așa vede utilizatorul mesajul în aplicație - cu "Trimite" sau "Înapoi la editare". Aceeași opțiune e și bifa "Înlocuiește rândurile noi" din stânga butonului Trimite. Funcționează și cu "Mesaj lung".', 'The Waze app shows UR/MP comments without new lines (WME shows them, the app doesn\'t), so a nicely formatted reply reaches the user as a single block of text. When enabled, on Send: a blank line (2 or more new lines) becomes “⠀━◆━⠀”, and a single new line becomes “⠀-◇-⠀”. Before sending, a preview shows how the user will see the message in the app - with "Send" or "Back to editing". The same option is the "Replace line breaks" checkbox to the left of the Send button. Also works with "Long message".')
    );
    addToggle(
      'shortcutsHelper',
      L('Ajutor pentru scurtături de tastatură', 'Keyboard shortcuts helper'),
      L('Căutare în "Scurtături Tastatură", confirmare la tastă deja alocată, taste afișate în meniuri.', 'Search in "Keyboard shortcuts", confirmation for an already assigned key, keys shown in menus.'),
      L('În fereastra "Scurtături Tastatură": câmp de căutare (după numele comenzii sau după tastă, ex. "Shift+H"), buton "Caută după tastă" (apeși o combinație și vezi ce comandă o folosește sau că e liberă) și bifa "Doar cu tastă alocată"; comenzile fără tastă apar estompate. Când aloci unei comenzi o tastă deja folosită de alta, WME o mută fără avertizare - acum întreabă înainte ("Înlocuiește" / "Anulează"). În plus, tasta fiecărei comenzi apare lângă ea în "Straturi hartă" și în meniul "+" (Drum, Giratoriu, Pericol etc.).', 'In the "Keyboard shortcuts" window: a search field (by command name or by key, e.g. "Shift+H"), a "Search by key" button (press a combination and see which command uses it, or that it\'s free) and an "Only with assigned key" checkbox; commands without a key are dimmed. When you assign a key already used by another command, WME moves it without warning - now it asks first ("Replace" / "Cancel"). Also, each command\'s key is shown next to it in "Map layers" and in the "+" menu (Road, Roundabout, Hazard etc.).')
    );
    addToggle(
      'layerQuickButtons',
      L('Butoane rapide pentru straturi (dreapta hărții)', 'Quick layer buttons (right of the map)'),
      L('Locuri Google, imagini satelit suplimentare, numere de imobil, pericole.', 'Google places, extra satellite imagery, house numbers, hazards.'),
      L('Patru butoane rotunde sub Straturi / Reîncarcă / Permalink, în dreapta hărții, care comută straturile: Locuri Google, Imagini din satelit suplimentare, Numere de imobil și Pericole. Fiecare buton arată starea curentă (albastru = activ) și se actualizează și când stratul e schimbat din "Straturi hartă" sau din tastatură.', 'Four round buttons under Layers / Reload / Permalink, on the right of the map, toggling the layers: Google places, Additional satellite imagery, House numbers and Hazards. Each button shows the current state (blue = on) and also updates when the layer is changed from "Map layers" or the keyboard.')
    );
    addToggle(
      'turnInstructionsHelper',
      L('Ajutor pentru „Instrucțiuni viraje”', 'Helper for "Turn instructions"'),
      L('Completare implicită, », ·, nume local, insigne fără segmente helper, avertizări, TTS și simulare vocală.', 'Default fill, », ·, local name, shields without helper segments, warnings, TTS and voice simulation.'),
      L('În fereastra „Instrucțiuni viraje” (creionul de la Instrucțiuni, în meniul săgeții verzi) apar butoane noi: „⚡ Implicit” (principal = insigna + numele local al drumului spre care se face virajul, Înspre = „»”, TTS refăcut - cu confirmare dacă există deja date), „»” și „·” inserate unde e cursorul, „+ nume local” lângă Înspre, „🛡 Insigne” (tastezi A2, DN1A, E60, DEx12, DJ601, DC43, CB sau alegi din insignele văzute pe hartă în județ - fără segmente helper), „⚠️ Avertizare” (gabarit înălțime, tonaj, Bus/Taxi - în Înspre și în TTS). Lângă TTS: „⟳ Tot”, „+P”, „+Î”, „🗑” și „🔊 Simulare” (vocea WME: „În 800 de metri, virează la dreapta pe …”). Nimic nu ajunge pe hartă până nu apeși „Aplică”.', 'In the "Turn instructions" window (the pencil next to Instructions, in the green arrow menu) new buttons appear: "⚡ Default" (primary = shield + local name of the road being turned onto, Towards = "»", TTS rebuilt - with confirmation if data already exists), "»" and "·" inserted at the cursor, "+ local name" next to Towards, "🛡 Shields" (type A2, DN1A, E60, DEx12, DJ601, DC43, CB or pick from the shields seen on the map in the county - without helper segments), "⚠️ Warning" (height clearance, weight, Bus/Taxi - in Towards and in TTS). Next to TTS: "⟳ All", "+P", "+T", "🗑" and "🔊 Simulate" (the WME voice: "În 800 de metri, virează la dreapta pe …"). Nothing goes onto the map until you press "Apply".')
    );
    addToggle(
      'forceSidebarOpen',
      L('Ține panoul lateral mereu deschis', 'Keep the sidebar always open'),
      L('Redeschide automat panoul lateral dacă se ascunde singur. Oprită implicit.', 'Automatically reopens the sidebar if it hides by itself. Off by default.'),
      L('Verifică des dacă panoul lateral (Toate problemele / editare segment) e ascuns sau restrâns și îl redeschide imediat. Implicit oprită - activeaz-o doar dacă panoul chiar ți se închide singur.', 'Frequently checks whether the sidebar (All issues / segment editing) is hidden or collapsed and reopens it immediately. Off by default - enable it only if the sidebar really closes by itself.')
    );
    addToggle(
      'moveNodesTool',
      L('Buton "Mutare noduri" în bara rapidă', '"Move nodes" button in the quick bar'),
      L('Mută un nod de-a lungul geometriei existente, o distanță configurabilă.', 'Moves a node along the existing geometry, by a configurable distance.'),
      L(`La selectarea unui singur segment, buton care deschide un panou cu Nod A / Nod B - "în interior" scurtează capătul de-a lungul geometriei existente, "în exterior" îl lungește (preluând geometrie de la segmentul conectat, dacă există). Distanța (metri) e configurabilă din panou. Funcționează la noduri cu până la ${MOVE_NODES_MAX_CONNECTED_SEGMENTS} drumuri conectate în total - la 3 sau mai multe, drumul de continuitate e detectat automat (după unghi); dacă nu e clar care e continuarea, apare un avertisment în loc de o alegere la întâmplare.`, `When a single segment is selected, a button opens a panel with Node A / Node B - "inward" shortens that end along the existing geometry, "outward" extends it (taking geometry from the connected segment, if any). The distance (meters) is configurable in the panel. Works on nodes with up to ${MOVE_NODES_MAX_CONNECTED_SEGMENTS} connected roads in total - with 3 or more, the continuing road is detected automatically (by angle); if the continuation is unclear, a warning is shown instead of a random choice.`)
    );
    addToggle(
      'hnRapidTool',
      L('Buton "HN rapid" (numere de imobil secvențiale)', '"HN rapid" button (sequential house numbers)'),
      L('Adaugă rapid, prin click pe hartă, numere de imobil secvențiale.', 'Quickly adds sequential house numbers by clicking on the map.'),
      L('Înlocuiește vechiul buton "+HN" (care doar deschidea fluxul nativ de adăugare) din bara rapidă, în aceeași poziție. La selectarea unui singur segment, buton care deschide un panou pentru adăugare rapidă de numere de imobil: prefix liber + sufix literă (A-Z, fără diacritice) sau număr, crescător sau descrescător. După Start, fiecare click pe hartă adaugă numărul curent prin SDK pe segmentul selectat la Start (rămâne modificare NESALVATĂ, ca orice editare - anulabilă cu Undo/Ctrl+Z, definitivă doar la Salvează); verifică automat dubluri (deja salvate) pe toată strada înainte de fiecare adăugare. Dezactivată, bara rapidă rămâne fără niciun buton de HN (nu revine la vechiul "+HN").', 'Replaces the old "+HN" button (which only opened the native add flow) in the quick bar, in the same position. When a single segment is selected, a button opens a panel for quickly adding house numbers: free prefix + letter suffix (A-Z, no diacritics) or number, ascending or descending. After Start, each map click adds the current number via the SDK to the segment selected at Start (it stays an UNSAVED change, like any edit - undoable with Undo/Ctrl+Z, final only on Save); duplicates (already saved) along the whole street are checked automatically before each add. When disabled, the quick bar has no HN button at all (it does not revert to the old "+HN").')
    );
    addToggle(
      'publishStatusIndicator',
      L('Indicator stare publicare pe Livemap', 'Livemap publish status indicator'),
      L('Iconiță + vechime lângă lungime: verde = în ultimul build, albastru = recent, gri = mai vechi, portocaliu = încă nu.', 'Icon + age next to the length: green = in the last build, blue = recent, grey = older, orange = not yet.'),
      L('La selectarea unui singur segment, o iconiță (aceeași ca în istoricul nativ) imediat înaintea lungimii, cu vechimea ultimei modificări: portocaliu = nu a ajuns încă pe Livemap ("5h"); verde = a intrat în ULTIMUL build, deci e deja pe Livemap ("1d 21h"); albastru = publicată, cu până la 3 zile înainte de ultimul build ("3d"); gri = mai veche. Aceleași culori și la iconița „Ultima actualizare” din panoul lateral. Tooltip: data exactă și, la portocaliu, când va apărea estimativ pe Livemap. Sursa: fișierul public de stare a build-urilor (același ca istoricul WME). Necesită și "Lungime la segmentul selectat" activ pentru bara de lângă segment.', 'When a single segment is selected, an icon (the same as in the native history) right before the length, with the age of the last edit: orange = not on Livemap yet ("5h"); green = included in the LAST build, so already on Livemap ("1d 21h"); blue = published up to 3 days before the last build ("3d"); grey = older. The same colors on the "Last update" icon in the sidebar. Tooltip: the exact date and, for orange, an estimate of when it will appear on Livemap. Source: the public build status file (the same one the WME history uses). Also requires "Length on selected segment" enabled for the bar next to the segment.')
    );
    addToggle(
      'cutSegmentTool',
      L('Buton "Taie segmentul" (✂️) / scurtătură X', '"Cut segment" button (✂️) / X shortcut'),
      L('Un click pe hartă, lângă orice segment, îl taie exact în acel punct.', 'One click on the map, next to any segment, cuts it exactly at that point.'),
      L('Armează un mod de tăiere GLOBAL, FĂRĂ să fie nevoie de vreun segment selectat în prealabil: apare un punct alb + linie punctată, care urmăresc cursorul și se "prind" automat de segmentul cel mai apropiat, dintre toate cele încărcate - un singur click pe hartă, lângă orice segment, îl taie exact în acel punct (adaugă un nod nou), prin SDK (`splitSegment`). Rămâne modificare NESALVATĂ, ca orice editare - anulabilă cu Undo/Ctrl+Z. Escape anulează armarea fără să taie. Are și scurtătură de tastatură (X, vizibilă în panoul nativ "Scurtături Tastatură") - funcționează doar dacă tasta X e liberă (nu mai e folosită de alt script); butonul ✂️ (vizibil doar când e selectat un singur segment) armează exact aceeași unealtă globală.', 'Arms a GLOBAL cut mode, WITHOUT needing a segment selected beforehand: a white dot + dashed line appear, follow the cursor and automatically snap to the nearest segment among all loaded ones - a single map click next to any segment cuts it exactly at that point (adds a new node), via the SDK (`splitSegment`). It stays an UNSAVED change, like any edit - undoable with Undo/Ctrl+Z. Escape cancels without cutting. It also has a keyboard shortcut (X, visible in the native "Keyboard shortcuts" panel) - works only if the X key is free (not used by another script); the ✂️ button (visible only when a single segment is selected) arms exactly the same global tool.')
    );
    addToggle(
      'unpublishedSegmentsWarning',
      L('Avertizare segmente nepublicate, pe toată zona vizibilă', 'Unpublished segments warning, across the whole visible area'),
      L('Pastilă ⚠️ lângă fiecare segment vizibil nepublicat încă pe Livemap.', '⚠️ pill next to every visible segment not yet published on Livemap.'),
      L('O pastilă rotundă lângă FIECARE segment vizibil pe hartă a cărui ultimă modificare NU a ajuns încă pe Livemap (nu doar la segmentul selectat - asta face deja "Indicator stare publicare pe Livemap" de mai sus). Poziționată lângă segment, fără să-l acopere (ca pastila de lungime). Trece cu mouse-ul peste ea: se extinde și arată exact "Ultima actualizare: ... de <utilizator>" (ca la istoricul segmentului), cu link către profilul utilizatorului. Funcționează independent de orice selecție - poate rămâne activă tot timpul.', 'A round pill next to EVERY segment visible on the map whose last edit has NOT reached Livemap yet (not just the selected segment - that is what "Livemap publish status indicator" above does). Placed next to the segment without covering it (like the length pill). Hover over it: it expands and shows exactly "Last update: ... by <user>" (as in the segment history), with a link to the user\'s profile. Works independently of any selection - can stay on all the time.')
    );
    addToggle(
      'publishPillsFreshRecent',
      L('Pastile pe hartă și pentru modificările proaspete', 'Map pills for fresh edits too'),
      L('Pe lângă portocaliu: verde = în ultimul build, albastru = recente.', 'Besides orange: green = in the last build, blue = recent.'),
      L('Extinde pastilele de mai sus: pe lângă segmentele nepublicate (portocaliu) apar și cele a căror modificare a intrat în ULTIMUL build, deci e deja pe Livemap (verde), și cele modificate cu până la 3 zile înainte de el (albastru). Ajută să nu repari ceva deja reparat, raportat înainte să ajungă pe Livemap. Peste 60 de pastile vizibile au prioritate portocaliu, apoi verde, apoi albastru. Necesită „Avertizare segmente nepublicate” activ.', 'Extends the pills above: besides unpublished segments (orange), it also shows those whose edit made it into the LAST build, so already on Livemap (green), and those edited up to 3 days before it (blue). Helps you avoid fixing something already fixed, reported before it reached Livemap. Above 60 visible pills, priority goes to orange, then green, then blue. Requires "Unpublished segments warning" enabled.')
    );
    addToggle(
      'issueTrackerMapAll',
      L('Issue Tracker: harta arată toate problemele', 'Issue Tracker: map shows all issues'),
      L('Lista rămâne filtrată, harta arată toate problemele deschise.', 'The list stays filtered, the map shows all open issues.'),
      L('Când e activă, pe hartă apar toate problemele deschise (UR, PUR, MP, MS) din zona vizibilă, exact ca la filtrul "Toate problemele", indiferent de filtrul ales în Issue Tracker. Lista din coloana Issue Tracker rămâne filtrată normal. Se poate comuta și din "Straturi hartă" > Userscripts și din checkbox-ul din josul coloanei Issue Tracker (sub "Actualizează rezultatele când harta este mutată") - toate trei sunt sincronizate. Oprită implicit.', 'When enabled, the map shows all open issues (UR, PUR, MP, MS) in the visible area, exactly like the "All issues" filter, regardless of the filter chosen in the Issue Tracker. The list in the Issue Tracker column stays filtered as usual. Can also be toggled from "Map layers" > Userscripts and from the checkbox at the bottom of the Issue Tracker column (under "Update results when map moves") - all three are synced. Off by default.')
    );
    addToggle(
      'locationLabelFix',
      L('Numele localității deasupra hărții', 'Locality name above the map'),
      L('Readuce automat "Oraș, Județ" când WME afișează doar țara.', 'Automatically restores "City, County" when WME shows only the country.'),
      L('Deasupra hărții, WME afișează localitatea și județul zonei vizibile (ex. "Odorheiu Secuiesc, Județul Harghita"), dar adesea, după zoom sau mutarea hărții, rămâne doar țara ("Romania"). Cauza e un bug WME: localitatea e recalculată doar din ultimul lot de date primit, iar dacă lotul nu conține segmente, se pierde. Opțiunea recalculează localitatea din segmentele vizibile deja încărcate și reafișează numele, fără reîncărcarea hărții (nu e nevoie de butonul de reîncărcare).', 'Above the map, WME shows the city and county of the visible area (e.g. "Odorheiu Secuiesc, Județul Harghita"), but often, after zooming or moving the map, only the country remains ("Romania"). The cause is a WME bug: the location is recalculated only from the last batch of data received, and if that batch has no segments, it is lost. This option recalculates the location from the visible segments already loaded and shows the name again, without reloading the map (no need for the reload button).')
    );

    addToggle(
      'savedWarningsList',
      L('Lista avertizărilor salvate cu "Salvează oricum"', 'List of warnings saved with "Save anyway"'),
      L('Avertizările ignorate la salvare rămân într-o listă, ca să le repari ulterior.', 'Warnings ignored on save stay in a list, so you can fix them later.'),
      L('Când salvezi deși WME arată "S-ar putea să fie ceva neînregulă cu această editare" și apeși "Salvează", avertizările respective nu se mai pierd: apare o fereastră asemănătoare, cu fiecare avertizare în parte (inclusiv cele pe care WME le comasează), grupate pe salvări. Butonul de centrare (sau click pe text) mută harta pe problemă și selectează segmentul; coșul de gunoi șterge avertizarea din listă. Fereastra se poate restrânge sau ascunde - butonul portocaliu cu numărul de avertizări, de lângă Salvează, o redeschide. Lista ține doar în sesiunea curentă: dispare la reîncărcarea paginii.', 'When you save even though WME shows "Something might be wrong with this edit" and press "Save", those warnings are no longer lost: a similar window appears, with each warning listed separately (including those WME merges), grouped by save. The center button (or clicking the text) moves the map to the issue and selects the segment; the trash can removes the warning from the list. The window can be collapsed or hidden - the orange button with the warning count, next to Save, reopens it. The list lasts only for the current session: it is cleared on page reload.')
    );

    // --- Customizable texts (v0.42) ------------------------------------
    // The Romanian content that ends up on the map / in UR replies, editable
    // (or translatable). Empty field = default. Export / import as JSON.
    const ctDetails = document.createElement('details');
    ctDetails.style.cssText = 'margin: 14px 0 6px; border-top: 1px solid rgba(128,128,128,0.35); padding-top: 8px;';
    const ctSummary = document.createElement('summary');
    ctSummary.textContent = L('Texte personalizabile (conținut în română)', 'Customizable texts (Romanian content)');
    ctSummary.style.cssText = 'font-weight: 600; cursor: pointer;';
    ctDetails.appendChild(ctSummary);
    const ctInfo = document.createElement('div');
    ctInfo.style.cssText = 'color: #888; font-size: 11px; margin: 6px 0 8px;';
    ctInfo.textContent = L(
      'Textele care ajung pe hartă sau în răspunsurile UR. Le poți modifica sau traduce în limba ta. Câmp gol = textul implicit. {v} = valoare, {i} / {n} = numărul mesajului / total.',
      'The texts that end up on the map or in UR replies. You can change them or translate them into your language. Empty field = default text. {v} = value, {i} / {n} = message number / total.'
    );
    ctDetails.appendChild(ctInfo);
    const ctGroups = {
      ur: L('Răspunsuri UR', 'UR replies'),
      ti: L('Instrucțiuni viraje (avertizări, TTS)', 'Turn instructions (warnings, TTS)'),
      voice: L('Simulare vocală', 'Voice simulation'),
      es: L('Sugestii de hartă (mesaj de respingere)', 'Map suggestions (rejection message)'),
    };
    const ctInputs = {};
    const ctSave = () => {
      const out = {};
      Object.entries(ctInputs).forEach(([k, inp]) => {
        if (inp.value.trim() !== '' && inp.value !== CUSTOM_TEXT_DEFAULTS[k]) out[k] = inp.value;
      });
      settings.customTexts = out;
      saveSettings();
    };
    Object.entries(ctGroups).forEach(([g, gLabel]) => {
      const h = document.createElement('div');
      h.textContent = gLabel;
      h.style.cssText = 'font-weight: 600; font-size: 12px; margin: 8px 0 4px;';
      ctDetails.appendChild(h);
      CUSTOM_TEXT_DEFS.filter((d) => d.group === g).forEach((d) => {
        const r = document.createElement('label');
        r.style.cssText = 'display: block; font-size: 11px; margin-bottom: 5px;';
        const t = document.createElement('div');
        t.textContent = d.label;
        t.style.cssText = 'color: #888;';
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = d.def;
        inp.value = (settings.customTexts && settings.customTexts[d.key]) || '';
        inp.style.cssText = 'width: 100%; box-sizing: border-box; font-size: 12px;';
        inp.addEventListener('change', ctSave);
        ctInputs[d.key] = inp;
        r.append(t, inp);
        ctDetails.appendChild(r);
      });
    });
    const ctBtns = document.createElement('div');
    ctBtns.style.cssText = 'display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;';
    const ctBtn = (text, title, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.title = title;
      b.style.cssText = 'font-size: 11px; cursor: pointer;';
      b.addEventListener('click', fn);
      ctBtns.appendChild(b);
    };
    ctBtn(L('Copiază JSON', 'Copy JSON'), L('Copiază textele personalizate (de ex. o traducere) ca să le dai altcuiva', 'Copy the custom texts (e.g. a translation) to share them'), async () => {
      const json = JSON.stringify(settings.customTexts || {}, null, 2);
      try {
        await navigator.clipboard.writeText(json);
        phShowToast(L('Textele au fost copiate în clipboard.', 'Texts copied to the clipboard.'));
      } catch (e) {
        window.prompt(L('Copiază textul de mai jos:', 'Copy the text below:'), json);
      }
    });
    ctBtn(L('Importă JSON', 'Import JSON'), L('Lipește textele primite de la altcineva', 'Paste texts received from someone else'), () => {
      const raw = window.prompt(L('Lipește aici JSON-ul cu texte:', 'Paste the texts JSON here:'));
      if (!raw) return;
      try {
        const obj = JSON.parse(raw);
        Object.entries(ctInputs).forEach(([k, inp]) => {
          inp.value = typeof obj[k] === 'string' ? obj[k] : '';
        });
        ctSave();
        phShowToast(L('Textele au fost importate.', 'Texts imported.'));
      } catch (e) {
        phShowToast(L('JSON invalid.', 'Invalid JSON.'), true);
      }
    });
    ctBtn(L('Resetează tot', 'Reset all'), L('Revino la textele implicite (în română)', 'Back to the default (Romanian) texts'), () => {
      Object.values(ctInputs).forEach((inp) => {
        inp.value = '';
      });
      ctSave();
    });
    ctDetails.appendChild(ctBtns);
    wrap.appendChild(ctDetails);

    tabPane.appendChild(wrap);
  }

  // ---------------------------------------------------------------------
  // Utilitare geometrie
  // ---------------------------------------------------------------------

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  function normalizeAngle(rad) {
    let a = rad % TWO_PI;
    if (a < 0) a += TWO_PI;
    return a;
  }

  function haversineMeters(lon1, lat1, lon2, lat2) {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_M * c;
  }

  function pathLengthMeters(coords) {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      total += haversineMeters(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]);
    }
    return total;
  }

  function toDeg(rad) {
    return (rad * 180) / Math.PI;
  }

  // Bearing (degrees, 0-360) from (lon1,lat1) to (lon2,lat2) - standard
  // great-circle initial bearing formula, used by "Move nodes" to
  // extrapolate a dead-end beyond its existing geometry.
  function bearingDeg(lon1, lat1, lon2, lat2) {
    const phi1 = toRad(lat1);
    const phi2 = toRad(lat2);
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(phi2);
    const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLon);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  // Point at `distanceMeters` from (lon,lat) along `bearingDegVal`
  // (degrees) - standard "destination point given distance and bearing"
  // (great-circle) formula.
  function destinationPoint(lon, lat, bearingDegVal, distanceMeters) {
    const delta = distanceMeters / EARTH_RADIUS_M;
    const theta = toRad(bearingDegVal);
    const phi1 = toRad(lat);
    const lambda1 = toRad(lon);
    const phi2 = Math.asin(Math.sin(phi1) * Math.cos(delta) + Math.cos(phi1) * Math.sin(delta) * Math.cos(theta));
    const lambda2 =
      lambda1 +
      Math.atan2(
        Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
        Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2)
      );
    return [toDeg(lambda2), toDeg(phi2)];
  }

  // Linear lon/lat interpolation (fine approximation at short distances,
  // not great-circle slerp).
  function interpolateLonLat(pA, pB, frac) {
    return [pA[0] + (pB[0] - pA[0]) * frac, pA[1] + (pB[1] - pA[1]) * frac];
  }

  // Walks along a polyline from `coords[0]` by `distanceMeters`, keeping
  // the exact shape of the traversed curve (interpolates precisely, not
  // just snapping to the next vertex).
  //
  // Returns null if `distanceMeters` >= the total length of `coords` (not
  // enough geometry left) - caller should treat this as "segment too
  // short".
  //
  // On success: { point, keptCoords, removedCoords }
  //   - point: the new point, exactly `distanceMeters` from coords[0]
  //   - keptCoords: remaining geometry on this side (starts with `point`)
  //   - removedCoords: points consumed from coords[0] onward (including
  //     coords[0], the old node position), old node -> new point order -
  //     so the segment on the other side of the node can reuse this
  //     geometry exactly, with no shape loss.
  function walkAlongFromStart(coords, distanceMeters) {
    if (distanceMeters <= 0) {
      return { point: coords[0].slice(), keptCoords: coords.map((c) => c.slice()), removedCoords: [coords[0].slice()] };
    }
    let cumulative = 0;
    for (let i = 1; i < coords.length; i++) {
      const segLen = haversineMeters(coords[i - 1][0], coords[i - 1][1], coords[i][0], coords[i][1]);
      if (cumulative + segLen >= distanceMeters - 1e-9) {
        const frac = segLen === 0 ? 0 : (distanceMeters - cumulative) / segLen;
        const point = interpolateLonLat(coords[i - 1], coords[i], Math.min(1, Math.max(0, frac)));
        const keptCoords = [point, ...coords.slice(i).map((c) => c.slice())];
        const removedCoords = coords.slice(0, i).map((c) => c.slice());
        return { point, keptCoords, removedCoords };
      }
      cumulative += segLen;
    }
    return null; // not enough geometry left
  }

  // Projected (EPSG:900913/3857) coords of a legacy OpenLayers feature,
  // converted back to WGS84 lon/lat (standard inverse Web Mercator).
  function mercatorToLonLat(x, y) {
    const lon = (x / 20037508.34) * 180;
    let lat = (y / 20037508.34) * 180;
    lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
    return [lon, lat];
  }

  // Live node position, read directly from the legacy OpenLayers layer
  // (W.map.nodeLayer), not sdk.DataModel: while a node is being dragged
  // (before mouseup), sdk.DataModel.Nodes.getById(...) stays frozen at
  // the pre-drag position, but the matching OpenLayers feature's geometry
  // updates every frame.
  function getLiveNodeLonLat(nodeId) {
    if (!window.W || !window.W.map || !window.W.map.nodeLayer || !window.W.map.nodeLayer.features) return null;
    const feat = window.W.map.nodeLayer.features.find(
      (f) => f.attributes && f.attributes.wazeFeature && f.attributes.wazeFeature.id === nodeId
    );
    if (!feat || !feat.geometry) return null;
    return mercatorToLonLat(feat.geometry.x, feat.geometry.y);
  }

  // Live full geometry of a SEGMENT, read from the legacy OpenLayers layer
  // (`W.map.segmentLayer`), not sdk.DataModel - same freeze-during-drag
  // issue as nodes. Unlike a node (where only one point is "live" and the
  // rest is computed via anchor + fixed remainder), here the whole
  // geometry (`geometry.components`) updates live from one source,
  // whichever point of the line is being dragged.
  function getLiveSegmentLonLatCoords(segmentId) {
    if (!window.W || !window.W.map || !window.W.map.segmentLayer || !window.W.map.segmentLayer.features) return null;
    const feat = window.W.map.segmentLayer.features.find(
      (f) => f.attributes && f.attributes.wazeFeature && f.attributes.wazeFeature.id === segmentId
    );
    if (!feat || !feat.geometry || !feat.geometry.components) return null;
    const coords = feat.geometry.components.map((c) => mercatorToLonLat(c.x, c.y));
    return coords.length >= 2 ? coords : null;
  }

  // ---------------------------------------------------------------------
  // Per-segment data prep
  // ---------------------------------------------------------------------

  // For a segment connected to the selected node, finds the neighboring
  // point (first geometry point that isn't the node) and the "fixed"
  // length of the rest of the segment (the part that doesn't change while
  // only the selected node moves). Live total length = live-node-distance
  // to neighbor + this fixed length.
  function buildSegmentInfo(node, segment) {
    const coords = segment.geometry && segment.geometry.coordinates;
    if (!coords || coords.length < 2) return null;

    const isFromEnd = segment.fromNodeId === node.id;
    const isToEnd = segment.toNodeId === node.id;
    if (!isFromEnd && !isToEnd) return null; // shouldn't happen
    if (isFromEnd && isToEnd) return null; // self-loop segment - unsupported

    let anchorLonLat;
    let restCoords;
    if (isFromEnd) {
      anchorLonLat = coords[1];
      restCoords = coords.slice(1);
    } else {
      anchorLonLat = coords[coords.length - 2];
      restCoords = coords.slice(0, coords.length - 1);
    }

    return {
      segmentId: segment.id,
      anchorLonLat,
      fixedRemainderM: pathLengthMeters(restCoords),
      lastBearing: undefined,
      lengthBadge: null,
      angleBadge: null,
    };
  }

  // Rebuilds the info (neighbor point + fixed length) for all current
  // segments from sdk.DataModel. Used after each drag drop to pick up real
  // geometry changes (e.g. node snapped to another node) without
  // recreating the DOM.
  function refreshSegmentGeometry() {
    let node;
    try {
      node = sdk.DataModel.Nodes.getById({ nodeId: state.nodeId });
    } catch (e) {
      return;
    }
    if (!node) return;

    state.segments.forEach((segInfo) => {
      const segment = sdk.DataModel.Segments.getById({ segmentId: segInfo.segmentId });
      if (!segment) return;
      const fresh = buildSegmentInfo(node, segment);
      if (!fresh) return;
      segInfo.anchorLonLat = fresh.anchorLonLat;
      segInfo.fixedRemainderM = fresh.fixedRemainderM;
    });
  }

  // ---------------------------------------------------------------------
  // DOM badges
  // ---------------------------------------------------------------------

  // LENGTH badge: pill shape (rounded rectangle) - deliberately different
  // from the angle circles (ours and WME's Junction Angle Info) so they
  // stay visually distinct even next to each other. Neutral colors,
  // adapted to light/dark.
  function createLengthBadge() {
    const el = document.createElement('div');
    el.className = 'wme-nal-length-badge';
    el.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      transform: translate(-50%, -50%);
      min-width: 46px;
      min-height: 24px;
      padding: 0 8px;
      border-radius: 12px;
      border-width: 2px;
      border-style: solid;
      display: flex;
      align-items: center;
      justify-content: center;
      font: 700 11px/1 Arial, sans-serif;
      text-align: center;
      pointer-events: none;
      z-index: ${OWN_UI_Z_INDEX};
      box-shadow: 0 1px 4px rgba(0,0,0,0.35);
      white-space: nowrap;
    `;
    applyBadgeTheme(el);
    el.textContent = '-- m';
    document.body.appendChild(el);
    return el;
  }

  // Applies the current light/dark palette to a length badge.
  function applyBadgeTheme(el) {
    if (!el) return;
    const t = currentTheme();
    el.style.background = t.badgeBg;
    el.style.borderColor = t.badgeBorder;
    el.style.color = t.badgeText;
  }

  // Angle label styled after WME's native Junction Angle Info badge.
  // Only shown while actively dragging the node.
  function createAngleBadge() {
    const el = document.createElement('div');
    el.className = 'wme-nal-angle-badge';
    el.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #f0b96b;
      border: 1px solid rgba(0, 0, 0, 0.15);
      color: #1a1208;
      display: none;
      align-items: center;
      justify-content: center;
      font: 700 12px/1.15 Arial, sans-serif;
      text-align: center;
      pointer-events: none;
      z-index: ${OWN_UI_Z_INDEX};
      box-shadow: 0 1px 4px rgba(0,0,0,0.35);
      white-space: nowrap;
    `;
    el.textContent = '--°';
    document.body.appendChild(el);
    return el;
  }

  function removeAllBadges() {
    state.segments.forEach((segInfo) => {
      if (segInfo.lengthBadge) segInfo.lengthBadge.remove();
      if (segInfo.angleBadge) segInfo.angleBadge.remove();
    });
  }

  // ---------------------------------------------------------------------
  // Livemap publish status. Shows an indicator on the selected segment's
  // toolbar reflecting "Not published yet" vs "Update is published on
  // the Livemap".
  //
  // WME itself determines published/pending status by comparing
  // `modificationData.updatedOn` (exposed by the SDK on any Segment)
  // against `previous_build.last_edit_time` from a small public JSON
  // file (no auth required) hosted on Google Cloud Storage, one per
  // region - the same file backing the "last updated" icon in the
  // native sidebar history. Only one network request is needed (the
  // file itself is refreshed periodically); after that, checking any
  // number of segments is just a timestamp comparison with no extra
  // network cost per segment.
  // ---------------------------------------------------------------------

  const TILE_BUILD_STATUS_URLS = {
    row: 'https://storage.googleapis.com/waze-tile-build-public/current-build/intl-status.json',
    il: 'https://storage.googleapis.com/waze-tile-build-public/current-build/il-status.json',
    usa: 'https://storage.googleapis.com/waze-tile-build-public/current-build/na-status.json',
  };
  // The livemap build cycle runs roughly once a day (per the file's
  // `current_build`/`next_build` fields); refreshing every few minutes
  // is more than enough and avoids unnecessary network requests.
  const TILE_BUILD_STATUS_REFRESH_MS = 5 * 60 * 1000;

  const tileBuildStatusState = {
    data: null,
    lastFetchedAt: 0,
    fetchPromise: null,
    windowsFor: null, // `data` the cached `windows` were computed for
    windows: null,
  };

  // WME region comes from the URL's `env` param (`row` for
  // Romania/rest-of-world, same as everywhere except Israel and the
  // US) - the same key WME uses internally to pick the file.
  function detectWmeRegion() {
    try {
      const params = new URLSearchParams(window.location.search);
      const env = params.get('env');
      if (env && TILE_BUILD_STATUS_URLS[env]) return env;
    } catch (e) {
      // ignore - fall back to the default region below
    }
    return 'row';
  }

  function refreshTileBuildStatus() {
    const url = TILE_BUILD_STATUS_URLS[detectWmeRegion()];
    if (!url) return Promise.resolve(null);
    return fetch(url, { credentials: 'omit', cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        tileBuildStatusState.data = json;
        tileBuildStatusState.lastFetchedAt = Date.now();
        return json;
      })
      .catch((e) => {
        console.warn(`${SCRIPT_NAME}: nu am putut prelua starea de build a hărții (${url}).`, e);
        return null;
      });
  }

  // Starts a refresh only if data is missing/stale and none is already
  // in flight - safe to call often (e.g. from the live loop), since the
  // common case costs just a timestamp comparison.
  function ensureTileBuildStatusFresh() {
    const now = Date.now();
    if (tileBuildStatusState.data && now - tileBuildStatusState.lastFetchedAt < TILE_BUILD_STATUS_REFRESH_MS) {
      return;
    }
    if (tileBuildStatusState.fetchPromise) return;
    tileBuildStatusState.fetchPromise = refreshTileBuildStatus().finally(() => {
      tileBuildStatusState.fetchPromise = null;
    });
  }

  // Freshness classes (v0.37, Paul: make "already in the last build" edits
  // visibly different from older ones, so a fresh report about an edit
  // made two days ago doesn't look like it still needs fixing):
  //   'pending' - after previous_build.last_edit_time (not on Livemap yet);
  //   'fresh'   - published by the LAST build (after the build before it);
  //   'recent'  - up to 3 days older than that;
  //   'old'     - anything older;
  //   'unknown' - no build data yet / no modification info.
  const PUBLISH_RECENT_WINDOW_MS = 3 * 24 * 3600 * 1000;
  const PUBLISH_BUILD_PERIOD_MS = 24 * 3600 * 1000;
  const LS_TILE_BUILDS = 'wme-ro-tools.tileBuilds';

  function segmentEditTs(segment) {
    if (!segment || !segment.modificationData) return null;
    const ts = segment.modificationData.updatedOn ?? segment.modificationData.createdOn;
    return ts === null || ts === undefined ? null : ts;
  }

  // The status file only describes the previous build. Each previous build
  // seen is remembered (localStorage, per region) so the one before it is
  // known exactly; without it (first day, or WME not opened for a while)
  // builds are assumed daily: previous last_edit_time - 24h.
  function tileBuildHistoryRemember(prev) {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(`${LS_TILE_BUILDS}.${detectWmeRegion()}`) || '[]');
    } catch (e) {
      list = [];
    }
    if (!Array.isArray(list)) list = [];
    if (list.some((b) => b.id === prev.build_id)) return list;
    list.push({ id: prev.build_id, lastEdit: prev.last_edit_time, release: prev.release_time || null });
    list = list.slice(-10);
    try {
      localStorage.setItem(`${LS_TILE_BUILDS}.${detectWmeRegion()}`, JSON.stringify(list));
    } catch (e) {
      // storage unavailable - fall back to the 24h assumption
    }
    return list;
  }

  // { prevLastEdit, prevPrevLastEdit, prevPrevExact, currentLastEdit,
  //   currentEta, prevRelease } or null.
  function tileBuildWindows() {
    const data = tileBuildStatusState.data;
    if (!data || !data.previous_build || !data.previous_build.last_edit_time) return null;
    const prevLastEdit = Date.parse(data.previous_build.last_edit_time);
    if (Number.isNaN(prevLastEdit)) return null;
    if (tileBuildStatusState.windowsFor === data) return tileBuildStatusState.windows;
    const list = tileBuildHistoryRemember(data.previous_build);
    let prevPrevLastEdit = prevLastEdit - PUBLISH_BUILD_PERIOD_MS;
    let prevPrevExact = false;
    // The newest remembered build before this one, if it is really the
    // one right before (12h-36h earlier).
    const older = list
      .filter((b) => b.id < data.previous_build.build_id)
      .map((b) => Date.parse(b.lastEdit))
      .filter((t) => !Number.isNaN(t) && t < prevLastEdit)
      .sort((a, b) => b - a)[0];
    if (older && prevLastEdit - older >= 12 * 3600 * 1000 && prevLastEdit - older <= 36 * 3600 * 1000) {
      prevPrevLastEdit = older;
      prevPrevExact = true;
    }
    const cur = data.current_build || {};
    const windows = {
      prevLastEdit,
      prevPrevLastEdit,
      prevPrevExact,
      currentLastEdit: Date.parse(cur.last_edit_time) || null,
      currentEta: Date.parse(cur.estimated_completion_time) || null,
      prevRelease: Date.parse(data.previous_build.release_time) || null,
    };
    windows.history = list;
    tileBuildStatusState.windowsFor = data;
    tileBuildStatusState.windows = windows;
    return windows;
  }

  function classifyEditTs(ts) {
    if (ts === null || ts === undefined) return 'unknown';
    const w = tileBuildWindows();
    if (!w) return 'unknown';
    if (ts > w.prevLastEdit) return 'pending';
    if (ts > w.prevPrevLastEdit) return 'fresh';
    if (ts > w.prevPrevLastEdit - PUBLISH_RECENT_WINDOW_MS) return 'recent';
    return 'old';
  }

  // 'pending' | 'fresh' | 'recent' | 'old' | 'unknown' (see above).
  function getSegmentPublishStatus(segment) {
    return classifyEditTs(segmentEditTs(segment));
  }

  // Short age of an edit: "3d" for 'recent' / 'old', "1d 21h" / "21h" /
  // "35m" for 'fresh' / 'pending'.
  function formatEditAge(ts, status) {
    const ms = Math.max(0, Date.now() - ts);
    const days = Math.floor(ms / 86400000);
    const hours = Math.floor((ms % 86400000) / 3600000);
    if (status === 'recent' || status === 'old') return `${Math.max(1, days)}d`;
    if (days > 0) return hours ? `${days}d ${hours}h` : `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${Math.max(1, Math.floor(ms / 60000))}m`;
  }

  // "Joi 15.10, 05:30" (short weekday, like the native "Mar 13-10-2026").
  const RO_WEEKDAYS_SHORT = L(['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'], ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  function formatShortDateTime(ts) {
    const d = new Date(ts);
    return `${RO_WEEKDAYS_SHORT[d.getDay()]} ${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  // "45 min" / "1 oră" / "9 ore" / "1 zi 3 ore" / "3 zile".
  function formatAgoRo(ts) {
    const ms = Math.max(0, Date.now() - ts);
    const mins = Math.floor(ms / 60000);
    if (mins < 60) return `${Math.max(1, mins)} min`;
    const hours = Math.floor(mins / 60);
    const h = (n) => (n === 1 ? L('1 oră', '1 hour') : L(`${n} ore`, `${n} hours`));
    if (hours < 24) return h(hours);
    const days = Math.floor(hours / 24);
    const rest = hours % 24;
    const d = days === 1 ? L('1 zi', '1 day') : L(`${days} zile`, `${days} days`);
    return rest ? `${d} ${h(rest)}` : d;
  }

  // Short status words (Paul, v0.38.1/v0.39) - same on the map pills, the
  // segment toolbar tooltip and the sidebar row.
  const PUBLISH_STATUS_TEXT = {
    pending: L('Nu e încă pe Livemap', 'Not on Livemap yet'),
    fresh: L('Deja pe Livemap', 'Already on Livemap'),
    recent: L('Modificat recent', 'Recently edited'),
    old: L('Pe Livemap (modificare mai veche)', 'On Livemap (older edit)'),
  };

  // Release time of the build that carried an edit made at `ts` (already
  // published): exact from the remembered builds when known, otherwise
  // estimated from the daily cycle (previous release - k days).
  function buildReleaseForEdit(ts, w) {
    const known = (w.history || [])
      .map((b) => ({ lastEdit: Date.parse(b.lastEdit), release: Date.parse(b.release) }))
      .filter((b) => !Number.isNaN(b.lastEdit) && !Number.isNaN(b.release) && b.lastEdit >= ts)
      .sort((x, y) => x.lastEdit - y.lastEdit)[0];
    // Exact only if no unknown build can sit between the edit and it.
    if (known && known.lastEdit - ts < PUBLISH_BUILD_PERIOD_MS) return { release: known.release, approx: false };
    if (!w.prevRelease) return null;
    const k = Math.floor((w.prevLastEdit - ts) / PUBLISH_BUILD_PERIOD_MS);
    return { release: w.prevRelease - k * PUBLISH_BUILD_PERIOD_MS, approx: k > 0 };
  }

  // "Live: ..." line:
  //   pending - in the running build: "Live: estimat Vin 16.10, 06:30",
  //             else "Live: la asamblarea următoare";
  //   fresh   - "Live: ultima asamblare, de acum 9 ore (Joi 15.10, 05:30)";
  //   recent / old - "Live: asamblare din Mar 13.10, 05:30" ("≈" = estimated).
  function publishLiveText(ts, status) {
    const w = tileBuildWindows();
    if (!w || ts === null || ts === undefined) return '';
    if (status === 'pending') {
      if (w.currentLastEdit && ts <= w.currentLastEdit && w.currentEta) {
        return L(`Live: estimat ${formatShortDateTime(w.currentEta)} (asamblare în lucru)`, `Live: estimated ${formatShortDateTime(w.currentEta)} (build in progress)`);
      }
      return L('Live: la asamblarea următoare', 'Live: in the next build');
    }
    if (status === 'fresh') {
      if (!w.prevRelease) return L('Live: ultima asamblare', 'Live: last build');
      return L(`Live: ultima asamblare, de acum ${formatAgoRo(w.prevRelease)} (${formatShortDateTime(w.prevRelease)})`, `Live: last build, ${formatAgoRo(w.prevRelease)} ago (${formatShortDateTime(w.prevRelease)})`);
    }
    const r = buildReleaseForEdit(ts, w);
    if (!r) return '';
    return L(`Live: asamblare din ${r.approx ? '≈ ' : ''}${formatShortDateTime(r.release)}`, `Live: build of ${r.approx ? '≈ ' : ''}${formatShortDateTime(r.release)}`);
  }

  function publishStatusTitle(ts, status) {
    return [
      PUBLISH_STATUS_TEXT[status] || '',
      L(`Editat: ${formatNativeHistoryDate(ts)} (acum ${formatAgoRo(ts)})`, `Edited: ${formatNativeHistoryDate(ts)} (${formatAgoRo(ts)} ago)`),
      publishLiveText(ts, status),
    ]
      .filter(Boolean)
      .join('\n');
  }

  // Updates the status dot on the selected segment's badge - cheap no-op
  // (a string comparison) if nothing changed, to avoid needless DOM writes
  // every frame.
  function updatePublishStatusDot(segment) {
    if (!segmentState.publishDot) return;
    if (!settings.publishStatusIndicator) {
      segmentState.publishDot.style.display = 'none';
      return;
    }
    const ts = segmentEditTs(segment);
    const status = getSegmentPublishStatus(segment);
    // No age for 'old' edits ("4312d" says nothing useful).
    const age = status === 'unknown' || status === 'old' ? '' : formatEditAge(ts, status);
    const key = `${status}|${age}`;
    if (key === segmentState.publishDotLastStatus) return;
    segmentState.publishDotLastStatus = key;
    const dot = segmentState.publishDot;
    if (status === 'unknown') {
      dot.style.display = 'none';
      return;
    }
    dot.style.display = 'inline-flex';
    dot.innerHTML = age
      ? `${publishStatusIconSvg(status)}<span style="margin-left:3px; font-size:0.85em; color:${PUBLISH_STATUS_COLORS[status]};">${age}</span>`
      : publishStatusIconSvg(status);
    dot.title = publishStatusTitle(ts, status);
  }

  // Recolors the native "Last update" icon in the sidebar (the first
  // `i.status-icon` of the single selected segment's history list) with
  // the same classes. Polled; React may re-render the icon at any time.
  const PUBLISH_SIDEBAR_ATTR = 'data-wme-ro-pub';
  // Plus an own row right under the native "Last update" row, with the
  // status words and the "Live: ..." line (the native row keeps WME's
  // "Ultima actualizare" wording, it is React-owned).
  const PUBLISH_SIDEBAR_ROW_CLASS = 'wme-ro-tools-pub-live-row';
  function publishSidebarRemoveRow() {
    document.querySelectorAll(`.${PUBLISH_SIDEBAR_ROW_CLASS}`).forEach((el) => el.remove());
  }
  function publishSidebarRefresh() {
    const icon = document.querySelector('#edit-panel i.status-icon');
    if (!settings.publishStatusIndicator) {
      document.querySelectorAll(`[${PUBLISH_SIDEBAR_ATTR}]`).forEach((el) => {
        el.style.backgroundImage = '';
        el.removeAttribute(PUBLISH_SIDEBAR_ATTR);
      });
      publishSidebarRemoveRow();
      return;
    }
    if (!icon) {
      publishSidebarRemoveRow();
      return;
    }
    ensureTileBuildStatusFresh();
    let segment = null;
    try {
      const sel = sdk.Editing.getSelection();
      if (sel && sel.objectType === 'segment' && sel.ids.length === 1) {
        segment = sdk.DataModel.Segments.getById({ segmentId: sel.ids[0] });
      }
    } catch (e) {
      segment = null;
    }
    const status = segment ? getSegmentPublishStatus(segment) : 'unknown';

    // Info row under the native one.
    const li = icon.closest('li');
    const text =
      status === 'unknown'
        ? ''
        : [PUBLISH_STATUS_TEXT[status], publishLiveText(segmentEditTs(segment), status)].filter(Boolean).join(' · ');
    if (!li || !text) {
      publishSidebarRemoveRow();
    } else {
      let row = li.nextElementSibling;
      if (!row || !row.classList.contains(PUBLISH_SIDEBAR_ROW_CLASS)) {
        publishSidebarRemoveRow();
        row = document.createElement('li');
        row.className = PUBLISH_SIDEBAR_ROW_CLASS;
        row.style.cssText = 'list-style:none; font-size:12px; line-height:1.35; margin:1px 0 4px 15px;';
        li.insertAdjacentElement('afterend', row);
      }
      const color = PUBLISH_STATUS_COLORS[status] || '';
      if (row.textContent !== text) row.textContent = text;
      if (row.style.color !== color) row.style.color = color;
    }

    // 'pending' keeps WME's own orange icon.
    const want = status === 'fresh' || status === 'recent' || status === 'old' ? status : '';
    const key = want ? `${want}|${icon.className}` : '';
    if ((icon.getAttribute(PUBLISH_SIDEBAR_ATTR) || '') === key) return;
    if (want) {
      icon.style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(publishStatusIconSvg(want, 11))}")`;
      icon.setAttribute(PUBLISH_SIDEBAR_ATTR, key);
    } else {
      icon.style.backgroundImage = '';
      icon.removeAttribute(PUBLISH_SIDEBAR_ATTR);
    }
  }

  // Same badge as for a node, but a separate CSS class (handy for
  // debugging/inspection) - identical style.
  function createSegmentLengthBadge() {
    const el = createLengthBadge();
    el.className = 'wme-nal-segment-length-badge';
    return el;
  }

  function formatLength(m) {
    if (m < 10) return `${m.toFixed(1)} m`;
    return `${Math.round(m)} m`;
  }

  function formatAngle(deg) {
    return `${deg.toFixed(1)}°`;
  }

  // ---------------------------------------------------------------------
  // Live loop (requestAnimationFrame) - runs while the node is active
  // ---------------------------------------------------------------------

  function rafLoop() {
    if (!state.nodeId) return;

    const liveLonLat = getLiveNodeLonLat(state.nodeId);
    if (!liveLonLat) {
      // Node disappeared from the layer (deselected, deleted, or W.map
      // unavailable) - stop cleanly.
      deactivate();
      return;
    }

    const nodePix = sdk.Map.getPixelFromLonLat({ lonLat: { lon: liveLonLat[0], lat: liveLonLat[1] } });

    // Update length badges and store each segment's screen-space bearing.
    state.segments.forEach((segInfo) => {
      const anchorPix = sdk.Map.getPixelFromLonLat({
        lonLat: { lon: segInfo.anchorLonLat[0], lat: segInfo.anchorLonLat[1] },
      });
      const dx = anchorPix.x - nodePix.x;
      const dy = anchorPix.y - nodePix.y;
      const dist = Math.hypot(dx, dy) || 1;

      const bx = nodePix.x + (dx / dist) * LENGTH_BADGE_OFFSET_PX;
      const by = nodePix.y + (dy / dist) * LENGTH_BADGE_OFFSET_PX;
      segInfo.lengthBadge.style.left = `${bx}px`;
      segInfo.lengthBadge.style.top = `${by}px`;

      const liveEdgeM = haversineMeters(liveLonLat[0], liveLonLat[1], segInfo.anchorLonLat[0], segInfo.anchorLonLat[1]);
      segInfo.lengthBadge.textContent = formatLength(liveEdgeM + segInfo.fixedRemainderM);

      segInfo.lastBearing = normalizeAngle(Math.atan2(dy, dx));
    });

    // Detect active drag by comparing the live position (legacy layer)
    // with sdk.DataModel's position, which stays frozen at the
    // pre-drag location until mouseup.
    let isDragging = false;
    try {
      const settledNode = sdk.DataModel.Nodes.getById({ nodeId: state.nodeId });
      if (settledNode) {
        const settled = settledNode.geometry.coordinates;
        const driftM = haversineMeters(liveLonLat[0], liveLonLat[1], settled[0], settled[1]);
        isDragging = driftM > DRAG_THRESHOLD_M;
      }
    } catch (e) {
      isDragging = false;
    }

    if (isDragging) {
      updateAngleBadges(nodePix);
    } else if (state.wasDragging) {
      // Drag just ended (drop). Hide angle badges - JAI repositions its
      // own labels from here - and refresh geometry (neighbor point +
      // fixed length) for any real change (e.g. snapping to a node).
      hideAngleBadges();
      refreshSegmentGeometry();
    }
    state.wasDragging = isDragging;

    state.rafId = requestAnimationFrame(rafLoop);
  }

  function hideAngleBadges() {
    state.segments.forEach((segInfo) => {
      if (segInfo.angleBadge) segInfo.angleBadge.style.display = 'none';
    });
  }

  // Computes the angle between each 2 consecutive segments (ordered by
  // bearing around the node) and places the label on each pair's
  // bisector - matches WME's Junction Angle Info visual convention, but
  // recalculated live every frame while dragging.
  function updateAngleBadges(nodePix) {
    const segs = state.segments;
    const n = segs.length;
    if (n < 2) return;

    const order = segs.map((_, i) => i).sort((a, b) => segs[a].lastBearing - segs[b].lastBearing);

    for (let i = 0; i < n; i++) {
      const curIdx = order[i];
      const nextIdx = order[(i + 1) % n];
      const curBearing = segs[curIdx].lastBearing;
      let nextBearing = segs[nextIdx].lastBearing;
      if (nextBearing <= curBearing) nextBearing += TWO_PI;

      const gap = nextBearing - curBearing;
      const bisector = curBearing + gap / 2;
      const angleDeg = (gap * 180) / Math.PI;

      const badge = segs[curIdx].angleBadge;
      badge.style.display = 'flex';
      badge.style.left = `${nodePix.x + Math.cos(bisector) * ANGLE_BADGE_OFFSET_PX}px`;
      badge.style.top = `${nodePix.y + Math.sin(bisector) * ANGLE_BADGE_OFFSET_PX}px`;
      badge.textContent = formatAngle(angleDeg);
    }
  }

  // ---------------------------------------------------------------------
  // Length badge for a selected SEGMENT
  // ---------------------------------------------------------------------

  // Computes where to place the selected segment's length badge:
  // - if the segment's geometric midpoint (by length, not point count)
  //   is on screen, place the badge there (like a node);
  // - if the segment is long enough that its midpoint is off-screen,
  //   find the point on the path closest to the screen center and, if
  //   even that isn't fully visible, clamp it inside the viewport (with
  //   a small margin) so the badge stays visible, as close to center as
  //   possible.
  function computeSegmentBadgePosition(coords) {
    const pix = coords.map((c) => sdk.Map.getPixelFromLonLat({ lonLat: { lon: c[0], lat: c[1] } }));
    if (pix.length === 0) return null;
    if (pix.length === 1) return { x: pix[0].x, y: pix[0].y };

    // Screen-pixel length of each sub-segment between consecutive points,
    // plus total length, to find the midpoint by length.
    const segLens = [];
    let totalLen = 0;
    for (let i = 1; i < pix.length; i++) {
      const d = Math.hypot(pix[i].x - pix[i - 1].x, pix[i].y - pix[i - 1].y);
      segLens.push(d);
      totalLen += d;
    }

    // Position only (no direction) at a given traveled length (px) along
    // the path - reused below to sample direction over a window instead
    // of just the next sub-segment.
    function pointOnlyAtLength(targetLen) {
      let remaining = targetLen;
      for (let i = 0; i < segLens.length; i++) {
        if (remaining <= segLens[i] || i === segLens.length - 1) {
          const t = segLens[i] > 0 ? Math.min(1, Math.max(0, remaining / segLens[i])) : 0;
          return {
            x: pix[i].x + (pix[i + 1].x - pix[i].x) * t,
            y: pix[i].y + (pix[i + 1].y - pix[i].y) * t,
          };
        }
        remaining -= segLens[i];
      }
      const lastIdx = pix.length - 1;
      return { x: pix[lastIdx].x, y: pix[lastIdx].y };
    }

    // Returns the point plus local direction (unnormalized dx, dy) around
    // it - needed to offset the badge perpendicular to the line instead
    // of placing it exactly on it.
    //
    // Direction is sampled over a `DIRECTION_SAMPLE_WINDOW_PX` window on
    // both sides of the point rather than just the immediate neighbor:
    // on dense/near-duplicate point geometry, the sub-segment the
    // midpoint falls on can have near-zero pixel length, giving a
    // degenerate (~0,0) direction with nothing valid to offset against.
    // If the windowed direction is still near-zero (very short path),
    // fall back to the segment's overall end-to-end direction.
    function pointAtLength(targetLen) {
      const p = pointOnlyAtLength(targetLen);
      const behind = pointOnlyAtLength(Math.max(0, targetLen - DIRECTION_SAMPLE_WINDOW_PX));
      const ahead = pointOnlyAtLength(Math.min(totalLen, targetLen + DIRECTION_SAMPLE_WINDOW_PX));
      let dx = ahead.x - behind.x;
      let dy = ahead.y - behind.y;
      if (Math.hypot(dx, dy) < MIN_DIRECTION_VECTOR_PX) {
        const lastIdx = pix.length - 1;
        dx = pix[lastIdx].x - pix[0].x;
        dy = pix[lastIdx].y - pix[0].y;
      }
      return { x: p.x, y: p.y, dx, dy };
    }

    // Offsets a point perpendicular to the given (dx, dy) direction by
    // SEGMENT_LENGTH_BADGE_SIDE_OFFSET_PX pixels, so the badge sits
    // beside the segment line instead of on top of it.
    function offsetSideways(point) {
      const len = Math.hypot(point.dx, point.dy) || 1;
      // Perpendicular to (dx, dy): (-dy, dx), normalized.
      const nx = -point.dy / len;
      const ny = point.dx / len;
      return {
        x: point.x + nx * SEGMENT_LENGTH_BADGE_SIDE_OFFSET_PX,
        y: point.y + ny * SEGMENT_LENGTH_BADGE_SIDE_OFFSET_PX,
      };
    }

    // `viewportEl.clientWidth`/`clientHeight` only give the map's SIZE,
    // not its position in the window - the map doesn't start at x=0 when
    // the left sidebar is open, it starts at
    // `viewportEl.getBoundingClientRect().left`. `pix` coordinates (from
    // `sdk.Map.getPixelFromLonLat`) are already in window space (like
    // `ev.clientX`/`clientY`), so the "in viewport" clamp/check must use
    // [vx0, vx0+vw] / [vy0, vy0+vh], not [0, vw] / [0, vh].
    const { vw, vh, vx0, vy0 } = getMapViewportBounds();
    const margin = VIEWPORT_CLAMP_MARGIN_PX;
    const inView = (p) =>
      p.x >= vx0 + margin && p.x <= vx0 + vw - margin && p.y >= vy0 + margin && p.y <= vy0 + vh - margin;

    const mid = pointAtLength(totalLen / 2);
    if (inView(mid)) {
      return {
        ...clampToViewport(offsetSideways(mid), vw, vh, margin, vx0, vy0),
        rawX: mid.x,
        rawY: mid.y,
        dx: mid.dx,
        dy: mid.dy,
        segPix: pix,
      };
    }

    // Midpoint not visible (segment too long, off-screen) - find the
    // point on the path closest to the map's center (not the whole
    // window's).
    const cx = vx0 + vw / 2;
    const cy = vy0 + vh / 2;
    let best = mid;
    let bestDist = Infinity;
    for (let i = 1; i < pix.length; i++) {
      const ax = pix[i - 1].x;
      const ay = pix[i - 1].y;
      const bx = pix[i].x;
      const by = pix[i].y;
      const dx = bx - ax;
      const dy = by - ay;
      const lenSq = dx * dx + dy * dy;
      let t = lenSq > 0 ? ((cx - ax) * dx + (cy - ay) * dy) / lenSq : 0;
      t = Math.min(1, Math.max(0, t));
      const px = ax + dx * t;
      const py = ay + dy * t;
      const dist = Math.hypot(px - cx, py - cy);
      if (dist < bestDist) {
        bestDist = dist;
        best = { x: px, y: py, dx, dy };
      }
    }
    // Same guard as `pointAtLength`: if the sub-segment closest to the
    // screen center has a near-(0,0) direction (near-duplicate points),
    // fall back to the overall end-to-end direction.
    if (Math.hypot(best.dx, best.dy) < MIN_DIRECTION_VECTOR_PX) {
      const lastIdx = pix.length - 1;
      best = { x: best.x, y: best.y, dx: pix[lastIdx].x - pix[0].x, dy: pix[lastIdx].y - pix[0].y };
    }

    // Clamp inside the viewport (with margin) so the badge stays visible
    // even if the closest path point is still off-screen (segment that
    // never crosses the visible center).
    return {
      ...clampToViewport(offsetSideways(best), vw, vh, margin, vx0, vy0),
      rawX: best.x,
      rawY: best.y,
      dx: best.dx,
      dy: best.dy,
      segPix: pix,
    };
  }

  // `x0`/`y0` (default 0, for callers already working in full-window
  // space, e.g. menus/panels anchored to `window.innerWidth/innerHeight`)
  // = top-left corner of the valid area in window space. See
  // `computeSegmentBadgePosition` for the map case, which does NOT
  // start at (0,0) when the sidebar is open.
  function clampToViewport(point, vw, vh, margin, x0 = 0, y0 = 0) {
    return {
      x: Math.min(x0 + vw - margin, Math.max(x0 + margin, point.x)),
      y: Math.min(y0 + vh - margin, Math.max(y0 + margin, point.y)),
    };
  }

  // Map viewport bounds in window pixel space: { vw, vh, vx0, vy0 }.
  // `vx0`/`vy0` are the map's real top-left corner - normally read from
  // the map viewport element's own rect, but also pushed right past
  // `#sidebar`'s right edge when it's wider than that rect accounts for
  // (some sidebar panels, e.g. a problem/UR conversation, can visually
  // cover part of the map without the viewport element's own layout
  // rect shrinking to match - own badges/pills must still avoid them).
  function getMapViewportBounds() {
    const viewportEl = sdk.Map.getMapViewportElement ? sdk.Map.getMapViewportElement() : null;
    const vpRect = viewportEl ? viewportEl.getBoundingClientRect() : null;
    let vw = (viewportEl && viewportEl.clientWidth) || window.innerWidth;
    const vh = (viewportEl && viewportEl.clientHeight) || window.innerHeight;
    let vx0 = vpRect ? vpRect.left : 0;
    const vy0 = vpRect ? vpRect.top : 0;
    try {
      const sidebarEl = document.getElementById('sidebar');
      const sbRect = sidebarEl ? sidebarEl.getBoundingClientRect() : null;
      if (sbRect && sbRect.width > 0 && sbRect.right > vx0) {
        vw = vx0 + vw - sbRect.right; // keep the map's right edge fixed
        vx0 = sbRect.right;
      }
    } catch (e) {
      // ignore - falls back to the viewport element's own rect
    }
    return { vw, vh, vx0, vy0 };
  }

  // Liang-Barsky test for a line segment (x1,y1)-(x2,y2) intersecting an
  // axis-aligned rectangle (AABB) [left,right]x[top,bottom]. Used below
  // to check whether the badge+quick-bar rectangle truly never touches
  // the segment's polyline, not just whether it's far from a single
  // local tangent.
  function segmentIntersectsAABB(x1, y1, x2, y2, left, top, right, bottom) {
    let tmin = 0;
    let tmax = 1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const p = [-dx, dx, -dy, dy];
    const q = [x1 - left, right - x1, y1 - top, bottom - y1];
    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) {
        if (q[i] < 0) return false;
      } else {
        const r = q[i] / p[i];
        if (p[i] < 0) {
          if (r > tmax) return false;
          if (r > tmin) tmin = r;
        } else {
          if (r < tmin) return false;
          if (r < tmax) tmax = r;
        }
      }
    }
    return true;
  }

  // Checks whether a rectangle (centered at cx,cy, given width/height)
  // intersects the segment's FULL polyline (segPix, screen-px points) -
  // not just the local direction from a single sample point.
  //
  // On a short, tightly curved segment, the quick-action bar can be
  // wide enough that checking only the perpendicular distance from one
  // local tangent isn't enough: the wide rectangle can still cross the
  // curve elsewhere, where the path bends back toward it. This checks
  // the real intersection against the whole polyline instead.
  function rectIntersectsPolyline(cx, cy, w, h, segPix) {
    const left = cx - w / 2;
    const right = cx + w / 2;
    const top = cy - h / 2;
    const bottom = cy + h / 2;
    for (let i = 1; i < segPix.length; i++) {
      if (segmentIntersectsAABB(segPix[i - 1].x, segPix[i - 1].y, segPix[i].x, segPix[i].y, left, top, right, bottom)) {
        return true;
      }
    }
    return false;
  }

  // Checks whether a segment's path (lon/lat coords) physically
  // intersects the current map viewport (screen-px bounding box), with
  // no clamping - used only for multi-segment selection, where clamping
  // (like for a single selected segment) would pile up overlapping
  // badges at the screen edge for segments fully out of view. Tested
  // against the bounding box (not just endpoints) to also catch a
  // segment that crosses the viewport without any vertex actually
  // visible.
  function isSegmentPathInViewport(coords, vw, vh, x0 = 0, y0 = 0) {
    if (!coords.length) return false;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const c of coords) {
      const p = sdk.Map.getPixelFromLonLat({ lonLat: { lon: c[0], lat: c[1] } });
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    // `x0`/`y0` = the map's real top-left corner - see
    // `computeSegmentBadgePosition`.
    return maxX >= x0 && minX <= x0 + vw && maxY >= y0 && minY <= y0 + vh;
  }

  // Computes the quick-action bar position, independent of the length
  // badge (not just "below" it) - a fixed vertical-only offset would be
  // parallel to a vertical (N-S) segment and never actually clear it.
  // 1. Start from the same raw path point (rawX/rawY) and local
  //    direction (dx, dy) used for the badge.
  // 2. Compute how far the bar must be pushed perpendicular to fully
  //    clear its own rectangle (real width/height, measured from the
  //    DOM) from the line, regardless of segment angle:
  //    |nx|*halfWidth + |ny|*halfHeight + margin.
  // 3. Pick whichever of the 2 opposite perpendicular directions moves
  //    the bar toward screen center rather than toward the edge.
  // `QUICK_BAR_PUSH_MAX_STEPS`/`_STEP_PX` bound how many extra push
  // steps are tried beyond the minimum (which only clears the local
  // tangent) before giving up and using the last attempted position.
  const QUICK_BAR_PUSH_MAX_STEPS = 6;
  const QUICK_BAR_PUSH_STEP_PX = 24;

  function computeQuickBarPosition(pos, barW, barH, vw, vh, margin, segPix, x0 = 0, y0 = 0) {
    const len = Math.hypot(pos.dx, pos.dy) || 1;
    const nx = -pos.dy / len;
    const ny = pos.dx / len;
    const halfW = (barW || 160) / 2;
    const halfH = (barH || 28) / 2;
    const clearance = Math.abs(nx) * halfW + Math.abs(ny) * halfH + QUICK_BAR_CLEAR_MARGIN_PX;
    const baseMag =
      SEGMENT_LENGTH_BADGE_SIDE_OFFSET_PX + QUICK_BAR_OFFSET_BELOW_BADGE_PX + QUICK_BAR_EXTRA_CLEARANCE_PX + clearance;
    // `x0`/`y0` = the map's real top-left corner (see
    // `computeSegmentBadgePosition`) - the center used to pick the
    // perpendicular direction must be the map's center, not the window's.
    const cx = x0 + vw / 2;
    const cy = y0 + vh / 2;

    // On a short/tight curve, the bar's real rectangle (measured from
    // the DOM) can still overlap the path even when its center is at
    // the minimum perpendicular distance (`baseMag`) from a single
    // point - the polyline can bend back toward it elsewhere. When full
    // geometry (`segPix`) is available, test the real rectangle-vs-
    // polyline intersection and, if still overlapping, push further
    // along the already-chosen direction, up to a max attempt count
    // (then keep the last position as a best-effort fallback).
    function buildCandidate(mag) {
      const plus = { x: pos.rawX + nx * mag, y: pos.rawY + ny * mag };
      const minus = { x: pos.rawX - nx * mag, y: pos.rawY - ny * mag };
      const distPlus = Math.hypot(plus.x - cx, plus.y - cy);
      const distMinus = Math.hypot(minus.x - cx, minus.y - cy);
      return distMinus < distPlus ? minus : plus;
    }

    let chosen = buildCandidate(baseMag);

    if (segPix && segPix.length >= 2) {
      let mag = baseMag;
      let attempts = 0;
      while (
        rectIntersectsPolyline(chosen.x, chosen.y, barW || 160, barH || 28, segPix) &&
        attempts < QUICK_BAR_PUSH_MAX_STEPS
      ) {
        mag += QUICK_BAR_PUSH_STEP_PX;
        chosen = buildCandidate(mag);
        attempts++;
      }
    }

    return clampToViewport(chosen, vw, vh, margin, x0, y0);
  }

  function segmentRafLoop() {
    if (!segmentState.segmentId) return;

    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId: segmentState.segmentId });
    } catch (e) {
      segment = null;
    }
    if (!segment) {
      deactivateSegment();
      return;
    }
    // Live geometry (legacy OpenLayers layer) with SDK fallback - see
    // getLiveSegmentLonLatCoords: keeps length updated in real time
    // while dragging an endpoint node or a shape point of the selected
    // segment.
    const liveCoords = getLiveSegmentLonLatCoords(segmentState.segmentId);
    const coords = liveCoords || (segment.geometry && segment.geometry.coordinates);
    if (!coords || coords.length < 2) {
      deactivateSegment();
      return;
    }

    if (settings.publishStatusIndicator) {
      // Cheap check (a timestamp comparison in the common case) - the
      // status file is actually refreshed at most every 5 minutes (see
      // `ensureTileBuildStatusFresh`), so calling this from the live
      // loop (60 fps) adds no network cost.
      ensureTileBuildStatusFresh();
      updatePublishStatusDot(segment);
    }

    const pos = computeSegmentBadgePosition(coords);
    if (pos) {
      if (segmentState.lengthTextEl) {
        segmentState.lengthTextEl.textContent = formatLength(pathLengthMeters(coords));
      } else {
        segmentState.badge.textContent = formatLength(pathLengthMeters(coords));
      }

      if (segmentState.quickBar) {
        // Badge + quick bar are one merged visual element - position the
        // whole thing using its real (wider, due to the buttons)
        // measured size so it doesn't overlap the segment line. Uses the
        // map's real corner (`vx0`/`vy0`), not (0,0) - see
        // `computeSegmentBadgePosition` - otherwise it could get clamped
        // over the sidebar.
        const { vw, vh, vx0, vy0 } = getMapViewportBounds();
        const rect = segmentState.badge.getBoundingClientRect();
        const merged = computeQuickBarPosition(
          pos,
          rect.width,
          rect.height,
          vw,
          vh,
          VIEWPORT_CLAMP_MARGIN_PX,
          pos.segPix,
          vx0,
          vy0
        );
        // Manual offset (drag handle / length click, see
        // `wireQuickBarDrag`) applied on top of the auto-computed
        // position, not instead of it - the toolbar stays anchored to
        // the segment on pan/zoom, with just an extra adjustable offset.
        // Re-clamped to the viewport so dragging can't push it fully
        // off-screen.
        const withManualOffset = {
          x: merged.x + segmentState.manualOffset.dx,
          y: merged.y + segmentState.manualOffset.dy,
        };
        const final = clampToViewport(withManualOffset, vw, vh, VIEWPORT_CLAMP_MARGIN_PX, vx0, vy0);
        segmentState.badge.style.left = `${final.x}px`;
        segmentState.badge.style.top = `${final.y}px`;
      } else {
        segmentState.badge.style.left = `${pos.x}px`;
        segmentState.badge.style.top = `${pos.y}px`;
      }
    }

    segmentState.rafId = requestAnimationFrame(segmentRafLoop);
  }

  function deactivateSegment() {
    if (segmentState.rafId) cancelAnimationFrame(segmentState.rafId);
    segmentState.rafId = null;
    if (segmentState.dragCleanup) segmentState.dragCleanup();
    segmentState.dragCleanup = null;
    if (segmentState.badge) segmentState.badge.remove();
    segmentState.badge = null;
    segmentState.lengthTextEl = null;
    segmentState.dragHandle = null;
    segmentState.publishDot = null;
    segmentState.publishDotLastStatus = null;
    segmentState.manualOffset = { dx: 0, dy: 0 };
    removeQuickActionBar();
    removeUturnAlert();
    segmentState.segmentId = null;
  }

  function activateForSegment(segmentId) {
    deactivateSegment();

    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId });
    } catch (e) {
      return;
    }
    if (!segment) return;

    segmentState.segmentId = segmentId;
    segmentState.badge = createSegmentLengthBadge();
    // Clear the default text content ("-- m", set by `createLengthBadge`)
    // before appending our own children (handle + text) - otherwise the
    // original text node stays as the first child, duplicating `textEl`
    // below.
    segmentState.badge.textContent = '';
    // Drag handle, first element in the badge - see
    // `createDragHandle`/`wireQuickBarDrag`.
    const dragHandle = createDragHandle();
    segmentState.badge.appendChild(dragHandle);
    segmentState.dragHandle = dragHandle;
    wireQuickBarDrag(dragHandle);
    // Livemap publish status dot - second element in the badge, between
    // the handle and the length text. Hidden by default ('display:
    // none') until a known status is available (see
    // `updatePublishStatusDot`), to avoid flashing a wrong symbol on
    // every selection.
    const publishDot = document.createElement('span');
    publishDot.className = 'wme-nal-publish-status-dot';
    // `pointer-events: auto` is required here: the parent badge
    // (`createLengthBadge`) sets `pointer-events: none`, so without this
    // override hover never reaches this element and the native `title`
    // tooltip never shows, even though it's set - same issue as
    // `dragHandle` below. `display: inline-flex` (set in
    // `updatePublishStatusDot`) is needed so the icon SVG's
    // `align-items: center` keeps it aligned with the length text next
    // to it, like the script's other icons.
    publishDot.style.cssText =
      'display: none; align-items: center; margin-right: 3px; line-height: 1; cursor: default; pointer-events: auto;';
    segmentState.badge.appendChild(publishDot);
    segmentState.publishDot = publishDot;
    segmentState.publishDotLastStatus = null;
    // Length text lives in its own <span>, not directly on the element,
    // so the quick-action bar can be added as a sibling inside the same
    // badge container without per-frame text updates wiping it out.
    const textEl = document.createElement('span');
    textEl.className = 'wme-nal-pill-length-text';
    textEl.textContent = '-- m';
    segmentState.badge.appendChild(textEl);
    segmentState.lengthTextEl = textEl;
    // Clicking the length value also drags the toolbar, not just the
    // handle.
    wireQuickBarDrag(textEl);
    textEl.style.cursor = 'grab';

    if (settings.segmentQuickBar) {
      createQuickActionBar(segmentId);
    }
    if (settings.publishStatusIndicator) {
      ensureTileBuildStatusFresh();
      updatePublishStatusDot(segment);
    }
    // Check the selected segment's current state immediately (not only
    // after a change) - covers a segment already drawn in a problematic
    // configuration, with no click needed.
    checkAndAlertUturn(segmentId);
    segmentState.rafId = requestAnimationFrame(segmentRafLoop);
  }

  // ---------------------------------------------------------------------
  // Length badges for a MULTI-segment selection. One badge per selected
  // segment, no quick-action bar (that stays exclusive to a single
  // selected segment) - reuses `createSegmentLengthBadge` /
  // `computeSegmentBadgePosition` / `pathLengthMeters`, applied per id
  // in the selection instead of a single one.
  // ---------------------------------------------------------------------

  // Compares 2 id lists as sets (ignoring order) - WME should always
  // return the same order for the same selection, but comparing as a
  // set avoids needlessly recreating badges (flicker) if the order
  // still varies between 2 reads.
  function sameSegmentIdSet(a, b) {
    if (a.length !== b.length) return false;
    const setB = new Set(b);
    return a.every((id) => setB.has(id));
  }

  function deactivateMultiSegment() {
    if (multiSegmentState.rafId) cancelAnimationFrame(multiSegmentState.rafId);
    multiSegmentState.rafId = null;
    multiSegmentState.badges.forEach((badge) => badge.remove());
    multiSegmentState.badges.clear();
    multiSegmentState.segmentIds = [];
  }

  function activateForMultiSegments(segmentIds) {
    deactivateMultiSegment();
    multiSegmentState.segmentIds = segmentIds.slice();
    segmentIds.forEach((segmentId) => {
      multiSegmentState.badges.set(segmentId, createSegmentLengthBadge());
    });
    multiSegmentState.rafId = requestAnimationFrame(multiSegmentRafLoop);
  }

  function multiSegmentRafLoop() {
    if (multiSegmentState.badges.size === 0) return;

    const { vw, vh, vx0, vy0 } = getMapViewportBounds();

    multiSegmentState.badges.forEach((badge, segmentId) => {
      let segment;
      try {
        segment = sdk.DataModel.Segments.getById({ segmentId });
      } catch (e) {
        segment = null;
      }
      if (!segment) {
        // Segment disappeared from selection/map (deselected
        // individually, deleted, etc.) - remove only its badge, keep the
        // rest.
        badge.remove();
        multiSegmentState.badges.delete(segmentId);
        return;
      }
      const liveCoords = getLiveSegmentLonLatCoords(segmentId);
      const coords = liveCoords || (segment.geometry && segment.geometry.coordinates);
      if (!coords || coords.length < 2) {
        badge.remove();
        multiSegmentState.badges.delete(segmentId);
        return;
      }

      // In a multi-selection, a segment fully outside the current
      // viewport does not get a clamped edge badge (that would pile up
      // overlapping badges where several segments exit the same side of
      // the screen). Hide it entirely - it reappears with the correct
      // position as soon as it comes into view (map pan).
      if (!isSegmentPathInViewport(coords, vw, vh, vx0, vy0)) {
        badge.style.display = 'none';
        return;
      }

      const pos = computeSegmentBadgePosition(coords);
      if (pos) {
        badge.style.display = 'flex';
        badge.style.left = `${pos.x}px`;
        badge.style.top = `${pos.y}px`;
        badge.textContent = formatLength(pathLengthMeters(coords));
      }
    });

    if (multiSegmentState.badges.size === 0) {
      multiSegmentState.rafId = null;
      multiSegmentState.segmentIds = [];
      return;
    }

    multiSegmentState.rafId = requestAnimationFrame(multiSegmentRafLoop);
  }

  // ---------------------------------------------------------------------
  // Unpublished-segments warning, across the whole visible area.
  //
  // Unlike the per-selected-segment badge (`segmentState`) or the
  // multi-selection badges (`multiSegmentState`), this scans ALL loaded
  // segments (not just selected ones) and shows a warning badge (⚠️,
  // orange - same meaning as the 🟠 toolbar dot, for consistency) for
  // each one that is "pending" (unpublished) and visible on screen.
  // Currently selected segment(s) are excluded - they already have
  // their own 🔵/🟠 indicator (`publishStatusIndicator`), avoiding
  // duplicate/overlapping badges.
  //
  // Cost: the check itself (a per-segment timestamp comparison) is
  // negligible at any scale - the real cost is repeated DOM element
  // creation/removal. So the list of visible unpublished segments is
  // recomputed only periodically (`UNPUBLISHED_WARN_RESCAN_MS`), not
  // every frame - but already-created badges are repositioned every
  // frame (RAF) to track pan/zoom smoothly, like the rest of the
  // script's badges. `UNPUBLISHED_WARN_MAX_BADGES` caps the number of
  // simultaneous badges in a very dense area as a silent safety net (no
  // warning when hit - the oldest found during the scan stay shown).
  //
  // Runs independently of any selection (global watchdog, like
  // `forceSidebarOpen`) - active whenever the
  // `unpublishedSegmentsWarning` setting is on, regardless of what's
  // selected on the map.
  const UNPUBLISHED_WARN_RESCAN_MS = 1000;
  const UNPUBLISHED_WARN_MAX_BADGES = 60;
  // Extra offset (px) on top of the length-badge side offset
  // (`SEGMENT_LENGTH_BADGE_SIDE_OFFSET_PX`) so this warning pill doesn't
  // overlap a length badge shown for a multi-selected segment.
  const UNPUBLISHED_WARN_EXTRA_OFFSET_PX = 26;

  const unpublishedWarnState = {
    active: false, // toggled by `startUnpublishedWarnWatchdog`/`stopUnpublishedWarnWatchdog`
    badges: new Map(), // segmentId -> pill DOM element
    rafId: null,
    rescanIntervalId: null,
  };

  // The native history panel's "Last update" row shows a blue icon
  // (`status-icon status-created-icon`, same as "Created") when that edit is
  // already published, and an orange icon (`status-updated-icon`) when it
  // isn't - the icon reflects publish state, not row type. Matches our own
  // `getSegmentPublishStatus` detection. Both SVGs are copied inline here
  // rather than referenced from WME's versioned CDN URL, which would break
  // silently on a WME update. Only the orange variant is used below (this
  // pill only shows for unpublished segments); the toolbar status dot
  // (`updatePublishStatusDot`) uses both, replacing the old 🔵/🟠 emoji.
  const STATUS_ICON_ORANGE_SVG =
    '<svg width="12" height="12" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M5.5 11C2.46632 11 0 8.53368 0 5.5C0 2.46632 2.46632 0 5.5 0C8.53368 0 11 2.46632 11 5.5C11 8.53368 8.53368 11 5.5 11ZM8.58 4.97895H7.74632L6.93579 3.35789C6.83158 3.18421 6.65789 3.06842 6.46105 3.06842C6.26421 3.06842 6.07895 3.18421 5.99789 3.35789L4.53895 6.24105L4.05263 5.26842C3.96 5.09474 3.78632 4.97895 3.58947 4.97895H2.43158C2.14211 4.97895 1.91053 5.21053 1.91053 5.5C1.91053 5.78947 2.14211 6.02105 2.43158 6.02105H3.26526L4.07579 7.64211C4.24947 7.98947 4.82842 7.98947 5.00211 7.64211L6.44947 4.75895L6.94737 5.74316C7.04 5.91684 7.21368 6.03263 7.41053 6.03263H8.56842C8.85789 6.03263 9.08947 5.80105 9.08947 5.51158C9.08947 5.22211 8.86947 4.97895 8.58 4.97895Z" fill="#F18200"/></svg>';
  const STATUS_ICON_BLUE_SVG =
    '<svg width="12" height="12" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;"><path d="M5.5 11C2.46632 11 0 8.53368 0 5.5C0 2.46632 2.46632 0 5.5 0C8.53368 0 11 2.46632 11 5.5C11 8.53368 8.53368 11 5.5 11ZM8.58 4.97895H7.74632L6.93579 3.35789C6.83158 3.18421 6.65789 3.06842 6.46105 3.06842C6.26421 3.06842 6.07895 3.18421 5.99789 3.35789L4.53895 6.24105L4.05263 5.26842C3.96 5.09474 3.78632 4.97895 3.58947 4.97895H2.43158C2.14211 4.97895 1.91053 5.21053 1.91053 5.5C1.91053 5.78947 2.14211 6.02105 2.43158 6.02105H3.26526L4.07579 7.64211C4.24947 7.98947 4.82842 7.98947 5.00211 7.64211L6.44947 4.75895L6.94737 5.74316C7.04 5.91684 7.21368 6.03263 7.41053 6.03263H8.56842C8.85789 6.03263 9.08947 5.80105 9.08947 5.51158C9.08947 5.22211 8.86947 4.97895 8.58 4.97895Z" fill="#0099FF"/></svg>';
  // v0.37 colors: green = in the last build, blue = recent (3 days
  // before that), grey = older, orange = not published yet.
  const PUBLISH_STATUS_COLORS = {
    pending: '#F18200',
    fresh: '#2DB84C',
    recent: '#0099FF',
    old: '#9AA0A6',
  };
  function publishStatusIconSvg(status, size) {
    const base = status === 'pending' ? STATUS_ICON_ORANGE_SVG : STATUS_ICON_BLUE_SVG;
    let svg = base.replace(/#0099FF|#F18200/g, PUBLISH_STATUS_COLORS[status] || '#9AA0A6');
    if (size) svg = svg.replace('width="12" height="12"', `width="${size}" height="${size}"`);
    return svg;
  }
  // Alias kept so the warning pill code below doesn't need to reference
  // STATUS_ICON_ORANGE_SVG directly; always the orange variant.
  const UNPUBLISHED_WARN_ICON_SVG = STATUS_ICON_ORANGE_SVG;

  // Matches the native history panel's date format ("Joi 24-09-2026, 21:31").
  const RO_WEEKDAYS = L(['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'], ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  function pad2(n) {
    return String(n).padStart(2, '0');
  }
  function formatNativeHistoryDate(ts) {
    const d = new Date(ts);
    return `${RO_WEEKDAYS[d.getDay()]} ${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

  // Per-username cache (editor rank rarely changes) to avoid refetching on
  // repeated hovers. Caches the PROMISE itself, not just the result, so two
  // near-simultaneous hovers on the same user don't fire two requests.
  const unpublishedWarnUserCache = new Map(); // userName -> Promise<{rankDisplay, profileUrl}|null>
  function unpublishedWarnGetUserInfo(userName) {
    if (!userName) return Promise.resolve(null);
    if (unpublishedWarnUserCache.has(userName)) return unpublishedWarnUserCache.get(userName);
    const p = (async () => {
      try {
        const user = await sdk.DataModel.Users.getByUserName({ userName });
        let profileUrl = null;
        try {
          profileUrl = sdk.DataModel.Users.getUserProfileLink({ userName });
        } catch (e) {
          profileUrl = null;
        }
        const rankDisplay = user && typeof user.rank === 'number' ? user.rank + 1 : null;
        return { rankDisplay, profileUrl };
      } catch (e) {
        return null;
      }
    })();
    unpublishedWarnUserCache.set(userName, p);
    return p;
  }

  // Expands the pill on hover, showing the same text as the native history
  // panel's "Last update" row, including a link to the user's profile.
  // `rank` from the SDK is 0-indexed (like segment `lockRank`), so we
  // display `rank + 1`.
  //
  // Content stays in the DOM once loaded, so re-hovering the same pill
  // doesn't refetch or flash "Loading...".
  function unpublishedWarnExpand(el, textEl, segmentId) {
    el.style.maxWidth = '420px';
    el.style.padding = '3px 8px 3px 6px';
    el.style.justifyContent = 'flex-start';
    el.style.zIndex = String(OWN_UI_MENU_Z_INDEX);
    // The text has its own width/margin animation, separate from the
    // container's, so collapsing doesn't leave it visually off-center
    // (see `unpublishedWarnCollapse`).
    textEl.style.maxWidth = '380px';
    textEl.style.marginLeft = '6px';
    if (textEl.childNodes.length) return; // already loaded from a previous hover

    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId });
    } catch (e) {
      segment = null;
    }
    const md = (segment && segment.modificationData) || {};
    // Never-updated segments: fall back to the creation (same rule as
    // `segmentEditTs`).
    const updated = md.updatedOn !== null && md.updatedOn !== undefined;
    const userName = updated ? md.updatedBy : md.createdBy;
    const ts = updated ? md.updatedOn : md.createdOn;
    const status = el.dataset.pubStatus || 'pending';
    const statusPrefix = PUBLISH_STATUS_TEXT[status] ? `${PUBLISH_STATUS_TEXT[status]} · ` : '';
    const liveText = publishLiveText(ts, status);
    if (!userName || !ts) {
      textEl.textContent = L('Nu am putut citi ultima actualizare.', 'Could not read the last update.');
      return;
    }

    textEl.textContent = L('Se încarcă…', 'Loading…');
    const dateStr = formatNativeHistoryDate(ts);
    unpublishedWarnGetUserInfo(userName).then((info) => {
      // The pill may have been removed meanwhile (segment published/offscreen).
      if (!el.isConnected) return;
      textEl.textContent = '';
      textEl.append(L(`${statusPrefix}${updated ? 'Editat' : 'Creat'}: ${dateStr} (acum ${formatAgoRo(ts)}) de `, `${statusPrefix}${updated ? 'Edited' : 'Created'}: ${dateStr} (${formatAgoRo(ts)} ago) by `));
      const link = document.createElement('a');
      link.href = (info && info.profileUrl) || `https://www.waze.com/user/editor/${userName}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = info && info.rankDisplay != null ? `${userName}(${info.rankDisplay})` : userName;
      link.style.cssText = 'color: inherit; text-decoration: underline;';
      link.addEventListener('click', (ev) => ev.stopPropagation());
      textEl.appendChild(link);
      if (liveText) textEl.append(` · ${liveText}`);
    });
  }

  // While Shift / Ctrl+Shift / Ctrl is held (WME box selection, multi-
  // select) or a mouse button is down on the map (drag), the pills become
  // click-through: no hover expansion and no pointer capture. Otherwise
  // passing over a pill steals the mouse events from the map and cancels
  // the Shift box selection. Expanded pills collapse when this starts.
  const UNPUBLISHED_WARN_PASSTHROUGH_CLASS = 'wme-ro-tools-pill-passthrough';
  let unpublishedWarnModKeys = false;
  let unpublishedWarnMouseDown = false;

  function unpublishedWarnApplyPassthrough() {
    const on = unpublishedWarnModKeys || unpublishedWarnMouseDown;
    const root = document.documentElement;
    if (on === root.classList.contains(UNPUBLISHED_WARN_PASSTHROUGH_CLASS)) return;
    root.classList.toggle(UNPUBLISHED_WARN_PASSTHROUGH_CLASS, on);
    if (on) {
      unpublishedWarnState.badges.forEach((pill) => {
        const textEl = pill.lastElementChild;
        if (textEl) unpublishedWarnCollapse(pill, textEl);
      });
    }
  }

  function initUnpublishedWarnPassthrough() {
    const style = document.createElement('style');
    style.textContent = `.${UNPUBLISHED_WARN_PASSTHROUGH_CLASS} .wme-nal-unpublished-warn-pill { pointer-events: none !important; }`;
    document.head.appendChild(style);
    const onKey = (ev) => {
      unpublishedWarnModKeys = ev.shiftKey || ev.ctrlKey || ev.metaKey;
      unpublishedWarnApplyPassthrough();
    };
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKey, true);
    window.addEventListener(
      'mousedown',
      (ev) => {
        // Clicks on a pill itself (e.g. the profile link) stay normal.
        if (ev.target && ev.target.closest && ev.target.closest('.wme-nal-unpublished-warn-pill')) return;
        unpublishedWarnModKeys = ev.shiftKey || ev.ctrlKey || ev.metaKey;
        unpublishedWarnMouseDown = true;
        unpublishedWarnApplyPassthrough();
      },
      true
    );
    window.addEventListener(
      'mouseup',
      (ev) => {
        unpublishedWarnMouseDown = false;
        unpublishedWarnModKeys = ev.shiftKey || ev.ctrlKey || ev.metaKey;
        unpublishedWarnApplyPassthrough();
      },
      true
    );
    // Keys released while the window was unfocused (Alt+Tab).
    window.addEventListener('blur', () => {
      unpublishedWarnModKeys = false;
      unpublishedWarnMouseDown = false;
      unpublishedWarnApplyPassthrough();
    });
  }

  function unpublishedWarnCollapse(el, textEl) {
    el.style.maxWidth = '24px';
    el.style.padding = '0 4px';
    el.style.justifyContent = 'center';
    el.style.zIndex = String(OWN_UI_Z_INDEX);
    // The text collapses its own width to 0 (rather than relying on the
    // container's max-width/overflow alone) so `justify-content: center`
    // centers only the icon, regardless of how long the cached text is.
    // A container-only `gap` would otherwise keep nudging the icon off
    // center even with invisible text.
    textEl.style.maxWidth = '0';
    textEl.style.marginLeft = '0';
    // Text content is not cleared - stays cached for the next hover.
  }

  // Round pill using the same orange icon as the native history panel,
  // deliberately different from the script's rectangular length badges so
  // it stands out on the map. Expands on hover to show "Last update: ..."
  // (see `unpublishedWarnExpand`) - needs `pointer-events: auto` (length
  // badges use `none`).
  //
  // Uses the same semi-transparent, theme-aware background as the other
  // badges (`applyBadgeTheme`) rather than a solid orange fill, which
  // blended into orange/brown satellite imagery instead of standing out.
  function createUnpublishedWarnPill(segmentId, status) {
    const el = document.createElement('div');
    el.className = 'wme-nal-unpublished-warn-pill';
    el.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      transform: translate(-50%, -50%);
      height: 22px;
      max-width: 24px;
      padding: 0 4px;
      border-radius: 11px;
      border-width: 2px;
      border-style: solid;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      white-space: nowrap;
      font: 600 11px/1 Arial, sans-serif;
      cursor: default;
      z-index: ${OWN_UI_Z_INDEX};
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
      pointer-events: auto;
      transition: max-width 180ms ease, padding 180ms ease;
    `;
    // No `gap` on the container - it reserves space regardless of child
    // width, which would nudge the icon even with collapsed text. The
    // icon-text spacing is `margin-left` on the text instead, animated to
    // 0 on collapse.
    applyBadgeTheme(el);

    const iconEl = document.createElement('span');
    iconEl.style.cssText = 'display: inline-flex; flex-shrink: 0;';
    iconEl.innerHTML = status && status !== 'pending' ? publishStatusIconSvg(status) : UNPUBLISHED_WARN_ICON_SVG;
    el.appendChild(iconEl);
    el.dataset.pubStatus = status || 'pending';

    const textEl = document.createElement('span');
    // Text has its own width animation (see `unpublishedWarnCollapse`/
    // `unpublishedWarnExpand`); starts collapsed like the pill itself.
    textEl.style.cssText =
      'display: inline-block; overflow: hidden; max-width: 0; margin-left: 0; transition: max-width 180ms ease, margin-left 180ms ease; vertical-align: middle;';
    el.appendChild(textEl);

    el.addEventListener('mouseenter', (ev) => {
      // Shift/Ctrl held or a button pressed = box selection / map drag in
      // progress - don't expand (see `initUnpublishedWarnPassthrough`).
      if (ev.shiftKey || ev.ctrlKey || ev.metaKey || ev.buttons) return;
      unpublishedWarnExpand(el, textEl, segmentId);
    });
    el.addEventListener('mouseleave', () => unpublishedWarnCollapse(el, textEl));

    getMapOverlayContainer().appendChild(el);
    return el;
  }

  // Container for own map-anchored elements that must stay UNDER WME
  // panels. A z-index on an element attached to <body> can't do that: the
  // map, the layers menu and the UR/problem window all live inside
  // `.edit-area-main` (z-index 1), which competes as ONE block with
  // body-level elements - so anything in <body> is either above all of it
  // (panels included) or below all of it (map included). Inside
  // `#waze-map-container` (the parent of `#WazeMap`, z-index auto) the
  // siblings are (live-checked): `#WazeMap` z 0, `#overlay-buttons` z 1,
  // layers menu z 2, `#tippy-container` z 4, UR window
  // `#ISSUE_WINDOW_UPDATE_REQUEST` z 6. This container uses z-index 0 and
  // is appended AFTER `#WazeMap`, so it paints above the map (same z,
  // later in DOM) and below every WME panel; the left sidebar (z 5, outside
  // `.edit-area-main`) also covers it. Re-attached if WME re-renders.
  let mapOverlayContainerEl = null;

  function getMapOverlayContainer() {
    const wazeMapEl = document.getElementById('WazeMap');
    const parent = wazeMapEl && wazeMapEl.parentElement ? wazeMapEl.parentElement : document.body;
    if (!mapOverlayContainerEl) {
      mapOverlayContainerEl = document.createElement('div');
      mapOverlayContainerEl.id = 'wme-ro-tools-map-overlay';
      mapOverlayContainerEl.style.cssText =
        'position: fixed; left: 0; top: 0; width: 0; height: 0; pointer-events: none; z-index: 0;';
    }
    if (mapOverlayContainerEl.parentElement !== parent) parent.appendChild(mapOverlayContainerEl);
    return mapOverlayContainerEl;
  }

  // Starts from the same base position as the length badge
  // (`computeSegmentBadgePosition` - segment midpoint, clamped to the
  // viewport) and pushes it further out along the same perpendicular by
  // `UNPUBLISHED_WARN_EXTRA_OFFSET_PX`, so it doesn't overlap the length
  // badge. Overlap with WME panels is handled by stacking, not here - see
  // `getMapOverlayContainer`.
  function computeUnpublishedWarnPosition(coords) {
    const base = computeSegmentBadgePosition(coords);
    if (!base) return null;
    const len = Math.hypot(base.dx, base.dy) || 1;
    const nx = -base.dy / len;
    const ny = base.dx / len;
    const { vw, vh, vx0, vy0 } = getMapViewportBounds();
    return clampToViewport(
      { x: base.x + nx * UNPUBLISHED_WARN_EXTRA_OFFSET_PX, y: base.y + ny * UNPUBLISHED_WARN_EXTRA_OFFSET_PX },
      vw,
      vh,
      VIEWPORT_CLAMP_MARGIN_PX,
      vx0,
      vy0
    );
  }

  // Currently selected segments already show their own status indicator
  // (`publishStatusIndicator`), so they're excluded here to avoid duplicating it.
  function unpublishedWarnExcludedIds() {
    const excluded = new Set();
    if (segmentState.segmentId) excluded.add(segmentState.segmentId);
    multiSegmentState.segmentIds.forEach((id) => excluded.add(id));
    return excluded;
  }

  // Periodically (not every frame) recomputes the visible unpublished
  // segments: creates pills for newly found ones, removes pills for
  // segments no longer unpublished/visible/loaded (or now excluded).
  function unpublishedWarnRescan() {
    if (!unpublishedWarnState.active) return;

    ensureTileBuildStatusFresh();

    const { vw, vh, vx0, vy0 } = getMapViewportBounds();

    let segments;
    try {
      segments = sdk.DataModel.Segments.getAll();
    } catch (e) {
      segments = [];
    }

    const excluded = unpublishedWarnExcludedIds();
    const wantedIds = new Set();
    const rank = settings.publishPillsFreshRecent ? { pending: 0, fresh: 1, recent: 2 } : { pending: 0 };
    const candidates = [];
    for (const segment of segments) {
      if (excluded.has(segment.id)) continue;
      const coords = segment.geometry && segment.geometry.coordinates;
      if (!coords || coords.length < 2) continue;
      const status = getSegmentPublishStatus(segment);
      if (!(status in rank)) continue;
      if (!isSegmentPathInViewport(coords, vw, vh, vx0, vy0)) continue;
      candidates.push({ id: segment.id, status });
    }
    // Over the cap: orange first, then green, then blue.
    candidates.sort((a, b) => rank[a.status] - rank[b.status]);
    for (const { id, status } of candidates.slice(0, UNPUBLISHED_WARN_MAX_BADGES)) {
      wantedIds.add(id);
      const existing = unpublishedWarnState.badges.get(id);
      if (existing && existing.dataset.pubStatus !== status) {
        // Status changed (e.g. a build was released) - rebuild the pill.
        existing.remove();
        unpublishedWarnState.badges.delete(id);
      }
      if (!unpublishedWarnState.badges.has(id)) {
        unpublishedWarnState.badges.set(id, createUnpublishedWarnPill(id, status));
      }
    }

    unpublishedWarnState.badges.forEach((badge, segmentId) => {
      if (!wantedIds.has(segmentId)) {
        badge.remove();
        unpublishedWarnState.badges.delete(segmentId);
      }
    });
  }

  // Repositions already-created pills every frame (cheap - just lon/lat ->
  // pixel projection for segments already filtered by `unpublishedWarnRescan`)
  // so they track the map smoothly during pan/zoom.
  function unpublishedWarnRafLoop() {
    if (!unpublishedWarnState.active) {
      unpublishedWarnState.rafId = null;
      return;
    }
    // Cheap check - re-attaches the container if WME re-rendered the map.
    if (unpublishedWarnState.badges.size) getMapOverlayContainer();
    unpublishedWarnState.badges.forEach((badge, segmentId) => {
      let segment;
      try {
        segment = sdk.DataModel.Segments.getById({ segmentId });
      } catch (e) {
        segment = null;
      }
      const coords = segment && segment.geometry && segment.geometry.coordinates;
      if (!coords || coords.length < 2) {
        badge.style.display = 'none';
        return;
      }
      const pos = computeUnpublishedWarnPosition(coords);
      if (!pos) {
        badge.style.display = 'none';
        return;
      }
      badge.style.display = 'flex';
      badge.style.left = `${pos.x}px`;
      badge.style.top = `${pos.y}px`;
    });
    unpublishedWarnState.rafId = requestAnimationFrame(unpublishedWarnRafLoop);
  }

  function startUnpublishedWarnWatchdog() {
    if (unpublishedWarnState.active) return;
    unpublishedWarnState.active = true;
    ensureTileBuildStatusFresh();
    unpublishedWarnRescan();
    if (!unpublishedWarnState.rafId) unpublishedWarnState.rafId = requestAnimationFrame(unpublishedWarnRafLoop);
    if (!unpublishedWarnState.rescanIntervalId) {
      unpublishedWarnState.rescanIntervalId = setInterval(unpublishedWarnRescan, UNPUBLISHED_WARN_RESCAN_MS);
    }
  }

  function stopUnpublishedWarnWatchdog() {
    unpublishedWarnState.active = false;
    if (unpublishedWarnState.rescanIntervalId) clearInterval(unpublishedWarnState.rescanIntervalId);
    unpublishedWarnState.rescanIntervalId = null;
    if (unpublishedWarnState.rafId) cancelAnimationFrame(unpublishedWarnState.rafId);
    unpublishedWarnState.rafId = null;
    unpublishedWarnState.badges.forEach((badge) => badge.remove());
    unpublishedWarnState.badges.clear();
  }

  // ---------------------------------------------------------------------
  // Quick action bar next to the segment length badge. 8 icons: Unpaved,
  // Headlights, HOV/Bus, Lock level (dropdown), Direction (dropdown),
  // quick HN, Toll, Restrictions.
  //
  // Native WME icons (`<i class="w-icon-...">`) don't render outside their
  // original context (the segment details panel), so all 8 buttons use
  // self-contained hand-drawn monochrome SVG instead of the icon font.
  // ---------------------------------------------------------------------

  // Self-contained SVGs (24x24 viewBox, `currentColor`) - no external
  // font/asset dependency, so they render identically wherever inserted.
  const QUICK_BAR_ICON_UNPAVED_SVG =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18c2.5-5 4-1 6.5-6S12 17 14.5 12 18.5 6 21 11"/><circle cx="6" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1" fill="currentColor" stroke="none"/></svg>';
  const QUICK_BAR_ICON_HEADLIGHTS_SVG =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="8" cy="12" r="3.5"/><path d="M14 8h7M14 12h8M14 16h7"/></svg>';
  const QUICK_BAR_ICON_HOV_SVG =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="10" rx="2.5"/><path d="M3 11h18"/><circle cx="7.5" cy="18.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="16.5" cy="18.5" r="1.4" fill="currentColor" stroke="none"/></svg>';
  const QUICK_BAR_ICON_DIR_TWOWAY_SVG =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20M7 7l-5 5 5 5M17 7l5 5-5 5"/></svg>';
  const QUICK_BAR_ICON_DIR_ONEWAY_SVG =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h18M13 5l7 7-7 7"/></svg>';
  const QUICK_BAR_ICON_LOCK_SVG =
    '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  const QUICK_BAR_ICON_TOLL_SVG =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 6v12M9 9.3c0-1.1 1.2-2 3-2s3 .8 3 2c0 1.2-1.2 1.6-3 2s-3 .8-3 2c0 1.1 1.2 2 3 2s3-.8 3-2"/></svg>';
  // "Move nodes" icon: unicode "✥" (4-direction move symbol), more legible
  // at small size than a custom SVG. Font-size matched to the other 14px
  // SVG icons for visual consistency with the rest of the bar.
  const QUICK_BAR_ICON_MOVE_NODES_SVG = '<span style="font-size: 15px; line-height: 1;">✥</span>';

  function setQuickBarActive(btn, active) {
    if (btn) btn.style.background = active ? currentTheme().activeBg : 'transparent';
  }

  function makeQuickBarButton(innerHTML, title) {
    const btn = document.createElement('div');
    btn.className = 'wme-nal-quickbar-btn';
    btn.title = title;
    btn.innerHTML = innerHTML;
    btn.style.cssText = `
      min-width: 24px;
      height: 24px;
      padding: 0 3px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: transparent;
    `;
    btn.style.color = currentTheme().barText;
    return btn;
  }

  // Drag handle to manually reposition the selected segment's toolbar.
  // The automatic position (`computeQuickBarPosition`) stays active by
  // default; the handle only adds a manual offset on top
  // (`segmentState.manualOffset`), applied each frame in `segmentRafLoop`,
  // so the toolbar still tracks the segment on pan/zoom while allowing a
  // manual adjustment when the automatic position doesn't work (e.g.
  // overlapping native angle/direction arrows near a node).
  function createDragHandle() {
    const el = document.createElement('span');
    el.className = 'wme-nal-quickbar-drag-handle';
    el.title = L('Trage pentru a muta acest toolbar', 'Drag to move this toolbar');
    el.textContent = '⋮';
    el.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      margin-right: 4px;
      font: 700 14px/1 Arial, sans-serif;
      cursor: grab;
      pointer-events: auto;
      user-select: none;
      touch-action: none;
    `;
    return el;
  }

  // Same drag behavior is wired to both the "⋮" handle and the length
  // badge text (`segmentState.lengthTextEl`); both get explicit
  // `pointer-events: auto` (otherwise inherit `none` from the badge
  // container, which needs to stay click-through outside its buttons/handle).
  function wireQuickBarDrag(el) {
    if (!el) return;
    el.style.pointerEvents = 'auto';
    el.addEventListener('pointerdown', (ev) => {
      if (ev.button !== undefined && ev.button !== 0) return;
      ev.preventDefault();
      ev.stopPropagation();

      const startX = ev.clientX;
      const startY = ev.clientY;
      const startOffset = { ...segmentState.manualOffset };
      el.style.cursor = 'grabbing';

      const onMove = (moveEv) => {
        segmentState.manualOffset = {
          dx: startOffset.dx + (moveEv.clientX - startX),
          dy: startOffset.dy + (moveEv.clientY - startY),
        };
      };
      const onUp = () => {
        el.style.cursor = 'grab';
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
        segmentState.dragCleanup = null;
      };
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      segmentState.dragCleanup = onUp;
    });
  }

  function closeQuickBarDropdown() {
    if (segmentState.openDropdown) {
      segmentState.openDropdown.remove();
      segmentState.openDropdown = null;
    }
    document.removeEventListener('click', handleQuickBarOutsideClick, true);
  }

  function handleQuickBarOutsideClick(ev) {
    if (segmentState.openDropdown && !segmentState.openDropdown.contains(ev.target)) {
      closeQuickBarDropdown();
    }
  }

  // Generic vertical dropdown menu. Opens above the whole toolbar/badge
  // (anchored to the top of `segmentState.badge`, not just the triggering
  // button) with a small gap and square bottom corners where it meets the
  // bar, so it reads as one continuous block rather than a floating
  // element. Falls back to opening below (with corners flipped) if it
  // doesn't fit above. Closes on selection or outside click.
  function openQuickBarDropdown(anchorEl, items) {
    closeQuickBarDropdown();
    const t = currentTheme();
    const menu = document.createElement('div');
    menu.className = 'wme-nal-quickbar-dropdown';
    menu.style.cssText = `
      position: fixed;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      z-index: ${OWN_UI_MENU_Z_INDEX};
      overflow: hidden;
      font: 700 11px/1 Arial, sans-serif;
      min-width: 90px;
      border: 1px solid ${t.menuBorder};
      background: ${t.menuBg};
    `;
    items.forEach((item) => {
      const row = document.createElement('div');
      // Disabled entries (hazard types not yet available for Romania) are
      // rendered dimmed with a normal cursor rather than removed from the
      // menu, so they're visibly present but clearly unavailable. Hover
      // highlight only applies to active entries.
      const cursorStyle = item.disabled ? 'default' : 'pointer';
      const opacityStyle = item.disabled ? 'opacity: 0.45;' : '';
      row.style.cssText = `display: flex; align-items: center; gap: 6px; padding: 6px 10px; cursor: ${cursorStyle}; white-space: nowrap; color: ${t.menuText}; ${opacityStyle}`;
      if (item.iconHtml) {
        const iconWrap = document.createElement('span');
        iconWrap.style.cssText = 'display: flex; align-items: center; flex: 0 0 auto;';
        iconWrap.innerHTML = item.iconHtml;
        row.appendChild(iconWrap);
      }
      const labelEl = document.createElement('span');
      labelEl.textContent = item.label;
      row.appendChild(labelEl);
      if (!item.disabled) {
        row.addEventListener('mouseenter', () => {
          row.style.background = t.menuHoverBg;
        });
        row.addEventListener('mouseleave', () => {
          row.style.background = 'transparent';
        });
      }
      // Click stays wired even on disabled entries: `item.onSelect` for a
      // disabled entry is just an informational toast (see
      // `quickBarOpenPhMenu`), not a real action.
      row.addEventListener('click', (ev) => {
        ev.stopPropagation();
        closeQuickBarDropdown();
        item.onSelect();
      });
      menu.appendChild(row);
    });
    document.body.appendChild(menu);

    // Vertical position anchors to the whole toolbar/badge
    // (`segmentState.badge`), not just the triggering button; horizontal
    // alignment stays centered on `anchorEl`.
    //
    // Native <wz-icon> elements (used for PH menu icons) render their
    // shadow DOM content asynchronously, a tick after appendChild - so an
    // immediate `menu.getBoundingClientRect().height` read can measure the
    // menu before icons render, throwing off the above-toolbar positioning.
    // `reposition()` runs once immediately, then again after a short delay
    // if the menu has icons, to correct the position once they've rendered.
    const anchorRect = anchorEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const hasIcons = items.some((item) => item.iconHtml);

    function reposition() {
      const toolbarRect = (segmentState.badge || anchorEl).getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      let top = toolbarRect.top - menuRect.height - QUICK_BAR_DROPDOWN_GAP_PX;
      if (top < 8) {
        // Doesn't fit above - open below instead, with corners flipped.
        top = toolbarRect.bottom + QUICK_BAR_DROPDOWN_GAP_PX;
        menu.style.borderRadius = '0 0 6px 6px';
      } else {
        menu.style.borderRadius = '6px 6px 0 0';
      }
      let left = anchorRect.left + anchorRect.width / 2 - menuRect.width / 2;
      left = Math.min(vw - menuRect.width - 8, Math.max(8, left));
      menu.style.left = `${Math.round(left)}px`;
      menu.style.top = `${Math.round(top)}px`;
    }

    reposition();
    if (hasIcons) {
      setTimeout(reposition, 120);
    }

    segmentState.openDropdown = menu;
    // Delayed by a tick so the outside-click listener doesn't fire on the
    // click that's currently still propagating.
    setTimeout(() => document.addEventListener('click', handleQuickBarOutsideClick, true), 0);
  }

  function quickBarToggleUnpaved(segmentId) {
    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId });
    } catch (e) {
      return;
    }
    if (!segment) return;
    const wasUnpaved = !!segment.flagAttributes.unpaved;
    const roadTypeAtClick = segment.roadType;
    updateSegmentSafe(segmentId, { flagAttributes: { unpaved: !wasUnpaved } });
    // Same automation as the native "Unpaved" chip, applied directly since
    // `handleAutomationClickCapture` only listens for clicks on native
    // panel chips.
    if (settings.segmentAutomation) {
      applyUnpavedAutomation(segmentId, !wasUnpaved, roadTypeAtClick);
    }
    checkAndAlertUturn(segmentId);
    refreshQuickActionBar(segmentId);
  }

  function quickBarToggleFlag(segmentId, flagName) {
    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId });
    } catch (e) {
      return;
    }
    if (!segment) return;
    updateSegmentSafe(segmentId, { flagAttributes: { [flagName]: !segment.flagAttributes[flagName] } });
    refreshQuickActionBar(segmentId);
  }

  function quickBarOpenLockMenu(ev, segmentId, anchorEl) {
    ev.stopPropagation();
    const items = [1, 2, 3, 4, 5, 6].map((level) => ({
      label: `Lock ${level}`,
      onSelect: () => {
        updateSegmentSafe(segmentId, { lockRank: levelToRank(level) });
        refreshQuickActionBar(segmentId);
      },
    }));
    openQuickBarDropdown(anchorEl, items);
  }

  // Direction menu - shows only the other 2 options relative to the
  // current state, read from the isAtoB/isBtoA/isTwoWay booleans (there's
  // no single `direction` field to read).
  function quickBarOpenDirectionMenu(ev, segmentId, anchorEl) {
    ev.stopPropagation();
    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId });
    } catch (e) {
      segment = null;
    }
    if (!segment) return;
    const all = [
      { value: 'A_TO_B', label: 'A → B' },
      { value: 'B_TO_A', label: 'B → A' },
      { value: 'TWO_WAY', label: L('Ambele sensuri', 'Two way') },
    ];
    const currentValue = segment.isTwoWay ? 'TWO_WAY' : segment.isAtoB ? 'A_TO_B' : 'B_TO_A';
    const items = all
      .filter((opt) => opt.value !== currentValue)
      .map((opt) => ({
        label: opt.label,
        onSelect: () => {
          updateSegmentSafe(segmentId, { direction: opt.value });
          refreshQuickActionBar(segmentId);
        },
      }));
    openQuickBarDropdown(anchorEl, items);
  }

  // Buttons 6-8 have no write logic of their own - they just trigger the
  // native controls in the segment detail panel. The "$" (Toll) button
  // does not toggle `hasToll` directly; it only highlights the current
  // state (see `refreshQuickActionBar`) and opens the same native
  // restrictions modal as the TBR button (toll is actually set from that
  // modal, not via a simple toggle).

  // ---------------------------------------------------------------------
  // Permanent Hazard ("⚠️ PH") button on the segment quick bar.
  //
  // WME's SDK exposes no method to create a Permanent Hazard
  // (`sdk.DataModel.PermanentHazards` only has `getAll`/`getById`/
  // `getAllCameras`/`getCameraById`, no `add`/`create`) - the only path is
  // the native one: "+" menu (top-left) > "Pericol" submenu > desired
  // type, which ARMS placement mode (the user still has to click the
  // target road to actually place it).
  //
  // The mechanism below (click-opens "+", simulates hover on the
  // "Pericol" submenu to render it, finds the entry by its exact menu
  // text across the whole DOM + shadow DOM, then clicks it with retries)
  // is ported from the separate `wme-hazard-shortcuts` script, where it
  // was already working for "Curbe deosebit de periculoase" via a
  // keyboard shortcut. Here the same action is exposed from the selected
  // segment's quick bar instead of a global shortcut.
  //
  // Full list: all 9 hazard types active for Romania (per
  // `W.model.topCountry.attributes.supportedPermanentHazardTypes`) plus
  // the 5 types still disabled in the native menu (greyed out there too).
  //
  // Each entry has `label` (exact text, with diacritics, as shown in the
  // native "+" > "Pericol" menu) and `icon` (the native WME icon name,
  // read from the `name` attribute of the `<wz-icon>` element in the real
  // menu).
  //
  // `shortcutKey`/`shortcutShift`: for types that already have a native
  // WME keyboard shortcut, placement is armed by simulating that shortcut
  // (`phFireShortcut`) instead of the menu click sequence - simpler and
  // more robust (one keyboard event, no visible menu). Confirmed working
  // for the 3 active shortcuts (Z, Shift+X, Shift+A); a shortcut for a
  // still-disabled type (Shift+S) is a no-op (no error, just doesn't
  // arm) - safe to use for the other disabled types with a known
  // shortcut too.
  //
  // Types with no known shortcut (railway crossing, school zone,
  // dangerous curve, dangerous intersection, merging roads, toll booth,
  // narrow bridge) use the original simulated-click mechanism through the
  // "+" > "Pericol" menu (`phAttemptArmSequence`).
  //
  // `disabled: true` = type not yet available for Romania in WME (greyed
  // out in the native menu). The button stays enabled in our menu, but
  // `phArmHazardPlacement` shows a distinct "not available yet" message
  // if arming silently fails, so it doesn't look like a script bug.
  const PH_HAZARDS = [
    { id: 'traffic-light', label: 'Semafoare', labelEn: 'Traffic lights', icon: 'traffic-light', shortcutKey: 'A', shortcutShift: true },
    { id: 'speed-camera', label: 'Camere', labelEn: 'Speed cameras', icon: 'speed-camera', shortcutKey: 'X', shortcutShift: true },
    { id: 'railway-crossing', label: 'Trecere cale ferată', labelEn: 'Railroad crossing', icon: 'railway-crossing' },
    { id: 'school-zone', label: 'Zonă școlară', labelEn: 'School zone', icon: 'school-zone' },
    { id: 'dangerous-curve', label: 'Curbe deosebit de periculoase', labelEn: 'Sharp curve', icon: 'sharp-curve-ahead' },
    { id: 'dangerous-intersection', label: 'Intersecție periculoasă', labelEn: 'Dangerous intersection', icon: 'dangerous-intersection' },
    { id: 'merge-ahead', label: 'Drumuri convergente', labelEn: 'Merging roads', icon: 'merge-ahead' },
    { id: 'speed-bumps', label: 'Limitatoare de viteză', labelEn: 'Speed bumps', icon: 'speed-bumps', shortcutKey: 'Z', shortcutShift: false },
    { id: 'toll-booth', label: 'Stație taxare', labelEn: 'Toll booth', icon: 'toll-booth' },
    {
      id: 'raised-crosswalk',
      label: 'Trecere de pietoni supraînălțată',
      labelEn: 'Raised crosswalk',
      icon: 'raised-crosswalk',
      shortcutKey: 'K',
      shortcutShift: true,
      disabled: true,
    },
    {
      id: 'highway-crosswalk',
      label: 'Crosswalk: High-speed crossing',
      icon: 'highway-crosswalk',
      shortcutKey: 'Q',
      shortcutShift: true,
      disabled: true,
    },
    { id: 'narrow-bridge', label: 'Pod îngust', labelEn: 'Narrow bridge', icon: 'narrow-bridge', disabled: true },
    {
      id: 'both-lanes-ending',
      label: 'Lane end (abrupt)',
      icon: 'both-lanes-ending',
      shortcutKey: 'F',
      shortcutShift: true,
      disabled: true,
    },
    {
      id: 'both-shoulders-ending',
      label: 'Shoulder end (abrupt)',
      icon: 'both-shoulders-ending',
      shortcutKey: 'S',
      shortcutShift: true,
      disabled: true,
    },
  ];

  const PH_DESELECT_WAIT_MS = 250;
  const PH_MENU_OPEN_WAIT_MS = 250;
  const PH_SUBMENU_POLL_INTERVAL_MS = 60;
  const PH_SUBMENU_POLL_TIMEOUT_MS = 1500;
  const PH_ARM_CHECK_DELAY_MS = 200;
  const PH_ARM_CLICK_MAX_ATTEMPTS = 3;
  const PH_FULL_SEQUENCE_MAX_ATTEMPTS = 2;
  const PH_TOAST_AUTOHIDE_MS = 6000;

  function phSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Walks the whole DOM including shadow roots - the top-level "Pericol"
  // entry renders in shadow DOM, but individual entries are regular
  // slotted light DOM.
  function phDeepQueryAll(root, results) {
    results = results || [];
    const nodes = root.querySelectorAll ? root.querySelectorAll('*') : [];
    for (const el of nodes) {
      results.push(el);
      if (el.shadowRoot) phDeepQueryAll(el.shadowRoot, results);
    }
    return results;
  }

  function phFireMouse(el, type, x, y) {
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, composed: true, clientX: x, clientY: y, button: 0 }));
  }

  function phFirePointer(el, type, x, y) {
    el.dispatchEvent(
      new PointerEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        clientX: x,
        clientY: y,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true,
        button: 0,
      })
    );
  }

  // Simulates real hover (not just CSS :hover, which JS can't trigger) -
  // WME's "+" menu listens to synthetic pointer/mouse events to open the
  // "Pericol" submenu.
  function phSimulateHover(el) {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    phFirePointer(el, 'pointerover', cx, cy);
    phFirePointer(el, 'pointerenter', cx, cy);
    phFireMouse(el, 'mouseover', cx, cy);
    phFireMouse(el, 'mouseenter', cx, cy);
    phFireMouse(el, 'mousemove', cx, cy);
  }

  function phFindAddButton() {
    const icon = document.querySelector('i.w-icon-plus');
    return icon ? icon.closest('wz-button') : null;
  }

  function phFindPericolSubMenu() {
    const subMenus = Array.from(document.querySelectorAll('wz-menu-sub-menu'));
    const byTitle = subMenus.find((el) => el.getAttribute('sub-menu-title') === 'Pericol');
    if (byTitle) return byTitle;
    // Other WME languages (v0.41): the sub-menu whose items carry the
    // hazard icons (the icon names don't depend on the language).
    const icons = PH_HAZARDS.map((h) => h.icon);
    return (
      subMenus.find((el) =>
        Array.from(el.querySelectorAll(':scope > wz-menu-item wz-icon, :scope > wz-menu-sub-menu wz-icon')).some((i) =>
          icons.includes(i.getAttribute('name'))
        )
      ) || null
    );
  }

  // Finds the entry with the given exact text among leaf DOM + shadow DOM
  // elements. The click target must be the `wz-menu-item` element, not
  // the text span.
  function phFindHazardMenuItem(label, icon) {
    const all = phDeepQueryAll(document);
    const leaf = all.find((el) => el.children.length === 0 && el.textContent.trim() === label);
    if (leaf) return leaf.closest('wz-menu-item');
    // Other WME languages (v0.41): match by the item's icon name.
    if (!icon) return null;
    const ic = all.find((el) => el.tagName === 'WZ-ICON' && el.getAttribute('name') === icon && el.closest('wz-menu-item'));
    return ic ? ic.closest('wz-menu-item') : null;
  }

  async function phWaitForVisibleHazardItem(label, timeoutMs, icon) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const item = phFindHazardMenuItem(label, icon);
      if (item) {
        const r = item.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) return item;
      }
      await phSleep(PH_SUBMENU_POLL_INTERVAL_MS);
    }
    return null;
  }

  function phCloseAnyOpenMenu() {
    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape', code: 'Escape' }));
  }

  // Simulates a native WME shortcut (e.g. "Z", "Shift+X") as a keyboard
  // event on `document`. Unlike the "+" menu (which needs real hover),
  // WME's native shortcuts react to a synthetic `KeyboardEvent` on
  // `document` with no focus requirement. Sends both `keydown` and
  // `keyup`, with the letter case matching the modifier (WME reads `key`,
  // not just `code`).
  function phFireShortcut(hazard) {
    const upper = hazard.shortcutKey.toUpperCase();
    const opts = {
      key: hazard.shortcutShift ? upper : upper.toLowerCase(),
      code: `Key${upper}`,
      keyCode: upper.charCodeAt(0),
      which: upper.charCodeAt(0),
      shiftKey: !!hazard.shortcutShift,
      bubbles: true,
      cancelable: true,
      composed: true,
    };
    document.dispatchEvent(new KeyboardEvent('keydown', opts));
    document.dispatchEvent(new KeyboardEvent('keyup', opts));
  }

  // Returns 'armed' | 'not-armed'. Unlike the menu-based path, this never
  // touches the "+" menu DOM, so the only possible failure is WME not
  // entering placement mode (which is exactly what happens for a type
  // still disabled for Romania - the shortcut is a silent no-op).
  async function phAttemptShortcutArm(hazard) {
    phFireShortcut(hazard);
    await phSleep(PH_ARM_CHECK_DELAY_MS);
    const armed = sdk && sdk.Editing.isDrawingInProgress ? sdk.Editing.isDrawingInProgress() : false;
    return armed ? 'armed' : 'not-armed';
  }

  // Single attempt of the full menu sequence. Returns 'armed' |
  // 'no-button' | 'no-submenu' | 'no-item' | 'not-armed'.
  async function phAttemptArmSequence(label, icon) {
    const addButton = phFindAddButton();
    if (!addButton) return 'no-button';

    addButton.click();
    await phSleep(PH_MENU_OPEN_WAIT_MS);

    const pericolSubMenu = phFindPericolSubMenu();
    if (!pericolSubMenu) {
      phCloseAnyOpenMenu();
      return 'no-submenu';
    }

    phSimulateHover(pericolSubMenu);

    const item = await phWaitForVisibleHazardItem(label, PH_SUBMENU_POLL_TIMEOUT_MS, icon);
    if (!item) {
      phCloseAnyOpenMenu();
      return 'no-item';
    }

    // The first click right after the submenu becomes visible sometimes
    // just moves focus without arming placement - retry a few times on
    // the same element before giving up.
    let armed = false;
    for (let attempt = 0; attempt < PH_ARM_CLICK_MAX_ATTEMPTS && !armed; attempt++) {
      item.click();
      await phSleep(PH_ARM_CHECK_DELAY_MS);
      armed = sdk && sdk.Editing.isDrawingInProgress ? sdk.Editing.isDrawingInProgress() : false;
    }

    if (!armed) {
      phCloseAnyOpenMenu();
      return 'not-armed';
    }

    return 'armed';
  }

  // Minimal visual toast (not console.log/window.alert), styled to match
  // the rest of the custom UI - auto-hides after `PH_TOAST_AUTOHIDE_MS`,
  // click anywhere on it closes it early.
  let phToastEl = null;
  let phToastTimeoutId = null;
  // Optional `anchorRect` (DOMRect): if given, the toast appears right
  // below that rect (e.g. the "Mutare noduri" panel) instead of the
  // default bottom-right corner, so panel-related warnings show up near
  // where the user is working.
  function phShowToast(message, isError, anchorRect) {
    if (phToastTimeoutId) clearTimeout(phToastTimeoutId);
    if (phToastEl) phToastEl.remove();

    const t = currentTheme();
    const accent = isError ? '#e8590c' : '#2aa9c4';
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      ${anchorRect ? '' : 'bottom: 20px; right: 20px;'}
      max-width: 320px;
      z-index: ${OWN_UI_Z_INDEX + 50};
      background: ${t.barBg};
      border: 1px solid ${accent};
      border-left: 4px solid ${accent};
      border-radius: 6px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      padding: 8px 12px;
      font: 400 12px/1.4 Arial, sans-serif;
      color: ${t.badgeText};
      cursor: pointer;
    `;
    toast.textContent = message;
    toast.addEventListener('click', () => {
      toast.remove();
      if (phToastEl === toast) phToastEl = null;
    });
    document.body.appendChild(toast);
    if (anchorRect) {
      const toastRect = toast.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = Math.min(vw - toastRect.width - 8, Math.max(8, anchorRect.left));
      let top = anchorRect.bottom + 8;
      if (top + toastRect.height + 8 > vh) top = Math.max(8, anchorRect.top - toastRect.height - 8);
      toast.style.left = `${Math.round(left)}px`;
      toast.style.top = `${Math.round(top)}px`;
    }
    phToastEl = toast;
    phToastTimeoutId = setTimeout(() => {
      if (phToastEl === toast) {
        toast.remove();
        phToastEl = null;
      }
    }, PH_TOAST_AUTOHIDE_MS);
  }

  // Entry point: takes the full `hazard` object from `PH_HAZARDS` (not
  // just `label`) so it can pick the mechanism itself - native shortcut
  // (`phAttemptShortcutArm`) if `hazard.shortcutKey` is set, otherwise the
  // "+" > "Pericol" menu click sequence (`phAttemptArmSequence`, with one
  // full retry). The result is that placement is ARMED - the user still
  // has to click the target road themselves; we never auto-click the map,
  // which could place the hazard on the wrong road.
  // Deselects whatever is currently selected first (including the
  // segment the action started from) - this avoids intermittent failures
  // of the menu sequence and also matters for native shortcuts (some WME
  // shortcuts behave differently with an entity already selected).
  async function phArmHazardPlacement(hazard) {
    const label = hazard.label;
    const shownLabel = L(hazard.label, hazard.labelEn || hazard.label);
    try {
      if (sdk && sdk.Editing.getSelection && sdk.Editing.getSelection()) {
        sdk.Editing.clearSelection();
        await phSleep(PH_DESELECT_WAIT_MS);
      }
    } catch (e) {
      // ignore - if deselection fails, still attempt the sequence
    }

    let result = 'not-armed';
    if (hazard.shortcutKey) {
      // A native shortcut is a single keyboard event - no menu rendering
      // delay to retry against, so one attempt is enough.
      result = await phAttemptShortcutArm(hazard);
    } else {
      for (let attempt = 0; attempt < PH_FULL_SEQUENCE_MAX_ATTEMPTS; attempt++) {
        result = await phAttemptArmSequence(label, hazard.icon);
        if (result === 'armed') break;
      }
    }

    if (result === 'no-button') {
      phShowToast(L(`Nu am găsit butonul "+" din WME. Deschide manual "+" > Pericol > ${label}.`, `WME "+" button not found. Open "+" > Hazard > ${shownLabel} manually.`), true);
      return;
    }
    if (result === 'no-submenu') {
      phShowToast(L(`Nu am găsit submeniul "Pericol" din meniul "+". Deschide manual "+" > Pericol > ${label}.`, `"Hazard" submenu not found in the "+" menu. Open "+" > Hazard > ${shownLabel} manually.`), true);
      return;
    }
    if (result === 'no-item') {
      phShowToast(L(`Nu am găsit intrarea "${label}" în submeniul Pericol. Deschide manual "+" > Pericol.`, `Entry "${shownLabel}" not found in the Hazard submenu. Open "+" > Hazard manually.`), true);
      return;
    }
    if (result === 'not-armed') {
      // `disabled: true` types never reach here - `quickBarOpenPhMenu`
      // gives them a separate `onSelect` with only an informational toast,
      // before any arming attempt. This branch only handles an active
      // type that still failed to arm (a real error, not "unavailable for
      // Romania").
      if (hazard.shortcutKey) {
        phShowToast(
          L(`Scurtătura pentru "${label}" nu a armat plasarea. Încearcă din nou sau manual "+" > Pericol > ${label}.`, `The shortcut for "${shownLabel}" did not arm placement. Try again or use "+" > Hazard > ${shownLabel} manually.`),
          true
        );
      } else {
        phShowToast(L(`Am dat click pe "${label}", dar WME nu a intrat în modul de plasare. Încearcă din nou.`, `Clicked "${shownLabel}", but WME did not enter placement mode. Try again.`), true);
      }
      return;
    }

    phShowToast(L(`"${label}" armat - dă click pe drumul dorit ca să plasezi pericolul.`, `"${shownLabel}" armed - click the desired road to place the hazard.`), false);
  }

  // Reuses the native WME `<wz-icon>` component (renders correctly
  // anywhere in the DOM, not just its original menu - has its own
  // autonomous shadow DOM) with `name` taken from `PH_HAZARDS` (read from
  // the native "+" > "Pericol" menu via
  // `item.querySelector('wz-icon').getAttribute('name')`) - identical to
  // the real WME icon, not an approximation.
  function phHazardIconHtml(hazard) {
    return `<wz-icon name="${hazard.icon}" type="color" size="18"></wz-icon>`;
  }

  // `disabled` entries get `disabled: true` in `items` (rendered dimmed
  // by `openQuickBarDropdown`, no click cursor) and an `onSelect` that
  // never touches `phArmHazardPlacement` (no deselection, no
  // `KeyboardEvent`, no simulated menu click) - just an informational
  // toast, so unavailable types don't look identical to working ones.
  function quickBarOpenPhMenu(ev, anchorEl) {
    ev.stopPropagation();
    const items = PH_HAZARDS.map((h) => ({
      label: L(h.label, h.labelEn || h.label),
      iconHtml: phHazardIconHtml(h),
      disabled: !!h.disabled,
      onSelect: h.disabled
        ? () => phShowToast(L(`"${h.label}" nu este încă disponibil pentru România în WME.`, `"${h.labelEn || h.label}" is not yet available for Romania in WME.`), true)
        : () => phArmHazardPlacement(h),
    }));
    openQuickBarDropdown(anchorEl, items);
  }

  // Historical note: before v0.14.4, the "+HN" quick bar button used
  // `findHnButton()`/`quickBarClickNativeHn()` below to trigger the
  // native house-number add flow (found the WME button via the
  // `w-icon-home` icon, a stable anchor independent of UI language).
  // Removed in v0.14.4: the "HN rapid" ("#HN") button fully replaces the
  // old "+HN" in the same position (see `createQuickActionBar`).

  function quickBarClickNativeRestrictions() {
    const btn = document.querySelector('wz-button.edit-restrictions');
    if (btn) btn.click();
  }

  // Re-reads current segment state via the SDK and updates the bar
  // buttons' highlight/text (highlight = light blue background, adapted
  // for light/dark, on "active" states: unpaved/headlights/HOV/toll,
  // existing restrictions) and reapplies the current theme to badge and
  // bar, so it follows any live theme change. Runs on creation + on an
  // interval, not in rAF - these states don't need per-frame refresh.
  function refreshQuickActionBar(segmentId) {
    if (!segmentState.quickBar || !segmentState.quickBarEls || segmentId == null) return;
    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId });
    } catch (e) {
      segment = null;
    }
    if (!segment) {
      removeQuickActionBar();
      return;
    }

    const t = currentTheme();
    applyBadgeTheme(segmentState.badge);
    // The bar has no background/border of its own (inherits the badge
    // container) - only the vertical separator (border-left) follows the
    // theme.
    segmentState.quickBar.style.borderLeftColor = t.barBorder;

    const els = segmentState.quickBarEls;
    Object.values(els).forEach((btn) => {
      btn.style.color = t.barText;
    });

    const flags = segment.flagAttributes || {};
    setQuickBarActive(els.btnUnpaved, !!flags.unpaved);
    setQuickBarActive(els.btnHeadlights, !!flags.headlights);
    setQuickBarActive(els.btnHov, !!flags.nearbyHOV);

    const lockNumEl = els.btnLock.querySelector('.wme-nal-quickbar-locknum');
    if (lockNumEl) lockNumEl.textContent = String((segment.lockRank || 0) + 1);

    const dirWrap = els.btnDirection;
    const wantsTwoWay = !!segment.isTwoWay;
    if (dirWrap.dataset.dir !== (wantsTwoWay ? 'two' : 'one')) {
      dirWrap.innerHTML = wantsTwoWay ? QUICK_BAR_ICON_DIR_TWOWAY_SVG : QUICK_BAR_ICON_DIR_ONEWAY_SVG;
      dirWrap.dataset.dir = wantsTwoWay ? 'two' : 'one';
    }
    if (!wantsTwoWay) {
      const svgEl = dirWrap.querySelector('svg');
      if (svgEl) svgEl.style.transform = segment.isBtoA ? 'scaleX(-1)' : '';
    }

    let tollActive = false;
    try {
      tollActive = !!sdk.DataModel.Segments.isTollSegment({ segmentId });
    } catch (e) {
      tollActive = false;
    }
    setQuickBarActive(els.btnToll, tollActive);
    setQuickBarActive(els.btnRestrictions, !!segment.hasRestrictions);
  }

  // The bar is not a separate `position: fixed` element; it's a flex row
  // appended as a child inside the same pill (`segmentState.badge`), right
  // after the length text - visually a single continuous element (badge +
  // bar). Only the badge container has its own position/z-index; the bar
  // inherits the badge's background/theme and just adds a thin vertical
  // separator.
  function createQuickActionBar(segmentId) {
    const t = currentTheme();
    const bar = document.createElement('div');
    bar.className = 'wme-nal-quickbar';
    bar.style.cssText = `
      display: flex;
      align-items: center;
      gap: 2px;
      padding-left: 6px;
      margin-left: 2px;
      border-left: 1px solid ${t.barBorder};
      pointer-events: auto;
    `;
    segmentState.badge.appendChild(bar);

    const btnUnpaved = makeQuickBarButton(QUICK_BAR_ICON_UNPAVED_SVG, L('Neasfaltat', 'Unpaved'));
    const btnHeadlights = makeQuickBarButton(QUICK_BAR_ICON_HEADLIGHTS_SVG, L('Faruri obligatorii', 'Headlights required'));
    const btnHov = makeQuickBarButton(QUICK_BAR_ICON_HOV_SVG, 'HOV / Bus');
    const btnLock = makeQuickBarButton(
      `${QUICK_BAR_ICON_LOCK_SVG}<span class="wme-nal-quickbar-locknum" style="margin-left:2px;">-</span>`,
      L('Nivel de blocare (Lock level)', 'Lock level')
    );
    const btnDirection = makeQuickBarButton(QUICK_BAR_ICON_DIR_TWOWAY_SVG, L('Direcție', 'Direction'));
    btnDirection.dataset.dir = 'two';
    // The old "+HN" button (native add flow, `quickBarClickNativeHn`/
    // `findHnButton`, removed with it) is fully replaced by "HN rapid"
    // (sequential add via SDK, see v0.14.0+), in the same bar position
    // (after Direction, before Toll).
    const btnHnRapid = settings.hnRapidTool
      ? makeQuickBarButton('<span>#HN</span>', L('HN rapid - adaugă rapid mai multe numere de imobil secvențiale', 'Quick HN - quickly add several sequential house numbers'))
      : null;
    const btnToll = makeQuickBarButton(QUICK_BAR_ICON_TOLL_SVG, L('Drum cu taxă (Toll) - click deschide fereastra de restricții', 'Toll road - click opens the restrictions window'));
    const btnRestrictions = makeQuickBarButton('<span>TBR</span>', L('Restricții (Time Based Restrictions)', 'Time Based Restrictions'));
    // "⚠️ PH" (Permanent Hazard) button - opens a menu (see
    // `quickBarOpenPhMenu`) with the available hazard types (see
    // `PH_HAZARDS`).
    const btnPh = makeQuickBarButton('<span>⚠️PH</span>', L('Adaugă Pericol Permanent', 'Add Permanent Hazard'));
    const btnMoveNodes = settings.moveNodesTool
      ? makeQuickBarButton(QUICK_BAR_ICON_MOVE_NODES_SVG, L('Mutare noduri (de-a lungul geometriei existente)', 'Move nodes (along the existing geometry)'))
      : null;
    // "Taie segmentul" (✂️, split segment) button - see the "Taie
    // segmentul" section below for full details (arm/disarm, visual
    // indicator, `splitSegment`).
    const btnCut = settings.cutSegmentTool
      ? makeQuickBarButton('<span>✂️</span>', L('Taie orice segment (X) - click apoi click pe hartă, lângă orice segment, ca să-l tai (adaugă un nod nou)', 'Cut any segment (X) - click, then click on the map next to any segment to cut it (adds a new node)'))
      : null;

    [btnUnpaved, btnHeadlights, btnHov, btnLock, btnDirection, btnHnRapid, btnToll, btnRestrictions, btnPh, btnMoveNodes, btnCut]
      .filter(Boolean)
      .forEach((b) => bar.appendChild(b));

    btnUnpaved.addEventListener('click', () => quickBarToggleUnpaved(segmentId));
    btnHeadlights.addEventListener('click', () => quickBarToggleFlag(segmentId, 'headlights'));
    btnHov.addEventListener('click', () => quickBarToggleFlag(segmentId, 'nearbyHOV'));
    btnLock.addEventListener('click', (ev) => quickBarOpenLockMenu(ev, segmentId, btnLock));
    btnDirection.addEventListener('click', (ev) => quickBarOpenDirectionMenu(ev, segmentId, btnDirection));
    // "$" (Toll) doesn't toggle hasToll directly - only highlights the
    // state (see refreshQuickActionBar) and opens the same native modal as
    // TBR.
    btnToll.addEventListener('click', () => quickBarClickNativeRestrictions());
    btnRestrictions.addEventListener('click', () => quickBarClickNativeRestrictions());
    btnPh.addEventListener('click', (ev) => quickBarOpenPhMenu(ev, btnPh));
    if (btnMoveNodes) {
      btnMoveNodes.addEventListener('click', (ev) => quickBarToggleMoveNodesPanel(ev, segmentId, btnMoveNodes));
    }
    if (btnHnRapid) {
      btnHnRapid.addEventListener('click', (ev) => quickBarToggleHnPanel(ev, segmentId, btnHnRapid));
    }
    if (btnCut) {
      btnCut.addEventListener('click', (ev) => quickBarToggleCut(ev, btnCut));
    }

    segmentState.quickBar = bar;
    segmentState.quickBarEls = {
      btnUnpaved,
      btnHeadlights,
      btnHov,
      btnLock,
      btnDirection,
      btnToll,
      btnRestrictions,
      btnPh,
      btnMoveNodes,
      btnHnRapid,
      btnCut,
    };

    refreshQuickActionBar(segmentId);
    segmentState.quickBarRefreshId = setInterval(() => refreshQuickActionBar(segmentState.segmentId), 400);

    return bar;
  }

  function removeQuickActionBar() {
    if (segmentState.quickBarRefreshId) clearInterval(segmentState.quickBarRefreshId);
    segmentState.quickBarRefreshId = null;
    closeQuickBarDropdown();
    closeMoveNodesPanel();
    // Don't close the "HN rapid" panel while a sequence is ACTIVE (after
    // Start). `removeQuickActionBar` runs on every segment deselection
    // (including the periodic selection recheck, `checkSelection`), and a
    // map click near a road to place a house number almost always
    // changes/clears the native segment selection - closing the panel
    // would stop the sequence after exactly 1 placement.
    // `hnState.segmentId` is fixed at Start regardless of current
    // selection, so the panel can safely stay open while the sequence
    // runs; it only closes explicitly (X, Stop then X, or unchecking the
    // setting).
    if (!hnState.active) closeHnPanel();
    // Unlike "HN rapid", "Taie segmentul" is single-shot (see its own
    // section) - it doesn't need the same "don't close while active"
    // exception. Instead, a selection changed before the cutting click
    // must cleanly disarm the tool (remove the global viewport/document
    // listeners), otherwise it would stay stuck on the old segment.
    if (cutState.active) cutDisarm();
    if (segmentState.quickBar) segmentState.quickBar.remove();
    segmentState.quickBar = null;
    segmentState.quickBarEls = null;
  }

  // ---------------------------------------------------------------------
  // "Mutare noduri" (move nodes): select a segment, click the move-nodes
  // button, and a toolbar appears to move node A or node B inward or
  // outward by X meters, with X editable in that toolbar. Visually
  // inspired by the "WME RA Util" script (Move Nodes, at roundabouts) but
  // generalized to any segment, moving exactly the requested distance
  // (meters) instead of jumping to the next existing vertex (see
  // `walkAlongFromStart`).
  //
  // Behavior modeled on "WME RA Util" (greasyfork.org/scripts/23616-wme-ra-util):
  // "in"/"out" at a roundabout node moves the vertex shared by the 2
  // segments meeting at that node (transfers geometry from one to the
  // other, invents nothing). Generalization applied here:
  //   - "in" = shortens the SELECTED segment from that end, walking
  //     exactly `distanceMeters` along its own geometry; the "consumed"
  //     points (former node position + any intermediate vertex passed)
  //     are transferred intact to the segment connected on the other side
  //     of the node (if any) - so that segment gains exactly the shape the
  //     selected one lost, with no geometry loss.
  //   - "out" = the same operation applied to the OTHER segment connected
  //     at that node (the node moves into its territory, and the selected
  //     segment gains the geometry the other one loses). If the node is a
  //     real dead end (no other segment connected), there is no geometry
  //     to borrow, so it's linearly extrapolated (direction of the last 2
  //     points, continued) with a clear warning, since this is new,
  //     invented geometry rather than shape-preserving.
  //   - v1 restriction: only works at nodes with at most 2 connected
  //     segments (dead end or simple pass-through point). At a real
  //     intersection (3+ segments at the same node), the move would need
  //     to update all connected segments simultaneously to avoid breaking
  //     the map - not supported yet, so a clear warning is shown instead
  //     of doing something ambiguous or wrong.
  // ---------------------------------------------------------------------

  // Default move distance, 5 meters (increased from 2m).
  const MOVE_NODES_DEFAULT_DISTANCE_M = 5;

  const moveNodesState = {
    panel: null,
    segmentId: null,
    distanceInput: null,
    cleanupDrag: null,
    suppressNextOutsideClick: false,
    lengthBadges: [],
    lengthBadgesRafId: null,
  };

  function closeMoveNodesPanel() {
    if (moveNodesState.cleanupDrag) moveNodesState.cleanupDrag();
    if (moveNodesState.panel) moveNodesState.panel.remove();
    moveNodesState.panel = null;
    moveNodesState.segmentId = null;
    moveNodesState.distanceInput = null;
    moveNodesState.cleanupDrag = null;
    clearMoveNodesLengthBadges();
    document.removeEventListener('click', handleMoveNodesPanelOutsideClick, true);
  }

  // Avoids closing the panel right when the user releases the mouse
  // outside it after dragging the title bar.
  function handleMoveNodesPanelOutsideClick(ev) {
    if (moveNodesState.suppressNextOutsideClick) {
      moveNodesState.suppressNextOutsideClick = false;
      return;
    }
    if (
      moveNodesState.panel &&
      !moveNodesState.panel.contains(ev.target) &&
      !(segmentState.quickBarEls && segmentState.quickBarEls.btnMoveNodes && segmentState.quickBarEls.btnMoveNodes.contains(ev.target))
    ) {
      closeMoveNodesPanel();
    }
  }

  // Reuses the same length badges (`createSegmentLengthBadge`/`formatLength`)
  // and positioning as direct node selection (`activateForNode`/
  // `buildSegmentInfo`), but kept independent of `state` so it doesn't
  // conflict with a segment selected while the panel is open.
  function clearMoveNodesLengthBadges() {
    if (moveNodesState.lengthBadgesRafId) cancelAnimationFrame(moveNodesState.lengthBadgesRafId);
    moveNodesState.lengthBadgesRafId = null;
    moveNodesState.lengthBadges.forEach((info) => info.badge.remove());
    moveNodesState.lengthBadges = [];
  }

  // Rebuilds the badge set: for each end of the selected segment (Node A,
  // Node B) with 2+ connected roads, one badge per connected road at that
  // node (same as selecting that node directly). A dead end gets no badge.
  // Called on panel open and after each successful move.
  function rebuildMoveNodesLengthBadges() {
    clearMoveNodesLengthBadges();
    if (!moveNodesState.panel || !moveNodesState.segmentId) return;
    let segment = null;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId: moveNodesState.segmentId });
    } catch (e) {
      segment = null;
    }
    if (!segment) return;

    [segment.fromNodeId, segment.toNodeId].forEach((nodeId) => {
      let node = null;
      try {
        node = sdk.DataModel.Nodes.getById({ nodeId });
      } catch (e) {
        node = null;
      }
      if (!node || !node.connectedSegmentIds || node.connectedSegmentIds.length < 2) return;

      node.connectedSegmentIds.forEach((segId) => {
        let seg2 = null;
        try {
          seg2 = sdk.DataModel.Segments.getById({ segmentId: segId });
        } catch (e) {
          seg2 = null;
        }
        if (!seg2) return;
        const info = buildSegmentInfo(node, seg2);
        if (!info) return;
        info.nodeId = node.id;
        info.badge = createSegmentLengthBadge();
        moveNodesState.lengthBadges.push(info);
      });
    });

    if (moveNodesState.lengthBadges.length) {
      moveNodesState.lengthBadgesRafId = requestAnimationFrame(moveNodesLengthBadgesRafLoop);
    }
  }

  // Lightweight loop: repositions existing badges on pan/zoom and refreshes
  // their text, without recomputing anchors (that only happens in
  // `rebuildMoveNodesLengthBadges`).
  function moveNodesLengthBadgesRafLoop() {
    if (!moveNodesState.panel || moveNodesState.lengthBadges.length === 0) {
      moveNodesState.lengthBadgesRafId = null;
      return;
    }
    moveNodesState.lengthBadges.forEach((info) => {
      let node = null;
      try {
        node = sdk.DataModel.Nodes.getById({ nodeId: info.nodeId });
      } catch (e) {
        node = null;
      }
      let seg2 = null;
      try {
        seg2 = sdk.DataModel.Segments.getById({ segmentId: info.segmentId });
      } catch (e) {
        seg2 = null;
      }
      if (!node || !seg2) {
        info.badge.style.display = 'none';
        return;
      }
      const nodePix = sdk.Map.getPixelFromLonLat({
        lonLat: { lon: node.geometry.coordinates[0], lat: node.geometry.coordinates[1] },
      });
      const anchorPix = sdk.Map.getPixelFromLonLat({
        lonLat: { lon: info.anchorLonLat[0], lat: info.anchorLonLat[1] },
      });
      const dx = anchorPix.x - nodePix.x;
      const dy = anchorPix.y - nodePix.y;
      const dist = Math.hypot(dx, dy) || 1;
      info.badge.style.display = 'flex';
      info.badge.style.left = `${nodePix.x + (dx / dist) * LENGTH_BADGE_OFFSET_PX}px`;
      info.badge.style.top = `${nodePix.y + (dy / dist) * LENGTH_BADGE_OFFSET_PX}px`;
      info.badge.textContent = formatLength(pathLengthMeters(seg2.geometry.coordinates));
    });
    moveNodesState.lengthBadgesRafId = requestAnimationFrame(moveNodesLengthBadgesRafLoop);
  }

  function quickBarToggleMoveNodesPanel(ev, segmentId, anchorEl) {
    ev.stopPropagation();
    if (moveNodesState.panel && moveNodesState.segmentId === segmentId) {
      closeMoveNodesPanel();
      return;
    }
    openMoveNodesPanel(segmentId, anchorEl);
  }

  function makeMoveNodesActionButton(label, title) {
    const btn = document.createElement('div');
    btn.textContent = label;
    btn.title = title;
    btn.style.cssText = `
      flex: 1;
      text-align: center;
      padding: 4px 0;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 700;
      font-size: 11px;
    `;
    return btn;
  }

  function openMoveNodesPanel(segmentId, anchorEl) {
    closeMoveNodesPanel();
    closeQuickBarDropdown();
    const t = currentTheme();

    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      z-index: ${OWN_UI_MENU_Z_INDEX};
      background: ${t.menuBg};
      border: 1px solid ${t.menuBorder};
      color: ${t.menuText};
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      font: 400 11px/1.3 Arial, sans-serif;
      min-width: 210px;
      overflow: hidden;
    `;

    // Title bar with close button and drag handle. Panel position is not
    // persisted between openings - it always resets next to the button
    // that opened it.
    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 5px 6px 5px 8px;
      background: ${t.barBg};
      border-bottom: 1px solid ${t.menuBorder};
      cursor: move;
      user-select: none;
      font-weight: 700;
    `;
    const titleText = document.createElement('span');
    titleText.textContent = L('Mutare noduri', 'Move nodes');
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    closeBtn.title = L('Închide', 'Close');
    closeBtn.style.cssText = 'cursor: pointer; padding: 0 3px; font-weight: 700;';
    closeBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      closeMoveNodesPanel();
    });
    titleBar.appendChild(titleText);
    titleBar.appendChild(closeBtn);
    panel.appendChild(titleBar);

    const body = document.createElement('div');
    body.style.cssText = 'padding: 10px;';
    panel.appendChild(body);

    const distRow = document.createElement('div');
    distRow.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 8px;';
    const distLabel = document.createElement('span');
    distLabel.textContent = L('Distanță:', 'Distance:');
    distLabel.style.cssText = 'font-weight: 700;';
    const distInput = document.createElement('input');
    distInput.type = 'number';
    distInput.min = '0.1';
    distInput.step = '0.5';
    distInput.value = String(MOVE_NODES_DEFAULT_DISTANCE_M);
    distInput.style.cssText = `
      width: 50px;
      font: inherit;
      color: ${t.menuText};
      background: transparent;
      border: 1px solid ${t.menuBorder};
      border-radius: 3px;
      padding: 2px 4px;
    `;
    const distUnit = document.createElement('span');
    distUnit.textContent = L('metri', 'meters');
    distRow.appendChild(distLabel);
    distRow.appendChild(distInput);
    distRow.appendChild(distUnit);
    body.appendChild(distRow);
    moveNodesState.distanceInput = distInput;

    function buildNodeRow(labelText, whichEnd) {
      const row = document.createElement('div');
      row.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;';
      const label = document.createElement('span');
      label.textContent = labelText;
      label.style.cssText = 'font-weight: 700; width: 46px; flex: 0 0 auto;';
      const btnIn = makeMoveNodesActionButton('In', L(`Mută Nod ${whichEnd} spre interiorul segmentului`, `Move node ${whichEnd} inward along the segment`));
      const btnOut = makeMoveNodesActionButton('Out', L(`Mută Nod ${whichEnd} spre exteriorul segmentului`, `Move node ${whichEnd} outward from the segment`));
      [btnIn, btnOut].forEach((b) => {
        b.style.background = t.barBg;
        b.style.border = `1px solid ${t.barBorder}`;
        b.addEventListener('mouseenter', () => {
          b.style.background = t.menuHoverBg;
        });
        b.addEventListener('mouseleave', () => {
          b.style.background = t.barBg;
        });
      });
      btnIn.addEventListener('click', () => runMoveNode(segmentId, whichEnd, 'in'));
      btnOut.addEventListener('click', () => runMoveNode(segmentId, whichEnd, 'out'));
      row.appendChild(label);
      row.appendChild(btnIn);
      row.appendChild(btnOut);
      return row;
    }

    body.appendChild(buildNodeRow(L('Nod A', 'Node A'), 'A'));
    body.appendChild(buildNodeRow(L('Nod B', 'Node B'), 'B'));

    // Neighboring segment lengths are shown as map badges, not in the
    // panel - see `rebuildMoveNodesLengthBadges`.

    document.body.appendChild(panel);

    // Default position is to the side of the quick bar (right, or left if
    // there's no room) so it doesn't cover the selected segment. Still
    // fully repositionable by dragging the title bar.
    const anchorRect = anchorEl.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = anchorRect.right + QUICK_BAR_DROPDOWN_GAP_PX;
    if (left + panelRect.width + 8 > vw) {
      left = anchorRect.left - panelRect.width - QUICK_BAR_DROPDOWN_GAP_PX;
    }
    left = Math.min(vw - panelRect.width - 8, Math.max(8, left));
    let top = anchorRect.top;
    top = Math.min(vh - panelRect.height - 8, Math.max(8, top));
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;

    // Free dragging via the title bar - position is not persisted between
    // openings.
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panelStartLeft = 0;
    let panelStartTop = 0;
    function onDragMove(ev) {
      if (!dragging) return;
      const dx = ev.clientX - dragStartX;
      const dy = ev.clientY - dragStartY;
      panel.style.left = `${Math.round(panelStartLeft + dx)}px`;
      panel.style.top = `${Math.round(panelStartTop + dy)}px`;
    }
    function onDragEnd() {
      dragging = false;
      moveNodesState.suppressNextOutsideClick = true;
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    }
    titleBar.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      dragging = true;
      dragStartX = ev.clientX;
      dragStartY = ev.clientY;
      const rect = panel.getBoundingClientRect();
      panelStartLeft = rect.left;
      panelStartTop = rect.top;
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    });
    moveNodesState.cleanupDrag = () => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };

    moveNodesState.panel = panel;
    moveNodesState.segmentId = segmentId;
    rebuildMoveNodesLengthBadges();
    setTimeout(() => document.addEventListener('click', handleMoveNodesPanelOutsideClick, true), 0);
  }

  function getMoveNodesDistance() {
    const raw = moveNodesState.distanceInput ? parseFloat(moveNodesState.distanceInput.value) : NaN;
    if (!isFinite(raw) || raw <= 0) return MOVE_NODES_DEFAULT_DISTANCE_M;
    return raw;
  }

  // Orients a coordinate clone so the working end (Node A or B) is at
  // index 0, letting `walkAlongFromStart` be reused for either end.
  // `reversed` tells the caller to reverse the result back before saving
  // it as segment geometry.
  function orientCoordsForEnd(coords, whichEnd) {
    if (whichEnd === 'A') return { working: coords.map((c) => c.slice()), reversed: false };
    return { working: coords.slice().reverse().map((c) => c.slice()), reversed: true };
  }

  function restoreOrientation(coords, wasReversed) {
    return wasReversed ? coords.slice().reverse() : coords;
  }

  // Applies `removedCoords` (ordered from the old node to the new point,
  // including the old node) to `otherSegment`, which touches the same
  // node at either its A (fromNodeId) or B (toNodeId) end. Returns the
  // full new geometry for `otherSegment`.
  function spliceIntoOtherSegment(otherSegment, nodeId, removedCoords, newPoint) {
    const rest = removedCoords.slice(1); // excludes the old node itself (already the last/first point of otherSegment)
    if (otherSegment.toNodeId === nodeId) {
      return [...otherSegment.geometry.coordinates.map((c) => c.slice()), ...rest, newPoint.slice()];
    }
    // otherSegment.fromNodeId === nodeId
    return [newPoint.slice(), ...rest.slice().reverse(), ...otherSegment.geometry.coordinates.map((c) => c.slice())];
  }

  // For a node with 2+ other connected segments (a real intersection, e.g.
  // T-junction or roundabout branch), determines which candidate is the
  // "continuation" of the selected road (no turn), so it's treated like a
  // simple pass-through node while other branches stay untouched. Compares
  // each candidate's bearing from the node to the expected continuation
  // direction (opposite of the selected segment's own bearing from that
  // node); a candidate is accepted only if it's within
  // `NODE_CONTINUITY_MAX_DEG` AND at least `NODE_CONTINUITY_MARGIN_DEG`
  // better than the runner-up (otherwise it's ambiguous). Same thresholds
  // as used in "WME RO Color Speeds" (45°/15°).
  const NODE_CONTINUITY_MAX_DEG = 45;
  const NODE_CONTINUITY_MARGIN_DEG = 15;

  // Max number of connected roads at a node (including the selected
  // segment) for which "Move nodes" attempts to auto-detect a continuation.
  const MOVE_NODES_MAX_CONNECTED_SEGMENTS = 6;

  function bearingFromNode(seg, nodeId) {
    const coords = seg.geometry.coordinates;
    if (!coords || coords.length < 2) return null;
    const fromStart = seg.fromNodeId === nodeId;
    const p0 = fromStart ? coords[0] : coords[coords.length - 1];
    const p1 = fromStart ? coords[1] : coords[coords.length - 2];
    return bearingDeg(p0[0], p0[1], p1[0], p1[1]);
  }

  function angularDiffDeg(a, b) {
    let d = Math.abs(a - b) % 360;
    if (d > 180) d = 360 - d;
    return d;
  }

  function findContinuationSegmentId(segment, nodeId, candidateIds) {
    const ownBearing = bearingFromNode(segment, nodeId);
    if (ownBearing === null) return null;
    const expected = (ownBearing + 180) % 360;
    const diffs = candidateIds.map((id) => {
      let seg2 = null;
      try {
        seg2 = sdk.DataModel.Segments.getById({ segmentId: id });
      } catch (e) {
        seg2 = null;
      }
      const b = seg2 ? bearingFromNode(seg2, nodeId) : null;
      return { id, diff: b === null ? Infinity : angularDiffDeg(b, expected) };
    });
    diffs.sort((a, b) => a.diff - b.diff);
    if (diffs[0].diff < NODE_CONTINUITY_MAX_DEG && diffs[1].diff - diffs[0].diff >= NODE_CONTINUITY_MARGIN_DEG) {
      return diffs[0].id;
    }
    return null;
  }

  function moveNodesToastAnchor() {
    return moveNodesState.panel ? moveNodesState.panel.getBoundingClientRect() : null;
  }

  function runMoveNode(segmentId, whichEnd, direction) {
    const distanceMeters = getMoveNodesDistance();
    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId });
    } catch (e) {
      segment = null;
    }
    if (!segment) return;

    const nodeId = whichEnd === 'A' ? segment.fromNodeId : segment.toNodeId;
    let node;
    try {
      node = sdk.DataModel.Nodes.getById({ nodeId });
    } catch (e) {
      node = null;
    }
    if (!node) {
      phShowToast(L('Nu am putut citi nodul selectat.', 'Could not read the selected node.'), true, moveNodesToastAnchor());
      return;
    }

    const otherSegmentIds = (node.connectedSegmentIds || []).filter((id) => id !== segmentId);
    let resolvedOtherId = null;
    if (otherSegmentIds.length === 1) {
      resolvedOtherId = otherSegmentIds[0];
    } else if (otherSegmentIds.length >= 2 && otherSegmentIds.length <= MOVE_NODES_MAX_CONNECTED_SEGMENTS - 1) {
      // `findContinuationSegmentId` compares the best candidate to the
      // runner-up regardless of candidate count (2 to 5).
      resolvedOtherId = findContinuationSegmentId(segment, nodeId, otherSegmentIds);
      if (resolvedOtherId === null) {
        phShowToast(
          L(`Nod cu ${otherSegmentIds.length + 1} drumuri conectate, fără o continuare clară (unghiuri prea apropiate) - "Mutare noduri" nu poate alege automat drumul de continuitate.`, `Node with ${otherSegmentIds.length + 1} connected roads and no clear continuation (angles too close) - "Move nodes" cannot pick the continuing road automatically.`),
          true,
          moveNodesToastAnchor()
        );
        return;
      }
    } else if (otherSegmentIds.length > MOVE_NODES_MAX_CONNECTED_SEGMENTS - 1) {
      phShowToast(
        L(`"Mutare noduri" nu e suportat la noduri cu peste ${MOVE_NODES_MAX_CONNECTED_SEGMENTS} drumuri conectate.`, `"Move nodes" is not supported at nodes with more than ${MOVE_NODES_MAX_CONNECTED_SEGMENTS} connected roads.`),
        true,
        moveNodesToastAnchor()
      );
      return;
    }
    const isDeadEnd = otherSegmentIds.length === 0;

    // IMPORTANT: sdk.DataModel.Nodes.moveNode(...) must be called BEFORE any
    // updateSegment that rewrites the coordinate array of a segment
    // touching that node. If updateSegment runs first with an end
    // coordinate different from the node's current position, WME treats it
    // as the segment detaching from the node and creates a new temporary
    // node (negative ID) at that point instead - the original shared node
    // ends up orphaned (empty connectedSegmentIds) while each segment gets
    // its own phantom node, silently corrupting the topology with no error.
    //
    // moveNode(id, newPosition) alone correctly moves the shared vertex for
    // both connected segments (preserving fromNodeId/toNodeId), but only
    // moves that one vertex - it does not walk along the geometry. Correct
    // order: (1) moveNode to the final computed position, then (2)
    // updateSegment on each affected segment with full geometry whose end
    // coordinate already matches the node's new position, so updateSegment
    // sees no displacement and doesn't break the link.
    if (direction === 'in') {
      const { working, reversed } = orientCoordsForEnd(segment.geometry.coordinates, whichEnd);
      const result = walkAlongFromStart(working, distanceMeters);
      if (!result) {
        phShowToast(L(`Segmentul selectat e prea scurt pentru a muta Nod ${whichEnd} cu ${distanceMeters} m spre interior.`, `The selected segment is too short to move node ${whichEnd} ${distanceMeters} m inward.`), true, moveNodesToastAnchor());
        return;
      }

      let otherSegment = null;
      if (!isDeadEnd) {
        try {
          otherSegment = sdk.DataModel.Segments.getById({ segmentId: resolvedOtherId });
        } catch (e) {
          otherSegment = null;
        }
      }

      try {
        sdk.DataModel.Nodes.moveNode({ id: nodeId, geometry: { type: 'Point', coordinates: result.point } });
      } catch (e) {
        console.error(`${SCRIPT_NAME}: mutare noduri - eșec la moveNode.`, e);
      }

      const newOwnCoords = restoreOrientation(result.keptCoords, reversed);
      updateSegmentSafe(segmentId, { geometry: { type: 'LineString', coordinates: newOwnCoords } });

      if (otherSegment) {
        const newOtherCoords = spliceIntoOtherSegment(otherSegment, nodeId, result.removedCoords, result.point);
        updateSegmentSafe(otherSegment.id, { geometry: { type: 'LineString', coordinates: newOtherCoords } });
      }
      rebuildMoveNodesLengthBadges();
      return;
    }

    // direction === 'out'
    if (isDeadEnd) {
      const { working, reversed } = orientCoordsForEnd(segment.geometry.coordinates, whichEnd);
      if (working.length < 2) return;
      const bearing = bearingDeg(working[1][0], working[1][1], working[0][0], working[0][1]);
      const newPoint = destinationPoint(working[0][0], working[0][1], bearing, distanceMeters);
      const newWorking = [newPoint, ...working];
      const newOwnCoords = restoreOrientation(newWorking, reversed);

      try {
        sdk.DataModel.Nodes.moveNode({ id: nodeId, geometry: { type: 'Point', coordinates: newPoint } });
      } catch (e) {
        console.error(`${SCRIPT_NAME}: mutare noduri - eșec la moveNode.`, e);
      }
      updateSegmentSafe(segmentId, { geometry: { type: 'LineString', coordinates: newOwnCoords } });

      phShowToast(
        L(`Nod ${whichEnd} extins ${distanceMeters} m dincolo de capătul drumului (extrapolare liniară - nu exista geometrie acolo).`, `Node ${whichEnd} extended ${distanceMeters} m beyond the end of the road (linear extrapolation - there was no geometry there).`),
        false,
        moveNodesToastAnchor()
      );
      rebuildMoveNodesLengthBadges();
      return;
    }

    // Node with 1 other connected segment (or a resolved continuation in
    // `resolvedOtherId`) - "out" for the selected segment means "in" for
    // the other segment.
    let otherSegment;
    try {
      otherSegment = sdk.DataModel.Segments.getById({ segmentId: resolvedOtherId });
    } catch (e) {
      otherSegment = null;
    }
    if (!otherSegment) {
      phShowToast(L('Nu am putut citi celălalt segment conectat la acest nod.', 'Could not read the other segment connected to this node.'), true, moveNodesToastAnchor());
      return;
    }
    const otherWhichEnd = otherSegment.fromNodeId === nodeId ? 'A' : 'B';
    const { working: otherWorking, reversed: otherReversed } = orientCoordsForEnd(otherSegment.geometry.coordinates, otherWhichEnd);
    const result = walkAlongFromStart(otherWorking, distanceMeters);
    if (!result) {
      phShowToast(
        L(`Nu există suficientă geometrie pe segmentul conectat pentru a muta Nod ${whichEnd} cu ${distanceMeters} m spre exterior.`, `Not enough geometry on the connected segment to move node ${whichEnd} ${distanceMeters} m outward.`),
        true,
        moveNodesToastAnchor()
      );
      return;
    }

    try {
      sdk.DataModel.Nodes.moveNode({ id: nodeId, geometry: { type: 'Point', coordinates: result.point } });
    } catch (e) {
      console.error(`${SCRIPT_NAME}: mutare noduri - eșec la moveNode.`, e);
    }

    const newOtherCoords = restoreOrientation(result.keptCoords, otherReversed);
    updateSegmentSafe(otherSegment.id, { geometry: { type: 'LineString', coordinates: newOtherCoords } });

    const newOwnCoords = spliceIntoOtherSegment(segment, nodeId, result.removedCoords, result.point);
    updateSegmentSafe(segmentId, { geometry: { type: 'LineString', coordinates: newOwnCoords } });
    rebuildMoveNodesLengthBadges();
  }

  // ---------------------------------------------------------------------
  // "HN rapid" - quick sequential house-number placement. Free-form prefix
  // (can include "-" or "/") plus an incrementing/decrementing suffix
  // (letter A-Z, no diacritics, always uppercase, or a number), starting
  // by default from "A"/"1" (editable).
  //
  // Design notes:
  //  1. Placement goes directly through the SDK
  //     (sdk.DataModel.HouseNumbers.addHouseNumber) rather than the native
  //     UI flow - the native editable chip lives in Shadow DOM (Stencil
  //     `wz-*` components) and could not be reliably found/read/written
  //     via `document.querySelector` from the injected script.
  //     Note: unlike `moveNode`/`updateSegment`, `addHouseNumber` is not a
  //     direct server write - it goes through the same local "unsaved
  //     changes" buffer as native edits (each call increments the "Save"
  //     button counter and highlights the segment magenta; native Undo
  //     fully reverts it, counter back to 0, with nothing sent to the
  //     server until Save is pressed).
  //  2. Added numbers attach only to the segment selected at Start time
  //     (not the segment nearest to the click).
  //  3. Duplicate checking covers the whole street (all segments sharing
  //     `primaryStreetId`, or listing it in `alternateStreetIds`), not just
  //     the selected segment, since WME rejects a duplicate on save
  //     regardless of segment as long as it's the same street.
  //
  // The flow is "Start -> click on map -> current number is added directly,
  // one at a time", with no interaction with the native HN-add UI. The
  // separate "+HN" button (which opened that native flow) was removed;
  // "HN rapid" replaces it in the quick bar.
  // ---------------------------------------------------------------------

  const hnState = {
    panel: null,
    body: null,
    t: null,
    cleanupDrag: null,
    suppressNextOutsideClick: false,
    segmentId: null, // segment selected at Start, fixed for the whole sequence
    mode: 'number', // 'number' | 'letter'
    direction: 'inc', // 'inc' | 'dec'
    prefix: '',
    current: null, // current suffix value (string)
    existingNumbers: null, // Set<string> (uppercase) - numbers already on the street, snapshotted at Start
    active: false, // true after Start, until Stop
    mapClickHandler: null,
    mouseMoveHandler: null,
    mouseDownHandler: null,
    // Stack of HNs placed by the sequence, in placement order - each
    // element `{ id, suffix, key }`, used to detect native Undo (see
    // `hnHandleHouseNumbersRemoved`). `id` is the (negative, local) ID from
    // the `wme-house-number-added` event, `suffix` is the suffix value
    // current in `hnState.current` at placement time (what we revert to if
    // this HN is undone), `key` is the form stored in
    // `hnState.existingNumbers` (prefix+suffix, uppercase).
    placedStack: [],
    // Handler registered on `wme-data-model-objects-removed` while the
    // sequence is active - see Start/Stop below.
    removedHandler: null,
    // Position/time of the last `mousedown` on the map while the sequence
    // is active - used by `hnHandleMapClick` to distinguish a short click
    // (valid placement) from a click-and-drag (map pan) or a held press -
    // see `HN_CLICK_MAX_DRAG_PX`/`HN_CLICK_MAX_HOLD_MS` below.
    mouseDownX: null,
    mouseDownY: null,
    mouseDownAt: null,
    segmentCoords: null, // lon/lat geometry of the segment fixed at Start - for snap anchoring
    streetId: null, // primary street of the Start segment - HNs go to any segment of this street
    scopeCache: null, // { at, segments: [{ id, coords }] } - see `hnScopeSegments`
    scopeFetchedKey: null, // sorted segment ids the existing-number set was fetched for
    indicatorEl: null, // SVG overlay with the anchor point + dotted line
    indicatorDot: null,
    indicatorLine: null,
    prefixInput: null,
    startValueInput: null,
    modeButtons: null,
    dirButtons: null,
    nextValueEl: null,
    alertEl: null,
  };

  function hnToastAnchor() {
    return hnState.panel ? hnState.panel.getBoundingClientRect() : null;
  }

  function closeHnPanel() {
    hnStopSequence();
    if (hnState.cleanupDrag) hnState.cleanupDrag();
    if (hnState.panel) hnState.panel.remove();
    hnState.panel = null;
    hnState.body = null;
    hnState.cleanupDrag = null;
    hnState.prefixInput = null;
    hnState.startValueInput = null;
    hnState.modeButtons = null;
    hnState.dirButtons = null;
    hnState.nextValueEl = null;
    hnDismissDuplicateAlert();
    document.removeEventListener('click', handleHnPanelOutsideClick, true);
  }

  // While a sequence is active, map clicks are part of the placement flow
  // and fall "outside" the panel, so only Stop/X close it. In the setup
  // form state an outside click closes it, like "Move nodes".
  function handleHnPanelOutsideClick(ev) {
    if (hnState.suppressNextOutsideClick) {
      hnState.suppressNextOutsideClick = false;
      return;
    }
    if (hnState.active) return;
    if (
      hnState.panel &&
      !hnState.panel.contains(ev.target) &&
      !(segmentState.quickBarEls && segmentState.quickBarEls.btnHnRapid && segmentState.quickBarEls.btnHnRapid.contains(ev.target))
    ) {
      closeHnPanel();
    }
  }

  function quickBarToggleHnPanel(ev, segmentId, anchorEl) {
    ev.stopPropagation();
    if (hnState.panel) {
      closeHnPanel();
      return;
    }
    openHnPanel(segmentId, anchorEl);
  }

  function hnMakeToggleButton(label, title) {
    const btn = document.createElement('div');
    btn.textContent = label;
    btn.title = title || '';
    btn.style.cssText = `
      flex: 1;
      text-align: center;
      padding: 4px 0;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 700;
      font-size: 11px;
    `;
    return btn;
  }

  function hnStyleToggleGroup(buttons, activeIndex, t) {
    buttons.forEach((b, i) => {
      b.style.background = i === activeIndex ? t.menuHoverBg : t.barBg;
      b.style.border = `1px solid ${t.barBorder}`;
    });
  }

  // Valid letter suffix: A-Z only, no diacritics. Sanitized on every
  // keystroke, not just on Start: strips anything outside A-Z, uppercases
  // lowercase letters, keeps only the first remaining character.
  function hnSanitizeLetterInput(raw) {
    return (raw || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 1);
  }

  // Next suffix value, or `null` when the sequence ends naturally (letter
  // past "Z"/before "A", or number below 1). We don't wrap (e.g. Z -> AA);
  // the sequence just stops.
  function hnNextSuffix(current, mode, direction) {
    if (mode === 'letter') {
      const code = current.charCodeAt(0);
      const nextCode = direction === 'inc' ? code + 1 : code - 1;
      if (nextCode < 65 || nextCode > 90) return null;
      return String.fromCharCode(nextCode);
    }
    const n = parseInt(current, 10);
    if (!isFinite(n)) return null;
    const next = direction === 'inc' ? n + 1 : n - 1;
    if (next < 1) return null;
    return String(next);
  }

  function hnCandidateNumber() {
    return `${hnState.prefix}${hnState.current}`;
  }

  // All segment IDs on the same street as the given segment: matching
  // `primaryStreetId`, or having it in `alternateStreetIds`. Duplicate
  // checks run against the whole street, not just this segment. There's
  // no dedicated SDK method for this, so we filter
  // `DataModel.Segments.getAll()` (currently loaded segments). A segment
  // with no `primaryStreetId` (unnamed road) is scoped to itself only.
  function hnStreetScopeSegmentIds(segment) {
    if (!segment.primaryStreetId) return [segment.id];
    let all;
    try {
      all = sdk.DataModel.Segments.getAll();
    } catch (e) {
      return [segment.id];
    }
    return all
      .filter(
        (s) =>
          s.primaryStreetId === segment.primaryStreetId ||
          (s.alternateStreetIds || []).includes(segment.primaryStreetId)
      )
      .map((s) => s.id);
  }

  async function hnRefreshExistingNumbers(segment) {
    const segmentIds = hnStreetScopeSegmentIds(segment);
    let list = [];
    try {
      // Takes `{ segmentIds }` as an object, not a positional array (same
      // gotcha as `addHouseNumber` below) - the public SDK docs are wrong here.
      list = await sdk.DataModel.HouseNumbers.fetchHouseNumbers({ segmentIds });
    } catch (e) {
      console.error(`${SCRIPT_NAME}: HN rapid - eșec la fetchHouseNumbers.`, e);
      list = [];
    }
    hnState.existingNumbers = new Set((list || []).map((hn) => String(hn.number).toUpperCase().trim()));
    hnState.scopeFetchedKey = segmentIds.slice().sort().join(',');
  }

  // So the "house numbers" map layer is already on when the HN rapid panel
  // opens - existing numbers on the street are visible right away, no need
  // to also open the layers panel manually. Best-effort: never blocks
  // opening the panel itself.
  function hnEnableHouseNumbersLayer() {
    try {
      if (!sdk.LayerSwitcher.getWMELayerVisibility({ layerName: 'houseNumbers' })) {
        sdk.LayerSwitcher.setWMELayerVisibility({ layerName: 'houseNumbers', isVisible: true });
      }
    } catch (e) {
      // ignore - layer toggle is a convenience, not a requirement
    }
  }

  function openHnPanel(segmentId, anchorEl) {
    closeHnPanel();
    closeQuickBarDropdown();
    closeMoveNodesPanel();
    hnEnableHouseNumbersLayer();
    const t = currentTheme();

    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      z-index: ${OWN_UI_MENU_Z_INDEX};
      background: ${t.menuBg};
      border: 1px solid ${t.menuBorder};
      color: ${t.menuText};
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      font: 400 11px/1.3 Arial, sans-serif;
      min-width: 230px;
      overflow: hidden;
    `;

    const titleBar = document.createElement('div');
    titleBar.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 5px 6px 5px 8px;
      background: ${t.barBg};
      border-bottom: 1px solid ${t.menuBorder};
      cursor: move;
      user-select: none;
      font-weight: 700;
    `;
    const titleText = document.createElement('span');
    titleText.textContent = L('HN rapid', 'Quick HN');
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '✕';
    closeBtn.title = L('Închide', 'Close');
    closeBtn.style.cssText = 'cursor: pointer; padding: 0 3px; font-weight: 700;';
    closeBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      closeHnPanel();
    });
    titleBar.appendChild(titleText);
    titleBar.appendChild(closeBtn);
    panel.appendChild(titleBar);

    const body = document.createElement('div');
    body.style.cssText = 'padding: 10px;';
    panel.appendChild(body);

    hnState.panel = panel;
    hnState.body = body;
    hnState.t = t;
    hnState.segmentId = segmentId;

    hnRenderSetupForm();

    document.body.appendChild(panel);

    const anchorRect = anchorEl.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = anchorRect.right + QUICK_BAR_DROPDOWN_GAP_PX;
    if (left + panelRect.width + 8 > vw) {
      left = anchorRect.left - panelRect.width - QUICK_BAR_DROPDOWN_GAP_PX;
    }
    left = Math.min(vw - panelRect.width - 8, Math.max(8, left));
    let top = anchorRect.top;
    top = Math.min(vh - panelRect.height - 8, Math.max(8, top));
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;

    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panelStartLeft = 0;
    let panelStartTop = 0;
    function onDragMove(ev) {
      if (!dragging) return;
      const dx = ev.clientX - dragStartX;
      const dy = ev.clientY - dragStartY;
      panel.style.left = `${Math.round(panelStartLeft + dx)}px`;
      panel.style.top = `${Math.round(panelStartTop + dy)}px`;
    }
    function onDragEnd() {
      dragging = false;
      hnState.suppressNextOutsideClick = true;
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    }
    titleBar.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      dragging = true;
      dragStartX = ev.clientX;
      dragStartY = ev.clientY;
      const rect = panel.getBoundingClientRect();
      panelStartLeft = rect.left;
      panelStartTop = rect.top;
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    });
    hnState.cleanupDrag = () => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
    };

    setTimeout(() => document.addEventListener('click', handleHnPanelOutsideClick, true), 0);
  }

  function hnRenderSetupForm() {
    const t = hnState.t;
    const body = hnState.body;
    if (!body) return;
    body.innerHTML = '';

    const prefixRow = document.createElement('div');
    prefixRow.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 8px;';
    const prefixLabel = document.createElement('span');
    prefixLabel.textContent = 'Prefix:';
    prefixLabel.style.cssText = 'font-weight: 700; width: 58px; flex: 0 0 auto;';
    const prefixInput = document.createElement('input');
    prefixInput.type = 'text';
    prefixInput.value = hnState.prefix;
    prefixInput.placeholder = L('ex: 24A-', 'e.g. 24A-');
    prefixInput.style.cssText = `
      flex: 1;
      font: inherit;
      color: ${t.menuText};
      background: transparent;
      border: 1px solid ${t.menuBorder};
      border-radius: 3px;
      padding: 2px 4px;
    `;
    prefixInput.addEventListener('input', () => {
      hnState.prefix = prefixInput.value;
    });
    prefixRow.appendChild(prefixLabel);
    prefixRow.appendChild(prefixInput);
    body.appendChild(prefixRow);
    hnState.prefixInput = prefixInput;

    const modeRow = document.createElement('div');
    modeRow.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 8px;';
    const modeLabel = document.createElement('span');
    modeLabel.textContent = L('Tip:', 'Type:');
    modeLabel.style.cssText = 'font-weight: 700; width: 58px; flex: 0 0 auto;';
    const btnModeNum = hnMakeToggleButton(L('Număr', 'Number'), L('Sufix numeric (1, 2, 3, ...) - implicit', 'Numeric suffix (1, 2, 3, ...) - default'));
    const btnModeLetter = hnMakeToggleButton(L('Literă', 'Letter'), L('Sufix literă (A, B, C, ... - fără diacritice)', 'Letter suffix (A, B, C, ... - no diacritics)'));
    modeRow.appendChild(modeLabel);
    modeRow.appendChild(btnModeNum);
    modeRow.appendChild(btnModeLetter);
    body.appendChild(modeRow);
    hnState.modeButtons = { num: btnModeNum, letter: btnModeLetter };

    const dirRow = document.createElement('div');
    dirRow.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 8px;';
    const dirLabel = document.createElement('span');
    dirLabel.textContent = L('Direcție:', 'Direction:');
    dirLabel.style.cssText = 'font-weight: 700; width: 58px; flex: 0 0 auto;';
    const btnInc = hnMakeToggleButton(L('Crescător', 'Ascending'), L('Incrementare - implicit', 'Increment - default'));
    const btnDec = hnMakeToggleButton(L('Descresc.', 'Descending'), L('Decrementare', 'Decrement'));
    dirRow.appendChild(dirLabel);
    dirRow.appendChild(btnInc);
    dirRow.appendChild(btnDec);
    body.appendChild(dirRow);
    hnState.dirButtons = { inc: btnInc, dec: btnDec };

    const startRow = document.createElement('div');
    startRow.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 10px;';
    const startLabel = document.createElement('span');
    startLabel.textContent = L('Start la:', 'Start at:');
    startLabel.style.cssText = 'font-weight: 700; width: 58px; flex: 0 0 auto;';
    const startInput = document.createElement('input');
    startInput.type = 'text';
    startInput.style.cssText = `
      width: 60px;
      font: inherit;
      color: ${t.menuText};
      background: transparent;
      border: 1px solid ${t.menuBorder};
      border-radius: 3px;
      padding: 2px 4px;
    `;
    startRow.appendChild(startLabel);
    startRow.appendChild(startInput);
    body.appendChild(startRow);
    hnState.startValueInput = startInput;

    function applyModeDefaults() {
      // Default start value: 1 for number mode, A for letter mode. Editable.
      startInput.value = hnState.mode === 'letter' ? 'A' : '1';
    }

    function refreshToggleStyles() {
      hnStyleToggleGroup([btnModeNum, btnModeLetter], hnState.mode === 'letter' ? 1 : 0, t);
      hnStyleToggleGroup([btnInc, btnDec], hnState.direction === 'dec' ? 1 : 0, t);
      if (hnState.mode === 'letter') {
        startInput.maxLength = 1;
        startInput.title = L('O singură literă, A-Z, fără diacritice', 'A single letter, A-Z, no diacritics');
      } else {
        startInput.removeAttribute('maxLength');
        startInput.title = L('Un număr întreg', 'A whole number');
      }
    }

    btnModeNum.addEventListener('click', () => {
      if (hnState.mode === 'number') return;
      hnState.mode = 'number';
      applyModeDefaults();
      refreshToggleStyles();
    });
    btnModeLetter.addEventListener('click', () => {
      if (hnState.mode === 'letter') return;
      hnState.mode = 'letter';
      applyModeDefaults();
      refreshToggleStyles();
    });
    btnInc.addEventListener('click', () => {
      hnState.direction = 'inc';
      refreshToggleStyles();
    });
    btnDec.addEventListener('click', () => {
      hnState.direction = 'dec';
      refreshToggleStyles();
    });

    startInput.addEventListener('input', () => {
      if (hnState.mode === 'letter') {
        const clean = hnSanitizeLetterInput(startInput.value);
        if (clean !== startInput.value) startInput.value = clean;
      }
    });

    applyModeDefaults();
    refreshToggleStyles();

    const startBtn = document.createElement('div');
    startBtn.textContent = 'Start';
    startBtn.style.cssText = `
      text-align: center;
      padding: 6px 0;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 700;
      background: ${t.menuHoverBg};
      border: 1px solid ${t.barBorder};
    `;
    startBtn.addEventListener('click', () => hnStartSequence());
    body.appendChild(startBtn);
  }

  async function hnStartSequence() {
    const segmentId = hnState.segmentId;
    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId });
    } catch (e) {
      segment = null;
    }
    if (!segment) {
      phShowToast(L('Nu am putut citi segmentul selectat.', 'Could not read the selected segment.'), true, hnToastAnchor());
      return;
    }

    const mode = hnState.mode;
    let startValue = (hnState.startValueInput.value || '').trim();
    if (mode === 'letter') {
      startValue = hnSanitizeLetterInput(startValue);
      if (!startValue) {
        phShowToast(L('Introdu o literă validă (A-Z) pentru pornire.', 'Enter a valid start letter (A-Z).'), true, hnToastAnchor());
        return;
      }
    } else {
      const n = parseInt(startValue, 10);
      if (!isFinite(n)) {
        phShowToast(L('Introdu un număr valid pentru pornire.', 'Enter a valid start number.'), true, hnToastAnchor());
        return;
      }
      startValue = String(n);
    }

    hnState.prefix = hnState.prefixInput.value || '';
    hnState.current = startValue;
    hnState.active = true;
    // Segment geometry captured at Start, used for the snap indicator (see
    // `hnComputeSnapPixel`/`hnHandleMapMouseMove`).
    hnState.segmentCoords = segment.geometry.coordinates;
    // Like native HN editing: every segment of the same street (same
    // primary street = same name + city) is a target, not only the Start
    // segment. Unnamed segment -> that segment only.
    hnState.streetId = segment.primaryStreetId || null;
    hnState.scopeCache = null;
    hnState.scopeFetchedKey = null;

    hnRenderActiveView();
    hnBuildIndicator();
    // Fetching existing numbers happens after showing the active view (non-
    // blocking). Until it resolves, the existing-numbers set is empty, so
    // duplicate detection briefly no-ops instead of blocking Start.
    hnRefreshExistingNumbers(segment);

    hnState.mapClickHandler = (ev) => hnHandleMapClick(ev);
    hnState.mouseMoveHandler = (ev) => hnHandleMapMouseMove(ev);
    // Separate `mousedown` tracking - see `hnHandleMouseDown` and
    // `hnIsClickTooLongOrDragged`.
    hnState.mouseDownHandler = (ev) => hnHandleMouseDown(ev);
    let viewport = null;
    try {
      viewport = sdk.Map.getMapViewportElement();
    } catch (e) {
      viewport = null;
    }
    if (viewport) {
      viewport.addEventListener('click', hnState.mapClickHandler, true);
      viewport.addEventListener('mousemove', hnState.mouseMoveHandler, true);
      viewport.addEventListener('mousedown', hnState.mouseDownHandler, true);
    } else {
      phShowToast(L('Nu am găsit elementul hărții - secvența e pornită, dar plasarea prin click nu va funcționa.', 'Map element not found - the sequence is started, but click placement will not work.'), true, hnToastAnchor());
    }

    // Detects native Undo removing a HN placed by this sequence, so the
    // sequence can roll back to the previous suffix. The high-level
    // `wme-house-number-deleted` event does NOT fire on Undo (only on
    // explicit delete from the UI). The working signal is the low-level
    // `sdk.Events.trackDataModelEvents({ dataModelName: 'segmentHouseNumbers' })`,
    // undocumented but discovered by inspecting the WME bundle, which fires
    // `wme-data-model-objects-removed` with `{ dataModelName, objectIds }`
    // on any removal from the collection, including Undo.
    hnState.placedStack = [];
    try {
      sdk.Events.trackDataModelEvents({ dataModelName: 'segmentHouseNumbers' });
    } catch (e) {
      // Ignored - likely already tracked (call is idempotent) or the API
      // is unavailable on an older SDK version; Undo detection just won't
      // work, but Start still proceeds.
      console.error(`${SCRIPT_NAME}: HN rapid - eșec la trackDataModelEvents.`, e);
    }
    hnState.removedHandler = (payload) => hnHandleHouseNumbersRemoved(payload);
    sdk.Events.on({ eventName: 'wme-data-model-objects-removed', eventHandler: hnState.removedHandler });

    phShowToast(L(`Secvență pornită: ${hnCandidateNumber()} - dă click pe hartă pentru a plasa (Stop oricând din panou).`, `Sequence started: ${hnCandidateNumber()} - click on the map to place (Stop anytime from the panel).`), false, hnToastAnchor());
  }

  // Waits for `wme-house-number-added`, fired right after `addHouseNumber`
  // - the only way to learn the new HN's ID, since `addHouseNumber` doesn't
  // return it. Resolves to the ID, or `null` if nothing arrives within
  // `timeoutMs`.
  function hnWaitForAddedId(timeoutMs = 1500) {
    return new Promise((resolve) => {
      let done = false;
      const handler = (payload) => {
        if (done) return;
        done = true;
        try {
          sdk.Events.off({ eventName: 'wme-house-number-added', eventHandler: handler });
        } catch (e) {}
        resolve(payload && typeof payload.houseNumberId === 'number' ? payload.houseNumberId : null);
      };
      try {
        sdk.Events.on({ eventName: 'wme-house-number-added', eventHandler: handler });
      } catch (e) {
        resolve(null);
        return;
      }
      setTimeout(() => {
        if (done) return;
        done = true;
        try {
          sdk.Events.off({ eventName: 'wme-house-number-added', eventHandler: handler });
        } catch (e) {}
        resolve(null);
      }, timeoutMs);
    });
  }

  // Handler for `wme-data-model-objects-removed`, registered while the
  // sequence is active. If the removed ID matches the top of
  // `hnState.placedStack` (the last HN this sequence placed), it was
  // undone (or manually deleted, treated the same) - roll back to the
  // previous suffix. Unrelated removals are ignored.
  function hnHandleHouseNumbersRemoved(payload) {
    if (!hnState.active) return;
    if (!payload || payload.dataModelName !== 'segmentHouseNumbers' || !Array.isArray(payload.objectIds)) return;
    if (!hnState.placedStack || !hnState.placedStack.length) return;
    const top = hnState.placedStack[hnState.placedStack.length - 1];
    if (!payload.objectIds.includes(top.id)) return;
    hnState.placedStack.pop();
    hnState.current = top.suffix;
    if (hnState.existingNumbers) hnState.existingNumbers.delete(top.key);
    hnUpdateNextValueDisplay();
    phShowToast(L(`UNDO detectat - revin la ${hnCandidateNumber()}.`, `Undo detected - back to ${hnCandidateNumber()}.`), false, hnToastAnchor());
  }

  function hnRenderActiveView() {
    const t = hnState.t;
    const body = hnState.body;
    if (!body) return;
    body.innerHTML = '';

    const info = document.createElement('div');
    info.style.cssText = 'margin-bottom: 8px;';
    const streetLine = document.createElement('div');
    streetLine.textContent = L('Click pe hartă pentru a plasa următorul număr:', 'Click on the map to place the next number:');
    streetLine.style.cssText = 'margin-bottom: 4px;';
    info.appendChild(streetLine);
    const nextValueEl = document.createElement('div');
    nextValueEl.style.cssText = 'font-weight: 700; font-size: 14px;';
    info.appendChild(nextValueEl);
    body.appendChild(info);
    hnState.nextValueEl = nextValueEl;
    hnUpdateNextValueDisplay();

    const stopBtn = document.createElement('div');
    stopBtn.textContent = 'Stop';
    stopBtn.style.cssText = `
      text-align: center;
      padding: 6px 0;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 700;
      background: #e8590c;
      color: #fff;
    `;
    stopBtn.addEventListener('click', () => hnStopSequence());
    body.appendChild(stopBtn);
  }

  function hnUpdateNextValueDisplay() {
    if (hnState.nextValueEl) hnState.nextValueEl.textContent = L(`Următorul: ${hnCandidateNumber()}`, `Next: ${hnCandidateNumber()}`);
  }

  function hnStopSequence() {
    if (!hnState.active) return;
    hnState.active = false;
    if (hnState.mapClickHandler || hnState.mouseMoveHandler || hnState.mouseDownHandler) {
      let viewport = null;
      try {
        viewport = sdk.Map.getMapViewportElement();
      } catch (e) {
        viewport = null;
      }
      if (viewport) {
        if (hnState.mapClickHandler) viewport.removeEventListener('click', hnState.mapClickHandler, true);
        if (hnState.mouseMoveHandler) viewport.removeEventListener('mousemove', hnState.mouseMoveHandler, true);
        if (hnState.mouseDownHandler) viewport.removeEventListener('mousedown', hnState.mouseDownHandler, true);
      }
    }
    hnState.mapClickHandler = null;
    hnState.mouseMoveHandler = null;
    hnState.mouseDownHandler = null;
    hnState.mouseDownX = null;
    hnState.mouseDownY = null;
    hnState.mouseDownAt = null;
    hnState.segmentCoords = null;
    hnState.streetId = null;
    hnState.scopeCache = null;
    hnState.scopeFetchedKey = null;
    // Stop Undo detection, symmetric with `hnStartSequence`.
    if (hnState.removedHandler) {
      try {
        sdk.Events.off({ eventName: 'wme-data-model-objects-removed', eventHandler: hnState.removedHandler });
      } catch (e) {}
      hnState.removedHandler = null;
    }
    try {
      sdk.Events.stopDataModelEventsTracking({ dataModelName: 'segmentHouseNumbers' });
    } catch (e) {}
    hnState.placedStack = [];
    hnRemoveIndicator();
    hnDismissDuplicateAlert();
    // Back to the setup form (panel stays open) - keeps prefix/mode/
    // direction so a new sequence can be started quickly.
    if (hnState.panel && hnState.body) hnRenderSetupForm();
  }

  function hnAdvanceSequence() {
    const next = hnNextSuffix(hnState.current, hnState.mode, hnState.direction);
    if (next === null) {
      phShowToast(
        hnState.mode === 'letter'
          ? L('Secvența de litere s-a terminat (A-Z epuizat) - oprită automat.', 'Letter sequence finished (A-Z exhausted) - stopped automatically.')
          : L('Secvența de numere a ajuns la limită (sub 1) - oprită automat.', 'Number sequence reached its limit (below 1) - stopped automatically.'),
        true,
        hnToastAnchor()
      );
      hnStopSequence();
      return;
    }
    hnState.current = next;
    hnUpdateNextValueDisplay();
  }

  // The native `click` event still fires after a click-and-drag map pan,
  // as long as `mousedown`/`mouseup` land on the same DOM element (the map
  // canvas, which doesn't change during a pan). Without filtering this, an
  // accidental pan while the sequence is active would place a HN at the
  // drag end point. We distinguish a real short click from a drag or a
  // held-down press using `mousedown` position/time
  // (`hnState.mouseDownX/Y/At`) vs. the click itself:
  // 1. Drag: distance since `mousedown` exceeds `HN_CLICK_MAX_DRAG_PX`.
  // 2. Held press (no drag): time since `mousedown` exceeds
  //    `HN_CLICK_MAX_HOLD_MS`.
  const HN_CLICK_MAX_DRAG_PX = 6;
  const HN_CLICK_MAX_HOLD_MS = 400;

  function hnHandleMouseDown(ev) {
    if (!hnState.active) return;
    hnState.mouseDownX = ev.clientX;
    hnState.mouseDownY = ev.clientY;
    hnState.mouseDownAt = performance.now();
  }

  // true if the current click does not qualify as a "short click" relative
  // to the last recorded `mousedown` - see `hnHandleMapClick`.
  function hnIsClickTooLongOrDragged(ev) {
    if (hnState.mouseDownX === null || hnState.mouseDownAt === null) return false; // no mousedown recorded - fail open
    const dist = Math.hypot(ev.clientX - hnState.mouseDownX, ev.clientY - hnState.mouseDownY);
    const duration = performance.now() - hnState.mouseDownAt;
    return dist > HN_CLICK_MAX_DRAG_PX || duration > HN_CLICK_MAX_HOLD_MS;
  }

  function hnHandleMapClick(ev) {
    if (!hnState.active) return;
    // Defensive: our panel is `position: fixed`, separate from the map
    // canvas, so this shouldn't normally trigger, but check anyway.
    if (hnState.panel && hnState.panel.contains(ev.target)) return;
    if (hnState.alertEl && hnState.alertEl.contains(ev.target)) return;

    if (hnIsClickTooLongOrDragged(ev)) {
      // Long press or drag (map pan) - place nothing, sequence unchanged.
      // No toast: drags are frequent during an active sequence and would
      // be noise.
      hnState.mouseDownX = null;
      hnState.mouseDownY = null;
      hnState.mouseDownAt = null;
      return;
    }
    hnState.mouseDownX = null;
    hnState.mouseDownY = null;
    hnState.mouseDownAt = null;

    const candidate = hnCandidateNumber();
    const key = candidate.toUpperCase().trim();
    if (hnState.existingNumbers && hnState.existingNumbers.has(key)) {
      hnShowDuplicateAlert(candidate);
      return;
    }

    // Target = the street's segment nearest to the click (like native HN
    // mode), falling back to the Start segment.
    const snap = hnComputeSnapPixel(ev.clientX, ev.clientY);
    const targetSegmentId = (snap && snap.segmentId) || hnState.segmentId;

    // The placement point is the raw click coordinate, not snapped/
    // projected onto the segment geometry - a HN normally sits beside the
    // road, not on it. The visual indicator (dot + dashed line,
    // `hnHandleMapMouseMove`) only shows the nearest point on the selected
    // street segment's geometry for reference; it does not affect the
    // saved point. Street association is guaranteed by choosing the target
    // only among segments of the Start segment's street (never a nearby
    // parallel street).
    let lonLat;
    try {
      lonLat = sdk.Map.getLonLatFromPixel({ x: ev.clientX, y: ev.clientY });
    } catch (e) {
      lonLat = null;
    }
    if (!lonLat) {
      phShowToast(L('Nu am putut determina poziția de pe hartă a click-ului.', 'Could not determine the map position of the click.'), true, hnToastAnchor());
      return;
    }

    try {
      // Takes a single object `{number, point, segmentId}`, not 3
      // positional arguments as the public SDK docs suggest - the
      // positional form throws "expected 1 argument, got 3".
      sdk.DataModel.HouseNumbers.addHouseNumber({
        number: candidate,
        point: { type: 'Point', coordinates: [lonLat.lon, lonLat.lat] },
        segmentId: targetSegmentId,
      });
    } catch (e) {
      console.error(`${SCRIPT_NAME}: HN rapid - eșec la addHouseNumber.`, e);
      phShowToast(L(`Eroare la adăugarea numărului "${candidate}" - vezi consola. Secvența continuă.`, `Error adding number "${candidate}" - see the console. The sequence continues.`), true, hnToastAnchor());
      return;
    }

    if (hnState.existingNumbers) hnState.existingNumbers.add(key);
    hnMaybeRefreshScopeNumbers();
    // Capture the current suffix before `hnAdvanceSequence()` changes it -
    // this is the value to roll back to if this HN is undone (see
    // `hnHandleHouseNumbersRemoved`). The real ID arrives asynchronously via
    // `wme-house-number-added`; we don't block placement/advance on it.
    const suffixAtPlacement = hnState.current;
    hnWaitForAddedId().then((id) => {
      if (id !== null && hnState.active) {
        hnState.placedStack.push({ id, suffix: suffixAtPlacement, key });
      }
    });
    hnAdvanceSequence();
  }

  // Projects (px,py) onto the given polyline (array of {x,y}) and returns
  // the nearest point on it, same coordinate space. Used only for the
  // visual indicator (`hnHandleMapMouseMove`), not for the actual saved
  // placement point (see `hnHandleMapClick` - the point stays exactly
  // where the user clicked, not snapped to the road).
  function hnNearestPointOnPolylinePixels(px, py, pixPoints) {
    let best = null;
    let bestDist = Infinity;
    for (let i = 1; i < pixPoints.length; i++) {
      const a = pixPoints[i - 1];
      const b = pixPoints[i];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const lenSq = dx * dx + dy * dy;
      let t = lenSq > 0 ? ((px - a.x) * dx + (py - a.y) * dy) / lenSq : 0;
      t = Math.max(0, Math.min(1, t));
      const cx = a.x + t * dx;
      const cy = a.y + t * dy;
      const dist = Math.hypot(px - cx, py - cy);
      if (dist < bestDist) {
        bestDist = dist;
        best = { x: cx, y: cy };
      }
    }
    return best;
  }

  const HN_SCOPE_CACHE_MS = 1000;

  // Segments HN rapid may place on: every currently loaded segment whose
  // primary street is the Start segment's street (same name + city), or
  // just the Start segment if it's unnamed. Cached ~1s (mousemove is
  // frequent); geometry re-read so edits/pan-loaded segments are picked up.
  function hnScopeSegments() {
    const now = performance.now();
    if (hnState.scopeCache && now - hnState.scopeCache.at < HN_SCOPE_CACHE_MS) return hnState.scopeCache.segments;
    let segments = [];
    if (hnState.streetId) {
      try {
        segments = sdk.DataModel.Segments.getAll()
          .filter((s) => s.primaryStreetId === hnState.streetId && s.geometry && s.geometry.coordinates.length >= 2)
          .map((s) => ({ id: s.id, coords: getLiveSegmentLonLatCoords(s.id) || s.geometry.coordinates }));
      } catch (e) {
        segments = [];
      }
    }
    if (!segments.length && hnState.segmentCoords) {
      segments = [{ id: hnState.segmentId, coords: hnState.segmentCoords }];
    }
    hnState.scopeCache = { at: now, segments };
    return segments;
  }

  // Re-fetches existing numbers when the street's loaded segments changed
  // (map panned onto more of the street), so duplicate checks cover them.
  function hnMaybeRefreshScopeNumbers() {
    const ids = hnScopeSegments().map((s) => s.id);
    const key = ids.slice().sort().join(',');
    if (!ids.length || key === hnState.scopeFetchedKey) return;
    hnState.scopeFetchedKey = key;
    sdk.DataModel.HouseNumbers.fetchHouseNumbers({ segmentIds: ids })
      .then((list) => {
        if (!hnState.active || !hnState.existingNumbers) return;
        (list || []).forEach((hn) => hnState.existingNumbers.add(String(hn.number).toUpperCase().trim()));
      })
      .catch(() => {});
  }

  // Nearest point (pixel space) on any segment of the street, plus that
  // segment's id - used for the indicator AND for choosing the segment a
  // click's HN is attached to. Pixel geometry recomputed every call to
  // stay correct across pan/zoom.
  function hnComputeSnapPixel(clientX, clientY) {
    let best = null;
    for (const seg of hnScopeSegments()) {
      if (!seg.coords || seg.coords.length < 2) continue;
      let pixPoints;
      try {
        pixPoints = seg.coords.map((c) => sdk.Map.getPixelFromLonLat({ lonLat: { lon: c[0], lat: c[1] } }));
      } catch (e) {
        continue;
      }
      const p = hnNearestPointOnPolylinePixels(clientX, clientY, pixPoints);
      if (!p) continue;
      const d = Math.hypot(clientX - p.x, clientY - p.y);
      if (!best || d < best.dist) best = { x: p.x, y: p.y, dist: d, segmentId: seg.id };
    }
    return best;
  }

  // Visual indicator (blue dot + dashed line to cursor), mimicking WME's
  // native HN-add indicator. A full-screen `position: fixed` SVG with
  // `pointer-events: none` so it never intercepts placement clicks.
  function hnBuildIndicator() {
    hnRemoveIndicator();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: ${OWN_UI_MENU_Z_INDEX - 1};
    `;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', '#1a73e8');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(line);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', '#1a73e8');
    dot.setAttribute('stroke', '#fff');
    dot.setAttribute('stroke-width', '2');
    svg.appendChild(dot);
    document.body.appendChild(svg);
    hnState.indicatorEl = svg;
    hnState.indicatorLine = line;
    hnState.indicatorDot = dot;
  }

  function hnRemoveIndicator() {
    if (hnState.indicatorEl) hnState.indicatorEl.remove();
    hnState.indicatorEl = null;
    hnState.indicatorLine = null;
    hnState.indicatorDot = null;
  }

  function hnHandleMapMouseMove(ev) {
    if (!hnState.active || !hnState.indicatorLine || !hnState.indicatorDot) return;
    const snap = hnComputeSnapPixel(ev.clientX, ev.clientY);
    if (!snap) return;
    hnState.indicatorLine.setAttribute('x1', String(ev.clientX));
    hnState.indicatorLine.setAttribute('y1', String(ev.clientY));
    hnState.indicatorLine.setAttribute('x2', String(snap.x));
    hnState.indicatorLine.setAttribute('y2', String(snap.y));
    hnState.indicatorDot.setAttribute('cx', String(snap.x));
    hnState.indicatorDot.setAttribute('cy', String(snap.y));
  }

  function hnDismissDuplicateAlert() {
    if (hnState.alertEl) hnState.alertEl.remove();
    hnState.alertEl = null;
  }

  // Small alert shown when the candidate number already exists on the
  // street, with Skip (advance to next) and Stop actions.
  function hnShowDuplicateAlert(candidate) {
    hnDismissDuplicateAlert();
    const t = hnState.t;
    const alertEl = document.createElement('div');
    alertEl.style.cssText = `
      position: fixed;
      z-index: ${OWN_UI_MENU_Z_INDEX + 10};
      background: ${t.menuBg};
      border: 1px solid #e8590c;
      border-left: 4px solid #e8590c;
      color: ${t.menuText};
      border-radius: 6px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      font: 400 11px/1.4 Arial, sans-serif;
      padding: 8px 10px;
      min-width: 220px;
    `;
    const msg = document.createElement('div');
    msg.textContent = L(`Numărul "${candidate}" există deja pe această stradă.`, `Number "${candidate}" already exists on this street.`);
    msg.style.cssText = 'margin-bottom: 8px; font-weight: 700;';
    alertEl.appendChild(msg);

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 6px;';
    const skipBtn = document.createElement('div');
    skipBtn.textContent = L('Omite', 'Skip');
    skipBtn.title = L('Trece la următorul număr din secvență (nu plasează acesta)', 'Go to the next number in the sequence (does not place this one)');
    skipBtn.style.cssText = `
      flex: 1;
      text-align: center;
      padding: 4px 0;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 700;
      background: ${t.barBg};
      border: 1px solid ${t.barBorder};
    `;
    skipBtn.addEventListener('click', () => {
      hnDismissDuplicateAlert();
      hnAdvanceSequence();
    });
    const stopAlertBtn = document.createElement('div');
    stopAlertBtn.textContent = 'Stop';
    stopAlertBtn.style.cssText = `
      flex: 1;
      text-align: center;
      padding: 4px 0;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 700;
      background: #e8590c;
      color: #fff;
    `;
    stopAlertBtn.addEventListener('click', () => {
      hnDismissDuplicateAlert();
      hnStopSequence();
    });
    row.appendChild(skipBtn);
    row.appendChild(stopAlertBtn);
    alertEl.appendChild(row);

    document.body.appendChild(alertEl);
    if (hnState.panel) {
      const panelRect = hnState.panel.getBoundingClientRect();
      const alertRect = alertEl.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = Math.min(vw - alertRect.width - 8, Math.max(8, panelRect.left));
      let top = panelRect.bottom + 6;
      if (top + alertRect.height + 8 > vh) top = Math.max(8, panelRect.top - alertRect.height - 6);
      alertEl.style.left = `${Math.round(left)}px`;
      alertEl.style.top = `${Math.round(top)}px`;
    } else {
      alertEl.style.bottom = '20px';
      alertEl.style.right = '20px';
    }
    hnState.alertEl = alertEl;
  }

  // ---------------------------------------------------------------------
  // "Cut segment" (scissors button). Uses
  // `sdk.DataModel.Segments.splitSegment({segmentId, splitPoint})`, which
  // splits a segment into 2 new segments (temporary negative IDs) plus 1
  // new node in a single call, as a normal unsaved edit (Undo enabled,
  // magenta highlight) - the original segment is untouched locally until
  // Save.
  //
  // Unlike "HN rapid" (where the point must stay exactly where the user
  // clicked), here the point must lie on the segment geometry - you can't
  // split a road "beside" it - so the visual indicator (dot + dashed line
  // to cursor, mimicking WME Toolbox) is also the actual point sent to
  // `splitSegment`, not just informational.
  //
  // Single-shot: one click arms cut mode, one map click cuts and disarms.
  // After a cut, the original segment stays in the data model (state
  // DELETE, still returned by `Segments.getAll()`) on top of its two new
  // pieces until Save. The nearest-segment search must skip it: picking it
  // made every second cut on the same road fail ("node null does not
  // exist" / "Failed to split specified segment") - Paul's bug, 0.35.2.
  // The pieces themselves (negative IDs) can be cut again normally
  // (live-tested in the sandbox).
  //
  // No segment needs to be pre-selected: on each mousemove/click we search
  // all loaded segments (`sdk.DataModel.Segments.getAll()`) for the one
  // nearest the cursor, using the same point-on-polyline projection as
  // `hnNearestPointOnPolylinePixels`. This is stateless and re-run on every
  // event (no geometry cache), since the target segment can change between
  // events. Negligible cost at typical viewport segment counts; a spatial
  // index would help at much larger counts but isn't needed here.
  //
  // `sdk.Map.getPixelFromLonLat`/`getLonLatFromPixel` are exact inverses
  // and operate in the same coordinate space as `ev.clientX`/`clientY` -
  // no `getBoundingClientRect()` offset correction is needed or applied
  // anywhere below (search, indicator, or the point sent to
  // `splitSegment`).
  // Fixed pixel radius, NOT recomputed per zoom level - same tolerance in
  // screen pixels everywhere, so its real-world (ground) size shrinks when
  // zoomed in and grows when zoomed out (real meters ~= px * mapResolution
  // * cos(latitude), since WME's resolution is in Web Mercator units).
  // Chosen so it's ~30m at zoom 20 in Romania (live-tested: 300px = ~30.6m
  // at zoom 20, lat ~46.9 - was 25px = ~2.5m before).
  const CUT_MAX_SNAP_DISTANCE_PX = 300;

  const cutState = {
    active: false,
    btnEl: null,
    mapClickHandler: null,
    mouseMoveHandler: null,
    keydownHandler: null,
    indicatorEl: null,
    indicatorDot: null,
    indicatorLine: null,
  };

  // Finds the closest point among all currently loaded segments to pixel
  // (clientX, clientY). Returns { segmentId, x, y, dist } or null if no
  // point is within CUT_MAX_SNAP_DISTANCE_PX px. Geometry is recomputed
  // in pixels on every call (no caching) so it stays correct across
  // pan/zoom.
  // Segments deleted locally (e.g. the original of an unsaved cut) are
  // still in `Segments.getAll()`; the SDK object has no state, so the
  // legacy model is asked.
  function cutIsDeletedLocally(segmentId) {
    try {
      const o = window.W && window.W.model && window.W.model.segments && window.W.model.segments.getObjectById(segmentId);
      return !!(o && (o.state === 'DELETE' || (typeof o.isDeleted === 'function' && o.isDeleted())));
    } catch (e) {
      return false;
    }
  }

  function cutFindNearestSegmentSnap(clientX, clientY) {
    let segments;
    try {
      segments = sdk.DataModel.Segments.getAll();
    } catch (e) {
      return null;
    }
    if (!segments || !segments.length) return null;

    let best = null;
    for (const segment of segments) {
      const coords = segment.geometry && segment.geometry.coordinates;
      if (!coords || coords.length < 2) continue;
      if (cutIsDeletedLocally(segment.id)) continue;
      let pixPoints;
      try {
        pixPoints = coords.map((c) => sdk.Map.getPixelFromLonLat({ lonLat: { lon: c[0], lat: c[1] } }));
      } catch (e) {
        continue;
      }
      const snap = hnNearestPointOnPolylinePixels(clientX, clientY, pixPoints);
      if (!snap) continue;
      const dist = Math.hypot(snap.x - clientX, snap.y - clientY);
      if (dist > CUT_MAX_SNAP_DISTANCE_PX) continue;
      if (!best || dist < best.dist) {
        best = { segmentId: segment.id, x: snap.x, y: snap.y, dist };
      }
    }
    return best;
  }

  // White dot + dashed line to cursor, mimicking WME Toolbox's cut preview.
  // Same construction as hnBuildIndicator (separate SVG, position: fixed,
  // no own event listeners), but white instead of blue to stay visually
  // distinct from the "quick HN" indicator.
  function cutBuildIndicator() {
    cutRemoveIndicator();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: ${OWN_UI_MENU_Z_INDEX - 1};
    `;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', '#fff');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(line);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '5');
    dot.setAttribute('fill', '#fff');
    dot.setAttribute('stroke', '#333');
    dot.setAttribute('stroke-width', '2');
    svg.appendChild(dot);
    document.body.appendChild(svg);
    cutState.indicatorEl = svg;
    cutState.indicatorLine = line;
    cutState.indicatorDot = dot;
  }

  function cutRemoveIndicator() {
    if (cutState.indicatorEl) cutState.indicatorEl.remove();
    cutState.indicatorEl = null;
    cutState.indicatorLine = null;
    cutState.indicatorDot = null;
  }

  function cutHandleMapMouseMove(ev) {
    if (!cutState.active || !cutState.indicatorLine || !cutState.indicatorDot) return;
    const snap = cutFindNearestSegmentSnap(ev.clientX, ev.clientY);
    if (!snap) {
      // No segment close enough - hide the indicator to make clear a
      // click here would not cut anything.
      cutState.indicatorEl.style.display = 'none';
      return;
    }
    cutState.indicatorEl.style.display = '';
    cutState.indicatorLine.setAttribute('x1', String(ev.clientX));
    cutState.indicatorLine.setAttribute('y1', String(ev.clientY));
    cutState.indicatorLine.setAttribute('x2', String(snap.x));
    cutState.indicatorLine.setAttribute('y2', String(snap.y));
    cutState.indicatorDot.setAttribute('cx', String(snap.x));
    cutState.indicatorDot.setAttribute('cy', String(snap.y));
  }

  function cutToastAnchor() {
    return cutState.btnEl ? cutState.btnEl.getBoundingClientRect() : null;
  }

  function cutHandleKeydown(ev) {
    if (ev.key === 'Escape' && cutState.active) {
      ev.stopPropagation();
      cutDisarm();
    }
  }

  function cutHandleMapClick(ev) {
    if (!cutState.active) return;
    // Ignore clicks on our own UI (button, badge, toast).
    if (segmentState.badge && segmentState.badge.contains(ev.target)) return;
    if (phToastEl && phToastEl.contains(ev.target)) return;

    // Recompute on click rather than reusing the last mousemove result -
    // the nearest segment can differ slightly between the two events.
    const snap = cutFindNearestSegmentSnap(ev.clientX, ev.clientY);
    if (!snap) {
      phShowToast(L('Niciun segment suficient de aproape de click pentru tăiere.', 'No segment close enough to the click to cut.'), true, cutToastAnchor());
      return;
    }
    let lonLat;
    try {
      lonLat = sdk.Map.getLonLatFromPixel({ x: snap.x, y: snap.y });
    } catch (e) {
      lonLat = null;
    }
    if (!lonLat) {
      phShowToast(L('Nu am putut determina punctul de tăiere pe segment.', 'Could not determine the cut point on the segment.'), true, cutToastAnchor());
      return;
    }

    const segmentId = snap.segmentId;
    const unsavedBefore = sdk.Editing.getUnsavedChangesCount();
    try {
      sdk.DataModel.Segments.splitSegment({
        segmentId,
        splitPoint: { type: 'Point', coordinates: [lonLat.lon, lonLat.lat] },
      });
    } catch (e) {
      // A failed split can still leave a (broken) action in the undo
      // history - seen live with "node null does not exist". Roll it back.
      try {
        if (sdk.Editing.getUnsavedChangesCount() > unsavedBefore) sdk.Editing.undo();
      } catch (e2) {
        // ignore
      }
      console.error(`${SCRIPT_NAME}: Taie segmentul - eșec la splitSegment.`, e);
      phShowToast(L('Eroare la tăierea segmentului - vezi consola.', 'Error cutting the segment - see the console.'), true, cutToastAnchor());
      cutDisarm();
      return;
    }

    phShowToast(L('Segment tăiat (modificare nesalvată - Undo/Ctrl+Z anulează).', 'Segment cut (unsaved change - Undo/Ctrl+Z reverts it).'), false, cutToastAnchor());
    cutDisarm();
    // The original segment stays unchanged locally until save, so its
    // badge would otherwise show stale length/position. Force a clean
    // deselection; checkSelection() (350ms poll) then clears the badge/bar
    // like any other deselection.
    try {
      sdk.Editing.clearSelection();
    } catch (e) {
      // ignore - worst case the badge shows stale data until the next
      // manual selection
    }
  }

  // Arming does not depend on any particular segment - it just starts the
  // indicator and global listeners; the segment actually cut is
  // determined on each mousemove/click via cutFindNearestSegmentSnap.
  function cutArm(btnEl) {
    if (cutState.active) cutDisarm();

    cutState.active = true;
    cutState.btnEl = btnEl || null;
    setQuickBarActive(btnEl, true);

    cutBuildIndicator();
    cutState.mapClickHandler = cutHandleMapClick;
    cutState.mouseMoveHandler = cutHandleMapMouseMove;
    cutState.keydownHandler = cutHandleKeydown;
    const viewportEl = sdk.Map.getMapViewportElement ? sdk.Map.getMapViewportElement() : null;
    if (viewportEl) {
      viewportEl.addEventListener('click', cutState.mapClickHandler, true);
      viewportEl.addEventListener('mousemove', cutState.mouseMoveHandler, true);
    }
    document.addEventListener('keydown', cutState.keydownHandler, true);
  }

  function cutDisarm() {
    const viewportEl = sdk.Map.getMapViewportElement ? sdk.Map.getMapViewportElement() : null;
    if (viewportEl && cutState.mapClickHandler) viewportEl.removeEventListener('click', cutState.mapClickHandler, true);
    if (viewportEl && cutState.mouseMoveHandler) viewportEl.removeEventListener('mousemove', cutState.mouseMoveHandler, true);
    if (cutState.keydownHandler) document.removeEventListener('keydown', cutState.keydownHandler, true);
    cutRemoveIndicator();
    if (cutState.btnEl) setQuickBarActive(cutState.btnEl, false);
    cutState.active = false;
    cutState.btnEl = null;
    cutState.mapClickHandler = null;
    cutState.mouseMoveHandler = null;
    cutState.keydownHandler = null;
  }

  // The quick-bar cut button arms the same global tool as the X shortcut
  // (cutToggleGlobal below) rather than fixing the selected segment.
  function quickBarToggleCut(ev, btnEl) {
    ev.stopPropagation();
    if (cutState.active) {
      cutDisarm();
      return;
    }
    cutArm(btnEl);
  }

  // Registers a native shortcut (sdk.Shortcuts, shows up in the Keyboard
  // Shortcuts panel under the script's name - see registerCutShortcut).
  // Arms/disarms the global cut tool regardless of whether a segment is
  // selected.
  function cutToggleGlobal() {
    if (!settings.cutSegmentTool) return;
    if (cutState.active) {
      cutDisarm();
      return;
    }
    // Anchor for toast/button highlight, only if a selected segment's
    // quick bar happens to be visible - purely optional, the tool works
    // the same without any selection.
    const btnEl = segmentState.quickBarEls ? segmentState.quickBarEls.btnCut : null;
    cutArm(btnEl);
  }

  // The X shortcut may already be taken (e.g. by WME Toolbox's "Cut
  // Segment") when this registers - failure (InvalidStateError, key
  // already bound) is only logged, not fatal. Shortcuts register once at
  // script startup; there's no "key freed" event to retry on live.
  function registerCutShortcut() {
    try {
      sdk.Shortcuts.createShortcut({
        shortcutId: `${SCRIPT_ID}-cut-segment`,
        shortcutKeys: 'X',
        description: L('Taie orice segment (armează modul de tăiere ✂️, fără să fie nevoie de selecție)', 'Cut any segment (arms cut mode ✂️, no selection needed)'),
        callback: cutToggleGlobal,
      });
    } catch (e) {
      console.warn(
        `${SCRIPT_NAME}: nu am putut înregistra scurtătura "X" pentru Taie segmentul (probabil încă ocupată de alt script) - ${e.message}`
      );
    }
  }

  // ---------------------------------------------------------------------
  // Segment parameter automation
  //
  // Road type ids (confirmed via getRoadTypes()):
  //   1=STREET(St) 2=PRIMARY_STREET(PS) 3=FREEWAY(Fw) 4=RAMP(Rmp)
  //   6=MAJOR_HIGHWAY(MH) 7=MINOR_HIGHWAY(mH) 8=OFF_ROAD(4x4) 15=FERRY(Bac)
  //   17=PRIVATE_ROAD(PR) 18=RAILROAD(CF) 19=RUNWAY_TAXIWAY(PA)
  //   20=PARKING_LOT_ROAD(PLR) 22=ALLEY(NS)
  //
  // WME renders the segment details panel as Stencil components
  // (<wz-checkable-chip>) with no SDK event for "flag/road type changed",
  // so we listen to native clicks via DOM delegation on document, capture
  // phase (runs before WME's own handler so we can read the OLD state
  // before WME applies the change). After the click we poll briefly for
  // the SDK to reflect the new state (roadType or flagAttributes.unpaved),
  // then apply the automation via sdk.DataModel.Segments.updateSegment().
  const RT = {
    STREET: 1,
    PRIMARY_STREET: 2,
    FREEWAY: 3,
    RAMP: 4,
    MAJOR_HIGHWAY: 6,
    MINOR_HIGHWAY: 7,
    OFF_ROAD: 8,
    FERRY: 15,
    PRIVATE_ROAD: 17,
    RAILROAD: 18,
    RUNWAY_TAXIWAY: 19,
    PARKING_LOT_ROAD: 20,
    ALLEY: 22, // "NS" / Narrow Street în UI
  };

  // UI-displayed Lock Level (1-6) -> internal lockRank (0-indexed).
  function levelToRank(level) {
    return level - 1;
  }

  // Minimum Lock Level (UI level) enforced for these road types - applied
  // only if the current level is lower (never lowers an already-higher
  // lock). RAMP has no fixed minimum - computed separately from connected
  // segments (see below).
  const LOCK_LEVEL_MIN_BY_ROAD_TYPE = {
    [RT.PRIMARY_STREET]: 3,
    [RT.MINOR_HIGHWAY]: 3,
    [RT.MAJOR_HIGHWAY]: 4,
    [RT.FREEWAY]: 5,
  };

  function updateSegmentSafe(segmentId, fields) {
    try {
      sdk.DataModel.Segments.updateSegment({ segmentId, ...fields });
    } catch (e) {
      console.error(`${SCRIPT_NAME}: automatizare - eșec la actualizarea segmentului ${segmentId}.`, e, fields);
    }
  }

  // Max lock rank among segments connected to a RAMP (via both end nodes),
  // excluding the ramp itself (e.g. ramp between a Freeway lock 5 and a
  // Major Highway lock 4 -> ramp gets 5).
  function maxConnectedLockRank(segmentId) {
    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId });
    } catch (e) {
      return null;
    }
    if (!segment) return null;

    const neighborIds = new Set();
    [segment.fromNodeId, segment.toNodeId].forEach((nodeId) => {
      if (nodeId == null) return;
      let node;
      try {
        node = sdk.DataModel.Nodes.getById({ nodeId });
      } catch (e) {
        node = null;
      }
      if (!node || !node.connectedSegmentIds) return;
      node.connectedSegmentIds.forEach((id) => {
        if (id !== segmentId) neighborIds.add(id);
      });
    });

    let max = null;
    neighborIds.forEach((id) => {
      let neighbor;
      try {
        neighbor = sdk.DataModel.Segments.getById({ segmentId: id });
      } catch (e) {
        neighbor = null;
      }
      if (!neighbor || typeof neighbor.lockRank !== 'number') return;
      if (max === null || neighbor.lockRank > max) max = neighbor.lockRank;
    });
    return max;
  }

  // Toggling the "Unpaved" button. roadTypeAtClick = road type before the
  // click (unpaved doesn't change road type, so it's still valid after).
  function applyUnpavedAutomation(segmentId, turnedOn, roadTypeAtClick) {
    if (turnedOn) {
      // Unpaved OFF -> ON.
      updateSegmentSafe(segmentId, { fwdSpeedLimit: 20, revSpeedLimit: 20 });
      if (roadTypeAtClick === RT.OFF_ROAD) {
        updateSegmentSafe(segmentId, { roadType: RT.STREET });
      }
      updateSegmentSafe(segmentId, { lockRank: levelToRank(3) });
    } else {
      // Unpaved ON -> OFF.
      if (roadTypeAtClick === RT.STREET) {
        updateSegmentSafe(segmentId, { fwdSpeedLimit: 30, revSpeedLimit: 30 });
      }
      let segment;
      try {
        segment = sdk.DataModel.Segments.getById({ segmentId });
      } catch (e) {
        segment = null;
      }
      const minRank = levelToRank(3);
      if (segment && segment.lockRank < minRank) {
        updateSegmentSafe(segmentId, { lockRank: minRank });
      }
    }
  }

  // Applied on road type change. newRoadType = the new id (after click),
  // read via SDK.
  function applyRoadTypeAutomation(segmentId, newRoadType) {
    // Primary Street, Minor/Major Highway, Freeway, Ramp.
    const isMajorRoad =
      newRoadType === RT.PRIMARY_STREET ||
      newRoadType === RT.MINOR_HIGHWAY ||
      newRoadType === RT.MAJOR_HIGHWAY ||
      newRoadType === RT.FREEWAY ||
      newRoadType === RT.RAMP;

    if (isMajorRoad) {
      updateSegmentSafe(segmentId, { flagAttributes: { headlights: true } });

      if (newRoadType === RT.RAMP) {
        const maxLock = maxConnectedLockRank(segmentId);
        if (maxLock !== null) {
          updateSegmentSafe(segmentId, { lockRank: maxLock });
        }
      } else {
        const minLevel = LOCK_LEVEL_MIN_BY_ROAD_TYPE[newRoadType];
        if (minLevel) {
          const minRank = levelToRank(minLevel);
          let segment;
          try {
            segment = sdk.DataModel.Segments.getById({ segmentId });
          } catch (e) {
            segment = null;
          }
          if (segment && segment.lockRank < minRank) {
            updateSegmentSafe(segmentId, { lockRank: minRank });
          }
        }
      }
      return;
    }

    // Remaining road types with their own rules (Street, NS/Alley, 4x4,
    // PLR, PR, Ferry, Railway, Runway). Street: a direct click (e.g. 4x4
    // straight to Street) also sets speed 30/30, same as via Unpaved OFF
    // above.
    switch (newRoadType) {
      case RT.STREET: // St
        updateSegmentSafe(segmentId, { fwdSpeedLimit: 30, revSpeedLimit: 30 });
        break;
      case RT.ALLEY: // NS - Narrow Street
        updateSegmentSafe(segmentId, { lockRank: levelToRank(3), fwdSpeedLimit: 30, revSpeedLimit: 30 });
        break;
      case RT.PARKING_LOT_ROAD: // PLR
        updateSegmentSafe(segmentId, { lockRank: levelToRank(3), fwdSpeedLimit: 30, revSpeedLimit: 30 });
        break;
      case RT.PRIVATE_ROAD: // PR
        updateSegmentSafe(segmentId, { lockRank: levelToRank(3), fwdSpeedLimit: 10, revSpeedLimit: 10 });
        break;
      case RT.OFF_ROAD: // 4x4
        updateSegmentSafe(segmentId, {
          lockRank: levelToRank(3),
          fwdSpeedLimit: 15,
          revSpeedLimit: 15,
          flagAttributes: { unpaved: false },
        });
        break;
      case RT.FERRY: // Bac
        updateSegmentSafe(segmentId, { lockRank: levelToRank(5), fwdSpeedLimit: 5, revSpeedLimit: 5 });
        break;
      case RT.RAILROAD: // CF
        updateSegmentSafe(segmentId, { lockRank: levelToRank(3) });
        break;
      case RT.RUNWAY_TAXIWAY: // PA
        updateSegmentSafe(segmentId, { lockRank: levelToRank(5) });
        break;
      default:
        break;
    }
  }

  // Polls briefly (up to ~1.5s) until the segment state read via SDK
  // reflects the expected change (WME applies the native click's change
  // asynchronously), then calls the callback. Silently gives up on
  // timeout (e.g. click cancelled, segment deleted meanwhile).
  function watchSegmentUntil(segmentId, predicate, onMatch, timeoutMs = 1500) {
    const deadline = Date.now() + timeoutMs;
    function tick() {
      let segment;
      try {
        segment = sdk.DataModel.Segments.getById({ segmentId });
      } catch (e) {
        segment = null;
      }
      if (segment && predicate(segment)) {
        onMatch(segment);
        return;
      }
      if (Date.now() > deadline) return;
      setTimeout(tick, 60);
    }
    setTimeout(tick, 60);
  }

  // Currently selected segments. Automation supports multi-segment
  // selection: the details panel (Unpaved + road type buttons) stays
  // visible with multiple segments selected, and clicking a chip applies
  // the native change to all of them at once, so we apply the automation
  // per segment in the selection.
  function getSelectedSegmentIds() {
    let sel;
    try {
      sel = sdk.Editing.getSelection();
    } catch (e) {
      return [];
    }
    if (sel && sel.objectType === 'segment' && sel.ids && sel.ids.length >= 1) return sel.ids;
    return [];
  }

  // Delegated listener (capture phase, on document) for clicks on the
  // "Unpaved" button and road type buttons in the selected segment(s)
  // details panel. Capture phase runs before WME's own handler, so we can
  // read each segment's OLD state before WME applies the change.
  //
  // With a multi-segment selection, each segment may start from a
  // different state - we capture the BEFORE state per id, then wait
  // independently per segment before applying its own automation.
  function handleAutomationClickCapture(event) {
    // Runs if either feature is active - parameter automation and U-turn
    // detection are independent, though both start from the same click.
    if (!settings.segmentAutomation && !settings.uturnDetection) return;

    const chip = event.target.closest && event.target.closest('wz-checkable-chip');
    if (!chip) return;

    const segmentIds = getSelectedSegmentIds();
    if (!segmentIds.length) return;

    const isUnpavedChip = !!chip.querySelector('i.w-icon-unpaved-fill');
    const isRoadTypeChip = chip.classList.contains('cs-compact-button');
    if (!isUnpavedChip && !isRoadTypeChip) return;

    const beforeStates = new Map();
    segmentIds.forEach((id) => {
      let s;
      try {
        s = sdk.DataModel.Segments.getById({ segmentId: id });
      } catch (e) {
        s = null;
      }
      if (s) beforeStates.set(id, { unpaved: !!s.flagAttributes.unpaved, roadType: s.roadType });
    });
    if (!beforeStates.size) return;

    if (isUnpavedChip) {
      beforeStates.forEach((before, id) => {
        watchSegmentUntil(
          id,
          (seg) => !!seg.flagAttributes.unpaved !== before.unpaved,
          () => {
            if (settings.segmentAutomation) applyUnpavedAutomation(id, !before.unpaved, before.roadType);
            checkAndAlertUturn(id);
          }
        );
      });
      return;
    }

    // Road type button - capture the old type per segment and wait for it
    // to change (not every click changes it, e.g. clicking the already
    // active button), with a timeout.
    beforeStates.forEach((before, id) => {
      watchSegmentUntil(
        id,
        (seg) => seg.roadType !== before.roadType,
        (seg) => {
          if (settings.segmentAutomation) applyRoadTypeAutomation(id, seg.roadType);
          checkAndAlertUturn(id);
        }
      );
    });
  }

  function attachSegmentAutomation() {
    document.addEventListener('click', handleAutomationClickCapture, true);
  }

  // ---------------------------------------------------------------------
  // U-turn detection (warning only, no automatic activation) at a node.
  //
  // Detection only, not activation: a U-turn that was never manually
  // activated at least once via the native WME UI has no record in the
  // SDK data model - updateTurn() throws DataModelNotFoundError. There is
  // no public SDK method to create/activate such a U-turn from the
  // default state, so the script only warns; activation stays manual.
  //
  // Rules:
  // - Rule A: current segment (Y) is Unpaved, or is parking/private/4x4/NS
  //   type, with a neighbor at the same node that is NOT Unpaved.
  // - Rule B: current segment (Y) is parking/private/4x4 type, regardless
  //   of neighbors.
  // - Missing transition: direct paved -> 4x4/Offroad jump with no
  //   intermediate Unpaved segment (expected chain: Paved -> Unpaved ->
  //   4x4/Offroad).
  // - No public exit: at this node, no real neighbor is a public road
  //   type (Narrow Street, Street, Primary Street, Minor/Major Highway,
  //   Freeway, Ramp, Ferry, 4x4/Offroad) - Railroad/Runway-Taxiway are
  //   treated as non-drivable, excluded from the calculation entirely.
  // ---------------------------------------------------------------------

  const PUBLIC_ROAD_TYPES = new Set([
    RT.STREET,
    RT.PRIMARY_STREET,
    RT.MINOR_HIGHWAY,
    RT.MAJOR_HIGHWAY,
    RT.FREEWAY,
    RT.RAMP,
    RT.FERRY,
    RT.OFF_ROAD,
    RT.ALLEY, // NS - Narrow Street
  ]);

  const NON_DRIVABLE_ROAD_TYPES = new Set([RT.RAILROAD, RT.RUNWAY_TAXIWAY]);

  // Rule A - broad target category (generic unpaved handled separately via
  // flag, see evaluateNodeEndForUturn).
  const UTURN_TARGET_CATEGORY_A = new Set([RT.PARKING_LOT_ROAD, RT.PRIVATE_ROAD, RT.OFF_ROAD, RT.ALLEY]);
  // Rule B - narrower target category (no generic unpaved, no Narrow Street).
  const UTURN_TARGET_CATEGORY_B = new Set([RT.PARKING_LOT_ROAD, RT.PRIVATE_ROAD, RT.OFF_ROAD]);

  const ROAD_TYPE_LABEL = {
    [RT.STREET]: L('Stradă', 'Street'),
    [RT.PRIMARY_STREET]: 'Primary Street',
    [RT.FREEWAY]: 'Freeway',
    [RT.RAMP]: 'Ramp',
    [RT.MAJOR_HIGHWAY]: 'Major Highway',
    [RT.MINOR_HIGHWAY]: 'Minor Highway',
    [RT.OFF_ROAD]: '4x4/Offroad',
    [RT.FERRY]: L('Bac/Ferry', 'Ferry'),
    [RT.PRIVATE_ROAD]: L('drum privat', 'Private Road'),
    [RT.RAILROAD]: L('cale ferată', 'Railroad'),
    [RT.RUNWAY_TAXIWAY]: L('pistă rulare/decolare', 'Runway/Taxiway'),
    [RT.PARKING_LOT_ROAD]: L('drum parcare', 'Parking Lot Road'),
    [RT.ALLEY]: L('stradă îngustă (NS)', 'Narrow Street (NS)'),
  };
  function roadTypeLabel(segment) {
    return ROAD_TYPE_LABEL[segment.roadType] || L(`tip ${segment.roadType}`, `type ${segment.roadType}`);
  }

  // Real neighbor segments at a node (excludes the current segment and any
  // non-drivable segment) - shared base for the checks below.
  function getRealNeighborsAtNode(nodeId, excludeSegmentId) {
    let node;
    try {
      node = sdk.DataModel.Nodes.getById({ nodeId });
    } catch (e) {
      node = null;
    }
    if (!node || !node.connectedSegmentIds) return [];
    return node.connectedSegmentIds
      .filter((id) => id !== excludeSegmentId)
      .map((id) => {
        try {
          return sdk.DataModel.Segments.getById({ segmentId: id });
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean)
      .filter((s) => !NON_DRIVABLE_ROAD_TYPES.has(s.roadType));
  }

  // Does `segment` actually continue past the end opposite `nearNodeId`
  // (i.e. is that far end not a dead end)? A segment whose far end is a dead
  // end shouldn't get a U-turn warning - a U-turn there is the only option
  // anyway, so flagging it is pointless.
  function segmentContinuesBeyond(segment, nearNodeId) {
    const farNodeId = segment.fromNodeId === nearNodeId ? segment.toNodeId : segment.fromNodeId;
    if (farNodeId == null) return false;
    return getRealNeighborsAtNode(farNodeId, segment.id).length > 0;
  }

  // Evaluates one end (nodeId) of the given segment - detection only, no
  // mutation. Returns a list of findings (may be empty).
  function evaluateNodeEndForUturn(segment, nodeId) {
    const others = getRealNeighborsAtNode(nodeId, segment.id);
    if (!others.length) return [];

    const findings = [];
    const segUnpaved = !!segment.flagAttributes.unpaved;
    const hasCleanNeighbor = others.some((x) => !x.flagAttributes.unpaved);
    // Rules A/B and the "missing transit segment" rule only recommend a
    // U-turn if the segment actually continues beyond this end (see
    // segmentContinuesBeyond above). The "no public exit" rule below doesn't
    // use this condition - it's about this node, not the segment's far end.
    const continuesBeyond = segmentContinuesBeyond(segment, nodeId);

    if ((segUnpaved || UTURN_TARGET_CATEGORY_A.has(segment.roadType)) && hasCleanNeighbor && continuesBeyond) {
      findings.push(
        L(
          `Tranziție de pe drum curat spre ${roadTypeLabel(segment)}${segUnpaved ? ' (neasfaltat)' : ''} - recomandat U-turn activat aici.`,
          `Transition from a paved road to ${roadTypeLabel(segment)}${segUnpaved ? ' (unpaved)' : ''} - U-turn recommended here.`
        )
      );
    }

    if (UTURN_TARGET_CATEGORY_B.has(segment.roadType) && continuesBeyond) {
      findings.push(
        L(
          `Segment de tip ${roadTypeLabel(segment)} - recomandat U-turn activat aici.`,
          `${roadTypeLabel(segment)} segment - U-turn recommended here.`
        )
      );
    }

    if (segment.roadType === RT.OFF_ROAD && continuesBeyond) {
      const directFromPaved = others.some((x) => !x.flagAttributes.unpaved && x.roadType !== RT.OFF_ROAD);
      if (directFromPaved) {
        findings.push(
          L(
            'Lipsește un segment Neasfaltat de tranzit (Asfaltat → Neasfaltat → 4x4/Offroad) - se trece direct din asfaltat în 4x4/Offroad.',
            'Missing an Unpaved transition segment (Paved → Unpaved → 4x4/Offroad) - goes straight from paved to 4x4/Offroad.'
          )
        );
      }
    }

    if (!others.some((x) => PUBLIC_ROAD_TYPES.has(x.roadType))) {
      findings.push(
        L(
          'Acest capăt nu are nicio ieșire spre alt drum public - recomandat U-turn activat aici.',
          'This end has no exit to any other public road - U-turn recommended here.'
        )
      );
    }

    // Dedupe (rules A and B can produce similar messages for the same
    // 4x4/parking-lot/private segment).
    return Array.from(new Set(findings));
  }

  function evaluateSegmentForUturn(segment) {
    const fromNode = segment.fromNodeId != null ? evaluateNodeEndForUturn(segment, segment.fromNodeId) : [];
    const toNode = segment.toNodeId != null ? evaluateNodeEndForUturn(segment, segment.toNodeId) : [];
    return { fromNode, toNode };
  }

  // ---------------------------------------------------------------------
  // Visual alert (not console.log, not window.alert) - fixed colored panel
  // with a findings list, close button, and auto-hide timeout.
  // ---------------------------------------------------------------------

  const UTURN_ALERT_AUTOHIDE_MS = 18000;
  const UTURN_ALERT_ACCENT = '#e8590c';
  const UTURN_ALERT_ICON_SVG =
    '<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5L1.5 21.5h21L12 2.5z" fill="#e8590c"/><rect x="11" y="9" width="2" height="6.5" fill="#fff"/><rect x="11" y="17" width="2" height="2" fill="#fff"/></svg>';

  let uturnAlertEl = null;
  let uturnAlertTimeoutId = null;

  function removeUturnAlert() {
    if (uturnAlertTimeoutId) clearTimeout(uturnAlertTimeoutId);
    uturnAlertTimeoutId = null;
    if (uturnAlertEl) uturnAlertEl.remove();
    uturnAlertEl = null;
  }

  // `items` = array of already-formatted/prefixed message strings.
  function showUturnAlert(items) {
    if (!items.length) return;
    removeUturnAlert();

    const t = currentTheme();
    const panel = document.createElement('div');
    panel.className = 'wme-nal-uturn-alert';
    panel.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      max-width: 340px;
      z-index: ${OWN_UI_Z_INDEX + 50};
      background: ${t.barBg};
      border: 1px solid ${UTURN_ALERT_ACCENT};
      border-left: 4px solid ${UTURN_ALERT_ACCENT};
      border-radius: 6px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      padding: 10px 12px;
      font: 400 12px/1.4 Arial, sans-serif;
      color: ${t.badgeText};
    `;

    const header = document.createElement('div');
    header.style.cssText = 'display:flex; align-items:center; gap:6px; font-weight:700; margin-bottom:6px;';
    header.innerHTML = `${UTURN_ALERT_ICON_SVG}<span>${L('Verificare Întoarcere U', 'U-turn check')}</span>`;
    panel.appendChild(header);

    const list = document.createElement('ul');
    list.style.cssText = 'margin: 0 0 6px 0; padding-left: 18px;';
    items.forEach((msg) => {
      const li = document.createElement('li');
      li.style.marginBottom = '4px';
      li.textContent = msg;
      list.appendChild(li);
    });
    panel.appendChild(list);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = L('Închide', 'Close');
    closeBtn.style.cssText = `
      border: none;
      background: transparent;
      color: ${UTURN_ALERT_ACCENT};
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      font-size: 11px;
    `;
    closeBtn.addEventListener('click', removeUturnAlert);
    panel.appendChild(closeBtn);

    document.body.appendChild(panel);
    uturnAlertEl = panel;
    uturnAlertTimeoutId = setTimeout(removeUturnAlert, UTURN_ALERT_AUTOHIDE_MS);
  }

  // Evaluates a segment (both ends) and shows the alert if needed. Called
  // on (1) selecting a single segment, (2) after an Unpaved/road-type
  // change on that segment (native click or quick bar).
  function checkAndAlertUturn(segmentId) {
    if (!settings.uturnDetection) return;
    let segment;
    try {
      segment = sdk.DataModel.Segments.getById({ segmentId });
    } catch (e) {
      return;
    }
    if (!segment) return;

    const result = evaluateSegmentForUturn(segment);
    const items = [
      ...result.fromNode.map((msg) => L(`[Capăt A] ${msg}`, `[End A] ${msg}`)),
      ...result.toNode.map((msg) => L(`[Capăt B] ${msg}`, `[End B] ${msg}`)),
    ];
    if (items.length) showUturnAlert(items);
  }

  // ---------------------------------------------------------------------
  // Activate / deactivate for a node
  // ---------------------------------------------------------------------

  function deactivate() {
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = null;
    removeAllBadges();
    state.nodeId = null;
    state.segments = [];
    state.wasDragging = false;
  }

  function activateForNode(nodeId) {
    deactivate();

    let node;
    try {
      node = sdk.DataModel.Nodes.getById({ nodeId });
    } catch (e) {
      return;
    }
    // Like WME Junction Angle Info: any node with 2+ connected segments
    // (not just pass-through nodes with exactly 2 - real intersections too).
    if (!node || !node.connectedSegmentIds || node.connectedSegmentIds.length < 2) return;

    const segments = node.connectedSegmentIds
      .map((segId) => sdk.DataModel.Segments.getById({ segmentId: segId }))
      .filter(Boolean)
      .map((segment) => buildSegmentInfo(node, segment))
      .filter(Boolean);

    if (segments.length < 2) return;

    segments.forEach((segInfo) => {
      segInfo.lengthBadge = createLengthBadge();
      segInfo.angleBadge = createAngleBadge();
    });

    state.nodeId = nodeId;
    state.segments = segments;
    state.wasDragging = false;

    state.rafId = requestAnimationFrame(rafLoop);
  }

  // ---------------------------------------------------------------------
  // Selection detection (polling - no confirmed SDK event for "selection
  // changed")
  // ---------------------------------------------------------------------

  function checkSelection() {
    let sel = null;
    try {
      sel = sdk.Editing.getSelection();
    } catch (e) {
      sel = null;
    }

    const isSingleNode = sel && sel.objectType === 'node' && sel.ids && sel.ids.length === 1;
    const isSingleSegment = sel && sel.objectType === 'segment' && sel.ids && sel.ids.length === 1;
    const isMultiSegment = sel && sel.objectType === 'segment' && sel.ids && sel.ids.length > 1;

    if (isSingleNode) {
      if (segmentState.segmentId) deactivateSegment();
      if (multiSegmentState.badges.size) deactivateMultiSegment();
      if (!settings.nodeAngleLength) {
        if (state.nodeId) deactivate();
        return;
      }
      const nodeId = sel.ids[0];
      if (nodeId !== state.nodeId) activateForNode(nodeId);
      return;
    }

    if (isSingleSegment) {
      if (state.nodeId) deactivate();
      if (multiSegmentState.badges.size) deactivateMultiSegment();
      if (!settings.segmentLength) {
        if (segmentState.segmentId) deactivateSegment();
        return;
      }
      const segmentId = sel.ids[0];
      if (segmentId !== segmentState.segmentId) activateForSegment(segmentId);
      return;
    }

    if (isMultiSegment) {
      // Length badge per selected segment; no quick-action bar (that stays
      // single-segment only).
      if (state.nodeId) deactivate();
      if (segmentState.segmentId) deactivateSegment();
      if (!settings.segmentLength) {
        if (multiSegmentState.badges.size) deactivateMultiSegment();
        return;
      }
      if (!sameSegmentIdSet(sel.ids, multiSegmentState.segmentIds)) {
        activateForMultiSegments(sel.ids);
      }
      return;
    }

    // Empty selection, or another object type (e.g. a place) - deactivate
    // all tools.
    if (state.nodeId) deactivate();
    if (segmentState.segmentId) deactivateSegment();
    if (multiSegmentState.badges.size) deactivateMultiSegment();
  }

  // ---------------------------------------------------------------------
  // Bulk sender for UR comments over 2000 characters.
  //
  // The update request (UR/PUR/MP) conversation panel has a native comment
  // box limited to 2000 characters (`.new-comment-form` >
  // `wz-textarea.new-comment-text` with `maxlength="2000"`, char counter
  // `.length-text` in shadow DOM > `.send-button` = `wz-button` with a
  // native button in shadow DOM). For a longer message, a separate button
  // opens a large draft box; the text is split into chunks ≤ 2000 chars
  // (with an "(i/total)" marker), and the user sends each chunk manually
  // via a "Send chunk i/total" button - full control, can stop anytime.
  //
  // IMPORTANT: the native box (`wz-textarea`) is a WME web component with
  // internal sync logic - setting `.value` directly on the shadow-DOM
  // `<textarea>` (even with the native setter + a manually dispatched
  // "input" event) does not update the char counter or the component's
  // internal state correctly. The only reliable method is
  // `document.execCommand('insertText', false, text)` on the focused
  // textarea (with its content selected first, to replace it) - this
  // produces real native input events that the component recognizes.
  // ---------------------------------------------------------------------

  const UR_COMMENT_MAX_CHARS = 2000;
  // Reserved space for the "--- Message i/total ---" header and
  // "--- Next message i+1/total ---" / "--- End of messages ---" footer
  // added to each chunk - enough even for hundreds of chunks.
  const UR_CHUNK_MARKER_RESERVE = 100;
  const UR_FORM_POLL_MS = 500;
  const UR_DRAG_HANDLE_SELECTOR = '.wme-nal-ur-bulk-drag-handle';

  const urBulkState = {
    formEl: null, // currently tracked .new-comment-form
    triggerBtn: null, // our "Long message" button, injected next to Send
    panel: null, // floating panel (draft OR chunk list)
    chunks: null, // array of chunk strings (markers included), or null = draft mode
    currentIndex: 0, // index of the currently shown/sending chunk
    draftText: '', // original draft text - kept on "Cancel" so it isn't lost
    autoSend: false, // "auto-send" checkbox - off by default (insert-only until confirmed)
    liveEl: null, // live preview card (draft mode), or null
    updateLive: null, // refreshes live preview + counter (draft mode), or null
  };

  // Splits a long text into chunks of at most `maxLen` characters without
  // cutting words: prefers breaking at a newline, then a space, searching
  // backward from `maxLen`. Falls back to a hard cut at `maxLen` if no good
  // break point exists (a single "word" longer than `maxLen`). Each chunk is
  // trimmed.
  function urSplitIntoChunks(text, maxLen) {
    const trimmed = text.trim();
    if (!trimmed) return [];
    const chunks = [];
    let remaining = trimmed;

    while (remaining.length > maxLen) {
      let cut = -1;
      // Prefer a newline break within the [0, maxLen] window.
      const windowStr = remaining.slice(0, maxLen + 1);
      const lastNewline = windowStr.lastIndexOf('\n');
      const lastSpace = windowStr.lastIndexOf(' ');
      cut = lastNewline > 0 ? lastNewline : lastSpace;
      if (cut <= 0) {
        // No good break point (one huge word) - force the cut.
        cut = maxLen;
      }
      const piece = remaining.slice(0, cut).trim();
      if (piece) chunks.push(piece);
      remaining = remaining.slice(cut).trim();
    }
    if (remaining) chunks.push(remaining);
    return chunks;
  }

  // Builds the final chunks with header/footer markers, only when there are
  // 2+ chunks - a message that fits in one chunk needs no markers.
  function urBuildChunks(text) {
    // With "Înlocuiește rândurile noi" on, split the already transformed
    // text, so each chunk stays within the limit after the replacement
    // (separators are longer than the new lines they replace). Only the
    // markers' own new lines remain - replaced on Send, well within
    // UR_CHUNK_MARKER_RESERVE.
    if (settings.urReplaceNewlines) text = urNlTransform(text);
    const rawMax = UR_COMMENT_MAX_CHARS - UR_CHUNK_MARKER_RESERVE;
    const raw = urSplitIntoChunks(text, rawMax);
    const total = raw.length;
    if (total <= 1) return raw;
    return raw.map((piece, i) => {
      const fill = (t, n) => t.replace(/\{i\}/g, String(n)).replace(/\{n\}/g, String(total));
      const header = `${fill(CT('ur.msgHeader'), i + 1)}\n`;
      const footer = i + 1 < total ? `\n${fill(CT('ur.msgNext'), i + 2)}` : `\n${CT('ur.msgEnd')}`;
      const full = header + piece + footer;
      // Extra safety net: if markers + text still exceed the limit, hard-cut.
      return full.length > UR_COMMENT_MAX_CHARS ? full.slice(0, UR_COMMENT_MAX_CHARS) : full;
    });
  }

  function urFindCommentForm() {
    return document.querySelector('.new-comment-form');
  }

  // Extracts the concrete DOM refs needed from the native comment form,
  // including the shadow DOM of the `wz-textarea`/`wz-button` components.
  function urGetFormParts(formEl) {
    const wzta = formEl.querySelector('.new-comment-text');
    const sendBtnHost = formEl.querySelector('.send-button');
    if (!wzta || !wzta.shadowRoot || !sendBtnHost || !sendBtnHost.shadowRoot) return null;
    const textarea = wzta.shadowRoot.querySelector('textarea');
    const innerSendBtn = sendBtnHost.shadowRoot.querySelector('button');
    if (!textarea || !innerSendBtn) return null;
    return { textarea, innerSendBtn };
  }

  // Replaces all text in the native box - see the note above on why `.value`
  // is not set directly.
  function urSetNativeCommentText(textarea, text) {
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('insertText', false, text);
    if (!ok) {
      // Unlikely fallback (execCommand unsupported) - text still shows
      // correctly even if WME's internal state isn't fully in sync.
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(textarea, text);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // ---------------------------------------------------------------------
  // UR replies: replace new lines
  //
  // The Waze app shows UR/MP comments without line breaks (WME shows them,
  // the app drops them - any special "invisible" character is stripped
  // too), so a nicely laid out reply reaches the user as one block. With
  // the "Înlocuiește rândurile noi" checkbox (left of the native Send),
  // new lines are turned into visible separators on Send: 2+ new lines
  // (blank line, paragraph) -> UR_NL_PARAGRAPH, a single one -> UR_NL_LINE,
  // each wrapped in normal spaces so the app can still wrap lines there.
  //
  // How Send works natively (production code): the comment box is a React
  // `<form class="new-comment-form" onSubmit=...>` - `onSubmit` trims the
  // React-state text and calls `addComment`. The Send `wz-button` is
  // `type="submit"`. We listen for `submit` in the CAPTURE phase on the
  // form: React handles `submit` via delegation at its root, so stopping
  // the event there means the comment is not sent. If the text has new
  // lines, a preview (what the app user will see) opens instead; on
  // confirm, the transformed text is put in the native box
  // (`urSetNativeCommentText`, keeps React state in sync) and the native
  // Send button is clicked - the text no longer has new lines, so this
  // second submit passes straight through.
  // ---------------------------------------------------------------------

  // Customizable since v0.42 (CT): read at use time.
  const urNlParagraph = () => CT('ur.paragraph');
  const urNlLine = () => CT('ur.line');
  const UR_NL_LABEL_CLASS = 'wme-ro-tools-ur-nl';
  const UR_NL_MODAL_ID = 'wme-ro-tools-ur-nl-preview';

  function urNlTransform(text) {
    const norm = String(text || '')
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]+\n/g, '\n') // trailing spaces / whitespace-only lines
      .replace(/\n[ \t]+/g, '\n')
      .trim();
    return norm.replace(/\n{2,}/g, ` ${urNlParagraph()} `).replace(/\n/g, ` ${urNlLine()} `);
  }

  function urNlTooltip() {
    return L(
      'Aplicația Waze nu afișează rândurile noi - mesajul ajunge la utilizator pe un singur rând.\n' +
      `Bifat: la Trimite, un rând gol (2 sau mai multe rânduri noi) se înlocuiește cu „${urNlParagraph()}”, ` +
      `iar un singur rând nou cu „${urNlLine()}”. Înainte de trimitere vezi o previzualizare.`,
      'The Waze app does not show line breaks - the user sees the message on a single line.\n' +
      `Checked: on Send, a blank line (2 or more line breaks) is replaced with "${urNlParagraph()}", ` +
      `and a single line break with "${urNlLine()}". You get a preview before sending.`
    );
  }

  function urNlSyncCheckboxes() {
    document.querySelectorAll(`.${UR_NL_LABEL_CLASS} input`).forEach((cb) => {
      cb.checked = !!settings.urReplaceNewlines;
    });
    const el = settingsToggleEls.urReplaceNewlines;
    if (el) el.checked = !!settings.urReplaceNewlines;
    if (urBulkState.panel && !urBulkState.chunks && urBulkState.updateLive) urBulkState.updateLive();
  }

  function urNlCloseModal() {
    const m = document.getElementById(UR_NL_MODAL_ID);
    if (m) m.remove();
    document.removeEventListener('keydown', urNlOnModalKey, true);
  }

  function urNlOnModalKey(ev) {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      ev.stopPropagation();
      urNlCloseModal();
    }
  }

  function urNlCurrentUserName() {
    try {
      const info = sdk.State.getUserInfo();
      if (info && info.userName) return info.userName;
    } catch (e) {
      // ignore
    }
    return L('Tu', 'You');
  }

  // Preview modal: the text as the app user sees it (no line breaks,
  // normal wrapping, app-like light card), length vs. the 2000 limit.
  function urNlOpenPreview(formEl, transformed) {
    urNlCloseModal();
    const t = currentTheme();
    const tooLong = transformed.length > UR_COMMENT_MAX_CHARS;

    const overlay = document.createElement('div');
    overlay.id = UR_NL_MODAL_ID;
    overlay.style.cssText =
      'position:fixed; inset:0; z-index:100000; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; padding:16px; box-sizing:border-box;';
    overlay.addEventListener('mousedown', (ev) => {
      if (ev.target === overlay) urNlCloseModal();
    });

    const box = document.createElement('div');
    box.style.cssText = `background:${t.menuBg}; color:${t.menuText}; border:1px solid ${t.menuBorder}; border-radius:8px; box-shadow:0 8px 28px rgba(0,0,0,0.45); width:440px; max-width:100%; max-height:100%; display:flex; flex-direction:column; padding:16px; box-sizing:border-box; font-family:Rubik, Arial, sans-serif;`;

    const title = document.createElement('div');
    title.textContent = L('Previzualizare - așa vede utilizatorul mesajul în aplicația Waze', 'Preview - how the user sees the message in the Waze app');
    title.style.cssText = 'font-weight:600; font-size:14px; margin-bottom:4px;';
    const sub = document.createElement('div');
    sub.textContent = L('Rândurile noi au fost înlocuite cu separatoare. Verifică textul, apoi trimite.', 'Line breaks were replaced with separators. Check the text, then send.');
    sub.style.cssText = 'font-size:12px; opacity:0.75; margin-bottom:12px;';

    // App-like card (the app shows comments on a light card, no line breaks).
    const phone = document.createElement('div');
    phone.style.cssText =
      'background:#fff; color:#1b1b1b; border:1px solid #d5d7db; border-radius:12px; padding:12px 16px; width:340px; max-width:100%; align-self:center; overflow:auto; min-height:0; flex:1 1 auto; box-sizing:border-box;';
    const author = document.createElement('div');
    author.textContent = urNlCurrentUserName();
    author.style.cssText = 'font-weight:700; font-size:14px; margin-bottom:4px;';
    const body = document.createElement('div');
    body.textContent = transformed;
    body.style.cssText =
      'font:16px/1.35 Roboto, "Segoe UI", Arial, sans-serif; white-space:normal; overflow-wrap:anywhere;';
    phone.appendChild(author);
    phone.appendChild(body);

    const count = document.createElement('div');
    count.textContent = tooLong
      ? L(`${transformed.length} / ${UR_COMMENT_MAX_CHARS} caractere - prea lung pentru un singur comentariu. Folosește "Mesaj lung" sau scurtează textul.`, `${transformed.length} / ${UR_COMMENT_MAX_CHARS} characters - too long for a single comment. Use "Long message" or shorten the text.`)
      : L(`${transformed.length} / ${UR_COMMENT_MAX_CHARS} caractere`, `${transformed.length} / ${UR_COMMENT_MAX_CHARS} characters`);
    count.style.cssText = `font-size:12px; margin-top:8px; text-align:right; ${tooLong ? 'color:#e5484d; font-weight:600;' : 'opacity:0.75;'}`;

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex; justify-content:flex-end; gap:8px; margin-top:12px;';
    const back = document.createElement('wz-button');
    back.setAttribute('color', 'secondary');
    back.setAttribute('size', 'sm');
    back.textContent = L('Înapoi la editare', 'Back to editing');
    back.addEventListener('click', urNlCloseModal);
    const send = document.createElement('wz-button');
    send.setAttribute('size', 'sm');
    send.textContent = L('Trimite', 'Send');
    if (tooLong) send.setAttribute('disabled', '');
    send.addEventListener('click', () => {
      if (tooLong) return;
      urNlCloseModal();
      urNlSendTransformed(formEl, transformed);
    });
    actions.appendChild(back);
    actions.appendChild(send);

    box.appendChild(title);
    box.appendChild(sub);
    box.appendChild(phone);
    box.appendChild(count);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', urNlOnModalKey, true);
  }

  function urNlSendTransformed(formEl, transformed) {
    if (!formEl || !document.body.contains(formEl)) {
      phShowToast(L('Fereastra UR s-a reîncărcat - mesajul nu a fost trimis. Încearcă din nou.', 'The UR window reloaded - the message was not sent. Try again.'), true);
      return;
    }
    const parts = urGetFormParts(formEl);
    if (!parts) return;
    urSetNativeCommentText(parts.textarea, transformed);
    // Let WME's React state catch up with the new text before Send.
    setTimeout(() => {
      if (parts.textarea.value !== transformed) {
        phShowToast(L('Textul nu a putut fi înlocuit în casetă - mesajul nu a fost trimis.', 'The text could not be replaced in the box - the message was not sent.'), true);
        return;
      }
      parts.innerSendBtn.click();
    }, 150);
  }

  function urNlOnSubmit(ev) {
    if (!settings.urReplaceNewlines) return;
    const formEl = ev.currentTarget;
    const parts = urGetFormParts(formEl);
    if (!parts) return;
    const text = parts.textarea.value;
    if (!/\n/.test(text.trim())) return; // nothing to replace - send as is
    ev.preventDefault();
    ev.stopImmediatePropagation();
    urNlOpenPreview(formEl, urNlTransform(text));
  }

  // Checkbox left of the native Send button, once per (re-rendered) form.
  function urNlInject(formEl) {
    if (!formEl || formEl.querySelector(`.${UR_NL_LABEL_CLASS}`)) return;
    const sendBtnHost = formEl.querySelector('.send-button');
    if (!sendBtnHost) return;
    const label = document.createElement('label');
    label.className = UR_NL_LABEL_CLASS;
    label.title = urNlTooltip();
    label.style.cssText =
      'display:inline-flex; align-items:center; gap:4px; margin-right:8px; font-size:12px; cursor:pointer; user-select:none; white-space:nowrap;';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!settings.urReplaceNewlines;
    cb.style.cssText = 'margin:0; cursor:pointer;';
    cb.addEventListener('change', () => {
      settings.urReplaceNewlines = cb.checked;
      saveSettings();
      urNlSyncCheckboxes();
    });
    const text = document.createElement('span');
    text.textContent = L('Înlocuiește rândurile noi', 'Replace line breaks');
    label.appendChild(cb);
    label.appendChild(text);
    sendBtnHost.insertAdjacentElement('beforebegin', label);
    formEl.addEventListener('submit', urNlOnSubmit, true);
  }

  function urBulkClosePanel() {
    if (urBulkState.panel) {
      urBulkState.panel.remove();
      urBulkState.panel = null;
    }
    urBulkState.chunks = null;
    urBulkState.currentIndex = 0;
    urBulkState.draftText = '';
    urBulkState.liveEl = null;
    urBulkState.updateLive = null;
  }

  // Inserts the current chunk into the native box, and, only if "auto-send"
  // is checked, also clicks the native Send button (then advances to the
  // next chunk). If unchecked (default), only inserts the text - the user
  // sends manually or navigates with Next/Previous to check other chunks.
  function urBulkInsertOrSendCurrentChunk() {
    const formEl = urBulkState.formEl;
    if (!formEl || !document.body.contains(formEl)) {
      urBulkClosePanel();
      return;
    }
    const parts = urGetFormParts(formEl);
    if (!parts || !urBulkState.chunks) return;
    const idx = urBulkState.currentIndex;
    const chunk = urBulkState.chunks[idx];
    if (chunk == null) return;

    // Auto-send skips the preview, so the chunk goes in already transformed;
    // insert-only keeps the new lines and the preview shows on manual Send.
    const autoTransform = urBulkState.autoSend && settings.urReplaceNewlines;
    urSetNativeCommentText(parts.textarea, autoTransform ? urNlTransform(chunk) : chunk);
    if (!urBulkState.autoSend) return; // insert only - user handles the rest manually

    setTimeout(() => {
      parts.innerSendBtn.click();
      urBulkState.currentIndex += 1;
      if (urBulkState.chunks && urBulkState.currentIndex >= urBulkState.chunks.length) urDraftSave('long', '');
      urBulkRenderPanel();
    }, 150);
  }

  // Makes an element (usually the panel header) a drag handle - moves the
  // panel via `fixed` positioning (left/top), no external libraries.
  function urBulkMakeDraggable(panel, handleEl) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;

    function onMove(ev) {
      if (!dragging) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const rect = panel.getBoundingClientRect();
      let left = startLeft + dx;
      let top = startTop + dy;
      left = Math.min(vw - rect.width - 4, Math.max(4, left));
      top = Math.min(vh - rect.height - 4, Math.max(4, top));
      panel.style.left = `${Math.round(left)}px`;
      panel.style.top = `${Math.round(top)}px`;
    }
    function onUp() {
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    handleEl.addEventListener('mousedown', (ev) => {
      // Don't start dragging if the header close button was clicked.
      if (ev.target.closest('.wme-nal-ur-bulk-close')) return;
      dragging = true;
      startX = ev.clientX;
      startY = ev.clientY;
      const rect = panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      ev.preventDefault();
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  }

  // (Re)renders the panel body based on current state: "draft" mode (large
  // textarea + "Split into chunks" button) or "send" mode (current chunk
  // preview + navigation + insert/send button). The header (drag handle) is
  // never recreated on redraw, so the drag listener stays attached.
  const UR_BULK_WIDTH_PX = 380;
  const UR_BULK_WIDTH_WITH_PREVIEW_PX = 760;
  const UR_BULK_HEIGHT_PX = 520;

  // Shows/hides the live preview; with `resize`, also widens/narrows the
  // window so the draft box keeps its width (kept on screen).
  function urBulkApplyPreviewVisibility(resize) {
    const live = urBulkState.liveEl;
    if (live) live.style.display = settings.urLongLivePreview ? '' : 'none';
    const panel = urBulkState.panel;
    if (!resize || !panel) return;
    const rect = panel.getBoundingClientRect();
    let width = rect.width;
    if (settings.urLongLivePreview && width < UR_BULK_WIDTH_WITH_PREVIEW_PX - 120) width = UR_BULK_WIDTH_WITH_PREVIEW_PX;
    if (!settings.urLongLivePreview && width > UR_BULK_WIDTH_PX + 120) width = UR_BULK_WIDTH_PX;
    width = Math.min(width, window.innerWidth - 16);
    panel.style.width = `${Math.round(width)}px`;
    const left = Math.min(rect.left, window.innerWidth - width - 8);
    panel.style.left = `${Math.round(Math.max(8, left))}px`;
  }

  // The UR/MP window the comment form belongs to (for placing "Mesaj lung"
  // next to it).
  function urFindIssueWindow(formEl) {
    if (!formEl) return null;
    return formEl.closest('[id^="ISSUE_WINDOW"]') || formEl.closest('wz-card.problem-edit') || null;
  }

  // Native comment box: 12 visible lines instead of WME's ~6 (it stays
  // vertically resizable - native `resize: vertical`). Applied once per
  // textarea element, so a manual resize by the user is kept.
  const UR_NATIVE_BOX_LINES = 12;
  function urEnlargeNativeBox(formEl) {
    const parts = formEl && urGetFormParts(formEl);
    if (!parts || parts.textarea.dataset.roToolsEnlarged) return;
    const ta = parts.textarea;
    const cs = getComputedStyle(ta);
    const lineHeight = parseFloat(cs.lineHeight) || 16;
    let extra = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    if (cs.boxSizing === 'border-box') extra += (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
    ta.style.height = `${Math.round(UR_NATIVE_BOX_LINES * lineHeight + extra)}px`;
    ta.dataset.roToolsEnlarged = '1';
  }

  function urBulkRenderPanel() {
    const panel = urBulkState.panel;
    if (!panel) return;
    const t = currentTheme();
    const body = panel.querySelector('.wme-nal-ur-bulk-body');
    if (!body) return;
    body.innerHTML = '';
    body.style.cssText = 'flex: 1 1 auto; display:flex; flex-direction:column; min-height:0; overflow:auto;';

    if (!urBulkState.chunks) {
      // --- Draft mode: options + large textarea (+ live preview on the
      // right, as the Waze app will show it) + split button ---
      const info = document.createElement('div');
      info.style.cssText = `font-size:11px; color:${t.menuText}; opacity:0.75; margin-bottom:6px; flex:0 0 auto;`;
      info.textContent = L('Lipește aici tot mesajul (oricât de lung) - îl împărțim automat în bucăți de maxim 2000 caractere.', 'Paste the whole message here (any length) - it is split automatically into chunks of max 2000 characters.');
      body.appendChild(info);

      const opts = document.createElement('div');
      opts.style.cssText = `display:flex; flex-wrap:wrap; gap:4px 14px; font-size:12px; color:${t.menuText}; margin-bottom:6px; flex:0 0 auto;`;
      const mkCheck = (labelText, checked, title, onChange, className) => {
        const label = document.createElement('label');
        if (className) label.className = className;
        label.title = title || '';
        label.style.cssText = 'display:inline-flex; align-items:center; gap:4px; cursor:pointer; user-select:none;';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = checked;
        cb.style.cssText = 'margin:0; cursor:pointer;';
        cb.addEventListener('change', () => onChange(cb.checked));
        const span = document.createElement('span');
        span.textContent = labelText;
        label.appendChild(cb);
        label.appendChild(span);
        return label;
      };
      // Same class as the checkbox next to native Send -> kept in sync by
      // `urNlSyncCheckboxes`.
      opts.appendChild(
        mkCheck(L('Înlocuiește rândurile noi', 'Replace line breaks'), !!settings.urReplaceNewlines, urNlTooltip(), (v) => {
          settings.urReplaceNewlines = v;
          saveSettings();
          urNlSyncCheckboxes();
        }, UR_NL_LABEL_CLASS)
      );
      opts.appendChild(
        mkCheck(L('Previzualizare live', 'Live preview'), !!settings.urLongLivePreview, L('Arată în dreapta, în timp real, textul așa cum îl vede utilizatorul în aplicația Waze', 'Shows on the right, in real time, the text as the user sees it in the Waze app'), (v) => {
          settings.urLongLivePreview = v;
          saveSettings();
          urBulkApplyPreviewVisibility(true);
        })
      );
      body.appendChild(opts);

      const row = document.createElement('div');
      row.style.cssText = 'display:flex; gap:8px; flex:1 1 auto; min-height:80px;';
      const draftArea = document.createElement('textarea');
      draftArea.style.cssText = `
        flex: 1 1 0;
        min-width: 0;
        resize: none;
        box-sizing: border-box;
        font: 12px/1.4 Arial, sans-serif;
        padding: 6px;
        border-radius: 4px;
        border: 1px solid ${t.menuBorder};
        background: ${t.menuBg};
        color: ${t.menuText};
      `;
      draftArea.placeholder = L('Lipește textul lung aici...', 'Paste the long text here...');
      if (!urBulkState.draftText) urBulkState.draftText = urDraftGet('long');
      draftArea.value = urBulkState.draftText || '';
      // App-like card (light, no line breaks) - same look as the Send preview.
      const live = document.createElement('div');
      live.style.cssText =
        'flex: 1 1 0; min-width: 0; overflow: auto; background:#fff; color:#1b1b1b; border:1px solid #d5d7db; border-radius:10px; padding:10px 12px; box-sizing:border-box; font:14px/1.35 Roboto, "Segoe UI", Arial, sans-serif; white-space:normal; overflow-wrap:anywhere;';
      row.appendChild(draftArea);
      row.appendChild(live);
      body.appendChild(row);
      urBulkState.liveEl = live;

      const counter = document.createElement('div');
      counter.style.cssText = `font-size:11px; color:${t.menuText}; opacity:0.75; margin: 4px 0 8px; flex:0 0 auto;`;
      const updateLive = () => {
        // Without replacement, the app joins the lines (shown as spaces).
        const shown = settings.urReplaceNewlines
          ? urNlTransform(draftArea.value)
          : draftArea.value.replace(/\s*\n\s*/g, ' ').trim();
        live.textContent = '';
        const author = document.createElement('div');
        author.textContent = urNlCurrentUserName();
        author.style.cssText = 'font-weight:700; font-size:13px; margin-bottom:4px;';
        const text = document.createElement('div');
        text.textContent = shown || '…';
        if (!shown) text.style.opacity = '0.4';
        live.appendChild(author);
        live.appendChild(text);
      };
      const updateCounter = () => {
        urBulkState.draftText = draftArea.value;
        urDraftSave('long', draftArea.value);
        const len = draftArea.value.length;
        const estimatedChunks = urBuildChunks(draftArea.value).length;
        const after =
          settings.urReplaceNewlines && /\n/.test(draftArea.value.trim())
            ? L(` (${urNlTransform(draftArea.value).length} după înlocuire)`, ` (${urNlTransform(draftArea.value).length} after replacing)`)
            : '';
        counter.textContent =
          len === 0
            ? L('0 caractere', '0 characters')
            : L(`${len} caractere${after} - va fi împărțit în ${estimatedChunks} ${estimatedChunks === 1 ? 'bucată' : 'bucăți'}.`, `${len} characters${after} - will be split into ${estimatedChunks} ${estimatedChunks === 1 ? 'chunk' : 'chunks'}.`);
      };
      urBulkState.updateLive = () => {
        updateLive();
        updateCounter();
      };
      draftArea.addEventListener('input', urBulkState.updateLive);
      urBulkState.updateLive();
      urBulkApplyPreviewVisibility(false);
      body.appendChild(counter);

      const splitBtn = document.createElement('button');
      splitBtn.textContent = L('Împarte în bucăți', 'Split into chunks');
      splitBtn.style.cssText = `
        padding: 6px 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        background: ${t.activeBg};
        color: ${t.menuText};
        font-weight: 700;
        flex: 0 0 auto;
        align-self: flex-start;
      `;
      splitBtn.addEventListener('click', () => {
        urBulkState.draftText = draftArea.value;
        const chunks = urBuildChunks(draftArea.value);
        if (!chunks.length) return;
        urBulkState.chunks = chunks;
        urBulkState.currentIndex = 0;
        urBulkRenderPanel();
      });
      body.appendChild(splitBtn);
      draftArea.focus();
      return;
    }

    urBulkState.liveEl = null;
    urBulkState.updateLive = null;
    const total = urBulkState.chunks.length;
    const idx = urBulkState.currentIndex;

    if (idx >= total) {
      // --- All chunks sent (only reachable with "auto-send" checked, once
      // the last chunk was sent and the index advanced past the end) ---
      const done = document.createElement('div');
      done.style.cssText = `font-size:13px; color:${t.menuText}; margin-bottom:8px; flex:0 0 auto;`;
      done.textContent = L(`Gata - toate cele ${total} ${total === 1 ? 'bucată a fost trimisă' : 'bucăți au fost trimise'}.`, `Done - ${total === 1 ? 'the chunk was sent' : `all ${total} chunks were sent`}.`);
      body.appendChild(done);

      const closeDoneBtn = document.createElement('button');
      closeDoneBtn.textContent = L('Închide', 'Close');
      closeDoneBtn.style.cssText = `
        padding: 6px 12px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        background: ${t.activeBg};
        color: ${t.menuText};
        font-weight: 700;
        flex: 0 0 auto;
        align-self: flex-start;
      `;
      closeDoneBtn.addEventListener('click', urBulkClosePanel);
      body.appendChild(closeDoneBtn);
      return;
    }

    // --- Send mode: current chunk preview + navigation ---
    const progress = document.createElement('div');
    progress.style.cssText = `font-size:12px; font-weight:700; color:${t.menuText}; margin-bottom:6px; flex:0 0 auto;`;
    progress.textContent = L(`Bucata ${idx + 1} din ${total}`, `Chunk ${idx + 1} of ${total}`);
    body.appendChild(progress);

    const preview = document.createElement('textarea');
    preview.readOnly = true;
    preview.value = urBulkState.chunks[idx];
    preview.style.cssText = `
      width: 100%;
      flex: 1 1 auto;
      min-height: 80px;
      resize: none;
      box-sizing: border-box;
      font: 12px/1.4 Arial, sans-serif;
      padding: 6px;
      border-radius: 4px;
      border: 1px solid ${t.menuBorder};
      background: ${t.menuBg};
      color: ${t.menuText};
      opacity: 0.9;
    `;
    body.appendChild(preview);

    const charCount = document.createElement('div');
    charCount.style.cssText = `font-size:11px; color:${t.menuText}; opacity:0.75; margin: 4px 0 8px; flex:0 0 auto;`;
    charCount.textContent = L(`${preview.value.length} / ${UR_COMMENT_MAX_CHARS} caractere`, `${preview.value.length} / ${UR_COMMENT_MAX_CHARS} characters`);
    body.appendChild(charCount);

    const autoSendRow = document.createElement('label');
    autoSendRow.style.cssText = `display:flex; align-items:center; gap:6px; font-size:11px; color:${t.menuText}; margin-bottom:8px; cursor:pointer; flex:0 0 auto;`;
    const autoSendCheckbox = document.createElement('input');
    autoSendCheckbox.type = 'checkbox';
    autoSendCheckbox.checked = urBulkState.autoSend;
    autoSendCheckbox.addEventListener('change', () => {
      urBulkState.autoSend = autoSendCheckbox.checked;
      urBulkRenderPanel();
    });
    const autoSendLabel = document.createElement('span');
    autoSendLabel.textContent = L('Trimite automat (apasă și butonul nativ Trimite după inserare)', 'Auto-send (also clicks the native Send button after inserting)');
    autoSendRow.appendChild(autoSendCheckbox);
    autoSendRow.appendChild(autoSendLabel);
    body.appendChild(autoSendRow);

    const navRow = document.createElement('div');
    navRow.style.cssText = 'display:flex; gap:8px; margin-bottom:8px; flex:0 0 auto;';
    const prevBtn = document.createElement('button');
    prevBtn.textContent = L('← Anterioara', '← Previous');
    prevBtn.disabled = idx <= 0;
    prevBtn.style.cssText = `
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid ${t.menuBorder};
      cursor: ${prevBtn.disabled ? 'default' : 'pointer'};
      opacity: ${prevBtn.disabled ? 0.4 : 1};
      background: transparent;
      color: ${t.menuText};
    `;
    prevBtn.addEventListener('click', () => {
      if (urBulkState.currentIndex > 0) {
        urBulkState.currentIndex -= 1;
        urBulkRenderPanel();
      }
    });
    const nextBtn = document.createElement('button');
    nextBtn.textContent = L('Următoarea →', 'Next →');
    nextBtn.disabled = idx >= total - 1;
    nextBtn.style.cssText = `
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid ${t.menuBorder};
      cursor: ${nextBtn.disabled ? 'default' : 'pointer'};
      opacity: ${nextBtn.disabled ? 0.4 : 1};
      background: transparent;
      color: ${t.menuText};
    `;
    nextBtn.addEventListener('click', () => {
      if (urBulkState.currentIndex < total - 1) {
        urBulkState.currentIndex += 1;
        urBulkRenderPanel();
      }
    });
    navRow.appendChild(prevBtn);
    navRow.appendChild(nextBtn);
    body.appendChild(navRow);

    const actionsRow = document.createElement('div');
    actionsRow.style.cssText = 'display:flex; gap:8px; flex:0 0 auto;';

    const sendBtn = document.createElement('button');
    sendBtn.textContent = urBulkState.autoSend ? L(`Trimite bucata ${idx + 1}/${total}`, `Send chunk ${idx + 1}/${total}`) : L(`Inserează bucata ${idx + 1}/${total}`, `Insert chunk ${idx + 1}/${total}`);
    sendBtn.style.cssText = `
      padding: 6px 12px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      background: ${t.activeBg};
      color: ${t.menuText};
      font-weight: 700;
    `;
    sendBtn.addEventListener('click', urBulkInsertOrSendCurrentChunk);
    actionsRow.appendChild(sendBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = L('Renunță (înapoi la editare)', 'Cancel (back to editing)');
    cancelBtn.style.cssText = `
      padding: 6px 12px;
      border-radius: 4px;
      border: 1px solid ${t.menuBorder};
      cursor: pointer;
      background: transparent;
      color: ${t.menuText};
    `;
    cancelBtn.addEventListener('click', () => {
      // Keep draftText intact so going back to edit mode doesn't lose it.
      urBulkState.chunks = null;
      urBulkState.currentIndex = 0;
      urBulkRenderPanel();
    });
    actionsRow.appendChild(cancelBtn);

    body.appendChild(actionsRow);
  }

  function urBulkOpenPanel(anchorEl) {
    if (urBulkState.panel) {
      urBulkClosePanel();
      return;
    }
    // Take over what was already typed in the native box: appended to the
    // long draft (unless already there), then the native box is emptied so
    // the same text isn't sent twice.
    const formEl = urBulkState.formEl;
    const parts = formEl && document.body.contains(formEl) ? urGetFormParts(formEl) : null;
    const nativeText = parts ? parts.textarea.value.trim() : '';
    if (nativeText) {
      const current = (urBulkState.draftText || urDraftGet('long') || '').trim();
      const merged = !current ? nativeText : current.includes(nativeText) ? current : `${current}\n\n${nativeText}`;
      urBulkState.draftText = merged;
      urDraftSave('long', merged);
      parts.textarea.focus();
      parts.textarea.select();
      document.execCommand('delete');
      parts.textarea.blur();
    }

    const t = currentTheme();
    const panel = document.createElement('div');
    panel.className = 'wme-nal-ur-bulk-panel';
    // Resizable panel (native bottom-right handle via CSS `resize`) +
    // draggable by its header (`urBulkMakeDraggable`).
    panel.style.cssText = `
      position: fixed;
      z-index: ${OWN_UI_MENU_Z_INDEX};
      border-radius: 6px;
      border: 1px solid ${t.menuBorder};
      background: ${t.menuBg};
      box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      padding: 10px;
      font-family: Arial, sans-serif;
      width: ${settings.urLongLivePreview ? UR_BULK_WIDTH_WITH_PREVIEW_PX : UR_BULK_WIDTH_PX}px;
      max-width: calc(100vw - 16px);
      height: ${UR_BULK_HEIGHT_PX}px;
      max-height: calc(100vh - 16px);
      min-width: 260px;
      min-height: 260px;
      resize: both;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    `;

    const header = document.createElement('div');
    header.className = 'wme-nal-ur-bulk-drag-handle';
    header.style.cssText = `display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; font-weight:700; color:${t.menuText}; cursor:move; flex:0 0 auto;`;
    const title = document.createElement('div');
    title.textContent = L('Mesaj lung pentru UR', 'Long UR message');
    const closeBtn = document.createElement('div');
    closeBtn.className = 'wme-nal-ur-bulk-close';
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = 'cursor:pointer; padding: 0 4px;';
    closeBtn.addEventListener('click', urBulkClosePanel);
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);

    const body = document.createElement('div');
    body.className = 'wme-nal-ur-bulk-body';
    panel.appendChild(body);

    document.body.appendChild(panel);
    urBulkState.panel = panel;
    urBulkMakeDraggable(panel, header);
    urBulkRenderPanel();

    const panelRect = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left;
    let top;
    const issueWindow = urFindIssueWindow(formEl);
    const winRect = issueWindow ? issueWindow.getBoundingClientRect() : null;
    if (winRect && winRect.width) {
      // To the right of the UR window; to its left if there's no room.
      left = winRect.right + 8;
      if (left + panelRect.width > vw - 8) left = winRect.left - panelRect.width - 8;
      top = winRect.top;
    } else {
      const anchorRect = anchorEl.getBoundingClientRect();
      left = anchorRect.right - panelRect.width;
      top = anchorRect.top - panelRect.height - 8;
      if (top < 8) top = anchorRect.bottom + 8;
    }
    left = Math.min(vw - panelRect.width - 8, Math.max(8, left));
    top = Math.min(vh - panelRect.height - 8, Math.max(8, top));
    panel.style.left = `${Math.round(left)}px`;
    panel.style.top = `${Math.round(top)}px`;
  }

  // Injects the "Long message" button next to the native Send button, once
  // per form (WME re-renders the form when the selected UR changes, so we
  // poll to check whether our button still exists).
  function urInjectTriggerButton(formEl) {
    if (formEl.querySelector('.wme-nal-ur-bulk-trigger')) return;
    const sendBtnHost = formEl.querySelector('.send-button');
    if (!sendBtnHost) return;

    const btn = document.createElement('button');
    btn.className = 'wme-nal-ur-bulk-trigger';
    btn.type = 'button';
    btn.textContent = L('Mesaj lung', 'Long message');
    btn.title = L('Trimite un mesaj lung (peste 2000 caractere) ca mai multe comentarii', 'Send a long message (over 2000 characters) as several comments');
    btn.style.cssText = `
      margin-left: 6px;
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid rgba(128,128,128,0.4);
      cursor: pointer;
      background: transparent;
      font-size: 12px;
    `;
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      urBulkOpenPanel(btn);
    });
    sendBtnHost.insertAdjacentElement('afterend', btn);
    urBulkState.triggerBtn = btn;
  }

  // Polls for an open UR/PUR/MP conversation panel - injects the button if
  // present; resets state if the tracked form disappeared (UR closed or
  // changed), so no orphaned panel is left floating over the map.
  function urBulkPoll() {
    // "Înlocuiește rândurile noi" checkbox - independent of "Mesaj lung".
    const nlForm = urFindCommentForm();
    if (nlForm) {
      urNlInject(nlForm);
      urEnlargeNativeBox(nlForm);
    }
    if (!settings.urBulkSender) {
      // Draft saver works without the "Mesaj lung" button too.
      const f = urFindCommentForm();
      if (f) urDraftPoll(f);
      else urDraftPoll(null);
      return;
    }
    const formEl = urFindCommentForm();
    if (!formEl) urDraftPoll(null);
    if (!formEl) {
      if (urBulkState.formEl) {
        urBulkState.formEl = null;
        urBulkClosePanel();
      }
      return;
    }
    if (formEl !== urBulkState.formEl) {
      urBulkState.formEl = formEl;
      urBulkClosePanel();
    }
    urInjectTriggerButton(formEl);
    urDraftPoll(formEl);
  }

  // ---------------------------------------------------------------------
  // UR reply draft saver
  //
  // WME re-renders the UR/MP conversation window after a save or other map
  // activity, which wipes the native comment box and our "Mesaj lung"
  // draft. Drafts are kept per issue in localStorage (also survives a page
  // reload): key = `<type>:<id>` of `W.problemsController.getCurrentProblem()`
  // (live-checked: type 'mapUpdateRequest', id = UR id). Native box: saved
  // on its `input` events, restored once per newly rendered form if empty
  // (via `urSetNativeCommentText`, then focus is given back). Cleared on
  // native Send, when the issue is no longer open (`attributes.open ===
  // false` - covers Rezolvat/Neidentificat), or after 7 days.
  // ---------------------------------------------------------------------

  const UR_DRAFT_STORAGE_KEY = 'wme-ro-tools-ur-drafts';
  const UR_DRAFT_MAX_AGE_MS = 7 * 24 * 3600 * 1000;

  const urDraftState = {
    formEl: null, // form the listeners/restore were applied to
    textarea: null, // its shadow-DOM textarea (re-checked each poll)
    key: null, // `<type>:<id>` of the issue that form belongs to
  };

  function urDraftLoadAll() {
    try {
      const all = JSON.parse(window.localStorage.getItem(UR_DRAFT_STORAGE_KEY) || '{}');
      const now = Date.now();
      let changed = false;
      for (const k of Object.keys(all)) {
        if (!all[k] || now - (all[k].ts || 0) > UR_DRAFT_MAX_AGE_MS) {
          delete all[k];
          changed = true;
        }
      }
      if (changed) urDraftStoreAll(all);
      return all;
    } catch (e) {
      return {};
    }
  }

  function urDraftStoreAll(all) {
    try {
      window.localStorage.setItem(UR_DRAFT_STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      // ignore - storage full/blocked
    }
  }

  function urDraftCurrentKey() {
    try {
      const p = window.W && window.W.problemsController && window.W.problemsController.getCurrentProblem();
      if (!p) return null;
      const id = p.attributes ? p.attributes.id : null;
      if (id == null) return null;
      return `${p.type || 'issue'}:${id}`;
    } catch (e) {
      return null;
    }
  }

  function urDraftGet(field, key = urDraftState.key || urDraftCurrentKey()) {
    if (!settings.urDraftSaver || !key) return '';
    const entry = urDraftLoadAll()[key];
    return (entry && entry[field]) || '';
  }

  // field: 'native' | 'long'. Empty text removes that field (and the entry
  // when both are empty).
  function urDraftSave(field, text, key = urDraftState.key || urDraftCurrentKey()) {
    if (!settings.urDraftSaver || !key) return;
    const all = urDraftLoadAll();
    const entry = all[key] || {};
    if (text && text.trim()) entry[field] = text;
    else delete entry[field];
    if (entry.native || entry.long) {
      entry.ts = Date.now();
      all[key] = entry;
    } else {
      delete all[key];
    }
    urDraftStoreAll(all);
    urDraftUpdateIndicator();
  }

  function urDraftClear(key) {
    if (!key) return;
    const all = urDraftLoadAll();
    if (all[key]) {
      delete all[key];
      urDraftStoreAll(all);
    }
    urDraftUpdateIndicator();
  }

  // "Mesaj lung •" when a long draft is saved for the current issue.
  function urDraftUpdateIndicator() {
    const btn = urBulkState.triggerBtn;
    if (!btn || !document.body.contains(btn)) return;
    const has = !!urDraftGet('long');
    btn.textContent = has ? L('Mesaj lung •', 'Long message •') : L('Mesaj lung', 'Long message');
    btn.title = has
      ? L('Ai o ciornă salvată pentru acest UR - deschide pentru a continua', 'You have a saved draft for this UR - open to continue')
      : L('Trimite un mesaj lung (peste 2000 caractere) ca mai multe comentarii', 'Send a long message (over 2000 characters) as several comments');
  }

  function urDraftOnInput() {
    if (urDraftState.textarea) urDraftSave('native', urDraftState.textarea.value);
  }

  // Capture-phase click on the form: native Send (host `.send-button`).
  function urDraftOnFormClick(ev) {
    const path = ev.composedPath ? ev.composedPath() : [];
    const isSend = path.some((n) => n && n.classList && n.classList.contains('send-button'));
    if (!isSend) return;
    const key = urDraftState.key;
    const ta = urDraftState.textarea;
    if (!key || !ta || !ta.value.trim()) return;
    // Long draft is done once its last chunk is the one being sent.
    const chunks = urBulkState.chunks;
    const lastChunk = chunks && urBulkState.currentIndex >= chunks.length - 1;
    // Clear only once the box actually empties (send accepted).
    setTimeout(() => {
      if (urDraftState.textarea && urDraftState.textarea.value.trim()) return;
      urDraftSave('native', '', key);
      if (lastChunk) urDraftSave('long', '', key);
    }, 1500);
  }

  function urDraftRestoreNative(textarea, text) {
    const prevActive = document.activeElement;
    urSetNativeCommentText(textarea, text);
    textarea.blur();
    if (prevActive && prevActive !== document.body && typeof prevActive.focus === 'function') {
      try {
        prevActive.focus();
      } catch (e) {
        // ignore
      }
    }
    phShowToast(L('Ciorna mesajului pentru acest UR a fost restaurată.', 'The message draft for this UR was restored.'), false, textarea.getBoundingClientRect());
  }

  function urDraftPoll(formEl) {
    if (!settings.urDraftSaver) return;
    const key = urDraftCurrentKey();

    // Issue closed (Rezolvat/Neidentificat) -> drop its draft.
    try {
      const p = window.W.problemsController.getCurrentProblem();
      if (key && p && p.attributes && p.attributes.open === false) urDraftClear(key);
    } catch (e) {
      // ignore
    }

    if (!formEl) {
      urDraftState.formEl = null;
      urDraftState.textarea = null;
      urDraftState.key = null;
      return;
    }
    const parts = urGetFormParts(formEl);
    if (!parts) return;

    const isNewForm = formEl !== urDraftState.formEl || key !== urDraftState.key;
    if (isNewForm) {
      urDraftState.formEl = formEl;
      urDraftState.key = key;
      formEl.addEventListener('click', urDraftOnFormClick, true);
      const saved = urDraftGet('native', key);
      if (saved && !parts.textarea.value.trim()) urDraftRestoreNative(parts.textarea, saved);
      urDraftUpdateIndicator();
    }
    if (parts.textarea !== urDraftState.textarea) {
      if (urDraftState.textarea) urDraftState.textarea.removeEventListener('input', urDraftOnInput);
      urDraftState.textarea = parts.textarea;
      parts.textarea.addEventListener('input', urDraftOnInput);
    }
  }

  // ---------------------------------------------------------------------
  // Issue Tracker: map shows all open issues, list keeps its filter
  // ---------------------------------------------------------------------
  //
  // With the Issue Tracker loaded, WME fills the MAP with issues from
  // `W.issueTrackerController.fetchIssuesMap()`, which calls
  // `descartesClient.searchIssuesByBbox(params)` with the tracker filter +
  // the map bbox (results replace the issues in the data model). The LIST
  // uses a different request. Live-checked (stack trace): only
  // `fetchIssuesMap` calls `searchIssuesByBbox`. We wrap it and swap the
  // filter fields for the "Toate problemele" (all open) filter, keeping
  // bbox + sorting - the list is untouched. No SDK equivalent exists, so
  // this relies on WME internals; if they change, nothing is hooked and
  // WME behaves natively.

  const IT_MAP_ALL_LAYER_NAME = L('RO Tools: Hartă - toate problemele', 'RO Tools: Map - all issues');
  const IT_MAP_ALL_FOOTER_ID = 'wme-ro-tools-it-map-all';
  const IT_MAP_ALL_POLL_MS = 1000;

  // Filter fields of the native "Toate problemele" filter, captured live
  // from `searchIssuesByBbox` params (everything except bbox/sorting).
  const IT_MAP_ALL_FILTER = {
    fromCreationTime: null,
    fromUpdateTime: null,
    toCreationTime: null,
    toUpdateTime: null,
    cityId: null,
    countryId: null,
    managedAreaId: null,
    managedAreaIds: null,
    stateId: null,
    userPropertiesFilter: {},
    mapUpdateRequestsFilter: {
      commentCountRanges: [
        { from: 0, to: 0 },
        { from: 1, to: 1 },
        { from: 2, to: 2 },
        { from: 3, to: 3 },
        { from: 4, to: null },
      ],
      fromLastCommentTime: null,
      toLastCommentTime: null,
      lastCommentBy: null,
      commentedByUser: false,
      isOpen: true,
      reportedByUser: false,
      resolvedByUser: false,
      sources: null,
      types: null,
      descriptionOrComments: 'ALL',
    },
    venueUpdateRequestsFilter: { categories: null, lockRanks: [0, 1, 2, 3, 4, 5], residential: null, types: null },
    mapProblemsFilter: { isOpen: true, types: null },
    mapSuggestionsFilter: {
      createdByUser: false,
      editorRanks: null,
      lockRanks: [0, 1, 2, 3, 4, 5, 6],
      mapChangeTypes: null,
      resolvedByUser: false,
      segmentSuggestionsFilter: { roadTypes: null, unpaved: null },
      sources: null,
      status: ['OPEN'],
    },
  };

  const itMapAllState = {
    client: null, // descartesClient we wrapped
    orig: null, // its original searchIssuesByBbox
    wrapper: null,
    layerCheckboxAdded: false,
  };

  function itGetDescartesClient() {
    const itc = window.W && window.W.issueTrackerController;
    const client = itc && itc.descartesClient;
    return client && typeof client.searchIssuesByBbox === 'function' ? client : null;
  }

  function itMapAllHook() {
    const client = itGetDescartesClient();
    if (!client) return false;
    if (itMapAllState.client === client && client.searchIssuesByBbox === itMapAllState.wrapper) return true;
    const orig = client.searchIssuesByBbox;
    const wrapper = function (params, ...rest) {
      let p = params;
      if (settings.issueTrackerMapAll && params && Array.isArray(params.bbox)) {
        p = {
          ...params,
          ...JSON.parse(JSON.stringify(IT_MAP_ALL_FILTER)),
          bbox: params.bbox,
          sorting: params.sorting,
        };
      }
      return orig.call(this, p, ...rest);
    };
    client.searchIssuesByBbox = wrapper;
    itMapAllState.client = client;
    itMapAllState.orig = orig;
    itMapAllState.wrapper = wrapper;
    return true;
  }

  function itMapAllUnhook() {
    const { client, orig, wrapper } = itMapAllState;
    // Restore only if nobody wrapped it after us.
    if (client && orig && client.searchIssuesByBbox === wrapper) client.searchIssuesByBbox = orig;
    itMapAllState.client = null;
    itMapAllState.orig = null;
    itMapAllState.wrapper = null;
  }

  // Reloads the map issues right away (no need to pan the map).
  function itMapAllRefresh() {
    try {
      const itc = window.W && window.W.issueTrackerController;
      if (itc && typeof itc.fetchIssuesMap === 'function') {
        const r = itc.fetchIssuesMap();
        if (r && typeof r.catch === 'function') r.catch(() => {});
      }
    } catch (e) {
      // ignore - next map move reloads anyway
    }
  }

  // Single entry point for all 3 controls; `source` avoids echoing the
  // change back to the control that triggered it.
  function setIssueTrackerMapAll(value, source) {
    const v = !!value;
    const changed = settings.issueTrackerMapAll !== v;
    settings.issueTrackerMapAll = v;
    saveSettings();
    if (v) itMapAllHook();
    else itMapAllUnhook();

    if (source !== 'settings' && settingsToggleEls.issueTrackerMapAll) settingsToggleEls.issueTrackerMapAll.checked = v;
    if (source !== 'footer') {
      const cb = document.getElementById(IT_MAP_ALL_FOOTER_ID);
      if (cb) cb.checked = v;
    }
    if (source !== 'layer' && itMapAllState.layerCheckboxAdded) {
      try {
        sdk.LayerSwitcher.setLayerCheckboxChecked({ name: IT_MAP_ALL_LAYER_NAME, isChecked: v });
      } catch (e) {
        // ignore
      }
    }
    if (changed) itMapAllRefresh();
  }

  // Checkbox in "Straturi hartă" > Userscripts. `addLayerCheckbox` takes no
  // callback - clicks arrive via the `wme-layer-checkbox-toggled` event.
  function itMapAllRegisterLayerCheckbox() {
    if (!sdk.LayerSwitcher || typeof sdk.LayerSwitcher.addLayerCheckbox !== 'function') return;
    try {
      sdk.LayerSwitcher.addLayerCheckbox({ name: IT_MAP_ALL_LAYER_NAME, isChecked: !!settings.issueTrackerMapAll });
      itMapAllState.layerCheckboxAdded = true;
    } catch (e) {
      return;
    }
    sdk.Events.on({
      eventName: 'wme-layer-checkbox-toggled',
      eventHandler: (e) => {
        if (!e || e.name !== IT_MAP_ALL_LAYER_NAME) return;
        setIssueTrackerMapAll(!!e.checked, 'layer');
      },
    });
  }

  // Checkbox under the native "Actualizează rezultatele când harta este
  // mutată" (`wz-checkbox#feed-sync-with-map`) at the bottom of the Issue
  // Tracker column. Placed in its own row after the native footer, reusing
  // the footer's class so it looks native. Re-injected if React re-renders.
  function itMapAllEnsureFooterCheckbox() {
    if (document.getElementById(IT_MAP_ALL_FOOTER_ID)) return;
    const nativeCb = document.getElementById('feed-sync-with-map');
    const footer = nativeCb && nativeCb.parentElement;
    if (!footer || !footer.parentElement) return;
    const row = document.createElement('div');
    row.className = footer.className;
    const cb = document.createElement('wz-checkbox');
    cb.id = IT_MAP_ALL_FOOTER_ID;
    cb.textContent = L('Hartă: arată toate problemele (ignoră filtrul)', 'Map: show all issues (ignore filter)');
    cb.title = L('WME RO Tools - lista rămâne filtrată, harta arată toate problemele deschise', 'WME RO Tools - the list stays filtered, the map shows all open issues');
    cb.checked = !!settings.issueTrackerMapAll;
    cb.addEventListener('change', () => setIssueTrackerMapAll(cb.checked, 'footer'));
    row.appendChild(cb);
    footer.insertAdjacentElement('afterend', row);
  }

  function itMapAllPoll() {
    itMapAllEnsureFooterCheckbox();
    // Re-hook if WME replaced the client (e.g. re-init).
    if (settings.issueTrackerMapAll) itMapAllHook();
  }

  function initIssueTrackerMapAll() {
    itMapAllRegisterLayerCheckbox();
    if (settings.issueTrackerMapAll) itMapAllHook();
    itMapAllPoll();
    setInterval(itMapAllPoll, IT_MAP_ALL_POLL_MS);
  }

  // ---------------------------------------------------------------------
  // Location label fix ("Oraș, Județ" above the map)
  // ---------------------------------------------------------------------
  //
  // The `.location-info` label above the map shows "City, State" when
  // zoom >= segments zoom and `dataModel.store.topCityId` is set, else the
  // country. WME's `processTopCity(response)` resets `topCityId` to null on
  // EVERY data merge and recounts only segments inside that response - a
  // merge with no segments (e.g. after zoom in) leaves it null, so the
  // label falls back to the country (live-reproduced: zoom 16 -> 17).
  // Fix: when it's null, recompute the most frequent city of the visible
  // loaded segments (same rule as WME: primary street city, non-empty
  // city), set it via the store's own `setTopCityId`, and call the label's
  // own refresh handler so WME formats/zoom-checks it itself. The handler
  // is found as the one function registered on BOTH `W.map` 'zoomend' and
  // `W.model` 'mergeend' (live-checked: exactly one). No network, ~10ms.

  const LOCATION_LABEL_DEBOUNCE_MS = 300;
  let locationLabelTimer = null;

  function locationLabelSchedule() {
    if (locationLabelTimer) clearTimeout(locationLabelTimer);
    locationLabelTimer = setTimeout(() => {
      locationLabelTimer = null;
      locationLabelFixNow();
    }, LOCATION_LABEL_DEBOUNCE_MS);
  }

  function locationLabelFindRefreshHandler() {
    try {
      const zoomEnd = ((window.W.map.events.listeners || {}).zoomend || []).map((l) => l.func);
      const mergeEnd = ((window.W.model.events.listeners || {}).mergeend || []).map((l) => l.func);
      const both = zoomEnd.filter((f) => typeof f === 'function' && mergeEnd.includes(f));
      return both.length === 1 ? both[0] : null;
    } catch (e) {
      return null;
    }
  }

  function locationLabelComputeTopCityId() {
    const ext = sdk.Map.getMapExtent();
    const inExt = (c) => c[0] >= ext[0] && c[0] <= ext[2] && c[1] >= ext[1] && c[1] <= ext[3];
    const counts = new Map();
    let bestId = null;
    let bestCount = 0;
    for (const seg of sdk.DataModel.Segments.getAll()) {
      if (seg.primaryStreetId == null || !seg.geometry || !seg.geometry.coordinates.some(inExt)) continue;
      const street = sdk.DataModel.Streets.getById({ streetId: seg.primaryStreetId });
      if (!street || street.cityId == null) continue;
      const city = sdk.DataModel.Cities.getById({ cityId: street.cityId });
      if (!city || city.isEmpty) continue;
      const n = (counts.get(street.cityId) || 0) + 1;
      counts.set(street.cityId, n);
      if (n > bestCount) {
        bestCount = n;
        bestId = street.cityId;
      }
    }
    return bestId;
  }

  function locationLabelFixNow() {
    if (!settings.locationLabelFix) return;
    try {
      const store = window.W.model && window.W.model.store;
      const st = store && store.getState();
      if (!st || typeof st.setTopCityId !== 'function' || st.topCityId != null) return;
      // Segments not drawn at this zoom -> WME shows the country by design.
      const segLayer = window.W.map && window.W.map.segmentLayer;
      if (!segLayer || !segLayer.getVisibility() || !segLayer.features || !segLayer.features.length) return;
      const cityId = locationLabelComputeTopCityId();
      if (cityId == null) return;
      st.setTopCityId(cityId);
      const refresh = locationLabelFindRefreshHandler();
      if (refresh) refresh();
    } catch (e) {
      // ignore - WME internals changed; label stays native
    }
  }

  function initLocationLabelFix() {
    ['wme-map-data-loaded', 'wme-map-zoom-changed', 'wme-map-move-end'].forEach((eventName) => {
      try {
        sdk.Events.on({ eventName, eventHandler: locationLabelSchedule });
      } catch (e) {
        // ignore unknown event names
      }
    });
    locationLabelSchedule();
  }

  // ---------------------------------------------------------------------
  // Saved warnings - session list of warnings saved with "Salvează oricum"
  // ---------------------------------------------------------------------
  // On Save, WME validates server-side. Ignorable warnings come back as a
  // rejected `W.controller.save()` (a `SaveError` whose `errors` are
  // `{ code, details, geometry (GeoJSON, lon/lat), ignorable,
  // objects: [{ id, objectType }] }`), and the native popover's "Salvează"
  // retries with `save({ ignoreWarnings: true })`. We wrap `save`, copy the
  // errors on the first rejection - before WME's own popover collates them
  // (it groups by code and nulls the geometry of the first entry, mutating
  // the objects) - and, once the forced save resolves, add them to a list
  // kept in memory only: it survives the whole session but not a page
  // reload, as requested. Each warning keeps its own location, so the
  // list shows every one separately, even where WME collates them.

  const SAVED_WARN_ROOT_ID = 'wme-ro-tools-saved-warnings';
  const SAVED_WARN_BTN_ID = 'wme-ro-tools-saved-warnings-btn';
  const SAVED_WARN_POLL_MS = 1000;
  // Fallback for objects created in that save (temporary negative IDs that
  // change once saved): select the nearest segment to the warning point.
  const SAVED_WARN_NEAREST_MAX_M = 15;
  const SAVED_WARN_MIN_ZOOM = 18;

  const savedWarnState = {
    pending: null, // copies of the last validation warnings, until saved
    groups: [], // newest first: [{ id, ts, items: [item] }]
    nextId: 1,
    hooked: false,
    panel: null,
    open: false,
    collapsed: false,
    btn: null,
    badge: null,
  };

  function savedWarnTr(key, opts) {
    try {
      if (window.I18n && window.I18n.lookup(key) != null) return window.I18n.t(key, opts);
    } catch (e) {
      // ignore
    }
    return null;
  }

  function savedWarnObjectLabel(obj) {
    if (!obj) return '';
    const type = String(obj.objectType || '').toLowerCase();
    const isNew = Number(obj.id) < 0;
    let label = `${type === 'segment' ? 'Segment' : obj.objectType} ${isNew ? L('(nou)', '(new)') : obj.id}`;
    if (type === 'segment' && !isNew) {
      try {
        const seg = sdk.DataModel.Segments.getById({ segmentId: Number(obj.id) });
        const street = seg && seg.primaryStreetId != null ? sdk.DataModel.Streets.getById({ streetId: seg.primaryStreetId }) : null;
        if (street && street.name) label += ` · ${street.name}`;
      } catch (e) {
        // ignore - label stays without the name
      }
    }
    return label;
  }

  function savedWarnCopyErrors(errors) {
    return errors
      .filter((e) => e && e.ignorable)
      .map((e) => {
        const objects = Array.isArray(e.objects) ? e.objects.map((o) => ({ id: o.id, objectType: o.objectType })) : [];
        let geometry = null;
        try {
          geometry = e.geometry ? JSON.parse(JSON.stringify(e.geometry)) : null;
        } catch (x) {
          geometry = null;
        }
        return {
          code: e.code,
          details: e.details || null,
          geometry,
          objects,
          objectLabels: objects.map(savedWarnObjectLabel).filter(Boolean),
        };
      });
  }

  function savedWarnOnSaveError(err, force) {
    if (force) return; // forced save failed - keep the pending copy
    const errors = err && Array.isArray(err.errors) ? err.errors : null;
    savedWarnState.pending = errors && errors.some((e) => e && e.ignorable) ? savedWarnCopyErrors(errors) : null;
  }

  function savedWarnOnSaveOk(force) {
    const pending = savedWarnState.pending;
    savedWarnState.pending = null;
    if (!force || !pending || !pending.length || !settings.savedWarningsList) return;
    savedWarnState.groups.unshift({
      id: savedWarnState.nextId++,
      ts: Date.now(),
      items: pending.map((it) => ({ ...it, id: savedWarnState.nextId++ })),
    });
    savedWarnState.open = true;
    savedWarnState.collapsed = false;
    savedWarnRender();
  }

  function savedWarnHookSave() {
    if (savedWarnState.hooked) return true;
    const ctrl = window.W && window.W.controller;
    if (!ctrl || typeof ctrl.save !== 'function') return false;
    const orig = ctrl.save;
    ctrl.save = function (opts) {
      const force = !!(opts && opts.ignoreWarnings);
      const result = orig.apply(this, arguments);
      if (!result || typeof result.then !== 'function') return result;
      return result.then(
        (res) => {
          try {
            savedWarnOnSaveOk(force);
          } catch (e) {
            // ignore - never break WME's save
          }
          return res;
        },
        (err) => {
          try {
            savedWarnOnSaveError(err, force);
          } catch (e) {
            // ignore
          }
          throw err;
        }
      );
    };
    savedWarnState.hooked = true;
    return true;
  }

  function savedWarnCount() {
    return savedWarnState.groups.reduce((n, g) => n + g.items.length, 0);
  }

  function savedWarnRemoveItem(itemId) {
    for (const g of savedWarnState.groups) g.items = g.items.filter((it) => it.id !== itemId);
    savedWarnState.groups = savedWarnState.groups.filter((g) => g.items.length);
    savedWarnRender();
  }

  function savedWarnRemoveGroup(groupId) {
    savedWarnState.groups = savedWarnState.groups.filter((g) => g.id !== groupId);
    savedWarnRender();
  }

  // Middle coordinate of any GeoJSON geometry (Point -> itself).
  function savedWarnGeometryPoint(geometry) {
    if (!geometry || !geometry.coordinates) return null;
    const flat = [];
    (function walk(c) {
      if (typeof c[0] === 'number') flat.push(c);
      else c.forEach(walk);
    })(geometry.coordinates);
    return flat.length ? flat[Math.floor(flat.length / 2)] : null;
  }

  function savedWarnPointToSegmentM(p, a, b) {
    const k = 111320;
    const cos = Math.cos((p[1] * Math.PI) / 180);
    const ax = (a[0] - p[0]) * k * cos;
    const ay = (a[1] - p[1]) * k;
    const bx = (b[0] - p[0]) * k * cos;
    const by = (b[1] - p[1]) * k;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2)) : 0;
    const x = ax + t * dx;
    const y = ay + t * dy;
    return Math.sqrt(x * x + y * y);
  }

  function savedWarnNearestSegmentId(point) {
    let bestId = null;
    let best = SAVED_WARN_NEAREST_MAX_M;
    for (const seg of sdk.DataModel.Segments.getAll()) {
      const c = seg.geometry && seg.geometry.coordinates;
      if (!c || c.length < 2) continue;
      for (let i = 1; i < c.length; i++) {
        const d = savedWarnPointToSegmentM(point, c[i - 1], c[i]);
        if (d < best) {
          best = d;
          bestId = seg.id;
        }
      }
    }
    return bestId;
  }

  // Ids (per WME SDK object type) to select for this warning, among the
  // objects loaded right now.
  function savedWarnSelection(item, point) {
    const typeMap = { segment: 'segment', node: 'node', venue: 'venue' };
    const byType = {};
    for (const obj of item.objects || []) {
      const type = typeMap[String(obj.objectType || '').toLowerCase()];
      if (!type) continue;
      let id = Number(obj.id);
      let exists = false;
      try {
        if (type === 'segment') exists = id > 0 && !!sdk.DataModel.Segments.getById({ segmentId: id });
        else if (type === 'node') exists = id > 0 && !!sdk.DataModel.Nodes.getById({ nodeId: id });
        else exists = id > 0 && !!sdk.DataModel.Venues.getById({ venueId: String(id) });
      } catch (e) {
        exists = false;
      }
      if (!exists && type === 'segment' && point) {
        id = savedWarnNearestSegmentId(point);
        exists = id != null;
      }
      if (!exists) continue;
      (byType[type] = byType[type] || []).push(type === 'venue' ? String(id) : id);
    }
    const type = Object.keys(byType)[0];
    return type ? { objectType: type, ids: [...new Set(byType[type])] } : null;
  }

  function savedWarnGoTo(item) {
    const point = savedWarnGeometryPoint(item.geometry);
    if (point) {
      try {
        const zoomLevel = Math.max(sdk.Map.getZoomLevel(), SAVED_WARN_MIN_ZOOM);
        sdk.Map.setMapCenter({ lonLat: { lon: point[0], lat: point[1] }, zoomLevel });
      } catch (e) {
        // ignore
      }
    }
    // Objects may still be loading after the pan - retry for ~4s.
    let tries = 0;
    const trySelect = () => {
      tries++;
      const sel = savedWarnSelection(item, point);
      if (sel) {
        try {
          sdk.Editing.setSelection({ selection: sel });
          return;
        } catch (e) {
          // fall through to retry
        }
      }
      if (tries < 14) setTimeout(trySelect, 300);
      else if (!point) phShowToast(L('Obiectul acestei avertizări nu mai e încărcat pe hartă.', 'The object of this warning is no longer loaded on the map.'), true);
    };
    setTimeout(trySelect, point ? 250 : 0);
  }

  function savedWarnIconButton(iconClass, title, onClick) {
    const b = document.createElement('wz-button');
    b.setAttribute('color', 'clear-icon');
    b.setAttribute('size', 'sm');
    b.title = title;
    const i = document.createElement('i');
    i.className = `w-icon ${iconClass}`;
    b.appendChild(i);
    b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      onClick();
    });
    return b;
  }

  function savedWarnTime(ts) {
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function savedWarnPositionPanel() {
    const panel = savedWarnState.panel;
    if (!panel) return;
    const toolbar = document.querySelector('.toolbar');
    const top = toolbar ? toolbar.getBoundingClientRect().bottom + 8 : 43;
    const btn = savedWarnState.btn && document.body.contains(savedWarnState.btn) ? savedWarnState.btn : null;
    const anchorRight = btn ? btn.getBoundingClientRect().right : window.innerWidth - 16;
    const right = Math.max(16, window.innerWidth - anchorRight - 8);
    panel.style.top = `${Math.round(top)}px`;
    panel.style.right = `${Math.round(right)}px`;
    panel.style.maxHeight = `calc(100vh - ${Math.round(top) + 24}px)`;
  }

  function savedWarnEnsureStyle() {
    if (document.getElementById(`${SAVED_WARN_ROOT_ID}-style`)) return;
    const style = document.createElement('style');
    style.id = `${SAVED_WARN_ROOT_ID}-style`;
    style.textContent = `
      #${SAVED_WARN_ROOT_ID} { position: fixed; z-index: 8; width: 440px; max-width: calc(100vw - 32px);
        box-sizing: border-box; display: flex; flex-direction: column; padding: 16px 24px 20px; }
      #${SAVED_WARN_ROOT_ID} .ro-sw-head { display: flex; align-items: center; gap: 4px; }
      #${SAVED_WARN_ROOT_ID} .ro-sw-head wz-alert { flex: 1; min-width: 0; }
      #${SAVED_WARN_ROOT_ID} .ro-sw-scroll { overflow-y: auto; min-height: 0; flex: 1; margin-top: 8px; }
      #${SAVED_WARN_ROOT_ID}.ro-sw-collapsed .ro-sw-scroll,
      #${SAVED_WARN_ROOT_ID}.ro-sw-collapsed .ro-sw-foot { display: none; }
      #${SAVED_WARN_ROOT_ID} .ro-sw-group { display: flex; align-items: center; justify-content: space-between;
        margin: 12px 16px 0; opacity: 0.8; }
      #${SAVED_WARN_ROOT_ID} .error-item .actions { display: flex; align-items: flex-start; padding-top: 10px; }
      #${SAVED_WARN_ROOT_ID} .ro-sw-obj { display: block; opacity: 0.75; margin-top: 2px; }
      #${SAVED_WARN_ROOT_ID} .ro-sw-foot { display: flex; justify-content: flex-end; margin-top: 12px; }
      #${SAVED_WARN_BTN_ID} { position: relative; display: inline-flex; align-items: center; }
      #${SAVED_WARN_BTN_ID} .ro-sw-badge { position: absolute; top: -3px; right: -4px; min-width: 15px; height: 15px;
        padding: 0 3px; box-sizing: border-box; border-radius: 8px; background: #ff9800; color: #000;
        font: 600 10px/15px Rubik, sans-serif; text-align: center; pointer-events: none; }
      #${SAVED_WARN_BTN_ID} i.w-icon { color: #ff9800; }
    `;
    document.head.appendChild(style);
  }

  function savedWarnEnsurePanel() {
    if (savedWarnState.panel && document.body.contains(savedWarnState.panel)) return savedWarnState.panel;
    savedWarnEnsureStyle();
    const panel = document.createElement('div');
    panel.id = SAVED_WARN_ROOT_ID;
    // Native save-popover classes -> same look, dark/light mode included.
    panel.className = 'save-popover';
    document.body.appendChild(panel);
    savedWarnState.panel = panel;
    return panel;
  }

  function savedWarnRenderPanel() {
    const count = savedWarnCount();
    if (!savedWarnState.open || !count || !settings.savedWarningsList) {
      if (savedWarnState.panel) savedWarnState.panel.style.display = 'none';
      return;
    }
    const panel = savedWarnEnsurePanel();
    panel.style.display = '';
    panel.classList.toggle('ro-sw-collapsed', savedWarnState.collapsed);
    panel.textContent = '';

    const head = document.createElement('div');
    head.className = 'ro-sw-head';
    const alert = document.createElement('wz-alert');
    alert.setAttribute('level', 'page');
    alert.setAttribute('variant', 'warning');
    const alertTitle = document.createElement('span');
    alertTitle.setAttribute('slot', 'header');
    alertTitle.textContent = L(`Avertizări salvate (${count}) - de verificat`, `Saved warnings (${count}) - to check`);
    alert.appendChild(alertTitle);
    alert.style.cursor = 'pointer';
    alert.title = savedWarnState.collapsed ? L('Extinde lista', 'Expand list') : L('Restrânge lista', 'Collapse list');
    alert.addEventListener('click', () => {
      savedWarnState.collapsed = !savedWarnState.collapsed;
      savedWarnRender();
    });
    head.appendChild(alert);
    head.appendChild(
      savedWarnIconButton(
        savedWarnState.collapsed ? 'w-icon-chevron-down' : 'w-icon-chevron-up',
        savedWarnState.collapsed ? L('Extinde lista', 'Expand list') : L('Restrânge lista', 'Collapse list'),
        () => {
          savedWarnState.collapsed = !savedWarnState.collapsed;
          savedWarnRender();
        }
      )
    );
    head.appendChild(
      savedWarnIconButton('w-icon-x', L('Ascunde fereastra (lista rămâne - butonul ⚠ de lângă Salvează o redeschide)', 'Hide window (the list is kept - the ⚠ button next to Save reopens it)'), () => {
        savedWarnState.open = false;
        savedWarnRender();
      })
    );
    panel.appendChild(head);

    const scroll = document.createElement('div');
    scroll.className = 'ro-sw-scroll';
    const list = document.createElement('div');
    list.className = 'body';
    list.setAttribute('role', 'list');
    for (const group of savedWarnState.groups) {
      const gh = document.createElement('div');
      gh.className = 'ro-sw-group';
      const gt = document.createElement('wz-caption');
      gt.textContent = L(`Salvare de la ${savedWarnTime(group.ts)} · ${group.items.length} ${group.items.length === 1 ? 'avertizare' : 'avertizări'}`, `Save at ${savedWarnTime(group.ts)} · ${group.items.length} ${group.items.length === 1 ? 'warning' : 'warnings'}`);
      gh.appendChild(gt);
      gh.appendChild(savedWarnIconButton('w-icon-trash', L('Șterge toate avertizările acestei salvări', 'Delete all warnings of this save'), () => savedWarnRemoveGroup(group.id)));
      list.appendChild(gh);

      for (const item of group.items) {
        const row = document.createElement('div');
        row.className = 'error-item';
        row.setAttribute('role', 'listitem');
        const content = document.createElement('div');
        content.className = 'content';
        const desc = document.createElement('wz-body2');
        desc.className = 'description';
        desc.textContent =
          savedWarnTr(`save.error_types.${item.code}.title`) || item.details || savedWarnTr('save.error_types.700.title') || L(`Avertizare ${item.code}`, `Warning ${item.code}`);
        const sugg = document.createElement('wz-caption');
        sugg.className = 'suggestion';
        const solution = savedWarnTr(`save.error_types.${item.code}.solution`) || savedWarnTr('save.default_solution') || '';
        sugg.textContent = savedWarnTr('save.error.suggestion_with_solution', { solution }) || solution;
        content.appendChild(desc);
        content.appendChild(sugg);
        if (item.objectLabels && item.objectLabels.length) {
          const obj = document.createElement('wz-caption');
          obj.className = 'ro-sw-obj';
          obj.textContent = item.objectLabels.join(', ');
          content.appendChild(obj);
        }
        const actions = document.createElement('div');
        actions.className = 'actions';
        const canGo = !!(item.geometry || (item.objects && item.objects.length));
        if (canGo) {
          actions.appendChild(savedWarnIconButton('w-icon-recenter', L('Du-mă la problemă (centrează harta și selectează obiectul)', 'Go to issue (center the map and select the object)'), () => savedWarnGoTo(item)));
          content.style.cursor = 'pointer';
          content.title = L('Du-mă la problemă', 'Go to issue');
          content.addEventListener('click', () => savedWarnGoTo(item));
        }
        actions.appendChild(savedWarnIconButton('w-icon-trash', L('Șterge această avertizare din listă', 'Remove this warning from the list'), () => savedWarnRemoveItem(item.id)));
        row.appendChild(content);
        row.appendChild(actions);
        list.appendChild(row);
      }
    }
    scroll.appendChild(list);
    panel.appendChild(scroll);

    const foot = document.createElement('div');
    foot.className = 'ro-sw-foot';
    const clearAll = document.createElement('wz-button');
    clearAll.setAttribute('color', 'secondary');
    clearAll.setAttribute('size', 'sm');
    clearAll.textContent = L('Șterge tot', 'Clear all');
    clearAll.addEventListener('click', () => {
      savedWarnState.groups = [];
      savedWarnRender();
    });
    foot.appendChild(clearAll);
    panel.appendChild(foot);

    savedWarnPositionPanel();
  }

  // Toolbar indicator (⚠ + count) right before the native Save button -
  // only while the list has entries. Toggles the window.
  function savedWarnRenderButton() {
    const count = savedWarnCount();
    const want = count > 0 && settings.savedWarningsList;
    let btn = savedWarnState.btn;
    if (!want) {
      if (btn) btn.remove();
      savedWarnState.btn = null;
      return;
    }
    const host = document.querySelector('.secondary-toolbar .secondary-toolbar-actions');
    if (!host) return;
    savedWarnEnsureStyle();
    if (!btn || !host.contains(btn)) {
      if (btn) btn.remove();
      btn = document.createElement('div');
      btn.id = SAVED_WARN_BTN_ID;
      const wb = savedWarnIconButton('w-icon-alert-warning', '', () => {
        savedWarnState.open = !savedWarnState.open;
        if (savedWarnState.open) savedWarnState.collapsed = false;
        savedWarnRender();
      });
      btn.appendChild(wb);
      const badge = document.createElement('span');
      badge.className = 'ro-sw-badge';
      btn.appendChild(badge);
      host.appendChild(btn);
      savedWarnState.btn = btn;
      savedWarnState.badge = badge;
    }
    savedWarnState.badge.textContent = String(count);
    btn.firstChild.title = L(`Avertizări salvate în această sesiune: ${count} - click pentru listă`, `Warnings saved this session: ${count} - click for the list`);
  }

  function savedWarnRender() {
    savedWarnRenderButton();
    savedWarnRenderPanel();
  }

  function initSavedWarnings() {
    // W.controller may not exist yet on very early init - retry in poll.
    savedWarnHookSave();
    setInterval(() => {
      savedWarnHookSave();
      // WME may re-render the toolbar (drops our button) - re-attach.
      if (savedWarnCount() && (!savedWarnState.btn || !document.body.contains(savedWarnState.btn))) savedWarnRender();
    }, SAVED_WARN_POLL_MS);
    window.addEventListener('resize', savedWarnPositionPanel);
  }

  // ---------------------------------------------------------------------
  // Keyboard shortcuts helper + quick layer buttons
  //
  // WME keeps shortcuts in `W.accelerators` (store-backed): `getActions()`
  // -> { id: { id, name, group, enabled, shortcut: KeyStroke { altKey,
  // ctrlKey, metaKey, shiftKey, keyCode } } }, `getGroups()`. A KeyStroke
  // string is "<bits>,<keyCode>" with bits Ctrl(/Meta)=1, Shift=2, Alt=4
  // (e.g. "0,73" = I, "2,72" = Shift+H). An empty shortcut has keyCode -1.
  //
  // Native dialog (`wz-dialog#shortcuts-dialog`, opened from the footer
  // link): one `section.shortcut-action-group` per group (`h2` = group
  // name), one `p.shortcut-action` per action (React key = action id; the
  // keys in `kbd`s, then `span.shortcut-action-name`). Clicking a row marks
  // it `.selected`; the next keydown calls
  // `W.accelerators.registerShortcut("<bits>,<keyCode>", actionId, true)` +
  // `persist()`. The store silently clears the shortcut of any other action
  // that had the same keys - the "bug" Paul hit. We wrap `registerShortcut`
  // (only while a dialog row is selected) and ask first.
  //
  // Layer toggles <-> actions (WME's own map, LayerSwitcherController):
  // the checkbox ids are `layer-switcher-<toggler id in lower case>`.
  // ---------------------------------------------------------------------

  const KB_KEY_NAMES = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    27: 'Esc',
    32: 'Space',
    33: 'PgUp',
    34: 'PgDn',
    35: 'End',
    36: 'Home',
    37: '←',
    38: '↑',
    39: '→',
    40: '↓',
    45: 'Ins',
    46: 'Del',
    106: '*',
    107: '+',
    109: '-',
    110: '.',
    111: '/',
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '`',
    219: '[',
    220: '\\',
    221: ']',
    222: "'",
  };
  const KB_MODIFIER_KEYCODES = [16, 17, 18, 91, 92, 93, 224];

  // action id -> layer switcher checkbox id (without the prefix)
  const KB_LAYER_ACTIONS = {
    toggleAreaManagers: 'item_area_managers',
    toggleEditableAreas: 'item_editable_areas',
    toggleGPSpoints: 'item_gps_points',
    toggleHouseNumbers: 'item_house_numbers',
    toggleJunctionboxes: 'item_junction_boxes',
    toggleMapProblems: 'item_map_problems',
    toggleMapcomments: 'item_map_comments',
    toggleOnlineEditors: 'item_online_editors',
    togglePlaces: 'group_places',
    toggleGooglePlaces: 'group_google_places',
    toggleRoadClosures: 'item_closures',
    toggleRoads: 'item_road',
    toggleSatelliteImagery: 'item_satellite_imagery',
    toggleShowAllArrows: 'item_disallowed_turns',
    toggleUpdateRequests: 'item_update_requests',
  };

  const KB_TOOLBAR_ID = 'wme-ro-tools-kb-toolbar';
  const KB_HINT_CLASS = 'wme-ro-tools-kbd';
  const KB_CONFIRM_ID = 'wme-ro-tools-kb-confirm';
  const KB_POLL_MS = 700;
  const KB_MENU_RESCAN_MS = 10000;

  const kbState = {
    query: '',
    onlyAssigned: false,
    capturing: false,
    capturedKey: null, // "<bits>,<keyCode>" picked with "Caută după tastă"
    capturedLabel: '',
    menuItems: [], // [{ el, actionId }] - "+" menu items with a native shortcut
    menuScanAt: 0,
  };

  function kbIsEmpty(sc) {
    return !sc || sc.keyCode == null || sc.keyCode === '' || String(sc.keyCode) === '-1';
  }

  function kbBits(sc) {
    return (sc.ctrlKey || sc.metaKey ? 1 : 0) | (sc.shiftKey ? 2 : 0) | (sc.altKey ? 4 : 0);
  }

  function kbKeyString(sc) {
    return `${kbBits(sc)},${sc.keyCode}`;
  }

  function kbKeyLabel(sc) {
    if (kbIsEmpty(sc)) return '';
    const code = Number(sc.keyCode);
    let key = KB_KEY_NAMES[code];
    if (!key) {
      if (code >= 48 && code <= 90) key = String.fromCharCode(code);
      else if (code >= 96 && code <= 105) key = `Num${code - 96}`;
      else if (code >= 112 && code <= 123) key = `F${code - 111}`;
      else key = Number.isNaN(code) ? String(sc.keyCode) : `#${code}`;
    }
    return `${sc.ctrlKey || sc.metaKey ? 'Ctrl+' : ''}${sc.altKey ? 'Alt+' : ''}${sc.shiftKey ? 'Shift+' : ''}${key}`;
  }

  function kbLabelFromString(str) {
    const [bits, keyCode] = String(str).split(',');
    const b = parseInt(bits, 10) || 0;
    return kbKeyLabel({ ctrlKey: !!(b & 1), shiftKey: !!(b & 2), altKey: !!(b & 4), keyCode });
  }

  function kbActions() {
    try {
      return (window.W && window.W.accelerators && window.W.accelerators.getActions()) || {};
    } catch (e) {
      return {};
    }
  }

  function kbTr(key) {
    try {
      if (window.I18n && window.I18n.lookup(key) != null) return window.I18n.t(key);
    } catch (e) {
      // ignore
    }
    return null;
  }

  function kbActionName(a) {
    return kbTr(`keyboard_shortcuts.groups.${a.group}.members.${a.name || a.id}`) || a.name || a.id;
  }

  function kbGroupName(group) {
    return kbTr(`keyboard_shortcuts.groups.${group}.description`) || group;
  }

  function kbActionsByKey(str, exceptId) {
    return Object.values(kbActions()).filter(
      (a) => a && a.id !== exceptId && !kbIsEmpty(a.shortcut) && kbKeyString(a.shortcut) === str
    );
  }

  function kbFold(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  // --- "already assigned" confirmation ---------------------------------

  function kbCloseConfirm() {
    const m = document.getElementById(KB_CONFIRM_ID);
    if (m) m.remove();
  }

  function kbConfirmReplace(keyStr, actionId, others, onReplace) {
    kbCloseConfirm();
    const t = currentTheme();
    const target = kbActions()[actionId];
    const overlay = document.createElement('div');
    overlay.id = KB_CONFIRM_ID;
    overlay.style.cssText =
      'position:fixed; inset:0; z-index:100001; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; padding:16px; box-sizing:border-box;';
    const box = document.createElement('div');
    box.style.cssText = `background:${t.menuBg}; color:${t.menuText}; border:1px solid ${t.menuBorder}; border-radius:8px; box-shadow:0 8px 28px rgba(0,0,0,0.45); width:440px; max-width:100%; padding:16px; box-sizing:border-box; font:13px/1.45 Rubik, Arial, sans-serif;`;
    const title = document.createElement('div');
    title.style.cssText = 'font-weight:600; font-size:14px; margin-bottom:8px;';
    title.textContent = L(`Tasta „${kbLabelFromString(keyStr)}” este deja alocată`, `Key "${kbLabelFromString(keyStr)}" is already assigned`);
    const msg = document.createElement('div');
    msg.style.cssText = 'margin-bottom:6px;';
    msg.textContent = L(`Este folosită de: ${others.map((a) => `„${kbActionName(a)}” (${kbGroupName(a.group)})`).join(', ')}.`, `Used by: ${others.map((a) => `"${kbActionName(a)}" (${kbGroupName(a.group)})`).join(', ')}.`);
    const msg2 = document.createElement('div');
    msg2.style.cssText = 'opacity:0.8; margin-bottom:14px;';
    msg2.textContent = L(`Dacă o aloci comenzii „${target ? kbActionName(target) : actionId}”, ${
      others.length === 1 ? 'comanda de mai sus rămâne' : 'comenzile de mai sus rămân'
    } fără scurtătură.`, `If you assign it to "${target ? kbActionName(target) : actionId}", ${
      others.length === 1 ? 'the action above is left' : 'the actions above are left'
    } without a shortcut.`);
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex; justify-content:flex-end; gap:8px;';
    const cancel = document.createElement('wz-button');
    cancel.setAttribute('color', 'secondary');
    cancel.setAttribute('size', 'sm');
    cancel.textContent = L('Anulează', 'Cancel');
    cancel.addEventListener('click', kbCloseConfirm);
    const ok = document.createElement('wz-button');
    ok.setAttribute('size', 'sm');
    ok.textContent = L('Înlocuiește', 'Replace');
    ok.addEventListener('click', () => {
      kbCloseConfirm();
      onReplace();
    });
    actions.appendChild(cancel);
    actions.appendChild(ok);
    box.appendChild(title);
    box.appendChild(msg);
    box.appendChild(msg2);
    box.appendChild(actions);
    overlay.appendChild(box);
    overlay.addEventListener('mousedown', (ev) => {
      if (ev.target === overlay) kbCloseConfirm();
    });
    document.body.appendChild(overlay);
  }

  function kbHookRegister() {
    const A = window.W && window.W.accelerators;
    if (!A || typeof A.registerShortcut !== 'function') return false;
    if (A.__roToolsKbHooked) return true;
    const orig = A.registerShortcut;
    A.registerShortcut = function (keys, actionId, isStringFormat) {
      try {
        // Only edits made from the native dialog (a row is selected there);
        // scripts registering their own shortcuts are left alone.
        if (
          settings.shortcutsHelper &&
          isStringFormat &&
          typeof keys === 'string' &&
          document.querySelector('#shortcuts-dialog p.shortcut-action.selected')
        ) {
          const others = kbActionsByKey(keys, actionId);
          if (others.length) {
            kbConfirmReplace(keys, actionId, others, () => {
              orig.call(A, keys, actionId, isStringFormat);
              try {
                A.persist();
              } catch (e) {
                // ignore
              }
            });
            return undefined;
          }
        }
      } catch (e) {
        // ignore - fall back to native behavior
      }
      return orig.apply(this, arguments);
    };
    A.__roToolsKbHooked = true;
    return true;
  }

  // --- search / filter in the native dialog ----------------------------

  function kbRowActionId(row) {
    const fk = Object.keys(row).find((k) => k.startsWith('__reactFiber'));
    const fiber = fk && row[fk];
    return fiber && fiber.key != null ? String(fiber.key) : null;
  }

  function kbApplyFilter(dlg) {
    const acts = kbActions();
    const q = kbFold(kbState.query.trim());
    let shown = 0;
    dlg.querySelectorAll('section.shortcut-action-group').forEach((section) => {
      const groupTitle = kbFold((section.querySelector('h2') || {}).textContent);
      let visibleInSection = 0;
      section.querySelectorAll('p.shortcut-action').forEach((row) => {
        const id = kbRowActionId(row);
        const action = id ? acts[id] : null;
        const sc = action ? action.shortcut : null;
        const assigned = !!action && !kbIsEmpty(sc);
        const nameEl = row.querySelector('.shortcut-action-name');
        const hay = kbFold(`${nameEl ? nameEl.textContent : ''} ${assigned ? kbKeyLabel(sc) : ''} ${groupTitle}`);
        let show = true;
        if (kbState.capturedKey) show = assigned && kbKeyString(sc) === kbState.capturedKey;
        else {
          if (q) show = q.split(/\s+/).every((w) => hay.includes(w));
          if (show && kbState.onlyAssigned) show = assigned;
        }
        row.style.display = show ? '' : 'none';
        row.style.opacity = assigned ? '' : '0.5';
        if (show) visibleInSection++;
      });
      section.style.display = visibleInSection ? '' : 'none';
      shown += visibleInSection;
    });
    const bar = dlg.querySelector(`#${KB_TOOLBAR_ID}`);
    if (!bar) return;
    const info = bar.querySelector('.ro-kb-info');
    let text;
    if (kbState.capturedKey) {
      text = shown
        ? L(`„${kbState.capturedLabel}” e alocată la: ${shown} ${shown === 1 ? 'comandă' : 'comenzi'} (afișate mai jos).`, `"${kbState.capturedLabel}" is assigned to: ${shown} ${shown === 1 ? 'action' : 'actions'} (shown below).`)
        : L(`„${kbState.capturedLabel}” nu e alocată niciunei comenzi - e liberă.`, `"${kbState.capturedLabel}" is not assigned to any action - it's free.`);
    } else {
      text = L(`${shown} ${shown === 1 ? 'comandă afișată' : 'comenzi afișate'}`, `${shown} ${shown === 1 ? 'action shown' : 'actions shown'}`);
    }
    // Only on change - the dialog's MutationObserver would loop otherwise.
    if (info.textContent !== text) info.textContent = text;
  }

  function kbStopCapture() {
    if (!kbState.capturing) return;
    kbState.capturing = false;
    window.removeEventListener('keydown', kbOnCaptureKey, true);
  }

  function kbOnCaptureKey(ev) {
    if (!kbState.capturing) return;
    if (KB_MODIFIER_KEYCODES.includes(ev.keyCode)) return; // wait for the real key
    ev.preventDefault();
    ev.stopImmediatePropagation();
    kbStopCapture();
    if (ev.keyCode === 27) {
      kbRenderToolbarState();
      return;
    }
    const str = `${(ev.ctrlKey || ev.metaKey ? 1 : 0) | (ev.shiftKey ? 2 : 0) | (ev.altKey ? 4 : 0)},${ev.keyCode}`;
    kbState.capturedKey = str;
    kbState.capturedLabel = kbLabelFromString(str);
    kbRenderToolbarState();
  }

  function kbRenderToolbarState() {
    const dlg = document.getElementById('shortcuts-dialog');
    const bar = dlg && dlg.querySelector(`#${KB_TOOLBAR_ID}`);
    if (!bar) return;
    const keyBtn = bar.querySelector('.ro-kb-keybtn');
    keyBtn.textContent = kbState.capturing
      ? L('Apasă combinația… (Esc = renunță)', 'Press the key combination… (Esc = cancel)')
      : kbState.capturedKey
        ? L(`Tasta: ${kbState.capturedLabel} ✕`, `Key: ${kbState.capturedLabel} ✕`)
        : L('⌨ Caută după tastă', '⌨ Search by key');
    keyBtn.style.borderColor = kbState.capturing || kbState.capturedKey ? 'var(--primary, #3cf)' : '';
    bar.querySelector('.ro-kb-search').disabled = !!kbState.capturedKey;
    kbApplyFilter(dlg);
  }

  function kbBuildToolbar() {
    const bar = document.createElement('div');
    bar.id = KB_TOOLBAR_ID;
    bar.style.cssText =
      'position:sticky; top:0; z-index:2; display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; padding:8px 10px; margin-bottom:8px; background:var(--background_default, #fff); border-bottom:1px solid var(--hairline, #ccc); font:12px Rubik, Arial, sans-serif; color:var(--content_default, #202124);';
    const ctrlStyle =
      'height:28px; box-sizing:border-box; padding:0 8px; border-radius:6px; border:1px solid var(--hairline, #ccc); background:var(--surface_default, #f2f2f2); color:inherit; font:inherit;';
    const search = document.createElement('input');
    search.type = 'search';
    search.className = 'ro-kb-search';
    search.placeholder = L('Caută comanda sau tasta (ex: imobil, Shift+H)…', 'Search action or key (e.g. place, Shift+H)…');
    search.style.cssText = `${ctrlStyle} flex:1 1 220px; min-width:160px;`;
    search.value = kbState.query;
    search.addEventListener('input', () => {
      kbState.query = search.value;
      kbRenderToolbarState();
    });
    // Typing here must not trigger WME shortcuts.
    search.addEventListener('keydown', (ev) => ev.stopPropagation());
    const keyBtn = document.createElement('button');
    keyBtn.type = 'button';
    keyBtn.className = 'ro-kb-keybtn';
    keyBtn.title = L('Apasă butonul, apoi combinația de taste: vezi ce comandă o folosește (sau că e liberă).', 'Click the button, then press the key combination: see which action uses it (or that it is free).');
    keyBtn.style.cssText = `${ctrlStyle} cursor:pointer; white-space:nowrap;`;
    keyBtn.addEventListener('click', () => {
      if (kbState.capturedKey || kbState.capturing) {
        kbState.capturedKey = null;
        kbStopCapture();
      } else {
        kbState.capturing = true;
        window.addEventListener('keydown', kbOnCaptureKey, true);
      }
      kbRenderToolbarState();
    });
    const only = document.createElement('label');
    only.style.cssText = 'display:inline-flex; align-items:center; gap:4px; cursor:pointer; user-select:none;';
    const onlyCb = document.createElement('input');
    onlyCb.type = 'checkbox';
    onlyCb.checked = kbState.onlyAssigned;
    onlyCb.style.cssText = 'margin:0;';
    onlyCb.addEventListener('change', () => {
      kbState.onlyAssigned = onlyCb.checked;
      kbRenderToolbarState();
    });
    const onlyTxt = document.createElement('span');
    onlyTxt.textContent = L('Doar cu tastă alocată', 'Only with assigned key');
    only.appendChild(onlyCb);
    only.appendChild(onlyTxt);
    const info = document.createElement('div');
    info.className = 'ro-kb-info';
    info.style.cssText = 'flex:1 0 100%; opacity:0.75; font-size:11px;';
    bar.appendChild(search);
    bar.appendChild(keyBtn);
    bar.appendChild(only);
    bar.appendChild(info);
    return bar;
  }

  let kbFilterTimer = null;
  function kbPollDialog() {
    const dlg = document.getElementById('shortcuts-dialog');
    if (!dlg || !settings.shortcutsHelper) {
      kbStopCapture();
      if (!dlg) kbState.capturedKey = null;
      return;
    }
    const content = dlg.querySelector('wz-dialog-content');
    if (!content || !content.querySelector('section.shortcut-action-group')) return;
    if (!content.querySelector(`#${KB_TOOLBAR_ID}`)) {
      content.insertBefore(kbBuildToolbar(), content.firstChild);
      kbRenderToolbarState();
      // WME re-renders the rows after a change - re-apply the filter.
      new MutationObserver(() => {
        if (kbFilterTimer) return;
        kbFilterTimer = setTimeout(() => {
          kbFilterTimer = null;
          if (document.body.contains(dlg)) kbApplyFilter(dlg);
        }, 50);
      }).observe(content, { childList: true, subtree: true });
    }
  }

  // --- key hints in "Straturi hartă" and the "+" menu --------------------

  function kbSetHint(host, label) {
    if (!host) return;
    let hint = host.querySelector(`:scope > .${KB_HINT_CLASS}`);
    if (!label) {
      if (hint) hint.remove();
      return;
    }
    if (!hint) {
      hint = document.createElement('span');
      hint.className = KB_HINT_CLASS;
      hint.style.cssText =
        'display:inline-block; margin-left:6px; padding:0 4px; border:1px solid var(--hairline, #bbb); border-radius:3px; font:600 10px/15px Rubik, Arial, sans-serif; opacity:0.7; white-space:nowrap; vertical-align:middle;';
      host.appendChild(hint);
    }
    if (hint.textContent !== label) hint.textContent = label;
  }

  // The "+" menu caps its sub-menus at 288px (`--wz-menu-max-width`, set
  // by WME on the drawer menu) and cuts labels with an ellipsis, so long
  // hazard names hide our key hint. `max-content` lets each sub-menu grow
  // to its widest row (the inner `.wz-menu` reads the variable).
  const KB_MENU_STYLE_ID = 'wme-ro-tools-kbd-menu-style';

  function kbEnsureMenuStyle() {
    if (document.getElementById(KB_MENU_STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = KB_MENU_STYLE_ID;
    style.textContent = 'wz-navigation-drawer wz-menu-sub-menu { --wz-menu-max-width: max-content; }';
    document.head.appendChild(style);
  }

  function kbRemoveAllHints() {
    const menuStyle = document.getElementById(KB_MENU_STYLE_ID);
    if (menuStyle) menuStyle.remove();
    document.querySelectorAll(`.${KB_HINT_CLASS}`).forEach((el) => el.remove());
    kbState.menuItems.forEach(({ el }) => {
      const h = el.querySelector(`.${KB_HINT_CLASS}`);
      if (h) h.remove();
    });
  }

  function kbScanMenuItems() {
    const found = [];
    const visit = (root) => {
      root.querySelectorAll('wz-menu-item').forEach((el) => {
        const fk = Object.keys(el).find((k) => k.startsWith('__reactFiber'));
        let f = fk && el[fk];
        for (let i = 0; i < 8 && f; i++) {
          const p = f.memoizedProps;
          if (p && typeof p.keyboardAction === 'string') {
            found.push({ el, actionId: p.keyboardAction });
            break;
          }
          f = f.return;
        }
      });
      root.querySelectorAll('*').forEach((el) => {
        if (el.shadowRoot) visit(el.shadowRoot);
      });
    };
    visit(document);
    kbState.menuItems = found;
    kbState.menuScanAt = Date.now();
  }

  function kbRefreshHints() {
    if (!settings.shortcutsHelper) return;
    kbEnsureMenuStyle();
    const acts = kbActions();
    for (const [actionId, toggler] of Object.entries(KB_LAYER_ACTIONS)) {
      const id = `layer-switcher-${toggler}`;
      const host = toggler.startsWith('group_')
        ? document.querySelector(`label[for="${id}"]`)
        : document.querySelector(`#${id} .layer-selector-container`);
      const a = acts[actionId];
      kbSetHint(host, a ? kbKeyLabel(a.shortcut) : '');
    }
    if (
      Date.now() - kbState.menuScanAt > KB_MENU_RESCAN_MS ||
      kbState.menuItems.some(({ el }) => !el.isConnected)
    ) {
      kbScanMenuItems();
    }
    for (const { el, actionId } of kbState.menuItems) {
      const labelHost = el.querySelector('[class*="itemLabel"]') || el;
      const a = acts[actionId];
      kbSetHint(labelHost, a ? kbKeyLabel(a.shortcut) : '');
    }
  }

  // --- quick layer buttons under Layers / Reload / Permalink -------------

  const LAYER_BTN_CLASS = 'wme-ro-tools-layer-btn';
  const LAYER_BTN_SVG = {
    google:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><path d="M14.6 8.6A3.2 3.2 0 1 0 15 11h-3"/></svg>',
    imagery:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M3 7l4-4 4 4-4 4z"/><path d="M13 17l4-4 4 4-4 4z"/><path d="M19 3a4 4 0 0 1 2 2"/><path d="M19 1a6 6 0 0 1 4 4"/></svg>',
    houseNumbers:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><text x="12" y="18.5" text-anchor="middle" font-size="8" font-family="Arial" font-weight="700" fill="currentColor" stroke="none">12</text></svg>',
    hazards:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l10 18H2z"/><path d="M12 10v5"/><path d="M12 18h.01"/></svg>',
  };
  const LAYER_BTNS = [
    { key: 'google', toggler: 'group_google_places', title: L('Locuri Google', 'Google Places'), actionId: 'toggleGooglePlaces' },
    { key: 'imagery', toggler: 'group_imagery', title: L('Imagini din satelit suplimentare', 'Additional satellite imagery'), actionId: null },
    { key: 'houseNumbers', toggler: 'item_house_numbers', title: L('Numere de imobil', 'House numbers'), actionId: 'toggleHouseNumbers' },
    { key: 'hazards', toggler: 'group_permanent_hazards', title: L('Pericole', 'Hazards'), actionId: null },
  ];

  function layerBtnCheckbox(btn) {
    return document.getElementById(`layer-switcher-${btn.toggler}`);
  }

  // "Google Earth" button (same column): opens Google Earth for web at the
  // current WME view, top-down. Earth web shows the imagery date under
  // "Data attribution" (bottom-left) - WME itself has no imagery date.
  // URL: /web/@lat,lon,<altitude>a,<camera range>d,<fov>y,<heading>h,
  // <tilt>t,<roll>r. Range = visible map height / (2 * tan(fov / 2)), so
  // Earth shows about the same area.
  const EARTH_FOV_DEG = 35;
  const EARTH_BTN_SVG =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18"/><path d="M12 3a14 14 0 0 0 0 18"/></svg>';

  function earthUrlForCurrentView() {
    const c = sdk.Map.getMapCenter();
    const ext = sdk.Map.getMapExtent(); // [minLon, minLat, maxLon, maxLat]
    const heightM = Math.max(50, (ext[3] - ext[1]) * 111320);
    const range = Math.round(heightM / (2 * Math.tan((EARTH_FOV_DEG / 2) * (Math.PI / 180))));
    return `https://earth.google.com/web/@${c.lat.toFixed(6)},${c.lon.toFixed(6)},0a,${range}d,${EARTH_FOV_DEG}y,0h,0t,0r`;
  }

  function layerBtnsEnsureEarth(container) {
    if (container.querySelector(`.${LAYER_BTN_CLASS}[data-layer="earth"]`)) return;
    const el = document.createElement('button');
    el.type = 'button';
    el.className = LAYER_BTN_CLASS;
    el.dataset.layer = 'earth';
    el.innerHTML = EARTH_BTN_SVG;
    el.title = L('Deschide zona curentă în Google Earth (tab nou) - data imaginilor apare jos, la "Data attribution"', 'Open the current area in Google Earth (new tab) - the imagery date is shown at the bottom, under "Data attribution"');
    el.style.cssText =
      'width:33px; height:33px; padding:0; border:none; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:rgba(60,64,67,0.3) 0 1px 2px 0, rgba(60,64,67,0.15) 0 2px 6px 2px; background-color:var(--background_default, #fff); color:var(--content_default, #202124);';
    el.addEventListener('click', () => {
      try {
        window.open(earthUrlForCurrentView(), '_blank', 'noopener');
      } catch (e) {
        phShowToast(L('Nu am putut deschide Google Earth.', 'Could not open Google Earth.'), true);
      }
    });
    container.appendChild(el);
  }

  function layerBtnsRemove() {
    document.querySelectorAll(`.${LAYER_BTN_CLASS}`).forEach((el) => el.remove());
  }

  function layerBtnsRefresh() {
    if (!settings.layerQuickButtons) {
      layerBtnsRemove();
      return;
    }
    const container = document.querySelector('.overlay-buttons-container.top');
    if (!container) return;
    const acts = kbActions();
    layerBtnsEnsureEarth(container);
    for (const def of LAYER_BTNS) {
      let el = container.querySelector(`.${LAYER_BTN_CLASS}[data-layer="${def.key}"]`);
      if (!el) {
        el = document.createElement('button');
        el.type = 'button';
        el.className = LAYER_BTN_CLASS;
        el.dataset.layer = def.key;
        el.innerHTML = LAYER_BTN_SVG[def.key];
        el.style.cssText =
          'width:33px; height:33px; padding:0; border:none; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:rgba(60,64,67,0.3) 0 1px 2px 0, rgba(60,64,67,0.15) 0 2px 6px 2px; transition:background-color .15s, color .15s;';
        el.addEventListener('click', () => {
          const cb = layerBtnCheckbox(def);
          if (cb) cb.click();
          setTimeout(layerBtnsRefresh, 50);
        });
        container.appendChild(el);
      }
      const cb = layerBtnCheckbox(def);
      const exists = !!cb;
      const on = exists && !!cb.checked;
      const a = def.actionId ? acts[def.actionId] : null;
      const key = a ? kbKeyLabel(a.shortcut) : '';
      el.style.display = exists ? 'flex' : 'none';
      el.style.backgroundColor = on ? 'var(--primary, #33ccff)' : 'var(--background_default, #fff)';
      el.style.color = on ? 'var(--background_default, #202124)' : 'var(--content_default, #202124)';
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
      const title = L(`${def.title}: ${on ? 'activ' : 'inactiv'} - click pentru a comuta${key ? ` (${key})` : ''}`, `${def.title}: ${on ? 'on' : 'off'} - click to toggle${key ? ` (${key})` : ''}`);
      if (el.title !== title) el.title = title;
    }
  }

  function initShortcutsAndLayerButtons() {
    kbHookRegister();
    setInterval(() => {
      try {
        kbHookRegister();
        kbPollDialog();
        kbRefreshHints();
        layerBtnsRefresh();
      } catch (e) {
        // ignore - WME DOM changed
      }
    }, KB_POLL_MS);
  }

  // ---------------------------------------------------------------------
  // Turn instructions helper ("Instrucțiuni viraje" window)
  //
  // Adds tools to WME's own turn instructions window (opened from the
  // pencil next to "Instrucțiuni" in a turn's menu). Everything only
  // changes the WINDOW's state - nothing reaches the map until the native
  // "Aplică", and closing with X discards it, as in WME.
  //
  // How the native window works (production code, WME v2.374):
  // - The panel component (React, props `lonlat, turn, onClose`) keeps a
  //   `useReducer` with { initialTurn, opcode, tts, turn } - actions
  //   SET_TTS / SET_OPCODE / PASTE_TURN / RESET / SET_ERROR - and three
  //   `useState` lists of "chips": exit signs, visual instruction ("main"),
  //   towards ("secondary"). A chip is { type: 'ROAD_SHIELD', signType,
  //   signText, direction, id } or { type: 'FREE_TEXT', text, id }.
  // - The chip lists are rendered by a component with props `items,
  //   onAddItem, ...`; we find its `items` array and the hook holding that
  //   same array, then call the hook's dispatch with a new array.
  // - Road shields are just sign type + text: the type ids are per country
  //   (1050 motorway, 1051 European, 1071 express road, 1076 communal, 1078
  //   county, 1079 national). The native menu only offers shields of streets
  //   loaded on the map (hence Paul's "helper" segments), but any type+text
  //   is accepted - verified in the sandbox: an A2 shield with no A2 street
  //   anywhere around was saved and came back after reload.
  // - The play button calls `sayTextInLocale(text, lonlat, locale)` on a
  //   TTSPlayer kept in a hook of the TTS component; we find it the same
  //   way and use it for the full voice simulation. `lonlat` (the panel's
  //   prop) is required: without it the server returns no audio.
  // ---------------------------------------------------------------------

  const TI_POLL_MS = 400;
  const TI_BAR_CLASS = 'wme-ro-tools-ti-bar';
  const TI_POP_ID = 'wme-ro-tools-ti-pop';
  const TI_CONFIRM_ID = 'wme-ro-tools-ti-confirm';
  const TI_LS_SHIELDS = 'wme-ro-tools.tiShields';
  const TI_SHIELDS_MAX = 400;
  const TI_SCAN_MS = 15000;
  const TI_SIGN = { MOTORWAY: 1050, EUROPEAN: 1051, EXPRESS: 1071, COMMUNAL: 1076, COUNTY: 1078, NATIONAL: 1079 };
  // Badge look in our own lists (approximates the RO shields).
  const TI_SIGN_STYLE = {
    1050: 'background:#1b7f3b; color:#fff; border:2px solid #fff; outline:1px solid #1b7f3b;',
    1051: 'background:#1b7f3b; color:#fff; border:2px solid #1b7f3b;',
    1071: 'background:#c62828; color:#fff; border:2px solid #c62828; border-radius:2px;',
    1076: 'background:#f9d71c; color:#111; border:2px solid #f9d71c;',
    1078: 'background:#1f5aa6; color:#fff; border:2px solid #1f5aa6;',
    1079: 'background:#c62828; color:#fff; border:2px solid #c62828; border-radius:3px 3px 8px 8px;',
  };
  // Warnings added to the secondary area; `tts` is appended to the TTS
  // ("..." = a short pause). `{v}` = the chosen value.
  const TI_WARNINGS = [
    {
      key: 'height',
      label: L('Gabarit înălțime', 'Height limit'),
      values: ['3.50', '3.00', '2.50', '2.00'],
      unit: 'm',
      get chip() {
        return CT('ti.height.chip');
      },
      get tts() {
        return CT('ti.height.tts');
      },
      re: /H\.max\.\s*=\s*([\d.,]+)\s*m/i,
    },
    {
      key: 'weight',
      label: L('Tonaj maxim', 'Max weight'),
      values: ['7.5', '3.5', '12'],
      unit: 't',
      get chip() {
        return CT('ti.weight.chip');
      },
      get tts() {
        return CT('ti.weight.tts');
      },
      re: /([\d.,]+)\s*t\s*max/i,
    },
    {
      key: 'busTaxi',
      label: L('Interzis, except Bus / Taxi', 'No entry, except Bus / Taxi'),
      values: null,
      get chip() {
        return CT('ti.busTaxi.chip');
      },
      get tts() {
        return CT('ti.busTaxi.tts');
      },
      re: /Except\..*Bus.*Taxi/i,
    },
  ];
  // Voice simulation phrases - customizable (CT 'voice.*').
  const tiVoice = (op) => CT(`voice.${op}`) || CT('voice.CONTINUE');

  const tiState = {
    shieldTarget: 'towards', // where the shields picker adds: 'visual' | 'towards'
    showMinorShields: false, // DJ / DC in the picker list
    lastScan: 0,
  };

  function tiUid() {
    try {
      return crypto.randomUUID();
    } catch (e) {
      return `ro-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  }

  function tiFiberOf(el) {
    if (!el) return null;
    const k = Object.keys(el).find((x) => x.startsWith('__reactFiber$'));
    return k ? el[k] : null;
  }

  function tiPanel() {
    return document.querySelector('#panel-container .turn-instructions-panel');
  }

  // Live handles into the native window (recomputed for every action -
  // React replaces the state objects on each render).
  function tiCtx() {
    const panel = tiPanel();
    if (!panel) return null;
    const content = panel.querySelector('.panel-content');
    let f = tiFiberOf(content || panel);
    let comp = null;
    while (f) {
      const p = f.memoizedProps;
      if (typeof f.type === 'function' && p && 'turn' in p && 'onClose' in p) {
        comp = f;
        break;
      }
      f = f.return;
    }
    if (!comp) return null;
    const hooks = [];
    for (let h = comp.memoizedState; h; h = h.next) hooks.push(h);
    const red = hooks.find(
      (h) => h.queue && typeof h.queue.lastRenderedReducer === 'function' && /PASTE_TURN/.test(String(h.queue.lastRenderedReducer))
    );
    if (!red || !red.memoizedState) return null;
    // Chip lists in render order: [visual, towards].
    const lists = [];
    const walk = (node, depth) => {
      if (!node || depth > 60 || lists.length >= 2) return;
      const p = node.memoizedProps;
      if (p && Array.isArray(p.items) && typeof p.onAddItem === 'function') lists.push(p.items);
      walk(node.child, depth + 1);
      walk(node.sibling, depth);
    };
    walk(comp.child, 0);
    if (lists.length < 2) return null;
    const hookFor = (arr) => hooks.find((h) => h.memoizedState === arr && h.queue && typeof h.queue.dispatch === 'function');
    const hv = hookFor(lists[0]);
    const ht = hookFor(lists[1]);
    if (!hv || !ht) return null;
    return {
      panel,
      lonlat: comp.memoizedProps.lonlat || null,
      state: red.memoizedState,
      dispatch: red.queue.dispatch,
      visual: lists[0],
      towards: lists[1],
      setVisual: (arr) => hv.queue.dispatch(arr),
      setTowards: (arr) => ht.queue.dispatch(arr),
    };
  }

  // Turn = { fromVertex: { segmentID, direction: 'fwd'|'rev' }, toVertex,
  // turnData }; 'fwd' = travelling A->B on that segment.
  function tiTurnIds(ctx) {
    const t = ctx.state.initialTurn || ctx.state.turn;
    const f = t && t.fromVertex;
    const to = t && t.toVertex;
    if (!f || !to) return null;
    return { fromSegId: f.segmentID, toSegId: to.segmentID, fromFwd: f.direction === 'fwd', toFwd: to.direction === 'fwd' };
  }

  function tiShieldItem(signType, signText, direction) {
    return { type: 'ROAD_SHIELD', signType, signText, direction: direction || null, id: tiUid() };
  }

  function tiTextItem(text) {
    return { type: 'FREE_TEXT', text, id: tiUid() };
  }

  // "DJ601 - Calea București" -> "Calea București". Split only after a
  // road number (or on a street with a shield): "Str. X - Y" stays whole.
  // No " - ": '' when the street has a shield (the name is just the road
  // number), else the whole name.
  function tiLocalName(name, hasShield) {
    const n = String(name || '').trim();
    const i = n.indexOf(' - ');
    if (i >= 0 && (hasShield || /^(A|E|DEx|DN|DJ|DC)\s?\w+$/i.test(n.slice(0, i).trim()))) return n.slice(i + 3).trim();
    if (i >= 0) return n;
    return hasShield ? '' : n;
  }

  // The street the turn leads to: the primary street if it has a shield,
  // else an alternate street with a shield (prefer "XX - local name"),
  // else the primary street.
  function tiTargetStreet(ctx) {
    const ids = tiTurnIds(ctx);
    if (!ids) return null;
    let seg;
    try {
      seg = sdk.DataModel.Segments.getById({ segmentId: ids.toSegId });
    } catch (e) {
      return null;
    }
    if (!seg) return null;
    const get = (id) => {
      try {
        return id ? sdk.DataModel.Streets.getById({ streetId: id }) : null;
      } catch (e) {
        return null;
      }
    };
    const primary = get(seg.primaryStreetId);
    const alts = (seg.alternateStreetIds || []).map(get).filter(Boolean);
    let chosen = primary && primary.signType ? primary : null;
    if (!chosen) chosen = alts.find((s) => s.signType && / - /.test(s.name || '')) || alts.find((s) => s.signType) || null;
    if (!chosen) chosen = primary;
    if (!chosen) return null;
    const hasShield = !!chosen.signType;
    let local = tiLocalName(chosen.name, hasShield);
    // Shield without a local part: take the local name from the primary.
    if (hasShield && !local && primary && primary !== chosen) local = tiLocalName(primary.name, !!primary.signType);
    return {
      name: chosen.name || '',
      local,
      signType: hasShield ? chosen.signType : null,
      signText: hasShield ? chosen.signText || '' : null,
    };
  }

  // ---- TTS text -------------------------------------------------------

  function tiShieldCode(it) {
    const t = String(it.signText || '').trim();
    switch (Number(it.signType)) {
      case TI_SIGN.NATIONAL:
        return /^CB$/i.test(t) ? CT('ti.ringRoad') : `DN${t}`;
      case TI_SIGN.COUNTY:
        return `DJ${t}`;
      case TI_SIGN.COMMUNAL:
        return `DC${t}`;
      default:
        return t; // A1, E60, DEx12 already carry their prefix
    }
  }

  // Regex for a (possibly customized) chip template: `{v}` = a number.
  function tiChipRe(w) {
    const parts = String(w.chip).split('{v}').map((p) => p.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return new RegExp(parts.join('\\s*([\\d.,]+)\\s*').replace(/\s+/g, '\\s*'), 'i');
  }

  // Built-in pattern (default texts, also older chips) or the current one.
  function tiWarningMatch(w, text) {
    return w.re.exec(text) || tiChipRe(w).exec(text);
  }

  function tiIsWarningText(text) {
    return TI_WARNINGS.some((w) => !!tiWarningMatch(w, text));
  }

  function tiWarningsTts(items) {
    const out = [];
    for (const it of items) {
      if (it.type !== 'FREE_TEXT') continue;
      for (const w of TI_WARNINGS) {
        const m = tiWarningMatch(w, it.text || '');
        if (!m) continue;
        out.push(w.tts.replace('{v}', m[1] ? m[1].replace(',', '.') : ''));
      }
    }
    return out;
  }

  function tiMainTts(items) {
    const parts = [];
    for (const it of items) {
      if (it.type === 'ROAD_SHIELD') {
        const code = tiShieldCode(it);
        const dir = String(it.direction || '').trim();
        if (!dir || code.toLowerCase().includes(dir.toLowerCase())) parts.push(code);
        else parts.push(`${code} - ${dir}`);
      } else {
        const t = String(it.text || '').trim();
        if (t && !tiIsWarningText(t)) parts.push(t);
      }
    }
    return parts.join(', ');
  }

  // Secondary area, in chip order: the first shield with its name, at
  // most 2 more shields (number only), free texts where they are. Names
  // already said in the main part are left out; "»" and warnings are not
  // read here.
  function tiTowardsTts(items, mainText) {
    const said = String(mainText || '').toLowerCase();
    const parts = [];
    const add = (s) => {
      const v = String(s || '').trim();
      if (!v) return;
      if (said.includes(v.toLowerCase())) return;
      if (parts.some((p) => p.toLowerCase() === v.toLowerCase())) return;
      parts.push(v);
    };
    let shields = 0;
    for (const it of items) {
      if (it.type === 'ROAD_SHIELD') {
        const code = tiShieldCode(it);
        const dir = String(it.direction || '').trim();
        if (shields === 0) {
          const d = dir && !said.includes(dir.toLowerCase()) && !code.toLowerCase().includes(dir.toLowerCase()) ? dir : '';
          add(d ? `${code} ${d}` : code);
        } else if (shields <= 2) {
          add(code);
        }
        shields++;
        continue;
      }
      const t = String(it.text || '').replace(/»/g, ' ').trim();
      if (!t || tiIsWarningText(t)) continue;
      t.split(/\s*[·/,]\s*/).forEach(add);
    }
    return parts.join(', ');
  }

  function tiBuildTts(visual, towards) {
    const main = tiMainTts(visual);
    const sec = tiTowardsTts(towards, main);
    let tts = main;
    if (sec) tts = tts ? `${tts} » ${sec}` : sec;
    const warn = tiWarningsTts([...visual, ...towards]);
    if (warn.length) tts = `${tts} ${warn.join(' ')}`.trim();
    return tts;
  }

  // ---- Text fields: insert at the cursor ------------------------------

  // The field currently focused inside the window: a chip input (free text
  // or a shield's direction) or the TTS textarea (inside wz-textarea's
  // shadow DOM). Our buttons keep the focus (mousedown preventDefault).
  function tiActiveField(ctx) {
    let el = document.activeElement;
    if (!el || !ctx.panel.contains(el)) return null;
    if (el.tagName === 'WZ-TEXTAREA' && el.shadowRoot) {
      const ta = el.shadowRoot.activeElement || el.shadowRoot.querySelector('textarea');
      return ta ? { kind: 'tts', el: ta } : null;
    }
    if (el.tagName === 'INPUT' && el.type !== 'checkbox') return { kind: 'input', el };
    return null;
  }

  function tiSpaced(value, start, end, text) {
    const before = value.slice(0, start);
    const after = value.slice(end);
    let ins = text;
    if (/^[»·]$/.test(text)) {
      if (before && !/\s$/.test(before)) ins = ` ${ins}`;
      if (!/^\s/.test(after)) ins = `${ins} `;
    }
    return { value: before + ins + after, caret: before.length + ins.length };
  }

  function tiInsertAtCursor(ctx, text, anchorEl) {
    const f = tiActiveField(ctx);
    if (!f) {
      phShowToast(L('Click întâi în câmpul de text unde vrei să inserezi (o casetă din Instrucțiuni vizuale / Înspre, sau TTS).', 'First click in the text field where you want to insert (a box in Visual instructions / Towards, or TTS).'), true, anchorEl && anchorEl.getBoundingClientRect());
      return false;
    }
    const el = f.el;
    const start = el.selectionStart != null ? el.selectionStart : el.value.length;
    const end = el.selectionEnd != null ? el.selectionEnd : start;
    const r = tiSpaced(el.value, start, end, text);
    if (f.kind === 'tts') {
      ctx.dispatch({ type: 'SET_TTS', tts: r.value });
    } else {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(el, r.value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    setTimeout(() => {
      try {
        el.focus();
        el.setSelectionRange(r.caret, r.caret);
      } catch (e) {
        // ignore
      }
    }, 30);
    return true;
  }

  // ---- Actions --------------------------------------------------------

  function tiHasContent(items) {
    return items.some((it) => (it.type === 'ROAD_SHIELD' ? true : String(it.text || '').trim() !== ''));
  }

  function tiFillDefault(anchorEl) {
    const ctx = tiCtx();
    if (!ctx) return;
    const target = tiTargetStreet(ctx);
    if (!target) {
      phShowToast(L('Nu am găsit strada segmentului spre care se face virajul.', 'Could not find the street of the segment the turn goes to.'), true, anchorEl.getBoundingClientRect());
      return;
    }
    const visual = target.signType
      ? [tiShieldItem(target.signType, target.signText, target.local)]
      : [tiTextItem(target.name || target.local)];
    const towards = [tiTextItem('»')];
    const apply = () => {
      const c = tiCtx();
      if (!c) return;
      c.setVisual(visual);
      c.setTowards(towards);
      c.dispatch({ type: 'SET_TTS', tts: tiBuildTts(visual, towards) });
    };
    const hasData = tiHasContent(ctx.visual) || tiHasContent(ctx.towards) || String(ctx.state.tts || '').trim() !== '';
    if (!hasData) {
      apply();
      return;
    }
    tiConfirm(
      L('Înlocuiești instrucțiunile?', 'Replace the instructions?'),
      L(`Instrucțiunile vizuale, „Înspre” și TTS vor fi înlocuite cu: ${target.signType ? `[${tiShieldCode({ signType: target.signType, signText: target.signText })}] ` : ''}${target.local || target.name} » (TTS: „${tiBuildTts(visual, towards)}”). Nimic nu se aplică pe hartă până nu apeși „Aplică”.`, `Visual instructions, "Towards" and TTS will be replaced with: ${target.signType ? `[${tiShieldCode({ signType: target.signType, signText: target.signText })}] ` : ''}${target.local || target.name} » (TTS: "${tiBuildTts(visual, towards)}"). Nothing changes on the map until you press "Apply".`),
      L('Înlocuiește', 'Replace'),
      apply
    );
  }

  function tiInsertLocalName(anchorEl) {
    const ctx = tiCtx();
    if (!ctx) return;
    const target = tiTargetStreet(ctx);
    const local = target && (target.local || target.name);
    if (!local) {
      phShowToast(L('Segmentul spre care se face virajul nu are nume.', 'The segment the turn goes to has no name.'), true, anchorEl.getBoundingClientRect());
      return;
    }
    if (tiActiveField(ctx)) {
      tiInsertAtCursor(ctx, local, anchorEl);
      return;
    }
    // No cursor: add it as a new text box in "Înspre".
    ctx.setTowards([...ctx.towards, tiTextItem(local)]);
  }

  // TTS after a change of the chips: rebuilt when it was empty or still the
  // automatic text of the old chips (not edited by hand); otherwise
  // `manual(tts)` patches it (or it stays as typed).
  function tiSyncTts(ctx, oldVisual, oldTowards, newVisual, newTowards, manual) {
    const cur = String(ctx.state.tts || '').trim();
    if (!cur || cur === tiBuildTts(oldVisual, oldTowards)) {
      ctx.dispatch({ type: 'SET_TTS', tts: tiBuildTts(newVisual, newTowards) });
      return;
    }
    if (!manual) return;
    const next = manual(cur);
    if (next && next !== cur) ctx.dispatch({ type: 'SET_TTS', tts: next });
  }

  // Hand-edited TTS + new shield in "Înspre": "… » DN1", or "…, DN1" when
  // there is already a "»"; kept before a "... Atenție!" warning.
  function tiTtsWithTowardsPart(cur, part) {
    if (!part || cur.toLowerCase().includes(part.toLowerCase())) return cur;
    // Earliest warning phrase (text before `{v}` of any warning TTS).
    const k = TI_WARNINGS.map((w) => cur.indexOf(String(w.tts).split('{v}')[0].trim()))
      .concat([cur.indexOf('... Atenție')])
      .filter((i) => i >= 0)
      .reduce((a, b) => Math.min(a, b), -1 >>> 0);
    if (k === -1 >>> 0) {
      const head0 = cur.trim();
      if (!head0) return part;
      return head0.includes('»') ? `${head0}, ${part}` : `${head0} » ${part}`;
    }
    const head = (k >= 0 ? cur.slice(0, k) : cur).trim();
    const tail = k >= 0 ? ` ${cur.slice(k).trim()}` : '';
    if (!head) return `${part}${tail}`;
    return `${head.includes('»') ? `${head}, ${part}` : `${head} » ${part}`}${tail}`;
  }

  function tiAddShield(signType, signText, direction, where) {
    const ctx = tiCtx();
    if (!ctx) return;
    const item = tiShieldItem(signType, signText, direction);
    const oldV = ctx.visual;
    const oldT = ctx.towards;
    const newV = where === 'visual' ? [...oldV, item] : oldV;
    const newT = where === 'visual' ? oldT : [...oldT, item];
    if (where === 'visual') ctx.setVisual(newV);
    else ctx.setTowards(newT);
    const part = `${tiShieldCode(item)}${direction ? ` ${direction}` : ''}`;
    tiSyncTts(ctx, oldV, oldT, newV, newT, where === 'visual' ? null : (cur) => tiTtsWithTowardsPart(cur, part));
  }

  // If "Înspre" already has something (even just "»"), asks: add after it,
  // or replace it with the warning.
  function tiAddWarning(w, value) {
    const ctx = tiCtx();
    if (!ctx) return;
    const chip = w.chip.replace('{v}', value || '');
    const phrase = w.tts.replace('{v}', value || '');
    const apply = (replace) => {
      const c = tiCtx();
      if (!c) return;
      const oldT = c.towards;
      const newT = replace ? [tiTextItem(chip)] : [...oldT, tiTextItem(chip)];
      c.setTowards(newT);
      tiSyncTts(c, c.visual, oldT, c.visual, newT, (cur) => (cur.includes(phrase) ? cur : `${cur} ${phrase}`));
    };
    if (!tiHasContent(ctx.towards)) {
      apply(false);
      return;
    }
    const now = ctx.towards
      .map((it) => (it.type === 'ROAD_SHIELD' ? `[${tiShieldCode(it)}${it.direction ? ` ${it.direction}` : ''}]` : it.text))
      .join(' ');
    tiConfirm(
      L('„Înspre” are deja conținut', '"Towards" already has content'),
      L(`Acum în „Înspre”: ${now}\n\nAvertizarea „${chip}” înlocuiește tot ce e acolo sau se adaugă după?`, `Now in "Towards": ${now}\n\nShould the warning "${chip}" replace everything there or be added after it?`),
      L('Adaugă după', 'Add after'),
      () => apply(false),
      { text: L('Înlocuiește', 'Replace'), onClick: () => apply(true) }
    );
  }

  function tiTtsAction(kind, anchorEl) {
    const ctx = tiCtx();
    if (!ctx) return;
    if (kind === 'clear') {
      ctx.dispatch({ type: 'SET_TTS', tts: '' });
      return;
    }
    if (kind === 'all') {
      ctx.dispatch({ type: 'SET_TTS', tts: tiBuildTts(ctx.visual, ctx.towards) });
      return;
    }
    const main = tiMainTts(ctx.visual);
    let text;
    if (kind === 'main') text = main;
    else {
      const sec = tiTowardsTts(ctx.towards, main);
      text = sec ? `» ${sec}` : '';
    }
    if (!text) {
      phShowToast(kind === 'main' ? L('Zona principală e goală.', 'The main area is empty.') : L('Nimic de transcris din „Înspre”.', 'Nothing to transcribe from "Towards".'), true, anchorEl.getBoundingClientRect());
      return;
    }
    const f = tiActiveField(ctx);
    if (f && f.kind === 'tts') {
      tiInsertAtCursor(ctx, text, anchorEl);
      return;
    }
    const cur = String(ctx.state.tts || '').trim();
    ctx.dispatch({ type: 'SET_TTS', tts: cur ? `${cur} ${text}` : text });
  }

  // ---- Voice simulation -----------------------------------------------

  function tiFindTtsService(panel) {
    const btn = panel.querySelector('.w-icon-voice');
    let f = tiFiberOf(btn || panel);
    for (let i = 0; f && i < 25; i++, f = f.return) {
      for (let h = f.memoizedState, j = 0; h && j < 40; h = h.next, j++) {
        const v = h.memoizedState;
        if (v && typeof v === 'object') {
          if (typeof v.sayTextInLocale === 'function') return v;
          for (const k of Object.keys(v).slice(0, 20)) {
            const x = v[k];
            if (x && typeof x === 'object' && typeof x.sayTextInLocale === 'function') return x;
          }
        }
      }
    }
    return null;
  }

  function tiBearing(a, b) {
    const k = Math.cos((((a[1] + b[1]) / 2) * Math.PI) / 180);
    return (Math.atan2((b[0] - a[0]) * k, b[1] - a[1]) * 180) / Math.PI;
  }

  // Default Waze prompt (opcode null): roundabout, else from the angle
  // between the two segments at the node (approximation of Waze's rules).
  function tiDefaultPhrase(ctx) {
    const ids = tiTurnIds(ctx);
    if (!ids) return tiVoice('CONTINUE');
    let from;
    let to;
    try {
      from = sdk.DataModel.Segments.getById({ segmentId: ids.fromSegId });
      to = sdk.DataModel.Segments.getById({ segmentId: ids.toSegId });
    } catch (e) {
      return tiVoice('CONTINUE');
    }
    if (!from || !to) return tiVoice('CONTINUE');
    if (from.junctionId || to.junctionId) return tiVoice('ROUNDABOUT');
    const fc = from.geometry.coordinates;
    const tc = to.geometry.coordinates;
    // Travel direction: forward = A->B = coordinate order.
    const f1 = ids.fromFwd ? fc[fc.length - 2] : fc[1];
    const f2 = ids.fromFwd ? fc[fc.length - 1] : fc[0];
    const t1 = ids.toFwd ? tc[0] : tc[tc.length - 1];
    const t2 = ids.toFwd ? tc[1] : tc[tc.length - 2];
    let a = tiBearing(t1, t2) - tiBearing(f1, f2);
    while (a > 180) a -= 360;
    while (a <= -180) a += 360;
    if (Math.abs(a) <= 20) return tiVoice('CONTINUE');
    if (Math.abs(a) <= 45) return tiVoice(a > 0 ? 'KEEP_RIGHT' : 'KEEP_LEFT');
    if (Math.abs(a) >= 170) return tiVoice('UTURN');
    return tiVoice(a > 0 ? 'TURN_RIGHT' : 'TURN_LEFT');
  }

  function tiSimulate(anchorEl) {
    const ctx = tiCtx();
    if (!ctx) return;
    let tts = String(ctx.state.tts || '').trim();
    if (!tts) tts = tiBuildTts(ctx.visual, ctx.towards);
    if (!tts) {
      phShowToast(L('TTS e gol și nu am ce construi din instrucțiuni.', 'TTS is empty and there is nothing to build it from.'), true, anchorEl.getBoundingClientRect());
      return;
    }
    const op = ctx.state.opcode;
    if (op === 'NONE') {
      phShowToast(L('Prompt voce „Fără”: Waze nu anunță acest viraj.', 'Voice prompt "None": Waze does not announce this turn.'), true, anchorEl.getBoundingClientRect());
      return;
    }
    const phrase = op ? tiVoice(op) : tiDefaultPhrase(ctx);
    const text = `${CT('voice.distance')} ${phrase} ${tts}`;
    const svc = tiFindTtsService(ctx.panel);
    if (!svc) {
      phShowToast(L('Nu am găsit serviciul de voce al WME.', 'Could not find the WME voice service.'), true, anchorEl.getBoundingClientRect());
      return;
    }
    const sel = ctx.panel.querySelector('wz-select[class*="localeSelector"]');
    const locale = (sel && sel.value) || 'ro-RO';
    try {
      if (!ctx.lonlat) throw new Error(L('lipsește poziția virajului', 'turn position is missing'));
      svc.sayTextInLocale(text, ctx.lonlat, locale);
      phShowToast(`🔊 ${text}`, false, anchorEl.getBoundingClientRect());
    } catch (e) {
      phShowToast(L(`Simularea vocală a eșuat: ${e.message}`, `Voice simulation failed: ${e.message}`), true, anchorEl.getBoundingClientRect());
    }
  }

  // ---- Shields: typed codes + the ones seen on the map -----------------

  // "A2", "DN1A", "E60", "DEx12", "DJ601", "DC43", "CB" -> { signType, signText }
  function tiParseShieldCode(code) {
    const c = String(code || '').replace(/\s+/g, '').toUpperCase();
    let m;
    if (c === 'CB' || c === 'DNCB') return { signType: TI_SIGN.NATIONAL, signText: 'CB' };
    if ((m = /^A(\d{1,3})$/.exec(c))) return { signType: TI_SIGN.MOTORWAY, signText: `A${m[1]}` };
    if ((m = /^E(\d{1,3})$/.exec(c))) return { signType: TI_SIGN.EUROPEAN, signText: `E${m[1]}` };
    if ((m = /^DEX(\d{1,3})$/.exec(c))) return { signType: TI_SIGN.EXPRESS, signText: `DEx${m[1]}` };
    if ((m = /^DN(\w{1,5})$/.exec(c))) return { signType: TI_SIGN.NATIONAL, signText: m[1] };
    if ((m = /^DJ(\w{1,4})$/.exec(c))) return { signType: TI_SIGN.COUNTY, signText: m[1] };
    if ((m = /^DC(\w{1,4})$/.exec(c))) return { signType: TI_SIGN.COMMUNAL, signText: m[1] };
    return null;
  }

  function tiLoadShields() {
    try {
      const v = JSON.parse(localStorage.getItem(TI_LS_SHIELDS) || '{}');
      return v && typeof v === 'object' ? v : {};
    } catch (e) {
      return {};
    }
  }

  function tiSaveShields(map) {
    try {
      const entries = Object.entries(map).sort((a, b) => (b[1].last || 0) - (a[1].last || 0)).slice(0, TI_SHIELDS_MAX);
      localStorage.setItem(TI_LS_SHIELDS, JSON.stringify(Object.fromEntries(entries)));
    } catch (e) {
      // ignore
    }
  }

  function tiStateIdOfStreet(st) {
    try {
      const city = st && st.cityId ? sdk.DataModel.Cities.getById({ cityId: st.cityId }) : null;
      return city && city.stateId != null ? city.stateId : null;
    } catch (e) {
      return null;
    }
  }

  // Remembers the shields of the streets loaded on the map (per county),
  // so the picker can offer them later without helper segments.
  function tiScanShields(force) {
    const now = Date.now();
    if (!force && now - tiState.lastScan < TI_SCAN_MS) return;
    tiState.lastScan = now;
    let streets;
    try {
      streets = sdk.DataModel.Streets.getAll();
    } catch (e) {
      return;
    }
    const valid = new Set(Object.values(TI_SIGN));
    const map = tiLoadShields();
    let changed = false;
    for (const st of streets) {
      if (!st.signType || !valid.has(Number(st.signType))) continue;
      const text = String(st.signText || '').trim();
      if (!text) continue;
      const key = `${st.signType}|${text}`;
      const e = map[key] || { t: Number(st.signType), x: text, states: [] };
      const sid = tiStateIdOfStreet(st);
      if (sid != null && !e.states.includes(sid)) e.states.push(sid);
      if (!map[key] || now - (e.last || 0) > 60000) {
        e.last = now;
        changed = true;
      }
      map[key] = e;
    }
    if (changed) tiSaveShields(map);
  }

  function tiCurrentStateId(ctx) {
    const ids = tiTurnIds(ctx);
    try {
      const seg = ids && sdk.DataModel.Segments.getById({ segmentId: ids.toSegId });
      const st = seg && sdk.DataModel.Streets.getById({ streetId: seg.primaryStreetId });
      return tiStateIdOfStreet(st);
    } catch (e) {
      return null;
    }
  }

  const TI_SIGN_ORDER = [TI_SIGN.MOTORWAY, TI_SIGN.EXPRESS, TI_SIGN.NATIONAL, TI_SIGN.EUROPEAN, TI_SIGN.COUNTY, TI_SIGN.COMMUNAL];

  function tiShieldList(ctx) {
    const map = tiLoadShields();
    const sid = tiCurrentStateId(ctx);
    const minor = new Set([TI_SIGN.COUNTY, TI_SIGN.COMMUNAL]);
    const all = Object.values(map).filter((e) => tiState.showMinorShields || !minor.has(e.t));
    const local = sid == null ? all : all.filter((e) => e.states && e.states.includes(sid));
    const list = local.length ? local : all;
    const num = (s) => {
      const m = /\d+/.exec(s);
      return m ? Number(m[0]) : 0;
    };
    list.sort((a, b) => TI_SIGN_ORDER.indexOf(a.t) - TI_SIGN_ORDER.indexOf(b.t) || num(a.x) - num(b.x) || a.x.localeCompare(b.x));
    return { list, inCounty: sid != null && local.length > 0 };
  }

  function tiBadge(signType, signText) {
    const b = document.createElement('span');
    b.textContent = tiShieldCode({ signType, signText }).replace(CT('ti.ringRoad'), 'CB');
    if (signType === TI_SIGN.NATIONAL || signType === TI_SIGN.COUNTY || signType === TI_SIGN.COMMUNAL) b.textContent = String(signText).trim();
    b.style.cssText = `display:inline-block; min-width:22px; text-align:center; padding:0 4px; border-radius:4px; font:700 11px/16px Arial, sans-serif; ${TI_SIGN_STYLE[signType] || ''}`;
    return b;
  }

  // ---- Small UI pieces ------------------------------------------------

  function tiBtn(text, title, onClick, extraCss) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.title = title;
    b.style.cssText = `font:600 12px/1 Rubik, Arial, sans-serif; padding:4px 7px; border-radius:4px; cursor:pointer; border:1px solid var(--separator_default, #888); background:var(--background_variant, #f2f4f7); color:var(--content_default, #202124); white-space:nowrap; ${extraCss || ''}`;
    // Keep the focus (and the cursor) in the field being edited.
    b.addEventListener('mousedown', (ev) => ev.preventDefault());
    b.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      try {
        onClick(b, ev);
      } catch (e) {
        phShowToast(L(`Eroare: ${e.message}`, `Error: ${e.message}`), true, b.getBoundingClientRect());
      }
    });
    return b;
  }

  function tiClosePop() {
    const p = document.getElementById(TI_POP_ID);
    if (p) p.remove();
    document.removeEventListener('mousedown', tiPopOutside, true);
    document.removeEventListener('keydown', tiPopKey, true);
  }

  function tiPopOutside(ev) {
    const p = document.getElementById(TI_POP_ID);
    if (p && !p.contains(ev.target) && !(ev.target.closest && ev.target.closest(`.${TI_BAR_CLASS}`))) tiClosePop();
  }

  function tiPopKey(ev) {
    if (ev.key === 'Escape') {
      ev.stopPropagation();
      tiClosePop();
    }
  }

  function tiOpenPop(anchorEl, build) {
    const wasSame = document.getElementById(TI_POP_ID) && document.getElementById(TI_POP_ID).dataset.anchor === anchorEl.dataset.tiKey;
    tiClosePop();
    if (wasSame) return; // second click on the same button closes it
    const t = currentTheme();
    const pop = document.createElement('div');
    pop.id = TI_POP_ID;
    pop.dataset.anchor = anchorEl.dataset.tiKey || '';
    pop.style.cssText = `position:fixed; z-index:100002; background:${t.menuBg}; color:${t.menuText}; border:1px solid ${t.menuBorder}; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.45); padding:10px; font:12px/1.4 Rubik, Arial, sans-serif; width:300px; max-height:70vh; overflow:auto; box-sizing:border-box;`;
    build(pop);
    document.body.appendChild(pop);
    const r = anchorEl.getBoundingClientRect();
    const pr = pop.getBoundingClientRect();
    const left = Math.min(window.innerWidth - pr.width - 8, Math.max(8, r.left));
    let top = r.bottom + 6;
    if (top + pr.height > window.innerHeight - 8) top = Math.max(8, r.top - pr.height - 6);
    pop.style.left = `${Math.round(left)}px`;
    pop.style.top = `${Math.round(top)}px`;
    setTimeout(() => {
      document.addEventListener('mousedown', tiPopOutside, true);
      document.addEventListener('keydown', tiPopKey, true);
    }, 0);
  }

  // `extra` = optional { text, onClick }: a second choice next to OK.
  function tiConfirm(title, message, okText, onOk, extra) {
    const old = document.getElementById(TI_CONFIRM_ID);
    if (old) old.remove();
    const t = currentTheme();
    const overlay = document.createElement('div');
    overlay.id = TI_CONFIRM_ID;
    overlay.style.cssText =
      'position:fixed; inset:0; z-index:100003; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; padding:16px; box-sizing:border-box;';
    const box = document.createElement('div');
    box.style.cssText = `background:${t.menuBg}; color:${t.menuText}; border:1px solid ${t.menuBorder}; border-radius:8px; box-shadow:0 8px 28px rgba(0,0,0,0.45); width:440px; max-width:100%; padding:16px; box-sizing:border-box; font:13px/1.45 Rubik, Arial, sans-serif;`;
    const h = document.createElement('div');
    h.style.cssText = 'font-weight:600; font-size:14px; margin-bottom:8px;';
    h.textContent = title;
    const m = document.createElement('div');
    m.style.cssText = 'margin-bottom:14px; white-space:pre-wrap;';
    m.textContent = message;
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex; justify-content:flex-end; gap:8px;';
    const close = () => {
      overlay.remove();
      document.removeEventListener('keydown', onKey, true);
    };
    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        close();
      }
    };
    const cancel = document.createElement('wz-button');
    cancel.setAttribute('color', 'secondary');
    cancel.setAttribute('size', 'sm');
    cancel.textContent = L('Anulează', 'Cancel');
    cancel.addEventListener('click', close);
    const ok = document.createElement('wz-button');
    ok.setAttribute('size', 'sm');
    ok.textContent = okText;
    ok.addEventListener('click', () => {
      close();
      onOk();
    });
    actions.appendChild(cancel);
    if (extra) {
      const alt = document.createElement('wz-button');
      alt.setAttribute('color', 'secondary');
      alt.setAttribute('size', 'sm');
      alt.textContent = extra.text;
      alt.addEventListener('click', () => {
        close();
        extra.onClick();
      });
      actions.appendChild(alt);
    }
    actions.appendChild(ok);
    box.appendChild(h);
    box.appendChild(m);
    box.appendChild(actions);
    overlay.appendChild(box);
    overlay.addEventListener('mousedown', (ev) => {
      if (ev.target === overlay) close();
    });
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey, true);
  }

  function tiBuildWarningsPop(pop) {
    const title = document.createElement('div');
    title.textContent = L('Avertizare în „Înspre” + TTS', 'Warning in "Towards" + TTS');
    title.style.cssText = 'font-weight:600; margin-bottom:8px;';
    pop.appendChild(title);
    for (const w of TI_WARNINGS) {
      const row = document.createElement('div');
      row.style.cssText = 'margin-bottom:10px;';
      const lab = document.createElement('div');
      lab.textContent = w.label;
      lab.style.cssText = 'margin-bottom:4px; opacity:0.85;';
      row.appendChild(lab);
      const btns = document.createElement('div');
      btns.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px; align-items:center;';
      const add = (v) => {
        tiAddWarning(w, v);
        tiClosePop();
      };
      if (!w.values) {
        btns.appendChild(tiBtn(w.chip, `TTS: ${w.tts}`, () => add('')));
      } else {
        for (const v of w.values) btns.appendChild(tiBtn(`${v} ${w.unit}`, `${w.chip.replace('{v}', v)}\nTTS: ${w.tts.replace('{v}', v)}`, () => add(v)));
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.placeholder = L('altă', 'other');
        inp.style.cssText = 'width:52px; font:12px Arial; padding:3px 4px; border-radius:4px; border:1px solid var(--separator_default, #888); background:transparent; color:inherit;';
        inp.addEventListener('keydown', (ev) => {
          ev.stopPropagation();
          if (ev.key === 'Enter' && inp.value.trim()) add(inp.value.trim().replace(',', '.'));
        });
        btns.appendChild(inp);
        btns.appendChild(tiBtn('OK', L('Adaugă cu valoarea tastată', 'Add with the typed value'), () => {
          if (inp.value.trim()) add(inp.value.trim().replace(',', '.'));
        }));
      }
      row.appendChild(btns);
      pop.appendChild(row);
    }
  }

  function tiBuildShieldsPop(pop) {
    const ctx = tiCtx();
    if (!ctx) return;
    tiScanShields(true);
    const title = document.createElement('div');
    title.textContent = L('Adaugă insignă', 'Add shield');
    title.style.cssText = 'font-weight:600; margin-bottom:6px;';
    pop.appendChild(title);

    const where = document.createElement('div');
    where.style.cssText = 'display:flex; gap:10px; margin-bottom:8px;';
    for (const [val, text] of [
      ['visual', L('Principal', 'Main')],
      ['towards', L('Înspre', 'Towards')],
    ]) {
      const l = document.createElement('label');
      l.style.cssText = 'display:flex; gap:4px; align-items:center; cursor:pointer;';
      const r = document.createElement('input');
      r.type = 'radio';
      r.name = 'ro-ti-where';
      r.checked = tiState.shieldTarget === val;
      r.addEventListener('change', () => {
        tiState.shieldTarget = val;
      });
      l.appendChild(r);
      l.appendChild(document.createTextNode(text));
      where.appendChild(l);
    }
    pop.appendChild(where);

    // Typed code + optional name.
    const form = document.createElement('div');
    form.style.cssText = 'display:flex; gap:4px; margin-bottom:4px;';
    const inCss = 'font:12px Arial; padding:4px; border-radius:4px; border:1px solid var(--separator_default, #888); background:transparent; color:inherit; min-width:0;';
    const code = document.createElement('input');
    code.placeholder = 'A2, DN1A, E60, DEx12, CB…';
    code.style.cssText = `${inCss} width:110px;`;
    const dir = document.createElement('input');
    dir.placeholder = L('localitate (opțional)', 'locality (optional)');
    dir.style.cssText = `${inCss} flex:1;`;
    const hint = document.createElement('div');
    hint.style.cssText = 'font-size:11px; opacity:0.75; margin-bottom:8px; min-height:14px;';
    const preview = () => {
      const p = tiParseShieldCode(code.value);
      hint.textContent = '';
      if (!code.value.trim()) {
        hint.textContent = L('A = autostradă, E = european, DEx = drum expres, DN / DJ / DC, CB = Centura București', 'A = motorway, E = European, DEx = expressway, DN / DJ / DC, CB = Centura București (Bucharest ring road)');
        return;
      }
      if (!p) {
        hint.textContent = L('Cod necunoscut', 'Unknown code');
        return;
      }
      hint.appendChild(tiBadge(p.signType, p.signText));
      hint.appendChild(document.createTextNode(`  TTS: ${tiShieldCode(p)}`));
    };
    const submit = () => {
      const p = tiParseShieldCode(code.value);
      if (!p) {
        phShowToast(L('Cod de insignă necunoscut (ex. A2, DN1A, E60, DEx12, DJ601, DC43, CB).', 'Unknown shield code (e.g. A2, DN1A, E60, DEx12, DJ601, DC43, CB).'), true, code.getBoundingClientRect());
        return;
      }
      tiAddShield(p.signType, p.signText, dir.value.trim(), tiState.shieldTarget);
      tiClosePop();
    };
    [code, dir].forEach((el) => {
      el.addEventListener('keydown', (ev) => {
        ev.stopPropagation();
        if (ev.key === 'Enter') submit();
      });
      el.addEventListener('input', preview);
    });
    form.appendChild(code);
    form.appendChild(dir);
    form.appendChild(tiBtn(L('Adaugă', 'Add'), L('Adaugă insigna tastată', 'Add the typed shield'), submit));
    pop.appendChild(form);
    pop.appendChild(hint);
    preview();

    // Shields seen on the map.
    const { list, inCounty } = tiShieldList(ctx);
    const sub = document.createElement('div');
    sub.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin:4px 0;';
    const st = document.createElement('span');
    st.textContent = inCounty ? L('Văzute în acest județ:', 'Seen in this county:') : L('Văzute pe hartă:', 'Seen on the map:');
    st.style.cssText = 'font-weight:600;';
    const minorL = document.createElement('label');
    minorL.style.cssText = 'display:flex; gap:4px; align-items:center; cursor:pointer; font-size:11px;';
    const minor = document.createElement('input');
    minor.type = 'checkbox';
    minor.checked = tiState.showMinorShields;
    minor.addEventListener('change', () => {
      tiState.showMinorShields = minor.checked;
      tiClosePop();
      tiOpenPop(document.querySelector(`.${TI_BAR_CLASS} [data-ti-key="shields"]`) || pop, tiBuildShieldsPop);
    });
    minorL.appendChild(minor);
    minorL.appendChild(document.createTextNode(L('și DJ / DC', 'also DJ / DC')));
    sub.appendChild(st);
    sub.appendChild(minorL);
    pop.appendChild(sub);
    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px;';
    if (!list.length) {
      const e = document.createElement('div');
      e.style.cssText = 'opacity:0.75; font-size:11px;';
      e.textContent = L('Încă nimic - insignele se rețin automat din drumurile încărcate pe hartă cât editezi.', 'Nothing yet - shields are remembered automatically from the roads loaded on the map while you edit.');
      grid.appendChild(e);
    }
    for (const e of list) {
      const b = tiBtn('', L(`Adaugă ${tiShieldCode({ signType: e.t, signText: e.x })} (cu numele din câmpul „localitate”, dacă e completat)`, `Add ${tiShieldCode({ signType: e.t, signText: e.x })} (with the name from the "locality" field, if filled in)`), () => {
        tiAddShield(e.t, e.x, dir.value.trim(), tiState.shieldTarget);
        tiClosePop();
      }, 'padding:2px; background:transparent; border-color:transparent;');
      b.appendChild(tiBadge(e.t, e.x));
      grid.appendChild(b);
    }
    pop.appendChild(grid);
    setTimeout(() => code.focus(), 0);
  }

  // ---- Injection ------------------------------------------------------

  function tiInject() {
    const panel = tiPanel();
    if (!panel) {
      tiClosePop();
      return;
    }
    const cp = panel.querySelector('.copy-paste-container');
    if (cp && !panel.querySelector(`.${TI_BAR_CLASS}`)) {
      const bar = document.createElement('div');
      bar.className = TI_BAR_CLASS;
      bar.style.cssText = 'display:flex; flex-wrap:wrap; gap:4px; padding:4px 16px 0 16px;';
      bar.appendChild(tiBtn(L('⚡ Implicit', '⚡ Default'), L('Completează: principal = insigna + numele local al drumului spre care se face virajul, Înspre = „»”, TTS refăcut. Cere confirmare dacă există deja date.', 'Fills in: main = shield + local name of the road the turn goes to, Towards = "»", TTS rebuilt. Asks for confirmation if there is already data.'), (b) => tiFillDefault(b)));
      bar.appendChild(tiBtn('»', L('Inserează „»” (TTS îl citește „înspre”) unde e cursorul', 'Inserts "»" (TTS reads it as "înspre" / towards) at the cursor'), (b) => {
        const ctx = tiCtx();
        if (ctx) tiInsertAtCursor(ctx, '»', b);
      }));
      bar.appendChild(tiBtn('·', L('Inserează „·” (separator între destinații, ex. București · Constanța) unde e cursorul', 'Inserts "·" (separator between destinations, e.g. București · Constanța) at the cursor'), (b) => {
        const ctx = tiCtx();
        if (ctx) tiInsertAtCursor(ctx, '·', b);
      }));
      const sh = tiBtn(L('🛡 Insigne', '🛡 Shields'), L('Adaugă o insignă tastată (A2, DN1A, E60, DEx12, CB…) sau una văzută pe hartă - fără segmente helper', 'Add a typed shield (A2, DN1A, E60, DEx12, CB…) or one seen on the map - no helper segments'), (b) => tiOpenPop(b, tiBuildShieldsPop));
      sh.dataset.tiKey = 'shields';
      bar.appendChild(sh);
      const wb = tiBtn(L('⚠️ Avertizare', '⚠️ Warning'), L('Gabarit înălțime, tonaj, Bus/Taxi - în Înspre și în TTS', 'Height limit, weight limit, Bus/Taxi - in Towards and in TTS'), (b) => tiOpenPop(b, tiBuildWarningsPop));
      wb.dataset.tiKey = 'warn';
      bar.appendChild(wb);
      cp.insertAdjacentElement('afterend', bar);
    }
    // "nume local" next to the "Înspre" label (2nd label of the window).
    // Checks are on the whole panel: after wrapping, the labels move.
    const towardsLabel = panel.querySelectorAll('.panel-content wz-label')[1];
    if (towardsLabel && !panel.querySelector('.wme-ro-tools-ti-local')) {
      const b = tiBtn(L('+ nume local', '+ local name'), L('Inserează numele local al drumului spre care se face virajul (unde e cursorul; fără cursor: casetă nouă în Înspre)', 'Inserts the local name of the road the turn goes to (at the cursor; without a cursor: new box in Towards)'), (el) => tiInsertLocalName(el), 'padding:2px 6px; font-size:11px; margin-left:8px;');
      b.classList.add('wme-ro-tools-ti-local');
      const wrap = document.createElement('div');
      wrap.style.cssText = 'display:flex; align-items:center;';
      towardsLabel.insertAdjacentElement('beforebegin', wrap);
      wrap.appendChild(towardsLabel);
      wrap.appendChild(b);
    }
    // TTS tools next to the TTS label.
    const ttsBox = panel.querySelector('wz-textarea#tts');
    const ttsLabel = ttsBox && ttsBox.parentElement && ttsBox.parentElement.querySelector('wz-label');
    if (ttsLabel && !panel.querySelector('.wme-ro-tools-ti-tts')) {
      const row = document.createElement('div');
      row.className = 'wme-ro-tools-ti-tts';
      row.style.cssText = 'display:flex; align-items:center; gap:4px; flex-wrap:wrap;';
      ttsLabel.insertAdjacentElement('beforebegin', row);
      row.appendChild(ttsLabel);
      const tools = document.createElement('div');
      tools.style.cssText = 'display:flex; gap:4px; margin-left:auto;';
      const small = 'padding:2px 6px; font-size:11px;';
      tools.appendChild(tiBtn(L('⟳ Tot', '⟳ All'), L('Refă TTS din principal » Înspre (prima insignă cu numele ei + max. 2 insigne; fără ce e deja în principal; avertizările la final)', 'Rebuilds TTS from main » Towards (first shield with its name + max. 2 shields; nothing already in main; warnings at the end)'), (b) => tiTtsAction('all', b), small));
      tools.appendChild(tiBtn('+P', L('Transcrie zona principală (unde e cursorul în TTS, altfel la final)', 'Transcribes the main area (at the cursor in TTS, otherwise at the end)'), (b) => tiTtsAction('main', b), small));
      tools.appendChild(tiBtn(L('+Î', '+T'), L('Transcrie „Înspre” (unde e cursorul în TTS, altfel la final)', 'Transcribes "Towards" (at the cursor in TTS, otherwise at the end)'), (b) => tiTtsAction('towards', b), small));
      tools.appendChild(tiBtn('🗑', L('Șterge tot textul TTS', 'Clears all TTS text'), (b) => tiTtsAction('clear', b), small));
      tools.appendChild(tiBtn(L('🔊 Simulare', '🔊 Simulate'), L(`Redă cu vocea WME instrucțiunea completă: „${CT('voice.distance')} virează la dreapta pe …” (după Prompt voce; implicit Waze = după unghi / giratoriu)`, `Plays the full instruction with the WME voice: "${CT('voice.distance')} virează la dreapta pe …" (by Voice prompt; Waze default = by angle / roundabout)`), (b) => tiSimulate(b), small));
      row.appendChild(tools);
    }
  }

  // ---- Drag to reorder chips ("⋮" handle) ----------------------------
  //
  // A small "⋮" grip is prepended to every chip (`span.turn-instruction-
  // item`) of the main and "Înspre" areas. Dragging it moves the chip left
  // or right within the same area: the chip list (React state) is
  // re-ordered through the same hook dispatch as the other tools, so the
  // preview and "Aplică" follow. Chips wrap on several rows, so the drop
  // place is the chip nearest to the pointer (before/after its center).
  // An extra DOM node inside the chip is safe: React only moves/removes the
  // nodes it owns. Re-added by the poll when React re-creates a chip.

  const TI_GRIP_CLASS = 'wme-ro-tools-ti-grip';
  const tiDrag = { active: null };

  // Chip containers in render order: [main, towards].
  function tiChipContainers(panel) {
    return [...panel.querySelectorAll('.panel-content [class*="chips--"]')].slice(0, 2);
  }

  function tiInjectGrips(panel) {
    tiChipContainers(panel).forEach((box) => {
      box.querySelectorAll(':scope > span.turn-instruction-item').forEach((chip) => {
        if (chip.querySelector(`:scope > .${TI_GRIP_CLASS}`)) return;
        const g = document.createElement('span');
        g.className = TI_GRIP_CLASS;
        g.textContent = '⋮';
        g.title = L('Trage ca să muți caseta la stânga / dreapta', 'Drag to move the box left / right');
        g.style.cssText =
          'display:inline-flex; align-items:center; padding:0 3px 0 1px; cursor:grab; opacity:0.55; font:700 14px/1 Arial, sans-serif; user-select:none; touch-action:none;';
        g.addEventListener('pointerdown', tiGripDown);
        chip.insertBefore(g, chip.firstChild);
      });
    });
  }

  function tiDropTarget(chips, x, y) {
    let best = null;
    chips.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      // Rows count more than columns (chips wrap).
      const d = Math.abs(x - cx) + 3 * Math.abs(y - cy);
      if (!best || d < best.d) best = { i, r, d, after: x > cx };
    });
    return best;
  }

  function tiGripDown(ev) {
    if (ev.button !== 0) return;
    const grip = ev.currentTarget;
    const chip = grip.parentElement;
    const panel = tiPanel();
    if (!chip || !panel) return;
    const boxes = tiChipContainers(panel);
    const area = boxes.indexOf(chip.parentElement);
    if (area < 0) return;
    ev.preventDefault();
    ev.stopPropagation();
    const chips = [...chip.parentElement.querySelectorAll(':scope > span.turn-instruction-item')];
    const marker = document.createElement('div');
    marker.style.cssText =
      'position:fixed; z-index:100005; width:3px; border-radius:2px; background:var(--primary, #33ccff); pointer-events:none; display:none;';
    document.body.appendChild(marker);
    chip.style.opacity = '0.45';
    grip.style.cursor = 'grabbing';
    tiDrag.active = { area, chip, chips, from: chips.indexOf(chip), to: null, marker, grip };
    document.addEventListener('pointermove', tiGripMove, true);
    document.addEventListener('pointerup', tiGripUp, true);
    document.addEventListener('keydown', tiGripKey, true);
  }

  function tiGripMove(ev) {
    const d = tiDrag.active;
    if (!d) return;
    ev.preventDefault();
    const t = tiDropTarget(d.chips, ev.clientX, ev.clientY);
    if (!t) return;
    d.to = t.after ? t.i + 1 : t.i;
    const x = t.after ? t.r.right + 1 : t.r.left - 3;
    d.marker.style.left = `${Math.round(x)}px`;
    d.marker.style.top = `${Math.round(t.r.top)}px`;
    d.marker.style.height = `${Math.round(t.r.height)}px`;
    d.marker.style.display = d.to === d.from || d.to === d.from + 1 ? 'none' : 'block';
  }

  function tiGripEnd() {
    const d = tiDrag.active;
    tiDrag.active = null;
    document.removeEventListener('pointermove', tiGripMove, true);
    document.removeEventListener('pointerup', tiGripUp, true);
    document.removeEventListener('keydown', tiGripKey, true);
    if (!d) return null;
    d.marker.remove();
    d.chip.style.opacity = '';
    d.grip.style.cursor = 'grab';
    return d;
  }

  function tiGripKey(ev) {
    if (ev.key === 'Escape') {
      ev.stopPropagation();
      tiGripEnd();
    }
  }

  function tiGripUp(ev) {
    ev.preventDefault();
    const d = tiGripEnd();
    if (!d || d.to == null || d.from < 0) return;
    const to = d.to > d.from ? d.to - 1 : d.to;
    if (to === d.from) return;
    tiMoveChip(d.area, d.from, to, d.chips.length);
  }

  // Moves chip `from` -> `to` in area 0 (main) / 1 (towards); the TTS is
  // rebuilt if it was still automatic. `expectedLen` guards against the
  // DOM and the state being out of sync.
  function tiMoveChip(area, from, to, expectedLen) {
    const ctx = tiCtx();
    if (!ctx) return false;
    const oldV = ctx.visual;
    const oldT = ctx.towards;
    const list = area === 0 ? oldV : oldT;
    if (expectedLen != null && list.length !== expectedLen) return false;
    const arr = [...list];
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    const newV = area === 0 ? arr : oldV;
    const newT = area === 0 ? oldT : arr;
    if (area === 0) ctx.setVisual(arr);
    else ctx.setTowards(arr);
    tiSyncTts(ctx, oldV, oldT, newV, newT, null);
    return true;
  }

  function initTurnInstructionsHelper() {
    setInterval(() => {
      if (!settings.turnInstructionsHelper) return;
      try {
        tiInject();
        const panel = tiPanel();
        if (panel && !tiDrag.active) tiInjectGrips(panel);
        tiScanShields(false);
      } catch (e) {
        // ignore - WME DOM changed
      }
    }, TI_POLL_MS);
  }

  function tiRemoveAll() {
    tiClosePop();
    document.querySelectorAll(`.${TI_BAR_CLASS}, .wme-ro-tools-ti-local, .wme-ro-tools-ti-tts > div:last-child, .${TI_GRIP_CLASS}`).forEach((el) => el.remove());
  }

  // ---------------------------------------------------------------------
  // "Ce e nou" window
  //
  // Once per new version: the VERSION_HISTORY entries newer than the
  // version this browser last saw (localStorage LS_SEEN_VERSION). First
  // run (no saved version) shows the whole history. Bug-fix-only updates
  // have no entries, so no window - the saved version is just updated.
  // ---------------------------------------------------------------------

  const WHATS_NEW_ID = 'wme-ro-tools-whats-new';

  function compareVersions(a, b) {
    const pa = String(a).split('.').map((x) => parseInt(x, 10) || 0);
    const pb = String(b).split('.').map((x) => parseInt(x, 10) || 0);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const d = (pa[i] || 0) - (pb[i] || 0);
      if (d) return d;
    }
    return 0;
  }

  function markVersionSeen() {
    try {
      localStorage.setItem(LS_SEEN_VERSION, SCRIPT_VERSION);
    } catch (e) {
      // ignore
    }
  }

  // `forceFull`: opened from the settings tab - always the whole history.
  function showWhatsNew(forceFull) {
    let seen = null;
    try {
      seen = localStorage.getItem(LS_SEEN_VERSION);
    } catch (e) {
      if (!forceFull) return;
    }
    const firstRun = !seen;
    const fresh = firstRun ? VERSION_HISTORY : VERSION_HISTORY.filter((r) => compareVersions(r.v, seen) > 0);
    if (!forceFull) {
      if (seen && compareVersions(SCRIPT_VERSION, seen) <= 0) return;
      if (!fresh.length) {
        markVersionSeen();
        return;
      }
    }
    const old = document.getElementById(WHATS_NEW_ID);
    if (old) old.remove();
    const t = currentTheme();
    const overlay = document.createElement('div');
    overlay.id = WHATS_NEW_ID;
    overlay.style.cssText =
      'position:fixed; inset:0; z-index:100004; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; padding:16px; box-sizing:border-box;';
    const box = document.createElement('div');
    box.style.cssText = `background:${t.menuBg}; color:${t.menuText}; border:1px solid ${t.menuBorder}; border-radius:8px; box-shadow:0 8px 28px rgba(0,0,0,0.45); width:520px; max-width:100%; max-height:80vh; display:flex; flex-direction:column; padding:16px; box-sizing:border-box; font:13px/1.45 Rubik, Arial, sans-serif;`;
    const title = document.createElement('div');
    title.style.cssText = 'font-weight:600; font-size:15px; margin-bottom:4px;';
    const sub = document.createElement('div');
    sub.style.cssText = 'font-size:12px; opacity:0.75; margin-bottom:10px;';
    // Development warning: shown with the full history (first install,
    // "Changelog complet", settings link).
    const warn = document.createElement('div');
    warn.style.cssText =
      'margin:0 0 10px; padding:8px 10px; border-radius:6px; border:1px solid #f18200; background:rgba(241,130,0,0.12); font-size:12px; line-height:1.4;';
    warn.textContent = `⚠️ ${DEV_WARNING_TEXT}`;
    const fbLink = document.createElement('a');
    fbLink.href = GREASYFORK_FEEDBACK_URL;
    fbLink.target = '_blank';
    fbLink.rel = 'noopener noreferrer';
    fbLink.textContent = 'Feedback';
    fbLink.style.cssText = 'color:inherit; font-weight:600; text-decoration:underline;';
    warn.append(fbLink, '.');
    const list = document.createElement('div');
    list.style.cssText = `overflow:auto; min-height:0; flex:1 1 auto; border:1px solid ${t.menuBorder}; border-radius:6px; padding:8px 12px;`;
    const render = (rows, full) => {
      list.textContent = '';
      warn.style.display = full ? 'block' : 'none';
      title.textContent = firstRun
        ? L(`Bun venit în ${SCRIPT_NAME} ${SCRIPT_VERSION} - istoric versiuni`, `Welcome to ${SCRIPT_NAME} ${SCRIPT_VERSION} - version history`)
        : full
          ? L(`${SCRIPT_NAME} - istoric versiuni`, `${SCRIPT_NAME} - version history`)
          : L(`Ce e nou în ${SCRIPT_NAME} ${SCRIPT_VERSION}`, `What's new in ${SCRIPT_NAME} ${SCRIPT_VERSION}`);
      sub.textContent = full
        ? L(`Versiunea instalată: ${SCRIPT_VERSION}. Doar funcțiile noi; reparațiile mici nu apar aici.`, `Installed version: ${SCRIPT_VERSION}. New features only; small fixes are not listed here.`)
        : L(`Față de versiunea pe care o aveai (${seen}).`, `Compared to the version you had (${seen}).`);
      for (const r of rows) {
        const h = document.createElement('div');
        h.textContent = `v${r.v}`;
        h.style.cssText = 'font-weight:600; margin:6px 0 2px;';
        const ul = document.createElement('ul');
        ul.style.cssText = 'margin:0 0 4px 18px; padding:0;';
        for (const it of r.items) {
          const li = document.createElement('li');
          li.textContent = it;
          li.style.cssText = 'margin:2px 0;';
          ul.appendChild(li);
        }
        list.appendChild(h);
        list.appendChild(ul);
      }
    };
    const showFull = forceFull || firstRun;
    render(showFull ? VERSION_HISTORY : fresh, showFull);
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex; justify-content:flex-end; gap:8px; margin-top:12px;';
    const close = () => {
      overlay.remove();
      document.removeEventListener('keydown', onKey, true);
      markVersionSeen();
    };
    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        ev.stopPropagation();
        close();
      }
    };
    if (!showFull) {
      const full = document.createElement('wz-button');
      full.setAttribute('color', 'secondary');
      full.setAttribute('size', 'sm');
      full.textContent = L('Changelog complet', 'Full changelog');
      full.addEventListener('click', () => {
        render(VERSION_HISTORY, true);
        full.remove();
      });
      actions.appendChild(full);
    }
    const ok = document.createElement('wz-button');
    ok.setAttribute('size', 'sm');
    ok.textContent = L('Am înțeles', 'Got it');
    ok.addEventListener('click', close);
    actions.appendChild(ok);
    box.appendChild(title);
    box.appendChild(sub);
    box.appendChild(warn);
    box.appendChild(list);
    box.appendChild(actions);
    overlay.appendChild(box);
    overlay.addEventListener('mousedown', (ev) => {
      if (ev.target === overlay) close();
    });
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey, true);
  }

  // ---------------------------------------------------------------------
  // Bootstrap (standard pattern used across the project's scripts)
  // ---------------------------------------------------------------------

  // ---------------------------------------------------------------------
  // Clickable GPS coordinates in UR / MP texts (v0.40)
  //
  // Paul: users answer with coordinates either as "44.223232, 23.0909034"
  // or as "45°03'19.8"N 26°25'37.8"E"; a click should center the map there.
  // Text nodes inside the open problem panel are scanned by a poll. The
  // React-owned text node is never removed: it keeps the text before the
  // match and our nodes are inserted after it, so a later React update or
  // unmount can't hit a missing node.
  // ---------------------------------------------------------------------

  const COORD_LINK_CLASS = 'wme-ro-tools-coord-link';
  const COORD_POLL_MS = 800;
  const COORD_MIN_ZOOM = 17;
  // Decimal: two numbers with >= 3 decimals, separated by comma/semicolon/space.
  const COORD_DEC_RE = /(-?\d{1,3}\.\d{3,})\s*[,;]?\s+(-?\d{1,3}\.\d{3,})|(-?\d{1,3}\.\d{3,})\s*[,;]\s*(-?\d{1,3}\.\d{3,})/;
  // DMS: 45°03'19.8"N 26°25'37.8"E (also ′ ″ ’ ” and a comma as decimal sign;
  // seconds optional; hemisphere letter before or after).
  const COORD_DMS_PART = String.raw`(\d{1,3})\s*°\s*(\d{1,2})\s*['′’]\s*(?:(\d{1,2}(?:[.,]\d+)?)\s*(?:["″”]|'')?)?`;
  const COORD_DMS_RE = new RegExp(
    String.raw`([NS])?\s*${COORD_DMS_PART}\s*([NS])?[\s,;]*([EWV])?\s*${COORD_DMS_PART}\s*([EWV])?`,
    'i'
  );

  function coordDmsToDec(d, m, sec) {
    return Number(d) + Number(m) / 60 + (sec ? Number(String(sec).replace(',', '.')) : 0) / 3600;
  }

  // First coordinate pair in `text`: { index, length, lat, lon } or null.
  function coordFind(text) {
    const found = [];
    const dms = COORD_DMS_RE.exec(text);
    if (dms) {
      const latH = (dms[1] || dms[5] || '').toUpperCase();
      const lonH = (dms[6] || dms[10] || '').toUpperCase();
      if (latH && lonH) {
        let lat = coordDmsToDec(dms[2], dms[3], dms[4]);
        let lon = coordDmsToDec(dms[7], dms[8], dms[9]);
        if (latH === 'S') lat = -lat;
        if (lonH === 'W' || lonH === 'V') lon = -lon;
        found.push({ index: dms.index, length: dms[0].length, lat, lon });
      }
    }
    const dec = COORD_DEC_RE.exec(text);
    if (dec) {
      let a = Number(dec[1] ?? dec[3]);
      let b = Number(dec[2] ?? dec[4]);
      // "lon, lat" written the other way round.
      if (Math.abs(a) > 90 && Math.abs(b) <= 90) [a, b] = [b, a];
      // Same for Romania, where the ranges don't overlap (lon 20-30,
      // lat 43-48.5): "26.1025, 44.4355" is clearly lon, lat.
      else if (a >= 20 && a <= 30.5 && b >= 43 && b <= 48.5) [a, b] = [b, a];
      if (Math.abs(a) <= 90 && Math.abs(b) <= 180) found.push({ index: dec.index, length: dec[0].length, lat: a, lon: b });
    }
    if (!found.length) return null;
    found.sort((x, y) => x.index - y.index);
    const r = found[0];
    // Trim spaces / separators captured at either end by the regexes.
    const raw = text.substr(r.index, r.length);
    const lead = raw.length - raw.replace(/^\s+/, '').length;
    r.index += lead;
    r.length = raw.slice(lead).replace(/[\s,;]+$/, '').length;
    return r;
  }

  function coordMakeLink(label, lat, lon) {
    const a = document.createElement('span');
    a.className = COORD_LINK_CLASS;
    a.textContent = label;
    a.title = L(`Centrează harta pe ${lat.toFixed(6)}, ${lon.toFixed(6)}`, `Center the map on ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    a.style.cssText = 'cursor:pointer; text-decoration:underline dotted; text-underline-offset:2px; color:var(--primary, #33ccff);';
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      coordGoTo(lat, lon);
    });
    return a;
  }

  function coordGoTo(lat, lon) {
    try {
      const zoom = sdk.Map.getZoomLevel();
      sdk.Map.setMapCenter({ lonLat: { lon, lat }, zoomLevel: Math.max(zoom, COORD_MIN_ZOOM) });
    } catch (e) {
      console.warn(`${SCRIPT_NAME}: nu am putut centra harta.`, e);
      return;
    }
    // Pulse at the map center (= the point) for a few seconds.
    const mapEl = document.getElementById('WazeMap');
    if (!mapEl) return;
    const r = mapEl.getBoundingClientRect();
    const ring = document.createElement('div');
    ring.style.cssText = `position:fixed; left:${Math.round(r.left + r.width / 2)}px; top:${Math.round(r.top + r.height / 2)}px; width:18px; height:18px; margin:-9px 0 0 -9px; border:3px solid #ff3b30; border-radius:50%; box-shadow:0 0 0 2px rgba(255,255,255,0.8); pointer-events:none; z-index:${OWN_UI_Z_INDEX};`;
    getMapOverlayContainer().appendChild(ring);
    try {
      ring.animate(
        [
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(2.6)', opacity: 0.15 },
        ],
        { duration: 900, iterations: 4 }
      );
    } catch (e) {
      // no Web Animations - the static ring is enough
    }
    setTimeout(() => ring.remove(), 3700);
  }

  function coordLinkifyTextNode(node) {
    let current = node;
    let guard = 0;
    while (current && guard++ < 20) {
      const text = current.data;
      const m = coordFind(text);
      if (!m) return;
      const label = text.substr(m.index, m.length);
      const after = text.slice(m.index + m.length);
      // Keep the original node (React's reference) with the text before.
      current.data = text.slice(0, m.index);
      const link = coordMakeLink(label, m.lat, m.lon);
      current.parentNode.insertBefore(link, current.nextSibling);
      if (!after) return;
      const rest = document.createTextNode(after);
      link.parentNode.insertBefore(rest, link.nextSibling);
      current = rest;
    }
  }

  const COORD_SKIP_SELECTOR = `form, textarea, input, wz-textarea, button, wz-button, a, script, style, .${COORD_LINK_CLASS}`;

  function coordPoll() {
    if (!settings.urCoordLinks) return;
    // The UR / MP window is a floating card (`#ISSUE_WINDOW_...`), not in
    // `#panel-container`.
    document.querySelectorAll('.problem-edit').forEach(coordScanPanel);
  }

  function coordScanPanel(panel) {
    // Cheap pre-check on the whole text before walking nodes.
    const all = panel.textContent || '';
    if (!/\d\.\d{3,}|°/.test(all)) return;
    const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.data || n.data.length < 7) return NodeFilter.FILTER_REJECT;
        const el = n.parentElement;
        if (!el || el.closest(COORD_SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
        return /\d\.\d{3,}|°/.test(n.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(coordLinkifyTextNode);
  }

  function coordUnlinkAll() {
    document.querySelectorAll(`.${COORD_LINK_CLASS}`).forEach((a) => {
      a.replaceWith(document.createTextNode(a.textContent));
    });
  }

  // ---------------------------------------------------------------------
  // Edit suggestions helper (v0.44, Paul): for a map edit suggestion
  // ("Sugestie hartă" window, `#ISSUE_WINDOW_MAP_SUGGESTION`):
  // - "Analiză modificări" panel: every proposed change with a status
  //   (correct / wrong / I'll redo it), an explanation box and, where it can
  //   be reproduced, "Aplică" (road type, primary street name, added house
  //   number) - an ordinary UNSAVED edit, reviewed before Save;
  // - the native rejection dialog gets bigger, a list of the changes to
  //   insert at the cursor, "Inserează analiza" and a per-suggestion draft
  //   (the native "Anulează" closes the whole suggestion window and loses
  //   the text);
  // - after rejecting, the analysis panel reopens from a snapshot so the
  //   good changes can still be applied.
  // Data: the React props of the suggestion window (`suggestionChanges`,
  // `editSuggestion`) - display names, old / new values, segment, and for
  // house numbers the number + position. Nothing is sent to Waze by the
  // script: the rejection itself is always the native button.
  // ---------------------------------------------------------------------
  const ES_PANEL_SEL = '#ISSUE_WINDOW_MAP_SUGGESTION';
  const ES_DIALOG_SEL = 'wz-dialog.suggestion-rejection-dialog';
  const ES_ANALYSIS_ID = 'wme-ro-tools-es-analysis';
  const ES_BAR_CLASS = 'wme-ro-tools-es-bar';
  const ES_DLG_BOX_CLASS = 'wme-ro-tools-es-dlg';
  const LS_ES_DRAFTS = 'wme-ro-tools.esDrafts';
  const ES_DRAFT_MAX_AGE_MS = 30 * 24 * 3600 * 1000;
  const ES_POLL_MS = 500;

  const esState = {
    lastCtx: null, // last read suggestion context (kept while the dialog is open)
    dialogEl: null, // enhanced dialog
    pendingApplyId: null, // suggestion rejected - reopen the analysis after the window closes
  };

  function esLoadDrafts() {
    try {
      const all = JSON.parse(localStorage.getItem(LS_ES_DRAFTS) || '{}') || {};
      const now = Date.now();
      Object.keys(all).forEach((k) => {
        if (!all[k] || now - (all[k].at || 0) > ES_DRAFT_MAX_AGE_MS) delete all[k];
      });
      return all;
    } catch (e) {
      return {};
    }
  }

  function esDraft(esId) {
    const all = esLoadDrafts();
    return all[esId] || { at: Date.now(), msg: '', statuses: {}, notes: {}, applied: {} };
  }

  function esSaveDraft(esId, d) {
    const all = esLoadDrafts();
    d.at = Date.now();
    all[esId] = d;
    try {
      localStorage.setItem(LS_ES_DRAFTS, JSON.stringify(all));
    } catch (e) {
      // storage full / unavailable - the draft lives only in memory
    }
  }

  function esFiber(el) {
    const k = el && Object.keys(el).find((x) => x.startsWith('__reactFiber'));
    return k ? el[k] : null;
  }

  // Reads the open suggestion window: { esId, author, items } or null.
  function esReadPanel() {
    const panel = document.querySelector(ES_PANEL_SEL);
    if (!panel) return null;
    const lis = [...panel.querySelectorAll('wz-list-item')].filter((li) => li.querySelector('[class*="description--"]'));
    let f = esFiber(lis[0] || panel.querySelector('form'));
    let changes = null;
    let es = null;
    for (let i = 0; i < 40 && f; i++) {
      const p = f.memoizedProps || {};
      if (!changes && Array.isArray(p.suggestionChanges)) changes = p.suggestionChanges;
      if (!es && p.editSuggestion && p.editSuggestion.attributes) es = p.editSuggestion;
      if (changes && es) break;
      f = f.return;
    }
    if (!changes || !es) return null;
    const items = [];
    changes.forEach((c, ci) => {
      const li = lis[ci];
      const locEl = li && li.querySelector('[class*="link--"]');
      const loc = locEl ? locEl.textContent.trim() : '';
      const ff = (c.focusedFeatures || [])[0];
      const segFromFeature = ff && ff.attributes && ff.attributes.id;
      (c.attributeChanges || []).forEach((a, ai) => {
        const it = {
          key: `${c.suggestionId || ci}:${a.id || ai}`,
          label: String(a.displayName || a.name || '').trim(),
          oldText: a.oldValue == null ? '' : String(a.oldValue),
          newText: a.newValue == null ? '' : String(a.newValue),
          loc,
          kind: null,
        };
        if (a.objectType === 'segment' && a.name === 'roadType' && typeof a.newValueRaw === 'number') {
          it.kind = 'roadType';
          it.segmentId = segFromFeature;
          it.roadType = a.newValueRaw;
        } else if (a.objectType === 'segment' && a.name === 'primaryStreetID' && it.newText) {
          it.kind = 'street';
          it.segmentId = segFromFeature;
          const k = it.newText.lastIndexOf(', ');
          it.streetName = k >= 0 ? it.newText.slice(0, k).trim() : it.newText.trim();
          it.cityName = k >= 0 ? it.newText.slice(k + 2).trim() : '';
        } else if (a.objectType === 'houseNumber' && a.name === 'ADD' && a.newValueRaw && a.newValueRaw.attributes) {
          const h = a.newValueRaw.attributes;
          const pt = h.geoJSONGeometry || h.fractionPoint;
          if (h.number && h.segID && pt && pt.coordinates) {
            it.kind = 'hnAdd';
            it.segmentId = h.segID;
            it.hnNumber = String(h.number);
            it.hnPoint = { type: 'Point', coordinates: pt.coordinates.slice(0, 2) };
          }
        }
        if (it.kind && !it.segmentId) it.kind = null;
        items.push(it);
      });
    });
    const at = es.attributes;
    // The suggester's name is only in the window header ("Sursa: <name>");
    // `createdBy` is a numeric user id.
    const who = panel.querySelector('wz-caption wz-a');
    return {
      esId: at.id,
      author: (who && who.textContent.trim()) || '',
      items,
    };
  }

  function esItemLine(it) {
    if (it.oldText && it.newText) return `${it.label}: ${it.oldText} → ${it.newText}`;
    if (it.newText) return `${it.label}: ${it.newText}`;
    return it.label;
  }

  const ES_STATUS = {
    ok: { icon: '✔', ct: 'es.ok', color: '#2db84c', label: () => L('Corectă', 'Correct') },
    bad: { icon: '✖', ct: 'es.bad', color: '#e5484d', label: () => L('Greșită', 'Wrong') },
    redo: { icon: '↻', ct: 'es.redo', color: '#f18200', label: () => L('O refac eu', "I'll redo it") },
  };

  // Plain-text message (it is delivered by e-mail; no formatting needed).
  function esComposeMessage(ctx, d) {
    const parts = [];
    const intro = CT('es.intro');
    if (intro) parts.push(intro);
    ctx.items.forEach((it) => {
      const st = d.statuses[it.key];
      const note = String(d.notes[it.key] || '').trim();
      if (!st && !note) return;
      const lines = [`• ${esItemLine(it)}`];
      const head = st ? `${ES_STATUS[st].icon} ${CT(ES_STATUS[st].ct)}` : '';
      lines.push(`  ${[head, note].filter(Boolean).join(': ')}`);
      parts.push(lines.join('\n'));
    });
    const outro = CT('es.outro');
    if (outro) parts.push(outro);
    return parts.join('\n\n');
  }

  // --- applying a change (unsaved edit) ---------------------------------
  function esApply(it) {
    let seg = null;
    try {
      seg = sdk.DataModel.Segments.getById({ segmentId: Number(it.segmentId) });
    } catch (e) {
      seg = null;
    }
    if (!seg) throw new Error(L('Segmentul nu e încărcat - du harta în zona sugestiei.', 'The segment is not loaded - move the map to the suggestion area.'));
    if (it.kind === 'roadType') {
      sdk.DataModel.Segments.updateSegment({ segmentId: seg.id, roadType: it.roadType });
      return;
    }
    if (it.kind === 'street') {
      const cur = seg.primaryStreetId != null ? sdk.DataModel.Streets.getById({ streetId: seg.primaryStreetId }) : null;
      const curCity = cur && cur.cityId != null ? sdk.DataModel.Cities.getById({ cityId: cur.cityId }) : null;
      const where = curCity ? { countryId: curCity.countryId, stateId: curCity.stateId } : {};
      let city = sdk.DataModel.Cities.getCity({ cityName: it.cityName || '', ...where });
      if (!city) city = sdk.DataModel.Cities.addCity({ cityName: it.cityName || '', ...where });
      if (!city) throw new Error(L('Nu am găsit localitatea.', 'City not found.'));
      let street = sdk.DataModel.Streets.getStreet({ streetName: it.streetName, cityId: city.id });
      if (!street) street = sdk.DataModel.Streets.addStreet({ streetName: it.streetName, cityId: city.id });
      sdk.DataModel.Segments.updateAddress({ segmentId: seg.id, primaryStreetId: street.id });
      return;
    }
    if (it.kind === 'hnAdd') {
      sdk.DataModel.HouseNumbers.addHouseNumber({ number: it.hnNumber, point: it.hnPoint, segmentId: seg.id });
      return;
    }
    throw new Error(L('Modificarea nu se poate reproduce automat.', 'This change cannot be reproduced automatically.'));
  }

  // --- analysis panel ---------------------------------------------------
  function esCloseAnalysis() {
    const el = document.getElementById(ES_ANALYSIS_ID);
    if (el) el.remove();
  }

  // `ctx`: live context or a snapshot ({esId, author, items}); `afterReject`
  // switches the texts to the "already rejected - apply the good ones" mode.
  function esOpenAnalysis(ctx, afterReject) {
    esCloseAnalysis();
    const t = currentTheme();
    const d = esDraft(ctx.esId);
    d.snapshot = { esId: ctx.esId, author: ctx.author, items: ctx.items };
    esSaveDraft(ctx.esId, d);

    const box = document.createElement('div');
    box.id = ES_ANALYSIS_ID;
    const panel = document.querySelector(ES_PANEL_SEL);
    const pr = panel ? panel.getBoundingClientRect() : null;
    const left = pr ? Math.min(window.innerWidth - 420, pr.right + 10) : 80;
    const top = pr ? Math.max(50, pr.top) : 60;
    box.style.cssText = `position:fixed; left:${Math.max(8, left)}px; top:${top}px; width:400px; max-width:calc(100vw - 16px); max-height:calc(100vh - ${top + 16}px); z-index:100002; display:flex; flex-direction:column; background:${t.menuBg}; color:${t.menuText}; border:1px solid ${t.menuBorder}; border-radius:8px; box-shadow:0 8px 28px rgba(0,0,0,0.45); font:13px/1.4 Rubik, Arial, sans-serif;`;

    const head = document.createElement('div');
    head.style.cssText = `display:flex; align-items:center; gap:8px; padding:10px 12px; border-bottom:1px solid ${t.menuBorder}; cursor:move;`;
    const title = document.createElement('div');
    title.style.cssText = 'font-weight:600; flex:1;';
    title.textContent = afterReject
      ? L('Sugestie respinsă - aplică modificările bune', 'Rejected suggestion - apply the good changes')
      : L('Analiză modificări propuse', 'Proposed changes - review');
    const x = document.createElement('span');
    x.textContent = '✕';
    x.title = L('Închide (analiza rămâne salvată)', 'Close (the review stays saved)');
    x.style.cssText = 'cursor:pointer; opacity:0.7; padding:0 4px;';
    x.addEventListener('click', esCloseAnalysis);
    head.append(title, x);
    // Drag by the header.
    head.addEventListener('pointerdown', (ev) => {
      if (ev.target === x) return;
      const r0 = box.getBoundingClientRect();
      const dx = ev.clientX - r0.left;
      const dy = ev.clientY - r0.top;
      const mv = (e) => {
        box.style.left = `${Math.max(0, e.clientX - dx)}px`;
        box.style.top = `${Math.max(0, e.clientY - dy)}px`;
      };
      const up = () => {
        document.removeEventListener('pointermove', mv, true);
        document.removeEventListener('pointerup', up, true);
      };
      document.addEventListener('pointermove', mv, true);
      document.addEventListener('pointerup', up, true);
    });

    const sub = document.createElement('div');
    sub.style.cssText = 'font-size:11px; opacity:0.75; padding:6px 12px 0;';
    sub.textContent = afterReject
      ? L('„Aplică” face modificarea pe hartă (nesalvată) - o verifici și apoi apeși Salvează.', '"Apply" makes the change on the map (unsaved) - check it, then press Save.')
      : L(`Pentru fiecare modificare a lui ${ctx.author || 'utilizator'}: alege starea și scrie explicația. Apoi „Respinge cu acest mesaj”.`, `For each change by ${ctx.author || 'the user'}: pick a status and write the explanation. Then "Reject with this message".`);

    const list = document.createElement('div');
    list.style.cssText = 'overflow:auto; padding:6px 12px 10px; flex:1 1 auto; min-height:0;';
    const save = () => esSaveDraft(ctx.esId, d);

    ctx.items.forEach((it) => {
      const row = document.createElement('div');
      row.style.cssText = `border:1px solid ${t.menuBorder}; border-radius:6px; padding:8px; margin-top:8px;`;
      const h = document.createElement('div');
      h.style.cssText = 'font-weight:600;';
      h.textContent = it.label;
      const vals = document.createElement('div');
      vals.style.cssText = 'font-size:12px; margin-top:2px;';
      if (it.oldText) {
        const o = document.createElement('span');
        o.textContent = it.oldText;
        o.style.cssText = 'text-decoration:line-through; opacity:0.65; margin-right:6px;';
        vals.appendChild(o);
      }
      if (it.newText) {
        const n = document.createElement('span');
        n.textContent = `${it.oldText ? '→ ' : ''}${it.newText}`;
        n.style.cssText = 'color:#2db84c;';
        vals.appendChild(n);
      }
      const loc = document.createElement('div');
      loc.style.cssText = 'font-size:11px; opacity:0.6;';
      loc.textContent = it.loc;
      const sts = document.createElement('div');
      sts.style.cssText = 'display:flex; gap:4px; flex-wrap:wrap; margin-top:6px;';
      const stBtns = {};
      const paint = () => {
        Object.entries(stBtns).forEach(([k, b]) => {
          const on = d.statuses[it.key] === k;
          b.style.background = on ? ES_STATUS[k].color : 'transparent';
          b.style.color = on ? '#fff' : t.menuText;
          b.style.borderColor = ES_STATUS[k].color;
        });
      };
      Object.keys(ES_STATUS).forEach((k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = `${ES_STATUS[k].icon} ${ES_STATUS[k].label()}`;
        b.style.cssText = 'font-size:11px; padding:1px 7px; border:1px solid; border-radius:10px; cursor:pointer; background:transparent;';
        b.addEventListener('click', () => {
          d.statuses[it.key] = d.statuses[it.key] === k ? undefined : k;
          if (!d.statuses[it.key]) delete d.statuses[it.key];
          save();
          paint();
        });
        stBtns[k] = b;
        sts.appendChild(b);
      });
      paint();
      const ta = document.createElement('textarea');
      ta.rows = 2;
      ta.placeholder = L('Explicație pentru utilizator…', 'Explanation for the user…');
      ta.value = d.notes[it.key] || '';
      ta.style.cssText = `width:100%; box-sizing:border-box; margin-top:6px; font:12px/1.4 Rubik, Arial, sans-serif; resize:vertical; background:transparent; color:${t.menuText}; border:1px solid ${t.menuBorder}; border-radius:4px; padding:4px 6px;`;
      ta.addEventListener('input', () => {
        d.notes[it.key] = ta.value;
        save();
      });
      ta.addEventListener('keydown', (ev) => ev.stopPropagation()); // no WME shortcuts while typing
      row.append(h, vals, loc, sts, ta);
      if (it.kind) {
        const ap = document.createElement('div');
        ap.style.cssText = 'display:flex; align-items:center; gap:8px; margin-top:6px;';
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = L('Aplică pe hartă', 'Apply on the map');
        b.title = L('Face modificarea ca editare nesalvată (anulabilă cu Undo).', 'Makes the change as an unsaved edit (Undo works).');
        b.style.cssText = `font-size:11px; padding:2px 8px; cursor:pointer; background:transparent; color:${t.menuText}; border:1px solid #0099ff; border-radius:4px;`;
        const stTxt = document.createElement('span');
        stTxt.style.cssText = 'font-size:11px; opacity:0.8;';
        if (d.applied[it.key]) stTxt.textContent = L('✓ aplicată', '✓ applied');
        b.addEventListener('click', () => {
          try {
            esApply(it);
            d.applied[it.key] = Date.now();
            save();
            stTxt.textContent = L('✓ aplicată (nesalvată)', '✓ applied (unsaved)');
          } catch (e) {
            console.warn(`${SCRIPT_NAME}: aplicarea modificării a eșuat.`, e);
            stTxt.textContent = `⚠ ${e && e.message ? e.message : L('eroare', 'error')}`;
          }
        });
        ap.append(b, stTxt);
        row.appendChild(ap);
      }
      list.appendChild(row);
    });

    const foot = document.createElement('div');
    foot.style.cssText = `display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; padding:10px 12px; border-top:1px solid ${t.menuBorder};`;
    const fbtn = (text, primary, fn, tip) => {
      const b = document.createElement('wz-button');
      b.setAttribute('size', 'sm');
      if (!primary) b.setAttribute('color', 'secondary');
      b.textContent = text;
      if (tip) b.title = tip;
      b.addEventListener('click', fn);
      foot.appendChild(b);
      return b;
    };
    fbtn(L('Copiază mesajul', 'Copy message'), false, async () => {
      const msg = esComposeMessage(ctx, d);
      try {
        await navigator.clipboard.writeText(msg);
        phShowToast(L('Mesajul a fost copiat.', 'Message copied.'));
      } catch (e) {
        window.prompt(L('Copiază mesajul:', 'Copy the message:'), msg);
      }
    });
    if (!afterReject && document.querySelector(ES_PANEL_SEL)) {
      fbtn(L('Respinge cu acest mesaj', 'Reject with this message'), true, () => {
        d.msg = esComposeMessage(ctx, d);
        save();
        esCloseAnalysis();
        const panelEl = document.querySelector(ES_PANEL_SEL);
        const rej = panelEl && [...panelEl.querySelectorAll('wz-button')].find((b) => b.getAttribute('type') !== 'submit' && /Respinge|Reject/i.test(b.textContent));
        if (rej) rej.click();
        else phShowToast(L('Nu am găsit butonul Respinge.', 'Reject button not found.'), true);
      }, L('Deschide fereastra de respingere cu mesajul compus din analiză (îl poți modifica acolo).', 'Opens the rejection dialog with the message built from the review (you can edit it there).'));
    }
    box.append(head, sub, list, foot);
    document.body.appendChild(box);
  }

  // --- button in the suggestion window ----------------------------------
  function esInjectBar(ctx) {
    const panel = document.querySelector(ES_PANEL_SEL);
    if (!panel || panel.querySelector(`.${ES_BAR_CLASS}`)) return;
    const rej = [...panel.querySelectorAll('wz-button')].find((b) => b.getAttribute('type') !== 'submit' && /Respinge|Reject/i.test(b.textContent));
    const footer = rej && rej.parentElement;
    if (!footer) return;
    const bar = document.createElement('div');
    bar.className = ES_BAR_CLASS;
    bar.style.cssText = 'display:flex; justify-content:center; padding:6px 0 4px; width:100%;';
    const b = document.createElement('wz-button');
    b.setAttribute('size', 'sm');
    b.setAttribute('color', 'secondary');
    const n = ctx.items.length;
    const dr = esLoadDrafts()[ctx.esId];
    const started = dr && (Object.keys(dr.statuses || {}).length || Object.values(dr.notes || {}).some((v) => String(v).trim()));
    b.textContent = `📝 ${L('Analiză modificări', 'Review changes')} (${n})${started ? ' •' : ''}`;
    b.title = L('Fiecare modificare propusă, cu stare, explicație și „Aplică pe hartă”.', 'Each proposed change, with status, explanation and "Apply on the map".');
    b.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const c = esReadPanel();
      if (c) esOpenAnalysis(c, false);
    });
    bar.appendChild(b);
    footer.parentElement.insertBefore(bar, footer);
  }

  // --- native rejection dialog ------------------------------------------
  function esTextarea(dlg) {
    const w = dlg.querySelector('wz-textarea');
    const inner = w && w.shadowRoot && w.shadowRoot.querySelector('textarea');
    return { w, inner };
  }

  function esSetText(w, value) {
    w.value = value;
    w.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    w.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  function esEnhanceDialog(dlg, ctx) {
    if (dlg.querySelector(`.${ES_DLG_BOX_CLASS}`)) return;
    esState.dialogEl = dlg;
    dlg.setAttribute('size', 'xl');
    const { w, inner } = esTextarea(dlg);
    if (!w) return;
    if (w.shadowRoot && !w.shadowRoot.querySelector('style[data-ro-tools]')) {
      const st = document.createElement('style');
      st.setAttribute('data-ro-tools', '1');
      st.textContent = 'textarea{min-height:240px!important;resize:vertical!important}';
      w.shadowRoot.appendChild(st);
    }
    const d = esDraft(ctx.esId);
    d.snapshot = { esId: ctx.esId, author: ctx.author, items: ctx.items };
    esSaveDraft(ctx.esId, d);
    // Restore the draft (the native dialog always starts empty).
    if (!String(w.value || '').trim() && d.msg) esSetText(w, d.msg);

    const t = currentTheme();
    const box = document.createElement('div');
    box.className = ES_DLG_BOX_CLASS;
    box.style.cssText = 'margin-top:8px; font:12px/1.4 Rubik, Arial, sans-serif;';
    const cap = document.createElement('div');
    cap.style.cssText = 'opacity:0.75; margin-bottom:4px;';
    cap.textContent = L('Modificări propuse - click inserează la cursor (✓ = deja în text):', 'Proposed changes - click inserts at the cursor (✓ = already in the text):');
    const chips = document.createElement('div');
    chips.style.cssText = 'display:flex; flex-direction:column; gap:3px;';
    const chipEls = [];
    const refreshUsed = () => {
      const val = String(w.value || '');
      chipEls.forEach(({ el, it }) => {
        const used = val.includes(esItemLine(it));
        el.firstChild.textContent = used ? '✓ ' : '+ ';
        el.style.opacity = used ? '0.6' : '1';
      });
    };
    ctx.items.forEach((it) => {
      const el = document.createElement('div');
      el.style.cssText = `cursor:pointer; padding:3px 8px; border:1px solid ${t.menuBorder}; border-radius:4px;`;
      const mark = document.createElement('span');
      const txt = document.createElement('span');
      txt.textContent = esItemLine(it);
      el.append(mark, txt);
      el.title = it.loc;
      el.addEventListener('mousedown', (ev) => ev.preventDefault()); // keep the caret in the textarea
      el.addEventListener('click', () => {
        const val = String(w.value || '');
        const pos = inner && typeof inner.selectionStart === 'number' && document.activeElement === w ? inner.selectionStart : val.length;
        const before = val.slice(0, pos);
        const after = val.slice(pos);
        const ins = `${before && !before.endsWith('\n') ? '\n\n' : ''}• ${esItemLine(it)}\n  `;
        esSetText(w, before + ins + after);
        if (inner) {
          inner.focus();
          const c = (before + ins).length;
          inner.setSelectionRange(c, c);
        }
        refreshUsed();
      });
      chipEls.push({ el, it });
      chips.appendChild(el);
    });
    const btns = document.createElement('div');
    btns.style.cssText = 'display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;';
    const mk = (text, fn, tip) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      if (tip) b.title = tip;
      b.style.cssText = `font-size:11px; padding:2px 8px; cursor:pointer; background:transparent; color:inherit; border:1px solid ${t.menuBorder}; border-radius:4px;`;
      b.addEventListener('click', fn);
      btns.appendChild(b);
    };
    mk(L('Inserează analiza', 'Insert the review'), () => {
      const msg = esComposeMessage(ctx, esDraft(ctx.esId));
      if (!msg) {
        phShowToast(L('Analiza e goală - deschide „Analiză modificări”.', 'The review is empty - open "Review changes".'), true);
        return;
      }
      const val = String(w.value || '').trim();
      esSetText(w, val ? `${val}\n\n${msg}` : msg);
      refreshUsed();
    }, L('Adaugă mesajul compus din panoul „Analiză modificări”.', 'Adds the message built in the "Review changes" panel.'));
    mk(L('Golește', 'Clear'), () => {
      esSetText(w, '');
      refreshUsed();
    });
    const note = document.createElement('span');
    note.style.cssText = 'opacity:0.6; align-self:center;';
    note.textContent = L('Textul se păstrează dacă închizi fereastra.', 'The text is kept if you close the window.');
    btns.appendChild(note);
    box.append(cap, chips, btns);
    w.parentElement.appendChild(box);
    refreshUsed();

    // Draft: save every change of the text.
    w.addEventListener('input', () => {
      const dd = esDraft(ctx.esId);
      dd.msg = String(w.value || '');
      esSaveDraft(ctx.esId, dd);
      refreshUsed();
    });
    // The native "Respinge" of the dialog: remember to offer "Apply" after.
    const rejBtn = [...dlg.querySelectorAll('wz-dialog-controls wz-button')].find((b) => /Respinge|Reject/i.test(b.textContent));
    if (rejBtn) {
      rejBtn.addEventListener(
        'click',
        () => {
          const dd = esDraft(ctx.esId);
          dd.msg = String(w.value || '');
          dd.rejectedAt = Date.now();
          esSaveDraft(ctx.esId, dd);
          esState.pendingApplyId = ctx.esId;
        },
        true
      );
    }
  }

  function esPoll() {
    if (!settings.editSuggestionHelper) return;
    const panel = document.querySelector(ES_PANEL_SEL);
    if (panel) {
      const ctx = esReadPanel();
      if (ctx && ctx.items.length) {
        esState.lastCtx = ctx;
        esInjectBar(ctx);
      }
    }
    const dlg = document.querySelector(ES_DIALOG_SEL);
    if (dlg && esState.lastCtx) esEnhanceDialog(dlg, esState.lastCtx);
    // After a rejection: once the dialog and the window are gone, offer the
    // good changes (only if any can be applied).
    if (esState.pendingApplyId && !dlg && !panel) {
      const id = esState.pendingApplyId;
      esState.pendingApplyId = null;
      const d = esLoadDrafts()[id];
      if (d && d.snapshot && d.snapshot.items.some((it) => it.kind)) esOpenAnalysis(d.snapshot, true);
    }
  }

  // ---------------------------------------------------------------------
  // Update check (v0.43, Paul: "verifică la deschidere dacă există versiune
  // nouă pe greasyfork; dacă există, buton de deschidere actualizare").
  // Reads @version from the Greasy Fork meta file through
  // GM_xmlhttpRequest (the WME CSP blocks fetch to greasyfork.org). At most
  // once every UPDATE_CHECK_EVERY_MS, unless forced from the settings tab.
  // A version the user dismissed ("Mai târziu") is not shown again.
  // ---------------------------------------------------------------------
  const GREASYFORK_META_URL = 'https://update.greasyfork.org/scripts/601073/WME%20RO%20Tools.meta.js';
  const GREASYFORK_INSTALL_URL = 'https://update.greasyfork.org/scripts/601073/WME%20RO%20Tools.user.js';
  const UPDATE_CHECK_EVERY_MS = 6 * 3600 * 1000;
  const LS_UPDATE_CHECK = 'wme-ro-tools.updateCheck'; // { at, latest, dismissed }
  const UPDATE_BANNER_ID = 'wme-ro-tools-update-banner';

  function updateLoadState() {
    try {
      return JSON.parse(localStorage.getItem(LS_UPDATE_CHECK) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function updateSaveState(st) {
    try {
      localStorage.setItem(LS_UPDATE_CHECK, JSON.stringify(st));
    } catch (e) {
      // storage unavailable - check again next time
    }
  }

  // Resolves with the latest version string from Greasy Fork, or null.
  function updateFetchLatest() {
    return new Promise((resolve) => {
      const done = (text) => {
        const m = /@version\s+(\S+)/.exec(String(text || ''));
        resolve(m ? m[1] : null);
      };
      const url = `${GREASYFORK_META_URL}?t=${Date.now()}`;
      if (typeof GM_xmlhttpRequest === 'function') {
        try {
          GM_xmlhttpRequest({
            method: 'GET',
            url,
            timeout: 15000,
            headers: { 'Cache-Control': 'no-cache' },
            onload: (r) => done(r.status === 200 ? r.responseText : null),
            onerror: () => resolve(null),
            ontimeout: () => resolve(null),
          });
          return;
        } catch (e) {
          // fall through to fetch
        }
      }
      // Without GM_xmlhttpRequest (another manager / grant none) the WME CSP
      // usually blocks this - then there is simply no check.
      fetch(url, { cache: 'no-store', credentials: 'omit' })
        .then((r) => (r.ok ? r.text() : null))
        .then(done)
        .catch(() => resolve(null));
    });
  }

  function updateShowBanner(latest) {
    const old = document.getElementById(UPDATE_BANNER_ID);
    if (old) old.remove();
    const t = currentTheme();
    const box = document.createElement('div');
    box.id = UPDATE_BANNER_ID;
    box.style.cssText = `position:fixed; top:56px; left:50%; transform:translateX(-50%); z-index:100003; display:flex; align-items:center; gap:10px; flex-wrap:wrap; max-width:calc(100vw - 32px); box-sizing:border-box; padding:10px 14px; border-radius:8px; background:${t.menuBg}; color:${t.menuText}; border:1px solid #2db84c; box-shadow:0 6px 20px rgba(0,0,0,0.4); font:13px/1.4 Rubik, Arial, sans-serif;`;
    const txt = document.createElement('span');
    txt.textContent = L(
      `🔄 ${SCRIPT_NAME} ${latest} e disponibil (ai ${SCRIPT_VERSION}).`,
      `🔄 ${SCRIPT_NAME} ${latest} is available (you have ${SCRIPT_VERSION}).`
    );
    const mkBtn = (text, primary, onClick, title) => {
      const b = document.createElement('wz-button');
      b.setAttribute('size', 'sm');
      if (!primary) b.setAttribute('color', 'secondary');
      b.textContent = text;
      if (title) b.title = title;
      b.addEventListener('click', onClick);
      return b;
    };
    const close = () => box.remove();
    box.append(
      txt,
      mkBtn(L('Actualizează', 'Update'), true, () => {
        window.open(GREASYFORK_INSTALL_URL, '_blank', 'noopener');
        close();
      }, L('Deschide actualizarea în Tampermonkey; după instalare, reîncarcă WME.', 'Opens the update in Tampermonkey; reload WME after installing.')),
      mkBtn(L('Ce e nou', "What's new"), false, () => {
        window.open(GREASYFORK_URL, '_blank', 'noopener');
      }),
      mkBtn(L('Mai târziu', 'Later'), false, () => {
        const st = updateLoadState();
        st.dismissed = latest;
        updateSaveState(st);
        close();
      }, L('Nu mai arăta pentru această versiune', "Don't show again for this version"))
    );
    document.body.appendChild(box);
  }

  // `force`: from the settings tab - ignores the interval and a dismissed
  // version; reports the result through `onResult(latest|null)`.
  async function updateCheck(force, onResult) {
    if (!force && !settings.updateCheck) return;
    const st = updateLoadState();
    if (!force && st.at && Date.now() - st.at < UPDATE_CHECK_EVERY_MS) {
      // Recent check: show again only a newer, not dismissed version.
      if (st.latest && compareVersions(st.latest, SCRIPT_VERSION) > 0 && st.dismissed !== st.latest) {
        updateShowBanner(st.latest);
      }
      return;
    }
    const latest = await updateFetchLatest();
    if (onResult) onResult(latest);
    if (!latest) return;
    st.at = Date.now();
    st.latest = latest;
    updateSaveState(st);
    if (compareVersions(latest, SCRIPT_VERSION) > 0 && (force || st.dismissed !== latest)) {
      updateShowBanner(latest);
    }
  }

  async function init() {
    sdk = window.getWmeSdk({ scriptId: SCRIPT_ID, scriptName: SCRIPT_NAME });
    await sdk.Events.once({ eventName: 'wme-ready' });

    settings = loadSettings();
    await buildSettingsTab();
    attachSegmentAutomation();
    registerCutShortcut();
    if (settings.forceSidebarOpen) startForceSidebarOpenWatchdog();
    if (settings.unpublishedSegmentsWarning) startUnpublishedWarnWatchdog();
    initIssueTrackerMapAll();
    initLocationLabelFix();
    initUnpublishedWarnPassthrough();
    initSavedWarnings();
    initShortcutsAndLayerButtons();
    initTurnInstructionsHelper();

    setInterval(checkSelection, SELECTION_POLL_MS);
    setInterval(() => {
      try {
        publishSidebarRefresh();
      } catch (e) {
        // sidebar not ready - next tick
      }
    }, 700);
    setInterval(urBulkPoll, UR_FORM_POLL_MS);
    setInterval(coordPoll, COORD_POLL_MS);

    setTimeout(() => showWhatsNew(false), 3000);
    setTimeout(() => updateCheck(false), 8000);
    setInterval(esPoll, ES_POLL_MS);

    console.log(`${SCRIPT_NAME} v${SCRIPT_VERSION}: pornit.`);
  }

  function bootstrap() {
    if (!window.SDK_INITIALIZED) {
      console.error(`${SCRIPT_NAME}: window.SDK_INITIALIZED indisponibil - scriptul nu poate porni.`);
      return;
    }
    window.SDK_INITIALIZED.then(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})(typeof unsafeWindow !== 'undefined' ? unsafeWindow : window);
