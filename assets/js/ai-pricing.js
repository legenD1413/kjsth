/**
 * AI询价功能脚本
 * 提供路线数据和聊天功能
 */

// 预定义路线数据
const routeData = {
    'usa-air': {
        title: '美国商业件空运专线',
        isHot: true,
        welcomeMessage: '您好！我是您的专属物流顾问，很高兴为您提供美国空运专线的咨询服务。您可以询问我任何关于价格、时效、货物要求等方面的问题。',
        features: [
            '<i class="fas fa-bullseye"></i> 特点：小批量快速空运，主要承接：电子产品、服装、鞋帽、箱包等',
            '<i class="fas fa-clock"></i> 时效：5-7个工作日送达',
            '<i class="fas fa-dollar-sign"></i> 价格：$6.5-8.2/kg，根据货物体积重量计算',
            '<i class="fas fa-box"></i> 尺寸限制：单边不超过120cm，单件不超过50kg'
        ],
        advantages: [
            '<i class="fas fa-check"></i> 稳定可靠：多年运营经验，专业物流团队，高效处理各类货物',
            '<i class="fas fa-check"></i> 价格优势：直接对接海外合作伙伴，省去中间环节，提供更具竞争力的价格',
            '<i class="fas fa-check"></i> 全程跟踪：先进物流系统，实时追踪货物位置和状态',
            '<i class="fas fa-check"></i> 专业服务：一对一客服跟进，及时解决运输过程中的各类问题'
        ],
        notes: [
            '<i class="fas fa-exclamation-triangle"></i> 特殊货品（如电池、液体等）需提前告知，可能需要额外资料和费用',
            '<i class="fas fa-exclamation-triangle"></i> 运输时效受海关查验、天气等因素影响，可能有所波动',
            '<i class="fas fa-exclamation-triangle"></i> 请提供准确的收件人信息，错误信息可能导致派送延误',
            '<i class="fas fa-exclamation-triangle"></i> 大件物品请提前与客服确认尺寸和限制和附加费用'
        ],
        quickQuestions: [
            '美国空运价格是怎么计算的？',
            '从中国发货到美国需要多久？',
            '有没有特殊货物限制？',
            '如何跟踪我的货物？'
        ]
    },

    'ca-fba': {
        title: '加拿大FBA专线',
        isHot: true,
        welcomeMessage: '您好！我是您的专属亚马逊FBA物流顾问，很高兴为您提供加拿大FBA专线的咨询服务。您可以询问我任何关于价格、入仓要求、派送时效等方面的问题。',
        features: [
            '<i class="fas fa-bullseye"></i> 特点：小批量快速空运，主要承接：电子产品、服装、鞋帽、箱包等',
            '<i class="fas fa-clock"></i> 时效：5-7个工作日送达',
            '<i class="fas fa-dollar-sign"></i> 价格：$6.5-8.2/kg，根据货物体积重量计算',
            '<i class="fas fa-box"></i> 尺寸限制：单边不超过120cm，单件不超过50kg'
        ],
        advantages: [
            '<i class="fas fa-check"></i> 稳定可靠：多年运营经验，专业物流团队，高效处理各类货物',
            '<i class="fas fa-check"></i> 价格优势：直接对接海外合作伙伴，省去中间环节，提供更具竞争力的价格',
            '<i class="fas fa-check"></i> 全程跟踪：先进物流系统，实时追踪货物位置和状态',
            '<i class="fas fa-check"></i> 专业服务：一对一客服跟进，及时解决运输过程中的各类问题'
        ],
        notes: [
            '<i class="fas fa-exclamation-triangle"></i> 特殊货品（如电池、液体等）需提前告知，可能需要额外资料和费用',
            '<i class="fas fa-exclamation-triangle"></i> 运输时效受海关查验、天气等因素影响，可能有所波动',
            '<i class="fas fa-exclamation-triangle"></i> 请提供准确的收件人信息，错误信息可能导致派送延误',
            '<i class="fas fa-exclamation-triangle"></i> 大件物品请提前与客服确认尺寸和限制和附加费用'
        ],
        quickQuestions: [
            'FBA入仓需要办理哪些手续？',
            '亚马逊入仓时效是多少？',
            '如何提供FBA货件号？',
            '有代打标签服务吗？'
        ]
    },


    'usa-sea': {
        title: '美国海运专线',
        isHot: false,
        welcomeMessage: '您好！我是您的专属海运顾问，很高兴为您提供美国海运专线的咨询服务。您可以询问我关于整柜、拼箱、价格计算及清关事宜等任何问题。',
        features: [
            '<i class="fas fa-bullseye"></i> 特点：大批量经济海运，适合大宗货物、家居用品等',
            '<i class="fas fa-clock"></i> 时效：18-25天送达',
            '<i class="fas fa-dollar-sign"></i> 价格：$130-160/立方米',
            '<i class="fas fa-box"></i> 无严格尺寸限制，但超大件需提前咨询'
        ],
        advantages: [
            '<i class="fas fa-check"></i> 稳定可靠：多年运营经验，专业物流团队，高效处理各类货物',
            '<i class="fas fa-check"></i> 价格优势：直接对接海外合作伙伴，省去中间环节，提供更具竞争力的价格',
            '<i class="fas fa-check"></i> 全程跟踪：先进物流系统，实时追踪货物位置和状态',
            '<i class="fas fa-check"></i> 专业服务：一对一客服跟进，及时解决运输过程中的各类问题'
        ],
        notes: [
            '<i class="fas fa-exclamation-triangle"></i> 特殊货品（如电池、液体等）需提前告知，可能需要额外资料和费用',
            '<i class="fas fa-exclamation-triangle"></i> 运输时效受海关查验、天气等因素影响，可能有所波动',
            '<i class="fas fa-exclamation-triangle"></i> 请提供准确的收件人信息，错误信息可能导致派送延误',
            '<i class="fas fa-exclamation-triangle"></i> 大件物品请提前与客服确认尺寸和限制和附加费用'
        ],
        quickQuestions: [
            '海运价格是按重量还是体积计算？',
            '整柜和拼箱有什么区别？',
            '从哪些港口发货？',
            '特大件有什么额外要求？'
        ]
    },

    'canada-air': {
        title: '加拿大空运专线',
        isHot: true,
        welcomeMessage: '您好！我是您的专属加拿大空运顾问，很高兴为您提供专业的加拿大空运咨询。您可以询问我关于价格、派送时效、清关所需资料等任何问题。',
        features: [
            '<i class="fas fa-bullseye"></i> 特点：快速通关，适合电商卖家',
            '<i class="fas fa-clock"></i> 时效：5-8个工作日送达',
            '<i class="fas fa-dollar-sign"></i> 价格：$7.2-9.0/kg',
            '<i class="fas fa-box"></i> 提供商业清关和个人物品清关服务'
        ],
        advantages: [
            '<i class="fas fa-check"></i> 稳定可靠：多年运营经验，专业物流团队，高效处理各类货物',
            '<i class="fas fa-check"></i> 价格优势：直接对接海外合作伙伴，省去中间环节，提供更具竞争力的价格',
            '<i class="fas fa-check"></i> 全程跟踪：先进物流系统，实时追踪货物位置和状态',
            '<i class="fas fa-check"></i> 专业服务：一对一客服跟进，及时解决运输过程中的各类问题'
        ],
        notes: [
            '<i class="fas fa-exclamation-triangle"></i> 特殊货品（如电池、液体等）需提前告知，可能需要额外资料和费用',
            '<i class="fas fa-exclamation-triangle"></i> 运输时效受海关查验、天气等因素影响，可能有所波动',
            '<i class="fas fa-exclamation-triangle"></i> 请提供准确的收件人信息，错误信息可能导致派送延误',
            '<i class="fas fa-exclamation-triangle"></i> 大件物品请提前与客服确认尺寸和限制和附加费用'
        ],
        quickQuestions: [
            '加拿大不同省份的派送时间有差异吗？',
            '需要提供商业发票吗？',
            '清关需要多长时间？',
            '如何避免加拿大海关查验延误？'
        ]
    },

    'canada-BIG': {
        title: '加拿大商业件海运专线',
        isHot: true,
        welcomeMessage: '您好！我是您的专属物流顾问，很高兴为您提供关于加拿大大件海运专线的咨询服务。您可以询问我任何关于价格、时效、货物要求等方面的问题。',
        features: [
            '<i class="fas fa-bullseye"></i> 特点：稳定可靠，适合大批量货物',
            '<i class="fas fa-clock"></i> 时效：20-28天送达',
            '<i class="fas fa-dollar-sign"></i> 价格：$140-180/立方米',
            '<i class="fas fa-box"></i> 支持拼箱和整箱服务'
        ],
        advantages: [
            '<i class="fas fa-check"></i> 稳定可靠：多年运营经验，专业物流团队，高效处理各类货物',
            '<i class="fas fa-check"></i> 价格优势：直接对接海外合作伙伴，省去中间环节，提供更具竞争力的价格',
            '<i class="fas fa-check"></i> 全程跟踪：先进物流系统，实时追踪货物位置和状态',
            '<i class="fas fa-check"></i> 专业服务：一对一客服跟进，及时解决运输过程中的各类问题'
        ],
        notes: [
            '<i class="fas fa-exclamation-triangle"></i> 特殊货品（如电池、液体等）需提前告知，可能需要额外资料和费用',
            '<i class="fas fa-exclamation-triangle"></i> 运输时效受海关查验、天气等因素影响，可能有所波动',
            '<i class="fas fa-exclamation-triangle"></i> 请提供准确的收件人信息，错误信息可能导致派送延误',
            '<i class="fas fa-exclamation-triangle"></i> 大件物品请提前与客服确认尺寸和限制和附加费用'
        ],
        quickQuestions: [
            '大件海运价格怎么计算？',
            '有哪些商业清关服务？',
            '可以发温哥华和多伦多吗？',
            '加拿大大件海运需要提前预约吗？'
        ]
    },


    

    
    'mexico': {
        title: '墨西哥专线',
        isHot: false,
        welcomeMessage: '您好！我是您的专属墨西哥物流顾问，很高兴为您提供墨西哥专线的咨询服务。您可以询问我关于派送区域、清关要求、运输时效等任何问题。',
        features: [
            '<i class="fas fa-bullseye"></i> 特点：全程追踪，提供墨西哥本地派送',
            '<i class="fas fa-clock"></i> 时效：空运8-12天，海运30-40天',
            '<i class="fas fa-dollar-sign"></i> 价格：空运$8.5-10.2/kg，海运$160-200/立方米',
            '<i class="fas fa-box"></i> 提供墨西哥清关代理服务'
        ],
        advantages: [
            '<i class="fas fa-check"></i> 稳定可靠：多年运营经验，专业物流团队，高效处理各类货物',
            '<i class="fas fa-check"></i> 价格优势：直接对接海外合作伙伴，省去中间环节，提供更具竞争力的价格',
            '<i class="fas fa-check"></i> 全程跟踪：先进物流系统，实时追踪货物位置和状态',
            '<i class="fas fa-check"></i> 专业服务：一对一客服跟进，及时解决运输过程中的各类问题'
        ],
        notes: [
            '<i class="fas fa-exclamation-triangle"></i> 特殊货品（如电池、液体等）需提前告知，可能需要额外资料和费用',
            '<i class="fas fa-exclamation-triangle"></i> 运输时效受海关查验、天气等因素影响，可能有所波动',
            '<i class="fas fa-exclamation-triangle"></i> 请提供准确的收件人信息，错误信息可能导致派送延误',
            '<i class="fas fa-exclamation-triangle"></i> 大件物品请提前与客服确认尺寸和限制和附加费用'
        ],
        quickQuestions: [
            '墨西哥清关需要提供哪些资料？',
            '墨西哥各城市的派送时效如何？',
            '墨西哥海关有特殊限制吗？',
            '可以发电池产品到墨西哥吗？'
        ]
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const routeId = urlParams.get('id'); // 使用简化的id参数
    const routeTitle = urlParams.get('title');
    const routeFeatures = urlParams.get('features');
    
    // 优先使用id参数，其次使用title和features参数
    if (routeId && routeData[routeId]) {
        const route = routeData[routeId];
        document.getElementById('route-title').textContent = route.title + '智能询价';
        document.title = route.title + ' - AI物流询价';
        
        const featuresContainer = document.getElementById('route-features');
        featuresContainer.innerHTML = ''; // 清空现有内容
        
        route.features.forEach(feature => {
            const p = document.createElement('p');
            p.innerHTML = feature;
            featuresContainer.appendChild(p);
        });
    } else if (routeTitle) {
        // 兼容旧参数
        document.getElementById('route-title').textContent = routeTitle + '智能询价';
        document.title = routeTitle + ' - AI物流询价';
        
        if (routeFeatures) {
            try {
                const features = JSON.parse(decodeURIComponent(routeFeatures));
                const featuresContainer = document.getElementById('route-features');
                featuresContainer.innerHTML = ''; // 清空现有内容
                
                features.forEach(feature => {
                    const p = document.createElement('p');
                    p.innerHTML = feature;
                    featuresContainer.appendChild(p);
                });
            } catch (e) {
                console.error('解析特性时出错:', e);
            }
        }
    }
    
    // 聊天功能
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-btn');
    
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user-message' : 'message ai-message';
        messageDiv.innerHTML = content;
        chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'message ai-message';
        indicatorDiv.id = 'typing-indicator';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('span');
            typingIndicator.appendChild(dot);
        }
        
        indicatorDiv.appendChild(typingIndicator);
        chatMessages.appendChild(indicatorDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    function getBotResponse(userMessage) {
        // 模拟AI回复
        const responses = [
            "根据您提供的信息，我们的加拿大商业件大件海运专线价格为$140/立方米，预计运输时间20-25天。您可以联系我们的客服获取更详细的报价。",
            "请问您的货物体积和重量分别是多少？是否含有特殊货品（如电池、液体等）？这些信息可以帮助我计算更准确的运费。",
            "对于您的货物，我建议选择我们的专线服务，价格约为$120/立方米，包含从中国到加拿大的全程服务，包括：国内提货、国际干线、清关和派送。",
            "您好，基本运费为$6.5/kg，如果体积重较大则按照体积重计费，计算公式为：长(cm)×宽(cm)×高(cm)÷6000=体积重(kg)。",
            "这批货物属于大件，建议使用我们的大件海运专线，价格比普通空运更经济实惠。目前的参考价格为：$95/立方米 + 目的港清关和派送费用。",
            "您好，根据系统数据，从中国到多伦多的普货空运价格为$7.2/kg，约4-6天可以送达。如果是FBA仓库，需要额外$15的FBA对接服务费。",
            "对于电商卖家，我们提供专业的FBA头程服务，包含入仓预约、标签粘贴等增值服务，综合费用约$6.8/kg。"
        ];
        
        // 简单的关键词匹配，使回复更相关
        if (userMessage.includes("FBA") || userMessage.includes("亚马逊")) {
            return "我们的FBA专线可提供DDU和DDP两种服务，价格分别为$5.8/kg和$6.5/kg，包含清关和派送到亚马逊仓库。您需要提前3天预约入仓。";
        } else if (userMessage.includes("电池") || userMessage.includes("内电")) {
            return "带电产品需要通过特殊渠道运输，我们的内电专线价格为$8.2/kg，需要提供产品MSDS和电池UN38.3测试报告。";
        } else if (userMessage.includes("时效") || userMessage.includes("多久")) {
            return "我们的空运专线约4-7个工作日送达，海运专线约18-25天送达，快船服务约12-15天送达。具体时效受清关和目的地配送影响。";
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    function handleSend() {
        const userMessage = userInput.value.trim();
        
        if (userMessage) {
            // 添加用户消息
            addMessage(userMessage, true);
            userInput.value = '';
            
            // 显示正在输入指示
            showTypingIndicator();
            
            // 模拟延迟，获取AI回复
            setTimeout(function() {
                removeTypingIndicator();
                const botResponse = getBotResponse(userMessage);
                addMessage(botResponse);
            }, 1500);
        }
    }
    
    // 发送按钮点击事件
    sendButton.addEventListener('click', handleSend);
    
    // 回车键发送
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSend();
        }
    });
    
    // 显示欢迎信息
    if (routeId && routeData[routeId] && routeData[routeId].welcomeMessage) {
        // 使用延迟显示欢迎信息，模拟机器人思考
        setTimeout(function() {
            addMessage(routeData[routeId].welcomeMessage);
        }, 800);
    } else {
        // 默认欢迎信息
        setTimeout(function() {
            addMessage('您好！我是安的专属物流顾问，很高兴为您提供关于该运输专线的咨询服务。您可以询问我任何关于价格、时效、货物要求等方面的问题。');
        }, 800);
    }
    
    // 快捷问题功能
    window.askQuickQuestion = function(question) {
        userInput.value = question;
        handleSend();
    };
});

/**
 * AI查价导航函数
 * 根据线路标题确定路线ID并进行跳转
 */
function navigateToAIPricing(title, features) {
    // 根据标题确定路线ID
    let routeId = '';
    if (title.includes('美国') && title.includes('空运')) {
        routeId = 'usa-air';
    } else if (title.includes('加拿大') && title.includes('海运')) {
        routeId = 'canada-sea';
    } else if (title.includes('FBA')) {
        routeId = 'fba';
    } else if (title.includes('墨西哥')) {
        routeId = 'mexico';
    }
    
    // 优先使用简化版本和ID参数
    if (routeId) {
        window.location.href = `../../regions/north-america/ai-pricing.html?id=${routeId}`;
    } else {
        // 兼容旧版本
        const encodedTitle = encodeURIComponent(title);
        const encodedFeatures = encodeURIComponent(JSON.stringify(features));
        window.location.href = `../../regions/north-america/ai-pricing.html?title=${encodedTitle}&features=${encodedFeatures}`;
    }
} 