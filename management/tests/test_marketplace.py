import json
import pytest
from management.app import connect
from management.integrations.adapters import AgentAdapter
from management.tests.test_management import app, client, seed
from management.tests.test_pricing import body


def payload(client):
    costs=body(seed(client));costs['shipping_cents']=500
    return {'title':'Peça fictícia','description':'Somente teste','category_id':'MLB_TEST',
            'listing_type_id':'TEST','fee_source_note':'Valores fictícios, não cotações oficiais','costs':costs}

def test_preview_read_only_shipping(client,app):
    data=payload(client)
    db=connect(app.config['DATABASE']);before='\n'.join(db.iterdump())
    r=client.post('/api/marketplaces/ml/preview',json=data)
    assert r.status_code==200
    assert r.json['pricing']['base_cents']==3700
    assert r.json['pricing']['shipping_cents']==500
    assert r.json['pricing']['suggested_sale_cents']>4572
    assert r.json['persisted'] is False and r.json['published'] is False
    assert r.json['fee_verification']=='unverified_user_inputs'
    assert before=='\n'.join(db.iterdump())
    db.close()

@pytest.mark.parametrize('key',['shipping_cents','sales_fee_bps','fixed_fee_cents','tax_bps','target_margin_bps'])
def test_missing_fees_rejected(client,key):
    data=payload(client);data['costs'].pop(key)
    assert client.post('/api/marketplaces/ml/preview',json=data).status_code==400

def test_negative_shipping_rejected(client):
    data=payload(client);data['costs']['shipping_cents']=-1
    assert client.post('/api/marketplaces/ml/preview',json=data).status_code==400

def test_token_scopes_and_adapter(app,client):
    data=payload(client);c=app.test_client();db=connect(app.config['DATABASE'])
    db.execute('UPDATE agents SET scopes=?',(json.dumps(['pricing:calculate']),))
    def transport(method,path,body,headers):
        r=c.open('/api'+path,method=method,json=body,headers=headers)
        return {'status':r.status_code,'data':r.json}
    a=AgentAdapter('http://127.0.0.1/api','test-agent',local_test=True,transport=transport)
    assert a.call('preview_ml_listing',data)['status']==200
    assert c.post('/api/marketplaces/ml/preview',json=data,headers={'Origin':'http://localhost'}).status_code==401
    db.execute('UPDATE agents SET scopes=?',('[]',))
    assert a.call('preview_ml_listing',data)['status']==403
    with pytest.raises(ValueError):a.call('publish',data)
    db.close()
