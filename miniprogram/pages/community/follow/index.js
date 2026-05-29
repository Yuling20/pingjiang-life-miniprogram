// pages/community/follow/index.js
// 关注粉丝页 - 含 Tab 切换、搜索过滤、关注/取关、回关、防误操作确认

// 模拟当前登录用户ID
const MY_USER_ID = 'u_me'

// 模拟关注列表（替换为接口 GET /api/follow/list?userId=&type=follow）
const MOCK_FOLLOW = [
  {
    userId: 'u1', avatar: '/images/avatar.png',
    nickname: '平江老表', bio: '土生土长平江人，爱分享本地生活',
    badge: '本地居民', isVip: false,
    postCount: 47, fansCount: 360, isMutual: true, isFollowed: true
  },
  {
    userId: 'u3', avatar: '/images/avatar.png',
    nickname: '嘉义街坊', bio: 'VIP用户，热爱美食，经常探店',
    badge: '', isVip: true,
    postCount: 89, fansCount: 1024, isMutual: false, isFollowed: true
  },
  {
    userId: 'u4', avatar: '/images/avatar.png',
    nickname: '天岳山人', bio: '爱爬山，平江天岳山是我家',
    badge: '', isVip: false,
    postCount: 23, fansCount: 180, isMutual: false, isFollowed: true
  }
]

// 模拟粉丝列表（替换为接口 GET /api/follow/list?userId=&type=fans）
const MOCK_FANS = [
  {
    userId: 'u1', avatar: '/images/avatar.png',
    nickname: '平江老表', bio: '土生土长平江人，爱分享本地生活',
    badge: '本地居民', isVip: false,
    postCount: 47, fansCount: 360, isMutual: true, isFollowed: true
  },
  {
    userId: 'u2', avatar: '/images/avatar.png',
    nickname: '汉昌居民', bio: '平江县汉昌街道，普通市民一枚',
    badge: '', isVip: false,
    postCount: 18, fansCount: 120, isMutual: false, isFollowed: false
  },
  {
    userId: 'u5', avatar: '/images/avatar.png',
    nickname: '平江新来的', bio: '刚搬到平江，什么都不熟悉',
    badge: '', isVip: false,
    postCount: 3, fansCount: 5, isMutual: false, isFollowed: false
  }
]

