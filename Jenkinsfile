pipeline {
    agent any

    environment {
        APP_DIR = '/opt/hr-ai-client'
        PM2_APP_NAME = 'hr-ai-client'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Pull Latest Code') {
            steps {
                dir("${APP_DIR}") {
                    sh '''
                        git config --global --add safe.directory ${APP_DIR}
                        git fetch origin develop
                        git checkout develop
                        git reset --hard origin/develop
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${APP_DIR}") {
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                dir("${APP_DIR}") {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy') {
            steps {
                dir("${APP_DIR}") {
                    sh '''
                        echo "Restarting ${PM2_APP_NAME} (root pm2)..."
                        sudo pm2 restart ${PM2_APP_NAME} || sudo pm2 start npm --name ${PM2_APP_NAME} -- start
                        sudo pm2 save
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 15'
                sh 'curl -f http://localhost:3030/ || exit 1'
            }
        }
    }

    post {
        success {
            echo 'HR AI Client deployment successful!'
        }
        failure {
            echo 'HR AI Client deployment failed!'
        }
    }
}
