import 'user.dart';

class TokenPair {
  final String accessToken;
  final String refreshToken;

  const TokenPair({required this.accessToken, required this.refreshToken});
}

/// Domain-facing contract; presentation layer depends on this interface only,
/// never on the Dio-based implementation directly (mirrors the backend's
/// module-boundary rule: depend on interfaces, not implementations).
abstract class AuthRepository {
  Future<TokenPair> login({required String email, required String password});
  Future<void> register({required String email, required String password, required UserRole role});
  Future<void> requestOtp(String phone);
  Future<TokenPair> verifyOtp({required String phone, required String code});
  Future<TokenPair> refresh(String refreshToken);
  Future<void> logout();
}
