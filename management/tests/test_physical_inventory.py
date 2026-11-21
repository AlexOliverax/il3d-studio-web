import pytest
from management.tests.test_management import app, client
from management.app import connect, Problem
from management.physical_inventory import register_batch, listing


def item(id='TEST01'):
    return dict(inventory_id=id, category='rolo', material='PETG', color='Teste', brand=None,
                diameter_mm=1.75, nominal_weight_g=1000, gross_weight_g=850, tare_weight_g=None,
                net_weight_g=None, net_status='pending_tare', observation='Fictício',
                acquisition_cost_cents=0, replacement_value_cents=7500, quantity_units=1)


def test_idempotent_atomic_no_stock_no_auto_approval(app):
    db=connect(app.config['DATABASE'])
    assert register_batch(db,[item()],'test-task','test-admin')['created_ids']==['TEST01']
    assert register_batch(db,[item()],'test-task','test-admin')['created_ids']==[]
    with pytest.raises(Problem):
        register_batch(db,[item('TEST02'),dict(item(),gross_weight_g=999)],'test-task','test-admin')
    assert len(listing(db))==1
    assert listing(db)[0]['net_weight_g'] is None
    assert listing(db)[0]['acquisition_cost_cents']==0
    assert listing(db)[0]['replacement_value_cents']==7500
    assert db.execute('SELECT COUNT(*) FROM filaments').fetchone()[0]==0
    assert db.execute('SELECT COUNT(*) FROM operations').fetchone()[0]==0
    assert db.execute('SELECT approver FROM audit').fetchone()[0] is None


def test_pending_cannot_be_zero_or_gross(app):
    db=connect(app.config['DATABASE'])
    for net in [0,850]:
        with pytest.raises(Problem):register_batch(db,[dict(item(),net_weight_g=net)],'t','u')
    with pytest.raises(Problem):register_batch(db,[item(),item()],'t','u')


def test_auth_scope_and_no_web_writes(app):
    c=app.test_client(); assert c.get('/api/physical-inventory').status_code==401
    c.environ_base['HTTP_AUTHORIZATION']='Bearer test-agent'
    assert c.get('/api/physical-inventory').json['items']==[]
    assert c.post('/api/physical-inventory',json=item()).status_code==403
    db=connect(app.config['DATABASE']);db.execute("UPDATE agents SET scopes='[]'")
    assert c.get('/api/physical-inventory').status_code==403


def test_owner_confirmation_preserves_unknown_and_is_idempotent(app):
    from management.physical_inventory import confirm_physical_stock
    db=connect(app.config['DATABASE'])
    measured=dict(item('TEST02'),gross_weight_g=None,net_weight_g=17,net_status='measured')
    register_batch(db,[item(),measured],'test-task','test-admin')
    with pytest.raises(Problem):confirm_physical_stock(db,['TEST01','missing'],'test-owner')
    assert listing(db)[0]['stock_status']=='pending_review'
    assert confirm_physical_stock(db,['TEST01','TEST02'],'test-owner')==['TEST01','TEST02']
    assert confirm_physical_stock(db,['TEST01','TEST02'],'test-owner')==[]
    rows=listing(db)
    assert rows[0]['available_units']==1 and rows[0]['available_net_weight_g'] is None
    assert rows[1]['available_net_weight_g']==17
    assert all(i['review_status']=='confirmed' for i in rows)
    assert db.execute('SELECT COUNT(*) FROM operations').fetchone()[0]==0
    assert db.execute("SELECT COUNT(*) FROM audit WHERE approver='test-owner'").fetchone()[0]==2
