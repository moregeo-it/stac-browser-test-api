const express = require('express');
const basicAuth = require('basic-auth');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const AUTH_METHOD = process.env.AUTH_METHOD || 'basic'; // 'basic', 'apikey', or 'none'
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME || 'testuser';
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'testpass';
const API_KEY = process.env.API_KEY || 'test-api-key-12345';

// Middleware
app.use(express.json());

// CORS middleware - MUST be applied BEFORE authentication
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization', 'x-api-key'],
  credentials: true
}));

// Authentication middleware
function authenticate(req, res, next) {
  if (AUTH_METHOD === 'none') {
    return next();
  }

  if (AUTH_METHOD === 'basic') {
    const user = basicAuth(req);
    
    if (!user || user.name !== BASIC_AUTH_USERNAME || user.pass !== BASIC_AUTH_PASSWORD) {
      res.set('WWW-Authenticate', 'Basic realm="STAC API"');
      return res.status(401).json({
        code: 'Unauthorized',
        description: 'Access denied. Valid credentials required.'
      });
    }
  }

  if (AUTH_METHOD === 'apikey') {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey || apiKey !== API_KEY) {
      return res.status(401).json({
        code: 'Unauthorized',
        description: 'Access denied. Valid API key required.'
      });
    }
  }

  next();
}

// Apply authentication to all routes
app.use(authenticate);

// Sample STAC data
const rootCatalog = {
  type: 'Catalog',
  stac_version: '1.0.0',
  id: 'test-catalog',
  title: 'Test STAC Catalog',
  description: 'A simple test catalog for STAC Browser authentication testing',
  links: [
    {
      rel: 'root',
      href: `http://localhost:${PORT}/`,
      type: 'application/json'
    },
    {
      rel: 'conformance',
      href: `http://localhost:${PORT}/conformance`,
      type: 'application/json'
    },
    {
      rel: 'data',
      href: `http://localhost:${PORT}/collections`,
      type: 'application/json'
    },
    {
      rel: 'child',
      href: `http://localhost:${PORT}/collections/test-collection`,
      type: 'application/json',
      title: 'Test Collection'
    }
  ]
};

const conformance = {
  conformsTo: [
    'https://api.stacspec.org/v1.0.0/core',
    'https://api.stacspec.org/v1.0.0/collections',
    'http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/core',
    'http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/oas30',
    'http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/geojson'
  ]
};

const collections = {
  collections: [
    {
      type: 'Collection',
      id: 'test-collection',
      stac_version: '1.0.0',
      title: 'Test Collection',
      description: 'A test collection for authentication testing',
      keywords: ['test', 'sample'],
      license: 'CC-BY-4.0',
      providers: [
        {
          name: 'Test Provider',
          roles: ['processor', 'host'],
          url: 'https://example.com'
        }
      ],
      extent: {
        spatial: {
          bbox: [[-180, -90, 180, 90]]
        },
        temporal: {
          interval: [['2023-01-01T00:00:00Z', '2023-12-31T23:59:59Z']]
        }
      },
      links: [
        {
          rel: 'root',
          href: `http://localhost:${PORT}/`,
          type: 'application/json'
        },
        {
          rel: 'parent',
          href: `http://localhost:${PORT}/`,
          type: 'application/json'
        },
        {
          rel: 'self',
          href: `http://localhost:${PORT}/collections/test-collection`,
          type: 'application/json'
        }
      ]
    },
    {
      type: 'Collection',
      id: 'sample-imagery',
      stac_version: '1.0.0',
      title: 'Sample Imagery Collection',
      description: 'Sample satellite imagery for testing',
      keywords: ['imagery', 'satellite', 'test'],
      license: 'CC-BY-4.0',
      providers: [
        {
          name: 'Sample Satellite Company',
          roles: ['producer'],
          url: 'https://example-satellite.com'
        }
      ],
      extent: {
        spatial: {
          bbox: [[-74.2, 40.6, -73.7, 40.9]]
        },
        temporal: {
          interval: [['2023-06-01T00:00:00Z', '2023-08-31T23:59:59Z']]
        }
      },
      links: [
        {
          rel: 'root',
          href: `http://localhost:${PORT}/`,
          type: 'application/json'
        },
        {
          rel: 'parent',
          href: `http://localhost:${PORT}/`,
          type: 'application/json'
        },
        {
          rel: 'self',
          href: `http://localhost:${PORT}/collections/sample-imagery`,
          type: 'application/json'
        }
      ]
    }
  ],
  links: [
    {
      rel: 'root',
      href: `http://localhost:${PORT}/`,
      type: 'application/json'
    },
    {
      rel: 'parent',
      href: `http://localhost:${PORT}/`,
      type: 'application/json'
    },
    {
      rel: 'self',
      href: `http://localhost:${PORT}/collections`,
      type: 'application/json'
    }
  ]
};

// Routes

// GET / - Root catalog
app.get('/', (req, res) => {
  res.json(rootCatalog);
});

// GET /conformance - API conformance
app.get('/conformance', (req, res) => {
  res.json(conformance);
});

// GET /collections - List collections
app.get('/collections', (req, res) => {
  res.json(collections);
});

// GET /collections/{itemID} - Get specific collection
app.get('/collections/:itemID', (req, res) => {
  const { itemID } = req.params;
  const collection = collections.collections.find(c => c.id === itemID);
  
  if (!collection) {
    return res.status(404).json({
      code: 'NotFound',
      description: `Collection '${itemID}' not found`
    });
  }
  
  res.json(collection);
});

// Start server
app.listen(PORT, () => {
  console.log(`STAC API server running on http://localhost:${PORT}`);
  console.log(`Authentication method: ${AUTH_METHOD}`);
  
  if (AUTH_METHOD === 'basic') {
    console.log(`Basic Auth - Username: ${BASIC_AUTH_USERNAME}, Password: ${BASIC_AUTH_PASSWORD}`);
  } else if (AUTH_METHOD === 'apikey') {
    console.log(`API Key: ${API_KEY}`);
  }
});