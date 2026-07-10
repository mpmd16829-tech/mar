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

---

## ⚡ Installation Rapide (5 minutes avec Docker)

### Option 1 : Docker Compose (Recommandé)

```bash
# 1. Cloner le repository
git clone https://github.com/mpmd16829-tech/mar.git poetry-mr
cd poetry-mr

# 2. Copier variables d'environnement
cp .env.example .env

# 3. Lancer tous les services
docker-compose -f docker-compose.dev.yml up -d

# 4. Initialiser la base de données
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate
docker-compose -f docker-compose.dev.yml exec web python manage.py createsuperuser

# 5. Accéder à l'application
echo "✅ Frontend: http://localhost:3000"
echo "✅ Backend: http://localhost:8000"
echo "✅ Admin: http://localhost:8000/admin/"
```

### Option 2 : Installation Native (Détaillée)

```bash
# Voir section Installation Détaillée ci-dessous
```

---

## 📦 Installation Détaillée par Composant

### 1️⃣ Backend (Django + DRF)

```bash
# Naviguer au dossier backend
cd backend

# Créer l'environnement virtuel
python3.11 -m venv venv

# Activer venv
source venv/bin/activate  # macOS/Linux
# OU
venv\\Scripts\\activate     # Windows

# Installer les dépendances
pip install --upgrade pip
pip install -r requirements.txt

# Configurer la base de données
# Créer DB PostgreSQL
psql -U postgres -c "CREATE DATABASE poetry_mr_dev OWNER postgres;"

# Appliquer les migrations
python manage.py makemigrations
python manage.py migrate

# Créer superutilisateur
python manage.py createsuperuser
# Email: admin@poetry-mr.local
# Password: DevPassword123!

# Lancer le serveur
python manage.py runserver

# Accéder à http://localhost:8000
```

### 2️⃣ Frontend (React 19 + TypeScript)

```bash
# Naviguer au dossier frontend
cd frontend

# Vérifier Node.js
node --version  # Doit être 18.17.0+

# Installer les dépendances
npm install

# Créer .env.local
cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_DEFAULT_LANGUAGE=fr
VITE_ENVIRONMENT=development
EOF

# Lancer le serveur dev
npm run dev

# Accéder à http://localhost:3000
```

### 3️⃣ Celery Worker (Tâches Asynchrones)

```bash
# Dans un nouveau Terminal
cd backend
source venv/bin/activate

# Lancer Celery Worker
celery -A config worker -l info

# Dans un autre Terminal : Lancer Celery Beat
celery -A config beat -l info

# Optionnel : Dashboard Flower
celery -A config flower
# Accéder à http://localhost:5555
```

---

## 🎯 Commandes Essentielles

### Backend

```bash
cd backend && source venv/bin/activate

# Django Management
python manage.py runserver              # Démarrer serveur
python manage.py migrate                # Appliquer migrations
python manage.py makemigrations         # Créer migrations
python manage.py createsuperuser        # Créer admin
python manage.py shell                  # Shell Python

# Testing
pytest                                  # Tous les tests
pytest tests/unit/                      # Tests unitaires
pytest --cov                            # Coverage

# Formatting
black .                                 # Format code
isort .                                 # Sort imports
flake8 .                                # Lint

# Celery
celery -A config worker -l info         # Worker
celery -A config beat -l info           # Scheduler
celery -A config flower                 # Dashboard
```

### Frontend

```bash
cd frontend

# Development
npm run dev                             # Serveur dev
npm run type-check                      # TypeScript check
npm run lint                            # ESLint
npm run format                          # Prettier

# Testing
npm test                                # Vitest
npm run test:e2e                        # Playwright

# Building
npm run build                           # Build production
npm run analyze                         # Bundle analyzer
```

### Docker Compose

```bash
# Démarrer
docker-compose -f docker-compose.dev.yml up -d

# Arrêter
docker-compose -f docker-compose.dev.yml down

# Logs
docker-compose -f docker-compose.dev.yml logs -f

# Exécuter commande
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate

# Rebuild
docker-compose -f docker-compose.dev.yml build --no-cache
```

---

## 🐛 Troubleshooting

### Port Déjà Utilisé

```bash
# Trouver le processus
lsof -i :8000

# Arrêter le processus
kill -9 <PID>

# Ou utiliser un autre port
python manage.py runserver 8001
```

### PostgreSQL Non Connecté

```bash
# Vérifier le statut
psql -U postgres -c "SELECT 1"

# Redémarrer
sudo systemctl restart postgresql  # Ubuntu
brew services restart postgresql  # macOS
```

### Redis Refusant les Connexions

```bash
# Vérifier le statut
redis-cli ping

# Redémarrer
redis-cli shutdown
redis-server
```

### Node Modules Corrompus

```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

```bash
# Vérifier .env
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Redémarrer Django
```

---

## ✅ Checklist Validation

- [ ] Node.js 18.17.0+ installé
- [ ] Python 3.11+ installé
- [ ] PostgreSQL 15+ lancé
- [ ] Redis 7+ lancé
- [ ] Git cloné
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

**Frontend** : http://localhost:3000  
**Backend** : http://localhost:8000  
**Admin** : http://localhost:8000/admin/  
**API Docs** : http://localhost:8000/api/docs/  

**Bonne programmation! 🚀**
