// ============================================================
// ⚠️ 使用前必须替换：
//    将下方 YOUR_DEEPSEEK_API_KEY 替换为你的真实 API Key
//    获取地址：https://platform.deepseek.com/api_keys
// ============================================================
const DEEPSEEK_API_KEY = 'sk-abf6ee9695404cc8b97e62c1d3ce6acd'

// DeepSeek 接口地址（微信开发者工具需关闭域名校验才能本地调试）
// 上线前需在微信公众平台 → 开发设置 → request合法域名 中添加：
// https://api.deepseek.com
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'

Page({
  data: {
    messages: [],    // 对话记录 [{id, role, content}]
    inputText: '',   // 输入框内容
    loading: false,  // 是否正在等待AI回复
    scrollTop: 0     // 控制滚动位置
  },

  // ===== 页面加载完成，自动发送招呼语（按指定格式换行） =====
  onLoad() {
    const welcomeMsg = {
      id: Date.now(),
      role: 'assistant',
      content: `你好呀！
我是平江汇生活助手😊，
可以帮你解答平江本地的吃喝玩乐、便民服务等问题
有什么想了解的尽管问我哦~`
    }
    this.setData({
      messages: [welcomeMsg]
    })
    this.scrollToBottom()
  },

  // ===== 输入框内容变化 =====
  onInput(e) {
    this.setData({ inputText: e.detail.value })
  },

  // ===== 点击发送 =====
  onSend() {
    const text = this.data.inputText.trim()

    // 校验：内容为空或正在加载时不发送
    if (!text || this.data.loading) return

    // 1. 把用户消息加入记录
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text
    }
    const messages = [...this.data.messages, userMsg]

    this.setData({
      messages,
      inputText: '',
      loading: true
    })

    // 滚动到底部
    this.scrollToBottom()

    // 2. 调用 DeepSeek API
    this.callDeepSeek(messages)
  },

  // ===== 调用 DeepSeek API =====
  callDeepSeek(messages) {
    // 只把 role 和 content 传给接口，去掉本地用的 id 字段
    const apiMessages = messages.map(m => ({
      role: m.role,
      content: m.content
    }))

    wx.request({
      url: DEEPSEEK_API_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        // ⚠️ 注意：Authorization 格式固定为 "Bearer 你的Key"
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      data: {
        model: 'deepseek-chat',   // 使用 deepseek-chat 模型
        messages: apiMessages,
        max_tokens: 1024,          // 最大回复长度，可按需调整
        temperature: 0.7           // 回复随机性，0~1，越高越有创意
      },
      success: (res) => {
        // 请求成功，但需判断业务状态码
        if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
          const aiReply = res.data.choices[0].message.content

          // 把AI回复加入记录
          const aiMsg = {
            id: Date.now() + 1,
            role: 'assistant',
            content: aiReply
          }
          this.setData({
            messages: [...this.data.messages, aiMsg],
            loading: false
          })
        } else {
          // 接口异常
          this.showError(`接口异常（状态码：${res.statusCode}）`)
        }
      },
      fail: (err) => {
        // 网络请求失败（如域名未配置、网络断开）
        console.error('DeepSeek 请求失败：', err)
        this.showError('网络请求失败，请检查网络或域名配置')
      },
      complete: () => {
        // 无论成功失败，关闭加载状态并滚动到底部
        this.setData({ loading: false })
        this.scrollToBottom()
      }
    })
  },

  // ===== 显示错误提示（在对话中显示一条错误消息） =====
  showError(msg) {
    const errMsg = {
      id: Date.now() + 2,
      role: 'assistant',
      content: `⚠️ ${msg}`
    }
    this.setData({
      messages: [...this.data.messages, errMsg],
      loading: false
    })
    this.scrollToBottom()
  },

  // ===== 滚动到底部 =====
  scrollToBottom() {
    // 用一个足够大的数字让 scroll-view 滚动到最底部
    this.setData({ scrollTop: 999999 })
  }
})