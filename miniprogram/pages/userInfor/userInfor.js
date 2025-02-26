// import tui from '../../common/httpRequest'
// var times = require('../../utils/time.js')
// const $api = require('../../utils/request.js').Api;
var app = getApp();
let file = ''

const db = wx.cloud.database()
Page({
  data: {
    webURL: '',
    fileList: [],
    showData: false,
    show: false,
    currentDate: new Date().getTime(),
    minDate: 1675588458,
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      }
      if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
    sexIndex: null,
    columns: ['男士', '女士'],
    age: '',
    showSex: false,
    sexValue: '请选择',
    dataValue: '请选择',
    fileList: [],
    imgUrl: '',
    phone: '',
    name: '',
    userInfor: {},
    login:false
  },

  async onShow() {

    var userInfor = app.globalData.userInfor
    console.log(userInfor)
    if (userInfor) {
      this.setData({
        userInfor: userInfor,
        imgUrl: userInfor.headImg,
        name: userInfor.name,
        phone: userInfor.phone,
        login:true
      })
    }


  },
  onChange(event) {
    const {
      picker,
      value,
      index
    } = event.detail;

  },
  showData(e) {
    // this.setData({
    //   showData: true,
    //   show: true
    // })
    console.log(e)
    this.setData({
      // sexValue: e.detail.value == '0' ? '男士' : '女士',
      dataValue: e.detail.value
    })
  },


  //确认选择的日期
  tureData(e) {
    console.log(e)
    //处理日期
    let dataValue = times.toDate(e.detail)
    console.log(dataValue)
    this.setData({
      showData: false,
      show: false,
      dataValue: dataValue
    })
  },

  //名字
  onChangeName(e) {
    console.log(e)
    this.setData({
      name: e.detail
    })
  },
  //手机号
  onChangephone(e) {
    console.log(e)
    this.setData({
      phone: e.detail
    })
  },


 
  cancelData() {
    this.setData({
      showData: false,
      show: false,
      showSex: false
    })
  },
  verifyLogin() {
    tui.href('../verifyLogin/verifyLogin')
  },

  //选择头像
  onChooseAvatar(e) {

    console.log(e)
    file = e.detail.avatarUrl
    this.setData({
      imgUrl: e.detail.avatarUrl
    })
  },
  afterRead(event) {
    this.setData({
      fileList: [],
    })

    file = event.detail.file.url;
    console.log(file)
    this.setData({

      imgUrl: file
    })




  },

  //提交信息
  async sumib() {
    
    wx.showLoading({
      title: '提交中',
      mask: true
    })

    if(!this.data.imgUrl || !this.data.name){
      wx.showToast({
        title: '请授权头像和昵称',
        icon:'none'
      })
      return
    }

    //上传头像
    if (this.data.imgUrl != wx.getStorageSync('userInfor').headImg) {
      var imageAvatar = await new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'images/' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000) + '.png', // 生成文件名
          filePath: this.data.imgUrl, // 文件路径
          success: res => {
            resolve(res.fileID) // 返回文件 ID
          },
          fail: err => {
            reject(err)
          }
        })


      })
      console.log(imageAvatar)
    } else {
      var imageAvatar = this.data.imgUrl
    }


    //上传用户信息

    let setuserInfor = await new Promise((resolve, reject) => {

      db.collection('userList').add({
        data: {
          headImg: imageAvatar,
          name: this.data.name,
          num:0
        }
      }).then(res => {
        console.log(res)
        resolve(res)
      }).catch(error => {
        console.log(error)
        reject()
        wx.showToast({
          title: error,
          icon: 'none'
        })
      });
    })
    app.globalData.userInfor = {
      headImg: imageAvatar,
      name: this.data.name,
      _openid:app.globalData._openid,
      num:0
    }
    app.globalData.onLogin = true
    //将用户信息存放到缓存中
    wx.hideLoading()
    wx.navigateBack()


  },

  //更新信息
  async upSumib() {
  
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    //上传头像
    if (this.data.imgUrl != app.globalData.userInfor.headImg) {

      var imageAvatar = await new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'images/' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000) + '.png', // 生成文件名
          filePath: this.data.imgUrl, // 文件路径
          success: res => {
            resolve(res.fileID) // 返回文件 ID
          },
          fail: err => {
            reject(err)
          }
        })


      })
      console.log(imageAvatar)
    } else {
      var imageAvatar = this.data.imgUrl
    }
    let setuserInfor = await new Promise((resolve, reject) => {
      db.collection('userList').where({
        _openid: this.data.userInfor._openid
      }).update({
        data: {
          headImg: imageAvatar,
          name: this.data.name,
        }
      }).then(res => {
        console.log(res)
        resolve(res)
      }).catch(error => {
        console.log(error)
        reject()
        wx.showToast({
          title: error,
          icon: 'none'
        })
      });
    })
    //将用户信息存放到缓存中
    app.globalData.userInfor.headImg = imageAvatar
    app.globalData.userInfor.name = this.data.name
   
    wx.hideLoading()
    wx.showToast({
      title: '修改成功',
    })
  },
})