// pages/community/index.js
Page({
  data: {
    // ✅ 补充缺失的 tabList、activeTab、filteredList
    tabList: ['全部', '求助', '热议', '随手拍', '二手'],
    activeTab: 0,
    postList: [
      {
        id: 1,
        nickname: '平江老街坊',
        avatar: '👴',
        time: '10分钟前',
        tag: '热议',
        tagColor: '#E74C3C',
        title: '新医院建设进度更新！终于要来了',
        content: '刚从工地旁边路过，看到施工队伍很多，听说主体结构已经封顶了，大家有没有最新消息？',
        likes: 128,
        comments: 36,
        isLiked: false,
        tabIndex: 2
      },
      {
        id: 2,
        nickname: '北街小陈',
        avatar: '👩',
        time: '30分钟前',
        tag: '求助',
        tagColor: '#3498DB',
        title: '有没有人知道北街哪里修鞋？',
        content: '我有双皮鞋鞋跟坏了，想找人修一下，北街附近有没有修鞋摊？知道的告诉我一声谢谢！',
        likes: 15,
        comments: 12,
        isLiked: false,
        tabIndex: 1
      },
      {
        id: 3,
        nickname: '平江吃货联盟',
        avatar: '🍜',
        time: '2小时前',
        tag: '热议',
        tagColor: '#E74C3C',
        title: '强烈推荐！老南门那家米粉真的太香了',
        content: '去了三次了每次都要排队，汤底是猪骨熬的，配上本地辣椒，真的绝了。强烈推荐大家去试试！',
        likes: 256,
        comments: 89,
        isLiked: true,
        tabIndex: 2
      },
      {
        id: 4,
        nickname: '二手达人',
        avatar: '♻️',
        time: '昨天',
        tag: '二手',
        tagColor: '#27AE60',
        title: '九成新婴儿车出售，价格美丽',
        content: '孩子大了用不上了，好孩子品牌婴儿车，原价1200，现在只要300，可以来看实物，城关镇自取。',
        likes: 32,
        comments: 8,
        isLiked: false,
        tabIndex: 4
      },
      {
        id: 5,
        nickname: '随手一拍',
        avatar: '📸',
        time: '今天',
        tag: '随手拍',
        tagColor: '#8E44AD',
        title: '平江的夕阳真的太美了！',
        content: '傍晚散步拍的，汨罗江边的夕阳，金灿灿的，心情一下子就好了，平江真的是个好地方。',
        likes: 198,
        comments: 45,
        isLiked: false,
        tabIndex: 3
      }
    ],
    filteredList: []
  },

  onLoad() {
    this.filterByTab(0);
  },

  // 根据tab过滤帖子
  filterByTab(tabIndex) {
    const { postList } = this.data;
    let filtered = [];
    if (tabIndex === 0) {
      filtered = postList;
    } else {
      filtered = postList.filter(item => item.tabIndex === tabIndex);
    }
    this.setData({ filteredList: filtered });
  },

  // 切换tab
  onTabTap(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ activeTab: index });
    this.filterByTab(index);
  },

  // 点击帖子
  onPostTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: '帖子详情即将上线', icon: 'none' });
  },

  // 点赞
  onLikeTap(e) {
    const id = e.currentTarget.dataset.id;
    const { postList } = this.data;
    const newList = postList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isLiked: !item.isLiked,
          likes: item.isLiked ? item.likes - 1 : item.likes + 1
        };
      }
      return item;
    });
    this.setData({ postList: newList });
    this.filterByTab(this.data.activeTab);
  },

  // 发帖
  onPublishTap() {
    wx.showToast({ title: '发帖功能即将上线', icon: 'none' });
  }
});
