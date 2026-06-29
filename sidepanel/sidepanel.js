const STORAGE_KEY = 'prompt_plugin_data';
let data = { folders: [], prompts: [], nextId: 1 };
let currentFolderId = null;
let editingItem = null;
let dragItem = null;

const DEFAULT_FOLDERS = [
  { id: 'f1', name: '结构' },
  { id: 'f2', name: '施工' },
  { id: 'f3', name: '造价' },
  { id: 'f4', name: '材料' }
];

const DEFAULT_PROMPTS = [
  { id: 'p1', folderId: 'f1', title: '结构计算书生成',
    content: '请根据{项目名称}的结构设计参数，依据{计算规范}对{结构类型}进行结构计算分析，包括荷载组合、内力计算、配筋验算等内容，输出完整的结构计算书。' },
  { id: 'p2', folderId: 'f1', title: '结构设计说明',
    content: '工程名称：{项目名称}\n设计依据：{设计依据}\n结构类型：{结构类型}\n抗震设防烈度：{抗震等级}\n设计使用年限：50年\n主要荷载取值：{荷载取值}\n材料选用：{材料规格}\n其他说明：{补充说明}' },
  { id: 'p3', folderId: 'f1', title: '基础设计方案',
    content: '针对{项目名称}工程，根据地勘报告持力层为{持力层}，拟采用{基础类型}基础方案。基础埋深{基础埋深}，承载力特征值{fak值}kPa。需进行基础尺寸验算、沉降计算及抗浮验算。' },
  { id: 'p4', folderId: 'f1', title: '结构复核计算',
    content: '对{项目名称}的{复核部位}进行结构复核计算。原设计参数：{原设计参数}。实际荷载工况：{荷载工况}。复核内容包括承载能力极限状态和正常使用极限状态验算。' },

  { id: 'p5', folderId: 'f2', title: '施工组织设计方案',
    content: '项目名称：{项目名称}\n施工单位：{施工单位}\n编制依据：{编制依据}\n工程概况：{工程概况}\n施工总体部署：{施工部署}\n主要施工方案：{施工方案}\n进度计划：工期{工期要求}\n资源配置：{资源配置}\n质量安全保证措施：{保证措施}' },
  { id: 'p6', folderId: 'f2', title: '专项施工方案',
    content: '针对{项目名称}的{施工部位}编制{方案类型}专项施工方案。主要施工工艺：{施工工艺}。安全技术措施：{安全措施}。应急预案：{应急预案}。需经专家论证后方可实施。' },
  { id: 'p7', folderId: 'f2', title: '安全技术交底',
    content: '工程名称：{项目名称}\n交底内容：{作业内容}\n危险源辨识：{危险源}\n安全防护措施：{防护措施}\n应急处置流程：{应急流程}\n交底人：{交底人}\n接受人：{接受人}\n交底日期：{交底日期}' },
  { id: 'p8', folderId: 'f2', title: '施工进度计划',
    content: '项目名称：{项目名称}\n计划工期：{计划周期}\n关键节点：{关键节点}\n里程碑目标：{里程碑目标}\n资源配置计划：{资源计划}\n进度保证措施：{进度措施}' },

  { id: 'p9', folderId: 'f3', title: '工程量清单编制',
    content: '项目名称：{项目名称}\n编制依据：{计价依据}\n分部分项工程量：\n{工程量}\n计量单位：{计量单位}\n综合单价：{综合单价}\n合价：{合价}\n措施项目费：{措施费}\n其它项目费：{其它费用}\n税金：{税金}' },
  { id: 'p10', folderId: 'f3', title: '工程预算编制',
    content: '工程名称：{项目名称}\n预算类型：{预算类型}\n编制依据：{编制依据}\n建筑面积：{建筑面积}\n单方造价：{单方造价}\n建安工程费：{建安费}\n设备购置费：{设备费}\n工程建设其他费：{其他费}\n预备费：{预备费}' },
  { id: 'p11', folderId: 'f3', title: '结算审核报告',
    content: '项目名称：{项目名称}\n结算类型：{结算类型}\n送审金额：{送审金额}元\n审定金额：{审定金额}元\n核减金额：{核减金额}元\n核减率：{核减率}\n审核依据：{审核依据}\n审核意见：{审核意见}' },
  { id: 'p12', folderId: 'f3', title: '成本分析报告',
    content: '项目名称：{项目名称}\n分析周期：{分析周期}\n预算成本：{预算成本}\n实际成本：{实际成本}\n偏差分析：\n - {偏差项1}\n - {偏差项2}\n成本控制建议：{改进建议}' },

  { id: 'p13', folderId: 'f4', title: '材料采购计划',
    content: '项目名称：{项目名称}\n材料类别：{材料类别}\n序号\t材料名称\t规格型号\t单位\t数量\t进场时间\n{材料清单}\n采购周期：{采购周期}\n供应商要求：{供应商要求}\n质量验收标准：{验收标准}' },
  { id: 'p14', folderId: 'f4', title: '材料检验报告',
    content: '工程名称：{项目名称}\n材料名称：{材料名称}\n规格型号：{规格型号}\n生产厂家：{生产厂家}\n批号：{批号}\n进场数量：{进场数量}\n检验标准：{检验标准}\n检验项目：{检验项目}\n检验结果：{检验结果}\n结论：{检验结论}\n检验员：{检验员}\n日期：{检验日期}' },
  { id: 'p15', folderId: 'f4', title: '材料比选方案',
    content: '项目名称：{项目名称}\n比选内容：{材料类型}\n候选方案：{候选方案}\n比选依据：{比选依据}\n技术经济对比：{技术经济对比}\n推荐方案：{推荐方案}\n推荐理由：{推荐理由}' },
  { id: 'p16', folderId: 'f4', title: '材料领用台账',
    content: '项目名称：{项目名称}\n领用部门：{领用部门}\n序号\t材料名称\t规格\t单位\t数量\t领用人\t日期\n{领用记录}\n备注：{备注}' }
];

