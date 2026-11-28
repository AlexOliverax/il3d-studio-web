"""Official-reference lookup and explicit bill/manual simulation; never chooses a generic tariff."""
from datetime import date
from decimal import Decimal
import re
from management.app import fields, require, string, integer
from management.production_pricing import number

TARIFF_URL='https://www.enel.com.br/pt-saopaulo/Para_Voce/tarifa-energia-eletrica.html'
FLAG_URL='https://www.gov.br/aneel/pt-br/assuntos/noticias/2026-defeso-eleitoral/outubro-tera-bandeira-verde-contas-de-luz-sem-custo-extra'
TAX_URL='https://www.enel.com.br/pt-saopaulo/Para_Voce/tarifa-taxas-e-impostos.html'


def reference(data):
    fields(data,[],['cep','address','city','district','state','modality'])
    for key,value in data.items():string(value,500)
    if 'cep' in data:require(re.fullmatch(r'\d{5}-?\d{3}',data['cep']) is not None,'CEP inválido')
    # Address lookup is not an address-to-utility oracle. No third-party transfer of residence data.
    sp=data.get('city','').casefold() in ('são paulo','sao paulo') and data.get('state','').upper()=='SP'
    return {'status':'residence_confirmation_pending','distributor_candidate':'Enel Distribuição São Paulo' if sp else None,
            'distributor_confirmed':False,'address_geocoded':False,'modality_confirmed':False,
            'effective_cents_kwh':None,'lookup_method':'reviewed_official_snapshot_not_live_cep_resolution',
            'consulted_at':'2026-10-22','source':TARIFF_URL,'resolution':'3596/2026','valid_from':'2026-07-04','valid_until':None,
            'reference_needs_refresh':date.today().isoformat()!='2026-10-22',
            'published_b1_conventional':{'tusd_brl_kwh':'0.47242','te_brl_kwh':'0.31696','sum_brl_kwh':'0.78938','includes':['TE','TUSD'],'excludes':['ICMS','PIS','COFINS','CIP/COSIP','fixed charges','flag surcharge']},
            'published_b1_white_brl_kwh':{'peak':'1.48030','intermediate':'0.98450','off_peak':'0.66924'},
            'flag':{'name':'green','surcharge_brl_kwh':'0','valid_from':'2026-10-01','valid_until':'2026-10-31','source':FLAG_URL,'current_month_confirmed':date.today().isoformat().startswith('2026-10')},
            'tax_source':TAX_URL,'pending':['confirm distributor and tariff modality from bill','effective variable cost with taxes','postcode/address confirmation if only CEP supplied'],
            'manual_fallback':'POST /api/energy/manual or /api/energy/bill; no tariff automatically applied'}


def manual(data):
    fields(data,['effective_cents_kwh','source','reference_month','includes_taxes','includes_flag'])
    number(data['effective_cents_kwh']);string(data['source'],2000)
    require(re.fullmatch(r'\d{4}-\d{2}',data['reference_month']) is not None,'Mês inválido')
    require(type(data['includes_taxes']) is bool and type(data['includes_flag']) is bool,'Declare inclusões')
    return {**data,'basis':'manual','verified':False,'persisted':False,'pending':[] if data['includes_taxes'] and data['includes_flag'] else ['missing_taxes_or_flag']}


def bill(data):
    fields(data,['consumed_kwh','total_cents','line_items','reference_month','distributor','modality','source','variable_lines_include_taxes','variable_lines_include_flag'])
    kwh=number(data['consumed_kwh']);require(kwh>0,'Consumo deve ser positivo')
    integer(data['total_cents']);string(data['source'],2000);string(data['distributor']);string(data['modality'])
    require(isinstance(data['reference_month'],str) and re.fullmatch(r'\d{4}-\d{2}',data['reference_month']) is not None,'Mês inválido')
    for key in ['variable_lines_include_taxes','variable_lines_include_flag']:require(type(data[key]) is bool,'Declare tributos/bandeira')
    require(isinstance(data['line_items'],list) and 0<len(data['line_items'])<=100,'Itens inválidos')
    variable=0;excluded=0;unknown=[];total=0;seen=set()
    for item in data['line_items']:
        fields(item,['id','description','amount_cents','kind']);string(item['id']);string(item['description'])
        require(item['id'] not in seen,'Linha duplicada');seen.add(item['id'])
        integer(item['amount_cents'],-100000000,100000000)
        require(item['kind'] in ('variable_energy','cip','fixed','penalty','other','unclassified'),'Classificação inválida')
        total+=item['amount_cents']
        if item['kind']=='variable_energy':variable+=item['amount_cents']
        elif item['kind']=='unclassified':unknown.append(item['id'])
        else:excluded+=item['amount_cents']
    require(total==data['total_cents'],'Linhas não conciliam com total da fatura')
    require(variable>=0,'Custo variável negativo não utilizável')
    pending=['unclassified:'+x for x in unknown]
    if not data['variable_lines_include_taxes']:pending.append('taxes_not_confirmed')
    if not data['variable_lines_include_flag']:pending.append('flag_not_confirmed')
    return {'status':'incomplete' if pending else 'bill_input_simulation','persisted':False,'basis':'bill_import','source':data['source'],
            'reference_month':data['reference_month'],'distributor':data['distributor'],'modality':data['modality'],
            'consumed_kwh':str(kwh),'variable_cents':variable,'excluded_cents':excluded,
            'effective_cents_kwh':None if pending else str((Decimal(variable)/kwh).quantize(Decimal('.000001'))),
            'pending':pending,'note':'Use only variable energy lines with taxes included once; tax disclosure is not another charge. This is period-average variable cost, not a guaranteed marginal tariff; minimum billing/social tariff/time-of-use need review.'}
