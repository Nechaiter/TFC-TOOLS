
const FORGE_DATA = {
  'light_hit': {
    name: 'Light Hit',
    color: 'cyan',
    icon: './Images/steps/light_hit.png',
    value: -3
  },
  'medium_hit': {
    name: 'Medium Hit',
    color: 'light_blue',
    icon: './Images/steps/medium_hit.png',
    value: -6
  },
  'hard_hit': {
    name: 'Hard Hit',
    color: 'blue',
    icon: './Images/steps/hard_hit.png',
    value: -9
  },
  'draw': {
    name: 'Draw',
    color: 'purple',
    icon: './Images/steps/draw.png',
    value: -15
  },
  'punch': {
    name: 'Punch',
    color: 'green',
    icon: './Images/steps/punch.png',
    value: 2
  },
  'bend': {
    name: 'Bend',
    color: 'yellow',
    icon: './Images/steps/bend.png', 
    value: 7
  },
  'upset': {
    name: 'Upset',
    color: 'brown',
    icon: './Images/steps/upset.png',
    value: 13
  },
  'shrink': {
    name: 'Shrink',
    color: 'red',
    icon: './Images/steps/shrink.png',
    value: 16
  },
  
};

const PRIORITY_LEVELS = {
  'not_last':{
    name:'Not Last',
    icon:'./Images/priority/not_last.png'
  },
  'any':{
    name:'Any',
    icon:'./Images/priority/any.png'
  },
  'last':{
    name:'Last',
    icon:'./Images/priority/last.png'
  },
  'second_last':{
    name:'Second Last',
    icon:'./Images/priority/second_last.png'
  },
  'third_last':{
    name:'Third Last',
    icon:'./Images/priority/third_last.png'
  }
}

function renderValues() {
  const grid = document.getElementById('values-grid');
  grid.innerHTML = '';

  Object.keys(FORGE_DATA).forEach(key =>{
    const group = document.createElement('div');
    group.className = 'value-input-group';

    group.innerHTML = `
      <label class="value-label">${FORGE_DATA[key].name}</label>
      <div class="value-input-wrapper">
        <input
          type="number"
          class="value-input"
          data-step="${key}"
          value="${FORGE_DATA[key].value}"
          onchange="updateForgeValue(this)"
        />
      </div>
    `;
    grid.appendChild(group);
  })

}

function updateForgeValue(input) {
  const stepId = input.dataset.step;
  FORGE_DATA[stepId].value = parseInt(input.value) || 0;
  renderValues();
  clearAllRecipe();
}

function renderForgeDraggableOptions() {
  const grid = document.getElementById('options-grid');
  grid.innerHTML = '';

  for (const key of Object.keys(FORGE_DATA)) {
    if (key === 'medium_hit' || key === 'hard_hit') continue;

    const draggable = document.createElement('div');
    draggable.className = 'forge-option-dragg';
    draggable.setAttribute('data-color', FORGE_DATA[key].color);
    draggable.draggable = true;
    draggable.dataset.stepId = key;

    const displayName = (key === 'light_hit') ? 'Hit' : FORGE_DATA[key].name;

    if (key==='light_hit'){
      draggable.setAttribute('data-color', "grey");
      draggable.innerHTML = `
      <img class="step-icon" src="./Images/steps/hit_placeholder.png">
      <span>${displayName}</span>
    `;
    }
    else{
      draggable.innerHTML = `
      <img class="step-icon" src="${FORGE_DATA[key].icon}">
      <span>${displayName}</span>
    `;
    }

    

    draggable.addEventListener('dragstart', (e) => {
      draggedStep = key;
      e.dataTransfer.effectAllowed = 'copy';
    });

    draggable.addEventListener('click', () => {
      selectItem(draggable, 'step');
    });
    grid.appendChild(draggable);
  }
}

