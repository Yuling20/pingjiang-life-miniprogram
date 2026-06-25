// pages/services/convenience/familytree/community/index.js
// ============================================================
// 乡镇社区课堂
// 功能：
//   1. 分类浏览 + 排序切换
//   2. 今日推荐大卡片
//   3. 课程列表（分页加载）
//   4. 本地讲师专区
//   5. 社区问答
//   6. 直播预告 + 预约
//   7. 搜索（关键词 + 历史 + 热门）
// ============================================================

const KEY_COLLECT    = 'ftree_collected_courses';
const KEY_SEARCH_HIS = 'ftree_search_history';
const KEY_LEARNED    = 'ftree_learned_courses';
const KEY_SUBSCRIBED = 'ftree_subscribed_live';
const KEY_FOLLOWED   = 'ftree_followed_teachers';
const KEY_DYNAMICS   = 'ftree_dynamics';

// ============================================================
// 分类配置
// ============================================================
const CATEGORY_LIST = [
  { id: 'all',     emoji: '🌟', label: '全部',   color: '#2E7D32', count: 48 },
  { id: 'mental',  emoji: '🧠', label: '心理健康', color: '#7C4DFF', count: 12 },
  { id: 'parenting', emoji: '👶', label: '育儿',   color: '#E65100', count: 10 },
  { id: 'elder',   emoji: '👴', label: '养老',   color: '#1565C0', count: 8  },
  { id: 'agri',    emoji: '🌾', label: '农技',   color: '#33691E', count: 11 },
  { id: 'health',  emoji: '💊', label: '健康',   color: '#F44336', count: 7  }
];

