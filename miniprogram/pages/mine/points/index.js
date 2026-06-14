// miniprogram/pages/mine/points/index.js
// ✅ 修复：积分明细真实读取 earn + consume 双轨记录，合并排序展示

const { POINTS_CONFIG }    = require('../../../config/points');
const { POINTS_RULE_DESC } = require('../../../config/points-rule-desc');

Page({

  data: {
    totalPoints: 0,
    todayEarned: 0,
    dailyLimit:  POINTS_CONFIG.BASE_RULES.dailyEarnLimit,

    // ✅ 修复：合并后完整明细列表
    recordList: [],

    ruleDesc:       POINTS_RULE_DESC,
    showRuleModal:  false,

    publishPackages: [],
    topPackages:     [],
  },

  onLoad() {
    this._initPackages();
    this._loadUserPoints();
  },

  // ✅ 修复：返回此页时自动刷新积分和明细
  onShow() {
    this._loadUserPoints();
  },

  _initPackages() {
    const { getPublishPackages, getTopPackages } = require('../../../config/points');
    this.setData({
      publishPackages: getPublishPackages(),
      topPackages:     getTopPackages(),
    });
  },

  // ✅ 修复：整合所有积分记录来源，兼容多种存储格式
  _loadUserPoints() {
    try {
      const stored = wx.getStorageSync('userPoints') || {};

      // 兼容多种积分存储格式
      let totalPoints = 0;
      if (typeof stored === 'number') {
        totalPoints = stored;
      } else if (stored && typeof stored === 'object') {
        totalPoints = stored.totalPoints || stored.total || stored.points || 0;
      }

      const todayEarned = (stored && stored.todayEarned) ? stored.todayEarned : 0;

      // ✅ 读取获得记录（签到/发帖/获赞等）
      const earnRecords = wx.getStorageSync('pointsEarnRecords') || [];

      // ✅ 读取消耗记录（发布招聘/房源/置顶等）
      const consumeRecords = wx.getStorageSync('pointsConsumeRecords') || [];

      // ✅ 统一格式合并：{ id, label, time, points }
      const allRecords = [
        ...earnRecords.map((r, i) => ({
          id:     r.id     || `earn_${i}`,
          label:  r.scene  || r.label || '积分获得',
          time:   r.time   || r.createTime || '',
          points: Math.abs(r.points || 0),       // 获得为正数
        })),
        ...consumeRecords.map((r, i) => ({
          id:     r.id     || `consume_${i}`,
          label:  r.scene  || r.label || '积分消耗',
          time:   r.time   || r.createTime || '',
          points: -(Math.abs(r.points || 0)),    // 消耗为负数
        })),
      ];

      // 按时间倒序排列
      allRecords.sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return new Date(b.time) - new Date(a.time);
      });

      // 最多展示50条，避免渲染卡顿
      const recordList = allRecords.slice(0, 50);

      this.setData({ totalPoints, todayEarned, recordList });

    } catch (e) {
      this.setData({ totalPoints: 0, todayEarned: 0, recordList: [] });
    }
  },

  // 显示规则弹窗
  onShowRule() {
    this.setData({ showRuleModal: true });
  },

  // 关闭规则弹窗
  onCloseRule() {
    this.setData({ showRuleModal: false });
  },

  // ✅ 修复：弹窗阻止事件穿透方法（原来写的是 stopPropagation 但未定义）
  stopProp() {},

  // 跳转签到页
  onGoSign() {
    wx.navigateTo({ url: '/pages/mine/sign/index' });
  },

});
