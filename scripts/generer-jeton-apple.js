/* ============================================================
   Génère le « Client Secret » (jeton JWT) pour Sign in with Apple
   à coller dans Supabase → Authentication → Providers → Apple
   → champ « Secret Key (for OAuth) ».

   ⚠️ Ta clé privée .p8 reste sur TON ordinateur. Rien n'est envoyé.

   UTILISATION (dans le Terminal, depuis le dossier du projet) :

     TEAM_ID=XXXXXXXXXX \
     KEY_ID=YYYYYYYYYY \
     SERVICES_ID=com.flatswiper.web \
     P8=./AuthKey_YYYYYYYYYY.p8 \
     node scripts/generer-jeton-apple.js

   - TEAM_ID      : ton identifiant d'équipe Apple (en haut à droite du compte développeur)
   - KEY_ID       : l'ID de la clé "Sign in with Apple" (10 caractères)
   - SERVICES_ID  : le Services ID web créé (ex. com.flatswiper.web)
   - P8           : chemin vers le fichier .p8 téléchargé depuis Apple
   ============================================================ */

const crypto = require("crypto");
const fs = require("fs");

const { TEAM_ID, KEY_ID, SERVICES_ID } = process.env;
const P8 = process.env.P8 || "./AuthKey.p8";

if (!TEAM_ID || !KEY_ID || !SERVICES_ID) {
  console.error(
    "\n❌ Il manque des infos. Lance avec :\n" +
      "   TEAM_ID=... KEY_ID=... SERVICES_ID=com.flatswiper.web P8=./AuthKey_XXXX.p8 node scripts/generer-jeton-apple.js\n"
  );
  process.exit(1);
}

let privateKey;
try {
  privateKey = fs.readFileSync(P8, "utf8");
} catch {
  console.error(`\n❌ Fichier .p8 introuvable : ${P8}\n   Vérifie le chemin (option P8=...).\n`);
  process.exit(1);
}

const b64url = (input) =>
  Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const now = Math.floor(Date.now() / 1000);
const header = { alg: "ES256", kid: KEY_ID };
const payload = {
  iss: TEAM_ID,
  iat: now,
  exp: now + 15777000, // ~6 mois (durée maximale autorisée par Apple)
  aud: "https://appleid.apple.com",
  sub: SERVICES_ID,
};

const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;

let signature;
try {
  // dsaEncoding "ieee-p1363" => signature au format attendu par les JWT (r||s)
  signature = crypto.sign("sha256", Buffer.from(signingInput), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });
} catch (e) {
  console.error("\n❌ Signature impossible (clé .p8 invalide ?) :", e.message, "\n");
  process.exit(1);
}

const jwt = `${signingInput}.${signature
  .toString("base64")
  .replace(/=/g, "")
  .replace(/\+/g, "-")
  .replace(/\//g, "_")}`;

console.log("\n✅ Jeton (Client Secret) Apple — à coller dans Supabase :\n");
console.log(jwt);
console.log("\n(Il expire dans ~6 mois — il faudra le régénérer ensuite.)\n");
