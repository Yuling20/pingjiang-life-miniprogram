// miniprogram/pages/home/home.js

const { POINTS_CONFIG, calcActualPoints, isDailyLimitReached } = require('../../config/points');

// ✅ 统一日期格式工具函数，避免 toLocaleDateString 因设备不同格式不一致
function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`; // 固定格式：2025-07-14
}

Page({
  data: {
    weatherInfo: {
      city: '平江',
      temp: '25°C',
      weather: '晴',
      wind: '东风2级',
      air: '空气良'
    },
    bannerList: [
      { id: 1, icon: '🚨', title: '停水停电通知',  desc: '点击查看最新通知公告', bgColor: '#E74C3C', type: 'water' },
      { id: 2, icon: '💼', title: '本地招聘信息',  desc: '平江最新招聘职位',     bgColor: '#2980B9', type: 'job' },
      { id: 3, icon: '🏠', title: '房屋租赁',      desc: '平江本地房源汇总',     bgColor: '#27AE60', type: 'rental' },
      { id: 4, icon: '🔧', title: '家政维修',      desc: '专业上门服务',         bgColor: '#8E44AD', type: 'homeservice' }
    ],

    quickMenuList: [
      { id: 1, icon: '💬', name: '贴吧',   type: 'community' },
      { id: 2, icon: '💼', name: '招聘',   type: 'job' },
      { id: 3, icon: '🏠', name: '租房',   type: 'rental' },
      { id: 4, icon: '🔧', name: '家政',   type: 'homeservice' },
      { id: 5, icon: '🚨', name: '停水电', type: 'water' },
      { id: 6, icon: '📋', name: '办事',   type: 'guide' }
    ],

    serviceList: [
      { id: 1, icon: '💼', name: '找工作',   type: 'job',         color: '#2980B9' },
      { id: 2, icon: '🏠', name: '房屋租赁', type: 'rental',      color: '#27AE60' },
      { id: 3, icon: '🔧', name: '家政维修', type: 'homeservice', color: '#E67E22' },
      { id: 4, icon: '🚨', name: '停水停电', type: 'water',       color: '#E74C3C' },
      { id: 5, icon: '📋', name: '办事指南', type: 'guide',       color: '#8E44AD' },
      // ✅ 保留名称"孝亲守护"，type 改为 familytree，跳转新页面
      { id: 6, icon: '🌳', name: '孝亲守护', type: 'familytree',  color: '#D4820A' }
    ],

    communityList: [
      { id: 1, icon: '📸', name: '随手拍',   category: '游玩' },
      { id: 2, icon: '🆘', name: '求助互助', category: '求助互助' },
      { id: 3, icon: '🔄', name: '二手转让', category: '二手交易' },
      { id: 4, icon: '💬', name: '今日话题', category: '扯闲谈' },
      { id: 5, icon: '📢', name: '本地活动', category: '活动' },
      { id: 6, icon: '🐾', name: '萌宠交流', category: '宠物' }
    ],

    articleList: [
      { id: 1, tag: '热议', title: '平江新医院建设最新进度来了！',   count: 328 },
      { id: 2, tag: '求助', title: '有没有人知道北街哪里有修鞋的？', count: 45 },
      { id: 3, tag: '热议', title: '平江这家餐厅真的太好吃了！',     count: 156 }
    ],

    contentFlow: [
      { id: 1, tag: '📸', title: '医院建设最新进度',    desc: '📸 12人看过',  color: '#2980B9' },
      { id: 2, tag: '❤️', title: '杨园小区邻居随手拍', desc: '❤️ 28人点赞', color: '#E74C3C' },
      { id: 3, tag: '▶️', title: '住院必备清单分享',   desc: '▶️ 156次播放', color: '#8E44AD' },
      { id: 4, tag: '💼', title: '本地招聘·护工急招', desc: '💼 今日发布',  color: '#27AE60' }
    ],

    showSignModal: false,
  },

  /** 页面定时器缓存，用于销毁延时弹窗 */
  _signPopupTimer: null,

  onLoad() {
    console.log('首页加载完成');
    this.loadWeather();
  },

  onShow() {
    // ✅ 每次显示页面，先清除上次残留定时器
    if (this._signPopupTimer) {
      clearTimeout(this._signPopupTimer);
      this._signPopupTimer = null;
    }
    // ✅ 每次进入页面都重新检测（包括从签到页返回后）
    this.checkSignPopup();
  },

  onHide() {
    if (this._signPopupTimer) {
      clearTimeout(this._signPopupTimer);
      this._signPopupTimer = null;
    }
  },

  onUnload() {
    if (this._signPopupTimer) {
      clearTimeout(this._signPopupTimer);
      this._signPopupTimer = null;
    }
  },

  loadWeather() {
    this.setData({
      weatherInfo: {
        city: '平江',
        temp: '25°C',
        weather: '晴',
        wind: '东风2级',
        air: '空气良'
      }
    });
  },

  onBannerTap(e) {
    const item = e.currentTarget.dataset.item;
    this._doNavigate(item.type);
  },

  onBannerChange() {},

  navigateQuick(e) {
    const type = e.currentTarget.dataset.type;
    this._doNavigate(type);
  },

  navigateToService(e) {
    const type = e.currentTarget.dataset.type;
    this._doNavigate(type);
  },

  _doNavigate(type) {
    // 社区 Tab 跳转
    if (type === 'community') {
      wx.switchTab({ url: '/pages/community/community' });
      return;
    }

    // ✅ 孝亲守护 → 家庭心树新页面
    if (type === 'familytree') {
      wx.navigateTo({
        url: '/pages/services/convenience/familytree/index',
        fail(err) {
          console.error('[跳转失败] familytree:', err);
          wx.showToast({ title: '页面加载失败，请重试', icon: 'none' });
        }
      });
      return;
    }

    // 其余便民服务路由表
    const routeMap = {
      job:         '/pages/services/convenience/job/job',
      rental:      '/pages/services/convenience/rental/rental',
      homeservice: '/pages/services/convenience/homeservice/homeservice',
      water:       '/pages/services/convenience/water/water',
      guide:       '/pages/services/convenience/guide/guide'
    };

    const url = routeMap[type];
    if (url) {
      wx.navigateTo({ url });
    } else {
      wx.showToast({ title: '该功能即将上线', icon: 'none' });
    }
  },

  navigateCommunity(e) {
    wx.switchTab({ url: '/pages/community/community' });
  },

  goToCommunity() {
    const app = getApp();
    app.globalData.communityInitCategory = '';
    wx.switchTab({ url: '/pages/community/community' });
  },

  goToCommunityCategory(e) {
    const category = e.currentTarget.dataset.category || '';
    const app = getApp();
    app.globalData.communityInitCategory = category;
    wx.switchTab({ url: '/pages/community/community' });
  },

  goToConvenience() {
    wx.navigateTo({ url: '/pages/services/convenience/guide/guide' });
  },

  goToContentDetail(e) {
    wx.switchTab({ url: '/pages/community/community' });
  },

  goToAI() {
    wx.navigateTo({ url: '/pages/ai/ai' });
  },

  // =========================================================
  // ✅ 核心修复：checkSignPopup 使用统一日期格式 getTodayStr()
  // 规则：
  //   1. 今日已签到（signedDate === today）→ 永不弹窗
  //   2. 今日未签到 + 已点"今日不再提醒" → 不弹窗
  //   3. 今日未签到 + 未屏蔽提醒 → 5秒后弹窗
  // =========================================================
  checkSignPopup() {
    const today = getTodayStr();

    const signedDate = wx.getStorageSync('signedDate') || '';
    console.log('[签到弹窗] 今日:', today, '上次签到日期:', signedDate);

    if (signedDate === today) {
      console.log('[签到弹窗] 今日已签到，跳过弹窗');
      return;
    }

    const noPopupDate = wx.getStorageSync('signPopupNoShowDate') || '';
    if (noPopupDate === today) {
      console.log('[签到弹窗] 用户已选今日不再提醒，跳过弹窗');
      return;
    }

    console.log('[签到弹窗] 未签到，5秒后弹出提醒');
    this._signPopupTimer = setTimeout(() => {
      const latestSignedDate = wx.getStorageSync('signedDate') || '';
      if (latestSignedDate === today) {
        console.log('[签到弹窗] 定时器触发时检测到已签到，取消弹窗');
        return;
      }
      this.setData({ showSignModal: true });
    }, 5000);
  },

  // 弹窗按钮①：立即签到
  onModalGoSign() {
    this.setData({ showSignModal: false });
    wx.navigateTo({ url: '/pages/mine/sign/index' });
  },

  // 弹窗按钮②：今日不再提醒
  onModalNoTip() {
    const today = getTodayStr();
    wx.setStorageSync('signPopupNoShowDate', today);
    this.setData({ showSignModal: false });
  },

  // 点击遮罩不关闭，防止误触
  onModalMaskTap() {},

  // 跳转积分中心
  onGoIntegral() {
    this.setData({ showSignModal: false });
    wx.navigateTo({ url: '/pages/mine/points/index' });
  },

  // =========================================================
  // ✅ 签到成功回调（签到页调用）
  // =========================================================
  onSignSuccess() {
    const today = getTodayStr();
    wx.setStorageSync('signedDate', today);
    console.log('[签到弹窗] 签到成功，记录日期:', today);
    this.setData({ showSignModal: false });
  }
});
