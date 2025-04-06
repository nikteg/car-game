# Use the official Node.js image as a base image
FROM node:22-alpine as build

# Remove the default nginx.conf if you want to use a custom one
# COPY nginx.conf /etc/nginx/nginx.conf

# install yarn
RUN apk add --no-cache yarn

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Use the official Nginx image from Docker Hub
FROM nginx:alpine

# Copy your static files into the nginx html directory
COPY --from=build ./public/ /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]