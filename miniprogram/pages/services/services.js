Page({

  data: {},

  onLoad() {},

  // ✅ 入口1：找工作
  goToJobs() {
    wx.navigateTo({
      url: '/pages/services/convenience/job/job'
    })
  },

  // ✅ 入口2：房屋租赁
  goToRent() {
    wx.navigateTo({
      url: '/pages/services/convenience/rental/rental'
    })
  },

  // ⏳ 入口3：家政维修（暂未开发）
  goToHomeService() {
    wx.showToast({
      title: '家政维修即将上线',
      icon: 'none',
      duration: 2000
    })
  },

  // ⏳ 入口4：停水停电（暂未开发）
  goToNotice() {
    wx.showToast({
      title: '停水停电通知即将上线',
      icon: 'none',
      duration: 2000
    })
  },

  // ⏳ 入口5：办事指南（暂未开发）
  goToGuide() {
    wx.showToast({
      title: '办事指南即将上线',
      icon: 'none',
      duration: 2000
    })
  },

  // ⏳ 入口6：医院专区（暂未开发）
  goToHospital() {
    wx.showToast({
      title: '医院专区即将开放',
      icon: 'none',
      duration: 2000
    })
  }

})
