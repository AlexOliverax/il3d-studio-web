import json
import os
from pathlib import Path
import pytest
from management.staging.prepare import prepare
from management.ops.backup import snapshot
from management.app import connect, create_app


def test_prepare_backup_restore_and_private_logins(tmp_path):
    directory = tmp_path/'stage'
    source = prepare(directory)
    assert source.stat().st_mode & 0o077 == 0
    assert (directory/'demo-credentials.json').stat().st_mode & 0o077 == 0
    accounts = json.loads((directory/'demo-credentials.json').read_text())
    assert {a['name'] for a in accounts} == {'DemoAdmin1','DemoAdmin2'}
    with connect(source) as db:
        assert db.execute('SELECT COUNT(*) FROM sessions').fetchone()[0] == 0
        assert db.execute('SELECT quantity_g FROM filaments').fetchone()[0] == 2000
        assert db.execute('SELECT status FROM products').fetchone()[0] == 'draft'
    backup = snapshot(source,tmp_path/'backup.sqlite3')
    restored = snapshot(backup,tmp_path/'restored.sqlite3')
    for table in ['users','filaments','products','operations','movements','audit']:
        with connect(source) as a, connect(restored) as b:
            assert [tuple(r) for r in a.execute(f'SELECT * FROM {table}')] == [tuple(r) for r in b.execute(f'SELECT * FROM {table}')]
    app = create_app({'DATABASE':str(restored),'ORIGIN':'http://localhost','COOKIE_SECURE':False,'TESTING':True})
    for account in accounts:
        c = app.test_client()
        assert c.post('/api/login',json=account,headers={'Origin':'http://localhost'}).status_code == 200
        assert c.get('/api/filaments').json['items'][0]['quantity_g'] == 2000
    with pytest.raises(ValueError):
        snapshot(source,restored)
    with pytest.raises(ValueError):
        prepare(directory)


def test_preparation_refuses_checkout():
    with pytest.raises(ValueError):
        prepare(Path(__file__).parents[2]/'management'/'instance'/'forbidden')


def test_staging_is_off_by_default_and_loopback_only():
    import subprocess
    import shutil
    if not shutil.which('docker'):
        pytest.skip('Docker Compose unavailable')
    config = Path(__file__).parents[1]/'staging'/'compose.yaml'
    env = {**os.environ,'GESTAO_STAGE_DATA':'/tmp/synthetic-not-mounted'}
    # Configuration validation never creates a container, listener or database.
    r = subprocess.run(['docker','compose','-f',str(config),'--profile','approved-staging','config','--format','json'],env=env,capture_output=True,text=True)
    if r.returncode and 'No such file' in r.stderr:
        pytest.skip('Docker Compose unavailable')
    assert r.returncode == 0, r.stderr
    model = json.loads(r.stdout)
    assert model['services']['proxy']['ports'][0]['host_ip'] == '127.0.0.1'
    assert not model['services']['app'].get('ports')
    assert all(s['profiles'] == ['approved-staging'] for s in model['services'].values())
    assert model['networks']['private']['internal'] is True
