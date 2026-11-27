# WME RO Tools

**A Waze Map Editor (WME) toolkit built for the Romanian Waze editing community.**

> ⚠️ **Work in progress.** This script is in active development and testing, and is aimed at the Waze community in Romania. Features can change between versions and some may still have bugs. Always review your edits before saving. Feedback and bug reports are welcome on the [Greasy Fork Feedback page](https://greasyfork.org/scripts/601073-wme-ro-tools/feedback) or in [GitHub Issues](https://github.com/spookyx-pd/wme-ro-tools/issues).

The interface is available in **Romanian and English**: it follows the WME language automatically, and you can also choose *Auto / Română / English* at the top of the settings tab. Texts that end up on the map or in the Waze app (turn TTS, warnings, Romanian road shields, UR reply separators) always stay in Romanian. Every feature can be turned on or off from the script's own tab in the WME **Scripts** panel. Each option has a short description and a "More…" link with full details.


## Install

1. Install a userscript manager (for example [Tampermonkey](https://www.tampermonkey.net/)).
2. Install the script from **[Greasy Fork](https://greasyfork.org/scripts/601073-wme-ro-tools)**, which gives you automatic updates, or directly from [`wme-ro-tools.user.js`](https://raw.githubusercontent.com/spookyx-pd/wme-ro-tools/main/wme-ro-tools.user.js).
3. Open the [Waze Map Editor](https://www.waze.com/editor). The settings are in the **Scripts** panel, under the **RO Tools** tab.

[Română](README.ro.md) · [Changelog (RO)](CHANGELOG.md) · [Feedback](https://greasyfork.org/scripts/601073-wme-ro-tools/feedback)

---

## Map & segment tools

### Lengths and angles
- **Selected node.** When you select a node with two or more segments, each connected segment shows a length label. While you drag the node, the angles between the segments are shown live.
- **Selected segment(s).** Selecting one segment shows its total length next to it, updated live while you drag the end nodes or geometry points. Selecting several segments shows one length label per segment.
- **Drawing a new segment.** While you draw a new road, a pill next to the cursor shows its length so far, live.

### Open a link (🔗 next to the search box)
Paste (or take from the clipboard with **📋 Paste**) a WME permalink (www or beta, any language), a Google Maps link (short `maps.app.goo.gl` links too), a Waze app / Live Map link or plain GPS coordinates, and go there **without reloading the page**.
- The window shows what the link contains and how far it is from your current view.
- For a permalink: **▶ Open everything** (as if you opened it in the browser: location, selected objects, open UR / map problem), **Location only**, **Select the segments / nodes / place / JB…** (zoomed to show them all) and **Open the UR / map problem**. Selected objects are also highlighted in purple, so you still see them after the opened UR deselects them. A permalink with only coordinates gets a single **📍 Open the location** button.
- The exact point of the coordinates is marked on the map with a red circle, which stays put when you zoom.
- Layer settings in the permalink (`s=…`) and any other parameter are ignored.
- The place you left from is remembered for the session: **↩ Go back** takes you back there.

### Road closures
Rest the mouse for a moment on the red symbol of a closure (just passing over it opens nothing) to see its details: status (active / scheduled / finished / finished early), description, period and duration, direction (A → B, B → A or both), the start node and whether it is closed, traffic detection, who created and last updated it. Buttons: **✏️ Edit** (selects the segment and opens the closure's form directly), **⧉ Duplicate** (starts now, with the same end time), **↻ Next day** and **🗑 Delete** (two clicks; applied when you press Save).

If the same closure is also set on other segments, the window says so ("🔗 The same closure is also on other segments"), and **Edit**, **Duplicate**, **Next day** and **Delete** first ask where to apply: **only this segment**, **the whole street**, **all with the same closure** (same description, period and event) or **the whole event**. For several segments WME's shared form from the "Road closures" tab is used; **Delete** removes them all at once after a confirmation (unsaved, Ctrl+Z undoes it). Only the closures in the area loaded on the map are taken into account.

### Road shield from the street name
For a selected segment whose street has no road shield but whose name starts with the road code, a **🛡 Set the shield** button appears at the top of the panel: DC300 → Communal road "300", DJ / DN → County / National road with the number only, A1 → Motorway, E60 → European road, DEX… → Expressway. Alternate names are checked too. As with the WME dialog, the shield is set on the street, so on every segment that has it; it is an unsaved edit (Undo works).

### Map notes (Map Comments)
- **Title on the map.** The title (subject) of each map note is written in the middle of the note, like place names. If the note is bigger than the screen, the title stays in its visible part. It doesn't catch the click, so the note stays selectable.
- **Info card on hover.** Rest the mouse on a note for a moment and a card shows its title, text, number of comments, lock level, expiry date, and who created or updated it and when.

Both can be turned off in the settings.

### Lock level 1 indicator
A small orange pill (lock + 1) next to every visible segment locked at level 1. Rest the mouse on it for a moment (just passing over it opens nothing) and a card opens where you lock that segment at a higher level with one click (only levels up to yours).

### Junction Box route warnings
When you select, create or edit a Junction Box, a warning lists its routes that are **not allowed** (from which segment, to which segment, why), with the route drawn on the map. After saving, the warning stays if the saved JB still has such routes.

### Less crowded map
- **Smaller map icons:** map problems at half size, permanent hazards a little smaller, the big old-style camera and railroad-crossing pins at the size of the other hazards.
- **Traffic lights in the background:** they are drawn under the segments and no longer catch your click, so you can select the segment, node or map problem next to them. Hold **Alt** to bring them back on top and select one.

### Quick-action toolbar
A row of icons sits next to the length label of the selected segment. You can drag it by its "⋮" handle. It toggles the most common segment properties in one click:
- unpaved
- headlights required
- HOV
- lock level
- direction
- toll
- restrictions

It also hosts the tools below.

- **Cut segment (✂️, shortcut `X`).** Arms a global cut mode. You don't need to select a segment first. A dot and a dashed guide snap to the nearest loaded segment as you move the mouse, and one click splits that segment exactly there. The cut is an ordinary unsaved edit (Undo works). `Esc` cancels.
- **Quick house numbers ("HN rapid").** Adds sequential house numbers with each map click: a free prefix plus an increasing or decreasing number or letter suffix. Each number goes on the nearest segment of the same street. It turns on the house-number layer and checks for duplicates along the whole street before each addition.
- **Move nodes.** Moves node A or node B inwards or outwards along the existing geometry by a set distance in meters.
- **Segment parameter automation.** When you press "Unpaved" or a road-type button, the script sets speed limits, lock level and headlights according to the community's rules.

### Livemap publish status
WME tells you whether an edit has reached Livemap. This script also shows how *fresh* the edit is, so you don't "fix" something that was already fixed and simply hadn't reached the app when the user reported it. The data comes from Waze's public tile-build status file, the same source WME's own history uses.

| Color | Meaning |
|---|---|
| 🟠 orange | Not on Livemap yet. Shows whether the edit is in the build now running and the estimated release time. |
| 🟢 green | Published by the **latest** map build. Already live. |
| 🔵 blue | Published by a build up to 3 days before that. A recent edit. |
| ⚪ grey | An older edit. |

The status is shown in three places:
- **Selected segment:** an icon with the edit's age ("21h", "1d 21h", "3d") next to the length label. The tooltip shows "Edited: …" and "Live: …", for example "latest build, 9 hours ago (Thu 15.10, 05:30)".
- **Sidebar history:** the "Last update" icon gets the same color, with an extra line underneath giving the status and when the edit went live or will go live.
- **The whole visible map:** a small round pill next to every orange, green or blue segment. Rest the mouse on it for a moment (just passing over it opens nothing) and a card opens with the Livemap status, the editor (with a profile link), the edit date and the Livemap line, plus a **📜 Recent history** button: the segment's latest edits (what changed, who, when, Livemap status), loaded only on demand. The card closes by itself when you move the mouse away or click elsewhere.

### Saved-anyway warnings list
WME sometimes says "something might be wrong with this edit". If you save anyway, the warnings are no longer lost. They are kept in a session list, one entry per warning, including the ones WME merges together. Each entry has a "take me there" button that centers the map on the problem and selects the segment.

---

## Turn instructions helper
These extra controls appear in the native **Turn instructions** dialog. Nothing is written to the map until you press WME's own **Apply**.

- **⚡ Default** fills in the road shield and the local name of the target road as the main instruction, "»" in *Towards*, and a matching TTS text. It asks for confirmation if the fields already have data.
- **»** and **·** insert those separators at the cursor. **+ local name** adds the target road's local name.
- **🛡 Shields**: type a code to get the right Romanian shield, without the "helper segment" trick. Supported codes: A2, DN1A, E60, DEx12, DJ601, DC43, CB. You can also pick from the shields seen on the map in the current county.
- **⚠️ Warnings** add height-clearance, weight-limit and "Bus/Taxi only" notes to *Towards* and to the TTS text.
- **TTS tools**: rebuild all, add main, add towards, clear, and **🔊 full voice simulation** using WME's own Romanian voice ("În 800 de metri, virează la dreapta pe …").
- **Drag handles (⋮)** on every text box and shield let you reorder them within the same area. The automatic TTS text follows the new order.

---

## Update Request / Map Problem tools
- **Clickable GPS coordinates.** Users often reply with coordinates. Both decimal (`44.223232, 23.0909034`) and degrees-minutes-seconds (`45°03'19.8"N 26°25'37.8"E`) become links. A click centers the map on the point and shows a pulsing marker, and the problem window stays open. Coordinates typed in the wrong order (longitude first) are detected for Romania.
- **Long message sender.** Splits a reply longer than 2,000 characters into several parts, which you then send one after another. It shows a live preview. It appears in the Update Request / Map Problem windows only, not in the map note panel.
- **Draft saver.** Keeps your unsent reply for each UR/MP, even if the window or the page reloads.
- **Visible line breaks** (also only in the Update Request / Map Problem windows). The Waze app shows comments without line breaks. When you send, the script can replace paragraph and line breaks with visible separators, with a preview of what the user will see in the app. The preview has a "Don't show again this session" checkbox.
- **Bigger reply box**: 12 lines.
- **Time in the conversation.** The messages of an UR conversation show the date with hour and minute (e.g. "25 November 2026, 20:17"), so you can see when each one answered.
- **Image link preview.** A 🖼 button after links in the conversation opens the picture in a window inside the editor (zoom with the wheel, drag to pan, rotate). Works with direct picture links and hosting pages like imgbb / ibb.co, imgur, postimg. A dot typed after the link is ignored.

---

## Map edit suggestions helper
WME only lets you accept or reject a suggestion as a whole. The script helps you answer change by change:
- **📝 Review changes** in the "Map suggestion" window opens a panel with each proposed change (old value struck out → new value, location). Mark each one ✔ correct / ✖ wrong / ↻ I'll redo it and write an explanation.
- **Reject with this message** opens WME's rejection dialog already filled with a plain-text message built from your review (it reaches the user by e-mail). The rejection itself is always WME's own button.
- **💬 Send in chat** opens the WME chat with the user and puts the review in the box; you press Send. Useful also when you approve the suggestion but want to explain what could be done better.
- **U-turns** in a suggestion are named clearly ("U-turn at end A/B of …"), not just "Update turn direction".
- **Bigger rejection dialog** with the list of changes (a click inserts "• label: old → new" at the cursor), "Insert the review" and "Clear".
- **Draft per suggestion.** WME's Cancel closes the whole suggestion window; your text, statuses and notes come back when you open it again.
- **Apply the good changes.** After rejecting, the changes go to a list at the top right (the 📝 button next to Save reopens it). Those not marked wrong can be reproduced with "Apply on the map": new segment, road type, street name (with nearby names to choose from), house numbers at the position the user chose, unpaved, turns and U-turns. They are ordinary unsaved edits for you to review and save. A house number on an unnamed road asks for a street name first.

---

## Interface helpers
- **Keyboard shortcuts dialog:**
  - search by command name or by key;
  - a "find by key" mode;
  - a filter to show only commands that have a key;
  - a confirmation before a key already used by another command is taken over;
  - **🎹 Keyboard:** a drawn keyboard with the command name written on each assigned key (red = several commands on the same key); Ctrl / Shift / Alt stay pressed so you can see their combinations, and on the right is the list of shortcuts for that combination. Clicking one finds it in the list so you can change it.
- **Key hints.** The assigned keys appear next to items in *Map layers* and in the **+** menu. Long hazard names in the + menu are no longer cut off. A small blue dot marks the commands that have a shortcut in WME but no key; clicking it finds the command in the shortcuts dialog.
- **Layer quick buttons.** Round buttons on the right side of the map toggle Google Places, extra satellite imagery, house numbers and hazards.
- **Better location search.** Clicking outside the box no longer jumps to a result; the box is emptied after you pick one; results show their source (Waze / Google) and distance; the first ones are streets and places already loaded on the map ("🗺 on the map"); a number looks up a segment ID and n.n.n a place ID; a link or coordinates give "🔗 Open the link"; an empty box shows your last 15 searches.
- **Google logo with traffic.** Clicking the Google logo at the bottom right opens Google Maps at the map center with the traffic layer on.
- **External maps.** Above the Google logo at the bottom right, a row of logos opens OpenStreetMap, Yandex Maps, HERE WeGo or Mapillary in a new tab, at the WME map center and zoom.
- **📊 Resource monitor** (link in the settings tab). How much CPU each function of the script uses, how busy the editor is, memory, page elements and loaded objects, the frames that stall the page per script, and "notifications still running" (loops left behind by other scripts that load the CPU until you reload the tab). **🔬 5 s analysis** or **⏺ Continuous analysis** (you stop it; if you close the monitor, a small indicator with "⏹ Stop" stays at the bottom) shows which script loads the editor while you work.
- **Segment history.** The "Included Suggestion by <editor>" label is no longer cut off: it wraps onto two lines and the editor's profile link and the chat 💬 button stay visible and clickable.
- **Info cards.** The information windows of the script (map notes, road closures, recent history, the pills on the map) share one card look and stay clear of WME's button column on the right of the map. Pills and notes open their card only after the mouse rests on them for a moment.
- **What's new.** After an update, a short window lists the new features. The full history is available from the settings tab.

---

## WME bug fixes
Some options don't add new features. They work around bugs in WME itself, and they are marked **"WME Bug fix"** in the settings tab. They may become unnecessary once Waze fixes the problem.
- **City / county name above the map.** WME often drops the "City, County" label to just the country name after a zoom or a pan. It recalculates the location only from the last batch of map data, and loses it when that batch has no segments. The script restores the name from the segments already loaded, with no map reload.
- **Keep the sidebar open** (off by default). Re-opens the sidebar when it collapses or hides on its own.
- **Duplicate place vertices.** When you edit the geometry of a place (moving a vertex, or dragging a new vertex out of an edge), WME can create two vertices at exactly the same spot; the geometry then becomes invalid and Save is refused with "invalid geometry". The script checks the places with unsaved changes and, if it finds consecutive identical vertices, shows a card with **🧹 Clean** (removes the extra vertices - an unsaved edit, Undo works), **Show the place** and **Ignore**. A **Remove automatically (this session only)** checkbox on the card removes new duplicates by itself until you reload the page. The script never saves anything.
- **Save errors on turns.** When Save is refused because of a turn (e.g. "Modifying GuidanceMode is allowed only for CS Lanes"), WME does not say which turn it is. The turn's segments ("from … to …", with the node) and a **📍 Show the turn** button now appear under the error. For the GuidanceMode error there is also an explanation: the turn has a Voice setting of "Display only" / "Display and voice", but the lane arrow is no longer "Straight" (WME recalculates it when you move a node), and the server accepts the voice setting only on lanes that go straight. The fix: set the arrow to "Straight" or Voice to "Waze default".
- **Hazards moved with the road.** When you move a node or reshape a segment, WME also moves the traffic lights / cameras / hazards on it, but does not send their new position to the server, and Save is refused with "Permanent hazard location is too far from Segment …". The script sends the move on Save (only the final position of each hazard) and shows a short message. It never saves anything by itself; Undo works as usual.

---

## Customizable texts
Texts that reach the map or Waze app users are in Romanian by default. You can change them, or translate them into your own language, under **Settings → "Customizable texts"**. They are:
- UR reply separators;
- the "Long message" part markers;
- turn-instruction warnings and their TTS;
- the TTS used for the Bucharest ring road shield;
- the voice simulation phrases;
- the status words and the optional opening / closing text of the edit suggestion rejection message.

An empty field keeps the default text. **Copy JSON / Import JSON** lets you share a set of texts, for example a translation, with other editors.

---

## Notes
- Uses `GM_xmlhttpRequest` (WME's security policy blocks direct requests) to check Greasy Fork for a newer version, to load pictures for the image link preview, and to resolve short Google Maps links (`maps.app.goo.gl`) to coordinates. The other external request is to Waze's public tile-build status file on Google Cloud Storage, used for the Livemap status.
- Settings and drafts are stored in your browser's `localStorage`.
- All edits go through the official WME SDK and stay **unsaved** until you press Save, just like manual edits. (Exception: WME saves closures created or edited in its own closure form right away - the script only opens that form.)
- License: MIT.
