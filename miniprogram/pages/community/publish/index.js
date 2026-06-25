// pages/community/publish/index.js
const app = getApp()

// ============================================================
// 积分规则常量（统一维护，改规则只改这里）
// ============================================================
const POINTS_RULES = {
  PUBLISH:        10,   // 发布合规内容
  LIKED:           2,   // 被他人点赞
  COMMENTED:       2,   // 被他人评论
  SHARE_MOMENTS:  20,   // 转发到朋友圈
  SHARE_FRIEND:   10,   // 转发给朋友
  DAILY_CAP:     200,   // 每账户每日上限
}

// ============================================================
// 违规关键词库
// ============================================================
const VIOLATION_KEYWORDS = [
  // 涉政
  '政府倒台', '推翻政权', '颠覆国家',
  // 涉黄
  '色情', '裸聊', '援交', '约炮',
  // 涉赌
  '赌博', '六合彩', '网络赌场', '博彩',
  // 涉毒
  '毒品', '大麻', '冰毒', '海洛因', '吸毒',
  // 人身攻击
  '滚出去', '去死', '傻逼', '脑残', '废物',
  // 广告营销
  '加微信', '扫码进群', '私信联系', '限时优惠',
  // 谣言类
  '内部消息', '独家爆料未经证实',
]

// ============================================================
// 话题列表
// ============================================================
const TOPIC_LIST = [
  { id: 't1',  name: '平江探店'   },
  { id: 't2',  name: '本地美食'   },
  { id: 't3',  name: '活动通知'   },
  { id: 't4',  name: '萌宠日记'   },
  { id: 't5',  name: '周末游玩'   },
  { id: 't6',  name: '求助互助'   },
  { id: 't7',  name: '二手交易'   },
  { id: 't8',  name: '扯闲谈'     },
  { id: 't9',  name: '亲子教育'   },
  { id: 't10', name: '健康养生'   },
  { id: 't11', name: '本地资讯'   },
  { id: 't12', name: '搞笑日常'   },
]

// ============================================================
// AI 灵感模板库
// ============================================================
const AI_TIPS = [
  '今天在平江发现一家宝藏小店，环境超好，价格实惠，强烈安利给大家～',
  '最近发现一道超好吃的本地美食，做法简单食材易得，快来看看吧！',
  '周末带娃出去玩，分享几个平江亲子好去处，大人小孩都爱的那种',
  '家里养的宠物今天又干了件可爱的事，忍不住要来分享一下哈哈',
  '最近有个困扰了好久的问题，想请问一下平江的朋友有没有好建议？',
  '二手好物出售，东西保养得很好，有需要的邻居欢迎来聊～',
]

