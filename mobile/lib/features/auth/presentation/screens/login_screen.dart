import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../core/widgets/theme_preset_switcher.dart';
import '../providers/auth_providers.dart';

class LoginScreen extends HookConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final emailController = useTextEditingController();
    final passwordController = useTextEditingController();
    final isSubmitting = useState(false);
    final errorMessage = useState<String?>(null);

    Future<void> submit() async {
      isSubmitting.value = true;
      errorMessage.value = null;
      try {
        await ref.read(authControllerProvider).login(
              email: emailController.text,
              password: passwordController.text,
            );
        if (context.mounted) context.go('/home');
      } catch (e) {
        errorMessage.value = 'Invalid email or password';
      } finally {
        isSubmitting.value = false;
      }
    }

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        actions: const [Padding(padding: EdgeInsets.only(right: 8), child: ThemePresetSwitcher())],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Log in', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 8),
              Text(
                'Welcome back',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
              const SizedBox(height: 24),
              AppTextField(
                controller: emailController,
                label: 'Email',
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: passwordController,
                label: 'Password',
                obscureText: true,
              ),
              if (errorMessage.value != null) ...[
                const SizedBox(height: 8),
                Text(errorMessage.value!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ],
              const SizedBox(height: 24),
              PrimaryButton(
                label: 'Log in',
                loading: isSubmitting.value,
                onPressed: submit,
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.push('/login/otp'),
                child: const Text('Log in with phone OTP instead'),
              ),
              TextButton(
                onPressed: () => context.push('/register'),
                child: const Text('Create an account'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
