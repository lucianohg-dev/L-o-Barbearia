# 1. Escolhe a versão do Node.js (ambiente onde o React roda)
FROM node:20-alpine

# 2. Cria uma pasta dentro do Docker onde seu projeto vai morar
WORKDIR /app

# 3. Copia os arquivos de configuração de pacotes
COPY package*.json ./

# 4. Instala todas as bibliotecas do seu projeto (inclusive o Firebase)
RUN npm install

# 5. Copia todo o resto do seu código para dentro do Docker
COPY . .

# 6. Abre a porta que o React usa (5173 para Vite ou 3000 para CRA)
EXPOSE 5173

# 7. O comando que inicia o seu projeto
CMD ["npm", "run", "dev", "--", "--host"]