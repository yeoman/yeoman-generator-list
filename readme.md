# yeoman-generator-list

> List of all Yeoman generators with GitHub metadata

Generates a list of all Yeoman generators as JSON and serves it via HTTP.

## Setting your environment

1. Create a [Personal access token](https://github.com/settings/tokens/new) on GitHub. This is needed since GitHub allows more API usage for authorized access. Set the environment variable `GITHUB_TOKEN` to your newly created token.
2. Remember to set the `NODE_ENV` to `production` when you deploy.

You can change the port by setting the `PORT` environment variable.

## Running with Docker (using Heroku toolbelt)

We'll assume you're using [boot2docker](http://boot2docker.io/) on OSx. Steps may vary on other platforms.

Read [Heroku documentation](https://blog.heroku.com/archives/2015/5/5/introducing_heroku_docker_release_build_deploy_heroku_apps_with_docker) for full details on running an app as a docker container.

To run the project locally:

```bash
# Start docker
boot2docker up

# Then start the app
heroku docker:start
```

To deploy to Heroku:

```bash
heroku docker:release
```

## Running manually

- Install dependencies: `$ npm install`
- Run `npm start && open http://localhost:8001`

## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
Copyright (c) Google
