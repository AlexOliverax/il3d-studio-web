"""Review-only physical inventory intake; never changes available stock or approvals."""
import json
from management.app import audit, canonical, digest, integer, now, require, string, transaction

FIELDS = {'inventory_id','category','material','color','brand','diameter_mm','nominal_weight_g',
          'gross_weight_g','tare_weight_g','net_weight_g','net_status','observation',
          'acquisition_cost_cents','replacement_value_cents','quantity_units'}


def validate_item(item):
    require(isinstance(item, dict) and set(item) == FIELDS, 'Campos de inventário inválidos')
    for field in ['inventory_id','category','material','color']:
        string(item[field])
    require(item['brand'] is None or isinstance(item['brand'], str), 'Marca inválida')
    require(isinstance(item['observation'], str), 'Observação inválida')
    for field in ['nominal_weight_g','gross_weight_g','tare_weight_g','net_weight_g',
                  'acquisition_cost_cents','replacement_value_cents']:
        if item[field] is not None:
            integer(item[field])
    integer(item['quantity_units'], 1, 100000)
    d = item['diameter_mm']
    require(d is None or (type(d) in (int, float) and 0 < d < 10), 'Diâmetro inválido')
    require(item['net_status'] in ('pending_tare','pending_package_tare','measured'), 'Estado líquido inválido')
    if item['net_status'] != 'measured':
        require(item['net_weight_g'] is None, 'Peso líquido pendente deve ser nulo')
        require(item['gross_weight_g'] is not None, 'Peso bruto obrigatório')
    else:
        require(item['net_weight_g'] is not None, 'Peso líquido medido obrigatório')
        if item['gross_weight_g'] is not None and item['tare_weight_g'] is not None:
            require(item['net_weight_g'] == item['gross_weight_g'] - item['tare_weight_g'], 'Pesos inconsistentes')


def register_batch(db, items, source_task, authorized_by):
    """Local operator only; immutable, idempotent IDs. No web mutation endpoint."""
    string(source_task); string(authorized_by)
    require(isinstance(items, list) and 0 < len(items) <= 1000, 'Lote inválido')
    for item in items:
        validate_item(item)
    require(len({i['inventory_id'] for i in items}) == len(items), 'IDs duplicados no lote')
    created, existing = [], []
    with transaction(db):
        db.execute('''CREATE TABLE IF NOT EXISTS physical_inventory (
            inventory_id TEXT PRIMARY KEY, source_task TEXT NOT NULL,
            payload TEXT NOT NULL, fingerprint TEXT NOT NULL,
            review_status TEXT NOT NULL CHECK(review_status='pending_review'),
            created_at TEXT NOT NULL)''')
        for item in items:
            identity = item['inventory_id']; body = canonical(item); fp = digest(body)
            old = db.execute('SELECT fingerprint FROM physical_inventory WHERE inventory_id=?', (identity,)).fetchone()
            if old:
                require(old['fingerprint'] == fp, 'ID existente com conteúdo diferente: ' + identity, 409)
                existing.append(identity)
                continue
            db.execute('INSERT INTO physical_inventory VALUES(?,?,?,?,?,?)',
                       (identity, source_task, body, fp, 'pending_review', now()))
            audit(db, None, 'physical_inventory.registered', 'source:' + source_task,
                  {'inventory_id':identity,'after':item,'review_status':'pending_review','authorization':authorized_by},
                  executor='physical-inventory-intake:v1')
            created.append(identity)
    return {'created_ids':created,'existing_ids':existing,'review_status':'pending_review'}


def listing(db):
    if not db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='physical_inventory'").fetchone():
        return []
    confirmations = {}
    if db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='physical_inventory_confirmations'").fetchone():
        confirmations = {row['inventory_id']: dict(row) for row in db.execute('SELECT * FROM physical_inventory_confirmations')}
    return [{**json.loads(row['payload']), **availability(row, confirmations), 'source_task':row['source_task'],
             'created_at':row['created_at']}
            for row in db.execute('SELECT * FROM physical_inventory ORDER BY inventory_id')]


def availability(row, confirmations):
    data = json.loads(row['payload'])
    confirmed = row['inventory_id'] in confirmations
    return {'review_status': 'confirmed' if confirmed else row['review_status'],
            'stock_status': 'available_physical' if confirmed else 'pending_review',
            'available_units': data['quantity_units'] if confirmed else None,
            'available_net_weight_g': data['net_weight_g'] if confirmed else None,
            'weight_pending': data['net_weight_g'] is None,
            'confirmation': confirmations.get(row['inventory_id'])}


def confirm_physical_stock(db, ids, authorization):
    """Explicit owner confirmation only; preserves unknown weights and other operations."""
    string(authorization)
    require(isinstance(ids, list) and len(ids) > 0 and len(ids) == len(set(ids)), 'IDs inválidos')
    changed = []
    with transaction(db):
        db.execute("""CREATE TABLE IF NOT EXISTS physical_inventory_confirmations (
            inventory_id TEXT PRIMARY KEY REFERENCES physical_inventory(inventory_id),
            authorized_by TEXT NOT NULL, confirmed_at TEXT NOT NULL)""")
        for identity in ids:
            row = db.execute('SELECT * FROM physical_inventory WHERE inventory_id=?', (identity,)).fetchone()
            require(row is not None, 'Inventário não encontrado', 404)
            if db.execute('SELECT 1 FROM physical_inventory_confirmations WHERE inventory_id=?',(identity,)).fetchone():
                continue
            db.execute('INSERT INTO physical_inventory_confirmations VALUES(?,?,?)',(identity,authorization,now()))
            data = json.loads(row['payload'])
            audit(db, None, 'physical_inventory.confirmed_available', authorization,
                  {'inventory_id':identity,'available_units':data['quantity_units'],
                   'available_net_weight_g':data['net_weight_g'],'before':'pending_review','after':'available_physical'},
                  approver=authorization, executor='physical-inventory-confirmation:v1')
            changed.append(identity)
    return changed
