// NOVAI shared utilities — extracted from duplicated definitions across 6+ JS files.
// Loaded first in every page; provides common helpers under the window.NovaUtils namespace.
// Each page file can still declare local aliases (tr, escapeHtml, etc.) for backward compatibility
// during the transition, but those aliases simply delegate to NovaUtils members.
(function(){
    'use strict';

    /* ── i18n helpers ── */
    function tr(key){ return window.StudioI18n ? StudioI18n.t(key) : key; }
    function trf(key, values={}){
        return Object.entries(values).reduce(
            (text, [name, value]) => text.replaceAll(`{${name}}`, String(value ?? '')),
            tr(key)
        );
    }
    function langIsEn(){ return window.StudioI18n?.lang?.() === 'en'; }

    /* ── icon refresh ── */
    function refreshIcons(){ if(window.lucide) lucide.createIcons({ icons: lucide.icons }); }

    /* ── HTML safety ── */
    function escapeHtml(str){
        return String(str == null ? '' : str).replace(/[&<>"']/g,
            s => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[s]));
    }
    function escapeAttr(str){ return escapeHtml(str); }

    /* ── clipboard ── */
    function copyTextWithCopyEvent(value){
        let handled = false;
        const onCopy = event => {
            event.preventDefault();
            event.clipboardData?.setData('text/plain', value);
            handled = true;
        };
        document.addEventListener('copy', onCopy);
        try { return document.execCommand('copy') && handled; }
        catch(_) { return false; }
        finally  { document.removeEventListener('copy', onCopy); }
    }
    function copyTextWithTextarea(value){
        let ta = null;
        try {
            ta = document.createElement('textarea');
            ta.value = value;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            ta.style.top = '0';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus({ preventScroll: true });
            ta.select();
            ta.setSelectionRange(0, ta.value.length);
            return document.execCommand('copy');
        } catch(_) { return false; }
        finally { ta?.remove(); }
    }
    async function clipboardMatchesText(value){
        try {
            if(navigator.clipboard?.readText && window.isSecureContext){
                return (await navigator.clipboard.readText()) === value;
            }
        } catch(_) {}
        return null;
    }
    async function copyTextToClipboard(text){
        const value = String(text || '');
        if(!value) return false;
        if(copyTextWithCopyEvent(value) || copyTextWithTextarea(value)){
            const verified = await clipboardMatchesText(value);
            return verified !== false;
        }
        try {
            if(navigator.clipboard?.writeText && window.isSecureContext !== false){
                await navigator.clipboard.writeText(value);
                const verified = await clipboardMatchesText(value);
                return verified !== false;
            }
        } catch(_) {}
        return false;
    }

    /* ── unique id ── */
    function uid(prefix='n'){
        return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
    }

    /* ── time helpers ── */
    function nowMs(){ return Date.now(); }
    function formatRunDuration(ms){
        const total = Math.max(0, Math.round(Number(ms || 0) / 1000));
        const m = Math.floor(total / 60);
        const s = total % 60;
        return m ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`;
    }

    /* ── API error helpers ── */
    function apiErrorMessage(data, fallback='请求失败'){
        if(!data) return fallback;
        if(typeof data === 'string') return data || fallback;
        const detail = data.detail ?? data.error ?? data.message;
        if(typeof detail === 'string') return detail || fallback;
        if(Array.isArray(detail)){
            const messages = detail.map(item => {
                if(typeof item === 'string') return item;
                const loc = Array.isArray(item?.loc) ? item.loc.filter(x => x !== 'body').join('.') : '';
                const msg = item?.msg || item?.message || JSON.stringify(item);
                return loc ? `${loc}: ${msg}` : msg;
            }).filter(Boolean);
            return messages.join('\n') || fallback;
        }
        if(detail && typeof detail === 'object'){
            return detail.message || detail.msg || JSON.stringify(detail);
        }
        try { return JSON.stringify(data); } catch(e) { return fallback; }
    }
    async function responseErrorMessage(response, fallback='请求失败'){
        try {
            const data = await response.clone().json();
            return apiErrorMessage(data, fallback);
        } catch(e) {
            try {
                const text = await response.text();
                return text || fallback;
            } catch(_) { return fallback; }
        }
    }

    /* ── file download ── */
    function downloadBlob(blob, filename){
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    /* ── theme helper ── */
    function applyTheme(theme){
        const dark = theme === 'dark';
        document.documentElement.classList.toggle('studio-theme-dark', dark);
        document.documentElement.classList.toggle('theme-dark', dark);
        if(document.body){
            document.body.classList.toggle('studio-theme-dark', dark);
            document.body.classList.toggle('theme-dark', dark);
        }
    }

    /* ── async helpers ── */
    function sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

    // Convert a URL to a base64 data-URL string (fetch → blob → FileReader).
    // Error message uses i18n when available.
    async function urlToBase64(url){
        const res = await fetch(url);
        if(!res.ok) throw new Error(tr('smart.errImageRead') || '图片读取失败');
        const blob = await res.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /* ── status display (generic) ── */
    function setStatusToElement(el, text){ if(el) el.textContent = text; }

    /* ── API adapters for backend utility endpoints ── */
    // Storage settings: fetch current storage path config
    async function fetchStorageSettings(){
        try {
            const res = await fetch('/api/storage/settings');
            if(!res.ok) throw new Error(await responseErrorMessage(res));
            return await res.json();
        } catch(e) { console.warn('[NovaUtils] fetchStorageSettings failed:', e); return null; }
    }
    // Storage settings: save custom data root path
    async function saveStorageSettings(dataRoot){
        try {
            const res = await fetch('/api/storage/settings', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data_root: dataRoot || '' }),
            });
            if(!res.ok) throw new Error(await responseErrorMessage(res));
            return await res.json();
        } catch(e) { console.warn('[NovaUtils] saveStorageSettings failed:', e); return null; }
    }
    // Storage settings: apply (ensure all dirs exist)
    async function applyStorageSettings(){
        try {
            const res = await fetch('/api/storage/apply', { method: 'POST' });
            if(!res.ok) throw new Error(await responseErrorMessage(res));
            return await res.json();
        } catch(e) { console.warn('[NovaUtils] applyStorageSettings failed:', e); return null; }
    }
    // Image media URL detection (calls backend looks_like_image_media_url)
    async function detectImageMediaUrl(value){
        try {
            const res = await fetch('/api/image/detect-media-url', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value }),
            });
            if(!res.ok) throw new Error(await responseErrorMessage(res));
            return await res.json();
        } catch(e) {
            // Fallback: simple client-side check
            const text = String(value || '').trim().toLowerCase();
            return {
                value: value,
                is_image_media_url: text.startsWith('data:image/') || /\.(png|jpe?g|webp|gif|bmp|tiff)$/i.test(text),
                is_base64: text.startsWith('data:image/'),
                is_local_path: false,
            };
        }
    }
    // Quick client-side image URL check (no network call, mirrors backend logic)
    function looksLikeImageMediaUrl(value){
        const text = String(value || '').trim().toLowerCase();
        if(!text) return false;
        if(text.startsWith('data:image/')) return true;
        const path = text.split('?')[0].split('#')[0];
        return /\.(png|jpe?g|webp|gif|bmp|tiff)$/i.test(path);
    }
    // Asset classification prompt & dimension names
    async function fetchClassificationPrompt(){
        try {
            const res = await fetch('/api/asset/classification-prompt');
            if(!res.ok) throw new Error(await responseErrorMessage(res));
            return await res.json();
        } catch(e) { console.warn('[NovaUtils] fetchClassificationPrompt failed:', e); return null; }
    }
    // Update classification prompt with extra requirements
    async function updateClassificationPrompt(extraPrompt){
        try {
            const res = await fetch('/api/asset/classification-prompt', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extra_prompt: extraPrompt || '' }),
            });
            if(!res.ok) throw new Error(await responseErrorMessage(res));
            return await res.json();
        } catch(e) { console.warn('[NovaUtils] updateClassificationPrompt failed:', e); return null; }
    }
    // Model name normalization (dedup & sort)
    async function normalizeModels(models, protocols){
        try {
            const res = await fetch('/api/models/normalize', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ models: models || [], protocols: protocols || {} }),
            });
            if(!res.ok) throw new Error(await responseErrorMessage(res));
            return await res.json();
        } catch(e) { console.warn('[NovaUtils] normalizeModels failed:', e); return null; }
    }
    // RunningHub wallet status
    async function fetchRhWalletStatus(){
        try {
            const res = await fetch('/api/runninghub/wallet-status');
            if(!res.ok) throw new Error(await responseErrorMessage(res));
            return await res.json();
        } catch(e) { console.warn('[NovaUtils] fetchRhWalletStatus failed:', e); return null; }
    }

    /* ── expose ── */
    window.NovaUtils = {
        tr, trf, langIsEn, refreshIcons,
        escapeHtml, escapeAttr,
        copyTextToClipboard, copyTextWithCopyEvent, copyTextWithTextarea, clipboardMatchesText,
        uid, nowMs, formatRunDuration,
        sleep, urlToBase64,
        apiErrorMessage, responseErrorMessage,
        downloadBlob, applyTheme, setStatusToElement,
        // API adapters
        fetchStorageSettings, saveStorageSettings, applyStorageSettings,
        detectImageMediaUrl, looksLikeImageMediaUrl,
        fetchClassificationPrompt, updateClassificationPrompt,
        normalizeModels, fetchRhWalletStatus,
    };
})();
