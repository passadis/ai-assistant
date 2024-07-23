variable "azure_spsecret" {
  description = "SP"
  type        = string
}
variable "azure_clientid" {
  description = "AppID"
  type        = string
}

variable "azure_subid" {
  description = "Subscription ID"
  type        = string
}

variable "azure_tenantid" {
  description = "Tenant ID"
  type        = string
}

variable "sql_admin_username" {
  description = "SQL Admin Username"
  type        = string
}

variable "sql_admin_password" {
  description = "SQL Admin Password"
  type        = string
}