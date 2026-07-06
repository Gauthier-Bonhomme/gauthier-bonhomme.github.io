// ══════════════════════════════════════════════════════════════════
// Backend local du CV — lancer avec lancer-backend.bat (ou: node admin/server.js)
// Sert le site + l'interface d'admin sur http://localhost:8010/admin
// N'est JAMAIS exécuté sur GitHub Pages : uniquement sur ce PC.
// ══════════════════════════════════════════════════════════════════
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.join(__dirname, '..');           // dossier mon-cv/
const PORT = process.env.PORT || 8010;
const CONTENT = path.join(ROOT, 'content.json');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

// extensions autorisées à l'upload / l'édition
const UPLOAD_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];
const EDIT_EXT = ['.html', '.json', '.txt'];

function safePath(rel) {
  // chemin relatif au site, sans échappement possible hors de ROOT
  const p = path.normalize(path.join(ROOT, rel));
  if (!p.startsWith(ROOT) || rel.includes('..')) return null;
  if (p.startsWith(path.join(ROOT, '.git'))) return null;
  return p;
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', c => { size += c.length; if (size > 60 * 1024 * 1024) { reject(new Error('fichier trop gros (60 Mo max)')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function git(args) {
  return new Promise(resolve => {
    execFile('git', args, { cwd: ROOT, windowsHide: true }, (err, stdout, stderr) => {
      resolve({ ok: !err, out: (stdout + '\n' + stderr).trim() });
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const route = req.method + ' ' + url.pathname;
  try {

    // ───── API ─────
    if (url.pathname === '/api/content') {
      if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        return fs.createReadStream(CONTENT).pipe(res);
      }
      if (req.method === 'PUT') {
        const body = await readBody(req);
        let parsed;
        try { parsed = JSON.parse(body.toString('utf8')); }
        catch (e) { return json(res, 400, { error: 'JSON invalide : ' + e.message }); }
        // garde-fous minimaux avant écriture
        for (const k of ['labels', 'hero', 'about', 'formations', 'experiences', 'projects', 'skills', 'languages', 'interests', 'contacts', 'sports', 'pdf'])
          if (parsed[k] === undefined) return json(res, 400, { error: 'section manquante : ' + k });
        fs.copyFileSync(CONTENT, CONTENT + '.bak'); // filet de sécurité (1 version précédente)
        fs.writeFileSync(CONTENT, JSON.stringify(parsed, null, 1), 'utf8');
        return json(res, 200, { ok: true });
      }
    }

    if (route === 'POST /api/upload') {
      const rel = url.searchParams.get('path') || '';
      const p = safePath(rel);
      const ext = path.extname(rel).toLowerCase();
      if (!p || !UPLOAD_EXT.includes(ext)) return json(res, 400, { error: 'chemin ou extension refusé : ' + rel });
      const body = await readBody(req);
      if (!body.length) return json(res, 400, { error: 'fichier vide' });
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, body);
      return json(res, 200, { ok: true, path: rel, size: body.length });
    }

    if (route === 'GET /api/files') {
      const files = fs.readdirSync(ROOT)
        .filter(f => EDIT_EXT.includes(path.extname(f).toLowerCase()) && fs.statSync(path.join(ROOT, f)).isFile())
        .sort();
      return json(res, 200, { files });
    }

    if (url.pathname === '/api/file') {
      const rel = url.searchParams.get('path') || '';
      const p = safePath(rel);
      const ext = path.extname(rel).toLowerCase();
      if (!p || !EDIT_EXT.includes(ext) || rel.includes('/') || rel.includes('\\'))
        return json(res, 400, { error: 'fichier refusé : ' + rel });
      if (req.method === 'GET') {
        if (!fs.existsSync(p)) return json(res, 404, { error: 'introuvable' });
        return json(res, 200, { path: rel, content: fs.readFileSync(p, 'utf8') });
      }
      if (req.method === 'PUT') {
        const body = await readBody(req);
        fs.copyFileSync(p, p + '.bak');
        fs.writeFileSync(p, body.toString('utf8'), 'utf8');
        return json(res, 200, { ok: true });
      }
    }

    if (route === 'GET /api/status') {
      const st = await git(['status', '--short']);
      const branch = await git(['branch', '--show-current']);
      return json(res, 200, { branch: branch.out, changes: st.out ? st.out.split('\n') : [] });
    }

    if (route === 'POST /api/publish') {
      const body = await readBody(req);
      let msg = 'Mise à jour du contenu via l\'admin';
      try { const b = JSON.parse(body.toString('utf8') || '{}'); if (b.message) msg = b.message; } catch (e) {}
      const log = [];
      const add = await git(['add', '-A']); log.push('$ git add -A', add.out || '(ok)');
      const diff = await git(['diff', '--cached', '--quiet']);
      if (diff.ok) return json(res, 200, { ok: true, nothing: true, log: ['Aucune modification à publier — le site en ligne est déjà à jour.'] });
      const commit = await git(['commit', '-m', msg + '\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>']);
      log.push('$ git commit', commit.out);
      if (!commit.ok) return json(res, 500, { ok: false, log });
      const push = await git(['push', 'origin', 'main']);
      log.push('$ git push', push.out);
      return json(res, push.ok ? 200 : 500, { ok: push.ok, log, info: push.ok ? 'Publié ! Le site en ligne se met à jour d\'ici 1 à 2 minutes.' : 'Échec du push — vérifie ta connexion.' });
    }

    // ───── admin ─────
    if (url.pathname === '/admin' || url.pathname === '/admin/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return fs.createReadStream(path.join(__dirname, 'admin.html')).pipe(res);
    }

    // ───── site statique ─────
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    const p = safePath(rel.slice(1));
    if (!p) { res.writeHead(403); return res.end('Interdit'); }
    fs.readFile(p, (err, data) => {
      if (err) { res.writeHead(404); return res.end('Introuvable : ' + rel); }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(p).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store', // toujours la dernière version en local
      });
      res.end(data);
    });

  } catch (e) {
    json(res, 500, { error: e.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  ================================================');
  console.log('   Backend du CV demarre');
  console.log('   Admin : http://localhost:' + PORT + '/admin');
  console.log('   Site  : http://localhost:' + PORT + '/');
  console.log('   (Ctrl+C pour arreter)');
  console.log('  ================================================');
});