Page({
  data: {
    userId: MY_USER_ID,  // 当前查看的用户ID
    isSelf: true,         // 是否是自己的列表
    activeTab: 0,         // 0=关注 1=粉丝
    followList: [],       // 关注列表（全量）
    fansList: [],         // 粉丝列表（全量）
    filteredFollow: [],   // 过滤后关注列表
    filteredFans: [],     // 过滤后粉丝列表
    searchVal: '',        // 搜索关键词
    isLoading: false,
    hasMore: false
  },

  onLoad(options) {
    const userId = options.userId || MY_USER_ID
    const tab = parseInt(options.tab) || 0
    const isSelf = userId === MY_USER_ID
    this.setData({ userId, isSelf, activeTab: tab })
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData()
    wx.stopPullDownRefresh()
  },

  // =============================================
  // 加载关注/粉丝数据
  // =============================================
  loadData() {
    this.setData({ isLoading: true })
    setTimeout(() => {
      // TODO: 替换为接口
      // GET /api/follow/list?userId=&type=follow
      // GET /api/follow/list?userId=&type=fans
      this.setData({
        followList: MOCK_FOLLOW,
        fansList: MOCK_FANS,
        filteredFollow: MOCK_FOLLOW,
        filteredFans: MOCK_FANS,
        isLoading: false,
        hasMore: false
      })
    }, 400)
  },

  // =============================================
  // Tab 切换
  // =============================================
  switchTab(e) {
    const tab = parseInt(e.currentTarget.dataset.tab)
    this.setData({ activeTab: tab, searchVal: '' })
    this.applyFilter('')
  },

  // =============================================
  // 搜索过滤
  // =============================================
  onSearch(e) {
    const val = e.detail.value
    this.setData({ searchVal: val })
    this.applyFilter(val)
  },

  clearSearch() {
    this.setData({ searchVal: '' })
    this.applyFilter('')
  },

  applyFilter(keyword) {
    const kw = keyword.trim().toLowerCase()
    const filteredFollow = kw
      ? this.data.followList.filter(u => u.nickname.toLowerCase().includes(kw))
      : this.data.followList
    const filteredFans = kw
      ? this.data.fansList.filter(u => u.nickname.toLowerCase().includes(kw))
      : this.data.fansList
    this.setData({ filteredFollow, filteredFans })
  },

  // =============================================
  // 取消关注（关注列表中操作）
  // =============================================
  unfollow(e) {
    const { id, index } = e.currentTarget.dataset

    // 实名授权检查
    if (!wx.getStorageSync('user_authed')) {
      wx.showToast({ title: '请先完成实名授权', icon: 'none' })
      return
    }

    wx.showModal({
      title: '取消关注',
      content: `确认取消关注该用户？`,
      confirmText: '取消关注',
      cancelText: '再想想',
      confirmColor: '#E53935',
      success: (res) => {
        if (res.confirm) {
          // 从关注列表移除
          const followList = this.data.followList.filter(u => u.userId !== id)
          // 同步更新粉丝列表中的互关状态
          const fansList = this.data.fansList.map(u => {
            if (u.userId === id) return { ...u, isMutual: false, isFollowed: false }
            return u
          })
          this.setData({ followList, fansList })
          this.applyFilter(this.data.searchVal)
          wx.showToast({ title: '已取消关注', icon: 'success' })
          // TODO: POST /api/follow/unfollow { targetUserId: id }
        }
      }
    })
  },

  // =============================================
  // 回关/取关（粉丝列表中操作）
  // =============================================
  toggleFanFollow(e) {
    const { id, index, followed } = e.currentTarget.dataset

    // 实名授权检查
    if (!wx.getStorageSync('user_authed')) {
      wx.showToast({ title: '请先完成实名授权', icon: 'none' })
      return
    }

    const isFollowed = followed === true || followed === 'true'

    if (isFollowed) {
      // 取关确认
      wx.showModal({
        title: '取消关注', content: '确认取消关注该粉丝？',
        confirmText: '取消关注', cancelText: '再想想',
        confirmColor: '#E53935',
        success: (res) => {
          if (res.confirm) {
            this.doToggleFan(id, false)
          }
        }
      })
    } else {
      // 直接回关
      this.doToggleFan(id, true)
    }
  },

  doToggleFan(userId, toFollow) {
    const fansList = this.data.fansList.map(u => {
      if (u.userId === userId) {
        return { ...u, isFollowed: toFollow, isMutual: toFollow }
      }
      return u
    })
    // 同步关注列表：回关则添加，取关则移除
    let followList = [...this.data.followList]
    if (toFollow) {
      const fan = this.data.fansList.find(u => u.userId === userId)
      if (fan && !followList.find(u => u.userId === userId)) {
        followList = [{ ...fan, isFollowed: true, isMutual: true }, ...followList]
      }
    } else {
      followList = followList.filter(u => u.userId !== userId)
    }

    this.setData({ fansList, followList })
    this.applyFilter(this.data.searchVal)
    wx.showToast({ title: toFollow ? '回关成功' : '已取消关注', icon: 'success' })
    // TODO: POST /api/follow { targetUserId: userId, action: toFollow ? 'follow' : 'unfollow' }
  },

  // =============================================
  // 跳转个人主页
  // =============================================
  goUser(e) {
    wx.navigateTo({ url: `../user/index?userId=${e.currentTarget.dataset.id}` })
  },

  // =============================================
  // 去逛社区（关注为空时引导）
  // =============================================
  goCommunity() {
    wx.navigateBack({ delta: 10 })
  },

  // =============================================
  // 去发帖（粉丝为空时引导）
  // =============================================
  goPublish() {
    wx.navigateTo({ url: '../publish/index' })
  },

  // =============================================
  // 微信分享
  // =============================================
  onShareAppMessage() {
    return {
      title: '平江汇生活 - 发现有趣的平江人',
      path: '/pages/community/index/index'
    }
  }
})
