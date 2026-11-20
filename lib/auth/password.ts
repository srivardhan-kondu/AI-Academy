import bcrypt from "bcryptjs";

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

let dummy: string | null = null;
/** A real hash used to equalise timing when an account does not exist. */
export const dummyHash = () => (dummy ??= bcrypt.hashSync("not-a-real-password", 12));
