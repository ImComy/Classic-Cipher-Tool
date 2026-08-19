import type { Step } from '../types';

/**
 * Renders a step object into an HTML string.
 */
export function renderStep(step: Step, index: number): string {
  const type = step.type || 'info';

  const colorMap: Record<string, string> = {
    info: '#2a4b7c',
    warn: '#b45309',
    error: '#b91c1c',
    result: '#059669',
    mappings: '#6d28d9',
    table: '#0e7490',
    'calc-detail': '#0e7490',
    html: '#475569',
    'hill-blocks': '#1d4ed8',
    'perm-blocks': '#1d4ed8',
  }
  const borderColor = colorMap[type] || '#2a4b7c'

  const bgMap: Record<string, string> = {
    error: '#fef2f2',
    result: '#f0fdf4',
    warn: '#fffbeb',
    table: '#f0f9ff',
    'calc-detail': '#f0f9ff',
  }
  const bg = bgMap[type] || '#f8fafc'

  let html = `<div class="step-box step-type-${type}" style="border-left-color:${borderColor};background:${bg};">`

  // Step index badge + label
  if ('label' in step && step.label) {
    html += `<div class="step-header">
      <span class="step-badge" style="background:${borderColor};">${index + 1}</span>
      <span class="step-label">${escapeHtml(step.label)}</span>
    </div>`
  }

  switch (type) {
    case 'info': {
      const detail = (step as { detail?: string }).detail || '';
      html += `<div class="step-info-body">${escapeHtml(detail)}</div>`;
      break;
    }

    case 'warn': {
      const detail = (step as { detail?: string }).detail || '';
      html += `<div class="step-warn-body"><span class="step-warn-icon">⚠️</span>${escapeHtml(detail)}</div>`;
      break;
    }

    case 'error': {
      const detail = (step as { detail?: string }).detail || '';
      html += `<div class="step-error-body"><span class="step-error-icon">✗</span>${escapeHtml(detail)}</div>`;
      break;
    }

    case 'result': {
      const detail = (step as { detail?: string }).detail || '';
      html += `<div class="step-result-body"><span class="step-result-icon">✓</span>${escapeHtml(detail)}</div>`;
      break;
    }

    case 'calc-detail': {
      const lines = (step as { lines: string[] }).lines || [];
      html += `<div class="step-calc-block">`;
      for (const line of lines) {
        html += `<div class="step-calc-line">${escapeHtml(line)}</div>`;
      }
      html += `</div>`;
      break;
    }

    case 'mappings': {
      const mappings = (step as { mappings?: Array<{ char: string; newChar: string; formula?: string }> }).mappings;
      if (mappings && mappings.length > 0) {
        html += '<div class="step-char-map">';
        for (const m of mappings) {
          const char = escapeHtml(m.char);
          const newChar = escapeHtml(m.newChar);
          const formula = m.formula ? escapeHtml(m.formula) : '';
          html += `<span class="char-item">
            <span class="highlight">${char}</span>
            <span class="arrow">→</span>
            <span class="highlight new">${newChar}</span>
            <span class="idx">${formula}</span>
          </span>`;
        }
        html += '</div>';
      } else {
        const detail = (step as { detail?: string }).detail || '';
        html += `<div class="step-info-body">${escapeHtml(detail)}</div>`;
      }
      break;
    }

    case 'table': {
      const tableStep = step as { tableData?: Array<TableRow>; extra?: string };
      const data = tableStep.tableData || [];
      if (data.length > 0) {
        html += `
          <div class="step-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Step</th>
                  <th>q</th>
                  <th>r₁</th>
                  <th>r₂</th>
                  <th>r</th>
                  <th>t₁</th>
                  <th>t₂</th>
                  <th>t</th>
                </tr>
              </thead>
              <tbody>`;
        for (const row of data) {
          const isFinal = row.r2 === 0 && row.step > 0;
          const cls = isFinal ? 'highlight-row' : '';
          const qv = row.q !== null && row.q !== undefined ? row.q : '—';
          const rv = row.r !== null && row.r !== undefined ? row.r : '—';
          const tv = row.t !== null && row.t !== undefined ? row.t : '—';
          html += `<tr class="${cls}">
            <td>${row.step}</td>
            <td>${qv}</td>
            <td>${row.r1}</td>
            <td>${row.r2}</td>
            <td>${rv}</td>
            <td>${row.t1}</td>
            <td>${row.t2}</td>
            <td>${tv}</td>
          </tr>`;
        }
        html += `
              </tbody>
            </table>
          </div>`;
        if (tableStep.extra) {
          html += `<div class="step-table-result">${escapeHtml(tableStep.extra)}</div>`;
        }
      }
      break;
    }

    case 'html': {
      const htmlContent = (step as { html?: string }).html || '';
      html += htmlContent;
      break;
    }

    case 'hill-blocks': {
      const blocks = (step as { blocks?: HillBlock[] }).blocks || [];
      for (const b of blocks) {
        html += '<div class="step-subsection">';
        const blockLabel = b.chars || b.block || 'unknown';
        html += `<div class="sub-label">Block "<span class="sub-chars">${escapeHtml(blockLabel)}</span>"</div>`;
        if (b.calcLines) {
          for (const line of b.calcLines) {
            html += `<div class="step-calc-line block-line">${escapeHtml(line)}</div>`;
          }
        }
        const out = b.outChars || b.reordered || '';
        html += `<div class="block-out-line">→ <span class="block-out-chars">${escapeHtml(out)}</span></div>`;
        html += '</div>';
      }
      break;
    }

    case 'perm-blocks': {
      const blocks = (step as { blocks?: PermBlock[] }).blocks || [];
      for (const b of blocks) {
        html += '<div class="step-subsection">';
        html += `<div class="sub-label">${escapeHtml(b.original)} → ${escapeHtml(b.reordered)}</div>`;
        if (b.mapping) {
          html += `<div class="step-calc-line">${escapeHtml(b.mapping)}</div>`;
        }
        html += '</div>';
      }
      break;
    }

    default: {
      const detail = (step as { detail?: string }).detail || '';
      html += `<div class="step-info-body">${escapeHtml(detail)}</div>`;
    }
  }

  html += '</div>';
  return html;
}

// ---------- Helper Types ----------

interface TableRow {
  step: number;
  q?: number | null;
  r1: number;
  r2: number;
  r?: number | null;
  t1: number;
  t2: number;
  t?: number | null;
}

interface HillBlock {
  chars?: string;
  block?: string;
  calcLines?: string[];
  outChars?: string;
  reordered?: string;
}

interface PermBlock {
  original: string;
  reordered: string;
  mapping?: string;
}

// ---------- Security Helper ----------
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}