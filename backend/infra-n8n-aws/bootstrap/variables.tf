variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type        = string
  default     = "ipessp-n8n"
  description = "Prefixo usado em todos os recursos — bate com o do módulo principal (../variables.tf)."
}
