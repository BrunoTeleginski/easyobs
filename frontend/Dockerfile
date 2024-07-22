# # pull official base image
# FROM node:21.6.1-alpine3.19

# # set working directory
# WORKDIR /app

# # add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH

# # install app dependencies
# COPY package.json ./
# COPY package-lock.json ./
# RUN npm install --silent

# # add app
# COPY . ./

# RUN npm run build

# # start app
# CMD ["npm", "run", "preview"]

FROM nginx

WORKDIR /var/www

COPY ./nginx.conf /etc/nginx/
COPY ./dist /etc/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]