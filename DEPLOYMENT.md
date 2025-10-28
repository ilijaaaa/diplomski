# 🚀 Deployment Vodič

Kompletni vodič za deployment Muzičkog Takmičenja Sistema.

## 📋 Preduslovi za Produkciju

- **Server**: Ubuntu 20.04 LTS ili viša
- **Domain**: Registovan domejn (primer: example.com)
- **SSL**: Let's Encrypt sertifikat
- **Database**: Oracle Database na produkcijskom serveru
- **Reverse Proxy**: Nginx
- **Process Manager**: Gunicorn + Supervisor

## 🏢 Produkcijski Setup

### 1. Server Konfiguracija

```bash
# Update sistem
sudo apt update
sudo apt upgrade -y

# Instaliraj potrebne pakete
sudo apt install -y python3.11 python3.11-venv python3-pip
sudo apt install -y nodejs npm
sudo apt install -y nginx
sudo apt install -y supervisor
sudo apt install -y git
```

### 2. Clone Projekta

```bash
cd /opt
sudo git clone <your-repo> diplomski
sudo chown -R $USER:$USER diplomski
cd diplomski
```

### 3. Backend Setup

```bash
cd back

# Kreiraj virtuelno okruženje
python3.11 -m venv venv
source venv/bin/activate

# Instaliraj zavisnosti
pip install -r requirements.txt
pip install gunicorn

# Konfiguruj .env za produkciju
cat > .env << EOF
DEBUG=False
SECRET_KEY=your-long-random-secret-key-here
ALLOWED_HOSTS=example.com,www.example.com

# Database
DB_NAME=xepdb1
DB_USER=in15
DB_PASSWORD=ftn
DB_HOST=oracle.example.com
DB_PORT=1521

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1

# CORS
CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com
EOF

# Primeni migracije
python manage.py migrate

# Skupi static fajlove
python manage.py collectstatic --noinput

# Kreiraj superuser
python manage.py createsuperuser
```

### 4. Frontend Setup

```bash
cd ../front

# Kreiraj .env za produkciju
cat > .env.production << EOF
REACT_APP_API_URL=https://api.example.com
EOF

# Build React app
npm install
npm run build

# Build folder sad sadrži HTML/CSS/JS za produkciju
```

### 5. Nginx Konfiguracija

```bash
# Kreiraj Nginx config
sudo cat > /etc/nginx/sites-available/diplomski << EOF
# Backend API
upstream django {
    server 127.0.0.1:8001;
}

# Frontend
upstream frontend {
    server 127.0.0.1:3001;
}

# Redirect HTTP na HTTPS
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS Server - API
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    client_max_body_size 100M;

    location / {
        proxy_pass http://django;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static/ {
        alias /opt/diplomski/back/staticfiles/;
    }

    location /media/ {
        alias /opt/diplomski/back/media/;
    }
}

# HTTPS Server - Frontend
server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        root /opt/diplomski/front/build;
        try_files \$uri /index.html;
    }

    location /api/ {
        proxy_pass https://api.example.com/;
    }
}
EOF

# Aktiviraj config
sudo ln -s /etc/nginx/sites-available/diplomski /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate sa Let's Encrypt

```bash
# Instaliraj Certbot
sudo apt install certbot python3-certbot-nginx -y

# Dobij sertifikat
sudo certbot certonly --nginx \
    -d example.com \
    -d www.example.com \
    -d api.example.com

# Auto-renew konfiguracija
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 7. Gunicorn Setup

```bash
cd /opt/diplomski/back

# Kreiraj systemd service
sudo cat > /etc/systemd/system/diplomski-backend.service << EOF
[Unit]
Description=Diplomski Backend
After=network.target
Wants=diplomat-backend.timer

[Service]
Type=notify
User=$USER
WorkingDirectory=/opt/diplomski/back
ExecStart=/opt/diplomski/back/venv/bin/gunicorn \
    --workers 4 \
    --bind 127.0.0.1:8001 \
    --timeout 120 \
    config.wsgi:application
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Aktiviraj i pokreni
sudo systemctl daemon-reload
sudo systemctl enable diplomski-backend.service
sudo systemctl start diplomski-backend.service
```

### 8. Frontend Servisiranje

```bash
# Ako koristiš Node.js server
sudo cat > /etc/systemd/system/diplomski-frontend.service << EOF
[Unit]
Description=Diplomski Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/diplomski/front
ExecStart=/usr/bin/npx serve -s build -l 3001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Ili direktno via Nginx (preporučeno)
# Nginx se koristi kao proxy za built React app
```

## 📊 Monitoring

### Logs

```bash
# Backend logs
sudo journalctl -u diplomski-backend.service -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo tail -f /var/log/syslog
```

### Health Check

```bash
# Backend health
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.example.com/api/auth/me/

# Frontend health
curl https://example.com/
```

## 🔄 Backup i Recovery

