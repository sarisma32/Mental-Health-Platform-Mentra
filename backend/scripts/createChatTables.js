import pool from '../db/index.js';

const createTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id VARCHAR(64) PRIMARY KEY,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id BIGSERIAL PRIMARY KEY,
      conversation_id VARCHAR(64) NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
      role VARCHAR(10) NOT NULL CHECK (role IN ('user', 'bot')),
      text TEXT NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_chat_convs_patient ON chat_conversations(patient_id);
    CREATE INDEX IF NOT EXISTS idx_chat_msgs_conv ON chat_messages(conversation_id);
  `);
  console.log('Chat tables created.');
  await pool.end();
};

createTables().catch(err => { console.error(err); process.exit(1); });
