import base64
import json
import time
from pathlib import Path
import pytest
from werkzeug.security import generate_password_hash
from management.app import create_app, connect
from management.mfa import code, load_secrets
SECRET = base64.b32encode(b'12345678901234567890').decode()
@pytest.fixture
def client(tmp_path):
    path=tmp_path/'db.sqlite3'
    db=connect(path)
    db.executescript((Path(__file__).parents[1]/'schema.sql').read_text())
    db.execute('INSERT INTO users(id,name,password_hash) VALUES(?,?,?)',('demo','DemoMFA',generate_password_hash('fictitious-password')))
    db.close()
    app=create_app({'DATABASE':str(path),'TESTING':True,'COOKIE_SECURE':False,'ORIGIN':'http://localhost','TOTP_SECRETS':{'DemoMFA':SECRET}})
    return app.test_client()
def login(client,otp=None):
    data={'name':'DemoMFA','password':'fictitious-password'}
    if otp is not None:data['otp']=otp
    return client.post('/api/login',json=data,headers={'Origin':'http://localhost'})
@pytest.mark.parametrize('stamp,expected',[(59,'94287082'),(1111111109,'07081804'),(1234567890,'89005924'),(2000000000,'69279037')])
def test_rfc6238(stamp,expected):
    assert code(SECRET,stamp//30,8)==expected

def test_required_and_valid_and_replay(client):
    assert login(client).status_code==401
    otp=code(SECRET,int(time.time())//30)
    assert login(client,otp).status_code==200
    assert login(client,otp).status_code==401

def test_otp_bruteforce_limited(client):
    for _ in range(10):assert login(client,'invalid').status_code==401
    assert login(client,'invalid').status_code==429

def test_old_code(client):
    assert login(client,code(SECRET,int(time.time())//30-3)).status_code==401

def test_field_rendered(client):
    assert b'name="otp"' in client.get('/').data

def test_private_provisioning_file(tmp_path):
    p=tmp_path/'mfa.json';p.write_text(json.dumps({'DemoMFA':SECRET}));p.chmod(0o600)
    assert load_secrets(p)=={'DemoMFA':SECRET}
    p.chmod(0o644)
    with pytest.raises(ValueError):load_secrets(p)

def test_required_missing_provisioning(monkeypatch):
    monkeypatch.setenv('GESTAO_REQUIRE_MFA','1')
    with pytest.raises(ValueError):create_app({'TESTING':True})
