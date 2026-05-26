// pages/community/index.js
Page({
  data: {
    activeTab: 0,
    tabList: ['全部', '求助', '公告', '闲聊', '活动'],
    postList: [
      {
        id: 1,
        avatar: '👨',
        nickname: '平江老李',
        time: '10分钟前',
        tag: '求助',
        tagColor: '#FF6B6B',
        title: '请问平江哪里有修自行车的？',
        content: '我的自行车链条断了，想找个师傅修一下，哪位邻居知道？',
        likes: 12,
        comments: 8,
        isLiked: false
      },
      {
        id: 2,
        avatar: '👩',
        nickname: '社区张阿姨',
        time: '1小时前',
        tag: '活动',
        tagColor: '#4ECDC4',
        title: '本周六健康义诊，欢迎居民参加！',
        content: '平江县人民医院将在社区广场举办免费健康义诊，上午9点开始，欢迎大家踊跃参加。',
        likes: 56,
        comments: 23,
        isLiked: true
      },
      {
        id: 3,
        avatar: '👦',
        nickname: '小平江人',
        time: '2小时前',
        tag: '闲聊',
        tagColor: '#95A5A6',
        title: '今天平江天气真好，适合出去走走',
        content: '难得这么好的天气，大家可以去平江河边散散步，空气特别清新~',
        likes: 34,
        comments: 15,
        isLiked: false
      },
      {
        id: 4,
        avatar: '👮',
        nickname: '社区工作站',
        time: '昨天',
        tag: '公告',
        tagColor: '#8B5E3C',
        title: '关于小区停车位调整的通知',
        content: '为了更好地管理停车秩序，社区决定对停车位进行重新规划，详情请查看公告栏。',
        likes: 89,
        comments: 42,
        isLiked: false
      }
    ],
    filteredList: [],
    isLoading: false
  },

  onLoad(options) {
    this.setData({ filteredList: this.data.postList })
    console.log('平江贴吧页面加载')
  },

  onShow() {
    console.log('平江贴吧页面显示')
  },

  // 切换Tab
  onTabTap(e) {
    const index = e.currentTarget.dataset.index
    const tabName = this.data.tabList[index]
    this.setData({ activeTab: index })

    if (index === 0) {
      this.setData({ filteredList: this.data.postList })
    } else {
      const filtered = this.data.postList.filter(item => item.tag === tabName)
      this.setData({ filteredList: filtered })
    }
  },

  // 点赞
  onLikeTap(e) {
    const { id } = e.currentTarget.dataset
    const postList = this.data.postList.map(item => {
      if (item.id === id) {
        return {
          ...item,
          isLiked: !item.isLiked,
          likes: item.isLiked ? item.likes - 1 : item.likes + 1
        }
      }
      return item
    })
    const activeTab = this.data.activeTab
    const tabName = this.data.tabList[activeTab]
    const filteredList = activeTab === 0
      ? postList
      : postList.filter(item => item.tag === tabName)
    this.setData({ postList, filteredList })
  },

  // 点击帖子
  onPostTap(e) {
    const { id } = e.currentTarget.dataset
    wx.showToast({
      title: '帖子详情开发中',
      icon: 'none',
      duration: 1500
    })
  },

  // 发帖
  onPublishTap() {
    wx.showToast({
      title: '发帖功能开发中',
      icon: 'none',
      duration: 1500
    })
  },

  onPullDownRefresh() {
    wx.showToast({ title: '刷新成功', icon: 'success', duration: 800 })
    setTimeout(() => wx.stopPullDownRefresh(), 800)
  },

  onReachBottom() {},
  onReady() {},
  onHide() {},
  onUnload() {},

  onShareAppMessage() {
    return {
      title: '平江汇生活 - 平江贴吧',
      path: '/pages/community/index'
    }
  }
})

