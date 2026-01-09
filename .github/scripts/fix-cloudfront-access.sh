#!/bin/bash

# Script to fix CloudFront Access Denied issues by updating Terraform configuration
set -euo pipefail

# Function to log messages with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if we're in the right directory
check_directory() {
    if [[ ! -d "terraform" ]]; then
        log "❌ Error: terraform directory not found. Please run this script from the project root."
        exit 1
    fi
    
    if [[ ! -f "terraform/s3.tf" ]]; then
        log "❌ Error: terraform/s3.tf not found."
        exit 1
    fi
    
    log "✅ Found terraform directory"
}

# Function to backup current configuration
backup_config() {
    local backup_dir="terraform/backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    cp terraform/s3.tf "$backup_dir/"
    cp terraform/cloudfront.tf "$backup_dir/"
    
    log "✅ Backed up configuration to $backup_dir"
}

# Function to update S3 public access block
update_s3_config() {
    log "🔧 Updating S3 public access block configuration..."
    
    # Check if the fix is already applied
    if grep -q "block_public_policy.*=.*false" terraform/s3.tf; then
        log "✅ S3 configuration already updated"
        return 0
    fi
    
    # Create a temporary file with the updated configuration
    local temp_file=$(mktemp)
    
    # Replace the public access block configuration
    sed '/# S3 bucket public access block/,/^}$/{
        s/block_public_policy.*=.*/  block_public_policy     = false  # Allow bucket policy for CloudFront OAC/
        s/restrict_public_buckets.*=.*/  restrict_public_buckets = false  # Allow CloudFront service principal access/
    }' terraform/s3.tf > "$temp_file"
    
    # Verify the change was made
    if grep -q "block_public_policy.*=.*false" "$temp_file"; then
        mv "$temp_file" terraform/s3.tf
        log "✅ Updated S3 public access block configuration"
    else
        rm -f "$temp_file"
        log "❌ Failed to update S3 configuration automatically"
        log "Please manually update terraform/s3.tf:"
        log "  block_public_policy     = false"
        log "  restrict_public_buckets = false"
        return 1
    fi
}

# Function to validate Terraform configuration
validate_terraform() {
    log "🔍 Validating Terraform configuration..."
    
    cd terraform
    
    if ! terraform validate; then
        log "❌ Terraform validation failed"
        cd ..
        return 1
    fi
    
    log "✅ Terraform configuration is valid"
    cd ..
}

# Function to plan Terraform changes
plan_terraform() {
    local environment="${1:-production}"
    
    log "📋 Planning Terraform changes for $environment..."
    
    cd terraform
    
    # Initialize if needed
    if [[ ! -d ".terraform" ]]; then
        log "🔄 Initializing Terraform..."
        terraform init \
            -backend-config="bucket=${TERRAFORM_STATE_BUCKET:-novacorevectra-terraform-state}" \
            -backend-config="key=$environment/terraform.tfstate" \
            -backend-config="region=${AWS_REGION:-us-east-1}" \
            -backend-config="dynamodb_table=${TERRAFORM_STATE_LOCK_TABLE:-terraform-state-lock}" \
            -backend-config="encrypt=true"
    fi
    
    # Plan changes
    local var_file="terraform.tfvars.$environment"
    if [[ -f "$var_file" ]]; then
        terraform plan -var-file="$var_file" -out="fix-access-$environment.tfplan"
    else
        log "⚠️  Variable file $var_file not found, using default variables"
        terraform plan -out="fix-access-$environment.tfplan"
    fi
    
    log "✅ Terraform plan created: fix-access-$environment.tfplan"
    cd ..
}

# Function to apply Terraform changes
apply_terraform() {
    local environment="${1:-production}"
    
    log "🚀 Applying Terraform changes for $environment..."
    
    cd terraform
    
    if [[ ! -f "fix-access-$environment.tfplan" ]]; then
        log "❌ Plan file not found. Please run plan first."
        cd ..
        return 1
    fi
    
    terraform apply "fix-access-$environment.tfplan"
    
    log "✅ Terraform changes applied successfully"
    cd ..
}

# Function to test the fix
test_fix() {
    local bucket_name="$1"
    local distribution_id="${2:-}"
    
    log "🧪 Testing the fix..."
    
    # Wait a moment for changes to propagate
    log "⏳ Waiting 30 seconds for changes to propagate..."
    sleep 30
    
    # Run diagnostic script
    if [[ -f ".github/scripts/diagnose-access-denied.sh" ]]; then
        chmod +x .github/scripts/diagnose-access-denied.sh
        ./.github/scripts/diagnose-access-denied.sh "$bucket_name" "$distribution_id"
    else
        log "⚠️  Diagnostic script not found, manual testing required"
    fi
}

# Main function
main() {
    local environment="${1:-production}"
    local action="${2:-plan}"
    local bucket_name="${3:-}"
    local distribution_id="${4:-}"
    
    log "🔧 CloudFront Access Fix Script"
    log "Environment: $environment"
    log "Action: $action"
    log ""
    
    # Check prerequisites
    check_directory
    
    # Backup current configuration
    backup_config
    
    # Update S3 configuration
    if ! update_s3_config; then
        log "❌ Failed to update S3 configuration"
        exit 1
    fi
    
    # Validate configuration
    if ! validate_terraform; then
        log "❌ Terraform validation failed"
        exit 1
    fi
    
    case "$action" in
        "plan")
            plan_terraform "$environment"
            log ""
            log "📋 Next steps:"
            log "1. Review the plan output above"
            log "2. If changes look correct, run: $0 $environment apply"
            ;;
        
        "apply")
            plan_terraform "$environment"
            apply_terraform "$environment"
            
            if [[ -n "$bucket_name" ]]; then
                test_fix "$bucket_name" "$distribution_id"
            else
                log "⚠️  Bucket name not provided, skipping automated testing"
                log "Please test manually or run the diagnostic script"
            fi
            ;;
        
        *)
            log "❌ Invalid action: $action"
            log "Usage: $0 <environment> <plan|apply> [bucket_name] [distribution_id]"
            log ""
            log "Examples:"
            log "  $0 production plan"
            log "  $0 production apply novacorevectra-production E1234567890ABC"
            exit 1
            ;;
    esac
    
    log ""
    log "✅ CloudFront access fix script completed"
}

# Run main function with all arguments
main "$@"