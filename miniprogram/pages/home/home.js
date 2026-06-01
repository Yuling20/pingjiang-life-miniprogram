// pages/home/home.js
Page({
  data: {
    weatherInfo: {
      city: '平江',
      temp: '25°C',
      weather: '晴',
      wind: '东风2级',
      air: '空气良'
    },
    bannerList: [
      { id: 1, icon: '🚨', title: '停水停电通知',  desc: '点击查看最新通知公告', bgColor: '#E74C3C', type: 'water' },
      { id: 2, icon: '💼', title: '本地招聘信息',  desc: '平江最新招聘职位',     bgColor: '#2980B9', type: 'job' },
      { id: 3, icon: '🏠', title: '房屋租赁',      desc: '平江本地房源汇总',     bgColor: '#27AE60', type: 'rental' },
      { id: 4, icon: '🔧', title: '家政维修',      desc: '专业上门服务',         bgColor: '#8E44AD', type: 'homeservice' }
    ],

    quickMenuList: [
      { id: 1, icon: '💬', name: '贴吧',   type: 'community' },
      { id: 2, icon: '💼', name: '招聘',   type: 'job' },
      { id: 3, icon: '🏠', name: '租房',   type: 'rental' },
      { id: 4, icon: '🔧', name: '家政',   type: 'homeservice' },
      { id: 5, icon: '🚨', name: '停水电', type: 'water' },
      { id: 6, icon: '📋', name: '办事',   type: 'guide' }
    ],

    serviceList: [
      { id: 1, icon: '💼', name: '找工作',   type: 'job',         color: '#2980B9' },
      { id: 2, icon: '🏠', name: '房屋租赁', type: 'rental',      color: '#27AE60' },
      { id: 3, icon: '🔧', name: '家政维修', type: 'homeservice', color: '#E67E22' },
      { id: 4, icon: '🚨', name: '停水停电', type: 'water',       color: '#E74C3C' },
      { id: 5, icon: '📋', name: '办事指南', type: 'guide',       color: '#8E44AD' },
      { id: 6, icon: '❤️', name: '孝亲守护', type: 'elder',       color: '#D4820A' }
    ],

    // ✅ 已更新：社区板块，新增「本地活动」「萌宠交流」，并绑定对应的分类参数
    communityList: [
      { id: 1, icon: '📸', name: '随手拍',     category: '游玩' },
      { id: 2, icon: '🆘', name: '求助互助',   category: '求助互助' },
      { id: 3, icon: '🔄', name: '二手转让',   category: '二手交易' },
      { id: 4, icon: '💬', name: '今日话题',   category: '扯闲谈' },
      { id: 5, icon: '📢', name: '本地活动',   category: '活动' },
      { id: 6, icon: '🐾', name: '萌宠交流',   category: '宠物' }
    ],

    articleList: [
      { id: 1, tag: '热议', title: '平江新医院建设最新进度来了！',     count: 328 },
      { id: 2, tag: '求助', title: '有没有人知道北街哪里有修鞋的？',   count: 45 },
      { id: 3, tag: '热议', title: '平江这家餐厅真的太好吃了！',       count: 156 }
    ],

    contentFlow: [
      { id: 1, tag: '📸', title: '医院建设最新进度',    desc: '📸 12人看过',  color: '#2980B9' },
      { id: 2, tag: '❤️', title: '杨园小区邻居随手拍', desc: '❤️ 28人点赞', color: '#E74C3C' },
      { id: 3, tag: '▶️', title: '住院必备清单分享',   desc: '▶️ 156次播放', color: '#8E44AD' },
      { id: 4, tag: '💼', title: '本地招聘·护工急招', desc: '💼 今日发布',  color: '#27AE60' }
    ]
  },

  onLoad() {
    console.log('首页加载完成');
    this.loadWeather();
  },

  loadWeather() {
    this.setData({
      weatherInfo: {
        city: '平江',
        temp: '25°C',
        weather: '晴',
        wind: '东风2级',
        air: '空气良'
      }
    });
  },

  onBannerTap(e) {
    const item = e.currentTarget.dataset.item;
    this._doNavigate(item.type);
  },

  onBannerChange() {},

  navigateQuick(e) {
    const type = e.currentTarget.dataset.type;
    this._doNavigate(type);
  },

  navigateToService(e) {
    const type = e.currentTarget.dataset.type;
    this._doNavigate(type);
  },

  _doNavigate(type) {
    if (type === 'community') {
      wx.switchTab({ url: '/pages/community/community' });
      return;
    }

    if (type === 'elder') {
      wx.navigateTo({ url: '/pages/services/convenience/elder/elder' });
      return;
    }

    const routeMap = {
      job:         '/pages/services/convenience/job/job',
      rental:      '/pages/services/convenience/rental/rental',
      homeservice: '/pages/services/convenience/homeservice/homeservice',
      water:       '/pages/services/convenience/water/water',
      guide:       '/pages/services/convenience/guide/guide'
    };

    const url = routeMap[type];
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '该功能即将上线', icon: 'none' });
    }
  },

  navigateCommunity(e) {
    wx.switchTab({ url: '/pages/community/community' });
  },

  /**
   * 跳转社区首页（无分类筛选，点击「进入社区」时使用）
   */
  goToCommunity() {
    const app = getApp();
    app.globalData.communityInitCategory = '';
    wx.switchTab({
      url: '/pages/community/community'
    });
  },

  /**
   * 跳转社区并自动筛选指定分类
   * data-category 对应社区页的分类标签名
   */
  goToCommunityCategory(e) {
    const category = e.currentTarget.dataset.category || '';
    const app = getApp();
    app.globalData.communityInitCategory = category;
    wx.switchTab({
      url: '/pages/community/community'
    });
  },

  goToConvenience() {
    wx.navigateTo({ url: '/pages/services/convenience/guide/guide' });
  },

  goToContentDetail(e) {
    wx.switchTab({ url: '/pages/community/community' });
  },

  goToAI() {
    wx.navigateTo({ url: '/pages/ai/ai' });
  }
});