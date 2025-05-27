-- Insert test users that match Clerk user IDs
-- Replace the user IDs with your actual Clerk user IDs

-- Your actual user ID from the error log
INSERT INTO users (id, email, first_name, last_name) 
VALUES ('user_2xfAbaOK5gck4IsZR06x2zFWZKn', 'your-email@gmail.com', 'Your', 'Name')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Additional test users (common Clerk ID patterns)
INSERT INTO users (id, email, first_name, last_name) 
VALUES 
  ('user_2AbCdEfGhIjKlMnOpQrStUvWx', 'test1@doodad.ai', 'Test', 'User1'),
  ('user_2XyZaBcDeFgHiJkLmNoPqRsTu', 'test2@doodad.ai', 'Test', 'User2'),
  ('user_2QwErTyUiOpAsDfGhJkLzXcVb', 'admin@doodad.ai', 'Admin', 'User')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Verify the users were created
SELECT * FROM users; 