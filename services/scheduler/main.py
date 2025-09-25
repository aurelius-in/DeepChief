import os
import time
import requests


def main() -> None:
    api = os.getenv('API_URL', 'http://api:8080')
    while True:
        try:
            flags = {}
            try:
                fr = requests.get(f'{api}/features', timeout=3)
                if fr.ok:
                    fj = fr.json()
                    flags = fj.get('flags', fj)
            except Exception:
                flags = {}

            if str(os.getenv('FEATURE_RECONCILE', '1')) == '1' and flags.get('reconcile', True):
                requests.post(f'{api}/agents/auto_reconciler/run', timeout=5)
            if str(os.getenv('FEATURE_CONTROLS', '1')) == '1' and flags.get('controls', True):
                requests.post(f'{api}/controls/run', timeout=5)
            if str(os.getenv('FEATURE_FLUX', '1')) == '1' and flags.get('flux', True):
                requests.post(f'{api}/agents/flux/run', timeout=5)
            if str(os.getenv('FEATURE_FORECAST', '1')) == '1' and flags.get('forecast', True):
                requests.post(f'{api}/agents/forecast/run', timeout=5)
            if flags.get('dq', True):
                requests.post(f'{api}/agents/dq_sentinel/run', timeout=5)
        except Exception:
            pass
        time.sleep(int(os.getenv('SCHEDULER_INTERVAL_SEC', '300')))


if __name__ == '__main__':
    main()


