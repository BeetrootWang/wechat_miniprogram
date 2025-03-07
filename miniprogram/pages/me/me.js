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
    list: [],
    /*
     * 新加入的部分
     */
    validAppointments: [],
    expiredAppointments: [],
    showExpired: false
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

  timeToTimestamp(orderTime) {
    const normalizedTime = orderTime.replace("年", "/").replace("月", "/").replace("日", "");
    const timestamp = new Date(normalizedTime).getTime();
    return timestamp;
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
    // if (app.globalData.userInfor._openid) {
        // if user is not logged in, do something to avoid 
        // the error caused by _openid is null
    // }
    db.collection('orderList')
        // .skip(this.data.list.length)
        .where({
            _openid: app.globalData.userInfor._openid
        })
        .get()
        .then(res => {
            console.log('res:')
            console.log(res)

            const appointments = res.data;
            const validAppointments = [];
            const expiredAppointments = [];
            const now = new Date().getTime();

            appointments.forEach(item => {
                const appointmentDate = this.timeToTimestamp(item.orderTime);
                if (appointmentDate >= now) {
                    validAppointments.push(item);
                } else {
                    expiredAppointments.push(item);
                }
            });

            console.log('valid:', validAppointments);
            console.log('expired', expiredAppointments);

            if (res.data.length == 0) {
                wx.showToast({
                title: '没有更多了',
                icon: 'none'
                })
                return
            }

            this.setData({
                list: appointments,
                validAppointments,
                expiredAppointments
            });
        });
  },

  // 切换已过期预约的显示/隐藏
  toggleExpired() {
      this.setData({
        showExpired: !this.data.showExpired
      });
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