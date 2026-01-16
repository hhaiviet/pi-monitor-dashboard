import requests
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

class N8nManager:
    def __init__(self):
        # CRITICAL: Get n8n URL from environment
        # Default to host IP, not localhost
        default_url = "http://192.168.1.99:5678"
        self.base_url = os.getenv("N8N_BASE_URL", default_url)
        self.api_key = os.getenv("N8N_API_KEY")
        
        if not self.api_key:
            print("⚠️ Warning: N8N_API_KEY not set in environment")
        
        print(f"🔗 N8N Manager initialized: {self.base_url}")
        
        self.headers = {
            "X-N8N-API-KEY": self.api_key,
            "Content-Type": "application/json"
        }
        
        # Test connection on init
        try:
            self._test_connection()
        except Exception as e:
            print(f"⚠️ Cannot connect to n8n at {self.base_url}: {e}")
    
    def _test_connection(self):
        """Test connection to n8n on startup"""
        try:
            response = requests.get(
                f"{self.base_url}/healthz",
                timeout=5
            )
            if response.status_code == 200:
                print(f"✅ n8n connection successful: {self.base_url}")
            else:
                print(f"⚠️ n8n returned status {response.status_code}")
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot reach n8n at {self.base_url}")
            print(f"   Make sure n8n is running on Pi")
        except Exception as e:
            print(f"❌ n8n connection error: {e}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get n8n instance status"""
        try:
            # Health check endpoint
            response = requests.get(
                f"{self.base_url}/healthz",
                timeout=5
            )
            
            if response.status_code == 200:
                # Get additional info
                workflows_count = self._get_workflows_count()
                active_executions = self._get_active_executions_count()
                
                return {
                    "status": "running",
                    "healthy": True,
                    "url": self.base_url,
                    "workflows_count": workflows_count,
                    "active_executions": active_executions,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "status": "unhealthy",
                    "healthy": False,
                    "error": f"Status code: {response.status_code}"
                }
                
        except requests.exceptions.ConnectionError:
            return {
                "status": "stopped",
                "healthy": False,
                "error": "Cannot connect to n8n"
            }
        except Exception as e:
            return {
                "status": "unknown",
                "healthy": False,
                "error": str(e)
            }
    
    def _get_workflows_count(self) -> int:
        """Get total number of workflows"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/workflows",
                headers=self.headers,
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                return len(data.get("data", []))
        except:
            pass
        return 0
    
    def _get_active_executions_count(self) -> int:
        """Get number of active executions"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/executions",
                headers=self.headers,
                params={"status": "running"},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                return len(data.get("data", []))
        except:
            pass
        return 0
    
    def get_workflows(self) -> List[Dict[str, Any]]:
        """List all workflows"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/workflows",
                headers=self.headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                workflows = data.get("data", [])
                
                return [{
                    "id": wf.get("id"),
                    "name": wf.get("name"),
                    "active": wf.get("active", False),
                    "createdAt": wf.get("createdAt"),
                    "updatedAt": wf.get("updatedAt"),
                    "tags": wf.get("tags", [])
                } for wf in workflows]
            
            return []
            
        except Exception as e:
            print(f"Error getting workflows: {e}")
            return []
    
    def activate_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Activate a workflow"""
        try:
            response = requests.patch(
                f"{self.base_url}/api/v1/workflows/{workflow_id}",
                headers=self.headers,
                json={"active": True},
                timeout=10
            )
            
            if response.status_code == 200:
                return {"success": True, "message": f"Workflow {workflow_id} activated"}
            else:
                return {"success": False, "error": response.text}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def deactivate_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """Deactivate a workflow"""
        try:
            response = requests.patch(
                f"{self.base_url}/api/v1/workflows/{workflow_id}",
                headers=self.headers,
                json={"active": False},
                timeout=10
            )
            
            if response.status_code == 200:
                return {"success": True, "message": f"Workflow {workflow_id} deactivated"}
            else:
                return {"success": False, "error": response.text}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_executions(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent workflow executions"""
        try:
            response = requests.get(
                f"{self.base_url}/api/v1/executions",
                headers=self.headers,
                params={"limit": limit},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                executions = data.get("data", [])
                
                return [{
                    "id": ex.get("id"),
                    "workflowId": ex.get("workflowId"),
                    "status": ex.get("status"),
                    "startedAt": ex.get("startedAt"),
                    "stoppedAt": ex.get("stoppedAt"),
                    "mode": ex.get("mode")
                } for ex in executions]
            
            return []
            
        except Exception as e:
            print(f"Error getting executions: {e}")
            return []
    
    def get_logs(self, lines: int = 100) -> List[str]:
        """Get n8n logs (from executions)"""
        try:
            executions = self.get_executions(limit=lines)
            
            logs = []
            for ex in executions:
                timestamp = ex.get("startedAt", "")
                status = ex.get("status", "unknown")
                workflow_id = ex.get("workflowId", "")
                
                log_line = f"[{timestamp}] Workflow {workflow_id}: {status}"
                logs.append(log_line)
            
            return logs
            
        except Exception as e:
            return [f"Error getting logs: {str(e)}"]

# Singleton instance
n8n_manager = N8nManager()
