import json
import urllib3
import os
from datetime import datetime

def handler(event, context):
    """
    Lambda function to send pipeline event notifications to Slack
    """
    
    # Get environment variables
    webhook_url = os.environ.get('SLACK_WEBHOOK_URL')
    project_name = os.environ.get('PROJECT_NAME', 'NovaCore Vectra')
    environment = os.environ.get('ENVIRONMENT', 'unknown')
    
    if not webhook_url:
        print("ERROR: SLACK_WEBHOOK_URL environment variable not set")
        return {
            'statusCode': 400,
            'body': json.dumps('Slack webhook URL not configured')
        }
    
    try:
        # Parse SNS message
        sns_message = json.loads(event['Records'][0]['Sns']['Message'])
        
        # Extract pipeline event details
        event_type = sns_message.get('event_type', 'unknown')
        status = sns_message.get('status', 'unknown')
        branch = sns_message.get('branch', 'unknown')
        commit_sha = sns_message.get('commit_sha', 'unknown')
        commit_message = sns_message.get('commit_message', 'No commit message')
        author = sns_message.get('author', 'Unknown')
        workflow_url = sns_message.get('workflow_url', '')
        deployment_version = sns_message.get('deployment_version', '')
        
        # Determine color and emoji based on status
        if status.lower() in ['success', 'completed']:
            color = '#00FF00'  # Green
            emoji = '✅'
        elif status.lower() in ['failure', 'failed', 'error']:
            color = '#FF0000'  # Red
            emoji = '❌'
        elif status.lower() in ['started', 'running', 'in_progress']:
            color = '#FFA500'  # Orange
            emoji = '🔄'
        else:
            color = '#808080'  # Gray
            emoji = '❓'
        
        # Create title based on event type
        title_map = {
            'deployment_started': f"{emoji} Deployment Started",
            'deployment_completed': f"{emoji} Deployment Completed",
            'deployment_failed': f"{emoji} Deployment Failed",
            'build_started': f"{emoji} Build Started",
            'build_completed': f"{emoji} Build Completed",
            'build_failed': f"{emoji} Build Failed",
            'security_scan_completed': f"{emoji} Security Scan Completed",
            'security_scan_failed': f"{emoji} Security Scan Failed",
            'health_check_passed': f"{emoji} Health Check Passed",
            'health_check_failed': f"{emoji} Health Check Failed",
            'rollback_started': f"{emoji} Rollback Started",
            'rollback_completed': f"{emoji} Rollback Completed"
        }
        title = title_map.get(event_type, f"{emoji} Pipeline Event: {event_type}")
        
        # Build fields array
        fields = [
            {
                "title": "Environment",
                "value": environment.upper(),
                "short": True
            },
            {
                "title": "Status",
                "value": status.upper(),
                "short": True
            },
            {
                "title": "Branch",
                "value": branch,
                "short": True
            },
            {
                "title": "Commit",
                "value": f"{commit_sha[:8]}",
                "short": True
            },
            {
                "title": "Author",
                "value": author,
                "short": True
            }
        ]
        
        # Add deployment version if available
        if deployment_version:
            fields.append({
                "title": "Version",
                "value": deployment_version,
                "short": True
            })
        
        # Add commit message
        fields.append({
            "title": "Commit Message",
            "value": commit_message[:100] + ("..." if len(commit_message) > 100 else ""),
            "short": False
        })
        
        # Create Slack message
        slack_message = {
            "username": f"{project_name} CI/CD",
            "icon_emoji": ":rocket:",
            "attachments": [
                {
                    "color": color,
                    "title": title,
                    "title_link": workflow_url if workflow_url else None,
                    "fields": fields,
                    "footer": f"{project_name} Deployment Pipeline",
                    "ts": int(datetime.utcnow().timestamp())
                }
            ]
        }
        
        # Add action buttons for certain events
        if event_type in ['deployment_failed', 'build_failed', 'security_scan_failed']:
            slack_message["attachments"][0]["actions"] = [
                {
                    "type": "button",
                    "text": "View Workflow",
                    "url": workflow_url,
                    "style": "primary"
                }
            ]
        
        # Send to Slack
        http = urllib3.PoolManager()
        response = http.request(
            'POST',
            webhook_url,
            body=json.dumps(slack_message),
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status == 200:
            print(f"Successfully sent Slack notification for pipeline event: {event_type}")
            return {
                'statusCode': 200,
                'body': json.dumps('Notification sent successfully')
            }
        else:
            print(f"Failed to send Slack notification. Status: {response.status}")
            return {
                'statusCode': response.status,
                'body': json.dumps(f'Failed to send notification: {response.data}')
            }
            
    except Exception as e:
        print(f"Error processing pipeline event notification: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }