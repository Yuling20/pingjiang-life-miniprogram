// miniprogram/pages/mine/my-rentals/index.js

Page({
  data: {
    rentalList: [],
    isEmpty: false
  },

  onLoad() {
    this._loadMyRentals();
  },

  onShow() {
    this._loadMyRentals();
  },

  _loadMyRentals() {
    try {
      const list = wx.getStorageSync('myPublishedRentals') || [];
      this.setData({
        rentalList: list,
        isEmpty: list.length === 0
      });
    } catch (e) {
      console.warn('[my-rentals] 读取失败', e);
      this.setData({ rentalList: [], isEmpty: true });
    }
  },

  goPublish() {
    wx.navigateTo({
      url: '/pages/services/convenience/rental/publish/publish'
    });
  },

  deleteRental(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确认删除这条房源？',
      confirmText: '删除',
      confirmColor: '#e53935',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const list = [...this.data.rentalList];
          list.splice(index, 1);
          wx.setStorageSync('myPublishedRentals', list);
          this.setData({
            rentalList: list,
            isEmpty: list.length === 0
          });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});
