import psutil
import os
import signal
from typing import List, Dict, Any, Optional

class ProcessManager:
    
    def get_processes(self, sort_by: str = "cpu", limit: int = 50) -> List[Dict[str, Any]]:
        """Get list of running processes"""
        processes = []
        
        for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent', 'status']):
            try:
                pinfo = proc.info
                processes.append({
                    "pid": pinfo['pid'],
                    "name": pinfo['name'],
                    "user": pinfo['username'],
                    "cpu_percent": round(pinfo['cpu_percent'], 1),
                    "memory_percent": round(pinfo['memory_percent'], 1),
                    "status": pinfo['status']
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # Sort
        reverse = True
        if sort_by == "cpu":
            processes.sort(key=lambda x: x['cpu_percent'], reverse=reverse)
        elif sort_by == "memory":
            processes.sort(key=lambda x: x['memory_percent'], reverse=reverse)
        elif sort_by == "name":
            processes.sort(key=lambda x: x['name'].lower())
            
        return processes[:limit]
    
    def kill_process(self, pid: int, force: bool = False) -> Dict[str, Any]:
        """Kill a process by PID"""
        try:
            proc = psutil.Process(pid)
            proc_name = proc.name()
            
            if force:
                proc.kill()  # SIGKILL
            else:
                proc.terminate()  # SIGTERM
            
            return {
                "success": True,
                "message": f"Process {proc_name} (PID: {pid}) terminated"
            }
            
        except psutil.NoSuchProcess:
            return {
                "success": False,
                "error": f"Process {pid} not found"
            }
        except psutil.AccessDenied:
            return {
                "success": False,
                "error": f"Access denied to kill process {pid}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

process_manager = ProcessManager()
