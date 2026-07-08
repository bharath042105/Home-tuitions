import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/dio_client.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../data/auth_repository_impl.dart';
import '../../domain/auth_repository.dart';
import '../../domain/user.dart';

/// In-memory access token, mirroring the website's approach (never persisted
/// to disk in plaintext) — see docs/phase2/03-low-level-design.md  3.
final accessTokenProvider = StateProvider<String?>((ref) => null);

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(ref.watch(dioClientProvider));
});

/// Orchestrates AuthRepository calls with token state + secure refresh-token
/// storage, so screens and the Dio interceptor share one place that knows how
/// to log in, refresh, and log out - not scattered token-juggling logic.
class AuthController {
  final Ref _ref;
  AuthController(this._ref);

  AuthRepository get _repository => _ref.read(authRepositoryProvider);
  RefreshTokenStorage get _refreshStorage => _ref.read(refreshTokenStorageProvider);

  Future<void> login({required String email, required String password}) async {
    final tokens = await _repository.login(email: email, password: password);
    await _applyTokens(tokens);
  }

  Future<void> register({
    required String email,
    required String password,
    required UserRole role,
  }) {
    return _repository.register(email: email, password: password, role: role);
  }

  Future<void> requestOtp(String phone) => _repository.requestOtp(phone);

  Future<void> verifyOtp({required String phone, required String code}) async {
    final tokens = await _repository.verifyOtp(phone: phone, code: code);
    await _applyTokens(tokens);
  }

  /// Called by the Dio interceptor on a 401. Returns false (rather than
  /// throwing) so the interceptor can fall back to surfacing the original error.
  Future<bool> tryRefresh() async {
    final refreshToken = await _refreshStorage.read();
    if (refreshToken == null) return false;
    try {
      final tokens = await _repository.refresh(refreshToken);
      await _applyTokens(tokens);
      return true;
    } catch (_) {
      await logout();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _repository.logout();
    } catch (_) {
      // best-effort - still clear local state even if the network call fails
    }
    _ref.read(accessTokenProvider.notifier).state = null;
    await _refreshStorage.clear();
  }

  Future<void> _applyTokens(TokenPair tokens) async {
    _ref.read(accessTokenProvider.notifier).state = tokens.accessToken;
    await _refreshStorage.save(tokens.refreshToken);
  }
}

final authControllerProvider = Provider<AuthController>((ref) => AuthController(ref));
