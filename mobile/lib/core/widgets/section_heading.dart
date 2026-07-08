import 'package:flutter/material.dart';

/// Section title used to break up dashboard-style screens (mirrors the website's
/// plain `<h2>` section headers) - just a consistent text style, no logic.
class SectionHeading extends StatelessWidget {
  final String title;
  final EdgeInsetsGeometry padding;

  const SectionHeading(this.title, {super.key, this.padding = const EdgeInsets.only(bottom: 12)});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: padding,
      child: Text(title, style: Theme.of(context).textTheme.headlineMedium),
    );
  }
}
