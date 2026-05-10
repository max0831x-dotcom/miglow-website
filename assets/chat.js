/* 微光聊天機器人 - 前端視窗 */

(function(){
  'use strict';

  // ---- Dify 設定（待填入） ----
  const DIFY_API_URL = '';        // 例: https://api.dify.ai/v1/chat-messages
  const DIFY_API_KEY = '';        // 應用憑證

  // ---- DOM 元素 ----
  let btn, win, body, input, sendBtn, uploadBtn, preview, previewImg, previewName, previewRemove;
  let uploadFile = null;

  // ---- 初始化 ----
  function init() {
    // 注入 CSS
    if (!document.getElementById('mc-style')) {
      var link = document.createElement('link');
      link.id = 'mc-style';
      link.rel = 'stylesheet';
      link.href = 'assets/chat.css';
      document.head.appendChild(link);
    }

    // 建立 DOM
    btn = document.createElement('button');
    btn.id = 'mc-btn';
    btn.innerHTML = '💬';
    btn.title = '詢問小離';
    btn.onclick = toggleWindow;

    win = document.createElement('div');
    win.id = 'mc-window';
    win.innerHTML = `
      <div id="mc-header">
        <div class="avatar">🍪</div>
        <div class="info">
          <div class="name">小離 ✿ 微光助手</div>
          <div class="status">🟢 在線中</div>
        </div>
        <button class="close" onclick="document.getElementById('mc-window').classList.remove('open')">✕</button>
      </div>
      <div id="mc-body">
        <div class="mc-msg bot">嗨～我是小離！有什麼關於微光雪花酥的問題都可以問我喔 🍪</div>
      </div>
      <div id="mc-preview">
        <img id="mc-preview-img" src="" alt="preview">
        <span class="name" id="mc-preview-name"></span>
        <button class="remove" onclick="window.__mcRemoveFile()">✕</button>
      </div>
      <div id="mc-input-area">
        <button id="mc-upload-btn" onclick="document.getElementById('mc-file-input').click()">📎</button>
        <textarea id="mc-input" rows="1" placeholder="輸入訊息…"></textarea>
        <button id="mc-send-btn" onclick="window.__mcSend()">➤</button>
        <input type="file" id="mc-file-input" accept="image/jpeg,image/png,image/gif,image/webp" style="display:none" onchange="window.__mcHandleFile(this)">
      </div>`;

    document.body.appendChild(btn);
    document.body.appendChild(win);

    body = document.getElementById('mc-body');
    input = document.getElementById('mc-input');
    sendBtn = document.getElementById('mc-send-btn');
    uploadBtn = document.getElementById('mc-upload-btn');
    preview = document.getElementById('mc-preview');
    previewImg = document.getElementById('mc-preview-img');
    previewName = document.getElementById('mc-preview-name');
    previewRemove = preview.querySelector('.remove');

    // Enter 送出
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.__mcSend();
      }
    });

    // Autoresize textarea
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
  }

  // ---- 開關視窗 ----
  function toggleWindow() {
    win.classList.toggle('open');
    if (win.classList.contains('open')) {
      input.focus();
      body.scrollTop = body.scrollHeight;
    }
  }

  // ---- 上傳圖片 ----
  window.__mcHandleFile = function(el) {
    var file = el.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('請上傳圖片檔'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('圖片最大 10MB'); return; }

    uploadFile = file;
    var reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
      previewName.textContent = file.name;
      preview.classList.add('show');
    };
    reader.readAsDataURL(file);
    el.value = '';
  };

  window.__mcRemoveFile = function() {
    uploadFile = null;
    previewImg.src = '';
    previewName.textContent = '';
    preview.classList.remove('show');
  };

  // ---- 發送訊息 ----
  window.__mcSend = function() {
    var text = input.value.trim();
    if (!text && !uploadFile) return;

    sendBtn.disabled = true;

    // 使用者對話
    var userDiv = document.createElement('div');
    userDiv.className = 'mc-msg user';
    userDiv.textContent = text || (uploadFile ? '(圖片)' : '');
    if (uploadFile) {
      var img = document.createElement('img');
      img.src = URL.createObjectURL(uploadFile);
      userDiv.appendChild(img);
    }
    var time = document.createElement('div');
    time.className = 'time';
    time.textContent = new Date().toLocaleTimeString('zh-TW', {hour:'2-digit',minute:'2-digit'});
    userDiv.appendChild(time);
    body.appendChild(userDiv);
    body.scrollTop = body.scrollHeight;

    input.value = '';
    input.style.height = 'auto';
    var uploaded = uploadFile;
    var uploadedName = uploadFile ? uploadFile.name : '';
    window.__mcRemoveFile();

    // 載入動畫
    var loading = document.createElement('div');
    loading.className = 'mc-msg bot';
    loading.innerHTML = '<div class="mc-dots"><span></span><span></span><span></span></div>';
    body.appendChild(loading);
    body.scrollTop = body.scrollHeight;

    // 若有 Dify API 設定則呼叫
    if (DIFY_API_URL && DIFY_API_KEY) {
      // 收集對話歷史
      var msgs = [];
      body.querySelectorAll('.mc-msg.bot, .mc-msg.user').forEach(function(el) {
        if (el === loading) return;
        var role = el.classList.contains('bot') ? 'assistant' : 'user';
        var content = '';
        var textNode = el.childNodes[0];
        if (textNode) content = textNode.textContent || '';
        var imgNode = el.querySelector('img');
        if (imgNode && imgNode.src && imgNode.src.startsWith('data:')) {
          content = '[圖片] ' + content;
        }
        if (!content.trim() && !imgNode) return;
        msgs.push({ role: role, content: content.trim() || (role==='user'?'(圖片)':'(回覆)') });
      });

      var formData = new FormData();
      formData.append('inputs', '{}');
      formData.append('query', text || (uploaded ? '(圖片)' : ''));
      formData.append('response_mode', 'blocking');
      formData.append('conversation_id', '');
      formData.append('user', 'miglow-web');

      if (uploaded) {
        formData.append('files', uploaded, uploadedName);
      }

      fetch(DIFY_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + DIFY_API_KEY
        },
        body: formData
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        loading.remove();
        var reply = data.answer || '⋯抱歉，小離沒有回應。';
        appendBotMsg(reply);
      })
      .catch(function(err) {
        loading.remove();
        appendBotMsg('⋯連線失敗，請稍後再試。');
        console.error('Dify error:', err);
      });
    } else {
      // 無 API 設定：模擬已離線
      setTimeout(function() {
        loading.remove();
        appendBotMsg('⋯小離正在待命，等 API 設定好就能回答問題了 🍃');
      }, 800);
    }

    sendBtn.disabled = false;
  };

  function appendBotMsg(text) {
    var div = document.createElement('div');
    div.className = 'mc-msg bot';
    div.textContent = text;
    var time = document.createElement('div');
    time.className = 'time';
    time.textContent = new Date().toLocaleTimeString('zh-TW', {hour:'2-digit',minute:'2-digit'});
    div.appendChild(time);
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  // ---- 啟動 ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
