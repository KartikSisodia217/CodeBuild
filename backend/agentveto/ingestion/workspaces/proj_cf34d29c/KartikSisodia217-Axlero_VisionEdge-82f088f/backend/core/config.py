from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "VisionEdge"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"

    DATABASE_URL: str
    DEBUG: bool = True
    SECRET_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()