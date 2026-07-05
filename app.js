// app.js - 前端展示逻辑（自动从云端拉取最新数据）

// ============ 从云端加载最新数据 ============
async function loadCloudData() {
  try {
    const resp = await fetch('data.json?t=' + Date.now());
    if (resp.ok) {
      const data = await resp.json();
      // 只导入内容数据，不覆盖本地询价记录
      if (data.config) DB.setConfig(data.config);
      if (data.stats) DB.setStats(data.stats);
      if (data.products) DB.set('products', data.products);
      if (data.cases) DB.set('cases', data.cases);
      if (data.knowledge) DB.set('knowledge', data.knowledge);
      return true;
    }
  } catch(e) {
    console.log('云端数据加载失败，使用本地数据', e);
  }
  return false;
}

let CONFIG = {};

function initConfig() {
  CONFIG = DB.getConfig();
  // 导航栏Logo
  const logoImg = document.getElementById('logo-img');
  const logoText = document.getElementById('logo-text');
  if (CONFIG.logoUrl) {
    logoImg.src = CONFIG.logoUrl;
    logoImg.classList.remove('hidden');
    logoText.classList.add('hidden');
  } else {
    logoImg.classList.add('hidden');
    logoText.classList.remove('hidden');
    logoText.textContent = '🏪 ' + CONFIG.shopName;
  }

  // 首页横幅Logo（独立于导航栏）
  const heroLogo = document.getElementById('hero-logo');
  if (CONFIG.heroLogoUrl) {
    heroLogo.src = CONFIG.heroLogoUrl;
    heroLogo.classList.remove('hidden');
  } else {
    heroLogo.classList.add('hidden');
  }
  // Hero标题与标语
  document.getElementById('hero-title').textContent = CONFIG.shopName;
  document.title = (CONFIG.shopName || '商用厨具酒店家具') + ' - 产品展示';
  document.getElementById('hero-slogan').textContent = CONFIG.heroSlogan || '15年行业经验 · 500+客户信赖 · 正品保障';
  // Hero背景图轮播
  const heroBgs = CONFIG.heroBgs || [];
  // 兼容旧版单图数据
  const bgImages = heroBgs.length > 0 ? heroBgs : (CONFIG.heroBgImage ? [CONFIG.heroBgImage] : []);
  initHeroCarousel(bgImages);
  // 统计数据
  const stats = DB.getStats();
  const statsBar = document.getElementById('stats-bar');
  if (statsBar) {
    statsBar.innerHTML = stats.map(s => `
      <div class="stat-item"><div class="stat-num">${s.num}</div><div class="stat-label">${s.label}</div></div>
    `).join('');
  }
  document.getElementById('contact-phone').textContent = CONFIG.phone;
  document.getElementById('contact-wechat').textContent = '点击复制: ' + CONFIG.wechat;
  document.getElementById('contact-address').textContent = CONFIG.address;
}

// ============ 首页横幅轮播 ============
let heroCarouselTimer = null;
let heroCarouselIdx = 0;

function initHeroCarousel(images) {
  const carousel = document.getElementById('hero-bg-carousel');
  const dots = document.getElementById('hero-bg-dots');
  if (!carousel || !dots) return;
  
  // 停止旧定时器
  if (heroCarouselTimer) clearInterval(heroCarouselTimer);
  heroCarouselIdx = 0;

  if (!images.length) {
    carousel.innerHTML = '';
    dots.innerHTML = '';
    return;
  }

  // 渲染幻灯片
  carousel.innerHTML = images.map((src, i) =>
    `<div class="hero-bg-slide ${i === 0 ? 'active' : ''}" style="background-image:url(${src})"></div>`
  ).join('');

  // 渲染指示点
  if (images.length > 1) {
    dots.innerHTML = images.map((_, i) =>
      `<span class="hero-bg-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></span>`
    ).join('');
    dots.querySelectorAll('.hero-bg-dot').forEach(dot => {
      dot.addEventListener('click', function() {
        goHeroSlide(parseInt(this.dataset.idx), images.length);
      });
    });
  } else {
    dots.innerHTML = '';
  }

  // 自动播放
  if (images.length > 1) {
    startHeroAutoPlay(images.length);
  }

  // 触摸滑动
  let touchStartX = 0, touchEndX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopHeroAutoPlay();
  }, { passive: true });
  carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goHeroSlide((heroCarouselIdx + 1) % images.length, images.length);
      else goHeroSlide((heroCarouselIdx - 1 + images.length) % images.length, images.length);
    }
    startHeroAutoPlay(images.length);
  });
}