// ========== 数据持久化 ==========
async function loadData() {
  const res = await chrome.storage.local.get(STORAGE_KEY);
  if (res[STORAGE_KEY]) {
    data = res[STORAGE_KEY];
  } else {
    data = { folders: DEFAULT_FOLDERS, prompts: DEFAULT_PROMPTS, nextId: 100 };
    await saveData();
  }
}
async function saveData() {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

function genId() { return String(data.nextId++); }

// ========== 渲染 ==========
function renderFolders() {
  const el = document.getElementById('folderList');
  const allHtml = `<div class="folder-item ${!currentFolderId ? 'active' : ''}" data-id="__all">全部</div>`;
  const items = data.folders.map(f =>
    `<div class="folder-item ${currentFolderId === f.id ? 'active' : ''}" data-id="${f.id}" draggable="true">
      ${esc(f.name)}
      <span class="folder-actions">
        <button data-action="rename-folder" data-id="${f.id}">✎</button>
        <button data-action="delete-folder" data-id="${f.id}">✕</button>
      </span>
    </div>`
  ).join('');
  el.innerHTML = allHtml + items;

  el.querySelectorAll('.folder-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.closest('.folder-actions')) return;
      currentFolderId = el.dataset.id === '__all' ? null : el.dataset.id;
      renderFolders();
      renderPrompts();
    });
    el.addEventListener('dragstart', e => {
      dragItem = { type: 'folder', id: el.dataset.id };
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragover', e => e.preventDefault());
    el.addEventListener('drop', e => {
      e.preventDefault();
      if (dragItem && dragItem.type === 'folder' && dragItem.id !== el.dataset.id) {
        const list = data.folders;
        const from = list.findIndex(f => f.id === dragItem.id);
        const to = list.findIndex(f => f.id === el.dataset.id);
        if (from > -1 && to > -1) {
          const [item] = list.splice(from, 1);
          list.splice(to, 0, item);
          saveData().then(renderFolders);
        }
      }
      dragItem = null;
    });
  });
}

