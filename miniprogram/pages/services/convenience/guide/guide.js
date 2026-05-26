// miniprogram/pages/services/convenience/guide/guide.js
Page({
  data: {
    guideList: [
      {
        id: 1,
        category: '政务服务',
        icon: '🏛️',
        items: [
          {
            id: 11,
            name: '湖南政务服务网',
            desc: '户籍、社保、营业执照等办理',
            icon: '📋',
            url: 'https://www.hnzwfw.gov.cn',
            tag: '常用'
          },
          {
            id: 12,
            name: '平江县政府官网',
            desc: '政策文件、公告通知查询',
            icon: '🏢',
            url: 'https://www.pingjiang.gov.cn',
            tag: ''
          },
          {
            id: 13,
            name: '国家政务服务平台',
            desc: '身份证、驾照、出生证明等',
            icon: '🪪',
            url: 'https://www.gjzwfw.gov.cn',
            tag: '常用'
          }
        ]
      },
      {
        id: 2,
        category: '社保医保',
        icon: '🏥',
        items: [
          {
            id: 21,
            name: '湖南医保服务平台',
            desc: '医保查询、异地就医备案',
            icon: '💊',
            url: 'https://ybj.hunan.gov.cn',
            tag: '常用'
          },
          {
            id: 22,
            name: '社会保险网上服务',
            desc: '养老、失业、工伤保险查询',
            icon: '👴',
            url: 'https://si.12333.gov.cn',
            tag: ''
          }
        ]
      },
      {
        id: 3,
        category: '公积金 & 税务',
        icon: '💰',
        items: [
          {
            id: 31,
            name: '岳阳住房公积金',
            desc: '公积金查询、提取、贷款办理',
            icon: '🏠',
            url: 'https://gjj.yueyang.gov.cn',
            tag: ''
          },
          {
            id: 32,
            name: '湖南电子税务局',
            desc: '个税申报、发票查验',
            icon: '🧾',
            url: 'https://etax.hunan.chinatax.gov.cn',
            tag: ''
          }
        ]
      },
      {
        id: 4,
        category: '证件办理',
        icon: '🪪',
        items: [
          {
            id: 41,
            name: '驾驶证业务办理',
            desc: '驾照申请、审验、补换证',
            icon: '🚗',
            url: 'https://dlzs.mps.gov.cn',
            tag: '常用'
          },
          {
            id: 42,
            name: '不动产登记查询',
            desc: '房产证、土地证信息查询',
            icon: '📜',
            url: 'https://bdcdjxx.mnr.gov.cn',
            tag: ''
          }
        ]
      }
    ]
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '办事指南' });
  },

  goToGuide(e) {
    const { url, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/common/webview/webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent(name)}`
    });
  },

  // 复制链接备用
  copyLink(e) {
    const { url } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: url,
      success() {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  }
});
