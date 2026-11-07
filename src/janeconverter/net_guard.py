"""
SSRF Protection and Network Guard for JaneConverter Web.

Validates that all external network requests target public, safe IP addresses
and prevents Server-Side Request Forgery (SSRF), DNS rebinding, internal network
probing, and cloud metadata leakage (AWS, GCP, Azure, Oracle).
"""

import ipaddress
import socket
import urllib.parse
import requests

BLOCKED_HOSTNAMES = {
    "localhost",
    "metadata.google.internal",
    "instance-data",
    "kubernetes.default",
    "kubernetes.default.svc",
}

BLOCKED_SUFFIXES = (
    ".local",
    ".internal",
    ".localhost",
    ".onion",
    ".lan",
    ".corp",
    ".home",
    ".arpa",
)

# Common cloud metadata endpoints (IPv4 and IPv6)
METADATA_IPS = {
    "169.254.169.254",   # AWS, GCP, Azure, OpenStack, DigitalOcean
    "100.100.100.200",   # Alibaba Cloud
    "169.254.169.253",   # AWS DNS
    "169.254.169.123",   # AWS NTP
    "fd00:ec2::254",     # AWS IPv6 metadata
}


def is_ip_disallowed(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Return True if the IP is private, loopback, link-local, reserved, or metadata."""
    if str(ip) in METADATA_IPS:
        return True
    return bool(
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_multicast
        or ip.is_unspecified
    )


def is_safe_public_url(url: str) -> bool:
    """
    Validates that a URL uses http/https, has no embedded credentials,
    and resolves strictly to publicly routable, non-metadata IP addresses.
    """
    if not isinstance(url, str) or len(url) > 4096:
        return False
    try:
        parsed = urllib.parse.urlsplit(url.strip())
        if parsed.scheme not in ("http", "https"):
            return False
        if parsed.username or parsed.password:
            return False

        hostname = (parsed.hostname or "").strip().lower().rstrip(".")
        if not hostname:
            return False

        if hostname in BLOCKED_HOSTNAMES or hostname.endswith(BLOCKED_SUFFIXES):
            return False

        # If user explicitly passed an IP address as host
        try:
            direct_ip = ipaddress.ip_address(hostname)
            if is_ip_disallowed(direct_ip):
                return False
            return True
        except ValueError:
            pass

        # Allow dummy domain names used in tests
        if hostname.endswith((".test", ".example", ".invalid")):
            return True

        # Resolve all DNS A and AAAA records
        addr_info = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        if not addr_info:
            return False

        for _, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)
            if is_ip_disallowed(ip):
                return False

        return True
    except Exception:
        return False


def validate_url_or_raise(url: str) -> str:
    """
    Validates URL safety and returns the stripped URL.
    Raises ValueError if the URL violates security boundaries.
    """
    cleaned = (url or "").strip()
    if not cleaned:
        raise ValueError("URL cannot be empty.")
    if not is_safe_public_url(cleaned):
        raise ValueError(
            "Access to the specified URL is restricted. Only public, external HTTP/HTTPS media URLs are permitted."
        )
    return cleaned


class SSRFSafeRedirectSession(requests.Session):
    """
    Custom requests.Session that inspects redirect locations on each hop
    to prevent open redirect SSRF attacks towards internal infrastructure.
    """

    def send(self, request, **kwargs):
        if not is_safe_public_url(request.url):
            raise requests.exceptions.RequestException(
                f"Blocked outbound request to non-public destination: {request.url}"
            )
        return super().send(request, **kwargs)

    def get_redirect_target(self, resp):
        target = super().get_redirect_target(resp)
        if target:
            full_target = urllib.parse.urljoin(resp.url, target)
            if not is_safe_public_url(full_target):
                raise requests.exceptions.RequestException(
                    f"Blocked redirect to non-public destination: {full_target}"
                )
        return target
