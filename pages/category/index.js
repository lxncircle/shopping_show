import { request } from '../../request/index.js'
import regeneratorRuntime from '../../lib/runtime/runtime'

// pages/category/index.js
Page({
  data: {
    // 左侧的菜单数据
    leftMenuList: [],
    // 右侧的商品数据
    rightContent: [],
    // 被点击的左侧的菜单
    currentIndex: 0,
    scrollTop: 0,
  },
  // 接口的返回数据
  Cates: [],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // web和小程序的存储区别
    // 1.写代码的方式不同
    // web: localStorage.setItem("key", "value"), localStorage.getItem("key", "value")
    // 小程序：wx.setStorageSync('key', "value"), wx.getStorageSync('key', "value"),
    // 2.存的时候：有无类型转换
    // web：先toString()，把数据变成字符串，再存进去
    // 小程序：存什么类型就获取什么类型

    // 1 先判断一下本地存储中有没有旧数据
    // {time: Date.now(), data: [...]}
    // 2 没有旧数据 直接发送新请求
    // 3 有旧数据  同时 旧数据也没有过期， 就是用本地存储中的旧数据即可

    // 1 获取本地存储中的数据
    const Cates = wx.getStorageSync('cates')
    if (!Cates) {
      //不存在  发送请求
      this.getCates()
    } else {
      //有旧数据 定义过期时间 10s改成 5min
      if (Date.now() - Cates.time > 1000 * 300) {
        //已过期  重新发送请求
        this.getCates()
      } else {
        //可以使用旧的数据
        console.log('可以使用旧的数据')
        this.Cates = Cates.data
        let leftMenuList = this.Cates.map((v) => v.cat_name)
        let rightContent = this.Cates[0].children
        this.setData({
          leftMenuList,
          rightContent,
        })
      }
    }
  },
  // 获取分类数据
  async getCates() {
    // request({
    //   url: '/categories',
    // }).then((res) => {
    //   this.Cates = res.data.message

    //   //把接口的数据存入到本地存储中
    //   wx.setStorageSync('cates', { time: Date.now(), data: this.Cates })

    //   // 构造左侧的大菜单数据
    //   let leftMenuList = this.Cates.map((v) => v.cat_name)
    //   // 构造右侧的商品数据
    //   let rightContent = this.Cates[0].children
    //   this.setData({
    //     leftMenuList,
    //     rightContent,
    //   })
    // })

    // 1.使用es7的async await来发送请求
    const res = await request({ url: '/categories' })
    this.Cates = res
    //把接口的数据存入到本地存储中
    wx.setStorageSync('cates', { time: Date.now(), data: this.Cates })
    // 构造左侧的大菜单数据
    let leftMenuList = this.Cates.map((v) => v.cat_name)
    // 构造右侧的商品数据
    let rightContent = this.Cates[0].children
    this.setData({
      leftMenuList,
      rightContent,
    })
  },
  // 左侧菜单的点击事件
  handleItemTap(e) {
    console.log(e)
    // 1.获取被点击的标题身上的索引
    // 2.给data中的currentIndex赋值就可以了
    const { index } = e.currentTarget.dataset
    let rightContent = this.Cates[index].children
    this.setData({
      currentIndex: index,
      rightContent,
      // 重新设置 右侧内容的scroll-view标签的距离顶部的距离
      scrollTop: 0,
    })
  },
})
