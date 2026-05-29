// pages/community/community.js
// 平江贴吧社区首页：话题Tab + 帖子列表 + 点赞 + 跳转

const TABS = [
  { id: 0, label: '全部' },
  { id: 1, label: '📢 公告' },
  { id: 2, label: '🍜 美食' },
  { id: 3, label: '🏠 租房' },
  { id: 4, label: '🎉 活动' },
  { id: 5, label: '🐾 宠物' },
  { id: 6, label: '💼 招聘' },
  { id: 7, label: '🏔️ 旅游' },
  { id: 8, label: '🎓 教育' }
]

const MOCK_POSTS = [
  {
    id: 1, userId: 'u1',
    avatar: '/images/avatar.png', nickname: '平江老表',
    time: '10分钟前', topic: '活动', isTop: true,
    content: '天岳广场今天有大型民俗表演！平江花鼓戏免费看，晚上7点开始，带家人一起来！精彩节目不容错过，老人小孩都喜欢👍',
    images: [], likes: 128, comments: 36, isLiked: false
  },
  {
    id: 2, userId: 'u2',
    avatar: '/images/avatar.png', nickname: '汉昌居民',
    time: '32分钟前', topic: '美食', isTop: false,
    content: '推荐一下平江酱干，走亲戚带这个最有面子，大家觉得哪家最正宗？我知道有几家老店味道很好，欢迎大家来聊聊～',
    images: [], likes: 56, comments: 18, isLiked: true
  },
  {
    id: 3, userId: 'u3',
    avatar: '/images/avatar.png', nickname: '嘉义街坊',
    time: '1小时前', topic: '租房', isTop: false,
    content: '嘉义路附近有两室一厅出租，1200元/月，拎包入住，交通方便，距离学校500米，适合有孩子的家庭，联系我！',
    images: [], likes: 23, comments: 8, isLiked: false
  },
  {
    id: 4, userId: 'u4',
    avatar: '/images/avatar.png', nickname: '天岳山人',
    time: '2小时前', topic: '旅游', isTop: false,
    content: '今天带娃爬了天岳山，秋天的景色真的很美！山顶视野好，空气清新，全程约2小时，适合周末亲子游，推荐大家去！',
    images: [], likes: 89, comments: 24, isLiked: false
  },
  {
    id: 5, userId: 'u5',
    avatar: '/images/avatar.png', nickname: '平江新居民',
    time: '3小时前', topic: '教育', isTop: false,
    content: '请问平江县城哪个小学比较好？刚搬过来，想给孩子找一所教学质量好的小学，希望本地家长给点建议，谢谢大家！',
    images: [], likes: 34, comments: 42, isLiked: false
  }
]

Page({
  data: {
    tabs: TABS,
    activeTab: 0,
    posts: [],
    allPosts: MOCK_POSTS,
    isLoading: false,
    hasMore: true,
    page: 1
  },

  onLoad() {
    this.loadPosts(true)
  },

  onShow() {
    // 从发帖页返回时刷新列表
    const refresh = wx.getStorageSync('community_refresh')
    if (refresh) {
      wx.removeStorageSync('community_refresh')
      this.loadPosts(true)
    }
  },

  onPullDownRefresh() {
    this.loadPosts(true)
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadPosts(false)
    }
  },

  // =============================================
  // 加载帖子列表
  // =============================================
  loadPosts(isRefresh) {
    if (this.data.isLoading) return
    this.setData({ isLoading: true })
    const page = isRefresh ? 1 : this.data.page
    const tabId = this.data.tabs[this.data.activeTab].id

    setTimeout(() => {
      // TODO: 替换为接口 GET /api/post/list?tab=&page=
      let result = this.data.allPosts
      if (tabId !== 0) {
        const tabLabel = this.data.tabs[this.data.activeTab].label.replace(/[^\u4e00-\u9fa5]/g, '').trim()
        result = this.data.allPosts.filter(p => p.topic === tabLabel)
      }
      const posts = isRefresh ? result : [...this.data.posts, ...result]
      this.setData({
        posts,
        page: page + 1,
        hasMore: page < 2,
        isLoading: false
      })
    }, 500)
  },

  // =============================================
  // 切换话题 Tab
  // =============================================
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ activeTab: index, posts: [], page: 1, hasMore: true })
    this.loadPosts(true)
  },

  // =============================================
  // 帖子点赞
  // =============================================
  toggleLike(e) {
    const { id, index } = e.currentTarget.dataset
    const posts = this.data.posts.map((p, i) => {
      if (i === index) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        }
      }
      return p
    })
    this.setData({ posts })
    // TODO: POST /api/post/like { postId: id }
  },

  // =============================================
  // 跳转帖子详情
  // =============================================
  goDetail(e) {
    wx.navigateTo({ url: `./detail/index?id=${e.currentTarget.dataset.id}` })
  },

  // =============================================
  // 跳转个人主页
  // =============================================
  goUser(e) {
    wx.navigateTo({ url: `./user/index?userId=${e.currentTarget.dataset.id}` })
  },

  // =============================================
  // 跳转发帖页
  // =============================================
  goPublish() {
    wx.navigateTo({ url: './publish/index' })
  },

  // =============================================
  // 搜索（预留）
  // =============================================
  goSearch() {
    wx.showToast({ title: '搜索功能即将上线', icon: 'none' })
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
  // 转发
  // =============================================
  sharePost(e) {
    wx.showActionSheet({
      itemList: ['发给好友/群', '生成分享海报'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showToast({ title: '请点击右上角菜单转发', icon: 'none' })
        } else {
          wx.showToast({ title: '海报功能即将上线', icon: 'none' })
        }
      }
    })
  },

  // =============================================
  // 微信分享配置
  // =============================================
  onShareAppMessage() {
    return {
      title: '平江贴吧 - 聊聊平江那些事',
      path: '/pages/community/community'
    }
  }
})
