FROM node:22-alpine
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.9.0 --activate

WORKDIR /app

EXPOSE 3000
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm dev"]