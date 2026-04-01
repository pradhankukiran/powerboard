FROM node:22-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ARG VITE_API_URL
ARG VITE_GRAFANA_URL
ARG VITE_SUPERSET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GRAFANA_URL=$VITE_GRAFANA_URL
ENV VITE_SUPERSET_URL=$VITE_SUPERSET_URL

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

COPY apps/web/ apps/web/
RUN pnpm --filter @powerboard/web build

FROM nginx:alpine AS serve

COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf.template /etc/nginx/templates/default.conf.template

ENV PORT=3000

ENV API_HOST=api
CMD ["sh", "-c", "envsubst '$$PORT $$API_HOST' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
