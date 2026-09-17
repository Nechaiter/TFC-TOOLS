export {}
const PRESET_A: number[] = [144, 36, 16];
const PRESET_B: number[] = [129, 31, 13];

const IRON_COLOR = '#E76F51';

let ironCoefficients: number[] = [129, 31, 13];


// ============================================================
// Types
// ============================================================

interface BloomeryResult {
    MB: number;
    coal: number;
    ingots: number;
    loss: number;
    iron_ore_count: number;
    var_counts: number[];
}

interface DesmosCalculator {
    setBlank(): void;

    setExpression(expression: {
        id: string;
        type: string;
        latex: string;
        color?: string;
        lineStyle?: unknown;
        pointStyle?: unknown;
        pointSize?: string;
    }): void;

    updateSettings(settings: {
        xAxisLabel: string;
        yAxisLabel: string;
        xAxisStep: number;
        yAxisStep: number;
    }): void;

    setMathBounds(bounds: {
        left: number;
        right: number;
        bottom: number;
        top: number;
    }): void;
}



declare const Desmos: {
    GraphingCalculator(
        element: HTMLElement,
        options: {
            keypad: boolean;
            expressions: boolean;
            settingsMenu: boolean;
        }
    ): DesmosCalculator;

    Colors: {
        RED: string;
        ORANGE: string;
        PURPLE: string;
    };

    Styles: {
        POINT: unknown;
    };
};


// ============================================================
// Utility
// ============================================================

function escHtml(str: string): string {
    const div = document.createElement('div');

    div.textContent = str;

    return div.innerHTML;
}


// ============================================================
// Coefficients
// ============================================================

function bloomeryRender(): void {
    const container = document.getElementById('iron-coeff-list');

    if (!container) return;

    container.innerHTML = '';

    ironCoefficients.forEach((c: number, idx: number) => {
        const row = document.createElement('div');

        row.className = 'coeff-row';

        const canRemove = ironCoefficients.length > 1;

        row.innerHTML = `
            <span class="coeff-tag">C${idx + 1}</span>

            <input
                type="number"
                min="0"
                value="${c}"
                data-cidx="${idx}"
                data-action="update-coeff"
            >

            ${
                canRemove
                    ? `
                        <button
                            class="coeff-remove"
                            data-action="remove-coeff"
                            data-cidx="${idx}"
                            aria-label="Remove coefficient ${idx + 1}"
                        >
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                            >
                                <path
                                    d="M3 6H9"
                                    stroke="currentColor"
                                    stroke-width="1.5"
                                    stroke-linecap="round"
                                />
                            </svg>
                        </button>
                    `
                    : ''
            }
        `;

        container.appendChild(row);
    });
}


function bloomeryUpdateCoeff(el: HTMLInputElement): void {
    const idx = parseInt(el.dataset.cidx ?? '0', 10);

    ironCoefficients[idx] = parseInt(el.value, 10) || 0;
}


function bloomeryAddCoeff(): void {
    ironCoefficients.push(0);

    bloomeryRender();
}


function bloomeryRemoveCoeff(idx: number): void {
    if (ironCoefficients.length > 1) {
        ironCoefficients.splice(idx, 1);

        bloomeryRender();
    }
}


function bloomeryApplyPreset(preset: string): void {
    ironCoefficients =
        preset === 'A'
            ? [...PRESET_A]
            : [...PRESET_B];

    bloomeryRender();
}


// ============================================================
// Desmos
// ============================================================

const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));


let bloomeryCalculator: DesmosCalculator | undefined;


function initBloomeryDesmos(): void {
    const elt = document.getElementById('bloomery-calculator');

    if (!elt) return;

    bloomeryCalculator = Desmos.GraphingCalculator(elt, {
        keypad: false,
        expressions: false,
        settingsMenu: true
    });
}


