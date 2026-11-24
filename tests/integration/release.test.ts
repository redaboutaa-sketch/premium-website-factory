/**
 * Release assemblée : audit réel, empreintes, reproductibilité, détection
 * d'altération. Exige Composer et PHP (sautés localement sans eux, ÉCHEC si
 * FACTORY_REQUIRE_PHP=1, comme en CI).
 */
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { loadBrief } from '../../engine/config/load.ts';
import { resolveConfig } from '../../engine/config/resolve.ts';
import { loadFormContract } from '../../engine/form/index.ts';
import { auditRelease } from '../../engine/qa/release.ts';
import { assembleRelease } from '../../engine/release/index.ts';

const ROOT = resolve(import.meta.dirname, '../..');
const OUT = join(ROOT, '.generated', 'release-tests');
const tools = ['composer', 'php'].every((t) => spawnSync(t, ['--version']).status === 0);
if (!tools && process.env.FACTORY_REQUIRE_PHP === '1') throw new Error('Composer et PHP requis (FACTORY_REQUIRE_PHP=1)');
const SITE_A = join(ROOT, 'examples', 'fixture-a-services');
const SITE_B = join(ROOT, 'examples', 'fixture-b-catalog');
const profile = JSON.parse(readFileSync(join(ROOT, 'tests', 'recipe', 'profile.json'), 'utf8'));
const quiet = () => undefined;
const qa = (dir: string, site: string) =>
  spawnSync(process.execPath, ['engine/cli/main.ts', 'qa-release', '--release', dir], { cwd: ROOT, encoding: 'utf8', env: { ...process.env, FACTORY_SITE_DIR: site } });

afterAll(() => rmSync(OUT, { recursive: true, force: true }));

describe.skipIf(!tools)('release assemblée', () => {
  it('A : endpoint + vendor inclus avant audit ; deux assemblages → même identité', async () => {
    const r1 = await assembleRelease({ siteDir: SITE_A, target: 'preview', outBase: join(OUT, 'a1'), profile, log: quiet });
    const r2 = await assembleRelease({ siteDir: SITE_A, target: 'preview', outBase: join(OUT, 'a2'), profile, log: quiet });
    expect(existsSync(join(r1.dir, 'public', 'api', 'contact.php'))).toBe(true);
    expect(existsSync(join(r1.dir, 'app', 'vendor', 'phpmailer', 'phpmailer', 'src', 'PHPMailer.php'))).toBe(true);
    expect(r1.audit.filter((x) => !x.ok)).toEqual([]);
    expect(r2.id).toBe(r1.id);
    expect(readFileSync(join(r2.dir, 'SHA256SUMS'), 'utf8')).toBe(readFileSync(join(r1.dir, 'SHA256SUMS'), 'utf8'));
    expect(qa(r1.dir, SITE_A).status).toBe(0);
  });

  it('qa:release détecte une modification après assemblage', async () => {
    const r = await assembleRelease({ siteDir: SITE_A, target: 'preview', outBase: join(OUT, 'tamper'), profile, log: quiet });
    writeFileSync(join(r.dir, 'public', 'index.html'), `${readFileSync(join(r.dir, 'public', 'index.html'), 'utf8')}<!-- ajout -->`);
    const res = qa(r.dir, SITE_A);
    expect(res.status).toBe(1);
    expect(res.stderr).toContain('empreintes divergentes');
  });

  it('l’audit refuse un PHP supplémentaire, un fichier caché, une adresse interne servie', async () => {
    const r = await assembleRelease({ siteDir: SITE_A, target: 'preview', outBase: join(OUT, 'neg'), profile, log: quiet });
    const copy = join(OUT, 'neg-copy');
    cpSync(r.dir, copy, { recursive: true });
    writeFileSync(join(copy, 'public', 'api', 'debug.php'), '<?php phpinfo();');
    writeFileSync(join(copy, 'public', '.env'), 'X=1');
    writeFileSync(join(copy, 'public', 'fuite.html'), '<p>demandes@example.com</p>');
    const loaded = await loadBrief(SITE_A, 'preview');
    if (!loaded.brief) throw new Error('brief');
    const rows = await auditRelease(copy, { brief: loaded.brief, config: resolveConfig(loaded.brief, { target: 'preview', localPreviewOrigin: profile.localPreviewOrigin }), form: loadFormContract(SITE_A), target: 'preview' });
    const failed = rows.filter((x) => !x.ok).map((x) => x.id);
    expect(failed).toEqual(expect.arrayContaining(['public.php-only-endpoint', 'public.forbidden-files', 'public.no-leaks']));
  });

  it('B : release sans formulaire → aucun PHP, aucun app/', async () => {
    const r = await assembleRelease({ siteDir: SITE_B, target: 'preview', outBase: join(OUT, 'b'), profile, log: quiet });
    expect(existsSync(join(r.dir, 'app'))).toBe(false);
    expect(readFileSync(join(r.dir, 'config', 'nginx', 'site.conf'), 'utf8')).not.toContain('fastcgi_pass');
    expect(r.audit.filter((x) => !x.ok)).toEqual([]);
  });
});
