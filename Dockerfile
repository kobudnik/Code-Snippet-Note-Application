FROM node
ARG PG_URI
ARG REDIS_HOST
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY dist ./dist
COPY server ./server
ENV PG_URI=${PG_URI}
ENV REDIS_HOST=${REDIS_HOST}
EXPOSE 3000
CMD ["npm", "start"]