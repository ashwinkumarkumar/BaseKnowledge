FROM node:18

# Install build tools and Python
RUN apt-get update && apt-get install -y python3 make g++ && ln -sf python3 /usr/bin/python

WORKDIR /app
COPY . .

# Install backend dependencies
WORKDIR /app/backend
RUN if [ -f package.json ]; then npm ci; fi

WORKDIR /app

CMD ["npm", "start"]