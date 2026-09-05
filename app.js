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
window.initResourceSite = async function() {
    if (AppState.allData.length > 0) return;

    try {
        const configRes = await fetch('config.json');
        AppState.config = await configRes.json();
        
        document.getElementById('site-title').textContent = AppState.config.siteName;
        document.getElementById('btn-message-board').href = AppState.config.messageBoardUrl;
        const announceBtn = document.getElementById('btn-announcement');
        if (announceBtn) {
            if (AppState.config.announcementUrl) {
                announceBtn.href = AppState.config.announcementUrl;
            } else {
                announceBtn.onclick = () => alert(AppState.config.announcement);
            }
        }

        await loadAllData();
        
        AppState.fuse = new Fuse(AppState.allData, {
            keys: ['title', 'pinyin'],
            threshold: 0.3,
            ignoreLocation: true
        });

        renderParentCategories();
        bindEvents();
        applyFiltersAndRender();

    } catch (error) {
        console.error("❌ 站点初始化失败:", error);
        const grid = document.getElementById('card-grid');
        if (grid) grid.innerHTML = '<p class="text-red-500 col-span-full text-center py-10">数据加载失败，请检查 config.json 和 data 目录。</p>';
    }
};

// ================= 数据加载（含每日缓存） =================
const CACHE_PREFIX = 'zaozi_data_';

