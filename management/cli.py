"""Local administration only. No default credentials and no secrets in arguments."""
import argparse
import getpass
import os
import secrets
import time
import uuid
from pathlib import Path
from werkzeug.security import generate_password_hash
from management.app import audit, connect, create_app, digest, transaction


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['init', 'admin', 'agent', 'revoke-agent', 'disable-admin', 'serve'])
    parser.add_argument('--database', required=True)
    parser.add_argument('--name')
    parser.add_argument('--port', type=int, default=8787)
    args = parser.parse_args()
    path = Path(args.database).resolve()
    os.umask(0o077)
    if args.command == 'init':
        if path.exists():
            parser.error('Banco já existe; nenhuma alteração feita')
        path.parent.mkdir(parents=True, exist_ok=True)
        with connect(path) as db:
            db.executescript((Path(__file__).parent / 'schema.sql').read_text())
        path.chmod(0o600)
        print('Banco vazio criado. Nenhum dado de produção foi importado.')
        return
    if not path.exists():
        parser.error('Inicialize um banco isolado primeiro')
    if args.command == 'serve':
        app = create_app({'DATABASE': str(path), 'ORIGIN': f'http://127.0.0.1:{args.port}', 'COOKIE_SECURE': False})
        app.run(host='127.0.0.1', port=args.port, debug=False)
        return
    if not args.name or len(args.name) > 100:
        parser.error('--name obrigatório, até 100 caracteres')
    db = connect(path)
    with transaction(db):
        if args.command == 'admin':
            password = getpass.getpass('Senha nova (mínimo 12 caracteres): ')
            if len(password) < 12 or len(password) > 1024 or password != getpass.getpass('Repita: '):
                parser.error('Senha inválida ou confirmação divergente')
            if db.execute('SELECT id FROM users WHERE name=?', (args.name,)).fetchone():
                parser.error('Administrador já existe; não será sobrescrito')
            db.execute('INSERT INTO users(id,name,password_hash) VALUES(?,?,?)',
                       (str(uuid.uuid4()), args.name, generate_password_hash(password)))
        elif args.command == 'agent':
            token = secrets.token_urlsafe(48)
            db.execute('INSERT INTO agents(id,name,token_hash,expires) VALUES(?,?,?,?)',
                       (str(uuid.uuid4()), args.name, digest(token), int(time.time()) + 90 * 86400))
        elif args.command == 'revoke-agent':
            db.execute('UPDATE agents SET active=0 WHERE name=?', (args.name,))
        elif args.command == 'disable-admin':
            db.execute('UPDATE users SET active=0 WHERE name=?', (args.name,))
            db.execute('DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE name=?)', (args.name,))
        audit(db, None, args.command, 'operator:local', {'name': args.name}, executor='gestao-cli:v1')
    db.close()
    if args.command == 'agent':
        print('Token mostrado uma única vez; armazene no cofre do agente:')
        print(token)
    else:
        print('Concluído.')


if __name__ == '__main__':
    main()
