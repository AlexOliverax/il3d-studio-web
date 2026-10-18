"""SQLite online backup and verified restore to a NEW path, never in-place."""
import argparse
import os
import sqlite3
from pathlib import Path


def snapshot(source, destination):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    if not source.is_file() or destination.exists():
        raise ValueError('Origem deve existir e destino deve ser novo')
    os.umask(0o077)
    destination.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    # Exclusive creation avoids overwriting a destination created concurrently.
    fd = os.open(destination, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    os.close(fd)
    with sqlite3.connect(source.as_uri()+'?mode=ro',uri=True) as src:
        with sqlite3.connect(destination) as dst:
            src.backup(dst)
            if dst.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                raise RuntimeError('Falha de integridade; destino não pode ser usado')
            if dst.execute('PRAGMA foreign_key_check').fetchall():
                raise RuntimeError('Falha de chaves estrangeiras')
    return destination


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source',required=True)
    parser.add_argument('--destination',required=True)
    args = parser.parse_args()
    snapshot(args.source,args.destination)
    print('Cópia SQLite verificada em destino novo. Origem não alterada.')
