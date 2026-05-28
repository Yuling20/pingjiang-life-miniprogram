Page({
  data: {
    url: ''
  },
  onLoad(options) {
    const url = decodeURIComponent(options.url || '');
    const title = options.title || '官方平台';
    wx.setNavigationBarTitle({ title: title });
    this.setData({ url: url });
  },
  onWebviewLoad() {},
  onWebviewError(e) {
    wx.showToast({ title: '页面加载失败', icon: 'none' });
  },
  onShareAppMessage() {
    return {
      title: '平江汇生活',
      path: '/pages/home/home'
    };
  }
});