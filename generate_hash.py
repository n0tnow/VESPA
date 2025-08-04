import bcrypt

# Generate correct hash for admin123
password = 'admin123'
password_bytes = password.encode('utf-8')
salt = bcrypt.gensalt()
hash_bytes = bcrypt.hashpw(password_bytes, salt)
hash_str = hash_bytes.decode('utf-8')

print(f"Password: {password}")
print(f"Correct hash: {hash_str}")

# Test verification
test_result = bcrypt.checkpw(password_bytes, hash_bytes)
print(f"Verification test: {test_result}")