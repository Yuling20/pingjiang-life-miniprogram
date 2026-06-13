// pages/services/convenience/rental/rental.js
Page({
  data: {
    activeArea: '全部区域',
    activeType: '全部',
    areas: ['全部区域', '城关镇', '三阳乡', '安定镇', '嘉义镇', '其他'],
    types: ['全部', '整租', '合租', '商辅'],
    houseList: [
      {
        id: 1,
        title: '平江老街附近2室1厅整租',
        type: '整租',
        isVip: true,
        price: 2200,
        room: '2室1厅/1卫',
        area: '平江区平江路附近',
        desc: '房屋干净整洁，家具家电齐全，拎包入住。楼层适中，采光好，交通便利。',
        tags: ['拎包入住', '近菜场', '有停车'],
        contact: '13800138001',
        virtualPhone: '400-xxx-0001',
        publishTime: '今天',
        images: []
      },
      {
        id: 2,
        title: '无途径个人房单间，近菜市场',
        type: '合租',
        isVip: false,
        price: 800,
        room: '1室/1卫',
        area: '平江县城中心',
        desc: '个人出租，干净整洁，近菜市场，生活方便。',
        tags: ['近菜场', '采光好'],
        contact: '',
        publishTime: '昨天',
        images: []
      }
    ],
    filteredList: []
  },

  onLoad() {
    this._filterList()
  },

  onAreaTab(e) {
    const area = e.currentTarget.dataset.area
    this.setData({ activeArea: area })
    this._filterList()
  },

  onTypeTab(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ activeType: type })
    this._filterList()
  },

  _filterList() {
    const { houseList, activeArea, activeType } = this.data
    let list = houseList.filter(item => {
      const areaMatch = activeArea === '全部区域' || item.area.includes(activeArea)
      const typeMatch = activeType === '全部' || item.type === activeType
      return areaMatch && typeMatch
    })
    this.setData({ filteredList: list })
  },

  // 按Claude要求：插入在 onContact 之前
  onCardTap(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/services/convenience/rental/detail/detail?data=${encodeURIComponent(JSON.stringify(item))}`
    })
  },

  onContact(e) {
    const item = e.currentTarget.dataset.item
    if (item.isVip) {
      wx.makePhoneCall({
        phoneNumber: item.virtualPhone || item.contact,
        fail: () => wx.showToast({ title: '拨号失败', icon: 'none' })
      })
    } else {
      wx.showModal({
        title: '房源联系方式提示',
        // ✅ 修复问题6：移除承诺性文案，避免微信审核风险
        content: '该房东暂未开通VIP房源保护服务，联系方式暂不对外展示，请通过平台内其他方式沟通。',
        showCancel: false,
        confirmText: '我知道了'
      })
    }
  },

  // 跳转到发布页
  onPublishHouse() {
    let info = null;
    try {
      const raw = wx.getStorageSync('userRealNameInfo');
      // ✅ 修复问题7：用 try-catch 包裹 JSON.parse，避免格式异常导致误判
      try {
        info = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (_) {
        info = null;
      }
    } catch (e) {
      info = null;
    }

    if (!info || !info.verified) {
      wx.showModal({
        title: '需要实名认证',
        content: '发布房源需完成实名认证，请前往「我的」页面完成认证后再发布。',
        confirmText: '去认证',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' })
          }
        }
      })
      return;
    }

    // 已实名，跳转到独立发布页
    wx.navigateTo({
      url: '/pages/services/convenience/rental/publish/publish'
    })
  }
})