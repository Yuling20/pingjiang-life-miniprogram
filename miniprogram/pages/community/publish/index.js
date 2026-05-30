// pages/community/publish/index.js

/* ────────────────────────────────────────────
 * 前端敏感词库（手机号/微信号/QQ号/导流词/违规词）
 * 不依赖外部文件，内联在本文件中
 * ──────────────────────────────────────────── */
const SENSITIVE_PATTERNS = [
  // 手机号（11位，1开头）
  /1[3-9]\d{9}/g,
  // 微信号（字母开头6-20位含字母数字下划线）
  /(?:微信|wx|wechat|v信|V信)[号码id：:\s]*[a-zA-Z][a-zA-Z0-9_-]{5,19}/gi,
  // QQ号（5-12位纯数字前有QQ关键词）
  /(?:qq|QQ)[号码：:\s]*[1-9]\d{4,11}/gi,
  // 加微/私信/扫我/私聊等导流词
  /加微|私信|v信|V信|扫我|私聊|加我|联系我|发我|滴我|找我聊|加好友|加一下|wx号|微信号|公众号二维码|扫码加|长按识别/gi,
  // 邮箱
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  // 变体手机号（中间加符号分隔）
  /1[3-9]\d[\s\-_.]{0,2}\d{4}[\s\-_.]{0,2}\d{4}/g,
];

const SENSITIVE_WORDS = [
  '加微', '私信', 'v信', 'V信', '扫我', '私聊', '加我', '联系我',
  '发我', '滴我', '找我聊', '加好友', '加一下', 'wx号', '微信号',
  '公众号二维码', '扫码加', '长按识别', '招嫖', '卖片', '赌博',
  '色情', '涉黄', '兼职刷单', '刷单', '贷款', '套现', '提现',
  '非法', '诈骗', '传销', '违禁'
];

/**
 * 前端敏感词检测
 * @param {string} text 待检测文本
 * @returns {{ hasSensitive: boolean, hitWords: string[] }}
 */
function detectSensitive(text) {
  if (!text) return { hasSensitive: false, hitWords: [] };
  const hitWords = [];

  // 正则检测
  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      hitWords.push(...matches);
    }
  }

  // 关键词检测
  for (const word of SENSITIVE_WORDS) {
    if (text.includes(word)) {
      hitWords.push(word);
    }
  }

  return {
    hasSensitive: hitWords.length > 0,
    hitWords: [...new Set(hitWords)]
  };
}

/**
 * 清除文本中的敏感内容
 * @param {string} text
 * @returns {string}
 */
function cleanSensitive(text) {
  if (!text) return '';
  let cleaned = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.lastIndex = 0;
    cleaned = cleaned.replace(pattern, '***');
  }
  for (const word of SENSITIVE_WORDS) {
    cleaned = cleaned.split(word).join('***');
  }
  return cleaned;
}

/* ────────────────────────────────────────────
 * Page
 * ──────────────────────────────────────────── */
