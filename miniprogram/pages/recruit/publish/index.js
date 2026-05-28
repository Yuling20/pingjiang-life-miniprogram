// pages/recruit/publish/index.js
Page({
  data: {
    jobTitle: '',
    company: '',
    salary: '',
    salaryUnit: '月',
    jobType: '',
    experience: '',
    education: '',
    address: '',
    desc: '',
    welfare: [],
    contact: '',
    welfareList: ['五险一金', '包住', '包吃', '节日福利', '带薪年假', '弹性工作', '周末双休', '绩效奖金'],
    jobTypeList: ['全职', '兼职', '实习', '临时工'],
    experienceList: ['经验不限', '1年以下', '1-3年', '3-5年', '5年以上'],
    educationList: ['学历不限', '初中及以下', '高中/中专', '大专', '本科', '本科以上'],
    showJobTypePicker: false,
    showExperiencePicker: false,
    showEducationPicker: false,
    jobTypeIndex: 0,
    experienceIndex: 0,
    educationIndex: 0,
    submitting: false
  },

  onLoad() {},

  showPicker(e) {
    const type = e.currentTarget.dataset.type
    const map = {
      jobType: 'showJobTypePicker',
      experience: 'showExperiencePicker',
      education: 'showEducationPicker'
    }
    if (map[type]) this.setData({ [map[type]]: true })
  },

  hidePicker(e) {
    const type = e.currentTarget.dataset.type
    const map = {
      jobType: 'showJobTypePicker',
      experience: 'showExperiencePicker',
      education: 'showEducationPicker'
    }
    if (map[type]) this.setData({ [map[type]]: false })
  },

  onPickerChange(e) {
    const type = e.currentTarget.dataset.type
    const index = e.detail.value
    const listMap = {
      jobType: 'jobTypeList',
      experience: 'experienceList',
      education: 'educationList'
    }
    const indexMap = {
      jobType: 'jobTypeIndex',
      experience: 'experienceIndex',
      education: 'educationIndex'
    }
    const list = this.data[listMap[type]]
    const key = type.charAt(0).toUpperCase() + type.slice(1)
    this.setData({
      [type]: list[index],
      [indexMap[type]]: index,
      [`show${key}Picker`]: false
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  toggleWelfare(e) {
    const item = e.currentTarget.dataset.item
    let welfare = [...this.data.welfare]
    const idx = welfare.indexOf(item)
    if (idx > -1) {
      welfare.splice(idx, 1)
    } else {
      if (welfare.length >= 6) {
        wx.showToast({ title: '最多选6个福利', icon: 'none' })
        return
      }
      welfare.push(item)
    }
    this.setData({ welfare })
  },

  submitForm() {
    const { jobTitle, company, salary, jobType, address, desc, contact, submitting } = this.data

    if (submitting) return
    if (!jobTitle) return wx.showToast({ title: '请填写职位名称', icon: 'none' })
    if (!salary) return wx.showToast({ title: '请填写薪资', icon: 'none' })
    if (!jobType) return wx.showToast({ title: '请选择工作类型', icon: 'none' })
    if (!address) return wx.showToast({ title: '请填写工作地点', icon: 'none' })
    if (!desc) return wx.showToast({ title: '请填写职位描述', icon: 'none' })
    if (!contact) return wx.showToast({ title: '请填写联系方式', icon: 'none' })

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...' })

    setTimeout(() => {
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({ title: '发布成功！', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }, 1500)
  }
})
