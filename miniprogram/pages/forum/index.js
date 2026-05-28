// pages/forum/index.js
Page({
  data: {
    activeTab: 0,
    tabs: ['推荐', '关注', '同城'],
    posts: [
      {
        id: '1',
        avatar: '',
        nickname: '平江小吃货',
        handle: '@pingjiang_food',
        time: '3分钟前',
        content: '平江天岳关的豆腐真的绝了！软嫩入味，配上辣椒炒的，一口一个停不下来🤤 强烈推荐大家去打卡！\n\n#平江美食 #天岳关 #豆腐',
        images: [],
        likes: 128,
        comments: 36,
        reposts: 12,
        liked: false,
        reposted: false,
        tag: '美食'
      },
      {
        id: '2',
        avatar: '',
        nickname: '平江房东李哥',
        handle: '@house_lige',
        time: '15分钟前',
        content: '汉昌路精装两房出租，拎包入住，月租1500，有意者私信📞\n\n#平江租房 #汉昌路',
        images: [],
        likes: 45,
        comments: 18,
        reposts: 5,
        liked: false,
        reposted: false,
        tag: '租房'
      },
      {
        id: '3',
        avatar: '',
        nickname: '石牛寨爬山日记',
        handle: '@shiniu_hike',
        time: '1小时前',
        content: '今天天气超好！石牛寨云海简直太美了，爬了2小时值了✨\n\n附上今天的照片，大家快来打卡！\n\n#石牛寨 #平江旅游 #云海',
        images: ['mock1', 'mock2'],
        likes: 562,
        comments: 89,
        reposts: 203,
        liked: true,
        reposted: false,
        tag: '旅游'
      },
      {
        id: '4',
        avatar: '',
        nickname: '平江找工作互助',
        handle: '@job_pingjiang',
        time: '2小时前',
        content: '【招聘】平江县城某超市招收银员2名，要求：\n✅ 18-40岁\n✅ 有收银经验优先\n✅ 月薪2800-3500\n\n有意者评论区留言或私信👇\n\n#平江招聘 #超市招聘',
        images: [],
        likes: 89,
        comments: 45,
        reposts: 67,
        liked: false,
        reposted: false,
        tag: '招聘'
      }
    ],
    tagColors: {
      '美食': { bg: '#fff3e0', color: '#f57c00' },
      '租房': { bg: '#e8f5e9', color: '#388e3c' },
      '旅游': { bg: '#e3f2fd', color: '#1976d2' },
      '招聘': { bg: '#fce4ec', color: '#c2185b' },
      '默认': { bg: '#f3e5f5', color: '#7b1fa2' }
    },
    isRefreshing: false
  },

  onLoad: function() {},

  onShow: function() {},

  // 切换 Tab
  switchTab: function(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
  },

  // 点赞
  toggleLike: function(e) {
    var id = e.currentTarget.dataset.id;
    var posts = this.data.posts;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === id) {
        posts[i].liked = !posts[i].liked;
        posts[i].likes += posts[i].liked ? 1 : -1;
        break;
      }
    }
    this.setData({ posts: posts });
  },

  // 转发
  toggleRepost: function(e) {
    var id = e.currentTarget.dataset.id;
    var posts = this.data.posts;
    for (var i = 0; i < posts.length; i++) {
      if (posts[i].id === id) {
        posts[i].reposted = !posts[i].reposted;
        posts[i].reposts += posts[i].reposted ? 1 : -1;
        break;
      }
    }
    this.setData({ posts: posts });
    wx.showToast({
      title: posts.find(function(p) { return p.id === id; }).reposted ? '转发成功' : '已取消转发',
      icon: 'none'
    });
  },

  // 评论
  goComment: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.showToast({ title: '评论功能开发中', icon: 'none' });
  },

  // 分享
  goShare: function(e) {
    wx.showActionSheet({
      itemList: ['分享给朋友', '复制链接', '举报'],
      success: function(res) {
        if (res.tapIndex === 2) {
          wx.showToast({ title: '举报已提交', icon: 'success' });
        }
      }
    });
  },

  // 查看大图
  previewImage: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.previewImage({ current: url, urls: [url] });
  },

  // 发帖
  goPublish: function() {
    wx.navigateTo({ url: '/pages/forum/publish/index' });
  },

  // 搜索
  goSearch: function() {
    wx.showToast({ title: '搜索功能开发中', icon: 'none' });
  },

  // 下拉刷新
  onRefresh: function() {
    var self = this;
    this.setData({ isRefreshing: true });
    setTimeout(function() {
      self.setData({ isRefreshing: false });
      wx.showToast({ title: '已是最新内容', icon: 'none' });
    }, 1200);
  },

  // 格式化数字
  formatCount: function(count) {
    if (count >= 10000) {
      return (count / 10000).toFixed(1) + 'w';
    }
    return count;
  },

  // 获取 tag 样式
  getTagStyle: function(tag) {
    var colors = this.data.tagColors;
    return colors[tag] || colors['默认'];
  }
});
