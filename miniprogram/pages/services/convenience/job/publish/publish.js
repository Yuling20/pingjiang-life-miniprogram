/**
 * 招聘发布页（付费发布入口）
 * 依赖 points.js 中的套餐配置
 */
const { getPublishPackages, getTopPackages, POINTS_CONFIG } = require('../../../../../config/points');

Page({
  data: {
    publishPackages: [],
    topPackages: [],
    selectedPublishPkg: null,
    selectedTopPkg: null,
    payType: 'cash',            // 'cash' | 'points'
    couponEnabled: true,        // 优惠券入口是否显示
    selectedCoupon: null,       // 已选优惠券（预留）
    totalPoints: 0,
    form: {
      title: '',
      content: '',
      contact: '',
    },
  },

  onLoad() {
    this.setData({
      publishPackages: getPublishPackages(),
      topPackages: getTopPackages(),
      couponEnabled: POINTS_CONFIG.PRICING.COUPON.enabled,
      totalPoints: (wx.getStorageSync('userPoints') || {}).totalPoints || 0,
    });
  },

  onSelectPublishPkg(e) {
    this.setData({ selectedPublishPkg: e.currentTarget.dataset.id });
  },

  onSelectTopPkg(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedTopPkg: this.data.selectedTopPkg === id ? null : id,
    });
  },

  onSwitchPayType(e) {
    this.setData({ payType: e.currentTarget.dataset.type });
  },

  onSelectCoupon() {
    // 预留：跳转优惠券选择页
    wx.showToast({ title: '优惠券功能即将上线', icon: 'none' });
  },

  _calcTotal() {
    const { publishPackages, topPackages, selectedPublishPkg, selectedTopPkg, payType } = this.data;
    let total = 0;
    const field = payType === 'cash' ? 'cashPrice' : 'pointsPrice';

    const pub = publishPackages.find(p => p.id === selectedPublishPkg);
    if (pub) total += pub[field];

    const top = topPackages.find(p => p.id === selectedTopPkg);
    if (top) total += top[field];

    return total;
  },

  onSubmit() {
    if (!this.data.selectedPublishPkg) {
      wx.showToast({ title: '请选择发布套餐', icon: 'none' });
      return;
    }
    if (!this.data.form.title) {
      wx.showToast({ title: '请填写职位标题', icon: 'none' });
      return;
    }

    const total = this._calcTotal();
    const { payType } = this.data;

    if (payType === 'points' && this.data.totalPoints < total) {
      wx.showToast({ title: `积分不足，当前${this.data.totalPoints}积分`, icon: 'none' });
      return;
    }

    wx.showModal({
      title: '确认发布',
      content: payType === 'cash'
        ? `需支付 ${(total / 100).toFixed(0)} 元`
        : `需消耗 ${total.toLocaleString()} 积分`,
      success: (res) => {
        if (res.confirm) {
          // TODO: 对接支付/积分扣减接口
          wx.showToast({ title: '发布成功', icon: 'success' });
        }
      },
    });
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },
});
