import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../theme/theme_preset_provider.dart';
import '../theme/theme_tokens.dart';

/// Proves the runtime-theming architecture is real on mobile too - matches
/// web/apps/website/src/components/ui/ThemePresetSwitcher.tsx in purpose.
class ThemePresetSwitcher extends ConsumerWidget {
  const ThemePresetSwitcher({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final current = ref.watch(themePresetProvider);

    return DropdownButton<String>(
      value: current,
      underline: const SizedBox.shrink(),
      icon: const Icon(Icons.palette_outlined, size: 18),
      items: themePresets.keys
          .map((name) => DropdownMenuItem(value: name, child: Text(name, style: const TextStyle(fontSize: 13))))
          .toList(),
      onChanged: (name) {
        if (name != null) ref.read(themePresetProvider.notifier).setPreset(name);
      },
    );
  }
}
