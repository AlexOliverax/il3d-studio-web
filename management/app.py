import hashlib
import json
import os
import secrets
import sqlite3
import time
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP, ROUND_CEILING
from pathlib import Path
from urllib.parse import urlparse

from flask import Flask, g, jsonify, render_template, request
from management.mfa import load_secrets, matching_step
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash, generate_password_hash

KINDS = {'filament.create', 'filament.update', 'stock.receive', 'stock.consume',
         'stock.adjust', 'product.save', 'product.archive', 'catalog.prepare'}


AGENT_SCOPES = {'inventory:read', 'products:read', 'operations:read',
                'pricing:calculate', 'operations:request'}


def agent_scope(method, path):
    if method == 'GET':
        return {'/api/me': 'identity:self', '/api/filaments': 'inventory:read',
                '/api/products': 'products:read', '/api/operations': 'operations:read'}.get(path)
    if method == 'POST':
        return {'/api/calculate': 'pricing:calculate', '/api/operations': 'operations:request'}.get(path)
    return None


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(',', ':'), ensure_ascii=False)


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def now():
    return datetime.now(timezone.utc).isoformat()


class Problem(Exception):
    def __init__(self, message, status=400):
        self.message, self.status = message, status


def require(condition, message, status=400):
    if not condition:
        raise Problem(message, status)


def fields(data, required, optional=()):
    require(isinstance(data, dict), 'Objeto JSON obrigatório')
    require(set(required) <= data.keys() and data.keys() <= set(required) | set(optional),
            'Campos ausentes ou desconhecidos')


def string(value, maximum=200):
    require(isinstance(value, str) and 0 < len(value.strip()) <= maximum, 'Texto inválido')
    return value.strip()


def integer(value, minimum=0, maximum=1_000_000_000):
    require(type(value) is int and minimum <= value <= maximum, 'Inteiro fora do intervalo')
    return value


def validate(kind, p):
    require(kind in KINDS, 'Operação não permitida')
    if kind in ('filament.create', 'filament.update'):
        required = ['name', 'material', 'color', 'spool_weight_g', 'price_cents']
        if kind.endswith('update'):
            required += ['id', 'expected_version']
        fields(p, required)
        for key in ('name', 'material', 'color'):
            string(p[key])
        integer(p['spool_weight_g'], 1, 100000)
        integer(p['price_cents'])
    elif kind.startswith('stock.'):
        fields(p, ['id', 'expected_version', 'grams', 'reason'])
        integer(p['grams'], 0 if kind == 'stock.adjust' else 1)
        string(p['reason'], 1000)
    elif kind == 'product.save':
        fields(p, ['name', 'description', 'images', 'materials', 'cost_cents', 'sale_cents'],
               ['id', 'expected_version'])
        require(('id' in p) == ('expected_version' in p), 'Versão e identificador são obrigatórios juntos')
        string(p['name'])
        string(p['description'], 10000)
        integer(p['cost_cents'])
        integer(p['sale_cents'])
        require(isinstance(p['images'], list) and len(p['images']) <= 10, 'Até 10 imagens')
        for url in p['images']:
            string(url, 2000)
            parsed = urlparse(url)
            require(parsed.scheme == 'https' and bool(parsed.hostname) and not parsed.username,
                    'Imagens devem ser URLs HTTPS, sem credenciais')
        require(isinstance(p['materials'], list) and len(p['materials']) <= 100, 'Materiais inválidos')
        ids = set()
        for material in p['materials']:
            fields(material, ['filament_id', 'grams'])
            string(material['filament_id'])
            integer(material['grams'], 1)
            require(material['filament_id'] not in ids, 'Material duplicado')
            ids.add(material['filament_id'])
    else:
        fields(p, ['id', 'expected_version'])
    if 'id' in p:
        string(p['id'])
        integer(p['expected_version'], 1)
    return p


