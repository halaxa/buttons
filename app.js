const main = document.getElementById('main');
const btnView = document.getElementById('btnView');
const listView = document.getElementById('listView');
const tabs = [btnView, listView];
const storage = localStorage;

function getData() {
    return JSON.parse(storage.getItem('data') || '{}');
}

function setData(data) {
    storage.setItem('data', JSON.stringify(data));
}

function getList() {
    return (storage.getItem('list') || '').split('\n').filter(Boolean);
}

function setList(list) {
    storage.setItem('list', list.join('\n'));
}

function renderButtons() {
    const resetButton = `
        <div class="flex justify-end mb-2">
          <button onclick="resetCounts()" class="text-red-500 text-sm underline">Vynulovat vše</button>
        </div>
      `;
    setActiveTab('buttons');

    const area = document.getElementById('listArea');
    if (area) {
        const lines = area.value.split('\n').map(s => s.trim()).filter(Boolean);
        setList([...new Set(lines)]);
        cleanupData();
    }

    const data = getData();
    const list = getList();
    const entries = list.map(name => [name, data[name] || 0]);
    entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const itemsPerColumn = Math.ceil(entries.length / 2);

    const maxCount = Math.max(...entries.map(([_, c]) => c), 1);

    main.innerHTML = resetButton + `
        <div class="grid grid-cols-2 gap-2">
          ${entries.map(([name, count], i) => {
        const displayCount = count === 0 ? '' : count;
        const row = i % itemsPerColumn + 1;
        const col = Math.floor(i / itemsPerColumn) + 1;
        const progressPercent = Math.round((count / maxCount) * 100);
        return `
              <button style="grid-column: ${col}; grid-row: ${row};" class="bg-white border rounded-xl text-left px-4 pt-4 pb-2 text-xl flex flex-col justify-between items-start gap-2" onclick="increment('${name}')">
                <div class="w-full flex justify-between items-center">
                  <span>${name}</span>
                  <span class="font-bold">${displayCount}</span>
                </div>
                <div class="w-full h-1 bg-gray-200 rounded overflow-hidden">
                  <div class="bg-sky-500 h-full" style="width: ${progressPercent}%"></div>
                </div>
              </button>
            `;
    }).join('')}
        </div>
        <div class="h-[env(safe-area-inset-bottom,32px)]"></div>
      `;
}

function renderList() {
    setActiveTab('list');
    let list = getList().join('\n').replace(/\n+$/, '') + '\n';

    main.innerHTML = `
        <div class="relative h-full">
          <textarea class="w-full h-full p-4 text-lg" id="listArea">${list}</textarea>
          <button id="doneButton" class="hidden absolute top-2 right-4 text-blue-600 font-semibold">Hotovo</button>
        </div>
      `;

    const area = document.getElementById('listArea');
    const doneButton = document.getElementById('doneButton');
    area.addEventListener('focus', () => doneButton.classList.remove('hidden'));
    area.addEventListener('blur', () => doneButton.classList.add('hidden'));
    doneButton.addEventListener('click', () => area.blur());
    area.focus();
    area.setSelectionRange(area.value.length, area.value.length);
}

function increment(name) {
    const data = getData();
    data[name] = (data[name] || 0) + 1;
    setData(data);
    renderButtons();
}

function cleanupData() {
    const list = getList();
    const data = getData();
    const cleaned = {};
    list.forEach(name => {
        cleaned[name] = data[name] || 0;
    });
    setData(cleaned);
}

function resetCounts() {
    if (confirm('Opravdu vynulovat všechna počítadla?')) {
        const data = getData();
        for (const key in data) {
            data[key] = 0;
        }
        setData(data);
        renderButtons();
    }
}

function setActiveTab(active) {
    tabs.forEach(tab => {
        if (tab.dataset.tab === active) {
            tab.classList.add('bg-white', 'border-blue-500');
            tab.classList.remove('bg-gray-100');
        } else {
            tab.classList.remove('bg-white', 'border-blue-500');
            tab.classList.add('bg-gray-100');
        }
    });
}

btnView.onclick = renderButtons;
listView.onclick = renderList;
renderButtons();
