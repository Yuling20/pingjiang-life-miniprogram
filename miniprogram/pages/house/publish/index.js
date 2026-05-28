// pages/house/publish/index.js
Page({
  data: {
    rentType: 'whole', // whole:整租 shared:合租
    
    // 基础信息
    cityName: '平江县',
    communityName: '',
    area: '',
    layout: '',
    layoutOptions: ['一室', '两室', '三室', '四室及以上'],
    direction: '',
    directionOptions: ['朝南', '朝北', '朝东', '朝西', '南北通透', '东西通透'],
    moveInTime: '随时入住',
    moveInOptions: ['随时入住', '一个月内', '两个月内', '待定'],
    rentPrice: '',
    payType: '',
    payTypeOptions: ['押一付一', '押一付三', '押二付一', '押二付三', '年付'],
    
    // 展示信息
    images: [],
    selectedTags: [],
    commonTags: ['精装修', '可短租', '近学校', '近医院', '近市场', '拎包入住', '有电梯', '停车位', '宠物友好', '独立卫浴', '带阳台', '朝南采光好'],
    description: '',
    
    // 平台验真
    buildingNo: '',
    floor: '',
    
    // 其他信息
    showTime: '',
    showTimeOptions: ['任意时间', '工作日', '周末', '提前预约'],
    includedFees: [],
    feeOptions: ['水费', '电费', '燃气费', '宽带费', '物业费', '暖气费'],
    landlordType: '',
    landlordOptions: ['个人房东', '中介', '机构公寓'],
    
    agreed: false
  },

  selectRentType(e) { this.setData({ rentType: e.currentTarget.dataset.type }) },
  
  onCommunityInput(e) { this.setData({ communityName: e.detail.value }) },
  onAreaInput(e) { this.setData({ area: e.detail.value }) },
  onRentPriceInput(e) { this.setData({ rentPrice: e.detail.value }) },
  onBuildingInput(e) { this.setData({ buildingNo: e.detail.value }) },
  onFloorInput(e) { this.setData({ floor: e.detail.value }) },
  onDescInput(e) { this.setData({ description: e.detail.value }) },

  selectLayout(e) { this.setData({ layout: e.currentTarget.dataset.val }) },
  selectDirection(e) { this.setData({ direction: e.currentTarget.dataset.val }) },
  selectMoveIn(e) { this.setData({ moveInTime: e.currentTarget.dataset.val }) },
  selectPayType(e) { this.setData({ payType: e.currentTarget.dataset.val }) },
  selectShowTime(e) { this.setData({ showTime: e.currentTarget.dataset.val }) },
  selectLandlordType(e) { this.setData({ landlordType: e.currentTarget.dataset.val }) },

  toggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    let tags = [...this.data.selectedTags]
    const i = tags.indexOf(tag)
    if (i > -1) tags.splice(i, 1)
    else if (tags.length < 5) tags.push(tag)
    else wx.showToast({ title: '最多选择5个标签', icon: 'none' })
    this.setData({ selectedTags: tags })
  },

  toggleFee(e) {
    const fee = e.currentTarget.dataset.fee
    let fees = [...this.data.includedFees]
    const i = fees.indexOf(fee)
    if (i > -1) fees.splice(i, 1)
    else fees.push(fee)
    this.setData({ includedFees: fees })
  },

  // 上传图片
  addImage() {
    const remain = 10 - this.data.images.length
    if (remain <= 0) {
      wx.showToast({ title: '最多上传10张图片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImgs = res.tempFiles.map(f => ({ url: f.tempFilePath }))
        this.setData({ images: [...this.data.images, ...newImgs] })
      }
    })
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  toggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  // 提交
  submitPublish() {
    const { communityName, area, layout, rentPrice, payType, agreed } = this.data
    if (!communityName) { wx.showToast({ title: '请填写所在小区', icon: 'none' }); return }
    if (!area) { wx.showToast({ title: '请填写房屋面积', icon: 'none' }); return }
    if (!layout) { wx.showToast({ title: '请选择房屋户型', icon: 'none' }); return }
    if (!rentPrice) { wx.showToast({ title: '请填写期望租金', icon: 'none' }); return }
    if (!payType) { wx.showToast({ title: '请选择付款方式', icon: 'none' }); return }
    if (!agreed) { wx.showToast({ title: '请先同意服务协议', icon: 'none' }); return }

    wx.showLoading({ title: '发布中...' })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '发布成功！', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }, 1500)
  }
})
