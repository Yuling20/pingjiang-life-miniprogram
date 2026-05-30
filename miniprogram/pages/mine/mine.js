// pages/mine/mine.js
Page({
  data: {
    // 用户基本信息
    userInfo: null,
    hasLogin: false,

    // 实名认证相关
    realNameInfo: null,       // { verified, name }
    showRealNamePanel: false, // 实名认证面板是否展开
    wechatVerified: false,    // 微信是否已实名（模拟）

    // 手动实名表单
    manualForm: {
      name: '',
      idCard: '',
      phone: ''
    },
    showManualForm: false,    // 手动实名表单是否显示

    // 弹窗
    showAuthDialog: false,    // 微信一键实名弹窗
    authDialogStep: 0,        // 0:确认 1:人脸识别中 2:成功

    // 菜单列表
    menuList: [
      { id: 'realname', icon: '🪪', label: '实名认证', badge: '' },
      { id: 'myJobs', icon: '💼', label: '我发布的职位', badge: '' },
      { id: 'myResume', icon: '📄', label: '我的简历', badge: '' },
      { id: 'collect', icon: '⭐', label: '我的收藏', badge: '' },
      { id: 'setting', icon: '⚙️', label: '设置', badge: '' },
    ]
  },

  onLoad() {
    this._loadRealNameInfo()
    this._loadUserInfo()
    this._checkWechatVerified()
  },

  onShow() {
    this._loadRealNameInfo()
  },

  // ─── 加载本地实名信息 ───────────────────────────────────────────
  _loadRealNameInfo() {
    try {
      const raw = wx.getStorageSync('userRealNameInfo')
      if (raw) {
        const info = typeof raw === 'string' ? JSON.parse(raw) : raw
        this.setData({ realNameInfo: info })
      } else {
        this.setData({ realNameInfo: null })
      }
    } catch (e) {
      this.setData({ realNameInfo: null })
    }
  },

  // ─── 加载用户信息（模拟登录态） ──────────────────────────────────
  _loadUserInfo() {
    try {
      const u = wx.getStorageSync('userInfo')
      if (u) {
        this.setData({ userInfo: u, hasLogin: true })
      }
    } catch (e) { /* ignore */ }
  },

  // ─── 模拟检测微信是否已实名（随机或本地缓存） ────────────────────
  _checkWechatVerified() {
    try {
      const flag = wx.getStorageSync('wechatSelfVerified')
      // 此处模拟：若本地标记为true则微信已实名，否则未实名
      this.setData({ wechatVerified: !!flag })
    } catch (e) {
      this.setData({ wechatVerified: false })
    }
  },

  // ─── 登录（模拟） ────────────────────────────────────────────────
  onLogin() {
    wx.getUserProfile({
      desc: '用于完善用户信息',
      success: (res) => {
        const userInfo = res.userInfo
        wx.setStorageSync('userInfo', userInfo)
        this.setData({ userInfo, hasLogin: true })
        wx.showToast({ title: '登录成功', icon: 'success' })
      },
      fail: () => {
        // 模拟登录兜底
        const mockUser = { nickName: '平江用户', avatarUrl: '' }
        wx.setStorageSync('userInfo', mockUser)
        this.setData({ userInfo: mockUser, hasLogin: true })
      }
    })
  },

  // ─── 展开/收起实名认证面板 ──────────────────────────────────────
  onToggleRealNamePanel() {
    if (this.data.realNameInfo && this.data.realNameInfo.verified) {
      wx.showToast({ title: '您已完成实名认证', icon: 'none' })
      return
    }
    this.setData({
      showRealNamePanel: !this.data.showRealNamePanel,
      showManualForm: false
    })
  },

  // ─── 点击「微信一键实名」─────────────────────────────────────────
  onWechatAuth() {
    this.setData({ showAuthDialog: true, authDialogStep: 0 })
  },

  // ─── 弹窗：确认授权 ──────────────────────────────────────────────
  onConfirmAuth() {
    this.setData({ authDialogStep: 1 })
    // 模拟人脸识别耗时
    setTimeout(() => {
      this.setData({ authDialogStep: 2 })
    }, 1800)
  },

  // ─── 弹窗：取消 ─────────────────────────────────────────────────
  onCancelAuth() {
    this.setData({ showAuthDialog: false, authDialogStep: 0 })
  },

  // ─── 弹窗：认证成功后关闭 ────────────────────────────────────────
  onAuthSuccess() {
    const info = { verified: true, name: '微信用户', type: 'wechat' }
    wx.setStorageSync('userRealNameInfo', JSON.stringify(info))
    // 同时标记微信已实名
    wx.setStorageSync('wechatSelfVerified', true)
    this.setData({
      realNameInfo: info,
      showAuthDialog: false,
      authDialogStep: 0,
      showRealNamePanel: false,
      wechatVerified: true
    })
    wx.showToast({ title: '实名认证成功 🎉', icon: 'none' })
  },

  // ─── 切换手动实名表单 ────────────────────────────────────────────
  onShowManualForm() {
    this.setData({ showManualForm: true })
  },

  // ─── 手动表单输入 ────────────────────────────────────────────────
  onInputName(e) {
    this.setData({ 'manualForm.name': e.detail.value })
  },
  onInputIdCard(e) {
    this.setData({ 'manualForm.idCard': e.detail.value })
  },
  onInputPhone(e) {
    this.setData({ 'manualForm.phone': e.detail.value })
  },

  // ─── 提交手动实名 ────────────────────────────────────────────────
  onSubmitManual() {
    const { name, idCard, phone } = this.data.manualForm

    if (!name || name.trim().length < 2) {
      wx.showToast({ title: '姓名至少2个字', icon: 'none' }); return
    }
    if (!idCard || idCard.trim().length !== 18) {
      wx.showToast({ title: '请输入18位身份证号', icon: 'none' }); return
    }
    if (!phone || phone.trim().length !== 11) {
      wx.showToast({ title: '请输入11位手机号', icon: 'none' }); return
    }

    wx.showModal({
      title: '确认提交',
      content: `姓名：${name}\n身份证：${idCard.slice(0, 3)}***${idCard.slice(-4)}\n手机：${phone.slice(0, 3)}****${phone.slice(-4)}`,
      confirmText: '确认',
      success: (res) => {
        if (res.confirm) {
          this._saveManualVerified(name)
        }
      }
    })
  },

  _saveManualVerified(name) {
    // 脱敏处理：余** 格式
    const desensName = name[0] + '**'
    const info = { verified: true, name: desensName, type: 'manual' }
    wx.setStorageSync('userRealNameInfo', JSON.stringify(info))
    this.setData({
      realNameInfo: info,
      showRealNamePanel: false,
      showManualForm: false,
      manualForm: { name: '', idCard: '', phone: '' }
    })
    wx.showToast({ title: '实名认证成功 🎉', icon: 'none' })
  },

  // ─── 菜单点击路由 ────────────────────────────────────────────────
  onMenuTap(e) {
    const id = e.currentTarget.dataset.id
    switch (id) {
      case 'realname':
        this.onToggleRealNamePanel()
        break
      case 'myJobs':
        wx.navigateTo({ url: '/pages/services/convenience/job/job?tab=mine' })
        break
      case 'myResume':
        wx.navigateTo({ url: '/pages/services/convenience/job/job?tab=resume' })
        break
      case 'collect':
        wx.showToast({ title: '功能开发中', icon: 'none' })
        break
      case 'setting':
        wx.showToast({ title: '功能开发中', icon: 'none' })
        break
    }
  },

  // ─── 退出登录 ────────────────────────────────────────────────────
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          this.setData({ userInfo: null, hasLogin: false })
          wx.showToast({ title: '已退出', icon: 'none' })
        }
      }
    })
  }
})
