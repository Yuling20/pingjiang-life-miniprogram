// pages/community/community.js
const app = getApp()

Page({
  data: {
    searchKeyword: '',

    // ✅ 热门话题动态数据源（仅保留5个，符合规范要求）
    hotTopics: [
      { id: 'ht1', label: '平江探店', active: true  },
      { id: 'ht2', label: '本地美食', active: false },
      { id: 'ht3', label: '活动通知', active: false },
      { id: 'ht4', label: '萌宠日记', active: false },
      { id: 'ht5', label: '周末游玩', active: false },
    ],

    // ✅ 分类列表（完全保留原有）
    categories: ['全部', '扯闲谈', '宠物', '美食', '活动', '游玩', '二手交易', '求助互助'],
    currentCategory: 0,
    activeCategory: '全部',
    posts: [],
    filteredPosts: [],
    showShareMenu: false,
    currentSharePost: null,
    showPoster: false,
    posterImagePath: '',
    posterLoading: false,
    isRealNameVerified: true,
    isAndroid: false,

    // ✅ 分类颜色映射（完全保留，不改色值）
    categoryColorMap: {
      '全部':    { bg: '#F5F0E8', text: '#999999' },
      '扯闲谈':  { bg: '#EEF5EE', text: '#5A8A6A' },
      '宠物':    { bg: '#F8EEF5', text: '#906090' },
      '美食':    { bg: '#F7F3E2', text: '#8A7030' },
      '活动':    { bg: '#F8EEE8', text: '#A06040' },
      '游玩':    { bg: '#EAF0F8', text: '#4A6A90' },
      '二手交易': { bg: '#F2EEE2', text: '#807050' },
      '求助互助': { bg: '#EAF5F8', text: '#408090' },
    }
  },

  onLoad() {
    try {
      const sysInfo = wx.getSystemInfoSync()
      this.setData({ isAndroid: sysInfo.platform === 'android' })
    } catch (e) {
      this.setData({ isAndroid: false })
    }
    this._loadMockPosts()
    this._checkRealName()
  },

  onShow() {
    const app = getApp()
    const initCategory = app.globalData.communityInitCategory
    if (initCategory !== undefined && initCategory !== null) {
      this.setData({ activeCategory: initCategory || '全部' })
      this.filterPostsByCategory(initCategory)
      app.globalData.communityInitCategory = null
    }
  },

  // ==================== 初始化 ====================

  _loadMockPosts() {
    const posts = [
      {
        id: '1',
        avatarColor: '#FFD6C8',
        avatarEmoji: '😊',
        nickname: '张小明',
        time: '10分钟前',
        category: '求助互助',
        content: '小区门口捡到一只橘猫，有失主吗？已送到物业处。',
        tags: ['#求助互助', '#宠物'],
        images: [],
        likeCount: 12,
        commentCount: 5,
        liked: false,
      },
      {
        id: '2',
        avatarColor: '#C8EDE8',
        avatarEmoji: '🌸',
        nickname: '李美丽',
        time: '30分钟前',
        category: '美食',
        content: '今天做了红烧肉，分享给大家！配方在评论区～',
        tags: ['#美食', '#生活'],
        images: [],
        likeCount: 38,
        commentCount: 14,
        liked: true,
      },
      {
        id: '3',
        avatarColor: '#C8DFF0',
        avatarEmoji: '👴',
        nickname: '王大爷',
        time: '1小时前',
        category: '活动',
        content: '本周六下午3点，小区广场举办亲子活动，欢迎带孩子参加！',
        tags: ['#活动', '#亲子'],
        images: [],
        likeCount: 56,
        commentCount: 23,
        liked: false,
      },
      {
        id: '4',
        avatarColor: '#FBF0C8',
        avatarEmoji: '🌻',
        nickname: '赵小花',
        time: '2小时前',
        category: '二手交易',
        content: '九成新婴儿车出售，价格面议，有意者私信。',
        tags: ['#二手交易'],
        images: [],
        likeCount: 8,
        commentCount: 3,
        liked: false,
      },
      {
        id: '5',
        avatarColor: '#E0DCF8',
        avatarEmoji: '🐶',
        nickname: '陈先生',
        time: '3小时前',
        category: '宠物',
        content: '我家狗狗今天洗澡了，分享一下萌照～',
        tags: ['#宠物', '#萌宠'],
        images: [],
        likeCount: 24,
        commentCount: 9,
        liked: false,
      },
      {
        id: '6',
        avatarColor: '#F8D8E8',
        avatarEmoji: '👩',
        nickname: '刘阿姨',
        time: '昨天',
        category: '求助互助',
        content: '有没有人知道附近哪里可以修鞋？谢谢大家！',
        tags: ['#求助互助'],
        images: [],
        likeCount: 5,
        commentCount: 12,
        liked: false,
      },
    ]
    this.setData({ posts, filteredPosts: posts })
    wx.setStorageSync('communityPosts', posts)
  },

  _checkRealName() {
    this.setData({ isRealNameVerified: true })
  },

  // ==================== 分类筛选 ====================

  filterPostsByCategory(category) {
    const allPosts = wx.getStorageSync('communityPosts') || []
    const colorMap = this.data.categoryColorMap

    let filtered = (!category || category === '全部')
      ? allPosts
      : allPosts.filter(post => post.category === category)

    filtered = filtered.map(post => {
      const color = colorMap[post.category] || colorMap['全部']
      return { ...post, tagBg: color.bg, tagText: color.text }
    })

    this.setData({
      filteredPosts: filtered,
      activeCategory: category || '全部'
    })
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category || '全部'
    this.filterPostsByCategory(category)
  },

  // ==================== 返回 ====================

  handleNavBack() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 })
    } else {
      wx.switchTab({ url: '/pages/home/home' })
    }
  },

  // ==================== 搜索 ====================

  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    this._filterPosts(keyword, this.data.currentCategory)
  },

  onSearchClear() {
    this.setData({ searchKeyword: '' })
    this._filterPosts('', this.data.currentCategory)
  },

  _filterPosts(keyword, categoryIndex) {
    const { posts, categories } = this.data
    let result = posts
    if (categoryIndex !== 0) {
      result = result.filter(p => p.category === categories[categoryIndex])
    }
    if (keyword && keyword.trim()) {
      const kw = keyword.trim().toLowerCase()
      result = result.filter(p =>
        p.content.toLowerCase().includes(kw) ||
        p.nickname.toLowerCase().includes(kw) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(kw)))
      )
    }
    this.setData({ filteredPosts: result })
  },

  // ==================== 统一实名拦截 ====================

  _requireAuth(action) {
    const info1 = wx.getStorageSync('userRealNameInfo')
    const info2 = wx.getStorageSync('userAuthStatus')
    const isAuthed = !!((info1 && info1.verified) || info2 === true)
    if (!isAuthed) {
      wx.showModal({
        title: '需要实名认证',
        content: `${action}需要完成实名认证，请前往「我的」页面完成认证。`,
        confirmText: '去认证',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) wx.switchTab({ url: '/pages/mine/mine' })
        },
      })
      return false
    }
    return true
  },

  // ==================== 点赞（需实名） ====================

  onLikeTap(e) {
    if (!this._requireAuth('点赞')) return
    const { id } = e.currentTarget.dataset
    const updateList = (list) => list.map(p => {
      if (p.id === id) {
        return {
          ...p,
          liked: !p.liked,
          likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1
        }
      }
      return p
    })
    this.setData({
      posts: updateList(this.data.posts),
      filteredPosts: updateList(this.data.filteredPosts)
    })
  },

  // ==================== 评论（需实名） ====================

  onCommentTap(e) {
    if (!this._requireAuth('评论')) return
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/community/detail/index?postId=${id}&focus=comment`
    })
  },

  // ==================== 帖子详情 ====================

  onPostTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/community/detail/index?postId=${id}`
    })
  },

  // ==================== 发帖（需实名） ====================

  onPublishTap() {
    if (!this._requireAuth('发帖')) return
    wx.navigateTo({ url: '/pages/community/publish/index' })
  },

  // ==================== 分享（需实名） ====================

  onShareTap(e) {
    if (!this._requireAuth('转发')) return
    const { id } = e.currentTarget.dataset
    const post = this.data.posts.find(p => p.id === id) || null
    this.setData({ showShareMenu: true, currentSharePost: post })
  },

  onShareMenuClose() {
    this.setData({ showShareMenu: false, currentSharePost: null })
  },

  onShareMaskTap() {
    this.onShareMenuClose()
  },

  onShareAppMessage() {
    const post = this.data.currentSharePost || {}
    return {
      title: post.content ? post.content.slice(0, 30) : '平江汇生活社区',
      path: `/pages/community/detail/index?postId=${post.id || ''}`,
    }
  },

  // ==================== 生成海报（需实名） ====================

  onGeneratePoster() {
    if (!this._checkRealNameGuard()) return
    const post = this.data.currentSharePost
    if (!post) return
    this.onShareMenuClose()
    this.setData({ showPoster: true, posterLoading: true, posterImagePath: '' })
    setTimeout(() => { this._drawPoster(post) }, 300)
  },

  _drawPoster(post) {
    const self = this
    const ctx = wx.createCanvasContext('posterCanvas', this)
    const canvasW = 300, canvasH = 480

    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, canvasW, canvasH)
    ctx.setFillStyle('#FF7828')
    ctx.fillRect(0, 0, canvasW, 6)

    ctx.setFillStyle(post.avatarColor || '#FFD6C8')
    ctx.beginPath()
    ctx.arc(36, 50, 24, 0, Math.PI * 2)
    ctx.fill()

    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(22)
    ctx.setTextAlign('center')
    ctx.fillText(post.avatarEmoji || '👤', 36, 58)

    ctx.setFillStyle('#333333')
    ctx.setFontSize(14)
    ctx.setTextAlign('left')
    ctx.fillText(post.nickname || '匿名用户', 70, 44)

    ctx.setFillStyle('#999999')
    ctx.setFontSize(11)
    ctx.fillText(post.time || '', 70, 62)

    ctx.setFillStyle('#FFF3E6')
    ctx.fillRect(70, 68, 56, 18)
    ctx.setFillStyle('#FF7828')
    ctx.setFontSize(10)
    ctx.setTextAlign('center')
    ctx.fillText(post.category || '', 98, 80)

    ctx.setStrokeStyle('#F5EEDC')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(16, 96)
    ctx.lineTo(canvasW - 16, 96)
    ctx.stroke()

    ctx.setFillStyle('#444444')
    ctx.setFontSize(13)
    ctx.setTextAlign('left')
    const maxW = canvasW - 32, lineH = 22
    const words = post.content || ''
    let line = '', y = 118
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i]
      if (ctx.measureText(testLine).width > maxW && i > 0) {
        ctx.fillText(line, 16, y)
        line = words[i]
        y += lineH
        if (y > 260) { ctx.fillText(line + '...', 16, y); line = ''; break }
      } else { line = testLine }
    }
    if (line) ctx.fillText(line, 16, y)

    if (post.tags && post.tags.length) {
      ctx.setFillStyle('#FF7828')
      ctx.setFontSize(11)
      ctx.setTextAlign('left')
      ctx.fillText(post.tags[0] || '', 16, y + lineH + 8)
    }

    ctx.setFillStyle('#F8F4EE')
    ctx.fillRect(0, canvasH - 96, canvasW, 96)
    ctx.setFillStyle('#FF7828')
    ctx.setFontSize(13)
    ctx.setTextAlign('left')
    ctx.fillText('平江汇生活', 96, canvasH - 65)
    ctx.setFillStyle('#999999')
    ctx.setFontSize(10)
    ctx.fillText('发现身边美好生活', 96, canvasH - 48)
    ctx.setFillStyle('#CCCCCC')
    ctx.setFontSize(9)
    ctx.setTextAlign('center')
    ctx.fillText('扫码查看完整帖子 · 平江汇生活小程序', canvasW / 2, canvasH - 12)

    ctx.draw(false, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'posterCanvas',
          x: 0, y: 0, width: canvasW, height: canvasH,
          destWidth: canvasW * 2, destHeight: canvasH * 2,
          success(res) {
            self.setData({ posterImagePath: res.tempFilePath, posterLoading: false })
          },
          fail(err) {
            console.error('canvasToTempFilePath fail', err)
            self.setData({ posterLoading: false })
            wx.showToast({ title: '海报生成失败，请重试', icon: 'none' })
          }
        }, self)
      }, 200)
    })
  },

  onSavePoster() {
    const { posterImagePath, posterLoading } = this.data
    if (posterLoading) { wx.showToast({ title: '海报生成中，请稍候', icon: 'none' }); return }
    if (!posterImagePath) { wx.showToast({ title: '海报尚未生成', icon: 'none' }); return }
    wx.saveImageToPhotosAlbum({
      filePath: posterImagePath,
      success() { wx.showToast({ title: '已保存到相册', icon: 'success' }) },
      fail(err) {
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中开启相册权限后重试',
            confirmText: '去设置',
            success(r) { if (r.confirm) wx.openSetting() }
          })
        } else {
          wx.showToast({ title: '保存失败，请重试', icon: 'none' })
        }
      }
    })
  },

  onClosePoster() {
    this.setData({ showPoster: false, posterImagePath: '', posterLoading: false })
  },

  onShareTimeline() {
    const post = this.data.currentSharePost || {}
    return {
      title: post.content ? post.content.slice(0, 30) : '平江汇生活社区',
      query: `postId=${post.id || ''}`,
    }
  },

  onShareToTimeline() {
    if (!this._checkRealNameGuard()) return
    const { isAndroid, currentSharePost } = this.data
    this.onShareMenuClose()
    if (isAndroid) {
      wx.showToast({ title: '请点击右上角 → 分享到朋友圈', icon: 'none', duration: 2500 })
    } else {
      wx.showModal({
        title: 'iOS 暂不支持直接分享',
        content: '将为您生成分享海报，保存后可发布到朋友圈',
        confirmText: '生成海报',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm && currentSharePost) {
            this.setData({ showPoster: true, posterLoading: true, posterImagePath: '' })
            setTimeout(() => { this._drawPoster(currentSharePost) }, 300)
          }
        }
      })
    }
  },

  // ==================== 实名校验守卫 ====================

  _checkRealNameGuard() {
    if (!this.data.isRealNameVerified) {
      wx.showModal({
        title: '需要实名认证',
        content: '分享功能需要完成实名认证后方可使用',
        confirmText: '去认证',
        cancelText: '取消',
        success(res) {
          if (res.confirm) wx.switchTab({ url: '/pages/mine/mine' })
        }
      })
      return false
    }
    return true
  },

  // ==================== 关注 ====================

  onFollowTap() {
    wx.navigateTo({ url: '/pages/community/follow/index' })
  },

  // 阻止事件冒泡
  stopPropagation() {},
})
