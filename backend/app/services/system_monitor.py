import psutil
import platform
import datetime
import shutil

def get_system_stats():
    cpu_percent = psutil.cpu_percent(interval=None)
    ram = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Temperature (Linux only usually)
    temp = 0
    try:
        temps = psutil.sensors_temperatures()
        if 'cpu_thermal' in temps:
            temp = temps['cpu_thermal'][0].current
        elif 'coretemp' in temps: # Common on some linux
             temp = temps['coretemp'][0].current
    except Exception:
        pass

    return {
        "cpu": cpu_percent,
        "ram": {
            "total": ram.total,
            "used": ram.used,
            "percent": ram.percent
        },
        "disk": {
            "total": disk.total,
            "used": disk.used,
            "percent": disk.percent
        },
        "temperature": temp,
        "timestamp": datetime.datetime.now().isoformat()
    }

def get_system_info():
    return {
        "system": platform.system(),
        "node": platform.node(),
        "release": platform.release(),
        "version": platform.version(),
        "machine": platform.machine(),
        "processor": platform.processor(),
        "boot_time": datetime.datetime.fromtimestamp(psutil.boot_time()).isoformat()
    }

def get_processes(limit=10):
    procs = []
    for p in psutil.process_iter(['pid', 'name', 'username', 'cpu_percent', 'memory_percent']):
        try:
            procs.append(p.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    
    # Sort by CPU usage
    procs.sort(key=lambda x: x['cpu_percent'], reverse=True)
    return procs[:limit]

def kill_process(pid: int):
    try:
        p = psutil.Process(pid)
        p.terminate()
        return True
    except psutil.NoSuchProcess:
        return False
