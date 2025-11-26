# Flower Shop Backend

Development setup:

1. Install dependencies

```powershell
cd backend
npm install
```

2. Run the server (development)

```powershell
npm run dev
```

3. Configure environment variables in `.env` (copy `.env.example` or create `.env`) including:
- `MONGODB_URI`
- `JWT_SECRET`
- Optional SMTP settings for email receipts:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Notes:
- The backend will skip PDF generation and email-sending if `pdfkit`/`nodemailer` are not installed or if SMTP variables are not configured.
- If port 5000 is already in use on Windows, find and kill the process using:

```powershell
netstat -aon | findstr :5000
# then
taskkill /PID <pid> /F
```

- If you plan to enable PDF generation and email sending, install both packages:

```powershell
npm install pdfkit nodemailer
```

If you see a `MODULE_NOT_FOUND` error for `pdfkit` or `nodemailer`, either install the packages above or keep them uninstalled — the backend will fall back to HTML receipts and skip email sending if those modules are missing.
