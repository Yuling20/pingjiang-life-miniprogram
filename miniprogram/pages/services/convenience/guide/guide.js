// pages/services/convenience/guide/guide.js
Page({
  data: {
    services: [
      {
        id: 1,
        title: '补办身份证',
        desc: '身份证丢失/损坏补办，网上申请指引',
        icon: '🪪',
        tag: '证件',
        type: 'web',
        url: 'https://zwfw.mps.gov.cn',
        phone: '0730-6822110',
        webTitle: '公安部网上服务'
      },
      {
        id: 2,
        title: '驾驶证业务办理',
        desc: '驾照申请、审验、补换证、违章查询',
        icon: '🚗',
        tag: '车驾管',
        type: 'web',
        url: 'https://www.122.gov.cn',
        phone: '0730-6822122',
        webTitle: '交通管理服务平台'
      },
      {
        id: 3,
        title: '社会保险查询',
        desc: '社保参保、缴费记录、个人账户查询',
        icon: '🛡️',
        tag: '社保',
        type: 'phone',
        url: '',
        phone: '0730-6822333',
        appTip: '下载「湘人社」APP或「国家社会保险公共服务平台」小程序查询',
        phoneTip: '也可拨打社保服务热线查询'
      },
      {
        id: 4,
        title: '住房公积金查询',
        desc: '公积金缴存、提取、贷款查询办理',
        icon: '🏠',
        tag: '公积金',
        type: 'web',
        url: 'https://gjj.yueyang.gov.cn',
        phone: '0730-6822444',
        webTitle: '岳阳住房公积金'
      },
      {
        id: 5,
        title: '税务办税服务',
        desc: '个人所得税、发票申请、税务登记',
        icon: '🧾',
        tag: '税务',
        type: 'web',
        url: 'https://etax.chinatax.gov.cn',
        phone: '12366',
        webTitle: '电子税务局'
      },
      {
        id: 6,
        title: '医疗保障查询',
        desc: '医保参保、报销查询、异地就医备案',
        icon: '💊',
        tag: '医保',
        type: 'phone',
        url: '',
        phone: '0730-6822555',
        appTip: '微信搜索「国家医保服务平台」小程序，或下载同名APP查询',
        phoneTip: '也可拨打平江医保局热线'
      },
      {
        id: 7,
        title: '平江县人民政府政务网',
        desc: '政务公开、审批查询、便民服务入口',
        icon: '🏛️',
        tag: '政务',
        type: 'web',
        url: 'https://www.pingjiang.gov.cn',
        phone: '0730-6822000',
        webTitle: '平江县人民政府'
      },
      {
        id: 8,
        title: '不动产登记查询',
        desc: '房产证办理、土地证、产权过户',
        icon: '🏡',
        tag: '不动产',
        type: 'phone',
        url: '',
        phone: '0730-6822666',
        appTip: '微信搜索「不动产登记」小程序，或携带证件到平江县不动产登记中心办理',
        phoneTip: '可先拨打电话预约，节省排队时间'
      }
    ]
  },

  goToService(e) {
    const item = e.currentTarget.dataset.item;

    if (item.type === 'web') {
      // 可以访问的网站 → 直接跳转webview
      wx.navigateTo({
        url: `/pages/common/webview/webview?url=${encodeURIComponent(item.url)}&title=${encodeURIComponent(item.webTitle || item.title)}`,
        fail: () => {
          // 跳转失败则复制链接
          this.showCopyModal(item);
        }
      });
    } else {
      // 无法访问的网站 → 弹出APP指引+拨号
      this.showPhoneModal(item);
    }
  },

  // 网站跳转失败时的弹窗
  showCopyModal(item) {
    wx.showModal({
      title: '📋 ' + item.title,
      content: '点击"复制网址"后在手机浏览器粘贴访问\n或拨打服务热线：' + item.phone,
      confirmText: '复制网址',
      cancelText: '拨打电话',
      success(res) {
        if (res.confirm) {
          wx.setClipboardData({
            data: item.url,
            success() {
              wx.showToast({ title: '网址已复制，请打开浏览器粘贴', icon: 'none', duration: 2500 });
            }
          });
        } else if (res.cancel) {
          wx.makePhoneCall({ phoneNumber: item.phone });
        }
      }
    });
  },

  // 需要APP/现场办理的弹窗
  showPhoneModal(item) {
    wx.showModal({
      title: '📋 ' + item.title,
      content: '💡 ' + item.appTip + '\n\n📞 ' + item.phoneTip + '：' + item.phone,
      confirmText: '拨打热线',
      cancelText: '知道了',
      success(res) {
        if (res.confirm) {
          wx.makePhoneCall({ phoneNumber: item.phone });
        }
      }
    });
  }
});
