// export default ({ env }) => ({
//   host: env('HOST', '0.0.0.0'),
//   port: env.int('PORT', 1337),
//   app: {
//     keys: env.array('APP_KEYS'),
//   },
// });

// export default ({ env }) => ({
//   host: env('HOST', '0.0.0.0'),
//   port: env.int('PORT', 1337),
//   url: env('PUBLIC_URL', 'https://adala.youzverse.com'),
//   proxy: true,
//   app: {
//     keys: env.array('APP_KEYS'),
//   },
//   allowedHosts: ['adala.youzverse.com'], // for v5+ admin panel
// });


export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://localhost:1337'), 
  app: {
    keys: env.array('APP_KEYS'),
  },
});