def decimal_hours(value):
    require(type(value) in (str, int, float), 'Horas inválidas')
    try:
        hours = Decimal(str(value))
    except Exception:
        raise Problem('Horas inválidas') from None
    require(hours.is_finite() and 0 <= hours <= 100000, 'Horas inválidas')
    return hours


def calculate(data, db):
    fields(data, ['materials', 'hours', 'power_w', 'energy_cents_kwh',
                  'maintenance_cents_hour', 'packaging_cents', 'sale_cents'],
           ['labor_hours', 'labor_cents_hour', 'tax_bps', 'sales_fee_bps',
            'fixed_fee_cents', 'loss_bps', 'target_margin_bps', 'basis', 'basis_note'])
    basis = data.get('basis', 'estimate')
    require(basis in ('estimate', 'actual_inputs'), 'Base de cálculo inválida')
    if basis == 'actual_inputs':
        string(data.get('basis_note'), 1000)
        require(data.get('loss_bps', 0) == 0,
                'Em custos informados como reais, inclua perdas nos gramas medidos; não aplique perda estimada')
    elif 'basis_note' in data:
        string(data['basis_note'], 1000)
    require(isinstance(data['materials'], list) and len(data['materials']) <= 100, 'Materiais inválidos')
    material_cost = Decimal(0)
    material_ids = set()
    for entry in data['materials']:
        fields(entry, ['filament_id', 'grams'])
        string(entry['filament_id'])
        integer(entry['grams'], 1)
        require(entry['filament_id'] not in material_ids, 'Material duplicado')
        material_ids.add(entry['filament_id'])
        row = db.execute('SELECT * FROM filaments WHERE id=?', (entry['filament_id'],)).fetchone()
        require(row is not None, 'Filamento não encontrado', 404)
        material_cost += Decimal(row['price_cents']) * entry['grams'] / row['spool_weight_g']
    hours = decimal_hours(data['hours'])
    labor_hours = decimal_hours(data.get('labor_hours', '0'))
    for key in ('power_w', 'energy_cents_kwh', 'maintenance_cents_hour', 'packaging_cents', 'sale_cents'):
        integer(data[key])
    for key in ('labor_cents_hour', 'fixed_fee_cents'):
        integer(data.get(key, 0))
    for key in ('tax_bps', 'sales_fee_bps', 'loss_bps', 'target_margin_bps'):
        integer(data.get(key, 0), 0, 10000)
    tax, fee, target = [data.get(k, 0) for k in ('tax_bps', 'sales_fee_bps', 'target_margin_bps')]
    require(tax + fee + target < 10000, 'Impostos + taxas + margem devem somar menos de 100%')
    cents = lambda x: int(x.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
    result = {'filament_cents': cents(material_cost),
              'loss_cents': cents(material_cost * data.get('loss_bps', 0) / 10000),
              'energy_cents': cents(hours * data['power_w'] * data['energy_cents_kwh'] / 1000),
              'maintenance_cents': cents(hours * data['maintenance_cents_hour']),
              'labor_cents': cents(labor_hours * data.get('labor_cents_hour', 0)),
              'packaging_cents': data['packaging_cents'],
              'fixed_fee_cents': data.get('fixed_fee_cents', 0)}
    base = sum(result.values())
    result['base_cents'] = base
    def variable_cost(sale):
        return cents(Decimal(sale) * tax / 10000) + cents(Decimal(sale) * fee / 10000)
    result['tax_cents'] = cents(Decimal(data['sale_cents']) * tax / 10000)
    result['sales_fee_cents'] = cents(Decimal(data['sale_cents']) * fee / 10000)
    result['total_cents'] = base + result['tax_cents'] + result['sales_fee_cents']
    result['sale_cents'] = data['sale_cents']
    result['profit_cents'] = data['sale_cents'] - result['total_cents']
    result['margin_percent'] = (str((Decimal(result['profit_cents']) * 100 / data['sale_cents'])
                                      .quantize(Decimal('.01'), rounding=ROUND_HALF_UP))
                                if data['sale_cents'] else None)
    # Each percentage is rounded separately. Add a rounding buffer to guarantee
    # the requested margin even near a discontinuity, not just algebraically.
    denominator = Decimal(10000 - tax - fee - target)
    suggested = int((Decimal(base) * 10000 / denominator).to_integral_value(rounding=ROUND_CEILING))
    if Decimal(suggested - base - variable_cost(suggested)) * 10000 < Decimal(suggested) * target:
        suggested = int((Decimal(base + 1) * 10000 / denominator).to_integral_value(rounding=ROUND_CEILING))
    require(max(base, result['total_cents'], suggested) <= 1_000_000_000, 'Custo ou preço sugerido excede o limite da simulação')
    result.update(suggested_sale_cents=suggested, target_margin_bps=target,
                  basis=basis, basis_note=data.get('basis_note', ''), persisted=False,
                  cost_notice='Simulação não contabilizada; preço do filamento usa cadastro atual, não custo histórico de lote.')
    return result


def connect(path):
    db = sqlite3.connect(path, timeout=10, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    return db


@contextmanager
def transaction(db):
    db.execute('BEGIN IMMEDIATE')
    try:
        yield
        db.commit()
    except Exception:
        db.rollback()
        raise


def audit(db, operation, event, requester, changes, approver=None, executor=None):
    db.execute('INSERT INTO audit(operation_id,event,requester,approver,executor,created_at,changes) VALUES(?,?,?,?,?,?,?)',
               (operation, event, requester, approver, executor, now(), canonical(changes)))


def apply_operation(db, op):
    p, kind = json.loads(op['payload']), op['kind']
    table = 'products' if kind.startswith(('product.', 'catalog.')) else 'filaments'
    before = None
    entity_id = p.get('id', str(uuid.uuid4()))
    if 'id' in p:
        row = db.execute(f'SELECT * FROM {table} WHERE id=?', (entity_id,)).fetchone()
        require(row is not None, 'Registro não encontrado', 404)
        before = dict(row)
        require(row['version'] == p['expected_version'], 'Registro mudou; crie nova solicitação', 409)
    if kind == 'filament.create':
        db.execute('INSERT INTO filaments(id,name,material,color,spool_weight_g,price_cents) VALUES(?,?,?,?,?,?)',
                   (entity_id, p['name'], p['material'], p['color'], p['spool_weight_g'], p['price_cents']))
    elif kind == 'filament.update':
        db.execute('UPDATE filaments SET name=?,material=?,color=?,spool_weight_g=?,price_cents=?,version=version+1 WHERE id=?',
                   (p['name'], p['material'], p['color'], p['spool_weight_g'], p['price_cents'], entity_id))
    elif kind.startswith('stock.'):
        delta = p['grams'] if kind == 'stock.receive' else -p['grams']
        if kind == 'stock.adjust':
            delta = p['grams'] - before['quantity_g']
        balance = before['quantity_g'] + delta
        require(0 <= balance <= 1_000_000_000, 'Saldo insuficiente ou acima do limite', 409)
        db.execute('UPDATE filaments SET quantity_g=?,version=version+1 WHERE id=?', (balance, entity_id))
        db.execute('INSERT INTO movements(operation_id,filament_id,delta_g,balance_g,reason,created_at) VALUES(?,?,?,?,?,?)',
                   (op['id'], entity_id, delta, balance, p['reason'], now()))
    elif kind == 'product.save':
        for item in p['materials']:
            require(db.execute('SELECT id FROM filaments WHERE id=?', (item['filament_id'],)).fetchone() is not None,
                    'Filamento do produto não encontrado', 404)
        values = (p['name'], p['description'], canonical(p['images']), canonical(p['materials']), p['cost_cents'], p['sale_cents'])
        if before:
            db.execute("UPDATE products SET name=?,description=?,images=?,materials=?,cost_cents=?,sale_cents=?,status='draft',version=version+1 WHERE id=?", (*values, entity_id))
        else:
            db.execute("INSERT INTO products(name,description,images,materials,cost_cents,sale_cents,id,status) VALUES(?,?,?,?,?,?,?,'draft')", (*values, entity_id))
    else:
        require(before['status'] != 'archived', 'Produto arquivado', 409)
        status = 'archived' if kind == 'product.archive' else 'ready'
        db.execute('UPDATE products SET status=?,version=version+1 WHERE id=?', (status, entity_id))
    after = dict(db.execute(f'SELECT * FROM {table} WHERE id=?', (entity_id,)).fetchone())
    return {'before': before, 'after': after}


def create_app(config=None):
    app = Flask(__name__, static_folder=None)
    app.config.update(DATABASE=os.environ.get('GESTAO_DATABASE', 'management/instance/gestao.sqlite3'),
                      ORIGIN=os.environ.get('GESTAO_ORIGIN', 'https://gestao.invalid'),
                      COOKIE_SECURE=True, MAX_CONTENT_LENGTH=64 * 1024)
    if config:
        app.config.update(config)

    mfa_path = os.environ.get('GESTAO_TOTP_FILE')
    if mfa_path:
        app.config['TOTP_SECRETS'] = load_secrets(mfa_path)
    if os.environ.get('GESTAO_REQUIRE_MFA') == '1' and not app.config.get('TOTP_SECRETS'):
        raise ValueError('MFA required but not provisioned')
    if app.config.get('TOTP_SECRETS'):
        setup_db = connect(app.config['DATABASE'])
        setup_db.execute('CREATE TABLE IF NOT EXISTS mfa_steps(user_id TEXT PRIMARY KEY, step INTEGER NOT NULL)')
        setup_db.close()

    def db():
        if 'db' not in g:
            g.db = connect(app.config['DATABASE'])
        return g.db

    @app.teardown_appcontext
    def close_db(_error):
        if 'db' in g:
            g.db.close()

    @app.errorhandler(Problem)
    def problem(error):
        return jsonify(error=error.message), error.status

    @app.errorhandler(HTTPException)
    def http_error(error):
        return jsonify(error=error.name), error.code

    @app.errorhandler(sqlite3.OperationalError)
    def unavailable(_error):
        return jsonify(error='Banco indisponível; tente novamente com a mesma chave'), 503

    @app.after_request
    def headers(response):
        response.headers.update({'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
            'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
            'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"})
        if app.config['COOKIE_SECURE']:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000'
        return response

    @app.before_request
    def authenticate():
        mutating = request.method not in ('GET', 'HEAD', 'OPTIONS')
        auth = request.headers.get('Authorization', '')
        if not auth and mutating:
            require(request.headers.get('Origin') == app.config['ORIGIN'], 'Origem inválida', 403)
        if request.path in ('/', '/assets/app.js', '/assets/style.css', '/api/login'):
            return
        if auth:
            require(auth.startswith('Bearer '), 'Credencial inválida', 401)
            row = db().execute('SELECT * FROM agents WHERE token_hash=? AND active=1 AND expires>?',
                               (digest(auth[7:]), int(time.time()))).fetchone()
            require(row is not None, 'Credencial inválida', 401)
            g.actor, g.role = 'agent:' + row['id'], 'agent'
            g.scopes = set(json.loads(row['scopes']))
            scope = agent_scope(request.method, request.path)
            require(scope is not None and (scope == 'identity:self' or scope in g.scopes), 'Escopo não autorizado', 403)
        else:
            row = db().execute('SELECT s.*,u.name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires>? AND u.active=1',
                               (digest(request.cookies.get('gestao_session', '')), int(time.time()))).fetchone()
            require(row is not None, 'Autenticação necessária', 401)
            g.actor, g.role, g.user_id, g.csrf = 'admin:' + row['user_id'], 'admin', row['user_id'], row['csrf']
            if mutating:
                require(secrets.compare_digest(request.headers.get('X-CSRF-Token', ''), row['csrf']), 'CSRF inválido', 403)

    def admin():
        require(g.role == 'admin', 'Somente administrador humano pode confirmar', 403)

    def password_check(name, password, clear_attempts=True):
        require(isinstance(name, str) and isinstance(password, str) and len(name) <= 200 and len(password) <= 1024,
                'Credenciais inválidas', 401)
        stamp = int(time.time())
        buckets = ['user:' + digest(name), 'ip:' + (request.remote_addr or '')]
        with transaction(db()):
            db().execute('DELETE FROM attempts WHERE at<?', (stamp - 900,))
            for bucket in buckets:
                count = db().execute('SELECT COUNT(*) FROM attempts WHERE bucket=? AND at>?', (bucket, stamp - 900)).fetchone()[0]
                require(count < 10, 'Muitas tentativas; aguarde 15 minutos', 429)
            for bucket in buckets:
                db().execute('INSERT INTO attempts VALUES(?,?)', (bucket, stamp))
        user = db().execute('SELECT * FROM users WHERE name=? AND active=1', (name,)).fetchone()
        # Always perform a password KDF, including unknown users.
        valid = check_password_hash(user['password_hash'] if user else app.config['DUMMY_HASH'], password)
        require(user is not None and valid, 'Credenciais inválidas', 401)
        if clear_attempts:
            with transaction(db()):
                db().executemany('DELETE FROM attempts WHERE bucket=?', [(bucket,) for bucket in buckets])
        return user

    app.config['DUMMY_HASH'] = generate_password_hash(secrets.token_urlsafe(32))

    @app.get('/')
    def index():
        return render_template('index.html', mfa_required=bool(app.config.get('TOTP_SECRETS')))

    @app.get('/assets/<name>')
    def asset(name):
        require(name in ('app.js', 'style.css'), 'Não encontrado', 404)
        from flask import send_from_directory
        return send_from_directory(Path(__file__).parent / 'static', name)

    @app.post('/api/login')
    def login():
        require(request.headers.get('Origin') == app.config['ORIGIN'], 'Origem inválida', 403)
        fields(request.json, ['name', 'password'], ['otp'])
        mfa = app.config.get('TOTP_SECRETS')
        user = password_check(request.json['name'], request.json['password'], clear_attempts=not mfa)
        step = None
        if mfa:
            secret = mfa.get(user['name'])
            require(secret is not None, 'Credenciais inválidas', 401)
            step = matching_step(secret, request.json.get('otp'), time.time())
            require(step is not None, 'Credenciais inválidas', 401)
        token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        with transaction(db()):
            if mfa:
                previous = db().execute('SELECT step FROM mfa_steps WHERE user_id=?', (user['id'],)).fetchone()
                require(previous is None or step > previous['step'], 'Código já utilizado; aguarde o próximo', 401)
                db().execute('INSERT INTO mfa_steps VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET step=excluded.step', (user['id'], step))
                db().executemany('DELETE FROM attempts WHERE bucket=?', [('user:' + digest(user['name']),), ('ip:' + (request.remote_addr or ''),)])
            db().execute('DELETE FROM sessions WHERE expires<? OR token_hash=?',
                         (int(time.time()), digest(request.cookies.get('gestao_session', ''))))
            db().execute('INSERT INTO sessions VALUES(?,?,?,?)', (digest(token), user['id'], csrf, int(time.time()) + 28800))
        response = jsonify(name=user['name'], csrf=csrf)
        response.set_cookie('gestao_session', token, secure=app.config['COOKIE_SECURE'], httponly=True, samesite='Strict', max_age=28800)
        return response

    @app.post('/api/logout')
    def logout():
        admin()
        db().execute('DELETE FROM sessions WHERE token_hash=?', (digest(request.cookies.get('gestao_session', '')),))
        response = jsonify(ok=True)
        response.delete_cookie('gestao_session', secure=app.config['COOKIE_SECURE'], httponly=True, samesite='Strict')
        return response

    @app.get('/api/me')
    def me():
        return jsonify(actor=g.actor, role=g.role, csrf=getattr(g, 'csrf', None))

    @app.get('/api/identities')
    def identities():
        people = [{'actor': 'admin:' + row['id'], 'name': row['name']}
                  for row in db().execute('SELECT id,name FROM users')]
        agents = [{'actor': 'agent:' + row['id'], 'name': row['name']}
                  for row in db().execute('SELECT id,name FROM agents')]
        return jsonify(items=people + agents, next_offset=None)

    @app.get('/api/<resource>')
    def listing(resource):
        tables = {'filaments', 'products', 'operations', 'movements', 'audit'}
        require(resource in tables, 'Não encontrado', 404)
        try:
            offset = int(request.args.get('offset', '0'))
        except ValueError:
            raise Problem('Offset inválido') from None
        require(0 <= offset <= 1000000, 'Offset inválido')
        if g.role == 'agent' and resource == 'operations':
            rows = db().execute('SELECT * FROM operations WHERE requester=? ORDER BY rowid DESC LIMIT 100 OFFSET ?', (g.actor, offset)).fetchall()
        else:
            rows = db().execute(f'SELECT * FROM {resource} ORDER BY rowid DESC LIMIT 100 OFFSET ?', (offset,)).fetchall()
        return jsonify(items=[dict(row) for row in rows], next_offset=offset + 100 if len(rows) == 100 else None)

    @app.post('/api/calculate')
    def calculator():
        return jsonify(calculate(request.json, db()))

    @app.post('/api/operations')
    def propose():
        fields(request.json, ['kind', 'payload'])
        kind = string(request.json['kind'])
        p = validate(kind, request.json['payload'])
        key = string(request.headers.get('Idempotency-Key'), 200)
        fingerprint = digest(canonical({'kind': kind, 'payload': p}))
        with transaction(db()):
            existing = db().execute('SELECT * FROM operations WHERE requester=? AND idempotency_key=?', (g.actor, key)).fetchone()
            if existing:
                require(existing['digest'] == fingerprint, 'Chave reutilizada com conteúdo diferente', 409)
                return jsonify(dict(existing)), 200
            op_id = str(uuid.uuid4())
            db().execute('INSERT INTO operations(id,requester,idempotency_key,kind,payload,digest,created_at,expires) VALUES(?,?,?,?,?,?,?,?)',
                         (op_id, g.actor, key, kind, canonical(p), fingerprint, now(), int(time.time()) + 86400))
            audit(db(), op_id, 'requested', g.actor, {'kind': kind, 'payload': p})
            op = dict(db().execute('SELECT * FROM operations WHERE id=?', (op_id,)).fetchone())
        return jsonify(op), 201

    @app.post('/api/operations/<op_id>/<decision>')
    def decide(op_id, decision):
        admin()
        require(decision in ('approve', 'reject'), 'Não encontrado', 404)
        fields(request.json, ['digest', 'confirmation', 'password'])
        require(request.json['confirmation'] == f'{decision}:{op_id}', 'Confirmação explícita necessária')
        user = db().execute('SELECT name FROM users WHERE id=?', (g.user_id,)).fetchone()
        password_check(user['name'], request.json['password'])
        with transaction(db()):
            op = db().execute('SELECT * FROM operations WHERE id=?', (op_id,)).fetchone()
            require(op is not None, 'Solicitação não encontrada', 404)
            require(op['digest'] == request.json['digest'], 'Conteúdo de confirmação divergente', 409)
            require(op['status'] == 'pending', 'Solicitação já encerrada', 409)
            require(op['expires'] > int(time.time()), 'Solicitação expirada; crie outra', 409)
            changes = apply_operation(db(), op) if decision == 'approve' else {'reason': 'rejected by administrator'}
            status = 'executed' if decision == 'approve' else 'rejected'
            executor = 'gestao-backend:v1' if decision == 'approve' else None
            db().execute('UPDATE operations SET status=?,approver=?,executor=?,executed_at=? WHERE id=?',
                         (status, g.actor, executor, now(), op_id))
            audit(db(), op_id, status, op['requester'], changes, g.actor, executor)
        return jsonify(id=op_id, status=status, changes=changes)

    return app
