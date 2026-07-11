# ================================
# Stage 1 - Build React (CRA)
# ================================
FROM node:20-alpine AS build
WORKDIR /app

# Cache node_modules
COPY package*.json ./
RUN npm install

# Build
COPY . .
RUN npm run build

# ================================
# Stage 2 - Serve with Nginx
# ================================
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

# CRA builds to /build not /dist
COPY --from=build /app/build .

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]