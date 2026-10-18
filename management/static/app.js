'use strict';
const $ = (selector) => document.querySelector(selector);
let csrf = '', state = {}, decision = null;
const retries = new Map();
const actorLabel = value => state.identities?.find(i => i.actor === value)?.name || value || '—';
const statusLabel = value => ({draft:'Rascunho',ready:'Pronto para publicação futura',archived:'Arquivado',pending:'Pendente',executed:'Executado',rejected:'Rejeitado'}[value] || value);
const money = (cents) => (cents / 100).toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
const notice = (text) => { $('#notice').textContent = text; };
async function api(path, body, extra = {}) {
  const response = await fetch(`/api/${path}`, {method: body === undefined ? 'GET' : 'POST',
    headers: {'Content-Type':'application/json', 'X-CSRF-Token':csrf, ...extra},
    ...(body === undefined ? {} : {body:JSON.stringify(body)})});
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && path !== 'login') signedIn(false);
    throw new Error(result.error || 'Falha na operação');
  }
  return result;
}
function signedIn(value) {
  $('#login-panel').hidden = value; $('#workspace').hidden = !value; $('#logout').hidden = !value;
  if (!value) {
    csrf = ''; state = {};
    for (const id of ['filament-list','product-list','operation-list','movement-list','audit-list','calc-result','calc-materials','product-materials']) $('#'+id).replaceChildren();
    for (const form of document.querySelectorAll('#workspace form')) form.reset();
  }
}
function element(tag, text) { const node = document.createElement(tag); node.textContent = text; return node; }
function card(container, title, details) {
  const article = document.createElement('article'); article.append(element('h3', title), element('p', details));
  container.append(article); return article;
}
function action(parent, label, callback) {
  const button = element('button', label); button.type = 'button';
  button.addEventListener('click', async () => { button.disabled = true; try { await callback(); } catch(e) { notice(e.message); } finally { button.disabled = false; } });
  parent.append(button);
}
function choose(select, items, placeholder) {
  const value = select.value; select.replaceChildren();
  if (placeholder) { const option = element('option', placeholder); option.value = ''; select.append(option); }
  for (const item of items) { const option = element('option', item.name); option.value = item.id; select.append(option); }
  if ([...select.options].some(o => o.value === value)) select.value = value;
}
function materialInputs(container, values = []) {
  container.replaceChildren();
  for (const item of state.filaments) {
    const label = element('label', `${item.name} · ${item.color} (g)`);
    const input = document.createElement('input'); input.type = 'number'; input.min = '0'; input.step = '1';
    input.dataset.filament = item.id; input.value = values.find(v => v.filament_id === item.id)?.grams || '';
    label.append(input); container.append(label);
  }
}
const materials = (container) => [...container.querySelectorAll('input')].filter(i => Number(i.value) > 0).map(i => ({filament_id:i.dataset.filament, grams:Number(i.value)}));
async function propose(kind, payload) {
  const body = {kind,payload}, serialized = JSON.stringify(body);
  if (!retries.has(serialized)) retries.set(serialized, crypto.randomUUID());
  const result = await api('operations', body, {'Idempotency-Key': retries.get(serialized)});
  retries.delete(serialized);
  notice(`Solicitação ${result.id} registrada. Nenhuma alteração aplicada até a aprovação.`);
  await refresh();
}
async function all(resource) {
  let offset = 0, items = [];
  do { const page = await api(`${resource}?offset=${offset}`); items.push(...page.items); offset = page.next_offset; } while(offset !== null);
  return items;
}
async function refresh() {
  const names = ['filaments','products','operations','movements','audit','identities'];
  const values = await Promise.all(names.map(all)); state = Object.fromEntries(names.map((n,i) => [n,values[i]]));
  render();
}
function render() {
  $('#filament-list').replaceChildren();
  for(const f of state.filaments) card($('#filament-list'), `${f.name} · ${f.material} · ${f.color}`, `${f.quantity_g} g disponíveis · rolo ${f.spool_weight_g} g · ${money(f.price_cents)} · versão ${f.version}`);
  if(!state.filaments.length) $('#filament-list').append(element('p','Nenhum filamento cadastrado.'));
  choose($('#filament-edit'), state.filaments, 'Novo filamento'); choose($('#stock-filament'), state.filaments);
  materialInputs($('#calc-materials')); materialInputs($('#product-materials'));
  choose($('#product-edit'), state.products, 'Novo produto');
  $('#product-list').replaceChildren();
  for(const p of state.products) {
    const c = card($('#product-list'), p.name, `${p.description} · ${statusLabel(p.status)} · custo ${money(p.cost_cents)} · venda ${money(p.sale_cents)}`);
    c.append(element('p', `Imagens: ${JSON.parse(p.images).join(', ') || 'nenhuma'}`));
    c.append(element('p', `Materiais: ${JSON.parse(p.materials).map(m => `${state.filaments.find(f => f.id === m.filament_id)?.name || m.filament_id}: ${m.grams} g`).join(', ') || 'nenhum'}`));
    if(p.status !== 'archived') {
      action(c, 'Solicitar aprovação de catálogo', () => propose('catalog.prepare',{id:p.id,expected_version:p.version}));
      action(c, 'Solicitar arquivamento', () => propose('product.archive',{id:p.id,expected_version:p.version}));
    }
  }
  $('#operation-list').replaceChildren();
  for(const op of state.operations) {
    const c = card($('#operation-list'), `${op.kind} · ${statusLabel(op.status)}`, `${op.id} · solicitante ${actorLabel(op.requester)} · ${op.created_at}`);
    c.append(element('pre', JSON.stringify(JSON.parse(op.payload),null,2)));
    if(op.status === 'pending') {
      action(c,'Revisar e aprovar',() => openDecision(op,'approve'));
      action(c,'Revisar e rejeitar',() => openDecision(op,'reject'));
    }
  }
  $('#movement-list').replaceChildren();
  for(const m of state.movements) card($('#movement-list'), `${m.delta_g > 0 ? '+' : ''}${m.delta_g} g · saldo ${m.balance_g} g`, `${m.filament_id} · ${m.reason} · ${m.created_at} · operação ${m.operation_id}`);
  $('#audit-list').replaceChildren();
  for(const a of state.audit) {
    const c = card($('#audit-list'),`${a.event} · ${a.created_at}`,`Solicitante: ${actorLabel(a.requester)} | Aprovador: ${actorLabel(a.approver)} | Executor: ${a.executor || '—'}`);
    const details = document.createElement('details'); details.append(element('summary','Ver alterações'),element('pre',JSON.stringify(JSON.parse(a.changes),null,2))); c.append(details);
  }
}
function openDecision(op, verb) {
  decision = {op,verb}; const payload = JSON.parse(op.payload);
  const existing = [...state.filaments,...state.products].find(x => x.id === payload.id) || null;
  $('#confirm-title').textContent = verb === 'approve' ? 'Aprovar e executar' : 'Rejeitar solicitação';
  $('#confirm-details').textContent = JSON.stringify({operation:op.id,kind:op.kind,requester:actorLabel(op.requester),current:existing,requested:payload,digest:op.digest},null,2);
  $('#confirm').reset(); $('#confirm-error').textContent = ''; $('#confirm-dialog').showModal();
}
function bind(formId, handler) {
  $(formId).addEventListener('submit',async e => {
    e.preventDefault(); const form = e.currentTarget, button = form.querySelector('button'); button.disabled = true;
    try { await handler(Object.fromEntries(new FormData(form)),form); }
    catch(error) { notice(error.message); if(formId === '#confirm') $('#confirm-error').textContent = error.message; }
    finally { button.disabled = false; }
  });
}
const cents = value => Math.round(Number(value)*100);
bind('#login',async (d,f) => { const result = await api('login',d); csrf = result.csrf; f.reset(); signedIn(true); await refresh(); notice(`Acesso de ${result.name}.`); });
bind('#filament',async d => {
  const payload = {name:d.name,material:d.material,color:d.color,spool_weight_g:Number(d.spool_weight_g),price_cents:cents(d.price)};
  if(d.id) Object.assign(payload,{id:d.id,expected_version:state.filaments.find(f => f.id === d.id).version});
  await propose(d.id ? 'filament.update' : 'filament.create',payload);
});
bind('#stock',async d => { const f = state.filaments.find(f => f.id === d.id); if(!f) throw new Error('Cadastre e aprove um filamento primeiro.'); await propose(d.kind,{id:d.id,expected_version:f.version,grams:Number(d.grams),reason:d.reason}); });
bind('#product',async d => {
  const payload = {name:d.name,description:d.description,images:d.images.split('\n').map(s => s.trim()).filter(Boolean),materials:materials($('#product-materials')),cost_cents:cents(d.cost),sale_cents:cents(d.sale)};
  if(d.id) Object.assign(payload,{id:d.id,expected_version:state.products.find(p => p.id === d.id).version});
  await propose('product.save',payload);
});
bind('#calculator',async d => {
  const result = await api('calculate',{materials:materials($('#calc-materials')),hours:d.hours,power_w:Number(d.power_w),energy_cents_kwh:cents(d.energy),maintenance_cents_hour:cents(d.maintenance),packaging_cents:cents(d.packaging),sale_cents:cents(d.sale),labor_hours:d.labor_hours,labor_cents_hour:cents(d.labor),tax_bps:cents(d.tax),sales_fee_bps:cents(d.fee),fixed_fee_cents:cents(d.fixed_fee),loss_bps:cents(d.loss),target_margin_bps:cents(d.target_margin),basis:d.basis,...(d.basis_note ? {basis_note:d.basis_note} : {})});
  const box = $('#calc-result'); box.replaceChildren();
  for(const [key,label] of Object.entries({filament_cents:'Filamento',loss_cents:'Perdas de material',labor_cents:'Mão de obra',tax_cents:'Impostos',sales_fee_cents:'Taxa percentual de venda',fixed_fee_cents:'Taxa fixa de venda',suggested_sale_cents:'Venda sugerida para a margem desejada',energy_cents:'Energia',maintenance_cents:'Manutenção',packaging_cents:'Embalagem',total_cents:'Custo total',sale_cents:'Venda',profit_cents:'Lucro'})) box.append(element('p',`${label}: ${money(result[key])}`));
  box.append(element('p', result.basis === 'estimate' ? 'Base: estimativa.' : 'Base: valores medidos informados, não contabilizados.'));
  box.append(element('p',result.cost_notice));
  box.append(element('p',`Margem: ${result.margin_percent === null ? 'indefinida (venda zero)' : result.margin_percent+'%'}`));
});
bind('#confirm',async d => {
  const {op,verb} = decision;
  await api(`operations/${op.id}/${verb}`,{digest:op.digest,confirmation:`${verb}:${op.id}`,password:d.password});
  $('#confirm').reset(); $('#confirm-dialog').close(); decision = null; await refresh(); notice('Decisão registrada e auditada.');
});
$('#cancel-confirm').onclick = () => { $('#confirm').reset(); $('#confirm-dialog').close(); decision = null; };
$('#confirm-dialog').addEventListener('close', () => $('#confirm').reset());
$('#logout').onclick = async () => { try { await api('logout',{}); signedIn(false); notice('Sessão encerrada.'); } catch(e) { notice(e.message); } };
$('#refresh').onclick = () => refresh().catch(e => notice(e.message));
$('#filament-edit').onchange = e => {
  const f = state.filaments.find(f => f.id === e.target.value), form = $('#filament');
  for(const key of ['name','material','color','spool_weight_g']) form.elements[key].value = f?.[key] || '';
  form.elements.price.value = f ? (f.price_cents / 100).toFixed(2) : '';
};
$('#product-edit').onchange = e => {
  const p = state.products.find(p => p.id === e.target.value), form = $('#product');
  form.elements.name.value = p?.name || ''; form.elements.description.value = p?.description || '';
  form.elements.images.value = p ? JSON.parse(p.images).join('\n') : '';
  form.elements.cost.value = p ? (p.cost_cents/100).toFixed(2) : ''; form.elements.sale.value = p ? (p.sale_cents/100).toFixed(2) : '';
  materialInputs($('#product-materials'),p ? JSON.parse(p.materials) : []);
};
for(const button of document.querySelectorAll('[data-tab]')) button.onclick = () => {
  for(const panel of document.querySelectorAll('[data-panel]')) panel.hidden = panel.dataset.panel !== button.dataset.tab;
  for(const nav of document.querySelectorAll('[data-tab]')) nav.setAttribute('aria-current',String(nav === button));
};
api('me').then(async me => { csrf = me.csrf; signedIn(true); await refresh(); }).catch(() => signedIn(false));
