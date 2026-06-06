// pages/services/convenience/rental/publish/publish.js
// 修改说明：
//   1. 新增实名认证校验（userAuthStatus）
//   2. 新增VIP开通校验（userVipStatus）
//   3. 套餐拆分为4个：基础30天/60天，置顶一周/一月
//   4. 价格按新规：基础30天¥60/6000积分，60天¥90/9000积分
//                  置顶一周¥60/6000积分，一月¥180/18000积分
//   5. 积分读取兼容 Number 和 {total:N} 两种格式
//   6. 不改变其他界面功能

// ─── 套餐价格配置 ─────────────────────────────────────────
// cashPrice 单位：元；pointsPrice 单位：积分；100积分=1元
const PACKAGE_CONFIG = {
  basic_30: { cashPrice: 60,  pointsPrice: 6000  },
  basic_60: { cashPrice: 90,  pointsPrice: 9000  },
  top_week: { cashPrice: 60,  pointsPrice: 6000  },
  top_month:{ cashPrice: 180, pointsPrice: 18000 },
};

Page({
  data: {
    showTagModal: false,
    showAgreementAlert: false,
    rentTypes: ['整租', '合租', '商辅'],
    publishForm: {
      rentType: '整租',
      city: '平江县',
      community: '',
      area: '',
      roomType: '',
      direction: '',
      moveInTime: '',
      price: '',
      payType: '',
      images: [],
      tags: [],
      desc: '',
      agreed: false,
      isVipHouse: false
    },
    descCount: 0,
    roomTypeOptions: ['一室', '一室一厅', '两室一厅', '两室两厅', '三室一厅', '三室两厅', '四室及以上', '单间', '商铺'],
    directionOptions: ['东', '南', '西', '北', '东南', '东北', '西南', '西北'],
    moveInOptions: ['随时可入住', '一周内', '半月内', '一月内', '自定义'],
    payTypeOptions: ['押一付一', '押一付三', '押二付一', '押二付三', '月付', '季付', '半年付', '年付'],
    allTags: [
      '拎包入住', '近菜场', '有停车', '采光好', '押一付一',
      '家电齐全', '独立卫生间', '近学校', '近医院', '近公交',
      '电梯房', '低楼层', '高楼层', '南北通透', '精装修',
      '简装修', '可养宠', '可做饭', '有空调', '有暖气',
      '有网络', '近超市', '近地铁', '安静', '新装修',
      '带阳台', '近公园'
    ],
    isPublishing: false,

    // 套餐与支付
    selectedPackage: '',   // 'basic_30'|'basic_60'|'top_week'|'top_month'
    paymentMethod: 'cash', // 'cash'|'points'
    useCoupon: false,
    finalPrice: 0,         // 元
    finalPoints: 0,        // 积分
    userPoints: 0,

    // ✅ 用户状态
    isAuthed: false,
    isVip: false,
  },

  onLoad() {
    this.setData({
      publishForm: {
        rentType: '整租',
        city: '平江县',
        community: '',
        area: '',
        roomType: '',
        direction: '',
        moveInTime: '',
        price: '',
        payType: '',
        images: [],
        tags: [],
        desc: '',
        agreed: false,
        isVipHouse: false
      },
      descCount: 0,
      isPublishing: false,
      selectedPackage: '',
      paymentMethod: 'cash',
      useCoupon: false,
      finalPrice: 0,
      finalPoints: 0
    });

    this._loadUserStatus();
  },

  onShow() {
    // 从实名/VIP页返回后同步状态
    this._loadUserStatus();
  },

  // ─── ✅ 读取用户状态 ────────────────────────────────────

  _loadUserStatus() {
    const isAuthed = wx.getStorageSync('userAuthStatus') === true;
    const isVip    = wx.getStorageSync('userVipStatus')  === true;

    // 积分格式兼容：Number 或 {total: N}
    let userPoints = 0;
    const pts = wx.getStorageSync('userPoints');
    if (typeof pts === 'number') {
      userPoints = pts;
    } else if (pts && typeof pts.total === 'number') {
      userPoints = pts.total;
    }

    this.setData({ isAuthed, isVip, userPoints });
    console.log('[publish] 实名:', isAuthed, 'VIP:', isVip, '积分:', userPoints);
  },

  // ─── 出租方式切换 ────────────────────────────────────────

  onRentTypeChange(e) {
    this.setData({ 'publishForm.rentType': e.currentTarget.dataset.type });
  },

  // ─── 表单输入 ────────────────────────────────────────────

  onInputCity(e) {
    this.setData({ 'publishForm.city': e.detail.value });
  },
  onInputCommunity(e) {
    this.setData({ 'publishForm.community': e.detail.value });
  },
  onInputArea(e) {
    this.setData({ 'publishForm.area': e.detail.value });
  },
  onInputPrice(e) {
    this.setData({ 'publishForm.price': e.detail.value });
  },
  onInputDesc(e) {
    const val = e.detail.value;
    this.setData({ 'publishForm.desc': val, descCount: val.length });
  },

  // ─── Picker 选择 ─────────────────────────────────────────

  onPickerRoomType(e) {
    this.setData({ 'publishForm.roomType': this.data.roomTypeOptions[e.detail.value] });
  },
  onPickerDirection(e) {
    this.setData({ 'publishForm.direction': this.data.directionOptions[e.detail.value] });
  },
  onPickerMoveIn(e) {
    this.setData({ 'publishForm.moveInTime': this.data.moveInOptions[e.detail.value] });
  },
  onPickerPayType(e) {
    this.setData({ 'publishForm.payType': this.data.payTypeOptions[e.detail.value] });
  },

  // ─── 图片上传 ────────────────────────────────────────────

  onChooseImage() {
    const remain = 9 - this.data.publishForm.images.length;
    if (remain <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        const images = [...this.data.publishForm.images, ...newImages];
        this.setData({ 'publishForm.images': images });
      }
    });
  },
  onDeleteImage(e) {
    const images = [...this.data.publishForm.images];
    images.splice(e.currentTarget.dataset.idx, 1);
    this.setData({ 'publishForm.images': images });
  },
  onPreviewImage(e) {
    wx.previewImage({
      current: this.data.publishForm.images[e.currentTarget.dataset.idx],
      urls: this.data.publishForm.images
    });
  },

  // ─── 标签管理 ────────────────────────────────────────────

  onOpenTagModal() {
    this.setData({ showTagModal: true });
  },
  onCloseTagModal() {
    this.setData({ showTagModal: false });
  },
  onToggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    let tags = [...this.data.publishForm.tags];
    const idx = tags.indexOf(tag);
    if (idx >= 0) {
      tags.splice(idx, 1);
    } else {
      if (tags.length >= 10) {
        wx.showToast({ title: '最多选择10个标签', icon: 'none' });
        return;
      }
      tags.push(tag);
    }
    this.setData({ 'publishForm.tags': tags });
  },
  onRemoveTag(e) {
    const tags = [...this.data.publishForm.tags];
    tags.splice(e.currentTarget.dataset.idx, 1);
    this.setData({ 'publishForm.tags': tags });
  },

  // ─── VIP 开关 ────────────────────────────────────────────

  onVipToggle(e) {
    this.setData({ 'publishForm.isVipHouse': e.detail.value });
  },

  // ─── ✅ 套餐选择（4档） ──────────────────────────────────

  selectPackage(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ selectedPackage: type }, () => {
      this.calculatePayment();
    });
  },

  // ─── 切换支付方式 ────────────────────────────────────────

  onPaymentChange(e) {
    this.setData({ paymentMethod: e.detail.value }, () => {
      this.calculatePayment();
    });
  },

  // ─── 切换优惠券 ──────────────────────────────────────────

  onCouponToggle() {
    this.setData({ useCoupon: !this.data.useCoupon }, () => {
      this.calculatePayment();
    });
  },

  // ─── ✅ 计算应付金额（按新套餐规则） ─────────────────────

  calculatePayment() {
    const { selectedPackage, paymentMethod, useCoupon } = this.data;

    if (!selectedPackage) {
      this.setData({ finalPrice: 0, finalPoints: 0 });
      return;
    }

    if (useCoupon) {
      this.setData({ finalPrice: 0, finalPoints: 0 });
      return;
    }

    const pkg = PACKAGE_CONFIG[selectedPackage];
    if (!pkg) {
      this.setData({ finalPrice: 0, finalPoints: 0 });
      return;
    }

    if (paymentMethod === 'cash') {
      this.setData({ finalPrice: pkg.cashPrice, finalPoints: 0 });
    } else {
      this.setData({ finalPrice: 0, finalPoints: pkg.pointsPrice });
    }
  },

  // ─── 协议勾选 ────────────────────────────────────────────

  onToggleAgreed() {
    this.setData({ 'publishForm.agreed': !this.data.publishForm.agreed });
  },
  onViewAgreement() {
    wx.showModal({
      title: '个人用户租房房源展示服务协议',
      content: '本协议规定了用户在平江汇生活平台发布房源的相关权利与义务。用户承诺发布信息真实有效，不得发布虚假房源、欺诈信息。平台有权对违规房源进行下架处理。',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // ─── 表单校验 ────────────────────────────────────────────

  _validateForm() {
    const f = this.data.publishForm;
    const checks = [
      [!f.city || !f.city.trim(),      '请填写所在城市'],
      [!f.community || !f.community.trim(), '请填写所在小区'],
      [!f.area || !f.area.trim(),      '请填写房屋面积'],
      [!f.roomType,                    '请选择房屋户型'],
      [!f.direction,                   '请选择房屋朝向'],
      [!f.moveInTime,                  '请选择入住时间'],
      [!f.price || !f.price.trim(),    '请填写期望租金'],
      [!f.payType,                     '请选择付款方式'],
      [!f.agreed,                      '请先同意服务协议'],
      [!this.data.selectedPackage,     '请选择发布套餐'],
    ];

    for (const [fail, msg] of checks) {
      if (fail) {
        wx.showToast({ title: msg, icon: 'none' });
        return false;
      }
    }
    return true;
  },

  // ─── ✅ 提交（新增实名+VIP前置校验） ────────────────────

  onSubmitPublish() {
    const { isAuthed, isVip, paymentMethod, useCoupon, finalPoints, userPoints } = this.data;

    // ✅ 校验1：实名认证
    if (!isAuthed) {
      wx.showModal({
        title: '需要实名认证',
        content: '发布房源需要先完成实名认证，请前往"我的"页面完成认证后再发布。',
        confirmText: '去认证',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' });
          }
        }
      });
      return;
    }

    // ✅ 校验2：VIP开通
    if (!isVip) {
      wx.showModal({
        title: '需要开通VIP',
        content: '发布房源需要开通VIP房源保护服务，开通后租客将通过虚拟号码联系您，保护您的隐私。',
        confirmText: '立即开通',
        cancelText: '暂不开通',
        success: (res) => {
          if (res.confirm) {
            wx.showModal({
              title: '确认开通VIP',
              content: '开通后即可发布房源，是否确认开通？',
              confirmText: '确认开通',
              cancelText: '取消',
              success: (r) => {
                if (r.confirm) {
                  wx.setStorageSync('userVipStatus', true);
                  this.setData({ isVip: true });
                  wx.showToast({ title: 'VIP已开通，请继续发布', icon: 'success', duration: 2000 });
                }
              }
            });
          }
        }
      });
      return;
    }

    // ✅ 校验3：表单验证
    if (!this._validateForm()) return;

    // ✅ 校验4：积分不足拦截
    if (paymentMethod === 'points' && !useCoupon && finalPoints > userPoints) {
      wx.showModal({
        title: '积分不足',
        content: `当前积分 ${userPoints}，需要 ${finalPoints} 积分，可通过签到/发帖赚取积分。`,
        showCancel: false,
        confirmText: '知道了'
      });
      return;
    }

    wx.showModal({
      title: '确认发布',
      content: `将发布「${this.data.publishForm.rentType}」房源：${this.data.publishForm.community}，租金 ${this.data.publishForm.price} 元/月，确认提交吗？`,
      confirmText: '确认发布',
      success: (res) => {
        if (res.confirm) {
          this._doPublish();
        }
      }
    });
  },

  // ─── 执行发布 ────────────────────────────────────────────

  _doPublish() {
    this.setData({ isPublishing: true });

    const { paymentMethod, useCoupon, finalPoints, userPoints } = this.data;

    if (!useCoupon) {
      if (paymentMethod === 'points') {
        // ✅ 积分支付：扣除积分（兼容两种格式）
        const pts = wx.getStorageSync('userPoints');
        const newPoints = userPoints - finalPoints;

        if (typeof pts === 'number') {
          wx.setStorageSync('userPoints', newPoints);
        } else if (pts && typeof pts.total === 'number') {
          wx.setStorageSync('userPoints', { ...pts, total: newPoints });
        } else {
          wx.setStorageSync('userPoints', newPoints);
        }
        this.setData({ userPoints: newPoints });

        // 记录积分消费
        try {
          const consumeRecords = wx.getStorageSync('pointsConsumeRecords') || [];
          consumeRecords.unshift({
            scene: '租房发布',
            points: -finalPoints,
            time: new Date().toISOString()
          });
          wx.setStorageSync('pointsConsumeRecords', consumeRecords);
        } catch (e) {
          console.warn('[publish] 记录积分消费失败', e);
        }

      } else {
        // 现金支付：预留支付接口
        wx.showToast({ title: '支付功能开发中', icon: 'none' });
        this.setData({ isPublishing: false });
        return;
      }
    }

    // 模拟发布请求
    setTimeout(() => {
      const f = this.data.publishForm;
      const newItem = {
        id: Date.now(),
        title: `${f.community} ${f.roomType} ${f.rentType}`,
        type: f.rentType,
        isVip: f.isVipHouse,
        price: parseInt(f.price) || 0,
        room: `${f.roomType}/1卫`,
        area: `${f.city} ${f.community}`,
        desc: f.desc || '房源描述待完善',
        tags: f.tags,
        contact: '',
        publishTime: '刚刚',
        images: f.images,
        pkgId: this.data.selectedPackage,
      };

      // 写入"我发布的房源"列表
      try {
        const list = wx.getStorageSync('myPublishedRentals') || [];
        list.unshift(newItem);
        wx.setStorageSync('myPublishedRentals', list);
      } catch (e) {
        console.warn('[publish] 写入 myPublishedRentals 失败', e);
      }

      wx.showToast({ title: '发布成功！', icon: 'success' });
      setTimeout(() => {
        this.setData({ isPublishing: false });
        wx.navigateBack({ delta: 1 });
      }, 1000);
    }, 1500);
  }
});