function goHeroSlide(idx, total) {
  heroCarouselIdx = idx;
  document.querySelectorAll('.hero-bg-slide').forEach((s, i) => {
    s.classList.toggle('active', i === idx);
  });
  document.querySelectorAll('.hero-bg-dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
}

function startHeroAutoPlay(total) {
  stopHeroAutoPlay();
  heroCarouselTimer = setInterval(() => {
    goHeroSlide((heroCarouselIdx + 1) % total, total);
  }, 4000);
}

function stopHeroAutoPlay() {
  if (heroCarouselTimer) { clearInterval(heroCarouselTimer); heroCarouselTimer = null; }
}

// ============ 页面路由 ============
function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.remove('hidden');
  document.querySelectorAll('.tabbar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  if (page === 'home') loadHome();
  if (page === 'products') loadProducts();
  if (page === 'cases') loadCases();
  if (page === 'knowledge') loadKnowledge();
  if (page === 'contact') initConfig();
  window.scrollTo(0, 0);
}

function goHome() { switchPage('home'); }

// ============ 渲染产品卡片媒体区域（支持视频+图片） ============
function renderProductCardMedia(p) {
  if (p.video) {
    return `<div class="product-img has-video" onclick="showProductDetail('${p.id}')">
      <video src="${p.video}" muted preload="metadata" style="width:100%;height:100%;object-fit:cover;"></video>
      <div class="video-play-badge">▶ 视频</div>
    </div>`;
  }
  if (p.images && p.images[0]) {
    return `<div class="product-img" onclick="showProductDetail('${p.id}')">
      <img src="${p.images[0]}" style="width:100%;height:100%;object-fit:cover;">
    </div>`;
  }
  return `<div class="product-img" onclick="showProductDetail('${p.id}')">🍳</div>`;
}

// ============ 渲染图文混排内容 ============
function renderDescriptionContent(contentArr) {
  if (!contentArr || !contentArr.length) return '<p style="color:#999;">暂无详细介绍</p>';
  return contentArr.map(item => {
    if (item.type === 'image' && item.value) {
      return `<div class="desc-img-wrap"><img src="${item.value}" class="desc-img" onclick="previewImage('${item.value}')"></div>`;
    }
    if (item.type === 'text' && item.value) {
      return `<p class="desc-text">${item.value}</p>`;
    }
    return '';
  }).join('');
}

// 图片预览（简单全屏查看）
function previewImage(url) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;cursor:pointer;';
  overlay.onclick = () => overlay.remove();
  const img = document.createElement('img');
  img.src = url;
  img.style.cssText = 'max-width:95%;max-height:95%;object-fit:contain;';
  overlay.appendChild(img);
  document.body.appendChild(overlay);
}

// ============ 首页 ============
function loadHome() {
  const products = DB.getProducts();
  const cases = DB.getCases();
  const knowledge = DB.getKnowledge();

  const hotProducts = products.filter(p => p.featured).slice(0, 6);
  document.getElementById('home-products').innerHTML = hotProducts.map(p => `
    <div class="product-card" onclick="showProductDetail('${p.id}')">
      ${renderProductCardMedia(p)}
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">¥${p.price}</div>
        <div class="product-category">${p.category}</div>
      </div>
    </div>`).join('') || '<div class="empty-tip">暂无产品</div>';

  const hotCases = cases.filter(c => c.featured).slice(0, 3);
  document.getElementById('home-cases').innerHTML = hotCases.map(c => `
    <div class="case-card" onclick="showCaseDetail('${c.id}')">
      <div class="case-img">${c.title}</div>
      <div class="case-info">
        <div class="case-title">${c.title}</div>
        <div class="case-meta"><span>📋 ${c.category}</span><span>⏱ ${c.duration || ''}</span></div>
        <div class="case-price">¥${c.totalPrice}</div>
      </div>
    </div>`).join('') || '<div class="empty-tip">暂无案例</div>';

  const hotKnow = knowledge.filter(k => k.featured).slice(0, 3);
  document.getElementById('home-knowledge').innerHTML = hotKnow.map(k => `
    <div class="knowledge-card" onclick="showKnowledgeDetail('${k.id}')">
      <div class="knowledge-title">${k.title}</div>
      <div class="knowledge-summary">${k.summary}</div>
      <div class="knowledge-meta"><span>📖 ${k.category}</span><span>👁 ${k.readCount || 0}次阅读</span></div>
    </div>`).join('') || '<div class="empty-tip">暂无文章</div>';
}

