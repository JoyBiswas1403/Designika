import os
import hvac
from dotenv import load_dotenv

# Load local env for Dev (or rely on Container env vars in Prod)
load_dotenv()

class VaultClient:
    def __init__(self):
        self.vault_url = os.getenv("VAULT_ADDR", "http://localhost:8200")
        self.token = os.getenv("VAULT_TOKEN", "root") # Default dev token
        self.mount_point = "secret"
        
        try:
            self.client = hvac.Client(url=self.vault_url, token=self.token)
            if not self.client.is_authenticated():
                print("⚠️  Warning: Vault Authentication Failed.")
        except Exception as e:
            print(f"❌ Vault Connection Error: {e}")
            self.client = None

    def get_secret(self, path: str, key: str = None):
        """
        Retrieve a secret from Vault.
        path: Path to secret (e.g., 'myapp/config')
        key: Specific key to return (e.g., 'database_url'). If None, returns full dict.
        """
        if not self.client:
            return None

        try:
            read_response = self.client.secrets.kv.v2.read_secret_version(
                mount_point=self.mount_point,
                path=path
            )
            data = read_response['data']['data']
            
            if key:
                return data.get(key)
            return data
            
        except hvac.exceptions.InvalidPath:
            print(f"⚠️  Secret path not found: {path}")
            return None
        except Exception as e:
            print(f"❌ Error reading secret {path}: {e}")
            return None

# Global Instance
vault = VaultClient()
