// miniprogram/pages/services/convenience/water/water.js
Page({
  data: {
    officialLinks: [
      {
        id: 1,
        title: '平江自来水公司停水公告',
        desc: '平江县自来水有限公司停水热线',
        icon: '💧',
        color: '#4A90D9',
        bgColor: '#EDF5FF',
        phone: '0730-6822345',
        tag: '官方',
        tip: '请拨打平江自来水公司服务热线查询停水信息，或到营业厅咨询。'
      },
      {
        id: 2,
        title: '国网停电查询（微信小程序）',
        desc: '微信搜索「国网95598」查询计划停电，比官网更准确',
        icon: '⚡',
        color: '#E6A817',
        bgColor: '#FFF8E6',
        phone: '95598',
        tag: '推荐',
        tip: '请微信搜索小程序「国网95598」查询平江停电信息。\n\n🔍 搜索步骤：微信→发现→小程序→搜索「国网95598」'
      },
      {
        id: 3,
        title: '国家电网客服热线',
        desc: '24小时停电报修、计划停电查询、用电咨询',
        icon: '🔌',
        color: '#67C23A',
        bgColor: '#F0F9EB',
        phone: '95598',
        tag: '24H',
        tip: '拨打95598可查询停电信息、报修或咨询电费。\n\n💡 提示：微信搜索「国网95598」小程序查询更方便！'
      }
    ],
    localNotices: [
      {
        id: 1,
        type: '停水',
        area: '杨园小区',
        time: '今日 14:00 - 18:00',
        reason: '管道维修',
        desc: '请提前储水备用，恢复供水后可能出现短暂浑浊，请放水至清澈后使用。',
        color: '#4A90D9',
        icon: '💧',
        isNew: true
      },
      {
        id: 2,
        type: '停电',
        area: '城关镇北街片区',
        time: '明日 09:00 - 17:00',
        reason: '线路改造',
        desc: '10千伏平江线路升级改造，影响北街、粮食局宿舍等区域。',
        color: '#E6A817',
        icon: '⚡',
        isNew: true
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '停水停电通知' });
  },

  goToOfficial(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: item.icon + ' ' + item.title,
      content: item.tip + '\n\n📞 服务热线：' + item.phone,
      confirmText: '拨打热线',
      cancelText: '知道了',
      success(res) {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: item.phone });
        }
      }
    });
  },

  callRepair(e) {
    const { phone } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认拨打',
      content: '即将拨打：' + phone,
      confirmText: '拨打',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: phone,
            fail() {
              wx.showToast({ title: '拨号失败，请手动拨打', icon: 'none' });
            }
          });
        }
      }
    });
  }
});
