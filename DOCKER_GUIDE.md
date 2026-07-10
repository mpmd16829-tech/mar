# 🐳 Guide Complet - Exécuter l'Application dans Docker

> Guide pas à pas pour lancer POÉSIE-MR avec Docker Compose

**Dernière mise à jour** : 2026-07-10  
**Plateforme** : macOS | Ubuntu/Linux | Windows (WSL 2)

---

## 📋 Table des Matières

1. [Vérification Pré-requis](#vérification-pré-requis)
2. [Démarrage Rapide (3 étapes)](#démarrage-rapide)
3. [Commandes Docker Essentielles](#commandes-docker-essentielles)
4. [Accéder aux Services](#accéder-aux-services)
5. [Gérer les Bases de Données](#gérer-les-bases-de-données)
6. [Logs et Debugging](#logs-et-debugging)
7. [Arrêter et Nettoyer](#arrêter-et-nettoyer)
8. [Troubleshooting Docker](#troubleshooting-docker)

---

## ✅ Vérification Pré-requis

### 1. Vérifier Docker est Installé

```bash
# Vérifier Docker
docker --version
# Output attendu: Docker version 24.0.0+

# Vérifier Docker Compose
docker-compose --version
# Output attendu: Docker Compose version v2.0.0+

# Vérifier que Docker daemon tourne
docker ps
# Output: CONTAINER ID   IMAGE   COMMAND   STATUS   PORTS
# Si erreur → Lancer Docker Desktop ou systemctl start docker
```

### 2. Vérifier Git et Cloner le Repo

```bash
# Cloner le repository
git clone https://github.com/mpmd16829-tech/mar.git
cd mar

# Vérifier les fichiers Docker
ls -la docker-compose.dev.yml
ls -la backend/Dockerfile.dev
ls -la frontend/Dockerfile.dev
# Tous les fichiers doivent exister
```

### 3. Vérifier Espace Disque

```bash
# Vérifier l'espace disponible
df -h /          # macOS/Linux
# Besoin minimum : 5 GB libres

# Sur Windows (PowerShell)
Get-Volume | Where-Object { $_.DriveLetter -eq 'C' }
```

---

## ⚡ Démarrage Rapide (3 Étapes)

### **Étape 1 : Préparer l'Environnement**

```bash
# Naviguer dans le dossier du projet
cd mar

# Vérifier que vous êtes au bon endroit
pwd
# Output doit contenir: /path/to/mar

# Lister les fichiers
ls -la
# Vous devez voir:
# - docker-compose.dev.yml
# - backend/
# - frontend/
# - .env.example
```

### **Étape 2 : Configurer les Variables d'Environnement**

```bash
# Copier le fichier de configuration
cp .env.example .env

# Vérifier le fichier .env
cat .env
# Vous devez voir les variables de configuration

# Note: Pour développement, les valeurs par défaut sont OK
# Si besoin de modifier :
# nano .env  # macOS/Linux
# notepad .env  # Windows (PowerShell)
```

### **Étape 3 : Lancer Tous les Services**

```bash
# Démarrer les conteneurs en arrière-plan
docker-compose -f docker-compose.dev.yml up -d

# Attendre ~30 secondes pour que les services démarrent
sleep 30

# Vérifier que tous les services tournent
docker-compose -f docker-compose.dev.yml ps
```

**Output attendu :**
```
NAME                        STATUS              PORTS
poetry-mr-db               Up 2 minutes        0.0.0.0:5432->5432/tcp
poetry-mr-redis            Up 2 minutes        0.0.0.0:6379->6379/tcp
poetry-mr-web              Up 1 minute         0.0.0.0:8000->8000/tcp
poetry-mr-frontend         Up 1 minute         0.0.0.0:3000->3000/tcp
poetry-mr-celery-worker    Up 1 minute
poetry-mr-celery-beat      Up 1 minute
poetry-mr-flower           Up 1 minute         0.0.0.0:5555->5555/tcp
poetry-mr-mailhog          Up 2 minutes        0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp
poetry-mr-adminer          Up 2 minutes        0.0.0.0:8080->8080/tcp
poetry-mr-minio            Up 2 minutes        0.0.0.0:9000->9000/tcp, 0.0.0.0:9001->9001/tcp
```

✅ **Tous les services doivent avoir le statut "Up"**

---

## 🎯 Commandes Docker Essentielles

### A) Démarrer/Arrêter l'Application

```bash
# ========== DÉMARRER ==========

# Option 1 : Démarrer en arrière-plan (recommandé)
docker-compose -f docker-compose.dev.yml up -d

# Option 2 : Démarrer et afficher les logs en temps réel
docker-compose -f docker-compose.dev.yml up

# Option 3 : Rebuild les images avant de démarrer (si changements)
docker-compose -f docker-compose.dev.yml up -d --build

# ========== ARRÊTER ==========

# Arrêter tous les services (données préservées)
docker-compose -f docker-compose.dev.yml down

# Arrêter avec suppression des volumes (ATTENTION: données perdues!)
docker-compose -f docker-compose.dev.yml down -v

# Simplement pausiser (sans arrêter)
docker-compose -f docker-compose.dev.yml pause

# Reprendre après pause
docker-compose -f docker-compose.dev.yml unpause
```

### B) Voir le Statut

```bash
# Voir tous les conteneurs et leur statut
docker-compose -f docker-compose.dev.yml ps

# Voir les statistiques (CPU, mémoire, etc.)
docker stats

# Voir les logs
docker-compose -f docker-compose.dev.yml logs
docker-compose -f docker-compose.dev.yml logs -f web          # Suivre logs Django
docker-compose -f docker-compose.dev.yml logs -f frontend     # Suivre logs React
docker-compose -f docker-compose.dev.yml logs -f celery_worker  # Suivre logs Celery
```

### C) Exécuter des Commandes dans les Conteneurs

```bash
# ========== DJANGO COMMANDS ==========

# Appliquer les migrations
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate

# Créer un superutilisateur (Admin)
docker-compose -f docker-compose.dev.yml exec web python manage.py createsuperuser
# Saisir:
# Email: admin@poetry-mr.local
# Password: DevPassword123!

# Charger des données de test
docker-compose -f docker-compose.dev.yml exec web python manage.py loaddata fixtures/categories.json

# Vider la base de données (DEV ONLY!)
docker-compose -f docker-compose.dev.yml exec web python manage.py flush

# Accéder au shell Django
docker-compose -f docker-compose.dev.yml exec web python manage.py shell

# ========== BASH SHELL ==========

# Accéder au bash du conteneur Django
docker-compose -f docker-compose.dev.yml exec web bash
# Puis vous pouvez exécuter n'importe quelle commande:
# root@container:/app# ls
# root@container:/app# python manage.py runserver

# Accéder au bash du conteneur frontend
docker-compose -f docker-compose.dev.yml exec frontend bash

# ========== DATABASE COMMANDS ==========

# Accéder au psql (PostgreSQL shell)
docker-compose -f docker-compose.dev.yml exec db psql -U postgres -d poetry_mr_dev

# Dans le psql:
# poetry_mr_dev=# \dt                    # Lister les tables
# poetry_mr_dev=# SELECT * FROM poems;   # Requête SQL
# poetry_mr_dev=# \q                     # Quitter
```

### D) Rebuild et Updates

```bash
# Rebuild les images Docker (après modifications de code)
docker-compose -f docker-compose.dev.yml build

# Rebuild without cache (force rebuild complet)
docker-compose -f docker-compose.dev.yml build --no-cache

# Pull les images (si besoin de mise à jour)
docker-compose -f docker-compose.dev.yml pull

# Vérifier les images
docker images | grep poetry
```

---

## 🌐 Accéder aux Services

Une fois Docker lancé, voici tous les services disponibles :

### Frontend (React 19)
```
URL: http://localhost:3000
Fonctionnalité: Interface utilisateur
Hot Reload: ✅ Les changements sont visibles en < 1 sec
```

### Backend API (Django + DRF)
```
URL: http://localhost:8000
Swagger Docs: http://localhost:8000/api/docs/
ReDoc: http://localhost:8000/api/redoc/
Admin Panel: http://localhost:8000/admin/
```

### Base de Données (PostgreSQL)
```
Host: localhost
Port: 5432
Database: poetry_mr_dev
User: postgres
Password: postgres
Tool Web: http://localhost:8080 (Adminer)
```

### Cache (Redis)
```
Host: localhost
Port: 6379
Password: (aucun)
CLI: redis-cli
```

### Email Development (Mailhog)
```
SMTP Host: localhost
SMTP Port: 1025
Web UI: http://localhost:8025
Emails reçus: Visibles dans l'interface
```

### Celery Dashboard (Flower)
```
URL: http://localhost:5555
Fonctionnalité: Monitor tâches async
Workers: Affichés en temps réel
```

### Database Management (Adminer)
```
URL: http://localhost:8080
Server: db
User: postgres
Password: postgres
Database: poetry_mr_dev
Fonctionnalité: Interface SQL web
```

### S3 Storage (MinIO)
```
API: http://localhost:9000
Console: http://localhost:9001
User: minioadmin
Password: minioadmin
Fonctionnalité: Stockage local S3-compatible
```

---

## 🗄️ Gérer les Bases de Données

### A) Initialiser la Base de Données

```bash
# Créer les tables (migrations)
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate

# Vérifier que les migrations sont appliquées
docker-compose -f docker-compose.dev.yml exec web python manage.py showmigrations

# Créer un superutilisateur
docker-compose -f docker-compose.dev.yml exec web python manage.py createsuperuser
```

### B) Accéder à PostgreSQL

```bash
# Méthode 1 : Via psql dans Docker
docker-compose -f docker-compose.dev.yml exec db psql -U postgres

# Méthode 2 : Utiliser Adminer (GUI)
# Ouvrir http://localhost:8080
# Server: db
# User: postgres
# Password: postgres

# Méthode 3 : Accès direct depuis votre machine
# Si PostgreSQL est installé localement:
psql -h localhost -U postgres -d poetry_mr_dev
# Si demande de password: postgres
```

### C) Charger Données de Test

```bash
# Charger les catégories
docker-compose -f docker-compose.dev.yml exec web python manage.py loaddata apps/poems/fixtures/categories.json

# Charger les poèmes d'exemple
docker-compose -f docker-compose.dev.yml exec web python manage.py loaddata apps/poems/fixtures/sample_poems.json

# Ou créer des données de test avec un script
docker-compose -f docker-compose.dev.yml exec web python manage.py seed_data
```

### D) Exporter/Importer la Base de Données

```bash
# Exporter la base de données
docker-compose -f docker-compose.dev.yml exec db pg_dump -U postgres poetry_mr_dev > backup.sql

# Importer une sauvegarde
docker-compose -f docker-compose.dev.yml exec -T db psql -U postgres poetry_mr_dev < backup.sql

# Copier un fichier du conteneur vers local
docker cp poetry-mr-db:/var/lib/postgresql/data/backup.sql ./backup.sql
```

### E) Réinitialiser la Base de Données

```bash
# ⚠️ ATTENTION: Cela supprimera TOUTES les données!

# Option 1 : Flush (garder les tables)
docker-compose -f docker-compose.dev.yml exec web python manage.py flush

# Option 2 : Supprimer et recréer les volumes
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate
```

---

## 📊 Logs et Debugging

### A) Voir les Logs

```bash
# Voir tous les logs (depuis le début)
docker-compose -f docker-compose.dev.yml logs

# Suivre les logs en temps réel
docker-compose -f docker-compose.dev.yml logs -f

# Logs d'un service spécifique
docker-compose -f docker-compose.dev.yml logs -f web         # Django
docker-compose -f docker-compose.dev.yml logs -f frontend    # React
docker-compose -f docker-compose.dev.yml logs -f redis       # Redis
docker-compose -f docker-compose.dev.yml logs -f db          # PostgreSQL

# Voir les 100 dernières lignes
docker-compose -f docker-compose.dev.yml logs --tail 100

# Voir les logs depuis les 30 dernières minutes
docker-compose -f docker-compose.dev.yml logs --since 30m
```

### B) Entrer dans un Conteneur

```bash
# Bash shell Django
docker-compose -f docker-compose.dev.yml exec web bash

# Dans le bash, vous pouvez:
# root@xyz:/app# python manage.py shell
# root@xyz:/app# cat logs/error.log
# root@xyz:/app# pip list
# root@xyz:/app# exit

# Bash shell frontend
docker-compose -f docker-compose.dev.yml exec frontend bash
# root@xyz:/app# npm list
# root@xyz:/app# exit
```

### C) Inspecter un Conteneur

```bash
# Voir les détails complets d'un conteneur
docker inspect poetry-mr-web

# Voir l'IP du conteneur
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' poetry-mr-web

# Voir les variables d'environnement
docker exec poetry-mr-web env
```

### D) Problèmes Courants

```bash
# Conteneur crash immédiatement?
docker-compose -f docker-compose.dev.yml logs poetry-mr-web

# Port déjà utilisé?
docker ps  # Voir tous les conteneurs
lsof -i :8000  # Voir quel processus utilise le port 8000
kill -9 <PID>  # Arrêter le processus

# Pas de connectivité entre conteneurs?
docker network ls
docker network inspect poetry-mr-net

# Vérifier la santé des services
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 🛑 Arrêter et Nettoyer

### A) Arrêter les Services

```bash
# Arrêter tous les services (données préservées)
docker-compose -f docker-compose.dev.yml down

# Arrêter spécifiquement
docker stop poetry-mr-web
docker stop poetry-mr-frontend

# Tuer un conteneur (force)
docker kill poetry-mr-web
```

### B) Nettoyer les Ressources

```bash
# Supprimer les conteneurs arrêtés
docker-compose -f docker-compose.dev.yml down

# Supprimer tous les conteneurs ET volumes (⚠️ données perdues!)
docker-compose -f docker-compose.dev.yml down -v

# Nettoyer toutes les images non utilisées
docker image prune

# Nettoyer tout (conteneurs, images, volumes, networks)
docker system prune -a --volumes
# ⚠️ C'est destructif, faire seulement après backup!
```

### C) Vérifier l'Espace Disque

```bash
# Voir l'utilisation disque de Docker
docker system df

# Exemple output:
# TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
# Images          10        5         2.5GB     1.2GB
# Containers      8         3         500MB     400MB
# Local Volumes   5         3         1GB       200MB
```

---

## 🐛 Troubleshooting Docker

### Problème 1 : Les Services ne Démarrent Pas

```bash
# Solution : Vérifier les logs
docker-compose -f docker-compose.dev.yml logs

# Vérifier les erreurs spécifiques
docker-compose -f docker-compose.dev.yml logs web
docker-compose -f docker-compose.dev.yml logs db

# Vérifier que Docker daemon tourne
docker ps

# Si erreur "Cannot connect to Docker daemon":
# macOS: Ouvrir Docker Desktop
# Linux: sudo systemctl start docker
# Windows: Ouvrir Docker Desktop
```

### Problème 2 : Port Déjà Utilisé

```bash
# Trouver qui utilise le port
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Arrêter le processus
kill -9 <PID>

# Ou changer le port dans docker-compose.dev.yml
# Chercher "ports:" et modifier (ex: "3001:3000")
```

### Problème 3 : Base de Données ne Démarre Pas

```bash
# Vérifier les logs PostgreSQL
docker-compose -f docker-compose.dev.yml logs db

# Vérifier la santé du service
docker-compose -f docker-compose.dev.yml ps db

# Si "Starting":
# Attendre plus longtemps (timeout 60s)
sleep 60
docker-compose -f docker-compose.dev.yml ps db

# Si "Exited":
# Voir les erreurs
docker-compose -f docker-compose.dev.yml logs db --tail 50

# Essayer rebuild
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Problème 4 : Frontend ne se Charge pas

```bash
# Vérifier les logs React
docker-compose -f docker-compose.dev.yml logs frontend

# Vérifier que le serveur écoute
docker exec poetry-mr-frontend netstat -tlnp | grep 3000

# Redémarrer le conteneur frontend
docker-compose -f docker-compose.dev.yml restart frontend

# Attendre le rebuild (peut prendre 30-60s)
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Problème 5 : Migrations Échouent

```bash
# Voir l'erreur exacte
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate --verbosity 3

# Essayer un reset
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate --fake-initial

# Ou reset complet
docker-compose -f docker-compose.dev.yml exec web python manage.py flush
docker-compose -f docker-compose.dev.yml exec web python manage.py migrate
```

### Problème 6 : Celery Workers ne Répondent Pas

```bash
# Vérifier les logs Celery
docker-compose -f docker-compose.dev.yml logs celery_worker

# Vérifier Redis
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping

# Redémarrer Celery
docker-compose -f docker-compose.dev.yml restart celery_worker
docker-compose -f docker-compose.dev.yml restart celery_beat

# Vérifier les tâches actives
docker-compose -f docker-compose.dev.yml exec celery_worker celery -A config inspect active
```

---

## 📝 Alias Utiles pour Bash/Zsh

Ajouter à `~/.bashrc` ou `~/.zshrc` :

```bash
# PO\u00c9SIE-MR aliases
alias pm-up="docker-compose -f docker-compose.dev.yml up -d && docker-compose -f docker-compose.dev.yml logs -f"
alias pm-down="docker-compose -f docker-compose.dev.yml down"
alias pm-logs="docker-compose -f docker-compose.dev.yml logs -f"
alias pm-ps="docker-compose -f docker-compose.dev.yml ps"
alias pm-bash="docker-compose -f docker-compose.dev.yml exec web bash"
alias pm-migrate="docker-compose -f docker-compose.dev.yml exec web python manage.py migrate"
alias pm-shell="docker-compose -f docker-compose.dev.yml exec web python manage.py shell"
alias pm-test="docker-compose -f docker-compose.dev.yml exec web pytest"
alias pm-psql="docker-compose -f docker-compose.dev.yml exec db psql -U postgres"
alias pm-logs-django="docker-compose -f docker-compose.dev.yml logs -f web"
alias pm-logs-react="docker-compose -f docker-compose.dev.yml logs -f frontend"
alias pm-logs-celery="docker-compose -f docker-compose.dev.yml logs -f celery_worker"

# Recharger bash
source ~/.bashrc  # ou source ~/.zshrc
```

**Maintenant vous pouvez utiliser:**
```bash
pm-up              # Démarrer l'app
pm-logs            # Voir les logs
pm-bash            # Accéder au bash Django
pm-migrate         # Migrations
```

---

## ✅ Checklist de Vérification

Avant de dire "l'app fonctionne":

- [ ] Docker et Docker Compose installés
- [ ] Git cloné (`git clone ...`)
- [ ] `.env.example` copié en `.env`
- [ ] `docker-compose -f docker-compose.dev.yml up -d` lancé
- [ ] `docker-compose -f docker-compose.dev.yml ps` affiche tous les services "Up"
- [ ] `docker-compose -f docker-compose.dev.yml exec web python manage.py migrate` sans erreur
- [ ] Frontend accessible: http://localhost:3000 ✅
- [ ] Backend accessible: http://localhost:8000/api/ ✅
- [ ] Admin accessible: http://localhost:8000/admin/ ✅
- [ ] Base de données working: http://localhost:8080 ✅
- [ ] Celery workers running: http://localhost:5555 ✅

---

## 🎉 Vous Êtes Prêt!

L'application tourne complètement dans Docker!

### Services Disponibles:
- **Frontend**: http://localhost:3000 🎨
- **Backend API**: http://localhost:8000 🔧
- **Admin Panel**: http://localhost:8000/admin/ 🔑
- **Swagger Docs**: http://localhost:8000/api/docs/ 📚
- **Email Testing**: http://localhost:8025 📧
- **Database GUI**: http://localhost:8080 🗄️
- **Celery Dashboard**: http://localhost:5555 📊
- **S3 Console**: http://localhost:9001 ☁️

### Commandes Rapides:
```bash
pm-up              # Démarrer
pm-down            # Arrêter
pm-logs            # Voir logs
pm-bash            # Bash shell
pm-migrate         # Migrations
pm-test            # Tests
```

**Questions?** Consultez les sections Troubleshooting ou ouvrez une issue GitHub!

---

*Dernière mise à jour : 2026-07-10 | Guide Docker Complet*
