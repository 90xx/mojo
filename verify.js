// public/verify.js
(function () {
  'use strict';

  // ═══════════════════════════════════════════
  // 1. 访问码配置 (请粘贴完整的 ACCESS_MAP)
  // ═══════════════════════════════════════════
  const ACCESS_MAP = {
    '2026-08-31': { link: 'https://pan.quark.cn/s/2fb6198a1d1d', code: '9wjd' },
    '2026-09-01': { link: 'https://pan.quark.cn/s/942e21ab9d6b', code: '28rs' },
    '2026-09-02': { link: 'https://pan.quark.cn/s/fe42a2997ed2', code: '4p1w' },
     '2026-09-03': { link: 'https://pan.quark.cn/s/6122150ada3f', code: 'wa5n' },
    '2026-09-04': { link: 'https://pan.quark.cn/s/370735b8ce61', code: 'hl22' },
    '2026-09-05': { link: 'https://pan.quark.cn/s/530e2cbbabcb', code: '141t' },
    '2026-09-06': { link: 'https://pan.quark.cn/s/8f3d7a0a7890', code: 'dnsu' },
    '2026-09-07': { link: 'https://pan.quark.cn/s/b05b2ec5f4d5', code: 'vmr9' },
    '2026-09-08': { link: 'https://pan.quark.cn/s/29c86f47157f', code: 'js0u' },
    '2026-09-09': { link: 'https://pan.quark.cn/s/491958038c04', code: '02ia' },
    '2026-09-10': { link: 'https://pan.quark.cn/s/94606bb4e9fc', code: 'imfl' },
    '2026-09-11': { link: 'https://pan.quark.cn/s/d662e59954e8', code: 'ko7h' },
    '2026-09-12': { link: 'https://pan.quark.cn/s/2c53566167d6', code: 'nkkb' },
    '2026-09-13': { link: 'https://pan.quark.cn/s/863ffde5c3cb', code: 'evsp' },
    '2026-09-14': { link: 'https://pan.quark.cn/s/626a6e759c47', code: 'vlyf' },
    '2026-09-15': { link: 'https://pan.quark.cn/s/15096e41359f', code: 'b73g' },
    '2026-09-16': { link: 'https://pan.quark.cn/s/5f9bce6e2333', code: 'rw0v' },
    '2026-09-17': { link: 'https://pan.quark.cn/s/bb94a9ad683e', code: 't2l4' },
    '2026-09-18': { link: 'https://pan.quark.cn/s/679d72f1580d', code: 'rj1q' },
    '2026-09-19': { link: 'https://pan.quark.cn/s/1da55438e138', code: 'pg6i' },
    '2026-09-20': { link: 'https://pan.quark.cn/s/b8f31447dc78', code: 'abjd' },
    '2026-09-21': { link: 'https://pan.quark.cn/s/e82a74b5946e', code: 'm3qn' },
    '2026-09-22': { link: 'https://pan.quark.cn/s/0edb79626ba1', code: 'tcjn' },
    '2026-09-23': { link: 'https://pan.quark.cn/s/7b0e8d7f125d', code: 'c39l' },
    '2026-09-24': { link: 'https://pan.quark.cn/s/f2ad3a54d152', code: '18wv' },
    '2026-09-25': { link: 'https://pan.quark.cn/s/a9b29cc26f07', code: 'mhnw' },
    '2026-09-26': { link: 'https://pan.quark.cn/s/44786f948b63', code: 'h24u' },
    '2026-09-27': { link: 'https://pan.quark.cn/s/340ec15d6f7b', code: 'r9na' },
    '2026-09-28': { link: 'https://pan.quark.cn/s/7f6e7a931a50', code: 'sg2z' },
    '2026-09-29': { link: 'https://pan.quark.cn/s/83dd5d098aae', code: 'ksws' },
    '2026-09-30': { link: 'https://pan.quark.cn/s/dea8d9088b97', code: 'o64y' },
    '2026-10-01': { link: 'https://pan.quark.cn/s/2e61f4e8f282', code: 'xhom' },
    '2026-10-02': { link: 'https://pan.quark.cn/s/3ee79ba9f32d', code: 'wix8' },
    '2026-10-03': { link: 'https://pan.quark.cn/s/abc9680a38c0', code: '4uj2' },
    '2026-10-04': { link: 'https://pan.quark.cn/s/6b3b370c55bd', code: 'hsfr' },
    '2026-10-05': { link: 'https://pan.quark.cn/s/d94c29df7e63', code: 'ej4s' },
    '2026-10-06': { link: 'https://pan.quark.cn/s/bf7598846aec', code: '74ru' },
    '2026-10-07': { link: 'https://pan.quark.cn/s/c9954532067c', code: '7g31' },
    '2026-10-08': { link: 'https://pan.quark.cn/s/507a36e100a2', code: 'gdo4' },
    '2026-10-09': { link: 'https://pan.quark.cn/s/82755ca81c3b', code: '3ikp' },
    '2026-10-10': { link: 'https://pan.quark.cn/s/95e983373a8b', code: 'dwc9' },
    '2026-10-11': { link: 'https://pan.quark.cn/s/574d6b63400a', code: 'll7n' },
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