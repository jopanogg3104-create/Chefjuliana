import { randomBytes } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { storage, transaction, closeStorage } from "../lib/fish/db.js";
import { passwordHash } from "../lib/fish/auth.js";
try {
  const store = await storage();
  const existing = await store
    .prepare("SELECT id FROM admins WHERE id=1")
    .get();
  if (existing && !process.argv.includes("--reset"))
    console.log(
      "Administrador já cadastrado. Use --reset para trocar a senha e encerrar sessões.",
    );
  else {
    const password =
      process.env.FISH_ADMIN_PASSWORD || randomBytes(24).toString("base64url");
    if (password.length < 16 || password.length > 256)
      throw Error("A senha deve ter entre 16 e 256 caracteres.");
    await transaction(async (store) => {
      await store
        .prepare(
          "INSERT INTO admins VALUES(1,?) ON CONFLICT(id) DO UPDATE SET hash=excluded.hash",
        )
        .run(passwordHash(password));
      await store.prepare("DELETE FROM sessions").run();
    });
    if (!process.env.FISH_ADMIN_PASSWORD) {
      mkdirSync("data", { recursive: true, mode: 0o700 });
      writeFileSync(
        "data/admin-credentials.txt",
        `Senha do painel /atendimento: ${password}\nGuarde em gerenciador de senhas e remova este arquivo após a leitura.\n`,
        { mode: 0o600 },
      );
      console.log(
        "Administrador criado. Credencial em data/admin-credentials.txt (acesso restrito); não publique este arquivo.",
      );
    } else
      console.log(
        "Administrador configurado a partir de FISH_ADMIN_PASSWORD. Nenhuma credencial foi gravada em arquivo.",
      );
  }
} finally {
  await closeStorage();
}
