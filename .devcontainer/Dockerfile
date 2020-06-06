FROM node:10.19.0
USER root

# aws cliの導入
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install

# firebaseの導入と設定
RUN npm install -g firebase-tools
ENV HOST 0.0.0.0
ENV PATH $PATH:./node_modules/.bin
ENV GOOGLE_APPLICATION_CREDENTIALS /app/serviceAccountKey.json
EXPOSE 5000 9005