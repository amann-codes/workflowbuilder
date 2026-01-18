FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Vite looks for variables starting with VITE_
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM node:20-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist /app/dist
EXPOSE 80
CMD ["serve", "-s", "dist", "-l", "80"]