FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3333

CMD [ "npm", "start" ]

# -----------------------------------------------------------------------------
# RESUMO DO ARQUIVO
# -----------------------------------------------------------------------------
# Arquivo do projeto (backend/Dockerfile) que participa do funcionamento da aplicação.
