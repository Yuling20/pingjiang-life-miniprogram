// pages/community/comment/index.js
// 评论详情页 - 含多级回复、删除、举报、排序、敏感词校验

// 前端敏感词库（与发帖页保持一致）
const SENSITIVE_WORDS = [
  '广告', '代开发票', '办证', '贷款', '赌博', '色情', '暴力',
  '反动', '邪教', '法轮功', '六四', '台独', '藏独', '疆独',
  '黄赌毒', '诈骗', '传销', '枪支', '炸弹', '私彩'
]

// 模拟当前登录用户（替换为真实用户体系后删除）
const MOCK_ME = { userId: 'u_me', nickname: '我自己', avatar: '/images/avatar.png' }

// 模拟帖子数据
const MOCK_POST = {
  id: 1, userId: 'u1', avatar: '/images/avatar.png',
  nickname: '平江老表', time: '10分钟前',
  content: '平江县天岳广场今天好热闹，有活动！大家快去看，带孩子去耍一下，气氛超好的👍',
  likes: 38
}

// 模拟评论数据
const MOCK_COMMENTS = [
  {
    id: 101, userId: 'u2', avatar: '/images/avatar.png',
    nickname: '汉昌居民', isVip: false, time: '8分钟前',
    content: '我也在那里！广场舞大妈好厉害哈哈哈',
    likes: 12, isLiked: false,
    isMine: false,
    totalReplies: 3,
    replies: [
      { id: 201, userId: 'u3', nickname: '嘉义街坊', replyTo: '汉昌居民', time: '6分钟前', content: '哈哈哈是的，跳得超好！', isMine: false },
      { id: 202, userId: 'u_me', nickname: '我自己', replyTo: '汉昌居民', time: '5分钟前', content: '明天再去看看', isMine: true }
    ]
  },
  {
    id: 102, userId: 'u_me', avatar: '/images/avatar.png',
    nickname: '我自己', isVip: false, time: '5分钟前',
    content: '太好了，带我妈妈去！',
    likes: 5, isLiked: false,
    isMine: true,
    totalReplies: 0,
    replies: []
  },
  {
    id: 103, userId: 'u4', avatar: '/images/avatar.png',
    nickname: '天岳山人', isVip: true, time: '3分钟前',
    content: '活动几点结束？',
    likes: 3, isLiked: false,
    isMine: false,
    totalReplies: 1,
    replies: [
      { id: 203, userId: 'u1', nickname: '平江老表', replyTo: '天岳山人', time: '2分钟前', content: '大概晚上九点！', isMine: false }
    ]
  }
]

