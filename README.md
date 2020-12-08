[La version française suit.](#---------------------------------------------------------------------)
# Platform - GC Forms 

This repository is work-in-progress for the GC Forms platform product. "Alpha" will be arriving in Spring 2021.

Explore it here: [https://platform-forms-node.herokuapp.com/](https://platform-forms-node.herokuapp.com//). 

## Built with

This project is based on the [CDS Node Starter](https://github.com/cds-snc/node-starter-app) and is built with:

* Node.js >= 10.x
* [Express](https://expressjs.com/) web framework
* [Nunjucks](https://mozilla.github.io/nunjucks/templating.html) view templates
* Sass (Syntactically Awesome Style Sheets) for reusable styles
* [Tailwindcss](https://tailwindcss.com/) a utility-first css framework for rapidly building custom designs
* [PostCSS](https://postcss.org/)
* [PurgeCSS](https://www.purgecss.com/)

## Running locally

Clone this repository

```sh
git clone https://github.com/cds-snc/platform-forms-node.git
```

Install dependencies

```sh
cd platform-forms-node
npm i
```

Run in development mode:

```sh
npm run dev
```

Browse application on `http://localhost:3000`

## Configuration

There are some environment variables that can optionally be configured. You can see a list in  `.env.example`.

### Public vars

There is a `.env.public` file with a few non-sensitive environment variables. These can be kept in this file, or overridden by passing values through the runtime environment.

```sh
DOMAIN_EN=
DOMAIN_FR=
LAST_UPDATED=
```

`DOMAIN_EN` and `DOMAIN_FR` will be used by the language switcher to swap domains when changing languages. If not provided, language switching will only affect the url path.

`LAST_UPDATED` is used to display the Last Updated string on the Start screen.

## Testing

There are Unit (Jest) and e2e (Cypress) tests available.

To run unit tests:

```sh
npm run test
```

To run Cypress tests:

```sh
npm run cypress:run:test
```

## Feedback component

The feedback component can be configured to send results to either [Notify](https://notification.alpha.canada.ca/) or [Airtable](https://airtable.com/).

### Notify integration

To send Feedback to an email address, you should configure the following environment variables:

```sh
NOTIFY_ENDPOINT=
NOTIFY_API_KEY=
NOTIFY_TEMPLATE_ID=
FEEDBACK_EMAIL_TO=
```

### Airtable integration

To send Feedback to an Airtable base, you should configure the following environment variables:

```sh
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
```

Your airtable base should contain a table named `Feedback` with the following columns:

* date
* session
* version
* url
* problems
* language

## Static Asset CDN

When deploying this to a production environment, you can optionally load static assets from a CDN. To do this, configure the `CDN_PREFIX` env variable. This should be the base url of the CDN where the assets are stored.

When referencing static assets (CSS, JS, images) in nunjucks templates, there is a helper available:

```html
<img src="{{ asset('/img/sig-blk-en.svg') }}" alt="Government of Canada">
```

The `asset()` helper will return the path to the asset prefixed by the CDN_PREFIX if available, otherwise it will return a local path.

## ---------------------------------------------------------------------

# Trouver de l’aide financière pendant la COVID-19

Ce dépôt est un travail en cours pour le produit de la plate-forme GC Forms. "Alpha" arrivera au printemps 2021.

Consulter l’outil ici:  [https://platform-forms-node.herokuapp.com/](https://platform-forms-node.herokuapp.com//). 


## Contributions

Ce projet est conçu sur la base [CDS Node Starter](https://github.com/cds-snc/node-starter-app) et utilise les contributions suivantes :

* Node.js >= 10.x
* Environnement Web [Express](https://expressjs.com/)
* Gabarits [Nunjucks](https://mozilla.github.io/nunjucks/templating.html)
* Feuilles de styles Sass (Syntactically Awesome Style Sheets)
* [Tailwindcss](https://tailwindcss.com/) un environnement CSS modulaire accélérant la conception de pages web
* [PostCSS](https://postcss.org/)
* [PurgeCSS](https://www.purgecss.com/)

## Exécuter localement

Cloner ce référentiel

```sh
git clone https://github.com/cds-snc/c19-benefits-node.git
```

Installer les dépendances

```sh
cd c19-benefits-node
npm i
```

Exécuter en mode développement

```sh
npm run dev
```

Accéder à l’application au `http://localhost:3000`

## Configuration

Certaines valeurs d'environnement peuvent être configurés. Cette étape est optionnelle. Consultez la liste des valeurs disponibles dans `.env.example`.

### Variables publiques

Le fichier `.env.public` contient des variables d’environnement non-confidentielles. Ces valeurs peuvent être laissées telles-qu’elles, ou écrasées par par les variables d'environnement à l’exécution.

```sh
DOMAIN_EN=
DOMAIN_FR=
LAST_UPDATED=
```

`DOMAIN_EN` et `DOMAIN_FR` sont employées par le commutateur de langue afin d’échanger les domaines lorsque la langue passe du français à l’anglais, ou vice-versa. Si aucune valeur n’est donnée, le commutateur de langue n’affectera que le chemin de l’URL.

`LAST_UPDATED` est employée pour afficher la valeur Last Updated sur l’écran du début.

## Tests

Des test unitaires (Jest) et bout-à-bout (e2e Cypress) sont disponibles. 

Pour exécuter les tests :

```sh
npm run test
```

Pour exécuter les tests Cypress :

```sh
npm run cypress:run:test
```

## Composant de rétroaction

Le module de rétroaction peut être configuré pour être envoyé par [Notify](https://notification.alpha.canada.ca/) ou [Airtable](https://airtable.com/).

### Intégration avec Notify

Pour envoyer la rétroaction à une adresse courriel, vous devez configurer les variables suivantes :

```sh
NOTIFY_ENDPOINT=
NOTIFY_API_KEY=
FEEDBACK_EMAIL_TO=
```

### Intégration avec Airtable

Pour envoyer la rétroaction à une base Airtable, vous devez configurer les variables suivantes :

```sh
AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
```

Votre base Airtable devrait contenir une table nommée `Feedback` avec les colonnes suivantes :

* date
* session
* version
* url
* problems
* language

## Ressource statiques servies par réseau de diffusion de contenu (CDN)

Lors du déploiement vers un environnement de production, vous pouvez optionnellement charger les ressources statiques à partir d’un CDN. Pour ce faire, vous devez configurer la variable d’environnement `CDN_PREFIX` Celle-ci devrait être l’url de base du CDN où cette ressource est est stockée.

Pour lier des ressources statiques (CSS, JS, images) dans les gabarits nunjucks, vous pouvez utiliser la fonction d’aide suivante :

```html
<img src="{{ asset('/img/sig-blk-en.svg') }}" alt="Government of Canada">
```

La fonction d’aide `asset()` renvoie le chemin de ressources statiques définie par CDN_PREFIX,ou le chemin local si cette variable n’est pas définie.
