const MINERAL_COLORS = ['#EE964B', '#2A9D8F', '#E76F51']; 
const PRESET_A = [144, 36, 16];
const PRESET_B = [129, 31, 13];
const RATIO = [20,30]
let minerals = [
  { name: 'Mineral 1', coefficients: [144, 36, 16], ratioMin: 70, ratioMax: 80, color: MINERAL_COLORS[0],item_bounds:[0,0,0] },
  { name: 'Mineral 2', coefficients: [129, 31, 13], ratioMin: 20, ratioMax: 30, color: MINERAL_COLORS[1],item_bounds:[0,0,0] },
];



// Escape "" characters for the input value
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Inserts 2 metals initially
function alloysRender() {
  const container = document.getElementById('alloys-minerals');
  container.innerHTML = '';
  
  const addBtn = document.getElementById('add-mineral-btn');
  if (addBtn) {
    addBtn.style.display = minerals.length >= 3 ? 'none' : 'block';
  }

  minerals.forEach((m, mIdx) => {
    const card = document.createElement('div');
    card.className = 'mineral-card';
    
    //header
    let html = `
      <div class="mineral-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex;align-items:center;gap:10px;">
        <input type="color" class="mineral-dot" value="${m.color}" data-midx="${mIdx}" onchange="alloysUpdateColor(this)" style="padding:0; border:none; cursor:pointer;">
        <input type="text" class="mineral-name-input" value="${escHtml(m.name)}" data-midx="${mIdx}" onchange="alloysUpdateName(this)">
        </div>
        <button class="coeff-remove" onclick="alloysRemoveMineral(${mIdx})"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
      </div>`;

    // Ratio section
    const rangeW = Math.max(0, m.ratioMax - m.ratioMin);
    html += `
      <div class="ratio-section">
        <span class="ratio-section-label">Alloy Ratio (%)</span>
        <div class="ratio-inputs">
          <div class="input-group">
            <label>Min</label>
            <input type="number" min="0" max="100" value="${m.ratioMin}" data-midx="${mIdx}" data-field="ratioMin" onchange="alloysUpdateRatio(this)">
          </div>
          <span class="ratio-separator">&ndash;</span>
          <div class="input-group">
            <label>Max</label>
            <input type="number" min="0" max="100" value="${m.ratioMax}" data-midx="${mIdx}" data-field="ratioMax" onchange="alloysUpdateRatio(this)">
          </div>
        </div>
        <div class="ratio-bar">
          <div class="ratio-bar-fill" style="left:${m.ratioMin}%;width:${rangeW}%;background:${m.color};"></div>
        </div>
        <div class="ratio-bar-labels">
          <span>0%</span>
          <span>${m.ratioMin}% &ndash; ${m.ratioMax}%</span>
          <span>100%</span>
        </div>
      </div>
    `;

    // Adds placeholder coefficients
    html += '<div class="coeff-list">';
    m.coefficients.forEach((c, cIdx) => {
      html += `
        <div class="coeff-row">
          <span class="coeff-tag">C${cIdx + 1}</span>
          <input type="number" min="0" value="${c}" data-midx="${mIdx}" data-cidx="${cIdx}" onchange="alloysUpdateCoeff(this)">
          ${m.coefficients.length > 1 ? `<button class="coeff-remove" onclick="alloysRemoveCoeff(${mIdx}, ${cIdx})" aria-label="Remove coefficient ${cIdx + 1}"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>` : ''}
        </div>
      `;
    });
    // Adds presets 144/129
    html += `</div>
      <div class="coeff-actions">
        <button class="btn-xs" onclick="alloysAddCoeff(${mIdx})">+ Add</button>
        <div style="width:1px;height:16px;background:var(--border)"></div>
        <button class="btn-xs" onclick="alloysApplyPreset(${mIdx}, 'A')">144/36/16</button>
        <button class="btn-xs" onclick="alloysApplyPreset(${mIdx}, 'B')">129/31/13</button>
      </div>
    `;
    card.innerHTML = html;
    container.appendChild(card);
  });
}

