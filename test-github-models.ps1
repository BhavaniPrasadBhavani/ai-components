# Test script for GitHub Models API integration
# This script tests if the AI service can connect to GitHub Models API

Write-Host "Testing GitHub Models API integration..." -ForegroundColor Green
Write-Host "API Key: your-github-token-here"
Write-Host "Base URL: https://models.inference.ai.azure.com"
Write-Host "Model: gpt-4o-mini (o1-mini not available in GitHub Models)"
Write-Host ""

# Test the API endpoint
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer your-github-token-here"
}

$body = @{
    model = "gpt-4o-mini"
    messages = @(
        @{
            role = "user"
            content = "Hello! Can you help me create a simple React button component?"
        }
    )
    max_tokens = 150
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri "https://models.inference.ai.azure.com/chat/completions" -Method Post -Headers $headers -Body $body
    Write-Host "✅ API test successful!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ API test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Response Body: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read error response body" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "Test completed." -ForegroundColor Green
