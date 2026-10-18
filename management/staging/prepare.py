"""Prepare synthetic demo data outside Git. Never starts a listener or container."""
import argparse
import json
import os
import secrets
from pathlib import Path
from werkzeug.security import generate_password_hash
from management.app import connect, create_app


def prepare(destination):
    destination = Path(destination).resolve()
    repo = Path(__file__).resolve().parents[2]
    if destination == repo or repo in destination.parents:
        raise ValueError('Homologação e credenciais devem ficar fora do checkout')
    if destination.exists():
        raise ValueError('Destino deve ser novo; nenhum arquivo será sobrescrito')
    os.umask(0o077)
    destination.mkdir(parents=True, mode=0o700)
    data = destination/'data'; data.mkdir(mode=0o700)
    db_path = data/'gestao.sqlite3'
    db = connect(db_path)
    db.executescript((Path(__file__).parents[1]/'schema.sql').read_text())
    accounts = []
    for index in (1,2):
        name, password = f'DemoAdmin{index}', secrets.token_urlsafe(24)
        db.execute('INSERT INTO users(id,name,password_hash) VALUES(?,?,?)',
                   (f'demo-admin-{index}',name,generate_password_hash(password)))
        accounts.append({'name':name,'password':password})
    db.close(); db_path.chmod(0o600)
    # Seed through the exact proposal/approval API, preserving stock and audit invariants.
    app = create_app({'DATABASE':str(db_path),'TESTING':True,'ORIGIN':'http://localhost','COOKIE_SECURE':False})
    c = app.test_client()
    login = c.post('/api/login',json=accounts[0],headers={'Origin':'http://localhost'})
    c.environ_base.update(HTTP_ORIGIN='http://localhost',HTTP_X_CSRF_TOKEN=login.json['csrf'])
    def apply(kind,payload,key):
        op = c.post('/api/operations',json={'kind':kind,'payload':payload},headers={'Idempotency-Key':key})
        if op.status_code != 201:
            raise RuntimeError('Falha ao preparar solicitação sintética')
        r = c.post('/api/operations/'+op.json['id']+'/approve',json={
            'digest':op.json['digest'],'confirmation':'approve:'+op.json['id'],'password':accounts[0]['password']})
        if r.status_code != 200:
            raise RuntimeError('Falha ao aplicar fixture sintética')
        return r.json['changes']['after']
    f = apply('filament.create',{'name':'PLA Demonstração','material':'PLA','color':'Azul fictício','spool_weight_g':1000,'price_cents':10000},'demo-filament')
    apply('stock.receive',{'id':f['id'],'expected_version':1,'grams':2000,'reason':'Saldo fictício de homologação'},'demo-stock')
    apply('product.save',{'name':'Produto Demonstração','description':'Rascunho fictício, não publicar','images':[],
                         'materials':[{'filament_id':f['id'],'grams':100}],'cost_cents':1500,'sale_cents':3000},'demo-product')
    c.post('/api/logout',json={})
    (destination/'demo-credentials.json').write_text(json.dumps(accounts,indent=2))
    (destination/'demo-credentials.json').chmod(0o600)
    (destination/'compose.env').write_text(
        f'GESTAO_STAGE_DATA={data}\nGESTAO_BIND_IP=127.0.0.1\nGESTAO_STAGE_HOST=gestao.test\n'
        f'GESTAO_UID={os.getuid()}\nGESTAO_GID={os.getgid()}\n')
    (destination/'PREPARED_NOT_STARTED.txt').write_text('SYNTHETIC ONLY. No listeners, containers or real accounts started. Activation requires explicit approval.\n')
    return db_path


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--directory', required=True)
    args = parser.parse_args()
    prepare(args.directory)
    print('Kit fictício preparado fora do Git. Credenciais em arquivo privado. Nenhum serviço iniciado.')