function alloysUpdateName(el) { minerals[parseInt(el.dataset.midx)].name = el.value; }
function alloysUpdateCoeff(el) { minerals[parseInt(el.dataset.midx)].coefficients[parseInt(el.dataset.cidx)] = parseInt(el.value) || 0; }
function alloysUpdateColor(el) { minerals[parseInt(el.dataset.midx)].color = el.value; }

function alloysUpdateRatio(el) {
  const mIdx = parseInt(el.dataset.midx);
  const field = el.dataset.field;
  let val = parseInt(el.value) || 0;
  val = Math.max(0, Math.min(100, val));
  minerals[mIdx][field] = val;
  if (field === 'ratioMin' && minerals[mIdx].ratioMin > minerals[mIdx].ratioMax) {
    minerals[mIdx].ratioMax = minerals[mIdx].ratioMin;
  }
  if (field === 'ratioMax' && minerals[mIdx].ratioMax < minerals[mIdx].ratioMin) {
    minerals[mIdx].ratioMin = minerals[mIdx].ratioMax;
  }
  alloysRender();
}

//Regerate all the content with the new changes
function alloysAddCoeff(mIdx) { minerals[mIdx].coefficients.push(0); minerals[mIdx].item_bounds.push(0); alloysRender(); }
function alloysRemoveCoeff(mIdx, cIdx) { minerals[mIdx].coefficients.splice(cIdx, 1); minerals[mIdx].item_bounds.splice(cIdx, 1); alloysRender(); }

function alloysApplyPreset(mIdx, preset) { minerals[mIdx].coefficients = preset === 'A' ? [...PRESET_A] : [...PRESET_B]; alloysRender(); }

function alloysAddMineral() {
  if (minerals.length >= 3) return;
  minerals.push({
    name: 'Mineral ' + (minerals.length + 1),
    coefficients: [...PRESET_A],
    color: MINERAL_COLORS[minerals.length] || '#ccc',
    ratioMin:RATIO[0]||0,
    ratioMax:RATIO[1]||0,
    item_bounds:[0,0,0]
  });
  alloysRender();
}

function alloysRemoveMineral(mIdx) {
  minerals.splice(mIdx, 1);
  
  if (minerals.length===1){
    minerals[0].ratioMin = 0
    minerals[0].ratioMax = 100
    
  }
  alloysRender();
}


// CALCULATION




// BOUNDS

const MAX_TOTAL_ITEM=64
const MAX_ITEM_PER_SLOT=16


const MAX_SLOTS=4

// Helper to let UI update
const delay = (ms) => new Promise(res => setTimeout(res, ms));

let calculator;
function initDesmos() {
  const elt = document.getElementById('calculator');
  if(!elt) return;
  
  calculator = Desmos.GraphingCalculator(elt, {
    keypad: false,
    expressions: false, 
    settingsMenu: true
  });
}


