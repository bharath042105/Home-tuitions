import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/primary_button.dart';
import '../providers/auth_providers.dart';

class OtpLoginScreen extends HookConsumerWidget {
  const OtpLoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final phoneController = useTextEditingController();
    final codeController = useTextEditingController();
    final phoneSubmitted = useState<String?>(null);
    final isSubmitting = useState(false);
    final errorMessage = useState<String?>(null);

    Future<void> requestOtp() async {
      isSubmitting.value = true;
      errorMessage.value = null;
      try {
        await ref.read(authControllerProvider).requestOtp(phoneController.text);
        phoneSubmitted.value = phoneController.text;
      } catch (e) {
        errorMessage.value = 'Could not send code - check the number and try again';
      } finally {
        isSubmitting.value = false;
      }
    }

    Future<void> verifyOtp() async {
      isSubmitting.value = true;
      errorMessage.value = null;
      try {
        await ref.read(authControllerProvider).verifyOtp(
              phone: phoneSubmitted.value!,
              code: codeController.text,
            );
        if (context.mounted) context.go('/home');
      } catch (e) {
        errorMessage.value = 'Incorrect code - try again';
      } finally {
        isSubmitting.value = false;
      }
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Log in with phone')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (phoneSubmitted.value == null) ...[
                AppTextField(
                  controller: phoneController,
                  label: 'Phone (e.g. +919876543210)',
                  keyboardType: TextInputType.phone,
                ),
                if (errorMessage.value != null) ...[
                  const SizedBox(height: 8),
                  Text(errorMessage.value!,
                      style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ],
                const SizedBox(height: 24),
                PrimaryButton(
                  label: 'Send code',
                  loading: isSubmitting.value,
                  onPressed: requestOtp,
                ),
              ] else ...[
                Text('Sent to ${phoneSubmitted.value}',
                    style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 12),
                AppTextField(
                  controller: codeController,
                  label: '6-digit code',
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                ),
                if (errorMessage.value != null) ...[
                  const SizedBox(height: 8),
                  Text(errorMessage.value!,
                      style: TextStyle(color: Theme.of(context).colorScheme.error)),
                ],
                const SizedBox(height: 12),
                PrimaryButton(
                  label: 'Verify & log in',
                  loading: isSubmitting.value,
                  onPressed: verifyOtp,
                ),
                TextButton(
                  onPressed: () => phoneSubmitted.value = null,
                  child: const Text('Use a different number'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