function renderPrompts() {
  const el = document.getElementById('promptList');
  let list = data.prompts;
  if (currentFolderId) list = list.filter(p => p.folderId === currentFolderId);

  const folderTitle = currentFolderId
    ? (data.folders.find(f => f.id === currentFolderId)?.name || '未知')
    : '所有提示词';
  document.getElementById('currentFolderTitle').textContent = folderTitle;

  if (list.length === 0) {
    el.innerHTML = '<div class="empty-state">该分类下暂无提示词</div>';
    return;
  }

  el.innerHTML = list.map(p => {
    const vars = extractVars(p.content);
    const badge = vars.length > 0 ? `<span style="font-size:10px;color:#1a73e8;margin-left:4px">~{${vars.length}}` : '';
    return `<div class="prompt-item" data-id="${p.id}" draggable="true">
      <div class="prompt-title">${esc(p.title)}${badge}</div>
      <div class="prompt-preview">${esc(p.content.substring(0, 60))}</div>
      <div class="prompt-meta">
        <button data-action="copy" data-id="${p.id}">复制</button>
        <button data-action="edit-prompt" data-id="${p.id}">编辑</button>
        <button data-action="ai" data-id="${p.id}">AI</button>
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('[data-action="copy"]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation();
      const p = data.prompts.find(x => x.id === btn.dataset.id);
      if (p) handleCopy(p);
    });
  });
  el.querySelectorAll('[data-action="edit-prompt"]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation();
      openEditModal(data.prompts.find(x => x.id === btn.dataset.id));
    });
  });
  el.querySelectorAll('[data-action="ai"]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation();
      const p = data.prompts.find(x => x.id === btn.dataset.id);
      if (p) openAiModal(p.content);
    });
  });

  el.querySelectorAll('.prompt-item').forEach(el => {
    el.addEventListener('dragstart', e => {
      dragItem = { type: 'prompt', id: el.dataset.id };
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragover', e => e.preventDefault());
    el.addEventListener('drop', e => {
      e.preventDefault();
      if (dragItem && dragItem.type === 'prompt' && dragItem.id !== el.dataset.id) {
        const list = data.prompts;
        const from = list.findIndex(p => p.id === dragItem.id);
        const to = list.findIndex(p => p.id === el.dataset.id);
        if (from > -1 && to > -1) {
          const [item] = list.splice(from, 1);
          list.splice(to, 0, item);
          saveData().then(renderPrompts);
        }
      }
      dragItem = null;
    });
  });
}

function updateUI() {
  renderFolders();
  renderPrompts();
  document.getElementById('emptyState').classList.toggle('hidden',
    data.folders.length > 0 || data.prompts.length > 0);
}

// ========== 工具函数 ==========
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
function extractVars(text) {
  const m = text.match(/\{[^}]+\}/g);
  return m ? [...new Set(m)] : [];
}
function showToast(msg) {
  const t = document.getElementById('copyToast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 1500);
}
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板'))
  .catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('已复制到剪贴板');
  });
}

// ========== 复制与变量替换 ==========
function handleCopy(p) {
  const vars = extractVars(p.content);
  if (vars.length > 0) openVarModal(p);
  else copyText(p.content);
}

function openVarModal(prompt) {
  const modal = document.getElementById('varModal');
  const container = document.getElementById('varFields');
  const overlay = document.getElementById('overlay');

  container.querySelectorAll('.var-field').forEach(el => el.remove());

  const vars = extractVars(prompt.content);
  const inputs = [];
  vars.forEach(v => {
    const name = v.slice(1, -1);
    const div = document.createElement('div');
    div.className = 'var-field';
    div.innerHTML = `<label>${esc(name)}</label><input type="text" class="var-input" data-var="${esc(v)}" placeholder="请输入${esc(name)}">`;
    container.appendChild(div);
    inputs.push(div.querySelector('input'));
  });

  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');

  document.getElementById('btnVarCopy').onclick = () => {
    let text = prompt.content;
    inputs.forEach(inp => { text = text.replaceAll(inp.dataset.var, inp.value || inp.dataset.var); });
    copyText(text);
    closeVarModal();
  };
  document.getElementById('btnVarCopyRaw').onclick = () => {
    copyText(prompt.content);
    closeVarModal();
  };
  document.getElementById('btnCloseVar').onclick = closeVarModal;
  overlay.onclick = closeVarModal;
}

function closeVarModal() {
  document.getElementById('varModal').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
}

// Focus first input in var modal
document.addEventListener('click', e => {
  if (e.target.closest('#varModal:not(.hidden)')) {
    setTimeout(() => {
      const first = document.querySelector('#varModal .var-input');
      if (first) first.focus();
    }, 100);
  }
});

// ========== 编辑弹窗 ==========
function openEditModal(item) {
  const modal = document.getElementById('editModal');
  const overlay = document.getElementById('overlay');
  const isNew = !item;
  document.getElementById('modalTitle').textContent = isNew ? '新建提示词' : '编辑提示词';

  const sel = document.getElementById('editFolder');
  sel.innerHTML = '<option value="">无分类</option>' + data.folders.map(f =>
    `<option value="${f.id}">${esc(f.name)}</option>`
  ).join('');

  if (item) {
    document.getElementById('editName').value = item.title;
    document.getElementById('editContent').value = item.content;
    sel.value = item.folderId || '';
    document.getElementById('btnDeleteItem').classList.remove('hidden');
    document.getElementById('btnDeleteItem').onclick = () => {
      if (confirm('确认删除此提示词？')) {
        data.prompts = data.prompts.filter(p => p.id !== item.id);
        saveData().then(() => { updateUI(); closeEditModal(); });
      }
    };
  } else {
    document.getElementById('editName').value = '';
    document.getElementById('editContent').value = '';
    sel.value = currentFolderId || '';
    document.getElementById('btnDeleteItem').classList.add('hidden');
  }
  editingItem = item;

  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
  document.getElementById('btnCloseModal').onclick = closeEditModal;
  document.getElementById('btnSaveEdit').onclick = saveEdit;
  overlay.onclick = closeEditModal;
}

function closeEditModal() {
  document.getElementById('editModal').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
  editingItem = null;
}

function saveEdit() {
  const name = document.getElementById('editName').value.trim();
  const content = document.getElementById('editContent').value.trim();
  const folderId = document.getElementById('editFolder').value || null;
  if (!name || !content) { showToast('请填写名称和内容'); return; }

  if (editingItem) {
    Object.assign(editingItem, { title: name, content, folderId, updatedAt: Date.now() });
  } else {
    data.prompts.push({
      id: genId(), title: name, content, folderId,
      createdAt: Date.now(), updatedAt: Date.now()
    });
  }
  saveData().then(() => { updateUI(); closeEditModal(); });
}

// ========== 文件夹管理 ==========
function newFolder() {
  const name = prompt('请输入分类名称：');
  if (!name || !name.trim()) return;
  data.folders.push({ id: genId(), name: name.trim() });
  saveData().then(updateUI);
}

function renameFolder(id) {
  const f = data.folders.find(x => x.id === id);
  if (!f) return;
  const name = prompt('重命名分类：', f.name);
  if (name && name.trim()) { f.name = name.trim(); saveData().then(updateUI); }
}

function deleteFolder(id) {
  if (!confirm('确认删除此分类？提示词不会随分类删除。')) return;
  data.folders = data.folders.filter(f => f.id !== id);
  if (currentFolderId === id) currentFolderId = null;
  saveData().then(updateUI);
}

// ========== AI 功能 ==========
function openAiModal(initialText) {
  document.getElementById('aiInput').value = initialText || '';
  document.getElementById('aiOutput').value = '';
  document.getElementById('aiStatus').textContent = '';
  document.getElementById('aiModal').classList.remove('hidden');
  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById('btnCloseAi').onclick = closeAiModal;
  document.getElementById('overlay').onclick = closeAiModal;
  document.getElementById('btnAiRun').onclick = runAi;
  document.getElementById('btnAiCopy').onclick = () => {
    const out = document.getElementById('aiOutput').value;
    if (out) copyText(out);
  };
}

function closeAiModal() {
  document.getElementById('aiModal').classList.add('hidden');
  document.getElementById('overlay').classList.add('hidden');
}

async function runAi() {
  const action = document.getElementById('aiAction').value;
  const input = document.getElementById('aiInput').value.trim();
  if (!input) { showToast('请输入内容'); return; }

  const s = await chrome.storage.local.get('apiSettings');
  const { apiKey, apiUrl, model } = s.apiSettings || {};
  if (!apiKey) { showToast('请先在设置中配置 API Key'); return; }

  const btn = document.getElementById('btnAiRun');
  btn.disabled = true;
  document.getElementById('aiStatus').textContent = '处理中...';

  const instructions = {
    polish: '润色以下工程行业提示词，使其更通顺、专业，保持原意：\n\n',
    expand: '扩写以下工程行业提示词，补充更多专业细节：\n\n',
    simplify: '精简以下文本，保留核心工程信息：\n\n',
    generate: ''
  };
  const systemMsg = action === 'generate'
    ? '你是一个工程行业提示词专家。根据用户描述生成专业完整的提示词，直接输出内容不要解释。'
    : '你是一个工程行业提示词优化助手。直接输出处理结果，不要额外解释。';
  const userMsg = action === 'generate' ? input : instructions[action] + input;

  try {
    const resp = await fetch(apiUrl || 'https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: userMsg }
        ]
      })
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${errText.slice(0,100)}`);
    }
    const json = await resp.json();
    const result = json.choices?.[0]?.message?.content || '';
    document.getElementById('aiOutput').value = result.trim();
    document.getElementById('aiStatus').textContent = '完成';
  } catch (e) {
    document.getElementById('aiStatus').textContent = '错误: ' + e.message;
  }
  btn.disabled = false;
}

