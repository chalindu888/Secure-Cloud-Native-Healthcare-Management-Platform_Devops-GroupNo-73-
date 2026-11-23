terraform {
  required_version = ">= 1.5.0"
}

variable "project_name" {
  description = "Project identifier"
  type        = string
  default     = "healthcare-platform-cicd"
}

variable "frontend_port" {
  description = "Host port mapped to frontend container"
  type        = number
  default     = 3000
}

variable "backend_port" {
  description = "Host port mapped to backend container"
  type        = number
  default     = 5000
}

output "platform_summary" {
  value = {
    project      = var.project_name
    frontend_url = "http://localhost:${var.frontend_port}"
    backend_url  = "http://localhost:${var.backend_port}"
  }
}
