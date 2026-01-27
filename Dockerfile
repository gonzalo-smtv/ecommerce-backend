# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Compilar la aplicación
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar los archivos compilados desde el stage de build
COPY --from=builder /app/dist ./dist

# Copiar todo el directorio src (necesario para migraciones y typeorm.config.ts)
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Instalar dependencias necesarias para ejecutar migraciones
RUN npm install --save-dev ts-node tsconfig-paths typescript dotenv

# Exponer el puerto
EXPOSE 3001

# Script de inicio que ejecuta migraciones y luego inicia la app
CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]
