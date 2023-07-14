FROM node:18

WORKDIR /app
COPY ./build /app
COPY ./package.json /app
RUN yarn install
CMD ["node", "index.js"]