// export default [
//   'strapi::logger',
//   'strapi::errors',
//   'strapi::security',
//   'strapi::cors',
//   'strapi::poweredBy',
//   'strapi::query',
//   'strapi::body',
//   'strapi::session',
//   'strapi::favicon',
//   'strapi::public',
// ];

export default ({ env }) => [
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      // C'est ici que la magie opère :
      origin: [
        // 1. L'URL publique officielle (Production)
        'https://adala.youzverse.com',
        
        // 2. L'URL de votre Backend local (Pour l'admin)
        'http://localhost:1337',
        
        // 3. L'URL de votre futur Frontend Next.js (Pour le site)
        'http://localhost:3000',
        
        // 4. (Optionnel) Une variable d'env pour ajouter d'autres domaines sans toucher au code
        ...env('CORS_ORIGIN', '').split(','),
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];