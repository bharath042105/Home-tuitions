import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/secure_storage.dart';
import 'theme_tokens.dart';

const _presetStorageKey = 'theme_preset';

/// Holds the active preset name; persisted the same way the device id is
/// (flutter_secure_storage), so the chosen brand palette survives app restarts.
class ThemePresetController extends Notifier<String> {
  @override
  String build() {
    _restore();
    return defaultThemeName;
  }

  Future<void> _restore() async {
    final storage = ref.read(secureStorageProvider);
    final stored = await storage.read(key: _presetStorageKey);
    if (stored != null && themePresets.containsKey(stored)) {
      state = stored;
    }
  }

  Future<void> setPreset(String name) async {
    if (!themePresets.containsKey(name)) return;
    state = name;
    await ref.read(secureStorageProvider).write(key: _presetStorageKey, value: name);
  }
}

final themePresetProvider = NotifierProvider<ThemePresetController, String>(ThemePresetController.new);

final activeThemeTokensProvider = Provider<AppThemeTokens>((ref) {
  final presetName = ref.watch(themePresetProvider);
  return resolveThemeTokens(presetName);
});
