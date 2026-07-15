output "tfstate_bucket" {
  value = aws_s3_bucket.tfstate.bucket
}

output "tflock_table" {
  value = aws_dynamodb_table.tflock.name
}

output "backend_config_snippet" {
  description = "Cole isso em ../backend.tf (bloco terraform > backend \"s3\") ou passe via -backend-config na hora do init."
  value = <<-EOT
    bucket         = "${aws_s3_bucket.tfstate.bucket}"
    key            = "n8n/terraform.tfstate"
    region         = "${var.aws_region}"
    dynamodb_table = "${aws_dynamodb_table.tflock.name}"
    encrypt        = true
  EOT
}
