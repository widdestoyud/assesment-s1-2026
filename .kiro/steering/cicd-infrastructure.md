---
description: GitLab CI/CD pipeline, Makefile targets, Dockerfile configuration, and pre-commit pipeline standards
inclusion: auto
---

# CI/CD & Infrastructure Standards

## GitLab CI/CD

- Extend shared pipeline templates from `my-telkomsel/pipeline-template-assets/stage-templates`.
- Dockerfile selection is tag-based: tagged commits → production (`Dockerfile`), branch commits → pre-production (`Dockerfile.preprod`).
- Build artifacts are passed between stages as compressed tarballs.
- Disabled base template jobs use `rules: [{ when: never }]`.
- Keep `NODEJS_VERSION` in CI variables in sync with `.nvmrc`.

## Makefile

- `make build`: Appends CI `.npmrc` (registry auth), installs deps with `--production=false`, runs `npm run build`.
- `make unit-test-coverage`: Installs deps, runs `npm run test:coverage`. Minimum coverage threshold is **85%**.
- Always use `--production=false` to include devDependencies in CI.

### Standard Makefile Template

When generating a new project or if no `Makefile` exists, create one with this template:

```makefile
ENV_VAR := ${ENVIRONMENT}
NPMRC := ${NPMRC_FILE}

build:
	cat ${NPMRC} >> .npmrc
	npm i --production=false && npm run build

unit-test-coverage:
	npm i --production=false && npm run test:coverage
```

Rules:

- `NPMRC_FILE` is a CI file-type variable containing private registry auth tokens — set in GitLab CI/CD settings.
- `ENVIRONMENT` is a CI variable for the current deployment environment.
- `--production=false` ensures devDependencies (Vite, TypeScript, Vitest, etc.) are installed.
- The `cat ${NPMRC} >> .npmrc` step appends registry credentials before `npm install`.
- Keep Makefile targets in sync with the corresponding CI stage scripts.
- Use tabs (not spaces) for Makefile indentation — this is a Makefile requirement.

## Dockerfile

- Base image: `jfrog.cicd.telkomsel.co.id/docker/nginx:1.27-cg` — used for both production and pre-production.
- Build output (`./build`) is copied to `/usr/share/nginx/html`.
- Run as non-root user `1000:1000`.
- Pre-production includes `.htpasswd` for basic authentication.
- Nginx configs live in `nginx/` at project root.
- Never use public Docker Hub images directly — always pull from the internal JFrog Artifactory registry.

### htpasswd Generation

The `.htpasswd` file provides basic authentication for pre-production environments.

**Linux/macOS** (using `apache2-utils`):

```bash
# Create a new file with the first user
htpasswd -c nginx/.htpasswd username

# Add additional users to an existing file
htpasswd nginx/.htpasswd another-user

# Use bcrypt hashing (recommended)
htpasswd -B nginx/.htpasswd username
```

**Windows** (using Docker, since `htpasswd` is not natively available):

```powershell
# Generate using a temporary httpd container
docker run --rm httpd:2.4 htpasswd -nbB username password >> nginx/.htpasswd

# Or use Git Bash with OpenSSL
printf "username:$(openssl passwd -apr1 password)\n" >> nginx/.htpasswd
```

Rules:

- Store `nginx/.htpasswd` in the repository — it is copied into the pre-production Docker image.
- Use bcrypt (`-B` flag) or APR1 (`-apr1`) for stronger password hashing.
- Never commit `.htpasswd` with production credentials — pre-production only.
- Uncomment `auth_basic` directives in `nginx/nginx.preprod.conf` to enable basic auth.
- Default pre-production credentials: username `[default_username]` / password `[default_password]` — refer to the team's credential vault for actual values.

## Nginx Configuration

Both configs share the same base structure. Place them in `nginx/` at project root.

### Production (`nginx/nginx.conf`)

