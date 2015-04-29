# yeoman-generator-list

> List of all Yeoman generators with GitHub metadata

Generates a list of all Yeoman generators as JSON and serves it via HTTP.


## Getting Started

- Install dependencies: `$ npm install`

- Create a [Personal access token](https://github.com/settings/tokens/new) on GitHub. This is needed since GitHub allows more API usage for authorized access.

- Set the environment variable `GITHUB_TOKEN` to your newly created token. Remember to set the `NODE_ENV` to `production` when you deploy.

- Run `node server.js && open http://localhost:8001`

You can change the port by setting the `PORT` environment variable.


## Using Docker

You can run this project as a Docker container by first building the image.

- Run the the following command in this directory: `docker build -t <repo>[:<tag>] .`

- Run the container: `docker run -d -P -e GITHUB_TOKEN=<my-token> -e NODE_ENV=production <repo>[:<tag>]`


## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
Copyright (c) Google
