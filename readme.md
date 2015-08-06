# yeoman-generator-list

> Serves a list of all Yeoman generators as JSON via HTTP.

## Configuring the Environment

### Variables

#### `NODE_ENV`

*(optional)* Default: `development`

Used to set the defaults for most other variables.

**Remember set the `NODE_ENV` to `production` when you deploy.**

#### `NPM_LIST_KEYWORD`

*(optional)* Default: `yeoman-generator`

You can set the `NPM_LIST_KEYWORD` environment variable if you wish to search npm packages matching a custom keyword.

#### `NPM_LIST_LIMIT`

*(optional)* Default:
 - development: 100
 - production: 5000

Sets the number of GitHub queries to max out at. It is low in development so the rate limit is not hit. 5000 is the current per hour limit so that is what production is set to.

#### `PORT`

*(optional)* Default:
 - development: 8001
 - production: 80

The port number for the server to listen on.

#### `UPDATE_INTERVAL_IN_SECONDS`
*(optional)* Default: 3610

The time between when the list is refreshed in seconds. GitHub's API refresh time is one hour so set it a little longer than that.

#### `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
**(required)**

These are the properties to be able to use the GitHub API. These are needed since GitHub allows more API usage for registered apps.

You can get them by [registering a new OAuth app](https://github.com/settings/applications/new) on GitHub.

These are not actually used directly in this project but are used by its dependencies.

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
