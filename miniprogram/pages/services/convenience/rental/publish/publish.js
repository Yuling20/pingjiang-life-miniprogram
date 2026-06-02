// pages/services/convenience/rental/publish/publish.js
Page({
  data: {
    showTagModal: false,
    showAgreementAlert: false,
    rentTypes: ['整租', '合租', '商辅'],
    publishForm: {
      rentType: '整租',
      city: '平江县',
      community: '',
      area: '',
      roomType: '',
      direction: '',
      moveInTime: '',
      price: '',
      payType: '',
      images: [],
      tags: [],
      desc: '',
      agreed: false,
      isVipHouse: false
    },
    descCount: 0,
    roomTypeOptions: ['一室', '一室一厅', '两室一厅', '两室两厅', '三室一厅', '三室两厅', '四室及以上', '单间', '商铺'],
    directionOptions: ['东', '南', '西', '北', '东南', '东北', '西南', '西北'],
    moveInOptions: ['随时可入住', '一周内', '半月内', '一月内', '自定义'],
    payTypeOptions: ['押一付一', '押一付三', '押二付一', '押二付三', '月付', '季付', '半年付', '年付'],
    allTags: [
      '拎包入住', '近菜场', '有停车', '采光好', '押一付一',
      '家电齐全', '独立卫生间', '近学校', '近医院', '近公交',
      '电梯房', '低楼层', '高楼层', '南北通透', '精装修',
      '简装修', '可养宠', '可做饭', '有空调', '有暖气',
      '有网络', '近超市', '近地铁', '安静', '新装修',
      '带阳台', '近公园'
    ],
    isPublishing: false,
    
    // ====== 新增字段 ======
    selectedPackage: '', // 'basic' | 'top'
    paymentMethod: 'cash', // 'cash' | 'points'
    useCoupon: false,
    finalPrice: 0,
    finalPoints: 0,
    userPoints: 0
  },

  onLoad() {
    // 页面加载时重置表单
    this.setData({
      publishForm: {
        rentType: '整租',
        city: '平江县',
        community: '',
        area: '',
        roomType: '',
        direction: '',
        moveInTime: '',
        price: '',
        payType: '',
        images: [],
        tags: [],
        desc: '',
        agreed: false,
        isVipHouse: false
      },
      descCount: 0,
      isPublishing: false,
      selectedPackage: '',
      paymentMethod: 'cash',
      useCoupon: false,
      finalPrice: 0,
      finalPoints: 0
    })

    // ====== 新增：读取用户积分 ======
    const userPoints = wx.getStorageSync('userPoints') || 0
    this.setData({ userPoints })
  },

  // 出租方式切换
  onRentTypeChange(e) {
    this.setData({ 'publishForm.rentType': e.currentTarget.dataset.type })
  },

  // 表单输入
  onInputCity(e) {
    this.setData({ 'publishForm.city': e.detail.value })
  },
  onInputCommunity(e) {
    this.setData({ 'publishForm.community': e.detail.value })
  },
  onInputArea(e) {
    this.setData({ 'publishForm.area': e.detail.value })
  },
  onInputPrice(e) {
    this.setData({ 'publishForm.price': e.detail.value })
  },
  onInputDesc(e) {
    const val = e.detail.value
    this.setData({
      'publishForm.desc': val,
      descCount: val.length
    })
  },

  // Picker选择
  onPickerRoomType(e) {
    const idx = e.detail.value
    this.setData({ 'publishForm.roomType': this.data.roomTypeOptions[idx] })
  },
  onPickerDirection(e) {
    const idx = e.detail.value
    this.setData({ 'publishForm.direction': this.data.directionOptions[idx] })
  },
  onPickerMoveIn(e) {
    const idx = e.detail.value
    this.setData({ 'publishForm.moveInTime': this.data.moveInOptions[idx] })
  },
  onPickerPayType(e) {
    const idx = e.detail.value
    this.setData({ 'publishForm.payType': this.data.payTypeOptions[idx] })
  },

  // 图片上传
  onChooseImage() {
    const current = this.data.publishForm.images.length
    const remain = 9 - current
    if (remain <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' })
      return
    }
    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath)
        const images = [...this.data.publishForm.images, ...newImages]
        this.setData({ 'publishForm.images': images })
      }
    })
  },
  onDeleteImage(e) {
    const idx = e.currentTarget.dataset.idx
    const images = [...this.data.publishForm.images]
    images.splice(idx, 1)
    this.setData({ 'publishForm.images': images })
  },
  onPreviewImage(e) {
    const idx = e.currentTarget.dataset.idx
    wx.previewImage({
      current: this.data.publishForm.images[idx],
      urls: this.data.publishForm.images
    })
  },

  // 标签管理
  onOpenTagModal() {
    this.setData({ showTagModal: true })
  },
  onCloseTagModal() {
    this.setData({ showTagModal: false })
  },
  onToggleTag(e) {
    const tag = e.currentTarget.dataset.tag
    let tags = [...this.data.publishForm.tags]
    const idx = tags.indexOf(tag)
    if (idx >= 0) {
      tags.splice(idx, 1)
    } else {
      if (tags.length >= 10) {
        wx.showToast({ title: '最多选择10个标签', icon: 'none' })
        return
      }
      tags.push(tag)
    }
    this.setData({ 'publishForm.tags': tags })
  },
  onRemoveTag(e) {
    const idx = e.currentTarget.dataset.idx
    const tags = [...this.data.publishForm.tags]
    tags.splice(idx, 1)
    this.setData({ 'publishForm.tags': tags })
  },

  // VIP开关切换
  onVipToggle(e) {
    this.setData({ 'publishForm.isVipHouse': e.detail.value })
  },

  // ====== 新增方法：套餐选择 ======
  selectPackage(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ selectedPackage: type }, () => {
      this.calculatePayment()
    })
  },

  // ====== 新增方法：切换支付方式 ======
  onPaymentChange(e) {
    this.setData({ paymentMethod: e.detail.value }, () => {
      this.calculatePayment()
    })
  },

  // ====== 新增方法：切换优惠券 ======
  onCouponToggle() {
    this.setData({ useCoupon: !this.data.useCoupon }, () => {
      this.calculatePayment()
    })
  },

  // ====== 新增方法：计算应付金额 ======
  calculatePayment() {
    const { selectedPackage, paymentMethod, useCoupon } = this.data

    if (!selectedPackage) {
      this.setData({ finalPrice: 0, finalPoints: 0 })
      return
    }

    const packages = {
      basic: { price: 6, points: 60 },
      top: { price: 18, points: 180 }
    }

    const pkg = packages[selectedPackage]

    if (useCoupon) {
      this.setData({ finalPrice: 0, finalPoints: 0 })
    } else {
      this.setData({
        finalPrice: paymentMethod === 'cash' ? pkg.price : 0,
        finalPoints: paymentMethod === 'points' ? pkg.points : 0
      })
    }
  },

  // 协议勾选
  onToggleAgreed() {
    this.setData({ 'publishForm.agreed': !this.data.publishForm.agreed })
  },
  onViewAgreement() {
    wx.showModal({
      title: '个人用户租房房源展示服务协议',
      content: '本协议规定了用户在平江汇生活平台发布房源的相关权利与义务。用户承诺发布信息真实有效，不得发布虚假房源、欺诈信息。平台有权对违规房源进行下架处理。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 表单校验与提交
  _validateForm() {
    const f = this.data.publishForm
    if (!f.city || !f.city.trim()) { 
      wx.showToast({ title: '请填写所在城市', icon: 'none' })
      return false 
    }
    if (!f.community || !f.community.trim()) { 
      wx.showToast({ title: '请填写所在小区', icon: 'none' })
      return false 
    }
    if (!f.area || !f.area.trim()) { 
      wx.showToast({ title: '请填写房屋面积', icon: 'none' })
      return false 
    }
    if (!f.roomType) { 
      wx.showToast({ title: '请选择房屋户型', icon: 'none' })
      return false 
    }
    if (!f.direction) { 
      wx.showToast({ title: '请选择房屋朝向', icon: 'none' })
      return false 
    }
    if (!f.moveInTime) { 
      wx.showToast({ title: '请选择入住时间', icon: 'none' })
      return false 
    }
    if (!f.price || !f.price.trim()) { 
      wx.showToast({ title: '请填写期望租金', icon: 'none' })
      return false 
    }
    if (!f.payType) { 
      wx.showToast({ title: '请选择付款方式', icon: 'none' })
      return false 
    }
    if (!f.agreed) { 
      wx.showToast({ title: '请先同意服务协议', icon: 'none' })
      return false 
    }

    // ====== 新增校验：必须选择套餐 ======
    if (!this.data.selectedPackage) {
      wx.showToast({ title: '请选择发布套餐', icon: 'none' })
      return false
    }

    return true
  },

  onSubmitPublish() {
    if (!this._validateForm()) return

    // ====== 新增校验：积分不足拦截 ======
    const { paymentMethod, useCoupon, finalPoints, userPoints } = this.data
    if (paymentMethod === 'points' && !useCoupon && finalPoints > userPoints) {
      wx.showModal({
        title: '积分不足',
        content: '签到/发帖赚积分',
        showCancel: false
      })
      return
    }

    wx.showModal({
      title: '确认发布',
      content: `将发布「${this.data.publishForm.rentType}」房源：${this.data.publishForm.community}，租金 ${this.data.publishForm.price} 元/月，确认提交吗？`,
      confirmText: '确认发布',
      success: (res) => {
        if (res.confirm) {
          this._doPublish()
        }
      }
    })
  },

  _doPublish() {
    this.setData({ isPublishing: true })

    // ====== 新增逻辑：扣除积分或发起支付 ======
    const { paymentMethod, useCoupon, finalPoints, userPoints } = this.data

    if (!useCoupon) {
      if (paymentMethod === 'points') {
        // 积分支付：扣除积分
        const newPoints = userPoints - finalPoints
        wx.setStorageSync('userPoints', newPoints)

        // 记录积分消费
        const consumeRecords = wx.getStorageSync('pointsConsumeRecords') || []
        consumeRecords.unshift({
          scene: '租房发布',
          points: -finalPoints,
          time: new Date().toISOString()
        })
        wx.setStorageSync('pointsConsumeRecords', consumeRecords)
      } else {
        // 现金支付：调用微信支付（此处为占位逻辑）
        wx.showToast({ title: '支付功能开发中', icon: 'none' })
        this.setData({ isPublishing: false })
        return
      }
    }

    // 模拟发布请求（后端预留接口）
    setTimeout(() => {
      const f = this.data.publishForm
      const newItem = {
        id: Date.now(),
        title: `${f.community} ${f.roomType} ${f.rentType}`,
        type: f.rentType,
        isVip: f.isVipHouse,
        price: parseInt(f.price) || 0,
        room: `${f.roomType}/1卫`,
        area: `${f.city} ${f.community}`,
        desc: f.desc || '房源描述待完善',
        tags: f.tags,
        contact: '',
        publishTime: '刚刚',
        images: f.images
      }

      // 这里可以调用接口，将newItem上传到服务器
      // 上传成功后返回列表页并刷新数据
      wx.showToast({ title: '发布成功！', icon: 'success' })
      setTimeout(() => {
        this.setData({ isPublishing: false })
        wx.navigateBack({ delta: 1 })
      }, 1000)
    }, 1500)
  }
})
