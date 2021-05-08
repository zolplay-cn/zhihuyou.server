<h1 align="center">知忽悠 Zhihuyou Server</h1>
<p align='center'>
<a href='https://github.com/zolran-studio/zhihuyou.server/workflows/Unit%20Tests'><img src='https://github.com/zolran-studio/zhihuyou.server/workflows/Unit%20Tests/badge.svg' /></a>
<a href='https://github.com/zolran-studio/zhihuyou.server/workflows/E2E%20Tests'><img src='https://github.com/zolran-studio/zhihuyou.server/workflows/E2E%20Tests/badge.svg' /></a>
<img src="https://codecov.io/gh/zolran-studio/zhihuyou.server/branch/main/graph/badge.svg?token=C3Z7R0E9L3"/>
</p>

- [Nest](https://github.com/nestjs/nest) 7
- TypeScript 4.
- [Prisma](https://prisma.io) 2

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn dev

# migrate db
$ yarn migrate:dev

# production mode
$ yarn start:prod
```

Visit [http://localhost:$port/api](http://localhost:3001/api) to see OpenAPI docs.

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e
```

## Duplicate .env
```bash
cp .env.example .env
cp .env.example .test.env
```
