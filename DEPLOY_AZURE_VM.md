# MRI Uploader — Azure VM Deployment Checklist

## Prereqs
- VM reachable via SSH
- Ubuntu/Debian preferred
- Domain (optional) OR IP-based access
- Postgres connection string (local on VM OR external Azure Postgres)
- Stripe keys + webhook secret
- SMTP/Email config OR EMAIL_MODE=console

## App env vars (production)
- DATABASE_URL=
- APP_URL=
- DATA_ROOT=/var/mri-uploader/data
- MAX_UPLOAD_BYTES=...
- EMAIL_MODE=console OR SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM
- STRIPE_SECRET_KEY=
- STRIPE_WEBHOOK_SECRET=

## Deploy steps on VM
1) Install Node LTS + npm
2) Install Nginx
3) Create app user + folders (/var/mri-uploader/data)
4) Copy code to /srv/mri-uploader
5) npm ci && npm run build
6) prisma migrate deploy (or db push if using that)
7) Start app (pm2 or systemd)
8) Nginx reverse proxy -> localhost:3000
9) Set Nginx upload limits + timeouts
10) Configure HTTPS (optional: certbot)
11) Test: upload -> finalize -> pay -> webhook -> success

## Verification tests
- Upload > 1GB file works
- Restart app does not delete files
- Only verified uploads enable payment
- Stripe webhook marks PAID
- Files stored only under DATA_ROOT