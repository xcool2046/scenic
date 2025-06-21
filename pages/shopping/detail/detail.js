// 导入工具模块
const interaction = require('../../../utils/interaction');
const cache = require('../../../utils/cache');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    product: null,
    loading: true,
    quantity: 1,
    currentImageIndex: 0,
    
    // 购物车状态
    cartCount: 0,
    addingToCart: false,
    buying: false,
    
    // 商品图片（支持多图）
    productImages: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const productId = options.id;
    if (!productId) {
      interaction.showToast('商品信息有误');
      wx.navigateBack();
      return;
    }
    
    this.loadProductDetail(productId);
    this.loadCartCount();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadCartCount();
  },

  /**
   * 加载商品详情
   */
  loadProductDetail(productId) {
    this.setData({ loading: true });
    
    // 模拟商品详情数据（实际应从API获取）
    const mockProducts = [
      {
        id: 1,
        name: '景区定制明信片套装',
        description: '精美设计，留住美好回忆。采用高品质纸张印刷，包含10张不同景点的精美明信片，每张都是专业摄影师拍摄的经典角度。',
        price: 29.8,
        originalPrice: 35.0,
        image: '../../../assets/images/scenic_spots/lake.jpg',
        badge: '热销',
        category: 1,
        sales: 1230,
        stock: 99,
        details: [
          '📦 包装规格：10张/套',
          '📏 尺寸：14.8cm × 10.5cm',
          '🎨 材质：300g铜版纸',
          '📮 可直接邮寄',
          '🎁 精美包装，适合收藏'
        ]
      },
      {
        id: 2,
        name: '手工艺品钥匙扣',
        description: '本地工匠手工制作，每一件都是独一无二的艺术品。采用优质金属材料，表面经过特殊工艺处理，持久耐用。',
        price: 15.8,
        image: '../../../assets/images/scenic_spots/old_trees.jpg',
        badge: '新品',
        category: 1,
        sales: 856,
        stock: 156,
        details: [
          '🔑 材质：合金+珐琅',
          '📏 尺寸：5cm × 3cm',
          '🎨 工艺：手工制作',
          '💎 表面：珐琅彩绘',
          '🎁 包装：独立包装'
        ]
      },
      {
        id: 3,
        name: '景区特色茶叶',
        description: '高山茶园，口感清香。采用传统工艺制作，茶香持久，回甘悠长。每一片茶叶都经过精心挑选。',
        price: 68.0,
        originalPrice: 78.0,
        image: '../../../assets/images/routes/classic_route.jpg',
        category: 2,
        sales: 432,
        stock: 88,
        details: [
          '🍃 品种：高山绿茶',
          '📦 规格：250g/盒',
          '🌿 产地：景区高山茶园',
          '🎨 工艺：传统手工炒制',
          '📅 保质期：18个月'
        ]
      },
      {
        id: 4,
        name: '文创帆布包',
        description: '环保材质，时尚实用。采用优质帆布制作，印有景区特色图案，既实用又具有纪念意义。',
        price: 45.0,
        image: '../../../assets/images/routes/photo_route.jpg',
        category: 3,
        sales: 298,
        stock: 67,
        details: [
          '👜 材质：优质帆布',
          '📏 尺寸：38cm × 42cm × 8cm',
          '🎨 印刷：环保水性墨',
          '💪 承重：10kg',
          '🧽 护理：可机洗'
        ]
      },
      {
        id: 5,
        name: '景区导览地图纪念版',
        description: '高质量印刷，详细景点介绍。采用防水材质制作，包含景区全景地图和重要景点详细介绍，是游览和收藏的完美选择。',
        price: 12.8,
        image: '../../../assets/images/cards/map_card.jpg',
        category: 1,
        sales: 756,
        stock: 200,
        details: [
          '🗺️ 材质：防水铜版纸',
          '📏 尺寸：42cm × 30cm',
          '🎨 印刷：高清彩色印刷',
          '📍 内容：全景地图+景点介绍',
          '💧 特性：防水耐折'
        ]
      },
      {
        id: 6,
        name: '本地特色蜂蜜',
        description: '纯天然野花蜜，甘甜醇厚。来自景区周边山区的野生蜂蜜，无添加剂，保留天然营养成分，口感香甜回味悠长。',
        price: 58.0,
        image: '../../../assets/images/scenic_spots/waterfall.jpg',
        category: 2,
        sales: 623,
        stock: 45,
        details: [
          '🍯 类型：野生百花蜜',
          '📦 规格：500g/瓶',
          '🌸 来源：景区周边山区',
          '🚫 特点：无添加剂',
          '📅 保质期：24个月'
        ]
      },
      {
        id: 7,
        name: '景区摄影作品集',
        description: '专业摄影师镜头下的绝美风光。收录景区四季不同时节的精美摄影作品，高质量印刷，是摄影爱好者的珍藏之选。',
        price: 88.0,
        image: '../../../assets/images/routes/family_route.jpg',
        category: 3,
        sales: 234,
        stock: 30,
        details: [
          '📷 内容：四季风光摄影集',
          '📖 页数：128页',
          '📏 尺寸：29.7cm × 21cm',
          '🎨 印刷：高端艺术纸',
          '👨‍🎨 作者：知名风光摄影师'
        ]
      },
      {
        id: 8,
        name: '户外运动水杯',
        description: '保温保冷，户外必备。采用优质不锈钢材质，双层真空保温设计，12小时保温保冷，适合各种户外活动使用。',
        price: 35.0,
        image: '../../../assets/images/routes/route1.jpg',
        category: 5,
        sales: 445,
        stock: 120,
        details: [
          '🥤 材质：304不锈钢',
          '📏 容量：500ml',
          '🌡️ 保温：12小时保温保冷',
          '💪 特性：防漏密封',
          '🧽 护理：可拆卸易清洗'
        ]
      },
      {
        id: 9,
        name: '景区主题T恤',
        description: '舒适面料，经典设计。采用优质纯棉面料，印有景区经典景观图案，舒适透气，是日常穿着和纪念收藏的理想选择。',
        price: 78.0,
        originalPrice: 88.0,
        image: '../../../assets/images/routes/route2.jpg',
        badge: '限量',
        category: 4,
        sales: 312,
        stock: 85,
        details: [
          '👕 材质：100%纯棉',
          '📏 尺码：S/M/L/XL/XXL',
          '🎨 图案：景区经典景观',
          '💨 特性：透气舒适',
          '🧽 护理：机洗可烘干'
        ]
      },
      {
        id: 10,
        name: '户外防晒帽',
        description: '轻便透气，有效防紫外线。采用专业防晒面料，UPF50+防护等级，透气网眼设计，是户外活动的必备装备。',
        price: 42.0,
        image: '../../../assets/images/routes/route3.jpg',
        category: 4,
        sales: 218,
        stock: 150,
        details: [
          '🧢 材质：专业防晒面料',
          '☀️ 防护：UPF50+',
          '💨 设计：透气网眼',
          '📏 尺寸：可调节帽围',
          '🌈 颜色：多色可选'
        ]
      },
      {
        id: 11,
        name: '便携野餐垫',
        description: '防水耐磨，户外野餐必备。采用牛津布和PE防水层，轻便易携带，防水防潮，是户外野餐、露营的理想选择。',
        price: 56.0,
        image: '../../../assets/images/banner.jpg',
        category: 5,
        sales: 167,
        stock: 75,
        details: [
          '🏕️ 材质：牛津布+PE防水层',
          '📏 尺寸：200cm × 150cm',
          '💧 特性：防水防潮',
          '🎒 便携：可折叠收纳',
          '🧽 护理：可机洗'
        ]
      }
    ];

    const product = mockProducts.find(p => p.id == productId);
    
    setTimeout(() => {
      if (product) {
        this.setData({
          product,
          productImages: [product.image], // 简化为单张图片
          loading: false
        });
      } else {
        interaction.showToast('商品不存在');
        wx.navigateBack();
      }
    }, 500);
  },

  /**
   * 加载购物车数量
   */
  loadCartCount() {
    const cart = cache.getCartItems() || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    this.setData({ cartCount });
  },

  /**
   * 图片轮播改变
   */
  onImageChange(e) {
    this.setData({
      currentImageIndex: e.detail.current
    });
  },

  /**
   * 减少数量
   */
  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1
      });
    }
  },

  /**
   * 增加数量
   */
  increaseQuantity() {
    const { product, quantity } = this.data;
    if (quantity < product.stock) {
      this.setData({
        quantity: quantity + 1
      });
    } else {
      interaction.showToast('库存不足');
    }
  },

  /**
   * 输入数量
   */
  onQuantityInput(e) {
    const value = parseInt(e.detail.value) || 1;
    const { product } = this.data;
    
    if (value < 1) {
      this.setData({ quantity: 1 });
    } else if (value > product.stock) {
      this.setData({ quantity: product.stock });
      interaction.showToast('库存不足');
    } else {
      this.setData({ quantity: value });
    }
  },

  /**
   * 添加到购物车
   */
  addToCart() {
    if (this.data.addingToCart) return;
    
    const { product, quantity } = this.data;
    
    this.setData({ addingToCart: true });
    
    // 获取现有购物车
    const cart = cache.getCartItems() || [];
    
    // 查找是否已存在该商品
    const existingIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingIndex >= 0) {
      // 更新数量
      cart[existingIndex].quantity += quantity;
    } else {
      // 添加新商品
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image, // 使用统一的image字段
        quantity: quantity,
        addTime: Date.now()
      });
    }
    
    // 保存到缓存
    cache.setCartItems(cart);
    
    setTimeout(() => {
      this.setData({ addingToCart: false });
      this.loadCartCount();
      interaction.showToast('已添加到购物车');
    }, 500);
  },

  /**
   * 立即购买
   */
  buyNow() {
    if (this.data.buying) return;
    
    const { product, quantity } = this.data;
    
    this.setData({ buying: true });
    
    // 构建订单数据
    const orderData = {
      items: [{
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image, // 使用统一的image字段
        quantity: quantity
      }],
      totalAmount: product.price * quantity
    };
    
    // 跳转到结算页面
    setTimeout(() => {
      this.setData({ buying: false });
      wx.navigateTo({
        url: `/pages/shopping/checkout/checkout?data=${encodeURIComponent(JSON.stringify(orderData))}`
      });
    }, 500);
  },

  /**
   * 跳转到购物车
   */
  goToCart() {
    wx.navigateTo({
      url: '/pages/shopping/cart/cart'
    });
  },

  /**
   * 图片预览
   */
  previewImage(e) {
    const { product } = this.data;
    if (product && product.image) {
      wx.previewImage({
        urls: [product.image],
        current: product.image
      });
    }
  }
}); 