// pages/services/convenience/rental/rental.js

Page({
  data: {
    // ══════════════ 列表页原有数据 ══════════════
    activeArea: '全部区域',
    activeType: '全部',
    areas: ['全部区域', '城关镇', '三阳乡', '安定镇', '嘉义镇', '其他'],
    types: ['全部', '整租', '合租', '商辅'],
    houseList: [
      {
        id: 1,
        title: '平江老街附近2室1厅整租',
        type: '整租',
        isVip: true,
        price: 2200,
        room: '2室1厅/1卫',
        area: '平江区平江路附近',
        desc: '房屋干净整洁，家具家电齐全，拎包入住。楼层适中，采光好，交通便利。',
        tags: ['拎包入住', '近菜场', '有停车'],
        contact: '13800138001',
        virtualPhone: '400-xxx-0001', // VIP虚拟号
        publishTime: '今天',
        images: []
      },
      {
        id: 2,
        title: '无途径个人房单间，近菜市场',
        type: '合租',
        isVip: false,
        price: 800,
        room: '1室/1卫',
        area: '平江县城中心',
        desc: '个人出租，干净整洁，近菜市场，生活方便。',
        tags: ['近菜场', '采光好'],
        contact: '',
        publishTime: '昨天',
        images: []
      }
    ],
    filteredList: [],

    // ══════════════ 发布弹窗数据 ══════════════
    showPublishModal: false,    // 发布弹窗
    showTagModal: false,        // 标签选择弹窗
    showAgreementAlert: false,  // 协议弹窗

    // 出租方式
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
      agreed: false
    },
    descCount: 0,

    // 表单选项
    roomTypeOptions: ['一室', '一室一厅', '两室一厅', '两室两厅', '三室一厅', '三室两厅', '四室及以上', '单间', '商铺'],
    directionOptions: ['东', '南', '西', '北', '东南', '东北', '西南', '西北'],
    moveInOptions: ['随时可入住', '一周内', '半月内', '一月内', '自定义'],
    payTypeOptions: ['押一付一', '押一付三', '押二付一', '押二付三', '月付', '季付', '半年付', '年付'],

    // 预设标签池
    allTags: [
      '拎包入住', '近菜场', '有停车', '采光好', '押一付一',
      '家电齐全', '独立卫生间', '近学校', '近医院', '近公交',
      '电梯房', '低楼层', '高楼层', '南北通透', '精装修',
      '简装修', '可养宠', '可做饭', '有空调', '有暖气',
      '有网络', '近超市', '近地铁', '安静', '新装修',
      '带阳台', '近公园'
    ],

    // 发布状态
    isPublishing: false
  },

  onLoad() {
    this._filterList()
  },

  // ══════════════ 列表页原有逻辑 ══════════════
  onAreaTab(e) {
    const area = e.currentTarget.dataset.area
    this.setData({ activeArea: area })
    this._filterList()
  },

  onTypeTab(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ activeType: type })
    this._filterList()
  },

  _filterList() {
    const { houseList, activeArea, activeType } = this.data
    let list = houseList.filter(item => {
      const areaMatch = activeArea === '全部区域' || item.area.includes(activeArea)
      const typeMatch = activeType === '全部' || item.type === activeType
      return areaMatch && typeMatch
    })
    this.setData({ filteredList: list })
  },

  onContact(e) {
    const item = e.currentTarget.dataset.item
    if (item.isVip) {
      wx.makePhoneCall({
        phoneNumber: item.virtualPhone || item.contact,
        fail: () => wx.showToast({ title: '拨号失败', icon: 'none' })
      })
    } else {
      wx.showModal({
        title: '平台内沟通',
        content: '该房东暂未开通VIP，无法直接获取联系方式，请通过平台内沟通功能联系。',
        confirmText: '发起沟通',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: '消息功能开发中', icon: 'none' })
          }
        }
      })
    }
  },

  // ══════════════ 发布房源入口 ══════════════
  onPublishHouse() {
    // 检查实名认证
    try {
      const raw = wx.getStorageSync('userRealNameInfo')
      const info = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null
      if (!info || !info.verified) {
        wx.showModal({
          title: '需要实名认证',
          content: '发布房源需完成实名认证，请前往「我的」页面完成认证后再发布。',
          confirmText: '去认证',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({ url: '/pages/mine/mine' })
            }
          }
        })
        return
      }
    } catch (e) {
      wx.showModal({
        title: '需要实名认证',
        content: '发布房源需完成实名认证，请前往「我的」页面完成认证后再发布。',
        confirmText: '去认证',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) wx.switchTab({ url: '/pages/mine/mine' })
        }
      })
      return
    }

    // 已实名，重置表单并打开弹窗
    this.setData({
      showPublishModal: true,
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
        agreed: false
      },
      descCount: 0,
      isPublishing: false
    })
  },

  onClosePublish() {
    wx.showModal({
      title: '提示',
      content: '确认放弃本次发布？已填写的内容将不会保存。',
      confirmText: '放弃',
      cancelText: '继续填写',
      success: (res) => {
        if (res.confirm) {
          this.setData({ showPublishModal: false })
        }
      }
    })
  },

  // 阻止弹窗内容区滚动穿透
  onModalContentTap() { },

  // ══════════════ 出租方式切换 ══════════════
  onRentTypeChange(e) {
    this.setData({ 'publishForm.rentType': e.currentTarget.dataset.type })
  },

  // ══════════════ 表单输入 ══════════════
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

  // ══════════════ Picker 选择 ══════════════
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

  // ══════════════ 图片上传 ══════════════
  onChooseImage() {
    const current = this.data.publishForm.images.length
    const remain = 9 - current
    if (remain <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' }); return
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

  // ══════════════ 标签管理 ══════════════
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
        wx.showToast({ title: '最多选择10个标签', icon: 'none' }); return
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

  // ══════════════ 协议勾选 ══════════════
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

  // ══════════════ 表单校验与提交 ══════════════
  _validateForm() {
    const f = this.data.publishForm
    if (!f.city || !f.city.trim()) { wx.showToast({ title: '请填写所在城市', icon: 'none' }); return false }
    if (!f.community || !f.community.trim()) { wx.showToast({ title: '请填写所在小区', icon: 'none' }); return false }
    if (!f.area || !f.area.trim()) { wx.showToast({ title: '请填写房屋面积', icon: 'none' }); return false }
    if (!f.roomType) { wx.showToast({ title: '请选择房屋户型', icon: 'none' }); return false }
    if (!f.direction) { wx.showToast({ title: '请选择房屋朝向', icon: 'none' }); return false }
    if (!f.moveInTime) { wx.showToast({ title: '请选择入住时间', icon: 'none' }); return false }
    if (!f.price || !f.price.trim()) { wx.showToast({ title: '请填写期望租金', icon: 'none' }); return false }
    if (!f.payType) { wx.showToast({ title: '请选择付款方式', icon: 'none' }); return false }
    if (!f.agreed) { wx.showToast({ title: '请先同意服务协议', icon: 'none' }); return false }
    return true
  },

  onSubmitPublish() {
    if (!this._validateForm()) return

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

    // 模拟发布请求（后端预留接口）
    // TODO: 替换为真实API: wx.request({ url: 'https://api.example.com/rental/publish', ... })
    setTimeout(() => {
      const f = this.data.publishForm
      const newItem = {
        id: Date.now(),
        title: `${f.community} ${f.roomType} ${f.rentType}`,
        type: f.rentType,
        isVip: false,
        price: parseInt(f.price) || 0,
        room: `${f.roomType}/1卫`,
        area: `${f.city} ${f.community}`,
        desc: f.desc || '房源描述待完善',
        tags: f.tags,
        contact: '',
        publishTime: '刚刚',
        images: f.images
      }

      const houseList = [newItem, ...this.data.houseList]
      this.setData({
        houseList,
        isPublishing: false,
        showPublishModal: false
      })
      this._filterList()

      wx.showToast({ title: '发布成功！', icon: 'success' })
    }, 1500)
  }
})
