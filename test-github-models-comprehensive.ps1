# GitHub Models API Test - Multiple Endpoints
# This script tests different possible GitHub Models API configurations

Write-Host "Testing GitHub Models API - Multiple Configurations..." -ForegroundColor Green
Write-Host ""

$token = "your-github-token-here"

# Test different possible endpoints and configurations
$endpoints = @(
    "https://models.inference.ai.azure.com/chat/completions",
    "https://api.githubmodels.com/chat/completions",
    "https://models.inference.ai.azure.com/v1/chat/completions"
)

$models = @("gpt-4o-mini", "gpt-4o", "o1-mini")

foreach ($endpoint in $endpoints) {
    Write-Host "Testing endpoint: $endpoint" -ForegroundColor Yellow
    
    foreach ($model in $models) {
        Write-Host "  Testing model: $model" -ForegroundColor Cyan
        
        $headers = @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $token"
        }

        $body = @{
            model = $model
            messages = @(
                @{
                    role = "user"
                    content = "Say hello"
                }
            )
            max_tokens = 50
        } | ConvertTo-Json -Depth 3

        try {
            $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $body -TimeoutSec 10
            Write-Host "    ✅ SUCCESS!" -ForegroundColor Green
            Write-Host "    Model: $model, Endpoint: $endpoint" -ForegroundColor Green
            Write-Host "    Response: $($response.choices[0].message.content)" -ForegroundColor White
            Write-Host ""
            return # Exit on first success
        } catch {
            $statusCode = "Unknown"
            $errorMsg = $_.Exception.Message
            
            if ($_.Exception.Response) {
                $statusCode = $_.Exception.Response.StatusCode
            }
            
            Write-Host "    ❌ Failed - Status: $statusCode" -ForegroundColor Red
            Write-Host "    Error: $errorMsg" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "All tests completed. If no success was shown, the token may be invalid or GitHub Models may not be accessible." -ForegroundColor Yellow
