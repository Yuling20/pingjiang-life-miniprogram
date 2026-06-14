// miniprogram/pages/mine/sign/index.js
const {
  POINTS_CONFIG,
  calcActualPoints,
  isDailyLimitReached,
} = require('../../../config/points');

Page({
  data: {
    signed: false,
    consecutiveDays: 0,
    totalPoints: 0,
    todayEarned: 0,
    dailyLimit: POINTS_CONFIG.BASE_RULES.dailyEarnLimit,
    signRule: POINTS_CONFIG.EARN_RULES.DAILY_SIGN,
    progressDays: 0,
    progressBarStyle: 'width: 0%;', // ← 新增：进度条样式字段
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

  // ─── 工具方法：统一更新进度条样式 ──────────────────────────────
  _updateProgressStyle(days) {
    const pct = Math.min(Math.round(days / 7 * 100), 100);
    this.setData({ progressBarStyle: `width: ${pct}%;` });
  },

  // ─── 加载数据 ──────────────────────────────────────────────────
  _loadData() {
    const stored     = wx.getStorageSync('userPoints')  || {};
    const signRecord = wx.getStorageSync('signRecord')  || {};
    const today      = this._getTodayStr();
    const consecutive = signRecord.consecutiveDays || 0;
    const progressDays = consecutive % 7;

    this.setData({
      totalPoints:     stored.totalPoints  || 0,
      todayEarned:     stored.todayEarned  || 0,
      signed:          signRecord.lastSignDate === today,
      consecutiveDays: consecutive,
      progressDays:    progressDays,
    });

    // 初始化时更新进度条样式
    this._updateProgressStyle(progressDays);
  },

  _getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  },

  // ─── 签到逻辑 ──────────────────────────────────────────────────
  onSign() {
    if (this.data.signed) return;

    if (isDailyLimitReached(this.data.todayEarned)) {
      wx.showToast({ title: `今日积分已达上限 ${this.data.dailyLimit} 分`, icon: 'none' });
      return;
    }

    const rule           = this.data.signRule;
    const basePoints     = rule.points;
    const newConsecutive = this.data.consecutiveDays + 1;

    // 连续签到满7天额外奖励
    let bonusPoints = 0;
    if (newConsecutive % rule.bonusRule.consecutiveDays === 0) {
      bonusPoints = rule.bonusRule.bonusPoints;
    }

    const actualBase  = calcActualPoints(this.data.todayEarned, basePoints);
    const actualBonus = calcActualPoints(this.data.todayEarned + actualBase, bonusPoints);
    const actualTotal = actualBase + actualBonus;

    // 更新积分存储
    const stored   = wx.getStorageSync('userPoints') || {};
    const newTotal = (stored.totalPoints || 0) + actualTotal;
    const newToday = (stored.todayEarned || 0) + actualTotal;

    wx.setStorageSync('userPoints', {
      ...stored,
      totalPoints: newTotal,
      todayEarned: newToday,
    });

    wx.setStorageSync('signRecord', {
      lastSignDate:    this._getTodayStr(),
      consecutiveDays: newConsecutive,
    });

    // 统一同步 signedDate，供 mine.js 读取
    wx.setStorageSync('signedDate', this._getTodayStr());

    // ✅ 写入积分明细记录（供 points/index.js 展示）
    try {
      const earnRecords = wx.getStorageSync('pointsEarnRecords') || [];
      earnRecords.unshift({
        id:     `sign_${Date.now()}`,
        scene:  `每日签到（连续 ${newConsecutive} 天）`,
        points: actualTotal,
        time:   new Date().toLocaleString(),
      });
      wx.setStorageSync('pointsEarnRecords', earnRecords.slice(0, 200));
    } catch (e) {}

    const newProgressDays = newConsecutive % 7;
    this.setData({
      signed:           true,
      totalPoints:      newTotal,
      todayEarned:      newToday,
      consecutiveDays:  newConsecutive,
      progressDays:     newProgressDays,
      showSuccessModal: true,
      successPoints:    actualTotal,
      successBonus:     actualBonus,
      successConsecutive: newConsecutive,
    });

    // 签到后更新进度条样式
    this._updateProgressStyle(newProgressDays);
  },

  // ─── 关闭成功弹窗 ──────────────────────────────────────────────
  onCloseSuccess() {
    this.setData({ showSuccessModal: false });
  },

  stopProp() {},

  // ─── 跳转积分中心 ──────────────────────────────────────────────
  onGoIntegral() {
    wx.navigateTo({ url: '/pages/mine/points/index' });
  },
});