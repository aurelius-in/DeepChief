import base64
from nacl import signing


def main() -> None:
    sk = signing.SigningKey.generate()
    pk = sk.verify_key
    sk_b64 = base64.b64encode(bytes(sk)).decode("ascii")
    pk_b64 = base64.b64encode(bytes(pk)).decode("ascii")

    print("RECEIPT_SIGNING_PRIVATE_KEY=" + sk_b64)
    print("RECEIPT_SIGNING_PUBLIC_KEY=" + pk_b64)


if __name__ == "__main__":
    main()