// ============================================================
// 模拟课程数据库
// ============================================================
const ALL_COURSES = [
  {
    id: 'c001',
    catId: 'mental', catLabel: '心理健康', catColor: '#7C4DFF',
    emoji: '🧘', coverBg: 'linear-gradient(135deg, #4527A0, #7B1FA2)',
    title: '农村留守家庭心理关怀指南',
    desc:  '帮助家长理解留守儿童的心理需求，建立有效的亲子沟通方式。',
    tags:  ['留守', '亲子'],
    teacherAvatar: '👩‍🏫', teacherName: '李梅老师',
    teacherTitle:  '心理咨询师·10年经验',
    duration: '28:30', views: '1.2k', rating: '4.9',
    free: true, isLive: false,
    progress: 0, collected: false
  },
  {
    id: 'c002',
    catId: 'parenting', catLabel: '育儿', catColor: '#E65100',
    emoji: '👨‍👩‍👧', coverBg: 'linear-gradient(135deg, #E65100, #BF360C)',
    title: '孩子不听话怎么办？正面管教实用方法',
    desc:  '科学管教替代打骂，帮助孩子建立规则感与自信心。',
    tags:  ['正面管教', '行为'],
    teacherAvatar: '👨‍🏫', teacherName: '王刚老师',
    teacherTitle:  '家庭教育指导师',
    duration: '35:15', views: '2.3k', rating: '4.8',
    free: true, isLive: false,
    progress: 60, collected: false
  },
  {
    id: 'c003',
    catId: 'elder', catLabel: '养老', catColor: '#1565C0',
    emoji: '🏥', coverBg: 'linear-gradient(135deg, #1565C0, #0D47A1)',
    title: '老年人常见慢性病日常管理',
    desc:  '高血压、糖尿病、心脏病的家庭护理与注意事项。',
    tags:  ['慢病管理', '健康'],
    teacherAvatar: '👨‍⚕️', teacherName: '陈医生',
    teacherTitle:  '乡镇卫生院全科医生',
    duration: '42:00', views: '856', rating: '4.7',
    free: true, isLive: false,
    progress: 0, collected: false
  },
  {
    id: 'c004',
    catId: 'agri', catLabel: '农技', catColor: '#33691E',
    emoji: '🌽', coverBg: 'linear-gradient(135deg, #33691E, #1B5E20)',
    title: '玉米病虫害识别与防治技术',
    desc:  '常见病虫害图文识别，以及经济高效的防治方案。',
    tags:  ['病虫害', '种植'],
    teacherAvatar: '👨‍🌾', teacherName: '赵技术员',
    teacherTitle:  '农业技术推广站·农艺师',
    duration: '31:20', views: '1.8k', rating: '4.6',
    free: true, isLive: false,
    progress: 0, collected: false
  },
  {
    id: 'c005',
    catId: 'mental', catLabel: '心理健康', catColor: '#7C4DFF',
    emoji: '😊', coverBg: 'linear-gradient(135deg, #7C4DFF, #512DA8)',
    title: '妈妈的情绪与孩子的成长',
    desc:  '母亲的情绪状态对孩子影响深远，学会自我关爱才能更好地养育孩子。',
    tags:  ['母亲', '情绪管理'],
    teacherAvatar: '👩‍⚕️', teacherName: '刘心理师',
    teacherTitle:  '国家二级心理咨询师',
    duration: '24:45', views: '3.1k', rating: '5.0',
    free: true, isLive: false,
    progress: 30, collected: true
  },
  {
    id: 'c006',
    catId: 'health', catLabel: '健康', catColor: '#F44336',
    emoji: '🥗', coverBg: 'linear-gradient(135deg, #C62828, #E53935)',
    title: '农村饮食营养搭配指南',
    desc:  '用本地食材搭配健康饮食，预防营养缺乏与慢性病。',
    tags:  ['营养', '饮食'],
    teacherAvatar: '👩‍⚕️', teacherName: '营养师小张',
    teacherTitle:  '注册营养师',
    duration: '19:30', views: '945', rating: '4.5',
    free: true, isLive: false,
    progress: 0, collected: false
  },
  {
    id: 'c007',
    catId: 'parenting', catLabel: '育儿', catColor: '#E65100',
    emoji: '📚', coverBg: 'linear-gradient(135deg, #FF6F00, #E65100)',
    title: '陪孩子做作业，怎么不崩溃？',
    desc:  '从学习环境到情绪管理，让辅导作业不再是亲子大战。',
    tags:  ['学习', '亲子'],
    teacherAvatar: '👩‍🏫', teacherName: '吴老师',
    teacherTitle:  '小学班主任·12年经验',
    duration: '26:10', views: '4.2k', rating: '4.9',
    free: true, isLive: false,
    progress: 0, collected: false
  },
  {
    id: 'c008',
    catId: 'agri', catLabel: '农技', catColor: '#33691E',
    emoji: '🐄', coverBg: 'linear-gradient(135deg, #558B2F, #33691E)',
    title: '牛羊常见疾病识别与处理',
    desc:  '掌握基本兽医知识，减少因不及时处理造成的经济损失。',
    tags:  ['养殖', '兽医'],
    teacherAvatar: '👨‍🔬', teacherName: '老刘兽医',
    teacherTitle:  '执业兽医师·20年经验',
    duration: '38:50', views: '1.1k', rating: '4.7',
    free: true, isLive: false,
    progress: 0, collected: false
  }
];

// ============================================================
// 模拟讲师数据
// ============================================================
const TEACHER_LIST = [
  {
    id: 't001', avatar: '👩‍🏫',
    avatarBg: 'linear-gradient(135deg, #4527A0, #7B1FA2)',
    name: '李梅老师', title: '心理咨询师',
    specialty: '心理健康', courseCount: 8, students: '2.1k',
    followed: false
  },
  {
    id: 't002', avatar: '👨‍🌾',
    avatarBg: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
    name: '赵技术员', title: '农艺师',
    specialty: '农业技术', courseCount: 12, students: '3.6k',
    followed: true
  },
  {
    id: 't003', avatar: '👨‍⚕️',
    avatarBg: 'linear-gradient(135deg, #0D47A1, #1565C0)',
    name: '陈医生', title: '全科医生',
    specialty: '健康养老', courseCount: 6, students: '1.4k',
    followed: false
  },
  {
    id: 't004', avatar: '👩‍⚕️',
    avatarBg: 'linear-gradient(135deg, #AD1457, #E91E63)',
    name: '刘心理师', title: '心理咨询师',
    specialty: '亲子关系', courseCount: 10, students: '5.2k',
    followed: false
  }
];

