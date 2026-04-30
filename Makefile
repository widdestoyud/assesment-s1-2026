ENV_VAR := ${ENVIRONMENT}
NPMRC := ${NPMRC_FILE}

build:
	cat ${NPMRC} >> .npmrc
	npm i --production=false && npm run build

unit-test-coverage:
	npm i --production=false && npm run test:coverage
