// miniprogram/pages/common/webview/webview.js
Page({
  data: {
    url: '',
    title: '详情'
  },

  onLoad(options) {
    const url = decodeURIComponent(options.url || '');
    const title = decodeURIComponent(options.title || '详情');
    this.setData({ url, title });
    wx.setNavigationBarTitle({ title });
  }
});