### Database Backup

```bash
# Dnevni backup
sudo crontab -e
# Dodaj:
# 0 2 * * * /opt/diplomski/scripts/backup_db.sh

# Backup script
cat > /opt/diplomski/scripts/backup_db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/diplomski/backups"
mkdir -p $BACKUP_DIR

# Oracle export
expdp in15/ftn@xepdb1 \
  full=Y \
  file=$BACKUP_DIR/diplomski_$DATE.dmp \
  log=$BACKUP_DIR/diplomski_$DATE.log

# Upload na storage
# aws s3 cp $BACKUP_DIR/diplomski_$DATE.dmp s3://your-bucket/
EOF

chmod +x /opt/diplomski/scripts/backup_db.sh
```

### Application Backup

```bash
# Dnevni backup
0 3 * * * tar -czf /opt/diplomski/backups/app_$(date +\%Y\%m\%d).tar.gz /opt/diplomski/
```

## 🚨 Troubleshooting

### Backend ne pokreće

```bash
# Proveri status
sudo systemctl status diplomski-backend.service

# Vidi logs
sudo journalctl -u diplomski-backend.service -n 50

# Manuelno testiraj
cd /opt/diplomski/back
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

### Database connection problem

```bash
# Proveri Oracle konekciju
sqlplus in15/ftn@localhost:1521/xepdb1

# Proveri Django konekciju
cd /opt/diplomski/back
python manage.py shell
>>> from django.db import connection
>>> connection.ensure_connection()
```

### HTTPS certificate problem

```bash
# Proveri cert
sudo openssl x509 -in /etc/letsencrypt/live/example.com/fullchain.pem -text

# Renewu cert
sudo certbot renew --force-renewal

# Nginx test
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 Security Hardening

### 1. Firewall Setup

```bash
# UFW Firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
```

### 2. SSH Key Setup

```bash
# Generisaj SSH key (ako već nije postojeća)
ssh-keygen -t rsa -b 4096

# Disabluj password auth
sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/' \
  /etc/ssh/sshd_config
sudo systemctl restart ssh
```

### 3. Django Security Settings

```python
# back/config/settings.py

# Produkcija
DEBUG = False
ALLOWED_HOSTS = ['example.com', 'www.example.com', 'api.example.com']

# Security
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_SECURITY_POLICY = {
    "default-src": ("'self'",),
    "script-src": ("'self'", "cdn.example.com"),
    "style-src": ("'self'", "'unsafe-inline'"),
}
```

### 4. Database Security

```bash
# Kreiraj posebnog DB user-a za produkciju
sqlplus / as sysdba
CREATE USER diplom_prod IDENTIFIED BY strong_password_here;
GRANT CONNECT, RESOURCE TO diplom_prod;
GRANT CREATE TABLE TO diplom_prod;
```

## 📈 Performance Optimization

### 1. Database Query Optimization

```python
# Koristi select_related i prefetch_related
from django.db.models import Prefetch

# Bad
ucesnici = Ucesnik.objects.all()
for ucesnik in ucesnici:
    print(ucesnik.korisnik.username)  # N+1 queries

# Good
ucesnici = Ucesnik.objects.select_related('korisnik').all()
```

### 2. Caching

```python
# Redis cache
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}

# Cache API responses
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)  # 15 minuta
def lista_duosa(request):
    ...
```

### 3. Frontend Optimization

```bash
# Minify React build
npm run build  # Automatski minificira

# Gzip kompresija u Nginx
gzip on;
gzip_types text/plain text/css text/javascript application/json;
gzip_min_length 256;
```

## 🎯 CI/CD Setup (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Test Backend
        run: |
          cd back
          python -m pytest
      
      - name: Build Frontend
        run: |
          cd front
          npm install
          npm run build
      
      - name: Deploy
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: |
          ssh -i $DEPLOY_KEY user@server \
            'cd /opt/diplomski && git pull && ./deploy.sh'
```

## 📊 Monitoring sa Prometheus

```bash
# Instaliraj Prometheus
sudo apt install prometheus -y

# Config: /etc/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'django'
    static_configs:
      - targets: ['127.0.0.1:8001']
```

## 🚀 Production Checklist

- [ ] DEBUG = False
- [ ] SECRET_KEY je jaka i promenljiva
- [ ] ALLOWED_HOSTS je konfiguriran
- [ ] SSL/HTTPS je omogućen
- [ ] Database je na produkcijskom serveru
- [ ] Static files su collected
- [ ] Logs su konfiguriran
- [ ] Backup je automatizovan
- [ ] Monitoring je aktivan
- [ ] Firewall je konfiguriran
- [ ] SSH key auth je aktivan
- [ ] Rate limiting je omogućen
- [ ] CORS je restriced
- [ ] Sertifikati se auto-renew

---

**Napomena**: Svi korak-ovi trebali bi da budu dostiliti za specifičan server setup.
