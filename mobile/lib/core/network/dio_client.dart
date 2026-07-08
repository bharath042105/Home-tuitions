import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/secure_storage.dart';
import '../../features/auth/presentation/providers/auth_providers.dart';

const _baseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://localhost:8080',
);

/// Single Dio instance for the whole app. Attaches the access token + device id
/// to every request, and on a 401 performs a single-flight refresh-and-retry -
/// mirrors the same contract the website's shared API client implements
/// (see web/packages/shared/src/api/client.ts) so both clients behave identically
/// against the same backend contract.
final dioClientProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(baseUrl: _baseUrl));
  Future<bool>? refreshInFlight;

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = ref.read(accessTokenProvider);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        options.headers['X-Device-Id'] = await ref.read(deviceIdProvider.future);
        handler.next(options);
      },
      onError: (error, handler) async {
        final isUnauthorized = error.response?.statusCode == 401;
        final alreadyRetried = error.requestOptions.extra['retried'] == true;

        if (isUnauthorized && !alreadyRetried) {
          refreshInFlight ??= ref
              .read(authControllerProvider)
              .tryRefresh()
              .whenComplete(() => refreshInFlight = null);

          final refreshed = await refreshInFlight!;
          if (refreshed) {
            final retryOptions = error.requestOptions;
            retryOptions.extra['retried'] = true;
            retryOptions.headers['Authorization'] = 'Bearer ${ref.read(accessTokenProvider)}';
            try {
              final response = await dio.fetch(retryOptions);
              return handler.resolve(response);
            } catch (_) {
              // fall through to propagate the original error
            }
          }
        }
        handler.next(error);
      },
    ),
  );

  return dio;
});