// ============ 产品中心 ============
function loadProducts() {
  const products = DB.getProducts();
  const cats = ['全部', ...new Set(products.map(p => p.category))];
  document.getElementById('category-tabs').innerHTML = cats.map((c, i) =>
    `<div class="cat-tab ${i === 0 ? 'active' : ''}" onclick="filterByCategory('${c}', this)">${c}</div>`
  ).join('');
  renderProducts(products);
}

function filterByCategory(cat, el) {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const products = DB.getProducts();
  renderProducts(cat === '全部' ? products : products.filter(p => p.category === cat));
}

function filterProducts() {
  const keyword = document.getElementById('search-input').value.trim().toLowerCase();
  const activeCat = document.querySelector('.cat-tab.active');
  const cat = activeCat ? activeCat.textContent : '全部';
  let list = cat === '全部' ? DB.getProducts() : DB.getProducts().filter(p => p.category === cat);
  if (keyword) list = list.filter(p => p.name.toLowerCase().includes(keyword) || p.category.toLowerCase().includes(keyword));
  renderProducts(list);
}

function renderProducts(products) {
  const list = document.getElementById('products-list');
  const empty = document.getElementById('products-empty');
  if (!products.length) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.innerHTML = products.map(p => `
    <div class="product-card" onclick="showProductDetail('${p.id}')">
      ${renderProductCardMedia(p)}
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">¥${p.price}</div>
        <div class="product-category">${p.category}${p.video ? ' 🎬' : ''}</div>
      </div>
    </div>`).join('');
}

// ============ 产品详情页（支持视频+图片轮播+图文介绍） ============
function showProductDetail(id) {
  const p = DB.getProduct(id);
  if (!p) return;
  const specsHtml = p.specs ? Object.entries(p.specs).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('') : '';

  // 顶部媒体区：如果有视频则显示视频播放器，否则显示图片轮播
  let mediaHtml = '';
  if (p.video) {
    mediaHtml = `
      <div class="detail-video-wrap">
        <video controls playsinline preload="metadata" poster="${p.images && p.images[0] ? p.images[0] : ''}" style="width:100%;max-height:300px;">
          <source src="${p.video}">
          您的浏览器不支持视频播放
        </video>
        ${p.images && p.images.length ? `<div class="detail-media-tabs"><span class="media-tab active" onclick="switchDetailMedia('video',this)">🎬 视频</span><span class="media-tab" onclick="switchDetailMedia('images',this)">📷 图片(${p.images.length})</span></div>` : ''}
      </div>`;
  } else if (p.images && p.images.length) {
    mediaHtml = `
      <div class="detail-images-wrap">
        <div class="detail-image-slider" id="detail-slider">
          ${p.images.map((img, i) => `<div class="slider-item${i === 0 ? ' active' : ''}" data-index="${i}"><img src="${img}" onclick="previewImage('${img}')"></div>`).join('')}
        </div>
        ${p.images.length > 1 ? `<div class="slider-nav"><button onclick="sliderPrev()">‹</button><span id="slider-counter">1/${p.images.length}</span><button onclick="sliderNext()">›</button></div>` : ''}
      </div>`;
  } else {
    mediaHtml = `<div class="detail-img">🍳</div>`;
  }

  // 产品介绍：使用图文混排渲染
  const descContent = p.descriptionContent || (p.description ? [{ type: 'text', value: p.description }] : []);
  const descHtml = renderDescriptionContent(descContent);

  // 图片轮播隐藏区域（视频模式下切换用）
  let imagesHiddenHtml = '';
  if (p.video && p.images && p.images.length) {
    imagesHiddenHtml = `
      <div class="detail-images-wrap hidden" id="detail-images-hidden">
        <div class="detail-image-slider" id="detail-slider-hidden">
          ${p.images.map((img, i) => `<div class="slider-item${i === 0 ? ' active' : ''}" data-index="${i}"><img src="${img}" onclick="previewImage('${img}')"></div>`).join('')}
        </div>
        ${p.images.length > 1 ? `<div class="slider-nav"><button onclick="sliderPrevHidden()">‹</button><span id="slider-counter-hidden">1/${p.images.length}</span><button onclick="sliderNextHidden()">›</button></div>` : ''}
      </div>`;
  }

  document.getElementById('product-detail-content').innerHTML = `
    <div class="detail-media-area" id="detail-media-area">
      ${mediaHtml}
      ${imagesHiddenHtml}
    </div>
    <div class="detail-body">
      <div class="detail-name">${p.name}${p.video ? ' <span class="video-badge">🎬 有视频</span>' : ''}</div>
      <div class="detail-price">¥${p.price}/${p.unit || '台'}</div>
      <div class="detail-specs"><h3>规格参数</h3><table class="specs-table">${specsHtml}</table></div>
      <div class="detail-desc"><h3>产品介绍</h3><div class="desc-content">${descHtml}</div></div>
    </div>
    <div class="detail-actions">
      <button class="btn btn-outline" onclick="callPhone()">📞 电话咨询</button>
      <button class="btn btn-primary" onclick="openInquiry('${p.name}')">💬 在线询价</button>
    </div>`;
  document.querySelectorAll('.page').forEach(pg => pg.classList.add('hidden'));
  document.getElementById('page-product-detail').classList.remove('hidden');
  window.scrollTo(0, 0);
}