function updateDesmosGraph(results) {
  
  const elt = document.getElementById('calculator');
  if (!elt) return;
  elt.classList.remove("hidden");

  if (!calculator) {
     initDesmos(); 
  }
  
  calculator.setBlank();
  let xData = [];
  let yData = [];
  
  if (minerals.length===1){
    xData = results.map(p => p.total_items);
    yData = results.map(p => p.weighted_sum[0]/MB_TO_INGOT);
    

    calculator.setExpression({
        id: 'mb_limit_line',
        type: 'expression',
        // El límite es una línea horizontal (techo)
        latex: `y = ${3024} \\{x > 0\\}`,
        color: Desmos.Colors.RED,
        lineStyle: Desmos.Styles.SOLID
    });

    calculator.setExpression({
        id: 'x_values',
        type: 'expression',
        latex: `X_{vals} = [${xData.join(',')}]`
      });

      calculator.setExpression({
        id: 'y_values',
        type: 'expression',
        latex: `Y_{vals} = [${yData.join(',')}]`
      });

      
      calculator.setExpression({
        id: 'points_plot',
        type: 'expression',
        latex: `(X_{vals}, Y_{vals})`,
        color: Desmos.Colors.BLUE,
        pointStyle: Desmos.Styles.POINT,
        pointSize: '3' 
      });
      
      let yAxisLabel = minerals[0].name + " (Ingots)";
      let xAxisLabel = "Total items (items)";

      calculator.updateSettings({
        xAxisLabel: xAxisLabel,
        yAxisLabel: yAxisLabel,
        xAxisStep: 1, // Opcional: fuerza pasos enteros si quieres
        yAxisStep: 1
      });


  }
  else {
    if (minerals.length === 2){
      xData = results.map(p => p.weighted_sum[0]);
      yData = results.map(p => p.weighted_sum[1]); 

      calculator.setExpression({
        id:'MB_limit',
        type:'expression',
        latex: `x+y=3024`,
        color: Desmos.Colors.RED
      })
      if (minerals[0].ratioMin===0){
        
        calculator.setExpression({
        id: 'vertical_orange',
        type: 'expression',
        latex: `x = 0\\{y>0\\}`,
        color: Desmos.Colors.ORANGE,
        lineStyle: Desmos.Styles.SOLID,
        lineOpacity: 1,  
        lineWidth: 5   
        });
      }
      else{
        calculator.setExpression({
        id: 'ratio_upper_limit', 
        type: 'expression',
        latex: `y = \\frac{${minerals[1].ratioMax}}{${minerals[0].ratioMin}} x \\{x > 0\\}`,
        color: Desmos.Colors.ORANGE,
        lineStyle: Desmos.Styles
        });
      }
      
      calculator.setExpression({
        id: 'ratio_lower_limit', 
        type: 'expression',
        latex: `y = \\frac{${minerals[1].ratioMin}}{${minerals[0].ratioMax}} x \\{x > 0\\}`,
        color: Desmos.Colors.PURPLE,
        lineStyle: Desmos.Styles
      });
      console.log(`y = \\frac{${minerals[1].ratioMin}}{${minerals[0].ratioMax}} x \\{x > 0\\}`)
      console.log(`y = \\frac{${minerals[1].ratioMax}}{${minerals[0].ratioMin}} x \\{x > 0\\}`)
      
      calculator.setExpression({
        id: 'ratio_upper_limit', 
        type: 'expression',
        latex: `y = \\frac{${minerals[1].ratioMax}}{${minerals[0].ratioMin}} x \\{x > 0\\}`,
        color: Desmos.Colors.ORANGE,
        lineStyle: Desmos.Styles
      });


      calculator.setExpression({
        id: 'x_values',
        type: 'expression',
        latex: `X_{vals} = [${xData.join(',')}]`
      });

      calculator.setExpression({
        id: 'y_values',
        type: 'expression',
        latex: `Y_{vals} = [${yData.join(',')}]`
      });

      
      calculator.setExpression({
        id: 'points_plot',
        type: 'expression',
        latex: `(X_{vals}, Y_{vals})`,
        color: Desmos.Colors.BLUE,
        pointStyle: Desmos.Styles.POINT,
        pointSize: '3' 
      });

      let xAxisLabel = minerals[0].name + " (mb)";
      let yAxisLabel = minerals[1].name + " (mb)";

      calculator.updateSettings({
        xAxisLabel: xAxisLabel,
        yAxisLabel: yAxisLabel,
        xAxisStep: 1, // Opcional: fuerza pasos enteros si quieres
        yAxisStep: 1
      });


    }
    else return;
  }
  
  
  

  const minX = Math.min(...xData) * -1;
  const maxX = Math.max(...xData) * 1.2;
  const minY = Math.min(...yData) * -1;
  const maxY = Math.max(...yData) * 1.2;

  calculator.setMathBounds({
    left: minX,
    right: maxX,
    bottom: minY,
    top: maxY
  });
  
  
}


