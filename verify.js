// public/verify.js
(function () {
  'use strict';

  // ═══════════════════════════════════════════
  // 1. 访问码配置 (请粘贴完整的 ACCESS_MAP)
  // ═══════════════════════════════════════════
  const ACCESS_MAP = {
    '2026-08-31': { link: 'https://pan.quark.cn/s/2fb6198a1d1d', code: '9wjd' },
    '2026-11-15': { link: 'https://drive.uc.cn/s/7ae13c77de8a4', code: '3ibq' },
'2026-11-16': { link: 'https://drive.uc.cn/s/c115447718744', code: 'fu07' },
'2026-11-17': { link: 'https://drive.uc.cn/s/4f2f58d507704', code: 'i5mn' },
'2026-11-18': { link: 'https://drive.uc.cn/s/45aa03c893824', code: 'q1cd' },
'2026-11-19': { link: 'https://drive.uc.cn/s/b4ecacfe8e7e4', code: 'iy90' },
'2026-11-20': { link: 'https://drive.uc.cn/s/305a3c7a5c8f4', code: '2o7l' },
'2026-11-21': { link: 'https://drive.uc.cn/s/d4fd454b1e324', code: 'ulh9' },
'2026-11-22': { link: 'https://drive.uc.cn/s/91754ada3bf34', code: 'htck' },
'2026-11-23': { link: 'https://drive.uc.cn/s/0ab5d0f848344', code: 'rh7k' },
'2026-11-24': { link: 'https://drive.uc.cn/s/fc6f8d9015ee4', code: 'zijv' },
'2026-11-25': { link: 'https://drive.uc.cn/s/6b0fb9e56d874', code: 'nti4' },
'2026-11-26': { link: 'https://drive.uc.cn/s/b98a784cc1354', code: '3ipf' },
'2026-11-27': { link: 'https://drive.uc.cn/s/810a5c7cc14c4', code: 'terx' },
'2026-11-28': { link: 'https://drive.uc.cn/s/6f48b30c92194', code: 'wjyl' },
'2026-11-29': { link: 'https://drive.uc.cn/s/21bafaf812274', code: 'wy37' },
'2026-11-30': { link: 'https://drive.uc.cn/s/38fe45411e5a4', code: '4n9r' },
'2026-12-01': { link: 'https://drive.uc.cn/s/8fb8d66c55f44', code: 'kcfv' },
    '2026-10-12': { link: 'https://pan.quark.cn/s/c1b462986761', code: 'szjq' }
     };

  // ═══════════════════════════════════════════
  // 2. 工具函数（已迁移至 utils.js，此处直接调用全局 getBeijingDate）
  // ═══════════════════════════════════════════
  function checkVerified() {
    return localStorage.getItem('zaozi_verified') === getBeijingDate();
  }

  function setVerified() {
    localStorage.setItem('zaozi_verified', getBeijingDate());
  }

  let isVerified = false;

  // ═══════════════════════════════════════════
  // 3. UI 控制
  // ═══════════════════════════════════════════
  function showModal() {
    document.body.style.overflow = 'hidden';
    const modal = document.getElementById('accessModal');
    if (modal) modal.style.display = 'flex';
  }

  function hideModal() {
    document.body.style.overflow = '';
    const modal = document.getElementById('accessModal');
    if (modal) modal.style.display = 'none';
  }

  function updateAccessInfo() {
    // ✅ 统一使用 utils.js 中的 getBeijingDate()
    const today = getBeijingDate();
    const record = ACCESS_MAP[today];
    const dateSpan = document.getElementById('linkDate');
    const linkBtn = document.getElementById('accessLink');

    if (dateSpan) dateSpan.textContent = today;

    if (record && linkBtn) {
      linkBtn.href = record.link;
    } else if (linkBtn) {
      linkBtn.href = '#';
      linkBtn.addEventListener('click', function (e) {
        e.preventDefault();
        alert('管理员未配置今日访问码，请联系管理员。');
      });
    }
  }

  // ═══════════════════════════════════════════
  // 4. 全局点击拦截器（捕获阶段）
  // ═══════════════════════════════════════════
  function globalClickInterceptor(e) {
    if (isVerified) return;

    const modal = document.getElementById('accessModal');
    if (modal && modal.contains(e.target)) return;

    // ✅ 白名单：匹配当前项目的公告和留言板
    const target = e.target.closest('a, button');
    if (target) {
      const href = target.getAttribute('href') || '';
      const text = target.textContent || '';
      if (
        href.includes('tally.so') ||
         href.includes('kdocs.cn')||
        text.includes('新人必看') ||
        text.includes('留言板')
      ) {
        return;
      }
    }

    e.preventDefault();
    e.stopImmediatePropagation();
    showModal();
  }

  // ═══════════════════════════════════════════
  // 5. 触发主站数据加载（保持原有行为）
  // ═══════════════════════════════════════════
  function triggerDataLoad() {
    if (typeof window.initResourceSite === 'function') {
      window.initResourceSite();
    }
  }

  // ═══════════════════════════════════════════
  // 6. 事件绑定
  // ═══════════════════════════════════════════
  function bindEvents() {
    const verifyBtn = document.getElementById('verifyBtn');
    const input = document.getElementById('accessCodeInput');
    const errorText = document.getElementById('errorText');

    if (verifyBtn) {
      verifyBtn.addEventListener('click', function () {
        const val = input.value.trim();
        // ✅ 统一使用 utils.js 中的 getBeijingDate()
        const today = getBeijingDate();
        const record = ACCESS_MAP[today];

        errorText.className = 'error-msg';
        input.classList.remove('input-error');

        if (!record) {
          errorText.textContent = '⚠️ 系统错误：今日未配置访问码';
          errorText.className = 'error-msg show';
          return;
        }

        if (val === record.code) {
          setVerified();
          isVerified = true;
          hideModal();
          input.value = '';
          triggerDataLoad();
        } else {
          errorText.textContent = '❌ 访问码错误，请重试';
          errorText.className = 'error-msg show';
          input.classList.add('input-error');
          input.focus();
        }
      });
    }

    if (input) {
      input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') verifyBtn.click();
      });
      input.addEventListener('input', function () {
        errorText.className = 'error-msg';
        input.classList.remove('input-error');
      });
    }
  }

  // ═══════════════════════════════════════════
  // 7. 初始化（保持原有行为：未验证也加载数据）
  // ═══════════════════════════════════════════
  function init() {
    updateAccessInfo();
    bindEvents();

    if (checkVerified()) {
      isVerified = true;
      triggerDataLoad();
    } else {
      document.addEventListener('click', globalClickInterceptor, true);
      // ✅ 保持原有逻辑：未验证时也触发数据加载
      triggerDataLoad();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();