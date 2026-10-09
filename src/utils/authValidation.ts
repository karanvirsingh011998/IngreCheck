export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Enter an email address.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Enter a password.';
  }
  if (password.length < 8) {
    return 'Use at least 8 characters.';
  }
  return null;
}

export function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'That email or password does not match our records.';
  }
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Confirm your email before signing in. Check your inbox for the link.';
  }
  if (lower.includes('weak') || lower.includes('password should') || lower.includes('at least')) {
    return 'Choose a password with at least 8 characters.';
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return 'We could not reach the sign-in service. Check your connection and try again.';
  }
  if (lower.includes('cancel')) {
    return 'Sign-in was cancelled.';
  }
  return 'Something went wrong. Please try again.';
}