// 详情页媒体切换（视频 ↔ 图片）
function switchDetailMedia(type, el) {
  const videoWrap = document.querySelector('.detail-video-wrap');
  const imagesHidden = document.getElementById('detail-images-hidden');
  document.querySelectorAll('.media-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  if (type === 'video') {
    if (videoWrap) videoWrap.classList.remove('hidden');
    if (imagesHidden) imagesHidden.classList.add('hidden');
  } else {
    if (videoWrap) videoWrap.classList.add('hidden');
    if (imagesHidden) imagesHidden.classList.remove('hidden');
  }
}

// 图片轮播控制
let sliderIndex = 0;
function sliderPrev() {
  const items = document.querySelectorAll('#detail-slider .slider-item');
  if (!items.length) return;
  sliderIndex = (sliderIndex - 1 + items.length) % items.length;
  updateSlider('detail-slider', 'slider-counter');
}
function sliderNext() {
  const items = document.querySelectorAll('#detail-slider .slider-item');
  if (!items.length) return;
  sliderIndex = (sliderIndex + 1) % items.length;
  updateSlider('detail-slider', 'slider-counter');
}
let sliderIndexHidden = 0;
function sliderPrevHidden() {
  const items = document.querySelectorAll('#detail-slider-hidden .slider-item');
  if (!items.length) return;
  sliderIndexHidden = (sliderIndexHidden - 1 + items.length) % items.length;
  updateSlider('detail-slider-hidden', 'slider-counter-hidden');
}
function sliderNextHidden() {
  const items = document.querySelectorAll('#detail-slider-hidden .slider-item');
  if (!items.length) return;
  sliderIndexHidden = (sliderIndexHidden + 1) % items.length;
  updateSlider('detail-slider-hidden', 'slider-counter-hidden');
}
function updateSlider(sliderId, counterId) {
  const slider = document.getElementById(sliderId);
  const counter = document.getElementById(counterId);
  const idx = sliderId.includes('hidden') ? sliderIndexHidden : sliderIndex;
  const items = slider.querySelectorAll('.slider-item');
  items.forEach(it => it.classList.remove('active'));
  items[idx]?.classList.add('active');
  slider.style.transform = `translateX(-${idx * 100}%)`;
  if (counter) counter.textContent = `${idx + 1}/${items.length}`;
}

// ============ 案例 ============
function loadCases() {
  const cases = DB.getCases();
  const list = document.getElementById('cases-list');
  const empty = document.getElementById('cases-empty');
  if (!cases.length) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.innerHTML = cases.map(c => `
    <div class="case-card" onclick="showCaseDetail('${c.id}')">
      <div class="case-img">${c.title}</div>
      <div class="case-info">
        <div class="case-title">${c.title}</div>
        <div class="case-meta"><span>📋 ${c.category}</span><span>⏱ ${c.duration || ''}</span></div>
        <div class="case-price">¥${c.totalPrice}</div>
      </div>
    </div>`).join('');
}

