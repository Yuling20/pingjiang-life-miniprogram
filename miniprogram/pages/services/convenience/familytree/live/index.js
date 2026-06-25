// pages/services/convenience/familytree/live/index.js
// ============================================================
// 直播间
// 核心功能：
//   1. live-player 播放（真实直播流）
//   2. 倒计时（未开播状态）
//   3. 弹幕系统（发送 + 模拟接收）
//   4. 点赞动效（飞心）
//   5. 举手提问 + 讲师回答
//   6. 课程大纲 + 相关推荐
//   7. 分享到家庭树
//   8. 网络质量检测
// ============================================================

const KEY_DYNAMICS   = 'ftree_dynamics';
const KEY_ROLE       = 'ftree_user_role';
const KEY_SUBSCRIBED = 'ftree_subscribed_live';
const KEY_COLLECTED  = 'ftree_collected_courses';
const KEY_FOLLOWED   = 'ftree_followed_teachers';

// ============================================================
// 模拟直播数据
// ============================================================
const LIVE_DATA = {
  'l001': {
    id:            'l001',
    title:         '留守儿童心理健康：家长必看',
    teacherAvatar: '👩‍🏫',
    teacherName:   '李梅老师',
    teacherTitle:  '国家二级心理咨询师',
    date:          '07/20',
    time:          '19:30',
    tags:          ['心理健康', '留守儿童', '免费'],
    status:        'live',
    liveUrl:       '', // 生产环境替换为真实流地址
    replayUrl:     '',
    viewers:       1268,
    likes:         3240,
    subscribed:    false,
    followed:      false,
    outline: [
      { time: '19:30', title: '开场：留守儿童现状分析',           done: true,  current: false },
      { time: '19:45', title: '核心：孩子的心理发展需求',         done: true,  current: false },
      { time: '20:05', title: '识别：孩子情绪问题的信号',         done: false, current: true  },
      { time: '20:25', title: '实战：有效沟通的5个方法',          done: false, current: false },
      { time: '20:50', title: 'Q&A：家长提问环节',                done: false, current: false }
    ]
  },
  'l002': {
    id:            'l002',
    title:         '夏季农业管理：防旱抗涝技术',
    teacherAvatar: '👨‍🌾',
    teacherName:   '赵技术员',
    teacherTitle:  '高级农艺师',
    date:          '07/22',
    time:          '14:00',
    tags:          ['农技', '实用', '免费'],
    status:        'soon',
    liveUrl:       '',
    replayUrl:     '',
    viewers:       0,
    likes:         0,
    subscribed:    false,
    followed:      false,
    outline: [
      { time: '14:00', title: '夏季农业气候特点分析',             done: false, current: false },
      { time: '14:20', title: '防旱灌溉技术与时机把握',           done: false, current: false },
      { time: '14:45', title: '排涝技术与田间管理',               done: false, current: false },
      { time: '15:10', title: '病虫害夏季防控要点',               done: false, current: false },
      { time: '15:30', title: '现场答疑',                         done: false, current: false }
    ]
  }
};

// ============================================================
// 相关课程推荐
// ============================================================
const RELATED_COURSES = [
  {
    id: 'c001', emoji: '🧘',
    coverBg: 'linear-gradient(135deg, #4527A0, #7B1FA2)',
    title: '农村留守家庭心理关怀指南',
    teacherName: '李梅老师', duration: '28:30', free: true
  },
  {
    id: 'c005', emoji: '😊',
    coverBg: 'linear-gradient(135deg, #7C4DFF, #512DA8)',
    title: '妈妈的情绪与孩子的成长',
    teacherName: '刘心理师', duration: '24:45', free: true
  },
  {
    id: 'c007', emoji: '📚',
    coverBg: 'linear-gradient(135deg, #FF6F00, #E65100)',
    title: '陪孩子做作业，怎么不崩溃？',
    teacherName: '吴老师', duration: '26:10', free: true
  }
];

