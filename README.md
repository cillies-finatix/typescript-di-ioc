
[![CI](https://github.com/cillies-finatix/typescript-di-ioc/actions/workflows/ci.yml/badge.svg)](https://github.com/cillies-finatix/typescript-di-ioc/actions/workflows/ci.yml)

# TypeScript DI IoC

This project is a lightweight Inversion of Control (IoC) container and Dependency Injection (DI) framework written in TypeScript. It provides a flexible way to manage dependencies in your application using the `Injector` class and related utilities.

## Features
- **Inversion of Control Container**: Centralizes the creation and management of dependencies.
- **Dependency Injection**: Automatically injects required dependencies into classes and functions.
- **Provider Configuration**: Supports various provider types and configuration options.

## Injector Class
The `Injector` class is the core of the DI system. It resolves dependencies, manages provider lifecycles, and allows you to register and retrieve services throughout your application.

## Usage Example
```typescript
import { Injector } from './src/injection/injector';
import { MyService } from './src/services/my-service';

const injector = new Injector([
  { provide: MyService, useClass: MyService },
]);

const myService = injector.get(MyService);
myService.doSomething();
```

## Running and Testing

### Install dependencies
```bash
npm install
```

### Run tests
```bash
npm test
```

### Run the application
You can run the main entry point (e.g., `src/index.ts`) using ts-node:
```bash
npx ts-node src/index.ts
```
Or build and run with Node.js:
```bash
npm run build
node dist/index.js
```

## License
MIT
