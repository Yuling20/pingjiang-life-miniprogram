/**
 * 租房付费发布页
 * 逻辑与招聘发布一致，套餐来自统一配置
 */
const { getPublishPackages, getTopPackages, POINTS_CONFIG } = require('../../../../../config/points');

Page({
  data: {
    publishPackages: [],
    topPackages: [],
    selectedPublishPkg: null,
    selectedTopPkg: null,
    payType: 'cash',
    couponEnabled: true,
    selectedCoupon: null,
    totalPoints: 0,
    form: {
      title: '',
      address: '',
      rent: '',
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
    this.setData({ selectedTopPkg: this.data.selectedTopPkg === id ? null : id });
  },

  onSwitchPayType(e) {
    this.setData({ payType: e.currentTarget.dataset.type });
  },

  onSelectCoupon() {
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
          // 👇 按 Claude 方案修改：现金支付分支接入 wx.requestPayment
          if (payType === 'cash') {
            // 上线前需替换为后端返回的真实支付参数
            wx.requestPayment({
              // timeStamp, nonceStr, package, signType, paySign 由后端接口返回
              timeStamp: '',
              nonceStr: '',
              package: '',
              signType: 'RSA',
              paySign: '',
              success: () => {
                wx.showToast({ title: '发布成功', icon: 'success' });
                // 支付成功后的后续逻辑（如跳转页面、更新订单状态等）可在此补充
              },
              fail: (err) => {
                console.warn('支付失败', err);
                wx.showToast({ title: '支付取消', icon: 'none' });
              }
            });
          } else {
            // 积分支付保持原有逻辑
            wx.showToast({ title: '发布成功', icon: 'success' });
          }
        }
      },
    });
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },
});