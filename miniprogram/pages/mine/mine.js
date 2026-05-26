// pages/mine/mine.js
Page({
  data: {
    // 用户信息（未登录状态）
    isLoggedIn: false,
    userInfo: {
      nickName: '平江居民',
      avatarIcon: '👤'
    },
    // 功能菜单
    menuList: [
      { id: 1, icon: '📝', name: '我的发帖', desc: '查看我发布的帖子', type: 'posts' },
      { id: 2, icon: '❤️', name: '我的收藏', desc: '查看收藏的内容', type: 'favorites' },
      { id: 3, icon: '📞', name: '联系我们', desc: '意见反馈与建议', type: 'contact' },
      { id: 4, icon: '📋', name: '使用说明', desc: '小程序使用帮助', type: 'help' },
      { id: 5, icon: 'ℹ️', name: '关于我们', desc: '平江汇生活简介', type: 'about' }
    ],
    // 快捷统计
    stats: [
      { label: '发帖', value: 0 },
      { label: '收藏', value: 0 },
      { label: '点赞', value: 0 }
    ]
  },

  onLoad() {
    console.log('我的页面加载');
  },

  // 点击登录
  onLogin() {
    wx.showToast({ title: '登录功能即将上线', icon: 'none' });
  },

  // 点击菜单
  onMenuTap(e) {
    const type = e.currentTarget.dataset.type;
    const tipMap = {
      posts:    '我的发帖功能即将上线',
      favorites:'收藏功能即将上线',
      contact:  '请通过小程序右上角反馈',
      help:     '使用说明即将完善',
      about:    '平江汇生活 - 平江人自己的生活服务平台'
    };
    wx.showToast({ title: tipMap[type] || '即将上线', icon: 'none', duration: 2000 });
  },

  onShareAppMessage() {
    return {
      title: '平江汇生活 - 平江人自己的服务平台',
      path: '/pages/home/home'
    };
  }
});
