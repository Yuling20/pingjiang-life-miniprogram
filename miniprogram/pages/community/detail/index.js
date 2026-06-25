// pages/community/detail/index.js
// 帖子详情页：展示帖子全文、评论列表、点赞、关注作者、跳转评论页

// 修复路径：从 ../../../utils/points 改为 ../../points/points
const { addPoints } = require('../../points/points')

const MOCK_POSTS = {
  1: {
    id: 1, userId: 'u1',
    avatar: '/images/avatar.png', nickname: '平江老表',
    badge: '本地居民', time: '10分钟前', topic: '活动', isTop: true,
    content: '天岳广场今天有大型民俗表演！平江花鼓戏免费看，晚上7点开始，带家人一起来！精彩节目不容错过，老人小孩都喜欢。今年的节目质量比往年更好，还有本地非遗展示，平江擂茶文化体验，现场还有美食摊位，整个广场热闹非凡，强烈推荐！',
    images: [], likes: 128, comments: 36, views: 1024, isLiked: false, isFollowed: false
  },
  2: {
    id: 2, userId: 'u2',
    avatar: '/images/avatar.png', nickname: '汉昌居民',
    badge: '', time: '32分钟前', topic: '美食', isTop: false,
    content: '推荐一下平江酱干，走亲戚带这个最有面子，大家觉得哪家最正宗？我知道有几家老店味道很好，欢迎大家来聊聊～平江酱干是我们这里的特产，历史悠久，口感独特，外省朋友来了都赞不绝口！',
    images: [], likes: 56, comments: 18, views: 380, isLiked: true, isFollowed: true
  }
}

const MOCK_COMMENTS = [
  {
    id: 101, userId: 'u2',
    avatar: '/images/avatar.png', nickname: '汉昌居民',
    time: '8分钟前', content: '好的，明晚我带孩子去看！感谢分享，上次的花鼓戏表演真的很精彩！',
    likes: 12, isLiked: false,
    replyTotal: 2, replies: [
      { id: 1011, nickname: '平江老表', content: '欢迎！一定不会让你失望的！' }
    ]
  },
  {
    id: 102, userId: 'u3',
    avatar: '/images/avatar.png', nickname: '嘉义街坊',
    time: '15分钟前', content: '平江的传统文化活动越来越丰富了，为咱们平江点赞！',
    likes: 8, isLiked: false, replyTotal: 0, replies: []
  },
  {
    id: 103, userId: 'u4',
    avatar: '/images/avatar.png', nickname: '天岳山人',
    time: '22分钟前', content: '我每次都去，今年一定不能缺席！广场的氛围特别好，邻居们都会来。',
    likes: 5, isLiked: true, replyTotal: 0, replies: []
  }
]

