pipeline {
    agent { label 'rootless-docker' }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/chalindu888/Secure-Cloud-Native-Healthcare-Management-Platform_Devops-GroupNo-73-.git'
            }
        }
        stage('Docker Compose Down') {
            steps {
                sh 'docker compose down --remove-orphans || true'
            }
        }
        stage('Build and Deploy with Docker Compose') {
            steps {
                sh 'docker compose up -d --build'
            }
        }
        stage('Verify Containers') {
            steps {
                sh 'docker compose ps'
            }
        }
        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh '''
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin

                        docker tag healthcare-platform-cicd-frontend:latest "$DH_USER/healthops-frontend:latest"
                        docker tag healthcare-platform-cicd-backend:latest "$DH_USER/healthops-backend:latest"

                        docker push "$DH_USER/healthops-frontend:latest"
                        docker push "$DH_USER/healthops-backend:latest"

                        docker logout
                    '''
                }
            }
        }
    }
}
   
