// pages/community/user/index.js
// 用户个人主页 - 展示头像/昵称/简介/数据/动态列表，含关注、私信、举报功能

// 模拟当前登录用户ID（替换为真实登录体系后删除）
const MY_USER_ID = 'u_me'

// 模拟用户信息（替换为接口 GET /api/user/:id）
const MOCK_USERS = {
  u1: {
    userId: 'u1', uid: '10001',
    avatar: '/images/avatar.png',
    nickname: '平江老表',
    bio: '土生土长平江人，爱分享本地生活，欢迎老表们交流！',
    badge: '本地居民', isVip: false,
    followCount: 128, fansCount: 360, postCount: 47, likedCount: 982,
    isFollowed: false
  },
  u2: {
    userId: 'u2', uid: '10002',
    avatar: '/images/avatar.png',
    nickname: '汉昌居民',
    bio: '平江县汉昌街道，普通市民一枚。',
    badge: '', isVip: false,
    followCount: 56, fansCount: 120, postCount: 18, likedCount: 234,
    isFollowed: true
  },
  u3: {
    userId: 'u3', uid: '10003',
    avatar: '/images/avatar.png',
    nickname: '嘉义街坊',
    bio: 'VIP用户，热爱美食，经常探店平江各大餐厅🍜',
    badge: 'VIP', isVip: true,
    followCount: 307, fansCount: 1024, postCount: 89, likedCount: 3210,
    isFollowed: false
  },
  u_me: {
    userId: 'u_me', uid: '99999',
    avatar: '/images/avatar.png',
    nickname: '我自己',
    bio: '这是我的个人主页',
    badge: '', isVip: false,
    followCount: 20, fansCount: 15, postCount: 5, likedCount: 48,
    isFollowed: false
  }
}

// 模拟用户动态（替换为接口 GET /api/user/:id/posts）
const MOCK_POSTS = [
  {
    id: 1, time: '10分钟前',
    content: '平江县天岳广场今天好热闹，有活动！大家快去看，带孩子去耍一下，气氛超好的👍',
    tags: ['天岳广场', '平江活动'],
    images: [], likes: 38, comments: 12, isLiked: false
  },
  {
    id: 2, time: '昨天 14:30',
    content: '推荐一下平江的酱干，走亲戚带这个最有面子，哪家最正宗大家来聊聊？',
    tags: ['平江酱干', '美食推荐'],
    images: [], likes: 25, comments: 8, isLiked: true
  },
  {
    id: 3, time: '3天前',
    content: '今天天气不错，带娃去天岳山爬山，空气真好！',
    tags: ['天岳山', '亲子游'],
    images: [], likes: 16, comments: 4, isLiked: false
  }
]

