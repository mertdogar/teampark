FROM mhart/alpine-node:14.15.1

WORKDIR /app
ADD . .

RUN apk update && \
    apk add --no-cache git && \
    npm install --unsafe-perm && \
    npm run build  && \
    rm -rf /etc/ssl /root/.cache \
    /usr/share/man /tmp/* /var/cache/apk/* /root/.npm /root/.node-gyp \
    /usr/lib/node_modules/npm/man /usr/lib/node_modules/npm/doc /usr/lib/node_modules/npm/html

CMD ["npm", "start"]