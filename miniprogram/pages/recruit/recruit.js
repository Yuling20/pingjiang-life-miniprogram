// pages/recruit/recruit.js
Page({
  data: {
    activeTab: '推荐',
    tabs: ['推荐', '最新', '附近'],
    searchKeyword: '',
    filterItems: ['不限', '全职', '兼职', '实习'],
    activeFilter: '不限',
    jobs: [
      {
        id: 1,
        title: '销售专员',
        company: '平江某贸易有限公司',
        salary: '4000-6000',
        tags: ['全职', '平江县城', '社保'],
        recruiter: '张经理',
        recruiterTitle: 'HR',
        online: true,
        activeTime: '刚刚活跃',
        welfare: ['包午餐', '双休', '五险一金']
      },
      {
        id: 2,
        title: '厨师/厨工',
        company: '平江某餐饮连锁店',
        salary: '5000-8000',
        tags: ['全职', '汉昌镇', '包住'],
        recruiter: '李老板',
        recruiterTitle: '老板',
        online: false,
        activeTime: '1小时前活跃',
        welfare: ['包吃住', '节假日福利']
      },
      {
        id: 3,
        title: '收银员',
        company: '平江某超市',
        salary: '3000-4000',
        tags: ['全职', '平江', '五险'],
        recruiter: '王主管',
        recruiterTitle: '店长',
        online: true,
        activeTime: '10分钟前活跃',
        welfare: ['双休', '年终奖']
      },
      {
        id: 4,
        title: '电商运营',
        company: '平江某网络科技公司',
        salary: '6000-10000',
        tags: ['全职', '县城', '五险一金'],
        recruiter: '陈总监',
        recruiterTitle: '运营总监',
        online: true,
        activeTime: '刚刚活跃',
        welfare: ['弹性上班', '带薪年假', '节日福利']
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

  setFilter(e) {
    this.setData({ activeFilter: e.currentTarget.dataset.filter });
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  doSearch() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' });
  },

  goPublish() {
    wx.navigateTo({ url: '/pages/recruit/publish/index' });
  },

  goJobDetail(e) {
    wx.showToast({ title: '职位详情开发中', icon: 'none' });
  },

  chatRecruiter(e) {
    wx.showToast({ title: '沟通功能开发中', icon: 'none' });
  },

  onShareAppMessage() {
    return { title: '平江本地招聘', path: '/pages/recruit/recruit' };
  }
});
