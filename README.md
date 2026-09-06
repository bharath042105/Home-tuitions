# Home Tuitions Platform

An enterprise platform connecting students and parents with verified expert home tutors.

---

## 📚 API Documentation (Swagger / OpenAPI)

- **Live GitHub Pages Swagger UI**: [https://bharath042105.github.io/Home-tuitions/](https://bharath042105.github.io/Home-tuitions/)
- **OpenAPI 3.0 Specification**: [`swagger-docs/openapi.json`](./swagger-docs/openapi.json)

---

## 🚀 Repository Structure

- `backend/` - Spring Boot 3.3 / Java 21 REST API backend (PostgreSQL, Redis, Flyway, JWT Authentication, Razorpay, S3)
- `web/` - Next.js web applications (Admin Portal, Parent/Student Web App)
- `mobile/` - Mobile applications
- `swagger-docs/` - Static Swagger UI bundle & OpenAPI 3.0 specification deployed to GitHub Pages
- `.github/workflows/deploy-swagger.yml` - Automated GitHub Actions workflow to deploy Swagger docs to GitHub Pages

---

## 🛠️ Deploying Swagger to GitHub Pages

1. In your GitHub repository: go to **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Any push to `main` touching `swagger-docs/` automatically deploys the updated API docs to GitHub Pages.
