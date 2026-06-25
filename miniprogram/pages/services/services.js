// pages/services/convenience/services.js
Page({
  data: {},

  onLoad: function() {},

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

  // ─── 跳转家庭心树 ──────────────────────────
  onGoFamilyTree() {
    wx.navigateTo({
      url: '/pages/services/convenience/familytree/index'
    });
  },

  // 原孝亲守护跳转，已替换页面入口，可注释/删除
  goToElder: function() {
    wx.navigateTo({
      url: '/pages/services/convenience/elder/elder'
    });
  }
});