// pages/ai-assistant/index.js
const app = getApp()

Page({
  data: {
    messages: [],
    inputValue: '',
    scrollToMessage: '',
    isLoading: false,
    quickQuestions: [
      { id: 1, text: '补办身份证', icon: '🪪' },
      { id: 2, text: '停电查询', icon: '⚡' },
      { id: 3, text: '找租房', icon: '🏠' },
      { id: 4, text: '找工作', icon: '💼' },
      { id: 5, text: '平江有几所小学', icon: '🏫' },
      { id: 6, text: '医院在哪里', icon: '🏥' }
    ],
    history: [] // 对话历史，实现上下文记忆
  },

  onLoad() {
    // 初始欢迎消息
    this.addMessage('assistant', `你好！我是平江汇AI小助手"小汇" 😊

我可以帮你解答：
• 政务办事流程
• 租房租赁查询  
• 招聘求职建议
• 停水停电查询
• 证件补办指引
• 本地生活问答

请问有什么需要帮助的？`)
  },

  // 添加消息
  addMessage(role, content) {
    const messages = this.data.messages
    const newMsg = {
      id: Date.now(),
      role,
      content,
      time: this.formatTime(new Date())
    }
    messages.push(newMsg)
    this.setData({
      messages,
      scrollToMessage: 'msg-' + newMsg.id
    })
    return newMsg.id
  },

  // 发送消息
  async sendMessage(e) {
    const text = e ? (e.detail.value || this.data.inputValue) : this.data.inputValue
    if (!text.trim() || this.data.isLoading) return

    // 清空输入框，添加用户消息
    this.setData({ inputValue: '', isLoading: true })
    this.addMessage('user', text.trim())

    // 添加加载中消息
    const loadingId = this.addMessage('assistant', '小汇正在思考中...')

    try {
      // 调用云函数
      const res = await wx.cloud.callFunction({
        name: 'aiChat',
        data: {
          message: text.trim(),
          history: this.data.history.slice(-10) // 保留最近10条历史
        }
      })

      // 更新历史记录
      const history = [...this.data.history,
        { role: 'user', content: text.trim() },
        { role: 'assistant', content: res.result.reply }
      ]

      // 替换加载消息为真实回复
      const messages = this.data.messages.map(msg => {
        if (msg.id === loadingId) {
          return { ...msg, content: res.result.reply }
        }
        return msg
      })

      this.setData({ messages, history, isLoading: false })

    } catch (err) {
      console.error('AI调用失败:', err)
      const messages = this.data.messages.map(msg => {
        if (msg.id === loadingId) {
          return { ...msg, content: '网络异常，请稍后再试~ 😅' }
        }
        return msg
      })
      this.setData({ messages, isLoading: false })
    }
  },

  // 快捷问题点击
  onQuickQuestion(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ inputValue: text })
    setTimeout(() => this.sendMessage(), 100)
  },

  // 输入框变化
  onInput(e) {
    this.setData({ inputValue: e.detail.value })
  },

  // 格式化时间
  formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0')
    const m = date.getMinutes().toString().padStart(2, '0')
    return `${h}:${m}`
  },

  // 清空对话
  clearChat() {
    wx.showModal({
      title: '提示',
      content: '确定清空对话记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ messages: [], history: [] })
          this.onLoad()
        }
      }
    })
  }
})
