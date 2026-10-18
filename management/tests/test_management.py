import json
import sqlite3
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pytest
from werkzeug.security import generate_password_hash
from management.app import connect, create_app, digest

ORIGIN = 'http://localhost'
PASSWORD = 'test-only-password-123'
FILAMENT = {'name': 'PLA teste', 'material': 'PLA', 'color': 'Branco', 'spool_weight_g': 1000, 'price_cents': 10000}


@pytest.fixture
def app(tmp_path):
    path = str(tmp_path / 'test.sqlite3')
    db = connect(path)
    db.executescript((Path(__file__).parents[1] / 'schema.sql').read_text())
    for name in ['AdminTesteA', 'AdminTesteB']:
        db.execute('INSERT INTO users(id,name,password_hash) VALUES(?,?,?)', (name.lower(), name, generate_password_hash(PASSWORD)))
    db.execute('INSERT INTO agents(id,name,token_hash,expires) VALUES(?,?,?,?)', ('agent-test', 'AgenteTeste', digest('test-agent'), int(time.time())+3600))
    db.close()
    return create_app({'DATABASE':path,'TESTING':True,'ORIGIN':ORIGIN,'COOKIE_SECURE':False})


def logged(app, name='AdminTesteA'):
    c = app.test_client()
    r = c.post('/api/login',json={'name':name,'password':PASSWORD},headers={'Origin':ORIGIN})
    assert r.status_code == 200, r.json
    c.environ_base['HTTP_ORIGIN'] = ORIGIN
    c.environ_base['HTTP_X_CSRF_TOKEN'] = r.json['csrf']
    return c


@pytest.fixture
def client(app):
    return logged(app)


def propose(client, kind='filament.create', payload=None, key='first'):
    r = client.post('/api/operations',json={'kind':kind,'payload':payload if payload is not None else FILAMENT},headers={'Idempotency-Key':key})
    assert r.status_code in (200,201), r.json
    return r.json


def decide(client, op, verb='approve', **overrides):
    body = {'digest':op['digest'],'confirmation':f"{verb}:{op['id']}",'password':PASSWORD}
    body.update(overrides)
    return client.post(f"/api/operations/{op['id']}/{verb}",json=body)


def seed(client, grams=1000):
    r = decide(client,propose(client))
    assert r.status_code == 200, r.json
    f = r.json['changes']['after']
    if grams:
        op = propose(client,'stock.receive',{'id':f['id'],'expected_version':f['version'],'grams':grams,'reason':'Compra de teste'},'receive')
        r = decide(client,op)
        assert r.status_code == 200, r.json
        f = r.json['changes']['after']
    return f


def test_anonymous_cannot_access_data_or_database(app):
    c = app.test_client()
    for path in ['/api/identities','/api/filaments','/api/products','/api/audit','/api/movements','/api/operations','/schema.sql','/instance/test.sqlite3']:
        assert c.get(path).status_code == 401
    r = c.get('/')
    assert r.status_code == 200 and b'PLA teste' not in r.data
    assert r.headers['Cache-Control'] == 'no-store'
    assert "frame-ancestors 'none'" in r.headers['Content-Security-Policy']


def test_session_cookie_and_logout(app):
    c = app.test_client()
    app.config['COOKIE_SECURE'] = True
    r = c.post('/api/login',json={'name':'AdminTesteA','password':PASSWORD},headers={'Origin':ORIGIN})
    assert all(x in r.headers['Set-Cookie'] for x in ['Secure','HttpOnly','SameSite=Strict'])
    c.environ_base.update(HTTP_ORIGIN=ORIGIN,HTTP_X_CSRF_TOKEN=r.json['csrf'])
    assert c.post('/api/logout',json={}).status_code == 200
    assert c.get('/api/me').status_code == 401


