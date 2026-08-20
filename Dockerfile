FROM node:20

# Create app directory
WORKDIR /app
# copy package.json and package-lock.json to app
COPY package.json package-lock.json ./
# install dependencies
RUN npm install
# copy all files to app
COPY . /app
# expose port 80
EXPOSE 80
# start the app
CMD npm start