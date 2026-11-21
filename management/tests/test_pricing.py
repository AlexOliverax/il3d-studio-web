from decimal import Decimal
import pytest
from management.tests.test_management import app, client, seed  # noqa: F401


def body(f):
    return {'materials':[{'filament_id':f['id'],'grams':100}],'hours':'2.5','power_w':200,
            'energy_cents_kwh':100,'maintenance_cents_hour':100,'packaging_cents':200,'sale_cents':5000,
            'labor_hours':'1.5','labor_cents_hour':1000,'loss_bps':1000,'tax_bps':600,
            'sales_fee_bps':400,'fixed_fee_cents':100,'target_margin_bps':2000}


def test_full_pricing_and_target_margin(client):
    data = body(seed(client)); r = client.post('/api/calculate',json=data)
    assert r.status_code == 200
    p = r.json
    assert p['filament_cents'] == 1000 and p['loss_cents'] == 100
    assert p['labor_cents'] == 1500 and p['energy_cents'] == 50
    assert p['base_cents'] == 3200 and p['total_cents'] == 3700
    assert p['tax_cents'] == 300 and p['sales_fee_cents'] == 200
    assert p['profit_cents'] == 1300 and p['margin_percent'] == '26.00'
    assert p['suggested_sale_cents'] == 4572
    assert p['persisted'] is False and p['basis'] == 'estimate'
    data['sale_cents'] = p['suggested_sale_cents']
    p = client.post('/api/calculate',json=data).json
    assert Decimal(p['profit_cents']) / p['sale_cents'] >= Decimal('.20')
    assert client.get('/api/filaments').json['items'][0]['quantity_g'] == 1000


@pytest.mark.parametrize('change', [{'tax_bps':10000},{'target_margin_bps':9000},{'loss_bps':-1},
 {'sales_fee_bps':1.5},{'labor_hours':'Infinity'},{'labor_cents_hour':True},
 {'basis':'actual_inputs'},{'basis':'approved_real'},{'basis':'actual_inputs','basis_note':'medição'}])
def test_invalid_pricing_rejected(client,change):
    data = body(seed(client)); data.update(change)
    assert client.post('/api/calculate',json=data).status_code == 400


def test_measured_inputs_are_not_accounting(client):
    data = body(seed(client)); data.update(basis='actual_inputs',basis_note='Medição fictícia',loss_bps=0)
    p = client.post('/api/calculate',json=data).json
    assert p['basis'] == 'actual_inputs' and p['persisted'] is False
    assert 'não contabilizada' in p['cost_notice']


def test_half_cent_rounding_and_margin_buffer(client):
    f = seed(client)
    data = body(f)
    data.update(materials=[],hours='0.005',power_w=1000,energy_cents_kwh=100,
                maintenance_cents_hour=100,labor_hours='0.005',labor_cents_hour=100,
                packaging_cents=0,fixed_fee_cents=0,loss_bps=0,tax_bps=5000,sales_fee_bps=0,target_margin_bps=0,sale_cents=1)
    p = client.post('/api/calculate',json=data).json
    assert p['energy_cents'] == p['maintenance_cents'] == p['labor_cents'] == p['tax_cents'] == 1
    assert p['profit_cents'] == -3
    # Exercise rounding discontinuities with two independently rounded percentages.
    from management.app import calculate, connect
    with connect(client.application.config['DATABASE']) as db:
        for cost in range(1,31):
            for target in (0,1,2000,9997):
                data.update(materials=[],hours='0',labor_hours='0',packaging_cents=cost,
                            tax_bps=1,sales_fee_bps=1,target_margin_bps=target,sale_cents=0)
                suggestion = calculate(data,db)['suggested_sale_cents']
                actual = calculate({**data,'sale_cents':suggestion},db)
                assert actual['profit_cents'] * 10000 >= suggestion * target
