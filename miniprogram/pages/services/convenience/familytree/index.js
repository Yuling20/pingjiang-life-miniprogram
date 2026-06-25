// pages/services/convenience/familytree/index.js

const KEY_DYNAMICS   = 'ftree_dynamics';
const KEY_MOOD       = 'ftree_mood_log';
const KEY_SUBSCRIBED = 'ftree_subscribed_live';

const DEFAULT_MEMBERS = [
  { uid: 'me',      label: '我',   icon: '😊', moodEmoji: '', hasNew: false },
  { uid: 'mom',     label: '妈妈', icon: '👩', moodEmoji: '', hasNew: false },
  { uid: 'dad',     label: '爸爸', icon: '👨', moodEmoji: '', hasNew: false },
  { uid: 'grandma', label: '奶奶', icon: '👵', moodEmoji: '😊', hasNew: true },
  { uid: 'grandpa', label: '爷爷', icon: '👴', moodEmoji: '', hasNew: false }
];

const MOOD_LIST = [
  { id: 'great',  emoji: '😄', label: '很好' },
  { id: 'good',   emoji: '🙂', label: '还好' },
  { id: 'normal', emoji: '😐', label: '一般' },
  { id: 'bad',    emoji: '😔', label: '不好' },
  { id: 'awful',  emoji: '😢', label: '很差' }
];

const LIVE_PREVIEW = {
  id:          'l001',
  title:       '留守儿童心理健康：家长必看',
  teacherName: '李梅老师',
  date:        '07/20',
  time:        '19:30'
};

const DEFAULT_DYNAMICS = [
  {
    id:         'd001',
    memberUid:  'grandma',
    memberName: '奶奶',
    memberIcon: '👵',
    typeLabel:  '心情打卡',
    content:    '今天天气真好，身体也不错，想大家了 😊',
    timeAgo:    '2小时前'
  },
  {
    id:         'd002',
    memberUid:  'mom',
    memberName: '妈妈',
    memberIcon: '👩',
    typeLabel:  '学习课程',
    content:    '刚看完《孩子不听话怎么办》，学到了很多，推荐给大家！',
    timeAgo:    '昨天'
  }
];

Page({

  data: {
    cityName:      '平江县',
    memberList:    DEFAULT_MEMBERS,
    moodList:      MOOD_LIST,
    selectedMood:  '',
    todayMood:     false,
    todayMoodEmoji:'',
    dynamicList:   [],
    livePreview:   LIVE_PREVIEW
  },

  onLoad() {
    this._initMood();
    this._initDynamics();
  },

  onShow() {
    this._initDynamics();
  },

  _initMood() {
    const moodLog  = wx.getStorageSync(KEY_MOOD) || [];
    const today    = new Date().toLocaleDateString();
    const todayLog = moodLog.find(m => m.date === today);

    if (todayLog) {
      const memberList = this.data.memberList.map(m => {
        if (m.uid === 'me') return { ...m, moodEmoji: todayLog.emoji };
        return m;
      });
      this.setData({
        todayMood:      true,
        todayMoodEmoji: todayLog.emoji,
        selectedMood:   todayLog.id,
        memberList
      });
    }
  },

  _initDynamics() {
    const stored = wx.getStorageSync(KEY_DYNAMICS) || [];
    const list   = stored.length > 0 ? stored : DEFAULT_DYNAMICS;
    this.setData({ dynamicList: list.slice(0, 10) });
  },

  onTapMember(e) {
    const { uid } = e.currentTarget.dataset;
    const member  = this.data.memberList.find(m => m.uid === uid);
    wx.showToast({
      title:    `${member?.icon || ''} ${member?.label || ''}`,
      icon:     'none',
      duration: 1500
    });
  },

  onSelectMood(e) {
    if (this.data.todayMood) {
      wx.showToast({ title: '今日已打卡', icon: 'none' });
      return;
    }
    const { id } = e.currentTarget.dataset;
    this.setData({ selectedMood: id });
  },

  onSubmitMood() {
    if (this.data.todayMood) {
      wx.showToast({ title: '今日已打卡 ' + this.data.todayMoodEmoji, icon: 'none' });
      return;
    }
    if (!this.data.selectedMood) {
      wx.showToast({ title: '请先选择心情', icon: 'none' });
      return;
    }

    const mood    = MOOD_LIST.find(m => m.id === this.data.selectedMood);
    const today   = new Date().toLocaleDateString();
    const moodLog = wx.getStorageSync(KEY_MOOD) || [];
    moodLog.unshift({ id: mood.id, emoji: mood.emoji, date: today });
    wx.setStorageSync(KEY_MOOD, moodLog.slice(0, 365));

    const dynamic = {
      id:         `mood_${Date.now()}`,
      memberUid:  'me',
      memberName: '我',
      memberIcon: '😊',
      typeLabel:  '心情打卡',
      content:    `今日心情：${mood.emoji} ${mood.label}`,
      timeAgo:    '刚刚'
    };

    const dynamics = wx.getStorageSync(KEY_DYNAMICS) || [];
    dynamics.unshift(dynamic);
    wx.setStorageSync(KEY_DYNAMICS, dynamics.slice(0, 50));

    const memberList = this.data.memberList.map(m => {
      if (m.uid === 'me') return { ...m, moodEmoji: mood.emoji };
      return m;
    });

    this.setData({
      todayMood:      true,
      todayMoodEmoji: mood.emoji,
      memberList,
      dynamicList:    dynamics.slice(0, 10)
    });

    wx.showToast({ title: `${mood.emoji} 已分享给家人`, icon: 'none', duration: 2000 });
  },

  onGoMental() {
    wx.navigateTo({
      url: '/pages/services/convenience/familytree/mental/index'
    });
  },

  onGoMentalTest() {
    wx.navigateTo({
      url: '/pages/services/convenience/familytree/mentaltest/index'
    });
  },

  onGoElder() {
    wx.navigateTo({
      url: '/pages/services/convenience/familytree/elder/index'
    });
  },

  onGoCommunity() {
    wx.navigateTo({
      url: '/pages/services/convenience/familytree/community/index'
    });
  },

  onGoLive() {
    wx.navigateTo({
      url: '/pages/services/convenience/familytree/live/index?liveId=l001'
    });
  }

});