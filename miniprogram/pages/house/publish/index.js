// pages/house/publish/index.js
Page({
  data: {
    houseType: '',
    rentType: '',
    area: '',
    price: '',
    floor: '',
    totalFloor: '',
    toward: '',
    decoration: '',
    address: '',
    title: '',
    desc: '',
    images: [],
    contact: '',
    houseTypeList: ['整租', '合租', '求租'],
    rentTypeList: ['月租', '季租', '年租', '出售'],
    towardList: ['东', '南', '西', '北', '东南', '东北', '西南', '西北'],
    decorationList: ['毛坯', '简装', '中装', '精装', '豪装'],
    showHouseTypePicker: false,
    showRentTypePicker: false,
    showTowardPicker: false,
    showDecorationPicker: false,
    houseTypeIndex: 0,
    rentTypeIndex: 0,
    towardIndex: 0,
    decorationIndex: 0,
    submitting: false
  },

  onLoad() {
    // 获取用户联系方式
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.phone) {
      this.setData({ contact: userInfo.phone })
    }
  },

  // 选择器相关
  showPicker(e) {
    const type = e.currentTarget.dataset.type
    const map = {
      houseType: 'showHouseTypePicker',
      rentType: 'showRentTypePicker',
      toward: 'showTowardPicker',
      decoration: 'showDecorationPicker'
    }
    if (map[type]) {
      this.setData({ [map[type]]: true })
    }
  },

  hidePicker(e) {
    const type = e.currentTarget.dataset.type
    const map = {
      houseType: 'showHouseTypePicker',
      rentType: 'showRentTypePicker',
      toward: 'showTowardPicker',
      decoration: 'showDecorationPicker'
    }
    if (map[type]) {
      this.setData({ [map[type]]: false })
    }
  },

  onPickerChange(e) {
    const type = e.currentTarget.dataset.type
    const index = e.detail.value
    const listMap = {
      houseType: 'houseTypeList',
      rentType: 'rentTypeList',
      toward: 'towardList',
      decoration: 'decorationList'
    }
    const indexMap = {
      houseType: 'houseTypeIndex',
      rentType: 'rentTypeIndex',
      toward: 'towardIndex',
      decoration: 'decorationIndex'
    }
    const list = this.data[listMap[type]]
    this.setData({
      [type]: list[index],
      [indexMap[type]]: index,
      [`show${type.charAt(0).toUpperCase() + type.slice(1)}Picker`]: false
    })
  },

  // 输入处理
  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  // 上传图片
  chooseImage() {
    const currentCount = this.data.images.length
    if (currentCount >= 9) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: 9 - currentCount,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        this.setData({ images: [...this.data.images, ...newImages] })
      }
    })
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index
    wx.previewImage({
      current: this.data.images[index],
      urls: this.data.images
    })
  },

  // 提交表单
  submitForm() {
    const { houseType, rentType, area, price, address, title, desc, contact, images, submitting } = this.data

    if (submitting) return

    if (!houseType) return wx.showToast({ title: '请选择房屋类型', icon: 'none' })
    if (!title) return wx.showToast({ title: '请填写标题', icon: 'none' })
    if (!area) return wx.showToast({ title: '请填写面积', icon: 'none' })
    if (!price) return wx.showToast({ title: '请填写价格', icon: 'none' })
    if (!address) return wx.showToast({ title: '请填写地址', icon: 'none' })
    if (!desc) return wx.showToast({ title: '请填写房源描述', icon: 'none' })
    if (!contact) return wx.showToast({ title: '请填写联系方式', icon: 'none' })
    if (images.length === 0) return wx.showToast({ title: '请至少上传1张图片', icon: 'none' })

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...' })

    // 模拟提交（实际项目替换为云函数调用）
    setTimeout(() => {
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({ title: '发布成功！', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }, 1500)
  },

  // 保存草稿
  saveDraft() {
    const draft = {
      houseType: this.data.houseType,
      rentType: this.data.rentType,
      area: this.data.area,
      price: this.data.price,
      address: this.data.address,
      title: this.data.title,
      desc: this.data.desc,
      contact: this.data.contact,
      saveTime: new Date().toLocaleString()
    }
    wx.setStorageSync('houseDraft', draft)
    wx.showToast({ title: '草稿已保存', icon: 'success' })
  }
})
