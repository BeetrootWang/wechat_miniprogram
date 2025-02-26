// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      });
    }

    this.globalData = {};
    this.update();
    //获取用户信息
    const db = wx.cloud.database()
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log(res)
        this.globalData._openid = res.result.openid
        db.collection('userList').where({}).get().then(res => {
          console.log(res)
          if (res.data.length != 0) {
            this.globalData.onLogin = true
            this.globalData.userInfor = res.data[0]
            wx.setStorageSync('userInfor', res.data[0])
             //查询该用户的预约是否被同意过
          db.collection('orderList').where({
            _openid: this.globalData.userInfor._openid,
            state: '1'
          }).get().then(res => {
            console.log(res)
            if(res.data.length == 0){
              this.globalData.stateOrder = '0'
            }else{
              this.globalData.stateOrder = '1'
            }
            
          })
          } else {
            this.globalData.onLogin = false
          }
         

        }).catch(err => {
          console.log(err)
          this.globalData.onLogin = false
        })
      }
    })
  },

 
    // 版本更新
    update() {
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate(function (res) {
          // 请求完新版本信息的回调
          if(res.hasUpdate) {

              // 新版本下载成功
              updateManager.onUpdateReady(function () {
                  wx.showModal({
                      title: '更新提示',
                      content: '新版本已经准备好，请您重启应用，以确保正常使用。',
                      success: function (res) {
                          if (res.confirm) {
                              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                              updateManager.applyUpdate()
                          }
                      }
                  })
              })

              // 新版本下载失败
              updateManager.onUpdateFailed(function () {
                  wx.showModal({
                      title: '更新提示',
                      content: '检测到了新版本，但是下载失败了~'
                  })
              })

          }
      })
  }
});