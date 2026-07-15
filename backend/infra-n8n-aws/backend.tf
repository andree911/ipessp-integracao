# Preencha com o output "backend_config_snippet" do módulo bootstrap/ depois
# de rodar `terraform apply` lá (ver README.md, passo 1). Terraform não aceita
# variável dentro do bloco backend, por isso são valores fixos aqui.
terraform {
  backend "s3" {
    bucket         = "PREENCHER-APOS-BOOTSTRAP"
    key            = "n8n/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "PREENCHER-APOS-BOOTSTRAP"
    encrypt        = true
  }
}