function renderPriorities() {
  const grid = document.getElementById('priority-grid');
  grid.innerHTML = '';

  Object.keys(PRIORITY_LEVELS).forEach(key =>{
    const draggable = document.createElement('div');
    draggable.className = 'priority-dragg';
    draggable.draggable = true;
    draggable.dataset.priority = key;

    draggable.innerHTML = `
      <img class="priority-icon" src="${PRIORITY_LEVELS[key].icon}">
      <span class="priority-number">${key}</span>
    `;

    draggable.addEventListener('dragstart', (e) => {
      draggedPriority = key;
      e.dataTransfer.effectAllowed = 'copy';
    });

    draggable.addEventListener('click', () => {
      selectItem(draggable, 'priority');
    });


    grid.appendChild(draggable);
  })

}
let recipeState = [
    { step: null, priority: null }, 
    { step: null, priority: null }, 
    { step: null, priority: null }  
];
function forge_step_calculate(){
  const btn = document.getElementById('forge-calc-btn');
  const resultsWrap=document.getElementById('forge-results-wrap');
  const warning = document.getElementById('forge-warning');
  if(btn) btn.disabled = true;
  warning.classList.add('hidden');
  warning.innerHTML = ''
  resultsWrap.classList.add('hidden'); 
  for (const slot of recipeState) {
    if (slot.step === null || slot.priority === null) {
      
      warning.innerHTML = `
          <h3 style="margin-top:0; color:#E76F51;">Please define both a step and priority for all 3 slots.</h3>
        
        `;
      warning.classList.remove('hidden');
      btn.disabled = false;
      warning.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  }

  //target position to go
  let sum_items = 0
  for (const slot of recipeState) {
    const current_value=FORGE_DATA[slot.step].value
    sum_items=sum_items-current_value
  }
  
  function priority_warning(priority, problem, problem2=''){
    if (problem2!==''){
      warning.innerHTML = `
          <h3 style="margin-top:0; color:#E76F51;">Please define a valid priority, currently
          '${priority}' overlaps with '${problem}' and ${problem2}'
          </h3>
        `;
    }else{
      warning.innerHTML = `
          <h3 style="margin-top:0; color:#E76F51;">Please define a valid priority, currently
          '${priority}' overlaps with '${problem}'
          </h3>
        `;
    }
    
    
    warning.classList.remove('hidden');
    btn.disabled = false;
    warning.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  let last_steps = [null, null, null]
  let last_steps_priority = [null,null,null]
  
  const fixedPriorities = {
    'third_last': 0,
    'second_last': 1,
    'last': 2
  }

  
  let workingState = recipeState.map(slot => ({ ...slot }));



  for (let i = workingState.length - 1; i >= 0; i--) {
    let priority = workingState[i].priority
    if (priority in fixedPriorities) {
      const idx = fixedPriorities[priority]
      if (last_steps[idx] !== null) {
        
        priority_warning(priority, workingState[i].priority)
        return
      }
      last_steps[idx] = workingState[i].step
      last_steps_priority[idx] = workingState[i].priority
      workingState.splice(i, 1);
    
    }
  } 

  
  for (let i = workingState.length - 1; i >= 0; i--) {
    let priority = workingState[i].priority
    
    if (priority === 'not_last') {
      const idx = last_steps[0] === null ? 0 : last_steps[1] === null ? 1 : -1
      if (idx === -1) {
        
        priority_warning(priority, last_steps_priority[0], last_steps_priority[1])
        return
      }
      last_steps[idx] = workingState[i].step
      last_steps_priority[idx] = workingState[i].priority
      workingState.splice(i, 1);
    }

  }


  for (let i = workingState.length - 1; i >= 0; i--) {
      let priority = workingState[i].priority
      const idx = last_steps.findIndex(s => s === null)
      if (idx !== -1) {
        last_steps[idx] =workingState[i].step
        workingState.splice(i, 1);
      }
  }

  
  // Implement greedy arlgoithm

  const sortedForgeData = Object.entries(FORGE_DATA)
  .map(([key, data]) => ({ key, ...data }))
  .sort((a, b) => a.value - b.value);

  let results=[]
  
  // target sum_items = 0
  
  console.log("Target prev_steps = "+sum_items)
  console.log("Last steps: "+last_steps)
  const target=sum_items
  
  // TODO SELECT THE LAST VALUE FORM HITS
  let prev_steps=[]


  // prev_steps=GreedyAlgorithm(target,FORGE_DATA)
  prev_steps=short_path(target,FORGE_DATA)
  
  
  results=prev_steps.concat(last_steps)
  
  renderResultsTable(results);
  if(btn) btn.disabled = false;


}
function renderResultsTable(steps) {
  const table = document.getElementById('step-data-table');
  const resultsWrap = document.getElementById('forge-results-wrap');
  const pointsCount = document.getElementById('step-points-count');
  
  table.innerHTML = '';
  
  // Header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>#</th>
      <th>Step</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Body
  const tbody = document.createElement('tbody');
  
  console.log(steps)
  steps.forEach((stepKey, index) => {
    const stepData = FORGE_DATA[stepKey];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${stepData.icon}" alt="${stepData.name}" style="width: 24px; height: 24px;">
          <span>${stepData.name}</span>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  
  // Update points count
  pointsCount.textContent = `${steps.length} steps`;
  
  // Show results section
  resultsWrap.classList.remove('hidden');

  
  toggleStepTable()
  resultsWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
}





function toggleStepTable() {

  const body=document.getElementById('step-table-body')
  const button=document.getElementById('step-table-toggle')
  
  if (!button.classList.contains('open')){
    body.classList.toggle('open');  
    button.classList.toggle('open');
  }

}



function clearAllRecipe() {
 
  const stepSlots = document.querySelectorAll('.slot-step');
  stepSlots.forEach(slot => {
    slot.innerHTML = ''; 
    slot.style.border=''
    slot.style.borderRadius = '';

    
  });

 
  const prioritySlots = document.querySelectorAll('.slot-priority');
  prioritySlots.forEach(slot => {
    slot.innerHTML = ''; 
    slot.style.border = ''; 
  });

  
  recipeState = [
    { step: null, priority: null }, 
    { step: null, priority: null }, 
    { step: null, priority: null }  ];
  
  
  // updateAllCanvases(); 
}


document.addEventListener('DOMContentLoaded', () => {

    const clearBtn = document.querySelector('.btn-clear-all');
    if(clearBtn) {
        clearBtn.addEventListener('click', clearAllRecipe);
    }
    
});



function handleStepDrop(e,slot) {
  e.preventDefault();


  if (!currentDragInfo || currentDragInfo.type !== 'step') return;
  
  const mobileQuery = window.matchMedia('(max-width: 768px)');

  const step_inner = e.currentTarget;
  step_inner.innerHTML = ''; 
  const cloned = currentDragInfo.element.cloneNode(true);
  cloned.style.margin = '0';
  cloned.style.opacity = '1';
  cloned.draggable = false;
  cloned.style.cursor = 'default';
  cloned.style.pointerEvents = 'none'; 
  slot.style.border = "none"
  cloned.classList.remove('selected');
  if (mobileQuery.matches) cloned.style.aspectRatio = '';
  else cloned.style.aspectRatio = '1'
  
  step_inner.appendChild(cloned);

  recipeState[slot.dataset.slot].step=e.target.children[0].dataset.stepId
  const span = cloned.querySelector('span');
  if (span){
    const currentText = span.innerHTML
    current_value=FORGE_DATA[e.target.children[0].dataset.stepId].value
    if (currentText==='Hit'){
      span.innerHTML=`${currentText}`
    }
    else{
      if (current_value >0){
      span.innerHTML=`${currentText} +${current_value}`
    }
    else{
      span.innerHTML=`${currentText} ${current_value}`
    }
    } 
  }
  
}

function handlePriorityDrop(e,slot) {
  e.preventDefault();
  
  
  if (!currentDragInfo ||currentDragInfo.type !== 'priority') return;
  const priority_inner = e.currentTarget;
  priority_inner.innerHTML = '';
  const cloned = currentDragInfo.element.cloneNode(true);
  cloned.style.margin = '0';
  cloned.style.opacity = '1';
  cloned.draggable = false;
  cloned.style.cursor = 'default';
  cloned.style.pointerEvents = 'none'; 
  cloned.style.border='none'
  cloned.classList.remove('selected');
  slot.style.border = "none"
  priority_inner.appendChild(cloned);

  recipeState[slot.dataset.slot].priority=e.target.children[0].dataset.priority
  
}
// currentDragInfo = {
//             element: selectedItem.element,
//             type: selectedItem.type,
//             id: selectedItem.element.dataset.stepId
//         };

let currentDragInfo = {
            element: null,
            type: null,
            id: null
        };
function selectItem(element, type) {
  
  clearSelection();
  
  currentDragInfo = {
            element: element,
            type: type,
            id: element.dataset
        };
  element.classList.add('selected');
}

function clearSelection() {
  if (currentDragInfo.id!== null) {
    currentDragInfo.element.classList.remove('selected');
    currentDragInfo = {
            element: null,
            type: null,
            id: null
        };;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // renderValues();
  renderForgeDraggableOptions();
  renderPriorities();

  const steps_draggables=document.querySelectorAll('.forge-option-dragg');

  steps_draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', (e) => {
      selectItem(draggable,'step')
      e.dataTransfer.effectAllowed = 'copy'; 
      
      currentDragInfo = {
            element: draggable,
            type: 'step',
            id: draggable.dataset
        };
      e.target.style.opacity = '1';
    });

    draggable.addEventListener('dragend', (e) => {
      e.target.style.opacity = '1';
    });
  });

  const priority_draggables=document.querySelectorAll('.priority-dragg');

  priority_draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', (e) => {
      selectItem(draggable,'priority')
      e.dataTransfer.effectAllowed = 'copy'; 
      
      currentDragInfo = {
            element: draggable,
            type: 'priority',
            id: draggable.dataset
        };
      
      e.target.style.opacity = '1';
    });

    draggable.addEventListener('dragend', (e) => {
      e.target.style.opacity = '1';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') clearSelection();
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.forge-option-dragg, .priority-dragg, .recipe-slot')) {
      clearSelection();
    }
  });
  

  document.querySelectorAll('.slot-step').forEach(slot => {
      slot.addEventListener('click', e =>{
        handleStepDrop(e, slot);
      }); 

      slot.addEventListener('dragover', e => e.preventDefault()); 
      slot.addEventListener('drop', (e)=>{handleStepDrop(e,slot)});
  });

  document.querySelectorAll('.slot-priority').forEach(slot => {
      slot.addEventListener('click', e =>{
        handlePriorityDrop(e, slot);
      }); 

      slot.addEventListener('dragover', e => e.preventDefault()); 
      slot.addEventListener('drop', (e)=>{handlePriorityDrop(e,slot)});
  });



});
