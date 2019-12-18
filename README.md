# Discoin

[![Build Status](https://github.com/discoin/rewrite/workflows/CI/badge.svg)](https://github.com/discoin/rewrite/actions)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

The new Discoin API.

## Contributing

### Prequisites

This project uses [Node.js](https://nodejs.org) 12 to run.

This project uses [Yarn](https://yarnpkg.com) to install dependencies, although you can use another package manager like [npm](https://www.npmjs.com) or [pnpm](https://pnpm.js.org).

```sh
yarn install
# or `npm install`
# or `pnpm install`
```

### Building

Run the `build` script to compile the TypeScript into the `tsc_output` folder.
This will compile the `src` and the `test` directory, so be careful not to upload the whole folder as a published package.

### Style

This project uses [Prettier](https://prettier.io) and [XO](https://github.com/xojs/xo).

You can run Prettier in the project with this command:

```sh
yarn run format
```

You can run XO with this command:

```sh
yarn run lint
```

Note that XO will also error if you have TypeScript errors, not just if your formatting is incorrect.

### Linting

This project uses [XO](https://github.com/xojs/xo) (which uses [ESLint](https://eslint.org) and some plugins internally) to perform static analysis on the TypeScript.
It reports things like unused variables or not following code conventions.

```sh
yarn run lint
```

Note that XO will also error if you have incorrect formatting, not just if your TypeScript code has errors.

## Hosting

This server is designed to run in a Docker environment hosted on an Ubuntu operating system (18.04).

### Hosting Prequisites

- [Docker](https://docs.docker.com/v17.09/engine/installation/linux/docker-ce/ubuntu/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [git](https://git-scm.com/)
- `sudo` access (required for Docker, usually)
- Expose ports `80` and `443` on the server

### Setup

1. Setup user account
2. Clone this repository (required for the `docker-compose.yml` file)

   ```sh
      git clone https://github.com/Discoin/rewrite.git discoin
   ```

3. Populate the `.env` file
4. Start the containers

   ```sh
   docker-compose -f "docker-compose.yml" up -d
   ```
