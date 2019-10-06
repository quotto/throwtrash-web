def notifyBuild(buildStatus, message) {
  // Default values
  def color = 'good'
  def subject = "${buildStatus}: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'"
  def summary = "${subject} (${env.BUILD_URL})\n${message}"

  // Override default values based on build status
  if (buildStatus == 'SUCCESSFUL') {
    color = 'good'
  } else {
    color = 'danger'
  }

  // Send notifications
  slackSend (color: color, message: summary)
}

def payload = readJSON text: "${params.payload}"
def skip = payload.ref == "refs/heads/${params.target}"

pipeline {
    agent any
    environment {
        TARGET_DIR = '/src'
    }
    stages {
        stage('pull') {
            when { expression { skip } }
            steps {
                script {
                    try {
                        sh '''
                        cd ${TARGET_DIR}
                        git pull
                        '''
                    } catch(e) {
                        print "${e.getMessage()}"
                        notifyBuild('FAILUER', 'Pull failed.')
                    }
                }
            }
        }
        stage('restart') {
            when { expression { skip } }
            steps {
                script {
                    try {
                        sh '''
                        docker-compose -f ${TARGET_DIR}/docker/docker-compose.yml restart node
                        '''
                    }catch(e) {
                        print "${e.getMessage()}"
                        notifyBuild('FAILUER', 'node restart failed.')
                    }
                }
            }
        }
        stage('notify') {
            when { expression { skip } }
            steps {
                notifyBuild('SUCCESSFULL', 'Deploy succeed.')
            }
        }
    }
}