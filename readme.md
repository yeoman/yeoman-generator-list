# Yeoman generator list

Generates a list of all Yeoman Generators as JSON and serves it via HTTP.


## Getting Started

- Install dependencies: `npm install`

- [Register a new OAuth app](https://github.com/settings/applications/new) on GitHub. This is needed since GitHub allows more API usage for registered apps.

- Set the environment variables `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from your newly created app. Remember set the `NODE_ENV` to `production` when you deploy.

- Run `node server.js && open http://localhost:8001`

You can change the port by setting the `PORT` environment variable.


## Using Docker

You can run this project as a Docker container by first building the image.

- Run the the following command in this directory: `docker build -t <repo>[:<tag>] .`

- Run the container: `docker run -d -P -e GITHUB_CLIENT_ID=<my-client-id> -e GITHUB_CLIENT_SECRET=<my-client-secret> -e NODE_ENV=production <repo>[:<tag>]`

## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
Copyright (c) Google
