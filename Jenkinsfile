pipeline {
    agent any
    environment {
        TARGET_DIR = '/src'
    }
    stages {
        stage('pull') {
            steps {
                sh '''
                cd ${TARGET_DIR}
                git pull
                '''
            }
        }
        stage('restart') {
            steps {
                sh '''
                docker-compose -f ${TARGET_DIR}/docker/docker-compose.yml restart node
                '''
            }
        }
    }
}