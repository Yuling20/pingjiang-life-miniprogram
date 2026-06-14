// pages/mine/mine.js
// 问题4：onBuyVip 加入微信支付集成代码结构（注释），正式上线前对接后端接口

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

const MALE_AVATARS = Array.from({length: 20}, (_, i) =>
  `/images/avatars男/avatar${String(i+1).padStart(2,'0')}.png`
);
const FEMALE_AVATARS = Array.from({length: 20}, (_, i) =>
  `/images/avatarsnv/avatar${String(i+21).padStart(2,'0')}.png`
);

const VIP_BENEFITS = [
  {
    feature: '头像使用权限',
    normal:  '仅可使用平台内置基础头像，禁止自定义上传',
    vip:     '解锁全部平台头像；支持自主上传图片制作个性化头像',
  },
  {
    feature: '昵称修改',
    normal:  '按规则限制修改频次',
    vip:     '每月可免费修改1次昵称',
  },
  {
    feature: '外观特权',
    normal:  '默认基础样式，无特殊标识',
    vip:     '专属头像框、专属昵称配色、全局VIP身份标识',
  },
  {
    feature: '贴吧主页背景',
    normal:  '默认纯色背景，不可更改',
    vip:     '可自主上传图片或视频作为贴吧主页背景',
  },
  {
    feature: '访客查看',
    normal:  '无法查看主页/动态访客记录',
    vip:     '可查看所有访问过自己主页、帖子的用户',
  },
  {
    feature: '福利礼包',
    normal:  '无专属礼包',
    vip:     '生日专属福利礼包；各大节日专属祝福+额外福利',
  },
];

const VIP_PACKAGES = [
  { id: 'month',  name: '月卡', price: '9.9元',  desc: '连续包月更优惠' },
  { id: 'season', name: '季卡', price: '24.9元', desc: '3个月畅享VIP' },
  { id: 'year',   name: '年卡', price: '69.9元', desc: '年度最超值之选' },
];

