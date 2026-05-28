// cloudfunctions/doubaoAI/index.js
const cloud = require('wx-server-sdk');
const https = require('https');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
// ========== 配置区域 ==========
const CONFIG = {
  // ✅ 你的接入点ID
  ENDPOINT_ID: 'ep-20260526225719-ntbpw',
  // ✅ 你的API Key（已从你提供的信息获取）
  API_KEY: 'api-key-20260526230045',
  // 火山方舟API地址
  API_HOST: 'ark.cn-beijing.volces.com',
  API_PATH: '/api/v3/chat/completions',
  // 频率限制：每个用户每分钟最多10次
  RATE_LIMIT: 10,
  RATE_WINDOW: 60 * 1000, // 1分钟
};
// ========== 内存频率限制（云函数热启动有效）==========
const rateLimitMap = {};
function checkRateLimit(openid) {
  const now = Date.now();
  if (!rateLimitMap[openid]) {
    rateLimitMap[openid] = { count: 1, startTime: now };
    return true;
  }
  
  const record = rateLimitMap[openid];
  
  // 超过时间窗口，重置
  if (now - record.startTime > CONFIG.RATE_WINDOW) {
    rateLimitMap[openid] = { count: 1, startTime: now };
    return true;
  }
  
  // 未超过限制
  if (record.count < CONFIG.RATE_LIMIT) {
    record.count++;
    return true;
  }
  
  // 超过限制
  return false;
}
// ========== 敏感词过滤 ==========
const SENSITIVE_WORDS = [
  // 政治敏感
  '法轮功', '达赖', '台独', '疆独',
  // 违法内容
  '毒品', '赌博', '诈骗', '色情',
  // 人身攻击
  '去死', '傻逼', '狗日',
  // 可根据需要继续添加
];
function filterSensitiveWords(text) {
  let filtered = text;
  let hasSensitive = false;
  
  for (const word of SENSITIVE_WORDS) {
    if (filtered.includes(word)) {
      hasSensitive = true;
      filtered = filtered.replace(new RegExp(word, 'g'), '**');
    }
  }
  
  return { filtered, hasSensitive };
}
// ========== 调用豆包API ==========
function callDoubaoAPI(messages) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: CONFIG.ENDPOINT_ID,
      messages: messages,
      max_tokens: 1024,
      temperature: 0.7,
      stream: false
    });
    const options = {
      hostname: CONFIG.API_HOST,
      port: 443,
      path: CONFIG.API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.API_KEY}`,
        'Content-Length': Buffer.byteLength(requestBody)
      },
      timeout: 30000
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200) {
            resolve(parsed);
          } else {
            console.error('API错误响应:', res.statusCode, data);
            reject(new Error(`API错误: ${res.statusCode} - ${data}`));
          }
        } catch (e) {
          reject(new Error('响应解析失败: ' + data));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    req.write(requestBody);
    req.end();
  });
}
// ========== 主函数入口 ==========
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  
  console.log('AI请求 openid:', openid, '消息:', event.message);
  // 1. 验证openid
  if (!openid) {
    return { success: false, error: '用户身份验证失败', code: 'NO_OPENID' };
  }
  // 2. 频率限制检查
  if (!checkRateLimit(openid)) {
    return {
      success: false,
      error: '您的提问频率过快，请稍等1分钟后再试',
      code: 'RATE_LIMIT'
    };
  }
  // 3. 输入验证
  const userMessage = (event.message || '').trim();
  if (!userMessage) {
    return { success: false, error: '消息内容不能为空', code: 'EMPTY_MESSAGE' };
  }
  if (userMessage.length > 500) {
    return { success: false, error: '消息过长，请控制在500字以内', code: 'TOO_LONG' };
  }
  // 4. 敏感词过滤
  const { filtered, hasSensitive } = filterSensitiveWords(userMessage);
  if (hasSensitive) {
    console.log('检测到敏感词, openid:', openid, '原文:', userMessage);
    return {
      success: false,
      error: '您的消息包含不当内容，请调整后重新提问',
      code: 'SENSITIVE_WORD'
    };
  }
  // 5. 构建对话消息
  const messages = [
    {
      role: 'system',
      content: `你是平江汇生活小程序的AI小助手"小汇"，专门服务于湖南省岳阳市平江县的居民。
你的职责：
- 解答平江县政务办事流程（户籍、证件、社保等）
- 提供平江本地生活信息（租房、招聘、家政、二手）
- 查询停水停电等民生通知
- 介绍平江特色文化和旅游景点
- 引导用户使用平江汇小程序各功能
回答规范：
- 语言亲切、简洁，符合本地居民习惯
- 政务问题给出具体办理地点和电话
- 不确定的信息引导用户拨打12345政务热线
- 不回答与平江生活无关的话题
- 每次回复控制在200字以内`
    },
    {
      role: 'user',
      content: filtered
    }
  ];
  // 历史对话（如果前端传入）
  if (event.history && Array.isArray(event.history)) {
    const validHistory = event.history
      .slice(-6) // 最多保留最近6条历史
      .filter(h => h.role && h.content);
    messages.splice(1, 0, ...validHistory);
  }
  // 6. 调用API
  try {
    const result = await callDoubaoAPI(messages);
    const reply = result.choices?.[0]?.message?.content || '小汇暂时无法回答，请稍后再试';
    
    console.log('AI回复成功, openid:', openid);
    
    return {
      success: true,
      reply: reply,
      usage: result.usage || {}
    };
    
  } catch (error) {
    console.error('调用AI失败:', error.message);
    
    // 友好的错误提示
    let errorMsg = 'AI服务暂时繁忙，请稍后再试';
    if (error.message.includes('401')) {
      errorMsg = 'AI服务配置异常，请联系管理员';
    } else if (error.message.includes('超时')) {
      errorMsg = '网络超时，请检查网络后重试';
    }
    
    return {
      success: false,
      error: errorMsg,
      code: 'API_ERROR',
      detail: error.message
    };
  }
};