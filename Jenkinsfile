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
    }
}
