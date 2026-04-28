// 複製文 JSON 資料庫
const copypastaData = [
    {
        "id": 1,
        "title": "無情開噴",
        "content": "真的太無情了！無情轉身、無情開噴！",
        "category": "迷因",
        "tags": ["張家航", "無情", "直播"]
    },
    {
        "id": 2,
        "title": "道理大師",
        "content": "雖然我不知道你在說什麼，但聽起來很有道理。",
        "category": "萬用",
        "tags": ["回覆", "敷衍"]
    },
    {
        "id": 3,
        "title": "工程師心聲",
        "content": "我這輩子最討厭兩件事：\n1. 別人寫程式不寫註解。\n2. 叫我寫註解。",
        "category": "職場",
        "tags": ["工程師", "幽默"]
    }
];

// 初始化顯示
document.addEventListener('DOMContentLoaded', () => {
    displayPastas(copypastaData);
});

// 渲染卡片函數
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
                <button class="copy-btn" onclick="copyToClipboard(\`${item.content}\`)">複製</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 搜尋處理
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

// 複製到剪貼簿
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // 使用更精緻的提示方式取代 alert
        const btn = event.target;
        const originalText = btn.innerText;
        btn.innerText = '已複製！';
        btn.style.backgroundColor = '#2ecc71';
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = '';
        }, 1500);
    }).catch(err => {
        console.error('複製失敗', err);
    });
}