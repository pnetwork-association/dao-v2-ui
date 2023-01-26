# dao-v2-ui

pNetwork DAO website

&nbsp;

***

&nbsp;

## :rocket: How to start

```
npm install
```

If you want to use https

```
mkcert localhost
```


Start:

```
npm run start:https or npm start
```

&nbsp;

***

&nbsp;



## :clipboard: Release


Go to __`.github/workflows/versioning.yml`__ and updates __`body`__ fields with the all changelogs

```
Changes in this Release
    - First Change
    - Second Change
    - ecc eccc
```

then:

```
git add .github/workflows/versioning.yml
git commit -S -m "chore(global): updates changelog for release"
```


Run one of the followings command:

```
npm version patch
npm version minor
npm version major
```

and then:

```
git push origin develop --follow-tags
```