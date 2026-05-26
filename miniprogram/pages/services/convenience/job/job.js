// pages/services/convenience/job/job.js
Page({
  data: {
    currentArea: 'all',
    currentType: 'all',
    areaList: [
      { id: 'all', name: '全部区域' },
      { id: 'chengguan', name: '城关镇' },
      { id: 'sanyang', name: '三阳乡' },
      { id: 'anding', name: '安定镇' },
      { id: 'jiayi', name: '嘉义镇' }
    ],
    jobTypeList: [
      { id: 'all', name: '全部' },
      { id: 'sales', name: '销售' },
      { id: 'service', name: '客服' },
      { id: 'cashier', name: '收银' },
      { id: 'food', name: '餐饮' },
      { id: 'clean', name: '保洁' }
    ],
    jobList: [
      {
        id: 1,
        title: '超市收银员',
        salary: '3500-4500元/月',
        type: '全职',
        count: 3,
        company: '平江县步步高超市',
        location: '平江县城关镇天虹城',
        require: '年满18周岁，身体健康，有收银经验者优先。无经验可培训',
        publishDate: '2025-06-01',
        phone: '13800138000'
      },
      {
        id: 2,
        title: '餐厅服务员',
        salary: '3000-4000元/月',
        type: '全职',
        count: 5,
        company: '平江某餐厅',
        location: '平江县城关镇',
        require: '形象良好，吃苦耐劳，有服务经验者优先',
        publishDate: '2025-06-02',
        phone: '13900139000'
      },
      {
        id: 3,
        title: '装修工人',
        salary: '200-400元/天',
        type: '兼职',
        count: 10,
        company: '平江某装修公司',
        location: '平江县城区',
        require: '有一定装修经验，身体健康',
        publishDate: '2025-06-03',
        phone: '15000150000'
      }
    ]
  },

  onLoad() {
    console.log('招聘页面加载')
  },

  onAreaChange(e) {
    this.setData({ currentArea: e.currentTarget.dataset.id })
  },

  onTypeChange(e) {
    this.setData({ currentType: e.currentTarget.dataset.id })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/services/detail/detail?id=${id}&type=job` })
  },

  onContact(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({ phoneNumber: phone })
  },

  onPublish() {
    wx.showToast({ title: '发布功能即将上线', icon: 'none' })
  }
})
