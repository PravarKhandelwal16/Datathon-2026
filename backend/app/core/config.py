import os

class Settings:
    PROJECT_NAME: str = "Crime Intelligence & Analytical Platform"
    
    MYSQL_USER: str = os.getenv("MYSQL_USER", "")
    MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
    MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
    MYSQL_PORT: str = os.getenv("MYSQL_PORT", "3306")
    MYSQL_DB: str = os.getenv("MYSQL_DB", "")
    
    @property
    def DATABASE_URL(self) -> str:
        if self.MYSQL_USER and self.MYSQL_HOST and self.MYSQL_DB:
            return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        # Fallback to local sqlite
        return "sqlite:///./ciap.db"

settings = Settings()
