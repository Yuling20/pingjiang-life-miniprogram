// pages/community/community.js
// 平江贴吧首页 - 完整版（含点赞/评论/关注/转发/分享海报/举报）

// ============================================================
// 前端敏感词库（生产环境应从服务端下发并加密存储）
// ============================================================
const SENSITIVE_WORDS = [
  '广告', '代开发票', '办证', '贷款', '赌博', '色情', '暴力',
  '反动', '邪教', '法轮功', '六四', '台独', '藏独', '疆独',
  '黄赌毒', '诈骗', '传销', '私彩', '枪支', '炸弹'
]

// ============================================================
// 模拟假数据 - 帖子列表（预留后端字段）
// ============================================================
const MOCK_POSTS = [
  {
    id: '101',
    userId: 'u001',
    avatar: '/images/icons/avatar.png',
    nickname: '平江老表',
    badge: '本地居民',       // 用户标签
    isVip: false,            // VIP状态（预留付费扩展）
    vipLevel: 0,             // VIP等级 1-5（预留）
    time: '10分钟前',
    isFollowed: false,
    content: '平江县天岳广场今天好热闹，有活动！大家快去看，带孩子去耍一下，气氛超好的👍',
    tags: ['#天岳广场', '#平江活动'],
    images: [],
    video: '',
    likes: 38,
    comments: 12,
    shares: 5,
    isLiked: false,
    isReported: false        // 举报状态（预留）
  },
  {
    id: '102',
    userId: 'u002',
    avatar: '/images/icons/avatar.png',
    nickname: '汉昌居民',
    badge: '',
    isVip: true,
    vipLevel: 2,
    time: '32分钟前',
    isFollowed: true,
    content: '平江高铁站附近停车方便吗？下周要去接人，求指路🙏',
    tags: ['#高铁站', '#停车'],
    images: [],
    video: '',
    likes: 15,
    comments: 8,
    shares: 2,
    isLiked: false,
    isReported: false
  },
  {
    id: '103',
    userId: 'u003',
    avatar: '/images/icons/avatar.png',
    nickname: '嘉义街坊',
    badge: '老平江',
    isVip: false,
    vipLevel: 0,
    time: '1小时前',
    isFollowed: false,
    content: '推荐一下平江的酱干，走亲戚带这个最有面子，外地朋友都说好吃！有没有人知道哪家最正宗？',
    tags: ['#平江酱干', '#美食推荐'],
    images: [],
    video: '',
    likes: 66,
    comments: 23,
    shares: 18,
    isLiked: true,
    isReported: false
  },
  {
    id: '104',
    userId: 'u004',
    avatar: '/images/icons/avatar.png',
    nickname: '天岳山人',
    badge: '',
    isVip: false,
    vipLevel: 0,
    time: '2小时前',
    isFollowed: false,
    content: '今天天气不错，带娃去天岳山爬山，空气真好，强烈推荐周末去！',
    tags: ['#天岳山', '#亲子游'],
    images: [],
    video: '',
    likes: 42,
    comments: 17,
    shares: 8,
    isLiked: false,
    isReported: false
  },
  {
    id: '105',
    userId: 'u005',
    avatar: '/images/icons/avatar.png',
    nickname: '平江新市民',
    badge: '',
    isVip: false,
    vipLevel: 0,
    time: '3小时前',
    isFollowed: false,
    content: '刚搬来平江，想问问大家哪里买菜比较新鲜实惠？菜市场在哪？',
    tags: ['#新市民', '#生活问答'],
    images: [],
    video: '',
    likes: 9,
    comments: 31,
    shares: 3,
    isLiked: false,
    isReported: false
  }
]

