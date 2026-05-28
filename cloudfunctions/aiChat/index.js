// cloudfunctions/aiChat/index.js
const cloud = require('wx-server-sdk')
const https = require('https')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { message, history } = event
  
  // ===== 使用 DeepSeek API（免费额度充足）=====
  const API_KEY = 'sk-abf6ee9695404cc8b97e62c1d3ce6acd' // 去 platform.deepseek.com 免费注册获取
  
  const messages = [
    {
      role: 'system',
      content: `你是平江汇生活小程序的AI小助手"小汇"。
你专门服务于湖南省平江县的居民。
你能回答：
1. 平江本地政务办事流程
2. 平江租房租赁信息
3. 平江招聘求职建议  
4. 平江停水停电查询指引
5. 证件补办流程
6. 平江本地生活问答
7. 平江的学校、医院、景点等本地信息

回答要简洁友好，带有本地化特色。
如果不确定具体数据，告知用户去哪里查询官方信息。
平江县有小学约80所左右（城区+乡镇），主要城区小学有：平江县第一小学、平江县第二小学、平江县第三小学、平江县实验小学等。`
    },
    ...(history || []),
    {
      role: 'user',
      content: message
    }
  ]
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7
    })
    
    const options = {
      hostname: 'api.deepseek.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          const result = JSON.parse(data)
          if (result.choices && result.choices[0]) {
            resolve({
              success: true,
              reply: result.choices[0].message.content
            })
          } else {
            resolve({
              success: false,
              reply: '小汇暂时开小差了，请稍后再试~'
            })
          }
        } catch (e) {
          resolve({
            success: false,
            reply: '小汇暂时开小差了，请稍后再试~'
          })
        }
      })
    })
    
    req.on('error', (e) => {
      resolve({
        success: false,
        reply: '网络连接失败，请检查网络后重试~'
      })
    })
    
    req.write(postData)
    req.end()
  })
}
