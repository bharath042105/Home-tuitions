# Home Tuitions Mobile (Flutter)

Feature-first structure:

```
lib/
├── core/       network (Dio + interceptors), router (go_router, role guards),
│               theme (Material 3 light/dark), error handling, constants
└── features/
    ├── auth/           fleshed out as the reference implementation
    ├── tutor_search/   folder + README only, built in Phase 5/6
    ├── booking/        folder + README only, built in Phase 8
    ├── chat/           folder + README only, built in Phase 10
    └── profile/        folder + README only, built in Phase 5/6/7
```

Each feature splits into `data/` (repository implementation, Dio calls),
`domain/` (repository interface, Freezed entities), `presentation/`
(Riverpod providers, screens, widgets) — a pragmatic clean-architecture-lite
split; trivial CRUD features don't get forced use-case classes.

## Local development

Requires the Flutter SDK. This scaffold was created without running
`flutter create`/`pub get` in this environment (no Flutter SDK available here),
so before first run:

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs   # generates *.freezed.dart, *.g.dart
flutter run --dart-define=API_BASE_URL=http://localhost:8080
```

Per docs/phase1/00-mvp-scope.md, mobile implementation work starts after the
website + backend MVP is stable — this structure exists now so Phase 4+ code
can land directly into it without a later restructure.