Page({

  // ============================================================
  // data
  // ============================================================
  data: {
    // ---------- 内容 ----------
    content:        '',
    postType:       'text',
    images:         [],
    videoSrc:       '',
    videoThumb:     '',
    videoDuration:  '',
    selectedTopic:  '',
    visibility:     '广场可见',

    // ---------- UI 状态 ----------
    canPublish:          false,
    isRealNameVerified:  false,
    violationTip:        '',
    showAiCard:          false,
    aiTip:               '',
    showTopicPanel:      false,
    topicList:           TOPIC_LIST,

    // ---------- 规范折叠 UI ----------
    rulesExpanded: false,
    rulesAgreed:   false,
  },

  // ============================================================
  // 生命周期
  // ============================================================

  onLoad(options) {
    this._checkRealName()
    if (options && options.topic) {
      this.setData({ selectedTopic: decodeURIComponent(options.topic) })
    }
  },

  onUnload() {
    if (this.data.videoSrc) {
      wx.removeSavedFile({ filePath: this.data.videoSrc, fail() {} })
    }
  },

  // ============================================================
  // 转发朋友圈 → +20积分（每次分享触发一次）
  // ============================================================
  onShareTimeline() {
    const { content, selectedTopic } = this.data
    // 仅已发布的帖子分享才计积分（通过 postId 标记判断）
    if (this.data._publishedPostId) {
      const result = this._addPoints('SHARE_MOMENTS')
      if (result.added > 0) {
        wx.showToast({ title: `+${result.added}积分 朋友圈分享`, icon: 'none', duration: 1500 })
      }
    }
    return {
      title: content.slice(0, 30) || '来平江汇看看这条帖子',
      query: `postId=${this.data._publishedPostId || ''}`,
    }
  },

  // ============================================================
  // 转发给朋友 → +10积分
  // ============================================================
  onShareAppMessage() {
    const { content } = this.data
    if (this.data._publishedPostId) {
      const result = this._addPoints('SHARE_FRIEND')
      if (result.added > 0) {
        wx.showToast({ title: `+${result.added}积分 转发好友`, icon: 'none', duration: 1500 })
      }
    }
    return {
      title: content.slice(0, 30) || '来平江汇看看这条帖子',
      path:  `/pages/community/detail/index?postId=${this.data._publishedPostId || ''}`,
    }
  },

  // ============================================================
  // 实名认证校验
  // ============================================================

  _checkRealName() {
    const info1    = wx.getStorageSync('userRealNameInfo')
    const status2  = wx.getStorageSync('userAuthStatus')
    const verified = !!((info1 && info1.verified) || status2 === true)
    this.setData({ isRealNameVerified: verified })
  },

  goVerify() {
    wx.switchTab({ url: '/pages/mine/mine' })
  },

  // ============================================================
  // 顶部导航 · 关闭
  // ============================================================

  onClose() {
    const { content, images, videoSrc } = this.data
    const hasContent = content.trim() || images.length > 0 || videoSrc

    if (hasContent) {
      wx.showModal({
        title:        '放弃发帖？',
        content:      '当前内容尚未发布，确认放弃吗？',
        confirmText:  '放弃',
        cancelText:   '继续编辑',
        confirmColor: '#CC3322',
        success: (res) => {
          if (res.confirm) wx.navigateBack({ delta: 1 })
        }
      })
    } else {
      wx.navigateBack({ delta: 1 })
    }
  },

  // ============================================================
  // 发布帖子 → 成功后 +10积分
  // ============================================================

  onPublish() {
    const {
      content, images, videoSrc, postType,
      selectedTopic, visibility, violationTip,
      isRealNameVerified,
    } = this.data

    // ① 内容校验
    if (!content.trim()) {
      wx.showToast({ title: '请填写帖子内容', icon: 'none' })
      return
    }

    // ② 违规拦截
    if (violationTip) {
      wx.showModal({
        title:       '内容违规提醒',
        content:     '您的帖子包含违规内容，请修改后重新发布。',
        showCancel:  false,
        confirmText: '我知道了',
      })
      return
    }

    // ③ 实名拦截
    if (!isRealNameVerified) {
      wx.showModal({
        title:       '需要实名认证',
        content:     '发帖功能需要完成实名认证，请前往「我的」页面完成认证。',
        confirmText: '去认证',
        cancelText:  '取消',
        success: (res) => {
          if (res.confirm) wx.switchTab({ url: '/pages/mine/mine' })
        }
      })
      return
    }

    // ④ 媒体类型校验
    if (postType === 'image' && images.length === 0) {
      wx.showToast({ title: '图文帖至少需要1张图片', icon: 'none' })
      return
    }
    if (postType === 'video' && !videoSrc) {
      wx.showToast({ title: '视频帖需要上传视频', icon: 'none' })
      return
    }

    // ⑤ 组装帖子数据
    wx.showLoading({ title: '发布中...' })

    const postId  = Date.now().toString()
    const newPost = {
      id:           postId,
      avatarColor:  '#FFD6C8',
      avatarEmoji:  '😊',
      nickname:     wx.getStorageSync('userNickname') || '平江居民',
      authorId:     wx.getStorageSync('userId') || '',   // 用于防自己点赞/评论
      time:         '刚刚',
      category:     selectedTopic || '扯闲谈',
      content:      content.trim(),
      tags:         selectedTopic ? [`#${selectedTopic}`] : [],
      images,
      videoSrc,
      likeCount:    0,
      commentCount: 0,
      liked:        false,
      visibility,
    }

    // ⑥ 写入本地 Storage（模拟接口）
    try {
      const posts = wx.getStorageSync('communityPosts') || []
      posts.unshift(newPost)
      wx.setStorageSync('communityPosts', posts)
    } catch (e) {
      console.error('写入帖子失败', e)
    }

    // ⑦ 发布成功 → 累积 +10积分
    const pointResult = this._addPoints('PUBLISH')

    wx.hideLoading()

    // 保存已发布帖子ID，供分享回调使用
    this.data._publishedPostId = postId

    // 提示语：区分是否已到每日上限
    const toastTitle = pointResult.added > 0
      ? `发布成功 🎉 +${pointResult.added}积分`
      : '发布成功 🎉 今日积分已达上限'

    wx.showToast({ title: toastTitle, icon: 'success', duration: 2000 })

    setTimeout(() => {
      wx.navigateBack({ delta: 1 })
    }, 2100)
  },

  // ============================================================
  // 文字输入 & 违规实时检测
  // ============================================================

  onContentInput(e) {
    const content = e.detail.value || ''
    const tip     = this._detectViolation(content)
    this.setData({
      content,
      violationTip: tip,
      canPublish:   content.trim().length > 0,
    })
  },

  _detectViolation(text) {
    if (!text) return ''
    const lower = text.toLowerCase()
    for (const kw of VIOLATION_KEYWORDS) {
      if (lower.includes(kw.toLowerCase())) {
        return `内容含有违规词「${kw}」，请修改后发布`
      }
    }
    return ''
  },

  // ============================================================
  // 发帖类型切换
  // ============================================================

  switchType(e) {
    this.setData({ postType: e.currentTarget.dataset.type })
  },

  // ============================================================
  // 图片操作
  // ============================================================

  chooseImage() {
    const remain = 9 - this.data.images.length
    if (remain <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count:      remain,
      mediaType:  ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newPaths = res.tempFiles.map(f => f.tempFilePath)
        this.setData({
          images:     [...this.data.images, ...newPaths],
          postType:   'image',
          canPublish: true,
        })
      },
      fail(err) {
        if (!err.errMsg.includes('cancel')) {
          wx.showToast({ title: '选择图片失败，请重试', icon: 'none' })
        }
      }
    })
  },

  removeImage(e) {
    const index  = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({
      images,
      postType: images.length === 0 ? 'text' : 'image',
    })
  },

  // ============================================================
  // 视频操作
  // ============================================================

  chooseVideo() {
    wx.chooseMedia({
      count:       1,
      mediaType:   ['video'],
      sourceType:  ['album', 'camera'],
      maxDuration: 60,
      success: (res) => {
        const file     = res.tempFiles[0]
        const duration = Math.round(file.duration || 0)
        const mm       = Math.floor(duration / 60)
        const ss       = String(duration % 60).padStart(2, '0')
        this.setData({
          videoSrc:      file.tempFilePath,
          videoThumb:    file.thumbTempFilePath || '',
          videoDuration: `${mm}:${ss}`,
          postType:      'video',
          canPublish:    true,
        })
      },
      fail(err) {
        if (!err.errMsg.includes('cancel')) {
          wx.showToast({ title: '选择视频失败，请重试', icon: 'none' })
        }
      }
    })
  },

  removeVideo() {
    this.setData({
      videoSrc:      '',
      videoThumb:    '',
      videoDuration: '',
      postType:      'text',
    })
  },

  // ============================================================
  // 可见范围
  // ============================================================

  onVisibilityTap() {
    wx.showActionSheet({
      itemList: ['广场可见', '仅自己可见', '粉丝可见'],
      success: (res) => {
        const opts = ['广场可见', '仅自己可见', '粉丝可见']
        this.setData({ visibility: opts[res.tapIndex] })
      }
    })
  },

  // ============================================================
  // AI 灵感
  // ============================================================

  onAiInspire() {
    const tip = AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]
    this.setData({ showAiCard: true, aiTip: tip })
  },

  closeAiCard() {
    this.setData({ showAiCard: false, aiTip: '' })
  },

  useAiTip() {
    const { aiTip, content } = this.data
    const merged = content ? `${content}\n${aiTip}` : aiTip
    const tip    = this._detectViolation(merged)
    this.setData({
      content:      merged,
      violationTip: tip,
      canPublish:   merged.trim().length > 0,
      showAiCard:   false,
      aiTip:        '',
    })
  },

  // ============================================================
  // 话题面板
  // ============================================================

  onTopicTap() {
    this.setData({ showTopicPanel: true })
  },

  closeTopicPanel() {
    this.setData({ showTopicPanel: false })
  },

  onTopicSelect(e) {
    this.setData({
      selectedTopic:  e.currentTarget.dataset.name,
      showTopicPanel: false,
    })
  },

  removeTopic() {
    this.setData({ selectedTopic: '' })
  },

  // ============================================================
  // 规范折叠 UI
  // ============================================================

  toggleRules() {
    this.setData({ rulesExpanded: !this.data.rulesExpanded })
  },

  onRulesAgree() {
    this.setData({ rulesAgreed: !this.data.rulesAgreed })
  },

  // ============================================================
  // 通用：阻止事件冒泡
  // ============================================================

  stopPropagation() {},

  // ============================================================
  // ✅ 积分核心方法（统一入口，供本页及其他页面复用）
  //
  // type 取值：'PUBLISH' | 'LIKED' | 'COMMENTED' |
  //            'SHARE_MOMENTS' | 'SHARE_FRIEND'
  //
  // 返回：{ added: Number, total: Number, todayUsed: Number }
  // ============================================================

  _addPoints(type) {
    const points = POINTS_RULES[type]
    if (!points || points <= 0) return { added: 0, total: 0, todayUsed: 0 }

    const today = new Date().toISOString().slice(0, 10)  // 'YYYY-MM-DD'
    const key   = 'pointsData'

    try {
      // 读取积分中心数据
      let data = wx.getStorageSync(key)
      if (!data || typeof data !== 'object') {
        data = { total: 0, daily: {} }
      }

      // 初始化今日计数
      if (!data.daily[today]) {
        data.daily[today] = 0
      }

      const todayUsed = data.daily[today]

      // 已达每日上限，不再累积
      if (todayUsed >= POINTS_RULES.DAILY_CAP) {
        return { added: 0, total: data.total, todayUsed }
      }

      // 不超过今日剩余额度
      const canAdd   = POINTS_RULES.DAILY_CAP - todayUsed
      const actualAdd = Math.min(points, canAdd)

      data.total            += actualAdd
      data.daily[today]     += actualAdd

      // 清理7天前的日期记录，防止 storage 无限膨胀
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 7)
      Object.keys(data.daily).forEach(date => {
        if (new Date(date) < cutoff) delete data.daily[date]
      })

      wx.setStorageSync(key, data)

      return {
        added:    actualAdd,
        total:    data.total,
        todayUsed: data.daily[today],
      }

    } catch (e) {
      console.error('积分写入失败', e)
      return { added: 0, total: 0, todayUsed: 0 }
    }
  },

})
