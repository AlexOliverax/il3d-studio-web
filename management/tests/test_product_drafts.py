import json
from management.app import connect
from management.tests.test_management import app, client

def test_drafts_nullable_readonly_and_permissions(app,client,tmp_path):
    file=tmp_path/'drafts.json'
    file.write_text(json.dumps({'items':[{'id':'draft-test','name':'Fictício','cost_cents':None,'sale_cents':None,'stock_quantity':None}]}))
    app.config['PRODUCT_DRAFTS_FILE']=str(file)
    original=file.read_bytes()
    response=client.get('/api/product-drafts');assert response.status_code==200
    assert response.json['items'][0]['sale_cents'] is None
    assert response.json['items'][0]['stock_quantity'] is None
    agent=app.test_client();headers={'Authorization':'Bearer test-agent'}
    assert agent.get('/api/product-drafts',headers=headers).status_code==200
    assert agent.get('/api/product-drafts').status_code==401
    assert agent.post('/api/product-drafts',headers=headers,json={}).status_code==403
    db=connect(app.config['DATABASE']);db.execute('UPDATE agents SET scopes=?',('[]',));db.close()
    assert agent.get('/api/product-drafts',headers=headers).status_code==403
    assert file.read_bytes()==original

def test_no_registry_returns_empty(client):
    assert client.get('/api/product-drafts').json=={'items':[],'next_offset':None}
