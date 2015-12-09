FROM node:slim
ADD package.json package.json
RUN npm install
ADD . .
RUN npm start