async function loadAllData() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const today = new Date(utc + 8 * 3600000).toLocaleDateString('sv');
    const cacheKey = CACHE_PREFIX + today;

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

    console.log(`📡 [${today}] 首次加载，请求数据...`);
    const allItems = [];
    for (const file of AppState.config.dataFiles) {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`Failed to load ${file}`);
        const items = await res.json();
        allItems.push(...items);
    }
    AppState.allData = allItems;

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

    if (AppState.searchQuery) {
        const searchResults = AppState.fuse.search(AppState.searchQuery);
        data = searchResults.map(r => r.item);
    } else if (AppState.currentCategory) {
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

// ================= 标签颜色映射（现代泰式自然色系） =================
const TAG_COLORS = ['tag-terracotta', 'tag-mango', 'tag-sky', 'tag-orchid', 'tag-mint', 'tag-teak'];
function getTagColorClass(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
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
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-stone-400 text-lg font-medium">🌿 没有找到匹配的资源</div>';
        renderPagination(0);
        return;
    }

    let lastGroupLabel = '';

    pageData.forEach((item, index) => {
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

        const card = document.createElement('div');
        card.className = 'resource-card flex flex-col justify-between';
        card.style.setProperty('--i', index);
        const tags = (item.categories || []).slice(0, 2).map(c => 
            `<span class="card-tag ${getTagColorClass(c)}">${c}</span>`
        ).join('');
        card.innerHTML = `
            <h3 class="line-clamp-2 mb-3" title="${item.title}">${item.title}</h3>
            <div class="flex flex-wrap gap-1.5 mt-auto">${tags}</div>
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

    container.insertAdjacentHTML('beforeend', `<button class="page-btn" ${AppState.currentPage === 1 ? 'disabled' : ''} data-page="prev">上一页</button>`);

    const pages = new Set([1, totalPages, AppState.currentPage, AppState.currentPage - 1, AppState.currentPage + 1]);
    const sortedPages = [...pages].filter(p => p > 0 && p <= totalPages).sort((a, b) => a - b);
    
    let lastPage = 0;
    sortedPages.forEach(p => {
        if (p - lastPage > 1) container.insertAdjacentHTML('beforeend', `<span class="px-2 text-stone-400 text-sm font-semibold">...</span>`);
        const isActive = p === AppState.currentPage;
        container.insertAdjacentHTML('beforeend', `<button class="page-btn ${isActive ? 'page-active' : ''}" data-page="${p}">${p}</button>`);
        lastPage = p;
    });

    container.insertAdjacentHTML('beforeend', `<button class="page-btn" ${AppState.currentPage === totalPages ? 'disabled' : ''} data-page="next">下一页</button>`);
}

function renderParentCategories() {
    const bar = document.getElementById('parent-category-bar');
    const resetBtn = document.getElementById('btn-reset-category');
    bar.innerHTML = '';
    bar.appendChild(resetBtn);

    const tree = AppState.config.categoryTree;
    for (const parent of Object.keys(tree)) {
        const btn = document.createElement('button');
        btn.className = 'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-stone-700 border border-stone-300 hover:border-emerald-400 hover:text-emerald-800 hover:bg-emerald-50 transition whitespace-nowrap parent-cat-btn';
        btn.dataset.cat = parent;
        btn.textContent = parent;
        bar.appendChild(btn);
    }
}

function renderChildCategories(parentName) {
    const bar = document.getElementById('child-category-bar');
    bar.innerHTML = '';

    const tree = AppState.config.categoryTree;
    const children = tree[parentName]?.children || [];

    if (children.length === 0) {
        bar.classList.add('hidden');
        return;
    }

    children.forEach(child => {
        const btn = document.createElement('button');
        btn.className = 'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-stone-600 border border-stone-300 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition whitespace-nowrap child-cat-btn';
        btn.dataset.cat = child;
        btn.textContent = child;
        bar.appendChild(btn);
    });

    bar.classList.remove('hidden');
}

// ================= UI 交互与事件 =================
function showModal(item) {
    const modal = document.getElementById('modal');
    document.getElementById('modal-title').textContent = item.title;
    
    const meta = document.getElementById('modal-meta');
    meta.innerHTML = `
        <span class="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">📅 ${item.date}</span>
        ${(item.categories || []).map(c => `<span class="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold">🏷️ ${c}</span>`).join('')}
    `;

    const linksContainer = document.getElementById('modal-links');
    linksContainer.innerHTML = '';
    
    if (!item.links || item.links.length === 0) {
        linksContainer.innerHTML = '<p class="text-stone-400 text-sm text-center py-4 font-medium">暂无有效链接</p>';
    } else {
        item.links.forEach(link => {
            if (link.url && link.url.startsWith('http')) {
                linksContainer.insertAdjacentHTML('beforeend', `
                    <a href="${link.url}" target="_blank" class="block w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-400 rounded-xl p-3.5 transition text-center shadow-sm hover:shadow-md">
                        <span class="font-bold text-emerald-700 text-sm">🔗 ${link.platform}</span>
                    </a>
                `);
            }
        });
    }

    modal.classList.remove('hidden');
}

function updateStatusUI() {
    const statusEl = document.getElementById('current-status');
    const countEl = document.getElementById('total-count');
    
    if (statusEl) statusEl.textContent = AppState.searchQuery ? `搜索: "${AppState.searchQuery}"` : (AppState.currentCategory || '全部');
    if (countEl) countEl.textContent = AppState.filteredData.length;
}

function updateCategoryActiveUI(activeCat) {
    document.querySelectorAll('.parent-cat-btn').forEach(el => {
        el.className = 'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-stone-700 border border-stone-300 hover:border-emerald-400 hover:text-emerald-800 hover:bg-emerald-50 transition whitespace-nowrap parent-cat-btn';
    });
    document.querySelectorAll('.child-cat-btn').forEach(el => {
        el.className = 'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-stone-600 border border-stone-300 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 transition whitespace-nowrap child-cat-btn';
    });

    if (!activeCat) {
        const resetBtn = document.getElementById('btn-reset-category');
        resetBtn.classList.add('category-active');
        return;
    }

    const matched = document.querySelector(`[data-cat="${activeCat}"]`);
    if (matched) {
        matched.classList.add('category-active');
    }
}

function bindEvents() {
    let searchTimer;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            AppState.searchQuery = e.target.value.trim();
            applyFiltersAndRender();
        }, 300);
    });

    document.getElementById('sort-date').onclick = () => {
        AppState.sortMode = 'date';
        document.getElementById('sort-date').className = 'sort-btn px-3 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-sm whitespace-nowrap transition';
        document.getElementById('sort-pinyin').className = 'sort-btn sort-btn-inactive px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition';
        applyFiltersAndRender();
    };
    document.getElementById('sort-pinyin').onclick = () => {
        AppState.sortMode = 'pinyin';
        document.getElementById('sort-pinyin').className = 'sort-btn px-3 py-1.5 rounded-md text-xs font-semibold bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-sm whitespace-nowrap transition';
        document.getElementById('sort-date').className = 'sort-btn sort-btn-inactive px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition';
        applyFiltersAndRender();
    };

    document.getElementById('parent-category-bar').addEventListener('click', (e) => {
        const btn = e.target.closest('.parent-cat-btn');
        if (!btn) return;

        const cat = btn.dataset.cat;
        AppState.currentCategory = cat;
        AppState.searchQuery = '';
        document.getElementById('search-input').value = '';

        updateCategoryActiveUI(cat);
        renderChildCategories(cat);
        applyFiltersAndRender();
    });

    document.getElementById('child-category-bar').addEventListener('click', (e) => {
        const btn = e.target.closest('.child-cat-btn');
        if (!btn) return;

        const cat = btn.dataset.cat;
        AppState.currentCategory = cat;
        AppState.searchQuery = '';
        document.getElementById('search-input').value = '';

        updateCategoryActiveUI(cat);
        applyFiltersAndRender();
    });

    document.getElementById('btn-reset-category').onclick = () => {
        AppState.currentCategory = null;
        AppState.searchQuery = '';
        document.getElementById('search-input').value = '';
        updateCategoryActiveUI(null);
        document.getElementById('child-category-bar').classList.add('hidden');
        document.getElementById('child-category-bar').innerHTML = '';
        applyFiltersAndRender();
    };

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

    document.getElementById('modal-close').onclick = () => document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal').onclick = (e) => {
        if (e.target.id === 'modal') document.getElementById('modal').classList.add('hidden');
    };
}