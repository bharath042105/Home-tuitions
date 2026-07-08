import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../domain/user.dart';
import '../providers/auth_providers.dart';

class RegisterScreen extends HookConsumerWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final emailController = useTextEditingController();
    final passwordController = useTextEditingController();
    final selectedRole = useState(UserRole.student);
    final isSubmitting = useState(false);
    final errorMessage = useState<String?>(null);
    final submitted = useState(false);

    Future<void> submit() async {
      isSubmitting.value = true;
      errorMessage.value = null;
      try {
        await ref.read(authControllerProvider).register(
              email: emailController.text,
              password: passwordController.text,
              role: selectedRole.value,
            );
        submitted.value = true;
      } catch (e) {
        errorMessage.value = 'Could not create account - check your details and try again';
      } finally {
        isSubmitting.value = false;
      }
    }

    if (submitted.value) {
      return Scaffold(
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Check your email', style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 12),
                const Text('We\'ve sent a verification link to confirm your account.'),
                const SizedBox(height: 24),
                PrimaryButton(
                  label: 'Back to login',
                  onPressed: () => context.go('/login'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Create your account')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              DropdownButtonFormField<UserRole>(
                initialValue: selectedRole.value,
                decoration: const InputDecoration(labelText: 'I am a...'),
                items: const [
                  DropdownMenuItem(value: UserRole.student, child: Text('Student')),
                  DropdownMenuItem(value: UserRole.parent, child: Text('Parent')),
                  DropdownMenuItem(value: UserRole.tutor, child: Text('Tutor')),
                ],
                onChanged: (value) {
                  if (value != null) selectedRole.value = value;
                },
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: emailController,
                label: 'Email',
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: passwordController,
                label: 'Password (min 8 characters)',
                obscureText: true,
              ),
              if (errorMessage.value != null) ...[
                const SizedBox(height: 8),
                Text(errorMessage.value!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error)),
              ],
              const SizedBox(height: 24),
              PrimaryButton(
                label: 'Create account',
                loading: isSubmitting.value,
                onPressed: submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
