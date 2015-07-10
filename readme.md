# yeoman-generator-list

> List of all Yeoman generators with GitHub metadata

Generates a list of all Yeoman generators as JSON and serves it via HTTP.

Side note: This tool is actually generic and can work for any npm package.

## Setting your environment

1. [Register a new OAuth app](https://github.com/settings/applications/new) on GitHub. This is needed since GitHub allows more API usage for registered apps.
2. Set the environment variables `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from your newly created app.
3. Remember set the `NODE_ENV` to `production` when you deploy.
4. (optionnal) You can set the `NPM_LIST_KEYWORD` environment variable if you wish to search npm packages matching a custom keyword.

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
