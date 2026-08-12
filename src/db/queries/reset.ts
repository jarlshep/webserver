import { db } from "../index.js";
import { users } from "../schema.js";

export async function deleteUsers() {
    await db.delete(users);
}