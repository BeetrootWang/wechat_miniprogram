// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  //获取当前日期
  let date = new Date()
  date.setDate(date.getDate() + 1)
  let seperator1 = '-', // 格式分隔符
    year = date.getFullYear(), // 获取完整的年份(4位)
    month = date.getMonth() + 1, // 获取当前月份(0-11,0代表1月)
    strDate = date.getDate() // 获取当前日(1-31)

  if (month >= 1 && month <= 9) {
    month = '0' + month // 如果月份是个位数，在前面补0
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = '0' + strDate // 如果日是个位数，在前面补0
  }
  var currentdate = year + '年' + month + '月' + strDate + '日'
  console.log(currentdate)

  try {
    const result = await cloud.openapi.uniformMessage.send({
      "touser": item._openid,
      "mpTemplateMsg": {
        "appid": 'wx72d47514628fc4c5', //公众号appid
        "url": 'http://weixin.qq.com/download',
        "miniprogram": { //公众号模板消息所要跳转的小程序，小程序的必须与公众号具有绑定关系
          "appid": 'wx07ae1678fb2ec084', //小程序appid
          "page": "pages/index/index" //跳转的小程序的路径，注意此处文档中有误
        },
        "data": { //公众号模板消息的数据
          "first": {
            "value": '预约成功',
            "color": '#173177'
          },
          "keyword1": {
            "value": event.OOvalue,
            "color": '#173177'
          },
          "keyword2": {
            "value": '刘娜中医诊所',
            "color": '#173177'
          },
          "keyword3": {
            "value": event.name,
            "color": '#173177'
          },
          "keyword4": {
            "value": event.phone,
            "color": '#173177'
          },
          "keyword5": {
            "value": event.orderTime + event.time,
            "color": '#173177'
          }
        },
        "templateId": 'vga2cf5c-GdgfrB6zvqB2DHYfswd0lksI1Pl_D9zrDY' //公众号模板id
      }
    })
    console.log(result)

  } catch (err) {
    console.log(err)

  }



  return {

  }
}