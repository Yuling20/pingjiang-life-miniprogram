// miniprogram/pages/mine/my-jobs/index.js

Page({
  data: {
    jobList: [],
    isEmpty: false
  },

  onLoad() {
    this._loadMyJobs();
  },

  onShow() {
    this._loadMyJobs();
  },

  _loadMyJobs() {
    try {
      const list = wx.getStorageSync('myPublishedJobs') || [];
      this.setData({
        jobList: list,
        isEmpty: list.length === 0
      });
    } catch (e) {
      console.warn('[my-jobs] 读取失败', e);
      this.setData({ jobList: [], isEmpty: true });
    }
  },

  goPublish() {
    wx.navigateTo({
      url: '/pages/services/convenience/job/publish/publish'
    });
  },

  deleteJob(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确认删除这条招聘？',
      confirmText: '删除',
      confirmColor: '#e53935',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const list = [...this.data.jobList];
          list.splice(index, 1);
          wx.setStorageSync('myPublishedJobs', list);
          this.setData({
            jobList: list,
            isEmpty: list.length === 0
          });
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  }
});
