// pages/services/index.js
Page({
  data: {},

  // 点击服务跳转详情页
  goToConvenience(e) {
    const type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/services/convenience/convenience?type=${type}`
    })
  }
})
