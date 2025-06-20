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
        images: [
          '../../assets/images/spots/spot1.jpg',
          '../../assets/images/spots/spot2.jpg',
          '../../assets/images/spots/spot3.jpg'
        ],
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
        images: [
          '../../assets/images/spots/spot2.jpg',
          '../../assets/images/spots/spot1.jpg'
        ],
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
        images: [
          '../../assets/images/spots/spot3.jpg',
          '../../assets/images/spots/spot4.jpg'
        ],
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
        images: [
          '../../assets/images/spots/spot4.jpg',
          '../../assets/images/spots/spot1.jpg'
        ],
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
      }
    ];

    const product = mockProducts.find(p => p.id == productId);
    
    setTimeout(() => {
      if (product) {
        this.setData({
          product,
          productImages: product.images || [product.image],
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
    const cart = cache.get('shopping_cart') || [];
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
    const cart = cache.get('shopping_cart') || [];
    
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
        image: product.images[0],
        quantity: quantity
      });
    }
    
    // 保存到缓存
    cache.set('shopping_cart', cart);
    
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
        image: product.images[0],
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
   * 预览图片
   */
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.productImages[index],
      urls: this.data.productImages
    });
  }
}); 