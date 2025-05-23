FROM node:22-alpine

WORKDIR /var/app

COPY package*.json ./
RUN npm install

COPY ./ ./

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]