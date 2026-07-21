# tsconfig.json

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