```nginx
map $http_origin $allow_origin {
    ~^https?://(.*\.)?(my|tdwpreweb).telkomsel.com(:\d+)?$ $http_origin;
    default "";
}

server {
  server_tokens off;
  listen 8080;

  root /usr/share/nginx/html/;

  gzip on;
  gzip_min_length 256;
  gzip_vary on;
  gzip_types
    application/javascript
    application/json
    font/eot
    font/otf
    font/ttf
    image/svg+xml
    text/css
    text/javascript
    text/plain
    text/xml;

  location / {
    add_header 'X-Frame-Options' 'SAMEORIGIN' 'always';
    add_header 'Strict-Transport-Security' 'max-age=31536000; includeSubDomains; preload' 'always';
    add_header 'X-Content-Type-Options' 'nosniff' 'always';
    add_header 'Referrer-Policy' 'strict-origin-when-cross-origin' 'always';
    add_header 'Permissions-Policy' 'camera=(self), geolocation=(), microphone=(), payment=()' 'always';
    add_header 'Content-Security-Policy' "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'self';" 'always';
    add_header 'Access-Control-Allow-Origin' $allow_origin;
    add_header 'Access-Control-Allow-Credentials' 'true';
    try_files $uri /index.html =404;
    index index.html index.htm;
    autoindex off;
  }

  location ~ (.+)\.(js|css|jpg|jpeg|gif|png|svg|ico|eot|otf|woff|woff2|ttf)$ {
    expires 30d;
    add_header Pragma public;
    add_header Cache-Control "public, immutable";
    add_header X-Call-Uri $uri;
    try_files $uri @pathfiles;
  }

  location ~ (.+)\.(html|json|txt)$ {
    add_header Pragma "no-cache";
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header X-Call-Uri $uri;
    try_files $uri @pathfiles;
  }

  location @rootfiles {
    rewrite ^.*/(.*)$ /$1 break;
  }

  location @pathfiles {
    rewrite ^/[^/]+(/.*)?$ $1 last;
  }

  location /nginx_status {
    stub_status on;
    allow 127.0.0.1;
    deny all;
  }
}
```

### Pre-production (`nginx/nginx.preprod.conf`)

Same as production, with basic auth lines (commented out by default) in the `location /` block:

```nginx
  location / {
    # ... same headers as production ...

    # auth_basic 'MyTelkomsel Area';
    # auth_basic_user_file /etc/nginx/.htpasswd;
  }
```

### Standard Rules

- Listen on port `8080` (non-privileged).
- `server_tokens off` — hide Nginx version in responses.
- CORS: use `map` block to whitelist allowed origins by regex — never use `*`.
- Security headers (all required):
  - `X-Frame-Options: SAMEORIGIN` — prevent clickjacking.
  - `Strict-Transport-Security` with `includeSubDomains; preload` — enforce HTTPS.
  - `X-Content-Type-Options: nosniff` — prevent MIME-sniffing.
  - `Referrer-Policy: strict-origin-when-cross-origin` — limit referrer leakage.
  - `Permissions-Policy` — allow `camera=(self)` for face recognition, deny everything else.
  - `Content-Security-Policy` — restrict sources to `self`, allow GTM scripts, inline styles, and HTTPS images/connections.
- Gzip: enabled with `gzip_min_length 256` and `gzip_vary on`.
- Caching: hashed static assets get `expires 30d` + `immutable`; HTML/JSON/TXT get `no-cache, no-store, must-revalidate`.
- SPA routing: `try_files $uri /index.html =404` for client-side routing fallback.
- `autoindex off` — never expose directory listings.
- `/nginx_status` restricted to `127.0.0.1` only for health checks.
- Pre-production may enable basic auth by uncommenting `auth_basic` directives.

## SonarQube

When generating a new project or if no `sonar-project.properties` exists, create one with this template:

```properties
sonar.projectKey=<service-name>
sonar.qualitygate.wait=true
sonar.sources=.
sonar.exclusions=**/node_modules/**,Dockerfile,src/routes/**,nginx/**,**/translation/**,src/infrastructure/**,src/@core/protocols/**,src/assets/**,src/routeTree.gen.ts,**/*.config.{js,jsx,ts,tsx,cjs,mjs},i18nConfig.ts
sonar.sourceEncoding=UTF-8
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.ts,**/*.test.tsx,**/*.config.ts,**/*.config.js,**/*.config.cjs,**/*.setup.ts,src/main.tsx,**/translation/**,**/__mocks__/**
```

Rules:

- `sonar.projectKey` must match the `SERVICE_NAME` CI variable.
- `sonar.qualitygate.wait=true` — pipeline fails if quality gate is not passed.
- Exclude from analysis: `node_modules`, generated routes (`routeTree.gen.ts`), protocols, infrastructure adapters, assets, translations, config files, and Dockerfiles.
- Exclude from coverage: test files, config files, setup files, `main.tsx`, translations, and mocks.
- Coverage report path: `coverage/lcov.info` (generated by Vitest with `lcov` reporter).
- Keep exclusion patterns in sync with the Vitest coverage exclusions in `vite.config.ts`.

## Code Quality Pipeline (Pre-commit)

- Husky + lint-staged runs on every commit:
  1. `eslint --fix` on `.ts/.tsx`
  2. `prettier --write` on all files
  3. `npm run test:staged` for changed files
- Hadolint lints Dockerfiles in CI.
