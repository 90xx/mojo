// public/verify.js
(function () {
  'use strict';

  // ═══════════════════════════════════════════
  // 1. 访问码配置 (请粘贴完整的 ACCESS_MAP)
  // ═══════════════════════════════════════════
  const ACCESS_MAP = {
    '2026-08-31': { link: 'https://pan.quark.cn/s/2fb6198a1d1d', code: '9wjd' },
    '2026-09-01': { link: 'https://pan.quark.cn/s/942e21ab9d6b', code: '28rs' },
    // ... 把你完整的 ACCESS_MAP 粘贴到这里 ...
    '2026-10-12': { link: 'https://pan.quark.cn/s/c1b462986761', code: 'szjq' }
  };

  // ═══════════════════════════════════════════
  // 2. 工具函数
  // ═══════════════════════════════════════════
  function getBeijingDate() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 8 * 3600000).toLocaleDateString('sv');
  }

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
        text.includes('公告') ||
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