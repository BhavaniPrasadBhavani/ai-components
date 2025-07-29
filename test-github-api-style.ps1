# GitHub Models API Test - GitHub API Style
# Testing with GitHub's actual API authentication pattern

Write-Host "Testing GitHub Models with GitHub API authentication..." -ForegroundColor Green

$token = $env:GITHUB_TOKEN

# GitHub style headers
$headers = @{
    "Accept" = "application/vnd.github+json"
    "Authorization" = "Bearer $token"
    "X-GitHub-Api-Version" = "2022-11-28"
    "Content-Type" = "application/json"
}

# First, let's try to get available models
Write-Host "1. Checking available models..." -ForegroundColor Yellow

$modelsEndpoints = @(
    "https://api.github.com/models",
    "https://models.inference.ai.azure.com/models"
)

foreach ($endpoint in $modelsEndpoints) {
    Write-Host "  Testing models endpoint: $endpoint" -ForegroundColor Cyan
    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method Get -Headers $headers -TimeoutSec 10
        Write-Host "    ✅ Models endpoint works!" -ForegroundColor Green
        Write-Host "    Available models:" -ForegroundColor White
        $response | ConvertTo-Json -Depth 2
        break
    } catch {
        Write-Host "    ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. Testing chat completions..." -ForegroundColor Yellow

# Test chat completions with different patterns
$chatEndpoints = @(
    "https://models.inference.ai.azure.com/chat/completions",
    "https://api.github.com/models/chat/completions"
)

foreach ($endpoint in $chatEndpoints) {
    Write-Host "  Testing chat endpoint: $endpoint" -ForegroundColor Cyan
    
    $body = @{
        model = "gpt-4o-mini"
        messages = @(
            @{
                role = "user"
                content = "Hello"
            }
        )
        max_tokens = 50
    } | ConvertTo-Json -Depth 3

    try {
        $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $body -TimeoutSec 10
        Write-Host "    ✅ Chat endpoint works!" -ForegroundColor Green
        Write-Host "    Response: $($response.choices[0].message.content)" -ForegroundColor White
        break
    } catch {
        Write-Host "    ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorBody = $reader.ReadToEnd()
                Write-Host "    Error details: $errorBody" -ForegroundColor Red
            } catch {
                Write-Host "    Could not read error details" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "Test completed." -ForegroundColor Green
