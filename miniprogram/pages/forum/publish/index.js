// pages/forum/publish/index.js
Page({
  data: {
    title: '',
    content: '',
    category: '',
    images: [],
    categoryList: ['随手拍', '求助互助', '二手转让', '生活百科', '美食推荐', '房屋租赁', '招聘求职', '其他'],
    showCategoryPicker: false,
    categoryIndex: 0,
    submitting: false,
    anonymous: false
  },

  onLoad() {},

  showCategoryPicker() {
    this.setData({ showCategoryPicker: true })
  },

  hideCategoryPicker() {
    this.setData({ showCategoryPicker: false })
  },

  onCategoryChange(e) {
    const index = e.detail.value
    this.setData({
      category: this.data.categoryList[index],
      categoryIndex: index,
      showCategoryPicker: false
    })
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [field]: e.detail.value })
  },

  toggleAnonymous() {
    this.setData({ anonymous: !this.data.anonymous })
  },

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

  deleteImage(e) {
    const index = e.currentTarget.dataset.index
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  previewImage(e) {
    wx.previewImage({
      current: this.data.images[e.currentTarget.dataset.index],
      urls: this.data.images
    })
  },

  submitPost() {
    const { title, content, category, submitting } = this.data

    if (submitting) return
    if (!category) return wx.showToast({ title: '请选择帖子分类', icon: 'none' })
    if (!title.trim()) return wx.showToast({ title: '请填写标题', icon: 'none' })
    if (!content.trim()) return wx.showToast({ title: '请填写内容', icon: 'none' })
    if (content.length < 10) return wx.showToast({ title: '内容至少10个字', icon: 'none' })

    this.setData({ submitting: true })
    wx.showLoading({ title: '发布中...' })

    setTimeout(() => {
      wx.hideLoading()
      this.setData({ submitting: false })
      wx.showToast({ title: '发帖成功！', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1500)
    }, 1500)
  }
})
