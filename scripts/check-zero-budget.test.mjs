import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { checkZeroBudget } from './check-zero-budget.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const defaults = parseEnv(readFileSync(new URL('../.env.example', import.meta.url), 'utf8'));
const audit = (overrides = {}) => checkZeroBudget({ ...defaults, ...overrides }, root);

test('baseline can run its check without accounts or paid secrets', () => {
  assert.deepEqual(audit(), []);
});

test('enabling paid services fails closed', () => {
  assert.match(audit({ PAID_SERVICES_ENABLED: 'true' }).join(' '), /PAID_SERVICES_ENABLED/);
});

test('legacy paid keys are rejected without disclosing values', () => {
  const secret = 'private-test-value-do-not-log';
  for (const name of ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'FASHN_API_KEY']) {
    const result = audit({ [name]: secret }).join(' ');
    assert.ok(result.includes(name));
    assert.ok(!result.includes(secret));
  }
});

test('inference endpoints are disabled, including local endpoints', () => {
  for (const name of ['OLLAMA_BASE_URL', 'VISION_SERVICE_URL', 'TRYON_SERVICE_URL']) {
    for (const value of ['https://api.example.com', 'http://127.0.0.1:11434', 'not-a-url']) {
      assert.ok(audit({ [name]: value }).some(error => error.includes(name)));
    }
  }
});

test('rules and no provider are required', () => {
  for (const config of [{ STYLING_ENGINE: 'llm' }, { AI_PROVIDER: 'groq' }, { AI_PROVIDER: '' }]) {
    assert.ok(audit(config).some(error => error.includes('AI_PROVIDER')));
  }
});

test('new cloud keys are rejected even if the provider flag says none', () => {
  for (const name of ['GROQ_API_KEY', 'OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY']) {
    const result = audit({ [name]: 'sensitive-test-key' }).join(' ');
    assert.ok(result.includes(name));
    assert.ok(!result.includes('sensitive-test-key'));
  }
});

test('local or cloud models cannot accidentally become dependencies', () => {
  for (const model of ['qwen3-vl:4b', 'qwen3-vl:235b-cloud']) {
    assert.ok(audit({ OLLAMA_MODEL: model }).some(error => error.includes('OLLAMA_MODEL')));
  }
});

test('blank database is allowed before accounts; remote databases are not baseline', () => {
  assert.deepEqual(audit({ DATABASE_URL: '' }), []);
  assert.deepEqual(audit({ DATABASE_URL: 'postgresql://app:secret@localhost:5432/stylefit' }), []);
  assert.ok(audit({ DATABASE_URL: 'postgresql://app:secret@db.example.com/stylefit' })
    .some(error => error.includes('DATABASE_URL')));
});

test('media cannot be configured in public assets or outside private-data', () => {
  for (const value of ['./public/uploads', './private-data/../../public', '/tmp/media']) {
    assert.ok(audit({ MEDIA_ROOT: value }).some(error => error.includes('MEDIA_ROOT')));
  }
});

test('CLI uses environment overrides and returns failure without leaking a key', () => {
  const secret = 'cli-private-test-value';
  const result = spawnSync(process.execPath, ['scripts/check-zero-budget.mjs'], {
    cwd: root,
    env: { ...process.env, ...defaults, GEMINI_API_KEY: secret },
    encoding: 'utf8',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /GEMINI_API_KEY/);
  assert.ok(!`${result.stdout}${result.stderr}`.includes(secret));
});
