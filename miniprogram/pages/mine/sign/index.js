/**
 * 每日签到页
 * 积分逻辑完全依赖 points.js 配置，不修改已有功能
 */
const { POINTS_CONFIG, calcActualPoints, isDailyLimitReached } = require('../../../config/points');

Page({
  data: {
    signed: false,
    consecutiveDays: 0,
    todayEarned: 0,
    totalPoints: 0,
    dailyLimit: POINTS_CONFIG.BASE_RULES.dailyEarnLimit,
    signRule: POINTS_CONFIG.EARN_RULES.DAILY_SIGN,
    toast: { show: false, msg: '' },
  },

  onLoad() {
    this._loadData();
  },

  onShow() {
    this._loadData();
  },

  _loadData() {
    const stored = wx.getStorageSync('userPoints') || {};
    const signRecord = wx.getStorageSync('signRecord') || {};
    const today = this._getToday();

    this.setData({
      totalPoints: stored.totalPoints || 0,
      todayEarned: stored.todayEarned || 0,
      consecutiveDays: signRecord.consecutiveDays || 0,
      signed: signRecord.lastSignDate === today,
    });
  },

  _getToday() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  },

  onSign() {
    if (this.data.signed) {
      this._showToast('今日已签到，明日再来');
      return;
    }
    if (isDailyLimitReached(this.data.todayEarned)) {
      this._showToast(`今日积分已达上限${this.data.dailyLimit}分`);
      return;
    }

    const rule = this.data.signRule;
    let toAdd = rule.points;

    // 连续签到奖励
    const newConsecutive = this.data.consecutiveDays + 1;
    let bonusAdd = 0;
    if (newConsecutive % rule.bonusRule.consecutiveDays === 0) {
      bonusAdd = rule.bonusRule.bonusPoints;
    }

    const actualBase = calcActualPoints(this.data.todayEarned, toAdd);
    const actualBonus = calcActualPoints(this.data.todayEarned + actualBase, bonusAdd);
    const actualTotal = actualBase + actualBonus;

    // 写入本地存储（模拟）
    const stored = wx.getStorageSync('userPoints') || {};
    const newTotal = (stored.totalPoints || 0) + actualTotal;
    const newTodayEarned = (stored.todayEarned || 0) + actualTotal;

    wx.setStorageSync('userPoints', {
      ...stored,
      totalPoints: newTotal,
      todayEarned: newTodayEarned,
    });

    wx.setStorageSync('signRecord', {
      lastSignDate: this._getToday(),
      consecutiveDays: newConsecutive,
    });

    this.setData({
      signed: true,
      totalPoints: newTotal,
      todayEarned: newTodayEarned,
      consecutiveDays: newConsecutive,
    });

    let msg = `签到成功！+${actualBase}积分`;
    if (actualBonus > 0) msg += `，连续${newConsecutive}天额外+${actualBonus}积分🎉`;
    this._showToast(msg);
  },

  _showToast(msg) {
    this.setData({ toast: { show: true, msg } });
    setTimeout(() => this.setData({ toast: { show: false, msg: '' } }), 2500);
  },
});
