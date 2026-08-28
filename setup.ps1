$ErrorActionPreference = 'Stop'
Write-Host 'Installing Bulkmailer Web dependencies...'
npm install
if (-not (Test-Path '.env.local')) {
  Copy-Item '.env.local.example' '.env.local'
  Write-Host 'Created .env.local. Fill GOOGLE_CLIENT_SECRET and APP_ENCRYPTION_KEY before starting.'
}
Write-Host 'Setup complete. Run: npm run dev'
