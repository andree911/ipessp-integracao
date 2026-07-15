# CloudFront na frente do ALB só pra ganhar HTTPS de graça no domínio
# *.cloudfront.net (certificado padrão da AWS, sem precisar de domínio
# próprio nem ACM). Meta/360dialog exigem webhook em HTTPS — é o que resolve
# isso sem depender de decidir domínio agora. Pra trocar por domínio próprio
# depois: pedir certificado ACM (region us-east-1, obrigatório pra
# CloudFront) validado pro domínio escolhido, apontar viewer_certificate pra
# ele, e criar um CNAME/ALIAS no DNS de vocês apontando pro
# aws_cloudfront_distribution.n8n.domain_name — não precisa recriar nada
# deste arquivo além disso.

resource "aws_cloudfront_distribution" "n8n" {
  enabled = true
  comment = "${var.project_name} — HTTPS na frente do ALB"

  origin {
    domain_name = aws_lb.n8n.dns_name
    origin_id   = "alb"

    custom_origin_config {
      http_port              = 80
      https_port              = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods          = ["GET", "HEAD"]
    target_origin_id        = "alb"
    viewer_protocol_policy  = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl      = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = { Name = "${var.project_name}-cf" }
}
