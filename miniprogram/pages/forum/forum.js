// pages/forum/forum.js
Page({
  data: {
    activeTab: '推荐',
    tabs: ['关注', '推荐', '同城'],
    posts: [
      {
        id: 1,
        avatar: '',
        nickname: '平江老表',
        handle: '@pingjiang_laobiao',
        time: '10分钟前',
        content: '平江天岳广场今天好热闹，有活动！大家快去看看 🎉 #平江生活 #天岳广场',
        images: [],
        likes: 22,
        comments: 9,
        reposts: 3,
        liked: false,
        tag: '同城'
      },
      {
        id: 2,
        avatar: '',
        nickname: '汉昌居民',
        handle: '@hancang_jumin',
        time: '1小时前',
        content: '平江高铁站附近停车方便吗？下周需要去接人，求指路 🙏 #平江出行 #高铁站',
        images: [],
        likes: 15,
        comments: 24,
        reposts: 1,
        liked: false,
        tag: '问答'
      },
      {
        id: 3,
        avatar: '',
        nickname: '平江美食探店',
        handle: '@pj_food',
        time: '2小时前',
        content: '今天打卡了东街新开的这家粉面馆，汤底浓郁，分量十足！强烈推荐 😋 #平江美食 #探店',
        images: [],
        likes: 88,
        comments: 32,
        reposts: 12,
        liked: false,
        tag: '美食'
      },
      {
        id: 4,
        avatar: '',
        nickname: '乡野村民',
        handle: '@xiangye_cumin',
        time: '3小时前',
        content: '今天拍的夕阳，拍出了点朦胧美 🌅 不知道是不是滤镜的原因？ #摄影日志 #摄影 #平江风光',
        images: [],
        likes: 56,
        comments: 11,
        reposts: 8,
        liked: false,
        tag: '摄影'
      }
    ],
    followPosts: [],
    cityPosts: []
  },

  onLoad() {
    this.initCityPosts();
  },

  onShow() {},

  onPullDownRefresh() {
    wx.showToast({ title: '刷新成功', icon: 'success', duration: 1000 });
    setTimeout(() => { wx.stopPullDownRefresh(); }, 1000);
  },

  onReachBottom() {
    wx.showToast({ title: '没有更多了', icon: 'none' });
  },

  initCityPosts() {
    this.setData({
      cityPosts: [
        {
          id: 10,
          avatar: '',
          nickname: '平江本地人',
          handle: '@pj_local',
          time: '刚刚',
          content: '平江今天天气真好，适合出去走走！#平江同城',
          images: [],
          likes: 5,
          comments: 2,
          reposts: 0,
          liked: false,
          tag: '同城'
        }
      ]
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  toggleLike(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.getCurrentList();
    const listKey = this.getCurrentListKey();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) return;
    const post = list[idx];
    const newLiked = !post.liked;
    const newLikes = newLiked ? post.likes + 1 : post.likes - 1;
    this.setData({
      [`${listKey}[${idx}].liked`]: newLiked,
      [`${listKey}[${idx}].likes`]: newLikes
    });
  },

  getCurrentList() {
    const { activeTab, posts, followPosts, cityPosts } = this.data;
    if (activeTab === '关注') return followPosts;
    if (activeTab === '同城') return cityPosts;
    return posts;
  },

  getCurrentListKey() {
    const { activeTab } = this.data;
    if (activeTab === '关注') return 'followPosts';
    if (activeTab === '同城') return 'cityPosts';
    return 'posts';
  },

  goComment(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: '评论功能开发中', icon: 'none' });
  },

  goRepost(e) {
    wx.showToast({ title: '转发功能开发中', icon: 'none' });
  },

  goPublish() {
    wx.navigateTo({ url: '/pages/forum/publish/index' });
  },

  goUserDetail(e) {
    wx.showToast({ title: '个人主页开发中', icon: 'none' });
  },

  goPostDetail(e) {
    wx.showToast({ title: '详情页开发中', icon: 'none' });
  },

  onShareAppMessage() {
    return {
      title: '平江贴吧 - 街坊邻里畅所欲言',
      path: '/pages/forum/forum'
    };
  }
});
