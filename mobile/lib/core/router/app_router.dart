import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_providers.dart';
import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/otp_login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/home/presentation/screens/home_placeholder_screen.dart';

const _publicPaths = {'/login', '/login/otp', '/register'};

/// Role-based route guards live here (redirect logic), not scattered across
/// screens — see docs/phase1/05-information-architecture.md  2 for the
/// per-role nav model this mirrors on mobile via a bottom nav bar per role.
final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = ref.read(accessTokenProvider) != null;
      final isPublicRoute = _publicPaths.contains(state.matchedLocation);

      if (!isLoggedIn && !isPublicRoute) return '/login';
      if (isLoggedIn && isPublicRoute) return '/home';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/login/otp',
        builder: (context, state) => const OtpLoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      GoRoute(
        path: '/home',
        // Placeholder until mobile gets role-specific home shells (Tutor/Student/
        // Parent screens only exist on the website so far); this just needs to be
        // visibly distinct from LoginScreen so a successful login doesn't look like
        // a silent failure that looped back to the login form.
        builder: (context, state) => const HomePlaceholderScreen(),
      ),
    ],
  );
});
