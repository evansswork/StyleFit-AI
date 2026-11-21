import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

export function checkZeroBudget(config, root) {
  const errors = [];
  if (config.PAID_SERVICES_ENABLED !== 'false') {
    errors.push('PAID_SERVICES_ENABLED harus false untuk baseline Rp0.');
  }
  if (config.STYLING_ENGINE !== 'rules' || config.AI_PROVIDER !== 'none') {
    errors.push('STYLING_ENGINE harus rules dan AI_PROVIDER harus none untuk rilis tanpa model.');
  }
  for (const name of ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'FASHN_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY']) {
    if (config[name]?.trim()) errors.push(`${name} harus kosong; API cloud bukan baseline proyek.`);
  }
  for (const name of ['OLLAMA_BASE_URL', 'OLLAMA_MODEL', 'VISION_SERVICE_URL', 'TRYON_SERVICE_URL']) {
    if (config[name]?.trim()) errors.push(`${name} harus kosong; model inference tidak dipakai pada rilis ini.`);
  }

  if (config.DATABASE_URL?.trim()) {
    try {
      const url = new URL(config.DATABASE_URL);
      if (!['postgres:', 'postgresql:'].includes(url.protocol) || !localHosts.has(url.hostname)) {
        errors.push('DATABASE_URL harus memakai PostgreSQL lokal untuk baseline ini.');
      }
    } catch {
      errors.push('DATABASE_URL bukan URL PostgreSQL yang valid.');
    }
  }

  const privateRoot = path.resolve(root, 'private-data');
  const mediaRoot = path.resolve(root, config.MEDIA_ROOT || '.');
  if (mediaRoot !== privateRoot && !mediaRoot.startsWith(`${privateRoot}${path.sep}`)) {
    errors.push('MEDIA_ROOT harus berada di private-data, bukan aset publik atau layanan eksternal.');
  }
  return errors;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const defaults = parseEnv(readFileSync(path.join(root, '.env.example'), 'utf8'));
  const local = Object.assign({}, ...['.env', '.env.local'].map(name => {
    const file = path.join(root, name);
    return existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {};
  }));
  const errors = checkZeroBudget({ ...defaults, ...local, ...process.env }, root);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('PASS: konfigurasi baseline layanan Rp0.');
    console.log('Ini tidak memeriksa service hidup, lisensi model, inference, atau kesiapan aplikasi.');
  }
}
