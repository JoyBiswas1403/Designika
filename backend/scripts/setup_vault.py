import hvac
import os

# Connect to Vault (using Root Token for Setup)
# In Prod, this would be a CI/CD job with a specific policy
client = hvac.Client(
    url='http://localhost:8200',
    token='root'
)

print(f"Connecting to Vault... Authenticated: {client.is_authenticated()}")

# Define Secrets to Seed
secrets = {
    "app": {
        "secret_key": "enterprise_secret_key_change_me_in_prod"
    },
    "ai": {
        "openai_key": "sk-placeholder-openai-key",
        "replicate_token": "r8-placeholder-replicate-token"
    },
    "db": {
        "postgres_url": "postgresql://designika_admin:designika_password@postgres:5432/designika_db",
        "mongo_url": "mongodb://mongo:27017",
        "redis_url": "redis://redis:6379",
        "milvus_uri": "http://milvus:19530",
        "neo4j_uri": "bolt://neo4j:7687",
        "neo4j_password": "designika_graph"
    }
}

# Inject Secrets
# Using KV Engine v2 (mount point 'secret')
for category, data in secrets.items():
    try:
        path = category 
        # Check if exists to avoid overwrite? No, "Setup" implies enforcement.
        client.secrets.kv.v2.create_or_update_secret(
            mount_point='secret',
            path=path,
            secret=data
        )
        print(f"✅ Injecetd secret: secret/{path}")
    except Exception as e:
        print(f"❌ Failed to inject {category}: {e}")

print("Vault Setup Complete.")
