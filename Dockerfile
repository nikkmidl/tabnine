FROM node:20-slim AS builder

WORKDIR /app

COPY ./index.ts .
COPY ./tsconfig.json .
COPY ./package.json .
COPY ./package-lock.json .
COPY ./openapi.yaml .
COPY ./types ./types
COPY ./src ./src

RUN npm ci --production
RUN npm run build
RUN ls -la

FROM node:20-slim AS runtime

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY ./openapi.yaml .
COPY ./package.json .

EXPOSE 1337

CMD ["npm", "run", "start"]
