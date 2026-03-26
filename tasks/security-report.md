# Security Audit Report: Detective Desk CV

**Auditor**: Security Engineer Agent
**Date**: 2026-03-26
**Scope**: Full codebase review of d:\justuna
**Risk Level**: LOW (static portfolio site, no backend)

---

## Executive Summary

This is a client-side only portfolio website built with vanilla JS, GSAP, and Vite. There is no backend, no database, no user authentication, and no server-side processing. The attack surface is minimal. However, several findings are documented below for completeness and best practice adherence.

---

## Findings

### MEDIUM: innerHTML Used with Data from JSON (DOM-based XSS Vector)

**Files**: `js/modules/documents.js` (lines 35, 63, 79, 93-118, 122-136, 138-151, 154-166, 169-207, 210-222)
**Description**: The `renderPage()`, `renderProfile()`, `renderTimeline()`, `renderCards()`, `renderGrid()`, `renderLinks()`, and `renderSecret()` functions all construct HTML strings from `cv-data.json` and inject them via `innerHTML`.

```js
header.innerHTML = `<h2>${folder.pages[0].heading}</h2>...`;
pagesEl.innerHTML = `<div class="doc-page type-${page.type}">${html}</div>`;
```

**Current Risk**: LOW - The data source is a bundled static JSON file (`js/data/cv-data.json`) that ships with the application. It is not fetched from a remote API or influenced by user input. An attacker would need to modify the source code or build artifacts to exploit this.

**Potential Risk**: If the data source were ever changed to a remote API, CMS, or user-contributed content, this would become a HIGH severity XSS vulnerability.

**Recommendation**:
- Use `textContent` instead of `innerHTML` where possible
- If HTML construction is needed, use a sanitization library or DOM API (`createElement`, `appendChild`)
- Add a comment noting the security assumption that data is trusted/static

---

### MEDIUM: innerHTML in Puzzle Module (Folder Creation)

**File**: `js/modules/puzzle.js` (lines 263-271)
**Description**: The `revealSecretCompartment()` function constructs folder HTML using `innerHTML`:

```js
folderEl.innerHTML = `
  <div class="folder-tab" style="--folder-color:#8b0000; background:#8b0000;">
    <span style="color:#ffd700;">???</span>
  </div>
  ...
`;
```

**Current Risk**: LOW - All values are hardcoded string literals, not from external input.

**Recommendation**: No immediate action needed. This is safe as-is.

---

### LOW: Global State via window.__secretFolderData

**File**: `js/modules/puzzle.js` (line 27)
**Description**: `window.__secretFolderData = secretFolderData;` exposes puzzle data on the global window object.

**Risk**: An attacker with console access could read or modify this data. However, since this is a portfolio site with no sensitive operations, the impact is negligible. A curious user could also find the "secret" folder data by inspecting the bundled JSON.

**Recommendation**: Use a module-scoped variable instead of `window`:
```js
let _secretFolderData = null; // module scope
```

---

### LOW: localStorage Usage Without Validation

**File**: `js/modules/sounds.js` (lines 67, 75)
**Description**: The mute preference is stored and read from `localStorage`:
```js
const saved = localStorage.getItem('detective-desk-muted');
if (saved === 'true') muted = true;
```

**Risk**: Negligible. The value is compared strictly to the string `'true'` and only controls a boolean for sound muting. No code execution path exists from this value.

**Recommendation**: No action needed. Implementation is safe.

---

### LOW: No Content Security Policy (CSP)

**File**: `index.html`
**Description**: No CSP meta tag or HTTP header is defined. This means inline styles and scripts are unrestricted.

**Risk**: LOW for a static site. CSP would provide defense-in-depth against any future XSS issues.

**Recommendation**: Add a CSP meta tag:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self';">
```

Note: `'unsafe-inline'` for styles is needed because GSAP and the code use inline `style` attributes via JS. If you want stricter CSP, consider using GSAP's className-based approach instead of inline styles.

---

### LOW: No Subresource Integrity (SRI) for Google Fonts

**File**: `index.html` (lines 10-12)
**Description**: Google Fonts are loaded without SRI hashes:
```html
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
```

**Risk**: If Google's CDN were compromised, malicious CSS could be injected. This is a theoretical risk with very low probability.

**Recommendation**: Consider self-hosting fonts for maximum security, or accept the risk as Google Fonts is a trusted CDN.

---

### INFO: No Sensitive Data Exposure

**File**: `js/data/cv-data.json`
**Description**: The JSON file contains CV/portfolio data (name, education, skills, contact info). This is intentionally public information for a portfolio site.

**Verified**: No API keys, passwords, tokens, or internal credentials found in any source files.

---

### INFO: No Network Requests to External APIs

**Description**: The application makes no `fetch()` or `XMLHttpRequest` calls to external APIs. The only `fetch()` is for local sound files (`/assets/sounds/*.mp3`). The only external resources are Google Fonts loaded via `<link>` tags.

**Risk**: None. No data exfiltration or SSRF vectors exist.

---

### INFO: Audio Context Handled Correctly

**File**: `js/modules/sounds.js`
**Description**: The `AudioContext` is properly created on user interaction (click/touch) to comply with browser autoplay policies. Error handling silently fails if sound files are unavailable.

**Risk**: None.

---

## No Issues Found In

- **CSRF**: No forms, no state-changing requests
- **Authentication/Authorization**: No auth system exists
- **SQL Injection**: No database
- **File Upload**: No file upload functionality
- **Open Redirect**: No redirects
- **Clickjacking**: Not applicable for a portfolio (but `X-Frame-Options` could be added at hosting level)
- **Dependency Vulnerabilities**: Only dependency is GSAP (loaded via npm/Vite bundling)

---

## Recommendations Summary

| Priority | Finding | Action |
|----------|---------|--------|
| MEDIUM | innerHTML with JSON data | Add comment documenting trust assumption; refactor to DOM API if data source ever changes |
| LOW | window.__secretFolderData | Move to module-scoped variable |
| LOW | No CSP header | Add CSP meta tag for defense-in-depth |
| LOW | No SRI for Google Fonts | Consider self-hosting fonts |

---

## Conclusion

The Detective Desk CV application has a minimal attack surface as a purely client-side static portfolio site. The primary finding (innerHTML usage) is low risk given the static, bundled data source, but should be documented as a security assumption. No critical or high-severity vulnerabilities were identified. The codebase follows reasonable security practices for its scope and purpose.

**Overall Security Rating**: ACCEPTABLE for production deployment as a static site.