async function alloysCalculate() {
  const btn = document.getElementById('alloy-calc-btn');
  const resultsWrap = document.getElementById('alloy-results-wrap');
  const ratios = document.getElementById('ratios-warning');
  ratios.classList.add('hidden');
  if(btn) btn.disabled = true;
  const originalContent = btn ? btn.innerHTML : 'Calculate';
  
  const updateStatus = async (msg) => {
    if(btn) btn.innerHTML = `<span class="spinner"></span> ${msg}`;
    await delay(10); 
  };

  resultsWrap.classList.add('hidden'); 

  // CHECK IF RATIOS ARE CONSISTENT


  
  if (minerals.length>1){
    const totalSum_max = minerals.reduce((acc, curr) => acc + curr.ratioMax, 0);
    const totalSum_min = minerals.reduce((acc, curr) => acc + curr.ratioMin, 0);
        
    for (let index = 0; index<minerals.length; index++){
      if (minerals[index].ratioMin+(totalSum_max-minerals[index].ratioMax)<100){
        ratios.innerHTML = `
          <h3 style="margin-top:0; color:#E76F51;">Invalid ratios. The sum of each minimum value combined with the maximum values of the remaining items must exceed 100%.</h3>
        `;
        ratios.classList.remove('hidden');
        btn.disabled = false;
        return;
      }
      if (minerals[index].ratioMax+(totalSum_min-minerals[index].ratioMin)>100){
        ratios.innerHTML = `
          <h3 style="margin-top:0; color:#E76F51;">Invalid ratios. The sum of each max value combined with the min values of the remaining items mustn't exceed 100%.</h3>
        `;
        ratios.classList.remove('hidden');
        btn.disabled = false;
        return;
      }
    }
  }

  const mbInput = document.getElementById('alloy-mb-per-ingot');
  const vesselInput = document.getElementById('alloy-max-vessel');
  MB_TO_INGOT = mbInput ? (parseInt(mbInput.value) || 144) : 144;
  MAX_VESSEL_MB = vesselInput ? (parseInt(vesselInput.value) || 3024) : 3024;



  // STEP 1: CALCULATE BOUNDS
  await updateStatus("Calculating item bounds...");

  const startTime = performance.now();
  // REDUCE ILOGICAL COMBINATIONS
  //console.table(minerals); 
  for (let index = 0; index<minerals.length; index++){
    for (let coeff = 0; coeff < minerals[index].coefficients.length; coeff++) {
      let max_logical_item_count=Math.ceil(MAX_VESSEL_MB/minerals[index].coefficients[coeff]) // 3024/144 = maximun of 21 items 
      // Reduce the quantity of a coeff lower o equal to the capacity of the vessel
      minerals[index].item_bounds[coeff]=(max_logical_item_count<64) ? max_logical_item_count : MAX_TOTAL_ITEM
      //Checks if the MB quantity overpass the max ratio
      let max_mb_from_coeff_and_item_bound=minerals[index].item_bounds[coeff]*minerals[index].coefficients[coeff] //144*21= gets 3024 mb
      if ((max_mb_from_coeff_and_item_bound*100)/MAX_VESSEL_MB > minerals[index].ratioMax){
        upper_bound_mb = MAX_VESSEL_MB*minerals[index].ratioMax/100
        max_upper_bound_item_quantity= Math.floor(upper_bound_mb/minerals[index].coefficients[coeff])
        minerals[index].item_bounds[coeff]=max_upper_bound_item_quantity
      }
    }
  }

  // STEP 2: GENERATE STATES
  await updateStatus("Generating state space...");

  // Calculate states values and filtrate weighted sum of items and mb
  minerals_data={
  }
  
  /**
   * 
   * @param {number[]} bounds //   item_bounds:[0,0,0]
   * @param {function} callback // Execute a function to check certain conditions
   * @param {*} current // Current item account
   * @param {number} index // Current coeff index in minerals.coeff
   * @returns 
   */
  function combinations_per_coeff(bounds, callback, current = [], index = 0) {
    if (index== bounds.length){
      callback([...current])
      return; // retornar los valores de ese coeff
    }
    for (let i = 0; i <= bounds[index]; i++) {
      current[index] = i; 
      combinations_per_coeff(bounds,callback,current, index + 1); 
    }
  }

  for (let mineral_index = 0; mineral_index<minerals.length;mineral_index++){
    // Update status for each mineral to show progress
    await updateStatus(`Processing mineral ${mineral_index + 1}/${minerals.length}...`);

    total_items=0
    minerals_data[minerals[mineral_index].name]=[]
    let combinaciones=0
    combinations_per_coeff(minerals[mineral_index].item_bounds,(items_by_coeff)=>{
      // a vessel cant store more than 64 items
      let sum_vars=items_by_coeff.reduce((a, b) => a + b, 0);
      if (sum_vars > MAX_TOTAL_ITEM) return;
      if (sum_vars === 0) return;

      // the current mb of all the coeff shouldnt overpass the max ratio
      let sum_mb= items_by_coeff.reduce((a,b,i) => a + b*minerals[mineral_index].coefficients[i],0);
      if ((sum_mb*100)/MAX_VESSEL_MB > minerals[mineral_index].ratioMax) return;

      // a vessel only can store up to 4 coeff
      let slots_usage=items_by_coeff.reduce((a, b) => a + Math.ceil(b/16), 0);
      if (slots_usage>=MAX_SLOTS) return;

      if (slots_usage>MAX_SLOTS-(minerals.length-1)) return;

      let point_data={
        items_count:sum_vars,
        slots_usage:slots_usage,
        weighted_sum_mb:sum_mb,
        var_count: items_by_coeff
      }
      minerals_data[minerals[mineral_index].name].push(point_data)
    }); 
  }
  console.log(minerals_data)
  console.table(minerals)
  
  // STEP 3: CARTESIAN PRODUCT
  await updateStatus("Merging combinations...");

  /**
   * 
   * @param {number[]} bounds are the valid points generated [5846,1597]
   * @param {function} callback function to validate the cartesian product point is valid 
   * @param {number[]} current current point
   * @param {number} index current index of the points
   * @returns 
   */
  function cartesian_product(bounds, callback, current = [], index = 0) {
    if (index== bounds.length){
      callback([...current])
      return; // retornar los valores de ese coeff
    }
    
    for (let i = 0; i < bounds[index]; i++) {
      current[index] = i; 
      cartesian_product(bounds,callback,current, index + 1); 
    }

 }
 let testx=[]
 let testy=[]
 let values=[]
 // Generate the bound
 let bound=[]
 for (let mineral_index = 0; mineral_index<minerals.length;mineral_index++){
    let name=minerals[mineral_index].name
    bound.push(minerals_data[name].length)
  }
  
  // Optional: Inform about the magnitude of the reduction
  await updateStatus(`Filtering ${bound.reduce((a,b)=>a*b, 1)} candidates...`);

  let combinaciones=0
  cartesian_product(bound,(points)=>{
    sum_slots=0
    sum_items=0
    sum_mb=0
    let weighted_sum=[]
    let val_values =[]
    minerals_detail=[]
    for (let axis = 0; axis<points.length; axis++){
      let mineral_name= minerals[axis].name
      let mineral_info=minerals_data[mineral_name][points[axis]]
      sum_slots+=mineral_info.slots_usage
      sum_items+=mineral_info.items_count
      sum_mb+=mineral_info.weighted_sum_mb
      weighted_sum[axis]=mineral_info.weighted_sum_mb
      val_values[axis]=mineral_info.var_count
      minerals_detail.push({mineral_name:mineral_name,vars:val_values[axis]})
    }
    if (sum_slots>MAX_SLOTS) return;
    if (sum_items>MAX_TOTAL_ITEM) return;  
    if (sum_mb>MAX_VESSEL_MB) return;
    if (sum_mb%MB_TO_INGOT!=0) return;

    for (let axis_ws=0; axis_ws<weighted_sum.length; axis_ws++){
      metal_percent=(weighted_sum[axis_ws]*100)/sum_mb
      if (metal_percent< minerals[axis_ws].ratioMin || metal_percent>minerals[axis_ws].ratioMax) return;

    }
    let point_of_interes={
      MB:sum_mb, // 
      total_items:sum_items, //
      slots:sum_slots, //
      weighted_sum:weighted_sum, //
      minerals:minerals_detail,
      ingots:sum_mb/MB_TO_INGOT
    }

    values.push(point_of_interes)
    // testx.push(weighted_sum[0])
    // testy.push(weighted_sum[1])
    combinaciones+=1
  });
  // console.log(combinaciones)
  // console.log(values)
  // STEP 4: SORTING
  await updateStatus("Sorting results...");

  // console.log(testx)
  // console.log(testy)
  values.sort((a,b)=>{

    if (b.MB !== a.MB) {
          return b.MB - a.MB;
      }
    if (a.slots !== b.slots){
          return a.slots-b.slots
      }    
    return a.total_items-b.total_items ;
  })

  const endTime = performance.now();
  const timeElapsed = (endTime - startTime).toFixed(2);
  console.log(`${timeElapsed} ms`)

  // Main machine does 15.3 seconds, old laptop up  to 1.2 minutes

  await updateStatus("Rendering...");
  console.log(values)
  renderAlloyResults(values);
  
  if(btn) {
    btn.disabled = false;
    btn.innerHTML = originalContent;
  }
  
}
/* Build a highlight card's HTML detail block */
function buildHighlightDetail(item) {
  let html = '';
  html += `<div class="hl-meta">`;
  html += `<span class="hl-meta-chip">MB: ${item.MB}</span>`;
  html += `<span class="hl-meta-chip">Items: ${item.total_items}</span>`;
  html += `<span class="hl-meta-chip">Slots: ${item.slots}</span>`;
  html += `</div>`;

  html += `<div class="hl-wsum">W = [${item.weighted_sum.join(', ')}]</div>`;

  item.minerals.forEach((md, mIdx) => {
    const color = minerals[mIdx] ? minerals[mIdx].color : 'inherit';
    const coeffs = minerals[mIdx] ? minerals[mIdx].coefficients : [];
    const varParts = md.vars.map((v, ci) => {
      const cLabel = coeffs[ci] !== undefined ? coeffs[ci] : '?';
      return `<span class="hl-var">${cLabel}<span class="hl-times">x</span>${v}</span>`;
    }).join('');
    html += `<div class="hl-mineral" style="border-left:2px solid ${color};padding-left:8px;">`;
    html += `<span class="hl-mineral-name" style="color:${color};">${escHtml(md.name)}</span>`;
    html += `<div class="hl-vars">${varParts}</div>`;
    html += `</div>`;
  });
  return html;
}

