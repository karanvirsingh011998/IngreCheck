import { AuthForm } from '../components/AuthForm';
import type { SignUpScreenProps } from '../types/navigation';

export function SignUpScreen({ navigation }: SignUpScreenProps) {
  return (
    <AuthForm
      mode="sign-up"
      onBack={() => navigation.goBack()}
      onSwitch={() => navigation.replace('SignIn')}
      onSuccess={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
    />
  );
}
