# --- build: compile the Vite app to static assets ---
  FROM node:22-alpine AS build
  WORKDIR /app
  COPY package.json package-lock.json ./
  RUN npm install --no-save
  COPY . .
  
  ARG VITE_API_URL=http://localhost:3000
  ENV VITE_API_URL=$VITE_API_URL
  RUN npm run build
  
  # --- serve: nginx, nothing else. No Node runtime in the final image. ---
  FROM nginx:1.27-alpine AS production
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  COPY --from=build /app/dist /usr/share/nginx/html
  
  EXPOSE 80
  
  HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost/ >/dev/null || exit 1
  
  CMD ["nginx", "-g", "daemon off;"]