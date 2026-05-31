// pages/services/convenience/water/water.js
Page({
  data: {
    // 筛选状态
    currentFilter: 'all',

    // 模拟通知数据
    notices: [
      {
        id: 1,
        type: 'water',
        title: '城关镇部分区域计划停水通知',
        area: '城关镇 · 平江路、学府路沿线',
        startTime: '2025-07-15 08:00',
        endTime: '2025-07-15 18:00',
        reason: '市政供水管网维修改造',
        contact: '0730-6622345',
        status: 'upcoming',
        publishDate: '2025-07-13',
        tips: '请提前储水备用，恢复供水后请先放水至清澈再使用'
      },
      {
        id: 2,
        type: 'electric',
        title: '三阳乡农网改造计划停电公告',
        area: '三阳乡 · 三阳村、光明村全境',
        startTime: '2025-07-16 09:00',
        endTime: '2025-07-16 17:00',
        reason: '10kV农村配电线路改造升级',
        contact: '95598',
        status: 'upcoming',
        publishDate: '2025-07-13',
        tips: '停电期间请关闭家用电器，来电后注意安全'
      },
      {
        id: 3,
        type: 'water',
        title: '安定镇供水管道抢修停水',
        area: '安定镇 · 安定路、兴安路',
        startTime: '2025-07-10 10:00',
        endTime: '2025-07-10 20:00',
        reason: '供水主干管道爆管，紧急抢修',
        contact: '0730-6622345',
        status: 'ended',
        publishDate: '2025-07-10',
        tips: '管道已修复，如发现水质异常请联系自来水公司'
      },
      {
        id: 4,
        type: 'electric',
        title: '嘉义镇变压器更换停电通知',
        area: '嘉义镇 · 嘉义村一、二、三组',
        startTime: '2025-07-18 08:30',
        endTime: '2025-07-18 16:30',
        reason: '台区变压器到期更换',
        contact: '95598',
        status: 'upcoming',
        publishDate: '2025-07-13',
        tips: '如有疑问请拨打电力报修热线 95598'
      }
    ],
    filteredNotices: [],

    // 报修热线
    repairLines: [
      {
        id: 1,
        type: 'water',
        icon: '🚰',
        name: '自来水公司报修热线',
        phone: '0730-6622345'
      },
      {
        id: 2,
        type: 'electric',
        icon: '⚡',
        name: '国网电力报修热线',
        phone: '95598'
      },
      {
        id: 3,
        type: 'water',
        icon: '📞',
        name: '润恒自来水客服热线',
        phone: '0730-6688888'
      }
    ],

    // 详情弹窗
    showDetailModal: false,
    currentNotice: null
  },

  onLoad() {
    this._applyFilter()
  },

  onShow() {
    this._applyFilter()
  },

  // 切换筛选标签
  onSwitchFilter(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ currentFilter: type }, () => {
      this._applyFilter()
    })
  },

  // 筛选数据处理
  _applyFilter() {
    const { notices, currentFilter } = this.data
    const filtered = currentFilter === 'all'
      ? notices
      : notices.filter(item => item.type === currentFilter)
    this.setData({ filteredNotices: filtered })
  },

  // 查看详情
  onViewDetail(e) {
    const id = e.currentTarget.dataset.id
    const notice = this.data.notices.find(n => n.id === id)
    if (notice) {
      this.setData({
        showDetailModal: true,
        currentNotice: notice
      })
    }
  },

  // 关闭弹窗
  onCloseModal() {
    this.setData({
      showDetailModal: false,
      currentNotice: null
    })
  },

  onModalContentTap() {},

  // 拨打报修电话
  onCallRepair(e) {
    const { phone, name } = e.currentTarget.dataset
    wx.showModal({
      title: '📞 拨打报修热线',
      content: `确认拨打「${name}」？\n电话：${phone}`,
      confirmText: '立即拨打',
      confirmColor: '#07C160',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: phone,
            fail: () => {
              wx.showToast({
                title: '拨打失败，请手动拨号',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    })
  },

  // ======================================
  // 官方查询入口 - 润恒自来水公众号
  // 操作：复制公众号名称 + 弹窗引导微信搜一搜
  // ======================================
  onOpenWaterOA() {
    const oaName = '平江县润恒自来水有限公司'
    wx.setClipboardData({
      data: oaName,
      success: () => {
        wx.showModal({
          title: '公众号名称已复制',
          content: `请打开微信「搜一搜」，粘贴搜索\n「${oaName}」\n关注后可查看最新停水公告`,
          confirmText: '我知道了',
          showCancel: false,
          success: () => {}
        })
      },
      fail: () => {
        wx.showToast({ title: '复制失败，请手动搜索', icon: 'none' })
      }
    })
  },

  // ======================================
  // 官方查询入口 - 国网电力公众号
  // 操作：复制公众号名称 + 弹窗引导微信搜一搜
  // ======================================
  onOpenElectricWeb() {
    const oaName = '国网湖南省电力有限公司'
    wx.setClipboardData({
      data: oaName,
      success: () => {
        wx.showModal({
          title: '公众号名称已复制',
          content: `请打开微信「搜一搜」，粘贴搜索\n「${oaName}」\n关注后可查看最新停电公告`,
          confirmText: '我知道了',
          showCancel: false,
          success: () => {}
        })
      },
      fail: () => {
        wx.showToast({ title: '复制失败，请手动搜索', icon: 'none' })
      }
    })
  }
})