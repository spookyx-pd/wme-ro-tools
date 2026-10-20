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
- **The whole visible map:** a small round pill next to every orange, green or blue segment. Hovering over it shows the editor, the edit date and the Livemap status.

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
- **Long message sender.** Splits a reply longer than 2,000 characters into several parts, which you then send one after another. It shows a live preview.
- **Draft saver.** Keeps your unsent reply for each UR/MP, even if the window or the page reloads.
- **Visible line breaks.** The Waze app shows comments without line breaks. When you send, the script can replace paragraph and line breaks with visible separators, with a preview of what the user will see in the app.
- **Bigger reply box**: 12 lines.

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
  - a confirmation before a key already used by another command is taken over.
- **Key hints.** The assigned keys appear next to items in *Map layers* and in the **+** menu. Long hazard names in the + menu are no longer cut off.
- **Layer quick buttons.** Round buttons on the right side of the map toggle Google Places, extra satellite imagery, house numbers and hazards.
- **What's new.** After an update, a short window lists the new features. The full history is available from the settings tab.

---

## WME bug fixes
Some options don't add new features. They work around bugs in WME itself, and they are marked **"WME Bug fix"** in the settings tab. They may become unnecessary once Waze fixes the problem.
- **City / county name above the map.** WME often drops the "City, County" label to just the country name after a zoom or a pan. It recalculates the location only from the last batch of map data, and loses it when that batch has no segments. The script restores the name from the segments already loaded, with no map reload.
- **Map filter in the Issue Tracker** (off by default). The map can show every open issue (UR, PUR, MP, MS) in the visible area, while the Issue Tracker list keeps its filter. It can be toggled from the settings, from *Map layers* and from a checkbox under the Issue Tracker list.
- **Keep the sidebar open** (off by default). Re-opens the sidebar when it collapses or hides on its own.

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
- Uses `GM_xmlhttpRequest` only to check Greasy Fork for a newer version (WME's security policy blocks direct requests). The other external request is to Waze's public tile-build status file on Google Cloud Storage, used for the Livemap status.
- Settings and drafts are stored in your browser's `localStorage`.
- All edits go through the official WME SDK and stay **unsaved** until you press Save, just like manual edits.
- License: MIT.
