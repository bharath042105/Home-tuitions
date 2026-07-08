import 'package:flutter/material.dart';

import 'theme_tokens.dart';

/// Material 3 theme, light + dark, built from an AppThemeTokens preset rather than a
/// hardcoded seed color - see theme_tokens.dart for why. Values must match
/// docs/phase-design-system/README.md / web/packages/shared/src/design/tokens.ts so the
/// mobile app reads as the same product as website/admin, even though Flutter's
/// Material 3 seed-color system generates its own tonal palette rather than taking
/// hard-coded hex values directly like Tailwind/MUI do.
class AppTheme {
  AppTheme._();

  static ThemeData light(AppThemeTokens tokens) => _themeFor(tokens, Brightness.light);
  static ThemeData dark(AppThemeTokens tokens) => _themeFor(tokens, Brightness.dark);

  static ThemeData _themeFor(AppThemeTokens tokens, Brightness brightness) {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: tokens.brand500,
      brightness: brightness,
    ).copyWith(
      secondary: tokens.accent500,
      onSecondary: Colors.white,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: colorScheme.surface,
      textTheme: _textTheme(colorScheme),
      appBarTheme: AppBarTheme(
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        elevation: 0,
        centerTitle: false,
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(tokens.radiusMd)),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(tokens.radiusMd)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colorScheme.surfaceContainerHighest.withOpacity(0.4),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(tokens.radiusMd),
          borderSide: BorderSide.none,
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: colorScheme.surfaceContainerLow,
        shadowColor: colorScheme.shadow.withOpacity(0.08),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(tokens.radiusLg),
          side: BorderSide(color: colorScheme.outlineVariant),
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(tokens.radiusSm)),
      ),
      extensions: [AppStatusColors.fromTokens(tokens)],
    );
  }

  /// Explicit sizes matching web/packages/shared/src/design/tokens.ts's `typeScale` -
  /// no external font package (see pubspec.yaml), just Material's default font family
  /// at the shared product's type sizes instead of Flutter's own M3 defaults.
  static TextTheme _textTheme(ColorScheme colorScheme) {
    return TextTheme(
      headlineLarge: TextStyle(fontSize: 32, height: 40 / 32, fontWeight: FontWeight.w700, color: colorScheme.onSurface),
      headlineMedium: TextStyle(fontSize: 24, height: 32 / 24, fontWeight: FontWeight.w700, color: colorScheme.onSurface),
      titleLarge: TextStyle(fontSize: 18, height: 26 / 18, fontWeight: FontWeight.w600, color: colorScheme.onSurface),
      bodyLarge: TextStyle(fontSize: 16, height: 24 / 16, color: colorScheme.onSurface),
      bodyMedium: TextStyle(fontSize: 14, height: 20 / 14, color: colorScheme.onSurface),
      labelLarge: TextStyle(fontSize: 14, height: 20 / 14, fontWeight: FontWeight.w600, color: colorScheme.onSurface),
    );
  }
}

/// Semantic status colors shared with website/admin (success/warning/danger/info) -
/// kept as a ThemeExtension (rather than static consts) so they participate in
/// Theme.of(context) lookups and re-theme with the rest of the app when the active
/// preset changes, instead of needing a separate rebuild path.
class AppStatusColors extends ThemeExtension<AppStatusColors> {
  final Color success;
  final Color warning;
  final Color danger;
  final Color info;

  const AppStatusColors({
    required this.success,
    required this.warning,
    required this.danger,
    required this.info,
  });

  factory AppStatusColors.fromTokens(AppThemeTokens tokens) => AppStatusColors(
        success: tokens.success500,
        warning: tokens.warning500,
        danger: tokens.danger500,
        info: tokens.info500,
      );

  @override
  AppStatusColors copyWith({Color? success, Color? warning, Color? danger, Color? info}) {
    return AppStatusColors(
      success: success ?? this.success,
      warning: warning ?? this.warning,
      danger: danger ?? this.danger,
      info: info ?? this.info,
    );
  }

  @override
  AppStatusColors lerp(ThemeExtension<AppStatusColors>? other, double t) {
    if (other is! AppStatusColors) return this;
    return AppStatusColors(
      success: Color.lerp(success, other.success, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      danger: Color.lerp(danger, other.danger, t)!,
      info: Color.lerp(info, other.info, t)!,
    );
  }
}
