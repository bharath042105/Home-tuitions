$env:MSYS_NO_PATHCONV = 1
$JWT_SECRET = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

docker rm -f backend-app 2>$null

docker run -d --network backend_default --name backend-app `
  -v "${PWD}:/app" `
  -v "backend_maven_repo:/root/.m2" `
  -w /app `
  -p 8080:8080 `
  -e DB_HOST=postgres `
  -e REDIS_HOST=redis `
  -e SPRING_PROFILES_ACTIVE=dev `
  -e JWT_SECRET=$JWT_SECRET `
  -e S3_ENDPOINT=http://localhost:9000 `
  -e S3_BUCKET=hometuitions-dev-documents `
  -e AWS_ACCESS_KEY_ID=minioadmin `
  -e AWS_SECRET_ACCESS_KEY=minioadmin `
  maven:3.9-eclipse-temurin-21 mvn spring-boot:run

Write-Host "Backend container starting. Tailing logs (Ctrl+C to stop watching; container keeps running)..."
docker logs -f backend-app