def test_origin_csrf_and_invalid_credentials(app, client):
    assert app.test_client().post('/api/login',json={'name':'AdminTesteA','password':PASSWORD}).status_code == 403
    assert app.test_client().post('/api/login',json={'name':'AdminTesteA','password':'wrong'},headers={'Origin':ORIGIN}).status_code == 401
    assert client.post('/api/operations',json={},headers={'X-CSRF-Token':''}).status_code == 403
    assert client.post('/api/operations',json={},headers={'Origin':'https://evil.invalid'}).status_code == 403


def test_pending_has_no_effect_and_approved_audit(client):
    op = propose(client)
    assert client.get('/api/filaments').json['items'] == []
    result = decide(client,op)
    assert result.status_code == 200
    assert result.json['changes']['after']['quantity_g'] == 0
    event = client.get('/api/audit').json['items'][0]
    assert event['requester'] == event['approver'] == 'admin:admintestea'
    assert event['executor'] == 'gestao-backend:v1'
    assert json.loads(event['changes'])['before'] is None
    assert event['created_at']


def test_agents_can_request_but_never_confirm(app, client):
    a = app.test_client()
    a.environ_base['HTTP_AUTHORIZATION'] = 'Bearer test-agent'
    op = propose(a)
    assert a.get('/api/filaments').status_code == 200
    assert decide(a,op).status_code == 403
    assert decide(a,op,'reject').status_code == 403
    assert decide(client,op).status_code == 200
    event = client.get('/api/audit').json['items'][0]
    assert event['requester'] == 'agent:agent-test' and event['approver'] == 'admin:admintestea'


def test_admintesteb_is_authorized(app, client):
    op = propose(client)
    assert decide(logged(app,'AdminTesteB'),op).status_code == 200
    assert client.get('/api/audit').json['items'][0]['approver'] == 'admin:admintesteb'


@pytest.mark.parametrize('overrides', [{'password':'wrong'},{'confirmation':True},{'digest':'altered'},{'payload':FILAMENT}])
def test_confirmation_cannot_be_forged(client, overrides):
    op = propose(client)
    assert decide(client,op,**overrides).status_code in (400,401,409)
    assert client.get('/api/filaments').json['items'] == []


def test_idempotency_and_replay(client):
    op = propose(client)
    assert propose(client)['id'] == op['id']
    r = client.post('/api/operations',json={'kind':'filament.create','payload':{**FILAMENT,'name':'changed'}},headers={'Idempotency-Key':'first'})
    assert r.status_code == 409
    assert decide(client,op).status_code == 200
    assert decide(client,op).status_code == 409
    assert len(client.get('/api/filaments').json['items']) == 1


def test_stock_receive_consume_adjust_and_history(client):
    f = seed(client)
    for index,(kind,grams,balance) in enumerate([('stock.consume',100,900),('stock.adjust',850,850)]):
        op = propose(client,kind,{'id':f['id'],'expected_version':f['version'],'grams':grams,'reason':'Teste'},str(index))
        r = decide(client,op)
        assert r.status_code == 200
        f = r.json['changes']['after']
        assert f['quantity_g'] == balance
    moves = client.get('/api/movements').json['items']
    assert [m['delta_g'] for m in moves] == [-50,-100,1000]


def test_insufficient_stock_rolls_back_all_changes(client):
    f = seed(client,50)
    op = propose(client,'stock.consume',{'id':f['id'],'expected_version':f['version'],'grams':51,'reason':'Teste'},'too-much')
    before = client.get('/api/audit').json['items']
    assert decide(client,op).status_code == 409
    assert client.get('/api/filaments').json['items'][0]['quantity_g'] == 50
    assert client.get('/api/audit').json['items'] == before
    assert client.get('/api/operations').json['items'][0]['status'] == 'pending'


def test_stale_version_and_concurrent_duplicate(app, client):
    f = seed(client)
    payload = {'id':f['id'],'expected_version':f['version'],'grams':100,'reason':'Teste'}
    first = propose(client,'stock.consume',payload,'a')
    stale = propose(client,'stock.consume',payload,'b')
    clients = [logged(app),logged(app,'AdminTesteB')]
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(lambda c: decide(c,first).status_code,clients))
    assert sorted(results) == [200,409]
    assert decide(client,stale).status_code == 409
    assert client.get('/api/filaments').json['items'][0]['quantity_g'] == 900
    assert len(client.get('/api/movements').json['items']) == 2


