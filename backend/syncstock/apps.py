from django.apps import AppConfig


class SyncstockConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'syncstock'
    
    def ready(self):
        import syncstock.signals

