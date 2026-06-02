const { POINTS_CONFIG } = require('../../../config/points');
const { POINTS_RULE_DESC } = require('../../../config/points-rule-desc');

Page({
  data: {
    // 用户积分（本地模拟，接入后端时替换）
    totalPoints: 0,
    todayEarned: 0,
    dailyLimit: POINTS_CONFIG.BASE_RULES.dailyEarnLimit,

    // 积分明细列表（本地模拟）
    recordList: [],

    // 规则说明
    ruleDesc: POINTS_RULE_DESC,
    showRuleModal: false,

    // 套餐数据（供消耗说明展示）
    publishPackages: [],
    topPackages: [],
  },

  onLoad() {
    this._initPackages();
    this._loadUserPoints();
  },

  _initPackages() {
    const { getPublishPackages, getTopPackages } = require('../../../config/points');
    this.setData({
      publishPackages: getPublishPackages(),
      topPackages: getTopPackages(),
    });
  },

  // 加载用户积分（本地模拟，后续对接接口）
  _loadUserPoints() {
    const stored = wx.getStorageSync('userPoints') || {};
    this.setData({
      totalPoints: stored.totalPoints || 0,
      todayEarned: stored.todayEarned || 0,
      recordList: stored.recordList || [],
    });
  },

  // 显示积分规则弹窗
  onShowRule() {
    this.setData({ showRuleModal: true });
  },

  // 关闭积分规则弹窗
  onCloseRule() {
    this.setData({ showRuleModal: false });
  },

  // 跳转签到页
  onGoSign() {
    wx.navigateTo({ url: '/pages/mine/sign/index' });
  },
});
