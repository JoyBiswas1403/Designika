# CloudFront Distribution for Static Assets (Images)
# Uses S3 as origin for generated design images

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "domain_name" {
  default = "cdn.designika.ai"
}

variable "certificate_arn" {
  description = "ACM Certificate ARN for HTTPS"
}

# S3 Bucket for Images
resource "aws_s3_bucket" "images" {
  bucket = "designika-generated-images"
}

resource "aws_s3_bucket_public_access_block" "images" {
  bucket = aws_s3_bucket.images.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "images" {
  name                              = "designika-images-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "images" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "Designika Generated Images CDN"
  aliases             = [var.domain_name]

  origin {
    domain_name              = aws_s3_bucket.images.bucket_regional_domain_name
    origin_id                = "S3-designika-images"
    origin_access_control_id = aws_cloudfront_origin_access_control.images.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-designika-images"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400      # 1 day
    max_ttl                = 31536000   # 1 year
    compress               = true
  }

  # Cache images aggressively
  ordered_cache_behavior {
    path_pattern     = "*.webp"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-designika-images"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 31536000   # 1 year
    default_ttl            = 31536000
    max_ttl                = 31536000
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Project     = "Designika"
    Environment = "Production"
  }
}

# S3 Bucket Policy for CloudFront
resource "aws_s3_bucket_policy" "images" {
  bucket = aws_s3_bucket.images.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.images.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.images.arn
          }
        }
      }
    ]
  })
}

# Outputs
output "cloudfront_domain" {
  value = aws_cloudfront_distribution.images.domain_name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.images.bucket
}