// ============================================================
// 模拟问答数据
// ============================================================
const QA_LIST = [
  {
    id: 'q001', avatar: '👩', name: '山村小花', timeAgo: '2小时前',
    cat: '心理', catColor: '#7C4DFF',
    question: '孩子一见到我就哭，是我太久没回去了吗？该怎么重建关系？',
    bestAnswer: '孩子的哭泣是在表达对您的思念和不适应，建议先用温柔的肢体接触重建安全感，不要急于管教...',
    answerCount: 12, likes: 34
  },
  {
    id: 'q002', avatar: '👴', name: '老王头', timeAgo: '昨天',
    cat: '农技', catColor: '#33691E',
    question: '今年玉米叶子发黄，是缺什么肥料还是有病虫害？',
    bestAnswer: '玉米叶子发黄有多种原因：缺氮表现为下部叶片从叶尖开始发黄；大小斑病则出现不规则病斑...',
    answerCount: 8, likes: 21
  },
  {
    id: 'q003', avatar: '👩‍🍼', name: '新手妈妈', timeAgo: '3天前',
    cat: '育儿', catColor: '#E65100',
    question: '2岁的孩子开始打人咬人，这是正常的吗？怎么引导？',
    bestAnswer: '2岁孩子打人咬人是非常常见的行为，这是他们语言能力有限时表达情绪的方式...',
    answerCount: 25, likes: 67
  }
];

// ============================================================
// 模拟直播数据
// ============================================================
const LIVE_LIST = [
  {
    id: 'l001',
    emoji: '🧠', coverBg: 'linear-gradient(135deg, #4527A0, #7B1FA2)',
    title: '留守儿童心理健康：家长必看',
    teacherAvatar: '👩‍🏫', teacherName: '李梅老师',
    date: '07/20', time: '19:30',
    status: 'live',
    countdownText: '',
    subscribers: 312, subscribed: false
  },
  {
    id: 'l002',
    emoji: '🌽', coverBg: 'linear-gradient(135deg, #33691E, #1B5E20)',
    title: '夏季农业管理：防旱抗涝技术',
    teacherAvatar: '👨‍🌾', teacherName: '赵技术员',
    date: '07/22', time: '14:00',
    status: 'soon',
    countdownText: '2天后',
    subscribers: 186, subscribed: false
  },
  {
    id: 'l003',
    emoji: '💊', coverBg: 'linear-gradient(135deg, #0D47A1, #1565C0)',
    title: '老年高血压家庭管理讲座',
    teacherAvatar: '👨‍⚕️', teacherName: '陈医生',
    date: '07/25', time: '10:00',
    status: 'soon',
    countdownText: '5天后',
    subscribers: 98, subscribed: true
  }
];

// ============================================================
// Banner 数据
// ============================================================
const BANNER_LIST = [
  {
    id: 'b001',
    bg:    'linear-gradient(135deg, #2E7D32, #66BB6A)',
    emoji: '🌱',
    tag:   '本地讲师',
    title: '留守儿童心理关怀',
    sub:   '李梅老师主讲 · 28分钟',
    courseId: 'c001'
  },
  {
    id: 'b002',
    bg:    'linear-gradient(135deg, #E65100, #FFA726)',
    emoji: '👨‍👩‍👧',
    tag:   '育儿热门',
    title: '孩子不听话怎么办',
    sub:   '王刚老师主讲 · 35分钟',
    courseId: 'c002'
  },
  {
    id: 'b003',
    bg:    'linear-gradient(135deg, #1565C0, #42A5F5)',
    emoji: '🌾',
    tag:   '农技必看',
    title: '玉米病虫害防治',
    sub:   '赵技术员主讲 · 31分钟',
    courseId: 'c004'
  }
];

