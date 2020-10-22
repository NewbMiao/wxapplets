import { getHDAvatarUrl } from './utils'

const app = getApp()
const size = 640;
// const device = wx.getSystemInfoSync();
// const devicePixelRatio = device.pixelRatio;
Page({
  data: {
    toViewFlag: "",
    avatarPath: "",
    flagPath: "",
    renderPath: "",
    flagImgs: [
      "https://qnlite.gtimg.com/qqnewslite/20190924/avatar/head1.png",
      "https://qnlite.gtimg.com/qqnewslite/20190924/avatar/head2.png",
      "https://qnlite.gtimg.com/qqnewslite/20190924/avatar/head3.png",
      "https://qnlite.gtimg.com/qqnewslite/20190924/avatar/head4.png",
      "https://qnlite.gtimg.com/qqnewslite/20190924/avatar/panda1.png"
    ]
  },
  onLoad: function () {
    let that = this;
    that.context = wx.createCanvasContext('avatarCanvas');

    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              that.setAvatarPath(res.userInfo.avatarUrl);
              console.log("已授权，获取头像成功")
            }
          })
        }
      }
    })
  },
  setAvatarPath: function (url) {
    let that = this,
      HDUrl = getHDAvatarUrl(url);
    wx.getImageInfo({
      src: HDUrl,
      success: function (res) {
        that.setData({
          avatarPath: res.path,
        })
      },
      fail: function (res) {
        console.error(res)
        app.showTextToast('解析头像失败，请重试')
      }
    })
  },
  bindUserInfo: function (e) {
    this.setAvatarPath(e.detail.userInfo.avatarUrl);
  },
  chgFlag: function (e) {
    const that = this,
      fUrl = e.target.dataset.url,
      fKey = e.target.id;
    if (!that.data.avatarPath) {
      app.showTextToast('请先授权获取头像...')
      return;
    }
    wx.getImageInfo({
      src: fUrl,
      success: function (res) {
        that.setData({
          flagPath: res.path,
          toViewFlag: fKey,
        })
        that.renderAvatar();
      },
      fail: function (res) {
        console.error(res)
        app.showTextToast('获取相框图片失败，请重试')
      }
    })
  },
  clearImg: function () {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确认要清除当前图片么？',
      success(res) {
        if (res.confirm) {
          that.setData({
            flagPath: '',
            avatarPath: '',
            renderPath: ''
          })
          app.showTextToast('清除成功')
        }
      }
    })
  },
  renderAvatar: function () {
    let that = this,
      context = this.context;
    // draw image (use local path)
    wx.showLoading({
      title: '生成中...',
    })
    context.drawImage(that.data.avatarPath, 0, 0, size, size);
    context.drawImage(that.data.flagPath, 0, 0, size, size);
    context.draw(false, function () {
      setTimeout(function () {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: size,
          height: size,
          // destWidth: size * devicePixelRatio,
          // destHeight: size * devicePixelRatio,
          canvasId: 'avatarCanvas',
          success(res) {
            that.setData({
              renderPath: res.tempFilePath,
            })
          },
          fail: function (e) {
            console.error(e)
            app.showTextToast('生成头像失败，请重试')
          },
          complete: function (e) {
            wx.hideLoading()
          }
        })
      }, 500)
    })

  },
  saveAvatar: function () {
    let that = this;
    if (!that.data.renderPath) {
      app.showTextToast('还没有生成头像哦！')
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath: that.data.renderPath,
      success(res) {
        app.showTextToast('保存成功')
      }
    })
  },
  uploadPhoto: function (e) {
    wx.navigateTo({
      url: '/crop/crop?w=320&h=320'
    })
  },
  onShareAppMessage: function () {
    return {
      title: '有人@你: 推荐一个好玩的小程序！',
      path: '/index/index',
      imageUrl: './share.png'
    }
  },
  onShareTimeline: function () {
    return {
      title: '给你推荐一个好玩的小程序！',
      query: '/index/index',
      imageUrl: './share.png'
    }
  }
})
