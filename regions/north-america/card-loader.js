/**
 * 物流卡片加载器
 * 用于动态加载物流卡片信息
 */

// 初始化函数
function initCardLoader() {
    refreshCards();
    
    // 添加刷新按钮事件
    const refreshBtn = document.getElementById('refresh-cards-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.classList.add('rotating');
            refreshCards();
            
            // 移除旋转动画
            setTimeout(() => {
                this.classList.remove('rotating');
            }, 1000);
        });
    }
    
    // 自动刷新
    setInterval(refreshCards, 30000);
}

// 刷新卡片
function refreshCards() {
    const cardContainerRows = document.querySelectorAll('.showcase-row');
    
    if (!cardContainerRows.length) return;
    
    // 请求路由数据的入口点
    fetch('card-loader.js?cacheBuster=' + Date.now(), {
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        },
        cache: 'no-store'
    })
    .then(response => {
        console.log("Card refresh triggered");
        const cardsData = [
            {
                id: 'usa-air',
                title: '美国商业件空运专线',
                image: 'https://example.com/usa-air.jpg',
                desc: '专业提供美国空运服务，主要承接：电子产品、服装、箱包等。',
                features: [
                    '<i class="fas fa-plane-departure"></i> 覆盖范围：纽约、洛杉矶、芝加哥、迈阿密主要城市及周边。'
                ],
                tags: ['商业地址', '空运'],
                isHot: true
            },
            {
                id: 'ca-fba',
                title: '加拿大FBA专线',
                image: 'https://example.com/ca-fba.jpg',
                desc: '专注小批量快速空运，主要承接：电子产品、服装、普货。',
                features: [
                    '<i class="fas fa-medal"></i> 覆盖全加拿大亚马逊FBA仓库，提供专业入仓服务。'
                ],
                tags: ['FBA专线', '加拿大'],
                isHot: true
            },
            {
                id: 'canada-sea',
                title: '加拿大商业件大件海运专线',
                image: 'https://example.com/canada-sea.jpg',
                desc: '专业提供加拿大全境海运服务，适合大宗货物。',
                features: [
                    '<i class="fas fa-medal"></i> 重点覆盖：温哥华、多伦多、蒙特利尔主要港口。'
                ],
                tags: ['商业地址', '大件海运', '加拿大'],
                isHot: true
            },
            {
                id: 'fba',
                title: '北美FBA专线',
                image: 'https://example.com/fba.jpg',
                desc: '专注小批量快速空运，主要承接：电子产品、服装、箱包等。',
                features: [
                    '<i class="fas fa-medal"></i> 覆盖范围：所有北美亚马逊FBA仓库，支持空运、海运两种模式。'
                ],
                tags: ['FBA专线'],
                isHot: false
            },
            {
                id: 'mexico',
                title: '墨西哥专线',
                image: 'https://example.com/mexico.jpg',
                desc: '提供墨西哥专线服务，包括空运和海运。',
                features: [
                    '<i class="fas fa-medal"></i> 覆盖范围：墨西哥城、蒙特雷、瓜达拉哈拉等主要工业城市。'
                ],
                tags: ['商业地址', '墨西哥'],
                isHot: false
            }
        ];
        
        renderCards(cardsData);
    })
    .catch(error => {
        console.error('Error fetching cards:', error);
    });
}

// 渲染卡片到页面
function renderCards(cardsData) {
    const cardContainerRows = document.querySelectorAll('.showcase-row');
    
    if (!cardContainerRows.length || !cardsData.length) return;
    
    // 清空所有行
    cardContainerRows.forEach(row => {
        row.innerHTML = '';
    });
    
    // 对每行进行处理
    cardContainerRows.forEach((row, rowIndex) => {
        // 计算当前行应该显示的卡片
        const startIdx = rowIndex * 2;
        const endIdx = startIdx + 2;
        const rowCards = cardsData.slice(startIdx, endIdx);
        
        // 渲染当前行的卡片
        rowCards.forEach(card => {
            const cardHtml = generateCardHtml(card);
            row.innerHTML += cardHtml;
        });
    });
}

// 生成卡片HTML
function generateCardHtml(card) {
    const tagsHtml = card.tags.map(tag => 
        `<span class="showcase-tag"><i class="fas fa-tag"></i> ${tag}</span>`
    ).join('');
    
    const featuresHtml = card.features.map(feature => 
        `<p>${feature}</p>`
    ).join('');
    
    const hotTagHtml = card.isHot ? '<div class="hot-tag">HOT</div>' : '';
    
    return `
    <div class="showcase-card">
        ${hotTagHtml}
        <div class="showcase-image">
            <img src="../../assets/images/air-freight.png" alt="${card.title}">
        </div>
        <div class="showcase-content">
            <div class="tags-container">
                ${tagsHtml}
            </div>
            <h3 class="showcase-title">${card.title}</h3>
            <div class="route-features">
                <p><i class="fas fa-circle-info"></i> ${card.desc}</p>
                ${featuresHtml}
            </div>
            <button class="ai-price-btn" onclick="window.location.href='ai-pricing.html?id=${card.id}'"><i class="fas fa-robot"></i> AI在线查价</button>
        </div>
    </div>
    `;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initCardLoader); 