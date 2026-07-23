# tsconfig.json

Concept: TypeScript isn't run directly by Node — it gets translated ("compiled") into plain JavaScript first. tsconfig.json is the instruction sheet for that translation: what JS version to output, which files to include, how strict to be about type errors, where compiled output goes. Get it wrong and you get confusing errors; get it right once and forget about it.

## What is tsconfig.json?

tsconfig.json is the configuration file for the TypeScript compiler.

It tells TypeScript:

- which files to compile
- which JavaScript version to generate
- where compiled output should go
- how strict type checking should be

---

## Our SecureVault Configuration
{
  "compilerOptions": {
    ...
  }
}

## Explanation

### target

ES2022

...

### module

NodeNext

...

### rootDir

...

### outDir

...

### strict

...

### esModuleInterop

...

### skipLibCheck

...

---

## Why is dist ignored?

dist contains generated JavaScript.

Generated files should never be committed because they can always be recreated.

## SecureVault Usage

Reads source code from:

src/

Outputs compiled code to:

dist/

---

## Interview Questions

What is tsconfig.json?

Why use strict mode?

Why don't we commit dist?

What does outDir do?

What is rootDir?

## tsconfig.ts

Create tsconfig.json in the backend/ root (same level as package.json) with this, and read the inline reasoning:

json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

The settings that matter, in plain terms:

target: ES2022 — which JavaScript version to compile down to. ES2022 is safe for modern Node.
module / moduleResolution: NodeNext — how import/export statements are handled; NodeNext matches how modern Node resolves modules.
rootDir: ./src and outDir: ./dist — read TS from src/, write compiled JS to dist/. This is why dist/ is in your .gitignore (it's generated — never commit build output).
strict: true — the important one. Turns on all of TypeScript's strict type-checking. This is what makes TypeScript worth using — it catches null bugs, type mismatches, and undefined access at compile time instead of at 3 AM in production. Turning strict off is a junior mistake; leave it on and let it protect you.
esModuleInterop: true — lets import express from "express" work smoothly with libraries that use older module styles.
skipLibCheck: true — skips type-checking inside node_modules (their types, not your problem — speeds up compilation).

One thing to verify: confirm dist/ is in your .gitignore (compiled output must never be committed). Run:

bash
cat .gitignore | grep dist

Then add the scripts to package.json. Add this "scripts" block (put it above "devDependencies"):

json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
},

What each does: dev runs your TS server directly with tsx and watch auto-restarts on file changes (your everyday command). build compiles TS → JS into dist/. start runs the compiled production JS. This is the standard dev/build/start trio you'll see in nearly every Node project.