# SonarQube Analysis Script
# This script runs SonarQube analysis on the Syntera codebase

Write-Host "Starting SonarQube Analysis..." -ForegroundColor Green

# Check if SonarQube is running
$sonarStatus = Invoke-WebRequest -Uri "http://localhost:9000/api/system/status" -UseBasicParsing -ErrorAction SilentlyContinue
if (-not $sonarStatus) {
    Write-Host "Error: SonarQube is not accessible at http://localhost:9000" -ForegroundColor Red
    Write-Host "Please ensure SonarQube is running: docker-compose up -d sonarqube" -ForegroundColor Yellow
    exit 1
}

Write-Host "SonarQube is running. Status: $($sonarStatus.Content)" -ForegroundColor Green

# Instructions for token creation
Write-Host "`nTo run the analysis, you need a SonarQube token:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:9000 in your browser" -ForegroundColor Cyan
Write-Host "2. Login with admin/admin (change password if prompted)" -ForegroundColor Cyan
Write-Host "3. Go to: My Account > Security > Generate Token" -ForegroundColor Cyan
Write-Host "4. Name it 'scanner-token' and copy the token" -ForegroundColor Cyan
Write-Host "5. Run this command with your token:" -ForegroundColor Cyan
Write-Host "   docker run --rm --network syntera_default -v `"`$(pwd):/usr/src`" -w /usr/src -e SONAR_TOKEN=YOUR_TOKEN_HERE sonarsource/sonar-scanner-cli:latest" -ForegroundColor White

# Alternative: Try to create token via API (requires authentication)
Write-Host "`nAttempting to create token automatically..." -ForegroundColor Yellow

$tokenBody = @{
    name = "scanner-token-$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

try {
    # Try with basic auth
    $base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:admin"))
    $headers = @{
        "Authorization" = "Basic $base64Auth"
        "Content-Type" = "application/json"
    }
    
    $tokenResponse = Invoke-RestMethod -Uri "http://localhost:9000/api/user_tokens/generate" -Method POST -Headers $headers -Body $tokenBody -ErrorAction Stop
    $token = $tokenResponse.token
    
    Write-Host "Token created successfully!" -ForegroundColor Green
    Write-Host "Running analysis with token..." -ForegroundColor Green
    
    # Run the scanner
    docker run --rm --network syntera_default `
        -v "$(pwd):/usr/src" `
        -w /usr/src `
        -e SONAR_HOST_URL=http://sonarqube:9000 `
        -e SONAR_TOKEN=$token `
        sonarsource/sonar-scanner-cli:latest
    
    Write-Host "`nAnalysis complete! View results at: http://localhost:9000/dashboard?id=syntera" -ForegroundColor Green
} catch {
    Write-Host "Could not create token automatically. Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please create a token manually using the instructions above." -ForegroundColor Yellow
}





