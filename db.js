// db.js - 纯前端数据管理（localStorage存储）
// 所有数据存在浏览器本地，管理后台修改后自动保存

const DB = {
  // 店铺配置
  config: {
    shopName: '郴州厨具家具',
    logoUrl: '',
    heroLogoUrl: '',
    heroBgs: [],  // 首页横幅多图轮播
    heroSlogan: '15年行业经验 · 500+客户信赖 · 正品保障',
    phone: '13800000000',
    wechat: 'czzwcj001',
    address: '湖南省郴州市XX区XX路XX号',
    mapUrl: '',
    adminPassword: 'chenzhou2024'
  },

  // 首页统计数据（可在管理后台修改）
  stats: [
    { num: '15', label: '年经验' },
    { num: '500+', label: '服务客户' },
    { num: '200+', label: '在售产品' },
    { num: '24h', label: '售后响应' }
  ],

  // 初始示例数据
  initData: {
    products: [
      { id: 'p1', name: '商用双眼双温灶', category: '商用灶具', price: '2,800-4,500', unit: '台', video: '', images: [], specs: { '尺寸': '1800×900×800mm', '功率': '30kW×2', '材质': '201不锈钢', '燃气类型': '天然气/液化气通用' }, description: '高效节能商用双眼灶', descriptionContent: [{ type: 'text', value: '高效节能商用双眼灶，适合中餐厅、食堂等高频使用场景。' }, { type: 'text', value: '核心优势：' }, { type: 'text', value: '🔥 热效率高，火力猛，节能30%以上' }, { type: 'text', value: '🔥 201不锈钢机身，耐用10年+' }, { type: 'text', value: '🔥 天然气/液化气通用，不挑气源' }], featured: true },
      { id: 'p2', name: '商用四眼煲仔炉', category: '商用灶具', price: '3,200-5,800', unit: '台', video: '', images: [], specs: { '尺寸': '800×900×800mm', '功率': '8kW×4', '材质': '304不锈钢', '适用场景': '煲仔饭专门店' }, description: '专为煲仔饭店设计', descriptionContent: [{ type: 'text', value: '专为煲仔饭店设计，四眼独立控温，出餐快，受热均匀不糊底。' }, { type: 'text', value: '304不锈钢材质，耐高温耐腐蚀，使用寿命长。' }], featured: true },
      { id: 'p3', name: '商用双门冷藏柜', category: '制冷', price: '3,500-6,200', unit: '台', video: '', images: [], specs: { '尺寸': '1200×700×1900mm', '容积': '1000L', '温度范围': '0~10℃', '功率': '320W' }, description: '大功率压缩机冷藏柜', descriptionContent: [{ type: 'text', value: '大功率压缩机，制冷快，保温好。' }, { type: 'text', value: '适合餐厅、酒店后厨食材储存，1000L大容量满足日常需求。' }], featured: true },
      { id: 'p4', name: '商用电热炸炉（双缸）', category: '加工', price: '1,800-3,200', unit: '台', video: '', images: [], specs: { '尺寸': '600×550×350mm', '功率': '6kW×2', '容量': '12L×2', '温控范围': '50~200℃' }, description: '双缸独立控温炸炉', descriptionContent: [{ type: 'text', value: '双缸独立控温，可同时炸不同食材。自动恒温，操作简便，清洗方便。' }], featured: false },
      { id: 'p5', name: '商用油烟净化一体机', category: '排烟', price: '5,800-12,000', unit: '台', video: '', images: [], specs: { '处理风量': '8000m³/h', '净化效率': '≥95%', '功率': '550W', '尺寸': '可定制' }, description: '环保达标油烟净化机', descriptionContent: [{ type: 'text', value: '符合环保排放标准，低空排放无异味。' }, { type: 'text', value: '郴州本地有大量安装案例，可上门测量设计。净化效率≥95%，一次投资长期合规。' }], featured: true },
      { id: 'p6', name: '酒店宴会圆桌（1.8米）', category: '餐桌', price: '1,200-2,800', unit: '张', video: '', images: [], specs: { '直径': '1.8米', '桌面材质': '防火板/大理石可选', '桌腿材质': '不锈钢/实木可选', '适合人数': '10-12人' }, description: '宴会厅标配圆桌', descriptionContent: [{ type: 'text', value: '宴会厅标配，坚固耐用，多种桌面材质可选。' }, { type: 'text', value: '支持定制尺寸和logo雕刻，防火板/大理石桌面任选。' }], featured: true },
      { id: 'p7', name: '快餐店卡座沙发座椅', category: '餐椅', price: '380-680', unit: '位', video: '', images: [], specs: { '尺寸': '1200×600×900mm（双人位）', '框架': '实木框架', '面料': '耐磨PU皮/布料可选', '颜色': '多种颜色可选' }, description: '快餐店首选卡座', descriptionContent: [{ type: 'text', value: '快餐店、火锅店首选，舒适耐用，易清洁。' }, { type: 'text', value: '支持来样定制，PU皮/布料面料可选。' }], featured: false },
      { id: 'p8', name: '商用洗碗机（长龙式）', category: '洗涤', price: '8,500-18,000', unit: '台', video: '', images: [], specs: { '清洗能力': '2000-5000件/小时', '功率': '18kW', '尺寸': '可定制', '加热方式': '电加热/蒸汽加热可选' }, description: '高效省水长龙洗碗机', descriptionContent: [{ type: 'text', value: '高效省水，适合学校食堂、大型酒楼。' }, { type: 'text', value: '有现货，可预约上门安装调试。2000-5000件/小时清洗能力。' }], featured: false }
    ],
    cases: [
      { id: 'c1', title: '郴州XX火锅店全套厨房设备配置', category: '火锅店', description: '350㎡火锅店，含18张台面。全套商用厨具配置，含双眼灶、排烟系统、冷藏设备等。', equipmentList: ['双眼双温灶×2', '油烟净化一体机×1', '双门冷藏柜×3', '电热炸炉×1', '商用洗碗机×1'], totalPrice: '8.5-12万', duration: '7天', customerNeed: '客户要求：环保达标、节能高效、售后及时', result: '已完工，客户满意，后续追加了10张火锅桌', featured: true },
      { id: 'c2', title: '郴州XX酒店宴会厅家具配置', category: '酒店', description: '500人宴会厅，60张1.8米圆桌+480张餐椅。', equipmentList: ['1.8米宴会圆桌×60', '宴会餐椅×480', '主宾台×2'], totalPrice: '15-22万', duration: '15天', customerNeed: '客户要求：款式统一、质量可靠、按时交付', result: '按期交付，酒店已正式营业', featured: true }
    ],
    knowledge: [
      { id: 'k1', title: '商用不锈钢怎么辨别201和304？一文教会你', summary: '市面上很多商家用201冒充304卖，价格差一倍！教你3个简单方法现场辨别。', content: '很多客户买厨具被骗，商家说是不锈钢，结果是201甚至更差的材质。这里教大家三个简单的辨别方法：\n\n1. 用磁铁吸：304不锈钢磁性很弱，基本吸不住；201磁性较强，能吸住。这是最简单的方法。\n\n2. 看光泽：304表面更亮、更光滑；201偏暗，表面粗糙一些。\n\n3. 滴试剂：市面上有专门的不锈钢检测液，滴一滴变色的就是201。\n\n买厨具时一定让商家写明材质，最好现场用磁铁试一下。别花了304的钱买到201的货！', category: '避坑', readCount: 328, featured: true },
      { id: 'k2', title: '商用灶具功率怎么选？不同餐厅配置指南', summary: '中餐厅、火锅店、食堂、西餐厅，每种场景需要的灶具功率完全不同，选错了又费气又慢。', content: '商用灶具的功率选择直接影响出餐速度和用气成本。不同场景的配置建议：\n\n1. 中餐厅：双眼双温灶30kW×2，基本够用。炒菜猛火爆炒，功率不能太低。\n\n2. 火锅店：不需要大火力灶，但需要多眼煲仔炉或电磁炉，单眼8kW左右。\n\n3. 食堂：大锅菜需要大功率，建议双眼35kW以上，或者用大锅灶。\n\n4. 西餐厅：平顶煎灶+煲仔炉组合，煎灶15-20kW即可。\n\n选灶具不是功率越大越好，关键看你的出餐量。过大浪费气，过小出餐慢。', category: '科普', readCount: 256, featured: true }
    ],
    inquiries: []
  },

  // 读取数据
  get(key) {
    const data = localStorage.getItem('h5_shop_' + key);
    if (data) return JSON.parse(data);
    // 初始化
    if (this.initData[key]) {
      this.set(key, this.initData[key]);
      return this.initData[key];
    }
    return [];
  },

  // 写入数据
  set(key, value) {
    localStorage.setItem('h5_shop_' + key, JSON.stringify(value));
  },

  // 数据版本（升级时自动迁移旧缓存）
  DATA_VERSION: 2,

  // 获取配置（自动迁移旧版本数据）
  getConfig() {
    const saved = localStorage.getItem('h5_shop_config');
    if (saved) {
      const config = JSON.parse(saved);
      // 迁移：旧版 heroBgImage 单图 → 新版 heroBgs 多图数组
      if (config.heroBgImage !== undefined && !config.heroBgs) {
        config.heroBgs = config.heroBgImage ? [config.heroBgImage] : [];
        delete config.heroBgImage;
        this.setConfig(config);
      }
      // 迁移：旧版分类"灶具" → "商用灶具"
      const products = JSON.parse(localStorage.getItem('h5_shop_products') || 'null');
      if (products && products.length > 0) {
        let migrated = false;
        products.forEach(p => {
          if (p.category === '灶具') { p.category = '商用灶具'; migrated = true; }
        });
        if (migrated) localStorage.setItem('h5_shop_products', JSON.stringify(products));
      }
      return config;
    }
    this.setConfig(this.config);
    return this.config;
  },

  // 保存配置
  setConfig(config) {
    localStorage.setItem('h5_shop_config', JSON.stringify(config));
  },

  // 获取统计数据
  getStats() {
    const saved = localStorage.getItem('h5_shop_stats');
    if (saved) return JSON.parse(saved);
    this.setStats(this.stats);
    return this.stats;
  },

  // 保存统计数据
  setStats(stats) {
    localStorage.setItem('h5_shop_stats', JSON.stringify(stats));
  },

  // 产品操作
  getProducts() { return this.get('products'); },
  getProduct(id) { return this.getProducts().find(p => p.id === id); },
  addProduct(data) {
    const products = this.getProducts();
    const newProduct = { id: 'p' + Date.now(), ...data, createdAt: new Date().toISOString() };
    products.push(newProduct);
    this.set('products', products);
    return newProduct;
  },
  updateProduct(id, data) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...data, updatedAt: new Date().toISOString() };
    this.set('products', products);
    return products[index];
  },
  deleteProduct(id) {
    let products = this.getProducts();
    products = products.filter(p => p.id !== id);
    this.set('products', products);
  },

  // 案例操作
  getCases() { return this.get('cases'); },
  getCase(id) { return this.getCases().find(c => c.id === id); },
  addCase(data) {
    const cases = this.getCases();
    const newCase = { id: 'c' + Date.now(), ...data, createdAt: new Date().toISOString() };
    cases.push(newCase);
    this.set('cases', cases);
    return newCase;
  },
  updateCase(id, data) {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === id);
    if (index === -1) return null;
    cases[index] = { ...cases[index], ...data, updatedAt: new Date().toISOString() };
    this.set('cases', cases);
    return cases[index];
  },
  deleteCase(id) {
    let cases = this.getCases();
    cases = cases.filter(c => c.id !== id);
    this.set('cases', cases);
  },

  // 知识库操作
  getKnowledge() { return this.get('knowledge'); },
  getArticle(id) { return this.getKnowledge().find(k => k.id === id); },
  addArticle(data) {
    const knowledge = this.getKnowledge();
    const newArticle = { id: 'k' + Date.now(), ...data, readCount: 0, createdAt: new Date().toISOString() };
    knowledge.push(newArticle);
    this.set('knowledge', knowledge);
    return newArticle;
  },
  updateArticle(id, data) {
    const knowledge = this.getKnowledge();
    const index = knowledge.findIndex(k => k.id === id);
    if (index === -1) return null;
    knowledge[index] = { ...knowledge[index], ...data, updatedAt: new Date().toISOString() };
    this.set('knowledge', knowledge);
    return knowledge[index];
  },
  deleteArticle(id) {
    let knowledge = this.getKnowledge();
    knowledge = knowledge.filter(k => k.id !== id);
    this.set('knowledge', knowledge);
  },

  // 询价操作
  getInquiries() { return this.get('inquiries'); },
  addInquiry(data) {
    const inquiries = this.getInquiries();
    const newInquiry = { id: 'i' + Date.now(), ...data, status: '待处理', createdAt: new Date().toISOString() };
    inquiries.push(newInquiry);
    this.set('inquiries', inquiries);
    return newInquiry;
  },
  updateInquiry(id, data) {
    const inquiries = this.getInquiries();
    const index = inquiries.findIndex(i => i.id === id);
    if (index === -1) return null;
    inquiries[index] = { ...inquiries[index], ...data };
    this.set('inquiries', inquiries);
    return inquiries[index];
  },
  deleteInquiry(id) {
    let inquiries = this.getInquiries();
    inquiries = inquiries.filter(i => i.id !== id);
    this.set('inquiries', inquiries);
  },

  // 导出所有数据（备份用）
  exportAll() {
    return {
      config: this.getConfig(),
      stats: this.getStats(),
      products: this.getProducts(),
      cases: this.getCases(),
      knowledge: this.getKnowledge(),
      inquiries: this.getInquiries()
    };
  },

  // 导入数据（恢复用）
  importAll(data) {
    if (data.config) this.setConfig(data.config);
    if (data.stats) this.setStats(data.stats);
    if (data.products) this.set('products', data.products);
    if (data.cases) this.set('cases', data.cases);
    if (data.knowledge) this.set('knowledge', data.knowledge);
    if (data.inquiries) this.set('inquiries', data.inquiries);
  }
};
