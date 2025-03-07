// import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
const db = wx.cloud.database();
const app = getApp();
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    autosize: {
      minHeight: 60,
    },
    name: '',
    phone: '',
    //业务类型
    // columns: ['杭州', '宁波', '温州', '嘉兴', '湖州'],

    // BTvalue: '杭州',
    // BTshow: false,
    timeArr: [],
    timeId: 1,
    //预约机构
    // orderOrgan: '',
    orderOrganArr: ['普通预约', '其他'],
    // orderOrganIdx: 0,
    OOshow: false,
    OOvalue: '',
    OOidx: -1,

    //五星八钻
    // RKidx: 0, //默认选中
    // rank58: '', //显示值
    // rankValue: '', //上传值

    // rank58Idx: 0,
    // RKshow: false,


    //预约具体规模
    // orderScale: '',
    //调换产品:
    // replaceGift: '',

    //日期

    currentDate: new Date().getTime(),
    minDate: new Date().getTime(),
    maxDate: new Date().getTime() + (16 * 24 * 60 * 60 * 1000),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      }
      if (type === 'month') {
        return `${value}月`;
      }
      return value;
    },
    orderTime: "",
    TMshow: false,
    numTimes: null,
    loading: false,

    //时间段:
    Tag: '',
    TagValue: '',
    yuyue: false,
    time: "06:30~07:00",
    limitTime: ""
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  //处理可预约次数
  async numTims() {
    //显示加载中
    this.setData({
      loading: false
    })
    var timeArr = [{
        id: 1,
        time: '06:30~07:00',
        num: 5
      },
      {
        id: 2,
        time: '07:00~07:30',
        num: 5
      },
      {
        id: 3,
        time: '07:30~08:00',
        num: 5
      },
      {
        id: 4,
        time: '08:00~08:30',
        num: 5
      },
      {
        id: 5,
        time: '08:30~09:00',
        num: 5
      },
      {
        id: 6,
        time: '09:00~09:30',
        num: 5
      },
      {
        id: 7,
        time: '09:30~10:00',
        num: 5
      }, {
        id: 8,
        time: '10:00~10:30',
        num: 5
      }, {
        id: 9,
        time: '10:30~11:00',
        num: 5
      }, {
        id: 10,
        time: '11:00~11:30',
        num: 5
      }, {
        id: 11,
        time: '11:30~12:00',
        num: 5
      }
    ]
    // 循环遍历数组
    console.log(this.data.orderTime)
    for (let i = 0; i < timeArr.length; i++) {
      const item = timeArr[i]
      // 查询数据库是否有该时间段的记录
      const res = await db.collection('orderList').where({
        time: item.time,
        orderTime: this.data.orderTime,
        state: '1'
      }).get()
      console.log(res)

      // 如果有记录，则将相应的num减一
      if (res.data.length > 0) {
        item.num = item.num - res.data.length
      }
    }

    this.setData({
      timeArr,
      loading: true
    })
    console.log(timeArr)
    const allFull = this.data.timeArr.every(item => item.num === 0);
    this.setData({allFull});

    //隐藏加载中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    // 若早于上午六点，则只给出未来五天（以及当天）的号
    let now = new Date();
    let sixAM = new Date();
    sixAM.setHours(6,0,0,0);
    if (now < sixAM) {
        this.setData({
            maxDate: now.getTime() + (5 * 24 * 60 * 60 * 1000)
        });
    }

    // 若晚于中午12点，则默认显示第二天的号
    let twelveAM = new Date();
    twelveAM.setHours(12,0,0,0);
    if (now > twelveAM) {
        this.setData({
            minDate: now.getTime() + (24 * 60 * 60 * 1000),
        });
    }
    this.setData({
        currentDate: Math.max(this.data.currentDate, this.data.minDate)
    });
    const value = this.timestampToTime(this.data.currentDate);
    this.setData({
      orderTime: value
    });

    this.numTims();
    //获取自定义日期限制
    console.log(this.data.limitTime)
    var limitNum = await new Promise((resolve, reject) => {
      db.collection('LimitTime').where({
        time: this.data.limitTime
      }).get().then(res => {
        console.log(res)
        resolve(res.data.length)
      })
    })  

    if (limitNum > 0) {
      this.setData({
        limit: "关闭预约"
      })
    }else{
      this.setData({
        limit: "开启预约"
      })
    }


    //获取限制
    db.collection('limit').where({}).get().then(res => {
      this.setData({
        // limit: res.data[0].limit
      })
    })



    db.collection('num').where({}).get().then(res => {
      this.setData({
        numTimes: res.data[0].numTimes
      })
    })

  },

  //上传
  async update() {
    //判断是否登录
    if (!app.globalData.onLogin) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    this.setData({
      yuyue: true
    })



    //判断是否还有名额
    if (this.data.timeArr[this.data.timeId - 1].num <= 0) {
      wx.showToast({
        title: '该时间段预约已满',
        icon: 'none'
      })
      this.setData({
        yuyue: false
      })
      return
    }


    //判断该用户今日还能否预约
    const _ = db.command
    const result = await new Promise((resolve, reject) => {
      db.collection('orderList').where(
        _.and([{
            orderTime: this.data.orderTime,
          },
          {
            _openid: app.globalData.userInfor._openid
          },
        
        ])
      ).get().then(res => {
        resolve(res)
      })
    })

    console.log(result)
    if (result.data.length != 0) {
      wx.showToast({
        title: '您今日已经预约了',
        icon: 'none'
      })
      this.setData({
        yuyue: false
      })
      return
    }



    wx.showLoading({
      title: '预约中',
    })
    //检查数据库该时间端是否还有名额
    let awaitLimit = await new Promise((resolve, reject) => {
      db.collection('orderList').where(_.and([{
          orderTime: this.data.orderTime,
        },
        {
          time: this.data.time
        }
      ])).get().then(res => {
        resolve(res.data.length)
      })
    })



    if (awaitLimit >= 5) {
      wx.showToast({
        title: '预约失败，该时间端已被抢光',
        icon: 'none'
      })
      this.setData({
        yuyue: false
      })
      this.numTims()
      return
    }

    //检测预约限制
    if (this.data.numTimes == 0) {
      //无限制预约
      //直接提交预约
      await this.addOrder()
      wx.hideLoading()
      wx.showToast({
        title: '预约成功',
      })
      this.setData({
        yuyue: false
      })
      return
    }
    //获取用户信息判断是否有上次提交时间记录
    console.log(app.globalData.userInfor)
    const userInfor = app.globalData.userInfor
    //第一次提交预约
    if (!userInfor.timeOrder) {
      //获取当前时间戳
      const timeOrder = new Date().getTime();
      //更新用户信息，新增timeOrder字段
      const num = userInfor.num + 1
      await this.updateUser(timeOrder, num)
      await this.addOrder()
      //更新本地用户信息
      app.globalData.userInfor.timeOrder = timeOrder
      app.globalData.userInfor.num = num
      wx.hideLoading()
      wx.showToast({
        title: '预约成功',
      })
      this.setData({
        yuyue: false
      })
      return
    }

    //不是第一次预约
    //根据当前时间和用户信息里的时间判断间隔是否超过一周
    //获取当前时间戳
    const nowTime = new Date().getTime();
    const timeOrder = userInfor.timeOrder;
    // 计算两个时间戳之间的毫秒数差值
    const diff = Math.abs(nowTime - timeOrder)
    // 判断差值是否超过一周（7天）
    if (diff > 7 * 24 * 60 * 60 * 1000) {
      console.log('时间间隔超过一周')
      //可以预约，预约次数重置,时间重置
      //获取当前时间戳
      const timeOrder = new Date().getTime();
      //更新用户信息，新增timeOrder字段
      const num = 1
      await this.updateUser(timeOrder, num)
      await this.addOrder()
      //更新本地用户信息
      app.globalData.userInfor.timeOrder = timeOrder
      app.globalData.userInfor.num = num
      wx.hideLoading()
      wx.showToast({
        title: '预约成功',
      })

    } else {
      console.log('时间间隔不超过一周')
      //判断预约次数是否大于等于设定次数
      if (userInfor.num >= this.data.numTimes) {
        //不能预约
        wx.showToast({
          title: '已达到本周预约次数上限',
          icon: 'none'
        })

      } else {
        //可以预约，预约次数加一
        //更新用户信息，新增timeOrder字段
        const num = userInfor.num + 1
        const timeOrder = userInfor.timeOrder
        await this.updateUser(timeOrder, num)
        await this.addOrder()
        //更新本地用户信息
        app.globalData.userInfor.timeOrder = timeOrder
        app.globalData.userInfor.num = num
        wx.hideLoading()
        wx.showToast({
          title: '预约成功',
        })

      }

    }

    this.setData({
      yuyue: false
    })

  },

  //修改用户信息
  async updateUser(timeOrder, num) {
    await new Promise((resolve, reject) => {
      db.collection('userList').where({
        _openid: app.globalData.userInfor._openid
      }).update({
        data: {
          timeOrder: timeOrder,
          num: num,
        }
      }).then(res => {
        console.log(res)
        resolve()
      }).catch(error => {
        console.log(error)
        reject()
        wx.showToast({
          title: error,
          icon: 'none'
        })
      });
    })

  },

  //新增预约记录
  async addOrder() {

    await new Promise((resolve, reject) => {
      let {
        name,
        phone,
        BTvalue,
        notes,
        OOvalue,
        orderTime,

      } = this.data;
      let time = this.data.timeArr[this.data.timeId - 1]
      console.log(time)
      if (app.globalData.stateOrder == '0') {
        var dateOrder = {
          name,
          phone,
          BTvalue,
          notes,
          OOvalue,
          orderTime,
          state: '1',
          stateOrder: '否',
          time: time.time,
        }
      } else {
        var dateOrder = {
          name,
          phone,
          BTvalue,
          notes,
          OOvalue,
          orderTime,
          state: '1',
          time: time.time,
          stateOrder: '是'
        }
      }


      db.collection('orderList').add({
        data: dateOrder
      }).then(res => {
        this.numTims()

        //发送预约成功提示
        wx.cloud.callFunction({
          name: 'Push',
          data: {
            OOvalue: this.data.OOvalue,
            name: this.data.name,
            phone: this.data.phone,
            orderTime: this.data.orderTime,
            time: this.data.time,
          },
          success: res => {

          },
          fail: err => {
            console.error(err)
          }
        })



        resolve()
      }).catch(err => {
        reject()
      })




    })

  },
  // 姓名
  // onChange(event) {
  //     // event.detail 为当前输入的值
  //     console.log(event.detail);
  // },
  //业务类型
  //模态框弹出
  BTshowPopup() {
    this.setData({
      BTshow: true
    });
  },
  //模态框关闭
  BTonClose() {
    this.setData({
      BTshow: false
    });
  },
  //选择器改变时
  BTonChange(event) {
    console.log(event)
    const {
      value,
      index
    } = event.detail;
    this.setData({
      BTvalue: value
    })
    // picker.setColumnValues(1, citys[value[0]]);

  },
  //确定
  BTonConfirm(event) {
    const {
      value,
      index
    } = event.detail;
    this.setData({
      BTvalue: value
    })






    this.BTonClose();
  },
  //取消
  BTonCancel() {
    // Toast('取消');

    this.BTonClose();
  },




  //预约机构

  //模态框弹出
  OOshowPopup() {
    this.setData({
      OOshow: true
    });
  },
  //模态框关闭
  OOonClose() {
    this.setData({
      OOshow: false
    });
  },
  //选择器改变时
  OOonChange(event) {
    const {
      picker,
      value,
      index
    } = event.detail;
    // Toast(`当前值:${value}, 当前索引:${index}`);
  },
  //确定
  OOonConfirm(event) {
    console.log(event)
    const {
      picker,
      value,
      index
    } = event.detail;
    // Toast(`当前值:${value}, 当前索引:${index}`);
    let OOvalue = value;
    let OOidx = index;
    this.setData({
      OOvalue,
      OOidx
    })
    this.OOonClose();
  },
  //取消
  OOonCancel() {
    // Toast('取消');

    this.OOonClose();
  },





  //模态框弹出
  RKshowPopup() {
    this.setData({
      RKshow: true
    });
  },
  //模态框关闭
  RKonClose() {
    this.setData({
      RKshow: false
    });
  },
  //选择器改变时
  RKonChange(event) {
    const {
      picker,
      value,
      index
    } = event.detail;
    // Toast(`当前值:${value}, 当前索引:${index}`);
  },
  //确定
  RKonConfirm(event) {
    const {
      value,
      index,
      OS
    } = event.detail;
    // Toast(`当前值:${value}, 当前索引:${index}`);

    let rank58XJ = this.data.rank58XJ;
    let rank58Gift = this.data.rank58Gift;
    let rankValue = index; //真实值

    let rank58 = value + "(万元) + " + rank58XJ[index] + " + " + rank58Gift[index]; //显示
    this.setData({
      rank58,
      rankValue
    })

    this.RKonClose();
    if (OS != 1) {
      wx.showModal({
        title: '礼品',
        content: rank58Gift[index],
        success: (res) => {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }


  },

  //取消
  RKonCancel() {
    // Toast('取消');

    this.RKonClose();
  },


  //预约规模输入失去焦点时
  OSFiniBlur(event) {
    console.log("失去交点了")
    if (event.detail.value.match(/^[ ]*$/)) {
      console.log("不做操作----------")
    } else {
      this.FiniBlur(event.detail.value)
    }


  },
  OSFiniBlurConfirm(event) {
    if (event.detail.match(/^[ ]*$/)) {
      console.log("不做操作----------")
    } else {
      this.FiniBlur(event.detail)
    }
    // this.FiniBlur(event.detail)
  },


  //日期
  TMshowPopup() {
    this.setData({
      TMshow: true
    });
  },

  TMonClose() {
    this.setData({
      TMshow: false
    });
  },
  TMonInput(event) {
    this.setData({
      currentDate: event.detail,
    });
  },
  //确定
  TMonConfirm(event) {
    const value = this.timestampToTime(event.detail);
    console.log(`当前值:`, event.detail, value);

    this.setData({
      currentDate: event.detail,
      orderTime: value
    })
    this.TMonClose();
    this.numTims()
    this.onLoad()
  },
  //取消
  TMonCancel() {
    // Toast('取消');
    this.TMonClose();
  },


  timestampToTime(timestamp) {

    var date = new Date(timestamp); //时间戳为10位需*1000,时间戳为13位的话不需乘1000

    let Y = date.getFullYear();

    let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);

    let D = this.change(date.getDate());

    let h = this.change(date.getHours());

    let m = this.change(date.getMinutes());

    let s = this.change(date.getSeconds());
    this.setData({
      limitTime: Y + "-" + M + "-" + D
    })
    return Y + "年" + M + "月" + D + "日";


  },

  change(t) {

    if (t < 10) {

      return "0" + t;

    } else {

      return t;

    }

  },


  //时间段
  timeTagOnChange(e) {
    console.log(e)

    let id = e.currentTarget.dataset.item.id
    let time = e.currentTarget.dataset.item.time
    this.setData({
      timeId: id,
      time
    })
  },










  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})