Page({
  data: {
    userInfo: {
      nickName:  '平江用户',
      avatarUrl: '/images/avatars男/avatar01.png',
      bio:       '',
    },
    isAuthed:       false,
    isVip:          false,
    totalPoints:    0,
    hasSigned:      false,
    myJobCount:     0,
    myRentalCount:  0,
    myPostCount:    0,
    showContactModal:  false,
    contactWechatId:   'pjhsh2025',
    showAvatarPanel:   false,
    maleAvatars:       MALE_AVATARS,
    femaleAvatars:     FEMALE_AVATARS,
    showMaleTab:       true,
    showNickModal:     false,
    nickInput:         '',
    showBioModal:      false,
    bioInput:          '',
    showVipModal:      false,
    vipBenefits:       VIP_BENEFITS,
    vipPackages:       VIP_PACKAGES,
    selectedPkg:       'year',
    showSuggestModal:  false,
    suggestContent:    '',
    suggestContact:    '',
  },

  onLoad() { this._initPage(); },
  onShow()  { this._initPage(); },

  _initPage() {
    this._loadUserInfo();
    this._loadAuthStatus();
    this._loadPoints();
    this._loadMyJobCount();
    this._loadMyRentalCount();
    this._loadMyPostCount();
  },

  _loadUserInfo() {
    try {
      const info = wx.getStorageSync('userInfo');
      if (info && info.nickName) {
        this.setData({ userInfo: info, isVip: !!info.isVip });
      }
    } catch(e) {}
  },

  _loadAuthStatus() {
    try {
      const s = wx.getStorageSync('userAuthStatus');
      this.setData({ isAuthed: s === true });
    } catch(e) { this.setData({ isAuthed: false }); }
  },

  _loadPoints() {
    try {
      const pts = wx.getStorageSync('userPoints');
      let total = 0;
      if (typeof pts === 'number') {
        total = pts;
      } else if (pts && typeof pts === 'object') {
        total = pts.totalPoints || pts.total || pts.points || 0;
      }
      const hasSigned = (wx.getStorageSync('signedDate') || '') === getTodayStr();
      this.setData({ totalPoints: total, hasSigned });
    } catch(e) { this.setData({ totalPoints: 0, hasSigned: false }); }
  },

  _loadMyJobCount() {
    try { this.setData({ myJobCount: (wx.getStorageSync('myPublishedJobs') || []).length }); } catch(e) {}
  },
  _loadMyRentalCount() {
    try { this.setData({ myRentalCount: (wx.getStorageSync('myPublishedRentals') || []).length }); } catch(e) {}
  },
  _loadMyPostCount() {
    try { this.setData({ myPostCount: (wx.getStorageSync('myPublishedPosts') || []).length }); } catch(e) {}
  },

  // ─── 头像面板 ──────────────────────────────────────────────
  onOpenAvatarPanel() {
    const info     = this.data.userInfo;
    const isVip    = !!info.isVip;
    const lastDate = info.lastAvatarChangeDate || '';
    const today    = getTodayStr();
    if (!isVip && lastDate && lastDate.slice(0,4) === today.slice(0,4)) {
      wx.showToast({ title: '普通用户每年仅可更换1次头像，开通VIP享每月更换特权', icon: 'none', duration: 3000 });
      return;
    }
    if (isVip && lastDate && lastDate.slice(0,7) === today.slice(0,7)) {
      wx.showToast({ title: 'VIP每月可更换1次头像，下月再来', icon: 'none', duration: 2500 });
      return;
    }
    this.setData({ showAvatarPanel: true, showMaleTab: true });
  },

  onCloseAvatarPanel() { this.setData({ showAvatarPanel: false }); },

  onSwitchTab(e) {
    this.setData({ showMaleTab: e.currentTarget.dataset.tab === 'male' });
  },

  onSelectAvatar(e) {
    const url  = e.currentTarget.dataset.url;
    const info = this.data.userInfo;
    const newInfo = { ...info, avatarUrl: url, lastAvatarChangeDate: getTodayStr() };
    wx.setStorageSync('userInfo', newInfo);
    this.setData({ userInfo: newInfo, showAvatarPanel: false });
    wx.showToast({ title: '头像已更新', icon: 'success' });
  },

  onUploadAvatar() {
    if (!this.data.isVip) {
      wx.showToast({ title: '开通VIP后可上传自定义头像', icon: 'none', duration: 2500 });
      return;
    }
    wx.chooseMedia({
      count: 1, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        const info     = this.data.userInfo;
        const newInfo  = { ...info, avatarUrl: tempPath, lastAvatarChangeDate: getTodayStr() };
        wx.setStorageSync('userInfo', newInfo);
        this.setData({ userInfo: newInfo, showAvatarPanel: false });
        wx.showToast({ title: '头像已更新', icon: 'success' });
      }
    });
  },

  // ─── 昵称编辑 ──────────────────────────────────────────────
  onOpenNickModal() {
    this.setData({ showNickModal: true, nickInput: this.data.userInfo.nickName || '' });
  },
  onCloseNickModal() { this.setData({ showNickModal: false }); },
  onNickInput(e) { this.setData({ nickInput: e.detail.value }); },
  onConfirmNick() {
    const nick = (this.data.nickInput || '').trim();
    if (!nick)          { wx.showToast({ title: '昵称不能为空', icon: 'none' }); return; }
    if (nick.length>16) { wx.showToast({ title: '昵称最多16个字', icon: 'none' }); return; }
    const info     = this.data.userInfo;
    const isVip    = !!info.isVip;
    const lastDate = info.lastNickChangeDate || '';
    const today    = getTodayStr();
    if (!isVip && lastDate && lastDate.slice(0,4) === today.slice(0,4)) {
      wx.showToast({ title: '普通用户每年仅可修改1次昵称', icon: 'none', duration: 2500 }); return;
    }
    if (isVip && lastDate && lastDate.slice(0,7) === today.slice(0,7)) {
      wx.showToast({ title: 'VIP每月可修改1次昵称', icon: 'none', duration: 2500 }); return;
    }
    const newInfo = { ...info, nickName: nick, lastNickChangeDate: today };
    wx.setStorageSync('userInfo', newInfo);
    this.setData({ userInfo: newInfo, showNickModal: false });
    wx.showToast({ title: '昵称已更新', icon: 'success' });
  },

  // ─── 简介编辑 ──────────────────────────────────────────────
  onOpenBioModal() {
    this.setData({ showBioModal: true, bioInput: this.data.userInfo.bio || '' });
  },
  onCloseBioModal() { this.setData({ showBioModal: false }); },
  onBioInput(e) {
    const val = e.detail.value;
    if (val.length > 30) return;
    this.setData({ bioInput: val });
  },
  onConfirmBio() {
    const bio     = (this.data.bioInput || '').trim();
    const newInfo = { ...this.data.userInfo, bio };
    wx.setStorageSync('userInfo', newInfo);
    this.setData({ userInfo: newInfo, showBioModal: false });
    wx.showToast({ title: '简介已更新', icon: 'success' });
  },

  // ─── VIP弹窗 ───────────────────────────────────────────────
  onOpenVip()  { this.setData({ showVipModal: true }); },
  onCloseVip() { this.setData({ showVipModal: false }); },
  onSelectPkg(e) { this.setData({ selectedPkg: e.currentTarget.dataset.id }); },

  /**
   * 问题4：微信支付集成
   * 上线步骤：
   * 1. 登录 https://pay.weixin.qq.com 申请商户号
   * 2. 小程序后台绑定商户号，配置支付授权域名
   * 3. 后端实现 /api/createVipOrder 接口，返回 wx.requestPayment 所需参数
   * 4. 解除下方注释，删除演示版代码
   */
  onBuyVip() {
    const pkg = this.data.vipPackages.find(p => p.id === this.data.selectedPkg);
    wx.showModal({
      title:       `确认开通 ${pkg ? pkg.name : 'VIP'}`,
      content:     `${pkg ? pkg.price : ''} · 开通即同意平台VIP服务协议`,
      confirmText: '确认开通',
      cancelText:  '取消',
      success: (res) => {
        if (!res.confirm) return;

        /* ── 正式支付代码（对接后端后取消注释） ──────────────────
        wx.showLoading({ title: '创建订单...' });
        wx.request({
          url:    'https://YOUR_BACKEND_DOMAIN/api/createVipOrder',
          method: 'POST',
          header: { 'content-type': 'application/json' },
          data: {
            pkgId:  this.data.selectedPkg,
            openId: wx.getStorageSync('openId') || '',
          },
          success: (orderRes) => {
            wx.hideLoading();
            if (orderRes.statusCode === 200 && orderRes.data.code === 0) {
              const p = orderRes.data.payParams;
              wx.requestPayment({
                timeStamp: p.timeStamp,
                nonceStr:  p.nonceStr,
                package:   p.package,
                signType:  p.signType || 'MD5',
                paySign:   p.paySign,
                success: () => {
                  // 支付成功→写本地VIP状态（同时通知后端核验）
                  const info = wx.getStorageSync('userInfo') || {};
                  info.isVip = true;
                  wx.setStorageSync('userInfo', info);
                  this.setData({ isVip: true, userInfo: info, showVipModal: false });
                  wx.showModal({
                    title:      '🎉 VIP开通成功',
                    content:    '欢迎加入平江汇生活VIP大家庭！',
                    showCancel: false,
                    confirmText:'知道了',
                  });
                },
                fail: (err) => {
                  wx.hideLoading();
                  if (err.errMsg !== 'requestPayment:fail cancel') {
                    wx.showToast({ title: '支付失败，请重试', icon: 'none' });
                  }
                }
              });
            } else {
              wx.showToast({ title: orderRes.data.msg || '下单失败，请重试', icon: 'none' });
            }
          },
          fail: () => {
            wx.hideLoading();
            wx.showToast({ title: '网络异常，请检查连接', icon: 'none' });
          }
        });
        ────────────────────────────────────────────────────── */

        // ── 演示版（上线前删除以下代码）──────────────────────
        wx.showToast({ title: '支付功能即将上线', icon: 'none', duration: 2000 });
        // ────────────────────────────────────────────────────
      }
    });
  },

  // ─── 建议信箱 ──────────────────────────────────────────────
  onOpenSuggest() {
    this.setData({ showSuggestModal: true, suggestContent: '', suggestContact: '' });
  },
  onCloseSuggest() { this.setData({ showSuggestModal: false }); },
  onSuggestInput(e) {
    const val = e.detail.value;
    if (val.length > 300) return;
    this.setData({ suggestContent: val });
  },
  onContactInput(e) {
    this.setData({ suggestContact: e.detail.value });
  },
  onSubmitSuggest() {
    const content = (this.data.suggestContent || '').trim();
    if (content.length < 5) {
      wx.showToast({ title: '建议内容至少5个字', icon: 'none', duration: 2000 });
      return;
    }
    try {
      const list = wx.getStorageSync('suggestList') || [];
      list.unshift({
        id:      Date.now(),
        content,
        contact: this.data.suggestContact,
        time:    new Date().toLocaleString(),
      });
      wx.setStorageSync('suggestList', list.slice(0, 200));
    } catch(e) {}
    this.setData({ showSuggestModal: false });
    wx.showModal({
      title:      '感谢您的建议',
      content:    '谢谢您对平江汇生活的支持，我们会认真参考您的建议，不断优化，为平江人民提供更好的服务！',
      showCancel: false,
      confirmText:'好的',
    });
  },

  // ─── 跳转 ──────────────────────────────────────────────────
  goAuth() {
    if (this.data.isAuthed) {
      wx.showToast({ title: '您已完成实名认证', icon: 'success', duration: 1500 }); return;
    }
    wx.showModal({
      title:       '微信一键实名',
      content:     '即将调用微信授权+人脸识别完成实名认证，信息仅用于平台安全验证。',
      confirmText: '确认授权', cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('userAuthStatus', true);
          this.setData({ isAuthed: true });
          wx.showToast({ title: '实名认证完成', icon: 'success', duration: 1500 });
        }
      }
    });
  },

  goPointsCenter() {
    wx.navigateTo({ url: '/pages/mine/points/index', fail: () => wx.showToast({ title: '跳转失败', icon: 'none' }) });
  },
  goMyJobs() {
    wx.navigateTo({ url: '/pages/mine/my-jobs/index', fail: () => wx.showToast({ title: '跳转失败', icon: 'none' }) });
  },
  goMyRentals() {
    wx.navigateTo({ url: '/pages/mine/my-rentals/index', fail: () => wx.showToast({ title: '跳转失败', icon: 'none' }) });
  },
  goMyPosts() {
    wx.navigateTo({
      url:  '/pages/community/user/index?self=1',
      fail: () => wx.showToast({ title: '跳转失败', icon: 'none' })
    });
  },

  showContactModal() { this.setData({ showContactModal: true }); },
  hideContactModal() { this.setData({ showContactModal: false }); },
  stopProp() {},

  copyWechatId() {
    wx.setClipboardData({
      data:    this.data.contactWechatId,
      success: () => wx.showToast({ title: '微信号已复制', icon: 'success', duration: 1500 }),
      fail:    () => wx.showToast({ title: '复制失败', icon: 'none', duration: 1500 }),
    });
  },

  handleLogout() {
    wx.showModal({
      title: '提示', content: '确认退出登录吗？',
      confirmText: '退出', cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          ['userInfo','userAuthStatus','userVipStatus','signedDate','signRecord'].forEach(k => wx.removeStorageSync(k));
          this.setData({
            userInfo:      { nickName: '平江用户', avatarUrl: '/images/avatars男/avatar01.png', bio: '' },
            isAuthed:      false,
            isVip:         false,
            totalPoints:   0,
            hasSigned:     false,
            myJobCount:    0,
            myRentalCount: 0,
            myPostCount:   0,
          });
          wx.showToast({ title: '已退出登录', icon: 'success', duration: 1200 });
          setTimeout(() => wx.switchTab({ url: '/pages/home/home' }), 1300);
        }
      }
    });
  },
});