function updateBloomeryGraph(results: BloomeryResult[]): void {
    const elt = document.getElementById('bloomery-calculator');

    if (!elt) return;

    if (!bloomeryCalculator) {
        initBloomeryDesmos();
    }

    if (!bloomeryCalculator) return;

    bloomeryCalculator.setBlank();

    const xData: number[] = results.map(
        p => p.iron_ore_count
    );

    const yData: number[] = results.map(
        p => p.ingots
    );


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


// ============================================================
// Calculation
// ============================================================

async function bloomeryCalculate(): Promise<void> {
    const btn = document.getElementById(
        'bloomery-calc-btn'
    ) as HTMLButtonElement | null;

    const resultsWrap = document.getElementById(
        'bloomery-results-wrap'
    );

    if (btn) {
        btn.disabled = true;
    }

    const originalContent = btn
        ? btn.innerHTML
        : 'Calculate';


    const updateStatus = async (msg: string): Promise<void> => {
        if (btn) {
            btn.innerHTML = `<span class="spinner"></span> ${msg}`;
        }

        await delay(10);
    };


    if (!resultsWrap) return;

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


async function performBloomeryCalculations(): Promise<BloomeryResult[]> {
    await delay(100);

    const results: BloomeryResult[] = [];

    const mbInput = document.getElementById(
        'mb-per-ingot'
    ) as HTMLInputElement | null;

    const MB_TO_INGOT: number = mbInput
        ? parseInt(mbInput.value, 10) || 144
        : 144;

    const MAX_TOTAL_ITEMS = 48;


    function cartesian_product(
        bounds: number[],
        callback: (solution: number[]) => void,
        current: number[] = [],
        index: number = 0
    ): void {

        if (index === bounds.length) {
            callback([...current]);
            return;
        }


        for (let i = 0; i <= bounds[index]; i++) {
            current[index] = i;

            cartesian_product(
                bounds,
                callback,
                current,
                index + 1
            );
        }
    }


    cartesian_product(
        ironCoefficients,
        (solution: number[]): void => {

            const sum_vars = solution.reduce(
                (a: number, b: number) => a + b,
                0
            );


            if (sum_vars >= MAX_TOTAL_ITEMS) return;

            if (sum_vars === 0) return;


            const sum_mb = solution.reduce(
                (a: number, b: number, i: number) =>
                    a + b * ironCoefficients[i],
                0
            );


            // We are putting more iron than coal can cover
            // with the left item space
            if (
                sum_mb /
                ((MAX_TOTAL_ITEMS - sum_vars) * MB_TO_INGOT)
                > 1
            ) {
                return;
            }


            // Search for multiples of 144
            const mb_loss = sum_mb % MB_TO_INGOT;

            if (mb_loss > 0) return;


            const coal_needed = sum_mb / MB_TO_INGOT;


            // We need more space to cover all the iron with coal
            if (
                coal_needed >
                (MAX_TOTAL_ITEMS - sum_vars)
            ) {
                return;
            }


            const sol_point: BloomeryResult = {
                MB: sum_mb,
                coal: coal_needed,
                ingots: coal_needed,
                loss: mb_loss,
                iron_ore_count: sum_vars,
                var_counts: solution
            };


            results.push(sol_point);
        }
    );


    results.sort(
        (a: BloomeryResult, b: BloomeryResult): number => {

            if (b.ingots !== a.ingots) {
                return b.ingots - a.ingots;
            }

            if (a.iron_ore_count !== b.iron_ore_count) {
                return a.iron_ore_count - b.iron_ore_count;
            }

            return a.loss - b.loss;
        }
    );


    return results;
}


// ============================================================
// Rendering results
// ============================================================

function buildBloomeryDetail(
    item: BloomeryResult
): string {

    let html = '';


    const varParts = item.var_counts
        .map((v: number, ci: number): string => {

            if (v === 0) return '';


            const cLabel =
                ironCoefficients[ci] !== undefined
                    ? ironCoefficients[ci]
                    : '?';


            return `
                <span class="best-var">
                    ${cLabel}
                    <span class="best-times">x</span>
                    ${v}
                </span>
            `;

        })
        .filter((x: string): boolean => Boolean(x))
        .join('');


    html += `
        <div class="best-detail-row">
            ${varParts}
        </div>
    `;


    return html;
}


function renderBloomeryResults(
    results: BloomeryResult[]
): void {

    const wrap = document.getElementById(
        'bloomery-results-wrap'
    );

    if (!wrap) return;

    wrap.classList.remove('hidden');


    if (!results || results.length === 0) {

        const resultsLayout =
            document.querySelector<HTMLElement>(
                '.results-layout'
            );

        if (resultsLayout) {
            resultsLayout.style.display = 'none';
        }


        let noResults =
            document.getElementById(
                'bloomery-no-results'
            );


        if (!noResults) {

            noResults =
                document.createElement('div');

            noResults.id =
                'bloomery-no-results';

            noResults.style.cssText =
                'text-align:center;padding:40px 20px;color:#666;background:#f8f9fa;border-radius:8px;border:1px dashed #ccc;';

            noResults.innerHTML =
                '<h3 style="margin-top:0;color:#E76F51;">No valid combinations found</h3>';

            wrap.appendChild(noResults);
        }


        noResults.style.display = 'block';

        return;
    }


    const resultsLayout =
        document.querySelector<HTMLElement>(
            '.results-layout'
        );

    if (resultsLayout) {
        resultsLayout.style.display = '';
    }


    const noResults =
        document.getElementById(
            'bloomery-no-results'
        );

    if (noResults) {
        noResults.style.display = 'none';
    }


    const best: BloomeryResult = results[0];
    const top3: BloomeryResult[] = results.slice(0, 3);


    console.log(best);


    const bestIngots =
        document.getElementById('best-ingots');

    const bestOre =
        document.getElementById('best-ore');

    const bestMb =
        document.getElementById('best-mb');

    const bestCoal =
        document.getElementById('best-coal');

    const bestDetail =
        document.getElementById('best-detail');

    if (bestIngots) {
        bestIngots.textContent =
            String(best.ingots);
    }

    if (bestOre) {
        bestOre.textContent =
            String(best.iron_ore_count);
    }

    if (bestMb) {
        bestMb.textContent =
            String(best.MB);
    }

    if (bestCoal) {
        bestCoal.textContent =
            String(best.coal);
    }

    if (bestDetail) {
        bestDetail.innerHTML =
            buildBloomeryDetail(best);
    }


    const top3Grid =
        document.getElementById('top3-grid');

    if (!top3Grid) return;

    top3Grid.innerHTML = '';


    top3.forEach(
        (item: BloomeryResult, i: number): void => {

            const card =
                document.createElement('div');

            card.className = 'top3-card';


            card.innerHTML = `
                <span class="top3-badge">
                    #${i + 1}
                </span>

                <span class="top3-value">
                    ${item.ingots} ingots
                </span>

                <div class="top3-detail">
                    ${item.MB} mb,
                    ${item.coal} coal n.

                    <div class="top3-meta">
                        ${buildBloomeryDetail(item)}
                    </div>
                </div>
            `;


            top3Grid.appendChild(card);
        }
    );


    const pointsCount =
        document.getElementById(
            'bloomery-points-count'
        );

    if (pointsCount) {
        pointsCount.textContent =
            `${results.length} points`;
    }


    const table =
        document.getElementById(
            'bloomery-data-table'
        );

    if (!table) return;


    let headerHtml = '<thead><tr>';

    headerHtml +=
        '<th>#</th>' +
        '<th>Ingots</th>' +
        '<th>MB</th>' +
        '<th>Ore count</th>' +
        '<th>Coal n.</th>';


    ironCoefficients.forEach(
        (c: number, ci: number): void => {

            headerHtml += `
                <th style="color:${IRON_COLOR};">
                    x<sub>${ci + 1}</sub>
                    <span style="opacity:0.5;">
                        (${c})
                    </span>
                </th>
            `;
        }
    );


    headerHtml += '</tr></thead>';


    let bodyHtml = '<tbody>';


    results.forEach(
        (r: BloomeryResult, i: number): void => {

            const isTop = i < 3;

            const rowClass =
                isTop ? 'row-max' : '';

            const ingotsClass =
                isTop ? 'cell-max' : '';


            bodyHtml +=
                `<tr class="${rowClass}">`;

            bodyHtml +=
                `<td class="cell-muted">${i + 1}</td>`;

            bodyHtml += `
                <td
                    class="${ingotsClass}"
                    style="font-weight:600;"
                >
                    ${r.ingots}
                </td>
            `;

            bodyHtml += `<td>${r.MB}</td>`;

            bodyHtml +=
                `<td>${r.iron_ore_count}</td>`;

            bodyHtml +=
                `<td>${r.coal}</td>`;


            r.var_counts.forEach(
                (v: number): void => {
                    bodyHtml += `<td>${v}</td>`;
                }
            );


            bodyHtml += '</tr>';
        }
    );


    bodyHtml += '</tbody>';


    table.innerHTML =
        headerHtml + bodyHtml;


    wrap.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });


    updateBloomeryGraph(results);
}


