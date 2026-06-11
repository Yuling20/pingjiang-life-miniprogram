// pages/services/convenience/job/job.js

// ===================== 敏感词库 =====================
const SENSITIVE_PATTERNS = [
  // 手机号
  /1[3-9]\d{9}/g,
  // 微信号关键词
  /微信\s*[:：号码]?\s*[a-zA-Z0-9_\-]{5,}/g,
  /wx\s*[:：]?\s*[a-zA-Z0-9_\-]{5,}/gi,
  /weixin\s*[:：]?\s*[a-zA-Z0-9_\-]{5,}/gi,
  // QQ号
  /QQ\s*[:：号]?\s*[1-9][0-9]{4,}/gi,
  /qq\s*[:：号]?\s*[1-9][0-9]{4,}/g,
  // 导流词
  /加微/g,
  /加我微信/g,
  /私信/g,
  /V信/gi,
  /扫我/g,
  /私聊/g,
  /加好友/g,
  /加联系/g,
  /找我/g,
  /滴我/g,
  /滴滴我/g,
  /发我/g,
  /私我/g,
  /站外/g,
  /转账/g,
  /收款码/g,
  /支付宝\s*[:：号]?\s*\S{5,}/g,
  /电话\s*[:：]?\s*1[3-9]\d{9}/g,
  /手机\s*[:：]?\s*1[3-9]\d{9}/g,
  /联系方式\s*[:：]?\s*\S{5,}/g,
  // 平台违规词
  /刷单/g,
  /兼职刷/g,
  /轻松日入/g,
  /日赚\d+/g,
  /月赚\d+万/g,
  /躺着赚/g,
  /无需经验.*高薪/g,
  /诈骗/g,
  /传销/g,
  /赌博/g,
  /色情/g,
];

// ===================== 模拟数据 =====================
const MOCK_JOBS = [
  {
    id: 1,
    type: 'long',
    typeLabel: '长期',
    title: '餐厅服务员',
    company: '平江老街餐饮有限公司',
    salary: '3500-4500元/月',
    address: '平江路188号',
    description: '负责餐厅日常服务工作，接待顾客，保持环境整洁。',
    requirement: '18-40岁，身体健康，有服务业经验优先。',
    isVip: true,
    contactName: '王经理',
    avatar: '🏢',
    publishTime: '2025-01-10',
    viewCount: 128,
  },
  {
    id: 2,
    type: 'short',
    typeLabel: '短期',
    title: '短期工',
    company: '平江某工厂',
    salary: '180元/天',
    address: '平江工业园区',
    description: '工厂短期旺季用工，简单流水线工作。',
    requirement: '18-50岁，身体健康，能吃苦耐劳。',
    isVip: false,
    contactName: '李主管',
    avatar: '🏭',
    publishTime: '2025-01-09',
    viewCount: 89,
  },
  {
    id: 3,
    type: 'parttime',
    typeLabel: '兼职',
    title: '周末促销员',
    company: '苏州平江超市',
    salary: '150元/天',
    address: '平江新城广场B区',
    description: '周末两天商场促销活动，负责产品介绍与销售。',
    requirement: '形象气质佳，口齿清晰，有促销经验更佳。',
    isVip: false,
    contactName: '李主管',
    avatar: '🏪',
    publishTime: '2025-01-09',
    viewCount: 89,
  },
];

const JOB_TYPES = [
  { value: 'long', label: '长期', icon: '👔' },
  { value: 'short', label: '短期', icon: '⏱️' },
  { value: 'parttime', label: '兼职', icon: '⏰' },
];

