import { AuthForm } from '../components/AuthForm';
import type { SignInScreenProps } from '../types/navigation';

export function SignInScreen({ navigation }: SignInScreenProps) {
  return (
    <AuthForm
      mode="sign-in"
      onBack={() => navigation.goBack()}
      onSwitch={() => navigation.replace('SignUp')}
      onSuccess={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
    />
  );
}
