from pydantic_settings import BaseSettings, SettingsConfigDict







class Settings(BaseSettings):

    POSTGRE_DEV: str
    POSTGRE_TEST: str



    REDIS_PASSWORD:str

    REDIS_HOST:str
    REDIS_PORT:int
    API_KEY:str

 
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()




