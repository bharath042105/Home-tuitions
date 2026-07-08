import 'package:flutter/material.dart';

/// Thin wrapper over Material's Card that just applies the app's default content
/// padding - every screen that groups content in a card should use this instead of
/// a bare Card so padding stays consistent (mirrors the website's `Card` component).
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;

  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(padding: padding, child: child),
    );
  }
}
