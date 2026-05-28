// pages/recruit/publish/index.js
Page({
  data: {
    step: 1, // 当前步骤 1或2
    // 步骤1数据
    jobType: 'full', // full/campus/intern/parttime
    jobTypes: [
      { key: 'full', label: '社招全职' },
      { key: 'campus', label: '应届校园招聘' },
      { key: 'intern', label: '实习生招聘' },
      { key: 'parttime', label: '兼职招聘' }
    ],
    jobName: '',
    jobDesc: '',
    // 步骤2数据
    category: '',
    cityName: '平江县',
    salary: { min: '', max: '', unit: '月' },
    salaryUnits: ['月', '年', '天', '小时'],
    experience: '',
    experienceOptions: ['不限', '1年以内', '1-3年', '3-5年', '5年以上'],
    education: '',
    educationOptions: ['不限', '初中及以下', '高中/中专', '大专', '本科', '硕士及以上'],
    headcount: '',
    welfare: [],
    commonWelfare: ['五险一金', '双休', '包住', '包吃', '带薪年假', '绩效奖金', '节日福利', '弹性上班', '股票期权', '培训机会'],
    contactName: '',
    contactPhone: ''
  },

  // 选择招聘类型
  selectJobType(e) {
    this.setData({ jobType: e.currentTarget.dataset.key })
  },

  onJobNameInput(e) { this.setData({ jobName: e.detail.value }) },
  onJobDescInput(e) { this.setData({ jobDesc: e.detail.value }) },
  onContactNameInput(e) { this.setData({ contactName: e.detail.value }) },
  onContactPhoneInput(e) { this.setData({ contactPhone: e.detail.value }) },
  onSalaryMinInput(e) {
    this.setData({ salary: { ...this.data.salary, min: e.detail.value } })
  },
  onSalaryMaxInput(e) {
    this.setData({ salary: { ...this.data.salary, max: e.detail.value } })
  },

  // AI辅助填写
  aiHelper() {
    if (!this.data.jobName) {
      wx.showToast({ title: '请先填写职位名称', icon: 'none' })
      return
    }
    wx.showLoading({ title: 'AI生成中...' })
    setTimeout(() => {
      wx.hideLoading()
      const templates = {
        '销售': `岗位职责：
1. 负责公司产品的市场推广和销售工作
2. 开发维护客户关系，完成月度销售目标
3. 收集市场信息，分析竞争对手动态

任职要求：
1. 具备良好的沟通能力和团队协作精神
2. 有销售经验者优先
3. 吃苦耐劳，责任心强`,
        default: `岗位职责：
1. 按时完成领导分配的各项工作任务
2. 积极配合团队成员协作完成工作
3. 不断学习提升自身专业技能

任职要求：
1. 具备相关工作经验，有责任心
2. 具备良好的沟通协调能力
3. 工作认真负责，执行力强`
      }
      const content = Object.keys(templates).find(k => this.data.jobName.includes(k))
        ? templates[this.data.jobName]
        : templates.default
      this.setData({ jobDesc: content })
    }, 1500)
  },

  // 选择薪资单位
  selectSalaryUnit(e) {
    this.setData({ salary: { ...this.data.salary, unit: e.currentTarget.dataset.unit } })
  },

  // 选择经验要求
  selectExperience(e) {
    this.setData({ experience: e.currentTarget.dataset.val })
  },

  // 选择学历要求
  selectEducation(e) {
    this.setData({ education: e.currentTarget.dataset.val })
  },

  // 选择福利
  toggleWelfare(e) {
    const item = e.currentTarget.dataset.item
    let welfare = [...this.data.welfare]
    const index = welfare.indexOf(item)
    if (index > -1) {
      welfare.splice(index, 1)
    } else {
      welfare.push(item)
    }
    this.setData({ welfare })
  },

  onHeadcountInput(e) { this.setData({ headcount: e.detail.value }) },

  // 下一步
  nextStep() {
    if (!this.data.jobName.trim()) {
      wx.showToast({ title: '请填写职位名称', icon: 'none' })
      return
    }
    this.setData({ step: 2 })
    wx.pageScrollTo({ scrollTop: 0 })
  },

  // 上一步
  prevStep() {
    this.setData({ step: 1 })
    wx.pageScrollTo({ scrollTop: 0 })
  },

  // 提交发布
  submitPublish() {
    if (!this.data.salary.min || !this.data.salary.max) {
      wx.showToast({ title: '请填写薪资范围', icon: 'none' })
      return
    }
    if (!this.data.contactName || !this.data.contactPhone) {
      wx.showToast({ title: '请填写联系方式', icon: 'none' })
      return
    }
    wx.showLoading({ title: '发布中...' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '发布成功！', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }, 1500)
  }
})
