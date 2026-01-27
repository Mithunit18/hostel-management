pipeline {
    agent any

    environment {
        NODE_ENV = "production"        
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
            when {
                environment name: 'NODE_ENV', value: 'test'
            }
            steps {
                dir("server") {
                    withCredentials([
                        string(credentialsId: 'mongo-uri-test', variable: 'MONGO_URI')
                    ]) {
                        bat """
                        set NODE_ENV=test
                        npm test
                        """
                    }
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
                    bat """
                    npm run build
                    IF %ERRORLEVEL% NEQ 0 (
                        echo Skipping backend build
                        EXIT /B 0
                    )
                    """
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
