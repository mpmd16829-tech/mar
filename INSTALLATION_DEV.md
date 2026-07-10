# 🚀 Guide d'Installation Complet - POÉSIE-MR (Développement)

> Plateforme de Bibliothèque Numérique de Poésie Mauritanienne

**Dernière mise à jour** : 2026-07-10  
**Stack** : React 19 + TypeScript | Django 4.2 LTS | PostgreSQL 15 | Redis 7 | Celery 5

---

## 📋 Table des Matières

1. [Pré-requis](#pré-requis)
2. [Architecture Globale](#architecture-globale)
3. [Installation Rapide (5 min)](#installation-rapide)
4. [Installation Détaillée par Composant](#installation-détaillée)
5. [Commandes Essentielles](#commandes-essentielles)
6. [Troubleshooting](#troubleshooting)
7. [Ressources](#ressources)

---

## 🔧 Pré-requis

### Système d'Exploitation

| OS | Version | Statut |
|---|---------|--------|
| macOS | 11.0+ | ✅ Recommandé |
| Ubuntu/Linux | 20.04 LTS+ | ✅ Recommandé |
| Windows 10/11 | WSL 2 | ⚠️ Supporté |

### Logiciels Obligatoires

```bash
# Vérifier les installations
node --version        # v18.17.0+
python --version      # 3.11+
docker --version      # 24.0+
docker-compose --version  # v2.0+
git --version         # 2.30+
```

### Installation des Outils

#### **macOS**
```bash
# Installer Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer les dépendances
brew install node python@3.11 docker git postgresql redis

# Démarrer les services
brew services start postgresql
brew services start redis

# Vérifier les versions
node --version        # v18+
python3 --version     # 3.11+
```

#### **Ubuntu/Debian**
```bash
# Mettre à jour système
sudo apt update && sudo apt upgrade -y

# Installer Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installer Python 3.11
sudo apt install -y python3.11 python3.11-venv python3.11-dev

# Installer PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Installer Redis
sudo apt install -y redis-server

# Installer Docker
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER

# Démarrer les services
sudo systemctl start postgresql
sudo systemctl start redis-server
sudo systemctl start docker
```

#### **Windows (WSL 2)**
```bash
# Dans PowerShell (Admin)
wsl --install
wsl --install -d Ubuntu-22.04

# Dans WSL Terminal
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3.11 python3.11-venv nodejs npm postgresql redis-server docker.io

# Démarrer services
sudo service postgresql start
sudo service redis-server start
sudo service docker start
```

### Vérification Finale

```bash
# Exécuter ce script
cat << 'EOF' > check_setup.sh
#!/bin/bash
echo "🔍 Vérification de l'environnement..."
node --version && echo "✅ Node.js OK" || echo "❌ Node.js MANQUANT"
python3 --version && echo "✅ Python OK" || echo "❌ Python MANQUANT"
git --version && echo "✅ Git OK" || echo "❌ Git MANQUANT"
docker --version && echo "✅ Docker OK" || echo "❌ Docker MANQUANT"
psql --version && echo "✅ PostgreSQL OK" || echo "❌ PostgreSQL MANQUANT"
redis-cli --version && echo "✅ Redis OK" || echo "❌ Redis MANQUANT"
echo "✅ Tous les pré-requis sont satisfaits!"
EOF
chmod +x check_setup.sh
./check_setup.sh
```

---

## 🏗️ Architecture Globale

```
POÉSIE-MR (Architecture Dev)
├── Frontend
│   ├── React 19 + TypeScript
│   ├── Localhost:3000
│   └── HMR (Hot Module Replacement)
│
├── Backend
│   ├── Django + DRF
│   ├── Localhost:8000
│   ├── Auto-reload en développement
│   └── Swagger/Redoc: /api/docs/
│
├── Database
│   ├── PostgreSQL 15
│   ├── Localhost:5432
│   └── Adminer UI: Localhost:8080
│
├── Cache
│   ├── Redis 7
│   └── Localhost:6379
│
├── Async Tasks
│   ├── Celery Workers
│   ├── Flower Dashboard: Localhost:5555
│   └── RabbitMQ (optionnel)
│
└── Services
    ├── Mailhog (Email dev): Localhost:1025
    ├── Minio (S3 local): Localhost:9000
    └── Logs centralisés
```

---

## ⚡ Installation Rapide (5 minutes)

### Option 1 : Docker Compose (Recommandé - 0 Configuration)

```bash
# 1. Cloner le repository
git clone https://github.com/mpmd16829-tech/mar.git poetry-mr
cd poetry-mr

# 2. Copier variables d'environnement
cp .env.example .env
cp .env.docker .env.docker

# 3. Lancer tous les services (1 commande!)
docker-compose -f docker-compose.dev.yml up -d

# 4. Initialiser la base de données
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate
docker-compose -f docker-compose.dev.yml exec web python manage.py createsuperuser

# 5. Créer données de test
docker-compose -f docker-compose.dev.yml exec web python manage.py seed_data

# 6. Accéder à l'application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin/
# Logs: docker-compose -f docker-compose.dev.yml logs -f

echo "✅ Application prête! Ouvrir http://localhost:3000"
```

### Option 2 : Installation Native (Contrôle Total)

```bash
# 1. Cloner et configurer
git clone https://github.com/mpmd16829-tech/mar.git poetry-mr
cd poetry-mr
cp .env.example .env

# 2. Backend (Terminal 1)
cd backend
python3.11 -m venv venv
source venv/bin/activate  # macOS/Linux
# OU
# venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# 3. Frontend (Terminal 2)
cd frontend
nvm use 18  # Si vous utilisez nvm
npm install
npm run dev

# 4. Celery Worker (Terminal 3)
cd backend
source venv/bin/activate
celery -A config worker -l info

# 5. Ouvrir l'application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

---

## 📦 Installation Détaillée par Composant

### 1️⃣ Backend (Django + DRF)

#### A) Configuration Initiale

```bash
# Naviguer au dossier backend
cd backend

# Créer et activer l'environnement virtuel
python3.11 -m venv venv

# Activer venv
source venv/bin/activate  # macOS/Linux
# OU
venv\Scripts\activate     # Windows PowerShell

# Vérifier l'activation (le prompt doit afficher "(venv)")
# (venv) poetry-mr/backend $

# Mettre à jour pip
pip install --upgrade pip setuptools wheel
```

#### B) Installer les Dépendances

```bash
# Installer requirements.txt
pip install -r requirements.txt

# Vérifier l'installation
pip list | grep -i django  # Vérifier Django 4.2

# Afficher toutes les dépendances
pip freeze
```

#### C) Configurer la Base de Données

```bash
# 1. Créer la base PostgreSQL
# Option 1 : Avec psql (CLI)
psql -U postgres -c "CREATE DATABASE poetry_mr_dev OWNER postgres;"
psql -U postgres -c "CREATE DATABASE poetry_mr_test OWNER postgres;"

# Option 2 : Avec pgAdmin (GUI)
# Ouvrir http://localhost:5050 (pgAdmin)
# Créer DB "poetry_mr_dev"

# 2. Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# Vérifier migrations
python manage.py showmigrations

# 3. Créer superutilisateur (Admin)
python manage.py createsuperuser
# Saisir :
# Email: admin@poetry-mr.local
# Password: DevPassword123!

# 4. Charger données initiales (optionnel)
python manage.py loaddata apps/poems/fixtures/categories.json
python manage.py loaddata apps/poems/fixtures/sample_poems.json
```

#### D) Lancer le Serveur Django

```bash
# Mode développement standard
python manage.py runserver

# Mode avec rechargement auto
python manage.py runserver 0.0.0.0:8000

# Avec debug panel
export DJANGO_DEBUG_TOOLBAR=1
python manage.py runserver

# Accéder aux endpoints
# API: http://localhost:8000/api/v1/poems/
# Admin: http://localhost:8000/admin/
# Swagger: http://localhost:8000/api/docs/
# Redoc: http://localhost:8000/api/redoc/

# Vérifier les logs
# Stdout affichera les requêtes, erreurs, migrations
```

#### E) Celery (Tâches Asynchrones)

```bash
# Dans un nouveau Terminal (toujours depuis backend/)

# Terminal 3a) Lancer Celery Worker
source venv/bin/activate
celery -A config worker -l info

# Terminal 3b) Lancer Celery Beat (Scheduler)
source venv/bin/activate
celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler

# Terminal 3c) Lancer Flower (Dashboard Celery)
source venv/bin/activate
celery -A config flower

# Accéder à Flower
# http://localhost:5555

# Vérifier les queues
celery -A config inspect active
celery -A config inspect active_queues
```

### 2️⃣ Frontend (React 19 + TypeScript)

#### A) Configuration Initiale

```bash
# Naviguer au dossier frontend
cd frontend

# Vérifier Node.js
node --version  # Doit être 18.17.0+
npm --version   # Doit être 9.0.0+

# (Optionnel) Utiliser NVM pour version exacte
nvm install 18.17.0
nvm use 18.17.0
```

#### B) Installer les Dépendances

```bash
# Méthode 1 : npm (Standard)
npm install

# Méthode 2 : npm ci (Recommandé pour prod/CI)
npm ci

# Méthode 3 : pnpm (Plus rapide, optionnel)
npm install -g pnpm
pnpm install

# Vérifier l'installation
npm list react react-dom typescript

# Afficher toutes les dépendances
npm list
```

#### C) Fichier .env.local

```bash
# Créer .env.local
cat > .env.local << 'EOF'
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Firebase (optionnel, pour analytics)
VITE_FIREBASE_PROJECT_ID=poetry-mr-dev

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PAYMENT_DEBUG=true

# i18n
VITE_DEFAULT_LANGUAGE=fr

# Environment
VITE_ENVIRONMENT=development
EOF

cat .env.local  # Vérifier le contenu
```

#### D) Lancer le Serveur Frontend

```bash
# Mode développement (Vite - Ultra rapide)
npm run dev

# Sortie attendue:
# ➜  Local:   http://localhost:3000/
# ➜  press h to show help

# Mode avec TypeScript check
npm run type-check &  # Background
npm run dev

# Mode production (build + preview)
npm run build
npm run preview

# Accéder à l'application
# http://localhost:3000/

# HMR actif : Les changements sont visibles en < 1 sec
# Ouvrir DevTools : F12
```

#### E) Scripts Utiles Frontend

```bash
# Format code (Prettier)
npm run format

# Linter (ESLint)
npm run lint

# Corriger les erreurs de linting
npm run lint:fix

# Tests unitaires (Vitest)
npm run test

# Tests avec coverage
npm run test:coverage

# Tests e2e (Playwright)
npm run test:e2e

# Build pour production
npm run build

# Analyser bundle
npm run analyze
```

### 3️⃣ Base de Données PostgreSQL

#### A) Installation & Démarrage

```bash
# macOS
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql

# Vérifier le statut
psql --version
psql -U postgres -c "SELECT version();"
```

#### B) Créer Bases de Données

```bash
# Connexion à PostgreSQL
psql -U postgres

# Dans le terminal psql:
-- Créer base développement
CREATE DATABASE poetry_mr_dev OWNER postgres;

-- Créer base test
CREATE DATABASE poetry_mr_test OWNER postgres;

-- Créer utilisateur dédié (optionnel)
CREATE USER poetry_dev WITH PASSWORD 'dev_password_123';
GRANT ALL PRIVILEGES ON DATABASE poetry_mr_dev TO poetry_dev;

-- Vérifier création
\l

-- Quitter
\q
```

#### C) Utiliser Adminer (Interface Web)

```bash
# Adminer : Interface PostgreSQL web (alternative pgAdmin)
docker run -p 8080:8080 adminer

# Accéder à http://localhost:8080
# Serveur: localhost
# Utilisateur: postgres
# Password: (vide ou votre password)
# Base: poetry_mr_dev
```

#### D) Sauvegarde & Restauration

```bash
# Exporter la base
pg_dump -U postgres poetry_mr_dev > backup_dev.sql

# Importer dans une base
psql -U postgres poetry_mr_dev < backup_dev.sql

# Dump au format binaire (plus rapide)
pg_dump -U postgres -Fc poetry_mr_dev > backup_dev.dump
pg_restore -U postgres -d poetry_mr_dev backup_dev.dump
```

### 4️⃣ Redis (Cache & Session Store)

#### A) Installation & Démarrage

```bash
# macOS
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis-server

# Vérifier le statut
redis-cli ping  # Doit retourner "PONG"
redis-cli INFO server
```

#### B) Redis CLI (Commandes Utiles)

```bash
# Connexion interactive
redis-cli

# Dans redis-cli:
PING                    # Test connexion
SET mykey "hello"       # Créer clé
GET mykey               # Récupérer valeur
DEL mykey               # Supprimer
KEYS *                  # Lister toutes clés
FLUSHDB                 # Vider cache (danger!)
DBSIZE                  # Nombre de clés
INFO                    # Stats serveur
CONFIG GET *            # Configuration

# Quitter
EXIT
```

#### C) Redis Commander (UI Web)

```bash
# Interface web pour Redis
npm install -g redis-commander
redis-commander

# Accéder à http://localhost:8081
```

### 5️⃣ Email Development (Mailhog)

#### A) Lancer Mailhog

```bash
# Docker (Recommandé)
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Accéder à http://localhost:8025

# Ou installer localement (Go requis)
brew install mailhog
mailhog

# Configuration Django (.env)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=localhost
EMAIL_PORT=1025
EMAIL_USE_TLS=false
```

### 6️⃣ Stockage S3 Local (MinIO)

#### A) Lancer MinIO

```bash
# Docker (Recommandé)
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"

# Console: http://localhost:9001
# API: http://localhost:9000

# Configuration Django (.env)
USE_S3=false  # Utiliser stockage local en dev
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_HTTPS=false
```

#### B) MinIO CLI (mc)

```bash
# Installer mc
brew install minio-mc

# Configurer endpoint
mc alias set local http://localhost:9000 minioadmin minioadmin

# Lister buckets
mc ls local

# Créer bucket
mc mb local/poetry-mr

# Uploader fichier
mc cp test.pdf local/poetry-mr/

# Lister fichiers
mc ls local/poetry-mr/
```

---

## 🎯 Commandes Essentielles

### Backend Commands

```bash
cd backend && source venv/bin/activate

# Django Management
python manage.py runserver                    # Démarrer serveur
python manage.py migrate                      # Appliquer migrations
python manage.py makemigrations               # Créer migrations
python manage.py createsuperuser              # Créer admin
python manage.py shell                        # Shell interactif
python manage.py collectstatic                # Collecter static files

# Database
python manage.py dumpdata > data.json         # Exporter data
python manage.py loaddata data.json           # Importer data
python manage.py dbshell                      # Shell PostgreSQL

# Celery
celery -A config worker -l info               # Worker
celery -A config beat -l info                 # Scheduler
celery -A config flower                       # Dashboard

# Testing
pytest                                        # Tous les tests
pytest tests/unit/                            # Tests unitaires
pytest tests/integration/                     # Tests intégration
pytest --cov                                  # Avec coverage
pytest -v                                     # Verbose

# Linting & Formatting
black .                                       # Format code
isort .                                       # Sort imports
flake8 .                                      # Lint
mypy .                                        # Type checking
```

### Frontend Commands

```bash
cd frontend

# Development
npm run dev                                   # Serveur dev (Vite)
npm run type-check                            # TypeScript check
npm run lint                                  # ESLint
npm run lint:fix                              # Fix linting issues
npm run format                                # Prettier format

# Testing
npm test                                      # Vitest
npm run test:coverage                         # Coverage report
npm run test:e2e                              # Playwright E2E

# Building
npm run build                                 # Build production
npm run preview                               # Preview build
npm run analyze                               # Bundle analyzer

# Dependencies
npm outdated                                  # Voir outdated packages
npm update                                    # Update packages
npm audit                                     # Security audit
npm audit fix                                 # Fix vulnerabilities
```

### Docker Compose Commands

```bash
# Démarrer services
docker-compose -f docker-compose.dev.yml up -d

# Arrêter services
docker-compose -f docker-compose.dev.yml down

# Voir les logs
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml logs -f web  # Service spécifique

# Exécuter commande dans conteneur
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate
docker-compose -f docker-compose.dev.yml exec web bash

# Rebuild images
docker-compose -f docker-compose.dev.yml build --no-cache

# Prune (Nettoyer)
docker system prune -a

# Health check
docker-compose -f docker-compose.dev.yml ps
```

### Useful Aliases (Ajouter à ~/.bashrc ou ~/.zshrc)

```bash
# Ajouter à ~/.bashrc ou ~/.zshrc
alias pm-dev="docker-compose -f docker-compose.dev.yml"
alias pm-up="pm-dev up -d && pm-dev logs -f"
alias pm-down="pm-dev down"
alias pm-logs="pm-dev logs -f"
alias pm-shell="pm-dev exec web bash"
alias pm-migrate="pm-dev exec web python manage.py migrate"
alias pm-test="cd backend && python -m pytest"
alias pm-lint="cd backend && black . && isort . && flake8 ."

# Recharger bash
source ~/.bashrc  # ou source ~/.zshrc
```

---

## 🐛 Troubleshooting

### Problème 1 : Port Déjà Utilisé

```bash
# Trouver quel processus utilise le port 8000
lsof -i :8000       # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Arrêter le processus
kill -9 <PID>       # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Ou utiliser un autre port
python manage.py runserver 8001
```

### Problème 2 : Dépendances PostgreSQL Manquantes

```bash
# Erreur : "Error: could not translate host name "db" to address"

# Solution 1 : PostgreSQL n'est pas lancée
sudo systemctl start postgresql  # Ubuntu
brew services start postgresql  # macOS

# Solution 2 : Connexion string incorrecte
# .env doit contenir :
DATABASE_URL=postgresql://postgres:password@localhost:5432/poetry_mr_dev
```

### Problème 3 : Erreur Python Import

```bash
# Erreur : "ModuleNotFoundError: No module named 'django'"

# Solution
source venv/bin/activate
pip install -r requirements.txt
pip list | grep django
```

### Problème 4 : Node Modules Corrompus

```bash
# Erreur : "cannot find module..." ou dépendances bizarres

# Solution
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Problème 5 : Redis Refusant les Connexions

```bash
# Erreur : "Connection refused" ou "Cannot connect to redis"

# Vérifier le statut
redis-cli ping

# Redémarrer
redis-cli shutdown
redis-server

# Ou macOS
brew services restart redis
```

### Problème 6 : Migrations Conflictuelles

```bash
# Erreur : "Conflicting migrations detected"

# Solution 1 : Merge automatique
python manage.py migrate --fake-initial
python manage.py makemigrations --merge

# Solution 2 : Reset DB (DEV SEULEMENT!)
python manage.py flush  # Supprimer toutes les données
python manage.py migrate

# Solution 3 : Supprimer dernière migration
rm apps/*/migrations/000X_auto_*.py
python manage.py makemigrations
python manage.py migrate
```

### Problème 7 : CORS Errors

```bash
# Erreur : "Access to XMLHttpRequest blocked by CORS policy"

# Vérifier .env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Ou ajouter dans settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Redémarrer serveur Django
```

### Problème 8 : Webpack/Vite Compilation Timeout

```bash
# Erreur : "Timeout while compiling" ou build très lent

# Solution 1 : Augmenter timeout
VITE_TIMEOUT=60000 npm run build

# Solution 2 : Vider cache
rm -rf node_modules/.vite
npm run dev

# Solution 3 : Vérifier RAM
free -h  # Linux
vm_stat | grep free  # macOS
```

### Diagnostic Complet

```bash
# Script de diagnostic
cat << 'EOF' > diagnose.sh
#!/bin/bash
echo "=== Diagnostic Complet ==="
echo "OS: $(uname -s)"
echo "Node: $(node --version)"
echo "Python: $(python3 --version)"
echo "Docker: $(docker --version)"
echo "PostgreSQL:"
psql -U postgres -c "SELECT version();" 2>/dev/null || echo "  ❌ Not running"
echo "Redis:"
redis-cli ping 2>/dev/null || echo "  ❌ Not running"
echo "Backend:"
cd backend && python -m pip list | grep -i django || echo "  ❌ Django not installed"
echo "Frontend:"
cd ../frontend && npm list react 2>/dev/null | head -2 || echo "  ❌ Dependencies not installed"
echo "=== End Diagnostic ==="
EOF
chmod +x diagnose.sh
./diagnose.sh
```

---

## 📚 Ressources

### Documentation Officielle

- **Django 4.2** : https://docs.djangoproject.com/en/4.2/
- **Django REST Framework** : https://www.django-rest-framework.org/
- **React 19** : https://react.dev/
- **TypeScript** : https://www.typescriptlang.org/docs/
- **Vite** : https://vitejs.dev/guide/
- **PostgreSQL 15** : https://www.postgresql.org/docs/15/
- **Celery** : https://docs.celeryproject.org/
- **Redis** : https://redis.io/documentation/

### Tutoriels Recommandés

- **Django + DRF Tutorial** : https://www.django-rest-framework.org/tutorial/
- **React Patterns** : https://patterns.dev/
- **PostgreSQL Performance** : https://use-the-index-luke.com/
- **Docker Guide** : https://docs.docker.com/get-started/

### Outils Utiles

| Outil | URL | Usage |
|-------|-----|-------|
| Postman | https://www.postman.com/ | API Testing |
| Insomnia | https://insomnia.rest/ | API REST Client |
| pgAdmin | https://www.pgadmin.org/ | PostgreSQL GUI |
| Adminer | https://www.adminer.org/ | Universal DB GUI |
| Redis Commander | npm i -g redis-commander | Redis GUI |
| Swagger Editor | https://editor.swagger.io/ | API Doc |

### Communautés & Support

- **Stack Overflow** : Tag `django`, `react`, `postgresql`
- **Reddit** : r/django, r/reactjs, r/Python
- **Discord** : Django, React, PostgreSQL servers
- **GitHub Issues** : Poser questions sur les repos

---

## ✅ Checklist Validation

Avant de commencer le développement, vérifier :

- [ ] Node.js 18.17.0+ installé
- [ ] Python 3.11+ installé
- [ ] Docker & Docker Compose installés
- [ ] PostgreSQL 15+ lancé
- [ ] Redis 7+ lancé
- [ ] Git cloné (`git clone ...`)
- [ ] Backend venv activé
- [ ] `pip install -r requirements.txt` ✅
- [ ] `npm install` (frontend) ✅
- [ ] `python manage.py migrate` ✅
- [ ] Superuser créé ✅
- [ ] `npm run dev` (Frontend) lancé ✅
- [ ] `python manage.py runserver` (Backend) lancé ✅
- [ ] http://localhost:3000 accessible ✅
- [ ] http://localhost:8000/api/ accessible ✅
- [ ] http://localhost:8000/admin/ accessible ✅

---

## 🎉 Prêt à Développer!

Vous avez maintenant une plateforme complète en développement local!

### Prochaines Étapes

1. **Créer votre première branche**
   ```bash
   git checkout -b feature/mon-feature
   ```

2. **Lire la documentation du projet**
   ```bash
   cat ARCHITECTURE.md
   cat API_DOCUMENTATION.md
   ```

3. **Rejoindre l'équipe de développement**
   - Slack channel : #poetry-mr-dev
   - Meetings : Lundi 10h UTC

4. **Contribuer**
   ```bash
   git add .
   git commit -m "feat: description claire"
   git push origin feature/mon-feature
   # Créer PR sur GitHub
   ```

---

**Questions?** Ouvrir une issue sur GitHub : https://github.com/mpmd16829-tech/mar/issues

**Besoin d'aide?** Lancer le diagnostic :
```bash
./diagnose.sh
```

**Bonne programmation! 🚀**

---

*Dernière mise à jour : 2026-07-10 | Documenté par: Équipe Architecture*
