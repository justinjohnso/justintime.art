# Nginx Configuration Guide

Comprehensive guide for configuring Nginx to serve your Portfolio V3 site.

## 📋 Basic Configuration

The default configuration is created by `setup-droplet.sh` at:
```
/etc/nginx/sites-available/portfolio
```

### Basic Static Site

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/portfolio;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Custom 404 page
    error_page 404 /404.html;
}
```

## 🔒 SSL Configuration (HTTPS)

After running Certbot, your config will look like:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /var/www/portfolio;
    index index.html;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rest of configuration...
}
```

## 🔄 API Routes & Proxying

If you add API endpoints or SSR functionality:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # ... SSL config ...

    root /var/www/portfolio;
    index index.html;

    # API routes proxy to Node.js server
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files served directly
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📊 Analytics Proxy (Umami)

To serve Umami through your domain:

```nginx
# In your main server block
location /analytics/ {
    proxy_pass http://localhost:3000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Then update your Umami script URL:
```
PUBLIC_UMAMI_SRC=https://yourdomain.com/analytics/script.js
```

## 🎯 Advanced Configurations

### Rate Limiting

Protect API endpoints from abuse:

```nginx
# Add to http block (usually /etc/nginx/nginx.conf)
http {
    # ... other config ...
    
    # Define rate limit zones
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=100r/m;
}

# In server block
server {
    # ... other config ...

    # Apply to API routes
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://localhost:3000;
        # ... other proxy settings ...
    }
}
```

### IP Whitelisting for Admin Routes

```nginx
location /admin {
    # Allow specific IPs
    allow 203.0.113.0/24;  # Your office network
    allow 198.51.100.1;     # Your home IP
    deny all;

    try_files $uri $uri/ /index.html;
}
```

### Custom Error Pages

```nginx
server {
    # ... other config ...

    # Custom error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /404.html {
        internal;
    }
    
    location = /50x.html {
        internal;
    }
}
```

### Redirect www to non-www (or vice versa)

```nginx
# Redirect www to non-www
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    return 301 https://yourdomain.com$request_uri;
}

# Or redirect non-www to www
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    return 301 https://www.yourdomain.com$request_uri;
}
```

## 🚀 Performance Optimization

### HTTP/2 Server Push

```nginx
server {
    listen 443 ssl http2;
    
    location = /index.html {
        http2_push /styles/global.css;
        http2_push /scripts/main.js;
    }
}
```

### Microcaching for Dynamic Content

```nginx
# Add to http block
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=microcache:10m max_size=100m inactive=1h;

# In server block
location /api/posts {
    proxy_cache microcache;
    proxy_cache_valid 200 1m;  # Cache successful responses for 1 minute
    proxy_cache_use_stale error timeout updating;
    
    add_header X-Cache-Status $upstream_cache_status;
    
    proxy_pass http://localhost:3000;
}
```

### Brotli Compression (Better than Gzip)

```bash
# Install Brotli module
sudo apt install nginx-module-brotli
```

```nginx
# Add to nginx.conf
load_module modules/ngx_http_brotli_filter_module.so;
load_module modules/ngx_http_brotli_static_module.so;

http {
    # Enable Brotli
    brotli on;
    brotli_comp_level 6;
    brotli_types text/plain text/css text/xml text/javascript 
                 application/javascript application/xml+rss application/json;
}
```

## 🔧 Testing & Validation

### Test Configuration

```bash
# Test for syntax errors
sudo nginx -t

# Test and show configuration
sudo nginx -T
```

### Reload Without Downtime

```bash
# Reload configuration
sudo systemctl reload nginx

# Or
sudo nginx -s reload
```

### Restart Nginx

```bash
sudo systemctl restart nginx
```

## 📊 Monitoring & Logs

### View Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Specific site logs (if configured)
sudo tail -f /var/log/nginx/portfolio-access.log
```

### Log Format Examples

```nginx
# Custom log format
log_format custom '$remote_addr - $remote_user [$time_local] '
                  '"$request" $status $body_bytes_sent '
                  '"$http_referer" "$http_user_agent" '
                  'rt=$request_time uct="$upstream_connect_time" '
                  'uht="$upstream_header_time" urt="$upstream_response_time"';

access_log /var/log/nginx/portfolio-access.log custom;
```

## 🚨 Troubleshooting

### 502 Bad Gateway

**Causes:**
- Upstream server (Node.js) not running
- Wrong port in proxy_pass
- Firewall blocking connection

**Check:**
```bash
# Is the Node app running?
netstat -tlnp | grep 3000

# Test direct connection
curl http://localhost:3000

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log
```

### 403 Forbidden

**Causes:**
- File permissions wrong
- Directory index disabled
- SELinux blocking (if enabled)

**Fix:**
```bash
# Check file permissions
ls -la /var/www/portfolio

# Fix ownership
sudo chown -R www-data:www-data /var/www/portfolio

# Fix permissions
sudo chmod -R 755 /var/www/portfolio
```

### Configuration Won't Reload

```bash
# Check for syntax errors
sudo nginx -t

# Force restart
sudo systemctl restart nginx

# Check if Nginx is running
sudo systemctl status nginx
```

## 📚 Additional Resources

- [Nginx Official Documentation](https://nginx.org/en/docs/)
- [Nginx Optimization Guide](https://www.nginx.com/blog/tuning-nginx/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [HTTP/2 Push Testing](https://www.nghttp2.org/)

## 💡 Best Practices

1. **Always test before reload**: `sudo nginx -t`
2. **Use reload over restart**: Avoids downtime
3. **Enable access logs**: Essential for debugging
4. **Set proper cache headers**: Improve performance
5. **Use HTTP/2**: Better performance than HTTP/1.1
6. **Enable compression**: Gzip or Brotli
7. **Add security headers**: Protect against common attacks
8. **Use SSL/TLS**: Always use HTTPS in production
9. **Monitor logs regularly**: Catch issues early
10. **Keep Nginx updated**: Security and performance improvements
