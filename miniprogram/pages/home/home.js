// pages/home/home.js
Page({

  data: {
    // 天气数据
    weatherIcon: '☀️',
    weatherDesc: '晴',
    temp: '25',
    wind: '东风2级',
    humidity: '60%',
    airQuality: '空气良',
    airLevel: 'air-good',
    hasNewNotify: true,

    // 轮播图数据
    bannerList: [
      {
        id: 'notice',
        emoji: '🚨',
        tag: '紧急通知',
        title: '杨园小区今日计划停水',
        desc: '14:00 - 18:00  请提前储水备用',
        btnText: '查看详情',
        bg: 'linear-gradient(135deg, #E8450A 0%, #F07030 100%)'
      },
      {
        id: 'job',
        emoji: '💼',
        tag: '置顶推荐',
        title: '平江人民医院急招护工8名',
        desc: '月薪 3500-5000元 · 包住',
        btnText: '立即查看',
        bg: 'linear-gradient(135deg, #1A3A6B 0%, #2E6BC4 100%)'
      },
      {
        id: 'topic',
        emoji: '📢',
        tag: '本周话题',
        title: '"医院搬来后你最期待什么？"',
        desc: '💬 已有36人参与讨论',
        btnText: '去聊聊',
        bg: 'linear-gradient(135deg, #1B6B3A 0%, #2E9E58 100%)'
      },
      {
        id: 'intro',
        emoji: '🏥',
        tag: '平台介绍',
        title: '杨园新城专属生活服务',
        desc: '找工作 · 租房 · 社区互助 · 跑腿配送',
        btnText: '了解服务',
        bg: 'linear-gradient(135deg, #C8700A 0%, #E8B84B 100%)'
      }
    ],

    // 精选内容左列
    leftList: [
      {
        id: 1,
        icon: '🏗️',
        type: 'photo',
        title: '医院建设最新进度来了！',
        location: '杨园新城',
        statIcon: '📸',
        statNum: '12人看过'
      },
      {
        id: 3,
        icon: '🎒',
        type: 'video',
        duration: '2\'35"',
        title: '住院必备清单全分享',
        location: '平江县',
        statIcon: '▶',
        statNum: '156次'
      }
    ],

    // 精选内容右列
    rightList: [
      {
        id: 2,
        icon: '🌿',
        type: 'photo',
        title: '杨园小区邻居随手拍',
        location: '杨园小区',
        statIcon: '❤️',
        statNum: '28人点赞'
      },
      {
        id: 4,
        icon: '💼',
        type: 'job',
        title: '本地招聘 · 护工急招 待遇好',
        location: '平江人民医院',
        statIcon: '💼',
        statNum: '今日发布'
      }
    ]
  },

  onLoad() {
    console.log('首页加载完成')
  },

  // 搜索
  goSearch() {
    wx.showToast({ title: '搜索功能建设中', icon: 'none' })
  },

  // 通知
  goNotify() {
    wx.showToast({ title: '暂无新消息', icon: 'none' })
  },

  // 跳我的
  goMine() {
    wx.switchTab({ url: '/pages/mine/mine' })
  },

  // 轮播图
  goBanner(e) {
    const id = e.currentTarget.dataset.id
    if (id === 'job') {
      wx.switchTab({ url: '/pages/services/services' })
    } else {
      wx.showToast({ title: '功能建设中', icon: 'none' })
    }
  },

  // 快速入口 & 宫格入口
  goServicePage(e) {
    wx.switchTab({ url: '/pages/services/services' })
  },

  goMore() {
    wx.switchTab({ url: '/pages/services/services' })
  },

  goServices() {
    wx.switchTab({ url: '/pages/services/services' })
  },

  goCommunity() {
    wx.switchTab({ url: '/pages/community/community' })
  },

  goCommunityPage(e) {
    wx.switchTab({ url: '/pages/community/community' })
  },

  // 商城提示
  goShopTip() {
    wx.showToast({ title: '敬请期待，即将上线', icon: 'none' })
  },

  // 精选内容
  goContent(e) {
    wx.showToast({ title: '内容详情建设中', icon: 'none' })
  },

  // 加载更多
  loadMore() {
    wx.showToast({ title: '没有更多了', icon: 'none' })
  },

  // 悬浮客服
  goService() {
    wx.showToast({ title: '客服功能即将开通', icon: 'none' })
  }
})
