// public/verify.js
(function () {
  'use strict';

  // ═══════════════════════════════════════════
  // 1. 访问码配置 (请粘贴完整的 ACCESS_MAP)
  // ═══════════════════════════════════════════
  const ACCESS_MAP = {
   '2026-10-13': { link: 'https://drive.uc.cn/s/e794490ecf8a4', code: 'zpwj' },
'2026-10-14': { link: 'https://drive.uc.cn/s/39f227beb2b94', code: 'xal7' },
'2026-10-15': { link: 'https://drive.uc.cn/s/77512ff2c9564', code: 'gm7t' },
'2026-10-16': { link: 'https://drive.uc.cn/s/e4fb3749f5724', code: 'rzs7' },
'2026-10-17': { link: 'https://drive.uc.cn/s/99c941de67a34', code: 'vv4n' },
'2026-10-18': { link: 'https://drive.uc.cn/s/7dd4a902cdbf4', code: 'f0nv' },
'2026-10-19': { link: 'https://drive.uc.cn/s/acd948b3d38b4', code: 'r6o7' },
'2026-10-20': { link: 'https://drive.uc.cn/s/3cf06472304a4', code: '9mk0' },
'2026-10-21': { link: 'https://drive.uc.cn/s/e2a92909f54c4', code: 'sqsy' },
'2026-10-22': { link: 'https://drive.uc.cn/s/c67589d0af9f4', code: '1ezv' },
'2026-10-23': { link: 'https://drive.uc.cn/s/01b7adcdf2dd4', code: 'g1x3' },
'2026-10-24': { link: 'https://drive.uc.cn/s/29b3e8cf3b274', code: 'wjgb' },
'2026-10-25': { link: 'https://drive.uc.cn/s/d48d44f2cf964', code: 'ezik' },
'2026-10-26': { link: 'https://drive.uc.cn/s/4241b34e92154', code: '5vs8' },
'2026-10-27': { link: 'https://drive.uc.cn/s/19e55a0bd1454', code: 'b0ev' },
'2026-10-28': { link: 'https://drive.uc.cn/s/e650370a6f1a4', code: 'bjsk' },
'2026-10-29': { link: 'https://drive.uc.cn/s/4e00b6b607f34', code: 'jfc3' },
'2026-10-30': { link: 'https://drive.uc.cn/s/7a15f60ab4d54', code: 'jcsx' },
'2026-10-31': { link: 'https://drive.uc.cn/s/199af877f5024', code: 'qlc5' },
'2026-11-01': { link: 'https://drive.uc.cn/s/61202bdb566b4', code: 'ol9k' },
'2026-11-02': { link: 'https://drive.uc.cn/s/2ddb0a7de5294', code: 'v1ko' },
'2026-11-03': { link: 'https://drive.uc.cn/s/e4a6133117ff4', code: 'ikg2' },
'2026-11-04': { link: 'https://drive.uc.cn/s/4977163732da4', code: 'yekg' },
'2026-11-05': { link: 'https://drive.uc.cn/s/734846206bf94', code: 'l11x' },
'2026-11-06': { link: 'https://drive.uc.cn/s/9eda29baaf2a4', code: '009r' },
'2026-11-07': { link: 'https://drive.uc.cn/s/b9e5b35e1ce74', code: '3vwd' },
'2026-11-08': { link: 'https://drive.uc.cn/s/85a9fc7bde364', code: 'uhb5' },
'2026-11-09': { link: 'https://drive.uc.cn/s/7b1e71c453584', code: 'om9b' },
'2026-11-10': { link: 'https://drive.uc.cn/s/c167a1d8e1f84', code: 'cb79' },
'2026-11-11': { link: 'https://drive.uc.cn/s/90146cbfa0e34', code: 'ucb4' },
'2026-11-12': { link: 'https://drive.uc.cn/s/7b33872d0dad4', code: 'irgi' },
'2026-11-13': { link: 'https://drive.uc.cn/s/c4628636e1424', code: 'vfdm' },
'2026-11-14': { link: 'https://drive.uc.cn/s/593565f0116a4', code: 'pfqo' },
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
    '2026-10-13': { link: 'https://pan.quark.cn/s/2d845545b9c6', code: 'zpwj' }
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