import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';

import 'package:hometuitions_mobile/core/storage/secure_storage.dart';
import 'package:hometuitions_mobile/features/auth/domain/auth_repository.dart';
import 'package:hometuitions_mobile/features/auth/domain/user.dart';
import 'package:hometuitions_mobile/features/auth/presentation/providers/auth_providers.dart';

class _MockAuthRepository extends Mock implements AuthRepository {}

class _MockRefreshTokenStorage extends Mock implements RefreshTokenStorage {}

void main() {
  late _MockAuthRepository repository;
  late _MockRefreshTokenStorage refreshStorage;
  late ProviderContainer container;

  setUp(() {
    repository = _MockAuthRepository();
    refreshStorage = _MockRefreshTokenStorage();
    container = ProviderContainer(overrides: [
      authRepositoryProvider.overrideWithValue(repository),
      refreshTokenStorageProvider.overrideWithValue(refreshStorage),
    ]);
  });

  tearDown(() => container.dispose());

  group('AuthController.login', () {
    test('stores the access token in state and persists the refresh token', () async {
      when(() => repository.login(email: any(named: 'email'), password: any(named: 'password')))
          .thenAnswer((_) async => const TokenPair(accessToken: 'access-1', refreshToken: 'refresh-1'));
      when(() => refreshStorage.save(any())).thenAnswer((_) async {});

      await container.read(authControllerProvider).login(email: 'a@b.com', password: 'pw');

      expect(container.read(accessTokenProvider), 'access-1');
      verify(() => refreshStorage.save('refresh-1')).called(1);
    });
  });

  group('AuthController.tryRefresh', () {
    test('returns false without calling the repository when no refresh token is stored', () async {
      when(() => refreshStorage.read()).thenAnswer((_) async => null);

      final result = await container.read(authControllerProvider).tryRefresh();

      expect(result, isFalse);
      verifyNever(() => repository.refresh(any()));
    });

    test('rotates tokens and returns true on a successful refresh', () async {
      when(() => refreshStorage.read()).thenAnswer((_) async => 'old-refresh');
      when(() => repository.refresh('old-refresh'))
          .thenAnswer((_) async => const TokenPair(accessToken: 'access-2', refreshToken: 'refresh-2'));
      when(() => refreshStorage.save(any())).thenAnswer((_) async {});

      final result = await container.read(authControllerProvider).tryRefresh();

      expect(result, isTrue);
      expect(container.read(accessTokenProvider), 'access-2');
    });

    test('logs out and returns false when the refresh call itself fails (e.g. the refresh token was already rotated/replayed)', () async {
      when(() => refreshStorage.read()).thenAnswer((_) async => 'stale-refresh');
      when(() => repository.refresh('stale-refresh')).thenThrow(Exception('invalid token'));
      when(() => repository.logout()).thenAnswer((_) async {});
      when(() => refreshStorage.clear()).thenAnswer((_) async {});

      final result = await container.read(authControllerProvider).tryRefresh();

      expect(result, isFalse);
      expect(container.read(accessTokenProvider), isNull);
      verify(() => refreshStorage.clear()).called(1);
    });
  });

  group('AuthController.logout', () {
    test('clears local session state even if the network logout call fails', () async {
      container.read(accessTokenProvider.notifier).state = 'some-token';
      when(() => repository.logout()).thenThrow(Exception('network error'));
      when(() => refreshStorage.clear()).thenAnswer((_) async {});

      await container.read(authControllerProvider).logout();

      expect(container.read(accessTokenProvider), isNull);
      verify(() => refreshStorage.clear()).called(1);
    });
  });
}
