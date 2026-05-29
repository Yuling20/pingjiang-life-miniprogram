// pages/community/publish/index.js
// 发帖页 - 含实名授权、前端敏感词拦截、内容安全接口预留、图片/视频上传

// =============================================
// 前端敏感词库（生产环境改为服务端下发并加密）
// =============================================
const SENSITIVE_WORDS = [
  '广告', '代开发票', '办证', '贷款', '赌博', '色情', '暴力',
  '反动', '邪教', '法轮功', '六四', '台独', '藏独', '疆独',
  '黄赌毒', '诈骗', '传销', '枪支', '炸弹', '私彩'
]

// =============================================
// 热门话题预设
// =============================================
const HOT_TAGS = ['天岳广场', '平江美食', '生活问答', '平江旅游', '高铁站', '农产品', '邻里互助']

Page({
  data: {
    content: '',          // 正文
    tags: [],             // 已选话题
    tagInput: '',         // 话题输入框
    hotTags: HOT_TAGS,    // 热门话题
    images: [],           // 已选图片路径
    videoPath: '',        // 已选视频路径
    isAuthed: false,      // 是否已实名授权
    canSubmit: false,     // 是否允许发布
    isSubmitting: false   // 防重复提交
  },

  onLoad() {
    // 读取本地授权缓存
    const authed = wx.getStorageSync('user_authed') || false
    this.setData({ isAuthed: authed })
  },

  // =============================================
  // 实名授权
  // =============================================
  requestAuth() {
    wx.getUserProfile({
      desc: '发帖需要实名授权，以保障社区安全',
      success: (res) => {
        wx.setStorageSync('user_authed', true)
        wx.setStorageSync('user_info', res.userInfo)
        this.setData({ isAuthed: true })
        wx.showToast({ title: '授权成功', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '授权失败，无法发帖', icon: 'none' })
      }
    })
  },

  // =============================================
  // 正文输入
  // =============================================
  onContentInput(e) {
    const content = e.detail.value
    this.setData({ content })
    this.updateCanSubmit(content)
  },

  // 更新发布按钮是否可用
  updateCanSubmit(content) {
    const canSubmit = content.trim().length > 0 && this.data.isAuthed
    this.setData({ canSubmit })
  },

  // =============================================
  // 话题标签
  // =============================================
  onTagInput(e) {
    this.setData({ tagInput: e.detail.value })
  },

  addTag() {
    const tag = this.data.tagInput.trim().replace(/^#/, '')
    if (!tag) return
    if (this.data.tags.length >= 3) {
      wx.showToast({ title: '最多添加3个话题', icon: 'none' })
      return
    }
    if (this.data.tags.includes(tag)) {
      wx.showToast({ title: '话题已存在', icon: 'none' })
      return
    }
    this.setData({
      tags: [...this.data.tags, tag],
      tagInput: ''
    })
  },

  addHotTag(e) {
    const tag = e.currentTarget.dataset.tag
    if (this.data.tags.length >= 3) {
      wx.showToast({ title: '最多添加3个话题', icon: 'none' })
      return
    }
    if (this.data.tags.includes(tag)) {
      wx.showToast({ title: '话题已存在', icon: 'none' })
      return
    }
    this.setData({ tags: [...this.data.tags, tag] })
  },

  removeTag(e) {
    const index = e.currentTarget.dataset.index
    const tags = this.data.tags.filter((_, i) => i !== index)
    this.setData({ tags })
  },

  // =============================================
  // 图片选择
  // =============================================
  chooseImage() {
    const remain = 9 - this.data.images.length
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImgs = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ images: [...this.data.images, ...newImgs] })
      }
    })
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = this.data.images.filter((_, i) => i !== index)
    this.setData({ images })
  },

  previewImg(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: e.currentTarget.dataset.list
    })
  },

  // =============================================
  // 视频选择
  // =============================================
  chooseVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60, // 最长60秒
      success: (res) => {
        this.setData({ videoPath: res.tempFiles[0].tempFilePath })
      }
    })
  },

  removeVideo() {
    this.setData({ videoPath: '' })
  },

  // =============================================
  // 前端敏感词检测
  // =============================================
  containsSensitiveWords(text) {
    return SENSITIVE_WORDS.some(word => text.includes(word))
  },

  // =============================================
  // 提交发布
  // =============================================
  onSubmit() {
    if (!this.data.canSubmit) {
      if (!this.data.isAuthed) {
        wx.showToast({ title: '请先完成实名授权', icon: 'none' })
        return
      }
      if (!this.data.content.trim()) {
        wx.showToast({ title: '请输入帖子内容', icon: 'none' })
        return
      }
      return
    }

    if (this.data.isSubmitting) return

    const { content, tags, images, videoPath } = this.data

    // 第一道：前端敏感词拦截
    if (this.containsSensitiveWords(content)) {
      wx.showModal({
        title: '内容违规',
        content: '帖子中包含违规词汇，请修改后再发布',
        showCancel: false
      })
      return
    }

    // 第二道：微信内容安全接口（云函数调用，预留）
    // TODO: 取消注释并配置云函数后启用
    // this.checkContentSecurity(content, () => this.doSubmit())
    // 当前直接提交
    this.doSubmit()
  },

  // 内容安全接口预留（云函数版）
  // checkContentSecurity(content, callback) {
  //   wx.showLoading({ title: '审核中...', mask: true })
  //   wx.cloud.callFunction({
  //     name: 'checkContent',
  //     data: { content },
  //     success: (res) => {
  //       wx.hideLoading()
  //       if (res.result && res.result.pass) {
  //         callback()
  //       } else {
  //         wx.showModal({ title: '内容违规', content: '帖子内容未通过安全审核，请修改后再试', showCancel: false })
  //       }
  //     },
  //     fail: () => {
  //       wx.hideLoading()
  //       // 接口失败时降级放行，避免影响用户体验（生产环境可改为拦截）
  //       callback()
  //     }
  //   })
  // },

  doSubmit() {
    this.setData({ isSubmitting: true })
    wx.showLoading({ title: '发布中...', mask: true })

    // TODO: 替换为真实接口
    // POST /api/community/publish
    // body: { content, tags, images, videoPath, userInfo }
    setTimeout(() => {
      wx.hideLoading()
      this.setData({ isSubmitting: false })
      wx.showToast({ title: '发布成功！', icon: 'success', duration: 1500 })

      // 通知首页刷新
      const app = getApp()
      if (app.globalData) app.globalData.needRefresh = true

      // 延迟返回首页
      setTimeout(() => {
        wx.navigateBack({ delta: 1 })
      }, 1500)
    }, 800)
  },

  // =============================================
  // 取消发布
  // =============================================
  onCancel() {
    const { content, images, videoPath, tags } = this.data
    const hasContent = content || images.length > 0 || videoPath || tags.length > 0
    if (hasContent) {
      wx.showModal({
        title: '放弃发布？',
        content: '已编辑的内容将不会保存',
        confirmText: '放弃',
        cancelText: '继续编辑',
        confirmColor: '#E53935',
        success: (res) => {
          if (res.confirm) wx.navigateBack({ delta: 1 })
        }
      })
    } else {
      wx.navigateBack({ delta: 1 })
    }
  }
})
