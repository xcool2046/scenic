// 导入工具模块
const cache = require('../../utils/cache');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchKeyword: '',
    cartCount: 0,
    loading: false,
    selectedCategory: 0, // 0表示全部
    
    // 商品分类 - 简化版
    categories: [
      { id: 0, name: '全部' },
      { id: 1, name: '纪念品' },
      { id: 2, name: '特产食品' },
      { id: 3, name: '文创用品' },
      { id: 4, name: '服装配饰' },
      { id: 5, name: '生活用品' }
    ],
    
    // 精选商品 - 确保每个分类至少有两个商品
    featuredProducts: [
      {
        id: 1,
        name: '景区定制明信片套装',
        description: '精美设计，留住美好回忆',
        price: 29.8,
        originalPrice: 35.0,
        image: '../../assets/images/scenic_spots/lake.jpg', // 湖景明信片
        badge: '热销',
        category: 1,
        sales: 1230
      },
      {
        id: 2,
        name: '手工艺品钥匙扣',
        description: '本地工匠手工制作',
        price: 15.8,
        image: '../../assets/images/scenic_spots/old_trees.jpg', // 古树工艺品
        badge: '新品',
        category: 1,
        sales: 856
      },
      {
        id: 3,
        name: '景区特色茶叶',
        description: '高山茶园，口感清香',
        price: 68.0,
        originalPrice: 78.0,
        image: '../../assets/images/routes/classic_route.jpg', // 经典路线茶园
        category: 2,
        sales: 432
      },
      {
        id: 4,
        name: '文创帆布包',
        description: '环保材质，时尚实用',
        price: 45.0,
        image: '../../assets/images/routes/photo_route.jpg', // 摄影路线主题设计
        category: 3,
        sales: 298
      },
      {
        id: 5,
        name: '景区导览地图纪念版',
        description: '高质量印刷，详细景点介绍',
        price: 12.8,
        image: '../../assets/images/cards/map_card.jpg', // 地图卡片
        category: 1,
        sales: 756
      },
      {
        id: 6,
        name: '本地特色蜂蜜',
        description: '纯天然野花蜜，甘甜醇厚',
        price: 58.0,
        image: '../../assets/images/scenic_spots/waterfall.jpg', // 瀑布野花蜂蜜
        category: 2,
        sales: 623
      },
      {
        id: 7,
        name: '景区摄影作品集',
        description: '专业摄影师镜头下的绝美风光',
        price: 88.0,
        image: '../../assets/images/routes/family_route.jpg', // 家庭路线摄影集
        category: 3,
        sales: 234
      },
      {
        id: 8,
        name: '户外运动水杯',
        description: '保温保冷，户外必备',
        price: 35.0,
        image: '../../assets/images/routes/route1.jpg', // 户外运动路线
        category: 5,
        sales: 445
      },
      {
        id: 9,
        name: '景区主题T恤',
        description: '舒适面料，经典设计',
        price: 78.0,
        originalPrice: 88.0,
        image: '../../assets/images/routes/route2.jpg', // 路线主题设计
        badge: '限量',
        category: 4,
        sales: 312
      },
      {
        id: 10,
        name: '户外防晒帽',
        description: '轻便透气，有效防紫外线',
        price: 42.0,
        image: '../../assets/images/routes/route3.jpg', // 户外路线
        category: 4,
        sales: 218
      },
      {
        id: 11,
        name: '便携野餐垫',
        description: '防水耐磨，户外野餐必备',
        price: 56.0,
        image: '../../assets/images/banner.jpg', // 户外场景
        category: 5,
        sales: 167
      }
    ],
    
    // 所有商品备份（用于分类筛选）
    allProducts: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('码上消费页面加载');
    this.initializeData();
    this.loadCartCount();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.loadCartCount();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refreshProducts();
  },

  /**
   * 初始化数据
   */
  initializeData: function() {
    // 备份所有商品用于筛选
    this.setData({
      allProducts: this.data.featuredProducts
    });
  },

  /**
   * 搜索输入
   */
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  /**
   * 执行搜索
   */
  onSearch: function() {
    const keyword = this.data.searchKeyword.trim();
    if (keyword) {
      this.filterProducts(keyword);
    } else {
      this.setData({
        featuredProducts: this.data.allProducts
      });
    }
  },

  /**
   * 分类点击
   */
  onCategoryTap: function(e) {
    const categoryId = e.currentTarget.dataset.id;
    this.setData({
      selectedCategory: categoryId
    });
    this.filterByCategory(categoryId);
  },

  /**
   * 按分类筛选商品
   */
  filterByCategory: function(categoryId) {
    const allProducts = this.data.allProducts;
    let filteredProducts = allProducts;
    
    if (categoryId !== 0) {
      filteredProducts = allProducts.filter(product => product.category === categoryId);
    }
    
    this.setData({
      featuredProducts: filteredProducts
    });
  },

  /**
   * 按关键词筛选商品
   */
  filterProducts: function(keyword) {
    const allProducts = this.data.allProducts;
    const filteredProducts = allProducts.filter(product => 
      product.name.includes(keyword) || 
      product.description.includes(keyword)
    );
    
    this.setData({
      featuredProducts: filteredProducts
    });
    
    if (filteredProducts.length === 0) {
      wx.showToast({
        title: '暂无相关商品',
        icon: 'none'
      });
    }
  },

  /**
   * 查看商品详情
   */
  viewProductDetail: function(e) {
    const product = e.currentTarget.dataset.product;
    console.log('查看商品详情:', product);
    wx.navigateTo({
      url: `/pages/shopping/detail/detail?id=${product.id}`
    });
  },

  /**
   * 添加到购物车
   */
  addToCart: function(e) {
    const product = e.currentTarget.dataset.product;
    if (!product) return;
    
    console.log('添加到购物车:', product);
    
    // 添加购物车逻辑
    const cartItems = cache.getCartItems() || [];
    const existingIndex = cartItems.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
      cartItems[existingIndex].quantity += 1;
    } else {
      cartItems.push({
        ...product,
        quantity: 1,
        addTime: Date.now()
      });
    }
    
    cache.setCartItems(cartItems);
    this.loadCartCount();
    
    // 显示成功提示
    wx.showToast({
      title: '已添加到购物车',
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * 前往购物车
   */
  goToCart: function() {
    wx.navigateTo({
      url: '/pages/shopping/cart/cart'
    });
  },

  /**
   * 加载购物车数量
   */
  loadCartCount: function() {
    const cartItems = cache.getCartItems() || [];
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    this.setData({
      cartCount: cartCount
    });
  },

  /**
   * 刷新商品
   */
  refreshProducts: function() {
    this.setData({
      loading: true
    });
    
    // 模拟加载延迟
    setTimeout(() => {
      this.setData({
        loading: false,
        featuredProducts: this.data.allProducts,
        selectedCategory: 0
      });
      wx.stopPullDownRefresh();
    }, 1000);
  }
});