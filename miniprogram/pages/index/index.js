// pages/home/index.js
const app = getApp()

Page({
  data: {
    bannerList: [
      { id: 1, text: '本周话题：医院搬过来后你最期待什么？已有36人参与讨论' },
    ],
    quickLinks: [
      { id: 1, name: '医院专区', icon: '🏥', path: '/pages/services/convenience/hospital/hospital' },
      { id: 2, name: '招聘求职', icon: '💼', path: '/pages/services/convenience/job/job' },
      { id: 3, name: '房屋租售', icon: '🏠', path: '/pages/services/convenience/rental/rental' },
      { id: 4, name: '停水停电', icon: '⚡', path: '/pages/services/convenience/water/water' },
    ],
    // ✅ 便民服务入口 - 路径严格对应你的文件夹名
    serviceList: [
      { id: 1, name: '找工作',   icon: '💼', path: '/pages/services/convenience/job/job' },
      { id: 2, name: '房屋租赁', icon: '🏠', path: '/pages/services/convenience/rental/rental' },
      { id: 3, name: '家政维修', icon: '🔧', path: '/pages/services/convenience/homeservice/homeservice' },
      { id: 4, name: '停水停电', icon: '⚡', path: '/pages/services/convenience/water/water' },
      { id: 5, name: '办事指南', icon: '📋', path: '/pages/services/convenience/guide/guide' },
      { id: 6, name: '医院挂号', icon: '🏥', path: '/pages/services/convenience/hospital/hospital' },
    ],
    articleList: []
  },

  onLoad() {
    console.log('首页加载完成')
    this.loadArticles()
  },

  // 加载文章
  loadArticles() {
    const articles = [
      { id: 1, title: '便利店开业优惠', desc: '全场8折，限时3天', time: '今天' },
      { id: 2, title: '平江美食推荐', desc: '本地人最爱的10家餐厅', time: '昨天' },
    ]
    this.setData({ articleList: articles })
  },

  // ✅ 核心修复：首页便民服务点击跳转
  onServiceTap(e) {
    const path = e.currentTarget.dataset.path
    console.log('跳转路径：', path)
    if (!path) {
      wx.showToast({ title: '功能开发中', icon: 'none' })
      return
    }
    wx.navigateTo({
      url: path,
      fail(err) {
        console.error('跳转失败：', err)
        wx.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
  },

  // 快捷入口点击
  onQuickTap(e) {
    const path = e.currentTarget.dataset.path
    if (!path) return
    wx.navigateTo({
      url: path,
      fail(err) {
        console.error('快捷入口跳转失败：', err)
      }
    })
  },

  // 查看全部便民服务
  onViewAll() {
    wx.switchTab({
      url: '/pages/services/index'
    })
  },

  // 文章点击
  onArticleTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/community/detail?id=${id}`
    })
  },

  onPullDownRefresh() {
    this.loadArticles()
    wx.stopPullDownRefresh()
  }
})
