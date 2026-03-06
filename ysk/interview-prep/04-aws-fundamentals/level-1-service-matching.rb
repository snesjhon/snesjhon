# =============================================================================
# Level 1: AWS Service Matching
# =============================================================================
# Before running: ruby level-1-service-matching.rb
# Goal: given a requirement, identify the correct AWS service and explain why.
#
# Know these seven cold:
#   S3            -> object storage (files, images, backups, static assets)
#   EC2           -> virtual machines (compute, run your app code)
#   RDS           -> managed relational database (PostgreSQL, MySQL)
#   ElastiCache   -> managed Redis/Memcached (cache, sessions, job queue)
#   SQS           -> managed message queue (durable async messaging)
#   CloudFront    -> CDN (edge caching, static assets close to users)
#   IAM           -> access control (who can do what to which resource)

# =============================================================================
# Test harness
# =============================================================================
def test(desc, actual, expected)
  pass = actual == expected
  puts "#{pass ? 'PASS' : 'FAIL'} #{desc}"
  unless pass
    puts "  expected: #{expected.inspect}"
    puts "  received: #{actual.inspect}"
  end
end

# -----------------------------------------------------------------------------
# Exercise 1
# Map each requirement to the correct AWS service.
# Return a symbol: :s3, :ec2, :rds, :elasticache, :sqs, :cloudfront, :iam
# -----------------------------------------------------------------------------
def service_for(requirement)
  raise NotImplementedError, "TODO"
end

test("store user images -> S3",
  service_for(:store_user_uploaded_images), :s3)

test("run Rails app -> EC2",
  service_for(:run_rails_app_code), :ec2)

test("PostgreSQL -> RDS",
  service_for(:postgresql_database), :rds)

test("Redis for Sidekiq -> ElastiCache",
  service_for(:redis_for_sidekiq), :elasticache)

test("cache user profiles -> ElastiCache",
  service_for(:cache_user_profiles_for_1_hour), :elasticache)

test("durable job queue -> SQS",
  service_for(:durable_job_queue_survives_redis_crash), :sqs)

test("serve JS/CSS globally -> CloudFront",
  service_for(:serve_js_css_images_fast_globally), :cloudfront)

test("EC2 needs S3 access -> IAM role",
  service_for(:ec2_instance_needs_s3_write_access), :iam)

test("sessions across servers -> ElastiCache",
  service_for(:session_storage_across_multiple_servers), :elasticache)

test("store DB backups -> S3",
  service_for(:store_database_backups), :s3)

# -----------------------------------------------------------------------------
# Exercise 2
# Multi-AZ vs Read Replica — different tools for different problems.
# Return :multi_az or :read_replica for each scenario.
# -----------------------------------------------------------------------------
def rds_feature_for(scenario)
  raise NotImplementedError, "TODO"
end

test("primary goes down -> Multi-AZ handles failover",
  rds_feature_for(:primary_db_instance_goes_down), :multi_az)

test("analytics overloading primary -> Read Replica",
  rds_feature_for(:analytics_queries_overloading_primary), :read_replica)

test("reduce maintenance downtime -> Multi-AZ",
  rds_feature_for(:reduce_downtime_during_maintenance), :multi_az)

test("reporting queries -> Read Replica",
  rds_feature_for(:reporting_queries_taking_too_long), :read_replica)

# -----------------------------------------------------------------------------
# Exercise 3
# S3 access patterns — public vs private files.
# Return :public_url, :presigned_url, or :direct_upload
# -----------------------------------------------------------------------------
def s3_pattern_for(scenario)
  raise NotImplementedError, "TODO"
end

test("invoice PDF -> presigned URL (private, expires)",
  s3_pattern_for(:user_invoice_pdf_download), :presigned_url)

test("product image -> public URL",
  s3_pattern_for(:public_product_image_shown_on_homepage), :public_url)

test("large video upload -> direct upload (skip your server)",
  s3_pattern_for(:user_uploads_large_video), :direct_upload)

test("logo in email -> public URL",
  s3_pattern_for(:company_logo_in_email_template), :public_url)

test("medical record -> presigned URL (sensitive)",
  s3_pattern_for(:user_medical_record_download), :presigned_url)

# -----------------------------------------------------------------------------
# Exercise 4
# Sidekiq vs SQS — when to use each.
# Return :sidekiq or :sqs
# -----------------------------------------------------------------------------
def queue_choice_for(scenario)
  raise NotImplementedError, "TODO"
end

test("Rails monolith jobs -> Sidekiq",
  queue_choice_for(:rails_monolith_background_jobs), :sidekiq)

test("must survive Redis crash -> SQS",
  queue_choice_for(:jobs_must_survive_redis_crash), :sqs)

test("cross-language services -> SQS",
  queue_choice_for(:python_service_sends_jobs_to_ruby_worker), :sqs)

test("welcome emails -> Sidekiq",
  queue_choice_for(:send_welcome_emails_after_signup), :sidekiq)

test("compliance audit trail -> SQS",
  queue_choice_for(:compliance_requires_durable_audit_trail_of_all_messages), :sqs)