def test_rejection_and_expired_operation(app,client):
    op = propose(client)
    assert decide(client,op,'reject').status_code == 200
    assert decide(client,op).status_code == 409
    assert client.get('/api/filaments').json['items'] == []
    op = propose(client,key='expired')
    # Simulate wall clock passing rather than bypassing immutable DB fields.
    from unittest.mock import patch
    with patch('management.app.time.time',return_value=time.time()+86500):
        a = app.test_client()
        r = a.post('/api/login',json={'name':'AdminTesteA','password':PASSWORD},headers={'Origin':ORIGIN})
        a.environ_base.update(HTTP_ORIGIN=ORIGIN,HTTP_X_CSRF_TOKEN=r.json['csrf'])
        assert decide(a,op).status_code == 409


def test_product_draft_finance_and_no_publication(client):
    f = seed(client)
    data = {'name':'Produto teste','description':'Rascunho','images':['https://example.com/image.jpg'],
            'materials':[{'filament_id':f['id'],'grams':20}],'cost_cents':300,'sale_cents':800}
    op = propose(client,'product.save',data,'product')
    assert client.get('/api/products').json['items'] == []
    r = decide(client,op)
    p = r.json['changes']['after']
    assert p['status'] == 'draft'
    op = propose(client,'catalog.prepare',{'id':p['id'],'expected_version':p['version']},'catalog')
    p = decide(client,op).json['changes']['after']
    assert p['status'] == 'ready'
    assert client.get('/api/catalog').status_code == 404
    op = propose(client,'product.save',{**data,'id':p['id'],'expected_version':p['version'],'sale_cents':900},'price')
    assert client.get('/api/products').json['items'][0]['sale_cents'] == 800
    p = decide(client,op).json['changes']['after']
    assert p['status'] == 'draft' and p['sale_cents'] == 900
    op = propose(client,'product.archive',{'id':p['id'],'expected_version':p['version']},'archive')
    assert decide(client,op).json['changes']['after']['status'] == 'archived'
    assert client.get('/api/filaments').json['items'][0]['quantity_g'] == 1000


def test_calculator_rounding_margin_zero_and_negative_profit(client):
    f = seed(client)
    body = {'materials':[{'filament_id':f['id'],'grams':100}],'hours':'2.5','power_w':200,
            'energy_cents_kwh':100,'maintenance_cents_hour':100,'packaging_cents':200,'sale_cents':3000}
    r = client.post('/api/calculate',json=body)
    assert r.json == {'filament_cents':1000,'energy_cents':50,'maintenance_cents':250,'packaging_cents':200,
                      'total_cents':1500,'sale_cents':3000,'profit_cents':1500,'margin_percent':'50.00'}
    body['sale_cents'] = 0
    r = client.post('/api/calculate',json=body)
    assert r.json['margin_percent'] is None and r.json['profit_cents'] == -1500
    body['hours'] = 'NaN'
    assert client.post('/api/calculate',json=body).status_code == 400
    assert client.get('/api/filaments').json['items'][0]['quantity_g'] == 1000


@pytest.mark.parametrize('payload', [{**FILAMENT,'quantity_g':1000},{**FILAMENT,'price_cents':-1},{**FILAMENT,'spool_weight_g':True},{**FILAMENT,'price_cents':1.25}])
def test_input_validation_blocks_hidden_financial_and_stock_fields(client,payload):
    assert client.post('/api/operations',json={'kind':'filament.create','payload':payload},headers={'Idempotency-Key':'bad'}).status_code == 400


