import json
from decimal import Decimal
from pathlib import Path
import pytest
from management.tests.test_management import app
from management.app import connect, Problem
from management.physical_inventory import register_batch
from management.tests.test_physical_inventory import item
from management.production_pricing import NUMERIC, simulate
from management.energy import bill, reference


def config():
    return {'kits':{'testkit':{'ornament_grams':'50.25','print_seconds':3600,'hooks':6}},
            'hook_batch':{'units':10,'grams':'3.50','print_seconds':1000,'petg_profile_confirmed':False},'parameters':{}}


def setup(app):
    db=connect(app.config['DATABASE']);register_batch(db,[item()],'task','owner');return db


def known():
    params={k:{'value':0,'basis':'confirmed','source':'synthetic test only'} for k in NUMERIC}
    params['packaging_cents']['value']=100
    return params


def test_incomplete_replacement_not_gift_or_stock(app):
    db=setup(app);out=simulate({'kit_id':'testkit','inventory_id':'TEST01','channel':'direct'},db,config())
    assert out['status']=='incomplete_simulation' and out['conditional_suggested_sale_cents'] is None
    assert out['costs']['ornament_material_cents']==377
    assert out['costs']['hook_material_cents']==16
    assert out['total_material_grams']=='52.35'
    assert out['machine_seconds_including_allocated_hooks']=='4200'
    assert out['costs']['energy_cents'] is None and not out['stock_changed']
    assert out['hook_costs_provisional']


def test_profit_100_percent_cost_not_revenue_and_rounding(app):
    db=setup(app);params=known();params['sales_fee_bps']['value']=1000
    for rate in [0,100,1000,2000,4900]:
        params['sales_fee_bps']['value']=rate
        out=simulate({'kit_id':'testkit','inventory_id':'TEST01','channel':'direct','parameters':params,'hook_petg_confirmed':True,'hook_evidence':'synthetic profile'},db,config())
        assert out['analysis']['profit_cents']>=out['analysis']['complete_cost_cents']
        assert Decimal(out['analysis']['margin_percent'])>=50
        assert out['final_price'] is False and not out['pending']
    params['sales_fee_bps']['value']=5000
    with pytest.raises(Problem):simulate({'kit_id':'testkit','inventory_id':'TEST01','channel':'direct','parameters':params,'hook_petg_confirmed':True,'hook_evidence':'test'},db,config())


def test_ml_requires_final_price_quote(app):
    db=setup(app);data={'kit_id':'testkit','inventory_id':'TEST01','channel':'mercado_livre','parameters':known(),'hook_petg_confirmed':True,'hook_evidence':'test'}
    out=simulate(data,db,config());assert 'fee_quote.price_cents' in out['pending']
    data['fee_quote']={'category_id':'test','listing_type_id':'test','seller_reference':'test','source':'test','checked_at':'2026-10-22','logistic_type':'test','shipping_mode':'test','billable_weight_g':100,'price_cents':1,'sales_fee_bps':0,'fixed_fee_cents':0,'shipping_cents':0}
    out=simulate(data,db,config());assert 'revalidate_fees_at_suggested_price' in out['pending']
    assert 'seller_fee_quote_independent_verification' in out['pending']


def test_bill_excludes_fixed_and_no_tax_double_add():
    data={'consumed_kwh':100,'total_cents':15000,'reference_month':'2026-10','distributor':'Example','modality':'conventional','source':'synthetic bill','variable_lines_include_taxes':True,'variable_lines_include_flag':True,'line_items':[{'id':'1','description':'Energy incl taxes','amount_cents':12000,'kind':'variable_energy'},{'id':'2','description':'CIP','amount_cents':2000,'kind':'cip'},{'id':'3','description':'Fixed','amount_cents':1000,'kind':'fixed'}]}
    out=bill(data);assert out['effective_cents_kwh']=='120.000000' and out['excluded_cents']==3000
    data['line_items'][0]['kind']='unclassified';assert bill(data)['effective_cents_kwh'] is None
    data['total_cents']=1
    with pytest.raises(Problem):bill(data)


def test_no_cep_inference_and_no_generic_tariff():
    out=reference({'cep':'05200-000'});assert out['distributor_candidate'] is None and out['effective_cents_kwh'] is None
    out=reference({'city':'São Paulo','state':'SP','district':'Perus'});assert out['distributor_candidate'] and not out['modality_confirmed']


def test_endpoint_scopes_and_read_only(app):
    db=setup(app);Path(app.config['DATABASE']).parent.joinpath('production-parameters.json').write_text(json.dumps(config()))
    c=app.test_client();assert c.get('/api/production-parameters').status_code==401
    c.environ_base['HTTP_AUTHORIZATION']='Bearer test-agent'
    assert c.get('/api/production-parameters').status_code==200
    assert c.post('/api/pricing/simulate',json={'kit_id':'testkit','inventory_id':'TEST01','channel':'direct'}).status_code==200
    assert db.execute('SELECT COUNT(*) FROM operations').fetchone()[0]==0
    db.execute("UPDATE agents SET scopes='[]'")
    assert c.get('/api/production-parameters').status_code==403
    assert c.post('/api/energy/lookup',json={}).status_code==403