// ========== 设置 ==========
async function openSettings() {
  const panel = document.getElementById('settingsPanel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) {
    const s = await chrome.storage.local.get('apiSettings');
    const cfg = s.apiSettings || {};
    document.getElementById('apiKeyInput').value = cfg.apiKey || '';
    document.getElementById('apiUrlInput').value = cfg.apiUrl || 'https://api.deepseek.com/v1/chat/completions';
    document.getElementById('modelInput').value = cfg.model || 'deepseek-chat';
  }
}

async function saveSettings() {
  await chrome.storage.local.set({
    apiSettings: {
      apiKey: document.getElementById('apiKeyInput').value.trim(),
      apiUrl: document.getElementById('apiUrlInput').value.trim(),
      model: document.getElementById('modelInput').value.trim()
    }
  });
  document.getElementById('settingsStatus').textContent = '已保存';
  setTimeout(() => { document.getElementById('settingsStatus').textContent = ''; }, 2000);
}

// ========== 事件绑定 ==========
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  updateUI();

  document.getElementById('btnAddFolder').addEventListener('click', newFolder);
  document.getElementById('btnAddPrompt').addEventListener('click', () => openEditModal(null));

  document.getElementById('folderList').addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'rename-folder') renameFolder(btn.dataset.id);
    if (btn.dataset.action === 'delete-folder') deleteFolder(btn.dataset.id);
  });

  document.getElementById('btnSettings').addEventListener('click', openSettings);
  document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);
  document.getElementById('btnCloseSettings').addEventListener('click', () => {
    document.getElementById('settingsPanel').classList.add('hidden');
  });
});