/* 
1发送请求，获取数据
2.点击轮播图 预览大图
    1 给轮播图绑定点击事件
    2 调用小程序api   priviewImage
3点击  加入购物车
    1先绑定点击事件
    2获取缓存中的购物车数据
    3先判断 当前的商品是否已经存在于 购物车
    4已经存在 修改商品属性  执行购物车++ 重新把购物车数组 填充回缓存
    5不存在于购物车的数组中 直接给购物车数组添加一个新元素  带上购物数量属性num 重新把购物车数组 填充回缓存
    6弹出提示框
4商品收藏
    1页面onShow的时候  加载缓存中的商品收藏的数据
    2判断当前商品是不是被收藏
        1是 改变图标
        2不是 ...
    3点击商品收藏按钮
        1判断该商品是否才能在于缓存数组中
        2已经存在 把商品删除
        3没有存在 把商品添加到收藏数组中 存入到缓存中即可
*/

import { request } from '../../request/index.js'
import regeneratorRuntime from '../../lib/runtime/runtime'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    goodsObj: {},
    // 商品是否被收藏
    isCollect: false,
  },
  // 商品对象
  GoodsInfo: {},
  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    let pages = getCurrentPages()
    let currentPage = pages[pages.length - 1]
    let options = currentPage.options
    const { goods_id } = options
    this.getGoodsDetail(goods_id)
  },
  // 获取商品的详情数据
  async getGoodsDetail(goods_id) {
    const goodsObj = await request({ url: '/goods/detail', data: { goods_id } })
    this.GoodsInfo = goodsObj
    // 1获取缓存中的商品收藏数组
    let collect = wx.getStorageSync('collect') || []
    // 2判断当前商品是否被收藏
    let isCollect = collect.some((v) => v.goods_id === this.GoodsInfo.goods_id)
    this.setData({
      goodsObj: {
        goods_name: goodsObj.goods_name,
        goods_price: goodsObj.goods_price,
        // webp图片格式处理
        // 找后台让他修改
        // 临时自己改   确保后台存在  tupian.webp  =>  tupian.jpg
        goods_introduce: goodsObj.goods_introduce.replace(/\.webp/g, '.jpg'),
        pics: goodsObj.pics,
      },
      isCollect,
    })
  },
  // 点击轮播图放大预览
  handlePrevivewImage(e) {
    // 1先构造要预览的数组
    const urls = this.GoodsInfo.pics.map((v) => v.pics_mid)
    const current = e.currentTarget.dataset.url
    wx.previewImage({
      current,
      urls,
    })
  },
  handCartAdd() {
    // 1获取缓存中的购物车数组
    let cart = wx.getStorageSync('cart') || []
    // 2判断 商品对象是否存在于购物车数组中
    let index = cart.findIndex((v) => v.goods_id === this.GoodsInfo.goods_id)
    if (index === -1) {
      // 不存在  第一次添加
      this.GoodsInfo.num = 1
      this.GoodsInfo.checked = true
      cart.push(this.GoodsInfo)
    } else {
      //已经存在购物车数据  执行num++
      cart[index].num++
    }
    console.log(cart)
    // 5 把购物车重新添加为缓存中
    wx.setStorageSync('cart', cart)
    // 6 弹窗提示
    wx.showToast({
      title: '加入成功',
      icon: 'success',
      // true 防止用户 手抖 疯狂点击按钮
      mask: true,
    })
  },
  // 点击商品收藏图标
  handleCollect() {
    let isCollect = false
    // 1获取缓存中的商品收藏数组
    let collect = wx.getStorageSync('collect') || []
    // 2判断该商品是否被收藏过
    let index = collect.findIndex((v) => v.goods_id === this.GoodsInfo.goods_id)
    // 当index !== -1 表示 已经收藏过
    if (index !== -1) {
      // 能找到 已经收藏过,在数组中商品该商品
      collect.splice(index, 1)
      isCollect = false
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        mask: true,
      })
    } else {
      // 没有收藏过
      collect.push(this.GoodsInfo)
      isCollect = true
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        mask: true,
      })
    }
    // 4把数组存入缓存中
    wx.setStorageSync('collect', collect)
    // 5修改data中的属性 isCollect
    this.setData({
      isCollect,
    })
  },
})
