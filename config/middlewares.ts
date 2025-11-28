export default ({ env }) => [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      headers: '*',
      origin: [
        'https://adala.youzverse.com',
        'http://localhost:1337',
        'http://localhost:3000',
        ...env('CORS_ORIGIN', '').split(','),
      ],
    },
  },
];