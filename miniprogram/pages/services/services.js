Page({
  data: {
    serviceList: [
      { id: 1, icon: '💼', name: '找工作',   desc: '本地招聘信息', type: 'job',         color: '#2980B9' },
      { id: 2, icon: '🏠', name: '房屋租赁', desc: '周边房源查询', type: 'rental',      color: '#27AE60' },
      { id: 3, icon: '🔧', name: '家政维修', desc: '专业上门服务', type: 'homeservice', color: '#E67E22' },
      { id: 4, icon: '🚨', name: '停水停电', desc: '官方通知查询', type: 'water',       color: '#E74C3C' },
      { id: 5, icon: '📋', name: '办事指南', desc: '政务服务入口', type: 'guide',       color: '#8E44AD' },
      { id: 6, icon: '❤️', name: '孝亲守护', desc: '关爱老人守护', type: 'elder',       color: '#D4820A' }
    ]
  },

  onLoad: function() {},

  navigateToService(e) {
    const type = e.currentTarget.dataset.type;

    // 新增：孝亲守护跳转
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

  goToJobs: function() {
    wx.navigateTo({
      url: '/pages/services/convenience/job/job'
    });
  },

  goToRent: function() {
    wx.navigateTo({
      url: '/pages/services/convenience/rental/rental'
    });
  },

  goToHomeService: function() {
    wx.navigateTo({
      url: '/pages/services/convenience/homeservice/homeservice'
    });
  },

  goToNotice: function() {
    wx.navigateTo({
      url: '/pages/services/convenience/water/water'
    });
  },

  goToGuide: function() {
    wx.navigateTo({
      url: '/pages/services/convenience/guide/guide'
    });
  },

  goToHospital: function() {
    wx.showToast({
      title: '医院专区即将开放',
      icon: 'none',
      duration: 2000
    });
  }
});