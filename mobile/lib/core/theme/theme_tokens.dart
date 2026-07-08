import 'package:flutter/material.dart';

/// Mirrors web/packages/shared/src/design/tokens.ts's ThemeTokens shape - kept as
/// the same preset names/values across web and mobile so "switch the brand palette"
/// means the same thing on every platform, even though Flutter consumes it as a
/// Material 3 seed color rather than CSS variables or an MUI palette object.
class AppThemeTokens {
  final String name;
  final Color brand500;
  final Color accent500;
  final Color success500;
  final Color warning500;
  final Color danger500;
  final Color info500;
  final double radiusSm;
  final double radiusMd;
  final double radiusLg;

  const AppThemeTokens({
    required this.name,
    required this.brand500,
    required this.accent500,
    required this.success500,
    required this.warning500,
    required this.danger500,
    required this.info500,
    required this.radiusSm,
    required this.radiusMd,
    required this.radiusLg,
  });
}

/// Current default: deep indigo brand with a coral-rose accent - see
/// web/packages/shared/src/design/tokens.ts's `indigoCoral` preset for the source of
/// truth these values must stay in sync with.
const indigoCoral = AppThemeTokens(
  name: 'indigo-coral',
  brand500: Color(0xFF4F46E5),
  accent500: Color(0xFFFB7185),
  success500: Color(0xFF16A34A),
  warning500: Color(0xFFD97706),
  danger500: Color(0xFFDC2626),
  info500: Color(0xFF0891B2),
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 20,
);

const hometuitionsBlue = AppThemeTokens(
  name: 'hometuitions-blue',
  brand500: Color(0xFF2F6FED),
  accent500: Color(0xFFF97316),
  success500: Color(0xFF16A34A),
  warning500: Color(0xFFD97706),
  danger500: Color(0xFFDC2626),
  info500: Color(0xFF0891B2),
  radiusSm: 6,
  radiusMd: 10,
  radiusLg: 16,
);

const emeraldCampus = AppThemeTokens(
  name: 'emerald-campus',
  brand500: Color(0xFF059669),
  accent500: Color(0xFFC026D3),
  success500: Color(0xFF16A34A),
  warning500: Color(0xFFD97706),
  danger500: Color(0xFFDC2626),
  info500: Color(0xFF0891B2),
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 20,
);

const themePresets = <String, AppThemeTokens>{
  'indigo-coral': indigoCoral,
  'hometuitions-blue': hometuitionsBlue,
  'emerald-campus': emeraldCampus,
};

const defaultThemeName = 'indigo-coral';

AppThemeTokens resolveThemeTokens(String? name) => themePresets[name] ?? indigoCoral;
