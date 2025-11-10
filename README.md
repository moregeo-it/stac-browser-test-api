# STAC Browser Test API

A simple Node.js Express server implementing a STAC (SpatioTemporal Asset Catalog) API for testing authentication mechanisms in STAC Browser.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure authentication**:
  
  Modify `.env` as needed

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Test the API:**
   Visit `http://localhost:3000` in your browser or use curl:
   ```bash
   curl http://localhost:3000/
   ```

## API Endpoints

The server implements the following STAC API endpoints:

### Core Endpoints
- `GET /` - Root catalog with API information
- `GET /conformance` - API conformance classes  
- `GET /collections` - List of available collections
- `GET /collections/{itemID}` - Specific collection details

## Authentication Methods

Configure authentication by setting the `AUTH_METHOD` environment variable:

### HTTP Basic Authentication
```env
AUTH_METHOD=basic
BASIC_AUTH_USERNAME=testuser
BASIC_AUTH_PASSWORD=testpass
```

**Usage:**
```bash
curl -u testuser:testpass http://localhost:3000/collections
```

**STAC Browser configuration for `authConfig`:**
```js
{
  type: 'http',
  scheme: 'basic'
}
```

### API Key Authentication
```env
AUTH_METHOD=apikey
API_KEY=test-api-key-12345
```

**Usage with header:**
```bash
curl -H "x-api-key: test-api-key-12345" http://localhost:3000/collections
```

**Usage with query parameter:**
```bash
curl "http://localhost:3000/collections?api_key=test-api-key-12345"
```

**STAC Browser configuration for `authConfig`:**
```js
{
  type: 'apiKey',
  in: 'query',
  name: 'api_key'
}
```

### No Authentication
```env
AUTH_METHOD=none
```

## Configuration

All configuration is handled via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `AUTH_METHOD` | Authentication method (`basic`, `apikey`, `none`) | `basic` |
| `BASIC_AUTH_USERNAME` | Username for basic auth | `testuser` |
| `BASIC_AUTH_PASSWORD` | Password for basic auth | `testpass` |
| `API_KEY` | API key for key-based auth | `test-api-key-12345` |
