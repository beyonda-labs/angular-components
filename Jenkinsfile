pipeline {

    agent {
        label 'node22'
    }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
    }

    environment {
        STABLE_BRANCH = 'main'
        VERDACCIO_REGISTRY = 'https://verdaccio.home.arpa/'
        PUBLISH_DIR = 'dist'
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

        stage('Version') {
            steps {
                script {

                    def baseVersion = sh(
                        script: "node -p \"require('./package.json').version\"",
                        returnStdout: true
                    ).trim()

                    if (!(baseVersion ==~ /^\d+\.\d+\.\d+$/)) {
                        error(
                            "package.json must contain a clean stable " +
                            "version such as 1.1.0. Found: ${baseVersion}"
                        )
                    }

                    def shortSha = sh(
                        script: 'git rev-parse --short=7 HEAD',
                        returnStdout: true
                    ).trim()

                    if (env.BRANCH_NAME == env.STABLE_BRANCH) {

                        env.PUBLISH_VERSION = baseVersion
                        env.PUBLISH_TAG = ''

                    } else {

                        def normalizedBranch = env.BRANCH_NAME
                            .toLowerCase()
                            .replaceAll('/', '-')
                            .replaceAll('_', '-')
                            .replaceAll(' ', '-')
                            .replaceAll('[^a-z0-9-]', '')
                            .replaceAll('-+', '-')
                            .replaceAll('^-|-$', '')

                        if (!normalizedBranch) {
                            error('Branch name produces an empty npm dist-tag')
                        }

                        if (normalizedBranch == 'latest') {
                            error('Non-stable branches cannot use reserved tag latest')
                        }

                        env.PUBLISH_TAG = normalizedBranch
                        env.PUBLISH_VERSION =
                            "${baseVersion}-${normalizedBranch}." +
                            "${env.BUILD_NUMBER}.${shortSha}"
                    }

                    echo "Publish version: ${env.PUBLISH_VERSION}"
                    if (env.PUBLISH_TAG) {
                        echo "Dist-tag: ${env.PUBLISH_TAG}"
                    } else {
                        echo "Dist-tag: latest"
                    }
                }

                sh '''
                    set -eu

                    export CI_PACKAGE_FILE="$PUBLISH_DIR/package.json"
                    export CI_PUBLISH_VERSION="$PUBLISH_VERSION"

                    node <<'NODE'
const fs = require('fs');
const file = process.env.CI_PACKAGE_FILE;
const version = process.env.CI_PUBLISH_VERSION;
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
pkg.version = version;
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\\n');
NODE

                    echo "Artifact version:"
                    node -p "require('./$PUBLISH_DIR/package.json').version"
                '''
            }
        }

        stage('Publish') {
            steps {
                script {
                    def packageName = sh(
                        script: "node -p \"require('./${env.PUBLISH_DIR}/package.json').name\"",
                        returnStdout: true
                    ).trim()

                    if (!packageName.startsWith('@beyonda-labs/')) {
                        error(
                            "Refusing to publish package outside " +
                            "@beyonda-labs scope: ${packageName}"
                        )
                    }
                    env.PACKAGE_NAME = packageName
                }

                withCredentials([
                    usernamePassword(
                        credentialsId: 'verdaccio-jenkins-publisher',
                        usernameVariable: 'NPM_USER',
                        passwordVariable: 'NPM_PASSWORD'
                    )
                ]) {
                    sh '''
                        set -eu

                        if [ "$BRANCH_NAME" = "$STABLE_BRANCH" ]; then
                            set +e
                            npm view "$PACKAGE_NAME@$PUBLISH_VERSION" version \
                                --registry="$VERDACCIO_REGISTRY" \
                                >/tmp/npm-view.out 2>/tmp/npm-view.err
                            rc=$?
                            set -e

                            if [ "$rc" -eq 0 ] && [ -s /tmp/npm-view.out ]; then
                                rm -f /tmp/npm-view.out /tmp/npm-view.err
                                echo "Stable version $PUBLISH_VERSION already exists in Verdaccio."
                                echo "Update package.json before publishing another release."
                                exit 1
                            fi

                            if [ "$rc" -ne 0 ] && ! grep -q "E404" /tmp/npm-view.err; then
                                echo "Unexpected error querying Verdaccio registry:"
                                cat /tmp/npm-view.err
                                rm -f /tmp/npm-view.out /tmp/npm-view.err
                                exit 1
                            fi

                            rm -f /tmp/npm-view.out /tmp/npm-view.err
                        fi

                        umask 077

                        export NPM_CONFIG_USERCONFIG="$WORKSPACE/.npmrc.ci"

                        cleanup() {
                            rm -f "$NPM_CONFIG_USERCONFIG"
                        }
                        trap cleanup EXIT HUP INT TERM

                        AUTH_B64="$(printf '%s:%s' "$NPM_USER" "$NPM_PASSWORD" | base64 | tr -d '\\n')"

                        {
                            echo 'registry=https://registry.npmjs.org/'
                            echo '@beyonda-labs:registry=https://verdaccio.home.arpa/'
                            printf '%s\\n' "//verdaccio.home.arpa/:_auth=${AUTH_B64}"
                        } > "$NPM_CONFIG_USERCONFIG"

                        chmod 600 "$NPM_CONFIG_USERCONFIG"
                        unset AUTH_B64

                        WHOAMI="$(npm whoami --registry="$VERDACCIO_REGISTRY")"
                        if [ "$WHOAMI" != "jenkins-publisher" ]; then
                            echo "Unexpected Verdaccio identity"
                            exit 1
                        fi
                        echo "Authenticated as jenkins-publisher"

                        cd "$PUBLISH_DIR"

                        if [ "$BRANCH_NAME" = "$STABLE_BRANCH" ]; then
                            pnpm publish --registry="$VERDACCIO_REGISTRY" --no-git-checks
                        else
                            pnpm publish --registry="$VERDACCIO_REGISTRY" --tag "$PUBLISH_TAG" --no-git-checks
                        fi
                    '''
                }
            }
        }

    }

}
