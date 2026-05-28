// pages/forum/publish/index.js
Page({
  data: {
    content: '',
    images: [],
    selectedTag: '',
    tags: ['日常', '美食', '租房', '招聘', '旅游', '求助', '二手', '公告'],
    maxLength: 500,
    contentLength: 0,
    isPublishing: false,
    showTagPicker: false
  },

  onLoad: function() {},

  // 内容输入
  onContentInput: function(e) {
    var value = e.detail.value;
    this.setData({
      content: value,
      contentLength: value.length
    });
  },

  // 选择图片
  chooseImage: function() {
    var self = this;
    var remaining = 9 - this.data.images.length;
    if (remaining <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: remaining,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var newImages = self.data.images.concat(
          res.tempFiles.map(function(f) { return f.tempFilePath; })
        );
        self.setData({ images: newImages });
      }
    });
  },

  // 删除图片
  deleteImage: function(e) {
    var index = e.currentTarget.dataset.index;
    var images = this.data.images.slice();
    images.splice(index, 1);
    this.setData({ images: images });
  },

  // 选择标签
  selectTag: function(e) {
    var tag = e.currentTarget.dataset.tag;
    this.setData({
      selectedTag: this.data.selectedTag === tag ? '' : tag,
      showTagPicker: false
    });
  },

  // 显示标签选择器
  toggleTagPicker: function() {
    this.setData({ showTagPicker: !this.data.showTagPicker });
  },

  // 发布帖子
  publish: function() {
    var self = this;
    if (!this.data.content.trim()) {
      wx.showToast({ title: '请输入帖子内容', icon: 'none' });
      return;
    }
    if (this.data.content.trim().length < 5) {
      wx.showToast({ title: '内容太短啦，至少5个字', icon: 'none' });
      return;
    }
    this.setData({ isPublishing: true });

    // 模拟发布请求
    setTimeout(function() {
      self.setData({ isPublishing: false });
      wx.showToast({ title: '发布成功！', icon: 'success' });
      setTimeout(function() {
        wx.navigateBack();
      }, 1200);
    }, 1500);
  },

  // 返回
  goBack: function() {
    if (this.data.content || this.data.images.length > 0) {
      var self = this;
      wx.showModal({
        title: '确认离开',
        content: '内容尚未发布，确定要离开吗？',
        confirmText: '离开',
        cancelText: '继续写',
        success: function(res) {
          if (res.confirm) wx.navigateBack();
        }
      });
    } else {
      wx.navigateBack();
    }
  }
});
