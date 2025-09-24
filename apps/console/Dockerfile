FROM node:20-alpine
WORKDIR /app
COPY apps/console/package.json apps/console/package-lock.json* ./
RUN npm ci || npm i
COPY apps/console .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

