import 'package:flutter/material.dart';

/// Colored-icon quick-link/stat tile - the mobile counterpart of the website's
/// `IconTile` component, used for dashboard quick links (home screen) and stat
/// rows. Renders as tappable when `onTap` is provided.
class IconTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? description;
  final Color color;
  final VoidCallback? onTap;

  const IconTile({
    super.key,
    required this.icon,
    required this.title,
    this.description,
    required this.color,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final content = Row(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: color, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(title, style: theme.textTheme.titleLarge, maxLines: 1, overflow: TextOverflow.ellipsis),
              if (description != null)
                Text(
                  description!,
                  style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.onSurfaceVariant),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
            ],
          ),
        ),
      ],
    );

    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(padding: const EdgeInsets.all(16), child: content),
      ),
    );
  }
}
