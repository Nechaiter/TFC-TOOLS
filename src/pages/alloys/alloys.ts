export {}
const MINERAL_COLORS = ['#EE964B', '#2A9D8F', '#E76F51']; 
const PRESET_ALLOY_A = [144, 36, 16];
const PRESET_ALLOY_B = [129, 31, 13];
const RATIO = [20,30]


// TODO: update item bounds based on coefficients and verify if it already does so.
// Transpile JavaScript to TypeScript.
/**
 * ratioMin and ratioMax store the current ratio (in percent) a mineral should have to make a valid alloy.
 * item_bound stores a maximum cap of items based on the current coefficient and the max vessel capacity of its containers.
 * For example, 3024 (vessel MB) / 16 = 189 means that we can make 21 ingots with 189 items, but the vessel has a max cap of 64, so the real cap is 64.
 *
*/
interface Mineral {
  name: string;
  coefficients: number[];
  ratioMin: number;
  ratioMax: number;
  color: string;
  item_bounds: number[];
}

let minerals: Mineral[] = [
  { name: 'Mineral 1', coefficients: [144, 36, 16], ratioMin: 70, ratioMax: 80, color: MINERAL_COLORS[0],item_bounds:[0,0,0] },
  { name: 'Mineral 2', coefficients: [129, 31, 13], ratioMin: 20, ratioMax: 30, color: MINERAL_COLORS[1],item_bounds:[0,0,0] },
];



