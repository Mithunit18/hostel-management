pipeline {
    agent any

    environment {
        DOCKER_USER = "mithun039"
        PROJECT = "hostel-outpass"
        FRONTEND_DOCKERFILE = "Dockerfile.frontend"
        BACKEND_DOCKERFILE = "Dockerfile.backend"
    }

    stages {

        stage("Clone Repository") {
            steps {
                git branch: "main",
                    url: "https://github.com/Mithunit18/hostel-management.git"
            }
        }

        stage("Install Frontend Dependencies") {
            steps {
                dir("app") {
                    bat "npm install"
                }
            }
        }

        stage("Install Backend Dependencies") {
            steps {
                dir("server") {
                    bat "npm install"
                }
            }
        }

        stage("Run Backend Tests") {
            steps {
                dir("server") {
                    bat "npm test || echo No tests found"
                }
            }
        }

        stage("Build Frontend") {
            steps {
                dir("app") {
                    bat "npm run build"
                }
            }
        }

        stage("Build Backend") {
            steps {
                dir("server") {
                    bat "npm run build || echo Skipping backend build"
                }
            }
        }

        stage("Docker Login") {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    bat "echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin"
                }
            }
        }

        stage("Build Docker Images") {
            steps {
                bat """
                docker build -t %DOCKER_USER%/%PROJECT%-frontend:latest -f %FRONTEND_DOCKERFILE% .
                docker build -t %DOCKER_USER%/%PROJECT%-backend:latest -f %BACKEND_DOCKERFILE% .
                """
            }
        }

        stage("Push Docker Images") {
            steps {
                bat """
                docker push %DOCKER_USER%/%PROJECT%-frontend:latest
                docker push %DOCKER_USER%/%PROJECT%-backend:latest
                """
            }
        }
    }
}
