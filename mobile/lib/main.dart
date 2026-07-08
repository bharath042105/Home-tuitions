import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_preset_provider.dart';

void main() {
  runApp(const ProviderScope(child: HomeTuitionsApp()));
}

class HomeTuitionsApp extends ConsumerWidget {
  const HomeTuitionsApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final tokens = ref.watch(activeThemeTokensProvider);

    return MaterialApp.router(
      title: 'Home Tuitions',
      theme: AppTheme.light(tokens),
      darkTheme: AppTheme.dark(tokens),
      themeMode: ThemeMode.system,
      routerConfig: router,
    );
  }
}
