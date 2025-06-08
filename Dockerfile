FROM node:18

# Install build tools and Python
RUN apt-get update && apt-get install -y python3 make g++ && ln -sf python3 /usr/bin/python

WORKDIR /app
COPY . .

RUN npm ci

CMD ["npm", "start"]