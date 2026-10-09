export type CloudFailureCode = 'unconfigured' | 'signed_out' | 'network' | 'duplicate' | 'rejected';

export type CloudResult<T> = { ok: true; data: T } | { ok: false; code: CloudFailureCode; message: string };

export function cloudFailure(code: CloudFailureCode, message: string): CloudResult<never> {
  return { ok: false, code, message };
}

export function mapCloudError(error: { message?: string; code?: string } | null): CloudResult<never> {
  const message = error?.message ?? 'The cloud save did not succeed.';
  const lower = message.toLowerCase();
  if (error?.code === '23505' || lower.includes('duplicate') || lower.includes('unique')) {
    return cloudFailure('duplicate', 'That item is already saved.');
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return cloudFailure('network', 'The cloud save did not succeed. Check your connection and try again.');
  }
  return cloudFailure('rejected', 'The cloud save did not succeed. Please try again.');
}