Page({
  data: {
    // ---- 列表相关 ----
    jobList: [],
    filterType: 'all',
    filterTypes: [
      { value: 'all', label: '全部' },
      { value: 'long', label: '长期' },
      { value: 'short', label: '短期' },
      { value: 'parttime', label: '兼职' },
    ],
    isLoading: false,
    isRealName: false,

    // ---- 详情弹窗 ----
    showDetail: false,
    currentJob: null,

    // ---- 发布弹窗（只保留步骤1：选择类型） ----
    showPublish: false,
    publishStep: 1,
    jobTypes: JOB_TYPES,
    publishForm: {
      type: '',
      typeLabel: '',
      title: '',
      description: '',
      requirement: '',
      salary: '',
      address: '',
      latitude: null,
      longitude: null,
    },
    publishErrors: {},
    isSubmitting: false,

    // ---- 简历弹窗 ----
    showResume: false,
    resumeForm: {
      name: '',
      gender: '',
      age: '',
      phone: '',
      email: '',
      education: '',
      school: '',
      major: '',
      workExp: '',
      skills: '',
      selfIntro: '',
    },
    resumeErrors: {},
    showResumePreview: false,
    genderOptions: ['男', '女', '保密'],
    genderIndex: 0,
    educationOptions: ['高中/中专', '大专', '本科', '硕士', '博士'],
    educationIndex: 0,
  },

  // ===================== 生命周期 =====================
  onLoad() {
    this.checkRealName();
    this.loadJobList();
  },

  onShow() {
    this.checkRealName();
  },

  // ===================== 实名校验 =====================
  checkRealName() {
    const userInfo = wx.getStorageSync('userRealNameInfo');
    this.setData({ isRealName: !!(userInfo && userInfo.verified) });
  },

  doRealNameAuth() {
    wx.showModal({
      title: '需要实名认证',
      content: '发布职位、查看联系方式等功能需完成微信实名认证，请前往「我的」页面完成认证。',
      confirmText: '去认证',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.switchTab({ url: '/pages/mine/mine' });
        }
      },
    });
  },

  // ===================== 敏感词校验 =====================
  checkSensitive(text) {
    if (!text) return { pass: true, cleaned: '' };
    let cleaned = text;
    let found = false;
    SENSITIVE_PATTERNS.forEach((pattern) => {
      if (pattern.test(text)) {
        found = true;
        cleaned = cleaned.replace(pattern, '***');
      }
      pattern.lastIndex = 0;
    });
    return { pass: !found, cleaned };
  },

  async secMsgCheck(content) {
    return new Promise((resolve) => {
      if (!content || content.trim() === '') {
        resolve(true);
        return;
      }
      wx.request({
        url: 'https://api.weixin.qq.com/wxa/msg_sec_check',
        method: 'POST',
        data: { content },
        success: (res) => {
          if (res.data && res.data.errcode === 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        fail: () => resolve(true), // 网络失败时放行，依赖前端拦截
      });
    });
  },

  // ===================== 列表筛选 =====================
  loadJobList() {
    this.setData({ isLoading: true });
    setTimeout(() => {
      const { filterType } = this.data;
      const list =
        filterType === 'all'
          ? MOCK_JOBS
          : MOCK_JOBS.filter((j) => j.type === filterType);
      this.setData({ jobList: list, isLoading: false });
    }, 300);
  },

  onFilterChange(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ filterType: type }, () => {
      this.loadJobList();
    });
  },

  // ===================== 详情弹窗 =====================
  openDetail(e) {
    const job = e.currentTarget.dataset.job;
    this.setData({ showDetail: true, currentJob: job });
  },

  closeDetail() {
    this.setData({ showDetail: false, currentJob: null });
  },

  onContactTap() {
    const { currentJob, isRealName } = this.data;
    if (!isRealName) {
      this.doRealNameAuth();
      return;
    }
    if (currentJob.isVip) {
      // VIP：跳转虚拟号码拨打（号码由后端提供，此处预留）
      wx.showModal({
        title: '平台安全通话',
        content: `即将通过平台虚拟号码联系「${currentJob.contactName}」，号码不会透露您的真实手机号。`,
        confirmText: '拨打',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // TODO: 后端接口获取虚拟号码后拨打
            // wx.makePhoneCall({ phoneNumber: virtualNumber });
            wx.showToast({ title: '正在连接平台安全通话...', icon: 'none' });
          }
        },
      });
    } else {
      // 非VIP：站内消息
      wx.showToast({
        title: '已发送站内消息，请等待对方回复',
        icon: 'none',
        duration: 2500,
      });
    }
  },

  stopPropagation() {},

  // ===================== 发布职位 =====================
  // ✅ 改动1：openPublish 恢复为打开弹窗（步骤1选类型）
  openPublish() {
    if (!this.data.isRealName) {
      this.doRealNameAuth();
      return;
    }
    this.setData({
      showPublish: true,
      publishStep: 1,
      publishForm: {
        type: '',
        typeLabel: '',
        title: '',
        description: '',
        requirement: '',
        salary: '',
        address: '',
        latitude: null,
        longitude: null,
      },
      publishErrors: {},
    });
  },

  closePublish() {
    this.setData({ showPublish: false });
  },

  selectJobType(e) {
    const { value, label } = e.currentTarget.dataset;
    this.setData({
      'publishForm.type': value,
      'publishForm.typeLabel': label,
    });
  },

  // ✅ 改动2：goPublishStep2 改为跳转 publish 页，携带类型参数
  goPublishStep2() {
    if (!this.data.publishForm.type) {
      wx.showToast({ title: '请选择招聘类型', icon: 'none' });
      return;
    }
    const { type, typeLabel } = this.data.publishForm;
    this.setData({ showPublish: false });
    wx.navigateTo({
      url: `/pages/services/convenience/job/publish/publish?jobType=${type}&jobTypeLabel=${encodeURIComponent(typeLabel)}`,
    });
  },

  backPublishStep1() {
    this.setData({ publishStep: 1 });
  },

  onPublishInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`publishForm.${field}`]: value });
  },

  // 获取当前位置
  getLocation() {
    wx.showLoading({ title: '定位中...' });
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        wx.hideLoading();
        // 逆地理编码（预留后端接口，前端模拟地址填充）
        this.setData({
          'publishForm.latitude': res.latitude,
          'publishForm.longitude': res.longitude,
          'publishForm.address': `当前位置（${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}）`,
        });
        wx.showToast({ title: '定位成功', icon: 'success' });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '定位失败，请手动输入地址', icon: 'none' });
      },
    });
  },

  // 地图选点
  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          'publishForm.address': res.name || res.address,
          'publishForm.latitude': res.latitude,
          'publishForm.longitude': res.longitude,
        });
      },
      fail: () => {
        wx.showToast({ title: '取消选择', icon: 'none' });
      },
    });
  },

  // 提交发布
  async submitPublish() {
    if (this.data.isSubmitting) return;
    const form = this.data.publishForm;
    const errors = {};

    // 必填校验
    if (!form.title.trim()) errors.title = '请输入职位名称';
    if (!form.salary.trim()) errors.salary = '请输入薪资范围';
    if (!form.address.trim()) errors.address = '请输入工作地址';
    if (!form.description.trim()) errors.description = '请输入职位描述';
    if (!form.requirement.trim()) errors.requirement = '请输入任职要求';

    if (Object.keys(errors).length > 0) {
      this.setData({ publishErrors: errors });
      wx.showToast({ title: '请完善必填信息', icon: 'none' });
      return;
    }

    // 前端敏感词校验
    const checkFields = [
      { key: 'title', label: '职位名称' },
      { key: 'description', label: '职位描述' },
      { key: 'requirement', label: '任职要求' },
      { key: 'address', label: '工作地址' },
      { key: 'salary', label: '薪资范围' },
    ];

    for (const f of checkFields) {
      const result = this.checkSensitive(form[f.key]);
      if (!result.pass) {
        this.setData({ [`publishForm.${f.key}`]: result.cleaned });
        wx.showModal({
          title: '⚠️ 违规内容拦截',
          content: `「${f.label}」中含有违规词（如联系方式、导流信息等），已自动清除，请修改后重新提交。`,
          showCancel: false,
          confirmText: '知道了',
        });
        return;
      }
    }

    // 弹窗确认
    const confirmResult = await new Promise((resolve) => {
      wx.showModal({
        title: '确认发布',
        content: `职位「${form.title}」即将发布，请确认内容无误。\n\n⚠️ 平台风险提示：请通过平台安全通道联系应聘者，谨防诈骗，平台不承担任何线下交易责任。`,
        confirmText: '确认发布',
        cancelText: '再检查',
        success: resolve,
      });
    });

    if (!confirmResult.confirm) return;

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '发布中...' });

    // TODO: 调用后端发布接口
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ isSubmitting: false, showPublish: false });
      wx.showToast({ title: '发布成功', icon: 'success' });
      this.loadJobList();
    }, 1200);
  },

  // ===================== 简历功能 =====================
  openResume() {
    if (!this.data.isRealName) {
      this.doRealNameAuth();
      return;
    }
    this.setData({
      showResume: true,
      showResumePreview: false,
      resumeErrors: {},
    });
  },

  closeResume() {
    this.setData({ showResume: false, showResumePreview: false });
  },

  onResumeInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`resumeForm.${field}`]: value });
  },

  onGenderChange(e) {
    const index = e.detail.value;
    const options = this.data.genderOptions;
    this.setData({
      genderIndex: index,
      'resumeForm.gender': options[index],
    });
  },

  onEducationChange(e) {
    const index = e.detail.value;
    const options = this.data.educationOptions;
    this.setData({
      educationIndex: index,
      'resumeForm.education': options[index],
    });
  },

  previewResume() {
    const form = this.data.resumeForm;
    const errors = {};
    if (!form.name.trim()) errors.name = '请输入姓名';
    if (!form.phone.trim()) errors.phone = '请输入联系电话';
    if (!form.education) errors.education = '请选择学历';

    if (Object.keys(errors).length > 0) {
      this.setData({ resumeErrors: errors });
      wx.showToast({ title: '请完善必填信息', icon: 'none' });
      return;
    }

    // 校验简历中的联系方式格式（手机号格式校验）
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      this.setData({ 'resumeErrors.phone': '请输入正确的手机号' });
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }

    this.setData({ resumeErrors: {}, showResumePreview: true });
  },

  backResumeEdit() {
    this.setData({ showResumePreview: false });
  },

  saveResume() {
    wx.showLoading({ title: '保存中...' });
    // 本地存储简历
    wx.setStorageSync('myResume', this.data.resumeForm);
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '简历已保存', icon: 'success' });
    }, 800);
  },

  exportResume() {
    // 前端模拟导出，后端预留
    wx.showModal({
      title: '导出简历',
      content: '简历导出功能正在开发中，敬请期待！当前已为您保存至本地。',
      showCancel: false,
      confirmText: '知道了',
      success: () => {
        this.saveResume();
      },
    });
  },
});