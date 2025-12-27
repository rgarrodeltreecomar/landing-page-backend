# Usa una imagen base de Node.js con la versión que necesites (aquí uso la LTS)
FROM node:18-alpine

# Crea el directorio de la aplicación
WORKDIR /usr/src/app

# Copia los archivos de configuración primero para aprovechar el cache de Docker
COPY package*.json ./
COPY tsconfig.json ./
COPY nodemon.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos
COPY . .

# Compila TypeScript a JavaScript
RUN npm run build

# Expone el puerto que usa tu aplicación (3000 según tu código)
EXPOSE 5000

# Comando para ejecutar la aplicación en producción
CMD ["node", "dist/index.js"]


# CMD ["npm", "run", "dev"]