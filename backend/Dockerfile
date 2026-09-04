# --- production: only what's needed to run, nothing to build with ---
  FROM node:22-alpine AS production
  WORKDIR /app
  ENV NODE_ENV=production
  
  RUN addgroup -S nodejs && adduser -S expressjs -G nodejs
  
  COPY package.json package-lock.json ./
  # Copy pre-built node_modules from build stage instead of installing again
  COPY --from=build /app/node_modules ./node_modules
  
  COPY --from=build /app/dist ./dist
  COPY --from=build /app/prisma ./prisma
  
  RUN mkdir -p uploads && chown -R expressjs:nodejs /app
  
  USER expressjs
  
  EXPOSE 3000
  
  HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"
  
  CMD ["node", "dist/server.js"]