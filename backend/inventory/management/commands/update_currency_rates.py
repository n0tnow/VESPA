from django.core.management.base import BaseCommand
from inventory.views import CurrencyRatesView
from rest_framework.test import APIRequestFactory


class Command(BaseCommand):
    help = 'Updates currency rates from external API and stores to database'

    def handle(self, *args, **options):
        factory = APIRequestFactory()
        request = factory.post('/api/inventory/currency/rates/')
        view = CurrencyRatesView.as_view()
        response = view(request)
        self.stdout.write(self.style.SUCCESS(f'update_currency_rates: {response.status_code} {getattr(response, "data", {})}'))


