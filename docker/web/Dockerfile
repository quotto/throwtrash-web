FROM nginx
RUN mkdir /etc/nginx/cert
COPY cert.pem /etc/nginx/cert/cert.pem
COPY cert.key /etc/nginx/cert/cert.key
COPY nginx.conf /etc/nginx/conf.d/trash.conf
