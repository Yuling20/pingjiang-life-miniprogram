// pages/house/house.js
Page({
  data: {
    activeTab: '整租',
    tabs: ['整租', '合租', '求租'],
    priceRange: '不限',
    priceRanges: ['不限', '500以下', '500-1000', '1000-1500', '1500-2000', '2000以上'],
    roomType: '不限',
    roomTypes: ['不限', '一室', '二室', '三室', '四室+'],
    houses: [
      {
        id: 1,
        title: '精装修整租 天岳广场旁 拎包入住',
        rent: 1200,
        unit: '元/月',
        area: 65,
        room: '2室1厅',
        floor: '5/7层',
        community: '天岳花园',
        address: '平江县汉昌镇',
        tags: ['精装修', '拎包入住', '近地铁'],
        images: [],
        publishTime: '2小时前',
        isVip: true
      },
      {
        id: 2,
        title: '南北通透 采光好 生活便利',
        rent: 800,
        unit: '元/月',
        area: 45,
        room: '1室1厅',
        floor: '3/6层',
        community: '汉昌小区',
        address: '平江县城区',
        tags: ['采光好', '交通便利'],
        images: [],
        publishTime: '昨天',
        isVip: false
      },
      {
        id: 3,
        title: '温馨单间 距离汽车站500米',
        rent: 500,
        unit: '元/月',
        area: 25,
        room: '单间',
        floor: '2/5层',
        community: '站前社区',
        address: '平江汽车站附近',
        tags: ['独立卫浴', '近车站'],
        images: [],
        publishTime: '3天前',
        isVip: false
      }
    ]
  },

  onLoad() {},
  onShow() {},

  onPullDownRefresh() {
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({ title: '已刷新', icon: 'success' });
    }, 1000);
  },

  onReachBottom() {
    wx.showToast({ title: '没有更多了', icon: 'none' });
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  setPriceRange(e) {
    this.setData({ priceRange: e.currentTarget.dataset.val });
  },

  setRoomType(e) {
    this.setData({ roomType: e.currentTarget.dataset.val });
  },

  goPublish() {
    wx.navigateTo({ url: '/pages/house/publish/index' });
  },

  goDetail(e) {
    wx.showToast({ title: '房源详情开发中', icon: 'none' });
  },

  goPhone(e) {
    const id = e.currentTarget.dataset.id;
    wx.makePhoneCall({ phoneNumber: '0730-XXXXXXX' });
  },

  onShareAppMessage() {
    return { title: '平江房屋租赁', path: '/pages/house/house' };
  }
});
