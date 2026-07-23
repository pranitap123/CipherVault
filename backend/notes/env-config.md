Environment Configuration & Secrets

The problem: apps need config — ports, database URLs, API keys, encryption keys. These must NOT be hardcoded, for two reasons: (1) they change per environment (dev/staging/prod use different values), and (2) secrets in committed code = leaked credentials the moment the repo is shared or goes public.

The pattern (what SecureVault does):

1.Store config in .env (gitignored — never committed).
2Load it at startup with dotenv (dotenv.config() reads .env into process.env).
3.Validate required values at startup — a required() helper throws immediately if a variable is missing.
variable is missing.
4.Expose one typed env module so the rest of the code imports clean values instead of reaching into process.env everywhere.

Fail-fast — the key idea: validating at boot means a missing ENCRYPTION_KEY crashes the app instantly, with a clear message, at startup. The alternative — discovering it's missing three days later, mid-upload, as a cryptic undefined error — is far worse. Fail loud, fail early, at the doorstep.

Why a central typed module: scattering process.env.X across the codebase means no validation, no types (everything's string | undefined), and no single source of truth. One env module fixes all three: validated once, typed, imported everywhere.

.env vs .env.example: .env holds real secrets and is gitignored. .env.example is a committed template with blank/placeholder values, so a teammate knows which variables they need without ever seeing your secrets.

Interview Q&A:

"How do you manage secrets in a Node app?" → Environment variables loaded from .env (gitignored), validated at startup, exposed via a typed config module. Secrets never touch source control; .env.example documents required keys. In production, secrets come from the platform's secrets manager, not a file.
"What's fail-fast config validation?" → Checking required config exists at startup and crashing immediately with a clear error if not, rather than failing mysteriously later at use-time.
"Where does the encryption key live and why not the database?" → In the environment/secrets manager, separate from the data it protects — so a database breach doesn't also hand over the key. (Your SecureVault design.)

Common mistakes: committing .env (the classic credential leak); reading process.env directly everywhere (no validation, no types); no startup validation (silent failures later); hardcoding secrets "just for now" (they end up in git history forever).