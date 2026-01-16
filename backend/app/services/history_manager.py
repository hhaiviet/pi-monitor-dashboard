from sqlalchemy import create_engine, Column, Integer, Float, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime, timedelta
import os

Base = declarative_base()

class SystemMetric(Base):
    __tablename__ = 'system_metrics'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    cpu_percent = Column(Float, nullable=False)
    memory_percent = Column(Float, nullable=False)
    disk_percent = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)

class HistoryManager:
    def __init__(self):
        # Ensure data directory exists
        # We need to make sure we are writing to /app/data inside docker
        self.data_dir = os.environ.get('DATABASE_PATH', '/app/data')
        # If DATABASE_PATH is full path to file, get dir
        if self.data_dir.endswith('.db'):
             db_path = self.data_dir
             self.data_dir = os.path.dirname(db_path)
        else:
             db_path = os.path.join(self.data_dir, 'monitor.db')

        os.makedirs(self.data_dir, exist_ok=True)
        
        print(f"📊 Database path: {db_path}")
        
        self.engine = create_engine(
            f'sqlite:///{db_path}',
            connect_args={"check_same_thread": False}, # Needed for SQLite + FastAPI
            echo=False
        )
        
        # Create tables
        try:
            Base.metadata.create_all(self.engine)
            print(f"✅ Database tables created/verified")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
        
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
    
    def store_metrics(self, cpu: float, memory: float, disk: float, temperature: float):
        """Store current metrics. Named 'temperature' to match system.py and main.py calls."""
        try:
            metric = SystemMetric(
                cpu_percent=round(cpu, 2),
                memory_percent=round(memory, 2),
                disk_percent=round(disk, 2),
                temperature=round(temperature, 2)
            )
            self.session.add(metric)
            self.session.commit()
            return True
        except Exception as e:
            print(f"❌ Error storing metrics: {e}")
            self.session.rollback()
            return False
    
    def get_history(self, hours: int = 24) -> list:
        """Get historical data for last N hours"""
        try:
            cutoff = datetime.utcnow() - timedelta(hours=hours)
            
            # Using new session for query to avoid stale state
            metrics = self.session.query(SystemMetric).filter(
                SystemMetric.timestamp >= cutoff
            ).order_by(SystemMetric.timestamp).all()
            
            result = [{
                "timestamp": m.timestamp.isoformat(),
                "cpu": m.cpu_percent,
                "memory": m.memory_percent,
                "disk": m.disk_percent,
                "temperature": m.temperature
            } for m in metrics]
            
            return result
        except Exception as e:
            print(f"❌ Error getting history: {e}")
            return []
    
    def get_latest(self, limit: int = 1):
        """Get latest N records"""
        try:
            metrics = self.session.query(SystemMetric).order_by(
                SystemMetric.timestamp.desc()
            ).limit(limit).all()
            
            return [{
                "timestamp": m.timestamp.isoformat(),
                "cpu": m.cpu_percent,
                "memory": m.memory_percent,
                "disk": m.disk_percent,
                "temperature": m.temperature
            } for m in metrics]
        except Exception as e:
            print(f"❌ Error getting latest: {e}")
            return []

# Singleton
history_manager = HistoryManager()
