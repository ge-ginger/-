// script.js 完整修正版
console.log("檔案讀取中..."); 

let copypastaData = []; 
let sortedTagsList = []; // 全域保存計算與排序後的標籤清單

// 1. 初始化：當網頁載入後，去抓取 JSON 資料
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

// 2. 非同步抓取資料庫
async function fetchData() {
    console.log("1. 程式啟動，準備抓取資料...");
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error("找不到 data.json");
        copypastaData = await response.json();
        console.log("2. 資料載入成功，共", copypastaData.length, "筆");
        
        // 【安全機制】預設過濾掉含有 nsfw 標籤的文章
        const safeData = copypastaData.filter(item => !item.tags || !item.tags.includes('nsfw'));
        displayPastas(safeData, false);
    } catch (e) {
        console.error("載入失敗:", e);
        const countNum = document.getElementById('pastaCount');
        if (countNum) countNum.innerText = "ERR";
    }
}

// 3. 統一的顯示與渲染函數
function displayPastas(data, isSearching = false) {
    console.log("正在渲染，資料長度:", data.length, "是否搜尋:", isSearching);

    const countNum = document.getElementById('pastaCount');
    const countType = document.getElementById('countType');

    if (countNum) {
        countNum.innerText = data.length;
    }
    if (countType) {
        // 若非搜尋狀態且目前未顯示特定標籤，切換回「當前全部」
        if (!isSearching && countType.innerText.indexOf('標籤') === -1) {
            countType.innerText = "當前全部";
        } else if (isSearching) {
            countType.innerText = "搜尋結果";
        }
    }

    const grid = document.getElementById('libraryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (data.length === 0) {
        grid.innerHTML = '<div class="no-results">查無相關內容... (´;ω;`)</div>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') {
                openModal(item.title, item.content, item.tags);
            }
        };

        card.innerHTML = `
            <div class="card-title">${item.title}</div>
            <div class="card-content">${item.content}</div>
            <div class="card-tags">
                ${(item.tags || []).map(t => `<span class="tag">#${t}</span>`).join('')}
            </div>
            <div class="card-footer">
                <button class="copy-btn">複製內容</button>
            </div>
        `;

        const btn = card.querySelector('.copy-btn');
        btn.onclick = (e) => {
            e.stopPropagation(); 
            copyToClipboard(item.content, e);
        };

        grid.appendChild(card);
    });
}

// 4. 搜尋功能 (主搜尋框同樣預設排除 nsfw)
function searchCopypasta() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    // 基底資料排除 nsfw
    const safeData = copypastaData.filter(item => !item.tags || !item.tags.includes('nsfw'));

    if (searchTerm === "") {
        displayPastas(safeData, false);
        const countType = document.getElementById('countType');
        if (countType) countType.innerText = "當前全部";
        return;
    }

    const filteredResults = safeData.filter(item => {
        return (
            item.title.toLowerCase().includes(searchTerm) ||
            item.content.toLowerCase().includes(searchTerm) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
        );
    });

    displayPastas(filteredResults, true);
}

// 5. 複製功能
function copyToClipboard(text, event) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = '已複製！';
        btn.style.backgroundColor = '#2ecc71';
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = '';
        }, 1500);
    });
}

// 6. 彈窗控制邏輯
function openModal(title, content, tags) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalTags = document.getElementById('modalTags');

    if (modalTitle) modalTitle.innerText = title;
    if (modalBody) modalBody.innerText = content;

    if (modalTags) {
        modalTags.innerHTML = ''; 
        if (tags && tags.length > 0) {
            tags.forEach(t => {
                const span = document.createElement('span');
                span.className = 'tag';
                span.innerText = `#${t}`;
                modalTags.appendChild(span);
            });
            modalTags.style.display = 'flex';
        } else {
            modalTags.style.display = 'none';
        }
    }
    const modalCopyBtn = document.getElementById('modalCopyBtn');
    if (modalCopyBtn) {
        modalCopyBtn.onclick = (e) => {
            copyToClipboard(content, e);
        };
    }

    const modal = document.getElementById('copyModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('copyModal');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

window.onclick = function(event) {
    const modal = document.getElementById('copyModal');
    if (event.target == modal) {
        closeModal();
    }
};

// --- 功能 1: 隨機抽一則 (安全機制：排除 nsfw) ---
function getRandomPasta() {
    const safeData = copypastaData.filter(item => !item.tags || !item.tags.includes('nsfw'));
    if (safeData.length === 0) return;
    const randomIndex = Math.floor(Math.random() * safeData.length);
    const item = safeData[randomIndex];
    openModal(item.title, item.content, item.tags);
}

// --- 功能 2: 標籤篩選與即時搜尋 ---
function showTagFilter() {
    const tagPicker = document.getElementById('tagPicker');
    const tagSearchInput = document.getElementById('tagSearchInput');
    if (tagSearchInput) tagSearchInput.value = ''; // 每次打開先清空搜尋框

    // 統計每個標籤出現的次數
    let tagCounts = {};
    copypastaData.forEach(item => {
        if (item.tags) {
            item.tags.forEach(t => {
                tagCounts[t] = (tagCounts[t] || 0) + 1;
            });
        }
    });

    // 轉為陣列並依照數量由大到小排序 (同時帶有數量標示)
    sortedTagsList = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    // 渲染初始完整的標籤雲
    renderTagCloud('');

    if (tagPicker) tagPicker.style.display = 'flex';
}

// 動態渲染標籤雲
function renderTagCloud(searchTerm = '') {
    const tagCloud = document.getElementById('tagCloud');
    if (!tagCloud) return;

    tagCloud.innerHTML = '<span class="tag" onclick="filterByTag(\'\')">顯示全部</span>';

    sortedTagsList.forEach(([tag, count]) => {
        // 根據輸入框內容進行過濾比對
        if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
            const span = document.createElement('span');
            span.className = 'tag';
            span.innerText = `#${tag} (${count})`;
            span.onclick = () => filterByTag(tag);
            tagCloud.appendChild(span);
        }
    });
}

// 標籤輸入框觸發的搜尋事件
function searchTags() {
    const input = document.getElementById('tagSearchInput');
    if (input) {
        renderTagCloud(input.value.trim());
    }
}

// 點擊標籤後的篩選行為
function filterByTag(tag) {
    hideTagFilter();
    const countType = document.getElementById('countType');
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = ''; // 切換標籤時自動清空主搜尋框

    if (tag === '') {
        // 點選「顯示全部」回到預設安全模式 (不含 nsfw)
        const safeData = copypastaData.filter(item => !item.tags || !item.tags.includes('nsfw'));
        displayPastas(safeData, false);
        if (countType) countType.innerText = "當前全部";
        return;
    }
    
    // 【解鎖機制】篩選出指定標籤（若使用者點選 nsfw 標籤，這時就會順利顯示出來）
    const filtered = copypastaData.filter(item => item.tags && item.tags.includes(tag));
    if (countType) countType.innerText = `標籤: ${tag}`;
    displayPastas(filtered, false);
}

function hideTagFilter() {
    const tagPicker = document.getElementById('tagPicker');
    if (tagPicker) tagPicker.style.display = 'none';
}

// --- 功能 3: 深色模式切換 ---
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.innerText = newTheme === 'dark' ? '☀️' : '🌙';
    
    localStorage.setItem('theme', newTheme);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) themeToggle.innerText = '☀️';
    }
});