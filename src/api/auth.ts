import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
}

export async function checkPasswordHash(hash: string, password: string): Promise<boolean> {
    /* const isVerified = await argon2.verify(hash, password);
    
    if (isVerified) {
        return true;
    } else {
        return false;
    } */
   return await argon2.verify(hash, password);
} 