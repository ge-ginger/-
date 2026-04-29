console.log("檔案讀取中..."); // 測試點 1
let copypastaData = []; // 用來存放從 JSON 讀取回來的資料

// 1. 初始化：當網頁載入後，去抓取 JSON 資料
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

// 2. 非同步抓取資料庫
async function fetchData() {
    console.log("1. 程式啟動，準備抓取資料...");
    
    try {
        const response = await fetch('data.json');
        copypastaData = await response.json();
        displayPastas(copypastaData, false);
    } catch (e) {
        console.error(e);
    }
}

function displayPastas(data, isSearching) {
    console.log("正在渲染，資料長度:", data.length); // 測試點 3
    document.getElementById('pastaCount').innerText = data.length;
    // ... 剩下的 code

    
}

// 3. 渲染卡片 (保持不變)
function displayPastas(data) {
    // 更新標題旁邊的總數顯示
    const countElement = document.getElementById('pastaCount');
    if (countElement) {
        countElement.innerText = `${data.length} 則`;
    }

    const grid = document.getElementById('libraryGrid');
    grid.innerHTML = '';
    
    // ... 原本渲染卡片的程式碼 ...
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // 點擊卡片開啟彈窗 (傳入完整的 item.tags)
        card.onclick = (e) => {
            if (e.target.tagName !== 'BUTTON') {
                openModal(item.title, item.content, item.tags);
            }
        };

        // 建立內部結構
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

        // 獨立綁定按鈕點擊事件，避免轉義字元問題
        const btn = card.querySelector('.copy-btn');
        btn.onclick = (e) => {
            e.stopPropagation(); // 阻止觸發卡片彈窗
            copyToClipboard(item.content, e);
        };

        grid.appendChild(card);
    });
}

// 4. 搜尋功能
// 修改後的搜尋函數
function searchCopypasta() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    // 如果搜尋框是空的，直接顯示全部資料
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

    // 顯示過濾後的結果，並標記為「搜尋中」
    displayPastas(filteredResults, true);
}

// 修改後的顯示函數
function displayPastas(data, isSearching = false) {
    // 【關鍵修改 1】優先更新數字
    const countNumberElement = document.getElementById('pastaCount');
    const countTypeElement = document.getElementById('countType');

    if (countNumberElement) {
      countNum.innerText = data.length;
    }
    
    if (countTypeElement) {
        countTypeElement.innerText = isSearching ? "搜尋結果" : "全部";
    }

    // 【關鍵修改 2】清空與渲染
    const grid = document.getElementById('libraryGrid');
    if (grid) {
        grid.innerHTML = '';
        }
    
    if (!data || data.length === 0) {
        grid.innerHTML = '<div class="no-results">查無相關內容...</div>';
        return;
    }

    // 渲染卡片邏輯 (確保這段沒有語法錯誤導致執行中斷)
    data.forEach(item => {
        try {
            const card = document.createElement('div');
            card.className = 'card';
            // ... 你之前的卡片建立代碼 ...
            grid.appendChild(card);
        } catch (e) {
            console.error("渲染單個卡片時出錯:", e);
        }
    });
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
// 修改渲染卡片的迴圈部分
function displayPastas(data) {
    const grid = document.getElementById('libraryGrid');
    grid.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        // 點擊卡片本體（非按鈕）時放大檢視
        // ... 在渲染迴圈內
        card.onclick = (e) => {
        if (e.target.tagName !== 'BUTTON') {
        // 多傳入 item.tags
        openModal(item.title, item.content, item.tags);
    }
};

        card.innerHTML = `
            <div class="card-title">${item.title}</div>
            <div class="card-content">${item.content}</div>
            <div class="card-tags">
                ${item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
            </div>
            <div class="card-footer">
                <button class="copy-btn" onclick="copyToClipboard(\`${item.content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, event)">複製內容</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 彈窗控制邏輯
function openModal(title, content, tags) {
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalTags = document.getElementById('modalTags');

    if (modalTitle) modalTitle.innerText = title;
    if (modalBody) modalBody.innerText = content;

    // 處理展開後的標籤
    if (modalTags) {
        modalTags.innerHTML = ''; // 先清空舊的
        if (tags && tags.length > 0) {
            tags.forEach(t => {
                const span = document.createElement('span');
                span.className = 'tag'; // 這會套用我們上面寫的 #modalTags .tag 樣式
                span.innerText = `#${t}`;
                modalTags.appendChild(span);
            });
            modalTags.style.display = 'flex';
        } else {
            modalTags.style.display = 'none';
        }
    }

    const modal = document.getElementById('copyModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 禁止背景捲動
    }
}

function closeModal() {
    document.getElementById('copyModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 點擊彈窗外部也可關閉
window.onclick = function(event) {
    const modal = document.getElementById('copyModal');
    if (event.target == modal) {
        closeModal();
    }
}
window.onload = () => {
    fetchData();
};
fetchData();