// ============================================================
// 模拟弹幕内容
// ============================================================
const MOCK_DANMU = [
  { type: 'normal', userName: '山村小花',   content: '李老师讲得太好了！',           roleLabel: '家长', roleColor: '#FF9800' },
  { type: 'normal', userName: '留守爸爸',   content: '感谢，学到了很多',             roleLabel: '家长', roleColor: '#FF9800' },
  { type: 'question', userName: '小明妈妈', content: '孩子见到我就哭，是分离焦虑吗？'                                      },
  { type: 'normal', userName: '广西阿强',   content: '这种情况我家也有',             roleLabel: '家长', roleColor: '#FF9800' },
  { type: 'teacher', content: '是的，这是典型的分离焦虑表现，我们下一节会重点讲解'                                        },
  { type: 'normal', userName: '云南老王',   content: '👏👏👏',                        roleLabel: '学员', roleColor: '#4CAF50' },
  { type: 'normal', userName: '贵州小菊',   content: '李老师声音真好听哈哈',         roleLabel: '学员', roleColor: '#4CAF50' },
  { type: 'gift',   userName: '远方的爸',   giftEmoji: '🌟', giftName: '小星星 x5'                                         },
  { type: 'system', content: '欢迎 新用户 加入直播间'                                                                     },
  { type: 'normal', userName: '重庆阿花',   content: '我孩子也一直不跟我说话',       roleLabel: '家长', roleColor: '#FF9800' },
  { type: 'question', userName: '湖南妈妈', content: '多久打一次电话比较好？'                                               },
  { type: 'teacher', content: '建议每天至少一次，哪怕5分钟，固定时间很重要'                                               },
  { type: 'normal', userName: '四川阿平',   content: '记笔记中！',                   roleLabel: '学员', roleColor: '#4CAF50' },
  { type: 'normal', userName: '广东阿军',   content: '感同身受😭',                   roleLabel: '家长', roleColor: '#FF9800' },
  { type: 'gift',   userName: '思念孩子的妈妈', giftEmoji: '❤️', giftName: '爱心 x10'                                    }
];

// ============================================================
// 快捷短语
// ============================================================
const SHORTCUT_TEXTS = [
  '讲得很好！', '感谢老师！', '记下来了', '我家也是',
  '请问老师...', '能再讲一遍吗？', '👍', '❤️'
];

// ============================================================
// 表情列表
// ============================================================
const ALL_EMOJIS = [
  '😄','😭','👍','❤️','🔥','👏','😂','🤔',
  '😮','🥺','💪','🌹','🌟','✨','😁','🎉'
];

