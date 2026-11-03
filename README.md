# PilotsCompanyDashboard

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.2.2.

## Development server

To start the dashboard with its same-origin API proxy, run:

```bash
npm start
```

The development server forwards `/api` requests to `https://pilots.nimblebit.com`, avoiding browser CORS restrictions. Open `http://localhost:4200/`. Production hosting must also proxy `/api` to that upstream; a static Angular build cannot proxy API requests on its own.

## Docker

Build and run the production image locally:

```bash
docker build -t pilots-company-dashboard:local .
docker run -d --name pilots-company-dashboard --restart unless-stopped -p 8080:8080 pilots-company-dashboard:local
```

Point your reverse proxy to `http://<host>:8080`. The container serves the Angular app, forwards `/api/` to `https://pilots.nimblebit.com`, and exposes a health check at `/healthz`. The sync code is entered in the browser and is not included in the image.

To publish it to GHCR, tag it with your GitHub namespace, then push and pull that same image reference:

```bash
docker tag pilots-company-dashboard:local ghcr.io/<owner>/pilots-company-dashboard:latest
docker push ghcr.io/<owner>/pilots-company-dashboard:latest
docker pull ghcr.io/<owner>/pilots-company-dashboard:latest
```

The production image name depends on the registry namespace you publish to; no registry credentials or namespace are configured in this repository.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
