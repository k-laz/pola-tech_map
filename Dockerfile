FROM node:12-alpine
WORKDIR /Custom_Map_POLA_3.0
COPY . .
RUN yarn install --production
CMD ["node", "app.js"]