
// ================= 状态管理 =================
const AppState = {
    allData: [],
    filteredData: [],
    config: null,
    fuse: null,
    currentPage: 1,
    currentCategory: null,
    sortMode: 'date',
    searchQuery: ''
};

// ================= 初始化入口 =================
// ✅ 暴露给全局，由 verify.js 验证通过后调用
window.initResourceSite = async function() {
    // 防止重复初始化
    if (AppState.allData.length > 0) return;

    try {
        // 1. 加载配置
        const configRes = await fetch('config.json');
        AppState.config = await configRes.json();
        
        // 2. 初始化 UI 基础配置
        document.getElementById('site-title').textContent = AppState.config.siteName;
        document.getElementById('btn-message-board').href = AppState.config.messageBoardUrl;
        // 兼容旧版 announcementUrl 或新版直接文本
        const announceBtn = document.getElementById('btn-announcement');
        if (announceBtn) {
            if (AppState.config.announcementUrl) {
                announceBtn.href = AppState.config.announcementUrl;
            } else {
                announceBtn.onclick = () => alert(AppState.config.announcement);
            }
        }

        // 3. 加载并合并所有数据（含每日缓存）
        await loadAllData();
        
        // 4. 初始化搜索引擎 (Fuse.js)
        AppState.fuse = new Fuse(AppState.allData, {
            keys: ['title', 'pinyin'],
            threshold: 0.3,
            ignoreLocation: true
        });

        // 5. 渲染侧边栏分类树
        renderCategoryTree();
        
        // 6. 绑定全局交互事件
        bindEvents();
        
        // 7. 首次渲染列表
        applyFiltersAndRender();

        // 8. ✅ 初始化统计模块（在数据加载完成后执行）
        StatsManager.init(AppState.config);

    } catch (error) {
        console.error("❌ 站点初始化失败:", error);
        const grid = document.getElementById('card-grid');
        if (grid) grid.innerHTML = '<p class="text-red-500 col-span-full text-center py-10">数据加载失败，请检查 config.json 和 data 目录。</p>';
    }
};

// ================= 数据加载（含每日缓存） =================
const CACHE_PREFIX = 'zaozi_data_';

async function loadAllData() {
    // 1. 获取北京时间日期作为缓存 Key
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const today = new Date(utc + 8 * 3600000).toLocaleDateString('sv');
    const cacheKey = CACHE_PREFIX + today;

    // 2. 尝试读取今日缓存
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
        try {
            AppState.allData = JSON.parse(cached);
            console.log(`✅ [${today}] 命中本地缓存，跳过网络请求`);
            return;
        } catch(e) {
            localStorage.removeItem(cacheKey);
        }
    }

    // 3. 无缓存 → 发起请求
    console.log(`📡 [${today}] 首次加载，请求数据...`);
    const allItems = [];
    for (const file of AppState.config.dataFiles) {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        const items = await res.json();
        allItems.push(...items);
    }
    AppState.allData = allItems;

    // 4. 写入今日缓存 + 自动清理旧缓存
    try {
        localStorage.setItem(cacheKey, JSON.stringify(allItems));
        Object.keys(localStorage)
            .filter(k => k.startsWith(CACHE_PREFIX) && k !== cacheKey)
            .forEach(k => localStorage.removeItem(k));
        console.log(`💾 [${today}] 数据已缓存，历史缓存已清理`);
    } catch(e) {
        console.warn('⚠️ 缓存写入失败（数据可能超过 5MB 限制）:', e);
    }
}

// ================= 核心逻辑：筛选、排序与分页 =================
function applyFiltersAndRender() {
    let data = [...AppState.allData];

    // 1. 搜索过滤 (优先级最高)
    if (AppState.searchQuery) {
        const searchResults = AppState.fuse.search(AppState.searchQuery);
        data = searchResults.map(r => r.item);
    } 
    // 2. 分类过滤
    else if (AppState.currentCategory) {
        const tree = AppState.config.categoryTree;
        let targetCategories = [];
        
        if (tree[AppState.currentCategory]) {
            targetCategories = [AppState.currentCategory, ...tree[AppState.currentCategory].children];
        } else {
            targetCategories = [AppState.currentCategory];
        }

        data = data.filter(item => 
            item.categories && item.categories.some(cat => targetCategories.includes(cat))
        );
    }

    // 3. 排序
    if (AppState.sortMode === 'date') {
        data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } else {
        data.sort((a, b) => (a.pinyin || '').localeCompare(b.pinyin || ''));
    }

    AppState.filteredData = data;
    AppState.currentPage = 1;
    
    updateStatusUI();
    renderPage();
}

