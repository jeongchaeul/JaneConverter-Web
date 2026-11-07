"""
Automated Hugging Face Spaces Deployment Script for JaneConverter Web Lite.

Usage:
    uv run python packaging/deploy_hf_space.py --space-name janeconverter-web --token YOUR_HF_TOKEN
"""

import os
import sys
import argparse
from huggingface_hub import HfApi, create_repo, upload_folder


def deploy_to_huggingface(space_name: str, token: str, private: bool = False):
    api = HfApi(token=token)
    user_info = api.whoami()
    username = user_info["name"]
    repo_id = f"{username}/{space_name}"

    print(f"[*] Authenticated as Hugging Face user: {username}")
    print(f"[*] Target Space: {repo_id}")

    # 1. Ensure the Space exists (or create it with Docker SDK)
    try:
        create_repo(
            repo_id=repo_id,
            repo_type="space",
            space_sdk="docker",
            private=private,
            token=token,
            exist_ok=True,
        )
        print(f"[+] Space repository verified: https://huggingface.co/spaces/{repo_id}")
    except Exception as e:
        print(f"[!] Note on repo creation: {e}")

    # 2. Upload repository files
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    print(f"[*] Uploading deployment bundle from: {root_dir}")

    # Ignore unnecessary local virtualenvs, git files, and temporary caches
    ignore_patterns = [
        ".venv/**",
        ".git/**",
        "**/.pytest_cache/**",
        "**/__pycache__/**",
        "temp/**",
        "temp_web_jobs/**",
        "desktop-ui/node_modules/**",
        "ytdlp_cache/**",
    ]

    upload_folder(
        folder_path=root_dir,
        repo_id=repo_id,
        repo_type="space",
        token=token,
        ignore_patterns=ignore_patterns,
        commit_message="Deploy JaneConverter Web Lite container",
    )

    space_url = f"https://huggingface.co/spaces/{repo_id}"
    api_endpoint = f"https://{username}-{space_name}.hf.space"
    print("\n=======================================================")
    print("🎉 Deployment successfully initiated!")
    print(f"Space URL:       {space_url}")
    print(f"Direct API Host: {api_endpoint}")
    print("=======================================================")
    print("\nNext step for Cloudflare Pages:")
    print("Update desktop-ui/public/_redirects with:")
    print(f"/api/*  {api_endpoint}/api/:splat  200\n")


def main():
    parser = argparse.ArgumentParser(description="Deploy JaneConverter Web Lite to Hugging Face Spaces")
    parser.add_argument("--space-name", default="janeconverter-web", help="Name of the space on Hugging Face")
    parser.add_argument("--token", default=os.getenv("HF_TOKEN"), help="Hugging Face User Access Token (Write permissions)")
    parser.add_argument("--private", action="store_true", help="Make Space private")
    args = parser.parse_args()

    token = args.token
    if not token:
        print("[!] No Hugging Face token provided.")
        print("    Get your free Write token at: https://huggingface.co/settings/tokens")
        token = input("Enter your Hugging Face Access Token: ").strip()

    if not token:
        print("[-] Error: Token cannot be empty. Aborting.")
        sys.exit(1)

    deploy_to_huggingface(args.space_name, token, args.private)


if __name__ == "__main__":
    main()
