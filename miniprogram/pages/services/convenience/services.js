// pages/services/convenience/services.js
Page({

  data: {},

  onLoad: function () {},

  goToJobs: function () {
    wx.navigateTo({
      url: '/pages/services/convenience/job/job'
    });
  },

  goToRent: function () {
    wx.navigateTo({
      url: '/pages/services/convenience/rental/rental'
    });
  },

  goToHomeService: function () {
    wx.navigateTo({
      url: '/pages/services/convenience/homeservice/homeservice'
    });
  },

  goToNotice: function () {
    wx.navigateTo({
      url: '/pages/services/convenience/water/water'
    });
  },

  goToGuide: function () {
    wx.navigateTo({
      url: '/pages/services/convenience/guide/guide'
    });
  },

  goToElder: function () {
    wx.navigateTo({
      url: '/pages/services/convenience/elder/elder'
    });
  }

});
