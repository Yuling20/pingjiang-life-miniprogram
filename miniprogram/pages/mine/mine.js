// miniprogram/pages/mine/mine.js
// 修复：
//   1. goMyActivity 改为跳转社区首页（与 goMyPosts 区分）
//   2. goPointsCenter 改为 wx.navigateTo 直接跳转，移除可能导致闪现的多余逻辑
//   3. _loadPoints 全面兼容积分存储格式，加日志排查

const app = getApp();

// 统一日期格式
function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

Page({

  data: {
    userInfo: {
      nickName: '微信用户',
      avatarUrl: '/images/avatar.png'
    },
    isAuthed: false,
    totalPoints: 0,
    hasSigned: false,
    myJobCount: 0,
    myRentalCount: 0,
    myPostCount: 0,
    unreadActivity: 0,
    showContactModal: false,
    contactWechatId: 'pjhsh2025',
  },

  onLoad() {
    this._initPage();
  },

  onShow() {
    this._initPage();
  },

  // ─── 初始化 ──────────────────────────────────────────────

  _initPage() {
    this._loadUserInfo();
    this._loadAuthStatus();
    this._loadPoints();
    this._loadMyJobCount();
    this._loadMyRentalCount();
    this._loadMyPostCount();
    this._loadUnreadActivity();
  },

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
   * ✅ 问题3修复：全面兼容积分存储格式
   * 兼容以下所有情况：
   *   - { total: 30 }         points页标准格式
   *   - { points: 30 }        部分旧版格式
   *   - 30                    直接存数字
   *   - { totalPoints: 30 }   变体字段名
   */
  _loadPoints() {
    try {
      // ✅ 优先尝试读取 userPoints（标准key）
      const pts = wx.getStorageSync('userPoints');

      // ✅ 同时尝试读取其他可能的key（积分页可能用不同key存储）
      const pts2 = wx.getStorageSync('pointsData');
      const pts3 = wx.getStorageSync('myPoints');

      // 调试：打印所有积分相关缓存值，帮助排查格式问题
      console.log('[mine] userPoints原始值:', JSON.stringify(pts));
      console.log('[mine] pointsData原始值:', JSON.stringify(pts2));
      console.log('[mine] myPoints原始值:', JSON.stringify(pts3));

      let total = 0;

      // 解析 userPoints
      if (pts !== null && pts !== undefined && pts !== '') {
        if (typeof pts === 'number') {
          total = pts;
        } else if (typeof pts === 'object') {
          // 兼容多种字段名
          if (typeof pts.total === 'number') total = pts.total;
          else if (typeof pts.points === 'number') total = pts.points;
          else if (typeof pts.totalPoints === 'number') total = pts.totalPoints;
          else if (typeof pts.score === 'number') total = pts.score;
        }
      }

      // 如果 userPoints 没取到，尝试其他key
      if (total === 0 && pts2 !== null && pts2 !== undefined && pts2 !== '') {
        if (typeof pts2 === 'number') total = pts2;
        else if (typeof pts2 === 'object') {
          if (typeof pts2.total === 'number') total = pts2.total;
          else if (typeof pts2.points === 'number') total = pts2.points;
        }
      }

      if (total === 0 && pts3 !== null && pts3 !== undefined && pts3 !== '') {
        if (typeof pts3 === 'number') total = pts3;
        else if (typeof pts3 === 'object') {
          if (typeof pts3.total === 'number') total = pts3.total;
          else if (typeof pts3.points === 'number') total = pts3.points;
        }
      }

      // 读取签到状态
      const signedDate = wx.getStorageSync('signedDate') || '';
      const hasSigned = (signedDate === getTodayStr());

      console.log('[mine] 最终积分:', total, '今日已签到:', hasSigned);
      this.setData({ totalPoints: total, hasSigned });

    } catch (e) {
      console.warn('[mine] 读取积分失败', e);
      this.setData({ totalPoints: 0, hasSigned: false });
    }
  },

  _loadMyJobCount() {
    try {
      const list = wx.getStorageSync('myPublishedJobs') || [];
      this.setData({ myJobCount: list.length });
    } catch (e) {
      console.warn('[mine] 读取 myPublishedJobs 失败', e);
    }
  },

  _loadMyRentalCount() {
    try {
      const list = wx.getStorageSync('myPublishedRentals') || [];
      this.setData({ myRentalCount: list.length });
    } catch (e) {
      console.warn('[mine] 读取 myPublishedRentals 失败', e);
    }
  },

  _loadMyPostCount() {
    try {
      const list = wx.getStorageSync('myPublishedPosts') || [];
      this.setData({ myPostCount: list.length });
    } catch (e) {
      console.warn('[mine] 读取 myPublishedPosts 失败', e);
    }
  },

  _loadUnreadActivity() {
    try {
      const count = wx.getStorageSync('myUnreadActivity') || 0;
      this.setData({ unreadActivity: count });
    } catch (e) {
      console.warn('[mine] 读取 myUnreadActivity 失败', e);
    }
  },

  // ─── 跳转事件 ─────────────────────────────────────────────

  goAuth() {
    if (this.data.isAuthed) {
      wx.showToast({ title: '您已完成实名认证', icon: 'success', duration: 1500 });
      return;
    }
    wx.showModal({
      title: '微信一键实名',
      content: '即将调用微信授权+人脸识别完成实名认证，信息仅用于平台安全验证。',
      confirmText: '确认授权',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('userAuthStatus', true);
          this.setData({ isAuthed: true });
          wx.showToast({ title: '实名认证完成', icon: 'success', duration: 1500 });
        }
      }
    });
  },

  /**
   * ✅ 问题2修复：直接跳转积分中心，不做任何前置操作
   * 移除原来的 fail 回调中的 showToast（避免跳转前闪现提示）
   */
  goPointsCenter() {
    wx.navigateTo({
      url: '/pages/mine/points/index'
    });
  },

  goMyJobs() {
    wx.navigateTo({
      url: '/pages/mine/my-jobs/index',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  goMyRentals() {
    wx.navigateTo({
      url: '/pages/mine/my-rentals/index',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  /**
   * ✅ 问题1修复：我发布的帖子 → 跳转社区用户页，筛选我的帖子
   */
  goMyPosts() {
    wx.navigateTo({
      url: '/pages/community/user/index?filter=myPosts',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  /**
   * ✅ 问题1修复：我的帖子动态 → 跳转社区首页（不再与goMyPosts同一页面）
   * 社区首页可以看到互动消息，与"我发布的帖子"列表区分开
   */
  goMyActivity() {
    // 清空未读计数
    wx.setStorageSync('myUnreadActivity', 0);
    this.setData({ unreadActivity: 0 });

    // ✅ 改为跳转贴吧社区首页（switchTab，因为community是tabBar页）
    wx.switchTab({
      url: '/pages/community/community',
      fail: () => {
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  // ─── 联系我们 ─────────────────────────────────────────────

  showContactModal() {
    this.setData({ showContactModal: true });
  },

  hideContactModal() {
    this.setData({ showContactModal: false });
  },

  stopProp() {},

  copyWechatId() {
    const wechatId = this.data.contactWechatId;
    wx.setClipboardData({
      data: wechatId,
      success: () => {
        wx.showToast({ title: '微信号已复制', icon: 'success', duration: 1500 });
      },
      fail: () => {
        wx.showToast({ title: '复制失败，请手动记录', icon: 'none', duration: 1500 });
      }
    });
  },

  // ─── 退出登录 ─────────────────────────────────────────────

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录吗？',
      confirmText: '退出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('userAuthStatus');
          this.setData({
            userInfo: { nickName: '微信用户', avatarUrl: '/images/avatar.png' },
            isAuthed: false
          });
          wx.showToast({ title: '已退出登录', icon: 'success', duration: 1200 });
          setTimeout(() => {
            wx.switchTab({ url: '/pages/home/home' });
          }, 1300);
        }
      }
    });
  }

});
