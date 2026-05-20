from pydantic_settings import BaseSettings, SettingsConfigDict







class Settings(BaseSettings):

    POSTGRE_DEV: str
    POSTGRE_TEST: str



    REDIS_PASSWORD:str

    REDIS_HOST:str
    REDIS_PORT:int
    API_KEY:str

    @property
    def CELERY_BROKER_URL(self):
        return (
            f"amqp://{self.RABBITMQ_USER}:{self.RABBITMQ_PASS}"
            f"@{self.RABBITMQ_HOST}:{self.RABBITMQ_PORT}//"
        )

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()




