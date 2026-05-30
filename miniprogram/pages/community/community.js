// pages/community/community.js
Page({
  data: {
    // 分类标签（已移除"租房"和"招聘"）
    tabs: ['全部', '公告', '美食', '活动', '生活', '求助'],
    currentTab: 0,

    // 搜索
    searchKeyword: '',

    // 所有帖子（原始数据）
    allPosts: [],
    // 过滤后展示的帖子
    filteredPosts: [],

    // 分页
    page: 1,
    pageSize: 10,
    hasMore: true,
    isRefreshing: false,

    // 分享弹窗
    showShareMenu: false,
    currentSharePostId: null,
    currentSharePostIndex: -1,

    // 实名授权弹窗
    showAuthModal: false,
    isAuthed: false,           // 是否已完成实名（本地缓存）
    pendingShareAction: null,  // 授权后待执行的分享动作

    // 后端接口预留字段
    apiConfig: {
      baseUrl: 'https://your-api-domain.com',
      listApi: '/api/community/posts',
      searchApi: '/api/community/posts/search',
      likeApi: '/api/community/posts/like',
      shareApi: '/api/community/posts/share',
      authApi: '/api/user/auth/check',
    }
  },

  onLoad() {
    // 读取本地实名状态
    const isAuthed = wx.getStorageSync('isRealNameAuthed') || false;
    this.setData({ isAuthed });
    this._loadMockData();
  },

  onPullDownRefresh() {
    this.onRefresh();
  },

  onRefresh() {
    this.setData({ isRefreshing: true, page: 1, hasMore: true });
    setTimeout(() => {
      this._loadMockData();
      this.setData({ isRefreshing: false });
      wx.stopPullDownRefresh();
    }, 800);
  },

  // ===================== 数据加载 =====================

  /**
   * 加载模拟数据（后端接口预留：替换此方法调用 apiConfig.listApi）
   * 后端接口示例：
   * wx.request({
   *   url: this.data.apiConfig.baseUrl + this.data.apiConfig.listApi,
   *   data: { page, pageSize, category, keyword },
   *   success: (res) => { ... }
   * })
   */
  _loadMockData() {
    const mockPosts = [
      {
        id: '001',
        userName: '社区小助手',
        avatarEmoji: '🤖',
        time: '10分钟前',
        category: 'notice',
        categoryName: '公告',
        title: '【公告】平江汇社区管理规范更新',
        content: '为维护良好的社区环境，现对社区发帖规范进行更新，请各位居民认真阅读遵守...',
        images: [],
        likeCount: 88,
        commentCount: 12,
        isLiked: false,
      },
      {
        id: '002',
        userName: '美食探店官',
        avatarEmoji: '👨‍🍳',
        time: '30分钟前',
        category: 'food',
        categoryName: '美食',
        title: '新开的烤肉店太香了！必须安利给大家',
        content: '平江路新开了一家烤肉店，食材新鲜、价格实惠，人均60元就能吃到撑...',
        images: [
          { color: '#FFD580', label: '🥩烤肉' },
          { color: '#FF8C69', label: '🔥炭火' },
        ],
        likeCount: 156,
        commentCount: 43,
        isLiked: false,
      },
      {
        id: '003',
        userName: '活动策划Lisa',
        avatarEmoji: '🎉',
        time: '1小时前',
        category: 'activity',
        categoryName: '活动',
        title: '周末亲子市集活动，欢迎报名！',
        content: '本周六上午9点至下午4点，平江广场举办亲子手工市集，免费入场，摊位需提前报名...',
        images: [
          { color: '#B5EAD7', label: '🎪市集' },
        ],
        likeCount: 74,
        commentCount: 28,
        isLiked: true,
      },
      {
        id: '004',
        userName: '生活达人Wang',
        avatarEmoji: '🏠',
        time: '2小时前',
        category: 'life',
        categoryName: '生活',
        title: '分享一个超实用的收纳技巧',
        content: '家里东西太多不知道怎么收？试试这个方法，客厅立马清爽，收藏备用...',
        images: [],
        likeCount: 203,
        commentCount: 67,
        isLiked: false,
      },
      {
        id: '005',
        userName: '急需帮助的张先生',
        avatarEmoji: '🙏',
        time: '3小时前',
        category: 'help',
        categoryName: '求助',
        title: '求问附近哪里有修自行车的店',
        content: '我的自行车链条断了，住在平江路附近，求问哪里有靠谱的修车摊...',
        images: [],
        likeCount: 15,
        commentCount: 22,
        isLiked: false,
      },
      {
        id: '006',
        userName: '吃货联盟盟主',
        avatarEmoji: '😋',
        time: '4小时前',
        category: 'food',
        categoryName: '美食',
        title: '隐藏在小巷里的宝藏早餐店',
        content: '每天早上6点就开门，豆腐脑、油条、锅贴，价格美丽，排队都值得...',
        images: [
          { color: '#FFDAC1', label: '🥘早餐' },
          { color: '#C7CEEA', label: '🫕豆腐脑' },
          { color: '#E2F0CB', label: '🥢油条' },
        ],
        likeCount: 312,
        commentCount: 88,
        isLiked: false,
      },
      {
        id: '007',
        userName: '社区志愿者小红',
        avatarEmoji: '❤️',
        time: '昨天',
        category: 'notice',
        categoryName: '公告',
        title: '本月垃圾分类积分兑换活动开始啦',
        content: '垃圾分类满100积分可兑换生活用品，兑换点在社区服务中心一楼...',
        images: [],
        likeCount: 45,
        commentCount: 9,
        isLiked: false,
      },
      {
        id: '008',
        userName: '新手妈妈小云',
        avatarEmoji: '👶',
        time: '昨天',
        category: 'help',
        categoryName: '求助',
        title: '附近有没有靠谱的月嫂推荐',
        content: '预产期还有两个月，想找一个有经验的月嫂，有推荐的吗？私信也可以...',
        images: [],
        likeCount: 31,
        commentCount: 44,
        isLiked: false,
      },
    ];

    this.setData({
      allPosts: mockPosts,
    }, () => {
      this._applyFilter();
    });
  },

  // ===================== 过滤逻辑 =====================

  /**
   * 统一过滤入口：分类 + 搜索关键词
   * 后端搜索预留：当 searchKeyword 非空时可改为调用 apiConfig.searchApi
   */
  _applyFilter() {
    const { allPosts, currentTab, tabs, searchKeyword } = this.data;
    const currentTabName = tabs[currentTab];

    // 分类映射
    const categoryMap = {
      '公告': 'notice',
      '美食': 'food',
      '活动': 'activity',
      '生活': 'life',
      '求助': 'help',
    };

    let result = allPosts;

    // 按分类过滤
    if (currentTabName !== '全部') {
      const targetCategory = categoryMap[currentTabName];
      result = result.filter(post => post.category === targetCategory);
    }

    // 按关键词过滤（前端模拟；后端接口预留）
    if (searchKeyword && searchKeyword.trim() !== '') {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(post =>
        (post.title && post.title.toLowerCase().includes(kw)) ||
        (post.content && post.content.toLowerCase().includes(kw)) ||
        (post.userName && post.userName.toLowerCase().includes(kw)) ||
        (post.categoryName && post.categoryName.toLowerCase().includes(kw))
      );
    }

    this.setData({ filteredPosts: result });
  },

  // ===================== 搜索 =====================

  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword }, () => {
      this._applyFilter();
    });
  },

  onSearchConfirm(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword }, () => {
      this._applyFilter();
      // 后端搜索预留接口调用位置：
      // this._fetchSearchFromServer(keyword);
    });
  },

  onSearchClear() {
    this.setData({ searchKeyword: '' }, () => {
      this._applyFilter();
    });
  },

  /**
   * 预留后端搜索接口
   * @param {string} keyword
   */
  _fetchSearchFromServer(keyword) {
    const { apiConfig } = this.data;
    wx.request({
      url: apiConfig.baseUrl + apiConfig.searchApi,
      method: 'GET',
      data: {
        keyword,
        page: 1,
        pageSize: this.data.pageSize,
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          this.setData({ filteredPosts: res.data.data.list || [] });
        }
      },
      fail: (err) => {
        console.error('搜索接口失败:', err);
      }
    });
  },

  // ===================== 分类 Tab =====================

  onTabChange(e) {
    const index = e.currentTarget.dataset.index;
    if (index === this.data.currentTab) return;
    this.setData({ currentTab: index }, () => {
      this._applyFilter();
    });
  },

  // ===================== 帖子操作 =====================

  /**
   * 点击帖子卡片主体 → 跳转评论详情页
   */
  onPostTap(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/community/comment/index?postId=${postId}`,
      fail: (err) => {
        console.error('跳转评论页失败:', err);
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  /**
   * 点击评论按钮 → 跳转评论详情页（同卡片主体）
   */
  onCommentTap(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/community/comment/index?postId=${postId}`,
      fail: (err) => {
        console.error('跳转评论页失败:', err);
        wx.showToast({ title: '页面跳转失败', icon: 'none' });
      }
    });
  },

  /**
   * 阻止底部操作栏点击冒泡到卡片
   */
  onFooterTap(e) {
    // 阻止冒泡，不做任何操作
  },

  /**
   * 点赞
   */
  onLikeTap(e) {
    const { id, index } = e.currentTarget.dataset;
    const posts = this.data.filteredPosts;
    const post = posts[index];
    if (!post) return;

    const newIsLiked = !post.isLiked;
    const newLikeCount = newIsLiked ? post.likeCount + 1 : post.likeCount - 1;

    this.setData({
      [`filteredPosts[${index}].isLiked`]: newIsLiked,
      [`filteredPosts[${index}].likeCount`]: newLikeCount,
    });

    // 同步更新 allPosts
    const allIndex = this.data.allPosts.findIndex(p => p.id === id);
    if (allIndex !== -1) {
      this.setData({
        [`allPosts[${allIndex}].isLiked`]: newIsLiked,
        [`allPosts[${allIndex}].likeCount`]: newLikeCount,
      });
    }

    // 后端点赞接口预留
    // wx.request({ url: this.data.apiConfig.baseUrl + this.data.apiConfig.likeApi, ... })
  },

  // ===================== 分享逻辑 =====================

  /**
   * 点击分享按钮 → 先做实名校验，再弹出分享菜单
   */
  onShareBtnTap(e) {
    const { id, index } = e.currentTarget.dataset;
    this.setData({
      currentSharePostId: id,
      currentSharePostIndex: index,
    });
    this._checkAuthBeforeAction('openShareMenu');
  },

  /**
   * 实名授权校验入口
   * @param {string} action - 授权通过后要执行的动作
   */
  _checkAuthBeforeAction(action) {
    if (this.data.isAuthed) {
      this._executeShareAction(action);
      return;
    }
    // 弹出实名授权弹窗
    this.setData({
      showAuthModal: true,
      pendingShareAction: action,
    });
  },

  /**
   * 用户点击"去认证"
   */
  onAuthConfirm() {
    this.setData({ showAuthModal: false });
    // 模拟实名认证流程（实际应跳转认证页或调用后端接口）
    wx.showLoading({ title: '认证中...' });
    setTimeout(() => {
      wx.hideLoading();
      // 模拟认证成功
      const authed = true;
      this.setData({ isAuthed: authed });
      wx.setStorageSync('isRealNameAuthed', authed);

      if (authed) {
        wx.showToast({ title: '实名认证成功', icon: 'success' });
        const pendingAction = this.data.pendingShareAction;
        if (pendingAction) {
          this.setData({ pendingShareAction: null });
          setTimeout(() => this._executeShareAction(pendingAction), 500);
        }
      } else {
        console.warn('实名授权未通过: 用户取消授权');
        wx.showToast({ title: '认证未完成', icon: 'none' });
      }
    }, 1200);
  },

  /**
   * 用户取消实名授权
   */
  onAuthCancel() {
    console.warn('实名授权未通过: 用户取消授权');
    this.setData({
      showAuthModal: false,
      pendingShareAction: null,
    });
    wx.showToast({ title: '分享需完成实名认证', icon: 'none' });
  },

  /**
   * 执行分享动作
   */
  _executeShareAction(action) {
    if (action === 'openShareMenu') {
      this.setData({ showShareMenu: true });
    }
  },

  /**
   * 关闭分享菜单
   */
  onCloseShare() {
    this.setData({
      showShareMenu: false,
      currentSharePostId: null,
      currentSharePostIndex: -1,
    });
  },

  /**
   * 分享给好友/群聊
   */
  onShareToFriend() {
    this.onCloseShare();
    const postId = this.data.currentSharePostId;
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage'],
    });
    wx.showToast({ title: '请点击右上角分享', icon: 'none', duration: 2000 });
    // 后端分享记录接口预留
    // wx.request({ url: this.data.apiConfig.baseUrl + this.data.apiConfig.shareApi, ... })
  },

  /**
   * 生成分享海报
   */
  onSharePoster() {
    this.onCloseShare();
    const postId = this.data.currentSharePostId;
    wx.showLoading({ title: '生成海报中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '海报生成功能开发中', icon: 'none' });
      // 实际实现：调用 canvas 绘制海报 → wx.canvasToTempFilePath → wx.saveImageToPhotosAlbum
    }, 800);
  },

  /**
   * 分享到朋友圈
   */
  onShareMoments() {
    this.onCloseShare();
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareTimeline'],
      success: () => {
        wx.showToast({ title: '请点击右上角分享', icon: 'none', duration: 2000 });
      },
      fail: () => {
        wx.showToast({ title: '请更新微信版本后重试', icon: 'none' });
      }
    });
  },

  // 微信分享卡片配置
  onShareAppMessage() {
    const postId = this.data.currentSharePostId;
    return {
      title: '平江汇生活 · 社区好帖分享',
      path: `/pages/community/comment/index?postId=${postId || ''}`,
      imageUrl: '', // 可替换为实际分享封面图 URL
    };
  },

  onShareTimeline() {
    return {
      title: '平江汇生活 · 发现社区好内容',
      query: `postId=${this.data.currentSharePostId || ''}`,
      imageUrl: '',
    };
  },

  // ===================== 发帖 =====================

  onPublish() {
    wx.navigateTo({
      url: '/pages/community/publish/index',
      fail: () => wx.showToast({ title: '发帖页面未找到', icon: 'none' })
    });
  },

  // ===================== 加载更多 =====================

  onScrollToLower() {
    if (!this.data.hasMore) return;
    // 预留：加载下一页数据
    console.log('加载更多，当前页:', this.data.page);
    this.setData({ hasMore: false });
  },
});
