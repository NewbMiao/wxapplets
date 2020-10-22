import WeCropper from './we-cropper'
import {imgCheckByUpload } from './utils'

const app = getApp()
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = width
var size = { //默认值
  w: 300,
  h: 300
}

Page({
  data: {
    areaStyle: 'width:' + width + 'px;height:' + height + 'px',
    areaStyle2: 'width:200px;height:200px',
    cropperOpt: {
      id: 'cropper',
      targetId: 'cropRender',
      pixelRatio: device.pixelRatio,
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - size.w) / 2,
        y: (height - size.h) / 2,
        width: size.w,
        height: size.h
      },
      boundStyle: {
        color: '#09bb07',
        mask: 'rgba(0,0,0,0.8)',
        lineWidth: 1
      },
    }
  },
  onLoad(option) {
    // wx.hideTabBar({})
    let dcurrent = wx.getSystemInfoSync()
    let height = dcurrent.windowHeight - 50
    //更新size
    if (option.w != undefined && option.h != undefined) {
      size = option
      var cut = {
        x: (width - size.w) / 2,
        y: (height - size.h) / 2,
        width: size.w - 0,
        height: size.h - 0
      }
      this.setData({
        areaStyle: 'width:' + width + 'px;height:' + height + 'px',
        'cropperOpt.cut': cut,
        'cropperOpt.height': height,
      })
    }
    const {
      cropperOpt
    } = this.data
    this.cropper = new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
      })
      .on('beforeImageLoad', (ctx) => {
        wx.showLoading({
          title: '图片加载中...',
        })
      })
      .on('imageLoad', (ctx) => {
        wx.hideLoading()
      });
  },
  onUnload() {
    // wx.showTabBar({})
  },
  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },
  getCropperImage() {
    wx.showLoading({
      title: '截取中...',
    })
    this.cropper.getCropperImage({ original: true })
      .then((src) => {
        wx.hideLoading()
        if (!src) {
          app.showTextToast('获取图片地址失败，请稍后重试')
          return;
        }
        var pages = getCurrentPages();
        if (pages.length <= 1) {
          app.showTextToast('访问异常，请重新打开')
          return
        }
        var prevPage = pages[pages.length - 2]; //上一个页面
        prevPage.setData({
          avatarPath: src,
        })
        wx.navigateBack()
      })
  },
  uploadTap() {
    const that = this

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'],//'compressed' // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(photo) {
        that.imgCheckWithCompressedImgPath(photo)
        // var imgSrc = photo.tempFiles[0].path
        // imgCheck(imgSrc, function (isSafe) {
        //   if (isSafe) {
        //     app.showTextToast('图片安全检查通过!')
        //     that.cropper.pushOrign(imgSrc)
        //   } else {
        //     app.showTextToast('图片含有违规内容,请重新选择!')
        //   }
        // })
      },
      fail: function (res) {
        console.error(res)
      }
    })
  },
  imgCheckWithCompressedImgPath: function (photo) {
    if(!photo.tempFiles[0]){
      return;
    }
    let that = this
    const cb = function (isSafe) {
      if (isSafe) {
        app.showTextToast('图片安全检查通过!')
        that.cropper.pushOrign(imgSrc)
      } else {
        app.showTextToast('图片含有违规内容,请重新选择!')
      }
    }
    const imgSrc = photo.tempFiles[0].path
    if (photo.tempFiles[0].size < 50 * 1024) { //50k
      imgCheckByUpload(imgSrc, cb)
      return
    }   
    const ctx = wx.createCanvasContext('compressCanvas');
    wx.getImageInfo({
      src: imgSrc,
      success: function (res) {
        var towidth = 200;           //按宽度的比例压缩
        var toheight = Math.trunc(((towidth * res.height) / res.width));
        that.setData({
          areaStyle2: 'width:' + towidth + 'px;height:' + toheight + 'px'
        })
        ctx.drawImage(res.path, 0, 0, res.width, res.height, 0, 0, towidth, toheight)
        ctx.draw(false, function () {
          setTimeout(function () {
          wx.canvasToTempFilePath({
            x:0,
            y:0,
            width:towidth,
            height:toheight,
            destWidth:towidth,
            destHeight: toheight,
            quality: 0.8,
            canvasId: 'compressCanvas',
            fileType: "jpg",
            success: function (res) {
              console.log("compress", res)
              imgCheckByUpload(res.tempFilePath, cb)
            },
            fail: function (res) {
              console.error(res)
              app.showTextToast("图片安全检查预处理失败，请重试")
            }
          })
        },500)
        })
      },
      fail: function (res) {
        console.error(res)
        app.showTextToast("图片获取信息失败，请重试")
      }
    })

  }
})