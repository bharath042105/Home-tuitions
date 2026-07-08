import 'package:dio/dio.dart';

import '../domain/auth_repository.dart';
import '../domain/user.dart';

class AuthRepositoryImpl implements AuthRepository {
  final Dio _dio;

  AuthRepositoryImpl(this._dio);

  @override
  Future<TokenPair> login({required String email, required String password}) async {
    final response = await _dio.post('/api/v1/auth/login', data: {
      'email': email,
      'password': password,
    });
    return TokenPair(
      accessToken: response.data['accessToken'] as String,
      refreshToken: response.data['refreshToken'] as String,
    );
  }

  @override
  Future<void> register({
    required String email,
    required String password,
    required UserRole role,
  }) async {
    await _dio.post('/api/v1/auth/register', data: {
      'email': email,
      'password': password,
      'role': role.name.toUpperCase(),
    });
  }

  @override
  Future<void> requestOtp(String phone) async {
    await _dio.post('/api/v1/auth/otp/request', data: {'phone': phone});
  }

  @override
  Future<TokenPair> verifyOtp({required String phone, required String code}) async {
    final response = await _dio.post('/api/v1/auth/otp/verify', data: {
      'phone': phone,
      'code': code,
    });
    return TokenPair(
      accessToken: response.data['accessToken'] as String,
      refreshToken: response.data['refreshToken'] as String,
    );
  }

  @override
  Future<TokenPair> refresh(String refreshToken) async {
    final response = await _dio.post('/api/v1/auth/refresh', queryParameters: {
      'refreshToken': refreshToken,
    });
    return TokenPair(
      accessToken: response.data['accessToken'] as String,
      refreshToken: response.data['refreshToken'] as String,
    );
  }

  @override
  Future<void> logout() async {
    await _dio.post('/api/v1/auth/logout');
  }
}
