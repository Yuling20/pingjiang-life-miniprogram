// pages/services/convenience/rental/detail/detail.js
Page({
  data: { house: null },

  onLoad(options) {
    try {
      const house = JSON.parse(decodeURIComponent(options.data))
      this.setData({ house })
    } catch (e) {
      wx.showToast({ title: '房源数据异常', icon: 'none' })
    }
  },

  onContact() {
    const { house } = this.data
    if (!house) return
    if (house.isVip) {
      wx.makePhoneCall({
        phoneNumber: house.virtualPhone || house.contact,
        fail: () => wx.showToast({ title: '拨号失败', icon: 'none' })
      })
    } else {
      wx.showModal({
        title: '房源联系方式提示',
        content: '该房东暂未开通VIP房源保护，联系方式暂不开放。',
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  }
})