Page({
  data: {
    postId: null,
    post: {},
    comments: [],
    isLoading: false,
    hasMore: true
  },

  onLoad(options) {
    const postId = parseInt(options.id) || 1
    this.setData({ postId })
    this.loadPost(postId)
    this.loadComments(postId)
  },

  onPullDownRefresh() {
    this.loadPost(this.data.postId)
    this.loadComments(this.data.postId)
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadComments(this.data.postId)
    }
  },

  // =============================================
  // 加载帖子详情
  // =============================================
  loadPost(postId) {
    // TODO: 替换为接口 GET /api/post/:id
    const post = MOCK_POSTS[postId] || MOCK_POSTS[1]
    this.setData({ post })
    wx.setNavigationBarTitle({ title: post.nickname + ' 的帖子' })
  },

  // =============================================
  // 加载评论列表
  // =============================================
  loadComments(postId) {
    this.setData({ isLoading: true })
    setTimeout(() => {
      // TODO: 替换为接口 GET /api/comment/list?postId=&page=
      this.setData({
        comments: MOCK_COMMENTS,
        isLoading: false,
        hasMore: false
      })
    }, 400)
  },

  // =============================================
  // ✅ 帖子点赞（含积分：被他人点赞作者+2，防自赞）
  // =============================================
  toggleLike() {
    const { post } = this.data
    const currentUserId = wx.getStorageSync('userId') || ''

    // 防止自己给自己点赞
    if (currentUserId && currentUserId === String(post.userId)) {
      wx.showToast({ title: '不能给自己点赞哦', icon: 'none' })
      return
    }

    const isLiked = !post.isLiked
    const likes   = isLiked ? post.likes + 1 : post.likes - 1
    this.setData({ post: { ...post, isLiked, likes } })

    // 点赞成功时给帖子作者累积积分
    // 实际接口场景：由服务端在 POST /api/post/like 响应后写积分
    // 当前本地模拟：仅当前用户 storage 中累积（演示用）
    if (isLiked) {
      const result = addPoints('LIKED')
      wx.showToast({
        title: result.added > 0 ? `已点赞 · 作者+${result.added}积分` : '已点赞',
        icon: 'none'
      })
    } else {
      wx.showToast({ title: '取消点赞', icon: 'none' })
    }

    // TODO: POST /api/post/like { postId: post.id }
  },

  // =============================================
  // 关注作者（原有逻辑不变）
  // =============================================
  toggleFollow(e) {
    const { post } = this.data
    if (!wx.getStorageSync('user_authed')) {
      wx.showToast({ title: '请先完成授权', icon: 'none' })
      return
    }
    const isFollowed = !post.isFollowed
    this.setData({ post: { ...post, isFollowed } })
    wx.showToast({ title: isFollowed ? '关注成功' : '已取关', icon: 'success' })
    // TODO: POST /api/follow { targetUserId: post.userId }
  },

  // =============================================
  // ✅ 评论点赞（含防自赞）
  // =============================================
  likeComment(e) {
    const { id, index } = e.currentTarget.dataset
    const currentUserId = wx.getStorageSync('userId') || ''
    const comment       = this.data.comments[index]

    // 防止给自己的评论点赞
    if (currentUserId && currentUserId === String(comment.userId)) {
      wx.showToast({ title: '不能给自己的评论点赞哦', icon: 'none' })
      return
    }

    const comments = this.data.comments.map((c, i) => {
      if (i === index) {
        return {
          ...c,
          isLiked: !c.isLiked,
          likes:    c.isLiked ? c.likes - 1 : c.likes + 1
        }
      }
      return c
    })
    this.setData({ comments })
    // TODO: POST /api/comment/like { commentId: id }
  },

  // =============================================
  // 展开更多回复（原有逻辑不变）
  // =============================================
  loadMoreReply(e) {
    const { id, index } = e.currentTarget.dataset
    wx.showToast({ title: '更多回复加载中...', icon: 'none' })
    // TODO: GET /api/comment/reply?commentId=&page=
  },

  // =============================================
  // ✅ 跳转评论页（发表评论后给帖子作者+2积分）
  // 积分实际在 comment/index.js 提交成功时触发
  // 此处仅做跳转，不重复计分
  // =============================================
  goComment() {
    wx.navigateTo({
      url: `../comment/index?postId=${this.data.postId}&authorId=${this.data.post.userId}`
    })
  },

  goReply(e) {
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `../comment/index?postId=${this.data.postId}&replyId=${id}&replyName=${encodeURIComponent(name)}&authorId=${this.data.post.userId}`
    })
  },

  // =============================================
  // 跳转个人主页（原有逻辑不变）
  // =============================================
  goUser(e) {
    wx.navigateTo({ url: `../user/index?userId=${e.currentTarget.dataset.id}` })
  },

  // =============================================
  // 图片预览（原有逻辑不变）
  // =============================================
  previewImg(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls:    e.currentTarget.dataset.list
    })
  },

  // =============================================
  // 举报评论（原有逻辑不变）
  // =============================================
  reportComment(e) {
    wx.showModal({
      title:        '举报评论',
      content:      '确认举报该评论？',
      confirmText:  '举报',
      confirmColor: '#E53935',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '举报已提交', icon: 'none' })
          // TODO: POST /api/report { type: 'comment', id: e.currentTarget.dataset.id }
        }
      }
    })
  },

  // =============================================
  // ✅ 转发帖子（转发给朋友+10积分 / 朋友圈+20积分）
  // =============================================
  sharePost() {
    wx.showActionSheet({
      itemList: ['发给好友/群', '分享到朋友圈', '生成分享海报'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 触发微信自带转发，积分在 onShareAppMessage 回调中计入
          wx.showToast({ title: '请点击右上角菜单转发', icon: 'none' })
        } else if (res.tapIndex === 1) {
          wx.showToast({ title: '请点击右上角菜单分享到朋友圈', icon: 'none' })
        } else {
          wx.showToast({ title: '海报功能即将上线', icon: 'none' })
        }
      }
    })
  },

  // =============================================
  // ✅ 微信转发给朋友 → +10积分
  // =============================================
  onShareAppMessage() {
    const { post } = this.data
    const result   = addPoints('SHARE_FRIEND')

    if (result.added > 0) {
      wx.showToast({ title: `+${result.added}积分 转发好友`, icon: 'none', duration: 1500 })
    }

    return {
      title: post.content ? post.content.slice(0, 30) + '...' : '平江汇 · 本地生活社区',
      path:  `/pages/community/detail/index?id=${post.id}`
    }
  },

  // =============================================
  // ✅ 微信分享到朋友圈 → +20积分
  // =============================================
  onShareTimeline() {
    const { post } = this.data
    const result   = addPoints('SHARE_MOMENTS')

    if (result.added > 0) {
      wx.showToast({ title: `+${result.added}积分 朋友圈分享`, icon: 'none', duration: 1500 })
    }

    return {
      title: post.content ? post.content.slice(0, 30) + '...' : '平江汇 · 本地生活社区',
      query: `id=${post.id}`
    }
  }
})