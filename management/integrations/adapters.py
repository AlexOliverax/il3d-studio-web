"""Allowlisted tools for server-side Hermes/Marico, Lucy and ChatGPT adapters.

Tool arguments never include a URL, token, role, approver or password. Secrets are
read from private files by the host process, not exposed to a model. No redirects.
"""
import json
import os
import stat
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

PROFILES = {'marico', 'hermes', 'lucy', 'chatgpt', 'codex'}
READ_TOOLS = {'list_filaments':'filaments', 'list_products':'products', 'list_requests':'operations'}


class AdapterError(Exception):
    def __init__(self, message, status=None, retryable=False):
        super().__init__(message)
        self.status, self.retryable = status, retryable


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class AgentAdapter:
    def __init__(self, base_url, token, *, local_test=False, transport=None):
        parsed = urlparse(base_url)
        if (parsed.scheme != 'https' and not
                (local_test and parsed.scheme == 'http' and parsed.hostname in ('127.0.0.1', 'localhost'))):
            raise ValueError('HTTPS obrigatório fora de teste loopback')
        if not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment or parsed.path.rstrip('/') != '/api':
            raise ValueError('Base fixa deve terminar em /api, sem credenciais, query ou fragmento')
        if not isinstance(token, str) or not token.strip() or '\n' in token or '\r' in token:
            raise ValueError('Token ausente ou inválido')
        self._base, self._token = base_url.rstrip('/'), token.strip()
        self._transport = transport or self._http

    @classmethod
    def from_environment(cls, profile):
        if profile not in PROFILES:
            raise ValueError('Perfil desconhecido')
        prefix = 'GESTAO_' + profile.upper()
        path = Path(os.environ[prefix + '_TOKEN_FILE'])
        info = path.lstat()
        if not stat.S_ISREG(info.st_mode) or info.st_mode & 0o077:
            raise ValueError('Token precisa ser arquivo regular privado (0600), não symlink')
        return cls(os.environ[prefix + '_API_URL'], path.read_text().strip())

    def _http(self, method, path, body, headers):
        payload = None if body is None else json.dumps(body).encode()
        req = Request(self._base + path, data=payload, headers=headers, method=method)
        try:
            with build_opener(NoRedirect).open(req, timeout=15) as response:
                raw = response.read(1_000_001)
                if len(raw) > 1_000_000:
                    raise AdapterError('Resposta excedeu o limite; use paginação')
                return json.loads(raw)
        except HTTPError as error:
            # Do not include upstream body, URL or headers in errors/logs.
            raise AdapterError(f'Gestão respondeu HTTP {error.code}', error.code,
                               error.code in (429, 502, 503, 504)) from None
        except (URLError, TimeoutError, OSError):
            raise AdapterError('Falha de transporte; resultado desconhecido, preserve a chave idempotente', retryable=True) from None

    def call(self, tool, arguments):
        if not isinstance(arguments, dict):
            raise ValueError('Argumentos devem ser objeto')
        headers = {'Authorization': 'Bearer ' + self._token, 'Content-Type':'application/json'}
        if tool in READ_TOOLS:
            if set(arguments) - {'offset'}:
                raise ValueError('Parâmetro de leitura desconhecido')
            offset = arguments.get('offset', 0)
            if type(offset) is not int or not 0 <= offset <= 1_000_000:
                raise ValueError('Offset inválido')
            return self._transport('GET', '/' + READ_TOOLS[tool] + '?offset=' + str(offset), None, headers)
        if tool == 'preview_ml_listing':
            return self._transport('POST', '/marketplaces/ml/preview', arguments, headers)
        if tool == 'estimate_cost':
            return self._transport('POST', '/calculate', arguments, headers)
        if tool == 'request_operation':
            if set(arguments) != {'kind', 'payload', 'idempotency_key'}:
                raise ValueError('Solicitação exige apenas kind, payload e idempotency_key')
            from management.app import validate
            kind, payload = arguments['kind'], arguments['payload']
            if not isinstance(kind, str):
                raise ValueError('Operação inválida')
            validate(kind, payload)
            key = arguments['idempotency_key']
            if not isinstance(key, str) or not 1 <= len(key) <= 200 or any(ord(c) < 32 or ord(c) > 126 for c in key):
                raise ValueError('Chave idempotente ASCII inválida')
            headers['Idempotency-Key'] = key
            result = self._transport('POST', '/operations', {'kind':kind, 'payload':payload}, headers)
            return {'operation':result, 'requires_human_panel':result.get('status') == 'pending'}
        raise ValueError('Ferramenta não permitida; adaptadores não aprovam nem executam')


