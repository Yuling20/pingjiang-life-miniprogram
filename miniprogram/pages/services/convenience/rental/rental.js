// pages/services/convenience/rental/rental.js
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
    typeList: [
      { id: 'all', name: '全部' },
      { id: 'zhengzu', name: '整租' },
      { id: 'hezu', name: '合租' },
      { id: 'shangpu', name: '商铺' }
    ],
    rentalList: [
      {
        id: 1,
        title: '平江老街附近2室1厅整租',
        type: '整租',
        price: '2200',
        room: '2室1厅',
        toilet: '1卫',
        area: '平江区平江路附近',
        desc: '房屋干净整洁，家具家电齐全，拎包入住。楼层适中，采光好，交通便利。',
        tags: ['拎包入住', '近菜场', '有停车'],
        publishDate: '今天',
        phone: '13800138000'
      },
      {
        id: 2,
        title: '干净合租房单间，近菜市场',
        type: '合租',
        price: '680',
        room: '单间',
        toilet: '1卫',
        area: '平江区北寺塔附近',
        desc: '室内干净整洁，生活便利，交通方便，拎包入住。',
        tags: ['近菜市场', '拎包入住'],
        publishDate: '今天',
        phone: '13900139000'
      }
    ]
  },

  onLoad() {
    console.log('租赁页面加载')
  },

  onAreaChange(e) {
    this.setData({ currentArea: e.currentTarget.dataset.id })
  },

  onTypeChange(e) {
    this.setData({ currentType: e.currentTarget.dataset.id })
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/services/detail/detail?id=${id}&type=rental` })
  },

  onContact(e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({ phoneNumber: phone })
  },

  onPublish() {
    wx.showToast({ title: '发布功能即将上线', icon: 'none' })
  }
})
