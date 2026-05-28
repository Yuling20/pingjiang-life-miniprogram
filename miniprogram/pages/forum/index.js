// pages/forum/index.js
const app = getApp()

Page({
  data: {
    activeTab: 0,
    tabs: ['推荐', '关注', '同城'],
    posts: [],
    loading: false,
    hasMore: true,
    page: 1,
    showPublish: false,
    publishContent: '',
    publishImages: [],
    currentUser: {
      avatar: '/images/default-avatar.png',
      nickname: '我'
    }
  },

  onLoad() {
    this.loadPosts()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, posts: [], hasMore: true })
    this.loadPosts().then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPosts()
    }
  },

  // 加载帖子（模拟数据，后续接云数据库）
  async loadPosts() {
    if (this.data.loading) return
    this.setData({ loading: true })

    // 模拟数据
    await new Promise(r => setTimeout(r, 800))

    const mockPosts = [
      {
        id: '1',
        author: { avatar: '/images/default-avatar.png', nickname: '乡野村民', location: '平江县城' },
        content: '今天拍的夕阳，拍出了点朦胧美，感觉滤镜加的刚刚好 🌅 #平江风景 #摄影日志',
        images: ['/images/placeholder.png', '/images/placeholder.png'],
        time: '23分钟前',
        likes: 28,
        comments: 6,
        isLiked: false,
        tags: ['平江风景', '摄影日志']
      },
      {
        id: '2',
        author: { avatar: '/images/default-avatar.png', nickname: '漫天星辰', location: '嘉义镇' },
        content: '和大家分享一下我养的三角梅，今年开得特别旺！🌸',
        images: ['/images/placeholder.png'],
        time: '1小时前',
        likes: 45,
        comments: 12,
        isLiked: true,
        tags: ['种花日记']
      },
      {
        id: '3',
        author: { avatar: '/images/default-avatar.png', nickname: '平江美食探店', location: '平江县城' },
        content: '平江美食推荐！本地人最爱的10家餐厅，每一家都强烈推荐 😍\n1. 老字号长寿面\n2. 平江酱干\n3. 卤味一条街...',
        images: [],
        time: '2小时前',
        likes: 136,
        comments: 89,
        isLiked: false,
        tags: ['平江美食', '本地推荐']
      },
      {
        id: '4',
        author: { avatar: '/images/default-avatar.png', nickname: '便民信息站', location: '平江' },
        content: '【便民通知】城北便利店本周开业优惠，全场8折，限时3天！欢迎大家来捧场 🎉',
        images: ['/images/placeholder.png'],
        time: '3小时前',
        likes: 67,
        comments: 23,
        isLiked: false,
        tags: ['便民信息', '优惠活动']
      }
    ]

    const posts = this.data.page === 1 ? mockPosts : [...this.data.posts, ...mockPosts]
    this.setData({
      posts,
      loading: false,
      page: this.data.page + 1,
      hasMore: this.data.page < 3
    })
  },

  // 切换标签
  onTabChange(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ activeTab: index, page: 1, posts: [] })
    this.loadPosts()
  },

  // 点赞
  onLike(e) {
    const { id } = e.currentTarget.dataset
    const posts = this.data.posts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        }
      }
      return p
    })
    this.setData({ posts })
  },

  // 跳转评论
  onComment(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/forum/detail/index?id=${id}` })
  },

  // 帖子详情
  onPostTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/forum/detail/index?id=${id}` })
  },

  // 打开发布界面
  openPublish() {
    this.setData({ showPublish: true })
  },

  // 关闭发布界面
  closePublish() {
    this.setData({ showPublish: false, publishContent: '', publishImages: [] })
  },

  // 输入内容
  onContentInput(e) {
    this.setData({ publishContent: e.detail.value })
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 9 - this.data.publishImages.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ publishImages: [...this.data.publishImages, ...newImages] })
      }
    })
  },

  // 删除图片
  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const publishImages = [...this.data.publishImages]
    publishImages.splice(index, 1)
    this.setData({ publishImages })
  },

  // 发布帖子
  publishPost() {
    if (!this.data.publishContent.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }
    wx.showLoading({ title: '发布中...' })
    setTimeout(() => {
      wx.hideLoading()
      this.closePublish()
      wx.showToast({ title: '发布成功！', icon: 'success' })
      this.setData({ page: 1, posts: [] })
      this.loadPosts()
    }, 1000)
  }
})
