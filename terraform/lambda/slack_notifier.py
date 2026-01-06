import json
import urllib3
import os
from datetime import datetime

def handler(event, context):
    """
    Lambda function to send CloudWatch alarm notifications to Slack
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
        
        # Extract alarm details
        alarm_name = sns_message.get('AlarmName', 'Unknown Alarm')
        alarm_description = sns_message.get('AlarmDescription', 'No description')
        new_state = sns_message.get('NewStateValue', 'UNKNOWN')
        old_state = sns_message.get('OldStateValue', 'UNKNOWN')
        reason = sns_message.get('NewStateReason', 'No reason provided')
        timestamp = sns_message.get('StateChangeTime', datetime.utcnow().isoformat())
        
        # Determine color based on alarm state
        color_map = {
            'ALARM': '#FF0000',      # Red
            'OK': '#00FF00',         # Green
            'INSUFFICIENT_DATA': '#FFA500'  # Orange
        }
        color = color_map.get(new_state, '#808080')  # Default gray
        
        # Determine emoji based on alarm state
        emoji_map = {
            'ALARM': '🚨',
            'OK': '✅',
            'INSUFFICIENT_DATA': '⚠️'
        }
        emoji = emoji_map.get(new_state, '❓')
        
        # Create Slack message
        slack_message = {
            "username": f"{project_name} Monitoring",
            "icon_emoji": ":warning:",
            "attachments": [
                {
                    "color": color,
                    "title": f"{emoji} CloudWatch Alarm: {alarm_name}",
                    "fields": [
                        {
                            "title": "Environment",
                            "value": environment.upper(),
                            "short": True
                        },
                        {
                            "title": "State Change",
                            "value": f"{old_state} → {new_state}",
                            "short": True
                        },
                        {
                            "title": "Description",
                            "value": alarm_description,
                            "short": False
                        },
                        {
                            "title": "Reason",
                            "value": reason,
                            "short": False
                        },
                        {
                            "title": "Timestamp",
                            "value": timestamp,
                            "short": True
                        }
                    ],
                    "footer": f"{project_name} AWS Infrastructure",
                    "ts": int(datetime.utcnow().timestamp())
                }
            ]
        }
        
        # Send to Slack
        http = urllib3.PoolManager()
        response = http.request(
            'POST',
            webhook_url,
            body=json.dumps(slack_message),
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status == 200:
            print(f"Successfully sent Slack notification for alarm: {alarm_name}")
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
        print(f"Error processing CloudWatch alarm notification: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }