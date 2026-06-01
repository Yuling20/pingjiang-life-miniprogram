// miniprogram/pages/mine/mine.js
// 功能：个人中心页面逻辑
// 版本：d295002
// 规则：
//   - 移除全屏弹窗，改为列表入口
//   - 实名状态读取本地缓存 key：userAuthStatus
//   - 积分读取本地缓存 key：userPoints
//   - 便民服务 / 贴吧社区分区入口
//   - 禁用云开发，仅使用 wx.getStorageSync / wx.setStorageSync

const app = getApp();

Page({

  data: {
    /* 用户基本信息 */
    userInfo: {
      nickName: '微信用户',
      avatarUrl: '/images/avatar.png'
    },

    /* 实名状态：读取缓存 key: userAuthStatus */
    isAuthed: false,

    /* 积分总数：读取缓存 key: userPoints */
    totalPoints: 0,

    /* 便民服务发布数量 */
    myJobCount: 0,
    myRentalCount: 0,

    /* 贴吧社区 */
    myPostCount: 0,
    unreadActivity: 0,

    /* 联系我们弹窗 */
    showContactModal: false,
    contactWechatId: 'pjhsh2025',   // ← 替换为实际微信号
  },

  // ─── 生命周期 ────────────────────────────────────────────

  onLoad() {
    this._initPage();
  },

  onShow() {
    // 每次显示时刷新，保证数据实时
    this._initPage();
  },

  // ─── 初始化 ──────────────────────────────────────────────

  /**
   * 页面数据初始化
   * 全部从本地缓存读取，无需网络请求
   */
  _initPage() {
    this._loadUserInfo();
    this._loadAuthStatus();
    this._loadPoints();
    this._loadMyJobCount();
    this._loadMyRentalCount();
    this._loadMyPostCount();
    this._loadUnreadActivity();
  },

  /** 读取用户信息（微信登录后写入的昵称/头像） */
  _loadUserInfo() {
    try {
      const info = wx.getStorageSync('userInfo');
      if (info && info.nickName) {
        this.setData({ userInfo: info });
      }
    } catch (e) {
      console.warn('[mine] 读取 userInfo 失败', e);
    }
  },

  /**
   * 读取实名状态
   * 缓存 key: userAuthStatus
   * true = 已实名，false/空 = 未实名
   */
  _loadAuthStatus() {
    try {
      const status = wx.getStorageSync('userAuthStatus');
      this.setData({ isAuthed: status === true });
    } catch (e) {
      console.warn('[mine] 读取 userAuthStatus 失败', e);
      this.setData({ isAuthed: false });
    }
  },

  /**
   * 读取积分
   * 缓存 key: userPoints（存储格式：{ total: Number }）
   */
  _loadPoints() {
    try {
      const pts = wx.getStorageSync('userPoints');
      const total = (pts && typeof pts.total === 'number') ? pts.total : 0;
      this.setData({ totalPoints: total });
    } catch (e) {
      console.warn('[mine] 读取 userPoints 失败', e);
      this.setData({ totalPoints: 0 });
    }
  },

  /**
   * 读取我发布的招聘数量
   * 缓存 key: myPublishedJobs（Array）
   */
  _loadMyJobCount() {
    try {
      const list = wx.getStorageSync('myPublishedJobs') || [];
      this.setData({ myJobCount: list.length });
    } catch (e) {
      console.warn('[mine] 读取 myPublishedJobs 失败', e);
    }
  },

  /**
   * 读取我发布的房源数量
   * 缓存 key: myPublishedRentals（Array）
   */
  _loadMyRentalCount() {
    try {
      const list = wx.getStorageSync('myPublishedRentals') || [];
      this.setData({ myRentalCount: list.length });
    } catch (e) {
      console.warn('[mine] 读取 myPublishedRentals 失败', e);
    }
  },

  /**
   * 读取我发布的帖子数量
   * 缓存 key: myPublishedPosts（Array）
   */
  _loadMyPostCount() {
    try {
      const list = wx.getStorageSync('myPublishedPosts') || [];
      this.setData({ myPostCount: list.length });
    } catch (e) {
      console.warn('[mine] 读取 myPublishedPosts 失败', e);
    }
  },

  /**
   * 读取未读互动数（评论/点赞）
   * 缓存 key: myUnreadActivity（Number）
   */
  _loadUnreadActivity() {
    try {
      const count = wx.getStorageSync('myUnreadActivity') || 0;
      this.setData({ unreadActivity: count });
    } catch (e) {
      console.warn('[mine] 读取 myUnreadActivity 失败', e);
    }
  },

  // ─── 跳转事件 ─────────────────────────────────────────────

  /** 跳转实名认证页 */
  goAuth() {
    // 已实名：提示无需重复认证
    if (this.data.isAuthed) {
      wx.showToast({
        title: '您已完成实名认证',
        icon: 'success',
        duration: 1500
      });
      return;
    }
    // 未实名：跳转认证流程（沿用原有逻辑，调用微信授权+人脸）
    wx.showModal({
      title: '微信一键实名',
      content: '即将调用微信授权+人脸识别完成实名认证，信息仅用于平台安全验证。',
      confirmText: '确认授权',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 模拟实名完成（实际项目中对接真实认证接口）
          wx.setStorageSync('userAuthStatus', true);
          this.setData({ isAuthed: true });
          wx.showToast({
            title: '实名认证完成',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  /** 跳转积分中心 */
  goPointsCenter() {
    wx.navigateTo({
      url: '/pages/mine/points/index',
      fail: () => {
        // 积分中心页面尚未建立时的友好提示
        wx.showToast({
          title: '积分中心开发中',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  /** 跳转我发布的招聘 */
  goMyJobs() {
    wx.navigateTo({
      url: '/pages/services/convenience/job/job?filter=mine',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  /** 跳转我发布的房源 */
  goMyRentals() {
    wx.navigateTo({
      url: '/pages/services/convenience/rental/rental?filter=mine',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  /** 跳转我发布的帖子 */
  goMyPosts() {
    wx.navigateTo({
      url: '/pages/community/user/index?filter=myPosts',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  /** 跳转我的帖子动态（评论/点赞） */
  goMyActivity() {
    // 清空未读计数
    wx.setStorageSync('myUnreadActivity', 0);
    this.setData({ unreadActivity: 0 });

    wx.navigateTo({
      url: '/pages/community/user/index?filter=myActivity',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  // ─── 联系我们 ─────────────────────────────────────────────

  /** 显示联系我们弹窗 */
  showContactModal() {
    this.setData({ showContactModal: true });
  },

  /** 关闭联系我们弹窗 */
  hideContactModal() {
    this.setData({ showContactModal: false });
  },

  /** 阻止弹窗内容区点击事件冒泡（防止点内部触发关闭） */
  stopProp() {
    // 空函数，用于 catchtap 阻止冒泡
  },

  /** 复制微信号到剪贴板 */
  copyWechatId() {
    const wechatId = this.data.contactWechatId;
    wx.setClipboardData({
      data: wechatId,
      success: () => {
        wx.showToast({
          title: '微信号已复制',
          icon: 'success',
          duration: 1500
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败，请手动记录',
          icon: 'none',
          duration: 1500
        });
      }
    });
  },

  // ─── 退出登录 ─────────────────────────────────────────────

  /** 退出登录：清空用户相关缓存，回到首页 */
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 清除登录相关缓存（保留积分等业务数据）
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('userAuthStatus');

          this.setData({
            userInfo: { nickName: '微信用户', avatarUrl: '/images/avatar.png' },
            isAuthed: false
          });

          wx.showToast({
            title: '已退出登录',
            icon: 'success',
            duration: 1200
          });

          // 延迟跳回首页
          setTimeout(() => {
            wx.switchTab({ url: '/pages/home/home' });
          }, 1300);
        }
      }
    });
  }

});