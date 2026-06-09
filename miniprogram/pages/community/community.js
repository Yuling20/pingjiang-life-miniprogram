// pages/community/community.js
const app = getApp()

Page({
  data: {
    searchKeyword: '',
    // ✅ 替换为新的社区分类列表
    categories: ['全部', '扯闲谈', '宠物', '美食', '活动', '游玩', '二手交易', '求助互助'],
    currentCategory: 0,
    activeCategory: '全部', // 新增：当前激活的分类名称
    posts: [],
    filteredPosts: [],
    showShareMenu: false,
    currentSharePost: null,
    showPoster: false,
    posterImagePath: '',
    posterLoading: false,
    isRealNameVerified: true,
    isAndroid: false,

    // ✅ 替换为新的分类标签颜色映射（低饱和度护眼配色）
    categoryColorMap: {
      '全部':   { bg: '#f0f0f0', text: '#888888' },
      '扯闲谈': { bg: '#e8f4e8', text: '#4a8a5a' },
      '宠物':   { bg: '#fce8f5', text: '#a0508a' },
      '美食':   { bg: '#faf5e0', text: '#8a7030' },
      '活动':   { bg: '#faeee8', text: '#a05838' },
      '游玩':   { bg: '#e8f0fa', text: '#3a6090' },
      '二手交易':{ bg: '#f0ece0', text: '#807040' },
      '求助互助':{ bg: '#e8f5fa', text: '#307880' },
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
    // ✅ 升级为新的首页分类参数读取逻辑
    // 读取首页传入的分类筛选参数
    const app = getApp();
    const initCategory = app.globalData.communityInitCategory;
    if (initCategory !== undefined && initCategory !== null) {
      this.setData({ activeCategory: initCategory || '全部' });
      this.filterPostsByCategory(initCategory);
      app.globalData.communityInitCategory = null; // 用完清空
    }
  },

  // ==================== 初始化 ====================

  _loadMockPosts() {
    const posts = [
      {
        id: '1',
        avatarColor: '#FF6B6B',
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
        avatarColor: '#4ECDC4',
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
        avatarColor: '#45B7D1',
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
        avatarColor: '#F7DC6F',
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
        avatarColor: '#A29BFE',
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
        avatarColor: '#FD79A8',
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
    // 存入缓存，供 filterPostsByCategory 使用
    wx.setStorageSync('communityPosts', posts);
  },

  _checkRealName() {
    // 预留后端接口：GET /api/user/realname-status
    this.setData({ isRealNameVerified: true })
  },

  // ==================== 按分类筛选帖子（按方案重写） ====================
  /**
   * 按分类筛选帖子，并注入颜色信息
   */
  filterPostsByCategory(category) {
    const allPosts = wx.getStorageSync('communityPosts') || [];
    const colorMap = this.data.categoryColorMap;

    let filtered = (!category || category === '全部')
      ? allPosts
      : allPosts.filter(post => post.category === category);

    // 注入颜色
    filtered = filtered.map(post => {
      const color = colorMap[post.category] || colorMap['全部'];
      return {
        ...post,
        tagBg:   color.bg,
        tagText: color.text,
      };
    });

    this.setData({
      filteredPosts: filtered,
      activeCategory: category || '全部'
    });
  },

  /**
   * 分类 Tab 点击事件（按方案修正，绑定 dataset.category）
   */
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category || '全部';
    this.filterPostsByCategory(category);
  },

  // ==================== 返回上一页（兼容 tabBar 页与普通页，已按方案修复） ====================
  /** 返回上一页 */
  handleNavBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      // 有历史页面栈，正常返回
      wx.navigateBack({ delta: 1 });
    } else {
      // 从 tabBar 直接进入时，返回首页 tabBar
      wx.switchTab({ url: '/pages/home/home' });
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

  // ==================== 原有分类筛选逻辑（保留兼容） ====================
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
    const info1 = wx.getStorageSync('userRealNameInfo');
    const info2 = wx.getStorageSync('userAuthStatus');
    const isAuthed = !!(
      (info1 && info1.verified) || info2 === true
    );
    if (!isAuthed) {
      wx.showModal({
        title: '需要实名认证',
        content: `${action}需要完成实名认证，请前往「我的」页面完成认证。`,
        confirmText: '去认证',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' });
          }
        },
      });
      return false;
    }
    return true;
  },

  // ==================== 点赞（需实名） ====================
  onLikeTap(e) {
    if (!this._requireAuth('点赞')) return;
    const { id } = e.currentTarget.dataset
    const updateList = (list) => list.map(p => {
      if (p.id === id) {
        return { ...p, liked: !p.liked, likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1 }
      }
      return p
    })
    this.setData({
      posts: updateList(this.data.posts),
      filteredPosts: updateList(this.data.filteredPosts)
    })
    // 预留后端接口：POST /api/post/like { postId: id }
  },

  // ==================== 评论跳转（需实名） ====================
  onCommentTap(e) {
    if (!this._requireAuth('评论')) return;
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
    if (!this._requireAuth('发帖')) return;
    wx.navigateTo({ url: '/pages/community/publish/index' })
  },

  // ==================== 分享菜单（需实名） ====================
  onShareTap(e) {
    if (!this._requireAuth('转发')) return;
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

  // ——— 发给好友/群聊（原生转发） ———
  onShareAppMessage() {
    const post = this.data.currentSharePost || {}
    return {
      title: post.content ? post.content.slice(0, 30) : '平江汇生活社区',
      path: `/pages/community/detail/index?postId=${post.id || ''}`,
    }
  },

  // ——— 生成分享海报 ———
  onGeneratePoster() {
    if (!this._checkRealNameGuard()) return
    const post = this.data.currentSharePost
    if (!post) return
    this.onShareMenuClose()
    this.setData({ showPoster: true, posterLoading: true, posterImagePath: '' })
    // 延迟确保弹窗渲染完成后再绘制
    setTimeout(() => {
      this._drawPoster(post)
    }, 300)
  },

  _drawPoster(post) {
    const self = this
    const ctx = wx.createCanvasContext('posterCanvas', this)
    const canvasW = 300
    const canvasH = 480

    // 白色背景
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, canvasW, canvasH)

    // 顶部绿色条
    ctx.setFillStyle('#07c160')
    ctx.fillRect(0, 0, canvasW, 6)

    // 头像圆形背景
    const avatarColor = post.avatarColor || '#07c160'
    ctx.setFillStyle(avatarColor)
    ctx.beginPath()
    ctx.arc(36, 50, 24, 0, Math.PI * 2)
    ctx.fill()

    // 头像 emoji 文字
    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(22)
    ctx.setTextAlign('center')
    ctx.fillText(post.avatarEmoji || '👤', 36, 58)

    // 昵称
    ctx.setFillStyle('#333333')
    ctx.setFontSize(14)
    ctx.setTextAlign('left')
    ctx.fillText(post.nickname || '匿名用户', 70, 44)

    // 时间
    ctx.setFillStyle('#999999')
    ctx.setFontSize(11)
    ctx.fillText(post.time || '', 70, 62)

    // 分类标签
    ctx.setFillStyle('#e8f7ef')
    ctx.fillRect(70, 68, 56, 18)
    ctx.setFillStyle('#07c160')
    ctx.setFontSize(10)
    ctx.setTextAlign('center')
    ctx.fillText(post.category || '', 98, 80)

    // 分割线
    ctx.setStrokeStyle('#eeeeee')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(16, 96)
    ctx.lineTo(canvasW - 16, 96)
    ctx.stroke()

    // 正文（自动换行）
    ctx.setFillStyle('#333333')
    ctx.setFontSize(13)
    ctx.setTextAlign('left')
    const maxW = canvasW - 32
    const lineH = 22
    const words = post.content || ''
    let line = ''
    let y = 118
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i]
      if (ctx.measureText(testLine).width > maxW && i > 0) {
        ctx.fillText(line, 16, y)
        line = words[i]
        y += lineH
        if (y > 260) {
          ctx.fillText(line + '...', 16, y)
          line = ''
          break
        }
      } else {
        line = testLine
      }
    }
    if (line) ctx.fillText(line, 16, y)

    // 话题标签
    if (post.tags && post.tags.length) {
      ctx.setFillStyle('#07c160')
      ctx.setFontSize(12)
      ctx.setTextAlign('left')
      ctx.fillText(post.tags.join('  '), 16, y + lineH + 8)
    }

    // 底部灰色区域
    ctx.setFillStyle('#f7f7f7')
    ctx.fillRect(0, canvasH - 100, canvasW, 100)

    // 小程序码占位框
    ctx.setStrokeStyle('#dddddd')
    ctx.setLineWidth(1)
    ctx.strokeRect(16, canvasH - 88, 64, 64)
    ctx.setFillStyle('#07c160')
    ctx.setFontSize(20)
    ctx.setTextAlign('center')
    ctx.fillText('☷', 48, canvasH - 48)
    ctx.setFillStyle('#999')
    ctx.setFontSize(9)
    ctx.fillText('小程序码', 48, canvasH - 26)

    // 右侧提示文字
    ctx.setFillStyle('#555555')
    ctx.setFontSize(13)
    ctx.setTextAlign('left')
    ctx.fillText('扫码查看完整帖子', 96, canvasH - 70)

    ctx.setFillStyle('#07c160')
    ctx.setFontSize(12)
    ctx.fillText('平江汇生活', 96, canvasH - 50)

    ctx.setFillStyle('#999999')
    ctx.setFontSize(10)
    ctx.fillText('发现身边美好生活', 96, canvasH - 34)

    // 底部版权
    ctx.setFillStyle('#cccccc')
    ctx.setFontSize(9)
    ctx.setTextAlign('center')
    ctx.fillText('平江汇生活小程序', canvasW / 2, canvasH - 10)

    ctx.draw(false, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'posterCanvas',
          x: 0, y: 0,
          width: canvasW,
          height: canvasH,
          destWidth: canvasW * 2,
          destHeight: canvasH * 2,
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
    if (posterLoading) {
      wx.showToast({ title: '海报生成中，请稍候', icon: 'none' })
      return
    }
    if (!posterImagePath) {
      wx.showToast({ title: '海报尚未生成', icon: 'none' })
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath: posterImagePath,
      success() {
        wx.showToast({ title: '已保存到相册', icon: 'success' })
      },
      fail(err) {
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中开启相册权限后重试',
            confirmText: '去设置',
            success(r) {
              if (r.confirm) wx.openSetting()
            }
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

  // ——— 分享到朋友圈（原生） ———
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
      // iOS 降级为生成海报
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
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' })
          }
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

  // 阻止事件冒泡（操作栏用）
  stopPropagation() {},
})