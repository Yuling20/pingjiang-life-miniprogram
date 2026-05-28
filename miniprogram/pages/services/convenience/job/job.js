// pages/services/convenience/job/job.js
Page({
  data: {
    jobList: [],
    isLoading: false
  },

  onLoad() {
    console.log('招聘页面加载')
    wx.setNavigationBarTitle({ title: '招聘信息' })
    this.loadJobList()
  },

  loadJobList() {
    // 平江本地招聘数据（可替换为接口）
    this.setData({
      jobList: [
        { id: 1, title: '客服专员', company: '平江某企业', salary: '3000-5000', area: '平江县城' },
        { id: 2, title: '电商运营', company: '平江电商园', salary: '4000-6000', area: '平江县城' },
        { id: 3, title: '家政服务员', company: '平江家政', salary: '2500-4000', area: '全县' }
      ]
    })
  },

  // 联系招聘
  onContact(e) {
    const item = e.currentTarget.dataset.item
    wx.showModal({
      title: '联系招聘方',
      content: `职位：${item.title}\n公司：${item.company}`,
      confirmText: '拨打电话',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: '0730-1234567' })
        }
      }
    })
  },

  onShareAppMessage() {
    return { title: '平江招聘信息', path: '/pages/services/convenience/job/job' }
  }
})
