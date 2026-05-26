// index.js 平江汇生活首页逻辑

Page({
  data: {
    greeting: '早上好',
    currentDate: '',
    notices: [
      { id: 1, title: '社区健康义诊活动本周六开展', date: '06-10' },
      { id: 2, title: '平江汇便利店正式营业公告', date: '06-09' },
      { id: 3, title: '关于调整社区服务时间的通知', date: '06-08' },
    ]
  },

  onLoad() {
    this.setGreeting()
    this.setDate()
  },

  // 根据时间显示问候语
  setGreeting() {
    const hour = new Date().getHours()
    let greeting = '你好'
    if (hour >= 5 && hour < 12) greeting = '早上好'
    else if (hour >= 12 && hour < 14) greeting = '中午好'
    else if (hour >= 14 && hour < 18) greeting = '下午好'
    else greeting = '晚上好'
    this.setData({ greeting })
  },

  // 显示当前日期
  setDate() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const week = weeks[now.getDay()]
    this.setData({
      currentDate: `${month}月${day}日 ${week}`
    })
  },

  // 功能跳转（先用提示代替）
  goToPharmacy() { wx.showToast({ title: '药店查询开发中', icon: 'none' }) },
  goToNotice() { wx.showToast({ title: '社区公告开发中', icon: 'none' }) },
  goToHealth() { wx.showToast({ title: '健康提醒开发中', icon: 'none' }) },
  goToStore() { wx.showToast({ title: '便利店开发中', icon: 'none' }) },
  goToService() { wx.showToast({ title: '出行服务开发中', icon: 'none' }) },
  goToHelp() { wx.showToast({ title: '一键求助开发中', icon: 'none' }) },
  goToMy() { wx.showToast({ title: '个人中心开发中', icon: 'none' }) },
})