Page({
  data: {
    // --- 公告 ---
    showNotice: true,
    noticeText: '文明合规交流，共建平江友好社区，禁止发布广告、低俗、违法内容，违规账号将被封禁',

    // --- Tab ---
    tabs: ['推荐', '最新'],
    activeTab: 0,

    // --- 帖子列表 ---
    posts: [],
    page: 1,
    hasMore: true,
    isLoading: false,

    // --- 分享海报弹窗 ---
    showPosterModal: false,
    posterPost: null,

    // --- 系统信息 ---
    isIOS: false
  },

  onLoad() {
    // 读取公告关闭缓存
    const closed = wx.getStorageSync('community_notice_closed')
    if (closed) this.setData({ showNotice: false })

    // 检测系统（用于转发分级处理）
    const sysInfo = wx.getSystemInfoSync()
    this.setData({ isIOS: sysInfo.platform === 'ios' })

    this.loadPosts(true)
  },

  // 页面显示时刷新（从发帖页返回后触发）
  onShow() {
    if (this._needRefresh) {
      this._needRefresh = false
      this.loadPosts(true)
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadPosts(true, () => wx.stopPullDownRefresh())
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadPosts(false)
    }
  },

  // ============================================================
  // 加载帖子（模拟分页，预留 API 对接参数）
  // ============================================================
  loadPosts(isRefresh, callback) {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })

    const page = isRefresh ? 1 : this.data.page

    // TODO: 替换为真实接口: GET /api/community/posts?tab=${activeTab}&page=${page}&pageSize=5
    setTimeout(() => {
      // 模拟第3页后无更多数据
      const hasMore = page < 3
      const newPosts = MOCK_POSTS.map(p => ({
        ...p,
        id: p.id + '_p' + page  // 分页模拟不同 id
      }))
      const posts = isRefresh ? newPosts : [...this.data.posts, ...newPosts]

      this.setData({
        posts,
        page: page + 1,
        hasMore,
        isLoading: false
      })
      callback && callback()
    }, 600)
  },

  // ============================================================
  // 公告
  // ============================================================
  closeNotice() {
    this.setData({ showNotice: false })
    wx.setStorageSync('community_notice_closed', true)
  },

  // ============================================================
  // Tab 切换
  // ============================================================
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    if (index === this.data.activeTab) return
    this.setData({ activeTab: index })
    this.loadPosts(true)
  },

  // ============================================================
  // 关注 / 取关
  // ============================================================
  toggleFollow(e) {
    // 前置实名校验
    if (!this._checkAuth('关注')) return

    const id = e.currentTarget.dataset.id
    const posts = this.data.posts.map(p => {
      if (p.id === id) {
        const followed = !p.isFollowed
        wx.showToast({ title: followed ? '已关注' : '已取消关注', icon: 'none' })
        return { ...p, isFollowed: followed }
      }
      return p
    })
    this.setData({ posts })
    // TODO: POST /api/community/follow { targetUserId, action: 'follow'|'unfollow' }
  },

  // ============================================================
  // 点赞 / 取消点赞
  // ============================================================
  toggleLike(e) {
    if (!this._checkAuth('点赞')) return

    const id = e.currentTarget.dataset.id
    const posts = this.data.posts.map(p => {
      if (p.id === id) {
        const liked = !p.isLiked
        return { ...p, isLiked: liked, likes: liked ? p.likes + 1 : p.likes - 1 }
      }
      return p
    })
    this.setData({ posts })
    // TODO: POST /api/community/like { postId: id, action: 'like'|'unlike' }
  },

  // ============================================================
  // 跳转评论页
  // ============================================================
  goComment(e) {
    if (!this._checkAuth('评论')) return
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/community/comment/index?postId=${id}` })
  },

  // ============================================================
  // 私信（VIP限定）
  // ============================================================
  goMessage(e) {
    const isVip = e.currentTarget.dataset.isvip
    if (!this._checkAuth('私信')) return

    if (!isVip) {
      // 非VIP弹出升级提示（预留VIP付费入口）
      wx.showModal({
        title: '会员专属功能',
        content: '私信功能仅限VIP会员使用，开通会员享受更多特权',
        confirmText: '了解会员',
        cancelText: '暂不',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: 'VIP功能即将上线', icon: 'none' })
            // TODO: wx.navigateTo({ url: '/pages/vip/vip' })
          }
        }
      })
      return
    }
    // TODO: wx.navigateTo({ url: `/pages/message/chat?userId=${userId}` })
    wx.showToast({ title: '私信功能即将上线', icon: 'none' })
  },

  // ============================================================
  // 转发（核心）- 分级处理
  // ============================================================
  goShare(e) {
    if (!this._checkAuth('转发')) return

    const id = e.currentTarget.dataset.id
    const post = this.data.posts.find(p => p.id === id)
    if (!post) return

    // 转发方式选择
    wx.showActionSheet({
      itemList: ['分享给微信好友/群聊', '生成分享海报'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 微信好友/群聊分享：通过 onShareAppMessage 实现
          // 存储当前分享帖子供 onShareAppMessage 读取
          this._sharePost = post
          wx.showToast({ title: '请点击右上角分享', icon: 'none', duration: 2000 })
        } else if (res.tapIndex === 1) {
          // 生成海报
          this.generatePoster(post)
        }
      }
    })
  },

  // 微信原生转发回调
  onShareAppMessage() {
    const post = this._sharePost || this.data.posts[0]
    return {
      title: post ? `${post.nickname}：${post.content.slice(0, 30)}...` : '平江贴吧',
      path: `/pages/community/community`,
      imageUrl: '/images/icons/tab_community_acti.png'
      // TODO: 替换为真实封面图，path 追加 ?postId=xxx 实现直达
    }
  },

  // ============================================================
  // 生成分享海报（Canvas 绘制）
  // ============================================================
  generatePoster(post) {
    wx.showLoading({ title: '生成海报中...', mask: true })

    // 使用 Canvas 2D API 绘制海报
    const query = wx.createSelectorQuery().in(this)
    query.select('#posterCanvas').fields({ node: true, size: true }, (res) => {
      if (!res || !res.node) {
        wx.hideLoading()
        wx.showToast({ title: '海报生成失败', icon: 'none' })
        return
      }

      const canvas = res.node
      const ctx = canvas.getContext('2d')
      const W = 750, H = 1050  // 海报尺寸（rpx基准）

      canvas.width = W
      canvas.height = H

      // 背景
      ctx.fillStyle = '#FFF8EE'
      ctx.fillRect(0, 0, W, H)

      // 顶部标题
      ctx.fillStyle = '#D4820A'
      ctx.font = 'bold 48px sans-serif'
      ctx.fillText('平江贴吧', 40, 80)

      // 昵称
      ctx.fillStyle = '#333333'
      ctx.font = '36px sans-serif'
      ctx.fillText(post.nickname, 40, 160)

      // 时间
      ctx.fillStyle = '#999999'
      ctx.font = '28px sans-serif'
      ctx.fillText(post.time, 40, 210)

      // 分割线
      ctx.strokeStyle = '#E8DDD0'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(40, 240)
      ctx.lineTo(W - 40, 240)
      ctx.stroke()

      // 正文（自动换行）
      ctx.fillStyle = '#333333'
      ctx.font = '32px sans-serif'
      const lines = this._wrapText(ctx, post.content, W - 80, 32)
      lines.forEach((line, i) => {
        ctx.fillText(line, 40, 300 + i * 52)
      })

      // 底部水印
      ctx.fillStyle = '#AAAAAA'
      ctx.font = '26px sans-serif'
      ctx.fillText('来自平江汇生活小程序', 40, H - 60)

      // 导出并保存
      wx.canvasToTempFilePath({
        canvas,
        success: (imgRes) => {
          wx.hideLoading()
          this._savePosterToAlbum(imgRes.tempFilePath)
        },
        fail: () => {
          wx.hideLoading()
          wx.showToast({ title: '海报生成失败', icon: 'none' })
        }
      })
    })
    query.exec()
  },

  // 保存海报到相册
  _savePosterToAlbum(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath,
      success: () => {
        wx.showModal({
          title: '海报已保存',
          content: '分享海报已保存到相册，快去分享给朋友吧！',
          showCancel: false
        })
      },
      fail: (err) => {
        if (err.errMsg.includes('auth deny')) {
          // 引导用户开启相册权限
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中允许访问相册',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) wx.openSetting()
            }
          })
        } else {
          wx.showToast({ title: '保存失败，请重试', icon: 'none' })
        }
      }
    })
  },

  // Canvas 文字自动换行工具
  _wrapText(ctx, text, maxWidth, lineHeight) {
    const chars = text.split('')
    const lines = []
    let line = ''
    chars.forEach(char => {
      const testLine = line + char
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line)
        line = char
      } else {
        line = testLine
      }
    })
    if (line) lines.push(line)
    return lines.slice(0, 8) // 最多8行
  },

  // ============================================================
  // 举报
  // ============================================================
  reportPost(e) {
    if (!this._checkAuth('举报')) return
    const id = e.currentTarget.dataset.id
    wx.showActionSheet({
      itemList: ['广告骚扰', '色情低俗', '政治敏感', '诈骗信息', '其他'],
      success: (res) => {
        const types = ['广告骚扰', '色情低俗', '政治敏感', '诈骗信息', '其他']
        // TODO: POST /api/community/report { postId: id, type: types[res.tapIndex] }
        wx.showToast({ title: '举报已提交，感谢反馈', icon: 'success' })
      }
    })
  },

  // ============================================================
  // 跳转用户主页
  // ============================================================
  goUserPage(e) {
    const userId = e.currentTarget.dataset.userid
    wx.navigateTo({ url: `/pages/community/user/index?userId=${userId}` })
  },

  // ============================================================
  // 跳转关注粉丝页
  // ============================================================
  goFollow() {
    wx.navigateTo({ url: '/pages/community/follow/index' })
  },

  // ============================================================
  // 跳转发帖页
  // ============================================================
  goPublish() {
    wx.navigateTo({
      url: '/pages/community/publish/index',
      fail: (err) => {
        console.error('跳转发帖页失败：', err)
        wx.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
  },

  // ============================================================
  // 实名授权前置校验（所有互动操作统一入口）
  // ============================================================
  _checkAuth(action) {
    // 读取本地授权缓存
    const isAuthed = wx.getStorageSync('user_authed')
    if (isAuthed) return true

    // 未授权 → 弹窗引导
    wx.showModal({
      title: `${action}需要实名授权`,
      content: '为保障社区安全，请先完成微信实名授权',
      confirmText: '立即授权',
      success: (res) => {
        if (res.confirm) this._requestAuth()
      }
    })
    return false
  },

  // 请求授权
  _requestAuth() {
    wx.getUserProfile({
      desc: '用于社区互动实名认证',
      success: (res) => {
        wx.setStorageSync('user_authed', true)
        wx.setStorageSync('user_info', res.userInfo)
        wx.showToast({ title: '授权成功', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '授权失败，请重试', icon: 'none' })
      }
    })
  }
})
