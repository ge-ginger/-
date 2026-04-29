let copypastaData = []; // 用來存放從 JSON 讀取回來的資料

// 1. 初始化：當網頁載入後，去抓取 JSON 資料
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

// 2. 非同步抓取資料庫
async function fetchData() {
    try {
        // 讀取同資料夾下的 data.json
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error('無法讀取資料庫檔案');
        }
        
        copypastaData = await response.json();
        
        // 抓到資料後，第一次渲染網頁
        displayPastas(copypastaData);
    } catch (error) {
        console.error('錯誤:', error);
        document.getElementById('libraryGrid').innerHTML = 
            `<div class="no-results">資料庫連線失敗，請檢查 data.json 是否存在。</div>`;
    }
}

// 3. 渲染卡片 (保持不變)
function displayPastas(data) {
    const grid = document.getElementById('libraryGrid');
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = '<div class="no-results">查無相關複製文... (´;ω;`)</div>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-title">${item.title}</div>
            <div class="card-content">${item.content}</div>
            <div class="card-footer">
                <div>
                    ${item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
                <button class="copy-btn" onclick="copyToClipboard(\`${item.content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, event)">複製</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 4. 搜尋功能
function searchCopypasta() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filteredResults = copypastaData.filter(item => {
        return (
            item.title.toLowerCase().includes(searchTerm) ||
            item.content.toLowerCase().includes(searchTerm) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    });

    displayPastas(filteredResults);
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

    if (modalTags) {
        // 清空舊標籤並加入新標籤
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

    document.getElementById('copyModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
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