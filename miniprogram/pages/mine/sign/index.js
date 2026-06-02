const {
  POINTS_CONFIG,
  calcActualPoints,
  isDailyLimitReached,
} = require('../../../config/points');

Page({
  data: {
    // 签到状态
    signed: false,
    consecutiveDays: 0,
    totalPoints: 0,
    todayEarned: 0,
    dailyLimit: POINTS_CONFIG.BASE_RULES.dailyEarnLimit,

    // 规则配置（直接透传到视图）
    signRule: POINTS_CONFIG.EARN_RULES.DAILY_SIGN,

    // 连续7天进度（0~7）
    progressDays: 0,

    // 成功弹窗
    showSuccessModal: false,
    successPoints: 0,
    successBonus: 0,
    successConsecutive: 0,
  },

  onLoad() {
    this._loadData();
  },

  onShow() {
    this._loadData();
  },

  // ─── 加载数据 ───────────────────────────
  _loadData() {
    const stored    = wx.getStorageSync('userPoints')  || {};
    const signRecord = wx.getStorageSync('signRecord') || {};
    const today     = this._getTodayStr();
    const consecutive = signRecord.consecutiveDays || 0;

    this.setData({
      totalPoints:    stored.totalPoints    || 0,
      todayEarned:    stored.todayEarned    || 0,
      signed:         signRecord.lastSignDate === today,
      consecutiveDays: consecutive,
      progressDays:   consecutive % 7,       // 本轮进度 0~6（满7归零）
    });
  },

  _getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  // ─── 签到逻辑 ──────────────────────────
  onSign() {
    if (this.data.signed) return;

    if (isDailyLimitReached(this.data.todayEarned)) {
      wx.showToast({ title: `今日积分已达上限${this.data.dailyLimit}分`, icon: 'none' });
      return;
    }

    const rule         = this.data.signRule;
    const basePoints   = rule.points;                        // 5
    const newConsecutive = this.data.consecutiveDays + 1;

    // 连续签到满7天额外奖励
    let bonusPoints = 0;
    if (newConsecutive % rule.bonusRule.consecutiveDays === 0) {
      bonusPoints = rule.bonusRule.bonusPoints;              // 10
    }

    const actualBase  = calcActualPoints(this.data.todayEarned, basePoints);
    const actualBonus = calcActualPoints(this.data.todayEarned + actualBase, bonusPoints);
    const actualTotal = actualBase + actualBonus;

    // 写入本地缓存
    const stored     = wx.getStorageSync('userPoints') || {};
    const newTotal   = (stored.totalPoints  || 0) + actualTotal;
    const newToday   = (stored.todayEarned  || 0) + actualTotal;

    wx.setStorageSync('userPoints', {
      ...stored,
      totalPoints: newTotal,
      todayEarned: newToday,
    });
    wx.setStorageSync('signRecord', {
      lastSignDate:     this._getTodayStr(),
      consecutiveDays:  newConsecutive,
    });

    this.setData({
      signed:          true,
      totalPoints:     newTotal,
      todayEarned:     newToday,
      consecutiveDays: newConsecutive,
      progressDays:    newConsecutive % 7,
      // 成功弹窗数据
      showSuccessModal: true,
      successPoints:    actualBase,
      successBonus:     actualBonus,
      successConsecutive: newConsecutive,
    });
  },

  // ─── 关闭成功弹窗 ──────────────────────
  onCloseSuccess() {
    this.setData({ showSuccessModal: false });
  },

  // ─── 跳转积分中心 ──────────────────────
  onGoIntegral() {
    wx.navigateTo({ url: '/pages/mine/points/index' });
  },
});