Page({
  data: {
    postId: null,
    post: {},
    comments: [],
    sortByTime: true,    // true=最新优先 false=热门优先
    inputVal: '',        // 评论输入内容
    inputFocus: false,   // 是否聚焦
    replyTarget: '',     // 回复对象昵称
    replyCommentId: null // 回复的评论id
  },

  onLoad(options) {
    const postId = options.postId || 1
    this.setData({ postId })
    this.loadPost()
    this.loadComments()
  },

  // =============================================
  // 加载原帖
  // =============================================
  loadPost() {
    // TODO: 替换为接口 GET /api/post/:id
    this.setData({ post: MOCK_POST })
  },

  // =============================================
  // 加载评论（支持排序）
  // =============================================
  loadComments() {
    // TODO: 替换为接口 GET /api/comment/list?postId=&sort=time|hot
    let comments = [...MOCK_COMMENTS]
    if (this.data.sortByTime) {
      // 最新优先：按id倒序模拟
      comments = comments.sort((a, b) => b.id - a.id)
    } else {
      // 热门优先：按点赞数倒序
      comments = comments.sort((a, b) => b.likes - a.likes)
    }
    this.setData({ comments })
  },

  // =============================================
  // 切换排序
  // =============================================
  toggleSort() {
    this.setData({ sortByTime: !this.data.sortByTime }, () => {
      this.loadComments()
    })
  },

  // =============================================
  // 评论点赞
  // =============================================
  likeComment(e) {
    const { id, index } = e.currentTarget.dataset
    const comments = this.data.comments.map((c, i) => {
      if (i === index) {
        return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 }
      }
      return c
    })
    this.setData({ comments })
    // TODO: POST /api/comment/like { commentId: id }
  },

  // =============================================
  // 打开回复（设置回复对象）
  // =============================================
  openReply(e) {
    const { id, index, name } = e.currentTarget.dataset
    this.setData({
      replyTarget: name,
      replyCommentId: id,
      inputFocus: true
    })
  },

  // =============================================
  // 输入框变化
  // =============================================
  onInputChange(e) {
    this.setData({ inputVal: e.detail.value })
  },

  // =============================================
  // 发送评论/回复（含双重敏感词校验）
  // =============================================
  submitComment() {
    const content = this.data.inputVal.trim()
    if (!content) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' })
      return
    }

    // 实名授权检查
    const authed = wx.getStorageSync('user_authed') || false
    if (!authed) {
      wx.showModal({
        title: '需要授权', content: '评论需要实名授权，请先完成授权',
        confirmText: '去授权', showCancel: true,
        success: (res) => {
          if (res.confirm) {
            wx.getUserProfile({
              desc: '评论需实名授权',
              success: (r) => {
                wx.setStorageSync('user_authed', true)
                wx.setStorageSync('user_info', r.userInfo)
                wx.showToast({ title: '授权成功，请重新发送', icon: 'none' })
              }
            })
          }
        }
      })
      return
    }

    // 第一道：前端敏感词拦截
    if (SENSITIVE_WORDS.some(w => content.includes(w))) {
      wx.showModal({
        title: '内容违规',
        content: '评论包含违规词汇，请修改后再发送',
        showCancel: false
      })
      return
    }

    // 第二道：微信内容安全接口（预留，同发帖页）
    // TODO: 启用云函数安全检测后取消注释
    this.doSubmitComment(content)
  },

  doSubmitComment(content) {
    const { replyCommentId, replyTarget } = this.data

    if (replyCommentId) {
      // 提交回复
      const newReply = {
        id: Date.now(),
        userId: MOCK_ME.userId,
        nickname: MOCK_ME.nickname,
        replyTo: replyTarget,
        time: '刚刚',
        content,
        isMine: true
      }
      const comments = this.data.comments.map(c => {
        if (c.id === replyCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
            totalReplies: (c.totalReplies || 0) + 1
          }
        }
        return c
      })
      this.setData({ comments, inputVal: '', replyTarget: '', replyCommentId: null, inputFocus: false })
      // TODO: POST /api/comment/reply { commentId, content, replyTo }
    } else {
      // 提交一级评论（最新优先时插入顶部）
      const newComment = {
        id: Date.now(),
        userId: MOCK_ME.userId,
        avatar: MOCK_ME.avatar,
        nickname: MOCK_ME.nickname,
        isVip: false,
        time: '刚刚',
        content,
        likes: 0,
        isLiked: false,
        isMine: true,
        totalReplies: 0,
        replies: []
      }
      const comments = this.data.sortByTime
        ? [newComment, ...this.data.comments]
        : [...this.data.comments, newComment]
      this.setData({ comments, inputVal: '', inputFocus: false })
      // TODO: POST /api/comment/add { postId, content }
    }

    wx.showToast({ title: '发送成功', icon: 'success' })
  },

  // =============================================
  // 删除本人评论
  // =============================================
  deleteComment(e) {
    const { id, index } = e.currentTarget.dataset
    wx.showModal({
      title: '删除评论', content: '确认删除这条评论？', confirmText: '删除',
      confirmColor: '#E53935',
      success: (res) => {
        if (res.confirm) {
          const comments = this.data.comments.filter((_, i) => i !== index)
          this.setData({ comments })
          wx.showToast({ title: '已删除', icon: 'success' })
          // TODO: DELETE /api/comment/:id
        }
      }
    })
  },

  // =============================================
  // 删除本人回复
  // =============================================
  deleteReply(e) {
    const { commentIndex, replyId } = e.currentTarget.dataset
    wx.showModal({
      title: '删除回复', content: '确认删除这条回复？', confirmText: '删除',
      confirmColor: '#E53935',
      success: (res) => {
        if (res.confirm) {
          const comments = this.data.comments.map((c, i) => {
            if (i === commentIndex) {
              return {
                ...c,
                replies: c.replies.filter(r => r.id !== replyId),
                totalReplies: Math.max(0, c.totalReplies - 1)
              }
            }
            return c
          })
          this.setData({ comments })
          wx.showToast({ title: '已删除', icon: 'success' })
          // TODO: DELETE /api/reply/:id
        }
      }
    })
  },

  // =============================================
  // 展开更多回复
  // =============================================
  loadMoreReplies(e) {
    const { id, index } = e.currentTarget.dataset
    wx.showToast({ title: '加载更多回复...', icon: 'none' })
    // TODO: GET /api/reply/list?commentId=&page=
  },

  // =============================================
  // 举报评论/回复
  // =============================================
  reportComment(e) {
    wx.showModal({
      title: '举报', content: '确认举报该内容？', confirmText: '举报',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '举报已提交，感谢反馈', icon: 'none' })
          // TODO: POST /api/report { type: 'comment', id }
        }
      }
    })
  },

  // =============================================
  // 跳转个人主页
  // =============================================
  goUser(e) {
    wx.navigateTo({ url: `../user/index?userId=${e.currentTarget.dataset.id}` })
  }
})
