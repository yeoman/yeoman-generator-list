# yeoman-generator-list

> Serves a list of all Yeoman generators as JSON via HTTP.

## Configuring the Environment

### Variables

#### `NPM_LIST_KEYWORD`

*(optional)*<br>
Default: `yeoman-generator`

You can set the `NPM_LIST_KEYWORD` environment variable if you wish to search npm packages matching a custom keyword.

#### `UPDATE_INTERVAL_IN_SECONDS`

*(optional)*<br>
Default: 3610

The time between when the list is refreshed in seconds.

#### NewRelic

 - NEW_RELIC_APP_NAME
 - NEW_RELIC_LICENSE_KEY
 - NEW_RELIC_LOG_LEVEL

#### Google Cloud Storage

 - GCLOUD_PROJECT_ID
 - GCLOUD_BUCKET
 - GCLOUD_KEYFILENAME: JSON File relative to this project that has the gcloud credentials

## Running with Docker (using Heroku toolbelt)

TODO: *(needs updated instructions)*

We'll assume you're using [Docker Toolbox](https://www.docker.com/toolbox) on macOS. Steps may vary on other platforms.

To run the project locally:

```sh
# Start docker
docker-machine start default

# Make sure you source the environment
eval "$(docker-machine env default)"

# Then start the app
docker-compose up web
```

## Running manually

- Install dependencies: `$ npm install`
- Run `npm start`

## License

[BSD license](http://opensource.org/licenses/bsd-license.php)
Copyright (c) Google
