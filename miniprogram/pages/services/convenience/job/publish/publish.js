/**
 * 招聘发布页
 * 路径: pages/services/convenience/job/publish/publish.js
 * 功能: 填写职位信息 + 选择付费套餐 + 确认支付
 */
Page({
  data: {
    // ─── 职位类型（从上一步传入） ────────────────────────
    jobType: '长期',
    jobTypeLabel: '长期',

    // ─── 职位表单 ────────────────────────────────────────
    form: {
      title: '',
      salary: '',
      address: '',
      description: '',
      requirement: '',
      latitude: null,
      longitude: null,
    },
    formErrors: {},
    isSubmitting: false,

    // ─── 基础套餐（必选） ────────────────────────────────
    publishPackages: [
      {
        id: 'basic_30',
        name: '基础宣传',
        desc: '30天展示',
        originalCash: 100,
        cashPrice: 60,
        pointsPrice: 6000,
        tag: '',
      },
      {
        id: 'basic_60',
        name: '60天展示',
        desc: '60天展示',
        originalCash: 150,
        cashPrice: 90,
        pointsPrice: 9000,
        tag: '推荐',
      },
    ],

    // ─── 置顶套餐（可叠加） ──────────────────────────────
    topPackages: [
      {
        id: 'top_week',
        name: '置顶一周',
        desc: '7天置顶曝光',
        originalCash: 109,
        cashPrice: 60,
        pointsPrice: 6000,
        tag: '',
      },
      {
        id: 'top_month',
        name: '置顶一月',
        desc: '30天置顶曝光',
        originalCash: 309,
        cashPrice: 180,
        pointsPrice: 18000,
        tag: '赠送',
      },
    ],

    selectedPublishPkg: 'basic_60',
    selectedTopPkg: null,

    // ─── 支付方式 ────────────────────────────────────────
    payType: 'cash',
    couponEnabled: true,
    totalPoints: 0,

    // ─── 应付金额（动态计算后写入） ──────────────────────
    displayTotal: '¥90',
  },

  // ══════════════════════════════════════════════════════
  //  生命周期
  // ══════════════════════════════════════════════════════
  onLoad(options) {
    // 接收上一步传入的职位类型
    const jobType      = options.jobType      || 'long';
    const jobTypeLabel = options.jobTypeLabel
      ? decodeURIComponent(options.jobTypeLabel)
      : '长期';
    this.setData({ jobType, jobTypeLabel });

    // 读取用户积分
    const pts = wx.getStorageSync('userPoints');
    let totalPoints = 0;
    if (typeof pts === 'number')                    totalPoints = pts;
    else if (pts && typeof pts.total === 'number')  totalPoints = pts.total;
    else if (pts && typeof pts.totalPoints === 'number') totalPoints = pts.totalPoints;
    this.setData({ totalPoints });

    // 初始化总价
    this._syncTotal();
  },

  // ══════════════════════════════════════════════════════
  //  表单输入
  // ══════════════════════════════════════════════════════
  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  // ══════════════════════════════════════════════════════
  //  地图选点（按截图方案修改）
  // ══════════════════════════════════════════════════════
  onOpenMap() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'form.address': res.address || res.name,
          'form.latitude':  res.latitude,
          'form.longitude': res.longitude,
        });
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
          wx.showToast({ title: '地图选点失败', icon: 'none' });
        }
      },
    });
  },

  // ══════════════════════════════════════════════════════
  //  套餐选择
  // ══════════════════════════════════════════════════════
  onSelectPublishPkg(e) {
    this.setData(
      { selectedPublishPkg: e.currentTarget.dataset.id },
      () => this._syncTotal(),
    );
  },

  onSelectTopPkg(e) {
    const id = e.currentTarget.dataset.id;
    this.setData(
      { selectedTopPkg: this.data.selectedTopPkg === id ? null : id },
      () => this._syncTotal(),
    );
  },

  // ══════════════════════════════════════════════════════
  //  支付方式
  // ══════════════════════════════════════════════════════
  onSwitchPayType(e) {
    this.setData(
      { payType: e.currentTarget.dataset.type },
      () => this._syncTotal(),
    );
  },

  onSelectCoupon() {
    wx.showToast({ title: '优惠券功能即将上线', icon: 'none' });
  },

  // ══════════════════════════════════════════════════════
  //  总价计算
  // ══════════════════════════════════════════════════════
  _syncTotal() {
    const {
      publishPackages, topPackages,
      selectedPublishPkg, selectedTopPkg, payType,
    } = this.data;

    if (payType === 'coupon') {
      this.setData({ displayTotal: '¥0（优惠券抵扣）' });
      return;
    }

    const field = payType === 'cash' ? 'cashPrice' : 'pointsPrice';
    let total = 0;
    const pub = publishPackages.find(p => p.id === selectedPublishPkg);
    if (pub) total += pub[field];
    const top = topPackages.find(p => p.id === selectedTopPkg);
    if (top) total += top[field];

    this.setData({
      displayTotal: payType === 'cash'
        ? `¥${total}`
        : `${total.toLocaleString()} 积分`,
    });
  },

  // ══════════════════════════════════════════════════════
  //  敏感词校验
  // ══════════════════════════════════════════════════════
  _checkSensitive(text) {
    if (!text) return { pass: true, cleaned: '' };
    const PATTERNS = [
      /1[3-9]\d{9}/g,
      /微信\s*[:：号码]?\s*[a-zA-Z0-9_\-]{5,}/g,
      /wx\s*[:：]?\s*[a-zA-Z0-9_\-]{5,}/gi,
      /QQ\s*[:：号]?\s*[1-9][0-9]{4,}/gi,
      /加微/g, /私信/g, /私聊/g, /加好友/g, /站外/g,
      /转账/g, /收款码/g, /刷单/g, /传销/g, /诈骗/g,
    ];
    let cleaned = text, found = false;
    PATTERNS.forEach(p => {
      if (p.test(text)) { found = true; cleaned = cleaned.replace(p, '***'); }
      p.lastIndex = 0;
    });
    return { pass: !found, cleaned };
  },

  // ══════════════════════════════════════════════════════
  //  提交
  // ══════════════════════════════════════════════════════
  onSubmit() {
    if (this.data.isSubmitting) return;
    const { form, selectedPublishPkg, payType, totalPoints } = this.data;
    const errors = {};

    // 必填校验
    if (!form.title.trim())       errors.title       = '请输入职位名称';
    if (!form.salary.trim())      errors.salary      = '请输入薪资范围';
    if (!form.address.trim())     errors.address     = '请输入工作地址';
    if (!form.description.trim()) errors.description = '请输入职位描述';

    if (Object.keys(errors).length > 0) {
      this.setData({ formErrors: errors });
      wx.showToast({ title: '请完善必填信息', icon: 'none' });
      return;
    }

    // 套餐校验
    if (!selectedPublishPkg) {
      wx.showToast({ title: '请选择发布套餐', icon: 'none' });
      return;
    }

    // 敏感词校验
    const checkFields = [
      { key: 'title',       label: '职位名称' },
      { key: 'description', label: '职位描述' },
      { key: 'requirement', label: '任职要求' },
      { key: 'salary',      label: '薪资范围' },
    ];
    for (const f of checkFields) {
      const result = this._checkSensitive(form[f.key]);
      if (!result.pass) {
        this.setData({ [`form.${f.key}`]: result.cleaned });
        wx.showModal({
          title: '⚠️ 违规内容拦截',
          content: `「${f.label}」中含有违规词，已自动清除，请修改后重新提交。`,
          showCancel: false, confirmText: '知道了',
        });
        return;
      }
    }

    // 积分余额校验
    if (payType === 'points') {
      const { publishPackages, topPackages, selectedTopPkg } = this.data;
      let total = 0;
      const pub = publishPackages.find(p => p.id === selectedPublishPkg);
      if (pub) total += pub.pointsPrice;
      const top = topPackages.find(p => p.id === selectedTopPkg);
      if (top) total += top.pointsPrice;
      if (totalPoints < total) {
        wx.showToast({ title: `积分不足，当前 ${totalPoints} 积分`, icon: 'none', duration: 2000 });
        return;
      }
    }

    const { displayTotal } = this.data;
    wx.showModal({
      title: '确认发布',
      content: `职位「${form.title}」发布后将消耗 ${displayTotal}，确认继续？\n\n⚠️ 平台风险提示：请通过平台安全通道联系应聘者，谨防诈骗。`,
      confirmText: '确认支付', cancelText: '再想想',
      success: (res) => {
        if (!res.confirm) return;
        this.setData({ isSubmitting: true });
        wx.showLoading({ title: '提交中...' });
        setTimeout(() => {
          wx.hideLoading();
          this.setData({ isSubmitting: false });
          wx.showToast({ title: '发布成功', icon: 'success' });
          setTimeout(() => wx.navigateBack({ delta: 1 }), 1500);
        }, 1200);
      },
    });
  },
});