// ============================================================
// UI
// ============================================================

function toggleBloomeryTable(): void {

    const toggle =
        document.getElementById(
            'bloomery-table-toggle'
        );

    const body =
        document.getElementById(
            'bloomery-table-body'
        );

    if (toggle) {
        toggle.classList.toggle('open');
    }

    if (body) {
        body.classList.toggle('open');
    }
}


// ============================================================
// Initialization
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    (): void => {
        bloomeryRender();

        document.getElementById('nav-back-menu')?.addEventListener('click', () => showView('menu'));
        document.getElementById('nav-alloys')?.addEventListener('click', () => showView('alloys'));
        document.getElementById('nav-forge')?.addEventListener('click', () => showView('forge'));
        document.getElementById('mb-preset-144')?.addEventListener('click', () => {
            (document.getElementById('mb-per-ingot') as HTMLInputElement).value = '144';
        });
        document.getElementById('mb-preset-100')?.addEventListener('click', () => {
            (document.getElementById('mb-per-ingot') as HTMLInputElement).value = '100';
        });
        document.getElementById('bloomery-add-coeff')?.addEventListener('click', bloomeryAddCoeff);
        document.getElementById('bloomery-preset-a')?.addEventListener('click', () => bloomeryApplyPreset('A'));
        document.getElementById('bloomery-preset-b')?.addEventListener('click', () => bloomeryApplyPreset('B'));
        document.getElementById('bloomery-calc-btn')?.addEventListener('click', bloomeryCalculate);
        document.getElementById('bloomery-table-toggle')?.addEventListener('click', toggleBloomeryTable);

        document.getElementById('mb-per-ingot')?.addEventListener('blur', (event) => {
            const input = event.currentTarget as HTMLInputElement;
            input.value = String(parseInt(input.value, 10) || 144);
        });

        document.getElementById('iron-coeff-list')?.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            const idx = parseInt(target.dataset.cidx ?? '', 10);
            if (target.dataset.action === 'update-coeff' && Number.isInteger(idx)) {
                bloomeryUpdateCoeff(target);
            }
        });
        document.getElementById('iron-coeff-list')?.addEventListener('click', (event) => {
            const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action="remove-coeff"]');
            if (target) bloomeryRemoveCoeff(parseInt(target.dataset.cidx ?? '', 10));
        });
    }
);
