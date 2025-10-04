exports.up = (pgm) => {
  // Cria a tabela 'spans'
  pgm.createTable('spans', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    trace_id: { type: 'varchar(255)', notNull: true },
    span_id: { type: 'varchar(255)', notNull: true },
    parent_span_id: { type: 'varchar(255)' },
    service_name: { type: 'varchar(255)', notNull: true },
    operation_name: { type: 'varchar(255)', notNull: true },
    start_time: { type: 'timestamptz', notNull: true },
    end_time: { type: 'timestamptz', notNull: true },
    duration_ms: { type: 'integer', notNull: true },
    kind: { type: 'varchar(50)' },
    status: { type: 'varchar(50)', notNull: true },
    attributes: { type: 'jsonb' },
    error: { type: 'jsonb' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  // Cria índices para colunas que serão consultadas com frequência para melhorar a performance
  pgm.createIndex('spans', 'trace_id');
  pgm.createIndex('spans', 'service_name');
  pgm.createIndex('spans', 'created_at');
};

exports.down = (pgm) => {
  // A função 'down' reverte o que a função 'up' faz
  pgm.dropTable('spans');
};
