"""Read-only replacement-cost scenarios. Unknowns are not zero and prices are never persisted."""
import json
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP, ROUND_CEILING
from management.app import fields, require, string, integer, Problem
from management.physical_inventory import listing

NUMERIC = {'power_w','energy_cents_kwh','maintenance_cents_hour','depreciation_cents_hour',
           'labor_cents_hour','finishing_minutes','preparation_minutes_per_hook_batch',
           'failure_bps','packaging_cents','tax_bps','sales_fee_bps','fixed_fee_cents','shipping_cents'}


def parameters(db_path):
    path = Path(db_path).parent / 'production-parameters.json'
    return json.loads(path.read_text()) if path.exists() else {'status':'pending_configuration','parameters':{},'kits':{}}


def number(value):
    require(type(value) in (str,int,float), 'Número inválido')
    try:
        result=Decimal(str(value))
    except Exception:
        raise Problem('Número inválido') from None
    require(result.is_finite() and 0 <= result <= 100000000, 'Número fora do limite')
    return result


def cents(value):
    return int(value.quantize(Decimal('1'),rounding=ROUND_HALF_UP))


def simulate(data, db, config):
    fields(data,['kit_id','inventory_id','channel'],['parameters','hook_petg_confirmed','hook_evidence','sale_cents','fee_quote'])
    for key in ['kit_id','inventory_id','channel']:string(data[key])
    require(data['channel'] in ('direct','mercado_livre'),'Canal inválido')
    require(data['kit_id'] in config.get('kits',{}),'Kit não cadastrado',404)
    kit=config['kits'][data['kit_id']];hook=config['hook_batch']
    inventory={i['inventory_id']:i for i in listing(db)}
    require(data['inventory_id'] in inventory,'Inventário não encontrado',404)
    material=inventory[data['inventory_id']]
    require(material['material']=='PETG','Kit exige PETG')
    values=dict(config.get('parameters',{}));overrides=data.get('parameters',{})
    require(isinstance(overrides,dict) and set(overrides)<=NUMERIC,'Parâmetros desconhecidos')
    values.update(overrides);pending=[];effective={}
    def param(key):
        entry=values.get(key)
        require(entry is None or isinstance(entry,dict), 'Parâmetro deve ter value, basis e source')
        if not entry or entry.get('value') is None:
            pending.append(key);return None
        fields(entry,['value','basis','source'])
        require(entry['basis'] in ('measured','estimated','bill_import','manual','confirmed'),'Base inválida')
        string(entry['source'],2000)
        value=number(entry['value']);effective[key]=entry
        if key in ('packaging_cents','fixed_fee_cents','shipping_cents'):require(value == value.to_integral_value(),'Centavos inteiros obrigatórios')
        if key.endswith('_bps'):require(value<=10000,'Percentual inválido')
        return value
    n={k:param(k) for k in sorted(NUMERIC)}
    confirmed=data.get('hook_petg_confirmed',hook.get('petg_profile_confirmed',False))
    require(type(confirmed) is bool,'Confirmação de PETG inválida')
    if confirmed:
        string(data.get('hook_evidence') or hook.get('profile_evidence'),2000)
    else:pending.append('hook_petg_profile_confirmation')
    grams=number(kit['ornament_grams']);hookgrams=number(hook['grams'])*kit['hooks']/hook['units']
    seconds=number(kit['print_seconds'])+number(hook['print_seconds'])*kit['hooks']/hook['units']
    preparation=n['preparation_minutes_per_hook_batch']
    prep=None if preparation is None else preparation*kit['hooks']/hook['units']
    machine_hours=seconds/3600
    replacement=material['replacement_value_cents'];nominal=material['nominal_weight_g']
    if replacement is None or not nominal:pending.append('replacement_value_or_nominal_weight')
    unit=None if replacement is None or not nominal else Decimal(replacement)/nominal
    costs={
      'ornament_material_cents':None if unit is None else cents(grams*unit),
      'hook_material_cents':None if unit is None else cents(hookgrams*unit),
      'energy_cents':None if n['power_w'] is None or n['energy_cents_kwh'] is None else cents(machine_hours*n['power_w']/1000*n['energy_cents_kwh']),
      'maintenance_cents':None if n['maintenance_cents_hour'] is None else cents(machine_hours*n['maintenance_cents_hour']),
      'depreciation_cents':None if n['depreciation_cents_hour'] is None else cents(machine_hours*n['depreciation_cents_hour']),
      'labor_cents':None if n['labor_cents_hour'] is None or n['finishing_minutes'] is None or prep is None else cents((n['finishing_minutes']+prep)*n['labor_cents_hour']/60),
      'packaging_cents':None if n['packaging_cents'] is None else cents(n['packaging_cents'])}
    # Failure provision applies to material + machine time only; already-sliced purge is NOT added again.
    failure_base=[costs[k] for k in ['ornament_material_cents','hook_material_cents','energy_cents','maintenance_cents','depreciation_cents']]
    costs['failure_cents']=None if n['failure_bps'] is None or any(x is None for x in failure_base) else cents(Decimal(sum(failure_base))*n['failure_bps']/10000)
    complete=not pending and all(v is not None for v in costs.values())
    production=sum(v for v in costs.values() if v is not None) if complete else None
    quote=data.get('fee_quote');quote_pending=[]
    if data['channel']=='mercado_livre':
        for key in ['category_id','listing_type_id','seller_reference','source','checked_at','price_cents','sales_fee_bps','fixed_fee_cents','shipping_cents','logistic_type','shipping_mode','billable_weight_g']:
            if not isinstance(quote,dict) or key not in quote:quote_pending.append('fee_quote.'+key)
    suggested=None;summary=None
    if complete:
        tax=n['tax_bps'];fee=n['sales_fee_bps'];rate=(tax+fee)/10000
        require(rate < Decimal('0.5'),'Meta de lucro 100% sobre custo total exige despesas percentuais abaixo de 50%')
        fixed=cents(n['fixed_fee_cents']);shipping=cents(n['shipping_cents'])
        def details(price):
            taxes=cents(Decimal(price)*tax/10000);commission=cents(Decimal(price)*fee/10000)
            total=production+fixed+shipping+taxes+commission;profit=price-total
            return {'production_cost_cents':production,'tax_cents':taxes,'commission_cents':commission,'fixed_fee_cents':fixed,'shipping_cents':shipping,
                    'complete_cost_cents':total,'price_cents':price,'profit_cents':profit,
                    'margin_percent':str((Decimal(profit)*100/price).quantize(Decimal('.01'))) if price else None,
                    'profit_over_complete_cost_percent':str((Decimal(profit)*100/total).quantize(Decimal('.01'))) if total else None}
        candidate=int((2*Decimal(production+fixed+shipping)/(1-2*rate)).to_integral_value(rounding=ROUND_CEILING))
        # Conservative one-cent cost buffer handles separate percentage rounding even near the limit.
        if details(candidate)['profit_cents'] < details(candidate)['complete_cost_cents']:
            candidate=int((2*Decimal(production+fixed+shipping+1)/(1-2*rate)).to_integral_value(rounding=ROUND_CEILING))
        require(candidate<=1000000000,'Preço excede limite da simulação')
        summary=details(candidate)
        if data['channel']=='mercado_livre' and not quote_pending:
            for key in ['sales_fee_bps','fixed_fee_cents','shipping_cents']:
                if number(quote[key])!=n[key]:quote_pending.append('fee_quote_mismatch.'+key)
            if quote['price_cents']!=candidate:quote_pending.append('revalidate_fees_at_suggested_price')
        suggested=candidate
        if 'sale_cents' in data:
            integer(data['sale_cents']);summary['requested_price_analysis']=details(data['sale_cents'])
    pending+=quote_pending
    if data['channel']=='mercado_livre':pending.append('seller_fee_quote_independent_verification')
    return {'status':'incomplete_simulation' if pending else 'simulation','persisted':False,'stock_changed':False,'final_price':False,
            'kit_id':data['kit_id'],'channel':data['channel'],'cost_basis':'replacement','inventory_id':data['inventory_id'],
            'acquisition_cost_used':False,'net_weight_required':False,'replacement_value_cents':replacement,'nominal_weight_g':nominal,
            'ornament_grams':str(grams),'hook_grams_allocated':str(hookgrams),'total_material_grams':str(grams+hookgrams),
            'machine_seconds_including_allocated_hooks':str(seconds),'hook_preparation_minutes_allocated':None if prep is None else str(prep),
            'shipping_weight_g':None,'material_grams_are_consumption_not_shipping_weight':True,
            'hook_costs_provisional':not confirmed,'purge_already_included':True,'failure_basis':'additional material and machine costs, not additional purge',
            'profit_target':'profit >= complete cost including selling expenses (100% markup, not 100% revenue margin)',
            'costs':costs,'known_cost_subtotal_cents':sum(v for v in costs.values() if v is not None),
            'production_cost_cents':production,'conditional_suggested_sale_cents':suggested,'analysis':summary,
            'parameters_used':effective,'pending':sorted(set(pending)),
            'fee_verification':'caller_supplied_not_verified' if data['channel']=='mercado_livre' else 'explicit_scenario_inputs'}
