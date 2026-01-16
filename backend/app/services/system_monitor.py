import psutil
import platform
from datetime import datetime
from typing import Dict, Any, List

class SystemMonitor:
    def get_stats(self) -> Dict[str, Any]:
        """Get current system statistics"""
        cpu_percent = psutil.cpu_percent(interval=None)
        ram = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Temperature
        temp = 0
        try:
            temps = psutil.sensors_temperatures()
            if 'cpu_thermal' in temps:
                temp = temps['cpu_thermal'][0].current
            elif 'coretemp' in temps:
                temp = temps['coretemp'][0].current
            # Raspberry Pi specific
            elif 'thermal_zone0' in temps:
                temp = temps['thermal_zone0'][0].current
        except Exception:
            pass

        return {
            "cpu": {
                "percent": cpu_percent,
                "count": psutil.cpu_count()
            },
            "memory": {
                "total": ram.total,
                "used": ram.used,
                "free": ram.free,
                "percent": ram.percent
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent
            },
            "temperature": temp,
            "timestamp": datetime.now().isoformat()
        }

    def get_system_info(self) -> Dict[str, Any]:
        """Get static system information"""
        try:
            boot_time = datetime.fromtimestamp(psutil.boot_time()).isoformat()
        except:
            boot_time = "Unknown"
            
        return {
            "system": platform.system(),
            "node": platform.node(),
            "release": platform.release(),
            "version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "boot_time": boot_time
        }
    
    def get_processes(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get list of running processes"""
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent', 'status']):
            try:
                pinfo = proc.info
                processes.append({
                    "pid": pinfo['pid'],
                    "name": pinfo['name'],
                    "user": pinfo['username'],
                    "cpu_percent": round(pinfo['cpu_percent'] or 0, 1),
                    "memory_percent": round(pinfo['memory_percent'] or 0, 1),
                    "status": pinfo['status']
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # Sort by CPU usage
        processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
        return processes[:limit]

    def kill_process(self, pid: int) -> bool:
        """Kill a process by PID"""
        try:
            p = psutil.Process(pid)
            p.terminate()
            return True
        except psutil.NoSuchProcess:
            return False
        except Exception:
            return False

# Initialize singleton
system_monitor = SystemMonitor()
