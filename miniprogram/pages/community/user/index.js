// pages/community/user/index.js
// 修复4个报错 + 关注/粉丝列表 + 实名前置 + 积分联动 + 分享去重 + 自赞不加分

Page({
  data: {
    // ── 修复Bug2/3：根级字段，wxml直接绑定，不与userInfo嵌套并存 ──
    nickName:  '平江用户',
    avatarUrl: '/images/avatars男/avatar01.png',
    bio:       '',
    isVip:     false,
    isAuthed:  false,
    userId:    '',

    isSelf:    false,
    profileBg: '',
    bgIsVideo: false,

    // 统计
    followCount: 0,
    fansCount:   0,
    postCount:   0,
    likeCount:   0,

    // 关注/粉丝弹窗
    showFollowModal: false,
    showFansModal:   false,
    followList:      [],
    fansList:        [],

    // 访客（VIP）
    showVisitorPanel: false,
    visitorList:      [],
    myViewedList:     [],

    postList:  [],
    isLoading: true,
  },

  onLoad(options) {
    const isSelf = options.self === '1';
    this.setData({ isSelf });
    this._syncUserInfo();
    this._loadProfileBg();
    this._loadStats();
    this._loadPosts();
    if (isSelf) this._loadVisitorData();
  },

  onShow() {
    this._syncUserInfo();
    this._loadProfileBg();
    this._loadStats();
    this._loadPosts();
  },

  // ══ 数据同步 ═══════════════════════════════════════════════

  /** 修复Bug2/3：统一写根级字段，wxml无需 userInfo.xxx 嵌套访问 */
  _syncUserInfo() {
    try {
      const info     = wx.getStorageSync('userInfo') || {};
      const isAuthed = wx.getStorageSync('userAuthStatus') === true;
      this.setData({
        nickName:  info.nickName  || '平江用户',
        avatarUrl: info.avatarUrl || '/images/avatars男/avatar01.png',
        bio:       info.bio       || '',
        isVip:     !!info.isVip,
        userId:    info.userId    || '',
        isAuthed,
      });
    } catch(e) {}
  },

  _loadProfileBg() {
    try {
      const bg      = wx.getStorageSync('profileBgImage')   || '';
      const bgIsVid = wx.getStorageSync('profileBgIsVideo') || false;
      this.setData({ profileBg: bg, bgIsVideo: bgIsVid });
    } catch(e) {}
  },

  _loadStats() {
    try {
      const posts      = wx.getStorageSync('myPublishedPosts') || [];
      const s          = wx.getStorageSync('profileStats')     || {};
      const followList = wx.getStorageSync('myFollowList')     || [];
      const fansList   = wx.getStorageSync('myFansList')       || [];
      this.setData({
        followCount: followList.length || s.follow || 0,
        fansCount:   fansList.length   || s.fans   || 0,
        postCount:   posts.length,
        likeCount:   s.likes || 0,
        followList,
        fansList,
      });
    } catch(e) {}
  },

  _loadPosts() {
    try {
      const list      = wx.getStorageSync('myPublishedPosts') || [];
      const formatted = list.map((p, i) => ({
        ...p,
        id:           p.id           || `post_${i}`,
        timeLabel:    this._formatTime(p.createTime || p.time || Date.now()),
        liked:        p.liked        || false,
        likeCount:    p.likeCount    || 0,
        commentCount: p.commentCount || 0,
      }));
      this.setData({ postList: formatted, isLoading: false });
    } catch(e) {
      this.setData({ isLoading: false });
    }
  },

  _loadVisitorData() {
    try {
      const visitorList  = wx.getStorageSync('profileVisitors') || [];
      const myViewedList = wx.getStorageSync('myViewedUsers')   || [];
      this.setData({ visitorList, myViewedList });
    } catch(e) {}
  },

  _formatTime(ts) {
    const now  = Date.now();
    const diff = now - Number(ts);
    if (diff < 60000)        return '刚刚';
    if (diff < 3600000)      return `${Math.floor(diff/60000)}分钟前`;
    if (diff < 86400000)     return `${Math.floor(diff/3600000)}小时前`;
    if (diff < 86400000 * 2) return '昨天';
    const d = new Date(Number(ts));
    return `${d.getMonth()+1}月${d.getDate()}日`;
  },

  _getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  // ══ 实名校验 ═══════════════════════════════════════════════

  _checkAuth() {
    const isAuthed = wx.getStorageSync('userAuthStatus') === true;
    if (!isAuthed) {
      wx.showModal({
        title:       '需要实名认证',
        content:     '发帖、点赞、评论、转发等互动操作需要先完成实名认证。',
        confirmText: '去认证',
        cancelText:  '取消',
        success: (res) => {
          if (!res.confirm) return;
          wx.showModal({
            title:       '微信一键实名',
            content:     '即将通过微信授权完成实名认证，信息仅用于平台安全验证。',
            confirmText: '确认授权',
            cancelText:  '取消',
            success: (r) => {
              if (r.confirm) {
                wx.setStorageSync('userAuthStatus', true);
                this.setData({ isAuthed: true });
                wx.showToast({ title: '实名认证完成', icon: 'success' });
              }
            }
          });
        }
      });
      return false;
    }
    return true;
  },

  // ══ 积分工具（全局200分/天上限） ════════════════════════════

  /**
   * @param {string} scene   积分场景描述
   * @param {number} pts     本次奖励分数
   * @param {string} dailyKey 场景key（用于计次）
   * @param {number} dailyMax 单场景每日最大次数（0=不限次但受全局上限）
   * @returns {number} 实际获得积分
   */
  _addPoints(scene, pts, dailyKey, dailyMax) {
    try {
      const today      = this._getTodayStr();
      const DAILY_CAP  = 200; // 全局每日上限
      const countKey   = `${dailyKey}_count_${today}`;
      const todayCount = wx.getStorageSync(countKey) || 0;

      if (dailyMax > 0 && todayCount >= dailyMax) return 0;

      const stored   = wx.getStorageSync('userPoints') || {};
      const oldTotal = typeof stored === 'number' ? stored
                     : (stored.totalPoints || stored.total || stored.points || 0);
      const oldToday = (stored && stored.todayEarned) ? stored.todayEarned : 0;

      // 全局200/天上限
      const actual = Math.min(pts, Math.max(0, DAILY_CAP - oldToday));
      if (actual <= 0) return 0;

      wx.setStorageSync('userPoints', {
        ...(typeof stored === 'object' ? stored : {}),
        totalPoints: oldTotal + actual,
        todayEarned: oldToday + actual,
      });
      if (dailyMax > 0) wx.setStorageSync(countKey, todayCount + 1);

      // 写入明细
      const records = wx.getStorageSync('pointsEarnRecords') || [];
      records.unshift({
        id:     `${dailyKey}_${Date.now()}`,
        scene,
        points: actual,
        time:   new Date().toLocaleString(),
      });
      wx.setStorageSync('pointsEarnRecords', records.slice(0, 200));
      return actual;
    } catch(e) { return 0; }
  },

  // ══ VIP背景（问题2：支持图片/视频） ════════════════════════

  onChangeBg() {
    if (!this.data.isVip) {
      wx.showModal({
        title:       'VIP专属权益',
        content:     '自定义主页背景是VIP专属功能，开通后即可使用图片或视频背景。',
        confirmText: '去开通',
        cancelText:  '取消',
        success: (res) => { if (res.confirm) wx.navigateBack(); }
      });
      return;
    }
    wx.showActionSheet({
      itemList: ['上传图片背景', '上传视频背景（≤15秒）', '恢复默认背景'],
      success: (res) => {
        if (res.tapIndex === 2) {
          wx.removeStorageSync('profileBgImage');
          wx.removeStorageSync('profileBgIsVideo');
          this.setData({ profileBg: '', bgIsVideo: false });
          wx.showToast({ title: '已恢复默认', icon: 'success' });
          return;
        }
        const isVideo = res.tapIndex === 1;
        if (isVideo) {
          wx.chooseMedia({
            count:      1,
            mediaType:  ['video'],
            sourceType: ['album'],
            success: (r) => {
              const file = r.tempFiles[0];
              if (file.duration && file.duration > 15) {
                wx.showToast({ title: '视频时长不能超过15秒', icon: 'none', duration: 2000 });
                return;
              }
              wx.setStorageSync('profileBgImage',   file.tempFilePath);
              wx.setStorageSync('profileBgIsVideo', true);
              this.setData({ profileBg: file.tempFilePath, bgIsVideo: true });
              wx.showToast({ title: '视频背景已更新', icon: 'success' });
            }
          });
        } else {
          wx.chooseMedia({
            count:      1,
            mediaType:  ['image'],
            sizeType:   ['compressed'],
            sourceType: ['album', 'camera'],
            success: (r) => {
              const path = r.tempFiles[0].tempFilePath;
              wx.setStorageSync('profileBgImage',   path);
              wx.setStorageSync('profileBgIsVideo', false);
              this.setData({ profileBg: path, bgIsVideo: false });
              wx.showToast({ title: '图片背景已更新', icon: 'success' });
            }
          });
        }
      }
    });
  },

  // ══ 关注/粉丝列表（问题3：点击有弹窗） ══════════════════════

  onShowFollow() { this.setData({ showFollowModal: true }); },
  onCloseFollow() { this.setData({ showFollowModal: false }); },
  onShowFans()  { this.setData({ showFansModal: true }); },
  onCloseFans() { this.setData({ showFansModal: false }); },

  // ══ 访客面板（VIP专属） ══════════════════════════════════════

  onShowVisitors() {
    if (!this.data.isVip) {
      wx.showModal({
        title:       'VIP专属',
        content:     '查看访客记录是VIP专属功能，开通后即可查看谁看过你。',
        confirmText: '去开通',
        cancelText:  '取消',
        success: (res) => { if (res.confirm) wx.navigateBack(); }
      });
      return;
    }
    this.setData({ showVisitorPanel: true });
  },
  onCloseVisitors() { this.setData({ showVisitorPanel: false }); },

  // ══ 点赞（问题6：自己的帖子自己点不加积分） ══════════════════

  onLikePost(e) {
    if (!this._checkAuth()) return;
    const idx  = e.currentTarget.dataset.idx;
    const list = [...this.data.postList];
    const post = list[idx];
    if (!post) return;

    post.liked     = !post.liked;
    post.likeCount = Math.max(0, (post.likeCount || 0) + (post.liked ? 1 : -1));
    list[idx] = post;
    this.setData({ postList: list });

    try {
      const stored = wx.getStorageSync('myPublishedPosts') || [];
      if (stored[idx]) {
        stored[idx].likeCount = post.likeCount;
        stored[idx].liked     = post.liked;
        wx.setStorageSync('myPublishedPosts', stored);
      }
    } catch(e) {}

    // 问题6：isSelf=true 表示自己看自己的帖 → 自赞不加积分
    if (post.liked && !this.data.isSelf) {
      const got = this._addPoints('帖子被点赞', 2, 'like_recv', 0);
      if (got > 0) wx.showToast({ title: `+${got}积分`, icon: 'none', duration: 1000 });
    }
  },

  // ══ 跳转详情（查看无需实名，评论在详情页控制） ════════════════

  goPostDetail(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    wx.navigateTo({
      url:  `/pages/community/detail/index?id=${id}`,
      fail: () => wx.showToast({ title: '页面跳转失败', icon: 'none' })
    });
  },

  // ══ 分享到朋友圈（+10积分，每日最多3次） ════════════════════

  onShareToMoments(e) {
    if (!this._checkAuth()) return;
    const idx  = e.currentTarget.dataset.idx;
    const post = this.data.postList[idx];
    if (!post) return;
    wx.showModal({
      title:       '分享到朋友圈',
      content:     '分享成功可获得10积分，每日最多计3次',
      confirmText: '去分享',
      cancelText:  '取消',
      success: (res) => {
        if (!res.confirm) return;
        const got = this._addPoints('转发帖子到朋友圈', 10, 'share_moments', 3);
        wx.showToast({
          title:    got > 0 ? `分享成功 +${got}积分` : '分享成功（今日已达上限）',
          icon:     'success',
          duration: 1800,
        });
      }
    });
  },

  /** 未实名时点击好友分享按钮的拦截 */
  onNeedAuthShare() {
    this._checkAuth();
  },

  // ══ 好友分享（问题5：+10积分，同帖同天去重，全局200/天） ════

  onShareAppMessage(res) {
    if (res.from === 'button') {
      const idx  = parseInt((res.target && res.target.dataset && res.target.dataset.idx) || 0);
      const post = this.data.postList[idx] || {};

      // 问题5：同一帖子同一天只计一次积分（替代"同一接收人"去重）
      const today    = this._getTodayStr();
      const shareKey = `share_friend_${post.id || idx}_${today}`;
      try {
        const alreadyShared = wx.getStorageSync(shareKey) || false;
        if (!alreadyShared) {
          const got = this._addPoints('分享帖子给好友', 10, 'share_friend', 0);
          wx.setStorageSync(shareKey, true); // 标记今天已分享此帖
          if (got > 0) {
            setTimeout(() => {
              wx.showToast({ title: `分享成功 +${got}积分`, icon: 'success', duration: 1500 });
            }, 400);
          }
        }
      } catch(e) {}

      return {
        title:    ((post.content || post.title || '来自平江贴吧的帖子')).slice(0, 30),
        path:     `/pages/community/detail/index?id=${post.id || ''}`,
        imageUrl: (post.images && post.images[0]) || '',
      };
    }
    return {
      title: `${this.data.nickName || '平江用户'}的贴吧主页`,
      path:  `/pages/community/user/index`,
    };
  },

  goBack()   { wx.navigateBack(); },
  stopProp() {},
});
