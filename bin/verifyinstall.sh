#!/bin/sh

getValue() {
  curl "$1" -s | grep "$2" | awk -F'"' '{ print $4 } '
}

getSha() {
  getValue "$1" "github-sha"
}

getVersion() {
  getValue "$1" "version"
}

checkSiteSha() {

  site_sha=$(getSha "$1")
  sha=$(git rev-parse origin/"$3")

  if [ "$sha" = "$site_sha" ]; then
    printf "✅ %s matches sha in origin/%s \n" "$1" "$3"
  else
    printf "🛑 %s sha's don't match\n" "$1"
    printf "$site_sha !== %s\n" "$sha"
  fi

}

validateSite() {
  printf "%s is deployed to %s\n" "$(getVersion "$1")" "$1"
}

printf "Running git fetch\n"
git fetch

printf "\nDevelopment Environment\n"
checkSiteSha https://cv19benefits-appservice-dev.azurewebsites.net/en/start against master
validateSite https://cv19benefits-appservice-dev.azurewebsites.net/en/start againstBranch master
printf "\nStaging Deployment\n"
validateSite https://cv19benefits-appservice-staging.azurewebsites.net/en/start againstBranch staging

printf "\nProduction Deployment\n"
validateSite https://covid-benefits.alpha.canada.ca/en/start againstBranch staging
validateSite https://covid-prestations.alpha.canada.ca/fr/debut againstBranch staging
