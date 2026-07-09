(function(){
    'use strict';

    /* ---------------------------------------------------------------------
     * HistoryBulkManager
     * 历史图片批量管理：进入管理模式后可多选 / 全选 / 批量删除。
     * 5 个生成页面（在线生图 / 文生图 / 细节增强 / 图片编辑 / 角度控制）
     * 共用同一套契约：
     *   - 卡片含 [data-history-ts] 属性 与 id="history-{ts}"
     *   - 卡片 onclick 在 body.history-bulk-selecting 时提前 return
     *   - 删除走 POST /api/history/delete {timestamp}
     * 用法：window.HistoryBulkManager.attach({ masonry:'#masonry' })
     * ------------------------------------------------------------------- */

    function tr(key){
        return (window.StudioI18n && StudioI18n.t) ? StudioI18n.t(key) : key;
    }
    function fmt(key, vars){
        let s = tr(key);
        if(vars) Object.keys(vars).forEach(k => { s = s.replace('{' + k + '}', vars[k]); });
        return s;
    }

    function injectStyles(){
        if(document.getElementById('history-bulk-manager-css')) return;
        const style = document.createElement('style');
        style.id = 'history-bulk-manager-css';
        style.textContent = `
            .hbm-toolbar {
                display: flex; align-items: center; gap: 10px;
                margin-bottom: 20px; flex-wrap: wrap;
            }
            .hbm-toolbar .hbm-spacer { flex: 1; }
            .hbm-count {
                font-size: 11px; font-weight: 800; letter-spacing: .05em;
                color: #64748b; text-transform: uppercase;
            }
            .hbm-btn {
                display: inline-flex; align-items: center; gap: 6px;
                height: 36px; padding: 0 16px; border-radius: 999px;
                border: 1px solid #e2e8f0; background: #fff; color: #111827;
                font-size: 11px; font-weight: 800; letter-spacing: .04em;
                text-transform: uppercase; cursor: pointer;
                transition: all .25s cubic-bezier(.4,0,.2,1); white-space: nowrap;
            }
            .hbm-btn:hover { border-color: #111827; transform: translateY(-1px); }
            .hbm-btn:disabled { opacity: .45; cursor: not-allowed; transform: none; }
            .hbm-btn.hbm-primary { background: #111827; color: #fff; border-color: #111827; }
            .hbm-btn.hbm-danger { background: #dc2626; color: #fff; border-color: #dc2626; }
            .hbm-btn.hbm-danger:hover { background: #b91c1c; border-color: #b91c1c; }
            .hbm-hide { display: none !important; }

            /* 选择模式下的卡片浮层 */
            body.history-bulk-selecting [data-history-ts] {
                position: relative; cursor: pointer !important;
            }
            body.history-bulk-selecting [data-history-ts]::after {
                content: ''; position: absolute; top: 12px; left: 12px;
                width: 26px; height: 26px; border-radius: 50%;
                border: 2px solid #fff; background: rgba(15,23,42,.35);
                box-shadow: 0 2px 8px rgba(0,0,0,.25);
                z-index: 30; pointer-events: none;
                display: flex; align-items: center; justify-content: center;
                font-size: 14px; font-weight: 900; color: transparent;
                line-height: 1;
            }
            body.history-bulk-selecting [data-history-ts].hbm-selected::after {
                content: '\\2713'; background: #111827; border-color: #111827; color: #fff;
            }
            body.history-bulk-selecting [data-history-ts].hbm-selected {
                outline: 3px solid #111827; outline-offset: -3px;
            }

            /* 暗色主题 */
            .theme-dark .hbm-btn { background: #0f172a; color: #e2e8f0; border-color: rgba(148,163,184,.3); }
            .theme-dark .hbm-btn:hover { border-color: #e2e8f0; }
            .theme-dark .hbm-btn.hbm-primary { background: #e2e8f0; color: #0f172a; border-color: #e2e8f0; }
            .theme-dark .hbm-count { color: #94a3b8; }
            .theme-dark body.history-bulk-selecting [data-history-ts].hbm-selected,
            body.theme-dark.history-bulk-selecting [data-history-ts].hbm-selected { outline-color: #e2e8f0; }
        `;
        document.head.appendChild(style);
    }

    function attach(opts){
        opts = opts || {};
        const masonrySel = opts.masonry || '#masonry';
        const masonry = document.querySelector(masonrySel);
        if(!masonry) return null;
        if(masonry.dataset.hbmAttached === '1') return masonry._hbm || null;
        masonry.dataset.hbmAttached = '1';

        injectStyles();

        let selecting = false;

        /* -------- 工具条 -------- */
        const bar = document.createElement('div');
        bar.className = 'hbm-toolbar';

        const manageBtn = document.createElement('button');
        manageBtn.type = 'button';
        manageBtn.className = 'hbm-btn';
        manageBtn.innerHTML = '<i data-lucide="check-square" style="width:14px;height:14px"></i><span></span>';
        const manageLabel = manageBtn.querySelector('span');

        const spacer = document.createElement('div');
        spacer.className = 'hbm-spacer';

        const countEl = document.createElement('span');
        countEl.className = 'hbm-count hbm-hide';

        const selectAllBtn = document.createElement('button');
        selectAllBtn.type = 'button';
        selectAllBtn.className = 'hbm-btn hbm-hide';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'hbm-btn hbm-danger hbm-hide';
        deleteBtn.innerHTML = '<i data-lucide="trash-2" style="width:14px;height:14px"></i><span></span>';
        const deleteLabel = deleteBtn.querySelector('span');

        const exitBtn = document.createElement('button');
        exitBtn.type = 'button';
        exitBtn.className = 'hbm-btn hbm-primary hbm-hide';

        bar.append(manageBtn, spacer, countEl, selectAllBtn, deleteBtn, exitBtn);
        masonry.parentNode.insertBefore(bar, masonry);

        function cards(){
            return Array.from(masonry.querySelectorAll('[data-history-ts]'));
        }
        function selectedCards(){
            return cards().filter(c => c.classList.contains('hbm-selected'));
        }

        function refreshLabels(){
            manageLabel.textContent = tr('bulk.manage');
            const all = cards();
            const sel = selectedCards();
            countEl.textContent = fmt('bulk.selectedCount', { n: sel.length });
            const allSelected = all.length > 0 && sel.length === all.length;
            selectAllBtn.textContent = allSelected ? tr('bulk.deselectAll') : tr('bulk.selectAll');
            deleteLabel.textContent = tr('bulk.deleteSelected');
            deleteBtn.disabled = sel.length === 0;
            exitBtn.textContent = tr('bulk.exit');
            if(window.lucide && lucide.createIcons) lucide.createIcons();
        }

        function enter(){
            selecting = true;
            document.body.classList.add('history-bulk-selecting');
            manageBtn.classList.add('hbm-hide');
            [countEl, selectAllBtn, deleteBtn, exitBtn].forEach(el => el.classList.remove('hbm-hide'));
            refreshLabels();
        }
        function exit(){
            selecting = false;
            document.body.classList.remove('history-bulk-selecting');
            cards().forEach(c => c.classList.remove('hbm-selected'));
            manageBtn.classList.remove('hbm-hide');
            [countEl, selectAllBtn, deleteBtn, exitBtn].forEach(el => el.classList.add('hbm-hide'));
            refreshLabels();
        }

        manageBtn.addEventListener('click', enter);
        exitBtn.addEventListener('click', exit);

        selectAllBtn.addEventListener('click', () => {
            const all = cards();
            const allSelected = all.length > 0 && selectedCards().length === all.length;
            all.forEach(c => c.classList.toggle('hbm-selected', !allSelected));
            refreshLabels();
        });

        /* 选择模式下点击卡片 = 切换选中（捕获阶段拦截，避免触发卡片自身逻辑） */
        masonry.addEventListener('click', (e) => {
            if(!selecting) return;
            const card = e.target.closest('[data-history-ts]');
            if(!card || !masonry.contains(card)) return;
            e.preventDefault();
            e.stopPropagation();
            card.classList.toggle('hbm-selected');
            refreshLabels();
        }, true);

        async function doDelete(){
            const sel = selectedCards();
            if(sel.length === 0) return;
            if(!confirm(fmt('bulk.deleteConfirm', { n: sel.length }))) return;

            deleteBtn.disabled = true;
            deleteLabel.textContent = tr('bulk.deleting');

            const results = await Promise.allSettled(sel.map(card => {
                const ts = card.dataset.historyTs;
                return fetch('/api/history/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ timestamp: ts })
                }).then(r => r.json()).then(res => {
                    if(res && res.success){ card.remove(); return true; }
                    throw new Error('delete failed');
                });
            }));

            const failed = results.filter(r => r.status === 'rejected').length;
            if(failed > 0) alert(failed + ' / ' + sel.length + ' ✗');

            refreshLabels();
            if(selectedCards().length === 0 && cards().length === 0){ exit(); }
            else { deleteBtn.disabled = selectedCards().length === 0; deleteLabel.textContent = tr('bulk.deleteSelected'); }
        }
        deleteBtn.addEventListener('click', doDelete);

        /* 语言切换时刷新文案 */
        window.addEventListener('studio-lang-change', refreshLabels);

        refreshLabels();

        const api = { enter, exit, refresh: refreshLabels, isSelecting: () => selecting };
        masonry._hbm = api;
        return api;
    }

    window.HistoryBulkManager = { attach };
})();
