import pytest
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)


def test_password_hash_and_verify():
    hashed = hash_password("mysecret")
    assert verify_password("mysecret", hashed)
    assert not verify_password("wrongpassword", hashed)


def test_access_token_decode():
    token = create_access_token("user-123")
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_refresh_token_decode():
    token = create_refresh_token("user-456")
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "user-456"
    assert payload["type"] == "refresh"


def test_invalid_token_returns_none():
    result = decode_token("not-a-valid-token")
    assert result is None


def test_wrong_secret_returns_none():
    # Create token then tamper with it
    token = create_access_token("user-789")
    tampered = token[:-5] + "XXXXX"
    assert decode_token(tampered) is None