// ============================================================
// Page
// ============================================================
Page({

  data: {
    liveId:   '',
    liveInfo: null,

    // 播放状态
    isLive:    false,
    liveEnded: false,
    liveUrl:   '',
    replayUrl: '',
    muted:     false,
    orientation: 'vertical',

    // 网络
    networkWeak: false,

    // 统计
    viewerCount: 0,
    likeCount:   0,
    liking:      false,

    // 弹幕
    danmuList:  [],
    inputText:  '',

    // 心
    heartList: [],
    _heartCounter: 0,

    // 收藏/关注
    collected: false,
    followed:  false,

    // 倒计时
    countdown: { hours: '00', minutes: '00', seconds: '00' },
    _countdownTimer: null,

    // 弹幕模拟定时器
    _danmuTimer:  null,
    _viewerTimer: null,

    // 面板显隐
    showControls:       true,
    showInputPanel:     false,
    showQuestionPanel:  false,
    showResourcesPanel: false,
    showSharePanel:     false,

    // 快捷内容
    quickEmojis:   ['❤️', '👍', '🔥', '😄'],
    shortcutTexts: SHORTCUT_TEXTS,
    allEmojis:     ALL_EMOJIS,

    // 提问
    questionText:  '',
    myQuestions:   [],
    hasNewAnswer:  false,

    // 资料
    liveOutline:    [],
    relatedCourses: RELATED_COURSES
  },

  // ─── 生命周期 ───────────────────────────────
  onLoad(options) {
    const liveId = options.liveId || 'l001';
    this.setData({ liveId });
    this._initLive(liveId);
  },

  onUnload() {
    this._clearTimers();
  },

  // ─── 初始化直播 ──────────────────────────────
  _initLive(liveId) {
    const liveData = LIVE_DATA[liveId] || LIVE_DATA['l001'];
    const subscribed = (wx.getStorageSync(KEY_SUBSCRIBED) || []).includes(liveId);
    const collected  = (wx.getStorageSync(KEY_COLLECTED)  || []).includes(liveId);
    const followed   = (wx.getStorageSync(KEY_FOLLOWED)   || []).includes(liveData.id);

    const isLive = liveData.status === 'live';

    this.setData({
      liveInfo: {
        ...liveData,
        subscribed,
        followed
      },
      isLive,
      liveEnded:  liveData.status === 'ended',
      liveUrl:    liveData.liveUrl || '',
      replayUrl:  liveData.replayUrl || '',
      viewerCount: this._formatViewers(liveData.viewers),
      likeCount:  this._formatLikes(liveData.likes),
      collected,
      liveOutline: liveData.outline || []
    });

    if (isLive) {
      // 推入欢迎弹幕
      this._pushDanmu({
        type:    'system',
        content: `欢迎来到《${liveData.title}》直播间`
      });
      // 启动模拟弹幕
      this._startMockDanmu();
      // 启动观看人数模拟
      this._startViewerSimulate();
    } else if (liveData.status === 'soon') {
      this._startCountdown(liveData.date, liveData.time);
    }
  },

  // ─── 弹幕系统 ────────────────────────────────
  _pushDanmu(item) {
    const danmu = {
      id: `d_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      ...item
    };
    let list = [...this.data.danmuList, danmu];
    // 最多保留 12 条
    if (list.length > 12) list = list.slice(list.length - 12);
    this.setData({ danmuList: list });
  },

  _startMockDanmu() {
    let index = 0;
    const timer = setInterval(() => {
      if (index >= MOCK_DANMU.length) index = 0;
      const item = MOCK_DANMU[index++];
      this._pushDanmu(item);

      // 讲师回答时标记新回答
      if (item.type === 'teacher' && this.data.myQuestions.length > 0) {
        const myQuestions = this.data.myQuestions.map((q, i) => {
          if (i === 0 && !q.answered) {
            return { ...q, answered: true, answer: item.content };
          }
          return q;
        });
        this.setData({ myQuestions, hasNewAnswer: true });
      }
    }, 2800);

    this.data._danmuTimer = timer;
  },

  // ─── 观看人数模拟 ────────────────────────────
  _startViewerSimulate() {
    let base = this.data.liveInfo?.viewers || 1000;
    const timer = setInterval(() => {
      const delta = Math.floor(Math.random() * 10) - 3;
      base = Math.max(100, base + delta);
      this.setData({ viewerCount: this._formatViewers(base) });
    }, 5000);
    this.data._viewerTimer = timer;
  },

  // ─── 倒计时 ──────────────────────────────────
  _startCountdown(dateStr, timeStr) {
    const targetDate = this._parseTargetDate(dateStr, timeStr);
    if (!targetDate) return;

    const tick = () => {
      const now  = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        this.setData({
          countdown: { hours: '00', minutes: '00', seconds: '00' },
          isLive: true
        });
        clearInterval(this.data._countdownTimer);
        this._startMockDanmu();
        this._startViewerSimulate();
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const hours    = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const minutes  = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const seconds  = String(totalSec % 60).padStart(2, '0');
      this.setData({ countdown: { hours, minutes, seconds } });
    };

    tick();
    const timer = setInterval(tick, 1000);
    this.data._countdownTimer = timer;
  },

  _parseTargetDate(dateStr, timeStr) {
    try {
      const year = new Date().getFullYear();
      const [month, day] = dateStr.split('/').map(Number);
      const [hour, minute] = timeStr.split(':').map(Number);
      return new Date(year, month - 1, day, hour, minute, 0).getTime();
    } catch (e) {
      return null;
    }
  },

  // ─── 清理定时器 ──────────────────────────────
  _clearTimers() {
    if (this.data._danmuTimer)  clearInterval(this.data._danmuTimer);
    if (this.data._viewerTimer) clearInterval(this.data._viewerTimer);
    if (this.data._countdownTimer) clearInterval(this.data._countdownTimer);
  },

  // ─── 播放器事件 ──────────────────────────────
  onPlayerStateChange(e) {
    const { code } = e.detail;
    console.log('[live-player] statechange:', code);
    // 2003=播放中 / -2301=断流 / -2302=解码失败
    if (code === -2301 || code === -2302) {
      wx.showToast({ title: '直播信号中断，正在重连...', icon: 'none', duration: 3000 });
    }
  },

  onPlayerError(e) {
    console.error('[live-player] error:', e.detail);
    wx.showModal({
      title:      '播放异常',
      content:    '直播加载失败，请检查网络后重试',
      confirmText:'重新加载',
      cancelText: '返回',
      success: (res) => {
        if (res.cancel) this.onGoBack();
      }
    });
  },

  onNetStatus(e) {
    const { videoBitrate } = e.detail.info || {};
    const weak = videoBitrate < 200;
    if (weak !== this.data.networkWeak) {
      this.setData({ networkWeak: weak });
    }
  },

  // ─── 控制层显隐 ──────────────────────────────
  onToggleControls() {
    if (this.data.showInputPanel || this.data.showQuestionPanel ||
        this.data.showResourcesPanel || this.data.showSharePanel) return;
    this.setData({ showControls: !this.data.showControls });
  },

  // ─── 静音 ────────────────────────────────────
  onToggleMute() {
    this.setData({ muted: !this.data.muted });
  },

  // ─── 点赞 ────────────────────────────────────
  onLike() {
    const { _heartCounter } = this.data;
    const styles = ['a', 'b', 'c'];
    const emojis = ['❤️', '🧡', '💛', '💚', '💜'];

    const heart = {
      id:    `h_${Date.now()}`,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      style: styles[_heartCounter % 3],
      left:  20 + Math.floor(Math.random() * 60),
      delay: (Math.random() * 0.3).toFixed(2)
    };

    const heartList = [...this.data.heartList, heart].slice(-8);
    const likeCount = this._formatLikes((this.data.liveInfo?.likes || 0) + 1);

    this.setData({
      heartList,
      liking: true,
      likeCount,
      _heartCounter: _heartCounter + 1
    });

    setTimeout(() => this.setData({ liking: false }), 300);
    setTimeout(() => {
      const list = this.data.heartList.filter(h => h.id !== heart.id);
      this.setData({ heartList: list });
    }, 2800);
  },

  // ─── 收藏 ────────────────────────────────────
  onCollect() {
    const { liveId, collected } = this.data;
    const collectedList = wx.getStorageSync(KEY_COLLECTED) || [];
    let newList;

    if (collected) {
      newList = collectedList.filter(id => id !== liveId);
    } else {
      newList = [liveId, ...collectedList];
    }
    wx.setStorageSync(KEY_COLLECTED, newList);
    this.setData({ collected: !collected });
    wx.showToast({
      title: !collected ? '⭐ 已收藏直播' : '已取消收藏',
      icon:  'none', duration: 1500
    });
  },

  // ─── 关注讲师 ────────────────────────────────
  onFollowTeacher() {
    const { liveInfo } = this.data;
    const followedList = wx.getStorageSync(KEY_FOLLOWED) || [];
    let newList;

    if (liveInfo.followed) {
      newList = followedList.filter(id => id !== liveInfo.id);
    } else {
      newList = [liveInfo.id, ...followedList];
    }
    wx.setStorageSync(KEY_FOLLOWED, newList);
    this.setData({
      liveInfo: { ...liveInfo, followed: !liveInfo.followed }
    });
    wx.showToast({
      title: !liveInfo.followed ? '已关注讲师' : '已取消关注',
      icon:  'none', duration: 1500
    });
  },

  // ─── 预约 ────────────────────────────────────
  onSubscribe() {
    const { liveInfo } = this.data;
    const subscribed   = wx.getStorageSync(KEY_SUBSCRIBED) || [];
    let newSubscribed;

    if (liveInfo.subscribed) {
      newSubscribed = subscribed.filter(id => id !== liveInfo.id);
    } else {
      newSubscribed = [liveInfo.id, ...subscribed];
    }
    wx.setStorageSync(KEY_SUBSCRIBED, newSubscribed);
    this.setData({
      liveInfo: { ...liveInfo, subscribed: !liveInfo.subscribed }
    });
    wx.showToast({
      title: !liveInfo.subscribed ? '🔔 预约成功，开播提醒您' : '已取消预约',
      icon:  'none', duration: 2000
    });
  },

  // ─── 弹幕输入 ────────────────────────────────
  onOpenInput() {
    this.setData({ showInputPanel: true, showControls: false });
  },

  onCloseInput() {
    this.setData({ showInputPanel: false, inputText: '' });
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  onAddEmoji(e) {
    const { emoji } = e.currentTarget.dataset;
    this.setData({ inputText: this.data.inputText + emoji });
  },

  onUseShortcut(e) {
    const { text } = e.currentTarget.dataset;
    this.setData({ inputText: text });
  },

  onQuickEmoji(e) {
    const { emoji } = e.currentTarget.dataset;
    const savedRole = wx.getStorageSync(KEY_ROLE) || {};
    this._pushDanmu({
      type:      'normal',
      userName:  savedRole.label || '我',
      content:   emoji,
      roleLabel: '我',
      roleColor: '#FFD54F'
    });
    this.onLike();
  },

  onSendDanmu() {
    const { inputText } = this.data;
    if (!inputText.trim()) return;

    const savedRole = wx.getStorageSync(KEY_ROLE) || {};
    this._pushDanmu({
      type:      'normal',
      userName:  savedRole.label || '我',
      content:   inputText.trim(),
      roleLabel: '我',
      roleColor: '#FFD54F'
    });

    this.setData({ inputText: '' });
    this.onCloseInput();
  },

  // ─── 提问 ────────────────────────────────────
  onOpenQuestion() {
    this.setData({ showQuestionPanel: true, hasNewAnswer: false, showControls: false });
  },

  onCloseQuestion() {
    this.setData({ showQuestionPanel: false });
  },

  onQuestionInput(e) {
    this.setData({ questionText: e.detail.value });
  },

  onSendQuestion() {
    const { questionText } = this.data;
    if (!questionText.trim()) return;

    const newQuestion = {
      id:       `q_${Date.now()}`,
      content:  questionText.trim(),
      answered: false,
      answer:   ''
    };

    const myQuestions = [newQuestion, ...this.data.myQuestions];
    this.setData({ myQuestions, questionText: '' });

    // 同时发到弹幕区
    const savedRole = wx.getStorageSync(KEY_ROLE) || {};
    this._pushDanmu({
      type:     'question',
      userName: savedRole.label || '我',
      content:  newQuestion.content
    });

    wx.showToast({ title: '✋ 问题已提交，等待回答', icon: 'none', duration: 2000 });
  },

  // ─── 资料面板 ────────────────────────────────
  onOpenResources() {
    this.setData({ showResourcesPanel: true, showControls: false });
  },

  onCloseResources() {
    this.setData({ showResourcesPanel: false });
  },

  onGoRelatedCourse(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ showResourcesPanel: false });
    wx.showToast({ title: '课程详情开发中', icon: 'none' });
    // wx.navigateTo({ url: `../course/index?courseId=${id}` });
  },

  // ─── 分享 ────────────────────────────────────
  onShareLive() {
    this.setData({ showSharePanel: true, showControls: false });
  },

  onCloseShare() {
    this.setData({ showSharePanel: false });
  },

  onShareToFamily() {
    const { liveInfo } = this.data;
    const savedRole = wx.getStorageSync(KEY_ROLE) || {};
    const myUid     = wx.getStorageSync('ftree_my_uid') || '';

    const dynamic = {
      id:          `live_share_${Date.now()}`,
      memberUid:   myUid,
      memberName:  savedRole.label || '家庭成员',
      memberIcon:  savedRole.icon  || '📡',
      type:        'live',
      typeLabel:   '直播分享',
      content:     `正在看直播：《${liveInfo.title}》，李梅老师讲得很好！快来一起看！`,
      timestamp:   Date.now(),
      timeAgo:     '刚刚',
      likes:       0,
      read:        false
    };

    const dynamics = [dynamic, ...(wx.getStorageSync(KEY_DYNAMICS) || [])].slice(0, 50);
    wx.setStorageSync(KEY_DYNAMICS, dynamics);

    this.setData({ showSharePanel: false });
    wx.showToast({ title: '🌳 已分享到家庭树', icon: 'none', duration: 2000 });
  },

  onCopyLink() {
    wx.setClipboardData({
      data: `【家庭心树直播】${this.data.liveInfo?.title || ''}`,
      success: () => wx.showToast({ title: '链接已复制', icon: 'none' })
    });
    this.setData({ showSharePanel: false });
  },

  onGenPoster() {
    this.setData({ showSharePanel: false });
    wx.showToast({ title: '海报生成中...', icon: 'none' });
  },

  // ─── 返回 ────────────────────────────────────
  onGoBack() {
    this._clearTimers();
    wx.navigateBack({ delta: 1 });
  },

  // ─── 工具函数 ────────────────────────────────
  _formatViewers(n) {
    if (!n) return '0';
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
    if (n >= 1000)  return (n / 1000).toFixed(1) + 'k';
    return String(n);
  },

  _formatLikes(n) {
    if (!n) return '0';
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
    if (n >= 1000)  return (n / 1000).toFixed(1) + 'k';
    return String(n);
  },

  // ─── 微信分享 ────────────────────────────────
  onShareAppMessage() {
    const { liveInfo } = this.data;
    return {
      title: `${liveInfo?.teacherName} 正在直播：${liveInfo?.title}`,
      path:  `/pages/services/convenience/familytree/live/index?liveId=${this.data.liveId}`
    };
  }

});
