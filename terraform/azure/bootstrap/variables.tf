variable "name" {
  description = "(Required) Specify the Service Name."
}

variable "location" {
  description = " (Required) Specify the location for these resources. Changing this forces a new resource to be created."
}

variable "storage_account_tier" {
  description = "(Required) Defines the Tier to use for this storage account. Valid options are Standard* and Premium. Changing this forces a new resource to be created"
  default     = "Standard"
}

variable "storage_account_replication_type" {
  description = "(Required) Defines the type of replication to use for this storage account. Valid options are LRS*, GRS, RAGRS and ZRS."
  default     = "LRS"
}

