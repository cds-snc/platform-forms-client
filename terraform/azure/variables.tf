variable "name" {
  description = "(Required) Specify the Service Name."
}

variable "location" {
  description = "(Required) Specify the location for these resources. Changing this forces a new resource to be created."
  default     = "canadacentral"
}

variable "docker_image" {
  description = "(Required) Specify the name of the container to be deployed"
}

variable "docker_image_tag" {
  description = "(Optional) Specify the tag to be deployed"
}