Page({
  data: {
    // ── 实名认证 ──
    isVerified: false,       // 是否已实名
    verifyChecked: false,    // 是否已检查过授权状态

    // ── 帖子内容 ──
    content: '',
    topicInput: '',
    topics: [],
    mediaList: [],           // { type:'image'|'video', path, thumbPath, desc }
    maxMedia: 9,
    maxContentLen: 500,

    // ── UI 状态 ──
    publishing: false,       // 发布中
    showVerifyTip: false,    // 显示未实名提示
    showSensitiveTip: false, // 显示违规提示
    sensitiveHitWords: [],   // 命中的违规词
    sensitiveSource: '',     // 违规来源描述

    // ── 话题分类 ──
    categories: ['邻里互助', '二手交易', '宠物', '美食', '活动', '其他'],
    selectedCategory: '',
  },

  /* ══════════════════════════════════════════
   * 生命周期
   * ══════════════════════════════════════════ */
  onLoad(options) {
    this.checkVerifyStatus();
  },

  onShow() {
    // 每次显示页面都重新检查实名状态（防止从授权页返回后状态未更新）
    this.checkVerifyStatus();
  },

  /* ══════════════════════════════════════════
   * 实名授权校验
   * ══════════════════════════════════════════ */
  checkVerifyStatus() {
    // 优先读取本地缓存（后端对接时替换为接口调用）
    try {
      const userInfo = wx.getStorageSync('userInfo');
      const isVerified = !!(userInfo && userInfo.isVerified);
      this.setData({ isVerified, verifyChecked: true });
    } catch (e) {
      this.setData({ isVerified: false, verifyChecked: true });
    }
  },

  /**
   * 引导用户去实名认证
   */
  goVerify() {
    wx.showModal({
      title: '需要实名认证',
      content: '发布帖子需要完成微信实名认证，认证后方可发布。',
      confirmText: '去认证',
      cancelText: '暂不',
      success: (res) => {
        if (res.confirm) {
          // 跳转到实名认证页（根据实际路由修改）
          wx.navigateTo({
            url: '/pages/auth/verify/index',
            fail: () => {
              wx.showToast({ title: '请前往"我的"完成实名认证', icon: 'none', duration: 2500 });
            }
          });
        }
      }
    });
  },

  /* ══════════════════════════════════════════
   * 内容输入
   * ══════════════════════════════════════════ */
  onContentInput(e) {
    const content = e.detail.value || '';
    this.setData({ content });
  },

  onTopicInput(e) {
    this.setData({ topicInput: e.detail.value || '' });
  },

  addTopic() {
    const raw = this.data.topicInput.trim();
    if (!raw) return;
    const topic = raw.startsWith('#') ? raw : `#${raw}`;

    // 话题也过敏感词
    const { hasSensitive, hitWords } = detectSensitive(topic);
    if (hasSensitive) {
      this.setData({
        topicInput: '',
        showSensitiveTip: true,
        sensitiveHitWords: hitWords,
        sensitiveSource: '话题标签'
      });
      return;
    }

    const topics = [...this.data.topics];
    if (!topics.includes(topic) && topics.length < 5) {
      topics.push(topic);
    }
    this.setData({ topics, topicInput: '' });
  },

  removeTopic(e) {
    const idx = e.currentTarget.dataset.index;
    const topics = [...this.data.topics];
    topics.splice(idx, 1);
    this.setData({ topics });
  },

  selectCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ selectedCategory: cat === this.data.selectedCategory ? '' : cat });
  },

  /* ══════════════════════════════════════════
   * 媒体上传（图片/视频）
   * ══════════════════════════════════════════ */
  chooseImage() {
    const remain = this.data.maxMedia - this.data.mediaList.length;
    if (remain <= 0) {
      wx.showToast({ title: `最多上传${this.data.maxMedia}个媒体文件`, icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newItems = res.tempFiles.map(f => ({
          type: 'image',
          path: f.tempFilePath,
          thumbPath: f.tempFilePath,
          desc: ''
        }));
        this.setData({ mediaList: [...this.data.mediaList, ...newItems] });
      }
    });
  },

  chooseVideo() {
    const remain = this.data.maxMedia - this.data.mediaList.length;
    if (remain <= 0) {
      wx.showToast({ title: `最多上传${this.data.maxMedia}个媒体文件`, icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: (res) => {
        const f = res.tempFiles[0];
        const newItem = {
          type: 'video',
          path: f.tempFilePath,
          thumbPath: f.thumbTempFilePath || f.tempFilePath,
          desc: ''
        };
        this.setData({ mediaList: [...this.data.mediaList, newItem] });
      }
    });
  },

  removeMedia(e) {
    const idx = e.currentTarget.dataset.index;
    const mediaList = [...this.data.mediaList];
    mediaList.splice(idx, 1);
    this.setData({ mediaList });
  },

  previewMedia(e) {
    const idx = e.currentTarget.dataset.index;
    const item = this.data.mediaList[idx];
    if (item.type === 'image') {
      wx.previewImage({
        current: item.path,
        urls: this.data.mediaList.filter(m => m.type === 'image').map(m => m.path)
      });
    } else {
      wx.previewMedia({
        current: 0,
        sources: [{ url: item.path, type: 'video' }]
      });
    }
  },

  /* ══════════════════════════════════════════
   * 敏感词弹窗关闭
   * ══════════════════════════════════════════ */
  closeSensitiveTip() {
    this.setData({ showSensitiveTip: false, sensitiveHitWords: [], sensitiveSource: '' });
  },

  /* ══════════════════════════════════════════
   * 核心：全链路内容校验
   * ══════════════════════════════════════════ */
  /**
   * 步骤1：前端敏感词库检测
   * @returns {{ pass: boolean, source: string, hitWords: string[], cleanedContent: string, cleanedTopics: string[] }}
   */
  _frontendCheck() {
    const { content, topics } = this.data;

    // 检测正文
    const contentCheck = detectSensitive(content);
    if (contentCheck.hasSensitive) {
      return {
        pass: false,
        source: '帖子正文',
        hitWords: contentCheck.hitWords,
        cleanedContent: cleanSensitive(content),
        cleanedTopics: topics
      };
    }

    // 检测话题
    for (const topic of topics) {
      const topicCheck = detectSensitive(topic);
      if (topicCheck.hasSensitive) {
        return {
          pass: false,
          source: '话题标签',
          hitWords: topicCheck.hitWords,
          cleanedContent: content,
          cleanedTopics: topics.map(t => cleanSensitive(t))
        };
      }
    }

    return { pass: true };
  },

  /**
   * 步骤2：调用微信安全内容检测（云函数代理 wx.sec.msgSecCheck）
   * 前端直接调用 wx.request 代理接口，后端返回 { errcode: 0 } 表示安全
   * @param {string} text
   * @returns {Promise<boolean>} true=安全
   */
  _secMsgCheck(text) {
    return new Promise((resolve) => {
      // 若内容为空直接通过
      if (!text || !text.trim()) {
        resolve(true);
        return;
      }
      // 调用云函数（需在 app.js 初始化 wx.cloud）
      // 如果项目未启用云开发，可替换为 wx.request 调用自有后端
      if (wx.cloud) {
        wx.cloud.callFunction({
          name: 'secMsgCheck',  // 云函数名，需自行创建
          data: { content: text },
          success: (res) => {
            const errcode = res.result && res.result.errcode;
            resolve(errcode === 0);
          },
          fail: () => {
            // 云函数调用失败时降级放行（避免因网络问题阻断发布）
            console.warn('[secMsgCheck] 云函数调用失败，降级放行');
            resolve(true);
          }
        });
      } else {
        // 未启用云开发：调用自有后端接口
        wx.request({
          url: 'https://your-api.com/api/secMsgCheck', // 替换为实际接口
          method: 'POST',
          data: { content: text },
          success: (res) => {
            resolve(res.data && res.data.errcode === 0);
          },
          fail: () => {
            console.warn('[secMsgCheck] 接口调用失败，降级放行');
            resolve(true);
          }
        });
      }
    });
  },

  /* ══════════════════════════════════════════
   * 发布入口
   * ══════════════════════════════════════════ */
  async onPublish() {
    // ── 1. 实名校验 ──
    if (!this.data.isVerified) {
      this.goVerify();
      return;
    }

    // ── 2. 基础内容校验 ──
    const { content, topics, mediaList, selectedCategory } = this.data;
    if (!content.trim() && mediaList.length === 0) {
      wx.showToast({ title: '请输入帖子内容或上传图片/视频', icon: 'none' });
      return;
    }
    if (content.length > this.data.maxContentLen) {
      wx.showToast({ title: `内容不超过${this.data.maxContentLen}字`, icon: 'none' });
      return;
    }

    // ── 3. 前端敏感词检测 ──
    const frontendResult = this._frontendCheck();
    if (!frontendResult.pass) {
      // 清空违规内容
      this.setData({
        content: frontendResult.cleanedContent || '',
        topics: frontendResult.cleanedTopics || topics,
        showSensitiveTip: true,
        sensitiveHitWords: frontendResult.hitWords,
        sensitiveSource: frontendResult.source
      });
      return;
    }

    // ── 4. 微信安全内容二次校验 ──
    this.setData({ publishing: true });
    wx.showLoading({ title: '内容审核中...', mask: true });

    try {
      // 拼接所有文本内容一并检测
      const allText = [content, ...topics].join(' ');
      const secPass = await this._secMsgCheck(allText);

      if (!secPass) {
        wx.hideLoading();
        this.setData({
          publishing: false,
          content: '',
          showSensitiveTip: true,
          sensitiveHitWords: ['检测到违规内容'],
          sensitiveSource: '微信安全检测'
        });
        return;
      }

      // ── 5. 上传媒体文件（预留后端接口） ──
      wx.showLoading({ title: '上传媒体中...', mask: true });
      const uploadedMedia = await this._uploadMedia(mediaList);

      // ── 6. 提交帖子到后端（预留接口） ──
      wx.showLoading({ title: '发布中...', mask: true });
      await this._submitPost({
        content: content.trim(),
        topics,
        category: selectedCategory,
        media: uploadedMedia
      });

      wx.hideLoading();
      wx.showToast({ title: '发布成功！', icon: 'success', duration: 1500 });

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (err) {
      wx.hideLoading();
      console.error('[publish] 发布失败', err);
      wx.showToast({ title: err.message || '发布失败，请重试', icon: 'none' });
    } finally {
      this.setData({ publishing: false });
    }
  },

  /**
   * 上传媒体文件（预留后端接口）
   * @param {Array} mediaList
   * @returns {Promise<Array>}
   */
  _uploadMedia(mediaList) {
    return new Promise((resolve) => {
      if (!mediaList || mediaList.length === 0) {
        resolve([]);
        return;
      }
      // TODO: 接入真实上传接口
      // 示例：直接返回本地路径，后端对接时替换为云存储URL
      const result = mediaList.map(m => ({
        type: m.type,
        url: m.path,      // 替换为上传后的云端URL
        thumbUrl: m.thumbPath
      }));
      resolve(result);
    });
  },

  /**
   * 提交帖子（预留后端接口）
   * @param {Object} postData
   * @returns {Promise}
   */
  _submitPost(postData) {
    return new Promise((resolve, reject) => {
      // TODO: 替换为真实后端接口
      console.log('[publish] 提交帖子数据：', postData);
      // 模拟成功
      setTimeout(resolve, 500);

      // 真实接口示例：
      // wx.request({
      //   url: 'https://your-api.com/api/post/create',
      //   method: 'POST',
      //   header: { 'Authorization': `Bearer ${wx.getStorageSync('token')}` },
      //   data: postData,
      //   success: (res) => {
      //     if (res.data.code === 0) resolve(res.data);
      //     else reject(new Error(res.data.msg || '发布失败'));
      //   },
      //   fail: () => reject(new Error('网络异常，请重试'))
      // });
    });
  },

  /* ══════════════════════════════════════════
   * 返回
   * ══════════════════════════════════════════ */
  onBack() {
    if (this.data.content || this.data.mediaList.length > 0 || this.data.topics.length > 0) {
      wx.showModal({
        title: '放弃发布？',
        content: '内容尚未发布，确定离开吗？',
        confirmText: '放弃',
        cancelText: '继续编辑',
        success: (res) => {
          if (res.confirm) wx.navigateBack();
        }
      });
    } else {
      wx.navigateBack();
    }
  }
});
