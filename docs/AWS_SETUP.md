# AWS Setup Guide for Windows

This guide will help you set up AWS authentication for Syntera development.

## Prerequisites

1. **AWS Account** - If you don't have one, create at [aws.amazon.com](https://aws.amazon.com)
2. **AWS CLI** - Install from [AWS CLI Downloads](https://awscli.amazonaws.com/AWSCLIV2.msi)

## Step 1: Install AWS CLI

### Option A: Direct Download (Recommended)
1. Download: [AWSCLIV2.msi](https://awscli.amazonaws.com/AWSCLIV2.msi)
2. Run the installer
3. Follow the installation wizard
4. Restart PowerShell/Command Prompt

### Option B: Using Chocolatey
```powershell
choco install awscli
```

### Verify Installation
```powershell
aws --version
```
Should show: `aws-cli/2.x.x`

## Step 2: Get AWS Credentials

You need an **Access Key ID** and **Secret Access Key** from AWS.

### Option A: Create IAM User (Recommended for Development)

1. **Login to AWS Console**
   - Go to [console.aws.amazon.com](https://console.aws.amazon.com)
   - Sign in with your AWS account

2. **Create IAM User**
   - Go to **IAM** → **Users** → **Create user**
   - Username: `syntera-dev` (or your choice)
   - Click **Next**

3. **Set Permissions**
   - Select **Attach policies directly**
   - Add these policies:
     - `AdministratorAccess` (for development - use more restrictive in production)
     - Or create custom policy with required permissions:
       - EC2, ECS, VPC, DocumentDB, ElastiCache, MQ, S3, CloudWatch

4. **Create Access Key**
   - After user is created, go to **Security credentials** tab
   - Click **Create access key**
   - Select **Command Line Interface (CLI)**
   - Click **Next** → **Create access key**
   - **⚠️ IMPORTANT:** Copy both:
     - **Access key ID**
     - **Secret access key** (only shown once!)

### Option B: Use Root Account (Not Recommended)
- Go to **My Security Credentials**
- Create access key
- **Warning:** Root keys have full account access - use IAM user instead

## Step 3: Configure AWS CLI

### Interactive Configuration
```powershell
aws configure
```

You'll be prompted for:
1. **AWS Access Key ID**: `AKIAIOSFODNN7EXAMPLE`
2. **AWS Secret Access Key**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
3. **Default region name**: `us-east-1` (or your preferred region)
4. **Default output format**: `json`

### Manual Configuration

Edit the credentials file directly:

```powershell
# Open credentials file
notepad $env:USERPROFILE\.aws\credentials
```

Add:
```ini
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
```

Edit config file:
```powershell
# Open config file
notepad $env:USERPROFILE\.aws\config
```

Add:
```ini
[default]
region = us-east-1
output = json
```

## Step 4: Verify Authentication

Test your AWS connection:

```powershell
# Check your identity
aws sts get-caller-identity
```

Should return:
```json
{
    "UserId": "AIDA...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/syntera-dev"
}
```

### Test S3 Access
```powershell
# List S3 buckets (should work even if empty)
aws s3 ls
```

### Test Region
```powershell
# List EC2 regions
aws ec2 describe-regions --output table
```

## Step 5: Set Up Multiple Profiles (Optional)

If you need multiple AWS accounts:

```powershell
# Configure a profile
aws configure --profile syntera-prod

# Use a profile
aws s3 ls --profile syntera-prod

# Set as default
$env:AWS_PROFILE = "syntera-prod"
```

## Troubleshooting

### "Unable to locate credentials"
- Check credentials file exists: `$env:USERPROFILE\.aws\credentials`
- Verify keys are correct (no extra spaces)
- Re-run `aws configure`

### "Access Denied"
- Check IAM user has correct permissions
- Verify access key is active
- Check region is correct

### "InvalidClientTokenId"
- Access key ID is incorrect
- Re-create access key in AWS Console

### "SignatureDoesNotMatch"
- Secret access key is incorrect
- Re-create access key in AWS Console

## Security Best Practices

1. **Never commit credentials**
   - Already in `.gitignore`
   - Use environment variables for CI/CD

2. **Use IAM users, not root**
   - Root keys have full account access
   - IAM users can have limited permissions

3. **Rotate keys regularly**
   - Create new keys every 90 days
   - Delete old keys after verifying new ones work

4. **Use least privilege**
   - Don't use `AdministratorAccess` in production
   - Create custom policies with only needed permissions

5. **Enable MFA**
   - Add MFA to your AWS account
   - Use MFA for sensitive operations

## Next Steps

Once AWS is configured:

1. **Run infrastructure setup:**
   ```powershell
   .\scripts\setup-infra.ps1
   ```

2. **Deploy infrastructure:**
   ```powershell
   cd terraform
   terraform plan
   terraform apply
   ```

3. **Verify resources:**
   ```powershell
   terraform output
   ```

## Quick Reference

```powershell
# Check current identity
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# List EC2 instances
aws ec2 describe-instances

# View current region
aws configure get region

# Change region
aws configure set region us-west-2

# View current profile
aws configure list
```

