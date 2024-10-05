DROP TABLE IF EXISTS reactions;
CREATE TABLE IF NOT EXISTS reactions
    (id INTEGER PRIMARY KEY, org TEXT, instanceId TEXT, emoji TEXT, count INTEGER);
INSERT INTO reactions 
    (id, org, instanceId, emoji, count) VALUES 
        (1, '127.0.0.1:8080', 'abcd', '😄', 2),
        (2, '127.0.0.1:8080', 'abcd', '👀', 1);