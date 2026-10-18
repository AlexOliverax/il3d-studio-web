"""Real-browser smoke test with disposable SQLite and loopback-only HTTP server."""
import os
import pytest
from pathlib import Path
from threading import Thread

from playwright.sync_api import expect, sync_playwright
from werkzeug.serving import make_server
from management.tests.test_management import app, PASSWORD  # noqa: F401; pytest fixture


@pytest.mark.parametrize("width", [1280, 390])
def test_browser_flow(app, tmp_path, width):
    server = make_server('127.0.0.1', 0, app, threaded=True)
    origin = f'http://127.0.0.1:{server.server_port}'
    app.config['ORIGIN'] = origin
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        with sync_playwright() as p:
            options = {'headless':True}
            if os.environ.get('BROWSER_EXECUTABLE'):
                options['executable_path'] = os.environ['BROWSER_EXECUTABLE']
            browser = p.chromium.launch(**options)
            page = browser.new_page(viewport={'width':width,'height':900})
            errors = []
            page.on('pageerror',lambda e: errors.append(str(e)))
            page.goto(origin)
            page.locator('#login [name=name]').fill('AdminTesteA')
            page.locator('#login [name=password]').fill(PASSWORD)
            page.get_by_role('button',name='Entrar',exact=True).click()
            expect(page.locator('#workspace')).to_be_visible()
            page.locator('#filament [name=name]').fill('PLA navegador')
            page.locator('#filament [name=material]').fill('PLA')
            page.locator('#filament [name=color]').fill('Azul')
            page.locator('#filament [name=spool_weight_g]').fill('1000')
            page.locator('#filament [name=price]').fill('100')
            page.locator('#filament button').click()
            expect(page.locator('#notice')).to_contain_text('registrada')
            expect(page.locator('#filament-list')).to_contain_text('Nenhum filamento')

            def approve():
                page.locator('[data-tab=operations]').click()
                page.get_by_role('button',name='Revisar e aprovar',exact=True).first.click()
                expect(page.locator('#confirm-dialog')).to_be_visible()
                page.locator('#confirm [name=password]').fill(PASSWORD)
                page.locator('#confirm [name=explicit]').check()
                page.get_by_role('button',name='Confirmar decisão',exact=True).click()
                expect(page.locator('#confirm-dialog')).not_to_be_visible()
                expect(page.locator('#notice')).to_contain_text('auditada')

            approve()
            page.locator('[data-tab=filaments]').click()
            expect(page.locator('#filament-list')).to_contain_text('0 g disponíveis')
            page.locator('#stock [name=grams]').fill('1000')
            page.locator('#stock [name=reason]').fill('Entrada de teste')
            page.locator('#stock button').click()
            expect(page.locator('#notice')).to_contain_text('registrada')
            approve()
            page.locator('[data-tab=filaments]').click()
            expect(page.locator('#filament-list')).to_contain_text('1000 g disponíveis')
            page.locator('[data-tab=calculator]').click()
            page.locator('#calc-materials input').fill('100')
            for name,value in {'hours':'2.5','power_w':'200','energy':'1','maintenance':'1','packaging':'2','sale':'50','labor_hours':'1.5','labor':'10','tax':'6','fee':'4','fixed_fee':'1','loss':'10','target_margin':'20'}.items():
                page.locator(f'#calculator [name={name}]').fill(value)
            page.get_by_role('button',name='Calcular',exact=True).click()
            expect(page.locator('#calc-result')).to_contain_text('Margem: 26.00%')
            evidence_dir = Path(os.environ.get('GESTAO_EVIDENCE_DIR', str(tmp_path)))
            evidence_dir.mkdir(parents=True,exist_ok=True)
            page.screenshot(path=str(evidence_dir/f'pricing-{width}.png'),full_page=True)
            page.locator('[data-tab=products]').click()
            page.locator('#product [name=name]').fill('Produto de teste')
            page.locator('#product [name=description]').fill('Rascunho privado')
            page.locator('#product [name=images]').fill('https://example.com/test.png')
            page.locator('#product-materials input').fill('100')
            page.locator('#product [name=cost]').fill('15')
            page.locator('#product [name=sale]').fill('30')
            page.locator('#product button').click()
            expect(page.locator('#notice')).to_contain_text('registrada')
            approve()
            page.locator('[data-tab=products]').click()
            expect(page.locator('#product-list')).to_contain_text('Rascunho')
            page.get_by_role('button',name='Solicitar aprovação de catálogo',exact=True).click()
            expect(page.locator('#notice')).to_contain_text('registrada')
            approve()
            page.locator('[data-tab=products]').click()
            expect(page.locator('#product-list')).to_contain_text('Pronto para publicação futura')
            page.screenshot(path=str(evidence_dir/f'products-{width}.png'),full_page=True)
            # Mobile layout and no horizontal overflow.
            page.set_viewport_size({'width':390,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
            page.screenshot(path=str(tmp_path/'gestao-mobile.png'),full_page=True)
            page.locator('[data-tab=history]').click()
            expect(page.locator('#audit-list')).to_contain_text('gestao-backend:v1')
            page.get_by_role('button',name='Sair',exact=True).click()
            expect(page.locator('#login-panel')).to_be_visible()
            assert page.request.get(origin+'/api/filaments').status == 401
            assert errors == []
            browser.close()
    finally:
        server.shutdown()
        thread.join(timeout=5)
        server.server_close()