// ========== 移动端分类抽屉交互 ==========
const mobileDrawer = document.getElementById('mobile-category-drawer');
const mobileOverlay = document.getElementById('mobile-category-overlay');
const mobileDrawerClose = document.getElementById('mobile-drawer-close');
const mobileTree = document.getElementById('mobile-category-tree');
const mobileResetBtn = document.getElementById('mobile-btn-reset-category');
const desktopTree = document.getElementById('category-tree');

// 打开抽屉
function openMobileDrawer() {
    syncMobileCategoryTree();
    mobileDrawer.classList.remove('-translate-x-full');
    mobileOverlay.classList.remove('hidden');
}

// 关闭抽屉
function closeMobileDrawer() {
    mobileDrawer.classList.add('-translate-x-full');
    mobileOverlay.classList.add('hidden');
}

// 同步桌面端分类树到移动端
function syncMobileCategoryTree() {
    if (desktopTree && mobileTree) {
        mobileTree.innerHTML = desktopTree.innerHTML;
    }
}

// 关闭按钮
if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', closeMobileDrawer);
}

// 点击遮罩关闭
if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileDrawer);
}

// 移动端点击分类项 → 区分父/子分类
if (mobileTree) {
    mobileTree.addEventListener('click', (e) => {
        // 点击子分类：触发筛选 + 关闭抽屉
        const childItem = e.target.closest('.child-cat');
        if (childItem) {
            const cat = childItem.getAttribute('data-cat');
            const desktopItem = desktopTree.querySelector(`.child-cat[data-cat="${cat}"]`);
            if (desktopItem) desktopItem.click();
            closeMobileDrawer();
            return;
        }

        // 点击父分类：在移动端面板内展开/收起子分类
        const parentItem = e.target.closest('.parent-cat');
        if (parentItem) {
            const subUl = parentItem.nextElementSibling;
            if (subUl && subUl.tagName === 'UL') {
                subUl.classList.toggle('hidden');
            }
            // 切换箭头方向
            const arrow = parentItem.querySelector('span:last-child');
            if (arrow) {
                arrow.style.transform = subUl.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(90deg)';
            }
        }
    });
}
// 移动端"全部资源"按钮
if (mobileResetBtn) {
    mobileResetBtn.addEventListener('click', () => {
        document.getElementById('btn-reset-category').click();
        closeMobileDrawer();
    });
}

const mobileBtn = document.getElementById('mobile-category-btn');
if (mobileBtn) {
    mobileBtn.addEventListener('click', openMobileDrawer);
}


