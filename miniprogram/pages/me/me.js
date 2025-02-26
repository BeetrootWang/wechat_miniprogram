const db = wx.cloud.database()
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headImg: '../../images/11.png',
    limit: 20,
    skip: 0,
    list: []
  },
  formatTime: function (dateTimeStr) {
    return dateTimeStr.slice(0, 10); // 返回年月日部分
  },
  //退出登录
  ToendLogin() {
    wx.reLaunch({
      url: '../login/login',
    })
  },

  cancel(e) {
    console.log(e)
    db.collection('orderList').where({
      _id: e.currentTarget.dataset.item._id
    }).remove().then(res => {
      wx.showToast({
        title: '取消成功',
      })
      this.setData({
        list: []
      })
      this.getList()

    })
  },


  //跳转到个人信息
  toUser() {
    wx.navigateTo({
      url: '../userInfor/userInfor',
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    //获取用户信息
    if (app.globalData.userInfor) {
      this.setData({
        ...app.globalData.userInfor
      })
      this.getList()
    }




  },


  //获取数据
  getList() {
    //获取预约记录
    if (app.globalData.userInfor._openid) {

    }
    db.collection('orderList').skip(this.data.list.length).where({
      _openid: app.globalData.userInfor._openid
    }).get().then(res => {
      console.log(res)
      if (res.data.length == 0) {
        wx.showToast({
          title: '没有更多了',
          icon: 'none'
        })
        return
      }
      this.setData({
        list: this.data.list.concat(res.data)
      })
    })

  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('触底')

    this.getList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})