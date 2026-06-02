import bcrypt from 'bcrypt';

// bcrypt cost factor. 12 is the current sensible default for new hashes; existing
// hashes carry their own cost, so comparePassword still works and no account is
// locked out by raising this.
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
