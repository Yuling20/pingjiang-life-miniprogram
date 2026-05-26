// miniprogram/pages/services/convenience/water/water.js
Page({
  data: {
    officialLinks: [
      {
        id: 1,
        title: '国网停电信息查询',
        desc: '国家电网官方停电通知平台',
        icon: '⚡',
        color: '#E6A817',
        bgColor: '#FFF8E6',
        url: 'https://www.95598.cn/osgweb/noticeStopped',
        tag: '官方'
      },
      {
        id: 2,
        title: '平江自来水停水通知',
        desc: '岳阳水务官方停水公告查询',
        icon: '💧',
        color: '#4A90D9',
        bgColor: '#EDF5FF',
        url: 'https://www.yywater.com',
        tag: '官方'
      },
      {
        id: 3,
        title: '湖南停电信息平台',
        desc: '湖南省电力公司计划停电查询',
        icon: '🔌',
        color: '#67C23A',
        bgColor: '#F0F9EB',
        url: 'https://www.hn.sgcc.com.cn',
        tag: '官方'
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

  // 跳转官方平台
  goToOfficial(e) {
    const { url, title } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/common/webview/webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    });
  },

  // 拨打报修电话
  callRepair(e) {
    const { phone, name } = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone,
      fail() {
        wx.showToast({ title: '拨号失败', icon: 'none' });
      }
    });
  }
});
