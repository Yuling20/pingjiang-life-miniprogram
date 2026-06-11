// app.js
App({
  globalData: {
    communityInitCategory: null,

    // ✅ 开发模式开关：上线前改为 false
    // 为 true 时跳过实名拦截，并自动写入实名缓存
    DEV_MODE: true,
  },

  onLaunch() {
    this._initDevAuth()
    this._initUserInfo()
  },

  // ─── 开发模式：自动写入实名状态 ──────────────────
  _initDevAuth() {
    if (!this.globalData.DEV_MODE) return

    // 写入两种格式，兼容所有页面的校验逻辑
    try {
      const existing1 = wx.getStorageSync('userRealNameInfo')
      const existing2 = wx.getStorageSync('userAuthStatus')

      // 只在未设置时写入，避免覆盖真实用户数据
      if (!existing1 || !existing1.verified) {
        wx.setStorageSync('userRealNameInfo', {
          verified: true,
          name: '开发者',
          idCard: '430000199001010000', // 脱敏占位
          verifiedAt: new Date().toISOString(),
        })
      }
      if (existing2 !== true) {
        wx.setStorageSync('userAuthStatus', true)
      }

      console.log('[DEV] 已自动写入实名认证状态')
    } catch (e) {
      console.warn('[DEV] 写入实名状态失败', e)
    }
  },

  // ─── 初始化用户基本信息 ───────────────────────────
  _initUserInfo() {
    try {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: (userRes) => {
                this.globalData.userInfo = userRes.userInfo
              }
            })
          }
        }
      })
    } catch (e) {}
  },
})
