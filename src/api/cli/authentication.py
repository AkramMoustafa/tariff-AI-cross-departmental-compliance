from passlib.hash import argon2


def hash_password(password: str) -> str:
    return argon2.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return argon2.verify(password, password_hash)


def verify_and_rehash_password(
    password: str,
    password_hash: str,
) -> tuple[bool, str | None]:
    """
    Verify password and return (is_valid, new_hash_if_upgraded).
    """
    valid = argon2.verify(password, password_hash)
    if not valid:
        return False, None

    if argon2.needs_update(password_hash):
        return True, argon2.hash(password)

    return True, None

def hash_secret(secret: str) -> str:
    """
    Hash an API client secret.
    """
    return argon2.hash(secret)


def verify_secret(secret: str, secret_hash: str) -> bool:
    """
    Verify API client secret.
    """
    return argon2.verify(secret, secret_hash)