// ============================================================
// Page
// ============================================================
Page({

  data: {
    // 地区
    cityName: '贵州省·某乡镇',

    // 统计
    totalCourses:   48,
    totalStudents:  '1.2w',
    myLearnedCount: 0,

    // Banner
    bannerList: BANNER_LIST,

    // 分类
    categoryList:        CATEGORY_LIST,
    activeCategory:      'all',
    activeCategoryLabel: '全部',

    // 今日推荐
    todayRecommend: null,

    // 课程列表
    courseList: [],
    page:       1,
    pageSize:   5,
    hasMore:    true,
    loading:    false,

    // 排序
    sortType: 'hot',

    // 讲师
    teacherList: [],

    // 问答
    qaList: [],

    // 直播
    liveList: [],

    // 搜索
    showSearch:     false,
    searchKeyword:  '',
    searchResults:  [],
    searchHistory:  [],
    searchDone:     false,
    hotKeywords: [
      '留守儿童', '心理健康', '育儿', '高血压管理',
      '玉米种植', '焦虑', '亲子沟通', '养殖'
    ]
  },

  // ─── 生命周期 ───────────────────────────────
  onLoad() {
    this._initData();
  },

  onShow() {
    this._syncCollectStatus();
  },

  // ─── 初始化 ──────────────────────────────────
  _initData() {
    // 读取收藏、学习历史
    const collected = wx.getStorageSync(KEY_COLLECT)   || [];
    const learned   = wx.getStorageSync(KEY_LEARNED)   || [];
    const subscribed = wx.getStorageSync(KEY_SUBSCRIBED) || [];
    const followed   = wx.getStorageSync(KEY_FOLLOWED)  || [];
    const searchHis  = wx.getStorageSync(KEY_SEARCH_HIS)|| [];

    // 更新课程收藏状态
    const allCoursesWithStatus = ALL_COURSES.map(c => ({
      ...c,
      collected: collected.includes(c.id),
      progress:  learned.find(l => l.id === c.id)?.progress || c.progress
    }));

    // 更新讲师关注状态
    const teacherListUpdated = TEACHER_LIST.map(t => ({
      ...t,
      followed: followed.includes(t.id)
    }));

    // 更新直播预约状态
    const liveListUpdated = LIVE_LIST.map(l => ({
      ...l,
      subscribed: subscribed.includes(l.id)
    }));

    // 今日推荐（取第一个）
    const todayRecommend = { ...allCoursesWithStatus[0] };

    // 初始课程列表
    const courseList = this._filterAndSort(allCoursesWithStatus, 'all', 'hot').slice(0, 5);
    const hasMore    = ALL_COURSES.length > 5;

    this.setData({
      todayRecommend,
      courseList,
      hasMore,
      teacherList: teacherListUpdated,
      qaList:      QA_LIST,
      liveList:    liveListUpdated,
      searchHistory: searchHis,
      myLearnedCount: learned.length,
      // 保存供后续用
      _allCourses: allCoursesWithStatus
    });
  },

  // ─── 同步收藏状态 ────────────────────────────
  _syncCollectStatus() {
    const collected = wx.getStorageSync(KEY_COLLECT) || [];
    const courseList = (this.data.courseList || []).map(c => ({
      ...c,
      collected: collected.includes(c.id)
    }));
    this.setData({ courseList });
  },

  // ─── 过滤+排序 ──────────────────────────────
  _filterAndSort(courses, catId, sortType) {
    let list = catId === 'all'
      ? [...courses]
      : courses.filter(c => c.catId === catId);

    if (sortType === 'hot') {
      list.sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
    } else {
      list.sort((a, b) => b.id.localeCompare(a.id));
    }
    return list;
  },

  // ─── Banner 点击 ─────────────────────────────
  onBannerTap(e) {
    const { banner } = e.currentTarget.dataset;
    const course = ALL_COURSES.find(c => c.id === banner.courseId);
    if (course) this._navToCourse(course);
  },

  // ─── 分类切换 ────────────────────────────────
  onSelectCategory(e) {
    const { id } = e.currentTarget.dataset;
    const cat = CATEGORY_LIST.find(c => c.id === id);
    const collected = wx.getStorageSync(KEY_COLLECT) || [];

    const allCoursesWithStatus = ALL_COURSES.map(c => ({
      ...c,
      collected: collected.includes(c.id)
    }));

    const filtered  = this._filterAndSort(allCoursesWithStatus, id, this.data.sortType);
    const courseList = filtered.slice(0, 5);

    this.setData({
      activeCategory:      id,
      activeCategoryLabel: cat?.label || '全部',
      courseList,
      page:    1,
      hasMore: filtered.length > 5,
      _allCourses: allCoursesWithStatus,
      _filteredAll: filtered
    });
  },

  // ─── 排序切换 ────────────────────────────────
  onSort(e) {
    const { type } = e.currentTarget.dataset;
    const { activeCategory } = this.data;
    const collected = wx.getStorageSync(KEY_COLLECT) || [];

    const allCoursesWithStatus = ALL_COURSES.map(c => ({
      ...c,
      collected: collected.includes(c.id)
    }));

    const filtered   = this._filterAndSort(allCoursesWithStatus, activeCategory, type);
    const courseList = filtered.slice(0, 5);

    this.setData({
      sortType:     type,
      courseList,
      page:    1,
      hasMore: filtered.length > 5,
      _filteredAll: filtered
    });
  },

  // ─── 加载更多 ────────────────────────────────
  onLoadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });

    const { page, pageSize, activeCategory, sortType } = this.data;
    const collected = wx.getStorageSync(KEY_COLLECT) || [];

    const allCoursesWithStatus = ALL_COURSES.map(c => ({
      ...c,
      collected: collected.includes(c.id)
    }));

    const filtered = this._filterAndSort(allCoursesWithStatus, activeCategory, sortType);
    const nextPage = page + 1;
    const newItems = filtered.slice(0, nextPage * pageSize);

    setTimeout(() => {
      this.setData({
        courseList: newItems,
        page:       nextPage,
        hasMore:    newItems.length < filtered.length,
        loading:    false
      });
    }, 800);
  },

  // ─── 查看更多推荐 ────────────────────────────
  onViewMoreRecommend() {
    this.setData({ activeCategory: 'all' });
    this.onSelectCategory({ currentTarget: { dataset: { id: 'all' } } });
  },

  // ─── 去课程 ──────────────────────────────────
  onGoCourse(e) {
    const { course } = e.currentTarget.dataset;
    this._navToCourse(course);
  },

  _navToCourse(course) {
    // 记录到学习历史
    const learned = wx.getStorageSync(KEY_LEARNED) || [];
    const exists  = learned.find(l => l.id === course.id);
    if (!exists) {
      learned.unshift({ id: course.id, progress: 0, date: Date.now() });
      wx.setStorageSync(KEY_LEARNED, learned.slice(0, 50));
    }

    // 发布到家庭树动态
    this._publishDynamic({
      type:      'course',
      typeLabel: '开始学习',
      content:   `正在学习课程：《${course.title}》`
    });

    wx.showToast({ title: `📖 ${course.title}`, icon: 'none', duration: 2000 });
    // wx.navigateTo({ url: `../course/index?courseId=${course.id}` });
  },

  // ─── 收藏 ────────────────────────────────────
  onToggleCollect(e) {
    const { id } = e.currentTarget.dataset;
    const collected = wx.getStorageSync(KEY_COLLECT) || [];

    let newCollected;
    let action;
    if (collected.includes(id)) {
      newCollected = collected.filter(c => c !== id);
      action = 'remove';
    } else {
      newCollected = [id, ...collected];
      action = 'add';
    }
    wx.setStorageSync(KEY_COLLECT, newCollected);

    const courseList = this.data.courseList.map(c => ({
      ...c,
      collected: newCollected.includes(c.id)
    }));
    this.setData({ courseList });

    wx.showToast({
      title: action === 'add' ? '❤️ 已收藏' : '🤍 已取消',
      icon:  'none', duration: 1500
    });
  },

  // ─── 讲师 ────────────────────────────────────
  onGoTeacher(e) {
    wx.showToast({ title: '讲师主页开发中', icon: 'none' });
  },

  onViewAllTeachers() {
    wx.showToast({ title: '讲师列表开发中', icon: 'none' });
  },

  onFollowTeacher(e) {
    const { id } = e.currentTarget.dataset;
    const followed = wx.getStorageSync(KEY_FOLLOWED) || [];

    let newFollowed;
    if (followed.includes(id)) {
      newFollowed = followed.filter(t => t !== id);
    } else {
      newFollowed = [id, ...followed];
    }
    wx.setStorageSync(KEY_FOLLOWED, newFollowed);

    const teacherList = this.data.teacherList.map(t => ({
      ...t,
      followed: newFollowed.includes(t.id)
    }));
    this.setData({ teacherList });
  },

  // ─── 问答 ────────────────────────────────────
  onGoQA(e) {
    wx.showToast({ title: '问答详情开发中', icon: 'none' });
  },

  onAskQuestion() {
    wx.showModal({
      title:      '✏️ 我要提问',
      content:    '提问功能即将开放，届时您可以向本地讲师和社区专家直接发问。',
      showCancel: false,
      confirmText:'知道了'
    });
  },

  // ─── 直播 ────────────────────────────────────
  onGoLive(e) {
    const { live } = e.currentTarget.dataset;
    if (live.status === 'live') {
      wx.navigateTo({ url: `../live/index?liveId=${live.id}` });
    } else {
      wx.showToast({ title: `📅 ${live.date} ${live.time} 开播`, icon: 'none' });
    }
  },

  onToggleLiveSubscribe(e) {
    const { id, status } = e.currentTarget.dataset;

    // 直播中直接进入
    if (status === 'live') {
      wx.navigateTo({ url: `../live/index?liveId=${id}` });
      return;
    }

    const subscribed = wx.getStorageSync(KEY_SUBSCRIBED) || [];
    let newSubscribed;
    let action;
    if (subscribed.includes(id)) {
      newSubscribed = subscribed.filter(l => l !== id);
      action = 'remove';
    } else {
      newSubscribed = [id, ...subscribed];
      action = 'add';
    }
    wx.setStorageSync(KEY_SUBSCRIBED, newSubscribed);

    const liveList = this.data.liveList.map(l => ({
      ...l,
      subscribed: newSubscribed.includes(l.id),
      subscribers: l.id === id
        ? (action === 'add' ? l.subscribers + 1 : l.subscribers - 1)
        : l.subscribers
    }));
    this.setData({ liveList });

    wx.showToast({
      title: action === 'add' ? '📅 预约成功' : '已取消预约',
      icon:  'none', duration: 1500
    });
  },

  onViewAllLive() {
    wx.navigateTo({ url: '../live/index' });
  },

  // ─── 搜索 ────────────────────────────────────
  onOpenSearch() {
    this.setData({ showSearch: true });
  },

  onVoiceSearch() {
    wx.showToast({ title: '语音搜索开发中', icon: 'none' });
  },

  onCloseSearch() {
    this.setData({
      showSearch:    false,
      searchKeyword: '',
      searchResults: [],
      searchDone:    false
    });
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim();
    this.setData({ searchKeyword: keyword, searchDone: false });

    if (!keyword) {
      this.setData({ searchResults: [] });
      return;
    }

    // 实时搜索
    const results = ALL_COURSES.filter(c =>
      c.title.includes(keyword) ||
      c.catLabel.includes(keyword) ||
      c.teacherName.includes(keyword)
    );
    this.setData({ searchResults: results, searchDone: true });
  },

  onDoSearch(e) {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) return;

    // 保存到搜索历史
    const history = [keyword, ...this.data.searchHistory.filter(h => h !== keyword)].slice(0, 10);
    wx.setStorageSync(KEY_SEARCH_HIS, history);

    const results = ALL_COURSES.filter(c =>
      c.title.includes(keyword) ||
      c.catLabel.includes(keyword) ||
      c.teacherName.includes(keyword)
    );
    this.setData({ searchResults: results, searchHistory: history, searchDone: true });
  },

  onClearSearch() {
    this.setData({ searchKeyword: '', searchResults: [], searchDone: false });
  },

  onClearHistory() {
    wx.setStorageSync(KEY_SEARCH_HIS, []);
    this.setData({ searchHistory: [] });
  },

  onUseHistory(e) {
    const { keyword } = e.currentTarget.dataset;
    this.setData({ searchKeyword: keyword });
    const results = ALL_COURSES.filter(c =>
      c.title.includes(keyword) ||
      c.catLabel.includes(keyword)
    );
    this.setData({ searchResults: results, searchDone: true });
  },

  // ─── 历史记录页 ──────────────────────────────
  onGoHistory() {
    wx.showToast({ title: '学习记录开发中', icon: 'none' });
  },

  // ─── 发布家庭树动态 ──────────────────────────
  _publishDynamic(payload) {
    const KEY_ROLE = 'ftree_user_role';
    const savedRole = wx.getStorageSync(KEY_ROLE) || {};
    const myUid     = wx.getStorageSync('ftree_my_uid') || '';

    const dynamic = {
      id:          `comm_${Date.now()}`,
      memberUid:   myUid,
      memberName:  savedRole.label || '家庭成员',
      memberIcon:  savedRole.icon  || '📚',
      timestamp:   Date.now(),
      timeAgo:     '刚刚',
      likes:       0,
      read:        false,
      ...payload
    };

    const dynamics = [dynamic, ...(wx.getStorageSync(KEY_DYNAMICS) || [])].slice(0, 50);
    wx.setStorageSync(KEY_DYNAMICS, dynamics);
  }
});
