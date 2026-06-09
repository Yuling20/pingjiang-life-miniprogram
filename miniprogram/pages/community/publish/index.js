// pages/community/publish/index.js
Page({
  data: {
    // ─── 实名状态 ──────────────────────────────────
    isAuthed: false,

    // ─── 底部 Tab ──────────────────────────────────
    activeTab: 'text',

    // ─── 表单内容 ─────────────────────────────────
    content: '',
    contentCount: 0,

    // ─── 图片 ──────────────────────────────────────
    images: [],   // 最多9张

    // ─── 视频 ──────────────────────────────────────
    video: null,
    videoThumb: '',

    // ─── 话题 ──────────────────────────────────────
    selectedTopic: '',
    showTopicPanel: false,
    hotTopics: [
      '平江生活', '本地美食', '平江旅游', '亲子活动',
      '二手交流', '租房求租', '求职招聘', '平江新鲜事',
      '中式美学', '健康养生', '爱宠乐园', '运动健身',
    ],

    // ─── 可见范围 ──────────────────────────────────
    visibility: 'public',

    // ─── AI 灵感 ───────────────────────────────────
    showAiTip: false,
    currentAiTip: '',
    aiTips: [
      '分享一个你最近发现的平江美食打卡地 🍜',
      '聊聊平江最近有什么好玩的活动？🎉',
      '推荐一个平江周边适合周末游的地方 🌿',
      '说说你对平江近期变化的感受 🏙️',
      '有什么平江生活小技巧想分享吗？💡',
    ],

    // ─── 发布状态 ──────────────────────────────────
    isPublishing: false,
    canPublish: false,
  },

  // ═══ 生命周期 ════════════════════════════════════

  onLoad() {
    // ✅ 问题1修复：进入页面立即校验实名，未认证直接拦截
    this._checkAuth();
  },

  onShow() {
    // 每次显示页面都重新校验（防止用户从设置返回后状态变化）
    this._checkAuth();
    this._refreshCanPublish();
  },

  // ═══ 实名校验（强制前置）════════════════════════════

  /**
   * ✅ 问题1修复核心：
   * 发布页进入 onLoad 时即调用此方法，
   * 未实名则弹窗提示并返回上一页，不允许进入发布流程。
   */
  _checkAuth() {
    const info1 = wx.getStorageSync('userRealNameInfo');
    const info2 = wx.getStorageSync('userAuthStatus');
    const isAuthed = !!(
      (info1 && info1.verified) || info2 === true
    );
    this.setData({ isAuthed });

    if (!isAuthed) {
      wx.showModal({
        title: '发帖需要实名认证',
        content: '发帖功能需完成实名认证后方可使用，请前往「我的」页面完成认证。',
        confirmText: '去认证',
        cancelText: '取消',
        showCancel: true,
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/mine/mine' });
          } else {
            // 取消也返回，不允许停留在发布页
            wx.navigateBack({ delta: 1 });
          }
        },
        // 点击蒙层关闭也返回
        fail: () => {
          wx.navigateBack({ delta: 1 });
        },
      });
    }
  },

  // ═══ canPublish 计算 ═════════════════════════════

  _refreshCanPublish() {
    const { content, images, video } = this.data;
    const canPublish =
      content.trim().length > 0 ||
      images.length > 0 ||
      !!video;
    this.setData({ canPublish });
  },

  // ═══ 底部类型 Tab ═════════════════════════════════

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (tab === 'image') {
      if (this.data.video) {
        wx.showToast({ title: '已有视频，不能同时添加图片', icon: 'none' });
      } else if (this.data.images.length >= 9) {
        wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      } else {
        this._pickImages();
      }
    } else if (tab === 'video') {
      if (this.data.images.length > 0) {
        wx.showToast({ title: '已有图片，不能同时添加视频', icon: 'none' });
      } else if (this.data.video) {
        wx.showToast({ title: '已有视频，如需更换请先删除', icon: 'none' });
      } else {
        this._pickVideo();
      }
    }
  },

  // ═══ 正文输入 ════════════════════════════════════

  onContentInput(e) {
    const val = e.detail.value;
    this.setData({ content: val, contentCount: val.length });
    this._refreshCanPublish();
  },

  // ═══ 图片操作 ════════════════════════════════════

  _pickImages() {
    const remain = 9 - this.data.images.length;
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImgs = res.tempFiles.map(f => f.tempFilePath);
        const images = [...this.data.images, ...newImgs];
        this.setData({ images });
        this._refreshCanPublish();
      },
    });
  },

  onChooseImage() {
    if (this.data.video) {
      wx.showToast({ title: '已有视频，不能同时添加图片', icon: 'none' });
      return;
    }
    if (this.data.images.length >= 9) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }
    this._pickImages();
  },

  onDeleteImage(e) {
    const idx = e.currentTarget.dataset.idx;
    const images = [...this.data.images];
    images.splice(idx, 1);
    this.setData({ images });
    this._refreshCanPublish();
  },

  onPreviewImage(e) {
    wx.previewImage({
      current: this.data.images[e.currentTarget.dataset.idx],
      urls: this.data.images,
    });
  },

  // ═══ 视频操作 ════════════════════════════════════

  _pickVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 180,
      camera: 'back',
      success: (res) => {
        const file = res.tempFiles[0];
        this.setData({
          video: {
            tempFilePath: file.tempFilePath,
            duration: file.duration,
            thumbTempFilePath: file.thumbTempFilePath || '',
          },
          videoThumb: file.thumbTempFilePath || '',
        });
        this._refreshCanPublish();
      },
    });
  },

  onDeleteVideo() {
    wx.showModal({
      title: '删除视频',
      content: '确认删除已选视频？',
      confirmText: '删除',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.setData({ video: null, videoThumb: '' });
          this._refreshCanPublish();
        }
      },
    });
  },

  onPreviewVideo() {
    if (!this.data.video) return;
    wx.previewMedia({
      sources: [{ url: this.data.video.tempFilePath, type: 'video' }],
    });
  },

  // ═══ 话题操作 ════════════════════════════════════

  onOpenTopic() { this.setData({ showTopicPanel: true }); },
  onCloseTopic() { this.setData({ showTopicPanel: false }); },

  onSelectTopic(e) {
    const topic = e.currentTarget.dataset.topic;
    this.setData({
      selectedTopic: this.data.selectedTopic === topic ? '' : topic,
      showTopicPanel: false,
    });
  },

  onClearTopic() { this.setData({ selectedTopic: '' }); },

  // ═══ 可见范围 ════════════════════════════════════

  onToggleVisibility() {
    this.setData({
      visibility: this.data.visibility === 'public' ? 'follow' : 'public',
    });
  },

  // ═══ AI 灵感 ═════════════════════════════════════

  onAiInspire() {
    const tips = this.data.aiTips;
    const tip = tips[Math.floor(Math.random() * tips.length)];
    this.setData({ showAiTip: true, currentAiTip: tip });
    setTimeout(() => this.setData({ showAiTip: false }), 5000);
  },

  onUseAiTip() {
    const tip = this.data.currentAiTip
      .replace(/[\u{1F300}-\u{1FFFF}]/gu, '')
      .trim();
    this.setData({ content: tip, contentCount: tip.length, showAiTip: false });
    this._refreshCanPublish();
  },

  onCloseAiTip() { this.setData({ showAiTip: false }); },

  // ═══ 关闭 / 返回 ═════════════════════════════════

  onClose() {
    const { content, images, video } = this.data;
    if (!content.trim() && images.length === 0 && !video) {
      wx.navigateBack({ delta: 1 });
      return;
    }
    wx.showModal({
      title: '放弃发布？',
      content: '当前内容将不会保存，确认放弃？',
      confirmText: '放弃',
      cancelText: '继续编辑',
      success: (res) => {
        if (res.confirm) wx.navigateBack({ delta: 1 });
      },
    });
  },

  // ═══ 发布 ════════════════════════════════════════

  onPublish() {
    // 双重校验，防止绕过
    if (!this.data.isAuthed) { this._checkAuth(); return; }
    if (!this.data.canPublish) {
      wx.showToast({ title: '请输入内容或添加图片/视频', icon: 'none' });
      return;
    }
    if (this.data.isPublishing) return;

    this.setData({ isPublishing: true });
    wx.showLoading({ title: '发布中...' });

    // ── 积分奖励 ──
    try {
      const pts = wx.getStorageSync('userPoints');
      let cur = 0;
      if (typeof pts === 'number') {
        cur = pts;
        wx.setStorageSync('userPoints', cur + 10);
      } else if (pts && typeof pts.total === 'number') {
        wx.setStorageSync('userPoints', { ...pts, total: pts.total + 10 });
      } else {
        wx.setStorageSync('userPoints', 10);
      }
      const records = wx.getStorageSync('pointsEarnRecords') || [];
      records.unshift({ scene: '发布帖子', points: 10, time: new Date().toISOString() });
      wx.setStorageSync('pointsEarnRecords', records.slice(0, 200));
    } catch (e) {
      console.warn('[publish] 积分同步失败', e);
    }

    const { content, images, video, selectedTopic, visibility } = this.data;
    let mediaType = 'text';
    if (video) mediaType = 'video';
    else if (images.length > 0 && content.trim()) mediaType = 'imageText';
    else if (images.length > 0) mediaType = 'image';

    const post = {
      id: Date.now(),
      content: content.trim(),
      images: images.slice(),
      video: video ? { ...video } : null,
      mediaType,
      topic: selectedTopic,
      visibility,
      publishTime: new Date().toISOString(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isLiked: false,
    };

    try {
      const list = wx.getStorageSync('myPublishedPosts') || [];
      list.unshift(post);
      wx.setStorageSync('myPublishedPosts', list);
    } catch (e) {
      console.warn('[publish] 写入失败', e);
    }

    setTimeout(() => {
      wx.hideLoading();
      this.setData({ isPublishing: false });
      wx.showToast({ title: '发布成功 +10积分', icon: 'success', duration: 2000 });
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1600);
    }, 1200);
  },

  // ─── 分享相关（保留原生分享hook） ────────────────
  onShareAppMessage() {
    return {
      title: '平江汇生活社区',
      path: '/pages/community/community',
    };
  },
});
