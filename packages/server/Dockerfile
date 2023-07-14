FROM node:18

WORKDIR /app
COPY ./ /app/
RUN rm -rf node_modules && rm -f .env && yarn install --no-lockfile
CMD ["yarn", "start"]