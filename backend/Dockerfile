FROM node:18-alpine

#create app directory
#all the files run inside the /app folder in the container
WORKDIR /app

#copying the package files 
#Docker caches this layer
COPY package*.json ./


#install dependencies
RUN npm install

# copy the source code into the container
COPY . .

#Expose the port --> docker uses 5000 port
EXPOSE 5000

#start the server
CMD ["node", "src/index.js"]