def test_disabled_users_revoked_agents_and_expiry(app,client):
    db = connect(app.config['DATABASE'])
    db.execute("UPDATE users SET active=0 WHERE id='admintestea'")
    assert client.get('/api/me').status_code == 401
    a = app.test_client(); a.environ_base['HTTP_AUTHORIZATION'] = 'Bearer test-agent'
    db.execute('UPDATE agents SET active=0')
    assert a.get('/api/filaments').status_code == 401
    db.execute('UPDATE agents SET active=1,expires=0')
    assert a.get('/api/filaments').status_code == 401
    db.close()


def test_rate_limit(app):
    c = app.test_client()
    for _ in range(10):
        assert c.post('/api/login',json={'name':'AdminTesteA','password':'bad'},headers={'Origin':ORIGIN}).status_code == 401
    assert c.post('/api/login',json={'name':'AdminTesteA','password':PASSWORD},headers={'Origin':ORIGIN}).status_code == 429


def test_db_immutable_audit_and_operation(app,client):
    op = propose(client)
    db = connect(app.config['DATABASE'])
    with pytest.raises(sqlite3.IntegrityError):
        db.execute('UPDATE operations SET payload=? WHERE id=?', ('{}',op['id']))
    with pytest.raises(sqlite3.IntegrityError):
        db.execute('DELETE FROM audit')
    db.close()


def test_agent_cannot_claim_admin_or_publish(client):
    for kind in ['publish','stock.delete','admin.create']:
        assert client.post('/api/operations',json={'kind':kind,'payload':{}},headers={'Idempotency-Key':'bad'}).status_code == 400
    assert client.post('/api/operations',json={'kind':'filament.create','payload':FILAMENT,'approved':True},headers={'Idempotency-Key':'bad'}).status_code == 400


def test_pagination_and_no_raw_credentials(client):
    identities = client.get('/api/identities').json['items']
    assert all(set(item) == {'actor', 'name'} for item in identities)
    assert {item['name'] for item in identities} == {'AdminTesteA','AdminTesteB','AgenteTeste'}
    assert client.get('/api/filaments?offset=-1').status_code == 400
    assert client.get('/api/filaments?offset=x').status_code == 400
    for resource in ['users','sessions','agents']:
        assert client.get('/api/'+resource).status_code == 404


def test_filament_price_update_requires_confirmation(client):
    f = seed(client)
    op = propose(client,'filament.update',{**FILAMENT,'id':f['id'],'expected_version':f['version'],'price_cents':12500},'update-price')
    assert client.get('/api/filaments').json['items'][0]['price_cents'] == 10000
    assert decide(client,op).status_code == 200
    f = client.get('/api/filaments').json['items'][0]
    assert f['price_cents'] == 12500 and f['quantity_g'] == 1000


def test_missing_material_does_not_create_product(client):
    p = {'name':'Produto','description':'Teste','images':[],
         'materials':[{'filament_id':'missing','grams':10}],'cost_cents':100,'sale_cents':200}
    op = propose(client,'product.save',p,'missing')
    assert decide(client,op).status_code == 404
    assert client.get('/api/products').json['items'] == []


def test_expired_session(app,client):
    db = connect(app.config['DATABASE'])
    db.execute('UPDATE sessions SET expires=0')
    db.close()
    assert client.get('/api/filaments').status_code == 401


def test_movement_history_cannot_be_deleted(app,client):
    seed(client)
    db = connect(app.config['DATABASE'])
    with pytest.raises(sqlite3.IntegrityError):
        db.execute('DELETE FROM movements')
    db.close()


def test_public_login_does_not_disclose_admin_names(app):
    html = app.test_client().get('/').data
    assert b'AdminTesteA' not in html and b'AdminTesteB' not in html


def test_cli_refuses_to_overwrite_database(tmp_path):
    import subprocess
    import sys
    path = tmp_path/'empty.sqlite3'
    cmd = [sys.executable,'-m','management.cli','init','--database',str(path)]
    assert subprocess.run(cmd,capture_output=True).returncode == 0
    data = path.read_bytes()
    assert subprocess.run(cmd,capture_output=True).returncode != 0
    assert path.read_bytes() == data
    db = connect(path)
    assert db.execute('SELECT count(*) FROM users').fetchone()[0] == 0
    db.close()
