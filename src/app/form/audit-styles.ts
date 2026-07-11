// CSS de la Auditoría Digital. Se inyecta con un <style> en la página.
// Los selectores de elementos genéricos (body/input/label/h1) están acotados
// bajo `.audit` para que no afecten al resto del sitio mientras la página vive.
// Las familias tipográficas apuntan a variables de next/font (--font-bebas, etc.).

export const AUDIT_CSS = `
  :root {
    --bg:          #080808;
    --bg2:         #0d0d0d;
    --bg3:         #111111;
    --surface:     #151515;
    --surface2:    #1a1a1a;
    --border:      rgba(255,255,255,0.07);
    --border-mid:  rgba(255,255,255,0.12);
    --text:        #f5f5f5;
    --text-2:      #a0a0a0;
    --text-3:      #555;
    --text-muted:  #666;
    --accent:      #00e5a0;
    --accent2:     #00b8ff;
    --accent-dim:  rgba(0,229,160,0.08);
    --accent-glow: rgba(0,229,160,0.15);
    --red:         #e05252;
    --yellow:      #e0a030;
    --green:       #00e5a0;
    --red-dim:     rgba(224,82,82,0.08);
    --yellow-dim:  rgba(224,160,48,0.08);
    --green-dim:   rgba(0,229,160,0.08);
    --red-border:  rgba(224,82,82,0.2);
    --yellow-border: rgba(224,160,48,0.2);
    --green-border:  rgba(0,229,160,0.2);
    --r:           6px;
    --r-lg:        10px;
    --ease:        cubic-bezier(.4,0,.2,1);
  }

  .audit *, .audit *::before, .audit *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .audit {
    position: relative;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-inter), system-ui, sans-serif;
    font-weight: 300;
    font-size: 15px;
    line-height: 1.6;
    min-height: 100vh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
  }

  /* dot grid, same density as site */
  .audit::before {
    content: '';
    position: fixed; inset: 0;
    background-image:
      radial-gradient(circle, rgba(0,229,160,0.18) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    z-index: 0;
    opacity: 0.35;
  }

  .audit .wrap {
    position: relative;
    z-index: 1;
    max-width: 860px;
    margin: 0 auto;
    padding: 72px 32px 100px;
  }

  .audit .logo {
    font-family: var(--font-inter), sans-serif;
    font-weight: 700;
    font-size: 17px;
    letter-spacing: -0.3px;
    color: var(--text);
    margin-bottom: 72px;
    display: flex;
    align-items: center;
    gap: 1px;
  }
  .audit .logo span { color: var(--accent); }

  .audit .progress-bar {
    height: 1px;
    background: var(--border);
    margin-bottom: 56px;
    overflow: hidden;
  }
  .audit .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    transition: width 0.55s var(--ease);
  }

  .audit .steps-nav {
    display: flex;
    gap: 6px;
    margin-bottom: 52px;
    flex-wrap: wrap;
  }
  .audit .step-pill {
    font-family: var(--font-jet), monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 2px;
    border: 1px solid var(--border);
    color: var(--text-3);
    background: transparent;
    cursor: default;
    transition: all 0.2s var(--ease);
  }
  .audit .step-pill.active {
    background: var(--accent-dim);
    border-color: var(--accent);
    color: var(--accent);
  }
  .audit .step-pill.done {
    background: var(--surface);
    border-color: var(--border-mid);
    color: var(--text-3);
  }

  .audit .header { margin-bottom: 52px; }

  .audit .tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-jet), monospace;
    font-size: 10px;
    color: var(--accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .audit .tag::before {
    content: '';
    width: 20px;
    height: 1px;
    background: var(--accent);
    flex-shrink: 0;
  }

  .audit h1 {
    font-family: var(--font-bebas), sans-serif;
    font-size: clamp(52px, 9vw, 88px);
    line-height: 0.92;
    letter-spacing: 0.025em;
    color: var(--text);
    margin-bottom: 20px;
  }
  .audit h1 em {
    font-style: normal;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .audit .header p {
    font-size: 15px;
    font-weight: 300;
    color: var(--text-2);
    line-height: 1.75;
    max-width: 480px;
  }

  .audit .selector-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 8px;
    margin-bottom: 44px;
  }
  .audit .obj-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 20px 18px;
    cursor: pointer;
    transition: border-color 0.18s var(--ease), background 0.18s var(--ease);
    display: flex;
    align-items: flex-start;
    gap: 14px;
    user-select: none;
  }
  .audit .obj-card:hover {
    border-color: var(--border-mid);
    background: var(--surface2);
  }
  .audit .obj-card.selected {
    border-color: var(--accent);
    background: var(--accent-dim);
  }
  .audit .obj-card.selected .obj-check { opacity: 1; }
  .audit .obj-icon {
    width: 38px; height: 38px;
    border-radius: 4px;
    background: var(--bg3);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .audit .obj-icon svg { width: 18px; height: 18px; stroke: var(--text-2); stroke-width: 1.5; fill: none; }
  .audit .obj-info { flex: 1; }
  .audit .obj-title {
    font-size: 13px;
    font-weight: 500;
    letter-spacing: -0.1px;
    margin-bottom: 3px;
    color: var(--text);
  }
  .audit .obj-short { font-size: 11px; color: var(--text-3); }
  .audit .obj-check {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; opacity: 0;
    transition: opacity 0.18s;
    margin-top: 1px;
  }
  .audit .obj-check::after {
    content: '';
    width: 8px; height: 5px;
    border-left: 2px solid #000;
    border-bottom: 2px solid #000;
    transform: rotate(-45deg) translate(1px,-1px);
  }

  .audit .area-block {
    margin-bottom: 52px;
    padding-bottom: 52px;
    border-bottom: 1px solid var(--border);
  }
  .audit .area-block:last-child { border-bottom: none; }

  .audit .area-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }
  .audit .area-icon {
    width: 36px; height: 36px;
    border-radius: 4px;
    background: var(--bg3);
    display: flex; align-items: center; justify-content: center;
  }
  .audit .area-icon svg { width: 17px; height: 17px; stroke: var(--accent); stroke-width: 1.5; fill: none; }
  .audit .area-name {
    font-family: var(--font-bebas), sans-serif;
    font-size: 28px;
    letter-spacing: 0.06em;
    color: var(--accent);
    line-height: 1;
  }
  .audit .area-desc { font-size: 11px; color: var(--text-3); margin-top: 2px; }

  .audit .question { margin-bottom: 28px; }
  .audit .question-num {
    font-family: var(--font-jet), monospace;
    font-size: 10px;
    color: var(--text-3);
    margin-bottom: 7px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .audit .question-text {
    font-size: 14px;
    font-weight: 400;
    color: var(--text-2);
    margin-bottom: 14px;
    line-height: 1.65;
  }
  .audit .options { display: flex; flex-direction: column; gap: 6px; }
  .audit .option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 13px 16px;
    border-radius: var(--r);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    font-size: 13px;
    font-weight: 300;
    line-height: 1.55;
    color: var(--text-2);
    background: var(--surface);
  }
  .audit .option:hover {
    border-color: var(--border-mid);
    background: var(--surface2);
    color: var(--text);
  }
  .audit .option.selected-opt {
    border-color: var(--accent);
    background: var(--accent-dim);
    color: var(--text);
  }
  .audit .option-radio {
    width: 15px; height: 15px;
    border-radius: 50%;
    border: 1.5px solid var(--border-mid);
    flex-shrink: 0; margin-top: 2px;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .audit .option.selected-opt .option-radio {
    border-color: var(--accent);
    background: var(--accent);
  }
  .audit .option.selected-opt .option-radio::after {
    content: '';
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #000;
  }

  .audit .notes-block {
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px dashed var(--border);
  }
  .audit .notes-label {
    font-family: var(--font-jet), monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-3);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .audit textarea.notes-input {
    width: 100%;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 14px 16px;
    color: var(--text);
    font-family: var(--font-inter), sans-serif;
    font-size: 13px;
    font-weight: 300;
    line-height: 1.65;
    resize: vertical;
    min-height: 88px;
    outline: none;
    transition: border-color 0.15s;
  }
  .audit textarea.notes-input::placeholder { color: var(--text-3); }
  .audit textarea.notes-input:focus { border-color: var(--accent); }

  .audit .lead-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 36px; }
  .audit .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .audit .field { display: flex; flex-direction: column; gap: 7px; }
  .audit label {
    font-family: var(--font-jet), monospace;
    font-size: 10px;
    color: var(--text-3);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .audit input, .audit select {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 13px 16px;
    color: var(--text);
    font-family: var(--font-inter), sans-serif;
    font-size: 14px;
    font-weight: 300;
    outline: none;
    transition: border-color 0.15s;
    -webkit-appearance: none;
    appearance: none;
  }
  .audit input::placeholder { color: var(--text-3); }
  .audit input:focus, .audit select:focus { border-color: var(--accent); }
  .audit select option { background: var(--bg3); }

  .audit .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 32px;
    border-radius: var(--r);
    font-family: var(--font-inter), sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.2s var(--ease);
    border: none;
    white-space: nowrap;
  }
  .audit .btn-primary {
    background: var(--accent);
    color: #000;
  }
  .audit .btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
  .audit .btn-ghost {
    background: transparent;
    border: 1px solid var(--border-mid);
    color: var(--text-2);
  }
  .audit .btn-ghost:hover { border-color: var(--text-2); color: var(--text); }
  .audit .btn-row {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding-top: 8px;
  }

  .audit .diag-header { margin-bottom: 52px; }
  .audit .diag-header h2 {
    font-family: var(--font-bebas), sans-serif;
    font-size: clamp(44px, 7vw, 72px);
    letter-spacing: 0.03em;
    line-height: 0.92;
    margin-bottom: 10px;
  }
  .audit .diag-name { color: var(--accent); }

  .audit .score-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px,1fr));
    gap: 10px;
    margin-bottom: 52px;
  }
  .audit .score-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 22px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.18s;
  }
  .audit .score-card:hover { border-color: var(--border-mid); }
  .audit .score-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
  }
  .audit .score-card.level-green::before { background: var(--green); }
  .audit .score-card.level-yellow::before { background: var(--yellow); }
  .audit .score-card.level-red::before { background: var(--red); }

  .audit .score-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }
  .audit .score-area-name { font-size: 14px; font-weight: 500; }
  .audit .score-badge {
    font-family: var(--font-jet), monospace;
    font-size: 9px;
    padding: 3px 9px;
    border-radius: 2px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .audit .level-green .score-badge { background: var(--green-dim); color: var(--green); border: 1px solid var(--green-border); }
  .audit .level-yellow .score-badge { background: var(--yellow-dim); color: var(--yellow); border: 1px solid var(--yellow-border); }
  .audit .level-red .score-badge { background: var(--red-dim); color: var(--red); border: 1px solid var(--red-border); }

  .audit .score-bar-wrap { height: 3px; background: var(--bg3); border-radius: 99px; overflow: hidden; margin-bottom: 14px; }
  .audit .score-bar-fill { height: 100%; border-radius: 99px; transition: width 1.1s var(--ease) 0.25s; }
  .audit .level-green .score-bar-fill { background: var(--green); }
  .audit .level-yellow .score-bar-fill { background: var(--yellow); }
  .audit .level-red .score-bar-fill { background: var(--red); }
  .audit .score-desc { font-size: 12px; color: var(--text-3); line-height: 1.6; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.88);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
    padding: 24px;
    animation: auditFadeIn 0.18s ease;
    font-family: var(--font-inter), system-ui, sans-serif;
  }
  .modal-overlay.hidden { display: none !important; }
  @keyframes auditFadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--surface);
    border: 1px solid var(--border-mid);
    border-radius: var(--r-lg);
    max-width: 580px; width: 100%;
    max-height: 82vh; overflow-y: auto;
    animation: auditSlideUp 0.22s var(--ease);
  }
  @keyframes auditSlideUp { from { transform: translateY(18px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 22px 26px;
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0;
    background: var(--surface);
    z-index: 1;
  }
  .modal-title {
    font-family: var(--font-bebas), sans-serif;
    font-size: 22px;
    letter-spacing: 0.06em;
    color: var(--accent);
  }
  .modal-close {
    width: 28px; height: 28px;
    border-radius: 4px;
    background: var(--bg3);
    border: 1px solid var(--border);
    cursor: pointer;
    color: var(--text-2);
    font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .modal-close:hover { background: var(--surface2); color: var(--text); }
  .modal-body { padding: 22px 26px; }
  .modal-q {
    margin-bottom: 22px;
    padding-bottom: 22px;
    border-bottom: 1px solid var(--border);
  }
  .modal-q:last-child { border-bottom: none; margin-bottom: 0; }
  .modal-q-num {
    font-family: var(--font-jet), monospace;
    font-size: 9px;
    color: var(--text-3);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .modal-q-text { font-size: 13px; color: var(--text-2); margin-bottom: 10px; line-height: 1.6; }
  .modal-answer {
    display: flex; align-items: flex-start; gap: 9px;
    padding: 10px 13px; border-radius: var(--r);
    font-size: 13px; font-weight: 300; line-height: 1.5;
  }
  .modal-answer.level-green { background: var(--green-dim); border: 1px solid var(--green-border); color: var(--text); }
  .modal-answer.level-yellow { background: var(--yellow-dim); border: 1px solid var(--yellow-border); color: var(--text); }
  .modal-answer.level-red { background: var(--red-dim); border: 1px solid var(--red-border); color: var(--text); }
  .modal-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
  .modal-answer.level-green .modal-dot { background: var(--green); }
  .modal-answer.level-yellow .modal-dot { background: var(--yellow); }
  .modal-answer.level-red .modal-dot { background: var(--red); }

  .audit .rec-section { margin-bottom: 52px; }
  .audit .rec-section-title {
    font-family: var(--font-bebas), sans-serif;
    font-size: 32px;
    letter-spacing: 0.05em;
    margin-bottom: 18px;
    color: var(--text);
  }
  .audit .rec-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 26px;
    margin-bottom: 10px;
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 18px;
  }
  .audit .rec-icon-wrap {
    width: 44px; height: 44px;
    border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .audit .level-green .rec-icon-wrap { background: var(--green-dim); }
  .audit .level-yellow .rec-icon-wrap { background: var(--yellow-dim); }
  .audit .level-red .rec-icon-wrap { background: var(--red-dim); }
  .audit .rec-icon-wrap svg { width: 20px; height: 20px; stroke-width: 1.5; fill: none; }
  .audit .level-green .rec-icon-wrap svg { stroke: var(--green); }
  .audit .level-yellow .rec-icon-wrap svg { stroke: var(--yellow); }
  .audit .level-red .rec-icon-wrap svg { stroke: var(--red); }

  .audit .rec-area {
    font-family: var(--font-jet), monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .audit .level-green .rec-area { color: var(--green); }
  .audit .level-yellow .rec-area { color: var(--yellow); }
  .audit .level-red .rec-area { color: var(--red); }

  .audit .rec-title { font-size: 15px; font-weight: 500; margin-bottom: 8px; color: var(--text); }
  .audit .rec-text { font-size: 13px; font-weight: 300; color: var(--text-2); line-height: 1.75; }
  .audit .rec-actions { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 6px; }
  .audit .rec-tag {
    font-family: var(--font-jet), monospace;
    font-size: 10px;
    padding: 4px 10px;
    border-radius: 2px;
    background: var(--bg3);
    border: 1px solid var(--border);
    color: var(--text-3);
  }
  .audit .view-answers-btn {
    display: inline-flex; align-items: center; gap: 5px;
    font-family: var(--font-jet), monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-3);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 5px 11px;
    cursor: pointer;
    margin-top: 12px;
    transition: all 0.15s;
  }
  .audit .view-answers-btn:hover { border-color: var(--border-mid); color: var(--text-2); }

  .audit .priority-section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 32px;
    margin-bottom: 28px;
  }
  .audit .priority-title {
    font-family: var(--font-bebas), sans-serif;
    font-size: 30px;
    letter-spacing: 0.05em;
    margin-bottom: 8px;
    color: var(--text);
  }
  .audit .priority-subtitle {
    font-size: 13px;
    font-weight: 300;
    color: var(--text-2);
    margin-bottom: 24px;
    line-height: 1.7;
  }
  .audit .priority-grid { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .audit .priority-card {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px;
    border-radius: var(--r);
    border: 1px solid var(--border);
    background: var(--bg3);
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    user-select: none;
  }
  .audit .priority-card:hover { border-color: var(--border-mid); background: var(--surface2); }
  .audit .priority-card.prio-selected { border-color: var(--accent); background: var(--accent-dim); }

  .audit .prio-num {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: var(--surface2);
    border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-jet), monospace;
    font-size: 10px;
    color: var(--text-3);
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .audit .priority-card.prio-selected .prio-num {
    background: var(--accent);
    border-color: var(--accent);
    color: #000;
    font-weight: 700;
  }
  .audit .prio-icon { display: flex; align-items: center; justify-content: center; }
  .audit .prio-icon svg { width: 16px; height: 16px; stroke: var(--text-2); stroke-width: 1.5; fill: none; }
  .audit .prio-info { flex: 1; }
  .audit .prio-name { font-size: 13px; font-weight: 500; color: var(--text); }
  .audit .prio-short { font-size: 11px; color: var(--text-3); margin-top: 1px; }
  .audit .prio-level {
    font-family: var(--font-jet), monospace;
    font-size: 9px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .audit .prio-green { background: var(--green-dim); color: var(--green); border: 1px solid var(--green-border); }
  .audit .prio-yellow { background: var(--yellow-dim); color: var(--yellow); border: 1px solid var(--yellow-border); }
  .audit .prio-red { background: var(--red-dim); color: var(--red); border: 1px solid var(--red-border); }
  .audit .prio-hint { font-size: 11px; color: var(--text-3); text-align: center; margin-top: 6px; }

  .audit .cta-final {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r-lg);
    padding: 48px 40px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .audit .cta-final::before {
    content: '';
    position: absolute;
    top: -100px; left: 50%;
    transform: translateX(-50%);
    width: 400px; height: 400px;
    background: radial-gradient(circle, var(--accent-glow) 0%, transparent 65%);
    pointer-events: none;
  }
  .audit .cta-final h3 {
    font-family: var(--font-bebas), sans-serif;
    font-size: clamp(32px, 5vw, 48px);
    letter-spacing: 0.04em;
    margin-bottom: 12px;
    line-height: 1;
  }
  .audit .cta-final p {
    font-size: 14px;
    font-weight: 300;
    color: var(--text-2);
    margin-bottom: 28px;
    line-height: 1.75;
    max-width: 420px;
    margin-left: auto;
    margin-right: auto;
  }
  .audit .cta-priority-summary {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 14px 18px;
    margin-bottom: 24px;
    font-size: 13px;
    font-weight: 300;
    color: var(--text-2);
    text-align: left;
    line-height: 1.7;
  }
  .audit .cta-priority-summary strong { color: var(--accent); }
  .audit .cta-buttons { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

  .audit .wa-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 28px;
    border-radius: var(--r);
    background: var(--accent);
    color: #000;
    font-family: var(--font-inter), sans-serif;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.2s var(--ease);
    cursor: pointer;
    border: none;
    letter-spacing: 0.01em;
  }
  .audit .wa-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }

  .audit .hidden { display: none !important; }
  .audit .step-section { animation: auditFadeUp 0.35s var(--ease); }
  @keyframes auditFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .audit .warn {
    font-family: var(--font-jet), monospace;
    font-size: 11px;
    color: var(--red);
    margin-top: 10px;
    letter-spacing: 0.04em;
  }

  @media (max-width: 600px) {
    .audit .wrap { padding: 48px 20px 80px; }
    .audit .form-row { grid-template-columns: 1fr; }
    .audit .selector-grid { grid-template-columns: 1fr; }
    .audit .score-grid { grid-template-columns: 1fr; }
    .audit .rec-card { grid-template-columns: 1fr; }
    .audit .cta-final { padding: 36px 24px; }
    .audit h1 { font-size: clamp(48px, 12vw, 72px); }
  }
`;
