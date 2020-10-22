App({
  onLaunch: function () {

  },
  showTextToast: function (text) {
    wx.showToast({
      title: text,
      icon: 'none',
      duration: 1000,
    })
  },
})
