provider "azurerm" {
  version = "= 2.1.0"
  features {}
}

terraform {
  backend "azurerm" {
  }
}