def tools_manifest():
    """OpenAI-style function schemas; can be mapped by Hermes without API credentials."""
    result = []
    for tool in READ_TOOLS:
        result.append({'type':'function','function':{'name':tool,'description':'Consulta privada paginada; não altera dados.',
            'parameters':{'type':'object','properties':{'offset':{'type':'integer','minimum':0}},'additionalProperties':False}}})
    result.append({'type':'function','function':{'name':'estimate_cost','description':'Simulação, não contabiliza nem altera preços ou estoque.',
        'parameters':{'type':'object','properties':{
            'materials':{'type':'array','items':{'type':'object','properties':{'filament_id':{'type':'string'},'grams':{'type':'integer','minimum':1}},'required':['filament_id','grams'],'additionalProperties':False}},
            'hours':{'type':'string'}, **{key:{'type':'integer','minimum':0} for key in ('power_w','energy_cents_kwh','maintenance_cents_hour','packaging_cents','sale_cents','labor_cents_hour','tax_bps','sales_fee_bps','fixed_fee_cents','shipping_cents','loss_bps','target_margin_bps')},
            'labor_hours':{'type':'string'},'basis':{'type':'string','enum':['estimate','actual_inputs']},'basis_note':{'type':'string'}},
        'required':['materials','hours','power_w','energy_cents_kwh','maintenance_cents_hour','packaging_cents','sale_cents'],'additionalProperties':False}}})
    cost_schema = next(x['function']['parameters'] for x in result if x['function']['name'] == 'estimate_cost')
    result.append({'type':'function','function':{'name':'preview_ml_listing',
        'description':'Simula preço e rascunho interno do Mercado Livre; taxas informadas, não verificadas. Não publica.',
        'parameters':{'type':'object','properties':{
            'title':{'type':'string'}, 'description':{'type':'string'},
            'category_id':{'type':'string'}, 'listing_type_id':{'type':'string'},
            'fee_source_note':{'type':'string'}, 'costs':cost_schema},
            'required':['title','description','category_id','listing_type_id','fee_source_note','costs'],
            'additionalProperties':False}}})
    result.append({'type':'function','function':{'name':'request_operation','description':'Cria pedido pendente. Exige aprovação humana no painel; nunca declarar executado sem observar status.',
        'parameters':{'type':'object','properties':{'kind':{'type':'string','enum':['filament.create','filament.update','stock.receive','stock.consume','stock.adjust','product.save','product.archive','catalog.prepare']},
        'payload':{'type':'object'},'idempotency_key':{'type':'string','description':'ID estável da intenção, preservado em retries'}},
        'required':['kind','payload','idempotency_key'],'additionalProperties':False}}})
    return result


def dispatch(profile, tool, arguments, *, intent_id=None):
    """Host bridge: durable intent ID is owned by the orchestrator, not the model."""
    if tool == 'request_operation':
        import hashlib
        if not isinstance(intent_id, str) or not intent_id or len(intent_id) > 200:
            raise ValueError('Solicitação exige intent_id persistente do orquestrador')
        if set(arguments) != {'kind', 'payload'}:
            raise ValueError('O modelo não escolhe chave idempotente ou identidade')
        key = hashlib.sha256((profile + ':' + intent_id).encode()).hexdigest()
        arguments = {**arguments, 'idempotency_key':key}
    return AgentAdapter.from_environment(profile).call(tool, arguments)


def model_tools(api_format='responses'):
    """Schemas for host dispatch; never expose an approval tool or arbitrary HTTP."""
    tools = tools_manifest()
    for item in tools:
        fn = item['function']
        fn['strict'] = False  # operation payload is a discriminated, backend-validated object
        if fn['name'] == 'request_operation':
            fn['parameters']['properties'].pop('idempotency_key')
            fn['parameters']['required'].remove('idempotency_key')
    if api_format == 'chat_completions':
        return tools
    if api_format == 'responses':
        return [{'type':'function', **item['function']} for item in tools]
    raise ValueError('Formato desconhecido')
