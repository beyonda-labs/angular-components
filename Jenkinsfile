pipeline {

    agent {
        label 'node22'
    }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Environment') {
            steps {
                sh '''
                    set -eu

                    echo "Node:"
                    node --version

                    echo "Corepack:"
                    corepack --version

                    echo "pnpm:"
                    pnpm --version
                '''
            }
        }

        stage('Install') {
            steps {
                sh '''
                    set -eu
                    corepack enable
                    pnpm install --frozen-lockfile
                '''
            }
        }

        stage('Lint') {
            steps {
                sh '''
                    set -eu
                    pnpm run lint
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    set -eu
                    pnpm run test:ci
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    set -eu
                    pnpm run build
                '''
            }
        }

    }

}