// Escape "" characters for the input value
function escHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Inserts 2 metals initially
function alloysRender(): void {
  const container = document.getElementById('alloys-minerals') as HTMLElement;
  container.innerHTML = '';
  
  const addBtn = document.getElementById('add-mineral-btn') as HTMLElement | null;
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
        <input type="color" class="mineral-dot" value="${m.color}" data-midx="${mIdx}" data-action="update-color" style="padding:0; border:none; cursor:pointer;">
        <input type="text" class="mineral-name-input" value="${escHtml(m.name)}" data-midx="${mIdx}" data-action="update-name">
        </div>
        <button class="coeff-remove" data-action="remove-mineral" data-midx="${mIdx}"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
      </div>`;

    // Ratio section
    const rangeW = Math.max(0, m.ratioMax - m.ratioMin);
    html += `
      <div class="ratio-section">
        <span class="ratio-section-label">Alloy Ratio (%)</span>
        <div class="ratio-inputs">
          <div class="input-group">
            <label>Min</label>
            <input type="number" min="0" max="100" value="${m.ratioMin}" data-midx="${mIdx}" data-field="ratioMin" data-action="update-ratio">
          </div>
          <span class="ratio-separator">&ndash;</span>
          <div class="input-group">
            <label>Max</label>
            <input type="number" min="0" max="100" value="${m.ratioMax}" data-midx="${mIdx}" data-field="ratioMax" data-action="update-ratio">
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
          <input type="number" min="0" value="${c}" data-midx="${mIdx}" data-cidx="${cIdx}" data-action="update-coeff">
          ${m.coefficients.length > 1 ? `<button class="coeff-remove" data-action="remove-coeff" data-midx="${mIdx}" data-cidx="${cIdx}" aria-label="Remove coefficient ${cIdx + 1}"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>` : ''}
        </div>
      `;
    });
    // Adds presets 144/129
    html += `</div>
      <div class="coeff-actions">
        <button class="btn-xs" data-action="add-coeff" data-midx="${mIdx}">+ Add</button>
        <div style="width:1px;height:16px;background:var(--border)"></div>
        <button class="btn-xs" data-action="preset-a" data-midx="${mIdx}">144/36/16</button>
        <button class="btn-xs" data-action="preset-b" data-midx="${mIdx}">129/31/13</button>
      </div>
    `;
    card.innerHTML = html;
    container.appendChild(card);
  });
}

function alloysUpdateName(el: HTMLInputElement): void { minerals[parseInt(el.dataset.midx!)].name = el.value; }
function alloysUpdateCoeff(el: HTMLInputElement): void { minerals[parseInt(el.dataset.midx!)].coefficients[parseInt(el.dataset.cidx!)] = parseInt(el.value) || 0; }
function alloysUpdateColor(el: HTMLInputElement): void { minerals[parseInt(el.dataset.midx!)].color = el.value; }

function alloysUpdateRatio(el: HTMLInputElement): void {
  const mIdx = parseInt(el.dataset.midx!);
  const field = el.dataset.field as 'ratioMin' | 'ratioMax';
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

// Regenerate all content with the new changes.
function alloysAddCoeff(mIdx: number): void { minerals[mIdx].coefficients.push(0); minerals[mIdx].item_bounds.push(0); alloysRender(); }
function alloysRemoveCoeff(mIdx: number, cIdx: number): void { minerals[mIdx].coefficients.splice(cIdx, 1); minerals[mIdx].item_bounds.splice(cIdx, 1); alloysRender(); }

function alloysApplyPreset(mIdx: number, preset: string): void { minerals[mIdx].coefficients = preset === 'A' ? [...PRESET_ALLOY_A] : [...PRESET_ALLOY_B]; alloysRender(); }

function alloysAddMineral(): void {
  if (minerals.length >= 3) return;
  minerals.push({
    name: 'Mineral ' + (minerals.length + 1),
    coefficients: [...PRESET_ALLOY_A],
    color: MINERAL_COLORS[minerals.length] || '#ccc',
    ratioMin:RATIO[0]||0,
    ratioMax:RATIO[1]||0,
    item_bounds:[0,0,0]
  });
  alloysRender();
}

function alloysRemoveMineral(mIdx: number): void {
  minerals.splice(mIdx, 1);
  
  if (minerals.length===1){
    minerals[0].ratioMin = 0
    minerals[0].ratioMax = 100
    
  }
  alloysRender();
}


// CALCULATION





// Helper to let UI update
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

declare const Desmos: any;

let calculator: any;
function initDesmos(): void {
  const elt = document.getElementById('calculator');
  if(!elt) return;
  
  calculator = Desmos.GraphingCalculator(elt, {
    keypad: false,
    expressions: false, 
    settingsMenu: true
  });
}


function updateDesmosGraph(results: any[]): void {
  
  const elt = document.getElementById('calculator');
  if (!elt) return;
  elt.classList.remove("hidden");

  if (!calculator) {
     initDesmos(); 
  }
  
  calculator.setBlank();
  let xData: number[] = [];
  let yData: number[] = [];
  
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
        latex: `x+y=${MAX_VESSEL_MB}`,
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


// BOUNDS

const MAX_TOTAL_ITEM=64
const MAX_ITEM_PER_SLOT=16
const MAX_SLOTS=4
let MAX_VESSEL_MB: number;
let MB_TO_INGOT: number;

async function alloysCalculate(): Promise<void> {
  const btn = document.getElementById('alloy-calc-btn') as HTMLButtonElement | null;
  const resultsWrap = document.getElementById('alloy-results-wrap') as HTMLElement;
  const ratios = document.getElementById('ratios-warning') as HTMLElement;
  ratios.classList.add('hidden');
  if(btn) btn.disabled = true;
  const originalContent = btn ? btn.innerHTML : 'Calculate';
  
  const updateStatus = async (msg: string): Promise<void> => {
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
        btn!.disabled = false;
        return;
      }
      if (minerals[index].ratioMax+(totalSum_min-minerals[index].ratioMin)>100){
        ratios.innerHTML = `
          <h3 style="margin-top:0; color:#E76F51;">Invalid ratios. The sum of each max value combined with the min values of the remaining items mustn't exceed 100%.</h3>
        `;
        ratios.classList.remove('hidden');
        btn!.disabled = false;
        return;
      }
    }
  }

  const mbInput = document.getElementById('alloy-mb-per-ingot') as HTMLInputElement | null;
  const vesselInput = document.getElementById('alloy-max-vessel') as HTMLInputElement | null;
  /**@type {number}*/
  MB_TO_INGOT = mbInput ? (parseInt(mbInput.value) || 144) : 144;
  /**@type {number}*/
  MAX_VESSEL_MB = vesselInput ? (parseInt(vesselInput.value) || 3024) : 3024;



  // STEP 1: CALCULATE ITEMS BOUNDS
  await updateStatus("Calculating item bounds...");

  const startTime = performance.now();
  
  
  // Sets items bounds
  for (let index = 0; index<minerals.length; index++){
    for (let coeff = 0; coeff < minerals[index].coefficients.length; coeff++) {
      let max_logical_item_count=Math.ceil(MAX_VESSEL_MB/minerals[index].coefficients[coeff]) // 3024/16 = 189 items, the vessel can only store 64 items
      
      // Reduce the quantity of a coeff lower o equal to the capacity of the vessel
      minerals[index].item_bounds[coeff]=(max_logical_item_count<64) ? max_logical_item_count : MAX_TOTAL_ITEM
      
      
      // Check if the MB quantity exceeds the max ratio; if so, reduce it now for its current MB quantity.
      let max_mb_from_coeff_and_item_bound=minerals[index].item_bounds[coeff]*minerals[index].coefficients[coeff] //144*21 = 3024 MB
      if ((max_mb_from_coeff_and_item_bound*100)/MAX_VESSEL_MB > minerals[index].ratioMax){
        let upper_bound_mb = MAX_VESSEL_MB*minerals[index].ratioMax/100
        let max_upper_bound_item_quantity = Math.floor(upper_bound_mb/minerals[index].coefficients[coeff])
        minerals[index].item_bounds[coeff]=max_upper_bound_item_quantity
      }
    }
  }

  // STEP 2: Calculate VALID weighted sums
  await updateStatus("Calculating valid weighted sums...");

  
  /**
   * Use recursion to generate all posible weighted sum from a single axis and filter out invalid states with the callback.
   * 
   * Checks it by rising the last digit of the bound (a limit of valid items of a coeff), [0,0,0],[1,0,0],[1,1,0] ->add/remove ,[1,1,1] -> callback ,[1,1,2]->callback...
   * a,b,c are the bounds but also current values eval in the callback (144a+36b+16c)
   * @param {number[]} bounds //   item_bounds:[0,0,0] / [16,64,64]
   * @param {function} callback // Checks and add the current axis as valid
   * @param {array} current_item_usage // current item count by axis, something like [7,3,4] means that the current axis setup is 144*7+36*3+16*4
   * @param {number} index // Current coeff index in minerals.coeff, could be a,b,c etc (144a+36b+16c)
   * @returns 
   */
  function combinations_per_coeff(bounds: number[], callback: (current_item_usage: number[]) => void, current_item_usage: number[] = [], index: number = 0): void {
    if (index== bounds.length){
      callback([...current_item_usage])
      return; 
    }
    for (let i = 0; i <= bounds[index]; i++) {
      current_item_usage[index] = i; 
      combinations_per_coeff(bounds,callback,current_item_usage, index + 1); 
    }
  }

  /** 
   * @type {Object.<string, PointData[]>} 
   * 
   *
   * 
   * @typedef {Object} PointData
   * @property {number} total_item_count
   * @property {number} slots_usage
   * @property {number} weighted_sum_mb
   * @property {Object} item_count_used_in_variable a,b,c etc (144a+36b+16c)
   */
  interface PointData {
    total_item_count: number;
    slots_usage: number;
    weighted_sum_mb: number;
    item_count_used_in_variable: number[];
    items_count?: number;
  }

  let valid_axis_data_from_minerals: Record<string, PointData[]> = {};


  for (const mineral of Object.values(minerals)){

    // Update status for each mineral to show progress
    //await updateStatus(`Processing mineral ${mineral_index + 1}/${minerals.length}...`);

    let total_items: number = 0


    valid_axis_data_from_minerals[mineral.name]=[]

    combinations_per_coeff(mineral.item_bounds,(current_item_count_the_coeffs_uses: number[])=>{

      /*
      The callback checks if a "state" of the weighted sum is valid in the corresponding bound and stores a point
      */


      // A vessel can't store more than 64 items.
      let total_item_count=current_item_count_the_coeffs_uses.reduce((a, b) => a + b, 0);
      if (total_item_count > MAX_TOTAL_ITEM) return;
      if (total_item_count === 0) return;

      // The current MB of all coefficients shouldn't exceed the max ratio.
      let sum_mb= current_item_count_the_coeffs_uses.reduce((a,b,i) => a + b*mineral.coefficients[i],0);
      if ((sum_mb*100)/MAX_VESSEL_MB > mineral.ratioMax) return;

      // a vessel only can store up to 4 coeff
      let total_slots_usage=current_item_count_the_coeffs_uses.reduce((a, b) => a + Math.ceil(b/16), 0);
      if (total_slots_usage>=MAX_SLOTS) return;

      if (total_slots_usage>MAX_SLOTS-(minerals.length-1)) return;
      
    
      let point_data: PointData={
        total_item_count:total_item_count,
        slots_usage:total_slots_usage,
        weighted_sum_mb:sum_mb,
        item_count_used_in_variable: current_item_count_the_coeffs_uses
      }
      valid_axis_data_from_minerals[mineral.name].push(point_data)
    }); 
  }

  // Sort the weighted sum of the minerals to reduce the number of combinations; in the worst case, it is still O(N^2).
  for (const mineral of Object.values(valid_axis_data_from_minerals)) {
    mineral.sort((a, b) =>
        // a.weighted_sum_mb - b.weighted_sum_mb ||
        // (a.items_count as number) - (b.items_count as number) ||
        a.slots_usage - b.slots_usage
    );
  }


  console.log(valid_axis_data_from_minerals)
  console.table(minerals)
  
  // STEP 3: Filter out invalid combinations 


  //Stores the values of interest we want to show and use in game.
  let values: any[]=[]


 // Generate the bound, (it means count of how many values per axis we need to check) 
 let bound: number[]=[] // [ 5120, 1915 ]
 for (const mineral of Object.values(minerals)){
    bound.push(valid_axis_data_from_minerals[mineral.name].length)
 }


  // inform about the magnitude of the reduction
  await updateStatus(`Filtering ${bound.reduce((a,b)=>a*b, 1)} candidates...`);
  interface mineral_info {
        name: string;
        items_from_variable: number[]; // numbers like a,b,c from (144a+36b+16c) 
  }
  enum point_data_state{
    slots_exceeded,
    items_exceeded,
    milibuckets_exceeded,
    milibuckets_leftover,
    invalid_ratio,
    valid
  }
  /**
   * This function check all axis combinations posible by the bound, X,Y,Z, for bound like [5846,1597], it goes like [0,0...1597], then [1,0...1597], ideally skip some values
   * thx to the list being sort, so if at the half we are getting more milibuckets than the vessel can store we are safe to skip that axis from that point.
   * [0,0...1000(break)]->[1,0...1200], worst case sceneario we still will be doing O(N^2) but could be rare if almost never. 
   * 
   * @param {number[]} bounds are the valid points generated [5846,1597]
   * @param {function} callback function to validate the cartesian product point is valid 
   * @param {number[]} current_point current point, like [10,6]
   * @param {number} index current index of the axis we are incrementing, index=1 -> 0,0 -> 0,1 -> 0,2
   * @returns 
   */
  function cartesian_product(bounds: number[], current_point: number[] = [], index: number = 0): point_data_state | undefined {

    if (index== bounds.length){
      

      
      let current_slot_usage_from_all_axis: number = 0
      let current_item_usage_from_all_axis: number = 0
      let current_milibucket_from_all_axis: number = 0

      let weighted_sum_mb_from_each_axis: number[]=[] 
      let item_count_used_in_variables: number[] =[]
      let minerals_detail: mineral_info[]=[]
      


      for (let axis = 0; axis<current_point.length; axis++){
        
  
        let mineral_name= minerals[axis].name
        let mineral_info=valid_axis_data_from_minerals[mineral_name][current_point[axis]]



        //Adds the item_count,slots and weighted_sum from all axis, one at the time
        current_slot_usage_from_all_axis+=mineral_info.slots_usage
        current_item_usage_from_all_axis+=mineral_info.total_item_count
        current_milibucket_from_all_axis+=mineral_info.weighted_sum_mb

        //Stores the weighted sum and item_count individualy from each axis to check it easily later.
        weighted_sum_mb_from_each_axis[axis]=mineral_info.weighted_sum_mb
        item_count_used_in_variables=mineral_info.item_count_used_in_variable

        minerals_detail.push({name:mineral_name,items_from_variable:item_count_used_in_variables})
      }


      let total_slot_usage_from_all_axis=current_slot_usage_from_all_axis
      let total_item_usage_from_all_axis=current_item_usage_from_all_axis
      let total_milibucket_usage_from_all_axis=current_milibucket_from_all_axis


      if (total_slot_usage_from_all_axis>MAX_SLOTS) return point_data_state.slots_exceeded;
      if (total_item_usage_from_all_axis>MAX_TOTAL_ITEM) return point_data_state.items_exceeded;  
      if (total_milibucket_usage_from_all_axis>MAX_VESSEL_MB) return point_data_state.milibuckets_exceeded;
      if (total_milibucket_usage_from_all_axis%MB_TO_INGOT!=0) return point_data_state.milibuckets_leftover;


      for (let axis_ws=0; axis_ws<weighted_sum_mb_from_each_axis.length; axis_ws++){
        let metal_percent=(weighted_sum_mb_from_each_axis[axis_ws]*100)/total_milibucket_usage_from_all_axis
        if (metal_percent< minerals[axis_ws].ratioMin || metal_percent>minerals[axis_ws].ratioMax) return point_data_state.invalid_ratio;
      }


      let point_of_interest={
        MB:total_milibucket_usage_from_all_axis, // 
        total_items:total_item_usage_from_all_axis, //
        slots:total_slot_usage_from_all_axis, //
        weighted_sum:weighted_sum_mb_from_each_axis, //
        minerals:minerals_detail,
        ingots:total_milibucket_usage_from_all_axis/MB_TO_INGOT
      }

      values.push(point_of_interest)
      return point_data_state.valid
    }
    
    for (let i = 0; i < bounds[index]; i++) {
      current_point[index] = i; 

      const state =cartesian_product(bounds,current_point, index + 1) 

      // If we exceed a certain treshhold, it means that all subsequent elements also exceed it.
      // Only one type of metric can be used, and the list needs to be sorted by it.
      // Without this the average time of calc is 1200 ms

      // if (state=== point_data_state.milibuckets_exceeded) break  //650ms 
      // if (state=== point_data_state.items_exceeded) break  // 660ms
      if (state=== point_data_state.slots_exceeded) break // 110ms
    }
  }

  cartesian_product(bound);
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
function buildHighlightDetail(item: any): string {
  let html = '';
  html += `<div class="hl-meta">`;
  html += `<span class="hl-meta-chip">MB: ${item.MB}</span>`;
  html += `<span class="hl-meta-chip">Items: ${item.total_items}</span>`;
  html += `<span class="hl-meta-chip">Slots: ${item.slots}</span>`;
  html += `</div>`;

  html += `<div class="hl-wsum">W = [${item.weighted_sum.join(', ')}]</div>`;

  item.minerals.forEach((md: any, mIdx: number) => {
    const color = minerals[mIdx] ? minerals[mIdx].color : 'inherit';
    const coeffs = minerals[mIdx] ? minerals[mIdx].coefficients : [];
    const varParts = md.items_from_variable.map((v: number, ci: number) => {
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

function renderAlloyResults(results: any[]): void {
  
  const wrap = document.getElementById('alloy-results-wrap') as HTMLElement;
  wrap.classList.remove('hidden');

  // Hide or show the "no results" banner without destroying the DOM
  let noResultsBanner = document.getElementById('alloy-no-results') as HTMLElement | null;
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
    (document.getElementById('alloy-highlights') as HTMLElement).style.display = 'none';
    (wrap.querySelector('.expandable-section') as HTMLElement).style.display = 'none';
    (wrap.querySelector('.graph-container') as HTMLElement).style.display = 'none';
    return;
  }

  // Has results — hide "no results" banner and show normal content
  noResultsBanner.style.display = 'none';
  (document.getElementById('alloy-highlights') as HTMLElement).style.display = '';
  (wrap.querySelector('.expandable-section') as HTMLElement).style.display = '';
  (wrap.querySelector('.graph-container') as HTMLElement).style.display = '';

  
  
  

  // Sort by MB descending for max/min
  const sorted = [...results].sort((a, b) => b.MB - a.MB);
  const top3 = sorted.slice(0, 3);
  const minItem = sorted.length > top3.length ? sorted[sorted.length - 1] : null;
  
  const highlightsEl = document.getElementById('alloy-highlights') as HTMLElement;
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
  (document.getElementById('alloy-points-count') as HTMLElement).textContent = results.length + ' points';

  // === Build dynamic table ===
  // Columns: # | MB | Items | Slots | W1 | W2 | W3 | [per mineral: x1(C1) | x2(C2) | ...]
  const table = document.getElementById('alloy-data-table') as HTMLElement;

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
    r.weighted_sum.forEach((w: number, wIdx: number) => {
      const color = minerals[wIdx] ? minerals[wIdx].color : 'inherit';
      bodyHtml += `<td style="color:${color};font-weight:600;">${w}</td>`;
    });

    // Per-mineral vars
    r.minerals.forEach((md: any, mIdx: number) => {
      const color = minerals[mIdx] ? minerals[mIdx].color : 'inherit';
      md.items_from_variable.forEach((v: number, ci: number) => {
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

  const desmos = document.getElementById('calculator') as HTMLElement;
  desmos.classList.add("hidden");
  const ternary = document.getElementById('ternary') as HTMLElement;
  ternary.classList.add("hidden");

  // RENDER GRAPH
  if (minerals.length<=2){
    
    updateDesmosGraph(results);
  }
  else{
    updateTernatyGraph()
  }
}

function updateTernatyGraph(): void {
  const elt = document.getElementById('ternary');
  if (!elt) return;
  elt.classList.remove("hidden");
  elt.innerHTML="Not implemented yet"
}


function toggleAlloyTable(): void {
  (document.getElementById('alloy-table-toggle') as HTMLElement).classList.toggle('open');
  (document.getElementById('alloy-table-body') as HTMLElement).classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  alloysRender();

  document.getElementById('nav-back-menu')?.addEventListener('click', () => showView('menu'));
  document.getElementById('nav-bloomery')?.addEventListener('click', () => showView('Bloomery'));
  document.getElementById('nav-forge')?.addEventListener('click', () => showView('forge'));
  document.getElementById('alloy-mb-preset-144')?.addEventListener('click', () => {
    (document.getElementById('alloy-mb-per-ingot') as HTMLInputElement).value = '144';
  });
  document.getElementById('alloy-mb-preset-100')?.addEventListener('click', () => {
    (document.getElementById('alloy-mb-per-ingot') as HTMLInputElement).value = '100';
  });
  document.getElementById('alloy-vessel-preset-3024')?.addEventListener('click', () => {
    (document.getElementById('alloy-max-vessel') as HTMLInputElement).value = '3024';
  });
  document.getElementById('alloy-vessel-preset-3000')?.addEventListener('click', () => {
    (document.getElementById('alloy-max-vessel') as HTMLInputElement).value = '3000';
  });
  document.getElementById('add-mineral-btn')?.addEventListener('click', alloysAddMineral);
  document.getElementById('alloy-calc-btn')?.addEventListener('click', alloysCalculate);
  document.getElementById('alloy-table-toggle')?.addEventListener('click', toggleAlloyTable);

  document.getElementById('alloys-minerals')?.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    switch (target.dataset.action) {
      case 'update-name': alloysUpdateName(target); break;
      case 'update-color': alloysUpdateColor(target); break;
      case 'update-ratio': alloysUpdateRatio(target); break;
      case 'update-coeff': alloysUpdateCoeff(target); break;
    }
  });

  document.getElementById('alloys-minerals')?.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!target) return;
    const mineralIndex = parseInt(target.dataset.midx ?? '', 10);
    const coefficientIndex = parseInt(target.dataset.cidx ?? '', 10);
    switch (target.dataset.action) {
      case 'remove-mineral': alloysRemoveMineral(mineralIndex); break;
      case 'remove-coeff': alloysRemoveCoeff(mineralIndex, coefficientIndex); break;
      case 'add-coeff': alloysAddCoeff(mineralIndex); break;
      case 'preset-a': alloysApplyPreset(mineralIndex, 'A'); break;
      case 'preset-b': alloysApplyPreset(mineralIndex, 'B'); break;
    }
  });
});
