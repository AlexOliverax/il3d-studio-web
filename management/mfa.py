"""TOTP for explicitly provisioned demonstration accounts (RFC 6238)."""
import base64
import hashlib
import hmac
import json
import os
import stat
import struct
from pathlib import Path


def code(secret, step, digits=6):
    key = base64.b32decode(secret, casefold=False)
    digest = hmac.new(key, struct.pack('>Q', step), hashlib.sha1).digest()
    offset = digest[-1] & 15
    number = struct.unpack('>I', digest[offset:offset+4])[0] & 0x7fffffff
    return str(number % (10 ** digits)).zfill(digits)


def matching_step(secret, supplied, now):
    if not isinstance(supplied, str) or len(supplied) != 6 or not supplied.isascii() or not supplied.isdigit():
        return None
    step = int(now) // 30
    for candidate in (step, step-1, step+1):
        if candidate >= 0 and hmac.compare_digest(code(secret, candidate), supplied):
            return candidate
    return None


def load_secrets(path):
    path = Path(path)
    mode = path.stat()
    if not stat.S_ISREG(mode.st_mode) or mode.st_mode & 0o077 or mode.st_uid != os.getuid():
        raise ValueError('MFA file must be owned by the service user and mode 0600')
    data = json.loads(path.read_text())
    if not isinstance(data, dict) or not data:
        raise ValueError('MFA provisioning is required')
    for name, secret in data.items():
        if not isinstance(name,str) or not isinstance(secret,str) or len(base64.b32decode(secret)) < 20:
            raise ValueError('Invalid MFA provisioning')
    return data
