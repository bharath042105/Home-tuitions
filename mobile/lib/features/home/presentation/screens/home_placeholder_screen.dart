import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/widgets/icon_tile.dart';
import '../../../../core/widgets/section_heading.dart';
import '../../../auth/presentation/providers/auth_providers.dart';

/// Stands in for the real per-role home shell (Tutor/Student/Parent screens only
/// exist on the website so far - mobile UX beyond auth is still deferred). Uses the
/// same icon-tile quick-link pattern as the website/admin dashboards so the app
/// reads as the same product rather than a bare placeholder screen.
class HomePlaceholderScreen extends ConsumerWidget {
  const HomePlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Home Tuitions')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SectionHeading('Quick links'),
          IconTile(
            icon: Icons.search,
            title: 'Find a tutor',
            description: 'Browse verified tutors',
            color: colorScheme.primary,
          ),
          const SizedBox(height: 12),
          IconTile(
            icon: Icons.event_note,
            title: 'My Bookings',
            description: 'Upcoming sessions',
            color: colorScheme.secondary,
          ),
          const SizedBox(height: 12),
          IconTile(
            icon: Icons.person,
            title: 'Profile',
            description: 'Your details',
            color: colorScheme.tertiary,
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: () async {
              await ref.read(authControllerProvider).logout();
              if (context.mounted) context.go('/login');
            },
            icon: const Icon(Icons.logout),
            label: const Text('Log out'),
          ),
        ],
      ),
    );
  }
}
