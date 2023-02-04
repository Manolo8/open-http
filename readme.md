
# open-http

An observable request lib. 
Use for data operations on a centralized object. Some functionalities: Promise, Data in Memory, Paging in Server or in Memory.This lib depends on open-observable

## Recommendations
We recommend other libs from the 'open' universe.

 - [open-observable](https://github.com/Manolo8/open-observable)
 - [open-form](https://github.com/Manolo8/open-form)
## Installation

with npm

```bash
  npm install open-form
```
Or with yarn
```bash
  yarn add open-form
```

## Setup 

In the index.js file, wrap your components with GlobalObservable to recognize the observables

```tsx
root.render(
    <React.StrictMode>
        <GlobalObservable>
            <App />
        </GlobalObservable>
    </React.StrictMode>
);
```
### Objects
* Datasource
* DatasourceProvider
* InMemoryDatasourceProvider
* RequestSource


### Hooks
* useRawDatasource - receive a DatasourceProvider and returns a Datasource<TInput, TOutput>
* useInMemoryDatasourceProvider - receive an array or Subscriber<T[]> and returns a DatasourceProvider
* useRequest - receive a function with TInput params and returns a Promise<TOutput>
