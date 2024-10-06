-- Migration number: 0001 	 2024-10-05T21:16:11.234Z
DROP TABLE IF EXISTS reactions;
CREATE TABLE IF NOT EXISTS reactions
    (id INTEGER PRIMARY KEY, org TEXT, instanceId TEXT, emoji TEXT, createdAt DEFAULT CURRENT_TIMESTAMP );
INSERT INTO reactions 
    (id, org, instanceId, emoji) VALUES 
        (1, '127.0.0.1:8080', 'abcd', '😄'),
        (2, '127.0.0.1:8080', 'abcd', '😄'),
        (3, '127.0.0.1:8080', 'abcd', '👀');
