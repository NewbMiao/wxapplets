
export const imgCheckByUpload = (filePath, cb)=>{
  wx.showLoading({
    title: '图片安全检查中...',
  })
  const tfile='crop/'+Date.now() + '-' + Math.random() * 1000000 + '.jpg'
  wx.cloud.uploadFile({
    cloudPath: tfile, // 上传至云端的路径
    filePath: filePath, // 小程序临时文件路径
    success: res => {
      // 返回文件 ID
      wx.cloud.callFunction({
        name: 'imgCheck',
        data: {
          value: res.fileID
        },
        success: function (imgRes) {
          wx.hideLoading()
          console.log("imgCheck result:"+JSON.stringify(imgRes))
          const isSafe=(imgRes.result && imgRes.result.errCode !== 87014)
          cb(isSafe)
        },
        fail: function(err){
          wx.hideLoading()
          console.error(err)
        }
      })
    },
    fail:  function(err){
      wx.hideLoading()
      console.error(err)
    }
  });
}