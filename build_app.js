const fs = require('fs');

const compactData = fs.readFileSync('compact_songs.json', 'utf-8');
const defaultApPlusData = fs.readFileSync('default_ap_plus_records.json', 'utf-8');
const gasScriptContent = fs.readFileSync('gas_sync.js', 'utf-8');
const iconSvgContent = fs.readFileSync('icon.svg', 'utf-8');
const iconBase64 = Buffer.from(iconSvgContent).toString('base64');
const iconDataUri = `data:image/svg+xml;base64,${iconBase64}`;

let appleTouchBase64 = '';
if (fs.existsSync('apple-touch-icon.png')) {
  appleTouchBase64 = fs.readFileSync('apple-touch-icon.png').toString('base64');
}

const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Rotaeno">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="theme-color" content="#144973">
  <!-- Favicon & PWA / Mobile App Icons -->
  <link rel="icon" type="image/x-icon" href="./favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="192x192" href="./icon-192.png">
  <link rel="icon" type="image/svg+xml" href="${iconDataUri}">
  <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png">
  ${appleTouchBase64 ? `<link rel="apple-touch-icon" href="data:image/png;base64,${appleTouchBase64}">` : `<link rel="apple-touch-icon" href="./apple-touch-icon.png">`}
  <link rel="manifest" href="./manifest.json">
  <title>Rotaeno Rating Tracker</title>
  <style>
    :root {
      --header-height: 120px;
      --bg-body: #cce3f8;
      --bg-surface: #FDE4C3;
      --bg-surface-soft: #fff9f0;
      --bg-card: #ffffff;
      --bg-input: #f1f7fd;
      
      --color-text-main: #1a2a3a;
      --color-text-sub: #546a7e;
      --color-text-muted: #7e93a7;
      
      --color-primary: #0077cc;
      --color-primary-dark: #144973;
      --color-gold: #d97706;

      --border-color: #d1e2f2;
      --border-beige: #ebd2b0;

      /* Difficulty Colors */
      --diff-i: #32cd32;
      --diff-ii: #0099ff;
      --diff-iii: #ff6600;
      --diff-iv: #9400d3;             /* IV: Deep Blue-Violet */
      --diff-iv-alpha: #d926a9;       /* IV-α: Vivid Magenta-Pink */
      --diff-iv-alpha-border: #ff70d9;

      /* Lamps */
      --lamp-applus: linear-gradient(135deg, #ff758c 0%, #ff8eb3 30%, #54a0ff 70%, #1dd1a1 100%);
      --lamp-ap: #ff9900;
      --lamp-fc: #0099ff;
      --lamp-clear: #6b7c96;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif;
    }

    body {
      background-color: var(--bg-body);
      color: var(--color-text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding-bottom: 74px;
      -webkit-font-smoothing: antialiased;
    }

    /* Header */
    header {
      background-color: var(--bg-surface);
      border-bottom: 2px solid var(--border-beige);
      padding: 14px 18px 12px;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 2px 8px rgba(26, 50, 75, 0.06);
    }

    .rating-banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
    }

    .rating-left-box {
      display: flex;
      flex-direction: column;
    }

    .rating-label {
      font-size: 11px;
      letter-spacing: 1px;
      color: var(--color-text-sub);
      font-weight: 800;
    }

    .rating-value-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      line-height: 1;
    }

    .rating-value {
      font-size: 32px;
      font-weight: 900;
      color: var(--color-primary-dark);
      letter-spacing: -0.5px;
      font-variant-numeric: tabular-nums;
    }

    .rating-theo {
      font-size: 12px;
      font-weight: 800;
      color: var(--color-text-sub);
    }

    .rating-right-box {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 3px;
    }

    .completion-badge {
      background: #ffffff;
      border: 1px solid var(--border-beige);
      padding: 4px 10px;
      border-radius: 8px;
      text-align: right;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .completion-title {
      font-size: 10px;
      font-weight: 800;
      color: var(--color-text-muted);
      text-transform: uppercase;
    }

    .completion-value {
      font-size: 13px;
      font-weight: 900;
      color: var(--color-primary-dark);
      font-variant-numeric: tabular-nums;
    }

    .completion-rate {
      color: var(--color-gold);
      font-size: 12px;
      margin-left: 4px;
    }

    .breakdown-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .breakdown-item {
      background: #ffffff;
      border: 1px solid var(--border-beige);
      border-radius: 8px;
      padding: 8px 10px;
      text-align: center;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }

    .breakdown-tag {
      font-size: 10px;
      color: var(--color-text-muted);
      font-weight: 700;
      text-transform: uppercase;
    }

    .breakdown-num {
      font-size: 14px;
      font-weight: 800;
      margin-top: 2px;
      color: var(--color-text-main);
      font-variant-numeric: tabular-nums;
    }

    .highlight-b10 {
      color: #b45309;
    }

    /* Container */
    .container {
      flex: 1;
      padding: 14px;
      max-width: 900px;
      margin: 0 auto;
      width: 100%;
    }

    /* Controls */
    .controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .search-wrapper {
      position: relative;
    }

    .search-input {
      width: 100%;
      padding: 11px 14px 11px 36px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--color-text-main);
      font-size: 14px;
      outline: none;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: var(--color-primary);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-muted);
      font-size: 14px;
    }

    .sort-bar {
      display: flex;
      align-items: center;
      gap: 6px 12px;
      flex-wrap: wrap;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.02);
    }

    .sort-label {
      font-weight: 800;
      color: var(--color-text-sub);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .sort-select {
      background: var(--bg-surface-soft);
      border: 1px solid var(--border-beige);
      border-radius: 6px;
      padding: 5px 8px;
      font-size: 12px;
      font-weight: 800;
      color: var(--color-primary-dark);
      outline: none;
      cursor: pointer;
      flex: 1;
      min-width: 140px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-text-sub);
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      padding-left: 8px;
      border-left: 1px solid var(--border-color);
    }

    .checkbox-label input[type="checkbox"] {
      cursor: pointer;
      width: 15px;
      height: 15px;
      accent-color: var(--color-primary-dark);
    }

    .filter-group {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }
    .filter-group::-webkit-scrollbar { display: none; }

    .filter-btn {
      padding: 6px 12px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 12px;
      color: var(--color-text-sub);
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      font-weight: 700;
      transition: all 0.15s;
    }

    .filter-btn.active {
      background: var(--color-primary-dark);
      color: #ffffff;
      border-color: var(--color-primary-dark);
    }

    /* Collapsible Song Groups & Toolbar */
    .song-group-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding: 6px 4px;
    }

    .song-group-toolbar-info {
      font-size: 12px;
      font-weight: 800;
      color: var(--color-primary-dark);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .song-group-toolbar-actions {
      display: flex;
      gap: 6px;
    }

    .btn-group-toggle {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 5px 10px;
      font-size: 11px;
      font-weight: 800;
      color: var(--color-primary-dark);
      cursor: pointer;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .btn-group-toggle:hover {
      background: #f1f5f9;
      border-color: var(--color-primary);
    }

    .song-group-section {
      margin-bottom: 10px;
    }

    .song-group-header {
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .song-group-header:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .song-group-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }

    .song-group-arrow {
      font-size: 10px;
      color: var(--color-text-sub);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-block;
      flex-shrink: 0;
    }

    .song-group-header.collapsed .song-group-arrow {
      transform: rotate(-90deg);
    }

    .song-group-title {
      font-size: 13px;
      font-weight: 900;
      color: var(--color-primary-dark);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .song-group-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .song-group-count {
      font-size: 11px;
      font-weight: 800;
      color: var(--color-primary-dark);
      background: rgba(20, 73, 115, 0.08);
      padding: 2px 8px;
      border-radius: 12px;
      white-space: nowrap;
    }

    .score-tier-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 8px;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
    }

    .badge-tier-applus {
      background: linear-gradient(135deg, #fce7f3, #fee2e2);
      color: #be185d;
      border: 1px solid #f472b6;
      box-shadow: 0 0 6px rgba(244, 114, 182, 0.3);
    }

    .badge-tier-ex-rainbow {
      background: linear-gradient(135deg, #ede9fe, #e0f2fe);
      color: #6d28d9;
      border: 1px solid #c4b5fd;
    }

    .badge-tier-ex-orange {
      background: #ffedd5;
      color: #c2410c;
      border: 1px solid #fdba74;
    }

    .badge-tier-s-plus {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fcd34d;
    }

    .badge-tier-s {
      background: #fef9c3;
      color: #a16207;
      border: 1px solid #fde047;
    }

    .badge-tier-a-plus {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #7dd3fc;
    }

    .badge-tier-a {
      background: #f0f9ff;
      color: #0284c7;
      border: 1px solid #bae6fd;
    }

    .badge-tier-b {
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
    }

    .badge-tier-c {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }

    .badge-tier-d {
      background: #f8fafc;
      color: #64748b;
      border: 1px solid #e2e8f0;
    }

    .badge-tier-e {
      background: #fafafa;
      color: #71717a;
      border: 1px solid #e4e4e7;
    }

    .badge-tier-f {
      background: #f4f4f5;
      color: #a1a1aa;
      border: 1px solid #e4e4e7;
    }

    .song-group-body {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .song-group-body.collapsed {
      display: none !important;
    }

    /* Song List */
    .song-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .song-row {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(26, 50, 75, 0.04);
      transition: transform 0.1s, border-color 0.15s, background 0.15s;
    }

    .song-row:active {
      transform: scale(0.99);
    }

    .song-row.in-b40 {
      border-left: 4px solid var(--color-gold);
    }

    .song-left-col {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    /* Difficulty Badges */
    .diff-badge {
      min-width: 44px;
      height: 38px;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 11px;
      color: #ffffff;
      flex-shrink: 0;
      text-shadow: 0 1px 2px rgba(0,0,0,0.4);
    }

    .diff-badge .const-val {
      font-size: 12px;
      line-height: 1.1;
      font-weight: 800;
    }

    .diff-badge.diff-I { background-color: var(--diff-i); }
    .diff-badge.diff-II { background-color: var(--diff-ii); }
    .diff-badge.diff-III { background-color: var(--diff-iii); }
    .diff-badge.diff-IV { background-color: var(--diff-iv); }
    
    .diff-badge.diff-IV-alpha,
    .diff-badge.diff-IV-\\α,
    .diff-badge[class*="IV-"] { 
      background-color: var(--diff-iv-alpha) !important;
      border: 2px solid var(--diff-iv-alpha-border);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,0.3);
    }

    .song-meta {
      min-width: 0;
      flex: 1;
    }

    .song-title-text {
      font-size: 14px;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--color-text-main);
      margin-bottom: 2px;
    }

    .song-sub-text {
      font-size: 11px;
      color: var(--color-text-sub);
      display: flex;
      gap: 6px;
      align-items: center;
      font-weight: 600;
      flex-wrap: wrap;
    }

    .ver-tag {
      font-size: 10px;
      color: var(--color-primary-dark);
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      padding: 0 4px;
      border-radius: 4px;
      font-weight: 700;
    }

    .song-right-col {
      text-align: right;
      flex-shrink: 0;
      margin-left: 12px;
    }

    .score-display-text {
      font-size: 14px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--color-text-main);
    }

    .rating-display-text {
      font-size: 12px;
      color: var(--color-primary-dark);
      font-weight: 800;
      margin-top: 1px;
    }

    /* Lamps */
    .lamp-tag {
      display: inline-block;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 4px;
      font-weight: 900;
      margin-left: 4px;
      vertical-align: middle;
    }
    .lamp-tag.lamp-AP-plus {
      background: var(--lamp-applus);
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .lamp-tag.lamp-AP {
      background-color: var(--lamp-ap);
      color: #ffffff;
    }
    .lamp-tag.lamp-FC {
      background-color: var(--lamp-fc);
      color: #ffffff;
    }
    .lamp-tag.lamp-CLEAR {
      background-color: var(--lamp-clear);
      color: #ffffff;
    }

    /* Best 40 View */
    .b40-title {
      font-size: 13px;
      font-weight: 800;
      color: var(--color-text-main);
      margin: 16px 0 8px;
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid var(--border-beige);
      padding-bottom: 4px;
    }

    .b40-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
      gap: 6px;
    }

    .b40-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }

    .b40-rank-num {
      font-size: 14px;
      font-weight: 800;
      min-width: 26px;
      text-align: center;
      color: var(--color-text-muted);
    }
    .b10-rank { color: var(--color-gold); font-weight: 900; }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(26, 42, 58, 0.6);
      display: none;
      align-items: flex-end;
      justify-content: center;
      z-index: 200;
      backdrop-filter: blur(2px);
    }

    .modal-overlay.open {
      display: flex;
    }

    .modal-box {
      background: #ffffff;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      border: 1px solid var(--border-color);
      border-bottom: none;
      width: 100%;
      max-width: 480px;
      padding: 16px 16px env(safe-area-inset-bottom);
      animation: modalSlide 0.18s ease-out;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.12);
    }

    /* Floating Action Buttons Group (Centered) */
    .floating-btn-group {
      position: fixed;
      top: calc(var(--header-height, 120px) + 8px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 95;
      display: flex;
      align-items: center;
      gap: 10px;
      pointer-events: none;
    }

    .action-fab {
      pointer-events: auto;
      background: #ffffff;
      color: var(--color-primary-dark);
      border: 1.5px solid var(--border-color);
      border-radius: 24px;
      padding: 6px 16px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(20, 73, 115, 0.2);
      transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
      user-select: none;
      white-space: nowrap;
    }

    .action-fab:hover {
      background: #f0f7ff;
      border-color: var(--color-primary);
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(20, 73, 115, 0.26);
    }

    .action-fab:active {
      transform: translateY(0);
    }

    #viewSongs {
      padding-top: 42px;
    }

    .fab-icon {
      font-size: 16px;
      line-height: 1;
    }

    .filter-badge-dot {
      width: 7px;
      height: 7px;
      background-color: var(--color-gold);
      border-radius: 50%;
      display: inline-block;
    }

    /* Filter Modal Layout */
    .filter-modal-box {
      max-height: 85vh;
      display: flex;
      flex-direction: column;
    }

    .filter-modal-body {
      overflow-y: auto;
      padding-right: 2px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 14px;
    }

    .modal-filter-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .modal-filter-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: var(--color-text-sub);
    }

    .filter-range-grid {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .filter-range-row {
      display: flex;
      align-items: flex-end;
      gap: 8px;
    }

    .filter-range-sep {
      color: var(--color-text-sub);
      font-weight: 800;
      font-size: 13px;
      padding-bottom: 7px;
      flex-shrink: 0;
    }

    .filter-input-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .filter-sub-label {
      font-size: 10px;
      color: var(--color-text-sub);
      font-weight: 700;
    }

    .filter-num-input, .filter-select-input {
      width: 100%;
      padding: 7px 8px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      font-size: 13px;
      background: #ffffff;
      color: var(--color-text-main);
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.15s;
    }

    .filter-num-input:focus, .filter-select-input:focus {
      border-color: var(--color-primary-dark);
    }

    .filter-checkbox-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 6px 10px;
      background: #f8fafc;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      margin-top: 4px;
    }

    .filter-checkbox-grid .checkbox-label {
      padding-left: 0;
      border-left: none;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-main);
    }

    .filter-modal-footer {
      display: flex;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--border-color);
    }

    .btn-filter-reset {
      background: #f1f5f9;
      color: var(--color-text-sub);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
    }

    .btn-filter-reset:hover {
      background: #e2e8f0;
      color: var(--color-text-main);
    }

    .btn-filter-apply {
      flex: 1;
      background: var(--color-primary-dark);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      transition: opacity 0.15s;
    }

    .btn-filter-apply:active {
      opacity: 0.85;
    }

    /* Modal Footer Buttons */
    .btn-cancel {
      flex: 1;
      padding: 10px 14px;
      background: #f1f5f9;
      color: var(--color-text-sub, #475569);
      border: 1.5px solid var(--border-color, #cbd5e1);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .btn-cancel:hover {
      background: #e2e8f0;
      color: var(--color-text-main, #1e293b);
    }
    .btn-cancel:active {
      opacity: 0.85;
    }

    .btn-save {
      flex: 1.5;
      padding: 10px 16px;
      background: var(--color-primary-dark, #144973);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s;
      box-shadow: 0 2px 6px rgba(20, 73, 115, 0.25);
    }
    .btn-save:hover {
      background: var(--color-primary, #20639B);
    }
    .btn-save:active {
      opacity: 0.85;
    }

    .btn-danger {
      padding: 10px 14px;
      background: #fee2e2;
      color: #dc2626;
      border: 1.5px solid #fca5a5;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-danger:hover {
      background: #fecaca;
    }
    .btn-danger:active {
      opacity: 0.85;
    }

    @keyframes modalSlide {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .modal-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .modal-song-name {
      font-size: 15px;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 85%;
      color: var(--color-text-main);
    }

    .modal-close-btn {
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: 24px;
      cursor: pointer;
      line-height: 1;
    }

    .input-display {
      background: var(--bg-surface-soft);
      border: 1.5px solid var(--border-beige);
      border-radius: 8px;
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      transition: all 0.15s;
    }

    .input-display:focus-within {
      background: #ffffff;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(0, 119, 204, 0.15);
    }

    .score-input-wrap {
      flex: 1;
      min-width: 0;
    }

    .score-number-input {
      width: 100%;
      background: transparent;
      border: none;
      outline: none;
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 0.5px;
      font-variant-numeric: tabular-nums;
      color: var(--color-primary-dark);
      font-family: inherit;
      padding: 0;
    }

    .score-number-input::selection {
      background: rgba(0, 119, 204, 0.25);
    }

    .calc-info {
      text-align: right;
    }

    .calc-rating-text {
      font-size: 14px;
      font-weight: 800;
      color: var(--color-text-main);
    }

    /* Lamp Selector */
    .lamp-picker {
      display: flex;
      gap: 5px;
      margin-bottom: 10px;
    }

    .lamp-choice {
      flex: 1;
      padding: 6px 0;
      background: #f1f5f9;
      border: 1px solid var(--border-color);
      border-radius: 5px;
      color: var(--color-text-sub);
      font-size: 11px;
      font-weight: 800;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s;
    }

    .lamp-choice.selected {
      border-color: var(--color-primary-dark);
      background: var(--color-primary-dark);
      color: #ffffff;
    }

    /* Quick Fill Buttons */
    .quick-row {
      display: flex;
      gap: 5px;
      margin-bottom: 10px;
    }

    .quick-pill {
      flex: 1;
      padding: 8px 4px;
      background: var(--bg-surface);
      border: 1px solid var(--border-beige);
      border-radius: 5px;
      color: var(--color-text-main);
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      text-align: center;
    }

    .quick-pill:active {
      background: #fbd6a5;
    }

    /* Keypad Grid */
    .keypad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }

    .key-cell {
      padding: 12px 0;
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--color-text-main);
      font-size: 19px;
      font-weight: 800;
      cursor: pointer;
      text-align: center;
      user-select: none;
    }

    .key-cell:active {
      background: #e2e8f0;
    }

    .btn-apply {
      width: 100%;
      padding: 12px;
      background: var(--color-primary-dark);
      color: #ffffff;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
    }

    /* Navigation Bar */
    .bottom-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 56px;
      background: var(--bg-surface);
      border-top: 2px solid var(--border-beige);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 100;
      padding-bottom: env(safe-area-inset-bottom);
      box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
    }

    .tab-item {
      flex: 1;
      height: 100%;
      background: none;
      border: none;
      color: var(--color-text-sub);
      font-size: 11px;
      font-weight: 800;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      cursor: pointer;
      transition: color 0.15s;
    }

    .tab-item.active {
      color: var(--color-primary-dark);
    }

    .tab-item span {
      font-size: 16px;
    }

    /* MyPage Layout & Sub-Navigation (Pseudo Page Transition) */
    .mypage-subnav {
      display: flex;
      gap: 6px;
      background: var(--bg-surface, #FDE4C3);
      padding: 6px;
      border-radius: 14px;
      margin-bottom: 16px;
      border: 1px solid var(--border-beige);
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
    }

    .mypage-nav-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 8px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--color-text-sub);
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
    }

    .mypage-nav-btn:hover {
      color: var(--color-text-main);
      background: rgba(255, 255, 255, 0.5);
    }

    .mypage-nav-btn.active {
      background: #ffffff;
      color: var(--color-primary-dark);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }

    .mypage-nav-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 10px;
      background: #e2e8f0;
      color: var(--color-text-sub);
    }

    .mypage-nav-btn.active .mypage-nav-badge {
      background: #e0f2fe;
      color: #0284c7;
    }

    .mypage-subview {
      animation: mypageFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes mypageFadeIn {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .btn-subview-back {
      background: #f1f5f9;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 7px 12px;
      font-size: 12px;
      font-weight: 800;
      color: var(--color-text-sub);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 12px;
      transition: all 0.15s;
    }

    .btn-subview-back:hover {
      background: #e2e8f0;
      color: var(--color-text-main);
    }

    .b40-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .b40-subview-title {
      font-size: 15px;
      font-weight: 900;
      color: var(--color-primary-dark);
    }

    /* MyPage Quick Jump Cards */
    .mypage-jump-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
      margin-bottom: 16px;
    }

    .mypage-jump-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 14px 16px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 10px;
    }

    .mypage-jump-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      border-color: var(--color-primary);
    }

    .jump-card-gold {
      border-left: 5px solid var(--color-gold);
    }

    .jump-card-rainbow {
      border-left: 5px solid #ff758c;
    }

    .jump-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .jump-card-title {
      font-size: 14px;
      font-weight: 900;
      color: var(--color-text-main);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .jump-card-sub {
      font-size: 12px;
      color: var(--color-text-sub);
      font-weight: 700;
    }

    .jump-card-cta {
      font-size: 12px;
      font-weight: 800;
      color: var(--color-primary);
      align-self: flex-end;
    }

    /* Stats Scope Selector Card */
    .stats-scope-selector-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .stats-scope-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .stats-scope-icon {
      font-size: 20px;
      background: rgba(20, 73, 115, 0.08);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stats-scope-title {
      font-size: 13px;
      font-weight: 800;
      color: var(--color-primary-dark);
    }

    .stats-scope-desc {
      font-size: 11px;
      color: var(--color-text-sub);
    }

    .stats-scope-pills {
      display: flex;
      background: #e2e8f0;
      padding: 3px;
      border-radius: 20px;
      gap: 4px;
    }

    .stats-scope-btn {
      border: none;
      background: transparent;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 800;
      color: var(--color-text-sub);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
    }

    .stats-scope-btn:hover:not(.active) {
      color: var(--color-primary-dark);
      background: rgba(255, 255, 255, 0.5);
    }

    .stats-scope-btn.active {
      background: var(--color-primary-dark);
      color: #ffffff;
      box-shadow: 0 2px 6px rgba(20, 73, 115, 0.25);
    }

    @media (max-width: 600px) {
      .stats-scope-selector-card {
        flex-direction: column;
        align-items: stretch;
      }
      .stats-scope-pills {
        width: 100%;
      }
      .stats-scope-btn {
        flex: 1;
        justify-content: center;
        text-align: center;
        padding: 7px 8px;
        font-size: 11px;
      }
    }

    /* Overall Stats Card & Lamps Grid */
    .stats-panel-box {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .stats-panel-title {
      font-size: 14px;
      font-weight: 900;
      color: var(--color-primary-dark);
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .lamp-stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: 8px;
      margin: 12px 0;
    }

    .lamp-stat-cell {
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 10px 6px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .lamp-stat-val {
      font-size: 18px;
      font-weight: 900;
      color: var(--color-text-main);
    }

    .lamp-stat-lbl {
      font-size: 11px;
      font-weight: 800;
    }

    .lamp-stat-pct {
      font-size: 10px;
      color: var(--color-text-muted);
      font-weight: 700;
    }

    .stats-meta-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 8px;
      margin-top: 10px;
    }

    .stats-meta-pill {
      background: #f1f5f9;
      padding: 8px 10px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stats-meta-pill-lbl {
      font-size: 10px;
      font-weight: 700;
      color: var(--color-text-muted);
    }

    .stats-meta-pill-val {
      font-size: 14px;
      font-weight: 900;
      color: var(--color-text-main);
    }

    /* Stacked Progress Bar */
    .stacked-bar-wrap {
      width: 100%;
      height: 10px;
      background: #e2e8f0;
      border-radius: 5px;
      overflow: hidden;
      display: flex;
    }

    .bar-seg-applus { background: linear-gradient(90deg, #ff758c, #54a0ff); }
    .bar-seg-ap { background: #ff9900; }
    .bar-seg-fc { background: #0099ff; }
    .bar-seg-clear { background: #10b981; }

    /* Difficulty Stat Table */
    .diff-stat-table-wrap {
      overflow-x: auto;
      margin-top: 8px;
    }

    .diff-stat-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    .diff-stat-table th {
      background: #f8fafc;
      color: var(--color-text-sub);
      font-weight: 800;
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
      text-align: center;
    }

    .diff-stat-table td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-color);
      text-align: center;
      vertical-align: middle;
      white-space: nowrap;
    }

    .diff-stat-table tr:last-child td {
      border-bottom: none;
    }

    /* Level Stat Rows */
    .level-stat-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: 6px;
    }

    .level-stat-badge {
      min-width: 48px;
      text-align: center;
      font-size: 12px;
      font-weight: 900;
      color: var(--color-text-main);
      background: #f1f5f9;
      padding: 4px 6px;
      border-radius: 6px;
    }

    .level-stat-progress {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .level-stat-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-sub);
    }

    /* Song Pack Stat Cards */
    .pack-stat-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 12px 14px;
      margin-bottom: 8px;
      transition: border-color 0.15s;
    }

    .pack-stat-card:hover {
      border-color: var(--color-primary);
    }

    .pack-stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      gap: 8px;
    }

    .pack-stat-title {
      font-size: 13px;
      font-weight: 800;
      color: var(--color-text-main);
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .pack-badge-pill {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 6px;
      background: #fef3c7;
      color: #b45309;
      white-space: nowrap;
    }

    .pack-stat-meta {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 6px 12px;
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-sub);
      margin-top: 6px;
    }

    .btn-pack-jump {
      background: #f1f5f9;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 800;
      color: var(--color-primary-dark);
      cursor: pointer;
      transition: background 0.15s;
    }

    .btn-pack-jump:hover {
      background: #e2e8f0;
    }

    /* AP+ Theory Record Table & Toolbar */
    .ap-plus-toolbar {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;
      background: #ffffff;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      box-sizing: border-box;
      width: 100%;
    }

    .ap-plus-toolbar-row {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      box-sizing: border-box;
    }

    .ap-plus-toolbar-meta {
      justify-content: space-between;
      align-items: center;
    }

    .ap-plus-summary-badge {
      font-size: 13px;
      font-weight: 900;
      color: var(--color-primary-dark);
      white-space: nowrap;
    }

    .ap-plus-chk-label {
      border: none !important;
      padding: 0 !important;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
      font-size: 12px;
      font-weight: 800;
      color: var(--color-text-main);
      white-space: nowrap;
    }

    .ap-plus-toolbar-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .ap-plus-search-input {
      flex: 1;
      min-width: 0;
      box-sizing: border-box;
      padding: 7px 10px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 12px;
      outline: none;
      background: #ffffff;
      color: var(--color-text-main);
    }
    .ap-plus-search-input:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.15);
    }

    .ap-plus-select {
      flex-shrink: 0;
      min-width: 0;
      max-width: 150px;
      box-sizing: border-box;
      padding: 7px 8px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      color: var(--color-text-sub);
      outline: none;
      background: #ffffff;
    }

    .ap-plus-toolbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .btn-ap-plus-add {
      flex: 1;
      background: var(--color-primary-dark);
      color: #ffffff;
      border: none;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      box-sizing: border-box;
      white-space: nowrap;
      transition: background 0.15s ease;
    }
    .btn-ap-plus-add:hover {
      background: #0284c7;
    }

    .btn-ap-plus-sync {
      flex: 1;
      background: #f1f5f9;
      color: var(--color-primary-dark);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      box-sizing: border-box;
      white-space: nowrap;
      transition: background 0.15s ease;
    }
    .btn-ap-plus-sync:hover {
      background: #e2e8f0;
    }

    @media (min-width: 720px) {
      .ap-plus-toolbar {
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
      }
      .ap-plus-toolbar-meta {
        width: auto;
        gap: 16px;
      }
      .ap-plus-toolbar-controls {
        width: auto;
        flex: 1;
        max-width: 420px;
      }
      .ap-plus-toolbar-actions {
        width: auto;
      }
      .btn-ap-plus-add, .btn-ap-plus-sync {
        flex: initial;
      }
    }

    .ap-plus-table-wrap {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }

    .ap-plus-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      text-align: left;
    }

    .ap-plus-table th {
      background: #f8fafc;
      color: var(--color-text-sub);
      font-weight: 800;
      padding: 10px 10px;
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
    }

    .ap-plus-table td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--border-color);
      color: var(--color-text-main);
      vertical-align: middle;
    }

    .ap-plus-table tr:hover td {
      background: #f8fafc;
    }

    .ap-plus-table tr:last-child td {
      border-bottom: none;
    }

    .ap-no-cell {
      font-weight: 800;
      color: var(--color-text-muted);
      text-align: center;
      width: 44px;
    }

    .ap-title-cell {
      font-weight: 800;
      color: var(--color-text-main);
      cursor: pointer;
    }

    .ap-title-cell:hover {
      color: var(--color-primary);
      text-decoration: underline;
    }

    .ap-const-cell {
      font-weight: 900;
      color: var(--color-primary-dark);
      text-align: right;
    }

    .ap-date-cell {
      color: var(--color-text-sub);
      font-weight: 700;
      white-space: nowrap;
      text-align: center;
    }

    .ap-action-cell {
      text-align: center;
      white-space: nowrap;
    }

    .btn-table-action {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 13px;
      padding: 4px;
      border-radius: 4px;
      color: var(--color-text-muted);
    }

    .btn-table-action:hover {
      background: #f1f5f9;
      color: var(--color-text-main);
    }

    .btn-table-action.del:hover {
      color: #dc2626;
      background: #fee2e2;
    }

    .ap-plus-table.hide-date .col-date {
      display: none !important;
    }

    /* Unsaved Changes Floating Bar (Bottom) */
    .unsaved-bar {
      position: fixed;
      bottom: calc(56px + env(safe-area-inset-bottom, 0px) + 12px);
      left: 50%;
      transform: translateX(-50%) translateY(120%);
      width: calc(100% - 28px);
      max-width: 480px;
      z-index: 98;
      background: var(--color-primary-dark);
      border: 1.5px solid var(--color-gold);
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 24px rgba(20, 73, 115, 0.35);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
    }

    .unsaved-bar.visible {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    .unsaved-text-group {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .unsaved-dot {
      color: var(--color-gold);
      font-size: 13px;
      animation: pulseDot 1.5s infinite;
    }

    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    .unsaved-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .btn-unsaved-discard {
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      border-radius: 8px;
      padding: 6px 11px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-unsaved-discard:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .btn-unsaved-save {
      background: var(--color-gold);
      border: none;
      color: #ffffff;
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(217, 119, 6, 0.4);
      transition: all 0.15s;
    }

    .btn-unsaved-save:hover {
      background: #b45309;
      transform: translateY(-1px);
    }

    .btn-unsaved-save:active {
      transform: translateY(0);
    }

    /* Save Toast */
    .save-toast {
      position: fixed;
      bottom: calc(56px + env(safe-area-inset-bottom, 0px) + 16px);
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: #10b981;
      color: #ffffff;
      font-weight: 800;
      font-size: 13px;
      padding: 8px 18px;
      border-radius: 20px;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
      z-index: 99;
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .save-toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* Settings View */
    .settings-panel {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .settings-panel h3 {
      font-size: 14px;
      margin-bottom: 6px;
      color: var(--color-primary-dark);
      font-weight: 800;
    }

    .settings-panel p {
      font-size: 12px;
      color: var(--color-text-sub);
      margin-bottom: 10px;
      line-height: 1.5;
    }

    .action-btn-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .panel-btn {
      padding: 8px 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border-beige);
      border-radius: 6px;
      color: var(--color-text-main);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .panel-btn.danger-zone {
      background: #fee2e2;
      color: #dc2626;
      border-color: #fca5a5;
    }

    /* Custom Song Addition Form */
    .new-song-form {
      margin-top: 10px;
    }

    .form-row-2col {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 10px;
      margin-bottom: 10px;
    }

    @media (max-width: 440px) {
      .form-row-2col {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-label {
      font-size: 11px;
      font-weight: 800;
      color: var(--color-text-sub);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .required-star {
      color: #ef4444;
      font-weight: 900;
    }

    .form-note {
      font-size: 10px;
      color: var(--color-text-muted);
      font-weight: normal;
    }

    .form-input {
      background: var(--bg-input);
      border: 1.5px solid var(--border-color);
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-main);
      outline: none;
      transition: all 0.15s;
    }

    .form-input:focus {
      background: #ffffff;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(0, 119, 204, 0.12);
    }

    .form-diff-section {
      background: #f8fafc;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 12px;
    }

    .diff-input-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-top: 8px;
    }

    @media (max-width: 500px) {
      .diff-input-grid {
        grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
      }
    }

    .diff-input-card {
      background: #ffffff;
      border: 1.5px solid var(--border-color);
      border-radius: 6px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
    }

    .diff-input-card.diff-I-box { border-top: 3px solid var(--diff-i); }
    .diff-input-card.diff-II-box { border-top: 3px solid var(--diff-ii); }
    .diff-input-card.diff-III-box { border-top: 3px solid var(--diff-iii); }
    .diff-input-card.diff-IV-box { border-top: 3px solid var(--diff-iv); }
    .diff-input-card.diff-IV-alpha-box { border-top: 3px solid var(--diff-iv-alpha); }

    .diff-input-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      gap: 4px;
    }

    .diff-tag-pill {
      font-size: 10px;
      font-weight: 900;
      color: #ffffff;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .diff-tag-pill.diff-I { background-color: var(--diff-i); }
    .diff-tag-pill.diff-II { background-color: var(--diff-ii); }
    .diff-tag-pill.diff-III { background-color: var(--diff-iii); }
    .diff-tag-pill.diff-IV { background-color: var(--diff-iv); }
    .diff-tag-pill.diff-IV-alpha { background-color: var(--diff-iv-alpha); }

    .calc-level-tag {
      font-size: 11px;
      font-weight: 800;
      color: var(--color-primary-dark);
      background: #eaf3fb;
      padding: 1px 4px;
      border-radius: 3px;
    }

    .diff-num-input {
      width: 100%;
      border: 1px solid var(--border-color);
      background: var(--bg-input);
      border-radius: 4px;
      padding: 4px 6px;
      font-size: 13px;
      font-weight: 800;
      text-align: center;
      color: var(--color-text-main);
      outline: none;
    }

    .diff-num-input:focus {
      background: #ffffff;
      border-color: var(--color-primary);
    }

    .btn-add-song {
      width: 100%;
      padding: 10px;
      background: var(--color-primary-dark);
      color: #ffffff;
      border: none;
      font-size: 13px;
      font-weight: 800;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(20, 73, 115, 0.2);
      transition: all 0.15s;
    }

    .btn-add-song:hover {
      background: var(--color-primary);
    }

    /* Staged & Custom Cards */
    .staged-section {
      background: #fffdf5;
      border: 1.5px dashed var(--color-gold);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .staged-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .staged-title {
      font-size: 13px;
      font-weight: 800;
      color: #92400e;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .unsaved-badge {
      background: var(--color-gold);
      color: #ffffff;
      font-size: 10px;
      font-weight: 900;
      padding: 1px 6px;
      border-radius: 10px;
    }

    .staged-cards-list,
    .saved-custom-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .staged-song-card,
    .saved-custom-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .staged-song-card {
      border-left: 4px solid var(--color-gold);
    }

    .saved-custom-card {
      border-left: 4px solid var(--color-primary);
    }

    .custom-card-main {
      min-width: 0;
      flex: 1;
    }

    .custom-card-title {
      font-size: 14px;
      font-weight: 800;
      color: var(--color-text-main);
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .custom-card-meta {
      font-size: 11px;
      color: var(--color-text-sub);
      display: flex;
      gap: 6px;
      align-items: center;
      margin-bottom: 6px;
    }

    .custom-diffs-chips {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .custom-diff-chip {
      font-size: 10px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 3px;
      color: #ffffff;
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .custom-diff-chip.chip-I { background-color: var(--diff-i); }
    .custom-diff-chip.chip-II { background-color: var(--diff-ii); }
    .custom-diff-chip.chip-III { background-color: var(--diff-iii); }
    .custom-diff-chip.chip-IV { background-color: var(--diff-iv); }
    .custom-diff-chip.chip-IV-alpha { background-color: var(--diff-iv-alpha); }

    .btn-card-action {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #dc2626;
      border-radius: 6px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s;
    }

    .btn-card-action:hover {
      background: #fecaca;
    }

    /* Song Pack Order Manager */
    .pack-order-list {
      max-height: 340px;
      overflow-y: auto;
      border: 1.5px solid var(--border-color);
      border-radius: 8px;
      background: #f8fafc;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      user-select: none;
      -webkit-user-select: none;
    }

    .pack-order-item {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      transition: background-color 0.15s, border-color 0.15s;
    }

    .pack-order-item.dragging {
      opacity: 0.45;
      background: #e0f2fe;
      border: 1.5px dashed var(--color-primary);
    }

    .pack-order-item.drag-over {
      border-top: 2.5px solid var(--color-primary);
    }

    .pack-item-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1;
    }

    .pack-drag-handle {
      cursor: grab;
      color: var(--color-text-muted);
      font-size: 15px;
      padding: 4px 6px;
      touch-action: none;
      user-select: none;
      line-height: 1;
    }

    .pack-drag-handle:active {
      cursor: grabbing;
      color: var(--color-primary);
    }

    .pack-order-num {
      font-size: 11px;
      font-weight: 800;
      color: var(--color-text-muted);
      min-width: 22px;
      text-align: right;
    }

    .pack-order-name {
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .pack-item-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .btn-pack-order {
      background: #f1f5f9;
      border: 1px solid var(--border-color);
      color: var(--color-text-main);
      border-radius: 4px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-pack-order:hover:not(:disabled) {
      background: #e2e8f0;
      border-color: #cbd5e1;
    }

    .btn-pack-order:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }

    .btn-pack-delete {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #dc2626;
      border-radius: 4px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .btn-pack-delete:hover {
      background: #fecaca;
    }

    /* Google Spreadsheet Sync */
    .gas-sync-panel {
      border: 1.5px solid #a7f3d0;
      background: #f0fdf4;
    }
    .gas-sync-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 9999px;
      background: #e2e8f0;
      color: #64748b;
    }
    .gas-sync-badge.connected {
      background: #dcfce7;
      color: #15803d;
    }
    .gas-guide-details {
      background: #ffffff;
      border: 1px solid #d1fae5;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12px;
      margin-top: 4px;
    }
    .gas-guide-details summary {
      cursor: pointer;
      font-weight: 700;
      color: #065f46;
      outline: none;
    }
    .gas-guide-content {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px dashed #d1fae5;
    }

    /* Official Update Panel & Modal */
    .official-update-panel {
      background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
      border: 1.5px solid #38bdf8;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.12);
    }
    .official-update-banner-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .official-update-text {
      flex: 1;
      min-width: 220px;
    }
    .official-update-text h3 {
      margin-bottom: 4px;
      color: #0369a1;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 900;
    }
    .official-update-text p {
      margin: 0;
      font-size: 12px;
      color: #334155;
      line-height: 1.4;
    }
    .btn-check-updates {
      background: linear-gradient(135deg, #0284c7, #0369a1);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 6px rgba(2, 132, 199, 0.3);
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .btn-check-updates:hover {
      background: linear-gradient(135deg, #0369a1, #075985);
      transform: translateY(-1px);
    }
    .btn-check-updates:active {
      transform: translateY(0);
    }

    /* Update Modal Layout */
    .update-modal-box {
      max-width: 600px;
      width: 100%;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding: 0 !important;
      overflow: hidden;
      border-radius: 14px;
    }
    .update-modal-header {
      padding: 14px 16px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
    }
    .update-modal-title {
      font-size: 15px;
      font-weight: 900;
      color: var(--color-primary-dark);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .update-modal-body {
      padding: 14px 16px;
      overflow-y: auto;
      flex: 1;
      box-sizing: border-box;
      -webkit-overflow-scrolling: touch;
    }
    .update-summary-banner {
      background: #f1f5f9;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 800;
      color: var(--color-text-main);
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 6px;
    }
    .update-section-title {
      font-size: 13px;
      font-weight: 900;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .update-cards-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .update-card {
      background: #ffffff;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: border-color 0.15s ease;
    }
    .update-card-new {
      border-left: 4px solid #10b981;
    }
    .update-card-mod {
      border-left: 4px solid #0284c7;
    }
    .update-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 6px;
    }
    .update-card-title-wrap {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      font-size: 13px;
      font-weight: 800;
      color: var(--color-text-main);
    }
    .update-badge {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .update-badge-new {
      background: #dcfce7;
      color: #15803d;
    }
    .update-badge-mod {
      background: #e0f2fe;
      color: #0369a1;
    }
    .update-card-meta {
      font-size: 11px;
      color: var(--color-text-sub);
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }
    .update-diffs-pills {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .update-diff-pill {
      font-size: 10px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f1f5f9;
      color: var(--color-text-sub);
      border: 1px solid var(--border-color);
    }
    .update-changes-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      background: #f8fafc;
      padding: 6px 10px;
      border-radius: 6px;
      margin-bottom: 6px;
    }
    .update-change-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
    }
    .update-change-label {
      font-weight: 800;
      color: var(--color-text-sub);
      min-width: 55px;
    }
    .update-change-val-old {
      color: #dc2626;
      text-decoration: line-through;
      font-weight: 700;
    }
    .update-change-arrow {
      color: var(--color-text-sub);
      font-weight: 800;
    }
    .update-change-val-new {
      color: #16a34a;
      font-weight: 800;
    }
    .update-card-score-notice {
      font-size: 10px;
      font-weight: 700;
      color: #059669;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .update-modal-footer {
      padding: 12px 16px;
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      background: #f8fafc;
    }
  </style>
</head>
<body>

  <!-- Top Header -->
  <header>
    <div class="rating-banner">
      <div class="rating-left-box">
        <div class="rating-label">ROTAENO RATING</div>
        <div class="rating-value-row">
          <div class="rating-value" id="totalRating">0.0000</div>
          <div class="rating-theo">/ 理論値 <span id="theoMaxRating">17.8860</span></div>
        </div>
      </div>
      <div class="rating-right-box">
        <div class="completion-badge">
          <div class="completion-title">完成度</div>
          <div class="completion-value">
            <span id="completionSum">0.000</span> / <span id="completionMax">460</span>
            <span class="completion-rate" id="completionRate">(0.00%)</span>
          </div>
        </div>
        <div style="font-size: 11px; color: var(--color-text-sub); font-weight:700;" id="scoreCount">0 / 0 登録</div>
      </div>
    </div>
    <div class="breakdown-row">
      <div class="breakdown-item">
        <div class="breakdown-tag">b10 (×0.06)</div>
        <div class="breakdown-num highlight-b10" id="b10Sum">0.000</div>
      </div>
      <div class="breakdown-item">
        <div class="breakdown-tag">b11-20 (×0.02)</div>
        <div class="breakdown-num" id="b20Sum">0.000</div>
      </div>
      <div class="breakdown-item">
        <div class="breakdown-tag">b21-40 (×0.01)</div>
        <div class="breakdown-num" id="b40Sum">0.000</div>
      </div>
    </div>
  </header>

  <!-- Floating Action Buttons (Centered Group: TOP & Filter) -->
  <div class="floating-btn-group" id="floatingBtnGroup">
    <button class="action-fab" id="btnScrollTop" title="ページ最上部へ戻る" type="button">
      <span class="fab-icon">⬆️</span>
      <span>TOPへ</span>
    </button>
    <button class="action-fab filter-fab" id="btnOpenFilterModal" title="絞り込み・並び替えメニューを開く" type="button">
      <span class="fab-icon">☰</span>
      <span>絞り込み</span>
      <span class="filter-badge-dot" id="filterBadgeDot" style="display: none;"></span>
    </button>
  </div>

  <!-- Content Container -->
  <main class="container">
    <!-- View: Song List -->
    <div id="viewSongs">
      <div id="songGroupToolbar" class="song-group-toolbar" style="display: none;">
        <div class="song-group-toolbar-info">
          <span id="songGroupToolbarCount">0 グループ</span>
        </div>
        <div class="song-group-toolbar-actions">
          <button type="button" class="btn-group-toggle" id="btnExpandAllGroups">📂 すべて展開</button>
          <button type="button" class="btn-group-toggle" id="btnCollapseAllGroups">📁 すべて折りたたむ</button>
        </div>
      </div>
      <div class="song-list" id="songListContainer"></div>
    </div>

    <!-- View: MyPage (Stats, Best 40, AP+ Records) -->
    <div id="viewMypage" style="display: none;">
      <!-- MyPage Sub-Navigation (Pseudo Page Transition) -->
      <div class="mypage-subnav">
        <button class="mypage-nav-btn active" id="mypageNavStats" data-subview="stats" type="button">
          <span>📊</span>
          <span>総合進捗・統計</span>
        </button>
        <button class="mypage-nav-btn" id="mypageNavB40" data-subview="b40" type="button">
          <span>👑</span>
          <span>BEST 40</span>
        </button>
        <button class="mypage-nav-btn" id="mypageNavApPlus" data-subview="applus" type="button">
          <span>🌟</span>
          <span>理論値(AP+)記録</span>
          <span class="mypage-nav-badge" id="mypageApPlusCountBadge">0</span>
        </button>
      </div>

      <!-- SubView 1: Stats & Fill Progress -->
      <div class="mypage-subview" id="mypageSubStats">
        <!-- Quick Jump Cards -->
        <div class="mypage-jump-grid">
          <div class="mypage-jump-card jump-card-gold" id="jumpCardToB40">
            <div class="jump-card-header">
              <div class="jump-card-title"><span>👑</span> BEST 40 一覧</div>
              <div class="jump-card-sub" id="statPreviewRating">総合 Rating -</div>
            </div>
            <div style="font-size: 11px; color: var(--color-text-sub);" id="statPreviewB40Avg">B10 / B20 / B40 内訳を確認</div>
            <div class="jump-card-cta">BEST 40 一覧を見る →</div>
          </div>

          <div class="mypage-jump-card jump-card-rainbow" id="jumpCardToApPlus">
            <div class="jump-card-header">
              <div class="jump-card-title"><span>🌟</span> IV以上 理論値(AP+)記録</div>
              <div class="jump-card-sub" id="statPreviewApCount">- 曲達成</div>
            </div>
            <div style="font-size: 11px; color: var(--color-text-sub);" id="statPreviewLatestAp">最新記録を確認・追加</div>
            <div class="jump-card-cta">理論値記録一覧を見る →</div>
          </div>
        </div>

        <!-- Difficulty Scope Selector Card -->
        <div class="stats-scope-selector-card">
          <div class="stats-scope-info">
            <span class="stats-scope-icon">🎯</span>
            <div>
              <div class="stats-scope-title">達成状況の集計対象</div>
              <div class="stats-scope-desc">ランプ内訳・進捗率・レベル別・パック別の集計難易度を切り替え</div>
            </div>
          </div>
          <div class="stats-scope-pills">
            <button type="button" class="stats-scope-btn active" id="btnScopeAll">🌐 全難易度 (全1,766譜面)</button>
            <button type="button" class="stats-scope-btn" id="btnScopeIv">⚡ IV / IV-α のみ (全467譜面)</button>
          </div>
        </div>

        <!-- Overall Lamp Breakdown -->
        <div class="stats-panel-box">
          <div class="stats-panel-title"><span>🏆</span> 達成状況・クリアランプ内訳</div>
          <div style="margin-bottom: 6px; display:flex; justify-content:space-between; font-size:12px; font-weight:800;">
            <span id="statOverallRegisteredLabel">全難易度 登録進捗</span>
            <span id="statOverallRegisteredProgress">- / - (0.0%)</span>
          </div>
          <div class="stacked-bar-wrap" style="height: 12px; margin-bottom: 12px;">
            <div id="statOverallBarApplus" class="bar-seg-applus" style="width: 0%;"></div>
            <div id="statOverallBarAp" class="bar-seg-ap" style="width: 0%;"></div>
            <div id="statOverallBarFc" class="bar-seg-fc" style="width: 0%;"></div>
            <div id="statOverallBarClear" class="bar-seg-clear" style="width: 0%;"></div>
          </div>

          <div class="lamp-stat-grid" id="statLampGrid">
            <!-- Dynamically populated lamp cells -->
          </div>

          <div class="stats-meta-row">
            <div class="stats-meta-pill" id="statAvgScoreBox">
              <span class="stats-meta-pill-lbl" id="statAvgScoreLbl">登録全譜面 平均スコア</span>
              <span class="stats-meta-pill-val" id="statAvgScore">-</span>
            </div>
            <div class="stats-meta-pill" id="statIvAvgScoreBox">
              <span class="stats-meta-pill-lbl" id="statIvAvgScoreLbl">IV/IV-α 平均スコア</span>
              <span class="stats-meta-pill-val" id="statIvAvgScore">-</span>
            </div>
            <div class="stats-meta-pill" id="statIvUnApBox">
              <span class="stats-meta-pill-lbl" id="statIvUnApLbl">IV/IV-α 未AP残数</span>
              <span class="stats-meta-pill-val" id="statIvUnAp" style="color: #ea580c;">-</span>
            </div>
            <div class="stats-meta-pill" id="statIvRemainingBox">
              <span class="stats-meta-pill-lbl" id="statIvRemainingLbl">IV/IV-α 未AP+残数</span>
              <span class="stats-meta-pill-val" id="statIvRemaining" style="color: #ff758c;">-</span>
            </div>
          </div>
        </div>

        <!-- Difficulty Stats Table -->
        <div class="stats-panel-box">
          <div class="stats-panel-title" id="diffStatTitle"><span>🎯</span> 難易度別クリアランプ・達成状況</div>
          <div class="diff-stat-table-wrap">
            <table class="diff-stat-table">
              <thead>
                <tr>
                  <th>難易度</th>
                  <th>登録数 / 総数</th>
                  <th>進捗率</th>
                  <th>AP+</th>
                  <th>AP</th>
                  <th>FC</th>
                  <th>平均点</th>
                </tr>
              </thead>
              <tbody id="diffStatTableBody">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- Level Fill Progress (Gamified) -->
        <div class="stats-panel-box">
          <div class="stats-panel-title" id="levelStatTitle"><span>📈</span> レベル別 埋まり状況 (Lv.1 〜 Lv.14+)</div>
          <div style="font-size: 11px; color: var(--color-text-sub); margin-bottom: 10px;" id="levelStatNote">
            各レベルごとのクリア・フルコンボ・AP達成度（金: AP+ / 橙: AP / 青: FC / 緑: CLEAR）
          </div>
          <div id="levelStatContainer">
            <!-- Dynamically populated level rows -->
          </div>
        </div>

        <!-- Song Pack Progress (Gamified Collection) -->
        <div class="stats-panel-box">
          <div class="stats-panel-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
            <div class="stats-panel-title" id="packStatHeaderTitle" style="margin-bottom:0;"><span>🎵</span> ソングパック別 進捗一覧 (全パック)</div>
            <input type="text" id="packStatSearch" placeholder="🔍 パック名で検索..." style="padding:6px 10px; border:1px solid var(--border-color); border-radius:6px; font-size:12px; outline:none; max-width:180px;">
          </div>
          <div id="packStatContainer">
            <!-- Dynamically populated pack cards -->
          </div>
        </div>
      </div>

      <!-- SubView 2: Best 40 -->
      <div class="mypage-subview" id="mypageSubB40" style="display: none;">
        <div class="b40-top-bar">
          <button class="btn-subview-back" id="btnBackToStatsFromB40" type="button">← 総合進捗に戻る</button>
          <div class="b40-subview-title">👑 BEST 40 一覧</div>
        </div>
        <div class="b40-title">
          <span>BEST 1-10 (金枠 / 係数 0.06)</span>
          <span id="b10Avg" style="color: var(--color-gold);">平均: 0.000</span>
        </div>
        <div class="b40-list" id="b10Grid"></div>

        <div class="b40-title">
          <span>BEST 11-20 (青枠 / 係数 0.02)</span>
          <span id="b20Avg" style="color: var(--color-primary-dark);">平均: 0.000</span>
        </div>
        <div class="b40-list" id="b20Grid"></div>

        <div class="b40-title">
          <span>BEST 21-40 (通常枠 / 係数 0.01)</span>
          <span id="b40Avg">平均: 0.000</span>
        </div>
        <div class="b40-list" id="b40Grid"></div>
      </div>

      <!-- SubView 3: AP+ Theory Records (IV and IV-alpha) -->
      <div class="mypage-subview" id="mypageSubApPlus" style="display: none;">
        <div class="b40-top-bar">
          <button class="btn-subview-back" id="btnBackToStatsFromApPlus" type="button">← 総合進捗に戻る</button>
          <div class="b40-subview-title">🌟 IV以上 理論値 (AP+) 記録</div>
        </div>

        <div class="ap-plus-toolbar">
          <div class="ap-plus-toolbar-row ap-plus-toolbar-meta">
            <span class="ap-plus-summary-badge" id="apPlusSummaryBadge">達成数: - 曲</span>
            <label class="checkbox-label ap-plus-chk-label" title="取得日列の表示・非表示を切り替えます">
              <input type="checkbox" id="chkShowApPlusDate" checked>
              <span>取得日列を表示</span>
            </label>
          </div>
          <div class="ap-plus-toolbar-row ap-plus-toolbar-controls">
            <input type="text" id="apPlusSearchInput" class="ap-plus-search-input" placeholder="🔍 曲名・Noで検索...">
            <select id="apPlusSortSelect" class="ap-plus-select">
              <option value="NO_ASC">No昇順 (達成順)</option>
              <option value="NO_DESC">No降順 (最新順)</option>
              <option value="DATE_DESC">取得日 (新しい順)</option>
              <option value="DATE_ASC">取得日 (古い順)</option>
              <option value="CONST_DESC">定数 (高い順)</option>
              <option value="CONST_ASC">定数 (低い順)</option>
              <option value="TITLE">曲名順</option>
            </select>
          </div>
          <div class="ap-plus-toolbar-row ap-plus-toolbar-actions">
            <button class="btn-ap-plus-add" id="btnOpenAddApPlusModal" type="button">＋ 記録追加</button>
            <button class="btn-ap-plus-sync" id="btnAutoSyncApPlus" type="button" title="スコアが1010000点またはAP+のIV/IV-α譜面を一括同期">⚡ スコア自動同期</button>
          </div>
        </div>

        <div class="ap-plus-table-wrap">
          <table class="ap-plus-table" id="apPlusTable">
            <thead>
              <tr>
                <th style="text-align:center; width:44px;">No</th>
                <th>曲名</th>
                <th style="text-align:center; width:55px;">難易度</th>
                <th style="text-align:center; width:44px;">Lv</th>
                <th style="text-align:right; width:50px;">定数</th>
                <th class="col-date" style="text-align:center; width:95px;">AP+取得日</th>
                <th style="text-align:center; width:70px;">操作</th>
              </tr>
            </thead>
            <tbody id="apPlusTableBody">
              <!-- Dynamically populated table rows -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- View: Backup / Settings -->
    <div id="viewSettings" style="display: none;">
      <!-- Section: Official Songs & Update Sync -->
      <div class="settings-panel official-update-panel">
        <div class="official-update-banner-inner">
          <div class="official-update-text">
            <h3>✨ 新譜面・公式アプデ情報の確認</h3>
            <p>管理者の親スプシ（RotaenoDB）から最新の追加楽曲や定数改定を自動検出し、プレビュー確認の上で一括反映できます（入力済みスコアは維持されます）。</p>
          </div>
          <button type="button" class="btn-check-updates" id="btnCheckOfficialUpdates">
            <span>⚡</span> アプデ情報を確認
          </button>
        </div>
      </div>

      <!-- Section: Add Song Card -->
      <div class="settings-panel">
        <h3>➕ 新曲の追加登録</h3>
        <p>公式アップデート等で登場した新曲の譜面データを追加できます。定数を入力するとレベルが自動算出されます。登録した楽曲はマスター楽曲データベースに直接統合され、曲一覧やスコア入力・統計に即時反映されます。</p>
        
        <div class="new-song-form">
          <div class="form-row-2col">
            <div class="form-group">
              <label class="form-label" for="newSongTitle">曲名 <span class="required-star">*</span></label>
              <input type="text" id="newSongTitle" class="form-input" placeholder="曲名を入力 (例: Future Strike)">
            </div>
            <div class="form-group">
              <label class="form-label" for="newSongPack">ソングパック</label>
              <input type="text" id="newSongPack" class="form-input" placeholder="パック名 (例: 基本曲)" list="packDatalist">
              <datalist id="packDatalist"></datalist>
            </div>
          </div>

          <div class="form-row-2col" style="margin-bottom: 10px;">
            <div class="form-group">
              <label class="form-label" for="newSongVersion">バージョン</label>
              <input type="text" id="newSongVersion" class="form-input" placeholder="バージョン (例: v5.6.0)" list="versionDatalist">
              <datalist id="versionDatalist"></datalist>
            </div>
            <div class="form-group">
              <label class="form-label" for="insertAfterSong">直前の楽曲 (デフォルト順序) <span class="form-note">※パック選択で自動補完</span></label>
              <input type="text" id="insertAfterSong" class="form-input" placeholder="基準となる直前の曲名を選択" list="songDatalist">
              <datalist id="songDatalist"></datalist>
            </div>
          </div>

          <div class="form-diff-section">
            <div class="form-label">難易度定数 <span class="form-note">※定数からレベルを自動算出 (IV-α は任意/空欄可)</span></div>
            <div class="diff-input-grid">
              <!-- Diff I -->
              <div class="diff-input-card diff-I-box">
                <div class="diff-input-header">
                  <span class="diff-tag-pill diff-I">I</span>
                  <span class="calc-level-tag" id="previewLevelI">Lv.-</span>
                </div>
                <input type="number" step="0.1" min="1.0" max="16.0" id="newConstI" class="diff-num-input" placeholder="例: 3.0">
              </div>

              <!-- Diff II -->
              <div class="diff-input-card diff-II-box">
                <div class="diff-input-header">
                  <span class="diff-tag-pill diff-II">II</span>
                  <span class="calc-level-tag" id="previewLevelII">Lv.-</span>
                </div>
                <input type="number" step="0.1" min="1.0" max="16.0" id="newConstII" class="diff-num-input" placeholder="例: 7.2">
              </div>

              <!-- Diff III -->
              <div class="diff-input-card diff-III-box">
                <div class="diff-input-header">
                  <span class="diff-tag-pill diff-III">III</span>
                  <span class="calc-level-tag" id="previewLevelIII">Lv.-</span>
                </div>
                <input type="number" step="0.1" min="1.0" max="16.0" id="newConstIII" class="diff-num-input" placeholder="例: 10.8">
              </div>

              <!-- Diff IV -->
              <div class="diff-input-card diff-IV-box">
                <div class="diff-input-header">
                  <span class="diff-tag-pill diff-IV">IV</span>
                  <span class="calc-level-tag" id="previewLevelIV">Lv.-</span>
                </div>
                <input type="number" step="0.1" min="1.0" max="16.0" id="newConstIV" class="diff-num-input" placeholder="例: 13.6">
              </div>

              <!-- Diff IV-α (Optional) -->
              <div class="diff-input-card diff-IV-alpha-box">
                <div class="diff-input-header">
                  <span class="diff-tag-pill diff-IV-alpha">IV-α</span>
                  <span class="calc-level-tag" id="previewLevelIVAlpha">任意</span>
                </div>
                <input type="number" step="0.1" min="1.0" max="16.0" id="newConstIVAlpha" class="diff-num-input" placeholder="任意">
              </div>
            </div>
          </div>

          <button type="button" class="btn-add-song" id="btnAddSongCard">＋ 楽曲を追加してマスターに登録</button>
        </div>
      </div>

      <!-- Section: Staged (Unsaved) Cards -->
      <div class="staged-section" id="stagedCardsSection" style="display: none;">
        <div class="staged-header">
          <div class="staged-title">
            <span class="unsaved-badge">未保存</span> 追加予定の楽曲 (<span id="stagedCardsCount">0</span>曲)
          </div>
          <div style="font-size: 11px; color: #92400e;">※下部の「💾 保存する」で確定</div>
        </div>
        <div class="staged-cards-list" id="stagedCardsList"></div>
      </div>


      <!-- Section: Edit Song Master Data -->
      <div class="settings-panel">
        <h3>✏️ 楽曲データの編集（定数・難易度改定）</h3>
        <p>公式アップデートによる譜面定数の改定や、曲名・パック名・難易度の変更ができます。全楽曲（初期曲・追加曲問わず）を検索して即座に編集できます。</p>
        
        <div style="margin-bottom: 10px;">
          <input type="text" id="editSongSearchInput" class="form-input" placeholder="🔍 編集したい曲名で検索 (例: -1, Future Strike, 翠杜)" style="width: 100%; box-sizing: border-box;">
        </div>

        <div id="editSongSearchResult" style="display: flex; flex-direction: column; gap: 8px; max-height: 320px; overflow-y: auto;">
          <div style="font-size: 11px; color: var(--color-text-muted); text-align: center; padding: 12px;">曲名を入力して検索してください</div>
        </div>
      </div>

      <!-- Section: Song Pack Order Manager -->
      <div class="settings-panel">
        <h3>🎵 ソングパック管理・並び替え</h3>
        <p>ソングパックの追加・削除や、ゲーム内の並び順に合わせた並び替えができます。ドラッグ＆ドロップまたは上下矢印ボタン（▲/▼）で順番を自由に移動できます。</p>
        
        <div style="display: flex; gap: 8px; margin-bottom: 12px;">
          <input type="text" id="newPackNameInput" class="form-input" placeholder="新しいソングパック名を入力" style="flex: 1;">
          <button type="button" class="panel-btn" id="btnAddPackBtn" style="background: var(--color-primary-dark); color: #ffffff; font-weight: 800; white-space: nowrap;">追加</button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: var(--color-text-sub);">並び替え (<span id="packListCount">60</span>パック)</span>
          <button type="button" id="btnResetPackOrder" style="background: none; border: none; font-size: 11px; color: var(--color-primary); cursor: pointer; text-decoration: underline;">ゲーム初期順に戻す</button>
        </div>

        <div class="pack-order-list" id="packOrderList"></div>
      </div>

      <!-- Section: Google Spreadsheet Sync -->
      <div class="settings-panel gas-sync-panel">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
          <h3 style="margin-bottom: 0;">☁️ Google スプレッドシート連携 (個人クラウド同期)</h3>
          <span class="gas-sync-badge" id="gasSyncBadge">未接続</span>
        </div>
        <p style="font-size: 12px; color: var(--color-text-sub); margin-bottom: 12px;">
          ご自身のGoogleスプレッドシートを個人データベースとして、スマホやPCからワンタップで双方向同期できます。デプロイやコード編集は一切不要です！
        </p>

        <div style="margin-bottom: 12px;">
          <label style="display: block; font-size: 11px; font-weight: 800; color: var(--color-text-sub); margin-bottom: 4px;">
            あなたのGoogleスプレッドシートのURL
          </label>
          <div style="display: flex; gap: 6px;">
            <input type="url" id="userSheetUrlInput" class="form-input" placeholder="https://docs.google.com/spreadsheets/d/.../edit" style="flex: 1; font-size: 12px;">
            <button type="button" class="panel-btn" id="btnSaveSheetUrl" style="background: var(--color-primary-dark); color: #fff; font-weight: 700; white-space: nowrap;">保存</button>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px; font-size: 11px; color: var(--color-text-muted);">
            <span>最終同期: <strong id="gasLastSyncText" style="color: var(--color-text-main);">未同期</strong></span>
            <button type="button" id="btnGasTest" style="background: none; border: none; font-size: 11px; color: var(--color-primary); cursor: pointer; text-decoration: underline;">🔗 接続テスト</button>
          </div>
        </div>

        <!-- Sync Mode & Important Warning Box -->
        <div style="background: #fff1f2; border: 1.5px solid #fecdd3; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 8px;">
            <label for="autoSyncToggle" style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; font-weight: 800; color: #9f1239;">
              <input type="checkbox" id="autoSyncToggle" style="width: 18px; height: 18px; cursor: pointer; accent-color: #e11d48;">
              <span>💾 変更保存時にスプシへ自動同期する</span>
            </label>
            <span id="autoSyncStateLabel" style="font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; background: #ffe4e6; color: #be123c;">OFF (手動同期)</span>
          </div>
          
          <div style="font-size: 11px; line-height: 1.5; color: #b91c1c;">
            <strong>⚠️ 重要：</strong> デフォルト（OFF）の場合、アプリ内でスコアや曲追加を保存してもスプレッドシート側には反映されません。必ず下の<strong>「☁️ スプシへ保存 (同期)」</strong>ボタンを押して明示的に同期を行ってください。
          </div>
          <div style="font-size: 10.5px; line-height: 1.4; color: #e11d48; margin-top: 5px;">
            ※自動同期を【ON】にすると、アプリ下部の「💾 保存する」を押した瞬間に裏でスプシへの送信が自動実行されます。通信環境によっては<strong>動作が重くなったり、通信量を消費する可能性があるためご注意ください</strong>。
          </div>
        </div>

        <div class="action-btn-group" style="margin-bottom: 12px;">
          <button class="panel-btn" id="btnGasUpload" style="background: #10b981; color: #ffffff; font-weight: 800; border-color: #059669;">
            ☁️ スプシへ保存 (同期)
          </button>
          <button class="panel-btn" id="btnGasDownload" style="background: #0284c7; color: #ffffff; font-weight: 800; border-color: #0369a1;">
            🔄 スプシから復元
          </button>
        </div>

        <!-- Setup Guide Accordion -->
        <details class="gas-guide-details" open>
          <summary>📖 初期設定手順（スマホでも1分・デプロイ不要！）</summary>
          <div class="gas-guide-content">
            <ol style="margin: 0; padding-left: 20px; font-size: 12px; line-height: 1.6; color: var(--color-text-main);">
              <li>Googleドライブで<strong>スプレッドシートを新規作成</strong>します（中身は空っぽでOK！<a href="https://sheets.new" target="_blank" rel="noopener noreferrer" style="color:var(--color-primary); font-weight:700;">sheets.new</a> を開くとワンタップで新規作成できます）。</li>
              <li>スプシ右上の「<strong>共有</strong>」ボタンを押し、一般的なアクセスを「<strong>リンクを知っている全員</strong>」、役割を「<strong>編集者</strong>」に変更します。</li>
              <li>「<strong>リンクをコピー</strong>」をタップします。</li>
              <li>このアプリに戻り、上の入力欄に貼り付けて「<strong>保存</strong>」を押せば完了です！</li>
            </ol>
            <p style="font-size: 11px; color: var(--color-text-muted); margin: 8px 0 0 0;">
              ※保存後、「☁️ スプシへ保存」を押すと全4シート（Songs, Scores, TheoryRecords, Config）が自動生成されます。
            </p>

            <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
              <details style="font-size: 11px; color: var(--color-text-muted);">
                <summary style="cursor: pointer; font-weight: 700;">⚙️ 詳細設定（中央APIエンドポイントの変更など）</summary>
                <div style="margin-top: 8px;">
                  <label style="display: block; font-size: 11px; font-weight: 700; margin-bottom: 4px;">中央連携API (GAS Web App URL)</label>
                  <input type="url" id="gasAppUrlInput" class="form-input" style="width: 100%; font-size: 11px; box-sizing: border-box;" placeholder="https://script.google.com/macros/s/.../exec">
                  <div style="display: flex; gap: 6px; margin-top: 6px;">
                    <button type="button" class="panel-btn" id="btnSaveGasUrl" style="font-size: 11px;">API URL保存</button>
                    <button type="button" class="panel-btn" id="btnCopyGasCode" style="font-size: 11px;">📋 GASコードをコピー</button>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </details>
      </div>

      <div class="settings-panel">
        <h3>データバックアップ / 引き継ぎ</h3>
        <p>スマホやPC間でスコアデータ、楽曲データ、ソングパック順序、および理論値(AP+)記録をバックアップ・復元できます。JSONテキストをコピーするかダウンロードして他端末で読み込んでください。</p>
        <div class="action-btn-group">
          <button class="panel-btn" id="btnExportJson">JSONをコピー</button>
          <button class="panel-btn" id="btnDownloadJson">JSONファイル保存</button>
          <button class="panel-btn" id="btnImportJson">JSONから復元</button>
        </div>
      </div>

      <div class="settings-panel">
        <h3>スプレッドシート用CSV出力</h3>
        <p>現在のスコアデータを元のスプレッドシートのスコア列に貼り付け可能な形式でコピーします。</p>
        <div class="action-btn-group">
          <button class="panel-btn" id="btnExportCsv">CSVをコピー</button>
        </div>
      </div>

      <div class="settings-panel">
        <h3>全データリセット</h3>
        <p>端末に保存されているスコア入力、追加楽曲、パック順序、理論値記録をすべて初期状態に戻します。</p>
        <div class="action-btn-group">
          <button class="panel-btn danger-zone" id="btnResetData">全データをリセット</button>
        </div>
      </div>
    </div>
  </main>

  <!-- Unsaved Changes Floating Bar -->
  <div class="unsaved-bar" id="unsavedBar">
    <div class="unsaved-text-group">
      <span class="unsaved-dot">●</span>
      <span>未保存の変更があります</span>
      <span id="unsavedCountText"></span>
    </div>
    <div class="unsaved-actions">
      <button class="btn-unsaved-discard" id="btnDiscardChanges" type="button">破棄</button>
      <button class="btn-unsaved-save" id="btnCommitChanges" type="button">💾 保存する</button>
    </div>
  </div>

  <div class="save-toast" id="saveToast">✔ 保存しました</div>

  <!-- Bottom Nav Tabs -->
  <nav class="bottom-bar">
    <button class="tab-item active" data-tab="songs">
      <span>🎵</span>楽曲一覧
    </button>
    <button class="tab-item" data-tab="mypage">
      <span>👤</span>マイページ
    </button>
    <button class="tab-item" data-tab="settings">
      <span>⚙️</span>データ管理
    </button>
  </nav>

  <!-- Filter & Sort Modal -->
  <div class="modal-overlay" id="filterModal">
    <div class="modal-box filter-modal-box">
      <div class="modal-head">
        <div class="modal-song-name">🔍 絞り込み・並び替え <span id="modalFilteredCount" style="font-size: 13px; color: var(--color-text-sub); font-weight: normal; margin-left: 4px;"></span></div>
        <button class="modal-close-btn" id="btnFilterModalClose">&times;</button>
      </div>

      <div class="filter-modal-body">
        <!-- Keyword Search -->
        <div class="modal-filter-section">
          <div class="modal-filter-label">キーワード検索</div>
          <div class="search-wrapper">
            <span class="search-icon">🔍</span>
            <input type="text" id="searchInput" class="search-input" placeholder="曲名、ID、パック名、バージョンで検索...">
          </div>
        </div>

        <!-- Sort Bar -->
        <div class="modal-filter-section">
          <div class="modal-filter-label">並び替え</div>
          <div class="sort-bar">
            <div class="sort-label">並び替え :</div>
            <select id="sortSelect" class="sort-select">
              <option value="DEFAULT">デフォルト</option>
              <option value="PACK">ソングパック順</option>
              <option value="TITLE">タイトル順</option>
              <option value="RATING">単曲レート順</option>
              <option value="VERSION">バージョン順</option>
              <option value="CONST">定数順</option>
              <option value="SCORE">スコア順</option>
            </select>
            <label class="checkbox-label" title="販売終了となった楽曲をリストに表示するか切り替えます">
              <input type="checkbox" id="chkShowDeleted" checked>
              <span>販売終了曲を表示</span>
            </label>
          </div>
        </div>

        <!-- Difficulty Filters -->
        <div class="modal-filter-section">
          <div class="modal-filter-label">難易度</div>
          <div class="filter-group" id="diffFilters">
            <div class="filter-btn active" data-filter="diff" data-val="ALL">全難易度</div>
            <div class="filter-btn" data-filter="diff" data-val="IV-α">IV-α</div>
            <div class="filter-btn" data-filter="diff" data-val="IV">IV</div>
            <div class="filter-btn" data-filter="diff" data-val="III">III</div>
            <div class="filter-btn" data-filter="diff" data-val="II">II</div>
            <div class="filter-btn" data-filter="diff" data-val="I">I</div>
          </div>
        </div>

        <!-- Level Filters -->
        <div class="modal-filter-section">
          <div class="modal-filter-label">レベル</div>
          <div class="filter-range-grid">
            <div class="filter-range-row">
              <div class="filter-input-wrap">
                <span class="filter-sub-label">レベル下限</span>
                <select id="filterLevelMin" class="filter-select-input">
                  <option value="">指定なし</option>
                  <option value="1">Lv.1</option>
                  <option value="2">Lv.2</option>
                  <option value="3">Lv.3</option>
                  <option value="4">Lv.4</option>
                  <option value="5">Lv.5</option>
                  <option value="6">Lv.6</option>
                  <option value="7">Lv.7</option>
                  <option value="8">Lv.8</option>
                  <option value="9">Lv.9</option>
                  <option value="10">Lv.10</option>
                  <option value="10+">Lv.10+</option>
                  <option value="11">Lv.11</option>
                  <option value="11+">Lv.11+</option>
                  <option value="12">Lv.12</option>
                  <option value="12+">Lv.12+</option>
                  <option value="13">Lv.13</option>
                  <option value="13+">Lv.13+</option>
                  <option value="14">Lv.14</option>
                  <option value="14+">Lv.14+</option>
                  <option value="15">Lv.15</option>
                  <option value="15+">Lv.15+</option>
                  <option value="16">Lv.16</option>
                </select>
              </div>
              <span class="filter-range-sep">〜</span>
              <div class="filter-input-wrap">
                <span class="filter-sub-label">レベル上限</span>
                <select id="filterLevelMax" class="filter-select-input">
                  <option value="">指定なし</option>
                  <option value="1">Lv.1</option>
                  <option value="2">Lv.2</option>
                  <option value="3">Lv.3</option>
                  <option value="4">Lv.4</option>
                  <option value="5">Lv.5</option>
                  <option value="6">Lv.6</option>
                  <option value="7">Lv.7</option>
                  <option value="8">Lv.8</option>
                  <option value="9">Lv.9</option>
                  <option value="10">Lv.10</option>
                  <option value="10+">Lv.10+</option>
                  <option value="11">Lv.11</option>
                  <option value="11+">Lv.11+</option>
                  <option value="12">Lv.12</option>
                  <option value="12+">Lv.12+</option>
                  <option value="13">Lv.13</option>
                  <option value="13+">Lv.13+</option>
                  <option value="14">Lv.14</option>
                  <option value="14+">Lv.14+</option>
                  <option value="15">Lv.15</option>
                  <option value="15+">Lv.15+</option>
                  <option value="16">Lv.16</option>
                </select>
              </div>
            </div>
            <div class="filter-input-wrap" style="margin-top: 4px;">
              <span class="filter-sub-label">レベル指定</span>
              <select id="filterLevelExact" class="filter-select-input">
                <option value="">指定なし</option>
                <option value="1">Lv.1</option>
                <option value="2">Lv.2</option>
                <option value="3">Lv.3</option>
                <option value="4">Lv.4</option>
                <option value="5">Lv.5</option>
                <option value="6">Lv.6</option>
                <option value="7">Lv.7</option>
                <option value="8">Lv.8</option>
                <option value="9">Lv.9</option>
                <option value="10">Lv.10</option>
                <option value="10+">Lv.10+</option>
                <option value="11">Lv.11</option>
                <option value="11+">Lv.11+</option>
                <option value="12">Lv.12</option>
                <option value="12+">Lv.12+</option>
                <option value="13">Lv.13</option>
                <option value="13+">Lv.13+</option>
                <option value="14">Lv.14</option>
                <option value="14+">Lv.14+</option>
                <option value="15">Lv.15</option>
                <option value="15+">Lv.15+</option>
                <option value="16">Lv.16</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Constant Filters -->
        <div class="modal-filter-section">
          <div class="modal-filter-label">定数</div>
          <div class="filter-group" id="constFilters">
            <div class="filter-btn active" data-filter="const" data-val="ALL">全定数</div>
            <div class="filter-btn" data-filter="const" data-val="14">14.0以上</div>
            <div class="filter-btn" data-filter="const" data-val="13">13.0以上</div>
          </div>
          <div class="filter-range-grid" style="margin-top: 4px;">
            <div class="filter-range-row">
              <div class="filter-input-wrap">
                <span class="filter-sub-label">定数下限</span>
                <input type="number" step="0.1" min="1.0" max="16.0" id="filterConstMin" class="filter-num-input" placeholder="例: 13.0">
              </div>
              <span class="filter-range-sep">〜</span>
              <div class="filter-input-wrap">
                <span class="filter-sub-label">定数上限</span>
                <input type="number" step="0.1" min="1.0" max="16.0" id="filterConstMax" class="filter-num-input" placeholder="例: 14.5">
              </div>
            </div>
            <div class="filter-input-wrap" style="margin-top: 4px;">
              <span class="filter-sub-label">定数指定</span>
              <input type="number" step="0.1" min="1.0" max="16.0" id="filterConstExact" class="filter-num-input" placeholder="例: 13.7">
            </div>
          </div>
        </div>

        <!-- Score & Status Filters -->
        <div class="modal-filter-section">
          <div class="modal-filter-label">プレイ状況・埋め作業用除外</div>
          <div class="filter-group" id="statusFilters">
            <div class="filter-btn" data-filter="status" data-val="FILLED">入力済</div>
            <div class="filter-btn" data-filter="status" data-val="B40">B40対象</div>
          </div>
          <div class="filter-checkbox-grid">
            <label class="checkbox-label" title="1,010,000点またはAP+の譜面を除外します">
              <input type="checkbox" id="chkExcludeApPlus">
              <span>AP+ 除外</span>
            </label>
            <label class="checkbox-label" title="AP以上の譜面を除外します（AP埋め用）">
              <input type="checkbox" id="chkExcludeAp">
              <span>AP 除外</span>
            </label>
            <label class="checkbox-label" title="FC以上の譜面を除外します（FC埋め用）">
              <input type="checkbox" id="chkExcludeFc">
              <span>FC 除外</span>
            </label>
            <label class="checkbox-label" title="1,000,000点以上の譜面を除外します（EX埋め用）">
              <input type="checkbox" id="chkExcludeEx">
              <span>EX (100万) 以上除外</span>
            </label>
            <label class="checkbox-label" title="登録・プレイ済の譜面を除外し、未プレイ譜面のみ表示します">
              <input type="checkbox" id="chkExcludePlayed">
              <span>既プレイ除外</span>
            </label>
          </div>
          <div class="filter-range-row" style="margin-top: 6px;">
            <div class="filter-input-wrap">
              <span class="filter-sub-label">スコア下限</span>
              <input type="number" min="0" max="1010000" step="1" id="filterScoreMin" class="filter-num-input" placeholder="例: 1000000">
            </div>
            <span class="filter-range-sep">〜</span>
            <div class="filter-input-wrap">
              <span class="filter-sub-label">スコア上限</span>
              <input type="number" min="0" max="1010000" step="1" id="filterScoreMax" class="filter-num-input" placeholder="例: 1009000">
            </div>
          </div>
        </div>
      </div>

      <div class="filter-modal-footer">
        <button class="btn-filter-reset" id="btnFilterReset" type="button">条件リセット</button>
        <button class="btn-filter-apply" id="btnFilterApply" type="button">完了</button>
      </div>
    </div>
  </div>

  <!-- Score Input Modal -->
  <div class="modal-overlay" id="inputModal">
    <div class="modal-box">
      <div class="modal-head">
        <div class="modal-song-name" id="modalSongTitle">曲名</div>
        <button class="modal-close-btn" id="btnModalClose">&times;</button>
      </div>

      <div class="input-display">
        <div class="score-input-wrap">
          <input type="text" id="modalScoreInput" class="score-number-input" placeholder="0" inputmode="numeric" autocomplete="off" spellcheck="false">
        </div>
        <div class="calc-info">
          <div class="calc-rating-text" id="modalPreviewRating">Rating 0.000</div>
        </div>
      </div>

      <div class="lamp-picker" id="statusSelector">
        <div class="lamp-choice" data-status="AP+">AP+</div>
        <div class="lamp-choice" data-status="AP">AP</div>
        <div class="lamp-choice" data-status="FC">FC</div>
        <div class="lamp-choice" data-status="CLEAR">CLEAR</div>
        <div class="lamp-choice" data-status="FAILED">FAILED</div>
      </div>

      <div class="quick-row">
        <button class="quick-pill" data-quick="1010000" data-status="AP+">AP+ (MAX)</button>
        <button class="quick-pill" data-quick="1009000">100.9万</button>
        <button class="quick-pill" data-quick="1008000">100.8万 (EX+)</button>
        <button class="quick-pill" data-quick="1000000">100万 (EX)</button>
      </div>

      <div class="keypad">
        <button class="key-cell" data-key="7">7</button>
        <button class="key-cell" data-key="8">8</button>
        <button class="key-cell" data-key="9">9</button>
        <button class="key-cell" data-key="4">4</button>
        <button class="key-cell" data-key="5">5</button>
        <button class="key-cell" data-key="6">6</button>
        <button class="key-cell" data-key="1">1</button>
        <button class="key-cell" data-key="2">2</button>
        <button class="key-cell" data-key="3">3</button>
        <button class="key-cell" data-key="C" style="color: #dc2626;">C</button>
        <button class="key-cell" data-key="0">0</button>
        <button class="key-cell" data-key="BS">⌫</button>
      </div>

      <button class="btn-apply" id="btnModalSave">決定</button>
    </div>
  </div>

  <!-- AP+ Record Modal -->
  <div class="modal-overlay" id="apPlusModal">
    <div class="modal-box" style="max-width: 440px;">
      <div class="modal-head">
        <div class="modal-song-name" id="apPlusModalTitle">🌟 理論値(AP+)記録の追加</div>
        <button class="modal-close-btn" id="btnApPlusModalClose">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:12px; margin-top:10px;">
        <input type="hidden" id="apPlusEditIndex" value="-1">
        
        <div class="form-group">
          <label class="form-label" for="apPlusChartSelect">対象譜面 (IV / IV-α) <span class="required-star">*</span></label>
          <select id="apPlusChartSelect" class="form-input" style="font-size:13px; font-weight:700;">
            <!-- Options dynamically populated from all IV and IV-alpha charts -->
          </select>
        </div>

        <div class="form-row-2col">
          <div class="form-group">
            <label class="form-label" for="apPlusNoInput">No (達成順序)</label>
            <input type="number" id="apPlusNoInput" class="form-input" min="1" step="1">
          </div>
          <div class="form-group">
            <label class="form-label" for="apPlusDateInput">取得日 <span style="font-size:10px; font-weight:normal; color:var(--color-text-muted);">(任意)</span></label>
            <input type="text" id="apPlusDateInput" class="form-input" placeholder="例: 2026/11/5">
          </div>
        </div>

        <div id="apPlusChartPreview" style="background:#f8fafc; border:1px solid var(--border-color); border-radius:8px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div id="apPlusPreviewTitle" style="font-weight:800; font-size:13px; color:var(--color-text-main);">曲名</div>
            <div id="apPlusPreviewPack" style="font-size:11px; color:var(--color-text-muted);">パック名</div>
          </div>
          <div style="text-align:right;">
            <div id="apPlusPreviewDiff" class="diff-badge diff-IV" style="display:inline-block; font-size:11px; padding:2px 6px;">IV</div>
            <div id="apPlusPreviewConst" style="font-size:13px; font-weight:900; color:var(--color-primary-dark); margin-top:2px;">-</div>
          </div>
        </div>
      </div>
      <div class="modal-foot" style="margin-top:14px; display:flex; gap:10px;">
        <button class="btn-cancel" id="btnApPlusModalCancel" type="button" style="flex:1;">キャンセル</button>
        <button class="btn-save" id="btnApPlusModalSave" type="button" style="flex:1;">保存する</button>
      </div>
    </div>
  </div>

  <!-- Modal: Edit Song Master Data -->
  <div class="modal-overlay" id="editSongModal">
    <div class="modal-box" style="max-width: 440px;">
      <div class="modal-head">
        <div class="modal-song-name" id="editSongModalHeader">✏️ 楽曲データの編集</div>
        <button class="modal-close-btn" id="btnEditSongModalClose">&times;</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:10px; margin-top:10px; max-height: 70vh; overflow-y: auto;">
        <input type="hidden" id="editTargetSongId" value="">
        
        <div class="form-group">
          <label class="form-label" for="editSongTitleInput">曲名 <span class="required-star">*</span></label>
          <input type="text" id="editSongTitleInput" class="form-input">
        </div>

        <div class="form-row-2col">
          <div class="form-group">
            <label class="form-label" for="editSongPackInput">ソングパック</label>
            <input type="text" id="editSongPackInput" class="form-input" list="packDatalist">
          </div>
          <div class="form-group">
            <label class="form-label" for="editSongVersionInput">バージョン</label>
            <input type="text" id="editSongVersionInput" class="form-input" list="versionDatalist">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="editInsertAfterSong">直前の楽曲 (デフォルト順序) <span class="form-note">※順序変更時のみ入力</span></label>
          <input type="text" id="editInsertAfterSong" class="form-input" placeholder="現在の位置を維持（変更する場合のみ曲名を選択）" list="songDatalist">
        </div>

        <div style="background: var(--bg-surface, #FDE4C3); border: 1.5px solid var(--border-beige, #e2e8f0); border-radius: 8px; padding: 10px 12px;">
          <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none;">
            <div>
              <div style="font-weight: 800; font-size: 13px; color: var(--color-text-main);">販売終了曲として設定</div>
              <div style="font-size: 11px; color: var(--color-text-muted); margin-top: 2px;">※ONにするとレート・総合達成度計算から除外されます</div>
            </div>
            <input type="checkbox" id="editSongEndOfSale" style="width: 18px; height: 18px; cursor: pointer; accent-color: #dc2626;">
          </label>
        </div>

        <div class="form-diff-section" style="margin-bottom:0;">
          <div class="form-label">難易度定数 <span class="form-note">※IV-α を空欄にするとIV-αを削除</span></div>
          <div class="diff-input-grid">
            <!-- I -->
            <div class="diff-input-card diff-I-box">
              <div class="diff-input-header">
                <span class="diff-tag-pill diff-I">I</span>
                <span class="calc-level-tag" id="editPreviewLevelI">Lv.-</span>
              </div>
              <input type="number" step="0.1" min="1.0" max="16.0" id="editConstI" class="diff-num-input">
            </div>
            <!-- II -->
            <div class="diff-input-card diff-II-box">
              <div class="diff-input-header">
                <span class="diff-tag-pill diff-II">II</span>
                <span class="calc-level-tag" id="editPreviewLevelII">Lv.-</span>
              </div>
              <input type="number" step="0.1" min="1.0" max="16.0" id="editConstII" class="diff-num-input">
            </div>
            <!-- III -->
            <div class="diff-input-card diff-III-box">
              <div class="diff-input-header">
                <span class="diff-tag-pill diff-III">III</span>
                <span class="calc-level-tag" id="editPreviewLevelIII">Lv.-</span>
              </div>
              <input type="number" step="0.1" min="1.0" max="16.0" id="editConstIII" class="diff-num-input">
            </div>
            <!-- IV -->
            <div class="diff-input-card diff-IV-box">
              <div class="diff-input-header">
                <span class="diff-tag-pill diff-IV">IV</span>
                <span class="calc-level-tag" id="editPreviewLevelIV">Lv.-</span>
              </div>
              <input type="number" step="0.1" min="1.0" max="16.0" id="editConstIV" class="diff-num-input">
            </div>
            <!-- IV-α -->
            <div class="diff-input-card diff-IV-alpha-box">
              <div class="diff-input-header">
                <span class="diff-tag-pill diff-IV-alpha">IV-α</span>
                <span class="calc-level-tag" id="editPreviewLevelIVAlpha">なし</span>
              </div>
              <input type="number" step="0.1" min="1.0" max="16.0" id="editConstIVAlpha" class="diff-num-input" placeholder="任意">
            </div>
          </div>
        </div>
      </div>
      <div class="modal-foot" style="margin-top:14px; display:flex; gap:10px;">
        <button class="btn-cancel" id="btnEditSongModalCancel" type="button">キャンセル</button>
        <button class="btn-danger" id="btnEditSongModalDelete" type="button">🗑️ 削除</button>
        <button class="btn-save" id="btnEditSongModalSave" type="button">変更を適用</button>
      </div>
    </div>
  </div>

  <!-- Modal: Official Song Updates Preview & Merge -->
  <div class="modal-overlay" id="officialUpdateModal" style="display: none;">
    <div class="modal-box update-modal-box">
      <div class="update-modal-header">
        <div class="update-modal-title">
          <span>✨</span> 最新アプデ・新譜面情報の確認
        </div>
        <button type="button" class="btn-modal-close" id="btnOfficialUpdateModalClose">&times;</button>
      </div>

      <div class="update-modal-body">
        <!-- Summary Banner -->
        <div class="update-summary-banner" id="officialUpdateSummary" style="display: none;">
          <span id="officialUpdateSummaryText" style="font-weight: 900; color: #0369a1;">最新アプデ情報: （新規 0曲 / 更新 0曲）</span>
          <span style="font-size: 11px; color: var(--color-text-sub);">※チェックした項目のみ反映されます</span>
        </div>

        <!-- Loading State -->
        <div id="officialUpdateLoading" style="text-align: center; padding: 36px 16px;">
          <div style="font-size: 28px; margin-bottom: 8px;">⏳</div>
          <div style="font-size: 13px; font-weight: 800; color: var(--color-primary-dark);">親スプレッドシート（RotaenoDB）に接続中...</div>
          <div style="font-size: 11px; color: var(--color-text-sub); margin-top: 4px;">最新の楽曲マスターを取得しています</div>
        </div>

        <!-- Error State -->
        <div id="officialUpdateError" style="display: none; text-align: center; padding: 24px 16px;">
          <div style="font-size: 24px; margin-bottom: 6px;">⚠️</div>
          <div style="font-size: 13px; font-weight: 800; color: #dc2626;" id="officialUpdateErrorMsg">通信エラーが発生しました</div>
          <div style="font-size: 11px; color: var(--color-text-sub); margin-top: 6px;">接続先APIまたは親スプシの共有設定を確認してください。</div>
        </div>

        <!-- Empty State (All Up to Date) -->
        <div id="officialUpdateEmpty" style="display: none; text-align: center; padding: 36px 16px;">
          <div style="font-size: 32px; margin-bottom: 8px;">🎉</div>
          <div style="font-size: 14px; font-weight: 900; color: #16a34a;">すべての楽曲データが最新です！</div>
          <div style="font-size: 12px; color: var(--color-text-sub); margin-top: 4px;">未登録の新譜面や定数改定はありません。</div>
        </div>

        <!-- Diff Content List -->
        <div id="officialUpdateDiffContent" style="display: none;">
          <!-- Section 1: New Songs -->
          <div id="officialUpdateNewSection" style="margin-bottom: 18px;">
            <div class="update-section-title" style="color: #10b981;">
              <span>🆕 新規登録 (<span id="officialUpdateNewCount">0</span>曲)</span>
            </div>
            <div class="update-cards-list" id="officialUpdateNewList"></div>
          </div>

          <!-- Section 2: Updated Songs -->
          <div id="officialUpdateModSection">
            <div class="update-section-title" style="color: #0284c7;">
              <span>🔄 情報更新 (<span id="officialUpdateModCount">0</span>曲)</span>
            </div>
            <div class="update-cards-list" id="officialUpdateModList"></div>
          </div>
        </div>
      </div>

      <div class="update-modal-footer">
        <button type="button" class="btn-cancel" id="btnOfficialUpdateCancel">キャンセル</button>
        <button type="button" class="btn-save" id="btnOfficialUpdateApply" disabled>✓ 反映する (計 0曲)</button>
      </div>
    </div>
  </div>

  <script>
    // Master data: [id, title, diff, level, constant, notes, pack, songId, endOfSale, initScore, initStatus, version, initId]
    const DEFAULT_SONGS = ${compactData};
    const DEFAULT_AP_PLUS_RECORDS = ${defaultApPlusData};
    const STORAGE_KEY = 'rotaeno_user_scores_v1';
    const MASTER_SONGS_KEY = 'rotaeno_master_songs_v2';
    const OLD_CUSTOM_SONGS_KEY = 'rotaeno_custom_songs_v1';
    const PACK_ORDER_KEY = 'rotaeno_pack_order_v1';
    const AP_PLUS_KEY = 'rotaeno_ap_plus_records_v1';
    const SHOW_DATE_KEY = 'rotaeno_show_ap_plus_date_v1';
    const STATS_SCOPE_KEY = 'rotaeno_stats_scope_v1';
    const USER_SHEET_URL_KEY = 'rotaeno_user_sheet_url_v1';
    const GAS_URL_KEY = 'rotaeno_gas_url_v1';
    const GAS_LAST_SYNC_KEY = 'rotaeno_gas_last_sync_v1';
    const AUTO_SYNC_KEY = 'rotaeno_auto_sync_v1';
    const DEFAULT_GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbw2W83eJjx1A2HbUH1XnKpBpjPuA66vEo9xoqQJFm2s2rMdqwyfepBCXuUpRMdmJbLV/exec';
    const GAS_SCRIPT_CODE = ${JSON.stringify(gasScriptContent)};
    let userSheetUrl = localStorage.getItem(USER_SHEET_URL_KEY) || '';
    let gasAppUrl = localStorage.getItem(GAS_URL_KEY) || DEFAULT_GAS_ENDPOINT;
    let autoSyncEnabled = localStorage.getItem(AUTO_SYNC_KEY) === 'true';
    let masterSongs = [];
    let savedMasterSongs = [];
    let userScores = {};
    let savedScores = {};
    let packOrder = [];
    let savedPackOrder = [];
    let apPlusRecords = [];
    let showApPlusDate = true;
    let currentStatsScope = localStorage.getItem(STATS_SCOPE_KEY) || 'ALL';
    let currentMypageSubView = 'stats';
    let apPlusSearchQuery = '';
    let apPlusSort = 'NO_ASC';

    // Game Official Song Pack Order (Matching in-game selection list)
    let GAME_PACK_ORDER = [
      '基本曲',
      '第1章 - 旅の始まり',
      '第2章 - 災難と希望',
      '第3章 - 水と油',
      '小さなしずくの大冒険',
      '永久の光、新たな命へ',
      '空、宇宙船、そして大切なもの――',
      '果てしなき夏の狂騒曲',
      'Rotaeno学園祭',
      '新時代',
      '二人の出会い',
      '軌跡：夢が芽生えた日',
      'maimai コラボ',
      'WACCA コラボ II',
      'Mili セレクション',
      'Cosmic Radio 2025',
      'Dynamix Universe コラボ',
      'KALPA: Cosmic Symphony コラボ',
      'Cytus II コラボ',
      'Tanchiky セレクション',
      'NOISZ SL + PK GODHAND コラボ',
      'Muse Dash コラボ',
      'DEEMO II コラボ',
      'Dynamix コラボ',
      'Rizline コラボ',
      'Paradigm: Rebootコラボ',
      'Arcaea コラボ',
      'LiveMania',
      'Lanota コラボ',
      'HARDCORE TANO*C コラボ II',
      'HARDCORE TANO*C コラボ I',
      'Phigros コラボ',
      'KALPA コラボ',
      'WACCA コラボ I',
      '明日へ響け',
      '次元を超える約束',
      'DECO*27 コラボ',
      'ピノキオピー コラボ',
      '未来の歌',
      '晩夏の夢',
      '風の向くまま',
      '迷いのルミナリウム',
      'ナニコア?!',
      '黄金時代',
      '雪の下の思い出',
      'Ψ: 脳波オーバーロード',
      '異世界物語：追憶',
      '音の継承',
      '熾熱の魂',
      'パープルレイヴ',
      'ファンキーパーティー',
      'オーブの声',
      '無色透明',
      'ピアノライフ',
      'ジオメトリーパルス',
      '街角のレストラン',
      '機械都市',
      'Rock (Y)our World',
      '星々の声',
      '星明りの秘蔵'
    ];

    function loadPackOrder() {
      const saved = localStorage.getItem(PACK_ORDER_KEY);
      if (saved) {
        try {
          packOrder = JSON.parse(saved);
          if (!Array.isArray(packOrder)) packOrder = [...GAME_PACK_ORDER];
        } catch (e) {
          packOrder = [...GAME_PACK_ORDER];
        }
      } else {
        packOrder = [...GAME_PACK_ORDER];
      }
      const existingPacks = [...new Set((masterSongs.length ? masterSongs : DEFAULT_SONGS).map(s => s[6]))].filter(Boolean);
      existingPacks.forEach(p => {
        if (!packOrder.includes(p)) packOrder.push(p);
      });
      savedPackOrder = [...packOrder];
    }

    function savePackOrder() {
      localStorage.setItem(PACK_ORDER_KEY, JSON.stringify(packOrder));
      savedPackOrder = [...packOrder];
    }

    // Constant to Level Formula
    function calcLevelFromConstant(c) {
      if (c === null || c === undefined || isNaN(c) || c === '' || Number(c) <= 0) return '-';
      const num = Number(c);
      const floorVal = Math.floor(num);
      if (floorVal < 10) return String(floorVal);
      const frac = Math.round((num - floorVal) * 10) / 10;
      return frac >= 0.6 ? (floorVal + '+') : String(floorVal);
    }

    function calculateInitIdForDiff(diff, insertAfterTitle) {
      const diffTuples = masterSongs.filter(s => s[2] === diff);
      diffTuples.sort((a, b) => a[12] - b[12]);

      let refTuple = null;
      if (insertAfterTitle) {
        refTuple = diffTuples.find(s => s[1].toLowerCase() === insertAfterTitle.toLowerCase());
      }

      if (refTuple) {
        const prevInitId = refTuple[12];
        const nextTuple = diffTuples.find(s => s[12] > prevInitId);
        if (nextTuple) {
          return (prevInitId + nextTuple[12]) / 2;
        } else {
          return prevInitId + 0.5;
        }
      }

      if (diffTuples.length > 0) {
        return diffTuples[diffTuples.length - 1][12] + 0.5;
      }

      const defaultBases = { 'IV-α': 1, 'IV': 467, 'III': 900, 'II': 1333, 'I': 1766 };
      return (defaultBases[diff] || 1766) + 0.5;
    }

    function getLastSongOfPack(packName) {
      if (!packName) return '';
      const packSongs = masterSongs.filter(s => s[6] === packName && s[2] === 'IV');
      packSongs.sort((a, b) => a[12] - b[12]);
      if (packSongs.length > 0) {
        return packSongs[packSongs.length - 1][1];
      }
      const anyPackSongs = masterSongs.filter(s => s[6] === packName);
      anyPackSongs.sort((a, b) => a[12] - b[12]);
      return anyPackSongs.length > 0 ? anyPackSongs[anyPackSongs.length - 1][1] : '';
    }

    function songObjToTuples(song, insertAfterTitleOrBaseId) {
      const tuples = [];
      const diffKeys = ['I', 'II', 'III', 'IV'];
      if (song.diffs && song.diffs['IV-α']) diffKeys.push('IV-α');

      const isNumericBase = typeof insertAfterTitleOrBaseId === 'number';
      const insertAfterTitle = typeof insertAfterTitleOrBaseId === 'string' ? insertAfterTitleOrBaseId : '';

      diffKeys.forEach((diff, idx) => {
        const d = song.diffs[diff];
        if (!d || isNaN(d.constant)) return;
        const initId = isNumericBase
          ? (insertAfterTitleOrBaseId + idx)
          : calculateInitIdForDiff(diff, insertAfterTitle);

        tuples.push([
          song.songId + '_' + diff,
          song.title,
          diff,
          d.level || calcLevelFromConstant(d.constant),
          d.constant,
          0,
          song.pack || '基本曲',
          song.songId,
          0,
          0,
          '',
          song.version || 'v5.6.0',
          initId
        ]);
      });
      return tuples;
    }

    // Unified Master Songs Management
    function getSongGroups(tuples) {
      const map = new Map();
      tuples.forEach(t => {
        const songId = t[7];
        if (!map.has(songId)) {
          map.set(songId, {
            songId: t[7],
            title: t[1],
            pack: t[6],
            version: t[11],
            endOfSale: t[8] || 0,
            initId: (t[12] !== undefined && !isNaN(t[12])) ? Number(t[12]) : 999999,
            diffs: {}
          });
        }
        if (t[2] === 'IV' && t[12] !== undefined && !isNaN(t[12])) {
          map.get(songId).initId = Number(t[12]);
        }
        map.get(songId).diffs[t[2]] = {
          constant: t[4],
          level: t[3]
        };
      });
      const list = Array.from(map.values());
      // Sort by initId so songs are in true game default order
      list.sort((a, b) => (a.initId || 0) - (b.initId || 0));

      // Re-index consecutive integers 1, 2, 3...
      list.forEach((s, idx) => {
        s.initId = idx + 1;
      });
      return list;
    }

    function getAllSongs() {
      return masterSongs;
    }

    function loadMasterSongs() {
      const saved = localStorage.getItem(MASTER_SONGS_KEY);
      if (saved) {
        try {
          masterSongs = JSON.parse(saved);
          if (Array.isArray(masterSongs) && masterSongs.length > 0) {
            savedMasterSongs = JSON.parse(JSON.stringify(masterSongs));
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Initial Seed Load from DEFAULT_SONGS
      masterSongs = JSON.parse(JSON.stringify(DEFAULT_SONGS));

      // Auto-migrate any previously added songs from legacy key
      const oldCustom = localStorage.getItem(OLD_CUSTOM_SONGS_KEY);
      if (oldCustom) {
        try {
          const oldList = JSON.parse(oldCustom);
          if (Array.isArray(oldList)) {
            let currentMaxInitId = masterSongs.length;
            oldList.forEach(song => {
              const tuples = songObjToTuples(song, currentMaxInitId + 1);
              currentMaxInitId += tuples.length;
              masterSongs.push(...tuples);
            });
          }
        } catch (e) {
          console.error(e);
        }
      }

      saveMasterSongs();
    }

    function saveMasterSongs() {
      localStorage.setItem(MASTER_SONGS_KEY, JSON.stringify(masterSongs));
      savedMasterSongs = JSON.parse(JSON.stringify(masterSongs));
    }

    function formatApPlusDate(val) {
      if (!val) return '';
      const str = String(val).trim();
      if (!str || str === 'undefined' || str === 'null' || str === '-') return '';
      // 既に '2025/4/12' や '2025/04/12' のような短い形式
      if (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(str)) {
        return str.replace(/-/g, '/');
      }
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
      }
      return str;
    }

    function normalizeApPlusRecord(r) {
      if (!r) return r;
      const title = (r.title || '').trim();
      const diff = (r.diff || '').trim();
      
      const match = masterSongs.find(s => s[1].toLowerCase() === title.toLowerCase() && s[2] === diff);
      
      const level = (r.level && r.level !== 'undefined' && r.level !== 'null')
        ? String(r.level)
        : (match ? match[3] : '-');

      const constant = (r.constant !== undefined && r.constant !== null && !isNaN(r.constant) && Number(r.constant) > 0)
        ? Number(r.constant)
        : (match ? match[4] : 0);

      const chartId = r.chartId || (match ? match[0] : '');
      const date = formatApPlusDate(r.date);

      return {
        no: Number(r.no) || 0,
        title: title,
        diff: diff,
        level: level,
        constant: constant,
        chartId: chartId,
        date: date,
        note: r.note || ''
      };
    }

    function loadApPlusRecords() {
      const saved = localStorage.getItem(AP_PLUS_KEY);
      if (saved) {
        try {
          apPlusRecords = JSON.parse(saved);
        } catch (e) {
          console.error(e);
          apPlusRecords = [];
        }
      } else {
        apPlusRecords = [];
        localStorage.setItem(AP_PLUS_KEY, JSON.stringify(apPlusRecords));
      }

      if (Array.isArray(apPlusRecords) && apPlusRecords.length > 0) {
        apPlusRecords = apPlusRecords.map(normalizeApPlusRecord);
        localStorage.setItem(AP_PLUS_KEY, JSON.stringify(apPlusRecords));
      }

      const savedDatePref = localStorage.getItem(SHOW_DATE_KEY);
      if (savedDatePref !== null) {
        showApPlusDate = savedDatePref === 'true';
      }
      const chk = document.getElementById('chkShowApPlusDate');
      if (chk) chk.checked = showApPlusDate;
      applyApPlusDateVisibility();
      updateMypageBadges();
    }

    function saveApPlusRecords() {
      localStorage.setItem(AP_PLUS_KEY, JSON.stringify(apPlusRecords));
      updateMypageBadges();
    }

    function applyApPlusDateVisibility() {
      const table = document.getElementById('apPlusTable');
      if (table) {
        table.classList.toggle('hide-date', !showApPlusDate);
      }
    }

    function updateMypageBadges() {
      const badge = document.getElementById('mypageApPlusCountBadge');
      if (badge) {
        badge.textContent = apPlusRecords.length.toString();
      }
    }

    function setStatsScope(scope) {
      currentStatsScope = (scope === 'IV_PLUS') ? 'IV_PLUS' : 'ALL';
      localStorage.setItem(STATS_SCOPE_KEY, currentStatsScope);
      updateStatsScopeUI();
      renderMypageStats();
    }

    function updateStatsScopeUI() {
      const btnAll = document.getElementById('btnScopeAll');
      const btnIv = document.getElementById('btnScopeIv');
      if (btnAll && btnIv) {
        if (currentStatsScope === 'IV_PLUS') {
          btnAll.classList.remove('active');
          btnIv.classList.add('active');
        } else {
          btnAll.classList.add('active');
          btnIv.classList.remove('active');
        }
      }
    }

    function switchMypageSubView(subview) {
      currentMypageSubView = subview;
      const navStats = document.getElementById('mypageNavStats');
      const navB40 = document.getElementById('mypageNavB40');
      const navApPlus = document.getElementById('mypageNavApPlus');
      if (navStats) navStats.classList.toggle('active', subview === 'stats');
      if (navB40) navB40.classList.toggle('active', subview === 'b40');
      if (navApPlus) navApPlus.classList.toggle('active', subview === 'applus');

      const subStats = document.getElementById('mypageSubStats');
      const subB40 = document.getElementById('mypageSubB40');
      const subApPlus = document.getElementById('mypageSubApPlus');
      if (subStats) subStats.style.display = subview === 'stats' ? 'block' : 'none';
      if (subB40) subB40.style.display = subview === 'b40' ? 'block' : 'none';
      if (subApPlus) subApPlus.style.display = subview === 'applus' ? 'block' : 'none';

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function loadInitialScores() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          userScores = JSON.parse(saved);
          let updated = false;
          Object.keys(userScores).forEach(id => {
            if (userScores[id] && userScores[id].score === 1010000 && userScores[id].status !== 'AP+') {
              userScores[id].status = 'AP+';
              updated = true;
            }
          });
          if (updated) localStorage.setItem(STORAGE_KEY, JSON.stringify(userScores));
          savedScores = JSON.parse(JSON.stringify(userScores));
          return;
        } catch (e) {
          console.error(e);
        }
      }
      userScores = {};
      savedScores = {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userScores));
    }

    function saveScores() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userScores));
      savedScores = JSON.parse(JSON.stringify(userScores));
      checkUnsavedChanges();
      showSaveToast();
    }

    function checkUnsavedChanges() {
      const unsavedBar = document.getElementById('unsavedBar');
      const countEl = document.getElementById('unsavedCountText');
      if (!unsavedBar) return;

      const allIds = new Set([...Object.keys(userScores), ...Object.keys(savedScores)]);
      let scoreDiffCount = 0;
      for (const id of allIds) {
        const u = userScores[id] || { score: 0, status: '' };
        const s = savedScores[id] || { score: 0, status: '' };
        if (u.score !== s.score || u.status !== s.status) {
          scoreDiffCount++;
        }
      }

      const isSongsChanged = JSON.stringify(masterSongs) !== JSON.stringify(savedMasterSongs);
      const isPackOrderChanged = JSON.stringify(packOrder) !== JSON.stringify(savedPackOrder);
      const currentSongIds = new Set(masterSongs.map(s => s[7]));
      const savedSongIds = new Set(savedMasterSongs.map(s => s[7]));
      let newSongsCount = 0;
      currentSongIds.forEach(id => {
        if (!savedSongIds.has(id)) newSongsCount++;
      });
      let removedSongsCount = 0;
      savedSongIds.forEach(id => {
        if (!currentSongIds.has(id)) removedSongsCount++;
      });

      const hasUnsaved = scoreDiffCount > 0 || isSongsChanged || isPackOrderChanged;

      if (hasUnsaved) {
        const details = [];
        if (newSongsCount > 0) details.push('追加 ' + newSongsCount + '曲');
        if (removedSongsCount > 0) details.push('削除 ' + removedSongsCount + '曲');
        if (isSongsChanged && newSongsCount === 0 && removedSongsCount === 0) details.push('楽曲マスター更新');
        if (scoreDiffCount > 0) details.push('スコア ' + scoreDiffCount + '件');
        if (isPackOrderChanged) details.push('パック順序');
        if (countEl) countEl.textContent = details.length ? ('(' + details.join(' / ') + ')') : '';
        unsavedBar.classList.add('visible');
      } else {
        if (countEl) countEl.textContent = '';
        unsavedBar.classList.remove('visible');
      }

      renderStagedCards();
    }

    function showSaveToast(msg) {
      const toast = document.getElementById('saveToast');
      if (!toast) return;
      toast.textContent = msg || '💾 保存しました';
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }

    // Rating Formula
    function calcSingleRating(score, constant, endOfSale) {
      if (endOfSale === 1 || !score || score <= 0) return 0;
      if (score >= 1008000) {
        return constant + 3.4 + (score - 1008000) / 10000;
      } else if (score >= 1004000) {
        return constant + 2.4 + (score - 1004000) / 4000;
      } else if (score >= 1000000) {
        return constant + 2.0 + (score - 1000000) / 10000;
      } else if (score >= 980000) {
        return constant + 1.0 + (score - 980000) / 20000;
      } else if (score >= 950000) {
        return constant + 0.0 + (score - 950000) / 30000;
      } else if (score >= 900000) {
        return constant - 1.0 + (score - 900000) / 50000;
      } else if (score >= 500000) {
        return constant - 5.0 + (score - 500000) / 100000;
      } else {
        return Math.max(constant - 9999 + score * (4997 / 250000), 0);
      }
    }

    // Completion AD Formula
    function calcCompletionAD(score, constant, difficulty, status, endOfSale) {
      const w = calcSingleRating(score, constant, endOfSale);
      if (w <= 0 || endOfSale === 1) return { ad: 0, diffJudge: 0 };

      const basic = (w / (constant + 3.6)) * 0.925;
      let exPlus = 0;
      if (score >= 1009900) exPlus = 0.04 + (score - 1009900) * 0.0001;
      else if (score >= 1009750) exPlus = 0.0325 + (score - 1009750) * 0.00005;
      else if (score >= 1009500) exPlus = 0.0225 + (score - 1009500) * 0.00004;
      else if (score >= 1009250) exPlus = 0.015 + (score - 1009250) * 0.00003;
      else if (score >= 1009000) exPlus = 0.01 + (score - 1009000) * 0.00002;
      else if (score >= 1008000) exPlus = (score - 1008000) * 0.00001;

      let clearBonus = 0;
      if (score === 1010000 || status === 'AP+') clearBonus = 0.025;
      else if (status === 'AP') clearBonus = 0.02;
      else if (status === 'FC') clearBonus = 0.01;

      let diffJudge = 0;
      if (difficulty === 'I') diffJudge = 0.7;
      else if (difficulty === 'II') diffJudge = 0.8;
      else if (difficulty === 'III') diffJudge = 0.9;
      else if (difficulty === 'IV') diffJudge = 1.0;
      else if (difficulty === 'IV-α') diffJudge = 666;

      const raw = Math.min(1.0, basic + exPlus + clearBonus);
      let ad = 0;
      if (diffJudge === 666) {
        ad = Math.round(raw * 1000) / 1000;
      } else {
        ad = Math.round(diffJudge * raw * 1000) / 1000;
      }
      return { ad, diffJudge };
    }

    // Theoretical Max Rating Calculation (Top 40 with IV & IV-alpha exclusivity)
    function calcTheoreticalMaxRating() {
      const eligible = [];
      const grouped = {};
      const allSongs = getAllSongs();
      allSongs.forEach(s => {
        if (s[8] === 1) return; // endOfSale
        const songId = s[7];
        if (!grouped[songId]) grouped[songId] = [];
        grouped[songId].push(s);
      });

      for (const [songId, list] of Object.entries(grouped)) {
        const iv = list.find(c => c[2] === 'IV');
        const ivAlpha = list.find(c => c[2] === 'IV-α');

        list.forEach(c => {
          let isEx = false;
          if (iv && ivAlpha) {
            if (c[2] === 'IV' && iv[4] <= ivAlpha[4]) isEx = true;
            if (c[2] === 'IV-α' && ivAlpha[4] < iv[4]) isEx = true;
          }
          if (!isEx) {
            eligible.push({
              maxRate: c[4] + 3.6
            });
          }
        });
      }

      eligible.sort((a, b) => b.maxRate - a.maxRate);
      const top40 = eligible.slice(0, 40);
      const b10Sum = top40.slice(0, 10).reduce((acc, c) => acc + c.maxRate, 0);
      const b20Sum = top40.slice(10, 20).reduce((acc, c) => acc + c.maxRate, 0);
      const b40Sum = top40.slice(20, 40).reduce((acc, c) => acc + c.maxRate, 0);
      return (b10Sum * 0.06) + (b20Sum * 0.02) + (b40Sum * 0.01);
    }

    function getMaxCompletionCount() {
      return getAllSongs().filter(s => (s[2] === 'IV' || s[2] === 'IV-α') && s[8] === 0).length;
    }

    function computeAllRatings() {
      const chartMap = {};
      const songDiffMap = {};
      const songGrouping = {};

      const allSongs = getAllSongs();
      allSongs.forEach(s => {
        const id = s[0];
        const title = s[1];
        const diff = s[2];
        const level = s[3];
        const constant = s[4];
        const notes = s[5];
        const pack = s[6];
        const songId = s[7];
        const endOfSale = s[8];
        const version = s[11];
        const initId = s[12];

        const record = userScores[id] || { score: 0, status: '' };
        const score = record.score || 0;
        const status = record.status || '';

        const rawRating = calcSingleRating(score, constant, endOfSale);
        const { ad, diffJudge } = calcCompletionAD(score, constant, diff, status, endOfSale);

        const chart = {
          id, title, diff, level, constant, notes, pack, songId, endOfSale,
          version, initId,
          score, status, rawRating,
          effectiveRating: rawRating,
          isExcluded: false,
          ad, diffJudge, af: 0
        };

        chartMap[id] = chart;

        if (!songGrouping[songId]) songGrouping[songId] = [];
        songGrouping[songId].push(chart);

        if (diff === 'IV' || diff === 'IV-α') {
          if (!songDiffMap[songId]) songDiffMap[songId] = {};
          songDiffMap[songId][diff] = { id, rawRating };
        }
      });

      // Exclusivity rule for Rating
      for (const [songId, diffs] of Object.entries(songDiffMap)) {
        if (diffs['IV'] && diffs['IV-α']) {
          const ivRate = diffs['IV'].rawRating;
          const ivAlphaRate = diffs['IV-α'].rawRating;

          if (ivRate <= ivAlphaRate) {
            chartMap[diffs['IV'].id].effectiveRating = 0;
            chartMap[diffs['IV'].id].isExcluded = true;
          } else {
            chartMap[diffs['IV-α'].id].effectiveRating = 0;
            chartMap[diffs['IV-α'].id].isExcluded = true;
          }
        }
      }

      // Completion AF Calculation (Per Song logic)
      let totalCompletionSum = 0;
      for (const [songId, chartList] of Object.entries(songGrouping)) {
        const non666 = chartList.filter(c => c.diffJudge !== 666);
        const maxNon666Ad = non666.length ? Math.max(...non666.map(c => c.ad)) : 0;

        chartList.forEach(c => {
          if (c.diffJudge === 666) {
            c.af = c.ad;
          } else {
            if (c.ad === maxNon666Ad && c.ad > 0) {
              const ties = non666.filter(x => x.ad === maxNon666Ad);
              const maxJudge = Math.max(...ties.map(x => x.diffJudge));
              c.af = (c.diffJudge === maxJudge) ? c.ad : 0;
            } else {
              c.af = 0;
            }
          }
          totalCompletionSum += c.af;
        });
      }

      const activeCharts = Object.values(chartMap).filter(c => c.effectiveRating > 0);
      activeCharts.sort((a, b) => b.effectiveRating - a.effectiveRating);

      const b40Set = new Set();
      const b10 = activeCharts.slice(0, 10);
      const b20 = activeCharts.slice(10, 20);
      const b40 = activeCharts.slice(20, 40);

      activeCharts.slice(0, 40).forEach((c, idx) => {
        c.b40Rank = idx + 1;
        b40Set.add(c.id);
      });

      const b10Sum = b10.reduce((acc, c) => acc + c.effectiveRating, 0);
      const b20Sum = b20.reduce((acc, c) => acc + c.effectiveRating, 0);
      const b40Sum = b40.reduce((acc, c) => acc + c.effectiveRating, 0);

      const totalRating = (b10Sum * 0.06) + (b20Sum * 0.02) + (b40Sum * 0.01);

      return {
        chartMap,
        activeCharts,
        b10, b20, b40,
        b10Sum, b20Sum, b40Sum,
        totalRating,
        b40Set,
        totalCompletionSum
      };
    }

    let currentCalc = null;
    let selectedChart = null;
    let currentInputScore = 0;
    let currentInputStatus = '';

    let currentSort = 'DEFAULT';
    let filterDiffs = new Set();
    let filterConst = 'ALL';
    let filterStatus = 'ALL';
    let searchQuery = '';
    let showDeleted = true;

    let filterScoreMin = null;
    let filterScoreMax = null;
    let excludeApPlus = false;
    let excludeAp = false;
    let excludeFc = false;
    let excludeEx = false;
    let excludePlayed = false;
    let filterConstMin = null;
    let filterConstMax = null;
    let filterConstExact = null;
    let filterLevelMin = '';
    let filterLevelMax = '';
    let filterLevelExact = '';

    function levelToValue(lvl) {
      if (!lvl) return 0;
      const str = String(lvl).trim();
      const isPlus = str.endsWith('+');
      const base = parseFloat(str.replace('+', '')) || 0;
      return isPlus ? base + 0.5 : base;
    }

    const totalRatingEl = document.getElementById('totalRating');
    const theoMaxRatingEl = document.getElementById('theoMaxRating');
    const completionSumEl = document.getElementById('completionSum');
    const completionMaxEl = document.getElementById('completionMax');
    const completionRateEl = document.getElementById('completionRate');

    const b10SumEl = document.getElementById('b10Sum');
    const b20SumEl = document.getElementById('b20Sum');
    const b40SumEl = document.getElementById('b40Sum');
    const scoreCountEl = document.getElementById('scoreCount');
    const songListContainer = document.getElementById('songListContainer');

    function adjustHeaderOffset() {
      const header = document.querySelector('header');
      if (header) {
        const h = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', h + 'px');
      }
    }
    window.addEventListener('resize', adjustHeaderOffset);

    function refresh() {
      adjustHeaderOffset();
      currentCalc = computeAllRatings();
      const allSongs = getAllSongs();

      totalRatingEl.textContent = currentCalc.totalRating.toFixed(4);
      theoMaxRatingEl.textContent = calcTheoreticalMaxRating().toFixed(4);

      const maxComp = getMaxCompletionCount();
      completionSumEl.textContent = currentCalc.totalCompletionSum.toFixed(3);
      completionMaxEl.textContent = maxComp;
      const ratePct = maxComp > 0 ? ((currentCalc.totalCompletionSum / maxComp) * 100).toFixed(2) : '0.00';
      completionRateEl.textContent = \`(\${ratePct}%)\`;

      b10SumEl.textContent = (currentCalc.b10Sum * 0.06).toFixed(3);
      b20SumEl.textContent = (currentCalc.b20Sum * 0.02).toFixed(3);
      b40SumEl.textContent = (currentCalc.b40Sum * 0.01).toFixed(3);

      const filledCount = Object.values(userScores).filter(v => v.score > 0).length;
      scoreCountEl.textContent = \`\${filledCount} / \${allSongs.length} 登録\`;

      renderSongList();
      renderMypage();
    }

    function getDiffClass(diff) {
      if (diff === 'IV-α' || diff === 'IV-alpha') return 'diff-IV-alpha';
      return 'diff-' + diff;
    }

    function compareVersions(vA, vB) {
      const partsA = (vA || '').split('.').map(x => parseInt(x) || 0);
      const partsB = (vB || '').split('.').map(x => parseInt(x) || 0);
      for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const a = partsA[i] || 0;
        const b = partsB[i] || 0;
        if (a !== b) return b - a; // Descending (newer first)
      }
      return 0;
    }

    // Collapsible Song Groups State & Categorization
    const collapsedGroupIds = new Set();

    const TITLE_CATEGORY_ORDER = [
      'あ行', 'か行', 'さ行', 'た行', 'な行', 'は行', 'ま行', 'や行', 'ら行', 'わ行',
      'A - E', 'F - J', 'K - O', 'P - T', 'U - Z',
      '数字',
      '記号',
      '漢字, その他'
    ];

    const TITLE_CATEGORY_OVERRIDES = {
      // 特殊文字・非ASCIIアルファベット
      'Äventyr': 'A - E',
      'Ēvocator': 'A - E',
      'βinαrΨ // Re:Coded': 'A - E',
      'βinαrΨ': 'A - E',
      'εxceζ': 'A - E',
      'ЯUBY:LINTe': 'P - T',

      // 記号始まり
      '!@@k at m[ f@r[\\[r': '記号',
      '^/7(L|?[_(L+#<>+&|^(o)': '記号',
      '《爱立刻2000》': '記号',
      '-ish': '記号',
      '[C]ENti:mentAL': '記号'
    };

    function getTitleCategory(title) {
      if (TITLE_CATEGORY_OVERRIDES[title]) return TITLE_CATEGORY_OVERRIDES[title];
      const ch = (title || '').trim().charAt(0);
      if (!ch) return '記号';
      const code = ch.charCodeAt(0);

      // ひらがな・カタカナ (あ行〜わ行)
      if ((code >= 0x3041 && code <= 0x3096) || (code >= 0x30A1 && code <= 0x30FA)) {
        const kCode = (code >= 0x3041 && code <= 0x3096) ? code + 0x60 : code;
        if (kCode >= 0x30A1 && kCode <= 0x30AA) return 'あ行';
        if (kCode >= 0x30AB && kCode <= 0x30B4) return 'か行';
        if (kCode >= 0x30B5 && kCode <= 0x30BE) return 'さ行';
        if (kCode >= 0x30BF && kCode <= 0x30C9) return 'た行';
        if (kCode >= 0x30CA && kCode <= 0x30CE) return 'な行';
        if (kCode >= 0x30CF && kCode <= 0x30DD) return 'は行';
        if (kCode >= 0x30DE && kCode <= 0x30E2) return 'ま行';
        if (kCode >= 0x30E3 && kCode <= 0x30E8) return 'や行';
        if (kCode >= 0x30E9 && kCode <= 0x30ED) return 'ら行';
        if (kCode >= 0x30EF && kCode <= 0x30F6) return 'わ行';
      }

      // 英字 (A-Z)
      const upper = ch.toUpperCase();
      if (upper >= 'A' && upper <= 'Z') {
        if (upper <= 'E') return 'A - E';
        if (upper <= 'J') return 'F - J';
        if (upper <= 'O') return 'K - O';
        if (upper <= 'T') return 'P - T';
        return 'U - Z';
      }

      // 数字 (0-9)
      if (ch >= '0' && ch <= '9') return '数字';

      // 漢字 (CJK統合漢字・拡張・互換) & ハングル
      if (
        (code >= 0x4E00 && code <= 0x9FFF) ||
        (code >= 0x3400 && code <= 0x4DBF) ||
        (code >= 0xF900 && code <= 0xFAFF) ||
        (code >= 0xAC00 && code <= 0xD7AF) ||
        (code >= 0x1100 && code <= 0x11FF)
      ) {
        return '漢字, その他';
      }

      return '記号';
    }

    const SCORE_GRADE_TIERS = [
      { id: 'applus', label: '1,010,000点 (理論値)', grade: '虹Ex+虹ゲージ', badgeClass: 'badge-tier-applus', match: c => c.score >= 1010000 || c.status === 'AP+' },
      { id: 'ex_rainbow', label: '1,008,000 ~ 1,009,999', grade: '虹Ex', badgeClass: 'badge-tier-ex-rainbow', match: c => c.score >= 1008000 && c.score < 1010000 },
      { id: 'ex_orange', label: '1,000,000 ~ 1,007,999', grade: '橙Ex', badgeClass: 'badge-tier-ex-orange', match: c => c.score >= 1000000 && c.score < 1008000 },
      { id: 's_plus', label: '980,000 ~ 999,999', grade: 'S+', badgeClass: 'badge-tier-s-plus', match: c => c.score >= 980000 && c.score < 1000000 },
      { id: 's', label: '950,000 ~ 979,999', grade: 'S', badgeClass: 'badge-tier-s', match: c => c.score >= 950000 && c.score < 980000 },
      { id: 'a_plus', label: '900,000 ~ 949,999', grade: 'A+', badgeClass: 'badge-tier-a-plus', match: c => c.score >= 900000 && c.score < 950000 },
      { id: 'a', label: '850,000 ~ 899,999', grade: 'A', badgeClass: 'badge-tier-a', match: c => c.score >= 850000 && c.score < 900000 },
      { id: 'b', label: '800,000 ~ 849,999', grade: 'B', badgeClass: 'badge-tier-b', match: c => c.score >= 800000 && c.score < 850000 },
      { id: 'c', label: '700,000 ~ 799,999', grade: 'C', badgeClass: 'badge-tier-c', match: c => c.score >= 700000 && c.score < 800000 },
      { id: 'd', label: '600,000 ~ 699,999', grade: 'D', badgeClass: 'badge-tier-d', match: c => c.score >= 600000 && c.score < 700000 },
      { id: 'e', label: '500,000 ~ 599,999', grade: 'E', badgeClass: 'badge-tier-e', match: c => c.score >= 500000 && c.score < 600000 },
      { id: 'f', label: '0 ~ 499,999 (未プレイ含む)', grade: 'F', badgeClass: 'badge-tier-f', match: c => c.score < 500000 }
    ];

    function getScoreGradeTier(chart) {
      for (let i = 0; i < SCORE_GRADE_TIERS.length; i++) {
        if (SCORE_GRADE_TIERS[i].match(chart)) return SCORE_GRADE_TIERS[i];
      }
      return SCORE_GRADE_TIERS[SCORE_GRADE_TIERS.length - 1];
    }

    function renderSongRow(c) {
      const inB40 = currentCalc && currentCalc.b40Set ? currentCalc.b40Set.has(c.id) : false;
      const diffClass = getDiffClass(c.diff);
      const statusHtml = c.status ? ('<span class="lamp-tag lamp-' + c.status.replace('+', '-plus') + '">' + c.status + '</span>') : '';
      const scoreDisplay = c.score > 0 ? c.score.toLocaleString() : '-';
      let ratingDisplay = '-';
      if (c.endOfSale === 1) {
        ratingDisplay = '<span style="color:#dc2626; font-size:11px; font-weight:700;">(販売終了)</span>';
      } else if (c.isExcluded) {
        ratingDisplay = '<span style="color:#dc2626; font-size:11px; font-weight:700;">(IV除外)</span>';
      } else if (c.effectiveRating > 0) {
        ratingDisplay = c.effectiveRating.toFixed(4);
      }

      return (
        '<div class="song-row ' + (inB40 ? 'in-b40' : '') + '" onclick="openInputModal(\\\'' + c.id + '\\\')">' +
          '<div class="song-left-col">' +
            '<div class="diff-badge ' + diffClass + '">' +
              '<div>' + c.diff + '</div>' +
              '<div class="const-val">' + c.constant.toFixed(1) + '</div>' +
            '</div>' +
            '<div class="song-meta">' +
              '<div class="song-title-text">' + escapeHtml(c.title) + '</div>' +
              '<div class="song-sub-text">' +
                '<span class="ver-tag">v' + c.version + '</span>' +
                '<span>Lv.' + c.level + '</span>' +
                '<span>' + escapeHtml(c.pack) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="song-right-col">' +
            '<div class="score-display-text">' + scoreDisplay + ' ' + (c.status ? '<span class="lamp-tag lamp-' + c.status.replace('+', '-plus') + '">' + c.status + '</span>' : '') + '</div>' +
            '<div class="rating-display-text">' + ratingDisplay + '</div>' +
          '</div>' +
        '</div>'
      );
    }

    function renderSongList() {
      const q = searchQuery.toLowerCase().trim();
      const list = Object.values(currentCalc.chartMap).filter(c => {
        if (!showDeleted && c.endOfSale === 1) return false;
        if (q) {
          const matchTitle = c.title.toLowerCase().includes(q);
          const matchId = c.songId.toLowerCase().includes(q);
          const matchPack = c.pack.toLowerCase().includes(q);
          const matchVer = c.version.toLowerCase().includes(q);
          if (!matchTitle && !matchId && !matchPack && !matchVer) return false;
        }
        if (filterDiffs.size > 0 && !filterDiffs.has(c.diff)) return false;

        // Level filters
        if (filterLevelExact !== '' && String(c.level) !== filterLevelExact) return false;
        if (filterLevelMin !== '' && levelToValue(c.level) < levelToValue(filterLevelMin)) return false;
        if (filterLevelMax !== '' && levelToValue(c.level) > levelToValue(filterLevelMax)) return false;

        // Constant filters
        if (filterConstExact !== null && Math.round(c.constant * 10) !== Math.round(filterConstExact * 10)) return false;
        if (filterConstMin !== null && Math.round(c.constant * 10) < Math.round(filterConstMin * 10)) return false;
        if (filterConstMax !== null && Math.round(c.constant * 10) > Math.round(filterConstMax * 10)) return false;
        if (filterConst === '14' && c.constant < 14.0) return false;
        if (filterConst === '13' && c.constant < 13.0) return false;

        // Score & Status exclusion filters (埋め作業用)
        if (excludeApPlus && (c.score >= 1010000 || c.status === 'AP+')) return false;
        if (excludeAp && (c.status === 'AP' || c.status === 'AP+' || c.score >= 1010000)) return false;
        if (excludeFc && (c.status === 'FC' || c.status === 'AP' || c.status === 'AP+' || c.score >= 1010000)) return false;
        if (excludeEx && c.score >= 1000000) return false;
        if (excludePlayed && (c.score > 0 || !!c.status)) return false;
        if (filterScoreMin !== null && c.score < filterScoreMin) return false;
        if (filterScoreMax !== null && (c.score <= 0 || c.score > filterScoreMax)) return false;
        if (filterStatus === 'FILLED' && c.score <= 0) return false;
        if (filterStatus === 'B40' && !currentCalc.b40Set.has(c.id)) return false;

        return true;
      });

      const isGroupedSort = ['PACK', 'TITLE', 'VERSION', 'CONST', 'SCORE'].includes(currentSort);
      const toolbarEl = document.getElementById('songGroupToolbar');
      if (toolbarEl) {
        toolbarEl.style.display = (isGroupedSort && list.length > 0) ? 'flex' : 'none';
      }

      if (!isGroupedSort || list.length === 0) {
        // Flat sort for DEFAULT or RATING
        list.sort((a, b) => {
          if (currentSort === 'RATING') {
            const rateA = a.effectiveRating || 0;
            const rateB = b.effectiveRating || 0;
            if (rateB !== rateA) return rateB - rateA;
            if (b.score !== a.score) return b.score - a.score;
            return a.initId - b.initId;
          }
          return a.initId - b.initId;
        });

        songListContainer.innerHTML = list.length > 0
          ? list.map(renderSongRow).join('')
          : '<div style="text-align:center; padding: 40px; color: var(--color-text-muted);">該当する楽曲がありません</div>';
        updateFilterSummary(list.length);
        return;
      }

      // Grouped Sort
      let groups = [];
      if (currentSort === 'PACK') {
        const packMap = new Map();
        list.forEach(c => {
          if (!packMap.has(c.pack)) packMap.set(c.pack, []);
          packMap.get(c.pack).push(c);
        });
        packMap.forEach(items => items.sort((a, b) => a.initId - b.initId));
        const orderedPacks = [];
        packOrder.forEach(p => {
          if (packMap.has(p)) orderedPacks.push(p);
        });
        packMap.forEach((_, p) => {
          if (!orderedPacks.includes(p)) orderedPacks.push(p);
        });
        groups = orderedPacks.map(p => ({
          id: 'pack_' + encodeURIComponent(p),
          titleHtml: escapeHtml(p),
          badgeHtml: '',
          items: packMap.get(p) || []
        }));
      } else if (currentSort === 'TITLE') {
        const titleCatMap = new Map();
        list.forEach(c => {
          const cat = getTitleCategory(c.title);
          if (!titleCatMap.has(cat)) titleCatMap.set(cat, []);
          titleCatMap.get(cat).push(c);
        });
        titleCatMap.forEach(items => items.sort((a, b) => {
          const tComp = a.title.localeCompare(b.title, 'ja', { numeric: true, sensitivity: 'base' });
          if (tComp !== 0) return tComp;
          return a.initId - b.initId;
        }));
        groups = TITLE_CATEGORY_ORDER
          .filter(cat => titleCatMap.has(cat) && titleCatMap.get(cat).length > 0)
          .map(cat => ({
            id: 'title_' + encodeURIComponent(cat),
            titleHtml: escapeHtml(cat),
            badgeHtml: '',
            items: titleCatMap.get(cat)
          }));
      } else if (currentSort === 'VERSION') {
        const verMap = new Map();
        list.forEach(c => {
          if (!verMap.has(c.version)) verMap.set(c.version, []);
          verMap.get(c.version).push(c);
        });
        verMap.forEach(items => items.sort((a, b) => a.initId - b.initId));
        const sortedVers = Array.from(verMap.keys()).sort((a, b) => compareVersions(a, b));
        groups = sortedVers.map(v => ({
          id: 'ver_' + encodeURIComponent(v),
          titleHtml: 'Ver ' + escapeHtml(v),
          badgeHtml: '',
          items: verMap.get(v) || []
        }));
      } else if (currentSort === 'CONST') {
        const lvlMap = new Map();
        list.forEach(c => {
          const lvl = String(c.level);
          if (!lvlMap.has(lvl)) lvlMap.set(lvl, []);
          lvlMap.get(lvl).push(c);
        });
        lvlMap.forEach(items => items.sort((a, b) => {
          if (b.constant !== a.constant) return b.constant - a.constant;
          if (b.score !== a.score) return b.score - a.score;
          return a.initId - b.initId;
        }));
        const sortedLvls = Array.from(lvlMap.keys()).sort((a, b) => levelToValue(b) - levelToValue(a));
        groups = sortedLvls.map(lvl => ({
          id: 'lvl_' + encodeURIComponent(lvl),
          titleHtml: 'Lv.' + escapeHtml(lvl),
          badgeHtml: '',
          items: lvlMap.get(lvl) || []
        }));
      } else if (currentSort === 'SCORE') {
        const tierMap = new Map();
        SCORE_GRADE_TIERS.forEach(t => tierMap.set(t.id, []));
        list.forEach(c => {
          const t = getScoreGradeTier(c);
          tierMap.get(t.id).push(c);
        });
        tierMap.forEach(items => items.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.initId - b.initId;
        }));
        groups = SCORE_GRADE_TIERS
          .filter(t => (tierMap.get(t.id) || []).length > 0)
          .map(t => ({
            id: 'tier_' + t.id,
            titleHtml: escapeHtml(t.label),
            badgeHtml: '<span class="score-tier-badge ' + t.badgeClass + '">' + escapeHtml(t.grade) + '</span>',
            items: tierMap.get(t.id)
          }));
      }

      let groupsHtml = '';
      let activeGroupCount = 0;
      groups.forEach(g => {
        if (!g.items || g.items.length === 0) return;
        activeGroupCount++;
        const isCollapsed = collapsedGroupIds.has(g.id);
        groupsHtml += 
          '<div class="song-group-section" data-group-id="' + g.id + '">' +
            '<div class="song-group-header ' + (isCollapsed ? 'collapsed' : '') + '" data-group-id="' + g.id + '">' +
              '<div class="song-group-left">' +
                '<span class="song-group-arrow">▼</span>' +
                '<span class="song-group-title">' + g.titleHtml + '</span>' +
              '</div>' +
              '<div class="song-group-right">' +
                g.badgeHtml +
                '<span class="song-group-count">' + g.items.length + '件</span>' +
              '</div>' +
            '</div>' +
            '<div class="song-group-body ' + (isCollapsed ? 'collapsed' : '') + '" id="body-' + g.id + '">' +
              g.items.map(renderSongRow).join('') +
            '</div>' +
          '</div>';
      });

      const toolbarCountEl = document.getElementById('songGroupToolbarCount');
      if (toolbarCountEl) toolbarCountEl.textContent = activeGroupCount + ' グループ (' + list.length + ' 件)';

      songListContainer.innerHTML = groupsHtml || '<div style="text-align:center; padding: 40px; color: var(--color-text-muted);">該当する楽曲がありません</div>';
      updateFilterSummary(list.length);
    }

    function updateFilterSummary(count) {
      const modalCountEl = document.getElementById('modalFilteredCount');
      if (modalCountEl) modalCountEl.textContent = \`(\${count.toLocaleString()}件)\`;

      const dotEl = document.getElementById('filterBadgeDot');
      const isFiltered = (
        currentSort !== 'DEFAULT' ||
        filterDiffs.size > 0 ||
        filterConst !== 'ALL' ||
        filterStatus !== 'ALL' ||
        !showDeleted ||
        searchQuery.trim().length > 0 ||
        filterScoreMin !== null ||
        filterScoreMax !== null ||
        excludeApPlus ||
        excludeAp ||
        excludeFc ||
        excludeEx ||
        excludePlayed ||
        filterConstMin !== null ||
        filterConstMax !== null ||
        filterConstExact !== null ||
        filterLevelMin !== '' ||
        filterLevelMax !== '' ||
        filterLevelExact !== ''
      );
      if (dotEl) dotEl.style.display = isFiltered ? 'inline-block' : 'none';
    }

    function openFilterModal() {
      document.getElementById('filterModal').classList.add('open');
    }

    function closeFilterModal() {
      document.getElementById('filterModal').classList.remove('open');
    }

    function renderB40() {
      const renderGrid = (items, startRank) => {
        return items.map((c, i) => {
          const rank = startRank + i;
          const statusHtml = c.status ? \`<span class="lamp-tag lamp-\${c.status.replace('+', '-plus')}">\${c.status}</span>\` : '';
          const isB10 = rank <= 10;
          return \`
            <div class="b40-card" onclick="openInputModal('\${c.id}')">
              <div class="b40-rank-num \${isB10 ? 'b10-rank' : ''}">#\${rank}</div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 13px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--color-text-main);">
                  \${escapeHtml(c.title)}
                </div>
                <div style="font-size: 11px; color: var(--color-text-sub); font-weight:600;">
                  <span class="ver-tag">v\${c.version}</span> \${c.diff} \${c.constant.toFixed(1)} | \${c.score.toLocaleString()} \${statusHtml}
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 13px; font-weight: 800; color: var(--color-primary-dark);">
                  \${c.effectiveRating.toFixed(4)}
                </div>
              </div>
            </div>
          \`;
        }).join('');
      };

      document.getElementById('b10Grid').innerHTML = renderGrid(currentCalc.b10, 1) || '<div style="color:var(--text-muted); padding:10px;">なし</div>';
      document.getElementById('b20Grid').innerHTML = renderGrid(currentCalc.b20, 11) || '<div style="color:var(--text-muted); padding:10px;">なし</div>';
      document.getElementById('b40Grid').innerHTML = renderGrid(currentCalc.b40, 21) || '<div style="color:var(--text-muted); padding:10px;">なし</div>';

      const b10Avg = currentCalc.b10.length ? (currentCalc.b10Sum / currentCalc.b10.length).toFixed(3) : '0.000';
      const b20Avg = currentCalc.b20.length ? (currentCalc.b20Sum / currentCalc.b20.length).toFixed(3) : '0.000';
      const b40Avg = currentCalc.b40.length ? (currentCalc.b40Sum / currentCalc.b40.length).toFixed(3) : '0.000';

      document.getElementById('b10Avg').textContent = \`平均: \${b10Avg}\`;
      document.getElementById('b20Avg').textContent = \`平均: \${b20Avg}\`;
      document.getElementById('b40Avg').textContent = \`平均: \${b40Avg}\`;
    }

    function renderMypage() {
      renderB40();
      renderMypageStats();
      renderApPlusTable();
      updateMypageBadges();
    }

    function parseDateVal(dStr) {
      if (!dStr) return 0;
      const formatted = formatApPlusDate(dStr);
      if (!formatted) return 0;
      const parts = formatted.split('/').map(x => parseInt(x, 10) || 0);
      if (parts.length < 3) return 0;
      return parts[0] * 10000 + parts[1] * 100 + parts[2];
    }

    function renderMypageStats() {
      if (!currentCalc) return;
      const allCharts = Object.values(currentCalc.chartMap);
      const isIvOnly = currentStatsScope === 'IV_PLUS';
      const targetCharts = isIvOnly ? allCharts.filter(c => c.diff === 'IV' || c.diff === 'IV-α') : allCharts;
      const totalCount = targetCharts.length;
      const filled = targetCharts.filter(c => c.score > 0);

      const apPlusCount = targetCharts.filter(c => c.score === 1010000 || c.status === 'AP+').length;
      const apTotalCount = targetCharts.filter(c => c.score === 1010000 || c.status === 'AP' || c.status === 'AP+').length;
      const apOnlyCount = apTotalCount - apPlusCount;
      const fcCount = targetCharts.filter(c => c.status === 'FC').length;
      const exCount = targetCharts.filter(c => c.score >= 1000000).length;
      const clearCount = filled.length - apTotalCount - fcCount;
      const unplayedCount = totalCount - filled.length;

      const registeredPct = totalCount > 0 ? ((filled.length / totalCount) * 100).toFixed(1) : '0.0';

      const progressLabelEl = document.getElementById('statOverallRegisteredLabel');
      if (progressLabelEl) {
        progressLabelEl.textContent = isIvOnly ? 'IV / IV-α 登録進捗' : '全難易度 登録進捗';
      }

      const progressEl = document.getElementById('statOverallRegisteredProgress');
      if (progressEl) {
        progressEl.textContent = filled.length.toLocaleString() + ' / ' + totalCount.toLocaleString() + ' (' + registeredPct + '%)';
      }

      // Progress bar segments
      const barApPlus = document.getElementById('statOverallBarApplus');
      const barAp = document.getElementById('statOverallBarAp');
      const barFc = document.getElementById('statOverallBarFc');
      const barClear = document.getElementById('statOverallBarClear');
      if (barApPlus && totalCount > 0) {
        barApPlus.style.width = ((apPlusCount / totalCount) * 100) + '%';
        barAp.style.width = ((apOnlyCount / totalCount) * 100) + '%';
        barFc.style.width = ((fcCount / totalCount) * 100) + '%';
        barClear.style.width = ((clearCount / totalCount) * 100) + '%';
      }

      // Lamp breakdown cells
      const lampGrid = document.getElementById('statLampGrid');
      if (lampGrid) {
        const pct = (cnt) => totalCount > 0 ? ((cnt / totalCount) * 100).toFixed(1) + '%' : '0.0%';
        lampGrid.innerHTML = 
          '<div class="lamp-stat-cell" style="border-color:#ff758c;">' +
            '<span class="lamp-stat-lbl" style="color:#ff758c;">🌟 AP+ (理論値)</span>' +
            '<span class="lamp-stat-val" style="color:#ff758c;">' + apPlusCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(apPlusCount) + '</span>' +
          '</div>' +
          '<div class="lamp-stat-cell" style="border-color:#ff9900;">' +
            '<span class="lamp-stat-lbl" style="color:#ff9900;">🔶 AP</span>' +
            '<span class="lamp-stat-val" style="color:#ff9900;">' + apTotalCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(apTotalCount) + '</span>' +
          '</div>' +
          '<div class="lamp-stat-cell" style="border-color:#0099ff;">' +
            '<span class="lamp-stat-lbl" style="color:#0099ff;">🔷 FC (フルコン)</span>' +
            '<span class="lamp-stat-val" style="color:#0099ff;">' + fcCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(fcCount) + '</span>' +
          '</div>' +
          '<div class="lamp-stat-cell" style="border-color:#10b981;">' +
            '<span class="lamp-stat-lbl" style="color:#10b981;">🟢 EX (100万+)</span>' +
            '<span class="lamp-stat-val" style="color:#10b981;">' + exCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(exCount) + '</span>' +
          '</div>' +
          '<div class="lamp-stat-cell" style="border-color:#6b7c96;">' +
            '<span class="lamp-stat-lbl" style="color:#6b7c96;">⚪ CLEAR</span>' +
            '<span class="lamp-stat-val" style="color:#6b7c96;">' + clearCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(clearCount) + '</span>' +
          '</div>' +
          '<div class="lamp-stat-cell" style="border-color:#cbd5e1;">' +
            '<span class="lamp-stat-lbl" style="color:#94a3b8;">🔒 未プレイ</span>' +
            '<span class="lamp-stat-val" style="color:#94a3b8;">' + unplayedCount.toLocaleString() + '</span>' +
            '<span class="lamp-stat-pct">' + pct(unplayedCount) + '</span>' +
          '</div>';
      }

      // Meta averages
      const avgScore = filled.length ? Math.round(filled.reduce((sum, c) => sum + c.score, 0) / filled.length) : 0;
      const ivCharts = allCharts.filter(c => c.diff === 'IV' || c.diff === 'IV-α');
      const ivFilled = ivCharts.filter(c => c.score > 0);
      const ivAvgScore = ivFilled.length ? Math.round(ivFilled.reduce((sum, c) => sum + c.score, 0) / ivFilled.length) : 0;
      const ivApCount = ivCharts.filter(c => c.score === 1010000 || c.status === 'AP' || c.status === 'AP+').length;
      const ivUnApRemaining = ivCharts.length - ivApCount;
      const ivRemaining = ivCharts.length - apPlusRecords.length;

      const statAvgScoreLbl = document.getElementById('statAvgScoreLbl');
      const statAvgScoreEl = document.getElementById('statAvgScore');
      if (statAvgScoreLbl && statAvgScoreEl) {
        statAvgScoreLbl.textContent = isIvOnly ? 'IV登録 平均スコア' : '登録全譜面 平均スコア';
        statAvgScoreEl.textContent = avgScore > 0 ? avgScore.toLocaleString() : '-';
      }

      const statIvAvgScoreBox = document.getElementById('statIvAvgScoreBox');
      const statIvAvgScoreEl = document.getElementById('statIvAvgScore');
      if (statIvAvgScoreBox && statIvAvgScoreEl) {
        if (isIvOnly) {
          statIvAvgScoreBox.style.display = 'none';
        } else {
          statIvAvgScoreBox.style.display = 'flex';
          statIvAvgScoreEl.textContent = ivAvgScore > 0 ? ivAvgScore.toLocaleString() : '-';
        }
      }

      const statIvUnApEl = document.getElementById('statIvUnAp');
      if (statIvUnApEl) {
        statIvUnApEl.textContent = ivUnApRemaining > 0 ? (ivUnApRemaining + ' 曲') : '全AP達成！🌟';
      }

      const statIvRemainingEl = document.getElementById('statIvRemaining');
      if (statIvRemainingEl) {
        statIvRemainingEl.textContent = ivRemaining > 0 ? (ivRemaining + ' 曲') : '全曲達成！👑';
      }

      // Quick Jump Previews
      const prevRating = document.getElementById('statPreviewRating');
      if (prevRating) prevRating.textContent = '総合 ' + currentCalc.totalRating.toFixed(4);

      const prevB40 = document.getElementById('statPreviewB40Avg');
      if (prevB40) {
        const b10Avg = currentCalc.b10.length ? (currentCalc.b10Sum / currentCalc.b10.length).toFixed(2) : '-';
        const b20Avg = currentCalc.b20.length ? (currentCalc.b20Sum / currentCalc.b20.length).toFixed(2) : '-';
        prevB40.textContent = 'B10平均: ' + b10Avg + ' | B20平均: ' + b20Avg;
      }

      const prevApCount = document.getElementById('statPreviewApCount');
      if (prevApCount) {
        const apPct = ivCharts.length > 0 ? ((apPlusRecords.length / ivCharts.length) * 100).toFixed(1) : '0.0';
        prevApCount.textContent = apPlusRecords.length + ' / ' + ivCharts.length + ' 曲 (' + apPct + '%)';
      }

      const prevLatestAp = document.getElementById('statPreviewLatestAp');
      if (prevLatestAp) {
        if (apPlusRecords.length > 0) {
          const sortedByNo = [...apPlusRecords].sort((a, b) => (b.no || 0) - (a.no || 0));
          const latest = sortedByNo[0];
          prevLatestAp.textContent = '最新: No.' + latest.no + ' ' + latest.title + (latest.date ? ' (' + latest.date + ')' : '');
        } else {
          prevLatestAp.textContent = '記録を追加して達成度を管理';
        }
      }

      // Difficulty Table
      const diffStatTitle = document.getElementById('diffStatTitle');
      if (diffStatTitle) {
        diffStatTitle.innerHTML = isIvOnly
          ? '<span>🎯</span> 難易度別クリアランプ・達成状況 (IV / IV-α のみ)'
          : '<span>🎯</span> 難易度別クリアランプ・達成状況';
      }
      const diffTableBody = document.getElementById('diffStatTableBody');
      if (diffTableBody) {
        const diffs = isIvOnly ? ['IV-α', 'IV'] : ['IV-α', 'IV', 'III', 'II', 'I'];
        let diffHtml = '';
        diffs.forEach(d => {
          const dCharts = allCharts.filter(c => c.diff === d);
          if (dCharts.length === 0) return;
          const dFilled = dCharts.filter(c => c.score > 0);
          const dApPlus = dCharts.filter(c => c.score === 1010000 || c.status === 'AP+').length;
          const dApTotal = dCharts.filter(c => c.score === 1010000 || c.status === 'AP' || c.status === 'AP+').length;
          const dApOnly = dApTotal - dApPlus;
          const dFc = dCharts.filter(c => c.status === 'FC').length;
          const dAvg = dFilled.length ? Math.round(dFilled.reduce((sum, c) => sum + c.score, 0) / dFilled.length) : 0;
          const dPct = ((dFilled.length / dCharts.length) * 100).toFixed(1);
          const diffClass = getDiffClass(d);

          diffHtml += 
            '<tr>' +
              '<td><span class="diff-badge ' + diffClass + '" style="display:inline-block; font-size:11px; padding:2px 8px;">' + d + '</span></td>' +
              '<td style="font-weight:700;">' + dFilled.length + ' / ' + dCharts.length + '</td>' +
              '<td>' +
                '<div style="font-weight:800; color:var(--color-primary-dark); font-size:11px;">' + dPct + '%</div>' +
                '<div class="stacked-bar-wrap" style="height:6px; width:70px; margin:0 auto;">' +
                  '<div class="bar-seg-applus" style="width:' + ((dApPlus/dCharts.length)*100) + '%;"></div>' +
                  '<div class="bar-seg-ap" style="width:' + ((dApOnly/dCharts.length)*100) + '%;"></div>' +
                  '<div class="bar-seg-fc" style="width:' + ((dFc/dCharts.length)*100) + '%;"></div>' +
                '</div>' +
              '</td>' +
              '<td style="font-weight:800; color:#ff758c;">' + dApPlus + '</td>' +
              '<td style="font-weight:800; color:#ff9900;">' + dApTotal + '</td>' +
              '<td style="font-weight:800; color:#0099ff;">' + dFc + '</td>' +
              '<td style="font-weight:700;">' + (dAvg > 0 ? dAvg.toLocaleString() : '-') + '</td>' +
            '</tr>';
        });
        diffTableBody.innerHTML = diffHtml;
      }

      // Level Breakdown (Gamified multi-color bar)
      const levelStatTitle = document.getElementById('levelStatTitle');
      if (levelStatTitle) {
        levelStatTitle.innerHTML = isIvOnly
          ? '<span>📈</span> レベル別 埋まり状況 (IV / IV-α のみ)'
          : '<span>📈</span> レベル別 埋まり状況 (Lv.1 〜 Lv.14+)';
      }
      const levelStatNote = document.getElementById('levelStatNote');
      if (levelStatNote) {
        levelStatNote.textContent = isIvOnly
          ? 'IV / IV-α 譜面を対象としたレベル別達成度（金: AP+ / 橙: AP / 青: FC / 緑: CLEAR）'
          : '全難易度を対象としたレベル別達成度（金: AP+ / 橙: AP / 青: FC / 緑: CLEAR）';
      }
      const levelContainer = document.getElementById('levelStatContainer');
      if (levelContainer) {
        const orderLevels = ['14+', '14', '13+', '13', '12+', '12', '11+', '11', '10+', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
        let lvlHtml = '';
        orderLevels.forEach(lvl => {
          const lCharts = targetCharts.filter(c => String(c.level) === lvl);
          if (lCharts.length === 0) return;
          const lFilled = lCharts.filter(c => c.score > 0);
          const lApPlus = lCharts.filter(c => c.score === 1010000 || c.status === 'AP+').length;
          const lApTotal = lCharts.filter(c => c.score === 1010000 || c.status === 'AP' || c.status === 'AP+').length;
          const lApOnly = lApTotal - lApPlus;
          const lFc = lCharts.filter(c => c.status === 'FC').length;
          const lClear = lFilled.length - lApTotal - lFc;
          const lTotal = lCharts.length;

          const pApPlus = (lApPlus / lTotal) * 100;
          const pAp = (lApOnly / lTotal) * 100;
          const pFc = (lFc / lTotal) * 100;
          const pClear = (lClear / lTotal) * 100;

          lvlHtml += 
            '<div class="level-stat-row">' +
              '<div class="level-stat-badge">Lv.' + lvl + '</div>' +
              '<div class="level-stat-progress">' +
                '<div class="level-stat-meta">' +
                  '<span>進捗 ' + lFilled.length + ' / ' + lTotal + ' (' + (((lFilled.length/lTotal)*100).toFixed(1)) + '%)</span>' +
                  '<span>' +
                    '<span style="color:#ff758c; font-weight:800;">AP+:' + lApPlus + '</span>' +
                    '<span style="color:#ff9900; font-weight:800; margin-left:4px;">AP:' + lApTotal + '</span>' +
                    '<span style="color:#0099ff; font-weight:800; margin-left:4px;">FC:' + lFc + '</span>' +
                  '</span>' +
                '</div>' +
                '<div class="stacked-bar-wrap">' +
                  '<div class="bar-seg-applus" style="width:' + pApPlus + '%;"></div>' +
                  '<div class="bar-seg-ap" style="width:' + pAp + '%;"></div>' +
                  '<div class="bar-seg-fc" style="width:' + pFc + '%;"></div>' +
                  '<div class="bar-seg-clear" style="width:' + pClear + '%;"></div>' +
                '</div>' +
              '</div>' +
            '</div>';
        });
        levelContainer.innerHTML = lvlHtml;
      }

      // Song Pack Breakdown
      renderPackStats();
    }

    function renderPackStats() {
      const container = document.getElementById('packStatContainer');
      if (!container || !currentCalc) return;
      const allCharts = Object.values(currentCalc.chartMap);
      const isIvOnly = currentStatsScope === 'IV_PLUS';
      const targetCharts = isIvOnly ? allCharts.filter(c => c.diff === 'IV' || c.diff === 'IV-α') : allCharts;
      const query = (document.getElementById('packStatSearch')?.value || '').toLowerCase().trim();

      const packTitleEl = document.getElementById('packStatHeaderTitle');
      if (packTitleEl) {
        packTitleEl.innerHTML = isIvOnly
          ? '<span>🎵</span> ソングパック別 進捗一覧 (IV / IV-α のみ)'
          : '<span>🎵</span> ソングパック別 進捗一覧 (全パック)';
      }

      let html = '';
      packOrder.forEach(packName => {
        if (query && !packName.toLowerCase().includes(query)) return;
        const pCharts = targetCharts.filter(c => c.pack === packName);
        if (pCharts.length === 0) return;
        const pFilled = pCharts.filter(c => c.score > 0);
        const pApPlus = pCharts.filter(c => c.score === 1010000 || c.status === 'AP+').length;
        const pApTotal = pCharts.filter(c => c.score === 1010000 || c.status === 'AP' || c.status === 'AP+').length;
        const pApOnly = pApTotal - pApPlus;
        const pFc = pCharts.filter(c => c.status === 'FC').length;
        const pAvg = pFilled.length ? Math.round(pFilled.reduce((sum, c) => sum + c.score, 0) / pFilled.length) : 0;
        const pPct = ((pFilled.length / pCharts.length) * 100).toFixed(1);

        let badgeHtml = '';
        if (pApPlus === pCharts.length && pCharts.length > 0) {
          badgeHtml = '<span class="pack-badge-pill" style="background:#fce7f3; color:#be185d;">👑 全AP+コンプリート！</span>';
        } else if (pApTotal === pCharts.length && pCharts.length > 0) {
          badgeHtml = '<span class="pack-badge-pill" style="background:#ffedd5; color:#c2410c;">🌟 全APコンプリート！</span>';
        } else if ((pApTotal + pFc) === pCharts.length && pCharts.length > 0) {
          badgeHtml = '<span class="pack-badge-pill" style="background:#e0f2fe; color:#0369a1;">🔷 全FCコンプリート！</span>';
        } else if (pFilled.length === pCharts.length && pCharts.length > 0) {
          badgeHtml = '<span class="pack-badge-pill" style="background:#dcfce7; color:#15803d;">✅ 全曲クリア！</span>';
        }

        html += 
          '<div class="pack-stat-card">' +
            '<div class="pack-stat-header">' +
              '<div class="pack-stat-title">' +
                '<span>' + escapeHtml(packName) + '</span>' +
                badgeHtml +
              '</div>' +
              '<button class="btn-pack-jump" type="button" data-pack="' + escapeHtml(packName) + '">曲一覧へ 🔍</button>' +
            '</div>' +
            '<div class="stacked-bar-wrap" style="height:6px; margin: 4px 0 6px 0;">' +
              '<div class="bar-seg-applus" style="width:' + ((pApPlus/pCharts.length)*100) + '%;"></div>' +
              '<div class="bar-seg-ap" style="width:' + ((pApOnly/pCharts.length)*100) + '%;"></div>' +
              '<div class="bar-seg-fc" style="width:' + ((pFc/pCharts.length)*100) + '%;"></div>' +
              '<div class="bar-seg-clear" style="width:' + (((pFilled.length - pApTotal - pFc)/pCharts.length)*100) + '%;"></div>' +
            '</div>' +
            '<div class="pack-stat-meta">' +
              '<span>進捗: ' + pFilled.length + '/' + pCharts.length + ' (' + pPct + '%)</span>' +
              '<span>🌟AP+:' + pApPlus + ' &nbsp; 🔶AP:' + pApTotal + ' &nbsp; 🔷FC:' + pFc + '</span>' +
              '<span>平均: ' + (pAvg > 0 ? pAvg.toLocaleString() : '-') + '</span>' +
            '</div>' +
          '</div>';
      });

      container.innerHTML = html || '<div style="color:var(--color-text-muted); text-align:center; padding:20px;">該当するソングパックがありません</div>';

      container.querySelectorAll('.btn-pack-jump').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = btn.getAttribute('data-pack');
          if (p) viewPackInSongs(p);
        });
      });
    }

    window.viewPackInSongs = function(packName) {
      document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
      const songsTab = document.querySelector('.tab-item[data-tab="songs"]');
      if (songsTab) songsTab.classList.add('active');

      document.getElementById('viewSongs').style.display = 'block';
      document.getElementById('viewMypage').style.display = 'none';
      document.getElementById('viewSettings').style.display = 'none';
      const fabGroup = document.getElementById('floatingBtnGroup');
      if (fabGroup) fabGroup.style.display = 'flex';

      searchQuery = packName;
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = packName;

      if (currentStatsScope === 'IV_PLUS') {
        filterDiffs.clear();
        filterDiffs.add('IV');
        filterDiffs.add('IV-α');
        document.querySelectorAll('#diffFilters .filter-btn').forEach(p => {
          const val = p.getAttribute('data-val');
          p.classList.toggle('active', val === 'IV' || val === 'IV-α');
        });
      }

      renderSongList();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    function renderApPlusTable() {
      const tbody = document.getElementById('apPlusTableBody');
      if (!tbody) return;

      const allSongs = getAllSongs();
      const ivCharts = allSongs.filter(c => c[2] === 'IV' || c[2] === 'IV-α');

      const summaryBadge = document.getElementById('apPlusSummaryBadge');
      if (summaryBadge) {
        const pct = ivCharts.length > 0 ? ((apPlusRecords.length / ivCharts.length) * 100).toFixed(1) : '0.0';
        summaryBadge.textContent = '達成数: ' + apPlusRecords.length + ' / ' + ivCharts.length + ' 曲 (' + pct + '%)';
      }

      const q = apPlusSearchQuery.toLowerCase().trim();
      let list = apPlusRecords.filter(r => {
        if (!q) return true;
        const matchTitle = (r.title || '').toLowerCase().includes(q);
        const matchNo = String(r.no || '').includes(q);
        const matchDate = (r.date || '').toLowerCase().includes(q);
        return matchTitle || matchNo || matchDate;
      });

      list.sort((a, b) => {
        if (apPlusSort === 'NO_ASC') return (a.no || 0) - (b.no || 0);
        if (apPlusSort === 'NO_DESC') return (b.no || 0) - (a.no || 0);
        if (apPlusSort === 'DATE_DESC') {
          const dComp = parseDateVal(b.date) - parseDateVal(a.date);
          if (dComp !== 0) return dComp;
          return (b.no || 0) - (a.no || 0);
        }
        if (apPlusSort === 'DATE_ASC') {
          const dComp = parseDateVal(a.date) - parseDateVal(b.date);
          if (dComp !== 0) return dComp;
          return (a.no || 0) - (b.no || 0);
        }
        if (apPlusSort === 'CONST_DESC') {
          const cB = (b.constant !== undefined && b.constant !== null && !isNaN(b.constant)) ? b.constant : 0;
          const cA = (a.constant !== undefined && a.constant !== null && !isNaN(a.constant)) ? a.constant : 0;
          if (cB !== cA) return cB - cA;
          return (a.no || 0) - (b.no || 0);
        }
        if (apPlusSort === 'CONST_ASC') {
          const cB = (b.constant !== undefined && b.constant !== null && !isNaN(b.constant)) ? b.constant : 0;
          const cA = (a.constant !== undefined && a.constant !== null && !isNaN(a.constant)) ? a.constant : 0;
          if (cA !== cB) return cA - cB;
          return (a.no || 0) - (b.no || 0);
        }
        if (apPlusSort === 'TITLE') {
          return (a.title || '').localeCompare(b.title || '', 'ja');
        }
        return (a.no || 0) - (b.no || 0);
      });

      let html = '';
      list.forEach(r => {
        const origIndex = apPlusRecords.indexOf(r);
        const diffClass = getDiffClass(r.diff);

        // Master chart fallback for level and constant
        const match = masterSongs.find(s => s[1].toLowerCase() === (r.title || '').toLowerCase() && s[2] === r.diff);
        const level = (r.level && r.level !== 'undefined' && r.level !== 'null') ? r.level : (match ? match[3] : '-');
        const constantVal = (r.constant !== undefined && r.constant !== null && !isNaN(r.constant) && Number(r.constant) > 0)
          ? Number(r.constant)
          : (match ? match[4] : 0);
        const chartId = r.chartId || (match ? match[0] : '');
        const dateStr = formatApPlusDate(r.date);

        html += 
          '<tr>' +
            '<td class="ap-no-cell">' + r.no + '</td>' +
            '<td class="ap-title-cell" data-chart-id="' + escapeHtml(chartId) + '" title="クリックしてスコアを確認・編集">' +
              escapeHtml(r.title) +
            '</td>' +
            '<td style="text-align:center;">' +
              '<span class="diff-badge ' + diffClass + '" style="display:inline-block; font-size:11px; padding:2px 6px;">' + r.diff + '</span>' +
            '</td>' +
            '<td style="text-align:center; font-weight:800;">' + escapeHtml(level) + '</td>' +
            '<td class="ap-const-cell">' + constantVal.toFixed(1) + '</td>' +
            '<td class="col-date ap-date-cell">' + escapeHtml(dateStr || '-') + '</td>' +
            '<td class="ap-action-cell">' +
              '<button class="btn-table-action" type="button" title="編集" data-action="edit" data-idx="' + origIndex + '">✎</button>' +
              '<button class="btn-table-action del" type="button" title="削除" data-action="del" data-idx="' + origIndex + '">🗑</button>' +
            '</td>' +
          '</tr>';
      });

      tbody.innerHTML = html || '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--color-text-muted);">該当する記録がありません</td></tr>';

      tbody.querySelectorAll('.ap-title-cell').forEach(td => {
        td.addEventListener('click', () => {
          const id = td.getAttribute('data-chart-id');
          if (id) openInputModal(id);
        });
      });

      tbody.querySelectorAll('.btn-table-action').forEach(btn => {
        btn.addEventListener('click', () => {
          const act = btn.getAttribute('data-action');
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (act === 'edit') openAddApPlusModal(idx);
          else if (act === 'del') deleteApPlusRecord(idx);
        });
      });

      applyApPlusDateVisibility();
    }

    function initApPlusForm() {
      const select = document.getElementById('apPlusChartSelect');
      if (!select) return;
      const allSongs = getAllSongs();
      const ivCharts = allSongs.filter(c => c[2] === 'IV' || c[2] === 'IV-α');

      ivCharts.sort((a, b) => {
        if (b[4] !== a[4]) return b[4] - a[4];
        return a[1].localeCompare(b[1], 'ja');
      });

      let opts = '<option value="">-- 譜面を選択してください --</option>';
      ivCharts.forEach(c => {
        opts += '<option value="' + c[0] + '" data-title="' + escapeHtml(c[1]) + '" data-diff="' + c[2] + '" data-level="' + c[3] + '" data-const="' + c[4] + '" data-pack="' + escapeHtml(c[6]) + '">[' + c[2] + ' Lv.' + c[3] + ' 定数' + c[4].toFixed(1) + '] ' + escapeHtml(c[1]) + ' (' + escapeHtml(c[6]) + ')</option>';
      });
      select.innerHTML = opts;

      select.addEventListener('change', () => {
        const opt = select.selectedOptions[0];
        if (opt && opt.value) {
          document.getElementById('apPlusPreviewTitle').textContent = opt.getAttribute('data-title') || '曲名';
          document.getElementById('apPlusPreviewPack').textContent = opt.getAttribute('data-pack') || 'パック名';
          const diff = opt.getAttribute('data-diff') || 'IV';
          const diffBadge = document.getElementById('apPlusPreviewDiff');
          diffBadge.textContent = diff;
          diffBadge.className = 'diff-badge ' + getDiffClass(diff);
          document.getElementById('apPlusPreviewConst').textContent = parseFloat(opt.getAttribute('data-const') || 0).toFixed(1);
        } else {
          document.getElementById('apPlusPreviewTitle').textContent = '曲名';
          document.getElementById('apPlusPreviewPack').textContent = 'パック名';
          document.getElementById('apPlusPreviewConst').textContent = '-';
        }
      });
    }

    window.openAddApPlusModal = function(editIndex = -1) {
      document.getElementById('apPlusEditIndex').value = editIndex;
      const titleEl = document.getElementById('apPlusModalTitle');
      const select = document.getElementById('apPlusChartSelect');
      const noInput = document.getElementById('apPlusNoInput');
      const dateInput = document.getElementById('apPlusDateInput');

      if (editIndex >= 0 && apPlusRecords[editIndex]) {
        const r = apPlusRecords[editIndex];
        titleEl.textContent = '✎ 理論値(AP+)記録の編集';
        noInput.value = r.no || '';
        dateInput.value = r.date || '';
        select.value = r.chartId || '';
        select.dispatchEvent(new Event('change'));
      } else {
        titleEl.textContent = '🌟 理論値(AP+)記録の追加';
        const nextNo = apPlusRecords.reduce((max, r) => Math.max(max, r.no || 0), 0) + 1;
        noInput.value = nextNo;
        const d = new Date();
        dateInput.value = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
        select.value = '';
        select.dispatchEvent(new Event('change'));
      }

      document.getElementById('apPlusModal').classList.add('open');
    };

    function closeAddApPlusModal() {
      document.getElementById('apPlusModal').classList.remove('open');
    }

    function saveApPlusModal() {
      const editIndex = parseInt(document.getElementById('apPlusEditIndex').value, 10);
      const select = document.getElementById('apPlusChartSelect');
      const opt = select.selectedOptions[0];
      if (!opt || !opt.value) {
        alert('譜面を選択してください。');
        return;
      }

      const noVal = parseInt(document.getElementById('apPlusNoInput').value, 10) || 1;
      const dateVal = document.getElementById('apPlusDateInput').value.trim();
      const chartId = opt.value;
      const title = opt.getAttribute('data-title');
      const diff = opt.getAttribute('data-diff');
      const level = opt.getAttribute('data-level');
      const constant = parseFloat(opt.getAttribute('data-const')) || 0;

      const record = {
        no: noVal,
        title: title,
        diff: diff,
        level: level,
        constant: constant,
        date: dateVal,
        chartId: chartId
      };

      if (editIndex >= 0 && editIndex < apPlusRecords.length) {
        apPlusRecords[editIndex] = record;
      } else {
        apPlusRecords.push(record);
      }

      saveApPlusRecords();
      renderApPlusTable();
      renderMypageStats();
      closeAddApPlusModal();
    }

    window.deleteApPlusRecord = function(index) {
      if (index < 0 || index >= apPlusRecords.length) return;
      const r = apPlusRecords[index];
      if (confirm('No.' + r.no + ' 「' + r.title + '」 のAP+記録を削除しますか？')) {
        apPlusRecords.splice(index, 1);
        saveApPlusRecords();
        renderApPlusTable();
        renderMypageStats();
      }
    };

    function autoSyncApPlusRecords() {
      const allSongs = getAllSongs();
      const ivCharts = allSongs.filter(c => c[2] === 'IV' || c[2] === 'IV-α');

      const completed = ivCharts.filter(c => {
        const s = userScores[c[0]];
        return s && (s.score === 1010000 || s.status === 'AP+');
      });

      const existingChartIds = new Set(apPlusRecords.map(r => r.chartId));
      const newToAdd = completed.filter(c => !existingChartIds.has(c[0]));

      if (newToAdd.length === 0) {
        alert('現在、記録一覧に含まれていない新しいAP+譜面（IV / IV-α）はありません。');
        return;
      }

      const d = new Date();
      const todayStr = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();

      if (confirm(newToAdd.length + '件の未記録AP+譜面が見つかりました。\\n本日の日付（' + todayStr + '）で記録に追加しますか？')) {
        let nextNo = apPlusRecords.reduce((max, r) => Math.max(max, r.no || 0), 0) + 1;
        newToAdd.forEach(c => {
          apPlusRecords.push({
            no: nextNo++,
            title: c[1],
            diff: c[2],
            level: c[3],
            constant: c[4],
            date: todayStr,
            chartId: c[0]
          });
        });
        saveApPlusRecords();
        renderApPlusTable();
        renderMypageStats();
        alert(newToAdd.length + '件の譜面を記録に追加しました！');
      }
    }

    function escapeHtml(str) {
      return (str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
      }[m]));
    }

    window.openInputModal = function(id) {
      selectedChart = currentCalc.chartMap[id];
      if (!selectedChart) return;

      currentInputScore = selectedChart.score || 0;
      currentInputStatus = selectedChart.status || '';

      const delLabel = selectedChart.endOfSale === 1 ? ' [販売終了]' : '';
      document.getElementById('modalSongTitle').textContent = \`\${selectedChart.title}\${delLabel} [v\${selectedChart.version} \${selectedChart.diff} \${selectedChart.constant.toFixed(1)}]\`;
      
      const scoreInput = document.getElementById('modalScoreInput');
      scoreInput.value = currentInputScore > 0 ? currentInputScore.toString() : '';
      updateModalDisplay(false);

      document.getElementById('inputModal').classList.add('open');

      setTimeout(() => {
        scoreInput.focus();
        scoreInput.select();
      }, 50);
    };

    function closeModal() {
      document.getElementById('inputModal').classList.remove('open');
      selectedChart = null;
    }

    function updateModalDisplay(syncInput = true) {
      if (syncInput) {
        document.getElementById('modalScoreInput').value = currentInputScore > 0 ? currentInputScore.toString() : '';
      }

      document.querySelectorAll('.lamp-choice').forEach(el => {
        el.classList.toggle('selected', el.getAttribute('data-status') === currentInputStatus);
      });

      if (selectedChart && selectedChart.endOfSale === 1) {
        document.getElementById('modalPreviewRating').textContent = 'Rating 0.0000 (販売終了)';
      } else if (selectedChart) {
        const rate = calcSingleRating(currentInputScore, selectedChart.constant, selectedChart.endOfSale);
        document.getElementById('modalPreviewRating').textContent = \`Rating \${rate.toFixed(4)}\`;
      }
    }

    const modalScoreInputEl = document.getElementById('modalScoreInput');
    modalScoreInputEl.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/[^0-9]/g, '');
      let val = parseInt(raw) || 0;
      if (val > 1010000) {
        val = 1010000;
        e.target.value = '1010000';
      } else if (raw !== e.target.value) {
        e.target.value = raw;
      }
      currentInputScore = val;
      if (currentInputScore === 1010000) {
        currentInputStatus = 'AP+';
      } else if (currentInputStatus === 'AP+') {
        currentInputStatus = 'AP';
      }
      updateModalDisplay(false);
    });

    modalScoreInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btnModalSave').click();
      }
    });

    document.querySelectorAll('.key-cell').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-key');
        if (key === 'C') {
          currentInputScore = 0;
          currentInputStatus = '';
        } else if (key === 'BS') {
          const s = currentInputScore.toString();
          currentInputScore = s.length > 1 ? parseInt(s.slice(0, -1)) : 0;
          if (currentInputStatus === 'AP+' && currentInputScore < 1010000) {
            currentInputStatus = 'AP';
          }
        } else {
          const s = currentInputScore === 0 ? key : currentInputScore.toString() + key;
          const val = parseInt(s);
          if (val <= 1010000) {
            currentInputScore = val;
            if (currentInputScore === 1010000) {
              currentInputStatus = 'AP+';
            } else if (currentInputStatus === 'AP+') {
              currentInputStatus = 'AP';
            }
          }
        }
        updateModalDisplay();
      });
    });

    document.querySelectorAll('.quick-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-quick'));
        currentInputScore = val;
        const st = btn.getAttribute('data-status');
        if (st) {
          currentInputStatus = st;
        } else if (val === 1010000) {
          currentInputStatus = 'AP+';
        } else if (currentInputStatus === 'AP+') {
          currentInputStatus = 'AP';
        }
        updateModalDisplay();
      });
    });

    document.querySelectorAll('.lamp-choice').forEach(opt => {
      opt.addEventListener('click', () => {
        const st = opt.getAttribute('data-status');
        if (currentInputStatus === st) {
          currentInputStatus = '';
        } else {
          currentInputStatus = st;
          if (st === 'AP+') {
            currentInputScore = 1010000;
          }
        }
        updateModalDisplay();
      });
    });

    document.getElementById('btnModalSave').addEventListener('click', () => {
      if (selectedChart) {
        if (currentInputScore === 1010000) {
          currentInputStatus = 'AP+';
        }
        userScores[selectedChart.id] = {
          score: currentInputScore,
          status: currentInputStatus
        };
        closeModal();
        refresh();
        checkUnsavedChanges();
      }
    });

    document.getElementById('btnModalClose').addEventListener('click', closeModal);
    document.getElementById('inputModal').addEventListener('click', (e) => {
      if (e.target.id === 'inputModal') closeModal();
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderSongList();
    });

    document.getElementById('sortSelect').addEventListener('change', (e) => {
      currentSort = e.target.value;
      collapsedGroupIds.clear();
      renderSongList();
    });

    // Collapsible Song Groups Interaction
    songListContainer.addEventListener('click', (e) => {
      const header = e.target.closest('.song-group-header');
      if (!header) return;
      e.stopPropagation();
      const gid = header.getAttribute('data-group-id');
      if (!gid) return;
      const body = document.getElementById('body-' + gid);
      if (collapsedGroupIds.has(gid)) {
        collapsedGroupIds.delete(gid);
        header.classList.remove('collapsed');
        if (body) body.classList.remove('collapsed');
      } else {
        collapsedGroupIds.add(gid);
        header.classList.add('collapsed');
        if (body) body.classList.add('collapsed');
      }
    });

    document.getElementById('btnExpandAllGroups')?.addEventListener('click', () => {
      collapsedGroupIds.clear();
      document.querySelectorAll('.song-group-header').forEach(h => h.classList.remove('collapsed'));
      document.querySelectorAll('.song-group-body').forEach(b => b.classList.remove('collapsed'));
    });

    document.getElementById('btnCollapseAllGroups')?.addEventListener('click', () => {
      document.querySelectorAll('.song-group-section').forEach(sec => {
        const gid = sec.getAttribute('data-group-id');
        if (gid) collapsedGroupIds.add(gid);
      });
      document.querySelectorAll('.song-group-header').forEach(h => h.classList.add('collapsed'));
      document.querySelectorAll('.song-group-body').forEach(b => b.classList.add('collapsed'));
    });

    document.getElementById('chkShowDeleted').addEventListener('change', (e) => {
      showDeleted = e.target.checked;
      renderSongList();
    });

    document.querySelectorAll('#diffFilters .filter-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        const val = pill.getAttribute('data-val');
        const allBtn = document.querySelector('#diffFilters .filter-btn[data-val="ALL"]');
        const specificBtns = document.querySelectorAll('#diffFilters .filter-btn:not([data-val="ALL"])');

        if (val === 'ALL') {
          filterDiffs.clear();
          specificBtns.forEach(p => p.classList.remove('active'));
          allBtn.classList.add('active');
        } else {
          if (filterDiffs.has(val)) {
            filterDiffs.delete(val);
            pill.classList.remove('active');
          } else {
            filterDiffs.add(val);
            pill.classList.add('active');
          }

          if (filterDiffs.size === 0) {
            allBtn.classList.add('active');
          } else if (filterDiffs.size === specificBtns.length) {
            filterDiffs.clear();
            specificBtns.forEach(p => p.classList.remove('active'));
            allBtn.classList.add('active');
          } else {
            allBtn.classList.remove('active');
          }
        }
        renderSongList();
      });
    });

    document.querySelectorAll('#constFilters .filter-btn, #statusFilters .filter-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        const type = pill.getAttribute('data-filter');
        const val = pill.getAttribute('data-val');

        if (type === 'const') {
          document.querySelectorAll('#constFilters .filter-btn[data-filter="const"]').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          filterConst = val;
        } else if (type === 'status') {
          if (pill.classList.contains('active')) {
            pill.classList.remove('active');
            filterStatus = 'ALL';
          } else {
            document.querySelectorAll('#statusFilters .filter-btn[data-filter="status"]').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterStatus = val;
          }
        }
        renderSongList();
      });
    });

    function syncFilterInputs() {
      const sMinVal = document.getElementById('filterScoreMin').value.trim();
      filterScoreMin = sMinVal !== '' ? parseInt(sMinVal, 10) : null;
      if (isNaN(filterScoreMin)) filterScoreMin = null;

      const sMaxVal = document.getElementById('filterScoreMax').value.trim();
      filterScoreMax = sMaxVal !== '' ? parseInt(sMaxVal, 10) : null;
      if (isNaN(filterScoreMax)) filterScoreMax = null;

      excludeApPlus = document.getElementById('chkExcludeApPlus').checked;
      excludeAp = document.getElementById('chkExcludeAp').checked;
      excludeFc = document.getElementById('chkExcludeFc').checked;
      excludeEx = document.getElementById('chkExcludeEx').checked;
      excludePlayed = document.getElementById('chkExcludePlayed').checked;

      const cMinVal = document.getElementById('filterConstMin').value.trim();
      filterConstMin = cMinVal !== '' ? parseFloat(cMinVal) : null;
      if (isNaN(filterConstMin)) filterConstMin = null;

      const cMaxVal = document.getElementById('filterConstMax').value.trim();
      filterConstMax = cMaxVal !== '' ? parseFloat(cMaxVal) : null;
      if (isNaN(filterConstMax)) filterConstMax = null;

      const cExactVal = document.getElementById('filterConstExact').value.trim();
      filterConstExact = cExactVal !== '' ? parseFloat(cExactVal) : null;
      if (isNaN(filterConstExact)) filterConstExact = null;

      filterLevelMin = document.getElementById('filterLevelMin').value;
      filterLevelMax = document.getElementById('filterLevelMax').value;
      filterLevelExact = document.getElementById('filterLevelExact').value;

      renderSongList();
    }

    ['filterScoreMin', 'filterScoreMax', 'filterConstMin', 'filterConstMax', 'filterConstExact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', syncFilterInputs);
        el.addEventListener('change', syncFilterInputs);
      }
    });

    ['chkExcludeApPlus', 'chkExcludeAp', 'chkExcludeFc', 'chkExcludeEx', 'chkExcludePlayed', 'filterLevelMin', 'filterLevelMax', 'filterLevelExact'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', syncFilterInputs);
      }
    });

    document.querySelectorAll('.tab-item').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');

        document.getElementById('viewSongs').style.display = tab === 'songs' ? 'block' : 'none';
        document.getElementById('viewMypage').style.display = tab === 'mypage' ? 'block' : 'none';
        document.getElementById('viewSettings').style.display = tab === 'settings' ? 'block' : 'none';

        const fabGroup = document.getElementById('floatingBtnGroup');
        if (fabGroup) fabGroup.style.display = tab === 'songs' ? 'flex' : 'none';
      });
    });

    // MyPage Sub-Navigation & Event Listeners
    document.getElementById('mypageNavStats')?.addEventListener('click', () => switchMypageSubView('stats'));
    document.getElementById('mypageNavB40')?.addEventListener('click', () => switchMypageSubView('b40'));
    document.getElementById('mypageNavApPlus')?.addEventListener('click', () => switchMypageSubView('applus'));

    document.getElementById('jumpCardToB40')?.addEventListener('click', () => switchMypageSubView('b40'));
    document.getElementById('jumpCardToApPlus')?.addEventListener('click', () => switchMypageSubView('applus'));

    document.getElementById('btnBackToStatsFromB40')?.addEventListener('click', () => switchMypageSubView('stats'));
    document.getElementById('btnBackToStatsFromApPlus')?.addEventListener('click', () => switchMypageSubView('stats'));

    document.getElementById('chkShowApPlusDate')?.addEventListener('change', (e) => {
      showApPlusDate = e.target.checked;
      localStorage.setItem(SHOW_DATE_KEY, String(showApPlusDate));
      applyApPlusDateVisibility();
    });

    document.getElementById('btnScopeAll')?.addEventListener('click', () => setStatsScope('ALL'));
    document.getElementById('btnScopeIv')?.addEventListener('click', () => setStatsScope('IV_PLUS'));
    updateStatsScopeUI();

    document.getElementById('btnOpenAddApPlusModal')?.addEventListener('click', () => openAddApPlusModal(-1));
    document.getElementById('btnApPlusModalClose')?.addEventListener('click', closeAddApPlusModal);
    document.getElementById('btnApPlusModalCancel')?.addEventListener('click', closeAddApPlusModal);
    document.getElementById('btnApPlusModalSave')?.addEventListener('click', saveApPlusModal);
    document.getElementById('btnAutoSyncApPlus')?.addEventListener('click', autoSyncApPlusRecords);
    document.getElementById('apPlusModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'apPlusModal') closeAddApPlusModal();
    });

    document.getElementById('apPlusSearchInput')?.addEventListener('input', (e) => {
      apPlusSearchQuery = e.target.value;
      renderApPlusTable();
    });

    document.getElementById('apPlusSortSelect')?.addEventListener('change', (e) => {
      apPlusSort = e.target.value;
      renderApPlusTable();
    });

    document.getElementById('packStatSearch')?.addEventListener('input', () => {
      renderPackStats();
    });

    document.getElementById('btnScrollTop')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('btnOpenFilterModal').addEventListener('click', openFilterModal);
    document.getElementById('btnFilterModalClose').addEventListener('click', closeFilterModal);
    document.getElementById('btnFilterApply').addEventListener('click', closeFilterModal);
    document.getElementById('filterModal').addEventListener('click', (e) => {
      if (e.target.id === 'filterModal') closeFilterModal();
    });

    document.getElementById('btnFilterReset').addEventListener('click', () => {
      collapsedGroupIds.clear();
      searchQuery = '';
      document.getElementById('searchInput').value = '';
      currentSort = 'DEFAULT';
      document.getElementById('sortSelect').value = 'DEFAULT';
      showDeleted = true;
      document.getElementById('chkShowDeleted').checked = true;
      filterDiffs.clear();
      document.querySelectorAll('#diffFilters .filter-btn').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-val') === 'ALL');
      });
      filterConst = 'ALL';
      filterStatus = 'ALL';
      document.querySelectorAll('#constFilters .filter-btn, #statusFilters .filter-btn').forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-val') === 'ALL');
      });

      filterScoreMin = null;
      document.getElementById('filterScoreMin').value = '';
      filterScoreMax = null;
      document.getElementById('filterScoreMax').value = '';
      excludeApPlus = false;
      document.getElementById('chkExcludeApPlus').checked = false;
      excludeAp = false;
      document.getElementById('chkExcludeAp').checked = false;
      excludeFc = false;
      document.getElementById('chkExcludeFc').checked = false;
      excludeEx = false;
      document.getElementById('chkExcludeEx').checked = false;
      excludePlayed = false;
      document.getElementById('chkExcludePlayed').checked = false;

      filterConstMin = null;
      document.getElementById('filterConstMin').value = '';
      filterConstMax = null;
      document.getElementById('filterConstMax').value = '';
      filterConstExact = null;
      document.getElementById('filterConstExact').value = '';

      filterLevelMin = '';
      document.getElementById('filterLevelMin').value = '';
      filterLevelMax = '';
      document.getElementById('filterLevelMax').value = '';
      filterLevelExact = '';
      document.getElementById('filterLevelExact').value = '';

      renderSongList();
    });

    // Escape HTML helper
    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    // Staged Cards and Saved Custom Songs UI Rendering
    function renderStagedCards() {
      const section = document.getElementById('stagedCardsSection');
      const listEl = document.getElementById('stagedCardsList');
      const countEl = document.getElementById('stagedCardsCount');
      if (!section || !listEl) return;

      const currentGroups = getSongGroups(masterSongs);
      const savedGroups = getSongGroups(savedMasterSongs);
      const savedSongIds = new Set(savedGroups.map(g => g.songId));

      const stagedList = currentGroups.filter(g => !savedSongIds.has(g.songId));
      if (stagedList.length === 0) {
        section.style.display = 'none';
        listEl.innerHTML = '';
        if (countEl) countEl.textContent = '0';
        return;
      }

      section.style.display = 'block';
      if (countEl) countEl.textContent = stagedList.length;

      let html = '';
      stagedList.forEach(song => {
        const diffChips = [];
        ['I', 'II', 'III', 'IV', 'IV-α'].forEach(diff => {
          if (song.diffs && song.diffs[diff]) {
            const d = song.diffs[diff];
            const chipClass = diff === 'IV-α' ? 'chip-IV-alpha' : 'chip-' + diff;
            const constStr = isNaN(d.constant) ? '-' : Number(d.constant).toFixed(1);
            diffChips.push('<span class="custom-diff-chip ' + chipClass + '">' + diff + ': ' + constStr + ' (Lv.' + d.level + ')</span>');
          }
        });

        html += '<div class="staged-song-card">' +
          '<div class="custom-card-main">' +
            '<div class="custom-card-title">' + escapeHtml(song.title) + '</div>' +
            '<div class="custom-card-meta">' +
              '<span class="ver-tag">' + escapeHtml(song.version) + '</span>' +
              '<span>' + escapeHtml(song.pack) + '</span>' +
            '</div>' +
            '<div class="custom-diffs-chips">' + diffChips.join('') + '</div>' +
          '</div>' +
          '<button type="button" class="btn-card-action" data-action="remove-staged" data-id="' + song.songId + '">✕ 取消</button>' +
        '</div>';
      });
      listEl.innerHTML = html;

      listEl.querySelectorAll('[data-action="remove-staged"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          masterSongs = masterSongs.filter(s => s[7] !== id);
          checkUnsavedChanges();
          refresh();
        });
      });
    }



    // Level preview updates when constant inputs change
    function updateLevelPreviews() {
      const cI = document.getElementById('newConstI').value;
      const cII = document.getElementById('newConstII').value;
      const cIII = document.getElementById('newConstIII').value;
      const cIV = document.getElementById('newConstIV').value;
      const cIVAlpha = document.getElementById('newConstIVAlpha').value;

      document.getElementById('previewLevelI').textContent = cI ? 'Lv.' + calcLevelFromConstant(cI) : 'Lv.-';
      document.getElementById('previewLevelII').textContent = cII ? 'Lv.' + calcLevelFromConstant(cII) : 'Lv.-';
      document.getElementById('previewLevelIII').textContent = cIII ? 'Lv.' + calcLevelFromConstant(cIII) : 'Lv.-';
      document.getElementById('previewLevelIV').textContent = cIV ? 'Lv.' + calcLevelFromConstant(cIV) : 'Lv.-';
      document.getElementById('previewLevelIVAlpha').textContent = cIVAlpha ? 'Lv.' + calcLevelFromConstant(cIVAlpha) : '任意';
    }

    ['newConstI', 'newConstII', 'newConstIII', 'newConstIV', 'newConstIVAlpha'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateLevelPreviews);
    });

    // Populate Pack, Version, and Song Datalists
    function initFormDatalists() {
      const packDatalist = document.getElementById('packDatalist');
      const verDatalist = document.getElementById('versionDatalist');
      const songDatalist = document.getElementById('songDatalist');

      if (packDatalist) {
        packDatalist.innerHTML = packOrder.map(p => '<option value="' + escapeHtml(p) + '">').join('');
      }
      if (verDatalist) {
        const versions = [...new Set(masterSongs.map(s => s[11]))].filter(Boolean);
        versions.sort(compareVersions);
        verDatalist.innerHTML = versions.map(v => '<option value="' + escapeHtml(v) + '">').join('');
        const verInput = document.getElementById('newSongVersion');
        if (verInput && !verInput.value && versions.length > 0) {
          verInput.value = versions[0];
        }
      }
      if (songDatalist) {
        const ivSongs = masterSongs.filter(s => s[2] === 'IV');
        ivSongs.sort((a, b) => a[12] - b[12]);
        const seenTitles = new Set();
        const titles = [];
        ivSongs.forEach(s => {
          if (!seenTitles.has(s[1])) {
            seenTitles.add(s[1]);
            titles.push(s[1]);
          }
        });
        masterSongs.forEach(s => {
          if (!seenTitles.has(s[1])) {
            seenTitles.add(s[1]);
            titles.push(s[1]);
          }
        });
        songDatalist.innerHTML = titles.map(t => '<option value="' + escapeHtml(t) + '">').join('');
      }
    }

    // Render Song Pack Order Manager List
    function renderPackOrderList() {
      const listEl = document.getElementById('packOrderList');
      const countEl = document.getElementById('packListCount');
      if (!listEl) return;
      if (countEl) countEl.textContent = packOrder.length;

      let html = '';
      packOrder.forEach((packName, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === packOrder.length - 1;

        html += '<div class="pack-order-item" draggable="true" data-idx="' + idx + '">' +
          '<div class="pack-item-left">' +
            '<span class="pack-drag-handle" data-drag-handle="true" title="ドラッグして並び替え">☰</span>' +
            '<span class="pack-order-num">' + (idx + 1) + '.</span>' +
            '<span class="pack-order-name" title="' + escapeHtml(packName) + '">' + escapeHtml(packName) + '</span>' +
          '</div>' +
          '<div class="pack-item-actions">' +
            '<button type="button" class="btn-pack-order" data-action="up" data-idx="' + idx + '"' + (isFirst ? ' disabled' : '') + ' title="1つ上に移動">▲</button>' +
            '<button type="button" class="btn-pack-order" data-action="down" data-idx="' + idx + '"' + (isLast ? ' disabled' : '') + ' title="1つ下に移動">▼</button>' +
            '<button type="button" class="btn-pack-delete" data-action="delete" data-idx="' + idx + '" title="このパックを削除">🗑️</button>' +
          '</div>' +
        '</div>';
      });
      listEl.innerHTML = html;

      // Button handlers (Up / Down / Delete)
      listEl.querySelectorAll('.btn-pack-order').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.getAttribute('data-action');
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          if (action === 'up' && idx > 0) {
            const temp = packOrder[idx];
            packOrder[idx] = packOrder[idx - 1];
            packOrder[idx - 1] = temp;
          } else if (action === 'down' && idx < packOrder.length - 1) {
            const temp = packOrder[idx];
            packOrder[idx] = packOrder[idx + 1];
            packOrder[idx + 1] = temp;
          }
          renderPackOrderList();
          initFormDatalists();
          checkUnsavedChanges();
          if (currentSort === 'PACK') renderSongList();
        });
      });

      listEl.querySelectorAll('.btn-pack-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          packOrder.splice(idx, 1);
          renderPackOrderList();
          initFormDatalists();
          checkUnsavedChanges();
          if (currentSort === 'PACK') renderSongList();
        });
      });

      // HTML5 Drag & Drop (Desktop)
      let draggedIdx = null;
      const items = listEl.querySelectorAll('.pack-order-item');
      items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
          draggedIdx = parseInt(item.getAttribute('data-idx'), 10);
          item.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          items.forEach(i => i.classList.remove('drag-over'));
          item.classList.add('drag-over');
        });

        item.addEventListener('dragleave', () => {
          item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
          e.preventDefault();
          item.classList.remove('drag-over');
          const targetIdx = parseInt(item.getAttribute('data-idx'), 10);
          if (draggedIdx !== null && draggedIdx !== targetIdx) {
            const [moved] = packOrder.splice(draggedIdx, 1);
            packOrder.splice(targetIdx, 0, moved);
            renderPackOrderList();
            initFormDatalists();
            checkUnsavedChanges();
          }
        });

        item.addEventListener('dragend', () => {
          items.forEach(i => {
            i.classList.remove('dragging');
            i.classList.remove('drag-over');
          });
          draggedIdx = null;
        });

        // Touch Drag & Drop (Mobile: iPhone, iPad, Android)
        const handle = item.querySelector('.pack-drag-handle');
        if (handle) {
          handle.addEventListener('touchstart', (e) => {
            draggedIdx = parseInt(item.getAttribute('data-idx'), 10);
            item.classList.add('dragging');
          }, { passive: true });

          handle.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const elem = document.elementFromPoint(touch.clientX, touch.clientY);
            const targetItem = elem ? elem.closest('.pack-order-item') : null;
            if (targetItem) {
              items.forEach(i => i.classList.remove('drag-over'));
              targetItem.classList.add('drag-over');
            }
          }, { passive: false });

          handle.addEventListener('touchend', (e) => {
            const touch = e.changedTouches[0];
            const elem = document.elementFromPoint(touch.clientX, touch.clientY);
            const targetItem = elem ? elem.closest('.pack-order-item') : null;
            items.forEach(i => {
              i.classList.remove('dragging');
              i.classList.remove('drag-over');
            });
            if (targetItem && draggedIdx !== null) {
              const targetIdx = parseInt(targetItem.getAttribute('data-idx'), 10);
              if (draggedIdx !== targetIdx) {
                const [moved] = packOrder.splice(draggedIdx, 1);
                packOrder.splice(targetIdx, 0, moved);
                renderPackOrderList();
                initFormDatalists();
                checkUnsavedChanges();
                if (currentSort === 'PACK') renderSongList();
              }
            }
            draggedIdx = null;
          }, { passive: true });
        }
      });
    }

    // Add Song Pack Button
    document.getElementById('btnAddPackBtn').addEventListener('click', () => {
      const input = document.getElementById('newPackNameInput');
      const name = (input.value || '').trim();
      if (!name) {
        alert('ソングパック名を入力してください');
        input.focus();
        return;
      }
      if (packOrder.includes(name)) {
        alert('「' + name + '」は既にリストに存在します');
        input.focus();
        return;
      }
      packOrder.push(name);
      input.value = '';
      renderPackOrderList();
      initFormDatalists();
      checkUnsavedChanges();
      if (currentSort === 'PACK') renderSongList();

      const listEl = document.getElementById('packOrderList');
      if (listEl) {
        listEl.scrollTop = listEl.scrollHeight;
      }
    });

    // Reset Song Pack Order Button
    document.getElementById('btnResetPackOrder').addEventListener('click', () => {
      if (confirm('ソングパックの並び順をゲーム公式の初期順序に戻しますか？')) {
        packOrder = [...GAME_PACK_ORDER];
        const existingPacks = [...new Set(masterSongs.map(s => s[6]))].filter(Boolean);
        existingPacks.forEach(p => {
          if (!packOrder.includes(p)) packOrder.push(p);
        });
        renderPackOrderList();
        initFormDatalists();
        checkUnsavedChanges();
        if (currentSort === 'PACK') renderSongList();
      }
    });

    // Auto-fill insertAfterSong when newSongPack changes
    const newSongPackEl = document.getElementById('newSongPack');
    if (newSongPackEl) {
      const updateInsertAfterFromPack = () => {
        const packName = (newSongPackEl.value || '').trim();
        const lastSong = getLastSongOfPack(packName);
        const insertAfterEl = document.getElementById('insertAfterSong');
        if (insertAfterEl) {
          insertAfterEl.value = lastSong;
        }
      };
      newSongPackEl.addEventListener('input', updateInsertAfterFromPack);
      newSongPackEl.addEventListener('change', updateInsertAfterFromPack);
    }

    // Add Song Card Event
    document.getElementById('btnAddSongCard').addEventListener('click', () => {
      const title = document.getElementById('newSongTitle').value.trim();
      const pack = document.getElementById('newSongPack').value.trim() || '基本曲';
      const version = document.getElementById('newSongVersion').value.trim() || 'v5.6.0';
      const insertAfterInput = (document.getElementById('insertAfterSong').value || '').trim();
      const insertAfterTitle = insertAfterInput || getLastSongOfPack(pack);

      const constI = parseFloat(document.getElementById('newConstI').value);
      const constII = parseFloat(document.getElementById('newConstII').value);
      const constIII = parseFloat(document.getElementById('newConstIII').value);
      const constIV = parseFloat(document.getElementById('newConstIV').value);
      const constIVAlphaVal = document.getElementById('newConstIVAlpha').value.trim();
      const constIVAlpha = constIVAlphaVal !== '' ? parseFloat(constIVAlphaVal) : null;

      if (!title) {
        alert('曲名を入力してください');
        document.getElementById('newSongTitle').focus();
        return;
      }

      if (isNaN(constI) || isNaN(constII) || isNaN(constIII) || isNaN(constIV)) {
        alert('難易度 I, II, III, IV の定数をすべて入力してください');
        return;
      }

      if (constIVAlphaVal !== '' && isNaN(constIVAlpha)) {
        alert('IV-α の定数を正しく入力してください');
        return;
      }

      const diffs = {
        'I': { constant: constI, level: calcLevelFromConstant(constI) },
        'II': { constant: constII, level: calcLevelFromConstant(constII) },
        'III': { constant: constIII, level: calcLevelFromConstant(constIII) },
        'IV': { constant: constIV, level: calcLevelFromConstant(constIV) }
      };
      if (constIVAlpha !== null && !isNaN(constIVAlpha)) {
        diffs['IV-α'] = { constant: constIVAlpha, level: calcLevelFromConstant(constIVAlpha) };
      }

      const songId = 'song_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const newSong = {
        songId,
        title,
        pack,
        version,
        diffs
      };

      const tuples = songObjToTuples(newSong, insertAfterTitle);
      masterSongs.push(...tuples);

      // Clear song title and constant inputs (keep pack and version for fast batch entry)
      document.getElementById('newSongTitle').value = '';
      document.getElementById('newConstI').value = '';
      document.getElementById('newConstII').value = '';
      document.getElementById('newConstIII').value = '';
      document.getElementById('newConstIV').value = '';
      document.getElementById('newConstIVAlpha').value = '';
      const insertAfterEl = document.getElementById('insertAfterSong');
      if (insertAfterEl) insertAfterEl.value = title;
      updateLevelPreviews();

      initFormDatalists();
      renderEditSongSearchResult();
      checkUnsavedChanges();
      refresh();
    });

    // Master Song Data Editing (Constant Revision, Packs, Titles)
    function renderEditSongSearchResult() {
      const inputEl = document.getElementById('editSongSearchInput');
      const resultEl = document.getElementById('editSongSearchResult');
      if (!resultEl) return;
      const query = (inputEl ? inputEl.value : '').trim().toLowerCase();

      if (!query) {
        resultEl.innerHTML = '<div style="font-size: 11px; color: var(--color-text-muted); text-align: center; padding: 12px;">曲名を入力して検索してください</div>';
        return;
      }

      const groups = getSongGroups(masterSongs);
      const matched = groups.filter(g =>
        g.title.toLowerCase().includes(query) ||
        (g.pack && g.pack.toLowerCase().includes(query))
      );

      if (matched.length === 0) {
        resultEl.innerHTML = '<div style="font-size: 11px; color: var(--color-text-muted); text-align: center; padding: 12px;">該当する楽曲が見つかりませんでした</div>';
        return;
      }

      const displayList = matched.slice(0, 30);
      let html = '';
      displayList.forEach(song => {
        const diffChips = [];
        ['I', 'II', 'III', 'IV', 'IV-α'].forEach(diff => {
          if (song.diffs && song.diffs[diff]) {
            const d = song.diffs[diff];
            const chipClass = diff === 'IV-α' ? 'chip-IV-alpha' : 'chip-' + diff;
            const constStr = isNaN(d.constant) ? '-' : Number(d.constant).toFixed(1);
            diffChips.push('<span class="custom-diff-chip ' + chipClass + '">' + diff + ': ' + constStr + ' (Lv.' + d.level + ')</span>');
          }
        });

        const endOfSaleBadge = song.endOfSale === 1 ? ' <span style="color:#dc2626; font-size:11px; font-weight:800;">(販売終了)</span>' : '';

        html += '<div class="custom-card-item" style="display:flex; justify-content:space-between; align-items:center; background:var(--color-bg-subtle, #f8fafc); border:1px solid var(--color-border); border-radius:8px; padding:8px 12px;">' +
          '<div style="flex:1; min-width:0; margin-right:10px;">' +
            '<div style="font-weight:700; font-size:13px; color:var(--color-text); margin-bottom:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + escapeHtml(song.title) + endOfSaleBadge + '</div>' +
            '<div style="font-size:11px; color:var(--color-text-muted); margin-bottom:4px;">' +
              '<span class="ver-tag" style="background:#e2e8f0; color:#475569; border-radius:4px; padding:1px 5px; margin-right:4px;">' + escapeHtml(song.version || 'v5.6.0') + '</span>' +
              '<span>' + escapeHtml(song.pack || '基本曲') + '</span>' +
            '</div>' +
            '<div style="display:flex; flex-wrap:wrap; gap:4px;">' + diffChips.join('') + '</div>' +
          '</div>' +
          '<button type="button" class="btn-edit-master-song panel-btn" data-song-id="' + escapeHtml(song.songId) + '" style="color:var(--color-primary-dark); font-weight:800; padding:6px 14px; cursor:pointer; white-space:nowrap;">✏️ 編集</button>' +
        '</div>';
      });

      if (matched.length > 30) {
        html += '<div style="font-size: 11px; color: var(--color-text-muted); text-align: center; padding: 6px;">他 ' + (matched.length - 30) + ' 件（さらに絞り込んでください）</div>';
      }

      resultEl.innerHTML = html;

      resultEl.querySelectorAll('.btn-edit-master-song').forEach(btn => {
        btn.addEventListener('click', () => {
          const sid = btn.getAttribute('data-song-id');
          openEditSongModal(sid);
        });
      });
    }

    function updateEditModalLevelPreviews() {
      const cI = document.getElementById('editConstI').value;
      const cII = document.getElementById('editConstII').value;
      const cIII = document.getElementById('editConstIII').value;
      const cIV = document.getElementById('editConstIV').value;
      const cIVAlpha = document.getElementById('editConstIVAlpha').value;

      document.getElementById('editPreviewLevelI').textContent = cI ? 'Lv.' + calcLevelFromConstant(cI) : 'Lv.-';
      document.getElementById('editPreviewLevelII').textContent = cII ? 'Lv.' + calcLevelFromConstant(cII) : 'Lv.-';
      document.getElementById('editPreviewLevelIII').textContent = cIII ? 'Lv.' + calcLevelFromConstant(cIII) : 'Lv.-';
      document.getElementById('editPreviewLevelIV').textContent = cIV ? 'Lv.' + calcLevelFromConstant(cIV) : 'Lv.-';
      document.getElementById('editPreviewLevelIVAlpha').textContent = cIVAlpha ? 'Lv.' + calcLevelFromConstant(cIVAlpha) : 'なし';
    }

    ['editConstI', 'editConstII', 'editConstIII', 'editConstIV', 'editConstIVAlpha'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateEditModalLevelPreviews);
    });

    let currentEditSongPrevTitle = '';

    function openEditSongModal(songId) {
      const tuples = masterSongs.filter(s => s[7] === songId);
      if (tuples.length === 0) return;

      const first = tuples[0];
      const diffMap = {};
      tuples.forEach(t => {
        diffMap[t[2]] = t[4];
      });

      document.getElementById('editTargetSongId').value = songId;
      document.getElementById('editSongTitleInput').value = first[1];
      document.getElementById('editSongPackInput').value = first[6] || '';
      document.getElementById('editSongVersionInput').value = first[11] || '';

      // Determine current previous song in default order (based on IV chart initId)
      const ivTuple = tuples.find(s => s[2] === 'IV');
      currentEditSongPrevTitle = '';
      if (ivTuple) {
        const curInitId = ivTuple[12];
        const ivCharts = masterSongs.filter(s => s[2] === 'IV' && s[7] !== songId && s[12] < curInitId);
        ivCharts.sort((a, b) => b[12] - a[12]);
        if (ivCharts.length > 0) {
          currentEditSongPrevTitle = ivCharts[0][1];
        }
      }
      const editInsertAfterEl = document.getElementById('editInsertAfterSong');
      if (editInsertAfterEl) {
        editInsertAfterEl.value = currentEditSongPrevTitle;
      }

      // End of sale checkbox
      const endOfSaleChk = document.getElementById('editSongEndOfSale');
      if (endOfSaleChk) {
        endOfSaleChk.checked = (first[8] === 1);
      }

      document.getElementById('editConstI').value = diffMap['I'] !== undefined ? diffMap['I'] : '';
      document.getElementById('editConstII').value = diffMap['II'] !== undefined ? diffMap['II'] : '';
      document.getElementById('editConstIII').value = diffMap['III'] !== undefined ? diffMap['III'] : '';
      document.getElementById('editConstIV').value = diffMap['IV'] !== undefined ? diffMap['IV'] : '';
      document.getElementById('editConstIVAlpha').value = diffMap['IV-α'] !== undefined ? diffMap['IV-α'] : '';

      updateEditModalLevelPreviews();

      const modal = document.getElementById('editSongModal');
      if (modal) modal.classList.add('open');
    }

    function closeEditSongModal() {
      const modal = document.getElementById('editSongModal');
      if (modal) modal.classList.remove('open');
    }

    // ==========================================================
    // Official Song Updates & Staging Diff Engine
    // ==========================================================
    let officialUpdatesState = {
      detectedNew: [],
      detectedMod: []
    };

    function openOfficialUpdateModal() {
      const modal = document.getElementById('officialUpdateModal');
      if (!modal) return;
      modal.classList.add('open');

      const elLoading = document.getElementById('officialUpdateLoading');
      const elSummary = document.getElementById('officialUpdateSummary');
      const elError = document.getElementById('officialUpdateError');
      const elEmpty = document.getElementById('officialUpdateEmpty');
      const elContent = document.getElementById('officialUpdateDiffContent');
      const btnApply = document.getElementById('btnOfficialUpdateApply');

      if (elLoading) elLoading.style.display = 'block';
      if (elSummary) elSummary.style.display = 'none';
      if (elError) elError.style.display = 'none';
      if (elEmpty) elEmpty.style.display = 'none';
      if (elContent) elContent.style.display = 'none';
      if (btnApply) {
        btnApply.disabled = true;
        btnApply.textContent = '✓ 反映する (計 0曲)';
      }

      fetchOfficialSongUpdates();
    }

    function closeOfficialUpdateModal() {
      const modal = document.getElementById('officialUpdateModal');
      if (modal) modal.classList.remove('open');
    }

    async function fetchOfficialSongUpdates() {
      const endpoint = getActiveGasEndpoint();
      const elLoading = document.getElementById('officialUpdateLoading');
      const elSummary = document.getElementById('officialUpdateSummary');
      const elError = document.getElementById('officialUpdateError');
      const elEmpty = document.getElementById('officialUpdateEmpty');

      try {
        let officialSongs = [];
        let officialPackOrder = [];

        // 1. Try fetching from Central Official DB (no url parameter)
        const centralRes = await fetch(endpoint + '?t=' + Date.now(), { method: 'GET' });
        const centralJson = await centralRes.json();
        if (centralJson.status === 'success' && centralJson.data) {
          if (Array.isArray(centralJson.data.songs) && centralJson.data.songs.length > 0) {
            officialSongs = centralJson.data.songs;
          }
          if (centralJson.data.config && Array.isArray(centralJson.data.config.packOrder) && centralJson.data.config.packOrder.length > 0) {
            officialPackOrder = centralJson.data.config.packOrder;
          }
        }

        if (officialSongs.length === 0 && userSheetUrl) {
          // Fallback to userSheetUrl if central sheet Songs is empty
          const userRes = await fetch(endpoint + '?url=' + encodeURIComponent(userSheetUrl) + '&t=' + Date.now(), { method: 'GET' });
          const userJson = await userRes.json();
          if (userJson.status === 'success' && userJson.data) {
            if (Array.isArray(userJson.data.songs) && userJson.data.songs.length > 0) {
              officialSongs = userJson.data.songs;
            }
            if (officialPackOrder.length === 0 && userJson.data.config && Array.isArray(userJson.data.config.packOrder)) {
              officialPackOrder = userJson.data.config.packOrder;
            }
          }
        }

        if (elLoading) elLoading.style.display = 'none';

        if (!Array.isArray(officialSongs) || officialSongs.length === 0) {
          if (elError) {
            elError.style.display = 'block';
            document.getElementById('officialUpdateErrorMsg').textContent = '親スプレッドシート（または設定済みスプシ）の楽曲データが0件です。\\n管理者は設定画面から「スプシへ全データを保存」を行って楽曲データを初期登録してください。';
          }
          return;
        }

        // 2. Run Diff Engine
        diffOfficialSongs(officialSongs, officialPackOrder);

      } catch (err) {
        console.error('fetchOfficialSongUpdates error:', err);
        if (elLoading) elLoading.style.display = 'none';
        if (elError) {
          elError.style.display = 'block';
          document.getElementById('officialUpdateErrorMsg').textContent = '通信エラーが発生しました: ' + (err.message || '');
        }
      }
    }

    function diffOfficialSongs(officialSongs, officialPackOrder = []) {
      const elSummary = document.getElementById('officialUpdateSummary');
      const elEmpty = document.getElementById('officialUpdateEmpty');
      const elContent = document.getElementById('officialUpdateDiffContent');
      const newListEl = document.getElementById('officialUpdateNewList');
      const modListEl = document.getElementById('officialUpdateModList');
      const newSec = document.getElementById('officialUpdateNewSection');
      const modSec = document.getElementById('officialUpdateModSection');
      const summaryText = document.getElementById('officialUpdateSummaryText');

      // Map local songs by normalized title
      const localByTitle = new Map();
      masterSongs.forEach(t => {
        const k = String(t[1] || '').trim().toLowerCase();
        if (!localByTitle.has(k)) localByTitle.set(k, []);
        localByTitle.get(k).push(t);
      });

      const detectedNew = [];
      const detectedMod = [];

      officialSongs.forEach(song => {
        const titleKey = String(song.title || '').trim().toLowerCase();
        const existingTuples = localByTitle.get(titleKey);

        if (!existingTuples || existingTuples.length === 0) {
          // New Song
          detectedNew.push(song);
        } else {
          // Existing Song: Check for differences
          const firstTuple = existingTuples[0];
          const curPack = String(firstTuple[6] || '基本曲').trim();
          const curVer = String(firstTuple[11] || 'v5.6.0').trim();
          const offPack = String(song.pack || '基本曲').trim();
          const offVer = String(song.version || 'v5.6.0').trim();

          const changes = [];

          if (curPack !== offPack) {
            changes.push({
              field: 'pack',
              label: 'パック',
              oldVal: curPack,
              newVal: offPack
            });
          }

          if (curVer !== offVer) {
            changes.push({
              field: 'version',
              label: 'Ver',
              oldVal: curVer,
              newVal: offVer
            });
          }

          // Check Difficulties & Constants
          const existingDiffMap = new Map();
          existingTuples.forEach(t => existingDiffMap.set(t[2], t));

          const offDiffs = song.diffs || {};
          ['I', 'II', 'III', 'IV', 'IV-α'].forEach(diff => {
            const offD = offDiffs[diff];
            const exT = existingDiffMap.get(diff);

            if (offD && !isNaN(offD.constant) && Number(offD.constant) > 0) {
              const offConst = Number(offD.constant);
              const offLv = String(offD.level || calcLevelFromConstant(offConst)).trim();

              if (!exT) {
                changes.push({
                  field: 'diff_add',
                  diff: diff,
                  label: diff + ' 追加',
                  oldVal: '未収録',
                  newVal: 'Lv.' + offLv + ' (' + offConst + ')',
                  newConst: offConst,
                  newLevel: offLv
                });
              } else {
                const exConst = Number(exT[4]) || 0;
                const exLv = String(exT[3] || '').trim();

                const constDiff = Math.abs(exConst - offConst) > 0.001;
                const lvDiff = offD.level && exLv !== offLv;

                if (constDiff || lvDiff) {
                  changes.push({
                    field: 'const_revision',
                    diff: diff,
                    label: diff + ' 定数',
                    oldVal: exConst + (exLv ? ' (Lv.' + exLv + ')' : ''),
                    newVal: offConst + (offLv ? ' (Lv.' + offLv + ')' : ''),
                    newConst: offConst,
                    newLevel: offLv
                  });
                }
              }
            }
          });

          if (changes.length > 0) {
            detectedMod.push({
              song: song,
              existingTuples: existingTuples,
              changes: changes
            });
          }
        }
      });

      officialUpdatesState = { detectedNew, detectedMod, officialSongs, officialPackOrder };

      if (detectedNew.length === 0 && detectedMod.length === 0) {
        if (elEmpty) elEmpty.style.display = 'block';
        if (elContent) elContent.style.display = 'none';
        if (elSummary) elSummary.style.display = 'none';
        return;
      }

      if (elEmpty) elEmpty.style.display = 'none';
      if (elContent) elContent.style.display = 'block';
      if (elSummary) elSummary.style.display = 'flex';

      // Detect newly introduced packs
      const existingPacks = new Set(packOrder);
      const newPacksFound = [];
      if (Array.isArray(officialPackOrder)) {
        officialPackOrder.forEach(p => {
          if (p && !existingPacks.has(p) && !newPacksFound.includes(p)) newPacksFound.push(p);
        });
      }
      detectedNew.forEach(s => {
        if (s.pack && !existingPacks.has(s.pack) && !newPacksFound.includes(s.pack)) newPacksFound.push(s.pack);
      });

      // Summary text
      if (summaryText) {
        let txt = '最新アプデ情報: （新規 ' + detectedNew.length + '曲 / 更新 ' + detectedMod.length + '曲';
        if (newPacksFound.length > 0) {
          txt += ' / 新パック: ' + newPacksFound.join(', ');
        }
        txt += '）';
        summaryText.textContent = txt;
      }

      // 1. Render New Songs
      if (newSec) newSec.style.display = detectedNew.length > 0 ? 'block' : 'none';
      const newCountEl = document.getElementById('officialUpdateNewCount');
      if (newCountEl) newCountEl.textContent = detectedNew.length;

      if (newListEl) {
        newListEl.innerHTML = '';
        detectedNew.forEach((s, idx) => {
          const card = document.createElement('div');
          card.className = 'update-card update-card-new';

          const d = s.diffs || {};
          let diffPillsHtml = '';
          ['I', 'II', 'III', 'IV', 'IV-α'].forEach(k => {
            if (d[k] && !isNaN(d[k].constant)) {
              diffPillsHtml += '<span class="update-diff-pill">' + k + ': Lv.' + (d[k].level || calcLevelFromConstant(d[k].constant)) + ' (' + d[k].constant + ')</span>';
            }
          });

          card.innerHTML = 
            '<div class="update-card-header">' +
              '<label class="update-card-title-wrap">' +
                '<input type="checkbox" class="chk-official-update-item" data-type="new" data-index="' + idx + '" checked>' +
                '<span>' + escapeHtml(s.title) + '</span>' +
              '</label>' +
              '<span class="update-badge update-badge-new">新規</span>' +
            '</div>' +
            '<div class="update-card-meta">' +
              '<span>パック: <b>' + escapeHtml(s.pack || '基本曲') + '</b></span>' +
              '<span>Ver: <b>' + escapeHtml(s.version || 'v5.6.0') + '</b></span>' +
            '</div>' +
            '<div class="update-diffs-pills">' + diffPillsHtml + '</div>';
          newListEl.appendChild(card);
        });
      }

      // 2. Render Modified Songs
      if (modSec) modSec.style.display = detectedMod.length > 0 ? 'block' : 'none';
      const modCountEl = document.getElementById('officialUpdateModCount');
      if (modCountEl) modCountEl.textContent = detectedMod.length;

      if (modListEl) {
        modListEl.innerHTML = '';
        detectedMod.forEach((m, idx) => {
          const card = document.createElement('div');
          card.className = 'update-card update-card-mod';

          let changesHtml = '';
          m.changes.forEach(c => {
            changesHtml += 
              '<div class="update-change-row">' +
                '<span class="update-change-label">' + escapeHtml(c.label) + '</span>' +
                '<span class="update-change-val-old">' + escapeHtml(String(c.oldVal)) + '</span>' +
                '<span class="update-change-arrow">→</span>' +
                '<span class="update-change-val-new">' + escapeHtml(String(c.newVal)) + '</span>' +
              '</div>';
          });

          card.innerHTML = 
            '<div class="update-card-header">' +
              '<label class="update-card-title-wrap">' +
                '<input type="checkbox" class="chk-official-update-item" data-type="mod" data-index="' + idx + '" checked>' +
                '<span>' + escapeHtml(m.song.title) + '</span>' +
              '</label>' +
              '<span class="update-badge update-badge-mod">更新</span>' +
            '</div>' +
            '<div class="update-changes-list">' +
              changesHtml +
            '</div>' +
            '<div class="update-card-score-notice">' +
              '<span>✓ 入力済みのスコア・クリアランプ・理論値記録はそのまま維持されます</span>' +
            '</div>';
          modListEl.appendChild(card);
        });
      }

      // Attach checkbox listeners to recalculate total
      document.querySelectorAll('.chk-official-update-item').forEach(chk => {
        chk.addEventListener('change', updateOfficialUpdateApplyButton);
      });

      updateOfficialUpdateApplyButton();
    }

    function updateOfficialUpdateApplyButton() {
      const chks = document.querySelectorAll('.chk-official-update-item:checked');
      const count = chks.length;
      const btn = document.getElementById('btnOfficialUpdateApply');
      if (btn) {
        btn.textContent = '✓ 反映する (計 ' + count + '曲)';
        btn.disabled = count === 0;
      }
    }

    function mergeOfficialPackOrder(currentPackOrder, officialPackOrder, newPacks = []) {
      const merged = [...currentPackOrder];
      if (!Array.isArray(officialPackOrder) || officialPackOrder.length === 0) {
        newPacks.forEach(p => {
          if (p && !merged.includes(p)) merged.push(p);
        });
        return merged;
      }

      const packsToAdd = [];
      officialPackOrder.forEach(p => {
        if (p && !merged.includes(p) && !packsToAdd.includes(p)) {
          packsToAdd.push(p);
        }
      });
      newPacks.forEach(p => {
        if (p && !merged.includes(p) && !packsToAdd.includes(p)) {
          packsToAdd.push(p);
        }
      });

      packsToAdd.forEach(p => {
        const offIdx = officialPackOrder.indexOf(p);
        if (offIdx === -1) {
          merged.push(p);
          return;
        }

        let insertIdx = -1;
        // Search backwards in officialPackOrder for an existing predecessor in merged
        for (let i = offIdx - 1; i >= 0; i--) {
          const prev = officialPackOrder[i];
          const pos = merged.indexOf(prev);
          if (pos !== -1) {
            insertIdx = pos + 1;
            break;
          }
        }

        // If no predecessor found in merged, search forwards for an existing successor
        if (insertIdx === -1) {
          for (let i = offIdx + 1; i < officialPackOrder.length; i++) {
            const next = officialPackOrder[i];
            const pos = merged.indexOf(next);
            if (pos !== -1) {
              insertIdx = pos;
              break;
            }
          }
        }

        if (insertIdx !== -1) {
          merged.splice(insertIdx, 0, p);
        } else {
          merged.push(p);
        }
      });

      return merged;
    }

    function applyOfficialUpdates() {
      const chks = document.querySelectorAll('.chk-official-update-item:checked');
      if (chks.length === 0) return;

      const { detectedNew, detectedMod, officialSongs, officialPackOrder } = officialUpdatesState;
      let appliedCount = 0;
      const newPacks = [];

      // 1. Process Checked New Songs
      let maxInitId = masterSongs.length;
      chks.forEach(chk => {
        const type = chk.getAttribute('data-type');
        const idx = parseInt(chk.getAttribute('data-index'), 10);

        if (type === 'new' && detectedNew[idx]) {
          const song = detectedNew[idx];
          const songInitId = (song.initId !== undefined && !isNaN(song.initId))
            ? Number(song.initId)
            : (++maxInitId);

          const diffKeys = ['I', 'II', 'III', 'IV'];
          if (song.diffs && song.diffs['IV-α']) diffKeys.push('IV-α');

          diffKeys.forEach(diff => {
            const dObj = song.diffs && song.diffs[diff];
            if (!dObj || isNaN(dObj.constant)) return;
            masterSongs.push([
              song.songId + '_' + diff,
              song.title,
              diff,
              dObj.level || calcLevelFromConstant(dObj.constant),
              dObj.constant,
              0,
              song.pack || '基本曲',
              song.songId,
              0,
              0,
              '',
              song.version || 'v5.6.0',
              songInitId
            ]);
          });

          if (song.pack && !newPacks.includes(song.pack)) {
            newPacks.push(song.pack);
          }
          appliedCount++;
        }
      });

      // 2. Process Checked Modified Songs
      chks.forEach(chk => {
        const type = chk.getAttribute('data-type');
        const idx = parseInt(chk.getAttribute('data-index'), 10);

        if (type === 'mod' && detectedMod[idx]) {
          const m = detectedMod[idx];
          const officialSong = m.song;
          const existingTuples = m.existingTuples;

          // Update common metadata
          existingTuples.forEach(s => {
            s[1] = officialSong.title;
            s[6] = officialSong.pack || s[6];
            s[11] = officialSong.version || s[11];

            // Update constants / levels if revised
            if (officialSong.diffs && officialSong.diffs[s[2]]) {
              const d = officialSong.diffs[s[2]];
              if (!isNaN(d.constant) && Number(d.constant) > 0) {
                s[4] = Number(d.constant);
                s[3] = d.level || calcLevelFromConstant(s[4]);
              }
            }
          });

          // Check for newly added difficulty (e.g. IV-alpha added)
          ['I', 'II', 'III', 'IV', 'IV-α'].forEach(diff => {
            const d = officialSong.diffs && officialSong.diffs[diff];
            const exists = existingTuples.some(t => t[2] === diff);
            if (d && !isNaN(d.constant) && Number(d.constant) > 0 && !exists) {
              const baseTuple = existingTuples[0];
              const newTuple = [
                baseTuple[7] + '_' + diff,
                officialSong.title,
                diff,
                d.level || calcLevelFromConstant(d.constant),
                Number(d.constant),
                0,
                officialSong.pack || baseTuple[6],
                baseTuple[7],
                baseTuple[8] || 0,
                0,
                '',
                officialSong.version || baseTuple[11],
                (baseTuple[12] || 0) + 1
              ];
              masterSongs.push(newTuple);
            }
          });

          if (officialSong.pack && !newPacks.includes(officialSong.pack)) {
            newPacks.push(officialSong.pack);
          }
          appliedCount++;
        }
      });

      // Synchronize packOrder relative position using officialPackOrder
      packOrder = mergeOfficialPackOrder(packOrder, officialPackOrder, newPacks);
      if (Array.isArray(officialPackOrder) && officialPackOrder.length > 0) {
        GAME_PACK_ORDER = [...officialPackOrder];
      }

      // Synchronize default order (songInitId) with official spreadsheet
      if (Array.isArray(officialSongs) && officialSongs.length > 0) {
        const officialInitIdMap = new Map();
        officialSongs.forEach((song, idx) => {
          const normTitle = String(song.title || '').trim().toLowerCase();
          const initId = (song.initId !== undefined && !isNaN(song.initId)) ? Number(song.initId) : (idx + 1);
          officialInitIdMap.set(normTitle, initId);
        });

        masterSongs.forEach(s => {
          const normTitle = String(s[1] || '').trim().toLowerCase();
          if (officialInitIdMap.has(normTitle)) {
            s[12] = officialInitIdMap.get(normTitle);
          }
        });
      }

      masterSongs.sort((a, b) => (a[12] || 0) - (b[12] || 0));
      closeOfficialUpdateModal();
      initFormDatalists();
      renderPackOrderList();
      renderEditSongSearchResult();
      checkUnsavedChanges();
      refresh();

      alert('✨ 計 ' + appliedCount + '曲 のアプデ情報を一時反映しました！\\n画面下部の「💾 保存する」を押して確定してください。');
    }

    const btnEditClose = document.getElementById('btnEditSongModalClose');
    if (btnEditClose) btnEditClose.addEventListener('click', closeEditSongModal);
    const btnEditCancel = document.getElementById('btnEditSongModalCancel');
    if (btnEditCancel) btnEditCancel.addEventListener('click', closeEditSongModal);
    const editModalOverlay = document.getElementById('editSongModal');
    if (editModalOverlay) {
      editModalOverlay.addEventListener('click', (e) => {
        if (e.target.id === 'editSongModal') closeEditSongModal();
      });
    }

    const editSongSearchInput = document.getElementById('editSongSearchInput');
    if (editSongSearchInput) {
      editSongSearchInput.addEventListener('input', renderEditSongSearchResult);
    }

    const btnEditDelete = document.getElementById('btnEditSongModalDelete');
    if (btnEditDelete) {
      btnEditDelete.addEventListener('click', () => {
        const songId = document.getElementById('editTargetSongId').value;
        const songTitle = document.getElementById('editSongTitleInput').value.trim();
        if (!confirm('楽曲「' + songTitle + '」をマスターから削除しますか？\\n※下部の「💾 保存する」で確定するまで完全には削除されません。')) {
          return;
        }

        masterSongs = masterSongs.filter(s => s[7] !== songId);
        closeEditSongModal();
        initFormDatalists();
        renderEditSongSearchResult();
        checkUnsavedChanges();
        refresh();
      });
    }

    const btnEditSave = document.getElementById('btnEditSongModalSave');
    if (btnEditSave) {
      btnEditSave.addEventListener('click', () => {
        const songId = document.getElementById('editTargetSongId').value;
        const newTitle = document.getElementById('editSongTitleInput').value.trim();
        const newPack = document.getElementById('editSongPackInput').value.trim() || '基本曲';
        const newVersion = document.getElementById('editSongVersionInput').value.trim() || 'v5.6.0';

        const constI = parseFloat(document.getElementById('editConstI').value);
        const constII = parseFloat(document.getElementById('editConstII').value);
        const constIII = parseFloat(document.getElementById('editConstIII').value);
        const constIV = parseFloat(document.getElementById('editConstIV').value);
        const constIVAlphaVal = document.getElementById('editConstIVAlpha').value.trim();
        const constIVAlpha = constIVAlphaVal !== '' ? parseFloat(constIVAlphaVal) : null;

        if (!newTitle) {
          alert('曲名を入力してください');
          return;
        }

        if (isNaN(constI) || isNaN(constII) || isNaN(constIII) || isNaN(constIV)) {
          alert('難易度 I, II, III, IV の定数をすべて入力してください');
          return;
        }

        if (constIVAlphaVal !== '' && isNaN(constIVAlpha)) {
          alert('IV-α の定数を正しく入力してください');
          return;
        }

        const isEndOfSale = (document.getElementById('editSongEndOfSale') && document.getElementById('editSongEndOfSale').checked) ? 1 : 0;
        const newInsertAfterSong = (document.getElementById('editInsertAfterSong').value || '').trim();
        const needReorder = (newInsertAfterSong !== '' && newInsertAfterSong.toLowerCase() !== currentEditSongPrevTitle.toLowerCase());

        const currentTuples = masterSongs.filter(s => s[7] === songId);
        if (currentTuples.length === 0) return;

        const newDiffs = {
          'I': constI,
          'II': constII,
          'III': constIII,
          'IV': constIV
        };
        if (constIVAlpha !== null) {
          newDiffs['IV-α'] = constIVAlpha;
        }

        // I〜IVの更新
        ['I', 'II', 'III', 'IV'].forEach(diff => {
          let t = currentTuples.find(s => s[2] === diff);
          const c = newDiffs[diff];
          const lvl = calcLevelFromConstant(c);
          if (t) {
            t[1] = newTitle;
            t[3] = lvl;
            t[4] = c;
            t[6] = newPack;
            t[8] = isEndOfSale;
            t[11] = newVersion;
            if (needReorder) {
              t[12] = calculateInitIdForDiff(diff, newInsertAfterSong);
            }
          } else {
            const newInitId = calculateInitIdForDiff(diff, newInsertAfterSong || newTitle);
            masterSongs.push([
              songId + '_' + diff,
              newTitle,
              diff,
              lvl,
              c,
              0,
              newPack,
              songId,
              isEndOfSale,
              0,
              '',
              newVersion,
              newInitId
            ]);
          }
        });

        // IV-αの更新または削除
        let ivAlphaTuple = currentTuples.find(s => s[2] === 'IV-α');
        if (constIVAlpha !== null) {
          const lvl = calcLevelFromConstant(constIVAlpha);
          if (ivAlphaTuple) {
            ivAlphaTuple[1] = newTitle;
            ivAlphaTuple[3] = lvl;
            ivAlphaTuple[4] = constIVAlpha;
            ivAlphaTuple[6] = newPack;
            ivAlphaTuple[8] = isEndOfSale;
            ivAlphaTuple[11] = newVersion;
            if (needReorder) {
              ivAlphaTuple[12] = calculateInitIdForDiff('IV-α', newInsertAfterSong);
            }
          } else {
            const newInitId = calculateInitIdForDiff('IV-α', newInsertAfterSong || newTitle);
            masterSongs.push([
              songId + '_IV-α',
              newTitle,
              'IV-α',
              lvl,
              constIVAlpha,
              0,
              newPack,
              songId,
              isEndOfSale,
              0,
              '',
              newVersion,
              newInitId
            ]);
          }
        } else if (ivAlphaTuple) {
          masterSongs = masterSongs.filter(s => s !== ivAlphaTuple);
        }

        masterSongs.forEach(s => {
          if (s[7] === songId) {
            s[1] = newTitle;
            s[6] = newPack;
            s[8] = isEndOfSale;
            s[11] = newVersion;
          }
        });

        closeEditSongModal();
        initFormDatalists();
        renderEditSongSearchResult();
        checkUnsavedChanges();
        refresh();
      });
    }

    document.getElementById('btnExportJson').addEventListener('click', () => {
      const data = {
        songs: masterSongs,
        scores: userScores,
        packOrder: packOrder,
        apPlusRecords: apPlusRecords
      };
      const json = JSON.stringify(data, null, 2);
      navigator.clipboard.writeText(json).then(() => {
        alert('楽曲マスター、スコア、ソングパック順序、および理論値(AP+)記録データをクリップボードにコピーしました！');
      });
    });

    document.getElementById('btnDownloadJson').addEventListener('click', () => {
      const data = {
        songs: masterSongs,
        scores: userScores,
        packOrder: packOrder,
        apPlusRecords: apPlusRecords
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rotaeno_data_' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btnImportJson').addEventListener('click', () => {
      const text = prompt('バックアップしたJSONテキストを貼り付けてください:');
      if (!text) return;
      try {
        const imported = JSON.parse(text);
        if (typeof imported === 'object' && imported !== null) {
          if (imported.scores && typeof imported.scores === 'object') {
            userScores = imported.scores;
            if (Array.isArray(imported.songs)) {
              masterSongs = imported.songs;
            } else if (Array.isArray(imported.customSongs)) {
              // Legacy customSongs format migration
              let maxId = masterSongs.length;
              imported.customSongs.forEach(song => {
                const tuples = songObjToTuples(song, maxId + 1);
                maxId += tuples.length;
                masterSongs.push(...tuples);
              });
            }
            if (Array.isArray(imported.packOrder)) {
              packOrder = imported.packOrder;
            }
            if (Array.isArray(imported.apPlusRecords)) {
              apPlusRecords = imported.apPlusRecords;
              saveApPlusRecords();
            }
          } else {
            // Legacy scores-only format
            userScores = imported;
          }

          Object.keys(userScores).forEach(id => {
            if (userScores[id] && userScores[id].score === 1010000 && userScores[id].status !== 'AP+') {
              userScores[id].status = 'AP+';
            }
          });
          saveScores();
          saveMasterSongs();
          savePackOrder();
          renderPackOrderList();
          initFormDatalists();
          checkUnsavedChanges();
          if (currentSort === 'PACK') renderSongList();
          refresh();
          alert('データを正常に復元しました！');
        }
      } catch (e) {
        alert('JSONの解析に失敗しました。正しいフォーマットか確認してください。');
      }
    });

    document.getElementById('btnExportCsv').addEventListener('click', () => {
      const rows = ['楽曲ID,難易度,曲名,スコア,クリア状況'];
      getAllSongs().forEach(s => {
        const rec = userScores[s[0]] || { score: '', status: '' };
        rows.push(\`\${s[7]},\${s[2]},"\${s[1]}",\${rec.score || ''},\${rec.status || ''}\`);
      });
      const csv = rows.join('\\n');
      navigator.clipboard.writeText(csv).then(() => {
        alert('CSVデータをクリップボードにコピーしました！');
      });
    });

    document.getElementById('btnResetData').addEventListener('click', () => {
      if (confirm('すべての入力済みスコア、追加した楽曲、ソングパック順序、および理論値(AP+)記録を初期状態にリセットしますか？この操作は取り消せません。')) {
        userScores = {};
        masterSongs = JSON.parse(JSON.stringify(DEFAULT_SONGS));
        packOrder = [...GAME_PACK_ORDER];
        const existingPacks = [...new Set(masterSongs.map(s => s[6]))].filter(Boolean);
        existingPacks.forEach(p => {
          if (!packOrder.includes(p)) packOrder.push(p);
        });
        apPlusRecords = JSON.parse(JSON.stringify(DEFAULT_AP_PLUS_RECORDS));
        saveScores();
        saveMasterSongs();
        savePackOrder();
        saveApPlusRecords();
        renderPackOrderList();
        initFormDatalists();
        initApPlusForm();
        checkUnsavedChanges();
        refresh();
      }
    });

    document.getElementById('btnCommitChanges').addEventListener('click', () => {
      saveScores();
      saveMasterSongs();
      savePackOrder();
      checkUnsavedChanges();
      refresh();
      showSaveToast();
      if (autoSyncEnabled && userSheetUrl) {
        triggerAutoSync();
      }
    });

    document.getElementById('btnDiscardChanges').addEventListener('click', () => {
      userScores = JSON.parse(JSON.stringify(savedScores));
      masterSongs = JSON.parse(JSON.stringify(savedMasterSongs));
      packOrder = JSON.parse(JSON.stringify(savedPackOrder));
      renderPackOrderList();
      initFormDatalists();
      renderEditSongSearchResult();
      checkUnsavedChanges();
      refresh();
    });

    // Google Spreadsheet Sync Functions
    function updateGasSyncUI() {
      const sheetInput = document.getElementById('userSheetUrlInput');
      const gasInput = document.getElementById('gasAppUrlInput');
      const badge = document.getElementById('gasSyncBadge');
      const statusText = document.getElementById('gasLastSyncText');
      const autoToggle = document.getElementById('autoSyncToggle');
      const autoLabel = document.getElementById('autoSyncStateLabel');

      if (sheetInput) sheetInput.value = userSheetUrl;
      if (gasInput) gasInput.value = gasAppUrl;
      const lastSync = localStorage.getItem(GAS_LAST_SYNC_KEY);
      if (statusText) statusText.textContent = lastSync || '未同期';

      if (autoToggle) autoToggle.checked = autoSyncEnabled;
      if (autoLabel) {
        if (autoSyncEnabled) {
          autoLabel.textContent = 'ON (自動同期有効)';
          autoLabel.style.background = '#dcfce7';
          autoLabel.style.color = '#15803d';
        } else {
          autoLabel.textContent = 'OFF (手動同期)';
          autoLabel.style.background = '#ffe4e6';
          autoLabel.style.color = '#be123c';
        }
      }

      if (badge) {
        if (userSheetUrl) {
          badge.textContent = '連携設定済み';
          badge.classList.add('connected');
        } else {
          badge.textContent = '未接続';
          badge.classList.remove('connected');
        }
      }
    }

    function saveUserSheetUrl() {
      const input = document.getElementById('userSheetUrlInput');
      const url = (input.value || '').trim();
      if (!url) {
        localStorage.removeItem(USER_SHEET_URL_KEY);
        userSheetUrl = '';
        updateGasSyncUI();
        alert('スプレッドシートURLを解除しました');
        return;
      }
      if (!url.includes('docs.google.com/spreadsheets/d/')) {
        alert('正しいGoogleスプレッドシートのURLを入力してください\\n(例: https://docs.google.com/spreadsheets/d/.../edit)');
        return;
      }
      userSheetUrl = url;
      localStorage.setItem(USER_SHEET_URL_KEY, userSheetUrl);
      updateGasSyncUI();
      alert('スプレッドシートURLを保存しました！\\n「スプシへ保存」または「接続テスト」を実行してください。');
    }

    function saveGasAppUrl() {
      const input = document.getElementById('gasAppUrlInput');
      const url = (input.value || '').trim();
      if (!url) {
        localStorage.removeItem(GAS_URL_KEY);
        gasAppUrl = '';
        updateGasSyncUI();
        alert('GAS WebアプリURLを解除しました');
        return;
      }
      if (!url.startsWith('https://script.google.com/')) {
        alert('Google Apps Script のウェブアプリURL (https://script.google.com/macros/s/.../exec) を入力してください');
        return;
      }
      gasAppUrl = url;
      localStorage.setItem(GAS_URL_KEY, gasAppUrl);
      updateGasSyncUI();
      alert('GAS WebアプリURLを保存しました！');
    }

    function getActiveGasEndpoint() {
      return gasAppUrl || DEFAULT_GAS_ENDPOINT;
    }

    async function testGasConnection() {
      if (!userSheetUrl) {
        alert('先にスプレッドシートのURLを入力・保存してください');
        return;
      }
      const endpoint = getActiveGasEndpoint();
      if (!endpoint) {
        alert('API接続先URLが未設定です。詳細設定を開いてGAS WebアプリURLを入力してください。');
        return;
      }
      const btn = document.getElementById('btnGasTest');
      if (btn) btn.textContent = '⌛ 接続テスト中...';
      try {
        const query = '?url=' + encodeURIComponent(userSheetUrl) + '&t=' + Date.now();
        const res = await fetch(endpoint + query, { method: 'GET' });
        const json = await res.json();
        if (json.status === 'success') {
          alert('✅ スプレッドシートとの通信に成功しました！\\n正常に読み書き可能です。');
        } else {
          alert('⚠️ スプレッドシートからエラーが返されました:\\n' + (json.message || ''));
        }
      } catch (err) {
        console.error(err);
        alert('❌ 接続に失敗しました。スプレッドシートの共有設定が「リンクを知っている全員（編集者）」になっているか確認してください。\\n\\n詳細: ' + err.message);
      } finally {
        if (btn) btn.textContent = '🔗 接続テスト';
      }
    }

    async function uploadToGas() {
      if (!userSheetUrl) {
        alert('先にスプレッドシートのURLを入力・保存してください');
        return;
      }
      const endpoint = getActiveGasEndpoint();
      if (!endpoint) {
        alert('API接続先URLが未設定です。詳細設定を開いてGAS WebアプリURLを入力してください。');
        return;
      }

      if (!confirm('現在のすべての楽曲マスター、入力済みスコア、理論値記録、および設定をGoogleスプレッドシートへ保存しますか？')) {
        return;
      }

      const btn = document.getElementById('btnGasUpload');
      const origText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ スプシへ送信中...';
      }

      const songGroups = getSongGroups(masterSongs);
      const songOrderMap = new Map();
      songGroups.forEach(s => songOrderMap.set(s.songId, s.initId));
      masterSongs.forEach(t => {
        if (songOrderMap.has(t[7])) {
          t[12] = songOrderMap.get(t[7]);
        }
      });
      masterSongs.sort((a, b) => (a[12] || 0) - (b[12] || 0));
      saveMasterSongs();

      const payload = {
        sheetUrl: userSheetUrl,
        songs: songGroups,
        scores: userScores,
        apPlusRecords: apPlusRecords,
        config: {
          packOrder: packOrder,
          statsScope: currentStatsScope,
          showApPlusDate: showApPlusDate
        }
      };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.status === 'success') {
          const nowStr = json.syncedAt || new Date().toLocaleString('ja-JP');
          localStorage.setItem(GAS_LAST_SYNC_KEY, nowStr);
          updateGasSyncUI();
          showSaveToast();
          alert('✅ Googleスプレッドシートへの保存が完了しました！\\n(' + nowStr + ')');
        } else {
          alert('⚠️ 保存に失敗しました:\\n' + (json.message || ''));
        }
      } catch (err) {
        console.error(err);
        alert('❌ 通信エラーが発生しました。スプレッドシートの共有設定が「リンクを知っている全員（編集者）」になっているか確認してください。\\n\\n' + err.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = origText;
        }
      }
    }

    async function downloadFromGas() {
      if (!userSheetUrl) {
        alert('先にスプレッドシートのURLを入力・保存してください');
        return;
      }
      const endpoint = getActiveGasEndpoint();
      if (!endpoint) {
        alert('API接続先URLが未設定です。詳細設定を開いてGAS WebアプリURLを入力してください。');
        return;
      }

      if (!confirm('Googleスプレッドシートからデータを取得し、アプリ内のデータを復元・上書きしますか？')) {
        return;
      }

      const btn = document.getElementById('btnGasDownload');
      const origText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = '⏳ スプシから取得中...';
      }

      try {
        const query = '?url=' + encodeURIComponent(userSheetUrl) + '&t=' + Date.now();
        const res = await fetch(endpoint + query, { method: 'GET' });
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const d = json.data;

          // 1. Restore Songs
          if (Array.isArray(d.songs) && d.songs.length > 0) {
            const restoredMaster = JSON.parse(JSON.stringify(DEFAULT_SONGS));
            const defaultSongIds = new Set(DEFAULT_SONGS.map(s => s[7]));
            const songMap = new Map();
            d.songs.forEach(s => songMap.set(s.songId, s));

            // Sync constants & initId if edited in sheet
            restoredMaster.forEach(t => {
              const song = songMap.get(t[7]);
              if (song) {
                if (song.initId !== undefined && !isNaN(song.initId)) t[12] = Number(song.initId);
                if (song.diffs && song.diffs[t[2]]) {
                  const diffObj = song.diffs[t[2]];
                  if (!isNaN(diffObj.constant)) t[4] = diffObj.constant;
                  if (diffObj.level) t[3] = diffObj.level;
                }
              }
            });

            // Add any user added songs from sheet with their exact initId
            let fallbackId = restoredMaster.length;
            d.songs.forEach(song => {
              if (!defaultSongIds.has(song.songId)) {
                const songInitId = (song.initId !== undefined && !isNaN(song.initId)) 
                  ? Number(song.initId) 
                  : (++fallbackId);

                const diffKeys = ['I', 'II', 'III', 'IV'];
                if (song.diffs && song.diffs['IV-α']) diffKeys.push('IV-α');

                diffKeys.forEach(diff => {
                  const dObj = song.diffs && song.diffs[diff];
                  if (!dObj || isNaN(dObj.constant)) return;
                  restoredMaster.push([
                    song.songId + '_' + diff,
                    song.title,
                    diff,
                    dObj.level || calcLevelFromConstant(dObj.constant),
                    dObj.constant,
                    0,
                    song.pack || '基本曲',
                    song.songId,
                    0,
                    0,
                    '',
                    song.version || 'v5.6.0',
                    songInitId
                  ]);
                });
              }
            });

            restoredMaster.sort((a, b) => (a[12] || 0) - (b[12] || 0));
            masterSongs = restoredMaster;
            saveMasterSongs();
          }

          // 2. Restore Scores
          if (d.scores && typeof d.scores === 'object') {
            userScores = d.scores;
            Object.keys(userScores).forEach(id => {
              if (userScores[id] && userScores[id].score === 1010000 && userScores[id].status !== 'AP+') {
                userScores[id].status = 'AP+';
              }
            });
            saveScores();
          }

          // 3. Restore Theory Records
          if (Array.isArray(d.apPlusRecords) && d.apPlusRecords.length > 0) {
            apPlusRecords = d.apPlusRecords.map(normalizeApPlusRecord);
            saveApPlusRecords();
          }

          // 4. Restore Config
          if (d.config && typeof d.config === 'object') {
            if (Array.isArray(d.config.packOrder) && d.config.packOrder.length > 0) {
              packOrder = d.config.packOrder;
              savePackOrder();
            }
            if (d.config.statsScope) {
              currentStatsScope = d.config.statsScope;
              localStorage.setItem(STATS_SCOPE_KEY, currentStatsScope);
              updateStatsScopeUI();
            }
            if (d.config.showApPlusDate !== undefined) {
              showApPlusDate = !!d.config.showApPlusDate;
              localStorage.setItem(SHOW_DATE_KEY, String(showApPlusDate));
            }
          }

          const nowStr = new Date().toLocaleString('ja-JP');
          localStorage.setItem(GAS_LAST_SYNC_KEY, nowStr);
          updateGasSyncUI();
          renderPackOrderList();
          initFormDatalists();
          initApPlusForm();
          checkUnsavedChanges();
          if (currentSort === 'PACK') renderSongList();
          refresh();

          alert('✅ Googleスプレッドシートからデータを正常に復元しました！');
        } else {
          alert('⚠️ 復元に失敗しました:\\n' + (json.message || 'データが見つかりません'));
        }
      } catch (err) {
        console.error(err);
        alert('❌ 通信エラーが発生しました。スプレッドシートの共有設定が「リンクを知っている全員（編集者）」になっているか確認してください。\\n\\n' + err.message);
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = origText;
        }
      }
    }

    async function triggerAutoSync() {
      if (!autoSyncEnabled || !userSheetUrl) return;
      const endpoint = getActiveGasEndpoint();
      if (!endpoint) return;

      showSaveToast('☁️ スプシへ自動同期中...');

      const songGroups = getSongGroups(masterSongs);
      const songOrderMap = new Map();
      songGroups.forEach(s => songOrderMap.set(s.songId, s.initId));
      masterSongs.forEach(t => {
        if (songOrderMap.has(t[7])) {
          t[12] = songOrderMap.get(t[7]);
        }
      });
      masterSongs.sort((a, b) => (a[12] || 0) - (b[12] || 0));
      saveMasterSongs();

      const payload = {
        sheetUrl: userSheetUrl,
        songs: songGroups,
        scores: userScores,
        apPlusRecords: apPlusRecords,
        config: {
          packOrder: packOrder,
          statsScope: currentStatsScope,
          showApPlusDate: showApPlusDate
        }
      };

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.status === 'success') {
          const nowStr = json.syncedAt || new Date().toLocaleString('ja-JP');
          localStorage.setItem(GAS_LAST_SYNC_KEY, nowStr);
          updateGasSyncUI();
          showSaveToast('✅ スプシ自動保存完了！');
        } else {
          console.warn('Auto sync warning:', json.message);
          showSaveToast('⚠️ スプシ自動同期エラー');
        }
      } catch (err) {
        console.error('Auto sync error:', err);
        showSaveToast('⚠️ スプシ自動同期に失敗しました');
      }
    }

    function copyGasScriptCode() {
      navigator.clipboard.writeText(GAS_SCRIPT_CODE).then(() => {
        alert('📋 GASスクリプトをクリップボードにコピーしました！\\n\\nスプレッドシートの「拡張機能」>「Apps Script」に貼り付けてデプロイしてください。');
      }).catch(err => {
        prompt('以下のコードをすべてコピーしてください:', GAS_SCRIPT_CODE);
      });
    }

    // Attach GAS Event Listeners
    const autoSyncToggle = document.getElementById('autoSyncToggle');
    if (autoSyncToggle) {
      autoSyncToggle.addEventListener('change', (e) => {
        autoSyncEnabled = e.target.checked;
        localStorage.setItem(AUTO_SYNC_KEY, String(autoSyncEnabled));
        updateGasSyncUI();
        if (autoSyncEnabled) {
          showSaveToast('✅ スプシ自動同期をONにしました');
        } else {
          showSaveToast('スプシ自動同期をOFFにしました');
        }
      });
    }

    const btnSaveSheetUrl = document.getElementById('btnSaveSheetUrl');
    if (btnSaveSheetUrl) btnSaveSheetUrl.addEventListener('click', saveUserSheetUrl);
    const btnSaveGasUrl = document.getElementById('btnSaveGasUrl');
    if (btnSaveGasUrl) btnSaveGasUrl.addEventListener('click', saveGasAppUrl);
    const btnGasTest = document.getElementById('btnGasTest');
    if (btnGasTest) btnGasTest.addEventListener('click', testGasConnection);
    const btnGasUpload = document.getElementById('btnGasUpload');
    if (btnGasUpload) btnGasUpload.addEventListener('click', uploadToGas);
    const btnGasDownload = document.getElementById('btnGasDownload');
    if (btnGasDownload) btnGasDownload.addEventListener('click', downloadFromGas);
    const btnCopyGasCode = document.getElementById('btnCopyGasCode');
    if (btnCopyGasCode) btnCopyGasCode.addEventListener('click', copyGasScriptCode);

    const btnCheckUpdates = document.getElementById('btnCheckOfficialUpdates');
    if (btnCheckUpdates) btnCheckUpdates.addEventListener('click', openOfficialUpdateModal);
    const btnOfficialClose = document.getElementById('btnOfficialUpdateModalClose');
    if (btnOfficialClose) btnOfficialClose.addEventListener('click', closeOfficialUpdateModal);
    const btnOfficialCancel = document.getElementById('btnOfficialUpdateCancel');
    if (btnOfficialCancel) btnOfficialCancel.addEventListener('click', closeOfficialUpdateModal);
    const btnOfficialApply = document.getElementById('btnOfficialUpdateApply');
    if (btnOfficialApply) btnOfficialApply.addEventListener('click', applyOfficialUpdates);

    window.addEventListener('beforeunload', (e) => {
      const allIds = new Set([...Object.keys(userScores), ...Object.keys(savedScores)]);
      let hasScoreChange = false;
      for (const id of allIds) {
        const u = userScores[id] || { score: 0, status: '' };
        const s = savedScores[id] || { score: 0, status: '' };
        if (u.score !== s.score || u.status !== s.status) {
          hasScoreChange = true;
          break;
        }
      }
      const hasSongChange = JSON.stringify(masterSongs) !== JSON.stringify(savedMasterSongs);
      const hasPackOrderChange = JSON.stringify(packOrder) !== JSON.stringify(savedPackOrder);
      if (hasScoreChange || hasSongChange || hasPackOrderChange) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });

    loadPackOrder();
    loadMasterSongs();
    loadInitialScores();
    loadApPlusRecords();
    initFormDatalists();
    initApPlusForm();
    renderPackOrderList();
    renderEditSongSearchResult();
    refresh();
    checkUnsavedChanges();
    updateGasSyncUI();
  </script>
</body>
</html>`;

fs.writeFileSync('index.html', htmlContent, 'utf-8');
console.log('Successfully added Completion, Theoretical Rating, Version, and Sort features!');
