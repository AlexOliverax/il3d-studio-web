import json
import os
import pytest
from management.app import connect
from management.integrations.adapters import AgentAdapter, tools_manifest
from management.tests.test_management import app, client, FILAMENT, propose, decide  # noqa: F401


def adapter_for(app):
    client = app.test_client()
    def transport(method,path,body,headers):
        result = client.open('/api'+path,method=method,json=body,headers=headers)
        return {'http_status':result.status_code,**(result.json or {})}
    return AgentAdapter('http://127.0.0.1/api','test-agent',local_test=True,transport=transport)


def test_adapter_request_cannot_execute(app,client):
    a = adapter_for(app)
    args = {'kind':'filament.create','payload':FILAMENT,'idempotency_key':'intent-test-001'}
    first = a.call('request_operation',args)
    second = a.call('request_operation',args)
    assert first['requires_human_panel'] is True
    assert first['operation']['id'] == second['operation']['id']
    assert a.call('list_filaments',{})['items'] == []
    assert decide(client,first['operation']).status_code == 200
    assert len(a.call('list_filaments',{})['items']) == 1


@pytest.mark.parametrize('tool',['approve','reject','execute','login','http','delete','publish'])
def test_adapter_has_no_escape_hatch(app,tool):
    with pytest.raises(ValueError):
        adapter_for(app).call(tool,{})


def test_backend_scopes_enforced_and_own_operations_only(app,client):
    a = adapter_for(app)
    restricted = app.test_client()
    for path in ('audit','movements','identities'):
        assert restricted.get('/api/'+path,headers={'Authorization':'Bearer test-agent'}).status_code == 403
    own = a.call('request_operation',{'kind':'filament.create','payload':FILAMENT,'idempotency_key':'own'})['operation']
    propose(client,key='human')
    assert [x['id'] for x in a.call('list_requests',{})['items']] == [own['id']]
    db = connect(app.config['DATABASE'])
    db.execute('UPDATE agents SET scopes=?',(json.dumps(['products:read']),))
    assert a.call('list_filaments',{})['http_status'] == 403
    assert a.call('list_products',{})['http_status'] == 200
    assert a.call('request_operation',{'kind':'filament.create','payload':FILAMENT,'idempotency_key':'no'})['operation']['http_status'] == 403
    db.execute('UPDATE agents SET active=0')
    assert a.call('list_products',{})['http_status'] == 401
    db.close()


def test_private_tokens_not_in_tools_or_errors(tmp_path,monkeypatch):
    token_file = tmp_path/'token'; token_file.write_text('synthetic-secret'); token_file.chmod(0o600)
    for profile in ('marico','hermes','lucy','chatgpt'):
        monkeypatch.setenv('GESTAO_'+profile.upper()+'_TOKEN_FILE',str(token_file))
        monkeypatch.setenv('GESTAO_'+profile.upper()+'_API_URL','https://gestao.invalid/api')
        assert AgentAdapter.from_environment(profile)
    token_file.chmod(0o644)
    with pytest.raises(ValueError):
        AgentAdapter.from_environment('lucy')
    assert 'synthetic-secret' not in json.dumps(tools_manifest())
    assert not any('approve' in t['function']['name'] for t in tools_manifest())


@pytest.mark.parametrize('url',['http://evil.invalid/api','https://user:pass@host/api','https://host/api?token=x','https://host/api#x','https://host/other'])
def test_adapter_base_url_validation(url):
    with pytest.raises(ValueError):
        AgentAdapter(url,'synthetic')


def test_host_owns_idempotency_key(monkeypatch):
    from management.integrations.adapters import dispatch, model_tools
    captured = []
    class Fake:
        def call(self,tool,args):
            captured.append(args)
            return {'ok':True}
    monkeypatch.setattr(AgentAdapter,'from_environment',lambda profile: Fake())
    args = {'kind':'filament.create','payload':FILAMENT}
    for _ in range(2):
        dispatch('lucy','request_operation',args,intent_id='host-record-1')
    assert captured[0]['idempotency_key'] == captured[1]['idempotency_key']
    with pytest.raises(ValueError):
        dispatch('lucy','request_operation',{**args,'idempotency_key':'model-key'},intent_id='host-record-1')
    for fmt in ('responses','chat_completions'):
        schemas = model_tools(fmt)
        assert len(schemas) == 5
        assert 'idempotency_key' not in json.dumps(schemas)


def test_redirect_does_not_forward_credentials():
    from http.server import BaseHTTPRequestHandler, HTTPServer
    from threading import Thread
    from management.integrations.adapters import AdapterError
    paths = []
    class Handler(BaseHTTPRequestHandler):
        def log_message(self,*args):
            pass
        def do_GET(self):
            paths.append(self.path)
            self.send_response(302)
            self.send_header('Location','/capture')
            self.end_headers()
    server = HTTPServer(('127.0.0.1',0),Handler)
    thread = Thread(target=server.serve_forever,daemon=True); thread.start()
    try:
        a = AgentAdapter(f'http://127.0.0.1:{server.server_port}/api','synthetic-test-token',local_test=True)
        with pytest.raises(AdapterError) as error:
            a.call('list_filaments',{})
        assert error.value.status == 302
        assert paths == ['/api/filaments?offset=0']
        assert 'synthetic-test-token' not in str(error.value)
    finally:
        server.shutdown(); thread.join(); server.server_close()