Page({
  data: {
    userId: null,    // 当前查看的用户ID
    isSelf: false,   // 是否是自己的主页
    user: {},        // 用户信息
    posts: [],       // 用户动态列表
    page: 1,
    hasMore: true,
    isLoading: false
  },

  onLoad(options) {
    const userId = options.userId || MY_USER_ID
    const isSelf = userId === MY_USER_ID
    this.setData({ userId, isSelf })
    this.loadUser(userId)
    this.loadPosts(userId, true)
  },

  onPullDownRefresh() {
    this.loadUser(this.data.userId)
    this.loadPosts(this.data.userId, true)
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadPosts(this.data.userId, false)
    }
  },

  // =============================================
  // 加载用户信息
  // =============================================
  loadUser(userId) {
    // TODO: 替换为接口 GET /api/user/:id
    const user = MOCK_USERS[userId] || MOCK_USERS['u1']
    this.setData({ user })
    // 设置导航栏标题为用户昵称
    wx.setNavigationBarTitle({ title: user.nickname + ' 的主页' })
  },

  // =============================================
  // 加载用户动态列表（分页）
  // =============================================
  loadPosts(userId, isRefresh) {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })
    const page = isRefresh ? 1 : this.data.page

    setTimeout(() => {
      // TODO: 替换为接口 GET /api/user/:id/posts?page=
      const newPosts = page === 1 ? MOCK_POSTS : []
      const posts = isRefresh ? newPosts : [...this.data.posts, ...newPosts]
      this.setData({
        posts,
        page: page + 1,
        hasMore: page < 2,
        isLoading: false
      })
    }, 500)
  },

  // =============================================
  // 关注 / 取关
  // =============================================
  toggleFollow() {
    const { user, isSelf } = this.data
    if (isSelf) return

    // 实名授权检查
    const authed = wx.getStorageSync('user_authed') || false
    if (!authed) {
      wx.showModal({
        title: '需要授权', content: '关注用户需要实名授权',
        confirmText: '去授权', showCancel: true,
        success: (res) => {
          if (res.confirm) this.doAuth()
        }
      })
      return
    }

    const isFollowed = !user.isFollowed
    const fansCount = isFollowed ? user.fansCount + 1 : user.fansCount - 1
    this.setData({ user: { ...user, isFollowed, fansCount } })
    wx.showToast({ title: isFollowed ? '关注成功' : '已取关', icon: 'success' })
    // TODO: POST /api/follow { targetUserId, action: isFollowed ? 'follow' : 'unfollow' }
  },

  // =============================================
  // 私信（VIP权限判断）
  // =============================================
  goMessage() {
    const currentUserIsVip = wx.getStorageSync('isVip') || false
    if (!currentUserIsVip) {
      wx.showModal({
        title: 'VIP专属功能',
        content: '私信功能仅VIP用户开放，开通VIP即可与TA畅聊',
        confirmText: '了解VIP', showCancel: true,
        success: (res) => {
          if (res.confirm) {
            // TODO: 跳转VIP购买页
            wx.showToast({ title: 'VIP功能即将上线', icon: 'none' })
          }
        }
      })
      return
    }
    // TODO: 跳转私信页
    wx.showToast({ title: '私信功能即将开放', icon: 'none' })
  },

  // =============================================
  // 编辑资料（自己主页时预留）
  // =============================================
  editProfile() {
    // TODO: 跳转编辑资料页
    wx.showToast({ title: '资料编辑功能即将上线', icon: 'none' })
  },

  // =============================================
  // 跳转关注粉丝页（带tab参数）
  // =============================================
  goFollow(e) {
    const { tab, id } = e.currentTarget.dataset
    wx.navigateTo({ url: `../follow/index?userId=${id}&tab=${tab}` })
  },

  // =============================================
  // 跳转评论页
  // =============================================
  goComment(e) {
    wx.navigateTo({ url: `../comment/index?postId=${e.currentTarget.dataset.id}` })
  },

  // =============================================
  // 帖子点赞
  // =============================================
  toggleLike(e) {
    const { id, index } = e.currentTarget.dataset
    const posts = this.data.posts.map((p, i) => {
      if (i === index) {
        return { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
      }
      return p
    })
    this.setData({ posts })
    // TODO: POST /api/post/like { postId: id }
  },

  // =============================================
  // 转发帖子
  // =============================================
  sharePost(e) {
    const item = e.currentTarget.dataset.item
    wx.showActionSheet({
      itemList: ['发给好友/群', '生成分享海报'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showToast({ title: '请点击右上角菜单转发', icon: 'none' })
        } else {
          wx.showToast({ title: '海报生成功能请在首页使用', icon: 'none' })
        }
      }
    })
  },

  // =============================================
  // 举报帖子
  // =============================================
  reportPost(e) {
    wx.showModal({
      title: '举报', content: '确认举报该帖子？', confirmText: '举报',
      confirmColor: '#E53935',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '举报已提交，感谢反馈', icon: 'none' })
          // TODO: POST /api/report { type: 'post', id: e.currentTarget.dataset.id }
        }
      }
    })
  },

  // =============================================
  // 图片预览
  // =============================================
  previewImg(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: e.currentTarget.dataset.list
    })
  },

  // =============================================
  // 实名授权辅助方法
  // =============================================
  doAuth() {
    wx.getUserProfile({
      desc: '操作需实名授权',
      success: (res) => {
        wx.setStorageSync('user_authed', true)
        wx.setStorageSync('user_info', res.userInfo)
        wx.showToast({ title: '授权成功', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' })
      }
    })
  },

  // =============================================
  // 微信分享配置
  // =============================================
  onShareAppMessage() {
    const { user } = this.data
    return {
      title: `${user.nickname} 的平江贴吧主页`,
      path: `/pages/community/user/index?userId=${user.userId}`
    }
  }
})
