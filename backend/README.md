# Home Tuitions Backend

Spring Boot 3 / Java 21 modular monolith. See `docs/phase2/` for architecture, and `docs/phase3/README.md` for how this project is structured.

## Local development

```bash
docker compose up -d          # Postgres (with PostGIS) + Redis
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Swagger UI: http://localhost:8080/swagger-ui.html

> This scaffold does not include the Maven wrapper binaries (`mvnw`/`.mvn/wrapper`) yet — run
> `mvn -N io.takari:maven:wrapper -Dmaven=3.9.9` once inside `backend/` (requires a local Maven
> install) to generate them, or substitute `mvn` for `./mvnw` in all commands until then.

## Module layout

Package-by-module under `com.hometuitions.backend.*` — one package per bounded context from
`docs/phase2/02-high-level-design.md`. Each module is internally layered
(`controller` / `service` (+`impl`) / `repository` / `dto` / `entity` / `mapper`) and may only
depend on another module's `*Service` interface, never its repository or entity classes.

`auth` is fleshed out as the concrete reference implementation (JWT + Redis-backed refresh token
rotation, per `docs/phase2/03-low-level-design.md`  3). Other modules currently contain only
`package-info.java` describing their responsibility — real code lands in Phases 4 onward.

## Migrations

Flyway migrations in `src/main/resources/db/migration/` mirror `docs/phase2/05-database-schema.md`
verbatim (V1–V7). `spring.jpa.hibernate.ddl-auto=validate` — Flyway is the only source of schema
truth; Hibernate never generates DDL.
