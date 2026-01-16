from sqlalchemy import create_engine, Column, Integer, Float, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import os

Base = declarative_base()

class SystemMetric(Base):
    __tablename__ = 'system_metrics'
    
    id = Column(Integer, primary_key=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    cpu_percent = Column(Float)
    memory_percent = Column(Float)
    disk_percent = Column(Float)
    temperature = Column(Float)

class HistoryManager:
    def __init__(self):
        db_path = os.getenv("DATABASE_PATH", "./data/monitor.db")
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        self.engine = create_engine(f'sqlite:///{db_path}')
        Base.metadata.create_all(self.engine)
        
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
    
    def store_metrics(self, cpu: float, memory: float, disk: float, temp: float):
        """Store current metrics"""
        metric = SystemMetric(
            cpu_percent=cpu,
            memory_percent=memory,
            disk_percent=disk,
            temperature=temp
        )
        self.session.add(metric)
        self.session.commit()
    
    def get_history(self, hours: int = 24) -> list:
        """Get historical data for last N hours"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        
        metrics = self.session.query(SystemMetric).filter(
            SystemMetric.timestamp >= cutoff
        ).order_by(SystemMetric.timestamp).all()
        
        return [{
            "timestamp": m.timestamp.isoformat(),
            "cpu": m.cpu_percent,
            "memory": m.memory_percent,
            "disk": m.disk_percent,
            "temperature": m.temperature
        } for m in metrics]
    
    def cleanup_old_data(self, days: int = 7):
        """Delete data older than N days"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        self.session.query(SystemMetric).filter(
            SystemMetric.timestamp < cutoff
        ).delete()
        
        self.session.commit()

history_manager = HistoryManager()
