// script.js 完整修正版
console.log("檔案讀取中..."); 

let copypastaData = []; 

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
        // 初始化顯示全部資料
        displayPastas(copypastaData, false);
    } catch (e) {
        console.error("載入失敗:", e);
        const countNum = document.getElementById('pastaCount');
        if (countNum) countNum.innerText = "ERR";
    }
}

// 3. 統一的顯示與渲染函數 (合併後的唯一版本)
function displayPastas(data, isSearching = false) {
    console.log("正在渲染，資料長度:", data.length, "是否搜尋:", isSearching);

    // 更新標題旁邊的總數顯示
    const countNum = document.getElementById('pastaCount');
    const countType = document.getElementById('countType');

    if (countNum) {
        countNum.innerText = data.length;
    }
    if (countType) {
        countType.innerText = isSearching ? "搜尋結果" : "當前全部";
    }

    const grid = document.getElementById('libraryGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (data.length === 0) {
        grid.innerHTML = '<div class="no-results">查無相關內容... (´;ω;`)</div>';
        return;
    }

    // 渲染卡片
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // 點擊卡片開啟彈窗 (確保傳入 tags)
        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') {
                openModal(item.title, item.content, item.tags);
            }
        };

        // 使用我們之前討論過的 Flex 佈局結構
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

        // 綁定複製按鈕事件
        const btn = card.querySelector('.copy-btn');
        btn.onclick = (e) => {
            e.stopPropagation(); // 阻止觸發彈窗
            copyToClipboard(item.content, e);
        };

        grid.appendChild(card);
    });
}

// 4. 搜尋功能
function searchCopypasta() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (searchTerm === "") {
        displayPastas(copypastaData, false);
        return;
    }

    const filteredResults = copypastaData.filter(item => {
        return (
            item.title.toLowerCase().includes(searchTerm) ||
            item.content.toLowerCase().includes(searchTerm) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
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
        // 每次打開彈窗時，更新按鈕要複製的內容
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
    document.getElementById('copyModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 點擊彈窗外部關閉
window.onclick = function(event) {
    const modal = document.getElementById('copyModal');
    if (event.target == modal) {
        closeModal();
    }
};
// --- 功能 1: 隨機抽一則 ---
function getRandomPasta() {
    if (copypastaData.length === 0) return;
    const randomIndex = Math.floor(Math.random() * copypastaData.length);
    const item = copypastaData[randomIndex];
    openModal(item.title, item.content, item.tags);
}

// --- 功能 2: 標籤篩選 ---
// --- 功能 2: 標籤篩選 (升級版：計算數量並排序) ---
function showTagFilter() {
    const tagPicker = document.getElementById('tagPicker');
    const tagCloud = document.getElementById('tagCloud');
    
    // 1. 統計每個標籤出現的次數
    let tagCounts = {};
    copypastaData.forEach(item => {
        if (item.tags) {
            item.tags.forEach(t => {
                tagCounts[t] = (tagCounts[t] || 0) + 1;
            });
        }
    });

    // 2. 將統計結果轉為陣列，並依照數量「由大到小」排序
    // 結果會變成類似這樣：[['copypasta', 25], ['學測', 10], ...]
    let sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

    // 3. 渲染到畫面上
    tagCloud.innerHTML = '<span class="tag" onclick="filterByTag(\'\')">顯示全部</span>';
    
    sortedTags.forEach(([tag, count]) => {
        const span = document.createElement('span');
        span.className = 'tag';
        // 順便把數量顯示出來，讓使用者知道這個標籤有幾篇文章！
        span.innerText = `#${tag} (${count})`; 
        span.onclick = () => filterByTag(tag);
        tagCloud.appendChild(span);
    });

    tagPicker.style.display = 'flex';
}

function filterByTag(tag) {
    hideTagFilter();
    if (tag === '') {
        displayPastas(copypastaData, false);
        return;
    }
    const filtered = copypastaData.filter(item => item.tags && item.tags.includes(tag));
    displayPastas(filtered, true);
    // 更新標題為標籤名稱
    document.getElementById('countType').innerText = `標籤: ${tag}`;
}

function hideTagFilter() {
    document.getElementById('tagPicker').style.display = 'none';
}

// --- 功能 3: 深色模式切換 ---
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    document.getElementById('themeToggle').innerText = newTheme === 'dark' ? '☀️' : '🌙';
    
    // 儲存設定到瀏覽器
    localStorage.setItem('theme', newTheme);
}

// 頁面載入時檢查深色模式設定
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerText = '☀️';
    }
});