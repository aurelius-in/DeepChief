import os
import time
import requests


def main() -> None:
    api = os.getenv('API_URL', 'http://api:8080')
    while True:
        try:
            if os.getenv('FEATURE_RECONCILE', '1') == '1':
                requests.post(f'{api}/agents/auto_reconciler/run', timeout=5)
            if os.getenv('FEATURE_CONTROLS', '1') == '1':
                requests.post(f'{api}/controls/run', timeout=5)
            if os.getenv('FEATURE_FLUX', '1') == '1':
                requests.post(f'{api}/agents/flux/run', timeout=5)
            if os.getenv('FEATURE_FORECAST', '1') == '1':
                requests.post(f'{api}/agents/forecast/run', timeout=5)
        except Exception:
            pass
        time.sleep(int(os.getenv('SCHEDULER_INTERVAL_SEC', '300')))


if __name__ == '__main__':
    main()