function showCaseDetail(id) {
  const c = DB.getCase(id);
  if (!c) return;
  const equipHtml = (c.equipmentList || []).map(e => `<div>✅ ${e}</div>`).join('');
  document.getElementById('case-detail-content').innerHTML = `
    <div class="case-detail-img">${c.title}</div>
    <div class="case-detail-body">
      <h2>${c.title}</h2>
      <p>${(c.description || '').replace(/\n/g, '<br>')}</p>
      <h3>📦 设备清单</h3>
      <div class="case-equip-list">${equipHtml}</div>
      <h3>💰 方案总价</h3>
      <p style="color:#e74c1f;font-size:20px;font-weight:bold;">¥${c.totalPrice}</p>
      <h3>⏱ 工期</h3><p>${c.duration || ''}</p>
      <h3>💡 客户需求</h3><p>${(c.customerNeed || '').replace(/\n/g, '<br>')}</p>
      <h3>✅ 交付结果</h3><p>${(c.result || '').replace(/\n/g, '<br>')}</p>
    </div>`;
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-case-detail').classList.remove('hidden');
  window.scrollTo(0, 0);
}

// ============ 知识库 ============
function loadKnowledge() {
  const knowledge = DB.getKnowledge();
  const list = document.getElementById('knowledge-list');
  const empty = document.getElementById('knowledge-empty');
  if (!knowledge.length) { list.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  list.innerHTML = knowledge.map(k => `
    <div class="knowledge-card" onclick="showKnowledgeDetail('${k.id}')">
      <div class="knowledge-title">${k.title}</div>
      <div class="knowledge-summary">${k.summary}</div>
      <div class="knowledge-meta"><span>📖 ${k.category}</span><span>👁 ${k.readCount || 0}次阅读</span></div>
    </div>`).join('');
}

function showKnowledgeDetail(id) {
  const k = DB.getArticle(id);
  if (!k) return;
  DB.updateArticle(id, { readCount: (k.readCount || 0) + 1 });
  const contentHtml = (k.content || k.summary || '').split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');
  document.getElementById('knowledge-detail-content').innerHTML = `
    <div class="knowledge-detail-body">
      <h1>${k.title}</h1>
      <div class="article-meta">📖 ${k.category} · 👁 ${k.readCount || 0}次阅读</div>
      <div class="article-content">${contentHtml}</div>
    </div>`;
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById('page-knowledge-detail').classList.remove('hidden');
  window.scrollTo(0, 0);
}

// ============ 询价 ============
function openInquiry(productName) {
  document.getElementById('inq-name2').value = '';
  document.getElementById('inq-phone2').value = '';
  document.getElementById('inq-type2').value = '';
  document.getElementById('inq-area2').value = productName ? '咨询产品：' + productName : '';
  document.getElementById('inq-desc2').value = '';
  document.getElementById('inquiry-modal').classList.remove('hidden');
}

function closeInquiry() {
  document.getElementById('inquiry-modal').classList.add('hidden');
}

function submitInquiryModal(e) {
  e.preventDefault();
  DB.addInquiry({
    name: document.getElementById('inq-name2').value,
    phone: document.getElementById('inq-phone2').value,
    type: document.getElementById('inq-type2').value,
    area: document.getElementById('inq-area2').value,
    description: document.getElementById('inq-desc2').value
  });
  alert('✅ 询价提交成功！我们会尽快联系您。');
  closeInquiry();
}

function submitInquiry(e) {
  e.preventDefault();
  DB.addInquiry({
    name: document.getElementById('inq-name').value,
    phone: document.getElementById('inq-phone').value,
    type: document.getElementById('inq-type').value,
    area: document.getElementById('inq-area').value,
    description: document.getElementById('inq-desc').value
  });
  alert('✅ 询价提交成功！我们会尽快联系您。');
  document.getElementById('inquiry-form').reset();
}

// ============ 联系功能 ============
function callPhone() { window.location.href = 'tel:' + CONFIG.phone; }

function copyWechat() {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(CONFIG.wechat).then(() => alert('✅ 微信号已复制：' + CONFIG.wechat));
  } else {
    prompt('请手动复制微信号：', CONFIG.wechat);
  }
}

function openMap() {
  if (CONFIG.mapUrl) {
    window.open(CONFIG.mapUrl, '_blank');
  } else {
    alert('门店地址：' + CONFIG.address + '\n\n请在腾讯地图搜索："' + CONFIG.shopName + '"');
  }
}

function openAdmin() { window.open('admin.html', '_blank'); }

// ============ 初始化 ============
window.addEventListener('DOMContentLoaded', async () => {
  await loadCloudData();
  initConfig();
  loadHome();
});