function renderAlloyResults(results) {
  
  const wrap = document.getElementById('alloy-results-wrap');
  wrap.classList.remove('hidden');

  // Hide or show the "no results" banner without destroying the DOM
  let noResultsBanner = document.getElementById('alloy-no-results');
  if (!noResultsBanner) {
    noResultsBanner = document.createElement('div');
    noResultsBanner.id = 'alloy-no-results';
    noResultsBanner.style.cssText = 'text-align:center;padding:40px 20px;color:#666;background:var(--surface, #1a1d2e);border-radius:8px;border:1px dashed var(--border, #ccc);';
    noResultsBanner.innerHTML = '<h3 style="margin-top:0;color:#E76F51;">No valid combinations found</h3>';
    wrap.insertBefore(noResultsBanner, wrap.firstChild);
  }

  if (!results || results.length === 0) {
    noResultsBanner.style.display = 'block';
    // Hide normal content but keep it in the DOM
    document.getElementById('alloy-highlights').style.display = 'none';
    wrap.querySelector('.expandable-section').style.display = 'none';
    wrap.querySelector('.graph-container').style.display = 'none';
    return;
  }

  // Has results — hide "no results" banner and show normal content
  noResultsBanner.style.display = 'none';
  document.getElementById('alloy-highlights').style.display = '';
  wrap.querySelector('.expandable-section').style.display = '';
  wrap.querySelector('.graph-container').style.display = '';

  
  
  

  // Sort by MB descending for max/min
  const sorted = [...results].sort((a, b) => b.MB - a.MB);
  const top3 = sorted.slice(0, 3);
  const minItem = sorted.length > top3.length ? sorted[sorted.length - 1] : null;
  
  const highlightsEl = document.getElementById('alloy-highlights');
  highlightsEl.innerHTML = '';
  
  top3.forEach((item, i) => {
    highlightsEl.innerHTML += `
      <div class="result-highlight is-max">
        <span class="result-badge max">Max #${i + 1}</span>
        <span class="result-value max-val">${item.ingots} ingots</span>
        <div class="result-detail">${buildHighlightDetail(item)}</div>
      </div>
    `;
  });
  if (minItem) {
    highlightsEl.innerHTML += `
    <div class="result-highlight is-min">
      <span class="result-badge min">Min</span>
      <span class="result-value min-val">${minItem.ingots} ingots</span>
      <div class="result-detail">${buildHighlightDetail(minItem)}</div>
    </div>
  `;
  }


  // Update expandable count
  document.getElementById('alloy-points-count').textContent = results.length + ' points';

  // === Build dynamic table ===
  // Columns: # | MB | Items | Slots | W1 | W2 | W3 | [per mineral: x1(C1) | x2(C2) | ...]
  const table = document.getElementById('alloy-data-table');

  let headerHtml = '<thead><tr>';
  headerHtml += '<th>#</th><th>Ingots</th><th>MB</th><th>Items</th><th>Slots</th>';

  // Weighted sum columns
  minerals.forEach((m, mIdx) => {
    headerHtml += `<th style="color:${m.color};">W<sub>${mIdx + 1}</sub></th>`;
  });

  // Per-mineral variable columns: header shows coefficient value as label
  minerals.forEach((m, mIdx) => {
    m.coefficients.forEach((c, ci) => {
      const isFirst = ci === 0;
      const border = isFirst ? `border-left:2px solid ${m.color};` : '';
      headerHtml += `<th style="color:${m.color};${border}">`;
      headerHtml += `<span style="opacity:0.5;font-size:0.6rem;">${escHtml(m.name)}</span><br>`;
      headerHtml += `x<sub>${ci + 1}</sub> <span style="opacity:0.45;font-weight:400;">(${c})</span>`;
      headerHtml += `</th>`;
    });
  });
  headerHtml += '</tr></thead>';

  let bodyHtml = '<tbody>';
  results.forEach((r, i) => {
    const isMax = top3.includes(r);
    const isMin = r === minItem && !isMax;
    const rowClass = isMax ? 'row-max' : (isMin ? 'row-min' : '');
    const mbClass = isMax ? 'cell-max' : (isMin ? 'cell-min' : '');

    bodyHtml += `<tr class="${rowClass}">`;
    bodyHtml += `<td class="cell-muted">${i + 1}</td>`;
    bodyHtml += `<td class="${mbClass}" style="font-weight:600;">${r.ingots}</td>`;
    bodyHtml += `<td>${r.MB}</td>`;
    bodyHtml += `<td>${r.total_items}</td>`;
    bodyHtml += `<td>${r.slots}</td>`;

    // Weighted sums
    r.weighted_sum.forEach((w, wIdx) => {
      const color = minerals[wIdx] ? minerals[wIdx].color : 'inherit';
      bodyHtml += `<td style="color:${color};font-weight:600;">${w}</td>`;
    });

    // Per-mineral vars
    r.minerals.forEach((md, mIdx) => {
      const color = minerals[mIdx] ? minerals[mIdx].color : 'inherit';
      md.vars.forEach((v, ci) => {
        const isFirst = ci === 0;
        const border = isFirst ? `border-left:2px solid ${color};` : '';
        bodyHtml += `<td style="${border}">${v}</td>`;
      });
    });

    bodyHtml += '</tr>';
  });
  bodyHtml += '</tbody>';
  table.innerHTML = headerHtml + bodyHtml;

  // Scroll to results
  wrap.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const desmos = document.getElementById('calculator');
  desmos.classList.add("hidden");
  const ternary = document.getElementById('ternary');
  ternary.classList.add("hidden");

  // RENDER GRAPH
  if (minerals.length<=2){
    
    updateDesmosGraph(results);
  }
  else{
    updateTernatyGraph()
  }
}

function updateTernatyGraph(){
  const elt = document.getElementById('ternary');
  if (!elt) return;
  elt.classList.remove("hidden");
  elt.innerHTML="Not implemented yet"
}


function toggleAlloyTable() {
  document.getElementById('alloy-table-toggle').classList.toggle('open');
  document.getElementById('alloy-table-body').classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', alloysRender);