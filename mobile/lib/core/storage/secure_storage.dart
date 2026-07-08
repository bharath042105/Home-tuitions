import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';

const _deviceIdKey = 'device_id';
const _refreshTokenKey = 'refresh_token';

final secureStorageProvider = Provider<FlutterSecureStorage>((ref) {
  return const FlutterSecureStorage();
});

/// One random id per install, persisted so refresh keeps working across app
/// restarts - mirrors the website's localStorage-based device id
/// (web/apps/website/src/lib/api/device-id.ts). Generated lazily and cached
/// in memory for the lifetime of the provider to avoid repeated storage reads.
final deviceIdProvider = FutureProvider<String>((ref) async {
  final storage = ref.watch(secureStorageProvider);
  var id = await storage.read(key: _deviceIdKey);
  if (id == null) {
    id = const Uuid().v4();
    await storage.write(key: _deviceIdKey, value: id);
  }
  return id;
});

class RefreshTokenStorage {
  final FlutterSecureStorage _storage;
  RefreshTokenStorage(this._storage);

  Future<void> save(String token) => _storage.write(key: _refreshTokenKey, value: token);
  Future<String?> read() => _storage.read(key: _refreshTokenKey);
  Future<void> clear() => _storage.delete(key: _refreshTokenKey);
}

final refreshTokenStorageProvider = Provider<RefreshTokenStorage>((ref) {
  return RefreshTokenStorage(ref.watch(secureStorageProvider));
});
