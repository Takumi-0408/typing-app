import { writeFileSync } from 'node:fs'
import { PROBLEMS } from '../src/data/problems.ts'

function esc(value: string): string {
  return value.replaceAll("'", "''")
}

const rows = PROBLEMS.map((item) => {
  return `  ('${esc(item.id)}', '${item.difficulty}', '${esc(item.tag)}', '${esc(item.channel)}', '${esc(item.senderName)}', '${esc(item.senderRole)}', '${esc(item.incoming)}', '${esc(item.reply)}', '${esc(item.reading)}')`
})

const sql = `DELETE FROM problems;
INSERT INTO problems (id, difficulty, tag, channel, sender_name, sender_role, incoming, reply, reading) VALUES
${rows.join(',\n')};
`

writeFileSync(new URL('../seeds/problems.sql', import.meta.url), sql)
console.log(`wrote ${PROBLEMS.length} problems`)
