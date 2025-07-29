#!/bin/bash

# Test script for GitHub Models API integration
# This script tests if the AI service can connect to GitHub Models API

echo "Testing GitHub Models API integration..."
echo "API Key: \$GITHUB_TOKEN"
echo "Base URL: https://models.inference.ai.azure.com"
echo "Model: o1-mini"
echo ""

# Test the API endpoint
curl -X POST "https://models.inference.ai.azure.com/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer \$GITHUB_TOKEN" \
  -d '{
    "model": "o1-mini",
    "messages": [
      {
        "role": "user",
        "content": "Hello! Can you help me create a simple React button component?"
      }
    ],
    "max_tokens": 150
  }'

echo ""
echo "Test completed. Check the response above."
