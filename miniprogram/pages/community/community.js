Page({
  data: {
    posts: [
      { id: 1, avatar: '👨', nickname: '平江老表', time: '10分钟前', content: '平江天岳广场今天好热闹，有活动！大家快去看看 🎉', likes: 38, comments: 12, liked: false },
      { id: 2, avatar: '👩', nickname: '嘉义街坊', time: '32分钟前', content: '请问平江哪里有卖正宗长寿鱼的？上次买的不新鲜😅', likes: 15, comments: 7, liked: false },
      { id: 3, avatar: '🧑', nickname: '汉昌居民', time: '1小时前', content: '平江高铁站附近停车方便吗？下周要去接人，求指路 🚗', likes: 22, comments: 9, liked: false },
      { id: 4, avatar: '👴', nickname: '平江退休族', time: '2小时前', content: '天气变化大，大家多注意保暖！尤其老人小孩别感冒了 ❤️', likes: 56, comments: 18, liked: false },
      { id: 5, avatar: '👩', nickname: '美食探店er', time: '3小时前', content: '强烈推荐平江酱干！带了几包回长沙，同事抢着吃😋 平江特产真的香！', likes: 89, comments: 31, liked: false },
      { id: 6, avatar: '🧑', nickname: '安定社区邻居', time: '昨天', content: '咱们小区门口的路灯坏了好几天了，有人反映了吗？', likes: 11, comments: 5, liked: false }
    ]
  },
  onLoad() {},
  handleLike(e) {
    const id = e.currentTarget.dataset.id;
    const posts = this.data.posts.map(post => {
      if (post.id === id) {
        return { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 };
      }
      return post;
    });
    this.setData({ posts });
  },
  handlePost() {
    wx.showModal({ title: '提示', content: '发帖功能即将开放，敬请期待！', showCancel: false, confirmText: '好的', confirmColor: '#e6820e' });
  },
  handleComment(e) {
    wx.showModal({ title: '提示', content: '评论功能即将开放，敬请期待！', showCancel: false, confirmText: '好的', confirmColor: '#e6820e' });
  }
});