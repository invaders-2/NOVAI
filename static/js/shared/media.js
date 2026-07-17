// NOVAI shared media helpers — unified from 8 pairs of canvas*/smart* parallel functions.
// Both canvas.js and smart-canvas.js had identical media URL, preview, and video helpers
// with different prefixes. This module provides a single canonical implementation.
// The legacy prefixed wrappers (canvasPreviewImgHtml, smartPreviewImgHtml, etc.) are
// kept as thin aliases that delegate to these shared functions during transition.
(function(){
    'use strict';

    /* ── URL resolution ── */

    // Extract the original (non-proxied) URL from a media-preview or download-output proxy URL.
    function originalMediaUrl(url){
        const raw = String(url || '');
        if(!raw) return '';
        try {
            const parsed = new URL(raw, window.location.origin);
            if(parsed.pathname === '/api/media-preview'){
                return parsed.searchParams.get('url') || raw;
            }
        } catch(e) {}
        return raw;
    }

    // Also support item objects (smart-canvas pattern): {url, name, ...}
    function originalMediaUrlFromItem(itemOrUrl){
        const raw = typeof itemOrUrl === 'string' ? itemOrUrl : (itemOrUrl?.url || '');
        return originalMediaUrl(String(raw || ''));
    }

    // Extract filename from URL path.
    function fileNameFromUrl(url){
        try {
            const parsed = new URL(String(url || ''), window.location.href);
            return decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '');
        } catch(e) {
            return decodeURIComponent(String(url || '').split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || '');
        }
    }

    // Build a proxy URL for CORS-cross-origin images (download-output endpoint).
    function proxiedMediaUrl(url, name=''){
        const raw = originalMediaUrl(url);
        if(!raw || raw.startsWith('/assets/') || raw.startsWith('/output/') || raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
        if(!/^https?:\/\//i.test(raw)) return raw;
        const filename = name || fileNameFromUrl(raw) || 'preview';
        return `/api/download-output?inline=1&url=${encodeURIComponent(raw)}&name=${encodeURIComponent(filename)}`;
    }

    // proxiedMediaUrl that accepts item objects.
    function proxiedMediaUrlFromItem(itemOrUrl, name=''){
        const url = originalMediaUrlFromItem(itemOrUrl);
        if(!url || url.startsWith('/assets/') || url.startsWith('/output/') || url.startsWith('data:') || url.startsWith('blob:')) return url;
        if(!/^https?:\/\//i.test(url)) return url;
        const filename = name || (typeof itemOrUrl === 'object' ? (itemOrUrl.name || '') : '') || fileNameFromUrl(url) || 'preview';
        return `/api/download-output?inline=1&url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`;
    }

    // Choose display URL: local paths stay local, remote URLs get proxied.
    function displayMediaUrl(url, name=''){
        const raw = originalMediaUrl(url);
        return /^https?:\/\//i.test(raw) ? proxiedMediaUrl(raw, name) : raw;
    }

    // displayMediaUrl that accepts item objects.
    function displayMediaUrlFromItem(itemOrUrl, name=''){
        const url = originalMediaUrlFromItem(itemOrUrl);
        return /^https?:\/\//i.test(url) ? proxiedMediaUrlFromItem(itemOrUrl, name) : url;
    }

    // Build a media-preview (thumbnail) URL for local assets.
    function mediaPreviewUrl(url, size=512){
        const raw = originalMediaUrl(url);
        if(!raw || raw.startsWith('data:') || raw.startsWith('blob:')) return raw;
        if(!raw.startsWith('/output/') && !raw.startsWith('/assets/')) return displayMediaUrl(raw);
        if(!/\.(png|jpe?g|webp|gif|bmp|avif|tiff?|mp4|webm|mov|m4v|avi|mkv|flv)(\?|#|$)/i.test(raw)) return raw;
        const width = Math.max(64, Math.min(2048, Math.round(Number(size) || 512)));
        return `/api/media-preview?w=${width}&url=${encodeURIComponent(raw)}`;
    }

    // mediaPreviewUrl that accepts item objects.
    function mediaPreviewUrlFromItem(itemOrUrl, size=512){
        const raw = originalMediaUrlFromItem(itemOrUrl);
        if(!raw || raw.startsWith('data:') || raw.startsWith('blob:')) return displayMediaUrlFromItem(itemOrUrl);
        if(!raw.startsWith('/output/') && !raw.startsWith('/assets/')) return displayMediaUrlFromItem(itemOrUrl);
        if(!/\.(png|jpe?g|webp|gif|bmp|avif|tiff?|mp4|webm|mov|m4v|avi|mkv)(\?|#|$)/i.test(raw)) return displayMediaUrlFromItem(itemOrUrl);
        const width = Math.max(64, Math.min(2048, Math.round(Number(size) || 512)));
        return `/api/media-preview?w=${width}&url=${encodeURIComponent(raw)}`;
    }

    /* ── Preview HTML generators ── */

    const { escapeHtml, escapeAttr } = window.NovaUtils;

    function previewImgHtml(url, size=512, attrs=''){
        const original = originalMediaUrl(url);
        const preview  = mediaPreviewUrl(original, size);
        return `<img loading="lazy" decoding="async" src="${escapeAttr(preview)}" data-preview-src="${escapeAttr(preview)}" data-original-src="${escapeAttr(original)}" data-url="${escapeAttr(original)}"${attrs ? ` ${attrs}` : ''}>`;
    }

    // previewImgHtml that accepts item objects (smart-canvas pattern).
    function previewImgHtmlFromItem(itemOrUrl, size=512, attrs=''){
        const original = originalMediaUrlFromItem(itemOrUrl);
        const preview  = mediaPreviewUrlFromItem(itemOrUrl, size);
        return `<img src="${escapeHtml(preview)}" data-preview-src="${escapeAttr(preview)}" data-original-src="${escapeAttr(original)}"${attrs ? ` ${attrs}` : ''}>`;
    }

    // Load original image dimensions (width, height).
    function loadImageDimensions(url){
        const src = String(url || '');
        if(!src || /^data:/i.test(src) || /^blob:/i.test(src)) return Promise.resolve(null);
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? { w: img.naturalWidth, h: img.naturalHeight } : null);
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    function videoPreviewHtml(url, size=512, attrs=''){
        const original = originalMediaUrl(url);
        const preview  = mediaPreviewUrl(original, size);
        return `<img loading="lazy" decoding="async" src="${escapeAttr(preview)}" data-preview-src="${escapeAttr(preview)}" data-original-src="${escapeAttr(original)}" data-url="${escapeAttr(original)}" data-preview-kind="video"${attrs ? ` ${attrs}` : ''}>`;
    }

    function videoPreviewHtmlFromItem(itemOrUrl, size=512, attrs=''){
        const original = originalMediaUrlFromItem(itemOrUrl);
        const preview  = mediaPreviewUrlFromItem(itemOrUrl, size);
        return `<img src="${escapeHtml(preview)}" data-preview-src="${escapeAttr(preview)}" data-original-src="${escapeAttr(original)}" data-url="${escapeAttr(original)}" data-preview-kind="video"${attrs ? ` ${attrs}` : ''}>`;
    }

    function videoFallbackHtml(url, attrs=''){
        const original = originalMediaUrl(url);
        const src = displayMediaUrl(original);
        return `<video src="${escapeAttr(src)}" data-url="${escapeAttr(original)}" muted preload="metadata" playsinline disablepictureinpicture controlslist="nodownload noplaybackrate noremoteplayback"${attrs ? ` ${attrs}` : ''}></video>`;
    }

    function videoFallbackHtmlFromItem(url, attrs=''){
        const original = originalMediaUrlFromItem(url);
        const src = displayMediaUrlFromItem({ url: original });
        return `<video src="${escapeHtml(src)}" data-url="${escapeAttr(original)}" muted preload="metadata" playsinline disablepictureinpicture controlslist="nodownload noplaybackrate noremoteplayback"${attrs ? ` ${attrs}` : ''}></video>`;
    }

    function videoPlayerHtml(url, attrs=''){
        const original = originalMediaUrl(url);
        const src = displayMediaUrl(original);
        return `<video src="${escapeAttr(src)}" data-url="${escapeAttr(original)}" controls autoplay playsinline preload="metadata" disablepictureinpicture controlslist="nodownload noplaybackrate noremoteplayback"${attrs ? ` ${attrs}` : ''}></video>`;
    }

    function videoPlayerHtmlFromItem(url, attrs=''){
        const original = originalMediaUrlFromItem(url);
        const src = displayMediaUrlFromItem({ url: original });
        return `<video src="${escapeHtml(src)}" data-url="${escapeAttr(original)}" data-inline-video-active="1" controls autoplay playsinline preload="metadata" disablepictureinpicture controlslist="nodownload noplaybackrate noremoteplayback"${attrs ? ` ${attrs}` : ''}></video>`;
    }

    /* ── RunningHub field helpers ── */

    // Determine the logical kind of a RunningHub field (image, video, audio, slider, number, boolean, text).
    function rhFieldKind(field){
        const type = String(field?.fieldType || '').trim().toUpperCase();
        if(type === 'IMAGE') return 'image';
        if(type === 'VIDEO') return 'video';
        if(type === 'AUDIO') return 'audio';
        if(type === 'SLIDER') return 'slider';
        if(['NUMBER','FLOAT','INTEGER','INT'].includes(type)) return 'number';
        if(['BOOLEAN','BOOL'].includes(type)) return 'boolean';
        const key = `${field?.fieldName || ''} ${field?.fieldValue || ''}`.toLowerCase();
        if(/\b(image|img|mask|photo|picture)\b/.test(key) || /\.(png|jpe?g|webp|gif|bmp)(\?|$)/i.test(key)) return 'image';
        if(/\b(video|movie|mp4)\b/.test(key) || /\.(mp4|webm|mov|m4v|mkv)(\?|$)/i.test(key)) return 'video';
        if(/\b(audio|sound|music|voice)\b/.test(key) || /\.(mp3|wav|ogg|m4a|flac|aac)(\?|$)/i.test(key)) return 'audio';
        return 'text';
    }

    // Determine the role of a RunningHub field (image, video, audio, number, slider, boolean, prompt, text).
    function rhFieldRole(field){
        const kind = rhFieldKind(field);
        if(['image','video','audio','number','slider','boolean'].includes(kind)) return kind;
        const text = `${field?.fieldName || ''} ${field?.label || ''} ${field?.group || ''}`.toLowerCase();
        if(/prompt|positive|negative|text|caption|description|关键词|提示词|正向|负向/.test(text)) return 'prompt';
        return 'text';
    }

    // Filter RunningHub fields: prefer enabled=true ones; fall back to all if none are explicitly enabled.
    function rhUsableFields(fields){
        const list = Array.isArray(fields) ? fields : [];
        if(!list.length) return [];
        const enabled = list.filter(f => f.enabled === true);
        return enabled.length ? enabled : list;
    }

    /* ── expose ── */
    window.NovaMedia = {
        originalMediaUrl, originalMediaUrlFromItem,
        fileNameFromUrl,
        proxiedMediaUrl, proxiedMediaUrlFromItem,
        displayMediaUrl, displayMediaUrlFromItem,
        mediaPreviewUrl, mediaPreviewUrlFromItem,
        previewImgHtml, previewImgHtmlFromItem,
        loadImageDimensions,
        videoPreviewHtml, videoPreviewHtmlFromItem,
        videoFallbackHtml, videoFallbackHtmlFromItem,
        videoPlayerHtml, videoPlayerHtmlFromItem,
        rhFieldKind, rhFieldRole, rhUsableFields
    };
})();
