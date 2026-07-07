const LOCAL_DEV_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
];

const isLocalOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return ['localhost', '127.0.0.1', '::1'].includes(hostname);
  } catch {
    return false;
  }
};

const getAllowedOrigins = () => {
  const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const shouldAddLocalDefaults =
    process.env.NODE_ENV !== 'production' || configuredOrigins.some(isLocalOrigin);

  return [
    ...new Set([
      ...configuredOrigins,
      ...(shouldAddLocalDefaults ? LOCAL_DEV_ORIGINS : []),
    ]),
  ];
};

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (getAllowedOrigins().includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = {
  corsOptions,
  getAllowedOrigins,
};
