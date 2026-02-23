const PRESET_A = [144, 36, 16];
const PRESET_B = [129, 31, 13];
const IRON_COLOR = '#E76F51';

let ironCoefficients = [129, 31, 13];


function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function bloomeryRender() {
  const container = document.getElementById('iron-coeff-list');
  if (!container) return;

  container.innerHTML = '';

  ironCoefficients.forEach((c, idx) => {
    const row = document.createElement('div');
    row.className = 'coeff-row';

    const canRemove = ironCoefficients.length > 1;

    row.innerHTML = `
      <span class="coeff-tag">C${idx + 1}</span>
      <input type="number" min="0" value="${c}" data-cidx="${idx}" onchange="bloomeryUpdateCoeff(this)">
      ${canRemove ? `<button class="coeff-remove" onclick="bloomeryRemoveCoeff(${idx})" aria-label="Remove coefficient ${idx + 1}">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 6H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>` : ''}
    `;

    container.appendChild(row);
  });
}

function bloomeryUpdateCoeff(el) {
  const idx = parseInt(el.dataset.cidx);
  ironCoefficients[idx] = parseInt(el.value) || 0;
}

function bloomeryAddCoeff() {
  ironCoefficients.push(0);
  bloomeryRender();
}

function bloomeryRemoveCoeff(idx) {
  if (ironCoefficients.length > 1) {
    ironCoefficients.splice(idx, 1);
    bloomeryRender();
  }
}

function bloomeryApplyPreset(preset) {
  ironCoefficients = preset === 'A' ? [...PRESET_A] : [...PRESET_B];
  bloomeryRender();
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

let bloomeryCalculator;

function initBloomeryDesmos() {
  const elt = document.getElementById('bloomery-calculator');
  if (!elt) return;

  bloomeryCalculator = Desmos.GraphingCalculator(elt, {
    keypad: false,
    expressions: false,
    settingsMenu: true
  });
}

function updateBloomeryGraph(results) {
  const elt = document.getElementById('bloomery-calculator');
  if (!elt) return;

  if (!bloomeryCalculator) {
    initBloomeryDesmos();
  }

  bloomeryCalculator.setBlank();

  const xData = results.map(p => p.iron_ore_count);
  const yData = results.map(p => p.ingots);

  

  bloomeryCalculator.setExpression({
    id: 'item_limit_line',
    type: 'expression',
    latex: `y+x = 48 \\{x > 0\\}\\{y > 0\\}`,
    color: Desmos.Colors.RED,
    lineStyle: Desmos.Styles
  });

  bloomeryCalculator.setExpression({
    id: 'iron_per_coal_ratio',
    type: 'expression',
    latex: `x>= y \\{x+y<=48\\} \\{y > 0\\} `,
    color: Desmos.Colors.ORANGE,
    lineStyle: Desmos.Styles
  });


  bloomeryCalculator.setExpression({
    id: 'x_values',
    type: 'expression',
    latex: `X_{vals} = [${xData.join(',')}]`
  });

  bloomeryCalculator.setExpression({
    id: 'y_values',
    type: 'expression',
    latex: `Y_{vals} = [${yData.join(',')}]`
  });

  bloomeryCalculator.setExpression({
    id: 'points_plot',
    type: 'expression',
    latex: `(X_{vals}, Y_{vals})`,
    color: Desmos.Colors.PURPLE,
    pointStyle: Desmos.Styles.POINT,
    pointSize: '4'
  });

  bloomeryCalculator.updateSettings({
    xAxisLabel: 'Total iron ore',
    yAxisLabel: 'Ingots & Coal usage',
    xAxisStep: 1,
    yAxisStep: 1
  });

  const minX = Math.min(...xData) * -1;
  const maxX = Math.max(...xData) * 1.5;
  const minY = Math.min(...yData) * -1;
  const maxY = Math.max(...yData) * 1.5;

  bloomeryCalculator.setMathBounds({
    left: minX,
    right: maxX,
    bottom: minY,
    top: maxY
  });
}

async function bloomeryCalculate() {
  const btn = document.getElementById('bloomery-calc-btn');
  const resultsWrap = document.getElementById('bloomery-results-wrap');

  if (btn) btn.disabled = true;
  const originalContent = btn ? btn.innerHTML : 'Calculate';

  const updateStatus = async (msg) => {
    if (btn) btn.innerHTML = `<span class="spinner"></span> ${msg}`;
    await delay(10);
  };

  resultsWrap.classList.add('hidden');

  await updateStatus('Calculating...');

  const results = await performBloomeryCalculations();

  await updateStatus('Rendering...');

  renderBloomeryResults(results);

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = originalContent;
  }
}

