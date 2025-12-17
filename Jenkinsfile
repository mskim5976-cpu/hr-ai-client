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
                        if pm2 describe ${PM2_APP_NAME} > /dev/null 2>&1; then
                            echo "Restarting ${PM2_APP_NAME}..."
                            pm2 restart ${PM2_APP_NAME}
                        else
                            echo "Starting ${PM2_APP_NAME}..."
                            pm2 start npm --name ${PM2_APP_NAME} -- start
                        fi
                        pm2 save
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                sh 'sleep 10'
                sh 'curl -f http://localhost:3000/ || exit 1'
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
