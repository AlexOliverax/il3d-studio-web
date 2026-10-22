"""Read-only ML planning. No OAuth, marketplace calls, persistence or publishing."""
from management.app import calculate, fields, require, string


def preview(data, db):
    fields(data, ['title', 'description', 'category_id', 'listing_type_id', 'fee_source_note', 'costs'])
    for key, limit in [('title',200),('description',10000),('category_id',100),('listing_type_id',100),('fee_source_note',1000)]:
        string(data[key],limit)
    require(isinstance(data['costs'],dict), 'Custos obrigatórios')
    require({'sales_fee_bps','fixed_fee_cents','shipping_cents','tax_bps','target_margin_bps'} <= data['costs'].keys(),
            'Informe explicitamente comissão, tarifa fixa, frete do vendedor, impostos e margem; zero somente quando aplicável')
    result = calculate(data['costs'],db)
    return {'marketplace':'mercado_livre','currency':'BRL','status':'draft_preview',
            'persisted':False,'published':False,'requires_admin_approval':True,
            'fee_verification':'unverified_user_inputs','fee_source_note':data['fee_source_note'],
            'pricing':result,
            'draft':{'title':data['title'],'description':data['description'],
                     'category_id':data['category_id'],'listing_type_id':data['listing_type_id'],
                     'suggested_price_cents':result['suggested_sale_cents']},
            'warnings':['Rascunho interno, não é payload validado para publicação.',
                        'Taxas e frete não consultados no Mercado Livre; recalcular para categoria, modalidade, vendedor e preço final antes de aprovar.',
                        'Nenhuma reserva de estoque, mudança de preço cadastrado ou publicação realizada.']}