// ================= 渲染逻辑 =================
function renderPage() {
    const grid = document.getElementById('card-grid');
    grid.innerHTML = '';

    const pageSize = AppState.config.pageSize || 40;
    const startIdx = (AppState.currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageData = AppState.filteredData.slice(startIdx, endIdx);

    if (pageData.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-500 text-lg">🔍 没有找到匹配的资源</div>';
        renderPagination(0);
        return;
    }

    let lastGroupLabel = '';

    pageData.forEach(item => {
        // 插入分组标签
        let currentLabel = '';
        if (AppState.sortMode === 'date') {
            currentLabel = item.date || '未知日期';
            if (currentLabel !== lastGroupLabel) {
                grid.insertAdjacentHTML('beforeend', `<div class="group-label">📅 ${currentLabel} 更新</div>`);
                lastGroupLabel = currentLabel;
            }
        } else {
            let letter = (item.pinyin || '#').charAt(0).toUpperCase();
            if (!/[A-Z]/.test(letter)) letter = '#';
            if (letter !== lastGroupLabel) {
                grid.insertAdjacentHTML('beforeend', `<div class="group-label">🔤 ${letter}</div>`);
                lastGroupLabel = letter;
            }
        }

        // 渲染卡片
        const card = document.createElement('div');
        card.className = 'resource-card bg-secondary border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-800 flex flex-col justify-between';
        card.innerHTML = `
            <h3 class="font-medium text-gray-200 line-clamp-2 mb-2" title="${item.title}">${item.title}</h3>
            <div class="flex flex-wrap gap-1 mt-auto">
                ${(item.categories || []).slice(0, 2).map(c => `<span class="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">${c}</span>`).join('')}
            </div>
        `;
        card.onclick = () => showModal(item);
        grid.appendChild(card);
    });

    renderPagination(Math.ceil(AppState.filteredData.length / pageSize));
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    container.innerHTML = '';
    if (totalPages <= 1) return;

    const btnClass = 'px-3 py-1 rounded border border-gray-600 text-sm hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed';
    const activeClass = 'bg-accent border-accent text-white hover:bg-blue-600';

    container.insertAdjacentHTML('beforeend', `<button class="${btnClass}" ${AppState.currentPage === 1 ? 'disabled' : ''} data-page="prev">上一页</button>`);

    const pages = new Set([1, totalPages, AppState.currentPage, AppState.currentPage - 1, AppState.currentPage + 1]);
    const sortedPages = [...pages].filter(p => p > 0 && p <= totalPages).sort((a, b) => a - b);
    
    let lastPage = 0;
    sortedPages.forEach(p => {
        if (p - lastPage > 1) container.insertAdjacentHTML('beforeend', `<span class="px-2 text-gray-500">...</span>`);
        container.insertAdjacentHTML('beforeend', `<button class="${btnClass} ${p === AppState.currentPage ? activeClass : ''}" data-page="${p}">${p}</button>`);
        lastPage = p;
    });

    container.insertAdjacentHTML('beforeend', `<button class="${btnClass}" ${AppState.currentPage === totalPages ? 'disabled' : ''} data-page="next">下一页</button>`);
}

function renderCategoryTree() {
    const treeContainer = document.getElementById('category-tree');
    treeContainer.innerHTML = '';
    const tree = AppState.config.categoryTree;

    for (const [parent, config] of Object.entries(tree)) {
        const parentLi = document.createElement('li');
        parentLi.innerHTML = `
            <div class="flex items-center justify-between group cursor-pointer p-2 rounded hover:bg-gray-700 parent-cat" data-cat="${parent}">
                <span class="font-medium text-gray-300 group-hover:text-white">📂 ${parent}</span>
                <span class="text-xs text-gray-500 transform transition-transform group-hover:translate-x-1">▶</span>
            </div>
        `;
        
        const subUl = document.createElement('ul');
        subUl.className = 'ml-4 mt-1 space-y-1 hidden border-l border-gray-700 pl-2';
        
        config.children.forEach(child => {
            const childLi = document.createElement('li');
            childLi.innerHTML = `<div class="p-1.5 px-3 rounded hover:bg-gray-700 cursor-pointer text-gray-400 hover:text-white child-cat" data-cat="${child}">📄 ${child}</div>`;
            subUl.appendChild(childLi);
        });

        parentLi.appendChild(subUl);
        treeContainer.appendChild(parentLi);
    }
 syncMobileCategoryTree();
}

// ================= 统计模块 =================
const StatsManager = {
    apiUrl: '',

    init(config) {
        this.apiUrl = config.statsApiUrl;
        if (!this.apiUrl) {
            console.warn("⚠️ 未配置 statsApiUrl，统计功能已禁用");
            return;
        }
        this.fetchStats();
        this.recordView();
    },

    async fetchStats() {
        try {
            const res = await fetch(`${this.apiUrl}/api/stats`);
            const data = await res.json();
            
            const todayEl = document.getElementById('stat-today-views');
            if (todayEl) todayEl.textContent = data.todayViews.toLocaleString();
            
            const topList = document.getElementById('stat-top-resources');
            if (topList) {
                topList.innerHTML = '';
                if (data.topResources && data.topResources.length > 0) {
                    data.topResources.forEach((item, index) => {
                        topList.insertAdjacentHTML('beforeend', `
                            <li class="flex justify-between items-center">
                                <span class="truncate mr-2" title="${item.title}">${index + 1}. ${item.title}</span>
                                <span class="text-accent font-mono text-xs">${item.count}</span>
                            </li>
                        `);
                    });
                } else {
                    topList.innerHTML = '<li class="text-gray-500">暂无数据</li>';
                }
            }
        } catch (err) {
            console.error("获取统计数据失败:", err);
            const todayEl = document.getElementById('stat-today-views');
            if (todayEl) todayEl.textContent = '--';
        }
    },

    // 防刷 PV：同一用户一天只上报一次
    recordView() {
        const today = new Date().toISOString().split('T')[0];
        const lastViewDate = localStorage.getItem('last_stats_view_date');
        
        if (lastViewDate !== today) {
            fetch(`${this.apiUrl}/api/stats/view`, { method: 'POST' })
                .then(() => localStorage.setItem('last_stats_view_date', today))
                .catch(err => console.error("上报 PV 失败:", err));
        }
    },

    // 记录资源点击热度
    recordClick(title) {
        if (!this.apiUrl) return;
        fetch(`${this.apiUrl}/api/stats/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        }).catch(err => console.error("上报点击失败:", err));
        
        // 延迟刷新排行榜，提供实时反馈
        setTimeout(() => this.fetchStats(), 1000);
    }
};

// ================= UI 交互与事件 =================
function showModal(item) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = item.title;
    
    const meta = document.getElementById('modal-meta');
    meta.innerHTML = `
        <span class="bg-blue-900/50 text-blue-300 px-2 py-1 rounded">📅 ${item.date}</span>
        ${(item.categories || []).map(c => `<span class="bg-gray-700 text-gray-300 px-2 py-1 rounded">🏷️ ${c}</span>`).join('')}
    `;

    const linksContainer = document.getElementById('modal-links');
    linksContainer.innerHTML = '';
    
    if (!item.links || item.links.length === 0) {
        linksContainer.innerHTML = '<p class="text-gray-500 text-sm">暂无有效链接</p>';
    } else {
        item.links.forEach(link => {
            if (link.url && link.url.startsWith('http')) {
                linksContainer.insertAdjacentHTML('beforeend', `
                    <a href="${link.url}" target="_blank" class="block w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 transition text-center">
                        <span class="font-bold text-accent">🔗 ${link.platform}</span>
                        ${link.note ? `<span class="text-xs text-gray-400 ml-2">(${link.note})</span>` : ''}
                    </a>
                `);
            } else if (link.note) {
                linksContainer.insertAdjacentHTML('beforeend', `
                    <div class="bg-gray-800/50 border border-dashed border-gray-600 rounded-lg p-3 text-sm text-gray-400">
                        <span class="font-bold text-gray-300">📌 ${link.platform} 备注:</span> ${link.note}
                    </div>
                `);
            }
        });
    }

    // ✅ 上报点击事件
    StatsManager.recordClick(item.title);

    modal.classList.remove('hidden');
}

function updateStatusUI() {
    const statusEl = document.getElementById('current-status');
    const countEl = document.getElementById('total-count');
    
    if (statusEl) statusEl.textContent = AppState.searchQuery ? `搜索: "${AppState.searchQuery}"` : (AppState.currentCategory || '全部');
    if (countEl) countEl.textContent = AppState.filteredData.length;
}

function bindEvents() {
    // 1. 搜索框防抖
    let searchTimer;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            AppState.searchQuery = e.target.value.trim();
            applyFiltersAndRender();
        }, 300);
    });

    // 2. 排序切换
    document.getElementById('sort-date').onclick = (e) => {
        AppState.sortMode = 'date';
        e.target.classList.add('bg-accent', 'text-white');
        document.getElementById('sort-pinyin').classList.remove('bg-accent', 'text-white');
        applyFiltersAndRender();
    };
    document.getElementById('sort-pinyin').onclick = (e) => {
        AppState.sortMode = 'pinyin';
        e.target.classList.add('bg-accent', 'text-white');
        document.getElementById('sort-date').classList.remove('bg-accent', 'text-white');
        applyFiltersAndRender();
    };

    // 3. 分类点击事件 (事件委托)
    document.getElementById('category-tree').addEventListener('click', (e) => {
        const target = e.target.closest('[data-cat]');
        if (!target) return;
        
        if (target.classList.contains('parent-cat')) {
            const subUl = target.nextElementSibling;
            subUl.classList.toggle('hidden');
            const arrow = target.querySelector('span:last-child');
            arrow.textContent = subUl.classList.contains('hidden') ? '▶' : '▼';
        }
        
        AppState.currentCategory = target.dataset.cat;
        AppState.searchQuery = '';
        document.getElementById('search-input').value = '';
        
        document.querySelectorAll('#category-tree [data-cat]').forEach(el => el.classList.remove('category-active'));
        target.classList.add('category-active');
        
        applyFiltersAndRender();
    });

    // 4. 重置分类
    document.getElementById('btn-reset-category').onclick = () => {
        AppState.currentCategory = null;
        AppState.searchQuery = '';
        document.getElementById('search-input').value = '';
        document.querySelectorAll('#category-tree [data-cat]').forEach(el => el.classList.remove('category-active'));
        applyFiltersAndRender();
    };

    // 5. 分页点击 (事件委托)
    document.getElementById('pagination').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-page]');
        if (!btn || btn.disabled) return;
        
        const val = btn.dataset.page;
        const totalPages = Math.ceil(AppState.filteredData.length / AppState.config.pageSize);
        
        if (val === 'prev') AppState.currentPage--;
        else if (val === 'next') AppState.currentPage++;
        else AppState.currentPage = parseInt(val);
        
        renderPage();
        document.getElementById('main-content').scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 6. 弹窗关闭
    document.getElementById('modal-close').onclick = () => document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal').onclick = (e) => {
        if (e.target.id === 'modal') document.getElementById('modal').classList.add('hidden');
    };
}

