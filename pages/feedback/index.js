/* 
1点击 "+"触发tap点击事件
    1调用小程序内置的选择图片的 api
    2获取到图片的路径  数组
    3把图片路径存到data中
    4页面可以根据图片的数组 进行循环显示 自定义组件
2点击 自定义图片 组件
      1获取被点击的元素的索引
      2获取data中的图片数组
      3根据索引 数组中删除对应的元素
      把数组重新设置回data中
3点击"提交"
      1获取文本域的内容 类似  输入框的获取
          1data中定义变量 表示 输入框内容
          2文本域绑定 输入事件 事件触发时 把输入框的值 存入到变量中
      2对这些内容 合法性验证
      3验证通过 用户选择的图片 上传到专门的图片服务器 返回图片外网的链接
          1遍历图片数组
          2挨个上传
          3自己再维护图片数组  存放 图片上传后的外网的链接
      4文本域和外网图片的路径一起提交的服务器中
      5清空当前页面
      6返回上一页
 */
Page({
  data: {
    tabs: [
      {
        id: 0,
        value: '体验问题',
        isActive: true,
      },
      {
        id: 1,
        value: '商品、商家投诉',
        isActive: false,
      },
    ],
    // 被选中的图片路径  数组
    chooseImgs: [],
    // 文本域内容
    textVal: '',
  },
  // 外网的图片的路径数组
  UpLoadImgs: [],
  handleTabsItemChange(e) {
    const { index } = e.detail
    let { tabs } = this.data
    tabs.forEach((v, i) => (i === index ? (v.isActive = true) : (v.isActive = false)))
    this.setData({
      tabs,
    })
  },
  // 点击"+" 选择图片
  handleChooseImg(e) {
    // 2 调用小程序内置的选择图片api
    wx.chooseImage({
      // 同时选中的图片的数量
      count: 9,
      // 图片格式  原图  压缩
      sizeType: ['original', 'compressed'],
      // 图片来源  相册  照相机
      sourceType: ['album', 'camera'],
      success: (result) => {
        console.log(result)
        this.setData({
          // 图片数组  进行拼接
          chooseImgs: [...this.data.chooseImgs, ...result.tempFilePaths],
        })
      },
    })
  },
  // 点击  自定义图片组件
  handleRemoveImg(e) {
    // 2获取被点击的组件的索引
    const { index } = e.currentTarget.dataset
    // 3获取data中的图片数组
    let { chooseImgs } = this.data
    // 4删除元素
    chooseImgs.splice(index, 1)
    this.setData({
      chooseImgs,
    })
  },
  // 文本域输入事件
  handleTextInput(e) {
    this.setData({
      textVal: e.detail.value,
    })
  },
  // 提交按钮的点击
  handleFormSubmit() {
    // 1获取文本域内容
    const { textVal, chooseImgs } = this.data
    // 2合法性的验证
    if (!textVal.trim()) {
      //不合法
      wx.showToast({
        title: '输入不合法',
        icon: 'none',
        mask: true,
      })
      return 0
    }
    // 3准备上传图片  到专门的图片服务器
    // 上传文件的api 不支持多个文件同时上传 遍历数组 挨个上传
    // 显示正在等待的图片
    wx.showLoading({
      title: '正在上传中',
      mask: true,
    })
    // 判断有没有需要上传的图片数组
    if (chooseImgs.length != 0) {
      chooseImgs.forEach((v, i) => {
        wx.uploadFile({
          // 图片要上传到哪里
          url: 'https://images.ac.cn/Home/Index/UploadAction/',
          // 被上传的文件路径
          filePath: v,
          // 上传的文件的名称  后台来获取文件 file
          name: 'image',
          // 顺带的文本信息
          formData: {},
          success: (result) => {
            let url = JSON.parse(result.data).url
            this.UpLoadImgs.push(url)
            // 所有图片都上传完毕才触发
            if (i === chooseImgs.length - 1) {
              wx.hideLoading()
              console.log('文本和内容和外网的图片数组  提交到后台中')
              // 提交成功了
              //重置页面
              this.setData({
                textVal: '',
                chooseImgs: [],
              })
              //返回上一个页面
              wx.navigateBack({
                delta: 1,
              })
            }
          },
        })
      })
    } else {
      wx.hideLoading()
      console.log('只提交文本')
      wx.navigateBack({
        delta: 1,
      })
    }
  },
})
