import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:hometuitions_mobile/features/auth/domain/auth_repository.dart';
import 'package:hometuitions_mobile/features/auth/presentation/providers/auth_providers.dart';
import 'package:hometuitions_mobile/features/auth/presentation/screens/login_screen.dart';

class _MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  late _MockAuthRepository repository;

  setUp(() {
    repository = _MockAuthRepository();
  });

  Widget wrapped() {
    return ProviderScope(
      overrides: [authRepositoryProvider.overrideWithValue(repository)],
      // No GoRouter ancestor is set up here - this test only exercises the
      // invalid-credentials path, which returns before LoginScreen ever calls
      // context.go('/home'). A success-path test would need a full router harness.
      child: const MaterialApp(home: LoginScreen()),
    );
  }

  testWidgets('renders email and password fields with a Log in button', (tester) async {
    await tester.pumpWidget(wrapped());

    expect(find.byType(TextField), findsNWidgets(2));
    expect(find.widgetWithText(FilledButton, 'Log in'), findsOneWidget);
  });

  testWidgets('shows an error message when the repository rejects the credentials', (tester) async {
    when(() => repository.login(email: any(named: 'email'), password: any(named: 'password')))
        .thenThrow(Exception('401'));

    await tester.pumpWidget(wrapped());
    await tester.enterText(find.byType(TextField).first, 'wrong@example.com');
    await tester.enterText(find.byType(TextField).last, 'wrongpassword');
    await tester.tap(find.widgetWithText(FilledButton, 'Log in'));
    await tester.pumpAndSettle();

    expect(find.text('Invalid email or password'), findsOneWidget);
  });
}
