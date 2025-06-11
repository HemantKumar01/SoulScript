import os
import base64
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import secrets

# Get master key from environment variable
MASTER_KEY = os.getenv('NEXT_PUBLIC_ENCRYPTION_KEY')

def derive_key(password: str, salt: bytes) -> bytes:
    """
    Derives a crypto key from a password using PBKDF2
    
    Args:
        password: The password string
        salt: Random salt bytes
        
    Returns:
        bytes: 32-byte derived key
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # 256 bits
        salt=salt,
        iterations=100000,
        backend=default_backend()
    )
    return kdf.derive(password.encode('utf-8'))

def encrypt(data: str, encryption_key: str) -> str:
    """
    Encrypts data using AES-GCM
    
    Args:
        data: The string data to encrypt
        encryption_key: The password/key to use for encryption
        
    Returns:
        str: Base64 encoded encrypted data with salt and nonce
        
    Raises:
        ValueError: If data or encryption_key is empty
    """
    if not data or not encryption_key:
        raise ValueError('Data and encryption key are required')
    
    # Generate random salt and nonce
    salt = secrets.token_bytes(16)  # 16 bytes salt
    nonce = secrets.token_bytes(12)  # 12 bytes nonce for AES-GCM
    
    # Derive key from password
    key = derive_key(encryption_key, salt)
    
    # Create AESGCM instance and encrypt
    aesgcm = AESGCM(key)
    encrypted = aesgcm.encrypt(nonce, data.encode('utf-8'), None)
    
    # Combine salt + nonce + encrypted data
    combined = salt + nonce + encrypted
    
    # Convert to base64 for easy storage/transmission
    return base64.b64encode(combined).decode('utf-8')

def decrypt(encrypted_data: str, encryption_key: str) -> str:
    """
    Decrypts data using AES-GCM
    
    Args:
        encrypted_data: Base64 encoded encrypted data
        encryption_key: The password/key used for encryption
        
    Returns:
        str: The decrypted string
        
    Raises:
        ValueError: If encrypted_data or encryption_key is empty
        Exception: If decryption fails
    """
    if not encrypted_data or not encryption_key:
        raise ValueError('Encrypted data and encryption key are required')
    
    try:
        # Convert from base64
        combined = base64.b64decode(encrypted_data.encode('utf-8'))
        
        # Extract salt, nonce, and encrypted data
        salt = combined[:16]
        nonce = combined[16:28]
        encrypted = combined[28:]
        
        # Derive key from password
        key = derive_key(encryption_key, salt)
        
        # Create AESGCM instance and decrypt
        aesgcm = AESGCM(key)
        decrypted = aesgcm.decrypt(nonce, encrypted, None)
        
        return decrypted.decode('utf-8')
    
    except Exception as error:
        raise Exception(f'Decryption failed: Invalid data or wrong key - {str(error)}')

# Export the functions and master key
__all__ = ['encrypt', 'decrypt', 'MASTER_KEY']