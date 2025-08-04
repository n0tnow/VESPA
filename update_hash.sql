-- Update admin user with correct bcrypt hash
UPDATE users 
SET password_hash = '$2b$12$wHSfOoduxry0l19yUwSlduwb8T962nrzjYbrWh0tKk76HQAs0s6AW'
WHERE username = 'admin';

SELECT * FROM users WHERE username = 'admin';