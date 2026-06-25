// pages/services/convenience/familytree/mental/index.js
// ============================================================
// 心理健康中心
// 功能：
//   1. 今日心情打卡（同步到家庭树动态）
//   2. 心理测试入口（跳转测试页）
//   3. 直播入口（当前直播 / 预约提醒）
//   4. 心理课程视频列表（分 Tab 筛选）
//   5. 心理援助热线
// ============================================================

// ── 缓存 Key 定义（与家庭树主页共用部分 Key）──
const KEY_ROLE        = 'ftree_user_role';
const KEY_MOOD_TODAY  = 'ftree_mood_today';   // { uid: { emoji, label, date } }
const KEY_MOOD_STREAK = 'ftree_mood_streak';  // { uid: { count, lastDate } }
const KEY_DYNAMICS    = 'ftree_dynamics';     // 家庭动态（共用）
const KEY_FAMILY      = 'ftree_family';       // 家庭成员（共用）
const KEY_LIVE_SUB    = 'ftree_live_sub';     // 直播预约记录

const DEBUG = false;
const log   = (...args) => DEBUG && console.log('[Mental]', ...args);

Page({

  // ==========================================================
  // 页面数据
  // ==========================================================
  data: {
    pageReady:    false,
    userLabel:    '',
    uiMode:       'standard',  // 'elder' | 'standard' | 'child'
    myUid:        '',

    // ── ① 心情打卡 ──
    greetText:    '',
    todayStr:     '',
    todayMood:    null,        // null = 未打卡，{ emoji, label }
    moodStreak:   0,
    moodOptions: [
      { emoji: '😄', label: '开心',  value: 'happy'  },
      { emoji: '🙂', label: '平静',  value: 'calm'   },
      { emoji: '😐', label: '一般',  value: 'normal' },
      { emoji: '😔', label: '低落',  value: 'sad'    },
      { emoji: '😢', label: '难过',  value: 'cry'    }
    ],

    // ── ② 心理测试 ──
    showLeftBehindBanner: false,

    // 留守儿童专项测试对象
    leftBehindTest: {
      id:       'left-behind',
      title:    '留守儿童专项心理评估',
      emoji:    '🌟',
      scaleName:'适龄专项量表',
      minutes:  5,
      free:     true,
      modes:    ['standard', 'child']
    },

    testList: [
      {
        id:        'sas',
        title:     '焦虑状态自评',
        emoji:     '😟',
        scaleName: 'SAS 标准量表',
        minutes:   5,
        doneCount: '2.3k',
        free:      true,
        isNew:     false,
        modes:     ['standard', 'child']
      },
      {
        id:        'phq9',
        title:     '抑郁倾向筛查',
        emoji:     '😔',
        scaleName: 'PHQ-9 标准量表',
        minutes:   8,
        doneCount: '1.8k',
        free:      true,
        isNew:     false,
        modes:     ['standard']
      },
      {
        id:        'family',
        title:     '家庭关系健康度',
        emoji:     '🤝',
        scaleName: '家庭功能量表',
        minutes:   6,
        doneCount: '986',
        free:      true,
        isNew:     true,
        modes:     ['standard', 'child']
      },
      {
        id:        'child-emotion',
        title:     '儿童情绪自查',
        emoji:     '👶',
        scaleName: '适龄情绪量表',
        minutes:   3,
        doneCount: '1.2k',
        free:      true,
        isNew:     false,
        modes:     ['standard', 'child']
      },
      {
        id:        'elder-lonely',
        title:     '老年孤独感评估',
        emoji:     '👴',
        scaleName: 'UCLA 孤独量表',
        minutes:   6,
        doneCount: '652',
        free:      true,
        isNew:     false,
        modes:     ['standard']
      },
      {
        id:        'stress',
        title:     '压力感知评估',
        emoji:     '💭',
        scaleName: 'PSS 压力量表',
        minutes:   4,
        doneCount: '1.5k',
        free:      true,
        isNew:     false,
        modes:     ['standard']
      }
    ],

    // ── ③ 直播 ──
    liveOnAir:     null,       // 当前直播对象，null 表示无直播
    upcomingLives: [],         // 即将开播列表

    // ── ④ 课程 ──
    activeCourseTab: 'all',
    courseTabs: [
      { label: '全部',     value: 'all'      },
      { label: '留守儿童', value: 'children' },
      { label: '老年关爱', value: 'elder'    },
      { label: '亲子沟通', value: 'parent'   },
      { label: '情绪管理', value: 'emotion'  },
      { label: '婚姻家庭', value: 'family'   }
    ],
    allCourses:      [],
    filteredCourses: [],

    // ── ⑤ 热线 ──
    hotlines: [
      {
        name:  '全国心理援助热线',
        phone: '400-161-9995',
        icon:  '🏥'
      },
      {
        name:  '北京心理危机研究与干预中心',
        phone: '010-82951332',
        icon:  '🧠'
      },
      {
        name:  '儿童心理援助热线（公益）',
        phone: '400-050-5152',
        icon:  '👶'
      },
      {
        name:  '生命热线（24小时）',
        phone: '400-821-1215',
        icon:  '💚'
      }
    ]
  },

  // ==========================================================
  // 生命周期
  // ==========================================================
  onLoad() {
    const myUid     = wx.getStorageSync('ftree_my_uid') || '';
    const savedRole = wx.getStorageSync(KEY_ROLE) || {};
    const uiMode    = savedRole.uiMode || 'standard';
    const userLabel = savedRole.label  || '朋友';

    this.setData({
      myUid,
      uiMode,
      userLabel,
      todayStr:    this._getTodayStr(),
      greetText:   this._getGreet(),
      showLeftBehindBanner: uiMode !== 'elder'
    });

    // 初始化所有课程数据
    const allCourses = this._buildCourseData();
    this.setData({ allCourses });

    // 加载各模块数据
    this._loadMoodData(myUid);
    this._loadLiveData();
    this._filterCourses('all');

    this.setData({ pageReady: true });
  },

  onShow() {
    // 每次显示时刷新心情和直播状态
    const myUid = this.data.myUid;
    if (myUid) this._loadMoodData(myUid);
    this._loadLiveData();
  },

  // ==========================================================
  // ① 心情打卡
  // ==========================================================

  /** 加载今日心情 & 连续打卡天数 */
  _loadMoodData(myUid) {
    const today     = this._getTodayStr();
    const moodStore = wx.getStorageSync(KEY_MOOD_TODAY)  || {};
    const streakStore = wx.getStorageSync(KEY_MOOD_STREAK) || {};

    const myMoodRecord  = moodStore[myUid];
    const myStreak      = streakStore[myUid] || { count: 0, lastDate: '' };

    // 今日已打卡
    if (myMoodRecord && myMoodRecord.date === today) {
      this.setData({
        todayMood:   { emoji: myMoodRecord.emoji, label: myMoodRecord.label },
        moodStreak:  myStreak.count
      });
    } else {
      this.setData({ todayMood: null, moodStreak: myStreak.count });
    }
  },

  /** 点击心情选项打卡 */
  onPickMood(e) {
    const item    = e.currentTarget.dataset.item;
    const today   = this._getTodayStr();
    const { myUid, userLabel } = this.data;

    // 写入今日心情缓存
    const moodStore       = wx.getStorageSync(KEY_MOOD_TODAY) || {};
    moodStore[myUid]      = { emoji: item.emoji, label: item.label, date: today };
    wx.setStorageSync(KEY_MOOD_TODAY, moodStore);

    // 更新连续打卡天数
    const streakStore  = wx.getStorageSync(KEY_MOOD_STREAK) || {};
    const yesterday    = this._getYesterdayStr();
    const myStreak     = streakStore[myUid] || { count: 0, lastDate: '' };
    const newCount     = myStreak.lastDate === yesterday
      ? myStreak.count + 1
      : (myStreak.lastDate === today ? myStreak.count : 1);

    streakStore[myUid] = { count: newCount, lastDate: today };
    wx.setStorageSync(KEY_MOOD_STREAK, streakStore);

    // 同步到家庭树动态
    this._syncMoodToDynamics(item, myUid, userLabel);

    // 更新家庭成员的心情徽章
    this._updateMemberMood(myUid, item.emoji);

    this.setData({
      todayMood:  { emoji: item.emoji, label: item.label },
      moodStreak: newCount
    });

    wx.vibrateShort({ type: 'light' });
    wx.showToast({
      title:    `心情已记录 ${item.emoji}`,
      icon:     'none',
      duration: 2000
    });

    log('心情打卡：', item.label);
  },

  /** 修改今日心情 */
  onChangeMood() {
    this.setData({ todayMood: null });
  },

  /** 同步心情到家庭树动态流 */
  _syncMoodToDynamics(moodItem, myUid, myLabel) {
    const savedRole = wx.getStorageSync(KEY_ROLE) || {};
    const myIcon    = savedRole.icon || '😊';

    const dynamic = {
      id:          `mood_${Date.now()}`,
      memberUid:   myUid,
      memberName:  myLabel,
      memberIcon:  myIcon,
      type:        'mood',
      typeLabel:   '心情',
      content:     `今天心情：${moodItem.emoji} ${moodItem.label}`,
      timestamp:   Date.now(),
      timeAgo:     '刚刚',
      likes:       0,
      read:        false
    };

    const dynamics = [dynamic, ...(wx.getStorageSync(KEY_DYNAMICS) || [])].slice(0, 50);
    wx.setStorageSync(KEY_DYNAMICS, dynamics);
  },

  /** 更新家庭成员的心情徽章字段 */
  _updateMemberMood(myUid, moodEmoji) {
    const family  = wx.getStorageSync(KEY_FAMILY) || { members: [] };
    const members = (family.members || []).map(m =>
      m.uid === myUid ? { ...m, mood: moodEmoji } : m
    );
    family.members = members;
    wx.setStorageSync(KEY_FAMILY, family);
  },

  // ==========================================================
  // ② 心理测试
  // ==========================================================

  /** 点击测试卡片 → 跳转测试页 */
  onStartTest(e) {
    const test = e.currentTarget.dataset.test;
    if (!test) return;

    wx.navigateTo({
      url: `../mentaltest/index?testId=${test.id}&title=${encodeURIComponent(test.title)}`
    });
  },

  // ==========================================================
  // ③ 直播
  // ==========================================================

  /** 加载直播数据（本地模拟，后期接云开发/腾讯云直播） */
  _loadLiveData() {
    const liveSubStore = wx.getStorageSync(KEY_LIVE_SUB) || {};

    // ── 模拟：当前是否有直播（实际接入 API 后替换）──
    // 生产环境改为：wx.request({ url: 'your-api/live/current', ... })
    const liveOnAir = null;   // null 表示当前无直播
    /*
    // 示例：有直播时的数据结构
    const liveOnAir = {
      id:       'live_001',
      title:    '《留守儿童的情感需求与家庭支持》',
      teacher:  '张心理师',
      viewers:  128,
      location: '四川省 XX镇',
      liveUrl:  'https://your-live-url'
    };
    */

    // ── 模拟：即将开播列表 ──
    const upcomingLives = [
      {
        id:          'live_002',
        title:       '如何关爱留守儿童的心理健康',
        teacher:     '李老师 · 国家二级心理咨询师',
        date:        '07/20',
        time:        '14:00',
        hasOnline:   true,
        hasOffline:  true,
        subscribed:  !!liveSubStore['live_002']
      },
      {
        id:          'live_003',
        title:       '老年人孤独感的识别与干预',
        teacher:     '王教授 · 老年心理学专家',
        date:        '07/25',
        time:        '19:30',
        hasOnline:   true,
        hasOffline:  false,
        subscribed:  !!liveSubStore['live_003']
      },
      {
        id:          'live_004',
        title:       '亲子沟通：如何走进孩子的内心',
        teacher:     '陈老师 · 家庭治疗师',
        date:        '07/28',
        time:        '20:00',
        hasOnline:   true,
        hasOffline:  false,
        subscribed:  !!liveSubStore['live_004']
      }
    ];

    this.setData({ liveOnAir, upcomingLives });
    log('直播数据加载完成');
  },

  /** 进入直播间 */
  onEnterLive(e) {
    const live = e.currentTarget.dataset.live;
    if (!live) return;

    wx.navigateTo({
      url: `../live/index?liveId=${live.id}&title=${encodeURIComponent(live.title)}`
    });
  },

  /** 预约直播提醒 */
  onSubscribeLive(e) {
    const live = e.currentTarget.dataset.live;
    if (!live) return;

    const liveSubStore   = wx.getStorageSync(KEY_LIVE_SUB) || {};
    const alreadySub     = liveSubStore[live.id];

    if (alreadySub) {
      // 取消预约
      delete liveSubStore[live.id];
      wx.setStorageSync(KEY_LIVE_SUB, liveSubStore);
      const upd = this.data.upcomingLives.map(l =>
        l.id === live.id ? { ...l, subscribed: false } : l
      );
      this.setData({ upcomingLives: upd });
      wx.showToast({ title: '已取消预约', icon: 'none' });
    } else {
      // 预约
      liveSubStore[live.id] = { liveId: live.id, subTime: Date.now() };
      wx.setStorageSync(KEY_LIVE_SUB, liveSubStore);
      const upd = this.data.upcomingLives.map(l =>
        l.id === live.id ? { ...l, subscribed: true } : l
      );
      this.setData({ upcomingLives: upd });
      wx.showToast({ title: '✅ 已预约，开播前提醒您', icon: 'none', duration: 2000 });

      // TODO: 接入微信订阅消息，开播前推送通知
      log('预约直播：', live.id);
    }
  },

  // ==========================================================
  // ④ 心理课程
  // ==========================================================

  /** 切换课程 Tab */
  onSwitchCourseTab(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({ activeCourseTab: value });
    this._filterCourses(value);
  },

  /** 根据 Tab 筛选课程 */
  _filterCourses(tab) {
    const { allCourses } = this.data;
    const filtered = tab === 'all'
      ? allCourses
      : allCourses.filter(c => c.category === tab);
    this.setData({ filteredCourses: filtered });
  },

  /** 构建课程数据（本地模拟） */
  _buildCourseData() {
    const makeStars = (score) => {
      const full  = Math.floor(score);
      const half  = score % 1 >= 0.5 ? 1 : 0;
      const empty = 5 - full - half;
      return [
        ...Array(full).fill('⭐'),
        ...Array(half).fill('✨'),
        ...Array(empty).fill('☆')
      ];
    };

    const courses = [
      {
        id:         'c001',
        title:      '如何与留守儿童建立情感连接',
        desc:       '从心理学角度理解孩子的孤独感与依恋需求',
        coverEmoji: '🧒',
        duration:   '23:15',
        score:      4.9,
        plays:      '1.2k',
        free:       true,
        category:   'children'
      },
      {
        id:         'c002',
        title:      '孩子不说话怎么办',
        desc:       '留守儿童沉默背后的心理机制与应对方法',
        coverEmoji: '🤫',
        duration:   '31:40',
        score:      4.8,
        plays:      '986',
        free:       true,
        category:   'children'
      },
      {
        id:         'c003',
        title:      '老年人孤独感的识别与疏导',
        desc:       '帮助家人理解老年期的心理变化',
        coverEmoji: '👴',
        duration:   '18:30',
        score:      4.7,
        plays:      '652',
        free:       true,
        category:   'elder'
      },
      {
        id:         'c004',
        title:      '如何与老人有效沟通',
        desc:       '跨越代际的沟通技巧与情感表达',
        coverEmoji: '💬',
        duration:   '25:10',
        score:      4.8,
        plays:      '803',
        free:       true,
        category:   'parent'
      },
      {
        id:         'c005',
        title:      '情绪管理：给自己的心理减负',
        desc:       '实用的情绪调节技术，适合农村务工家长',
        coverEmoji: '🌈',
        duration:   '19:55',
        score:      4.9,
        plays:      '2.1k',
        free:       true,
        category:   'emotion'
      },
      {
        id:         'c006',
        title:      '分离焦虑：父母离家时孩子的心理',
        desc:       '帮助孩子健康度过父母外出务工的阶段',
        coverEmoji: '🚂',
        duration:   '28:20',
        score:      5.0,
        plays:      '1.5k',
        free:       true,
        category:   'children'
      }
    ];

    return courses.map(c => ({ ...c, starsArr: makeStars(c.score) }));
  },

  /** 播放课程 */
  onPlayCourse(e) {
    const course = e.currentTarget.dataset.course;
    wx.navigateTo({
      url: `../course/index?courseId=${course.id}&title=${encodeURIComponent(course.title)}`
    });
  },

  /** 查看全部课程 */
  onViewAllCourses() {
    wx.navigateTo({ url: '../course/list' });
  },

  // ==========================================================
  // ⑤ 心理援助热线
  // ==========================================================
  onCallHotline(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.showModal({
      title:       '拨打心理援助热线',
      content:     `确认拨打：${phone}\n\n专业老师24小时为您提供心理援助`,
      confirmText: '拨打',
      cancelText:  '取消',
      success: (res) => {
        if (res.confirm) {
          wx.makePhoneCall({
            phoneNumber: phone,
            fail: () => {
              wx.showToast({ title: '请手动拨打：' + phone, icon: 'none' });
            }
          });
        }
      }
    });
  },

  // ==========================================================
  // 历史记录
  // ==========================================================
  onViewHistory() {
    wx.navigateTo({ url: '../mentalhistory/index' });
  },

  // ==========================================================
  // 底部导航
  // ==========================================================
  onNavTree()      { wx.navigateTo({ url: '../index'          }); },
  onNavMental()    { /* 当前页 */                                   },
  onNavElder()     { wx.navigateTo({ url: '../elder/elder'    }); },
  onNavCommunity() { wx.navigateTo({ url: '../community/index'}); },

  onNavBack() { wx.navigateBack(); },

  // ==========================================================
  // 工具方法
  // ==========================================================

  /** 今日日期字符串 YYYY-MM-DD */
  _getTodayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  /** 昨日日期字符串 */
  _getYesterdayStr() {
    const d = new Date(Date.now() - 86400000);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  },

  /** 问候语（按时段） */
  _getGreet() {
    const h = new Date().getHours();
    if (h < 6)   return '深夜好';
    if (h < 12)  return '早上好';
    if (h < 14)  return '中午好';
    if (h < 18)  return '下午好';
    if (h < 22)  return '晚上好';
    return '夜深了';
  }

});