async function performBloomeryCalculations() {
  await delay(100);

  const results = [];

  
  const MAX_TOTAL_ITEMS = 48;
  const MB_TO_INGOT = 144;

  function cartesian_product(bounds, callback, current = [], index = 0) {
    if (index== bounds.length){
      callback([...current])
      return; 
    }
    for (let i = 0; i <= bounds[index]; i++) {
      current[index] = i; 
      cartesian_product(bounds,callback,current, index + 1); 
    }
  }
  
  cartesian_product(ironCoefficients,(solution)=>{
    
    let sum_vars=solution.reduce((a, b) => a + b, 0);
    if (sum_vars>=MAX_TOTAL_ITEMS) return;
    if (sum_vars===0) return;
    let sum_mb= solution.reduce((a,b,i) => a + b*ironCoefficients[i],0);
    
    // We are putting more iron than coal can cover with the left item space
    if ((sum_mb/((MAX_TOTAL_ITEMS-sum_vars)*MB_TO_INGOT))>1) return;
    
    // search for multiples of 144

    mb_loss=sum_mb%MB_TO_INGOT
    if (mb_loss>0) return; 

    
    let coal_needed=sum_mb/MB_TO_INGOT
    // We need more space to cover all the iron with coal
    if (coal_needed>(MAX_TOTAL_ITEMS-sum_vars)) return;
    let sol_point={
      MB:sum_mb,
      coal:coal_needed,
      ingots: coal_needed,
      loss:mb_loss,
      iron_ore_count:sum_vars,
      var_counts: solution
    }

    results.push(sol_point)
  })

  results.sort((a, b) => {
    if (b.ingots !== a.ingots) return b.ingots - a.ingots;
    if (a.iron_ore_count !== b.iron_ore_count) return a.iron_ore_count - b.iron_ore_count;
    return a.loss - b.loss;
  });

  
  return results;
}

function buildBloomeryDetail(item) {
  let html = '';

  const varParts = item.var_counts.map((v, ci) => {
    if (v === 0) return '';
    const cLabel = ironCoefficients[ci] !== undefined ? ironCoefficients[ci] : '?';
    return `<span class="best-var">${cLabel}<span class="best-times">x</span>${v}</span>`;
  }).filter(x => x).join('');

  html += `<div class="best-detail-row">${varParts}</div>`;

  return html;
}

function renderBloomeryResults(results) {
  const wrap = document.getElementById('bloomery-results-wrap');
  wrap.classList.remove('hidden');

  if (!results || results.length === 0) {
    document.querySelector('.results-layout').style.display = 'none';
    let noResults = document.getElementById('bloomery-no-results');
    if (!noResults) {
      noResults = document.createElement('div');
      noResults.id = 'bloomery-no-results';
      noResults.style.cssText = 'text-align:center;padding:40px 20px;color:#666;background:#f8f9fa;border-radius:8px;border:1px dashed #ccc;';
      noResults.innerHTML = '<h3 style="margin-top:0;color:#E76F51;">No valid combinations found</h3>';
      wrap.appendChild(noResults);
    }
    noResults.style.display = 'block';
    return;
  }

  document.querySelector('.results-layout').style.display = '';
  const noResults = document.getElementById('bloomery-no-results');
  if (noResults) noResults.style.display = 'none';

  const best = results[0];
  const top3 = results.slice(0, 3);


  

  console.log(best)
  document.getElementById('best-ingots').textContent = best.ingots;
  document.getElementById('best-ore').textContent = best.iron_ore_count;
  document.getElementById('best-mb').textContent = best.MB;
  document.getElementById('best-coal').textContent = best.coal;
  document.getElementById('best-detail').innerHTML = buildBloomeryDetail(best);

  const top3Grid = document.getElementById('top3-grid');
  top3Grid.innerHTML = '';

  top3.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'top3-card';

    card.innerHTML = `
      <span class="top3-badge">#${i + 1}</span>
      <span class="top3-value">${item.ingots} ingots</span>
      <div class="top3-detail">
        ${item.MB} mb,
        ${item.coal} coal n.
        <div class="top3-meta">
          ${buildBloomeryDetail(item)}
        </div>
      </div>
    `;

    top3Grid.appendChild(card);
  });

  document.getElementById('bloomery-points-count').textContent = results.length + ' points';

  const table = document.getElementById('bloomery-data-table');
  let headerHtml = '<thead><tr>';
  headerHtml += '<th>#</th><th>Ingots</th><th>MB</th><th>Ore count</th><th>Coal n.</th>';

  ironCoefficients.forEach((c, ci) => {
    headerHtml += `<th style="color:${IRON_COLOR};">x<sub>${ci + 1}</sub> <span style="opacity:0.5;">(${c})</span></th>`;
  });

  headerHtml += '</tr></thead>';

  let bodyHtml = '<tbody>';
  results.forEach((r, i) => {
    const isTop = i < 3;
    const rowClass = isTop ? 'row-max' : '';
    const ingotsClass = isTop ? 'cell-max' : '';

    bodyHtml += `<tr class="${rowClass}">`;
    bodyHtml += `<td class="cell-muted">${i + 1}</td>`;
    bodyHtml += `<td class="${ingotsClass}" style="font-weight:600;">${r.ingots}</td>`;
    bodyHtml += `<td>${r.MB}</td>`;
    bodyHtml += `<td>${r.iron_ore_count}</td>`;
    bodyHtml += `<td>${r.coal}</td>`;


    r.var_counts.forEach(v => {
      bodyHtml += `<td>${v}</td>`;
    });

    bodyHtml += '</tr>';
  });
  bodyHtml += '</tbody>';

  table.innerHTML = headerHtml + bodyHtml;

  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

  updateBloomeryGraph(results);
}

function toggleBloomeryTable() {
  document.getElementById('bloomery-table-toggle').classList.toggle('open');
  document.getElementById('bloomery-table-body').classList.toggle('open');
}


document.addEventListener('DOMContentLoaded', () => {
    bloomeryRender()
});

